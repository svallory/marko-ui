# TODO

## Decisions

- [ ] **Project name** — `shadcn-marko` (recommended; follows shadcn-svelte/vue convention), `marko-ui`, or `markocn`. All free on npm. Blocks: repo name, registry URLs, docs branding. `(decision)`
- [ ] **Registry domain** — pick host/domain for docs + registry; rebuild with `REGISTRY_BASE_URL=https://<domain>/r` (item cross-refs embed absolute URLs, currently localhost). `(decision)`
- [x] **marko-zag exports: ship source** — no dist build; package already ships `.marko` source (compiled by the consumer), Vite transpiles `.ts` from node_modules, better IDE/agent DX. Document "requires a Marko-aware bundler" in README before publish. `(decision — made 2026-08-10)`

## Rebuilds (upgrade documented deviations)

- [ ] **drawer** — rebuild on `@zag-js/drawer@1.43.0` (real machine; exists since 1.34 — missed during Phase C, currently dialog-machine "vaul-lite" without drag/snap). `(code)`
- [ ] **toast** — rebuild on Zag's toast group store (spawn one child service per toast; module store + client-side child services + per-toast snapshots). Current zag-free fallback works but lacks pause-on-hover/swipe. `(code)`
- [ ] **navigation-menu** — partial parity (light-JS, no machine); revisit for viewport-style animated panels. `(code, decision on scope)`
- [ ] **scroll-area** — styled native scrollbars instead of synthetic draggable thumb; decide if parity matters. `(decision)`
- [ ] **form** — minimal field primitives by design; decide whether to grow toward a validation story. `(decision)`
- [ ] **chart** — deferred from v1 (Recharts is React-only); evaluate ECharts/observable-plot wrapper. `(decision, code)`
- [ ] **Compound-tag DX** — array-driven APIs (menus, select, tabs, accordion…) deviate from shadcn's compound components due to the serialization constraint; investigate a Marko-idiomatic compound pattern (per-part files sharing plain snapshots via context) as a v2 API. `(research)`

## Quality

- [ ] **Per-component behavioral test suites** — port Zag e2e expectations / WAI-ARIA APG keyboard contracts; vitest browser mode + playwright provider. Current coverage: SSR contract tests + adapter unit tests + manual browser verification. `(code)`
- [ ] **Hydration-invariant helper** — automate SSR-attr vs post-hydration DOM diff for every interactive component (design C-4; currently spot-checked). `(code)`

## Release (user)

- [ ] Push repo to GitHub (no remote configured); archive `svallory/marko-zag-components` with pointer README. `(ops)`
- [ ] `npm publish marko-zag@0.1.0` + `npm deprecate marko-zag@0.0.2 "Marko 5/Zag 0.x era — unrelated to 0.1+"`. `(ops)`
- [ ] Deploy docs app + registry; CI: `bun run build:registry && git diff --exit-code` + shadcn-CLI smoke test. `(ops)`
