import type { Metadata } from "next";
import Link from "next/link";
import { breadcrumbListSchema } from "@/lib/breadcrumb-schema";
import {
  ALL_CITIES,
  getAllStateSlugs,
  getTopCitiesByPopulation,
  STATE_NAMES,
  CITIES_BY_STATE_SLUG,
} from "@/lib/cities/helpers";
import {
  ALL_DISTRICTS,
  getTopDistrictsByEnrollment,
} from "@/lib/districts/helpers";

export const metadata: Metadata = {
  title: `Snow Day Calculator by ZIP Code, City, or District — ${ALL_CITIES.length}+ US Cities`,
  description: `Live snow day predictions for ${ALL_CITIES.length}+ US cities across all 50 states. Search by ZIP code, city, or district, or use your auto-detected location. Updated every 30 minutes.`,
  alternates: {
    canonical: "/snow-day-calculator",
  },
};

export default function SnowDayIndexPage() {
  const breadcrumbSchema = breadcrumbListSchema([
    { name: "Home", path: "/" },
    { name: "Snow Day Calculator", path: "/snow-day-calculator" },
  ]);

  // Top-12 populous cities for the featured grid (dynamic from catalog).
  const featured = getTopCitiesByPopulation(12);

  // Top-12 districts by enrollment for the districts section.
  const topDistricts = getTopDistrictsByEnrollment(12);

  // Every state we have at least one city for, sorted alphabetically.
  const stateSlugs = getAllStateSlugs();

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <main
        className="min-h-screen px-4 py-16 max-w-5xl mx-auto"
        role="main"
      >
        <header className="text-center mb-12">
          <p className="text-[10px] text-blue-400/70 uppercase tracking-[0.3em] font-bold mb-3">
            Snow Day Index
          </p>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-black font-display text-white mb-4">
            Find Your Snow Day Probability
          </h1>
          <p className="text-white/55 text-base sm:text-lg max-w-2xl mx-auto leading-relaxed">
            Search by ZIP code, city, or district to get the live snow day probability for{" "}
            <strong className="text-white/80">
              {ALL_CITIES.length.toLocaleString()} US cities
            </strong>{" "}
            across all {stateSlugs.length} covered states, or start with your
            auto-detected location.
          </p>
        </header>

        {/* Featured populous cities */}
        <section aria-label="Featured city predictions" className="mb-14">
          <h2 className="text-xs text-white/40 uppercase tracking-widest font-bold mb-4">
            Popular cities
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {featured.map((city) => (
              <Link
                key={city.slug}
                href={`/snow-day-calculator/${city.slug}`}
                className="glass-card rounded-2xl px-4 py-4 text-sm font-semibold text-white/80 hover:text-white transition-all hover:scale-[1.02] flex items-center gap-2"
              >
                <span aria-hidden="true">📍</span>
                <span className="truncate">
                  {city.name}, {city.state}
                </span>
              </Link>
            ))}
          </div>
        </section>

        {/* Top school districts — discoverability for /school-district/[slug] */}
        <section aria-label="Top school districts" className="mb-14">
          <h2 className="text-xs text-white/40 uppercase tracking-widest font-bold mb-4">
            Top school districts ({ALL_DISTRICTS.length})
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
            {topDistricts.map((d) => (
              <Link
                key={d.slug}
                href={`/school-district/${d.slug}`}
                className="group flex items-center justify-between rounded-xl border border-white/5 bg-white/[0.02] px-3 py-2.5 hover:bg-white/[0.06] hover:border-white/10 transition-all"
              >
                <div className="min-w-0">
                  <div className="text-sm font-medium text-white/80 group-hover:text-white truncate">
                    {d.name}
                  </div>
                  <div className="text-[10px] text-white/30 uppercase tracking-widest mt-0.5">
                    {d.city.name}, {d.state} · {d.enrollment.toLocaleString("en-US")} students
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* Browse by state */}
        <section aria-label="Browse by state" className="mb-14">
          <h2 className="text-xs text-white/40 uppercase tracking-widest font-bold mb-4">
            Browse by state ({stateSlugs.length})
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
            {stateSlugs.map((slug) => {
              const cityCount = CITIES_BY_STATE_SLUG.get(slug)?.length ?? 0;
              // Derive state code from the first city in that state
              const firstCity = CITIES_BY_STATE_SLUG.get(slug)?.[0];
              const stateName = firstCity
                ? STATE_NAMES[firstCity.state] ?? slug
                : slug;
              return (
                <Link
                  key={slug}
                  href={`/snow-day-calculator/state/${slug}`}
                  className="group flex items-center justify-between rounded-xl border border-white/5 bg-white/[0.02] px-3 py-2.5 hover:bg-white/[0.06] hover:border-white/10 transition-all"
                >
                  <span className="text-sm font-medium text-white/75 group-hover:text-white truncate">
                    {stateName}
                  </span>
                  <span className="text-[10px] text-white/30 uppercase tracking-widest ml-2 shrink-0">
                    {cityCount}
                  </span>
                </Link>
              );
            })}
          </div>
        </section>

        <div className="text-center">
          <Link
            href="/prediction"
            className="inline-flex items-center gap-2 px-8 py-3 rounded-2xl font-bold text-sm text-white"
            style={{
              background: "linear-gradient(135deg,#1d4ed8,#3b82f6)",
              boxShadow: "0 4px 20px rgba(59,130,246,0.3)",
            }}
          >
            🔮 Use Auto-Detected Location
          </Link>
        </div>
      </main>
    </>
  );
}
