import type {
  HourlyForecastPoint,
  HourlySnow,
  PrecipitationType,
  WeatherData,
} from "@/types/snow";

const OPEN_METEO_BASE = "https://api.open-meteo.com/v1";

function toNumber(value: unknown, fallback = 0): number {
  return typeof value === "number" && Number.isFinite(value) ? value : fallback;
}

function inferPrecipitationType(
  snowfall: number,
  rain: number,
  precipitation: number,
  temperature: number
): PrecipitationType {
  if (snowfall > 0 && rain > 0) return "mixed";
  if (snowfall > 0) return "snow";
  if (rain > 0 || precipitation > 0) {
    return temperature <= 1 ? "mixed" : "rain";
  }
  return "none";
}

function calculateFeelsLike(tempC: number, windSpeedKph: number): number {
  if (tempC > 10 || windSpeedKph < 4.8) {
    return tempC;
  }

  return (
    13.12 +
    0.6215 * tempC -
    11.37 * Math.pow(windSpeedKph, 0.16) +
    0.3965 * tempC * Math.pow(windSpeedKph, 0.16)
  );
}

export async function fetchWeather(
  lat: number,
  lon: number,
  timezone: string = "auto"
): Promise<WeatherData> {
  const params = new URLSearchParams({
    latitude: lat.toFixed(4),
    longitude: lon.toFixed(4),
    hourly: [
      "temperature_2m",
      "relative_humidity_2m",
      "precipitation",
      "rain",
      "snowfall",
      "snow_depth",
      "wind_speed_10m",
      "cloud_cover",
    ].join(","),
    forecast_days: "2",
    timezone,
    wind_speed_unit: "kmh",
  });

  const response = await fetch(`${OPEN_METEO_BASE}/forecast?${params}`, {
    next: { revalidate: 1800 },
  });

  if (!response.ok) {
    throw new Error(`Open-Meteo error: ${response.status}`);
  }

  const data = await response.json();
  const times: string[] = data.hourly?.time ?? [];
  const temperatures: number[] = data.hourly?.temperature_2m ?? [];
  const humidity: number[] = data.hourly?.relative_humidity_2m ?? [];
  const precipitation: number[] = data.hourly?.precipitation ?? [];
  const rain: number[] = data.hourly?.rain ?? [];
  const snowfall: number[] = data.hourly?.snowfall ?? [];
  const snowDepth: number[] = data.hourly?.snow_depth ?? [];
  const windSpeed: number[] = data.hourly?.wind_speed_10m ?? [];
  const cloudCover: number[] = data.hourly?.cloud_cover ?? [];

  const now = Date.now();
  const hourly: HourlyForecastPoint[] = [];
  const hourlySnow: HourlySnow[] = [];

  let totalSnowMM = 0;
  let totalPrecipMM = 0;
  let cloudSum = 0;

  for (let index = 0; index < times.length; index += 1) {
    const time = new Date(times[index]);
    const diffHours = (time.getTime() - now) / 3_600_000;

    if (diffHours < -1 || diffHours > 24) {
      continue;
    }

    const tempC = toNumber(temperatures[index]);
    const snowMM = toNumber(snowfall[index]);
    const precipMM = toNumber(precipitation[index]);
    const rainMM = toNumber(rain[index]);
    const windKph = toNumber(windSpeed[index]);
    const humidityPercent = toNumber(humidity[index]);
    const point: HourlyForecastPoint = {
      time: time.toISOString(),
      hour: time.getHours(),
      tempC,
      snowMM,
      precipitationMM: precipMM,
      precipitationType: inferPrecipitationType(snowMM, rainMM, precipMM, tempC),
      windSpeedKph: windKph,
      humidityPercent,
    };

    hourly.push(point);
    hourlySnow.push({ hour: point.hour, snowMM, tempC });
    totalSnowMM += snowMM;
    totalPrecipMM += precipMM;
    cloudSum += toNumber(cloudCover[index]);
  }

  const currentIndex = times.findIndex((value) => new Date(value).getTime() >= now);
  const safeIndex = currentIndex >= 0 ? currentIndex : 0;
  const currentTemp = toNumber(temperatures[safeIndex], hourly[0]?.tempC ?? 0);
  const currentWind = toNumber(windSpeed[safeIndex], hourly[0]?.windSpeedKph ?? 0);
  const currentHumidity = toNumber(humidity[safeIndex], hourly[0]?.humidityPercent ?? 0);
  const currentSnowDepth = toNumber(snowDepth[safeIndex]);
  const dominantPrecipitation =
    hourly.find((point) => point.precipitationType === "mixed")?.precipitationType ??
    hourly.find((point) => point.precipitationType === "snow")?.precipitationType ??
    hourly.find((point) => point.precipitationType === "rain")?.precipitationType ??
    "none";

  return {
    temperature: currentTemp,
    feelsLike: calculateFeelsLike(currentTemp, currentWind),
    humidityPercent: currentHumidity,
    snowfallMM: totalSnowMM,
    snowDepthCM: currentSnowDepth * 100,
    precipitationMM: totalPrecipMM,
    precipitationType: dominantPrecipitation,
    windSpeedKph: currentWind,
    cloudCoverPercent: hourly.length > 0 ? cloudSum / hourly.length : 0,
    timezone: typeof data.timezone === "string" ? data.timezone : timezone,
    hourly,
    hourlySnow,
    source: "open-meteo",
  };
}
