"use client";

import { useEffect, useRef } from "react";
import type { SnowDayPrediction } from "@/types/snow";
import { Snowflake, Thermometer, Wind, Clock } from "lucide-react";

/**
 * StormAnatomy — The "WHY" layer
 *
 * A premium 2x2 grid showing each risk factor as a cinematic card.
 * Pure computed UI. All data is SSR-derived and cached.
 */

interface StormAnatomyProps {
  prediction: SnowDayPrediction;
}

interface AnatomyCard {
  key: keyof SnowDayPrediction["factors"];
  label: string;
  unit: string;
  icon: React.ReactNode;
  description: string;
  gradient: string;
  accentColor: string;
  getValue: (p: SnowDayPrediction) => string;
  getSubtext: (p: SnowDayPrediction) => string;
}

const cards: AnatomyCard[] = [
  {
    key: "snowfall",
    label: "Snowfall",
    unit: "risk",
    icon: <Snowflake className="w-5 h-5" />,
    description: "Forecast accumulation depth and intensity",
    gradient: "from-blue-500/20 to-cyan-500/10",
    accentColor: "#60a5fa",
    getValue: (p) => `${p.rawWeather?.snowfallMM?.toFixed(1) ?? "0"}mm`,
    getSubtext: (p) => {
      const mm = p.rawWeather?.snowfallMM ?? 0;
      if (mm > 15) return "Heavy accumulation expected";
      if (mm > 5) return "Moderate snowfall forecast";
      if (mm > 0) return "Light flurries possible";
      return "No snowfall forecast";
    },
  },
  {
    key: "iceRisk",
    label: "Ice Risk",
    unit: "threat",
    icon: <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2v20M2 12h20M4.93 4.93l14.14 14.14M19.07 4.93L4.93 19.07" /></svg>,
    description: "Freezing rain, sleet, and black ice probability",
    gradient: "from-cyan-500/20 to-blue-400/10",
    accentColor: "#22d3ee",
    getValue: (p) => {
      const score = p.factors.iceRisk;
      if (score > 70) return "Severe";
      if (score > 40) return "Moderate";
      if (score > 10) return "Low";
      return "Minimal";
    },
    getSubtext: (p) => {
      const temp = p.rawWeather?.temperature ?? 10;
      if (temp > -2 && temp <= 2) return "Danger zone: freezing point";
      if (temp < -10) return "Too cold for freezing rain";
      return `Surface temp: ${temp.toFixed(0)}°C`;
    },
  },
  {
    key: "temperature",
    label: "Wind Chill",
    unit: "factor",
    icon: <Thermometer className="w-5 h-5" />,
    description: "Road freeze potential and wind chill impact",
    gradient: "from-indigo-500/20 to-purple-500/10",
    accentColor: "#818cf8",
    getValue: (p) => {
      const temp = p.rawWeather?.temperature ?? 0;
      const feelsLike = p.rawWeather?.feelsLike ?? temp;
      return `${feelsLike.toFixed(0)}°C`;
    },
    getSubtext: (p) => {
      const temp = p.rawWeather?.temperature ?? 10;
      const wind = p.rawWeather?.windSpeedKph ?? 0;
      return `Actual: ${temp.toFixed(0)}°C · Wind: ${wind.toFixed(0)} km/h`;
    },
  },
  {
    key: "timing",
    label: "Storm Timing",
    unit: "window",
    icon: <Clock className="w-5 h-5" />,
    description: "Overnight and early morning accumulation risk",
    gradient: "from-violet-500/20 to-fuchsia-500/10",
    accentColor: "#a78bfa",
    getValue: (p) => {
      const score = p.factors.timing;
      if (score > 70) return "Critical";
      if (score > 40) return "Concerning";
      if (score > 10) return "Favorable";
      return "No Risk";
    },
    getSubtext: (p) => {
      const score = p.factors.timing;
      if (score > 60) return "Heavy overnight accumulation expected";
      if (score > 30) return "Snow during morning commute hours";
      return "Clear timing for road crews";
    },
  },
];

function getScoreColor(score: number) {
  if (score >= 70) return "#22c55e";
  if (score >= 40) return "#f59e0b";
  return "#ef4444";
}


export function StormAnatomy({ prediction }: StormAnatomyProps) {
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.querySelectorAll<HTMLElement>(".storm-card").forEach((el, i) => {
              setTimeout(() => el.classList.add("storm-card--visible"), i * 100);
            });
            entry.target.querySelectorAll<HTMLElement>(".storm-bar").forEach((el) => {
              const width = el.dataset.width ?? "0";
              setTimeout(() => { el.style.width = `${width}%`; }, 400);
            });
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1 }
    );
    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, []);

  return (
    <section
      ref={sectionRef}
      className="w-full max-w-6xl mx-auto px-5"
      aria-label="Storm anatomy breakdown"
    >
      {/* Section Header */}
      <div className="text-center mb-10 animate-fade-in-up">
        <p className="text-[10px] text-blue-400/60 uppercase tracking-[0.3em] font-bold mb-2">
          SnowSense™ Intelligence
        </p>
        <h3 className="text-2xl sm:text-3xl font-display font-black text-white/90">
          Storm Anatomy
        </h3>
        <p className="text-sm text-white/50 mt-2 max-w-md mx-auto">
          Every factor analyzed in real-time to calculate your snow day probability
        </p>
      </div>

      {/* 2x2 Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {cards.map((card) => {
          const score = prediction.factors[card.key];
          const scoreColor = getScoreColor(score);

          return (
            <div
              key={card.key}
              className="storm-card group relative overflow-hidden rounded-2xl glass-card p-6 hover:border-white/12 transition-all duration-500 opacity-0 translate-y-6"
              style={{ transition: "opacity 0.6s ease, transform 0.6s ease" }}
            >
              {/* Gradient accent */}
              <div
                className={`absolute inset-0 bg-gradient-to-br ${card.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500`}
              />

              <div className="relative z-10">
                {/* Header row */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div
                      className="p-2.5 rounded-xl"
                      style={{
                        background: `${card.accentColor}15`,
                        color: card.accentColor,
                      }}
                    >
                      {card.icon}
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-white/90">
                        {card.label}
                      </h3>
                      <p className="text-[10px] text-white/50 uppercase tracking-wider">
                        {card.unit}
                      </p>
                    </div>
                  </div>

                  {/* Score badge */}
                  <div
                    className="px-3 py-1 rounded-full text-xs font-bold tabular-nums"
                    style={{
                      background: `${scoreColor}15`,
                      color: scoreColor,
                    }}
                  >
                    {score}/100
                  </div>
                </div>

                {/* Value */}
                <p
                  className="text-2xl font-display font-black mb-1"
                  style={{ color: card.accentColor }}
                >
                  {card.getValue(prediction)}
                </p>

                {/* Subtext */}
                <p className="text-xs text-white/40 leading-relaxed">
                  {card.getSubtext(prediction)}
                </p>

                {/* Progress bar — CSS width animation via data-width */}
                <div className="mt-4 h-1.5 w-full rounded-full bg-white/5 overflow-hidden">
                  <div
                    className="storm-bar h-full rounded-full transition-[width] duration-[1200ms] ease-out"
                    data-width={score}
                    style={{
                      width: "0%",
                      background: `linear-gradient(90deg, ${card.accentColor}88, ${card.accentColor})`,
                      boxShadow: `0 0 8px ${card.accentColor}40`,
                    }}
                  />
                </div>

                {/* Description */}
                <p className="text-[10px] text-white/20 mt-3">
                  {card.description}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
