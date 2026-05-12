/**
 * Storm-events loader — reads `src/data/storm-events.json` at build time and
 * exposes typed accessors for the city-page "Recent storms" card.
 *
 * Why static JSON (not a runtime API): the NOAA NWS Storm Events DB is huge
 * (>100 MB/year uncompressed) and updates only ~monthly. Ingesting at build
 * time via a separate script (`scripts/ingest-storm-events.mjs`) gives us
 *   - zero runtime cost
 *   - deterministic builds
 *   - graceful fallback (empty JSON = card auto-hides)
 *
 * Schema (mirrors what the ingestion script emits):
 *
 *   {
 *     "_meta": { ... },
 *     "byCity": {
 *       "boston-ma": [
 *         {
 *           "date": "2022-01-29",
 *           "type": "Winter Storm",
 *           "narrative": "A powerful nor'easter dropped 23.6 inches...",
 *           "snowfallInches": 23.6,
 *           "duration": "2022-01-28 to 2022-01-29"
 *         },
 *         ...
 *       ]
 *     }
 *   }
 */

import rawData from "@/data/storm-events.json";

// ─── Types ───────────────────────────────────────────────────────────────────

export interface StormEvent {
  /** ISO date string (YYYY-MM-DD). Storm peak or end date. */
  date: string;
  /** NWS event type: "Winter Storm" | "Blizzard" | "Ice Storm" | "Heavy Snow" | … */
  type: string;
  /** Human-readable event narrative from NWS (1-3 sentences). */
  narrative: string;
  /** Approximate snowfall in inches (NWS magnitude when reported). May be null. */
  snowfallInches?: number | null;
  /** Display label for the storm duration. */
  duration?: string;
}

interface StormEventsData {
  _meta: {
    generatedAt: string | null;
    source: string;
    note?: string;
  };
  byCity: Record<string, StormEvent[]>;
}

const data = rawData as StormEventsData;

// ─── Public API ──────────────────────────────────────────────────────────────

/**
 * Last-known storms for a given city slug. Returns an empty array if no
 * data is available (which makes the UI card self-hide).
 */
export function getRecentStorms(citySlug: string, limit = 4): StormEvent[] {
  const events = data.byCity[citySlug] ?? [];
  // Already sorted desc by date in the source file, but defensively re-sort.
  return [...events]
    .sort((a, b) => (a.date < b.date ? 1 : -1))
    .slice(0, limit);
}

/**
 * When the static dataset was last regenerated. Used by the UI card footer
 * and the sitemap `lastModified` for crawler freshness signals.
 */
export function getStormDataGeneratedAt(): Date | null {
  if (!data._meta.generatedAt) return null;
  const d = new Date(data._meta.generatedAt);
  return Number.isNaN(d.getTime()) ? null : d;
}

/**
 * How many cities the dataset covers — useful for build-time diagnostics.
 */
export function getStormDataCityCount(): number {
  return Object.keys(data.byCity).length;
}
