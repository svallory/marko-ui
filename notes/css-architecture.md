# Docs-app CSS architecture (parity with shadcn.com AND with a real consumer)

Written 2026-08-14; superseded 2026-09-26 by
`scratch/team-lead/briefs/docs-shipped-css.md` (the operator's explicit
requirement: docs must consume `@marko-ui/shadcn` exactly like a real user's
app does, so docs and a user's app can never render differently).
`apps/docs/src/app.css` now imports the shipped theme via
`@import "@marko-ui/shadcn/styles/globals.css"` — the same package export
`/docs/installation` tells a real consumer to use — instead of hand-copying
shadcn's site tokens into a parallel, independently-drifting file. Everything
below `app.css`'s own theme import must be STRICTLY ADDITIVE site chrome: it
must never redefine a token, `@custom-variant`, or restyle an `mu-*`/
`data-slot` component class the shipped theme already owns. See
`scratch/team-lead/reports/audit-docs-consumption.md` for the drift this
caught (radius formula, `data-selected` variant, `.mu-font-heading` layer,
chart palette, stale hover tokens on hand-rolled nav/sidebar links) and
`report-docs-shipped-css.md` for the fix.

## The import chain

```
tailwindcss → tw-animate-css → @marko-ui/shadcn/styles/globals.css (shipped
theme: tokens, @custom-variant data-*/dark, base layer, .mu-font-heading,
accordion keyframes) → ./vendor-utilities.css (scroll-fade/shimmer, vendored
generic Tailwind utilities with no token overlap) → ./legacy-themes.css
(customizer theme swatches, scoped under .theme-<name>) → ./site-tokens.css
(SITE-ONLY additive tokens: fonts, breakpoints, surface/code/selection)
→ @fontsource-variable/geist{,-mono} → typeset.css
```

- `vendor-utilities.css` (formerly `shadcn-tailwind.css`) keeps only the
  generic utilities (scroll-fade, shimmer) upstream's npm `tailwind.css`
  ships that have no shipped-theme equivalent. The token/@custom-variant
  boilerplate it used to carry is gone — it duplicated `globals.css`
  byte-for-byte except for one real bug (a narrower, un-widened
  `data-selected` variant that could never match zag-js's `data-selected=""`).
- Fonts: shadcn uses next/font (Geist / Geist Mono); we load the same faces
  from @fontsource-variable and define `--font-sans/--font-heading/--font-mono`
  in `:root` (now in `site-tokens.css`, a genuinely site-only token).

## The theme is shipped, not forked

- `packages/shadcn/styles/globals.css` = the CONSUMER theme (what
  `shadcn add` users get) — now ALSO what the docs site itself imports.
  Radius scale is multiplicative (`--radius × 0.6…2.6`, sm through 4xl),
  matching upstream's current CLI output (verified against
  `data/shadcn-ui/packages/shadcn/src/utils/updaters/update-css-vars.ts` and
  `data/shadcn-ui/apps/v4/app/globals.css`) — NOT the additive `-4px/+4px`
  scale an earlier version of this file described; that scale only appears
  in upstream's CLI test fixture for preserving a pre-existing user file, not
  what a fresh init writes.
- `site-tokens.css` = strictly ADDITIVE site-only tokens with no shipped
  equivalent: fonts, `3xl`/`4xl` breakpoints, `surface`/`code*`/`selection*`
  (docs-chrome syntax highlighting and prose selection). It must never
  redeclare a token `globals.css` already owns.
- `marko-accordion.css` (measured-height accordion keyframes) is inlined into
  `globals.css` itself now, so `apps/docs/src/app.css` no longer imports it
  separately; `bare.css` (which also now imports `globals.css` directly) gets
  it the same way. The standalone file remains published for a consumer who
  does NOT install the shipped theme at all.

## Non-obvious mechanics

- `:root` chart vars are BLUE again (Round 2, `site-theme.css`), matching
  upstream's own docs site (`data/shadcn-ui/apps/v4/app/globals.css:120-124`)
  — but now as a clearly-labeled site-level THEME OVERRIDE layered on top of
  the shipped theme's grey default, not an uncommented duplicate `:root`
  block silently forking it (that was the Round 1 bug, audit finding 1.3;
  the fix there was deleting the fork, the fix here is re-adding the same
  values as a legitimate, cited override — see `site-theme.css`'s header).
  The masonry wrapper still carries `theme-neutral` (legacy-themes.css remaps
  `--chart-*` inside it) and body still carries `theme-default` — both
  unrelated customizer-preset mechanisms, unchanged.
- `@source` globs MUST include `packages/shadcn` — a style-only utility that
  no scanned file uses is silently absent from the build (this bit us: cards
  rendered square/unpadded because the style layers weren't scanned). The
  package ships the 8 style layers as SOURCE CSS (`styles/style-<name>.css`),
  not precompiled; the docs app's own Tailwind build compiles them, so it must
  actually see them via `@source`.
- `<html>` carries `--header-height`, `<body>` carries `--footer-height`
  (spacing-calc arbitrary properties, copied from shadcn's layout).
- `.theme-marko` (brand chart palette, header toggle) is a sanctioned
  deviation; everything else must stay byte-faithful to shadcn.
- Shiki token colors ride shadcn's own mechanism plus our
  `[style*="--shiki-light"]` selectors at the end of app.css.

## The `mu-*` hooks: a public styling API for the `import` distribution path

This section is about the registry's consumer-facing distribution, not the
docs site itself — it documents the API surface that npm consumers of
`@marko-ui/shadcn` (the "import" path, as opposed to `marko-ui add`'s "copy"
path) rely on. See `notes/plans/dual-distribution-plan.md` and
`notes/plans/restructure-shadcn-packages.md` for the full model; this is the
operational reference for anyone wiring up or documenting the import path's
CSS.

Every registry component carries semantic `mu-*` hook classes (`mu-button`,
`mu-accordion-trigger`, and so on) baked directly into its markup —
regardless of which distribution path is used. For the copy path these hooks
are inert decoration; the flat generated Tailwind utility classes do the
actual styling. For the **import** path they are load-bearing: `mu-*` is the
public API surface a consumer's own stylesheet targets to theme, override,
or switch between styles, e.g.:

```css
.style-vega .mu-button { @apply rounded-none; }
```

`@marko-ui/shadcn` ships one hook-class component tree plus all 8 style
layers **as SOURCE** (`styles/style-<name>.css`) — not precompiled. The
package ships source, not compiled CSS: every Marko+Tailwind consumer already
runs Tailwind, so precompiling bought nothing and would have baked in our
own theme/scale/plugins instead of the consumer's (see
`notes/plans/spike-3a-verdict.md` for the superseded precompiled verdict and
why it changed). The consumer adds `@marko-ui/shadcn` to their own Tailwind
`@source` globs, and their own build compiles the `@apply`-based style
layers against their own theme. Switching styles at runtime is just toggling
a `style-<name>` class on an ancestor element — no rebuild.

Two requirements here are silent-failure traps: get either wrong and
everything still renders, so the break only shows up as "my override doesn't
work" or "my variant classes do nothing."

- **Import each style layer with `layer(components)`.** Imported raw, a
  style layer's rules land outside any cascade layer, and unlayered CSS beats
  *every* layered declaration unconditionally — including Tailwind's `@layer
  utilities`. A consumer writing `class="rounded-none"` on `mu-button` will
  silently lose to the style layer no matter how specific the selector is.
  The correct form:

  ```css
  @import "@marko-ui/shadcn/styles/style-vega.css" layer(components);
  ```

  This requirement is unchanged by the move to source shipping — it applies
  to source style layers identically to how it applied to the precompiled
  ones.

- **Ship the `@custom-variant` definitions.** The `data-open:`, `data-state-*:`
  and similar variants the components rely on are defined via Tailwind's
  `@custom-variant` in `globals.css`. Without them in the consumer's own
  Tailwind build, those variant classes parse fine but compile to nothing —
  no error, just dead styling.

## Dev-server gotchas

- The dev server process caches package.json `exports` maps (enhanced-resolve)
  — after editing registry exports, a full server restart is required.
- Touching `vite.config.ts` makes vite self-restart but marko-run does NOT
  re-register its routes afterwards (everything 404s, "Cannot GET /"). Kill
  and rerun `bun run dev` instead.
- Never run two marko-run processes (dev/build/preview) in the same app folder
  — they fight over `.marko-run` and corrupt it. Separate worktrees are safe.
