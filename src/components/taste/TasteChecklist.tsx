'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, ChevronRight, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { type FlavorVector, serializeVector } from '@/lib/vector-engine';

// ── 7D vector dims: [Peat, Fruit, Sweet, Wood, Floral, Body, Finish] ─

interface SubTag {
  id: string;
  emoji: string;
  label: string;
  hint: string;
  delta: FlavorVector;  // additive weight on top of mood base
}

interface Mood {
  id: string;
  emoji: string;
  title: string;
  subtitle: string;
  keywords: string;
  accentClass: string;  // one Tailwind color token e.g. "amber"
  vector: FlavorVector;
  subtags: SubTag[];
}

// ── Mood + SubTag data ────────────────────────────────────────────────
const MOODS: Mood[] = [
  {
    id: 'smoky',
    emoji: '🔥',
    title: '피티드 · 스모키 (Peated / Smoky)',
    subtitle: '장작불·모닥불 같은 훈연향 — 아일라의 야생적 피트',
    keywords: 'Islay · Campbeltown · Laphroaig · Ardbeg · Talisker',
    accentClass: 'amber',
    vector: [0.65, 0.05, 0.10, 0.20, 0.00, 0.45, 0.60],
    subtags: [
      { id: 'mist_smoke',      emoji: '🌫️', label: '소프트 스모크 (Soft Smoke)',     hint: '안개처럼 은은하게 퍼지는 훈연',
        delta: [-0.25, 0.00, +0.08, 0.00, 0.00, -0.05, -0.15] as FlavorVector },
      { id: 'campfire',        emoji: '🪵', label: '캠프파이어 / 우드 스모크',        hint: '따뜻하고 나무 향이 도는 장작 연기',
        delta: [+0.05, 0.00, 0.00, +0.10, 0.00, 0.00, +0.05] as FlavorVector },
      { id: 'medicinal_peat',  emoji: '🏥', label: '헤비 피트 / 메디시널 (Heavy Peat)', hint: '요오드·약품향, 강렬한 아일라 스타일',
        delta: [+0.25, 0.00, -0.10, 0.00, 0.00, +0.05, +0.15] as FlavorVector },
      { id: 'sea_smoke',       emoji: '🐚', label: '브라이니 피트 (Coastal / Briny)', hint: '소금기·해풍이 섞인 해안형 피트',
        delta: [+0.12, +0.05, 0.00, 0.00, 0.00, 0.00, +0.05] as FlavorVector },
      { id: 'sweet_smoke',     emoji: '🍬', label: '스위트 스모크 (Sweet Smoke)',     hint: '스모키하면서도 달달한 균형감',
        delta: [-0.10, 0.00, +0.22, 0.00, 0.00, 0.00, 0.00] as FlavorVector },
    ],
  },
  {
    id: 'fruity',
    emoji: '🍎',
    title: '프루티 · 에스테리 (Fruity / Estery)',
    subtitle: '에스터가 만드는 과실·꽃향 — 상큼하고 생동감 있는',
    keywords: 'Speyside · Irish · Japanese · Glenlivet · Glenfarclas',
    accentClass: 'emerald',
    vector: [0.00, 0.65, 0.30, 0.10, 0.55, 0.30, 0.35],
    subtags: [
      { id: 'green_citrus',   emoji: '🍏', label: '그린 프루트 (Green Fruit)',       hint: '청사과·레몬의 톡 쏘는 청량감',
        delta: [0.00, +0.15, -0.10, 0.00, +0.12, -0.12, -0.05] as FlavorVector },
      { id: 'peach_apricot',  emoji: '🍑', label: '스톤 프루트 (Stone Fruit)',       hint: '복숭아·살구의 달콤한 핵과향',
        delta: [0.00, +0.10, +0.15, 0.00, +0.05, +0.05, +0.10] as FlavorVector },
      { id: 'tropical',       emoji: '🍍', label: '트로피컬 에스테르 (Tropical)',    hint: '망고·파인애플 같은 이국적 에스터',
        delta: [0.00, +0.22, +0.08, 0.00, -0.05, 0.00, +0.05] as FlavorVector },
      { id: 'grape_raisin',   emoji: '🍇', label: '다크 프루트 / 레이즌 (Dark Fruit)', hint: '포도·건포도, 셰리 숙성 과실미',
        delta: [0.00, +0.05, +0.15, +0.10, 0.00, +0.10, +0.10] as FlavorVector },
      { id: 'spring_floral',  emoji: '🌸', label: '플로럴 / 재스민 (Floral)',        hint: '섬세한 봄꽃·재스민 향',
        delta: [0.00, -0.05, 0.00, 0.00, +0.32, -0.10, 0.00] as FlavorVector },
    ],
  },
  {
    id: 'sweet',
    emoji: '🍯',
    title: '스위트 · 몰티 (Sweet / Malty)',
    subtitle: '바닐라·꿀·캐러멜 — 버번·셰리 캐스크의 달콤한 숙성미',
    keywords: 'Bourbon Cask · Sherry Cask · Highland · Glenmorangie',
    accentClass: 'yellow',
    vector: [0.00, 0.25, 0.75, 0.45, 0.20, 0.60, 0.60],
    subtags: [
      { id: 'vanilla_cream',    emoji: '🍦', label: '바닐라 / 크림 (Vanilla · Cream)',      hint: '버번 캐스크 숙성, 크리미한 달콤함',
        delta: [0.00, 0.00, +0.12, +0.10, +0.10, +0.05, +0.05] as FlavorVector },
      { id: 'honey_sugar',      emoji: '🍯', label: '허니 / 몰트 슈거 (Honey · Malt)',       hint: '따뜻하게 녹는 꿀·황설탕',
        delta: [0.00, +0.10, +0.15, 0.00, 0.00, +0.05, +0.10] as FlavorVector },
      { id: 'caramel_toffee',   emoji: '🍮', label: '캐러멜 / 토피 (Caramel · Toffee)',      hint: '구운 설탕·버터스카치',
        delta: [0.00, 0.00, +0.10, +0.10, 0.00, +0.15, +0.15] as FlavorVector },
      { id: 'dark_choc_coffee', emoji: '🍫', label: '다크 초콜릿 / 에스프레소 (Dark Roast)', hint: '쌉싸름한 깊이 있는 단맛',
        delta: [0.00, 0.00, -0.05, +0.22, 0.00, +0.10, +0.18] as FlavorVector },
      { id: 'sherry_sweet',     emoji: '🍷', label: '셰리 / 다크 프루트 (Sherry Cask)',      hint: '셰리 캐스크 숙성, 건자두·농후한 과실',
        delta: [0.00, +0.15, +0.10, +0.10, 0.00, +0.15, +0.15] as FlavorVector },
    ],
  },
  {
    id: 'woody',
    emoji: '🌲',
    title: '우디 · 스파이시 (Woody / Spicy)',
    subtitle: '오크 타닌·후추·계피 — 묵직하고 복합적인 숙성 스파이스',
    keywords: 'American Bourbon · Rye · Full-bodied · Four Roses',
    accentClass: 'orange',
    vector: [0.10, 0.10, 0.25, 0.75, 0.10, 0.70, 0.65],
    subtags: [
      { id: 'fresh_oak',      emoji: '🪵', label: '프레시 오크 (Fresh Oak)',          hint: '깔끔하고 신선한 새 오크향',
        delta: [0.00, 0.00, 0.00, +0.15, 0.00, +0.08, +0.10] as FlavorVector },
      { id: 'earthy_autumn',  emoji: '🍂', label: '어시 / 오터멀 (Earthy · Autumnal)', hint: '낙엽·흙 내음, 가을숲 분위기',
        delta: [+0.05, 0.00, 0.00, +0.12, 0.00, +0.05, +0.10] as FlavorVector },
      { id: 'pepper_ginger',  emoji: '🌶️', label: '페퍼 / 스파이스 (Pepper · Spice)', hint: '후추·계피·생강의 입안 열감',
        delta: [+0.10, 0.00, 0.00, +0.10, 0.00, +0.15, +0.10] as FlavorVector },
      { id: 'leather_tobacco',emoji: '🥃', label: '레더 / 타바코 (Leather · Tobacco)', hint: '묵직한 가죽·담배의 복합미',
        delta: [+0.05, 0.00, 0.00, +0.15, 0.00, +0.18, +0.12] as FlavorVector },
      { id: 'wine_sherry',    emoji: '🍾', label: '셰리 / 와인 피니시 (Wine Finish)',  hint: '와인통 피니시의 달콤하고 깊은 오크',
        delta: [0.00, +0.15, +0.12, 0.00, 0.00, +0.10, +0.15] as FlavorVector },
    ],
  },
  {
    id: 'smooth',
    emoji: '🌊',
    title: '라이트 · 델리킷 (Light / Delicate)',
    subtitle: '가볍고 섬세한 꽃·곡물향 — 목 넘김이 부드러운 입문 친화',
    keywords: 'Irish · Japanese · Lowland · Jameson · Nikka',
    accentClass: 'sky',
    vector: [0.05, 0.45, 0.35, 0.15, 0.45, 0.20, 0.30],
    subtags: [
      { id: 'water_light',   emoji: '💧', label: '라이트 바디 (Light Body)',         hint: '물처럼 가볍고 청량한 피니시',
        delta: [0.00, +0.10, +0.10, -0.12, +0.10, -0.20, -0.10] as FlavorVector },
      { id: 'creamy_milk',   emoji: '🥛', label: '크리미 / 미디엄 바디 (Creamy)',    hint: '우유처럼 부드러운 질감',
        delta: [0.00, -0.05, +0.15, +0.10, -0.05, +0.28, +0.12] as FlavorVector },
      { id: 'grassy_herb',   emoji: '🌿', label: '그래시 / 허벌 (Grassy · Herbal)', hint: '신선한 풀·허브 내음',
        delta: [0.00, +0.10, 0.00, 0.00, +0.22, -0.05, 0.00] as FlavorVector },
      { id: 'mineral_salt',  emoji: '🧂', label: '미네랄 / 솔티 (Mineral · Salty)', hint: '은은한 미네랄·소금기',
        delta: [+0.05, +0.10, 0.00, 0.00, +0.10, 0.00, +0.05] as FlavorVector },
      { id: 'malty_grain',   emoji: '🌾', label: '몰티 / 그레인 (Malty · Grain)',   hint: '고소하고 담백한 보리·곡물향',
        delta: [0.00, +0.05, +0.10, +0.10, 0.00, +0.10, +0.05] as FlavorVector },
    ],
  },
];

