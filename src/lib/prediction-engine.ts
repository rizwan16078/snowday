/**
 * SnowSense™ Prediction Engine
 * Calculates snow day probability using weather data, regional tolerance, and user strictness.
 */

import type {
  WeatherData,
  SnowDayPrediction,
  PredictionConfig,
  RegionType,
} from "@/types/snow";

// ─── Regional Classification ────────────────────────────────────────────────

function getRegionType(lat: number): RegionType {
  const absLat = Math.abs(lat);
  if (absLat >= 40) return "northern";
  if (absLat >= 30) return "moderate";
  return "southern";
}

function getRegionalModifier(lat: number): number {
  const region = getRegionType(lat);
  // Northern: locals handle snow better → reduce probability
  // Southern: any snow = chaos → increase probability
  switch (region) {
    case "northern":
      return -12;
    case "moderate":
      return 0;
    case "southern":
      return +20;
  }
}

// ─── Strictness Modifier ────────────────────────────────────────────────────

function getStrictnessModifier(strictness: PredictionConfig["strictness"]): number {
  switch (strictness) {
    case "lenient":
      return +15; // more likely to close
    case "normal":
      return 0;
    case "strict":
      return -15; // harder to close
  }
}

// ─── Factor Scoring ─────────────────────────────────────────────────────────

function scoreSnowfall(snowMM: number): number {
  // 0→0, 25mm→100
  if (snowMM <= 0) return 0;
  if (snowMM >= 25) return 100;
  return Math.round((snowMM / 25) * 100);
}

function scoreIceRisk(weather: WeatherData): number {
  const mixedHours = weather.hourly.filter(
    (point) => point.precipitationType === "mixed"
  );
  const freezingRainHours = weather.hourly.filter(
    (point) =>
      point.precipitationType === "rain" &&
      point.tempC <= 1 &&
      point.precipitationMM > 0
  );

  if (mixedHours.length > 0) {
    const mixedVolume = mixedHours.reduce(
      (sum, point) => sum + point.precipitationMM,
      0
    );
    return Math.min(100, 55 + mixedVolume * 10);
  }

  if (freezingRainHours.length > 0) {
    const rainVolume = freezingRainHours.reduce(
      (sum, point) => sum + point.precipitationMM,
      0
    );
    return Math.min(100, 45 + rainVolume * 8);
  }

  if (weather.temperature <= 2 && weather.precipitationMM > 0) {
    return Math.min(100, 30 + weather.precipitationMM * 5);
  }

  if (weather.temperature < -15) return 30;
  return 0;
}

function scoreTemperature(tempC: number): number {
  // Very cold = higher road risk
  if (tempC > 4) return 0;
  if (tempC <= -15) return 100;
  // Map -15°C → 100, 4°C → 0
  return Math.round(((4 - tempC) / 19) * 100);
}

function scoreTiming(hourlySnow: WeatherData["hourlySnow"]): number {
  // Overnight (22:00–6:00) or early morning (5:00–8:00) snow is worst for roads
  let overnightSnow = 0;
  let morningSnow = 0;

  for (const h of hourlySnow) {
    if (h.hour >= 22 || h.hour <= 5) overnightSnow += h.snowMM;
    if (h.hour >= 5 && h.hour <= 8) morningSnow += h.snowMM;
  }

  const overnightScore = Math.min(100, (overnightSnow / 10) * 100);
  const morningScore = Math.min(100, (morningSnow / 5) * 100);

  return Math.round(Math.max(overnightScore, morningScore));
}

// ─── Warm Region & Off-Season Checks ────────────────────────────────────────

function isWarmRegion(tempC: number): boolean {
  return tempC > 15;
}

function isOffSeason(lat: number, timezone?: string): boolean {
  const month = Number(
    new Intl.DateTimeFormat("en-US", {
      month: "numeric",
      timeZone: timezone || "UTC",
    }).format(new Date())
  );
  // Northern hemisphere: off-season = May–September
  // Southern hemisphere: off-season = November–March
  if (lat >= 0) {
    return month >= 5 && month <= 9;
  } else {
    return month >= 11 || month <= 3;
  }
}

// ─── Explanation Generator ───────────────────────────────────────────────────

