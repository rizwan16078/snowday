import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { headers } from "next/headers";
import { breadcrumbListSchema } from "@/lib/breadcrumb-schema";
import {
  Activity,
  ArrowRight,
  Calendar,
  CalendarDays,
  Cloud,
  CloudLightning,
  Clock,
  Clock3,
  CloudRain,
  CloudSun,
  Compass,
  Droplets,
  Eye,
  Gauge,
  Moon,
  Sun,
  Sunrise,
  Sunset,
  Wind,
} from "lucide-react";
import { blogPosts } from "@/lib/blog-data";
import { ClientLocationResolver } from "@/components/snow/ClientLocationResolver";
import { resolveRequestLocation } from "@/lib/snowsense";
import { fetchWeatherOutlook } from "@/lib/weather";
import type {
  AirQualitySnapshot,
  WeatherOutlookDailyPoint,
  WeatherOutlookHourlyPoint,
} from "@/types/snow";

export const runtime = "edge";

export const metadata: Metadata = {
  title: "Weather Outlook",
  description:
    "Live local weather with hourly forecast, 10-day outlook, air quality index, UV, sunrise/sunset, and snow day probability — updated every 30 minutes.",
  alternates: {
    canonical: "/weather",
  },
  openGraph: {
    type: "website",
    title: "Live Weather Outlook — SnowSense™",
    description:
      "Hourly forecast, 10-day outlook, air quality, and snow day probability for your location. Updated every 30 minutes.",
    url: "https://www.snowdaycalculate.com/weather",
    images: [{ url: "/api/og", width: 1200, height: 630, alt: "SnowSense™ Weather Outlook" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Live Weather Outlook — SnowSense™",
    description:
      "Hourly forecast, 10-day outlook, air quality, and snow day probability for your location.",
    images: ["/api/og"],
  },
};

interface WeatherPageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

function readParam(value: string | string[] | undefined): string | undefined {
  return typeof value === "string" ? value : undefined;
}

function formatLocationLine(city: string, state: string, country: string): string {
  const area = country === "US" ? state || "US" : country;
  return [city, area].filter(Boolean).join(", ");
}

function parseLocalDateTime(value: string) {
  const [datePart = "1970-01-01", timePart = "00:00"] = value.split("T");
  const [year = 1970, month = 1, day = 1] = datePart.split("-").map(Number);
  const [hour = 0, minute = 0] = timePart.split(":").map(Number);
  return { year, month, day, hour, minute };
}

function toUtcDate(value: string): Date {
  const { year, month, day, hour, minute } = parseLocalDateTime(value);
  return new Date(Date.UTC(year, month - 1, day, hour, minute));
}

function formatHour(value: string): string {
  const { hour, minute } = parseLocalDateTime(value);
  const normalizedHour = hour % 12 || 12;
  const suffix = hour >= 12 ? "PM" : "AM";
  if (minute === 0) {
    return `${normalizedHour} ${suffix}`;
  }
  return `${normalizedHour}:${String(minute).padStart(2, "0")} ${suffix}`;
}

function formatWeekday(value: string): string {
  return new Intl.DateTimeFormat("en-US", {
    weekday: "short",
    timeZone: "UTC",
  }).format(toUtcDate(value));
}

function formatMonthDay(value: string): string {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    timeZone: "UTC",
  }).format(toUtcDate(value));
}

function formatClock(value: string): string {
  const { hour, minute } = parseLocalDateTime(value);
  const normalizedHour = hour % 12 || 12;
  const suffix = hour >= 12 ? "PM" : "AM";
  return `${normalizedHour}:${String(minute).padStart(2, "0")} ${suffix}`;
}

function formatDuration(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.round((seconds % 3600) / 60);
  return `${hours}h ${minutes}m`;
}

function windDirectionLabel(degrees: number): string {
  const directions = ["N", "NE", "E", "SE", "S", "SW", "W", "NW"];
  const index = Math.round((((degrees % 360) + 360) % 360) / 45) % directions.length;
  return directions[index];
}

