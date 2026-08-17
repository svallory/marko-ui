# Badge pipelines (feat/ci-pipelines, 2026-08-16)

Implements the badge plan from `notes/MARKETING.md` ("Badges for the home
page"). CI runs every suite against the real production build (registry JSON +
`marko-run build` served by `bun dist/index.mjs`, mirroring the Dockerfile) and
publishes shields.io endpoint JSON to the orphan `badges` branch.

## Workflows

- `.github/workflows/ci.yml` — push(main)/PR/dispatch, 3 parallel jobs:
  - **tests** — full vitest suite (behavior + hydration invariance) →
    `tests.json`, `hydration.json`
  - **style-matrix** — Playwright e2e (511 checks) → `style-matrix.json`
  - **axe** — `scripts/ci/axe-scan.ts` over home + all 86 component pages →
    `axe.json`; job FAILS when violations > 0
  - **publish-badges** — main only, merges badge artifacts, pushes to `badges`
    branch (rebase-retry, tolerates racing with lighthouse.yml)
- `.github/workflows/lighthouse.yml` — push(main)/dispatch; Lighthouse CI
  (treosh action, 3 runs) over `/`, accordion, dialog, select →
  `lighthouse-{accessibility,performance,best-practices,seo}.json`
  (minimum score across pages — the honest number)
- `.github/workflows/scorecard.yml` — OpenSSF Scorecard, weekly + push(main),
  publishes results for the public badge.

## Rendering badges

    https://img.shields.io/endpoint?url=https://raw.githubusercontent.com/svallory/marko-ui/badges/<name>.json

Names: `tests`, `hydration`, `style-matrix`, `axe`, `lighthouse-accessibility`,
`lighthouse-performance`, `lighthouse-best-practices`, `lighthouse-seo`.
OpenSSF: `https://api.scorecard.dev/projects/github.com/svallory/marko-ui/badge`.
npm + bundlejs badges need no pipeline — live once packages publish.

## Supporting changes

- `scripts/ci/serve-docs.sh` — build registry + docs, serve, wait-for-ready.
- `scripts/ci/badge.ts` — result files → shields endpoint JSON (vitest / e2e /
  axe / lighthouse manifest).
- `scripts/ci/axe-scan.ts` — playwright + axe-core scan, hydration-aware.
- `scripts/ci/publish-badges.sh` — additive push to `badges` branch.
- `.github/actions/setup/action.yml` — bun 1.3.11 + frozen install + cached
  Playwright chromium.
- `packages/registry/tests/helpers/browser.ts` — playwright resolution no
  longer hardcodes the homebrew path (env override → workspace copy →
  homebrew fallback).
- Root devDeps added: `axe-core`, `playwright@1.62.1` (bun's isolated installs
  don't hoist `@playwright/test`'s transitive `playwright`).

## Verified locally

- `serve-docs.sh` full build + production serve: works.
- badge.ts on real + synthetic fixtures: all 8 badges correct.
- Patched browser.ts: tabs suite 8/8, hydration invariance 33/33 via
  workspace playwright.
- Full axe scan against production build: ran end-to-end.

## axe: now 0 violations across all component pages (2026-08-16, session 2)

The scan was rescoped from /docs/components/* (which mixes in docs-site
chrome) to the bare /verify/default/<component> demo-matrix pages, restricted
to the demo `<main>`, with page-structure rules (landmark-*,
page-has-heading-one, region) disabled — those judge the page, not the
component. First scoped scan: 105 violations across 26 components. All fixed:

**Token nudges** (light theme, default/neutral only — the zinc/slate/stone/
gray shadcn-parity palettes are untouched):
- `--muted-foreground` oklch 0.556 → 0.54 (4.34:1 → ≥4.6:1 on `--muted`)
- `--destructive` oklch 0.577 → 0.558 (4.37:1 vs its foreground → passes)
- both in apps/docs/src/app.css and packages/registry/default/styles/globals.css

**Component fixes** (default + replicated to the style ports that have their
own copy: scroll-area/carousel/switch/item × 8 styles):
- scroll-area viewport + carousel item-group: `tabindex="0"` (keyboard-
  scrollable regions; matches shadcn's Viewport tabIndex)
- switch: label-content support (Zag label part) + hidden input's
  aria-labelledby dropped when no label exists (was dangling → no name)
- tags-input: `placeholder` was landing on the root div, never the entry
  input (real bug); disabled styling opacity-50 (1.71:1) → bg-muted +
  text-muted-foreground
- steps: item wrapper role="presentation" inside the tablist, aria-current
  moved onto the tab trigger (presentational-roles conflict resolution)
- tree-view: chevron button → Zag branch-indicator span (was nested
  role=button inside treeitem, icon-only with no name)
- toc: indicator span aria-hidden (bare span in `<ul>`)
- item: separator aria-hidden; group's role="list" removed (owned zero
  listitems — shadcn deviation, documented in the source)
- floating-panel: trigger's aria-controls only while the panel is rendered
- file-upload: dropzone dropped role=button/tabindex (contains the Browse
  trigger, which is the keyboard path)

**Demo fixes**: labels/aria-labels for slider (Zag `aria-label` array),
number-input, input, textarea, native-select, tags-input, field, switch;
avatar alt in empty; label-demo rewritten to use Checkbox's own label part
(external `<Label for>` can't reach the machine-generated input id); toc
scroll boxes `tabindex="0"`.

**e2e snapshot infrastructure** (found while re-verifying):
- snapshots were platform-suffixed (`-chromium-darwin`) — invisible to Linux
  CI; `snapshotPathTemplate` now drops the platform and all 511 files were
  renamed
- `aria-current="date"` (today's calendar cell) is now normalized out of
  snapshots — it moved daily and expired the calendar snapshots overnight
- 87 snapshots updated for the intentional markup changes

**Verified after fixes**: axe 0/79 pages, vitest 120/120, style-matrix e2e
511/511. Badge reads "0 across 79 components" (the 79 with demo pages, of
86 total).

## Deliberately skipped

- **Coverage badge**: suites drive a real browser against the SSR app; V8
  coverage would only measure test-helper code — the number would lie. The
  tests-count badge is the honest substitute.
