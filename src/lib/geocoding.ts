/**
 * Geocoding utilities — IP detection, forward/reverse geocoding
 * No browser geolocation permission required
 */

import type { GeocodingResult, LocationData } from "@/types/snow";
import { slugifyLocation } from "@/lib/location-resolver";

// ─── IP-based Location Detection ────────────────────────────────────────────

export async function detectLocationFromIP(): Promise<GeocodingResult | null> {
  try {
    // freeipapi.com free tier — no key needed, supports HTTPS
    const res = await fetch("https://freeipapi.com/api/json", {
      next: { revalidate: 3600 }, // Cache for 1 hour
    });
    if (!res.ok) return null;
    const data = await res.json();
    if (!data || !data.cityName) return null;

    return {
      lat: data.latitude,
      lon: data.longitude,
      city: data.cityName,
      state: data.regionName ?? "",
      country: data.countryCode ?? "US",
      zip: data.zipCode ?? undefined,
      slug: slugifyLocation(`${data.cityName}-${data.countryCode ?? "US"}`),
      timezone: data.timeZone ?? undefined,
    };
  } catch {
    return null;
  }
}

// ─── Forward Geocoding (search query → lat/lon) ──────────────────────────────

export async function geocodeSearch(query: string): Promise<GeocodingResult[]> {
  const params = new URLSearchParams({
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
