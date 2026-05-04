/**
 * GET /api/snow/geocode?q=Boston+MA
 * POST /api/snow/geocode  { lat, lon }  → reverse geocode
 */

import { NextRequest, NextResponse } from "next/server";
import { geocodeSearch, reverseGeocode } from "@/lib/geocoding";

export const runtime = "edge";

export async function GET(req: NextRequest) {
  const query = req.nextUrl.searchParams.get("q");
  if (!query || query.trim().length < 2) {
    return NextResponse.json({ error: "Query too short" }, { status: 400 });
  }

  const results = await geocodeSearch(query.trim());
  return NextResponse.json(results, {
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
