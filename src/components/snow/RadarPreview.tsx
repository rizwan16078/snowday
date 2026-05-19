"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";

interface RadarPreviewProps {
  radarSrc: string;
  locationLabel: string;
}

/**
 * Format the current UTC time as HH:MM:SSZ for the live-scan readout.
 */
function formatUTC(date: Date): string {
  const hh = String(date.getUTCHours()).padStart(2, "0");
  const mm = String(date.getUTCMinutes()).padStart(2, "0");
  const ss = String(date.getUTCSeconds()).padStart(2, "0");
  return `${hh}:${mm}:${ss}Z`;
}

export function RadarPreview({ radarSrc, locationLabel }: RadarPreviewProps) {
  // Live scan timestamp + a synthetic bearing that drifts to match the
  // 6-second SVG sweep cycle (360° / 6s = 60°/s).
  const [scanTime, setScanTime] = useState<string>("--:--:--Z");
  const [bearing, setBearing] = useState<number>(0);

  useEffect(() => {
    const tick = () => {
      const now = new Date();
      setScanTime(formatUTC(now));
      // Sweep completes in 6 seconds → bearing = (ms % 6000) / 6000 * 360
      setBearing(Math.floor(((now.getTime() % 6000) / 6000) * 360));
    };
    tick();
    const id = setInterval(tick, 250);
    return () => clearInterval(id);
  }, []);

  return (
    <section className="mx-auto w-full max-w-6xl px-5" aria-label="Radar preview">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="mb-8 text-center"
      >
        <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.3em] text-emerald-400/60">
          Edge Radar Cache
        </p>
        <h3 className="text-2xl font-display font-black text-white/90 sm:text-3xl">
          Live Doppler Scan
        </h3>
        <p className="mt-2 text-xs text-white/50 max-w-md mx-auto">
          Tile generated at the edge, refreshed every 5 minutes, with synthetic
          precipitation cells modeled from regional storm history.
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.7, delay: 0.1 }}
        className="glass-card relative overflow-hidden rounded-2xl border border-emerald-500/10"
      >
        <Image
          src={radarSrc}
          alt={`Live doppler radar tile for ${locationLabel}`}
          width={1600}
          height={1120}
          unoptimized
          className="block h-[320px] w-full object-cover sm:h-[380px]"
        />

        {/* Vignette + edge fade */}
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse at center, transparent 55%, rgba(2,7,20,0.55) 100%)",
          }}
        />

        {/* CRT scanlines for that "live feed" feel */}
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.18] mix-blend-overlay"
          style={{
            backgroundImage:
              "repeating-linear-gradient(0deg, transparent 0, transparent 2px, rgba(74,222,128,0.18) 3px, transparent 4px)",
          }}
        />

        {/* Subtle moving scan-bar (CSS-only, top-down) */}
        <div className="pointer-events-none absolute inset-x-0 top-0 h-[2px] radar-scanbar" />

        {/* ── Top-left: live status badge ────────────────────────── */}
        <div className="absolute left-4 top-4 flex flex-col gap-2">
          <div className="inline-flex items-center gap-2 rounded-md border border-emerald-500/30 bg-black/45 px-2.5 py-1 backdrop-blur-sm">
            <div className="radar-dot-pulse h-1.5 w-1.5 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(74,222,128,0.8)]" />
            <span className="font-mono text-[10px] font-bold uppercase tracking-[0.18em] text-emerald-300">
              Doppler · Live
            </span>
          </div>
          <div className="font-mono text-[10px] leading-tight text-white/35">
            <div>
              SCAN <span className="text-emerald-400/80">{scanTime}</span>
            </div>
            <div className="text-white/25">UTC · 6s SWP</div>
          </div>
        </div>

        {/* ── Top-right: telemetry stack ─────────────────────────── */}
        <div className="absolute right-4 top-4 flex flex-col items-end gap-0.5 font-mono text-[10px] leading-snug">
          <div className="text-white/50">
            FRQ <span className="text-cyan-400">5.6&thinsp;GHz</span>
          </div>
          <div className="text-white/50">
            RNG <span className="text-cyan-400">200&thinsp;KM</span>
          </div>
          <div className="text-white/50">
            MODE <span className="text-cyan-400">BASE-REFL</span>
          </div>
          <div className="text-white/50">
            ELEV <span className="text-cyan-400">0.5°</span>
          </div>
        </div>

        {/* ── Bottom-left: location + cache info ─────────────────── */}
        <div className="absolute bottom-4 left-4 flex flex-col gap-0.5">
          <span className="font-mono text-[10px] font-bold uppercase tracking-[0.15em] text-white/55">
            {locationLabel || "Unresolved Sector"}
          </span>
          <span className="font-mono text-[9px] uppercase tracking-wider text-white/25">
            Edge Tile · SWR 300s · Cached
          </span>
        </div>

        {/* ── Bottom-right: live bearing ─────────────────────────── */}
        <div className="absolute bottom-4 right-4 flex flex-col items-end gap-0.5 font-mono text-[10px]">
          <div className="text-white/50">
            BRG{" "}
            <span className="font-bold text-emerald-400 tabular-nums">
              {String(bearing).padStart(3, "0")}°
            </span>
          </div>
          <div className="text-white/25 uppercase tracking-wider text-[9px]">
            HEAD-UP · NORTH-LK
          </div>
        </div>
      </motion.div>
    </section>
  );
}
