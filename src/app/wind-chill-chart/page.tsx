import type { Metadata } from "next";
import Link from "next/link";
import { breadcrumbListSchema } from "@/lib/breadcrumb-schema";
import {
  Thermometer,
  Wind,
  AlertTriangle,
  ArrowRight,
  Shield,
  Clock,
  Snowflake,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Wind Chill Chart & Frostbite Times — NWS Reference",
  description:
    "Official NWS wind chill chart with frostbite risk times. See how wind speed and temperature combine to create dangerous wind chill — and when schools close for cold alone.",
  alternates: { canonical: "/wind-chill-chart" },
  openGraph: {
    type: "website",
    url: "https://www.snowdaycalculate.com/wind-chill-chart",
    title: "Wind Chill Chart & Frostbite Times — SnowSense™",
    description:
      "Official NWS wind chill chart with frostbite risk times. See exactly how wind speed and temperature combine to create dangerous wind chill.",
    images: [{ url: "/og-default.svg", width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Wind Chill Chart & Frostbite Times",
    description:
      "Official NWS wind chill chart with frostbite risk times. When does cold become dangerous?",
  },
};

// NWS Wind Chill formula: WC = 35.74 + 0.6215T - 35.75V^0.16 + 0.4275TV^0.16
// T = temperature (°F), V = wind speed (mph)
function calcWindChill(tempF: number, windMph: number): number | null {
  if (tempF > 50 || windMph <= 3) return null;
  return Math.round(
    35.74 +
      0.6215 * tempF -
      35.75 * Math.pow(windMph, 0.16) +
      0.4275 * tempF * Math.pow(windMph, 0.16)
  );
}

// Frostbite time approximation based on NWS guidance
function frostbiteTime(windChill: number | null): string {
  if (windChill === null) return "—";
  if (windChill >= 0) return "No risk";
  if (windChill >= -10) return "> 60 min";
  if (windChill >= -20) return "30 min";
  if (windChill >= -30) return "15 min";
  if (windChill >= -40) return "10 min";
  if (windChill >= -50) return "5 min";
  return "< 5 min";
}

function riskColor(windChill: number | null): string {
  if (windChill === null) return "text-white/40";
  if (windChill >= 0) return "text-green-400";
  if (windChill >= -10) return "text-yellow-400";
  if (windChill >= -20) return "text-orange-400";
  if (windChill >= -30) return "text-red-400";
  return "text-red-500 font-bold";
}

function cellBg(windChill: number | null): string {
  if (windChill === null) return "bg-white/[0.02]";
  if (windChill >= 0) return "bg-green-500/10";
  if (windChill >= -10) return "bg-yellow-500/10";
  if (windChill >= -20) return "bg-orange-500/10";
  if (windChill >= -30) return "bg-red-500/10";
  return "bg-red-600/20";
}

const TEMPS = [40, 35, 30, 25, 20, 15, 10, 5, 0, -5, -10, -15, -20, -25, -30, -35, -40, -45];
const WINDS = [5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55, 60];

const SCHOOL_CLOSURE_WIND_CHILL = -20;

const breadcrumbSchema = breadcrumbListSchema([
  { name: "Home", path: "/" },
  { name: "Wind Chill Chart", path: "/wind-chill-chart" },
]);

export default function WindChillChartPage() {
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
                name: "What wind chill closes schools?",
                acceptedAnswer: {
                  "@type": "Answer",
                  text: "Most northern US school districts close when wind chill reaches -20°F or below. Some districts in Minnesota and the Dakotas use -30°F or -35°F as their threshold. Southern districts rarely face wind chills cold enough to trigger closures.",
                },
              },
              {
                "@type": "Question",
                name: "How is wind chill calculated?",
                acceptedAnswer: {
                  "@type": "Answer",
                  text: "The NWS formula is: Wind Chill = 35.74 + 0.6215T − 35.75×V^0.16 + 0.4275×T×V^0.16, where T is air temperature in °F and V is wind speed in mph. The formula only applies when temperature is at or below 50°F and wind speed is above 3 mph.",
                },
              },
              {
                "@type": "Question",
                name: "How fast can frostbite happen at -20°F wind chill?",
                acceptedAnswer: {
                  "@type": "Answer",
                  text: "At a wind chill of -20°F, exposed skin can develop frostbite in approximately 30 minutes. At -30°F wind chill, frostbite can occur in just 15 minutes. At -40°F or below, frostbite is possible in under 10 minutes.",
                },
              },
            ],
          }),
        }}
      />

      <main className="min-h-screen px-4 py-16 max-w-6xl mx-auto">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-xs text-white/50 mb-8">
          <Link href="/" className="hover:text-white/50 transition-colors">Home</Link>
          <span>›</span>
          <span className="text-white/50">Wind Chill Chart</span>
        </nav>

        {/* Header */}
        <header className="mb-12">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-xl bg-blue-600/10 flex items-center justify-center">
              <Thermometer className="w-6 h-6 text-blue-400" />
            </div>
            <p className="text-[10px] text-blue-400/70 uppercase tracking-[0.3em] font-bold">
              NWS Reference Chart
            </p>
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-black font-display text-white mb-4">
            Wind Chill Chart & Frostbite Times
          </h1>
          <p className="text-white/55 text-base sm:text-lg max-w-3xl leading-relaxed">
            The official NWS wind chill chart shows how wind speed and air temperature combine
            to produce the <strong className="text-white/80">apparent temperature your skin feels</strong>.
            Frostbite times tell you exactly how long you have before exposed skin freezes.
          </p>
        </header>

        {/* The Formula */}
        <section className="mb-12 glass-card rounded-2xl p-6 sm:p-8">
          <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <Wind className="w-5 h-5 text-blue-400" />
            The NWS Wind Chill Formula
          </h2>
          <div className="bg-white/[0.03] rounded-xl p-4 sm:p-6 font-mono text-sm sm:text-base text-blue-200 mb-4 overflow-x-auto">
            <strong>Wind Chill (°F)</strong> = 35.74 + 0.6215×T − 35.75×V<sup>0.16</sup> + 0.4275×T×V<sup>0.16</sup>
          </div>
          <p className="text-white/50 text-sm leading-relaxed">
            <strong className="text-white/70">T</strong> = air temperature in °F &nbsp;|&nbsp;
            <strong className="text-white/70">V</strong> = wind speed in mph &nbsp;|&nbsp;
            Applies when T ≤ 50°F and V &gt; 3 mph
          </p>
        </section>

        {/* Interactive Wind Chill Table */}
        <section className="mb-12">
          <h2 className="text-xl font-bold text-white mb-2 flex items-center gap-2">
            <Snowflake className="w-5 h-5 text-blue-400" />
            Wind Chill Temperature Chart (°F)
          </h2>
          <p className="text-white/50 text-sm mb-6">
            Rows = air temperature. Columns = wind speed. Cells below {SCHOOL_CLOSURE_WIND_CHILL}°F
            are highlighted — that's the school closure threshold for most northern districts.
          </p>

          <div className="overflow-x-auto rounded-2xl border border-white/5">
            <table className="w-full text-xs sm:text-sm">
              <thead>
                <tr className="bg-white/[0.03]">
                  <th className="px-2 py-3 text-left text-white/50 font-bold border-b border-white/5">
                    Temp °F ↓ / Wind mph →
                  </th>
                  {WINDS.map((w) => (
                    <th key={w} className="px-2 py-3 text-center text-white/60 font-bold border-b border-white/5">
                      {w}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {TEMPS.map((t) => (
                  <tr key={t} className="border-b border-white/[0.03] hover:bg-white/[0.02] transition-colors">
                    <td className="px-2 py-2 font-bold text-white/70 border-r border-white/5">
                      {t}°
                    </td>
                    {WINDS.map((w) => {
                      const wc = calcWindChill(t, w);
                      return (
                        <td
                          key={w}
                          className={`px-2 py-2 text-center ${cellBg(wc)} ${riskColor(wc)} transition-colors`}
                        >
                          {wc !== null ? `${wc}°` : "—"}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* Frostbite Times */}
        <section className="mb-12">
          <h2 className="text-xl font-bold text-white mb-2 flex items-center gap-2">
            <Clock className="w-5 h-5 text-red-400" />
            Frostbite Risk Times by Wind Chill
          </h2>
          <p className="text-white/50 text-sm mb-6">
            How long exposed skin can safely be outside before frostbite begins.
            These are approximate times based on NWS guidance for average adult skin.
          </p>

          <div className="overflow-x-auto rounded-2xl border border-white/5 mb-6">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-white/[0.03]">
                  <th className="px-4 py-3 text-left text-white/60 font-bold">Wind Chill Range</th>
                  <th className="px-4 py-3 text-left text-white/60 font-bold">Frostbite Time</th>
                  <th className="px-4 py-3 text-left text-white/60 font-bold">Risk Level</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { range: "0°F to -9°F", time: "> 60 minutes", risk: "Low", color: "text-green-400", bg: "bg-green-500/10" },
                  { range: "-10°F to -19°F", time: "30 minutes", risk: "Moderate", color: "text-yellow-400", bg: "bg-yellow-500/10" },
                  { range: "-20°F to -29°F", time: "15 minutes", risk: "High", color: "text-orange-400", bg: "bg-orange-500/10" },
                  { range: "-30°F to -39°F", time: "10 minutes", risk: "Very High", color: "text-red-400", bg: "bg-red-500/10" },
                  { range: "-40°F to -49°F", time: "5 minutes", risk: "Severe", color: "text-red-500", bg: "bg-red-600/10" },
                  { range: "Below -50°F", time: "< 5 minutes", risk: "Extreme", color: "text-red-600 font-bold", bg: "bg-red-700/15" },
                ].map((row) => (
                  <tr key={row.range} className="border-b border-white/[0.03]">
                    <td className={`px-4 py-3 font-bold ${row.color} ${row.bg}`}>{row.range}</td>
                    <td className="px-4 py-3 text-white/70">{row.time}</td>
                    <td className={`px-4 py-3 ${row.color}`}>{row.risk}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Interactive Frostbite Calculator */}
          <div className="glass-card rounded-2xl p-6">
            <h3 className="text-lg font-bold text-white mb-3">Quick Frostbite Lookup</h3>
            <p className="text-white/50 text-sm mb-4">
              Select a temperature and wind speed to see the wind chill and frostbite risk instantly.
            </p>
            <div className="grid grid-cols-2 gap-4 mb-4" id="frostbite-calc">
              <div>
                <label className="text-xs text-white/50 uppercase tracking-widest font-bold block mb-1">
                  Temperature (°F)
                </label>
                <select
                  id="wc-temp"
                  className="w-full bg-white/[0.05] border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-blue-500"
                  defaultValue={0}
                >
                  {TEMPS.map((t) => (
                    <option key={t} value={t}>{t}°F</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-xs text-white/50 uppercase tracking-widest font-bold block mb-1">
                  Wind Speed (mph)
                </label>
                <select
                  id="wc-wind"
                  className="w-full bg-white/[0.05] border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-blue-500"
                  defaultValue={15}
                >
                  {WINDS.map((w) => (
                    <option key={w} value={w}>{w} mph</option>
                  ))}
                </select>
              </div>
            </div>
            <div
              id="wc-result"
              className="bg-white/[0.03] rounded-xl p-4 text-center"
            >
              <p className="text-white/40 text-sm">Select values above to see your result</p>
            </div>
            <script
              dangerouslySetInnerHTML={{
                __html: `
(function() {
  var tempEl = document.getElementById('wc-temp');
  var windEl = document.getElementById('wc-wind');
  var resultEl = document.getElementById('wc-result');
  function calc(T, V) {
    if (T > 50 || V <= 3) return null;
    return Math.round(35.74 + 0.6215*T - 35.75*Math.pow(V,0.16) + 0.4275*T*Math.pow(V,0.16));
  }
  function fbTime(wc) {
    if (wc === null) return 'N/A';
    if (wc >= 0) return 'No risk';
    if (wc >= -10) return '> 60 min';
    if (wc >= -20) return '30 min';
    if (wc >= -30) return '15 min';
    if (wc >= -40) return '10 min';
    if (wc >= -50) return '5 min';
    return '< 5 min';
  }
  function update() {
    var T = parseInt(tempEl.value);
    var V = parseInt(windEl.value);
    var wc = calc(T, V);
    var fb = fbTime(wc);
    var closure = wc !== null && wc <= -20;
    resultEl.innerHTML = wc !== null
      ? '<p class="text-2xl font-black ' + (closure ? 'text-red-400' : 'text-blue-300') + '">' + wc + '°F</p>'
        + '<p class="text-sm text-white/50 mt-1">Frostbite risk: <strong class="text-white/80">' + fb + '</strong></p>'
        + (closure ? '<p class="text-xs text-red-400/80 mt-2 font-bold">⚠️ School closure threshold reached</p>' : '')
      : '<p class="text-white/40 text-sm">Wind chill not applicable (temp too warm or wind too light)</p>';
  }
  tempEl.addEventListener('change', update);
  windEl.addEventListener('change', update);
  update();
})();`,
              }}
            />
          </div>
        </section>

        {/* School Closure Thresholds */}
        <section className="mb-12 glass-card rounded-2xl p-6 sm:p-8">
          <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <Shield className="w-5 h-5 text-blue-400" />
            School Cold-Day Thresholds by Region
          </h2>
          <p className="text-white/50 text-sm mb-6">
            When wind chill hits these thresholds, districts cancel school for cold alone — even with zero snow on the ground.
          </p>
          <div className="overflow-x-auto rounded-xl border border-white/5">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-white/[0.03]">
                  <th className="px-4 py-3 text-left text-white/60 font-bold">Region</th>
                  <th className="px-4 py-3 text-left text-white/60 font-bold">Cold Day Wind Chill Threshold</th>
                  <th className="px-4 py-3 text-left text-white/60 font-bold">Cold Days Per Winter</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { region: "Minnesota / Dakotas", threshold: "Below -35°F", days: "2–4" },
                  { region: "Wisconsin / Michigan", threshold: "Below -25°F", days: "1–3" },
                  { region: "Illinois / Ohio", threshold: "Below -20°F", days: "1–2" },
                  { region: "Pennsylvania / New York", threshold: "Below -15°F", days: "0–1" },
                  { region: "Virginia / Maryland", threshold: "Below -10°F", days: "Rare" },
                  { region: "Georgia / Carolinas", threshold: "Below 0°F", days: "Almost never" },
                ].map((row) => (
                  <tr key={row.region} className="border-b border-white/[0.03]">
                    <td className="px-4 py-3 text-white/80 font-medium">{row.region}</td>
                    <td className="px-4 py-3 text-blue-300 font-bold">{row.threshold}</td>
                    <td className="px-4 py-3 text-white/60">{row.days}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="mt-4 p-4 bg-red-500/5 border border-red-500/10 rounded-xl">
            <p className="text-sm text-white/60">
              <AlertTriangle className="w-4 h-4 text-red-400 inline mr-1" />
              <strong className="text-red-300">The Trench Truth:</strong> The coldest school closures are the least publicized because "it was really cold" doesn't make dramatic news. But in Minnesota, Wisconsin, and the Dakotas, cold days — cancellations due to temperature alone with no snow — happen 2–4 times per winter. If wind chill is forecast below -20°F, check your <Link href="/" className="text-blue-300 underline">snow day probability</Link> even with zero snow.
            </p>
          </div>
        </section>

        {/* Safety Tips */}
        <section className="mb-12">
          <h2 className="text-xl font-bold text-white mb-4">Cold Weather Safety Quick Reference</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              {
                title: "Layer Up",
                desc: "Wear 3+ layers: moisture-wicking base, insulating mid-layer, windproof shell. Cotton kills — it traps sweat and freezes.",
              },
              {
                title: "Cover Extremities",
                desc: "Frostbite hits fingers, toes, ears, and nose first. Insulated gloves, wool socks, and a hat that covers ears are non-negotiable below 0°F.",
              },
              {
                title: "Watch for Signs",
                desc: "Numbness, white/grayish skin, and a 'wooden' feeling are early frostbite. Get inside immediately — don't rub the area.",
              },
              {
                title: "Limit Exposure",
                desc: "At -20°F wind chill, exposed skin freezes in 30 minutes. At -40°F, it's under 10 minutes. Set a timer on your phone.",
              },
              {
                title: "Stay Dry",
                desc: "Wet clothing loses insulation value almost entirely. If you sweat through a base layer, you're carrying a freezing blanket against your skin.",
              },
              {
                title: "Check Before You Go",
                desc: "Use the SnowSense calculator to check conditions before heading out. If wind chill is below -15°F, reconsider any non-essential outdoor time.",
              },
            ].map((tip) => (
              <div
                key={tip.title}
                className="glass-card rounded-xl p-5 hover:bg-white/[0.04] transition-colors"
              >
                <h3 className="text-sm font-bold text-blue-300 mb-2">{tip.title}</h3>
                <p className="text-xs text-white/50 leading-relaxed">{tip.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Wind Chill by City */}
        <section className="mb-14">
          <h2 className="text-xs text-white/50 uppercase tracking-widest font-bold mb-4">
            Wind Chill by City — Live Data
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
            {[
              { slug: "new-york-ny", name: "New York" },
              { slug: "chicago-il", name: "Chicago" },
              { slug: "boston-ma", name: "Boston" },
              { slug: "minneapolis-mn", name: "Minneapolis" },
              { slug: "detroit-mi", name: "Detroit" },
              { slug: "denver-co", name: "Denver" },
              { slug: "buffalo-ny", name: "Buffalo" },
              { slug: "pittsburgh-pa", name: "Pittsburgh" },
              { slug: "milwaukee-wi", name: "Milwaukee" },
              { slug: "cleveland-oh", name: "Cleveland" },
              { slug: "philadelphia-pa", name: "Philadelphia" },
              { slug: "salt-lake-city-ut", name: "Salt Lake City" },
              { slug: "portland-me", name: "Portland, ME" },
              { slug: "burlington-vt", name: "Burlington" },
              { slug: "anchorage-ak", name: "Anchorage" },
              { slug: "fargo-nd", name: "Fargo" },
            ].map((c) => (
              <Link
                key={c.slug}
                href={`/wind-chill-chart/${c.slug}`}
                className="group flex items-center justify-between rounded-xl border border-white/5 bg-white/[0.02] px-3 py-2.5 hover:bg-white/[0.06] hover:border-white/10 transition-all"
              >
                <span className="text-sm font-medium text-white/75 group-hover:text-white truncate">
                  {c.name}
                </span>
                <Thermometer className="w-3.5 h-3.5 text-cyan-400/40 group-hover:text-cyan-400/70 shrink-0 ml-2" />
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
            Check Your Snow Day Probability
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </main>
    </>
  );
}
