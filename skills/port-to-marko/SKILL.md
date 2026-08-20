---
name: port-to-marko
description: Port a UI component library (React/Vue/Svelte/CSS-only) to Marko 6 using Zag.js state machines, in the marko-ui registry format. Use when asked to port a component library, design system, or individual components to Marko, or to contribute a library to marko-ui. Covers destination routing (official repo vs community registry), the SSR-safe Zag pattern, Marko 6 landmines, and mechanical parity verification.
---

# Port a component library to Marko (marko-ui format)

You are porting a component library to [Marko 6](https://markojs.com), publishing it in the marko-ui registry format (shadcn-compatible JSON with Marko sources). Interactive behavior comes from [Zag.js](https://zagjs.com) state machines; styling stays Tailwind. The output is installable with `bunx marko-ui add`.

**Read `references/marko-gotchas.md` before writing any component** — every rule in it broke real components. Read `references/verification.md` before claiming anything works. Read `references/registry-publishing.md` when you reach publishing.

## Step 0 — Destination gate (do this FIRST)

Fetch the wanted-libraries list:

```
https://raw.githubusercontent.com/svallory/marko-ui/main/apps/docs/src/data/directory.json
```

Check whether the library you're porting is in the `wanted` array (match by name, case-insensitive).

- **Wanted library** → the port goes INTO the official marko-ui repo. Fork `https://github.com/svallory/marko-ui` NOW, create a branch, and follow that repo's own authoring docs (`CLAUDE.md`, `notes/component-authoring.md`, `/docs/creating-components`) — they take precedence over this skill where they overlap. Components go in `packages/shadcn/ui/<name>/` with a `registry.meta.json`; the finished PR must pass the repo's mechanical parity gate (see `references/verification.md` §Official-repo gate).
- **Not wanted** → the port becomes YOUR OWN community registry. Clone the template: `https://github.com/svallory/marko-ui-registry-template`. You own it, you host it (GitHub Pages workflow included), and you get listed in the directory with a one-line PR. Do NOT open a PR adding an unwanted library's components to the official repo — it will be closed; the directory path exists precisely so every port can ship without gatekeeping.

Tell the user which path applies before porting.

## Step 1 — Inventory the source library

Read the source library's actual code (clone it; don't work from screenshots or memory):

1. Enumerate its components. For each one, classify:
   - **Static** (badge, card, alert…): pure markup + classes. No machine needed.
   - **Interactive**: find the matching Zag machine at zagjs.com (accordion, dialog, menu, combobox, tabs, tooltip, slider, switch, toast… ~50 machines exist). Note the machine's `props`/`connect` API.
   - **No Zag equivalent** (rare): port the behavior with plain DOM in `onMount`, or skip and log it. Never ship a half-working approximation.
2. Map the styling system: Tailwind classes port as-is; CSS-in-JS or bespoke CSS must be converted to Tailwind utilities or a shipped stylesheet.
3. List shared utilities (`cn`, variant helpers) — these become `src/lib/` files.
4. Write the inventory down (component → classification → zag machine → dependencies) before porting anything. Present it to the user as the port plan.

## Step 2 — Port components

Work component by component, simplest first (build confidence in the pattern with a static component before the first machine).

**The parity bar**: same DOM structure as the source library, same class strings, same data attributes, same keyboard/pointer behavior. Internals differ (Zag instead of the source's JS) only where invisible to users and themes.

- Static components: single root element, `data-slot` marker, `cn()` class merge, `...rest` native-attr spread. See the template's `example-badge` for the exact shape.
- Interactive components: the `<machine-props>` + `<service>` + `<connect>` pattern from the `marko-zag` package — full shape, serialization rules, and every known landmine are in `references/marko-gotchas.md`. The reference implementations are the official registry's components: fetch any of them with `bunx marko-ui add <name>` into a scratch project, or read them at `https://github.com/svallory/marko-ui/tree/main/packages/shadcn/ui`.
- One component = one directory (`src/ui/<name>/`), one file per part, plus `variants.ts` when the source has variants.
- Register each finished component in `registry.json` (community path) or `registry.meta.json` (official path).

Commit per component or small group; each commit must build.

## Step 3 — Verify mechanically

"It looks right" is not verification. Follow `references/verification.md`: typecheck with `marko-type-check` (NEVER plain `tsc` — it silently skips `.marko` files), render every component through SSR + hydration on a production build, drive every interaction with real pointer events in a real browser, and screenshot-compare against the source library's live docs. Log every deviation you could not close.

## Step 4 — Publish

Follow `references/registry-publishing.md`:

- Community path: build with `marko-ui registry build`, validate, deploy, then one-line directory PR.
- Official path: run the repo's full check suite, then open the PR with your verification evidence.

## Non-negotiables

- Read files before porting them; port what is actually mounted, not what exists on disk (libraries ship dead code).
- No approximations: a component you can't port faithfully is skipped and logged, not faked.
- Report honestly: deviations, skips, and failures go in the final report. A disabled-but-visible feature beats a fake one.
