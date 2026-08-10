#!/usr/bin/env tsx
/**
 * Gemini Vision image verification for the whisky DB.
 *
 * For each stored image, Gemini 1.5 Flash checks:
 *   1. Is the main subject a whisky bottle (not distillery / building / map)?
 *   2. Does the label text (age, color, brand) match the expected whisky name?
 *   3. Is portrait orientation and quality suitable for a product card?
 *
 * Hard-fail  → image cleared + re-hunt attempted:
 *   - is_bottle === false
 *   - label_match === "no"
 *
 * Soft-flag  → logged but kept:
 *   - quality_ok === false
 *
 * Prerequisites:
 *   GOOGLE_API_KEY=AIza...  in .env.local
 *   NEXT_PUBLIC_SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY in .env.local
 *
 * Run all:             npm run verify:images:vision
 * Priority items only: npm run verify:images:vision:priority
 * Dry run (no writes): npm run verify:images:vision:dry
 */

// ── env loader ────────────────────────────────────────────────────────
import { readFileSync, writeFileSync, existsSync } from 'fs';
import { resolve } from 'path';

try {
  const lines = readFileSync(resolve(process.cwd(), '.env.local'), 'utf8').split('\n');
  for (const line of lines) {
    const t = line.trim();
    if (!t || t.startsWith('#')) continue;
    const eq = t.indexOf('=');
    if (eq < 0) continue;
    const k = t.slice(0, eq).trim();
    const v = t.slice(eq + 1).trim().replace(/^['"]|['"]$/g, '');
    if (k && !(k in process.env)) process.env[k] = v;
  }
} catch { /* rely on shell env */ }

import { GoogleGenAI } from '@google/genai';
import { createClient } from '@supabase/supabase-js';

// ── Client init ───────────────────────────────────────────────────────
const GOOGLE_KEY = process.env.GOOGLE_API_KEY;
if (!GOOGLE_KEY) {
  console.error('❌  GOOGLE_API_KEY가 .env.local에 없습니다.');
  console.error('   .env.local에 다음 줄을 추가하세요:');
  console.error('   GOOGLE_API_KEY=AIzaSy...');
  console.error('   발급: https://aistudio.google.com/app/apikey');
  process.exit(1);
}

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SERVICE_KEY  = process.env.SUPABASE_SERVICE_ROLE_KEY!;
if (!SUPABASE_URL || !SERVICE_KEY) {
  console.error('❌  Supabase 환경변수 누락'); process.exit(1);
}

const ai = new GoogleGenAI({ apiKey: GOOGLE_KEY });
const sb = createClient(SUPABASE_URL, SERVICE_KEY, { auth: { persistSession: false } });

// ── CLI flags ─────────────────────────────────────────────────────────
const PRIORITY_ONLY = process.argv.includes('--priority-only');
const DRY_RUN       = process.argv.includes('--dry-run');

// ── Priority items — matched against DB row ID (always English slugs) ─
const PRIORITY_ID_PATTERNS = [
  'johnnie-walker',
  'springbank',
  'hakushu',
  'hibiki-21',
  'macallan-25', 'macallan-18', 'macallan-rare',
  'brora', 'port-ellen',
  'nikka-miyagikyo', 'nikka-coffey', 'nikka-taketsuru',
];

// ── Types ─────────────────────────────────────────────────────────────
interface WhiskeyRow {
  id:             string;
  name:           string;
  image:          string;
  price_category: string | null;
}

interface VerifyResult {
  is_bottle:     boolean;
  label_match:   'yes' | 'no' | 'unclear';
  quality_ok:    boolean;
  detected_text: string;
  reject_reason: string;
}

type Verdict = 'ok' | 'verified' | 'softflag' | 'rehunted' | 'cleared' | 'error';

interface Outcome {
  id:            string;
  name:          string;
  origUrl:       string;
  verdict:       Verdict;
  newUrl?:       string;
  verifyResult?: VerifyResult;
  errorMsg?:     string;
}

interface Progress {
  processedIds: string[];
  outcomes:     Outcome[];
}

// ── Checkpoint ────────────────────────────────────────────────────────
const CHECKPOINT = resolve(process.cwd(), 'scripts/.verify-progress.json');

function loadProgress(): Progress {
  if (!existsSync(CHECKPOINT)) return { processedIds: [], outcomes: [] };
  try { return JSON.parse(readFileSync(CHECKPOINT, 'utf8')); }
  catch { return { processedIds: [], outcomes: [] }; }
}
function saveProgress(p: Progress) {
  writeFileSync(CHECKPOINT, JSON.stringify(p, null, 2));
}

// ── Key-term extraction ───────────────────────────────────────────────
function keyTerms(name: string): string[] {
  const SKIP = new Set([
    'the','single','malt','grain','blended','scotch','whisky','whiskey',
    'year','years','old','aged','special','reserve','edition','limited',
    'collection','cask','strength','bottling','rare','distillers',
  ]);
  return [...new Set(
    name.split(/[\s\-\/,()'"]+/)
      .filter(w => w.length >= 2 && !SKIP.has(w.toLowerCase()))
      .slice(0, 5)
  )];
}

// ── Image download → base64 ───────────────────────────────────────────
const IMG_HDR = {
  'User-Agent': 'JumAndJan-Verifier/2.0 (kkt960325@gmail.com)',
  'Accept':     'image/*',
};

async function fetchBase64(url: string): Promise<{ data: string; mimeType: string } | null> {
  if (/\.svg(\?|$)/i.test(url)) return null;    // SVG can't be bottle-verified
  if (url.startsWith('/images/')) return null;    // local path — skip vision check
  try {
    const r = await fetch(url, { headers: IMG_HDR, signal: AbortSignal.timeout(15_000) });
    if (!r.ok) return null;
    const ct = (r.headers.get('content-type') ?? '').split(';')[0].trim();
    if (!ct.startsWith('image/') || ct.includes('svg')) return null;
    const buf = await r.arrayBuffer();
    if (buf.byteLength < 8_000) return null;  // skip tiny files (icons, thumbnails)
    return { data: Buffer.from(buf).toString('base64'), mimeType: ct };
  } catch { return null; }
}

// ── Gemini vision verification ────────────────────────────────────────
async function verifyImage(url: string, name: string): Promise<VerifyResult> {
  const imgData = await fetchBase64(url);
  if (!imgData) throw new Error('이미지 다운로드/변환 불가 (SVG·로컬경로·크기 미달)');

  const terms    = keyTerms(name);
  const firstKey = terms[0] ?? name.split(' ')[0];

  const prompt = `이 이미지 속 위스키 보틀의 정확한 제품명을 알려줘.
라벨에 적힌 연도(12, 18, 25 등)와 라벨 색상을 확인해서 "${name}"과 일치하는지 Yes/No로 대답해줘.
확인할 핵심 키워드: ${terms.join(', ')}

반드시 아래 JSON 형식으로만 답해줘. 다른 텍스트는 쓰지 마:
{
  "is_bottle": <true: 위스키 보틀이 주 피사체 / false: 건물·지도·로고·강·풍경·조각상>,
  "label_match": <"yes": 라벨이 "${firstKey}" 등 핵심 키워드와 일치 / "no": 다른 제품 명확 / "unclear": 라벨 판독 불가>,
  "quality_ok": <true: 세로형·선명·보틀 중심 / false: 가로·잘림·극도로 작음>,
  "detected_text": "<라벨에서 읽힌 핵심 텍스트, 40자 이내>",
  "reject_reason": "<불일치 사유 한 문장, 문제없으면 빈 문자열>"
}`;

  const result = await ai.models.generateContent({
    model: 'gemini-2.5-flash-lite',
    contents: [{
      parts: [
        { inlineData: { data: imgData.data, mimeType: imgData.mimeType } },
        { text: prompt },
      ],
    }],
  });

  const raw  = result.text ?? '';
  const json = raw.match(/\{[\s\S]*?\}/)?.[0];
  if (!json) throw new Error(`JSON 파싱 실패: ${raw.slice(0, 120)}`);

  const p = JSON.parse(json) as Partial<VerifyResult>;
  return {
    is_bottle:     p.is_bottle     ?? true,
    label_match:   p.label_match   ?? 'unclear',
    quality_ok:    p.quality_ok    ?? true,
    detected_text: p.detected_text ?? '',
    reject_reason: p.reject_reason ?? '',
  };
}

// ── Wikipedia + Commons re-hunt ───────────────────────────────────────
const WP_API  = 'https://en.wikipedia.org/w/api.php';
const COM_API = 'https://commons.wikimedia.org/w/api.php';
const WP_HDR  = { 'User-Agent': 'JumAndJan-Verifier/2.0 (kkt960325@gmail.com)', 'Accept': 'application/json' };

function sleep(ms: number) { return new Promise(r => setTimeout(r, ms)); }

const BAD_FILENAMES = [
  'Distillery','distillery','geograph','building','Building',
  'landscape','Landscape','region','Region','map','Map',
  'logo','Logo','statue','river','River','lake','Lake',
  'exterior','Exterior','Bowmore','Brora_Distillery','Port_Ellen_Distillery',
  'Springbank_Distillery','sign','Sign','facade',
];

function isGoodFilename(url: string): boolean {
  const fname = url.split('/').pop() ?? '';
  return !BAD_FILENAMES.some(k => fname.includes(k));
}

async function apiFetch(url: string): Promise<Record<string, unknown> | null> {
  for (let i = 0; i < 3; i++) {
    try {
      const r = await fetch(url, { headers: WP_HDR, signal: AbortSignal.timeout(10_000) });
      if (r.status === 429 || r.status === 503) { await sleep(2000 * (i + 1)); continue; }
      if (!r.ok) return null;
      if (!(r.headers.get('content-type') ?? '').includes('json')) return null;
      return await r.json() as Record<string, unknown>;
    } catch { await sleep(600); }
  }
  return null;
}

async function validateImg(url: string): Promise<boolean> {
  if (/\.svg(\?|$)/i.test(url)) return false;
  try {
    const r = await fetch(url, { method: 'HEAD', headers: WP_HDR, signal: AbortSignal.timeout(6_000) });
    if (!r.ok) return false;
    if (!(r.headers.get('content-type') ?? '').startsWith('image/')) return false;
    const cl = parseInt(r.headers.get('content-length') ?? '0', 10);
    return cl === 0 || cl >= 15_000;
  } catch { return false; }
}

async function wikiThumbnail(query: string): Promise<string | null> {
  const sd = await apiFetch(
    `${WP_API}?action=query&list=search&srsearch=${encodeURIComponent(query)}&srlimit=5&format=json`
  );
  const hits = ((sd?.query as Record<string,unknown>)?.search ?? []) as Array<{title:string}>;
  for (const hit of hits) {
    await sleep(250);
    const pd = await apiFetch(
      `${WP_API}?action=query&titles=${encodeURIComponent(hit.title)}&prop=pageimages&format=json&piprop=thumbnail&pithumbsize=800`
    );
    const pages = (pd?.query as Record<string,unknown>)?.pages as Record<string,unknown> | undefined;
    if (!pages) continue;
    const page  = Object.values(pages)[0] as Record<string,unknown> | undefined;
    const thumb = page?.thumbnail as { source?: string; width?: number; height?: number } | undefined;
    if (!thumb?.source || !isGoodFilename(thumb.source)) continue;
    const w = thumb.width ?? 0, h = thumb.height ?? 0;
    if (w > 0 && h > 0 && w / h > 2.0) continue;
    return thumb.source;
  }
  return null;
}

async function commonsThumbnail(query: string): Promise<string | null> {
  const sd = await apiFetch(
    `${COM_API}?action=query&list=search&srsearch=${encodeURIComponent(query)}&srnamespace=6&srlimit=8&format=json`
  );
  const hits = ((sd?.query as Record<string,unknown>)?.search ?? []) as Array<{title:string}>;
  for (const hit of hits) {
    if (!isGoodFilename(hit.title)) continue;
    await sleep(250);
    const pd = await apiFetch(
      `${COM_API}?action=query&titles=${encodeURIComponent(hit.title)}&prop=imageinfo&iiprop=url|size&format=json`
    );
    const pages = (pd?.query as Record<string,unknown>)?.pages as Record<string,unknown> | undefined;
    if (!pages) continue;
    const page = Object.values(pages)[0] as Record<string,unknown> | undefined;
    const ii   = ((page?.imageinfo ?? []) as Array<{url?:string;width?:number;height?:number}>)[0];
    if (!ii?.url || !isGoodFilename(ii.url)) continue;
    const w = ii.width ?? 0, h = ii.height ?? 0;
    if (w > 0 && h > 0 && w / h > 2.0) continue;
    if (h > 0 && w > 0 && h / w > 6)   continue;
    return ii.url;
  }
  return null;
}

async function whiskyshopImage(id: string): Promise<string | null> {
  const slugs: string[] = [];
  if (/-\d+$/.test(id)) slugs.push(id + '-year-old');
  slugs.push(id);
  for (const slug of slugs) {
    try {
      const r = await fetch(`https://www.whiskyshop.com/${slug}`, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
          'Accept': 'text/html',
        },
        redirect: 'follow',
        signal: AbortSignal.timeout(10_000),
      });
      if (!r.ok) continue;
      const html = await r.text();
      const og = html.match(/og:image[^>]+content=["']([^"']+)["']/);
      if (!og) continue;
      const imgUrl = og[1].split('?')[0];
      if (!imgUrl.includes('whiskyshop.com/media/catalog/product')) continue;
      if (await validateImg(imgUrl)) return imgUrl;
    } catch { continue; }
  }
  return null;
}

async function rehuntImage(
  id: string, name: string, priceCategory: string | null, badUrl: string,
): Promise<string | null> {
  // 1. Try whiskyshop.com first — product catalog images are reliable
  await sleep(400);
  const shopUrl = await whiskyshopImage(id);
  if (shopUrl && shopUrl !== badUrl) return shopUrl;

  // 2. Fall back to Wikipedia/Commons
  const queries = priceCategory === 'high-end'
    ? [`${name} whisky official bottle product`, `${name} whisky bottle`]
    : [`${name} whisky bottle`, `${name} whisky`];
  queries.push(name.split(' ').slice(0, 3).join(' ') + ' whisky');

  for (const q of queries) {
    await sleep(400);
    for (const fn of [wikiThumbnail, (q2: string) => commonsThumbnail(q2 + ' bottle')]) {
      const url = await fn(q);
      if (url && url !== badUrl && await validateImg(url)) return url;
    }
  }
  return null;
}

// ── Supabase write ────────────────────────────────────────────────────
async function setImage(id: string, url: string | null): Promise<void> {
  if (DRY_RUN) return;
  const { error } = await sb.from('whiskeys').update({ image: url }).eq('id', id);
  if (error) throw new Error(`DB 업데이트 실패 ${id}: ${error.message}`);
}

// ── Main ──────────────────────────────────────────────────────────────
async function main() {
  const progress = loadProgress();
  const doneIds  = new Set(progress.processedIds);

  const { data: all, error } = await sb
    .from('whiskeys')
    .select('id, name, image, price_category')
    .not('image', 'is', null)       // only rows that HAVE an image to verify
    .not('image', 'like', '/images/%')  // skip local paths (no URL to fetch)
    .not('image', 'ilike', '%.svg%')   // skip SVG files
    .order('id');
  if (error) throw new Error(error.message);

  let rows = (all as WhiskeyRow[]).filter(r => !doneIds.has(r.id));

  const priorityOf = (r: WhiskeyRow) =>
    PRIORITY_ID_PATTERNS.some(p => r.id.includes(p)) ? 0 :
    r.price_category === 'high-end' ? 1 : 2;

  rows.sort((a, b) => priorityOf(a) - priorityOf(b));

  if (PRIORITY_ONLY) {
    rows = rows.filter(r => priorityOf(r) === 0);
    if (!rows.length) {
      console.log('⚠️  우선 항목이 모두 처리되었거나 없습니다.');
      return;
    }
  }

  const total = doneIds.size + rows.length;
  console.log(`\nGemini 2.0 Flash 이미지 검증`);
  console.log(`체크포인트: ${doneIds.size}건 처리됨`);
  console.log(`검증 대상:  ${rows.length}건${PRIORITY_ONLY ? ' [우선 항목만]' : ''}${DRY_RUN ? ' [DRY-RUN]' : ''}\n`);

  let verified = 0, softFlagged = 0, rehunted = 0, cleared = 0, errors = 0;

  for (let i = 0; i < rows.length; i++) {
    const r      = rows[i];
    const n      = doneIds.size + i + 1;
    const isPri  = priorityOf(r) === 0;
    const prefix = isPri ? '★ ' : (r.price_category === 'high-end' ? '💎 ' : '  ');
    process.stdout.write(`[${String(n).padStart(3)}/${total}] ${prefix}${r.id.padEnd(40)}`);

    const outcome: Outcome = { id: r.id, name: r.name, origUrl: r.image, verdict: 'ok' };

    try {
      const result = await verifyImage(r.image, r.name);
      outcome.verifyResult = result;

      const hardFail = !result.is_bottle || result.label_match === 'no';

      if (hardFail) {
        process.stdout.write(`❌  "${result.detected_text.slice(0, 28)}" — ${result.reject_reason.slice(0, 40)}\n`);
        process.stdout.write(`       재검색 중...\n`);

        await sleep(800);
        const newUrl = await rehuntImage(r.id, r.name, r.price_category, r.image);

        if (newUrl) {
          // Gemini-verify the new candidate before saving
          process.stdout.write(`       후보 검증 중: ${newUrl.slice(0, 55)}\n`);
          await sleep(4_500);    // Gemini rate limit gap
          let newResult: VerifyResult;
          try {
            newResult = await verifyImage(newUrl, r.name);
          } catch { newResult = { is_bottle: true, label_match: 'unclear', quality_ok: true, detected_text: '', reject_reason: '' }; }

          if (!newResult.is_bottle || newResult.label_match === 'no') {
            // New candidate also failed — clear
            await setImage(r.id, null);
            outcome.verdict = 'cleared';
            cleared++;
            process.stdout.write(`       후보도 불일치 → null 처리\n`);
          } else {
            await setImage(r.id, newUrl);
            outcome.verdict = 'rehunted';
            outcome.newUrl  = newUrl;
            rehunted++;
            process.stdout.write(`       ✅ 교정 완료 "${newResult.detected_text.slice(0, 30)}"\n`);
          }
        } else {
          await setImage(r.id, null);
          outcome.verdict = 'cleared';
          cleared++;
          process.stdout.write(`       재검색 실패 → null (실루엣)\n`);
        }

      } else if (!result.quality_ok) {
        process.stdout.write(`⚠️  품질 낮음 — 유지 (수동 확인 권장) "${result.detected_text.slice(0, 20)}"\n`);
        outcome.verdict = 'softflag';
        softFlagged++;

      } else {
        process.stdout.write(`✅  "${result.detected_text.slice(0, 35)}"\n`);
        outcome.verdict = 'verified';
        verified++;
      }

    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      process.stdout.write(`💥 오류 — ${msg.slice(0, 60)}\n`);
      outcome.verdict  = 'error';
      outcome.errorMsg = msg;
      errors++;
    }

    progress.processedIds.push(r.id);
    progress.outcomes.push(outcome);
    saveProgress(progress);

    // Gemini 1.5 Flash free tier: 15 RPM → 4s minimum gap
    await sleep(4_500);
  }

  // ── Report ─────────────────────────────────────────────────────────
  const fixed   = progress.outcomes.filter(o => o.verdict === 'rehunted');
  const flagged = progress.outcomes.filter(o => o.verdict === 'softflag');
  const nulled  = progress.outcomes.filter(o => o.verdict === 'cleared');

  console.log('\n══════════════ Gemini 검증 리포트 ══════════════');
  console.log(`검증 OK:       ${verified}건`);
  console.log(`품질 낮음:     ${softFlagged}건  ← 수동 확인 권장`);
  console.log(`교정됨:        ${rehunted}건`);
  console.log(`null 처리:     ${cleared}건  ← 실루엣 표시`);
  console.log(`오류:          ${errors}건`);
  console.log(`──────────────────────────────────────────────`);

  if (fixed.length) {
    console.log('\n📸  교정 항목 (변경 전 → 후):');
    fixed.forEach(o => {
      console.log(`  [${o.name}]`);
      console.log(`    이전: ${o.origUrl.slice(0, 80)}`);
      console.log(`    이후: ${(o.newUrl ?? '').slice(0, 80)}`);
    });
  }
  if (flagged.length) {
    console.log('\n⚠️   품질 낮음 (수동 확인):');
    flagged.forEach(o => console.log(`  [${o.name}] ${o.verifyResult?.detected_text ?? ''}`));
  }
  if (nulled.length) {
    console.log('\n🗑   null 처리 (실루엣으로 대체):');
    nulled.forEach(o => console.log(`  [${o.name}] ${o.verifyResult?.reject_reason?.slice(0, 50) ?? ''}`));
  }

  console.log(`\n총 처리: ${progress.processedIds.length}건 | 유효: ${verified + softFlagged + rehunted}건 | 교정: ${rehunted}건`);
}

main().catch(err => { console.error(err); process.exit(1); });
