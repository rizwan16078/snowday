/**
 * Golden dataset — reference scenarios for the SnowSense prediction engine.
 *
 * Each case pins a hand-reasoned expectation (probability range, status,
 * dominant factor) to a fully-specified weather input. Ranges are intentionally
 * tolerant (±~6 points) because the *contract* under test is the engine's
 * qualitative behaviour, not a magic constant. Exact values are pinned
 * separately by the regression baseline.
 *
 * All cases use a fixed `referenceDate` so date-dependent logic (off-season) is
 * reproducible regardless of when the suite runs.
 */

import type { SnowDayPrediction, StrictnessLevel } from "../src/types/snow";
import { makeWeather, snowAcross } from "./fixtures";

const WINTER = new Date("2025-01-15T12:00:00Z");
const SUMMER = new Date("2025-07-15T12:00:00Z");

export type FactorKey = keyof SnowDayPrediction["factors"];

export interface GoldenCase {
  id: string;
  description: string;
  config: { strictness: StrictnessLevel; latitude: number; referenceDate: Date };
  weather: ReturnType<typeof makeWeather>;
  expect: {
    probabilityRange: [number, number];
    status: SnowDayPrediction["status"];
    /** Expected highest-scoring factor (checked against the set of maxima). */
    dominantFactor?: FactorKey;
    isFallback?: boolean;
  };
  /** Human context surfaced to the LLM judge when grading the explanation. */
  judgeContext: string;
}

