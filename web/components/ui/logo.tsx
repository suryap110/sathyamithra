import React from 'react';
import Link from 'next/link';

interface LogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export function Logo({ className = '', size = 'md' }: LogoProps) {
  const iconSizes = {
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-14 h-14',
  };

  const textSizes = {
    sm: 'text-lg',
    md: 'text-xl',
    lg: 'text-2xl',
  };

  return (
    <Link href="/" className={`inline-flex items-center gap-2.5 group ${className}`}>
      <div
        className={`${iconSizes[size]} rounded-full overflow-hidden border-2 border-emerald-500/40 bg-white p-0.5 shadow-md group-hover:scale-105 transition-transform duration-200 shrink-0`}
      >
        <img
          src="/logo-square.png"
          alt="Sathyamithra Logo"
          className="w-full h-full object-cover rounded-full"
        />
      </div>
      <div className="flex flex-col">
        <span className={`${textSizes[size]} font-extrabold tracking-tight text-emerald-800 dark:text-emerald-400 group-hover:text-emerald-600 transition-colors`}>
          Sathyamithra
        </span>
        <span className="text-[10px] font-semibold text-gray-500 dark:text-gray-400 -mt-0.5 tracking-wider">
          सत्यमित्र · Citizen Portal
        </span>
      </div>
    </Link>
  );
}

