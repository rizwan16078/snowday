/// <reference lib="webworker" />

import {
  CacheFirst,
  ExpirationPlugin,
  NetworkFirst,
  Serwist,
  StaleWhileRevalidate,
} from "serwist";

declare global {
  interface WorkerGlobalScope {
    __SW_MANIFEST: Array<string | { url: string; revision?: string }> | undefined;
  }
}

declare const self: ServiceWorkerGlobalScope;

const serwist = new Serwist({
  precacheEntries: self.__SW_MANIFEST,
  skipWaiting: true,
  clientsClaim: true,
  navigationPreload: true,
  runtimeCaching: [
    {
      matcher: ({ request, url }) =>
        request.mode === "navigate" &&
        (url.pathname === "/prediction" || url.pathname === "/"),
      handler: new NetworkFirst({
        cacheName: "snowsense-pages",
        networkTimeoutSeconds: 4,
        plugins: [
          new ExpirationPlugin({
            maxEntries: 6,
            maxAgeSeconds: 60 * 60 * 24,
          }),
        ],
      }),
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
      matcher: ({ url }) => url.pathname.startsWith("/api/snow/geocode"),
      handler: new StaleWhileRevalidate({
        cacheName: "snowsense-geocode",
        plugins: [
          new ExpirationPlugin({
            maxEntries: 20,
            maxAgeSeconds: 60 * 60 * 24,
          }),
        ],
      }),
    },
    {
      matcher: ({ request }) =>
        request.destination === "script" ||
        request.destination === "style" ||
        request.destination === "worker",
      handler: new StaleWhileRevalidate({
        cacheName: "snowsense-assets",
      }),
    },
    {
      matcher: ({ request }) => request.destination === "image",
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
