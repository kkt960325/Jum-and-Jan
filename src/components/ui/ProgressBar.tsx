import React from 'react';

interface ProgressBarProps {
  progress: number; // 0 to 100
  className?: string;
}

export function ProgressBar({ progress, className = '' }: ProgressBarProps) {
  return (
    <div className={`w-full bg-slate-800 rounded-full h-2.5 ${className}`}>
      <div 
        className="bg-whiskey-500 h-2.5 rounded-full transition-all duration-500 ease-in-out" 
        style={{ width: `${Math.min(Math.max(progress, 0), 100)}%` }}
      ></div>
    </div>
  );
}
