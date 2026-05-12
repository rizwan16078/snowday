import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        // Block parameterized homepage variants — these are app state, not indexable pages
        disallow: ["/*?loc=", "/*?daysUsed=", "/*?type="],
      },
    ],
    sitemap: "https://www.snowdaycalculate.com/sitemap.xml",
  };
}
