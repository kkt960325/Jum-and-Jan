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

// ─────────────────────────────────────────────
// FOOD DATABASE (300+ items)
// ─────────────────────────────────────────────
export const FOOD_DB_V2: FoodV2[] = [

  // ══════════════════════════════════════════
  // 주전부리 / 스낵 — LOW TIER, SNACK
  // ══════════════════════════════════════════
  { id: 'yakgwa', name: '약과', tier: 'low', category: 'snack', foodVector: [0.88, 0.08, 0.0, 0.0, 0.1, 0.42, 0.55], compounds: ['vanillin', 'furfural', 'pyrazines'], season: ['fall', 'winter'] },
  { id: 'gangjeong-sesame', name: '참깨 강정', tier: 'low', category: 'snack', foodVector: [0.75, 0.1, 0.0, 0.0, 0.15, 0.35, 0.88], compounds: ['vanillin', 'pyrazines', 'furfural'] },
  { id: 'gangjeong-peanut', name: '땅콩 강정', tier: 'low', category: 'snack', foodVector: [0.70, 0.15, 0.0, 0.0, 0.2, 0.45, 0.85], compounds: ['pyrazines', 'vanillin'] },
  { id: 'bupyuh', name: '뻥튀기', tier: 'low', category: 'snack', foodVector: [0.2, 0.22, 0.0, 0.0, 0.12, 0.08, 0.92], compounds: ['pyrazines'] },
  { id: 'gimbugak', name: '김부각', tier: 'low', category: 'snack', foodVector: [0.1, 0.58, 0.0, 0.0, 0.55, 0.28, 0.85], compounds: ['dimethyl sulfide', 'pyrazines'] },
  { id: 'myeolchi-bokkeum', name: '멸치볶음', tier: 'low', category: 'snack', foodVector: [0.32, 0.68, 0.0, 0.12, 0.72, 0.22, 0.72], compounds: ['amines', 'pyrazines', 'vanillin'] },
  { id: 'peanut-roasted', name: '볶은 땅콩', tier: 'low', category: 'snack', foodVector: [0.18, 0.3, 0.0, 0.0, 0.3, 0.52, 0.82], compounds: ['pyrazines'] },
  { id: 'hodugwaja', name: '호두과자', tier: 'low', category: 'snack', foodVector: [0.72, 0.08, 0.0, 0.0, 0.18, 0.38, 0.52], compounds: ['vanillin', 'pyrazines', 'furfural'] },
  { id: 'rice-cracker', name: '쌀과자', tier: 'low', category: 'snack', foodVector: [0.25, 0.28, 0.0, 0.0, 0.1, 0.12, 0.9], compounds: ['pyrazines'] },
  { id: 'dasik-pine', name: '솔잎 다식', tier: 'low', category: 'snack', foodVector: [0.65, 0.05, 0.0, 0.0, 0.08, 0.15, 0.3], compounds: ['linalool', 'pinene', 'vanillin'], season: ['spring'] },
  { id: 'dasik-sesame', name: '흑임자 다식', tier: 'low', category: 'snack', foodVector: [0.55, 0.1, 0.0, 0.0, 0.2, 0.35, 0.28], compounds: ['pyrazines', 'vanillin'] },
  { id: 'yugwa', name: '유과', tier: 'low', category: 'snack', foodVector: [0.68, 0.08, 0.0, 0.0, 0.1, 0.35, 0.78], compounds: ['vanillin', 'furfural', 'pyrazines'] },
  { id: 'jeonpyeon', name: '절편', tier: 'low', category: 'snack', foodVector: [0.3, 0.08, 0.0, 0.0, 0.05, 0.08, 0.42], compounds: ['vanillin'] },
  { id: 'injeolmi-snack', name: '인절미 한입', tier: 'low', category: 'snack', foodVector: [0.45, 0.08, 0.0, 0.0, 0.12, 0.15, 0.62], compounds: ['vanillin', 'pyrazines'] },
  { id: 'bugak-lotus', name: '연근 부각', tier: 'low', category: 'snack', foodVector: [0.12, 0.42, 0.05, 0.0, 0.18, 0.28, 0.88], compounds: ['eugenol', 'pyrazines'], season: ['fall'] },
  { id: 'bugak-seaweed', name: '톳 부각', tier: 'low', category: 'snack', foodVector: [0.08, 0.55, 0.02, 0.0, 0.48, 0.32, 0.85], compounds: ['dimethyl sulfide', 'pyrazines'] },
  { id: 'doraji-jeonggwa', name: '도라지 정과', tier: 'low', category: 'snack', foodVector: [0.75, 0.05, 0.08, 0.0, 0.08, 0.05, 0.35], compounds: ['linalool', 'vanillin'], season: ['fall', 'winter'] },
  { id: 'yuzu-jeonggwa', name: '유자 정과', tier: 'low', category: 'snack', foodVector: [0.72, 0.05, 0.32, 0.0, 0.05, 0.02, 0.28], compounds: ['limonene', 'linalool', 'vanillin'], season: ['winter'] },
  { id: 'ginger-jeonggwa', name: '생강 정과', tier: 'low', category: 'snack', foodVector: [0.65, 0.05, 0.05, 0.22, 0.05, 0.02, 0.32], compounds: ['gingerol', 'vanillin', 'eugenol'], season: ['winter'] },
  { id: 'jujube-jeonggwa', name: '대추 정과', tier: 'low', category: 'snack', foodVector: [0.82, 0.05, 0.05, 0.0, 0.12, 0.08, 0.45], compounds: ['vanillin', 'furfural'], season: ['fall'] },
  { id: 'walnut-jeon', name: '호두 조림', tier: 'low', category: 'snack', foodVector: [0.55, 0.25, 0.0, 0.0, 0.15, 0.42, 0.55], compounds: ['vanillin', 'pyrazines', 'tannin'] },
  { id: 'gamja-twigim', name: '감자전 스틱', tier: 'low', category: 'snack', foodVector: [0.18, 0.42, 0.0, 0.0, 0.15, 0.32, 0.82], compounds: ['pyrazines', 'furfural'] },
  { id: 'corn-cheese', name: '콘치즈 스낵', tier: 'low', category: 'snack', foodVector: [0.28, 0.52, 0.0, 0.0, 0.38, 0.45, 0.88], compounds: ['diacetyl', 'pyrazines', 'vanillin'] },
  { id: 'dried-squid', name: '마른 오징어채', tier: 'low', category: 'snack', foodVector: [0.08, 0.72, 0.0, 0.12, 0.82, 0.12, 0.92], compounds: ['amines', 'dimethyl sulfide', 'pyrazines'] },
  { id: 'fish-cake-snack', name: '오뎅 꼬치', tier: 'low', category: 'snack', foodVector: [0.22, 0.58, 0.05, 0.05, 0.52, 0.18, 0.55], compounds: ['amines', 'pyrazines'] },
  { id: 'seol-gi-tteok', name: '설기떡', tier: 'low', category: 'snack', foodVector: [0.4, 0.05, 0.0, 0.0, 0.05, 0.08, 0.38], compounds: ['vanillin'] },
  { id: 'baekseolgi', name: '백설기', tier: 'low', category: 'snack', foodVector: [0.32, 0.05, 0.0, 0.0, 0.05, 0.06, 0.3], compounds: ['vanillin'] },
  { id: 'chapssaltteok', name: '찹쌀떡', tier: 'low', category: 'snack', foodVector: [0.62, 0.05, 0.0, 0.0, 0.08, 0.12, 0.68], compounds: ['vanillin'] },
  { id: 'chapssal-donut', name: '찹쌀 도넛', tier: 'low', category: 'snack', foodVector: [0.72, 0.08, 0.0, 0.0, 0.08, 0.42, 0.72], compounds: ['vanillin', 'furfural'] },
  { id: 'honey-tteok', name: '꿀떡', tier: 'low', category: 'snack', foodVector: [0.82, 0.05, 0.0, 0.0, 0.08, 0.1, 0.58], compounds: ['vanillin', 'furfural'] },
  { id: 'sikhye', name: '식혜 한 잔', tier: 'low', category: 'snack', foodVector: [0.65, 0.05, 0.05, 0.0, 0.12, 0.02, 0.05], compounds: ['vanillin', 'esters'] },
  { id: 'sujeonggwa', name: '수정과 한 잔', tier: 'low', category: 'snack', foodVector: [0.72, 0.02, 0.08, 0.18, 0.05, 0.02, 0.05], compounds: ['gingerol', 'eugenol', 'limonene'], season: ['winter'] },
  { id: 'sundubu-bites', name: '두부 강정', tier: 'low', category: 'snack', foodVector: [0.32, 0.42, 0.0, 0.15, 0.38, 0.28, 0.78], compounds: ['vanillin', 'pyrazines', 'capsaicin'] },
  { id: 'misugaru', name: '미숫가루 경단', tier: 'low', category: 'snack', foodVector: [0.48, 0.1, 0.0, 0.0, 0.18, 0.2, 0.42], compounds: ['pyrazines', 'vanillin'] },
  { id: 'ssam-bugak', name: '깻잎 부각', tier: 'low', category: 'snack', foodVector: [0.08, 0.45, 0.02, 0.05, 0.22, 0.32, 0.88], compounds: ['linalool', 'pyrazines'], season: ['summer'] },
  { id: 'tofu-jerky', name: '두부 과자', tier: 'low', category: 'snack', foodVector: [0.2, 0.38, 0.0, 0.0, 0.32, 0.2, 0.85], compounds: ['pyrazines'] },
  { id: 'popcorn-ganjang', name: '간장 팝콘', tier: 'low', category: 'snack', foodVector: [0.28, 0.58, 0.0, 0.0, 0.22, 0.28, 0.9], compounds: ['pyrazines', 'vanillin'] },
  { id: 'gochujang-chips', name: '고추장 과자', tier: 'low', category: 'snack', foodVector: [0.25, 0.45, 0.05, 0.52, 0.18, 0.22, 0.88], compounds: ['capsaicin', 'pyrazines', 'acetic acid'] },
  { id: 'dried-persimmon', name: '곶감', tier: 'low', category: 'snack', foodVector: [0.88, 0.05, 0.05, 0.0, 0.12, 0.05, 0.45], compounds: ['vanillin', 'furfural', 'tannin'], season: ['winter'] },
  { id: 'mul-yeot', name: '물엿 강정', tier: 'low', category: 'snack', foodVector: [0.92, 0.05, 0.0, 0.0, 0.05, 0.2, 0.5], compounds: ['vanillin', 'furfural'] },
  { id: 'hobak-jeonggwa', name: '호박 정과', tier: 'low', category: 'snack', foodVector: [0.78, 0.08, 0.0, 0.0, 0.08, 0.05, 0.38], compounds: ['vanillin', 'furfural'], season: ['fall'] },
  { id: 'omija-tea-jelly', name: '오미자 차 젤리', tier: 'low', category: 'snack', foodVector: [0.55, 0.05, 0.45, 0.02, 0.05, 0.02, 0.12], compounds: ['limonene', 'linalool', 'anthocyanins'], season: ['fall'] },
  { id: 'bokbunja-jelly', name: '복분자 젤리', tier: 'low', category: 'snack', foodVector: [0.62, 0.05, 0.38, 0.0, 0.05, 0.02, 0.12], compounds: ['anthocyanins', 'tannin', 'esters'], season: ['summer'] },
  { id: 'black-sesame-tteok', name: '흑임자 경단', tier: 'low', category: 'snack', foodVector: [0.52, 0.1, 0.0, 0.0, 0.18, 0.32, 0.55], compounds: ['pyrazines', 'vanillin'] },
  { id: 'pine-sikhye', name: '솔잎 식혜 구이 떡', tier: 'low', category: 'snack', foodVector: [0.58, 0.05, 0.05, 0.0, 0.08, 0.08, 0.42], compounds: ['pinene', 'vanillin', 'linalool'], season: ['spring'] },
  { id: 'nurungji-snack', name: '누룽지 스낵', tier: 'low', category: 'snack', foodVector: [0.22, 0.28, 0.0, 0.0, 0.15, 0.1, 0.88], compounds: ['pyrazines', 'furfural'] },
  { id: 'soy-nuts', name: '콩자반', tier: 'low', category: 'snack', foodVector: [0.45, 0.55, 0.0, 0.0, 0.42, 0.18, 0.72], compounds: ['pyrazines', 'vanillin'] },
  { id: 'bori-tteok', name: '보리 바 (떡)', tier: 'low', category: 'snack', foodVector: [0.28, 0.12, 0.0, 0.0, 0.12, 0.08, 0.45], compounds: ['pyrazines', 'furfural'] },
  { id: 'dried-mango-tteok', name: '망고 찰떡', tier: 'low', category: 'snack', foodVector: [0.82, 0.05, 0.18, 0.0, 0.05, 0.08, 0.58], compounds: ['limonene', 'isoamyl acetate', 'vanillin'], season: ['summer'] },
  { id: 'green-tea-tteok', name: '녹차 떡', tier: 'low', category: 'snack', foodVector: [0.42, 0.08, 0.08, 0.0, 0.12, 0.1, 0.45], compounds: ['linalool', 'vanillin', 'tannin'] },
  { id: 'kkwabaegi', name: '꽈배기', tier: 'low', category: 'snack', foodVector: [0.45, 0.15, 0.0, 0.0, 0.1, 0.38, 0.78], compounds: ['vanillin', 'furfural'] },
  { id: 'hotteok', name: '호떡', tier: 'low', category: 'snack', foodVector: [0.75, 0.08, 0.0, 0.0, 0.1, 0.42, 0.65], compounds: ['vanillin', 'cinnamaldehyde', 'furfural'], season: ['winter'] },
  { id: 'bungeoppang', name: '붕어빵', tier: 'low', category: 'snack', foodVector: [0.72, 0.08, 0.0, 0.0, 0.12, 0.22, 0.62], compounds: ['vanillin', 'furfural'], season: ['winter'] },
  { id: 'tteokbokki-mild', name: '궁중 떡볶이 (순한)', tier: 'low', category: 'snack', foodVector: [0.32, 0.42, 0.0, 0.12, 0.42, 0.18, 0.72], compounds: ['vanillin', 'pyrazines', 'allicin'] },
  { id: 'dried-anchovies', name: '아몬드 멸치', tier: 'low', category: 'snack', foodVector: [0.28, 0.55, 0.0, 0.05, 0.68, 0.22, 0.82], compounds: ['amines', 'pyrazines', 'vanillin'] },
  { id: 'gamja-gangjeong', name: '감자 강정', tier: 'low', category: 'snack', foodVector: [0.42, 0.32, 0.0, 0.08, 0.18, 0.28, 0.85], compounds: ['pyrazines', 'vanillin', 'furfural'] },
  { id: 'honey-butter-tteok', name: '허니버터 찹쌀칩', tier: 'low', category: 'snack', foodVector: [0.68, 0.38, 0.0, 0.0, 0.1, 0.45, 0.92], compounds: ['diacetyl', 'vanillin', 'pyrazines'] },
  { id: 'pine-nut-soup', name: '잣 죽 (소)', tier: 'low', category: 'snack', foodVector: [0.35, 0.15, 0.0, 0.0, 0.28, 0.45, 0.08], compounds: ['pinene', 'vanillin', 'pyrazines'] },
  { id: 'ssuk-tteok', name: '쑥떡', tier: 'low', category: 'snack', foodVector: [0.38, 0.08, 0.05, 0.0, 0.12, 0.1, 0.42], compounds: ['linalool', 'vanillin'], season: ['spring'] },

  // ══════════════════════════════════════════
  // 전 / 튀김 — LOW–MEDIUM, SNACK/MEAL
  // ══════════════════════════════════════════
  { id: 'haemul-pajeon', name: '해물파전', tier: 'medium', category: 'snack', foodVector: [0.1, 0.55, 0.05, 0.08, 0.62, 0.35, 0.72], compounds: ['dimethyl sulfide', 'pyrazines', 'linalool'] },
  { id: 'dongtae-jeon', name: '동태전', tier: 'low', category: 'snack', foodVector: [0.08, 0.52, 0.0, 0.05, 0.58, 0.28, 0.65], compounds: ['amines', 'pyrazines'] },
  { id: 'kimchi-jeon', name: '김치전', tier: 'low', category: 'snack', foodVector: [0.12, 0.52, 0.22, 0.42, 0.38, 0.28, 0.72], compounds: ['capsaicin', 'lactic acid', 'acetic acid', 'pyrazines'] },
  { id: 'nokdu-bindaetteok', name: '녹두 빈대떡', tier: 'medium', category: 'snack', foodVector: [0.1, 0.48, 0.0, 0.15, 0.55, 0.38, 0.75], compounds: ['pyrazines', 'amines', 'allicin'] },
  { id: 'dubu-jeon', name: '두부전', tier: 'low', category: 'snack', foodVector: [0.1, 0.42, 0.0, 0.05, 0.38, 0.22, 0.62], compounds: ['pyrazines', 'allicin'] },
  { id: 'hobak-jeon', name: '애호박전', tier: 'low', category: 'snack', foodVector: [0.12, 0.42, 0.0, 0.02, 0.28, 0.25, 0.58], compounds: ['pyrazines', 'linalool'] },
  { id: 'bugeo-jeon', name: '황태전', tier: 'low', category: 'snack', foodVector: [0.08, 0.58, 0.0, 0.05, 0.68, 0.22, 0.62], compounds: ['amines', 'pyrazines'] },
  { id: 'meat-jeon', name: '고기 완자전', tier: 'medium', category: 'snack', foodVector: [0.12, 0.5, 0.0, 0.08, 0.62, 0.42, 0.65], compounds: ['pyrazines', 'allicin', 'eugenol'] },
  { id: 'gul-jeon', name: '굴전', tier: 'medium', category: 'snack', foodVector: [0.08, 0.48, 0.0, 0.05, 0.72, 0.28, 0.62], compounds: ['dimethyl sulfide', 'pyrazines', 'amines'] },
  { id: 'gim-mari', name: '김말이 튀김', tier: 'low', category: 'snack', foodVector: [0.12, 0.52, 0.0, 0.05, 0.45, 0.32, 0.82], compounds: ['dimethyl sulfide', 'pyrazines'] },
  { id: 'odeng-twigim', name: '오뎅 튀김', tier: 'low', category: 'snack', foodVector: [0.18, 0.52, 0.0, 0.05, 0.45, 0.32, 0.82], compounds: ['amines', 'pyrazines'] },
  { id: 'sweet-potato-twigim', name: '고구마 튀김', tier: 'low', category: 'snack', foodVector: [0.52, 0.18, 0.0, 0.0, 0.18, 0.38, 0.78], compounds: ['vanillin', 'furfural', 'pyrazines'] },
  { id: 'onion-ring-gochujang', name: '양파 고추장 튀김', tier: 'low', category: 'snack', foodVector: [0.28, 0.42, 0.05, 0.38, 0.22, 0.32, 0.88], compounds: ['capsaicin', 'allicin', 'pyrazines'] },
  { id: 'saewoo-twigim', name: '새우 튀김', tier: 'medium', category: 'snack', foodVector: [0.1, 0.48, 0.0, 0.05, 0.65, 0.32, 0.85], compounds: ['amines', 'pyrazines', 'isoamyl acetate'] },
  { id: 'gaji-jeon', name: '가지전', tier: 'low', category: 'snack', foodVector: [0.12, 0.42, 0.0, 0.05, 0.32, 0.28, 0.52], compounds: ['pyrazines', 'eugenol'] },
  { id: 'kimchi-sokbak-jeon', name: '깍두기 속박이전', tier: 'low', category: 'snack', foodVector: [0.15, 0.5, 0.2, 0.38, 0.35, 0.28, 0.72], compounds: ['capsaicin', 'lactic acid', 'pyrazines'] },
  { id: 'pa-twigim', name: '파 튀김 (양파링)', tier: 'low', category: 'snack', foodVector: [0.2, 0.42, 0.0, 0.05, 0.25, 0.38, 0.88], compounds: ['allicin', 'pyrazines'] },
  { id: 'haemul-jeon-mini', name: '한입 오징어전', tier: 'low', category: 'snack', foodVector: [0.08, 0.5, 0.0, 0.05, 0.68, 0.22, 0.72], compounds: ['amines', 'pyrazines', 'dimethyl sulfide'] },
  { id: 'gamja-jeon', name: '감자전', tier: 'low', category: 'snack', foodVector: [0.12, 0.38, 0.0, 0.0, 0.18, 0.3, 0.68], compounds: ['pyrazines', 'furfural'] },
  { id: 'buchimgae-seafood', name: '모둠 해물 부침개', tier: 'medium', category: 'snack', foodVector: [0.1, 0.52, 0.05, 0.08, 0.65, 0.32, 0.72], compounds: ['dimethyl sulfide', 'pyrazines', 'amines'] },
  { id: 'lotus-twigim', name: '연근 튀김', tier: 'low', category: 'snack', foodVector: [0.15, 0.38, 0.05, 0.0, 0.22, 0.28, 0.88], compounds: ['pyrazines', 'eugenol'] },
  { id: 'dak-gangjeong', name: '닭 강정', tier: 'low', category: 'snack', foodVector: [0.45, 0.42, 0.05, 0.32, 0.45, 0.35, 0.82], compounds: ['capsaicin', 'vanillin', 'pyrazines', 'allicin'] },

  // ══════════════════════════════════════════
  // 구이 — MEDIUM–HIGH, MEAL/DELICACY
  // ══════════════════════════════════════════
  { id: 'samgyeopsal', name: '삼겹살 구이', tier: 'medium', category: 'meal', foodVector: [0.08, 0.45, 0.0, 0.05, 0.62, 0.72, 0.75], compounds: ['pyrazines', 'guaiacol', 'lactones', 'eugenol'] },
  { id: 'chadolbaeki', name: '차돌박이 구이', tier: 'medium', category: 'meal', foodVector: [0.05, 0.42, 0.0, 0.02, 0.65, 0.68, 0.72], compounds: ['pyrazines', 'guaiacol', 'lactones'] },
  { id: 'dak-gui', name: '닭갈비 구이', tier: 'medium', category: 'meal', foodVector: [0.25, 0.48, 0.0, 0.48, 0.55, 0.35, 0.72], compounds: ['capsaicin', 'pyrazines', 'allicin', 'guaiacol'] },
  { id: 'hwangtae-gui', name: '황태 구이', tier: 'medium', category: 'meal', foodVector: [0.08, 0.62, 0.0, 0.08, 0.72, 0.18, 0.65], compounds: ['amines', 'pyrazines', 'guaiacol'] },
  { id: 'godeungeo-gui', name: '고등어 구이', tier: 'low', category: 'meal', foodVector: [0.05, 0.6, 0.0, 0.05, 0.72, 0.45, 0.65], compounds: ['amines', 'pyrazines', 'guaiacol'] },
  { id: 'samchi-gui', name: '삼치 구이', tier: 'medium', category: 'meal', foodVector: [0.05, 0.55, 0.0, 0.05, 0.68, 0.38, 0.62], compounds: ['amines', 'pyrazines', 'guaiacol'] },
  { id: 'galbi-gui', name: '갈비 구이', tier: 'high', category: 'delicacy', foodVector: [0.25, 0.45, 0.0, 0.05, 0.72, 0.55, 0.75], compounds: ['vanillin', 'pyrazines', 'guaiacol', 'eugenol'] },
  { id: 'hanwoo-dupbul', name: '한우 투뿔 숯불구이', tier: 'high', category: 'delicacy', foodVector: [0.08, 0.42, 0.0, 0.02, 0.82, 0.62, 0.78], compounds: ['pyrazines', 'guaiacol', 'lactones', 'furfural'] },
  { id: 'deungsim-gui', name: '한우 등심 구이', tier: 'high', category: 'delicacy', foodVector: [0.08, 0.42, 0.0, 0.02, 0.80, 0.58, 0.75], compounds: ['pyrazines', 'guaiacol', 'lactones'] },
  { id: 'hanwoo-yannyeom', name: '양념 한우 구이', tier: 'high', category: 'delicacy', foodVector: [0.35, 0.48, 0.05, 0.15, 0.78, 0.55, 0.78], compounds: ['vanillin', 'pyrazines', 'guaiacol', 'eugenol', 'allicin'] },
  { id: 'dakgalbi-gui', name: '닭 모둠 구이', tier: 'medium', category: 'meal', foodVector: [0.22, 0.45, 0.0, 0.32, 0.52, 0.32, 0.72], compounds: ['capsaicin', 'pyrazines', 'guaiacol'] },
  { id: 'gui-jangeo', name: '장어 구이 (양념)', tier: 'high', category: 'delicacy', foodVector: [0.38, 0.48, 0.0, 0.12, 0.72, 0.55, 0.68], compounds: ['vanillin', 'pyrazines', 'guaiacol', 'lactones'] },
  { id: 'gom-jangeo', name: '갯장어 구이', tier: 'high', category: 'delicacy', foodVector: [0.12, 0.55, 0.0, 0.08, 0.75, 0.45, 0.68], compounds: ['amines', 'pyrazines', 'guaiacol'] },
  { id: 'salt-jangeo', name: '소금 장어 구이', tier: 'high', category: 'delicacy', foodVector: [0.05, 0.55, 0.0, 0.05, 0.72, 0.52, 0.68], compounds: ['amines', 'guaiacol', 'lactones'] },
  { id: 'ogolgye-gui', name: '오골계 구이', tier: 'high', category: 'delicacy', foodVector: [0.12, 0.48, 0.0, 0.05, 0.68, 0.38, 0.72], compounds: ['pyrazines', 'guaiacol', 'vanillin'] },
  { id: 'ganjang-samgyeopsal', name: '간장 삼겹살', tier: 'medium', category: 'meal', foodVector: [0.28, 0.62, 0.0, 0.05, 0.65, 0.72, 0.75], compounds: ['vanillin', 'pyrazines', 'guaiacol', 'allicin'] },
  { id: 'dwaeji-gui-kimchi', name: '돼지목살 김치 구이', tier: 'medium', category: 'meal', foodVector: [0.15, 0.55, 0.18, 0.42, 0.62, 0.62, 0.75], compounds: ['capsaicin', 'lactic acid', 'pyrazines', 'guaiacol'] },
  { id: 'bugeop-gui', name: '황태포 구이 + 마요', tier: 'low', category: 'snack', foodVector: [0.12, 0.58, 0.0, 0.08, 0.68, 0.38, 0.72], compounds: ['amines', 'pyrazines', 'diacetyl'] },
  { id: 'jumeok-gui', name: '주먹 삼겹 롤', tier: 'medium', category: 'meal', foodVector: [0.15, 0.52, 0.0, 0.12, 0.62, 0.65, 0.72], compounds: ['pyrazines', 'guaiacol', 'capsaicin', 'allicin'] },
  { id: 'salt-pork-belly', name: '소금 구이 항정살', tier: 'medium', category: 'meal', foodVector: [0.05, 0.42, 0.0, 0.0, 0.62, 0.72, 0.78], compounds: ['pyrazines', 'guaiacol', 'lactones'] },
  { id: 'salt-pork-cheek', name: '소금 구이 볼살', tier: 'medium', category: 'meal', foodVector: [0.05, 0.42, 0.0, 0.0, 0.62, 0.68, 0.78], compounds: ['pyrazines', 'guaiacol', 'lactones'] },
  { id: 'lamb-gui', name: '양갈비 구이', tier: 'high', category: 'delicacy', foodVector: [0.08, 0.45, 0.0, 0.05, 0.72, 0.55, 0.75], compounds: ['pyrazines', 'guaiacol', 'tannin', 'eugenol'] },
  { id: 'jeon-bok-gui', name: '전복 구이', tier: 'high', category: 'delicacy', foodVector: [0.12, 0.45, 0.0, 0.05, 0.82, 0.25, 0.68], compounds: ['dimethyl sulfide', 'amines', 'guaiacol'], season: ['summer', 'fall'] },
  { id: 'squid-gui', name: '오징어 통구이', tier: 'medium', category: 'meal', foodVector: [0.08, 0.55, 0.0, 0.12, 0.72, 0.18, 0.72], compounds: ['amines', 'dimethyl sulfide', 'pyrazines'] },
  { id: 'ganjang-gejang-gui', name: '간장 게장 구이', tier: 'high', category: 'delicacy', foodVector: [0.15, 0.75, 0.0, 0.05, 0.85, 0.35, 0.68], compounds: ['amines', 'pyrazines', 'vanillin', 'lactic acid'], season: ['spring', 'fall'] },
  { id: 'ssam-meatball', name: '깻잎 고기 쌈', tier: 'medium', category: 'meal', foodVector: [0.12, 0.48, 0.0, 0.12, 0.62, 0.45, 0.62], compounds: ['linalool', 'pyrazines', 'guaiacol', 'allicin'] },

  // ══════════════════════════════════════════
  // 볶음 — MEDIUM, MEAL
  // ══════════════════════════════════════════
  { id: 'jeyuk-bokkeum', name: '제육볶음', tier: 'medium', category: 'meal', foodVector: [0.18, 0.55, 0.05, 0.65, 0.58, 0.45, 0.68], compounds: ['capsaicin', 'allicin', 'pyrazines', 'guaiacol'] },
  { id: 'nakji-bokkeum', name: '낙지볶음', tier: 'medium', category: 'meal', foodVector: [0.15, 0.6, 0.05, 0.72, 0.72, 0.18, 0.72], compounds: ['capsaicin', 'amines', 'dimethyl sulfide', 'allicin'] },
  { id: 'osam-bulgogi', name: '오삼불고기', tier: 'medium', category: 'meal', foodVector: [0.18, 0.58, 0.05, 0.62, 0.68, 0.35, 0.72], compounds: ['capsaicin', 'dimethyl sulfide', 'pyrazines', 'allicin'] },
  { id: 'haemul-bokkeum', name: '해물 볶음', tier: 'medium', category: 'meal', foodVector: [0.15, 0.58, 0.05, 0.38, 0.72, 0.28, 0.68], compounds: ['dimethyl sulfide', 'capsaicin', 'amines', 'pyrazines'] },
  { id: 'japchae', name: '잡채', tier: 'medium', category: 'meal', foodVector: [0.22, 0.52, 0.0, 0.05, 0.52, 0.28, 0.55], compounds: ['vanillin', 'pyrazines', 'allicin'] },
  { id: 'tteokbokki-spicy', name: '떡볶이 (매운)', tier: 'low', category: 'snack', foodVector: [0.25, 0.45, 0.05, 0.72, 0.38, 0.18, 0.68], compounds: ['capsaicin', 'pyrazines', 'acetic acid'] },
  { id: 'kimchi-bokkeum-bap', name: '김치볶음밥', tier: 'medium', category: 'meal', foodVector: [0.18, 0.55, 0.22, 0.52, 0.42, 0.32, 0.62], compounds: ['capsaicin', 'lactic acid', 'pyrazines', 'acetic acid'] },
  { id: 'ganjang-bulgogi', name: '간장 불고기', tier: 'medium', category: 'meal', foodVector: [0.35, 0.58, 0.0, 0.08, 0.68, 0.38, 0.62], compounds: ['vanillin', 'pyrazines', 'allicin', 'guaiacol'] },
  { id: 'dakgalbi', name: '철판 닭갈비', tier: 'medium', category: 'meal', foodVector: [0.25, 0.52, 0.0, 0.58, 0.55, 0.32, 0.68], compounds: ['capsaicin', 'pyrazines', 'allicin', 'eugenol'] },
  { id: 'shrimp-paste-bokkeum', name: '새우젓 돼지 두루치기', tier: 'medium', category: 'meal', foodVector: [0.12, 0.65, 0.0, 0.35, 0.68, 0.48, 0.65], compounds: ['amines', 'capsaicin', 'pyrazines', 'acetic acid'] },
  { id: 'gochujang-beef', name: '고추장 소불고기', tier: 'medium', category: 'meal', foodVector: [0.28, 0.55, 0.05, 0.48, 0.62, 0.38, 0.62], compounds: ['capsaicin', 'vanillin', 'pyrazines', 'acetic acid'] },
  { id: 'mushroom-bokkeum', name: '버섯 볶음', tier: 'low', category: 'snack', foodVector: [0.08, 0.45, 0.0, 0.05, 0.72, 0.25, 0.58], compounds: ['pyrazines', 'guaiacol', 'eugenol'] },
  { id: 'dubu-kimchi', name: '두부 김치', tier: 'medium', category: 'meal', foodVector: [0.12, 0.55, 0.22, 0.48, 0.52, 0.28, 0.62], compounds: ['capsaicin', 'lactic acid', 'pyrazines', 'acetic acid'] },
  { id: 'squid-bokkeum', name: '오징어 볶음', tier: 'medium', category: 'meal', foodVector: [0.18, 0.58, 0.05, 0.62, 0.72, 0.22, 0.72], compounds: ['capsaicin', 'amines', 'dimethyl sulfide', 'pyrazines'] },
  { id: 'yeonnip-bap-bokkeum', name: '연잎 밥 볶음', tier: 'medium', category: 'meal', foodVector: [0.18, 0.45, 0.0, 0.08, 0.38, 0.22, 0.55], compounds: ['linalool', 'pyrazines', 'vanillin'] },
  { id: 'anchovies-stir', name: '진미채 볶음', tier: 'low', category: 'snack', foodVector: [0.28, 0.62, 0.0, 0.08, 0.72, 0.22, 0.72], compounds: ['amines', 'pyrazines', 'vanillin'] },
  { id: 'kongnamul-bokkeum', name: '콩나물 볶음', tier: 'low', category: 'snack', foodVector: [0.1, 0.48, 0.05, 0.18, 0.32, 0.18, 0.65], compounds: ['pyrazines', 'allicin'] },
  { id: 'gamja-jorim', name: '감자 조림', tier: 'low', category: 'snack', foodVector: [0.38, 0.52, 0.0, 0.08, 0.22, 0.15, 0.55], compounds: ['vanillin', 'pyrazines', 'allicin'] },
  { id: 'beansprout-bibim', name: '숙주 비빔', tier: 'low', category: 'snack', foodVector: [0.1, 0.42, 0.08, 0.15, 0.28, 0.12, 0.55], compounds: ['allicin', 'linalool'] },

  // ══════════════════════════════════════════
  // 찜 / 조림 / 보쌈 — MEDIUM–HIGH, MEAL/DELICACY
  // ══════════════════════════════════════════
  { id: 'galbijjim', name: '궁중 갈비찜', tier: 'high', category: 'delicacy', foodVector: [0.42, 0.48, 0.0, 0.08, 0.75, 0.52, 0.62], compounds: ['vanillin', 'lactones', 'eugenol', 'pyrazines'] },
  { id: 'agwi-jjim', name: '아귀찜', tier: 'medium', category: 'meal', foodVector: [0.15, 0.58, 0.05, 0.72, 0.72, 0.28, 0.68], compounds: ['capsaicin', 'amines', 'pyrazines', 'allicin'] },
  { id: 'bossam', name: '보쌈', tier: 'medium', category: 'meal', foodVector: [0.08, 0.52, 0.0, 0.05, 0.62, 0.55, 0.58], compounds: ['pyrazines', 'eugenol', 'allicin'] },
  { id: 'jokbal', name: '족발', tier: 'medium', category: 'meal', foodVector: [0.32, 0.58, 0.0, 0.05, 0.72, 0.48, 0.62], compounds: ['vanillin', 'pyrazines', 'lactones', 'allicin'] },
  { id: 'ganjang-gejang', name: '간장 게장', tier: 'high', category: 'delicacy', foodVector: [0.12, 0.78, 0.0, 0.05, 0.88, 0.32, 0.62], compounds: ['amines', 'pyrazines', 'vanillin', 'dimethyl sulfide'], season: ['spring', 'fall'] },
  { id: 'yangnyeom-gejang', name: '양념 게장', tier: 'high', category: 'delicacy', foodVector: [0.18, 0.62, 0.05, 0.52, 0.82, 0.32, 0.62], compounds: ['capsaicin', 'amines', 'pyrazines', 'dimethyl sulfide'], season: ['spring', 'fall'] },
  { id: 'hongeo-samhap', name: '홍어 삼합', tier: 'high', category: 'delicacy', foodVector: [0.05, 0.58, 0.15, 0.08, 0.88, 0.48, 0.55], compounds: ['ammonia', 'phenol', 'lactic acid', 'guaiacol'] },
  { id: 'kkotgejjim', name: '꽃게찜', tier: 'high', category: 'delicacy', foodVector: [0.08, 0.55, 0.0, 0.05, 0.85, 0.28, 0.68], compounds: ['amines', 'dimethyl sulfide', 'pyrazines'], season: ['spring', 'fall'] },
  { id: 'daegejjim', name: '대게찜', tier: 'high', category: 'delicacy', foodVector: [0.08, 0.52, 0.0, 0.02, 0.88, 0.22, 0.65], compounds: ['amines', 'dimethyl sulfide', 'pyrazines'], season: ['winter'] },
  { id: 'lobster-gui', name: '랍스터 버터구이', tier: 'high', category: 'delicacy', foodVector: [0.1, 0.52, 0.0, 0.02, 0.85, 0.48, 0.65], compounds: ['diacetyl', 'amines', 'dimethyl sulfide', 'pyrazines'] },
  { id: 'bulgogi-jjim', name: '불고기 찜', tier: 'medium', category: 'meal', foodVector: [0.35, 0.52, 0.0, 0.08, 0.68, 0.42, 0.58], compounds: ['vanillin', 'pyrazines', 'allicin', 'eugenol'] },
  { id: 'dak-jjim', name: '닭 찜', tier: 'medium', category: 'meal', foodVector: [0.28, 0.52, 0.0, 0.28, 0.58, 0.32, 0.58], compounds: ['capsaicin', 'pyrazines', 'allicin', 'eugenol'] },
  { id: 'eomuk-jorim', name: '어묵 조림', tier: 'low', category: 'snack', foodVector: [0.25, 0.58, 0.0, 0.15, 0.48, 0.22, 0.55], compounds: ['amines', 'capsaicin', 'pyrazines'] },
  { id: 'godeungeo-jorim', name: '고등어 조림', tier: 'low', category: 'meal', foodVector: [0.18, 0.65, 0.05, 0.28, 0.72, 0.42, 0.55], compounds: ['amines', 'capsaicin', 'pyrazines', 'allicin'] },
  { id: 'daeguri-jjim', name: '대구리 찜', tier: 'medium', category: 'meal', foodVector: [0.1, 0.55, 0.0, 0.22, 0.68, 0.28, 0.58], compounds: ['amines', 'capsaicin', 'pyrazines'] },
  { id: 'jangeo-tang', name: '장어 찜', tier: 'high', category: 'delicacy', foodVector: [0.32, 0.52, 0.0, 0.12, 0.75, 0.52, 0.62], compounds: ['vanillin', 'pyrazines', 'lactones', 'guaiacol'] },
  { id: 'sundae-jjim', name: '순대 야채찜', tier: 'medium', category: 'meal', foodVector: [0.12, 0.58, 0.0, 0.18, 0.65, 0.45, 0.62], compounds: ['amines', 'pyrazines', 'allicin', 'eugenol'] },
  { id: 'haemul-jjim', name: '해물 찜 (모둠)', tier: 'medium', category: 'meal', foodVector: [0.15, 0.58, 0.05, 0.38, 0.78, 0.28, 0.62], compounds: ['capsaicin', 'amines', 'dimethyl sulfide', 'pyrazines'] },
  { id: 'tofu-jjim', name: '두부조림', tier: 'low', category: 'snack', foodVector: [0.22, 0.52, 0.0, 0.32, 0.38, 0.25, 0.55], compounds: ['capsaicin', 'pyrazines', 'allicin'] },
  { id: 'galbi-tang', name: '갈비탕 건더기', tier: 'high', category: 'delicacy', foodVector: [0.08, 0.48, 0.0, 0.02, 0.78, 0.55, 0.62], compounds: ['pyrazines', 'lactones', 'vanillin'] },
  { id: 'sigeumchi-muchim', name: '시금치 무침', tier: 'low', category: 'snack', foodVector: [0.08, 0.42, 0.05, 0.08, 0.28, 0.15, 0.38], compounds: ['allicin', 'linalool'] },
  { id: 'ganjang-biji-jjigae', name: '비지 찌개 건더기', tier: 'low', category: 'snack', foodVector: [0.12, 0.52, 0.05, 0.22, 0.48, 0.28, 0.35], compounds: ['pyrazines', 'capsaicin', 'lactic acid'] },

  // ══════════════════════════════════════════
  // 탕 / 국 — MEDIUM, MEAL
  // ══════════════════════════════════════════
  { id: 'haejangguk', name: '콩나물 해장국', tier: 'medium', category: 'meal', foodVector: [0.08, 0.58, 0.05, 0.28, 0.62, 0.28, 0.35], compounds: ['capsaicin', 'pyrazines', 'allicin'] },
  { id: 'sundaeguk', name: '순대국밥', tier: 'medium', category: 'meal', foodVector: [0.08, 0.52, 0.0, 0.22, 0.68, 0.45, 0.35], compounds: ['amines', 'pyrazines', 'eugenol', 'allicin'] },
  { id: 'gomtang', name: '곰탕', tier: 'high', category: 'delicacy', foodVector: [0.05, 0.45, 0.0, 0.02, 0.82, 0.48, 0.28], compounds: ['pyrazines', 'lactones', 'amines'] },
  { id: 'samgyetang', name: '삼계탕', tier: 'medium', category: 'meal', foodVector: [0.18, 0.42, 0.0, 0.08, 0.68, 0.35, 0.32], compounds: ['pyrazines', 'gingerol', 'allicin', 'vanillin'], season: ['summer'] },
  { id: 'yukgaejang', name: '육개장', tier: 'medium', category: 'meal', foodVector: [0.08, 0.58, 0.0, 0.68, 0.72, 0.38, 0.38], compounds: ['capsaicin', 'pyrazines', 'allicin', 'guaiacol'] },
  { id: 'doenjang-jjigae', name: '된장찌개', tier: 'low', category: 'meal', foodVector: [0.08, 0.58, 0.05, 0.12, 0.78, 0.22, 0.28], compounds: ['pyrazines', 'lactic acid', 'allicin', 'acetic acid'] },
  { id: 'sundubu-jjigae', name: '순두부찌개', tier: 'low', category: 'meal', foodVector: [0.1, 0.55, 0.05, 0.55, 0.62, 0.28, 0.22], compounds: ['capsaicin', 'amines', 'pyrazines', 'allicin'] },
  { id: 'kimchi-jjigae', name: '김치찌개', tier: 'low', category: 'meal', foodVector: [0.12, 0.58, 0.22, 0.52, 0.62, 0.38, 0.35], compounds: ['capsaicin', 'lactic acid', 'acetic acid', 'pyrazines'] },
  { id: 'budae-jjigae', name: '부대찌개', tier: 'medium', category: 'meal', foodVector: [0.22, 0.62, 0.08, 0.42, 0.62, 0.42, 0.55], compounds: ['capsaicin', 'pyrazines', 'amines', 'vanillin'] },
  { id: 'haemul-tang', name: '해물탕', tier: 'medium', category: 'meal', foodVector: [0.12, 0.58, 0.05, 0.48, 0.78, 0.28, 0.35], compounds: ['capsaicin', 'amines', 'dimethyl sulfide', 'pyrazines'] },
  { id: 'ganjang-guk', name: '북어 국', tier: 'low', category: 'meal', foodVector: [0.05, 0.52, 0.0, 0.05, 0.65, 0.18, 0.25], compounds: ['amines', 'pyrazines', 'allicin'] },
  { id: 'kkori-gomtang', name: '꼬리곰탕', tier: 'high', category: 'delicacy', foodVector: [0.05, 0.45, 0.0, 0.02, 0.85, 0.52, 0.28], compounds: ['pyrazines', 'lactones', 'amines', 'vanillin'] },
  { id: 'jeyuk-guk', name: '돼지 수육 국', tier: 'medium', category: 'meal', foodVector: [0.08, 0.52, 0.0, 0.08, 0.65, 0.45, 0.32], compounds: ['pyrazines', 'eugenol', 'allicin'] },
  { id: 'chueo-tang', name: '추어탕', tier: 'medium', category: 'meal', foodVector: [0.08, 0.55, 0.0, 0.18, 0.72, 0.32, 0.32], compounds: ['amines', 'capsaicin', 'pyrazines', 'eugenol'] },
  { id: 'gim-guk', name: '미역국', tier: 'low', category: 'meal', foodVector: [0.05, 0.5, 0.02, 0.02, 0.58, 0.18, 0.25], compounds: ['dimethyl sulfide', 'pyrazines', 'allicin'] },

  // ══════════════════════════════════════════
  // 발효 / 숙성 — MEDIUM–HIGH, MEAL/DELICACY
  // ══════════════════════════════════════════
  { id: 'ggakdugi', name: '깍두기', tier: 'low', category: 'snack', foodVector: [0.12, 0.55, 0.28, 0.48, 0.32, 0.08, 0.72], compounds: ['capsaicin', 'lactic acid', 'acetic acid', 'allicin'] },
  { id: 'baechu-kimchi', name: '배추 김치', tier: 'low', category: 'snack', foodVector: [0.12, 0.52, 0.3, 0.48, 0.38, 0.08, 0.65], compounds: ['capsaicin', 'lactic acid', 'acetic acid', 'allicin', 'dimethyl sulfide'] },
  { id: 'oi-sobagi', name: '오이 소박이', tier: 'low', category: 'snack', foodVector: [0.1, 0.52, 0.32, 0.42, 0.28, 0.08, 0.72], compounds: ['capsaicin', 'lactic acid', 'acetic acid', 'allicin'], season: ['summer'] },
  { id: 'gat-kimchi', name: '갓 김치', tier: 'low', category: 'snack', foodVector: [0.1, 0.52, 0.28, 0.45, 0.32, 0.08, 0.68], compounds: ['capsaicin', 'lactic acid', 'allicin'], season: ['fall', 'winter'] },
  { id: 'nabak-kimchi', name: '나박 김치', tier: 'low', category: 'snack', foodVector: [0.15, 0.42, 0.25, 0.18, 0.22, 0.05, 0.55], compounds: ['lactic acid', 'acetic acid', 'limonene'], season: ['spring'] },
  { id: 'chonggak-kimchi', name: '총각 김치', tier: 'low', category: 'snack', foodVector: [0.1, 0.55, 0.28, 0.45, 0.38, 0.08, 0.72], compounds: ['capsaicin', 'lactic acid', 'acetic acid', 'allicin'] },
  { id: 'doenjang-raw', name: '된장 안주 (쌈)', tier: 'low', category: 'snack', foodVector: [0.05, 0.75, 0.08, 0.05, 0.85, 0.15, 0.28], compounds: ['lactic acid', 'acetic acid', 'pyrazines'] },
  { id: 'ganjang-aged', name: '묵은 간장 나물', tier: 'low', category: 'snack', foodVector: [0.12, 0.72, 0.05, 0.05, 0.78, 0.15, 0.42], compounds: ['vanillin', 'pyrazines', 'lactic acid', 'acetic acid'] },
  { id: 'gochujang-raw', name: '고추장 안주 (쌈)', tier: 'low', category: 'snack', foodVector: [0.25, 0.55, 0.1, 0.65, 0.62, 0.12, 0.35], compounds: ['capsaicin', 'acetic acid', 'pyrazines', 'lactic acid'] },
  { id: 'jeotgal-squid', name: '오징어 젓갈', tier: 'medium', category: 'snack', foodVector: [0.08, 0.78, 0.05, 0.48, 0.85, 0.18, 0.62], compounds: ['amines', 'capsaicin', 'acetic acid', 'lactic acid'] },
  { id: 'myeongnan', name: '명란젓', tier: 'medium', category: 'snack', foodVector: [0.08, 0.75, 0.05, 0.42, 0.85, 0.28, 0.55], compounds: ['amines', 'capsaicin', 'acetic acid', 'lactic acid'] },
  { id: 'gul-jeotgal', name: '굴 젓갈', tier: 'medium', category: 'snack', foodVector: [0.08, 0.72, 0.1, 0.18, 0.88, 0.22, 0.48], compounds: ['amines', 'dimethyl sulfide', 'lactic acid', 'acetic acid'], season: ['winter'] },
  { id: 'ojingeo-jeotgal', name: '어리굴젓', tier: 'medium', category: 'snack', foodVector: [0.08, 0.75, 0.1, 0.22, 0.88, 0.22, 0.52], compounds: ['amines', 'dimethyl sulfide', 'capsaicin', 'acetic acid'], season: ['winter'] },
  { id: 'mukeunji', name: '묵은지 (2년 이상)', tier: 'medium', category: 'snack', foodVector: [0.08, 0.55, 0.45, 0.38, 0.42, 0.08, 0.62], compounds: ['capsaicin', 'lactic acid', 'acetic acid', 'allicin'] },
  { id: 'gaejang-ganjang', name: '갑오징어 간장 절임', tier: 'high', category: 'delicacy', foodVector: [0.1, 0.78, 0.05, 0.05, 0.88, 0.22, 0.62], compounds: ['amines', 'vanillin', 'pyrazines', 'dimethyl sulfide'] },
  { id: 'sikhye-grain', name: '보리 식초 절임 채소', tier: 'low', category: 'snack', foodVector: [0.08, 0.42, 0.48, 0.05, 0.18, 0.05, 0.62], compounds: ['acetic acid', 'lactic acid', 'limonene'] },
  { id: 'chongkukjang', name: '청국장 두부', tier: 'medium', category: 'meal', foodVector: [0.08, 0.62, 0.08, 0.12, 0.85, 0.22, 0.35], compounds: ['pyrazines', 'acetic acid', 'lactic acid', 'amines'] },
  { id: 'yeomso-cheese', name: '염소 치즈 (국산)', tier: 'high', category: 'delicacy', foodVector: [0.1, 0.55, 0.08, 0.02, 0.72, 0.52, 0.32], compounds: ['diacetyl', 'lactic acid', 'vanillin', 'butyric acid'] },
  { id: 'smoked-duck', name: '훈제 오리', tier: 'medium', category: 'meal', foodVector: [0.08, 0.55, 0.0, 0.05, 0.68, 0.52, 0.68], compounds: ['guaiacol', 'syringol', 'phenol', 'pyrazines'] },
  { id: 'smoked-cheese', name: '훈제 치즈', tier: 'low', category: 'snack', foodVector: [0.08, 0.55, 0.0, 0.0, 0.58, 0.48, 0.45], compounds: ['guaiacol', 'syringol', 'phenol', 'diacetyl'] },

  // ══════════════════════════════════════════
  // 회 / 해산물 — MEDIUM–HIGH, MEAL/DELICACY
  // ══════════════════════════════════════════
  { id: 'gwang-eo-hoe', name: '광어회', tier: 'high', category: 'delicacy', foodVector: [0.05, 0.38, 0.0, 0.02, 0.68, 0.18, 0.45], compounds: ['amines', 'dimethyl sulfide', 'linalool'] },
  { id: 'chamchi-hoe', name: '참치회 (뱃살)', tier: 'high', category: 'delicacy', foodVector: [0.05, 0.38, 0.0, 0.02, 0.72, 0.48, 0.35], compounds: ['amines', 'dimethyl sulfide', 'lactones'] },
  { id: 'chamchi-cho', name: '참치 초밥', tier: 'high', category: 'delicacy', foodVector: [0.22, 0.42, 0.22, 0.02, 0.68, 0.38, 0.42], compounds: ['amines', 'acetic acid', 'dimethyl sulfide'] },
  { id: 'minuh-hoe', name: '민어회', tier: 'high', category: 'delicacy', foodVector: [0.05, 0.38, 0.0, 0.02, 0.72, 0.28, 0.45], compounds: ['amines', 'dimethyl sulfide', 'linalool'], season: ['summer'] },
  { id: 'haemul-sashimi', name: '모듬 회 (해산물)', tier: 'high', category: 'delicacy', foodVector: [0.05, 0.42, 0.05, 0.05, 0.75, 0.28, 0.45], compounds: ['amines', 'dimethyl sulfide', 'pyrazines'] },
  { id: 'hwangshinghae', name: '황석어회', tier: 'high', category: 'delicacy', foodVector: [0.05, 0.42, 0.0, 0.02, 0.78, 0.28, 0.45], compounds: ['amines', 'dimethyl sulfide', 'linalool'], season: ['spring'] },
  { id: 'galchi-hoe', name: '갈치회', tier: 'high', category: 'delicacy', foodVector: [0.05, 0.42, 0.0, 0.02, 0.72, 0.38, 0.45], compounds: ['amines', 'dimethyl sulfide', 'lactones'] },
  { id: 'saewoo-hoe', name: '새우 초밥', tier: 'medium', category: 'meal', foodVector: [0.18, 0.48, 0.18, 0.02, 0.68, 0.18, 0.48], compounds: ['amines', 'acetic acid', 'isoamyl acetate'] },
  { id: 'yujaponzu-oyster', name: '유자 폰즈 생굴', tier: 'medium', category: 'delicacy', foodVector: [0.08, 0.45, 0.22, 0.02, 0.78, 0.22, 0.32], compounds: ['amines', 'dimethyl sulfide', 'limonene', 'linalool'], season: ['winter'] },
  { id: 'raw-octopus', name: '산낙지 (살아있는)', tier: 'high', category: 'delicacy', foodVector: [0.05, 0.45, 0.0, 0.05, 0.72, 0.15, 0.68], compounds: ['amines', 'dimethyl sulfide', 'allicin'] },
  { id: 'miyeok-salad', name: '미역 초무침', tier: 'low', category: 'snack', foodVector: [0.15, 0.45, 0.42, 0.08, 0.38, 0.08, 0.38], compounds: ['acetic acid', 'dimethyl sulfide', 'limonene'] },
  { id: 'saebyou-bokkeum', name: '볶음 새우', tier: 'medium', category: 'meal', foodVector: [0.12, 0.58, 0.0, 0.22, 0.72, 0.28, 0.72], compounds: ['amines', 'capsaicin', 'pyrazines', 'isoamyl acetate'] },
  { id: 'muneo-suhoe', name: '문어 숙회', tier: 'medium', category: 'meal', foodVector: [0.08, 0.48, 0.08, 0.02, 0.72, 0.18, 0.58], compounds: ['amines', 'dimethyl sulfide', 'linalool'] },
  { id: 'cheonyeo-muchim', name: '해삼 초무침', tier: 'high', category: 'delicacy', foodVector: [0.08, 0.45, 0.32, 0.05, 0.72, 0.12, 0.48], compounds: ['amines', 'dimethyl sulfide', 'acetic acid', 'limonene'], season: ['winter'] },
  { id: 'jeonbok-juk-topping', name: '전복 내장 안주', tier: 'high', category: 'delicacy', foodVector: [0.05, 0.5, 0.0, 0.02, 0.88, 0.28, 0.42], compounds: ['amines', 'dimethyl sulfide', 'pyrazines'], season: ['fall'] },
  { id: 'guljeon-ganjang', name: '굴 간장 절임', tier: 'high', category: 'delicacy', foodVector: [0.12, 0.72, 0.0, 0.05, 0.85, 0.28, 0.42], compounds: ['amines', 'dimethyl sulfide', 'vanillin', 'pyrazines'], season: ['winter'] },
  { id: 'halibut-sashimi', name: '넙치 우스즈쿠리', tier: 'high', category: 'delicacy', foodVector: [0.05, 0.38, 0.0, 0.02, 0.68, 0.15, 0.38], compounds: ['amines', 'dimethyl sulfide', 'linalool'] },
  { id: 'squid-sohoe', name: '오징어 소회 (셰프)', tier: 'medium', category: 'delicacy', foodVector: [0.1, 0.42, 0.12, 0.05, 0.72, 0.15, 0.55], compounds: ['amines', 'dimethyl sulfide', 'limonene'] },
  { id: 'cuttlefish-salted', name: '갑오징어 소금 안주', tier: 'medium', category: 'snack', foodVector: [0.05, 0.55, 0.0, 0.05, 0.78, 0.12, 0.72], compounds: ['amines', 'dimethyl sulfide', 'pyrazines'] },

  // ══════════════════════════════════════════
  // 면 / 밥 / 기타 — LOW–HIGH, MEAL
  // ══════════════════════════════════════════
  { id: 'bibimbap', name: '비빔밥', tier: 'medium', category: 'meal', foodVector: [0.18, 0.48, 0.12, 0.32, 0.52, 0.22, 0.55], compounds: ['capsaicin', 'pyrazines', 'linalool', 'allicin'] },
  { id: 'dosolbibim', name: '돌솥 비빔밥', tier: 'medium', category: 'meal', foodVector: [0.18, 0.52, 0.08, 0.28, 0.55, 0.28, 0.72], compounds: ['capsaicin', 'pyrazines', 'furfural', 'allicin'] },
  { id: 'naengmyeon', name: '물냉면', tier: 'medium', category: 'meal', foodVector: [0.12, 0.45, 0.35, 0.15, 0.38, 0.12, 0.62], compounds: ['acetic acid', 'lactic acid', 'allicin', 'limonene'] },
  { id: 'bibim-naengmyeon', name: '비빔냉면', tier: 'medium', category: 'meal', foodVector: [0.22, 0.5, 0.22, 0.52, 0.42, 0.18, 0.65], compounds: ['capsaicin', 'acetic acid', 'lactic acid', 'pyrazines'] },
  { id: 'kongguksu', name: '콩국수', tier: 'medium', category: 'meal', foodVector: [0.15, 0.42, 0.0, 0.0, 0.48, 0.35, 0.38], compounds: ['pyrazines', 'vanillin', 'linalool'], season: ['summer'] },
  { id: 'kalguksu', name: '칼국수', tier: 'medium', category: 'meal', foodVector: [0.1, 0.52, 0.0, 0.08, 0.62, 0.25, 0.38], compounds: ['amines', 'pyrazines', 'allicin'] },
  { id: 'ganjang-galbi-bap', name: '간장 갈비 덮밥', tier: 'medium', category: 'meal', foodVector: [0.32, 0.55, 0.0, 0.08, 0.68, 0.45, 0.55], compounds: ['vanillin', 'pyrazines', 'allicin', 'guaiacol'] },
  { id: 'gimbap', name: '김밥 (참치)', tier: 'low', category: 'snack', foodVector: [0.18, 0.48, 0.05, 0.05, 0.48, 0.25, 0.52], compounds: ['dimethyl sulfide', 'pyrazines', 'allicin'] },
  { id: 'yukhoe-bap', name: '육회비빔밥', tier: 'high', category: 'delicacy', foodVector: [0.12, 0.5, 0.1, 0.2, 0.75, 0.38, 0.58], compounds: ['amines', 'pyrazines', 'allicin', 'linalool'] },
  { id: 'jeonbok-juk', name: '전복죽', tier: 'high', category: 'delicacy', foodVector: [0.1, 0.45, 0.0, 0.02, 0.78, 0.28, 0.15], compounds: ['amines', 'dimethyl sulfide', 'pyrazines', 'allicin'], season: ['fall'] },
  { id: 'pine-nut-juk', name: '잣죽', tier: 'high', category: 'delicacy', foodVector: [0.28, 0.18, 0.0, 0.0, 0.28, 0.42, 0.1], compounds: ['pinene', 'vanillin', 'pyrazines'] },
  { id: 'yukgaejang-bap', name: '육개장 밥', tier: 'medium', category: 'meal', foodVector: [0.1, 0.58, 0.0, 0.65, 0.72, 0.38, 0.45], compounds: ['capsaicin', 'pyrazines', 'allicin', 'guaiacol'] },

  // ══════════════════════════════════════════
  // 고급 별미 — HIGH, DELICACY
  // ══════════════════════════════════════════
  { id: 'yukhoe', name: '한우 육회', tier: 'high', category: 'delicacy', foodVector: [0.15, 0.48, 0.1, 0.15, 0.82, 0.38, 0.42], compounds: ['amines', 'pyrazines', 'allicin', 'linalool'] },
  { id: 'ganjang-abalone', name: '전복 간장 조림', tier: 'high', category: 'delicacy', foodVector: [0.22, 0.65, 0.0, 0.05, 0.85, 0.32, 0.62], compounds: ['amines', 'dimethyl sulfide', 'vanillin', 'pyrazines'] },
  { id: 'gansik-octopus', name: '낙지 세발 간식', tier: 'high', category: 'delicacy', foodVector: [0.08, 0.52, 0.0, 0.05, 0.78, 0.18, 0.65], compounds: ['amines', 'dimethyl sulfide', 'allicin', 'pyrazines'] },
  { id: 'grilled-foie', name: '오리 간 구이', tier: 'high', category: 'delicacy', foodVector: [0.12, 0.48, 0.0, 0.05, 0.82, 0.58, 0.58], compounds: ['pyrazines', 'guaiacol', 'lactones', 'vanillin'] },
  { id: 'truffle-jeon', name: '트러플 닭알 전', tier: 'high', category: 'delicacy', foodVector: [0.12, 0.45, 0.0, 0.02, 0.78, 0.48, 0.62], compounds: ['dimethyl sulfide', 'pyrazines', 'eugenol', 'tannin'] },
  { id: 'hanwoo-tartare', name: '한우 타르타르', tier: 'high', category: 'delicacy', foodVector: [0.08, 0.48, 0.12, 0.12, 0.82, 0.38, 0.38], compounds: ['amines', 'pyrazines', 'allicin', 'linalool'] },
  { id: 'aged-galbi', name: '드라이에이징 갈비', tier: 'high', category: 'delicacy', foodVector: [0.1, 0.45, 0.0, 0.02, 0.88, 0.58, 0.75], compounds: ['pyrazines', 'guaiacol', 'lactones', 'amines'] },
  { id: 'black-pork-premium', name: '제주 흑돼지 구이', tier: 'high', category: 'delicacy', foodVector: [0.08, 0.48, 0.0, 0.05, 0.72, 0.68, 0.78], compounds: ['pyrazines', 'guaiacol', 'lactones', 'eugenol'] },
  { id: 'myeongtae-roe', name: '명태 알 찜', tier: 'high', category: 'delicacy', foodVector: [0.08, 0.68, 0.0, 0.18, 0.88, 0.35, 0.42], compounds: ['amines', 'capsaicin', 'pyrazines', 'lactic acid'] },
  { id: 'sea-urchin-bibim', name: '성게알 비빔', tier: 'high', category: 'delicacy', foodVector: [0.12, 0.48, 0.12, 0.05, 0.88, 0.38, 0.45], compounds: ['amines', 'dimethyl sulfide', 'pyrazines', 'acetic acid'], season: ['spring', 'summer'] },
  { id: 'soy-braised-head', name: '돼지머리 편육', tier: 'medium', category: 'meal', foodVector: [0.15, 0.55, 0.0, 0.05, 0.72, 0.52, 0.55], compounds: ['pyrazines', 'vanillin', 'lactones', 'allicin'] },
  { id: 'jeonbok-butter', name: '전복 버터 소테', tier: 'high', category: 'delicacy', foodVector: [0.12, 0.48, 0.0, 0.02, 0.85, 0.48, 0.62], compounds: ['diacetyl', 'amines', 'dimethyl sulfide', 'pyrazines'] },
  { id: 'chamdom-hoe', name: '참돔 薄造り', tier: 'high', category: 'delicacy', foodVector: [0.05, 0.38, 0.0, 0.02, 0.72, 0.22, 0.42], compounds: ['amines', 'dimethyl sulfide', 'linalool'] },
  { id: 'ikura-jeonbok', name: '전복 이쿠라 덮밥', tier: 'high', category: 'delicacy', foodVector: [0.18, 0.55, 0.05, 0.02, 0.88, 0.42, 0.45], compounds: ['amines', 'dimethyl sulfide', 'acetic acid', 'pyrazines'] },
  { id: 'ginseng-chicken-premium', name: '인삼 오리 요리', tier: 'high', category: 'delicacy', foodVector: [0.12, 0.45, 0.0, 0.08, 0.72, 0.42, 0.45], compounds: ['ginsenoside', 'pyrazines', 'eugenol', 'vanillin'] },

  // ══════════════════════════════════════════
  // 추가 — 다양성 보강
  // ══════════════════════════════════════════
  // 쌈 / 채소
  { id: 'ssam-pork-leaf', name: '삼겹살 깻잎쌈', tier: 'medium', category: 'meal', foodVector: [0.08, 0.48, 0.0, 0.12, 0.62, 0.68, 0.62], compounds: ['linalool', 'pyrazines', 'guaiacol', 'allicin'] },
  { id: 'perilla-muchim', name: '깻잎 무침', tier: 'low', category: 'snack', foodVector: [0.08, 0.52, 0.08, 0.12, 0.28, 0.18, 0.45], compounds: ['linalool', 'allicin', 'acetic acid'] },
  { id: 'namul-3-color', name: '삼색 나물', tier: 'low', category: 'snack', foodVector: [0.1, 0.45, 0.05, 0.08, 0.32, 0.18, 0.45], compounds: ['allicin', 'linalool', 'pyrazines'] },
  { id: 'brocoli-muchim', name: '브로콜리 겨자 무침', tier: 'low', category: 'snack', foodVector: [0.08, 0.42, 0.08, 0.18, 0.28, 0.12, 0.55], compounds: ['allyl isothiocyanate', 'linalool', 'allicin'] },
  { id: 'tofu-soy', name: '두부 간장 조림', tier: 'low', category: 'snack', foodVector: [0.25, 0.62, 0.0, 0.08, 0.42, 0.22, 0.52], compounds: ['vanillin', 'pyrazines', 'allicin'] },
  { id: 'lotus-jorim', name: '연근 조림', tier: 'low', category: 'snack', foodVector: [0.35, 0.48, 0.0, 0.05, 0.22, 0.12, 0.72], compounds: ['eugenol', 'vanillin', 'pyrazines'], season: ['fall'] },
  { id: 'doraji-naengchae', name: '도라지 냉채', tier: 'low', category: 'snack', foodVector: [0.15, 0.38, 0.28, 0.05, 0.18, 0.08, 0.55], compounds: ['linalool', 'acetic acid', 'allicin'], season: ['spring'] },

  // 해물 추가
  { id: 'jeon-bok-rice', name: '전복 솥밥', tier: 'high', category: 'delicacy', foodVector: [0.15, 0.48, 0.0, 0.02, 0.82, 0.32, 0.42], compounds: ['amines', 'dimethyl sulfide', 'vanillin', 'pyrazines'], season: ['fall'] },
  { id: 'snow-crab-raw', name: '생 대게살 안주', tier: 'high', category: 'delicacy', foodVector: [0.08, 0.45, 0.0, 0.02, 0.85, 0.18, 0.45], compounds: ['amines', 'dimethyl sulfide', 'linalool'], season: ['winter'] },
  { id: 'lobster-bisque', name: '랍스터 비스크 샷', tier: 'high', category: 'delicacy', foodVector: [0.12, 0.52, 0.0, 0.05, 0.82, 0.52, 0.12], compounds: ['amines', 'diacetyl', 'pyrazines', 'dimethyl sulfide'] },
  { id: 'hairtail-gui', name: '갈치 소금 구이', tier: 'medium', category: 'meal', foodVector: [0.05, 0.58, 0.0, 0.05, 0.72, 0.42, 0.62], compounds: ['amines', 'guaiacol', 'pyrazines'] },
  { id: 'gopchang-gui', name: '곱창 구이', tier: 'medium', category: 'meal', foodVector: [0.08, 0.55, 0.0, 0.12, 0.72, 0.62, 0.72], compounds: ['amines', 'pyrazines', 'guaiacol', 'eugenol'] },
  { id: 'daechang-gui', name: '대창 구이', tier: 'medium', category: 'meal', foodVector: [0.08, 0.52, 0.0, 0.08, 0.68, 0.72, 0.72], compounds: ['amines', 'pyrazines', 'guaiacol', 'lactones'] },
  { id: 'makchang-gui', name: '막창 구이', tier: 'medium', category: 'meal', foodVector: [0.1, 0.52, 0.0, 0.15, 0.68, 0.68, 0.72], compounds: ['amines', 'pyrazines', 'guaiacol'] },
  { id: 'haemul-pajeon-xl', name: '대형 해물파전', tier: 'medium', category: 'meal', foodVector: [0.12, 0.55, 0.05, 0.1, 0.65, 0.38, 0.72], compounds: ['dimethyl sulfide', 'pyrazines', 'amines', 'allicin'] },

  // 육류 추가
  { id: 'ssambap-roll', name: '쌈밥 롤 모둠', tier: 'medium', category: 'meal', foodVector: [0.18, 0.48, 0.05, 0.18, 0.55, 0.38, 0.55], compounds: ['linalool', 'pyrazines', 'capsaicin', 'allicin'] },
  { id: 'gamasal-gui', name: '가마살 구이', tier: 'high', category: 'delicacy', foodVector: [0.05, 0.42, 0.0, 0.02, 0.72, 0.65, 0.78], compounds: ['pyrazines', 'guaiacol', 'lactones'] },
  { id: 'usamgyeopsal', name: '우삼겹 구이', tier: 'medium', category: 'meal', foodVector: [0.05, 0.42, 0.0, 0.02, 0.68, 0.72, 0.78], compounds: ['pyrazines', 'guaiacol', 'lactones'] },
  { id: 'pork-shoulder-gui', name: '돼지 앞다리 구이', tier: 'medium', category: 'meal', foodVector: [0.08, 0.45, 0.0, 0.05, 0.62, 0.58, 0.75], compounds: ['pyrazines', 'guaiacol', 'lactones'] },
  { id: 'ganjang-hanwoo-jjim', name: '한우 찜 간장 소스', tier: 'high', category: 'delicacy', foodVector: [0.35, 0.58, 0.0, 0.05, 0.82, 0.55, 0.62], compounds: ['vanillin', 'pyrazines', 'guaiacol', 'eugenol'] },
  { id: 'suyuk-slice', name: '수육 슬라이스', tier: 'medium', category: 'meal', foodVector: [0.08, 0.48, 0.0, 0.05, 0.65, 0.52, 0.55], compounds: ['pyrazines', 'eugenol', 'allicin'] },

  // 떡 / 한과 추가
  { id: 'tteok-galbi', name: '떡갈비', tier: 'medium', category: 'meal', foodVector: [0.25, 0.5, 0.0, 0.12, 0.68, 0.42, 0.68], compounds: ['vanillin', 'pyrazines', 'guaiacol', 'allicin'] },
  { id: 'rainbow-tteok', name: '무지개 떡', tier: 'low', category: 'snack', foodVector: [0.52, 0.05, 0.0, 0.0, 0.08, 0.1, 0.38], compounds: ['vanillin', 'linalool'] },
  { id: 'garaetteok', name: '가래떡 구이 + 꿀', tier: 'low', category: 'snack', foodVector: [0.58, 0.05, 0.0, 0.0, 0.08, 0.12, 0.55], compounds: ['vanillin', 'furfural', 'pyrazines'] },
  { id: 'tteok-kkochi', name: '떡 꼬치', tier: 'low', category: 'snack', foodVector: [0.35, 0.42, 0.05, 0.32, 0.28, 0.18, 0.62], compounds: ['capsaicin', 'vanillin', 'pyrazines', 'acetic acid'] },
  { id: 'baramtteok', name: '바람떡 (단팥)', tier: 'low', category: 'snack', foodVector: [0.72, 0.05, 0.0, 0.0, 0.15, 0.15, 0.42], compounds: ['vanillin', 'furfural'] },
  { id: 'omegi-tteok', name: '오메기떡 (제주)', tier: 'low', category: 'snack', foodVector: [0.55, 0.05, 0.0, 0.0, 0.12, 0.18, 0.48], compounds: ['vanillin', 'pyrazines', 'furfural'] },

  // 양념 안주
  { id: 'gochujang-steak', name: '고추장 양념 스테이크', tier: 'high', category: 'delicacy', foodVector: [0.25, 0.52, 0.08, 0.52, 0.72, 0.48, 0.72], compounds: ['capsaicin', 'vanillin', 'pyrazines', 'guaiacol', 'acetic acid'] },
  { id: 'doenjang-marinated-beef', name: '된장 숙성 소고기', tier: 'high', category: 'delicacy', foodVector: [0.1, 0.65, 0.08, 0.08, 0.82, 0.52, 0.72], compounds: ['pyrazines', 'lactic acid', 'acetic acid', 'guaiacol'] },
  { id: 'ganjang-marinated-pork', name: '간장 숙성 삼겹살', tier: 'medium', category: 'meal', foodVector: [0.2, 0.62, 0.0, 0.05, 0.65, 0.68, 0.75], compounds: ['vanillin', 'pyrazines', 'guaiacol', 'allicin'] },

  // 국물 안주
  { id: 'seolleongtang', name: '설렁탕 건더기', tier: 'medium', category: 'meal', foodVector: [0.05, 0.45, 0.0, 0.02, 0.82, 0.48, 0.32], compounds: ['pyrazines', 'lactones', 'amines'] },
  { id: 'sagol-gomguk', name: '사골 곰국', tier: 'high', category: 'delicacy', foodVector: [0.05, 0.42, 0.0, 0.02, 0.88, 0.52, 0.18], compounds: ['pyrazines', 'lactones', 'amines', 'vanillin'] },
  { id: 'cheonggukjang-jjigae', name: '청국장 찌개', tier: 'medium', category: 'meal', foodVector: [0.1, 0.62, 0.1, 0.15, 0.85, 0.25, 0.32], compounds: ['pyrazines', 'acetic acid', 'lactic acid', 'amines', 'allicin'] },
  { id: 'guk-bap', name: '국밥 (돼지)', tier: 'low', category: 'meal', foodVector: [0.08, 0.52, 0.0, 0.18, 0.65, 0.42, 0.38], compounds: ['amines', 'capsaicin', 'pyrazines', 'allicin'] },

  // 분식 / 서민 안주
  { id: 'sundae', name: '순대 (야채)', tier: 'low', category: 'snack', foodVector: [0.12, 0.55, 0.0, 0.15, 0.62, 0.42, 0.55], compounds: ['amines', 'pyrazines', 'allicin', 'eugenol'] },
  { id: 'twigim-assorted', name: '모둠 튀김 (분식)', tier: 'low', category: 'snack', foodVector: [0.15, 0.48, 0.0, 0.08, 0.42, 0.35, 0.85], compounds: ['amines', 'pyrazines'] },
  { id: 'corn-dog-korean', name: '핫도그 (한국식)', tier: 'low', category: 'snack', foodVector: [0.35, 0.42, 0.0, 0.05, 0.35, 0.42, 0.82], compounds: ['vanillin', 'pyrazines', 'furfural'] },
  { id: 'gyeran-mari', name: '계란 말이', tier: 'low', category: 'snack', foodVector: [0.08, 0.48, 0.0, 0.05, 0.52, 0.38, 0.55], compounds: ['pyrazines', 'allicin', 'diacetyl'] },
  { id: 'jeon-assorted', name: '모듬 소 전 (부침)', tier: 'low', category: 'snack', foodVector: [0.1, 0.5, 0.0, 0.08, 0.5, 0.32, 0.65], compounds: ['pyrazines', 'amines', 'allicin'] },

  // 서양식 퓨전 한식
  { id: 'bulgogi-bruschetta', name: '불고기 브루스케타', tier: 'medium', category: 'meal', foodVector: [0.28, 0.45, 0.08, 0.12, 0.62, 0.35, 0.68], compounds: ['vanillin', 'pyrazines', 'guaiacol', 'allicin', 'limonene'] },
  { id: 'doenjang-pasta', name: '된장 파스타', tier: 'medium', category: 'meal', foodVector: [0.1, 0.58, 0.0, 0.08, 0.72, 0.35, 0.42], compounds: ['pyrazines', 'lactic acid', 'acetic acid', 'allicin'] },
  { id: 'kimchi-pizza', name: '김치 피자 (한 조각)', tier: 'low', category: 'snack', foodVector: [0.18, 0.52, 0.15, 0.35, 0.52, 0.45, 0.62], compounds: ['capsaicin', 'lactic acid', 'diacetyl', 'pyrazines'] },
  { id: 'ganjang-truffle-tteok', name: '트러플 간장 인절미', tier: 'high', category: 'delicacy', foodVector: [0.42, 0.55, 0.0, 0.0, 0.42, 0.35, 0.62], compounds: ['dimethyl sulfide', 'vanillin', 'pyrazines', 'tannin'] },
  { id: 'makgeolli-cream-cheese', name: '막걸리 크림치즈', tier: 'medium', category: 'snack', foodVector: [0.28, 0.38, 0.22, 0.02, 0.42, 0.52, 0.25], compounds: ['diacetyl', 'lactic acid', 'acetic acid', 'vanillin'] },
  { id: 'ssuk-gelato', name: '쑥 젤라또 한 스쿱', tier: 'medium', category: 'snack', foodVector: [0.62, 0.05, 0.05, 0.0, 0.1, 0.32, 0.08], compounds: ['linalool', 'vanillin', 'lactones'], season: ['spring'] },
  { id: 'omija-sorbet', name: '오미자 소르베', tier: 'high', category: 'delicacy', foodVector: [0.48, 0.02, 0.52, 0.0, 0.05, 0.02, 0.05], compounds: ['limonene', 'anthocyanins', 'linalool'], season: ['fall'] },
  { id: 'black-garlic-chips', name: '흑마늘 칩', tier: 'medium', category: 'snack', foodVector: [0.32, 0.35, 0.08, 0.08, 0.52, 0.28, 0.88], compounds: ['vanillin', 'allicin', 'pyrazines', 'furfural'] },
  { id: 'namul-bibim-taco', name: '나물 비빔 타코', tier: 'medium', category: 'meal', foodVector: [0.15, 0.42, 0.12, 0.22, 0.45, 0.28, 0.62], compounds: ['capsaicin', 'allicin', 'linalool', 'pyrazines'] },
  { id: 'seaweed-butter-rice', name: '김버터 주먹밥', tier: 'low', category: 'snack', foodVector: [0.18, 0.5, 0.0, 0.0, 0.42, 0.38, 0.52], compounds: ['dimethyl sulfide', 'diacetyl', 'pyrazines'] },
  { id: 'honey-nut-yangban-gui', name: '꿀 견과 양반 구이', tier: 'medium', category: 'snack', foodVector: [0.72, 0.1, 0.0, 0.0, 0.18, 0.42, 0.72], compounds: ['vanillin', 'pyrazines', 'furfural', 'tannin'] },
  { id: 'jeju-pork-gui', name: '제주 흑돼지 오겹살', tier: 'high', category: 'delicacy', foodVector: [0.08, 0.45, 0.0, 0.05, 0.72, 0.72, 0.78], compounds: ['pyrazines', 'guaiacol', 'lactones', 'eugenol'] },
  { id: 'muguk-tteok-soup', name: '떡국 (설날 스타일)', tier: 'low', category: 'meal', foodVector: [0.1, 0.48, 0.0, 0.02, 0.62, 0.28, 0.48], compounds: ['pyrazines', 'allicin', 'vanillin'], season: ['winter'] },
  { id: 'daepa-jeon', name: '대파 전', tier: 'low', category: 'snack', foodVector: [0.12, 0.45, 0.0, 0.08, 0.32, 0.28, 0.68], compounds: ['allicin', 'pyrazines', 'linalool'] },
  { id: 'boribap-ssam', name: '보리밥 쌈밥', tier: 'low', category: 'meal', foodVector: [0.12, 0.42, 0.05, 0.12, 0.38, 0.18, 0.48], compounds: ['pyrazines', 'allicin', 'linalool', 'capsaicin'] },
  { id: 'galbi-ttok', name: '갈비 떡꼬치', tier: 'medium', category: 'snack', foodVector: [0.32, 0.48, 0.0, 0.15, 0.65, 0.42, 0.68], compounds: ['vanillin', 'pyrazines', 'guaiacol', 'capsaicin'] },
  { id: 'jokbal-mushroom', name: '버섯 족발 쌈', tier: 'medium', category: 'meal', foodVector: [0.22, 0.52, 0.0, 0.05, 0.72, 0.5, 0.58], compounds: ['vanillin', 'pyrazines', 'eugenol', 'allicin'] },
  { id: 'kkot-gejang-butter', name: '꽃게장 버터 파스타', tier: 'high', category: 'delicacy', foodVector: [0.18, 0.65, 0.0, 0.08, 0.88, 0.52, 0.45], compounds: ['amines', 'diacetyl', 'dimethyl sulfide', 'vanillin'] },
  { id: 'yeonnip-galbi', name: '연잎 갈비', tier: 'high', category: 'delicacy', foodVector: [0.28, 0.48, 0.0, 0.05, 0.78, 0.52, 0.62], compounds: ['linalool', 'vanillin', 'pyrazines', 'guaiacol'], season: ['summer'] },
  { id: 'ganjang-abalone-rice', name: '전복 간장 솥밥', tier: 'high', category: 'delicacy', foodVector: [0.18, 0.55, 0.0, 0.02, 0.88, 0.35, 0.42], compounds: ['amines', 'dimethyl sulfide', 'vanillin', 'pyrazines'] },
  { id: 'nurungji-tang', name: '누룽지 탕', tier: 'low', category: 'meal', foodVector: [0.15, 0.45, 0.0, 0.02, 0.38, 0.12, 0.72], compounds: ['pyrazines', 'furfural'] },
  { id: 'dduk-ramyun', name: '쌀 라면 (한국식)', tier: 'low', category: 'snack', foodVector: [0.12, 0.58, 0.0, 0.45, 0.42, 0.28, 0.55], compounds: ['capsaicin', 'pyrazines', 'allicin'] },
  { id: 'yukgae-ramen', name: '육개장 라면', tier: 'low', category: 'snack', foodVector: [0.1, 0.6, 0.0, 0.62, 0.48, 0.28, 0.55], compounds: ['capsaicin', 'pyrazines', 'guaiacol', 'allicin'] },
  { id: 'spring-rolls-kimchi', name: '김치 춘권', tier: 'medium', category: 'snack', foodVector: [0.12, 0.5, 0.2, 0.42, 0.42, 0.32, 0.82], compounds: ['capsaicin', 'lactic acid', 'pyrazines'] },
  { id: 'hobbang', name: '호빵 (단팥/야채)', tier: 'low', category: 'snack', foodVector: [0.6, 0.12, 0.0, 0.0, 0.15, 0.18, 0.32], compounds: ['vanillin', 'furfural'], season: ['winter'] },
  { id: 'scallion-oil-chicken', name: '파기름 닭가슴살', tier: 'medium', category: 'meal', foodVector: [0.08, 0.45, 0.0, 0.08, 0.55, 0.32, 0.62], compounds: ['allicin', 'pyrazines', 'guaiacol'] },
  { id: 'jangjorim-beef', name: '장조림 (소)', tier: 'low', category: 'snack', foodVector: [0.28, 0.68, 0.0, 0.05, 0.72, 0.32, 0.52], compounds: ['vanillin', 'pyrazines', 'allicin', 'eugenol'] },
  { id: 'jangjorim-egg', name: '메추리알 장조림', tier: 'low', category: 'snack', foodVector: [0.22, 0.65, 0.0, 0.05, 0.62, 0.35, 0.45], compounds: ['vanillin', 'pyrazines', 'allicin'] },
  { id: 'japgok-bap', name: '잡곡밥 쌈 한입', tier: 'low', category: 'snack', foodVector: [0.12, 0.38, 0.0, 0.05, 0.25, 0.12, 0.45], compounds: ['pyrazines', 'allicin'] },
  { id: 'pine-mushroom-gui', name: '송이버섯 구이', tier: 'high', category: 'delicacy', foodVector: [0.08, 0.42, 0.0, 0.02, 0.82, 0.22, 0.62], compounds: ['pyrazines', 'guaiacol', 'linalool', 'eugenol'], season: ['fall'] },
  { id: 'anchovy-pasta-korean', name: '멸치 오일 파스타 (한식 퓨전)', tier: 'medium', category: 'meal', foodVector: [0.08, 0.62, 0.05, 0.08, 0.72, 0.38, 0.42], compounds: ['amines', 'allicin', 'pyrazines', 'linalool'] },
  { id: 'kkwabaegi-honey', name: '꽈배기 꿀 디핑', tier: 'low', category: 'snack', dishType: '과자/한과', foodVector: [0.78, 0.08, 0.0, 0.0, 0.08, 0.4, 0.75], compounds: ['vanillin', 'furfural', 'pyrazines'] },

  // ══════════════════════════════════════════
  // 찜 (Steamed) — 신규 확장
  // ══════════════════════════════════════════
  { id: 'yeoneo-jjim', name: '연어 찜', tier: 'medium', category: 'meal', dishType: '찜', foodVector: [0.08, 0.42, 0.05, 0.02, 0.72, 0.48, 0.45], compounds: ['amines', 'dimethyl sulfide', 'diacetyl', 'linalool'] },
  { id: 'kkoltugi-jjim', name: '꼴뚜기 찜', tier: 'medium', category: 'meal', dishType: '찜', foodVector: [0.12, 0.55, 0.05, 0.32, 0.72, 0.18, 0.58], compounds: ['amines', 'capsaicin', 'dimethyl sulfide', 'pyrazines'] },
  { id: 'deodeok-jjim', name: '더덕 찜', tier: 'low', category: 'snack', dishType: '찜', foodVector: [0.15, 0.38, 0.05, 0.05, 0.32, 0.12, 0.42], compounds: ['linalool', 'eugenol', 'pyrazines'] },
  { id: 'pork-neck-jjim', name: '돼지 목살 찜', tier: 'medium', category: 'meal', dishType: '찜', foodVector: [0.12, 0.52, 0.0, 0.08, 0.62, 0.52, 0.55], compounds: ['pyrazines', 'eugenol', 'allicin', 'guaiacol'] },
  { id: 'miyeokgwi-jjim', name: '미역귀 찜', tier: 'low', category: 'snack', dishType: '찜', foodVector: [0.05, 0.48, 0.05, 0.02, 0.52, 0.12, 0.35], compounds: ['dimethyl sulfide', 'linalool', 'pyrazines'] },
  { id: 'minuh-gon-jjim', name: '민어 곤이 찜', tier: 'high', category: 'delicacy', dishType: '찜', foodVector: [0.05, 0.52, 0.0, 0.02, 0.88, 0.42, 0.38], compounds: ['amines', 'dimethyl sulfide', 'pyrazines', 'linalool'], season: ['summer'] },
  { id: 'jaeyeonsan-dolge-jjim', name: '자연산 돌게 찜', tier: 'high', category: 'delicacy', dishType: '찜', foodVector: [0.08, 0.52, 0.0, 0.02, 0.88, 0.22, 0.65], compounds: ['amines', 'dimethyl sulfide', 'pyrazines'], season: ['spring', 'fall'] },

  // ══════════════════════════════════════════
  // 조림 (Braised) — 신규 확장
  // ══════════════════════════════════════════
  { id: 'deodeok-jorim', name: '더덕 조림', tier: 'low', category: 'snack', dishType: '조림', foodVector: [0.35, 0.48, 0.05, 0.05, 0.28, 0.12, 0.62], compounds: ['linalool', 'eugenol', 'vanillin', 'pyrazines'] },
  { id: 'dubu-doenjang-jorim', name: '두부 강된장 조림', tier: 'low', category: 'snack', dishType: '조림', foodVector: [0.12, 0.62, 0.05, 0.12, 0.55, 0.25, 0.48], compounds: ['pyrazines', 'lactic acid', 'allicin', 'acetic acid'] },
  { id: 'honghap-ganjang-jorim', name: '홍합 간장 조림', tier: 'low', category: 'snack', dishType: '조림', foodVector: [0.22, 0.65, 0.0, 0.05, 0.78, 0.18, 0.52], compounds: ['amines', 'dimethyl sulfide', 'vanillin', 'pyrazines'] },
  { id: 'kkotge-yangnyeom-jorim', name: '꽃게 양념 조림', tier: 'medium', category: 'meal', dishType: '조림', foodVector: [0.25, 0.62, 0.05, 0.48, 0.82, 0.22, 0.58], compounds: ['capsaicin', 'amines', 'pyrazines', 'acetic acid'] },
  { id: 'dorumuk-jorim', name: '도루묵 조림', tier: 'low', category: 'snack', dishType: '조림', foodVector: [0.18, 0.62, 0.0, 0.22, 0.68, 0.28, 0.55], compounds: ['amines', 'capsaicin', 'pyrazines', 'allicin'] },
  { id: 'black-bean-jorim', name: '검은콩 조림', tier: 'low', category: 'snack', dishType: '조림', foodVector: [0.38, 0.58, 0.0, 0.0, 0.42, 0.15, 0.58], compounds: ['vanillin', 'pyrazines', 'tannin'] },
  { id: 'lotus-chija-jorim', name: '치자 연근 조림', tier: 'low', category: 'snack', dishType: '조림', foodVector: [0.42, 0.42, 0.0, 0.0, 0.18, 0.08, 0.62], compounds: ['eugenol', 'vanillin', 'pyrazines'], season: ['fall'] },
  { id: 'burdock-jorim', name: '우엉 조림', tier: 'low', category: 'snack', dishType: '조림', foodVector: [0.35, 0.52, 0.0, 0.05, 0.22, 0.10, 0.65], compounds: ['pyrazines', 'eugenol', 'vanillin', 'tannin'] },
  { id: 'perilla-leaf-jorim', name: '깻잎 간장 조림', tier: 'low', category: 'snack', dishType: '조림', foodVector: [0.18, 0.58, 0.0, 0.08, 0.28, 0.18, 0.45], compounds: ['linalool', 'vanillin', 'pyrazines', 'allicin'] },
  { id: 'gamja-butter-jorim', name: '감자 버터 조림', tier: 'low', category: 'snack', dishType: '조림', foodVector: [0.28, 0.42, 0.0, 0.0, 0.22, 0.35, 0.55], compounds: ['diacetyl', 'pyrazines', 'vanillin', 'furfural'] },

  // ══════════════════════════════════════════
  // 무침 (Seasoned) — 신규 확장
  // ══════════════════════════════════════════
  { id: 'dotori-muchim', name: '도토리묵 무침', tier: 'low', category: 'snack', dishType: '무침', foodVector: [0.05, 0.48, 0.12, 0.25, 0.18, 0.08, 0.42], compounds: ['capsaicin', 'allicin', 'acetic acid', 'linalool'] },
  { id: 'kongnamul-mustard', name: '콩나물 겨자 무침', tier: 'low', category: 'snack', dishType: '무침', foodVector: [0.10, 0.42, 0.08, 0.18, 0.28, 0.10, 0.55], compounds: ['allyl isothiocyanate', 'allicin', 'linalool'] },
  { id: 'parae-muchim', name: '파래 무침', tier: 'low', category: 'snack', dishType: '무침', foodVector: [0.08, 0.52, 0.12, 0.05, 0.42, 0.10, 0.38], compounds: ['dimethyl sulfide', 'acetic acid', 'linalool'], season: ['winter', 'spring'] },
  { id: 'oi-naengchae', name: '오이 냉채', tier: 'low', category: 'snack', dishType: '무침', foodVector: [0.12, 0.38, 0.32, 0.08, 0.18, 0.08, 0.72], compounds: ['acetic acid', 'linalool', 'allicin'], season: ['summer'] },
  { id: 'miyeok-stem-muchim', name: '미역 줄기 무침', tier: 'low', category: 'snack', dishType: '무침', foodVector: [0.08, 0.48, 0.15, 0.05, 0.38, 0.08, 0.38], compounds: ['dimethyl sulfide', 'acetic acid', 'linalool'] },
  { id: 'bamboo-cho', name: '죽순 초무침', tier: 'low', category: 'snack', dishType: '무침', foodVector: [0.12, 0.42, 0.35, 0.05, 0.22, 0.08, 0.55], compounds: ['acetic acid', 'linalool', 'eugenol'], season: ['spring'] },
  { id: 'lettuce-geotjeori', name: '상추 겉절이', tier: 'low', category: 'snack', dishType: '무침', foodVector: [0.10, 0.42, 0.18, 0.12, 0.20, 0.08, 0.45], compounds: ['capsaicin', 'allicin', 'acetic acid', 'linalool'] },
  { id: 'deodeok-saengchae', name: '더덕 생채', tier: 'low', category: 'snack', dishType: '무침', foodVector: [0.15, 0.35, 0.12, 0.08, 0.20, 0.08, 0.55], compounds: ['linalool', 'eugenol', 'acetic acid'] },
  { id: 'chwinamul-muchim', name: '취나물 무침', tier: 'low', category: 'snack', dishType: '무침', foodVector: [0.08, 0.42, 0.05, 0.05, 0.30, 0.15, 0.42], compounds: ['linalool', 'allicin', 'pyrazines'], season: ['spring'] },
  { id: 'gosari-muchim', name: '고사리 무침', tier: 'low', category: 'snack', dishType: '무침', foodVector: [0.08, 0.45, 0.0, 0.08, 0.38, 0.18, 0.48], compounds: ['allicin', 'pyrazines', 'linalool'], season: ['spring'] },
  { id: 'dolnamul-muchim', name: '돌나물 무침', tier: 'low', category: 'snack', dishType: '무침', foodVector: [0.10, 0.38, 0.22, 0.05, 0.18, 0.08, 0.42], compounds: ['linalool', 'acetic acid', 'limonene'], season: ['spring'] },

  // ══════════════════════════════════════════
  // 발효/젓갈 — 신규 확장
  // ══════════════════════════════════════════
  { id: 'hongeo-hoemuchim', name: '홍어 회무침', tier: 'high', category: 'delicacy', dishType: '발효/젓갈', foodVector: [0.05, 0.55, 0.15, 0.05, 0.82, 0.22, 0.52], compounds: ['ammonia', 'phenol', 'lactic acid', 'capsaicin'] },
  { id: 'galchi-jeot', name: '갈치속젓', tier: 'medium', category: 'snack', dishType: '발효/젓갈', foodVector: [0.05, 0.82, 0.0, 0.05, 0.88, 0.15, 0.38], compounds: ['amines', 'lactic acid', 'acetic acid'] },
  { id: 'changran-jeot', name: '창란젓', tier: 'medium', category: 'snack', dishType: '발효/젓갈', foodVector: [0.08, 0.78, 0.05, 0.35, 0.85, 0.15, 0.45], compounds: ['amines', 'capsaicin', 'lactic acid', 'acetic acid'] },
  { id: 'saewoo-jeot', name: '새우젓 (장충)', tier: 'low', category: 'snack', dishType: '발효/젓갈', foodVector: [0.08, 0.88, 0.0, 0.05, 0.82, 0.12, 0.35], compounds: ['amines', 'lactic acid', 'acetic acid'] },
  { id: 'cheonggukjang-tteok', name: '청국장 떡볶이', tier: 'medium', category: 'snack', dishType: '발효/젓갈', foodVector: [0.35, 0.58, 0.08, 0.08, 0.75, 0.20, 0.55], compounds: ['pyrazines', 'lactic acid', 'acetic acid', 'amines', 'capsaicin'] },
  { id: 'makjang-ssam', name: '막장 쌈', tier: 'low', category: 'snack', dishType: '발효/젓갈', foodVector: [0.15, 0.65, 0.10, 0.08, 0.78, 0.12, 0.35], compounds: ['lactic acid', 'acetic acid', 'pyrazines', 'allicin'] },
  { id: 'gan-godeungeo', name: '간고등어', tier: 'low', category: 'meal', dishType: '발효/젓갈', foodVector: [0.05, 0.72, 0.0, 0.05, 0.72, 0.42, 0.62], compounds: ['amines', 'guaiacol', 'lactic acid', 'pyrazines'] },

  // ══════════════════════════════════════════
  // 전통 디저트 — 신규 확장
  // ══════════════════════════════════════════
  { id: 'yakbap', name: '약식 (약밥)', tier: 'medium', category: 'snack', dishType: '떡', foodVector: [0.85, 0.08, 0.0, 0.0, 0.15, 0.28, 0.42], compounds: ['vanillin', 'cinnamaldehyde', 'furfural', 'pyrazines'], season: ['winter', 'spring'] },
  { id: 'yullan', name: '율란 (밤과자)', tier: 'low', category: 'snack', dishType: '과자/한과', foodVector: [0.78, 0.05, 0.0, 0.0, 0.18, 0.22, 0.35], compounds: ['vanillin', 'furfural', 'tannin'], season: ['fall', 'winter'] },
  { id: 'maesil-jeonggwa', name: '매실 정과', tier: 'low', category: 'snack', dishType: '과자/한과', foodVector: [0.65, 0.05, 0.42, 0.0, 0.05, 0.02, 0.32], compounds: ['benzaldehyde', 'linalool', 'limonene', 'vanillin'], season: ['spring', 'summer'] },
  { id: 'dongkwa-jeonggwa', name: '동과 정과', tier: 'low', category: 'snack', dishType: '과자/한과', foodVector: [0.72, 0.05, 0.05, 0.0, 0.05, 0.02, 0.35], compounds: ['vanillin', 'furfural'], season: ['fall'] },
  { id: 'jat-gangjeong', name: '잣 강정 (단품)', tier: 'low', category: 'snack', dishType: '과자/한과', foodVector: [0.65, 0.08, 0.0, 0.0, 0.18, 0.45, 0.62], compounds: ['pinene', 'vanillin', 'pyrazines'] },
  { id: 'surichwi-gyeongdan', name: '수리취 경단', tier: 'low', category: 'snack', dishType: '떡', foodVector: [0.42, 0.08, 0.0, 0.0, 0.12, 0.12, 0.55], compounds: ['linalool', 'vanillin'], season: ['spring'] },
  { id: 'ssuk-injeolmi', name: '쑥 인절미 (봄)', tier: 'low', category: 'snack', dishType: '떡', foodVector: [0.38, 0.08, 0.05, 0.0, 0.12, 0.12, 0.58], compounds: ['linalool', 'vanillin', 'pyrazines'], season: ['spring'] },
  { id: 'omija-hwachae-jelly', name: '오미자 화채 젤리', tier: 'medium', category: 'snack', dishType: '과자/한과', foodVector: [0.55, 0.05, 0.48, 0.0, 0.05, 0.0, 0.08], compounds: ['limonene', 'anthocyanins', 'linalool', 'acetic acid'], season: ['fall'] },

  // ══════════════════════════════════════════
  // 구이 추가 — 다양성 보강
  // ══════════════════════════════════════════
  { id: 'deodeok-gui', name: '더덕 구이', tier: 'low', category: 'snack', dishType: '구이', foodVector: [0.28, 0.38, 0.0, 0.05, 0.32, 0.08, 0.55], compounds: ['linalool', 'eugenol', 'guaiacol', 'pyrazines'] },
  { id: 'kkoltugi-gui', name: '꼴뚜기 구이', tier: 'medium', category: 'meal', dishType: '구이', foodVector: [0.08, 0.55, 0.0, 0.12, 0.72, 0.18, 0.72], compounds: ['amines', 'capsaicin', 'dimethyl sulfide', 'pyrazines'] },
  { id: 'honghap-gui', name: '홍합 구이', tier: 'low', category: 'snack', dishType: '구이', foodVector: [0.10, 0.52, 0.0, 0.05, 0.75, 0.20, 0.55], compounds: ['amines', 'dimethyl sulfide', 'guaiacol', 'pyrazines'] },
  { id: 'galchi-yangnyeom-gui', name: '갈치 양념 구이', tier: 'medium', category: 'meal', dishType: '구이', foodVector: [0.22, 0.58, 0.0, 0.22, 0.72, 0.38, 0.58], compounds: ['amines', 'capsaicin', 'guaiacol', 'pyrazines'] },
  { id: 'saewoo-sogeum-gui', name: '새우 소금 구이', tier: 'medium', category: 'meal', dishType: '구이', foodVector: [0.08, 0.48, 0.0, 0.05, 0.68, 0.22, 0.72], compounds: ['amines', 'isoamyl acetate', 'pyrazines', 'guaiacol'] },
  { id: 'neungyi-gui', name: '능이버섯 구이', tier: 'high', category: 'delicacy', dishType: '구이', foodVector: [0.08, 0.42, 0.0, 0.02, 0.78, 0.20, 0.62], compounds: ['pyrazines', 'guaiacol', 'linalool', 'eugenol'], season: ['fall'] },
  { id: 'songyi-sogeum-gui', name: '송이 소금 구이', tier: 'high', category: 'delicacy', dishType: '구이', foodVector: [0.08, 0.38, 0.0, 0.02, 0.88, 0.18, 0.62], compounds: ['1-octen-3-ol', 'guaiacol', 'linalool', 'pyrazines'], season: ['fall'] },

  // ══════════════════════════════════════════
  // 전/부침개 추가
  // ══════════════════════════════════════════
  { id: 'ssuk-jeon', name: '쑥전 (봄)', tier: 'low', category: 'snack', dishType: '전/부침개', foodVector: [0.15, 0.42, 0.05, 0.0, 0.22, 0.28, 0.62], compounds: ['linalool', 'pyrazines', 'vanillin'], season: ['spring'] },
  { id: 'gamja-onion-jeon', name: '감자 양파 전', tier: 'low', category: 'snack', dishType: '전/부침개', foodVector: [0.18, 0.38, 0.0, 0.02, 0.18, 0.28, 0.65], compounds: ['allicin', 'pyrazines', 'furfural'] },
  { id: 'kkotge-jeon', name: '꽃게 전', tier: 'medium', category: 'snack', dishType: '전/부침개', foodVector: [0.08, 0.52, 0.0, 0.08, 0.72, 0.32, 0.62], compounds: ['amines', 'pyrazines', 'dimethyl sulfide'] },
  { id: 'deodeok-jeon', name: '더덕 전', tier: 'low', category: 'snack', dishType: '전/부침개', foodVector: [0.15, 0.42, 0.0, 0.05, 0.28, 0.25, 0.58], compounds: ['linalool', 'eugenol', 'pyrazines'] },
  { id: 'susu-jeon', name: '수수 전', tier: 'low', category: 'snack', dishType: '전/부침개', foodVector: [0.22, 0.35, 0.0, 0.0, 0.18, 0.28, 0.68], compounds: ['pyrazines', 'furfural', 'vanillin'] },

  // ══════════════════════════════════════════
  // 면/밥/죽 추가
  // ══════════════════════════════════════════
  { id: 'jeonbok-miyeok-bap', name: '전복 미역국밥', tier: 'medium', category: 'meal', dishType: '면/밥/죽', foodVector: [0.05, 0.50, 0.0, 0.02, 0.75, 0.28, 0.32], compounds: ['amines', 'dimethyl sulfide', 'pyrazines', 'allicin'] },
  { id: 'bori-bibimbap', name: '보리 비빔밥', tier: 'low', category: 'meal', dishType: '면/밥/죽', foodVector: [0.15, 0.45, 0.05, 0.22, 0.42, 0.20, 0.52], compounds: ['capsaicin', 'pyrazines', 'allicin', 'furfural'] },
  { id: 'pat-juk', name: '팥죽 (단팥)', tier: 'low', category: 'snack', dishType: '면/밥/죽', foodVector: [0.55, 0.08, 0.0, 0.0, 0.18, 0.08, 0.12], compounds: ['vanillin', 'furfural', 'tannin'], season: ['winter'] },
  { id: 'nokdu-juk', name: '녹두죽', tier: 'low', category: 'meal', dishType: '면/밥/죽', foodVector: [0.18, 0.25, 0.0, 0.0, 0.28, 0.08, 0.08], compounds: ['pyrazines', 'vanillin', 'linalool'] },
  { id: 'jeonbok-naegang-bokkeum', name: '전복 내장 볶음밥', tier: 'high', category: 'delicacy', dishType: '면/밥/죽', foodVector: [0.18, 0.55, 0.0, 0.05, 0.88, 0.38, 0.52], compounds: ['amines', 'dimethyl sulfide', 'pyrazines', 'guaiacol'] },
  { id: 'insam-galbitang-bap', name: '인삼 한우 갈비탕', tier: 'high', category: 'delicacy', dishType: '탕/국/찌개', foodVector: [0.15, 0.45, 0.0, 0.05, 0.78, 0.48, 0.28], compounds: ['ginsenoside', 'pyrazines', 'lactones', 'vanillin'] },
  { id: 'mulmegi-tang', name: '물메기탕', tier: 'medium', category: 'meal', dishType: '탕/국/찌개', foodVector: [0.05, 0.52, 0.0, 0.15, 0.72, 0.28, 0.25], compounds: ['amines', 'capsaicin', 'pyrazines', 'allicin'], season: ['winter'] },

  // ══════════════════════════════════════════
  // 고급 요리 추가 — 프리미엄 다양성
  // ══════════════════════════════════════════
  { id: 'chamge-ganjang-gui', name: '참게 간장 구이', tier: 'high', category: 'delicacy', dishType: '고급 요리', foodVector: [0.12, 0.72, 0.0, 0.05, 0.85, 0.28, 0.62], compounds: ['amines', 'dimethyl sulfide', 'vanillin', 'pyrazines'], season: ['fall'] },
  { id: 'miyeok-tot-bap', name: '미역·톳 솥밥', tier: 'medium', category: 'meal', dishType: '고급 요리', foodVector: [0.10, 0.42, 0.02, 0.0, 0.45, 0.12, 0.42], compounds: ['dimethyl sulfide', 'pyrazines', 'vanillin'] },
  { id: 'jeonbok-naegang-rice', name: '전복 간장 내장밥', tier: 'high', category: 'delicacy', dishType: '고급 요리', foodVector: [0.15, 0.58, 0.0, 0.02, 0.92, 0.35, 0.42], compounds: ['amines', 'dimethyl sulfide', 'vanillin', 'pyrazines'], season: ['fall'] },
  { id: 'hanwoo-bone-marrow', name: '한우 골수 구이', tier: 'high', category: 'delicacy', dishType: '고급 요리', foodVector: [0.05, 0.42, 0.0, 0.02, 0.88, 0.82, 0.58], compounds: ['pyrazines', 'guaiacol', 'lactones', 'vanillin'] },
  { id: 'yukhoe-sashimi-duo', name: '육회 광어회 듀오', tier: 'high', category: 'delicacy', dishType: '고급 요리', foodVector: [0.10, 0.43, 0.05, 0.08, 0.80, 0.30, 0.42], compounds: ['amines', 'dimethyl sulfide', 'allicin', 'linalool'] },
  { id: 'dried-pollack-cream', name: '황태 크림 수프 (퓨전)', tier: 'high', category: 'delicacy', dishType: '고급 요리', foodVector: [0.12, 0.52, 0.0, 0.05, 0.72, 0.55, 0.18], compounds: ['amines', 'diacetyl', 'pyrazines', 'vanillin'] },
];
