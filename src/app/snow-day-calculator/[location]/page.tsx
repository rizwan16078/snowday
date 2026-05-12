import type { Metadata } from "next";
import Link from "next/link";
import { fetchWeather } from "@/lib/weather";
import { runPredictionEngine } from "@/lib/prediction-engine";
import { geocodeSearch } from "@/lib/geocoding";
import { HeroPrediction } from "@/components/snow/HeroPrediction";
import { DetailsPanel } from "@/components/snow/DetailsPanel";
import { WeatherCanvas } from "@/components/snow/WeatherCanvas";
import { CityContentSection } from "@/components/snow/CityContentSection";
import { CustomDistrictCTA } from "@/components/snow/CustomDistrictCTA";
import { getCityContent } from "@/lib/city-content";
import type { GeocodingResult } from "@/types/snow";
import { ChevronDown } from "lucide-react";

interface Props {
  params: Promise<{ location: string }>;
}

// Resolve slug → geocoding result
async function resolveLocation(slug: string): Promise<GeocodingResult | null> {
  const query = slug.replace(/-/g, " ");
  const results = await geocodeSearch(query);
  return results[0] ?? null;
}

// ISR — revalidate every 30 minutes
export const revalidate = 1800;

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { location: rawSlug } = await params;
  // Normalize to lowercase — URLs should be lowercase per SEO best practice.
  // Prevents accidental uppercase slugs from leaking into the canonical/OG URLs.
  const slug = rawSlug.toLowerCase();
  const loc = await resolveLocation(slug);
  if (!loc) {
    const fallbackName = slug.replace(/-/g, " ");
    return { 
      title: `Location Not Found - ${fallbackName}`,
      description: `We couldn't find a snow day prediction for ${fallbackName}. Search for another city or school district on SnowSense™.`
    };
  }

  const name = [loc.city, loc.state].filter(Boolean).join(", ");
  const canonicalUrl = `https://www.snowdaycalculate.com/snow-day-calculator/${slug}`;
  // Dynamic OG card — city pages emit a personalized share preview.
  const ogUrl = `/api/og?loc=${encodeURIComponent(name)}`;
  return {
    title: `${name} Snow Day Calculator`,
    description: `Will school be cancelled in ${name} tomorrow? Get real-time snow day predictions powered by live weather, ice risk, and regional data.`,
    alternates: {
      canonical: `/snow-day-calculator/${slug}`,
    },
    openGraph: {
      type: "website",
      url: canonicalUrl,
      title: `${name} Snow Day Calculator`,
      description: `Live snow day probability for ${name}. Check if school will be cancelled tomorrow.`,
      images: [
        {
          url: ogUrl,
          width: 1200,
          height: 630,
          alt: `${name} Snow Day Calculator — SnowSense™`,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: `${name} Snow Day Calculator`,
      description: `Will school be cancelled in ${name} tomorrow?`,
      images: [ogUrl],
    },
  };
}

export default async function LocationPage({ params }: Props) {
  const { location: rawSlug } = await params;
  const slug = rawSlug.toLowerCase();
  const loc = await resolveLocation(slug);

  if (!loc) {
    return (
      <main className="min-h-screen flex items-center justify-center text-center px-4">
        <WeatherCanvas probability={null} />
        <div className="glass-card rounded-3xl p-10 relative z-10">
          <p className="text-4xl mb-4">🔍</p>
          <h1 className="text-2xl font-bold text-white mb-2">Location Not Found</h1>
          <p className="text-white/50 text-sm">
            We couldn&apos;t find <strong>{slug.replace(/-/g, " ")}</strong>.
          </p>
          <Link
            href="/"
            className="mt-6 inline-block px-6 py-3 rounded-xl bg-blue-600 text-white text-sm font-semibold hover:bg-blue-500 transition-colors"
          >
            ← Back to Calculator
          </Link>
        </div>
      </main>
    );
  }

  const locationName = [loc.city, loc.state].filter(Boolean).join(", ");
  
  let weather;
  let prediction;
  try {
    weather = await fetchWeather(loc.lat, loc.lon, "auto");
    prediction = runPredictionEngine(weather, { latitude: loc.lat, strictness: "normal" });
  } catch (e) {
    console.error(`Failed to fetch weather for ${locationName}:`, e);
    // Render the inline offline mode UI
    return (
      <main className="min-h-screen flex items-center justify-center text-center px-4">
        <WeatherCanvas probability={82} forceSnow />
        <div className="glass-card rounded-3xl p-10 relative z-10 max-w-md">
          <div className="flex justify-center mb-4">
            <div className="p-4 rounded-full bg-red-500/10 inline-flex">
              <span className="text-4xl text-red-400">⚠️</span>
            </div>
          </div>
          <p className="text-[10px] text-red-400/60 uppercase tracking-[0.3em] font-bold mb-4">
            Radar Offline Mode
          </p>
          <h1 className="text-2xl font-bold text-white mb-2">System Unavailable</h1>
          <p className="text-white/50 text-sm mb-6">
            We couldn&apos;t connect to our primary meteorological data sources. Our automated systems are attempting to restore the connection.
          </p>
          <div className="flex gap-4 justify-center">
            <Link
              href={`/snow-day-calculator/${slug}`}
              className="px-6 py-3 rounded-xl bg-white text-black text-sm font-semibold hover:bg-white/90 transition-colors"
            >
              Retry
            </Link>
            <Link
              href="/"
              className="px-6 py-3 rounded-xl glass text-white text-sm font-semibold hover:bg-white/10 transition-colors"
            >
              Back Home
            </Link>
          </div>
        </div>
      </main>
    );
  }

  // FAQ schema
  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: `Will there be a snow day in ${locationName} tomorrow?`,
        acceptedAnswer: {
          "@type": "Answer",
          text: `SnowSense™ currently shows a ${prediction.probability}% snow day probability for ${locationName}. Status: ${prediction.status}. ${prediction.explanation}`,
        },
      },
      {
        "@type": "Question",
        name: `How much snow is forecast for ${locationName}?`,
        acceptedAnswer: {
          "@type": "Answer",
          text: `Our model shows ${(weather.snowfallMM).toFixed(1)}mm of snowfall forecast for the next 24 hours in ${locationName}, with temperatures around ${weather.temperature.toFixed(0)}°C.`,
        },
      },
      {
        "@type": "Question",
        name: "How accurate is the SnowSense snow day calculator?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "SnowSense™ combines NWS and Open-Meteo weather data with regional tolerance modifiers and storm timing analysis. Our confidence score reflects data quality and forecast certainty.",
        },
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <div className="relative min-h-screen">
        <WeatherCanvas probability={prediction.probability} isFallback={prediction.isFallback} />

        <main className="relative z-10 min-h-screen flex flex-col items-center justify-center px-4" role="main">
          {/* Breadcrumb - Absolute positioned at top for immersive feel */}
          <nav aria-label="Breadcrumb" className="absolute top-8 left-1/2 -translate-x-1/2 w-full max-w-lg text-center">
            <ol className="inline-flex items-center gap-2 text-xs text-white/30 bg-white/5 backdrop-blur-md px-4 py-2 rounded-full border border-white/10">
              <li><Link href="/" className="hover:text-white/60 transition-colors">Home</Link></li>
              <li aria-hidden="true">›</li>
              <li><Link href="/snow-day-calculator" className="hover:text-white/60 transition-colors">Calculator</Link></li>
              <li aria-hidden="true">›</li>
              <li className="text-white/60 font-medium" aria-current="page">{locationName}</li>
            </ol>
          </nav>

          <h1 className="sr-only">
            {locationName} Snow Day Calculator
          </h1>

          <HeroPrediction
            probability={prediction.probability}
            status={prediction.status}
            confidence={prediction.confidence}
            isFallback={prediction.isFallback}
            fallbackMessage={prediction.fallbackMessage}
          />
          
          <div className="mt-8 text-center">
            <CustomDistrictCTA slug={slug} daysUsed={2} schoolType="public" />
          </div>

          {!prediction.isFallback && (
            <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 animate-scroll-bounce">
              <span className="text-[10px] text-white/20 uppercase tracking-widest font-medium">
                Analysis Details
              </span>
              <ChevronDown className="w-4 h-4 text-white/20" />
            </div>
          )}
        </main>

        {!prediction.isFallback && (
          <section className="relative z-10" aria-label="Detailed prediction breakdown">
            <DetailsPanel prediction={prediction} />
            
            {/* FAQ integrated into scroll section */}
            <div className="w-full max-w-2xl mx-auto px-5 pb-32">
              <div className="glass-card rounded-2xl p-6 space-y-4">
                <h2 className="text-sm font-bold uppercase tracking-widest text-white/40">
                  FAQ — {locationName}
                </h2>
                {faqSchema.mainEntity.map((q, i) => (
                  <details key={i} className="group border-b border-white/5 pb-4 last:border-0 last:pb-0">
                    <summary className="text-sm font-semibold text-white/80 cursor-pointer hover:text-white transition-colors list-none flex items-center justify-between">
                      {q.name}
                      <span className="text-white/30 group-open:rotate-180 transition-transform" aria-hidden="true">▾</span>
                    </summary>
                    <p className="mt-2 text-sm text-white/50 leading-relaxed pl-2 border-l-2 border-blue-500/30">
                      {q.acceptedAnswer.text}
                    </p>
                  </details>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* City-Specific Content — static SEO section */}
        {(() => {
          const cityContent = getCityContent(slug);
          return cityContent ? (
            <section className="relative z-10 py-16">
              <CityContentSection content={cityContent} />
            </section>
          ) : null;
        })()}
      </div>
    </>
  );
}
