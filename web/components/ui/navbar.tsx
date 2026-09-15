"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import {
  Globe, User, LogOut, Sparkles, Bell, Users,
  HeartHandshake, MapPin, Calendar, CheckCircle2,
  ChevronDown, Menu, X, Sun, Moon, Search
} from "lucide-react";
import api from "@/lib/api-client";

const NAV_LINKS = [
  { href: "/schemes", label: "Schemes" },
  { href: "/find-scheme", label: "Find Schemes For You" },
  { href: "/categories", label: "Categories" },
  { href: "/assistant", label: "AI Assistant", icon: "sparkles" },
];

const MORE_LINKS = [
  { href: "/family", label: "Family Mode", icon: "users" },
  { href: "/life-events", label: "Life Events", icon: "calendar" },
  { href: "/community", label: "Community", icon: "hearts" },
  { href: "/locations", label: "Support Centers", icon: "map" },
  { href: "/documents", label: "Document Vault" },
  { href: "/applications", label: "Application Tracker" },
  { href: "/simulator", label: "What-If Simulator" },
  { href: "/alerts", label: "Smart Alerts" },
];

const LANGUAGES = ["English", "हिंदी", "தமிழ்", "తెలుగు", "ಕನ್ನಡ", "मराठी", "বাংলা", "ગુજરાતી", "ਪੰਜਾਬੀ", "മലയാളം", "ଓଡ଼ିଆ", "অসমীয়া", "اردو", "कोंकणी", "संस्कृतम्"];

const LANG_CODES: Record<string, string> = {
  "English": "en", "हिंदी": "hi", "தமிழ்": "ta", "తెలుగు": "te",
  "ಕನ್ನಡ": "kn", "मराठी": "mr", "বাংলা": "bn", "ગુજરાતી": "gu",
  "ਪੰਜਾਬੀ": "pa", "മലയാളം": "ml", "ଓଡ଼ିଆ": "or", "অসমীয়া": "as",
  "اردو": "ur", "कोंकणी": "kok", "संस्कृतम्": "sa",
};

