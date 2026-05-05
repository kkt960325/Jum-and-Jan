import Link from 'next/link';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { FlaskConical, GlassWater, Sparkles, Map, Zap, Microscope, ShoppingBag, CalendarCheck, Flame } from 'lucide-react';
import { WHISKEY_DB } from '@/lib/data';
import { WhiskeyPhotoCard } from '@/components/whiskey/WhiskeyPhotoCard';
import { CompoundTags } from '@/components/ui/CompoundTags';
import { FlavorMap, type MapWhiskey } from '@/components/flavor-map/FlavorMap';
import { VectorRadarChart } from '@/components/ui/VectorRadarChart';
import {
  parseVector, serializeVector, getTopMatches, projectTo2D,
  PROFILE_VECTORS, inferProfile, type FlavorVector,
} from '@/lib/vector-engine';
import { PROFILE_INFO } from '@/lib/constants';
import { getPairingsV2, FOOD_CATEGORY_LABELS } from '@/lib/pairing-engine-v2';
import type { PairingResult, AdventurousResult, PairingResultSet } from '@/lib/pairing-engine-v2';
import type { FoodCategory } from '@/lib/food-db';

const FOOD_DIM_LABELS = ['단맛','짠맛','신맛','매운','감칠','지방','텍스처'] as const;

function FoodVectorBars({ vector, barColor }: { vector: number[]; barColor: string }) {
  return (
    <div className="mb-5 grid grid-cols-7 gap-1">
      {FOOD_DIM_LABELS.map((label, i) => (
        <div key={label} className="flex flex-col items-center gap-0.5">
          <div className="w-full bg-stone-100 rounded-full overflow-hidden" style={{ height: 40 }}>
            <div
              className={`w-full rounded-full ${barColor}`}
              style={{ height: `${vector[i] * 100}%`, marginTop: `${(1 - vector[i]) * 100}%` }}
            />
          </div>
          <span className="text-[8px] text-brown-900/40 font-mono leading-none text-center">{label}</span>
        </div>
      ))}
    </div>
  );
}

// ─── Profile-type gradient for whiskeys without product photos ───────────────
const PROFILE_GRADIENT: Record<string, string> = {
  sweet_heavy:  'linear-gradient(135deg, #7c5c2e 0%, #b8860b 50%, #4a3520 100%)',
  peaty_bold:   'linear-gradient(135deg, #1a1a1a 0%, #3d3d3d 50%, #1f2e1a 100%)',
  citrus_light: 'linear-gradient(135deg, #2d4a1e 0%, #4a7c2f 50%, #1e3a28 100%)',
  smooth_nutty: 'linear-gradient(135deg, #5c3d1e 0%, #8b6914 50%, #3d2b14 100%)',
  spicy_woody:  'linear-gradient(135deg, #4a1e1e 0%, #8b3a14 50%, #2d1a0e 100%)',
};

// ─── Step Header ───────────────────────────────────────

function StepHeader({ n, icon, title, sub }: { n: number; icon: React.ReactNode; title: string; sub: string }) {
  return (
    <div className="flex items-start gap-4 mb-8">
      <div className="flex-shrink-0 w-10 h-10 rounded-sm bg-olive-900/10 flex items-center justify-center text-olive-700">
        {icon}
      </div>
      <div>
        <p className="text-xs font-bold tracking-[0.25em] uppercase text-olive-700/70 mb-0.5">Step {n}</p>
        <h2 className="text-2xl md:text-3xl font-bold font-serif text-brown-900">{title}</h2>
        <p className="text-brown-900/60 font-light text-sm mt-1">{sub}</p>
      </div>
    </div>
  );
}

// ─── Price tier helpers ─────────────────────────────────
// entry: <10만원 / middle: 10~30만원 / high-end: 30만원+

type PriceTier = 'entry' | 'middle' | 'high-end';

