"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { useAuth } from "@/lib/auth-context";
import { LoginSuccessOverlay } from "@/components/ui/login-success-overlay";
import { ShieldCheck, Eye, EyeOff, Sparkles, ArrowRight, CheckCircle2, AlertCircle } from "lucide-react";

const itemV = {
  hidden: { opacity: 0, y: 18 },
  show: { opacity: 1, y: 0, transition: { duration: 0.38, ease: [0.25, 0.46, 0.45, 0.94] } },
};
const containerV = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.07 } } };

export default function RegisterPage() {
  const [fullName, setFullName]       = useState("");
  const [email, setEmail]             = useState("");
  const [password, setPassword]       = useState("");
  const [confirm, setConfirm]         = useState("");
  const [showPw, setShowPw]           = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError]             = useState("");
  const [isExistingUser, setIsExistingUser] = useState(false);
  const [loading, setLoading]         = useState(false);
  const [success, setSuccess]         = useState(false);
  const { register }                  = useAuth();
  const router                        = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsExistingUser(false);

    const cleanEmail = email.trim().toLowerCase();
    const cleanName  = fullName.trim();

    if (!cleanName) {
      setError("Please enter your full name.");
      return;
    }
    if (password.length < 8) {
      setError("Password must be at least 8 characters long.");
      return;
    }
    if (password !== confirm) {
      setError("Passwords do not match. Please verify.");
      return;
    }

    setLoading(true);
    try {
      await register(cleanName, cleanEmail, password);
      setSuccess(true);
      setTimeout(() => router.push("/dashboard"), 1800);
    } catch (err: any) {
      const detail = err.response?.data?.detail || "Registration failed. Please check your details and try again.";
      setError(detail);
      if (detail.toLowerCase().includes("already exists") || detail.toLowerCase().includes("sign in instead")) {
        setIsExistingUser(true);
      }
      setLoading(false);
    }
  };

  const strength = password.length === 0 ? 0
    : password.length < 8 ? 1
    : /[A-Z]/.test(password) && /[0-9]/.test(password) && /[^A-Za-z0-9]/.test(password) ? 3
    : 2;

  const strengthColor = strength === 0 ? "bg-gray-200 dark:bg-slate-700"
    : strength === 1 ? "bg-red-500"
    : strength === 2 ? "bg-amber-500"
    : "bg-emerald-500";

  const strengthLabel = strength === 0 ? ""
    : strength === 1 ? "Weak password (min. 8 characters required)"
    : strength === 2 ? "Good password"
    : "Strong password ✓";

  const strengthLabelColor = strength === 1 ? "text-red-600 dark:text-red-400"
    : strength === 2 ? "text-amber-600 dark:text-amber-400"
    : "text-emerald-600 dark:text-emerald-400";

  return (
    <>
      <LoginSuccessOverlay show={success} name={fullName} />

      <div className="min-h-[90vh] flex items-center justify-center px-4 py-12 bg-transparent relative z-10">
        <motion.div variants={containerV} initial="hidden" animate="show" className="relative w-full max-w-md">
          {/* Card Container */}
          <motion.div 
            variants={itemV} 
            className="bg-white/95 dark:bg-slate-900/90 backdrop-blur-2xl rounded-3xl shadow-2xl border border-gray-200/80 dark:border-white/15 overflow-hidden text-gray-900 dark:text-white"
          >
            {/* Top Tri-Color / Emerald Accent Line */}
            <div className="h-2.5 bg-gradient-to-r from-emerald-500 via-teal-500 to-green-600" />

            <div className="p-8 sm:p-9">
              {/* Header & Logo */}
              <motion.div variants={itemV} className="flex flex-col items-center mb-7">
                <div className="w-18 h-18 rounded-full overflow-hidden bg-white flex items-center justify-center shadow-xl mb-4 border-2 border-emerald-500/40 p-1">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src="/logo-square.png" alt="Sathyamithra" className="w-full h-full object-cover rounded-full" />
                </div>
                <h1 className="text-2xl font-black tracking-tight text-gray-900 dark:text-white">Create your account</h1>
                <p className="text-gray-500 dark:text-gray-400 text-xs sm:text-sm mt-1 text-center">
                  Join verified citizens accessing rightful government benefits
                </p>
              </motion.div>

              {/* Error Message with Quick Action */}
              {error && (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.95 }} 
                  animate={{ opacity: 1, scale: 1 }}
                  className="mb-5 p-3.5 text-xs bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-800/50 text-red-700 dark:text-red-300 rounded-2xl flex flex-col gap-2"
                >
                  <div className="flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                    <span className="font-semibold leading-relaxed">{error}</span>
                  </div>
                  {isExistingUser && (
                    <Link 
                      href={`/login?email=${encodeURIComponent(email)}`}
                      className="inline-flex items-center gap-1.5 self-start px-3 py-1 bg-red-100 dark:bg-red-900/60 hover:bg-red-200 text-red-800 dark:text-red-200 text-xs font-bold rounded-lg transition-colors mt-1"
                    >
                      Sign In to Your Account <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  )}
                </motion.div>
              )}

              {/* Registration Form */}
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Full Name */}
                <motion.div variants={itemV}>
                  <label className="block text-xs font-bold text-gray-700 dark:text-gray-200 mb-1.5">
                    Full Name
                  </label>
                  <input 
                    type="text" 
                    value={fullName} 
                    onChange={e => setFullName(e.target.value)} 
                    required
                    placeholder="Enter your full name (e.g. Surya Kumar)"
                    className="w-full px-4 py-3 border-2 border-gray-300 dark:border-white/20 rounded-xl text-sm font-semibold text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none focus:border-emerald-500 dark:focus:border-emerald-400 transition-colors bg-white dark:bg-slate-800/90 shadow-sm" 
                  />
                </motion.div>

                {/* Email Address */}
                <motion.div variants={itemV}>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-xs font-bold text-gray-700 dark:text-gray-200">
                      Email Address
                    </label>
                    <span className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400">
                      Gmail or .edu / .ac.in / .gov.in
                    </span>
                  </div>
                  <input 
                    type="email" 
                    value={email} 
                    onChange={e => setEmail(e.target.value)} 
                    required
                    placeholder="yourname@gmail.com"
                    className="w-full px-4 py-3 border-2 border-gray-300 dark:border-white/20 rounded-xl text-sm font-semibold text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none focus:border-emerald-500 dark:focus:border-emerald-400 transition-colors bg-white dark:bg-slate-800/90 shadow-sm" 
                  />
                  <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-1">
                    Please use your genuine existing Gmail or institutional email. Random IDs are not allowed.
                  </p>
                </motion.div>

                {/* Password */}
                <motion.div variants={itemV}>
                  <label className="block text-xs font-bold text-gray-700 dark:text-gray-200 mb-1.5">
                    Password
                  </label>
                  <div className="relative">
                    <input 
                      type={showPw ? "text" : "password"} 
                      value={password} 
                      onChange={e => setPassword(e.target.value)} 
                      required
                      placeholder="Min. 8 characters"
                      className="w-full px-4 py-3 pr-11 border-2 border-gray-300 dark:border-white/20 rounded-xl text-sm font-semibold text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none focus:border-emerald-500 dark:focus:border-emerald-400 transition-colors bg-white dark:bg-slate-800/90 shadow-sm" 
                    />
                    <button 
                      type="button" 
                      onClick={() => setShowPw(!showPw)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700 dark:text-gray-400 dark:hover:text-white transition-colors"
                      tabIndex={-1}
                    >
                      {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>

                  {/* Password Strength Indicator */}
                  {password.length > 0 && (
                    <div className="mt-2 space-y-1">
                      <div className="flex gap-1 h-1.5">
                        <div className={`flex-1 rounded-full transition-colors ${strength >= 1 ? strengthColor : "bg-gray-200 dark:bg-slate-700"}`} />
                        <div className={`flex-1 rounded-full transition-colors ${strength >= 2 ? strengthColor : "bg-gray-200 dark:bg-slate-700"}`} />
                        <div className={`flex-1 rounded-full transition-colors ${strength >= 3 ? strengthColor : "bg-gray-200 dark:bg-slate-700"}`} />
                      </div>
                      <p className={`text-[11px] font-bold ${strengthLabelColor}`}>
                        {strengthLabel}
                      </p>
                    </div>
                  )}
                </motion.div>

                {/* Confirm Password */}
                <motion.div variants={itemV}>
                  <label className="block text-xs font-bold text-gray-700 dark:text-gray-200 mb-1.5">
                    Confirm Password
                  </label>
                  <div className="relative">
                    <input 
                      type={showConfirm ? "text" : "password"} 
                      value={confirm} 
                      onChange={e => setConfirm(e.target.value)} 
                      required
                      placeholder="Re-enter your password"
                      className={`w-full px-4 py-3 pr-11 border-2 rounded-xl text-sm font-semibold text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none transition-colors bg-white dark:bg-slate-800/90 shadow-sm ${
                        confirm && confirm === password 
                          ? "border-emerald-500 focus:border-emerald-500" 
                          : confirm && confirm !== password 
                          ? "border-red-500 focus:border-red-500" 
                          : "border-gray-300 dark:border-white/20 focus:border-emerald-500 dark:focus:border-emerald-400"
                      }`} 
                    />
                    <button 
                      type="button" 
                      onClick={() => setShowConfirm(!showConfirm)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700 dark:text-gray-400 dark:hover:text-white transition-colors"
                      tabIndex={-1}
                    >
                      {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  {confirm && confirm === password && (
                    <p className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 mt-1 flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Passwords match
                    </p>
                  )}
                </motion.div>

                {/* Submit Button */}
                <motion.div variants={itemV} className="pt-2">
                  <button 
                    type="submit" 
                    disabled={loading}
                    className="w-full flex items-center justify-center gap-2 px-6 py-3.5 text-sm font-bold text-white bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 disabled:opacity-60 disabled:cursor-not-allowed rounded-xl shadow-md hover:shadow-lg transition-all active:scale-[0.98]"
                  >
                    {loading ? (
                      <>
                        <motion.div 
                          animate={{ rotate: 360 }} 
                          transition={{ repeat: Infinity, duration: 0.8, ease: "linear" }}
                          className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full" 
                        />
                        Creating Account…
                      </>
                    ) : (
                      <>Create Account <ArrowRight className="w-4 h-4" /></>
                    )}
                  </button>
                </motion.div>
              </form>

              {/* Link to Login */}
              <motion.div variants={itemV} className="mt-6 text-center text-xs text-gray-600 dark:text-gray-300">
                Already registered?{" "}
                <Link href="/login" className="text-emerald-600 dark:text-emerald-400 font-bold hover:underline">
                  Sign In to Your Account
                </Link>
              </motion.div>

              {/* Trust Badges */}
              <motion.div 
                variants={itemV}
                className="mt-6 flex items-center justify-center gap-4 pt-4 border-t border-gray-100 dark:border-white/10"
              >
                <div className="flex items-center gap-1 text-[10px] text-gray-500 dark:text-gray-400 font-medium">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" /> 256-bit Encrypted
                </div>
                <div className="flex items-center gap-1 text-[10px] text-gray-500 dark:text-gray-400 font-medium">
                  <Sparkles className="w-3.5 h-3.5 text-amber-500" /> Free Forever
                </div>
                <div className="flex items-center gap-1 text-[10px] text-gray-500 dark:text-gray-400 font-medium">
                  🇮🇳 Made for Citizens
                </div>
              </motion.div>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </>
  );
}
