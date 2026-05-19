import type { NextConfig } from "next";

const securityHeaders = [
  // Prevent MIME-type sniffing
  {
    key: "X-Content-Type-Options",
    value: "nosniff",
  },
  // Prevent the site from being embedded in iframes (clickjacking protection)
  {
    key: "X-Frame-Options",
    value: "SAMEORIGIN",
  },
  // Control how much referrer info is sent
  {
    key: "Referrer-Policy",
    value: "strict-origin-when-cross-origin",
  },
  // Content Security Policy — allows weather APIs, fonts, images, and scripts
  {
    key: "Content-Security-Policy",
    value: [
      "default-src 'self'",
      // Scripts: allow self, inline (Next.js requires unsafe-inline), GA, and trusted CDNs
      "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://www.googletagmanager.com https://www.google-analytics.com",
      // Styles: allow self and inline (Tailwind/CSS-in-JS)
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      // Fonts
      "font-src 'self' https://fonts.gstatic.com",
      // Images: allow self, data URIs, GA tracking pixel, and external weather tile providers
      "img-src 'self' data: blob: https://*.openstreetmap.org https://*.tile.openweathermap.org https://openweathermap.org https://www.google-analytics.com https://www.googletagmanager.com",
      // API connections: Open-Meteo, NWS, geocoding, GA
      "connect-src 'self' https://api.open-meteo.com https://api.openweathermap.org https://nominatim.openstreetmap.org https://api.weather.gov https://ipapi.co http://ip-api.com https://www.google-analytics.com",
      // Frames: disallow all
      "frame-src 'none'",
      // Media
      "media-src 'self'",
      // Form submissions: self only
      "form-action 'self'",
      // Base URI restriction
      "base-uri 'self'",
    ].join("; "),
  },
];

const nextConfig: NextConfig = {
  reactStrictMode: false,
  trailingSlash: false,
  experimental: {
    // Per-symbol tree-shaking for these packages. Without this, importing a few
    // icons from lucide-react or a few APIs from framer-motion pulls the entire
    // barrel into client chunks. With it, only the named imports ship.
    optimizePackageImports: ["lucide-react", "framer-motion"],
  },
  async headers() {
    return [
      {
        // Apply security headers to all routes
        source: "/(.*)",
        headers: securityHeaders,
      },
      {
        // Long-cache for static branded assets in /public (svg/png/jpg/ico/webp/avif).
        // 1 year immutable — filenames are stable; rename or rev-version on visual changes
        // to invalidate. This satisfies Lighthouse "Use efficient cache lifetimes".
        source: "/:path*.(svg|png|jpg|jpeg|gif|webp|avif|ico)",
        headers: [
          { key: "Cache-Control", value: "public, max-age=31536000, immutable" },
        ],
      },
      {
        // Next.js build artifacts have content-hashed filenames — safe to cache
        // for 1 year and mark immutable. Reduces 404s for crawler-cached HTML
        // that references old chunk hashes across deployments.
        source: "/_next/static/:path*",
        headers: [
          { key: "Cache-Control", value: "public, max-age=31536000, immutable" },
        ],
      },
      {
        // Service worker must never be cached aggressively
        source: "/sw.js",
        headers: [
          { key: "Cache-Control", value: "public, max-age=0, must-revalidate" },
        ],
      },
    ];
  },
  async redirects() {
    return [
      // Apex (non-www) → www canonical host. Permanent (308) so search engines
      // consolidate link equity onto the canonical hostname. Defensive — the
      // host edge layer may already redirect, but a `307` from the edge does
      // not preserve PageRank; this rule guarantees 308 if requests ever reach
      // the Next runtime with the apex host.
      {
        source: "/:path*",
        has: [{ type: "host", value: "snowdaycalculate.com" }],
        destination: "https://www.snowdaycalculate.com/:path*",
        permanent: true,
      },
      {
        source: "/about-us",
        destination: "/about",
        permanent: true,
      },
      {
        source: "/contact-us",
        destination: "/contact",
        permanent: true,
      },
      // Legacy CMS-style entry URLs → home. Some SEO auditors specifically
      // check that index.php / index.html resolve rather than 403/404.
      {
        source: "/index.php",
        destination: "/",
        permanent: true,
      },
      {
        source: "/index.html",
        destination: "/",
        permanent: true,
      },
      {
        source: "/home",
        destination: "/",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
