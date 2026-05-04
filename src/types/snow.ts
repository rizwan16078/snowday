// SnowSense™ Prediction Engine Types

export interface SnowDayPrediction {
  probability: number; // 0-100
  confidence: number; // 0-100
  status: "Unlikely" | "Possible" | "Very Likely";
  factors: {
    snowfall: number; // 0-100 score
    iceRisk: number; // 0-100 score
    temperature: number; // 0-100 score
    timing: number; // 0-100 score
  };
  explanation: string;
  lastUpdated: string; // ISO timestamp
  rawWeather?: WeatherData;
  location?: LocationData;
  isFallback?: boolean; // warm region / off-season
  fallbackMessage?: string;
}

export interface WeatherData {
  temperature: number; // Celsius
  feelsLike: number;
  humidityPercent: number;
  snowfallMM: number; // mm in next 24h
  snowDepthCM: number;
  precipitationMM: number;
  precipitationType: PrecipitationType;
  windSpeedKph: number;
  cloudCoverPercent: number;
  timezone: string;
  hourly: HourlyForecastPoint[];
  hourlySnow: HourlySnow[];
  source: "nws" | "open-meteo";
}

export type PrecipitationType = "snow" | "rain" | "mixed" | "none";

export interface HourlyForecastPoint {
  time: string;
  hour: number; // 0-23
  tempC: number;
  snowMM: number;
  precipitationMM: number;
  precipitationType: PrecipitationType;
  windSpeedKph: number;
  humidityPercent: number;
}

export interface HourlySnow {
  hour: number; // 0-23
  snowMM: number;
  tempC: number;
}

export interface LocationData {
  city: string;
  state: string;
  country: string;
  lat: number;
  lon: number;
  zip?: string;
  timezone?: string;
}

export interface GeocodingResult {
  lat: number;
  lon: number;
  city: string;
  state: string;
  country: string;
  zip?: string;
  slug?: string;
  timezone?: string;
}

export type StrictnessLevel = "lenient" | "normal" | "strict";
export type RegionType = "northern" | "moderate" | "southern";

/** School type for SnowSense™ Calibration */
export type SchoolType = "public" | "private";

export interface PredictionConfig {
  strictness: StrictnessLevel;
  latitude: number;
}

/**
 * SnowSense™ Calibration params — URL-driven state
 * These live ONLY in the URL query string.
 */
export interface CalibrationParams {
  loc: string;          // city slug (e.g., "boston")
  daysUsed: number;     // snow history signal (0-10)
  type: SchoolType;     // public | private
}

export interface ShareableCard {
  location: string;
  probability: number;
  status: string;
  emoji: string;
  updatedAt: string;
}

/**
 * Resolved location from geocoding + calibration
 * Server uses this to compute prediction
 */
export interface ResolvedLocation {
  city: string;
  state: string;
  country: string;
  lat: number;
  lon: number;
  slug: string;
  timezone?: string;
}

export interface LocationSelection {
  city: string;
  state: string;
  country: string;
  slug: string;
  lat: number;
  lon: number;
  timezone?: string;
}

export interface SnowSenseRibbon {
  locationLabel: string;
  latitudeLabel: string;
  temperatureC: number | null;
  humidityPercent: number | null;
}

export interface CommunityFeedItem {
  id: string;
  city: string;
  state: string;
  country: string;
  probability: number;
  status: SnowDayPrediction["status"];
  timeAgo: string;
}