export const GOLDEN_CASES: GoldenCase[] = [
  {
    id: "northern-heavy-snow-cold",
    description: "Boston-latitude heavy overnight snow, hard freeze, no ice mix",
    config: { strictness: "normal", latitude: 42.36, referenceDate: WINTER },
    weather: makeWeather({ temperature: -8, hours: snowAcross([23, 0, 1, 2, 3, 4], 30, -8) }),
    expect: { probabilityRange: [51, 63], status: "Possible", dominantFactor: "snowfall" },
    judgeContext:
      "30 units of snow fall overnight at -8°C in a snow-hardened northern city. The northern infrastructure modifier deliberately caps non-ice events below 'Very Likely'.",
  },
  {
    id: "warm-region-fallback",
    description: "Atlanta-latitude, 22°C — warm-region short circuit",
    config: { strictness: "normal", latitude: 33.75, referenceDate: WINTER },
    weather: makeWeather({ temperature: 22 }),
    expect: { probabilityRange: [0, 0], status: "Unlikely", isFallback: true },
    judgeContext: "It is 22°C. No snow day is physically possible; the engine returns a warm-region fallback.",
  },
  {
    id: "off-season-fallback",
    description: "Northern latitude, July, no snow — off-season short circuit",
    config: { strictness: "normal", latitude: 42.0, referenceDate: SUMMER },
    weather: makeWeather({ temperature: 10 }),
    expect: { probabilityRange: [2, 2], status: "Unlikely", isFallback: true },
    judgeContext: "It is July in the northern hemisphere with no snow. The engine returns an off-season fallback.",
  },
  {
    id: "light-snow-moderate",
    description: "Mid-Atlantic light overnight snow, near freezing",
    config: { strictness: "normal", latitude: 38.9, referenceDate: WINTER },
    weather: makeWeather({ temperature: -1, hours: snowAcross([2, 3], 5, -1) }),
    expect: { probabilityRange: [14, 26], status: "Unlikely", dominantFactor: "timing" },
    judgeContext: "5 units of light snow overnight near freezing in a moderate region — not enough to close schools.",
  },
  {
    id: "freezing-rain-only-moderate",
    description: "Freezing-rain / mixed precip, no accumulation",
    config: { strictness: "normal", latitude: 36.0, referenceDate: WINTER },
    weather: makeWeather({
      temperature: 0,
      hours: [
        { hour: 4, precipitationMM: 2, precipitationType: "mixed", tempC: 0 },
        { hour: 5, precipitationMM: 2, precipitationType: "mixed", tempC: 0 },
        { hour: 6, precipitationMM: 2, precipitationType: "mixed", tempC: 0 },
      ],
    }),
    expect: { probabilityRange: [50, 62], status: "Possible", dominantFactor: "iceRisk" },
    judgeContext:
      "Freezing rain with maxed-out ice risk but zero snow accumulation. The ice-severity bonus lifts a glaze event to at least 'Possible' even without plowable snow.",
  },
  {
    id: "southern-ice-and-snow",
    description: "Houston-latitude snow + freezing rain mix overnight",
    config: { strictness: "normal", latitude: 29.0, referenceDate: WINTER },
    weather: makeWeather({
      temperature: -1,
      hours: [
        { hour: 2, snowMM: 2.6667, precipitationMM: 1.5, precipitationType: "mixed", tempC: -1 },
        { hour: 3, snowMM: 2.6667, precipitationMM: 1.5, precipitationType: "mixed", tempC: -1 },
        { hour: 4, snowMM: 2.6667, precipitationMM: 1.5, precipitationType: "mixed", tempC: -1 },
      ],
    }),
    expect: { probabilityRange: [92, 100], status: "Very Likely", dominantFactor: "iceRisk" },
    judgeContext:
      "Deep-south city hit with overnight snow AND ice. Southern unpreparedness modifier plus the ice-severity bonus saturate this at the top of the scale.",
  },
  {
    id: "southern-light-snow-boundary",
    description: "Southern light snow sitting on the Unlikely/Possible boundary",
    config: { strictness: "normal", latitude: 29.0, referenceDate: WINTER },
    weather: makeWeather({ temperature: 0, hours: snowAcross([3, 4], 4, 0) }),
    expect: { probabilityRange: [30, 42], status: "Unlikely", dominantFactor: "timing" },
    judgeContext: "A small amount of snow in the unprepared south — borderline, just under the Possible threshold.",
  },
  {
    id: "extreme-cold-no-snow",
    description: "Minnesota deep freeze, -22°C, no snow (cold-day scenario)",
    config: { strictness: "normal", latitude: 46.0, referenceDate: WINTER },
    weather: makeWeather({ temperature: -22 }),
    expect: { probabilityRange: [33, 43], status: "Unlikely", dominantFactor: "temperature" },
    judgeContext:
      "-22°C air temp (≈-8°F) with no snow. The cold-day bonus now lifts this from negligible into the high-Unlikely band — appropriate, since -8°F is cold but below the wind-chill threshold at which most districts actually close.",
  },
  {
    id: "extreme-cold-windchill",
    description: "Northern -30°C wind chill (~-22°F), no snow — true cold-day closure",
    config: { strictness: "normal", latitude: 46.0, referenceDate: WINTER },
    weather: makeWeather({ temperature: -30 }),
    expect: { probabilityRange: [53, 65], status: "Possible", dominantFactor: "temperature" },
    judgeContext:
      "A genuine -22°F wind-chill cold day with no snow. The cold-day bonus pushes this to 'Possible' — reflecting that northern districts frequently close at this wind chill purely for bus-stop exposure and buses failing to start.",
  },
  {
    id: "daytime-snow-low-timing",
    description: "Heavy snow but falling midday (poor timing for closure)",
    config: { strictness: "normal", latitude: 38.9, referenceDate: WINTER },
    weather: makeWeather({ temperature: -3, hours: snowAcross([11, 12, 13, 14], 20, -3) }),
    expect: { probabilityRange: [36, 48], status: "Possible", dominantFactor: "snowfall" },
    judgeContext:
      "Same 20 units of snow as a closure-worthy storm, but it falls midday after buses have run — timing factor is zero, so probability is materially lower than the overnight equivalent.",
  },
  {
    id: "southern-significant-overnight",
    description: "Southern significant overnight snow → Very Likely",
    config: { strictness: "normal", latitude: 29.0, referenceDate: WINTER },
    weather: makeWeather({ temperature: -5, hours: snowAcross([0, 1, 2, 3], 18, -5) }),
    expect: { probabilityRange: [68, 80], status: "Very Likely", dominantFactor: "timing" },
    judgeContext: "Significant overnight accumulation in an unprepared southern city — a clear closure signal.",
  },
];

/**
 * Property cases — invariants that must hold regardless of exact numbers.
 * Each provides the shared weather + a family of configs to compare.
 */
export const PROPERTY_WEATHER = makeWeather({
  temperature: -4,
  hours: snowAcross([0, 1, 2, 3, 4], 14, -4),
});
