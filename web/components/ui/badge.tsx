import React from 'react';
import { cn } from '@/lib/utils';

interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'primary' | 'secondary' | 'accent' | 'success' | 'outline';
}

export function Badge({ className, variant = 'primary', children, ...props }: BadgeProps) {
  const variants = {
    primary: 'bg-sathya-indigo-50 text-sathya-indigo-700 border-sathya-indigo-100',
    secondary: 'bg-sathya-teal-50 text-sathya-teal-800 border-sathya-teal-100',
    accent: 'bg-sathya-saffron-100 text-sathya-saffron-600 border-sathya-saffron-500',
    success: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    outline: 'bg-white text-slate-700 border-slate-200',
  };

  return (
    <div
      className={cn(
        'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors',
        variants[variant],
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}
