import type { Metadata } from "next";
import { SnowSenseEntry } from "@/components/snow/SnowSenseEntry";
import { breadcrumbListSchema } from "@/lib/breadcrumb-schema";

export const runtime = "edge";

export const metadata: Metadata = {
  title: "Prediction",
  description:
    "Persistent SnowSense™ prediction route for edge-rendered snow day intelligence and offline caching.",
  alternates: {
    canonical: "/prediction",
  },
  robots: {
    index: false,
    follow: true,
  },
};

interface PredictionPageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

const breadcrumbSchema = breadcrumbListSchema([
  { name: "Home", path: "/" },
  { name: "Prediction", path: "/prediction" },
]);

export default async function PredictionPage({
  searchParams,
}: PredictionPageProps) {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <SnowSenseEntry searchParams={searchParams} />
    </>
  );
}
