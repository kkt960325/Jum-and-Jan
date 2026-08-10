#!/usr/bin/env node
/**
 * update-data-static.mjs
 * Updates image: fields in src/lib/data-static.ts from wb-mapping.json.
 * Handles both single-line and multi-line whisky object formats.
 *
 * Usage:
 *   node scripts/update-data-static.mjs
 *   node scripts/update-data-static.mjs --dry-run
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const MAPPING_PATH = path.join(__dirname, '..', 'wb-mapping.json');
const DATA_TS_PATH = path.join(__dirname, '..', 'src', 'lib', 'data-static.ts');
const DRY_RUN = process.argv.includes('--dry-run');

function main() {
  const mapping = JSON.parse(fs.readFileSync(MAPPING_PATH, 'utf8'));

  // Build id → image_url map (only entries with actual URLs)
  const urlMap = {};
  for (const w of mapping.whiskies) {
    if (w.id && w.image_url) urlMap[w.id] = w.image_url;
  }
  console.log(`\n📝 update-data-static.mjs`);
  console.log(`   Image URLs available: ${Object.keys(urlMap).length}`);
  if (DRY_RUN) console.log('   [DRY RUN]\n');

  let src = fs.readFileSync(DATA_TS_PATH, 'utf8');
  let updated = 0, inserted = 0, skipped = 0;

  for (const [id, imageUrl] of Object.entries(urlMap)) {
    const escapedId = id.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const newImageLine = `image: '${imageUrl}'`;

    // Case 1: id exists AND image field exists in same object
    // Replace existing image: '...' value in the block containing this id
    const blockRe = new RegExp(
      `(id:\\s*['"]${escapedId}['"][\\s\\S]{0,800}?)(image:\\s*['"][^'"]*['"])`,
      'g'
    );
    let matched = false;
    src = src.replace(blockRe, (full, before, oldImage) => {
      if (oldImage === newImageLine) { skipped++; matched = true; return full; }
      matched = true;
      updated++;
      if (DRY_RUN) console.log(`  [replace] ${id}: ${oldImage} → ${newImageLine}`);
      return before + newImageLine;
    });
    if (matched) continue;

    // Case 2: id exists, no image field yet
    // Sub-case A: single-line entry — insert image before closing }, or ,\n
    const singleLineRe = new RegExp(
      `(\\{\\s*id:\\s*['"]${escapedId}['"][^\\n}]+?)(\\s*\\},?)\\s*$`,
      'm'
    );
    if (singleLineRe.test(src)) {
      src = src.replace(singleLineRe, (full, before, closing) => {
        inserted++;
        if (DRY_RUN) console.log(`  [insert-single] ${id}: INSERT ${newImageLine}`);
        return `${before}, ${newImageLine}${closing}`;
      });
      continue;
    }

    // Sub-case B: multi-line entry — insert image: line after the id: line
    const multiLineRe = new RegExp(
      `(id:\\s*['"]${escapedId}['"][^\\n]*\\n)`
    );
    if (multiLineRe.test(src)) {
      src = src.replace(multiLineRe, (full) => {
        // Detect indentation
        const indent = (full.match(/^(\s+)id:/) || ['', '    '])[1];
        inserted++;
        if (DRY_RUN) console.log(`  [insert-multi] ${id}: INSERT ${newImageLine}`);
        return full + `${indent}${newImageLine},\n`;
      });
      continue;
    }

    console.warn(`  ⚠ id not found in file: ${id}`);
    skipped++;
  }

  if (!DRY_RUN) {
    fs.writeFileSync(DATA_TS_PATH, src);
  }

  console.log(`\n✅ Results:`);
  console.log(`   Replaced existing image fields: ${updated}`);
  console.log(`   Inserted new image fields:      ${inserted}`);
  console.log(`   Skipped (already correct / not found): ${skipped}`);
  if (!DRY_RUN) {
    console.log(`\n   data-static.ts updated.`);
    console.log(`   Run: npm run build  (to verify no TS errors)\n`);
  }
}

main();
