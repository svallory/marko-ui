import type { registryConfigSchema } from "@/src/schema"
import type { z } from "zod"

export const REGISTRY_URL =
  process.env.REGISTRY_URL ?? "https://marko-ui.saulo.tech/r"

export const MARKO_UI_URL = REGISTRY_URL.replace(/\/r\/?$/, "")

export const FALLBACK_STYLE = "default"

export const BASE_COLORS = [
  {
    name: "neutral",
    label: "Neutral",
  },
  {
    name: "zinc",
    label: "Zinc",
  },
  {
    name: "slate",
    label: "Slate",
  },
  {
    name: "stone",
    label: "Stone",
  },
  {
    name: "gray",
    label: "Gray",
  },
] as const

// Built-in registries that are always available and cannot be overridden.
//
// Deliberately kept flat (no {style} placeholder) even though the registry
// now also publishes styled items at `/styles/{style}/{name}.json`
// (build-registry.ts). The generic builder.ts `{style}` mechanism fills the
// placeholder from `config.style` — a vestigial shadcn field, always
// "default", unrelated to marko-ui's 8-style `config.visualStyle` axis (see
// registry/schema.ts). builder.ts now throws (assertNoLeftoverPlaceholders)
// on an unresolved `{style}`, so templating it here would break every
// generic bare-name lookup (resolveRegistryDependencies,
// resolveRegistryItemsFromRegistries) since `config.style` is never one of
// our 8 style-dir names. The styled path is instead built explicitly from
// `config.visualStyle` in registry/resolver.ts's fetchBareRegistryItem,
// which is the only place that has the right value and the correct
// 404-fallback-to-flat semantics.
export const BUILTIN_REGISTRIES: z.infer<typeof registryConfigSchema> = {
  "@marko-ui": `${REGISTRY_URL}/{name}.json`,
}

// The 8 shadcn-derived visual styles (shape/spacing/radius/borders — see
// notes/plans/dual-distribution-plan.md §1). Each ships as
// `styles-src/style-<name>.css` for the copy path (baked into generated
// component classes) and as a precompiled `@marko-ui/shadcn/styles/style-
// <name>.css` layer for the import path. Fixed set, hardcoded like
// BASE_COLORS.
export const VISUAL_STYLES = [
  { name: "rhea", label: "Rhea" },
  { name: "nova", label: "Nova" },
  { name: "vega", label: "Vega" },
  { name: "lyra", label: "Lyra" },
  { name: "maia", label: "Maia" },
  { name: "mira", label: "Mira" },
  { name: "luma", label: "Luma" },
  { name: "sera", label: "Sera" },
] as const

export const DEFAULT_VISUAL_STYLE = "vega"
