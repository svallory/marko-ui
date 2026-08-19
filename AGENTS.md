# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

marko-ui — "shadcn for Marko": a shadcn-format component registry ported to Marko 6, powered by Zag.js v1 state machines. Bun workspace with three packages:

- `packages/marko-ui` (npm name `marko-ui`) — the published CLI: install and manage Marko UI components from shadcn-format registries (`init`, `add`, `diff`, `show`, `search`, `doctor`, `manifest`, `registry`). Builds with tsup and publishes `dist/` only (`files: ["dist"]`; `exports`/`bin` point at `./dist/...`), so consumers just run `bunx marko-ui init` — no bundler of their own required.
- `packages/shadcn` (npm name `@marko-ui/shadcn`) — component source in shadcn registry format. `ui/<component>/<part>.marko` is the single authored source, tracking shadcn's `new-york-v4` and carrying semantic `mu-*` hook classes; `styles/style-<name>.css` vendors the 8 shadcn style token layers (rhea, nova, vega, lyra, maia, mira, luma, sera) as SOURCE — the package ships source, not precompiled CSS, so import-path consumers add it to their own Tailwind `@source` and compile the `@apply`-based style layers themselves. Per-style flat components (the copy-path artifact `marko-ui add` fetches) are transformed IN MEMORY during the registry build — there is no on-disk `styles-gen/`.
- `apps/docs` — the docs site (`@marko/run` + Vite + Tailwind v4), which is also the test target for behavior tests.
- `tooling/` — build + check scripts (`build-registry.ts`, `check-*.ts`, `transform-*.ts`, etc.), run directly with `bun tooling/<script>.ts`. No package.json.

## Commands

Bun only — never npm. Run from the workspace root unless noted.

```bash
bun install
bun run check                  # typecheck all packages + tooling/ + the check-*.ts invariant scripts
bun run test                   # vitest run (all packages/**/*.test.ts)
bunx vitest run packages/shadcn/tests/behavior/tabs.test.ts   # single test file
bun run build:registry         # emit shadcn-CLI-compatible r/*.json
bun run extract:api            # component API extraction
bun run build:demos            # docs demos manifest
bun run build:blocks-manifest  # docs blocks manifest
cd apps/docs && bun run dev    # docs site, default port 3000
```

**Typechecking uses `@marko/type-check`, not `tsc`.** `tsc` cannot parse `.marko` at all, so any `tsc --noEmit` run over this repo silently checks only the `.ts` files and reports success while every component goes unchecked. Each package's `check` script therefore runs:

```bash
NODE_OPTIONS="--max-old-space-size=8192" marko-type-check -p . -d condensed
```

**The gate now covers components.** `packages/shadcn/tsconfig.json`'s `include` carries `"ui/**/*.marko"` permanently (landed 2026-08-19), so `bun run check` typechecks every component. It is currently **expected red: 87 errors across 34 components**, 82 of them one upstream `marko-zag` defect (its `src/prop-types.ts` hardcodes the generic prop-getter fallback as `element: Marko.Input<"div">`, so Zag getters targeting `<span>`/`<li>`/`<ul>` fail to spread) — the fix is requested upstream and the count drops to ~5 when it ships. Do NOT cast, widen, or `@ts-ignore` around those 82; they are the adapter's to fix. New errors you introduce DO count: measure before and after your change and hold the line at the documented number. See TODO.md § Quality for the breakdown.

The `NODE_OPTIONS` heap bump is **required** — at the default heap size `marko-type-check` OOMs on this repo with a V8 stack dump. It is baked into each package script, so `bun run check` works without extra setup; keep it there if you edit those scripts. `tooling/` stays on plain `tsc` because it is pure `.ts` (no `.marko` files), where `marko-type-check` would add nothing.

Behavior tests (`packages/shadcn/tests/behavior/`) drive real Playwright against a **running docs dev server** — start `apps/docs` first, and pass `DOCS_BASE_URL` if it isn't on port 3000. Playwright is resolved from the global homebrew install, not the workspace. SSR/unit tests (`packages/marko-ui/tests/`, `packages/shadcn/tests/hydration-invariant.test.ts`) need no server.

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

- One authored component source (`packages/shadcn/ui/`), not one full implementation per style. Components carry semantic `mu-*` hook classes; the 8 shadcn styles live as vendored CSS token layers in `packages/shadcn/styles/style-<name>.css`, shipped as SOURCE (not precompiled). Per-style flat components for the copy path are transformed IN MEMORY by `tooling/build-registry.ts` (which calls `tooling/transform-marko.ts`/`transform-variants.ts` per style) — there is no on-disk `styles-gen/`. See `notes/style-ports.md` and `notes/plans/dual-distribution-plan.md` for the full architecture and its history.
- `packages/shadcn/package.json` `exports` lists `./ui/*`, `./lib/*`, `./styles/*`, `./blocks/*` pointing directly at the real authored files — no generated indirection.
- Compound components use attr-tags with a **single tag name + `type` discriminant** when order matters — cross-name attr-tag order is unrecoverable in Marko. `items=` arrays remain as sugar. Docs: `/docs/creating-components` §5 and `notes/component-authoring.md`.

## Docs-app CSS (two-layer split)

`apps/docs/src/app.css` is a faithful port of shadcn's site `globals.css` (site tokens, multiplicative radius scale); `packages/shadcn/styles/globals.css` is the separate **consumer** theme that `shadcn add` users get. The docs app does not import the consumer theme. Tailwind `@source` must include `packages/shadcn` so the site's own Tailwind build compiles the imported source style layers — utilities used only in style variants silently drop from the build otherwise. Full details and traps: `notes/css-architecture.md`.

## Dual distribution and the `mu-*` public styling API

There are two shipping paths, not one: **copy** (`marko-ui add` copies per-style flat generated source, transformed in memory at build time — classes are baked flat, "the code is mine now") and **import** (the `@marko-ui/shadcn` package, which ships the `mu-*` hook-class components plus the 8 style layers **as source**, for the consumer's own Tailwind to compile). For the import path, `mu-*` hooks are a **public styling API**: consumers override or switch styles from their own stylesheet. Full mechanics — the `layer(components)` requirement and the `@custom-variant` shipping requirement — are documented in `notes/css-architecture.md`.

## Where knowledge lives

- `TODO.md` — decision log and work queue (decisions marked `(decision — made)` are settled; don't relitigate).
- `notes/` — durable engineering knowledge: `css-architecture.md`, `style-ports.md`, `bug-marko-dynamic-tag-hydration-crash.md` (known Marko 6.3.34 dynamic-tag hydration bug + workaround).
- `agent/reports/` — implementation reports (e.g. chart evaluation, compound-tag DX research).

## Repo Context

This directory is the root of a hyper space. Before doing anything here, you must read `HYPER.md` — all the rules for working in this directory live there.
