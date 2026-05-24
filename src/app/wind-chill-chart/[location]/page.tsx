/**
 * /wind-chill-chart/[location]
 *
 * City-level wind chill pages targeting "wind chill [city]" and
 * "feels like temperature [city]" queries. Uses ISR with live weather
 * data to show current wind chill, frostbite risk, and cold-day thresholds.
 */

import type { Metadata } from "next";
import Link from "next/link";
import {
  Thermometer,
  Wind,
  AlertTriangle,
  ArrowLeft,
  Snowflake,
} from "lucide-react";
import { fetchWeather } from "@/lib/weather";
import {
  getCityRecord,
  getTopCitiesByPopulation,
  type CityRecord,
} from "@/lib/cities/helpers";
import { breadcrumbListSchema } from "@/lib/breadcrumb-schema";
import { trimMetaTitle, trimMetaDescription } from "@/lib/seo-meta";
import type { GeocodingResult } from "@/types/snow";

const SITE = "https://www.snowdaycalculate.com";

// NWS Wind Chill formula
function calcWindChill(tempF: number, windMph: number): number | null {
  if (tempF > 50 || windMph <= 3) return null;
  return Math.round(
    35.74 +
      0.6215 * tempF -
      35.75 * Math.pow(windMph, 0.16) +
      0.4275 * tempF * Math.pow(windMph, 0.16)
  );
}

function frostbiteTime(windChill: number | null): string {
  if (windChill === null) return "—";
  if (windChill >= 0) return "No risk";
  if (windChill >= -10) return "30 minutes";
  if (windChill >= -20) return "10 minutes";
  if (windChill >= -30) return "5 minutes";
  return "< 5 minutes";
}

function frostbiteColor(windChill: number | null): string {
  if (windChill === null) return "text-white/40";
  if (windChill >= 0) return "text-green-400";
  if (windChill >= -10) return "text-yellow-400";
  if (windChill >= -20) return "text-orange-400";
  return "text-red-400";
}

interface Props {
  params: Promise<{ location: string }>;
}

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

export async function generateStaticParams() {
  return getTopCitiesByPopulation(100).map((c) => ({ location: c.slug }));
}

export const revalidate = 1800; // 30 min ISR

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { location: rawSlug } = await params;
  const slug = rawSlug.toLowerCase();
  const record = getCityRecord(slug);
  const name = record
    ? `${record.displayName}, ${record.stateName}`
    : slug.replace(/-/g, " ");

  const title = trimMetaTitle(`Wind Chill in ${name} — Live`, 60);
  const description = trimMetaDescription(
    `Current wind chill and feels-like temperature for ${name}. Frostbite risk times and cold-day school closure thresholds — updated every 30 minutes.`
  );
  const canonical = `${SITE}/wind-chill-chart/${slug}`;

  return {
    title,
    description,
    keywords: [
      `${name.toLowerCase()} wind chill`,
      `${name.toLowerCase()} feels like temperature`,
      `${name.toLowerCase()} frostbite risk`,
      "wind chill calculator",
      "feels like temperature",
    ],
    alternates: { canonical: `/wind-chill-chart/${slug}` },
    openGraph: {
      type: "website",
      url: canonical,
      title,
      description,
    },
    twitter: {
      card: "summary",
      title,
      description,
    },
  };
}

