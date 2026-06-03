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

export interface WeatherOutlookCurrent {
  time: string;
  temperature: number;
  apparentTemperature: number;
  humidityPercent: number;
  precipitationMM: number;
  rainMM: number;
  showersMM: number;
  snowfallMM: number;
  weatherCode: number;
  cloudCoverPercent: number;
  windSpeedKph: number;
  windDirectionDeg: number;
  windGustKph: number;
  visibilityM: number;
  isDay: number;
}

export interface WeatherOutlookHourlyPoint {
  time: string;
  temperature: number;
  apparentTemperature: number;
  humidityPercent: number;
  precipitationMM: number;
  precipitationProbability: number;
  weatherCode: number;
  windSpeedKph: number;
  isDay: number;
}

export interface WeatherOutlookDailyPoint {
  date: string;
  weatherCode: number;
  temperatureMax: number;
  temperatureMin: number;
  apparentTemperatureMax: number;
  apparentTemperatureMin: number;
  sunrise: string;
  sunset: string;
  daylightDurationSeconds: number;
  sunshineDurationSeconds: number;
  uvIndexMax: number;
  precipitationSumMM: number;
  precipitationProbabilityMax: number;
  windSpeedMaxKph: number;
  windGustsMaxKph: number;
}

export interface AirQualitySnapshot {
  time: string;
  usAqi: number;
  pm2_5: number;
  pm10: number;
  ozone: number;
  uvIndex: number;
}

export interface WeatherOutlookData {
  timezone: string;
  current: WeatherOutlookCurrent;
  hourly: WeatherOutlookHourlyPoint[];
  daily: WeatherOutlookDailyPoint[];
  airQuality: AirQualitySnapshot | null;
  source: "open-meteo";
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
  /** True when this result maps to a catalog city with a canonical
   * /snow-day-calculator/[slug] page (slug is then the catalog slug). */
  isCatalogCity?: boolean;
}

export type StrictnessLevel = "lenient" | "normal" | "strict";
export type RegionType = "northern" | "moderate" | "southern";

/** School type for SnowSense™ Calibration */
export type SchoolType = "public" | "private";

export interface PredictionConfig {
  strictness: StrictnessLevel;
  latitude: number;
  /**
   * Optional injectable "now". Production callers omit this and the engine
   * uses `new Date()`. Tests/eval pass a fixed date so date-dependent logic
   * (off-season detection, `lastUpdated`) is deterministic and reproducible.
   */
  referenceDate?: Date;
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
  /** True when this selection has a canonical /snow-day-calculator/[slug] page. */
  isCatalogCity?: boolean;
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
