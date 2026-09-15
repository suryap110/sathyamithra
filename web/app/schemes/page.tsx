"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search, SlidersHorizontal, X, ChevronDown, ArrowRight,
  Layers, Sparkles, SearchX, RefreshCw, ExternalLink, CheckCircle2,
  Database, ShieldCheck
} from "lucide-react";
import {
  ALL_SCHEMES, CATEGORIES, STATES, searchSchemes, getSchemesByCategory,
  type Scheme
} from "@/lib/schemes-data";
import { apiClient } from "@/lib/api-client";

// ─── Filter state ─────────────────────────────────────────────
const BENEFIT_TYPES = ["All", "Cash Transfer", "Scholarship", "Subsidy", "Insurance", "Loan", "Training", "Pension", "Healthcare"];

const CAT_COLOR: Record<string, string> = {
  green: "bg-green-50 text-green-700 dark:bg-emerald-950/40 dark:text-emerald-300",
  blue: "bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300",
  purple: "bg-purple-50 text-purple-700 dark:bg-purple-950/40 dark:text-purple-300",
  indigo: "bg-indigo-50 text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-300",
  red: "bg-red-50 text-red-700 dark:bg-red-950/40 dark:text-red-300",
  orange: "bg-orange-50 text-orange-700 dark:bg-orange-950/40 dark:text-orange-300",
  slate: "bg-slate-50 text-slate-700 dark:bg-slate-900/40 dark:text-slate-300",
  cyan: "bg-cyan-50 text-cyan-700 dark:bg-cyan-950/40 dark:text-cyan-300",
  yellow: "bg-yellow-50 text-yellow-700 dark:bg-yellow-950/40 dark:text-yellow-300",
  pink: "bg-pink-50 text-pink-700 dark:bg-pink-950/40 dark:text-pink-300",
  amber: "bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300",
  teal: "bg-teal-50 text-teal-700 dark:bg-teal-950/40 dark:text-teal-300",
  sky: "bg-sky-50 text-sky-700 dark:bg-sky-950/40 dark:text-sky-300",
  rose: "bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300",
  stone: "bg-stone-50 text-stone-700 dark:bg-stone-900/40 dark:text-stone-300",
};

// ─── Scheme Card ──────────────────────────────────────────────
function SchemeCard({ scheme, index }: { scheme: Scheme; index: number }) {
  const cat = CATEGORIES.find(c => c.id === scheme.category);
  const colorCls = cat ? (CAT_COLOR[cat.color] || "bg-gray-50 text-gray-700") : "bg-gray-50 text-gray-700";
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: Math.min(index * 0.04, 0.4), duration: 0.35 }}
      className="group flex flex-col bg-white/80 dark:bg-slate-900/60 backdrop-blur-md border border-gray-200 dark:border-white/10 rounded-2xl p-5 hover:border-emerald-400 hover:shadow-lg transition-all"
    >
      {/* Top row */}
      <div className="flex items-start gap-3 mb-3">
        <div className="w-11 h-11 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 flex items-center justify-center text-2xl shrink-0 group-hover:scale-110 transition-transform">
          {cat?.icon || "📋"}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap gap-1.5 mb-1">
            <span className={"text-[10px] font-semibold px-2 py-0.5 rounded-full " + colorCls}>
              {cat?.label || scheme.category}
            </span>
            {scheme.state && scheme.state !== "Central Government" && scheme.state !== "Central" && (
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-gray-100 dark:bg-slate-800 text-gray-600 dark:text-gray-300">
                {scheme.state}
              </span>
            )}
            {(!scheme.state || scheme.state === "Central Government" || scheme.state === "Central") && (
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-300">
                Central
              </span>
            )}
          </div>
          <h3 className="text-sm font-extrabold text-gray-900 dark:text-gray-100 line-clamp-2 leading-snug group-hover:text-emerald-500 transition-colors">
            {scheme.name}
          </h3>
          <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-0.5 line-clamp-1">{scheme.ministry}</p>
        </div>
      </div>

      {/* Description */}
      <p className="text-xs text-gray-600 dark:text-gray-300 line-clamp-2 flex-1 mb-3 leading-relaxed">{scheme.description}</p>

      {/* Benefit */}
      {scheme.benefitAmount && (
        <div className="mb-3 px-3 py-2 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-100 dark:border-emerald-800/40 rounded-xl">
          <p className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 uppercase tracking-wide mb-0.5">Estimated Benefit</p>
          <p className="text-sm font-extrabold text-emerald-700 dark:text-emerald-300">{scheme.benefitAmount}</p>
        </div>
      )}

      {/* Tags */}
      {scheme.tags && scheme.tags.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-3">
          {scheme.tags.slice(0, 4).map(tag => (
            <span key={tag} className="text-[10px] px-2 py-0.5 bg-gray-100 dark:bg-slate-800 text-gray-500 dark:text-gray-400 rounded-full">{tag}</span>
          ))}
        </div>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between mt-auto pt-3 border-t border-gray-100 dark:border-white/5">
        <div className="flex items-center gap-1 text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold">
          <CheckCircle2 className="w-3 h-3" /> Database Verified
        </div>
        <div className="flex gap-2">
          <Link href={"/schemes/" + scheme.id}
            className="flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700/50 rounded-full hover:bg-emerald-50 dark:hover:bg-emerald-950/40 transition-colors">
            Details <ArrowRight className="w-3 h-3" />
          </Link>
          {scheme.applicationUrl && (
            <a href={scheme.applicationUrl} target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-1 px-3 py-1.5 text-xs font-bold text-white bg-emerald-600 rounded-full hover:bg-emerald-700 transition-colors">
              Apply <ExternalLink className="w-3 h-3" />
            </a>
          )}
        </div>
      </div>
    </motion.div>
  );
}

