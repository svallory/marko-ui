# Marko 6.3.34 dynamic-tag hydration crash

## Symptom

Every `/docs/components/<name>` page threw on client hydration, production
builds only:

```
TypeError: e[(t++)] is not a function
```

Unminified, this is `effects[(i++)] is not a function` inside Marko's
compiled `runEffects`/`runResumeEffects`. Dev server and SSR (view-source,
curl) are both fine — only the browser's hydration/resume walk throws, and
only in a `bun run build` + `marko-run preview`/production bundle. This
class of failure is not specific to one route file: it recurs anywhere a
Marko 6 dynamic tag's reference is resolved from a runtime lookup rather
than written as a literal tag name.

## Root cause

`apps/docs/src/tags/docs/component-preview.marko` rendered the active demo
via a dynamic tag, `<${input.component}/>`, where `input.component` was a
`Marko.Template` picked at runtime out of the generated demos manifest
(`apps/docs/src/demos/demos-manifest.ts`). Marko 6.3.34 corrupts the
SSR-emitted resume-effects payload when a dynamic tag's reference comes
from a runtime lookup like this, rather than being a tag name Marko's
compiler can see statically.

## Evidence chain

- Reproduced on a clean `bun run build` + `marko-run preview` for
  `/docs/components/button`; confirmed pre-existing on `main` (this bug
  predates the fix in this repo's history, not introduced by it).
- Built with `minify:false` + sourcemaps to get a readable stack, pointing
  at Marko's own `dom-*.mjs` `runEffects`/`runResumeEffects`/`init`.
- Bisected by hand: swapping the dynamic tag for a fixed static tag
  (temporarily hardcoding one demo) made the crash disappear immediately,
  on the same page/demos/Marko version — isolating the dynamic tag as the
  trigger.

## Fix

Static `<if>/<else-if>` dispatch over statically-imported components,
keyed by a plain string id, instead of a dynamic tag. See
`apps/docs/scripts/build-demos-manifest.ts` — it generates both
`apps/docs/src/demos/demos-manifest.ts` (carries each demo's `demoId`
string) and `apps/docs/src/tags/docs/demo-renderer.marko` (the static
if/else-if chain, one branch per demo, matching on `demoId`).

### Why `demo-renderer.marko` lives under `src/tags/docs/`

Empirically (bisected by hand), a `.marko` file outside `src/tags/` that
both imports many sibling `.marko` files _and_ is itself imported
elsewhere as a custom tag fails to compile with "Unable to find entry
point for custom tag" — even though the exact same imports work fine from
a file already under `src/tags/`, and a leaf demo file with no
sub-imports of its own works fine anywhere. Root cause not fully isolated
as a Marko/Vite resolution quirk; every other non-route custom tag in
this app already lives under some `src/tags/` subdirectory, so the
generator follows that existing convention rather than fighting it. This
is a follow-up worth isolating further if it recurs elsewhere.

## Known cost

The `$name` route's compiled chunk grew from ~25 kB to ~1.2 MB (~0.4 MB
gzip), because every request now statically bundles all 358 demos across
76 components instead of selecting one at request time via a runtime
lookup. Accepted trade-off against a hard production crash on every
component-docs page — there is no dynamic-tag alternative that survives
Marko 6.3.34's hydration path, and the generator keeps the chain
mechanically in sync with `src/demos/` so the cost doesn't grow with
hand-maintenance risk.

## Framing correction (2026-08-23)

Serializability of every value that crosses the SSR→hydration boundary is a
REQUIREMENT of Marko's resumability model — our contract to satisfy, not a
platform defect when violated. The closure-wrap pattern documented above
(pass `() => Thing`, resolve inside the resumed closure; serialize only
primitives) is the CORRECT design under that model, not a "workaround".
When a crash of this class appears, the default conclusion is "an
unserializable crossing remains unfound — keep auditing the boundary".
Only a case where every crossing value is demonstrably serializable and
resume still corrupts may be treated as a suspected Marko/marko-zag issue,
with that enumeration as the evidence.

## Nested-portal walk-order defect + verified let-mirror workaround (2026-08-24)

A second, related-but-distinct bug class, found while chasing the RCA in
`e2e/verify-matrix.spec.ts` KNOWN_BROKEN comment (full serializability
audit there — every boundary crossing is a plain literal or a
template-created closure, ruling out the pattern above as the cause).

