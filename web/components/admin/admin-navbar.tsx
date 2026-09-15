'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Search, Bell, Shield, ExternalLink, User as UserIcon } from 'lucide-react';

export function AdminNavbar() {
  const [userRole, setUserRole] = useState<string>('ADMIN');
  const [userName, setUserName] = useState<string>('System Admin');

  useEffect(() => {
    try {
      const rawUser = localStorage.getItem('sathyamithra_user');
      if (rawUser) {
        const u = JSON.parse(rawUser);
        setUserRole(u.role || 'ADMIN');
        setUserName(u.full_name || u.email || 'Administrator');
      }
    } catch (e) {
      // fallback
    }
  }, []);

  return (
    <header className="h-16 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-white/10 px-6 flex items-center justify-between sticky top-0 z-30">
      {/* Quick Search */}
      <div className="flex items-center gap-3 w-96">
        <div className="relative w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search schemes, users, reports, audit logs (Ctrl+K)..."
            className="w-full pl-9 pr-4 py-1.5 bg-slate-100 text-slate-800 text-xs rounded-lg border border-transparent focus:bg-white focus:border-indigo-500 focus:outline-none transition-all"
          />
        </div>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-4">
        {/* Preview Citizen View Button */}
        <Link
          href="/"
          target="_blank"
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-indigo-700 bg-indigo-50 border border-indigo-200 rounded-lg hover:bg-indigo-100 transition-colors"
        >
          <ExternalLink className="w-3.5 h-3.5" />
          <span>Citizen Portal</span>
        </Link>

        {/* Notifications */}
        <button className="p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors relative">
          <Bell className="w-4 h-4" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-amber-500 rounded-full"></span>
        </button>

        <div className="h-6 w-px bg-slate-200"></div>

        {/* User Profile Badge */}
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full bg-slate-800 text-white font-bold text-xs flex items-center justify-center">
            {userName.substring(0, 2).toUpperCase()}
          </div>
          <div>
            <span className="block text-xs font-semibold text-slate-800">{userName}</span>
            <span className="inline-block px-1.5 py-0.5 text-[10px] font-bold text-indigo-700 bg-indigo-50 border border-indigo-100 rounded">
              {userRole}
            </span>
          </div>
        </div>
      </div>
    </header>
  );
}
