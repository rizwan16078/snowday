import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { blogPosts } from "@/lib/blog-data";
import { breadcrumbListSchema } from "@/lib/breadcrumb-schema";
import { Calendar, Clock, ArrowRight } from "lucide-react";

export const metadata: Metadata = {
  title: "Snow Day Blog — Guides, Science & Regional Analysis",
  description:
    "Expert guides on snow day predictions, school closure thresholds, regional weather science, and how superintendents make the call to cancel school.",
  alternates: {
    canonical: "/blog",
  },
  openGraph: {
    type: "website",
    url: "https://www.snowdaycalculate.com/blog",
    title: "Snow Day Blog — SnowSense™",
    description: "Expert snow day guides, weather science, and regional analysis.",
    images: [{ url: "/api/og", width: 1200, height: 630 }],
  },
};

const blogSchema = {
  "@context": "https://schema.org",
  "@type": "Blog",
  name: "SnowSense™ Blog",
  url: "https://www.snowdaycalculate.com/blog",
  description: "Expert guides on snow day predictions, school closure thresholds, regional weather science, and how superintendents make the call to cancel school.",
  publisher: {
    "@type": "Organization",
    name: "SnowSense™",
    url: "https://www.snowdaycalculate.com",
  },
  blogPost: blogPosts.slice(0, 10).map((post) => ({
    "@type": "BlogPosting",
    headline: post.metaTitle,
    url: `https://www.snowdaycalculate.com/blog/${post.slug}`,
    datePublished: post.date,
  })),
};

const breadcrumbSchema = breadcrumbListSchema([
  { name: "Home", path: "/" },
  { name: "Blog", path: "/blog" },
]);

export default function BlogIndexPage() {
  const [featured, ...rest] = blogPosts;

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(blogSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
    <main className="min-h-screen px-4 py-24 max-w-6xl mx-auto">
      <header className="text-center mb-16">
        <p className="text-[10px] text-blue-400/60 uppercase tracking-[0.3em] font-bold mb-3">
          SnowSense™ Knowledge Base
        </p>
        <h1 className="text-4xl md:text-5xl font-black font-display text-white mb-4">
          Snow Day Guides & Science
        </h1>
        <p className="text-white/50 max-w-xl mx-auto text-lg">
          Expert articles on school closures, weather prediction, and regional
          snow tolerance — so you're never caught off guard.
        </p>
      </header>

      {/* Featured Post */}
      <Link
        href={`/blog/${featured.slug}`}
        className="group block mb-12 glass-card rounded-3xl overflow-hidden hover:border-white/12 transition-all duration-500 hover:-translate-y-1"
      >
        <div className="grid md:grid-cols-2 gap-0">
          <div className="relative h-64 md:h-auto min-h-[260px]">
            <Image
              src={featured.image}
              alt={featured.imageAlt}
              fill
              className="object-cover"
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-r from-transparent to-[#050a14]/60 hidden md:block" />
            <span className="absolute top-4 left-4 text-[10px] font-bold uppercase tracking-widest bg-blue-600 text-white px-3 py-1 rounded-full">
              Featured
            </span>
          </div>
          <div className="p-8 flex flex-col justify-center">
            <span className="text-[10px] text-blue-400/70 uppercase tracking-widest font-bold mb-3">
              {featured.category}
            </span>
            <h2 className="text-2xl font-black text-white mb-3 group-hover:text-blue-300 transition-colors">
              {featured.title}
            </h2>
            <p className="text-white/50 text-sm leading-relaxed mb-6">
              {featured.excerpt}
            </p>
            <div className="flex items-center gap-4 text-xs text-white/30">
              <span className="flex items-center gap-1.5">
                <Calendar className="w-3 h-3" />
                {new Date(featured.date).toLocaleDateString("en-US", {
                  month: "long",
                  day: "numeric",
                  year: "numeric",
                })}
              </span>
              <span className="flex items-center gap-1.5">
                <Clock className="w-3 h-3" />
                {featured.readTime}
              </span>
            </div>
            <div className="mt-6 inline-flex items-center gap-2 text-sm font-bold text-blue-400 group-hover:gap-3 transition-all">
              Read Article <ArrowRight className="w-4 h-4" />
            </div>
          </div>
        </div>
      </Link>

      {/* Grid of remaining 5 posts */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {rest.map((post) => (
          <Link
            key={post.slug}
            href={`/blog/${post.slug}`}
            className="group glass-card rounded-2xl overflow-hidden hover:border-white/12 transition-all duration-500 hover:-translate-y-1 flex flex-col"
          >
            <div className="relative h-48">
              <Image
                src={post.image}
                alt={post.imageAlt}
                fill
                className="object-cover"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#050a14]/80 to-transparent" />
              <span className="absolute top-3 left-3 text-[9px] font-bold uppercase tracking-widest bg-white/10 backdrop-blur-sm border border-white/10 text-white/70 px-2.5 py-1 rounded-full">
                {post.category}
              </span>
            </div>
            <div className="p-5 flex flex-col flex-1">
              <div className="flex items-center gap-3 text-[10px] text-white/25 mb-3">
                <span className="flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  {new Date(post.date).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })}
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {post.readTime}
                </span>
              </div>
              <h2 className="text-base font-black text-white mb-2 group-hover:text-blue-300 transition-colors leading-snug">
                {post.title}
              </h2>
              <p className="text-xs text-white/40 leading-relaxed flex-1">
                {post.excerpt}
              </p>
              <div className="mt-4 inline-flex items-center gap-1.5 text-xs font-bold text-blue-400 group-hover:gap-2.5 transition-all">
                Read & Predict <ArrowRight className="w-3 h-3" />
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* CTA Banner */}
      <div className="mt-16 glass-card rounded-3xl p-8 text-center">
        <p className="text-[10px] text-blue-400/60 uppercase tracking-[0.3em] font-bold mb-3">
          Real-Time Prediction
        </p>
        <h2 className="text-2xl font-black text-white mb-3">
          Ready to Check Tomorrow's Prediction?
        </h2>
        <p className="text-white/50 text-sm mb-6 max-w-md mx-auto">
          Stop guessing. Get a live snow day probability score for your city,
          updated every 30 minutes.
        </p>
        <Link
          href="/"
          className="inline-flex items-center gap-2 px-8 py-3 rounded-full font-bold text-sm text-white transition-all hover:scale-105 active:scale-95"
          style={{
            background: "linear-gradient(135deg,#1d4ed8,#3b82f6)",
            boxShadow: "0 4px 20px rgba(59,130,246,0.3)",
          }}
        >
          ❄️ Check My Snow Day Probability
        </Link>
      </div>
    </main>
    </>
  );
}
