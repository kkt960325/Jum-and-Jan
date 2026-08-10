#!/usr/bin/env node
/**
 * download-images.mjs
 * Wikipedia API로 올바른 위스키 병 이미지를 자동 다운로드합니다.
 * 실행: node scripts/download-images.mjs
 */
import { existsSync, mkdirSync, writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const IMAGES_DIR = join(__dirname, '..', 'public', 'images');
const WP = 'https://en.wikipedia.org/w/api.php';
const HDR = { 'User-Agent': 'JumAndJan-ImageHunter/1.0 (kkt960325@gmail.com)' };

// 잘못된 이미지를 쓰고 있는 위스키 목록 (id → 검색 쿼리)
const MISMATCHED = {
  // Highland Park
  'highland-park-18':           'Highland Park 18 Year Old whisky bottle',
  'highland-park-25':           'Highland Park 25 Year Old whisky bottle',
  'highland-park-viking-honour':'Highland Park Viking Honour whisky bottle',
  'highland-park-dragon-legend':'Highland Park Dragon Legend whisky bottle',
  // Talisker
  'talisker-25':                'Talisker 25 Year Old whisky bottle',
  // Glendronach
  'glendronach-15':             'GlenDronach 15 Year Old whisky bottle',
  'glendronach-18':             'GlenDronach 18 Year Old Allardice whisky bottle',
  'glendronach-21':             'GlenDronach 21 Year Old Parliament whisky bottle',
  // Glenrothes
  'glenrothes-18':              'Glenrothes 18 Year Old whisky bottle',
  // Macallan
  'macallan-18-sherry':         'Macallan 18 Year Old Sherry Oak whisky bottle',
  'macallan-25':                'Macallan 25 Year Old whisky bottle',
  'macallan-15-fine-oak':       'Macallan 15 Year Old Fine Oak whisky bottle',
  'macallan-double-cask':       'Macallan Double Cask whisky bottle',
  'macallan-rare-cask':         'Macallan Rare Cask whisky bottle',
  // Balvenie
  'balvenie-15-single-barrel':  'Balvenie 15 Year Old Single Barrel whisky',
  'balvenie-21-portwood':       'Balvenie 21 Year Old PortWood whisky bottle',
  // Glenfiddich
  'glenfiddich-15':             'Glenfiddich 15 Year Old whisky bottle',
  'glenfiddich-18':             'Glenfiddich 18 Year Old whisky bottle',
  'glenfiddich-21-reserva':     'Glenfiddich 21 Year Old Gran Reserva whisky',
  // Glenlivet
  'glenlivet-18':               'Glenlivet 18 Year Old whisky bottle',
  'glenlivet-21':               'Glenlivet 21 Year Old Archive whisky bottle',
  'glenlivet-25':               'Glenlivet 25 Year Old whisky bottle',
  // Glenfarclas
  'glenfarclas-12':             'Glenfarclas 12 Year Old whisky bottle',
  'glenfarclas-15':             'Glenfarclas 15 Year Old whisky bottle',
  'glenfarclas-21':             'Glenfarclas 21 Year Old whisky bottle',
  'glenfarclas-25':             'Glenfarclas 25 Year Old whisky bottle',
  // Aberlour
  'aberlour-16':                'Aberlour 16 Year Old whisky bottle',
  'aberlour-18':                'Aberlour 18 Year Old whisky bottle',
  'aberlour-abunadh':           'Aberlour A\'bunadh whisky bottle',
  // Lagavulin
  'lagavulin-8':                'Lagavulin 8 Year Old whisky bottle',
  'lagavulin-distillers-edition':'Lagavulin Distillers Edition whisky bottle',
  // Laphroaig
  'laphroaig-18':               'Laphroaig 18 Year Old whisky bottle',
  'laphroaig-lore':             'Laphroaig Lore whisky bottle',
  'laphroaig-triple-wood':      'Laphroaig Triple Wood whisky bottle',
  // Bowmore
  'bowmore-25':                 'Bowmore 25 Year Old whisky bottle',
  // Caol Ila
  'caol-ila-18':                'Caol Ila 18 Year Old whisky bottle',
  // Glenmorangie
  'glenmorangie-18':            'Glenmorangie 18 Year Old Extremely Rare whisky bottle',
  'glenmorangie-signet':        'Glenmorangie Signet whisky bottle',
  // Bourbon / American
  'eagle-rare-10':              'Eagle Rare 10 Year Old bourbon bottle',
  'elijah-craig-small-batch':   'Elijah Craig Small Batch bourbon bottle',
  'woodford-double-oaked':      'Woodford Reserve Double Oaked bourbon bottle',
  // Irish
  'redbreast-15':               'Redbreast 15 Year Old Irish whiskey bottle',
  'green-spot':                 'Green Spot Irish whiskey bottle',
};

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

async function wpFetch(url) {
  try {
    const r = await fetch(url, { headers: HDR, signal: AbortSignal.timeout(10000) });
    if (!r.ok) return null;
    return await r.json();
  } catch { return null; }
}

function isBottleImage(url) {
  const u = url.toLowerCase();
  return (u.includes('bottle') || u.includes('whisky') || u.includes('whiskey') || u.includes('scotch'))
    && !u.includes('distillery') && !u.includes('building') && !u.includes('map')
    && !u.includes('landscape') && !u.includes('panoram');
}

async function findWikipediaImage(query) {
  // Step 1: Search
  const sd = await wpFetch(`${WP}?action=query&list=search&srsearch=${encodeURIComponent(query)}&srlimit=5&format=json`);
  const hits = sd?.query?.search;
  if (!hits?.length) return null;

  // Step 2: Get pageimage for top results
  for (const hit of hits) {
    await sleep(300);
    const pd = await wpFetch(`${WP}?action=query&titles=${encodeURIComponent(hit.title)}&prop=pageimages&format=json&piprop=thumbnail&pithumbsize=800`);
    const pages = pd?.query?.pages;
    if (!pages) continue;
    const page = Object.values(pages)[0];
    const thumb = page?.thumbnail;
    if (!thumb?.source) continue;
    // Check aspect ratio (bottles are portrait)
    if (thumb.width > 0 && thumb.height > 0 && thumb.width / thumb.height > 1.8) continue;
    if (isBottleImage(thumb.source)) return thumb.source;
  }
  return null;
}

async function downloadImage(url, destPath) {
  const r = await fetch(url, { headers: HDR, signal: AbortSignal.timeout(20000) });
  if (!r.ok) throw new Error(`HTTP ${r.status}`);
  const buf = await r.arrayBuffer();
  writeFileSync(destPath, Buffer.from(buf));
}

async function main() {
  if (!existsSync(IMAGES_DIR)) mkdirSync(IMAGES_DIR, { recursive: true });

  const ids = Object.keys(MISMATCHED);
  console.log(`\n🥃 이미지 다운로드 시작 — ${ids.length}개 위스키\n`);

  let ok = 0, fail = 0;
  for (const [id, query] of Object.entries(MISMATCHED)) {
    const destJpg = join(IMAGES_DIR, `${id}.jpg`);
    if (existsSync(destJpg)) {
      console.log(`  ⏭  ${id} (already exists)`);
      ok++;
      continue;
    }

    process.stdout.write(`  🔍 ${id}... `);
    const imgUrl = await findWikipediaImage(query);
    if (!imgUrl) {
      console.log(`❌ 이미지 없음`);
      fail++;
      await sleep(500);
      continue;
    }

    try {
      await downloadImage(imgUrl, destJpg);
      console.log(`✅ 저장됨`);
      ok++;
    } catch (e) {
      console.log(`❌ 다운로드 실패: ${e.message}`);
      fail++;
    }
    await sleep(600); // Wikipedia rate limit
  }

  console.log(`\n완료: ✅ ${ok}개 성공, ❌ ${fail}개 실패\n`);
}

main().catch(console.error);
