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
  // Radix boolean-attribute selectors -> our components' equivalent plain data attributes.
  { from: "data-[disabled]:", to: "data-disabled:" },
  { from: "data-[inset]:", to: "data-inset:" },
  { from: "data-[placeholder]:", to: "data-placeholder:" },
  // Arbitrary-value spacing that equals a token already in Tailwind's default scale (8rem = 32 * 0.25rem).
  { from: "min-w-[8rem]", to: "min-w-32" },
  // batch A: same-meaning Tailwind utility rename — our classes.ts (Tailwind v4) writes wrap-break-word,
  // upstream new-york-v4's breadcrumb.tsx still writes the legacy break-words alias; both compile to
  // overflow-wrap: break-word.
  { from: "break-words", to: "wrap-break-word" },
  // batch A: our alert-dialog/dialog family write the translate-centering shorthand utilities;
  // upstream new-york-v4 writes the equivalent arbitrary-value form. Same computed transform.
  { from: "top-[50%]", to: "top-1/2" },
  { from: "left-[50%]", to: "left-1/2" },
  { from: "translate-x-[-50%]", to: "-translate-x-1/2" },
  { from: "translate-y-[-50%]", to: "-translate-y-1/2" },
  // batch A: resizable.tsx uses react-resizable-panels, which sets an ARIA orientation attribute;
  // our resizable.marko is Zag-based (splitter machine) and emits data-orientation instead (verified
  // in packages/shadcn/ui/resizable/resizable.marko via api().getRootProps()) — same meaning, different
  // underlying primitive library, same class of divergence as the dropdown-menu Base-UI-vs-Radix case.
  { from: "aria-[orientation=vertical]:", to: "data-[orientation=vertical]:" },
  { from: "aria-[orientation=horizontal]:", to: "data-[orientation=horizontal]:" },
  { from: "[&[aria-orientation=horizontal]>div]:", to: "[&[data-orientation=horizontal]>div]:" },
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
  // batch A
  "toggle-group:toggle-group": {
    missing: ["data-[spacing=default]:data-[variant=outline]:shadow-xs", "group/toggle-group"],
    extra: [
      "flex-row",
      "data-vertical:flex-col",
      "data-vertical:items-stretch",
      "data-[spacing=0]:data-[variant=outline]:shadow-xs",
    ],
    reason:
      "1) upstream's own data-spacing attribute is always a plain number (default 0), so the literal string selector data-[spacing=default] can never match anything real — verified against new-york-v4's and our own toggle-group.tsx, both coerce a numeric spacing prop into data-spacing. Our data-[spacing=0]:data-[variant=outline]:shadow-xs selector on the same rule is the reachable equivalent already covering the intended (no-gap) state. 2) group/toggle-group is a tool limitation, not a real gap: isStructuralOnlyToken() excludes any group/* token from our side entirely (designed for hook classes with no upstream concept), but here classes.ts genuinely carries group/toggle-group verbatim — verified present in packages/shadcn/ui/toggle-group/classes.ts. 3) flex-row/data-vertical:flex-col/data-vertical:items-stretch are ours-only: new-york-v4 has no vertical-orientation support at all (see the toggle-group-item entry below), our component is Zag-driven and supports both orientations (ported from bases/base's orientation-aware ToggleGroup) — out of scope for a style-only port.",
  },
  "toggle-group:toggle-group-item": {
    missing: [
      "data-[spacing=0]:first:rounded-l-md",
      "data-[spacing=0]:last:rounded-r-md",
      "data-[spacing=0]:data-[variant=outline]:first:border-l",
    ],
    extra: [
      "group-data-horizontal/toggle-group:data-[spacing=0]:first:rounded-l-md",
      "group-data-vertical/toggle-group:data-[spacing=0]:first:rounded-t-md",
      "group-data-horizontal/toggle-group:data-[spacing=0]:last:rounded-r-md",
      "group-data-vertical/toggle-group:data-[spacing=0]:last:rounded-b-md",
      "group-data-horizontal/toggle-group:data-[spacing=0]:data-[variant=outline]:first:border-l",
      "group-data-vertical/toggle-group:data-[spacing=0]:data-[variant=outline]:first:border-t",
      "group-data-horizontal/toggle-group:data-[spacing=0]:data-[variant=outline]:border-l-0",
      "group-data-vertical/toggle-group:data-[spacing=0]:data-[variant=outline]:border-t-0",
    ],
    reason:
      "new-york-v4's toggle-group has no vertical-orientation support at all (verified: no data-vertical/aria-orientation handling anywhere in its source), so its first:rounded-l-md/last:rounded-r-md/first:border-l/border-l-0 selectors are unconditional (horizontal-only, no group-data qualifier). Our component is Zag-driven and supports both orientations (ported from bases/base's orientation-aware ToggleGroup, whose classes.ts already carried this same group-data-horizontal/vertical split verbatim before this port), so it needs the qualifier to also cover the vertical case new-york-v4 doesn't have — out of scope for a style-only port.",
  },
  "resizable:resizable-handle": {
    missing: [
      "data-[orientation=horizontal]:h-px",
      "data-[orientation=horizontal]:w-full",
      "data-[orientation=horizontal]:after:left-0",
      "data-[orientation=horizontal]:after:h-1",
      "data-[orientation=horizontal]:after:w-full",
      "data-[orientation=horizontal]:after:translate-x-0",
      "data-[orientation=horizontal]:after:-translate-y-1/2",
      "[&[data-orientation=horizontal]>div]:rotate-90",
    ],
    extra: [
      "ring-offset-background",
      "data-[orientation=vertical]:h-px",
      "data-[orientation=vertical]:w-full",
      "data-[orientation=vertical]:after:left-0",
      "data-[orientation=vertical]:after:h-1",
      "data-[orientation=vertical]:after:w-full",
      "data-[orientation=vertical]:after:translate-x-0",
      "data-[orientation=vertical]:after:-translate-y-1/2",
      "[&[data-orientation=vertical]>div]:rotate-90",
    ],
    reason:
      "opposite default-orientation convention, not a visual difference: upstream defaults to a vertical panel split (side-by-side panels, vertical divider) and its base string already assumes that layout, applying horizontal-specific overrides only when explicitly switched. Our resizable.marko defaults orientation to \"horizontal\" (see the `orientation=input.orientation ?? \"horizontal\"` line), so our base string assumes the opposite default and applies vertical-specific overrides instead — the two rules are structurally mirror images of each other, verified against the raw new-york-v4 source; ring-offset-background is a pre-existing structural addition (in classes.ts before this port) with no upstream equivalent (new-york-v4 doesn't set a ring offset color, only focus-visible:ring-offset-1 for the width, ported above).",
  },
  "table:table-container": {
    missing: ["caption-bottom", "text-sm"],
    extra: ["relative", "overflow-x-auto"],
    reason:
      "tool limitation, not a real gap: new-york-v4's Table() function renders TWO nested elements each with their own data-slot (an outer div data-slot=\"table-container\" with fixed classes relative w-full overflow-x-auto, and an inner table data-slot=\"table\" carrying the cn()-merged w-full caption-bottom text-sm) — extractParts()'s function-body regex only captures the FIRST data-slot match per function, so it reports the table-container slot name paired with the inner table's cn() classes. Verified our own components split correctly: mu-table-container is relative w-full overflow-x-auto and mu-table is w-full caption-bottom text-sm, an exact match for upstream's two elements respectively.",
  },
  "tooltip:tooltip-content": {
    extra: [
      "max-w-xs",
      "data-open:animate-in",
      "data-open:fade-in-0",
      "data-open:zoom-in-95",
      "data-[state=delayed-open]:animate-in",
      "data-[state=delayed-open]:fade-in-0",
      "data-[state=delayed-open]:zoom-in-95",
      "inline-flex",
      "items-center",
      "gap-1.5",
      "has-data-[slot=kbd]:pr-1.5",
      "**:data-[slot=kbd]:relative",
      "**:data-[slot=kbd]:isolate",
      "**:data-[slot=kbd]:z-50",
      "**:data-[slot=kbd]:rounded-sm",
    ],
    reason:
      "our tooltip is a Zag-based extended version with no upstream equivalent for these behaviors: max-w-xs (wrapping long content, upstream's tooltip has no max-width at all — w-fit only), kbd-slot layout (has-data-[slot=kbd]/**:data-[slot=kbd]:* — upstream's tooltip renders only {children}, no keyboard-shortcut convention), and a delayed-open animation state (data-[state=delayed-open]:* — Zag's tooltip machine models an intermediate delayed-open state that Radix's simpler open/closed tooltip has no equivalent for, so the plain data-open:* forms are additive alongside the bare animate-in/fade-in-0/zoom-in-95 ported above, not a replacement for them).",
  },
  "hover-card:hover-card-portal": {
    reason:
      "tool limitation: HoverCardContent() renders TWO nested elements each with their own data-slot (HoverCardPrimitive.Portal data-slot=\"hover-card-portal\" wrapping HoverCardPrimitive.Content data-slot=\"hover-card-content\", which carries the actual cn()-merged classes) — extractParts()'s function-body regex only captures the FIRST data-slot per function, same class of bug as table:table-container above. Our real slot is mu-hover-card-content (packages/shadcn/ui/hover-card/classes.ts), verified and ported by hand in style-new-york.css; hover-card-portal has no rendered element of its own to style.",
  },
  "input-otp:input-otp": {
    missing: ["disabled:cursor-not-allowed"],
    extra: ["flex", "items-center", "has-disabled:opacity-50", "gap-2"],
    reason:
      "upstream's InputOTP() function has TWO class-bearing props on the same element (containerClassName=\"flex items-center gap-2 has-disabled:opacity-50\" for the wrapper div, className=\"disabled:cursor-not-allowed\" for the underlying native <input>) — extractParts() only matches a literal className={cn(...)} call, correctly skipping containerClassName, so it attributes the input-only disabled:cursor-not-allowed string to the input-otp data-slot, which is really the CONTAINER. Our architecture splits root (container, mu-input-otp) from a separate native-input slot (mu-input-otp-input) that already carries disabled:cursor-not-allowed verbatim (packages/shadcn/ui/input-otp/classes.ts) — verified both classes exist, just on different slots than the tool's extraction assumes.",
  },
  "input-otp:input-otp-group": {
    extra: [
      "has-aria-invalid:ring-destructive/20",
      "dark:has-aria-invalid:ring-destructive/40",
      "has-aria-invalid:border-destructive",
      "rounded-md",
      "has-aria-invalid:ring-3",
    ],
    reason:
      "ours-only container-level aria-invalid indicator (a ring around the whole slot group when any slot inside is invalid) with no upstream equivalent — new-york-v4's InputOTPGroup is a bare flex wrapper, div data-slot=\"input-otp-group\" className=\"flex items-center\" only, no validity styling at the group level at all.",
  },
  "input-otp:input-otp-slot": {
    extra: ["has-focus:z-10"],
    reason:
      "pre-existing structural convention (in classes.ts before this port, packages/shadcn/ui/input-otp/classes.ts slot: \"...has-focus:z-10\"), a keyboard-focus z-index bump upstream doesn't need (upstream instead raises z-index only for the data-[active=true] state, ported above as data-[active=true]:z-10) — out of scope for a style-only port.",
  },
  "message-scroller:message-scroller": {
    missing: ["group/message-scroller"],
    reason:
      "tool limitation, not a real gap (same class as toggle-group:toggle-group above): isStructuralOnlyToken() excludes any group/* token from OUR side entirely, but classes.ts genuinely carries group/message-scroller verbatim (packages/shadcn/ui/message-scroller/classes.ts root) matching upstream's own group/message-scroller.",
  },
  "message-scroller:message-scroller-viewport": {
    missing: ["data-autoscrolling:scrollbar-none"],
    extra: ["data-autoscrolling:scrollbar-thumb-transparent", "data-autoscrolling:scrollbar-track-transparent"],
    reason:
      "pre-existing structural choice (in classes.ts before this port): our component hides the scrollbar during autoscroll by making its thumb/track transparent (two utilities from a scrollbar plugin), while new-york-v4 uses that same plugin's blunter data-autoscrolling:scrollbar-none. Same visual outcome (scrollbar invisible while autoscrolling), different utility — a structural implementation choice, not a style-layer concern, out of scope for a style-only port.",
  },
  "select:select-content": {
    missing: [
      "max-h-(--radix-select-content-available-height)",
      "origin-(--radix-select-content-transform-origin)",
      "popper",
    ],
    extra: ["max-h-(--available-height)", "origin-(--transform-origin)"],
    reason:
      "positioning vars are structural (already in classes.ts under our own shorter --available-height/--transform-origin CSS var names, same class as the dropdown-menu --radix-*-content-available-height divergence already documented above) — not a style-layer concern. \"popper\" is a tool extraction artifact, not a real class: upstream's SelectContent conditionally appends a string only `position === \"popper\" && \"...\"`, and extractParts()'s naive string-literal grab picks up the bare \"popper\" comparison literal alongside the real class string that follows it.",
  },
  "select:select-item": {
    extra: ["not-data-[variant=destructive]:focus:**:text-accent-foreground"],
    reason:
      "ours-only: our select item supports a destructive variant (grep confirms data-[variant=destructive] usage) with no upstream equivalent — new-york-v4's SelectItem has no variant prop at all, only the plain focus:bg-accent focus:text-accent-foreground pairing.",
  },
  "menubar:menubar-item": {
    extra: ["not-data-[variant=destructive]:focus:**:text-accent-foreground"],
    reason: "same as select:select-item above: our menubar item supports a destructive variant with no upstream equivalent.",
  },
  "menubar:menubar-checkbox-item": {
    extra: ["focus:**:text-accent-foreground", "data-inset:pl-8"],
    reason:
      "both ours-only: focus:**:text-accent-foreground is our nested-icon-color convention (upstream's icons have no separate focus color rule); data-inset:pl-8 supports an inset variant new-york-v4's MenubarCheckboxItem doesn't accept at all (verified: no inset prop, no data-inset/data-[inset] selector anywhere in its source — only MenubarItem and MenubarSubTrigger support inset upstream).",
  },
  "menubar:menubar-radio-item": {
    extra: ["focus:**:text-accent-foreground", "data-inset:pl-8"],
    reason: "same as menubar:menubar-checkbox-item above — MenubarRadioItem has no inset support upstream either.",
  },
  "menubar:menubar-shortcut": {
    extra: ["group-focus/menubar-item:text-accent-foreground"],
    reason:
      "ours-only: a group-based highlight so the shortcut text picks up the parent item's focus color — upstream's MenubarShortcut is a plain span with a fixed text-muted-foreground, no group-focus rule.",
  },
  "menubar:menubar-sub-trigger": {
    extra: ["gap-2", "[&_svg:not([class*='size-'])]:size-4"],
    reason:
      "ours-only: our sub-trigger renders a trailing chevron icon needing gap/sizing rules — new-york-v4's MenubarSubTrigger className has no gap or svg-sizing rule at all (its ChevronRightIcon has no explicit classes in the raw source).",
  },
  "alert-dialog:alert-dialog-content": {
    missing: ["group/alert-dialog-content"],
    extra: ["outline-none"],
    reason:
      "group/alert-dialog-content is a tool limitation (same class as toggle-group:toggle-group above): classes.ts genuinely carries it verbatim (packages/shadcn/ui/alert-dialog/classes.ts content slot), matching upstream's own group/alert-dialog-content exactly. outline-none is a pre-existing structural addition (in classes.ts before this port) with no upstream equivalent — new-york-v4's AlertDialogContent className has no outline rule at all.",
  },
  "alert-dialog:alert-dialog-description": {
    extra: [
      "*:[a]:hover:text-foreground",
      "text-balance",
      "md:text-pretty",
      "*:[a]:underline",
      "*:[a]:underline-offset-3",
    ],
    reason:
      "ours-only: link styling and text-wrapping refinements inside the description with no upstream equivalent — new-york-v4's AlertDialogDescription is a plain text-sm text-muted-foreground, no anchor-tag styling and no text-balance/text-pretty at all.",
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
      // batch A: a component whose function renders 2+ elements each with their own data-slot (e.g.
      // a Portal wrapper) hits this path for the wrapper's slot, since extractParts() attributes the
      // whole function's classes to only the FIRST data-slot it finds (see the table:table-container
      // and hover-card:hover-card-portal DIVERGENCES entries for real examples) — a real, reachable
      // mu-* class never exists for a slot with no rendered classes of its own. A DIVERGENCES entry
      // with no missing/extra (reason only) marks that slot as intentionally-unmatched instead of a
      // permanent, unfixable FAIL.
      const wholePartDivergence = DIVERGENCES[`${component}:${part.slot}`]
      if (wholePartDivergence && !wholePartDivergence.missing && !wholePartDivergence.extra) {
        results.push({ part: part.slot, muClass, ok: true, missing: [], extra: [], allowlistedMissing: [`(no rendered classes for this slot — ${wholePartDivergence.reason})`], allowlistedExtra: [] })
        continue
      }
      results.push({ part: part.slot, muClass, ok: false, missing: ["(no classes.ts entry and no style-new-york.css rule found for this mu-* class)"], extra: [], allowlistedMissing: [], allowlistedExtra: [] })
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
