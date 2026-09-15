'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useMutation } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { SchemeCard } from '@/components/schemes/scheme-card';
import { ExplainabilityModal } from '@/components/eligibility/explainability-modal';
import { 
  Sparkles, 
  GraduationCap, 
  Tractor, 
  Briefcase, 
  UserCheck, 
  HelpCircle, 
  ArrowRight, 
  ArrowLeft, 
  Info 
} from 'lucide-react';

const roleIcons: Record<string, any> = {
  Student: GraduationCap,
  Farmer: Tractor,
  Employee: Briefcase,
  'Business Owner': Briefcase,
  'Job Seeker': HelpCircle,
  'Senior Citizen': UserCheck,
};

export default function FindSchemesPage() {
  const [step, setStep] = useState(1);
  const [selectedRole, setSelectedRole] = useState('Student');
  const [selectedState, setSelectedState] = useState('Tamil Nadu');
  const [annualIncome, setAnnualIncome] = useState('180000');
  const [age, setAge] = useState('22');
  const [isStudent, setIsStudent] = useState(true);
  const [isFarmer, setIsFarmer] = useState(false);

  // Recommendations state
  const [results, setResults] = useState<any[]>([]);
  const [selectedExplainability, setSelectedExplainability] = useState<any | null>(null);

  const checkMutation = useMutation({
    mutationFn: async () => {
      const payload = {
        age: parseInt(age, 10),
        state: selectedState,
        annual_income: parseFloat(annualIncome),
        occupation: selectedRole,
        is_student: selectedRole === 'Student' || isStudent,
        is_farmer: selectedRole === 'Farmer' || isFarmer,
      };
      const res = await apiClient.post('/eligibility/check', payload);
      return res.data;
    },
    onSuccess: (data) => {
      setResults(data.matches || []);
      setStep(5);
    },
  });

  const rolesList = [
    { title: 'Student', desc: 'Enrolled in school, college, or university' },
    { title: 'Farmer', desc: 'Landholding or tenant agricultural worker' },
    { title: 'Employee', desc: 'Salaried worker in public or private sector' },
    { title: 'Business Owner', desc: 'Micro-entrepreneur or small business owner' },
    { title: 'Job Seeker', desc: 'Currently looking for employment or skill training' },
    { title: 'Senior Citizen', desc: 'Elderly citizen aged 60 years or above' },
  ];

  return (
    <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Top Banner */}
      <div className="text-center space-y-3">
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-sathya-teal-50 border border-sathya-teal-100 text-sathya-teal-800 text-xs font-semibold">
          <Sparkles className="w-4 h-4 text-sathya-saffron-500" />
          <span>Conversational AI Benefits Questionnaire</span>
        </div>
        <h1 className="text-3xl font-extrabold text-sathya-indigo-900">
          Find Government Benefits for You
        </h1>
        <p className="text-slate-600 text-sm max-w-lg mx-auto">
          Answer quick questions. Sathyamithra will evaluate central and state scheme eligibility criteria in real time.
        </p>
      </div>

      {/* Progress Steps */}
      {step < 5 && (
        <div className="flex items-center justify-center gap-2">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className={`h-2 rounded-full transition-all duration-300 ${
                step >= i ? 'w-12 bg-sathya-teal-600' : 'w-6 bg-slate-200'
              }`}
            ></div>
          ))}
        </div>
      )}

      {/* STEP 1: Occupation / Role */}
      {step === 1 && (
        <Card className="p-6 space-y-6">
          <div className="space-y-1 text-center">
            <h2 className="text-xl font-bold text-sathya-indigo-900">Step 1: What best describes you?</h2>
            <p className="text-xs text-slate-500">Select your current primary status.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {rolesList.map((r) => {
              const IconComponent = roleIcons[r.title] || Briefcase;
              const isSelected = selectedRole === r.title;
              return (
                <div
                  key={r.title}
                  onClick={() => {
                    setSelectedRole(r.title);
                    if (r.title === 'Student') setIsStudent(true);
                    if (r.title === 'Farmer') setIsFarmer(true);
                  }}
                  className={`p-4 rounded-xl border-2 cursor-pointer transition-all flex items-start gap-3.5 ${
                    isSelected
                      ? 'border-sathya-indigo-900 bg-sathya-indigo-50/70 shadow-sm'
                      : 'border-slate-200 bg-white hover:border-slate-300'
                  }`}
                >
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${isSelected ? 'bg-sathya-indigo-900 text-white' : 'bg-slate-100 text-slate-600'}`}>
                    <IconComponent className="w-5 h-5" />
                  </div>
                  <div className="space-y-0.5">
                    <h3 className="text-sm font-bold text-sathya-indigo-900">{r.title}</h3>
                    <p className="text-xs text-slate-500">{r.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="flex justify-end pt-4">
            <Button variant="primary" size="md" className="gap-2" onClick={() => setStep(2)}>
              <span>Next Step</span>
              <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
        </Card>
      )}

      {/* STEP 2: State & Age */}
      {step === 2 && (
        <Card className="p-6 space-y-6">
          <div className="space-y-1 text-center">
            <h2 className="text-xl font-bold text-sathya-indigo-900">Step 2: Location & Age</h2>
            <p className="text-xs text-slate-500">State schemes depend on your residence.</p>
          </div>

          <div className="space-y-4 max-w-md mx-auto">
            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-slate-700">Which state do you live in?</label>
              <select
                value={selectedState}
                onChange={(e) => setSelectedState(e.target.value)}
                className="w-full h-11 rounded-lg border border-slate-300 bg-white px-3 text-sm focus:ring-2 focus:ring-sathya-indigo-500"
              >
                <option value="Tamil Nadu">Tamil Nadu</option>
                <option value="Karnataka">Karnataka</option>
                <option value="Kerala">Kerala</option>
                <option value="Andhra Pradesh">Andhra Pradesh</option>
                <option value="Maharashtra">Maharashtra</option>
                <option value="Delhi">Delhi</option>
                <option value="Uttar Pradesh">Uttar Pradesh</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-slate-700">Your Age (Years)</label>
              <input
                type="number"
                value={age}
                onChange={(e) => setAge(e.target.value)}
                className="w-full h-11 rounded-lg border border-slate-300 bg-white px-3 text-sm focus:ring-2 focus:ring-sathya-indigo-500"
              />
            </div>
          </div>

          <div className="flex justify-between pt-4">
            <Button variant="ghost" size="md" onClick={() => setStep(1)} className="gap-1">
              <ArrowLeft className="w-4 h-4" />
              <span>Back</span>
            </Button>
            <Button variant="primary" size="md" className="gap-2" onClick={() => setStep(3)}>
              <span>Next Step</span>
              <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
        </Card>
      )}

      {/* STEP 3: Income */}
      {step === 3 && (
        <Card className="p-6 space-y-6">
          <div className="space-y-1 text-center">
            <h2 className="text-xl font-bold text-sathya-indigo-900">Step 3: Household Income</h2>
            <p className="text-xs text-slate-500">Government schemes set ceiling limits on annual family income.</p>
          </div>

          <div className="space-y-4 max-w-md mx-auto">
            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-slate-700">Approximate Annual Household Income (₹)</label>
              <input
                type="number"
                value={annualIncome}
                onChange={(e) => setAnnualIncome(e.target.value)}
                className="w-full h-11 rounded-lg border border-slate-300 bg-white px-3 text-sm focus:ring-2 focus:ring-sathya-indigo-500"
              />
            </div>

            <div className="p-3.5 bg-sathya-indigo-50 rounded-xl border border-sathya-indigo-100 text-xs text-sathya-indigo-900 space-y-1">
              <span className="font-bold block">💡 Honest Guidance Note:</span>
              <p className="text-slate-600">
                You will need an official Income Certificate issued by your Tehsildar / VAO to claim schemes under ₹2,50,000 income limit.
              </p>
            </div>
          </div>

          <div className="flex justify-between pt-4">
            <Button variant="ghost" size="md" onClick={() => setStep(2)} className="gap-1">
              <ArrowLeft className="w-4 h-4" />
              <span>Back</span>
            </Button>
            <Button
              variant="primary"
              size="md"
              className="gap-2"
              isLoading={checkMutation.isPending}
              onClick={() => checkMutation.mutate()}
            >
              <Sparkles className="w-4 h-4 text-sathya-saffron-500" />
              <span>Generate My Schemes</span>
            </Button>
          </div>
        </Card>
      )}

      {/* STEP 5: RESULTS */}
      {step === 5 && (
        <div className="space-y-6">
          <div className="bg-gradient-to-r from-sathya-indigo-900 to-sathya-teal-800 p-6 rounded-2xl text-white flex items-center justify-between flex-wrap gap-4 shadow-md">
            <div className="space-y-1">
              <Badge variant="accent">AI Match Evaluation Complete</Badge>
              <h2 className="text-2xl font-extrabold">Matched {results.length} Potential Schemes</h2>
              <p className="text-xs text-slate-200">
                Evaluated for {selectedRole} resident in {selectedState} with income ₹{parseFloat(annualIncome || '0').toLocaleString('en-IN')}.
              </p>
            </div>
            <Button variant="outline" size="sm" onClick={() => setStep(1)} className="bg-white/10 text-white border-white/20 hover:bg-white/20">
              Retake Questionnaire
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {results.map((item: any) => (
              <div key={item.scheme.id} className="space-y-2">
                <SchemeCard scheme={item.scheme} matchScore={item.match_percentage} />
                <button
                  onClick={() => setSelectedExplainability(item)}
                  className="text-xs font-semibold text-sathya-teal-600 hover:underline inline-flex items-center gap-1 pl-1"
                >
                  <Info className="w-3.5 h-3.5" />
                  <span>Why am I seeing this scheme?</span>
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* EXPLAINABILITY MODAL TRIGGER */}
      {selectedExplainability && (
        <ExplainabilityModal
          schemeTitle={selectedExplainability.scheme.title}
          matchScore={selectedExplainability.match_percentage}
          confidence={selectedExplainability.confidence_level}
          reasons={selectedExplainability.reasons}
          warnings={selectedExplainability.warnings}
          onClose={() => setSelectedExplainability(null)}
        />
      )}
    </div>
  );
}
