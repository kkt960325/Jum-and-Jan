'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/Card';

interface CompoundTagsProps {
  compounds: string[];
}

// Map of chemical compounds to their flavor profiles
const FLAVOR_MAP: Record<string, { flavor: string; description: string }> = {
  vanillin: { flavor: '바닐라 (Vanilla)', description: '달콤하고 부드러운 바닐라 향. 오크통 숙성 과정에서 리그닌이 분해되며 생성됩니다.' },
  eugenol: { flavor: '정향/스파이시 (Clove/Spicy)', description: '매콤하고 알싸한 정향 나무 향. 주로 유러피안 오크통(셰리 캐스크)에서 숙성 시 많이 나타납니다.' },
  lactones: { flavor: '코코넛/우디 (Coconut/Woody)', description: '달콤한 코코넛과 버터 같은 질감. 아메리칸 화이트 오크통의 상징적인 향미입니다.' },
  furfural: { flavor: '아몬드/캐러멜 (Almond/Caramel)', description: '구운 빵, 견과류, 캐러멜 향. 마이야르 반응을 통해 주로 생성되는 고소한 향입니다.' },
  guaiacol: { flavor: '스모키/약재 (Smoky/Medicinal)', description: '타는 나무 냄새와 약재 향. 피트(이탄)를 태워 맥아를 건조할 때 스며듭니다.' },
  phenol: { flavor: '소독약/피트 (Phenolic/Peaty)', description: '병원 소독약, 요오드, 갯벌 향. 아일라(Islay) 위스키의 가장 대표적인 강렬한 캐릭터입니다.' },
  syringol: { flavor: '스모키 (Smoky/Charcoal)', description: '장작불이 타오르는 스모키한 향. 피트 처리된 위스키에서 발견됩니다.' },
  cresol: { flavor: '약품/흙 (Medicinal/Earthy)', description: '아스팔트 타르, 반창고, 흙내음. 강렬한 피트 위스키를 특징짓는 주요 성분입니다.' },
  limonene: { flavor: '시트러스 (Citrus)', description: '상큼한 오렌지, 레몬 향. 발효 과정에서 생성되는 가벼운 에스테르 화합물입니다.' },
  linalool: { flavor: '꽃/라벤더 (Floral/Lavender)', description: '화사한 꽃향기와 은은한 허브 향. 증류기의 목이 높을수록(예: 글렌모렌지) 잘 보존됩니다.' },
  esters: { flavor: '과일 캔디 (Fruity/Candy)', description: '서양배, 바나나, 파인애플 등 달콤한 과일 캔디 향. 효모의 발효 작용에서 탄생합니다.' },
  'isoamyl acetate': { flavor: '바나나 (Banana)', description: '잘 익은 바나나 풍미. 주로 에스테르 화합물에서 기인하며 달콤한 바디감을 더해줍니다.' },
  tannin: { flavor: '타닌 (Tannic/Dry)', description: '떫은 맛과 드라이함, 스파이시함. 나무통 자체에서 추출되어 와인처럼 바디감을 줍니다.' },
  acetaldehyde: { flavor: '풋사과 (Green Apple)', description: '신선하고 상쾌한 풋사과 향. 산화 과정이나 발효 초기에 생성되는 산뜻한 향미입니다.' },
  pyrazines: { flavor: '로스팅/고소함 (Roasted/Nutty)', description: '구운 커피, 초콜릿, 볶은 견과류의 고소한 향. 열을 가하는 마이야르 반응의 핵심 성분입니다.' },
  diacetyl: { flavor: '버터 (Buttery)', description: '진하고 부드러운 버터 스카치 향. 유산균 발효 과정에서 생성되며 바디감을 둥글게 만들어줍니다.' },
  capsaicin: { flavor: '매운맛 (Spicy/Hot)', description: '혀를 자극하는 통각 반응. 위스키의 스파이시(Eugenol 등)와 결합하면 자극이 극대화됩니다.' },
  'allyl propyl disulfide': { flavor: '양파/알싸함 (Pungent)', description: '양파, 마늘의 알싸하고 매운 향미.' },
  'dimethyl sulfide': { flavor: '바다/해조류 (Marine/Vegetal)', description: '김, 다시마, 바다 내음, 또는 삶은 옥수수 향. 해안가 증류소 위스키와 해산물의 연결 고리입니다.' },
  allicin: { flavor: '마늘 (Garlic)', description: '마늘 특유의 톡 쏘는 향. 위스키의 알코올 도수(ABV)에 의해 매운맛이 씻겨 내려갑니다.' },
  ammonia: { flavor: '암모니아 (Ammoniacal)', description: '홍어 등 고도 발효 식품 특유의 톡 쏘는 향. 강렬한 피트 위스키와 충돌하며 독특한 페어링을 만듭니다.' },
  'lactic acid': { flavor: '유산균 (Lactic/Sour)', description: '신맛과 감칠맛. 삭힌 음식이나 발효 유제품의 깊은 맛을 냅니다.' }
};

export function CompoundTags({ compounds }: { compounds: string[] }) {
  const [selectedCompound, setSelectedCompound] = useState<string | null>(null);

  const handleOpen = (compound: string) => {
    setSelectedCompound(compound);
  };

  const handleClose = () => {
    setSelectedCompound(null);
  };

  return (
    <>
      <div className="flex flex-wrap gap-2">
        {compounds.map((c) => (
          <button
            key={c}
            onClick={() => handleOpen(c)}
            className="px-3 py-1.5 text-xs rounded-full bg-white text-black font-semibold border border-black/10 hover:bg-black hover:text-white transition-all cursor-pointer shadow-sm tracking-wide"
          >
            {c}
          </button>
        ))}
      </div>

      {/* Flavor Card Modal */}
      {selectedCompound && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-brown-900/40 backdrop-blur-sm animate-in fade-in duration-200"
          onClick={handleClose}
        >
          <div 
            className="bg-cream-100 w-full max-w-sm rounded-md shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="bg-olive-900 p-4 text-cream-100 flex justify-between items-center">
              <h4 className="font-mono text-sm font-semibold tracking-wider">{selectedCompound}</h4>
              <button 
                onClick={handleClose}
                className="text-cream-100/50 hover:text-cream-100 transition-colors"
              >
                ✕
              </button>
            </div>
            <div className="p-6">
              <div className="mb-4">
                <span className="text-xs font-bold text-brown-900/50 uppercase tracking-widest mb-1 block">Flavor Profile</span>
                <p className="text-xl font-serif font-bold text-brown-900">
                  {FLAVOR_MAP[selectedCompound]?.flavor || '알 수 없는 향미 (Unknown)'}
                </p>
              </div>
              <div>
                <span className="text-xs font-bold text-brown-900/50 uppercase tracking-widest mb-1 block">Science Note</span>
                <p className="text-brown-900/80 font-light leading-relaxed">
                  {FLAVOR_MAP[selectedCompound]?.description || '해당 화합물에 대한 상세 정보가 데이터베이스에 없습니다.'}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
