# marko-ui

**shadcn for [Marko](https://markojs.com) — and beyond it.**

[![Tests](https://img.shields.io/endpoint?url=https%3A%2F%2Fraw.githubusercontent.com%2Fsvallory%2Fmarko-ui%2Fbadges%2Fchecks.json)](https://github.com/svallory/marko-ui/actions/workflows/ci.yml)
[![WCAG 2.2 AA automated scan](https://img.shields.io/endpoint?url=https%3A%2F%2Fraw.githubusercontent.com%2Fsvallory%2Fmarko-ui%2Fbadges%2Faxe.json)](https://github.com/svallory/marko-ui/blob/main/scripts/ci/axe-scan.ts)
[![Lighthouse accessibility](https://img.shields.io/endpoint?url=https%3A%2F%2Fraw.githubusercontent.com%2Fsvallory%2Fmarko-ui%2Fbadges%2Flighthouse-accessibility.json)](https://github.com/svallory/marko-ui/actions/workflows/lighthouse.yml)
[![Hydration invariance](https://img.shields.io/endpoint?url=https%3A%2F%2Fraw.githubusercontent.com%2Fsvallory%2Fmarko-ui%2Fbadges%2Fhydration.json)](https://github.com/svallory/marko-ui/tree/main/packages/shadcn/tests)
[![npm version (marko-ui)](https://img.shields.io/npm/v/marko-ui)](https://www.npmjs.com/package/marko-ui)
[![npm version (@marko-ui/shadcn)](https://img.shields.io/npm/v/@marko-ui/shadcn)](https://www.npmjs.com/package/@marko-ui/shadcn)
[![License: MIT](https://img.shields.io/npm/l/marko-ui)](https://github.com/svallory/marko-ui/blob/main/LICENSE)
[![CI status](https://github.com/svallory/marko-ui/actions/workflows/ci.yml/badge.svg)](https://github.com/svallory/marko-ui/actions/workflows/ci.yml)
[![OpenSSF Scorecard](https://api.scorecard.dev/projects/github.com/svallory/marko-ui/badge)](https://scorecard.dev/viewer/?uri=github.com/svallory/marko-ui)

86 accessible, themeable components for Marko 6, in 8 complete styles,
installable with the marko-ui CLI. Interactive behavior comes from
[Zag.js](https://zagjs.com) state machines — the same core behind Chakra's
Ark UI — not hand-rolled event handlers.

**Docs & demos: [marko-ui.saulo.tech](https://marko-ui.saulo.tech)**

## Why marko-ui

- **Every component works before JavaScript arrives.** Marko streams
  server-rendered HTML with the correct ARIA and state attributes already in
  place, then *resumes* — it never re-runs your components in the browser.
  Verified by an automated hydration-invariance suite: each covered component
  produces byte-identical accessibility/state attributes with JS disabled vs
  after hydration. The hydration badge above reports current coverage as
  `covered/total`; the components not yet covered are named in
  `packages/shadcn/tests/hydration-coverage.ts`.
- **Forms validate without JavaScript.** `@marko/run` natively consumes
  Standard Schema validators for form bodies, so a plain no-JS `POST`
  re-renders the page with real server-side field errors. The React original
  can't do this — shadcn's Field components are client-only by construction.
- **Beyond shadcn.** 19 components shadcn doesn't have: color-picker, tour,
  floating-panel, image-cropper, signature-pad, qr-code, timer, steps,
  tags-input, number-input, rating-group, marquee, toc, listbox,
  cascade-select, angle-slider, date-input, editable, password-input.
- **Behavior parity without React-only dependencies.** Drawer runs on the
  real `@zag-js/drawer` machine (drag-to-dismiss, snap points — vaul-grade,
  no vaul). Toast runs on Zag's group store (pause-on-hover, stacking,
  promise API — sonner-grade, no sonner). Data tables run on
  `@tanstack/table-core`, the framework-agnostic core.
- **Accessibility is tested, not claimed.** 71 WAI-ARIA APG keyboard-contract
  tests run as Playwright tests in CI; every component demo page passes an
  axe-core WCAG 2.2 A/AA scan (CI fails on a single violation). The
  Lighthouse accessibility badge above is published by CI on every push —
  that badge, not a number written here, is always the current value.
- **Copy-paste philosophy, source-first.** Components ship as readable
  `.marko` source compiled by YOUR bundler — friendly to IDEs, code review,
  and AI agents. No opaque dist blobs.

## Quick start

marko-ui is distributed through shadcn's registry protocol:

```sh
# scaffold components.json + base theme (interactive: pick distribution + style)
bunx marko-ui init

# or non-interactively (every prompt answered by a flag)
bunx marko-ui init --distribution copy --visual-style vega --base-color neutral

# add components
bunx marko-ui add button
bunx marko-ui add dialog select toast
```

Existing shadcn themes drop in unchanged — marko-ui uses the canonical CSS
variable names, and all four shadcn base colors (zinc, slate, stone, gray)
ship as selectable style items with values byte-identical to shadcn's.

See the [installation guide](https://marko-ui.saulo.tech/docs/installation)
for the full walkthrough.

## Styles

8 styles — every component re-styled, not re-skinned:
`luma`, `lyra`, `maia`, `mira`, `nova`, `rhea`, `sera`, `vega` (`vega` is the
default). These are the shape/spacing/radius axis; the four shadcn base
colors (zinc, slate, stone, gray) are a separate, orthogonal axis. One component
source carries semantic `mu-*` hook classes; each style is a vendored CSS
token layer combined with that source by a build step, so styling a component
differently is a token/CSS change, not a separate hand-maintained tree.
Behavior tests (Playwright, against real hydrated components) and the
hydration-invariant suite guard the shared source on every push, and a
[gallery-screenshot guard](.github/workflows/visual.yml) renders the
component gallery in all 8 styles × light/dark and fails on any pixel
change.

## Repository layout

```
apps/docs            docs site (also serves the registry JSON at /r/*)
packages/shadcn      @marko-ui/shadcn: authored component source (ui/),
                      vendored style token CSS (styles/), blocks/, lib/,
                      tests/
packages/marko-ui    the marko-ui CLI (init, add, diff, doctor, ...)
tooling              registry build + style-transform scripts
e2e/acceptance       published-package + live-registry acceptance suite
scripts/ci           axe scan, badge generation, CI serving
```

## Development

```sh
bun install
bun run --cwd apps/docs dev     # docs site
bunx vitest run                 # behavior + hydration suites (needs the docs server)
bun scripts/ci/axe-scan.ts out.json   # WCAG scan (needs the docs server)
```

CI runs all of the above against a production build on every push and
publishes the badge data on the [`badges`](https://github.com/svallory/marko-ui/tree/badges)
branch.

## Acknowledgements

Design adapted from [shadcn/ui](https://ui.shadcn.com) (MIT). Interactive
behavior by [Zag.js](https://zagjs.com). Built on
[Marko](https://markojs.com).
