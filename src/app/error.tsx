"use client";

import { useEffect } from "react";
import { AlertTriangle, RefreshCw, Home } from "lucide-react";
import Link from "next/link";
import { TrustLayer } from "@/components/snow/TrustLayer";
import { PremiumFAQ } from "@/components/snow/PremiumFAQ";
import { RegionalLinks } from "@/components/snow/RegionalLinks";
import { WeatherCanvas } from "@/components/snow/WeatherCanvas";

/**
 * error.tsx — Global Error Boundary
 * "Radar Offline Mode"
 * Ensures the app never shows a blank screen if an API fails.
 * Keeps SEO and static content available.
 */

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error("SnowSense Global Error:", error);
  }, [error]);

  return (
    <>
      <WeatherCanvas probability={82} forceSnow />
      <div className="min-h-screen pt-32 pb-24 px-5 relative z-10">
        <div className="w-full max-w-4xl mx-auto space-y-24">

          {/* Error Hero */}
          <section className="text-center space-y-6">
            <div className="inline-flex p-4 rounded-full bg-red-500/10 mb-4">
              <AlertTriangle className="w-10 h-10 text-red-400" />
            </div>

            <p className="text-[10px] text-red-400/60 uppercase tracking-[0.3em] font-bold">
              Radar Offline Mode
            </p>

            <h1 className="text-3xl sm:text-5xl font-display font-black text-white/90">
              System Unavailable
            </h1>

            <p className="text-base text-white/50 max-w-lg mx-auto">
              We are currently unable to connect to our primary meteorological data sources.
              Our automated systems are attempting to restore the connection.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
              <button
                onClick={() => reset()}
                className="flex items-center gap-2 px-6 py-3 rounded-full bg-white text-black font-bold hover:bg-white/90 transition-colors"
              >
                <RefreshCw className="w-4 h-4" />
                Retry Connection
              </button>
              <Link
                href="/"
                className="flex items-center gap-2 px-6 py-3 rounded-full glass hover:bg-white/10 font-bold transition-colors"
              >
                <Home className="w-4 h-4" />
                Return Home
              </Link>
            </div>
          </section>

          {/* Fallback Static Content */}
          <div className="space-y-24 opacity-80 pointer-events-auto">
            <div className="text-center">
              <p className="text-sm text-white/30 uppercase tracking-widest font-semibold mb-8">
                While we reconnect...
              </p>
            </div>

            <TrustLayer />
            <RegionalLinks />
            <PremiumFAQ />
          </div>

        </div>
      </div>
    </>
  );
}
