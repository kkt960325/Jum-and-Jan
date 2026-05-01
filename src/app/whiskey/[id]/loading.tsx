import { Loader2 } from 'lucide-react';

export default function Loading() {
  return (
    <div className="min-h-[calc(100vh-4rem)] flex flex-col items-center justify-center p-4 text-center">
      <Loader2 className="w-12 h-12 text-whiskey-500 animate-spin mb-6" />
      <h2 className="text-2xl md:text-3xl font-bold text-slate-50 mb-2">위스키 데이터를 불러오는 중입니다...</h2>
      <p className="text-slate-400 text-lg">잠시만 기다려 주세요.</p>
    </div>
  );
}