export default async function WindChillCityPage({ params }: Props) {
  const { location: rawSlug } = await params;
  const slug = rawSlug.toLowerCase();
  const record = getCityRecord(slug);

  if (!record) {
    return (
      <main className="min-h-screen flex items-center justify-center text-center px-4">
        <div className="glass-card rounded-3xl p-10">
          <p className="text-4xl mb-4">🔍</p>
          <h2 className="text-2xl font-bold text-white mb-2">Location Not Found</h2>
          <Link href="/wind-chill-chart" className="mt-4 inline-block text-blue-400 hover:text-blue-300">
            ← Back to Wind Chill Chart
          </Link>
        </div>
      </main>
    );
  }

  const loc = recordToGeocoding(record);
  const name = `${record.displayName}, ${record.stateName}`;

  let weather;
  try {
    weather = await fetchWeather(loc.lat, loc.lon, "auto");
  } catch {
    // Offline fallback
    return (
      <main className="min-h-screen flex items-center justify-center text-center px-4">
        <div className="glass-card rounded-3xl p-10">
          <p className="text-4xl mb-4">⚠️</p>
          <h2 className="text-2xl font-bold text-white mb-2">Weather Data Unavailable</h2>
          <Link href={`/wind-chill-chart/${slug}`} className="mt-4 inline-block text-blue-400 hover:text-blue-300">
            Retry →
          </Link>
        </div>
      </main>
    );
  }

  const tempF = (weather.temperature * 9) / 5 + 32;
  const windMph = weather.windSpeedKph * 0.621371; // km/h → mph
  const windChill = calcWindChill(tempF, windMph);
  const frostbite = frostbiteTime(windChill);

  const breadcrumbSchema = breadcrumbListSchema([
    { name: "Home", path: "/" },
    { name: "Wind Chill Chart", path: "/wind-chill-chart" },
    { name: record.displayName, path: `/wind-chill-chart/${slug}` },
  ]);

  // FAQ schema
  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: `What is the wind chill in ${name}?`,
        acceptedAnswer: {
          "@type": "Answer",
          text: windChill !== null
            ? `The current wind chill in ${name} is ${windChill}°F, with an air temperature of ${tempF.toFixed(0)}°F and wind speed of ${windMph.toFixed(0)} mph.`
            : `Wind chill is not applicable in ${name} right now — the temperature is above 50°F or wind speed is below 3 mph.`,
        },
      },
      {
        "@type": "Question",
        name: `What is the frostbite risk in ${name}?`,
        acceptedAnswer: {
          "@type": "Answer",
          text: windChill !== null && windChill < 0
            ? `At the current wind chill of ${windChill}°F in ${name}, frostbite can occur in ${frostbite} of exposed skin. Cover all extremities and limit outdoor exposure.`
            : `Current conditions in ${name} do not pose a significant frostbite risk.`,
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
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />

      <div className="relative min-h-screen">
        <div className="relative z-10 max-w-2xl mx-auto px-4 py-16">
          {/* Breadcrumb */}
          <nav aria-label="Breadcrumb" className="mb-8">
            <ol className="inline-flex items-center gap-2 text-xs text-white/50 bg-white/5 backdrop-blur-md px-4 py-2 rounded-full border border-white/10">
              <li><Link href="/" className="hover:text-white/60 transition-colors">Home</Link></li>
              <li aria-hidden="true">›</li>
              <li><Link href="/wind-chill-chart" className="hover:text-white/60 transition-colors">Wind Chill Chart</Link></li>
              <li aria-hidden="true">›</li>
              <li className="text-white/60 font-medium" aria-current="page">{record.displayName}</li>
            </ol>
          </nav>

          {/* Header */}
          <header className="mb-8">
            <div className="flex items-center gap-2 mb-3">
              <Thermometer className="w-5 h-5 text-cyan-400" />
              <span className="text-[10px] text-cyan-300/70 uppercase tracking-widest font-bold">
                Live Wind Chill
              </span>
            </div>
            <h1 className="font-display text-3xl sm:text-4xl font-black tracking-tight text-white mb-3">
              Wind Chill in {name}
            </h1>
            <p className="text-sm text-white/50">
              Updated every 30 minutes with live NWS data
            </p>
          </header>

          {/* Current conditions */}
          <div className="glass-card rounded-2xl p-6 mb-6">
            <div className="grid grid-cols-3 gap-4 mb-6">
              <div className="text-center">
                <div className="text-[10px] text-white/40 uppercase tracking-widest mb-1">Temperature</div>
                <div className="text-2xl font-display font-black text-white">
                  {tempF.toFixed(0)}°F
                </div>
              </div>
              <div className="text-center">
                <div className="text-[10px] text-white/40 uppercase tracking-widest mb-1">Wind Speed</div>
                <div className="text-2xl font-display font-black text-white">
                  {windMph.toFixed(0)} mph
                </div>
              </div>
              <div className="text-center">
                <div className="text-[10px] text-white/40 uppercase tracking-widest mb-1">Wind Chill</div>
                <div className={`text-2xl font-display font-black ${frostbiteColor(windChill)}`}>
                  {windChill !== null ? `${windChill}°F` : "N/A"}
                </div>
              </div>
            </div>

            {/* Frostbite risk */}
            <div className="border-t border-white/10 pt-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <AlertTriangle className={`w-4 h-4 ${frostbiteColor(windChill)}`} />
                  <span className="text-xs text-white/50 uppercase tracking-widest font-bold">
                    Frostbite Risk
                  </span>
                </div>
                <span className={`text-sm font-semibold ${frostbiteColor(windChill)}`}>
                  {frostbite}
                </span>
              </div>
            </div>
          </div>

          {/* Cold-day school closure thresholds */}
          <div className="glass-card rounded-2xl p-6 mb-6">
            <h2 className="text-xs text-white/50 uppercase tracking-widest font-bold mb-4">
              Cold-Day School Closures
            </h2>
            <div className="space-y-3 text-sm text-white/70 leading-relaxed">
              <p>
                Schools in {record.stateName} typically close for cold alone when wind chills
                drop below dangerous thresholds. The exact threshold varies by district —
                urban districts with walking students tend to close at warmer wind chills than
                rural districts where all students ride buses.
              </p>
              <div className="grid grid-cols-2 gap-3 mt-4">
                <div className="glass-card rounded-xl p-3 text-center">
                  <div className="text-lg font-display font-black text-amber-400">-20°F</div>
                  <div className="text-[10px] text-white/40 uppercase tracking-widest">Common threshold</div>
                </div>
                <div className="glass-card rounded-xl p-3 text-center">
                  <div className="text-lg font-display font-black text-red-400">-30°F</div>
                  <div className="text-[10px] text-white/40 uppercase tracking-widest">Northern states</div>
                </div>
              </div>
            </div>
          </div>

          {/* FAQ */}
          <section className="mb-8">
            <h2 className="text-xs text-white/50 uppercase tracking-widest font-bold mb-4">
              FAQ — Wind Chill in {name}
            </h2>
            <div className="glass-card rounded-2xl p-6 space-y-4">
              {faqSchema.mainEntity.map((q: { name: string; acceptedAnswer: { text: string } }, i: number) => (
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
          </section>

          {/* Related links */}
          <div className="flex flex-wrap gap-3">
            <Link
              href={`/snow-day-calculator/${slug}`}
              className="inline-flex items-center gap-2 text-sm text-white/60 hover:text-white px-4 py-2 rounded-full glass-card transition-colors"
            >
              <Snowflake className="w-4 h-4" />
              {record.displayName} Snow Day Calculator
            </Link>
            <Link
              href="/wind-chill-chart"
              className="inline-flex items-center gap-2 text-sm text-white/60 hover:text-white px-4 py-2 rounded-full glass-card transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Full Wind Chill Chart
            </Link>
            <Link
              href="/weather-terms/wind-chill"
              className="inline-flex items-center gap-2 text-sm text-white/60 hover:text-white px-4 py-2 rounded-full glass-card transition-colors"
            >
              <Wind className="w-4 h-4" />
              Wind Chill Definition
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
