import { MetadataRoute } from "next";
import { getAllSlugs } from "@/lib/blog-data";

const BASE = "https://www.snowdaycalculate.com";

const cities = [
  // Northeast
  "new-york-ny", "boston-ma", "philadelphia-pa", "hartford-ct",
  "albany-ny", "portland-me",
  // Midwest
  "chicago-il", "detroit-mi", "minneapolis-mn", "milwaukee-wi",
  "cleveland-oh", "indianapolis-in",
  // Mountain & West
  "denver-co", "salt-lake-city-ut", "seattle-wa", "portland-or",
  "anchorage-ak", "boise-id",
  // Southeast
  "washington-dc", "charlotte-nc", "atlanta-ga", "nashville-tn",
  "richmond-va", "raleigh-nc",
  // Additional high-traffic
  "pittsburgh-pa", "buffalo-ny", "baltimore-md",
];

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: BASE, lastModified: now, changeFrequency: "hourly", priority: 1 },
    { url: `${BASE}/snow-day-calculator`, lastModified: now, changeFrequency: "daily", priority: 0.9 },
    { url: `${BASE}/about`, lastModified: now, changeFrequency: "monthly", priority: 0.5 },
    { url: `${BASE}/contact`, lastModified: now, changeFrequency: "monthly", priority: 0.4 },
    { url: `${BASE}/legal/privacy`, lastModified: now, changeFrequency: "yearly", priority: 0.3 },
    { url: `${BASE}/sitemap`, lastModified: now, changeFrequency: "monthly", priority: 0.3 },
    { url: `${BASE}/blog`, lastModified: now, changeFrequency: "weekly", priority: 0.7 },
  ];

  const blogRoutes: MetadataRoute.Sitemap = getAllSlugs().map((slug) => ({
    url: `${BASE}/blog/${slug}`,
    lastModified: now,
    changeFrequency: "monthly" as const,
    priority: 0.6,
  }));

  const cityRoutes: MetadataRoute.Sitemap = cities.map((slug) => ({
    url: `${BASE}/snow-day-calculator/${slug}`,
    lastModified: now,
    changeFrequency: "hourly" as const,
    priority: 0.8,
  }));

  return [...staticRoutes, ...blogRoutes, ...cityRoutes];
}
