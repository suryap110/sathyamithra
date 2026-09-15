import React from 'react';
import { Button } from '@/components/ui/button';
import { Filter, RotateCcw, Building2, MapPin, Layers, DollarSign } from 'lucide-react';

interface FilterProps {
  selectedState: string;
  setSelectedState: (state: string) => void;
  selectedCategory: string;
  setSelectedCategory: (cat: string) => void;
  selectedBenefitType: string;
  setSelectedBenefitType: (type: string) => void;
  selectedAppMode: string;
  setSelectedAppMode: (mode: string) => void;
  categories: Array<{ id: string; name: string }>;
  states: string[];
  onReset: () => void;
}

export function SchemeFilters({
  selectedState,
  setSelectedState,
  selectedCategory,
  setSelectedCategory,
  selectedBenefitType,
  setSelectedBenefitType,
  selectedAppMode,
  setSelectedAppMode,
  categories,
  states,
  onReset,
}: FilterProps) {
  return (
    <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-6">
      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
        <div className="flex items-center gap-2 font-bold text-sathya-indigo-900 text-sm">
          <Filter className="w-4 h-4 text-sathya-teal-600" />
          <span>Filters</span>
        </div>
        <button
          onClick={onReset}
          className="text-xs text-slate-500 hover:text-sathya-teal-600 font-medium flex items-center gap-1 transition-colors"
        >
          <RotateCcw className="w-3 h-3" />
          <span>Reset</span>
        </button>
      </div>

      {/* State / UT Filter */}
      <div className="space-y-2">
        <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5 uppercase tracking-wider">
          <MapPin className="w-3.5 h-3.5 text-sathya-teal-600" />
          <span>State / Government</span>
        </label>
        <select
          value={selectedState}
          onChange={(e) => setSelectedState(e.target.value)}
          className="w-full text-xs rounded-lg border border-slate-300 p-2 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-sathya-indigo-500"
        >
          <option value="All">All States & Central</option>
          {states.map((st) => (
            <option key={st} value={st}>
              {st}
            </option>
          ))}
        </select>
      </div>

      {/* Category Filter */}
      <div className="space-y-2">
        <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5 uppercase tracking-wider">
          <Layers className="w-3.5 h-3.5 text-sathya-indigo-700" />
          <span>Category</span>
        </label>
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="w-full text-xs rounded-lg border border-slate-300 p-2 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-sathya-indigo-500"
        >
          <option value="">All Categories</option>
          {categories.map((cat) => (
            <option key={cat.id} value={cat.id}>
              {cat.name}
            </option>
          ))}
        </select>
      </div>

      {/* Benefit Type */}
      <div className="space-y-2">
        <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5 uppercase tracking-wider">
          <DollarSign className="w-3.5 h-3.5 text-sathya-saffron-500" />
          <span>Benefit Type</span>
        </label>
        <div className="space-y-1.5 text-xs text-slate-600">
          {['All', 'Scholarship', 'Financial Support', 'Healthcare Insurance', 'Monthly Pension', 'Low-Interest Loan'].map((type) => (
            <label key={type} className="flex items-center gap-2 cursor-pointer hover:text-sathya-indigo-900">
              <input
                type="radio"
                name="benefitType"
                value={type === 'All' ? '' : type}
                checked={(type === 'All' && !selectedBenefitType) || selectedBenefitType === type}
                onChange={() => setSelectedBenefitType(type === 'All' ? '' : type)}
                className="text-sathya-teal-600 focus:ring-sathya-teal-500"
              />
              <span>{type}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Application Mode */}
      <div className="space-y-2">
        <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
          Application Mode
        </label>
        <div className="flex gap-2">
          {['All', 'Online', 'Offline', 'Both'].map((mode) => (
            <button
              key={mode}
              onClick={() => setSelectedAppMode(mode)}
              className={`flex-1 py-1.5 text-[11px] font-semibold rounded-md border transition-colors ${
                selectedAppMode === mode
                  ? 'bg-sathya-indigo-900 text-white border-sathya-indigo-900'
                  : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
              }`}
            >
              {mode}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
