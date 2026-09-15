'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Calculator, ShieldAlert, ArrowLeft, CheckCircle, Info, Sparkles } from 'lucide-react';
import api from '@/lib/api-client';

export default function FamilyBenefitPlannerPage() {
  const [planner, setPlanner] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    fetchPlannerData();
  }, []);

  const fetchPlannerData = async () => {
    setLoading(true);
    try {
      const res = await api.get('/family/benefits');
      setPlanner(res.data);
    } catch (err) {
      console.error('Failed to fetch family benefit planner data', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-transparent text-slate-900 dark:text-slate-100 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto space-y-8">

        {/* Header Navigation */}
        <div className="flex items-center justify-between">
          <Link href="/family" className="inline-flex items-center gap-1 text-xs font-bold text-slate-600 dark:text-slate-400 hover:text-sathya-teal-600">
            <ArrowLeft className="w-4 h-4" /> Back to Family Dashboard
          </Link>
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Phase 6 • Household Benefit Overview</span>
        </div>

        {/* Planner Overview Header Card */}
        <div className="bg-gradient-to-r from-sathya-indigo-950/90 via-sathya-indigo-900/90 to-sathya-teal-900/90 backdrop-blur-md rounded-2xl p-8 text-white shadow-xl border border-white/10">
          <div className="flex items-center gap-3 mb-2">
            <Calculator className="w-7 h-7 text-sathya-saffron-400" />
            <h1 className="text-2xl font-black tracking-tight">FAMILY BENEFIT PLANNER</h1>
          </div>
          <p className="text-xs text-slate-300 max-w-2xl">
            Aggregate estimated entitlement potential across all family dependents.
          </p>

          <div className="mt-6 pt-6 border-t border-white/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <span className="text-[11px] font-semibold text-sathya-teal-300 uppercase tracking-wider block">
                Total Potential Family Benefit Estimate
              </span>
              <div className="text-3xl font-black text-white mt-0.5">
                ₹{planner?.total_potential_benefit_estimate?.toLocaleString() || '0'}
              </div>
            </div>
            <div className="bg-white/10 backdrop-blur border border-white/10 rounded-xl p-3 text-[11px] text-slate-200 flex items-center gap-2">
              <Info className="w-4 h-4 text-sathya-saffron-400 shrink-0" />
              <span>Estimates subject to department verification & official approval.</span>
            </div>
          </div>
        </div>

        {/* Benefit Items Table */}
        <div className="bg-white/80 dark:bg-slate-900/70 backdrop-blur-md rounded-2xl p-6 shadow-sm border border-slate-200 dark:border-white/10 space-y-4">
          <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-sathya-teal-600" />
            Entitlement Breakdown by Family Member
          </h2>

          {loading ? (
            <div className="space-y-3 py-6">
              {[1, 2, 3].map((n) => (
                <div key={n} className="h-14 bg-slate-100 rounded-lg animate-pulse" />
              ))}
            </div>
          ) : planner?.items?.length === 0 ? (
            <p className="text-xs text-slate-500 py-6 text-center">No active family member scheme matches found.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-500 font-semibold bg-slate-50">
                    <th className="py-3 px-4">Member</th>
                    <th className="py-3 px-4">Scheme</th>
                    <th className="py-3 px-4">Match Status</th>
                    <th className="py-3 px-4">Potential Benefit</th>
                    <th className="py-3 px-4">Disclaimer & Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {planner?.items?.map((item: any, idx: number) => (
                    <tr key={idx} className="hover:bg-slate-50/50 transition-colors">
                      <td className="py-3 px-4 font-bold text-slate-900">
                        {item.member_name}
                        <span className="block text-[10px] font-normal text-slate-500">{item.relationship}</span>
                      </td>
                      <td className="py-3 px-4 font-semibold text-sathya-indigo-900">
                        {item.scheme_title}
                      </td>
                      <td className="py-3 px-4">
                        <span className="bg-emerald-50 text-emerald-700 font-bold px-2 py-0.5 rounded text-[10px]">
                          {item.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 font-bold text-slate-900">
                        {item.estimated_benefit}
                      </td>
                      <td className="py-3 px-4 text-[10px] text-slate-500">
                        {item.disclaimer}
                        <Link href={`/schemes/${item.scheme_id}`} className="block text-sathya-teal-600 font-bold hover:underline mt-0.5">
                          View Details →
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Family Optimization & Conflict Warnings */}
        <div className="bg-amber-50 rounded-2xl p-6 border border-amber-200 space-y-3">
          <h3 className="text-sm font-bold text-amber-900 flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-amber-600" />
            FAMILY OPTIMIZATION & COMPATIBILITY NOTES
          </h3>
          <ul className="space-y-2 text-xs text-amber-950">
            {planner?.optimization_notes?.map((note: string, idx: number) => (
              <li key={idx} className="flex items-start gap-2">
                <span className="text-amber-600 font-bold">•</span>
                <span>{note}</span>
              </li>
            ))}
          </ul>
        </div>

      </div>
    </div>
  );
}
