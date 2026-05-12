import type { Metadata } from "next";
import { SnowSenseEntry } from "@/components/snow/SnowSenseEntry";

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
    : "Snow Day Calculator — Will School Be Cancelled Tomorrow?";
  const description = locationLabel
    ? `${probability !== null ? `${probability}% probability` : "Live snow day probability"} of school being cancelled tomorrow in ${locationLabel}. Real-time forecast powered by NWS, Open-Meteo, and HRRR weather data calibrated against local closure thresholds.`
    : "Will school be cancelled tomorrow? Free snow day calculator with real-time probability, powered by NWS and Open-Meteo data and calibrated against regional school-closure thresholds. Updated every 30 minutes.";

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
        : "SnowSense™ — Snow Day Calculator",
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
        : "SnowSense™ — Snow Day Calculator",
      description,
      images: [ogUrl],
    },
  };
}

export default async function HomePage({ searchParams }: HomePageProps) {
  return <SnowSenseEntry searchParams={searchParams} />;
}
