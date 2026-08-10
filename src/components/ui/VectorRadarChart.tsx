'use client';

import {
  Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  ResponsiveContainer, Tooltip,
} from 'recharts';
import { VECTOR_DIMS, VECTOR_DIM_LABELS_KR, type FlavorVector } from '@/lib/vector-engine';

// ── 각 벡터를 자신의 최대값으로 정규화: 가장 강한 풍미 = 100%
// 이렇게 해야 두 폴리곤이 모두 차트를 채우는 완전한 7각형이 됨
function toSafeArray(v: unknown): number[] {
  if (Array.isArray(v) && v.length === 7) return v as number[];
  if (typeof v === 'string') {
    try {
      const parsed = JSON.parse(v);
      if (Array.isArray(parsed) && parsed.length === 7) return parsed;
    } catch {}
  }
  return [0, 0, 0, 0, 0, 0, 0];
}

function normalizeToMax(v: FlavorVector | unknown): FlavorVector {
  const arr = toSafeArray(v);
  const maxVal = Math.max(...arr, 0.01);
  return arr.map(x => Math.max(0, x) / maxVal) as FlavorVector;
}

// 정규화된 값(0~1)을 차트 도메인(0~100)으로 변환
// floor=22 → 모든 축이 항상 최소 22% 표시되어 7각형 보장
function scale(v: number): number {
  const FLOOR = 22;
  return Math.round(FLOOR + Math.max(0, Math.min(1, v)) * (100 - FLOOR));
}

// ── Custom tooltip ────────────────────────────────────────────────────
interface TooltipProps {
  payload?: Array<{ payload: ChartPoint }>;
  label?: string;
  whiskeyName: string;
}

interface ChartPoint {
  subject: string;
  user: number;
  whiskey: number;
  userRaw: number;
  whiskeyRaw: number;
}

function RadarTooltip({ payload, label, whiskeyName }: TooltipProps) {
  if (!payload?.length) return null;
  const pt = payload[0].payload;
  return (
    <div style={{
      background: 'white',
      border: '1px solid rgba(62,39,35,0.12)',
      borderRadius: 10,
      padding: '8px 12px',
      fontSize: 12,
      boxShadow: '0 4px 16px rgba(0,0,0,0.10)',
      minWidth: 140,
    }}>
      <p style={{ fontWeight: 700, color: '#2d2a26', marginBottom: 6 }}>{label}</p>
      <p style={{ color: '#d97706', marginBottom: 2 }}>
        나의 취향&nbsp;<strong>{pt.userRaw}</strong><span style={{ opacity: 0.55 }}>/100</span>
      </p>
      <p style={{ color: '#4a5d23' }}>
        {whiskeyName}&nbsp;<strong>{pt.whiskeyRaw}</strong><span style={{ opacity: 0.55 }}>/100</span>
      </p>
    </div>
  );
}

// ── Component ─────────────────────────────────────────────────────────
interface Props {
  userVector: FlavorVector;
  whiskeyVector: FlavorVector;
  whiskeyName: string;
  similarityPct: number;
}

export function VectorRadarChart({ userVector, whiskeyVector, whiskeyName, similarityPct }: Props) {
  // 각 벡터를 독립적으로 정규화 → 두 폴리곤 모두 차트를 꽉 채움
  const safeUser    = toSafeArray(userVector);
  const safeWhiskey = toSafeArray(whiskeyVector);
  const normUser    = normalizeToMax(safeUser);
  const normWhiskey = normalizeToMax(safeWhiskey);

  const data: ChartPoint[] = VECTOR_DIMS.map((dim, i) => ({
    subject:    VECTOR_DIM_LABELS_KR[dim],
    user:       scale(normUser[i]),
    whiskey:    scale(normWhiskey[i]),
    userRaw:    Math.round((safeUser[i] ?? 0) * 100),
    whiskeyRaw: Math.round((safeWhiskey[i] ?? 0) * 100),
  }));

  const matchLabel =
    similarityPct >= 92 ? '완벽 매칭' :
    similarityPct >= 80 ? '높은 적합도' :
    similarityPct >= 65 ? '준수한 매칭' : '참고 추천';

  const matchColor =
    similarityPct >= 90 ? '#4a5d23' :
    similarityPct >= 75 ? '#8b5a2b' : '#6b7280';

  return (
    <div className="w-full select-none">

      {/* ── Similarity badge ── */}
      <div className="flex items-center justify-center gap-2 mb-2">
        <span className="text-[10px] font-semibold text-brown-900/40 uppercase tracking-widest">
          코사인 유사도
        </span>
        <span className="text-xl font-bold font-serif" style={{ color: matchColor }}>
          {similarityPct}%
        </span>
        <span className="text-[10px] text-brown-900/45">{matchLabel}</span>
      </div>

      {/* ── Custom legend ── */}
      <div className="flex justify-center gap-5 mb-1">
        <span className="flex items-center gap-1.5 text-[10px] text-stone-500 font-medium">
          <span
            className="inline-block w-2.5 h-2.5 rounded-sm"
            style={{ background: 'rgba(245,158,11,0.55)', border: '1px solid #f59e0b' }}
          />
          나의 취향
        </span>
        <span className="flex items-center gap-1.5 text-[10px] text-stone-500 font-medium">
          <span
            className="inline-block w-2.5 h-2.5 rounded-sm"
            style={{ background: 'rgba(74,93,35,0.50)', border: '1px solid #4a5d23' }}
          />
          {whiskeyName}
        </span>
      </div>

      {/* ── Chart ── */}
      <div className="w-full h-52 md:h-60">
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart cx="50%" cy="50%" outerRadius="62%" data={data}>

            <PolarGrid
              stroke="rgba(62,39,35,0.08)"
              strokeDasharray="2 5"
              gridType="polygon"
            />

            <PolarAngleAxis
              dataKey="subject"
              tickLine={false}
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              tick={(props: any) => {
                const { x, y, payload, cx, cy } = props as {
                  x: number; y: number; cx: number; cy: number;
                  payload: { value: string };
                };
                const dx = x - cx;
                const dy = y - cy;
                const len = Math.sqrt(dx * dx + dy * dy) || 1;
                return (
                  <text
                    x={x + (dx / len) * 6}
                    y={y + (dy / len) * 6}
                    textAnchor="middle" dominantBaseline="central"
                    style={{ fill: '#7c6152', fontSize: 10, fontWeight: 500 }}
                  >
                    {payload.value}
                  </text>
                );
              }}
            />

            <PolarRadiusAxis
              angle={30}
              domain={[0, 100]}
              tick={false}
              axisLine={false}
              tickLine={false}
            />

            <Tooltip
              content={(props) => (
                <RadarTooltip
                  payload={props.payload as unknown as TooltipProps['payload']}
                  label={props.label as string}
                  whiskeyName={whiskeyName}
                />
              )}
            />

            {/* User vector — amber */}
            <Radar
              name="나의 취향"
              dataKey="user"
              stroke="#f59e0b"
              strokeWidth={1.5}
              fill="#f59e0b"
              fillOpacity={0.22}
              dot={false}
              activeDot={{ r: 3, fill: '#f59e0b', stroke: 'white', strokeWidth: 1.5 }}
            />

            {/* Whiskey vector — olive */}
            <Radar
              name={whiskeyName}
              dataKey="whiskey"
              stroke="#4a5d23"
              strokeWidth={2}
              fill="#4a5d23"
              fillOpacity={0.30}
              dot={false}
              activeDot={{ r: 3, fill: '#4a5d23', stroke: 'white', strokeWidth: 1.5 }}
            />

          </RadarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
