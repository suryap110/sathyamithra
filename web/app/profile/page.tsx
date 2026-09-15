'use client';

import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import { useAuth } from '@/lib/auth-context';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { User, ShieldCheck, Save, CheckCircle2, MapPin, Briefcase, Users, Heart } from 'lucide-react';

export default function ProfilePage() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Profile State
  const [formData, setFormData] = useState({
    age: '',
    gender: 'Male',
    state: 'Tamil Nadu',
    district: 'Chennai',
    taluk: '',
    village_city: '',
    residence_type: 'Urban',
    annual_income: '',
    education_level: 'Undergraduate',
    occupation: 'Student',
    employment_status: 'Student',
    marital_status: 'Single',
    family_members_count: 3,
    social_category: 'General',
    is_disabled: false,
    is_student: true,
    is_farmer: false,
    is_business_owner: false,
    housing_status: 'Own',
    land_ownership_acres: 0,
    is_migrant_worker: false,
    is_parent: false,
    is_senior_citizen: false,
  });

  const { data: profile, isLoading } = useQuery({
    queryKey: ['user-profile'],
    queryFn: async () => {
      const res = await apiClient.get('/users/profile');
      return res.data;
    },
    enabled: !!user,
  });

  useEffect(() => {
    if (profile) {
      setFormData({
        age: profile.age ? String(profile.age) : '',
        gender: profile.gender || 'Male',
        state: profile.state || 'Tamil Nadu',
        district: profile.district || 'Chennai',
        taluk: profile.taluk || '',
        village_city: profile.village_city || '',
        residence_type: profile.residence_type || 'Urban',
        annual_income: profile.annual_income ? String(profile.annual_income) : '',
        education_level: profile.education_level || 'Undergraduate',
        occupation: profile.occupation || 'Student',
        employment_status: profile.employment_status || 'Student',
        marital_status: profile.marital_status || 'Single',
        family_members_count: profile.family_members_count || 3,
        social_category: profile.social_category || 'General',
        is_disabled: profile.is_disabled || false,
        is_student: profile.is_student || false,
        is_farmer: profile.is_farmer || false,
        is_business_owner: profile.is_business_owner || false,
        housing_status: profile.housing_status || 'Own',
        land_ownership_acres: profile.land_ownership_acres || 0,
        is_migrant_worker: profile.is_migrant_worker || false,
        is_parent: profile.is_parent || false,
        is_senior_citizen: profile.is_senior_citizen || false,
      });
    }
  }, [profile]);

  const updateMutation = useMutation({
    mutationFn: async (updatedData: any) => {
      const res = await apiClient.put('/users/profile', updatedData);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-profile'] });
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      ...formData,
      age: formData.age ? parseInt(formData.age, 10) : null,
      annual_income: formData.annual_income ? parseFloat(formData.annual_income) : null,
      family_members_count: parseInt(String(formData.family_members_count), 10),
      land_ownership_acres: parseFloat(String(formData.land_ownership_acres)),
    };
    updateMutation.mutate(payload);
  };

  const completionPct = profile?.completion_percentage || 82;

  return (
    <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-sathya-indigo-900 to-sathya-teal-800 p-8 rounded-2xl text-white shadow-lg space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-xs font-semibold text-sathya-saffron-500 backdrop-blur">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Progressive Citizen Profile</span>
            </div>
            <h1 className="text-3xl font-extrabold">{user ? user.full_name : 'Citizen Profile'}</h1>
            <p className="text-sm text-slate-200">
              Complete demographic details to unlock precision AI scheme matching.
            </p>
          </div>

          <div className="bg-white/10 p-4 rounded-xl backdrop-blur text-center space-y-1 border border-white/10 min-w-[140px]">
            <span className="text-[11px] text-slate-300 uppercase tracking-wider block font-semibold">Profile Score</span>
            <div className="text-2xl font-extrabold text-sathya-saffron-500">{completionPct}%</div>
            <div className="w-full bg-white/20 rounded-full h-1.5 mt-1">
              <div className="bg-sathya-saffron-500 h-1.5 rounded-full" style={{ width: `${completionPct}%` }}></div>
            </div>
          </div>
        </div>
      </div>

      {saveSuccess && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm font-semibold rounded-xl flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5 text-emerald-600" />
          <span>Profile updated successfully! AI recommendation rankings refreshed.</span>
        </div>
      )}

      {/* Main Profile Form */}
      <form onSubmit={handleSubmit} className="space-y-8">
        
        {/* SECTION 1: Personal & Geographic */}
        <Card className="space-y-4">
          <CardHeader className="border-b border-slate-100 pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <MapPin className="w-4 h-4 text-sathya-teal-600" />
              <span>Personal & Location Demographics</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
            <Input
              label="Age (Years)"
              type="number"
              value={formData.age}
              onChange={(e) => setFormData({ ...formData, age: e.target.value })}
              placeholder="e.g. 22"
            />

            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-slate-700">Gender</label>
              <select
                value={formData.gender}
                onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                className="w-full h-10 rounded-lg border border-slate-300 bg-white px-3 text-sm focus:ring-2 focus:ring-sathya-indigo-500"
              >
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Transgender">Transgender</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-slate-700">State / UT</label>
              <select
                value={formData.state}
                onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                className="w-full h-10 rounded-lg border border-slate-300 bg-white px-3 text-sm focus:ring-2 focus:ring-sathya-indigo-500"
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

            <Input
              label="District"
              value={formData.district}
              onChange={(e) => setFormData({ ...formData, district: e.target.value })}
              placeholder="e.g. Chennai"
            />

            <Input
              label="Taluk / Block"
              value={formData.taluk}
              onChange={(e) => setFormData({ ...formData, taluk: e.target.value })}
              placeholder="e.g. Egmore"
            />

            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-slate-700">Residence Area</label>
              <select
                value={formData.residence_type}
                onChange={(e) => setFormData({ ...formData, residence_type: e.target.value })}
                className="w-full h-10 rounded-lg border border-slate-300 bg-white px-3 text-sm focus:ring-2 focus:ring-sathya-indigo-500"
              >
                <option value="Urban">Urban</option>
                <option value="Rural">Rural</option>
              </select>
            </div>
          </CardContent>
        </Card>

        {/* SECTION 2: Income & Employment */}
        <Card className="space-y-4">
          <CardHeader className="border-b border-slate-100 pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Briefcase className="w-4 h-4 text-sathya-indigo-700" />
              <span>Income, Occupation & Education</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
            <Input
              label="Annual Household Income (₹)"
              type="number"
              value={formData.annual_income}
              onChange={(e) => setFormData({ ...formData, annual_income: e.target.value })}
              placeholder="e.g. 180000"
            />

            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-slate-700">Primary Occupation</label>
              <select
                value={formData.occupation}
                onChange={(e) => setFormData({ ...formData, occupation: e.target.value })}
                className="w-full h-10 rounded-lg border border-slate-300 bg-white px-3 text-sm focus:ring-2 focus:ring-sathya-indigo-500"
              >
                <option value="Student">Student</option>
                <option value="Farmer">Farmer</option>
                <option value="Employee">Salaried Employee</option>
                <option value="Self-Employed / Business">Self-Employed / Business Owner</option>
                <option value="Job Seeker">Job Seeker / Unemployed</option>
                <option value="Homemaker">Homemaker</option>
                <option value="Senior Citizen">Senior Citizen</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-slate-700">Highest Education Level</label>
              <select
                value={formData.education_level}
                onChange={(e) => setFormData({ ...formData, education_level: e.target.value })}
                className="w-full h-10 rounded-lg border border-slate-300 bg-white px-3 text-sm focus:ring-2 focus:ring-sathya-indigo-500"
              >
                <option value="Primary School">Primary School (Class 1-8)</option>
                <option value="High School">High School (Class 10)</option>
                <option value="Higher Secondary">Higher Secondary (Class 12)</option>
                <option value="Diploma / ITI">Diploma / ITI</option>
                <option value="Undergraduate">Undergraduate Degree</option>
                <option value="Postgraduate / PhD">Postgraduate / PhD</option>
              </select>
            </div>
          </CardContent>
        </Card>

        {/* SECTION 3: Social Category & Special Status Flags */}
        <Card className="space-y-4">
          <CardHeader className="border-b border-slate-100 pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Users className="w-4 h-4 text-sathya-saffron-500" />
              <span>Social Category & Special Eligibility Flags</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6 pt-2">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="block text-sm font-medium text-slate-700">Social Category</label>
                <select
                  value={formData.social_category}
                  onChange={(e) => setFormData({ ...formData, social_category: e.target.value })}
                  className="w-full h-10 rounded-lg border border-slate-300 bg-white px-3 text-sm focus:ring-2 focus:ring-sathya-indigo-500"
                >
                  <option value="General">General</option>
                  <option value="OBC">OBC (Other Backward Classes)</option>
                  <option value="SC">SC (Scheduled Caste)</option>
                  <option value="ST">ST (Scheduled Tribe)</option>
                  <option value="EWS">EWS (Economically Weaker Section)</option>
                </select>
              </div>

              <Input
                label="Family Members Count"
                type="number"
                value={formData.family_members_count}
                onChange={(e) => setFormData({ ...formData, family_members_count: Number(e.target.value) })}
              />
            </div>

            {/* Checkbox Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
              {[
                { key: 'is_student', label: 'Currently Enrolled Student' },
                { key: 'is_farmer', label: 'Landholding Farmer' },
                { key: 'is_business_owner', label: 'Micro-Business Owner' },
                { key: 'is_disabled', label: 'Person with Disability (PwD)' },
                { key: 'is_migrant_worker', label: 'Migrant Worker' },
                { key: 'is_senior_citizen', label: 'Senior Citizen (60+)' },
              ].map(({ key, label }) => (
                <label
                  key={key}
                  className={`flex items-center gap-2 p-3 rounded-lg border cursor-pointer text-xs font-semibold transition-colors ${
                    (formData as any)[key]
                      ? 'bg-sathya-indigo-50 border-sathya-indigo-300 text-sathya-indigo-900'
                      : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={(formData as any)[key]}
                    onChange={(e) => setFormData({ ...formData, [key]: e.target.checked })}
                    className="rounded text-sathya-teal-600 focus:ring-sathya-teal-500"
                  />
                  <span>{label}</span>
                </label>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Submit */}
        <div className="flex justify-end">
          <Button variant="primary" size="lg" type="submit" className="gap-2 px-8" isLoading={updateMutation.isPending}>
            <Save className="w-5 h-5" />
            <span>Save Profile & Refresh Recommendations</span>
          </Button>
        </div>
      </form>
    </div>
  );
}
