import type { Metadata } from "next";
import { SnowSenseEntry } from "@/components/snow/SnowSenseEntry";
import { breadcrumbListSchema } from "@/lib/breadcrumb-schema";

export const runtime = "edge";

interface HomePageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

/**
 * Pretty-print a slug like "boston-ma" → "Boston, MA".
 * Trailing 2-letter state codes get uppercased + comma-separated.
 */
function prettifySlug(slug: string): string {
  const parts = slug.split("-");
  if (parts.length < 2) return slug.replace(/-/g, " ");
  const last = parts[parts.length - 1];
  if (/^[a-z]{2}$/.test(last)) {
    const head = parts.slice(0, -1).map((w) => w[0].toUpperCase() + w.slice(1)).join(" ");
    return `${head}, ${last.toUpperCase()}`;
  }
  return parts.map((w) => w[0].toUpperCase() + w.slice(1)).join(" ");
}

function paramStr(v: string | string[] | undefined): string | null {
  if (typeof v === "string" && v.length > 0) return v;
  return null;
}

export async function generateMetadata({
  searchParams,
}: HomePageProps): Promise<Metadata> {
  const sp = await searchParams;
  const locParam = paramStr(sp.loc);
  const pParam = paramStr(sp.p);
  const sParam = paramStr(sp.s);

  const locationLabel = locParam ? prettifySlug(locParam) : null;
  const probability = pParam ? Math.max(0, Math.min(100, Number.parseInt(pParam, 10) || 0)) : null;
  const status = sParam ?? null;

  // Build the dynamic OG image URL — params decide whether it renders the
  // generic hero card or the personalized "X% chance in <city>" card.
  const ogParams = new URLSearchParams();
  if (locationLabel) ogParams.set("loc", locationLabel);
  if (probability !== null) ogParams.set("p", String(probability));
  if (status) ogParams.set("s", status);
  const ogQuery = ogParams.toString();
  const ogUrl = `/api/og${ogQuery ? `?${ogQuery}` : ""}`;

  const title = locationLabel
    ? `${probability !== null ? `${probability}% Chance` : "Snow Day Calculator"} — Will School Be Cancelled in ${locationLabel}?`
    : "Snow Day Calculator by ZIP Code, City, or District";
  const description = locationLabel
    ? `${probability !== null ? `${probability}% probability` : "Live snow day probability"} of school being cancelled tomorrow in ${locationLabel}. Real-time forecast powered by NWS, Open-Meteo, and HRRR weather data calibrated against local closure thresholds.`
    : "Will school be cancelled tomorrow? Use the SnowSense snow day calculator to check your auto-detected forecast or search by ZIP code, city, or district. Updated every 30 minutes.";

  return {
    title,
    description,
    alternates: {
      canonical: "/",
    },
    openGraph: {
      type: "website",
      url: "https://www.snowdaycalculate.com",
      title: locationLabel
        ? `${probability !== null ? `${probability}% · ` : ""}SnowSense™ — ${locationLabel}`
        : "SnowSense™ — Snow Day Calculator by ZIP Code",
      description,
      images: [
        {
          url: ogUrl,
          width: 1200,
          height: 630,
          alt: locationLabel
            ? `Snow day probability card for ${locationLabel}`
            : "SnowSense™ Snow Day Calculator",
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: locationLabel
        ? `${probability !== null ? `${probability}% · ` : ""}SnowSense™ — ${locationLabel}`
        : "SnowSense™ — Snow Day Calculator by ZIP Code",
      description,
      images: [ogUrl],
    },
  };
}

const homeFaqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "How accurate is the SnowSense snow day calculator?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "SnowSense uses live Open-Meteo forecast data — which aggregates NOAA (HRRR/GFS) and ECMWF models — calibrated against regional closure thresholds. Predictions update every 30 minutes. No tool is 100% accurate because the final call is made by a human superintendent, but our model consistently outperforms raw weather forecasts for school closure prediction.",
      },
    },
    {
      "@type": "Question",
      name: "What factors determine a snow day?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Four factors: snowfall accumulation rate, ice risk (freezing rain/black ice), temperature and wind chill, and storm timing relative to the morning commute. Regional infrastructure — how many plows a city has — also heavily influences whether schools close.",
      },
    },
    {
      "@type": "Question",
      name: "What time do schools announce snow days?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Most snow day decisions are made between 4 AM and 6 AM. Superintendents drive key routes, review road crew reports, and announce via automated text/call systems, district websites, and local TV by 5:30 AM. Southern districts sometimes announce the night before.",
      },
    },
    {
      "@type": "Question",
      name: "Can school be cancelled for cold weather without snow?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Yes. When wind chill drops below -20°F, many northern districts cancel school for student safety at bus stops and because diesel school buses struggle to start. These 'cold days' happen 2–4 times per winter in Minnesota, Wisconsin, and the Dakotas.",
      },
    },
    {
      "@type": "Question",
      name: "How many inches of snow does it take to cancel school?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "There is no universal number. Boston may stay open through 10 inches, while Atlanta closes for 1–2 inches. The threshold depends on regional plow infrastructure, snow type (wet vs dry), storm timing, and the district's remaining snow day budget.",
      },
    },
  ],
};

export default async function HomePage({ searchParams }: HomePageProps) {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbListSchema([
          { name: "Home", path: "/" },
        ])) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(homeFaqSchema) }}
      />
      <SnowSenseEntry searchParams={searchParams} />
    </>
  );
}
