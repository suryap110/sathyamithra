import React from 'react';
import { ShieldCheck, Clock, ExternalLink } from 'lucide-react';

interface SourceBadgeProps {
  ministry?: string | null;
  state?: string;
  officialUrl?: string | null;
  lastVerifiedAt?: string | null;
}

export function SourceBadge({ ministry, state = 'Central', officialUrl, lastVerifiedAt }: SourceBadgeProps) {
  return (
    <div className="inline-flex flex-wrap items-center gap-2 text-xs bg-slate-50 border border-slate-200 rounded-lg p-2.5">
      <div className="flex items-center gap-1.5 font-semibold text-sathya-teal-700">
        <ShieldCheck className="w-4 h-4 text-sathya-teal-600" />
        <span>Verified Government Source</span>
      </div>

      <span className="text-slate-300">|</span>

      <span className="text-slate-600 font-medium">
        {ministry ? ministry : `${state} Government Department`}
      </span>

      {officialUrl && (
        <a
          href={officialUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 text-sathya-indigo-700 font-semibold hover:underline ml-auto"
        >
          <span>Official Portal</span>
          <ExternalLink className="w-3 h-3" />
        </a>
      )}
    </div>
  );
}
