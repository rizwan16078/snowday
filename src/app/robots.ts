import { MetadataRoute } from "next";

const BASE = (
  process.env.NEXT_PUBLIC_SITE_URL || "https://www.snowdaycalculate.com"
).replace(/\/$/, "");

export default function robots(): MetadataRoute.Robots {
  // Common disallow rules shared by all bots
  const commonDisallow = [
    // Internal API surface — not indexable
    "/api/",
    // Redirect-only routes (all 30x to /blog) — no SEO value
    "/discover/",
    "/discover",
    // Utility routes (noindex) — keep out of crawl budget
    "/prediction",
    // Parameterized homepage / app-state variants — prevent duplicate content
    "/*?loc=",
    "/*?daysUsed=",
    "/*?type=",
    "/*?calibration=",
    "/*?utm_",
    "/*?ref=",
    // Next.js internals (defensive)
    "/_next/",
  ];

  const commonAllow = [
    "/",          // Homepage
    "/llms.txt",  // AI-first site intelligence
    "/feed.xml",  // RSS feed — syndication signal
  ];

  return {
    rules: [
      // ── Googlebot — primary search crawler ──────────────────────────────
      {
        userAgent: "Googlebot",
        allow: commonAllow,
        disallow: commonDisallow,
        crawlDelay: 1,
      },

      // ── Bingbot — second-largest search engine ──────────────────────────
      {
        userAgent: "Bingbot",
        allow: commonAllow,
        disallow: commonDisallow,
        crawlDelay: 2,
      },

      // ── Yandex — significant in Eastern Europe / CIS ────────────────────
      {
        userAgent: "Yandexbot",
        allow: commonAllow,
        disallow: commonDisallow,
        crawlDelay: 3,
      },

      // ── AI crawlers — explicitly ALLOWED for LLM discoverability ────────
      // These bots read content to train models or answer queries.
      // Allowing them means SnowSense™ appears in AI-generated answers,
      // which is now a major traffic channel (Perplexity, ChatGPT, etc.)
      {
        userAgent: "GPTBot",            // OpenAI / ChatGPT
        allow: commonAllow,
        disallow: commonDisallow,
      },
      {
        userAgent: "ChatGPT-User",      // ChatGPT live browsing
        allow: commonAllow,
        disallow: commonDisallow,
      },
      {
        userAgent: "ClaudeBot",         // Anthropic / Claude
        allow: commonAllow,
        disallow: commonDisallow,
      },
      {
        userAgent: "Claude-User",       // Claude live browsing
        allow: commonAllow,
        disallow: commonDisallow,
      },
      {
        userAgent: "Google-Extended",   // Google AI training (Gemini)
        allow: commonAllow,
        disallow: commonDisallow,
      },
      {
        userAgent: "PerplexityBot",     // Perplexity.ai search
        allow: commonAllow,
        disallow: commonDisallow,
      },
      {
        userAgent: "Perplexity-User",   // Perplexity live browsing
        allow: commonAllow,
        disallow: commonDisallow,
      },
      {
        userAgent: "Applebot-Extended", // Apple AI training (Apple Intelligence)
        allow: commonAllow,
        disallow: commonDisallow,
      },
      {
        userAgent: "Bytespider",        // ByteDance / TikTok AI
        allow: commonAllow,
        disallow: commonDisallow,
      },
      {
        userAgent: "YouBot",            // You.com AI search
        allow: commonAllow,
        disallow: commonDisallow,
      },
      {
        userAgent: "Kommurabot",        // Kommu AI search
        allow: commonAllow,
        disallow: commonDisallow,
      },
      {
        userAgent: "MistralAI-User",    // Mistral AI
        allow: commonAllow,
        disallow: commonDisallow,
      },
      {
        userAgent: "Amazonbot",         // Amazon AI training
        allow: commonAllow,
        disallow: commonDisallow,
      },

      // ── Social / SEO tool crawlers ──────────────────────────────────────
      {
        userAgent: "Facebot",           // Facebook crawler
        allow: commonAllow,
        disallow: commonDisallow,
      },
      {
        userAgent: "Twitterbot",        // Twitter/X card crawler
        allow: commonAllow,
        disallow: commonDisallow,
      },
      {
        userAgent: "LinkedInBot",       // LinkedIn preview
        allow: commonAllow,
        disallow: commonDisallow,
      },

      // ── Catch-all (everything else) ─────────────────────────────────────
      {
        userAgent: "*",
        allow: commonAllow,
        disallow: commonDisallow,
        crawlDelay: 2,
      },
    ],
    host: BASE,
    sitemap: `${BASE}/sitemap.xml`,
  };
}
