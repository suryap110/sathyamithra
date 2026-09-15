'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { 
  LayoutDashboard, 
  FileText, 
  ShieldCheck, 
  Clock, 
  Link2, 
  Users, 
  MessageSquare, 
  BarChart3, 
  Bot, 
  History, 
  Activity, 
  Settings, 
  Flag, 
  LogOut, 
  Sparkles,
  AlertTriangle
} from 'lucide-react';

const navItems = [
  { name: 'Dashboard', href: '/admin/dashboard', icon: LayoutDashboard },
  { name: 'Schemes', href: '/admin/schemes', icon: FileText },
  { name: 'Freshness', href: '/admin/freshness', icon: Clock },
  { name: 'Source Health', href: '/admin/sources', icon: Link2 },
  { name: 'Citizen Reports', href: '/admin/reports', icon: AlertTriangle },
  { name: 'Users', href: '/admin/users', icon: Users },
  { name: 'Community', href: '/admin/community', icon: MessageSquare },
  { name: 'Analytics', href: '/admin/analytics', icon: BarChart3 },
  { name: 'AI Monitoring', href: '/admin/ai-monitoring', icon: Bot },
  { name: 'Audit Logs', href: '/admin/audit-logs', icon: History },
  { name: 'System Health', href: '/admin/system-health', icon: Activity },
  { name: 'Settings', href: '/admin/settings', icon: Settings },
];

export function AdminSidebar() {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = () => {
    localStorage.removeItem('sathyamithra_token');
    localStorage.removeItem('sathyamithra_user');
    router.push('/admin/login');
  };

  return (
    <aside className="w-64 bg-slate-900/80 backdrop-blur-md text-slate-300 min-h-screen flex flex-col border-r border-slate-800/80">
      {/* Brand Header */}
      <div className="p-4 border-b border-slate-800 flex items-center justify-between">
        <Link href="/admin/dashboard" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full overflow-hidden border border-emerald-400/40 bg-white p-0.5 shadow-sm shrink-0">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/logo-square.png" alt="Sathyamithra" className="w-full h-full object-cover rounded-full" />
          </div>
          <div>
            <span className="font-bold text-white tracking-wide text-base">Sathyamithra</span>
            <span className="block text-[10px] text-indigo-400 uppercase tracking-widest font-semibold">Admin Center</span>
          </div>
        </Link>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const isActive = pathname === item.href || (item.href !== '/admin/dashboard' && pathname.startsWith(item.href));
          const Icon = item.icon;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                isActive 
                  ? 'bg-indigo-600 text-white shadow-md' 
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <Icon className="w-4 h-4 shrink-0" />
              <span>{item.name}</span>
            </Link>
          );
        })}
      </nav>

      {/* User Footer */}
      <div className="p-3 border-t border-slate-800">
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-rose-400 hover:bg-rose-950/40 transition-colors"
        >
          <LogOut className="w-4 h-4" />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
}
