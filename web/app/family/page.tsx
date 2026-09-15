'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { 
  Users, 
  Plus, 
  Trash2, 
  Sparkles, 
  ShieldCheck, 
  Calculator, 
  UserCheck, 
  ArrowRight,
  User,
  Heart
} from 'lucide-react';
import api from '@/lib/api-client';

export default function FamilyPage() {
  const [members, setMembers] = useState<any[]>([]);
  const [recommendations, setRecommendations] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [showAddModal, setShowAddModal] = useState<boolean>(false);

  // Form state
  const [name, setName] = useState('');
  const [relationship, setRelationship] = useState('Parent');
  const [age, setAge] = useState<number | ''>(45);
  const [gender, setGender] = useState('Male');
  const [occupation, setOccupation] = useState('Farmer');
  const [annualIncome, setAnnualIncome] = useState<number | ''>(150000);
  const [isFarmer, setIsFarmer] = useState(false);
  const [isStudent, setIsStudent] = useState(false);
  const [isSenior, setIsSenior] = useState(false);
  const [state, setState] = useState('Tamil Nadu');
  const [district, setDistrict] = useState('Chennai');

  useEffect(() => {
    fetchFamilyData();
  }, []);

  const fetchFamilyData = async () => {
    setLoading(true);
    try {
      const resMembers = await api.get('/family/members');
      setMembers(resMembers.data);

      const resRecs = await api.get('/family/recommendations');
      setRecommendations(resRecs.data.member_recommendations || []);
    } catch (err) {
      console.error('Failed to load family data', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddMember = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/family/members', {
        name,
        relationship,
        age: Number(age),
        gender,
        occupation,
        annual_income: Number(annualIncome),
        is_farmer: isFarmer,
        is_student: isStudent,
        is_senior_citizen: isSenior,
        state,
        district
      });
      setShowAddModal(false);
      // Reset form
      setName('');
      fetchFamilyData();
    } catch (err) {
      console.error('Failed to add family member', err);
    }
  };

  const handleDeleteMember = async (id: string) => {
    if (!confirm('Are you sure you want to remove this family member profile?')) return;
    try {
      await api.delete(`/family/members/${id}`);
      fetchFamilyData();
    } catch (err) {
      console.error('Failed to delete member', err);
    }
  };

  return (
    <div className="min-h-screen bg-transparent text-slate-900 dark:text-slate-100 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">

        {/* Page Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white/80 dark:bg-slate-900/70 backdrop-blur-md p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-white/10">
          <div>
            <h1 className="text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2">
              <Users className="w-6 h-6 text-sathya-teal-600" />
              MY FAMILY
            </h1>
            <p className="text-sm text-slate-600 dark:text-slate-300 mt-1">
              Manage family member profiles and discover personalized government welfare schemes for every dependent.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/family/benefits">
              <Button variant="outline" className="gap-2 text-xs">
                <Calculator className="w-4 h-4 text-sathya-indigo-700" />
                Benefit Planner
              </Button>
            </Link>
            <Button variant="primary" onClick={() => setShowAddModal(true)} className="gap-2 text-xs">
              <Plus className="w-4 h-4" />
              Add Family Member
            </Button>
          </div>
        </div>

        {/* Family Member Cards Grid */}
        <div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
            <UserCheck className="w-5 h-5 text-sathya-saffron-500" />
            Family Members ({members.length})
          </h2>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[1, 2, 3].map((n) => (
                <div key={n} className="h-40 bg-white/60 dark:bg-slate-900/50 backdrop-blur-md rounded-xl animate-pulse border border-slate-200 dark:border-white/10" />
              ))}
            </div>
          ) : members.length === 0 ? (
            <div className="bg-white/80 dark:bg-slate-900/70 backdrop-blur-md rounded-2xl p-8 text-center border border-slate-200 dark:border-white/10">
              <Users className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <h3 className="text-sm font-bold text-slate-800 dark:text-white">No Family Members Added Yet</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto mt-1 mb-4">
                Add your parents, spouse, children, or dependents to evaluate household welfare entitlements together.
              </p>
              <Button variant="primary" size="sm" onClick={() => setShowAddModal(true)} className="gap-2">
                <Plus className="w-4 h-4" />
                Add First Family Member
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {members.map((m) => (
                <div key={m.id} className="bg-white/80 dark:bg-slate-900/70 backdrop-blur-md rounded-xl p-5 shadow-sm border border-slate-200 dark:border-white/10 hover:border-sathya-teal-500 transition-colors flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-3">
                      <div className="flex items-center gap-2">
                        <div className="w-9 h-9 rounded-full bg-sathya-teal-50 text-sathya-teal-700 flex items-center justify-center font-bold text-sm">
                          {m.name.charAt(0)}
                        </div>
                        <div>
                          <h3 className="text-sm font-bold text-slate-900">{m.name}</h3>
                          <span className="text-[11px] font-semibold text-sathya-saffron-600 bg-sathya-saffron-50 px-2 py-0.5 rounded-md">
                            {m.relationship}
                          </span>
                        </div>
                      </div>
                      <button
                        onClick={() => handleDeleteMember(m.id)}
                        className="text-slate-400 hover:text-red-600 transition-colors p-1"
                        title="Delete Member"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="space-y-1.5 text-xs text-slate-600 mb-4">
                      <p>• <span className="font-semibold">{m.age || 'N/A'} years</span> • {m.gender || 'Not specified'}</p>
                      <p>• <span className="font-semibold">{m.occupation || 'Homemaker/Other'}</span></p>
                      <p>• Annual Income: <span className="font-semibold">₹{m.annual_income?.toLocaleString() || '0'}</span></p>
                      <p>• Location: <span className="font-semibold">{m.district}, {m.state}</span></p>
                    </div>
                  </div>

                  <Link href={`/schemes?search=${encodeURIComponent(m.relationship)}`}>
                    <Button variant="outline" size="sm" className="w-full text-xs gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-sathya-teal-600" />
                      Find Schemes for {m.name.split(' ')[0]}
                    </Button>
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Member Recommendations List */}
        {recommendations.length > 0 && (
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 space-y-6">
            <div className="border-b border-slate-100 pb-4">
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-sathya-teal-600" />
                FAMILY SCHEME MATCHES
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Proactive eligibility matches identified per family member profile.
              </p>
            </div>

            <div className="space-y-6">
              {recommendations.map((rec) => (
                <div key={rec.member_id} className="border border-slate-100 rounded-xl p-4 bg-slate-50/50">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                      <User className="w-4 h-4 text-sathya-teal-600" />
                      {rec.member_name} ({rec.relationship})
                    </h3>
                    <span className="text-xs font-bold text-sathya-teal-700 bg-sathya-teal-50 px-2.5 py-1 rounded-full">
                      {rec.matches_count} Eligible Schemes Found
                    </span>
                  </div>

                  {rec.matches.length === 0 ? (
                    <p className="text-xs text-slate-500 italic">No scheme matches for this member yet.</p>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {rec.matches.map((m: any) => (
                        <div key={m.scheme.id} className="bg-white p-3.5 rounded-lg border border-slate-200 shadow-2xs flex flex-col justify-between">
                          <div>
                            <div className="flex items-center justify-between gap-2 mb-1">
                              <h4 className="text-xs font-bold text-slate-900 line-clamp-1">{m.scheme.title}</h4>
                              <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                                {m.match_percentage}% Match
                              </span>
                            </div>
                            <p className="text-[11px] text-slate-500 line-clamp-2">{m.scheme.short_description}</p>
                          </div>
                          <div className="mt-3 flex items-center justify-between text-[11px]">
                            <span className="font-semibold text-slate-700">
                              ₹{m.scheme.estimated_benefit_amount?.toLocaleString() || 'N/A'}
                            </span>
                            <Link href={`/schemes/${m.scheme.id}`} className="text-sathya-indigo-900 font-bold hover:underline flex items-center gap-0.5">
                              View <ArrowRight className="w-3 h-3" />
                            </Link>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Add Member Modal */}
        {showAddModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
            <div className="bg-white rounded-2xl shadow-xl max-w-lg w-full p-6 max-h-[90vh] overflow-y-auto border border-slate-200">
              <h2 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                <Users className="w-5 h-5 text-sathya-teal-600" />
                Add Family Member
              </h2>

              <form onSubmit={handleAddMember} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Full Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Ramesh Kumar"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-sathya-teal-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Relationship</label>
                    <select
                      value={relationship}
                      onChange={(e) => setRelationship(e.target.value)}
                      className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg"
                    >
                      <option>Parent</option>
                      <option>Spouse</option>
                      <option>Child</option>
                      <option>Grandparent</option>
                      <option>Sibling</option>
                      <option>Other dependent</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Age</label>
                    <input
                      type="number"
                      value={age}
                      onChange={(e) => setAge(e.target.value ? Number(e.target.value) : '')}
                      className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Occupation</label>
                    <input
                      type="text"
                      placeholder="e.g. Farmer, Student, Employee"
                      value={occupation}
                      onChange={(e) => setOccupation(e.target.value)}
                      className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Annual Income (₹)</label>
                    <input
                      type="number"
                      value={annualIncome}
                      onChange={(e) => setAnnualIncome(e.target.value ? Number(e.target.value) : '')}
                      className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">State</label>
                    <input
                      type="text"
                      value={state}
                      onChange={(e) => setState(e.target.value)}
                      className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">District</label>
                    <input
                      type="text"
                      value={district}
                      onChange={(e) => setDistrict(e.target.value)}
                      className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg"
                    />
                  </div>
                </div>

                <div className="space-y-2 pt-2 border-t border-slate-100">
                  <span className="block text-xs font-semibold text-slate-700">Category Badges</span>
                  <div className="flex flex-wrap gap-4 text-xs">
                    <label className="flex items-center gap-1.5">
                      <input type="checkbox" checked={isFarmer} onChange={(e) => setIsFarmer(e.target.checked)} />
                      Farmer
                    </label>
                    <label className="flex items-center gap-1.5">
                      <input type="checkbox" checked={isStudent} onChange={(e) => setIsStudent(e.target.checked)} />
                      Student
                    </label>
                    <label className="flex items-center gap-1.5">
                      <input type="checkbox" checked={isSenior} onChange={(e) => setIsSenior(e.target.checked)} />
                      Senior Citizen
                    </label>
                  </div>
                </div>

                <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                  <Button type="button" variant="outline" size="sm" onClick={() => setShowAddModal(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" variant="primary" size="sm">
                    Save Profile
                  </Button>
                </div>
              </form>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
