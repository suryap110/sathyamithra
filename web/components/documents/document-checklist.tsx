'use client';

import React from 'react';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, AlertTriangle, XCircle, Clock, FileText } from 'lucide-react';

export interface DocumentChecklistProps {
  items: Array<{
    required_document_type: string;
    description?: string;
    is_mandatory: boolean;
    status: 'MATCHED' | 'MISSING' | 'EXPIRING' | 'NEEDS_REVIEW';
    user_document?: any;
  }>;
  onUploadClick?: (docType: string) => void;
}

export function DocumentChecklist({ items, onUploadClick }: DocumentChecklistProps) {
  if (!items || items.length === 0) {
    return (
      <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-500 text-center">
        No specific documents required for this scheme.
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {items.map((item, idx) => {
        const isMatched = item.status === 'MATCHED';
        const isExpiring = item.status === 'EXPIRING';
        const isMissing = item.status === 'MISSING';
        const isNeedsReview = item.status === 'NEEDS_REVIEW';

        return (
          <div
            key={idx}
            className={`p-3.5 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-all ${
              isMatched
                ? 'bg-emerald-50/50 border-emerald-200 text-emerald-950'
                : isExpiring
                ? 'bg-amber-50/50 border-amber-200 text-amber-950'
                : 'bg-red-50/50 border-red-200 text-red-950'
            }`}
          >
            <div className="flex items-start gap-3">
              <div className="shrink-0 mt-0.5">
                {isMatched && <CheckCircle2 className="w-5 h-5 text-emerald-600" />}
                {isExpiring && <AlertTriangle className="w-5 h-5 text-amber-600 animate-pulse" />}
                {isMissing && <XCircle className="w-5 h-5 text-red-600" />}
                {isNeedsReview && <Clock className="w-5 h-5 text-indigo-600" />}
              </div>

              <div className="space-y-0.5">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-bold text-sm text-slate-900">{item.required_document_type}</span>
                  <Badge variant={item.is_mandatory ? 'primary' : 'outline'} className="text-[10px] py-0 px-2">
                    {item.is_mandatory ? 'Mandatory' : 'Optional'}
                  </Badge>
                  <span className="text-[11px] font-semibold tracking-wide">
                    {isMatched && '✓ Completed'}
                    {isExpiring && '⚠ Expired / Expiring Soon'}
                    {isMissing && '✗ Missing Document'}
                    {isNeedsReview && '● Under Review'}
                  </span>
                </div>
                {item.description && (
                  <p className="text-xs text-slate-600">{item.description}</p>
                )}
                {item.user_document && (
                  <p className="text-[11px] text-slate-500 flex items-center gap-1">
                    <FileText className="w-3 h-3 text-slate-400" />
                    <span>Uploaded: {item.user_document.file_name}</span>
                  </p>
                )}
              </div>
            </div>

            {(!isMatched || isExpiring) && onUploadClick && (
              <button
                type="button"
                onClick={() => onUploadClick(item.required_document_type)}
                className="shrink-0 px-3 py-1.5 rounded-lg bg-white border border-slate-300 text-xs font-bold text-slate-700 hover:bg-slate-50 hover:border-sathya-teal-600 transition-colors shadow-sm"
              >
                {isMissing ? 'Upload Document' : 'Replace / Renew'}
              </button>
            )}
          </div>
        );
      })}
    </div>
  );
}
