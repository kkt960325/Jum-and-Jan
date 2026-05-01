'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export interface MapWhiskey {
  id: string;
  name: string;
  x: number; // -1 to 1
  y: number; // -1 to 1
  rank?: number; // 0-based: top 3 matches (used only for highlight, no badge)
  abv: number;
}

interface FlavorMapProps {
  whiskeys: MapWhiskey[];
  userPosition: { x: number; y: number };
}

const toP = (v: number) => `${((v + 1) / 2) * 88 + 6}%`;

// Top-match highlight color (same for all — they're all "close to you")
const MATCH_COLOR = '#a3c46a';

function getQuadrantDesc(x: number, y: number): string {
  if (x < -0.2 && y > 0.2) return '피티 · 묵직 — 아일라 스타일';
  if (x > 0.2 && y > 0.2)  return '달콤 · 풀바디 — 셰리/버번 스타일';
  if (x < -0.2 && y < -0.2) return '피티 · 섬세 — 로우랜드 피트';
  if (x > 0.2 && y < -0.2)  return '산뜻 · 가벼운 — 하이볼 스타일';
  return '밸런스 — 중심부 복합 풍미';
}

export function FlavorMap({ whiskeys, userPosition }: FlavorMapProps) {
  const [hovered, setHovered] = useState<string | null>(null);

  const userQuadrant = getQuadrantDesc(userPosition.x, userPosition.y);

  return (
    <div className="space-y-2">
      <div className="relative w-full" style={{ paddingBottom: '56.25%' }}>
        <div className="absolute inset-0 rounded-lg overflow-hidden"
          style={{
            background: 'radial-gradient(ellipse at 40% 50%, #1a1f0e 0%, #0d1008 60%, #080b05 100%)',
          }}
        >
          {/* Noise */}
          <svg width="0" height="0" className="absolute" aria-hidden="true">
            <defs>
              <filter id="map-noise">
                <feTurbulence type="fractalNoise" baseFrequency="0.75" numOctaves="4" stitchTiles="stitch" result="noise" />
                <feColorMatrix type="saturate" values="0" in="noise" result="grey" />
                <feBlend in="SourceGraphic" in2="grey" mode="overlay" result="blend" />
                <feComposite in="blend" in2="SourceGraphic" operator="in" />
              </filter>
            </defs>
          </svg>
          <div className="absolute inset-0 opacity-[0.06]"
            style={{ filter: 'url(#map-noise)', backgroundImage: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'300\' height=\'300\'%3E%3Cfilter id=\'n\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.9\' numOctaves=\'4\'/%3E%3C/filter%3E%3Crect width=\'300\' height=\'300\' filter=\'url(%23n)\' opacity=\'1\'/%3E%3C/svg%3E")', backgroundSize: '300px 300px' }}
          />

          {/* Grid */}
          <svg className="absolute inset-0 w-full h-full" aria-hidden="true">
            <line x1="50%" y1="0" x2="50%" y2="100%" stroke="rgba(255,255,255,0.06)" strokeWidth="1" strokeDasharray="4 6" />
            <line x1="0" y1="50%" x2="100%" y2="50%" stroke="rgba(255,255,255,0.06)" strokeWidth="1" strokeDasharray="4 6" />
            <rect x="6%" y="6%" width="88%" height="88%" fill="none" stroke="rgba(255,255,255,0.04)" strokeWidth="1" />
          </svg>

          {/* ── 사분면 레이블 ── */}
          <div className="absolute top-[8%] left-[8%] text-[9px] md:text-[11px] text-white/30 font-mono leading-tight pointer-events-none">
            <span className="block">🥃 피티·묵직</span>
            <span className="block text-white/20">아일라 스타일</span>
          </div>
          <div className="absolute top-[8%] right-[8%] text-[9px] md:text-[11px] text-white/30 font-mono leading-tight pointer-events-none text-right">
            <span className="block">🍯 달콤·풀바디</span>
            <span className="block text-white/20">셰리/버번 스타일</span>
          </div>
          <div className="absolute bottom-[14%] left-[8%] text-[9px] md:text-[11px] text-white/30 font-mono leading-tight pointer-events-none">
            <span className="block">🌿 피티·섬세</span>
            <span className="block text-white/20">로우랜드 피트</span>
          </div>
          <div className="absolute bottom-[14%] right-[8%] text-[9px] md:text-[11px] text-white/30 font-mono leading-tight pointer-events-none text-right">
            <span className="block">🍋 산뜻·가벼운</span>
            <span className="block text-white/20">하이볼 스타일</span>
          </div>

          {/* Axis labels */}
          <div className="absolute left-2 top-1/2 -translate-y-1/2 -rotate-90 text-[10px] md:text-xs text-white/25 font-mono tracking-widest uppercase whitespace-nowrap pointer-events-none">
            묵직 · 강렬
          </div>
          <div className="absolute right-2 top-1/2 -translate-y-1/2 rotate-90 text-[10px] md:text-xs text-white/25 font-mono tracking-widest uppercase whitespace-nowrap pointer-events-none">
            가볍 · 섬세
          </div>
          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 text-[10px] md:text-xs text-white/25 font-mono tracking-widest uppercase pointer-events-none">
            ← 피티 · 스모키 &nbsp;&nbsp;&nbsp; 달콤 · 과일 →
          </div>

          {/* Whiskey dots */}
          {whiskeys.map((w, i) => {
            const isMatch = w.rank !== undefined;
            const color = isMatch ? MATCH_COLOR : 'rgba(255,255,255,0.32)';
            const size = isMatch ? 13 : 7;
            const isHovered = hovered === w.id;
            const quadrant = getQuadrantDesc(w.x, w.y);

            return (
              <motion.div
                key={w.id}
                className="absolute -translate-x-1/2 -translate-y-1/2 cursor-pointer z-10"
                style={{ left: toP(w.x), top: toP(-w.y) }}
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.03, type: 'spring', stiffness: 260, damping: 20 }}
                onMouseEnter={() => setHovered(w.id)}
                onMouseLeave={() => setHovered(null)}
              >
                {/* Glow ring for matches */}
                {isMatch && (
                  <motion.div
                    className="absolute rounded-full"
                    style={{ backgroundColor: color, width: size + 10, height: size + 10, left: -(size + 10) / 2 + size / 2, top: -(size + 10) / 2 + size / 2 }}
                    animate={{ opacity: [0.15, 0.4, 0.15], scale: [1, 1.5, 1] }}
                    transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut', delay: (w.rank ?? 0) * 0.4 }}
                  />
                )}

                {/* Dot */}
                <motion.div
                  className="rounded-full relative"
                  style={{
                    width: size,
                    height: size,
                    backgroundColor: color,
                    boxShadow: isMatch
                      ? `0 0 ${isHovered ? 20 : 8}px ${color}, 0 0 ${isHovered ? 40 : 16}px ${color}55`
                      : isHovered ? `0 0 8px rgba(255,255,255,0.6)` : 'none',
                  }}
                  animate={{ scale: isHovered ? 1.6 : 1 }}
                  transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                />

                {/* 추천 위스키 이름 레이블 */}
                {isMatch && !isHovered && (
                  <div
                    className="absolute -top-5 left-1/2 -translate-x-1/2 flex flex-col items-center gap-px pointer-events-none"
                  >
                    <span
                      className="text-[7px] font-bold font-mono tracking-wide whitespace-nowrap leading-none"
                      style={{ color: MATCH_COLOR }}
                    >
                      추천
                    </span>
                    <span
                      className="text-[7px] font-semibold font-mono whitespace-nowrap leading-none"
                      style={{ color: MATCH_COLOR + 'cc' }}
                    >
                      {w.name.replace(/\s*(싱글 몰트|스카치|위스키|아이리쉬)\s*/gi, '').trim().slice(0, 10)}
                    </span>
                  </div>
                )}

                {/* Hover tooltip */}
                <AnimatePresence>
                  {isHovered && (
                    <motion.div
                      className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 z-50 pointer-events-none"
                      initial={{ opacity: 0, y: 4 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 4 }}
                      transition={{ duration: 0.15 }}
                    >
                      <div className="bg-stone-900/95 border border-white/10 rounded px-2.5 py-2 text-center shadow-xl backdrop-blur-sm whitespace-nowrap">
                        <p className="text-white text-[11px] font-semibold leading-tight">{w.name}</p>
                        <p className="text-white/50 text-[10px] font-mono">ABV {w.abv}%</p>
                        <p className="text-white/40 text-[9px] mt-0.5 font-light">{quadrant}</p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}

          {/* User position */}
          <motion.div
            className="absolute -translate-x-1/2 -translate-y-1/2 z-20 pointer-events-none"
            style={{ left: toP(userPosition.x), top: toP(-userPosition.y) }}
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.6, type: 'spring', stiffness: 200, damping: 18 }}
          >
            {[1, 2, 3].map(r => (
              <motion.div
                key={r}
                className="absolute rounded-full border border-amber-400/40"
                style={{ width: r * 16, height: r * 16, left: -(r * 16) / 2 + 6, top: -(r * 16) / 2 + 6 }}
                animate={{ opacity: [0.6, 0, 0.6], scale: [0.8, 1.4, 0.8] }}
                transition={{ duration: 2.8, repeat: Infinity, ease: 'easeInOut', delay: r * 0.4 }}
              />
            ))}
            <div
              className="relative rounded-full bg-amber-400"
              style={{ width: 12, height: 12, boxShadow: '0 0 12px #fbbf24, 0 0 28px #fbbf2488, 0 0 48px #fbbf2433' }}
            />
            <div className="absolute top-full mt-1.5 left-1/2 -translate-x-1/2 whitespace-nowrap">
              <span className="text-[9px] font-bold text-amber-400/80 font-mono tracking-widest uppercase">나의 위치</span>
            </div>
          </motion.div>
        </div>
      </div>

      {/* 범례 */}
      <div className="flex items-center gap-5 px-1 py-1.5 justify-end">
        <span className="flex items-center gap-1.5 text-[10px] text-white/35 font-mono">
          <span className="w-2 h-2 rounded-full bg-white/30 shrink-0 inline-block" />
          DB 전체 위스키 ({whiskeys.length}종)
        </span>
        <span className="flex items-center gap-1.5 text-[10px] font-mono" style={{ color: MATCH_COLOR + 'cc' }}>
          <span className="w-3 h-3 rounded-full shrink-0 inline-block" style={{ backgroundColor: MATCH_COLOR, boxShadow: `0 0 6px ${MATCH_COLOR}` }} />
          당신 취향과 가장 가까운 추천
        </span>
        <span className="flex items-center gap-1.5 text-[10px] text-amber-400/60 font-mono">
          <span className="w-3 h-3 rounded-full shrink-0 inline-block bg-amber-400" style={{ boxShadow: '0 0 6px #fbbf24' }} />
          나의 위치
        </span>
      </div>

      {/* 위치 해석 배너 */}
      <div className="flex items-start gap-3 p-3 rounded-sm bg-stone-950/60 border border-white/5">
        <div className="w-2 h-2 rounded-full bg-amber-400 shrink-0 mt-1" style={{ boxShadow: '0 0 6px #fbbf24' }} />
        <div>
          <span className="text-xs text-amber-400/80 font-mono font-bold uppercase tracking-widest">나의 위치 해석</span>
          <p className="text-xs text-white/50 mt-0.5 font-light">{userQuadrant}</p>
          <p className="text-[10px] text-white/30 mt-1">
            지도의 모든 점은 DB에 수록된 위스키의 7차원 풍미 벡터를 2D로 투영한 것입니다. 초록 빛나는 점은 당신의 취향 벡터와 코사인 유사도가 가장 높은 추천 위스키입니다.
          </p>
        </div>
      </div>
    </div>
  );
}
