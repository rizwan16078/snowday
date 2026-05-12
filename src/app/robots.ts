import { MetadataRoute } from "next";

const BASE = (
  process.env.NEXT_PUBLIC_SITE_URL || "https://www.snowdaycalculate.com"
).replace(/\/$/, "");

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/", "/llms.txt"],
        disallow: [
          // Internal API surface — not indexable
          "/api/",
          // Redirect-only routes (all 30x to /blog) — no SEO value
          "/discover/",
          "/discover",
          // Parameterized homepage / app-state variants
          "/*?loc=",
          "/*?daysUsed=",
          "/*?type=",
          // Next.js internals (defensive)
          "/_next/",
        ],
      },
    ],
    host: BASE,
    sitemap: `${BASE}/sitemap.xml`,
  };
}
