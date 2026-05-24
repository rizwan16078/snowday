import type { Metadata } from "next";
import Link from "next/link";
import { breadcrumbListSchema } from "@/lib/breadcrumb-schema";
import { ALL_CITIES, CITIES_BY_STATE_SLUG, STATE_NAMES, getTopCitiesByPopulation } from "@/lib/cities/helpers";
import { ALL_DISTRICTS } from "@/lib/districts/helpers";
import {
  Building2,
  Search,
  MapPin,
  ArrowRight,
  AlertCircle,
  Clock,
  Snowflake,
} from "lucide-react";

export const metadata: Metadata = {
  title: "School Closings & Delays — Is School Closed Today?",
  description:
    "Check school closings and delays by state, city, or district. SnowSense tracks snow day probability across all 50 states — updated every 30 minutes with live weather data.",
  alternates: { canonical: "/school-closings" },
  openGraph: {
    type: "website",
    url: "https://www.snowdaycalculate.com/school-closings",
    title: "School Closings & Delays — SnowSense™",
    description:
      "Is school closed today? Check snow day probability for your district. Updated every 30 minutes with live NWS weather data.",
    images: [{ url: "/og-default.svg", width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary_large_image",
    title: "School Closings & Delays — Is School Closed Today?",
    description:
      "Check school closings and delays by state, city, or district. Live snow day probability updated every 30 minutes.",
  },
};

const breadcrumbSchema = breadcrumbListSchema([
  { name: "Home", path: "/" },
  { name: "School Closings", path: "/school-closings" },
]);

const featuredCities = getTopCitiesByPopulation(20);

export default function SchoolClosingsPage() {
  const stateSlugs = Array.from(CITIES_BY_STATE_SLUG.keys()).sort();

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "FAQPage",
            mainEntity: [
              {
                "@type": "Question",
                name: "Is school closed today in my area?",
                acceptedAnswer: {
                  "@type": "Answer",
                  text: `SnowSense provides live snow day probability for ${ALL_CITIES.length}+ US cities and ${ALL_DISTRICTS.length} school districts. Enter your ZIP code or city on the homepage to get an instant prediction. For official closure announcements, check your district's website or local TV station.`,
                },
              },
              {
                "@type": "Question",
                name: "What time are school closings announced?",
                acceptedAnswer: {
                  "@type": "Answer",
                  text: "Most school closure decisions are announced between 4 AM and 6 AM. Southern districts sometimes announce the night before if even minor accumulation is forecast. Check your district's alert system for automated notifications.",
                },
              },
              {
                "@type": "Question",
                name: "What is the difference between a snow day and a 2-hour delay?",
                acceptedAnswer: {
                  "@type": "Answer",
                  text: "A snow day means school is fully closed for the day. A 2-hour delay means school starts 2 hours late, giving road crews time to clear routes before buses run. Districts may upgrade a delay to a full closure if conditions don't improve by 7 AM.",
                },
              },
            ],
          }),
        }}
      />

      <main className="min-h-screen px-4 py-16 max-w-5xl mx-auto">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-xs text-white/50 mb-8">
          <Link href="/" className="hover:text-white/50 transition-colors">Home</Link>
          <span>›</span>
          <span className="text-white/50">School Closings</span>
        </nav>

        {/* Header */}
        <header className="mb-12">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-xl bg-blue-600/10 flex items-center justify-center">
              <Building2 className="w-6 h-6 text-blue-400" />
            </div>
            <p className="text-[10px] text-blue-400/70 uppercase tracking-[0.3em] font-bold">
              School Closings & Delays
            </p>
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-black font-display text-white mb-4">
            Is School Closed Today?
          </h1>
          <p className="text-white/55 text-base sm:text-lg max-w-3xl leading-relaxed">
            Check snow day probability for your city or district. SnowSense tracks
            <strong className="text-white/80"> {ALL_CITIES.length}+ cities</strong> and{" "}
            <strong className="text-white/80">{ALL_DISTRICTS.length} school districts</strong>{" "}
            across all 50 states with live weather data updated every 30 minutes.
          </p>
        </header>

        {/* Quick Check CTA */}
        <section className="mb-12 glass-card rounded-2xl p-6 sm:p-8 text-center">
          <Search className="w-8 h-8 text-blue-400 mx-auto mb-3" />
          <h2 className="text-xl font-bold text-white mb-2">Check Your District Now</h2>
          <p className="text-white/50 text-sm mb-4">
            Enter your ZIP code, city, or district name for an instant snow day prediction.
          </p>
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-8 py-3 rounded-2xl font-bold text-sm text-white"
            style={{
              background: "linear-gradient(135deg,#1d4ed8,#3b82f6)",
              boxShadow: "0 4px 20px rgba(59,130,246,0.3)",
            }}
          >
            <Snowflake className="w-4 h-4" />
            Check Snow Day Probability
          </Link>
        </section>

        {/* How It Works */}
        <section className="mb-12">
          <h2 className="text-xl font-bold text-white mb-6">How School Closings Work</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              {
                icon: Clock,
                title: "4–6 AM Decision Window",
                desc: "Superintendents drive routes, review road crew reports, and make the call. Announcements go out via automated text/call, district websites, and local TV.",
              },
              {
                icon: AlertCircle,
                title: "Delay vs. Closure",
                desc: "Districts often issue a 2-hour delay first, then upgrade to a full closure if conditions don't improve. A delay gives plows time to clear before buses run.",
              },
              {
                icon: MapPin,
                title: "Regional Coordination",
                desc: "Neighboring districts often coordinate closure decisions. Parents working across district lines need consistent schedules. Federal office status (OPM) influences DC-area decisions.",
              },
            ].map((step) => (
              <div key={step.title} className="glass-card rounded-xl p-5">
                <step.icon className="w-6 h-6 text-blue-400 mb-3" />
                <h3 className="text-sm font-bold text-white mb-2">{step.title}</h3>
                <p className="text-xs text-white/50 leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Closure Types Table */}
        <section className="mb-12">
          <h2 className="text-xl font-bold text-white mb-4">Types of School Weather Closures</h2>
          <div className="overflow-x-auto rounded-2xl border border-white/5">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-white/[0.03]">
                  <th className="px-4 py-3 text-left text-white/60 font-bold">Type</th>
                  <th className="px-4 py-3 text-left text-white/60 font-bold">What It Means</th>
                  <th className="px-4 py-3 text-left text-white/60 font-bold">Typical Trigger</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { type: "Snow Day", meaning: "School fully closed", trigger: "Heavy snowfall, ice, or dangerous roads" },
                  { type: "2-Hour Delay", meaning: "School starts 2 hours late", trigger: "Overnight snow that crews can clear by 8–9 AM" },
                  { type: "Early Dismissal", meaning: "School closes mid-day", trigger: "Storm arriving during school hours" },
                  { type: "Cold Day", meaning: "School closed for extreme cold", trigger: "Wind chill below -20°F (varies by region)" },
                  { type: "E-Learning Day", meaning: "Remote learning replaces in-person", trigger: "Any weather condition — growing trend post-COVID" },
                ].map((row) => (
                  <tr key={row.type} className="border-b border-white/[0.03]">
                    <td className="px-4 py-3 text-blue-300 font-bold">{row.type}</td>
                    <td className="px-4 py-3 text-white/70">{row.meaning}</td>
                    <td className="px-4 py-3 text-white/50">{row.trigger}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* Popular Cities */}
        <section className="mb-14">
          <h2 className="text-xs text-white/50 uppercase tracking-widest font-bold mb-4">
            Popular cities
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {featuredCities.map((city) => (
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

        {/* Browse by State */}
        <section className="mb-14">
          <h2 className="text-xs text-white/50 uppercase tracking-widest font-bold mb-4">
            Browse school closings by state ({stateSlugs.length})
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
            {stateSlugs.map((slug) => {
              const citiesInState = CITIES_BY_STATE_SLUG.get(slug) ?? [];
              const firstCity = citiesInState[0];
              const stateName = firstCity
                ? STATE_NAMES[firstCity.state] ?? slug
                : slug;
              return (
                <Link
                  key={slug}
                  href={`/school-closings/${slug}`}
                  className="group flex items-center justify-between rounded-xl border border-white/5 bg-white/[0.02] px-3 py-2.5 hover:bg-white/[0.06] hover:border-white/10 transition-all"
                >
                  <span className="text-sm font-medium text-white/75 group-hover:text-white truncate">
                    {stateName}
                  </span>
                  <span className="text-[10px] text-white/50 uppercase tracking-widest ml-2 shrink-0">
                    {citiesInState.length} cities
                  </span>
                </Link>
              );
            })}
          </div>
        </section>

        {/* Top Districts */}
        <section className="mb-14">
          <h2 className="text-xs text-white/50 uppercase tracking-widest font-bold mb-4">
            Top school districts ({ALL_DISTRICTS.length})
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
            {ALL_DISTRICTS.slice(0, 24).map((d) => (
              <Link
                key={d.slug}
                href={`/school-district/${d.slug}`}
                className="group flex items-center justify-between rounded-xl border border-white/5 bg-white/[0.02] px-3 py-2.5 hover:bg-white/[0.06] hover:border-white/10 transition-all"
              >
                <div className="min-w-0">
                  <div className="text-sm font-medium text-white/80 group-hover:text-white truncate">
                    {d.name}
                  </div>
                  <div className="text-[10px] text-white/50 uppercase tracking-widest mt-0.5">
                    {d.city.name}, {d.state}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* Browse by City */}
        <section className="mb-14">
          <h2 className="text-xs text-white/50 uppercase tracking-widest font-bold mb-4">
            Browse by City — Is School Closed Near You?
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
            {getTopCitiesByPopulation(24).map((city) => (
              <Link
                key={city.slug}
                href={`/school-closings/city/${city.slug}`}
                className="group flex items-center justify-between rounded-xl border border-white/5 bg-white/[0.02] px-3 py-2.5 hover:bg-white/[0.06] hover:border-white/10 transition-all"
              >
                <div className="min-w-0">
                  <div className="text-sm font-medium text-white/80 group-hover:text-white truncate">
                    {city.displayName}
                  </div>
                  <div className="text-[10px] text-white/50 uppercase tracking-widest mt-0.5">
                    {city.snowInches}" avg snow
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* CTA */}
        <div className="text-center">
          <Link
            href="/snow-day-calculator"
            className="inline-flex items-center gap-2 px-8 py-3 rounded-2xl font-bold text-sm text-white"
            style={{
              background: "linear-gradient(135deg,#1d4ed8,#3b82f6)",
              boxShadow: "0 4px 20px rgba(59,130,246,0.3)",
            }}
          >
            View All Snow Day Calculators
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </main>
    </>
  );
}
