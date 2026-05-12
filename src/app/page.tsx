import type { Metadata } from "next";
import { SnowSenseEntry } from "@/components/snow/SnowSenseEntry";

export const runtime = "edge";

export const metadata: Metadata = {
  title: "Snow Day Calculator",
  description:
    "Will school be cancelled tomorrow? Get your real-time snow day probability powered by live weather data, ice risk analysis, and regional tolerance modeling.",
  alternates: {
    canonical: "/",
    languages: { 
      "en": "/",
      "x-default": "/"
    },
  },
  openGraph: {
    type: "website",
    url: "https://www.snowdaycalculate.com",
    title: "SnowSense™ — Snow Day Calculator",
    description: "Real-time snow day probability for your location.",
    images: [
      {
        url: "/og-default.png",
        width: 1200,
        height: 630,
        alt: "SnowSense™ Snow Day Calculator",
      },
    ],
  },
};

interface HomePageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function HomePage({ searchParams }: HomePageProps) {
  return <SnowSenseEntry searchParams={searchParams} />;
}
