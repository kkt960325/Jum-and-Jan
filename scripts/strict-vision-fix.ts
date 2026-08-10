#!/usr/bin/env tsx
/**
 * Strict bottle-only vision verification and image correction.
 *
 * Hard reject: glass-only, distillery building, person holding bottle, blurry label
 * Pass: clean background bottle/package solo shot, label text clearly readable
 */

import { readFileSync } from 'fs';
import { resolve } from 'path';
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

import { GoogleGenAI } from '@google/genai';
import { createClient } from '@supabase/supabase-js';

const GOOGLE_KEY  = process.env.GOOGLE_API_KEY!;
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SERVICE_KEY  = process.env.SUPABASE_SERVICE_ROLE_KEY!;
if (!GOOGLE_KEY || !SUPABASE_URL || !SERVICE_KEY) { console.error('❌ env vars missing'); process.exit(1); }

const ai = new GoogleGenAI({ apiKey: GOOGLE_KEY });
const sb = createClient(SUPABASE_URL, SERVICE_KEY, { auth: { persistSession: false } });

function sleep(ms: number) { return new Promise(r => setTimeout(r, ms)); }

// ── Strict vision verification ────────────────────────────────────────
interface VisionResult {
  pass: boolean;
  is_bottle: boolean;
  is_glass_only: boolean;
  is_building: boolean;
  is_person_holding: boolean;
  label_readable: boolean;
  detected_text: string;
  reason: string;
}

async function strictVerify(url: string, productName: string, year: string | null): Promise<VisionResult> {
  const FAIL: VisionResult = { pass: false, is_bottle: false, is_glass_only: false, is_building: false, is_person_holding: false, label_readable: false, detected_text: '', reason: 'fetch_failed' };

  let imgData: { data: string; mimeType: string } | null = null;
  try {
    const r = await fetch(url, {
      headers: { 'User-Agent': 'JumAndJan-Verifier/3.0', 'Accept': 'image/*' },
      signal: AbortSignal.timeout(15_000),
    });
    if (!r.ok) return { ...FAIL, reason: `http_${r.status}` };
    const ct = (r.headers.get('content-type') ?? '').split(';')[0].trim();
    const buf = await r.arrayBuffer();
    if (buf.byteLength < 5_000) return { ...FAIL, reason: 'too_small' };
    imgData = { data: Buffer.from(buf).toString('base64'), mimeType: ct };
  } catch (e) { return { ...FAIL, reason: `fetch_err: ${e}` }; }

  const yearClause = year ? `라벨에 "${year}" 숫자가 명확히 보여야 함.` : '';
  const prompt = `이 이미지를 엄격하게 분석해서 위스키 상품 사진으로 적합한지 판단해.

제품명: "${productName}"
${yearClause}

판단 기준 (Hard Reject — 하나라도 해당하면 pass:false):
- 위스키 잔(glass)만 있는 사진 (병 없음) → is_glass_only: true
- 증류소/건물/풍경 사진 → is_building: true
- 사람이 병을 들고 있는 사진 → is_person_holding: true
- 라벨이 흐릿하거나 잘 안 보임 → label_readable: false
- 완전히 다른 브랜드의 제품

Pass 조건 (모두 충족해야 함):
- 위스키 병(bottle) 또는 패키지가 주 피사체
- 배경이 비교적 깔끔 (흰색/단색 선호, 복잡한 라이프스타일 사진 비선호)
- 라벨의 브랜드명이 OCR로 읽힘

JSON만 답해 (다른 텍스트 없이):
{
  "is_bottle": <true/false — 병이 주 피사체인가>,
  "is_glass_only": <true/false>,
  "is_building": <true/false>,
  "is_person_holding": <true/false>,
  "label_readable": <true/false>,
  "detected_text": "<라벨에서 읽힌 핵심 텍스트 40자 이내>",
  "reason": "<한 문장으로 통과/거부 이유>"
}`;

  try {
    await sleep(3_000);
    const result = await ai.models.generateContent({
      model: 'gemini-2.5-flash-lite',
      contents: [{ parts: [
        { inlineData: { data: imgData.data, mimeType: imgData.mimeType } },
        { text: prompt },
      ]}],
    });
    const raw = result.text ?? '';
    const json = raw.match(/\{[\s\S]*?\}/)?.[0];
    if (!json) return { ...FAIL, reason: 'no_json' };
    const p = JSON.parse(json) as Partial<VisionResult>;

    const pass = (p.is_bottle === true)
      && (p.is_glass_only !== true)
      && (p.is_building !== true)
      && (p.is_person_holding !== true)
      && (p.label_readable !== false);

    return {
      pass,
      is_bottle: p.is_bottle ?? false,
      is_glass_only: p.is_glass_only ?? false,
      is_building: p.is_building ?? false,
      is_person_holding: p.is_person_holding ?? false,
      label_readable: p.label_readable ?? false,
      detected_text: p.detected_text ?? '',
      reason: p.reason ?? '',
    };
  } catch (e) { return { ...FAIL, reason: `gemini_err: ${e}` }; }
}

// ── Items to verify + fix ─────────────────────────────────────────────
interface Target {
  id: string;
  name: string;
  year: string | null;
  currentUrl: string | null;
  candidates: string[];  // ordered: best first
}

