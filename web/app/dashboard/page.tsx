"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/lib/auth-context";
import { apiClient } from "@/lib/api-client";
import { AnimatedTabs, AnimatedTabContent } from "@/components/ui/animated-tabs";
import {
  Sparkles, FileText, Bell, Users, Zap, MapPin, Calendar,
  Home, CheckCircle2, ArrowRight, Award, Clock, Settings,
  LogOut, Star, ChevronRight, TrendingUp, RefreshCw, AlertCircle,
  Database, ShieldCheck
} from "lucide-react";

// ─── Types ────────────────────────────────────────────────────
interface Application { 
  id: string; 
  scheme?: { id?: string; title?: string; name?: string; category_name?: string; state?: string }; 
  status: string; 
  reference_number: string; 
  created_at?: string; 
  application_date?: string;
  notes?: string; 
}

interface AppSummary { 
  total_applications?: number;
  total?: number; 
  pending?: number; 
  in_progress?: number; 
  active_applications?: number;
  approved?: number; 
  rejected?: number; 
  disbursed?: number;
  applications: Application[]; 
}

interface AlertItem { 
  id: string; 
  title: string; 
  message: string; 
  alert_type: string; 
  read: boolean; 
  created_at: string; 
}

interface FamilyMember { 
  id: string; 
  name: string; 
  relationship: string; 
  age?: number; 
  occupation?: string;
  eligible_schemes_count?: number; 
}

const TABS = [
  { id: "overview",     label: "Overview",      icon: <Home className="w-4 h-4" /> },
  { id: "schemes",      label: "My Schemes",    icon: <Star className="w-4 h-4" /> },
  { id: "applications", label: "Applications",  icon: <FileText className="w-4 h-4" /> },
  { id: "alerts",       label: "Alerts",        icon: <Bell className="w-4 h-4" /> },
  { id: "family",       label: "Family",        icon: <Users className="w-4 h-4" /> },
];

function StatCard({ icon, label, value, sub, color, delay }: { icon: React.ReactNode; label: string; value: string | number; sub?: string; color: string; delay: number }) {
  const colorMap: Record<string, string> = {
    green: "border-emerald-200 dark:border-emerald-800/40 bg-emerald-50/80 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400",
    blue: "border-blue-200 dark:border-blue-800/40 bg-blue-50/80 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400",
    amber: "border-amber-200 dark:border-amber-800/40 bg-amber-50/80 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400",
    purple: "border-purple-200 dark:border-purple-800/40 bg-purple-50/80 dark:bg-purple-950/40 text-purple-600 dark:text-purple-400",
  };
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay, duration: 0.4 }}
      className="flex items-center gap-4 p-5 rounded-2xl border border-gray-200 dark:border-white/10 bg-white/80 dark:bg-slate-900/60 backdrop-blur-md hover:shadow-lg transition-all">
      <div className={"w-12 h-12 rounded-xl flex items-center justify-center shrink-0 border " + colorMap[color]}>{icon}</div>
      <div>
        <p className="text-xl font-extrabold text-gray-900 dark:text-white">{value}</p>
        <p className="text-xs font-semibold text-gray-700 dark:text-gray-300">{label}</p>
        {sub && <p className="text-[11px] text-gray-400 dark:text-gray-500 mt-0.5">{sub}</p>}
      </div>
    </motion.div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const s = status?.toUpperCase();
  const cls = s === "APPROVED" || s === "COMPLETED" || s === "DISBURSED" ? "bg-emerald-100 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/40"
    : s === "REJECTED" ? "bg-red-100 dark:bg-red-950/50 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-800/40"
    : s === "IN_PROGRESS" || s === "UNDER_REVIEW" || s === "SUBMITTED" ? "bg-blue-100 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800/40"
    : "bg-amber-100 dark:bg-amber-950/50 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800/40";
  return <span className={"text-[11px] font-semibold px-2.5 py-1 rounded-full " + cls}>{status?.replace(/_/g, " ")}</span>;
}

