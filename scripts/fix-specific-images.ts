#!/usr/bin/env tsx
/**
 * Fix Redbreast (12/15/21/27) and Dalmore (12/15/18/25/KA3) images.
 * Strategy:
 *  1. Try Wikipedia page thumbnail (lead image from the article)
 *  2. Try Wikimedia Commons file search
 *  3. Use Gemini grounded search to find bottle image URL
 *  4. Verify final URL with Gemini vision
 *  5. Save to DB (null if nothing verified)
 */

import { readFileSync } from 'fs';
import { resolve } from 'path';
import { GoogleGenAI } from '@google/genai';
import { createClient } from '@supabase/supabase-js';

try {
  for (const line of readFileSync(resolve(process.cwd(), '.env.local'), 'utf8').split('\n')) {
    const t = line.trim();
    if (!t || t.startsWith('#')) continue;
    const eq = t.indexOf('=');
    if (eq < 0) continue;
    const k = t.slice(0, eq).trim(), v = t.slice(eq + 1).trim();
    if (k && !(k in process.env)) process.env[k] = v;
  }
} catch { /* rely on shell env */ }

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SERVICE_KEY  = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const GOOGLE_KEY   = process.env.GOOGLE_API_KEY!;
if (!SUPABASE_URL || !SERVICE_KEY || !GOOGLE_KEY) { console.error('❌  env vars missing'); process.exit(1); }

const sb = createClient(SUPABASE_URL, SERVICE_KEY, { auth: { persistSession: false } });
const ai = new GoogleGenAI({ apiKey: GOOGLE_KEY });

function sleep(ms: number) { return new Promise(r => setTimeout(r, ms)); }

const TARGETS = [
  // Fix broken retailer URLs + missing items
  { id: 'redbreast-21',           name: 'Redbreast 21 Year Old Irish Whiskey',           year: '21', wikiPage: 'Redbreast_(whiskey)' },
  { id: 'redbreast-27',           name: 'Redbreast 27 Year Old Irish Whiskey',           year: '27', wikiPage: 'Redbreast_(whiskey)' },
  { id: 'dalmore-12',             name: 'The Dalmore 12 Year Old Single Malt Scotch',    year: '12', wikiPage: 'The_Dalmore_distillery' },
  { id: 'dalmore-15',             name: 'The Dalmore 15 Year Old Single Malt Scotch',    year: '15', wikiPage: 'The_Dalmore_distillery' },
  { id: 'dalmore-18',             name: 'The Dalmore 18 Year Old Single Malt Scotch',    year: '18', wikiPage: 'The_Dalmore_distillery' },
  { id: 'dalmore-25',             name: 'The Dalmore 25 Year Old Single Malt Scotch',    year: '25', wikiPage: 'The_Dalmore_distillery' },
  { id: 'dalmore-king-alexander', name: 'Dalmore King Alexander III Single Malt Scotch', year: null, wikiPage: 'The_Dalmore_distillery' },
];

const HDR = { 'User-Agent': 'JumAndJan-ImageFixer/1.0 (kkt960325@gmail.com)', 'Accept': 'application/json' };
const WP  = 'https://en.wikipedia.org/w/api.php';
const COM = 'https://commons.wikimedia.org/w/api.php';
const BAD = ['distillery','distillerie','building','warehouse','map_','_map','region','sign','statue','landscape','aerial','panorama','castle','farm','factory','heritage','museum','river','loch_','mountain','glen_','logo','crest','badge','town','village','geograph'];

async function apiFetch(url: string): Promise<Record<string, unknown> | null> {
  for (let i = 0; i < 3; i++) {
    try {
      const r = await fetch(url, { headers: HDR, signal: AbortSignal.timeout(10_000) });
      if (r.status === 429 || r.status === 503) { await sleep(2000 * (i + 1)); continue; }
      if (!r.ok) return null;
      return await r.json() as Record<string, unknown>;
    } catch { await sleep(600); }
  }
  return null;
}

function isGood(s: string): boolean {
  const l = s.toLowerCase();
  return !BAD.some(k => l.includes(k));
}

// ── 1. Wikipedia page thumbnail (returns the article's lead image) ────
async function wikiPageThumb(pageTitle: string): Promise<string | null> {
  const d = await apiFetch(
    `${WP}?action=query&titles=${encodeURIComponent(pageTitle)}&prop=pageimages&format=json&piprop=thumbnail&pithumbsize=800`
  );
  const pages = (d?.query as Record<string,unknown>)?.pages as Record<string,unknown> | undefined;
  const page = Object.values(pages ?? {})[0] as Record<string,unknown> | undefined;
  const thumb = page?.thumbnail as { source?: string; width?: number; height?: number } | undefined;
  if (!thumb?.source || !isGood(thumb.source)) return null;
  const w = thumb.width ?? 0, h = thumb.height ?? 0;
  if (w > 0 && h > 0 && w / h > 2.0) return null;
  return thumb.source;
}

