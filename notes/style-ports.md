# Style ports: all 8 shadcn styles in Marko

Written 2026-08-14 after porting every shadcn style (rhea, nova, vega, lyra,
maia, mira, luma, sera) — ~54 components each — plus the 8 chat primitives
(message, bubble, attachment, marker, message-scroller, sonner, direction,
questionnaire) into the registry.

## Layout & imports

- `packages/registry/default/ui/<component>/<part>.marko` — the default
  registry, tracks shadcn's `registry/new-york-v4`.
- `packages/registry/styles/<style>/ui/<component>/<part>.marko` — one dir per
  shadcn style. Import as `@marko-ui/registry/styles/<style>/ui/...`.
- The package `exports` map lists each style subpath EXPLICITLY
  (`"./styles/rhea/*": ...` × 8). Do NOT collapse to `"./styles/*"` — that
  pattern shadows the consumer theme files (`./styles/globals.css`,
  `./styles/marko-accordion.css`) which live under `default/styles/` via the
  `"./*" → "./default/*"` fallback.

## Why one implementation per style (not per base)

shadcn ships 24 trees (`{base,aria,radix}-<style>`), but the three bases only
differ in React primitive library — their Tailwind class strings are
byte-identical per style (verified by diffing). Our zag.js internals replace
all three, so one Marko tree per style is complete. The `/create` base picker
still reloads the preview (parity of behavior), it just loads identical markup
by design.

## The porting method (proven ~500 times)

1. Read the style source FULLY: `data/shadcn-ui/apps/v4/styles/base-<style>/ui/<name>.tsx`.
2. Copy the rhea (or default) Marko port — keep zag wiring, attr-tag API,
   imports (`#lib/utils.ts`) untouched.
3. Swap ONLY class strings, `data-slot` values, variant maps, `data-*`
   attributes — VERBATIM. Where the source composes several cn() chunks, keep
   them as separate cn() arguments (merging breaks string-level audits).
4. cva() → plain object-lookup `variants.ts`.
5. Verify: compile every file (`compileFileSync` from the worktree's
   `node_modules/.bun/marko@6.3.34/.../@marko/compiler`) + run the
   string-parity audit (below).

## String-parity audit

Regex-extract every class-looking string (≥~25 chars, has spaces + tailwind-ish
tokens) from the style's tsx source and check it appears verbatim somewhere in
our component dir. ~15-line python script; per-component missing counts are the
review signal. Every style lands at 84–99 residual misses, ALL in the same
structural categories (below) — a component outside those categories with
misses is a real porting bug.

## Known structural residuals (shared by all 8 styles, documented in-file)

- sidebar: mobile Sheet branch + Rail/Inset/Sub-menu parts unported
- toast: Base UI swipe/stack geometry replaced by zag's `--x/--y/--scale`
- dropdown/context-menu/menubar: flattened `entries` model — no submenu,
  checkbox-item, radio-item anatomy (dropdown-menu now supports a label-body
  entry, added for the blocks nav-user)
- select: no scroll-arrow buttons (no zag API), group labels partial
- combobox: chips/multi-select mode + InputGroup wrapper omitted
- command: CommandDialog composition omitted
- drawer: nested-stack internals; per-direction cva split vs source's single
  attribute-keyed string
- input-otp: real input per slot → native caret; fake-caret overlay unportable
- calendar: `captionLayout="dropdown"`, week numbers unported
- navigation-menu: Base UI Positioner/Popup/Viewport fold + exit-phase attrs
- exit animations generally: zag unmounts on close, so `data-closed:*` /
  `data-ending-style:*` classes are present-but-inert (kept verbatim anyway)

Closing any of these = change the shared anatomy in `default/ui` first, then
propagate to all 8 styles.

## Marko attr patterns the styles rely on

- Marko renders boolean attrs bare (`data-open` not `data-open="true"`), so any
  class targeting `data-open:` / `data-checked:` / `data-active:` needs the
  attr computed as a string: `data-open=String(x)`.
- Base UI targets `data-checked`/`data-open`; zag emits `data-state=*`. The DOM
  must emit exactly what the class string targets — compute it, don't rely on
  zag's native attrs.
- `{...rest}` spreads LAST so composition call sites can override `data-slot`
  (shadcn spreads props last; several parts depend on it, e.g.
  ButtonGroupSeparator overriding Separator's slot).
- `w-(--radix-dropdown-menu-trigger-width)` ↔ zag popper's `--reference-width`.

## Fleet lessons (for future mass ports)

- Haiku is reliable for mechanical class swaps (statics, forms, structure) and
  ~40% cheaper/faster; it is NOT reliable for overlay components (multi-part
  positioner/popup/arrow strings, transition-phase attrs) — the first nova
  overlay pass left four components on rhea strings while reporting success.
  Use Sonnet for overlays, and always re-run the audit yourself before commit.
- Agents' "audit script variance" claims are usually real misses.
- Give every brief: the parity constraint verbatim, the gotchas above, a
  mandatory compile step, and the audit script path — and forbid modifying the
  audit script.