function getWeatherVisual(code: number) {
  if (code === 0) {
    return {
      label: "Clear",
      summary: "Open sky and stable conditions.",
      symbol: "Sun",
      tint: "text-amber-300",
      chip: "bg-amber-400/12 text-amber-200 border-amber-300/20",
      glow: "from-amber-300/20 via-orange-400/10 to-transparent",
    };
  }

  if ([1, 2].includes(code)) {
    return {
      label: "Partly Cloudy",
      summary: "Some sun with passing cloud cover.",
      symbol: "CloudSun",
      tint: "text-sky-300",
      chip: "bg-sky-400/12 text-sky-200 border-sky-300/20",
      glow: "from-sky-300/20 via-cyan-400/10 to-transparent",
    };
  }

  if ([3, 45, 48].includes(code)) {
    return {
      label: "Overcast",
      summary: "Heavier cloud cover with flatter light.",
      symbol: "Cloud",
      tint: "text-slate-200",
      chip: "bg-slate-300/12 text-slate-100 border-white/12",
      glow: "from-slate-200/15 via-white/5 to-transparent",
    };
  }

  if ((code >= 51 && code <= 67) || (code >= 80 && code <= 82)) {
    return {
      label: "Rain",
      summary: "Expect wet stretches and damp surfaces.",
      symbol: "Rain",
      tint: "text-cyan-300",
      chip: "bg-cyan-400/12 text-cyan-200 border-cyan-300/20",
      glow: "from-cyan-300/20 via-blue-400/10 to-transparent",
    };
  }

  if ((code >= 71 && code <= 77) || code === 85 || code === 86) {
    return {
      label: "Snow",
      summary: "Wintry precipitation and slicker conditions.",
      symbol: "Snow",
      tint: "text-blue-100",
      chip: "bg-blue-200/12 text-blue-100 border-blue-200/20",
      glow: "from-blue-100/20 via-sky-300/10 to-transparent",
    };
  }

  if (code >= 95) {
    return {
      label: "Thunderstorm",
      summary: "Storm energy is elevated, so conditions can turn quickly.",
      symbol: "Storm",
      tint: "text-violet-200",
      chip: "bg-violet-400/12 text-violet-200 border-violet-300/20",
      glow: "from-violet-300/20 via-indigo-400/10 to-transparent",
    };
  }

  return {
    label: "Mixed Conditions",
    summary: "A little less settled than average right now.",
    symbol: "CloudSun",
    tint: "text-sky-200",
    chip: "bg-sky-400/12 text-sky-100 border-sky-300/20",
    glow: "from-sky-200/15 via-white/5 to-transparent",
  };
}

function WeatherGlyph({
  symbol,
  className,
}: {
  symbol: string;
  className?: string;
}) {
  if (symbol === "Sun") return <Sun className={className} />;
  if (symbol === "Cloud") return <Cloud className={className} />;
  if (symbol === "Rain") return <CloudRain className={className} />;
  if (symbol === "Snow") return <CloudRain className={className} />;
  if (symbol === "Storm") return <CloudLightning className={className} />;
  return <CloudSun className={className} />;
}

function getAqiStatus(aqi: number | null) {
  if (aqi === null) {
    return {
      label: "Unavailable",
      description: "Air quality data is not available right now.",
      tone: "text-white",
      chip: "border-white/12 bg-white/[0.06]",
    };
  }

  if (aqi <= 50) {
    return {
      label: "Good",
      description: "Air quality is comfortable for most people.",
      tone: "text-emerald-300",
      chip: "border-emerald-300/20 bg-emerald-400/10",
    };
  }

  if (aqi <= 100) {
    return {
      label: "Moderate",
      description: "Fine for most plans, but sensitive groups may notice it.",
      tone: "text-amber-300",
      chip: "border-amber-300/20 bg-amber-400/10",
    };
  }

  if (aqi <= 150) {
    return {
      label: "Sensitive Groups",
      description: "People with respiratory sensitivity may want shorter outdoor sessions.",
      tone: "text-orange-300",
      chip: "border-orange-300/20 bg-orange-400/10",
    };
  }

  return {
    label: "Unhealthy",
    description: "Outdoor time is better kept short unless necessary.",
    tone: "text-rose-300",
    chip: "border-rose-300/20 bg-rose-400/10",
  };
}

function getMoonPhase(dateString: string) {
  const date = toUtcDate(`${dateString}T00:00`);
  const knownNewMoon = Date.UTC(2000, 0, 6, 18, 14, 0);
  const synodicMonth = 29.53058867 * 24 * 60 * 60 * 1000;
  const cycle = (((date.getTime() - knownNewMoon) % synodicMonth) + synodicMonth) % synodicMonth;
  const phase = cycle / synodicMonth;

  if (phase < 0.03 || phase > 0.97) return "New Moon";
  if (phase < 0.22) return "Waxing Crescent";
  if (phase < 0.28) return "First Quarter";
  if (phase < 0.47) return "Waxing Gibbous";
  if (phase < 0.53) return "Full Moon";
  if (phase < 0.72) return "Waning Gibbous";
  if (phase < 0.78) return "Last Quarter";
  return "Waning Crescent";
}

