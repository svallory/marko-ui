# parity-report/report.json — schema

`bun tooling/check-parity.ts` writes `parity-report/report.json` (plus the
human-facing `parity-report/index.html`, `parity-report/unclassified.json`,
and PNGs under `parity-report/images/`). This file documents the JSON
shape for anyone consuming it programmatically — a CI step gating on
drift, a script generating a dashboard, another agent auditing coverage —
without needing to read `coverage.ts`/`visual.ts`/`check-parity.ts`
source.

**v3**: the coverage detector was rewritten around a section **map**
and a presence-only classification pipeline. See
`notes/docs-canonical-structure.md` for the full design rationale — this
file documents the resulting schema and semantics.

**v4**: the runner (this directory) no longer parses MDX or manifests
itself — it reads `parity-facts.json`, a harness-agnostic input format
each harness's own `extract/` step produces. See
`tooling/parity/PROTOCOL.md` for the full harness protocol (what a
harness must provide, `parity-facts.json`'s schema, the extraction step
contract); this file's classification/presence semantics are unchanged
by that split.

**Map is a typed TS module, not JSON.** `tooling/parity/config/section-map.ts`
(`export default defineSectionMap({...})`) is the canonical, committed
map — a former `section-map.json` was converted to this module so `tsc`
enforces the map's SHAPE (known action names, required per-action
fields, `when` being a function) at compile time; `coverage.ts`'s runtime
validation now only checks the SEMANTIC rules `tsc` can't express
(ignore-sole, ≤1 placement action per array, ≤1 default variant). See
"section-map.ts — the map schema" below.
`tooling/parity/config/section-map.proposed.json` — LLM-written proposals,
reviewed and promoted by hand into `section-map.ts` — stays JSON. See
"JSON proposals → TS promotion" below for how a proposal's declarative
`when` becomes a predicate on promotion.

## Exit-code contract

`bun tooling/check-parity.ts` (and `bun run check:parity`) exits:

- **0** — green, no drift found.
- **3** — drift found. At least one component has `status: "drift"` in
  `summary` (see below). This matches the repo's `doctor`/`validate`
  convention (`marko-ui doctor --json` also uses exit 3 for "something is
  broken"). The report is still written on exit 3 — 3 means "read the
  report," not "the run failed."
- **2** — the run itself crashed (thrown exception, missing upstream
  clone, a `section-map.ts` with no valid `default` export, a semantic
  map-validation failure, Playwright not resolvable, etc) — a tooling
  failure, not a drift finding. Handled uniformly by `fs-utils.ts`'s
  `runCheck`.

**Unclassified sections never affect the exit code**, in strict mode or
otherwise. They're a to-map queue, not drift — see "Unclassified
pipeline" below.

## CLI flags (`tooling/check-parity.ts`)

```
bun tooling/check-parity.ts [--static-only] [--component <slug>] [--strict]
```

- `--static-only` — skip the Playwright visual detector.
- `--component <slug>` — restrict both detectors to one shared component.
- `--strict` — switch the coverage detector's presence check to
  post-migration mode. See "Transition mode" below. **Off by default.**

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
  component: string               // e.g. "drawer" — matches the directory name under packages/shadcn/ui/
  status: "green" | "drift"       // "drift" if ANY of the fields below indicate a real (non-ignored) difference
  pairedDemos: string[]           // demo names present (name-normalized-matched) on BOTH sides — these are what visual.ts actually screenshots
  missingDemos: string[]          // upstream demo names with no matching ours-side demo (excluding ignored entries)
  extraDemos: string[]            // ours-side demo names with no matching upstream demo (excluding ignored entries)
  missingMappedTargets: string[]  // ORIGINAL upstream headings whose mapped target is absent from our page (excluding ignored entries) — see "Presence checks" below
  unclassifiedCount: number       // count of this component's UNCLASSIFIED sections — NEVER contributes to `status`
  maxDiffPct: number | null       // highest visual mismatch % (0-100) across this component's paired demos; null if visual detector didn't run or found nothing to compare
  ignored: string[]               // names from parity-ignore.json that apply to this component (component-scoped entries + "*" wildcard entries), regardless of kind
}
```

Field notes:

- **`pairedDemos`** is not "all demos" from either side — it's the
  intersection, name-normalized (`coverage.ts`'s `normalizeName`: case,
  kebab/whitespace, and punctuation insensitive). This is exactly the set
  `visual.ts` iterates when computing `maxDiffPct`.
- **`missingMappedTargets`** replaces v2's `missingSections`/
  `extraSections`. v3 never diffs heading lists 1:1 — see "Classification
  pipeline" below. This field lists only sections that (a) have an
  explicit `section-map.ts` entry with a placement action, and (b)
  whose resolved target is absent from our page. There is no v3
  equivalent of "extra sections (ours-only)" — presence-only semantics
  never flag ours-only additions (Accessibility, generated API, Style
  Hooks, etc).
- **`unclassifiedCount`** is informational only. A component with
  `unclassifiedCount > 0` can still be `status: "green"`. See
  "Unclassified pipeline."
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
  `missingDemos`/`extraDemos`/`missingMappedTargets`, OR any of
  `coverage`'s fuller `missingApiProps`/`extraApiProps` (not summarized
  above but still checked), OR any paired demo's visual mismatch exceeds
  `visual.threshold` (default 15%, see `VisualReport` below).
  **Unclassified sections never factor into `status`, in `--strict` or
  not.** In other words: `status` reflects the FULL underlying
  `coverage`/`visual` data, even though the `summary` row itself only
  surfaces a subset of fields — don't reverse-engineer `status` from the
  fields shown in the same row without also checking `coverage`/`visual`
  if you need to know exactly why a component drifted.

## `section-map.ts` — the map schema

`tooling/parity/config/section-map.ts` is the shared contract between the
CHECKER (this file's presence assertions) and a future PORTER (how
content transforms, via `process`). It is a typed TS module — types live
in `tooling/parity/runner/map-types.ts` (JSDoc'd per-symbol; read that file for
the authoritative reference) — that exports its map via
`defineSectionMap` (an identity function that exists purely so the map
literal infers correctly against the union types, without an explicit
`: SectionMap` annotation widening the `action` string literals away):

```ts
// tooling/parity/config/section-map.ts
import { defineSectionMap } from "./map-types.ts"