### Mechanism

When a Zag-connected component (`<service>`/`<connect>`/`<portal>`) is
mounted via marko-zag's `<portal>` dynamic-tag-content mechanism
(`<${input.content}/>`) nested inside an ANCESTOR's own
`<portal><if=api().open>` block, the child's OWN walk-time reads of its
OWN `api()` (a `<const>`) — in `<if>`/`<for>` branch selectors, attribute
spreads, anywhere — fire during the client's FIRST mount walk of that
child's freshly-created scope, which happens BEFORE `<const/api>`'s own
deferred/resume signal has ever computed a value on that scope. The
compiled closure-fanout code assumes the property exists once accessed
and throws `TypeError: $scope._.<accessor> is not a function`. Confirmed
empirically (isolated repro at `../../scratch/nested-portal-repro/`):
plain `<let>` state with the identical nesting shape does NOT crash — a
`<let>`'s value is a plain, eagerly-available scope property from scope
creation, with no "hasn't computed yet" window; `<const>`'s lazy,
signal-driven evaluation is the required ingredient.

Iterating on the fix surfaced several traps, each confirmed by moving the
crash to prove the hypothesis:

- Mirroring only the FIRST walk-time `api()` call site just moves the
  crash to the NEXT one in source order — every walk-time `api()` read in
  the render tree needs the mirror, not just the branch selector.
- Wrapping the mirror in its own `<const/ui=() => uiValue/>` still
  crashes: a `<const>` is lazy regardless of what its body does: `ui`
  itself becomes the next thing racing the walk.
- Populating the mirror from inside a `<script>` block also crashes: a
  `<script>` body is deferred to the same signal-firing pass as
  `<const>`, so the assignment hasn't run yet at walk time either.
- Even `<let/uiValue=api()/>` — despite `<let>` initializers normally
  running eagerly at scope construction — still crashes, because the
  compiler fuses an initializer expression that CALLS a `<const>`
  (`api()`) into that const's own deferred resume chain, inheriting its
  lazy timing regardless of the `<let>` wrapper.

### Verified fix pattern (the mirror rule)

**No `<const>` reads — direct, OR indirect via another wrapping
`<const>`, OR indirect via a `<let>` initializer that calls one — in
walk-time selectors/spreads/attribute-reads inside components mounted
via dynamic-tag-content nested in an ancestor's own portal.**

The only pattern that survives the walk pass: initialize the `<let>`
mirror from a call that never touches the local `<const/api>` at all —
call the machine's own `connect()` function DIRECTLY against the raw
service, exactly mirroring marko-zag's own `<connect>` tag body and its
`ssrService()` SSR-fallback:

```marko
import { normalizeProps, ssrService } from "marko-zag";

<service/service machine=() => someMachine.machine props=machineProps/>
<connect/api=(service, normalizeProps) =>
  someMachine.connect(service, normalizeProps)
  service=service
/>

<let/uiValue=someMachine.connect(
  service.service ?? ssrService(service.machine(), service.props),
  normalizeProps,
)/>
<script>
  service.rev;
  uiValue = api();
</script>
```

Every walk-time read in the render tree (attribute spreads, `<if>`/`<for>`
selectors, template-body reads) then uses `uiValue` (a bare scope
property — never re-wrapped in a `<const>`) instead of `api()`. Reads
inside `<lifecycle>` blocks, event handlers, and anything that only runs
post-mount are unaffected and keep calling `api()` normally — the race is
walk-time only.

Applied and verified 3x each (zero console errors, full interaction) to:
`packages/shadcn/ui/dropdown-menu/submenu.marko`,
`packages/shadcn/ui/menubar/submenu.marko`,
`packages/shadcn/ui/context-menu/submenu.marko`,
`packages/shadcn/ui/calendar/calendar.marko`,
`packages/shadcn/ui/avatar/avatar.marko`. Full status in TODO.md
§BLOCKER. Upstream issue not yet filed — draft at
`../../scratch/nested-portal-repro/UPSTREAM-ISSUE-DRAFT.md`.

### Same defect class, a second variant: a plain data `<const>`, not `api()` (2026-08-24)

