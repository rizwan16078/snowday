/**
 * LLM-as-judge — grades the QUALITY of the engine's natural-language
 * `explanation` string. Numeric assertions (scoring.ts) can prove the
 * probability is right; they cannot prove the prose is faithful to the inputs,
 * internally consistent, or appropriately calibrated to the score. That is what
 * this judge checks.
 *
 * Design:
 *   - Uses the Anthropic Messages API directly via fetch (no SDK dependency).
 *   - The rubric/system prompt is marked `cache_control` so repeated runs hit
 *     the prompt cache (cheaper + faster).
 *   - If ANTHROPIC_API_KEY is absent the judge SKIPS cleanly — the deterministic
 *     suite and regression checks still run in CI without a key/budget.
 *
 * Model is configurable via SNOWSENSE_JUDGE_MODEL (default: claude-sonnet-4-6),
 * which is plenty for grading three-sentence explanations.
 */

import { runPredictionEngine } from "../src/lib/prediction-engine";
import type { WeatherData, SnowDayPrediction } from "../src/types/snow";
import { GOLDEN_CASES } from "./golden-dataset";

const API_URL = "https://api.anthropic.com/v1/messages";
const MODEL = process.env.SNOWSENSE_JUDGE_MODEL || "claude-sonnet-4-6";

export interface JudgeVerdict {
  id: string;
  factuallyConsistent: boolean;
  calibratedToProbability: boolean;
  noUnitOrFactualErrors: boolean;
  coherent: boolean;
  overallScore: number; // 1-5
  issues: string[];
  verdict: "pass" | "fail";
}

export interface JudgeReport {
  skipped: boolean;
  reason?: string;
  verdicts: JudgeVerdict[];
  averageScore: number;
  passed: number;
  total: number;
}

const SYSTEM_PROMPT = `You are a strict evaluator of weather-app explanation text. You are given:
  (a) the raw weather facts the model saw,
  (b) the numeric snow-day prediction it produced (probability, status, factor scores),
  (c) the one-paragraph natural-language EXPLANATION the model generated.

Judge ONLY the explanation against (a) and (b). Grade these dimensions:
  - factuallyConsistent: every claim in the explanation is supported by the weather facts (e.g. it doesn't say "heavy snowfall" when snow≈0, doesn't claim ice when there is none, gets the temperature direction right).
  - calibratedToProbability: the explanation's tone/confidence matches the numeric probability and status. A 10% prediction must not read like a certain closure; an 80% prediction must not read as dismissive.
  - noUnitOrFactualErrors: no misleading units or impossible statements.
  - coherent: reads cleanly, no internal contradictions or dangling fragments.

Return ONLY a JSON object, no prose, with exactly this shape:
{"factuallyConsistent":bool,"calibratedToProbability":bool,"noUnitOrFactualErrors":bool,"coherent":bool,"overallScore":1-5,"issues":[string,...]}
Default to the harsher judgement when uncertain. overallScore 5 = flawless, 1 = misleading.`;

function summarizeWeather(w: WeatherData): string {
  const totalSnow = w.snowfallMM.toFixed(1);
  const overnightSnow = w.hourlySnow
    .filter((h) => h.hour >= 22 || h.hour <= 5)
    .reduce((s, h) => s + h.snowMM, 0)
    .toFixed(1);
  const hasMixed = w.hourly.some((h) => h.precipitationType === "mixed");
  return [
    `current_temp_C=${w.temperature}`,
    `total_snow_units_24h=${totalSnow}`,
    `overnight_snow_units=${overnightSnow}`,
    `total_precip_units=${w.precipitationMM.toFixed(1)}`,
    `dominant_precip_type=${w.precipitationType}`,
    `mixed_or_freezing_present=${hasMixed}`,
  ].join(", ");
}

function buildUserMessage(w: WeatherData, p: SnowDayPrediction, context: string): string {
  return [
    `WEATHER FACTS: ${summarizeWeather(w)}`,
    `CONTEXT: ${context}`,
    `PREDICTION: probability=${p.probability}%, status="${p.status}", confidence=${p.confidence}`,
    `FACTOR SCORES (0-100): snowfall=${p.factors.snowfall}, iceRisk=${p.factors.iceRisk}, temperature=${p.factors.temperature}, timing=${p.factors.timing}`,
    `EXPLANATION TO GRADE: "${p.explanation}"`,
  ].join("\n");
}

async function callJudge(userMessage: string): Promise<Omit<JudgeVerdict, "id" | "verdict">> {
  const res = await fetch(API_URL, {
    method: "POST",
    headers: {
      "x-api-key": process.env.ANTHROPIC_API_KEY as string,
      "anthropic-version": "2023-06-01",
      "content-type": "application/json",
    },
    body: JSON.stringify({
      model: MODEL,
      max_tokens: 512,
      system: [
        { type: "text", text: SYSTEM_PROMPT, cache_control: { type: "ephemeral" } },
      ],
      messages: [{ role: "user", content: userMessage }],
    }),
  });

  if (!res.ok) {
    throw new Error(`Anthropic API ${res.status}: ${await res.text()}`);
  }

  const data = (await res.json()) as { content: { type: string; text?: string }[] };
  const text = data.content.find((b) => b.type === "text")?.text ?? "";
  const jsonStart = text.indexOf("{");
  const jsonEnd = text.lastIndexOf("}");
  if (jsonStart === -1 || jsonEnd === -1) {
    throw new Error(`Judge returned non-JSON: ${text.slice(0, 200)}`);
  }
  const parsed = JSON.parse(text.slice(jsonStart, jsonEnd + 1));
  return {
    factuallyConsistent: Boolean(parsed.factuallyConsistent),
    calibratedToProbability: Boolean(parsed.calibratedToProbability),
    noUnitOrFactualErrors: Boolean(parsed.noUnitOrFactualErrors),
    coherent: Boolean(parsed.coherent),
    overallScore: Number(parsed.overallScore) || 0,
    issues: Array.isArray(parsed.issues) ? parsed.issues.map(String) : [],
  };
}

export async function runJudge(): Promise<JudgeReport> {
  if (!process.env.ANTHROPIC_API_KEY) {
    return {
      skipped: true,
      reason: "ANTHROPIC_API_KEY not set — explanation-quality judging skipped.",
      verdicts: [],
      averageScore: 0,
      passed: 0,
      total: 0,
    };
  }

  const verdicts: JudgeVerdict[] = [];
  for (const c of GOLDEN_CASES) {
    const prediction = runPredictionEngine(c.weather, c.config);
    const graded = await callJudge(buildUserMessage(c.weather, prediction, c.judgeContext));
    const verdict: JudgeVerdict["verdict"] =
      graded.overallScore >= 4 && graded.factuallyConsistent && graded.calibratedToProbability
        ? "pass"
        : "fail";
    verdicts.push({ id: c.id, ...graded, verdict });
  }

  const passed = verdicts.filter((v) => v.verdict === "pass").length;
  const averageScore = verdicts.reduce((s, v) => s + v.overallScore, 0) / verdicts.length;

  return { skipped: false, verdicts, averageScore, passed, total: verdicts.length };
}
