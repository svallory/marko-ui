/**
 * Tool for the new-york style port (see scratch/team-lead/briefs/style-new-york-playbook.md).
 *
 * Two modes:
 *
 *   bun tooling/derive-new-york.ts <component>            — DRAFT mode (original pilot tool)
 *   bun tooling/derive-new-york.ts --check <component>     — CHECK mode (round 2, mandatory per
 *                                                             component before it's considered done)
 *
 * DRAFT mode extracts per-part class strings from:
 *   1. upstream new-york-v4 (apps/v4/registry/new-york-v4/ui/<component>.tsx) — the target style
 *   2. upstream bases/base (apps/v4/registry/bases/base/ui/<component>.tsx) — the structural rename source
 *      our components are ported from (its cn-* classes correspond 1:1 to our mu-* classes)
 *
 * The new-york rule for a part = new-york-v4's classes for that part MINUS the structural
 * classes bases/base already applies (since our component's classes.ts already carries those
 * structural classes verbatim, cn-* renamed to mu-*).
 *
 * This is a DRAFT generator, not full automation: data-slot keys differ in shape between the two
 * upstream files (new-york-v4 uses Radix + data-slot; bases/base uses Base UI + data-slot but
 * different underlying primitives/selectors), so matching is done by data-slot name with a
 * best-effort per-function regex extraction. Emits a draft CSS block per part plus a list of
 * classes present in new-york-v4 but not clearly attributable (conflicts/unmatched) for human
 * review — always hand-verify before committing.
 *
 * CHECK mode is the mechanical verification port-to-marko's parity-checklist.md requires (class 5,
 * "Class string per part: sorted-set diff against upstream's source for that style, with an empty
 * result attached"). Per part/variant it asserts:
 *
 *   tokens(our classes.ts structural classes for that mu-* slot)
 *     ∪ tokens(.style-new-york's @apply rule for that mu-* slot)
 *   ==  (modulo EQUIVALENCES below)
 *   tokens(new-york-v4's final class string for the same part)
 *
 * Reads our ACTUAL shipped source (packages/shadcn/ui/<c>/classes.ts and
 * packages/shadcn/styles/style-new-york.css), not bases/base — bases/base is only the derivation
 * aid for draft mode; classes.ts is the ground truth for what our component really emits. Prints a
 * missing/extra token table per part and exits non-zero on any unlisted mismatch. Real,
 * intentional divergences go in DIVERGENCES below with a reason, never silently absorbed into
 * EQUIVALENCES (which is only for same-meaning spelling differences, e.g. a Radix selector mapped
 * to our Zag custom variant, or an arbitrary-value class vs. its equivalent scale token).
 *
 * Usage: bun tooling/derive-new-york.ts [--check] <component>
 */
import { readFileSync, existsSync } from "node:fs"
import { join } from "node:path"

const SHADCN_UI_DIR =
  process.env.SHADCN_UI_DIR ?? join(import.meta.dirname, "..", "..", "..", "data", "shadcn-ui")

const NEW_YORK_DIR = join(SHADCN_UI_DIR, "apps/v4/registry/new-york-v4/ui")
const BASE_DIR = join(SHADCN_UI_DIR, "apps/v4/registry/bases/base/ui")

const REPO_ROOT = join(import.meta.dirname, "..")
const UI_DIR = join(REPO_ROOT, "packages/shadcn/ui")
const STYLE_NEW_YORK_CSS = join(REPO_ROOT, "packages/shadcn/styles/style-new-york.css")

/**
 * Same-meaning spelling differences between new-york-v4's raw class string and what our component
 * actually emits. Each is a PREFIX/whole-token replacement applied to every token (not just exact
 * whole-class matches) because Tailwind variants compound onto a token
 * (`data-[state=open]:animate-in`, not a standalone `data-[state=open]` class) — never used to
 * paper over a genuine visual/behavioral difference (that's DIVERGENCES below).
 */
const EQUIVALENCES: Array<{ from: string; to: string }> = [
  // Radix data-[state=*] selectors -> our Zag custom variants (globals.css @custom-variant list).
  { from: "data-[state=open]:", to: "data-open:" },
  { from: "data-[state=closed]:", to: "data-closed:" },
  { from: "data-[state=checked]:", to: "data-checked:" },
  { from: "data-[state=unchecked]:", to: "data-unchecked:" },
  // Same pair, stacked after a leading dark: variant (normalizeToken only matches a `from` at the
  // START of a token, so `dark:data-[state=unchecked]:x` needs its own entry rather than reusing
  // the bare prefix form above).
  { from: "dark:data-[state=checked]:", to: "dark:data-checked:" },
  { from: "dark:data-[state=unchecked]:", to: "dark:data-unchecked:" },
  // Radix's data-[state=active] on a tab trigger -> our Zag equivalent. tabs/classes.ts's
  // structural string spells this two different ways depending on the specific rule (verified by
  // reading it directly): the attribute-presence form `data-[selected]:` for the plain
  // bg-background/text-foreground/border-input set, and the custom variant `data-active:` for the
  // group-scoped shadow rules in style-new-york.css. Both match the same real DOM condition; two
  // entries since normalizeToken can't try multiple candidates per token.
  { from: "data-[state=active]:", to: "data-[selected]:" },
  { from: "dark:data-[state=active]:", to: "dark:data-[selected]:" },
  { from: "group-data-[variant=default]/tabs-list:data-[state=active]:shadow-sm", to: "group-data-[variant=default]/tabs-list:data-active:shadow-sm" },
  { from: "group-data-[variant=line]/tabs-list:data-[state=active]:shadow-none", to: "group-data-[variant=line]/tabs-list:data-active:shadow-none" },
  { from: "group-data-[variant=line]/tabs-list:data-[state=active]:", to: "group-data-[variant=line]/tabs-list:data-[selected]:" },
  { from: "dark:group-data-[variant=line]/tabs-list:data-[state=active]:", to: "dark:group-data-[variant=line]/tabs-list:data-[selected]:" },
  // Radix's data-[orientation=*] compounded onto a `group-*/tabs:` selector (our custom
  // group-data-horizontal//vertical variants, not the bare data-horizontal:/data-vertical: pair
  // above — Tailwind variant composition means the compound needs its own equivalence entry).
  { from: "group-data-[orientation=horizontal]/tabs:", to: "group-data-horizontal/tabs:" },
  { from: "group-data-[orientation=vertical]/tabs:", to: "group-data-vertical/tabs:" },
  // Radix's data-[state=open|closed] compounded onto navigation-menu's group-data-[viewport=false]
  // scoping selector -> our Zag data-open/data-closed custom variants.
  { from: "group-data-[viewport=false]/navigation-menu:data-[state=closed]:", to: "group-data-[viewport=false]/navigation-menu:data-closed:" },
  { from: "group-data-[viewport=false]/navigation-menu:data-[state=open]:", to: "group-data-[viewport=false]/navigation-menu:data-open:" },
  // Tailwind arbitrary z-index vs. our bare scale value at the same computed z-index (1).
  { from: "z-[1]", to: "z-1" },
  // Tailwind v4's `*:` direct-child variant shorthand for the older `[&>*]:` arbitrary form.
  { from: "[&>*]:focus-visible:relative", to: "*:focus-visible:relative" },
  { from: "[&>*]:focus-visible:z-10", to: "*:focus-visible:z-10" },
  // Radix boolean-attribute selectors -> our components' equivalent plain data attributes.
  { from: "data-[disabled]:", to: "data-disabled:" },
  { from: "data-[inset]:", to: "data-inset:" },
  // Radix data-[state=checked/unchecked] -> our Zag custom variants (globals.css @custom-variant list).
  { from: "data-[state=checked]:", to: "data-checked:" },
  { from: "data-[state=unchecked]:", to: "data-unchecked:" },
  { from: "has-data-[state=checked]:", to: "has-data-checked:" },
  // Sidebar's own data-[active=true] selector -> our data-active custom variant (same boolean-ish attribute).
  { from: "data-[active=true]:", to: "data-active:" },
  { from: "peer-data-[active=true]/", to: "peer-data-active/" },
  // upstream's [&>[data-slot=x]]: / [&>*]:data-[slot=x]: direct-child arbitrary selectors -> Tailwind v4's *:data-[slot=x]: shorthand for the same direct-child selector.
  { from: "[&>[data-slot=field-group]]:", to: "*:data-[slot=field-group]:" },
  { from: "[&>*]:data-[slot=field]:", to: "*:data-[slot=field]:" },
  // upstream's group-has-[[data-slot=x]]/y: arbitrary-selector pattern -> Tailwind v4's group-has-data-[slot=x]/y: shorthand for the same has() selector.
  { from: "group-has-[[data-slot=item-description]]/item:", to: "group-has-data-[slot=item-description]/item:" },
  // upstream's native disabled: pseudo-class -> our Zag components' data-disabled attribute
  // (many of our controls render a non-form element, e.g. checkbox's <span> control, so the
  // machine emits a data-disabled attribute rather than relying on a native disabled attribute).
  { from: "disabled:", to: "data-disabled:" },
  // Arbitrary-value sizes that equal a rem-based Tailwind default-scale token at 16px root
  // (1.15rem = 18.4px, 2rem = 32px, 0.875rem = 14px, 1.5rem = 24px) — same computed value,
  // switch's data-[size=*] tokens spelled with px instead of the upstream rem literal. Each needs
  // its own compounded form since it's always written as `data-[size=X]:<size>`, never bare.
  { from: "data-[size=default]:h-[1.15rem]", to: "data-[size=default]:h-[18.4px]" },
  { from: "data-[size=default]:w-8", to: "data-[size=default]:w-[32px]" },
  { from: "data-[size=sm]:h-3.5", to: "data-[size=sm]:h-[14px]" },
  { from: "data-[size=sm]:w-6", to: "data-[size=sm]:w-[24px]" },
  // Arbitrary-value spacing that equals a token already in Tailwind's default scale (8rem = 32 * 0.25rem).
  { from: "min-w-[8rem]", to: "min-w-32" },
  // This repo spells the 3px focus ring width as the bare utility `ring-3` (Tailwind v4's default
  // ring width scale), not new-york-v4's `ring-[3px]` arbitrary value — same computed value,
  // repo-wide convention (19 pre-existing uses in style-new-york.css alone). normalizeToken's
  // cut-point matching (see below) tries the bare `ring-[3px]` -> `ring-3` entry at every variant
  // prefix, so the two more specific compounded entries kept here (focus-visible:/has-[...]:) are
  // redundant with it but harmless — left in place rather than removed mid-integration.
  { from: "ring-[3px]", to: "ring-3" },
  { from: "focus-visible:ring-[3px]", to: "focus-visible:ring-3" },
  { from: "has-[[data-slot=input-group-control]:focus-visible]:ring-[3px]", to: "has-[[data-slot=input-group-control]:focus-visible]:ring-3" },
  // top-[50%]/left-[50%] (upstream's arbitrary %) === top-1/2/left-1/2 (Tailwind's default fraction scale, same 50%).
  { from: "top-[50%]", to: "top-1/2" },
  { from: "left-[50%]", to: "left-1/2" },
  // translate-x-[-50%]/-y-[-50%] (upstream's arbitrary negative %) === -translate-x-1/2/-y-1/2 (same -50%, Tailwind's negative-utility spelling).
  { from: "translate-x-[-50%]", to: "-translate-x-1/2" },
  { from: "translate-y-[-50%]", to: "-translate-y-1/2" },
  // upstream's arbitrary-selector "ancestor has this data-slot" pattern -> Tailwind v4's in-* variant shorthand for the same descendant-context selector.
  { from: "[[data-slot=tooltip-content]_&]:", to: "in-data-[slot=tooltip-content]:" },
  // Radix data-[orientation=*] selectors -> our Zag custom variants (globals.css @custom-variant list).
  { from: "data-[orientation=horizontal]:", to: "data-horizontal:" },
  { from: "data-[orientation=vertical]:", to: "data-vertical:" },
]

