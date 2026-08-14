# Docs-app CSS architecture (parity with shadcn.com)

Written 2026-08-14. `apps/docs/src/app.css` is a faithful port of shadcn's
`apps/v4/app/globals.css` — same import chain, token map, layers, utilities —
so any shadcn theme's CSS variables restyle the site with zero changes.

## The import chain

```
tailwindcss → tw-animate-css → ./shadcn-tailwind.css (vendored)
→ ./legacy-themes.css (copied verbatim) → @fontsource-variable/geist{,-mono}
→ marko-accordion.css → typeset.css
```

- `shadcn-tailwind.css` is a byte-copy of the npm `shadcn` package's
  `tailwind.css` export (v4.18.0): data-* custom variants, scroll-fade,
  shimmer, accordion keyframes. We vendor it — this project must never depend
  on the React shadcn package.
- Fonts: shadcn uses next/font (Geist / Geist Mono); we load the same faces
  from @fontsource-variable and define `--font-sans/--font-heading/--font-mono`
  in `:root`. Noto Arabic/Hebrew are not loaded; the `[data-lang]` hooks remain.

## Two-layer split

- `packages/registry/default/styles/globals.css` = the CONSUMER theme (what
  `shadcn add` users get; additive radius scale, standard values).
- `apps/docs/src/app.css` = the SITE css (shadcn's site tokens: pure-black
  foreground/primary, blue-300..800 charts, MULTIPLICATIVE radius scale
  sm→4xl = `--radius × 0.6…2.6`, surface/code/selection tokens, 3xl/4xl
  breakpoints, `fixed` variant). The docs app does NOT import the consumer
  theme — exactly like shadcn's site.
- `marko-accordion.css` (measured-height accordion keyframes) is shared by
  both via import; see its header for the Lightning-CSS keyframes-dedup trap.

## Non-obvious mechanics

- Homepage charts are GRAY although `:root` chart vars are blue: the masonry
  wrapper carries `theme-neutral`, and legacy-themes.css remaps `--chart-*`
  inside it. Body carries `theme-default` (shadcn sets it via
  ActiveThemeProvider; we set it statically).
- `@source` globs MUST include `packages/registry/styles/**` — a style-only
  utility that no scanned file uses is silently absent from the build (this
  bit us: cards rendered square/unpadded because `styles/` wasn't scanned).
- `<html>` carries `--header-height`, `<body>` carries `--footer-height`
  (spacing-calc arbitrary properties, copied from shadcn's layout).
- `.theme-marko` (brand chart palette, header toggle) is a sanctioned
  deviation; everything else must stay byte-faithful to shadcn.
- Shiki token colors ride shadcn's own mechanism plus our
  `[style*="--shiki-light"]` selectors at the end of app.css.

## Dev-server gotchas

- The dev server process caches package.json `exports` maps (enhanced-resolve)
  — after editing registry exports, a full server restart is required.
- Touching `vite.config.ts` makes vite self-restart but marko-run does NOT
  re-register its routes afterwards (everything 404s, "Cannot GET /"). Kill
  and rerun `bun run dev` instead.
- Never run two marko-run processes (dev/build/preview) in the same app folder
  — they fight over `.marko-run` and corrupt it. Separate worktrees are safe.
