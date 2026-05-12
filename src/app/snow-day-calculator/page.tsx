import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Snow Day Calculator by Location",
  description:
    "Find snow day predictions for any US city, zip code, or school district. Real-time forecasts powered by SnowSense™.",
  alternates: {
    canonical: "/snow-day-calculator",
  },
};

const featuredCities = [
  { name: "Boston, MA", slug: "boston-ma" },
  { name: "Chicago, IL", slug: "chicago-il" },
  { name: "New York, NY", slug: "new-york-ny" },
  { name: "Denver, CO", slug: "denver-co" },
  { name: "Minneapolis, MN", slug: "minneapolis-mn" },
  { name: "Pittsburgh, PA", slug: "pittsburgh-pa" },
  { name: "Buffalo, NY", slug: "buffalo-ny" },
  { name: "Cleveland, OH", slug: "cleveland-oh" },
  { name: "Detroit, MI", slug: "detroit-mi" },
  { name: "Philadelphia, PA", slug: "philadelphia-pa" },
  { name: "Washington, DC", slug: "washington-dc" },
  { name: "Hartford, CT", slug: "hartford-ct" },
];

export default function SnowDayIndexPage() {
  return (
    <main className="min-h-screen px-4 py-16 max-w-4xl mx-auto" role="main">
      <header className="text-center mb-12">
        <h1 className="text-4xl font-black font-display text-white mb-3">
          ❄️ Snow Day Calculator by Location
        </h1>
        <p className="text-white/50 max-w-xl mx-auto">
          Pick your city to get a real-time snow day prediction powered by SnowSense™.
        </p>
      </header>

      <section aria-label="Featured city predictions">
        <h2 className="text-xs text-white/40 uppercase tracking-widest font-bold mb-4">
          Popular Cities
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          {featuredCities.map((city) => (
            <Link
              key={city.slug}
              href={`/snow-day-calculator/${city.slug}`}
              className="glass-card rounded-2xl px-4 py-4 text-sm font-semibold text-white/80 hover:text-white transition-all hover:scale-[1.02] flex items-center gap-2"
            >
              <span aria-hidden="true">📍</span>
              {city.name}
            </Link>
          ))}
        </div>
      </section>

      <div className="mt-10 text-center">
        <Link
          href="/prediction"
          className="inline-flex items-center gap-2 px-8 py-3 rounded-2xl font-bold text-sm text-white"
          style={{ background: "linear-gradient(135deg,#1d4ed8,#3b82f6)", boxShadow: "0 4px 20px rgba(59,130,246,0.3)" }}
        >
          🔮 Use My Location
        </Link>
      </div>
    </main>
  );
}