export default defineSectionMap({
  // key: upstream heading, normalized via coverage.ts's normalizeName
  "theming": [{ action: "move", parent: ["styling"] }],
  // ...
})
```

Shape (from `map-types.ts`):

```ts
type SectionMap = Record<string, SectionMapEntry>

// A map entry value may be EITHER shape:
type SectionMapEntry = MapAction[] | MapVariant[]

type MapAction =
  | { action: "move";    parent: string[]; title?: string }  // parent = canonical bucket path, e.g. ["styling", "recipes"]; title defaults to the original heading
  | { action: "rename";  title: string }                      // stays at root, renamed
  | { action: "keep" }                                        // stays at root, own name (documented spelling for a move with parent: [] and identity title)
  | { action: "ignore";  reason: string }                     // must be the SOLE action in the array
  | { action: "process"; mode: "llm"; prompt?: string }        // optional porter-transform hint, additive to a placement action
  | { action: "process"; mode: "function"; fn: (content: string, ctx: SectionContext) => string }
  // Absence of a "process" action for an entry means "as-is" (no transform).

// MapVariant[] — for a heading whose right action DEPENDS on which
// component/context it came from (e.g. the same upstream heading text
// means different things on different component pages). First matching
// variant wins (array order); a variant with no `when` is the default
// (matches unconditionally, so put it last).
type MapVariant = {
  when?: (ctx: SectionContext) => boolean
  actions: MapAction[]  // same per-actions rules as the plain MapAction[] form
}

