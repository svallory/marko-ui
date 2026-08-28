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

**The gate now covers components.** `packages/shadcn/tsconfig.json`'s `include` carries `"ui/**/*.marko"` permanently (landed 2026-08-19), so `bun run check` typechecks every component — and it is **green: 0 errors** as of marko-zag `^1.2.0` (whose `PropTypes` maps all of Marko's native tags; earlier adapter versions collapsed prop getters to `any`, which is why components were never meaningfully checked before). Keep it green: fix type errors properly rather than casting, widening, or `@ts-ignore`-ing them, and treat a new error as a defect in the change that introduced it. A type error at a spread site usually means a real element mismatch — that class of check caught label props on a `<div>` and div-declared components rendering `<span>`/`<a>` the day the gate landed.

The `NODE_OPTIONS` heap bump is **required** — at the default heap size `marko-type-check` OOMs on this repo with a V8 stack dump. It is baked into each package script, so `bun run check` works without extra setup; keep it there if you edit those scripts. `tooling/` stays on plain `tsc` because it is pure `.ts` (no `.marko` files), where `marko-type-check` would add nothing.

Behavior tests (`packages/shadcn/tests/behavior/`) drive real Playwright against a **running docs dev server** — start `apps/docs` first, and pass `DOCS_BASE_URL` if it isn't on port 3000.

**Always start the dev server on an explicit port and pass `DOCS_BASE_URL`.** Port 3000 on the maintainer's machine is held by an unrelated app that answers HTTP 200 on every path with zero `section[data-demo]` elements; both the behavior tests and `e2e/verify-matrix.spec.ts` default to `http://localhost:3000`, so a stale listener there produces mass failures that look like component regressions but are not. Verify with `curl -s localhost:3000 | grep -o '<title>[^<]*'` before trusting any run.

The first request to a `/verify/*` route pays a **multi-minute cold Vite compile of all 765 generated routes** (the router imports every one). Warm it with a long-timeout `curl` before pointing Playwright at it, or `page.goto` times out; a request that fails during that window poisons Vite's module cache, and only a dev-server restart clears it. Behavior tests additionally use `waitUntil: "networkidle"`, which the dev server's open HMR websocket can keep from ever settling — those timeouts reproduce on `main` and are not caused by component changes. Playwright is resolved from the global homebrew install, not the workspace. SSR/unit tests (`packages/marko-ui/tests/`, `packages/shadcn/tests/hydration-invariant.test.ts`) need no server.

## The verify matrix: never update snapshots

`e2e/verify-matrix.spec.ts` captures DOM-structure text snapshots (`data-slot`/`role`/`data-state`/`aria-*`) of the post-hydration initial state for 9 styles x ~40 components. **Never run it with `--update-snapshots`, and treat every snapshot diff as a regression until proven otherwise.** A pure API migration must leave them byte-identical. On 2026-08-27 a blind `--update-snapshots` run rewrote 360 of them and nearly shipped two "regressions" that did not exist in the code — both were artifacts of pointing the run at a mis-configured server (see the dev-server note above). When a snapshot genuinely should change, change the source that changes it and say why in the PR, rather than regenerating the file to make the run green.

Note that portal-using components (`<zag-portal>`) render their `<div style="display:contents" data-portal>` host **inline in the SSR HTML, right after the trigger**, and reparent it to `<body>` in `onMount`. It is therefore absent from a correctly hydrated snapshot and present in one captured before hydration — a stray bare `div` after a trigger means the page was serialized too early, not that a component changed.

## Hard constraints

