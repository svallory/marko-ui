# parity-report/report.json — schema

`bun tooling/check-parity.ts` writes `parity-report/report.json` (plus the
human-facing `parity-report/index.html`, and PNGs under
`parity-report/images/`). This file documents the JSON shape for anyone
consuming it programmatically — a CI step gating on drift, a script
generating a dashboard, another agent auditing coverage — without needing
to read `coverage.ts`/`visual.ts`/`check-parity.ts` source.

## Exit-code contract

`bun tooling/check-parity.ts` (and `bun run check:parity`) exits:

- **0** — green, no drift found.
- **3** — drift found. At least one component has `status: "drift"` in
  `summary` (see below). This matches the repo's `doctor`/`validate`
  convention (`marko-ui doctor --json` also uses exit 3 for "something is
  broken"). The report is still written on exit 3 — 3 means "read the
  report," not "the run failed."
- **2** — the run itself crashed (thrown exception, missing upstream
  clone, Playwright not resolvable, etc) — a tooling failure, not a drift
  finding. Handled uniformly by `fs-utils.ts`'s `runCheck`.

## Top-level shape

```ts
interface Report {
  summary: ComponentSummary[] // STABLE — read this for programmatic consumption
  coverage: CoverageReport    // detector internals — see coverage.ts, not contractually stable
  visual: VisualReport | null // detector internals — see visual.ts, not contractually stable; null when run with --static-only
}
```

Only `summary` is a documented, stable contract. `coverage` and `visual`
are the two detectors' full internal result objects, included for the
HTML report's coverage table and image gallery and for debugging — their
shape may grow fields over time as the detectors evolve. Don't build
external tooling against `coverage`/`visual` directly; use `summary`.

## `summary[i]` — `ComponentSummary`

One entry per component present on both sides (i.e. every component
`coverage.ts` actually analyzed — see `listOurComponents`/
`listUpstreamComponents` in `coverage.ts` for what "both sides" means).

```ts
interface ComponentSummary {
  component: string          // e.g. "drawer" — matches the directory name under packages/shadcn/ui/
  status: "green" | "drift"  // "drift" if ANY of the fields below indicate a real (non-ignored) difference
  pairedDemos: string[]      // demo names present (name-normalized-matched) on BOTH sides — these are what visual.ts actually screenshots
  missingDemos: string[]     // upstream demo names with no matching ours-side demo (excluding ignored entries)
  extraDemos: string[]       // ours-side demo names with no matching upstream demo (excluding ignored entries)
  missingSections: string[]  // upstream doc headings (## / ###) with no matching ours-side section (excluding ignored entries)
  maxDiffPct: number | null  // highest visual mismatch % (0-100) across this component's paired demos; null if visual detector didn't run or found nothing to compare
  ignored: string[]          // names from parity-ignore.json that apply to this component (component-scoped entries + "*" wildcard entries), regardless of kind
}
```

Field notes:

- **`pairedDemos`** is not "all demos" from either side — it's the
  intersection, name-normalized (`coverage.ts`'s `normalizeName`: case,
  kebab/whitespace, and punctuation insensitive). This is exactly the set
  `visual.ts` iterates when computing `maxDiffPct`.
- **`missingSections`** only — `extraSections` (ours-only doc sections)
  and `missingApiProps`/`extraApiProps` are intentionally left out of the
  stable summary (they're present in the full `coverage` object for the
  HTML report) because they're noisier and less actionable for an
  automated gate; `missingSections` was judged the highest-signal single
  field for "did we drop real upstream documentation." If you need the
  others programmatically, read `coverage.components[i]` directly (not
  guaranteed stable, but available today).
- **`maxDiffPct`** is `null`, not `0`, when there's no visual data for
  this component (either `--static-only` was passed, or none of this
  component's demos paired/screenshotted successfully — check `visual`
  for per-demo `error` fields in that case). Don't treat `null` as "no
  drift" — it means "unknown," not "zero."
- **`ignored`** is deliberately kind-agnostic (mixes ignored sections,
  demos, and API props into one flat list) — the point is "a human already
  reviewed this many differences and accepted them," not a breakdown by
  kind. See `parity-ignore.json` for the source of truth and
  `coverage.ts`'s `ParityIgnoreEntry` for the full per-entry shape (kind +
  reason), if you need that detail.
