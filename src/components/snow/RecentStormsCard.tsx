/**
 * RecentStormsCard — first-party-feeling local storm history on city pages.
 *
 * Data source: NOAA NWS Storm Events Database (https://www.ncei.noaa.gov/...),
 * ingested at build time via `scripts/ingest-storm-events.mjs` and read from
 * `@/data/storm-events.json` via `@/lib/storm-events`.
 *
 * E-E-A-T mechanics:
 *   - Cites a primary government source by name (NWS) inline
 *   - Shows real event narratives (not synthesized)
 *   - Includes a `dateModified` strapline so Google sees freshness
 *   - Renders as a `<section>` with semantic markup
 */

import { CloudSnow, ExternalLink } from "lucide-react";
import type { StormEvent } from "@/lib/storm-events";

interface Props {
  cityName: string;
  storms: StormEvent[];
  generatedAt: Date | null;
}

function formatDate(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function formatLastUpdated(d: Date | null): string {
  if (!d) return "";
  return d.toLocaleDateString("en-US", { year: "numeric", month: "long" });
}

export function RecentStormsCard({ cityName, storms, generatedAt }: Props) {
  if (storms.length === 0) return null;
  const cityOnly = cityName.split(",")[0];

  return (
    <section
      className="relative z-10 py-12 px-4"
      aria-label={`Recent storms in ${cityName}`}
    >
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 rounded-xl bg-sky-500/10 flex items-center justify-center">
            <CloudSnow className="w-5 h-5 text-sky-400" aria-hidden="true" />
          </div>
          <div>
            <h3 className="text-xl sm:text-2xl font-display font-black text-white">
              Recent {cityOnly} storms
            </h3>
            <p className="text-xs text-white/40 uppercase tracking-widest mt-1">
              National Weather Service · Storm Events Database
            </p>
          </div>
        </div>

        <ol className="space-y-3">
          {storms.map((s, i) => (
            <li
              key={`${s.date}-${i}`}
              className="rounded-2xl border border-white/5 bg-white/[0.02] px-5 py-4"
            >
              <div className="flex items-baseline justify-between gap-3 mb-1.5">
                <p className="text-sm font-bold text-white/90">{s.type}</p>
                <time
                  dateTime={s.date}
                  className="text-[11px] text-white/40 uppercase tracking-wider whitespace-nowrap"
                >
                  {formatDate(s.date)}
                </time>
              </div>
              {typeof s.snowfallInches === "number" && (
                <p className="text-[11px] text-sky-400/70 uppercase tracking-wider font-semibold mb-1.5">
                  {s.snowfallInches}" measured
                </p>
              )}
              <p className="text-[13px] text-white/55 leading-relaxed">
                {s.narrative}
              </p>
            </li>
          ))}
        </ol>

        {generatedAt && (
          <p className="mt-5 flex items-center gap-2 text-[10px] text-white/50 uppercase tracking-[0.25em]">
            <span>Last refreshed {formatLastUpdated(generatedAt)}</span>
            <span aria-hidden="true">·</span>
            <a
              href="https://www.ncdc.noaa.gov/stormevents/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 hover:text-white/60 transition-colors"
            >
              NWS source
              <ExternalLink className="w-2.5 h-2.5" aria-hidden="true" />
            </a>
          </p>
        )}
      </div>
    </section>
  );
}
