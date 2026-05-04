import type { Metadata } from "next";
import { SnowSenseEntry } from "@/components/snow/SnowSenseEntry";

export const runtime = "edge";

export const metadata: Metadata = {
  title: "SnowSense™ Prediction Intelligence",
  description:
    "Real-time, edge-rendered snow day prediction intelligence powered by weather, geospatial, and temporal modeling.",
};

interface HomePageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function HomePage({ searchParams }: HomePageProps) {
  return <SnowSenseEntry searchParams={searchParams} />;
}