const PRICE_TIER_META: Record<PriceTier, { label: string; sublabel: string; style: string; ring: string }> = {
  'entry':    { label: '입문용',    sublabel: 'Entry · ~10만원',      style: 'bg-emerald-700 text-white',                          ring: 'ring-2 ring-emerald-700/25' },
  'middle':   { label: '미들급',   sublabel: 'Middle · 10~30만원',   style: 'bg-amber-700 text-white',                            ring: '' },
  'high-end': { label: '하이엔드', sublabel: 'High-End · 30만원+',   style: 'bg-gradient-to-r from-amber-800 to-yellow-600 text-white', ring: 'ring-2 ring-yellow-600/30' },
};

function getTierMatches(
  userVector: FlavorVector,
  db: ReturnType<typeof WHISKEY_DB['slice']>,
): Array<{ whiskey: (typeof db)[number]; similarity: number; tier: PriceTier }> {
  const buckets: Record<PriceTier, typeof db> = { 'entry': [], 'middle': [], 'high-end': [] };
  for (const w of db) {
    const price = w.priceSimulation?.dailyShot ?? 70000;
    if (price < 100000)       buckets['entry'].push(w);
    else if (price < 300000)  buckets['middle'].push(w);
    else                      buckets['high-end'].push(w);
  }
  return (['entry', 'middle', 'high-end'] as const).flatMap(tier => {
    if (!buckets[tier].length) return [];
    const [best] = getTopMatches(userVector, buckets[tier], 1);
    return [{ whiskey: best.whiskey, similarity: best.similarity, tier }];
  });
}

// ─── Food card helpers ──────────────────────────────────

const TIER_META = {
  low:    { label: '가벼운 주전부리', dollarCount: 1, color: 'text-green-600' },
  medium: { label: '든든한 요리',     dollarCount: 2, color: 'text-amber-500' },
  high:   { label: '고급 별미',       dollarCount: 3, color: 'text-red-400' },
} as const;

const CATEGORY_STYLES: Record<string, string> = {
  snack:    'bg-amber-50 text-amber-800 border-amber-200',
  meal:     'bg-olive-50 text-olive-900 border-olive-200',
  delicacy: 'bg-stone-100 text-stone-700 border-stone-300',
};

