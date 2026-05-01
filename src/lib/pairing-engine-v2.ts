import type { Whiskey } from './data';
import { FOOD_DB_V2, type FoodV2, type FoodTier, type Season } from './food-db';

// ─────────────────────────────────────────────
// SYNERGY MATRIX
// rows = whiskey dims [Peat, Fruit, Sweet, Wood, Floral, Body, Finish]
// cols = food dims    [Sweet, Salty, Sour, Spicy, Umami, Fat, Texture]
// ─────────────────────────────────────────────
const SYNERGY: number[][] = [
  //                  Sweet  Salty  Sour   Spicy  Umami  Fat    Texture
  /* Peat   */  [     0.1,   0.7,  -0.3,   0.15,  0.85,  0.65,  0.4   ],
  /* Fruit  */  [     0.5,   0.15,  0.65, -0.55,  0.2,  -0.2,   0.1   ],
  /* Sweet  */  [     0.25,  0.6,   0.15,  0.75,  0.4,   0.3,   0.05  ],
  /* Wood   */  [     0.1,   0.35, -0.1,   0.4,   0.72,  0.55,  0.65  ],
  /* Floral */  [     0.65, -0.2,   0.5,  -0.45,  0.1,  -0.15,  0.1   ],
  /* Body   */  [     0.2,   0.4,   0.0,   0.3,   0.82,  0.72,  0.5   ],
  /* Finish */  [     0.1,   0.3,   0.1,   0.2,   0.5,   0.4,   0.72  ],
];

export interface PairingResult {
  food: FoodV2;
  score: number;
  synergyScore: number;
  story: string;
  todayPick: boolean;
}

export interface AdventurousResult {
  food: FoodV2;
  adventurousScore: number;
  contrastScore: number;
  bridgeKey: string;        // which contrast rule fired
  bridgeLabel: string;      // human-readable rule name
  story: string;
}

// ─────────────────────────────────────────────
// STANDARD SYNERGY SCORE
// ─────────────────────────────────────────────
function calcSynergyScore(whiskey: Whiskey, food: FoodV2): number {
  const wv = whiskey.flavorVector;
  const fv = food.foodVector;
  let score = 0;
  for (let w = 0; w < 7; w++) {
    for (let f = 0; f < 7; f++) {
      score += wv[w] * fv[f] * SYNERGY[w][f];
    }
  }
  return score;
}

function calcCompoundBonus(whiskey: Whiskey, food: FoodV2): number {
  const shared = whiskey.compounds.filter(c => food.compounds.includes(c));
  let bonus = shared.length * 0.3;
  if (whiskey.compounds.includes('phenol') && food.compounds.includes('ammonia')) bonus += 1.2;
  if (whiskey.compounds.includes('guaiacol') && food.compounds.includes('guaiacol')) bonus += 0.5;
  return bonus;
}

// ─────────────────────────────────────────────
// ADVENTUROUS — CONTRAST MATCHING
// ─────────────────────────────────────────────

interface BridgeRule {
  key: string;
  label: string;
  score: number;
  check: (w: Whiskey, f: FoodV2) => boolean;
}