The let-mirror pattern above exists because the raced const happened to be
`api()` (a live Zag connect() result). The SAME walk-order race — a
`<const>` read at walk time on a scope whose deferred signal hasn't
computed yet, because the owning component was mounted via
dynamic-tag-content nested in an ancestor's portal — also hit a
completely different kind of const in `dropdown-menu.marko`,
`menubar/menu.marko`, and `context-menu.marko`: their own top-level
`<const/{ class: className, trigger }=input/>` destructure and
`<const/entries=...>` derivation (normalizing `input.item`/`input.items`
into one render-order-preserving list), read by the `<for|entry| of=
entries>` loop and its `<if=entry.content>` branches.

**Trap worth naming:** the FIRST instinct chasing this crash is to inspect
the component that's visibly on screen when it throws (here, `Item`,
`ItemContent`, `Avatar` — none of which have a `<const>` at all) and
declare "no const here, must be a different bug." That was wrong for THIS
variant, right for the one below it. The const that matters is whichever
component's OWN scope is being walked at the moment of the crash — trace
the crash to the OWNING component (the one whose `<for>`/`<if>` selector
is what's actually executing), not to whichever component's markup
happens to be visually nearest the error, and not to whichever
Zag-connected component is closest in the call stack. Co-located consts in
sibling/child files can mislead: `dropdown-menu.marko`'s own `entries`
const was the actual defect even though `submenu.marko` (a different file
in the same directory) had already been fixed for its OWN unrelated
`api()` race.

Because `entries` derives purely from `input` — no service/api dependency
at all — the fix is simpler than the `<let>`-mirror: a module-level
`static function menuEntries(input)` (declared before the
`<machine-props>`/`<service>`/`<connect>` block, matching
`calendar.marko`'s `connectFresh`/`toDateValue` static-function placement
convention) computes the list fresh from `input` at each use site
(`menuEntries(input)` called directly as the `<for>`'s `of=` expression),
so there is no scope-property read left to race the walk at all. `input.
trigger` and `input.class` are read directly too, replacing the
destructure — same reasoning: a `<const>` over a pure-`input` read buys
nothing but a walk-order hazard.

Applied and verified (typecheck green; full 9-style verify-matrix green;
40/40 behavior+hydration tests green; manual interaction incl. opening a
submenu, zero console errors) to:
`packages/shadcn/ui/dropdown-menu/dropdown-menu.marko`,
`packages/shadcn/ui/menubar/menu.marko`,
`packages/shadcn/ui/context-menu/context-menu.marko`.

### A DIFFERENT, unrelated defect neither fix above resolves

The dropdown-menu `<@item>` attr-tag path (item-dropdown.marko:
`<for|person| of=PEOPLE><@item>...</@item></for>`) throws a different
error ("Cannot read properties of undefined (reading '3')") that is NOT
this bug — isolated empirically by removing every Zag-connected component
from the repro and finding it still crashes. The minimal reproducer is
ANY component using plain `<${content}/>` body-forwarding (no Zag, no
`<const>`, no `<portal>` involved at all) nested inside a `<for>`-loop-
captured attr-tag body that is itself mounted via dynamic-tag-content.
There is no `<const>` read anywhere in this path — not in `Item`, not in
`DropdownMenu` (confirmed by re-testing after the `menuEntries` fix above
removed dropdown-menu.marko's last walk-time const, with the crash
unchanged) — for a let-mirror or a static function to bypass.

Independently confirmed (2026-08-24) via source-mapped stack trace against
a clean production build with both fixes applied: the crash's minified
frame maps to `marko@6.3.34/dist/dom-6hBvZW7X.mjs:81:357`, landing exactly
on `renderer.g[accessor](scope[childScopeAccessor], renderer.h[accessor])`
— the child-scope closures-fanout call inside Marko's own compiled DOM
runtime, not application code. This is Marko-core's `_content_closures`/
`_dynamic_tag_content` closures-map wiring breaking across nested
dynamic-tag-content layers combined with loop-scope capture, exactly as
previously isolated by hand. Left broken; see TODO.md §BLOCKER for the
full isolation notes and next steps. `item` stays in
`KNOWN_BROKEN_COMPONENTS` in `e2e/verify-matrix.spec.ts`.