// ── Vector calculation ─────────────────────────────────────────────────
function buildVector(
  selectedMoods: Set<string>,
  selectedSubtags: Map<string, Set<string>>,
): FlavorVector {
  if (selectedMoods.size === 0) return [0.15, 0.15, 0.15, 0.15, 0.15, 0.15, 0.15];

  const acc = [0, 0, 0, 0, 0, 0, 0];
  for (const moodId of selectedMoods) {
    const mood = MOODS.find(m => m.id === moodId)!;
    mood.vector.forEach((v, i) => { acc[i] += v; });
    for (const subId of (selectedSubtags.get(moodId) ?? new Set())) {
      const sub = mood.subtags.find(s => s.id === subId)!;
      sub.delta.forEach((d, i) => { acc[i] += d; });
    }
  }
  const n = selectedMoods.size;
  return acc.map(v => Math.min(1, Math.max(0, v / n))) as FlavorVector;
}

// ── Per-accent Tailwind class map ──────────────────────────────────────
// Tailwind JIT needs full class strings — no dynamic interpolation
const ACCENT: Record<string, {
  cardIdle: string; cardSel: string;
  tagIdle: string;  tagSel: string;
  subtitleBar: string;
}> = {
  amber: {
    cardIdle:    'bg-stone-50 border-stone-200 hover:border-amber-300 hover:bg-amber-50/30',
    cardSel:     'bg-amber-50 border-amber-400 shadow-amber-100',
    tagIdle:     'bg-white border-stone-200 text-stone-700 hover:border-amber-300 hover:bg-amber-50',
    tagSel:      'bg-amber-500 border-amber-500 text-white',
    subtitleBar: 'bg-amber-50 border-amber-100',
  },
  emerald: {
    cardIdle:    'bg-stone-50 border-stone-200 hover:border-emerald-300 hover:bg-emerald-50/30',
    cardSel:     'bg-emerald-50 border-emerald-400 shadow-emerald-100',
    tagIdle:     'bg-white border-stone-200 text-stone-700 hover:border-emerald-300 hover:bg-emerald-50',
    tagSel:      'bg-emerald-600 border-emerald-600 text-white',
    subtitleBar: 'bg-emerald-50 border-emerald-100',
  },
  yellow: {
    cardIdle:    'bg-stone-50 border-stone-200 hover:border-yellow-300 hover:bg-yellow-50/30',
    cardSel:     'bg-yellow-50 border-yellow-400 shadow-yellow-100',
    tagIdle:     'bg-white border-stone-200 text-stone-700 hover:border-yellow-300 hover:bg-yellow-50',
    tagSel:      'bg-yellow-500 border-yellow-500 text-white',
    subtitleBar: 'bg-yellow-50 border-yellow-100',
  },
  orange: {
    cardIdle:    'bg-stone-50 border-stone-200 hover:border-orange-300 hover:bg-orange-50/30',
    cardSel:     'bg-orange-50 border-orange-400 shadow-orange-100',
    tagIdle:     'bg-white border-stone-200 text-stone-700 hover:border-orange-300 hover:bg-orange-50',
    tagSel:      'bg-orange-600 border-orange-600 text-white',
    subtitleBar: 'bg-orange-50 border-orange-100',
  },
  sky: {
    cardIdle:    'bg-stone-50 border-stone-200 hover:border-sky-300 hover:bg-sky-50/30',
    cardSel:     'bg-sky-50 border-sky-400 shadow-sky-100',
    tagIdle:     'bg-white border-stone-200 text-stone-700 hover:border-sky-300 hover:bg-sky-50',
    tagSel:      'bg-sky-600 border-sky-600 text-white',
    subtitleBar: 'bg-sky-50 border-sky-100',
  },
};

