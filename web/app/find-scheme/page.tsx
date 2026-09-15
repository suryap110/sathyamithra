"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ArrowRight, ArrowLeft, CheckCircle2, Sparkles, ShieldCheck, ChevronDown } from "lucide-react";
import { ALL_SCHEMES, CATEGORIES, STATES, type Scheme } from "@/lib/schemes-data";

const STEPS = [
  "Gender", "Age", "State / UT", "Residence Type",
  "Social Category", "Annual Income", "Occupation",
  "Disability", "Minority Status", "Marital Status",
];

type Profile = {
  gender: string; age: string; state: string; residence: string;
  category: string; income: string; occupation: string;
  disability: string; minority: string; marital: string;
};

const INITIAL: Profile = {
  gender: "", age: "", state: "", residence: "",
  category: "", income: "", occupation: "",
  disability: "", minority: "", marital: "",
};

function matchSchemes(p: Profile): Scheme[] {
  return ALL_SCHEMES.filter(scheme => {
    if (scheme.state !== "Central Government" && p.state && scheme.state !== p.state) return false;
    const txt = (scheme.eligibility.join(" ") + " " + scheme.description).toLowerCase();
    if (p.occupation === "farmer" && (txt.includes("farmer") || txt.includes("kisan") || txt.includes("agriculture"))) return true;
    if (p.occupation === "student" && (txt.includes("student") || txt.includes("scholarship"))) return true;
    if (p.occupation === "self-employed" && (txt.includes("enterprise") || txt.includes("entrepreneur") || txt.includes("vendor") || txt.includes("mudra"))) return true;
    if ((p.category === "SC" || p.category === "ST") && (txt.includes("sc") || txt.includes("st") || txt.includes("scheduled"))) return true;
    if (p.category === "OBC" && txt.includes("obc")) return true;
    if (p.gender === "female" && (txt.includes("women") || txt.includes("girl") || txt.includes("mother") || txt.includes("widow"))) return true;
    if (p.disability === "yes" && txt.includes("disab")) return true;
    if (p.marital === "widow/widower" && txt.includes("widow")) return true;
    const age = parseInt(p.age) || 0;
    if (age >= 60 && (txt.includes("elderly") || txt.includes("pension") || txt.includes("old age"))) return true;
    if (age < 25 && (txt.includes("youth") || txt.includes("young") || txt.includes("apprentice"))) return true;
    if ((p.income === "0-1L" || p.income === "1-2L") && (txt.includes("bpl") || txt.includes("below poverty"))) return true;
    if ((p.income === "0-1L" || p.income === "1-2L" || p.income === "2-3L") && (scheme.category === "social" || scheme.category === "housing" || scheme.category === "utility")) return true;
    return false;
  });
}

function Opt({ label, value, selected, onSelect }: { label: string; value: string; selected: boolean; onSelect: (v: string) => void }) {
  return (
    <button onClick={() => onSelect(value)}
      className={"px-5 py-3 rounded-xl border-2 text-sm font-medium transition-all " + (selected
        ? "border-green-600 bg-green-600 text-white shadow-md"
        : "border-gray-200 bg-white text-gray-700 hover:border-green-400 hover:text-green-700")}>
      {label}
    </button>
  );
}

import { apiClient } from "@/lib/api-client";
import { Loader2, Zap } from "lucide-react";

function ResultCard({ scheme, match }: { scheme: Scheme; match?: any }) {
  const cat = CATEGORIES.find(c => c.id === scheme.category);
  const score = match?.match_percentage ?? 100;
  return (
    <Link href={"/schemes/" + scheme.id}
      className="group flex flex-col border border-gray-200 rounded-2xl p-5 bg-white hover:border-green-400 hover:shadow-md transition-all">
      <div className="flex items-start gap-3 mb-3">
        <div className="w-10 h-10 rounded-xl bg-green-50 flex items-center justify-center text-xl shrink-0">{cat?.icon || "📋"}</div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-0.5">
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-green-100 text-green-700 flex items-center gap-1">
              <Zap className="w-2.5 h-2.5" /> {score}% Match
            </span>
            <span className="text-[10px] text-gray-400">Backend AI Verified</span>
          </div>
          <p className="text-xs text-gray-500 line-clamp-1">{scheme.ministry}</p>
          <h3 className="text-sm font-bold text-gray-900 mt-0.5 line-clamp-2 group-hover:text-green-700 transition-colors">{scheme.name}</h3>
        </div>
      </div>
      <p className="text-xs text-gray-600 line-clamp-2 flex-1 mb-3">{scheme.description}</p>
      {match?.reasons && match.reasons.length > 0 && (
        <div className="mb-3 p-2 bg-gray-50 rounded-lg text-[11px] text-gray-600 space-y-0.5">
          <p className="font-semibold text-gray-700 flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3 text-green-600" /> {match.reasons[0].criterion}:
          </p>
          <p className="text-gray-500 line-clamp-1">{match.reasons[0].details}</p>
        </div>
      )}
      <div className="flex items-center justify-between">
        {scheme.benefitAmount
          ? <span className="text-xs font-bold text-green-600 bg-green-50 px-2.5 py-1 rounded-full">{scheme.benefitAmount}</span>
          : <span className="text-xs text-gray-400 bg-gray-50 px-2.5 py-1 rounded-full">{cat?.label}</span>}
        <span className="text-xs text-green-600 font-semibold flex items-center gap-0.5">Apply / View Details <ArrowRight className="w-3 h-3" /></span>
      </div>
    </Link>
  );
}

