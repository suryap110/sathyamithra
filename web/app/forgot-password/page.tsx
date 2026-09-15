"use client";

import React, { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { apiClient } from "@/lib/api-client";
import { 
  KeyRound, 
  ArrowLeft, 
  ArrowRight, 
  Mail, 
  ShieldCheck, 
  CheckCircle2, 
  AlertCircle, 
  Eye, 
  EyeOff, 
  Sparkles,
  Lock
} from "lucide-react";

function ForgotPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [otpPreview, setOtpPreview] = useState<string | null>(null);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    const qEmail = searchParams.get("email");
    if (qEmail) {
      setEmail(qEmail);
    }
  }, [searchParams]);

  // Step 1: Request OTP for registered email
  const handleRequestOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail) {
      setError("Please enter your registered email address.");
      return;
    }

    setLoading(true);
    try {
      const res = await apiClient.post("/auth/forgot-password", { email: cleanEmail });
      const data = res.data;
      setOtpPreview(data.otp_preview || null);
      if (data.otp_preview) {
        setOtp(data.otp_preview);
      }
      setSuccessMessage(data.message || "Verification code generated.");
      setStep(2);
    } catch (err: any) {
      const detail = err.response?.data?.detail || "Failed to generate password reset code. Please check your email.";
      setError(detail);
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Reset password with OTP
  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!otp.trim()) {
      setError("Please enter the 6-digit verification code.");
      return;
    }
    if (newPassword.length < 8) {
      setError("New password must be at least 8 characters long.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("Passwords do not match. Please verify.");
      return;
    }

    setLoading(true);
    try {
      const cleanEmail = email.trim().toLowerCase();
      await apiClient.post("/auth/reset-password", {
        email: cleanEmail,
        otp: otp.trim(),
        new_password: newPassword,
      });
      setStep(3);
    } catch (err: any) {
      const detail = err.response?.data?.detail || "Failed to reset password. Please check the code and try again.";
      setError(detail);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[90vh] flex items-center justify-center px-4 py-12 bg-transparent relative z-10">
      <motion.div 
        initial={{ opacity: 0, y: 18 }} 
        animate={{ opacity: 1, y: 0 }} 
        transition={{ duration: 0.38 }}
        className="relative w-full max-w-md"
      >
        {/* Card Container */}
        <div className="bg-white/95 dark:bg-slate-900/90 backdrop-blur-2xl rounded-3xl shadow-2xl border border-gray-200/80 dark:border-white/15 overflow-hidden text-gray-900 dark:text-white">
          {/* Top Emerald Accent Stripe */}
          <div className="h-2.5 bg-gradient-to-r from-emerald-500 via-teal-500 to-green-600" />

          <div className="p-8 sm:p-9">
            {/* Header Icon & Title */}
            <div className="flex flex-col items-center mb-6">
              <div className="w-16 h-16 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800/50 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shadow-md mb-3">
                {step === 3 ? (
                  <CheckCircle2 className="w-8 h-8 text-emerald-500" />
                ) : (
                  <KeyRound className="w-8 h-8" />
                )}
              </div>
              <h1 className="text-2xl font-black tracking-tight text-gray-900 dark:text-white text-center">
                {step === 1 && "Reset Your Password"}
                {step === 2 && "Enter Verification Code"}
                {step === 3 && "Password Reset Complete!"}
              </h1>
              <p className="text-gray-500 dark:text-gray-400 text-xs sm:text-sm mt-1 text-center">
                {step === 1 && "Enter your registered email address to receive an OTP code"}
                {step === 2 && "Enter the 6-digit code and choose your new secure password"}
                {step === 3 && "Your password has been securely updated and verified"}
              </p>
            </div>

            {/* Error Message */}
            {error && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.96 }} 
                animate={{ opacity: 1, scale: 1 }}
                className="mb-5 p-3.5 text-xs bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-800/50 text-red-700 dark:text-red-300 rounded-2xl flex items-start gap-2.5"
              >
                <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                <span className="font-semibold leading-relaxed">{error}</span>
              </motion.div>
            )}

            {/* STEP 1: Enter Email */}
            {step === 1 && (
              <form onSubmit={handleRequestOtp} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 dark:text-gray-200 mb-1.5">
                    Registered Email Address
                  </label>
                  <div className="relative">
                    <input 
                      type="email" 
                      value={email} 
                      onChange={e => setEmail(e.target.value)} 
                      required
                      placeholder="citizen@example.com"
                      className="w-full px-4 py-3 pl-11 border-2 border-gray-300 dark:border-white/20 rounded-xl text-sm font-semibold text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none focus:border-emerald-500 dark:focus:border-emerald-400 transition-colors bg-white dark:bg-slate-800/90 shadow-sm" 
                    />
                    <Mail className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  </div>
                </div>

                <div className="pt-2">
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
                        Verifying Account…
                      </>
                    ) : (
                      <>Send Verification Code <ArrowRight className="w-4 h-4" /></>
                    )}
                  </button>
                </div>
              </form>
            )}

            {/* STEP 2: Enter OTP & New Password */}
            {step === 2 && (
              <form onSubmit={handleResetPassword} className="space-y-4">
                {/* OTP Banner with instant autofill */}
                {otpPreview && (
                  <motion.div 
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/40 rounded-xl"
                  >
                    <p className="text-[11px] text-emerald-800 dark:text-emerald-300 font-semibold mb-1">
                      ⚡ Demo Verification Code Generated:
                    </p>
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-base font-black tracking-widest text-emerald-700 dark:text-emerald-300">
                        {otpPreview}
                      </span>
                      <button 
                        type="button" 
                        onClick={() => setOtp(otpPreview)}
                        className="text-[10px] font-bold px-2 py-1 bg-emerald-600 text-white rounded-md hover:bg-emerald-700 transition-colors"
                      >
                        Autofill Code
                      </button>
                    </div>
                  </motion.div>
                )}

                <div>
                  <label className="block text-xs font-bold text-gray-700 dark:text-gray-200 mb-1.5">
                    6-Digit Verification Code (OTP)
                  </label>
                  <input 
                    type="text" 
                    maxLength={6}
                    value={otp} 
                    onChange={e => setOtp(e.target.value)} 
                    required
                    placeholder="Enter 6-digit code"
                    className="w-full px-4 py-3 border-2 border-gray-300 dark:border-white/20 rounded-xl text-center tracking-widest font-mono text-lg font-bold text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none focus:border-emerald-500 dark:focus:border-emerald-400 transition-colors bg-white dark:bg-slate-800/90 shadow-sm" 
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 dark:text-gray-200 mb-1.5">
                    New Password
                  </label>
                  <div className="relative">
                    <input 
                      type={showPassword ? "text" : "password"} 
                      value={newPassword} 
                      onChange={e => setNewPassword(e.target.value)} 
                      required
                      placeholder="Min. 8 characters"
                      className="w-full px-4 py-3 pr-11 border-2 border-gray-300 dark:border-white/20 rounded-xl text-sm font-semibold text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none focus:border-emerald-500 dark:focus:border-emerald-400 transition-colors bg-white dark:bg-slate-800/90 shadow-sm" 
                    />
                    <button 
                      type="button" 
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700 dark:text-gray-400 dark:hover:text-white transition-colors"
                      tabIndex={-1}
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 dark:text-gray-200 mb-1.5">
                    Confirm New Password
                  </label>
                  <input 
                    type={showPassword ? "text" : "password"} 
                    value={confirmPassword} 
                    onChange={e => setConfirmPassword(e.target.value)} 
                    required
                    placeholder="Re-enter new password"
                    className="w-full px-4 py-3 border-2 border-gray-300 dark:border-white/20 rounded-xl text-sm font-semibold text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none focus:border-emerald-500 dark:focus:border-emerald-400 transition-colors bg-white dark:bg-slate-800/90 shadow-sm" 
                  />
                  {confirmPassword && confirmPassword === newPassword && (
                    <p className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 mt-1 flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Passwords match
                    </p>
                  )}
                </div>

                <div className="pt-2 flex flex-col gap-2">
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
                        Updating Password…
                      </>
                    ) : (
                      <>Reset Password <ArrowRight className="w-4 h-4" /></>
                    )}
                  </button>

                  <button 
                    type="button"
                    onClick={() => setStep(1)}
                    className="text-xs text-gray-500 dark:text-gray-400 hover:underline text-center py-1"
                  >
                    ← Change Email Address
                  </button>
                </div>
              </form>
            )}

            {/* STEP 3: Success Confirmation */}
            {step === 3 && (
              <div className="space-y-5 text-center">
                <div className="p-4 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/40 rounded-2xl">
                  <p className="text-sm font-bold text-emerald-800 dark:text-emerald-200">
                    Your password has been securely updated!
                  </p>
                  <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-1">
                    You can now use your newly set password to sign in to SathyaMithra.
                  </p>
                </div>

                <Link 
                  href={`/login?email=${encodeURIComponent(email)}`}
                  className="w-full flex items-center justify-center gap-2 px-6 py-3.5 text-sm font-bold text-white bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 rounded-xl shadow-md hover:shadow-lg transition-all"
                >
                  Sign In with New Password <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            )}

            {/* Back to Login Link */}
            {step !== 3 && (
              <div className="mt-6 text-center text-xs text-gray-600 dark:text-gray-300">
                Remember your password?{" "}
                <Link href="/login" className="text-emerald-600 dark:text-emerald-400 font-bold hover:underline">
                  Back to Sign In
                </Link>
              </div>
            )}

            {/* Trust Footer */}
            <div className="mt-6 flex items-center justify-center gap-4 pt-4 border-t border-gray-100 dark:border-white/10">
              <div className="flex items-center gap-1 text-[10px] text-gray-500 dark:text-gray-400 font-medium">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" /> 256-bit Encryption
              </div>
              <div className="flex items-center gap-1 text-[10px] text-gray-500 dark:text-gray-400 font-medium">
                <Lock className="w-3.5 h-3.5 text-emerald-500" /> Secure Protection
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

export default function ForgotPasswordPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-transparent flex items-center justify-center text-sm text-gray-400">
        Loading password recovery...
      </div>
    }>
      <ForgotPasswordForm />
    </Suspense>
  );
}
