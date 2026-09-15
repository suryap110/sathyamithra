'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Calendar, Sparkles, CheckCircle2, ArrowRight, Activity, Plus } from 'lucide-react';
import api from '@/lib/api-client';

const EVENT_PRESETS = [
  { id: 'COLLEGE_START', label: 'Starting College', category: 'Education' },
  { id: 'GRADUATION', label: 'Graduation', category: 'Education' },
  { id: 'NEW_JOB', label: 'Getting a Job', category: 'Employment' },
  { id: 'BUSINESS_START', label: 'Starting a Business', category: 'Business' },
  { id: 'FARMER_STATUS', label: 'Becoming a Farmer', category: 'Agriculture' },
  { id: 'SENIOR_CITIZEN', label: 'Turning Senior Citizen', category: 'Pension' },
  { id: 'MARRIAGE', label: 'Getting Married', category: 'Family' },
  { id: 'CHILDBIRTH', label: 'Childbirth', category: 'Healthcare' }
];

export default function LifeEventsPage() {
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedEventType, setSelectedEventType] = useState<string>('GRADUATION');
  const [description, setDescription] = useState<string>('');
  const [analysisResult, setAnalysisResult] = useState<any>(null);
  const [analyzing, setAnalyzing] = useState<boolean>(false);

  useEffect(() => {
    fetchLifeEvents();
  }, []);

  const fetchLifeEvents = async () => {
    setLoading(true);
    try {
      const res = await api.get('/life-events');
      setEvents(res.data);
    } catch (err) {
      console.error('Failed to fetch life events', err);
    } finally {
      setLoading(false);
    }
  };

  const handleRecordEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    setAnalyzing(true);
    try {
      const resCreate = await api.post('/life-events', {
        event_type: selectedEventType,
        event_date: new Date().toISOString().split('T')[0],
        description: description || `Logged ${selectedEventType.replace('_', ' ')} event.`
      });

      const eventId = resCreate.data.id;
      const resAnalyze = await api.post(`/life-events/${eventId}/analyze`);
      setAnalysisResult(resAnalyze.data);
      fetchLifeEvents();
    } catch (err) {
      console.error('Failed to record and analyze life event', err);
    } finally {
      setAnalyzing(false);
    }
  };

  return (
    <div className="min-h-screen bg-transparent text-slate-900 dark:text-slate-100 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">

        {/* Page Header */}
        <div className="bg-white/80 dark:bg-slate-900/70 backdrop-blur-md p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-white/10">
          <h1 className="text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2">
            <Calendar className="w-6 h-6 text-sathya-saffron-500" />
            LIFE EVENT ENGINE
          </h1>
          <p className="text-sm text-slate-600 dark:text-slate-300 mt-1">
            Record major life milestones (graduation, starting a business, becoming a farmer) to automatically recalculate scheme eligibility and update recommendations.
          </p>
        </div>

        {/* Event Selector Form */}
        <div className="bg-white/80 dark:bg-slate-900/70 backdrop-blur-md p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-white/10 space-y-4">
          <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Activity className="w-5 h-5 text-sathya-teal-600" />
            Select a Recent Life Event
          </h2>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {EVENT_PRESETS.map((preset) => (
              <button
                key={preset.id}
                type="button"
                onClick={() => setSelectedEventType(preset.id)}
                className={`p-3 rounded-xl border text-left text-xs font-bold transition-all ${
                  selectedEventType === preset.id
                    ? 'border-sathya-teal-600 bg-sathya-teal-50/50 dark:bg-sathya-teal-950/40 text-sathya-teal-900 dark:text-sathya-teal-300 shadow-2xs'
                    : 'border-slate-200 dark:border-white/10 hover:border-slate-300 dark:hover:border-white/20 text-slate-700 dark:text-slate-300 bg-white/60 dark:bg-slate-800/60'
                }`}
              >
                <span className="block font-bold">{preset.label}</span>
                <span className="text-[10px] text-slate-400 font-normal">{preset.category}</span>
              </button>
            ))}
          </div>

          <form onSubmit={handleRecordEvent} className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-center gap-3">
            <input
              type="text"
              placeholder="Add optional notes (e.g. Graduated with B.Tech degree)"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="flex-1 px-3 py-2 text-xs border border-slate-300 rounded-lg w-full focus:outline-hidden focus:ring-2 focus:ring-sathya-teal-500"
            />
            <Button type="submit" variant="primary" disabled={analyzing} className="gap-2 text-xs w-full sm:w-auto">
              <Sparkles className="w-4 h-4 text-sathya-saffron-400" />
              {analyzing ? 'Recalculating...' : 'Log Event & Update Schemes'}
            </Button>
          </form>
        </div>

        {/* Live Analysis Output Modal / Card */}
        {analysisResult && (
          <div className="bg-gradient-to-br from-sathya-teal-900 to-sathya-indigo-950 rounded-2xl p-6 text-white shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h3 className="text-base font-bold flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                ELIGIBILITY IMPACT ANALYSIS
              </h3>
              <span className="text-xs bg-emerald-500/20 text-emerald-300 font-semibold px-2.5 py-0.5 rounded-full border border-emerald-500/30">
                {analysisResult.event_type}
              </span>
            </div>

            <p className="text-xs text-slate-200">{analysisResult.impact_summary}</p>

            {analysisResult.matched_schemes?.length > 0 && (
              <div className="space-y-2 pt-2">
                <span className="text-xs font-bold text-sathya-saffron-400 block">Newly Matched Government Schemes:</span>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {analysisResult.matched_schemes.map((m: any) => (
                    <div key={m.scheme.id} className="bg-white/10 backdrop-blur p-3 rounded-xl border border-white/10 text-xs">
                      <h4 className="font-bold text-white line-clamp-1">{m.scheme.title}</h4>
                      <p className="text-[11px] text-slate-300 line-clamp-1 mt-0.5">{m.scheme.short_description}</p>
                      <Link href={`/schemes/${m.scheme.id}`} className="inline-flex items-center gap-1 text-sathya-teal-300 font-bold text-[11px] mt-2 hover:underline">
                        View Scheme <ArrowRight className="w-3 h-3" />
                      </Link>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* History of Life Events */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 space-y-4">
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-sathya-teal-600" />
            Your Recorded Milestones ({events.length})
          </h2>

          {loading ? (
            <p className="text-xs text-slate-400">Loading events history...</p>
          ) : events.length === 0 ? (
            <p className="text-xs text-slate-500 text-center py-6">No life events recorded yet. Select an event above to start.</p>
          ) : (
            <div className="divide-y divide-slate-100">
              {events.map((evt) => (
                <div key={evt.id} className="py-3 flex items-center justify-between">
                  <div>
                    <span className="text-xs font-bold text-slate-900 block">
                      {evt.event_type.replace('_', ' ')}
                    </span>
                    <span className="text-[11px] text-slate-500">{evt.description || 'No description notes'}</span>
                  </div>
                  <span className="text-[11px] text-slate-400 font-medium">{evt.event_date || 'Recent'}</span>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
