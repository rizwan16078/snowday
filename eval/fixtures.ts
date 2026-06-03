/**
 * Weather fixture builder for the SnowSense evaluation harness.
 *
 * Constructs a fully-typed `WeatherData` object from a compact spec so golden
 * scenarios stay readable. Anything not specified gets a sane winter default.
 *
 * NOTE on units: the production pipeline stores Open-Meteo `snowfall` (which the
 * API returns in centimetres by default) into fields named `*MM`. The engine is
 * tuned against those raw numbers, so fixtures use the SAME raw numbers the
 * engine sees in production — we do not "correct" the unit here, we mirror it.
 * (The naming mismatch is flagged separately in the audit.)
 */

import type {
  WeatherData,
  HourlyForecastPoint,
  HourlySnow,
  PrecipitationType,
} from "../src/types/snow";

export interface HourSpec {
  hour: number; // 0-23
  snowMM?: number;
  tempC?: number;
  precipitationMM?: number;
  precipitationType?: PrecipitationType;
  windSpeedKph?: number;
  humidityPercent?: number;
}

export interface WeatherSpec {
  temperature: number; // °C (current)
  snowfallMM?: number; // 24h total the snowfall factor reads
  precipitationMM?: number; // 24h total precip
  precipitationType?: PrecipitationType; // dominant
  windSpeedKph?: number;
  humidityPercent?: number;
  timezone?: string;
  /** Hour-by-hour series. Drives timing + ice-risk factors. */
  hours?: HourSpec[];
}

/**
 * Build a WeatherData fixture. `hours` populates both `hourly` (used by ice-risk
 * scoring) and `hourlySnow` (used by timing scoring). If `snowfallMM`/
 * `precipitationMM` totals are omitted they are summed from `hours`.
 */
export function makeWeather(spec: WeatherSpec): WeatherData {
  const hours = spec.hours ?? [];

  const hourly: HourlyForecastPoint[] = hours.map((h) => {
    const snowMM = h.snowMM ?? 0;
    const precipitationMM = h.precipitationMM ?? 0;
    const tempC = h.tempC ?? spec.temperature;
    const precipitationType: PrecipitationType =
      h.precipitationType ??
      (snowMM > 0 && precipitationMM > 0
        ? "mixed"
        : snowMM > 0
          ? "snow"
          : precipitationMM > 0
            ? tempC <= 1
              ? "mixed"
              : "rain"
            : "none");
    return {
      time: `2025-01-15T${String(h.hour).padStart(2, "0")}:00:00Z`,
      hour: h.hour,
      tempC,
      snowMM,
      precipitationMM,
      precipitationType,
      windSpeedKph: h.windSpeedKph ?? spec.windSpeedKph ?? 10,
      humidityPercent: h.humidityPercent ?? spec.humidityPercent ?? 85,
    };
  });

  const hourlySnow: HourlySnow[] = hours.map((h) => ({
    hour: h.hour,
    snowMM: h.snowMM ?? 0,
    tempC: h.tempC ?? spec.temperature,
  }));

  const summedSnow = hours.reduce((s, h) => s + (h.snowMM ?? 0), 0);
  const summedPrecip = hours.reduce((s, h) => s + (h.precipitationMM ?? 0), 0);

  return {
    temperature: spec.temperature,
    feelsLike: spec.temperature,
    humidityPercent: spec.humidityPercent ?? 85,
    snowfallMM: spec.snowfallMM ?? summedSnow,
    snowDepthCM: 0,
    precipitationMM: spec.precipitationMM ?? summedPrecip,
    precipitationType:
      spec.precipitationType ??
      hourly.find((p) => p.precipitationType === "mixed")?.precipitationType ??
      hourly.find((p) => p.precipitationType === "snow")?.precipitationType ??
      "none",
    windSpeedKph: spec.windSpeedKph ?? 10,
    cloudCoverPercent: 80,
    timezone: spec.timezone ?? "America/New_York",
    hourly,
    hourlySnow,
    source: "open-meteo",
  };
}

/** Spread snowfall evenly across a set of hours (helper for timing scenarios). */
export function snowAcross(hours: number[], totalSnowMM: number, tempC: number): HourSpec[] {
  const per = totalSnowMM / hours.length;
  return hours.map((hour) => ({ hour, snowMM: per, tempC }));
}
