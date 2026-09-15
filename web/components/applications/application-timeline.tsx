'use client';

import React from 'react';
import { CheckCircle2, Clock, Circle, AlertCircle, Check, DollarSign } from 'lucide-react';

interface ApplicationTimelineProps {
  currentStatus: string;
  statusHistory?: Array<{
    new_status: string;
    note?: string;
    created_at: string;
    changed_by?: string;
  }>;
}

const MILESTONES = [
  { key: 'DRAFT', label: 'Draft Created' },
  { key: 'DOCUMENTS_PENDING', label: 'Documents Pending' },
  { key: 'READY_TO_SUBMIT', label: 'Ready to Submit' },
  { key: 'SUBMITTED', label: 'Submitted to Portal' },
  { key: 'UNDER_REVIEW', label: 'Department Review' },
  { key: 'APPROVED', label: 'Approval Granted' },
  { key: 'DISBURSED', label: 'Benefit Disbursed' }
];

export function ApplicationTimeline({ currentStatus, statusHistory = [] }: ApplicationTimelineProps) {
  const currentUpper = currentStatus ? currentStatus.toUpperCase().trim() : 'DRAFT';
  
  // Find index of current status milestone
  const currentIdx = MILESTONES.findIndex((m) => m.key === currentUpper);
  const activeIndex = currentIdx >= 0 ? currentIdx : 0;
  const isRejected = currentUpper === 'REJECTED';

  return (
    <div className="space-y-6">
      {/* Desktop Horizontal Milestone Bar */}
      <div className="hidden md:block bg-slate-50 p-6 rounded-2xl border border-slate-200">
        <div className="flex items-center justify-between relative">
          
          {/* Connector Line */}
          <div className="absolute top-4 left-6 right-6 h-1 bg-slate-200 -z-0">
            <div
              className="h-1 bg-sathya-teal-600 transition-all duration-500"
              style={{ width: `${(activeIndex / (MILESTONES.length - 1)) * 100}%` }}
            ></div>
          </div>

          {MILESTONES.map((m, idx) => {
            const isCompleted = idx < activeIndex;
            const isCurrent = idx === activeIndex;
            const isUpcoming = idx > activeIndex;

            return (
              <div key={m.key} className="flex flex-col items-center space-y-2 z-10 w-24 text-center">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs transition-all shadow-sm ${
                    isCompleted
                      ? 'bg-sathya-teal-600 text-white ring-4 ring-sathya-teal-50'
                      : isCurrent
                      ? isRejected
                        ? 'bg-red-600 text-white ring-4 ring-red-100 animate-pulse'
                        : 'bg-sathya-indigo-900 text-white ring-4 ring-sathya-indigo-100 animate-bounce'
                      : 'bg-white text-slate-400 border border-slate-300'
                  }`}
                  aria-label={`${m.label}: ${isCompleted ? 'Completed' : isCurrent ? 'Current' : 'Upcoming'}`}
                >
                  {isCompleted ? (
                    <Check className="w-4 h-4" />
                  ) : isCurrent ? (
                    isRejected ? <AlertCircle className="w-4 h-4" /> : <Clock className="w-4 h-4" />
                  ) : (
                    <span>{idx + 1}</span>
                  )}
                </div>

                <div className="space-y-0.5">
                  <span className={`text-[11px] font-extrabold block ${isCurrent ? 'text-sathya-indigo-900' : isCompleted ? 'text-sathya-teal-800' : 'text-slate-400'}`}>
                    {m.label}
                  </span>
                  <span className="text-[10px] text-slate-400 font-semibold block">
                    {isCompleted && '✓ Completed'}
                    {isCurrent && (isRejected ? '✗ Rejected' : '● Current')}
                    {isUpcoming && '○ Upcoming'}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Vertical Status History Audit Timeline */}
      {statusHistory.length > 0 && (
        <div className="space-y-3 pt-2">
          <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
            Status Activity History
          </h4>
          <div className="border-l-2 border-slate-200 pl-4 space-y-4">
            {statusHistory.map((h, i) => (
              <div key={i} className="relative space-y-1">
                <div className="absolute -left-[21px] top-1 w-2.5 h-2.5 rounded-full bg-sathya-teal-600 ring-4 ring-white"></div>
                <div className="flex items-center justify-between text-xs font-semibold">
                  <span className="text-sathya-indigo-900 font-bold">{h.new_status.replace(/_/g, ' ')}</span>
                  <span className="text-slate-400 text-[11px]">
                    {new Date(h.created_at).toLocaleDateString()} {new Date(h.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                {h.note && <p className="text-xs text-slate-600 bg-slate-50 p-2 rounded-lg border border-slate-100">{h.note}</p>}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
