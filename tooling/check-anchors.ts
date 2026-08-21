/**
 * check-anchors.ts — mechanical verifier for the style-refactor anchor hooks.
 *
 * shadcn's reworked bases carry hook classes (`cn-button`,
 * `cn-button-variant-outline`, ...) that the per-style CSS files target.
 * Our Marko components must carry the equivalent anchors with the `mu-`
 * prefix (`cn-<stem>` upstream == `mu-<stem>` here). This script diffs the
 * two sides per component:
 *
 *   MISSING        anchor in the shadcn bases source but not in ours (fails)
 *   EXTRA          anchor in ours but not in the bases source (fails)
 *   CSS-UNANCHORED targeted by style CSS but absent from bases source
 *                  (upstream oddity, informational only)
 *   NO-UPSTREAM    our component has no bases counterpart (informational)
 *
 * Usage:
 *   bun tooling/check-anchors.ts [component ...]
 *     no args = all components under packages/shadcn/ui/
 *   --json        machine-readable output
 *   --self-check  treat the shadcn bases themselves as "our" source
 *                 (prefix cn-); every ported component must report zero
 *                 MISSING/EXTRA — verifies the extractor, not the port.
 *
 * Exit 1 if any checked component has MISSING or EXTRA anchors, else 0.
 * Extraction is regex-over-text on purpose: the tokens are flat literals
 * inside class strings, cva() calls, and template literals; no AST needed.
 */

import { readdirSync, readFileSync, existsSync, statSync } from "node:fs";
import { join, basename } from "node:path";

import { REPO_ROOT, runCheck, walkAbsolute } from "./fs-utils";
import { ensureShadcnClone } from "./upstream-shadcn";

const OUR_UI_DIR = join(REPO_ROOT, "packages", "shadcn", "ui");
const OUR_STYLES_SRC = join(REPO_ROOT, "packages", "shadcn", "styles");

// Resolved by requireShadcnClone() before anything below reads them.
let SHADCN_ROOT = "";
let BASES_UI_DIR = "";
let SHADCN_STYLES_DIR = "";

// ---------------------------------------------------------------------------
// Token extraction

/**
 * Extract whole `<prefix><stem>` tokens from text and return the stems.
 * Whole-token: the char before must not be part of a larger identifier
 * (so `scn-x` or `mu-mu-x` never half-match) and the match itself is
 * greedy through `[a-z0-9-]` but must end on `[a-z0-9]` (no trailing dash).
 */
function extractStems(text: string, prefix: "cn" | "mu"): Set<string> {
  const re = new RegExp(
    `(?<![A-Za-z0-9_-])${prefix}-([a-z0-9]+(?:-[a-z0-9]+)*)`,
    "g",
  );
  const stems = new Set<string>();
  for (const m of text.matchAll(re)) stems.add(m[1]!);
  return stems;
}

/** Same, but only class selectors: `.cn-foo` / `.mu-foo`. */
function extractSelectorStems(css: string, prefix: "cn" | "mu"): Set<string> {
  const re = new RegExp(`\\.${prefix}-([a-z0-9]+(?:-[a-z0-9]+)*)`, "g");
  const stems = new Set<string>();
  for (const m of css.matchAll(re)) stems.add(m[1]!);
  return stems;
}

// ---------------------------------------------------------------------------
// External dependency guard
//
// The canonical anchor list is read from a shadcn/ui clone resolved by
// tooling/upstream-shadcn.ts: an explicit SHADCN_UI_DIR, else the
// maintainer's sibling "hyperspace" clone, else a repo-local clone that gets
// auto-cloned into .upstream/shadcn-ui when none of those exist yet.
//
// A clone attempt that itself fails (offline machine, no network) still
// FAILS HARD rather than skipping. A skipped check is worse than a crashed
// one for a gate wired into `bun run check` (package.json's check:tooling):
// MISSING/EXTRA anchor drift is exactly the class of bug this gate exists to
// catch, so a silent green on a machine that couldn't clone would let that
// drift land unnoticed. Failing loud with an actionable message costs one
// clone; failing silent costs a broken registry.

/**
 * Resolves (cloning if necessary) the shadcn clone and points SHADCN_ROOT /
 * BASES_UI_DIR / SHADCN_STYLES_DIR at it. Exits the process with an
 * actionable message if cloning fails (or exits 0 with a warning if
 * MARKO_UI_SKIP_ANCHOR_CHECK is set).
 */
