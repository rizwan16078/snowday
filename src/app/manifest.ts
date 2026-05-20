import type { MetadataRoute } from "next";

/**
 * Web App Manifest.
 *
 * Notes for PWA install UX:
 *   - `start_url` is "/" (the canonical landing) so installs open the latest
 *     city/state forecast a user can deep-link to via query params.
 *   - `scope` is "/" so installed instances cover the whole app.
 *   - `display: standalone` makes the installed app feel native.
 *   - Icons declare `purpose: "any maskable"`. The SVG is treated as both.
 *     If we later ship 192/512 PNG with a safe area, replace this entry.
 */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "SnowSense Snow Day Calculator",
    short_name: "SnowSense",
    description:
      "Live snow day predictions for 480+ US cities. Real-time forecast probability calibrated to local closure thresholds, updated every 30 minutes.",
    start_url: "/",
    scope: "/",
    display: "standalone",
    orientation: "portrait",
    background_color: "#050a14",
    theme_color: "#050a14",
    lang: "en-US",
    dir: "ltr",
    categories: ["education", "weather", "utilities"],
    icons: [
      {
        src: "/logo.svg",
        sizes: "any",
        type: "image/svg+xml",
        purpose: "any",
      },
    ],
  };
}
