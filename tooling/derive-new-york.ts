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
  // Tailwind v4's `*:` direct-child variant shorthand for the older `[&>*]:` arbitrary form.
  { from: "[&>*]:focus-visible:relative", to: "*:focus-visible:relative" },
  { from: "[&>*]:focus-visible:z-10", to: "*:focus-visible:z-10" },
  // Radix boolean-attribute selectors -> our components' equivalent plain data attributes.
  { from: "data-[disabled]:", to: "data-disabled:" },
  { from: "data-[inset]:", to: "data-inset:" },
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
  // repo-wide convention (19 pre-existing uses in style-new-york.css alone). Whole-token form
  // handles it bare; the compounded form (`focus-visible:ring-[3px]`, by far the most common
  // shape in new-york-v4) needs its own entry since normalizeToken only matches a `from` as a
  // whole token or a PREFIX, never a suffix.
  { from: "ring-[3px]", to: "ring-3" },
  { from: "focus-visible:ring-[3px]", to: "focus-visible:ring-3" },
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
    const slotMatch = /data-slot=["'{]([\w"'-]+)/.exec(body)
    if (!slotMatch) continue
    const slot = slotMatch[1]!.replace(/["']/g, "")
    const classNames: string[] = []
    // Grab every top-level string literal argument inside a cn(...) call in this function
    const cnCallMatch = /className=\{cn\(([\s\S]*?)\)\}/.exec(body)
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
  let out = token
  for (const { from, to } of EQUIVALENCES) {
    if (out === from) { out = to; break }
    if (out.startsWith(from)) { out = to + out.slice(from.length); break }
  }
  return out
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

/** Normalizes every token of new-york-v4's raw target string (no hook classes to strip there). */
function normalizeTargetTokens(tokens: Iterable<string>): Set<string> {
  const out = new Set<string>()
  for (const t of tokens) out.add(normalizeToken(t))
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