// ─── Overview Tab ─────────────────────────────────────────────
function OverviewTab({ user, appSummary, alerts, loading }: { user: any; appSummary: AppSummary | null; alerts: AlertItem[]; loading: boolean }) {
  const unread = alerts.filter(a => !a.read).length;
  const totalApps = appSummary?.total_applications ?? appSummary?.total ?? appSummary?.applications?.length ?? 0;
  const activeApps = appSummary?.active_applications ?? appSummary?.in_progress ?? 0;
  const approvedApps = appSummary?.approved ?? 0;

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
        className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-emerald-900/90 via-green-800/90 to-teal-900/90 backdrop-blur-md border border-white/10 p-6 text-white shadow-xl">
        <div className="absolute top-0 right-0 w-48 h-48 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl" />
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-emerald-400/10 rounded-full translate-y-1/2 -translate-x-1/2 blur-xl" />
        <div className="relative">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/15 text-xs font-semibold text-emerald-200 backdrop-blur mb-2">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Verified Citizen Profile</span>
          </div>
          <p className="text-emerald-100 text-sm mb-0.5">Welcome back 👋</p>
          <h2 className="text-2xl font-extrabold mb-1">{user?.full_name?.split(" ")[0] || "Citizen"}!</h2>
          <p className="text-emerald-200 text-sm">Your personalised citizen benefit dashboard is up to date and active.</p>
          <div className="mt-4 flex flex-wrap gap-2">
            <Link href="/find-scheme" className="flex items-center gap-1.5 px-4 py-2 bg-white text-emerald-900 text-xs font-bold rounded-full hover:bg-emerald-50 transition-colors shadow-sm">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" /> Find New Schemes
            </Link>
            <Link href="/assistant" className="flex items-center gap-1.5 px-4 py-2 bg-white/15 text-white text-xs font-bold rounded-full hover:bg-white/25 transition-colors border border-white/25">
              Ask AI Assistant
            </Link>
          </div>
        </div>
      </motion.div>

      {/* Stats Cards */}
      <div>
        <h3 className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-4">Your Live Stats</h3>
        {loading ? (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[0,1,2,3].map(i => <div key={i} className="h-24 bg-white/50 dark:bg-slate-900/40 rounded-2xl animate-pulse" />)}
          </div>
        ) : (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard icon={<CheckCircle2 className="w-5 h-5" />} label="Applications" value={totalApps} sub={`${approvedApps} approved`} color="green" delay={0.1} />
            <StatCard icon={<FileText className="w-5 h-5" />} label="In Progress" value={activeApps} sub="Being reviewed" color="blue" delay={0.15} />
            <StatCard icon={<Bell className="w-5 h-5" />} label="Unread Alerts" value={unread} sub={`${alerts.length} total`} color="amber" delay={0.2} />
            <StatCard icon={<Award className="w-5 h-5" />} label="Schemes Catalog" value="55 Available" sub="Central & State" color="purple" delay={0.25} />
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div>
        <h3 className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-4">Quick Actions</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {[
            { href: "/find-scheme", icon: <Sparkles className="w-5 h-5 text-amber-500" />, label: "Find Schemes For Me", desc: "Personalised eligibility check" },
            { href: "/schemes", icon: <Star className="w-5 h-5 text-emerald-500" />, label: "Browse All Schemes", desc: "55 government schemes" },
            { href: "/simulator", icon: <Zap className="w-5 h-5 text-purple-500" />, label: "What-If Simulator", desc: "Simulate eligibility changes" },
            { href: "/documents", icon: <FileText className="w-5 h-5 text-blue-500" />, label: "Document Vault", desc: "Manage your documents" },
            { href: "/family", icon: <Users className="w-5 h-5 text-teal-500" />, label: "Family Mode", desc: "Manage family profiles" },
            { href: "/locations", icon: <MapPin className="w-5 h-5 text-rose-500" />, label: "Nearby Centers", desc: "Find CSC and govt offices" },
          ].map((a, i) => (
            <motion.div key={a.href} initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.05 * i }} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Link href={a.href} className="flex items-center gap-3 p-4 rounded-xl border border-gray-200 dark:border-white/10 bg-white/80 dark:bg-slate-900/60 backdrop-blur-md hover:border-emerald-400 hover:shadow-md transition-all group">
                <div className="w-10 h-10 rounded-lg bg-gray-50 dark:bg-slate-800/80 group-hover:bg-emerald-50 dark:group-hover:bg-emerald-950/40 flex items-center justify-center transition-colors shrink-0">{a.icon}</div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-gray-800 dark:text-gray-200 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">{a.label}</p>
                  <p className="text-[11px] text-gray-500 dark:text-gray-400 truncate">{a.desc}</p>
                </div>
                <ChevronRight className="w-4 h-4 text-gray-300 dark:text-gray-600 group-hover:text-emerald-400 shrink-0 transition-colors" />
              </Link>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Recent Applications from DB */}
      {appSummary && appSummary.applications && appSummary.applications.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Recent Applications</h3>
            <Link href="/applications" className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold hover:underline flex items-center gap-1">
              View All in Tracker <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
          <div className="space-y-3">
            {appSummary.applications.slice(0, 3).map((app, i) => (
              <motion.div key={app.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.07 }}
                className="flex items-center gap-3 p-4 bg-white/80 dark:bg-slate-900/60 backdrop-blur-md rounded-xl border border-gray-200 dark:border-white/10 hover:border-emerald-300 transition-all">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-gray-900 dark:text-gray-100 line-clamp-1">
                    {app.scheme?.title || app.scheme?.name || "Government Scheme Application"}
                  </p>
                  <p className="text-xs text-gray-400 flex items-center gap-2 mt-0.5">
                    <span className="font-mono text-[11px] text-emerald-600 dark:text-emerald-400">{app.reference_number}</span>
                    <span>•</span>
                    <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {app.application_date ? new Date(app.application_date).toLocaleDateString("en-IN") : "Recent"}</span>
                  </p>
                </div>
                <StatusBadge status={app.status} />
              </motion.div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Applications Tab ─────────────────────────────────────────
function ApplicationsTab({ appSummary, loading, onRefresh }: { appSummary: AppSummary | null; loading: boolean; onRefresh: () => void }) {
  const apps = appSummary?.applications || [];
  const total = appSummary?.total_applications ?? appSummary?.total ?? apps.length;
  const approved = appSummary?.approved ?? 0;
  const inProgress = appSummary?.active_applications ?? appSummary?.in_progress ?? 0;
  const rejected = appSummary?.rejected ?? 0;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-bold text-gray-900 dark:text-white">Your Applications</h3>
        <button onClick={onRefresh} className="flex items-center gap-1.5 text-xs font-semibold text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/40 px-3 py-1.5 rounded-full hover:bg-emerald-50 dark:hover:bg-slate-800 transition-colors">
          <RefreshCw className="w-3.5 h-3.5" /> Refresh
        </button>
      </div>
      {loading ? (
        <div className="space-y-3">{[0,1,2].map(i => <div key={i} className="h-20 bg-white/50 dark:bg-slate-900/40 rounded-xl animate-pulse" />)}</div>
      ) : apps.length === 0 ? (
        <div className="text-center py-16 text-gray-400 dark:text-gray-500">
          <FileText className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p className="font-semibold text-gray-600 dark:text-gray-400 mb-1">No applications yet</p>
          <p className="text-sm mb-4">Find schemes you are eligible for and track them here.</p>
          <Link href="/schemes" className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-bold text-white bg-gradient-to-r from-emerald-600 to-teal-600 rounded-full hover:from-emerald-700 hover:to-teal-700 transition-colors shadow-sm">
            <Sparkles className="w-4 h-4" /> Browse Schemes
          </Link>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-4 gap-3 mb-2">
            {[["Total", total, "gray"], ["Approved", approved, "green"], ["In Progress", inProgress, "blue"], ["Rejected", rejected, "red"]].map(([label, val, c]) => (
              <div key={String(label)} className={"p-3 rounded-xl border backdrop-blur-md text-center " + 
                (c === "green" ? "border-emerald-200 dark:border-emerald-800/40 bg-emerald-50/80 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300" : 
                 c === "blue" ? "border-blue-200 dark:border-blue-800/40 bg-blue-50/80 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300" : 
                 c === "red" ? "border-red-200 dark:border-red-800/40 bg-red-50/80 dark:bg-red-950/40 text-red-700 dark:text-red-300" : 
                 "border-gray-200 dark:border-white/10 bg-white/70 dark:bg-slate-900/60 text-gray-700 dark:text-gray-300")}>
                <p className="text-xl font-extrabold text-gray-900 dark:text-white">{val}</p>
                <p className="text-[10px] text-gray-500 dark:text-gray-400">{label}</p>
              </div>
            ))}
          </div>
          {apps.map((app, i) => (
            <motion.div key={app.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}
              className="p-5 bg-white/80 dark:bg-slate-900/60 backdrop-blur-md rounded-xl border border-gray-200 dark:border-white/10 hover:shadow-sm transition-all">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-gray-900 dark:text-gray-100">
                    {app.scheme?.title || app.scheme?.name || "Scheme Application"}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Ref: <span className="font-mono text-emerald-600 dark:text-emerald-400">{app.reference_number}</span></p>
                  <p className="text-xs text-gray-400 flex items-center gap-1 mt-1">
                    <Clock className="w-3 h-3" /> {app.application_date ? new Date(app.application_date).toLocaleDateString("en-IN") : "Recent"}
                  </p>
                  {app.notes && <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 italic">{app.notes}</p>}
                </div>
                <div className="flex flex-col items-end gap-2">
                  <StatusBadge status={app.status} />
                  <Link href={`/applications/${app.id}`} className="text-xs text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-0.5">
                    Details <ArrowRight className="w-3 h-3" />
                  </Link>
                </div>
              </div>
            </motion.div>
          ))}
        </>
      )}
      <Link href="/applications" className="flex items-center justify-center gap-2 py-3 text-sm font-semibold text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/40 rounded-xl hover:bg-emerald-50 dark:hover:bg-slate-800/60 transition-colors">
        Open Full Applications Tracker <ArrowRight className="w-4 h-4" />
      </Link>
    </div>
  );
}

// ─── Alerts Tab ───────────────────────────────────────────────
function AlertsTab({ alerts, loading, onMarkRead, onMarkAll }: { alerts: AlertItem[]; loading: boolean; onMarkRead: (id: string) => void; onMarkAll: () => void; }) {
  const typeColor = (t: string) => t === "SUCCESS" || t === "SCHEME_MATCH" ? "border-emerald-500" : t === "WARNING" || t === "DEADLINE" ? "border-amber-500" : t === "ERROR" ? "border-red-500" : "border-blue-500";
  const unread = alerts.filter(a => !a.read).length;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="font-bold text-gray-900 dark:text-white">
          Smart Alerts {unread > 0 && <span className="ml-2 text-xs bg-red-100 dark:bg-red-950/50 text-red-600 dark:text-red-300 font-bold px-2 py-0.5 rounded-full">{unread} new</span>}
        </h3>
        {unread > 0 && <button onClick={onMarkAll} className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:underline">Mark all as read</button>}
      </div>
      {loading ? (
        <div className="space-y-3">{[0,1,2,3].map(i => <div key={i} className="h-16 bg-white/50 dark:bg-slate-900/40 rounded-xl animate-pulse" />)}</div>
      ) : alerts.length === 0 ? (
        <div className="text-center py-16 text-gray-400 dark:text-gray-500">
          <Bell className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p className="font-semibold text-gray-600 dark:text-gray-400">No alerts yet</p>
          <p className="text-sm">We will notify you when new schemes match your profile.</p>
        </div>
      ) : (
        alerts.map((a, i) => (
          <motion.div key={a.id} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.06 }}
            onClick={() => !a.read && onMarkRead(a.id)}
            className={"p-4 rounded-xl border-l-4 bg-white/80 dark:bg-slate-900/60 backdrop-blur-md cursor-pointer hover:shadow-sm transition-all border-y border-r border-gray-200 dark:border-white/10 " + typeColor(a.alert_type) + (a.read ? " opacity-60" : "")}>
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-bold text-gray-900 dark:text-gray-100">{a.title}</p>
                  {!a.read && <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />}
                </div>
                <p className="text-xs text-gray-600 dark:text-gray-300 mt-0.5">{a.message}</p>
              </div>
              <span className="text-[10px] text-gray-400 shrink-0 mt-0.5">{new Date(a.created_at).toLocaleDateString("en-IN")}</span>
            </div>
          </motion.div>
        ))
      )}
    </div>
  );
}

// ─── Family Tab ───────────────────────────────────────────────
function FamilyTab({ members, loading, onRefresh }: { members: FamilyMember[]; loading: boolean; onRefresh: () => void }) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-bold text-gray-900 dark:text-white">Family Members</h3>
        <div className="flex gap-2">
          <button onClick={onRefresh} className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400 border border-gray-200 dark:border-white/10 px-3 py-1.5 rounded-full hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors">
            <RefreshCw className="w-3.5 h-3.5" /> Refresh
          </button>
          <Link href="/family" className="text-xs font-semibold text-white bg-gradient-to-r from-emerald-600 to-teal-600 px-3 py-1.5 rounded-full hover:from-emerald-700 hover:to-teal-700 transition-colors shadow-sm">+ Add Member</Link>
        </div>
      </div>
      {loading ? (
        <div className="space-y-3">{[0,1,2].map(i => <div key={i} className="h-20 bg-white/50 dark:bg-slate-900/40 rounded-xl animate-pulse" />)}</div>
      ) : members.length === 0 ? (
        <div className="text-center py-16 text-gray-400 dark:text-gray-500">
          <Users className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p className="font-semibold text-gray-600 dark:text-gray-400 mb-1">No family members added</p>
          <p className="text-sm mb-4">Add family members to find schemes for your entire household.</p>
          <Link href="/family" className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-bold text-white bg-gradient-to-r from-emerald-600 to-teal-600 rounded-full hover:from-emerald-700 hover:to-teal-700 transition-colors">
            Add Family Member
          </Link>
        </div>
      ) : (
        members.map((m, i) => (
          <motion.div key={m.id} initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.07 }}
            className="flex items-center gap-4 p-4 bg-white/80 dark:bg-slate-900/60 backdrop-blur-md rounded-xl border border-gray-200 dark:border-white/10 hover:border-emerald-300 hover:shadow-sm transition-all">
            <div className="w-12 h-12 rounded-full bg-emerald-100 dark:bg-emerald-950/60 flex items-center justify-center text-emerald-700 dark:text-emerald-300 font-black text-xl shrink-0">{m.name[0]}</div>
            <div className="flex-1">
              <p className="text-sm font-bold text-gray-900 dark:text-gray-100">{m.name}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">{m.relationship}{m.age ? ` · Age ${m.age}` : ""}{m.occupation ? ` · ${m.occupation}` : ""}</p>
            </div>
            {m.eligible_schemes_count != null && (
              <div className="text-right shrink-0">
                <p className="text-lg font-extrabold text-emerald-600 dark:text-emerald-400">{m.eligible_schemes_count}</p>
                <p className="text-[10px] text-gray-400">schemes</p>
              </div>
            )}
          </motion.div>
        ))
      )}
      <Link href="/family" className="flex items-center justify-center gap-2 py-3 text-sm font-semibold text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/40 rounded-xl hover:bg-emerald-50 dark:hover:bg-slate-800/60 transition-colors">
        Open Family Mode <ArrowRight className="w-4 h-4" />
      </Link>
    </div>
  );
}

