import React from 'react';

export function Card({ children, className = '', ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div 
      className={`bg-white border border-olive-900/10 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] p-6 md:p-8 ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}
