import { Whiskey, Food, FOOD_DB } from './data';

export interface MatchResult {
  food: Food;
  score: number;
  reason: string;
}

export class ScientificMatcher {
  /**
   * 주어진 위스키에 대해 3단계(Low, Medium, High) 가격대별 최적의 페어링을 추천합니다.
   */
  static getRecommendations(whiskey: Whiskey): Record<'low' | 'medium' | 'high', MatchResult> {
    const scoredFoods = FOOD_DB.map(food => {
      const match = this.calculateMatch(whiskey, food);
      return { food, score: match.score, reason: match.reason };
    });

    const getBestForTier = (tier: 'low' | 'medium' | 'high') => {
      const tierFoods = scoredFoods.filter(f => f.food.tier === tier);
      return tierFoods.reduce((prev, current) => (prev.score > current.score) ? prev : current);
    };

    return {
      low: getBestForTier('low'),
      medium: getBestForTier('medium'),
      high: getBestForTier('high')
    };
  }

  /**
   * 위스키와 특정 음식 간의 과학적 매칭 점수와 사유를 계산합니다.
   */
  static calculateMatch(whiskey: Whiskey, food: Food): { score: number, reason: string } {
    let score = 0;
    let reasons: string[] = [];

    // 1. Molecular Match (FlavorDB 기반 화합물 교집합)
    const sharedCompounds = whiskey.compounds.filter(c => food.compounds.includes(c));
    if (sharedCompounds.length > 0) {
      score += sharedCompounds.length * 20;
      const compoundNames = sharedCompounds.map(c => `'${c}'`).join(', ');
      reasons.push(`[FlavorDB 매칭] 식재료와 위스키가 분자 단위에서 ${compoundNames} 화합물을 명확히 공유하여 후각/미각적 시너지를 극대화합니다.`);
    }

    // 2. Khymos 가설: Pyrazine 매칭
    if (food.compounds.includes('pyrazines') && (whiskey.taste.includes('nutty') || whiskey.aroma.includes('grain'))) {
      score += 15;
      reasons.push(`[Khymos 마이야르 가설] 조리/발효 중 생성된 피라진(Pyrazine) 성분이 위스키 고유의 고소한 곡물/견과류 풍미와 분자적으로 강하게 결합합니다.`);
    }

    // 3. 특수 분자 결합: Phenol (Peat) + Ammonia / Fermentation (Hongeo) Interaction
    if (whiskey.compounds.includes('phenol') && food.compounds.includes('ammonia')) {
      score += 40; // 특수 화학 매칭에 매우 높은 가점
      reasons.push(`[극강의 화학적 상쇄] 피트 위스키의 강력한 페놀(Phenols) 화합물이 삭힌 음식의 암모니아(Ammonia) 향을 과학적으로 억누르고, 수육의 지방이 알코올 텍스처를 코팅하는 완벽한 밸런스를 보여줍니다.`);
    }

    // 4. 한식 특화: Capsaicin (매운맛) 연관성
    if (food.capsaicinLevel > 4) {
      if (whiskey.abv >= 50 || whiskey.profileType === 'peaty_bold') {
        score -= 10;
        reasons.push(`[매운맛 충돌 경고] 고도수 알코올과 강한 피트 향은 캡사이신(Capsaicin)의 통각 수용체를 과도하게 자극할 수 있습니다.`);
      } else if (whiskey.taste.includes('sweet') || whiskey.profileType === 'sweet_heavy') {
        score += 25;
        reasons.push(`[캡사이신 중화] 위스키의 바닐린(Vanillin) 등 달콤한 분자 구조가 한식 특유의 강렬한 캡사이신을 부드럽게 감싸안아 줍니다.`);
      }
    }

    // 5. 한식 특화: Fermentation (장류/김치 발효) 연관성
    if (food.fermentationLevel > 4 && !food.compounds.includes('ammonia')) {
      if (whiskey.compounds.includes('tannin') || whiskey.aroma.includes('oak')) {
        score -= 5;
        if (reasons.length === 0) {
          reasons.push(`주의: 발효 식품의 젖산(Lactic acid)이 위스키의 탄닌(Tannin)과 만나 떫은 맛을 강조할 우려가 있습니다.`);
        }
      } 
      
      if (whiskey.profileType === 'peaty_bold' || whiskey.profileType === 'spicy_woody') {
        score += 20;
        reasons.push(`[우마미 시너지] 발효 과정에서 응축된 아미노산(Umami)이 위스키의 강렬한 바디감과 만나 입안을 꽉 채우는 풍미 폭발을 일으킵니다.`);
      }
    }

    // 6. 일반적인 Taste Profile (단짠 대조 등)
    if (whiskey.taste.includes('sweet') && food.taste.includes('salty')) {
      score += 10;
      reasons.push(`[단짠 대조 효과] 단맛과 짠맛의 완벽한 대비(Contrast)가 침샘을 강하게 자극합니다.`);
    }

    if (reasons.length === 0) {
      score += 5;
      reasons.push(`기본적인 텍스처와 향미의 조화가 무난하게 어울립니다.`);
    }

    return { score, reason: reasons.join('\n\n') }; // 구분을 위해 줄바꿈 두 번 사용
  }
}
