'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { ShieldCheck, Lock, Mail, ArrowRight, KeyRound, AlertCircle } from 'lucide-react';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await axios.post(`${API_BASE_URL}/auth/login`, { email, password });
      const data = res.data;
      localStorage.setItem('sathyamithra_token', data.access_token);
      localStorage.setItem('sathyamithra_user', JSON.stringify({
        id: data.user_id,
        full_name: data.full_name,
        email: data.email,
        role: data.role
      }));

      if (['ADMIN', 'CONTENT_EDITOR', 'COMMUNITY_MODERATOR', 'SUPPORT_AGENT'].includes(data.role)) {
        router.push('/admin/dashboard');
      } else {
        setError("Access Denied: Regular user accounts are not authorized for Admin Control Center.");
      }
    } catch (err: any) {
      setError(err.response?.data?.detail || "Authentication failed. Please check credentials.");
    } finally {
      setLoading(false);
    }
  };

  const fillDemo = (demoEmail: string, demoPass: string) => {
    setEmail(demoEmail);
    setPassword(demoPass);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 px-4">
      <div className="max-w-md w-full space-y-8 bg-slate-900 p-8 rounded-2xl border border-slate-800 shadow-2xl">
        
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-indigo-600/20 text-indigo-400 border border-indigo-500/30 mb-2">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Admin Control Center</h1>
          <p className="text-xs text-slate-400">Sathyamithra Civic-Tech Platform Administration</p>
        </div>

        {error && (
          <div className="p-3.5 bg-rose-950/50 border border-rose-800/80 rounded-xl text-rose-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">Admin Email</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@sathyamithra.gov.in"
                className="w-full bg-slate-950 border border-slate-800 text-slate-200 text-sm rounded-xl pl-9 pr-4 py-2.5 focus:border-indigo-500 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full bg-slate-950 border border-slate-800 text-slate-200 text-sm rounded-xl pl-9 pr-4 py-2.5 focus:border-indigo-500 focus:outline-none"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold py-2.5 rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/20 transition-colors disabled:opacity-50"
          >
            <span>{loading ? 'Authenticating...' : 'Sign In to Admin Center'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        {/* Demo Account Fillers */}
        <div className="pt-4 border-t border-slate-800 space-y-2">
          <span className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider text-center">Development Seed Accounts</span>
          <div className="grid grid-cols-3 gap-2 text-xs">
            <button
              onClick={() => fillDemo('admin@sathyamithra.gov.in', 'Admin@12345')}
              className="px-2.5 py-2 bg-slate-800/60 hover:bg-indigo-950/60 border border-slate-700/60 hover:border-indigo-500/50 text-slate-300 hover:text-indigo-300 rounded-lg font-medium text-center transition-all"
            >
              Admin
            </button>
            <button
              onClick={() => fillDemo('editor@sathyamithra.gov.in', 'Editor@12345')}
              className="px-2.5 py-2 bg-slate-800/60 hover:bg-indigo-950/60 border border-slate-700/60 hover:border-indigo-500/50 text-slate-300 hover:text-indigo-300 rounded-lg font-medium text-center transition-all"
            >
              Editor
            </button>
            <button
              onClick={() => fillDemo('moderator@sathyamithra.gov.in', 'Moderator@12345')}
              className="px-2.5 py-2 bg-slate-800/60 hover:bg-indigo-950/60 border border-slate-700/60 hover:border-indigo-500/50 text-slate-300 hover:text-indigo-300 rounded-lg font-medium text-center transition-all"
            >
              Moderator
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