async function requireShadcnClone(): Promise<void> {
  let clone: string;
  try {
    clone = await ensureShadcnClone();
  } catch (error) {
    if (process.env.MARKO_UI_SKIP_ANCHOR_CHECK) {
      console.warn(
        `check-anchors: SKIPPED — could not obtain the shadcn/ui clone (${
          (error as Error).message
        }) and MARKO_UI_SKIP_ANCHOR_CHECK is set. Anchor drift is NOT being verified.`,
      );
      process.exit(0);
    }
    console.error(
      [
        "check-anchors: could not obtain the shadcn/ui source clone.",
        "",
        (error as Error).message,
        "",
        "This check diffs our mu-* anchors against shadcn's cn-* anchors, so it",
        "cannot run without that source. It auto-clones into .upstream/shadcn-ui;",
        "the failure above is most likely a network problem. You can also point",
        "SHADCN_UI_DIR at an existing checkout.",
        "",
        "Set MARKO_UI_SKIP_ANCHOR_CHECK=1 to skip this gate deliberately (it will",
        "exit 0 with a warning; do NOT set it in CI).",
      ].join("\n"),
    );
    process.exit(2);
  }

  SHADCN_ROOT = join(clone, "apps", "v4", "registry");
  BASES_UI_DIR = join(SHADCN_ROOT, "bases", "radix", "ui");
  SHADCN_STYLES_DIR = join(SHADCN_ROOT, "styles");

  const missing = [BASES_UI_DIR, SHADCN_STYLES_DIR].filter(
    (dir) => !existsSync(dir) || !statSync(dir).isDirectory(),
  );
  if (missing.length === 0) return;

  console.error(
    [
      "check-anchors: the shadcn/ui clone is missing expected directories.",
      "",
      `  registry root: ${SHADCN_ROOT}`,
      ...missing.map((dir) => `  missing directory: ${dir}`),
      "",
      "The clone itself succeeded but doesn't look like shadcn/ui's registry —",
      "has the upstream layout changed?",
    ].join("\n"),
  );
  process.exit(2);
}

// ---------------------------------------------------------------------------
// Step 1 — canonical anchor list from shadcn bases source

/** component name -> stems found in its bases/radix/ui/<name>.tsx */
function loadBasesAnchors(): Map<string, Set<string>> {
  const map = new Map<string, Set<string>>();
  for (const file of readdirSync(BASES_UI_DIR)) {
    if (!file.endsWith(".tsx")) continue;
    const component = basename(file, ".tsx");
    const text = readFileSync(join(BASES_UI_DIR, file), "utf8");
    map.set(component, extractStems(text, "cn"));
  }
  return map;
}

// ---------------------------------------------------------------------------
// Step 2 — CSS-side list, grouped by longest-prefix component match

interface CssSide {
  byComponent: Map<string, Set<string>>;
  /** stems that matched no known component name */
  unmatched: Set<string>;
  source: string;
}

function loadCssStems(): { stems: Set<string>; source: string } {
  if (existsSync(OUR_STYLES_SRC) && statSync(OUR_STYLES_SRC).isDirectory()) {
    const files = walkAbsolute(OUR_STYLES_SRC, [".css"]);
    if (files.length > 0) {
      const stems = new Set<string>();
      for (const f of files) {
        for (const s of extractSelectorStems(readFileSync(f, "utf8"), "mu")) stems.add(s);
      }
      if (stems.size > 0) return { stems, source: "styles/ (mu-)" };
    }
  }
  const stems = new Set<string>();
  for (const file of readdirSync(SHADCN_STYLES_DIR)) {
    if (!file.endsWith(".css")) continue;
    const css = readFileSync(join(SHADCN_STYLES_DIR, file), "utf8");
    for (const s of extractSelectorStems(css, "cn")) stems.add(s);
  }
  return { stems, source: "shadcn styles (cn-)" };
}

/**
 * Group CSS stems by component via longest-prefix match: candidate component
 * names sorted by length descending, so `button-group-item` groups under
 * `button-group`, not `button`. A stem belongs to a component when it equals
 * the name or starts with `<name>-`.
 */
function groupCssStems(stems: Set<string>, componentNames: string[]): CssSide {
  const sorted = [...componentNames].sort((a, b) => b.length - a.length);
  const byComponent = new Map<string, Set<string>>();
  const unmatched = new Set<string>();
  for (const stem of stems) {
    const owner = sorted.find((name) => stem === name || stem.startsWith(name + "-"));
    if (!owner) {
      unmatched.add(stem);
      continue;
    }
    let set = byComponent.get(owner);
    if (!set) byComponent.set(owner, (set = new Set()));
    set.add(stem);
  }
  return { byComponent, unmatched, source: "" };
}

