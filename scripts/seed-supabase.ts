#!/usr/bin/env tsx
/**
 * Seed script — uploads WHISKEY_DB to Supabase.
 * Run: npx tsx scripts/seed-supabase.ts
 *
 * Requires SUPABASE_SERVICE_ROLE_KEY in .env.local (bypasses RLS for writes).
 */

// Load .env.local before any imports that reference env vars.
// tsx supports --env-file flag; this fallback reads .env.local manually.
import { readFileSync } from 'fs';
import { resolve } from 'path';

try {
  const envPath = resolve(process.cwd(), '.env.local');
  const lines = readFileSync(envPath, 'utf8').split('\n');
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eq = trimmed.indexOf('=');
    if (eq < 0) continue;
    const key = trimmed.slice(0, eq).trim();
    const val = trimmed.slice(eq + 1).trim().replace(/^['"]|['"]$/g, '');
    if (key && !(key in process.env)) process.env[key] = val;
  }
} catch { /* .env.local missing — rely on shell environment */ }

import { createClient } from '@supabase/supabase-js';
import { WHISKEY_DB } from '../src/lib/data-static';
import { projectTo2D } from '../src/lib/vector-engine';

const url     = process.env.NEXT_PUBLIC_SUPABASE_URL;
const svcKey  = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !svcKey) {
  console.error('❌  Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env.local');
  process.exit(1);
}

const sb = createClient(url, svcKey, {
  auth: { persistSession: false },
});

function derivePriceCategory(priceKrw?: number): 'entry' | 'middle' | 'high-end' {
  const p = priceKrw ?? 70000;
  if (p < 100000) return 'entry';
  if (p < 300000) return 'middle';
  return 'high-end';
}

const rows = WHISKEY_DB.map(w => {
  const pos = projectTo2D(w.flavorVector);
  return {
    id:                      w.id,
    name:                    w.name,
    description:             w.description,
    profile_type:            w.profileType,
    // pgvector expects a JS number array — the JS client serialises it automatically
    flavor_vector:           w.flavorVector,
    image:                   w.image ?? null,
    compounds:               w.compounds,
    aroma:                   w.aroma,
    taste:                   w.taste,
    abv:                     w.abv,
    history:                 w.history ?? null,
    expert_nose:             w.expertNotes?.nose    ?? null,
    expert_palate:           w.expertNotes?.palate  ?? null,
    expert_finish:           w.expertNotes?.finish  ?? null,
    recommended_drink:       w.recommendedDrink     ?? null,
    price_daily_shot:        w.priceSimulation?.dailyShot        ?? null,
    price_gs25:              w.priceSimulation?.gs25              ?? null,
    price_cu:                w.priceSimulation?.cu                ?? null,
    price_duty_free_usd:     w.priceSimulation?.dutyFreeUsd       ?? null,
    price_best_buy_strategy: w.priceSimulation?.bestBuyStrategy   ?? null,
    price_category:          derivePriceCategory(w.priceSimulation?.dailyShot),
    trivia:                  w.trivia ?? [],
    x_pos:                   pos.x,
    y_pos:                   pos.y,
  };
});

const BATCH = 50;

async function seed() {
  console.log(`📦  Seeding ${rows.length} whiskeys in batches of ${BATCH}…`);
  let inserted = 0;
  for (let i = 0; i < rows.length; i += BATCH) {
    const batch = rows.slice(i, i + BATCH);
    const { error } = await sb.from('whiskeys').upsert(batch, { onConflict: 'id' });
    if (error) {
      console.error(`❌  Batch ${i / BATCH + 1} failed:`, error.message);
      process.exit(1);
    }
    inserted += batch.length;
    process.stdout.write(`\r   ${inserted}/${rows.length}`);
  }
  console.log(`\n✅  완료 — ${inserted}개 whiskeys upserted.`);
}

seed().catch(err => {
  console.error('❌  Seed failed:', err);
  process.exit(1);
});
