import { MetadataRoute } from "next";
import { blogPosts, getAllSlugs } from "@/lib/blog-data";
import { ALL_CITIES, getAllStateSlugs } from "@/lib/cities/helpers";
import { ALL_DISTRICTS } from "@/lib/districts/helpers";

const BASE = (
  process.env.NEXT_PUBLIC_SITE_URL || "https://www.snowdaycalculate.com"
).replace(/\/$/, "");

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  // Top-level / evergreen pages
  const staticRoutes: MetadataRoute.Sitemap = [
    { url: BASE, lastModified: now, changeFrequency: "hourly", priority: 1 },
    { url: `${BASE}/snow-day-calculator`, lastModified: now, changeFrequency: "daily", priority: 0.9 },
    { url: `${BASE}/weather`, lastModified: now, changeFrequency: "hourly", priority: 0.9 },
    { url: `${BASE}/prediction`, lastModified: now, changeFrequency: "hourly", priority: 0.8 },
    { url: `${BASE}/weather-guide`, lastModified: now, changeFrequency: "weekly", priority: 0.8 },
    { url: `${BASE}/weather-terms`, lastModified: now, changeFrequency: "weekly", priority: 0.7 },
    { url: `${BASE}/blog`, lastModified: now, changeFrequency: "weekly", priority: 0.7 },
    { url: `${BASE}/about`, lastModified: now, changeFrequency: "monthly", priority: 0.5 },
    { url: `${BASE}/contact`, lastModified: now, changeFrequency: "monthly", priority: 0.4 },
    { url: `${BASE}/sitemap`, lastModified: now, changeFrequency: "monthly", priority: 0.3 },
    { url: `${BASE}/legal/privacy`, lastModified: now, changeFrequency: "yearly", priority: 0.3 },
    { url: `${BASE}/legal/terms`, lastModified: now, changeFrequency: "yearly", priority: 0.3 },
  ];

  // Blog posts — use publish date as lastmod so Google prioritizes fresh content
  const postBySlug = new Map(blogPosts.map((p) => [p.slug, p]));
  const blogRoutes: MetadataRoute.Sitemap = getAllSlugs().map((slug) => {
    const post = postBySlug.get(slug);
    const lastModified = post?.date ? new Date(post.date) : now;
    return {
      url: `${BASE}/blog/${slug}`,
      lastModified,
      changeFrequency: "monthly" as const,
      priority: 0.6,
    };
  });

  // City pages — all 480 cities from the catalog (previously only 27).
  // Sort by population so Google Search Console sees high-traffic targets first.
  const cityRoutes: MetadataRoute.Sitemap = [...ALL_CITIES]
    .sort((a, b) => b.population - a.population)
    .map((c) => ({
      url: `${BASE}/snow-day-calculator/${c.slug}`,
      lastModified: now,
      changeFrequency: "hourly" as const,
      // Top-50 cities get priority 0.8; the long tail gets 0.6 so Google
      // spends crawl budget on the valuable pages first.
      priority: c.population > 200_000 ? 0.8 : 0.6,
    }));

  // State hub pages — one per covered state.
  const stateRoutes: MetadataRoute.Sitemap = getAllStateSlugs().map((slug) => ({
    url: `${BASE}/snow-day-calculator/state/${slug}`,
    lastModified: now,
    changeFrequency: "daily" as const,
    priority: 0.7,
  }));

  // School-district pages — high-intent specific queries ("[district] snow day").
  // Priority 0.75 — between general state hubs (0.7) and top-50 cities (0.8)
  // because district pages target very specific queries with high CTR.
  const districtRoutes: MetadataRoute.Sitemap = ALL_DISTRICTS.map((d) => ({
    url: `${BASE}/school-district/${d.slug}`,
    lastModified: now,
    changeFrequency: "hourly" as const,
    priority: 0.75,
  }));

  return [
    ...staticRoutes,
    ...blogRoutes,
    ...stateRoutes,
    ...districtRoutes,
    ...cityRoutes,
  ];
}