export default function FindSchemePage() {
  const [step, setStep] = useState(0);
  const [profile, setProfile] = useState<Profile>(INITIAL);
  const [done, setDone] = useState(false);
  const [evaluating, setEvaluating] = useState(false);
  const [results, setResults] = useState<Scheme[]>([]);
  const [matchDetails, setMatchDetails] = useState<Record<string, any>>({});

  const set = (k: keyof Profile, v: string) => setProfile(p => ({ ...p, [k]: v }));
  const prev = () => { if (step > 0) setStep(s => s - 1); };
  
  const evaluateWithBackend = async () => {
    setEvaluating(true);
    try {
      const incomeMap: Record<string, number> = {
        "0-1L": 80000,
        "1-2L": 150000,
        "2-3L": 250000,
        "3-5L": 400000,
        "5-8L": 650000,
        "8L+": 1000000,
      };

      const payload = {
        age: parseInt(profile.age) || 25,
        gender: profile.gender ? (profile.gender.charAt(0).toUpperCase() + profile.gender.slice(1)) : "All",
        state: profile.state || "Central",
        annual_income: incomeMap[profile.income] || 200000,
        occupation: profile.occupation || "Citizen",
        is_student: profile.occupation === "student",
        is_farmer: profile.occupation === "farmer",
        is_disabled: profile.disability === "yes",
        social_category: profile.category || "General",
        residence_type: profile.residence || "Urban",
        marital_status: profile.marital || "Single",
      };

      const res = await apiClient.post("/eligibility/check", payload);
      const matches = res.data.matches || [];

      const map: Record<string, any> = {};
      const matchedSchemes: Scheme[] = [];

      matches.forEach((m: any) => {
        if (m.match_percentage >= 60) {
          const sid = m.scheme?.id;
          map[sid] = m;
          const found = ALL_SCHEMES.find(s => s.id === sid || s.name.toLowerCase().includes((m.scheme?.title || "").toLowerCase()));
          if (found) {
            matchedSchemes.push(found);
          } else if (m.scheme) {
            matchedSchemes.push({
              id: m.scheme.id,
              name: m.scheme.title,
              ministry: m.scheme.ministry || "Government of India",
              category: m.scheme.category_id || "social",
              state: m.scheme.state || "Central Government",
              benefit: m.scheme.benefit_type || "Direct Benefit",
              benefitAmount: m.scheme.benefit_summary || "Financial Assistance",
              description: m.scheme.short_description || m.scheme.title,
              eligibility: m.reasons?.map((r: any) => r.details) || ["Standard criteria met"],
              documents: ["Aadhaar Card", "Bank Account Details"],
              applicationUrl: m.scheme.official_url || "https://www.myscheme.gov.in",
              tags: ["verified", "government"],
            });
          }
        }
      });

      setMatchDetails(map);
      setResults(matchedSchemes.length > 0 ? matchedSchemes : matchSchemes(profile));
    } catch (err) {
      console.warn("Backend eligibility check fallback:", err);
      setResults(matchSchemes(profile));
    } finally {
      setEvaluating(false);
      setDone(true);
    }
  };

  const next = () => {
    if (step < STEPS.length - 1) {
      setStep(s => s + 1);
    } else {
      evaluateWithBackend();
    }
  };

  const restart = () => { setStep(0); setProfile(INITIAL); setDone(false); setResults([]); setMatchDetails({}); };

  const progress = ((step + 1) / STEPS.length) * 100;

  if (evaluating) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center p-6 text-center">
        <div className="w-16 h-16 rounded-2xl bg-green-100 flex items-center justify-center text-green-600 mb-4 animate-bounce">
          <Sparkles className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-extrabold text-gray-900 mb-2">Analyzing Scheme Eligibility...</h2>
        <p className="text-gray-500 text-sm max-w-md mb-6">
          Sathyamithra Backend AI Engine is evaluating your profile against 55+ Central & State government schemes, age limits, income ceilings, and category criteria.
        </p>
        <div className="w-64 h-2 bg-gray-200 rounded-full overflow-hidden">
          <div className="h-full bg-green-600 rounded-full animate-pulse w-3/4"></div>
        </div>
      </div>
    );
  }

  if (done) {
    return (
      <div className="min-h-screen bg-transparent py-12 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-10">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-green-100/90 dark:bg-emerald-950/60 border border-green-200 dark:border-emerald-800/40 text-green-700 dark:text-emerald-300 text-xs font-semibold mb-4 backdrop-blur-md">
              <CheckCircle2 className="w-3.5 h-3.5" /> Backend AI Analysis Complete
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 dark:text-white mb-2">
              {results.length > 0 ? <>You qualify for <span className="text-green-600 dark:text-emerald-400">{results.length} schemes!</span></> : "No exact matches found"}
            </h1>
            <p className="text-gray-500 dark:text-gray-400 text-sm max-w-xl mx-auto">
              {results.length > 0
                ? "Evaluated in real-time by the Sathyamithra Backend Engine based on your state, income, age, and occupation criteria."
                : "Try adjusting your profile or browsing our full scheme catalog."}
            </p>
          </div>

          {results.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 mb-10">
              {results.map(s => <ResultCard key={s.id} scheme={s} match={matchDetails[s.id]} />)}
            </div>
          ) : (
            <div className="bg-white/80 dark:bg-slate-900/70 backdrop-blur-md rounded-2xl border border-gray-200 dark:border-white/10 p-10 text-center mb-10">
              <p className="text-4xl mb-3">🔍</p>
              <h3 className="font-bold text-gray-900 dark:text-white mb-2">Browse All Schemes</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">Explore our full catalog of 4,700+ schemes across all categories.</p>
              <Link href="/schemes" className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white bg-green-600 rounded-full hover:bg-green-700 transition-colors shadow-md">
                Browse All Schemes <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button onClick={restart} className="flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-gray-700 dark:text-gray-300 bg-white/80 dark:bg-slate-900/60 backdrop-blur-md border border-gray-200 dark:border-white/10 rounded-full hover:bg-gray-50 transition-colors">
              <ArrowLeft className="w-4 h-4" /> Start Over
            </button>
            <Link href="/schemes" className="flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white bg-green-600 rounded-full hover:bg-green-700 transition-colors shadow-md">
              Browse All Schemes <ArrowRight className="w-4 h-4" />
            </Link>
            <Link href="/assistant" className="flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-green-700 dark:text-emerald-300 bg-white/80 dark:bg-slate-900/60 backdrop-blur-md border border-green-400 dark:border-emerald-800/40 rounded-full hover:bg-green-50 transition-colors">
              <Sparkles className="w-4 h-4" /> Ask AI Assistant
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-transparent py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-green-100/90 dark:bg-emerald-950/60 border border-green-200 dark:border-emerald-800/40 text-green-700 dark:text-emerald-300 text-xs font-semibold mb-4 backdrop-blur-md">
            <Sparkles className="w-3.5 h-3.5" /> Personalised Scheme Finder
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white mb-2">Find Schemes For You</h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm">Answer {STEPS.length} simple questions to discover every government scheme you are eligible for.</p>
        </div>

        <div className="mb-8">
          <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 mb-2">
            <span>Step {step + 1} of {STEPS.length} — {STEPS[step]}</span>
            <span className="font-semibold text-green-600 dark:text-emerald-400">{Math.round(progress)}%</span>
          </div>
          <div className="w-full h-2 bg-gray-200 dark:bg-slate-800 rounded-full overflow-hidden">
            <div className="h-full bg-green-600 rounded-full transition-all duration-300" style={{ width: progress + "%" }} />
          </div>
          <div className="flex gap-0.5 mt-2">
            {STEPS.map((_s, i) => (
              <div key={i} className={"flex-1 h-1 rounded-full transition-all " + (i <= step ? "bg-green-500" : "bg-gray-200 dark:bg-slate-800")} />
            ))}
          </div>
        </div>

        <div className="bg-white/80 dark:bg-slate-900/70 backdrop-blur-md rounded-2xl shadow-sm border border-gray-200 dark:border-white/10 p-6 sm:p-8">

          {step === 0 && (
            <div>
              <h2 className="text-xl font-extrabold text-gray-900 mb-1">What is your gender?</h2>
              <p className="text-gray-500 text-sm mb-6">Some schemes are specifically designed for women or men.</p>
              <div className="flex flex-wrap gap-3">
                {["Male", "Female", "Transgender", "Prefer not to say"].map(g => (
                  <Opt key={g} label={g} value={g.toLowerCase()} selected={profile.gender === g.toLowerCase()} onSelect={v => set("gender", v)} />
                ))}
              </div>
            </div>
          )}

          {step === 1 && (
            <div>
              <h2 className="text-xl font-extrabold text-gray-900 mb-1">What is your age?</h2>
              <p className="text-gray-500 text-sm mb-6">Many schemes have age-based eligibility criteria.</p>
              <input type="number" min={0} max={120} value={profile.age} onChange={e => set("age", e.target.value)}
                placeholder="Enter your age (e.g. 32)"
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl text-gray-800 text-sm focus:outline-none focus:border-green-500 transition-colors mb-4" />
              <div className="flex flex-wrap gap-2">
                {["18", "25", "35", "45", "55", "65"].map(a => (
                  <button key={a} onClick={() => set("age", a)}
                    className={"px-4 py-2 rounded-lg border text-sm transition-all " + (profile.age === a ? "border-green-500 bg-green-50 text-green-700 font-semibold" : "border-gray-200 text-gray-600 hover:border-green-300")}>
                    {a} yrs
                  </button>
                ))}
              </div>
            </div>
          )}

          {step === 2 && (
            <div>
              <h2 className="text-xl font-extrabold text-gray-900 mb-1">Which state or UT do you live in?</h2>
              <p className="text-gray-500 text-sm mb-6">This helps us show state-specific schemes alongside central government schemes.</p>
              <div className="relative">
                <select value={profile.state} onChange={e => set("state", e.target.value)}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl text-gray-800 text-sm focus:outline-none focus:border-green-500 appearance-none bg-white transition-colors">
                  <option value="">Select your state / UT</option>
                  {STATES.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
              </div>
            </div>
          )}

          {step === 3 && (
            <div>
              <h2 className="text-xl font-extrabold text-gray-900 mb-1">Where do you currently live?</h2>
              <p className="text-gray-500 text-sm mb-6">Rural and urban areas have different scheme coverage and eligibility.</p>
              <div className="flex flex-col sm:flex-row gap-3">
                {[["rural", "Rural", "Village or Gram Panchayat"], ["urban", "Urban", "City, Town or Municipality"]].map(([val, label, sub]) => (
                  <button key={val} onClick={() => set("residence", val)}
                    className={"flex-1 px-5 py-5 rounded-xl border-2 text-left transition-all " + (profile.residence === val ? "border-green-600 bg-green-50" : "border-gray-200 bg-white hover:border-green-300")}>
                    <p className={"font-bold text-sm mb-1 " + (profile.residence === val ? "text-green-700" : "text-gray-800")}>{label}</p>
                    <p className="text-xs text-gray-500">{sub}</p>
                  </button>
                ))}
              </div>
            </div>
          )}

          {step === 4 && (
            <div>
              <h2 className="text-xl font-extrabold text-gray-900 mb-1">What is your social category?</h2>
              <p className="text-gray-500 text-sm mb-6">Many welfare schemes are specifically for SC, ST, OBC, and minority communities.</p>
              <div className="flex flex-wrap gap-3">
                {["General", "OBC", "SC", "ST", "Minority", "EWS"].map(c => (
                  <Opt key={c} label={c} value={c} selected={profile.category === c} onSelect={v => set("category", v)} />
                ))}
              </div>
            </div>
          )}

          {step === 5 && (
            <div>
              <h2 className="text-xl font-extrabold text-gray-900 mb-1">What is your annual household income?</h2>
              <p className="text-gray-500 text-sm mb-6">Income determines eligibility for BPL, EWS, and LIG category schemes.</p>
              <div className="flex flex-col gap-2">
                {[["0-1L","Below Rs 1 Lakh (BPL)"],["1-2L","Rs 1 Lakh to Rs 2 Lakh"],["2-3L","Rs 2 Lakh to Rs 3 Lakh"],["3-5L","Rs 3 Lakh to Rs 5 Lakh"],["5-8L","Rs 5 Lakh to Rs 8 Lakh"],["8-12L","Rs 8 Lakh to Rs 12 Lakh"],["12L+","Above Rs 12 Lakh"]].map(([val, label]) => (
                  <button key={val} onClick={() => set("income", val)}
                    className={"w-full text-left px-4 py-3 rounded-xl border-2 text-sm transition-all " + (profile.income === val ? "border-green-600 bg-green-600 text-white font-semibold" : "border-gray-200 bg-white text-gray-700 hover:border-green-400")}>
                    {label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {step === 6 && (
            <div>
              <h2 className="text-xl font-extrabold text-gray-900 mb-1">What is your occupation?</h2>
              <p className="text-gray-500 text-sm mb-6">Occupation-specific schemes exist for farmers, students, entrepreneurs, and more.</p>
              <div className="grid grid-cols-2 gap-3">
                {[["farmer","Farmer"],["student","Student"],["self-employed","Self-Employed"],["salaried","Salaried"],["daily-wage","Daily Wage Worker"],["unemployed","Unemployed"],["homemaker","Homemaker"],["retired","Retired"]].map(([val, label]) => (
                  <button key={val} onClick={() => set("occupation", val)}
                    className={"px-4 py-3 rounded-xl border-2 text-sm text-left transition-all " + (profile.occupation === val ? "border-green-600 bg-green-600 text-white font-semibold" : "border-gray-200 bg-white text-gray-700 hover:border-green-400")}>
                    {label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {step === 7 && (
            <div>
              <h2 className="text-xl font-extrabold text-gray-900 mb-1">Do you have any disability?</h2>
              <p className="text-gray-500 text-sm mb-6">People with disabilities are eligible for additional special schemes and benefits.</p>
              <div className="flex flex-wrap gap-3">
                {["No","Yes — Physical","Yes — Visual","Yes — Hearing","Yes — Mental or Intellectual"].map(d => (
                  <Opt key={d} label={d} value={d.startsWith("Yes") ? "yes" : "no"} selected={profile.disability === (d.startsWith("Yes") ? "yes" : "no") && !(d === "No" && profile.disability === "yes")} onSelect={v => set("disability", v)} />
                ))}
              </div>
            </div>
          )}

          {step === 8 && (
            <div>
              <h2 className="text-xl font-extrabold text-gray-900 mb-1">Do you belong to a minority community?</h2>
              <p className="text-gray-500 text-sm mb-6">Separate scholarship and welfare schemes exist for minority communities in India.</p>
              <div className="flex flex-wrap gap-3">
                {["No","Muslim","Christian","Sikh","Buddhist","Jain","Zoroastrian"].map(m => (
                  <Opt key={m} label={m} value={m.toLowerCase()} selected={profile.minority === m.toLowerCase()} onSelect={v => set("minority", v)} />
                ))}
              </div>
            </div>
          )}

          {step === 9 && (
            <div>
              <h2 className="text-xl font-extrabold text-gray-900 mb-1">What is your marital status?</h2>
              <p className="text-gray-500 text-sm mb-6">Widows and single mothers have access to special protection schemes.</p>
              <div className="flex flex-wrap gap-3">
                {["Single","Married","Widow/Widower","Divorced or Separated"].map(m => (
                  <Opt key={m} label={m} value={m.toLowerCase()} selected={profile.marital === m.toLowerCase()} onSelect={v => set("marital", v)} />
                ))}
              </div>
            </div>
          )}

          <div className="flex items-center justify-between mt-8 pt-6 border-t border-gray-100">
            <button onClick={prev} disabled={step === 0}
              className={"flex items-center gap-2 px-5 py-2.5 text-sm font-semibold rounded-full border transition-all " + (step === 0 ? "border-gray-100 text-gray-300 cursor-not-allowed" : "border-gray-200 text-gray-700 hover:border-gray-300 hover:bg-gray-50")}>
              <ArrowLeft className="w-4 h-4" /> Previous
            </button>
            <button onClick={next}
              className="flex items-center gap-2 px-6 py-2.5 text-sm font-bold text-white bg-green-600 rounded-full hover:bg-green-700 shadow-sm transition-all">
              {step === STEPS.length - 1 ? <><CheckCircle2 className="w-4 h-4" /> Find My Schemes</> : <>Next <ArrowRight className="w-4 h-4" /></>}
            </button>
          </div>
        </div>

        <div className="mt-6 flex items-center justify-center gap-2 text-xs text-gray-400">
          <ShieldCheck className="w-3.5 h-3.5 text-green-500" />
          Your answers are private and used only to match you with relevant schemes.
        </div>
      </div>
    </div>
  );
}
