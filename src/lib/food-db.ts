import foodsData from './foods.json';

// FoodVector: [Sweet, Salty, Sour, Spicy, Umami, Fat, Texture]
// Texture: 0=부드럽고 촉촉함, 1=바삭하고 쫄깃함
export type FoodVector = [number, number, number, number, number, number, number];
export const FOOD_VECTOR_DIMS = ['Sweet', 'Salty', 'Sour', 'Spicy', 'Umami', 'Fat', 'Texture'] as const;
export const FOOD_VECTOR_LABELS_KR: Record<string, string> = {
  Sweet: '단맛', Salty: '짠맛', Sour: '신맛', Spicy: '매운맛',
  Umami: '감칠맛', Fat: '고소함/지방', Texture: '텍스처',
};

export type FoodTier = 'low' | 'medium' | 'high';
export type FoodCategory = 'snack' | 'meal' | 'delicacy';
export type Season = 'spring' | 'summer' | 'fall' | 'winter';
export type DishType =
  | '과자/한과' | '전/부침개' | '구이' | '볶음' | '찜'
  | '조림' | '무침' | '발효/젓갈' | '회/생선' | '탕/국/찌개'
  | '떡' | '면/밥/죽' | '고급 요리';

export const DISH_TYPE_LABELS: Record<DishType, string> = {
  '과자/한과': '과자·한과',  '전/부침개': '전·부침개',
  '구이': '구이',            '볶음': '볶음·두루치기',
  '찜': '찜·수육',           '조림': '조림',
  '무침': '무침·나물',       '발효/젓갈': '발효·젓갈',
  '회/생선': '회·생선',      '탕/국/찌개': '탕·국·찌개',
  '떡': '떡·한과',           '면/밥/죽': '면·밥·죽',
  '고급 요리': '고급 요리',
};

export interface FoodV2 {
  id: string;
  name: string;
  tier: FoodTier;
  category: FoodCategory;
  dishType?: DishType;
  foodVector: FoodVector; // [Sweet, Salty, Sour, Spicy, Umami, Fat, Texture]
  compounds: string[];
  season?: Season[];
}

export const FOOD_CATEGORY_LABELS: Record<FoodCategory, string> = {
  snack: '가벼운 주전부리',
  meal: '든든한 요리',
  delicacy: '고급 별미',
};

export const FOOD_DB_V2 = foodsData as FoodV2[];
