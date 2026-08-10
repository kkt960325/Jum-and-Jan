'use client';

import { useEffect } from 'react';

export function ScrollReset() {
  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.scrollTo(0, 0);
      // Next.js 라우팅 지연 등으로 인해 복원되는 경우를 대비해 이중 확보
      setTimeout(() => {
        window.scrollTo({ top: 0, behavior: 'instant' as any });
      }, 0);
    }
  }, []);

  return null;
}
