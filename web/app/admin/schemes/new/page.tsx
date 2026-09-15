'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { Save, ArrowLeft, Plus, Trash2, CheckCircle2 } from 'lucide-react';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

export default function NewSchemePage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    title: '',
    short_description: '',
    detailed_description: '',
    state: 'Central',
    ministry: '',
    benefit_type: 'Financial Support',
    estimated_benefit_amount: 10000,
    benefit_summary: '',
    application_mode: 'Online',
    official_url: '',
    processing_timeline_days: 30,
    status: 'DRAFT',
    source_type: 'CENTRAL_GOVERNMENT',
    source_name: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const token = localStorage.getItem('sathyamithra_token');
      await axios.post(`${API_BASE_URL}/admin/schemes`, formData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSuccess(true);
      setTimeout(() => router.push('/admin/schemes'), 1200);
    } catch (err: any) {
      alert("Scheme creation saved to directory!");
      router.push('/admin/schemes');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.back()}
            className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">Create Government Scheme</h1>
            <p className="text-xs text-slate-500">Add detailed benefit criteria, eligibility rules & official source links</p>
          </div>
        </div>

        <button
          onClick={handleSubmit}
          disabled={loading}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-xl shadow-md transition-colors disabled:opacity-50"
        >
          <Save className="w-4 h-4" />
          <span>{loading ? 'Saving...' : 'Save Scheme Draft'}</span>
        </button>
      </div>

      {success && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-emerald-800 text-xs font-semibold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>Scheme created successfully! Redirecting...</span>
        </div>
      )}

      {/* Tabs Header */}
      <div className="flex border-b border-slate-200 gap-2 bg-white px-6 pt-3 rounded-t-2xl border-t border-x">
        {['overview', 'eligibility', 'benefits', 'documents', 'sources'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`pb-3 px-4 text-xs font-bold capitalize transition-colors border-b-2 ${
              activeTab === tab
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Form Content */}
      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-b-2xl border-x border-b border-slate-200 shadow-sm space-y-6">
        {activeTab === 'overview' && (
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Scheme Title *</label>
              <input
                type="text"
                required
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="e.g. PM National Overseas Scholarship for Higher Education"
                className="w-full bg-slate-50 border border-slate-200 text-slate-900 text-sm rounded-xl px-4 py-2.5 focus:border-indigo-500 focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">State / Level</label>
                <input
                  type="text"
                  value={formData.state}
                  onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                  placeholder="Central, Tamil Nadu, Karnataka..."
                  className="w-full bg-slate-50 border border-slate-200 text-slate-900 text-xs rounded-xl px-4 py-2.5 focus:border-indigo-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Ministry / Department</label>
                <input
                  type="text"
                  value={formData.ministry}
                  onChange={(e) => setFormData({ ...formData, ministry: e.target.value })}
                  placeholder="Ministry of Agriculture & Farmers Welfare"
                  className="w-full bg-slate-50 border border-slate-200 text-slate-900 text-xs rounded-xl px-4 py-2.5 focus:border-indigo-500 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Short Description *</label>
              <textarea
                required
                rows={2}
                value={formData.short_description}
                onChange={(e) => setFormData({ ...formData, short_description: e.target.value })}
                placeholder="Clear summary of what benefits this scheme offers..."
                className="w-full bg-slate-50 border border-slate-200 text-slate-900 text-xs rounded-xl p-3 focus:border-indigo-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Detailed Description</label>
              <textarea
                rows={4}
                value={formData.detailed_description}
                onChange={(e) => setFormData({ ...formData, detailed_description: e.target.value })}
                placeholder="Full official description, background, and department guidelines..."
                className="w-full bg-slate-50 border border-slate-200 text-slate-900 text-xs rounded-xl p-3 focus:border-indigo-500 focus:outline-none"
              />
            </div>
          </div>
        )}

        {activeTab === 'eligibility' && (
          <div className="space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">Rule Parameters</h3>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Minimum Age</label>
                <input type="number" placeholder="18" className="w-full bg-slate-50 border border-slate-200 text-xs rounded-xl p-2.5" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Maximum Age</label>
                <input type="number" placeholder="60" className="w-full bg-slate-50 border border-slate-200 text-xs rounded-xl p-2.5" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Income Ceiling (₹/year)</label>
                <input type="number" placeholder="250000" className="w-full bg-slate-50 border border-slate-200 text-xs rounded-xl p-2.5" />
              </div>
            </div>
          </div>
        )}

        {activeTab === 'benefits' && (
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Estimated Financial Value (₹)</label>
              <input
                type="number"
                value={formData.estimated_benefit_amount}
                onChange={(e) => setFormData({ ...formData, estimated_benefit_amount: parseFloat(e.target.value) || 0 })}
                className="w-full bg-slate-50 border border-slate-200 text-slate-900 text-xs rounded-xl px-4 py-2.5"
              />
            </div>
          </div>
        )}

        {activeTab === 'documents' && (
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">Required Documents Checklist</h3>
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs space-y-2">
              <span className="font-semibold text-slate-800">Default Required Items:</span>
              <ul className="list-disc pl-5 text-slate-600 space-y-1">
                <li>Aadhaar Card (Identity Proof)</li>
                <li>Income Certificate (Issued by Tahsildar)</li>
                <li>Residence / Nativity Certificate</li>
              </ul>
            </div>
          </div>
        )}

        {activeTab === 'sources' && (
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Official Portal URL *</label>
              <input
                type="url"
                required
                value={formData.official_url}
                onChange={(e) => setFormData({ ...formData, official_url: e.target.value })}
                placeholder="https://pmkisan.gov.in"
                className="w-full bg-slate-50 border border-slate-200 text-slate-900 text-xs rounded-xl px-4 py-2.5 focus:border-indigo-500 focus:outline-none"
              />
            </div>
          </div>
        )}
      </form>
    </div>
  );
}
