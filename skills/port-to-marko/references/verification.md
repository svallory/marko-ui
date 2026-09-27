# Parity verification — mechanical, never vibes

Agents porting components consistently self-report success on broken code. None of these checks are optional; each one caught real shipped bugs during the marko-ui port. Do not report a component done until every applicable check passes, and report the ones that fail honestly.

## 1. Typecheck — marko-type-check, NEVER tsc

`tsc` cannot parse `.marko` files: a `tsc --noEmit` run silently checks only the `.ts` files and reports success while every component goes unchecked.

```bash
NODE_OPTIONS="--max-old-space-size=8192" marko-type-check -p ./tsconfig.json -d condensed
```

(devDependency: `@marko/type-check`. The heap bump is required on larger codebases — the default heap OOMs.) A type error at a spread site usually means a real element mismatch, not noise. Fix errors properly; never `@ts-ignore` or cast them away.

## 2. SSR render check (per component)

Render each component through a real Marko SSR server (a minimal @marko/run app works) and check:

- HTTP 200; a 500 body contains the compile/serialization error — read it and fix.
- NO `Unable to serialize` anywhere (you put an unserializable value in reactive state or tag input).
- The SSR HTML already carries the expected `aria-*`/`data-*` attributes for interactive components (grep the response body). Zag SSR must render full attributes server-side, not empty shells.

## 3. Hydration + interaction — production build, real browser, real pointer events

Dev servers hide hydration bugs. Build for production, serve the build, and drive it in a real browser (Playwright or equivalent):

- Zero console errors on load — a hydration mismatch or dynamic-tag crash shows here and nowhere else.
- Every interactive element exercised with REAL pointer events. Marko's delegated events ignore synthetic `el.click()` — synthetic-click verification reports false "frozen reactivity". Use the browser-automation click, not `dispatchEvent`.
- Keyboard paths for the components that have them (menus, tabs, comboboxes: arrows, Home/End, Escape, typeahead).
- Test with the tab FOREGROUNDED — a backgrounded tab suspends rAF and scroll events and produces false "handler is dead" evidence.
- Controlled props: verify both directions (set state programmatically → UI updates; interact → change handler fires).

## 4. Visual parity vs the source library

Screenshot the ported component next to upstream's rendering of the same demo in the same state (default, hover where reproducible, open/expanded, disabled), using the style/theme upstream uses for that area. Same structure, spacing, and behavior. Differences are either fixed or logged as explicit deviations. Do not eyeball from memory; take the screenshots.

Screenshots are supporting evidence, never the primary one. The primary evidence is the mechanical attribute/class diff in `parity-checklist.md`. An upstream docs site also carries site CSS and runtime actors (theme providers and the like) that users of the library don't get, so "looks like the docs site" is not parity.

**Authoritative runs only.** Pixel baselines are platform-specific (font rasterisation). A visual check counts as evidence only on the platform its baselines were generated on, normally the CI runner (Linux). A local macOS run against Linux baselines is noise, whether it passes or fails. Never cite it, and never regenerate baselines locally.

## 5. Behavior tests (keep them)

Write at least one Playwright behavior test per interactive component (open/close, select, keyboard nav) against a running server, so regressions surface after you're gone. Model: `packages/shadcn/tests/behavior/*.test.ts` in the marko-ui repo.

## Official-repo gate (wanted-library ports only)

PRs to `svallory/marko-ui` must additionally pass the repo's own suite from the workspace root:

```bash
bun run check           # marko-type-check across all packages + invariant scripts — must be green
bun run test            # vitest suites
bun run build:registry  # registry build must exit 0
```

plus the packages/shadcn behavior tests where your components have demos, **plus the parity-drift toolkit**:

```bash
bun run check:parity    # exit 0 green, 3 drift (read parity-report/), 2 tooling crash
```

It runs two detectors against the upstream clone and writes `parity-report/report.json` (stable `summary[]` per component: `status`, `pairedDemos`, `missingDemos`, `extraDemos`, `missingSections`, `maxDiffPct`, `ignored[]` — schema in `tooling/parity/runner/SCHEMA.md`) plus a worst-first HTML gallery:

- **Coverage** (static): every upstream demo and doc section must pair with yours by name, or be listed in `tooling/parity/config/parity-ignore.json` with a mandatory reason. Name your demos exactly like upstream's — pairing is by name.
- **Visual**: paired demos are rendered blank-page on both sides and diffed. Demos whose interesting state needs interaction (open a drawer, pick a date) need an entry in `tooling/parity/config/interactions.json` — role+name click steps applied identically to both sides. **Authoring that file is part of the port** (the reasoning happens once; every later run is mechanical): read `tooling/parity/config/INTERACTIONS.md` and write steps for each stateful demo you add.

`parity-ignore.json` is the machine-readable deviation log — every accepted difference lives there with its reason; the PR description summarizes them. Read the repo's `CLAUDE.md` and `TODO.md` conventions. A PR with failing checks, unexplained drift, or undisclosed deviations will not be reviewed.

The judgment steps behind those artifacts (name pairing, taxonomy, harness shims, interactions) are procedures in `parity-process.md`. (The toolkit is monorepo-only today; community registries use the manual screenshot comparison in §4 until it ships as a standalone dev package.)

## 6. Independent review (mandatory)

Self-verification repeatedly missed defects that an independent pass caught. Before any component is called done, a reviewer who did not write it compares it against upstream **source** (not screenshots) using `parity-checklist.md`. In an agent setup that means a fresh subagent. Its brief contains only the upstream path, your path, and the checklist, never your conclusions. Every finding is either fixed or logged. "The author checked it" does not satisfy this step.

## 7. Accessibility scan

Run axe (or equivalent) over every component page, open states included. A violation inherited verbatim from upstream is still a violation. Fix it as an intentional divergence, applied everywhere per `failure-classes.md` §9, or log it.

## Report format

End with a table: component → checks passed (types / SSR / hydration / interactions / visual [authoritative run link] / review / axe) → deviations. Attach the filled `parity-checklist.md` per component and the upstream SHA. "All good" with no evidence is a failed report.
