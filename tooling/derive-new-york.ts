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
