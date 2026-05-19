import { NextRequest, NextResponse } from "next/server";
import {
  DEFAULT_LOCATION_SLUG,
  slugifyLocation,
} from "@/lib/location-resolver";

export const config = {
  // Match all pages (excluding API routes, static files, and Next.js internals)
  // so we can inject x-pathname for the root layout's hreflang generation.
  // IP-based location detection is still scoped to `/`, `/prediction`, and
  // `/weather` inside the proxy function itself.
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|icon|apple-icon|manifest|robots.txt|sitemap.xml|feed.xml|llms.txt|sw.js|.*\\.(?:svg|png|jpg|jpeg|gif|webp|avif|ico|css|js)$).*)",
  ],
};

const IP_DETECTION_PATHS = new Set(["/", "/prediction", "/weather"]);

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
    if (response.ok) {
      const data = await response.json();
      if (data && data.city && data.latitude && data.longitude) {
        return {
          city: String(data.city),
          country: String(data.country_code || data.country || "US"),
          region: String(data.region_code || data.region || ""),
          latitude: String(data.latitude),
          longitude: String(data.longitude),
          timezone: String(data.timezone || "UTC"),
        };
      }
    }
  } catch {
    // ipapi.co failed — try fallback
  }

  // Fallback: ip-api.com (free, no key, 45 req/min)
  try {
    const response = await fetch(`http://ip-api.com/json/${encodeURIComponent(ip)}?fields=status,country,countryCode,region,regionName,city,lat,lon,timezone,zip`, {
      cache: "no-store",
    });
    if (response.ok) {
      const data = await response.json();
      if (data && data.status === "success" && data.city && data.lat && data.lon) {
        return {
          city: String(data.city),
          country: String(data.countryCode || "US"),
          region: String(data.regionName || ""),
          latitude: String(data.lat),
          longitude: String(data.lon),
          timezone: String(data.timezone || "UTC"),
        };
      }
    }
  } catch {
    // Both providers failed
  }

  return null;
}

export async function proxy(request: NextRequest) {
  const requestHeaders = new Headers(request.headers);

  // Always expose pathname so server components (e.g. the root layout's
  // hreflang generator) can build absolute alternate URLs.
  requestHeaders.set("x-pathname", request.nextUrl.pathname);

  // IP-based location detection only runs on the homepage, /prediction, and
  // /weather — those are the only pages that consume the resolved headers.
  if (!IP_DETECTION_PATHS.has(request.nextUrl.pathname)) {
    return NextResponse.next({ request: { headers: requestHeaders } });
  }

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
