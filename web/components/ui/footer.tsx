import React from "react";
import Link from "next/link";
import { ShieldCheck, Phone, Mail, ExternalLink } from "lucide-react";

const FOOTER_LINKS = {
  "Scheme Categories": [
    { label: "Agriculture, Rural & Environment", href: "/schemes?cat=agriculture" },
    { label: "Education & Learning", href: "/schemes?cat=education" },
    { label: "Health & Wellness", href: "/schemes?cat=health" },
    { label: "Housing & Shelter", href: "/schemes?cat=housing" },
    { label: "Skills & Employment", href: "/schemes?cat=skills" },
    { label: "Women & Child", href: "/schemes?cat=women" },
    { label: "Social Welfare & Empowerment", href: "/schemes?cat=social" },
    { label: "Business & Entrepreneurship", href: "/schemes?cat=business" },
  ],
  "Citizen Tools": [
    { label: "Find Schemes For You", href: "/find-scheme" },
    { label: "AI Assistant (Sathyamithra)", href: "/assistant" },
    { label: "What-If Simulator", href: "/simulator" },
    { label: "Document Vault", href: "/documents" },
    { label: "Application Tracker", href: "/applications" },
    { label: "Family Mode", href: "/family" },
    { label: "Smart Alerts", href: "/alerts" },
    { label: "Life Events Engine", href: "/life-events" },
  ],
  "About & Help": [
    { label: "About Sathyamithra", href: "/about" },
    { label: "How It Works", href: "/#how-it-works" },
    { label: "Community Forum", href: "/community" },
    { label: "Hyperlocal Support Centers", href: "/locations" },
    { label: "Accessibility (Elder Mode)", href: "/accessibility" },
    { label: "Offline / PWA Support", href: "/offline" },
    { label: "Contact & Feedback", href: "/contact" },
    { label: "FAQ", href: "/#faq" },
  ],
};

export function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300">
      {/* Top strip */}
      <div className="bg-sathya-green-700 py-4">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full overflow-hidden bg-white shadow-md flex items-center justify-center p-0.5 border-2 border-white/40">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/logo-square.png" alt="Sathyamithra" className="w-full h-full object-cover rounded-full" />
            </div>
            <div>
              <p className="text-white font-bold">Sathyamithra</p>
              <p className="text-green-200 text-xs">Honest Guide to Every Benefit You Deserve</p>
            </div>
          </div>
          <div className="flex items-center gap-4 text-sm">
            <a href="tel:1800XXXXXXX" className="flex items-center gap-1.5 text-white hover:text-green-200 transition-colors">
              <Phone className="w-4 h-4" /> Helpline: 1800-XXX-XXXX
            </a>
            <a href="mailto:help@sathyamithra.in" className="flex items-center gap-1.5 text-white hover:text-green-200 transition-colors">
              <Mail className="w-4 h-4" /> help@sathyamithra.in
            </a>
          </div>
        </div>
      </div>

      {/* Main footer */}
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand column */}
          <div className="space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-full overflow-hidden border-2 border-emerald-500/40 bg-white p-0.5 shadow-md shrink-0">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/logo-square.png" alt="Sathyamithra" className="w-full h-full object-cover rounded-full" />
              </div>
              <span className="text-white font-extrabold text-lg">Sathyamithra</span>
            </div>
            <p className="text-xs text-gray-400 leading-relaxed">
              An AI-powered independent civic-technology platform helping every Indian household discover government benefits they deserve — with honesty, clarity, and speed.
            </p>
            <div className="flex items-center gap-2 text-xs text-sathya-green-400 bg-gray-800 p-2.5 rounded-lg border border-gray-700">
              <ShieldCheck className="w-4 h-4 shrink-0" />
              <span>Independent Civic Technology · Not a Government Portal</span>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-2 pt-2">
              {[
                { n: "4,700+", l: "Schemes" },
                { n: "15", l: "Categories" },
                { n: "36", l: "States/UTs" },
                { n: "15", l: "Languages" },
              ].map(s => (
                <div key={s.l} className="bg-gray-800 rounded-lg p-2 text-center">
                  <p className="text-sathya-green-400 font-extrabold text-base">{s.n}</p>
                  <p className="text-gray-500 text-[10px]">{s.l}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Link columns */}
          {Object.entries(FOOTER_LINKS).map(([title, links]) => (
            <div key={title}>
              <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-4 pb-2 border-b border-gray-700">{title}</h4>
              <ul className="space-y-2">
                {links.map(l => (
                  <li key={l.href}>
                    <Link href={l.href} className="text-xs text-gray-400 hover:text-sathya-green-400 transition-colors flex items-center gap-1">
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Partner links */}
        <div className="mt-10 pt-6 border-t border-gray-700">
          <p className="text-xs text-gray-500 mb-3 font-semibold uppercase tracking-wider">Official Government Sources</p>
          <div className="flex flex-wrap gap-3">
            {[
              { label: "myScheme.gov.in", href: "https://www.myscheme.gov.in" },
              { label: "National Scholarship Portal", href: "https://scholarships.gov.in" },
              { label: "PM-KISAN", href: "https://pmkisan.gov.in" },
              { label: "PM-JAY Ayushman", href: "https://pmjay.gov.in" },
              { label: "Jan Dhan Yojana", href: "https://pmjdy.gov.in" },
              { label: "PMAY Housing", href: "https://pmaymis.gov.in" },
              { label: "Mudra Loans", href: "https://mudra.org.in" },
              { label: "Skill India", href: "https://www.skillindiadigital.gov.in" },
            ].map(l => (
              <a key={l.href} href={l.href} target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-1 px-3 py-1.5 text-[11px] bg-gray-800 border border-gray-700 text-gray-400 rounded-full hover:text-sathya-green-400 hover:border-sathya-green-800 transition-colors">
                {l.label} <ExternalLink className="w-2.5 h-2.5" />
              </a>
            ))}
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-6 pt-4 border-t border-gray-800 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-[11px] text-gray-600">
            © 2026 Sathyamithra Platform. Built for citizen empowerment. Not affiliated with any government body.
          </p>
          <p className="text-[11px] text-gray-600 italic">
            Final eligibility & approvals are determined solely by official government authorities.
          </p>
        </div>
      </div>
    </footer>
  );
}
