// Ported from shadcn/ui app/(app)/(typeset)/lib/fonts.ts.
//
// Verbatim: EXCLUDED_FONTS, the FONTS derivation ({id,label,type,value} off
// FONT_DEFINITIONS' name/title/type), findFont, findFontDefinition.
//
// One deviation, in `value` only: upstream is
// `var(${definition.previewVariable}), ${definition.family}` because
// next/font defines every preview variable at build time. This app has no
// next/font — the preview iframe loads the face via a Google Fonts <link>
// and there is no --font-<x> variable to reference — so `value` is the
// family string alone, which is exactly what the upstream var() falls back
// to. Same rendered font-family, one less indirection.
import {
  FONT_DEFINITIONS,
  type FontDefinition,
} from "./font-definitions"

// Display-only faces that read poorly as body text stay out of typeset.
const EXCLUDED_FONTS = ["instrument-serif", "eb-garamond", "playfair-display"]

export type TypesetFont = {
  id: string
  label: string
  type: FontDefinition["type"]
  value: string
}

export const FONTS: readonly TypesetFont[] = FONT_DEFINITIONS.filter(
  (definition) => !EXCLUDED_FONTS.includes(definition.name)
).map((definition) => ({
  id: definition.name,
  label: definition.title,
  type: definition.type,
  value: definition.family,
}))

export function findFont(id: string | null | undefined) {
  return FONTS.find((font) => font.id === id)
}

// The full definition, for generating framework-specific loading code.
export function findFontDefinition(id: string | null | undefined) {
  return FONT_DEFINITIONS.find((definition) => definition.name === id)
}
