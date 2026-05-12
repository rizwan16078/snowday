/**
 * Cities helpers — parse catalog, build lookups, compute distances, find nearby.
 *
 * The catalog is a compact tuple list; these helpers turn it into structured
 * records and precomputed indices so city pages don't re-scan on every request.
 */

import { CITIES, type CityTuple } from "./catalog";

// ─── Types ───────────────────────────────────────────────────────────────────

/**
 * STATE_NAMES — USPS code → human-readable state name. Used for page titles
 * ("Boston, Massachusetts Snow Day Calculator") and state hub pages.
 */
export const STATE_NAMES: Record<string, string> = {
  AL: "Alabama", AK: "Alaska", AZ: "Arizona", AR: "Arkansas", CA: "California",
  CO: "Colorado", CT: "Connecticut", DE: "Delaware", DC: "District of Columbia",
  FL: "Florida", GA: "Georgia", HI: "Hawaii", ID: "Idaho", IL: "Illinois",
  IN: "Indiana", IA: "Iowa", KS: "Kansas", KY: "Kentucky", LA: "Louisiana",
  ME: "Maine", MD: "Maryland", MA: "Massachusetts", MI: "Michigan",
  MN: "Minnesota", MS: "Mississippi", MO: "Missouri", MT: "Montana",
  NE: "Nebraska", NV: "Nevada", NH: "New Hampshire", NJ: "New Jersey",
  NM: "New Mexico", NY: "New York", NC: "North Carolina", ND: "North Dakota",
  OH: "Ohio", OK: "Oklahoma", OR: "Oregon", PA: "Pennsylvania",
  RI: "Rhode Island", SC: "South Carolina", SD: "South Dakota",
  TN: "Tennessee", TX: "Texas", UT: "Utah", VT: "Vermont", VA: "Virginia",
  WA: "Washington", WV: "West Virginia", WI: "Wisconsin", WY: "Wyoming",
};

/**
 * CityRecord — the "parsed" form of a catalog tuple, enriched with derived
 * fields (slug, stateSlug, stateName, climateZone) the rest of the code uses.
 */
export interface CityRecord {
  slug: string;            // e.g., "boston-ma"
  name: string;            // "Boston"
  displayName: string;     // "Boston, Massachusetts"
  state: string;           // "MA"
  stateName: string;       // "Massachusetts"
  stateSlug: string;       // "massachusetts"
  lat: number;
  lon: number;
  population: number;
  snowInches: number;      // average annual snowfall
  climateZone: ClimateZone;
}

/**
 * ClimateZone — drives the per-city content generator. Cities in the same
 * zone share prose templates, but each gets filled with its own state/data.
 * This is what keeps editorial content ~60%+ unique per city (Google won't
 * flag near-duplicates) without requiring hand-authored prose per city.
 */
export type ClimateZone =
  | "arctic"          // Alaska
  | "heavy-lake-effect" // Great Lakes snow belts
  | "upper-midwest"   // MN, ND, SD, WI, northern IA/MI — deep snow cultures
  | "northeast"       // NY, MA, CT, RI, NJ, PA, VT, NH, ME — nor'easters
  | "mid-atlantic"    // DC, MD, DE, VA — low-threshold snow
  | "southeast"       // NC, SC, TN, GA, AL — rare snow, extreme reaction
  | "deep-south"      // FL, LA, MS, TX — no snow at all
  | "mountain-west"   // CO, UT, WY, MT, ID (mid-elevation) — dry powder
  | "high-alpine"     // ski towns (Aspen, Truckee, Park City)
  | "pacific-nw"      // WA (west), OR (west) — mild
  | "desert-sw"       // AZ (low), NV, NM (low)
  | "midwest";        // OH, IN, IL, MO, KS, KY — general midwest

// ─── Slug helpers ────────────────────────────────────────────────────────────

/**
 * Turn a human-readable string into a URL-safe slug.
 * "St. Paul"   → "st-paul"
 * "Coeur d'Alene" → "coeur-dalene"
 * "Lee's Summit"  → "lees-summit"
 */
