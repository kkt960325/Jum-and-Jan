export interface Whiskey {
  id: string;
  name: string;
  description: string;
  profileType: string; // sweet_heavy, peaty_bold, citrus_light, smooth_nutty, spicy_woody
  flavorVector: [number, number, number, number, number, number, number]; // [Peat, Fruit, Sweet, Wood, Floral, Body, Finish] 0.0~1.0
  image?: string; // 검증된 이미지 경로만 입력 (Cross-check: ID와 파일명 일치 확인 필수)
  compounds: string[]; // 분자 화합물 배열 (FlavorDB/Khymos 기반)
  aroma: string[]; // 향 프로필
  taste: string[]; // 맛 프로필
  abv: number; // 알코올 도수
  history?: string; // 히스토리
  expertNotes?: {
    nose: string;
    palate: string;
    finish: string;
  };
  recommendedDrink?: 'Neat' | 'On the rocks' | 'Highball';
  priceSimulation?: {
    dailyShot: number;
    gs25: number;
    cu: number;
    dutyFreeUsd: number;
    bestBuyStrategy: string;
  };
  priceCategory?: 'entry' | 'middle' | 'high-end'; // entry: <10만원 / middle: 10~30만원 / high-end: 30만원+
  trivia?: string[]; // 비하인드 스토리
}

export type Tier = 'low' | 'medium' | 'high';

export interface Food {
  id: string;
  name: string;
  tier: Tier;
  compounds: string[]; // 공유 가능한 화합물
  capsaicinLevel: number; // 매운맛 강도 (0-10)
  fermentationLevel: number; // 발효/감칠맛 강도 (0-10)
  aroma: string[];
  taste: string[];
}
