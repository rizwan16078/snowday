/**
 * District helpers — parse catalog, validate against city catalog, lookups.
 *
 * Districts reference cities by slug (e.g., "boston-public-ma" points to
 * "boston-ma"). Any district whose primary city isn't in the city catalog is
 * filtered out at module load — that keeps build-time renders robust if we
 * temporarily de-list a city or fix a typo in either catalog.
 */

import { DISTRICTS, type DistrictTuple, type DistrictType } from "./catalog";
import {
  CITY_BY_SLUG,
  STATE_NAMES,
  type CityRecord,
} from "../cities/helpers";

// ─── Types ───────────────────────────────────────────────────────────────────

export interface DistrictRecord {
  slug: string;            // URL slug: e.g., "boston-public-ma"
  name: string;            // "Boston Public Schools"
  state: string;           // "MA"
  stateName: string;       // "Massachusetts"
  enrollment: number;      // approximate student count
  type: DistrictType;
  websiteDomain: string;   // canonical web host (no protocol)
  websiteUrl: string;      // pre-built https:// URL for convenience
  city: CityRecord;        // resolved primary city (joined from city catalog)
}

// ─── Parse + validate ────────────────────────────────────────────────────────

function parseTuple(t: DistrictTuple): DistrictRecord | null {
  const [slug, name, state, citySlug, enrollment, type, domain] = t;
  const city = CITY_BY_SLUG.get(citySlug);
  if (!city) {
    // District references a city we don't have — skip silently. (We could
    // log, but build-time logs leak; filtering is enough.)
    return null;
  }
  return {
    slug,
    name,
    state,
    stateName: STATE_NAMES[state] ?? state,
    enrollment,
    type,
    websiteDomain: domain,
    websiteUrl: `https://${domain}`,
    city,
  };
}

/**
 * All districts whose primary city resolves in the city catalog. Built once
 * at module load.
 */
export const ALL_DISTRICTS: DistrictRecord[] = (() => {
  const seen = new Set<string>();
  const out: DistrictRecord[] = [];
  for (const t of DISTRICTS) {
    const rec = parseTuple(t);
    if (!rec) continue;
    if (seen.has(rec.slug)) continue;
    seen.add(rec.slug);
    out.push(rec);
  }
  return out;
})();

/**
 * slug → district record. O(1).
 */
export const DISTRICT_BY_SLUG: Map<string, DistrictRecord> = new Map(
  ALL_DISTRICTS.map((d) => [d.slug, d]),
);

/**
 * citySlug → districts that primarily serve that city. (A city can have
 * multiple districts, e.g., Houston has both Houston ISD and Cypress-Fairbanks.)
 */
export const DISTRICTS_BY_CITY_SLUG: Map<string, DistrictRecord[]> = (() => {
  const m = new Map<string, DistrictRecord[]>();
  for (const d of ALL_DISTRICTS) {
    const arr = m.get(d.city.slug) ?? [];
    arr.push(d);
    m.set(d.city.slug, arr);
  }
  // Sort each list by enrollment descending — largest first
  for (const arr of m.values()) arr.sort((a, b) => b.enrollment - a.enrollment);
  return m;
})();

/**
 * Districts by state (sorted by enrollment desc).
 */
export const DISTRICTS_BY_STATE: Map<string, DistrictRecord[]> = (() => {
  const m = new Map<string, DistrictRecord[]>();
  for (const d of ALL_DISTRICTS) {
    const arr = m.get(d.state) ?? [];
    arr.push(d);
    m.set(d.state, arr);
  }
  for (const arr of m.values()) arr.sort((a, b) => b.enrollment - a.enrollment);
  return m;
})();

// ─── Lookup APIs ─────────────────────────────────────────────────────────────

export function getDistrictRecord(slug: string): DistrictRecord | undefined {
  return DISTRICT_BY_SLUG.get(slug);
}

export function getDistrictsForCity(citySlug: string): DistrictRecord[] {
  return DISTRICTS_BY_CITY_SLUG.get(citySlug) ?? [];
}

export function getDistrictsInState(state: string): DistrictRecord[] {
  return DISTRICTS_BY_STATE.get(state) ?? [];
}

export function getTopDistrictsByEnrollment(n: number): DistrictRecord[] {
  return [...ALL_DISTRICTS]
    .sort((a, b) => b.enrollment - a.enrollment)
    .slice(0, n);
}

/**
 * Format enrollment with a thin-space thousands separator.
 * 915000 → "915,000 students"
 * 4000   → "4,000 students"
 */
export function formatEnrollment(n: number): string {
  return `${n.toLocaleString("en-US")} students`;
}
