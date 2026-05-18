import type { ResolvedLocation } from "@/types/snow";

const UNKNOWN: ResolvedLocation = {
  city: "Unknown",
  state: "",
  country: "US",
  lat: 0,
  lon: 0,
  slug: "unknown",
  timezone: "UTC",
};

export const DEFAULT_LOCATION_SLUG = "new-york";

const LOCATION_DB: Record<string, ResolvedLocation> = {
  "mansehra-pk": {
    city: "Mansehra",
    state: "",
    country: "PK",
    lat: 34.33,
    lon: 73.2,
    slug: "mansehra-pk",
    timezone: "Asia/Karachi",
  },
  boston: { city: "Boston", state: "MA", country: "US", lat: 42.3601, lon: -71.0589, slug: "boston", timezone: "America/New_York" },
  "new-york": { city: "New York", state: "NY", country: "US", lat: 40.7128, lon: -74.006, slug: "new-york", timezone: "America/New_York" },
  philadelphia: { city: "Philadelphia", state: "PA", country: "US", lat: 39.9526, lon: -75.1652, slug: "philadelphia", timezone: "America/New_York" },
  hartford: { city: "Hartford", state: "CT", country: "US", lat: 41.7658, lon: -72.6734, slug: "hartford", timezone: "America/New_York" },
  albany: { city: "Albany", state: "NY", country: "US", lat: 42.6526, lon: -73.7562, slug: "albany", timezone: "America/New_York" },
  "portland-me": { city: "Portland", state: "ME", country: "US", lat: 43.6591, lon: -70.2568, slug: "portland-me", timezone: "America/New_York" },
  syracuse: { city: "Syracuse", state: "NY", country: "US", lat: 43.0481, lon: -76.1474, slug: "syracuse", timezone: "America/New_York" },
  burlington: { city: "Burlington", state: "VT", country: "US", lat: 44.4759, lon: -73.2121, slug: "burlington", timezone: "America/New_York" },
  pittsburgh: { city: "Pittsburgh", state: "PA", country: "US", lat: 40.4406, lon: -79.9959, slug: "pittsburgh", timezone: "America/New_York" },
  chicago: { city: "Chicago", state: "IL", country: "US", lat: 41.8781, lon: -87.6298, slug: "chicago", timezone: "America/Chicago" },
  detroit: { city: "Detroit", state: "MI", country: "US", lat: 42.3314, lon: -83.0458, slug: "detroit", timezone: "America/Detroit" },
  minneapolis: { city: "Minneapolis", state: "MN", country: "US", lat: 44.9778, lon: -93.265, slug: "minneapolis", timezone: "America/Chicago" },
  milwaukee: { city: "Milwaukee", state: "WI", country: "US", lat: 43.0389, lon: -87.9065, slug: "milwaukee", timezone: "America/Chicago" },
  cleveland: { city: "Cleveland", state: "OH", country: "US", lat: 41.4993, lon: -81.6944, slug: "cleveland", timezone: "America/New_York" },
  indianapolis: { city: "Indianapolis", state: "IN", country: "US", lat: 39.7684, lon: -86.158, slug: "indianapolis", timezone: "America/Indiana/Indianapolis" },
  columbus: { city: "Columbus", state: "OH", country: "US", lat: 39.9612, lon: -82.9988, slug: "columbus", timezone: "America/New_York" },
  "st-louis": { city: "St. Louis", state: "MO", country: "US", lat: 38.627, lon: -90.1994, slug: "st-louis", timezone: "America/Chicago" },
  "kansas-city": { city: "Kansas City", state: "MO", country: "US", lat: 39.0997, lon: -94.5786, slug: "kansas-city", timezone: "America/Chicago" },
  denver: { city: "Denver", state: "CO", country: "US", lat: 39.7392, lon: -104.9903, slug: "denver", timezone: "America/Denver" },
  "salt-lake-city": { city: "Salt Lake City", state: "UT", country: "US", lat: 40.7608, lon: -111.891, slug: "salt-lake-city", timezone: "America/Denver" },
  seattle: { city: "Seattle", state: "WA", country: "US", lat: 47.6062, lon: -122.3321, slug: "seattle", timezone: "America/Los_Angeles" },
  "portland-or": { city: "Portland", state: "OR", country: "US", lat: 45.5152, lon: -122.6784, slug: "portland-or", timezone: "America/Los_Angeles" },
  anchorage: { city: "Anchorage", state: "AK", country: "US", lat: 61.2181, lon: -149.9003, slug: "anchorage", timezone: "America/Anchorage" },
  boise: { city: "Boise", state: "ID", country: "US", lat: 43.615, lon: -116.2023, slug: "boise", timezone: "America/Boise" },
  washington: { city: "Washington", state: "DC", country: "US", lat: 38.9072, lon: -77.0369, slug: "washington", timezone: "America/New_York" },
  charlotte: { city: "Charlotte", state: "NC", country: "US", lat: 35.2271, lon: -80.8431, slug: "charlotte", timezone: "America/New_York" },
  atlanta: { city: "Atlanta", state: "GA", country: "US", lat: 33.749, lon: -84.388, slug: "atlanta", timezone: "America/New_York" },
  nashville: { city: "Nashville", state: "TN", country: "US", lat: 36.1627, lon: -86.7816, slug: "nashville", timezone: "America/Chicago" },
  richmond: { city: "Richmond", state: "VA", country: "US", lat: 37.5407, lon: -77.436, slug: "richmond", timezone: "America/New_York" },
  raleigh: { city: "Raleigh", state: "NC", country: "US", lat: 35.7796, lon: -78.6382, slug: "raleigh", timezone: "America/New_York" },
  buffalo: { city: "Buffalo", state: "NY", country: "US", lat: 42.8864, lon: -78.8784, slug: "buffalo", timezone: "America/New_York" },
};

export function slugifyLocation(value: string): string {
  return value
    .normalize("NFKD")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

export function titleFromSlug(slug: string): string {
  return slug
    .split("-")
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

export function resolveLocation(slug: string): ResolvedLocation {
  const normalized = slugifyLocation(slug);
  return LOCATION_DB[normalized] ?? UNKNOWN;
}

export function getAllLocations(): ResolvedLocation[] {
  return Object.values(LOCATION_DB);
}

export function isKnownLocation(slug: string): boolean {
  return slugifyLocation(slug) in LOCATION_DB;
}
