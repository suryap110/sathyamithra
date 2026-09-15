'use client';

import React, { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { SchemeCard } from '@/components/schemes/scheme-card';
import { 
  Sliders, 
  Sparkles, 
  ArrowRight, 
  TrendingUp, 
  AlertCircle, 
  CheckCircle2, 
  RefreshCw 
} from 'lucide-react';

export default function SimulatorPage() {
  // Current Situation
  const [currentIncome, setCurrentIncome] = useState(350000);
  const [currentState, setCurrentState] = useState('Tamil Nadu');
  const [currentOccupation, setCurrentOccupation] = useState('Student');
  const [currentIsStudent, setCurrentIsStudent] = useState(true);

  // Simulated Situation
  const [simulatedIncome, setSimulatedIncome] = useState(180000);
  const [simulatedState, setSimulatedState] = useState('Tamil Nadu');
  const [simulatedOccupation, setSimulatedOccupation] = useState('Student');
  const [simulatedIsStudent, setSimulatedIsStudent] = useState(true);

  const [simulationResult, setSimulationResult] = useState<any | null>(null);

  const simulateMutation = useMutation({
    mutationFn: async () => {
      const payload = {
        current_profile: {
          annual_income: currentIncome,
          state: currentState,
          occupation: currentOccupation,
          is_student: currentOccupation === 'Student',
          is_farmer: currentOccupation === 'Farmer',
          age: 25,
        },
        simulated_profile: {
          annual_income: simulatedIncome,
          state: simulatedState,
          occupation: simulatedOccupation,
          is_student: simulatedOccupation === 'Student',
          is_farmer: simulatedOccupation === 'Farmer',
          age: 25,
        },
      };
      const res = await apiClient.post('/eligibility/simulate', payload);
      return res.data;
    },
    onSuccess: (data) => {
      setSimulationResult(data);
    },
  });

  return (
    <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Banner */}
      <div className="bg-gradient-to-r from-sathya-indigo-900 to-sathya-teal-800 p-8 rounded-2xl text-white shadow-lg space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-xs font-semibold text-sathya-saffron-500 backdrop-blur">
          <Sliders className="w-3.5 h-3.5" />
          <span>What-If Eligibility Simulator · Backend AI Powered</span>
        </div>
        <h1 className="text-3xl font-extrabold">Could I qualify if my situation changed?</h1>
        <p className="text-sm text-slate-200 max-w-2xl">
          Simulate income adjustments, occupation transitions, or state moves to see newly unlocked government schemes computed in real-time by the backend engine.
        </p>
      </div>

      {/* Control Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        
        {/* CURRENT SITUATION */}
        <Card className="space-y-4 border-slate-200">
          <CardHeader className="border-b border-slate-100 pb-3">
            <CardTitle className="text-base font-bold text-slate-700">Current Situation</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 pt-2">
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-600">Annual Household Income: ₹{currentIncome.toLocaleString()}</label>
              <input
                type="range"
                min="50000"
                max="1000000"
                step="25000"
                value={currentIncome}
                onChange={(e) => setCurrentIncome(Number(e.target.value))}
                className="w-full accent-sathya-indigo-700 cursor-pointer"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-600">Current Occupation</label>
              <select
                value={currentOccupation}
                onChange={(e) => setCurrentOccupation(e.target.value)}
                className="w-full text-xs p-2.5 rounded-lg border border-slate-300 bg-slate-50"
              >
                <option value="Private Job">Private Sector Job</option>
                <option value="Student">Enrolled Student</option>
                <option value="Farmer">Farmer / Cultivator</option>
                <option value="Self-Employed">Self-Employed / Vendor</option>
                <option value="Unemployed">Unemployed</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-600">State of Residence</label>
              <select
                value={currentState}
                onChange={(e) => setCurrentState(e.target.value)}
                className="w-full text-xs p-2.5 rounded-lg border border-slate-300 bg-slate-50"
              >
                <option value="Tamil Nadu">Tamil Nadu</option>
                <option value="Karnataka">Karnataka</option>
                <option value="Kerala">Kerala</option>
                <option value="Maharashtra">Maharashtra</option>
                <option value="Central">Central / Other State</option>
              </select>
            </div>
          </CardContent>
        </Card>

        {/* HYPOTHETICAL SITUATION */}
        <Card className="space-y-4 border-sathya-teal-300 bg-sathya-teal-50/20">
          <CardHeader className="border-b border-sathya-teal-100 pb-3">
            <CardTitle className="text-base font-bold text-sathya-teal-900 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-sathya-saffron-500" />
              <span>Simulated Change</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 pt-2">
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-sathya-teal-900">Simulated Income: ₹{simulatedIncome.toLocaleString()}</label>
              <input
                type="range"
                min="50000"
                max="1000000"
                step="25000"
                value={simulatedIncome}
                onChange={(e) => setSimulatedIncome(Number(e.target.value))}
                className="w-full accent-sathya-teal-600 cursor-pointer"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-sathya-teal-900">Simulated Occupation</label>
              <select
                value={simulatedOccupation}
                onChange={(e) => setSimulatedOccupation(e.target.value)}
                className="w-full text-xs p-2.5 rounded-lg border border-sathya-teal-200 bg-white"
              >
                <option value="Farmer">Farmer / Agriculture</option>
                <option value="Self-Employed">Self-Employed / Small Business</option>
                <option value="Student">Higher Education Student</option>
                <option value="Private Job">Private Sector Job</option>
                <option value="Unemployed">Seeking Employment</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-sathya-teal-900">Simulated State</label>
              <select
                value={simulatedState}
                onChange={(e) => setSimulatedState(e.target.value)}
                className="w-full text-xs p-2.5 rounded-lg border border-sathya-teal-200 bg-white"
              >
                <option value="Tamil Nadu">Tamil Nadu</option>
                <option value="Karnataka">Karnataka</option>
                <option value="Kerala">Kerala</option>
                <option value="Maharashtra">Maharashtra</option>
                <option value="Central">Central / Other State</option>
              </select>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Run Simulation CTA */}
      <div className="text-center">
        <Button
          variant="primary"
          size="lg"
          className="gap-2 px-10 shadow-lg bg-green-600 hover:bg-green-700 text-white"
          isLoading={simulateMutation.isPending}
          onClick={() => simulateMutation.mutate()}
        >
          <RefreshCw className="w-4 h-4" />
          <span>Simulate Eligibility Changes on Backend</span>
        </Button>
      </div>

      {/* RESULTS DISPLAY */}
      {simulationResult && (
        <div className="space-y-6 pt-4 animate-in fade-in duration-300">
          
          {/* Highlight Summary Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-6">
            <Card className="text-center p-6 space-y-1">
              <span className="text-xs text-slate-500 font-medium">Current Qualified</span>
              <div className="text-3xl font-extrabold text-sathya-indigo-900">{simulationResult.current_matches_count}</div>
            </Card>

            <Card className="text-center p-6 space-y-1 bg-sathya-teal-50 border-sathya-teal-200">
              <span className="text-xs text-sathya-teal-800 font-semibold">Simulated Qualified</span>
              <div className="text-3xl font-extrabold text-sathya-teal-900">{simulationResult.simulated_matches_count}</div>
            </Card>

            <Card className="text-center p-6 space-y-1 bg-green-50 border-green-300">
              <span className="text-xs text-green-700 font-bold">Newly Unlocked</span>
              <div className="text-3xl font-extrabold text-green-700">+{simulationResult.newly_eligible.length}</div>
            </Card>

            <Card className="text-center p-6 space-y-1 bg-amber-50 border-amber-300">
              <span className="text-xs text-amber-700 font-bold">Net Benefit Value</span>
              <div className="text-2xl font-extrabold text-amber-800">
                {simulationResult.net_potential_benefit_change >= 0 ? "+" : ""}
                ₹{Math.round(simulationResult.net_potential_benefit_change).toLocaleString()}
              </div>
            </Card>
          </div>

          {/* Newly Unlocked Schemes Grid */}
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-sathya-indigo-900 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-sathya-teal-600" />
              <span>Newly Unlocked Government Schemes</span>
            </h3>

            {simulationResult.newly_eligible.length === 0 ? (
              <div className="p-6 bg-slate-50 border border-slate-200 text-slate-500 rounded-xl text-xs text-center">
                No new schemes unlocked under these parameters. Try lowering simulated income or changing occupation status.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {simulationResult.newly_eligible.map((item: any) => (
                  <SchemeCard key={item.scheme.id} scheme={item.scheme} matchScore={item.match_percentage} />
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
