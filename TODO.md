# TODO

## Decisions

- [x] **Project name: `shadcn-marko`** — decided 2026-08-10. Renamed in registry.json, docs, workspace package. Repo push should use `svallory/shadcn-marko`. `(decision — made)`
- [ ] **Registry domain** — pick host/domain for docs + registry; rebuild with `REGISTRY_BASE_URL=https://<domain>/r` (item cross-refs embed absolute URLs, currently localhost). `(decision)`
- [x] **marko-zag exports: ship source** — no dist build; package already ships `.marko` source (compiled by the consumer), Vite transpiles `.ts` from node_modules, better IDE/agent DX. Document "requires a Marko-aware bundler" in README before publish. `(decision — made 2026-08-10)`

## Rebuilds (upgrade documented deviations)

- [x] **Migrate registry components to the `<machine-props>`/`<service>`/`<connect>` pattern** — done 2026-08-11 via 32-agent fleet + adversarial review + fix round: all 31 Zag components on the three-tag pattern with `MachineInput` typing, chained typed callbacks, splitProps native pass-through (data-table is TanStack-based, correctly keeps its own store integration). v1 docs deleted from component-authoring.md. `(code — done)`
- [x] **Investigate intermittent `bunx vitest run` hang** — resolved 2026-08-11: not a bug. Measured cause: CPU starvation under parallel-agent load (load avg ~30 on 10 cores; 9s stall was pre-run scheduler wait, ~90% idle-wait by `/usr/bin/time`; port/pool/teardown hypotheses disproven). 40+ consecutive clean runs, 9/9 passing. Config unchanged. Optional speedups: call `./node_modules/.bin/vitest` directly (skips ~1.5s proto-shim/bunx resolution). `(bug — closed)`

- [x] **drawer** — rebuilt 2026-08-11 on `@zag-js/drawer@1.43.0`: full 10-part anatomy (grabber/swipeArea/backdrop), snap points, logical swipeDirection, drag verified with real mouse in Playwright. NOTE: drawer machine carries position vars inside getContentProps()'s reactive style — no own style attr allowed on content/backdrop/positioner (documented in variants.ts). `(code — done)`
- [x] **toast** — rebuilt 2026-08-11 on Zag's toast group store: module store + group service + per-toast child services in `<for>`; pause-on-hover, stacking, targeted close, promise API all Playwright-verified. Cross-machine reactivity threaded via `groupRevision=service.rev`. `(code — done)`
- [ ] **navigation-menu** — partial parity (light-JS, no machine); revisit for viewport-style animated panels. `(code, decision on scope)`
- [ ] **scroll-area** — styled native scrollbars instead of synthetic draggable thumb; decide if parity matters. `(decision)`
- [ ] **form** — minimal field primitives by design; decide whether to grow toward a validation story. `(decision)`
- [ ] **chart** — deferred from v1 (Recharts is React-only); evaluate ECharts/observable-plot wrapper. `(decision, code)`
- [ ] **Compound-tag DX** — array-driven APIs (menus, select, tabs, accordion…) deviate from shadcn's compound components due to the serialization constraint; investigate a Marko-idiomatic compound pattern (per-part files sharing plain snapshots via context) as a v2 API. `(research)`

## Theming (shadcn parity — mechanism already compatible, tooling gaps below)

- [x] **`cssVars` in registry items** — done 2026-08-11: build-registry.ts parses globals.css (`:root`→light, `.dark`→dark, `@theme inline`→theme) and emits schema-shaped `cssVars` on the style item; values verified verbatim against globals.css. `(code — done)`
- [ ] **Base color variants** — only neutral shipped; generate zinc/slate/stone/gray globals.css variants (mechanical — sidebar/chart vars already present). `(code, decision on which to offer)`
- [x] **Docs theme switcher** — done 2026-08-11: no-flash `<html-script>` head script (localStorage + prefers-color-scheme) + `<theme-toggle/>` header button; Playwright-verified toggle + persistence across reload. `(code — done)`
- [ ] **Animation parity check** — utilities come from `tw-animate-css`, not shadcn's plugin chain; verify themed animations match for the deviated components (toast, drawer, scroll-area). `(code)`

## Quality

- [ ] **Per-component behavioral test suites** — port Zag e2e expectations / WAI-ARIA APG keyboard contracts; vitest browser mode + playwright provider. Current coverage: SSR contract tests + adapter unit tests + manual browser verification. `(code)`
- [ ] **Hydration-invariant helper** — automate SSR-attr vs post-hydration DOM diff for every interactive component (design C-4; currently spot-checked). `(code)`

## Release (user)

- [ ] Push repo to GitHub (no remote configured); archive `svallory/marko-zag-components` with pointer README. `(ops)`
- [ ] `npm publish marko-zag@0.1.0` + `npm deprecate marko-zag@0.0.2 "Marko 5/Zag 0.x era — unrelated to 0.1+"`. `(ops)`
- [ ] Deploy docs app + registry; CI: `bun run build:registry && git diff --exit-code` + shadcn-CLI smoke test. `(ops)`
