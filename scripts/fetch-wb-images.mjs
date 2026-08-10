#!/usr/bin/env node
/**
 * fetch-wb-images.mjs
 * Fetches whiskybase.com pages for each whisky in wb-mapping.json
 * and extracts the bottle photo URL (static.whiskybase.com CDN).
 *
 * Run locally (NOT in sandbox — needs direct internet access):
 *   node scripts/fetch-wb-images.mjs
 *
 * Options:
 *   --dry-run   Print what would be done, no fetches
 *   --limit N   Process only first N whiskies without image_url
 *   --id xyz    Process only the whisky with app id "xyz"
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const MAPPING_PATH = path.join(__dirname, '..', 'wb-mapping.json');
const DELAY_MS = 1200;

const args = process.argv.slice(2);
const DRY_RUN = args.includes('--dry-run');
const LIMIT = args.includes('--limit') ? parseInt(args[args.indexOf('--limit') + 1]) : Infinity;
const ONLY_ID = args.includes('--id') ? args[args.indexOf('--id') + 1] : null;

const IMAGE_RE = /https:\/\/static\.whiskybase\.com\/storage\/whiskies\/[^"'\s]+?-big\.jpg/g;

async function fetchPage(url) {
  const res = await fetch(url, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (compatible; whisky-hansik-app/1.0)',
      'Accept': 'text/html,application/xhtml+xml',
      'Accept-Language': 'en-US,en;q=0.9',
    },
    signal: AbortSignal.timeout(15000),
  });
  if (!res.ok) throw new Error(`HTTP ${res.status} for ${url}`);
  return res.text();
}

function extractImageUrl(html) {
  const matches = [...html.matchAll(IMAGE_RE)];
  if (!matches.length) return null;
  return matches[0][0];
}

function sleep(ms) {
  return new Promise(r => setTimeout(r, ms));
}

async function main() {
  const mapping = JSON.parse(fs.readFileSync(MAPPING_PATH, 'utf8'));
  const whiskies = mapping.whiskies;

  let targets = whiskies.filter(w => w.wb_id && !w.image_url);
  if (ONLY_ID) targets = targets.filter(w => w.id === ONLY_ID);
  targets = targets.slice(0, LIMIT);

  console.log('\n🥃 fetch-wb-images.mjs');
  console.log(`   Total entries in mapping: ${whiskies.length}`);
  console.log(`   Already have image_url:   ${whiskies.filter(w => w.image_url).length}`);
  console.log(`   Need to fetch:            ${targets.length}`);
  if (DRY_RUN) console.log('   [DRY RUN — no requests]\n');
  else console.log('');

  let fetched = 0, failed = 0;

  for (const whisky of targets) {
    const url = `https://www.whiskybase.com/whiskies/whisky/${whisky.wb_id}/`;
    process.stdout.write(`  ${whisky.id} (WB${whisky.wb_id}) ... `);

    if (DRY_RUN) {
      console.log(`[dry-run] ${url}`);
      continue;
    }

    try {
      const html = await fetchPage(url);
      const imageUrl = extractImageUrl(html);

      if (imageUrl) {
        whisky.image_url = imageUrl;
        console.log(`✓ ${imageUrl}`);
        fetched++;
      } else {
        console.log('⚠ no image found');
        failed++;
      }
    } catch (err) {
      console.log(`✗ ${err.message}`);
      failed++;
    }

    if ((fetched + failed) % 10 === 0) {
      mapping.image_url_count = whiskies.filter(w => w.image_url).length;
      fs.writeFileSync(MAPPING_PATH, JSON.stringify(mapping, null, 2));
      console.log(`  [saved — ${mapping.image_url_count} image URLs total]\n`);
    }

    await sleep(DELAY_MS);
  }

  mapping.generated = new Date().toISOString().slice(0, 10);
  mapping.image_url_count = whiskies.filter(w => w.image_url).length;
  fs.writeFileSync(MAPPING_PATH, JSON.stringify(mapping, null, 2));

  console.log(`\n✅ Done. Fetched: ${fetched}  Failed/no image: ${failed}`);
  console.log(`   Total image URLs in mapping: ${mapping.image_url_count} / ${whiskies.length}`);
  console.log('\n   Next step: node scripts/update-data-static.mjs\n');
}

main().catch(err => { console.error(err); process.exit(1); });
