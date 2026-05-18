/**
 * CityDistrictsBlock — links to school district pages that serve this city.
 * Only renders if the city has at least one district in the catalog. Drives
 * the internal-link graph from city → district pages, which improves
 * crawler discovery and gives users a deeper-intent click target.
 */

import Link from "next/link";
import { Building2, ExternalLink } from "lucide-react";

export interface DistrictLink {
  slug: string;
  name: string;
  enrollment: number;
  type: string;
  websiteUrl: string;
  websiteDomain: string;
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
            <div
              key={d.slug}
              className="rounded-2xl border border-white/5 bg-white/[0.02] px-5 py-4 hover:bg-white/[0.06] hover:border-white/10 transition-all duration-300"
            >
              <div className="min-w-0">
                <div className="text-sm font-bold text-white/90 truncate">
                  {d.name}
                </div>
                <div className="text-[11px] text-white/40 uppercase tracking-wider mt-0.5">
                  {d.enrollment.toLocaleString("en-US")} students · {d.type}
                </div>
                <div className="text-[11px] text-white/25 mt-1 truncate">
                  {d.websiteDomain}
                </div>
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                <Link
                  href={`/school-district/${d.slug}`}
                  className="inline-flex items-center gap-1.5 rounded-full bg-white/8 px-3 py-1.5 text-xs font-semibold text-white/80 hover:bg-white/12 hover:text-white transition-colors"
                >
                  <Building2 className="w-3 h-3" aria-hidden="true" />
                  SnowSense forecast
                </Link>
                <a
                  href={d.websiteUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 rounded-full border border-white/10 px-3 py-1.5 text-xs font-semibold text-purple-300/90 hover:border-white/20 hover:text-purple-200 transition-colors"
                >
                  Official site
                  <ExternalLink className="w-3 h-3" aria-hidden="true" />
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