// ── 2. Wikipedia page — all images ───────────────────────────────────
async function wikiPageImages(pageTitle: string): Promise<string[]> {
  const d = await apiFetch(
    `${WP}?action=query&titles=${encodeURIComponent(pageTitle)}&prop=images&format=json&imlimit=20`
  );
  const pages = (d?.query as Record<string,unknown>)?.pages as Record<string,unknown> | undefined;
  const page = Object.values(pages ?? {})[0] as Record<string,unknown> | undefined;
  return ((page?.images ?? []) as Array<{title: string}>).map(i => i.title);
}

async function fileInfo(title: string): Promise<{ url: string; w: number; h: number } | null> {
  const d = await apiFetch(
    `${COM}?action=query&titles=${encodeURIComponent(title)}&prop=imageinfo&iiprop=url|size&format=json`
  );
  const pages = (d?.query as Record<string,unknown>)?.pages as Record<string,unknown> | undefined;
  const page = Object.values(pages ?? {})[0] as Record<string,unknown> | undefined;
  const ii = ((page?.imageinfo ?? []) as Array<{url?:string;width?:number;height?:number}>)[0];
  return ii?.url ? { url: ii.url, w: ii.width ?? 0, h: ii.height ?? 0 } : null;
}

// ── 3. Gemini grounded search — search + self-assess ─────────────────
async function geminiSearchUrl(productName: string): Promise<{ url: string; confirmed: boolean } | null> {
  try {
    const result = await ai.models.generateContent({
      model: 'gemini-2.5-flash-lite',
      contents: [{ parts: [{ text:
        `Find a direct image URL for a "${productName}" whisky bottle. Search masterofmalt.com or thewhiskyexchange.com for this product and find the product image CDN URL (cdn11.bigcommerce.com or img.thewhiskyexchange.com).

Reply with JSON only: {"url": "<CDN image URL or null>", "is_bottle": true, "source": "<site>", "confidence": "high"}` }] }],
      config: { tools: [{ googleSearch: {} }] } as Record<string, unknown>,
    });
    const raw = result.text ?? '';
    const json = raw.match(/\{[\s\S]*?\}/)?.[0];
    if (!json) return null;
    const p = JSON.parse(json) as { url?: string; is_bottle?: boolean; confidence?: string; note?: string };
    const url = (p.url ?? '').trim();
    if (!url || !url.startsWith('http')) return null;
    if (!/\.(jpg|jpeg|png|webp)(\?|$)/i.test(url)) return null;
    return { url, confirmed: p.is_bottle === true && p.confidence !== 'low' };
  } catch { return null; }
}

// ── 4. Gemini vision verify ───────────────────────────────────────────
async function verifyImage(url: string, productName: string, year: string | null): Promise<boolean> {
  if (/\.svg(\?|$)/i.test(url) || url.startsWith('/images/')) return false;
  let imgData: { data: string; mimeType: string } | null = null;
  try {
    const r = await fetch(url, {
      headers: { 'User-Agent': 'JumAndJan-Verifier/2.0', 'Accept': 'image/*' },
      signal: AbortSignal.timeout(15_000),
    });
    if (!r.ok) return false;
    const ct = (r.headers.get('content-type') ?? '').split(';')[0].trim();
    const buf = await r.arrayBuffer();
    if (buf.byteLength < 8_000) return false;
    imgData = { data: Buffer.from(buf).toString('base64'), mimeType: ct };
  } catch { return false; }

  const yearClause = year
    ? `연도 "${year}"(숫자)가 라벨에 보여야 해.`
    : '';

  const prompt = `이 이미지가 "${productName}" 위스키 병인지 확인해줘.
병(bottle)이 주요 피사체인가?
라벨에 브랜드명이 있는가?
${yearClause}
JSON만 답해:
{
  "is_bottle": <true/false>,
  "brand_match": <"yes"/"no"/"unclear">,
  "year_ok": <true: 라벨에 연도 ${year??'N/A'} 보임 / false: 다른 연도 또는 불명 / "na": 연도 확인 불필요>,
  "detected_text": "<라벨에서 읽힌 핵심 텍스트 30자 이내>"
}`;

  try {
    await sleep(4_500);
    const result = await ai.models.generateContent({
      model: 'gemini-2.5-flash-lite',
      contents: [{ parts: [
        { inlineData: { data: imgData.data, mimeType: imgData.mimeType } },
        { text: prompt },
      ]}],
    });
    const raw = result.text ?? '';
    const json = raw.match(/\{[\s\S]*?\}/)?.[0];
    if (!json) return false;
    const p = JSON.parse(json) as { is_bottle?: boolean; brand_match?: string; year_ok?: boolean | string };
    if (!p.is_bottle) return false;
    if (p.brand_match === 'no') return false;
    if (year && p.year_ok === false) return false;
    return true;
  } catch { return false; }
}

