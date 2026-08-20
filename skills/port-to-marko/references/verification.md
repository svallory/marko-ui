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

Screenshot the ported component next to the source library's live docs/demo for the same state (default, hover where reproducible, open/expanded, disabled). Same structure, spacing, and behavior — differences either get fixed or logged as explicit deviations in your report. Do not eyeball from memory; take the screenshots.

## 5. Behavior tests (keep them)

Write at least one Playwright behavior test per interactive component (open/close, select, keyboard nav) against a running server, so regressions surface after you're gone. Model: `packages/shadcn/tests/behavior/*.test.ts` in the marko-ui repo.

## Official-repo gate (wanted-library ports only)

PRs to `svallory/marko-ui` must additionally pass the repo's own suite from the workspace root:

```bash
bun run check           # marko-type-check across all packages + invariant scripts — must be green
bun run test            # vitest suites
bun run build:registry  # registry build must exit 0
```

plus the e2e verify-matrix where your components have demos. Read the repo's `CLAUDE.md` and `TODO.md` conventions; log skips/deviations in the PR description the way `TODO.md` logs them (name, source path, exact reason). A PR with failing checks or undisclosed deviations will not be reviewed.

## Report format

End with a table: component → checks passed (types / SSR / hydration / interactions / visual) → deviations. "All good" with no evidence is a failed report.
