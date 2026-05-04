"use client";

import { motion } from "framer-motion";
import type { SnowDayPrediction } from "@/types/snow";

/**
 * HourlyCurve — SSR-generated snowfall timeline
 * Pure SVG chart. No chart libraries. No live streaming.
 */

interface HourlyCurveProps {
  prediction: SnowDayPrediction;
}

function buildPath(data: number[], W: number, H: number, P: number): string {
  if (data.length === 0) return "";
  const max = Math.max(...data, 1);
  const step = (W - P * 2) / (data.length - 1);
  const pts = data.map((v, i) => ({
    x: P + i * step,
    y: H - P - (v / max) * (H - P * 2),
  }));
  let d = `M ${pts[0].x} ${pts[0].y}`;
  for (let i = 1; i < pts.length; i++) {
    const p = pts[i - 1], c = pts[i];
    d += ` C ${p.x + (c.x - p.x) * 0.4} ${p.y}, ${c.x - (c.x - p.x) * 0.4} ${c.y}, ${c.x} ${c.y}`;
  }
  return d;
}

function buildArea(data: number[], W: number, H: number, P: number): string {
  if (data.length === 0) return "";
  const max = Math.max(...data, 1);
  const step = (W - P * 2) / (data.length - 1);
  const pts = data.map((v, i) => ({
    x: P + i * step,
    y: H - P - (v / max) * (H - P * 2),
  }));
  let d = `M ${pts[0].x} ${H - P} L ${pts[0].x} ${pts[0].y}`;
  for (let i = 1; i < pts.length; i++) {
    const p = pts[i - 1], c = pts[i];
    d += ` C ${p.x + (c.x - p.x) * 0.4} ${p.y}, ${c.x - (c.x - p.x) * 0.4} ${c.y}, ${c.x} ${c.y}`;
  }
  d += ` L ${pts[pts.length - 1].x} ${H - P} Z`;
  return d;
}

export function HourlyCurve({ prediction }: HourlyCurveProps) {
  const hourly = prediction.rawWeather?.hourlySnow ?? [];
  const data = hourly.length > 0
    ? hourly.map((h) => h.snowMM)
    : Array.from({ length: 24 }, (_, i) => {
        const base = prediction.factors.snowfall / 100;
        const night = (i >= 22 || i <= 6) ? 1 : i <= 8 ? 0.6 : 0.2;
        return base * night * (prediction.factors.timing / 100) * 5 + 0.1;
      });

  const labels: string[] = [];
  const now = new Date();
  for (let i = 0; i < 24; i++) {
    const h = (now.getHours() + i) % 24;
    labels.push(i % 3 === 0 ? (h === 0 ? "12a" : h < 12 ? `${h}a` : h === 12 ? "12p" : `${h - 12}p`) : "");
  }

  const W = 700, H = 200, P = 30;
  const line = buildPath(data, W, H, P);
  const area = buildArea(data, W, H, P);
  const maxSnow = Math.max(...data);
  const totalSnow = data.reduce((a, b) => a + b, 0);
  const peakIdx = data.indexOf(maxSnow);
  const peakH = hourly.length > 0 ? hourly[peakIdx]?.hour : peakIdx;
  const peakLabel = peakH === undefined ? "N/A" : peakH === 0 ? "12 AM" : peakH < 12 ? `${peakH} AM` : peakH === 12 ? "12 PM" : `${peakH - 12} PM`;

  return (
    <section className="w-full max-w-4xl mx-auto px-5" aria-label="Hourly snowfall curve">
      <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }} className="text-center mb-8">
        <p className="text-[10px] text-cyan-400/60 uppercase tracking-[0.3em] font-bold mb-2">24-Hour Timeline</p>
        <h2 className="text-2xl sm:text-3xl font-display font-black text-white/90">Hourly Snowfall Curve</h2>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.7, delay: 0.1 }} className="glass-card rounded-2xl p-6 overflow-hidden">
        <div className="flex items-center justify-between mb-6 px-2">
          <div className="flex items-center gap-6">
            <div><p className="text-[10px] text-white/30 uppercase tracking-wider">Peak</p><p className="text-sm font-bold text-cyan-400">{maxSnow.toFixed(1)}mm</p></div>
            <div><p className="text-[10px] text-white/30 uppercase tracking-wider">Total 24h</p><p className="text-sm font-bold text-white/80">{totalSnow.toFixed(1)}mm</p></div>
            <div><p className="text-[10px] text-white/30 uppercase tracking-wider">Peak Time</p><p className="text-sm font-bold text-white/80">{peakLabel}</p></div>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-cyan-400" />
            <span className="text-[10px] text-white/30">Snowfall (mm)</span>
          </div>
        </div>

        <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto" role="img" aria-label={`Hourly snowfall chart, peak ${maxSnow.toFixed(1)}mm at ${peakLabel}`}>
          <defs>
            <linearGradient id="snowGrad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#22d3ee" stopOpacity="0.3" />
              <stop offset="100%" stopColor="#22d3ee" stopOpacity="0" />
            </linearGradient>
          </defs>
          {[0.25, 0.5, 0.75].map((f) => (
            <line key={f} x1={P} y1={H - P - f * (H - P * 2)} x2={W - P} y2={H - P - f * (H - P * 2)} stroke="rgba(255,255,255,0.04)" strokeDasharray="4 4" />
          ))}
          <motion.path d={area} fill="url(#snowGrad)" initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ duration: 1.5, delay: 0.5 }} />
          <motion.path d={line} fill="none" stroke="#22d3ee" strokeWidth="2.5" strokeLinecap="round" initial={{ pathLength: 0 }} whileInView={{ pathLength: 1 }} viewport={{ once: true }} transition={{ duration: 2, ease: "easeOut", delay: 0.3 }} />
          <motion.path d={line} fill="none" stroke="#22d3ee" strokeWidth="6" opacity="0.15" initial={{ pathLength: 0 }} whileInView={{ pathLength: 1 }} viewport={{ once: true }} transition={{ duration: 2, ease: "easeOut", delay: 0.3 }} />
          {labels.map((l, i) => l ? <text key={i} x={P + i * ((W - P * 2) / (data.length - 1))} y={H - 8} textAnchor="middle" fill="rgba(255,255,255,0.2)" fontSize="10" fontFamily="Inter, system-ui">{l}</text> : null)}
        </svg>

        <div className="flex items-center justify-center gap-6 mt-4 text-[10px] text-white/20">
          <span>Data refreshed every 30 min</span>
        </div>
      </motion.div>
    </section>
  );
}
