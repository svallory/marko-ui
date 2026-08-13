# TODO

## Decisions

- [x] **Project name: `marko-ui`** — renamed 2026-08-11 (was shadcn-marko; scope now exceeds shadcn — "shadcn for Marko" stays as marketing tagline). Renamed in registry output, docs, workspace package. Repo push should use `svallory/marko-ui`. `(decision — made)`
- [x] **Registry domain: `marko-ui.saulo.tech`** — decided 2026-08-11. Deploy pipeline must build with `REGISTRY_BASE_URL=https://marko-ui.saulo.tech/r` (local dev keeps localhost default for shadcn-CLI smoke tests). `(decision — made)`
- [x] **marko-ui exports: ship source** — no dist build; package already ships `.marko` source (compiled by the consumer), Vite transpiles `.ts` from node_modules, better IDE/agent DX. Document "requires a Marko-aware bundler" in README before publish. `(decision — made 2026-08-10)`

## Rebuilds (upgrade documented deviations)

- [x] **Migrate registry components to the `<machine-props>`/`<service>`/`<connect>` pattern** — done 2026-08-11 via 32-agent fleet + adversarial review + fix round: all 31 Zag components on the three-tag pattern with `MachineInput` typing, chained typed callbacks, splitProps native pass-through (data-table is TanStack-based, correctly keeps its own store integration). v1 docs deleted from component-authoring.md. `(code — done)`
- [x] **Investigate intermittent `bunx vitest run` hang** — resolved 2026-08-11: not a bug. Measured cause: CPU starvation under parallel-agent load (load avg ~30 on 10 cores; 9s stall was pre-run scheduler wait, ~90% idle-wait by `/usr/bin/time`; port/pool/teardown hypotheses disproven). 40+ consecutive clean runs, 9/9 passing. Config unchanged. Optional speedups: call `./node_modules/.bin/vitest` directly (skips ~1.5s proto-shim/bunx resolution). `(bug — closed)`

- [x] **drawer** — rebuilt 2026-08-11 on `@zag-js/drawer@1.43.0`: full 10-part anatomy (grabber/swipeArea/backdrop), snap points, logical swipeDirection, drag verified with real mouse in Playwright. NOTE: drawer machine carries position vars inside getContentProps()'s reactive style — no own style attr allowed on content/backdrop/positioner (documented in variants.ts). `(code — done)`
- [x] **toast** — rebuilt 2026-08-11 on Zag's toast group store: module store + group service + per-toast child services in `<for>`; pause-on-hover, stacking, targeted close, promise API all Playwright-verified. Cross-machine reactivity threaded via `groupRevision=service.rev`. `(code — done)`
- [ ] **navigation-menu** — partial parity (light-JS, no machine); revisit for viewport-style animated panels. `(code, decision on scope)`
- [ ] **scroll-area** — styled native scrollbars instead of synthetic draggable thumb; decide if parity matters. `(decision)`
- [x] **form** — grown into the full shadcn Field anatomy (10 parts), validation-library-agnostic. Zag has no form machine (verified), so this is a static pattern. Errors accept plain strings or Standard Schema issues; demo shows valibot on the server via `Run.POST({ form })` (progressive enhancement) plus native `ValidityState` on blur. See `agent/reports/form-validation.md`.
- [x] **chart** — built 2026-08-13 per the evaluation (`agent/reports/chart-evaluation.md`): d3 primitives (d3-scale/shape/array) with Marko emitting SVG, zero-JS SSR (charts in initial HTML; only tooltip hydrates). Tags: chart (container + ChartStyle equivalent), bar, line, area, pie, grid, x-axis, y-axis, tooltip, legend in `packages/registry/default/ui/chart/`. 100% shadcn theme parity: identical container classes, `data-slot="chart"`, per-series `--color-<key>` vars from `--chart-1..5` with light/`.dark` blocks, verbatim tooltip/legend class strings, recharts-compatible SVG class structure. 8 docs demos, registry item `r/chart.json` (12 files). `(code — done)`
- [ ] **Compound-tag DX** — researched 2026-08-11 (`agent/reports/compound-tag-dx.md`, spikes at /compound-spike): premise was wrong — api getters DO cross tag boundaries; the real gap is Marko 6 has NO context API. Three spikes verified: attr-tags (<@trigger>/<@panel>) WORK and are shorter than the array API; per-part tag files work but silently drop ARIA when a consumer forgets api= (disqualifying); $global is silently dead client-side. Recommendation: adopt attr-tags as primary v2 API, keep items= as sugar; combobox/command/tree-view stay array-primary. NEXT: user decision on adopting, then mechanical per-component rollout. `(decision — research done)`

