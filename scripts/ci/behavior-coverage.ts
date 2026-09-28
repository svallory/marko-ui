/**
 * Static behavior-coverage report (issue #72 spike).
 *
 * For each component with a behaviors.ts list, computes:
 *   coverage = behaviors with >=1 proving check / total listed behaviors
 * from `apps/docs/src/demos/<component>/behaviors.ts` (the behavior list)
 * and `packages/shadcn/tests/behavior-coverage/<component>.ts` (the
 * suite->behavior mapping) — WITHOUT running any suite.
 *
 * "Without running the suite" means real, not aspirational: vitest-sourced
 * proving checks are cross-referenced against `vitest list --json` (which
 * discovers and lists tests without executing them — no browser, no dev
 * server needed) so a mapping entry that points at a renamed or deleted
 * `it()` fails loudly instead of silently overcounting. axe-scan/
 * visual-guard checks are cross-referenced against static component lists
 * (DOCUMENTED_COMPONENTS, OPEN_STATES/NO_OPEN_STATE) for the same reason —
 * there is no equivalent "list without running" for a Playwright spec, so
 * those sources are trusted to run for every component they claim to cover.
 *
 * Usage: bun scripts/ci/behavior-coverage.ts [component...]
 *   No args: every component with a behaviors.ts file.
 *   Exits non-zero on: an unknown behaviorId in a mapping, a duplicate
 *   behaviorId within one behaviors.ts, or a vitest proving check whose
 *   title no longer exists.
 */
import { readdirSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { execFileSync } from "node:child_process";
import type { ComponentBehavior } from "../../apps/docs/src/demos/behavior-types.ts";
import type { BehaviorCoverageEntry, ProvingCheck } from "../../packages/shadcn/tests/behavior-coverage/mapping-types.ts";
import { DOCUMENTED_COMPONENTS } from "../../apps/docs/src/demos/demos-manifest.ts";
import { OPEN_STATES, NO_OPEN_STATE } from "./axe-open-states.ts";

const REPO_ROOT = dirname(dirname(dirname(fileURLToPath(import.meta.url))));
const DEFAULT_DEMOS_DIR = join(REPO_ROOT, "apps/docs/src/demos");
const DEFAULT_MAPPING_DIR = join(REPO_ROOT, "packages/shadcn/tests/behavior-coverage");

/**
 * The two roots this script reads component data from. Defaults to the
 * real tracked source trees; a test harness overrides both to point at a
 * throwaway directory instead — no test may write fixtures into
 * apps/docs/src/demos or packages/shadcn/tests/behavior-coverage, since a
 * crashed run would leave a bogus component that build-demos-manifest.ts
 * and this script would then pick up in real invocations.
 */
interface ComponentRoots {
  demosDir: string;
  mappingDir: string;
}

const DEFAULT_ROOTS: ComponentRoots = { demosDir: DEFAULT_DEMOS_DIR, mappingDir: DEFAULT_MAPPING_DIR };

function findComponentsWithBehaviors(roots: ComponentRoots = DEFAULT_ROOTS): string[] {
  return readdirSync(roots.demosDir, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name)
    .filter((name) => existsSync(join(roots.demosDir, name, "behaviors.ts")))
    .sort();
}

/**
 * `vitest list --json` discovers tests statically — no execution, no
 * browser, no dev server — so this is safe to shell out to even though the
 * proving checks themselves are Playwright tests requiring a live server.
 * Cached per file since several behaviors in one component can cite the
 * same suite.
 */
const vitestListCache = new Map<string, Set<string>>();
function vitestTestTitles(file: string): Set<string> {
  const absPath = join(REPO_ROOT, file);
  const cached = vitestListCache.get(absPath);
  if (cached) return cached;
  if (!existsSync(absPath)) {
    vitestListCache.set(absPath, new Set());
    return new Set();
  }
  let raw: string;
  try {
    raw = execFileSync("bunx", ["vitest", "list", absPath, "--json"], {
      cwd: REPO_ROOT,
      encoding: "utf8",
      stdio: ["ignore", "pipe", "pipe"],
    });
  } catch (err) {
    console.error(`behavior-coverage: \`vitest list\` failed for ${file}`);
    throw err;
  }
  const entries: { name: string; file: string }[] = JSON.parse(raw);
  const titles = new Set(entries.map((e) => e.name));
  vitestListCache.set(absPath, titles);
  return titles;
}

function checkExists(check: ProvingCheck): true | string {
  switch (check.source) {
    case "vitest":
    case "hydration-invariant": {
      const titles = vitestTestTitles(check.file);
      const joined = check.title.join(" > ");
      return titles.has(joined) ? true : `no test titled "${joined}" found in ${check.file}`;
    }
    case "axe-scan": {
      const component = check.title[0];
      if (component === undefined || !DOCUMENTED_COMPONENTS.includes(component)) {
        return `"${component}" is not in DOCUMENTED_COMPONENTS (scripts/ci/axe-scan.ts scope)`;
      }
      if (!OPEN_STATES[component] && !NO_OPEN_STATE[component]) {
        return `"${component}" is missing from axe-open-states.ts (axe-scan.ts would fail its own completeness check)`;
      }
      return true;
    }
    case "visual-guard": {
      // e2e specs are not statically listable the way vitest files are
      // (Playwright's own --list needs a running config, and this repo's
      // visual specs assume the visual project) — trust the file exists.
      const specPath = join(REPO_ROOT, check.file);
      return existsSync(specPath) ? true : `spec file ${check.file} does not exist`;
    }
  }
}

interface ComponentReport {
  component: string;
  total: number;
  covered: number;
  uncovered: string[];
  errors: string[];
}

/**
 * ESM caches a dynamic import() by URL, so re-importing the same path after
 * rewriting its file on disk (the unit-test fixtures do exactly this)
 * returns the stale first version. A cache-busting query param forces a
 * fresh module instance; production use imports each component exactly
 * once per process, so this is free there.
 */
let importNonce = 0;
async function freshImport(path: string): Promise<unknown> {
  return import(`${path}?t=${Date.now()}-${importNonce++}`);
}

async function loadComponent(component: string, roots: ComponentRoots = DEFAULT_ROOTS): Promise<ComponentReport> {
  const errors: string[] = [];

  const behaviorsModule = (await freshImport(join(roots.demosDir, component, "behaviors.ts"))) as {
    behaviors: ComponentBehavior[];
  };
  const behaviors = behaviorsModule.behaviors;

  // Duplicate id check.
  const seen = new Map<string, number>();
  for (const b of behaviors) {
    seen.set(b.id, (seen.get(b.id) ?? 0) + 1);
  }
  for (const [id, count] of seen) {
    if (count > 1) errors.push(`duplicate behavior id "${id}" (${count}x) in ${component}/behaviors.ts`);
  }
  for (const b of behaviors) {
    if (!b.id.startsWith(`${component}/`)) {
      errors.push(`behavior id "${b.id}" in ${component}/behaviors.ts does not start with "${component}/"`);
    }
  }

  const behaviorIds = new Set(behaviors.map((b) => b.id));
  const mappingPath = join(roots.mappingDir, `${component}.ts`);
  const coverage: BehaviorCoverageEntry[] = existsSync(mappingPath)
    ? ((await freshImport(mappingPath)) as { coverage: BehaviorCoverageEntry[] }).coverage
    : [];

  const provenIds = new Set<string>();
  for (const entry of coverage) {
    if (!behaviorIds.has(entry.behaviorId)) {
      errors.push(
        `mapping references unknown behavior id "${entry.behaviorId}" — not declared in ${component}/behaviors.ts`,
      );
      continue;
    }
    if (entry.provenBy.length === 0) {
      errors.push(`mapping entry for "${entry.behaviorId}" has an empty provenBy array`);
      continue;
    }
    let anyValid = false;
    for (const check of entry.provenBy) {
      const result = checkExists(check);
      if (result === true) {
        anyValid = true;
      } else {
        errors.push(`"${entry.behaviorId}": ${result}`);
      }
    }
    if (anyValid) provenIds.add(entry.behaviorId);
  }

  // Duplicate mapping entries for the same behavior id.
  const mappingSeen = new Map<string, number>();
  for (const entry of coverage) {
    mappingSeen.set(entry.behaviorId, (mappingSeen.get(entry.behaviorId) ?? 0) + 1);
  }
  for (const [id, count] of mappingSeen) {
    if (count > 1) errors.push(`duplicate mapping entry for behavior id "${id}" (${count}x) in ${component}.ts`);
  }

  const uncovered = behaviors.filter((b) => !provenIds.has(b.id)).map((b) => b.id);

  return {
    component,
    total: behaviors.length,
    covered: provenIds.size,
    uncovered,
    errors,
  };
}

function pct(covered: number, total: number): string {
  if (total === 0) return "n/a";
  return `${Math.round((covered / total) * 100)}%`;
}

async function main() {
  const argComponents = process.argv.slice(2);
  const components = argComponents.length > 0 ? argComponents : findComponentsWithBehaviors();

  if (components.length === 0) {
    console.error("behavior-coverage: no components with a behaviors.ts file found");
    process.exit(1);
  }

  const reports: ComponentReport[] = [];
  let hadError = false;

  for (const component of components) {
    const behaviorsPath = join(DEFAULT_ROOTS.demosDir, component, "behaviors.ts");
    if (!existsSync(behaviorsPath)) {
      console.error(`behavior-coverage: no behaviors.ts for "${component}" (${behaviorsPath})`);
      hadError = true;
      continue;
    }
    const report = await loadComponent(component);
    reports.push(report);
    if (report.errors.length > 0) hadError = true;
  }

  const nameWidth = Math.max(9, ...reports.map((r) => r.component.length));
  console.log(`${"component".padEnd(nameWidth)}  covered  total  coverage`);
  console.log("-".repeat(nameWidth + 26));
  let totalCovered = 0;
  let totalBehaviors = 0;
  for (const r of reports) {
    console.log(
      `${r.component.padEnd(nameWidth)}  ${String(r.covered).padStart(7)}  ${String(r.total).padStart(5)}  ${pct(r.covered, r.total).padStart(8)}`,
    );
    totalCovered += r.covered;
    totalBehaviors += r.total;
  }
  console.log("-".repeat(nameWidth + 26));
  console.log(
    `${"TOTAL".padEnd(nameWidth)}  ${String(totalCovered).padStart(7)}  ${String(totalBehaviors).padStart(5)}  ${pct(totalCovered, totalBehaviors).padStart(8)}`,
  );

  for (const r of reports) {
    if (r.errors.length > 0) {
      console.error(`\n${r.component}: ${r.errors.length} error(s)`);
      for (const e of r.errors) console.error(`  - ${e}`);
    }
  }

  if (hadError) {
    console.error("\nbehavior-coverage: FAILED (see errors above)");
    process.exit(1);
  }
}

// Only run when invoked directly (not when imported by the test file).
if (import.meta.url === `file://${process.argv[1]}`) {
  await main();
}

export { loadComponent, findComponentsWithBehaviors, checkExists };
export type { ComponentRoots };
