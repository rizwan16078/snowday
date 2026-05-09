import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { getBlogPost, getAllSlugs, blogPosts } from "@/lib/blog-data";
import { Calendar, Clock, ArrowLeft, ArrowRight } from "lucide-react";

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

  const canonicalUrl = `https://www.snowsense.app/blog/${slug}`;
  return {
    title: post.metaTitle,
    description: post.metaDescription,
    alternates: {
      canonical: canonicalUrl,
      languages: { en: canonicalUrl },
    },
    openGraph: {
      type: "article",
      url: canonicalUrl,
      title: post.metaTitle,
      description: post.metaDescription,
      images: [{ url: post.image, width: 1200, height: 630, alt: post.imageAlt }],
    },
    twitter: {
      card: "summary_large_image",
      title: post.metaTitle,
      description: post.metaDescription,
      images: [post.image],
    },
  };
}

// Convert simple markdown-ish content to JSX-safe HTML paragraphs
function renderContent(content: string) {
  const sections = content.split(/\n\n+/);
  return sections.map((block, i) => {
    // H2
    if (block.startsWith("## ")) {
      return (
        <h2 key={i} className="text-xl font-black text-white mt-10 mb-4">
          {block.replace("## ", "")}
        </h2>
      );
    }
    // H3
    if (block.startsWith("### ")) {
      return (
        <h3 key={i} className="text-base font-bold text-blue-300 mt-6 mb-2">
          {block.replace("### ", "")}
        </h3>
      );
    }
    // Table (basic)
    if (block.includes("| --- |") || block.includes("|------|")) {
      const rows = block
        .split("\n")
        .filter((r) => r.trim() && !r.match(/^\|[-| ]+\|$/));
      return (
        <div key={i} className="overflow-x-auto my-6">
          <table className="w-full text-sm border-collapse">
            <tbody>
              {rows.map((row, ri) => {
                const cells = row
                  .split("|")
                  .filter((c) => c.trim())
                  .map((c) => c.trim());
                if (ri === 0) {
                  return (
                    <tr key={ri} className="border-b border-white/10">
                      {cells.map((c, ci) => (
                        <th
                          key={ci}
                          className="text-left py-2 px-3 text-[10px] uppercase tracking-wider text-white/40 font-bold"
                        >
                          {c}
                        </th>
                      ))}
                    </tr>
                  );
                }
                return (
                  <tr key={ri} className="border-b border-white/5">
                    {cells.map((c, ci) => (
                      <td key={ci} className="py-2 px-3 text-white/60 text-sm">
                        {c}
                      </td>
                    ))}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      );
    }
    // Blockquote (Pro Tip)
    if (block.startsWith("> ")) {
      return (
        <blockquote
          key={i}
          className="my-6 pl-4 border-l-2 border-blue-500/50 bg-blue-500/5 rounded-r-xl py-4 pr-4"
        >
          <p className="text-sm text-white/70 leading-relaxed italic">
            {block.replace(/^> \*\*.*?\*\*\s*/, "").trim()}
          </p>
          <p className="text-[10px] text-blue-400/60 uppercase tracking-widest font-bold mt-2">
            ⚡ The Trench Truth
          </p>
        </blockquote>
      );
    }
    // Bullet list
    if (block.match(/^[-*•] /m) || block.match(/^\d+\. /m)) {
      const items = block.split("\n").filter((l) => l.trim());
      return (
        <ul key={i} className="my-4 space-y-2">
          {items.map((item, ii) => (
            <li key={ii} className="flex gap-2 text-sm text-white/60 leading-relaxed">
              <span className="text-blue-400 mt-0.5 shrink-0">•</span>
              <span
                dangerouslySetInnerHTML={{
                  __html: item
                    .replace(/^[-*•\d.]\s+/, "")
                    .replace(/\*\*(.*?)\*\*/g, "<strong class='text-white/90'>$1</strong>"),
                }}
              />
            </li>
          ))}
        </ul>
      );
    }
    // Normal paragraph
    const html = block
      .replace(/\*\*(.*?)\*\*/g, "<strong class='text-white/90 font-bold'>$1</strong>")
      .replace(
        /\[([^\]]+)\]\(([^)]+)\)/g,
        "<a href='$2' class='text-blue-400 hover:text-blue-300 transition-colors underline decoration-blue-400/30 hover:decoration-blue-300'>$1</a>"
      );
    return (
      <p
        key={i}
        className="text-white/60 leading-relaxed text-[15px] my-4"
        dangerouslySetInnerHTML={{ __html: html }}
      />
    );
  });
}

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params;
  const post = getBlogPost(slug);
  if (!post) notFound();

  const currentIdx = blogPosts.findIndex((p) => p.slug === slug);
  const prevPost = currentIdx > 0 ? blogPosts[currentIdx - 1] : null;
  const nextPost = currentIdx < blogPosts.length - 1 ? blogPosts[currentIdx + 1] : null;

  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.metaTitle,
    description: post.metaDescription,
    image: `https://www.snowsense.app${post.image}`,
    datePublished: post.date,
    dateModified: post.date,
    author: { "@type": "Organization", name: "SnowSense™" },
    publisher: {
      "@type": "Organization",
      name: "SnowSense™",
      url: "https://www.snowsense.app",
    },
    mainEntityOfPage: `https://www.snowsense.app/blog/${slug}`,
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }}
      />
      <main className="min-h-screen">
        {/* Hero Image */}
        <div className="relative h-64 sm:h-80 md:h-96 w-full">
          <Image
            src={post.image}
            alt={post.imageAlt}
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#050a14]/40 to-[#050a14]" />
          <div className="absolute inset-0 flex flex-col justify-end p-6 max-w-3xl mx-auto w-full">
            <span className="text-[9px] font-bold uppercase tracking-widest bg-blue-600 text-white px-3 py-1 rounded-full w-fit mb-3">
              {post.category}
            </span>
          </div>
        </div>

        {/* Article Content */}
        <div className="max-w-3xl mx-auto px-4 pb-24">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-xs text-white/25 mt-6 mb-8">
            <Link href="/" className="hover:text-white/50 transition-colors">Home</Link>
            <span>›</span>
            <Link href="/blog" className="hover:text-white/50 transition-colors">Blog</Link>
            <span>›</span>
            <span className="text-white/40 truncate">{post.title}</span>
          </nav>

          <h1 className="text-3xl md:text-4xl font-black text-white leading-tight mb-4">
            {post.title}
          </h1>

          <div className="flex items-center gap-4 text-xs text-white/30 mb-8 pb-8 border-b border-white/5">
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
          <article>{renderContent(post.content)}</article>

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
          <div className="mt-10 grid grid-cols-2 gap-4">
            {prevPost ? (
              <Link
                href={`/blog/${prevPost.slug}`}
                className="glass-card rounded-2xl p-4 hover:border-white/12 transition-all group"
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
                className="glass-card rounded-2xl p-4 hover:border-white/12 transition-all group text-right"
              >
                <p className="text-[10px] text-white/25 uppercase tracking-widest mb-1 flex items-center gap-1 justify-end">
                  Next <ArrowRight className="w-3 h-3" />
                </p>
                <p className="text-sm font-bold text-white/70 group-hover:text-white transition-colors leading-snug">
                  {nextPost.title}
                </p>
              </Link>
            ) : <div />}
          </div>
        </div>
      </main>
    </>
  );
}