// Bridge rules: fires when whiskey's dominant character CONTRASTS food,
// but specific molecular bridges create a new emergent flavor.
const BRIDGE_RULES: BridgeRule[] = [
  {
    key: 'peat_sweet_fat',
    label: '연기 × 달콤한 지방',
    score: 2.8,
    check: (w, f) =>
      w.flavorVector[0] > 0.5 &&                   // peat-heavy
      f.foodVector[0] > 0.55 &&                    // sweet food
      f.foodVector[5] > 0.3 &&                     // has fat
      (w.compounds.includes('phenol') || w.compounds.includes('guaiacol')) &&
      f.compounds.some(c => ['vanillin', 'lactones', 'diacetyl', 'furfural'].includes(c)),
  },
  {
    key: 'sweet_spicy',
    label: '달콤함 × 매운맛',
    score: 2.5,
    check: (w, f) =>
      w.flavorVector[2] >= 0.50 &&                 // sweet whiskey (>=0.50 inclusive)
      f.foodVector[3] > 0.5 &&                     // spicy food
      w.compounds.includes('vanillin') &&
      f.compounds.includes('capsaicin'),
  },
  {
    key: 'balanced_extreme',
    label: '균형잡힌 위스키 × 강렬한 발효',
    score: 1.9,
    check: (w, f) =>
      // balanced whiskeys: no single dim > 0.65 (smooth_nutty, etc.)
      Math.max(...w.flavorVector) <= 0.65 &&
      f.foodVector[4] > 0.80 &&                    // very high umami
      f.compounds.some(c => ['ammonia', 'lactic acid', 'acetic acid', 'amines'].includes(c)),
  },
  {
    key: 'sherry_fermented',
    label: '셰리·오크 × 극발효',
    score: 3.0,
    check: (w, f) =>
      (w.flavorVector[3] > 0.6 || w.compounds.includes('tannin')) &&  // woody/sherry
      f.foodVector[4] > 0.75 &&                    // high umami
      f.compounds.some(c => ['ammonia', 'lactic acid', 'acetic acid'].includes(c)),
  },
  {
    key: 'floral_deep_umami',
    label: '꽃향기 × 깊은 감칠맛',
    score: 2.3,
    check: (w, f) =>
      w.flavorVector[4] > 0.55 &&                  // floral
      f.foodVector[4] > 0.70 &&                    // umami-rich
      (f.foodVector[1] > 0.6 || f.foodVector[2] > 0.3) && // salty or sour
      w.compounds.some(c => ['linalool', 'limonene'].includes(c)) &&
      f.compounds.some(c => ['amines', 'dimethyl sulfide', 'lactic acid'].includes(c)),
  },
  {
    key: 'citrus_fermented',
    label: '시트러스 × 발효 산미',
    score: 2.1,
    check: (w, f) =>
      w.flavorVector[1] > 0.55 &&                  // fruity
      f.foodVector[2] > 0.28 &&                    // sour
      w.compounds.some(c => ['limonene', 'esters', 'isoamyl acetate'].includes(c)) &&
      f.compounds.some(c => ['lactic acid', 'acetic acid'].includes(c)),
  },
  {
    key: 'rich_body_acid',
    label: '풀바디 × 산미 클렌저',
    score: 2.0,
    check: (w, f) =>
      w.flavorVector[5] > 0.65 &&                  // full body
      f.foodVector[2] > 0.35 &&                    // sour
      f.foodVector[5] < 0.35,                      // lean / low fat
  },
  {
    key: 'smoky_sweet_dessert',
    label: '훈연 × 디저트형 단맛',
    score: 2.6,
    check: (w, f) =>
      w.compounds.includes('guaiacol') &&
      f.foodVector[0] > 0.65 &&                    // very sweet
      f.foodVector[6] < 0.5 &&                     // soft texture
      f.compounds.some(c => ['vanillin', 'furfural', 'lactones'].includes(c)),
  },
  {
    key: 'peaty_sea_sweet',
    label: '피트 × 해양 단맛',
    score: 2.4,
    check: (w, f) =>
      w.flavorVector[0] > 0.6 &&
      f.compounds.includes('dimethyl sulfide') &&  // sea/ocean note
      f.foodVector[0] > 0.1 &&
      f.foodVector[4] > 0.6,                       // umami-heavy seafood
  },
];

// ─────────────────────────────────────────────
// ADVENTUROUS STORYTELLING
// ─────────────────────────────────────────────

