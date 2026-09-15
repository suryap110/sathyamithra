import React from 'react';
import { ShieldCheck, ExternalLink, Calendar } from 'lucide-react';

interface Source {
  scheme_name: string;
  ministry: string;
  state: string;
  source_url: string;
  last_verified: string;
  confidence: string;
}

export function SourceCitation({ source }: { source: Source }) {
  return (
    <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-xs space-y-1.5">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5 font-bold text-sathya-indigo-900">
          <ShieldCheck className="w-3.5 h-3.5 text-sathya-teal-600" />
          <span>{source.scheme_name}</span>
        </div>
        <span className="text-[10px] font-semibold bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded border border-emerald-100">
          {source.confidence} Confidence
        </span>
      </div>

      <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1">
        <span>{source.ministry} ({source.state})</span>
        <div className="flex items-center gap-2">
          <span className="flex items-center gap-1">
            <Calendar className="w-3 h-3 text-slate-400" />
            <span>Verified: {source.last_verified}</span>
          </span>
          {source.source_url && (
            <a
              href={source.source_url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sathya-teal-600 font-semibold hover:underline inline-flex items-center gap-0.5"
            >
              <span>Portal</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
