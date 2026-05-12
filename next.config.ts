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
      // Scripts: allow self, inline (Next.js requires unsafe-inline), and trusted CDNs
      "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
      // Styles: allow self and inline (Tailwind/CSS-in-JS)
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      // Fonts
      "font-src 'self' https://fonts.gstatic.com",
      // Images: allow self, data URIs, and external weather tile providers
      "img-src 'self' data: blob: https://*.openstreetmap.org https://*.tile.openweathermap.org https://openweathermap.org",
      // API connections: Open-Meteo, NWS, geocoding
      "connect-src 'self' https://api.open-meteo.com https://api.openweathermap.org https://nominatim.openstreetmap.org https://api.weather.gov",
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
    optimizePackageImports: [],
  },
  async headers() {
    return [
      {
        // Apply security headers to all routes
        source: "/(.*)",
        headers: securityHeaders,
      },
    ];
  },
  async redirects() {
    return [
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
    ];
  },
};

export default nextConfig;