const ADVENTUROUS_STORIES: Record<string, { challenge: string[]; reward: string[] }> = {
  peat_sweet_fat: {
    challenge: [
      '피트 위스키의 타르 같은 훈연향과 달콤한 디저트의 만남—직관적으로 이 둘은 서로를 밀어냅니다. 페놀 화합물은 단맛을 죽이고, 설탕은 스모키함을 평평하게 만든다고 배웠을 것입니다.',
      '아일라 섬의 이탄 연기와 달콤한 유지방은 음식의 세계에서 금기(禁忌)에 가깝습니다. 이 조합을 시도한다면, 처음 1초는 분명 당황스러울 것입니다.',
    ],
    reward: [
      '하지만 여기서 미식의 역설이 시작됩니다. 페놀 분자가 지방 속 바닐린과 결합하는 순간, 입 안에서 훈제 캐러멜이라는 새로운 분자가 태어납니다. 스모키 트러플 초콜릿을 상상해 보세요—이것이 그 분자적 메커니즘입니다.',
      '지방이 페놀의 날카로운 끝을 감싸 안으며 연기와 달콤함의 경계가 지워집니다. 위스키 마스터들이 비밀리에 즐기는 파격 조합—한 번 경험하면 되돌아갈 수 없습니다.',
    ],
  },
  sweet_spicy: {
    challenge: [
      '달콤한 바닐라 위스키와 캡사이신 폭탄 요리—교과서적으로 단맛과 매운맛은 서로를 지워버립니다. 어느 한 쪽이 압도당할 것이라고 예상하는 것이 정상입니다.',
      '부드럽고 달콤한 위스키가 강렬한 한국 매운맛 앞에서 존재감을 잃을 것 같습니다. 위스키가 소화제 역할로 전락할 수도 있죠.',
    ],
    reward: [
      '그러나 바닐린은 캡사이신이 TRPV1 수용체를 자극하는 속도를 분자 수준에서 늦춥니다. 즉, 위스키 한 모금이 매운맛의 타이밍을 바꿉니다. 달콤함이 먼저 오고, 불꽃이 그 뒤를 따르는 예상치 못한 드라마.',
      '매운 요리 후 위스키를 마시면 화끈함이 사라지는 게 아니라—달콤하게 변모합니다. 이것이 한국 매운맛 문화에서 바닐린이 숨겨진 영웅인 이유입니다.',
    ],
  },
  sherry_fermented: {
    challenge: [
      '셰리 오크의 탄닌과 극한의 발효 식품—이 조합은 한국의 어머니들도 말리는 조합입니다. 탄닌은 발효 향을 더 날카롭게 부각시키고, 암모니아 냄새는 위스키의 복잡성을 묻어버립니다.',
      '포르투갈 오크와 삭힌 발효 식품의 만남. 두 개의 강한 개성이 충돌하면 진흙탕이 될 수도 있습니다.',
    ],
    reward: [
      '하지만 탄닌 구조는 암모니아 화합물을 흡착하는 놀라운 성질이 있습니다. 탄닌이 발효의 자극적인 성분을 정화하고, 남은 것은 순수한 깊이—훈제된 해산물의 감칠맛만이 위스키의 셰리 달콤함과 포옹합니다.',
      '이 조합을 두 번째 잔부터 경험해 보세요. 첫 잔의 충격이 지나면 이 두 극단이 만드는 제3의 풍미—발효 셰리 소스—가 느껴지기 시작합니다. 전라도 미식과 스코틀랜드 증류소의 시간을 초월한 대화입니다.',
    ],
  },
  floral_deep_umami: {
    challenge: [
      '섬세한 꽃향기 위스키와 압도적 감칠맛 식재료—리날룰의 은은함이 우마미의 무게에 깔릴 것 같습니다. 꽃이 된장 앞에서 사라지는 그림.',
      '플로럴 위스키는 繊細(섬세)함을 생명으로 합니다. 강한 염장·발효 식품과의 만남은 그 섬세함을 영원히 묻어버릴 위험이 있습니다.',
    ],
    reward: [
      '그러나 아민 화합물은 리날룰과 결합해 유리병에 꽃을 담은 듯한 향을 만듭니다—海와 庭園의 교차점. 깊은 바다의 감칠맛 위로 봄꽃이 피어오르는 이 경험은 어느 레스토랑 메뉴에도 없습니다.',
      '강한 감칠맛이 위스키의 꽃향기를 배경으로 밀어넣는 것이 아니라—오히려 캔버스 역할을 합니다. 플로럴 향은 감칠맛 위에서 더욱 선명해집니다. 역설의 향미학.',
    ],
  },
  citrus_fermented: {
    challenge: [
      '시트러스 과일 위스키와 발효 신맛 식품—산(酸)과 산의 만남은 대부분의 경우 피로해집니다. 새콤함이 새콤함을 더하면 미각이 피로해질 뿐 아닐까요?',
      '과일향 위스키의 에스터 화합물은 발효 식품의 젖산과 만나 자칫 식초 폭탄이 될 수 있습니다.',
    ],
    reward: [
      '하지만 리모넨과 젖산은 서로 다른 주파수의 산미입니다. 리모넨의 밝고 날카로운 감귤 산미 위에 젖산의 둥글고 부드러운 발효 산미가 겹치면—복잡한 레이어드 소어니스(Layered Sourness)가 탄생합니다. 좋은 사케가 구연산과 젖산을 함께 품는 것과 같은 원리입니다.',
      '두 가지 산이 충돌하는 대신 협력하여 미각을 층층이 자극합니다. 입 안에서 산미의 팔레트가 서서히 전개되는 경험—한 번 알게 되면 단순한 와인·음식 페어링이 지루해집니다.',
    ],
  },
  rich_body_acid: {
    challenge: [
      '묵직한 풀바디 위스키와 산뜻하고 가벼운 산미 식품—이 둘은 체급 차이가 너무 납니다. 위스키가 가벼운 음식을 압도해버리거나, 산미가 위스키의 복잡성을 씻어내버릴 것 같습니다.',
      '고바디 위스키는 보통 묵직한 요리와 어울린다고 배웁니다. 가벼운 산미 요리와 짝짓는 것은 교과서를 찢는 행위입니다.',
    ],
    reward: [
      '바로 그것이 핵심입니다. 산미는 묵직한 위스키 후에 팔레트를 초기화(palette cleanse)하는 역할을 합니다. 풀바디가 입을 코팅한 직후 산미가 그것을 씻어내면서 위스키의 긴 피니시가 더욱 선명하게 드러납니다.',
      '이것이 고급 레스토랑에서 무거운 요리와 함께 가벼운 소르베를 내놓는 이유입니다. 산미는 묵직함을 소멸시키는 것이 아니라—더욱 돋보이게 하는 배경입니다.',
    ],
  },
  smoky_sweet_dessert: {
    challenge: [
      '훈연 위스키와 달달한 디저트—바베큐와 케이크를 같은 접시에 담는 것처럼 들립니다. 연기는 달콤함을 쓴맛으로 변모시키고, 단맛은 훈연의 복잡성을 평범하게 만들 것 같습니다.',
      '스모키 위스키와 달콤한 음식의 조합은 많은 위스키 소믈리에들이 금지 조합 목록 상단에 올려두는 매칭입니다.',
    ],
    reward: [
      '그러나 과이아콜(guaiacol)은 바닐린과 결합할 때 카페인 없는 스모키 에스프레소를 연상시키는 복합 화합물을 형성합니다. 달콤함이 훈연을 증폭시키고, 훈연이 달콤함에 깊이를 더합니다—이것이 스모크드 캐러멜이라는 요리 기법의 분자적 기반입니다.',
      '세계의 미슐랭 레스토랑들이 디저트에 훈연 원소를 추가하는 트렌드가 10년째 이어지는 이유가 있습니다. 당신이 지금 하려는 것은 그 트렌드의 최전선입니다.',
    ],
  },
  peaty_sea_sweet: {
    challenge: [
      '아일라 위스키의 요오드·피트 냄새와 감미로운 해산물—대부분의 사람들이 생선 냄새와 훈연이 만나면 비린내가 극대화될 것이라고 직감합니다.',
      '피트와 DMS(디메틸 설파이드) 해양 화합물의 만남은 향미의 충돌이 아닌 폭발처럼 느껴질 수 있습니다.',
    ],
    reward: [
      '그러나 피트는 본래 해양 지역의 이탄에서 옵니다. 아일라 섬의 피트는 해초와 조개 껍데기를 품고 있으며, 위스키의 페놀 화합물은 해산물의 DMS와 이미 분자적 친척 관계입니다. 두 개의 바다가 만나는 것—충돌이 아니라 귀향입니다.',
      '전통적으로 스코틀랜드 어부들이 훈제 생선과 함께 아일라 위스키를 마신 것은 우연이 아닙니다. 분자 미식학이 수백 년의 지역 전통을 뒤늦게 설명하고 있을 뿐입니다.',
    ],
  },
  default: {
    challenge: [
      '이 조합은 일반적인 페어링 공식을 벗어납니다. 위스키와 음식의 주요 풍미 벡터가 서로 다른 방향을 가리키고 있습니다—충돌처럼 보이는 것이 당연합니다.',
    ],
    reward: [
      '하지만 특정 분자 화합물이 다리를 놓습니다. 대조적인 두 풍미 사이에서 예상치 못한 제3의 경험이 탄생하는 것—이것이 모험적 매칭의 본질입니다. 편안한 조합만 선택하면 평생 만날 수 없는 맛입니다.',
    ],
  },
};

