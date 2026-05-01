'use client';

import {
  Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  ResponsiveContainer, Tooltip, Legend,
} from 'recharts';
import { VECTOR_DIMS, VECTOR_DIM_LABELS_KR, type FlavorVector } from '@/lib/vector-engine';

interface VectorRadarChartProps {
  userVector: FlavorVector;
  whiskeyVector: FlavorVector;
  whiskeyName: string;
  similarityPct: number; // 0-100
}

export function VectorRadarChart({ userVector, whiskeyVector, whiskeyName, similarityPct }: VectorRadarChartProps) {
  const data = VECTOR_DIMS.map((dim, i) => ({
    subject: VECTOR_DIM_LABELS_KR[dim],
    나의취향: Math.round(userVector[i] * 100),
    [whiskeyName]: Math.round(whiskeyVector[i] * 100),
    fullMark: 100,
  }));

  return (
    <div className="w-full">
      {/* Similarity badge */}
      <div className="flex items-center justify-center gap-2 mb-3">
        <span className="text-xs font-semibold text-brown-900/50 uppercase tracking-widest">코사인 유사도</span>
        <span
          className="text-2xl font-bold font-serif"
          style={{ color: similarityPct >= 90 ? '#4a5d23' : similarityPct >= 75 ? '#8b5a2b' : '#6b7280' }}
        >
          {similarityPct}%
        </span>
        <span className="text-xs text-brown-900/50">
          {similarityPct >= 92 ? '완벽 매칭' : similarityPct >= 80 ? '높은 적합도' : similarityPct >= 65 ? '준수한 매칭' : '참고 추천'}
        </span>
      </div>

      <div className="w-full h-56 md:h-72">
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart cx="50%" cy="50%" outerRadius="62%" data={data}>
            <PolarGrid stroke="rgba(62,39,35,0.12)" strokeDasharray="3 3" />
            <PolarAngleAxis
              dataKey="subject"
              tick={{ fill: '#5c4033', fontSize: 11, fontWeight: 600 }}
            />
            <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
            <Tooltip
              contentStyle={{ backgroundColor: '#fff', borderColor: '#e5e7eb', borderRadius: 8, color: '#2d2a26' }}
              itemStyle={{ fontWeight: 600 }}
              formatter={(v) => [`${v}점`, undefined]}
            />
            <Legend wrapperStyle={{ paddingTop: 8, fontSize: 13, color: '#2d2a26' }} />
            <Radar
              name="나의 취향"
              dataKey="나의취향"
              stroke="#f59e0b"
              fill="#f59e0b"
              fillOpacity={0.25}
              strokeWidth={2}
            />
            <Radar
              name={whiskeyName}
              dataKey={whiskeyName}
              stroke="#4a5d23"
              fill="#4a5d23"
              fillOpacity={0.4}
              strokeWidth={2}
            />
          </RadarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
