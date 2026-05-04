"use client";

import { useMemo } from "react";

type WeatherScene = "storm" | "cloudy" | "clear" | "warm" | "idle";

interface WeatherCanvasProps {
  probability?: number | null;
  isFallback?: boolean;
  forceSnow?: boolean;
}

function getScene(
  probability: number | null,
  isFallback?: boolean,
  forceSnow?: boolean
): WeatherScene {
  if (forceSnow) {
    return "storm";
  }
  if (isFallback) return "warm";
  if (probability === null || probability === undefined) return "idle";
  if (probability >= 65) return "storm";
  if (probability >= 25) return "cloudy";
  return "clear";
}

const sceneGradients: Record<WeatherScene, string> = {
  storm:
    "radial-gradient(ellipse 120% 100% at 20% 80%, #081323 0%, #0f2442 35%, #160f38 68%, #040a16 100%)",
  cloudy:
    "radial-gradient(ellipse 100% 100% at 30% 40%, #0d1626 0%, #0d1621 55%, #06101a 100%)",
  clear:
    "radial-gradient(ellipse 80% 100% at 50% 20%, #06111f 0%, #091225 46%, #03070f 100%)",
  warm:
    "linear-gradient(135deg, #1c1005 0%, #342012 35%, #1a1307 58%, #0c0903 100%)",
  idle:
    "radial-gradient(ellipse at 50% 50%, #09111d 0%, #060c16 52%, #03060d 100%)",
};

function seededValue(seed: number): number {
  const x = Math.sin(seed * 12.9898) * 43758.5453;
  return x - Math.floor(x);
}

function buildSnowflakes(scene: WeatherScene) {
  const count =
    scene === "storm" ? 88 : scene === "cloudy" ? 56 : scene === "clear" ? 36 : scene === "warm" ? 20 : 28;

  return Array.from({ length: count }, (_, index) => {
    const baseSeed = index + scene.length * 17;
    const size = scene === "storm" ? 2.6 + seededValue(baseSeed) * 4.8 : 2.2 + seededValue(baseSeed) * 4.2;

    return {
      id: `${scene}-${index}`,
      x: `${seededValue(baseSeed + 1) * 100}%`,
      size: `${size.toFixed(2)}px`,
      duration: `${(6 + seededValue(baseSeed + 2) * 10).toFixed(2)}s`,
      delay: `${(-seededValue(baseSeed + 3) * 14).toFixed(2)}s`,
      drift: seededValue(baseSeed + 4) > 0.42,
      opacity:
        scene === "storm"
          ? 0.55 + seededValue(baseSeed + 5) * 0.35
          : 0.42 + seededValue(baseSeed + 5) * 0.4,
    };
  });
}

function buildStars(scene: WeatherScene) {
  const count = scene === "clear" || scene === "idle" ? 18 : 6;

  return Array.from({ length: count }, (_, index) => {
    const baseSeed = index + scene.length * 29;
    return {
      id: `${scene}-star-${index}`,
      x: `${seededValue(baseSeed + 1) * 100}%`,
      y: `${seededValue(baseSeed + 2) * 78}%`,
      size: `${(1 + seededValue(baseSeed + 3) * 1.8).toFixed(2)}px`,
      delay: `${(seededValue(baseSeed + 4) * 5).toFixed(2)}s`,
      duration: `${(3 + seededValue(baseSeed + 5) * 4).toFixed(2)}s`,
      opacity: 0.2 + seededValue(baseSeed + 6) * 0.35,
    };
  });
}

export function WeatherCanvas({
  probability = null,
  isFallback = false,
  forceSnow = false,
}: WeatherCanvasProps) {
  const scene = getScene(probability, isFallback, forceSnow);
  const snowflakes = useMemo(() => buildSnowflakes(scene), [scene]);
  const stars = useMemo(() => buildStars(scene), [scene]);

  return (
    <div className="fixed inset-0 -z-10 overflow-hidden" aria-hidden="true">
      <div
        className="absolute inset-0 transition-all duration-2000 ease-in-out"
        style={{ background: sceneGradients[scene] }}
      />

      <div
        className="absolute -left-[10%] top-[8%] h-[520px] w-[520px] rounded-full"
        style={{
          background:
            scene === "warm"
              ? "radial-gradient(circle, rgba(251,191,36,0.09) 0%, transparent 72%)"
              : "radial-gradient(circle, rgba(96,165,250,0.12) 0%, transparent 72%)",
          animation: "pulse-glow 8s ease-in-out infinite",
        }}
      />
      <div
        className="absolute bottom-[12%] right-[-6%] h-[420px] w-[420px] rounded-full"
        style={{
          background:
            scene === "storm"
              ? "radial-gradient(circle, rgba(167,139,250,0.12) 0%, transparent 72%)"
              : "radial-gradient(circle, rgba(34,197,94,0.07) 0%, transparent 72%)",
          animation: "pulse-glow 10s ease-in-out infinite 2s",
        }}
      />

      {snowflakes.map((flake) => (
        <div
          key={flake.id}
          className={`snowflake ${flake.drift ? "snowflake-drift" : ""}`}
          style={
            {
              "--x": flake.x,
              "--size": flake.size,
              "--duration": flake.duration,
              "--delay": flake.delay,
              opacity: flake.opacity,
            } as React.CSSProperties
          }
        />
      ))}

      {stars.map((star) => (
        <div
          key={star.id}
          className="absolute rounded-full bg-white"
          style={{
            left: star.x,
            top: star.y,
            width: star.size,
            height: star.size,
            opacity: star.opacity,
            animation: `star-twinkle ${star.duration} ease-in-out infinite ${star.delay}`,
          }}
        />
      ))}

      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-transparent" />
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#050a14] via-transparent to-transparent" />
      <div
        className="weather-canvas-static hidden absolute inset-0"
        style={{ background: sceneGradients[scene] }}
      />
    </div>
  );
}
