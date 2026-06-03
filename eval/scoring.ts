/**
 * Scoring function — grades engine output against the golden dataset and
 * verifies behavioural invariants (property tests).
 *
 * Two layers:
 *   1. Per-case grading: probability-in-range, status match, dominant factor,
 *      fallback flag. Aggregated into pass-rate / status-accuracy / prob MAE.
 *   2. Property tests: monotonicity invariants that must hold for ANY inputs
 *      (strictness, region, snowfall, calibration). These catch regressions
 *      that a fixed dataset might miss.
 */

import { runPredictionEngine } from "../src/lib/prediction-engine";
import {
  applyCalibration,
  getDaysUsedModifier,
} from "../src/lib/calibration";
import type { SnowDayPrediction } from "../src/types/snow";
import { GOLDEN_CASES, PROPERTY_WEATHER, type GoldenCase, type FactorKey } from "./golden-dataset";

export interface CaseResult {
  id: string;
  passed: boolean;
  failures: string[];
  prediction: SnowDayPrediction;
  probabilityError: number; // |predicted - range midpoint|
}

export interface DeterministicReport {
  results: CaseResult[];
  total: number;
  passed: number;
  passRate: number;
  statusAccuracy: number;
  probabilityMAE: number;
  worst: CaseResult[];
}

function maxFactors(factors: SnowDayPrediction["factors"]): FactorKey[] {
  const entries = Object.entries(factors) as [FactorKey, number][];
  const max = Math.max(...entries.map(([, v]) => v));
  return entries.filter(([, v]) => v === max).map(([k]) => k);
}

export function gradeCase(c: GoldenCase): CaseResult {
  const prediction = runPredictionEngine(c.weather, c.config);
  const failures: string[] = [];

  const [lo, hi] = c.expect.probabilityRange;
  if (prediction.probability < lo || prediction.probability > hi) {
    failures.push(
      `probability ${prediction.probability} outside expected [${lo}, ${hi}]`
    );
  }
  if (prediction.status !== c.expect.status) {
    failures.push(`status "${prediction.status}" !== expected "${c.expect.status}"`);
  }
  if (c.expect.isFallback !== undefined && Boolean(prediction.isFallback) !== c.expect.isFallback) {
    failures.push(`isFallback ${Boolean(prediction.isFallback)} !== expected ${c.expect.isFallback}`);
  }
  if (c.expect.dominantFactor) {
    const maxima = maxFactors(prediction.factors);
    if (!maxima.includes(c.expect.dominantFactor)) {
      failures.push(
        `dominant factor expected "${c.expect.dominantFactor}" but maxima were [${maxima.join(", ")}]`
      );
    }
  }

  const midpoint = (lo + hi) / 2;
  return {
    id: c.id,
    passed: failures.length === 0,
    failures,
    prediction,
    probabilityError: Math.abs(prediction.probability - midpoint),
  };
}

export function runDeterministic(): DeterministicReport {
  const results = GOLDEN_CASES.map(gradeCase);
  const passed = results.filter((r) => r.passed).length;
  const statusHits = results.filter(
    (r, i) => r.prediction.status === GOLDEN_CASES[i].expect.status
  ).length;
  const probabilityMAE =
    results.reduce((s, r) => s + r.probabilityError, 0) / results.length;
  const worst = [...results].sort((a, b) => b.probabilityError - a.probabilityError).slice(0, 3);

  return {
    results,
    total: results.length,
    passed,
    passRate: passed / results.length,
    statusAccuracy: statusHits / results.length,
    probabilityMAE,
    worst,
  };
}

// ─── Property tests ──────────────────────────────────────────────────────────

export interface PropertyResult {
  name: string;
  passed: boolean;
  detail: string;
}

const REF = new Date("2025-01-15T12:00:00Z");

function prob(latitude: number, strictness: "lenient" | "normal" | "strict"): number {
  return runPredictionEngine(PROPERTY_WEATHER, { latitude, strictness, referenceDate: REF }).probability;
}

export function runPropertyTests(): PropertyResult[] {
  const out: PropertyResult[] = [];

  // P1 — strictness monotonicity: lenient ≥ normal ≥ strict (same weather)
  {
    const lat = 40;
    const lenient = prob(lat, "lenient");
    const normal = prob(lat, "normal");
    const strict = prob(lat, "strict");
    const ok = lenient >= normal && normal >= strict;
    out.push({
      name: "strictness monotonicity (lenient ≥ normal ≥ strict)",
      passed: ok,
      detail: `lenient=${lenient}, normal=${normal}, strict=${strict}`,
    });
  }

  // P2 — region monotonicity: southern ≥ moderate ≥ northern (same weather)
  {
    const southern = prob(29, "normal");
    const moderate = prob(35, "normal");
    const northern = prob(46, "normal");
    const ok = southern >= moderate && moderate >= northern;
    out.push({
      name: "region monotonicity (southern ≥ moderate ≥ northern)",
      passed: ok,
      detail: `southern=${southern}, moderate=${moderate}, northern=${northern}`,
    });
  }

  // P3 — snowfall monotonicity: more snow ⇒ probability never decreases
  {
    const { makeWeather, snowAcross } = require("./fixtures") as typeof import("./fixtures");
    let ok = true;
    let prev = -1;
    const series: number[] = [];
    for (const total of [0, 5, 10, 15, 20, 25, 30]) {
      const w = makeWeather({ temperature: -4, hours: snowAcross([0, 1, 2, 3], total, -4) });
      const p = runPredictionEngine(w, { latitude: 38, strictness: "normal", referenceDate: REF }).probability;
      series.push(p);
      if (p < prev) ok = false;
      prev = p;
    }
    out.push({
      name: "snowfall monotonicity (more snow ⇒ ≥ probability)",
      passed: ok,
      detail: `series=[${series.join(", ")}]`,
    });
  }

  // P4 — calibration daysUsed: modifier is non-increasing in daysUsed
  {
    let ok = true;
    let prev = Infinity;
    const series: number[] = [];
    for (let d = 0; d <= 10; d++) {
      const m = getDaysUsedModifier(d);
      series.push(m);
      if (m > prev) ok = false;
      prev = m;
    }
    out.push({
      name: "calibration daysUsed modifier non-increasing",
      passed: ok,
      detail: `modifiers=[${series.join(", ")}]`,
    });
  }

  // P5 — school type ordering: private ≥ public for identical base
  {
    const base = 50;
    const pub = applyCalibration(base, 2, "public");
    const priv = applyCalibration(base, 2, "private");
    out.push({
      name: "school-type ordering (private ≥ public)",
      passed: priv >= pub,
      detail: `public=${pub}, private=${priv}`,
    });
  }

  // P6 — probability is always clamped to [0, 100]
  {
    const { makeWeather, snowAcross } = require("./fixtures") as typeof import("./fixtures");
    const extreme = makeWeather({
      temperature: -30,
      hours: snowAcross([0, 1, 2, 3, 4, 5], 200, -30),
    });
    const p = runPredictionEngine(extreme, { latitude: 25, strictness: "lenient", referenceDate: REF }).probability;
    out.push({
      name: "probability clamped to [0, 100]",
      passed: p >= 0 && p <= 100,
      detail: `extreme-input probability=${p}`,
    });
  }

  return out;
}