const TARGETS: Target[] = [
  {
    id: 'glen-scotia-double-cask',
    name: 'Glen Scotia Double Cask',
    year: null,
    currentUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/00/Bowmore_whisky_12_years.JPG/960px-Bowmore_whisky_12_years.JPG',
    candidates: [
      'https://img.thewhiskyexchange.com/l/gstob.non1.jpg',   // Double Cask Sherry Finish
      'https://img.thewhiskyexchange.com/l/gstob.non9.jpg',   // Double Cask small bottle
    ],
  },
  {
    id: 'glen-scotia-15',
    name: 'Glen Scotia 15 Year Old',
    year: '15',
    currentUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/42/Glen_Scotia_Distillery%2C_Campbeltown.jpg/960px-Glen_Scotia_Distillery%2C_Campbeltown.jpg',
    candidates: [
      'https://img.thewhiskyexchange.com/l/gstob.15yov1.jpg',
    ],
  },
  {
    id: 'johnnie-walker-gold',
    name: 'Johnnie Walker Gold Label 18 Year Old',
    year: '18',
    currentUrl: 'https://upload.wikimedia.org/wikipedia/commons/c/c5/Johnnie_Walker_Gold_Label_18-Year.jpg',
    candidates: [
      'https://img.thewhiskyexchange.com/l/blend_joh25.jpg',  // TWE Gold Label 18 (litre)
    ],
  },
  {
    id: 'springbank-25',
    name: 'Springbank 25 Year Old',
    year: '25',
    currentUrl: 'https://img.thewhiskyexchange.com/l/sprob.25yov20.jpg',
    candidates: [],  // verify only — already set from TWE
  },
];

// ── Main ──────────────────────────────────────────────────────────────
async function main() {
  console.log('\n🔍  Strict Bottle Vision Verification\n');

  for (const t of TARGETS) {
    console.log(`\n━━ ${t.id} ━━`);
    console.log(`   현재 URL: ${t.currentUrl?.slice(0, 80) ?? 'NULL'}`);

    // Step 1: verify current image
    let currentOk = false;
    if (t.currentUrl) {
      process.stdout.write('   [현재] 검증 중... ');
      const v = await strictVerify(t.currentUrl, t.name, t.year);
      if (v.pass) {
        console.log(`✅ PASS — "${v.detected_text}"`);
        currentOk = true;
      } else {
        const flags: string[] = [];
        if (v.is_glass_only)    flags.push('잔사진');
        if (v.is_building)      flags.push('건물사진');
        if (v.is_person_holding) flags.push('사람들고있음');
        if (!v.label_readable)  flags.push('라벨불명');
        if (!v.is_bottle)       flags.push('병아님');
        console.log(`❌ FAIL [${flags.join(', ')}] — ${v.reason}`);
      }
    } else {
      console.log('   [현재] NULL — 교정 필요');
    }

    if (currentOk && t.candidates.length === 0) {
      console.log('   → 교정 불필요, 건너뜀');
      continue;
    }

    // For JW Gold: even if current passes, try TWE candidate for a cleaner shot
    const shouldTryCandidate = !currentOk || t.id === 'johnnie-walker-gold';

    if (shouldTryCandidate && t.candidates.length > 0) {
      let newUrl: string | null = null;
      for (const c of t.candidates) {
        process.stdout.write(`   [후보] ${c.split('/').pop()} 검증 중... `);
        const v = await strictVerify(c, t.name, t.year);
        if (v.pass) {
          console.log(`✅ PASS — "${v.detected_text}"`);
          newUrl = c;
          break;
        } else {
          const flags: string[] = [];
          if (v.is_glass_only)    flags.push('잔사진');
          if (v.is_building)      flags.push('건물사진');
          if (!v.label_readable)  flags.push('라벨불명');
          if (!v.is_bottle)       flags.push('병아님');
          console.log(`❌ FAIL [${flags.join(', ')}]`);
        }
        await sleep(1_000);
      }

      if (newUrl) {
        const { error } = await sb.from('whiskeys').update({ image: newUrl }).eq('id', t.id);
        if (error) {
          console.log(`   ⚠️  DB 오류: ${error.message}`);
        } else {
          console.log(`   ✅ DB 업데이트: ${newUrl}`);
        }
      } else if (!currentOk) {
        // All candidates failed — null out to avoid wrong image
        const { error } = await sb.from('whiskeys').update({ image: null }).eq('id', t.id);
        if (!error) console.log('   ⬜ 적합한 후보 없음 → NULL');
      }
    }

    await sleep(500);
  }

  // ── Final state report ────────────────────────────────────────────
  console.log('\n\n══════════════════════ 최종 DB 상태 ══════════════════════');
  const ids = TARGETS.map(t => t.id);
  const { data } = await sb.from('whiskeys').select('id,image').in('id', ids);
  for (const r of data ?? []) {
    const prev = TARGETS.find(t => t.id === r.id)?.currentUrl;
    const changed = prev !== r.image;
    const status = changed ? '🔄' : '⏸️';
    console.log(`${status} ${r.id.padEnd(30)}`);
    if (changed) {
      console.log(`   이전: ${(prev ?? 'NULL').slice(0, 80)}`);
      console.log(`   이후: ${(r.image ?? 'NULL').slice(0, 80)}`);
    } else {
      console.log(`   URL: ${(r.image ?? 'NULL').slice(0, 80)}`);
    }
  }
  console.log('\n══════════════════════════════════════════════════════════\n');
}

main().catch(e => { console.error(e); process.exit(1); });
