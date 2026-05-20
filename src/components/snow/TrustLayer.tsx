"use client";

import { motion } from "framer-motion";
import { Shield, Cpu, Cloud, BarChart3, Zap, Lock } from "lucide-react";

/**
 * TrustLayer — "How SnowSense™ Works"
 * Fully static explanation blocks. No runtime computation.
 * Builds credibility and trust.
 */

const steps = [
  {
    icon: <Cloud className="w-5 h-5" />,
    title: "Multi-Source Weather Data",
    description: "We combine public forecast inputs for your location, including live weather, snow accumulation, temperature, and timing signals.",
    accent: "#60a5fa",
  },
  {
    icon: <Cpu className="w-5 h-5" />,
    title: "SnowSense™ Algorithm",
    description: "Our proprietary prediction engine analyzes 4 key factors — snowfall, ice risk, temperature, and storm timing — weighted by regional tolerance.",
    accent: "#a78bfa",
  },
  {
    icon: <BarChart3 className="w-5 h-5" />,
    title: "Regional Calibration",
    description: "Predictions account for local snow tolerance. A 3-inch snowfall closes schools in Atlanta but barely phases Boston.",
    accent: "#22d3ee",
  },
  {
    icon: <Zap className="w-5 h-5" />,
    title: "Edge Computing",
    description: "Results are rendered quickly with cached weather inputs refreshed throughout the day so the forecast stays responsive.",
    accent: "#f59e0b",
  },
  {
    icon: <Lock className="w-5 h-5" />,
    title: "Privacy-First Design",
    description: "No account required. No tracking cookies. Location is detected from IP headers at the edge — never stored.",
    accent: "#22c55e",
  },
  {
    icon: <Shield className="w-5 h-5" />,
    title: "Local Context Matters",
    description: "The same snowfall can lead to different decisions depending on road treatment, bus routes, timing, and district tolerance.",
    accent: "#f43f5e",
  },
];

const forecastSignals = [
  {
    name: "Snowfall",
    detail: "Accumulation and hourly intensity",
  },
  {
    name: "Ice Risk",
    detail: "Mixed precipitation and road impact",
  },
  {
    name: "Timing",
    detail: "Whether the storm hits commute hours",
  },
  {
    name: "Local Tolerance",
    detail: "How the region typically handles winter weather",
  },
];

export function TrustLayer() {
  return (
    <section className="w-full max-w-6xl mx-auto px-5" id="how-it-works" aria-label="How SnowSense works">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="text-center mb-10"
      >
        <p className="text-[10px] text-violet-400/60 uppercase tracking-[0.3em] font-bold mb-2">
          Transparent Technology
        </p>
        <h3 className="text-2xl sm:text-3xl font-display font-black text-white/90">
          How SnowSense™ Works
        </h3>
        <p className="text-sm text-white/50 mt-2 max-w-lg mx-auto">
          A multi-source, edge-computed prediction engine calibrated to your region
        </p>
      </motion.div>

      {/* Steps grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-10">
        {steps.map((step, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: i * 0.08 }}
            className="glass-card rounded-2xl p-5 group hover:border-white/12 transition-all duration-500"
          >
            <div
              className="p-2.5 rounded-xl w-fit mb-4"
              style={{ background: `${step.accent}15`, color: step.accent }}
            >
              {step.icon}
            </div>
            <h3 className="text-sm font-bold text-white/90 mb-2">
              {step.title}
            </h3>
            <p className="text-xs text-white/50 leading-relaxed">
              {step.description}
            </p>
          </motion.div>
        ))}
      </div>

      {/* Forecast signals */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.7, delay: 0.2 }}
        className="glass-card rounded-2xl p-6"
      >
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 rounded-xl bg-emerald-500/10">
                <Shield className="w-5 h-5 text-emerald-400" />
              </div>
              <div>
                <p className="text-sm font-bold text-white/90">What the forecast weighs</p>
                <p className="text-[10px] text-white/50">Core inputs used on every prediction</p>
              </div>
            </div>
            <div className="mt-3 max-w-md text-sm text-white/50 leading-relaxed">
              SnowSense is a forecast aid, not an official closure notice. Final school decisions still depend on district leadership and real-world road conditions.
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {forecastSignals.map((signal) => (
              <div key={signal.name} className="text-center">
                <p className="text-[10px] text-white/50 uppercase tracking-wider mb-1">
                  {signal.name}
                </p>
                <p className="text-sm font-semibold text-emerald-300">
                  {signal.detail}
                </p>
              </div>
            ))}
          </div>
        </div>
      </motion.div>
    </section>
  );
}
