import Link from 'next/link';
import { Button } from '@/components/ui/Button';

export default function Home() {
  return (
    <div className="relative flex flex-col min-h-[calc(100vh-5rem)] overflow-hidden bg-stone-950">

      {/* Hero background image */}
      <div
        className="absolute inset-0 bg-cover bg-center transition-transform duration-[8s] ease-out scale-105"
        style={{ backgroundImage: "url('/images/splash_hero.png')" }}
      />

      {/* Layered overlays: bottom gradient strong, top subtle */}
      <div className="absolute inset-0 bg-gradient-to-t from-stone-950 via-stone-950/60 to-stone-950/20" />
      <div className="absolute inset-0 bg-gradient-to-r from-stone-950/70 via-transparent to-transparent" />

      {/* Noise texture */}
      <div
        className="absolute inset-0 opacity-[0.04] pointer-events-none"
        style={{
          backgroundImage: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'400\' height=\'400\'%3E%3Cfilter id=\'n\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.8\' numOctaves=\'4\'/%3E%3C/filter%3E%3Crect width=\'400\' height=\'400\' filter=\'url(%23n)\'/%3E%3C/svg%3E")',
          backgroundSize: '400px 400px',
        }}
      />

      {/* Content */}
      <div className="relative z-10 flex flex-col justify-end flex-1 max-w-7xl mx-auto w-full px-6 md:px-12 pb-16 md:pb-24 pt-20">

        {/* Label */}
        <p className="text-white/40 font-mono tracking-[0.35em] uppercase text-xs md:text-sm mb-5 animate-in fade-in duration-700">
          Scientific Pairing · FlavorDB × Khymos
        </p>

        {/* Main heading */}
        <h1 className="text-5xl sm:text-7xl md:text-8xl font-bold font-serif leading-none text-white tracking-tight mb-6 animate-in slide-in-from-bottom-6 duration-700">
          Discover Your
          <br />
          <span className="italic font-light text-olive-300">Perfect Pair.</span>
        </h1>

        {/* Sub */}
        <p className="text-white/60 text-base md:text-lg font-light max-w-md leading-relaxed mb-10 animate-in fade-in duration-700 delay-200">
          7차원 풍미 벡터 분석으로 당신의 입맛에 꼭 맞는
          <br className="hidden md:block" />
          위스키와 완벽한 한식 페어링을 제안합니다.
        </p>

        {/* CTA */}
        <div className="flex flex-col sm:flex-row gap-4 animate-in fade-in duration-700 delay-300">
          <Link href="/taste-check">
            <Button className="px-10 py-5 text-base shadow-2xl shadow-olive-900/30 bg-olive-700 hover:bg-olive-600 border-none">
              맛의 지도 시작하기
            </Button>
          </Link>
        </div>

        {/* Bottom attribution */}
        <p className="text-white/20 text-xs font-mono tracking-widest uppercase mt-12 animate-in fade-in duration-1000 delay-500">
          Jum &amp; Jan — 위스키 × 한식 페어링
        </p>
      </div>
    </div>
  );
}
