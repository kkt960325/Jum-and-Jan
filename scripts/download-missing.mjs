#!/usr/bin/env node
/**
 * download-missing.mjs - downloads 18 empty/missing whisky bottle images via Wikipedia
 */
import { existsSync, mkdirSync, writeFileSync, statSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const IMAGES_DIR = join(__dirname, '..', 'public', 'images');
const WP = 'https://en.wikipedia.org/w/api.php';
const HDR = { 'User-Agent': 'JumAndJan-ImageHunter/1.0 (kkt960325@gmail.com)' };

const TARGETS = {
  'balvenie-12':            'Balvenie 12 Year Old DoubleWood whisky bottle',
  'laphroaig-10':           'Laphroaig 10 Year Old Scotch whisky bottle',
  'glenfiddich-12':         'Glenfiddich 12 Year Old whisky bottle',
  'ardbeg-10':              'Ardbeg Ten 10 Year Old whisky bottle',
  'ardbeg-uigeadail':       'Ardbeg Uigeadail whisky bottle',
  'ardbeg-corryvreckan':    'Ardbeg Corryvreckan whisky bottle',
  'macallan-12':            'Macallan 12 Year Old Sherry Oak whisky bottle',
  'laphroaig-quarter-cask': 'Laphroaig Quarter Cask whisky bottle',
  'talisker-10':            'Talisker 10 Year Old whisky bottle',
  'lagavulin-16':           'Lagavulin 16 Year Old whisky bottle',
  'caol-ila-12':            'Caol Ila 12 Year Old whisky bottle',
  'aberlour-12':            'Aberlour 12 Year Old Non-Chill Filtered whisky bottle',
  'glenrothes-12':          'Glenrothes 12 Year Old whisky bottle',
  'bowmore-12':             'Bowmore 12 Year Old Islay whisky bottle',
  'talisker-storm':         'Talisker Storm whisky bottle',
  'yamazaki-12':            'Yamazaki 12 Year Old Japanese whisky bottle',
  'hibiki-harmony':         'Hibiki Japanese Harmony Suntory whisky bottle',
  'jameson':                'Jameson Irish Whiskey bottle',
};

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

async function wpFetch(url) {
  try {
    const r = await fetch(url, { headers: HDR, signal: AbortSignal.timeout(12000) });
    if (!r.ok) return null;
    return await r.json();
  } catch { return null; }
}

function looksLikeBottle(url) {
  const u = url.toLowerCase();
  const bad = ['distillery_', 'distillery.', 'building', 'panoram', '_map', 'logo.', 'logotype'];
  if (bad.some(b => u.includes(b))) return false;
  const good = ['bottle', 'whisky', 'whiskey', 'scotch', 'bourbon', 'malt', 'single',
    'glenfiddich', 'laphroaig', 'ardbeg', 'talisker', 'lagavulin', 'macallan',
    'balvenie', 'yamazaki', 'hibiki', 'jameson', 'caol', 'aberlour', 'glenrothes', 'bowmore'];
  return good.some(g => u.includes(g));
}

async function findImage(id, query) {
  // 1. Search
  const sd = await wpFetch(`${WP}?action=query&list=search&srsearch=${encodeURIComponent(query)}&srlimit=5&format=json`);
  const hits = sd?.query?.search || [];

  for (const hit of hits.slice(0, 4)) {
    await sleep(350);
    const pd = await wpFetch(`${WP}?action=query&titles=${encodeURIComponent(hit.title)}&prop=pageimages&format=json&piprop=thumbnail&pithumbsize=800`);
    const page = Object.values(pd?.query?.pages || {})[0];
    const thumb = page?.thumbnail;
    if (!thumb?.source) continue;
    // Skip wide/landscape images
    if (thumb.width > 0 && thumb.height > 0 && thumb.width / thumb.height > 1.6) continue;
    if (looksLikeBottle(thumb.source) || hit.title.toLowerCase().includes(id.replace(/-/g, ' ').split(' ')[0])) {
      return thumb.source;
    }
  }

  // 2. Fallback: grab image list from first hit and find a bottle file
  if (hits.length > 0) {
    await sleep(400);
    const il = await wpFetch(`${WP}?action=query&titles=${encodeURIComponent(hits[0].title)}&prop=images&format=json&imlimit=15`);
    const page2 = Object.values(il?.query?.pages || {})[0];
    for (const img of (page2?.images || [])) {
      const name = (img.title || '').replace('File:', '').toLowerCase();
      if (!name.endsWith('.jpg') && !name.endsWith('.png')) continue;
      if (name.includes('logo') || name.includes('map') || name.includes('icon')) continue;
      if (looksLikeBottle(name) || name.includes(id.split('-')[0])) {
        await sleep(300);
        const iu = await wpFetch(`${WP}?action=query&titles=${encodeURIComponent(img.title)}&prop=imageinfo&iiprop=url&format=json&iiurlwidth=800`);
        const ipage = Object.values(iu?.query?.pages || {})[0];
        const src = ipage?.imageinfo?.[0]?.thumburl || ipage?.imageinfo?.[0]?.url;
        if (src) return src;
      }
    }
  }
  return null;
}

async function download(url, dest) {
  const r = await fetch(url, { headers: HDR, signal: AbortSignal.timeout(25000) });
  if (!r.ok) throw new Error(`HTTP ${r.status}`);
  const buf = await r.arrayBuffer();
  if (buf.byteLength < 2000) throw new Error(`Too small: ${buf.byteLength}B`);
  writeFileSync(dest, Buffer.from(buf));
  return buf.byteLength;
}

async function main() {
  if (!existsSync(IMAGES_DIR)) mkdirSync(IMAGES_DIR, { recursive: true });
  const entries = Object.entries(TARGETS);
  console.log(`\n🥃 Downloading ${entries.length} images via Wikipedia\n`);
  let ok = 0, fail = 0;

  for (const [id, query] of entries) {
    const dest = join(IMAGES_DIR, `${id}.jpg`);
    if (existsSync(dest) && statSync(dest).size > 2000) {
      console.log(`  ⏭  ${id} (${statSync(dest).size}B already exists)`);
      ok++; continue;
    }
    process.stdout.write(`  🔍 ${id}... `);
    const url = await findImage(id, query);
    if (!url) { console.log('❌ not found'); fail++; await sleep(700); continue; }
    try {
      const bytes = await download(url, dest);
      console.log(`✅ ${bytes}B`);
      ok++;
    } catch(e) {
      console.log(`❌ ${e.message}`);
      fail++;
    }
    await sleep(700);
  }
  console.log(`\nResult: ✅ ${ok} / ❌ ${fail}\n`);
}

main().catch(console.error);
