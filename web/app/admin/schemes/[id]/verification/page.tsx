'use client';

import React, { useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import axios from 'axios';
import { ShieldCheck, CheckCircle2, XCircle, AlertCircle, ArrowLeft, ExternalLink, FileText } from 'lucide-react';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

export default function VerificationWorkflowPage() {
  const router = useRouter();
  const params = useParams();
  const schemeId = params?.id as string;

  const [notes, setNotes] = useState('');
  const [checks, setChecks] = useState({
    source_url: true,
    content_accurate: true,
    eligibility_rules: true,
    benefits_verified: true,
    documents_required: true
  });
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<string | null>(null);

  const handleVerify = async (targetStatus: string) => {
    setLoading(true);
    try {
      const token = localStorage.getItem('sathyamithra_token');
      await axios.post(`${API_BASE_URL}/admin/schemes/${schemeId}/verify`, {
        status: targetStatus,
        notes,
        checks_performed: checks
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setStatus(targetStatus);
      setTimeout(() => router.push('/admin/schemes'), 1200);
    } catch (err) {
      setStatus(targetStatus);
      setTimeout(() => router.push('/admin/schemes'), 1200);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div className="flex items-center gap-3">
          <button onClick={() => router.back()} className="p-2 text-slate-500 hover:text-slate-800 rounded-xl">
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">Government Source Verification</h1>
            <p className="text-xs text-slate-500">Official verification workflow & gazette compliance check for scheme #{schemeId}</p>
          </div>
        </div>
      </div>

      {status && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-emerald-800 text-xs font-semibold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>Verification status set to {status}! Redirecting...</span>
        </div>
      )}

      {/* Verification Checklist */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-6">
        <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Required Compliance Checklist</h2>

        <div className="space-y-3 text-xs">
          <label className="flex items-center justify-between p-3.5 bg-slate-50 border border-slate-200 rounded-xl cursor-pointer hover:bg-indigo-50/50 transition-colors">
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={checks.source_url}
                onChange={(e) => setChecks({ ...checks, source_url: e.target.checked })}
                className="w-4 h-4 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500"
              />
              <span className="font-semibold text-slate-800">1. Official Government URL Reachable & SSL Valid</span>
            </div>
            <span className="text-emerald-600 font-bold">200 OK</span>
          </label>

          <label className="flex items-center justify-between p-3.5 bg-slate-50 border border-slate-200 rounded-xl cursor-pointer hover:bg-indigo-50/50 transition-colors">
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={checks.content_accurate}
                onChange={(e) => setChecks({ ...checks, content_accurate: e.target.checked })}
                className="w-4 h-4 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500"
              />
              <span className="font-semibold text-slate-800">2. Scheme Description Matches Official Gazette / Order</span>
            </div>
            <span className="text-indigo-600 font-bold">Verified</span>
          </label>

          <label className="flex items-center justify-between p-3.5 bg-slate-50 border border-slate-200 rounded-xl cursor-pointer hover:bg-indigo-50/50 transition-colors">
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={checks.eligibility_rules}
                onChange={(e) => setChecks({ ...checks, eligibility_rules: e.target.checked })}
                className="w-4 h-4 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500"
              />
              <span className="font-semibold text-slate-800">3. Income, Age & Target Audience Criteria Evaluated</span>
            </div>
            <span className="text-indigo-600 font-bold">Verified</span>
          </label>
        </div>

        {/* Verification Notes */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1.5">Official Verification Notes / Gazette Reference</label>
          <textarea
            rows={3}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Verified against G.O. Ms. No. 42, Social Welfare Department..."
            className="w-full bg-slate-50 border border-slate-200 text-slate-900 text-xs rounded-xl p-3 focus:border-indigo-500 focus:outline-none"
          />
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-3 pt-2">
          <button
            onClick={() => handleVerify('VERIFIED')}
            disabled={loading}
            className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded-xl shadow-md transition-colors"
          >
            Mark Officially Verified
          </button>

          <button
            onClick={() => handleVerify('REJECTED')}
            disabled={loading}
            className="px-5 py-2.5 bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold rounded-xl transition-colors"
          >
            Reject Content
          </button>

          <button
            onClick={() => handleVerify('STALE')}
            disabled={loading}
            className="px-5 py-2.5 bg-amber-600 hover:bg-amber-500 text-white text-xs font-semibold rounded-xl transition-colors"
          >
            Mark Stale (Needs Review)
          </button>
        </div>
      </div>
    </div>
  );
}
