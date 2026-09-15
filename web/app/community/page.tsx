'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { HeartHandshake, MessageSquare, Plus, Search, ShieldCheck, MapPin, Tag } from 'lucide-react';
import api from '@/lib/api-client';

export default function CommunityPage() {
  const [questions, setQuestions] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchCategory, setSearchCategory] = useState<string>('');
  const [searchState, setSearchState] = useState<string>('');
  const [showAskModal, setShowAskModal] = useState<boolean>(false);

  // Form state
  const [title, setTitle] = useState<string>('');
  const [question, setQuestion] = useState<string>('');
  const [category, setCategory] = useState<string>('Education');
  const [state, setState] = useState<string>('Tamil Nadu');
  const [district, setDistrict] = useState<string>('Chennai');

  useEffect(() => {
    fetchQuestions();
  }, [searchCategory, searchState]);

  const fetchQuestions = async () => {
    setLoading(true);
    try {
      let query = '/community/questions?';
      if (searchCategory) query += `category=${encodeURIComponent(searchCategory)}&`;
      if (searchState) query += `state=${encodeURIComponent(searchState)}&`;

      const res = await api.get(query);
      setQuestions(res.data);
    } catch (err) {
      console.error('Failed to fetch community questions', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAskQuestion = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/community/questions', {
        title,
        question,
        category,
        state,
        district
      });
      setShowAskModal(false);
      setTitle('');
      setQuestion('');
      fetchQuestions();
    } catch (err) {
      console.error('Failed to post community question', err);
    }
  };

  return (
    <div className="min-h-screen bg-transparent text-slate-900 dark:text-slate-100 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">

        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white/80 dark:bg-slate-900/70 backdrop-blur-md p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-white/10">
          <div>
            <h1 className="text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2">
              <HeartHandshake className="w-6 h-6 text-sathya-indigo-700" />
              CITIZEN COMMUNITY & DISCUSSIONS
            </h1>
            <p className="text-sm text-slate-600 dark:text-slate-300 mt-1">
              Ask questions, exchange application guidance, and share local scheme experiences with fellow citizens.
            </p>
          </div>
          <Button variant="primary" onClick={() => setShowAskModal(true)} className="gap-2 text-xs">
            <Plus className="w-4 h-4" />
            Ask Community Question
          </Button>
        </div>

        {/* Search & Filter Bar */}
        <div className="bg-white/80 dark:bg-slate-900/70 backdrop-blur-md p-4 rounded-xl shadow-2xs border border-slate-200 dark:border-white/10 flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 flex-1 min-w-[200px] border border-slate-300 dark:border-slate-700 dark:bg-slate-800/80 rounded-lg px-3 py-1.5 text-xs">
            <Tag className="w-3.5 h-3.5 text-slate-400" />
            <input
              type="text"
              placeholder="Filter by Category (e.g. Education, Agriculture)"
              value={searchCategory}
              onChange={(e) => setSearchCategory(e.target.value)}
              className="w-full focus:outline-hidden dark:text-white bg-transparent"
            />
          </div>
          <div className="flex items-center gap-2 flex-1 min-w-[200px] border border-slate-300 dark:border-slate-700 dark:bg-slate-800/80 rounded-lg px-3 py-1.5 text-xs">
            <MapPin className="w-3.5 h-3.5 text-slate-400" />
            <input
              type="text"
              placeholder="Filter by State (e.g. Tamil Nadu, Delhi)"
              value={searchState}
              onChange={(e) => setSearchState(e.target.value)}
              className="w-full focus:outline-hidden dark:text-white bg-transparent"
            />
          </div>
        </div>

        {/* Question Feed */}
        <div className="space-y-4">
          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((n) => (
                <div key={n} className="h-32 bg-white/60 dark:bg-slate-900/50 backdrop-blur-md rounded-xl animate-pulse border border-slate-200 dark:border-white/10" />
              ))}
            </div>
          ) : questions.length === 0 ? (
            <div className="bg-white/80 dark:bg-slate-900/70 backdrop-blur-md rounded-2xl p-8 text-center border border-slate-200 dark:border-white/10">
              <MessageSquare className="w-12 h-12 text-slate-300 mx-auto mb-2" />
              <h3 className="text-sm font-bold text-slate-800 dark:text-white">No Community Discussions Yet</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 mb-4">Be the first citizen to start a discussion in this section.</p>
              <Button variant="primary" size="sm" onClick={() => setShowAskModal(true)} className="gap-2">
                <Plus className="w-4 h-4" /> Ask First Question
              </Button>
            </div>
          ) : (
            questions.map((q) => (
              <div key={q.id} className="bg-white/80 dark:bg-slate-900/70 backdrop-blur-md p-5 rounded-2xl border border-slate-200 dark:border-white/10 shadow-2xs hover:border-sathya-teal-500 transition-colors space-y-3">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2 mb-1.5">
                      <span className="text-[11px] font-bold text-sathya-teal-800 bg-sathya-teal-50 px-2.5 py-0.5 rounded-full">
                        {q.category}
                      </span>
                      {q.state && (
                        <span className="text-[11px] font-semibold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-full">
                          📍 {q.district ? `${q.district}, ` : ''}{q.state}
                        </span>
                      )}
                    </div>
                    <Link href={`/community/${q.id}`}>
                      <h3 className="text-sm font-bold text-slate-900 hover:text-sathya-teal-700 transition-colors">
                        {q.title}
                      </h3>
                    </Link>
                    <p className="text-xs text-slate-600 line-clamp-2 mt-1">{q.question}</p>
                  </div>
                </div>

                {q.ai_summary_disclaimer && (
                  <p className="text-[11px] text-amber-800 bg-amber-50/70 p-2 rounded-lg border border-amber-200/50">
                    ℹ {q.ai_summary_disclaimer}
                  </p>
                )}

                <div className="flex items-center justify-between border-t border-slate-100 pt-3 text-xs text-slate-500">
                  <span>Asked by <strong className="text-slate-700">{q.author_name}</strong> • {new Date(q.created_at).toLocaleDateString()}</span>
                  <Link href={`/community/${q.id}`} className="font-bold text-sathya-indigo-900 hover:underline flex items-center gap-1">
                    <MessageSquare className="w-3.5 h-3.5 text-sathya-teal-600" />
                    {q.answers_count} Answers
                  </Link>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Ask Question Modal */}
        {showAskModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
            <div className="bg-white rounded-2xl shadow-xl max-w-lg w-full p-6 border border-slate-200 space-y-4">
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <HeartHandshake className="w-5 h-5 text-sathya-indigo-700" />
                Ask a Community Question
              </h2>

              <form onSubmit={handleAskQuestion} className="space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Title</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Has anyone applied for this student scholarship in Chennai?"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-sathya-teal-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Details / Question</label>
                  <textarea
                    required
                    rows={4}
                    placeholder="Explain your scenario, document doubts, or application steps..."
                    value={question}
                    onChange={(e) => setQuestion(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-sathya-teal-500"
                  />
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Category</label>
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      className="w-full p-2 text-xs border border-slate-300 rounded-lg"
                    >
                      <option>Education</option>
                      <option>Agriculture</option>
                      <option>Healthcare</option>
                      <option>Women Support</option>
                      <option>Business</option>
                      <option>General</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">State</label>
                    <input
                      type="text"
                      value={state}
                      onChange={(e) => setState(e.target.value)}
                      className="w-full p-2 text-xs border border-slate-300 rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">District</label>
                    <input
                      type="text"
                      value={district}
                      onChange={(e) => setDistrict(e.target.value)}
                      className="w-full p-2 text-xs border border-slate-300 rounded-lg"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                  <Button type="button" variant="outline" size="sm" onClick={() => setShowAskModal(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" variant="primary" size="sm">
                    Post Question
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