function buildAdventurousStory(
  whiskey: Whiskey,
  food: FoodV2,
  bridgeKey: string,
  contrastScore: number,
): string {
  const tpl = ADVENTUROUS_STORIES[bridgeKey] ?? ADVENTUROUS_STORIES.default;
  // Stable pick using whiskey+food char codes
  const seed = (whiskey.id.charCodeAt(0) + food.id.charCodeAt(0)) & 1;
  const challenge = tpl.challenge[seed % tpl.challenge.length];
  const reward = tpl.reward[seed % tpl.reward.length];

  return (
    `⚠️ 도전: ${challenge}\n\n` +
    `✨ 그러나: ${reward}\n\n` +
    `[대조 지수 ${(contrastScore * 100).toFixed(0)}pt · ${whiskey.name} × ${food.name}]`
  );
}

// ─────────────────────────────────────────────
// STANDARD STORYTELLING ENGINE
// ─────────────────────────────────────────────

const WHISKEY_DIM_LABELS = ['피트·스모키', '과일향', '달콤함', '우디·오크', '꽃향기', '바디감', '긴 피니시'];
const FOOD_DIM_LABELS = ['단맛', '짠맛', '신맛', '매운맛', '감칠맛', '지방감', '텍스처'];

const COMPOUND_STORIES: Record<string, string> = {
  vanillin: '바닐린(Vanillin) 분자가',
  guaiacol: '과이아콜(Guaiacol) 훈연 화합물이',
  phenol: '페놀(Phenol) 화합물이',
  pyrazines: '피라진(Pyrazines) 마이야르 반응물이',
  lactones: '락톤(Lactones) 달콤한 분자가',
  eugenol: '유게놀(Eugenol) 향신료 화합물이',
  furfural: '푸르푸랄(Furfural) 오크 숙성 화합물이',
  limonene: '리모넨(Limonene) 시트러스 분자가',
  linalool: '리날룰(Linalool) 꽃향기 분자가',
  tannin: '탄닌(Tannin)이',
  'dimethyl sulfide': '디메틸 설파이드(DMS) 해양 화합물이',
  amines: '아민(Amines) 감칠맛 분자가',
  capsaicin: '캡사이신(Capsaicin)이',
  'lactic acid': '젖산(Lactic acid) 발효 화합물이',
  'acetic acid': '아세트산(Acetic acid)이',
  ammonia: '암모니아 발효 화합물이',
  esters: '에스터(Esters) 과일 화합물이',
  'isoamyl acetate': '이소아밀 아세테이트 바나나 분자가',
  diacetyl: '다이아세틸(Diacetyl) 버터 분자가',
};

