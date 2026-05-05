'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ZoomIn } from 'lucide-react';

interface Props {
  image?: string;
  gradient: string;
  name: string;
  tierLabel: string;
  tierSublabel: string;
  tierStyle: string;
  priceCategory?: string;
}

const PRICE_CATEGORY_BADGE: Record<string, string> = {
  'high-end': 'bg-gradient-to-r from-amber-800 to-yellow-600 text-white',
};

export function WhiskeyPhotoCard({
  image, gradient, name, tierLabel, tierSublabel, tierStyle, priceCategory,
}: Props) {
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* ── Photo strip ── */}
      <div
        className="relative h-56 overflow-hidden shrink-0 cursor-zoom-in group/photo"
        onClick={() => image && setOpen(true)}
      >
        {image ? (
          <div className="absolute inset-0" style={{ background: 'linear-gradient(to bottom, #0a0805 0%, #1a1208 100%)' }}>
            <img
              src={image}
              alt={name}
              className="absolute inset-0 w-full h-full object-contain object-center p-4 drop-shadow-[0_8px_24px_rgba(0,0,0,0.7)] transition-transform duration-500 group-hover/photo:scale-105"
            />
          </div>
        ) : (
          <div className="w-full h-full" style={{ background: gradient }} />
        )}

        {/* dark vignette bottom */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-transparent to-black/80 pointer-events-none" />

        {/* Tier badge */}
        <div className="absolute top-3 right-3 flex flex-col items-end gap-1">
          <span className={`px-3 py-1 text-xs font-bold tracking-widest uppercase rounded-full shadow-sm ${tierStyle}`}>
            {tierLabel}
          </span>
          {priceCategory === 'high-end' && (
            <span className={`px-2.5 py-0.5 text-[10px] font-bold tracking-widest uppercase rounded-full shadow-sm ${PRICE_CATEGORY_BADGE['high-end']}`}>
              Luxury
            </span>
          )}
        </div>

        {/* Zoom hint */}
        {image && (
          <div className="absolute top-3 left-3 opacity-0 group-hover/photo:opacity-100 transition-opacity">
            <div className="bg-black/50 rounded-full p-1.5">
              <ZoomIn className="w-3.5 h-3.5 text-white/80" />
            </div>
          </div>
        )}

        {/* Name over image */}
        <div className="absolute bottom-3 left-4 right-4 pointer-events-none">
          <p className="text-white/60 text-[10px] font-mono uppercase tracking-widest mb-0.5">{tierSublabel}</p>
          <h3 className="text-lg font-bold font-serif text-white leading-tight drop-shadow-lg">{name}</h3>
        </div>
      </div>

      {/* ── Lightbox ── */}
      <AnimatePresence>
        {open && image && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={() => setOpen(false)}
          >
            {/* backdrop */}
            <div className="absolute inset-0 bg-black/85 backdrop-blur-sm" />

            {/* bottle */}
            <motion.div
              className="relative z-10 max-w-sm w-full flex flex-col items-center"
              initial={{ scale: 0.85, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.85, opacity: 0, y: 20 }}
              transition={{ type: 'spring', stiffness: 300, damping: 28 }}
              onClick={e => e.stopPropagation()}
            >
              <img
                src={image}
                alt={name}
                className="max-h-[70vh] w-auto object-contain drop-shadow-[0_20px_60px_rgba(0,0,0,0.9)]"
              />
              <p className="mt-4 text-white/70 font-serif text-base text-center">{name}</p>

              <button
                onClick={() => setOpen(false)}
                className="absolute -top-3 -right-3 bg-white/10 hover:bg-white/20 rounded-full p-2 transition-colors"
              >
                <X className="w-4 h-4 text-white" />
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
