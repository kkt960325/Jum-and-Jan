import { notFound } from 'next/navigation';
import { BackButton } from '@/components/ui/BackButton';
import { WHISKEY_DB } from '@/lib/data';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { GlassWater, BookOpen, Quote, Sparkles, TrendingDown, Lightbulb, BadgePercent } from 'lucide-react';
import Link from 'next/link';
import { PersonalTastingNote } from '@/components/whiskey/PersonalTastingNote';
import { ChannelLink } from '@/components/whiskey/ChannelLink';
import { getDeepLink } from '@/lib/utils';
import { parseVector, inferProfile, cosineSimilarity } from '@/lib/vector-engine';

async function getExchangeRate() {
  try {
    const res = await fetch('https://open.er-api.com/v6/latest/USD', {
      next: { revalidate: 3600 }
    });
    const data = await res.json();
    return data.rates.KRW;
  } catch (e) {
    console.error('Failed to fetch exchange rate', e);
    return 1380;
  }
}

export default async function WhiskeyDetail(props: { params: Promise<{ id: string }>, searchParams: Promise<{ profile?: string; v?: string }> }) {
  const params = await props.params;
  const searchParams = await props.searchParams;
  const whiskey = WHISKEY_DB.find(w => w.id === params.id);

  if (!whiskey) {
    notFound();
  }

  // 사용자 벡터 파싱 (신규) 또는 프로필 폴백
  const userVector = searchParams.v ? parseVector(searchParams.v) : null;
  const profileKey = userVector ? inferProfile(userVector) : (searchParams.profile ?? 'default');

  // 코사인 유사도 계산 (0~1)
  const matchScore = userVector
    ? Math.round(cosineSimilarity(userVector, whiskey.flavorVector) * 100)
    : null;

  const exchangeRate = await getExchangeRate();
  const { expertNotes, priceSimulation, history, recommendedDrink, trivia } = whiskey;

  const dutyFreeKrw = priceSimulation?.dutyFreeUsd
    ? Math.round((priceSimulation.dutyFreeUsd * exchangeRate) / 100) * 100
    : 0;

  // 국내 최저가 채널 (dailyShot 기준)
  const cheapestDomestic = priceSimulation?.dailyShot ?? 0;
  const savingsKrw = cheapestDomestic > dutyFreeKrw && dutyFreeKrw > 0
    ? cheapestDomestic - dutyFreeKrw
    : 0;

  let dynamicDrink: string = recommendedDrink || 'Neat';
  let dynamicDrinkReason = "위스키 본연의 맛을 즐기기 가장 좋은 기본 음용법입니다.";

  if (profileKey === 'citrus_light' || profileKey === 'smooth_nutty') {
    dynamicDrink = 'Highball';
    dynamicDrinkReason = "가벼운 바디감과 화사한 향을 선호하는 당신의 입맛에는 탄산수와 얼음을 더해 향긋함을 터뜨리는 하이볼이 최적입니다.";
  } else if (profileKey === 'peaty_bold' || profileKey === 'spicy_woody') {
    dynamicDrink = 'Neat (or Water drop)';
    dynamicDrinkReason = "강렬하고 묵직한 풍미를 사랑하는 당신을 위해, 물 한 방울만 톡 떨어뜨려(Water drop) 향을 폭발시키는 니트(Neat) 음용을 강력히 추천합니다.";
  } else if (profileKey === 'sweet_heavy') {
    dynamicDrink = 'On the rocks';
    dynamicDrinkReason = "달콤하고 진득한 맛을 즐기시는군요. 얼음이 천천히 녹으며 달콤함이 부드럽게 풀리는 온더록스를 추천합니다.";
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl animate-in fade-in duration-1000">
      
      <div className="mb-8">
        <BackButton />
      </div>

      {/* Hero Section */}
      <div className="flex flex-col md:flex-row gap-8 items-center md:items-start mb-12">
        {/* 검증된 이미지만 표시 (Cross-check: whiskey.image 필드 확인) */}
        <div className="p-8 bg-cream-200 rounded-2xl shadow-inner border border-brown-900/5 shrink-0 relative overflow-hidden">
          {whiskey.image ? (
            <img src={whiskey.image} alt={whiskey.name} className="w-32 h-32 object-cover rounded-xl" />
          ) : (
            <GlassWater className="w-32 h-32 text-olive-700" />
          )}
        </div>
        <div className="text-center md:text-left flex-1">
          <div className="flex flex-wrap justify-center md:justify-start gap-2 mb-4">
            <div className="inline-block px-3 py-1 rounded-sm bg-olive-900 text-cream-100 font-medium tracking-wide">
              ABV {whiskey.abv}%
            </div>
            {matchScore !== null && (
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-sm bg-amber-50 border border-amber-200 text-amber-800 font-semibold text-sm tracking-wide">
                <Sparkles className="w-3.5 h-3.5" />
                내 취향 적합도 {matchScore}%
              </div>
            )}
          </div>
          <h1 className="text-5xl md:text-6xl font-serif font-bold text-brown-900 mb-4 tracking-tight">{whiskey.name}</h1>
          <p className="text-xl text-brown-900/80 mb-6 font-light">{whiskey.description}</p>
          <div className="flex flex-wrap justify-center md:justify-start gap-2">
            {whiskey.aroma.map(a => (
              <span key={`a-${a}`} className="px-3 py-1 bg-cream-100 text-brown-900 border border-olive-900/20 rounded-sm text-sm capitalize font-mono">
                Aroma: {a}
              </span>
            ))}
            {whiskey.taste.map(t => (
              <span key={`t-${t}`} className="px-3 py-1 bg-white text-olive-900 border border-olive-900/20 rounded-sm text-sm capitalize font-mono">
                Taste: {t}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Recommended Drink */}
      <Card className="mb-12 border-olive-900/20 bg-gradient-to-r from-cream-100 to-white p-6 shadow-md">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-4 shrink-0">
            <Sparkles className="w-10 h-10 text-olive-700" />
            <div>
              <h3 className="text-sm font-medium text-brown-900/60 mb-1 uppercase tracking-[0.15em]">사용자 맞춤형 음용법</h3>
              <p className="text-3xl md:text-4xl font-serif font-bold text-olive-900">{dynamicDrink}</p>
            </div>
          </div>
          <div className="flex-1 md:border-l border-brown-900/10 md:pl-6 text-center md:text-left">
            <p className="text-brown-900/80 text-lg leading-relaxed font-light">
              {dynamicDrinkReason}
            </p>
          </div>
        </div>
      </Card>

      {/* History Section */}
      {history && (
        <div className="mb-12">
          <h2 className="text-3xl font-serif font-bold text-brown-900 mb-6 flex items-center gap-3">
            <BookOpen className="text-olive-700" />
            재미난 히스토리 (Whiskipedia)
          </h2>
          <Card className="p-8 bg-white border border-olive-900/10 shadow-sm leading-relaxed text-brown-900/80 text-lg font-light">
            {history}
          </Card>
        </div>
      )}

      {/* Trivia Section */}
      {trivia && trivia.length > 0 && (
        <div className="mb-12 animate-in slide-in-from-bottom-4 duration-1000 delay-300">
          <h2 className="text-3xl font-serif font-bold text-brown-900 mb-6 flex items-center gap-3">
            <Lightbulb className="text-olive-700" />
            알고 마시면 더 맛있는 비하인드 스토리 (Trivia)
          </h2>
          <div className="grid gap-4">
            {trivia.map((t, i) => (
              <div key={i} className="flex gap-4 p-6 bg-cream-100/50 rounded-sm border border-brown-900/10 hover:border-olive-900/30 transition-colors">
                <span className="text-olive-900/40 font-serif font-bold text-3xl shrink-0 leading-none mt-1">0{i+1}</span>
                <p className="text-brown-900/80 leading-relaxed text-lg font-light">{t}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Expert Tasting Notes */}
      {expertNotes && (
        <div className="mb-12">
          <h2 className="text-3xl font-serif font-bold text-brown-900 mb-6 flex items-center gap-3">
            <Quote className="text-olive-700" />
            전문가 테이스팅 노트 (Distiller)
          </h2>
          <div className="grid md:grid-cols-3 gap-6">
            <Card className="p-6 bg-white border-t-4 border-t-brown-900/20 shadow-sm">
              <h3 className="text-xl font-serif font-bold text-brown-900 mb-3">Nose</h3>
              <p className="text-brown-900/70 font-light">{expertNotes.nose}</p>
            </Card>
            <Card className="p-6 bg-white border-t-4 border-t-brown-900/50 shadow-sm">
              <h3 className="text-xl font-serif font-bold text-brown-900 mb-3">Palate</h3>
              <p className="text-brown-900/70 font-light">{expertNotes.palate}</p>
            </Card>
            <Card className="p-6 bg-white border-t-4 border-t-olive-900 shadow-sm">
              <h3 className="text-xl font-serif font-bold text-olive-900 mb-3">Finish</h3>
              <p className="text-brown-900/70 font-light">{expertNotes.finish}</p>
            </Card>
          </div>
        </div>
      )}

      {/* Personal Tasting Note */}
      <div className="mb-12 animate-in slide-in-from-bottom-4 duration-1000 delay-500">
        <PersonalTastingNote whiskeyId={whiskey.id} />
      </div>

      {/* Price Simulation */}
      {priceSimulation && (
        <div className="mb-12">
          <h2 className="text-3xl font-serif font-bold text-brown-900 mb-6 flex items-center gap-3">
            <TrendingDown className="text-olive-700" />
            가격 시뮬레이션 및 구매 전략
          </h2>
          <Card className="p-8 border border-olive-900/10 bg-white shadow-sm">
            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <h3 className="text-xl font-serif font-semibold text-brown-900 mb-4">채널별 가격 비교 (예상)</h3>
                <div className="space-y-3">
                  <ChannelLink 
                    name="데일리샷 (앱 픽업)" 
                    priceText={`${priceSimulation.dailyShot.toLocaleString()}원`} 
                    url={getDeepLink(whiskey.name, 'dailyshot')} 
                  />
                  <ChannelLink 
                    name="GS25 (스마트오더)" 
                    priceText={`${priceSimulation.gs25.toLocaleString()}원`} 
                    url={getDeepLink(whiskey.name, 'gs25')} 
                  />
                  <ChannelLink 
                    name="CU (스마트오더)" 
                    priceText={`${priceSimulation.cu.toLocaleString()}원`} 
                    url={getDeepLink(whiskey.name, 'cu')} 
                  />
                  <ChannelLink
                    name="면세점 (보틀벙커 검색)"
                    priceText={`$${priceSimulation.dutyFreeUsd} (약 ${dutyFreeKrw.toLocaleString()}원)`}
                    url={getDeepLink(whiskey.name, 'bottlebunker')}
                    isHighlight
                  />
                </div>

                {/* 절약 넛지 */}
                {savingsKrw > 0 && (
                  <div className="mt-4 flex items-center gap-2 p-3 bg-olive-900/8 border border-olive-900/20 rounded-sm">
                    <BadgePercent className="w-4 h-4 text-olive-700 shrink-0" />
                    <p className="text-xs text-olive-900 font-semibold leading-snug">
                      면세 구매 시 국내 최저가 대비 약&nbsp;
                      <span className="text-base font-bold">{savingsKrw.toLocaleString()}원</span>
                      &nbsp;절약 가능!
                    </p>
                  </div>
                )}

                <div className="mt-3 flex items-center gap-2 justify-end text-xs text-brown-900/50">
                  <span className="w-2 h-2 rounded-full bg-olive-700 animate-pulse" />
                  실시간 환율: 1$ = {Math.round(exchangeRate).toLocaleString()}원
                </div>
              </div>
              <div className="flex flex-col">
                <h3 className="text-xl font-serif font-semibold text-brown-900 mb-4">가장 싸게 사는 방법 분석</h3>
                <div className="flex-1 p-6 bg-cream-200/50 border border-brown-900/10 rounded-sm mb-6">
                  <p className="text-brown-900/80 leading-relaxed font-light">
                    {priceSimulation.bestBuyStrategy}
                  </p>
                </div>
                
                {/* Outlink Search */}
                <div className="flex gap-3 mt-auto">
                  <a href={`https://dailyshot.co/search?q=${encodeURIComponent(whiskey.name)}`} target="_blank" rel="noreferrer" className="flex-1">
                    <Button variant="outline" className="w-full text-xs py-4 border-brown-900/20 text-brown-900/80 hover:bg-cream-200">
                      앱에서 실시간 재고 확인
                    </Button>
                  </a>
                  <a href={`https://m.search.naver.com/search.naver?query=${encodeURIComponent(whiskey.name + ' 보틀벙커 가격')}`} target="_blank" rel="noreferrer" className="flex-1">
                    <Button variant="outline" className="w-full text-xs py-4 border-brown-900/20 text-brown-900/80 hover:bg-cream-200">
                      보틀벙커 웹 검색
                    </Button>
                  </a>
                </div>
              </div>
            </div>
          </Card>
        </div>
      )}

    </div>
  );
}