const SYNERGY_PHRASES: Record<string, string[]> = {
  peat_umami: [
    '강렬한 아일라의 피트 연기가 {food}의 농축된 감칠맛 아미노산과 결합, 두 가지 극단적인 맛이 충돌하는 순간 제3의 풍미—훈제 부용이 폭발합니다.',
    '위스키의 페놀 화합물이 {food}의 발효 글루타민산과 만나 입 안에서 완전히 새로운 스모키 우마미 경험을 창출합니다.',
  ],
  peat_fat: [
    '{food}의 풍부한 지방이 위스키의 피트 연기를 부드럽게 감싸 안으며, 알코올의 날카로움을 차단하는 천연 코팅막을 형성합니다.',
    '지방 분자는 페놀 화합물을 혀 위에 더 오래 붙잡아둡니다—{food} 한 점이 스모키함을 배가시키는 분자 퀄리티를 만듭니다.',
  ],
  sweet_spicy: [
    '위스키의 바닐린 분자가 {food}의 캡사이신이 점막을 자극하는 통각 수용체(TRPV1)를 부드럽게 진정시킵니다. 달콤함은 매운맛의 해독제입니다.',
    '달콤한 바닐라 향이 {food}의 강렬한 고추장 캡사이신을 화학적으로 중화—매운 뒤에 오는 달콤함의 반전이 이 페어링의 핵심입니다.',
  ],
  fruit_sour: [
    '위스키의 에스터 화합물이 {food}의 발효 신맛과 만나 복합적인 과일 산미의 하모니를 빚어냅니다.',
    '{food}의 젖산과 위스키의 리모넨이 함께 작용하여 신선한 레몬 그라스 같은 여운을 남깁니다.',
  ],
  wood_umami: [
    '위스키가 오크통에서 흡수한 탄닌과 유게놀이 {food}의 글루타민산 감칠맛을 한층 깊게 감싸 안아—마치 와인과 치즈처럼 오래된 숙성의 미학을 완성합니다.',
    '셰리 오크의 탄닌이 {food}의 우마미를 긴 피니시로 연장시킵니다. 이것이 분자 미식학이 말하는 \'결합\'입니다.',
  ],
  floral_sweet: [
    '{food}의 꿀 같은 단맛이 위스키의 리날룰 꽃향기와 결합—동양 정원의 풍경처럼 섬세한 향미 조화를 이룹니다.',
    '위스키의 플로럴 에스터가 {food}의 천연 당분과 만나 한 여름 꽃밭을 연상시키는 방향 화합물의 시너지를 만듭니다.',
  ],
  body_fat: [
    '풀 바디 위스키의 오일리한 질감이 {food}의 지방과 맞닿아 입안을 빈틈없이 코팅합니다. 알코올의 열감은 사라지고 벨벳 같은 여운만 남습니다.',
    '고 바디감 위스키의 구조가 {food}의 마블링 지방을 만나 서로의 풍미 분자를 느리게 방출—천천히 즐길수록 더 복잡해지는 조합입니다.',
  ],
  finish_texture: [
    '위스키의 긴 드라이 피니시가 {food}의 바삭한 텍스처와 리듬을 맞춥니다. 씹을 때마다 새로운 향미 레이어가 열립니다.',
    '{food}의 쫄깃한 식감이 위스키 피니시를 연장—마지막 한 모금이 길고 복잡한 여운으로 이어지는 물리적 시너지입니다.',
  ],
  default: [
    '{food}의 복합적인 풍미 구조가 위스키의 전체 스펙트럼과 자연스럽게 어우러집니다. 어느 쪽도 상대를 압도하지 않는 균형의 미학.',
    '분자 수준의 화합물 공유보다 더 중요한 것은 전반적인 텍스처와 여운의 조화입니다. 이 페어링이 그 교과서입니다.',
  ],
};