// ─── Schemes Tab ──────────────────────────────────────────────
function MySchemesTab() {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-bold text-gray-900 dark:text-white">Find Schemes For You</h3>
        <Link href="/find-scheme" className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-800/40 px-3 py-1.5 rounded-full hover:bg-emerald-50 dark:hover:bg-slate-800 transition-colors flex items-center gap-1">
          <Sparkles className="w-3 h-3" /> Re-run Finder
        </Link>
      </div>
      <div className="bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/30 rounded-2xl p-6 text-center backdrop-blur-md">
        <Sparkles className="w-10 h-10 text-emerald-600 dark:text-emerald-400 mx-auto mb-3" />
        <h3 className="font-extrabold text-gray-900 dark:text-white mb-1">Personalised Scheme Matching</h3>
        <p className="text-sm text-gray-600 dark:text-gray-300 mb-4 max-w-sm mx-auto">Answer 10 quick questions and we will show every government scheme you are eligible for across Central and State governments.</p>
        <Link href="/find-scheme" className="inline-flex items-center gap-2 px-6 py-3 text-sm font-bold text-white bg-gradient-to-r from-emerald-600 to-teal-600 rounded-full hover:from-emerald-700 hover:to-teal-700 transition-colors shadow-md">
          <Sparkles className="w-4 h-4 text-amber-300" /> Find My Schemes Now
        </Link>
      </div>
      <div className="flex flex-col sm:flex-row gap-3">
        <Link href="/schemes" className="flex-1 flex items-center justify-center gap-2 py-3 text-sm font-semibold text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/40 rounded-xl hover:bg-emerald-50 dark:hover:bg-slate-800/60 transition-colors">
          Browse All 55+ Government Schemes <ArrowRight className="w-4 h-4" />
        </Link>
        <Link href="/schemes?cat=education" className="flex-1 flex items-center justify-center gap-2 py-3 text-sm font-semibold text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-white/10 rounded-xl hover:bg-gray-50 dark:hover:bg-slate-800/60 transition-colors">
          Browse by Category
        </Link>
      </div>
    </div>
  );
}

