# SnowSense AI-Feature Evaluation

Evaluation harness for the "AI" in SnowSense — which is a **deterministic,
rule-based prediction engine** (`src/lib/prediction-engine.ts`) plus a
**template-based explanation generator**. There is no LLM in the prediction
path; the only place an LLM is used here is as a *judge* of the generated
explanation text.

## Commands

```bash
npm run eval          # deterministic grading + property tests + regression  (CI-safe, no key)
npm run eval:update   # re-pin the regression baseline after a reviewed change
npm run eval:judge    # also grade explanation text with an LLM (needs ANTHROPIC_API_KEY)
```

Exit code is non-zero if any deterministic case, property test, or regression
check fails — drop `npm run eval` straight into CI.

## The four layers

### 1. Golden dataset — `golden-dataset.ts`
10 hand-reasoned reference scenarios (heavy northern snow, warm-region fallback,
off-season, freezing-rain-only, southern ice+snow, cold-day, midday-timing,
boundary cases…). Each pins an expected **probability range**, **status**, and
**dominant factor**. Inputs are built with `fixtures.ts` and use a fixed
`referenceDate` so date-dependent logic is reproducible.

### 2. Scoring function — `scoring.ts`
- **Per-case grading:** probability-in-range, status match, dominant-factor,
  fallback flag → aggregated to **pass-rate**, **status-accuracy**, **prob MAE**.
- **Property tests:** invariants that must hold for *any* input —
  strictness monotonicity, region monotonicity, snowfall monotonicity,
  calibration `daysUsed` monotonicity, school-type ordering, `[0,100]` clamping.

### 3. LLM-as-judge — `llm-judge.ts`
Grades the *quality of the natural-language explanation* (faithful to inputs,
calibrated to the probability, no unit/factual errors, coherent). Calls the
Anthropic Messages API directly via `fetch`, with the rubric prompt-cached.
**Skips cleanly when `ANTHROPIC_API_KEY` is unset** so the rest of the suite runs
keyless. Model via `SNOWSENSE_JUDGE_MODEL` (default `claude-sonnet-4-6`).

### 4. Regression — `regression.ts` + `baseline.json`
Pins each case's exact `probability / confidence / status / factors /
explanation` to a committed baseline and fails on any drift — including changes
to the generated explanation string. `npm run eval:update` re-baselines.

## Testability note
`runPredictionEngine` previously called `new Date()` internally, making
off-season behaviour and `lastUpdated` non-deterministic. `PredictionConfig` now
accepts an optional `referenceDate` (production omits it → `new Date()`; the
harness injects a fixed date). This was the one source change required to make
the feature evaluable.

## Model behaviour notes
- **Cold-day handling** (`extreme-cold-windchill`): a `getColdDayBonus` keyed off
  wind chill (feels-like) now lifts genuine cold days (≤ -20°F wind chill) to
  "Possible" even with no snow. Mild cold (`extreme-cold-no-snow`, ≈-8°F) stays
  high-Unlikely — appropriate, since that's below most districts' closure bar.
- **Ice handling** (`freezing-rain-only-moderate`): a `getIceBonus` lifts a pure
  glaze/freezing-rain event to at least "Possible" without any plowable snow.
- **Northern non-ice cap** (`northern-heavy-snow-cold`): the -12 northern modifier
  means a snow-only event in the north tops out around "Possible" — intentional,
  reflecting that snow-hardened districts rarely close for snow alone.

These three behaviours are pinned by the golden dataset + regression baseline, so
any future re-tuning of weights/bonuses will surface here as drift.
