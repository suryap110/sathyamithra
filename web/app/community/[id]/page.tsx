'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { HeartHandshake, ArrowLeft, MessageSquare, ShieldCheck, Sparkles, UserCheck, Flag } from 'lucide-react';
import api from '@/lib/api-client';

export default function CommunityQuestionDetailPage() {
  const params = useParams();
  const id = params?.id as string;

  const [question, setQuestion] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [newAnswer, setNewAnswer] = useState<string>('');
  const [submitting, setSubmitting] = useState<boolean>(false);

  useEffect(() => {
    if (id) fetchQuestionDetail();
  }, [id]);

  const fetchQuestionDetail = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/community/questions/${id}`);
      setQuestion(res.data);
    } catch (err) {
      console.error('Failed to fetch question detail', err);
    } finally {
      setLoading(false);
    }
  };

  const handlePostAnswer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAnswer.trim()) return;
    setSubmitting(true);
    try {
      await api.post(`/community/questions/${id}/answers`, { answer: newAnswer });
      setNewAnswer('');
      fetchQuestionDetail();
    } catch (err) {
      console.error('Failed to post answer', err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleReport = async (type: 'QUESTION' | 'ANSWER', targetId: string) => {
    try {
      const endpoint = type === 'QUESTION' ? `/community/questions/${targetId}/report` : `/community/answers/${targetId}/report`;
      await api.post(endpoint, { reason: 'Incorrect information', details: 'Citizen flagged for moderation review' });
      alert('Report submitted for moderation review.');
    } catch (err) {
      console.error('Failed to submit report', err);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-transparent py-12 px-4 text-center text-xs text-slate-400">
        Loading discussion thread...
      </div>
    );
  }

  if (!question) {
    return (
      <div className="min-h-screen bg-transparent py-12 px-4 text-center text-xs text-slate-400">
        Question not found.
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-transparent text-slate-900 dark:text-slate-100 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-6">

        {/* Back Link */}
        <Link href="/community" className="inline-flex items-center gap-1 text-xs font-bold text-slate-600 dark:text-slate-400 hover:text-sathya-teal-600">
          <ArrowLeft className="w-4 h-4" /> Back to Discussions
        </Link>

        {/* Question Header Card */}
        <div className="bg-white/80 dark:bg-slate-900/70 backdrop-blur-md p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-white/10 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-sathya-teal-800 bg-sathya-teal-50 dark:bg-sathya-teal-950/50 dark:text-sathya-teal-300 px-2.5 py-0.5 rounded-full">
              {question.category}
            </span>
            <button
              onClick={() => handleReport('QUESTION', question.id)}
              className="text-xs text-slate-400 hover:text-red-600 flex items-center gap-1"
            >
              <Flag className="w-3.5 h-3.5" /> Report Issue
            </button>
          </div>

          <h1 className="text-xl font-bold text-slate-900 dark:text-white">{question.title}</h1>
          <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-line">{question.question}</p>

          <div className="pt-3 border-t border-slate-100 dark:border-white/10 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
            <span>Posted by <strong className="text-slate-800 dark:text-slate-200">{question.author_name}</strong></span>
            <span>{new Date(question.created_at).toLocaleString()}</span>
          </div>
        </div>

        {/* Disclaimer Banner */}
        <div className="bg-amber-50 p-4 rounded-xl border border-amber-200/60 text-xs text-amber-900 flex items-start gap-2.5">
          <ShieldCheck className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div>
            <span className="font-bold block">OFFICIAL DISCLAIMER</span>
            <span>
              Citizen community answers provide informal peer guidance. Official scheme eligibility is strictly determined by government department rules.
            </span>
          </div>
        </div>

        {/* Answers List */}
        <div className="space-y-4">
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-sathya-teal-600" />
            Answers ({question.answers?.length || 0})
          </h2>

          {question.answers?.length === 0 ? (
            <p className="text-xs text-slate-500 italic py-4">No answers posted yet. Be the first to answer!</p>
          ) : (
            question.answers?.map((ans: any) => (
              <div key={ans.id} className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className={`text-[10px] font-black px-2.5 py-0.5 rounded-md ${
                      ans.author_type === 'OFFICIAL'
                        ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                        : ans.author_type === 'AI_GENERATED'
                        ? 'bg-purple-100 text-purple-800 border border-purple-300'
                        : 'bg-amber-100 text-amber-900 border border-amber-300'
                    }`}>
                      {ans.author_type === 'OFFICIAL'
                        ? 'OFFICIAL INFORMATION'
                        : ans.author_type === 'AI_GENERATED'
                        ? 'AI-GENERATED EXPLANATION'
                        : 'CITIZEN RESPONSE'}
                    </span>
                    <span className="text-xs font-bold text-slate-800">{ans.author_name}</span>
                  </div>
                  <button
                    onClick={() => handleReport('ANSWER', ans.id)}
                    className="text-slate-400 hover:text-red-600 p-1"
                    title="Report Answer"
                  >
                    <Flag className="w-3.5 h-3.5" />
                  </button>
                </div>

                <p className="text-xs text-slate-700 whitespace-pre-line">{ans.answer}</p>

                <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
                  <span>Posted {new Date(ans.created_at).toLocaleDateString()}</span>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Post Answer Form */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-3">
          <h3 className="text-sm font-bold text-slate-900">Your Citizen Answer</h3>
          <form onSubmit={handlePostAnswer} className="space-y-3">
            <textarea
              required
              rows={3}
              placeholder="Share helpful guidance or document preparation advice..."
              value={newAnswer}
              onChange={(e) => setNewAnswer(e.target.value)}
              className="w-full p-3 text-xs border border-slate-300 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-sathya-teal-500"
            />
            <div className="flex justify-end">
              <Button type="submit" variant="primary" disabled={submitting} size="sm">
                {submitting ? 'Posting...' : 'Submit Answer'}
              </Button>
            </div>
          </form>
        </div>

      </div>
    </div>
  );
}
