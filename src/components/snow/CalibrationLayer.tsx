"use client";

import { motion, AnimatePresence } from "framer-motion";
import type { SchoolType } from "@/types/snow";
import { DAYS_USED_MIN, DAYS_USED_MAX } from "@/lib/calibration";
import { X, Minus, Plus, Cpu } from "lucide-react";

/**
 * CalibrationLayer — SnowSense™ Intelligence Tuning System
 *
 * This is a HIDDEN intelligence refinement panel, NOT settings.
 * It feels like "tuning model intelligence" — not preferences.
 *
 * Controls:
 * 1. Snow History Signal (daysUsed) — stepper
 * 2. School Type Signal (type) — segmented control
 *
 * All changes update URL immediately via startTransition.
 * Server recomputes prediction silently in background.
 */

interface CalibrationLayerProps {
  isOpen: boolean;
  onClose: () => void;
  daysUsed: number;
  schoolType: SchoolType;
  onDaysUsedChange: (value: number) => void;
  onSchoolTypeChange: (value: SchoolType) => void;
  isPending: boolean;
}

export function CalibrationLayer({
  isOpen,
  onClose,
  daysUsed,
  schoolType,
  onDaysUsedChange,
  onSchoolTypeChange,
  isPending,
}: CalibrationLayerProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-[55] bg-black/40 backdrop-blur-sm"
          />

          {/* Desktop: dropdown panel from command bar area */}
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.98 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="hidden md:block fixed top-20 left-1/2 -translate-x-1/2 z-[56] w-[420px]"
          >
            <div className="glass-heavy rounded-2xl border border-white/10 overflow-hidden shadow-2xl">
              {/* Header */}
              <div className="flex items-center justify-between px-6 pt-5 pb-3">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-violet-500/10">
                    <Cpu className="w-4 h-4 text-violet-400" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-white/90">
                      SnowSense™ Calibration
                    </p>
                    <p className="text-[10px] text-white/30 uppercase tracking-wider">
                      Intelligence Tuning Layer
                    </p>
                  </div>
                </div>
                <button
                  onClick={onClose}
                  className="p-1.5 rounded-lg hover:bg-white/5 text-white/30 hover:text-white/60 transition-colors"
                  aria-label="Close calibration"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Processing indicator */}
              {isPending && (
                <div className="mx-6 mb-2">
                  <div className="h-0.5 w-full bg-white/5 rounded-full overflow-hidden">
                    <motion.div
                      className="h-full bg-gradient-to-r from-violet-500 to-blue-500"
                      animate={{ x: ["-100%", "100%"] }}
                      transition={{ duration: 1.2, repeat: Infinity, ease: "linear" }}
                      style={{ width: "40%" }}
                    />
                  </div>
                </div>
              )}

              <div className="px-6 pb-6 space-y-5">
                {/* ── Snow History Signal ── */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-xs text-white/50 font-medium">
                      Snow History Signal
                    </p>
                    <span className="text-[10px] text-white/20 font-mono">
                      daysUsed={daysUsed}
                    </span>
                  </div>
                  <p className="text-[10px] text-white/25 mb-3 leading-relaxed">
                    SnowSense™ is adjusting for historical winter patterns…
                  </p>

                  <div className="flex items-center justify-between gap-4">
                    <button
                      onClick={() =>
                        onDaysUsedChange(Math.max(DAYS_USED_MIN, daysUsed - 1))
                      }
                      disabled={daysUsed <= DAYS_USED_MIN}
                      className="p-2.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.06] text-white/60 hover:text-white disabled:opacity-20 disabled:cursor-not-allowed transition-all active:scale-95"
                      aria-label="Decrease days used"
                    >
                      <Minus className="w-4 h-4" />
                    </button>

                    <div className="flex-1 text-center">
                      <span className="text-3xl font-display font-black text-white tabular-nums">
                        {daysUsed}
                      </span>
                      <p className="text-[10px] text-white/20 mt-1">
                        snow days used this year
                      </p>
                    </div>

                    <button
                      onClick={() =>
                        onDaysUsedChange(Math.min(DAYS_USED_MAX, daysUsed + 1))
                      }
                      disabled={daysUsed >= DAYS_USED_MAX}
                      className="p-2.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.06] text-white/60 hover:text-white disabled:opacity-20 disabled:cursor-not-allowed transition-all active:scale-95"
                      aria-label="Increase days used"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Visual progress */}
                  <div className="flex gap-1 mt-3">
                    {Array.from({ length: DAYS_USED_MAX + 1 }).map((_, i) => (
                      <div
                        key={i}
                        className="h-1 flex-1 rounded-full transition-all duration-300"
                        style={{
                          background:
                            i <= daysUsed
                              ? `rgba(139, 92, 246, ${0.3 + (i / DAYS_USED_MAX) * 0.7})`
                              : "rgba(255,255,255,0.04)",
                        }}
                      />
                    ))}
                  </div>
                </div>

                {/* Divider */}
                <div className="h-px bg-white/[0.06]" />

                {/* ── School Type Signal ── */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-xs text-white/50 font-medium">
                      School Type Signal
                    </p>
                    <span className="text-[10px] text-white/20 font-mono">
                      type={schoolType}
                    </span>
                  </div>
                  <p className="text-[10px] text-white/25 mb-3 leading-relaxed">
                    SnowSense™ is calibrating for institutional response patterns…
                  </p>

                  {/* Segmented control */}
                  <div className="relative flex bg-white/[0.03] rounded-xl border border-white/[0.06] p-1">
                    {/* Active indicator */}
                    <motion.div
                      className="absolute top-1 bottom-1 rounded-lg bg-white/[0.08] border border-white/[0.08]"
                      animate={{
                        left: schoolType === "public" ? "4px" : "50%",
                        width: "calc(50% - 4px)",
                      }}
                      transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    />

                    <button
                      onClick={() => onSchoolTypeChange("public")}
                      className={`relative z-10 flex-1 py-2.5 text-sm font-semibold rounded-lg transition-colors ${
                        schoolType === "public"
                          ? "text-white"
                          : "text-white/35 hover:text-white/55"
                      }`}
                    >
                      🏫 Public
                    </button>
                    <button
                      onClick={() => onSchoolTypeChange("private")}
                      className={`relative z-10 flex-1 py-2.5 text-sm font-semibold rounded-lg transition-colors ${
                        schoolType === "private"
                          ? "text-white"
                          : "text-white/35 hover:text-white/55"
                      }`}
                    >
                      🎓 Private
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Mobile: bottom sheet */}
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="md:hidden fixed bottom-0 left-0 right-0 z-[56]"
          >
            <div className="bg-[#0a0f1e] rounded-t-3xl border-t border-white/10 overflow-hidden safe-area-bottom">
              <div className="w-10 h-1 rounded-full bg-white/20 mx-auto mt-3 mb-4" />

              {/* Header */}
              <div className="flex items-center gap-3 px-6 mb-4">
                <div className="p-2 rounded-xl bg-violet-500/10">
                  <Cpu className="w-4 h-4 text-violet-400" />
                </div>
                <div>
                  <p className="text-sm font-bold text-white/90">
                    SnowSense™ Calibration
                  </p>
                  <p className="text-[10px] text-white/30 uppercase tracking-wider">
                    Intelligence Tuning
                  </p>
                </div>
              </div>

              {/* Processing indicator */}
              {isPending && (
                <div className="mx-6 mb-3">
                  <div className="h-0.5 w-full bg-white/5 rounded-full overflow-hidden">
                    <motion.div
                      className="h-full bg-gradient-to-r from-violet-500 to-blue-500"
                      animate={{ x: ["-100%", "100%"] }}
                      transition={{ duration: 1.2, repeat: Infinity, ease: "linear" }}
                      style={{ width: "40%" }}
                    />
                  </div>
                </div>
              )}

              <div className="px-6 pb-8 space-y-5">
                {/* Snow History */}
                <div>
                  <p className="text-[10px] text-white/25 mb-3 leading-relaxed">
                    SnowSense™ is adjusting for historical winter patterns…
                  </p>
                  <div className="flex items-center justify-between gap-4">
                    <button
                      onClick={() =>
                        onDaysUsedChange(Math.max(DAYS_USED_MIN, daysUsed - 1))
                      }
                      disabled={daysUsed <= DAYS_USED_MIN}
                      className="p-3 rounded-xl bg-white/[0.04] border border-white/[0.06] text-white/60 disabled:opacity-20 transition-all active:scale-95"
                    >
                      <Minus className="w-5 h-5" />
                    </button>
                    <div className="flex-1 text-center">
                      <span className="text-4xl font-display font-black text-white tabular-nums">
                        {daysUsed}
                      </span>
                      <p className="text-[10px] text-white/20 mt-1">
                        snow days used
                      </p>
                    </div>
                    <button
                      onClick={() =>
                        onDaysUsedChange(Math.min(DAYS_USED_MAX, daysUsed + 1))
                      }
                      disabled={daysUsed >= DAYS_USED_MAX}
                      className="p-3 rounded-xl bg-white/[0.04] border border-white/[0.06] text-white/60 disabled:opacity-20 transition-all active:scale-95"
                    >
                      <Plus className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                {/* School Type */}
                <div>
                  <p className="text-[10px] text-white/25 mb-3 leading-relaxed">
                    Calibrating for institutional response patterns…
                  </p>
                  <div className="relative flex bg-white/[0.03] rounded-xl border border-white/[0.06] p-1">
                    <motion.div
                      className="absolute top-1 bottom-1 rounded-lg bg-white/[0.08] border border-white/[0.08]"
                      animate={{
                        left: schoolType === "public" ? "4px" : "50%",
                        width: "calc(50% - 4px)",
                      }}
                      transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    />
                    <button
                      onClick={() => onSchoolTypeChange("public")}
                      className={`relative z-10 flex-1 py-3 text-sm font-semibold rounded-lg transition-colors ${
                        schoolType === "public" ? "text-white" : "text-white/35"
                      }`}
                    >
                      🏫 Public
                    </button>
                    <button
                      onClick={() => onSchoolTypeChange("private")}
                      className={`relative z-10 flex-1 py-3 text-sm font-semibold rounded-lg transition-colors ${
                        schoolType === "private" ? "text-white" : "text-white/35"
                      }`}
                    >
                      🎓 Private
                    </button>
                  </div>
                </div>

                <button
                  onClick={onClose}
                  className="w-full py-3 rounded-xl bg-white/5 text-sm text-white/50 font-medium hover:bg-white/8 transition-colors"
                >
                  Done
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
