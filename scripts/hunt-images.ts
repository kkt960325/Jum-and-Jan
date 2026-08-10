#!/usr/bin/env tsx
/**
 * Hunt Wikipedia bottle images for whiskeys with image = null.
 * Features:
 *   - Sequential (concurrency 1) with 900ms gap → avoids 429
 *   - Checkpoint file: skips already-processed IDs on resume
 *   - Incremental DB upsert every 10 finds (not just at the end)
 * Run: npm run hunt:images
 * Resume (after crash): just run again — already-processed IDs are skipped
 */

// ── env loader ────────────────────────────────────────────
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

import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SERVICE_KEY  = process.env.SUPABASE_SERVICE_ROLE_KEY!;
if (!SUPABASE_URL || !SERVICE_KEY) {
  console.error('❌  env vars missing'); process.exit(1);
}
const sb = createClient(SUPABASE_URL, SERVICE_KEY, { auth: { persistSession: false } });

// ── Checkpoint ────────────────────────────────────────────
const CHECKPOINT = resolve(process.cwd(), 'scripts/.hunt-progress.json');

interface Progress {
  processed: string[];          // all IDs attempted (success + fail)
  found:     { id: string; url: string }[];  // successful ones
}

function loadProgress(): Progress {
  if (!existsSync(CHECKPOINT)) return { processed: [], found: [] };
  try { return JSON.parse(readFileSync(CHECKPOINT, 'utf8')); }
  catch { return { processed: [], found: [] }; }
}
function saveProgress(p: Progress) {
  writeFileSync(CHECKPOINT, JSON.stringify(p, null, 2));
}

// ── Helpers ───────────────────────────────────────────────
const WP  = 'https://en.wikipedia.org/w/api.php';
const HDR = {
  'User-Agent': 'JumAndJan-ImageHunter/1.0 (kkt960325@gmail.com)',
  'Accept':     'application/json',
};

function sleep(ms: number) { return new Promise(r => setTimeout(r, ms)); }

async function wpFetch(url: string): Promise<Record<string, unknown> | null> {
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      const r = await fetch(url, { headers: HDR, signal: AbortSignal.timeout(10_000) });
      if (r.status === 429 || r.status === 503) {
        console.log(`      ⏳ rate-limited (attempt ${attempt + 1}), waiting ${2000 * (attempt + 1)}ms`);
        await sleep(2000 * (attempt + 1));
        continue;
      }
      if (!r.ok) return null;
      const ct = r.headers.get('content-type') ?? '';
      if (!ct.includes('json')) return null;   // HTML error page guard
      return await r.json() as Record<string, unknown>;
    } catch { await sleep(800); }
  }
  return null;
}

function idToQuery(id: string): string {
  return id
    .replace(/-(\d+)yr$/, ' $1 year old')
    .split('-')
    .map(w => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ') + ' whisky';
}

async function wikiImage(id: string): Promise<string | null> {
  const query = idToQuery(id);

  // Step 1 — search
  const sd = await wpFetch(
    `${WP}?action=query&list=search&srsearch=${encodeURIComponent(query)}&srlimit=3&format=json`
  );
  const hits = (sd?.query as Record<string, unknown>)?.search as Array<{ title: string }> | undefined;
  if (!hits?.length) return null;

  // Step 2 — try top-3 results for a usable thumbnail
  for (const hit of hits) {
    await sleep(300);  // small gap between the two calls per whiskey
    const id2 = await wpFetch(
      `${WP}?action=query&titles=${encodeURIComponent(hit.title)}&prop=pageimages&format=json&piprop=thumbnail&pithumbsize=800`
    );
    const pages = (id2?.query as Record<string, unknown>)?.pages as Record<string, unknown> | undefined;
    if (!pages) continue;
    const page = Object.values(pages)[0] as Record<string, unknown> | undefined;
    const thumb = page?.thumbnail as { source?: string; width?: number; height?: number } | undefined;
    if (!thumb?.source) continue;

    // Skip panoramic/landscape images (maps, buildings)
    const w = thumb.width ?? 0;
    const h = thumb.height ?? 0;
    if (w > 0 && h > 0 && w / h > 2.2) continue;

    // Skip non-bottle subjects by filename
    if (!isBottleFilename(thumb.source)) continue;

    // Require brand name to appear in the thumbnail URL
    if (!brandInUrl(thumb.source, id)) continue;

    return thumb.source;
  }
  return null;
}

function brandInUrl(url: string, id: string): boolean {
  const urlLower = url.toLowerCase();
  // Extract meaningful brand segments (skip pure numbers)
  const words = id.split('-').filter(p => !/^\d+$/.test(p) && p.length > 2);
  // At least one of the first two brand words must appear in the URL
  return words.slice(0, 2).some(w => urlLower.includes(w.toLowerCase()));
}

function isBottleFilename(url: string): boolean {
  const lower = url.toLowerCase();
  const bad = [
    'distillery', 'distillerie', 'distilery',
    'building', 'warehouse', 'warehouse',
    '_map', 'map_', 'region', 'regions',
    'sign', 'signage', 'plaque',
    'statue', 'monument',
    'landscape', 'aerial', 'panorama',
    'castle', 'farm', 'factory', 'plant',
    'heritage', 'museum', 'visitor',
    'river', 'loch', 'mountain', 'glen_',
    'logo', 'crest', 'badge',
  ];
  return !bad.some(k => lower.includes(k));
}

// ── Whiskyshop.com source ─────────────────────────────────
async function whiskyshopImage(id: string): Promise<string | null> {
  // For IDs ending in a number (e.g. springbank-25), also try adding -year-old
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
      return imgUrl;
    } catch { continue; }
  }
  return null;
}