export function Navbar() {
  const { user, logout } = useAuth();
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [showNotif, setShowNotif] = useState(false);
  const [recentAlerts, setRecentAlerts] = useState<any[]>([]);
  const [showMore, setShowMore] = useState(false);
  const [showLang, setShowLang] = useState(false);
  const [showMobile, setShowMobile] = useState(false);
  const [dark, setDark] = useState(true);
  const [lang, setLang] = useState("English");
  const [scrolled, setScrolled] = useState(false);

  // ── On mount: restore saved dark mode + language ──────────────
  useEffect(() => {
    const savedDark = localStorage.getItem("sm_dark") !== "0";
    const savedLang = localStorage.getItem("sm_lang") || "English";
    setDark(savedDark);
    setLang(savedLang);
    if (savedDark) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
    document.documentElement.setAttribute("lang", LANG_CODES[savedLang] || "en");
  }, []);

  // ── Scroll shadow ─────────────────────────────────────────────
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 4);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // ── Dark mode toggle ──────────────────────────────────────────
  const toggleDark = () => {
    const next = !dark;
    setDark(next);
    localStorage.setItem("sm_dark", next ? "1" : "0");
    if (next) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  };

  // ── Language select ───────────────────────────────────────────
  const selectLang = (l: string) => {
    setLang(l);
    setShowLang(false);
    localStorage.setItem("sm_lang", l);
    document.documentElement.setAttribute("lang", LANG_CODES[l] || "en");
    // Show toast feedback
    const toast = document.createElement("div");
    toast.textContent = `Language set to ${l}`;
    toast.style.cssText = "position:fixed;bottom:24px;left:50%;transform:translateX(-50%);background:#16a34a;color:white;padding:10px 20px;border-radius:999px;font-size:13px;font-weight:600;z-index:99999;box-shadow:0 4px 20px rgba(0,0,0,0.2)";
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 2500);
  };

  useEffect(() => {
    if (user) {
      api.get("/alerts/unread-count").then(r => setUnreadCount(r.data.unread_count || 0)).catch(() => {});
      api.get("/alerts?unread_only=true").then(r => setRecentAlerts(r.data.slice(0, 4))).catch(() => {});
    }
  }, [user]);

  const markAllRead = async () => {
    try { await api.post("/alerts/read-all"); setUnreadCount(0); setRecentAlerts([]); } catch {}
  };

  return (
    <>
      {/* ─── Top utility bar ─── */}
      <div className="bg-white py-1.5 hidden lg:block" style={{ borderBottom: "1px solid transparent" }} id="utility-bar">
        <div className="max-w-7xl mx-auto px-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {/* Emblem logo */}
            <div className="w-8 h-8 rounded-full overflow-hidden border border-amber-400/50 shadow-sm bg-white flex items-center justify-center p-0.5">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/logo-square.png" alt="Emblem" className="w-full h-full object-cover rounded-full" />
            </div>
            <span className="text-gray-300 font-thin text-2xl">|</span>
            <div className="flex flex-col">
              <span className="text-xs font-bold text-sathya-green-700 tracking-wide">Sathyamithra</span>
              <span className="text-[10px] text-gray-500">Honest Guide to Every Benefit You Deserve</span>
            </div>
            <span className="text-gray-300 font-thin text-2xl">|</span>
            <div className="text-[10px] text-gray-500 flex flex-col">
              <span className="font-semibold text-sathya-green-600">Digital India</span>
              <span>Citizen First · AI Powered</span>
            </div>
          </div>
          <div className="flex items-center gap-3 text-xs text-gray-600">
            <Link href="/about" className="hover:text-sathya-green-700">About</Link>
            <span>·</span>
            <Link href="/contact" className="hover:text-sathya-green-700">Contact</Link>
            <span>·</span>
            <Link href="/accessibility" className="hover:text-sathya-green-700">Accessibility</Link>
            <span>·</span>
            <span className="text-sathya-green-700 font-semibold">Helpline: 1800-XXX-XXXX</span>
          </div>
        </div>
      </div>

      {/* ─── Main navbar ─── */}
      <header className={`sticky top-0 z-50 w-full bg-white transition-shadow ${scrolled ? "shadow-md" : "shadow-sm"} border-b border-gray-100`}>
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between h-14 lg:h-16">

            {/* Logo */}
            <Link href="/" className="flex items-center gap-2.5 shrink-0 group">
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full overflow-hidden border-2 border-green-500/40 shadow-md group-hover:scale-105 transition-transform bg-white flex items-center justify-center p-0.5">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/logo-square.png"
                  alt="Sathyamithra Logo"
                  className="w-full h-full object-cover rounded-full"
                />
              </div>
              <div className="flex flex-col">
                <span className="font-extrabold text-sathya-green-700 text-lg sm:text-xl tracking-tight leading-tight group-hover:text-sathya-green-600 transition-colors">
                  Sathyamithra
                </span>
                <span className="text-[10px] text-gray-500 font-semibold tracking-wider -mt-0.5">
                  सत्यमित्र · Citizen Portal
                </span>
              </div>
            </Link>

            {/* Desktop nav */}
            <nav className="hidden lg:flex items-center gap-0.5">
              {NAV_LINKS.map(l => (
                <Link key={l.href} href={l.href} prefetch={false}
                  className="flex items-center gap-1 px-3 py-2 text-sm font-medium text-gray-700 rounded-md hover:text-sathya-green-700 hover:bg-green-50 transition-colors">
                  {l.icon === "sparkles" && <Sparkles className="w-3.5 h-3.5 text-sathya-saffron-500" />}
                  {l.label}
                </Link>
              ))}

              {/* More dropdown */}
              <div className="relative">
                <button onMouseEnter={() => setShowMore(true)} onMouseLeave={() => setShowMore(false)}
                  className="flex items-center gap-1 px-3 py-2 text-sm font-medium text-gray-700 rounded-md hover:text-sathya-green-700 hover:bg-green-50 transition-colors">
                  More <ChevronDown className="w-3.5 h-3.5" />
                </button>
                {showMore && (
                  <div onMouseEnter={() => setShowMore(true)} onMouseLeave={() => setShowMore(false)}
                    className="absolute top-full left-0 w-56 bg-white rounded-xl shadow-xl border border-gray-100 p-2 grid grid-cols-1 gap-0.5">
                    {MORE_LINKS.map(l => (
                      <Link key={l.href} href={l.href} prefetch={false}
                        className="px-3 py-2 text-sm text-gray-700 rounded-lg hover:bg-green-50 hover:text-sathya-green-700 transition-colors">
                        {l.label}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            </nav>

            {/* Right side */}
            <div className="flex items-center gap-2">
              {/* Language */}
              <div className="relative hidden lg:block">
                <button onClick={() => setShowLang(!showLang)}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-sathya-green-700 border border-green-200 bg-green-50 rounded-full hover:bg-green-100 transition-colors">
                  <Globe className="w-3.5 h-3.5" />{lang}<ChevronDown className="w-3 h-3" />
                </button>
                {showLang && (
                  <div className="absolute right-0 top-full mt-1 w-48 bg-white rounded-xl shadow-xl border border-gray-100 p-2 max-h-64 overflow-y-auto z-50">
                    {LANGUAGES.map(l => (
                      <button key={l} onClick={() => selectLang(l)}
                        className={`block w-full text-left px-3 py-1.5 text-xs rounded-lg transition-colors ${l === lang ? "bg-green-100 text-sathya-green-700 font-semibold" : "text-gray-700 hover:bg-gray-50"}`}>
                        {l}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Dark mode */}
              <button onClick={toggleDark}
                className="hidden lg:flex w-8 h-8 items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 transition-colors text-gray-600"
                title={dark ? "Switch to Light Mode" : "Switch to Dark Mode"}>
                {dark ? <Sun className="w-4 h-4 text-yellow-500" /> : <Moon className="w-4 h-4" />}
              </button>

              {/* Notifications */}
              {user && (
                <div className="relative">
                  <button onClick={() => setShowNotif(!showNotif)}
                    className="relative w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors text-gray-600">
                    <Bell className="w-4 h-4" />
                    {unreadCount > 0 && (
                      <span className="absolute top-0.5 right-0.5 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-red-600 text-[9px] font-bold text-white">
                        {unreadCount > 9 ? "9+" : unreadCount}
                      </span>
                    )}
                  </button>
                  {showNotif && (
                    <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-xl border border-gray-100 p-4 z-50">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="text-xs font-bold text-gray-800">Notifications</h4>
                        {unreadCount > 0 && <button onClick={markAllRead} className="text-[11px] text-sathya-green-600 hover:underline">Mark all read</button>}
                      </div>
                      {recentAlerts.length === 0 ? (
                        <p className="text-xs text-gray-400 text-center py-4">No unread alerts.</p>
                      ) : (
                        <div className="space-y-2">
                          {recentAlerts.map((a) => (
                            <Link key={a.id} href={a.action_url || "/alerts"} onClick={() => setShowNotif(false)}
                              className="block p-2.5 rounded-lg bg-gray-50 hover:bg-green-50 transition-colors">
                              <p className="text-xs font-semibold text-gray-800 line-clamp-1">{a.title}</p>
                              <p className="text-[11px] text-gray-500 line-clamp-2 mt-0.5">{a.message}</p>
                            </Link>
                          ))}
                        </div>
                      )}
                      <div className="border-t border-gray-100 mt-3 pt-2 text-center">
                        <Link href="/alerts" onClick={() => setShowNotif(false)} className="text-xs font-bold text-sathya-green-700 hover:underline">View All Alerts →</Link>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Auth */}
              {user ? (
                <div className="flex items-center gap-2">
                  <Link href="/profile" className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-gray-700 border border-gray-200 rounded-full hover:border-sathya-green-400 hover:text-sathya-green-700 transition-colors">
                    <User className="w-3.5 h-3.5" />{user.full_name.split(" ")[0]}
                  </Link>
                  <button onClick={logout} className="text-gray-400 hover:text-red-600 transition-colors p-1.5" title="Sign Out">
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Link href="/login" className="px-3 py-1.5 text-sm font-medium text-sathya-green-700 hover:underline">Sign In</Link>
                  <Link href="/register" className="px-4 py-2 text-sm font-semibold text-white bg-sathya-green-600 rounded-full hover:bg-sathya-green-700 transition-colors shadow-sm">
                    Register Free
                  </Link>
                </div>
              )}

              {/* Mobile menu toggle */}
              <button onClick={() => setShowMobile(!showMobile)} className="lg:hidden p-1.5 text-gray-600">
                {showMobile ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile menu */}
        {showMobile && (
          <div className="lg:hidden bg-white border-t border-gray-100 px-4 py-4 space-y-1">
            {[...NAV_LINKS, ...MORE_LINKS].map(l => (
              <Link key={l.href} href={l.href} prefetch={false} onClick={() => setShowMobile(false)}
                className="block px-3 py-2.5 text-sm font-medium text-gray-700 rounded-lg hover:bg-green-50 hover:text-sathya-green-700">
                {l.label}
              </Link>
            ))}
            <div className="pt-2 border-t border-gray-100 flex gap-2">
              <Link href="/login" prefetch={false} className="flex-1 text-center py-2 text-sm font-medium text-sathya-green-700 border border-green-300 rounded-full">Sign In</Link>
              <Link href="/register" prefetch={false} className="flex-1 text-center py-2 text-sm font-semibold text-white bg-sathya-green-600 rounded-full">Register</Link>
            </div>
          </div>
        )}
      </header>
    </>
  );
}
