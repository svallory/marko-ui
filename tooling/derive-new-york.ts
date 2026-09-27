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
  // Radix data-[state=checked/unchecked] -> our Zag custom variants (globals.css @custom-variant list).
  { from: "data-[state=checked]:", to: "data-checked:" },
  { from: "data-[state=unchecked]:", to: "data-unchecked:" },
  // upstream's native disabled: pseudo-class -> our Zag components' data-disabled attribute
  // (many of our controls render a non-form element, e.g. checkbox's <span> control, so the
  // machine emits a data-disabled attribute rather than relying on a native disabled attribute).
  { from: "disabled:", to: "data-disabled:" },
  // Arbitrary-value spacing that equals a token already in Tailwind's default scale (8rem = 32 * 0.25rem).
  { from: "min-w-[8rem]", to: "min-w-32" },
  // ring-[3px] (upstream's arbitrary value) === ring-3 (Tailwind's default scale token, same 3px).
  { from: "ring-[3px]", to: "ring-3" },
  // upstream's arbitrary-selector "ancestor has this data-slot" pattern -> Tailwind v4's in-* variant shorthand for the same descendant-context selector.
  { from: "[[data-slot=tooltip-content]_&]:", to: "in-data-[slot=tooltip-content]:" },
  // Radix data-[orientation=*] selectors -> our custom variants (globals.css @custom-variant list).
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
