import type {
  AirQualitySnapshot,
  HourlyForecastPoint,
  HourlySnow,
  PrecipitationType,
  WeatherOutlookData,
  WeatherOutlookDailyPoint,
  WeatherOutlookHourlyPoint,
  WeatherData,
} from "@/types/snow";

const OPEN_METEO_BASE = "https://api.open-meteo.com/v1";
const OPEN_METEO_AIR_QUALITY_BASE = "https://air-quality-api.open-meteo.com/v1";

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

function pickCurrentValue(
  current: Record<string, unknown> | undefined,
  key: string,
  fallback = 0
): number {
  return toNumber(current?.[key], fallback);
}

function pickCurrentTime(
  current: Record<string, unknown> | undefined,
  fallback: string
): string {
  return typeof current?.time === "string" ? current.time : fallback;
}

async function fetchAirQualitySnapshot(
  lat: number,
  lon: number,
  timezone: string
): Promise<AirQualitySnapshot | null> {
  const params = new URLSearchParams({
    latitude: lat.toFixed(4),
    longitude: lon.toFixed(4),
    timezone,
    current: ["us_aqi", "pm2_5", "pm10", "ozone", "uv_index"].join(","),
  });

  const response = await fetch(`${OPEN_METEO_AIR_QUALITY_BASE}/air-quality?${params}`, {
    next: { revalidate: 1800 },
  });

  if (!response.ok) {
    return null;
  }

  const data = await response.json();
  const current = data.current as Record<string, unknown> | undefined;

  if (!current) {
    return null;
  }

  return {
    time: pickCurrentTime(current, new Date().toISOString()),
    usAqi: pickCurrentValue(current, "us_aqi"),
    pm2_5: pickCurrentValue(current, "pm2_5"),
    pm10: pickCurrentValue(current, "pm10"),
    ozone: pickCurrentValue(current, "ozone"),
    uvIndex: pickCurrentValue(current, "uv_index"),
  };
}