interface SectionContext {
  component: string       // e.g. "combobox"
  heading: string          // raw upstream heading text
  headingSlug: string      // normalizeName(heading)
  hasDemoMarker: boolean
  body?: string
}
```

The plain `MapAction[]` form is still the default and by far the common
case — reach for `MapVariant[]` only when one heading genuinely needs
different treatment per component; most entries never need it.

**`mode: "function"` is UNRESERVED and implemented** as a typed
reference: `fn` is a real, statically-checked function value. `coverage.ts`
still only RECORDS `process` actions of either mode (`"llm"` or
`"function"`) for reporting (`ComponentCoverageResult.processActions`) —
it never invokes `fn`; a future porter step is responsible for calling
it. This is a behavior change from the pre-conversion JSON map, where
`mode: "function"` was rejected at load (reserved, unimplemented).

### Validation — what `tsc` now guarantees vs. what `coverage.ts` still checks at runtime

Converting the map from JSON to a typed TS module moves SHAPE validation
to compile time — `bun run check:tooling` (`tsc --noEmit -p tooling`)
now fails on any of these, at the exact entry, with no need to run the
checker at all:

- An unknown `action` name (e.g. `"teleport"`) — a discriminated-union
  member mismatch.
- A missing required field for a given action (`move` without `parent`,
  `rename`/`ignore` without `title`/`reason`, `process` without a valid
  `mode`).
- A `when` that isn't a function, or a `fn` with the wrong signature.

`coverage.ts`'s `loadSectionMap`/`validateMapEntry` still enforce the
SEMANTIC rules `tsc`'s structural typing cannot express — a malformed
map remains a **hard error naming the offending entry** (a tooling crash,
exit 2, not a drift finding, because a broken map makes every downstream
presence check unreliable):

- `loadSectionMap` REQUIRES `section-map.ts` to have a `default` export
  that is a plain object — a missing or wrong-shaped default export
  (e.g. a named export instead, or an array) fails with a clear, named
  error before any entry is even inspected.
- `ignore` must be the SOLE action in its array (an entry can't be
  "ignored" AND "moved"). This applies per-`actions` array, including
  inside each variant.
- At most ONE placement action (`move`/`rename`/`keep`) per `actions`
  array — an entry can't be moved to two places. A `process` action may
  accompany a placement action (they compose: placement says where,
  `process` says how to transform on the way in).
- At most ONE no-`when` (default) variant is allowed per entry — two
  defaults is ambiguous and fails validation.
- A `when` predicate that THROWS when evaluated is a hard error naming
  the offending heading slug and the component it was evaluated against
  — `coverage.ts` wraps every `when(context)` call in try/catch and never
  silently skips a throwing predicate as "no match."

Per-page pathologies (a single component's one-off difference) stay in
`parity-ignore.json`, not this map — the map is upstream-heading-keyed
and applies globally across every component that has that heading.
`MapVariant[]`'s `when` predicate is the one exception baked into the map
itself, for headings whose correct treatment is genuinely
component-dependent rather than a one-off pathology.

### JSON proposals → TS promotion

`tooling/parity/config/section-map.proposed.json` STAYS JSON — it's LLM-written
scratch output (see "Unclassified pipeline" below and
`classify-prompt.md`), and JSON is the natural format for an LLM to
emit and a human to diff/review before promoting entries into the real
map. Its `when`, if a proposal includes one, remains the **declarative
object form** from the pre-conversion map schema:

```ts
// section-map.proposed.json's declarative "when" shape (proposals only)
{ when?: { component?: string[]; hasDemoMarker?: boolean }, actions: MapAction[] }
```

**Promotion** (a human copying a reviewed proposal from
`section-map.proposed.json` into `section-map.ts`) converts that
declarative object into a predicate function:

```ts
// proposed.json:
{ "when": { "component": ["combobox", "select"] }, "actions": [...] }

// promoted into section-map.ts:
{ when: (ctx) => ["combobox", "select"].includes(ctx.component), actions: [...] }

// proposed.json:
{ "when": { "hasDemoMarker": true }, "actions": [...] }

// promoted into section-map.ts:
{ when: (ctx) => ctx.hasDemoMarker === true, actions: [...] }

// proposed.json combining both:
{ "when": { "component": ["combobox"], "hasDemoMarker": false }, "actions": [...] }

