// Plain-TS port of shadcn/ui's create-page fonts.ts.
//
// The original ties each font option to next/font (createFontOption pulls
// `import`/`previewVariable`/`variable` for a next/font loader). This is a
// Vite app with no next/font, so font "loading" here is just a CSS
// font-family string plus a Google Fonts stylesheet URL — no font loader
// object, no next/font import. FONTS is otherwise verbatim: same names,
// same order, same values, sourced from the same FONT_DEFINITIONS data
// (ported inline below since apps/v4/lib/font-definitions.ts lives outside
// the create/ lib scope for this port).

export type FontDefinition = {
  name: string
  title: string
  type: "sans" | "mono" | "serif"
  family: string
  registryVariable: "--font-sans" | "--font-mono" | "--font-serif"
  /** Google Fonts family name, used to build the stylesheet URL. */
  googleFontFamily: string
  subsets: readonly string[]
  weight?: readonly string[]
}

export const FONT_DEFINITIONS: readonly FontDefinition[] = [
  {
    name: "geist",
    title: "Geist",
    type: "sans",
    family: "'Geist Variable', sans-serif",
    registryVariable: "--font-sans",
    googleFontFamily: "Geist",
    subsets: ["latin"],
  },
  {
    name: "inter",
    title: "Inter",
    type: "sans",
    family: "'Inter Variable', sans-serif",
    registryVariable: "--font-sans",
    googleFontFamily: "Inter",
    subsets: ["latin"],
  },
  {
    name: "noto-sans",
    title: "Noto Sans",
    type: "sans",
    family: "'Noto Sans Variable', sans-serif",
    registryVariable: "--font-sans",
    googleFontFamily: "Noto Sans",
    subsets: ["latin"],
  },
  {
    name: "nunito-sans",
    title: "Nunito Sans",
    type: "sans",
    family: "'Nunito Sans Variable', sans-serif",
    registryVariable: "--font-sans",
    googleFontFamily: "Nunito Sans",
    subsets: ["latin"],
  },
  {
    name: "figtree",
    title: "Figtree",
    type: "sans",
    family: "'Figtree Variable', sans-serif",
    registryVariable: "--font-sans",
    googleFontFamily: "Figtree",
    subsets: ["latin"],
  },
  {
    name: "roboto",
    title: "Roboto",
    type: "sans",
    family: "'Roboto Variable', sans-serif",
    registryVariable: "--font-sans",
    googleFontFamily: "Roboto",
    subsets: ["latin"],
  },
  {
    name: "raleway",
    title: "Raleway",
    type: "sans",
    family: "'Raleway Variable', sans-serif",
    registryVariable: "--font-sans",
    googleFontFamily: "Raleway",
    subsets: ["latin"],
  },
  {
    name: "dm-sans",
    title: "DM Sans",
    type: "sans",
    family: "'DM Sans Variable', sans-serif",
    registryVariable: "--font-sans",
    googleFontFamily: "DM Sans",
    subsets: ["latin"],
  },
  {
    name: "public-sans",
    title: "Public Sans",
    type: "sans",
    family: "'Public Sans Variable', sans-serif",
    registryVariable: "--font-sans",
    googleFontFamily: "Public Sans",
    subsets: ["latin"],
  },
  {
    name: "outfit",
    title: "Outfit",
    type: "sans",
    family: "'Outfit Variable', sans-serif",
    registryVariable: "--font-sans",
    googleFontFamily: "Outfit",
    subsets: ["latin"],
  },
  {
    name: "oxanium",
    title: "Oxanium",
    type: "sans",
    family: "'Oxanium Variable', sans-serif",
    registryVariable: "--font-sans",
    googleFontFamily: "Oxanium",
    subsets: ["latin"],
  },
  {
    name: "manrope",
    title: "Manrope",
    type: "sans",
    family: "'Manrope Variable', sans-serif",
    registryVariable: "--font-sans",
    googleFontFamily: "Manrope",
    subsets: ["latin"],
  },
  {
    name: "space-grotesk",
    title: "Space Grotesk",
    type: "sans",
    family: "'Space Grotesk Variable', sans-serif",
    registryVariable: "--font-sans",
    googleFontFamily: "Space Grotesk",
    subsets: ["latin"],
  },
  {
    name: "montserrat",
    title: "Montserrat",
    type: "sans",
    family: "'Montserrat Variable', sans-serif",
    registryVariable: "--font-sans",
    googleFontFamily: "Montserrat",
    subsets: ["latin"],
  },
  {
    name: "ibm-plex-sans",
    title: "IBM Plex Sans",
    type: "sans",
    family: "'IBM Plex Sans Variable', sans-serif",
    registryVariable: "--font-sans",
    googleFontFamily: "IBM Plex Sans",
    subsets: ["latin"],
  },
  {
    name: "source-sans-3",
    title: "Source Sans 3",
    type: "sans",
    family: "'Source Sans 3 Variable', sans-serif",
    registryVariable: "--font-sans",
    googleFontFamily: "Source Sans 3",
    subsets: ["latin"],
  },
  {
    name: "instrument-sans",
    title: "Instrument Sans",
    type: "sans",
    family: "'Instrument Sans Variable', sans-serif",
    registryVariable: "--font-sans",
    googleFontFamily: "Instrument Sans",
    subsets: ["latin"],
  },
  {
    name: "jetbrains-mono",
    title: "JetBrains Mono",
    type: "mono",
    family: "'JetBrains Mono Variable', monospace",
    registryVariable: "--font-mono",
    googleFontFamily: "JetBrains Mono",
    subsets: ["latin"],
  },
  {
    name: "geist-mono",
    title: "Geist Mono",
    type: "mono",
    family: "'Geist Mono Variable', monospace",
    registryVariable: "--font-mono",
    googleFontFamily: "Geist Mono",
    subsets: ["latin"],
  },
  {
    name: "noto-serif",
    title: "Noto Serif",
    type: "serif",
    family: "'Noto Serif Variable', serif",
    registryVariable: "--font-serif",
    googleFontFamily: "Noto Serif",
    subsets: ["latin"],
  },
  {
    name: "roboto-slab",
    title: "Roboto Slab",
    type: "serif",
    family: "'Roboto Slab Variable', serif",
    registryVariable: "--font-serif",
    googleFontFamily: "Roboto Slab",
    subsets: ["latin"],
  },
  {
    name: "merriweather",
    title: "Merriweather",
    type: "serif",
    family: "'Merriweather Variable', serif",
    registryVariable: "--font-serif",
    googleFontFamily: "Merriweather",
    subsets: ["latin"],
  },
  {
    name: "lora",
    title: "Lora",
    type: "serif",
    family: "'Lora Variable', serif",
    registryVariable: "--font-serif",
    googleFontFamily: "Lora",
    subsets: ["latin"],
  },
  {
    name: "playfair-display",
    title: "Playfair Display",
    type: "serif",
    family: "'Playfair Display Variable', serif",
    registryVariable: "--font-serif",
    googleFontFamily: "Playfair Display",
    subsets: ["latin"],
  },
  {
    name: "eb-garamond",
    title: "EB Garamond",
    type: "serif",
    family: "'EB Garamond Variable', serif",
    registryVariable: "--font-serif",
    googleFontFamily: "EB Garamond",
    subsets: ["latin"],
  },
  {
    name: "instrument-serif",
    title: "Instrument Serif",
    type: "serif",
    family: "'Instrument Serif', serif",
    registryVariable: "--font-serif",
    googleFontFamily: "Instrument Serif",
    subsets: ["latin"],
    weight: ["400"],
  },
] as const