export async function fetchWeatherOutlook(
  lat: number,
  lon: number,
  timezone: string = "auto"
): Promise<WeatherOutlookData> {
  const params = new URLSearchParams({
    latitude: lat.toFixed(4),
    longitude: lon.toFixed(4),
    timezone,
    forecast_days: "10",
    wind_speed_unit: "kmh",
    current: [
      "temperature_2m",
      "apparent_temperature",
      "relative_humidity_2m",
      "precipitation",
      "rain",
      "showers",
      "snowfall",
      "weather_code",
      "cloud_cover",
      "wind_speed_10m",
      "wind_direction_10m",
      "wind_gusts_10m",
      "visibility",
      "is_day",
    ].join(","),
    hourly: [
      "temperature_2m",
      "apparent_temperature",
      "relative_humidity_2m",
      "precipitation",
      "precipitation_probability",
      "weather_code",
      "wind_speed_10m",
      "is_day",
    ].join(","),
    daily: [
      "weather_code",
      "temperature_2m_max",
      "temperature_2m_min",
      "apparent_temperature_max",
      "apparent_temperature_min",
      "sunrise",
      "sunset",
      "daylight_duration",
      "sunshine_duration",
      "uv_index_max",
      "precipitation_sum",
      "precipitation_probability_max",
      "wind_speed_10m_max",
      "wind_gusts_10m_max",
    ].join(","),
  });

  const weatherResponse = await fetch(`${OPEN_METEO_BASE}/forecast?${params}`, {
    next: { revalidate: 1800 },
  });

  if (!weatherResponse.ok) {
    throw new Error(`Open-Meteo outlook error: ${weatherResponse.status}`);
  }

  const data = await weatherResponse.json();
  const resolvedTimezone =
    typeof data.timezone === "string" ? data.timezone : timezone;

  const [
    times,
    temperatures,
    apparentTemperatures,
    humidity,
    precipitation,
    precipitationProbability,
    weatherCodes,
    windSpeeds,
    isDay,
  ] = [
    data.hourly?.time ?? [],
    data.hourly?.temperature_2m ?? [],
    data.hourly?.apparent_temperature ?? [],
    data.hourly?.relative_humidity_2m ?? [],
    data.hourly?.precipitation ?? [],
    data.hourly?.precipitation_probability ?? [],
    data.hourly?.weather_code ?? [],
    data.hourly?.wind_speed_10m ?? [],
    data.hourly?.is_day ?? [],
  ];

  const currentTime = typeof data.current?.time === "string" ? data.current.time : times[0];
  const currentIndex = Math.max(0, times.findIndex((value: string) => value === currentTime));
  const hourly: WeatherOutlookHourlyPoint[] = [];

  for (let index = currentIndex; index < Math.min(times.length, currentIndex + 24); index += 1) {
    hourly.push({
      time: times[index],
      temperature: toNumber(temperatures[index]),
      apparentTemperature: toNumber(apparentTemperatures[index]),
      humidityPercent: toNumber(humidity[index]),
      precipitationMM: toNumber(precipitation[index]),
      precipitationProbability: toNumber(precipitationProbability[index]),
      weatherCode: toNumber(weatherCodes[index]),
      windSpeedKph: toNumber(windSpeeds[index]),
      isDay: toNumber(isDay[index]),
    });
  }

  const dailyTimes: string[] = data.daily?.time ?? [];
  const daily: WeatherOutlookDailyPoint[] = dailyTimes.map((date, index) => ({
    date,
    weatherCode: toNumber(data.daily?.weather_code?.[index]),
    temperatureMax: toNumber(data.daily?.temperature_2m_max?.[index]),
    temperatureMin: toNumber(data.daily?.temperature_2m_min?.[index]),
    apparentTemperatureMax: toNumber(data.daily?.apparent_temperature_max?.[index]),
    apparentTemperatureMin: toNumber(data.daily?.apparent_temperature_min?.[index]),
    sunrise: typeof data.daily?.sunrise?.[index] === "string" ? data.daily.sunrise[index] : date,
    sunset: typeof data.daily?.sunset?.[index] === "string" ? data.daily.sunset[index] : date,
    daylightDurationSeconds: toNumber(data.daily?.daylight_duration?.[index]),
    sunshineDurationSeconds: toNumber(data.daily?.sunshine_duration?.[index]),
    uvIndexMax: toNumber(data.daily?.uv_index_max?.[index]),
    precipitationSumMM: toNumber(data.daily?.precipitation_sum?.[index]),
    precipitationProbabilityMax: toNumber(data.daily?.precipitation_probability_max?.[index]),
    windSpeedMaxKph: toNumber(data.daily?.wind_speed_10m_max?.[index]),
    windGustsMaxKph: toNumber(data.daily?.wind_gusts_10m_max?.[index]),
  }));

  const fallbackCurrent = hourly[0];
  const current = data.current as Record<string, unknown> | undefined;
  const airQuality = await fetchAirQualitySnapshot(lat, lon, resolvedTimezone);

  return {
    timezone: resolvedTimezone,
    current: {
      time: pickCurrentTime(current, fallbackCurrent?.time ?? new Date().toISOString()),
      temperature: pickCurrentValue(current, "temperature_2m", fallbackCurrent?.temperature ?? 0),
      apparentTemperature: pickCurrentValue(
        current,
        "apparent_temperature",
        fallbackCurrent?.apparentTemperature ?? 0
      ),
      humidityPercent: pickCurrentValue(
        current,
        "relative_humidity_2m",
        fallbackCurrent?.humidityPercent ?? 0
      ),
      precipitationMM: pickCurrentValue(
        current,
        "precipitation",
        fallbackCurrent?.precipitationMM ?? 0
      ),
      rainMM: pickCurrentValue(current, "rain"),
      showersMM: pickCurrentValue(current, "showers"),
      snowfallMM: pickCurrentValue(current, "snowfall"),
      weatherCode: pickCurrentValue(
        current,
        "weather_code",
        fallbackCurrent?.weatherCode ?? 0
      ),
      cloudCoverPercent: pickCurrentValue(current, "cloud_cover"),
      windSpeedKph: pickCurrentValue(
        current,
        "wind_speed_10m",
        fallbackCurrent?.windSpeedKph ?? 0
      ),
      windDirectionDeg: pickCurrentValue(current, "wind_direction_10m"),
      windGustKph: pickCurrentValue(current, "wind_gusts_10m"),
      visibilityM: pickCurrentValue(current, "visibility"),
      isDay: pickCurrentValue(current, "is_day", fallbackCurrent?.isDay ?? 1),
    },
    hourly,
    daily,
    airQuality,
    source: "open-meteo",
  };
}
