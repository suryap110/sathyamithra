"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  ArrowLeft, CheckCircle2, FileText, ExternalLink, Share2,
  Bookmark, BookmarkCheck, ChevronDown, ChevronUp,
  MapPin, Building2, Tag, Sparkles, AlertCircle, Copy, Check,
  Database, ListOrdered, HelpCircle, Clock, ShieldCheck, Plus
} from "lucide-react";
import { ALL_SCHEMES, CATEGORIES, normalizeCategory, type Scheme } from "@/lib/schemes-data";
import { apiClient } from "@/lib/api-client";
import { useAuth } from "@/lib/auth-context";

const CAT_COLOR: Record<string, string> = {
  green: "bg-green-100 text-green-700 dark:bg-emerald-950/40 dark:text-emerald-300",
  blue: "bg-blue-100 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300",
  purple: "bg-purple-100 text-purple-700 dark:bg-purple-950/40 dark:text-purple-300",
  indigo: "bg-indigo-100 text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-300",
  red: "bg-red-100 text-red-700 dark:bg-red-950/40 dark:text-red-300",
  orange: "bg-orange-100 text-orange-700 dark:bg-orange-950/40 dark:text-orange-300",
  slate: "bg-slate-100 text-slate-700 dark:bg-slate-900/40 dark:text-slate-300",
  cyan: "bg-cyan-100 text-cyan-700 dark:bg-cyan-950/40 dark:text-cyan-300",
  yellow: "bg-yellow-100 text-yellow-700 dark:bg-yellow-950/40 dark:text-yellow-300",
  pink: "bg-pink-100 text-pink-700 dark:bg-pink-950/40 dark:text-pink-300",
  amber: "bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300",
  teal: "bg-teal-100 text-teal-700 dark:bg-teal-950/40 dark:text-teal-300",
  sky: "bg-sky-100 text-sky-700 dark:bg-sky-950/40 dark:text-sky-300",
  rose: "bg-rose-100 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300",
  stone: "bg-stone-100 text-stone-700 dark:bg-stone-900/40 dark:text-stone-300",
};

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start gap-3 py-3 border-b border-gray-100 dark:border-white/5 last:border-0">
      <span className="text-xs font-bold text-gray-500 dark:text-gray-400 w-32 shrink-0 mt-0.5">{label}</span>
      <span className="text-sm text-gray-800 dark:text-gray-200 flex-1">{value}</span>
    </div>
  );
}

