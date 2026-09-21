/**
 * Turn CI result files into shields.io endpoint JSON badges.
 *
 * Usage: bun scripts/ci/badge.ts <kind> <input-file> <out-dir>
 *   kind = vitest | axe | lighthouse-a11y | combine
 *   (for `combine`, <input-file> is the directory holding the count-carrying
 *   badge files listed in COMBINE_PARTS)
 *
 * Each badge file follows the shields endpoint schema
 * (https://shields.io/badges/endpoint-badge) and is published to the
 * `badges` branch by .github/workflows/ci.yml, then rendered via
 *   https://img.shields.io/endpoint?url=<raw.githubusercontent.com URL>
 */
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
// The suite owns both numbers and guards them with its own bookkeeping
// tests, so the badge derives coverage from the source of truth rather
// than restating figures that can drift.
import {
  INTERACTIVE_COMPONENTS,
  ZAG_BACKED_COMPONENT_COUNT,
} from "../../packages/shadcn/tests/hydration-coverage.ts";

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
    interface AssertionResult {
      status: string;
      /** vitest fills this with the enclosing describe titles, outermost first. */
      ancestorTitles?: string[];
    }
    const hydrationResults = hydrationFiles.flatMap(
      (file: { assertionResults?: AssertionResult[] }) => file.assertionResults ?? [],
    );
    // The per-component invariance assertions live in the C-4 describe of
    // hydration-invariant.test.ts; that file's other describe is bookkeeping
    // (list integrity vs. the filesystem). Only the C-4 assertions prove a
    // component was actually exercised, so they are the only ones eligible
    // for a coverage claim.
    const MAIN_SUITE_TITLE = "hydration invariant (C-4): SSR attributes survive hydration";
    const mainResults = hydrationResults.filter((r) =>
      (r.ancestorTitles ?? []).includes(MAIN_SUITE_TITLE),
    );
    const mainPassed = mainResults.filter((r) => r.status === "passed").length;
    const mainFailed = mainResults.length - mainPassed;
    // Both numbers are the suite's covered/total component counts, kept
    // honest by the bookkeeping tests in hydration-invariant.test.ts (a new
    // Zag-backed component in neither list, a stale name, or a drifted
    // literal fails the suite).
    //
    // Two numerator/denominator traps are guarded here:
    // - The denominator is the number of Zag-backed COMPONENTS, not the
    //   number of hydration tests that ran. It used to be
    //   `hydrationResults.length`, which can only ever equal the number that
    //   passed on a green run — so the badge published "33/33 identical" and
    //   was read (in the README, and in launch copy) as full coverage while
    //   21 of the 54 Zag-backed components had no hydration test at all. A
    //   badge whose denominator is "the tests I chose to write" cannot
    //   report a coverage gap by construction.
    // - The numerator is the number of distinct covered COMPONENTS, not the
    //   number of assertions. hydrationResults also carries the bookkeeping
    //   its (6 at last count), and the C-4 body can grow more assertions per
    //   component over time — counting assertions produced "59/54
    //   components" on a fully green run.
    //
    // The "components" claim additionally requires the C-4 suite to have
    // demonstrably run COMPLETE: exactly one passing assertion per covered
    // component. A partial run (bookkeeping only, or a -t filtered subset)
    // must not paint a coverage claim green, so it falls back to the
    // assertion-count form below, colored red like a failure.
    const fullRun =
      mainResults.length === INTERACTIVE_COMPONENTS.length && mainFailed === 0;
    const hydrationPassed = hydrationResults.filter(
      (r: AssertionResult) => r.status === "passed",
    ).length;
    const claimCoverage = fullRun;
    write("hydration", {
      schemaVersion: 1,
      label: "hydration",
      // A failure is the more urgent fact, so it wins the label; only a
      // demonstrably complete green run may claim coverage, which is the
      // number people actually want.
      message: !claimCoverage
        ? mainFailed > 0
          ? `${mainPassed}/${mainResults.length} identical`
          : `${hydrationPassed}/${hydrationResults.length} identical`
        : `${INTERACTIVE_COMPONENTS.length}/${ZAG_BACKED_COMPONENT_COUNT} components`,
      color: !claimCoverage
        ? "red"
        : INTERACTIVE_COMPONENTS.length >= ZAG_BACKED_COMPONENT_COUNT
          ? "brightgreen"
          : "yellow",
    });
    break;
  }

  case "combine": {
    // <input-file> is the DIRECTORY holding the count-carrying badge files
    // produced by the upstream jobs (the publish job's merged badge
    // artifacts). Produces the single "checks" badge the home page shows:
    // one number for the whole suite.
    //
    // COMBINE_PARTS is the full set of badges that may contribute a count.
    // Each entry is looked up optionally: a badge whose producing job no
    // longer exists is skipped rather than crashing the publish job. This
    // is deliberate — the `style-matrix` badge used to be listed here
    // unconditionally, and when CI's style-matrix job was removed
    // (2026-09-12) nothing produced style-matrix.json any more, so every
    // publish on main died with `ENOENT: ... 'badges/style-matrix.json'`
    // while all four substantive jobs were green. Removing a job must not
    // turn the badge publish red.
    //
    // The guard that keeps this honest is the empty check below: if NO part
    // is found, the inputs really are broken and we fail loudly instead of
    // publishing a silent "0/0 passing".
    const COMBINE_PARTS = ["tests"];
    const parts = COMBINE_PARTS.flatMap((name) => {
      const path = join(inputFile, `${name}.json`);
      if (!existsSync(path)) {
        console.log(`${name}.json absent — skipping (no producing job)`);
        return [];
      }
      const badge = JSON.parse(readFileSync(path, "utf8")) as Badge;
      if (badge.passed === undefined || badge.total === undefined) {
        console.error(`${name}.json carries no passed/total counts — regenerate it first`);
        process.exit(1);
      }
      return [badge];
    });
    if (parts.length === 0) {
      console.error(
        `no count-carrying badges found in ${inputFile} (looked for: ${COMBINE_PARTS.join(", ")}) — ` +
          `the upstream jobs produced no artifacts, refusing to publish an empty checks badge`,
      );
      process.exit(1);
    }
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
  // lighthouse-a11y: accessibility only, run against the docs component
  // reference pages. NO performance/best-practices/seo badges — perf is a
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