// ── Component ──────────────────────────────────────────────────────────
export function TasteChecklist() {
  const [selectedMoods, setSelectedMoods] = useState<Set<string>>(new Set());
  const [selectedSubtags, setSelectedSubtags] = useState<Map<string, Set<string>>>(new Map());
  const router = useRouter();

  const toggleMood = (id: string) => {
    setSelectedMoods(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
        setSelectedSubtags(st => { const m = new Map(st); m.delete(id); return m; });
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const toggleSubtag = (moodId: string, subId: string) => {
    setSelectedSubtags(prev => {
      const next = new Map(prev);
      const subs = new Set(next.get(moodId) ?? []);
      subs.has(subId) ? subs.delete(subId) : subs.add(subId);
      next.set(moodId, subs);
      return next;
    });
  };

  const handleSubmit = () => {
    const v = buildVector(selectedMoods, selectedSubtags);
    router.push(`/recommendation?v=${serializeVector(v)}`);
  };

  const totalSubs = [...selectedSubtags.values()].reduce((s, v) => s + v.size, 0);

  return (
    <div className="animate-in fade-in duration-500 max-w-2xl mx-auto">

      {/* ── Header ── */}
      <div className="text-center mb-10">
        <p className="text-[10px] font-mono tracking-[0.35em] uppercase text-brown-900/35 mb-3">
          Step 1 · 취향 탐색
        </p>
        <h1 className="text-3xl md:text-4xl font-bold font-serif text-brown-900 leading-tight mb-3">
          오늘은 어떤 분위기로<br />한 잔 하실 건가요?
        </h1>
        <p className="text-brown-900/50 font-light text-sm max-w-sm mx-auto leading-relaxed">
          마음에 드는 분위기를 골라주세요.<br />
          여러 개 선택해도 좋고, 위스키를 몰라도 괜찮아요.
        </p>
      </div>

      {/* ── Mood cards (stacked, full-width) ── */}
      <div className="space-y-3 mb-8">
        {MOODS.map(mood => {
          const isSel    = selectedMoods.has(mood.id);
          const ac       = ACCENT[mood.accentClass];
          const subtags  = selectedSubtags.get(mood.id) ?? new Set<string>();

          return (
            <motion.div key={mood.id} layout="position">
              {/* ── Card shell ── */}
              <div
                className={`
                  relative rounded-2xl border-2 transition-all duration-200 cursor-pointer select-none overflow-hidden
                  ${isSel
                    ? `${ac.cardSel} shadow-md ring-2 ring-amber-400/40`
                    : `${ac.cardIdle} shadow-sm`}
                `}
                onClick={() => toggleMood(mood.id)}
              >
                {/* Gold checkmark badge */}
                <AnimatePresence>
                  {isSel && (
                    <motion.div
                      className="absolute top-3.5 right-3.5 z-10 w-6 h-6 rounded-full bg-amber-400 flex items-center justify-center shadow-sm"
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0, opacity: 0 }}
                      transition={{ type: 'spring', stiffness: 500, damping: 28 }}
                    >
                      <Check className="w-3.5 h-3.5 text-white" strokeWidth={3} />
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Card header row */}
                <div className="flex items-center gap-4 px-5 py-4">
                  <span className="text-3xl leading-none shrink-0">{mood.emoji}</span>
                  <div className="flex-1 min-w-0">
                    <h2 className="text-base font-bold font-serif text-brown-900 leading-tight">
                      {mood.title}
                    </h2>
                    <p className="text-xs text-brown-900/55 font-light mt-0.5 truncate">
                      {mood.subtitle}
                    </p>
                    <p className="text-[10px] font-mono text-brown-900/30 mt-1 truncate tracking-wide">
                      {mood.keywords}
                    </p>
                  </div>
                  {/* Expand chevron */}
                  <motion.span
                    className="text-brown-900/25 shrink-0 mr-1"
                    animate={{ rotate: isSel ? 90 : 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <ChevronRight className="w-4 h-4" />
                  </motion.span>
                </div>

                {/* ── Sub-tags accordion ── */}
                <AnimatePresence initial={false}>
                  {isSel && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
                      className="overflow-hidden"
                    >
                      {/* Divider + label */}
                      <div
                        className={`px-5 pt-3 pb-1 border-t ${ac.subtitleBar}`}
                        onClick={e => e.stopPropagation()}
                      >
                        <p className="text-[10px] text-brown-900/45 font-medium flex items-center gap-1 mb-3">
                          <Sparkles className="w-3 h-3 text-amber-400" />
                          조금 더 구체적으로 어떤 느낌이 좋으세요? <span className="text-brown-900/30">(선택 안 해도 OK)</span>
                        </p>

                        {/* Sub-tag pills — 2-col grid on sm+ */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pb-4">
                          {mood.subtags.map(sub => {
                            const isSubSel = subtags.has(sub.id);
                            return (
                              <motion.button
                                key={sub.id}
                                whileTap={{ scale: 0.96 }}
                                onClick={() => toggleSubtag(mood.id, sub.id)}
                                className={`
                                  relative flex items-center gap-3 px-4 py-3 rounded-xl border-2
                                  text-left transition-all duration-150 w-full
                                  ${isSubSel
                                    ? `${ac.tagSel} ring-1 ring-amber-400/60 shadow-sm`
                                    : ac.tagIdle}
                                `}
                              >
                                {/* Gold checkmark on sub-tag */}
                                <AnimatePresence>
                                  {isSubSel && (
                                    <motion.span
                                      className="absolute top-1.5 right-1.5 w-4 h-4 rounded-full bg-amber-400 flex items-center justify-center"
                                      initial={{ scale: 0 }}
                                      animate={{ scale: 1 }}
                                      exit={{ scale: 0 }}
                                      transition={{ type: 'spring', stiffness: 600, damping: 30 }}
                                    >
                                      <Check className="w-2.5 h-2.5 text-white" strokeWidth={3} />
                                    </motion.span>
                                  )}
                                </AnimatePresence>

                                <span className="text-2xl leading-none shrink-0">{sub.emoji}</span>
                                <span className="flex flex-col gap-0.5 min-w-0">
                                  <span className="text-sm font-semibold leading-tight">{sub.label}</span>
                                  <span className={`text-[11px] leading-tight ${isSubSel ? 'opacity-80' : 'text-stone-400'}`}>
                                    {sub.hint}
                                  </span>
                                </span>
                              </motion.button>
                            );
                          })}
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* ── Live selection summary ── */}
      <AnimatePresence>
        {selectedMoods.size > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 6 }}
            className="mb-6 px-4 py-3 rounded-xl bg-amber-50 border border-amber-200/70 flex flex-wrap items-center gap-2"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-500 shrink-0" />
            <span className="text-xs text-amber-800 font-medium">선택된 분위기:</span>
            {[...selectedMoods].map(id => {
              const m    = MOODS.find(m => m.id === id)!;
              const subs = selectedSubtags.get(id);
              return (
                <span key={id} className="inline-flex items-center gap-1 px-2.5 py-1 bg-white rounded-full border border-amber-200 text-xs text-brown-900 font-medium shadow-sm">
                  {m.emoji} {m.title}
                  {subs && subs.size > 0 && (
                    <span className="text-amber-600 font-bold">+{subs.size}</span>
                  )}
                </span>
              );
            })}
            {totalSubs > 0 && (
              <span className="ml-auto text-[10px] text-amber-600 font-mono">
                세부 {totalSubs}개 반영
              </span>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── CTA ── */}
      <div className="flex flex-col items-center gap-3 pb-16">
        <motion.div whileTap={selectedMoods.size > 0 ? { scale: 0.97 } : {}}>
          <Button
            className="px-14 py-5 text-sm tracking-[0.18em] shadow-lg shadow-olive-900/20"
            onClick={handleSubmit}
            disabled={selectedMoods.size === 0}
          >
            {selectedMoods.size === 0
              ? '분위기를 하나 이상 골라주세요'
              : <span className="flex items-center gap-2">맛의 지도 · 추천받기 <ChevronRight className="w-4 h-4" /></span>
            }
          </Button>
        </motion.div>
        <p className="text-[11px] text-brown-900/35 font-light text-center">
          {selectedMoods.size > 0
            ? '선택한 분위기가 7차원 풍미 벡터로 환산되어 319종 DB와 매칭됩니다'
            : '위의 카드를 클릭하면 세부 옵션이 펼쳐집니다'}
        </p>
      </div>
    </div>
  );
}
