'use client';

import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { Whiskey, Food } from '@/lib/data';

interface FlavorRadarChartProps {
  whiskey: Whiskey;
  food: Food;
}

export function FlavorRadarChart({ whiskey, food }: FlavorRadarChartProps) {
  const hasMatch = (arr: string[], keywords: string[]) => 
    arr.some(item => keywords.some(k => item.toLowerCase().includes(k)));

  const floor = (v: number) => Math.max(v, 30);

  // Generate deterministic scores (0-100) — floor 30 prevents needle spikes
  const wSweet = floor(hasMatch(whiskey.taste, ['sweet']) ? 80 : (hasMatch(whiskey.aroma, ['vanilla', 'honey']) ? 60 : 30));
  const wSmoke = floor(hasMatch(whiskey.taste, ['smoky', 'medicinal']) || hasMatch(whiskey.aroma, ['smoke', 'peat']) ? 90 : 30);
  const wSpice = floor(hasMatch(whiskey.taste, ['spicy']) || hasMatch(whiskey.aroma, ['spice']) ? 75 : 30);
  const wUmami = floor(hasMatch(whiskey.taste, ['rich']) ? 75 : 40);
  const wFruit = floor(hasMatch(whiskey.aroma, ['fruit', 'citrus', 'peach', 'dried fruit']) ? 85 : 30);
  const wWoody = floor(hasMatch(whiskey.aroma, ['oak']) || hasMatch(whiskey.taste, ['nutty']) ? 85 : 40);

  const fSweet = floor(hasMatch(food.taste, ['sweet']) ? 80 : 30);
  const fSmoke = floor(hasMatch(food.aroma, ['smoke', 'roasted']) ? 80 : 30);
  const fSpice = floor(food.capsaicinLevel * 10 || (hasMatch(food.taste, ['pungent']) ? 80 : 30));
  const fUmami = floor(Math.min(100, (hasMatch(food.taste, ['umami', 'rich']) ? 70 : 35) + food.fermentationLevel * 3));
  const fFruit = floor(hasMatch(food.aroma, ['citrus']) ? 75 : 30);
  const fWoody = floor(hasMatch(food.aroma, ['grain', 'nutty', 'oil']) ? 65 : 30);

  const data = [
    { subject: '단맛 (Sweet)', whiskey: wSweet, food: fSweet, fullMark: 100 },
    { subject: '스모키 (Smoke)', whiskey: wSmoke, food: fSmoke, fullMark: 100 },
    { subject: '스파이시 (Spicy)', whiskey: wSpice, food: fSpice, fullMark: 100 },
    { subject: '감칠맛/바디 (Umami)', whiskey: wUmami, food: fUmami, fullMark: 100 },
    { subject: '시트러스/과실 (Fruity)', whiskey: wFruit, food: fFruit, fullMark: 100 },
    { subject: '오크/너티 (Woody)', whiskey: wWoody, food: fWoody, fullMark: 100 },
  ];

  return (
    <div className="w-full h-64 md:h-80 -ml-2 md:ml-0">
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart cx="50%" cy="50%" outerRadius="65%" data={data}>
          <PolarGrid stroke="#e5e7eb" strokeDasharray="3 3" />
          <PolarAngleAxis dataKey="subject" tick={{ fill: '#5c4033', fontSize: 11, fontWeight: 600 }} />
          <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
          
          <Tooltip 
            contentStyle={{ backgroundColor: '#ffffff', borderColor: '#e5e7eb', color: '#2d2a26', borderRadius: '8px', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
            itemStyle={{ fontWeight: 600 }}
          />
          <Legend wrapperStyle={{ paddingTop: '10px', fontSize: '14px', color: '#2d2a26' }} />
          
          <Radar name={whiskey.name} dataKey="whiskey" stroke="#4a5d23" fill="#4a5d23" fillOpacity={0.5} strokeWidth={2} />
          <Radar name={food.name} dataKey="food" stroke="#8b5a2b" fill="#8b5a2b" fillOpacity={0.4} strokeWidth={2} />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
}
