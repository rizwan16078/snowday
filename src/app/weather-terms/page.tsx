import type { Metadata } from "next";
import Link from "next/link";
import { GLOSSARY_TERMS, getGlossaryLetters } from "@/lib/glossary-data";
import { breadcrumbListSchema } from "@/lib/breadcrumb-schema";
import { GlossaryClient } from "./GlossaryClient";
import { BookOpen, Sparkles, Snowflake } from "lucide-react";

export const metadata: Metadata = {
  title: "Weather & Snow Glossary — A-Z Definitions",
  description:
    "A-Z glossary of weather and snow terms: petrichor, wind chill, ice dams, polar vortex, lake-effect snow, and 50+ more, all in plain English.",
  alternates: { canonical: "/weather-terms" },
  openGraph: {
    type: "website",
    url: "https://www.snowdaycalculate.com/weather-terms",
    title: "Weather & Snow Glossary — A-Z Definitions | SnowSense™",
    description:
      "60+ weather and snow terms defined in plain English. From anvil clouds to wind shear — the complete meteorology dictionary.",
    images: [{ url: "/og-default.svg", width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Weather & Snow Glossary — A-Z Definitions",
    description:
      "60+ weather and snow terms defined in plain English. From anvil clouds to wind shear.",
  },
};

export default function WeatherTermsPage() {
  const letters = getGlossaryLetters();
  const SITE = "https://www.snowdaycalculate.com";

  // DefinedTermSet schema — eligible for rich-snippet definitions in Google.
  const definedTermSetSchema = {
    "@context": "https://schema.org",
    "@type": "DefinedTermSet",
    "@id": `${SITE}/weather-terms`,
    name: "SnowSense Weather & Snow Glossary",
    description:
      "An A-Z glossary of weather and snow meteorology terms, with plain-English definitions.",
    url: `${SITE}/weather-terms`,
    hasDefinedTerm: GLOSSARY_TERMS.map((t) => ({
      "@type": "DefinedTerm",
      "@id": `${SITE}/weather-terms#${t.slug}`,
      name: t.term,
      description: t.definition,
      inDefinedTermSet: `${SITE}/weather-terms`,
      url: `${SITE}/weather-terms#${t.slug}`,
    })),
  };

  const breadcrumbSchema = breadcrumbListSchema([
    { name: "Home", path: "/" },
    { name: "Weather Terms", path: "/weather-terms" },
  ]);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(definedTermSetSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />

      <main className="min-h-screen pb-24">
        {/* Hero */}
        <section className="relative pt-32 pb-12 px-4 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-blue-500/[0.06] via-transparent to-transparent pointer-events-none" />
          <div className="absolute top-32 left-1/2 -translate-x-1/2 w-[500px] h-[500px] rounded-full bg-blue-500/[0.04] blur-[120px] pointer-events-none" />

          <div className="relative max-w-4xl mx-auto text-center">
            {/* Breadcrumb */}
            <nav className="flex items-center justify-center gap-2 text-xs text-white/50 mb-8">
              <Link href="/" className="hover:text-white/60 transition-colors">
                Home
              </Link>
              <span>›</span>
              <span className="text-white/50">Weather Terms</span>
            </nav>

            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-500/10 border border-blue-400/20 text-blue-300 text-[10px] uppercase tracking-[0.25em] font-bold mb-6">
              <BookOpen className="w-3 h-3" />
              The SnowSense Knowledge Base
            </div>

            <h1 className="text-4xl sm:text-5xl md:text-6xl font-display font-black text-white leading-[1.05] tracking-tight mb-6">
              The Weather &amp;
              <br />
              <span className="bg-gradient-to-r from-blue-300 via-cyan-300 to-blue-400 bg-clip-text text-transparent">
                Snow Glossary
              </span>
            </h1>

            <p className="text-base sm:text-lg text-white/60 leading-relaxed max-w-2xl mx-auto mb-8">
              {GLOSSARY_TERMS.length} weather and snow terms defined in plain
              English. From <em className="text-blue-300 not-italic">petrichor</em>{" "}
              to{" "}
              <em className="text-blue-300 not-italic">polar vortex</em> —
              everything a curious mind needs to read the sky.
            </p>

            {/* Quick stats row */}
            <div className="flex flex-wrap justify-center gap-3 sm:gap-6 text-xs text-white/40">
              <div className="flex items-center gap-2">
                <Sparkles className="w-3.5 h-3.5 text-blue-400" />
                <span>{GLOSSARY_TERMS.length} Terms</span>
              </div>
              <div className="flex items-center gap-2">
                <Snowflake className="w-3.5 h-3.5 text-cyan-400" />
                <span>{letters.length} Letters Covered</span>
              </div>
              <div className="flex items-center gap-2">
                <BookOpen className="w-3.5 h-3.5 text-purple-400" />
                <span>7 Categories</span>
              </div>
            </div>
          </div>
        </section>

        {/* Interactive glossary */}
        <GlossaryClient terms={GLOSSARY_TERMS} letters={letters} />

        {/* CTA Footer */}
        <section className="max-w-4xl mx-auto px-4 mt-20">
          <div className="glass-card rounded-3xl p-8 sm:p-10 text-center border border-blue-400/20 bg-gradient-to-br from-blue-500/[0.06] via-transparent to-transparent">
            <p className="text-[10px] uppercase tracking-[0.3em] font-bold text-blue-300 mb-3">
              Apply What You Just Learned
            </p>
            <h2 className="text-2xl sm:text-3xl font-display font-black text-white mb-4">
              See These Conditions In Real Time
            </h2>
            <p className="text-sm text-white/55 leading-relaxed mb-6 max-w-xl mx-auto">
              Now that you know what wind chill, barometric pressure, and the
              danger zone mean — track them live for your exact location.
            </p>
            <div className="flex flex-wrap justify-center gap-3">
              <Link
                href="/snow-day-calculator"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-full font-bold text-sm text-white transition-all hover:scale-105"
                style={{
                  background: "linear-gradient(135deg,#1d4ed8,#3b82f6)",
                  boxShadow: "0 4px 20px rgba(59,130,246,0.3)",
                }}
              >
                ❄️ Snow Day Calculator
              </Link>
              <Link
                href="/weather"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-full font-bold text-sm text-white/80 border border-white/15 transition-all hover:bg-white/5 hover:text-white"
              >
                Live Weather Dashboard
              </Link>
              <Link
                href="/blog"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-full font-bold text-sm text-white/80 border border-white/15 transition-all hover:bg-white/5 hover:text-white"
              >
                Read the Blog
              </Link>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
