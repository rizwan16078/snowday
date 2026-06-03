/**
 * SnowSense AI-feature evaluation runner.
 *
 *   npm run eval            → deterministic grading + property tests + regression
 *   npm run eval:update     → re-baseline the regression snapshot (reviewed change)
 *   npm run eval:judge      → also run the LLM-as-judge on explanation text
 *
 * Exit code is non-zero if any deterministic case, property test, or regression
 * check fails — so it drops straight into CI.
 */

import { runDeterministic, runPropertyTests } from "./scoring";
import { snapshotAll, compareToBaseline, writeBaseline } from "./regression";
import { runJudge } from "./llm-judge";

const args = new Set(process.argv.slice(2));
const UPDATE = args.has("--update");
const JUDGE = args.has("--judge");

const C = {
  reset: "\x1b[0m",
  bold: "\x1b[1m",
  green: "\x1b[32m",
  red: "\x1b[31m",
  yellow: "\x1b[33m",
  dim: "\x1b[2m",
  cyan: "\x1b[36m",
};
const ok = (s: string) => `${C.green}${s}${C.reset}`;
const bad = (s: string) => `${C.red}${s}${C.reset}`;
const head = (s: string) => `\n${C.bold}${C.cyan}${s}${C.reset}`;
const pct = (n: number) => `${(n * 100).toFixed(1)}%`;

async function main() {
  let failed = false;

  // ── 1. Deterministic grading ───────────────────────────────────────────────
  console.log(head("1. Deterministic grading (golden dataset)"));
  const det = runDeterministic();
  for (const r of det.results) {
    const mark = r.passed ? ok("PASS") : bad("FAIL");
    console.log(
      `  ${mark}  ${r.id}  ${C.dim}p=${r.prediction.probability} status=${r.prediction.status}${C.reset}`
    );
    for (const f of r.failures) console.log(`         ${bad("↳ " + f)}`);
  }
  console.log(
    `  ${C.bold}pass-rate${C.reset} ${pct(det.passRate)} (${det.passed}/${det.total})  ` +
      `${C.bold}status-accuracy${C.reset} ${pct(det.statusAccuracy)}  ` +
      `${C.bold}prob MAE${C.reset} ${det.probabilityMAE.toFixed(2)}`
  );
  if (det.passed < det.total) failed = true;

  // ── 2. Property / invariant tests ───────────────────────────────────────────
  console.log(head("2. Property tests (invariants)"));
  const props = runPropertyTests();
  for (const p of props) {
    const mark = p.passed ? ok("PASS") : bad("FAIL");
    console.log(`  ${mark}  ${p.name}  ${C.dim}${p.detail}${C.reset}`);
    if (!p.passed) failed = true;
  }

  // ── 3. Regression vs baseline ──────────────────────────────────────────────
  console.log(head("3. Regression (exact-output drift)"));
  const current = snapshotAll();
  if (UPDATE) {
    writeBaseline(current);
    console.log(`  ${ok("baseline updated")} — ${Object.keys(current).length} cases pinned.`);
  } else {
    const reg = compareToBaseline(current);
    if (!reg.hasBaseline) {
      console.log(`  ${C.yellow}no baseline found — run \`npm run eval:update\` to create one.${C.reset}`);
    } else if (reg.diffs.length === 0 && reg.newCases.length === 0 && reg.missingCases.length === 0) {
      console.log(`  ${ok("no drift")} — all ${Object.keys(current).length} cases match baseline.`);
    } else {
      for (const d of reg.diffs) {
        console.log(
          `  ${bad("DRIFT")}  ${d.id}.${d.field}: ${C.dim}${JSON.stringify(d.baseline)} → ${JSON.stringify(d.current)}${C.reset}`
        );
      }
      for (const id of reg.newCases) console.log(`  ${C.yellow}NEW${C.reset}     ${id} (not in baseline)`);
      for (const id of reg.missingCases) console.log(`  ${bad("MISSING")} ${id} (in baseline, not produced)`);
      failed = true;
    }
  }

  // ── 4. LLM-as-judge (optional) ──────────────────────────────────────────────
  if (JUDGE) {
    console.log(head("4. LLM-as-judge (explanation quality)"));
    const j = await runJudge();
    if (j.skipped) {
      console.log(`  ${C.yellow}skipped${C.reset} — ${j.reason}`);
    } else {
      for (const v of j.verdicts) {
        const mark = v.verdict === "pass" ? ok("PASS") : bad("FAIL");
        console.log(`  ${mark}  ${v.id}  ${C.dim}score=${v.overallScore}/5${C.reset}`);
        for (const issue of v.issues) console.log(`         ${C.yellow}↳ ${issue}${C.reset}`);
      }
      console.log(
        `  ${C.bold}avg score${C.reset} ${j.averageScore.toFixed(2)}/5  ` +
          `${C.bold}pass-rate${C.reset} ${pct(j.passed / j.total)} (${j.passed}/${j.total})`
      );
      if (j.passed < j.total) failed = true;
    }
  }

  console.log(
    `\n${failed ? bad("✗ evaluation FAILED") : ok("✓ evaluation PASSED")}\n`
  );
  process.exit(failed ? 1 : 0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