// ─── Main Dashboard ───────────────────────────────────────────
export default function DashboardPage() {
  const [activeTab, setActiveTab] = useState("overview");
  const { user, logout } = useAuth();
  const router = useRouter();

  const [appSummary, setAppSummary] = useState<AppSummary | null>(null);
  const [alerts, setAlerts] = useState<AlertItem[]>([]);
  const [family, setFamily] = useState<FamilyMember[]>([]);
  const [loadingApps, setLoadingApps] = useState(false);
  const [loadingAlerts, setLoadingAlerts] = useState(false);
  const [loadingFamily, setLoadingFamily] = useState(false);

  const fetchApps = async () => {
    setLoadingApps(true);
    try { 
      const r = await apiClient.get("/applications"); 
      setAppSummary(r.data); 
    }
    catch { /* not logged in or no apps yet */ }
    finally { setLoadingApps(false); }
  };

  const fetchAlerts = async () => {
    setLoadingAlerts(true);
    try { 
      const r = await apiClient.get("/alerts"); 
      setAlerts(r.data); 
    }
    catch { /* ignore */ }
    finally { setLoadingAlerts(false); }
  };

  const fetchFamily = async () => {
    setLoadingFamily(true);
    try { 
      const r = await apiClient.get("/family/members"); 
      setFamily(r.data); 
    }
    catch { /* ignore */ }
    finally { setLoadingFamily(false); }
  };

  useEffect(() => {
    if (user) { 
      fetchApps(); 
      fetchAlerts(); 
      fetchFamily(); 
    }
  }, [user]);

  const markAlertRead = async (id: string) => {
    try {
      await apiClient.patch(`/alerts/${id}/read`);
      setAlerts(prev => prev.map(a => a.id === id ? { ...a, read: true } : a));
    } catch { /* ignore */ }
  };

  const markAllRead = async () => {
    try {
      await apiClient.post("/alerts/read-all");
      setAlerts(prev => prev.map(a => ({ ...a, read: true })));
    } catch { /* ignore */ }
  };

  const handleLogout = () => { logout(); router.push("/"); };

  return (
    <div className="min-h-screen bg-transparent text-gray-900 dark:text-gray-100">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }}
        className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-gray-200 dark:border-white/10 sticky top-0 z-40 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-2.5 shrink-0">
              <div className="w-9 h-9 rounded-full bg-gradient-to-r from-emerald-600 to-teal-600 flex items-center justify-center text-white font-black text-base shadow-sm">
                {user?.full_name?.[0] || "U"}
              </div>
              <div className="hidden sm:block">
                <p className="text-xs font-bold text-gray-900 dark:text-white leading-tight">{user?.full_name || "Citizen"}</p>
                <p className="text-[10px] text-emerald-600 dark:text-emerald-400 flex items-center gap-1 font-medium">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block" /> Active Citizen Account
                </p>
              </div>
            </div>
            <div className="flex-1 overflow-x-auto">
              <AnimatedTabs tabs={TABS} activeTab={activeTab} onChange={setActiveTab} />
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <Link href="/profile" className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-white/10 rounded-full hover:border-emerald-400 hover:text-emerald-600 transition-colors">
                <Settings className="w-3.5 h-3.5" /> Profile
              </Link>
              <button onClick={handleLogout} className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-red-500 dark:text-red-400 border border-red-200 dark:border-red-900/40 rounded-full hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors">
                <LogOut className="w-3.5 h-3.5" /> Sign Out
              </button>
            </div>
          </div>
        </div>
      </motion.div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <AnimatedTabContent key={activeTab} tabKey={activeTab}>
          {activeTab === "overview" && (
            <OverviewTab user={user} appSummary={appSummary} alerts={alerts} loading={loadingApps || loadingAlerts} />
          )}
          {activeTab === "schemes" && <MySchemesTab />}
          {activeTab === "applications" && (
            <ApplicationsTab appSummary={appSummary} loading={loadingApps} onRefresh={fetchApps} />
          )}
          {activeTab === "alerts" && (
            <AlertsTab alerts={alerts} loading={loadingAlerts} onMarkRead={markAlertRead} onMarkAll={markAllRead} />
          )}
          {activeTab === "family" && (
            <FamilyTab members={family} loading={loadingFamily} onRefresh={fetchFamily} />
          )}
        </AnimatedTabContent>
      </div>
    </div>
  );
}
