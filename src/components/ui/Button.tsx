import React from 'react';
import { Loader2 } from 'lucide-react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline';
  isLoading?: boolean;
}

export function Button({ 
  children, 
  variant = 'primary', 
  isLoading, 
  className = '', 
  ...props 
}: ButtonProps) {
  const baseStyles = 'inline-flex items-center justify-center rounded-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-olive-700 disabled:pointer-events-none disabled:opacity-50 px-6 py-3 tracking-widest uppercase text-xs sm:text-sm';
  
  const variants = {
    primary: 'bg-olive-900 text-cream-100 hover:bg-olive-700',
    secondary: 'bg-brown-900 text-cream-100 hover:bg-brown-700',
    outline: 'border border-olive-900 text-olive-900 hover:bg-olive-900/5'
  };

  return (
    <button 
      className={`${baseStyles} ${variants[variant]} ${className}`}
      disabled={isLoading || props.disabled}
      {...props}
    >
      {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
      {children}
    </button>
  );
}
