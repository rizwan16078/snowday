/**
 * NearbyCitiesBlock — renders the 5 closest cities on a city page,
 * each linking to its own calculator page. Improves internal linking density
 * (M4) and increases pageviews per session.
 */

import Link from "next/link";
import { MapPinned } from "lucide-react";

export interface NearbyCity {
  slug: string;
  name: string;
  state: string;
  stateName: string;
  distanceKm: number;
  snowInches: number;
}

interface Props {
  originName: string;
  nearby: NearbyCity[];
}

function kmToMi(km: number): number {
  return Math.round(km * 0.621371);
}

export function NearbyCitiesBlock({ originName, nearby }: Props) {
  if (nearby.length === 0) return null;
  const originCity = originName.split(",")[0];

  return (
    <section className="relative z-10 py-12 px-4" aria-label={`Cities near ${originName}`}>
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center">
            <MapPinned className="w-5 h-5 text-amber-400" aria-hidden="true" />
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl font-display font-black text-white">
              Nearby cities
            </h2>
            <p className="text-xs text-white/40 uppercase tracking-widest mt-1">
              Live forecasts within driving distance of {originCity}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {nearby.map((c) => (
            <Link
              key={c.slug}
              href={`/snow-day-calculator/${c.slug}`}
              className="group flex items-center justify-between rounded-2xl border border-white/5 bg-white/[0.02] px-5 py-4 hover:bg-white/[0.06] hover:border-white/10 transition-all duration-300"
            >
              <div className="min-w-0">
                <div className="text-sm font-bold text-white/90 group-hover:text-white transition-colors truncate">
                  {c.name}
                </div>
                <div className="text-[11px] text-white/40 uppercase tracking-wider mt-0.5">
                  {c.stateName} · {c.snowInches}" snow/year
                </div>
              </div>
              <div className="text-right shrink-0 ml-4">
                <div className="text-sm font-display font-black text-amber-400/80">
                  {kmToMi(c.distanceKm)} mi
                </div>
                <div className="text-[10px] text-white/25 uppercase tracking-widest">
                  away
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
