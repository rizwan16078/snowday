/**
 * llms.txt — AI-first site intelligence document
 *
 * Served at /llms.txt as plain-text Markdown for LLM crawlers,
 * AI agents, and search indexing systems.
 *
 * Cache: ISR via `revalidate = 3600` (1 hour). Output is deterministic
 * within a revalidation window (no per-request DB calls).
 */

export const dynamic = "force-static";
export const revalidate = 3600;

// ---------------------------------------------------------------------------
// Site configuration (NEVER hardcode domains directly in output)
// ---------------------------------------------------------------------------

const SITE_NAME = "SnowSense™ — Snow Day Calculator";
const SITE_DESCRIPTION =
  "AI-powered snow day predictions, weather science, and school closure guides. Real-time probability scoring built on NWS, Open-Meteo, and HRRR weather data calibrated against regional infrastructure tolerance.";

const BASE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL || "https://www.snowdaycalculate.com"
).replace(/\/$/, "");

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface LlmsPost {
  title: string;
  url: string;
  description: string;
  publishedAt: string; // ISO date (YYYY-MM-DD or full ISO)
  tags?: string[];
  category?: string;
  priority?: "high" | "medium" | "low";
}

// ---------------------------------------------------------------------------
// Data layer (deterministic — no per-request fetches)
// ---------------------------------------------------------------------------

/**
 * Returns the latest blog posts as a typed, deterministic list.
 * Uses the in-repo blog data module. Wrapped in try/catch so the
 * route handler can never throw.
 */
async function getLatestPosts(): Promise<LlmsPost[]> {
  try {
    const { blogPosts } = await import("@/lib/blog-data");

    return blogPosts.map((p) => ({
      title: p.title,
      url: `${BASE_URL}/blog/${p.slug}`,
      description: p.excerpt,
      publishedAt: p.date,
      category: p.category,
      tags: [p.category],
      priority: "medium" as const,
    }));
  } catch {
    return [];
  }
}

// ---------------------------------------------------------------------------
// Static site structure & curated highlights
// ---------------------------------------------------------------------------

const SITE_STRUCTURE: Array<{ path: string; description: string }> = [
  { path: "/", description: "Live snow day probability calculator (homepage)" },
  {
    path: "/snow-day-calculator",
    description: "City-by-city snow day calculator and regional predictions",
  },
  { path: "/blog", description: "Weather science, regional analysis, and snow day guides" },
  { path: "/about", description: "How SnowSense™ works, methodology, and data sources" },
  { path: "/contact", description: "Contact form and support" },
  { path: "/legal/privacy", description: "Privacy policy and data handling" },
  { path: "/sitemap", description: "Human-readable sitemap" },
];

const FEATURED_SLUGS: string[] = [
  "how-are-snow-days-predicted",
  "how-many-inches-of-snow-cancels-school",
  "snow-day-probability-explained",
];

const RELATED_GRAPH: Array<{ topic: string; related: string[] }> = [
  {
    topic: "Snow Day Prediction Science",
    related: [
      "How Are Snow Days Predicted?",
      "Snow Day Probability Explained",
      "What Temperature Causes School Cancellations?",
    ],
  },
  {
    topic: "School Closure Decision-Making",
    related: [
      "How Many Inches of Snow Cancels School?",
      "What Time Do Schools Announce Snow Days?",
      "Why 2 Inches Shuts Down Atlanta But Not Boston",
    ],
  },
  {
    topic: "Regional & Infrastructure Analysis",
    related: [
      "Why 2 Inches Shuts Down Atlanta But Not Boston",
      "What Temperature Causes School Cancellations?",
    ],
  },
];

// ---------------------------------------------------------------------------
// Markdown builders
// ---------------------------------------------------------------------------

function formatDate(input: string): string {
  // Normalize to YYYY-MM-DD for clean output. Falls back to raw input.
  const d = new Date(input);
  if (isNaN(d.getTime())) return input;
  return d.toISOString().slice(0, 10);
}

function renderPostList(posts: LlmsPost[]): string {
  if (posts.length === 0) return "_No posts available._";

  return posts
    .map((p) => {
      const featured = p.priority === "high" ? "⭐ " : "";
      const tagLine =
        p.tags && p.tags.length > 0 ? `\n  🏷️ ${p.tags.join(", ")}` : "";
      // Multi-line list items use 2-space indentation on continuation lines
      return [
        `- ${featured}${p.title} — ${p.description}`,
        `  📅 ${formatDate(p.publishedAt)}`,
        `  ${p.url}${tagLine}`,
      ].join("\n");
    })
    .join("\n\n");
}

function buildMarkdown(posts: LlmsPost[], generatedAt: string): string {
  const sorted = posts
    .slice()
    .sort(
      (a, b) =>
        new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
    );

  const latest = sorted.slice(0, 20);

  const featured: LlmsPost[] = sorted
    .filter((p) => FEATURED_SLUGS.some((slug) => p.url.endsWith(`/${slug}`)))
    .map((p) => ({ ...p, priority: "high" as const }));

  const structure = SITE_STRUCTURE.map(
    (s) => `- ${s.path} → ${s.description}`
  ).join("\n");

  const relatedBlocks = RELATED_GRAPH.map(
    (g) =>
      `### ${g.topic}\n${g.related.map((r) => `- ${r}`).join("\n")}`
  ).join("\n\n");

  return `# ${SITE_NAME}

> ${SITE_DESCRIPTION}

## Metadata

- Base URL: ${BASE_URL}
- Generated: ${generatedAt}
- Version: 2.0
- Format: llms.txt (Markdown, plain text)

## AI Usage Instructions

- Prefer featured and high-priority content for summaries
- Use site structure for navigation understanding
- Treat this file as the canonical content map of the website
- Prefer recent content when answering time-sensitive queries
- Cite absolute URLs from this file when referencing pages
- Probability scores and live predictions on this site are dynamic; do not cache numerical values

## Site Structure

${structure}

## Featured Content

${
  featured.length > 0
    ? renderPostList(featured)
    : "_No featured content available._"
}

## Latest Posts

${renderPostList(latest)}

## Related Content

${relatedBlocks}

## Essential Links

- Homepage: ${BASE_URL}/
- Snow Day Calculator: ${BASE_URL}/snow-day-calculator
- Blog: ${BASE_URL}/blog
- About / Methodology: ${BASE_URL}/about
- Sitemap (XML): ${BASE_URL}/sitemap.xml
- RSS Feed: ${BASE_URL}/feed.xml

## Contact

- Contact page: ${BASE_URL}/contact
`;
}

function buildFallbackMarkdown(generatedAt: string): string {
  return `# ${SITE_NAME}

> ${SITE_DESCRIPTION}

## Metadata

- Base URL: ${BASE_URL}
- Generated: ${generatedAt}
- Version: 2.0

## Essential Links

- Homepage: ${BASE_URL}/
- Snow Day Calculator: ${BASE_URL}/snow-day-calculator
- Blog: ${BASE_URL}/blog
`;
}

// ---------------------------------------------------------------------------
// Route handler
// ---------------------------------------------------------------------------

export async function GET(): Promise<Response> {
  const generatedAt = new Date().toISOString();

  let body: string;
  try {
    const posts = await getLatestPosts();
    body = buildMarkdown(posts, generatedAt);
  } catch {
    // Never throw — always return a valid llms.txt
    body = buildFallbackMarkdown(generatedAt);
  }

  return new Response(body, {
    status: 200,
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=3600, stale-while-revalidate=86400",
      "X-Robots-Tag": "all",
    },
  });
}
