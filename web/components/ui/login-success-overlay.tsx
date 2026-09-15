"use client";

import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, Sparkles } from "lucide-react";

interface LoginSuccessOverlayProps {
  show: boolean;
  name?: string;
}

export function LoginSuccessOverlay({ show, name }: LoginSuccessOverlayProps) {
  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-green-600"
        >
          {/* Ripple rings */}
          {[0, 1, 2].map(i => (
            <motion.div
              key={i}
              className="absolute rounded-full border-2 border-white/30"
              initial={{ width: 80, height: 80, opacity: 0.8 }}
              animate={{ width: 600, height: 600, opacity: 0 }}
              transition={{ duration: 1.2, delay: i * 0.25, ease: "easeOut" }}
            />
          ))}

          {/* Center card */}
          <motion.div
            initial={{ scale: 0.5, opacity: 0, y: 30 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 20, delay: 0.1 }}
            className="relative z-10 flex flex-col items-center gap-5 text-white text-center px-8"
          >
            {/* Animated checkmark */}
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 400, damping: 15, delay: 0.2 }}
              className="w-24 h-24 rounded-full bg-white/20 flex items-center justify-center backdrop-blur-sm border-2 border-white/40"
            >
              <CheckCircle2 className="w-12 h-12 text-white" />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <p className="text-3xl font-extrabold tracking-tight">
                Welcome{name ? `, ${name.split(" ")[0]}` : " back"}!
              </p>
              <p className="text-green-100 text-base mt-1 flex items-center justify-center gap-1.5">
                <Sparkles className="w-4 h-4" /> Loading your personalized dashboard…
              </p>
            </motion.div>

            {/* Progress bar */}
            <motion.div className="w-64 h-1.5 rounded-full bg-white/20 overflow-hidden">
              <motion.div
                className="h-full bg-white rounded-full"
                initial={{ width: "0%" }}
                animate={{ width: "100%" }}
                transition={{ duration: 1.0, delay: 0.3, ease: "easeInOut" }}
              />
            </motion.div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
