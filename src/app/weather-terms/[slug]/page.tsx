/**
 * /weather-terms/[slug]
 *
 * Individual glossary term pages — 59 SSG pages targeting definition-style
 * featured snippets (e.g., "what is wind chill", "blizzard definition").
 * Each page includes DefinedTerm schema, breadcrumb, and cross-links to
 * related blog posts and nearby terms.
 */

import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, BookOpen, Snowflake } from "lucide-react";
import {
  GLOSSARY_TERMS,
} from "@/lib/glossary-data";
import { breadcrumbListSchema } from "@/lib/breadcrumb-schema";
import { trimMetaTitle, trimMetaDescription } from "@/lib/seo-meta";
import { blogPosts } from "@/lib/blog-data";

const SITE = "https://www.snowdaycalculate.com";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return GLOSSARY_TERMS.map((t) => ({ slug: t.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const term = GLOSSARY_TERMS.find((t) => t.slug === slug);
  if (!term) return { title: "Term Not Found" };

  const title = trimMetaTitle(`${term.term} — Weather Definition`, 60);
  const description = trimMetaDescription(term.definition, 155);
  const canonical = `${SITE}/weather-terms/${slug}`;

  return {
    title,
    description,
    keywords: [
      term.term.toLowerCase(),
      `${term.term.toLowerCase()} definition`,
      `${term.term.toLowerCase()} weather`,
      "weather glossary",
      "meteorology term",
    ],
    alternates: { canonical: `/weather-terms/${slug}` },
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

export default async function GlossaryTermPage({ params }: Props) {
  const { slug } = await params;
  const term = GLOSSARY_TERMS.find((t) => t.slug === slug);
  if (!term) notFound();

  // Find related blog post
  const relatedPost = term.relatedBlog
    ? blogPosts.find((p) => p.slug === term.relatedBlog)
    : null;

  // Find nearby terms (same category, up to 4)
  const relatedTerms = GLOSSARY_TERMS.filter(
    (t) => t.category === term.category && t.slug !== term.slug
  ).slice(0, 4);

  // Find previous/next terms alphabetically
  const idx = GLOSSARY_TERMS.findIndex((t) => t.slug === slug);
  const prevTerm = idx > 0 ? GLOSSARY_TERMS[idx - 1] : null;
  const nextTerm = idx < GLOSSARY_TERMS.length - 1 ? GLOSSARY_TERMS[idx + 1] : null;

  // DefinedTerm schema for featured snippet eligibility
  const definedTermSchema = {
    "@context": "https://schema.org",
    "@type": "DefinedTerm",
    name: term.term,
    description: term.definition,
    url: `${SITE}/weather-terms/${slug}`,
    inDefinedTermSet: {
      "@type": "DefinedTermSet",
      name: "SnowSense Weather & Snow Glossary",
      url: `${SITE}/weather-terms`,
    },
  };

  const breadcrumbSchema = breadcrumbListSchema([
    { name: "Home", path: "/" },
    { name: "Weather Glossary", path: "/weather-terms" },
    { name: term.term, path: `/weather-terms/${slug}` },
  ]);

  const categoryLabels: Record<string, string> = {
    snow: "Snow & Ice",
    cold: "Cold & Temperature",
    "weather-science": "Weather Science",
    storm: "Storms",
    atmospheric: "Atmospheric",
    phenomenon: "Phenomena",
    safety: "Safety & Alerts",
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(definedTermSchema) }}
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
              <li><Link href="/weather-terms" className="hover:text-white/60 transition-colors">Glossary</Link></li>
              <li aria-hidden="true">›</li>
              <li className="text-white/60 font-medium" aria-current="page">{term.term}</li>
            </ol>
          </nav>

          {/* Category badge */}
          <div className="mb-4">
            <span className="inline-flex items-center gap-1.5 text-[10px] text-blue-300/70 uppercase tracking-widest font-bold bg-blue-500/10 px-3 py-1 rounded-full border border-blue-500/20">
              <Snowflake className="w-3 h-3" />
              {categoryLabels[term.category] ?? term.category}
            </span>
          </div>

          {/* Term heading */}
          <h1 className="font-display text-3xl sm:text-4xl font-black tracking-tight text-white mb-6">
            {term.term}
          </h1>

          {/* Definition */}
          <div className="glass-card rounded-2xl p-6 mb-8">
            <h2 className="text-xs text-white/50 uppercase tracking-widest font-bold mb-3">
              Definition
            </h2>
            <p className="text-base sm:text-lg text-white/80 leading-relaxed">
              {term.definition}
            </p>
          </div>

          {/* Related blog post */}
          {relatedPost ? (
            <div className="glass-card rounded-2xl p-6 mb-8">
              <h2 className="text-xs text-white/50 uppercase tracking-widest font-bold mb-3">
                Deep Dive
              </h2>
              <Link
                href={`/blog/${relatedPost.slug}`}
                className="group block"
              >
                <div className="flex items-start gap-3">
                  <BookOpen className="w-5 h-5 text-blue-400/60 shrink-0 mt-0.5" />
                  <div>
                    <h3 className="text-sm font-semibold text-white/80 group-hover:text-white transition-colors leading-snug">
                      {relatedPost.title}
                    </h3>
                    <p className="mt-1 text-xs text-white/40 line-clamp-2">
                      {relatedPost.excerpt}
                    </p>
                    <span className="mt-2 inline-block text-[10px] text-blue-400/60 uppercase tracking-widest font-bold">
                      {relatedPost.readTime} →
                    </span>
                  </div>
                </div>
              </Link>
            </div>
          ) : null}

          {/* Related terms */}
          {relatedTerms.length > 0 ? (
            <div className="mb-8">
              <h2 className="text-xs text-white/50 uppercase tracking-widest font-bold mb-3">
                Related Terms
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {relatedTerms.map((rt) => (
                  <Link
                    key={rt.slug}
                    href={`/weather-terms/${rt.slug}`}
                    className="group glass-card rounded-xl p-3 text-center hover:bg-white/[0.04] transition-colors"
                  >
                    <span className="text-sm font-semibold text-white/70 group-hover:text-white transition-colors">
                      {rt.term}
                    </span>
                  </Link>
                ))}
              </div>
            </div>
          ) : null}

          {/* Prev/Next navigation */}
          <div className="flex justify-between items-center mb-12">
            {prevTerm ? (
              <Link
                href={`/weather-terms/${prevTerm.slug}`}
                className="group flex items-center gap-2 text-sm text-white/50 hover:text-white transition-colors"
              >
                <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                {prevTerm.term}
              </Link>
            ) : <div />}
            {nextTerm ? (
              <Link
                href={`/weather-terms/${nextTerm.slug}`}
                className="group flex items-center gap-2 text-sm text-white/50 hover:text-white transition-colors"
              >
                {nextTerm.term}
                <ArrowLeft className="w-4 h-4 rotate-180 group-hover:translate-x-1 transition-transform" />
              </Link>
            ) : <div />}
          </div>

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
