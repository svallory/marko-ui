# marko-ui

**shadcn for [Marko](https://markojs.com) — and beyond it.**

[![Tests](https://img.shields.io/endpoint?url=https%3A%2F%2Fraw.githubusercontent.com%2Fsvallory%2Fmarko-ui%2Fbadges%2Fchecks.json)](https://github.com/svallory/marko-ui/actions/workflows/ci.yml)
[![WCAG 2.2 AA automated scan](https://img.shields.io/endpoint?url=https%3A%2F%2Fraw.githubusercontent.com%2Fsvallory%2Fmarko-ui%2Fbadges%2Faxe.json)](https://github.com/svallory/marko-ui/blob/main/scripts/ci/axe-scan.ts)
[![Lighthouse accessibility](https://img.shields.io/endpoint?url=https%3A%2F%2Fraw.githubusercontent.com%2Fsvallory%2Fmarko-ui%2Fbadges%2Flighthouse-accessibility.json)](https://github.com/svallory/marko-ui/actions/workflows/lighthouse.yml)
[![Hydration invariance](https://img.shields.io/endpoint?url=https%3A%2F%2Fraw.githubusercontent.com%2Fsvallory%2Fmarko-ui%2Fbadges%2Fhydration.json)](https://github.com/svallory/marko-ui/tree/main/packages/shadcn/tests)

86 accessible, themeable components for Marko 6, in 9 complete styles,
installable with the shadcn CLI. Interactive behavior comes from
[Zag.js](https://zagjs.com) state machines — the same core behind Chakra's
Ark UI — not hand-rolled event handlers.

**Docs & demos: [marko-ui.saulo.tech](https://marko-ui.saulo.tech)**

## Why marko-ui

- **Every component works before JavaScript arrives.** Marko streams
  server-rendered HTML with the correct ARIA and state attributes already in
  place, then *resumes* — it never re-runs your components in the browser.
  Verified by an automated hydration-invariance suite: interactive components
  produce byte-identical accessibility/state attributes with JS disabled vs
  after hydration.
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
- **Accessibility is tested, not claimed.** WAI-ARIA APG keyboard contracts
  run as Playwright tests in CI; every component demo page passes an
  axe-core WCAG 2.2 A/AA scan (CI fails on a single violation) and scores
  100 on Lighthouse accessibility.
- **Copy-paste philosophy, source-first.** Components ship as readable
  `.marko` source compiled by YOUR bundler — friendly to IDEs, code review,
  and AI agents. No opaque dist blobs.

## Quick start

marko-ui is distributed through the shadcn CLI's registry protocol:

```sh
# initialize a Marko project with a marko-ui style
bunx marko-ui@latest init https://marko-ui.saulo.tech/r/style.json

# add components
bunx marko-ui@latest add https://marko-ui.saulo.tech/r/switch.json
```

Existing shadcn themes drop in unchanged — marko-ui uses the canonical CSS
variable names, and all four shadcn base colors (zinc, slate, stone, gray)
ship as selectable style items with values byte-identical to shadcn's.

See the [installation guide](https://marko-ui.saulo.tech/docs/installation)
for the full walkthrough.

## Styles

The `default` style plus 8 more — every component re-styled, not re-skinned:
`luma`, `lyra`, `maia`, `mira`, `nova`, `rhea`, `sera`, `vega`. One component
source carries semantic `mu-*` hook classes; each style is a vendored CSS
token layer combined with that source by a build step, so styling a component
differently is a token/CSS change, not a separate hand-maintained tree.
A generated Playwright matrix renders, hydrates, and interacts with every
component in every style on every push — one check per entry in
`apps/docs/src/routes/verify/manifest.json` (711 at the time of writing).

## Repository layout

```
apps/docs            docs site (also serves the registry JSON at /r/*)
packages/shadcn      @marko-ui/shadcn: authored component source (ui/),
                      vendored style token CSS (styles/), blocks/, lib/,
                      tests/
packages/marko-ui    the marko-ui CLI (init, add, diff, doctor, ...)
tooling              registry build + style-transform scripts
e2e                  style-matrix verification suite
scripts/ci           axe scan, badge generation, CI serving
```

## Development

```sh
bun install
bun run --cwd apps/docs dev     # docs site
bunx vitest run                 # behavior + hydration suites (needs the docs server)
bunx playwright test            # style matrix (needs the docs server)
bun scripts/ci/axe-scan.ts out.json   # WCAG scan (needs the docs server)
```

CI runs all of the above against a production build on every push and
publishes the badge data on the [`badges`](https://github.com/svallory/marko-ui/tree/badges)
branch.

## Acknowledgements

Design adapted from [shadcn/ui](https://ui.shadcn.com) (MIT). Interactive
behavior by [Zag.js](https://zagjs.com). Built on
[Marko](https://markojs.com).
