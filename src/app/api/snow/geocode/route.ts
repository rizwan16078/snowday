/**
 * GET /api/snow/geocode?q=Boston+MA
 * POST /api/snow/geocode  { lat, lon }  → reverse geocode
 */

import { NextRequest, NextResponse } from "next/server";
import {
  detectLocationFromHeaders,
  detectLocationFromIP,
  geocodeSearch,
  getForwardedPublicIp,
  reverseGeocode,
} from "@/lib/geocoding";
import { matchCatalogCity } from "@/lib/cities/helpers";

export const runtime = "edge";

function isLocalRequest(req: NextRequest): boolean {
  const hostname = req.nextUrl.hostname;

  if (hostname === "localhost" || hostname === "127.0.0.1" || hostname === "::1") {
    return true;
  }

  if (hostname.startsWith("192.168.") || hostname.startsWith("10.")) {
    return true;
  }

  return /^172\.(1[6-9]|2\d|3[0-1])\./.test(hostname);
}

export async function GET(req: NextRequest) {
  const query = req.nextUrl.searchParams.get("q");
  const detectMode = req.nextUrl.searchParams.get("detect");
  const isFallback = req.nextUrl.searchParams.get("fallback") === "1";

  if (!query || detectMode === "ip") {
    // When fallback=1, skip Vercel headers (client already tried that path)
    // and go straight to IP-based detection which includes ip-api.com fallback
    if (!isFallback) {
      const headerLocation = detectLocationFromHeaders(req.headers);
      if (headerLocation) {
        return NextResponse.json(headerLocation, {
          headers: { "Cache-Control": "private, no-store" },
        });
      }
    }

    const forwardedIp = getForwardedPublicIp(req.headers);
    const fallbackLocation = forwardedIp
      ? await detectLocationFromIP(forwardedIp)
      : isLocalRequest(req)
        ? await detectLocationFromIP()
        : null;

    return NextResponse.json(fallbackLocation, {
      headers: { "Cache-Control": "private, no-store" },
    });
  }

  if (query.trim().length < 2) {
    return NextResponse.json({ error: "Query too short" }, { status: 400 });
  }

  const results = await geocodeSearch(query.trim());
  // Tag results that have a canonical /snow-day-calculator/[slug] page so the
  // client can route there (richer content + stronger SEO) instead of the home
  // ?loc= param. Exact name+state match only — display fields are left intact.
  const tagged = results.map((r) => {
    const match = matchCatalogCity(r.city, r.state);
    return match ? { ...r, slug: match.slug, isCatalogCity: true } : r;
  });
  return NextResponse.json(tagged, {
    headers: {
      "Cache-Control": "public, s-maxage=86400, stale-while-revalidate=604800",
    },
  });
}

export async function POST(req: NextRequest) {
  const { lat, lon } = await req.json();
  if (typeof lat !== "number" || typeof lon !== "number") {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }

  const result = await reverseGeocode(lat, lon);
  return NextResponse.json(result, {
    headers: { "Cache-Control": "public, s-maxage=86400" },
  });
}
