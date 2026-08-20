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
- [x] **field** (formerly misfiled as **form**; extracted to `ui/field/` + new `ui/native-select/` on 2026-08-13) — grown into the full shadcn Field anatomy (10 parts), validation-library-agnostic. Zag has no form machine (verified), so this is a static pattern. Errors accept plain strings or Standard Schema issues; demo shows valibot on the server via `Run.POST({ form })` (progressive enhancement) plus native `ValidityState` on blur. See `agent/reports/form-validation.md`.
- [x] **chart** — built 2026-08-13 per the evaluation (`agent/reports/chart-evaluation.md`): d3 primitives (d3-scale/shape/array) with Marko emitting SVG, zero-JS SSR (charts in initial HTML; only tooltip hydrates). Tags: chart (container + ChartStyle equivalent), bar, line, area, pie, grid, x-axis, y-axis, tooltip, legend in `packages/shadcn/ui/chart/`. 100% shadcn theme parity: identical container classes, `data-slot="chart"`, per-series `--color-<key>` vars from `--chart-1..5` with light/`.dark` blocks, verbatim tooltip/legend class strings, recharts-compatible SVG class structure. 8 docs demos, registry item `r/chart.json` (12 files). `(code — done)`
- [x] **Compound-tag DX** — researched 2026-08-11 (`agent/reports/compound-tag-dx.md`), ADOPTED 2026-08-12/13 (branch `compound-attr-tags`, PR #1): attr-tag compound API (Variant A) added to 13 components (tabs, accordion, carousel, cascade-select [flat only], context-menu, dropdown-menu, menubar/menu, listbox, marquee, navigation-menu, radio-group, select, toggle-group), `items=` kept as sugar; combobox/command/tree-view stay array-primary by design. Order-sensitive components use a SINGLE attr-tag name with a `type` discriminant (cross-name attr-tag order is unrecoverable in Marko). 5 review rounds; behavior suite covers ordering + precedence + hybrid contracts. Pattern documented in /docs/creating-components §5 and notes/component-authoring.md. CLEANUP CANDIDATE: `apps/docs/src/{routes,tags}/compound-spike/` spikes are now historical — delete or keep as reference. `(code — done)`

## Blocks (port ALL shadcn v4 blocks — decided 2026-08-11)

Source: space clone `data/shadcn-ui/apps/v4/registry/new-york-v4/blocks/<name>/` (MIT; adapt to our components with attribution). Infra (gallery, chrome-free view routes, registry:block emission) landed in the docs-site branch with 3 proof blocks (login-01, dashboard-01, calendar-01 — the calendar block is ours, shadcn keeps calendars in a separate site section not the blocks registry). The remaining 25 landed (verify: `packages/shadcn/blocks/` and `apps/docs/src/routes/blocks/view/`), each = page.marko + sub-part tags + registry.meta.json + view route:

- [x] **login-02..05** (4) — variants of the login screen (split panels, image side, muted background)
- [x] **signup-01..05** (5) — signup screens mirroring the login variants
- [x] **sidebar-01..16** (16) — the full sidebar showcase family (collapsible variants, submenus, calendars-in-sidebar, settings dialogs; heaviest reuse of our sidebar component's sub-parts)
- [ ] **charts blocks** — `registry/new-york-v4/charts/` has the chart demo set; UNBLOCKED 2026-08-13 — the chart component is built (see chart entry above)
- [ ] Also available for later: `examples/` (per-component demo variants — useful for the data-driven component docs pages) and `internal/` sink pages for QA.

`(code — fleet work; gallery "more coming" note stays until done)`

## Blocks docs-site machinery — faithful port (2026-08-13, branch blocks-parity)

Replaced the approximation (static card + fake terminal-dot chrome, no code
view, no viewport switcher) with a faithful port of shadcn's block-viewer.tsx
/ blocks-nav.tsx / page-header.tsx / page-nav.tsx / block-display.tsx, per
`.claude/skills/port-shadcn-resource/SKILL.md`. New: `apps/docs/src/tags/blocks/
block-viewer.marko` (toolbar with Preview/Code tabs, resizable Desktop/Tablet/
Mobile viewport switcher via `@zag-js/splitter`'s `setSizes`, file tree +
code panel, install-command/copy, mobile fallback), `block-viewer-tree-node.marko`
(recursive file/folder tree on `Collapsible`), `apps/docs/scripts/
build-blocks-manifest.ts` (generates the committed `src/lib/blocks-manifest.ts`
— each block's `files[]` + tree, inlined at generation time so there's no
request-time filesystem read; mirrors `build-demos-manifest.ts`'s established
pattern and the exact bug it was created to avoid, see commit 55f21c4).
Fixed the pre-existing `/blocks/view/<name>` title bug (`site-meta.ts` had no
`ROUTE_META` entries for that path, so every one of the 28 pages showed
"Page Not Found — marko-ui"): titles/descriptions are now derived from
`BLOCKS` in `blocks-list.ts`, mirroring how shadcn's `/view/[style]/[name]`
titles itself off the registry item.

Skips / deviations (rule 5 — no approximations, log instead):
- **Open in v0** — visible but disabled button (`title="v0 is not available
  for marko-ui"`). No v0 integration exists for this project; a functioning
  look-alike would silently point at someone else's product. Real shadcn:
  `components/open-in-v0-button.tsx`.
- **Mobile screenshot fallback** — shadcn's `BlockViewerMobile` shows a static
  `<name>-{light,dark}.png` screenshot on narrow viewports unless a block's
  registry `meta.mobile === "component"` (none of ours set it either). We
  don't generate those PNGs, so mobile always renders the live iframe
  instead — strictly more functional than a missing image, not a fake
  stand-in, but a deviation from the source worth naming.
- **No syntax highlighting in the code panel** — plain `<pre><code>`, same as
  every other code block on this site (`tags/docs/code-block.marko`'s header
  comment explains why: no rehype-highlight equivalent here). Pre-existing
  project decision, not introduced by this port.
- **`no-scrollbar` utility class is a no-op** — used on the code panel and
  preview iframes (matching shadcn's own class name) but, like every other
  existing usage of this class in the codebase (`create/item-explorer.marko`,
  `create/customizer.marko`, etc.), there's no `@utility no-scrollbar`
  definition anywhere, so native scrollbars still show. Pre-existing gap,
  left consistent with the rest of the app rather than fixed unprompted.
- **`3xl:fixed:` responsive variants dropped** from `container-wrapper`/
  `section-soft` — shadcn's `theme-container`/wide-layout toggle machinery
  (a separate `fixed`/`3xl` custom-variant pair) isn't set up in this repo;
  the utilities were ported without that variant, which is invisible at our
  supported breakpoints.

`(code — done; verified production build + live browser, see agent/reports/blocks-parity.md if written)`

## /charts — skipped (2026-08-13, branch charts-pages)

Ported `/charts`, `/charts/area`, `/charts/bar`, `/charts/line`, `/charts/pie`
in full (41/41 demos across the 4 supported types — see commit history on
`charts-pages`). Not ported, with reasons:

- **Radar charts (14 demos)** — shadcn source `data/shadcn-ui/apps/v4/
  registry/new-york-v4/charts/chart-radar-*.tsx`. Missing primitive: no
  radar-chart component (`packages/shadcn/ui/chart/` has no
  polar-grid/radar geometry at all — would need a whole new primitive, not a
  small extension). `/charts/radar` route not created; charts-nav.marko
  omits the "Radar Charts" link (a dead link would be worse than omitting).
- **Radial charts (6 demos)** — shadcn source `.../chart-radial-*.tsx`.
  Missing primitive: no radial-bar chart component (same reasoning as
  radar — a distinct polar-coordinate primitive we don't have). `/charts/
  radial` route not created; charts-nav.marko omits the "Radial Charts" link.
- **Tooltip gallery (9 demos)** — shadcn source `.../chart-tooltip-*.tsx`.
  Technically portable with our EXISTING bar.marko/tooltip.marko (no new
  primitive needed) but explicitly OUT OF SCOPE for this task (only area/
  bar/line/pie were requested). Not a missing-primitive skip — a scope
  boundary. `/charts/tooltip` route not created; charts-nav.marko omits the
  "Tooltips" link. Could be picked up later as a 5th gallery page.

Within the 4 supported types, one approximation worth flagging (not a skip —
the demo IS ported, just not pixel-for-pixel on one interaction detail):

- **chart-pie-stacked** (`apps/docs/src/demos/charts-gallery/pie/
  chart-pie-stacked.marko`) — two concentric donut rings via pie.marko's new
  `rings` input. Ring geometry matches shadcn's version exactly. The ONE
  divergence: shadcn's tooltip is a single Recharts tooltip context shared
  across both `<Pie>` elements, so hovering either ring shows a synced
  cross-ring tooltip. Our pie.marko tracks one `activeIndex` hover state per
  `<PieChart>` instance (by design — it has no concept of "which ring" a
  pointer event originated from), so the tooltip here only reflects the
  hovered ring's own sector, not both rings at once. Documented inline in
  the demo file. Judged not worth a deeper primitive rework for one demo's
  tooltip edge case.

`(code — done; verified production build + live browser under real pointer input)`

## Site polish (from agent/reports/site-diff-adoption.md, 2026-08-11)

- [ ] **Container utilities + full-width sweep** — root cause of the width gap: shadcn composes two shared container utilities (max 1400px → screen-2xl at 3xl) everywhere; we copy-pasted a fixed 1152px cap across 6+ files, leaving huge dead margins and a header floating narrower than the content. Add the utilities to globals, sweep all sections. MUST land after the current fleets (touches files they own). `(code — S/M, do first per the report's sequencing)`
- [ ] **In flight**: meta/OG/favicon + styled 404 (agent running); component pages into docs IA + home 16-card density (covered by the running docs-pages workflow + home agent).
- [ ] Remaining adoption items ranked in the report: command-menu search (M), GitHub stars in navbar (S), resizable block-preview viewer (S given our /view routes), prev/next pager everywhere, colors page (M), themes page (M). Skips (with reasons in report): ~~charts gallery until chart components land~~ (done 2026-08-13, see "/charts — skipped" section above), ~~directory~~ (done 2026-08-20, see "/docs/directory" section below), examples page, base switcher, decorative skeleton rails.

## /docs/directory — ported (2026-08-20, branch feat/directory-ecosystem)

Ported from `content/docs/(root)/directory.mdx` + `components/directory-{list,search,add-button}.tsx` + `hooks/use-search-registry.ts`. Data source: `apps/docs/src/data/directory.json` (also feeds `/r/registries.json` via `tooling/build-registry.ts`). Content adapted to marko-ui: our CLI commands, our doc links, plus a marko-ui-only "Wanted Libraries" section.

Skips / deviations (rule 5 — no approximations, log instead):
- **No mount-gated skeleton** — shadcn renders `DirectoryListSkeleton` until nuqs mounts (client-only URL state). We SSR the real page-1 list and read `?q=`/`?page=` in onMount, so the skeleton state never exists. `DirectoryListSkeleton` intentionally not ported.
- **Mobile add-flow uses the same Dialog** — shadcn swaps in a Drawer under `useIsMobile`; we render the Dialog at every width (`components/directory-add-button.tsx` Drawer branch not ported).
- **Add-dialog tabs are page-local reactive state**, not shadcn's Tabs+Tooltip composition and not our shared `<package-manager-switcher>` — the switcher binds panels imperatively in onMount and its shiki `<await>` panels don't exist yet when mounted inside a client-opened dialog (tabs update, panels never swap; hit 2026-08-20). Same `marko-ui.packageManager` localStorage key, so the choice stays synced site-wide.
- **Icons are lucide via our Icon component** (ArrowUpRight, Plus, ChevronLeft/Right, Check, Copy) where shadcn's page uses @tabler — repo-wide icon strategy decision (option a), glyphs near-identical.
- **Pagination is anchors ported verbatim from directory-list.tsx** (getPageNumbers logic included) but with only 1 registry listed the `totalPages > 1` branch is unexercised in the live page — re-verify when the directory grows past 10 entries.
- **Documentation LinkedCards** point at `/docs/cli` and `/docs/contributing-a-library` (2 cards, not shadcn's 6 registry-docs cards — those pages don't exist here).

## OSS readiness (before going public)

- [x] **LICENSE file** — done 2026-08-20: added root `LICENSE` (MIT, holder: Saulo Vallory) plus copies at `packages/marko-ui/LICENSE` and `packages/shadcn/LICENSE` (npm/bun do not auto-include a root LICENSE for workspace subpackages; verified both tarballs via `bun pm pack --dry-run`).
- [ ] **CONTRIBUTING.md** — how to clone, the toolchain (proto), build (`bun run build:styles` etc.), run tests, the space/worktree layout, and the commit convention.
- [ ] **CODE_OF_CONDUCT.md**, **SECURITY.md**, issue/PR templates (`.github/`).
- [ ] **Funding** — `.github/FUNDING.yml` pointing donations to `svallory` (GitHub Sponsors / whatever platform). Also surface in README.
- [ ] **Formatter/linter decision — biome vs dprint (+ prettier today?).** Repo currently uses `prettier` (root `format` script). Decide: biome (lint+format, fast, one tool) vs dprint (format-only, plugin-based, handles more file types). Marko files are the wrinkle — neither formats `.marko` natively; check current `.marko` formatting story before switching. Pick one, configure, wire into `precommit`/CI, and run it across the repo once.
- [ ] **README pass for a public audience** — badges, quickstart, the dual-distribution explanation, links to docs site. Also fix the stale `packages/marko-ui` description (that dir is now an empty node_modules shell; the adapter is the published `marko-zag`).
- [ ] **Repo hygiene** — `.editorconfig`, a `.nvmrc`/proto pin (see below), dependabot/renovate config, the `agent/` and `notes/`/`data/` local-only dirs excluded from what the public sees if they are not meant to ship.

## proto + moon (toolchain + task runner) — DECISION PENDING

Both are installed globally (`~/.proto`) but NEITHER is configured in this repo; the monorepo runs on bun workspaces + `--filter` today.

- [x] **proto: adopt now.** A `.prototools` pinning bun (and node, since the Dockerfile uses `oven/bun`) so every contributor and CI gets identical tool versions. Cheap, unambiguously good for a public repo. (Being done alongside the libs/ restructure.)
- [ ] **moon: DECISION PENDING — do NOT adopt under deadline.** Reasoning (2026-08-18): adopting a task runner is a real commitment (task graph, caching, CI rewrite) and doing it *during* the libs/shadcn + tooling/ restructure would mean two failures are indistinguishable. bun workspaces handle `packages/*`/`libs/*`/`tooling/*`/`apps/*` fine and are legible to contributors, so a public repo does not *need* moon. Revisit after the restructure lands and is green: does the task graph (build:styles → build:styles:css → build:core → build:registry, plus per-lib fan-out when a 2nd lib exists) justify moon's caching? If yes, adopt moon and the folder layout together in one deliberate change, not bolted onto other work.

## Tooling

- [ ] **marko-ui CLI** — inspired by (and improving on) Meta Astryx's CLI (https://astryx.atmeta.com/docs/cli, mechanics surveyed 2026-08-11). Their command surface: discovery (`search` ranked across components/docs/templates, `component` with `--props`/`--source`/`--list`, `docs` for tokens/theming, `template --skeleton`), setup (`init` — installs packages, theming, AND generates agent docs like AGENTS.md/CLAUDE.md; `swizzle` to copy component source in; `upgrade` with codemods), and health (`doctor` with CI exit codes). Their agent-oriented mechanics worth copying: `--json` typed envelopes with response-type discriminators, `--dense` token-efficient output, `--detail brief|compact|full`, a self-describing manifest call (every command + flags + types in one response), stable append-only error codes, and a programmatic API mirroring the CLI. Our angles to improve: we already have a live shadcn-format registry (so `add` can wrap/replace the shadcn CLI dependency and fix its React-registry pitfalls), our components ship as readable source (swizzle is nearly free), the CLI can share data with the planned `/docs/components/$name` pages + llms.txt generation (one data layer, many renderers — see `notes/plans/component-docs-pages.md`), and a future registry MCP server can be the same code behind `search`/`get`. Suggested MVP order: `init` (project setup + agent-docs generation) → `add` (registry install, no shadcn-CLI dependency) → `component`/`search` with `--dense`/`--json` → `doctor` → manifest + programmatic API → `upgrade` codemods later. DESIGN DONE 2026-08-14 (`notes/plans/cli.md`); P0+P1 CODE DONE 2026-08-15 on `feat/cli` (`packages/cli`, @marko-ui/cli): init/add/diff/show/search/status/doctor/manifest/registry list-add-remove-validate, clack prompts, target-marker enforcement, registries.json+index.json emission, generated /docs/cli reference (build:cli-manifest), 943 tests, e2e-verified against local registry. Decisions: `notes/plans/cli-implementation-log.md`; publish-gated items in the 'CLI — blocked' section. REMAINING (P2/P3): --dense/--detail + envelopes on forked commands via api-layer refactor, docs command, agents sync, preset family, mcp serve, update+codemods. `(code — P0/P1 done)`

## CLI — remaining gates (updated 2026-08-17)

Adapter renamed to the published `marko-zag` package (295 imports swept, packages/marko-ui deleted); e2e install verified green (init -b zinc dialog: real npm install, zinc theme, doctor 8/8).

- [x] ~~Publish `marko-zag@1.0.1`~~ — superseded by events: marko-zag is at 1.2.0 on npm (2026-08-19; script-lang, typed MarkoService, full-NativeTags PropTypes), pinned `^1.2.0` here; the temporary `overrides.marko-zag: file:` is gone from the root package.json (verified 2026-08-20).
- [x] Real adapter dependency install — done 2026-08-17 (marko-zag on npm; graceful-degrade warning path kept for other failures).
- [x] e2e install verification — done 2026-08-17.
- [ ] **`/docs/installation` rewrite** — drop the "unpublished" callout, document the real `marko-ui init` flow AND the new import path (`@marko-ui/core` — hook-class components + precompiled style CSS layers; `marko-ui eject` to switch to source) (Docs-audit item). Per-style `@marko-ui/<style>` packages are DROPPED (superseded by `notes/plans/dual-distribution-plan.md` §1); do not resurrect that model.
- [x] ~~Publish the style packages~~ — DROPPED. The per-style-package model (`build-style-packages.ts`, 9 `@marko-ui/<style>` packages) is superseded by dual distribution (`notes/plans/dual-distribution-plan.md` §1, §4b). The script read the deleted `packages/registry/styles/` path (that whole package is gone; the registry now lives at `packages/shadcn/`) and was unreferenced anywhere in the repo; deleted 2026-08-17 rather than repointed, since no per-style artifact is needed under the new model.
- [x] **Claim `marko-ui` on npm for the CLI** — package renamed `@marko-ui/cli` → `marko-ui` (`packages/cli` → `packages/marko-ui`) 2026-08-18; docs already print `bunx marko-ui add badge`. Not yet published.
- [ ] **File the language-tools issue** — draft ready at `notes/upstream-issue-language-tools-pascalcase-taglib.md` (PascalCase taglib tags: runtime resolves, type-gen emits false TS2304; our tags.d.ts shim works around it).
- [ ] **Registry deploy pairing** — `registries.json` + item URLs bake `REGISTRY_BASE_URL` at build time; production deploy must build with `REGISTRY_BASE_URL=https://marko-ui.saulo.tech/r` or installed `registryDependencies` point at localhost.
- [ ] **Investigate AST-based `.marko` transforms (replace the regex rewriter)** — our style/import rewriting is textual (`tooling/transform-marko.ts`, `apply-style-map.ts`) because `ts-morph` cannot parse `.marko`. That has already cost us real bugs: `CLASS_ATTR_REGEX` matched only `class=`, silently missing `class:` object properties (menubar) and `*Class=` props (sonner), shipping unstyled components in all 8 styles until fixed 2026-08-18. Every new syntax shape must be enumerated by hand. Investigate importing Marko's own compiler or a lower-level package (`@marko/compiler`'s parse/walk API, or `htmljs-parser` which Marko builds on) to walk a real AST instead. Compare against shadcn, which ships 14 `ts-morph` transformers for exactly this class of work. Prize: structurally-impossible-to-miss attribute rewriting. Risk: compiler API stability across Marko versions (we are pinned to 6.3.34), and build-time cost. Context: `~/work/mu-cli/framework-coupling-explained.md` §2.
- [ ] **`~/`-prefixed registry targets ignore `aliases`** — `resolveFilePath` (`packages/marko-ui/src/utils/updaters/update-files.ts:340-342`) resolves a `~/`-prefixed `target` against the project ROOT and never consults `config.aliases`; the alias branch below only runs for non-`~/` targets. So `utils`' target `~/src/lib/utils.ts` is written there verbatim even when `aliases.utils` points elsewhere (e.g. `@/helpers/cn`), while components still import via the alias — a broken import rather than a misplaced file. Existing files are NOT clobbered (identical → skipped, differing → prompt defaulting to no), so this is a correctness/DX bug, not data loss. Inherited from shadcn's CLI; verify upstream behaviour before diverging.
- [ ] **Publish the shadcn-CLI-fork diff as a porting guide** — our `packages/marko-ui` is a fork of shadcn's CLI; the diff between them IS the answer to "how do I port this CLI to my framework." Every shadcn port (Svelte, Vue, Angular, Solid) independently rebuilt or forked their own, so this is a real gap. Cheap: most of the community value of a generic multi-framework CLI at near-zero maintenance cost, and no extraction needed. Research and reasoning: `~/work/mu-cli/` (`shadcn-cli-landscape.md`, `framework-coupling-explained.md`). Decision 2026-08-18: do NOT extract the CLI; write the guide instead.
- [ ] **CLI contract-drift verification pass** (arch-review 2026-08-20 finding 4, sourced from `notes/plans/cli-architecture-review.md` 2026-08-16; NOT re-verified live — verify each before fixing): manifest advertises exit codes 2/4 that no code path returns; `target: "marko"` enforced in some resolution paths but not doctor; ~~two diff renderers with opposite polarity~~ corrected 2026-08-20 — two diff renderers exist (`diff.ts` and `add --diff`'s dry-run-formatter), but polarity matches: both use old=local file, new=registry version (verified `packages/marko-ui/src/commands/diff.ts:106-109`, which says "Same polarity as `add --diff`"). Also re-judge `src/registry/api.ts:160`'s `npx shadcn build` suggestion — plausibly correct for shadcn-format registry AUTHORS (upstream build tool), unlike the two consumer-facing `npx shadcn init` suggestions in `errors.ts` fixed 2026-08-20.
- [ ] **"Open in v0" button** — shadcn ships one per component/block; we can have our own. Refs: https://ui.shadcn.com/docs/registry/open-in-v0 and https://v0.app/chat/button. Note v0 consumes a registry item URL, so this depends on the registry being publicly deployed (see the deploy-pairing item above). Not yet investigated — read the refs before designing.

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

- [x] **Land the `.marko` typecheck gate** — DONE 2026-08-19/20. Full arc: 973 errors (marko-zag 1.0.1) → 87 (1.1.0) → 9 (1.1.1) → **0** (1.2.0's full-NativeTags PropTypes + 9 in-repo fixes: listbox label-on-div, tooltip span root, icon attr surface, menu-button anchor variant, color-picker attr placement, combobox null guard, checkbox/switch TS2589 annotations). `"ui/**/*.marko"` is in `packages/shadcn/tsconfig.json` `include` permanently and `bun run check` is green with every component covered — keep it that way (no casts/@ts-ignore; a new error is a defect in the change that introduced it). `(code — done)`

- [x] **~~Delete leftover scratch tests~~ `packages/shadcn/tests/tmp-{dump,mergeprops}.test.ts` — gone (verified absent 2026-08-20); check is green.** Original finding: — they make `bun run check` RED right now** — found 2026-08-19. Both are untracked (`git status` shows `??`), clearly throwaway debugging aids: `tmp-` prefixed, they `writeFileSync` to `/tmp/tg.html` and `/tmp/tv.html` and `console.log` raw tag dumps. They are NOT harmless: they statically `import TreeView from "../ui/tree-view/tree-view.marko"`, and because `tests/**/*.ts` IS in `packages/shadcn/tsconfig.json`'s `include`, that import drags `tree-view.marko` into the project graph **even with no `.marko` glob**. Net effect with the config exactly as committed: **7 errors** — 5 × TS2345 in `ui/tree-view/tree-view.marko` (the same upstream `marko-zag` div-prop defect described above, leaking in through this one back door) and 2 × TS6307 on the scratch files themselves (`is not listed within the file list of project`, since the `.marko` files they import are not in `include`). So the assumption that the shadcn check is currently green is **false** until these two files are removed. Left in place here only because they are another session's untracked working files — whoever owns them should delete them. `(cleanup — trivial)`

- [ ] **`apps/docs` typecheck gate — 9,535 errors, structurally unlistable** — measured 2026-08-19 with the config AS-IS (`include: ["src/**/*.ts", ".marko-run/routes.d.ts"]`, no `.marko` glob, no changes made). Recorded here only so the scale is known; **not** in scope for the shadcn gate above and deliberately untouched.

  By code: **4,115 × TS6307**, 1,629 × TS2353, 1,150 × TS2749, 932 × TS7006, 589 × TS2322, 574 × TS2307, 155 × TS7031, 141 × TS2339, 91 × TS2345, 87 × TS2532 (+ tail).

  The single largest bucket, TS6307 (43%), is **an include problem, not code defects** — verbatim: `File '…/src/demos/charts-gallery/_icons/trending-down.marko' is not listed within the file list of project '…/apps/docs/tsconfig.json'. Projects must list all files or use an 'include' pattern.` Every `.marko` file reached only by import from an included `.ts` trips it because no `.marko` glob is in `include`. So the config that makes the count *look* smaller is itself generating ~4.1k of the errors; adding a `.marko` glob here would clear the TS6307 bucket while exposing however many real errors are currently invisible behind it. The 1,150 TS2749 (`'Input' refers to a value, but is being used as a type here`) and 574 TS2307 (unresolved `?raw` imports and cross-package `blocks/*.marko` specifiers) look like further systematic/config issues rather than per-file bugs. Needs its own scoped pass — do not fold into the shadcn gate. `(ops — investigation)`

- [ ] **Dangling architecture-decision sources** (arch-review 2026-08-20 finding 3) — `notes/css-architecture.md` and the space memory index cite `notes/plans/dual-distribution-plan.md`, `spike-3a-verdict.md`, and `restructure-shadcn-packages.md` as sources of truth; none exist and none ever existed in this worktree's git history. TODO.md itself cites `dual-distribution-plan.md` §1/§4b twice (CLI section). Either recover them from another worktree/session or rewrite the citing passages to carry the decisions inline — an architecture record that cites nonexistent documents is the same failure class as a typecheck that checks nothing. `(docs — investigation)`
- [ ] **Dev-mode controlled-prop warning** — the controlled-vs-default footgun (`open=` without `openChange` pins the machine; hit three sidebar blocks 2026-08-11) suggests machine components should warn in dev when a controlled prop arrives with no matching change handler. Candidate home: `<machine-props>` (it knows the picked props and the attached handlers). `(code — small)`
- [ ] **Boolean-attr serialization sweep** — Marko renders boolean `true` as a bare attribute: `aria-selected=(bool)` emits `aria-selected=""` (a11y-incorrect) and `data-active=(bool)` never matches `data-[active=true]:` Tailwind variants. Sweep docs-site tags + blocks for boolean-valued aria-*/data-* attrs and wrap in String(). `(code — small)`
- [ ] **Investigate `marko-run preview` stale-serve caching** — three separate times on 2026-08-13 a `marko-run preview` process served an outdated build after `bun run build` wrote a fresh `dist/` (cost ~30min chasing a phantom "field not documented" bug; also produced false failures for two review agents). Repro attempt: build, preview, rebuild with a visible change, curl — does preview hold the old bundle in memory / serve from its own cache dir? If confirmed, file upstream at marko-js/run. Until then the working convention is `PORT=<p> node dist/index.mjs` for all verification (already encoded in the port-shadcn-resource skill). `(ops — investigation)`
- [ ] **Mobile layout parity for /create + /typeset customizer (toolbar/article overlap at narrow viewports)** — shadcn has NO overlap on mobile by construction: `data-slot="designer"` is `flex-col` (customizer stacks BELOW the preview as a full-width strip) and only becomes the side column at `md:flex-row-reverse`; the customizer Card itself carries mobile variants we did not fully port — `CardHeader className="hidden … md:flex"`, `FieldGroup className="flex-row gap-2.5 … md:flex-col"` (horizontal scroll strip on mobile via `overflow-x-auto overflow-y-hidden md:overflow-y-auto`), `CardFooter md:flex-col`, and `w-full … md:w-(--customizer-width)`. Audit our customizer.marko (+ typeset's) against shadcn's customizer.tsx mobile classes and port the missing responsive variants verbatim; verify with a real viewport resize (browser tooling could not resize on 2026-08-13 — use Playwright viewport option). `(code)`

- [x] **Per-component behavioral test suites** — done 2026-08-11: 61 WAI-ARIA APG keyboard tests (tabs, dialog focus trap, accordion, switch/checkbox/radio-group, select, slider) in packages/shadcn/tests/behavior/, Playwright driven from vitest node env. Found + fixed a real adapter bug: normalize-props now maps Zag's React-style `tabIndex` → `tabindex` (verbatim camelCase key caused remove-then-add on every update, blurring focus — broke keyboard nav on all roving-focus widgets). `(code — done)`
- [x] **Hydration-invariant helper** — done 2026-08-11 (design C-4): packages/shadcn/tests/helpers/hydration-invariant.ts — JS-off vs JS-on attribute diff over all [data-scope] elements, LCS pairing on scope/part, separate count-change whitelist. 33/33 components pass: 28 exact, 5 whitelisted with in-code mechanism comments (avatar image-load state, combobox/command floating-ui placement, carousel measured snap points). Dark-mode divergence untested (light pinned). `(code — done)`

## /create preview — excluded cards

All previously skipped cards were ported 2026-08-13 (ui/field, ui/native-select, ui/chart, and ui/icon primitives landed).

- [x] **Icon strategy decision + icon-preview-grid unblock** — done 2026-08-13 (branch `icon-libraries`): chose option (a) from the original decision list — shadcn's own generated-per-library-map approach, ported mechanically. `tooling/build-icons.ts` generates `packages/shadcn/ui/icon/__{lucide,tabler,phosphor,remixicon,hugeicons}__.ts` (abstract shadcn icon name -> raw SVG inner-markup, or for hugeicons an `IconNode` tuple array) from framework-agnostic SVG/data packages (`lucide-static`, `@tabler/icons`, `@phosphor-icons/core`, `remixicon`, `@hugeicons/core-free-icons` — no React packages), vendoring shadcn's `public/r/icons/index.json` abstract-name map (191 names) as `icon-mapping.json`. Coverage matches shadcn's own totals exactly: lucide 191/191, tabler/phosphor/remixicon/hugeicons 186/186 each. New `ui/icon/icon.marko` renders (name, library) SSR-first (`$!{}`, never client innerHTML for its own render). `preview-blocks/lib/icon.marko` (the old ~65-glyph lucide-only map) now delegates to it, reading `iconLibrary` from `$global.url` at SSR time; `icon-placeholder.marko` (dead code, unused, kept for shadcn API parity) does the same. `preview-page-2/cards/icon-preview-grid.marko` is the direct port of shadcn's card, mounted in `preview-page-2/index.marko` at the exact spot (leading column 2) shadcn's `registry/bases/base/blocks/preview/index.tsx` has it. Live icon-library switching (picker change without an iframe reload) is a client-side DOM patch in `routes/create/preview/+page.marko`'s `applyIconLibrary`, walking `[data-icon-name]` markers and reusing the same generated data via `ui/icon/client-swap.ts` (lazy `import()` per library, mirroring shadcn's `create-icon-loader.tsx`) — the iframe-preview pattern (postMessage-only sync, no src reload) already established for theme/font params. `(code — done)`
- [ ] **Icon bundle code-splitting doesn't land as separate network chunks** — found during the icon-strategy work: `ui/icon/client-swap.ts`'s per-library `import()` calls (intended to mirror shadcn's `React.lazy`/webpack per-library chunking) get inlined by this app's Vite/Rolldown build into the SAME per-route client chunk as the importer (`Promise.resolve().then(() => module)`, confirmed via built-output inspection, not a config oversight — no `manualChunks`/`inlineDynamicImports` is set anywhere in this repo). Net effect: `/create/preview`'s client bundle ships all 5 icon libraries' data (~360KB combined source, ~101KB gzipped) in one chunk regardless of which library is active, same as if the dynamic imports weren't there — though resolve.ts's SSR-only static imports are still correctly excluded from the client graph, and the runtime API only resolves/uses the map it's asked for. Investigate: explicit `build.rollupOptions.output.manualChunks` in `apps/docs/vite.config.ts`, or file upstream against `@marko/run`/rolldown-vite if their route-bundling model doesn't support per-route lazy sub-chunks at all. `(code/ops — investigation)`
- [x] **Port bar-visualizer and mount it on preview-page-3** (decided 2026-08-13, done 2026-08-14): dead upstream (shadcn ships `preview/cards/bar-visualizer.tsx`/`registry/bases/{base,radix,aria}/blocks/preview/cards/bar-visualizer.tsx` but never mounts it in any base's `preview/index.tsx`), so it can't live on pages 1/2 without breaking parity — mounted on OUR page (preview-page-3) instead, column 2 (after topic-tags). `preview-page-3/cards/bar-visualizer.marko`: div-bars (not canvas — source itself renders `<div>` bars, not a canvas) + two independent `requestAnimationFrame` loops on a shared mutable state object (fake sine+noise volume-band signal, and the bar-highlight sequencer per `state`), mirroring live-waveform's established `<let>`/`<const>` state-object/`<lifecycle>`/`<script>`-restart pattern. Kept only the `demo=true` code path (the card that mounts it never passes a real `mediaStream`, so `useMultibandVolume`'s real-mic analysis path is dead code, same reasoning as live-waveform dropping the unmounted `onError` prop). Class strings, `data-state`/`data-highlighted` attrs verbatim from source. `(code — done)`

Not ported (dead files upstream, never mounted by their index.tsx): `preview-02/cards/album-card.tsx`, `preview-02/cards/catalog-toolbar.tsx`, and the whole `preview-03/` directory. (`preview/cards/bar-visualizer.tsx` was also dead upstream but IS now ported — see the checked item above; it's mounted on our own preview-page-3 instead of the shadcn-parity pages.)

## Upstream

- [ ] **Report Zag cascade-select init bug** — verified 2026-08-11 in @zag-js/cascade-select@1.43.0 machine source: `selectedItems` context seeds `defaultValue: []` unconditionally and is populated only by the `set.value` action (interactive selection), never at machine init — so `valueAsString` is empty on first mount even with a correct `defaultValue`. Our component works around it by deriving the trigger label from `api().value` (which IS seeded correctly). Worth an upstream issue/PR to chanan/zag. `(ops — upstream report)`

- [ ] **Upstream `stripOwnProps` into `marko-zag`** — `packages/shadcn/lib/native-attrs.ts` is a deliberate LOCAL STOPGAP, added 2026-08-19. It belongs in the `marko-zag` adapter package, which already owns `MachineInput`, `<machine-props>`, `<service>` and `<connect>`; nativeAttrs is the fourth step of that same three-tag contract, so shipping it here means the adapter ships an incomplete pattern and 47 consumers hand-copy the last step. It was added locally only because `marko-zag` is a separate repo (`/Users/svallory/work/marko-zag/`) consumed as a published `^1.0.0` dependency, not a workspace package — changing it needs its own release cycle.

  Final signature (unchanged since the sweep; move it verbatim):

  ```ts
  export function stripOwnProps<Source extends object, Keys extends readonly (keyof Source)[]>(
    source: Source,
    ...keys: Keys
  ): Omit<Source, Keys[number]>
  ```

  When it moves, all 47 `ui/*` components must have their import re-pointed from `#lib/native-attrs.ts` to `marko-zag`, and `packages/shadcn/lib/native-attrs.ts` deleted. Two registry-build consequences to handle at that time: (1) the helper currently ships to copy-path consumers inside the `utils` registry item, because `build-registry.ts` emits *every* file in `lib/` as `utils` (`fileEntries(LIB_DIR, ...)`) — once the import is a bare package specifier, `resolveDependencies()` picks `marko-zag` up as a normal npm dep instead and no `registryDependencies` edit is needed; (2) `SUBPATH_IMPORT_TARGETS` in `build-registry.ts` needs no change either, since the `#lib/` rewrite simply stops applying to this specifier. `(refactor — upstream)`

## Release (user)

- [x] Push repo to GitHub — done: `origin` is `git@github.com:svallory/marko-ui.git`, pushed. `(ops — done)`
  - [ ] Archive `svallory/marko-ui-components` with pointer README — repo not found — confirm name or drop. `(ops)`
- [ ] `npm publish marko-ui@0.1.0` + `npm deprecate marko-ui@0.0.2 "Marko 5/Zag 0.x era — unrelated to 0.1+"`. `(ops)`
- [ ] Deploy docs app + registry; CI: `bun run build:registry && git diff --exit-code` + shadcn-CLI smoke test. `(ops)`

## Docs sidebar parity follow-ups (found during 2026-08-13 layout-polish review; all pre-existing)

- [ ] **Sidebar scroll-to-active + scroll restore** — shadcn's docs-sidebar.tsx scrolls the active item into view on load (getActiveItem/scrollTop) and restores sidebar scroll position across navigations via sessionStorage; neither mechanism was ever ported. Port both to docs-sidebar.marko + components-sidebar.marko. `(code — small)`
- [ ] **"New" indicator dots** — shadcn marks new docs pages/components with a colored dot (PAGES_NEW list). No equivalent here. Port the mechanism + decide our own "new" list. `(code — small)`
- [ ] **Define `scroll-fade` utility** — referenced in docs-content.marko/docs-article.marko but never defined (same latent no-op class as `no-scrollbar` was before 2026-08-13). Copy shadcn's implementation or remove the dead references. `(code — tiny)`
- [ ] **Fix `bun run extract:api`** — broken on main (pre-existing `ts.ScriptTarget.ES2022` failure in extract-api.ts, likely TS 7 API change): api-reference.json can no longer be regenerated, so any NEW component (e.g. ui/icon) ships an empty API Reference table. Fix the extractor against the installed TypeScript, regen, verify icon/field/chart tables populate. `(code — small)`

## Style ports (8 shadcn styles → per-style `ui` trees, started 2026-08-14)

**Superseded 2026-08-17 (decision — made):** the hand-ported-tree-per-style
approach this section describes was a premise error — the 8 hand-ported trees
turned out to be byte-identical modulo the style name, so there were never
real per-style deltas to hand-maintain. All 1,880 hand-ported files were
deleted in `0ee60878`. The registry is now one authored source
(`packages/shadcn/ui/`) with semantic `mu-*` hook classes, 8 vendored CSS
token layers (`packages/shadcn/styles/style-<name>.css`, shipped as SOURCE),
and a generator (`tooling/build-registry.ts`, applying the StyleMap via
`tooling/style-map.ts` + `tooling/apply-style-map.ts`) that transforms the
per-style flat components IN MEMORY at build time — there is no on-disk
`styles-gen/`. (The whole `packages/registry/` package this section
originally referenced no longer exists — the registry moved to
`packages/shadcn/` and its `scripts/` moved to the top-level `tooling/`.)
See `notes/plans/dual-distribution-plan.md` and `notes/plans/
style-refactor-fleet-plan.md` for the current architecture and its "Measured
result"/"Known gaps". The items below are kept as the historical record of
the original (now-replaced) hand-porting effort; do not use them to judge
current coverage — check `check-anchors.ts`'s 86/86 pass instead.

- [x] **rhea** — 55/66 components ported (masonry subset + waves A1-A3), home masonry rewired to it.
- [ ] **Chat primitives missing in every style except rhea**: `attachment`, `sonner`, `direction`, `marker` (`questionnaire` split out into its own entry below — its 17 CSS anchors were deleted on 2026-08-19) — no default-registry Marko base exists to restyle; each needs a ground-up port (zag machine or hand-rolled) BEFORE its 8 style variants. `bubble`, `message`, `message-scroller` are now ported for rhea and power the homepage's `card-message-scroller.marko` (static-content port of shadcn's MessageScrollerDemo); still missing for the other 7 styles. `(code — large)`
- [ ] **rhea gaps documented in-file**: select scroll-arrow buttons (no zag API), base-ui exit animations (`data-closed:*` inert — zag unmounts on close), input-otp focus-ring addition, toast geometry (zag system kept), sidebar partial part set (only what homepage needs; no Sheet-based mobile branch, no Rail/Inset/Sub-menus). `(code — medium)`
- [ ] **Masonry rails** — shadcn's ≥2200px skeleton rails use 16 per-card skeleton variants (cards/skeleton/*); ours renders a simplified 6-card rail set. Port the full skeleton card set for exact ultra-wide parity. `(code — medium)`
- [x] nova, vega, lyra, maia, mira, luma, sera — all ported 2026-08-14 (54 components each, packages/registry/styles/<name>/ui). Per-style string-audit residuals (84-99) are all structural categories shared across styles: sidebar mobile-sheet branch + unported sub-parts, toast swipe/stack geometry, menu submenu/checkbox/radio items (flattened entries model), select scroll buttons + group labels, combobox chips/InputGroup mode, CommandDialog, drawer nested-stack internals, input-otp fake caret, calendar dropdown layout, navigation-menu exit-phase attrs. Closing any of these means changing the shared zag anatomy first (default registry), then propagating to all 8 styles.

- [ ] **Port `questionnaire` (deferred 2026-08-19 — recon done, do not redo it)** `(code — large, 1.5-2.5 days)`
  Deliberately deferred, not forgotten. The 17 `mu-questionnaire-*` CSS anchors that
  used to ship in all 8 `packages/shadcn/styles/style-*.css` files were **REMOVED** in
  the same pass that wrote this entry (one `/* MARK: Questionnaire */` block per file),
  along with their 17 entries in `tooling/unused-anchors.json`. **They must be restored
  alongside the port** — recover them with
  `git show HEAD -- packages/shadcn/styles/style-rhea.css` (and the other 7) rather than
  re-deriving from upstream, since each style had its own hand-tuned values.
  Note: `style-vega.css` also carries `.mu-card-content:has(> [data-slot=questionnaire-choices])`
  (~line 262). That rule was **left in place** — its anchor stem is `card-content`, not
  `questionnaire`, so no gate flags it; it simply stays inert until the port lands.

  **Component surface — 15 exported parts.** Element/anchor per part, verified against
  `data/shadcn-ui/apps/v4/registry/bases/base/ui/questionnaire.tsx` (styled layer) and
  `packages/react/src/questionnaire/components.tsx` (`defaultTagName` of each primitive):

  | Part | Element | Anchor |
  | --- | --- | --- |
  | Questionnaire (root) | `form` (`noValidate`) | `mu-questionnaire` |
  | Progress | `div` | `mu-questionnaire-progress` |
  | Item | `fieldset` | `mu-questionnaire-item` |
  | Title | `legend` | `mu-questionnaire-title` |
  | Description | `p` | `mu-questionnaire-description` |
  | Choices | `div` (grid) | `mu-questionnaire-choices` |
  | Choice | `label` | `mu-questionnaire-choice` |
  | ChoiceInput (nested in Choice) | `input` | `mu-questionnaire-choice-input` |
  | Choice indicator (nested, `aria-hidden`) | `span` | `mu-questionnaire-choice-indicator` |
  | Indicator dot (nested) | `span` | `mu-questionnaire-choice-indicator-dot` |
  | Indicator check (nested, Check icon) | icon | `mu-questionnaire-choice-indicator-check` |
  | Choice content/label (nested) | `span` | `mu-questionnaire-choice-content` |
  | Choice shortcut (nested) | `span` | `mu-questionnaire-shortcut` |
  | ChoiceDescription | `span` | `mu-questionnaire-choice-description` |
  | Input wrapper + Input | `div` > `input` | `mu-questionnaire-input-wrapper`, `mu-questionnaire-input` |
  | Error | `p` | `mu-questionnaire-error` |
  | Actions | `div` (3-col grid) | `mu-questionnaire-actions` |
  | Previous / Skip / Next / Submit | `button` | (buttonVariants; no `mu-` anchor in the removed CSS) |

  Correction to earlier recon notes: the choice input is **not** visually-hidden — it is
  `absolute inset-0 z-10 size-full opacity-0` overlaying the whole label. Previous/Skip
  default to `variant="outline"`, Next/Submit to `variant="default"`; Skip is
  `col-start-2`, Next and Submit share `col-start-3`.

  **Files to create** under `packages/shadcn/ui/questionnaire/`:
  - `questionnaire.marko` (+ any sibling `.marko` part files) — flat, at the top level.
  - `lib/controller.ts` and `lib/types.ts` for the headless engine.
    `tooling/build-registry.ts` supports a `lib/` subdirectory and **only** `lib/`; any
    other nested directory throws `registry item dirs must be flat (only lib/ allowed)`
    (build-registry.ts:309).
  - `registry.meta.json`:
    ```json
    { "title": "Questionnaire",
      "description": "...",
      "registryDependencies": ["utils", "button"] }
    ```
    **No `dependencies` key** — there is no `@zag-js/questionnaire` package; the engine is
    hand-rolled. (Contrast `ui/steps/registry.meta.json`, which does carry
    `"dependencies": ["@zag-js/steps"]`.)
  - `packages/shadcn/package.json` needs **no** change — its exports are wildcards
    (`"./ui/*"`, `"./lib/*"`), so a new component directory is exported automatically.

  **Engine to port** (the bulk of the 1.5-2.5 days, ~2,100 lines): the
  `@shadcn/react/questionnaire` headless package at
  `data/shadcn-ui/packages/react/src/questionnaire/` — `use-questionnaire-item.ts` (571),
  `use-questionnaire-root.ts` (525), `types.ts` (305), `collection.ts` (234),
  `use-questionnaire-choice.ts` (170), `use-questionnaire-input.ts` (149), `utils.ts` (141);
  `components.tsx` (551) is the React binding layer and is replaced by Marko tags, not ported.

  **Behavior specs** — 14 example scenarios at `data/shadcn-ui/apps/v4/examples/aria/`:
  `questionnaire-{animated,card,conditional,controlled,demo,dialog,freeform,multiple,`
  `navigation-state,progress,resume,shortcuts,skip,validation}.tsx`. Treat them as the
  acceptance suite. (An earlier note claimed six; there are fourteen.)

  **Docs wiring**: `apps/docs/src/demos/questionnaire/` with one `.marko` per example plus a
  `docs.ts` modeled on `apps/docs/src/demos/steps/docs.ts` (description, `usageTags`,
  `importSnippet`, `usageSnippet`, `examples[]` where each `name` matches a sibling
  `.marko` filename), then run `bun run build:demos`.

  **Acceptance gate**: `bun tooling/check-anchors.ts` and `bun tooling/check-consumption.ts`
  must both exit 0 once the anchors are restored and the component carries them.