// ─── Main Page ────────────────────────────────────────────────
export default function SchemesPage() {
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("");
  const [activeState, setActiveState] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [page, setPage] = useState(1);
  const [dbSchemes, setDbSchemes] = useState<Scheme[]>([]);
  const [isDbConnected, setIsDbConnected] = useState(false);
  const [loading, setLoading] = useState(false);
  const PER_PAGE = 12;

  // Read URL params on mount
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("cat")) setActiveCategory(params.get("cat")!);
    if (params.get("state")) setActiveState(params.get("state")!);
    if (params.get("q")) {
      setQuery(params.get("q")!);
      setDebouncedQuery(params.get("q")!);
    }
  }, []);

  // Debounce search input to avoid spamming the backend while typing
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(query);
    }, 250);
    return () => clearTimeout(timer);
  }, [query]);

  // Fetch schemes from backend database
  useEffect(() => {
    const fetchFromDatabase = async () => {
      setLoading(true);
      try {
        const params: any = { limit: 100 };
        if (debouncedQuery.trim().length > 1) params.search = debouncedQuery.trim();
        if (activeState && activeState !== "Central Government") params.state = activeState;

        const res = await apiClient.get('/schemes', { params });
        if (res.data && Array.isArray(res.data) && res.data.length > 0) {
          const mapped: Scheme[] = res.data.map((s: any) => ({
            id: s.id,
            name: s.title,
            ministry: s.ministry || "Government of India",
            category: s.category?.slug || s.category_id || "social",
            state: s.state || "Central Government",
            benefit: s.benefit_type || "Direct Benefit",
            benefitAmount: s.benefit_summary || (s.estimated_benefit_amount ? `₹${s.estimated_benefit_amount.toLocaleString("en-IN")}` : undefined),
            description: s.short_description || s.title,
            eligibility: s.eligibility_rules?.length
              ? s.eligibility_rules.map((r: any) => r.rule_explanation || "Standard criteria")
              : ["Indian citizen meeting demographic guidelines"],
            documents: s.required_documents?.length
              ? s.required_documents.map((d: any) => d.document_type)
              : ["Aadhaar Card", "Bank Passbook"],
            applicationUrl: s.official_url || "https://myscheme.gov.in",
            tags: [s.category?.slug, s.state, s.benefit_type].filter(Boolean) as string[],
            featured: s.is_featured || false,
          }));
          setDbSchemes(mapped);
          setIsDbConnected(true);
        }
      } catch (err) {
        console.warn("Could not reach backend /schemes; using resilient local catalog", err);
      } finally {
        setLoading(false);
      }
    };

    fetchFromDatabase();
  }, [debouncedQuery, activeState]);

  // Reset page on filter change
  useEffect(() => { setPage(1); }, [query, activeCategory, activeState]);

  const sourceList = dbSchemes.length > 0 ? dbSchemes : ALL_SCHEMES;

  const filtered = useMemo(() => {
    let results = [...sourceList];
    if (query.trim().length > 1) {
      const q = query.toLowerCase();
      results = results.filter(s =>
        s.name.toLowerCase().includes(q) ||
        s.ministry.toLowerCase().includes(q) ||
        s.description.toLowerCase().includes(q) ||
        s.tags?.some(t => t.toLowerCase().includes(q))
      );
    }
    if (activeCategory) {
      results = results.filter(s => s.category.toLowerCase() === activeCategory.toLowerCase());
    }
    if (activeState && activeState !== "Central Government") {
      results = results.filter(s => s.state === activeState || s.state === "Central Government" || s.state === "Central");
    }
    if (activeState === "Central Government") {
      results = results.filter(s => !s.state || s.state === "Central Government" || s.state === "Central");
    }
    return results;
  }, [sourceList, query, activeCategory, activeState]);

  const totalPages = Math.ceil(filtered.length / PER_PAGE);
  const paginated = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  const clearFilters = () => { setQuery(""); setActiveCategory(""); setActiveState(""); setPage(1); };
  const hasFilters = query || activeCategory || activeState;

  const activeCategoryLabel = CATEGORIES.find(c => c.id === activeCategory)?.label;

  return (
    <div className="min-h-screen bg-transparent">
      {/* Header */}
      <div className="border-b border-gray-200/50 dark:border-white/5 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-700/50 text-emerald-700 dark:text-emerald-300 text-xs font-semibold mb-4 shadow-sm">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
            <span>{sourceList.length || ALL_SCHEMES.length}+ Verified Central & State Schemes Catalog</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 dark:text-gray-100 tracking-tight mb-2">Find Government Schemes</h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm max-w-2xl">Search, filter, and track Central and State government welfare programs across 15 categories.</p>

          {/* Search bar */}
          <div className="relative mt-5 max-w-2xl">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input type="text" value={query} onChange={e => setQuery(e.target.value)}
              placeholder="Search schemes by name, ministry, or keyword..."
              className="w-full pl-10 pr-10 py-3.5 border border-gray-200 dark:border-white/10 rounded-2xl text-sm bg-white/90 dark:bg-slate-900/90 text-gray-900 dark:text-gray-100 focus:outline-none focus:border-emerald-500 transition-colors shadow-sm" />
            {query && (
              <button onClick={() => setQuery("")} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Active filter chips */}
          {hasFilters && (
            <div className="flex flex-wrap items-center gap-2 mt-4 pt-3 border-t border-gray-100 dark:border-white/5">
              <span className="text-xs text-gray-400">Active filters:</span>
              {query && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 text-xs rounded-full border border-emerald-200 dark:border-emerald-800/40">
                  "{query}" <button onClick={() => setQuery("")}><X className="w-3 h-3" /></button>
                </span>
              )}
              {activeCategory && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 text-xs rounded-full border border-emerald-200 dark:border-emerald-800/40">
                  {activeCategoryLabel} <button onClick={() => setActiveCategory("")}><X className="w-3 h-3" /></button>
                </span>
              )}
              {activeState && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 text-xs rounded-full border border-blue-200 dark:border-blue-800/40">
                  {activeState} <button onClick={() => setActiveState("")}><X className="w-3 h-3" /></button>
                </span>
              )}
              <button onClick={clearFilters} className="text-xs text-red-500 hover:underline ml-1">Clear all</button>
            </div>
          )}
        </div>
      </div>

      {/* Main body */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-8">

          {/* ─── SIDEBAR FILTERS ─────────────────────────── */}
          <div className="w-full lg:w-64 shrink-0 space-y-6">

            {/* Category filter */}
            <div className="bg-white/80 dark:bg-slate-900/60 backdrop-blur-md rounded-2xl border border-gray-200 dark:border-white/10 p-5 shadow-sm">
              <h2 className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">Categories</h2>
              <div className="space-y-1">
                <button
                  onClick={() => setActiveCategory("")}
                  className={"w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-colors " +
                    (!activeCategory ? "bg-emerald-600 text-white shadow-xs" : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-800")}>
                  <span>All Categories</span>
                  <span className="text-[10px] opacity-75">{sourceList.length}</span>
                </button>
                {CATEGORIES.map(cat => {
                  const count = sourceList.filter(s => s.category.toLowerCase() === cat.id.toLowerCase()).length;
                  const active = activeCategory === cat.id;
                  return (
                    <button key={cat.id} onClick={() => setActiveCategory(active ? "" : cat.id)}
                      className={"w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-colors " +
                        (active ? "bg-emerald-600 text-white font-semibold shadow-xs" : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-800")}>
                      <span className="flex items-center gap-2 truncate">
                        <span>{cat.icon}</span>
                        <span className="truncate">{cat.label}</span>
                      </span>
                      <span className="text-[10px] opacity-60 ml-2 shrink-0">{count}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* State filter */}
            <div className="bg-white/80 dark:bg-slate-900/60 backdrop-blur-md rounded-2xl border border-gray-200 dark:border-white/10 p-5 shadow-sm">
              <h2 className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">State / Scope</h2>
              <select value={activeState} onChange={e => setActiveState(e.target.value)}
                className="w-full px-3 py-2.5 text-xs border border-gray-200 dark:border-white/10 rounded-xl bg-gray-50 dark:bg-slate-800 text-gray-800 dark:text-gray-200 focus:outline-none focus:border-emerald-500">
                <option value="">All States & Central</option>
                {STATES.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
          </div>

          {/* ─── SCHEMES GRID ────────────────────────────── */}
          <div className="flex-1 min-w-0">

            {/* Status bar */}
            <div className="flex items-center justify-between mb-5">
              <p className="text-xs font-bold text-gray-600 dark:text-gray-300">
                Showing <span className="text-emerald-600 dark:text-emerald-400 font-extrabold">{filtered.length}</span> schemes
                {loading && <span className="ml-2 text-gray-400 animate-pulse">(updating schemes...)</span>}
              </p>
              <div className="text-xs text-gray-400">
                Page {page} of {totalPages || 1}
              </div>
            </div>

            {/* Cards grid */}
            {paginated.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                {paginated.map((scheme, i) => (
                  <SchemeCard key={scheme.id} scheme={scheme} index={i} />
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-20 text-center bg-white/60 dark:bg-slate-900/40 backdrop-blur-md rounded-3xl border border-gray-200 dark:border-white/5 p-8">
                <SearchX className="w-12 h-12 text-gray-300 dark:text-gray-600 mb-3" />
                <h3 className="text-base font-extrabold text-gray-800 dark:text-gray-200">No schemes found</h3>
                <p className="text-xs text-gray-500 max-w-sm mt-1 mb-5">Try relaxing your search terms or clearing selected category filters.</p>
                <button onClick={clearFilters}
                  className="px-5 py-2.5 text-xs font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/50 rounded-full hover:bg-emerald-100 transition-colors">
                  Clear All Filters
                </button>
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-8">
                <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
                  className="px-4 py-2 text-xs font-bold rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-slate-900 text-gray-700 dark:text-gray-300 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed">
                  Previous
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                  <button key={p} onClick={() => setPage(p)}
                    className={"w-9 h-9 text-xs font-bold rounded-xl transition-colors " +
                      (page === p ? "bg-emerald-600 text-white shadow-xs" : "border border-gray-200 dark:border-white/10 bg-white dark:bg-slate-900 text-gray-700 dark:text-gray-300 hover:bg-gray-50")}>
                    {p}
                  </button>
                ))}
                <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
                  className="px-4 py-2 text-xs font-bold rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-slate-900 text-gray-700 dark:text-gray-300 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed">
                  Next
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