function buildOutdoorCallout(
  temperature: number,
  apparentTemperature: number,
  precipitationProbability: number,
  windSpeedKph: number,
  aqi: AirQualitySnapshot | null
) {
  if (aqi && aqi.usAqi > 150) {
    return {
      title: "Better to keep it short",
      detail: "Air quality is the main limiter right now, even if the temperature is manageable.",
    };
  }

  if (precipitationProbability >= 70 || windSpeedKph >= 40) {
    return {
      title: "Take a rain check",
      detail: "The next few hours look active enough that indoor plans may feel easier.",
    };
  }

  if (apparentTemperature >= 18 && apparentTemperature <= 31 && precipitationProbability < 35) {
    return {
      title: "This is a good window",
      detail: "Comfort and rain risk both look friendly for heading out.",
    };
  }

  if (temperature >= 33) {
    return {
      title: "Go out, but pace it",
      detail: "Heat is the only real watchout, so shade and hydration matter more.",
    };
  }

  return {
    title: "Worth a quick check",
    detail: "Nothing looks extreme, but the atmosphere is mixed enough to check the hourly strip below.",
  };
}

function buildBackHref(params: { [key: string]: string | string[] | undefined }) {
  const search = new URLSearchParams(
    Object.entries(params)
      .filter(([, value]) => typeof value === "string")
      .map(([key, value]) => [key, value as string])
  ).toString();

  return search ? `/prediction?${search}` : "/prediction";
}

function buildNextHoursSummary(hours: WeatherOutlookHourlyPoint[]) {
  const sample = hours.slice(0, 6);

  if (sample.length === 0) {
    return {
      low: 0,
      high: 0,
      precipitationProbability: 0,
      label: "No short-range forecast loaded.",
    };
  }

  const low = Math.min(...sample.map((hour) => hour.temperature));
  const high = Math.max(...sample.map((hour) => hour.temperature));
  const precipitationProbability = Math.max(
    ...sample.map((hour) => hour.precipitationProbability)
  );
  const leadVisual = getWeatherVisual(sample[0].weatherCode);

  return {
    low,
    high,
    precipitationProbability,
    label: `${leadVisual.label} through the next 6 hours`,
  };
}

function ProgressBar({
  value,
  className,
}: {
  value: number;
  className: string;
}) {
  return (
    <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/8">
      <div
        className={`h-full rounded-full ${className}`}
        style={{ width: `${Math.max(6, Math.min(100, value))}%` }}
      />
    </div>
  );
}

