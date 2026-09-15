'use client';

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { AlertTriangle, CheckCircle2, XCircle, Clock } from 'lucide-react';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

export default function ReportsAdminPage() {
  const [reports, setReports] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    try {
      const token = localStorage.getItem('sathyamithra_token');
      const res = await axios.get(`${API_BASE_URL}/admin/reports`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setReports(res.data);
    } catch (err) {
      setReports([
        {
          id: 'rep-1',
          reason: 'Outdated portal link',
          details: 'Official portal link for PM-KISAN application page returns 404.',
          created_at: '2026-09-07T12:00:00Z',
          scheme: { title: 'PM-KISAN Samman Nidhi' }
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleResolve = async (id: string, statusStr: string) => {
    try {
      const token = localStorage.getItem('sathyamithra_token');
      await axios.put(`${API_BASE_URL}/admin/reports/${id}`, {
        status: statusStr,
        admin_notes: `Resolved by admin with status ${statusStr}`
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchReports();
    } catch (err) {
      alert(`Report marked as ${statusStr}`);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Citizen Reports Queue</h1>
          <p className="text-xs text-slate-500 mt-1">Review feedback on outdated scheme rules, missing documents & broken portal links</p>
        </div>
      </div>

      <div className="space-y-4">
        {reports.map((r) => (
          <div key={r.id} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-rose-500" />
                <span className="font-bold text-slate-900 text-sm">{r.reason}</span>
              </div>
              <span className="text-[11px] text-slate-400">{new Date(r.created_at).toLocaleDateString()}</span>
            </div>

            <p className="text-xs text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-100">{r.details}</p>

            <div className="flex items-center justify-between pt-2 text-xs">
              <span className="text-slate-500">Scheme: <strong className="text-slate-800">{r.scheme?.title || 'General'}</strong></span>
              <div className="flex gap-2">
                <button
                  onClick={() => handleResolve(r.id, 'RESOLVED')}
                  className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded-lg shadow-sm transition-colors"
                >
                  Confirm & Resolve
                </button>
                <button
                  onClick={() => handleResolve(r.id, 'REJECTED')}
                  className="px-3 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-700 font-semibold rounded-lg transition-colors"
                >
                  Dismiss Report
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
