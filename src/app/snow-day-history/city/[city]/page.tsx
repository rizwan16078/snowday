/**
 * /snow-day-history/city/[city]
 *
 * City-level snow day history pages targeting "biggest snowstorm in [city]"
 * and "[city] snow day history" queries. Each page shows historical storms
 * from the NOAA Storm Events DB, city winter profile, and related links.
 */

import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  Snowflake,
  ArrowLeft,
  Calendar,
  Thermometer,
} from "lucide-react";
import {
  getCityRecord,
  getTopCitiesByPopulation,
  getNearbyCities,
  type CityRecord,
} from "@/lib/cities/helpers";
import { generateCityContent } from "@/lib/cities/content";
import { getRecentStorms, getStormDataGeneratedAt } from "@/lib/storm-events";
import { breadcrumbListSchema } from "@/lib/breadcrumb-schema";
import { trimMetaTitle, trimMetaDescription } from "@/lib/seo-meta";

const SITE = "https://www.snowdaycalculate.com";

interface Props {
  params: Promise<{ city: string }>;
}

export async function generateStaticParams() {
  return getTopCitiesByPopulation(100).map((c) => ({ city: c.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { city: rawSlug } = await params;
  const slug = rawSlug.toLowerCase();
  const record = getCityRecord(slug);
  if (!record) return { title: "City Not Found" };

  const name = record.displayName;
  const title = trimMetaTitle(`Snow Day History in ${name} — Biggest Storms`, 60);
  const description = trimMetaDescription(
    `Historic snowstorms and snow day history for ${name}, ${record.stateName}. Biggest snow events, school closure impacts, and winter weather records.`
  );
  const canonical = `${SITE}/snow-day-history/city/${slug}`;

  return {
    title,
    description,
    keywords: [
      `${name.toLowerCase()} snow day history`,
      `biggest snowstorm in ${name.toLowerCase()}`,
      `${name.toLowerCase()} winter storm history`,
      `${name.toLowerCase()} historical snowfall`,
      `${record.stateName.toLowerCase()} snow day records`,
    ],
    alternates: { canonical: `/snow-day-history/city/${slug}` },
    openGraph: {
      type: "website",
      url: canonical,
      title,
      description,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
  };
}

export default async function SnowDayHistoryCityPage({ params }: Props) {
  const { city: rawSlug } = await params;
  const slug = rawSlug.toLowerCase();
  const record = getCityRecord(slug);
  if (!record) notFound();

  const name = record.displayName;
  const stateName = record.stateName;
  const stateSlug = record.stateSlug;
  const storms = getRecentStorms(slug, 8);
  const nearby = getNearbyCities(record, 6);
  const generatedAt = getStormDataGeneratedAt();
  const cityContent = generateCityContent(record);

  const breadcrumbSchema = breadcrumbListSchema([
    { name: "Home", path: "/" },
    { name: "Snow Day History", path: "/snow-day-history" },
    { name: stateName, path: `/snow-day-history/${stateSlug}` },
    { name: name, path: `/snow-day-history/city/${slug}` },
  ]);

  // FAQ schema
  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: `What was the biggest snowstorm in ${name}?`,
        acceptedAnswer: {
          "@type": "Answer",
          text: storms.length > 0
            ? `According to NOAA Storm Events data, one of the largest recorded storms in ${name} was a ${storms[0].type} on ${storms[0].date}${storms[0].snowfallInches ? ` that dropped ${storms[0].snowfallInches}" of snow` : ""}. ${storms[0].narrative}`
            : `${name} has limited storm event data in our current dataset. Check the NOAA Storm Events Database for comprehensive historical records.`,
        },
      },
      {
        "@type": "Question",
        name: `How many snow days does ${name} get per year?`,
        acceptedAnswer: {
          "@type": "Answer",
          text: record.snowInches < 3
            ? `${name} rarely sees snow days — averaging fewer than 1 per year. When winter weather does arrive, closures tend to last multiple days.`
            : record.snowInches >= 40
            ? `Despite averaging ${record.snowInches}" of snow per year, ${name} typically uses only 3–5 snow days annually because winter infrastructure handles routine snow efficiently.`
            : `${name} averages ${record.snowInches}" of snow per year, with most districts using 3–7 snow days annually. Ice events can consume multiple snow days at once.`,
        },
      },
    ],
  };

  // Storm type badge colors
  function stormBadge(type: string): string {
    if (type.includes("Blizzard")) return "bg-red-500/20 text-red-300 border-red-500/30";
    if (type.includes("Ice")) return "bg-amber-500/20 text-amber-300 border-amber-500/30";
    if (type.includes("Heavy Snow")) return "bg-blue-500/20 text-blue-300 border-blue-500/30";
    return "bg-cyan-500/20 text-cyan-300 border-cyan-500/30";
  }

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
        <div className="relative z-10 max-w-3xl mx-auto px-4 py-16">
          {/* Breadcrumb */}
          <nav aria-label="Breadcrumb" className="mb-8">
            <ol className="inline-flex items-center gap-2 text-xs text-white/50 bg-white/5 backdrop-blur-md px-4 py-2 rounded-full border border-white/10">
              <li><Link href="/" className="hover:text-white/60 transition-colors">Home</Link></li>
              <li aria-hidden="true">›</li>
              <li><Link href="/snow-day-history" className="hover:text-white/60 transition-colors">Snow Day History</Link></li>
              <li aria-hidden="true">›</li>
              <li><Link href={`/snow-day-history/${stateSlug}`} className="hover:text-white/60 transition-colors">{stateName}</Link></li>
              <li aria-hidden="true">›</li>
              <li className="text-white/60 font-medium" aria-current="page">{name}</li>
            </ol>
          </nav>

          {/* Header */}
          <header className="mb-8">
            <div className="flex items-center gap-2 mb-3">
              <Calendar className="w-5 h-5 text-blue-400" />
              <span className="text-[10px] text-blue-300/70 uppercase tracking-widest font-bold">
                Historical Records
              </span>
            </div>
            <h1 className="font-display text-3xl sm:text-4xl font-black tracking-tight text-white mb-3">
              Snow Day History in {name}
            </h1>
            <p className="text-base text-white/55 leading-relaxed">
              {cityContent?.lede ?? `Historic snowstorms and snow day records for ${name}, ${stateName}.`}
            </p>
          </header>

          {/* City winter profile */}
          <div className="glass-card rounded-2xl p-6 mb-8">
            <h2 className="text-xs text-white/50 uppercase tracking-widest font-bold mb-4">
              {name} Winter Profile
            </h2>
            <div className="grid grid-cols-3 gap-3">
              <div className="text-center">
                <div className="text-lg font-display font-black text-white">
                  {record.snowInches}"
                </div>
                <div className="text-[10px] text-white/40 uppercase tracking-widest">Avg Snow/Year</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-display font-black text-white">
                  {storms.length}
                </div>
                <div className="text-[10px] text-white/40 uppercase tracking-widest">Storms on Record</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-display font-black text-white">
                  {record.population.toLocaleString("en-US")}
                </div>
                <div className="text-[10px] text-white/40 uppercase tracking-widest">Population</div>
              </div>
            </div>
          </div>

          {/* Historical storms */}
          {storms.length > 0 ? (
            <section className="mb-8">
              <h2 className="text-xs text-white/50 uppercase tracking-widest font-bold mb-4">
                Notable {name} Winter Storms
              </h2>
              <div className="space-y-3">
                {storms.map((storm, i) => (
                  <div key={i} className="glass-card rounded-xl p-5">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Snowflake className="w-4 h-4 text-blue-400/60" />
                        <span className="text-xs text-white/40 font-mono">{storm.date}</span>
                      </div>
                      <span className={`text-[10px] uppercase tracking-widest font-bold px-2 py-0.5 rounded-full border ${stormBadge(storm.type)}`}>
                        {storm.type}
                      </span>
                    </div>
                    {storm.snowfallInches ? (
                      <div className="text-lg font-display font-black text-white mb-2">
                        {storm.snowfallInches}" snowfall
                      </div>
                    ) : null}
                    <p className="text-sm text-white/60 leading-relaxed">
                      {storm.narrative}
                    </p>
                    {storm.duration ? (
                      <div className="mt-2 text-[11px] text-white/30">
                        Duration: {storm.duration}
                      </div>
                    ) : null}
                  </div>
                ))}
              </div>
              {generatedAt ? (
                <p className="mt-3 text-[10px] text-white/30">
                  Storm data sourced from NOAA NWS Storm Events Database. Last updated: {generatedAt.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}.
                </p>
              ) : null}
            </section>
          ) : (
            <div className="glass-card rounded-2xl p-6 mb-8 text-center">
              <Snowflake className="w-8 h-8 text-white/20 mx-auto mb-3" />
              <p className="text-sm text-white/50">
                No storm events on record for {name} in our current dataset.
                Check the <a href="https://www.ncdc.noaa.gov/stormevents/" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-300">NOAA Storm Events Database</a> for comprehensive historical records.
              </p>
            </div>
          )}

          {/* Nearby cities */}
          {nearby.length > 0 ? (
            <section className="mb-8">
              <h2 className="text-xs text-white/50 uppercase tracking-widest font-bold mb-4">
                Nearby City Storm History
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {nearby.map((nc) => (
                  <Link
                    key={nc.slug}
                    href={`/snow-day-history/city/${nc.slug}`}
                    className="group glass-card rounded-xl p-3 text-center hover:bg-white/[0.04] transition-colors"
                  >
                    <span className="text-sm font-semibold text-white/70 group-hover:text-white transition-colors">
                      {nc.displayName}
                    </span>
                    <div className="text-[10px] text-white/30 mt-0.5">
                      {nc.snowInches}"/yr
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          ) : null}

          {/* FAQ */}
          <section className="mb-8">
            <h2 className="text-xs text-white/50 uppercase tracking-widest font-bold mb-4">
              FAQ — {name} Snow Day History
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
              {name} Snow Day Calculator
            </Link>
            <Link
              href={`/school-closings/city/${slug}`}
              className="inline-flex items-center gap-2 text-sm text-white/60 hover:text-white px-4 py-2 rounded-full glass-card transition-colors"
            >
              <Thermometer className="w-4 h-4" />
              {name} School Closings
            </Link>
            <Link
              href={`/snow-day-history/${stateSlug}`}
              className="inline-flex items-center gap-2 text-sm text-white/60 hover:text-white px-4 py-2 rounded-full glass-card transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              {stateName} History
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
