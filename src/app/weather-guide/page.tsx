import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { blogPosts } from "@/lib/blog-data";
import { GLOSSARY_TERMS } from "@/lib/glossary-data";
import { breadcrumbListSchema } from "@/lib/breadcrumb-schema";
import {
  Snowflake,
  Cloud,
  Thermometer,
  Wind,
  Sun,
  Heart,
  Home,
  Sparkles,
  ArrowRight,
  Calculator,
  BookOpen,
  Zap,
} from "lucide-react";

export const metadata: Metadata = {
  title: "The Complete Weather & Snow Guide — SnowSense™",
  description:
    "The complete guide to weather and snow. Learn how to predict storms, dress for any temperature, prep for deep freezes, prevent ice dams, and understand the meteorology behind every season — all in one hub.",
  alternates: { canonical: "/weather-guide" },
  openGraph: {
    type: "website",
    url: "https://www.snowdaycalculate.com/weather-guide",
    title: "The Complete Weather & Snow Guide — SnowSense™",
    description:
      "The hub for everything weather and snow: storm prediction, cold-weather safety, outdoor preparedness, and seasonal travel.",
    images: [{ url: "/og-default.svg", width: 1200, height: 630 }],
  },
};

// Helper to find a blog post by slug — returns undefined if not present.
function findPost(slug: string) {
  return blogPosts.find((p) => p.slug === slug);
}

// Section configuration: each section is a curated theme.
const SECTIONS = [
  {
    id: "snow-and-school-closures",
    title: "Snow & School Closures",
    description:
      "When does heavy snow actually shut schools down? What separates a true blizzard from a snow squall? Start with the science behind every snow day.",
    icon: Snowflake,
    color: "from-blue-500/20 to-cyan-500/10",
    iconColor: "text-blue-300",
    posts: [
      "how-many-inches-of-snow-cancels-school",
      "first-indicator-bad-weather",
      "may-outer-banks-weather",
    ],
    tools: [
      { label: "Snow Day Calculator", href: "/snow-day-calculator", desc: "Real-time probability for your zip code." },
      { label: "Live Weather Dashboard", href: "/weather", desc: "Track wind chill and pressure in real time." },
    ],
  },
  {
    id: "cold-weather-health",
    title: "Cold Weather Health",
    description:
      "Why does freezing wind make your ears ache and your throat raw? When is cold weather an actual medical emergency? Real biology, plain English.",
    icon: Heart,
    color: "from-cyan-500/20 to-blue-500/10",
    iconColor: "text-cyan-300",
    posts: [
      "why-do-ears-hurt-cold-weather",
      "can-cold-weather-cause-sore-throat",
      "can-cold-weather-make-arthritis-worse",
      "allergic-to-cold-weather",
    ],
  },
  {
    id: "winter-preparedness",
    title: "Winter Preparedness",
    description:
      "From the panic of a deep freeze to maintaining a roof in harsh conditions — actionable preparedness for everyone, not just preppers.",
    icon: Home,
    color: "from-purple-500/20 to-blue-500/10",
    iconColor: "text-purple-300",
    posts: [
      "does-cold-weather-make-you-nervous",
      "maintain-roof-harsh-weather",
      "can-you-paint-in-cold-weather",
      "can-you-pour-concrete-cold-weather",
      "how-to-move-furniture-during-bad-weather",
    ],
  },
  {
    id: "outdoor-activities",
    title: "Running & Outdoor Activities",
    description:
      "60° looks warm. 50° looks chilly. 40° looks freezing. Stop guessing what to wear when you head out the door — here is the formula.",
    icon: Wind,
    color: "from-emerald-500/20 to-cyan-500/10",
    iconColor: "text-emerald-300",
    posts: [
      "how-to-dress-for-60-degree-weather",
      "what-to-wear-running-in-50-degree-weather",
      "what-to-wear-running-in-40-degree-weather",
    ],
  },
  {
    id: "home-and-yard",
    title: "Home, Yard & Equipment",
    description:
      "Patio furniture that survives winter, hunting in marginal weather, and why your bed-bug freeze trick will not work — straight talk on weather and your stuff.",
    icon: Home,
    color: "from-amber-500/20 to-orange-500/10",
    iconColor: "text-amber-300",
    posts: [
      "weather-resistant-patio-furniture",
      "how-long-can-deer-hang-50-degrees",
      "can-bed-bugs-live-in-cold-weather",
    ],
  },
  {
    id: "travel-and-seasonal",
    title: "Travel & Seasonal Weather",
    description:
      "Hawaii in October, the Outer Banks in May, hot-weather fabric science. Plan trips around the actual climate, not the postcard fantasy.",
    icon: Sun,
    color: "from-orange-500/20 to-amber-500/10",
    iconColor: "text-orange-300",
    posts: [
      "hawaii-weather-in-october",
      "may-outer-banks-weather",
      "is-silk-good-for-hot-weather",
    ],
  },
  {
    id: "weather-science",
    title: "Weather Science & Education",
    description:
      "Want to actually understand how meteorologists think? From Science Olympiad strategy to reading a radar like a pro.",
    icon: Cloud,
    color: "from-indigo-500/20 to-purple-500/10",
    iconColor: "text-indigo-300",
    posts: [
      "science-olympiad-weather-or-not",
      "first-indicator-bad-weather",
    ],
  },
];

