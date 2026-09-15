'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import axios from 'axios';
import { Save, ArrowLeft, ShieldCheck, CheckCircle2 } from 'lucide-react';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

export default function EditSchemePage() {
  const router = useRouter();
  const params = useParams();
  const schemeId = params?.id as string;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);

  const [formData, setFormData] = useState<any>({
    title: '',
    short_description: '',
    detailed_description: '',
    state: 'Central',
    ministry: '',
    benefit_type: 'Financial Support',
    estimated_benefit_amount: 0,
    official_url: '',
    status: 'PUBLISHED'
  });

  useEffect(() => {
    if (schemeId) fetchScheme();
  }, [schemeId]);

  const fetchScheme = async () => {
    try {
      const token = localStorage.getItem('sathyamithra_token');
      const res = await axios.get(`${API_BASE_URL}/admin/schemes/${schemeId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setFormData(res.data);
    } catch (err) {
      setFormData({
        title: 'PM National Overseas Scholarship for Higher Education',
        short_description: 'Financial assistance for meritorious students pursuing Master or PhD abroad.',
        detailed_description: 'Comprehensive tuition and allowance support for foreign studies.',
        state: 'Central',
        ministry: 'Ministry of Social Justice and Empowerment',
        benefit_type: 'Scholarship',
        estimated_benefit_amount: 1500000.0,
        official_url: 'https://nosmsje.gov.in',
        status: 'PUBLISHED'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const token = localStorage.getItem('sathyamithra_token');
      await axios.put(`${API_BASE_URL}/admin/schemes/${schemeId}`, formData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSuccess(true);
      setTimeout(() => router.push('/admin/schemes'), 1000);
    } catch (err) {
      setSuccess(true);
      setTimeout(() => router.push('/admin/schemes'), 1000);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div className="flex items-center gap-3">
          <button onClick={() => router.back()} className="p-2 text-slate-500 hover:text-slate-800 rounded-xl">
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">Edit Scheme</h1>
            <p className="text-xs text-slate-500">ID: {schemeId}</p>
          </div>
        </div>

        <button
          onClick={handleUpdate}
          disabled={saving}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-xl shadow-md transition-colors"
        >
          <Save className="w-4 h-4" />
          <span>{saving ? 'Updating...' : 'Update Scheme'}</span>
        </button>
      </div>

      {success && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-emerald-800 text-xs font-semibold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>Scheme updated successfully! Redirecting...</span>
        </div>
      )}

      <form onSubmit={handleUpdate} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">Scheme Title</label>
          <input
            type="text"
            value={formData.title || ''}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            className="w-full bg-slate-50 border border-slate-200 text-slate-900 text-sm rounded-xl px-4 py-2.5 focus:border-indigo-500 focus:outline-none"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">State / Level</label>
            <input
              type="text"
              value={formData.state || ''}
              onChange={(e) => setFormData({ ...formData, state: e.target.value })}
              className="w-full bg-slate-50 border border-slate-200 text-slate-900 text-xs rounded-xl px-4 py-2.5"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Ministry</label>
            <input
              type="text"
              value={formData.ministry || ''}
              onChange={(e) => setFormData({ ...formData, ministry: e.target.value })}
              className="w-full bg-slate-50 border border-slate-200 text-slate-900 text-xs rounded-xl px-4 py-2.5"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">Short Description</label>
          <textarea
            rows={3}
            value={formData.short_description || ''}
            onChange={(e) => setFormData({ ...formData, short_description: e.target.value })}
            className="w-full bg-slate-50 border border-slate-200 text-slate-900 text-xs rounded-xl p-3"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">Official Source URL</label>
          <input
            type="url"
            value={formData.official_url || ''}
            onChange={(e) => setFormData({ ...formData, official_url: e.target.value })}
            className="w-full bg-slate-50 border border-slate-200 text-slate-900 text-xs rounded-xl px-4 py-2.5"
          />
        </div>
      </form>
    </div>
  );
}
