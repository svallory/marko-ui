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
 *     no args = all components under packages/registry/default/ui/
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
import { join, dirname, basename, extname } from "node:path";
import { fileURLToPath } from "node:url";

const HERE = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = join(HERE, "..");
const SHADCN_ROOT = join(REPO_ROOT, "..", "..", "data", "shadcn-ui", "apps", "v4", "registry");
const BASES_UI_DIR = join(SHADCN_ROOT, "bases", "radix", "ui");
const SHADCN_STYLES_DIR = join(SHADCN_ROOT, "styles");
const OUR_UI_DIR = join(REPO_ROOT, "packages", "shadcn", "ui");
const OUR_STYLES_SRC = join(REPO_ROOT, "packages", "shadcn", "styles");

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

function walkFiles(dir: string, exts: string[]): string[] {
  const out: string[] = [];
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const p = join(dir, entry.name);
    if (entry.isDirectory()) out.push(...walkFiles(p, exts));
    else if (exts.includes(extname(entry.name))) out.push(p);
  }
  return out;
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
    const files = walkFiles(OUR_STYLES_SRC, [".css"]);
    if (files.length > 0) {
      const stems = new Set<string>();
      for (const f of files) {
        for (const s of extractSelectorStems(readFileSync(f, "utf8"), "mu")) stems.add(s);
      }
      if (stems.size > 0) return { stems, source: "styles-src (mu-)" };
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
  for (const f of walkFiles(dir, [".marko", ".ts"])) {
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

function main(): number {
  const argv = process.argv.slice(2);
  const json = argv.includes("--json");
  const selfCheck = argv.includes("--self-check");
  const requested = argv.filter((a) => !a.startsWith("--"));

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

process.exit(main());