- **`status`** is `"drift"` if the component has any non-empty
  `missingDemos`/`extraDemos`/`missingSections`, OR any of `coverage`'s
  fuller `missingApiProps`/`extraApiProps`/`extraSections` (not
  summarized above but still checked), OR any paired demo's visual
  mismatch exceeds `visual.threshold` (default 15%, see `VisualReport`
  below). In other words: `status` reflects the FULL underlying
  `coverage`/`visual` data, even though the `summary` row itself only
  surfaces a subset of fields — don't reverse-engineer `status` from the
  fields shown in the same row without also checking `coverage`/`visual`
  if you need to know exactly why a component drifted.

## Detector internals (for the HTML report / debugging, not a stable contract)

### `coverage: CoverageReport` (`coverage.ts`)

```ts
interface CoverageReport {
  generatedAt: string
  components: ComponentCoverageResult[] // full per-component diff, superset of ComponentSummary's fields
  oursOnly: string[]      // components we have that upstream's base-ui docs don't
  upstreamOnly: string[]  // upstream components we haven't ported
  ignoredCount: number    // total ignore-list entries that suppressed a would-be diff, across all components
}
```

### `visual: VisualReport | null` (`visual.ts`)

```ts
interface VisualReport {
  generatedAt: string
  threshold: number                          // mismatch ratio (0-1) above which a result is `flagged`
  differ: "odiff" | "pixelmatch"              // which pixel-diff tool actually ran (see below)
  results: DemoVisualResult[]                 // one entry per (component, paired demo)
  interactedDemos: string[]                   // "<component>/<demoName>" for every demo that had interactions.json steps applied
}

interface DemoVisualResult {
  component: string
  demoName: string
  mismatchRatio: number | null   // fraction of differing pixels over the union bounding box, 0-1; null on error
  flagged: boolean                // mismatchRatio > threshold
  interacted: boolean             // true if interactions.json had an entry for this demo
  upstreamImagePath: string | null
  ourImagePath: string | null
  diffImagePath: string | null
  error: string | null            // navigation/timeout/odiff failure message; non-null means the other fields are unreliable
  timingMs: number
}
```

`differ` is always `"odiff"` in the current implementation — `odiff-bin`
(a root devDependency, binary at `node_modules/.bin/odiff`) is verified
working on the reference machine (see the implementation report for the
`odiff --help`/exit-code verification). `pixelmatch` remains a root
devDependency from the v1 implementation but is not currently wired as a
fallback; `differ` exists as a field so a future change that adds a real
runtime fallback doesn't need a schema migration.

`mismatchRatio` is computed over the **union bounding box** of the two
screenshots: each screenshot is padded (transparent fill) up to
`max(width_a, width_b) x max(height_a, height_b)` before diffing, so a
demo that renders taller/wider on one side has that extra area counted as
mismatch rather than silently cropped away (a v1 behavior this version
deliberately changed — v1 cropped to the MIN box).

## Ignore list (`parity-ignore.json`)

```ts
interface ParityIgnoreEntry {
  component: string   // component name, or "*" for every component
  kind: "section" | "demo" | "api-prop"
  name: string         // matched via coverage.ts's normalizeName — case/kebab/punctuation insensitive
  reason: string       // required — this file is a review record, add entries only after actually looking at the diff
}
```

## Example: a minimal external consumer

```ts
import { readFileSync } from "node:fs"

const report = JSON.parse(readFileSync("parity-report/report.json", "utf8"))
const drifted = report.summary.filter((c: { status: string }) => c.status === "drift")

if (drifted.length > 0) {
  console.log(`${drifted.length} components drifted:`, drifted.map((c: { component: string }) => c.component))
  process.exit(3) // mirrors check-parity.ts's own exit-code contract
}
```