async function validateImage(url: string): Promise<boolean> {
  try {
    const r = await fetch(url, { method: 'HEAD', headers: HDR, signal: AbortSignal.timeout(6_000) });
    if (!r.ok) return false;
    const ct = r.headers.get('content-type') ?? '';
    if (!ct.startsWith('image/')) return false;
    const cl = parseInt(r.headers.get('content-length') ?? '0', 10);
    return cl === 0 || cl >= 20_000;
  } catch { return false; }
}

// ── Incremental DB flush ──────────────────────────────────
async function flushToDB(pending: { id: string; url: string }[]): Promise<number> {
  if (!pending.length) return 0;
  const results = await Promise.all(
    pending.map(r => sb.from('whiskeys').update({ image: r.url }).eq('id', r.id))
  );
  let ok = 0;
  results.forEach((r, i) => {
    if (r.error) console.error(`  ⚠️  ${pending[i].id}: ${r.error.message}`);
    else ok++;
  });
  return ok;
}

// ── Main ──────────────────────────────────────────────────
async function main() {
  // 1. Load checkpoint
  const progress = loadProgress();
  const doneIds  = new Set(progress.processed);

  // 2. Fetch remaining (image = null AND not yet processed)
  const { data: all, error } = await sb
    .from('whiskeys').select('id,name').is('image', null).order('id');
  if (error) throw new Error(error.message);

  const remaining = (all as { id: string; name: string }[]).filter(w => !doneIds.has(w.id));

  console.log(`\n체크포인트 — 이미 처리됨: ${doneIds.size}건 / 성공 저장됨: ${progress.found.length}건`);
  console.log(`🔍  남은 위스키: ${remaining.length}건 (순차 처리, 900ms 간격)\n`);

  const pending: { id: string; url: string }[] = [];
  let totalSaved = 0;
  let successCount = 0;
  let failCount    = 0;

  for (let i = 0; i < remaining.length; i++) {
    const { id } = remaining[i];
    const n = doneIds.size + i + 1;
    process.stdout.write(`[${String(n).padStart(3)}/${doneIds.size + remaining.length}] ${id.padEnd(38)}`);

    let imgUrl = await whiskyshopImage(id);
    let source = 'shop';

    if (!imgUrl) {
      await sleep(400);
      imgUrl = await wikiImage(id);
      source = 'wiki';
    }

    if (imgUrl && await validateImage(imgUrl)) {
      process.stdout.write(`✅ found [${source}]\n`);
      pending.push({ id, url: imgUrl });
      progress.found.push({ id, url: imgUrl });
      successCount++;
    } else {
      process.stdout.write(`❌ not found\n`);
      failCount++;
    }

    progress.processed.push(id);

    // Flush DB every 10 found + save checkpoint
    if (pending.length >= 10) {
      const saved = await flushToDB(pending);
      totalSaved += saved;
      pending.length = 0;
      console.log(`      💾  ${saved}건 DB 저장 완료 (누적 ${totalSaved}건)`);
    }
    saveProgress(progress);

    // Rate-limit gap between whiskeys
    await sleep(900);
  }

  // Final flush
  if (pending.length) {
    const saved = await flushToDB(pending);
    totalSaved += saved;
    console.log(`      💾  최종 ${saved}건 DB 저장 완료`);
  }

  // ── Report ────────────────────────────────────────────
  const { count: withImg } = await sb
    .from('whiskeys').select('*', { count: 'exact', head: true }).not('image', 'is', null);

  console.log('\n═══════════════ 최종 보고 ═══════════════');
  console.log(`이번 실행 성공: ${successCount}건 / 실패: ${failCount}건`);
  console.log(`누적 DB 저장:   ${totalSaved}건`);
  console.log(`DB 이미지 보유: ${withImg} / 319 건`);

  if (successCount > 0) {
    console.log('\n📸 샘플 5건:');
    progress.found.slice(-5).forEach(r =>
      console.log(`  ${r.id.padEnd(35)} ${r.url.slice(0, 70)}`)
    );
  }

  if (failCount === 0 && remaining.length > 0) {
    console.log('\n🎉 모든 이미지 수집 완료! 체크포인트 삭제 가능: scripts/.hunt-progress.json');
  }
}

main().catch(err => { console.error(err); process.exit(1); });
