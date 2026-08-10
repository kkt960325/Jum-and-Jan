'use client';

import { useEffect } from 'react';
import { AlertTriangle } from 'lucide-react';

export default function RecommendationError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('[recommendation] error:', error);
  }, [error]);

  return (
    <div className="min-h-[calc(100vh-4rem)] flex flex-col items-center justify-center p-8 text-center">
      <AlertTriangle className="w-12 h-12 text-amber-500 mb-6" />
      <h2 className="text-2xl font-bold font-serif text-brown-900 mb-2">
        페어링 데이터를 불러오지 못했습니다
      </h2>
      <p className="text-brown-900/60 text-base font-light mb-8 max-w-md">
        서버 연결에 일시적인 문제가 발생했습니다. 잠시 후 다시 시도해 주세요.
      </p>
      <button
        onClick={reset}
        className="px-6 py-3 bg-olive-900 text-cream-100 font-semibold text-sm tracking-widest uppercase hover:bg-olive-700 transition-colors"
      >
        다시 시도
      </button>
    </div>
  );
}