/**
 * mu-* hook classes (the component's own semantic class, always the first token of its
 * classes.ts string) and other always-present structural markers that new-york-v4 has no concept
 * of at all (it's plain Tailwind utilities, no hook-class convention) — excluded from comparison
 * entirely rather than diffed, since they're never going to appear on the upstream side.
 */
function isStructuralOnlyToken(token: string): boolean {
  return token.startsWith("mu-") || token.startsWith("group/") || token.startsWith("peer/")
}

/**
 * Per-component, per-part documented divergences: a token new-york-v4 has that we deliberately
 * don't emit (or vice versa), with a reason. Anything landing here must be a real, reviewed
 * decision — not a shortcut to make --check pass. Keys are "<component>:<slot>".
 */
const DIVERGENCES: Record<string, { missing?: string[]; extra?: string[]; reason: string }> = {
  "button:button": {
    extra: ["select-none"],
    reason:
      "structural, inherited from bases/base's button.tsx (cn-button base string), which new-york-v4's own button.tsx doesn't carry. A real base-implementation difference between the Base UI and Radix component sources, not a style-layer choice — out of scope for a style-only port; classes.ts is not touched here.",
  },
  "card:card-header": {
    missing: ["grid-rows-[auto_auto]"],
    extra: ["has-data-[slot=card-description]:grid-rows-[auto_auto]"],
    reason:
      "structural: new-york-v4's card-header.tsx sets grid-rows-[auto_auto] unconditionally; our classes.ts (from bases/base's card.tsx) only sets it when a card-description part is present. Pre-existing bases/base behavior, not introduced by the style port — out of scope here.",
  },
  "dropdown-menu:dropdown-menu-content": {
    missing: [
      "max-h-(--radix-dropdown-menu-content-available-height)",
      "origin-(--radix-dropdown-menu-content-transform-origin)",
    ],
    extra: ["w-(--radix-dropdown-menu-trigger-width)", "data-closed:overflow-hidden"],
    reason:
      "positioning vars (max-h-/origin-/w-) are structural — already in classes.ts verbatim under their historical --radix-* names for our Zag component's own CSS-var wiring, not a style-layer concern. data-closed:overflow-hidden is a bases/base-only structural addition (Base UI needs it; new-york-v4's Radix implementation doesn't carry it) — pre-existing, out of scope for a style-only port.",
  },
  "dropdown-menu:dropdown-menu-sub-content": {
    missing: ["origin-(--radix-dropdown-menu-content-transform-origin)"],
    reason: "same as dropdown-menu-content: positioning var lives in classes.ts, not the style layer.",
  },

  // batch B
  "accordion:accordion-item": {
    missing: ["border-b", "last:border-b-0"],
    extra: ["not-last:border-b"],
    reason:
      "spelling-only: our `not-last:border-b` (this repo's `not-last:` custom variant, globals.css) and upstream's `border-b last:border-b-0` pair both mean \"border on every item except the last\" — same computed result, not a genuine divergence, but not expressible as a single-token EQUIVALENCES entry (one of our tokens maps to a two-token upstream pair, and `border-b` alone can't be globally aliased without corrupting every other component's real border-b usage).",
  },
  "accordion:accordion-trigger": {
    missing: ["[&[data-state=open]>svg]:rotate-180"],
    extra: ["relative", "border", "border-transparent", "**:data-[slot=accordion-trigger-icon]:text-muted-foreground", "**:data-[slot=accordion-trigger-icon]:ml-auto", "**:data-[slot=accordion-trigger-icon]:size-4"],
    reason:
      "two independent divergences on this slot. (1) missing: new-york-v4 rotates a single chevron SVG on open via this selector; our accordion.marko (accordion.marko:224-233) swaps between two separate icons (ChevronDown/ChevronUp via triggerIcon/triggerIconActive classes.ts fields) instead of rotating one — a pre-existing icon-mechanism divergence from bases/base, not a style-layer concern. (2) extra: `relative border border-transparent` is inherited from bases/base's accordion.tsx trigger (classes.ts), which new-york-v4's own Radix trigger doesn't carry (its focus ring comes from focus-visible:border-ring alone, no base border) — a real base-implementation difference between Base UI and Radix, same class as the pilot's button:button `select-none` entry; the `**:data-[slot=accordion-trigger-icon]:*` rules position/color our two-icon swap from (1) — not a new-york-v4 concept since it renders one rotating SVG, not two.",
  },
  "scroll-area:scroll-area-scrollbar": {
    missing: ["vertical", "h-full", "w-2.5", "border-l", "border-l-transparent", "horizontal", "h-2.5", "flex-col", "border-t", "border-t-transparent"],
    extra: ["data-horizontal:h-2.5", "data-horizontal:flex-col", "data-horizontal:border-t", "data-horizontal:border-t-transparent", "data-vertical:h-full", "data-vertical:w-2.5", "data-vertical:border-l", "data-vertical:border-l-transparent", "data-vertical:not-data-[overflow-y]:hidden!", "data-horizontal:not-data-[overflow-x]:hidden!"],
    reason:
      "tokenizer artifact + real equivalence, not a genuine mismatch. Upstream new-york-v4/scroll-area.tsx (apps/v4/registry/new-york-v4/ui/scroll-area.tsx:36-46) picks the scrollbar's classes with a JS ternary on the `orientation` PROP (`orientation === \"vertical\" && \"h-full w-2.5 border-l border-l-transparent\"`), not a Tailwind data-attribute selector — this tool's extractParts() doesn't parse that shape (documented tooling gap: cva()-only recognition), so the literal words \"vertical\"/\"horizontal\" leak into the extracted token list instead of a real class. Semantically this IS our data-vertical:/data-horizontal: pair (our Zag scroll-area always renders one element with a live data-orientation attribute rather than switching component per orientation prop, per this file's SSR-safe Zag pattern) — verified by reading the raw upstream source; not expressible as an EQUIVALENCES entry since the source shape has no real token to rewrite. not-data-[overflow-y]:hidden!/not-data-[overflow-x]:hidden! are Zag-only visibility gating (hide an axis with no overflow) with no Radix/new-york-v4 equivalent, since Radix conditionally MOUNTS the scrollbar instead — same class as the pilot's dropdown-menu positioning-var entries.",
  },

  "native-select:native-select-wrapper": {
    missing: ["h-9", "w-full", "min-w-0", "appearance-none", "rounded-md", "border", "border-input", "bg-transparent", "px-3", "py-2", "pr-9", "text-sm", "shadow-xs", "transition-[color,box-shadow]", "outline-none", "selection:bg-primary", "selection:text-primary-foreground", "placeholder:text-muted-foreground", "disabled:pointer-events-none", "disabled:cursor-not-allowed", "data-[size=sm]:h-8", "data-[size=sm]:py-1", "dark:bg-input/30", "dark:hover:bg-input/50", "focus-visible:border-ring", "focus-visible:ring-3", "focus-visible:ring-ring/50", "aria-invalid:border-destructive", "aria-invalid:ring-destructive/20", "dark:aria-invalid:ring-destructive/40"],
    extra: ["relative", "w-fit", "has-[select:disabled]:opacity-50"],
    reason:
      "TOOL BUG, not a real mismatch: new-york-v4's NativeSelect fn body (apps/v4/registry/new-york-v4/ui/native-select.tsx) has TWO data-slot attributes — native-select-wrapper on the outer div, native-select on the inner <select> — and extractParts()'s slotMatch regex only takes the FIRST one it finds in the function body, so the fn's real className/cn() call (which belongs to the <select>, not the wrapper div) gets attributed to the wrapper's slot name instead. Verified by reading the raw source directly: the wrapper div's actual className is a bare string literal (`\"group/native-select relative w-fit has-[select:disabled]:opacity-50\"`, no cn()), which is exactly our `mu-native-select-wrapper`'s structural classes.ts value — genuinely nothing to port there. The real target (everything listed as \"missing\" above) was hand-derived from the select element's real class string and ported onto `.mu-native-select` instead (see its own MARK: Native Select comment) — verify that rule directly rather than trusting this slot's --check result.",
  },
  "native-select:native-select-option": {
    missing: ["(no classes.ts entry and no style-new-york.css rule found for this mu-* class)"],
    reason:
      "tool limitation: classes.ts's nativeSelectOption/nativeSelectOptgroup both carry `bg-[Canvas] text-[CanvasText]` with no mu-* hook class at all (same pre-existing pattern as progress's `track` field — see progress:progress divergence above), so readStructuralTokens()'s literal-must-start-with-muClass search finds nothing and --check can't evaluate this slot at all. Verified these are upstream's own values already (new-york-v4/native-select.tsx: NativeSelectOption/NativeSelectOptGroup both render bg-[Canvas] text-[CanvasText] verbatim, byte-identical to bases/base and to our classes.ts) — genuinely nothing to port, out of scope to add a hook class here.",
  },
  "native-select:native-select-optgroup": {
    missing: ["(no classes.ts entry and no style-new-york.css rule found for this mu-* class)"],
    reason: "same as native-select:native-select-option.",
  },
  "button-group:button-group:orientation:horizontal": {
    extra: ["[&>[data-slot]:not(:has(~[data-slot]))]:rounded-r-md!"],
    reason:
      "structural, pre-existing (already in vega, not introduced by this port): our selector strategy for \"round the last visible item's outer corner\" is a last-data-slot-child selector (`[&>[data-slot]:not(:has(~[data-slot]))]`), while upstream uses per-side sibling selectors (`[&>*:not(:first-child)]:rounded-l-none [&>*:not(:first-child)]:border-l-0 [&>*:not(:last-child)]:rounded-r-none`) applied to every child instead of only the edges. Both achieve the same visual result (only the first/last visible child keeps its outer rounded corner) but via a different CSS mechanism — rewriting to upstream's exact selector shape is a structural change beyond a style-only port.",
  },
  "button-group:button-group:orientation:vertical": {
    extra: ["[&>[data-slot]:not(:has(~[data-slot]))]:rounded-b-md!"],
    reason: "same mechanism difference as the horizontal orientation entry above, mirrored for the vertical axis.",
  },
  "input-group:input-group": {
    missing: ["group/input-group", "relative", "flex", "w-full", "items-center", "outline-none", "min-w-0", "has-[>textarea]:h-auto"],
    extra: ["in-data-[slot=combobox-content]:focus-within:border-inherit", "in-data-[slot=combobox-content]:focus-within:ring-0", "has-[[data-slot][aria-invalid=true]]:ring-3"],
    reason:
      "two causes. missing: TOOL LIMITATION (same class as switch:switch's group/switch entry) — isStructuralOnlyToken() strips every `group/*` token from OUR side unconditionally, but new-york-v4's own InputGroup root ALSO writes `group/input-group`; the rest of this list is genuinely already present in classes.ts's root field verbatim (`group/input-group relative flex w-full items-center outline-none min-w-0 has-[>textarea]:h-auto`), just invisible to the tool because it's bundled with the stripped group token in the same literal. extra: `in-data-[slot=combobox-content]:*` is our own addition with no new-york-v4 equivalent (suppresses the input-group's own focus ring/border when nested in a combobox popover, letting the combobox's own focus styling show through — new-york-v4 has no concept of combobox nesting); `has-[[data-slot][aria-invalid=true]]:ring-3` duplicates the ring width upstream doesn't repeat on its own aria-invalid rule (upstream: `aria-invalid:ring-destructive/20` alone, ring width already covered by the focus-visible rule) — harmless, pre-existing.",
  },
  "input-group:input-group-control": {
    missing: ["(no classes.ts entry and no style-new-york.css rule found for this mu-* class)"],
    reason:
      "TOOL BUG, not a real mismatch: new-york-v4's inputGroupButtonVariants cva() call has no data-slot of its own (InputGroupButton renders <Button>, which carries its own internal data-slot=\"button\") — extractParts()'s guessSlotForVariants() walks forward looking for the NEXT data-slot in the file and lands on InputGroupInput's unrelated `input-group-control` (same class of bug as native-select's mismapped wrapper/select slots). The real target for this variant group is our mu-input-group-button* rules (see their own comment in style-new-york.css's MARK: Input Group section, already ported there) — verify those directly. The genuine input-group-control slot (InputGroupInput/InputGroupTextarea) matches our mu-input-group-input/-textarea rules, unaffected by this bug and unchanged from vega.",
  },
  "input-group:input-group-control:size:xs": {
    missing: ["(no classes.ts entry and no style-new-york.css rule found for this mu-* class)"],
    reason: "same tool bug as input-group:input-group-control; real target is .mu-input-group-button-size-xs.",
  },
  "input-group:input-group-control:size:sm": {
    missing: ["(no classes.ts entry and no style-new-york.css rule found for this mu-* class)"],
    reason: "same tool bug as input-group:input-group-control; real target is .mu-input-group-button-size-sm.",
  },
  "input-group:input-group-control:size:icon-xs": {
    missing: ["(no classes.ts entry and no style-new-york.css rule found for this mu-* class)"],
    reason: "same tool bug as input-group:input-group-control; real target is .mu-input-group-button-size-icon-xs.",
  },
  "input-group:input-group-control:size:icon-sm": {
    missing: ["(no classes.ts entry and no style-new-york.css rule found for this mu-* class)"],
    reason: "same tool bug as input-group:input-group-control; real target is .mu-input-group-button-size-icon-sm.",
  },

  "sheet:sheet-content": {
    missing: ["fixed", "z-50", "flex", "flex-col", "gap-4", "right", "inset-y-0", "right-0", "h-full", "w-3/4", "border-l", "data-closed:slide-out-to-right", "data-open:slide-in-from-right", "sm:max-w-sm", "left", "left-0", "border-r", "data-closed:slide-out-to-left", "data-open:slide-in-from-left", "top", "inset-x-0", "top-0", "h-auto", "border-b", "data-closed:slide-out-to-top", "data-open:slide-in-from-top", "bottom", "bottom-0", "border-t", "data-closed:slide-out-to-bottom", "data-open:slide-in-from-bottom"],
    extra: ["data-open:fade-in-0", "data-[side=bottom]:data-open:slide-in-from-bottom-10", "data-[side=left]:data-open:slide-in-from-left-10", "data-[side=right]:data-open:slide-in-from-right-10", "data-[side=top]:data-open:slide-in-from-top-10", "data-closed:fade-out-0", "data-[side=bottom]:data-closed:slide-out-to-bottom-10", "data-[side=left]:data-closed:slide-out-to-left-10", "data-[side=right]:data-closed:slide-out-to-right-10", "data-[side=top]:data-closed:slide-out-to-top-10", "data-[side=bottom]:inset-x-0", "data-[side=bottom]:bottom-0", "data-[side=bottom]:h-auto", "data-[side=bottom]:border-t", "data-[side=left]:inset-y-0", "data-[side=left]:left-0", "data-[side=left]:h-full", "data-[side=left]:w-3/4", "data-[side=left]:border-r", "data-[side=left]:sm:max-w-sm", "data-[side=right]:inset-y-0", "data-[side=right]:right-0", "data-[side=right]:h-full", "data-[side=right]:w-3/4", "data-[side=right]:border-l", "data-[side=right]:sm:max-w-sm", "data-[side=top]:inset-x-0", "data-[side=top]:top-0", "data-[side=top]:h-auto", "data-[side=top]:border-b"],
    reason:
      "two causes, both about token shape, not real visual mismatches. missing: upstream's SheetContent picks per-side layout classes with a JS ternary on the `side` prop (`side === \"right\" && \"inset-y-0 right-0 h-full w-3/4 border-l ...\"`), not a Tailwind data-attribute selector — extractParts() doesn't parse that shape (same tokenizer-artifact class as scroll-area's ScrollBar and sheet's own side==='left'/'top'/'bottom' branches), so the literal words \"right\"/\"left\"/\"top\"/\"bottom\" leak into the target token list, and the real per-side classes (inset-y-0, right-0, h-full, w-3/4, border-l, slide-in/out) appear unprefixed while our rule spells them data-[side=right]:-prefixed (semantically identical, verified by reading the raw source and comparing side-by-side — our data-[side=X]: prefixed forms already carry every one of these values, just not matched token-for-token by the tool). extra: our classes.ts (sheet/classes.ts's content field) bakes each slide animation with a fixed -10 (10%) distance and includes fade-in-0/fade-out-0 companions on every side; new-york-v4's slide-in-from-<side>/slide-out-to-<side> have no explicit distance (Tailwind's animate-in default) and no fade pairing — pre-existing across all 8 styles, not introduced by this port; changing the animation distance is a behavioral/motion change beyond a style-only port.",
  },
  "bubble:bubble": {
    missing: ["group/bubble"],
    reason: "TOOL LIMITATION (same class as switch:switch's group/switch entry): isStructuralOnlyToken() strips every `group/*` token from OUR side unconditionally, but new-york-v4's own bubbleVariants base ALSO writes `group/bubble` — our classes.ts (bubble/classes.ts's `base` field) already carries it verbatim.",
  },
  "attachment:attachment": {
    missing: ["group/attachment"],
    reason: "TOOL LIMITATION (same class as switch:switch's group/switch entry): isStructuralOnlyToken() strips every `group/*` token from OUR side unconditionally, but new-york-v4's own attachmentVariants base ALSO writes `group/attachment` — our classes.ts (attachment/classes.ts's `base` field) already carries it verbatim.",
  },
  "attachment:attachment-description": {
    missing: ["max-w-full"],
    reason: "tool limitation, not a real gap: attachment/description.marko applies `max-w-full` via a SEPARATE classes.ts literal (`description.maxWidth`, no mu-* prefix — the tool's readStructuralTokens() only finds literals starting with the muClass), concatenated alongside `description.root` at the call site (`cn(styles.root, styles.maxWidth, className)`). The value is genuinely present on the rendered element already; verified by reading description.marko directly.",
  },
  "navigation-menu:navigation-menu": {
    missing: ["group/navigation-menu"],
    reason: "TOOL LIMITATION (same class as switch:switch's group/switch entry): isStructuralOnlyToken() strips every `group/*` token from OUR side unconditionally, but new-york-v4's own NavigationMenu root ALSO writes `group/navigation-menu` — our classes.ts (navigation-menu/classes.ts's `base` field) already carries it verbatim.",
  },
  "navigation-menu:navigation-menu-trigger": {
    missing: ["group"],
    extra: ["inline-flex", "h-9", "w-max", "items-center", "justify-center", "outline-none", "data-disabled:pointer-events-none", "hover:bg-accent", "focus:bg-accent", "data-open:hover:bg-accent", "data-open:focus:bg-accent", "data-open:bg-accent/50", "focus-visible:ring-ring/50", "data-popup-open:bg-accent/50", "data-popup-open:hover:bg-accent", "rounded-md", "px-4", "py-2", "text-sm", "font-medium", "transition-all", "focus-visible:ring-3", "focus-visible:outline-1", "data-disabled:opacity-50"],
    reason:
      "structural mislabel: the whole \"extra\" list is our real ported style rule (already correct — bg-accent etc, verified against upstream directly) plus classes.ts's own structural string (inline-flex h-9 w-max items-center justify-center outline-none disabled:pointer-events-none, normalized to data-disabled:pointer-events-none by the repo-wide disabled:->data-disabled: equivalence added in the batch C merge), which the tool doesn't subtract here because upstream's own trigger fn has no separate cva()/classes()-derivable structural half for this tool to diff against — it only flags the union as \"extra\" since it can't tell which half is ours. `group` (bare, no slash-name) is the same isStructuralOnlyToken() strip as group/navigation-menu above, applied to upstream's own bare `group` on NavigationMenuTrigger (its trigger-icon reads group-hover:rotate-180 off it) — our classes.ts already carries it verbatim too.",
  },
  "navigation-menu:navigation-menu-content": {
    extra: ["ease-[cubic-bezier(0.22,1,0.36,1)]"],
    reason: "our own easing curve with no new-york-v4 equivalent (upstream's animate-in/out use Tailwind's default easing) — pre-existing, harmless.",
  },
  "navigation-menu:navigation-menu-viewport": {
    missing: ["absolute", "top-full", "left-0", "isolate", "z-50", "flex", "justify-center"],
    extra: ["origin-top", "relative", "mt-1.5", "h-[var(--viewport-height)]", "w-[var(--viewport-width)]", "overflow-hidden", "bg-popover", "text-popover-foreground", "data-open:animate-in", "data-closed:animate-out", "data-closed:zoom-out-95", "data-open:zoom-in-90", "rounded-md", "border", "shadow"],
    reason:
      "TOOL BUG, not a real mismatch: new-york-v4's NavigationMenuViewport fn body has TWO className={cn(...)} calls — an outer wrapping div with no data-slot, and the inner real Radix Viewport carrying data-slot=\"navigation-menu-viewport\" — and extractParts()'s cnCallMatch regex only captures the FIRST cn() call per function, so this tool's \"navigation-menu-viewport\" slot is actually the OUTER wrapper's classes (matching our mu-navigation-menu-viewport-wrapper's existing rule verbatim, nothing to port there). The real inner-viewport target (everything in \"extra\" above, minus our own --viewport-height/-width positioning vars which are structural, this file's own Zag CSS-var wiring, and origin-top which is ALSO structural — classes.ts's viewport field, fixed in the same commit as this file from a pre-existing invalid-utility typo origin-top-center, which is not a real Tailwind v4 class and hard-failed the Tailwind build) was hand-derived from the raw source and ported onto .mu-navigation-menu-viewport directly — verify that rule against apps/v4/registry/new-york-v4/ui/navigation-menu.tsx:101-116 rather than trusting this slot's --check result.",
  },
  "navigation-menu:navigation-menu-indicator": {
    extra: ["[width:var(--trigger-width)]", "[translate:var(--trigger-x)_0]"],
    reason: "structural, pre-existing (classes.ts's indicator field): Zag-only positioning vars for the active-trigger indicator's width/offset, no upstream equivalent (Radix positions its indicator differently) — same class as the pilot's dropdown-menu positioning-var entries.",
  },
  "navigation-menu:navigation-menu-link": {
    extra: ["items-center", "gap-1.5", "in-data-[slot=navigation-menu-content]:rounded-sm"],
    reason:
      "pre-existing vega layout choice, not introduced by this port: upstream's link is a plain flex flex-col gap-1 (column stack, no centering); ours additionally centers items and uses a slightly larger gap-1.5, plus a context-specific corner rounding when nested inside navigation-menu-content. Changing this is a layout behavior change beyond a style-only port without visual verification — flagged for the lead to decide whether to align exactly.",
  },
  "sheet:sheet-overlay": {
    extra: ["duration-100"],
    reason: "structural, pre-existing (classes.ts's overlay field): our overlay always carries a 100ms duration where new-york-v4 has none (its animate-in/animate-out default to Tailwind's own default duration) — harmless, not a style-layer choice.",
  },
  "marker:marker": {
    missing: ["group/marker"],
    reason:
      "TOOL LIMITATION (same class as switch:switch's group/switch entry): isStructuralOnlyToken() strips every `group/*` token from OUR side unconditionally, but new-york-v4's own Marker root ALSO writes a real `group/marker` (its content reads group-data-[variant=separator]/marker: off it) — our classes.ts (marker/classes.ts's `base` field) already carries `group/marker` verbatim.",
  },
  "empty:empty": {
    extra: ["w-full"],
    reason:
      "structural, pre-existing: our classes.ts root (`flex w-full min-w-0 flex-1 flex-col items-center justify-center text-center text-balance`) carries `w-full` where neither new-york-v4 nor bases/base's own root string does (both rely on flex-1 alone for width) — a real, harmless base-implementation extra, not a style-layer choice.",
  },
  "empty:empty-icon": {
    missing: ["(no classes.ts entry and no style-new-york.css rule found for this mu-* class)"],
    reason:
      "naming mismatch, pre-existing: empty/media.marko renders `data-slot=\"empty-icon\"` (matching new-york-v4's own data-slot verbatim), but our classes.ts/style-new-york.css name that part's hook class `mu-empty-media` (see empty/classes.ts's `media` export), not `mu-empty-icon` — muClassName() derives the expected class from the upstream data-slot name, so it looks for a class that doesn't exist. The real port lives on `.mu-empty-media`/`.mu-empty-media-default`/`.mu-empty-media-icon` (see their own MARK: Empty rules) — verify those directly.",
  },
  "empty:empty-icon:variant:default": {
    missing: ["(no classes.ts entry and no style-new-york.css rule found for this mu-* class)"],
    reason: "same naming mismatch as empty:empty-icon; real target is .mu-empty-media-default.",
  },
  "empty:empty-icon:variant:icon": {
    missing: ["(no classes.ts entry and no style-new-york.css rule found for this mu-* class)"],
    reason: "same naming mismatch as empty:empty-icon; real target is .mu-empty-media-icon.",
  },
  "button-group:button-group-separator": {
    extra: ["data-horizontal:mx-px", "data-horizontal:w-auto", "data-vertical:my-px"],
    reason:
      "our own spacing choice with no upstream equivalent: new-york-v4's separator relies purely on flex layout (m-0! bg-input, already ported) with no explicit per-orientation margin/width; ours adds small axis-specific spacing/width adjustments (pre-existing in vega) that upstream's separator doesn't need.",
  },
  "tabs:tabs": {
    missing: ["group/tabs"],
    reason:
      "TOOL LIMITATION (same class as switch:switch's group/switch entry): isStructuralOnlyToken() strips every `group/*` token from OUR side unconditionally, but new-york-v4's own Tabs root ALSO writes a real `group/tabs` (its TabsList/TabsTrigger read group-data-[orientation=*]/tabs: off it) — our classes.ts (tabs/classes.ts's `root` field) already carries `group/tabs` verbatim.",
  },
  "tabs:tabs-list": {
    missing: ["group/tabs-list"],
    reason: "same tool limitation as tabs:tabs's group/tabs entry, for group/tabs-list (tabs/classes.ts's `list.base` field already carries it verbatim).",
  },
  "tabs:tabs-trigger": {
    extra: ["has-data-[icon=inline-end]:pr-1.5", "has-data-[icon=inline-start]:pl-1.5"],
    reason:
      "our own addition with no new-york-v4 equivalent: new-york-v4's TabsTrigger has no icon-affordance padding concept at all (its gap-1.5 alone separates icon and label; padding never adjusts based on which side an icon sits). This repo's tabs.marko passes an `icon` slot marker (data-icon=inline-start/inline-end) that other components (toggle-group, button-group) also use for the same purpose — pre-existing, not introduced by this port.",
  },
  "switch:switch": {
    missing: ["group/switch", "disabled:cursor-not-allowed", "disabled:opacity-50"],
    extra: ["relative", "after:absolute", "after:-inset-x-3", "after:-inset-y-2", "data-disabled:cursor-not-allowed", "data-disabled:opacity-50", "aria-invalid:ring-destructive/20", "dark:aria-invalid:ring-destructive/40", "aria-invalid:border-destructive", "dark:aria-invalid:border-destructive/50", "aria-invalid:ring-3"],
    reason:
      "two independent causes. `group/switch` is a TOOL LIMITATION, not a real mismatch: isStructuralOnlyToken() strips every `group/*`/`peer/*` token from OUR side unconditionally (treating them as always-structural hook classes with no upstream concept), but new-york-v4's own switch.tsx ALSO writes a real `group/switch` (its Thumb reads group-data-[size=*]/switch: off it) — our classes.ts (switch/classes.ts:5) already carries `group/switch` verbatim, verified by inspection; this tool's blanket strip just can't see that it matches here. `disabled:cursor-not-allowed disabled:opacity-50` (native HTML disabled selector) vs our `data-disabled:cursor-not-allowed data-disabled:opacity-50`: our Zag switch signals disabled state via a data attribute rather than the native disabled attribute Radix's SwitchPrimitive.Root relies on — pre-existing structural difference, not a style-layer concern. `relative after:*` (focus-target hit-area extension) and the `aria-invalid:*` validation-state ring are our own additions with no upstream equivalent at all (new-york-v4's Switch has no aria-invalid handling).",
  },

  "progress:progress": {
    missing: ["h-2", "overflow-hidden", "rounded-full", "bg-primary/20"],
    extra: ["flex", "items-center", "overflow-x-hidden", "flex-col", "gap-2"],
    reason:
      "slot-mapping gap, not a style bug: new-york-v4's single Progress.Root element carries both layout AND the visible bar (h-2 w-full overflow-hidden rounded-full bg-primary/20), matching this tool's `progress` slot. Our progress.marko (ported from bases/base's Base-UI-style root/track/indicator split) puts the bar's own classes on a SEPARATE `progress-track` element (classes.ts's `track` field: already `bg-muted relative h-2 w-full overflow-hidden rounded-full`, ported to new-york's `bg-primary/20 rounded-full` in style-new-york.css) — but `track` carries no `mu-*` hook class at all (a pre-existing gap across all 8 styles, not introduced by this port), so --check cannot verify it directly against this tool's slot name. Verified by reading progress.marko: styles.track is applied with no mu- prefix. Root (`mu-progress`) is genuinely just the flex layout wrapper for the optional label/value row, which new-york-v4 has no equivalent of at all (upstream's Progress has no label prop). Out of scope for a style-only port to add a hook class to classes.ts.",
  },

  "accordion:accordion-content": {
    missing: ["pt-0", "pb-4"],
    extra: ["overflow-hidden", "data-open:animate-accordion-down", "data-closed:animate-accordion-up"],
    reason:
      "missing: new-york-v4's AccordionContent is a single element carrying both the collapse wrapper and pt-0/pb-4 padding. Our accordion.marko splits this into content (the ResizeObserver-measured collapse wrapper, classes.ts's `content`) and contentInner (classes.ts's `contentInner`, already `pt-0 pb-4` — a pre-existing bases/base-derived split, not a style-layer choice); the tool only checks the `content` slot, contentInner already carries this value verbatim. extra: `overflow-hidden` is structural (classes.ts); `data-open:.../data-closed:...` drive our height-measured collapse animation (marko-accordion-down/-up keyframes, see accordion/classes.ts's height comment) which has no class-level equivalent in new-york-v4 — Radix's own collapse animation there is driven by its own CSS vars, not a Tailwind class in this slot's string.",
  },

  // batch C
  "alert:alert": {
    missing: ["[&>svg]:size-4", "[&>svg]:translate-y-0.5", "[&>svg]:text-current"],
    extra: [
      "has-data-[slot=alert-action]:relative",
      "has-data-[slot=alert-action]:pr-18",
      "*:[svg]:row-span-2",
      "*:[svg]:translate-y-0.5",
      "*:[svg]:text-current",
      "*:[svg:not([class*='size-'])]:size-4",
    ],
    reason:
      "our alert layout uses a descendant `*:[svg]` selector (not upstream's direct-child `[&>svg]`) plus row-span-2, pre-existing across every base style (vega carries the identical rule) — needed because our alert-action slot (an upstream-absent addition) can co-occur with a 2-row title+description grid, unlike new-york-v4's simpler layout with no action slot at all. Style-only port scope doesn't touch this structural extra.",
  },
  "alert:alert:variant:destructive": {
    missing: ["[&>svg]:text-current"],
    extra: ["*:[svg]:text-current"],
    reason: "same selector-shape divergence as alert:alert — *:[svg] vs [&>svg], pre-existing across all base styles.",
  },
  "alert:alert-title": {
    extra: ["[&_a]:underline", "[&_a]:underline-offset-3", "[&_a]:hover:text-foreground"],
    reason:
      "our own link-hover styling for alert-title/-description with no upstream equivalent (new-york-v4's AlertTitle/AlertDescription carry no [&_a] rule at all) — pre-existing across every base style, not introduced by this port.",
  },
  "alert:alert-description": {
    extra: ["[&_a]:underline", "[&_a]:underline-offset-3", "[&_a]:hover:text-foreground"],
    reason: "same as alert-title: our own link-hover extra, pre-existing across all base styles.",
  },
  "avatar:avatar": {
    extra: [
      "after:absolute",
      "after:inset-0",
      "after:border",
      "after:border-border",
      "after:mix-blend-darken",
      "dark:after:mix-blend-lighten",
      "after:rounded-full",
    ],
    reason:
      "our own after:* pseudo-ring decoration with no upstream equivalent (new-york-v4's Avatar has no ::after rule at all) — pre-existing across every base style, not introduced by this port.",
  },
  "avatar:avatar-image": {
    extra: ["object-cover", "rounded-full"],
    reason:
      "our own object-fit/radius on the image element; upstream relies solely on the avatar root's overflow-hidden+rounded-full to clip — pre-existing across every base style.",
  },
  "combobox:combobox-trigger": {
    extra: ["flex", "h-9", "w-9", "items-center", "justify-center", "text-muted-foreground", "data-disabled:cursor-not-allowed", "data-disabled:opacity-50"],
    reason:
      "our combobox uses a completely different trigger architecture than upstream: a plain in-flow icon button (flex/h-9/w-9) inside our own input-group control, vs. upstream's InputGroupButton+ComboboxTrigger composition with no classes of its own on the trigger element itself (all its sizing comes from InputGroupButton's own size=\"icon-xs\" variant, not visible in this file). Pre-existing across every base style, out of scope for a style-only port.",
  },
  "combobox:combobox-content": {
    missing: ["w-(--anchor-width)", "min-w-[calc(var(--anchor-width)+--spacing(7))]", "data-[chips=true]:min-w-(--anchor-width)"],
    extra: ["max-h-(--available-height)", "w-(--reference-width)", "overflow-x-hidden", "overflow-y-auto", "min-w-36"],
    reason:
      "structural (classes.ts's content literal) — our Zag combobox positions/sizes its content via its own --available-height/--reference-width CSS vars (Zag's anchor-positioning API), a different mechanism than upstream's Base UI --anchor-width/--available-width vars. Pre-existing across every base style, out of scope for a style-only port.",
  },
  "combobox:combobox-list": {
    extra: ["overscroll-contain", "no-scrollbar"],
    reason: "our own scroll-behavior extras with no upstream equivalent, pre-existing across every base style.",
  },
  "combobox:combobox-item": {
    extra: ["not-data-[variant=destructive]:data-highlighted:**:text-accent-foreground"],
    reason:
      "our own descendant-text-color extra for a destructive-variant item (upstream's ComboboxItem has no variant concept at all), pre-existing across every base style.",
  },
  "combobox:combobox-empty": {
    extra: ["py-1.5", "px-2"],
    reason: "our own padding, pre-existing across every base style (upstream's ComboboxEmpty uses py-2 text-center instead of py-1.5 px-2 — a different empty-state layout choice, not introduced by this port).",
  },
  "combobox:combobox-chips": {
    extra: ["gap-1", "p-1"],
    reason: "structural (classes.ts's chips literal) — our own internal padding/gap for the chips container, pre-existing across every base style.",
  },
  "combobox:combobox-chip-input": {
    extra: ["bg-transparent", "px-1", "text-sm", "placeholder:text-muted-foreground", "data-disabled:cursor-not-allowed", "data-disabled:opacity-50"],
    reason: "structural (classes.ts's chipInput literal) — our own input styling with no upstream equivalent (upstream's ComboboxChipsInput carries no classes of its own at all), pre-existing across every base style.",
  },
  "field:field-label": {
    missing: [
      "has-[>[data-slot=field]]:w-full",
      "has-[>[data-slot=field]]:flex-col",
      "has-data-checked:border-primary",
      "items-center",
      "text-sm",
      "font-medium",
    ],
    extra: [
      "has-data-checked:border-primary/30",
      "dark:has-data-checked:border-primary/20",
      "has-data-checked:bg-primary/5",
      "dark:has-data-checked:bg-primary/10",
      "has-[>[data-slot=field]]:rounded-md",
      "has-[>[data-slot=field]]:border",
      "*:data-[slot=field]:p-4",
    ],
    reason:
      "TWO distinct sources of divergence collide on this one key because upstream literally reuses data-slot=\"field-label\" for BOTH its FieldLabel and FieldTitle functions (verified in the raw .tsx — not a tool bug), so both parts hash to the same mu-field-label lookup even though our own component gives FieldTitle its own separate mu-field-title class with different CSS. (1) FieldLabel's own real gaps: has-[>[data-slot=field]]:w-full/flex-col live in classes.ts's nested literal, invisible to the tool (same class of gap as avatar-badge); border-primary/30 + a dark /20 variant is our own softer-emphasis choice vs. upstream's plain border-primary, pre-existing across every base style. (2) FieldTitle's expected tokens (items-center/text-sm/font-medium) are compared against mu-field-label's CSS instead of mu-field-title's (which already carries them correctly, verified separately) purely because of the shared-slot-name collision above — not a real gap in either class.",
  },
  "sidebar:sidebar-menu-button": {
    missing: ["[&>svg]:size-4", "[&>svg]:shrink-0"],
    extra: ["[&_svg]:size-4", "[&_svg]:shrink-0"],
    reason: "our own descendant `[&_svg]` selector (not upstream's direct-child `[&>svg]`), pre-existing across every base style.",
  },
  "sidebar:sidebar-wrapper": {
    missing: ["(no classes.ts entry and no style-new-york.css rule found for this mu-* class)"],
    reason: "tool limitation, not a real gap: sidebar-wrapper's classes.ts literal has no mu-* hook prefix, tool-invisible — every upstream token for this slot is already in the structural literal verbatim.",
  },
  "sidebar:sidebar": {
    missing: ["(no classes.ts entry and no style-new-york.css rule found for this mu-* class)"],
    reason: "same as sidebar:sidebar-wrapper — no mu-* hook prefix on this slot's literal, tool-invisible, nothing to add.",
  },
  "sidebar:sidebar-menu-item": {
    missing: ["(no classes.ts entry and no style-new-york.css rule found for this mu-* class)"],
    reason: "same as sidebar:sidebar-wrapper — no mu-* hook prefix on this slot's literal, tool-invisible, nothing to add.",
  },
  "sidebar:sidebar-menu-sub-item": {
    missing: ["(no classes.ts entry and no style-new-york.css rule found for this mu-* class)"],
    reason: "same as sidebar:sidebar-wrapper — no mu-* hook prefix on this slot's literal, tool-invisible, nothing to add.",
  },
  "sidebar:sidebar-rail": {
    missing: ["-translate-x-1/2", "after:left-1/2"],
    extra: ["after:start-1/2", "ltr:-translate-x-1/2", "rtl:-translate-x-1/2"],
    reason:
      "our rail is RTL-aware where upstream is LTR-only: after:start-1/2 (logical property) instead of after:left-1/2, and an explicit ltr:/rtl: split instead of one unconditional -translate-x-1/2. Pre-existing across every base style, an improvement over upstream not a regression, out of scope for a style-only port.",
  },
  "sidebar:sidebar-content": {
    extra: ["no-scrollbar"],
    reason: "our own scroll-behavior extra with no upstream equivalent, pre-existing across every base style.",
  },
  "sidebar:sidebar-menu-sub-button": {
    missing: ["sm", "text-xs", "md", "text-sm"],
    extra: ["data-[size=md]:text-sm", "data-[size=sm]:text-xs"],
    reason:
      "tool parsing artifact, not a real gap: upstream's SidebarMenuSubButton doesn't express its size classes as string literals in the cn() call at all — it uses JS conditionals (size === \"sm\" && \"text-xs\", size === \"md\" && \"text-sm\"), so the tokenizer captures the bare identifiers \"sm\"/\"md\" from those expressions as if they were classes. Our data-[size=md]:text-sm/data-[size=sm]:text-xs are the correct data-attribute-selector equivalent of the same size-conditional logic, already present.",
  },
  "item:item": {
    missing: ["border-transparent"],
    extra: ["w-full"],
    reason:
      "border-transparent is unconditional on upstream's base itemVariants string but organized per-variant in ours (item:variant:default/muted both apply it, item:variant:outline applies border-border instead) — same net visual result, an organizational difference not a real gap. w-full is structural (classes.ts base literal), pre-existing across every base style.",
  },
  "item:item:variant:default": {
    missing: ["bg-transparent"],
    extra: ["border-transparent"],
    reason: "same organizational difference as item:item — border-transparent lives here instead of on the base rule; bg-transparent is genuinely present via classes.ts's own base structural string (not missing in practice, only from this slot's own CSS rule).",
  },
  "item:item:variant:muted": {
    extra: ["border-transparent"],
    reason: "same organizational difference as item:item.",
  },
  "item:item-media:variant:image": {
    extra: ["group-data-[size=sm]/item:size-8", "group-data-[size=xs]/item:size-6"],
    reason: "our own responsive media sizing across our extra xs size tier (upstream has no xs size and a fixed size-10 media), pre-existing across every base style.",
  },
  "item:item-group": {
    extra: ["w-full", "gap-4", "has-data-[size=sm]:gap-2.5", "has-data-[size=xs]:gap-2"],
    reason: "structural (classes.ts base literal) plus our own size-aware gap extras; upstream's ItemGroup carries no classes at all beyond structural. Pre-existing across every base style.",
  },
  "item:item-content": {
    extra: ["group-data-[size=xs]/item:gap-0"],
    reason: "our own xs-size gap override (upstream has no xs size tier), pre-existing across every base style.",
  },
  "item:item-title": {
    extra: ["line-clamp-1", "underline-offset-4"],
    reason: "structural (classes.ts base literal, line-clamp-1) plus our own underline-offset-4 extra with no upstream equivalent, pre-existing across every base style.",
  },
  "item:item-description": {
    extra: ["text-left", "group-data-[size=xs]/item:text-xs"],
    reason: "our own explicit alignment plus xs-size text scaling (upstream has no xs size tier), pre-existing across every base style.",
  },
  "field:field-description": {
    missing: ["last:mt-0", "nth-last-2:-mt-1", "[&>a]:underline", "[&>a]:underline-offset-4", "[&>a:hover]:text-primary"],
    extra: ["text-left"],
    reason:
      "tool limitation: the missing tokens live in classes.ts's spacing/links sub-exports (fieldDescription.spacing/.links), multi-literal exports the tool can't see (same class as avatar-badge's sizeSm/sizeDefault/sizeLg) — field.marko already concatenates root+spacing+links via cn(), so these ARE emitted. text-left is our own explicit alignment, pre-existing across every base style.",
  },
  "popover:popover-content": {
    extra: ["ring-foreground/10", "flex", "flex-col", "gap-4", "text-sm", "ring-1", "duration-100"],
    reason:
      "our own extras with no upstream equivalent: a ring-1 accent ring (ring-foreground/10) and a flex/flex-col/gap-4/text-sm layout duplicating popover-header's own flex/gap-1/text-sm — pre-existing across every base style, not introduced by this port.",
  },
  "dialog:dialog-description": {
    extra: ["*:[a]:hover:text-foreground", "*:[a]:underline", "*:[a]:underline-offset-3"],
    reason:
      "our own link-hover styling with no upstream equivalent (new-york-v4's DialogDescription carries no [a] rule at all) — pre-existing across every base style, not introduced by this port.",
  },
  "carousel:carousel": {
    missing: ["(no classes.ts entry and no style-new-york.css rule found for this mu-* class)"],
    reason:
      "tool limitation, not a real gap: carousel/carousel-content/carousel-item's classes.ts literals ('relative', 'overflow-hidden outline-none...', 'min-w-0 shrink-0 grow-0 basis-full') have no mu-* hook prefix at all, so readStructuralTokens finds nothing and there's no style-new-york.css rule to read either (none needed — every upstream token for these 3 slots is already covered by the existing structural literal verbatim).",
  },
  "carousel:carousel-content": {
    missing: ["(no classes.ts entry and no style-new-york.css rule found for this mu-* class)"],
    reason: "same as carousel:carousel — no mu-* hook prefix on this slot's literal, tool-invisible, nothing to add.",
  },
  "carousel:carousel-item": {
    missing: ["(no classes.ts entry and no style-new-york.css rule found for this mu-* class)"],
    reason: "same as carousel:carousel — no mu-* hook prefix on this slot's literal, tool-invisible, nothing to add.",
  },
  "carousel:carousel-previous": {
    missing: ["size-8", "horizontal", "-left-12", "-top-12", "left-1/2", "-translate-x-1/2", "rotate-90"],
    extra: ["left-2", "touch-manipulation"],
    reason:
      "our carousel has no vertical-orientation support at all (grep confirms no orientation/horizontal/vertical logic anywhere in carousel.marko) — a pre-existing feature gap, out of scope for a style-only port, so upstream's horizontal:/vertical-only positioning tokens don't apply. size-8 is inherited automatically from Button's already-ported size=\"icon-sm\" variant (mu-button-size-icon-sm resolves to size-8, matching upstream exactly) rather than set directly here. left-2/touch-manipulation are our own pre-existing positioning/touch-handling choices.",
  },
  "carousel:carousel-next": {
    missing: ["size-8", "horizontal", "-right-12", "-bottom-12", "left-1/2", "-translate-x-1/2", "rotate-90"],
    extra: ["right-2", "touch-manipulation"],
    reason: "same as carousel:carousel-previous.",
  },
  "pagination:pagination-link": {
    missing: ["outline", "ghost"],
    reason:
      "tool parsing artifact, not a real gap: upstream's PaginationLink doesn't build its className from a cn() string literal at all — it calls buttonVariants({ variant: isActive ? \"outline\" : \"ghost\", size }), so extractParts's bareMatch fallback picks up the literal variant-name strings from that ternary as if they were classes. Our link.marko already calls the SAME buttonVariants (../button/variants.ts) with the same variant/size logic, so parity is inherited automatically from the already-ported button styles, not something to add here.",
  },
  "pagination:pagination-ellipsis": {
    extra: ["[&_svg:not([class*='size-'])]:size-4"],
    reason:
      "our own icon-sizing hook for any icon dropped into the ellipsis slot; upstream instead sizes its MoreHorizontalIcon directly via className=\"size-4\" on the icon itself, with no descendant selector needed. Pre-existing across every base style.",
  },
  "toggle:toggle": {
    missing: ["data-[state=on]:bg-accent", "data-[state=on]:text-accent-foreground"],
    extra: ["aria-pressed:bg-accent", "aria-pressed:text-accent-foreground"],
    reason:
      "our toggle uses an aria-pressed selector for the pressed-state color instead of upstream's data-[state=on] — same semantic state (both true only when pressed), a pre-existing selector-strategy choice across every base style, not introduced by this port.",
  },
  "toggle:toggle:size:default": {
    extra: ["has-data-[icon=inline-end]:pr-2", "has-data-[icon=inline-start]:pl-2"],
    reason: "our own icon-slot padding adjustment with no upstream equivalent (upstream has no icon-inset concept for Toggle), pre-existing across every base style.",
  },
  "toggle:toggle:size:sm": {
    extra: ["has-data-[icon=inline-end]:pr-1.5", "has-data-[icon=inline-start]:pl-1.5"],
    reason: "same as toggle:toggle:size:default, at the sm size's own spacing scale.",
  },
  "toggle:toggle:size:lg": {
    extra: ["has-data-[icon=inline-end]:pr-2", "has-data-[icon=inline-start]:pl-2"],
    reason: "same as toggle:toggle:size:default, at the lg size (shares default's 2/2 padding).",
  },
  "textarea:textarea": {
    extra: ["aria-invalid:ring-3", "dark:aria-invalid:border-destructive/50"],
    reason:
      "our own extras with no upstream equivalent: aria-invalid:ring-3 keeps the error-state ring the same width as the focus ring (upstream only sets the error ring's color/opacity, relying on the browser default width), dark:aria-invalid:border-destructive/50 is a dark-mode border-color adjustment upstream doesn't carry. Pre-existing across every base style.",
  },
  "radio-group:radio-group": {
    extra: ["w-full"],
    reason: "structural (classes.ts root string), pre-existing across every base style — not introduced by this port.",
  },
  "radio-group:radio-group-item": {
    missing: ["text-primary"],
    extra: [
      "peer",
      "relative",
      "after:absolute",
      "after:-inset-x-3",
      "after:-inset-y-2",
      "flex",
      "data-checked:bg-primary",
      "data-checked:text-primary-foreground",
      "dark:data-checked:bg-primary",
      "data-checked:border-primary",
      "aria-invalid:aria-checked:border-primary",
      "dark:aria-invalid:border-destructive/50",
    ],
    reason:
      "our radio uses a fundamentally different indicator design than upstream: a filled bg-primary item background + a small bg-primary-foreground dot span, vs. upstream's unfilled bordered circle with a fill-primary CircleIcon dot. text-primary (upstream, colors its icon via currentColor) has no purpose in our design and is correctly omitted; the checked-state background/border classes and the touch hit-area (peer/relative/after:*) are our own pre-existing structural approach, present in every base style, out of scope for a style-only port. flex is carried forward unchanged from vega (kept for parity with the existing indicator-centering approach, not upstream-driven).",
  },
  "separator:separator": {
    missing: ["data-horizontal:h-px", "data-horizontal:w-full", "data-vertical:h-full", "data-vertical:w-px"],
    reason:
      "tool limitation, not a real gap: separator's classes.ts literal has no mu-* hook prefix (its cn() call is styles.root with no mu-separator token at all), so readStructuralTokens never finds it and none of its tokens are visible to --check. The real literal already carries data-horizontal:h-px/w-full and data-vertical:w-px (matching upstream) plus data-vertical:self-stretch instead of upstream's data-vertical:h-full — a pre-existing bases/base structural choice (stretch to fill cross-axis vs. explicit h-full), not introduced by this port.",
  },
  "checkbox:checkbox": {
    extra: ["relative", "after:absolute", "after:-inset-x-3", "after:-inset-y-2", "group-has-disabled/field:opacity-50"],
    reason:
      "our own extended touch hit-area (after:* pseudo, no upstream equivalent) and field-integration disabled cascade (group-has-disabled/field:), pre-existing across every base style — out of scope for a style-only port.",
  },
  "avatar:avatar-badge": {
    missing: [
      "group-data-[size=sm]/avatar:size-2",
      "group-data-[size=sm]/avatar:[&>svg]:hidden",
      "group-data-[size=default]/avatar:size-2.5",
      "group-data-[size=default]/avatar:[&>svg]:size-2",
      "group-data-[size=lg]/avatar:size-3",
      "group-data-[size=lg]/avatar:[&>svg]:size-2",
    ],
    extra: ["bg-blend-color"],
    reason:
      "tool limitation, not a real gap: the group-data-[size=*] tokens live in classes.ts's sizeSm/sizeDefault/sizeLg literals, which don't start with the mu-avatar-badge hook (readStructuralTokens only captures the first literal per mu-class) — badge.marko already concatenates root+sizeSm+sizeDefault+sizeLg via cn(), so these ARE emitted, just invisible to --check. bg-blend-color is a real, pre-existing extra (upstream is plain bg-primary) carried across every base style.",
  },
}

