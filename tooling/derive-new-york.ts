/**
 * Pilot tool for the new-york style port (see scratch/team-lead/briefs/style-new-york-pilot.md).
 *
 * For a given component, extracts per-part class strings from:
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
 * Usage: bun tooling/derive-new-york.ts <component>
 */
import { readFileSync, existsSync } from "node:fs"
import { join } from "node:path"

const SHADCN_UI_DIR =
  process.env.SHADCN_UI_DIR ?? join(import.meta.dirname, "..", "..", "..", "data", "shadcn-ui")

const NEW_YORK_DIR = join(SHADCN_UI_DIR, "apps/v4/registry/new-york-v4/ui")
const BASE_DIR = join(SHADCN_UI_DIR, "apps/v4/registry/bases/base/ui")

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

function main() {
  const component = process.argv[2]
  if (!component) {
    console.error("Usage: bun tooling/derive-new-york.ts <component>")
    process.exit(1)
  }

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

main()
