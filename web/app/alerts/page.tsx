'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Bell, CheckCircle2, Sliders, Trash2, ShieldAlert, ArrowRight, Check } from 'lucide-react';
import api from '@/lib/api-client';

export default function AlertsPage() {
  const [alerts, setAlerts] = useState<any[]>([]);
  const [filter, setFilter] = useState<string>('ALL');  // ALL, UNREAD, IMPORTANT
  const [loading, setLoading] = useState<boolean>(true);
  const [showPrefModal, setShowPrefModal] = useState<boolean>(false);

  // Preference settings state
  const [schemeAlerts, setSchemeAlerts] = useState('ALL');
  const [applicationAlerts, setApplicationAlerts] = useState('ALL');
  const [documentAlerts, setDocumentAlerts] = useState('ALL');
  const [lifeEventAlerts, setLifeEventAlerts] = useState('ALL');

  useEffect(() => {
    fetchAlerts();
    fetchPreferences();
  }, [filter]);

  const fetchAlerts = async () => {
    setLoading(true);
    try {
      const url = filter === 'UNREAD' ? '/alerts?unread_only=true' : '/alerts';
      const res = await api.get(url);
      let data = res.data;
      if (filter === 'IMPORTANT') {
        data = data.filter((a: any) => a.severity === 'WARNING' || a.severity === 'ACTION_REQUIRED');
      }
      setAlerts(data);
    } catch (err) {
      console.error('Failed to fetch alerts', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchPreferences = async () => {
    try {
      const res = await api.get('/alerts/preferences');
      setSchemeAlerts(res.data.scheme_alerts);
      setApplicationAlerts(res.data.application_alerts);
      setDocumentAlerts(res.data.document_alerts);
      setLifeEventAlerts(res.data.life_event_alerts);
    } catch (err) {
      console.error('Failed to fetch notification preferences', err);
    }
  };

  const handleSavePreferences = async () => {
    try {
      await api.put('/alerts/preferences', {
        scheme_alerts: schemeAlerts,
        application_alerts: applicationAlerts,
        document_alerts: documentAlerts,
        life_event_alerts: lifeEventAlerts,
        local_alerts: 'ALL',
        ai_recommendations: 'ALL'
      });
      setShowPrefModal(false);
    } catch (err) {
      console.error('Failed to save preferences', err);
    }
  };

  const handleMarkAsRead = async (id: string) => {
    try {
      await api.post(`/alerts/${id}/read`);
      fetchAlerts();
    } catch (err) {
      console.error('Failed to mark read', err);
    }
  };

  const handleDeleteAlert = async (id: string) => {
    try {
      await api.delete(`/alerts/${id}`);
      fetchAlerts();
    } catch (err) {
      console.error('Failed to delete alert', err);
    }
  };

  return (
    <div className="min-h-screen bg-transparent text-slate-900 dark:text-slate-100 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto space-y-8">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white/80 dark:bg-slate-900/70 backdrop-blur-md p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-white/10">
          <div>
            <h1 className="text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2">
              <Bell className="w-6 h-6 text-sathya-teal-600" />
              SMART ALERTS CENTER
            </h1>
            <p className="text-sm text-slate-600 dark:text-slate-300 mt-1">
              Proactive notifications regarding scheme updates, document expirations, application status shifts, and new matches.
            </p>
          </div>
          <Button variant="outline" onClick={() => setShowPrefModal(true)} className="gap-2 text-xs">
            <Sliders className="w-4 h-4 text-sathya-indigo-700" />
            Notification Settings
          </Button>
        </div>

        {/* Filter Tabs */}
        <div className="flex items-center gap-2 border-b border-slate-200/60 dark:border-white/10 pb-2">
          {['ALL', 'UNREAD', 'IMPORTANT'].map((tab) => (
            <button
              key={tab}
              onClick={() => setFilter(tab)}
              className={`px-4 py-2 text-xs font-bold rounded-lg transition-colors ${
                filter === tab
                  ? 'bg-sathya-teal-600 text-white shadow-2xs'
                  : 'text-slate-600 dark:text-slate-300 hover:bg-slate-200/60 dark:hover:bg-slate-800/60'
              }`}
            >
              {tab === 'ALL' ? 'All Alerts' : tab === 'UNREAD' ? 'Unread Only' : 'Important & Action Required'}
            </button>
          ))}
        </div>

        {/* Alerts Feed */}
        <div className="space-y-3">
          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((n) => (
                <div key={n} className="h-20 bg-white/60 dark:bg-slate-900/50 backdrop-blur-md rounded-xl animate-pulse border border-slate-200 dark:border-white/10" />
              ))}
            </div>
          ) : alerts.length === 0 ? (
            <div className="bg-white/80 dark:bg-slate-900/70 backdrop-blur-md rounded-2xl p-8 text-center border border-slate-200 dark:border-white/10">
              <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto mb-2" />
              <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100">No Alerts Found</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">You are all caught up! No notifications in this category.</p>
            </div>
          ) : (
            alerts.map((alt) => (
              <div
                key={alt.id}
                className={`p-4 rounded-xl border backdrop-blur-md transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                  !alt.read
                    ? 'bg-white/85 dark:bg-slate-900/75 border-sathya-teal-500 shadow-2xs'
                    : 'bg-white/60 dark:bg-slate-900/50 border-slate-200 dark:border-white/10 opacity-90'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0 mt-0.5 ${
                    alt.severity === 'ACTION_REQUIRED'
                      ? 'bg-red-50 text-red-700'
                      : alt.severity === 'WARNING'
                      ? 'bg-amber-50 text-amber-700'
                      : 'bg-sathya-teal-50 text-sathya-teal-700'
                  }`}>
                    {alt.severity === 'ACTION_REQUIRED' ? '⚠' : '🔔'}
                  </div>

                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="text-xs font-bold text-slate-900">{alt.title}</h4>
                      {!alt.read && (
                        <span className="text-[10px] font-bold text-sathya-teal-700 bg-sathya-teal-50 px-2 py-0.5 rounded">
                          New
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-600 mt-0.5">{alt.message}</p>
                    <span className="text-[10px] text-slate-400 mt-1 block">
                      {new Date(alt.created_at).toLocaleString()}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                  {alt.action_url && (
                    <Link href={alt.action_url}>
                      <Button variant="outline" size="sm" className="text-xs gap-1">
                        View Details <ArrowRight className="w-3 h-3" />
                      </Button>
                    </Link>
                  )}
                  {!alt.read && (
                    <button
                      onClick={() => handleMarkAsRead(alt.id)}
                      className="p-2 text-slate-400 hover:text-emerald-600 transition-colors"
                      title="Mark as Read"
                    >
                      <Check className="w-4 h-4" />
                    </button>
                  )}
                  <button
                    onClick={() => handleDeleteAlert(alt.id)}
                    className="p-2 text-slate-400 hover:text-red-600 transition-colors"
                    title="Delete Alert"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Preferences Modal */}
        {showPrefModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
            <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6 border border-slate-200 space-y-4">
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Sliders className="w-5 h-5 text-sathya-teal-600" />
                Notification Preferences
              </h2>

              <div className="space-y-3 text-xs">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Scheme Match Alerts</label>
                  <select
                    value={schemeAlerts}
                    onChange={(e) => setSchemeAlerts(e.target.value)}
                    className="w-full p-2 border border-slate-300 rounded-lg"
                  >
                    <option value="ALL">All Alerts</option>
                    <option value="IMPORTANT_ONLY">Important Only</option>
                    <option value="OFF">Turn Off</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Application Tracker Alerts</label>
                  <select
                    value={applicationAlerts}
                    onChange={(e) => setApplicationAlerts(e.target.value)}
                    className="w-full p-2 border border-slate-300 rounded-lg"
                  >
                    <option value="ALL">All Alerts</option>
                    <option value="IMPORTANT_ONLY">Important Only</option>
                    <option value="OFF">Turn Off</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Document Expiry Alerts</label>
                  <select
                    value={documentAlerts}
                    onChange={(e) => setDocumentAlerts(e.target.value)}
                    className="w-full p-2 border border-slate-300 rounded-lg"
                  >
                    <option value="ALL">All Alerts</option>
                    <option value="IMPORTANT_ONLY">Important Only</option>
                    <option value="OFF">Turn Off</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Life Event Recommendation Alerts</label>
                  <select
                    value={lifeEventAlerts}
                    onChange={(e) => setLifeEventAlerts(e.target.value)}
                    className="w-full p-2 border border-slate-300 rounded-lg"
                  >
                    <option value="ALL">All Alerts</option>
                    <option value="IMPORTANT_ONLY">Important Only</option>
                    <option value="OFF">Turn Off</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <Button variant="outline" size="sm" onClick={() => setShowPrefModal(false)}>
                  Cancel
                </Button>
                <Button variant="primary" size="sm" onClick={handleSavePreferences}>
                  Save Preferences
                </Button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
