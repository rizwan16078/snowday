import Link from "next/link";
import {
  Building2,
  CloudSnow,
  ExternalLink,
  MapPin,
  Snowflake,
} from "lucide-react";
import type { StormEvent } from "@/lib/storm-events";
import type { CityComparisonNote } from "@/lib/high-intent-content";

interface DistrictAuthorityLink {
  slug: string;
  name: string;
  enrollment: number;
  type: string;
  websiteUrl: string;
  websiteDomain: string;
}

interface Props {
  cityName: string;
  thresholdLabel: string;
  thresholdContext: string;
  districts: DistrictAuthorityLink[];
  storms: StormEvent[];
  comparisons: CityComparisonNote[];
}

function formatStormDate(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function HighIntentCitySection({
  cityName,
  thresholdLabel,
  thresholdContext,
  districts,
  storms,
  comparisons,
}: Props) {
  if (districts.length === 0 && storms.length === 0 && comparisons.length === 0) {
    return null;
  }

  return (
    <section
      className="relative z-10 py-16 px-4"
      aria-label={`${cityName} school-closure authority`}
    >
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-8">
          <p className="text-[10px] text-blue-400/70 uppercase tracking-[0.3em] font-bold mb-2">
            High-Intent Local Detail
          </p>
          <h3 className="text-2xl sm:text-3xl font-display font-black text-white">
            Why schools in {cityName.split(",")[0]} close when they do
          </h3>
          <p className="text-sm text-white/45 max-w-2xl mx-auto mt-3">
            This page goes deeper on the local thresholds, official district sources,
            recent winter events, and the nearby cities that make a different call.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="glass-card rounded-3xl p-6">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center">
                <Snowflake className="w-5 h-5 text-blue-400" aria-hidden="true" />
              </div>
              <div>
                <p className="text-[10px] text-white/35 uppercase tracking-[0.28em] font-bold">
                  Local threshold
                </p>
                <h3 className="text-lg font-display font-black text-white">
                  {thresholdLabel}
                </h3>
              </div>
            </div>
            <p className="text-sm text-white/55 leading-relaxed">
              {thresholdContext}
            </p>
          </div>

          <div className="glass-card rounded-3xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center">
                <Building2 className="w-5 h-5 text-purple-400" aria-hidden="true" />
              </div>
              <div>
                <p className="text-[10px] text-white/35 uppercase tracking-[0.28em] font-bold">
                  Official districts
                </p>
                <h3 className="text-lg font-display font-black text-white">
                  Forecast pages and district websites
                </h3>
              </div>
            </div>
            <div className="space-y-3">
              {districts.slice(0, 3).map((district) => (
                <div
                  key={district.slug}
                  className="rounded-2xl border border-white/5 bg-white/[0.02] px-4 py-3"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-sm font-bold text-white/90 truncate">
                        {district.name}
                      </p>
                      <p className="text-[11px] text-white/40 uppercase tracking-wider mt-1">
                        {district.enrollment.toLocaleString("en-US")} students · {district.type}
                      </p>
                    </div>
                  </div>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <Link
                      href={`/school-district/${district.slug}`}
                      className="inline-flex items-center gap-1.5 rounded-full bg-white/8 px-3 py-1.5 text-xs font-semibold text-white/80 hover:bg-white/12 hover:text-white transition-colors"
                    >
                      SnowSense forecast
                    </Link>
                    <a
                      href={district.websiteUrl}
                      target="_blank"
                      rel="nofollow noopener noreferrer"
                      className="inline-flex items-center gap-1.5 rounded-full border border-white/10 px-3 py-1.5 text-xs font-semibold text-blue-300/90 hover:border-white/20 hover:text-blue-200 transition-colors"
                    >
                      Official site
                      <ExternalLink className="w-3 h-3" aria-hidden="true" />
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {storms.length > 0 && (
            <div className="glass-card rounded-3xl p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-sky-500/10 flex items-center justify-center">
                  <CloudSnow className="w-5 h-5 text-sky-400" aria-hidden="true" />
                </div>
                <div>
                  <p className="text-[10px] text-white/35 uppercase tracking-[0.28em] font-bold">
                    Recent storm examples
                  </p>
                  <h3 className="text-lg font-display font-black text-white">
                    Local events that actually mattered
                  </h3>
                </div>
              </div>
              <div className="space-y-3">
                {storms.slice(0, 2).map((storm, index) => (
                  <div
                    key={`${storm.date}-${index}`}
                    className="rounded-2xl border border-white/5 bg-white/[0.02] px-4 py-3"
                  >
                    <div className="flex items-baseline justify-between gap-3 mb-2">
                      <p className="text-sm font-bold text-white/90">{storm.type}</p>
                      <span className="text-[11px] text-white/35 uppercase tracking-wider">
                        {formatStormDate(storm.date)}
                      </span>
                    </div>
                    {typeof storm.snowfallInches === "number" && (
                      <p className="text-[11px] text-sky-300/80 uppercase tracking-wider font-semibold mb-1.5">
                        {`${storm.snowfallInches}" measured`}
                      </p>
                    )}
                    <p className="text-sm text-white/55 leading-relaxed">
                      {storm.narrative}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {comparisons.length > 0 && (
            <div className="glass-card rounded-3xl p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center">
                  <MapPin className="w-5 h-5 text-amber-400" aria-hidden="true" />
                </div>
                <div>
                  <p className="text-[10px] text-white/35 uppercase tracking-[0.28em] font-bold">
                    Nearby city contrast
                  </p>
                  <h3 className="text-lg font-display font-black text-white">
                    Why nearby places may decide differently
                  </h3>
                </div>
              </div>
              <div className="space-y-3">
                {comparisons.map((comparison) => (
                  <div
                    key={comparison.slug}
                    className="rounded-2xl border border-white/5 bg-white/[0.02] px-4 py-3"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="text-sm font-bold text-white/90">
                          {comparison.label}
                        </p>
                        <p className="mt-1.5 text-sm text-white/55 leading-relaxed">
                          {comparison.reason}
                        </p>
                      </div>
                      <Link
                        href={`/snow-day-calculator/${comparison.slug}`}
                        className="shrink-0 text-xs font-semibold text-amber-300/90 hover:text-amber-200 transition-colors"
                      >
                        Compare
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