interface StoryContext {
  whiskey: Whiskey;
  food: FoodV2;
  dominantWhiskeyDim: number;
  dominantFoodDim: number;
  synergyScore: number;
  compoundShared: string[];
}

function buildStory(ctx: StoryContext): string {
  const { whiskey, food, dominantWhiskeyDim, dominantFoodDim, synergyScore, compoundShared } = ctx;
  const wLabel = WHISKEY_DIM_LABELS[dominantWhiskeyDim];
  const fLabel = FOOD_DIM_LABELS[dominantFoodDim];

  let phraseKey = 'default';
  if (dominantWhiskeyDim === 0 && dominantFoodDim === 4) phraseKey = 'peat_umami';
  else if (dominantWhiskeyDim === 0 && dominantFoodDim === 5) phraseKey = 'peat_fat';
  else if (dominantWhiskeyDim === 2 && dominantFoodDim === 3) phraseKey = 'sweet_spicy';
  else if (dominantWhiskeyDim === 1 && dominantFoodDim === 2) phraseKey = 'fruit_sour';
  else if (dominantWhiskeyDim === 3 && dominantFoodDim === 4) phraseKey = 'wood_umami';
  else if (dominantWhiskeyDim === 4 && dominantFoodDim === 0) phraseKey = 'floral_sweet';
  else if (dominantWhiskeyDim === 5 && dominantFoodDim === 5) phraseKey = 'body_fat';
  else if (dominantWhiskeyDim === 6 && dominantFoodDim === 6) phraseKey = 'finish_texture';

  const phrases = SYNERGY_PHRASES[phraseKey];
  const phraseIdx = (whiskey.id.charCodeAt(0) + food.id.charCodeAt(0)) % phrases.length;
  let narrative = phrases[phraseIdx].replace(/{food}/g, food.name);

  if (compoundShared.length > 0) {
    const key = compoundShared[0];
    const compoundPhrase = COMPOUND_STORIES[key] ?? `${key} 화합물이`;
    narrative = `[FlavorDB 분자 매칭] ${whiskey.name}과 ${food.name}이 공유하는 ${compoundPhrase} 향미 시너지의 교두보입니다.\n\n` + narrative;
  }

  narrative += `\n\n위스키의 ${wLabel} 성분(${(whiskey.flavorVector[dominantWhiskeyDim] * 100).toFixed(0)}pt)이 ${food.name}의 ${fLabel} 벡터(${(food.foodVector[dominantFoodDim] * 100).toFixed(0)}pt)와 시너지 스코어 +${synergyScore.toFixed(2)}를 기록했습니다.`;
  return narrative;
}

