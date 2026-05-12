"use client";

import { motion } from "framer-motion";
import type { SnowDayPrediction } from "@/types/snow";

/**
 * DetailsPanel — Below-the-fold scroll content
 *
 * Shows:
 * - Factor breakdown with animated bars
 * - Natural language explanation
 * - Technical metadata
 *
 * All data is SSR-derived. lastUpdated comes from prediction.lastUpdated.
 */

interface DetailsPanelProps {
  prediction: SnowDayPrediction;
}

interface FactorMeta {
  key: keyof SnowDayPrediction["factors"];
  label: string;
  icon: string;
  description: string;
}

const FACTORS: FactorMeta[] = [
  { key: "snowfall", label: "Snowfall", icon: "❄️", description: "Forecast accumulation depth" },
  { key: "iceRisk", label: "Ice Risk", icon: "🧊", description: "Freezing rain & sleet risk" },
  { key: "temperature", label: "Temperature", icon: "🌡️", description: "Road freeze potential" },
  { key: "timing", label: "Storm Timing", icon: "🕐", description: "Overnight accumulation" },
];

function getBarColor(value: number) {
  if (value >= 70) return { bar: "#22c55e", glow: "rgba(34,197,94,0.25)" };
  if (value >= 40) return { bar: "#f59e0b", glow: "rgba(245,158,11,0.25)" };
  return { bar: "#ef4444", glow: "rgba(239,68,68,0.25)" };
}

const containerVariants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.1 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" as const } },
};

export function DetailsPanel({ prediction }: DetailsPanelProps) {
  const weather = prediction.rawWeather;

  return (
    <motion.section
      variants={containerVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.1 }}
      className="w-full max-w-2xl mx-auto px-5 pb-32 md:pb-16 space-y-6"
    >
      {/* Natural language explanation */}
      <motion.div variants={itemVariants} className="glass-card rounded-2xl p-6">
        <p className="text-xs text-white/30 uppercase tracking-widest font-semibold mb-3">
          Analysis Summary
        </p>
        <p className="text-base text-white/80 leading-relaxed">
          &ldquo;{prediction.explanation}&rdquo;
        </p>
      </motion.div>

      {/* Factor breakdown bars */}
      <motion.div variants={itemVariants} className="glass-card rounded-2xl p-6 space-y-5">
        <p className="text-xs text-white/30 uppercase tracking-widest font-semibold">
          Risk Factor Breakdown
        </p>
        {FACTORS.map((f, i) => {
          const value = prediction.factors[f.key];
          const colors = getBarColor(value);
          return (
            <div key={f.key}>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2.5">
                  <span className="text-lg" aria-hidden="true">{f.icon}</span>
                  <div>
                    <span className="text-sm font-semibold text-white/90">{f.label}</span>
                    <span className="text-xs text-white/30 ml-2 hidden sm:inline">{f.description}</span>
                  </div>
                </div>
                <span
                  className="text-sm font-bold tabular-nums"
                  style={{ color: colors.bar }}
                >
                  {value}
                </span>
              </div>
              <div className="h-2 w-full rounded-full bg-white/5 overflow-hidden">
                <motion.div
                  className="h-full rounded-full"
                  style={{
                    background: `linear-gradient(90deg, ${colors.bar}88, ${colors.bar})`,
                    boxShadow: `0 0 12px ${colors.glow}`,
                  }}
                  initial={{ width: 0 }}
                  whileInView={{ width: `${value}%` }}
                  viewport={{ once: true }}
                  transition={{ duration: 1, delay: i * 0.1, ease: "easeOut" }}
                  role="progressbar"
                  aria-valuenow={value}
                  aria-valuemin={0}
                  aria-valuemax={100}
                  aria-label={`${f.label} risk score: ${value} out of 100`}
                />
              </div>
            </div>
          );
        })}
      </motion.div>

      {/* Weather data & metadata */}
      {weather && (
        <motion.div variants={itemVariants} className="glass-card rounded-2xl p-6">
          <p className="text-xs text-white/30 uppercase tracking-widest font-semibold mb-4">
            Weather Data
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <WeatherStat
              label="Temperature"
              value={`${weather.temperature.toFixed(0)}°C`}
              sub={`${((weather.temperature * 9) / 5 + 32).toFixed(0)}°F`}
            />
            <WeatherStat
              label="Snowfall"
              value={`${weather.snowfallMM.toFixed(1)}mm`}
              sub="next 24h"
            />
            <WeatherStat
              label="Precipitation"
              value={`${weather.precipitationMM.toFixed(1)}mm`}
              sub="total"
            />
            <WeatherStat
              label="Wind"
              value={`${weather.windSpeedKph.toFixed(0)} km/h`}
              sub={`${(weather.windSpeedKph * 0.621371).toFixed(0)} mph`}
            />
          </div>
        </motion.div>
      )}

      {/* Technical metadata */}
      <motion.div variants={itemVariants} className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs text-white/20">
        {prediction.lastUpdated && (
          <span>
            Computed {new Date(prediction.lastUpdated).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
          </span>
        )}
        {weather && (
          <span>Source: {weather.source === "nws" ? "NWS" : "Open-Meteo"}</span>
        )}
        <span>Engine v1.0 · SSR</span>
      </motion.div>
    </motion.section>
  );
}

function WeatherStat({
  label,
  value,
  sub,
}: {
  label: string;
  value: string;
  sub: string;
}) {
  return (
    <div className="text-center">
      <p className="text-[10px] text-white/30 uppercase tracking-wider mb-1">{label}</p>
      <p className="text-lg font-bold font-display text-white/90">{value}</p>
      <p className="text-[10px] text-white/25">{sub}</p>
    </div>
  );
}
