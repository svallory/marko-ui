import { registryConfigSchema } from "@/src/schema"
import { z } from "zod"

export const REGISTRY_URL =
  process.env.REGISTRY_URL ?? "https://marko-ui.saulo.tech/r"

export const MARKO_UI_URL = REGISTRY_URL.replace(/\/r\/?$/, "")

// Kept as an alias while forked shadcn code is migrated.
export const SHADCN_URL = MARKO_UI_URL

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

// Built-in registries that are always available and cannot be overridden
export const BUILTIN_REGISTRIES: z.infer<typeof registryConfigSchema> = {
  "@marko-ui": `${REGISTRY_URL}/{name}.json`,
}

// The 8 shadcn-derived visual styles (shape/spacing/radius/borders — see
// notes/plans/dual-distribution-plan.md §1). Each ships as
// `styles-src/style-<name>.css` for the copy path (baked into generated
// component classes) and as a precompiled `@marko-ui/core/styles/style-
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