## Blocks (port ALL shadcn v4 blocks — decided 2026-08-11)

Source: space clone `data/shadcn-ui/apps/v4/registry/new-york-v4/blocks/<name>/` (MIT; adapt to our components with attribution). Infra (gallery, chrome-free view routes, registry:block emission) landed in the docs-site branch with 3 proof blocks (login-01, dashboard-01, calendar-01 — the calendar block is ours, shadcn keeps calendars in a separate site section not the blocks registry). Remaining 26 to port, each = page.marko + sub-part tags + registry.meta.json + view route:

- [ ] **login-02..05** (4) — variants of the login screen (split panels, image side, muted background)
- [ ] **signup-01..05** (5) — signup screens mirroring the login variants
- [ ] **sidebar-01..16** (16) — the full sidebar showcase family (collapsible variants, submenus, calendars-in-sidebar, settings dialogs; heaviest reuse of our sidebar component's sub-parts)
- [ ] **charts blocks** — `registry/new-york-v4/charts/` has the chart demo set; UNBLOCKED 2026-08-13 — the chart component is built (see chart entry above)
- [ ] Also available for later: `examples/` (per-component demo variants — useful for the data-driven component docs pages) and `internal/` sink pages for QA.

`(code — fleet work; gallery "more coming" note stays until done)`

## Site polish (from agent/reports/site-diff-adoption.md, 2026-08-11)

- [ ] **Container utilities + full-width sweep** — root cause of the width gap: shadcn composes two shared container utilities (max 1400px → screen-2xl at 3xl) everywhere; we copy-pasted a fixed 1152px cap across 6+ files, leaving huge dead margins and a header floating narrower than the content. Add the utilities to globals, sweep all sections. MUST land after the current fleets (touches files they own). `(code — S/M, do first per the report's sequencing)`
- [ ] **In flight**: meta/OG/favicon + styled 404 (agent running); component pages into docs IA + home 16-card density (covered by the running docs-pages workflow + home agent).
- [ ] Remaining adoption items ranked in the report: command-menu search (M), GitHub stars in navbar (S), resizable block-preview viewer (S given our /view routes), prev/next pager everywhere, colors page (M), themes page (M). Skips (with reasons in report): charts gallery until chart components land, directory, examples page, base switcher, decorative skeleton rails.

## Tooling

- [ ] **marko-ui CLI** — inspired by (and improving on) Meta Astryx's CLI (https://astryx.atmeta.com/docs/cli, mechanics surveyed 2026-08-11). Their command surface: discovery (`search` ranked across components/docs/templates, `component` with `--props`/`--source`/`--list`, `docs` for tokens/theming, `template --skeleton`), setup (`init` — installs packages, theming, AND generates agent docs like AGENTS.md/CLAUDE.md; `swizzle` to copy component source in; `upgrade` with codemods), and health (`doctor` with CI exit codes). Their agent-oriented mechanics worth copying: `--json` typed envelopes with response-type discriminators, `--dense` token-efficient output, `--detail brief|compact|full`, a self-describing manifest call (every command + flags + types in one response), stable append-only error codes, and a programmatic API mirroring the CLI. Our angles to improve: we already have a live shadcn-format registry (so `add` can wrap/replace the shadcn CLI dependency and fix its React-registry pitfalls), our components ship as readable source (swizzle is nearly free), the CLI can share data with the planned `/docs/components/$name` pages + llms.txt generation (one data layer, many renderers — see `notes/plans/component-docs-pages.md`), and a future registry MCP server can be the same code behind `search`/`get`. Suggested MVP order: `init` (project setup + agent-docs generation) → `add` (registry install, no shadcn-CLI dependency) → `component`/`search` with `--dense`/`--json` → `doctor` → manifest + programmatic API → `upgrade` codemods later. `(design, then code)`

## Docs

- [x] **Data-driven component docs pages (`/docs/components/$name`)** — done 2026-08-11 (commit 79ff534): all 76 components on the dynamic route with full shadcn page anatomy (Copy Page + AI dropdown over per-component /md endpoints, Command/Manual installation with persisted package-manager switcher, Usage, Composition tree, per-example preview+code from extracted demo files, TS-compiler-extracted API tables). Page and /md render from one data module — no drift. `(code — done)`
- [ ] **Docs content audit (2026-08-11)** — pages that today's work likely outdated; anything unsure is listed. Verify each against current reality and rewrite where stale:
  - [ ] `/docs/creating-components` — written before: the full landmine catalog (controlled-prop `value=` vs `defaultX` — bit us FOUR times; bind-shorthand on value props only; top-level type family: bare `interface`, generics, recursive aliases; `<let>` union annotations → `=null as Type | null`; `key=` invalid → `<for by=>`; boolean aria-*/data-* need String(); `<html-script>` vs bare `<script>`; ambiguous `>` in attr expressions; prettier block-body arrows), the demo-per-file + `docs.ts` + manifest convention, drawer's machine-owned-style rule, toast's group-store architecture, the reserved example name `composition`, part-file naming (prefix collision → ToastToastItem class of bug). The guide should either absorb these or link a landmines page mirroring `notes/component-authoring.md`.
  - [ ] `/docs/zag-adapter/*` (5 pages) — predate the `connect.marko` eager-props reactivity dependency (computed-only controlled props), the `service.marko` tracking-script semantics as shipped, and normalize-props' `tabIndex`→`tabindex` mapping (the roving-focus fix). The reactivity-chain explanation must match today's actual code.
  - [ ] `/docs/installation` — verify against: `marko-ui` package name everywhere, `#lib/*` subpath imports + tsconfig paths in the consumer story, the npm-publish prerequisite (CLI aborts installs while `marko-ui` is unpublished — needs a callout until published), and the real `bunx shadcn add https://marko-ui.saulo.tech/r/<name>.json` flow.
  - [ ] `/docs/components-json` — alias documentation must cover both the consumer `@/` convention AND how our emitted files rewrite `#lib/*` to relative paths at install.
  - [ ] `/docs/theming` — verify the five style items (`style`, `style-zinc/slate/stone/gray`) with per-item cssVars are documented as the install path; the create page's Copy CSS flow deserves a mention.
  - [ ] `/docs/cli` — audit for aspirational claims: we have NO CLI yet (TODO item only); the page must describe the shadcn-CLI flow, not an imagined marko-ui CLI.
  - [ ] `/docs/dark-mode` — written today, but verify it shows the `<html-script>` no-flash pattern exactly as the layout implements it.
  - [ ] `/docs/changelog` — still a stub; either populate with the real 0.1.0 story (76 components, docs pages, blocks) or remove from the sidebar until real.
  - [ ] `packages/marko-ui/README` — must reflect: the rename, the final tag family (`machine-props`/`service`/`connect`/`portal`) with the getter/serialization model, the "requires a Marko-aware bundler" note, and the landmines relevant to adapter consumers. Unsure it was touched since the early port.
  - [ ] Repo root README — unsure one exists that reflects any of today: project positioning, live site link, install, contributor pointers (authoring guide location).
  - [ ] Blocks documentation — the gallery exists but no docs page explains what blocks are, how `registry:block` installs land multiple files, or the chrome-free preview convention. Unsure any prose covers it.
  - [ ] Contributor docs for the docs system itself — nothing documents the `src/demos/<name>/` + `docs.ts` + `build:demos`/`extract:api` pipeline, the `/md` endpoints, or per-prop JSDoc feeding the API tables (pairs with the Input-JSDoc fleet below).
  - [ ] `notes/MARKETING.md` — append the newly verified claims: 76 documented component pages with per-component AI markdown endpoints, data-driven docs (one data module → page + markdown), and the Astryx-comparable story.
- [ ] **Docs follow-ups from the fleet's findings**: annotate all 76 Input types with per-prop JSDoc (extractor supports it; accordion proves it — most tables have empty descriptions); llms.txt/AGENTS.md generation over the same data layer + registry MCP server + Astryx-style benchmark (research plan still at `notes/plans/component-docs-pages.md`); consider shadcn's `examples/` dir as extra demo variants. `(code/research)`

## Theming (shadcn parity — mechanism already compatible, tooling gaps below)

- [x] **`cssVars` in registry items** — done 2026-08-11: build-registry.ts parses globals.css (`:root`→light, `.dark`→dark, `@theme inline`→theme) and emits schema-shaped `cssVars` on the style item; values verified verbatim against globals.css. `(code — done)`
- [ ] **Base color variants** — only neutral shipped; generate zinc/slate/stone/gray globals.css variants (mechanical — sidebar/chart vars already present). `(code, decision on which to offer)`
- [x] **Docs theme switcher** — done 2026-08-11: no-flash `<html-script>` head script (localStorage + prefers-color-scheme) + `<theme-toggle/>` header button; Playwright-verified toggle + persistence across reload. `(code — done)`
- [x] **Animation parity check** — verified 2026-08-11, all three PASS, no changes needed. Toast: Zag-driven translate/scale/opacity transitions (shadcn's sonner has no Tailwind class list to diff — it bundles its own CSS). Drawer: all 14 tw-animate-css utilities used are present in 1.4.0; backdrop classes identical to shadcn vaul; content slide keyframes intentionally added on top of Zag's inline transform (documented in variants.ts). Scroll-area: no animations in either implementation. Browser-verified computed animation/transition properties. `(code — done)`

## Quality

- [ ] **Dev-mode controlled-prop warning** — the controlled-vs-default footgun (`open=` without `openChange` pins the machine; hit three sidebar blocks 2026-08-11) suggests machine components should warn in dev when a controlled prop arrives with no matching change handler. Candidate home: `<machine-props>` (it knows the picked props and the attached handlers). `(code — small)`
- [ ] **Boolean-attr serialization sweep** — Marko renders boolean `true` as a bare attribute: `aria-selected=(bool)` emits `aria-selected=""` (a11y-incorrect) and `data-active=(bool)` never matches `data-[active=true]:` Tailwind variants. Sweep docs-site tags + blocks for boolean-valued aria-*/data-* attrs and wrap in String(). `(code — small)`

- [x] **Per-component behavioral test suites** — done 2026-08-11: 61 WAI-ARIA APG keyboard tests (tabs, dialog focus trap, accordion, switch/checkbox/radio-group, select, slider) in packages/registry/tests/behavior/, Playwright driven from vitest node env. Found + fixed a real adapter bug: normalize-props now maps Zag's React-style `tabIndex` → `tabindex` (verbatim camelCase key caused remove-then-add on every update, blurring focus — broke keyboard nav on all roving-focus widgets). `(code — done)`
- [x] **Hydration-invariant helper** — done 2026-08-11 (design C-4): packages/registry/tests/helpers/hydration-invariant.ts — JS-off vs JS-on attribute diff over all [data-scope] elements, LCS pairing on scope/part, separate count-change whitelist. 33/33 components pass: 28 exact, 5 whitelisted with in-code mechanism comments (avatar image-load state, combobox/command floating-ui placement, carousel measured snap points). Dark-mode divergence untested (light pinned). `(code — done)`

## /create preview — skipped cards (missing primitives)

Cards from shadcn's real preview showcase pages that were NOT ported (no-approximations directive, 2026-08-13): each depends on a primitive `packages/registry/default/ui` does not have. Source root: `data/shadcn-ui/apps/v4/registry/bases/base/blocks/`. Unblock by building the missing primitive (ui/field composition; charts — see the chart entry above; canvas visualizers), then port verbatim.

- [ ] **preview-02/account-access** — `preview-02/cards/account-access.tsx` — missing: ui/field (Field, FieldGroup, FieldLabel)
- [ ] **preview-02/card-overview** — `preview-02/cards/card-overview.tsx` — missing: ui/chart + recharts (BarChart)
- [ ] **preview-02/contribution-history** — `preview-02/cards/contribution-history.tsx` — missing: ui/chart + recharts (BarChart)
- [ ] **preview-02/dividend-income** — `preview-02/cards/dividend-income.tsx` — missing: ui/chart + recharts (mini BarCharts)
- [ ] **preview-02/new-milestone** — `preview-02/cards/new-milestone.tsx` — missing: ui/field
- [ ] **preview-02/notification-settings** — `preview-02/cards/notification-settings.tsx` — missing: ui/field (Field, FieldContent, FieldDescription, FieldGroup, FieldLabel)
- [ ] **preview-02/payout-threshold** — `preview-02/cards/payout-threshold.tsx` — missing: ui/field
- [ ] **preview-02/power-usage** — `preview-02/cards/power-usage.tsx` — missing: ui/chart + recharts (BarChart)
- [ ] **preview-02/preferences** — `preview-02/cards/preferences.tsx` — missing: ui/field (incl. FieldSeparator)
- [ ] **preview-02/receiving-method** — `preview-02/cards/receiving-method.tsx` — missing: ui/field (incl. FieldSet/FieldLegend/FieldTitle rich radio options)
- [ ] **preview-02/savings-progress** — `preview-02/cards/savings-progress.tsx` — missing: ui/chart + recharts (PieChart donut with center Label)
- [ ] **preview-02/savings-targets** — `preview-02/cards/savings-targets.tsx` — missing: ui/field + ui/native-select
- [ ] **preview-02/social-links** — `preview-02/cards/social-links.tsx` — missing: ui/field
- [ ] **preview-02/stock-performance** — `preview-02/cards/stock-performance.tsx` — missing: ui/chart + recharts (AreaChart) + ui/field
- [ ] **preview-02/transfer-funds** — `preview-02/cards/transfer-funds.tsx` — missing: ui/field
- [ ] **preview/analytics-card** — `preview/cards/analytics-card.tsx` — missing: ui/chart + recharts (AreaChart)
- [ ] **preview/bar-chart-card** — `preview/cards/bar-chart-card.tsx` — missing: ui/chart + recharts (grouped BarChart + ChartLegend)
- [ ] **preview/book-appointment** — `preview/cards/book-appointment.tsx` — missing: ui/field
- [ ] **preview/codespaces-card** — `preview/cards/codespaces-card.tsx` — missing: ui/field (clone-URL fields in the Local tab)
- [ ] **preview/contributions-activity** — `preview/cards/contributions-activity.tsx` — missing: ui/field (incl. FieldSet/FieldLegend)
- [ ] **preview/feedback-form** — `preview/cards/feedback-form.tsx` — missing: ui/field + ui/native-select
- [ ] **preview/github-profile** — `preview/cards/github-profile.tsx` — missing: ui/field + ui/native-select
- [ ] **preview/icon-preview-grid** — `preview/cards/icon-preview-grid.tsx` — skipped: card content IS an icon-set grid (icon-set exclusion)
- [ ] **preview/invite-team** — `preview/cards/invite-team.tsx` — missing: ui/field + InputGroupButton usage tied to it
- [ ] **preview/live-waveform** — `preview/cards/live-waveform.tsx` — missing: canvas/animation component (Web Audio + canvas waveform)
- [ ] **preview/pie-chart-card** — `preview/cards/pie-chart-card.tsx` — missing: ui/chart + recharts (PieChart + ChartLegend)
- [ ] **preview/report-bug** — `preview/cards/report-bug.tsx` — missing: ui/field
- [ ] **preview/shipping-address** — `preview/cards/shipping-address.tsx` — missing: ui/field
- [ ] **preview/sleep-report** — `preview/cards/sleep-report.tsx` — missing: ui/chart + recharts (stacked BarChart)
- [ ] **preview/typography-specimen** — `preview/cards/typography-specimen.tsx` — missing: ui/field (dialog form body)
- [ ] **preview/ui-elements** — `preview/cards/ui-elements.tsx` — missing: ui/field (FieldGroup form section)
- [ ] **preview/visitors** — `preview/cards/visitors.tsx` — missing: ui/chart + recharts (AreaChart)

Not ported and NOT in the skip list (dead files upstream, never mounted by their index.tsx): `preview-02/cards/album-card.tsx`, `preview-02/cards/catalog-toolbar.tsx`, `preview/cards/bar-visualizer.tsx`, and the whole `preview-03/` directory.

`(code — unblocks as primitives land)`

## Upstream

- [ ] **Report Zag cascade-select init bug** — verified 2026-08-11 in @zag-js/cascade-select@1.43.0 machine source: `selectedItems` context seeds `defaultValue: []` unconditionally and is populated only by the `set.value` action (interactive selection), never at machine init — so `valueAsString` is empty on first mount even with a correct `defaultValue`. Our component works around it by deriving the trigger label from `api().value` (which IS seeded correctly). Worth an upstream issue/PR to chanan/zag. `(ops — upstream report)`

## Release (user)

- [ ] Push repo to GitHub (no remote configured); archive `svallory/marko-ui-components` with pointer README. `(ops)`
- [ ] `npm publish marko-ui@0.1.0` + `npm deprecate marko-ui@0.0.2 "Marko 5/Zag 0.x era — unrelated to 0.1+"`. `(ops)`
- [ ] Deploy docs app + registry; CI: `bun run build:registry && git diff --exit-code` + shadcn-CLI smoke test. `(ops)`
