import type { Whiskey } from './data';

// 7차원 풍미 벡터: [Peat, Fruit, Sweet, Wood, Floral, Body, Finish]
export type FlavorVector = [number, number, number, number, number, number, number];

export const VECTOR_DIMS = ['Peat', 'Fruit', 'Sweet', 'Wood', 'Floral', 'Body', 'Finish'] as const;
export type VectorDim = typeof VECTOR_DIMS[number];

export const VECTOR_DIM_LABELS_KR: Record<VectorDim, string> = {
  Peat:   '피트/스모키',
  Fruit:  '과일향',
  Sweet:  '달콤함',
  Wood:   '우디/오크',
  Floral: '꽃/플로럴',
  Body:   '바디감',
  Finish: '피니시',
};

export function cosineSimilarity(a: FlavorVector, b: FlavorVector): number {
  const dot = a.reduce((s, ai, i) => s + ai * b[i], 0);
  const magA = Math.sqrt(a.reduce((s, ai) => s + ai * ai, 0));
  const magB = Math.sqrt(b.reduce((s, bi) => s + bi * bi, 0));
  if (magA === 0 || magB === 0) return 0;
  return dot / (magA * magB);
}

// 7D → 2D 투영 (맛의 지도)
// X: 피티/스모키(-1) ←→ 달콤/과일(+1)
// Y: 가볍고섬세(-1) ←→ 묵직하고강렬(+1)
export function projectTo2D(v: FlavorVector): { x: number; y: number } {
  const rawX = v[2] * 0.4 + v[1] * 0.4 - v[0] * 0.8;
  const rawY = v[5] * 0.5 + v[3] * 0.4 - v[4] * 0.4 - v[2] * 0.2;
  return {
    x: Math.max(-1, Math.min(1, rawX / 0.8)),
    y: Math.max(-1, Math.min(1, rawY / 0.85)),
  };
}

export function getTopMatches(userVector: FlavorVector, whiskeys: Whiskey[], topN = 3) {
  return whiskeys
    .map(w => ({ whiskey: w, similarity: cosineSimilarity(userVector, w.flavorVector) }))
    .sort((a, b) => b.similarity - a.similarity)
    .slice(0, topN);
}

export function parseVector(str: string): FlavorVector | null {
  const parts = str.split(',').map(Number);
  if (parts.length !== 7 || parts.some(isNaN)) return null;
  return parts.map(v => Math.max(0, Math.min(1, v))) as unknown as FlavorVector;
}

export function serializeVector(v: FlavorVector): string {
  return v.map(n => n.toFixed(2)).join(',');
}

// 프로필 폴백 벡터
export const PROFILE_VECTORS: Record<string, FlavorVector> = {
  sweet_heavy:  [0.10, 0.50, 0.80, 0.60, 0.40, 0.70, 0.70],
  peaty_bold:   [0.90, 0.20, 0.20, 0.30, 0.10, 0.70, 0.80],
  citrus_light: [0.05, 0.70, 0.60, 0.40, 0.70, 0.40, 0.50],
  smooth_nutty: [0.05, 0.40, 0.55, 0.50, 0.50, 0.40, 0.45],
  spicy_woody:  [0.20, 0.50, 0.60, 0.85, 0.20, 0.80, 0.80],
};

export function inferProfile(userVector: FlavorVector): string {
  return Object.entries(PROFILE_VECTORS).reduce(
    (best, [name, vec]) => {
      const sim = cosineSimilarity(userVector, vec);
      return sim > best.sim ? { name, sim } : best;
    },
    { name: 'sweet_heavy', sim: -Infinity }
  ).name;
}