interface Part {
  slot: string
  fnName: string
  classes: string[]
}

/**
 * Extracts data-slot -> class-string(s) per function from a shadcn-format .tsx file.
 * Handles both a bare `className={cn("...", className)}` and a cva(...) call assigned to
 * `<name>Variants`, in which case each variant's classes are returned as separate parts keyed
 * `<slot>:<variantGroup>:<variantValue>`.
 */
function extractParts(src: string): Part[] {
  const parts: Part[] = []

  // cva(...) blocks: capture base string + variants object
  const cvaRe = /const (\w+Variants) = cva\(\s*("(?:[^"\\]|\\.)*"|`[^`]*`)([\s\S]*?)\n\)/g
  let m: RegExpExecArray | null
  while ((m = cvaRe.exec(src))) {
    const varName = m[1]!
    const baseStr = m[2]!
    const rest = m[3]!
    const base = unquote(baseStr)
    // find nearest preceding/following data-slot for this Variants const — heuristic: search function body after
    const slot = guessSlotForVariants(src, varName)
    if (base) parts.push({ slot, fnName: varName, classes: [base] })

    const variantsBlockMatch = /variants:\s*\{([\s\S]*?)\n\s*\},\s*\n\s*defaultVariants/.exec(rest)
    if (variantsBlockMatch) {
      const groups = variantsBlockMatch[1]!
      const groupRe = /(\w+):\s*\{([\s\S]*?)\n\s*\},?\n/g
      let gm: RegExpExecArray | null
      while ((gm = groupRe.exec(groups + "\n"))) {
        const groupName = gm[1]!
        const groupBody = gm[2]!
        const valueRe = /["']?([\w-]+)["']?:\s*("(?:[^"\\]|\\.)*"|`[^`]*`)/g
        let vm: RegExpExecArray | null
        while ((vm = valueRe.exec(groupBody))) {
          const value = vm[1]!
          const classStr = vm[2]!
          const cls = unquote(classStr)
          if (cls) parts.push({ slot: `${slot}:${groupName}:${value}`, fnName: varName, classes: [cls] })
        }
      }
    }
  }

  // function components with data-slot + className={cn(...)}
  const fnRe = /function (\w+)\([\s\S]*?\)\s*\{([\s\S]*?)\n\}/g
  while ((m = fnRe.exec(src))) {
    const fnName = m[1]!
    const body = m[2]!
    const classNames: string[] = []
    // Grab every top-level string literal argument inside a cn(...) call in this function
    const cnCallMatch = /className=\{cn\(([\s\S]*?)\)\}/.exec(body)
    // A function can render more than one JSX element with its own data-slot before reaching
    // the element that actually carries className (e.g. DialogContent wraps its classed
    // Content in a data-slot="dialog-portal" wrapper first) — the FIRST data-slot in the body
    // is not necessarily the one this className belongs to. Take the data-slot nearest to (at
    // or before) the className match itself; fall back to the first in the body if none
    // precedes it (covers the simple one-element-per-function case unchanged).
    const classNameAttrIdx = cnCallMatch ? cnCallMatch.index! : /className=/.exec(body)?.index
    if (classNameAttrIdx === undefined) continue
    const before = body.slice(0, classNameAttrIdx)
    const slotMatches = [...before.matchAll(/data-slot=["'{]([\w"'-]+)/g)]
    // Only a data-slot genuinely preceding this className is trustworthy — a JSX element with
    // no data-slot of its own (e.g. combobox.tsx's plain <InputGroup className="w-auto">) has
    // no reliable attribution, and grabbing some LATER data-slot from elsewhere in the function
    // body (the previous fallback here) can misattribute classes to the wrong slot entirely, as
    // it did for combobox-input's classes landing on "input-group-button" instead. Skip rather
    // than guess wrong.
    if (!slotMatches.length) continue
    const slot = slotMatches[slotMatches.length - 1]![1]!.replace(/["']/g, "")
    if (cnCallMatch) {
      const inner = cnCallMatch[1]!
      let sm: RegExpExecArray | null
      const litRe = /("(?:[^"\\]|\\.)*"|`[^`]*`)/g
      while ((sm = litRe.exec(inner))) {
        const cls = unquote(sm[1]!)
        if (cls && cls !== "className") classNames.push(cls)
      }
    } else {
      const bareMatch = /className=("(?:[^"\\]|\\.)*")/.exec(body)
      if (bareMatch) classNames.push(unquote(bareMatch[1]!))
    }
    if (classNames.length) parts.push({ slot, fnName, classes: classNames })
  }

  return parts
}

function guessSlotForVariants(src: string, varName: string): string {
  const idx = src.indexOf(varName + " = cva")
  const after = src.slice(idx)
  const slotMatch = /data-slot=["']([\w-]+)["']/.exec(after)
  return slotMatch ? slotMatch[1]! : varName.replace(/Variants$/, "")
}

function unquote(s: string): string {
  return s.replace(/^["'`]|["'`]$/g, "").trim()
}

function tokenize(classStr: string): Set<string> {
  return new Set(classStr.split(/\s+/).filter(Boolean))
}

function diffTokens(target: Set<string>, structural: Set<string>): { keep: string[]; removed: string[] } {
  const keep: string[] = []
  const removed: string[] = []
  for (const t of target) {
    if (structural.has(t)) removed.push(t)
    else keep.push(t)
  }
  return { keep, removed }
}

function runDraft(component: string) {
  const nyPath = join(NEW_YORK_DIR, `${component}.tsx`)
  const basePath = join(BASE_DIR, `${component}.tsx`)

  if (!existsSync(nyPath)) {
    console.log(`NO_UPSTREAM_NEW_YORK: ${component} has no new-york-v4 source (${nyPath})`)
    console.log(`-> use vega rules with comment: /* new-york: no upstream new-york-v4 source; vega rules */`)
    process.exit(0)
  }
  if (!existsSync(basePath)) {
    console.error(`Missing bases/base source for ${component} (${basePath}) — cannot compute structural diff`)
    process.exit(1)
  }

  const nySrc = readFileSync(nyPath, "utf8")
  const baseSrc = readFileSync(basePath, "utf8")

  const nyParts = extractParts(nySrc)
  const baseParts = extractParts(baseSrc)
  const baseBySlot = new Map<string, Set<string>>()
  for (const p of baseParts) {
    const existing = baseBySlot.get(p.slot) ?? new Set<string>()
    for (const c of p.classes) for (const t of tokenize(c)) existing.add(t)
    baseBySlot.set(p.slot, existing)
  }

  console.log(`# Draft new-york derivation: ${component}`)
  console.log(`# upstream new-york-v4: ${nyPath}`)
  console.log(`# upstream bases/base:  ${basePath}\n`)

  const unmatchedSlots = new Set<string>()
  for (const part of nyParts) {
    const baseSlot = part.slot.split(":")[0]!
    const structural = baseBySlot.get(baseSlot)
    if (!structural) unmatchedSlots.add(part.slot)
    const targetTokens = tokenize(part.classes.join(" "))
    const { keep, removed } = diffTokens(targetTokens, structural ?? new Set())
    console.log(`## ${part.slot}  (fn: ${part.fnName})`)
    console.log(`draft: ${keep.join(" ") || "(nothing left after removing structural classes)"}`)
    if (removed.length) console.log(`removed-as-structural: ${removed.join(" ")}`)
    if (!structural) console.log(`CONFLICT: no bases/base slot "${baseSlot}" found — review manually (possible naming/primitive divergence)`)
    console.log()
  }

  if (unmatchedSlots.size) {
    console.log(`# ${unmatchedSlots.size} slot(s) had no bases/base match — manual review required:`)
    for (const s of unmatchedSlots) console.log(`#  - ${s}`)
  }
}

/** The mu-* class name a new-york-v4 part maps to, per this repo's own naming convention. */
function muClassName(slot: string): string {
  const segments = slot.split(":") // "button:variant:outline" -> mu-button-variant-outline
  return `mu-${segments.join("-")}`
}

/** Applies every EQUIVALENCES replacement to a raw token (prefix or whole-token match). */
function normalizeToken(token: string): string {
  // A Tailwind token is a chain of variant prefixes ending in the base utility
  // (dark:focus-visible:ring-[3px]) — an EQUIVALENCES pair can be about any link in that chain
  // (a state selector, or the base utility itself), so try the match at every "cut point": the
  // token's own start, and right after each variant's trailing ":".
  const cutPoints: number[] = [0]
  for (let i = 0; i < token.length; i++) if (token[i] === ":") cutPoints.push(i + 1)
  for (const at of cutPoints) {
    const prefix = token.slice(0, at)
    const rest = token.slice(at)
    for (const { from, to } of EQUIVALENCES) {
      if (rest === from) return prefix + to
      if (rest.startsWith(from)) return prefix + to + rest.slice(from.length)
    }
  }
  return token
}

/** Normalizes every token and drops our own hook classes (mu-*, group/*, peer/*) — see isStructuralOnlyToken. */
function normalizeOurTokens(tokens: Iterable<string>): Set<string> {
  const out = new Set<string>()
  for (const t of tokens) {
    if (isStructuralOnlyToken(t)) continue
    out.add(normalizeToken(t))
  }
  return out
}

/**
 * Normalizes every token of new-york-v4's raw target string. Drops group/*|peer/* markers too —
 * upstream defines its OWN named groups (e.g. avatar.tsx's `group/avatar`), not just our hook
 * classes, and a named-group token always matches structurally regardless of name (both sides
 * declare the group on the same element), so comparing group NAMES would flag a false mismatch
 * whenever our name differs from upstream's own (batch C, avatar).
 */
function normalizeTargetTokens(tokens: Iterable<string>): Set<string> {
  const out = new Set<string>()
  for (const t of tokens) {
    if (t.startsWith("group/") || t.startsWith("peer/")) continue
    out.add(normalizeToken(t))
  }
  return out
}

/**
 * Reads packages/shadcn/ui/<component>/classes.ts and returns, for a given mu-* class name, the
 * full token set of the string literal that class name appears as the FIRST token of (our
 * convention: every classes.ts string starts with its own mu-<slot> hook). Returns undefined if no
 * such literal is found — that mu-* class isn't a real part of this component's classes.ts.
 */
function readStructuralTokens(component: string, muClass: string): Set<string> | undefined {
  const classesPath = join(UI_DIR, component, "classes.ts")
  if (!existsSync(classesPath)) return undefined
  const src = readFileSync(classesPath, "utf8")
  // Match every top-level string literal (single/double/template) in the file, in source order.
  const litRe = /"((?:[^"\\]|\\.)*)"|'((?:[^'\\]|\\.)*)'|`([^`]*)`/g
  let m: RegExpExecArray | null
  while ((m = litRe.exec(src))) {
    const literal = m[1] ?? m[2] ?? m[3] ?? ""
    const tokens = literal.split(/\s+/).filter(Boolean)
    if (tokens[0] === muClass) return new Set(tokens)
  }
  return undefined
}

/**
 * Reads packages/shadcn/styles/style-new-york.css and returns the @apply token set for a given
 * mu-* class's `.mu-<name> { @apply ...; }` rule. Returns undefined if no such rule exists.
 */
function readStyleTokens(muClass: string): Set<string> | undefined {
  const css = readFileSync(STYLE_NEW_YORK_CSS, "utf8")
  const escaped = muClass.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
  const ruleRe = new RegExp(`\\.${escaped}\\s*\\{\\s*@apply\\s+([^;]*);`, "m")
  const m = ruleRe.exec(css)
  if (!m) return undefined
  return new Set(m[1]!.trim().split(/\s+/).filter(Boolean))
}

interface CheckResult {
  part: string
  muClass: string
  ok: boolean
  missing: string[]
  extra: string[]
  allowlistedMissing: string[]
  allowlistedExtra: string[]
}

function runCheck(component: string): boolean {
  const nyPath = join(NEW_YORK_DIR, `${component}.tsx`)
  if (!existsSync(nyPath)) {
    console.log(`NO_UPSTREAM_NEW_YORK: ${component} has no new-york-v4 source — nothing to check (vega rules apply, by design).`)
    return true
  }
  if (!existsSync(join(STYLE_NEW_YORK_CSS))) {
    console.error(`Missing ${STYLE_NEW_YORK_CSS}`)
    return false
  }

  const nySrc = readFileSync(nyPath, "utf8")
  const nyParts = extractParts(nySrc)

  console.log(`# --check ${component}`)
  console.log(`# upstream new-york-v4: ${nyPath}\n`)

  const results: CheckResult[] = []

  for (const part of nyParts) {
    const muClass = muClassName(part.slot)
    const structural = readStructuralTokens(component, muClass) ?? new Set<string>()
    const style = readStyleTokens(muClass)

    if (style === undefined && structural.size === 0) {
      // Some slots have no mu-* hook prefix at all on their classes.ts literal (e.g. carousel's
      // root/content/item), so neither structural nor style tokens are ever visible to this
      // tool — a documented tool limitation, not necessarily a real gap. Still allow a
      // DIVERGENCES entry to explain and allowlist this case, same as any other mismatch,
      // instead of always hard-failing before the allowlist is even consulted.
      const noHookMsg = "(no classes.ts entry and no style-new-york.css rule found for this mu-* class)"
      const divergence = DIVERGENCES[`${component}:${part.slot}`]
      const allowlisted = divergence?.missing?.includes(noHookMsg) ?? false
      results.push({
        part: part.slot,
        muClass,
        ok: allowlisted,
        missing: allowlisted ? [] : [noHookMsg],
        extra: [],
        allowlistedMissing: allowlisted ? [noHookMsg] : [],
        allowlistedExtra: [],
      })
      continue
    }

    const ours = normalizeOurTokens(new Set([...structural, ...(style ?? [])]))
    const target = normalizeTargetTokens(tokenize(part.classes.join(" ")))

    const divergence = DIVERGENCES[`${component}:${part.slot}`]
    const allowedMissing = new Set(divergence?.missing ?? [])
    const allowedExtra = new Set(divergence?.extra ?? [])

    const missing: string[] = []
    const allowlistedMissing: string[] = []
    for (const t of target) {
      if (ours.has(t)) continue
      if (allowedMissing.has(t)) allowlistedMissing.push(t)
      else missing.push(t)
    }

    const extra: string[] = []
    const allowlistedExtra: string[] = []
    for (const t of ours) {
      if (target.has(t)) continue
      if (allowedExtra.has(t)) allowlistedExtra.push(t)
      else extra.push(t)
    }

    results.push({
      part: part.slot,
      muClass,
      ok: missing.length === 0 && extra.length === 0,
      missing,
      extra,
      allowlistedMissing,
      allowlistedExtra,
    })
  }

  let allOk = true
  for (const r of results) {
    const status = r.ok ? "OK  " : "FAIL"
    console.log(`[${status}] ${r.part}  (${r.muClass})`)
    if (r.missing.length) {
      allOk = false
      console.log(`         missing: ${r.missing.join(" ")}`)
    }
    if (r.extra.length) {
      allOk = false
      console.log(`         extra:   ${r.extra.join(" ")}`)
    }
    if (r.allowlistedMissing.length) console.log(`         missing (allowlisted): ${r.allowlistedMissing.join(" ")} — ${DIVERGENCES[`${component}:${r.part}`]?.reason}`)
    if (r.allowlistedExtra.length) console.log(`         extra (allowlisted):   ${r.allowlistedExtra.join(" ")} — ${DIVERGENCES[`${component}:${r.part}`]?.reason}`)
  }

  console.log()
  console.log(`# ${results.filter((r) => r.ok).length}/${results.length} parts OK for ${component}`)
  return allOk
}

function main() {
  const args = process.argv.slice(2)
  const checkIdx = args.indexOf("--check")
  if (checkIdx !== -1) {
    const component = args[checkIdx + 1]
    if (!component) {
      console.error("Usage: bun tooling/derive-new-york.ts --check <component>")
      process.exit(1)
    }
    const ok = runCheck(component)
    process.exit(ok ? 0 : 1)
  }

  const component = args[0]
  if (!component) {
    console.error("Usage: bun tooling/derive-new-york.ts [--check] <component>")
    process.exit(1)
  }
  runDraft(component)
}

main()
