'use client';

import { ExternalLink, CheckCircle2 } from 'lucide-react';
import { Browser } from '@capacitor/browser';
import { Capacitor } from '@capacitor/core';
import { useState, useEffect } from 'react';

interface ChannelLinkProps {
  name: string;
  priceText: string;
  url: string;
  isHighlight?: boolean;
}

export function ChannelLink({ name, priceText, url, isHighlight = false }: ChannelLinkProps) {
  const [showToast, setShowToast] = useState(false);
  const [showErrorToast, setShowErrorToast] = useState(false);

  useEffect(() => {
    if (showToast) {
      const timer = setTimeout(() => setShowToast(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [showToast]);

  useEffect(() => {
    if (showErrorToast) {
      const timer = setTimeout(() => setShowErrorToast(false), 4000);
      return () => clearTimeout(timer);
    }
  }, [showErrorToast]);

  const handleClick = async () => {
    console.log("Channel link clicked:", url);
    setShowToast(true);
    setShowErrorToast(false);
    
    try {
      if (Capacitor.isNativePlatform()) {
        await Browser.open({ url, windowName: '_system' });
      } else {
        // Run window.open synchronously to avoid popup blockers
        window.open(url, '_blank', 'noopener,noreferrer');
      }
    } catch (e) {
      console.warn("Failed to open link natively, falling back to window.open", e);
      try {
        window.open(url, '_blank', 'noopener,noreferrer');
      } catch (fallbackError) {
        console.error("Fallback failed", fallbackError);
        setShowToast(false);
        setShowErrorToast(true);
      }
    }
  };

  return (
    <div 
      role="button"
      tabIndex={0}
      onClick={handleClick}
      onKeyDown={(e) => { if (e.key === 'Enter') handleClick(); }}
      className={`
        flex justify-between items-center p-4 rounded-sm transition-all duration-300 cursor-pointer group hover:scale-[1.02] hover:shadow-md active:bg-gray-100 active:scale-95
        ${isHighlight 
          ? 'bg-olive-900/5 border border-olive-900/20 hover:bg-olive-900/10' 
          : 'bg-cream-100 hover:bg-cream-200'}
      `}
    >
      <span className={`flex items-center gap-2 ${isHighlight ? 'text-olive-900 font-medium' : 'text-brown-900/70'}`}>
        {name}
        <ExternalLink className="w-4 h-4 opacity-50 group-hover:opacity-100 transition-opacity" />
      </span>
      <span className={`font-bold ${isHighlight ? 'text-olive-900' : 'text-brown-900'}`}>
        {priceText}
      </span>

      {/* Success Toast */}
      {showToast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 animate-in fade-in slide-in-from-bottom-5 duration-300">
          <div className="bg-olive-900 text-cream-100 px-6 py-3 rounded-full shadow-xl flex items-center gap-2 text-sm font-medium border border-olive-700">
            <CheckCircle2 className="w-4 h-4 text-cream-200" />
            해당 상품 검색 페이지로 이동합니다
          </div>
        </div>
      )}

      {/* Error Toast */}
      {showErrorToast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 animate-in fade-in slide-in-from-bottom-5 duration-300">
          <div className="bg-red-900/90 text-white px-6 py-3 rounded-full shadow-xl flex items-center gap-2 text-sm font-medium border border-red-800">
            <span className="font-bold text-lg leading-none">!</span>
            브라우저를 열 수 없습니다. 직접 검색을 시도해 주세요.
          </div>
        </div>
      )}
    </div>
  );
}
