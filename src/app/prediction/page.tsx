import type { Metadata } from "next";
import { SnowSenseEntry } from "@/components/snow/SnowSenseEntry";

export const runtime = "edge";

export const metadata: Metadata = {
  title: "Prediction",
  description:
    "Persistent SnowSense™ prediction route for edge-rendered snow day intelligence and offline caching.",
  alternates: {
    canonical: "/prediction",
    languages: { 
      "en": "/prediction",
      "x-default": "/prediction"
    },
  },
};

interface PredictionPageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function PredictionPage({
  searchParams,
}: PredictionPageProps) {
  return <SnowSenseEntry searchParams={searchParams} />;
}
