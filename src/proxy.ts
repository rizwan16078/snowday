import { NextRequest, NextResponse } from "next/server";
import {
  DEFAULT_LOCATION_SLUG,
  slugifyLocation,
} from "@/lib/location-resolver";

export const config = {
  matcher: ["/", "/prediction", "/weather"],
};

interface ProxyGeoLookup {
  city: string;
  country: string;
  region: string;
  latitude: string;
  longitude: string;
  timezone: string;
}

function firstForwardedIp(value: string | null): string | null {
  if (!value) return null;
  const candidate = value.split(",")[0]?.trim();
  return candidate || null;
}

function isPublicIp(ip: string | null): ip is string {
  if (!ip) return false;
  if (ip === "::1" || ip === "127.0.0.1") return false;
  if (ip.startsWith("10.") || ip.startsWith("192.168.") || ip.startsWith("169.254.")) {
    return false;
  }
  if (/^172\.(1[6-9]|2\d|3[0-1])\./.test(ip)) return false;
  if (ip.startsWith("fc") || ip.startsWith("fd")) return false;
  return true;
}

async function lookupGeoFromIp(ip: string): Promise<ProxyGeoLookup | null> {
  try {
    const response = await fetch(`https://ipapi.co/${encodeURIComponent(ip)}/json/`, {
      cache: "no-store",
    });
    if (!response.ok) return null;

    const data = await response.json();
    if (!data || !data.city || !data.latitude || !data.longitude) {
      return null;
    }

    return {
      city: String(data.city),
      country: String(data.country_code || data.country || "US"),
      region: String(data.region_code || data.region || ""),
      latitude: String(data.latitude),
      longitude: String(data.longitude),
      timezone: String(data.timezone || "UTC"),
    };
  } catch {
    return null;
  }
}

export async function proxy(request: NextRequest) {
  const requestHeaders = new Headers(request.headers);
  let city = request.headers.get("x-vercel-ip-city");
  let country = request.headers.get("x-vercel-ip-country");
  let region = request.headers.get("x-vercel-ip-country-region");
  let latitude = request.headers.get("x-vercel-ip-latitude");
  let longitude = request.headers.get("x-vercel-ip-longitude");
  let timezone = request.headers.get("x-vercel-ip-timezone");

  if (!city || !latitude || !longitude) {
    const forwardedIp = firstForwardedIp(
      request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip")
    );

    if (isPublicIp(forwardedIp)) {
      const geo = await lookupGeoFromIp(forwardedIp);
      if (geo) {
        city = geo.city;
        country = geo.country;
        region = geo.region;
        latitude = geo.latitude;
        longitude = geo.longitude;
        timezone = geo.timezone;
      }
    }
  }

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
