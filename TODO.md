# TODO

## Decisions

- [x] **Project name: `marko-ui`** — renamed 2026-08-11 (was shadcn-marko; scope now exceeds shadcn — "shadcn for Marko" stays as marketing tagline). Renamed in registry output, docs, workspace package. Repo push should use `svallory/marko-ui`. `(decision — made)`
- [x] **Registry domain: `marko-ui.saulo.tech`** — decided 2026-08-11. Deploy pipeline must build with `REGISTRY_BASE_URL=https://marko-ui.saulo.tech/r` (local dev keeps localhost default for shadcn-CLI smoke tests). `(decision — made)`
- [x] **marko-zag exports: ship source** — no dist build; package already ships `.marko` source (compiled by the consumer), Vite transpiles `.ts` from node_modules, better IDE/agent DX. Document "requires a Marko-aware bundler" in README before publish. `(decision — made 2026-08-10)`

## Rebuilds (upgrade documented deviations)

- [x] **Migrate registry components to the `<machine-props>`/`<service>`/`<connect>` pattern** — done 2026-08-11 via 32-agent fleet + adversarial review + fix round: all 31 Zag components on the three-tag pattern with `MachineInput` typing, chained typed callbacks, splitProps native pass-through (data-table is TanStack-based, correctly keeps its own store integration). v1 docs deleted from component-authoring.md. `(code — done)`
- [x] **Investigate intermittent `bunx vitest run` hang** — resolved 2026-08-11: not a bug. Measured cause: CPU starvation under parallel-agent load (load avg ~30 on 10 cores; 9s stall was pre-run scheduler wait, ~90% idle-wait by `/usr/bin/time`; port/pool/teardown hypotheses disproven). 40+ consecutive clean runs, 9/9 passing. Config unchanged. Optional speedups: call `./node_modules/.bin/vitest` directly (skips ~1.5s proto-shim/bunx resolution). `(bug — closed)`

- [x] **drawer** — rebuilt 2026-08-11 on `@zag-js/drawer@1.43.0`: full 10-part anatomy (grabber/swipeArea/backdrop), snap points, logical swipeDirection, drag verified with real mouse in Playwright. NOTE: drawer machine carries position vars inside getContentProps()'s reactive style — no own style attr allowed on content/backdrop/positioner (documented in variants.ts). `(code — done)`
- [x] **toast** — rebuilt 2026-08-11 on Zag's toast group store: module store + group service + per-toast child services in `<for>`; pause-on-hover, stacking, targeted close, promise API all Playwright-verified. Cross-machine reactivity threaded via `groupRevision=service.rev`. `(code — done)`
- [ ] **navigation-menu** — partial parity (light-JS, no machine); revisit for viewport-style animated panels. `(code, decision on scope)`
- [ ] **scroll-area** — styled native scrollbars instead of synthetic draggable thumb; decide if parity matters. `(decision)`
- [x] **form** — grown into the full shadcn Field anatomy (10 parts), validation-library-agnostic. Zag has no form machine (verified), so this is a static pattern. Errors accept plain strings or Standard Schema issues; demo shows valibot on the server via `Run.POST({ form })` (progressive enhancement) plus native `ValidityState` on blur. See `agent/reports/form-validation.md`.
- [ ] **chart** — evaluated 2026-08-11 (`agent/reports/chart-evaluation.md`): recommendation is d3 primitives (d3-scale/shape/array) with Marko emitting SVG — 10.8-17KB gzip vs ECharts' 194KB on the same feature set (18x), and true SSR: charts render with zero JS, theming via `var(--chart-N)` in markup (pure CSS cascade, no observer). Per-chart tags, not polymorphic `<Chart type=>`. ECharts stays an opt-in escape hatch for heavy analytics. NEXT: implement chart-container + bar/line/area/pie tags (~400-600 lines incl. axes/tooltip). `(code — evaluated, awaiting build)`
- [ ] **Compound-tag DX** — researched 2026-08-11 (`agent/reports/compound-tag-dx.md`, spikes at /compound-spike): premise was wrong — api getters DO cross tag boundaries; the real gap is Marko 6 has NO context API. Three spikes verified: attr-tags (<@trigger>/<@panel>) WORK and are shorter than the array API; per-part tag files work but silently drop ARIA when a consumer forgets api= (disqualifying); $global is silently dead client-side. Recommendation: adopt attr-tags as primary v2 API, keep items= as sugar; combobox/command/tree-view stay array-primary. NEXT: user decision on adopting, then mechanical per-component rollout. `(decision — research done)`

## Theming (shadcn parity — mechanism already compatible, tooling gaps below)

- [x] **`cssVars` in registry items** — done 2026-08-11: build-registry.ts parses globals.css (`:root`→light, `.dark`→dark, `@theme inline`→theme) and emits schema-shaped `cssVars` on the style item; values verified verbatim against globals.css. `(code — done)`
- [ ] **Base color variants** — only neutral shipped; generate zinc/slate/stone/gray globals.css variants (mechanical — sidebar/chart vars already present). `(code, decision on which to offer)`
- [x] **Docs theme switcher** — done 2026-08-11: no-flash `<html-script>` head script (localStorage + prefers-color-scheme) + `<theme-toggle/>` header button; Playwright-verified toggle + persistence across reload. `(code — done)`
- [x] **Animation parity check** — verified 2026-08-11, all three PASS, no changes needed. Toast: Zag-driven translate/scale/opacity transitions (shadcn's sonner has no Tailwind class list to diff — it bundles its own CSS). Drawer: all 14 tw-animate-css utilities used are present in 1.4.0; backdrop classes identical to shadcn vaul; content slide keyframes intentionally added on top of Zag's inline transform (documented in variants.ts). Scroll-area: no animations in either implementation. Browser-verified computed animation/transition properties. `(code — done)`

## Quality

- [x] **Per-component behavioral test suites** — done 2026-08-11: 61 WAI-ARIA APG keyboard tests (tabs, dialog focus trap, accordion, switch/checkbox/radio-group, select, slider) in packages/registry/tests/behavior/, Playwright driven from vitest node env. Found + fixed a real adapter bug: normalize-props now maps Zag's React-style `tabIndex` → `tabindex` (verbatim camelCase key caused remove-then-add on every update, blurring focus — broke keyboard nav on all roving-focus widgets). `(code — done)`
- [x] **Hydration-invariant helper** — done 2026-08-11 (design C-4): packages/registry/tests/helpers/hydration-invariant.ts — JS-off vs JS-on attribute diff over all [data-scope] elements, LCS pairing on scope/part, separate count-change whitelist. 33/33 components pass: 28 exact, 5 whitelisted with in-code mechanism comments (avatar image-load state, combobox/command floating-ui placement, carousel measured snap points). Dark-mode divergence untested (light pinned). `(code — done)`

## Release (user)

- [ ] Push repo to GitHub (no remote configured); archive `svallory/marko-zag-components` with pointer README. `(ops)`
- [ ] `npm publish marko-zag@0.1.0` + `npm deprecate marko-zag@0.0.2 "Marko 5/Zag 0.x era — unrelated to 0.1+"`. `(ops)`
- [ ] Deploy docs app + registry; CI: `bun run build:registry && git diff --exit-code` + shadcn-CLI smoke test. `(ops)`
