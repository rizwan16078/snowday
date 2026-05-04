import { NextRequest, NextResponse } from "next/server";
import {
  DEFAULT_LOCATION_SLUG,
  slugifyLocation,
} from "@/lib/location-resolver";

export const config = {
  matcher: ["/", "/prediction"],
};

export function proxy(request: NextRequest) {
  const requestHeaders = new Headers(request.headers);
  const city = request.headers.get("x-vercel-ip-city");
  const country = request.headers.get("x-vercel-ip-country");
  const region = request.headers.get("x-vercel-ip-country-region");
  const latitude = request.headers.get("x-vercel-ip-latitude");
  const longitude = request.headers.get("x-vercel-ip-longitude");
  const timezone = request.headers.get("x-vercel-ip-timezone");

  const resolvedSlug = city
    ? slugifyLocation(`${decodeURIComponent(city)}-${country || "US"}`)
    : DEFAULT_LOCATION_SLUG;

  requestHeaders.set("x-resolved-loc", resolvedSlug);
  requestHeaders.set("x-resolved-tz", timezone || "UTC");

  if (city) requestHeaders.set("x-resolved-city", decodeURIComponent(city));
  if (country) requestHeaders.set("x-resolved-country", country);
  if (region) requestHeaders.set("x-resolved-state", region);
  if (latitude) requestHeaders.set("x-resolved-lat", latitude);
  if (longitude) requestHeaders.set("x-resolved-lon", longitude);

  return NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });
}
