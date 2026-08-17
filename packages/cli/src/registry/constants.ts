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

