/**
 * /weather-terms/category/[category]
 *
 * Category-level glossary hub pages targeting "[category] weather terms"
 * queries (e.g., "snow weather terms", "safety weather terms"). Each page
 * lists all terms in the category with links to individual term pages.
 */

import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  Snowflake,
  BookOpen,
} from "lucide-react";
import {
  GLOSSARY_TERMS,
} from "@/lib/glossary-data";
import { breadcrumbListSchema } from "@/lib/breadcrumb-schema";
import { trimMetaTitle, trimMetaDescription } from "@/lib/seo-meta";

const SITE = "https://www.snowdaycalculate.com";

const CATEGORY_META: Record<string, { label: string; description: string }> = {
  snow: {
    label: "Snow & Ice",
    description: "Essential snow and ice terminology — from blizzards to snow squalls. Understand every winter weather term that affects school closures and road safety.",
  },
  cold: {
    label: "Cold & Temperature",
    description: "Cold weather terminology — from wind chill to flash freezes. The terms that explain why it feels colder than the thermometer says.",
  },
  "weather-science": {
    label: "Weather Science",
    description: "Meteorology fundamentals — from cold fronts to Doppler radar. The science behind weather predictions and snow day forecasts.",
  },
  storm: {
    label: "Storms",
    description: "Storm terminology — from nor'easters to thundersnow. The words that describe the most dangerous winter weather events.",
  },
  atmospheric: {
    label: "Atmospheric",
    description: "Atmospheric science terms — from barometric pressure to evaporative cooling. How the air itself creates the weather you experience.",
  },
  phenomenon: {
    label: "Phenomena",
    description: "Weather phenomena — from anvil clouds to freeze-thaw cycles. The visible and invisible processes that shape winter weather.",
  },
  safety: {
    label: "Safety & Alerts",
    description: "Weather safety terminology — from advisories to wind chill warnings. The alerts and terms that keep you safe in winter weather.",
  },
};

const ALL_CATEGORIES = Object.keys(CATEGORY_META);

interface Props {
  params: Promise<{ category: string }>;
}

export async function generateStaticParams() {
  return ALL_CATEGORIES.map((category) => ({ category }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { category } = await params;
  const meta = CATEGORY_META[category];
  if (!meta) return { title: "Category Not Found" };

  const title = trimMetaTitle(`${meta.label} — Weather Terms Glossary`, 60);
  const description = trimMetaDescription(meta.description);
  const canonical = `${SITE}/weather-terms/category/${category}`;

  return {
    title,
    description,
    keywords: [
      `${meta.label.toLowerCase()} weather terms`,
      `${meta.label.toLowerCase()} glossary`,
      "weather terminology",
      "meteorology terms",
      "winter weather definitions",
    ],
    alternates: { canonical: `/weather-terms/category/${category}` },
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

export default async function GlossaryCategoryPage({ params }: Props) {
  const { category } = await params;
  const meta = CATEGORY_META[category];
  if (!meta) notFound();

  const terms = GLOSSARY_TERMS.filter((t) => t.category === category);

  const breadcrumbSchema = breadcrumbListSchema([
    { name: "Home", path: "/" },
    { name: "Weather Glossary", path: "/weather-terms" },
    { name: meta.label, path: `/weather-terms/category/${category}` },
  ]);

  // ItemList schema
  const itemListSchema = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: `${meta.label} Weather Terms`,
    numberOfItems: terms.length,
    itemListElement: terms.map((t: { slug: string; term: string }, i: number) => ({
      "@type": "ListItem",
      position: i + 1,
      url: `${SITE}/weather-terms/${t.slug}`,
      name: t.term,
    })),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListSchema) }}
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
              <li><Link href="/weather-terms" className="hover:text-white/60 transition-colors">Glossary</Link></li>
              <li aria-hidden="true">›</li>
              <li className="text-white/60 font-medium" aria-current="page">{meta.label}</li>
            </ol>
          </nav>

          {/* Header */}
          <header className="mb-8">
            <div className="flex items-center gap-2 mb-3">
              <BookOpen className="w-5 h-5 text-blue-400" />
              <span className="text-[10px] text-blue-300/70 uppercase tracking-widest font-bold">
                Weather Glossary
              </span>
            </div>
            <h1 className="font-display text-3xl sm:text-4xl font-black tracking-tight text-white mb-3">
              {meta.label}
            </h1>
            <p className="text-base text-white/55 leading-relaxed">
              {meta.description}
            </p>
          </header>

          {/* Terms list */}
          <div className="space-y-3 mb-8">
            {terms.map((term) => (
              <Link
                key={term.slug}
                href={`/weather-terms/${term.slug}`}
                className="group block glass-card rounded-xl p-5 hover:bg-white/[0.04] transition-colors"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <h2 className="text-base font-bold text-white/80 group-hover:text-white transition-colors mb-1">
                      {term.term}
                    </h2>
                    <p className="text-sm text-white/50 leading-relaxed line-clamp-2">
                      {term.definition}
                    </p>
                  </div>
                  <Snowflake className="w-4 h-4 text-blue-400/40 group-hover:text-blue-400/70 shrink-0 mt-1" />
                </div>
              </Link>
            ))}
          </div>

          {/* Other categories */}
          <section className="mb-8">
            <h2 className="text-xs text-white/50 uppercase tracking-widest font-bold mb-4">
              Other Categories
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {ALL_CATEGORIES.filter((c) => c !== category).map((c) => {
                const cm = CATEGORY_META[c];
                return (
                  <Link
                    key={c}
                    href={`/weather-terms/category/${c}`}
                    className="group glass-card rounded-xl p-3 text-center hover:bg-white/[0.04] transition-colors"
                  >
                    <span className="text-sm font-semibold text-white/70 group-hover:text-white transition-colors">
                      {cm.label}
                    </span>
                    <div className="text-[10px] text-white/30 mt-0.5">
                      {GLOSSARY_TERMS.filter((t) => t.category === c).length} terms
                    </div>
                  </Link>
                );
              })}
            </div>
          </section>

          {/* Back to glossary */}
          <div className="text-center">
            <Link
              href="/weather-terms"
              className="inline-flex items-center gap-2 text-sm text-white/60 hover:text-white px-4 py-2 rounded-full glass-card transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Full Weather Glossary
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
