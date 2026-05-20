import type { Metadata } from "next";
import Link from "next/link";
import { fetchWeather } from "@/lib/weather";
import { runPredictionEngine } from "@/lib/prediction-engine";
import { geocodeSearch } from "@/lib/geocoding";
import { HeroPrediction } from "@/components/snow/HeroPrediction";
import { DetailsPanel } from "@/components/snow/DetailsPanel";
import { WeatherCanvas } from "@/components/snow/WeatherCanvas";
import { CityContentSection } from "@/components/snow/CityContentSection";
import { CityEditorialSection } from "@/components/snow/CityEditorialSection";
import { NearbyCitiesBlock } from "@/components/snow/NearbyCitiesBlock";
import { CityDistrictsBlock } from "@/components/snow/CityDistrictsBlock";
import { CustomDistrictCTA } from "@/components/snow/CustomDistrictCTA";
import { HighIntentCitySection } from "@/components/snow/HighIntentCitySection";
import { getCityContent } from "@/lib/city-content";
import { breadcrumbListSchema } from "@/lib/breadcrumb-schema";
import { trimMetaTitle, trimMetaDescription } from "@/lib/seo-meta";
import {
  getCityRecord,
  getNearbyCities,
  getTopCitiesByPopulation,
  type CityRecord,
} from "@/lib/cities/helpers";
import { generateCityContent } from "@/lib/cities/content";
import { getDistrictsForCity } from "@/lib/districts/helpers";
import {
  buildNearbyCityComparisonNotes,
  isHighIntentCity,
} from "@/lib/high-intent-content";
import {
  getRecentStorms,
  getStormDataGeneratedAt,
} from "@/lib/storm-events";
import { RecentStormsCard } from "@/components/snow/RecentStormsCard";
import type { GeocodingResult } from "@/types/snow";
import { ChevronDown } from "lucide-react";

interface Props {
  params: Promise<{ location: string }>;
}

/**
 * generateStaticParams — pre-render the top 100 cities at build time.
 * The rest are rendered on-demand via ISR and cached. `dynamicParams: true`
 * (the Next.js default) is what makes the uncovered slugs still work.
 *
 * Why 100 and not all 480: each pre-rendered city costs one geocode-skipped
 * weather API call at build. 100 is a comfortable build-time budget that
 * still covers all the heavy-traffic cities. The other 380 pre-render on
 * first user/crawler visit, then cache for 30 minutes.
 */
export async function generateStaticParams() {
  return getTopCitiesByPopulation(100).map((c) => ({ location: c.slug }));
}

/**
 * Convert a CityRecord from the catalog into the GeocodingResult shape the
 * prediction engine expects. Avoids a live geocode API call for known slugs.
 */
function recordToGeocoding(c: CityRecord): GeocodingResult {
  return {
    lat: c.lat,
    lon: c.lon,
    city: c.name,
    state: c.stateName,
    country: "United States",
    slug: c.slug,
  };
}

/**
 * Resolve a slug to a geocoding-compatible result. Catalog first (fast,
 * deterministic, no API hit); falls back to live geocoding for user-typed
 * slugs that aren't in the catalog.
 */
async function resolveLocation(slug: string): Promise<GeocodingResult | null> {
  const record = getCityRecord(slug);
  if (record) return recordToGeocoding(record);
  // Unknown slug — fall back to external geocoding
  const query = slug.replace(/-/g, " ");
  const results = await geocodeSearch(query);
  return results[0] ?? null;
}

