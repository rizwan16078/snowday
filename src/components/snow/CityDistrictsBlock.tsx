/**
 * CityDistrictsBlock — links to school district pages that serve this city.
 * Only renders if the city has at least one district in the catalog. Drives
 * the internal-link graph from city → district pages, which improves
 * crawler discovery and gives users a deeper-intent click target.
 */

import Link from "next/link";
import { Building2 } from "lucide-react";

export interface DistrictLink {
  slug: string;
  name: string;
  enrollment: number;
  type: string;
}

interface Props {
  cityName: string;
  districts: DistrictLink[];
}

export function CityDistrictsBlock({ cityName, districts }: Props) {
  if (districts.length === 0) return null;
  const label = districts.length === 1 ? "school district" : "school districts";

  return (
    <section
      className="relative z-10 py-12 px-4"
      aria-label={`School districts serving ${cityName}`}
    >
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center">
            <Building2
              className="w-5 h-5 text-purple-400"
              aria-hidden="true"
            />
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl font-display font-black text-white">
              {cityName} {label}
            </h2>
            <p className="text-xs text-white/40 uppercase tracking-widest mt-1">
              Per-district snow day probability
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {districts.map((d) => (
            <Link
              key={d.slug}
              href={`/school-district/${d.slug}`}
              className="group flex items-center justify-between rounded-2xl border border-white/5 bg-white/[0.02] px-5 py-4 hover:bg-white/[0.06] hover:border-white/10 transition-all duration-300"
            >
              <div className="min-w-0">
                <div className="text-sm font-bold text-white/90 group-hover:text-white transition-colors truncate">
                  {d.name}
                </div>
                <div className="text-[11px] text-white/40 uppercase tracking-wider mt-0.5">
                  {d.enrollment.toLocaleString("en-US")} students · {d.type}
                </div>
              </div>
              <Building2
                className="w-4 h-4 text-purple-400/40 group-hover:text-purple-400/70 shrink-0 ml-3"
                aria-hidden="true"
              />
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
