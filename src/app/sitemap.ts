import { MetadataRoute } from "next";
import { blogPosts, getAllSlugs, isBlogPostNoindex } from "@/lib/blog-data";
import { ALL_CITIES, getAllStateSlugs } from "@/lib/cities/helpers";
import { ALL_DISTRICTS } from "@/lib/districts/helpers";
import { GLOSSARY_TERMS } from "@/lib/glossary-data";
import { getTopCitiesByPopulation } from "@/lib/cities/helpers";

const BASE = (
  process.env.NEXT_PUBLIC_SITE_URL || "https://www.snowdaycalculate.com"
).replace(/\/$/, "");

// Deterministic "last modified" for static pages — updated when content changes.
// Using a fixed date avoids every deploy resetting all lastModified stamps,
// which teaches Google these pages don't change every build.
const SITE_LAST_UPDATED = new Date("2025-05-20");

export default function sitemap(): MetadataRoute.Sitemap {
  // ── Top-level / evergreen pages ──────────────────────────────────────────
  // Priority rationale (SEO veteran rules):
  //   1.0  = homepage (always highest)
  //   0.9  = primary conversion / tool pages
  //   0.8  = high-traffic content hubs
  //   0.7  = supporting content pages
  //   0.5  = utility / trust pages
  //   0.3  = legal / low-traffic
  const staticRoutes: MetadataRoute.Sitemap = [
    { url: BASE, lastModified: SITE_LAST_UPDATED, changeFrequency: "hourly", priority: 1.0 },
    { url: `${BASE}/snow-day-calculator`, lastModified: SITE_LAST_UPDATED, changeFrequency: "daily", priority: 0.9 },
    { url: `${BASE}/weather`, lastModified: SITE_LAST_UPDATED, changeFrequency: "hourly", priority: 0.9 },
    { url: `${BASE}/weather-guide`, lastModified: SITE_LAST_UPDATED, changeFrequency: "weekly", priority: 0.8 },
    { url: `${BASE}/weather-terms`, lastModified: SITE_LAST_UPDATED, changeFrequency: "weekly", priority: 0.8 },
    { url: `${BASE}/blog`, lastModified: SITE_LAST_UPDATED, changeFrequency: "daily", priority: 0.8 },
    { url: `${BASE}/about`, lastModified: SITE_LAST_UPDATED, changeFrequency: "monthly", priority: 0.6 },
    { url: `${BASE}/contact`, lastModified: SITE_LAST_UPDATED, changeFrequency: "monthly", priority: 0.5 },
    { url: `${BASE}/team`, lastModified: SITE_LAST_UPDATED, changeFrequency: "monthly", priority: 0.5 },
    { url: `${BASE}/sitemap`, lastModified: SITE_LAST_UPDATED, changeFrequency: "monthly", priority: 0.3 },
    { url: `${BASE}/legal/privacy`, lastModified: SITE_LAST_UPDATED, changeFrequency: "yearly", priority: 0.3 },
    { url: `${BASE}/legal/terms`, lastModified: SITE_LAST_UPDATED, changeFrequency: "yearly", priority: 0.3 },
    { url: `${BASE}/legal/editorial-guidelines`, lastModified: SITE_LAST_UPDATED, changeFrequency: "yearly", priority: 0.3 },
    { url: `${BASE}/wind-chill-chart`, lastModified: SITE_LAST_UPDATED, changeFrequency: "monthly", priority: 0.8 },
    { url: `${BASE}/school-closings`, lastModified: SITE_LAST_UPDATED, changeFrequency: "hourly", priority: 0.9 },
    { url: `${BASE}/snow-day-history`, lastModified: SITE_LAST_UPDATED, changeFrequency: "monthly", priority: 0.7 },
    { url: `${BASE}/snow-day-activities`, lastModified: SITE_LAST_UPDATED, changeFrequency: "monthly", priority: 0.7 },
  ];

  // ── Blog posts ───────────────────────────────────────────────────────────
  // Use publish date as lastModified so Google prioritizes fresh content.
  // Featured / pillar posts get higher priority for crawl budget efficiency.
  const PILLAR_SLUGS = new Set([
    "how-are-snow-days-predicted",
    "how-many-inches-of-snow-cancels-school",
    "snow-day-probability-explained",
  ]);

  const postBySlug = new Map(blogPosts.map((p) => [p.slug, p]));
  const blogRoutes: MetadataRoute.Sitemap = getAllSlugs().filter(slug => !isBlogPostNoindex(slug)).map((slug) => {
    const post = postBySlug.get(slug);
    const lastModified = post?.date ? new Date(post.date) : SITE_LAST_UPDATED;
    const isPillar = PILLAR_SLUGS.has(slug);
    return {
      url: `${BASE}/blog/${slug}`,
      lastModified,
      changeFrequency: (isPillar ? "weekly" : "monthly") as MetadataRoute.Sitemap[number]["changeFrequency"],
      priority: isPillar ? 0.8 : 0.6,
      images: post?.image ? [post.image] : undefined,
    };
  });

  // ── City pages ───────────────────────────────────────────────────────────
  // Sort by population so Google Search Console sees high-traffic targets first.
  // Top-50 metro areas (pop > 200k) get priority 0.8 — these are the pages
  // that rank for "[city] snow day" and drive the bulk of organic traffic.
  // Mid-tier cities (50k–200k) get 0.7. Long tail gets 0.6.
  const cityRoutes: MetadataRoute.Sitemap = [...ALL_CITIES]
    .sort((a, b) => b.population - a.population)
    .map((c) => ({
      url: `${BASE}/snow-day-calculator/${c.slug}`,
      lastModified: SITE_LAST_UPDATED,
      changeFrequency: "hourly" as const,
      priority: c.population > 200_000 ? 0.8 : c.population > 50_000 ? 0.7 : 0.6,
    }));

  // ── State hub pages ──────────────────────────────────────────────────────
  // State pages target "[state] snow day calculator" — high-volume head terms.
  const stateRoutes: MetadataRoute.Sitemap = getAllStateSlugs().map((slug) => ({
    url: `${BASE}/snow-day-calculator/state/${slug}`,
    lastModified: SITE_LAST_UPDATED,
    changeFrequency: "daily" as const,
    priority: 0.7,
  }));

  // ── School-district pages ───────────────────────────────────────────────
  // District pages target "[district] snow day" — very specific, high CTR.
  // Priority 0.75 — between state hubs (0.7) and top-50 cities (0.8).
  const districtRoutes: MetadataRoute.Sitemap = ALL_DISTRICTS.map((d) => ({
    url: `${BASE}/school-district/${d.slug}`,
    lastModified: SITE_LAST_UPDATED,
    changeFrequency: "hourly" as const,
    priority: 0.75,
  }));

  // ── Glossary term pages ──────────────────────────────────────────────────
  // Individual term pages target definition featured snippets.
  const glossaryRoutes: MetadataRoute.Sitemap = GLOSSARY_TERMS.map((t) => ({
    url: `${BASE}/weather-terms/${t.slug}`,
    lastModified: SITE_LAST_UPDATED,
    changeFrequency: "monthly" as const,
    priority: 0.6,
  }));

  // ── School closings by state ─────────────────────────────────────────────
  // State-level closings pages target "school closings [state]" queries.
  const closingsStateRoutes: MetadataRoute.Sitemap = getAllStateSlugs().map((slug) => ({
    url: `${BASE}/school-closings/${slug}`,
    lastModified: SITE_LAST_UPDATED,
    changeFrequency: "hourly" as const,
    priority: 0.7,
  }));

  // ── Wind chill by city ──────────────────────────────────────────────────
  // City-level wind chill pages target "wind chill [city]" queries.
  const windChillRoutes: MetadataRoute.Sitemap = getTopCitiesByPopulation(100).map((c) => ({
    url: `${BASE}/wind-chill-chart/${c.slug}`,
    lastModified: SITE_LAST_UPDATED,
    changeFrequency: "hourly" as const,
    priority: c.population > 200_000 ? 0.7 : 0.6,
  }));

  // ── Snow day history by state ────────────────────────────────────────────
  // State-level history pages target "biggest snowstorm [state]" queries.
  const historyStateRoutes: MetadataRoute.Sitemap = getAllStateSlugs().map((slug) => ({
    url: `${BASE}/snow-day-history/${slug}`,
    lastModified: SITE_LAST_UPDATED,
    changeFrequency: "monthly" as const,
    priority: 0.6,
  }));

  // ── School closings by city ──────────────────────────────────────────────
  // City-level closings pages target "is school closed in [city]" queries.
  const closingsCityRoutes: MetadataRoute.Sitemap = getTopCitiesByPopulation(100).map((c) => ({
    url: `${BASE}/school-closings/city/${c.slug}`,
    lastModified: SITE_LAST_UPDATED,
    changeFrequency: "hourly" as const,
    priority: c.population > 200_000 ? 0.7 : 0.6,
  }));

  // ── Snow day history by city ─────────────────────────────────────────────
  // City-level history pages target "biggest snowstorm in [city]" queries.
  const historyCityRoutes: MetadataRoute.Sitemap = getTopCitiesByPopulation(100).map((c) => ({
    url: `${BASE}/snow-day-history/city/${c.slug}`,
    lastModified: SITE_LAST_UPDATED,
    changeFrequency: "monthly" as const,
    priority: c.population > 200_000 ? 0.6 : 0.5,
  }));

  // ── Wind chill by state ──────────────────────────────────────────────────
  // State-level wind chill hub pages target "wind chill [state]" queries.
  const windChillStateRoutes: MetadataRoute.Sitemap = getAllStateSlugs().map((slug) => ({
    url: `${BASE}/wind-chill-chart/state/${slug}`,
    lastModified: SITE_LAST_UPDATED,
    changeFrequency: "daily" as const,
    priority: 0.6,
  }));

  // ── Glossary category pages ──────────────────────────────────────────────
  // Category hub pages target "[category] weather terms" queries.
  const GLOSSARY_CATEGORIES = ["snow", "cold", "weather-science", "storm", "atmospheric", "phenomenon", "safety"];
  const glossaryCategoryRoutes: MetadataRoute.Sitemap = GLOSSARY_CATEGORIES.map((cat) => ({
    url: `${BASE}/weather-terms/category/${cat}`,
    lastModified: SITE_LAST_UPDATED,
    changeFrequency: "monthly" as const,
    priority: 0.6,
  }));

  // ── Blog category hub pages ──────────────────────────────────────────────
  const blogCategoryRoutes: MetadataRoute.Sitemap = [
    "snow-day-guide",
    "weather-science",
    "regional-analysis",
    "winter-preparedness",
    "weather-health",
  ].map(cat => ({
    url: `${BASE}/blog/category/${cat}`,
    lastModified: SITE_LAST_UPDATED,
    changeFrequency: "weekly" as const,
    priority: 0.7,
  }));

  return [
    ...staticRoutes,
    ...blogRoutes,
    ...blogCategoryRoutes,
    ...stateRoutes,
    ...districtRoutes,
    ...glossaryRoutes,
    ...glossaryCategoryRoutes,
    ...closingsStateRoutes,
    ...closingsCityRoutes,
    ...windChillRoutes,
    ...windChillStateRoutes,
    ...historyStateRoutes,
    ...historyCityRoutes,
    ...cityRoutes,
  ];
}