async function setImage(id: string, url: string | null): Promise<void> {
  const { error } = await sb.from('whiskeys').update({ image: url }).eq('id', id);
  if (error) throw new Error(`DB 오류 ${id}: ${error.message}`);
}

// ── Main ──────────────────────────────────────────────────────────────
async function main() {
  console.log('\n🔧  Redbreast & Dalmore 이미지 교정 시작\n');
  let fixed = 0, nulled = 0;

  for (const t of TARGETS) {
    process.stdout.write(`${t.id.padEnd(28)}`);

    const brand = t.id.split('-')[0]; // 'redbreast' or 'dalmore'
    let found: string | null = null;

    // ── A. Wikipedia page — get all image titles, look for brand match ──
    const imgTitles = await wikiPageImages(t.wikiPage);
    for (const title of imgTitles) {
      if (!isGood(title)) continue;
      const tl = title.toLowerCase();
      if (!tl.includes(brand)) continue;
      // If year-specific, skip files that contain a DIFFERENT year
      if (t.year) {
        const otherYears = ['12','15','18','21','25','27'].filter(y => y !== t.year);
        if (otherYears.some(y => tl.includes(y))) continue;
      }
      await sleep(200);
      const info = await fileInfo(title);
      if (!info || !isGood(info.url)) continue;
      if (info.w > 0 && info.h > 0 && info.w / info.h > 2.0) continue;
      process.stdout.write(`🔍W `);
      if (await verifyImage(info.url, t.name, t.year)) {
        found = info.url;
        break;
      }
      process.stdout.write(`✗ `);
      await sleep(1_000);
    }

    // ── B. Commons search ─────────────────────────────────────────────
    if (!found) {
      const queries = t.year
        ? [`${brand} ${t.year} whisky bottle`, `${brand} whisky ${t.year} year`]
        : [`${t.name} whisky bottle`];

      for (const q of queries) {
        await sleep(300);
        const d = await apiFetch(
          `${COM}?action=query&list=search&srsearch=${encodeURIComponent(q)}&srnamespace=6&srlimit=8&format=json`
        );
        const hits = ((d?.query as Record<string,unknown>)?.search ?? []) as Array<{title:string}>;
        for (const hit of hits) {
          if (!isGood(hit.title) || !hit.title.toLowerCase().includes(brand)) continue;
          await sleep(200);
          const info = await fileInfo(hit.title);
          if (!info || !isGood(info.url)) continue;
          if (info.w > 0 && info.h > 0 && info.w / info.h > 2.0) continue;
          process.stdout.write(`🔍C `);
          if (await verifyImage(info.url, t.name, t.year)) {
            found = info.url;
            break;
          }
          process.stdout.write(`✗ `);
          await sleep(1_000);
        }
        if (found) break;
      }
    }

    // ── C. Gemini grounded web search — verify URLs server-side ─────
    if (!found) {
      process.stdout.write(`🔍G `);
      await sleep(2_000);
      const gs = await geminiSearchUrl(t.name);
      if (gs?.url) {
        const url = gs.url;
        // Trusted CDNs — accept without further check
        const trustedCdn = ['wikimedia.org', 'wikipedia.org', 'cdn11.bigcommerce.com', 'img.thewhiskyexchange.com'];
        if (trustedCdn.some(h => url.includes(h))) {
          found = url;
        } else {
          // For non-Wikimedia, verify the URL actually returns an image
          try {
            const hr = await fetch(url, {
              method: 'HEAD',
              headers: {
                'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
                'Accept': 'image/*',
              },
              signal: AbortSignal.timeout(8_000),
              redirect: 'follow',
            });
            const ct = hr.headers.get('content-type') ?? '';
            if (hr.ok && ct.startsWith('image/')) {
              found = url;
            } else {
              process.stdout.write(`✗(${hr.status}) `);
            }
          } catch {
            process.stdout.write(`✗(net) `);
          }
        }
      }
    }

    if (found) {
      await setImage(t.id, found);
      const fname = found.split('/').pop()?.split('?')[0] ?? '';
      const src = found.includes('wikimedia') ? 'wiki' : new URL(found).hostname.replace('www.','');
      console.log(`✅  ${fname.slice(0, 45)} [${src}]`);
      fixed++;
    } else {
      await setImage(t.id, null);
      console.log(`⬜ null`);
      nulled++;
    }

    await sleep(800);
  }

  console.log(`\n══ 완료: ${fixed}건 교정 / ${nulled}건 null ══\n`);
}

main().catch(err => { console.error(err); process.exit(1); });
