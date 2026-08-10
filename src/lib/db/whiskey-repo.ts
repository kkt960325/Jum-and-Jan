import { getSupabaseClient } from '@/lib/supabase';
import type { Whiskey } from '@/lib/data';
import { WHISKEY_DB } from '@/lib/data-static';
import { cosineSimilarity, projectTo2D, type FlavorVector } from '@/lib/vector-engine';
import type { MapWhiskey } from '@/components/flavor-map/FlavorMap';

type PriceTier = 'entry' | 'middle' | 'high-end';

export interface TierMatch {
  whiskey: Whiskey;
  similarity: number;
  tier: PriceTier;
}

// ── Row → domain type ──────────────────────────────────────────────────
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function rowToWhiskey(row: Record<string, any>): Whiskey {
  return {
    id:          row.id,
    name:        row.name,
    description: row.description ?? '',
    profileType: row.profile_type ?? '',
    flavorVector: (row.flavor_vector as number[]) as FlavorVector,
    image:       row.image ?? undefined,
    compounds:   row.compounds ?? [],
    aroma:       row.aroma ?? [],
    taste:       row.taste ?? [],
    abv:         Number(row.abv),
    history:     row.history ?? undefined,
    expertNotes: (row.expert_nose || row.expert_palate || row.expert_finish)
      ? { nose: row.expert_nose ?? '', palate: row.expert_palate ?? '', finish: row.expert_finish ?? '' }
      : undefined,
    recommendedDrink: row.recommended_drink as Whiskey['recommendedDrink'] ?? undefined,
    priceSimulation: row.price_daily_shot != null ? {
      dailyShot:        row.price_daily_shot,
      gs25:             row.price_gs25             ?? 0,
      cu:               row.price_cu               ?? 0,
      dutyFreeUsd:      Number(row.price_duty_free_usd ?? 0),
      bestBuyStrategy:  row.price_best_buy_strategy ?? '',
    } : undefined,
    priceCategory: row.price_category as Whiskey['priceCategory'] ?? undefined,
    trivia: row.trivia ?? undefined,
  };
}

function withTimeout<T>(promise: PromiseLike<T> | Promise<T>, ms: number = 1200): Promise<T> {
  let timeoutId: NodeJS.Timeout;
  const timeoutPromise = new Promise<never>((_, reject) => {
    timeoutId = setTimeout(() => reject(new Error('Database query timed out')), ms);
  });
  return Promise.race([
    Promise.resolve(promise).then(val => {
      clearTimeout(timeoutId);
      return val;
    }),
    timeoutPromise
  ]);
}

// ── Queries ────────────────────────────────────────────────────────────

export async function getTopWhiskeysByTier(userVector: FlavorVector): Promise<TierMatch[]> {
  let whiskeys: Whiskey[] = [];
  try {
    const sb = getSupabaseClient();
    const { data, error } = await withTimeout<any>(
      sb.from('whiskeys').select('*'),
      1200
    );
    if (error) throw error;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    whiskeys = (data as any[]).map(row => rowToWhiskey(row));
  } catch (err) {
    console.warn('⚠️  Supabase fetch whiskeys failed, using static fallback for top matches:', err);
    whiskeys = WHISKEY_DB;
  }

  // 로컬 가격 카테고리별 유사도 연산 (티어별 상위 3개 선정)
  const matches: TierMatch[] = [];
  const tiers: PriceTier[] = ['entry', 'middle', 'high-end'];
  
  for (const tier of tiers) {
    const tierWhiskeys = whiskeys.filter(w => w.priceCategory === tier);
    if (tierWhiskeys.length === 0) continue;
    
    const sorted = tierWhiskeys
      .map(w => ({
        whiskey: w,
        similarity: cosineSimilarity(userVector, w.flavorVector),
        tier
      }))
      .sort((a, b) => b.similarity - a.similarity);
    
    // 각 티어별로 상위 3개씩 추가 (총 9개 후보군 형성)
    matches.push(...sorted.slice(0, 3));
  }
  
  // 전체 추천을 매칭 스코어(유사도) 기준으로 정렬하여 반환
  return matches.sort((a, b) => b.similarity - a.similarity);
}

export async function getFlavorMapWhiskeys(): Promise<MapWhiskey[]> {
  try {
    const sb = getSupabaseClient();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data, error } = await withTimeout<any>(
      (sb.rpc as any)('flavor_map_whiskeys'),
      1200
    );
    if (error) throw error;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return (data as any[]).map(row => ({
      id:    row.id,
      name:  row.name,
      abv:   Number(row.abv),
      image: row.image ?? undefined,
      price: row.price_daily_shot ?? undefined,
      x:     Number(row.x_pos),
      y:     Number(row.y_pos),
    }));
  } catch (err) {
    console.warn('⚠️  Supabase RPC flavor_map_whiskeys failed, using static fallback:', err);
    
    // 로컬 2D 사영 연산 폴백
    return WHISKEY_DB.map(w => {
      const pos = projectTo2D(w.flavorVector);
      return {
        id:    w.id,
        name:  w.name,
        abv:   w.abv,
        image: w.image,
        price: w.priceSimulation?.dailyShot,
        x:     pos.x,
        y:     pos.y,
      };
    });
  }
}

export async function getWhiskeyById(id: string): Promise<Whiskey | null> {
  try {
    const sb = getSupabaseClient();
    const { data, error } = await withTimeout<any>(
      sb.from('whiskeys').select('*').eq('id', id).single(),
      1200
    );
    if (error) {
      if (error.code === 'PGRST116') return null; // row not found
      throw error;
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return rowToWhiskey(data as Record<string, any>);
  } catch (err) {
    console.warn(`⚠️  getWhiskeyById for ${id} failed, using static fallback:`, err);
    const found = WHISKEY_DB.find(w => w.id === id);
    return found || null;
  }
}
