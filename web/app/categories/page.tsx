'use client';

import React from 'react';
import Link from 'next/link';
import { CATEGORIES, ALL_SCHEMES } from '@/lib/schemes-data';
import { Layers, ArrowRight, Sparkles } from 'lucide-react';

export default function CategoriesPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <div className="space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-green-50 text-green-700 text-xs font-semibold border border-green-200">
          <Layers className="w-3.5 h-3.5" />
          <span>15 Sectors & Beneficiary Groups</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 tracking-tight">
          Browse Schemes by Category
        </h1>
        <p className="text-gray-600 text-sm max-w-2xl leading-relaxed">
          Explore all Central and State government welfare programs organized by sector, demographic group, and benefit type.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {CATEGORIES.map((cat) => {
          const count = ALL_SCHEMES.filter(s => s.category === cat.id).length;
          return (
            <Link
              key={cat.id}
              href={`/schemes?cat=${cat.id}`}
              className="group flex flex-col justify-between p-6 bg-white rounded-2xl border border-gray-200 hover:border-green-400 hover:shadow-lg transition-all"
            >
              <div className="space-y-4">
                <div className="w-12 h-12 rounded-xl bg-gray-50 flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">
                  {cat.icon}
                </div>
                <div className="space-y-1">
                  <h3 className="font-bold text-gray-900 text-lg group-hover:text-green-700 transition-colors">
                    {cat.label}
                  </h3>
                  <p className="text-xs text-gray-500">
                    {count > 0 ? `${count} active schemes available` : 'Welfare and empowerment schemes'}
                  </p>
                </div>
              </div>

              <div className="pt-4 mt-4 border-t border-gray-100 flex items-center justify-between text-xs font-semibold text-green-700 group-hover:translate-x-1 transition-transform">
                <span>View schemes</span>
                <ArrowRight className="w-4 h-4" />
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
