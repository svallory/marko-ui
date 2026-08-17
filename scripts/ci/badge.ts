/**
 * Turn CI result files into shields.io endpoint JSON badges.
 *
 * Usage: bun scripts/ci/badge.ts <kind> <input-file> <out-dir>
 *   kind = vitest | e2e | axe | lighthouse-a11y | lighthouse-site
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
}

const [kind, inputFile, outDir] = process.argv.slice(2);
if (!kind || !inputFile || !outDir) {
  console.error("usage: bun scripts/ci/badge.ts <vitest|e2e|axe|lighthouse> <input-file> <out-dir>");
  process.exit(1);
}

const input = JSON.parse(readFileSync(inputFile, "utf8"));
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
    // vitest --reporter=json (jest-compatible shape)
    const total: number = input.numTotalTests;
    const passed: number = input.numPassedTests;
    write("tests", {
      schemaVersion: 1,
      label: "behavior & hydration tests",
      message: `${passed}/${total} passing`,
      color: passFailColor(passed, total),
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
      label: "hydration invariance",
      message: `${hydrationPassed}/${hydrationResults.length} byte-identical`,
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
      label: "style-matrix checks",
      message: `${expected}/${total} passing`,
      color: passFailColor(expected, total),
    });
    break;
  }

  case "axe": {
    // scripts/ci/axe-scan.ts output
    const { components, violations, pagesScanned } = input;
    write("axe", {
      schemaVersion: 1,
      label: "axe violations",
      message:
        violations === 0
          ? `0 across ${components} components`
          : `${violations} across ${pagesScanned} pages`,
      color: violations === 0 ? "brightgreen" : "red",
    });
    break;
  }

  // treosh/lighthouse-ci-action manifest.json — one entry per run; use the
  // representative run per URL and report the MINIMUM across pages (the
  // honest number: every page scores at least this).
  //
  // Two flavors, matching the two audit targets:
  // - lighthouse-a11y: accessibility only, run against the bare component
  //   verify pages. NO performance badge from component pages — perf is a
  //   whole-page metric (payload, LCP, TBT of a real route); a bare fixture
  //   page would score ~100 and prove nothing.
  // - lighthouse-site: best-practices + seo from the real docs pages, where
  //   those categories actually mean something.
  case "lighthouse-a11y":
  case "lighthouse-site": {
    const runs = (input as { isRepresentativeRun?: boolean; summary: Record<string, number> }[])
      .filter((run) => run.isRepresentativeRun !== false);
    const categories: [string, string][] =
      kind === "lighthouse-a11y"
        ? [["accessibility", "lighthouse a11y (components)"]]
        : [
            ["best-practices", "lighthouse best practices"],
            ["seo", "lighthouse seo"],
          ];
    for (const [key, label] of categories) {
      const scores = runs.map((run) => Math.round((run.summary[key] ?? 0) * 100));
      const min = scores.length ? Math.min(...scores) : 0;
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
