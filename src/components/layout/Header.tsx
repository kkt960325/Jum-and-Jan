import React from 'react';
import Link from 'next/link';
import { GlassWater } from 'lucide-react';

export function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-olive-900/10 bg-cream-100/90 backdrop-blur supports-[backdrop-filter]:bg-cream-100/60">
      <div className="container mx-auto flex h-20 items-center px-4 md:px-8">
        <Link href="/" className="flex items-center gap-3 transition-opacity hover:opacity-80">
          <GlassWater className="h-7 w-7 text-olive-700" />
          <span className="font-serif font-bold text-2xl tracking-tight text-olive-900">Jum & Jan</span>
        </Link>
      </div>
    </header>
  );
}
