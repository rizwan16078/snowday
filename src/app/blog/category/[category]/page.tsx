import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { blogPosts, BLOG_CATEGORIES, isBlogPostNoindex } from "@/lib/blog-data";
import { breadcrumbListSchema } from "@/lib/breadcrumb-schema";
import { Calendar, Clock, ArrowRight } from "lucide-react";

interface Props {
  params: Promise<{ category: string }>;
}

export function generateStaticParams() {
  return Object.keys(BLOG_CATEGORIES).map((category) => ({ category }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { category } = await params;
  const categoryName = BLOG_CATEGORIES[category as keyof typeof BLOG_CATEGORIES];
  if (!categoryName) return { title: "Category Not Found" };

  const canonicalUrl = `https://www.snowdaycalculate.com/blog/category/${category}`;
  return {
    title: `${categoryName} Articles`,
    description: `Expert ${categoryName.toLowerCase()} articles on snow days, school closures, and winter weather — from SnowSense™.`,
    alternates: { canonical: `/blog/category/${category}` },
    openGraph: {
      type: "website",
      url: canonicalUrl,
      title: `${categoryName} — SnowSense™ Blog`,
      description: `All ${categoryName} guides from SnowSense™.`,
      images: [{ url: "/api/og", width: 1200, height: 630 }],
    },
    twitter: {
      card: "summary_large_image",
      title: `${categoryName} — SnowSense™ Blog`,
    },
  };
}

export default async function BlogCategoryPage({ params }: Props) {
  const { category } = await params;
  const categoryName = BLOG_CATEGORIES[category as keyof typeof BLOG_CATEGORIES];
  if (!categoryName) notFound();

  const posts = blogPosts.filter(
    (p) => p.category === categoryName && !isBlogPostNoindex(p.slug)
  );

  const breadcrumbSchema = breadcrumbListSchema([
    { name: "Home", path: "/" },
    { name: "Blog", path: "/blog" },
    { name: categoryName, path: `/blog/category/${category}` },
  ]);

  const collectionSchema = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: `${categoryName} — SnowSense™ Blog`,
    url: `https://www.snowdaycalculate.com/blog/category/${category}`,
    description: `All ${categoryName} articles from SnowSense™.`,
    hasPart: posts.map((p) => ({
      "@type": "Article",
      headline: p.metaTitle,
      url: `https://www.snowdaycalculate.com/blog/${p.slug}`,
      datePublished: p.date,
    })),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(collectionSchema) }}
      />
      <main className="min-h-screen px-4 py-24 max-w-6xl mx-auto">
        <header className="text-center mb-16">
          <Link
            href="/blog"
            className="text-[10px] text-blue-400/60 hover:text-blue-400 transition-colors uppercase tracking-[0.3em] font-bold mb-4 inline-block"
          >
            ← All Articles
          </Link>
          <h1 className="text-4xl md:text-5xl font-black font-display text-white mb-4">
            {categoryName}
          </h1>
          <p className="text-white/50 max-w-xl mx-auto text-lg">
            {posts.length} article{posts.length !== 1 ? "s" : ""} in this category
          </p>
        </header>

        {/* Category nav */}
        <nav className="flex flex-wrap justify-center gap-2 mb-12" aria-label="Blog categories">
          <Link
            href="/blog"
            className="text-[10px] font-bold uppercase tracking-widest px-4 py-2 rounded-full bg-white/5 border border-white/10 text-white/60 hover:text-white hover:border-white/20 transition-all"
          >
            All
          </Link>
          {(Object.entries(BLOG_CATEGORIES) as [string, string][]).map(([slug, name]) => (
            <Link
              key={slug}
              href={`/blog/category/${slug}`}
              className={`text-[10px] font-bold uppercase tracking-widest px-4 py-2 rounded-full border transition-all ${
                slug === category
                  ? "bg-blue-600/20 border-blue-500/30 text-blue-300"
                  : "bg-white/5 border-white/10 text-white/60 hover:text-white hover:border-white/20"
              }`}
            >
              {name}
            </Link>
          ))}
        </nav>

        {posts.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {posts.map((post) => (
              <Link
                key={post.slug}
                href={`/blog/${post.slug}`}
                className="group glass-card rounded-2xl overflow-hidden hover:border-white/12 transition-all duration-500 hover:-translate-y-1 flex flex-col"
              >
                <div className="relative h-48">
                  <Image
                    src={post.image}
                    alt={post.imageAlt}
                    width={1200}
                    height={630}
                    className="absolute inset-0 h-full w-full object-cover"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#050a14]/80 to-transparent" />
                </div>
                <div className="p-5 flex flex-col flex-1">
                  <div className="flex items-center gap-3 text-[10px] text-white/50 mb-3">
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
                  <p className="text-xs text-white/50 leading-relaxed flex-1">{post.excerpt}</p>
                  <div className="mt-4 inline-flex items-center gap-1.5 text-xs font-bold text-blue-400 group-hover:gap-2.5 transition-all">
                    Read Article <ArrowRight className="w-3 h-3" />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <p className="text-white/50 mb-4">No articles in this category yet.</p>
            <Link href="/blog" className="text-blue-400 hover:text-blue-300 transition-colors text-sm font-bold">
              Browse all articles →
            </Link>
          </div>
        )}

        {/* CTA */}
        <div className="mt-16 glass-card rounded-3xl p-8 text-center">
          <p className="text-[10px] text-blue-400/60 uppercase tracking-[0.3em] font-bold mb-3">
            Real-Time Prediction
          </p>
          <h2 className="text-2xl font-black text-white mb-3">
            Ready to Check Tomorrow&apos;s Prediction?
          </h2>
          <p className="text-white/50 text-sm mb-6 max-w-md mx-auto">
            Stop guessing. Get a live snow day probability score for your city, updated every 30 minutes.
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