// Featured glossary terms shown on the hub page.
const FEATURED_TERMS = [
  "petrichor",
  "wind-chill",
  "ice-dam",
  "polar-vortex",
  "lake-effect-snow",
  "barometric-pressure",
  "cold-urticaria",
  "freeze-thaw-cycle",
];

export default function WeatherGuidePage() {
  const SITE = "https://www.snowdaycalculate.com";

  // Build ItemList schema linking the hub to all curated posts.
  const allPostSlugs = Array.from(
    new Set(SECTIONS.flatMap((s) => s.posts))
  );
  const itemListSchema = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "The Complete Weather & Snow Guide",
    description:
      "Curated SnowSense guides covering snow day predictions, cold-weather health, winter preparedness, running gear, travel weather, and meteorology.",
    itemListElement: allPostSlugs.map((slug, i) => {
      const post = findPost(slug);
      return {
        "@type": "ListItem",
        position: i + 1,
        url: `${SITE}/blog/${slug}`,
        name: post?.title || slug,
      };
    }),
  };

  const breadcrumbSchema = breadcrumbListSchema([
    { name: "Home", path: "/" },
    { name: "Weather Guide", path: "/weather-guide" },
  ]);

  const featuredTerms = FEATURED_TERMS.map((s) =>
    GLOSSARY_TERMS.find((t) => t.slug === s)
  ).filter((t): t is NonNullable<typeof t> => Boolean(t));

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

      <main className="min-h-screen pb-24">
        {/* HERO */}
        <section className="relative pt-32 pb-16 px-4 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-blue-500/[0.06] via-transparent to-transparent pointer-events-none" />
          <div className="absolute top-32 left-1/2 -translate-x-1/2 w-[600px] h-[600px] rounded-full bg-blue-500/[0.05] blur-[140px] pointer-events-none" />

          <div className="relative max-w-5xl mx-auto text-center">
            <nav className="flex items-center justify-center gap-2 text-xs text-white/30 mb-8">
              <Link href="/" className="hover:text-white/60 transition-colors">
                Home
              </Link>
              <span>›</span>
              <span className="text-white/50">Weather Guide</span>
            </nav>

            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-500/10 border border-blue-400/20 text-blue-300 text-[10px] uppercase tracking-[0.25em] font-bold mb-6">
              <Sparkles className="w-3 h-3" />
              The SnowSense Master Index
            </div>

            <h1 className="text-4xl sm:text-5xl md:text-7xl font-display font-black text-white leading-[1.02] tracking-tight mb-6">
              The Complete
              <br />
              <span className="bg-gradient-to-r from-blue-300 via-cyan-300 to-blue-400 bg-clip-text text-transparent">
                Weather &amp; Snow Guide
              </span>
            </h1>

            <p className="text-base sm:text-lg text-white/60 leading-relaxed max-w-2xl mx-auto mb-10">
              Every guide, calculator, glossary entry, and field-tested insight
              SnowSense has built — organized into one master hub. From snow
              day predictions to cold-weather science, this is your starting
              point.
            </p>

            {/* Tool Strip */}
            <div className="flex flex-wrap justify-center gap-3">
              <Link
                href="/snow-day-calculator"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-full font-bold text-sm text-white transition-all hover:scale-105"
                style={{
                  background: "linear-gradient(135deg,#1d4ed8,#3b82f6)",
                  boxShadow: "0 4px 20px rgba(59,130,246,0.3)",
                }}
              >
                <Calculator className="w-4 h-4" /> Snow Day Calculator
              </Link>
              <Link
                href="/weather"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-full font-bold text-sm text-white/80 border border-white/15 transition-all hover:bg-white/5 hover:text-white"
              >
                <Thermometer className="w-4 h-4" /> Live Weather Dashboard
              </Link>
              <Link
                href="/weather-terms"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-full font-bold text-sm text-white/80 border border-white/15 transition-all hover:bg-white/5 hover:text-white"
              >
                <BookOpen className="w-4 h-4" /> Weather Glossary
              </Link>
            </div>
          </div>
        </section>

        {/* TABLE OF CONTENTS */}
        <section className="max-w-5xl mx-auto px-4 mb-20">
          <div className="glass-card rounded-3xl p-6 sm:p-8 border border-white/[0.06]">
            <p className="text-[10px] uppercase tracking-[0.3em] font-bold text-blue-300 mb-4">
              On This Hub
            </p>
            <div className="grid sm:grid-cols-2 gap-x-6 gap-y-3">
              {SECTIONS.map((section) => {
                const Icon = section.icon;
                return (
                  <a
                    key={section.id}
                    href={`#${section.id}`}
                    className="group flex items-center gap-3 py-2 px-3 rounded-xl border border-transparent hover:border-white/10 hover:bg-white/[0.02] transition-all"
                  >
                    <div
                      className={`shrink-0 w-9 h-9 rounded-lg bg-gradient-to-br ${section.color} border border-white/10 flex items-center justify-center`}
                    >
                      <Icon className={`w-4 h-4 ${section.iconColor}`} />
                    </div>
                    <span className="text-sm font-bold text-white/80 group-hover:text-white transition-colors flex-1">
                      {section.title}
                    </span>
                    <ArrowRight className="w-3.5 h-3.5 text-white/30 transition-transform group-hover:translate-x-0.5 group-hover:text-blue-400" />
                  </a>
                );
              })}
            </div>
          </div>
        </section>

        {/* TOPIC SECTIONS */}
        <div className="max-w-5xl mx-auto px-4 space-y-20">
          {SECTIONS.map((section) => {
            const Icon = section.icon;
            const sectionPosts = section.posts
              .map((slug) => findPost(slug))
              .filter((p): p is NonNullable<typeof p> => Boolean(p));

            return (
              <section
                key={section.id}
                id={section.id}
                className="scroll-mt-24"
              >
                {/* Section Header */}
                <div className="flex items-start gap-4 mb-8">
                  <div
                    className={`shrink-0 w-12 h-12 rounded-2xl bg-gradient-to-br ${section.color} border border-white/10 flex items-center justify-center`}
                  >
                    <Icon className={`w-6 h-6 ${section.iconColor}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h2 className="text-2xl sm:text-3xl font-display font-black text-white leading-tight mb-2">
                      {section.title}
                    </h2>
                    <p className="text-sm text-white/55 leading-relaxed max-w-2xl">
                      {section.description}
                    </p>
                  </div>
                </div>

                {/* Tools Strip (if section has tools) */}
                {section.tools && (
                  <div className="grid sm:grid-cols-2 gap-3 mb-6">
                    {section.tools.map((tool) => (
                      <Link
                        key={tool.href}
                        href={tool.href}
                        className="group glass-card rounded-2xl p-4 border border-blue-400/20 bg-gradient-to-br from-blue-500/[0.06] to-transparent transition-all hover:border-blue-400/40"
                      >
                        <div className="flex items-center justify-between gap-3">
                          <div className="min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <Zap className="w-3 h-3 text-blue-400" />
                              <p className="text-[10px] uppercase tracking-widest font-bold text-blue-300">
                                Tool
                              </p>
                            </div>
                            <p className="text-base font-bold text-white">
                              {tool.label}
                            </p>
                            <p className="text-xs text-white/50 mt-1">
                              {tool.desc}
                            </p>
                          </div>
                          <ArrowRight className="w-4 h-4 text-blue-400 shrink-0 transition-transform group-hover:translate-x-0.5" />
                        </div>
                      </Link>
                    ))}
                  </div>
                )}

                {/* Posts Grid */}
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {sectionPosts.map((post) => (
                    <Link
                      key={post.slug}
                      href={`/blog/${post.slug}`}
                      className="group glass-card rounded-2xl overflow-hidden border border-white/[0.06] transition-all hover:border-blue-400/30 hover:bg-white/[0.02] flex flex-col"
                    >
                      <div className="relative h-32 bg-gradient-to-br from-blue-900/30 to-cyan-900/20 overflow-hidden">
                        {post.image && (
                          <Image
                            src={post.image}
                            alt={post.imageAlt}
                            fill
                            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                            className="object-cover opacity-70 group-hover:opacity-90 group-hover:scale-105 transition-all duration-500"
                          />
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-[#050a14] via-[#050a14]/30 to-transparent" />
                      </div>
                      <div className="p-5 flex-1 flex flex-col">
                        <p className="text-[10px] uppercase tracking-widest font-bold text-blue-300/70 mb-2">
                          {post.category}
                        </p>
                        <h3 className="text-base font-bold text-white leading-snug mb-2 group-hover:text-blue-200 transition-colors">
                          {post.title}
                        </h3>
                        <p className="text-xs text-white/50 leading-relaxed mb-3 flex-1">
                          {post.excerpt}
                        </p>
                        <div className="inline-flex items-center gap-1.5 text-[11px] uppercase tracking-wider font-bold text-blue-300">
                          Read Guide
                          <ArrowRight className="w-3 h-3 transition-transform group-hover:translate-x-0.5" />
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </section>
            );
          })}
        </div>

        {/* FEATURED GLOSSARY TERMS */}
        <section className="max-w-5xl mx-auto px-4 mt-24">
          <div className="flex items-end justify-between gap-4 mb-8 flex-wrap">
            <div>
              <p className="text-[10px] uppercase tracking-[0.3em] font-bold text-blue-300 mb-2">
                Quick Definitions
              </p>
              <h2 className="text-2xl sm:text-3xl font-display font-black text-white">
                Featured Glossary Terms
              </h2>
            </div>
            <Link
              href="/weather-terms"
              className="inline-flex items-center gap-1.5 text-sm font-bold text-blue-300 hover:text-blue-200 transition-colors"
            >
              View All {GLOSSARY_TERMS.length} Terms
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid sm:grid-cols-2 gap-3">
            {featuredTerms.map((term) => (
              <Link
                key={term.slug}
                href={`/weather-terms#${term.slug}`}
                className="group glass-card rounded-2xl p-5 border border-white/[0.06] transition-all hover:border-blue-400/30 hover:bg-white/[0.02]"
              >
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="text-base font-bold text-white group-hover:text-blue-200 transition-colors">
                    {term.term}
                  </h3>
                </div>
                <p className="text-xs text-white/55 leading-relaxed line-clamp-2">
                  {term.definition}
                </p>
              </Link>
            ))}
          </div>
        </section>

        {/* FINAL CTA */}
        <section className="max-w-5xl mx-auto px-4 mt-24">
          <div className="glass-card rounded-3xl p-8 sm:p-12 text-center border border-blue-400/20 bg-gradient-to-br from-blue-500/[0.08] via-transparent to-cyan-500/[0.04] relative overflow-hidden">
            <div className="absolute -top-20 -right-20 w-60 h-60 rounded-full bg-blue-500/10 blur-3xl pointer-events-none" />
            <div className="absolute -bottom-20 -left-20 w-60 h-60 rounded-full bg-cyan-500/10 blur-3xl pointer-events-none" />

            <div className="relative">
              <p className="text-[10px] uppercase tracking-[0.3em] font-bold text-blue-300 mb-4">
                Ready to Predict the Weather?
              </p>
              <h2 className="text-3xl sm:text-4xl font-display font-black text-white mb-4">
                Stop Guessing.
                <br />
                Start Tracking.
              </h2>
              <p className="text-sm sm:text-base text-white/60 leading-relaxed max-w-xl mx-auto mb-8">
                You have the knowledge. Now use the tools. Get hyper-local
                predictions, real-time wind chill, and snow day probabilities
                for your exact zip code.
              </p>
              <div className="flex flex-wrap justify-center gap-3">
                <Link
                  href="/snow-day-calculator"
                  className="inline-flex items-center gap-2 px-7 py-3.5 rounded-full font-bold text-sm text-white transition-all hover:scale-105"
                  style={{
                    background: "linear-gradient(135deg,#1d4ed8,#3b82f6)",
                    boxShadow: "0 4px 24px rgba(59,130,246,0.4)",
                  }}
                >
                  ❄️ Get My Snow Day Prediction
                </Link>
                <Link
                  href="/blog"
                  className="inline-flex items-center gap-2 px-7 py-3.5 rounded-full font-bold text-sm text-white/80 border border-white/15 transition-all hover:bg-white/5 hover:text-white"
                >
                  Browse the Blog
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
