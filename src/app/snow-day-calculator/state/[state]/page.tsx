/**
 * /snow-day-calculator/state/[state]
 *
 * 50 statically-generated state hub pages — one per US state. Each lists all
 * catalog cities in that state, with a state-level editorial intro. Targets
 * "[state] snow day" / "[state] school closures" long-tail queries.
 */

import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { MapPin, Snowflake, ArrowLeft } from "lucide-react";
import { getAllStateSlugs } from "@/lib/cities/helpers";
import { generateStateContent } from "@/lib/cities/state-content";
import { breadcrumbListSchema } from "@/lib/breadcrumb-schema";

interface Props {
  params: Promise<{ state: string }>;
}

/**
 * Statically pre-render every state hub at build time. There are only ~50 and
 * the generator is pure — no external API calls. Full SSG (no ISR).
 */
export async function generateStaticParams() {
  return getAllStateSlugs().map((state) => ({ state }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { state: rawSlug } = await params;
  const slug = rawSlug.toLowerCase();
  const content = generateStateContent(slug);
  if (!content) {
    return { title: "State Not Found" };
  }
  const canonical = `https://www.snowdaycalculate.com/snow-day-calculator/state/${slug}`;
  return {
    title: `${content.stateName} Snow Day Calculator — ${content.stats.cityCount} Cities`,
    description: content.metaDescription,
    alternates: { canonical: `/snow-day-calculator/state/${slug}` },
    openGraph: {
      type: "website",
      url: canonical,
      title: `${content.stateName} Snow Day Calculator`,
      description: content.metaDescription,
      images: [
        {
          url: `/api/og?loc=${encodeURIComponent(content.stateName)}`,
          width: 1200,
          height: 630,
          alt: `${content.stateName} Snow Day Calculator — SnowSense™`,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: `${content.stateName} Snow Day Calculator`,
      description: content.metaDescription,
    },
  };
}

export default async function StateHubPage({ params }: Props) {
  const { state: rawSlug } = await params;
  const slug = rawSlug.toLowerCase();
  const content = generateStateContent(slug);
  if (!content) notFound();

  const breadcrumbSchema = breadcrumbListSchema([
    { name: "Home", path: "/" },
    { name: "Snow Day Calculator", path: "/snow-day-calculator" },
    { name: content.stateName, path: `/snow-day-calculator/state/${slug}` },
  ]);

  // ItemList schema — tells Google the list of cities on this page is
  // an ordered collection of related pages. Boosts sitelinks likelihood.
  const itemListSchema = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: `${content.stateName} cities`,
    numberOfItems: content.cities.length,
    itemListElement: content.cities.map((c, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: c.displayName,
      url: `https://www.snowdaycalculate.com/snow-day-calculator/${c.slug}`,
    })),
  };

  const highest = content.stats.highestSnowfallCity;

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListSchema) }}
      />
      <main className="min-h-screen px-4 py-16 max-w-5xl mx-auto" role="main">
        {/* Breadcrumb pill */}
        <nav aria-label="Breadcrumb" className="mb-8">
          <ol className="inline-flex items-center gap-2 text-xs text-white/40 bg-white/5 backdrop-blur-md px-4 py-2 rounded-full border border-white/10">
            <li>
              <Link href="/" className="hover:text-white/70 transition-colors">
                Home
              </Link>
            </li>
            <li aria-hidden="true">›</li>
            <li>
              <Link
                href="/snow-day-calculator"
                className="hover:text-white/70 transition-colors"
              >
                Calculator
              </Link>
            </li>
            <li aria-hidden="true">›</li>
            <li className="text-white/70 font-medium" aria-current="page">
              {content.stateName}
            </li>
          </ol>
        </nav>

        {/* Hero */}
        <header className="mb-10">
          <p className="text-[10px] text-blue-400/70 uppercase tracking-[0.3em] font-bold mb-3">
            Snow Day Hub
          </p>
          <h1 className="font-display text-3xl sm:text-4xl md:text-5xl font-black tracking-tight text-white mb-4">
            {content.h1}
          </h1>
          <p className="text-white/55 text-base sm:text-lg max-w-2xl leading-relaxed">
            {content.lede}
          </p>

          {/* Stat strip */}
          <div className="mt-8 grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-2xl">
            <Stat
              label="Cities covered"
              value={content.stats.cityCount.toString()}
            />
            <Stat
              label="Avg snowfall"
              value={`${content.avgSnowfall.toFixed(0)}"`}
            />
            <Stat
              label="Population"
              value={formatPop(content.stats.totalPopulation)}
            />
            {highest && (
              <Stat
                label={`Snowiest`}
                value={`${highest.name} (${highest.snowInches}")`}
              />
            )}
          </div>
        </header>

        {/* Editorial paragraphs */}
        <section className="prose prose-invert max-w-none mb-12 space-y-4">
          {content.paragraphs.map((p, i) => (
            <p key={i} className="text-white/60 leading-relaxed text-[15px]">
              {p}
            </p>
          ))}
        </section>

        {/* City grid */}
        <section aria-labelledby="cities-heading" className="mb-16">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center">
              <MapPin
                className="w-5 h-5 text-indigo-400"
                aria-hidden="true"
              />
            </div>
            <h2
              id="cities-heading"
              className="text-xl sm:text-2xl font-display font-black text-white"
            >
              All {content.stateName} cities
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {content.cities.map((c) => (
              <Link
                key={c.slug}
                href={`/snow-day-calculator/${c.slug}`}
                className="group flex items-center justify-between rounded-2xl border border-white/5 bg-white/[0.02] px-4 py-3.5 hover:bg-white/[0.06] hover:border-white/10 transition-all duration-300"
              >
                <div className="min-w-0">
                  <div className="text-sm font-bold text-white/90 group-hover:text-white transition-colors truncate">
                    {c.name}
                  </div>
                  <div className="text-[11px] text-white/40 uppercase tracking-wider mt-0.5">
                    Pop {formatPop(c.population)} · {c.snowInches}" snow/yr
                  </div>
                </div>
                <Snowflake
                  className="w-4 h-4 text-blue-400/40 group-hover:text-blue-400/70 transition-colors shrink-0 ml-3"
                  aria-hidden="true"
                />
              </Link>
            ))}
          </div>
        </section>

        {/* Back link */}
        <div className="text-center">
          <Link
            href="/snow-day-calculator"
            className="inline-flex items-center gap-2 text-sm text-white/50 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" aria-hidden="true" />
            All states
          </Link>
        </div>
      </main>
    </>
  );
}

// ─── UI helpers ─────────────────────────────────────────────────────────────

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="glass-card rounded-xl px-4 py-3">
      <div className="text-[10px] text-white/40 uppercase tracking-widest font-semibold mb-1">
        {label}
      </div>
      <div className="text-base font-display font-black text-white">
        {value}
      </div>
    </div>
  );
}

function formatPop(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${Math.round(n / 1_000)}K`;
  return n.toString();
}
