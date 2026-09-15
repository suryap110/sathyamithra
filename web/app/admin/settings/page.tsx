'use client';

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Settings, Flag, CheckCircle2, Shield } from 'lucide-react';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

export default function AdminSettingsPage() {
  const [flags, setFlags] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFlags();
  }, []);

  const fetchFlags = async () => {
    try {
      const token = localStorage.getItem('sathyamithra_token');
      const res = await axios.get(`${API_BASE_URL}/admin/feature-flags`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setFlags(res.data);
    } catch (err) {
      setFlags([
        { key: 'AI_ASSISTANT', enabled: true, name: 'Sathyamithra RAG AI Assistant' },
        { key: 'FAMILY_MODE', enabled: true, name: 'Family Member Scheme Eligibility' },
        { key: 'COMMUNITY', enabled: true, name: 'Citizen Community Q&A Forum' },
        { key: 'HYPERLOCAL_SUPPORT', enabled: true, name: 'Offline Service Center Locator' }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleFlag = async (key: string, currentVal: boolean) => {
    try {
      const token = localStorage.getItem('sathyamithra_token');
      await axios.put(`${API_BASE_URL}/admin/feature-flags`, { key, enabled: !currentVal }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchFlags();
    } catch (err) {
      setFlags(flags.map(f => f.key === key ? { ...f, enabled: !currentVal } : f));
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Platform Configuration & Feature Flags</h1>
          <p className="text-xs text-slate-500 mt-1">Control active platform capabilities, freshness thresholds & global AI safety rules</p>
        </div>
      </div>

      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-6">
        <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
          <Flag className="w-4 h-4 text-indigo-600" />
          <span>Active Production Feature Toggles</span>
        </h2>

        <div className="space-y-3 text-xs">
          {flags.map((f) => (
            <div key={f.key} className="p-4 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between">
              <div>
                <span className="font-bold text-slate-900 block text-sm">{f.name}</span>
                <span className="text-slate-500 font-mono text-[11px]">{f.key}</span>
              </div>

              <button
                onClick={() => handleToggleFlag(f.key, f.enabled)}
                className={`w-12 h-6 rounded-full p-1 transition-colors ${
                  f.enabled ? 'bg-indigo-600' : 'bg-slate-300'
                }`}
              >
                <div className={`w-4 h-4 rounded-full bg-white transition-transform ${
                  f.enabled ? 'translate-x-6' : 'translate-x-0'
                }`}></div>
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
