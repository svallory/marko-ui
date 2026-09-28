# Behavior coverage (issue #72) — spike design

Round 1: design + 3-component spike. Round 2a: stub scaffold, unreviewed-stub
exclusion, 12 more components, badge plumbing (README only). Rest of the
rollout (~71 components) and the home-page slot are still open.

## Format

`apps/docs/src/demos/<component>/behaviors.ts`, colocated with `docs.ts`
(the issue's own suggestion — same directory, same authoring audience: a
behavior is a documented claim about the component). Shape defined once in
`apps/docs/src/demos/behavior-types.ts`:

```ts
interface ComponentBehavior {
  id: string;          // "<component>/<kind>/<slug>", e.g. "dropdown-menu/keyboard/arrow-down-up-moves-highlight"
  kind: BehaviorKind;   // interaction | keyboard | a11y | ssr-hydration | visual | api
  description: string;  // one sentence, observable fact
  source: string;       // zag prop/method, docs example name, or WAI-ARIA APG section
}
```

Ids are stable strings, not array indices — a behavior can be renamed only
by updating every reference (the mapping file), which is deliberate: it's
the same drift protection the mapping mechanism relies on (see below).

**A behavior list is not a test list.** It states what the component does,
whether or not anything checks it. `combobox/api/async-item-loading` is in
`combobox/behaviors.ts` with no demo behind it yet (see that file's header)
— the honest move per the brief ("list behaviors even if nothing tests
them"), not a thing to quietly drop to inflate the percentage.

### Alternatives rejected

- **A single central behaviors.json/ts for all components.** Rejected:
  colocation with docs.ts keeps a behavior list next to the docs author who
  actually knows the component, and matches the issue's own suggestion. A
  central file would also become a 86-component merge-conflict magnet.
- **Deriving behaviors automatically from the zag machine's TS types.**
  Rejected for this round: a machine's `Props`/`Api` surface gives you
  *capabilities*, not *behaviors* — "has a `disabled` prop" isn't the same
  claim as "disabled blocks keyboard toggle AND removes it from tab order".
  Worth revisiting later as a scaffold/lint (flag an undocumented machine
  prop), not as the source of truth.

## Suite → behavior mapping

`packages/shadcn/tests/behavior-coverage/<component>.ts`, shape in
`packages/shadcn/tests/behavior-coverage/mapping-types.ts`:

```ts
interface BehaviorCoverageEntry {
  behaviorId: string;       // must match a ComponentBehavior.id
  provenBy: ProvingCheck[]; // >=1 required for "covered"
}
interface ProvingCheck {
  source: "vitest" | "hydration-invariant" | "axe-scan" | "visual-guard";
  file: string;   // suite/spec/script file, repo-relative
  title: string[]; // vitest: ancestorTitles + it-title, outermost first (matches badge.ts's own ancestorTitles matching)
}
```

### Why a separate mapping file, not a `covers: [...]` tag on the test

Considered tagging tests directly (`it("...", { covers: [...] }, ...)` or a
title convention like `it("[behavior:id] ...")`). Rejected:

- **The brief's constraint is "no changes to existing test titles/behavior"
  beyond adding metadata, and badge.ts already keys hydration coverage off
  `ancestorTitles` verbatim.** A title-embedded tag changes the title,
  which is exactly the thing that must not silently break badge.ts's
  existing matching. A separate mapping file touches zero existing test
  files.
- **A separate file can be validated statically against real test titles**
  (see the script below) — a tag baked into `it()` can't be cross-checked
  against anything without also running the suite, which the brief
  explicitly rules out for this round ("compute coverage ... WITHOUT
  running the suites").
- **It "fails loudly on unknown ids"** per the brief's constraint: a mapping
  entry citing a behavior id absent from `behaviors.ts` is a script error,
  not a silent no-op — see `scripts/ci/behavior-coverage.ts`'s unknown-id
  check.

### How "without running the suite" actually holds

- `vitest`/`hydration-invariant` checks are cross-referenced against
  `bunx vitest list --json`, which **discovers and lists tests without
  executing them** (verified: no browser, no dev server invoked) — a
  mapping entry pointing at a renamed or deleted `it()` is caught this way.
- `axe-scan` checks are cross-referenced against
  `DOCUMENTED_COMPONENTS`/`OPEN_STATES`/`NO_OPEN_STATE` (the same static
  lists `axe-scan.ts` itself validates against before it ever launches a
  browser).
- `visual-guard` checks only confirm the spec file exists — Playwright has
  no static "list without running" equivalent the way vitest does, so this
  source is trusted to actually cover what it claims. Flagged as an open
  question below.

## The 3 spike components and their numbers

Computed by `bun scripts/ci/behavior-coverage.ts` (static, no server):

```
component      covered  total  coverage
---------------------------------------
combobox             2     18       11%
dropdown-menu        5     20       25%
switch               6     13       46%
---------------------------------------
TOTAL               13     51       25%
```

- **switch** (simple): `toggle-controls.test.ts`'s "switch keyboard
  contract (APG)" describe already proves 4 of 13 listed behaviors
  (space-toggle, disabled-blocks-toggle, default-checked,
  role/aria-checked exposure), plus hydration-invariant and axe-scan add 2
  more. Uncovered: click-only interaction (vs. keyboard), controlled
  `checked`, `size`, `invalid`, form submission via the hidden input, RTL
  mirroring — none has a dedicated assertion today.
- **dropdown-menu** (compound): only `compound-order.test.ts`'s one test
  (interleaved `<@item>`/`<@separator>` source order) plus the two
  structural checks (hydration, axe) prove anything. **No dedicated
  interaction/keyboard suite exists for dropdown-menu** the way
  `toggle-controls.test.ts` exists for switch/checkbox or `tabs.test.ts`
  for tabs — every keyboard-contract behavior (arrow nav, typeahead,
  Escape, submenu open/close) and most interaction behaviors (item click,
  outside-click dismiss, checkbox/radio item toggling) are unproven. This
  is the real gap the spike surfaces, and it's the reason "compound" was
  picked over tabs — tabs already has a near-full suite (see
  `packages/shadcn/tests/behavior/tabs.test.ts`), which would have made the
  spike's coverage number look better than the population it's meant to
  represent.
- **combobox** (async/server-shaped): only the 2 structural checks apply —
  **zero dedicated behavior suite at all**. Also the component where the
  machine's own capability (server-driven filtering via
  `onInputValueChange`) has no demo exercising it yet, so
  `combobox/api/async-item-loading` is listed with no proving check
  possible until a demo exists.

## Script

`scripts/ci/behavior-coverage.ts` — `bun scripts/ci/behavior-coverage.ts
[component...]` (no args = every component with a `behaviors.ts`). Reads
each component's `behaviors.ts` + `behavior-coverage/<component>.ts`,
statically validates every mapping entry (per "without running the suite"
above), and prints a table. Exits non-zero on: unknown behavior id in a
mapping, empty `provenBy`, duplicate behavior id within one list, duplicate
mapping entry for the same id, a behavior id not prefixed with its own
component name, or a `vitest`/`hydration-invariant` check whose title no
longer exists.

Unit tests: `scripts/ci/__tests__/behavior-coverage.test.ts`, fixture-based
(a throwaway `__behcov_fixture__` component written to a real path under
`apps/docs/src/demos/` and `packages/shadcn/tests/behavior-coverage/`, since
dynamic `import()` needs a real resolvable path — no virtual-fs ESM import
in this toolchain). Covers: a behavior proven by a real existing vitest
test → covered; a behavior with no mapping / a missing mapping file →
uncovered, no error; a mapping referencing an unknown behavior id → error;
a mapping citing a renamed/deleted test title → error (uncovered, not
silently dropped); a duplicate behavior id within one list → error; a
duplicate mapping entry for the same id → error; a behavior id not prefixed
with its component name → error. 8 tests, all passing.

**Gotcha found while writing the tests, fixed in the script itself:** ESM
caches a dynamic `import()` by URL. The fixture tests rewrite the same file
path across test cases, and a naive `import(path)` returned the *first*
test's cached module on every subsequent test — silent stale data, not a
crash. Fixed with a `?t=<timestamp>-<nonce>` cache-busting query param on
every import in `loadComponent`/`freshImport`; free in production use
(each component is imported once per process there).

Root `vitest.config.ts`'s `include` was widened to add `scripts/**/*.test.ts`
(it previously covered `packages/**`, `apps/docs/scripts/**`,
`tooling/**` — `scripts/ci/` had no test coverage of its own before this).

## Rule: axe-scan proves structural ARIA validity only, never that a value tracks state

`axe-scan` runs axe-core against a rendered (possibly opened) page and checks
WCAG/ARIA rules: is this role valid here, is this aria-* attribute
well-formed, present, and pointing at a real element. It never re-renders the
page after an interaction and re-checks the attribute's new value — it has no
concept of "before vs. after a state change." So an `a11y`-kind behavior
`provenBy` an `axe-scan` check may only claim **structural validity** ("a
valid role/attribute is present and well-formed"), never **value-tracks-state**
("this attribute's value changes correctly when the component's state
changes"). The latter needs a `vitest` check that reads the attribute at two
different states and asserts both values (the pattern `toggle-controls.test.ts`
already uses for switch/checkbox `data-state`).

Applied in round 2: `dropdown-menu/a11y/trigger-aria-haspopup-expanded`,
`dropdown-menu/a11y/checkbox-radio-item-roles`, and
`combobox/a11y/combobox-listbox-roles` all narrowed from "reflects/tracks
state" to "structurally valid, presence/well-formedness only" — their
`provenBy` stayed `axe-scan` (still correct for that narrower claim), but the
`description` no longer claims what axe can't prove. If a future round wants
the stronger "value tracks state" claim for one of these, it needs a new
`vitest`-provenBy behavior split out separately, not a reused axe-scan
mapping.

## Lead's answers to round-1 open questions

1. **Visual-guard captures (e.g. preview-page-4 opening dropdown-menu) prove
   only `visual`-kind behaviors** — "renders correctly across style layers
   while in this state" — never an `interaction`/`keyboard`/`a11y` claim, even
   though opening the overlay does exercise the click. A pixel-diff assertion
   proves nothing about ARIA values or focus, so `visual-guard` stays scoped
   to behaviors whose `kind` is literally `"visual"`.
2. **Build a stub scaffold before the round-2 rollout**, per the round-1
   estimate: pre-populate `id`/`kind`/`source` from each component's `docs.ts`
   examples (title → interaction stub) and its zag machine's `Props` keys
   (each prop → an `api`-kind stub), so round 2 is filling in
   descriptions/mappings rather than writing 1,300+ entries from scratch.
3. **(Superseded in round 2a: ships main-only via `badges-main` first.) The badge will be release-pinned like the others** — same `badges`
   branch / release-pipeline pattern as `hydration-invariant`/`axe`, not
   `badges-main`. Needs the `--json` mode on `scripts/ci/behavior-coverage.ts`
   before it can be wired into `scripts/ci/badge.ts`'s `combine`.
4. **Combobox's async-loading demo waits for round 2** —
   `combobox/api/async-item-loading` stays listed with no proving check for
   this round; building a real debounced-fetch demo is in scope for the
   round-2 rollout, not this spike.

## Open questions for the lead

1. **Does a visual-guard capture count as proving an interaction/keyboard
   behavior, or only a `visual`-kind one?** `preview-page-4` in
   `gallery-visual.spec.ts` opens dropdown-menu and asserts pixels, which
   *exercises* the click-to-open interaction but asserts nothing about it
   beyond "renders without visual regression" — no `aria-expanded` check,
   no focus assertion. Left unmapped in `dropdown-menu.ts` (commented out)
   rather than guessed at; needs a call on whether "the interaction ran and
   didn't crash/misrender" is enough to count.
2. **Round-2 effort estimate.** Writing switch/dropdown-menu/combobox's 51
   behaviors + mappings took the bulk of this session's budget, working
   from docs.ts + zag types already in hand. 86 components at a similar
   density (~15-20 behaviors each) is ~1,300-1,700 entries — call it 1-2
   focused sessions per 10-15 components if done by the same
   research-then-write process, likely faster with a per-component-family
   template (the switch/checkbox/radio shape repeats across ~8 "simple
   toggle" components, the menu shape across dropdown-menu/context-menu/
   menubar). A scaffold script that pre-populates `id`/`kind`/`source` stubs
   from each component's docs.ts examples (title → interaction stub) plus
   its zag machine's `Props` keys (each prop → an `api`-kind stub) would cut
   this significantly — worth building before round 2 starts rather than
   during it.
3. **Badge plumbing (round 2, not this round):** a `behavior-coverage`
   badge kind in `scripts/ci/badge.ts`'s `combine` case, following the
   existing `hydration`/`axe` pattern — message `"<covered>/<total>
   behaviors"`, color thresholds TBD by the lead (the existing
   brightgreen/yellow/red split on `hydration` is a reasonable starting
   point). Home page 4th badge slot per the issue. Should the badge be
   release-pinned (`badges` branch) like the others, computed at release
   time from `bun scripts/ci/behavior-coverage.ts` output piped to a JSON
   mode the script doesn't have yet (currently table-only; needs a
   `--json` flag mirroring `axe-scan.ts`'s output shape).
4. **Should `combobox/api/async-item-loading` get a real demo this round or
   next?** It's the one behavior in the spike list that documents a machine
   capability with literally no demo exercising it — arguably out of scope
   for "spike the format," but it's also the async/server-shaped behavior
   the issue specifically asked this component to represent, and right now
   nothing in the docs shows it.

## Round 2a additions

### Scaffold: `scripts/ci/scaffold-behaviors.ts`

`bun scripts/ci/scaffold-behaviors.ts <component...>` writes
`apps/docs/src/demos/<component>/behaviors.ts` from three static sources:
`docs.ts` example titles (each becomes an `interaction` stub), the zag
machine's runtime `props` array (the `@zag-js/*` package the component's
`.marko` imports; each relevant prop becomes an `api` stub — `id`/`ids`/
`getRootNode` and `onXChange` handlers whose base prop exists are skipped),
plus one `keyboard`, `a11y` and `ssr-hydration` stub. Components without a
machine (toggle) get example + standard stubs only. It **never overwrites** an
existing `behaviors.ts` (`flag: "wx"` plus an explicit check). Every generated
entry carries `status: "stub"` and a `TODO(review)` description.

Review workflow: edit each description against the machine / APG pattern and
docs, delete padding, add missing behaviors, drop `status`. Expect the raw
stub to over-generate (accordion: 21 stubs → 20 reviewed entries, but a
different set; select: ~40 stubs, mostly machine props that are wiring).

### The `status` field and the count

`ComponentBehavior.status?: "stub"`. `behavior-coverage.ts` excludes stubs from
`total`/`covered` (they neither dilute nor inflate), reports them as `pending`
per component and in total, treats a stub-only file as "not listed", and turns
a mapping entry that targets a stub into an error. A component is *listed* iff
it has at least one reviewed behavior.

`--json` prints `{covered, total, listedComponents, stubOnlyComponents,
pendingStubs, totalComponents, components[]}`; `totalComponents` is
`DOCUMENTED_COMPONENTS.length`.

Gotcha: vitest prepends an NDJSON banner to `list --json` stdout when
`AI_AGENT` is set; the script now removes the var for its child and parses from
the array's opening bracket.

### Badge formula

`message = "<covered/total as %> · <listed>/<all> components"`, e.g.
`40% · 15/86 components`, label `behavior coverage`, file `coverage.json`.
Numerator/denominator are *reviewed* behaviors of *listed* components only — so
the percentage is honest about what is listed, and the second figure shows how
little of the library that speaks for (a bare percentage would read as
library-wide). Color follows lighthouse: ≥90 brightgreen, ≥50 yellow, else red
(red is deliberate at today's 40%). Generated in ci.yml's `tests` job, published
to `badges-main` by the existing publish-badges job, linked from the README
badge row. **Supersedes round-1 answer 3 (release-pinned):** per the round-2a
brief it ships main-only first; release.yml is untouched, so the home page has
no such badge yet.

### First reviewed batch (12 components)

accordion, alert-dialog, checkbox, collapsible, dialog, popover, radio-group,
select, slider, tabs, toggle, tooltip — 257 reviewed behaviors across 15
components, 103 covered (40%). Mappings cite a test only where it asserts the
behavior as worded; visual-guard mappings were deliberately not used (the
gallery guards only render style/theme states, not `visual`-kind RTL claims), so
every `visual/rtl-mirrors` entry is an open gap. Components with no behavior
suite (alert-dialog, collapsible, popover, toggle, tooltip) only get the axe /
hydration structural mappings; the gaps are the finding.