// ISR — revalidate every 30 minutes so the live prediction stays fresh.
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

  // Per-city unique meta description (H2 + M2 fix). If the slug is in our
  // catalog, use the climate-zone-specific generator which produces a
  // meaningfully different description per city. Unknown slugs get the
  // generic template fallback.
  const record = getCityRecord(slug);
  const generated = record ? generateCityContent(record) : null;
  const description = trimMetaDescription(
    generated?.metaDescription ??
      `Will school be cancelled in ${name} tomorrow? Get real-time snow day predictions powered by live weather, ice risk, and regional data.`
  );

  // Title budget — Next.js template appends ' | SnowSense™' (~12 chars),
  // so the base title is capped at ~48 chars to keep the full SERP title
  // under Google's 60-char display limit.
  const rawTitle = `${name} Snow Day Calculator`;
  const title = trimMetaTitle(rawTitle, 48);

  // Per-city keywords — distinct token mix per page (city, state, slug).
  const cityKeywords = [
    `${name.toLowerCase()} snow day`,
    `${name.toLowerCase()} snow day calculator`,
    `${loc.city.toLowerCase()} school closures`,
    `${loc.city.toLowerCase()} weather`,
    "snow day probability",
    "school cancellation",
    "winter weather forecast",
  ];

  return {
    title,
    description,
    keywords: cityKeywords,
    alternates: {
      canonical: `/snow-day-calculator/${slug}`,
    },
    openGraph: {
      type: "website",
      url: canonicalUrl,
      title: trimMetaTitle(`${name} Snow Day Calculator`, 60),
      description: trimMetaDescription(
        `Live snow day probability for ${name}. Check if school will be cancelled tomorrow.`
      ),
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
      title: trimMetaTitle(`${name} Snow Day Calculator`, 60),
      description: trimMetaDescription(
        `Will school be cancelled in ${name} tomorrow?`
      ),
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
          <h2 className="text-2xl font-bold text-white mb-2">Location Not Found</h2>
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
          <h2 className="text-2xl font-bold text-white mb-2">System Unavailable</h2>
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

  const cityRecord = getCityRecord(slug);

  // BreadcrumbList (H4 fix). Improves SERP rendering: trail shown directly
  // in mobile results instead of a long URL path. Includes the state hub
  // when known — this adds an internal inbound link to each state page.
  const breadcrumbSchema = breadcrumbListSchema(
    cityRecord
      ? [
          { name: "Home", path: "/" },
          { name: "Snow Day Calculator", path: "/snow-day-calculator" },
          {
            name: cityRecord.stateName,
            path: `/snow-day-calculator/state/${cityRecord.stateSlug}`,
          },
          { name: locationName, path: `/snow-day-calculator/${slug}` },
        ]
      : [
          { name: "Home", path: "/" },
          { name: "Snow Day Calculator", path: "/snow-day-calculator" },
          { name: locationName, path: `/snow-day-calculator/${slug}` },
        ]
  );
  const premiumContent = cityRecord ? getCityContent(slug) : undefined;
  const generatedContent = cityRecord ? generateCityContent(cityRecord) : null;
  const storms = cityRecord ? getRecentStorms(cityRecord.slug, 4) : [];
  const cityDistricts = cityRecord
    ? getDistrictsForCity(cityRecord.slug).map((district) => ({
        slug: district.slug,
        name: district.name,
        enrollment: district.enrollment,
        type: district.type,
        websiteUrl: district.websiteUrl,
        websiteDomain: district.websiteDomain,
      }))
    : [];
  const nearbyCities = cityRecord ? getNearbyCities(cityRecord, 6) : [];
  const nearbyCityComparisons = cityRecord
    ? buildNearbyCityComparisonNotes(cityRecord, nearbyCities)
    : [];
  const showHighIntentSection =
    !!cityRecord && isHighIntentCity(slug);
  const highIntentThresholdLabel = premiumContent
    ? `${premiumContent.closureThresholdInches} inches`
    : generatedContent?.closureThreshold.short ?? "";
  const highIntentThresholdContext = premiumContent?.snowDayContext
    ?? generatedContent?.closureThreshold.paragraph
    ?? "";

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <div className="relative min-h-screen">
        <WeatherCanvas probability={prediction.probability} isFallback={prediction.isFallback} />

        <main className="relative z-10 min-h-screen flex flex-col items-center justify-center px-4" role="main">
          {/* Breadcrumb - Absolute positioned at top for immersive feel */}
          <nav aria-label="Breadcrumb" className="absolute top-8 left-1/2 -translate-x-1/2 w-full max-w-lg text-center">
            <ol className="inline-flex items-center gap-2 text-xs text-white/50 bg-white/5 backdrop-blur-md px-4 py-2 rounded-full border border-white/10">
              <li><Link href="/" className="hover:text-white/60 transition-colors">Home</Link></li>
              <li aria-hidden="true">›</li>
              <li><Link href="/snow-day-calculator" className="hover:text-white/60 transition-colors">Calculator</Link></li>
              {cityRecord ? (
                <>
                  <li aria-hidden="true">›</li>
                  <li>
                    <Link
                      href={`/snow-day-calculator/state/${cityRecord.stateSlug}`}
                      className="hover:text-white/60 transition-colors"
                    >
                      {cityRecord.stateName}
                    </Link>
                  </li>
                </>
              ) : null}
              <li aria-hidden="true">›</li>
              <li className="text-white/60 font-medium" aria-current="page">{locationName}</li>
            </ol>
          </nav>

          {/* Visible H1 — differentiated from meta title for SEO.
              Title = "{name} Snow Day Calculator" (keyword-focused).
              H1 = conversational variant to avoid H1/title duplicate flag. */}
          <header className="text-center mb-4 sm:mb-6 px-4">
            <h1 className="font-display text-2xl sm:text-3xl md:text-4xl font-black tracking-tight text-white">
              Will School Be Closed in {locationName}?
            </h1>
            <p className="mt-2 text-sm sm:text-base font-medium text-white/55 max-w-xl mx-auto">
              Real-time probability that schools in {locationName} will be cancelled
              tomorrow, based on live forecast data and local closure thresholds.
            </p>
          </header>

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
              <span className="text-[10px] text-white/50 uppercase tracking-widest font-medium">
                Analysis Details
              </span>
              <ChevronDown className="w-4 h-4 text-white/50" />
            </div>
          )}
        </main>

        {!prediction.isFallback && (
          <section className="relative z-10" aria-label="Detailed prediction breakdown">
            <DetailsPanel prediction={prediction} />
            
            {/* FAQ integrated into scroll section */}
            <div className="w-full max-w-2xl mx-auto px-5 pb-32">
              <div className="glass-card rounded-2xl p-6 space-y-4">
                <h2 className="text-sm font-bold uppercase tracking-widest text-white/50">
                  FAQ — {locationName}
                </h2>
                {faqSchema.mainEntity.map((q, i) => (
                  <details key={i} className="group border-b border-white/5 pb-4 last:border-0 last:pb-0">
                    <summary className="text-sm font-semibold text-white/80 cursor-pointer hover:text-white transition-colors list-none flex items-center justify-between">
                      {q.name}
                      <span className="text-white/50 group-open:rotate-180 transition-transform" aria-hidden="true">▾</span>
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

        {/* City-Specific Content — SEO section.
            Strategy: premium hand-authored cities (the original 8 in
            city-content.ts) get the richer CityContentSection rendering.
            All other cities get the template-generated editorial (500+
            words per climate zone) from the new catalog system. */}
        {premiumContent ? (
          <section className="relative z-10 py-16">
            <CityContentSection content={premiumContent} />
          </section>
        ) : cityRecord && generatedContent ? (
          <CityEditorialSection
            content={generatedContent}
            cityName={cityRecord.displayName}
            stateName={cityRecord.stateName}
          />
        ) : null}

        {showHighIntentSection && highIntentThresholdLabel && highIntentThresholdContext ? (
          <HighIntentCitySection
            cityName={cityRecord.displayName}
            thresholdLabel={highIntentThresholdLabel}
            thresholdContext={highIntentThresholdContext}
            districts={cityDistricts}
            storms={storms}
            comparisons={nearbyCityComparisons}
          />
        ) : null}

        {/* Recent storms from the NWS Storm Events DB (E-E-A-T).
            Card self-hides when the static dataset has no events for this
            slug (e.g., long-tail cities or non-snow regions). */}
        {cityRecord && storms.length > 0 ? (
          <RecentStormsCard
            cityName={cityRecord.displayName}
            storms={storms}
            generatedAt={getStormDataGeneratedAt()}
          />
        ) : null}

        {/* School districts serving this city — internal linking to
            /school-district/[slug] pages. Block self-hides if catalog has
            no district matched to this city slug. */}
        {cityRecord ? (
          <CityDistrictsBlock cityName={cityRecord.displayName} districts={cityDistricts} />
        ) : null}

        {/* Nearby Cities block (M4 fix) — only rendered for catalog cities.
            Improves internal linking density, keeps visitors on-site for a
            second page view, and gives Google a web of related local pages
            to discover.  */}
        {cityRecord ? (
          <NearbyCitiesBlock
            originName={cityRecord.displayName}
            nearby={nearbyCities.map((city) => ({
              slug: city.slug,
              name: city.name,
              state: city.state,
              stateName: city.stateName,
              distanceKm: city.distanceKm,
              snowInches: city.snowInches,
            }))}
          />
        ) : null}
      </div>
    </>
  );
}