function FoodPairingCard({ result, tierKey }: { result: PairingResult; tierKey: 'low' | 'medium' | 'high' }) {
  const { food, story } = result;
  const tier = TIER_META[tierKey];
  const categoryStyle = CATEGORY_STYLES[food.category] ?? '';
  const categoryLabel = FOOD_CATEGORY_LABELS[food.category as FoodCategory];

  return (
    <Card className="flex flex-col relative overflow-hidden group hover:border-olive-900/30 transition-colors h-full">
      <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity">
        <FlaskConical className="w-6 h-6 text-olive-700" />
      </div>

      <div className="flex items-center gap-2 mb-4 flex-wrap">
        <div className="px-3 py-1.5 inline-flex items-center gap-1.5 bg-cream-200/80 rounded-sm shadow-sm">
          <span className={`font-bold text-xs ${tier.color}`}>{'$'.repeat(tier.dollarCount)}</span>
          <span className="font-semibold text-olive-900 text-sm">{tier.label}</span>
        </div>
        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold border ${categoryStyle}`}>
          {categoryLabel}
        </span>
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-olive-900/8 text-olive-700 border border-olive-900/15">
          <CalendarCheck className="w-3 h-3" />오늘의 추천
        </span>
      </div>

      <h3 className="text-2xl font-bold font-serif text-brown-900 mb-2">{food.name}</h3>
      <div className="mb-4"><CompoundTags compounds={food.compounds} /></div>

      <FoodVectorBars vector={food.foodVector} barColor="bg-olive-700/60" />

      <div className="mt-auto pt-4 border-t border-olive-900/10">
        <p className="text-xs font-bold text-olive-900/60 uppercase tracking-widest mb-2 flex items-center gap-1.5">
          <FlaskConical className="w-3 h-3" />분자 미식학 스토리
        </p>
        <p className="text-sm text-brown-900/80 leading-relaxed font-light whitespace-pre-wrap">{story}</p>
      </div>
    </Card>
  );
}

function AdventurousCard({ result }: { result: AdventurousResult }) {
  const { food, story, bridgeLabel, contrastScore } = result;
  const categoryLabel = FOOD_CATEGORY_LABELS[food.category as FoodCategory];

  return (
    <Card className="flex flex-col relative overflow-hidden border-2 border-amber-900/20 bg-gradient-to-br from-stone-950/5 to-amber-900/5 h-full group hover:border-amber-700/30 transition-colors">
      {/* flame bg decoration */}
      <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity">
        <Flame className="w-6 h-6 text-amber-600" />
      </div>

      {/* Header badges */}
      <div className="flex items-center gap-2 mb-4 flex-wrap">
        <div className="px-3 py-1.5 inline-flex items-center gap-1.5 bg-amber-900/10 border border-amber-700/30 rounded-sm shadow-sm">
          <Flame className="w-3.5 h-3.5 text-amber-600" />
          <span className="font-bold text-amber-800 text-sm tracking-wide">모험적 매칭</span>
        </div>
        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-800 border border-amber-200">
          {bridgeLabel}
        </span>
        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold border ${CATEGORY_STYLES[food.category] ?? ''}`}>
          {categoryLabel}
        </span>
      </div>

      <h3 className="text-2xl font-bold font-serif text-brown-900 mb-1">{food.name}</h3>
      <p className="text-xs text-brown-900/50 font-mono mb-3">
        대조 지수 {(contrastScore * 100).toFixed(0)}pt — 예상을 벗어난 조합
      </p>

      <div className="mb-4"><CompoundTags compounds={food.compounds} /></div>

      <FoodVectorBars vector={food.foodVector} barColor="bg-amber-600/50" />

      <div className="mt-auto pt-4 border-t border-amber-900/10">
        <p className="text-xs font-bold text-amber-700/70 uppercase tracking-widest mb-2 flex items-center gap-1.5">
          <Flame className="w-3 h-3" />미식의 모험 — 도전 & 가치
        </p>
        <p className="text-sm text-brown-900/80 leading-relaxed font-light whitespace-pre-wrap">{story}</p>
      </div>
    </Card>
  );
}

// ─── Pairing section per whiskey ────────────────────────

function WhiskeyPairingSection({
  whiskey,
  pairings,
  simPct,
  rank,
}: {
  whiskey: ReturnType<typeof WHISKEY_DB['find']> & object;
  pairings: PairingResultSet;
  simPct: number;
  rank: number;
}) {
  return (
    <div className="mb-12">
      {/* Whiskey section header */}
      <div className="flex items-center gap-3 mb-5 pb-3 border-b border-olive-900/10">
        <span className="text-5xl font-bold font-serif text-olive-900/10 leading-none select-none">
          {String(rank).padStart(2, '0')}
        </span>
        <div>
          <p className="text-xs font-mono text-brown-900/40 uppercase tracking-widest mb-0.5">위스키 기준</p>
          <h3 className="text-xl font-bold font-serif text-brown-900">{whiskey.name}</h3>
          <p className="text-xs text-olive-700 font-semibold">취향 적합도 {simPct}%</p>
        </div>
      </div>

      {/* 4-column grid: low / medium / high / adventurous */}
      <div className="grid sm:grid-cols-2 xl:grid-cols-4 gap-4 items-stretch">
        <FoodPairingCard result={pairings.low}    tierKey="low" />
        <FoodPairingCard result={pairings.medium} tierKey="medium" />
        <FoodPairingCard result={pairings.high}   tierKey="high" />
        <AdventurousCard result={pairings.adventurous} />
      </div>
    </div>
  );
}

// ─── Page ───────────────────────────────────────────────