// ─────────────────────────────────────────────
// DAILY SEED + SEASON
// ─────────────────────────────────────────────

function getDailySeed(date: Date, whiskeyId: string): number {
  const dateStr = date.toISOString().slice(0, 10);
  return (dateStr + whiskeyId)
    .split('')
    .reduce((acc, c) => (acc * 31 + c.charCodeAt(0)) & 0xfffffff, 7);
}

function getCurrentSeason(): Season {
  const m = new Date().getMonth() + 1;
  if (m >= 3 && m <= 5) return 'spring';
  if (m >= 6 && m <= 8) return 'summer';
  if (m >= 9 && m <= 11) return 'fall';
  return 'winter';
}

// ─────────────────────────────────────────────
// PUBLIC API
// ─────────────────────────────────────────────

export interface PairingResultSet {
  low: PairingResult;
  medium: PairingResult;
  high: PairingResult;
  adventurous: AdventurousResult;
}

export function getPairingsV2(
  whiskey: Whiskey,
  date: Date = new Date(),
): PairingResultSet {
  const season = getCurrentSeason();
  const dailySeed = getDailySeed(date, whiskey.id);

  // ── Standard scoring ──
  const scored = FOOD_DB_V2.map(food => {
    const synergyScore = calcSynergyScore(whiskey, food);
    const compoundBonus = calcCompoundBonus(whiskey, food);
    const seasonBoost = food.season?.includes(season) ? 0.4 : 0;
    const totalScore = synergyScore + compoundBonus + seasonBoost;

    const wv = whiskey.flavorVector;
    const fv = food.foodVector;
    const dominantWhiskeyDim = wv.indexOf(Math.max(...wv));
    const dominantFoodDim = fv.indexOf(Math.max(...fv));
    const compoundShared = whiskey.compounds.filter(c => food.compounds.includes(c));

    const story = buildStory({ whiskey, food, dominantWhiskeyDim, dominantFoodDim, synergyScore: totalScore, compoundShared });
    return { food, score: totalScore, synergyScore, story, todayPick: false };
  });

  const getTopForTier = (tier: FoodTier): PairingResult => {
    const tierItems = scored.filter(s => s.food.tier === tier);
    tierItems.sort((a, b) => b.score - a.score);
    const candidates = tierItems.slice(0, 5);
    if (candidates.length === 0) {
      const fallback = scored[0] ?? { food: FOOD_DB_V2[0], score: 0, synergyScore: 0, story: '', todayPick: false };
      return { ...fallback, todayPick: true };
    }
    const idx = dailySeed % candidates.length;
    return { ...candidates[idx], todayPick: true };
  };

  // ── Adventurous scoring ──
  const adventurousScored: (AdventurousResult & { _raw: number })[] = [];

  for (const food of FOOD_DB_V2) {
    const normalSynergy = calcSynergyScore(whiskey, food);

    // Contrast: we want foods with LOW normal synergy
    // Normalize: synergy range is roughly 0~5; contrast = 1 when synergy=0
    const maxSynergy = 5;
    const contrastScore = Math.max(0, 1 - normalSynergy / maxSynergy);

    // Find first matching bridge rule
    let bestBridge: BridgeRule | null = null;
    let bestBridgeScore = 0;
    for (const rule of BRIDGE_RULES) {
      if (rule.check(whiskey, food) && rule.score > bestBridgeScore) {
        bestBridge = rule;
        bestBridgeScore = rule.score;
      }
    }

    if (!bestBridge) continue; // only adventurous if a bridge rule fires

    // Adventurous score = contrast matters, but bridge score drives quality
    const adventurousScore = contrastScore * 0.4 + (bestBridgeScore / 3.0) * 0.6;

    adventurousScored.push({
      food,
      adventurousScore,
      contrastScore,
      bridgeKey: bestBridge.key,
      bridgeLabel: bestBridge.label,
      story: buildAdventurousStory(whiskey, food, bestBridge.key, contrastScore),
      _raw: adventurousScore,
    });
  }

  // Sort by adventurous score, pick daily-rotating from top-8
  adventurousScored.sort((a, b) => b._raw - a._raw);
  const advCandidates = adventurousScored.slice(0, 8);

  let adventurous: AdventurousResult;
  if (advCandidates.length === 0) {
    // No bridge rule fired — fall back to the highest-contrast food
    const fallbackFood = FOOD_DB_V2.reduce((best, food) => {
      const s = Math.max(0, 1 - calcSynergyScore(whiskey, food) / 5);
      const bs = Math.max(0, 1 - calcSynergyScore(whiskey, best) / 5);
      return s > bs ? food : best;
    }, FOOD_DB_V2[0]);
    adventurous = {
      food: fallbackFood,
      adventurousScore: 0,
      contrastScore: 1,
      bridgeKey: 'none',
      bridgeLabel: '이색 조합',
      story: `${whiskey.name}의 독특한 풍미와 ${fallbackFood.name}의 대조적인 맛이 의외의 하모니를 만듭니다.`,
    };
  } else {
    const advIdx = dailySeed % advCandidates.length;
    const { _raw: _r, ...adv } = advCandidates[advIdx];
    adventurous = adv;
  }

  return {
    low: getTopForTier('low'),
    medium: getTopForTier('medium'),
    high: getTopForTier('high'),
    adventurous,
  };
}


export { FOOD_CATEGORY_LABELS } from './food-db';
