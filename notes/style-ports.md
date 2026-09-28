# Style ports: all 8 shadcn styles in Marko

Written 2026-08-14 after porting every shadcn style (rhea, nova, vega, lyra,
maia, mira, luma, sera) — ~54 components each — plus the 8 chat primitives
(message, bubble, attachment, marker, message-scroller, sonner, direction,
questionnaire) into the registry, by hand-porting one full component tree per
style.

**Superseded 2026-08-17.** That hand-ported approach (one full implementation
per style, ~1,880 files) was a premise error: the 8 hand-ported trees turned
out to be byte-identical modulo the style name, meaning there were never any
real per-style deltas to hand-maintain in the first place. All 1,880 files
were deleted in `0ee60878`. The current architecture — one authored source
plus vendored CSS token layers plus a generator — is described in
`notes/plans/dual-distribution-plan.md` and `notes/plans/
style-refactor-fleet-plan.md`; the package merge and source-shipping decision
that superseded precompiled shipping are in
`notes/plans/restructure-shadcn-packages.md`. This file's porting method and
structural notes below are kept as historical record of how the (now-replaced)
hand ports were produced; do not use them as a guide for current work.

## Upstream sync log

**Last synced to upstream shadcn 98a1fe6 on 2026-09-28 (styles + bases/base).**
No SHA had ever been recorded before this entry — `tooling/parity/harnesses/
shadcn/upstream-shadcn.ts`'s `ensureShadcnClone` clones upstream's tip with no
pin, so there was nothing to grep for. The prior base was estimated (by CSS
content matching, not a recorded fact) to sit strictly between upstream
`a85299a` (2026-08-12) and `5c8f5b0` (2026-08-17). This sync applied the one
real change in that window: `5c8f5b0`'s `group-has-[:focus-visible]/
field-label:*` additions to `.mu-checkbox`/`.mu-radio-group-item`/`.mu-switch`/
`.mu-field-label` across all 8 `packages/shadcn/styles/style-*.css` files
(`.mu-questionnaire-choice` skipped — we don't ship that hook/component), plus
the `data-pending-scroll:invisible` CSS hook on `packages/shadcn/ui/
message-scroller/classes.ts`'s `viewport.root` (CSS class only — see below for
why the attribute-writing logic itself is not ported). Full research and
per-rule detail: `scratch/
team-lead/reports/research-upstream-98a1fe6.md` and `scratch/team-lead/
reports/report-upstream-98a1fe6.md`. Next sync should record its base SHA
here immediately, since the clone tool still has no pin mechanism.

**The ported `group-has-[:focus-visible]/field-label:*` rules are currently
inert.** They are a faithful port (parity with upstream is still correct to
keep — they cost nothing and match if the composition below ever changes),
but they never fire in our markup today: `Checkbox`/`Switch`/`RadioGroup`
each render their OWN root `<label>` around the control, and `FieldLabel`
also renders a `<label>` — nesting one `<label>` inside another is invalid
HTML, so `FieldLabel` is always used as a SIBLING (`for=`/`id=` pairing),
never as a wrapper. Since the upstream selector's whole mechanism is
`group-has-[:focus-visible]/field-label` — the control detecting
focus-visible on a `:focus-visible` descendant *inside its ancestor
field-label* — and our control is never a descendant of a `field-label` in
the first place, the rule can never match. See
`apps/docs/src/demos/field/field-checkbox.marko`'s own comments for the
concrete nested-label trap this avoids. Revisit if `FieldLabel` ever grows a
wrapping composition mode.

**`data-pending-scroll` is now ported (2026-09-28, branch
`feat/message-scroller-pending-scroll`, closes #78) — mount-order-aware,
client-only.** An earlier attempt (commit `cd2fdb17`, reverted in
`0dac72cd`) hit a HIGH bug: `packages/shadcn/ui/message-scroller/
content.marko`'s `onMount` called `controller().handleContentChange()`
unconditionally, and Marko mounts a child (`content`) before its ancestor
(`viewport`) finishes mounting. With an SSR'd non-empty transcript,
`handleContentChange` therefore ran `applyDefaultScrollPosition()` while
the controller's `viewport` ref was still `null` — that call failed
(returned `false` without ever setting `viewport`), so the
`pendingDefaultScroll` flag stayed `true` and was never retried. When
`viewport.marko`'s own `onMount` later called `setViewportElement`, it
mirrored that still-`true` flag onto the real element, and nothing in this
component ever called `init()` from a `.marko` file to re-run
`applyDefaultScrollPosition()` afterward — so the viewport got
`data-pending-scroll` permanently and, styled with the `invisible` hook,
disappeared for good. This was real mount-order fragility specific to
Marko's child-before-ancestor mount order (the opposite of React's
top-down effect order, which is why upstream's identical-looking logic is
safe there), not a hypothetical: the unit tests added alongside `cd2fdb17`
missed it because they registered refs in an order (root, then viewport,
then optionally content) the real component tree never produces.

**The fix: gate the FIRST content sync on all three parts being
registered, regardless of order, instead of triggering it unconditionally
from `content.marko`'s own mount.** `lib/controller.ts` adds
`tryInitialSync()`, called from `setRootElement`/`setViewportElement`/
`setContentElement` whenever an element registers; it runs
`handleContentChange()` exactly once (`initialSyncDone` flag), the moment
the LAST of root/viewport/content becomes non-null — whichever setter that
happens to be. `content.marko`'s `onMount` no longer calls
`handleContentChange()` directly at all (its `<MutationObserver>` still
drives every *later* content change as before). This makes the fix
genuinely mount-order-independent, not just "fixed for the observed
order": the controller unit tests (`lib/controller.test.ts`) exercise
content-before-viewport-before-root (the real tree's order),
root-before-viewport-before-content, and viewport-before-content-before-
root, all three landing on the same cleared state.

**SSR story: client-only, not render-time (option (b) from the task
brief), and it does not reintroduce a flicker.** The controller is
browser-only (message-scroller-provider.marko's SERIALIZATION RULE), so it
can never write `data-pending-scroll` into SSR markup — a static
`defaultScrollPosition` input threaded past the controller would close
that specific gap but widens the component's input surface beyond
controller.ts, out of this task's scope. This does not cost a flicker: all
three parts' `tryInitialSync` calls happen synchronously during Marko's
single mount pass (no `requestAnimationFrame` in between), and
`applyDefaultScrollPosition()`'s `scrollTo`/`scrollTop` writes are
themselves synchronous DOM assignments — so for an SSR'd non-empty
transcript the opening position is already correct before the browser's
first paint, and `data-pending-scroll` is set and cleared within that same
synchronous call. Verified against a real served build
(`packages/shadcn/tests/behavior/message-scroller.test.ts`, the "Jumping
to Messages" docs demo — source `message-scroller-commands.marko`, 8
SSR'd messages, `defaultScrollPosition="end"`, no custom onMount scroll
override): the viewport ends hydration scrolled to the end, with
`data-pending-scroll` absent, non-zero bounding box, and
`visibility: visible` — plus a JS-disabled pass confirming the raw SSR
markup never carries the attribute in the first place.

The CSS class (`packages/shadcn/ui/message-scroller/classes.ts`'s
`viewport.root`, `data-pending-scroll:invisible`) is unchanged from the
sync that vendored it — only the runtime logic that sets/clears the
attribute is new.

## Layout & imports (historical — see the plans above for the current layout)

- `packages/shadcn/ui/<component>/<part>.marko` — the default registry,
  tracks shadcn's `registry/new-york-v4`. This is still the current single
  authored source, now carrying `mu-*` hook classes.
- `packages/registry/styles/<style>/ui/<component>/<part>.marko` — one
  hand-ported dir per shadcn style. This layout no longer exists; the
  equivalent per-style output is now transformed IN MEMORY by
  `tooling/build-registry.ts` from `packages/shadcn/ui/` +
  `packages/shadcn/styles/style-<name>.css` — there is no on-disk
  `styles-gen/` tree at all (not even gitignored; it was removed entirely).
- The package `exports` map now lists `./ui/*`, `./lib/*`, `./styles/*`,
  `./blocks/*`, pointing directly at real authored files under
  `packages/shadcn/` — no per-style subpath indirection and no generated
  copies.

## Why one implementation per style (not per base) — historical rationale

shadcn ships 24 trees (`{base,aria,radix}-<style>`), but the three bases only
differ in React primitive library — their Tailwind class strings are
byte-identical per style (verified by diffing). Our zag.js internals replace
all three, so one Marko tree per style was complete. The `/create` base picker
still reloads the preview (parity of behavior), it just loads identical markup
by design. This reasoning justified having one tree per style; it did not
require that tree to be hand-maintained rather than generated, which is the
part later found to be a premise error (see the note at the top of this file).

## The porting method (historical, used for the original hand ports)

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

## String-parity audit (historical)

Regex-extract every class-looking string (≥~25 chars, has spaces + tailwind-ish
tokens) from the style's tsx source and check it appears verbatim somewhere in
our component dir. ~15-line python script; per-component missing counts are the
review signal. Every style lands at 84–99 residual misses, ALL in the same
structural categories (below) — a component outside those categories with
misses is a real porting bug.

## Known structural residuals (historical — shared by all 8 hand-ported styles, documented in-file)

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

Closing any of these = change the shared anatomy in `packages/shadcn/ui` first, then
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
