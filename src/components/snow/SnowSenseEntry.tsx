import { headers } from "next/headers";
import SnowDayShell from "@/app/SnowDayClient";
import { parseCalibrationFromURL } from "@/lib/calibration";
import {
  buildRadarUrl,
  buildRibbonData,
  getCommunityFeed,
  getSnowSensePrediction,
  resolveRequestLocation,
} from "@/lib/snowsense";
import type { SchoolType } from "@/types/snow";

interface SnowSenseEntryProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

function readParam(
  value: string | string[] | undefined
): string | undefined {
  return typeof value === "string" ? value : undefined;
}

export async function SnowSenseEntry({
  searchParams,
}: SnowSenseEntryProps) {
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

  const { daysUsed, type } = parseCalibrationFromURL({
    get: (key: string) => readParam(resolvedSearchParams[key]) ?? null,
  });

  const initialPrediction = await getSnowSensePrediction(
    location,
    daysUsed,
    type as SchoolType
  ).catch((error) => {
    console.error("SnowSense prediction error:", error);
    return null;
  });

  const communityFeed = await getCommunityFeed();

  return (
    <SnowDayShell
      initialPrediction={initialPrediction}
      location={location}
      daysUsed={daysUsed}
      schoolType={type}
      communityFeed={communityFeed}
      initialRibbon={buildRibbonData(location)}
      radarSrc={buildRadarUrl(location)}
    />
  );
}
