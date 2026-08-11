/**
 * Whiskybase 이미지 URL 조회
 * 1순위: 정적 캐시 (빌드에 포함, 네트워크 0)
 * 2순위: Supabase 런타임 캐시
 * 3순위: null → 호출자가 로컬 이미지로 폴백
 */
import { createClient } from '@supabase/supabase-js';
import wbMapping from '../../wb-mapping.json';
import imageCache from './whisky-image-cache.json';

// wb_id 조회 맵 (whisky app id → wb_id)
const WB_ID_MAP: Record<string, number> = Object.fromEntries(
  (wbMapping.whiskies as Array<{ id: string; wb_id: number | null }>)
    .filter(w => w.wb_id != null)
    .map(w => [w.id, w.wb_id as number])
);

// 정적 캐시 (빌드에 포함된 JSON — 네트워크 불필요)
const STATIC_CACHE = imageCache as Record<string, string>;

function getSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
  return createClient(url, key);
}

export async function getWhiskybaseImageUrl(whiskeyId: string): Promise<string | null> {
  // 1. 정적 캐시 (즉시 반환, 네트워크 없음)
  if (STATIC_CACHE[whiskeyId]) return STATIC_CACHE[whiskeyId];

  // 2. wb_id 없으면 포기
  const wbId = WB_ID_MAP[whiskeyId];
  if (!wbId) return null;

  // 3. Supabase 런타임 캐시 (정적 캐시에 없는 나머지용)
  try {
    const supabase = getSupabase();
    const { data } = await supabase
      .from('whisky_images')
      .select('image_url')
      .eq('wb_id', wbId)
      .maybeSingle();

    if (data?.image_url) return data.image_url as string;
  } catch {
    // 실패 시 null로 폴백
  }

  return null;
}

export async function getBatchWhiskybaseImageUrls(
  whiskeyIds: string[]
): Promise<Record<string, string | null>> {
  // 정적 캐시에 있는 항목은 즉시 처리, 없는 것만 비동기로
  const results: Record<string, string | null> = {};
  const missing: string[] = [];

  for (const id of whiskeyIds) {
    if (STATIC_CACHE[id]) {
      results[id] = STATIC_CACHE[id];
    } else {
      missing.push(id);
    }
  }

  if (missing.length > 0) {
    const fetched = await Promise.all(
      missing.map(async id => [id, await getWhiskybaseImageUrl(id)] as const)
    );
    for (const [id, url] of fetched) results[id] = url;
  }

  return results;
}
