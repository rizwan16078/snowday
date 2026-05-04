import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "SnowSense Prediction Intelligence",
    short_name: "SnowSense",
    description:
      "Offline-capable snow day prediction intelligence with cached radar and last-known prediction state.",
    start_url: "/prediction",
    display: "standalone",
    background_color: "#050a14",
    theme_color: "#050a14",
    icons: [
      {
        src: "/icon.svg",
        sizes: "512x512",
        type: "image/svg+xml",
      },
    ],
  };
}
