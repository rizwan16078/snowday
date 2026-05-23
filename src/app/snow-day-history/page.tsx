import type { Metadata } from "next";
import Link from "next/link";
import { breadcrumbListSchema } from "@/lib/breadcrumb-schema";
import { getRecentStorms, getStormDataCityCount } from "@/lib/storm-events";
import { ALL_CITIES, getTopCitiesByPopulation } from "@/lib/cities/helpers";
import {
  History,
  Snowflake,
  Wind,
  Thermometer,
  ArrowRight,
  AlertTriangle,
  TrendingUp,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Biggest Snowstorms & Snow Day History — US Winter Storm Records",
  description:
    "The biggest snowstorms in US history and how many snow days they caused. From the Blizzard of 1888 to the Polar Vortex — storm records, snow totals, and school closure impacts.",
  alternates: { canonical: "/snow-day-history" },
  openGraph: {
    type: "website",
    url: "https://www.snowdaycalculate.com/snow-day-history",
    title: "Biggest Snowstorms & Snow Day History — SnowSense™",
    description:
      "The biggest snowstorms in US history and how many snow days they caused. Storm records, snow totals, and school closure impacts.",
    images: [{ url: "/og-default.svg", width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Biggest Snowstorms & Snow Day History",
    description:
      "The biggest snowstorms in US history and how many snow days they caused.",
  },
};

const breadcrumbSchema = breadcrumbListSchema([
  { name: "Home", path: "/" },
  { name: "Snow Day History", path: "/snow-day-history" },
]);

// Curated list of historically significant US winter storms
const HISTORIC_STORMS = [
  {
    name: "The Great Blizzard of 1888",
    date: "March 11–14, 1888",
    location: "Northeast US",
    snowfall: "50 inches (Saratoga Springs, NY)",
    wind: "80 mph gusts",
    impact: "400+ deaths. NYC paralyzed for 2 weeks. The storm that invented the subway — NYC decided to build underground transit because surface transportation failed so completely.",
    schoolDays: "2+ weeks of closures across the Northeast",
  },
  {
    name: "The Blizzard of 1978",
    date: "February 5–7, 1978",
    location: "New England & New York",
    snowfall: "27 inches (Boston), 38 inches (Rhode Island)",
    wind: "111 mph gusts (Blue Hill Observatory)",
    impact: "73 deaths, 4,500+ injuries. MA and RI declared states of emergency. Thousands stranded on highways. School closures lasted a full week across most of New England.",
    schoolDays: "5–7 days across New England",
  },
  {
    name: "Superstorm 1993 (Storm of the Century)",
    date: "March 12–15, 1993",
    location: "Entire US East Coast",
    snowfall: "56 inches (Mt. LeConte, TN), 50 inches (Mt. Mitchell, NC)",
    wind: "144 mph gusts (Mt. Washington)",
    impact: "318 deaths. 26 states affected. Every major airport on the East Coast closed simultaneously. Thunder snow reported from Alabama to Pennsylvania.",
    schoolDays: "3–5 days across 26 states",
  },
  {
    name: "The Blizzard of 1996",
    date: "January 6–8, 1996",
    location: "Northeast & Mid-Atlantic",
    snowfall: "48 inches (Poughkeepsie, NY), 30 inches (Philadelphia)",
    wind: "50 mph sustained",
    impact: "NYC recorded 20 inches — the largest single-storm total since 1947. The storm was followed by a second system 4 days later, producing another 10–15 inches. Schools closed for the entire week in PA, NJ, and NY.",
    schoolDays: "5 days across the Mid-Atlantic",
  },
  {
    name: "Snowmageddon (2010)",
    date: "February 5–6, 2010",
    location: "Mid-Atlantic",
    snowfall: "40 inches (Baltimore County), 32 inches (Dulles Airport, DC)",
    wind: "60 mph gusts",
    impact: "Two back-to-back blizzards hit DC within 5 days. The federal government shut down for 4 days. DC's Metro rail system above-ground sections froze. Roofs collapsed under the weight of 3+ feet of snow.",
    schoolDays: "5–7 days across DC, MD, VA",
  },
  {
    name: "Winter Storm Nemo (2013)",
    date: "February 8–9, 2013",
    location: "New England",
    snowfall: "40 inches (Hamden, CT), 33 inches (Portland, ME)",
    wind: "83 mph gusts (Falmouth, MA)",
    impact: "Boston's 5th biggest snowstorm on record. Over 650,000 power outages. CT and MA governors banned all road travel. Schools closed for 3–5 days.",
    schoolDays: "3–5 days across CT, MA, ME",
  },
  {
    name: "The 2014–15 Boston Winter",
    date: "January–March 2015",
    location: "Boston, MA",
    snowfall: "110.6 inches (season total)",
    wind: "Multiple blizzard events",
    impact: "The snowiest winter in Boston's recorded history. Three major blizzards in 3 weeks. The MBTA transit system collapsed. Snow piles remained in parking lots until July. Schools used 7+ snow days, forcing calendar extensions.",
    schoolDays: "7–10 days across metro Boston",
  },
  {
    name: "The Polar Vortex (January 2019)",
    date: "January 29–31, 2019",
    location: "Midwest & Great Lakes",
    snowfall: "Moderate snowfall (storm was primarily a cold event)",
    wind: "Wind chills of -50°F to -60°F",
    impact: "Chicago hit -23°F actual temperature, -50°F wind chill. Over 1,500 flight cancellations at O'Hare. USPS suspended mail delivery in 6 states. Schools closed for 3 days across IL, WI, MN, MI — not for snow, but for cold.",
    schoolDays: "3 days (cold days, not snow days)",
  },
];

export default function SnowDayHistoryPage() {
  const topCities = getTopCitiesByPopulation(8);
  const stormCities = topCities
    .map((c) => ({ ...c, storms: getRecentStorms(c.slug, 3) }))
    .filter((c) => c.storms.length > 0);

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
                name: "What was the biggest snowstorm in US history?",
                acceptedAnswer: {
                  "@type": "Answer",
                  text: "The Superstorm of 1993 (Storm of the Century) affected 26 states and dumped up to 56 inches of snow. The Great Blizzard of 1888 paralyzed the Northeast for 2 weeks with 50 inches of snow and 80 mph winds.",
                },
              },
              {
                "@type": "Question",
                name: "What winter caused the most snow days in Boston?",
                acceptedAnswer: {
                  "@type": "Answer",
                  text: "The 2014–15 winter produced 110.6 inches of snow — Boston's snowiest season on record. Schools used 7–10 snow days, forcing calendar extensions into summer. Snow piles remained in parking lots until July.",
                },
              },
              {
                "@type": "Question",
                name: "Can schools close for cold weather without snow?",
                acceptedAnswer: {
                  "@type": "Answer",
                  text: "Yes. During the January 2019 Polar Vortex, wind chills hit -50°F to -60°F across the Midwest. Schools in IL, WI, MN, and MI closed for 3 days for cold alone — no snow required.",
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
          <span className="text-white/50">Snow Day History</span>
        </nav>

        {/* Header */}
        <header className="mb-12">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-xl bg-blue-600/10 flex items-center justify-center">
              <History className="w-6 h-6 text-blue-400" />
            </div>
            <p className="text-[10px] text-blue-400/70 uppercase tracking-[0.3em] font-bold">
              Winter Storm Records
            </p>
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-black font-display text-white mb-4">
            Biggest Snowstorms & Snow Day History
          </h1>
          <p className="text-white/55 text-base sm:text-lg max-w-3xl leading-relaxed">
            The storms that shut down schools for weeks, paralyzed entire cities, and
            rewrote the record books. From the Blizzard of 1888 to the Polar Vortex —
            how much snow it takes to bring a city to a halt.
          </p>
        </header>

        {/* Timeline */}
        <section className="mb-16">
          <h2 className="text-xl font-bold text-white mb-8 flex items-center gap-2">
            <Snowflake className="w-5 h-5 text-blue-400" />
            Historic Winter Storms That Shut Down Schools
          </h2>

          <div className="relative">
            {/* Timeline line */}
            <div className="absolute left-4 sm:left-6 top-0 bottom-0 w-px bg-blue-500/20" />

            <div className="space-y-8">
              {HISTORIC_STORMS.map((storm, i) => (
                <div key={storm.name} className="relative pl-12 sm:pl-16">
                  {/* Timeline dot */}
                  <div className="absolute left-2 sm:left-4 top-2 w-4 h-4 rounded-full bg-blue-500/30 border-2 border-blue-400" />

                  <div className="glass-card rounded-2xl p-5 sm:p-6">
                    <div className="flex flex-wrap items-start justify-between gap-2 mb-3">
                      <h3 className="text-lg font-bold text-white">{storm.name}</h3>
                      <span className="text-[10px] text-blue-400/70 uppercase tracking-widest font-bold">
                        {storm.date}
                      </span>
                    </div>
                    <p className="text-sm text-blue-300 mb-3">{storm.location}</p>

                    {/* Storm stats */}
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-4">
                      <div className="bg-white/[0.03] rounded-lg p-3">
                        <div className="text-[10px] text-white/40 uppercase tracking-widest mb-1">Snowfall</div>
                        <div className="text-sm font-bold text-white/80 flex items-center gap-1">
                          <Snowflake className="w-3 h-3 text-blue-400" />
                          {storm.snowfall.split("(")[0].trim()}
                        </div>
                      </div>
                      <div className="bg-white/[0.03] rounded-lg p-3">
                        <div className="text-[10px] text-white/40 uppercase tracking-widest mb-1">Wind</div>
                        <div className="text-sm font-bold text-white/80 flex items-center gap-1">
                          <Wind className="w-3 h-3 text-blue-400" />
                          {storm.wind}
                        </div>
                      </div>
                      <div className="bg-white/[0.03] rounded-lg p-3 col-span-2 sm:col-span-1">
                        <div className="text-[10px] text-white/40 uppercase tracking-widest mb-1">School Closures</div>
                        <div className="text-sm font-bold text-red-300 flex items-center gap-1">
                          <AlertTriangle className="w-3 h-3 text-red-400" />
                          {storm.schoolDays}
                        </div>
                      </div>
                    </div>

                    <p className="text-sm text-white/50 leading-relaxed">{storm.impact}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Snowfall Records Table */}
        <section className="mb-12">
          <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-blue-400" />
            Single-Storm Snowfall Records by City
          </h2>
          <div className="overflow-x-auto rounded-2xl border border-white/5">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-white/[0.03]">
                  <th className="px-4 py-3 text-left text-white/60 font-bold">City</th>
                  <th className="px-4 py-3 text-left text-white/60 font-bold">Record Snowfall</th>
                  <th className="px-4 py-3 text-left text-white/60 font-bold">Storm</th>
                  <th className="px-4 py-3 text-left text-white/60 font-bold">Year</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { city: "Buffalo, NY", snow: "81.5\"", storm: "December 2022 Blizzard", year: "2022" },
                  { city: "Rochester, NY", snow: "46.8\"", storm: "Blizzard of 1966", year: "1966" },
                  { city: "Boston, MA", snow: "27.6\"", storm: "Blizzard of 2003", year: "2003" },
                  { city: "NYC (Central Park)", snow: "26.9\"", storm: "Blizzard of 2006", year: "2006" },
                  { city: "Philadelphia, PA", snow: "30.7\"", storm: "Blizzard of 1996", year: "1996" },
                  { city: "Chicago, IL", snow: "23.0\"", storm: "Blizzard of 1967", year: "1967" },
                  { city: "Washington, DC", snow: "28.0\"", storm: "Snowmageddon", year: "2010" },
                  { city: "Denver, CO", snow: "25.8\"", storm: "December 1913 Storm", year: "1913" },
                ].map((row) => (
                  <tr key={row.city} className="border-b border-white/[0.03]">
                    <td className="px-4 py-3 text-white/80 font-medium">{row.city}</td>
                    <td className="px-4 py-3 text-blue-300 font-bold">{row.snow}</td>
                    <td className="px-4 py-3 text-white/60">{row.storm}</td>
                    <td className="px-4 py-3 text-white/50">{row.year}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* Recent Storms by City */}
        {stormCities.length > 0 && (
          <section className="mb-12">
            <h2 className="text-xl font-bold text-white mb-6">Recent Notable Storms by City</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {stormCities.map((city) => (
                <div key={city.slug} className="glass-card rounded-xl p-5">
                  <h3 className="text-sm font-bold text-white mb-3">{city.displayName}</h3>
                  <div className="space-y-2">
                    {city.storms.map((storm, i) => (
                      <div key={i} className="flex items-start gap-2 text-xs">
                        <span className="text-white/30 shrink-0">{storm.date}</span>
                        <span className="text-white/50">{storm.type}{storm.snowfallInches ? ` — ${storm.snowfallInches}"` : ""}</span>
                      </div>
                    ))}
                  </div>
                  <Link
                    href={`/snow-day-calculator/${city.slug}`}
                    className="text-xs text-blue-300 hover:text-blue-200 mt-2 inline-block"
                  >
                    View current prediction →
                  </Link>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Browse by State */}
        <section className="mb-14">
          <h2 className="text-xs text-white/50 uppercase tracking-widest font-bold mb-4">
            Snow Day History by State
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
            {[
              { slug: "alabama", name: "Alabama" },
              { slug: "alaska", name: "Alaska" },
              { slug: "arizona", name: "Arizona" },
              { slug: "arkansas", name: "Arkansas" },
              { slug: "california", name: "California" },
              { slug: "colorado", name: "Colorado" },
              { slug: "connecticut", name: "Connecticut" },
              { slug: "delaware", name: "Delaware" },
              { slug: "florida", name: "Florida" },
              { slug: "georgia", name: "Georgia" },
              { slug: "idaho", name: "Idaho" },
              { slug: "illinois", name: "Illinois" },
              { slug: "indiana", name: "Indiana" },
              { slug: "iowa", name: "Iowa" },
              { slug: "kansas", name: "Kansas" },
              { slug: "kentucky", name: "Kentucky" },
              { slug: "louisiana", name: "Louisiana" },
              { slug: "maine", name: "Maine" },
              { slug: "maryland", name: "Maryland" },
              { slug: "massachusetts", name: "Massachusetts" },
              { slug: "michigan", name: "Michigan" },
              { slug: "minnesota", name: "Minnesota" },
              { slug: "mississippi", name: "Mississippi" },
              { slug: "missouri", name: "Missouri" },
              { slug: "montana", name: "Montana" },
              { slug: "nebraska", name: "Nebraska" },
              { slug: "nevada", name: "Nevada" },
              { slug: "new-hampshire", name: "New Hampshire" },
              { slug: "new-jersey", name: "New Jersey" },
              { slug: "new-mexico", name: "New Mexico" },
              { slug: "new-york", name: "New York" },
              { slug: "north-carolina", name: "North Carolina" },
              { slug: "north-dakota", name: "North Dakota" },
              { slug: "ohio", name: "Ohio" },
              { slug: "oklahoma", name: "Oklahoma" },
              { slug: "oregon", name: "Oregon" },
              { slug: "pennsylvania", name: "Pennsylvania" },
              { slug: "rhode-island", name: "Rhode Island" },
              { slug: "south-carolina", name: "South Carolina" },
              { slug: "south-dakota", name: "South Dakota" },
              { slug: "tennessee", name: "Tennessee" },
              { slug: "texas", name: "Texas" },
              { slug: "utah", name: "Utah" },
              { slug: "vermont", name: "Vermont" },
              { slug: "virginia", name: "Virginia" },
              { slug: "washington", name: "Washington" },
              { slug: "west-virginia", name: "West Virginia" },
              { slug: "wisconsin", name: "Wisconsin" },
              { slug: "wyoming", name: "Wyoming" },
            ].map((s) => (
              <Link
                key={s.slug}
                href={`/snow-day-history/${s.slug}`}
                className="group flex items-center justify-between rounded-xl border border-white/5 bg-white/[0.02] px-3 py-2.5 hover:bg-white/[0.06] hover:border-white/10 transition-all"
              >
                <span className="text-sm font-medium text-white/75 group-hover:text-white truncate">
                  {s.name}
                </span>
              </Link>
            ))}
          </div>
        </section>

        {/* CTA */}
        <div className="text-center">
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-8 py-3 rounded-2xl font-bold text-sm text-white"
            style={{
              background: "linear-gradient(135deg,#1d4ed8,#3b82f6)",
              boxShadow: "0 4px 20px rgba(59,130,246,0.3)",
            }}
          >
            Check Today's Snow Day Probability
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </main>
    </>
  );
}
