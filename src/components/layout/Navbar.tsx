"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, useMotionValueEvent, useScroll } from "framer-motion";
const Sparkles = (props: any) => <svg {...props}></svg>;
const Globe = (props: any) => <svg {...props}></svg>;
import { useSystemUI } from "@/components/providers/SystemUIContext";

function formatMetric(value: number | null, suffix: string): string {
  return value === null ? `--${suffix}` : `${Math.round(value)}${suffix}`;
}

export function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const pathname = usePathname();
  const { scrollY } = useScroll();
  const { ribbon } = useSystemUI();
  const isPredictionRoute = pathname === "/" || pathname === "/prediction";

  useMotionValueEvent(scrollY, "change", (latest) => {
    setIsScrolled(latest > 20);
  });

  return (
    <motion.nav
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      className={`fixed inset-x-0 top-0 z-50 transition-all duration-500 ${
        isScrolled
          ? "border-b border-white/[0.05] bg-[#050a14]/82 py-3 shadow-2xl backdrop-blur-2xl"
          : "bg-transparent py-5"
      }`}
    >
      <div className="mx-auto flex max-w-7xl items-center gap-4 px-5 sm:px-8">
        <Link href="/prediction" className="group flex shrink-0 items-center gap-3">
          <motion.div
            whileHover={{ rotate: 180 }}
            transition={{ duration: 0.8, ease: "easeInOut" }}
            className="flex items-center justify-center"
          >
            <Sparkles className="h-7 w-7 text-blue-300 drop-shadow-[0_0_12px_rgba(147,197,253,0.55)] transition-all duration-500 group-hover:drop-shadow-[0_0_18px_rgba(147,197,253,0.75)]" />
          </motion.div>
          <span className="font-display text-xl font-black uppercase italic tracking-tight text-white sm:text-2xl">
            SnowSense™
          </span>
        </Link>

        <div className="hidden min-w-0 flex-1 lg:block">
          <div className="glass-command mx-auto max-w-2xl rounded-2xl px-4 py-3">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-[9px] font-bold uppercase tracking-[0.32em] text-white/35">
                  Location
                </p>
                <p className="truncate text-sm font-semibold tracking-[0.18em] text-white/88">
                  {ribbon.locationLabel}
                  <span className="text-white/30">{" // "}</span>
                  {ribbon.latitudeLabel}
                </p>
              </div>
              <div>
                <p className="text-[9px] font-bold uppercase tracking-[0.32em] text-white/35">
                  Atmospheric Status
                </p>
                <p className="truncate text-sm font-semibold tracking-[0.16em] text-white/78">
                  TEMP: {formatMetric(ribbon.temperatureC, "°C")} | HUMIDITY:{" "}
                  {formatMetric(ribbon.humidityPercent, "%")}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="ml-auto flex items-center gap-2 sm:gap-4">
          {!isPredictionRoute ? (
            <div className="hidden items-center gap-8 md:flex">
              <Link
                href="/snow-day-calculator"
                className="text-sm font-semibold uppercase tracking-wider text-zinc-400 transition-colors duration-300 hover:text-white"
              >
                By City
              </Link>
              <Link
                href="/prediction"
                className="text-sm font-semibold uppercase tracking-wider text-zinc-400 transition-colors duration-300 hover:text-white"
              >
                Prediction
              </Link>
            </div>
          ) : null}

          <Link href="/about" className="p-2 text-zinc-400 transition-colors hover:text-white">
            <Globe className="h-5 w-5" />
          </Link>

          <Link href="/prediction">
            <motion.button
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.97 }}
              animate={{
                boxShadow: [
                  "0px 0px 0px rgba(59,130,246,0)",
                  "0px 0px 20px rgba(59,130,246,0.35)",
                  "0px 0px 0px rgba(59,130,246,0)",
                ],
              }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              className="group relative inline-flex items-center justify-center gap-2 overflow-hidden rounded-full border border-transparent bg-blue-600 px-4 py-2 font-bold tracking-wide text-white transition-all hover:border-white/20 sm:px-6 sm:py-2.5"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
              <span className="relative z-10 text-sm whitespace-nowrap">
                Should I Go Out?
              </span>
            </motion.button>
          </Link>
        </div>
      </div>
    </motion.nav>
  );
}
