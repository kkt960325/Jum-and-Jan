import { Loader2 } from 'lucide-react';

export default function Loading() {
  return (
    <div className="min-h-[calc(100vh-4rem)] flex flex-col items-center justify-center p-4 text-center">
      <Loader2 className="w-12 h-12 text-whiskey-500 animate-spin mb-6" />
      <h2 className="text-2xl md:text-3xl font-bold text-slate-50 mb-2">최적의 페어링을 계산 중입니다...</h2>
      <p className="text-slate-400 text-lg">
        수많은 조합의 분자 데이터를 분석하여 당신만의 위스키와 한식을 찾고 있습니다.
      </p>
    </div>
  );
}
