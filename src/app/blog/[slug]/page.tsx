import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { getBlogPost, getAllSlugs, blogPosts } from "@/lib/blog-data";
import { breadcrumbListSchema } from "@/lib/breadcrumb-schema";
import { trimMetaTitle, trimMetaDescription } from "@/lib/seo-meta";
import { Calendar, Clock, ArrowLeft, ArrowRight } from "lucide-react";
import { BlogRenderer, extractHeadings, extractFAQs } from "@/components/blog/BlogRenderer";
import { TableOfContents } from "@/components/blog/TableOfContents";
import { ReadingProgress } from "@/components/blog/ReadingProgress";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return getAllSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = getBlogPost(slug);
  if (!post) return { title: "Article Not Found" };

  const canonicalUrl = `https://www.snowdaycalculate.com/blog/${slug}`;
  const trimmedTitle = trimMetaTitle(post.metaTitle, 48);
  const trimmedDescription = trimMetaDescription(post.metaDescription);
  const blogKeywords = [
    post.category.toLowerCase(),
    post.metaTitle.toLowerCase().split(/[:|—–]/)[0].trim(),
    "snow day",
    "winter weather",
    "weather guide",
  ];
  return {
    title: trimmedTitle,
    description: trimmedDescription,
    keywords: blogKeywords,
    alternates: {
      canonical: `/blog/${slug}`,
    },
    openGraph: {
      type: "article",
      url: canonicalUrl,
      title: trimMetaTitle(post.metaTitle, 60),
      description: trimmedDescription,
      images: [{ url: post.image, width: 1200, height: 630, alt: post.imageAlt }],
    },
    twitter: {
      card: "summary_large_image",
      title: trimMetaTitle(post.metaTitle, 60),
      description: trimmedDescription,
      images: [post.image],
    },
  };
}

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params;
  const post = getBlogPost(slug);
  if (!post) notFound();

  const currentIdx = blogPosts.findIndex((p) => p.slug === slug);
  const prevPost = currentIdx > 0 ? blogPosts[currentIdx - 1] : null;
  const nextPost = currentIdx < blogPosts.length - 1 ? blogPosts[currentIdx + 1] : null;

  const faqItems = extractFAQs(post.content);

  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.metaTitle,
    description: post.metaDescription,
    image: `https://www.snowdaycalculate.com${post.image}`,
    datePublished: post.date,
    dateModified: post.dateModified || post.date,
    author: { "@type": "Organization", name: "SnowSense™" },
    publisher: {
      "@type": "Organization",
      name: "SnowSense™",
      url: "https://www.snowdaycalculate.com",
    },
    mainEntityOfPage: `https://www.snowdaycalculate.com/blog/${slug}`,
  };

  const faqSchema = faqItems.length > 0 ? {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqItems.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.answer,
      },
    })),
  } : null;

  // BreadcrumbList: Home → Blog → Post (H4 fix).
  const breadcrumbSchema = breadcrumbListSchema([
    { name: "Home", path: "/" },
    { name: "Blog", path: "/blog" },
    { name: post.metaTitle, path: `/blog/${slug}` },
  ]);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      {faqSchema && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
        />
      )}
      <main className="min-h-screen">
        {/* Hero Image */}
        <div className="relative h-64 sm:h-80 md:h-96 w-full">
          <Image
            src={post.image}
            alt={post.imageAlt}
            width={1200}
            height={630}
            className="absolute inset-0 h-full w-full object-cover"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#050a14]/40 to-[#050a14]" />
          <div className="absolute inset-0 flex flex-col justify-end p-6 max-w-3xl mx-auto w-full">
            <span className="text-[9px] font-bold uppercase tracking-widest bg-blue-600 text-white px-3 py-1 rounded-full w-fit mb-3">
              {post.category}
            </span>
          </div>
        </div>

        {/* Article Content with sidebar TOC on large screens */}
        <div className="max-w-7xl mx-auto px-4 pb-24 grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_260px] gap-10">
          <div className="max-w-3xl mx-auto lg:mx-0 w-full">
            {/* Breadcrumb */}
            <nav className="flex items-center gap-2 text-xs text-white/25 mt-6 mb-8">
              <Link href="/" className="hover:text-white/50 transition-colors">Home</Link>
              <span>›</span>
              <Link href="/blog" className="hover:text-white/50 transition-colors">Blog</Link>
              <span>›</span>
              <span className="text-white/40 truncate">{post.title}</span>
            </nav>

            <h1 className="text-3xl md:text-5xl font-display font-black text-white leading-[1.1] mb-5 tracking-tight">
              {post.title}
            </h1>

            <p className="text-base text-white/55 leading-relaxed mb-6">
              {post.excerpt}
            </p>

            <div className="flex items-center gap-4 text-xs text-white/40 mb-10 pb-8 border-b border-white/5">
              <span className="flex items-center gap-1.5">
                <Calendar className="w-3 h-3" />
                {new Date(post.date).toLocaleDateString("en-US", {
                  month: "long",
                  day: "numeric",
                  year: "numeric",
                })}
              </span>
              <span className="flex items-center gap-1.5">
                <Clock className="w-3 h-3" />
                {post.readTime}
              </span>
            </div>

            {/* Body */}
            <article className="prose-blog">
              <BlogRenderer content={post.content} />
            </article>

          {/* CTA Box */}
          <div className="mt-12 glass-card rounded-2xl p-6 text-center">
            <p className="text-[10px] text-blue-400/60 uppercase tracking-[0.3em] font-bold mb-2">
              SnowSense™
            </p>
            <h2 className="text-xl font-black text-white mb-2">
              Check Tomorrow's Snow Day Probability
            </h2>
            <p className="text-white/50 text-sm mb-4">
              Real-time prediction for your city, updated every 30 minutes.
            </p>
            <Link
              href="/"
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full font-bold text-sm text-white transition-all hover:scale-105"
              style={{
                background: "linear-gradient(135deg,#1d4ed8,#3b82f6)",
                boxShadow: "0 4px 20px rgba(59,130,246,0.3)",
              }}
            >
              ❄️ Get My Prediction
            </Link>
          </div>

            {/* Prev / Next Nav */}
            <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 gap-4">
              {prevPost ? (
                <Link
                  href={`/blog/${prevPost.slug}`}
                  className="glass-card rounded-2xl p-4 hover:border-blue-400/30 transition-all group"
                >
                  <p className="text-[10px] text-white/25 uppercase tracking-widest mb-1 flex items-center gap-1">
                    <ArrowLeft className="w-3 h-3" /> Previous
                  </p>
                  <p className="text-sm font-bold text-white/70 group-hover:text-white transition-colors leading-snug">
                    {prevPost.title}
                  </p>
                </Link>
              ) : <div />}
              {nextPost ? (
                <Link
                  href={`/blog/${nextPost.slug}`}
                  className="glass-card rounded-2xl p-4 hover:border-blue-400/30 transition-all group sm:text-right"
                >
                  <p className="text-[10px] text-white/25 uppercase tracking-widest mb-1 flex items-center gap-1 sm:justify-end">
                    Next <ArrowRight className="w-3 h-3" />
                  </p>
                  <p className="text-sm font-bold text-white/70 group-hover:text-white transition-colors leading-snug">
                    {nextPost.title}
                  </p>
                </Link>
              ) : <div />}
            </div>
          </div>

          {/* Sticky TOC sidebar */}
          <aside>
            <TableOfContents headings={extractHeadings(post.content)} />
          </aside>
        </div>
        <ReadingProgress />
      </main>
    </>
  );
}
