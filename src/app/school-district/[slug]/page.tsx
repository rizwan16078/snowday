/**
 * /school-district/[slug]
 *
 * Statically generates a snow-day page for ~80 top US school districts.
 * Each page:
 *   - inherits its primary city's weather & prediction
 *   - has district-specific editorial (decision process, district stats)
 *   - links back to the parent city page + nearby districts
 *
 * Targets the "[district] snow day" query family (e.g., "Boston Public
 * Schools snow day", "LAUSD snow day").
 */

import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Building2, ExternalLink, ChevronDown, Users, ArrowLeft } from "lucide-react";
import { fetchWeather } from "@/lib/weather";
import { runPredictionEngine } from "@/lib/prediction-engine";
import { HeroPrediction } from "@/components/snow/HeroPrediction";
import { DetailsPanel } from "@/components/snow/DetailsPanel";
import { HighIntentDistrictSection } from "@/components/snow/HighIntentDistrictSection";
import { WeatherCanvas } from "@/components/snow/WeatherCanvas";
import {
  ALL_DISTRICTS,
  getDistrictRecord,
  getDistrictsInState,
  getTopDistrictsByEnrollment,
  formatEnrollment,
} from "@/lib/districts/helpers";
import { generateDistrictContent } from "@/lib/districts/content";
import { breadcrumbListSchema } from "@/lib/breadcrumb-schema";
import { trimMetaTitle, trimMetaDescription } from "@/lib/seo-meta";
import { generateCityContent } from "@/lib/cities/content";
import {
  buildDistrictComparisonNotes,
  isHighIntentDistrict,
} from "@/lib/high-intent-content";
import { getRecentStorms } from "@/lib/storm-events";

interface Props {
  params: Promise<{ slug: string }>;
}

// ISR — 30-minute revalidate so live prediction stays fresh.
export const revalidate = 1800;

/**
 * Pre-render every district at build time. There are ~80 — small enough to
 * fully SSG without hitting weather-API rate limits the way 100 cities did.
 */
