import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ShieldCheck, CheckCircle2, XCircle, AlertTriangle, Info, X } from 'lucide-react';

interface Reason {
  criterion: string;
  matched: boolean;
  details: string;
}

interface ExplainabilityModalProps {
  schemeTitle: string;
  matchScore: number;
  confidence: string;
  reasons: Reason[];
  warnings: string[];
  onClose: () => void;
}

export function ExplainabilityModal({
  schemeTitle,
  matchScore,
  confidence,
  reasons,
  warnings,
  onClose,
}: ExplainabilityModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <Card className="w-full max-w-xl bg-white p-6 rounded-2xl shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto border border-slate-200">
        
        {/* Header */}
        <div className="flex items-start justify-between gap-4 border-b border-slate-100 pb-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-sathya-teal-700 bg-sathya-teal-50 px-2.5 py-1 rounded-md border border-sathya-teal-100">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>AI Recommendation Explainability</span>
            </div>
            <h3 className="text-lg font-bold text-sathya-indigo-900 leading-snug">
              Why am I seeing this scheme?
            </h3>
            <p className="text-xs text-slate-500 font-medium">{schemeTitle}</p>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Score & Confidence Summary */}
        <div className="p-4 rounded-xl bg-gradient-to-r from-sathya-indigo-900 to-sathya-teal-800 text-white flex items-center justify-between">
          <div>
            <span className="text-[11px] text-slate-300 uppercase tracking-wider block">Estimated Match Score</span>
            <div className="text-3xl font-extrabold text-sathya-saffron-500">{matchScore}%</div>
          </div>
          <div className="text-right">
            <span className="text-[11px] text-slate-300 uppercase tracking-wider block">Confidence Level</span>
            <Badge variant="success" className="mt-1 text-xs">
              {confidence} Confidence
            </Badge>
          </div>
        </div>

        {/* Matched vs Unmatched Breakdown */}
        <div className="space-y-3">
          <h4 className="text-xs font-bold text-sathya-indigo-900 uppercase tracking-wider">
            Detailed Eligibility Breakdown
          </h4>

          <div className="space-y-2">
            {reasons.map((r, i) => (
              <div
                key={i}
                className={`p-3 rounded-lg border text-xs flex items-start gap-3 ${
                  r.matched
                    ? 'bg-emerald-50/60 border-emerald-200 text-emerald-900'
                    : 'bg-rose-50/60 border-rose-200 text-rose-900'
                }`}
              >
                {r.matched ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                ) : (
                  <XCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                )}
                <div>
                  <h5 className="font-bold">{r.criterion}</h5>
                  <p className="mt-0.5 opacity-90 leading-relaxed">{r.details}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Required Document / Verification Warnings */}
        {warnings && warnings.length > 0 && (
          <div className="space-y-2 pt-2 border-t border-slate-100">
            <h4 className="text-xs font-bold text-amber-800 uppercase tracking-wider flex items-center gap-1.5">
              <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
              <span>Verification Requirements</span>
            </h4>
            {warnings.map((w, i) => (
              <div key={i} className="p-2.5 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-800 flex items-center gap-2">
                <Info className="w-3.5 h-3.5 shrink-0 text-amber-600" />
                <span>{w}</span>
              </div>
            ))}
          </div>
        )}

        {/* Footer Disclaimer */}
        <div className="pt-4 border-t border-slate-100 flex items-center justify-between gap-4">
          <p className="text-[11px] text-slate-400 leading-tight">
            Initial assessment calculated via Sathyamithra rules engine. Official approval is subject to document verification by government authorities.
          </p>
          <Button variant="primary" size="sm" onClick={onClose} className="shrink-0">
            Got it
          </Button>
        </div>
      </Card>
    </div>
  );
}
