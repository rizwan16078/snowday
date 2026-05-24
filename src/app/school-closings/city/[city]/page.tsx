/**
 * /school-closings/city/[city]
 *
 * City-level school closings pages targeting "is school closed in [city]"
 * and "school closings [city]" query clusters. Each page shows live snow
 * day probability, districts in the city, and nearby city closings.
 */

import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  Building2,
  MapPin,
  Snowflake,
  ArrowLeft,
  AlertCircle,
} from "lucide-react";
import {
  getCityRecord,
  getTopCitiesByPopulation,
  getNearbyCities,
  type CityRecord,
} from "@/lib/cities/helpers";
import { getDistrictsForCity } from "@/lib/districts/helpers";
import { generateCityContent } from "@/lib/cities/content";
import { breadcrumbListSchema } from "@/lib/breadcrumb-schema";
import { trimMetaTitle, trimMetaDescription } from "@/lib/seo-meta";

const SITE = "https://www.snowdaycalculate.com";

interface Props {
  params: Promise<{ city: string }>;
}

export async function generateStaticParams() {
  return getTopCitiesByPopulation(100).map((c) => ({ city: c.slug }));
}

export const revalidate = 1800; // 30 min ISR

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { city: rawSlug } = await params;
  const slug = rawSlug.toLowerCase();
  const record = getCityRecord(slug);
  if (!record) return { title: "City Not Found" };

  const name = record.displayName;
  const title = trimMetaTitle(`School Closings in ${name} — Live Updates`, 60);
  const description = trimMetaDescription(
    `Check school closings and delays in ${name}. Live snow day probability, district closures, and cold-day alerts — updated every 30 minutes.`
  );
  const canonical = `${SITE}/school-closings/city/${slug}`;

  return {
    title,
    description,
    keywords: [
      `${name.toLowerCase()} school closings`,
      `is school closed in ${name.toLowerCase()}`,
      `${name.toLowerCase()} school delays`,
      `${name.toLowerCase()} snow day`,
      `${record.stateName.toLowerCase()} school closures`,
      "school closing alerts",
    ],
    alternates: { canonical: `/school-closings/city/${slug}` },
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

export default async function SchoolClosingsCityPage({ params }: Props) {
  const { city: rawSlug } = await params;
  const slug = rawSlug.toLowerCase();
  const record = getCityRecord(slug);
  if (!record) notFound();

  const name = record.displayName;
  const stateName = record.stateName;
  const stateSlug = record.stateSlug;
  const districts = getDistrictsForCity(slug);
  const nearby = getNearbyCities(record, 6);
  const cityContent = generateCityContent(record);

  const breadcrumbSchema = breadcrumbListSchema([
    { name: "Home", path: "/" },
    { name: "School Closings", path: "/school-closings" },
    { name: stateName, path: `/school-closings/${stateSlug}` },
    { name: name, path: `/school-closings/city/${slug}` },
  ]);

  // FAQ schema
  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: `Is school closed in ${name}?`,
        acceptedAnswer: {
          "@type": "Answer",
          text: `Check SnowSense™ for live snow day probability in ${name}. Our model updates every 30 minutes using NWS forecast data and ${stateName}-calibrated closure thresholds. You can also monitor your district's automated notification system and local news stations.`,
        },
      },
      {
        "@type": "Question",
        name: `What temperature closes schools in ${name}?`,
        acceptedAnswer: {
          "@type": "Answer",
          text: record.snowInches < 3
            ? `${name} rarely closes for cold alone. When extreme cold does arrive, districts typically close when wind chill drops below -20°F or when ice makes roads impassable.`
            : record.snowInches >= 40
            ? `In ${name}, cold-day closures typically require wind chills below -30°F. Snow accumulation alone rarely closes schools here — districts are winter-hardened.`
            : `${name} districts vary: some close at wind chills of -20°F, others wait until -25°F. Ice events close schools faster than snow in ${name}.`,
        },
      },
      {
        "@type": "Question",
        name: `How many snow days does ${name} get?`,
        acceptedAnswer: {
          "@type": "Answer",
          text: record.snowInches < 3
            ? `${name} averages fewer than 1 snow day per year. Winter weather events are rare enough that most closures are multi-day events when they do happen.`
            : record.snowInches >= 40
            ? `Despite heavy snowfall averaging ${record.snowInches}" per year, ${name} typically uses only 3–5 snow days per year because infrastructure handles routine snow efficiently.`
            : `${name} averages ${record.snowInches}" of snow per year, with most districts using 3–7 snow days annually. Ice events can consume multiple days at once.`,
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
        <div className="relative z-10 max-w-3xl mx-auto px-4 py-16">
          {/* Breadcrumb */}
          <nav aria-label="Breadcrumb" className="mb-8">
            <ol className="inline-flex items-center gap-2 text-xs text-white/50 bg-white/5 backdrop-blur-md px-4 py-2 rounded-full border border-white/10">
              <li><Link href="/" className="hover:text-white/60 transition-colors">Home</Link></li>
              <li aria-hidden="true">›</li>
              <li><Link href="/school-closings" className="hover:text-white/60 transition-colors">School Closings</Link></li>
              <li aria-hidden="true">›</li>
              <li><Link href={`/school-closings/${stateSlug}`} className="hover:text-white/60 transition-colors">{stateName}</Link></li>
              <li aria-hidden="true">›</li>
              <li className="text-white/60 font-medium" aria-current="page">{name}</li>
            </ol>
          </nav>

          {/* Header */}
          <header className="mb-8">
            <div className="flex items-center gap-2 mb-3">
              <AlertCircle className="w-5 h-5 text-amber-400" />
              <span className="text-[10px] text-amber-300/70 uppercase tracking-widest font-bold">
                Live Updates
              </span>
            </div>
            <h1 className="font-display text-3xl sm:text-4xl font-black tracking-tight text-white mb-3">
              School Closings in {name}
            </h1>
            <p className="text-base text-white/55 leading-relaxed">
              {cityContent?.metaDescription ?? `Live snow day probability and school closure alerts for ${name}, ${stateName}. Updated every 30 minutes.`}
            </p>
          </header>

          {/* Snow day probability CTA */}
          <div className="glass-card rounded-2xl p-6 mb-8 border border-blue-400/20 bg-gradient-to-br from-blue-500/[0.08] via-transparent to-cyan-500/[0.04]">
            <div className="flex items-center justify-between gap-4">
              <div>
                <h2 className="text-sm font-bold text-white mb-1">
                  Today&apos;s Snow Day Probability
                </h2>
                <p className="text-xs text-white/50">
                  Live forecast for {name} — updated every 30 minutes
                </p>
              </div>
              <Link
                href={`/snow-day-calculator/${slug}`}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full font-bold text-sm text-white shrink-0"
                style={{
                  background: "linear-gradient(135deg,#1d4ed8,#3b82f6)",
                  boxShadow: "0 4px 16px rgba(59,130,246,0.3)",
                }}
              >
                <Snowflake className="w-4 h-4" />
                Check Now
              </Link>
            </div>
          </div>

          {/* City winter context */}
          {cityContent ? (
            <div className="glass-card rounded-2xl p-6 mb-8">
              <h2 className="text-xs text-white/50 uppercase tracking-widest font-bold mb-4">
                Winter Weather in {name}
              </h2>
              <div className="space-y-3 text-sm text-white/70 leading-relaxed">
                <p>{cityContent.lede}</p>
              </div>
              <div className="mt-4 grid grid-cols-3 gap-3">
                <div className="text-center">
                  <div className="text-lg font-display font-black text-white">
                    {record.snowInches}"
                  </div>
                  <div className="text-[10px] text-white/40 uppercase tracking-widest">Avg Snow</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-display font-black text-white">
                    {districts.length}
                  </div>
                  <div className="text-[10px] text-white/40 uppercase tracking-widest">Districts</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-display font-black text-white">
                    {record.population.toLocaleString("en-US")}
                  </div>
                  <div className="text-[10px] text-white/40 uppercase tracking-widest">Population</div>
                </div>
              </div>
            </div>
          ) : null}

          {/* Districts in this city */}
          {districts.length > 0 ? (
            <section className="mb-8">
              <h2 className="text-xs text-white/50 uppercase tracking-widest font-bold mb-4">
                {name} School Districts
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {districts.map((d) => (
                  <Link
                    key={d.slug}
                    href={`/school-district/${d.slug}`}
                    className="group flex items-center justify-between glass-card rounded-xl p-4 hover:bg-white/[0.04] transition-colors"
                  >
                    <div className="min-w-0">
                      <div className="text-sm font-semibold text-white/80 group-hover:text-white transition-colors truncate">
                        {d.name}
                      </div>
                      <div className="text-[11px] text-white/40 mt-0.5">
                        {d.enrollment.toLocaleString("en-US")} students
                      </div>
                    </div>
                    <Building2 className="w-4 h-4 text-blue-400/40 group-hover:text-blue-400/70 shrink-0 ml-2" />
                  </Link>
                ))}
              </div>
            </section>
          ) : null}

          {/* Nearby cities */}
          {nearby.length > 0 ? (
            <section className="mb-8">
              <h2 className="text-xs text-white/50 uppercase tracking-widest font-bold mb-4">
                Nearby City Closings
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {nearby.map((nc) => (
                  <Link
                    key={nc.slug}
                    href={`/school-closings/city/${nc.slug}`}
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
              FAQ — School Closings in {name}
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
              href={`/wind-chill-chart/${slug}`}
              className="inline-flex items-center gap-2 text-sm text-white/60 hover:text-white px-4 py-2 rounded-full glass-card transition-colors"
            >
              <MapPin className="w-4 h-4" />
              {name} Wind Chill
            </Link>
            <Link
              href={`/school-closings/${stateSlug}`}
              className="inline-flex items-center gap-2 text-sm text-white/60 hover:text-white px-4 py-2 rounded-full glass-card transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              {stateName} Closings
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
