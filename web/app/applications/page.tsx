'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import { useAuth } from '@/lib/auth-context';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Clock, 
  FileText, 
  CheckCircle2, 
  AlertCircle, 
  TrendingUp, 
  ArrowRight,
  Sparkles,
  Plus,
  ShieldCheck
} from 'lucide-react';

export default function ApplicationsPage() {
  const { user } = useAuth();
  const [statusFilter, setStatusFilter] = useState('All');

  const { data: dashboardData, isLoading } = useQuery({
    queryKey: ['user-applications'],
    queryFn: async () => {
      const res = await apiClient.get('/applications');
      return res.data;
    },
    enabled: !!user,
  });

  const applications = dashboardData?.applications || [];

  const filteredApps = applications.filter((app: any) => {
    if (statusFilter === 'All') return true;
    if (statusFilter === 'Active') return ['DOCUMENTS_PENDING', 'READY_TO_SUBMIT', 'SUBMITTED', 'UNDER_REVIEW', 'ADDITIONAL_INFORMATION_REQUIRED'].includes(app.status);
    return app.status === statusFilter;
  });

  const getStatusBadge = (statusStr: string) => {
    switch (statusStr) {
      case 'APPROVED':
      case 'DISBURSED':
        return <Badge variant="primary" className="bg-emerald-600 text-white">✓ {statusStr.replace('_', ' ')}</Badge>;
      case 'UNDER_REVIEW':
      case 'SUBMITTED':
        return <Badge variant="secondary" className="bg-sathya-indigo-900 text-white">● {statusStr.replace('_', ' ')}</Badge>;
      case 'DOCUMENTS_PENDING':
      case 'ADDITIONAL_INFORMATION_REQUIRED':
        return <Badge variant="accent" className="bg-amber-500 text-white">⚠ {statusStr.replace('_', ' ')}</Badge>;
      case 'REJECTED':
        return <Badge variant="outline" className="bg-red-50 border-red-200 text-red-700">✗ REJECTED</Badge>;
      default:
        return <Badge variant="outline">{statusStr.replace('_', ' ')}</Badge>;
    }
  };

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-sathya-indigo-900 to-sathya-teal-800 p-8 rounded-2xl text-white shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-xs font-semibold text-sathya-saffron-500 backdrop-blur">
            <Clock className="w-3.5 h-3.5" />
            <span>Citizen Application Tracker</span>
          </div>
          <h1 className="text-3xl font-extrabold">My Scheme Applications</h1>
          <p className="text-sm text-slate-200">
            Track status updates, submission timelines, reference IDs, and departmental review milestones.
          </p>
        </div>

        <Link href="/schemes">
          <Button variant="accent" size="lg" className="gap-2 px-6 shadow-md shrink-0">
            <Plus className="w-5 h-5" />
            <span>Start New Application</span>
          </Button>
        </Link>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="p-6 space-y-2">
          <span className="text-xs text-slate-500 font-semibold uppercase tracking-wider">Total Applications</span>
          <div className="text-3xl font-extrabold text-sathya-indigo-900">{dashboardData?.total_applications || 0}</div>
        </Card>

        <Card className="p-6 space-y-2 border-sathya-teal-200 bg-sathya-teal-50/20">
          <span className="text-xs text-sathya-teal-800 font-semibold uppercase tracking-wider">Active Applications</span>
          <div className="text-3xl font-extrabold text-sathya-teal-900">{dashboardData?.active_applications || 0}</div>
        </Card>

        <Card className="p-6 space-y-2 border-amber-200 bg-amber-50/20">
          <span className="text-xs text-amber-800 font-semibold uppercase tracking-wider">Documents Pending</span>
          <div className="text-3xl font-extrabold text-amber-950">{dashboardData?.documents_pending || 0}</div>
        </Card>

        <Card className="p-6 space-y-2 border-emerald-200 bg-emerald-50/20">
          <span className="text-xs text-emerald-800 font-semibold uppercase tracking-wider">Approved & Disbursed</span>
          <div className="text-3xl font-extrabold text-emerald-950">{(dashboardData?.approved || 0) + (dashboardData?.disbursed || 0)}</div>
        </Card>
      </div>

      {/* Main Tracker Area */}
      <div className="space-y-6">
        
        {/* Filter Tabs */}
        <div className="flex items-center gap-2 border-b border-slate-200 pb-3 overflow-x-auto">
          {['All', 'Active', 'UNDER_REVIEW', 'DOCUMENTS_PENDING', 'APPROVED', 'REJECTED'].map((tab) => (
            <button
              key={tab}
              onClick={() => setStatusFilter(tab)}
              className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-colors ${
                statusFilter === tab
                  ? 'bg-sathya-indigo-900 text-white shadow-sm'
                  : 'bg-white text-slate-600 hover:bg-slate-100'
              }`}
            >
              {tab.replace(/_/g, ' ')}
            </button>
          ))}
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="space-y-4">
            {[1, 2].map((i) => (
              <div key={i} className="h-32 bg-slate-100 rounded-2xl animate-pulse"></div>
            ))}
          </div>
        )}

        {/* Empty Applications State */}
        {!isLoading && filteredApps.length === 0 && (
          <Card className="p-12 text-center space-y-4">
            <Clock className="w-12 h-12 text-slate-300 mx-auto" />
            <div className="space-y-1">
              <h3 className="text-base font-bold text-sathya-indigo-900">No applications found</h3>
              <p className="text-xs text-slate-500">Discover eligible government schemes and start tracking your applications.</p>
            </div>
            <Link href="/schemes">
              <Button variant="primary" size="md">Browse Schemes</Button>
            </Link>
          </Card>
        )}

        {/* Applications List */}
        {!isLoading && filteredApps.length > 0 && (
          <div className="space-y-4">
            {filteredApps.map((app: any) => (
              <Card key={app.id} className="p-6 hover:border-sathya-teal-500 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                <div className="space-y-2">
                  <div className="flex items-center gap-3 flex-wrap">
                    {getStatusBadge(app.status)}
                    <span className="text-xs font-mono font-bold text-slate-500 bg-slate-100 px-2.5 py-0.5 rounded">
                      Ref: {app.reference_number || 'SM-2026-PENDING'}
                    </span>
                  </div>

                  <h3 className="text-lg font-extrabold text-sathya-indigo-900">
                    {app.scheme?.title || 'Government Scheme Application'}
                  </h3>

                  <div className="flex items-center gap-4 text-xs text-slate-500 flex-wrap">
                    <span>Scope: <strong className="text-slate-700 font-semibold">{app.scheme?.state || 'Central'}</strong></span>
                    <span>Applied: <strong className="text-slate-700 font-semibold">{new Date(app.application_date).toLocaleDateString()}</strong></span>
                    <span>Last Updated: <strong className="text-slate-700 font-semibold">{new Date(app.last_updated).toLocaleDateString()}</strong></span>
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <Link href={`/applications/${app.id}`}>
                    <Button variant="outline" size="md" className="gap-2">
                      <span>View Timeline</span>
                      <ArrowRight className="w-4 h-4" />
                    </Button>
                  </Link>
                </div>
              </Card>
            ))}
          </div>
        )}

      </div>
    </div>
  );
}
