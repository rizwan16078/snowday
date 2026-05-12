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
    description: "We aggregate data from the National Weather Service, Open-Meteo, and NOAA to build a comprehensive weather picture for your location.",
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
    description: "Results are computed at the edge and cached globally. Fresh data every 30 minutes, served in under 100ms worldwide.",
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
    title: "Accuracy Guarantee",
    description: "Our model maintains 85%+ accuracy during active winter storm seasons, validated against actual school closure data.",
    accent: "#f43f5e",
  },
];

const accuracy = {
  overall: 87,
  lastUpdated: "Weekly",
  regions: [
    { name: "Northeast", score: 91 },
    { name: "Midwest", score: 88 },
    { name: "Mountain West", score: 84 },
    { name: "Southeast", score: 82 },
  ],
};

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
        <h2 className="text-2xl sm:text-3xl font-display font-black text-white/90">
          How SnowSense™ Works
        </h2>
        <p className="text-sm text-white/30 mt-2 max-w-lg mx-auto">
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
            <p className="text-xs text-white/40 leading-relaxed">
              {step.description}
            </p>
          </motion.div>
        ))}
      </div>

      {/* Accuracy Badge */}
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
                <p className="text-sm font-bold text-white/90">Accuracy Rating</p>
                <p className="text-[10px] text-white/30">Updated {accuracy.lastUpdated}</p>
              </div>
            </div>
            <div className="flex items-baseline gap-1 mt-3">
              <span className="text-4xl font-display font-black text-emerald-400">
                {accuracy.overall}%
              </span>
              <span className="text-sm text-white/30">overall</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {accuracy.regions.map((r) => (
              <div key={r.name} className="text-center">
                <p className="text-[10px] text-white/30 uppercase tracking-wider mb-1">
                  {r.name}
                </p>
                <p className="text-lg font-bold font-display" style={{
                  color: r.score >= 90 ? "#22c55e" : r.score >= 85 ? "#f59e0b" : "#60a5fa",
                }}>
                  {r.score}%
                </p>
              </div>
            ))}
          </div>
        </div>
      </motion.div>
    </section>
  );
}
