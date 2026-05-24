/**
 * /school-closings/[state]
 *
 * 50 state-level school closings pages targeting "school closings [state]"
 * and "is school closed in [state]" query clusters. Each page lists cities
 * and districts in the state with live snow day probability links.
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
  getAllStateSlugs,
  getCitiesInState,
} from "@/lib/cities/helpers";
import { getDistrictsInState } from "@/lib/districts/helpers";
import { generateStateContent } from "@/lib/cities/state-content";
import { breadcrumbListSchema } from "@/lib/breadcrumb-schema";
import { trimMetaTitle, trimMetaDescription } from "@/lib/seo-meta";

const SITE = "https://www.snowdaycalculate.com";

interface Props {
  params: Promise<{ state: string }>;
}

export async function generateStaticParams() {
  return getAllStateSlugs().map((state) => ({ state }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { state: rawSlug } = await params;
  const slug = rawSlug.toLowerCase();
  const stateContent = generateStateContent(slug);
  if (!stateContent) return { title: "State Not Found" };

  const stateName = stateContent.stateName;
  const title = trimMetaTitle(`School Closings in ${stateName} — Live Updates`, 60);
  const description = trimMetaDescription(
    `Check school closings and delays in ${stateName}. Live snow day probability for ${stateContent.stats.cityCount} ${stateName} cities, updated every 30 minutes.`
  );
  const canonical = `${SITE}/school-closings/${slug}`;

  return {
    title,
    description,
    keywords: [
      `${stateName.toLowerCase()} school closings`,
      `${stateName.toLowerCase()} school delays`,
      `is school closed in ${stateName.toLowerCase()}`,
      `${stateName.toLowerCase()} snow day`,
      `${stateName.toLowerCase()} school closures`,
      "school closing alerts",
    ],
    alternates: { canonical: `/school-closings/${slug}` },
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

export default async function SchoolClosingsStatePage({ params }: Props) {
  const { state: rawSlug } = await params;
  const slug = rawSlug.toLowerCase();
  const stateContent = generateStateContent(slug);
  if (!stateContent) notFound();

  const stateName = stateContent.stateName;
  const cities = getCitiesInState(slug);
  const districts = getDistrictsInState(stateContent.stateCode);

  const breadcrumbSchema = breadcrumbListSchema([
    { name: "Home", path: "/" },
    { name: "School Closings", path: "/school-closings" },
    { name: stateName, path: `/school-closings/${slug}` },
  ]);

  // FAQ schema for rich results
  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: `How do I check if school is closed in ${stateName}?`,
        acceptedAnswer: {
          "@type": "Answer",
          text: `Check SnowSense™ for live snow day probability in ${stateName}. Our model updates every 30 minutes using NWS forecast data and ${stateName}-calibrated closure thresholds. You can also monitor your district's automated notification system and local news stations.`,
        },
      },
      {
        "@type": "Question",
        name: `What temperature closes schools in ${stateName}?`,
        acceptedAnswer: {
          "@type": "Answer",
          text: stateContent.avgSnowfall < 3
            ? `${stateName} rarely closes for cold alone. When extreme cold does arrive, districts typically close when wind chill drops below -20°F or when ice makes roads impassable. Check your specific district's policy.`
            : stateContent.avgSnowfall >= 40
            ? `In ${stateName}, cold-day closures typically require wind chills below -30°F. Snow accumulation alone rarely closes schools here — districts are winter-hardened with plow fleets and cold-weather protocols.`
            : `${stateName} districts vary: northern areas may stay open until wind chills hit -25°F, while southern areas close at -10°F. Ice events close schools faster than snow in ${stateName}.`,
        },
      },
      {
        "@type": "Question",
        name: `How many snow days does ${stateName} typically get?`,
        acceptedAnswer: {
          "@type": "Answer",
          text: stateContent.avgSnowfall < 3
            ? `${stateName} averages fewer than 1 snow day per year. Winter weather events are rare enough that most closures are multi-day events when they do happen.`
            : stateContent.avgSnowfall >= 40
            ? `Despite heavy snowfall averaging ${stateContent.avgSnowfall.toFixed(0)} inches per year, ${stateName} districts typically use only 3–5 snow days per year because infrastructure handles routine snow efficiently.`
            : `${stateName} averages ${stateContent.avgSnowfall.toFixed(0)} inches of snow per year, with most districts using 3–7 snow days annually. Ice events can consume multiple days at once.`,
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
              <li className="text-white/60 font-medium" aria-current="page">{stateName}</li>
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
              School Closings in {stateName}
            </h1>
            <p className="text-base text-white/55 leading-relaxed">
              {stateContent.lede}
            </p>
          </header>

          {/* State editorial */}
          <div className="glass-card rounded-2xl p-6 mb-8">
            <h2 className="text-xs text-white/50 uppercase tracking-widest font-bold mb-4">
              About {stateName} Winter Weather
            </h2>
            <div className="space-y-4 text-sm text-white/70 leading-relaxed">
              {stateContent.paragraphs.map((p, i) => (
                <p key={i}>{p}</p>
              ))}
            </div>
            <div className="mt-4 grid grid-cols-3 gap-3">
              <div className="text-center">
                <div className="text-lg font-display font-black text-white">
                  {stateContent.stats.cityCount}
                </div>
                <div className="text-[10px] text-white/40 uppercase tracking-widest">Cities</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-display font-black text-white">
                  {stateContent.avgSnowfall.toFixed(0)}"
                </div>
                <div className="text-[10px] text-white/40 uppercase tracking-widest">Avg Snow</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-display font-black text-white">
                  {districts.length}
                </div>
                <div className="text-[10px] text-white/40 uppercase tracking-widest">Districts</div>
              </div>
            </div>
          </div>

          {/* Cities with snow day probability */}
          {cities.length > 0 ? (
            <section className="mb-8">
              <h2 className="text-xs text-white/50 uppercase tracking-widest font-bold mb-4">
                {stateName} Cities — Snow Day Probability
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {cities.map((city) => (
                  <Link
                    key={city.slug}
                    href={`/snow-day-calculator/${city.slug}`}
                    className="group flex items-center justify-between glass-card rounded-xl p-4 hover:bg-white/[0.04] transition-colors"
                  >
                    <div className="min-w-0">
                      <div className="text-sm font-semibold text-white/80 group-hover:text-white transition-colors truncate">
                        {city.displayName}
                      </div>
                      <div className="text-[11px] text-white/40 mt-0.5">
                        {city.snowInches}" avg snow · {city.population.toLocaleString("en-US")} pop
                      </div>
                    </div>
                    <MapPin className="w-4 h-4 text-blue-400/40 group-hover:text-blue-400/70 shrink-0 ml-2" />
                  </Link>
                ))}
              </div>
            </section>
          ) : null}

          {/* Districts */}
          {districts.length > 0 ? (
            <section className="mb-8">
              <h2 className="text-xs text-white/50 uppercase tracking-widest font-bold mb-4">
                {stateName} School Districts
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
                        {d.city.displayName} · {d.enrollment.toLocaleString("en-US")} students
                      </div>
                    </div>
                    <Building2 className="w-4 h-4 text-blue-400/40 group-hover:text-blue-400/70 shrink-0 ml-2" />
                  </Link>
                ))}
              </div>
            </section>
          ) : null}

          {/* FAQ */}
          <section className="mb-8">
            <h2 className="text-xs text-white/50 uppercase tracking-widest font-bold mb-4">
              FAQ — {stateName} School Closings
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
          <div className="flex flex-wrap gap-3 mb-8">
            <Link
              href={`/snow-day-calculator/state/${slug}`}
              className="inline-flex items-center gap-2 text-sm text-white/60 hover:text-white px-4 py-2 rounded-full glass-card transition-colors"
            >
              <Snowflake className="w-4 h-4" />
              {stateName} Snow Day Calculator
            </Link>
            <Link
              href="/school-closings"
              className="inline-flex items-center gap-2 text-sm text-white/60 hover:text-white px-4 py-2 rounded-full glass-card transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              All States
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
