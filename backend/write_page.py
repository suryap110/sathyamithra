import pathlib

content = r'''
"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import {
  Search, Sparkles, ChevronRight, ChevronDown,
  ArrowRight, ShieldCheck, Star, HelpCircle
} from "lucide-react";
import { ALL_SCHEMES, CATEGORIES, getFeaturedSchemes, searchSchemes } from "@/lib/schemes-data";
import type { Scheme } from "@/lib/schemes-data";

const STATS = [
  { value: "4,700+", label: "Government Schemes" },
  { value: "15", label: "Scheme Categories" },
  { value: "36", label: "States & UTs" },
  { value: "15", label: "Languages Supported" },
];

const HOW_IT_WORKS = [
  { step: "01", title: "Enter Your Details", desc: "Share basic info about age, gender, income, occupation, and state. Takes under 2 minutes." },
  { step: "02", title: "AI Matches Schemes", desc: "Our engine cross-checks your profile against 4,700+ schemes and shows only those you are eligible for." },
  { step: "03", title: "Apply with Guidance", desc: "Get step-by-step instructions, required documents, and direct links to apply on official government portals." },
];

const EXCLUSIVE = [
  { title: "AI Assistant", desc: "Chat or speak in your language. RAG-powered, voice-enabled.", href: "/assistant", emoji: "★" },
  { title: "What-If Simulator", desc: "See how changing your income or status affects eligibility.", href: "/simulator", emoji: "⚡" },
  { title: "Document Vault", desc: "Securely store Aadhaar and income certificates for quick apply.", href: "/documents", emoji: "📁" },
  { title: "Family Mode", desc: "Manage eligibility for your entire household in one place.", href: "/family", emoji: "👨‍👩" },
  { title: "Smart Alerts", desc: "Never miss a deadline. Get matched to new schemes automatically.", href: "/alerts", emoji: "🔔" },
  { title: "Life Events Engine", desc: "Marriage, baby, job loss? Get instantly re-matched to relevant schemes.", href: "/life-events", emoji: "📅" },
  { title: "Hyperlocal Support", desc: "Find CSC centers, PDS shops, and government offices near you.", href: "/locations", emoji: "📍" },
  { title: "Offline PWA", desc: "Use Sathyamithra even without internet. Install on your phone.", href: "/offline", emoji: "🌐" },
];

const FAQS = [
  { q: "What is Sathyamithra, and how is it different from myScheme?", a: "Sathyamithra is an AI-powered civic technology platform with unique features: AI assistant (voice + multilingual), What-If simulator, Document Vault, Family Mode, Smart Alerts, Life Events Engine, and offline PWA support." },
  { q: "How does the Find Schemes For You feature work?", a: "Three steps: Enter demographic details, our AI engine matches you against 4,700+ schemes, you get a personalised list with eligibility scores, required documents, and direct application links." },
  { q: "What categories of schemes are available?", a: "15 categories: Agriculture and Rural, Banking and Insurance, Business and Entrepreneurship, Education and Learning, Health and Wellness, Housing and Shelter, Public Safety and Law, Science and IT, Skills and Employment, Social Welfare, Sports and Culture, Transport, Tourism, Utility and Sanitation, and Women and Child." },
  { q: "Does Sathyamithra support multiple languages?", a: "Yes! 15 Indian languages including Hindi, Tamil, Telugu, Kannada, Marathi, Bengali, Gujarati, Punjabi, Malayalam, Odia, Assamese, Urdu, Konkani, and Sanskrit with voice input." },
  { q: "Can I apply for schemes directly through Sathyamithra?", a: "Sathyamithra guides you through eligibility and documents, then redirects you to the official government portal for application. Step-by-step offline instructions for CSC centers are also provided." },
  { q: "What is the AI Assistant?", a: "Our RAG-powered AI assistant answers any question about government schemes in your language through text or voice. It understands context, maintains conversation history, and gives sourced, accurate answers." },
  { q: "What is Family Mode?", a: "Family Mode lets you manage eligibility profiles for your entire household from a single account, so you never miss a scheme any family member is eligible for." },
  { q: "What is the What-If Simulator?", a: "Change hypothetical parameters such as income level and instantly see how your scheme eligibility changes. A powerful planning tool." },
  { q: "What is the Document Vault?", a: "A secure digital locker to store Aadhaar, income certificate, caste certificate, and bank passbook so you can apply for any scheme instantly." },
  { q: "What are Smart Alerts?", a: "Notifications when a new scheme matching your profile launches, application deadlines approach, scheme benefits increase, or documents need renewal." },
  { q: "What is the Life Events Engine?", a: "Major life events such as marriage, childbirth, retirement, and job loss change your eligibility. The Life Events Engine automatically re-evaluates and suggests newly relevant schemes." },
  { q: "Does Sathyamithra work offline?", a: "Yes! Sathyamithra is a Progressive Web App. Install it on your phone and access saved schemes, documents, and status even without internet. Changes sync when you reconnect." },
  { q: "What is Elder Mode?", a: "An accessibility feature with larger fonts, simpler language, high-contrast visuals, and voice-first navigation designed specifically for senior citizens." },
  { q: "How can I find nearby government service centers?", a: "The Hyperlocal Support section shows nearest Common Service Centres, PDS shops, government hospitals, Anganwadi centers, and scheme enrollment camps on an interactive map." },
  { q: "Is my data safe on Sathyamithra?", a: "Absolutely. End-to-end encryption for all documents, OWASP security standards, JWT authentication, and we never share your data with third parties." },
  { q: "Who can I contact for help?", a: "Use the in-app AI Assistant, email help@sathyamithra.in, or helpline 1800-XXX-XXXX toll-free. Our Community Forum also has volunteer helpers." },
  { q: "Does Sathyamithra cover both Central and State or UT schemes?", a: "Yes. 4,700+ schemes from both Central Government ministries and all 36 State and UT governments, continuously updated." },
];

const CAT_COLORS: Record<string, string> = {
  green: "bg-green-50 border-green-200 text-green-700 hover:bg-green-100",
  blue: "bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100",
  purple: "bg-purple-50 border-purple-200 text-purple-700 hover:bg-purple-100",
  indigo: "bg-indigo-50 border-indigo-200 text-indigo-700 hover:bg-indigo-100",
  red: "bg-red-50 border-red-200 text-red-700 hover:bg-red-100",
  orange: "bg-orange-50 border-orange-200 text-orange-700 hover:bg-orange-100",
  slate: "bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100",
  cyan: "bg-cyan-50 border-cyan-200 text-cyan-700 hover:bg-cyan-100",
  yellow: "bg-yellow-50 border-yellow-200 text-yellow-700 hover:bg-yellow-100",
  pink: "bg-pink-50 border-pink-200 text-pink-700 hover:bg-pink-100",
  amber: "bg-amber-50 border-amber-200 text-amber-700 hover:bg-amber-100",
  stone: "bg-stone-50 border-stone-200 text-stone-700 hover:bg-stone-100",
  teal: "bg-teal-50 border-teal-200 text-teal-700 hover:bg-teal-100",
  sky: "bg-sky-50 border-sky-200 text-sky-700 hover:bg-sky-100",
  rose: "bg-rose-50 border-rose-200 text-rose-700 hover:bg-rose-100",
};

const STATES_LIST = [
  "Central Government","Andhra Pradesh","Arunachal Pradesh","Assam","Bihar",
  "Chhattisgarh","Goa","Gujarat","Haryana","Himachal Pradesh","Jharkhand",
  "Karnataka","Kerala","Madhya Pradesh","Maharashtra","Manipur","Meghalaya",
  "Mizoram","Nagaland","Odisha","Punjab","Rajasthan","Sikkim","Tamil Nadu",
  "Telangana","Tripura","Uttar Pradesh","Uttarakhand","West Bengal",
  "Delhi","Jammu and Kashmir","Puducherry","Chandigarh",
];

function FAQItem({ q, a, open, onToggle }: { q: string; a: string; open: boolean; onToggle: () => void }) {
  return (
    <div className="border border-gray-200 rounded-xl overflow-hidden">
      <button onClick={onToggle} className="w-full flex items-center justify-between px-5 py-4 text-left bg-white hover:bg-gray-50 transition-colors">
        <span className="text-sm font-semibold text-gray-800 pr-4">{q}</span>
        <ChevronDown className={"w-4 h-4 text-green-600 shrink-0 transition-transform " + (open ? "rotate-180" : "")} />
      </button>
      {open && (
        <div className="px-5 pb-4 bg-green-50 border-t border-gray-100">
          <p className="text-sm text-gray-700 leading-relaxed pt-3">{a}</p>
        </div>
      )}
    </div>
  );
}

export default function HomePage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<Scheme[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [activeState, setActiveState] = useState("Central Government");
  const searchRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (searchQuery.length > 1) {
      setSearchResults(searchSchemes(searchQuery).slice(0, 8));
      setShowResults(true);
    } else {
      setShowResults(false);
    }
  }, [searchQuery]);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) setShowResults(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const featuredSchemes = getFeaturedSchemes();

  return (
    <div className="min-h-screen bg-white">

      <section className="relative bg-gradient-to-b from-green-50 via-green-50/30 to-white overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-green-100 rounded-full -translate-y-1/2 translate-x-1/2 opacity-40 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-yellow-100 rounded-full translate-y-1/2 -translate-x-1/2 opacity-40 blur-3xl pointer-events-none" />
        <div className="relative max-w-7xl mx-auto px-4 py-16 lg:py-24 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-green-100 border border-green-200 text-green-700 text-xs font-semibold mb-6">
            <ShieldCheck className="w-3.5 h-3.5" />
            4,700+ Verified Government Schemes — AI-Powered Discovery
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-gray-900 leading-tight mb-4 tracking-tight">
            Find Government Schemes<br /><span className="text-green-600">Made for You</span>
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto mb-8 leading-relaxed">
            Enter your details once. Sathyamithra instantly matches you to every Central and State Government scheme you are eligible for.
          </p>

          <div ref={searchRef} className="relative max-w-2xl mx-auto mb-6">
            <div className="flex items-center bg-white rounded-2xl shadow-lg border border-gray-200 hover:border-green-400 transition-colors overflow-hidden">
              <Search className="w-5 h-5 text-gray-400 ml-4 shrink-0" />
              <input type="text" value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search schemes by name, ministry, or keyword..."
                className="flex-1 px-3 py-4 text-sm bg-transparent border-none focus:outline-none placeholder:text-gray-400" />
              <Link href={"/schemes?q=" + encodeURIComponent(searchQuery)}
                className="flex items-center gap-2 px-6 py-4 text-sm font-bold text-white bg-green-600 hover:bg-green-700 transition-colors">
                <Search className="w-4 h-4" /> Search
              </Link>
            </div>
            {showResults && searchResults.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden z-50">
                {searchResults.map(s => (
                  <Link key={s.id} href={"/schemes/" + s.id} onClick={() => setShowResults(false)}
                    className="flex items-start gap-3 px-4 py-3 hover:bg-green-50 transition-colors border-b border-gray-50 last:border-0">
                    <div className="w-8 h-8 rounded-lg bg-green-100 flex items-center justify-center text-base shrink-0">
                      {CATEGORIES.find(c => c.id === s.category)?.icon || "📋"}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-800 line-clamp-1">{s.name}</p>
                      <p className="text-xs text-gray-500">{s.ministry}</p>
                    </div>
                    {s.benefitAmount && <span className="text-xs font-bold text-green-600 shrink-0">{s.benefitAmount}</span>}
                  </Link>
                ))}
                <Link href={"/schemes?q=" + encodeURIComponent(searchQuery)}
                  className="flex items-center justify-center gap-2 px-4 py-3 text-xs font-semibold text-green-700 hover:bg-green-50 transition-colors">
                  View all results <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            )}
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-8">
            <Link href="/find-scheme" className="flex items-center gap-2 px-6 py-3.5 text-sm font-bold text-white bg-green-600 rounded-full hover:bg-green-700 shadow-md transition-all">
              <Sparkles className="w-4 h-4" /> Find Schemes For Me
            </Link>
            <Link href="/assistant" className="flex items-center gap-2 px-6 py-3.5 text-sm font-bold text-green-700 border-2 border-green-400 bg-white rounded-full hover:bg-green-50 transition-colors">
              Ask AI Assistant
            </Link>
            <Link href="/schemes" className="flex items-center gap-2 px-6 py-3.5 text-sm font-medium text-gray-600 hover:text-green-700 transition-colors">
              Browse All Schemes <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-2 text-xs">
            <span className="text-gray-400">Popular:</span>
            {["PM-KISAN","Ayushman Bharat","Mudra Loan","Scholarship","PM Awas","LPG Subsidy","Pension"].map(s => (
              <Link key={s} href={"/schemes?q=" + encodeURIComponent(s)}
                className="px-3 py-1.5 bg-gray-100 text-gray-600 rounded-full hover:bg-green-100 hover:text-green-700 transition-colors">{s}</Link>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-green-700 py-6">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 text-center text-white">
            {STATS.map(s => (
              <div key={s.label}><p className="text-2xl sm:text-3xl font-extrabold">{s.value}</p><p className="text-green-200 text-xs mt-1">{s.label}</p></div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 bg-white" id="categories">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-10">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900">Browse Schemes by Category</h2>
            <p className="text-gray-500 text-sm mt-2 max-w-xl mx-auto">All 4,700+ schemes organised into 15 categories based on benefits and target beneficiaries.</p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
            {CATEGORIES.map(cat => {
              const count = ALL_SCHEMES.filter(s => s.category === cat.id).length;
              return (
                <Link key={cat.id} href={"/schemes?cat=" + cat.id}
                  className={"flex flex-col items-center gap-2 p-4 rounded-xl border transition-all cursor-pointer group " + (CAT_COLORS[cat.color] || "bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100")}>
                  <span className="text-2xl group-hover:scale-110 transition-transform">{cat.icon}</span>
                  <span className="text-xs font-semibold text-center leading-tight">{cat.label}</span>
                  {count > 0 && <span className="text-[10px] opacity-60">{count} scheme{count !== 1 ? "s" : ""}</span>}
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      <section className="py-12 bg-gray-50 border-y border-gray-100">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-8">
            <h2 className="text-xl sm:text-2xl font-extrabold text-gray-900">Browse by State / UT</h2>
            <p className="text-gray-500 text-sm mt-1">Find schemes specific to your state or union territory.</p>
          </div>
          <div className="flex flex-wrap gap-2 justify-center">
            {STATES_LIST.map(state => (
              <button key={state} onClick={() => setActiveState(state)}
                className={"px-3 py-1.5 text-xs font-medium rounded-full border transition-all " + (activeState === state ? "bg-green-600 text-white border-green-600 shadow-sm" : "bg-white text-gray-700 border-gray-200 hover:border-green-400 hover:text-green-700")}>
                {state}
              </button>
            ))}
          </div>
          <div className="mt-6 text-center">
            <Link href={"/schemes?state=" + encodeURIComponent(activeState)}
              className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white bg-green-600 rounded-full hover:bg-green-700 transition-colors">
              View {activeState} Schemes <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900">Popular Schemes</h2>
              <p className="text-gray-500 text-sm mt-1">Most accessed government schemes across India.</p>
            </div>
            <Link href="/schemes" className="hidden sm:flex items-center gap-1.5 text-sm font-semibold text-green-700 hover:underline">View All <ArrowRight className="w-4 h-4" /></Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {featuredSchemes.map(scheme => {
              const cat = CATEGORIES.find(c => c.id === scheme.category);
              return (
                <Link key={scheme.id} href={"/schemes/" + scheme.id}
                  className="group flex flex-col border border-gray-200 rounded-2xl p-5 hover:border-green-400 hover:shadow-md transition-all bg-white">
                  <div className="flex items-start gap-3 mb-3">
                    <div className="w-10 h-10 rounded-xl bg-green-50 flex items-center justify-center text-xl shrink-0">{cat?.icon || "📋"}</div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-gray-500 line-clamp-1">{scheme.ministry}</p>
                      <h3 className="text-sm font-bold text-gray-900 mt-0.5 line-clamp-2 group-hover:text-green-700 transition-colors">{scheme.name}</h3>
                    </div>
                  </div>
                  <p className="text-xs text-gray-600 line-clamp-2 flex-1 mb-3">{scheme.description}</p>
                  <div className="flex items-center justify-between">
                    {scheme.benefitAmount ? (
                      <span className="text-xs font-bold text-green-600 bg-green-50 px-2.5 py-1 rounded-full">{scheme.benefitAmount}</span>
                    ) : (
                      <span className="text-xs text-gray-400 bg-gray-50 px-2.5 py-1 rounded-full">{cat?.label}</span>
                    )}
                    <span className="text-xs text-green-600 font-semibold flex items-center gap-0.5">View <ArrowRight className="w-3 h-3" /></span>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      <section className="py-12 bg-gradient-to-r from-green-700 to-green-600">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-6">
            <div className="text-white text-center lg:text-left">
              <h2 className="text-2xl sm:text-3xl font-extrabold mb-2">Find Schemes Personalised For You</h2>
              <p className="text-green-200 text-sm max-w-lg">Answer 10 simple questions. Get every scheme you are eligible for across Central and State governments.</p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 shrink-0">
              <Link href="/find-scheme" className="flex items-center gap-2 px-6 py-3.5 text-sm font-bold text-green-700 bg-white rounded-full hover:bg-green-50 shadow-md transition-all">
                <Sparkles className="w-4 h-4 text-yellow-500" /> Find My Schemes
              </Link>
              <Link href="/register" className="flex items-center gap-2 px-6 py-3.5 text-sm font-bold text-white border-2 border-white/50 rounded-full hover:bg-white/10 transition-all">
                Create Free Account
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 bg-gray-50 border-y border-gray-100" id="how-it-works">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900">How Sathyamithra Works</h2>
            <p className="text-gray-500 text-sm mt-2 max-w-xl mx-auto">A simple 3-step process to find and apply for every scheme you deserve.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {HOW_IT_WORKS.map(step => (
              <div key={step.step} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:border-green-300 transition-colors text-center">
                <div className="w-12 h-12 rounded-full bg-green-600 text-white flex items-center justify-center mx-auto mb-4 text-lg font-black">{step.step}</div>
                <h3 className="font-bold text-gray-900 mb-2">{step.title}</h3>
                <p className="text-xs text-gray-600 leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-10">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-yellow-50 border border-yellow-200 rounded-full text-yellow-700 text-xs font-semibold mb-4">
              <Sparkles className="w-3.5 h-3.5" /> Exclusive to Sathyamithra
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900">Features You Will Not Find Elsewhere</h2>
            <p className="text-gray-500 text-sm mt-2 max-w-xl mx-auto">Beyond scheme discovery — tools that truly help the last-mile citizen.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {EXCLUSIVE.map(f => (
              <Link key={f.href} href={f.href} className="group flex flex-col gap-3 p-5 rounded-2xl border border-gray-200 bg-white hover:border-green-400 hover:shadow-md transition-all">
                <div className="w-10 h-10 rounded-xl bg-gray-50 group-hover:bg-green-50 flex items-center justify-center text-2xl transition-colors">{f.emoji}</div>
                <div>
                  <h3 className="font-bold text-gray-900 text-sm group-hover:text-green-700 transition-colors">{f.title}</h3>
                  <p className="text-xs text-gray-500 mt-1 leading-relaxed">{f.desc}</p>
                </div>
                <span className="text-xs font-semibold text-green-600 flex items-center gap-1 mt-auto opacity-0 group-hover:opacity-100 transition-opacity">Explore <ArrowRight className="w-3 h-3" /></span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="py-12 bg-green-50 border-y border-green-100">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-8"><h2 className="text-xl font-extrabold text-gray-900">Trusted by Citizens Across India</h2></div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            {[
              { name: "Ravi Kumar", state: "Uttar Pradesh", quote: "Found out I was eligible for PM-KISAN and PMAY both! Applied within a week with all documents ready in the vault." },
              { name: "Meena Devi", state: "Tamil Nadu", quote: "The AI assistant explained the PM-JAY scheme in Tamil. My family now has Rs 5 lakh health cover for the first time." },
              { name: "Arjun Patil", state: "Maharashtra", quote: "The What-If simulator showed me that slightly reducing my declared income makes me eligible for 3 more schemes." },
            ].map(t => (
              <div key={t.name} className="bg-white rounded-2xl p-5 shadow-sm border border-green-100">
                <div className="flex gap-0.5 mb-3">{[1,2,3,4,5].map(i => <Star key={i} className="w-3.5 h-3.5 text-yellow-500 fill-current" />)}</div>
                <p className="text-sm text-gray-700 italic mb-4">"{t.quote}"</p>
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center text-green-700 font-bold text-sm">{t.name[0]}</div>
                  <div><p className="text-xs font-bold text-gray-800">{t.name}</p><p className="text-xs text-gray-500">{t.state}</p></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 bg-white" id="faq">
        <div className="max-w-4xl mx-auto px-4">
          <div className="text-center mb-10">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 flex items-center justify-center gap-2">
              <HelpCircle className="w-6 h-6 text-green-600" /> Frequently Asked Questions
            </h2>
            <p className="text-gray-500 text-sm mt-2">Everything you need to know about Sathyamithra and scheme discovery.</p>
          </div>
          <div className="space-y-2">
            {FAQS.map((faq, i) => (
              <FAQItem key={i} q={faq.q} a={faq.a} open={openFaq === i} onToggle={() => setOpenFaq(openFaq === i ? null : i)} />
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 bg-green-900">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white mb-3">Every Indian Citizen Deserves Their Benefits</h2>
          <p className="text-green-200 text-sm mb-8 max-w-xl mx-auto">Thousands of crores in government benefits go unclaimed every year. Sathyamithra finds, explains, and guides you — for free.</p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/find-scheme" className="flex items-center justify-center gap-2 px-8 py-4 text-base font-bold text-green-900 bg-white rounded-full hover:bg-green-50 shadow-lg transition-all">
              <Sparkles className="w-5 h-5 text-yellow-500" /> Find My Schemes Free
            </Link>
            <Link href="/register" className="flex items-center justify-center gap-2 px-8 py-4 text-base font-bold text-white border-2 border-white/40 rounded-full hover:bg-white/10 transition-all">Create Account</Link>
          </div>
          <p className="text-green-400 text-xs mt-6 flex items-center justify-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5" /> No fees. No middlemen. 100% free for citizens.
          </p>
        </div>
      </section>
    </div>
  );
}
'''

target = pathlib.Path(r'C:\Users\surya\.gemini\antigravity\scratch\sathyamithra\web\app\page.tsx')
target.write_text(content.strip(), encoding='utf-8')
print(f'Written {len(content)} chars, {len(content.splitlines())} lines')
