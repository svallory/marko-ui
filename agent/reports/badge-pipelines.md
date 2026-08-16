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

## Finding: the "0 axe violations" claim is currently false

First real scan: **1073 violations across all 87 pages.** By rule:
color-contrast 541, scrollable-region-focusable 239, landmark-unique 174,
label 26, nested-interactive 18, button-name 13, aria-input-field-name 12,
landmark-main-is-top-level 11, landmark-no-duplicate-main 9,
aria-required-children 7, heading-order 7, aria-valid-attr-value 5, others <5.

Most bulk is docs-site chrome (repeated unlabeled `<nav>`/`<main>` landmarks,
scrollable code blocks without tabindex, muted-foreground contrast), but
`label`, `button-name`, `select-name`, `aria-input-field-name`,
`nested-interactive` include real component/demo issues. The axe CI job stays
red until fixed — do not use the "0 axe violations" claim publicly yet.
Raw per-page details: run `bun scripts/ci/axe-scan.ts out.json` locally.

## Deliberately skipped

- **Coverage badge**: suites drive a real browser against the SSR app; V8
  coverage would only measure test-helper code — the number would lie. The
  tests-count badge is the honest substitute.
