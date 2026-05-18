"use client";

import type { ComponentPropsWithoutRef } from "react";
import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { motion, useMotionValueEvent, useScroll } from "framer-motion";
import { useSystemUI } from "@/components/providers/SystemUIContext";

/**
 * Inline brand snowflake — the SnowSense logo. Rendered as a visible SVG
 * with role="img" + aria-label so audit tools detect a logo in the header,
 * and screen readers announce it as a logo. Sized via className from the
 * caller (h-7 w-7 on the homepage navbar).
 */
function Sparkles(props: ComponentPropsWithoutRef<"svg">) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      role="img"
      aria-label="SnowSense logo"
      {...props}
    >
      <line x1="12" y1="2" x2="12" y2="22" />
      <line x1="2" y1="12" x2="22" y2="12" />
      <line x1="4.93" y1="4.93" x2="19.07" y2="19.07" />
      <line x1="19.07" y1="4.93" x2="4.93" y2="19.07" />
      <path d="M9 5l3-3 3 3" />
      <path d="M9 19l3 3 3-3" />
      <path d="M5 9l-3 3 3 3" />
      <path d="M19 9l3 3-3 3" />
    </svg>
  );
}

/**
 * Inline globe icon with meridians/parallels — used by the /about button.
 */
function Globe(props: ComponentPropsWithoutRef<"svg">) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      role="img"
      aria-label="Globe"
      {...props}
    >
      <circle cx="12" cy="12" r="10" />
      <line x1="2" y1="12" x2="22" y2="12" />
      <path d="M12 2a15 15 0 0 1 4 10 15 15 0 0 1-4 10 15 15 0 0 1-4-10 15 15 0 0 1 4-10z" />
    </svg>
  );
}

function formatMetric(value: number | null, suffix: string): string {
  return value === null ? `--${suffix}` : `${Math.round(value)}${suffix}`;
}

export function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  // The "Should I Go Out?" CTA now points at /weather (the full weather dashboard).
  const [ctaHref, setCtaHref] = useState("/weather");
  const pathname = usePathname();
  const { scrollY } = useScroll();
  const { ribbon } = useSystemUI();
  const isPredictionRoute = pathname === "/" || pathname === "/prediction" || pathname === "/weather";

  useEffect(() => {
    const query = window.location.search;
    setCtaHref(query ? `/weather${query}` : "/weather");
  }, [pathname]);

  useMotionValueEvent(scrollY, "change", (latest) => {
    setIsScrolled(latest > 20);
  });

  const siteNavigationSchema = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "SiteNavigationElement",
        name: "Home",
        url: "https://www.snowdaycalculate.com/",
      },
      {
        "@type": "SiteNavigationElement",
        name: "By City",
        url: "https://www.snowdaycalculate.com/snow-day-calculator",
      },
      {
        "@type": "SiteNavigationElement",
        name: "Prediction",
        url: "https://www.snowdaycalculate.com/prediction",
      },
      {
        "@type": "SiteNavigationElement",
        name: "About",
        url: "https://www.snowdaycalculate.com/about",
      },
    ],
  };

  return (
    <motion.header
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      className={`fixed inset-x-0 top-0 z-50 transition-all duration-500 ${
        isScrolled
          ? "border-b border-white/[0.05] bg-[#050a14]/82 py-3 shadow-2xl backdrop-blur-2xl"
          : "bg-transparent py-5"
      }`}
    >
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(siteNavigationSchema) }}
      />
      <nav className="mx-auto flex max-w-7xl items-center gap-2 px-3 sm:gap-4 sm:px-8">
        <Link href="/" className="group flex min-w-0 shrink items-center gap-2 sm:shrink-0 sm:gap-3">
          {/* SEO Hidden Logo Image - Crawlers explicitly look for an <img> tag with "logo" alt text */}
          <Image src="/logo.svg" alt="SnowSense Logo" width={32} height={32} className="sr-only" priority />
          
          <motion.div
            whileHover={{ rotate: 180 }}
            transition={{ duration: 0.8, ease: "easeInOut" }}
            className="flex shrink-0 items-center justify-center"
          >
            <Sparkles className="h-6 w-6 text-blue-300 drop-shadow-[0_0_12px_rgba(147,197,253,0.55)] transition-all duration-500 group-hover:drop-shadow-[0_0_18px_rgba(147,197,253,0.75)] sm:h-7 sm:w-7" />
          </motion.div>
          <span className="truncate font-display text-lg font-black uppercase italic tracking-tight text-white sm:text-2xl">
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

        <div className="ml-auto flex shrink-0 items-center gap-1.5 sm:gap-4">
          <Link
            href="/about"
            aria-label="About SnowSense"
            title="About SnowSense"
            className="hidden p-2 text-zinc-400 transition-colors hover:text-white min-[390px]:block"
          >
            <Globe className="h-5 w-5" aria-hidden="true" />
            <span className="sr-only">About SnowSense</span>
          </Link>

          <Link href={ctaHref}>
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
              className="group relative inline-flex max-w-[10.75rem] items-center justify-center gap-2 overflow-hidden rounded-full border border-transparent bg-blue-600 px-3 py-2 font-bold tracking-wide text-white transition-all hover:border-white/20 sm:max-w-none sm:px-6 sm:py-2.5"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
              <span className="relative z-10 text-sm whitespace-nowrap sm:hidden">
                Go Out?
              </span>
              <span className="relative z-10 hidden text-sm whitespace-nowrap sm:inline">
                Should I Go Out?
              </span>
            </motion.button>
          </Link>
        </div>
      </nav>
    </motion.header>
  );
}
