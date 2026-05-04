import { MetadataRoute } from "next";

const BASE = "https://www.snowsense.app";

const cities = [
  "boston-ma", "chicago-il", "new-york-ny", "denver-co",
  "minneapolis-mn", "pittsburgh-pa", "buffalo-ny", "cleveland-oh",
  "detroit-mi", "philadelphia-pa", "washington-dc", "baltimore-md",
];

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: BASE, lastModified: now, changeFrequency: "hourly", priority: 1 },
    { url: `${BASE}/snow-day-calculator`, lastModified: now, changeFrequency: "daily", priority: 0.9 },
  ];

  const cityRoutes: MetadataRoute.Sitemap = cities.map((slug) => ({
    url: `${BASE}/snow-day-calculator/${slug}`,
    lastModified: now,
    changeFrequency: "hourly" as const,
    priority: 0.8,
  }));

  return [...staticRoutes, ...cityRoutes];
}