export default async function WeatherPage({ searchParams }: WeatherPageProps) {
  const resolvedSearchParams = await searchParams;
  const headerBag = await headers();

  const loc = readParam(resolvedSearchParams.loc);
  const lat = readParam(resolvedSearchParams.lat);
  const lon = readParam(resolvedSearchParams.lon);
  const city = readParam(resolvedSearchParams.city);
  const state = readParam(resolvedSearchParams.state);
  const country = readParam(resolvedSearchParams.country);
  const tz = readParam(resolvedSearchParams.tz);

  const location = await resolveRequestLocation(
    { loc, lat, lon, city, state, country, tz },
    headerBag
  );
  const outlook = await fetchWeatherOutlook(
    location.lat,
    location.lon,
    location.timezone || "auto"
  );

  const locationLabel = formatLocationLine(location.city, location.state, location.country);
  const currentVisual = getWeatherVisual(outlook.current.weatherCode);
  const today = outlook.daily[0];
  const tomorrow = outlook.daily[1];
  const nextHours = buildNextHoursSummary(outlook.hourly);
  const outdoorCallout = buildOutdoorCallout(
    outlook.current.temperature,
    outlook.current.apparentTemperature,
    nextHours.precipitationProbability,
    outlook.current.windSpeedKph,
    outlook.airQuality
  );
  const aqiStatus = getAqiStatus(outlook.airQuality?.usAqi ?? null);
  const moonPhase = today ? getMoonPhase(today.date) : "Moon phase";
  const backHref = buildBackHref(resolvedSearchParams);
  const tabs = [
    { href: "#today", label: "Today" },
    { href: "#hourly", label: "Hourly" },
    { href: "#ten-day", label: "10-Day" },
    { href: "#air-quality", label: "Air Quality" },
    { href: "#sun-moon", label: "Sun & Moon" },
    { href: "#top-reads", label: "Top Reads" },
  ];
  const topPosts = blogPosts.slice(0, 3);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbListSchema([
          { name: "Home", path: "/" },
          { name: "Weather Outlook", path: "/weather" },
        ])) }}
      />
    <main className="relative min-h-screen overflow-hidden bg-[#050913] px-4 pb-20 pt-28 text-white">
      <ClientLocationResolver initialLocationSlug={location.slug} />
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-1/2 top-0 h-[32rem] w-[32rem] -translate-x-1/2 rounded-full bg-blue-500/10 blur-[120px]" />
        <div className="absolute right-0 top-48 h-72 w-72 rounded-full bg-cyan-400/10 blur-[100px]" />
        <div className="absolute bottom-0 left-0 h-80 w-80 rounded-full bg-sky-300/8 blur-[120px]" />
      </div>

      <div className="relative mx-auto max-w-7xl">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.34em] text-white/50">
              Weather outlook
            </p>
            <h1 className="mt-3 font-display text-4xl font-black tracking-tight text-white sm:text-5xl">
              {locationLabel}
            </h1>
            <p className="mt-3 max-w-2xl text-sm text-white/58 sm:text-base">
              AccuWeather-style information hierarchy, rebuilt in the SnowSense visual system
              with free forecast data from Open-Meteo.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Link
              href={backHref}
              className="inline-flex items-center gap-2 rounded-full border border-white/12 bg-white/5 px-4 py-2.5 text-sm font-semibold text-white/78 transition hover:border-white/20 hover:bg-white/8 hover:text-white"
            >
              Back to prediction
            </Link>
            <div className="glass inline-flex items-center gap-2 rounded-full px-4 py-2.5 text-sm text-white/70">
              <Clock3 className="h-4 w-4 text-sky-300" />
              Updated {formatClock(outlook.current.time)} local time
            </div>
          </div>
        </div>

        <div className="no-scrollbar mt-8 overflow-x-auto">
          <div className="glass inline-flex min-w-full items-center gap-2 rounded-full p-2 sm:min-w-0">
            {tabs.map((tab) => (
              <a
                key={tab.href}
                href={tab.href}
                className="rounded-full px-4 py-2 text-sm font-semibold text-white/65 transition hover:bg-white/8 hover:text-white"
              >
                {tab.label}
              </a>
            ))}
          </div>
        </div>

        <section
          id="today"
          aria-label="Today's forecast"
          className="mt-8 grid gap-6 xl:grid-cols-[minmax(0,1.5fr)_minmax(320px,0.9fr)]"
        >
          <div className="glass-card relative overflow-hidden rounded-[2rem] p-6 sm:p-8">
            <div className={`pointer-events-none absolute inset-0 bg-gradient-to-br ${currentVisual.glow}`} />
            <div className="relative">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <div className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-sm ${currentVisual.chip}`}>
                    <WeatherGlyph symbol={currentVisual.symbol} className={`h-4 w-4 ${currentVisual.tint}`} />
                    <span>{currentVisual.label}</span>
                  </div>
                  <div className="mt-5 flex items-end gap-4">
                    <span className="font-display text-[clamp(4.5rem,11vw,7.5rem)] font-black leading-none tracking-[-0.06em] text-white">
                      {Math.round(outlook.current.temperature)}°
                    </span>
                    <div className="pb-3">
                      <p className="text-lg font-semibold text-white/88">
                        RealFeel {Math.round(outlook.current.apparentTemperature)}°
                      </p>
                      <p className="mt-1 text-sm text-white/54">{currentVisual.summary}</p>
                    </div>
                  </div>
                </div>

                <div className="grid min-w-[11rem] gap-3 text-right">
                  <div>
                    <p className="text-[11px] uppercase tracking-[0.3em] text-white/50">Humidity</p>
                    <p className="mt-1 text-2xl font-bold text-white">
                      {Math.round(outlook.current.humidityPercent)}%
                    </p>
                  </div>
                  <div>
                    <p className="text-[11px] uppercase tracking-[0.3em] text-white/50">Wind</p>
                    <p className="mt-1 text-2xl font-bold text-white">
                      {Math.round(outlook.current.windSpeedKph)} km/h
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-8 grid gap-4 md:grid-cols-4">
                <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-4">
                  <div className="flex items-center gap-2 text-white/50">
                    <Droplets className="h-4 w-4 text-cyan-300" />
                    <span className="text-[11px] uppercase tracking-[0.28em]">Precipitation</span>
                  </div>
                  <p className="mt-3 text-2xl font-bold text-white">
                    {outlook.current.precipitationMM.toFixed(1)} mm
                  </p>
                  <p className="mt-1 text-sm text-white/52">
                    {nextHours.precipitationProbability}% chance in the short range
                  </p>
                </div>
                <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-4">
                  <div className="flex items-center gap-2 text-white/50">
                    <Wind className="h-4 w-4 text-sky-300" />
                    <span className="text-[11px] uppercase tracking-[0.28em]">Wind Direction</span>
                  </div>
                  <p className="mt-3 text-2xl font-bold text-white">
                    {windDirectionLabel(outlook.current.windDirectionDeg)}
                  </p>
                  <p className="mt-1 text-sm text-white/52">
                    Gusts up to {Math.round(outlook.current.windGustKph)} km/h
                  </p>
                </div>
                <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-4">
                  <div className="flex items-center gap-2 text-white/50">
                    <Eye className="h-4 w-4 text-slate-200" />
                    <span className="text-[11px] uppercase tracking-[0.28em]">Visibility</span>
                  </div>
                  <p className="mt-3 text-2xl font-bold text-white">
                    {(outlook.current.visibilityM / 1000).toFixed(1)} km
                  </p>
                  <p className="mt-1 text-sm text-white/52">
                    Cloud cover {Math.round(outlook.current.cloudCoverPercent)}%
                  </p>
                </div>
                <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-4">
                  <div className="flex items-center gap-2 text-white/50">
                    <Gauge className="h-4 w-4 text-emerald-300" />
                    <span className="text-[11px] uppercase tracking-[0.28em]">Outdoor Read</span>
                  </div>
                  <p className="mt-3 text-xl font-bold text-white">{outdoorCallout.title}</p>
                  <p className="mt-1 text-sm text-white/52">{outdoorCallout.detail}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="grid gap-6">
            <article className="glass-card rounded-[2rem] p-6">
              <div className="flex items-center gap-2 text-white/50">
                <CalendarDays className="h-4 w-4 text-sky-300" />
                <span className="text-[11px] uppercase tracking-[0.3em]">Today</span>
              </div>
              {today ? (
                <>
                  <div className="mt-4 flex items-end justify-between gap-4">
                    <div>
                      <p className="text-3xl font-bold text-white">
                        {Math.round(today.temperatureMax)}° / {Math.round(today.temperatureMin)}°
                      </p>
                      <p className="mt-2 text-sm text-white/58">
                        {getWeatherVisual(today.weatherCode).label} with a {today.precipitationProbabilityMax}%
                        precipitation peak.
                      </p>
                    </div>
                    <WeatherGlyph
                      symbol={getWeatherVisual(today.weatherCode).symbol}
                      className={`h-10 w-10 ${getWeatherVisual(today.weatherCode).tint}`}
                    />
                  </div>
                  <div className="mt-5">
                    <ProgressBar
                      value={today.precipitationProbabilityMax}
                      className="bg-gradient-to-r from-cyan-300 to-blue-500"
                    />
                    <div className="mt-2 flex items-center justify-between text-sm text-white/50">
                      <span>{today.precipitationSumMM.toFixed(1)} mm expected</span>
                      <span>UV {today.uvIndexMax.toFixed(0)}</span>
                    </div>
                  </div>
                </>
              ) : null}
            </article>

            <article className="glass-card rounded-[2rem] p-6">
              <div className="flex items-center gap-2 text-white/50">
                <Clock3 className="h-4 w-4 text-cyan-300" />
                <span className="text-[11px] uppercase tracking-[0.3em]">Next 6 Hours</span>
              </div>
              <div className="mt-4 flex items-end justify-between gap-4">
                <div>
                  <p className="text-3xl font-bold text-white">
                    {Math.round(nextHours.high)}° / {Math.round(nextHours.low)}°
                  </p>
                  <p className="mt-2 text-sm text-white/58">{nextHours.label}</p>
                </div>
                <div className="rounded-full border border-white/10 bg-white/6 px-3 py-2 text-sm font-semibold text-white/78">
                  {nextHours.precipitationProbability}% rain chance
                </div>
              </div>
              <div className="mt-5">
                <ProgressBar
                  value={nextHours.precipitationProbability}
                  className="bg-gradient-to-r from-blue-300 to-cyan-400"
                />
              </div>
            </article>

            {tomorrow ? (
              <article className="glass-card rounded-[2rem] p-6">
                <div className="flex items-center gap-2 text-white/50">
                  <ArrowRight className="h-4 w-4 text-blue-300" />
                  <span className="text-[11px] uppercase tracking-[0.3em]">Tomorrow</span>
                </div>
                <div className="mt-4 flex items-end justify-between gap-4">
                  <div>
                    <p className="text-xl font-bold text-white">
                      {formatWeekday(`${tomorrow.date}T00:00`)} · {Math.round(tomorrow.temperatureMax)}°
                    </p>
                    <p className="mt-2 text-sm text-white/58">
                      {getWeatherVisual(tomorrow.weatherCode).label} with gusts up to{" "}
                      {Math.round(tomorrow.windGustsMaxKph)} km/h.
                    </p>
                  </div>
                  <WeatherGlyph
                    symbol={getWeatherVisual(tomorrow.weatherCode).symbol}
                    className={`h-8 w-8 ${getWeatherVisual(tomorrow.weatherCode).tint}`}
                  />
                </div>
              </article>
            ) : null}
          </div>
        </section>

        <section id="hourly" aria-label="Hourly forecast" className="mt-8 glass-card rounded-[2rem] p-6 sm:p-8">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.32em] text-white/50">
                Hourly weather
              </p>
              <h2 className="mt-2 font-display text-2xl font-bold text-white">The next 24 hours</h2>
            </div>
            <p className="text-sm text-white/50">
              Read it like AccuWeather, but keep the SnowSense finish.
            </p>
          </div>

          <div className="no-scrollbar mt-6 overflow-x-auto pb-2">
            <div className="flex min-w-max gap-3">
              {outlook.hourly.slice(0, 12).map((hour) => {
                const visual = getWeatherVisual(hour.weatherCode);
                return (
                  <article
                    key={hour.time}
                    className="w-[10.5rem] rounded-[1.75rem] border border-white/10 bg-white/[0.04] p-4 transition hover:border-white/16 hover:bg-white/[0.06]"
                  >
                    <p className="text-sm font-semibold text-white">{formatHour(hour.time)}</p>
                    <div className="mt-4 flex items-center justify-between gap-3">
                      <WeatherGlyph symbol={visual.symbol} className={`h-6 w-6 ${visual.tint}`} />
                      <p className="text-3xl font-bold text-white">{Math.round(hour.temperature)}°</p>
                    </div>
                    <p className="mt-3 text-xs uppercase tracking-[0.24em] text-white/36">
                      {visual.label}
                    </p>
                    <div className="mt-4 space-y-2 text-sm text-white/56">
                      <div className="flex items-center justify-between gap-2">
                        <span>Rain</span>
                        <span>{hour.precipitationProbability}%</span>
                      </div>
                      <div className="flex items-center justify-between gap-2">
                        <span>Wind</span>
                        <span>{Math.round(hour.windSpeedKph)} km/h</span>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          </div>
        </section>

        <section
          id="ten-day"
          aria-label="10-day forecast"
          className="mt-8 grid gap-6 xl:grid-cols-[minmax(0,1.45fr)_minmax(320px,0.8fr)]"
        >
          <div className="glass-card rounded-[2rem] p-6 sm:p-8">
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.32em] text-white/50">
                  10-day forecast
                </p>
                <h2 className="mt-2 font-display text-2xl font-bold text-white">
                  Extended outlook
                </h2>
              </div>
              <p className="text-sm text-white/50">
                Highs, lows, precipitation odds, and wind at a glance.
              </p>
            </div>

            <div className="mt-6 space-y-3">
              {outlook.daily.slice(0, 10).map((day: WeatherOutlookDailyPoint, index: number) => {
                const visual = getWeatherVisual(day.weatherCode);
                const label = index === 0 ? "Today" : index === 1 ? "Tomorrow" : formatWeekday(`${day.date}T00:00`);
                return (
                  <article
                    key={day.date}
                    className="grid gap-4 rounded-[1.75rem] border border-white/10 bg-white/[0.03] p-4 md:grid-cols-[minmax(0,1.1fr)_auto_auto]"
                  >
                    <div className="flex items-center gap-4">
                      <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-white/10 bg-white/5">
                        <WeatherGlyph symbol={visual.symbol} className={`h-5 w-5 ${visual.tint}`} />
                      </div>
                      <div>
                        <p className="text-base font-semibold text-white">
                          {label}
                          <span className="ml-2 text-sm font-medium text-white/50">
                            {formatMonthDay(`${day.date}T00:00`)}
                          </span>
                        </p>
                        <p className="mt-1 text-sm text-white/54">{visual.label}</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 md:min-w-[14rem]">
                      <div>
                        <p className="text-[11px] uppercase tracking-[0.24em] text-white/50">Precip</p>
                        <p className="mt-1 text-sm font-semibold text-white">
                          {day.precipitationProbabilityMax}%
                        </p>
                        <ProgressBar
                          value={day.precipitationProbabilityMax}
                          className="bg-gradient-to-r from-cyan-300 to-blue-500"
                        />
                      </div>
                      <div>
                        <p className="text-[11px] uppercase tracking-[0.24em] text-white/50">Wind</p>
                        <p className="mt-1 text-sm font-semibold text-white">
                          {Math.round(day.windSpeedMaxKph)} km/h
                        </p>
                        <p className="mt-1 text-xs text-white/50">
                          Gusts {Math.round(day.windGustsMaxKph)} km/h
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between gap-4 md:min-w-[8rem] md:justify-end">
                      <p className="text-2xl font-bold text-white">
                        {Math.round(day.temperatureMax)}°
                      </p>
                      <p className="text-lg font-semibold text-white/50">
                        {Math.round(day.temperatureMin)}°
                      </p>
                    </div>
                  </article>
                );
              })}
            </div>
          </div>

          <div className="grid gap-6">
            <section id="air-quality" aria-label="Air quality" className="glass-card rounded-[2rem] p-6">
              <div className="flex items-center gap-2 text-white/50">
                <Activity className="h-4 w-4 text-emerald-300" />
                <span className="text-[11px] uppercase tracking-[0.3em]">Air Quality</span>
              </div>
              <div className={`mt-4 rounded-3xl border p-4 ${aqiStatus.chip}`}>
                <p className={`text-3xl font-bold ${aqiStatus.tone}`}>
                  {outlook.airQuality?.usAqi ?? "--"}
                </p>
                <p className="mt-2 text-base font-semibold text-white">{aqiStatus.label}</p>
                <p className="mt-2 text-sm text-white/58">{aqiStatus.description}</p>
              </div>
              <div className="mt-5 grid grid-cols-2 gap-3 text-sm text-white/58">
                <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-3">
                  <p className="text-[11px] uppercase tracking-[0.24em] text-white/50">PM2.5</p>
                  <p className="mt-2 text-xl font-bold text-white">
                    {outlook.airQuality ? outlook.airQuality.pm2_5.toFixed(1) : "--"}
                  </p>
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-3">
                  <p className="text-[11px] uppercase tracking-[0.24em] text-white/50">PM10</p>
                  <p className="mt-2 text-xl font-bold text-white">
                    {outlook.airQuality ? outlook.airQuality.pm10.toFixed(1) : "--"}
                  </p>
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-3">
                  <p className="text-[11px] uppercase tracking-[0.24em] text-white/50">Ozone</p>
                  <p className="mt-2 text-xl font-bold text-white">
                    {outlook.airQuality ? outlook.airQuality.ozone.toFixed(0) : "--"}
                  </p>
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-3">
                  <p className="text-[11px] uppercase tracking-[0.24em] text-white/50">UV</p>
                  <p className="mt-2 text-xl font-bold text-white">
                    {outlook.airQuality ? outlook.airQuality.uvIndex.toFixed(0) : "--"}
                  </p>
                </div>
              </div>
            </section>

            <section id="sun-moon" aria-label="Sun and moon" className="glass-card rounded-[2rem] p-6">
              <div className="flex items-center gap-2 text-white/50">
                <Moon className="h-4 w-4 text-slate-200" />
                <span className="text-[11px] uppercase tracking-[0.3em]">Sun & Moon</span>
              </div>
              {today ? (
                <>
                  <div className="mt-5 grid gap-3 sm:grid-cols-2">
                    <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                      <div className="flex items-center gap-2 text-white/50">
                        <Sunrise className="h-4 w-4 text-amber-300" />
                        <span className="text-[11px] uppercase tracking-[0.24em]">Sunrise</span>
                      </div>
                      <p className="mt-3 text-2xl font-bold text-white">
                        {formatClock(today.sunrise)}
                      </p>
                    </div>
                    <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                      <div className="flex items-center gap-2 text-white/50">
                        <Sunset className="h-4 w-4 text-orange-300" />
                        <span className="text-[11px] uppercase tracking-[0.24em]">Sunset</span>
                      </div>
                      <p className="mt-3 text-2xl font-bold text-white">
                        {formatClock(today.sunset)}
                      </p>
                    </div>
                  </div>

                  <div className="mt-5 rounded-3xl border border-white/10 bg-white/[0.03] p-4">
                    <div className="flex items-center justify-between gap-4">
                      <div>
                        <p className="text-[11px] uppercase tracking-[0.24em] text-white/50">
                          Daylight
                        </p>
                        <p className="mt-2 text-xl font-bold text-white">
                          {formatDuration(today.daylightDurationSeconds)}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-[11px] uppercase tracking-[0.24em] text-white/50">
                          Moon phase
                        </p>
                        <p className="mt-2 text-xl font-bold text-white">{moonPhase}</p>
                      </div>
                    </div>
                    <p className="mt-3 text-sm text-white/56">
                      Sunshine estimate {formatDuration(today.sunshineDurationSeconds)}.
                    </p>
                  </div>
                </>
              ) : null}
            </section>

            <section className="glass-card rounded-[2rem] p-6">
              <div className="flex items-center gap-2 text-white/50">
                <Compass className="h-4 w-4 text-sky-300" />
                <span className="text-[11px] uppercase tracking-[0.3em]">Quick Read</span>
              </div>
              <div className="mt-5 space-y-4 text-sm text-white/58">
                <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                  <p className="font-semibold text-white">Should I go out?</p>
                  <p className="mt-2">{outdoorCallout.title}. {outdoorCallout.detail}</p>
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                  <p className="font-semibold text-white">Best free stack</p>
                  <p className="mt-2">
                    Forecast and air quality both come from Open-Meteo, so you keep this page
                    fully branded without paying for a weather UI dependency.
                  </p>
                </div>
              </div>
            </section>
          </div>
        </section>

        <section id="top-reads" aria-label="Top reads" className="mt-8 glass-card rounded-[2rem] p-6 sm:p-8">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.32em] text-white/50">
                Top reads
              </p>
              <h2 className="mt-2 font-display text-2xl font-bold text-white">
                Weather and snow-day guides
              </h2>
            </div>
            <Link
              href="/blog"
              className="inline-flex items-center gap-2 text-sm font-semibold text-blue-300 transition hover:text-blue-200"
            >
              View all articles
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="mt-6 grid gap-5 lg:grid-cols-3">
            {topPosts.map((post) => (
              <Link
                key={post.slug}
                href={`/blog/${post.slug}`}
                className="group overflow-hidden rounded-[1.75rem] border border-white/10 bg-white/[0.03] transition hover:border-white/16 hover:bg-white/[0.05]"
              >
                <div className="relative h-48">
                  <Image
                    src={post.image}
                    alt={post.imageAlt}
                    fill
                    className="object-cover transition duration-500 group-hover:scale-[1.03]"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#050913] via-[#050913]/20 to-transparent" />
                  <span className="absolute left-4 top-4 rounded-full border border-white/12 bg-black/25 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.24em] text-white/78 backdrop-blur-md">
                    {post.category}
                  </span>
                </div>

                <div className="p-5">
                  <div className="flex flex-wrap items-center gap-4 text-[11px] text-white/36">
                    <span className="inline-flex items-center gap-1.5">
                      <Calendar className="h-3.5 w-3.5" />
                      {new Date(post.date).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </span>
                    <span className="inline-flex items-center gap-1.5">
                      <Clock className="h-3.5 w-3.5" />
                      {post.readTime}
                    </span>
                  </div>

                  <h3 className="mt-4 text-lg font-black leading-snug text-white transition group-hover:text-blue-200">
                    {post.title}
                  </h3>
                  <p className="mt-3 text-sm leading-relaxed text-white/52">
                    {post.excerpt}
                  </p>

                  <div className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-blue-300 transition group-hover:gap-3 group-hover:text-blue-200">
                    Read article
                    <ArrowRight className="h-4 w-4" />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>
      </div>
    </main>
    </>
  );
}
