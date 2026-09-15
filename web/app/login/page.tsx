"use client";

import React, { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { useAuth } from "@/lib/auth-context";
import { LoginSuccessOverlay } from "@/components/ui/login-success-overlay";
import { ShieldCheck, Eye, EyeOff, Sparkles, ArrowRight, AlertCircle, UserCheck } from "lucide-react";

function LoginForm() {
  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw]     = useState(false);
  const [error, setError]       = useState("");
  const [isNotRegistered, setIsNotRegistered] = useState(false);
  const [isWrongPassword, setIsWrongPassword] = useState(false);
  const [loading, setLoading]   = useState(false);
  const [success, setSuccess]   = useState(false);
  const [userName, setUserName] = useState("");
  const { login }               = useAuth();
  const router                  = useRouter();
  const searchParams            = useSearchParams();

  useEffect(() => {
    const queryEmail = searchParams.get("email");
    if (queryEmail) {
      setEmail(queryEmail);
    }
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsNotRegistered(false);
    setIsWrongPassword(false);

    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail) {
      setError("Please enter your email address.");
      return;
    }
    if (!password) {
      setError("Please enter your password.");
      return;
    }

    setLoading(true);
    try {
      const user = await login(cleanEmail, password);
      setUserName((user as any)?.full_name || "Citizen");
      setSuccess(true);
      setTimeout(() => router.push("/dashboard"), 1800);
    } catch (err: any) {
      const status = err.response?.status;
      const detail = err.response?.data?.detail || "Invalid email or password. Please try again.";
      setError(detail);
      
      // If user is not registered in database, offer 1-click redirect to Register
      if (status === 404 || detail.toLowerCase().includes("no account") || detail.toLowerCase().includes("sign up")) {
        setIsNotRegistered(true);
      } else if (status === 401 || detail.toLowerCase().includes("incorrect password") || detail.toLowerCase().includes("forgot password")) {
        setIsWrongPassword(true);
      }
      setLoading(false);
    }
  };

  const handleAutofillDemo = (demoEmail: string, demoPw: string) => {
    setEmail(demoEmail);
    setPassword(demoPw);
    setError("");
    setIsNotRegistered(false);
    setIsWrongPassword(false);
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.07 } },
  };
  const itemVariants = {
    hidden: { opacity: 0, y: 18 },
    show:   { opacity: 1, y: 0, transition: { duration: 0.38, ease: [0.25,0.46,0.45,0.94] } },
  };

  return (
    <>
      <LoginSuccessOverlay show={success} name={userName} />

      <div className="min-h-[90vh] flex items-center justify-center px-4 py-12 bg-transparent relative z-10">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="show"
          className="relative w-full max-w-md"
        >
          {/* Card Container */}
          <motion.div 
            variants={itemVariants}
            className="bg-white/95 dark:bg-slate-900/90 backdrop-blur-2xl rounded-3xl shadow-2xl border border-gray-200/80 dark:border-white/15 overflow-hidden text-gray-900 dark:text-white"
          >
            {/* Top Emerald Accent Stripe */}
            <div className="h-2.5 bg-gradient-to-r from-emerald-500 via-teal-500 to-green-600" />

            <div className="p-8 sm:p-9">
              {/* Header & Logo */}
              <motion.div variants={itemVariants} className="flex flex-col items-center mb-7">
                <div className="w-18 h-18 rounded-full overflow-hidden bg-white flex items-center justify-center shadow-xl mb-4 border-2 border-emerald-500/40 p-1">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src="/logo-square.png" alt="Sathyamithra" className="w-full h-full object-cover rounded-full" />
                </div>
                <h1 className="text-2xl font-black tracking-tight text-gray-900 dark:text-white">Welcome back</h1>
                <p className="text-gray-500 dark:text-gray-400 text-xs sm:text-sm mt-1 text-center">
                  Sign in with your registered account credentials
                </p>
              </motion.div>

              {/* Error Message with Contextual Sign Up CTA */}
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
                  {isNotRegistered && (
                    <Link 
                      href={`/register?email=${encodeURIComponent(email)}`}
                      className="inline-flex items-center gap-1.5 self-start px-3 py-1 bg-red-100 dark:bg-red-900/60 hover:bg-red-200 text-red-800 dark:text-red-200 text-xs font-bold rounded-lg transition-colors mt-1"
                    >
                      Create Account Now <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  )}
                  {isWrongPassword && (
                    <Link 
                      href={`/forgot-password?email=${encodeURIComponent(email)}`}
                      className="inline-flex items-center gap-1.5 self-start px-3 py-1.5 bg-amber-100 dark:bg-amber-900/60 hover:bg-amber-200 text-amber-900 dark:text-amber-200 text-xs font-bold rounded-lg transition-colors mt-1 shadow-sm"
                    >
                      Reset Password via Forgot Password <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  )}
                </motion.div>
              )}

              {/* Login Form */}
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Email Address */}
                <motion.div variants={itemVariants}>
                  <label className="block text-xs font-bold text-gray-700 dark:text-gray-200 mb-1.5">
                    Email Address
                  </label>
                  <input 
                    type="email" 
                    value={email} 
                    onChange={e => setEmail(e.target.value)} 
                    required
                    placeholder="citizen@example.com"
                    className="w-full px-4 py-3 border-2 border-gray-300 dark:border-white/20 rounded-xl text-sm font-semibold text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none focus:border-emerald-500 dark:focus:border-emerald-400 transition-colors bg-white dark:bg-slate-800/90 shadow-sm" 
                  />
                </motion.div>

                {/* Password */}
                <motion.div variants={itemVariants}>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-xs font-bold text-gray-700 dark:text-gray-200">
                      Password
                    </label>
                    <Link 
                      href={email ? `/forgot-password?email=${encodeURIComponent(email)}` : "/forgot-password"} 
                      className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold hover:underline"
                    >
                      Forgot password?
                    </Link>
                  </div>
                  <div className="relative">
                    <input 
                      type={showPw ? "text" : "password"} 
                      value={password} 
                      onChange={e => setPassword(e.target.value)} 
                      required
                      placeholder="Enter your password"
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
                </motion.div>

                {/* Submit Button */}
                <motion.div variants={itemVariants} className="pt-2">
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
                        Verifying Credentials…
                      </>
                    ) : (
                      <>Sign In <ArrowRight className="w-4 h-4" /></>
                    )}
                  </button>
                </motion.div>

                {/* Pre-Seeded Test Credentials Helper */}
                <motion.div variants={itemVariants} className="pt-2">
                  <div className="p-3 bg-gray-50 dark:bg-slate-800/60 rounded-xl border border-gray-200/80 dark:border-white/10">
                    <p className="text-[11px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2 text-center">
                      Pre-Seeded Database Accounts (Quick Autofill)
                    </p>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => handleAutofillDemo("test@citizen.in", "Test@12345")}
                        className="px-2.5 py-1.5 text-xs font-semibold text-emerald-700 dark:text-emerald-300 bg-white dark:bg-slate-900 border border-emerald-300 dark:border-emerald-800 rounded-lg hover:bg-emerald-50 dark:hover:bg-slate-800 transition-colors text-center"
                      >
                        Demo Citizen
                      </button>
                      <button
                        type="button"
                        onClick={() => handleAutofillDemo("admin@sathyamithra.gov.in", "Admin@12345")}
                        className="px-2.5 py-1.5 text-xs font-semibold text-indigo-700 dark:text-indigo-300 bg-white dark:bg-slate-900 border border-indigo-300 dark:border-indigo-800 rounded-lg hover:bg-indigo-50 dark:hover:bg-slate-800 transition-colors text-center"
                      >
                        Demo Admin
                      </button>
                    </div>
                  </div>
                </motion.div>
              </form>

              {/* Link to Register */}
              <motion.div variants={itemVariants} className="mt-6 text-center text-xs text-gray-600 dark:text-gray-300">
                Do not have an account?{" "}
                <Link href="/register" className="text-emerald-600 dark:text-emerald-400 font-bold hover:underline">
                  Create Free Account
                </Link>
              </motion.div>

              {/* Trust Badges */}
              <motion.div 
                variants={itemVariants}
                className="mt-6 flex items-center justify-center gap-4 pt-4 border-t border-gray-100 dark:border-white/10"
              >
                <div className="flex items-center gap-1 text-[10px] text-gray-500 dark:text-gray-400 font-medium">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" /> 256-bit Encrypted
                </div>
                <div className="flex items-center gap-1 text-[10px] text-gray-500 dark:text-gray-400 font-medium">
                  <Sparkles className="w-3.5 h-3.5 text-amber-500" /> Secure JWT
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

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-transparent flex items-center justify-center text-sm text-gray-400">
        Loading portal login...
      </div>
    }>
      <LoginForm />
    </Suspense>
  );
}
