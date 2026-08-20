/**
 * Turn CI result files into shields.io endpoint JSON badges.
 *
 * Usage: bun scripts/ci/badge.ts <kind> <input-file> <out-dir>
 *   kind = vitest | e2e | axe | lighthouse-a11y | combine
 *   (for `combine`, <input-file> is the directory holding tests.json and
 *   style-matrix.json)
 *
 * Each badge file follows the shields endpoint schema
 * (https://shields.io/badges/endpoint-badge) and is published to the
 * `badges` branch by .github/workflows/ci.yml, then rendered via
 *   https://img.shields.io/endpoint?url=<raw.githubusercontent.com URL>
 */
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

interface Badge {
  schemaVersion: 1;
  label: string;
  message: string;
  color: string;
  /**
   * Raw counts, ignored by shields but read back by the `combine` kind (the
   * publish job merges tests + style-matrix into one `checks` badge).
   */
  passed?: number;
  total?: number;
}

const [kind, inputFile, outDir] = process.argv.slice(2);
if (!kind || !inputFile || !outDir) {
  console.error("usage: bun scripts/ci/badge.ts <vitest|e2e|axe|lighthouse> <input-file> <out-dir>");
  process.exit(1);
}

// `combine` receives a directory and reads its files itself.
const input = kind === "combine" ? undefined : JSON.parse(readFileSync(inputFile, "utf8"));
mkdirSync(outDir, { recursive: true });

function write(name: string, badge: Badge): void {
  writeFileSync(join(outDir, `${name}.json`), JSON.stringify(badge) + "\n");
  console.log(`${name}.json → ${badge.label}: ${badge.message}`);
}

function passFailColor(passed: number, total: number): string {
  return passed === total && total > 0 ? "brightgreen" : "red";
}

switch (kind) {
  case "vitest": {
    // vitest --reporter=json (jest-compatible shape).
    // Skipped tests are deliberate, environment-gated exclusions (e.g.
    // test.skipIf guards on suites needing the sibling shadcn clone,
    // absent on CI runners) — they are not failures, so the badge
    // denominator is runnable tests only. Failures still paint red
    // because passed < runnable whenever anything actually fails.
    const total: number = input.numTotalTests;
    const passed: number = input.numPassedTests;
    const skipped: number =
      (input.numPendingTests ?? 0) + (input.numTodoTests ?? 0);
    const runnable = total - skipped;
    write("tests", {
      schemaVersion: 1,
      label: "tests",
      message: `${passed}/${runnable} passing`,
      color: passFailColor(passed, runnable),
      passed,
      total: runnable,
    });

    const hydrationFiles = (input.testResults ?? []).filter((file: { name?: string }) =>
      (file.name ?? "").includes("hydration-invariant"),
    );
    const hydrationResults = hydrationFiles.flatMap(
      (file: { assertionResults?: { status: string }[] }) => file.assertionResults ?? [],
    );
    const hydrationPassed = hydrationResults.filter(
      (r: { status: string }) => r.status === "passed",
    ).length;
    write("hydration", {
      schemaVersion: 1,
      label: "hydration",
      message: `${hydrationPassed}/${hydrationResults.length} identical`,
      color: passFailColor(hydrationPassed, hydrationResults.length),
    });
    break;
  }

  case "e2e": {
    // @playwright/test json reporter
    const { expected = 0, unexpected = 0, flaky = 0 } = input.stats ?? {};
    const total = expected + unexpected + flaky;
    write("style-matrix", {
      schemaVersion: 1,
      label: "style matrix",
      message: `${expected}/${total} passing`,
      color: passFailColor(expected, total),
      passed: expected,
      total,
    });
    break;
  }

  case "combine": {
    // <input-file> is the DIRECTORY holding tests.json + style-matrix.json
    // (the publish job's merged badge artifacts). Produces the single
    // "checks" badge the home page shows: one number for the whole suite.
    const parts = ["tests", "style-matrix"].map((name) => {
      const badge = JSON.parse(readFileSync(join(inputFile, `${name}.json`), "utf8")) as Badge;
      if (badge.passed === undefined || badge.total === undefined) {
        console.error(`${name}.json carries no passed/total counts — regenerate it first`);
        process.exit(1);
      }
      return badge;
    });
    const passed = parts.reduce((sum, badge) => sum + (badge.passed ?? 0), 0);
    const total = parts.reduce((sum, badge) => sum + (badge.total ?? 0), 0);
    // Two renderings of the same number: checks.json for the README
    // ("631/631 passing" — pass/total reads right in a checklist of badges),
    // checks-count.json for the home page (just "631" — it sits next to
    // equally terse receipts).
    write("checks", {
      schemaVersion: 1,
      label: "tests",
      message: `${passed}/${total} passing`,
      color: passFailColor(passed, total),
      passed,
      total,
    });
    write("checks-count", {
      schemaVersion: 1,
      label: "tests",
      message: String(passed === total ? total : `${passed}/${total}`),
      color: passFailColor(passed, total),
    });
    break;
  }

  case "axe": {
    // scripts/ci/axe-scan.ts output. Branded "WCAG" rather than "axe": axe
    // runs the WCAG 2.x A/AA rulesets and WCAG is the name people recognize —
    // "(automated)" keeps it honest, since no automated scan proves full
    // conformance and official WCAG certification does not exist.
    const { violations } = input;
    write("axe", {
      schemaVersion: 1,
      label: "WCAG 2.2 AA",
      // Scope (every component demo page) lives in the scan script and docs,
      // not the badge — labels stay short.
      message: violations === 0 ? "0 violations" : `${violations} violations`,
      color: violations === 0 ? "brightgreen" : "red",
    });
    break;
  }

  // treosh/lighthouse-ci-action manifest.json — one entry per run; use the
  // representative run per URL and report the MINIMUM across pages (the
  // honest number: every page scores at least this).
  //
  // lighthouse-a11y: accessibility only, run against the bare component
  // verify pages. NO performance/best-practices/seo badges — perf is a
  // whole-page metric (payload, LCP, TBT of a real route; a bare fixture
  // would score ~100 and prove nothing) and the others describe the docs
  // site, which library users don't care about.
  case "lighthouse-a11y": {
    const runs = (input as { isRepresentativeRun?: boolean; summary: Record<string, number> }[])
      .filter((run) => run.isRepresentativeRun !== false);
    const categories: [string, string][] = [["accessibility", "lighthouse a11y"]];
    for (const [key, label] of categories) {
      // A manifest without this category means the wrong manifest was fed in
      // (e.g. a later collect clobbered .lighthouseci) — fail loudly rather
      // than publish a silent 0.
      if (runs.length === 0 || runs.some((run) => run.summary[key] === undefined)) {
        console.error(`category "${key}" missing from manifest — wrong input file?`);
        process.exit(1);
      }
      const scores = runs.map((run) => Math.round(run.summary[key] * 100));
      const min = Math.min(...scores);
      write(`lighthouse-${key}`, {
        schemaVersion: 1,
        label,
        message: String(min),
        color: min >= 90 ? "brightgreen" : min >= 50 ? "yellow" : "red",
      });
    }
    break;
  }

  default:
    console.error(`unknown badge kind: ${kind}`);
    process.exit(1);
}