export default async function Recommendation(props: { searchParams: Promise<{ v?: string; profile?: string }> }) {
  const searchParams = await props.searchParams;

  let userVector: FlavorVector;
  if (searchParams.v) {
    userVector = parseVector(searchParams.v) ?? PROFILE_VECTORS.sweet_heavy;
  } else {
    userVector = PROFILE_VECTORS[searchParams.profile ?? 'sweet_heavy'] ?? PROFILE_VECTORS.sweet_heavy;
  }

  const vectorParam = serializeVector(userVector);
  const profileKey = inferProfile(userVector);
  const profile = PROFILE_INFO[profileKey] ?? PROFILE_INFO.sweet_heavy;

  const topMatches = getTierMatches(userVector, WHISKEY_DB);
  const allPairings = topMatches.map(({ whiskey, similarity }) => ({
    whiskey,
    similarity,
    pairings: getPairingsV2(whiskey),
  }));

  const mapWhiskeys: MapWhiskey[] = WHISKEY_DB.map(w => {
    const pos = projectTo2D(w.flavorVector);
    const matchIdx = topMatches.findIndex(m => m.whiskey.id === w.id);
    return { id: w.id, name: w.name, x: pos.x, y: pos.y, abv: w.abv, ...(matchIdx >= 0 ? { rank: matchIdx } : {}) };
  });
  const userPos = projectTo2D(userVector);

  return (
    <div className="container mx-auto px-4 py-12 max-w-6xl animate-in fade-in duration-700">

      {/* Profile Header */}
      <div className="text-center mb-16">
        <div className="inline-block px-4 py-1.5 bg-olive-900 text-cream-100 font-medium text-sm tracking-widest uppercase mb-4 shadow-sm">
          취향 프로필 — {profile.title}
        </div>
        <h1 className="text-4xl md:text-6xl font-bold font-serif text-brown-900 mb-3 tracking-tight leading-tight">
          과학이 증명한<br />
          <span className="text-olive-900 italic font-light">완벽한 페어링</span>
        </h1>
        <p className="text-brown-900/60 text-base font-light max-w-lg mx-auto">{profile.desc}</p>
      </div>

      {/* ─── STEP 2: 맛의 지도 ─── */}
      <section className="mb-20">
        <StepHeader
          n={2} icon={<Map className="w-5 h-5" />}
          title="맛의 지도"
          sub="7차원 풍미 벡터를 2D 평면에 투영 — 당신의 위치(🟡)와 위스키들의 분포"
        />
        <FlavorMap whiskeys={mapWhiskeys} userPosition={userPos} />
        <p className="text-xs text-brown-900/40 text-center mt-3 font-light">
          X축: 피티·스모키 ←→ 달콤·과일 &nbsp;|&nbsp; Y축: 가볍고 섬세한 ←→ 묵직하고 강렬한
        </p>
      </section>

      {/* ─── STEP 3: 벡터 매칭 ─── */}
      <section className="mb-20">
        <StepHeader
          n={3} icon={<Zap className="w-5 h-5" />}
          title="가격대별 취향 매칭"
          sub="입문용(~10만원) · 미들급(10~30만원) · 하이엔드(30만원+) — 각 가격대 최고 벡터 매칭"
        />
        <div className="grid md:grid-cols-3 gap-6">
          {topMatches.map(({ whiskey, similarity, tier }) => {
            const priceMeta = PRICE_TIER_META[tier];
            const simPct = Math.round(similarity * 100);
            const gradient = PROFILE_GRADIENT[whiskey.profileType] ?? PROFILE_GRADIENT.smooth_nutty;
            return (
              <div
                key={whiskey.id}
                className={`bg-white border border-olive-900/10 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] flex flex-col relative overflow-hidden transition-all hover:-translate-y-1 hover:shadow-xl ${priceMeta.ring}`}
              >
                <WhiskeyPhotoCard
                  image={whiskey.image}
                  gradient={gradient}
                  name={whiskey.name}
                  tierLabel={priceMeta.label}
                  tierSublabel={priceMeta.sublabel}
                  tierStyle={priceMeta.style}
                  priceCategory={whiskey.priceCategory}
                />

                {/* Card body */}
                <div className="p-5 flex flex-col flex-1">
                  <p className="text-brown-900/60 font-light text-sm leading-relaxed mb-4 flex-1">{whiskey.description}</p>
                  <div className="flex flex-wrap gap-2 mb-4">
                    <span className="px-3 py-1 bg-olive-900 text-cream-100 text-xs font-bold rounded-full">ABV {whiskey.abv}%</span>
                    {whiskey.recommendedDrink && (
                      <span className="flex items-center gap-1 px-3 py-1 bg-cream-200 text-olive-900 text-xs font-semibold rounded-full border border-olive-900/10">
                        <GlassWater className="w-3 h-3" />{whiskey.recommendedDrink}
                      </span>
                    )}
                  </div>
                  <div className="mb-4 bg-white/60 rounded-sm border border-olive-900/10 p-2">
                    <VectorRadarChart
                      userVector={userVector}
                      whiskeyVector={whiskey.flavorVector}
                      whiskeyName={whiskey.name.slice(0, 8)}
                      similarityPct={simPct}
                    />
                  </div>
                  <div className="mb-4">
                    <p className="text-xs font-semibold text-brown-900/40 uppercase tracking-widest mb-2">핵심 화합물</p>
                    <CompoundTags compounds={whiskey.compounds} />
                  </div>
                  <div className="flex items-center gap-1 mb-3">
                    <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                    <span className="text-xs text-amber-700 font-semibold">취향 적합도 {simPct}%</span>
                  </div>
                  <Link href={`/whiskey/${whiskey.id}?v=${vectorParam}`} className="mt-auto">
                    <Button variant={tier === 'entry' ? 'primary' : 'outline'} className="w-full">
                      상세 정보 · Smart Action →
                    </Button>
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* ─── STEP 4: 분자 페어링 v2 (모든 3종 × 4카드) ─── */}
      <section className="mb-16">
        <StepHeader
          n={4} icon={<Microscope className="w-5 h-5" />}
          title="오늘의 분자 페어링"
          sub="추천 위스키 3종 × 가격대별 3단계 + 모험적 매칭 — 총 12가지 안주 시나리오"
        />

        <div className="flex items-center gap-2 mb-8 p-3 rounded-sm bg-amber-50 border border-amber-200/60">
          <CalendarCheck className="w-4 h-4 text-amber-600 shrink-0" />
          <p className="text-xs text-amber-800 font-medium">
            매일 자정 갱신 — 같은 위스키도 날마다 다른 안주를 만납니다.
            🔥 <strong>모험적 매칭</strong>은 대조적이지만 분자 화학이 보증하는 파격 조합입니다.
          </p>
        </div>

        {allPairings.map(({ whiskey, similarity, pairings }, i) => (
          <WhiskeyPairingSection
            key={whiskey.id}
            whiskey={whiskey}
            pairings={pairings}
            simPct={Math.round(similarity * 100)}
            rank={i + 1}
          />
        ))}
      </section>

      {/* ─── STEP 5 Nudge ─── */}
      <section className="mb-16 p-6 rounded-sm bg-olive-900/5 border border-olive-900/15">
        <div className="flex items-center gap-3 mb-3">
          <ShoppingBag className="w-5 h-5 text-olive-700" />
          <p className="text-sm font-bold text-olive-900 uppercase tracking-widest">Step 5 · Smart Action</p>
        </div>
        <p className="text-brown-900/70 font-light text-sm">
          위의 위스키 카드에서 <strong className="text-olive-900">상세 정보 · Smart Action →</strong> 버튼을 누르면 실시간 환율 기반 면세가 계산과 채널별 구매 링크를 확인할 수 있습니다.
        </p>
      </section>

      {/* Footer */}
      <div className="text-center space-y-4">
        <Link href="/taste-check">
          <Button variant="outline" className="px-12 py-4">다시 추천받기</Button>
        </Link>
        <p className="text-xs text-brown-900/40 mt-8 max-w-2xl mx-auto font-light leading-relaxed">
          * FlavorDB 화합물 DB · Khymos 페어링 이론 · 7×7 시너지 매트릭스 · 8가지 대조 브릿지 룰 · Cosine Similarity 적용.
          한식 안주 301종 DB · 매일 날짜 시드로 다른 조합 추천.
        </p>
      </div>

    </div>
  );
}