// ---------------------------------------------------------------------------
// Step 3 — our-side extraction

function loadOurStems(component: string, selfCheck: boolean): Set<string> | null {
  if (selfCheck) {
    const file = join(BASES_UI_DIR, `${component}.tsx`);
    if (!existsSync(file)) return null;
    return extractStems(readFileSync(file, "utf8"), "cn");
  }
  const dir = join(OUR_UI_DIR, component);
  if (!existsSync(dir)) return null;
  const stems = new Set<string>();
  for (const f of walkAbsolute(dir, [".marko", ".ts"])) {
    for (const s of extractStems(readFileSync(f, "utf8"), "mu")) stems.add(s);
  }
  return stems;
}

// ---------------------------------------------------------------------------
// Report

interface ComponentReport {
  component: string;
  status: "ok" | "fail" | "no-upstream";
  missing: string[];
  extra: string[];
  cssUnanchored: string[];
}

function sortedDiff(a: Set<string>, b: Set<string>): string[] {
  return [...a].filter((x) => !b.has(x)).sort();
}

async function main(): Promise<number> {
  const argv = process.argv.slice(2);
  const json = argv.includes("--json");
  const selfCheck = argv.includes("--self-check");
  const requested = argv.filter((a) => !a.startsWith("--"));

  await requireShadcnClone();

  const basesAnchors = loadBasesAnchors();
  const componentNames = [...basesAnchors.keys()];
  const css = loadCssStems();
  const grouped = groupCssStems(css.stems, componentNames);

  // Which components to check: explicit args, else every dir on "our" side.
  let components: string[];
  if (requested.length > 0) {
    components = requested;
  } else if (selfCheck) {
    components = componentNames;
  } else {
    components = readdirSync(OUR_UI_DIR, { withFileTypes: true })
      .filter((e) => e.isDirectory())
      .map((e) => e.name);
  }
  components.sort();

  const reports: ComponentReport[] = [];
  const errors: string[] = [];

  for (const component of components) {
    const ours = loadOurStems(component, selfCheck);
    if (ours === null) {
      errors.push(`${component}: no source found on our side`);
      continue;
    }
    const upstream = basesAnchors.get(component);
    if (!upstream) {
      reports.push({
        component,
        status: "no-upstream",
        missing: [],
        extra: [],
        cssUnanchored: [],
      });
      continue;
    }
    const cssForComponent = grouped.byComponent.get(component) ?? new Set<string>();
    const missing = sortedDiff(upstream, ours);
    const extra = sortedDiff(ours, upstream);
    const cssUnanchored = sortedDiff(cssForComponent, upstream);
    reports.push({
      component,
      status: missing.length || extra.length ? "fail" : "ok",
      missing,
      extra,
      cssUnanchored,
    });
  }

  const failed = reports.filter((r) => r.status === "fail");

  if (json) {
    console.log(
      JSON.stringify(
        {
          selfCheck,
          cssSource: css.source,
          reports,
          cssUnmatchedStems: [...grouped.unmatched].sort(),
          errors,
          ok: failed.length === 0 && errors.length === 0,
        },
        null,
        2,
      ),
    );
    return failed.length || errors.length ? 1 : 0;
  }

  for (const r of reports) {
    if (r.status === "no-upstream") {
      console.log(`NO-UPSTREAM  ${r.component} (informational)`);
      continue;
    }
    if (r.status === "ok") {
      const note = r.cssUnanchored.length
        ? `  [css-unanchored: ${r.cssUnanchored.length}]`
        : "";
      console.log(`OK           ${r.component}${note}`);
    } else {
      console.log(
        `FAIL         ${r.component}  missing:${r.missing.length} extra:${r.extra.length}`,
      );
      for (const m of r.missing) console.log(`  MISSING        ${m}`);
      for (const e of r.extra) console.log(`  EXTRA          ${e}`);
    }
    for (const c of r.cssUnanchored) console.log(`  CSS-UNANCHORED ${c} (informational)`);
  }
  if (grouped.unmatched.size > 0) {
    console.log(
      `\nCSS stems matching no bases component (informational): ${[...grouped.unmatched].sort().join(", ")}`,
    );
  }
  for (const e of errors) console.log(`ERROR        ${e}`);
  console.log(
    `\n${reports.length} component(s) checked (css side: ${css.source}); ` +
      `${failed.length} failing, ${reports.filter((r) => r.status === "no-upstream").length} without upstream.`,
  );
  return failed.length || errors.length ? 1 : 0;
}

runCheck("check-anchors", main);
