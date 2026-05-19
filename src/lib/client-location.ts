import type { GeocodingResult } from "@/types/snow";

function parseIpapiLocation(data: Record<string, unknown>): GeocodingResult | null {
  const city = typeof data.city === "string" ? data.city : "";
  const lat = Number(data.latitude);
  const lon = Number(data.longitude);

  if (!city || !Number.isFinite(lat) || !Number.isFinite(lon)) {
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
  const slug = `${city}-${country}`
    .normalize("NFKD")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

  return {
    lat,
    lon,
    city,
    state,
    country,
    zip,
    slug,
    timezone,
  };
}

export async function detectLocationFromBrowser(): Promise<GeocodingResult | null> {
  if (typeof window === "undefined" || !navigator.geolocation) {
    return null;
  }

  try {
    const position = await new Promise<GeolocationPosition>((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(resolve, reject, {
        enableHighAccuracy: false,
        timeout: 8000,
        maximumAge: 10 * 60 * 1000,
      });
    });

    const res = await fetch("/api/snow/geocode", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        lat: position.coords.latitude,
        lon: position.coords.longitude,
      }),
    });

    if (!res.ok) return null;
    const data = (await res.json()) as GeocodingResult | null;
    return data;
  } catch {
    return null;
  }
}

async function detectLocationFromServerIP(): Promise<GeocodingResult | null> {
  try {
    const res = await fetch("/api/snow/geocode?detect=ip", {
      cache: "no-store",
    });

    if (!res.ok) return null;
    const data = (await res.json()) as GeocodingResult | null;
    return data;
  } catch {
    return null;
  }
}

async function detectLocationFromDirectIP(): Promise<GeocodingResult | null> {
  try {
    const res = await fetch("https://ipapi.co/json/", {
      cache: "no-store",
    });

    if (res.ok) {
      const data = (await res.json()) as Record<string, unknown>;
      const result = parseIpapiLocation(data);
      if (result) return result;
    }
  } catch {
    // ipapi.co failed
  }

  // Fallback: route through our server API to avoid mixed-content blocking
  // (ip-api.com only serves HTTP on free tier, which browsers block on HTTPS pages)
  try {
    const res = await fetch("/api/snow/geocode?detect=ip&fallback=1", {
      cache: "no-store",
    });

    if (res.ok) {
      const data = (await res.json()) as GeocodingResult | null;
      if (data && data.city) return data;
    }
  } catch {
    // Server fallback also failed
  }

  return null;
}

export async function detectLocationClientSide(): Promise<GeocodingResult | null> {
  const browserLocation = await detectLocationFromBrowser();
  if (browserLocation) return browserLocation;

  const ipLocation = await detectLocationFromServerIP();
  if (ipLocation) return ipLocation;

  const directIpLocation = await detectLocationFromDirectIP();
  if (directIpLocation) return directIpLocation;

  return null;
}
