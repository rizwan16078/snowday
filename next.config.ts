import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  transpilePackages: ["lucide-react"],
  // Prevent framer-motion from being webpack-bundled on the server.
  // It's ESM-native (v12+) and bundling it creates a circular dependency
  // with Next.js's vendored React, causing `null.useContext` during prerender.
  serverExternalPackages: ["framer-motion"],
  experimental: {
    optimizePackageImports: [],
  },
  webpack: (config) => {
    // Force every module to resolve the same React instance.
    // Prevents dual-React issues from third-party packages with their own
    // internal React copies.
    config.resolve.alias = {
      ...config.resolve.alias,
      react: path.resolve("./node_modules/react"),
      "react-dom": path.resolve("./node_modules/react-dom"),
    };
    return config;
  },
};

export default nextConfig;
