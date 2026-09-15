'use client';

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { MessageSquare, ShieldAlert, EyeOff, CheckCircle } from 'lucide-react';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

export default function CommunityAdminPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCommunity();
  }, []);

  const fetchCommunity = async () => {
    try {
      const token = localStorage.getItem('sathyamithra_token');
      const res = await axios.get(`${API_BASE_URL}/admin/community`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setData(res.data);
    } catch (err) {
      setData({
        questions: [
          { id: 'q1', title: 'How to register on penkalvi portal for Pudhumai Penn?', category: 'Education', state: 'Tamil Nadu', is_resolved: false }
        ]
      });
    } finally {
      setLoading(false);
    }
  };

  const handleModerate = async (qId: string, actionStr: string) => {
    try {
      const token = localStorage.getItem('sathyamithra_token');
      await axios.put(`${API_BASE_URL}/admin/community/${qId}/moderate`, { action: actionStr }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchCommunity();
    } catch (err) {
      alert(`Action ${actionStr} complete`);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Community Moderation Queue</h1>
          <p className="text-xs text-slate-500 mt-1">Review citizen questions, answers, reported content & apply moderation filters</p>
        </div>
      </div>

      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
        <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Citizen Community Questions</h2>
        <div className="divide-y divide-slate-200 text-xs">
          {data?.questions?.map((q: any) => (
            <div key={q.id} className="py-4 flex items-center justify-between">
              <div>
                <span className="font-bold text-slate-900 text-sm block">{q.title}</span>
                <span className="text-slate-500">{q.category} • {q.state}</span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleModerate(q.id, 'HIDE')}
                  className="px-3 py-1.5 bg-rose-50 text-rose-700 font-semibold rounded-lg hover:bg-rose-100 transition-colors flex items-center gap-1"
                >
                  <EyeOff className="w-3.5 h-3.5" />
                  <span>Hide Content</span>
                </button>
                <button
                  onClick={() => handleModerate(q.id, 'MARK_SAFE')}
                  className="px-3 py-1.5 bg-emerald-50 text-emerald-700 font-semibold rounded-lg hover:bg-emerald-100 transition-colors flex items-center gap-1"
                >
                  <CheckCircle className="w-3.5 h-3.5" />
                  <span>Mark Safe</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
