/**
 * /wind-chill-chart/[state]
 *
 * State-level wind chill hub pages targeting "wind chill [state]" and
 * "[state] wind chill chart" queries. Each page lists cities in the state
 * with wind chill data and cold-day closure thresholds.
 */

import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  Thermometer,
  ArrowLeft,
  Snowflake,
} from "lucide-react";
import {
  getAllStateSlugs,
  getCitiesInState,
  STATE_NAMES,
} from "@/lib/cities/helpers";
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
  const title = trimMetaTitle(`Wind Chill in ${stateName} — City Charts`, 60);
  const description = trimMetaDescription(
    `Wind chill charts and feels-like temperatures for ${stateContent.stats.cityCount} ${stateName} cities. Frostbite risk times and cold-day school closure thresholds — updated live.`
  );
  const canonical = `${SITE}/wind-chill-chart/${slug}`;

  return {
    title,
    description,
    keywords: [
      `${stateName.toLowerCase()} wind chill`,
      `${stateName.toLowerCase()} feels like temperature`,
      `${stateName.toLowerCase()} frostbite risk`,
      `${stateName.toLowerCase()} wind chill chart`,
      "cold day school closures",
    ],
    alternates: { canonical: `/wind-chill-chart/${slug}` },
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

export default async function WindChillStatePage({ params }: Props) {
  const { state: rawSlug } = await params;
  const slug = rawSlug.toLowerCase();
  const stateContent = generateStateContent(slug);
  if (!stateContent) notFound();

  const stateName = stateContent.stateName;
  const cities = getCitiesInState(slug);

  const breadcrumbSchema = breadcrumbListSchema([
    { name: "Home", path: "/" },
    { name: "Wind Chill Chart", path: "/wind-chill-chart" },
    { name: stateName, path: `/wind-chill-chart/${slug}` },
  ]);

  return (
    <>
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
              <li><Link href="/wind-chill-chart" className="hover:text-white/60 transition-colors">Wind Chill Chart</Link></li>
              <li aria-hidden="true">›</li>
              <li className="text-white/60 font-medium" aria-current="page">{stateName}</li>
            </ol>
          </nav>

          {/* Header */}
          <header className="mb-8">
            <div className="flex items-center gap-2 mb-3">
              <Thermometer className="w-5 h-5 text-cyan-400" />
              <span className="text-[10px] text-cyan-300/70 uppercase tracking-widest font-bold">
                State Wind Chill Hub
              </span>
            </div>
            <h1 className="font-display text-3xl sm:text-4xl font-black tracking-tight text-white mb-3">
              Wind Chill in {stateName}
            </h1>
            <p className="text-base text-white/55 leading-relaxed">
              {stateContent.lede}
            </p>
          </header>

          {/* State winter profile */}
          <div className="glass-card rounded-2xl p-6 mb-8">
            <h2 className="text-xs text-white/50 uppercase tracking-widest font-bold mb-4">
              {stateName} Winter Profile
            </h2>
            <div className="space-y-4 text-sm text-white/70 leading-relaxed">
              {stateContent.paragraphs.map((p, i) => (
                <p key={i}>{p}</p>
              ))}
            </div>
            <div className="mt-4 grid grid-cols-3 gap-3">
              <div className="text-center">
                <div className="text-lg font-display font-black text-white">
                  {stateContent.avgSnowfall.toFixed(0)}"
                </div>
                <div className="text-[10px] text-white/40 uppercase tracking-widest">Avg Snow/Year</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-display font-black text-white">
                  {stateContent.stats.cityCount}
                </div>
                <div className="text-[10px] text-white/40 uppercase tracking-widest">Cities</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-display font-black text-white">
                  {stateContent.avgSnowfall < 3 ? "Rare" : stateContent.avgSnowfall >= 40 ? "Common" : "Moderate"}
                </div>
                <div className="text-[10px] text-white/40 uppercase tracking-widest">Cold-Day Risk</div>
              </div>
            </div>
          </div>

          {/* Cold-day thresholds */}
          <div className="glass-card rounded-2xl p-6 mb-8">
            <h2 className="text-xs text-white/50 uppercase tracking-widest font-bold mb-4">
              Cold-Day School Closures in {stateName}
            </h2>
            <div className="space-y-3 text-sm text-white/70 leading-relaxed">
              <p>
                Schools in {stateName} typically close for cold alone when wind chills
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

          {/* Cities with wind chill data */}
          {cities.length > 0 ? (
            <section className="mb-8">
              <h2 className="text-xs text-white/50 uppercase tracking-widest font-bold mb-4">
                {stateName} Cities — Live Wind Chill
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {cities.map((city) => (
                  <Link
                    key={city.slug}
                    href={`/wind-chill-chart/${city.slug}`}
                    className="group glass-card rounded-xl p-3 text-center hover:bg-white/[0.04] transition-colors"
                  >
                    <span className="text-sm font-semibold text-white/70 group-hover:text-white transition-colors">
                      {city.displayName}
                    </span>
                    <div className="text-[10px] text-white/30 mt-0.5">
                      {city.snowInches}"/yr
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          ) : null}

          {/* Related links */}
          <div className="flex flex-wrap gap-3">
            <Link
              href={`/snow-day-calculator/state/${slug}`}
              className="inline-flex items-center gap-2 text-sm text-white/60 hover:text-white px-4 py-2 rounded-full glass-card transition-colors"
            >
              <Snowflake className="w-4 h-4" />
              {stateName} Snow Day Calculator
            </Link>
            <Link
              href="/wind-chill-chart"
              className="inline-flex items-center gap-2 text-sm text-white/60 hover:text-white px-4 py-2 rounded-full glass-card transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Full Wind Chill Chart
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
