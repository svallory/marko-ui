---
name: port-to-marko
description: Use when porting a UI component library, design system, theme, or individual components (React/Vue/Svelte/CSS-only, e.g. shadcn, Radix, Ark) to Marko 6 in the marko-ui registry format, contributing a library to marko-ui, or auditing an existing port for parity drift against upstream (wrong markup, stale tokens, missing styles, docs rendering differently from users' apps).
---

# Port a component library to Marko (marko-ui format)

You are porting a component library to [Marko 6](https://markojs.com) and publishing it in the marko-ui registry format (shadcn-compatible JSON with Marko sources). Behaviour, where upstream HAS behaviour, comes from [Zag.js](https://zagjs.com) machines. Styling stays Tailwind. The output is installable with `bunx marko-ui add`.

**The goal is parity with what upstream users get, not with how you think it should be built.** Every divergence is a defect unless it is logged with a reason.

Reference files, and when to read them:

| File | When |
|---|---|
| `references/failure-classes.md` | Before Step 1. These are the 12 ways a real port drifted, each with a check. |
| `references/marko-gotchas.md` | Before writing any `.marko` file (Marko/Zag landmines, React-to-Marko attribute semantics). |
| `references/parity-checklist.md` | Per library in Step 1, per component in Steps 2–3. It is part of the report. |
| `references/verification.md` | Before claiming anything works. |
| `references/parity-process.md` | When building parity tooling (official path). |
| `references/registry-publishing.md` | At Step 5. |

## Step 0 — Destination gate (do this FIRST)

Fetch `https://raw.githubusercontent.com/svallory/marko-ui/main/apps/docs/src/data/directory.json` and check whether the library is in its `wanted` array (match by name, case-insensitive).

- **Wanted** → the port goes INTO the official repo. Fork `https://github.com/svallory/marko-ui`, branch, and follow its own docs (`CLAUDE.md`, `notes/component-authoring.md`, `/docs/creating-components`); they win where they overlap with this skill. Components go in `packages/shadcn/ui/<name>/` with `registry.meta.json`, and the PR must pass `references/verification.md` §Official-repo gate.
- **Not wanted** → your own community registry from `https://github.com/svallory/marko-ui-registry-template`. You host it and get listed with a one-line directory PR. Never PR an unwanted library into the official repo.

Tell the user which path applies before porting.

## Step 1 — Inventory upstream from its canonical source

Clone upstream and work from its code, never from screenshots, memory, or its docs site's appearance. Fill in the "Per library" block of `parity-checklist.md`:

1. **Pin the revision.** Record the upstream commit SHA. Every later comparison is against it.
2. **Find the canonical source for each artifact.** Use what upstream's CLI/installer emits TODAY: trace its code path. Repos carry legacy templates and fixtures that look right and are stale (shadcn: the current radius scale lives in `packages/shadcn/src/utils/updaters/update-css-vars.ts`, not the additive `calc(var(--radius) - 4px)` scale found in older templates and test fixtures).
3. **Inventory every installable style/variant/theme**, not only those a showcase page shows. For each upstream page or area, map which style it renders with (shadcn: chrome `new-york-v4`, previews `base-nova`, home cards `base-rhea`).
4. **Extract the emitted token set and theme-class scope**: which element or selector gets each theme class or token block.
5. **Classify each component from upstream's own shape**, with file:line evidence:
   - **Static**: upstream is markup + classes (badge, card, pagination). Port as markup. No machine, even if Zag has one.
   - **Behaviour**: upstream has state, focus, or keyboard logic in JS. Find the matching Zag machine and note its `props`/`connect` API.
   - **Behaviour, no Zag equivalent**: plain DOM in `onMount`, or skip and log it. Never ship an approximation.
6. **Map styling and shared utilities** (`cn`, variant helpers → `src/lib/`).
7. Present the inventory (component → shape + evidence → machine or none → deps; styles map; token set) to the user as the port plan.

## Step 2 — Port components

Load the `marko6` skill for language rules before writing `.marko` files. Go simplest first.

**The parity bar**: the same rendered HTML as upstream for every part and variant: element, role/aria, `data-slot`/`data-*` (false values included), class strings, defaults, icons, sr-only text. The same keyboard/pointer behaviour. The same public API. Internals may differ only where users and themes can't see it.

- Port what React **renders**, not the JSX: `marko-gotchas.md` §React-to-Marko.
- Never invent props, events, or demos. A demo is a 1:1 port of an upstream example with the upstream name. Anything ours-only is logged as extra.
- Static: single root, `data-slot`, `cn()` merge, `...rest` spread (template's `example-badge`). Behaviour: the `<zag>` tag (`marko-gotchas.md`). Reference implementations: `https://github.com/svallory/marko-ui/tree/main/packages/shadcn/ui`.
- One directory per component (`src/ui/<name>/`), one file per part, `variants.ts` if upstream has variants.
- Register it in `registry.json` (community) or `registry.meta.json` (official). Commit per component or small group, and each commit must build.

**Divergences**: every intentional difference (a11y fix, framework-forced gap) goes in the divergence log (official: `parity-ignore.json`) with a reason. It must be applied to EVERY place that produces the value for users: theme, variants, presets, generator data, docs. `grep -rn '<upstream literal>'` must show no unlogged hits.

## Step 3 — Docs consume the library like a user

- Import the package and the shipped CSS entry. Never copy upstream's site CSS or vendor a second copy of any stylesheet.
- Site CSS may only add chrome or override tokens. It never redefines library tokens, variants, or component classes.
- Build the chrome from the library's own components, as upstream's site does. No hand-rolled buttons or sidebars.
- Code samples are generated from, or CI-checked against, the real demo files.
- If upstream renders correctly and your docs don't, trace upstream's whole runtime chain, including third-party libraries (shadcn relies on `next-themes` setting `color-scheme`). Never patch it with a global rule upstream lacks.

## Step 4 — Verify mechanically

Follow `references/verification.md`: `marko-type-check` (never `tsc`), SSR + hydration on a production build, real pointer events, keyboard paths, axe. Then:

- Fill a `parity-checklist.md` "Per component" block with evidence: SSR HTML attribute/class diffs against upstream, not eyeballing.
- Visual evidence counts only from the authoritative environment (the CI runner that owns the baselines). Local runs against another platform's baselines are not a signal.
- An **independent reviewer** (a fresh subagent that did not write it) re-checks each component against upstream source using the checklist. Fix or log every finding.

## Step 5 — Publish

Follow `references/registry-publishing.md` (community: `marko-ui registry build` → validate → deploy → directory PR; official: full check suite → PR with evidence).

## Red flags: stop and re-check upstream

- "Every component uses a machine, so this one does too."
- "This file looks like the theme." (Did the CLI emit it?)
- "Our docs look wrong, so a global CSS rule fixes it."
- "It's verbatim." (Where is the diff?)
- "Visual tests pass locally."
- "I'll apply the fix to the main theme; the variants are similar."
- "I verified it myself."
- A prop, token, demo, or style exists in the port and you can't cite its upstream file:line.

## Non-negotiables

- Read files before porting them. Port what is mounted and emitted, not what exists on disk.
- No approximations: a component you can't port faithfully is skipped and logged.
- Report honestly: upstream SHA, divergence log, filled checklists, reviewer findings, failures.
