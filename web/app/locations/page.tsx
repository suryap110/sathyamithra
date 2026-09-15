'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { MapPin, Phone, Mail, Globe, ShieldCheck, Search, Building2 } from 'lucide-react';
import api from '@/lib/api-client';

export default function LocationsPage() {
  const [locations, setLocations] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [state, setState] = useState<string>('Tamil Nadu');
  const [district, setDistrict] = useState<string>('Chennai');
  const [type, setType] = useState<string>('');

  useEffect(() => {
    handleSearch();
  }, []);

  const handleSearch = async () => {
    setLoading(true);
    try {
      const res = await api.post('/locations/search', {
        state: state || undefined,
        district: district || undefined,
        type: type || undefined
      });
      setLocations(res.data.support_centers || []);
    } catch (err) {
      console.error('Failed to search hyperlocal support centers', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-transparent text-slate-900 dark:text-slate-100 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">

        {/* Header */}
        <div className="bg-white/80 dark:bg-slate-900/70 backdrop-blur-md p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-white/10">
          <h1 className="text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2">
            <MapPin className="w-6 h-6 text-red-500" />
            HYPERLOCAL SUPPORT CENTERS
          </h1>
          <p className="text-sm text-slate-600 dark:text-slate-300 mt-1">
            Locate nearby Common Service Centers (CSC E-Sevai Maiyam), Social Welfare offices, and government scheme application help desks.
          </p>
        </div>

        {/* Search Filter Controls */}
        <div className="bg-white/80 dark:bg-slate-900/70 backdrop-blur-md p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-white/10 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">State</label>
              <input
                type="text"
                placeholder="e.g. Tamil Nadu, Karnataka"
                value={state}
                onChange={(e) => setState(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-300 dark:border-slate-700 dark:bg-slate-800/80 dark:text-white rounded-lg focus:outline-hidden focus:ring-2 focus:ring-sathya-teal-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">District</label>
              <input
                type="text"
                placeholder="e.g. Chennai, Bengaluru Urban"
                value={district}
                onChange={(e) => setDistrict(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-300 dark:border-slate-700 dark:bg-slate-800/80 dark:text-white rounded-lg focus:outline-hidden focus:ring-2 focus:ring-sathya-teal-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Center Type</label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-300 dark:border-slate-700 dark:bg-slate-800/80 dark:text-white rounded-lg"
              >
                <option value="">All Types</option>
                <option value="CSC_CENTER">CSC / E-Sevai Maiyam</option>
                <option value="GOVT_OFFICE">Government Office</option>
                <option value="HELP_CENTER">Help Desk Center</option>
                <option value="SCHEME_OFFICE">Scheme Nodal Office</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end">
            <Button variant="primary" size="sm" onClick={handleSearch} className="gap-2 text-xs">
              <Search className="w-4 h-4" /> Search Support Centers
            </Button>
          </div>
        </div>

        {/* Results Cards */}
        <div className="space-y-4">
          <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Building2 className="w-5 h-5 text-sathya-teal-600" />
            Verified Support Centers ({locations.length})
          </h2>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[1, 2].map((n) => (
                <div key={n} className="h-36 bg-white/60 dark:bg-slate-900/50 backdrop-blur-md rounded-xl animate-pulse border border-slate-200 dark:border-white/10" />
              ))}
            </div>
          ) : locations.length === 0 ? (
            <div className="bg-white/80 dark:bg-slate-900/70 backdrop-blur-md rounded-2xl p-8 text-center border border-slate-200 dark:border-white/10">
              <MapPin className="w-12 h-12 text-slate-300 mx-auto mb-2" />
              <h3 className="text-sm font-bold text-slate-800 dark:text-white">No Support Centers Found</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Try adjusting your state or district filter parameters.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {locations.map((loc) => (
                <div key={loc.id} className="bg-white/80 dark:bg-slate-900/70 backdrop-blur-md p-5 rounded-2xl border border-slate-200 dark:border-white/10 shadow-2xs space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <span className="text-[10px] font-bold text-sathya-teal-800 bg-sathya-teal-50 px-2.5 py-0.5 rounded-full inline-block mb-1">
                        {loc.type.replace('_', ' ')}
                      </span>
                      <h3 className="text-sm font-bold text-slate-900">{loc.name}</h3>
                      <p className="text-xs text-slate-600 mt-1">{loc.address}</p>
                    </div>
                    {loc.verified && (
                      <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded flex items-center gap-1 shrink-0">
                        <ShieldCheck className="w-3 h-3 text-emerald-600" /> Verified
                      </span>
                    )}
                  </div>

                  <div className="pt-3 border-t border-slate-100 grid grid-cols-2 gap-2 text-xs text-slate-600">
                    {loc.phone && (
                      <div className="flex items-center gap-1.5">
                        <Phone className="w-3.5 h-3.5 text-sathya-teal-600 shrink-0" />
                        <span className="truncate">{loc.phone}</span>
                      </div>
                    )}
                    {loc.email && (
                      <div className="flex items-center gap-1.5">
                        <Mail className="w-3.5 h-3.5 text-sathya-indigo-600 shrink-0" />
                        <span className="truncate">{loc.email}</span>
                      </div>
                    )}
                  </div>

                  {loc.source_url && (
                    <a
                      href={loc.source_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-xs font-bold text-sathya-teal-700 hover:underline pt-1"
                    >
                      <Globe className="w-3.5 h-3.5" /> Official Portal Directions →
                    </a>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
