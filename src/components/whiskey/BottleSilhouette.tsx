'use client';

import { useId } from 'react';

interface Props {
  className?: string;
  style?: React.CSSProperties;
}

export function BottleSilhouette({ className, style }: Props) {
  const uid = useId().replace(/:/g, '');

  // Scotch-style bottle: cap → neck → shoulder → body → base
  const bodyPath =
    'M41,22 L41,65 C41,82 29,88 29,95 L29,225 C29,233 35,238 42,238 L58,238 C65,238 71,233 71,225 L71,95 C71,88 59,82 59,65 L59,22 Z';
  const capPath =
    'M39,22 L39,7 Q39,3 42,3 L58,3 Q61,3 61,7 L61,22 Z';

  return (
    <svg
      viewBox="0 0 100 250"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      style={style}
      aria-hidden="true"
    >
      <defs>
        {/* Glass body: dark L→R gradient for 3-D depth */}
        <linearGradient id={`${uid}g`} x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%"   stopColor="#0b0905" />
          <stop offset="22%"  stopColor="#1e1812" />
          <stop offset="50%"  stopColor="#2c2219" />
          <stop offset="78%"  stopColor="#181310" />
          <stop offset="100%" stopColor="#050302" />
        </linearGradient>

        {/* Amber liquid */}
        <linearGradient id={`${uid}l`} x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%"   stopColor="#c8850c" stopOpacity="0.38" />
          <stop offset="100%" stopColor="#7c4f08" stopOpacity="0.68" />
        </linearGradient>

        {/* Left-edge glass highlight */}
        <linearGradient id={`${uid}s`} x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%"   stopColor="white" stopOpacity="0.18" />
          <stop offset="100%" stopColor="white" stopOpacity="0" />
        </linearGradient>

        {/* Gold cap */}
        <linearGradient id={`${uid}c`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%"   stopColor="#9a7018" />
          <stop offset="50%"  stopColor="#D4AF37" />
          <stop offset="100%" stopColor="#7c5a10" />
        </linearGradient>

        {/* Clip to bottle shape */}
        <clipPath id={`${uid}p`}>
          <path d={bodyPath} />
        </clipPath>
      </defs>

      {/* Ground shadow */}
      <ellipse cx="50" cy="244" rx="23" ry="5" fill="rgba(0,0,0,0.45)" />

      {/* Glass body */}
      <path d={bodyPath} fill={`url(#${uid}g)`} />

      {/* Amber liquid (lower ~55% of body) */}
      <rect x="29" y="152" width="42" height="86"
        fill={`url(#${uid}l)`} clipPath={`url(#${uid}p)`} />

      {/* Liquid surface meniscus */}
      <path d="M29,152 Q50,149 71,152"
        stroke="#c8850c" strokeWidth="0.6" strokeOpacity="0.35" fill="none"
        clipPath={`url(#${uid}p)`} />

      {/* Left glass highlight stripe */}
      <rect x="32" y="96" width="3.5" height="128"
        fill={`url(#${uid}s)`} rx="1.5" clipPath={`url(#${uid}p)`} />

      {/* Right faint rim */}
      <rect x="65" y="96" width="2" height="100"
        fill="white" fillOpacity="0.035" clipPath={`url(#${uid}p)`} />

      {/* Label recess */}
      <rect x="31" y="130" width="38" height="62" rx="2"
        fill="rgba(255,255,255,0.02)"
        stroke="rgba(255,255,255,0.09)"
        strokeWidth="0.7"
        clipPath={`url(#${uid}p)`}
      />
      <line x1="36" y1="150" x2="64" y2="150"
        stroke="rgba(212,175,55,0.16)" strokeWidth="0.5"
        clipPath={`url(#${uid}p)`} />
      <line x1="36" y1="168" x2="64" y2="168"
        stroke="rgba(212,175,55,0.10)" strokeWidth="0.5"
        clipPath={`url(#${uid}p)`} />

      {/* Bottle outline (subtle) */}
      <path d={bodyPath}
        fill="none"
        stroke="rgba(255,255,255,0.055)"
        strokeWidth="0.8"
      />

      {/* Gold cap */}
      <path d={capPath} fill={`url(#${uid}c)`} />
      <rect x="41" y="5" width="10" height="6" rx="1.5"
        fill="rgba(255,255,255,0.18)" />

      {/* Cap-neck separator line */}
      <line x1="39" y1="22" x2="61" y2="22"
        stroke="rgba(212,175,55,0.30)" strokeWidth="0.9" />
    </svg>
  );
}