export default function SchemeDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const id = typeof params?.id === "string" ? params.id : Array.isArray(params?.id) ? params.id[0] : "";

  const [scheme, setScheme] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isFromDb, setIsFromDb] = useState(false);
  const [saved, setSaved] = useState(false);
  const [copied, setCopied] = useState(false);
  const [expandEligibility, setExpandEligibility] = useState(true);
  const [expandDocs, setExpandDocs] = useState(true);
  const [expandSteps, setExpandSteps] = useState(true);
  const [expandFaqs, setExpandFaqs] = useState(false);

  // Application tracker action state
  const [tracking, setTracking] = useState(false);
  const [trackedRef, setTrackedRef] = useState<string | null>(null);

  useEffect(() => {
    const fetchScheme = async () => {
      setLoading(true);
      try {
        const res = await apiClient.get(`/schemes/${id}`);
        if (res.data) {
          const s = res.data;
          setScheme({
            id: s.id,
            name: s.title,
            ministry: s.ministry || "Government of India",
            category: normalizeCategory(s.category?.slug || s.category || s.category_id),
            state: s.state || "Central Government",
            benefit: s.benefit_type || "Direct Benefit",
            benefitAmount: s.benefit_summary || (s.estimated_benefit_amount ? `₹${s.estimated_benefit_amount.toLocaleString("en-IN")}` : undefined),
            description: s.detailed_description || s.short_description,
            eligibility: s.eligibility_rules && s.eligibility_rules.length > 0
              ? s.eligibility_rules.map((r: any) => r.rule_explanation || "Standard criteria")
              : ["Indian citizen meeting demographic guidelines"],
            documents: s.required_documents && s.required_documents.length > 0
              ? s.required_documents.map((d: any) => d.document_type)
              : ["Aadhaar Card", "Bank Passbook"],
            steps: s.application_steps || [],
            faqs: s.faqs || [],
            applicationUrl: s.official_url || "https://myscheme.gov.in",
            tags: [normalizeCategory(s.category?.slug || s.category_id), s.state, s.benefit_type].filter(Boolean) as string[],
          });
          setIsFromDb(true);
          setLoading(false);
          return;
        }
      } catch (err) {
        console.warn("Could not load scheme from database, checking local catalog", err);
      }

      // Local fallback
      const local = ALL_SCHEMES.find(s => s.id === id);
      if (local) {
        setScheme(local);
        setIsFromDb(false);
      }
      setLoading(false);
    };

    if (id) fetchScheme();
  }, [id]);

  const cat = scheme ? CATEGORIES.find(c => c.id === normalizeCategory(scheme.category)) : null;
  const colorCls = cat ? (CAT_COLOR[cat.color] || "bg-gray-100 text-gray-700") : "bg-gray-100 text-gray-700";

  const handleCopy = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleTrackApplication = async () => {
    if (!user) {
      router.push("/login?redirect=/schemes/" + id);
      return;
    }
    setTracking(true);
    try {
      const res = await apiClient.post("/applications", {
        scheme_id: scheme.id,
        notes: `Application started for ${scheme.name}`
      });
      setTrackedRef(res.data.reference_number);
    } catch (err: any) {
      alert(err.response?.data?.detail || "Could not track application.");
    } finally {
      setTracking(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-3 text-center px-4">
        <div className="w-8 h-8 border-3 border-emerald-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-sm font-semibold text-gray-500 dark:text-gray-400">Loading scheme from database…</p>
      </div>
    );
  }

  if (!scheme) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 text-center px-4">
        <AlertCircle className="w-16 h-16 text-red-400" />
        <h2 className="text-2xl font-extrabold text-gray-800 dark:text-gray-200">Scheme not found</h2>
        <p className="text-gray-500 text-sm max-w-sm">This scheme may have been archived or the ID is incorrect.</p>
        <Link href="/schemes" className="flex items-center gap-2 px-5 py-2.5 text-sm font-bold text-white bg-emerald-600 rounded-full hover:bg-emerald-700 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back to All Schemes
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-transparent">
      {/* Breadcrumb */}
      <div className="border-b border-gray-200/40 dark:border-white/5 backdrop-blur-md">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
          <Link href="/" className="hover:text-emerald-500 transition-colors">Home</Link>
          <span>/</span>
          <Link href="/schemes" className="hover:text-emerald-500 transition-colors">Schemes</Link>
          <span>/</span>
          <span className="text-gray-800 dark:text-gray-200 font-medium truncate max-w-xs">{scheme.name}</span>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* ─── LEFT: Main Content ──────────────────────── */}
          <div className="lg:col-span-2 space-y-6">

            {/* Back button */}
            <motion.button initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
              onClick={() => router.back()}
              className="flex items-center gap-2 text-sm font-semibold text-gray-600 dark:text-gray-400 hover:text-emerald-500 transition-colors">
              <ArrowLeft className="w-4 h-4" /> Back to Schemes
            </motion.button>

            {/* Hero card */}
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}
              className="bg-white/80 dark:bg-slate-900/60 backdrop-blur-md rounded-2xl border border-gray-200 dark:border-white/10 overflow-hidden shadow-sm">
              <div className="h-2 bg-gradient-to-r from-emerald-500 to-teal-700" />
              <div className="p-6">
                <div className="flex flex-wrap items-center gap-2 mb-3">
                  <span className={"text-xs font-semibold px-2.5 py-0.5 rounded-full " + colorCls}>
                    {cat?.label || scheme.category}
                  </span>
                  <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-300">
                    {scheme.state || "Central"}
                  </span>
                  <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
                    <ShieldCheck className="w-3 h-3 text-emerald-500" /> Official Scheme
                  </span>
                </div>

                <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-gray-100 leading-tight mb-2">
                  {scheme.name}
                </h1>
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">{scheme.ministry}</p>
                <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-line">{scheme.description}</p>
              </div>
            </motion.div>

            {/* Benefit Amount */}
            {scheme.benefitAmount && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
                className="bg-gradient-to-r from-emerald-600 to-teal-700 rounded-2xl p-5 text-white shadow-md">
                <p className="text-emerald-100 text-xs font-semibold uppercase tracking-wide mb-1">Financial Benefit</p>
                <p className="text-3xl font-extrabold">{scheme.benefitAmount}</p>
                <p className="text-emerald-200 text-xs mt-1">{scheme.benefit}</p>
              </motion.div>
            )}

            {/* Eligibility Criteria */}
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
              className="bg-white/80 dark:bg-slate-900/60 backdrop-blur-md rounded-2xl border border-gray-200 dark:border-white/10 overflow-hidden shadow-sm">
              <button onClick={() => setExpandEligibility(!expandEligibility)}
                className="w-full flex items-center justify-between px-6 py-4 text-left hover:bg-gray-50 dark:hover:bg-slate-800/50 transition-colors">
                <h2 className="text-base font-extrabold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-emerald-500" /> Eligibility Criteria
                </h2>
                {expandEligibility ? <ChevronUp className="w-5 h-5 text-gray-400" /> : <ChevronDown className="w-5 h-5 text-gray-400" />}
              </button>
              {expandEligibility && (
                <div className="px-6 pb-6">
                  <div className="space-y-2">
                    {scheme.eligibility.map((item: string, i: number) => (
                      <div key={i} className="flex items-start gap-3 p-3 bg-emerald-50/50 dark:bg-emerald-950/20 rounded-xl border border-emerald-100 dark:border-emerald-800/30">
                        <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                        <span className="text-sm text-gray-700 dark:text-gray-300">{item}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>

            {/* Documents Required */}
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
              className="bg-white/80 dark:bg-slate-900/60 backdrop-blur-md rounded-2xl border border-gray-200 dark:border-white/10 overflow-hidden shadow-sm">
              <button onClick={() => setExpandDocs(!expandDocs)}
                className="w-full flex items-center justify-between px-6 py-4 text-left hover:bg-gray-50 dark:hover:bg-slate-800/50 transition-colors">
                <h2 className="text-base font-extrabold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                  <FileText className="w-5 h-5 text-blue-500" /> Documents Required
                  <span className="text-xs font-semibold bg-blue-100 dark:bg-blue-950 text-blue-600 dark:text-blue-300 px-2 py-0.5 rounded-full">{scheme.documents.length}</span>
                </h2>
                {expandDocs ? <ChevronUp className="w-5 h-5 text-gray-400" /> : <ChevronDown className="w-5 h-5 text-gray-400" />}
              </button>
              {expandDocs && (
                <div className="px-6 pb-6 grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {scheme.documents.map((doc: string, i: number) => (
                    <div key={i} className="flex items-center gap-2.5 p-3 border border-gray-100 dark:border-white/5 rounded-xl bg-gray-50 dark:bg-slate-800/50">
                      <FileText className="w-4 h-4 text-blue-500 shrink-0" />
                      <span className="text-xs text-gray-700 dark:text-gray-300 font-medium">{doc}</span>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>

            {/* Application Steps */}
            {scheme.steps && scheme.steps.length > 0 && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.22 }}
                className="bg-white/80 dark:bg-slate-900/60 backdrop-blur-md rounded-2xl border border-gray-200 dark:border-white/10 overflow-hidden shadow-sm">
                <button onClick={() => setExpandSteps(!expandSteps)}
                  className="w-full flex items-center justify-between px-6 py-4 text-left hover:bg-gray-50 dark:hover:bg-slate-800/50 transition-colors">
                  <h2 className="text-base font-extrabold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                    <ListOrdered className="w-5 h-5 text-amber-500" /> Step-by-Step Application Process
                  </h2>
                  {expandSteps ? <ChevronUp className="w-5 h-5 text-gray-400" /> : <ChevronDown className="w-5 h-5 text-gray-400" />}
                </button>
                {expandSteps && (
                  <div className="px-6 pb-6 space-y-3">
                    {scheme.steps.map((st: any, idx: number) => (
                      <div key={idx} className="flex items-start gap-3 p-3.5 rounded-xl border border-gray-100 dark:border-white/5 bg-gray-50/50 dark:bg-slate-800/30">
                        <div className="w-7 h-7 rounded-full bg-amber-500 text-white flex items-center justify-center font-bold text-xs shrink-0">
                          {st.step_number || idx + 1}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="text-sm font-bold text-gray-900 dark:text-gray-100">{st.title}</h4>
                          <p className="text-xs text-gray-600 dark:text-gray-300 mt-0.5 leading-relaxed">{st.description}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </motion.div>
            )}

            {/* Scheme FAQs */}
            {scheme.faqs && scheme.faqs.length > 0 && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.24 }}
                className="bg-white/80 dark:bg-slate-900/60 backdrop-blur-md rounded-2xl border border-gray-200 dark:border-white/10 overflow-hidden shadow-sm">
                <button onClick={() => setExpandFaqs(!expandFaqs)}
                  className="w-full flex items-center justify-between px-6 py-4 text-left hover:bg-gray-50 dark:hover:bg-slate-800/50 transition-colors">
                  <h2 className="text-base font-extrabold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                    <HelpCircle className="w-5 h-5 text-teal-500" /> Frequently Asked Questions
                  </h2>
                  {expandFaqs ? <ChevronUp className="w-5 h-5 text-gray-400" /> : <ChevronDown className="w-5 h-5 text-gray-400" />}
                </button>
                {expandFaqs && (
                  <div className="px-6 pb-6 space-y-3">
                    {scheme.faqs.map((faq: any, idx: number) => (
                      <div key={idx} className="p-3.5 rounded-xl border border-gray-100 dark:border-white/5 bg-gray-50/50 dark:bg-slate-800/30">
                        <h4 className="text-xs font-bold text-gray-900 dark:text-gray-100">{faq.question}</h4>
                        <p className="text-xs text-gray-600 dark:text-gray-300 mt-1 leading-relaxed">{faq.answer}</p>
                      </div>
                    ))}
                  </div>
                )}
              </motion.div>
            )}

            {/* Metadata Info Table */}
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.26 }}
              className="bg-white/80 dark:bg-slate-900/60 backdrop-blur-md rounded-2xl border border-gray-200 dark:border-white/10 p-6 shadow-sm">
              <h2 className="text-base font-extrabold text-gray-900 dark:text-gray-100 mb-4">Official Identification</h2>
              <InfoRow label="Ministry" value={scheme.ministry} />
              <InfoRow label="Category" value={cat?.label || scheme.category} />
              <InfoRow label="Jurisdiction" value={scheme.state || "Central Government"} />
              <InfoRow label="System Scheme ID" value={scheme.id} />
            </motion.div>
          </div>

          {/* ─── RIGHT: Sidebar ─────────────────────────── */}
          <div className="space-y-5">

            {/* Application & Action Hub */}
            <motion.div initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }}
              className="bg-emerald-600 rounded-2xl p-6 text-white sticky top-20 shadow-lg">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 text-xs font-semibold mb-3">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Verified Welfare Program</span>
              </div>
              <h3 className="font-extrabold text-xl mb-1">Apply & Track Status</h3>
              <p className="text-emerald-100 text-xs mb-5 leading-relaxed">
                Add this scheme to your citizen dashboard tracker or apply directly on the government portal.
              </p>

              {/* Action Buttons */}
              <div className="space-y-2.5">
                {/* Track Application Button */}
                {trackedRef ? (
                  <div className="p-3 bg-white/20 border border-white/40 rounded-xl text-center">
                    <p className="text-xs font-bold text-white flex items-center justify-center gap-1">
                      <CheckCircle2 className="w-4 h-4 text-emerald-300" /> Application Tracked!
                    </p>
                    <p className="text-[11px] text-emerald-100 mt-0.5">Ref: {trackedRef}</p>
                    <Link href="/applications" className="mt-2 inline-block text-xs font-bold text-white underline">
                      View in Application Tracker →
                    </Link>
                  </div>
                ) : (
                  <button
                    onClick={handleTrackApplication}
                    disabled={tracking}
                    className="flex items-center justify-center gap-2 w-full px-4 py-3.5 text-sm font-bold text-emerald-800 bg-white rounded-xl hover:bg-emerald-50 transition-all shadow-md active:scale-95 disabled:opacity-50"
                  >
                    {tracking ? (
                      <span>Saving Application…</span>
                    ) : (
                      <>
                        <Plus className="w-4 h-4" /> Track in My Applications
                      </>
                    )}
                  </button>
                )}

                {/* Eligibility Check Link */}
                <Link href="/find-scheme"
                  className="flex items-center justify-center gap-2 w-full px-4 py-3 text-xs font-bold text-white bg-white/15 border border-white/30 rounded-xl hover:bg-white/25 transition-colors">
                  <Sparkles className="w-3.5 h-3.5 text-amber-300" /> Check Detailed Eligibility
                </Link>

                {/* Official Application Portal */}
                {scheme.applicationUrl && (
                  <a href={scheme.applicationUrl} target="_blank" rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 w-full px-4 py-3 text-xs font-bold text-white bg-white/10 border border-white/20 rounded-xl hover:bg-white/20 transition-colors">
                    <ExternalLink className="w-3.5 h-3.5" /> Official Government Portal
                  </a>
                )}
              </div>

              {/* Share and copy */}
              <div className="mt-5 pt-4 border-t border-white/20 flex items-center justify-between text-xs">
                <button onClick={handleCopy} className="flex items-center gap-1 text-emerald-100 hover:text-white transition-colors">
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-200" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? "Link Copied!" : "Share Scheme"}</span>
                </button>
                <Link href="/assistant" className="text-emerald-100 hover:text-white transition-colors flex items-center gap-1">
                  <span>Ask AI Help →</span>
                </Link>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}
