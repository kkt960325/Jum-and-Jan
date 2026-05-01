'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Edit3, Save, Trash2, PenLine, Droplet, Wind, Coffee, Flame, ThumbsUp } from 'lucide-react';

interface PersonalTastingNoteProps {
  whiskeyId: string;
}

interface TastingNoteData {
  appearance: string;
  nose: string;
  palate: string;
  finish: string;
  overall: string;
}

const initialNote: TastingNoteData = {
  appearance: '',
  nose: '',
  palate: '',
  finish: '',
  overall: ''
};

export function PersonalTastingNote({ whiskeyId }: PersonalTastingNoteProps) {
  const [noteData, setNoteData] = useState<TastingNoteData>(initialNote);
  const [isEditing, setIsEditing] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  // Load note from localStorage on mount
  useEffect(() => {
    setIsMounted(true);
    const savedNote = localStorage.getItem(`tasting_note_${whiskeyId}`);
    if (savedNote) {
      try {
        const parsed = JSON.parse(savedNote);
        setNoteData(parsed);
      } catch (e) {
        // Fallback for previous simple string format
        setNoteData({ ...initialNote, overall: savedNote });
      }
    }
  }, [whiskeyId]);

  const handleSave = () => {
    localStorage.setItem(`tasting_note_${whiskeyId}`, JSON.stringify(noteData));
    setIsEditing(false);
  };

  const handleDelete = () => {
    if (confirm('작성하신 테이스팅 노트를 삭제하시겠습니까?')) {
      localStorage.removeItem(`tasting_note_${whiskeyId}`);
      setNoteData(initialNote);
      setIsEditing(false);
    }
  };

  const handleChange = (field: keyof TastingNoteData, value: string) => {
    setNoteData(prev => ({ ...prev, [field]: value }));
  };

  // Prevent hydration mismatch by not rendering until mounted
  if (!isMounted) {
    return null;
  }

  const hasContent = Object.values(noteData).some(val => val.trim() !== '');

  return (
    <Card className="p-6 md:p-8 bg-cream-100/50 border border-olive-900/10 shadow-sm relative overflow-hidden group transition-all">
      {/* Decorative accent */}
      <div className="absolute top-0 left-0 w-1 h-full bg-olive-900/40" />

      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-serif font-bold text-brown-900 flex items-center gap-2">
          <PenLine className="w-5 h-5 text-olive-700" />
          My Tasting Note
        </h3>
        
        {!isEditing && hasContent && (
          <button 
            onClick={() => setIsEditing(true)}
            className="text-brown-900/50 hover:text-olive-900 transition-colors flex items-center gap-1 text-sm font-medium"
          >
            <Edit3 className="w-4 h-4" />
            수정하기
          </button>
        )}
      </div>

      {isEditing ? (
        <div className="space-y-6 animate-in fade-in duration-300">
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-bold text-brown-900/60 uppercase tracking-widest">
                <Droplet className="w-4 h-4 text-olive-700" /> Appearance (색/외관)
              </label>
              <textarea
                value={noteData.appearance}
                onChange={(e) => handleChange('appearance', e.target.value)}
                placeholder="색상, 눈물(Legs)의 점도 등..."
                className="w-full min-h-[80px] p-3 bg-white border border-olive-900/20 rounded-sm focus:outline-none focus:border-olive-900 focus:ring-1 focus:ring-olive-900/50 text-brown-900/80 resize-y text-sm"
              />
            </div>
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-bold text-brown-900/60 uppercase tracking-widest">
                <Wind className="w-4 h-4 text-olive-700" /> Nose (향)
              </label>
              <textarea
                value={noteData.nose}
                onChange={(e) => handleChange('nose', e.target.value)}
                placeholder="잔을 돌리며 맡은 첫 향, 세부 향기 등..."
                className="w-full min-h-[80px] p-3 bg-white border border-olive-900/20 rounded-sm focus:outline-none focus:border-olive-900 focus:ring-1 focus:ring-olive-900/50 text-brown-900/80 resize-y text-sm"
              />
            </div>
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-bold text-brown-900/60 uppercase tracking-widest">
                <Coffee className="w-4 h-4 text-olive-700" /> Palate (맛/질감)
              </label>
              <textarea
                value={noteData.palate}
                onChange={(e) => handleChange('palate', e.target.value)}
                placeholder="입안에서의 질감(바디감), 주요 맛 등..."
                className="w-full min-h-[80px] p-3 bg-white border border-olive-900/20 rounded-sm focus:outline-none focus:border-olive-900 focus:ring-1 focus:ring-olive-900/50 text-brown-900/80 resize-y text-sm"
              />
            </div>
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-bold text-brown-900/60 uppercase tracking-widest">
                <Flame className="w-4 h-4 text-olive-700" /> Finish (여운)
              </label>
              <textarea
                value={noteData.finish}
                onChange={(e) => handleChange('finish', e.target.value)}
                placeholder="삼킨 후의 목넘김, 남는 향의 길이 등..."
                className="w-full min-h-[80px] p-3 bg-white border border-olive-900/20 rounded-sm focus:outline-none focus:border-olive-900 focus:ring-1 focus:ring-olive-900/50 text-brown-900/80 resize-y text-sm"
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm font-bold text-brown-900/60 uppercase tracking-widest">
              <ThumbsUp className="w-4 h-4 text-olive-700" /> Overall & Pairing (총평/페어링)
            </label>
            <textarea
              value={noteData.overall}
              onChange={(e) => handleChange('overall', e.target.value)}
              placeholder="전체적인 느낌이나 곁들인 안주와의 조화 등 자유롭게..."
              className="w-full min-h-[100px] p-4 bg-white border border-olive-900/20 rounded-sm focus:outline-none focus:border-olive-900 focus:ring-1 focus:ring-olive-900/50 text-brown-900/80 resize-y text-sm"
            />
          </div>

          <div className="flex justify-end gap-3 pt-2">
            {hasContent && (
              <Button 
                variant="outline" 
                onClick={handleDelete}
                className="text-red-800/70 border-red-900/20 hover:bg-red-50 hover:border-red-900/40 hover:text-red-900 px-4"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                삭제
              </Button>
            )}
            <Button 
              onClick={handleSave}
              className="bg-olive-900 text-cream-100 hover:bg-olive-800 px-6"
            >
              <Save className="w-4 h-4 mr-2" />
              저장하기
            </Button>
          </div>
        </div>
      ) : (
        <div className="animate-in fade-in duration-300">
          {hasContent ? (
            <div className="grid md:grid-cols-2 gap-4">
              {noteData.appearance && (
                <div className="p-4 bg-white rounded-sm border border-brown-900/5 shadow-sm">
                  <h4 className="flex items-center gap-2 text-xs font-bold text-olive-900 uppercase tracking-widest mb-2 border-b border-brown-900/10 pb-2">
                    <Droplet className="w-3 h-3" /> Appearance
                  </h4>
                  <p className="whitespace-pre-wrap text-brown-900/80 text-sm font-light leading-relaxed">{noteData.appearance}</p>
                </div>
              )}
              {noteData.nose && (
                <div className="p-4 bg-white rounded-sm border border-brown-900/5 shadow-sm">
                  <h4 className="flex items-center gap-2 text-xs font-bold text-olive-900 uppercase tracking-widest mb-2 border-b border-brown-900/10 pb-2">
                    <Wind className="w-3 h-3" /> Nose
                  </h4>
                  <p className="whitespace-pre-wrap text-brown-900/80 text-sm font-light leading-relaxed">{noteData.nose}</p>
                </div>
              )}
              {noteData.palate && (
                <div className="p-4 bg-white rounded-sm border border-brown-900/5 shadow-sm">
                  <h4 className="flex items-center gap-2 text-xs font-bold text-olive-900 uppercase tracking-widest mb-2 border-b border-brown-900/10 pb-2">
                    <Coffee className="w-3 h-3" /> Palate
                  </h4>
                  <p className="whitespace-pre-wrap text-brown-900/80 text-sm font-light leading-relaxed">{noteData.palate}</p>
                </div>
              )}
              {noteData.finish && (
                <div className="p-4 bg-white rounded-sm border border-brown-900/5 shadow-sm">
                  <h4 className="flex items-center gap-2 text-xs font-bold text-olive-900 uppercase tracking-widest mb-2 border-b border-brown-900/10 pb-2">
                    <Flame className="w-3 h-3" /> Finish
                  </h4>
                  <p className="whitespace-pre-wrap text-brown-900/80 text-sm font-light leading-relaxed">{noteData.finish}</p>
                </div>
              )}
              {noteData.overall && (
                <div className="p-4 bg-white rounded-sm border border-brown-900/5 shadow-sm md:col-span-2">
                  <h4 className="flex items-center gap-2 text-xs font-bold text-olive-900 uppercase tracking-widest mb-2 border-b border-brown-900/10 pb-2">
                    <ThumbsUp className="w-3 h-3" /> Overall & Pairing
                  </h4>
                  <p className="whitespace-pre-wrap text-brown-900/80 text-sm font-light leading-relaxed">{noteData.overall}</p>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-10 px-4 border border-dashed border-brown-900/20 rounded-sm bg-white/50">
              <p className="text-brown-900/60 mb-6 font-light">아직 작성된 테이스팅 노트가 없습니다.<br/>위스키의 시각적 느낌부터 여운까지 자세히 기록해보세요.</p>
              <Button 
                onClick={() => setIsEditing(true)}
                variant="outline"
                className="border-olive-900/20 text-olive-900 hover:bg-cream-200"
              >
                <PenLine className="w-4 h-4 mr-2" />
                첫 기록 남기기
              </Button>
            </div>
          )}
        </div>
      )}
    </Card>
  );
}
