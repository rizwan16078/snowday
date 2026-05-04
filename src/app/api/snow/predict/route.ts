/**
 * GET /api/snow/predict?lat=X&lon=Y&country=US&strictness=normal
 * Returns SnowDayPrediction cached for 30 minutes per location
 */

import { NextRequest, NextResponse } from "next/server";
import { fetchWeather } from "@/lib/weather";
import { runPredictionEngine } from "@/lib/prediction-engine";
import type { StrictnessLevel } from "@/types/snow";

export const runtime = "edge";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = req.nextUrl;
    const lat = parseFloat(searchParams.get("lat") ?? "40.7128");
    const lon = parseFloat(searchParams.get("lon") ?? "-74.006");
    const timezone = searchParams.get("tz") ?? "auto";
    const strictness = (searchParams.get("strictness") ?? "normal") as StrictnessLevel;

    if (isNaN(lat) || isNaN(lon)) {
      return NextResponse.json({ error: "Invalid coordinates" }, { status: 400 });
    }

    const weather = await fetchWeather(lat, lon, timezone);
    const prediction = runPredictionEngine(weather, { latitude: lat, strictness });

    return NextResponse.json(prediction, {
      headers: {
        "Cache-Control": "public, s-maxage=1800, stale-while-revalidate=900",
        "CDN-Cache-Control": "public, max-age=1800",
      },
    });
  } catch (error) {
    console.error("Prediction error:", error);
    return NextResponse.json(
      { error: "Failed to generate prediction" },
      { status: 500 }
    );
  }
}
