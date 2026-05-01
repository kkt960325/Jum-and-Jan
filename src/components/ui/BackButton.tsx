'use client';

import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';

export function BackButton() {
  const router = useRouter();
  return (
    <button
      onClick={() => router.back()}
      className="inline-flex items-center gap-2 text-brown-900/50 hover:text-olive-900 transition-colors"
    >
      <ArrowLeft className="w-4 h-4" />
      뒤로 가기
    </button>
  );
}
