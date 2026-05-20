"use client";

import { useEffect, useRef, useState } from "react";

interface HeroPredictionProps {
  probability?: number | null;
  status?: "Unlikely" | "Possible" | "Very Likely";
  confidence?: number;
  isFallback?: boolean;
  fallbackMessage?: string;
  isPending?: boolean;
  locationLabel?: string;
}

const statusConfig = {
  Unlikely: {
    color: "#ef4444",
    glow: "rgba(239,68,68,0.3)",
    emoji: "❄️",
    subtext: "Schools will likely remain open",
  },
  Possible: {
    color: "#f59e0b",
    glow: "rgba(245,158,11,0.3)",
    emoji: "🌨️",
    subtext: "Keep an eye on the forecast",
  },
  "Very Likely": {
    color: "#22c55e",
    glow: "rgba(34,197,94,0.3)",
    emoji: "☃️",
    subtext: "Start planning your snow day",
  },
};

export function HeroPrediction({
  probability,
  status,
  confidence,
  isFallback,
  fallbackMessage,
  isPending,
  locationLabel,
}: HeroPredictionProps) {
  const [displayed, setDisplayed] = useState(0);
  const animatedRef = useRef(false);
  const frameRef = useRef<number | null>(null);
  const displayedRef = useRef(0);
  const hasResolvedPrediction = typeof probability === "number" && status && confidence !== undefined;
  const activeStatus = status || "Possible";
  const cfg = statusConfig[activeStatus];

  useEffect(() => {
    displayedRef.current = displayed;
  }, [displayed]);

  useEffect(() => {
    if (!hasResolvedPrediction) {
      return undefined;
    }

    if (frameRef.current) {
      cancelAnimationFrame(frameRef.current);
    }

    const wasAnimated = animatedRef.current;
    const start = performance.now();
    const from = wasAnimated ? displayedRef.current : 0;
    const to = probability;
    const duration = wasAnimated ? 650 : 1600;
    animatedRef.current = true;

    const frame = (now: number) => {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, wasAnimated ? 3 : 4);
      setDisplayed(Math.round(from + (to - from) * eased));
      if (progress < 1) {
        frameRef.current = requestAnimationFrame(frame);
      }
    };

    frameRef.current = requestAnimationFrame(frame);

    return () => {
      if (frameRef.current) {
        cancelAnimationFrame(frameRef.current);
      }
    };
  }, [hasResolvedPrediction, probability]);

  if (isFallback) {
    return (
      <div className="flex flex-col items-center justify-center text-center animate-hero-appear">
        <div className="mb-6 text-8xl sm:text-9xl" aria-hidden="true">
          🌞
        </div>
        <p className="max-w-md text-2xl font-display font-bold leading-tight text-amber-300/90 sm:text-3xl">
          {fallbackMessage || "Not a chance. Go to the beach."}
        </p>
        <div className="mt-6 rounded-full border border-amber-500/20 bg-amber-500/10 px-6 py-2.5">
          <span className="text-sm font-semibold tracking-wide text-amber-400">
            No Snow Day Risk
          </span>
        </div>
      </div>
    );
  }

  if (!hasResolvedPrediction) {
    return (
      <div
        className={`flex flex-col items-center justify-center text-center transition-opacity duration-500 ${
          isPending ? "opacity-80" : "opacity-100"
        }`}
        role="status"
        aria-live="polite"
        aria-atomic="true"
      >
        <div className="animate-hero-appear relative">
          <span className="hero-number font-display text-[clamp(6rem,17vw,11rem)] font-black leading-none text-white/70">
            LIVE
          </span>
        </div>
        <div
          className="animate-slide-up mt-4"
          style={{ animationDelay: "0.24s", animationFillMode: "backwards" }}
        >
          <span className="text-lg font-display font-bold uppercase tracking-[0.25em] text-cyan-300/90 sm:text-xl">
            Streaming SnowSense
          </span>
        </div>
        <div
          className="animate-slide-up mt-3"
          style={{ animationDelay: "0.42s", animationFillMode: "backwards" }}
        >
          <p className="max-w-sm text-sm font-medium text-white/50 sm:text-base">
            Edge shell active for {locationLabel || "your district"} while hourly
            forecast intelligence streams in.
          </p>
        </div>
        <div
          className="animate-slide-up mt-6"
          style={{ animationDelay: "0.58s", animationFillMode: "backwards" }}
        >
          <div className="glass inline-flex items-center gap-2.5 rounded-full px-5 py-2">
            <div className="h-2 w-2 rounded-full bg-cyan-300 shadow-[0_0_10px_rgba(103,232,249,0.55)]" />
            <span className="text-sm text-white/60">Atmosphere model resolving</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`flex flex-col items-center justify-center text-center select-none transition-opacity duration-500 ${
        isPending ? "opacity-72" : "opacity-100"
      }`}
      role="status"
      aria-live="polite"
      aria-atomic="true"
    >
      <div className="animate-hero-appear relative">
        <span
          className="hero-number font-display text-[clamp(8rem,20vw,14rem)] font-black leading-none"
          style={{
            color: cfg.color,
            textShadow: `0 0 80px ${cfg.glow}, 0 0 160px ${cfg.glow}`,
          }}
          aria-label={`Snow day probability is ${probability} percent`}
        >
          {displayed}
          <span
            className="ml-1 align-top text-[clamp(2.5rem,6vw,5rem)] font-bold opacity-60"
            aria-hidden="true"
          >
            %
          </span>
        </span>
      </div>

      <div
        className="animate-slide-up mt-4"
        style={{ animationDelay: "0.3s", animationFillMode: "backwards" }}
      >
        <span
          className="text-lg font-display font-bold uppercase tracking-[0.25em] sm:text-xl"
          style={{ color: cfg.color, opacity: 0.9 }}
        >
          {cfg.emoji} {activeStatus}
        </span>
      </div>

      <div
        className="animate-slide-up mt-3"
        style={{ animationDelay: "0.5s", animationFillMode: "backwards" }}
      >
        <p className="max-w-xs text-sm font-medium text-white/50 sm:text-base">
          {cfg.subtext}
        </p>
      </div>

      <div
        className="animate-slide-up mt-6"
        style={{ animationDelay: "0.7s", animationFillMode: "backwards" }}
      >
        <div className="glass inline-flex items-center gap-2.5 rounded-full px-5 py-2">
          <div
            className="h-2 w-2 rounded-full"
            style={{
              background: cfg.color,
              boxShadow: `0 0 6px ${cfg.glow}`,
            }}
          />
          <span className="text-sm text-white/60">
            <span className="font-semibold text-white">{confidence}%</span> confidence
          </span>
        </div>
      </div>
    </div>
  );
}