// promoted:
{ when: (ctx) => ctx.component === "combobox" && !ctx.hasDemoMarker, actions: [...] }
```

This conversion is mechanical (each declarative key becomes one `&&`-ed
condition on the predicate) but is a manual, human step during
promotion — there is no automated proposed.json → section-map.ts
importer. `classify-prompt.md` documents this for the LLM/human doing
the promotion.

### `process` prompt composition

When a `process` action's `prompt` is present, it is **section-specific
guidance APPENDED to** the default prompt in
`tooling/parity/runner/process-prompt.md` — never a replacement for it. When
`prompt` is omitted, the default alone applies. See
`process-prompt.md`'s "Composition rule" for the exact mechanics and
placeholder list. Like `classify-prompt.md`, `process-prompt.md` is a
template only — this repo's tooling never calls an LLM provider directly;
a future porter/harness step is responsible for filling placeholders,
concatenating entry `prompt` onto the default, and making the call.

## Section classification pipeline (`coverage.ts`)

For every upstream `##`/`###` section (heading + body text up to the next
same-or-higher-level heading), in order:

0. **BUNDLER pre-pass: canonical-bucket-name headings are a deterministic
   keep, before anything else runs.** If `normalizeName(heading)` is
   itself one of the ten canonical bucket slugs (`installation`, `usage`,
   `api-reference`, `accessibility`, `changelog`, `anatomy`, `examples`,
   `styling`, `guides`, `concepts` — `coverage.ts`'s
   `CANONICAL_BUCKET_SLUGS`) AND there is no explicit `section-map.ts`
   entry overriding it, the section is classified `{ action: "keep" }`
   deterministically — it never reaches tier 3 (unclassified), so it
   never appears in `parity-report/unclassified.json` and never gets
   bundled into an LLM classification batch. Rationale: a heading that
   already IS a canonical bucket needs no classification decision — proposing
   "keep" for e.g. "Installation" wastes an LLM call on a foregone
   conclusion. An explicit map entry (including one that reclassifies a
   canonical-named heading, e.g. a component-specific "Styling" that
   should actually be ignored) still wins over this pre-pass.
1. **Explicit map entry wins.** `normalizeName(heading)` looked up in
   `section-map.ts`. An `ignore` entry drops the section from all
   further consideration (not presence-checked, not unclassified). A
   placement entry (`move`/`rename`/`keep`) resolves a **target**
   (canonical bucket path + display title) that tier's presence check
   uses — see "Presence checks" below.
