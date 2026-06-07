/// <reference lib="webworker" />

import {
  CacheFirst,
  ExpirationPlugin,
  NetworkOnly,
  Serwist,
  StaleWhileRevalidate,
} from "serwist";

declare global {
  interface WorkerGlobalScope {
    __SW_MANIFEST: Array<string | { url: string; revision?: string }> | undefined;
  }
}

declare const self: ServiceWorkerGlobalScope;

function isLocalHostname(hostname: string): boolean {
  if (hostname === "localhost" || hostname === "127.0.0.1" || hostname === "::1") {
    return true;
  }

  if (hostname.startsWith("192.168.") || hostname.startsWith("10.")) {
    return true;
  }

  return /^172\.(1[6-9]|2\d|3[0-1])\./.test(hostname);
}

const serwist = new Serwist({
  precacheEntries: self.__SW_MANIFEST,
  skipWaiting: true,
  clientsClaim: true,
  navigationPreload: true,
  runtimeCaching: [
    {
      // The home ("/") and "/prediction" routes are IP-personalized (the server
      // resolves the visitor's city from geo headers). They MUST NOT be served
      // from the service-worker cache: a cached copy serves a stale location to
      // the same visitor — or worse, one visitor's city to another. Always go to
      // the network so each request gets a fresh, correctly-geolocated render.
      matcher: ({ request, url }) =>
        !isLocalHostname(url.hostname) &&
        request.mode === "navigate" &&
        (url.pathname === "/prediction" || url.pathname === "/"),
      handler: new NetworkOnly(),
    },
    {
      matcher: ({ url }) => url.pathname.startsWith("/api/radar"),
      handler: new StaleWhileRevalidate({
        cacheName: "snowsense-radar",
        plugins: [
          new ExpirationPlugin({
            maxEntries: 24,
            maxAgeSeconds: 300,
          }),
        ],
      }),
    },
    {
      matcher: ({ request, url }) =>
        request.method === "GET" &&
        url.pathname.startsWith("/api/snow/geocode") &&
        url.searchParams.has("q"),
      handler: new StaleWhileRevalidate({
        cacheName: "snowsense-geocode-search",
        plugins: [
          new ExpirationPlugin({
            maxEntries: 20,
            maxAgeSeconds: 60 * 60 * 24,
          }),
        ],
      }),
    },
    {
      matcher: ({ request, url }) =>
        !isLocalHostname(url.hostname) && request.destination === "image",
      handler: new CacheFirst({
        cacheName: "snowsense-images",
        plugins: [
          new ExpirationPlugin({
            maxEntries: 48,
            maxAgeSeconds: 60 * 60 * 24 * 14,
          }),
        ],
      }),
    },
  ],
});

serwist.addEventListeners();

self.addEventListener("activate", (event) => {
  event.waitUntil(
    Promise.all([
      caches.delete("snowsense-geocode"),
      caches.delete("snowsense-assets"),
      caches.delete("snowsense-pages"),
    ])
  );
});
