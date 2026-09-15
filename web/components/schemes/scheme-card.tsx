import React from 'react';
import Link from 'next/link';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { formatCurrency } from '@/lib/utils';
import { ShieldCheck, FileCheck, ArrowRight, Bookmark } from 'lucide-react';

export interface SchemeItem {
  id: string;
  title: string;
  short_description: string;
  state: string;
  ministry?: string | null;
  benefit_type?: string | null;
  estimated_benefit_amount?: number | null;
  benefit_summary?: string | null;
  application_mode?: string | null;
  official_url?: string | null;
  is_verified?: boolean;
}

interface SchemeCardProps {
  scheme: SchemeItem;
  matchScore?: number;
}

export function SchemeCard({ scheme, matchScore = 92 }: SchemeCardProps) {
  return (
    <Card className="flex flex-col justify-between hover:border-sathya-teal-500 transition-all duration-200 group">
      <div className="space-y-4">
        {/* Top Badges */}
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <div className="flex items-center gap-2">
            <Badge variant="secondary">{scheme.state}</Badge>
            {matchScore && (
              <Badge variant="accent">
                {matchScore}% Match
              </Badge>
            )}
          </div>

          {scheme.is_verified && (
            <div className="inline-flex items-center gap-1 text-[11px] font-semibold text-sathya-teal-700 bg-sathya-teal-50 px-2 py-0.5 rounded-md border border-sathya-teal-100">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Verified</span>
            </div>
          )}
        </div>

        {/* Title & Ministry */}
        <div className="space-y-1">
          <h3 className="text-base font-bold text-sathya-indigo-900 group-hover:text-sathya-teal-700 transition-colors line-clamp-2">
            {scheme.title}
          </h3>
          <p className="text-xs text-slate-500 font-medium">
            {scheme.ministry || `${scheme.state} Government`}
          </p>
        </div>

        {/* Description */}
        <p className="text-xs text-slate-600 leading-relaxed line-clamp-3">
          {scheme.short_description}
        </p>

        {/* Benefit Summary Box */}
        {scheme.benefit_summary && (
          <div className="p-2.5 rounded-lg bg-sathya-indigo-50/70 border border-sathya-indigo-100/50 space-y-1">
            <span className="text-[10px] font-bold text-sathya-indigo-700 uppercase tracking-wider block">
              Estimated Benefit
            </span>
            <p className="text-xs font-bold text-sathya-indigo-900">
              {scheme.benefit_summary}
            </p>
          </div>
        )}
      </div>

      {/* Footer & Actions */}
      <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between gap-2">
        <div className="text-[11px] text-slate-500 font-medium flex items-center gap-1">
          <FileCheck className="w-3.5 h-3.5 text-sathya-teal-600" />
          <span>{scheme.application_mode || 'Online'}</span>
        </div>

        <div className="flex items-center gap-2">
          <Link href={`/schemes/${scheme.id}`}>
            <Button variant="primary" size="sm" className="gap-1 rounded-lg">
              <span>View Details</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Button>
          </Link>
        </div>
      </div>
    </Card>
  );
}