export function slugify(s: string): string {
  return s
    .toLowerCase()
    .replace(/['.]/g, "")               // drop apostrophes and periods
    .replace(/[^a-z0-9]+/g, "-")        // non-alnum → hyphens
    .replace(/^-+|-+$/g, "");           // trim leading/trailing hyphens
}

export function citySlug(name: string, state: string): string {
  return `${slugify(name)}-${state.toLowerCase()}`;
}

export function stateSlug(state: string): string {
  const name = STATE_NAMES[state];
  if (!name) return state.toLowerCase();
  return slugify(name);
}

// ─── Climate zone classifier ─────────────────────────────────────────────────

const NORTHEAST_STATES = new Set(["NY", "MA", "CT", "RI", "NJ", "PA", "VT", "NH", "ME"]);
const UPPER_MIDWEST_STATES = new Set(["MN", "ND", "SD", "WI"]);
const MIDWEST_STATES = new Set(["OH", "IN", "IL", "IA", "MO", "KS", "KY", "NE", "MI"]);
const MID_ATLANTIC_STATES = new Set(["DC", "MD", "DE", "VA", "WV"]);
const SOUTHEAST_STATES = new Set(["NC", "SC", "TN", "GA", "AL"]);
const DEEP_SOUTH_STATES = new Set(["FL", "LA", "MS", "TX", "AR", "OK"]);
const MOUNTAIN_STATES = new Set(["CO", "UT", "WY", "MT", "ID", "NM"]);
const PACIFIC_NW_STATES = new Set(["WA", "OR"]);
const DESERT_STATES = new Set(["AZ", "NV"]);

/**
 * Classify a city into a climate zone for content generation. Uses state as
 * the primary axis but overrides for ski towns (by snowInches) and lake-effect
 * belts (by lat/lon + snowInches).
 */
function classify(name: string, state: string, snow: number, lat: number, lon: number): ClimateZone {
  // Alaska — always arctic
  if (state === "AK") return "arctic";

  // Extreme snowfall overrides state: ski / alpine resort towns
  if (snow >= 150) return "high-alpine";

  // Lake-effect belt: Great Lakes cities with triple-digit or high snow
  if (snow >= 85) {
    const inLakeEffect =
      (state === "NY" && lon < -75 && lat > 42) ||    // western NY
      (state === "PA" && lat > 41.5 && lon < -79) ||  // Erie, PA
      (state === "OH" && lat > 41 && lon < -81) ||    // Cleveland area
      (state === "MI" && lat > 42) ||                  // Michigan snow belt
      (state === "WI" && lat > 44);                    // northern WI
    if (inLakeEffect) return "heavy-lake-effect";
  }

  // State-based default zones
  if (UPPER_MIDWEST_STATES.has(state)) return "upper-midwest";
  if (state === "MI") return "upper-midwest";
  if (NORTHEAST_STATES.has(state)) return "northeast";
  if (MID_ATLANTIC_STATES.has(state)) return "mid-atlantic";
  if (SOUTHEAST_STATES.has(state)) return "southeast";
  if (DEEP_SOUTH_STATES.has(state)) return "deep-south";
  if (PACIFIC_NW_STATES.has(state)) return "pacific-nw";
  if (DESERT_STATES.has(state)) return "desert-sw";
  if (MOUNTAIN_STATES.has(state)) return "mountain-west";
  if (MIDWEST_STATES.has(state)) return "midwest";

  return "midwest"; // safe fallback
}

// ─── Parsed catalog — built once at module load ──────────────────────────────

function parseTuple(t: CityTuple): CityRecord {
  const [name, state, lat, lon, pop, snow] = t;
  return {
    slug: citySlug(name, state),
    name,
    displayName: `${name}, ${STATE_NAMES[state] ?? state}`,
    state,
    stateName: STATE_NAMES[state] ?? state,
    stateSlug: stateSlug(state),
    lat,
    lon,
    population: pop,
    snowInches: snow,
    climateZone: classify(name, state, snow, lat, lon),
  };
}

/**
 * Parsed city records. If two catalog rows produce the same slug (e.g., two
 * "Springfield" rows that somehow collide), the first wins. Duplicates across
 * states are impossible because the slug includes the state code.
 */
export const ALL_CITIES: CityRecord[] = (() => {
  const seen = new Set<string>();
  const out: CityRecord[] = [];
  for (const t of CITIES) {
    const rec = parseTuple(t);
    if (seen.has(rec.slug)) continue;
    seen.add(rec.slug);
    out.push(rec);
  }
  return out;
})();

/**
 * slug → record lookup. O(1).
 */
export const CITY_BY_SLUG: Map<string, CityRecord> = new Map(
  ALL_CITIES.map((c) => [c.slug, c]),
);

/**
 * stateSlug → cities in that state, sorted by population descending.
 */
export const CITIES_BY_STATE_SLUG: Map<string, CityRecord[]> = (() => {
  const m = new Map<string, CityRecord[]>();
  for (const c of ALL_CITIES) {
    const arr = m.get(c.stateSlug) ?? [];
    arr.push(c);
    m.set(c.stateSlug, arr);
  }
  for (const arr of m.values()) arr.sort((a, b) => b.population - a.population);
  return m;
})();

// ─── Lookup APIs ─────────────────────────────────────────────────────────────

export function getCityRecord(slug: string): CityRecord | undefined {
  return CITY_BY_SLUG.get(slug);
}

export function getCitiesInState(stateSlugStr: string): CityRecord[] {
  return CITIES_BY_STATE_SLUG.get(stateSlugStr) ?? [];
}

export function getAllStateSlugs(): string[] {
  return Array.from(CITIES_BY_STATE_SLUG.keys()).sort();
}

/**
 * getTopCitiesByPopulation — used by `generateStaticParams` to decide which
 * pages to pre-render at build. Rest are built on-demand via ISR.
 */
export function getTopCitiesByPopulation(n: number): CityRecord[] {
  return [...ALL_CITIES]
    .sort((a, b) => b.population - a.population)
    .slice(0, n);
}

// ─── Geo helpers ─────────────────────────────────────────────────────────────

/**
 * Haversine distance in kilometers. Good enough for "is B near A?" — not a
 * geodesic-grade calculation.
 */
export function haversineKm(
  lat1: number, lon1: number, lat2: number, lon2: number,
): number {
  const R = 6371; // km
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(a));
}

/**
 * Find the `n` nearest cities to `origin`, excluding the origin itself.
 * Returns cities sorted by distance ascending with a `distanceKm` field.
 */
export function getNearbyCities(
  origin: CityRecord,
  n = 5,
): Array<CityRecord & { distanceKm: number }> {
  return ALL_CITIES
    .filter((c) => c.slug !== origin.slug)
    .map((c) => ({
      ...c,
      distanceKm: haversineKm(origin.lat, origin.lon, c.lat, c.lon),
    }))
    .sort((a, b) => a.distanceKm - b.distanceKm)
    .slice(0, n);
}
