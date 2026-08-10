'use client';

import { useEffect } from 'react';
import { AlertTriangle } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function WhiskeyDetailError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('[whiskey/detail] error:', error);
  }, [error]);

  const router = useRouter();

  return (
    <div className="min-h-[calc(100vh-4rem)] flex flex-col items-center justify-center p-8 text-center">
      <AlertTriangle className="w-12 h-12 text-amber-500 mb-6" />
      <h2 className="text-2xl font-bold font-serif text-brown-900 mb-2">
        위스키 정보를 불러오지 못했습니다
      </h2>
      <p className="text-brown-900/60 text-base font-light mb-8 max-w-md">
        서버 연결에 일시적인 문제가 발생했습니다. 잠시 후 다시 시도해 주세요.
      </p>
      <div className="flex gap-4">
        <button
          onClick={reset}
          className="px-6 py-3 bg-olive-900 text-cream-100 font-semibold text-sm tracking-widest uppercase hover:bg-olive-700 transition-colors"
        >
          다시 시도
        </button>
        <button
          onClick={() => router.back()}
          className="px-6 py-3 border border-olive-900/30 text-olive-900 font-semibold text-sm tracking-widest uppercase hover:bg-olive-900/5 transition-colors"
        >
          뒤로 가기
        </button>
      </div>
    </div>
  );
}