function generateExplanation(
  factors: SnowDayPrediction["factors"],
  probability: number,
  tempC: number,
  snowMM: number,
  region: RegionType
): string {
  const parts: string[] = [];

  if (snowMM > 15) {
    parts.push(`Heavy snowfall of ${snowMM.toFixed(1)}mm is forecast`);
  } else if (snowMM > 5) {
    parts.push(`Moderate snowfall of ${snowMM.toFixed(1)}mm is expected`);
  } else if (snowMM > 0) {
    parts.push(`Light snowfall of ${snowMM.toFixed(1)}mm is possible`);
  } else {
    parts.push("No significant snowfall is forecast");
  }

  if (factors.timing > 60) {
    parts.push("overnight accumulation will make morning roads dangerous");
  } else if (factors.timing > 30) {
    parts.push("with snow falling during morning commute hours");
  }

  if (factors.iceRisk > 50) {
    parts.push("freezing rain and ice create serious road hazards");
  }

  if (tempC <= -10) {
    parts.push(`extreme cold (${tempC.toFixed(0)}°C) will worsen conditions`);
  } else if (tempC <= 0) {
    parts.push(`sub-freezing temperatures (${tempC.toFixed(0)}°C) will prevent melting`);
  }

  if (region === "southern") {
    parts.push("— Southern regions are typically unprepared for winter events");
  } else if (region === "northern" && probability > 60) {
    parts.push("— even snow-hardened Northern infrastructure will struggle");
  }

  if (parts.length === 0) return "Weather conditions appear normal with no snow day risk.";

  // Capitalize first letter and join nicely
  const [first, ...rest] = parts;
  const joined = rest.length > 0 ? `${first}, ${rest.join(", ")}.` : `${first}.`;
  return joined.charAt(0).toUpperCase() + joined.slice(1);
}

// ─── Status Classifier ───────────────────────────────────────────────────────

function classifyStatus(probability: number): SnowDayPrediction["status"] {
  if (probability < 40) return "Unlikely";
  if (probability < 70) return "Possible";
  return "Very Likely";
}

// ─── Main Engine ─────────────────────────────────────────────────────────────

export function runPredictionEngine(
  weather: WeatherData,
  config: PredictionConfig
): SnowDayPrediction {
  const now = new Date().toISOString();

  // ── Warm region fallback
  if (isWarmRegion(weather.temperature)) {
    const tempF = Math.round((weather.temperature * 9) / 5 + 32);
    return {
      probability: 0,
      confidence: 95,
      status: "Unlikely",
      factors: { snowfall: 0, iceRisk: 0, temperature: 0, timing: 0 },
      explanation: `It's ${tempF}°F — no snow day expected. Enjoy the warm weather!`,
      lastUpdated: now,
      rawWeather: weather,
      isFallback: true,
      fallbackMessage: `It's ${tempF}°F — no snow day expected.`,
    };
  }

  // ── Off-season check
  if (isOffSeason(config.latitude, weather.timezone) && weather.snowfallMM < 1) {
    return {
      probability: 2,
      confidence: 88,
      status: "Unlikely",
      factors: { snowfall: 0, iceRisk: 0, temperature: 0, timing: 0 },
      explanation:
        "Snow day season is inactive in your region right now. Check back when temperatures drop!",
      lastUpdated: now,
      rawWeather: weather,
      isFallback: true,
      fallbackMessage: "Snow day season is currently inactive in your region.",
    };
  }

  // ── Compute factor scores
  const snowfallScore = scoreSnowfall(weather.snowfallMM);
  const iceRiskScore = scoreIceRisk(weather);
  const temperatureScore = scoreTemperature(weather.temperature);
  const timingScore = scoreTiming(weather.hourlySnow);

  // ── Weighted composite (snowfall is most important)
  const rawScore =
    snowfallScore * 0.45 +
    iceRiskScore * 0.25 +
    temperatureScore * 0.15 +
    timingScore * 0.15;

  // ── Apply regional + strictness modifiers
  const regionalMod = getRegionalModifier(config.latitude);
  const strictnessMod = getStrictnessModifier(config.strictness);
  const region = getRegionType(config.latitude);

  let probability = Math.round(rawScore + regionalMod + strictnessMod);
  probability = Math.max(0, Math.min(100, probability));

  // ── Confidence: higher when data is extreme (very clear yes or no)
  const extremeness = Math.abs(probability - 50) / 50; // 0=uncertain, 1=certain
  const confidence = Math.round(55 + extremeness * 40);

  const factors = {
    snowfall: snowfallScore,
    iceRisk: iceRiskScore,
    temperature: temperatureScore,
    timing: timingScore,
  };

  return {
    probability,
    confidence,
    status: classifyStatus(probability),
    factors,
    explanation: generateExplanation(factors, probability, weather.temperature, weather.snowfallMM, region),
    lastUpdated: now,
    rawWeather: weather,
  };
}