2. **No entry, but the section's body matches an adapter demo marker AND
   its prose is short.** "Demo marker" is adapter config (see
   `adapter-shadcn.ts`'s `demoMarkers`), not code — porting the checker to
   a different upstream library means writing new marker pattern(s), not
   editing `coverage.ts`. shadcn's adapter:
   `demoMarkers: [{ pattern: '<ComponentPreview\\b[^>]*?\\bname="([^"]+)"', nameGroup: 1 }]`.
   "Short prose" means `proseLength(body) <= PROSE_THRESHOLD_CHARS`
   (**400 characters**, `coverage.ts`'s `PROSE_THRESHOLD_CHARS` — prose is
   the body text with fenced code blocks, markdown tables, and JSX-ish
   tags all stripped first, so a demo wrapped only in a one-sentence intro,
   a `<ComponentPreview .../>` tag, and a short prop-reference table counts
   as short even though the raw body includes all that markup — see
   bubble.mdx's "Alignment" section for exactly this shape).
   When this tier matches: the demo name(s) captured by the marker join
   the upstream demo set (compared BY NAME against our demos manifest,
   same mechanism as v2). **The heading text itself is never
   interpreted or presence-checked** in this tier.
3. **Otherwise → UNCLASSIFIED.** Either a preview + substantial prose
   (>400 chars), or no preview and no map entry. Never guessed. See
   "Unclassified pipeline" below.

## Checker v3 semantics (presence-only)

Flags ONLY:

1. An upstream demo name absent from our demos manifest (`missingDemos`).
2. An upstream section with a map entry whose resolved target (bucket
   path / display title) is absent from our page (`missingMappedTargets`).

Never flags: location, ordering, or naming differences covered by the
map; ours-only additions (Accessibility, generated API, Style Hooks);
unclassified sections (see below); anything under an `ignore` map entry
or a `parity-ignore.json` entry.

## Presence checks & transition mode

`isTargetPresent` (`coverage.ts`) decides whether a mapped section's
target counts as present on our page:

- The **canonical bucket** is `target.parent[0] ?? target.title` — the
  top-level bucket this section's content should live under once our
  docs pages adopt the canonical hierarchy from
  `notes/docs-canonical-structure.md`.
- **Our docs pages are NOT YET migrated** to that hierarchy (see the
  design doc's "Sequencing": checker v3 lands first, migration is a
  separate, later step) — our current pages are still the flat
  pre-migration skeleton (Installation / Usage / Composition? / one
  section per example / API Reference, see `+page.marko` and
  `ourSectionsFor`). Running strict canonical-only presence checks before
  migration would flag hundreds of intentional moves as drift.
- **Transition mode (default, `strict: false` / no `--strict` flag)**: a
  target counts as present if EITHER the canonical bucket name OR the
  section's mapped title OR its ORIGINAL upstream heading is present on
  our current page. This tolerates the fact that, pre-migration, content
  mapped to e.g. `Styling > Theming` is still just sitting under a
  section literally titled "Theming" on our page.
- **Strict mode (`--strict` / `{ strict: true }`)**: only the canonical
  bucket name counts. This is the intended POST-migration behavior —
  switch the default once the docs-page migration (step 2 of the design
  doc's sequencing) lands, at which point transition mode's tolerance
  becomes unnecessary and undesirable (it would silently accept a page
  that never actually migrated).

## Unclassified pipeline

Every run, `coverage.ts` writes `parity-report/unclassified.json`:

```ts
type UnclassifiedBundle = UnclassifiedEntry[]

interface UnclassifiedEntry {
  component: string    // e.g. "combobox"
  heading: string       // raw upstream heading text
  bodyExcerpt: string   // body text, truncated to <=500 chars
}
```

This is a **to-map queue, not drift** — `unclassifiedCount` never
contributes to a component's `status`, with or without `--strict`. The
intended workflow: `tooling/parity/runner/classify-prompt.md` is a ready prompt
template that bundles this file's entries into one/few LLM calls and
proposes `section-map.proposed.json` entries (same `MapAction[]` shape as
`section-map.ts`). **This repo's tooling does not call any LLM
provider** — that's the harness/skill layer's job; `coverage.ts` only
emits the bundle, and `classify-prompt.md` only documents the prompt. A
human reviews and promotes correct proposals into the real
`section-map.ts` by hand; proposals never auto-apply.

`tooling/parity/runner/process-prompt.md` is the companion template for the
PORTER side (once content is mapped, how to adapt it) — also a template
only, also never auto-applied.

## Detector internals (for the HTML report / debugging, not a stable contract)

### `coverage: CoverageReport` (`coverage.ts`)

```ts
interface CoverageReport {
  generatedAt: string
  components: ComponentCoverageResult[]
  oursOnly: string[]        // components we have that upstream's base-ui docs don't
  upstreamOnly: string[]    // upstream components we haven't ported
  ignoredCount: number      // total ignore-list/map-ignore entries that suppressed a would-be diff, across all components
  unclassifiedTotal: number // total unclassified sections across all analyzed components
  strict: boolean            // whether this run used --strict presence checking
}

interface ComponentCoverageResult {
  component: string
  missingDemos: string[]
  extraDemos: string[]
  missingMappedTargets: MappedSectionResult[]  // full detail, superset of summary's string[] version
  missingApiProps: string[]
  extraApiProps: string[]
  apiTractable: boolean
  upstreamDemos: string[]
  ourDemos: string[]
  unclassifiedCount: number
  ignoredSectionCount: number     // sections dropped by a map "ignore" entry
  processActions: { heading: string; action: MapAction & { action: "process" } }[]
    // process actions ACCEPTED and carried through to the report for
    // visibility — coverage.ts never acts on them (no porter runs here).
}

interface MappedSectionResult {
  heading: string                         // original upstream heading
  target: { parent: string[]; title: string } // resolved canonical target
  present: boolean                        // always false in this array — only misses are recorded (see coverage.ts)
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

`kind: "section"` entries match against a mapped section's ORIGINAL
upstream heading (the same string reported in `missingMappedTargets`) —
they suppress one component's one-off miss without touching the global
`section-map.ts`.

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
