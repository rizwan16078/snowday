import { unstable_cache } from "next/cache";
import { applyCalibration } from "@/lib/calibration";
import { geocodeSearch, detectLocationFromHeaders } from "@/lib/geocoding";
import {
  DEFAULT_LOCATION_SLUG,
  getAllLocations,
  resolveLocation,
  slugifyLocation,
  titleFromSlug,
} from "@/lib/location-resolver";
import { runPredictionEngine } from "@/lib/prediction-engine";
import { fetchWeather } from "@/lib/weather";
import type {
  CommunityFeedItem,
  ResolvedLocation,
  SchoolType,
  SnowDayPrediction,
  SnowSenseRibbon,
} from "@/types/snow";

function parseCoordinate(value?: string): number | null {
  if (!value) return null;
  const parsed = Number.parseFloat(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function statusFromProbability(
  probability: number
): SnowDayPrediction["status"] {
  if (probability < 40) return "Unlikely";
  if (probability < 70) return "Possible";
  return "Very Likely";
}

function buildResolvedLocation(
  location: Partial<ResolvedLocation> & Pick<ResolvedLocation, "lat" | "lon" | "slug">
): ResolvedLocation {
  return {
    city: location.city || titleFromSlug(location.slug),
    state: location.state || "",
    country: location.country || "US",
    lat: location.lat,
    lon: location.lon,
    slug: slugifyLocation(location.slug),
    timezone: location.timezone,
  };
}

export async function resolveRequestLocation(
  params: {
    loc?: string;
    lat?: string;
    lon?: string;
    city?: string;
    state?: string;
    country?: string;
    tz?: string;
  },
  requestHeaders: Headers
): Promise<ResolvedLocation> {
  const requestedSlug = params.loc ? slugifyLocation(params.loc) : "";
  const requestedLat = parseCoordinate(params.lat);
  const requestedLon = parseCoordinate(params.lon);

  if (requestedSlug) {
    if (requestedLat !== null && requestedLon !== null) {
      return buildResolvedLocation({
        slug: requestedSlug,
        city: params.city ? decodeURIComponent(params.city) : titleFromSlug(requestedSlug),
        state: params.state ? decodeURIComponent(params.state) : "",
        country: params.country || "US",
        lat: requestedLat,
        lon: requestedLon,
        timezone: params.tz,
      });
    }

    const knownLocation = resolveLocation(requestedSlug);
    if (knownLocation.slug !== "unknown") {
      return knownLocation;
    }

    const geocoded = await geocodeSearch(requestedSlug.replace(/-/g, " "));
    if (geocoded[0]) {
      return buildResolvedLocation({
        slug: geocoded[0].slug || requestedSlug,
        city: geocoded[0].city,
        state: geocoded[0].state,
        country: geocoded[0].country,
        lat: geocoded[0].lat,
        lon: geocoded[0].lon,
        timezone: geocoded[0].timezone,
      });
    }
  }

  // No slug, but lat/lon provided directly (e.g. from navbar search)
  if (requestedLat !== null && requestedLon !== null) {
    const decodedCity = params.city ? decodeURIComponent(params.city) : "";
    const decodedState = params.state ? decodeURIComponent(params.state) : "";
    const decodedCountry = params.country ? decodeURIComponent(params.country) : "";
    const slugSeed = [decodedCity, decodedState || decodedCountry]
      .filter(Boolean)
      .join("-");
    return buildResolvedLocation({
      slug: slugSeed ? slugifyLocation(slugSeed) : `loc-${requestedLat.toFixed(2)}-${requestedLon.toFixed(2)}`,
      city: decodedCity || "Selected location",
      state: decodedState,
      country: decodedCountry || "US",
      lat: requestedLat,
      lon: requestedLon,
      timezone: params.tz,
    });
  }

  const headerSlug = requestHeaders.get("x-resolved-loc");
  const headerCity = requestHeaders.get("x-resolved-city");
  const headerState = requestHeaders.get("x-resolved-state");
  const headerCountry = requestHeaders.get("x-resolved-country");
  const headerTimezone = requestHeaders.get("x-resolved-tz") || undefined;
  const headerLat = parseCoordinate(requestHeaders.get("x-resolved-lat") || undefined);
  const headerLon = parseCoordinate(requestHeaders.get("x-resolved-lon") || undefined);

  if (headerSlug) {
    if (headerLat !== null && headerLon !== null) {
      return buildResolvedLocation({
        slug: headerSlug,
        city: headerCity || titleFromSlug(headerSlug),
        state: headerState || "",
        country: headerCountry || "US",
        lat: headerLat,
        lon: headerLon,
        timezone: headerTimezone,
      });
    }

    const knownHeaderLocation = resolveLocation(headerSlug);
    if (knownHeaderLocation.slug !== "unknown") {
      return buildResolvedLocation({
        ...knownHeaderLocation,
        city: headerCity || knownHeaderLocation.city,
        state: headerState || knownHeaderLocation.state,
        country: headerCountry || knownHeaderLocation.country,
        timezone: headerTimezone || knownHeaderLocation.timezone,
      });
    }

    const headerQuery = [headerCity, headerState, headerCountry]
      .filter((value): value is string => Boolean(value && value.trim()))
      .join(", ");

    if (headerQuery) {
      const geocodedHeaderLocation = await geocodeSearch(headerQuery);
      if (geocodedHeaderLocation[0]) {
        return buildResolvedLocation({
          slug: geocodedHeaderLocation[0].slug || headerSlug,
          city: geocodedHeaderLocation[0].city,
          state: geocodedHeaderLocation[0].state,
          country: geocodedHeaderLocation[0].country,
          lat: geocodedHeaderLocation[0].lat,
          lon: geocodedHeaderLocation[0].lon,
          timezone: geocodedHeaderLocation[0].timezone || headerTimezone,
        });
      }
    }
  }

  // Vercel injects geo headers (x-vercel-ip-*) on every edge request. Use them
  // so the FIRST server render is already the visitor's city — no New-York flash
  // and no client-side IP redirect round-trip. The home page already opts out of
  // the route cache via `headers()`, so this stays per-request, not shared.
  // Falls through to New York only when geo headers are absent (local dev,
  // non-Vercel hosts, or crawlers without geo).
  const ipLocation = detectLocationFromHeaders(requestHeaders);
  if (ipLocation) {
    return buildResolvedLocation({
      slug: ipLocation.slug || slugifyLocation(`${ipLocation.city}-${ipLocation.country}`),
      city: ipLocation.city,
      state: ipLocation.state,
      country: ipLocation.country,
      lat: ipLocation.lat,
      lon: ipLocation.lon,
      timezone: ipLocation.timezone,
    });
  }

  return resolveLocation(DEFAULT_LOCATION_SLUG);
}

export async function getSnowSensePrediction(
  location: ResolvedLocation,
  daysUsed: number,
  type: SchoolType
): Promise<SnowDayPrediction> {
  const weather = await fetchWeather(
    location.lat,
    location.lon,
    location.timezone || "auto"
  );
  const basePrediction = runPredictionEngine(weather, {
    latitude: location.lat,
    strictness: "normal",
  });
  const probability = applyCalibration(basePrediction.probability, daysUsed, type);

  return {
    ...basePrediction,
    probability,
    status: statusFromProbability(probability),
    location: {
      city: location.city,
      state: location.state,
      country: location.country,
      lat: location.lat,
      lon: location.lon,
      timezone: weather.timezone || location.timezone,
    },
    rawWeather: weather,
  };
}

function formatLocationLine(location: ResolvedLocation): string {
  const area = location.country === "US" ? location.state || "US" : location.country;
  return `${location.city}, ${area}`.toUpperCase();
}

function formatLatitudeLabel(latitude: number): string {
  return `${Math.abs(latitude).toFixed(2)}°${latitude >= 0 ? "N" : "S"}`;
}

export function buildRibbonData(
  location: ResolvedLocation,
  prediction?: SnowDayPrediction | null
): SnowSenseRibbon {
  return {
    locationLabel: formatLocationLine(location),
    latitudeLabel: formatLatitudeLabel(location.lat),
    temperatureC: prediction?.rawWeather?.temperature ?? null,
    humidityPercent: prediction?.rawWeather?.humidityPercent ?? null,
  };
}

function seededRandom(seed: number): number {
  const x = Math.sin(seed * 12.9898) * 43758.5453;
  return x - Math.floor(x);
}

function buildCommunityProbability(lat: number, seed: number): number {
  const seasonalBias = lat > 40 ? 24 : lat > 33 ? 12 : 4;
  const noise = Math.round(seededRandom(seed) * 68);
  return Math.max(0, Math.min(100, seasonalBias + noise));
}

export const getCommunityFeed = unstable_cache(
  async (): Promise<CommunityFeedItem[]> => {
    const bucket = Math.floor(Date.now() / 60_000);
    const locations = getAllLocations().filter((location) => location.slug !== DEFAULT_LOCATION_SLUG);

    return Array.from({ length: 8 }, (_, index) => {
      const seed = bucket + index * 17;
      const location = locations[Math.floor(seededRandom(seed) * locations.length)];
      const probability = buildCommunityProbability(location.lat, seed + 1);

      return {
        id: `${bucket}-${location.slug}-${index}`,
        city: location.city,
        state: location.state,
        country: location.country,
        probability,
        status: statusFromProbability(probability),
        timeAgo: `${Math.max(1, Math.round(seededRandom(seed + 2) * 11) + 1)} min ago`,
      };
    });
  },
  ["snowsense-community-feed"],
  { revalidate: 60 }
);

export function buildRadarUrl(location: ResolvedLocation): string {
  const params = new URLSearchParams({
    lat: location.lat.toFixed(4),
    lon: location.lon.toFixed(4),
    loc: location.slug,
  });

  return `/api/radar?${params.toString()}`;
}