- **marko is pinned to 6.3.46** (bumped 2026-08-26 from 6.3.34 to pick up marko-js/marko#4062, which fixed a walk-order defect — see `connectFresh` history below). The 6.3.34→6.3.35 minification/reactivity regressions that originally motivated the 6.3.34 pin are gone by 6.3.46: a 10-page interactive-component regression sweep plus the full `hydration-invariant` suite (33/33) passed clean on a production build. Do not bump further without re-verifying those.
- **`marko` and `@marko/compiler` must resolve to exactly one shared instance workspace-wide.** `marko@6.3.46` requires `@marko/compiler@^5.42.3`; `@marko/type-check`/`@marko/run`/`@marko/vite` in this workspace only require `@marko/compiler@^5.42.0`. Because both ranges are already satisfied by whatever bun resolved before the bump, bun's resolver will NOT retroactively bump those consumers to `5.42.3` on `bun install` alone — it keeps them on their own already-satisfied nested `@marko/compiler@5.42.0`, producing two live compiler instances loaded into the same Vite/rolldown build. Symptom: production `bun run build` in `apps/docs` fails with hundreds of `Error: Unable to access Marko File outside of a compilation`, starting at `+layout.marko` (every page affected) — dev mode does not show it (single-instance esbuild path). Fix: a root `overrides: { "@marko/compiler": "<version>" }` in `package.json` (root `devDependencies` also carries an explicit exact pin as a visible anchor) — this is the correct, supported way to force single-instance resolution here, not a workaround. After any future marko/`@marko/compiler` bump, verify single-instance with `find . -path '*/node_modules/@marko/compiler/package.json' -not -path '*/.cache/*' | xargs grep '"version"'` (must show exactly one version) before trusting a green `bun run build`.
- **No React dependencies, ever.** Anything needed from the React shadcn package is vendored (e.g. `apps/docs/src/shadcn-tailwind.css` is a byte-copy of shadcn's `tailwind.css` export).
- All `@zag-js/*` packages stay on one exact version (currently 1.43.0) across every package.
- When porting a shadcn.com page or resource, use the `port-shadcn-resource` skill — freestyle ports have always drifted and had to be redone. shadcn source is resolved by `tooling/parity/harnesses/shadcn/upstream-shadcn.ts`: `SHADCN_UI_DIR` env var, else the maintainer's sibling clone at `../../data/shadcn-ui/`, else an auto-cloned `.upstream/shadcn-ui/` inside the repo.

## Architecture: the SSR-safe Zag pattern

Marko 6 is resumable: the server serializes reactive state and the client never re-runs render. Zag services and `connect()` APIs contain functions and are **unserializable**, so they must never be reactive state or cross a tag boundary as raw values — only template-written **closures** (getters) are serializable currency. Every interactive component follows the same shape (see `packages/marko-ui/README.md` for the full example):

1. Server renders full aria/data attributes from a never-started machine (a throwaway instance `<zag>` reads before mount).
2. Client builds its own service in `onMount`; `<zag>` returns the **api getter**, whose identity changes on every machine notify and on every tracked props change — no hand-written `rev` counter or dependency list.
3. Call the getter at every use site (`api().getRootProps()`); `<const>` recomputes automatically because the getter it reads is `!==` the previous one.

Registry components express this via marko-zag's `<zag>` tag (`packages/shadcn`'s single authored source, one line: `<zag/api=() => mod from=input/>`), which picks the machine's props out of `input`, generates an `id`, applies a default `on<X>Change` → Marko `xChange` sugar rule, creates and connects the service, and returns the api getter — collapsing the old three-tag `<machine-props>`/`<service>`/`<connect>` wiring (and the `rev`/`ServiceHandle` plumbing it needed) into one line. A component that needs the running service itself (to thread into a child, or connect a second module against it — see `toast/toast.marko`, `menubar/menu.marko`) uses `<zag-machine>` plus a plain `connect()` call instead; `<zag-machine>` returns a **service getter** (`service()`), never the raw service. Controlled props re-notify automatically: `<zag>`/`<zag-machine>` track whatever the `props=` closure reads.

`normalizeProps` is Marko-specific: `class`/`for` renames, style-object hyphenation, `event.currentTarget` shadowing (Marko delegates events), SSR handler stripping. `<zag>`/`connect()` apply it by default, so most components never import it.

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
- `notes/` — durable engineering knowledge: `css-architecture.md`, `style-ports.md`, `bug-marko-dynamic-tag-hydration-crash.md` (SSR→hydration boundary serializability contract: closure-wrap crossings, `() => Thing` — the correct design under resumability, not a workaround; includes the Marko 6.3.34 dynamic-tag crash case).
- `agent/reports/` — implementation reports (e.g. chart evaluation, compound-tag DX research).

## Repo Context

This directory is the root of a hyper space. Before doing anything here, you must read `HYPER.md` — all the rules for working in this directory live there.
