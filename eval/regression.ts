/**
 * Regression harness — pins the engine's exact output across the golden dataset
 * to a committed baseline, then fails when any value drifts.
 *
 * The deterministic suite (scoring.ts) checks behaviour against tolerant ranges;
 * this catches the OPPOSITE problem — a silent shift that stays inside the range
 * but changes real users' numbers, or any change to the generated explanation
 * text. Run with `--update` to intentionally re-baseline after a reviewed change.
 */

import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { runPredictionEngine } from "../src/lib/prediction-engine";
import type { SnowDayPrediction } from "../src/types/snow";
import { GOLDEN_CASES } from "./golden-dataset";

const BASELINE_PATH = fileURLToPath(new URL("./baseline.json", import.meta.url));

export interface Snapshot {
  probability: number;
  confidence: number;
  status: SnowDayPrediction["status"];
  factors: SnowDayPrediction["factors"];
  explanation: string;
}

export type Baseline = Record<string, Snapshot>;

export function snapshotAll(): Baseline {
  const out: Baseline = {};
  for (const c of GOLDEN_CASES) {
    const p = runPredictionEngine(c.weather, c.config);
    out[c.id] = {
      probability: p.probability,
      confidence: p.confidence,
      status: p.status,
      factors: p.factors,
      explanation: p.explanation,
    };
  }
  return out;
}

export interface RegressionDiff {
  id: string;
  field: string;
  baseline: unknown;
  current: unknown;
}

export interface RegressionReport {
  hasBaseline: boolean;
  diffs: RegressionDiff[];
  newCases: string[];
  missingCases: string[];
}

export function compareToBaseline(current: Baseline): RegressionReport {
  if (!existsSync(BASELINE_PATH)) {
    return { hasBaseline: false, diffs: [], newCases: Object.keys(current), missingCases: [] };
  }
  const baseline = JSON.parse(readFileSync(BASELINE_PATH, "utf8")) as Baseline;
  const diffs: RegressionDiff[] = [];
  const newCases: string[] = [];
  const missingCases = Object.keys(baseline).filter((id) => !(id in current));

  for (const [id, snap] of Object.entries(current)) {
    const base = baseline[id];
    if (!base) {
      newCases.push(id);
      continue;
    }
    const fields: (keyof Snapshot)[] = ["probability", "confidence", "status", "explanation"];
    for (const f of fields) {
      if (JSON.stringify(snap[f]) !== JSON.stringify(base[f])) {
        diffs.push({ id, field: f, baseline: base[f], current: snap[f] });
      }
    }
    if (JSON.stringify(snap.factors) !== JSON.stringify(base.factors)) {
      diffs.push({ id, field: "factors", baseline: base.factors, current: snap.factors });
    }
  }

  return { hasBaseline: true, diffs, newCases, missingCases };
}

export function writeBaseline(baseline: Baseline): void {
  writeFileSync(BASELINE_PATH, JSON.stringify(baseline, null, 2) + "\n", "utf8");
}

export { BASELINE_PATH };
