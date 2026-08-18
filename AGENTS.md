# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

marko-ui — "shadcn for Marko": a shadcn-format component registry ported to Marko 6, powered by Zag.js v1 state machines. Bun workspace with three packages:

- `packages/marko-ui` — the published library: SSR-safe Zag v1 bindings for Marko 6 (`createService`, `ssrService`, `normalizeProps`, and the `<machine-props>`/`<service>`/`<connect>` tags, plus `<portal>`). Ships `.ts`/`.marko` source directly — no dist build; consumers compile it with their own Marko-aware bundler.
- `packages/registry` — component source in shadcn registry format. `default/ui/<component>/<part>.marko` is the single authored source, tracking shadcn's `new-york-v4` and carrying semantic `mu-*` hook classes; `styles-src/style-<name>.css` vendors the 8 shadcn style token layers (rhea, nova, vega, lyra, maia, mira, luma, sera); `styles-gen/<style>/ui/...` is the per-style component tree the build generator emits from those two inputs (gitignored — run the build before it exists).
- `apps/docs` — the docs site (`@marko/run` + Vite + Tailwind v4), which is also the test target for behavior tests.

## Commands

Bun only — never npm. Run from the workspace root unless noted.

```bash
bun install
bun run check                  # tsc --noEmit across all workspace packages
bun run test                   # vitest run (all packages/**/*.test.ts)
bunx vitest run packages/registry/tests/behavior/tabs.test.ts   # single test file
bun run build:registry         # emit shadcn-CLI-compatible r/*.json
bun run extract:api            # component API extraction
bun run build:demos            # docs demos manifest
bun run build:blocks-manifest  # docs blocks manifest
cd apps/docs && bun run dev    # docs site, default port 3000
```

Behavior tests (`packages/registry/tests/behavior/`) drive real Playwright against a **running docs dev server** — start `apps/docs` first, and pass `DOCS_BASE_URL` if it isn't on port 3000. Playwright is resolved from the global homebrew install, not the workspace. SSR/unit tests (`packages/marko-ui/tests/`, `packages/registry/tests/hydration-invariant.test.ts`) need no server.

## Hard constraints

- **marko is pinned to 6.3.34** — 6.3.35 has minification/reactivity regressions. Do not bump without verifying those are fixed.
- **No React dependencies, ever.** Anything needed from the React shadcn package is vendored (e.g. `apps/docs/src/shadcn-tailwind.css` is a byte-copy of shadcn's `tailwind.css` export).
- All `@zag-js/*` packages stay on one exact version (currently 1.43.0) across every package.
- When porting a shadcn.com page or resource, use the `port-shadcn-resource` skill — freestyle ports have always drifted and had to be redone. shadcn source lives in the space clone at `../../data/shadcn-ui/`.

## Architecture: the SSR-safe Zag pattern

Marko 6 is resumable: the server serializes reactive state and the client never re-runs render. Zag services and `connect()` APIs contain functions and are **unserializable**, so they must never be reactive state. Every interactive component follows the same shape (see `packages/marko-ui/README.md` for the full example):

1. Server renders full aria/data attributes from a never-started machine (`ssrService`).
2. Client builds its own service in `onMount` and bumps a serializable `rev` counter on machine notify.
3. The `connect()` api lives inside a template closure (`computeUi`); `<const/ui=(rev, computeUi())/>` makes `rev` the recompute trigger, keeping only the plain attrs snapshot reactive.

Registry components express this via the three-tag pattern from `marko-ui`: `<machine-props>` (typed input), `<service>` (lifecycle), `<connect>` (api snapshot). Controlled props re-notify via `svc?.propsChanged()`.

`normalizeProps` is Marko-specific: `class`/`for` renames, style-object hyphenation, `event.currentTarget` shadowing (Marko delegates events), SSR handler stripping.

## Registry structure rules

- One authored component source (`packages/registry/default/`), not one full implementation per style. Components carry semantic `mu-*` hook classes; the 8 shadcn styles live as vendored CSS token layers in `packages/registry/styles-src/style-<name>.css`, and a generator (`packages/registry/scripts/build-styles.ts`) combines source + style layer into the per-style flat trees under `packages/registry/styles-gen/` (gitignored — a fresh clone has no style trees until the build runs). See `notes/style-ports.md` and `notes/plans/dual-distribution-plan.md` for the full architecture and its history.
- `packages/registry/package.json` `exports` lists each style subpath **explicitly** (`"./styles/rhea/*"` × 8, resolving to `styles-gen/rhea/*`). Never collapse to `"./styles/*"` — it would shadow the consumer theme files under `default/styles/` reached via the `"./*" → "./default/*"` fallback.
- Compound components use attr-tags with a **single tag name + `type` discriminant** when order matters — cross-name attr-tag order is unrecoverable in Marko. `items=` arrays remain as sugar. Docs: `/docs/creating-components` §5 and `notes/component-authoring.md`.

## Docs-app CSS (two-layer split)

`apps/docs/src/app.css` is a faithful port of shadcn's site `globals.css` (site tokens, multiplicative radius scale); `packages/registry/default/styles/globals.css` is the separate **consumer** theme that `shadcn add` users get. The docs app does not import the consumer theme. Tailwind `@source` globs must include `packages/registry/styles-gen/**` — utilities used only in style variants silently drop from the build otherwise. Full details and traps: `notes/css-architecture.md`.

## Dual distribution and the `mu-*` public styling API

There are two shipping paths, not one: **copy** (`marko-ui add` copies flat generated source from `styles-gen/` — classes are baked flat, "the code is mine now") and **import** (the single `@marko-ui/core` package, which ships the `mu-*` hook-class components plus the 8 precompiled `style-*.css` layers). For the import path, `mu-*` hooks are a **public styling API**: consumers override or switch styles from their own stylesheet. Full mechanics — the `@reference`/precompile step, the `layer(components)` requirement, and the `@custom-variant` shipping requirement — are documented in `notes/css-architecture.md`.

## Where knowledge lives

- `TODO.md` — decision log and work queue (decisions marked `(decision — made)` are settled; don't relitigate).
- `notes/` — durable engineering knowledge: `css-architecture.md`, `style-ports.md`, `bug-marko-dynamic-tag-hydration-crash.md` (known Marko 6.3.34 dynamic-tag hydration bug + workaround).
- `agent/reports/` — implementation reports (e.g. chart evaluation, compound-tag DX research).

## Repo Context

This directory is the root of a hyper space. Before doing anything here, you must read `HYPER.md` — all the rules for working in this directory live there.
