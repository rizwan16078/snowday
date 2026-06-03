/**
 * Geocoding utilities — IP detection, forward/reverse geocoding
 * No browser geolocation permission required
 */

import type { GeocodingResult, LocationData } from "@/types/snow";
import { slugifyLocation } from "@/lib/location-resolver";

// ─── IP-based Location Detection ────────────────────────────────────────────

function parseIpapiLocation(data: Record<string, unknown>): GeocodingResult | null {
  const city = typeof data.city === "string" ? data.city : "";
  const latitude = Number(data.latitude);
  const longitude = Number(data.longitude);

  if (!city || !Number.isFinite(latitude) || !Number.isFinite(longitude)) {
    return null;
  }

  const country =
    (typeof data.country_code === "string" && data.country_code) ||
    (typeof data.country === "string" && data.country) ||
    "US";
  const state =
    (typeof data.region_code === "string" && data.region_code) ||
    (typeof data.region === "string" && data.region) ||
    "";
  const timezone =
    typeof data.timezone === "string" && data.timezone ? data.timezone : undefined;
  const zip = typeof data.postal === "string" && data.postal ? data.postal : undefined;

  return {
    lat: latitude,
    lon: longitude,
    city,
    state,
    country,
    zip,
    slug: slugifyLocation(`${city}-${country}`),
    timezone,
  };
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

export function detectLocationFromHeaders(headers: Headers): GeocodingResult | null {
  const city = headers.get("x-vercel-ip-city");
  const latitude = Number(headers.get("x-vercel-ip-latitude"));
  const longitude = Number(headers.get("x-vercel-ip-longitude"));

  if (!city || !Number.isFinite(latitude) || !Number.isFinite(longitude)) {
    return null;
  }

  const country = headers.get("x-vercel-ip-country") || "US";
  const state = headers.get("x-vercel-ip-country-region") || "";
  const timezone = headers.get("x-vercel-ip-timezone") || undefined;

  return {
    lat: latitude,
    lon: longitude,
    city,
    state,
    country,
    slug: slugifyLocation(`${city}-${country}`),
    timezone,
  };
}

export function getForwardedPublicIp(headers: Headers): string | null {
  const candidate = firstForwardedIp(
    headers.get("x-forwarded-for") || headers.get("x-real-ip")
  );
  return isPublicIp(candidate) ? candidate : null;
}

export async function detectLocationFromIP(ipAddress?: string): Promise<GeocodingResult | null> {
  try {
    const endpoint = ipAddress
      ? `https://ipapi.co/${encodeURIComponent(ipAddress)}/json/`
      : "https://ipapi.co/json/";
    const res = await fetch(endpoint, {
      cache: "no-store",
    });
    if (res.ok) {
      const data = (await res.json()) as Record<string, unknown>;
      const result = parseIpapiLocation(data);
      if (result) return result;
    }
  } catch {
    // ipapi.co failed — try fallback
  }

  // Fallback: ip-api.com (free, no key, 45 req/min)
  try {
    const endpoint = ipAddress
      ? `http://ip-api.com/json/${encodeURIComponent(ipAddress)}?fields=status,country,countryCode,region,regionName,city,lat,lon,timezone,zip`
      : "http://ip-api.com/json/?fields=status,country,countryCode,region,regionName,city,lat,lon,timezone,zip";
    const res = await fetch(endpoint, {
      cache: "no-store",
    });
    if (res.ok) {
      const data = (await res.json()) as Record<string, unknown>;
      if (data.status === "success") {
        const city = typeof data.city === "string" ? data.city : "";
        const lat = Number(data.lat);
        const lon = Number(data.lon);
        if (city && Number.isFinite(lat) && Number.isFinite(lon)) {
          return {
            lat,
            lon,
            city,
            state: (typeof data.regionName === "string" && data.regionName) || "",
            country: (typeof data.countryCode === "string" && data.countryCode) || "US",
            zip: typeof data.zip === "string" && data.zip ? data.zip : undefined,
            slug: slugifyLocation(`${city}-${(typeof data.countryCode === "string" && data.countryCode) || "US"}`),
            timezone: typeof data.timezone === "string" && data.timezone ? data.timezone : undefined,
          };
        }
      }
    }
  } catch {
    // Both providers failed
  }

  return null;
}

// ─── Forward Geocoding (search query → lat/lon) ──────────────────────────────

export async function geocodeSearch(query: string): Promise<GeocodingResult[]> {
  const trimmed = query.trim();
  // A bare 5-digit US ZIP returns nonsense from free-text search (Nominatim
  // matches numeric strings anywhere on earth). Use the structured `postalcode`
  // field constrained to the US so "90210" → Beverly Hills, not Ukraine.
  const isUsZip = /^\d{5}$/.test(trimmed);
  const params = isUsZip
    ? new URLSearchParams({
        postalcode: trimmed,
        countrycodes: "us",
        format: "json",
        limit: "5",
        addressdetails: "1",
      })
    : new URLSearchParams({
        q: query,
        format: "json",
        limit: "5",
        addressdetails: "1",
      });

  try {
    const res = await fetch(`https://nominatim.openstreetmap.org/search?${params}`, {
      headers: { "User-Agent": "SnowSenseApp/1.0" },
      next: { revalidate: 86400 }, // Cache 24h — addresses don't change
    });
    if (!res.ok) return [];
    const data = await res.json();

    return data.map((item: NominatimResult) => ({
      lat: parseFloat(item.lat),
      lon: parseFloat(item.lon),
      city:
        item.address?.city ??
        item.address?.town ??
        item.address?.village ??
        item.display_name.split(",")[0],
      state: item.address?.state ?? "",
      country: item.address?.country_code?.toUpperCase() ?? "US",
      zip: item.address?.postcode ?? undefined,
      slug: slugifyLocation(
        `${item.address?.city ?? item.address?.town ?? item.address?.village ?? item.display_name.split(",")[0]}-${item.address?.country_code?.toUpperCase() ?? "US"}`
      ),
    }));
  } catch {
    return [];
  }
}

// ─── Reverse Geocoding (lat/lon → location) ──────────────────────────────────

export async function reverseGeocode(lat: number, lon: number): Promise<GeocodingResult | null> {
  const params = new URLSearchParams({
    lat: lat.toFixed(4),
    lon: lon.toFixed(4),
    format: "json",
    addressdetails: "1",
  });

  try {
    const res = await fetch(`https://nominatim.openstreetmap.org/reverse?${params}`, {
      headers: { "User-Agent": "SnowSenseApp/1.0" },
      next: { revalidate: 86400 },
    });
    if (!res.ok) return null;
    const data = await res.json();

    return {
      lat,
      lon,
      city:
        data.address?.city ??
        data.address?.town ??
        data.address?.village ??
        data.display_name?.split(",")[0] ??
        "Unknown",
      state: data.address?.state ?? "",
      country: data.address?.country_code?.toUpperCase() ?? "US",
      zip: data.address?.postcode ?? undefined,
      slug: slugifyLocation(
        `${data.address?.city ?? data.address?.town ?? data.address?.village ?? data.display_name?.split(",")[0] ?? "unknown"}-${data.address?.country_code?.toUpperCase() ?? "US"}`
      ),
    };
  } catch {
    return null;
  }
}

interface NominatimResult {
  lat: string;
  lon: string;
  display_name: string;
  address?: {
    city?: string;
    town?: string;
    village?: string;
    state?: string;
    country_code?: string;
    postcode?: string;
  };
}

// ─── Format location for display ────────────────────────────────────────────

export function formatLocation(loc: LocationData | GeocodingResult): string {
  const parts = [loc.city];
  if (loc.state) parts.push(loc.state);
  return parts.filter(Boolean).join(", ");
}

// ─── Default fallback location (New York) ───────────────────────────────────

export const DEFAULT_LOCATION: GeocodingResult = {
  lat: 40.7128,
  lon: -74.006,
  city: "New York",
  state: "NY",
  country: "US",
  zip: "10001",
};
