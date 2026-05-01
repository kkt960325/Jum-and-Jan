export const WHISKEY_DATA = [
  {
    id: 'balvenie-12',
    name: '발베니 12년 더블우드',
    description: '달콤한 바닐라 향과 부드러운 꿀 맛이 특징인 싱글 몰트 위스키. 어떤 분위기에서도 편안하게 즐길 수 있습니다.',
    tags: ['달콤한 맛', '바닐라와 캬라멜']
  },
  {
    id: 'laphroaig-10',
    name: '라프로익 10년',
    description: '강렬한 피트 향과 스모키함, 바다의 짠맛이 매력적인 아일라 위스키.',
    tags: ['스모키한 맛', '피트와 스모크']
  }
];

export const HANSIK_PAIRING_DATA = [
  {
    whiskeyId: 'balvenie-12',
    name: '간장 양념 떡갈비',
    description: '달착지근하고 짭조름한 간장 베이스의 떡갈비는 발베니의 캬라멜, 꿀 풍미와 완벽한 조화를 이룹니다.'
  },
  {
    whiskeyId: 'laphroaig-10',
    name: '해물 파전과 굴무침',
    description: '바다의 풍미를 담은 해산물과 굴무침은 라프로익의 피트향, 짠맛을 더욱 극대화시켜 줍니다.'
  }
];

export const PROFILE_INFO: Record<string, { title: string, desc: string, primaryWhiskeyId: string }> = {
  sweet_heavy: { 
    title: '스위트 & 헤비 (Sweet & Heavy)', 
    desc: '달콤한 풍미와 묵직한 바디감을 선호하시는군요. 깊고 진한 여운을 남기는 위스키가 제격입니다.',
    primaryWhiskeyId: 'balvenie-12'
  },
  peaty_bold: { 
    title: '피티 & 볼드 (Peaty & Bold)', 
    desc: '강렬한 스모키함과 타격감을 즐기시는군요. 피트 향이 물씬 풍기는 아일라 위스키의 매력에 빠져보세요.',
    primaryWhiskeyId: 'laphroaig-10'
  },
  citrus_light: { 
    title: '시트러스 & 라이트 (Citrus & Light)', 
    desc: '산뜻하고 화사한 과일/꽃 향과 가벼운 바디감을 좋아하시네요. 싱그럽고 부드러운 위스키를 추천합니다.',
    primaryWhiskeyId: 'balvenie-12'
  },
  smooth_nutty: { 
    title: '스무스 & 너티 (Smooth & Nutty)', 
    desc: '부드러운 목넘김과 고소한 견과류의 풍미를 선호하시는군요. 마시기 편하고 고소한 블렌디드 위스키가 좋습니다.',
    primaryWhiskeyId: 'balvenie-12'
  },
  spicy_woody: { 
    title: '스파이시 & 우디 (Spicy & Woody)', 
    desc: '강렬한 향신료와 오크통의 깊은 나무 향을 즐기시는군요. 숙성감이 느껴지는 강인한 위스키를 추천합니다.',
    primaryWhiskeyId: 'laphroaig-10'
  }
};
