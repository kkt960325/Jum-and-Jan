"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Check } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { type FlavorVector, serializeVector } from '@/lib/vector-engine';

interface TasteTrait {
  id: string;
  label: string;
  category: string;
  // [Peat, Fruit, Sweet, Wood, Floral, Body, Finish] 기여량
  contribution: FlavorVector;
}

const TASTE_TRAITS: TasteTrait[] = [
  // 맛
  { id: 'sweet',      label: '단맛 (Sweetness)',          category: '맛',   contribution: [0.00, 0.10, 0.50, 0.00, 0.10, 0.10, 0.10] },
  { id: 'peat',       label: '스모키함/피트 (Smokiness)',   category: '맛',   contribution: [0.60, 0.00, 0.00, 0.00, 0.00, 0.20, 0.20] },
  { id: 'acidity',    label: '산미/시트러스 (Acidity)',     category: '맛',   contribution: [0.00, 0.40, 0.10, 0.00, 0.20, 0.00, 0.00] },
  { id: 'nutty',      label: '너티함/견과류 (Nuttiness)',   category: '맛',   contribution: [0.00, 0.00, 0.20, 0.30, 0.00, 0.20, 0.20] },
  // 바디감
  { id: 'heavy_body', label: '무거운 바디감 (Heavy Body)', category: '바디감', contribution: [0.10, 0.00, 0.10, 0.20, 0.00, 0.50, 0.30] },
  { id: 'light_body', label: '가벼운 바디감 (Light Body)', category: '바디감', contribution: [0.00, 0.20, 0.20, 0.00, 0.40, 0.00, 0.00] },
  // 도수감
  { id: 'high_abv',   label: '강렬한 타격감 (High ABV)',  category: '도수감', contribution: [0.20, 0.00, 0.00, 0.30, 0.00, 0.40, 0.40] },
  { id: 'low_abv',    label: '부드러운 목넘김 (Smooth)',   category: '도수감', contribution: [0.00, 0.10, 0.20, 0.00, 0.30, 0.10, 0.10] },
  // 향
  { id: 'fruity',     label: '과일향 (Fruity)',            category: '향',   contribution: [0.00, 0.50, 0.10, 0.00, 0.20, 0.00, 0.00] },
  { id: 'floral',     label: '꽃향 (Floral)',              category: '향',   contribution: [0.00, 0.10, 0.10, 0.00, 0.50, 0.00, 0.00] },
  { id: 'spicy',      label: '스파이시 (Spicy)',           category: '향',   contribution: [0.20, 0.00, 0.00, 0.40, 0.00, 0.30, 0.20] },
  { id: 'woody',      label: '오크/나무향 (Woody)',         category: '향',   contribution: [0.00, 0.00, 0.10, 0.50, 0.00, 0.30, 0.30] },
];

const BASE_VECTOR: FlavorVector = [0.15, 0.15, 0.15, 0.15, 0.15, 0.15, 0.15];

export function TasteChecklist() {
  const [selectedTraits, setSelectedTraits] = useState<Set<string>>(new Set());
  const router = useRouter();

  const MUTUAL_EXCLUSIVE: Record<string, string> = {
    heavy_body: 'light_body',
    light_body: 'heavy_body',
    high_abv:   'low_abv',
    low_abv:    'high_abv',
  };

  const toggleTrait = (id: string) => {
    const next = new Set(selectedTraits);
    if (next.has(id)) {
      next.delete(id);
    } else {
      const opposite = MUTUAL_EXCLUSIVE[id];
      if (opposite) next.delete(opposite);
      next.add(id);
    }
    setSelectedTraits(next);
  };

  const calculateVector = (): FlavorVector => {
    const result: FlavorVector = [...BASE_VECTOR] as FlavorVector;
    selectedTraits.forEach(id => {
      const trait = TASTE_TRAITS.find(t => t.id === id);
      if (trait) {
        trait.contribution.forEach((delta, i) => {
          result[i] = Math.min(1, result[i] + delta);
        });
      }
    });
    return result;
  };

  const handleSubmit = () => {
    const vector = calculateVector();
    router.push(`/recommendation?v=${serializeVector(vector)}`);
  };

  const categories = Array.from(new Set(TASTE_TRAITS.map(t => t.category)));

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="text-center space-y-2 mb-8">
        <h2 className="text-3xl md:text-4xl font-bold font-serif text-brown-900">당신의 취향을 모두 골라주세요</h2>
        <p className="text-brown-900/70 font-light">다중 선택이 가능합니다. 선택할수록 정밀한 벡터가 생성됩니다.</p>
      </div>

      <div className="space-y-6">
        {categories.map(category => (
          <Card key={category} className="p-6 md:p-8 bg-white border border-olive-900/10 shadow-sm rounded-sm">
            <h3 className="text-xl font-serif font-semibold text-olive-900 mb-6 px-2">{category}</h3>
            <div className="flex flex-wrap gap-3">
              {TASTE_TRAITS.filter(t => t.category === category).map(trait => {
                const isSelected = selectedTraits.has(trait.id);
                return (
                  <button
                    key={trait.id}
                    onClick={() => toggleTrait(trait.id)}
                    className={`
                      flex items-center gap-2 px-6 py-3 rounded-sm border transition-all duration-300 select-none text-sm tracking-wide
                      ${isSelected
                        ? 'bg-olive-900 border-olive-900 text-cream-100 shadow-md'
                        : 'bg-cream-100 border-brown-900/10 text-brown-900 hover:border-olive-900/30 hover:bg-cream-200'}
                    `}
                  >
                    {isSelected && <Check className="w-4 h-4" />}
                    <span className="font-medium">{trait.label}</span>
                  </button>
                );
              })}
            </div>
          </Card>
        ))}
      </div>

      <div className="flex justify-center pt-8 pb-12">
        <div className="flex flex-col items-center gap-3">
          <Button
            className="px-12 py-5 shadow-lg shadow-olive-900/20"
            onClick={handleSubmit}
            disabled={selectedTraits.size === 0}
          >
            {selectedTraits.size === 0 ? '항목을 선택해주세요' : `${selectedTraits.size}개 선택 — 맛의 지도 보기`}
          </Button>
          {selectedTraits.size === 0 && (
            <p className="text-sm text-olive-700 animate-pulse mt-2">
              * 최소 1개 이상 선택해 주세요.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