export type FontName = (typeof FONT_DEFINITIONS)[number]["name"]

type CreateFont = {
  family: string
  /** Google Fonts stylesheet URL (swap-in replacement for next/font's `import`). */
  googleFontsUrl: string
  style: {
    fontFamily: string
  }
  variable: string
}

function createFontOption(name: FontName) {
  const definition = FONT_DEFINITIONS.find((font) => font.name === name)

  if (!definition) {
    throw new Error(`Unknown font definition: ${name}`)
  }

  const weights = definition.weight ?? ["400..900"]
  const familyParam = definition.googleFontFamily.replace(/ /g, "+")
  const axisPart =
    definition.type === "serif" && definition.weight
      ? `:wght@${weights.join(";")}`
      : `:wght@${weights.join(";")}`

  return {
    name: definition.title,
    value: definition.name,
    font: {
      family: definition.family,
      googleFontsUrl: `https://fonts.googleapis.com/css2?family=${familyParam}${axisPart}&display=swap`,
      style: {
        fontFamily: definition.family,
      },
      variable: definition.registryVariable,
    } satisfies CreateFont,
    type: definition.type,
  } as const
}

export const FONTS = [
  createFontOption("geist"),
  createFontOption("inter"),
  createFontOption("noto-sans"),
  createFontOption("nunito-sans"),
  createFontOption("figtree"),
  createFontOption("roboto"),
  createFontOption("raleway"),
  createFontOption("dm-sans"),
  createFontOption("public-sans"),
  createFontOption("outfit"),
  createFontOption("oxanium"),
  createFontOption("manrope"),
  createFontOption("space-grotesk"),
  createFontOption("montserrat"),
  createFontOption("ibm-plex-sans"),
  createFontOption("source-sans-3"),
  createFontOption("instrument-sans"),
  createFontOption("geist-mono"),
  createFontOption("jetbrains-mono"),
  createFontOption("noto-serif"),
  createFontOption("roboto-slab"),
  createFontOption("merriweather"),
  createFontOption("lora"),
  createFontOption("playfair-display"),
  createFontOption("eb-garamond"),
  createFontOption("instrument-serif"),
] as const

export type Font = (typeof FONTS)[number]

export const FONT_HEADING_OPTIONS = [
  {
    name: "Inherit",
    value: "inherit",
    font: null,
    type: "default",
  },
  ...FONTS,
] as const

export type FontHeadingOption = (typeof FONT_HEADING_OPTIONS)[number]