export async function generateStaticParams() {
  return ALL_DISTRICTS.map((d) => ({ slug: d.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug: rawSlug } = await params;
  const slug = rawSlug.toLowerCase();
  const district = getDistrictRecord(slug);
  if (!district) {
    return { title: "District Not Found" };
  }

  const content = generateDistrictContent(district);
  const canonical = `https://www.snowdaycalculate.com/school-district/${slug}`;
  const ogUrl = `/api/og?loc=${encodeURIComponent(district.name)}`;

  const baseTitle = `${district.name} Snow Day Calculator`;
  const trimmedDescription = trimMetaDescription(content.metaDescription);

  const districtKeywords = [
    `${district.name.toLowerCase()} snow day`,
    `${district.name.toLowerCase()} closure`,
    `${district.name.toLowerCase()} school cancellation`,
    `${district.stateName.toLowerCase()} school closures`,
    "school district snow day",
    "snow day probability",
  ];

  return {
    title: trimMetaTitle(baseTitle, 48),
    description: trimmedDescription,
    keywords: districtKeywords,
    alternates: { canonical: `/school-district/${slug}` },
    openGraph: {
      type: "website",
      url: canonical,
      title: trimMetaTitle(baseTitle, 60),
      description: trimmedDescription,
      images: [
        {
          url: ogUrl,
          width: 1200,
          height: 630,
          alt: `${district.name} Snow Day Calculator — SnowSense™`,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: trimMetaTitle(baseTitle, 60),
      description: trimmedDescription,
      images: [ogUrl],
    },
  };
}

export default async function DistrictPage({ params }: Props) {
  const { slug: rawSlug } = await params;
  const slug = rawSlug.toLowerCase();
  const district = getDistrictRecord(slug);
  if (!district) notFound();

  const content = generateDistrictContent(district);
  const city = district.city;

  // Live weather + prediction via the linked city's coordinates.
  let weather;
  let prediction;
  let weatherFailed = false;
  try {
    weather = await fetchWeather(city.lat, city.lon, "auto");
    prediction = runPredictionEngine(weather, {
      latitude: city.lat,
      strictness: "normal",
    });
  } catch (e) {
    console.error(`District weather fetch failed for ${district.name}:`, e);
    weatherFailed = true;
  }

  // Related districts in the same state (excluding this one)
  const allRelatedInState = getDistrictsInState(district.state).filter(
    (relatedDistrict) => relatedDistrict.slug !== district.slug
  );
  // Districts in states with few catalog districts (e.g. CT, ME, UT, AK, ID)
  // would otherwise have 0 related links, leaving them with only 1 inbound
  // link. Backfill from the top national districts to guarantee at least 5
  // outbound links per district page.
  const relatedInState = allRelatedInState.length >= 5
    ? allRelatedInState.slice(0, 5)
    : [
        ...allRelatedInState,
        ...getTopDistrictsByEnrollment(12).filter(
          (d) =>
            d.slug !== district.slug &&
            !allRelatedInState.some((r) => r.slug === d.slug)
        ),
      ].slice(0, 5);
  const cityClosureContext = generateCityContent(city);
  const recentStorms = getRecentStorms(city.slug, 3);
  const districtComparisons = buildDistrictComparisonNotes(
    district,
    allRelatedInState
  );
  const showHighIntentSection = isHighIntentDistrict(slug);

  // ─── Structured data ─────────────────────────────────────────────────────
  const breadcrumbSchema = breadcrumbListSchema([
    { name: "Home", path: "/" },
    { name: "Snow Day Calculator", path: "/snow-day-calculator" },
    {
      name: district.stateName,
      path: `/snow-day-calculator/state/${city.stateSlug}`,
    },
    { name: district.name, path: `/school-district/${slug}` },
  ]);

  // EducationalOrganization schema — tells Google this page is the canonical
  // representation of this organization for snow-day intent.
  const orgSchema = {
    "@context": "https://schema.org",
    "@type": "EducationalOrganization",
    name: district.name,
    url: `https://www.snowdaycalculate.com/school-district/${slug}`,
    sameAs: [district.websiteUrl],
    address: {
      "@type": "PostalAddress",
      addressLocality: city.name,
      addressRegion: district.state,
      addressCountry: "US",
    },
    description: content.metaDescription,
  };

  const faqSchema = prediction
    ? {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        mainEntity: [
          {
            "@type": "Question",
            name: `Will ${district.name} close tomorrow?`,
            acceptedAnswer: {
              "@type": "Answer",
              text: `SnowSense™ currently shows a ${prediction.probability}% snow day probability for ${district.name}, based on live forecast data for ${city.displayName}. Status: ${prediction.status}.`,
            },
          },
          {
            "@type": "Question",
            name: `How does ${district.name} decide on snow days?`,
            acceptedAnswer: {
              "@type": "Answer",
              text: content.decisionProcess.paragraphs[0],
            },
          },
          {
            "@type": "Question",
            name: `How many students attend ${district.name}?`,
            acceptedAnswer: {
              "@type": "Answer",
              text: `${district.name} serves approximately ${formatEnrollment(district.enrollment)} across ${city.displayName} and the surrounding ${district.stateName} community.`,
            },
          },
        ],
      }
    : null;

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(orgSchema) }}
      />
      {faqSchema && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
        />
      )}

      <div className="relative min-h-screen">
        <WeatherCanvas
          probability={prediction?.probability ?? null}
          isFallback={prediction?.isFallback}
        />

        <main
          className="relative z-10 flex flex-col items-center px-4 pb-12 pt-28 sm:pt-32 md:min-h-screen md:justify-center"
        >
          {/* Breadcrumb */}
          <nav
            aria-label="Breadcrumb"
            className="mb-8 max-w-2xl text-center"
          >
            <ol className="inline-flex flex-wrap justify-center items-center gap-2 text-xs text-white/50 bg-white/5 backdrop-blur-md px-4 py-2 rounded-full border border-white/10">
              <li>
                <Link href="/" className="hover:text-white/70">
                  Home
                </Link>
              </li>
              <li aria-hidden="true">›</li>
              <li>
                <Link
                  href="/snow-day-calculator"
                  className="hover:text-white/70"
                >
                  Calculator
                </Link>
              </li>
              <li aria-hidden="true">›</li>
              <li>
                <Link
                  href={`/snow-day-calculator/state/${city.stateSlug}`}
                  className="hover:text-white/70"
                >
                  {district.stateName}
                </Link>
              </li>
              <li aria-hidden="true">›</li>
              <li
                className="text-white/70 font-medium"
                aria-current="page"
              >
                {district.name}
              </li>
            </ol>
          </nav>

          {/* H1 + lede */}
          <header className="text-center mb-6 max-w-3xl">
            <p className="text-[10px] text-blue-400/70 uppercase tracking-[0.3em] font-bold mb-3">
              School District · {district.stateName}
            </p>
            <h1 className="font-display text-3xl sm:text-4xl md:text-5xl font-black tracking-tight text-white mb-3">
              Will {district.name} Have a Snow Day?
            </h1>
            <p className="text-white/55 text-base sm:text-lg max-w-2xl mx-auto leading-relaxed">
              {content.lede}
            </p>
          </header>

          {/* Hero prediction (or fallback) */}
          {prediction ? (
            <HeroPrediction
              probability={prediction.probability}
              status={prediction.status}
              confidence={prediction.confidence}
              isFallback={prediction.isFallback}
              fallbackMessage={prediction.fallbackMessage}
            />
          ) : weatherFailed ? (
            <div className="glass-card rounded-3xl p-8 text-center max-w-md">
              <p className="text-[10px] text-red-400/60 uppercase tracking-[0.3em] font-bold mb-3">
                Radar Offline Mode
              </p>
              <p className="text-white/60 text-sm">
                Live forecast temporarily unavailable. Check back in a few minutes.
              </p>
            </div>
          ) : null}

          {/* Quick stats strip */}
          <div className="mt-8 grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-2xl w-full">
            <StatCard
              icon={<Users className="w-4 h-4" aria-hidden="true" />}
              label="Enrollment"
              value={district.enrollment.toLocaleString("en-US")}
            />
            <StatCard
              icon={<Building2 className="w-4 h-4" aria-hidden="true" />}
              label="District type"
              value={district.type.toUpperCase()}
            />
            <StatCard
              icon={null}
              label="Avg snowfall"
              value={`${city.snowInches}"`}
            />
            <StatCard
              icon={null}
              label="Primary city"
              value={city.name}
            />
          </div>

          {prediction && !prediction.isFallback && (
            <div className="mt-12 flex flex-col items-center gap-2 animate-scroll-bounce">
              <span className="text-[10px] text-white/50 uppercase tracking-widest font-medium">
                District Details
              </span>
              <ChevronDown
                className="w-4 h-4 text-white/50"
                aria-hidden="true"
              />
            </div>
          )}
        </main>

        {/* Details panel (live forecast breakdown) */}
        {prediction && !prediction.isFallback && (
          <section
            className="relative z-10"
            aria-label="Live forecast breakdown"
          >
            <DetailsPanel prediction={prediction} />
          </section>
        )}

        {showHighIntentSection ? (
          <HighIntentDistrictSection
            districtName={district.name}
            websiteUrl={district.websiteUrl}
            websiteDomain={district.websiteDomain}
            thresholdLabel={cityClosureContext.closureThreshold.short}
            thresholdContext={content.closureTriggers.paragraph}
            cityForecastSlug={city.slug}
            storms={recentStorms}
            comparisons={districtComparisons}
          />
        ) : null}

        {/* ─── Editorial: Decision process ──────────────────────────────── */}
        <section aria-label="Decision process" className="relative z-10 py-16 px-4">
          <div className="max-w-3xl mx-auto space-y-10">
            <div>
              <h2 className="text-xl sm:text-2xl font-display font-black text-white mb-4">
                {content.decisionProcess.heading}
              </h2>
              <div className="space-y-4">
                {content.decisionProcess.paragraphs.map((p, i) => (
                  <p
                    key={i}
                    className="text-white/60 text-[15px] leading-relaxed"
                  >
                    {p}
                  </p>
                ))}
              </div>
            </div>

            {/* Closure triggers (inherited city climate + tier overlay) */}
            <div className="glass-card rounded-3xl p-6 sm:p-8">
              <h2 className="text-xl sm:text-2xl font-display font-black text-white mb-3">
                {content.closureTriggers.heading}
              </h2>
              <p className="text-white/60 text-[15px] leading-relaxed mb-4">
                {content.closureTriggers.paragraph}
              </p>
              <ul className="space-y-2">
                {content.closureTriggers.bullets.map((b, i) => (
                  <li
                    key={i}
                    className="flex gap-3 text-sm text-white/55 leading-relaxed"
                  >
                    <span
                      className="shrink-0 mt-1.5 w-1.5 h-1.5 rounded-full bg-blue-400/60"
                      aria-hidden="true"
                    />
                    <span>{b}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* About + stats */}
            <div>
              <h2 className="text-xl sm:text-2xl font-display font-black text-white mb-3">
                {content.about.heading}
              </h2>
              <p className="text-white/60 text-[15px] leading-relaxed mb-5">
                {content.about.paragraph}
              </p>
              <div className="grid grid-cols-2 gap-3">
                {content.about.stats.map((s) => (
                  <div
                    key={s.label}
                    className="rounded-xl bg-white/[0.02] border border-white/5 px-4 py-3"
                  >
                    <div className="text-[10px] text-white/50 uppercase tracking-widest font-semibold mb-1">
                      {s.label}
                    </div>
                    <div className="text-sm font-display font-black text-white truncate">
                      {s.value}
                    </div>
                  </div>
                ))}
              </div>
              <a
                href={district.websiteUrl}
                target="_blank"
                rel="nofollow noopener noreferrer"
                className="mt-5 inline-flex items-center gap-2 text-sm text-blue-400 hover:text-blue-300 transition-colors"
              >
                Official district website
                <ExternalLink className="w-3.5 h-3.5" aria-hidden="true" />
              </a>
            </div>

            {/* Closing */}
            <p className="text-white/55 text-[15px] leading-relaxed italic border-l-2 border-blue-500/40 pl-5">
              {content.closing}
            </p>

            {/* Word-count footer (transparency, light styling) */}
            <p className="text-center text-[10px] text-white/50 uppercase tracking-[0.25em]">
              {district.stateName} · {content.wordCount} words of {district.name}-specific context
            </p>
          </div>
        </section>

        {/* ─── Related districts (in-state first, top-national fallback) ─── */}
        {relatedInState.length > 0 && (
          <section
            className="relative z-10 py-12 px-4"
            aria-label={
              allRelatedInState.length >= 1
                ? `Other ${district.stateName} school districts`
                : "Other large school districts"
            }
          >
            <div className="max-w-3xl mx-auto">
              <h2 className="text-xl sm:text-2xl font-display font-black text-white mb-2">
                {allRelatedInState.length >= 1
                  ? `Other ${district.stateName} districts`
                  : "Other large U.S. school districts"}
              </h2>
              <p className="text-xs text-white/50 uppercase tracking-widest mb-5">
                Snow day forecasts for related districts
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {relatedInState.map((d) => (
                  <Link
                    key={d.slug}
                    href={`/school-district/${d.slug}`}
                    className="group flex items-center justify-between rounded-2xl border border-white/5 bg-white/[0.02] px-5 py-4 hover:bg-white/[0.06] hover:border-white/10 transition-all duration-300"
                  >
                    <div className="min-w-0">
                      <div className="text-sm font-bold text-white/90 group-hover:text-white truncate">
                        {d.name}
                      </div>
                      <div className="text-[11px] text-white/50 uppercase tracking-wider mt-0.5">
                        {d.city.name} · {d.enrollment.toLocaleString("en-US")} students
                      </div>
                    </div>
                    <Building2
                      className="w-4 h-4 text-blue-400/40 group-hover:text-blue-400/70 shrink-0 ml-3"
                      aria-hidden="true"
                    />
                  </Link>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Link back to parent city + state */}
        <section aria-label="Related links" className="relative z-10 py-8 px-4 text-center">
          <div className="inline-flex flex-wrap justify-center gap-3">
            <Link
              href={`/snow-day-calculator/${city.slug}`}
              className="inline-flex items-center gap-2 text-sm text-white/60 hover:text-white px-4 py-2 rounded-full glass-card transition-colors"
            >
              <ArrowLeft className="w-4 h-4" aria-hidden="true" />
              {city.displayName} forecast
            </Link>
            <Link
              href={`/snow-day-calculator/state/${city.stateSlug}`}
              className="inline-flex items-center gap-2 text-sm text-white/60 hover:text-white px-4 py-2 rounded-full glass-card transition-colors"
            >
              All {district.stateName} districts
            </Link>
          </div>
        </section>
      </div>
    </>
  );
}

// ─── Local UI primitives ─────────────────────────────────────────────────────

function StatCard({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode | null;
  label: string;
  value: string;
}) {
  return (
    <div className="glass-card rounded-xl px-4 py-3">
      <div className="flex items-center gap-1.5 text-[10px] text-white/50 uppercase tracking-widest font-semibold mb-1">
        {icon}
        {label}
      </div>
      <div className="text-base font-display font-black text-white truncate">
        {value}
      </div>
    </div>
  );
}
