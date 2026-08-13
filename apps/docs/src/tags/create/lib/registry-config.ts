/**
 * Faithful plain-TypeScript port of shadcn/ui's registry design-system config
 * (apps/v4/registry/config.ts plus its registry/* data modules), for the
 * marko-ui docs `/create` subsystem.
 *
 * Ported verbatim from (read-only reference, do not edit):
 *   data/shadcn-ui/apps/v4/registry/config.ts
 *   data/shadcn-ui/apps/v4/registry/base-colors.ts
 *   data/shadcn-ui/apps/v4/registry/bases.ts
 *   data/shadcn-ui/apps/v4/registry/fonts.ts
 *   data/shadcn-ui/apps/v4/registry/styles.tsx
 *   data/shadcn-ui/apps/v4/registry/themes.ts
 *   data/shadcn-ui/apps/v4/lib/font-definitions.ts
 *   data/shadcn-ui/packages/shadcn/src/icons/libraries.ts
 *
 * Differences from the original, and why:
 *   - No React/Next.js. `STYLES[].icon` in the original is a JSX element;
 *     here it is the raw inline SVG markup string instead (same source
 *     paths/attrs, just not wrapped in `<svg>...</svg>` as a JSX node).
 *   - No zod. The original validates/normalizes config with a zod schema
 *     (`designSystemConfigSchema`) whose `.transform()` defaults optional
 *     fields and whose `.refine()` checks cross-field validity (theme /
 *     chartColor must be available for the chosen baseColor). This file
 *     exposes an equivalent hand-written `validateDesignSystemConfig()`
 *     function (see below) that performs the same defaulting + refinement
 *     without a schema library dependency. `designSystemConfigSchema` is
 *     still exported as a name for API parity, but here it is a plain
 *     object exposing a zod-schema-shaped `.parse()` / `.safeParse()` pair
 *     backed by that hand-written validator, not an actual zod schema.
 *   - `registryItemSchema.parse(...)` in `buildThemeForPreset` (used to
 *     validate/strip the shape against shadcn's RegistryItem zod schema)
 *     is replaced with a plain identity pass-through, since we don't have
 *     the `shadcn/schema` package here. The returned shape is unchanged.
 *   - `shadcn/icons`'s `iconLibraries` is ported verbatim (name/title/
 *     packages/import/usage/export metadata only — no actual icon sets).
 *
 * Everything else (all data arrays/objects: THEMES, BASE_COLORS via THEMES
 * filter, BASES, STYLES, fonts, RADII, MENU_ACCENTS, MENU_COLORS, PRESETS,
 * and all functions: getThemesForBaseColor, getBase, getStyle, getTheme,
 * getBaseColor, getIconLibrary, getBodyFont, getHeadingFont,
 * getInheritedHeadingFontValue, parseRegistryBaseParts, buildRegistryTheme,
 * buildThemeForPreset, buildRegistryBase, buildPartialRegistryBase) is
 * copied verbatim / ported 1:1 in logic. THEMES contains the FULL verbatim
 * per-theme CSS variable data for all 23 themes — nothing stubbed.
 */

// ---------------------------------------------------------------------------
// Minimal local stand-ins for the `shadcn/schema` RegistryItem type and the
// `shadcn/icons` IconLibrary types (we don't depend on those packages here).
// Only the fields actually read/written by this module are modeled.
// ---------------------------------------------------------------------------

export interface RegistryItemCssVars {
  theme?: Record<string, string>;
  light?: Record<string, string>;
  dark?: Record<string, string>;
}

export interface RegistryItem {
  $schema?: string;
  name: string;
  extends?: string;
  type: string;
  title?: string;
  description?: string;
  dependencies?: string[];
  registryDependencies?: string[];
  meta?: Record<string, unknown>;
  config?: Record<string, unknown>;
  cssVars?: RegistryItemCssVars;
  css?: Record<string, unknown>;
  font?: Record<string, unknown>;
  docs?: string;
  [key: string]: unknown;
}

// ---------------------------------------------------------------------------
// registry/fonts.ts + lib/font-definitions.ts
// ---------------------------------------------------------------------------

export type FontDefinition = {
  name: string;
  title: string;
  type: "sans" | "mono" | "serif";
  family: string;
  registryVariable: "--font-sans" | "--font-mono" | "--font-serif";
  previewVariable: string;
  provider: "google";
  import: string;
  dependency: string;
  subsets: readonly string[];
  weight?: readonly string[];
};

export const FONT_DEFINITIONS = [
  {
    name: "geist",
    title: "Geist",
    type: "sans",
    family: "'Geist Variable', sans-serif",
    registryVariable: "--font-sans",
    previewVariable: "--font-geist-sans",
    provider: "google",
    import: "Geist",
    dependency: "@fontsource-variable/geist",
    subsets: ["latin"],
  },
  {
    name: "inter",
    title: "Inter",
    type: "sans",
    family: "'Inter Variable', sans-serif",
    registryVariable: "--font-sans",
    previewVariable: "--font-inter",
    provider: "google",
    import: "Inter",
    dependency: "@fontsource-variable/inter",
    subsets: ["latin"],
  },
  {
    name: "noto-sans",
    title: "Noto Sans",
    type: "sans",
    family: "'Noto Sans Variable', sans-serif",
    registryVariable: "--font-sans",
    previewVariable: "--font-noto-sans",
    provider: "google",
    import: "Noto_Sans",
    dependency: "@fontsource-variable/noto-sans",
    subsets: ["latin"],
  },
  {
    name: "nunito-sans",
    title: "Nunito Sans",
    type: "sans",
    family: "'Nunito Sans Variable', sans-serif",
    registryVariable: "--font-sans",
    previewVariable: "--font-nunito-sans",
    provider: "google",
    import: "Nunito_Sans",
    dependency: "@fontsource-variable/nunito-sans",
    subsets: ["latin"],
  },
  {
    name: "figtree",
    title: "Figtree",
    type: "sans",
    family: "'Figtree Variable', sans-serif",
    registryVariable: "--font-sans",
    previewVariable: "--font-figtree",
    provider: "google",
    import: "Figtree",
    dependency: "@fontsource-variable/figtree",
    subsets: ["latin"],
  },
  {
    name: "roboto",
    title: "Roboto",
    type: "sans",
    family: "'Roboto Variable', sans-serif",
    registryVariable: "--font-sans",
    previewVariable: "--font-roboto",
    provider: "google",
    import: "Roboto",
    dependency: "@fontsource-variable/roboto",
    subsets: ["latin"],
  },
  {
    name: "raleway",
    title: "Raleway",
    type: "sans",
    family: "'Raleway Variable', sans-serif",
    registryVariable: "--font-sans",
    previewVariable: "--font-raleway",
    provider: "google",
    import: "Raleway",
    dependency: "@fontsource-variable/raleway",
    subsets: ["latin"],
  },
  {
    name: "dm-sans",
    title: "DM Sans",
    type: "sans",
    family: "'DM Sans Variable', sans-serif",
    registryVariable: "--font-sans",
    previewVariable: "--font-dm-sans",
    provider: "google",
    import: "DM_Sans",
    dependency: "@fontsource-variable/dm-sans",
    subsets: ["latin"],
  },
  {
    name: "public-sans",
    title: "Public Sans",
    type: "sans",
    family: "'Public Sans Variable', sans-serif",
    registryVariable: "--font-sans",
    previewVariable: "--font-public-sans",
    provider: "google",
    import: "Public_Sans",
    dependency: "@fontsource-variable/public-sans",
    subsets: ["latin"],
  },
  {
    name: "outfit",
    title: "Outfit",
    type: "sans",
    family: "'Outfit Variable', sans-serif",
    registryVariable: "--font-sans",
    previewVariable: "--font-outfit",
    provider: "google",
    import: "Outfit",
    dependency: "@fontsource-variable/outfit",
    subsets: ["latin"],
  },
  {
    name: "oxanium",
    title: "Oxanium",
    type: "sans",
    family: "'Oxanium Variable', sans-serif",
    registryVariable: "--font-sans",
    previewVariable: "--font-oxanium",
    provider: "google",
    import: "Oxanium",
    dependency: "@fontsource-variable/oxanium",
    subsets: ["latin"],
  },
  {
    name: "manrope",
    title: "Manrope",
    type: "sans",
    family: "'Manrope Variable', sans-serif",
    registryVariable: "--font-sans",
    previewVariable: "--font-manrope",
    provider: "google",
    import: "Manrope",
    dependency: "@fontsource-variable/manrope",
    subsets: ["latin"],
  },
  {
    name: "space-grotesk",
    title: "Space Grotesk",
    type: "sans",
    family: "'Space Grotesk Variable', sans-serif",
    registryVariable: "--font-sans",
    previewVariable: "--font-space-grotesk",
    provider: "google",
    import: "Space_Grotesk",
    dependency: "@fontsource-variable/space-grotesk",
    subsets: ["latin"],
  },
  {
    name: "montserrat",
    title: "Montserrat",
    type: "sans",
    family: "'Montserrat Variable', sans-serif",
    registryVariable: "--font-sans",
    previewVariable: "--font-montserrat",
    provider: "google",
    import: "Montserrat",
    dependency: "@fontsource-variable/montserrat",
    subsets: ["latin"],
  },
  {
    name: "ibm-plex-sans",
    title: "IBM Plex Sans",
    type: "sans",
    family: "'IBM Plex Sans Variable', sans-serif",
    registryVariable: "--font-sans",
    previewVariable: "--font-ibm-plex-sans",
    provider: "google",
    import: "IBM_Plex_Sans",
    dependency: "@fontsource-variable/ibm-plex-sans",
    subsets: ["latin"],
  },
  {
    name: "source-sans-3",
    title: "Source Sans 3",
    type: "sans",
    family: "'Source Sans 3 Variable', sans-serif",
    registryVariable: "--font-sans",
    previewVariable: "--font-source-sans-3",
    provider: "google",
    import: "Source_Sans_3",
    dependency: "@fontsource-variable/source-sans-3",
    subsets: ["latin"],
  },
  {
    name: "instrument-sans",
    title: "Instrument Sans",
    type: "sans",
    family: "'Instrument Sans Variable', sans-serif",
    registryVariable: "--font-sans",
    previewVariable: "--font-instrument-sans",
    provider: "google",
    import: "Instrument_Sans",
    dependency: "@fontsource-variable/instrument-sans",
    subsets: ["latin"],
  },
  {
    name: "jetbrains-mono",
    title: "JetBrains Mono",
    type: "mono",
    family: "'JetBrains Mono Variable', monospace",
    registryVariable: "--font-mono",
    previewVariable: "--font-jetbrains-mono",
    provider: "google",
    import: "JetBrains_Mono",
    dependency: "@fontsource-variable/jetbrains-mono",
    subsets: ["latin"],
  },
  {
    name: "geist-mono",
    title: "Geist Mono",
    type: "mono",
    family: "'Geist Mono Variable', monospace",
    registryVariable: "--font-mono",
    previewVariable: "--font-geist-mono",
    provider: "google",
    import: "Geist_Mono",
    dependency: "@fontsource-variable/geist-mono",
    subsets: ["latin"],
  },
  {
    name: "noto-serif",
    title: "Noto Serif",
    type: "serif",
    family: "'Noto Serif Variable', serif",
    registryVariable: "--font-serif",
    previewVariable: "--font-noto-serif",
    provider: "google",
    import: "Noto_Serif",
    dependency: "@fontsource-variable/noto-serif",
    subsets: ["latin"],
  },
  {
    name: "roboto-slab",
    title: "Roboto Slab",
    type: "serif",
    family: "'Roboto Slab Variable', serif",
    registryVariable: "--font-serif",
    previewVariable: "--font-roboto-slab",
    provider: "google",
    import: "Roboto_Slab",
    dependency: "@fontsource-variable/roboto-slab",
    subsets: ["latin"],
  },
  {
    name: "merriweather",
    title: "Merriweather",
    type: "serif",
    family: "'Merriweather Variable', serif",
    registryVariable: "--font-serif",
    previewVariable: "--font-merriweather",
    provider: "google",
    import: "Merriweather",
    dependency: "@fontsource-variable/merriweather",
    subsets: ["latin"],
  },
  {
    name: "lora",
    title: "Lora",
    type: "serif",
    family: "'Lora Variable', serif",
    registryVariable: "--font-serif",
    previewVariable: "--font-lora",
    provider: "google",
    import: "Lora",
    dependency: "@fontsource-variable/lora",
    subsets: ["latin"],
  },
  {
    name: "playfair-display",
    title: "Playfair Display",
    type: "serif",
    family: "'Playfair Display Variable', serif",
    registryVariable: "--font-serif",
    previewVariable: "--font-playfair-display",
    provider: "google",
    import: "Playfair_Display",
    dependency: "@fontsource-variable/playfair-display",
    subsets: ["latin"],
  },
  {
    name: "eb-garamond",
    title: "EB Garamond",
    type: "serif",
    family: "'EB Garamond Variable', serif",
    registryVariable: "--font-serif",
    previewVariable: "--font-eb-garamond",
    provider: "google",
    import: "EB_Garamond",
    dependency: "@fontsource-variable/eb-garamond",
    subsets: ["latin"],
  },
  {
    name: "instrument-serif",
    title: "Instrument Serif",
    type: "serif",
    family: "'Instrument Serif', serif",
    registryVariable: "--font-serif",
    previewVariable: "--font-instrument-serif",
    provider: "google",
    import: "Instrument_Serif",
    dependency: "@fontsource/instrument-serif",
    subsets: ["latin"],
    weight: ["400"],
  },
] as const satisfies readonly FontDefinition[];

export type FontName = (typeof FONT_DEFINITIONS)[number]["name"];

function createFontItem(
  definition: FontDefinition,
  role: "body" | "heading",
): RegistryItem {
  return {
    name:
      role === "body"
        ? `font-${definition.name}`
        : `font-heading-${definition.name}`,
    title:
      role === "body" ? definition.title : `${definition.title} (Heading)`,
    type: "registry:font",
    font: {
      family: definition.family,
      provider: definition.provider,
      variable: role === "body" ? definition.registryVariable : "--font-heading",
      ...(definition.weight ? { weight: [...definition.weight] } : {}),
      subsets: [...definition.subsets],
      import: definition.import,
      dependency: definition.dependency,
    },
  };
}

export const bodyFonts: RegistryItem[] = FONT_DEFINITIONS.map((definition) =>
  createFontItem(definition, "body"),
);

export const headingFonts: RegistryItem[] = FONT_DEFINITIONS.map(
  (definition) => createFontItem(definition, "heading"),
);

export const fonts: RegistryItem[] = [...bodyFonts, ...headingFonts];

// ---------------------------------------------------------------------------
// registry/themes.ts (copied verbatim)
// ---------------------------------------------------------------------------

export const THEMES = [
  {
    name: "neutral",
    title: "Neutral",
    type: "registry:theme",
    cssVars: {
      light: {
        background: "oklch(1 0 0)",
        foreground: "oklch(0.145 0 0)",
        card: "oklch(1 0 0)",
        "card-foreground": "oklch(0.145 0 0)",
        popover: "oklch(1 0 0)",
        "popover-foreground": "oklch(0.145 0 0)",
        primary: "oklch(0.205 0 0)",
        "primary-foreground": "oklch(0.985 0 0)",
        secondary: "oklch(0.97 0 0)",
        "secondary-foreground": "oklch(0.205 0 0)",
        muted: "oklch(0.97 0 0)",
        "muted-foreground": "oklch(0.556 0 0)",
        accent: "oklch(0.97 0 0)",
        "accent-foreground": "oklch(0.205 0 0)",
        destructive: "oklch(0.577 0.245 27.325)",
        border: "oklch(0.922 0 0)",
        input: "oklch(0.922 0 0)",
        ring: "oklch(0.708 0 0)",
        "chart-1": "oklch(0.87 0 0)",
        "chart-2": "oklch(0.556 0 0)",
        "chart-3": "oklch(0.439 0 0)",
        "chart-4": "oklch(0.371 0 0)",
        "chart-5": "oklch(0.269 0 0)",
        radius: "0.625rem",
        sidebar: "oklch(0.985 0 0)",
        "sidebar-foreground": "oklch(0.145 0 0)",
        "sidebar-primary": "oklch(0.205 0 0)",
        "sidebar-primary-foreground": "oklch(0.985 0 0)",
        "sidebar-accent": "oklch(0.97 0 0)",
        "sidebar-accent-foreground": "oklch(0.205 0 0)",
        "sidebar-border": "oklch(0.922 0 0)",
        "sidebar-ring": "oklch(0.708 0 0)",
      },
      dark: {
        background: "oklch(0.145 0 0)",
        foreground: "oklch(0.985 0 0)",
        card: "oklch(0.205 0 0)",
        "card-foreground": "oklch(0.985 0 0)",
        popover: "oklch(0.205 0 0)",
        "popover-foreground": "oklch(0.985 0 0)",
        primary: "oklch(0.922 0 0)",
        "primary-foreground": "oklch(0.205 0 0)",
        secondary: "oklch(0.269 0 0)",
        "secondary-foreground": "oklch(0.985 0 0)",
        muted: "oklch(0.269 0 0)",
        "muted-foreground": "oklch(0.708 0 0)",
        accent: "oklch(0.269 0 0)",
        "accent-foreground": "oklch(0.985 0 0)",
        destructive: "oklch(0.704 0.191 22.216)",
        border: "oklch(1 0 0 / 10%)",
        input: "oklch(1 0 0 / 15%)",
        ring: "oklch(0.556 0 0)",
        "chart-1": "oklch(0.87 0 0)",
        "chart-2": "oklch(0.556 0 0)",
        "chart-3": "oklch(0.439 0 0)",
        "chart-4": "oklch(0.371 0 0)",
        "chart-5": "oklch(0.269 0 0)",
        sidebar: "oklch(0.205 0 0)",
        "sidebar-foreground": "oklch(0.985 0 0)",
        "sidebar-primary": "oklch(0.488 0.243 264.376)",
        "sidebar-primary-foreground": "oklch(0.985 0 0)",
        "sidebar-accent": "oklch(0.269 0 0)",
        "sidebar-accent-foreground": "oklch(0.985 0 0)",
        "sidebar-border": "oklch(1 0 0 / 10%)",
        "sidebar-ring": "oklch(0.556 0 0)",
      },
    },
  },
  {
    name: "stone",
    title: "Stone",
    type: "registry:theme",
    cssVars: {
      light: {
        background: "oklch(1 0 0)",
        foreground: "oklch(0.147 0.004 49.25)",
        card: "oklch(1 0 0)",
        "card-foreground": "oklch(0.147 0.004 49.25)",
        popover: "oklch(1 0 0)",
        "popover-foreground": "oklch(0.147 0.004 49.25)",
        primary: "oklch(0.216 0.006 56.043)",
        "primary-foreground": "oklch(0.985 0.001 106.423)",
        secondary: "oklch(0.97 0.001 106.424)",
        "secondary-foreground": "oklch(0.216 0.006 56.043)",
        muted: "oklch(0.97 0.001 106.424)",
        "muted-foreground": "oklch(0.553 0.013 58.071)",
        accent: "oklch(0.97 0.001 106.424)",
        "accent-foreground": "oklch(0.216 0.006 56.043)",
        destructive: "oklch(0.577 0.245 27.325)",
        border: "oklch(0.923 0.003 48.717)",
        input: "oklch(0.923 0.003 48.717)",
        ring: "oklch(0.709 0.01 56.259)",
        "chart-1": "oklch(0.869 0.005 56.366)",
        "chart-2": "oklch(0.553 0.013 58.071)",
        "chart-3": "oklch(0.444 0.011 73.639)",
        "chart-4": "oklch(0.374 0.01 67.558)",
        "chart-5": "oklch(0.268 0.007 34.298)",
        radius: "0.625rem",
        sidebar: "oklch(0.985 0.001 106.423)",
        "sidebar-foreground": "oklch(0.147 0.004 49.25)",
        "sidebar-primary": "oklch(0.216 0.006 56.043)",
        "sidebar-primary-foreground": "oklch(0.985 0.001 106.423)",
        "sidebar-accent": "oklch(0.97 0.001 106.424)",
        "sidebar-accent-foreground": "oklch(0.216 0.006 56.043)",
        "sidebar-border": "oklch(0.923 0.003 48.717)",
        "sidebar-ring": "oklch(0.709 0.01 56.259)",
      },
      dark: {
        background: "oklch(0.147 0.004 49.25)",
        foreground: "oklch(0.985 0.001 106.423)",
        card: "oklch(0.216 0.006 56.043)",
        "card-foreground": "oklch(0.985 0.001 106.423)",
        popover: "oklch(0.216 0.006 56.043)",
        "popover-foreground": "oklch(0.985 0.001 106.423)",
        primary: "oklch(0.923 0.003 48.717)",
        "primary-foreground": "oklch(0.216 0.006 56.043)",
        secondary: "oklch(0.268 0.007 34.298)",
        "secondary-foreground": "oklch(0.985 0.001 106.423)",
        muted: "oklch(0.268 0.007 34.298)",
        "muted-foreground": "oklch(0.709 0.01 56.259)",
        accent: "oklch(0.268 0.007 34.298)",
        "accent-foreground": "oklch(0.985 0.001 106.423)",
        destructive: "oklch(0.704 0.191 22.216)",
        border: "oklch(1 0 0 / 10%)",
        input: "oklch(1 0 0 / 15%)",
        ring: "oklch(0.553 0.013 58.071)",
        "chart-1": "oklch(0.869 0.005 56.366)",
        "chart-2": "oklch(0.553 0.013 58.071)",
        "chart-3": "oklch(0.444 0.011 73.639)",
        "chart-4": "oklch(0.374 0.01 67.558)",
        "chart-5": "oklch(0.268 0.007 34.298)",
        sidebar: "oklch(0.216 0.006 56.043)",
        "sidebar-foreground": "oklch(0.985 0.001 106.423)",
        "sidebar-primary": "oklch(0.488 0.243 264.376)",
        "sidebar-primary-foreground": "oklch(0.985 0.001 106.423)",
        "sidebar-accent": "oklch(0.268 0.007 34.298)",
        "sidebar-accent-foreground": "oklch(0.985 0.001 106.423)",
        "sidebar-border": "oklch(1 0 0 / 10%)",
        "sidebar-ring": "oklch(0.553 0.013 58.071)",
      },
    },
  },
  {
    name: "zinc",
    title: "Zinc",
    type: "registry:theme",
    cssVars: {
      light: {
        background: "oklch(1 0 0)",
        foreground: "oklch(0.141 0.005 285.823)",
        card: "oklch(1 0 0)",
        "card-foreground": "oklch(0.141 0.005 285.823)",
        popover: "oklch(1 0 0)",
        "popover-foreground": "oklch(0.141 0.005 285.823)",
        primary: "oklch(0.21 0.006 285.885)",
        "primary-foreground": "oklch(0.985 0 0)",
        secondary: "oklch(0.967 0.001 286.375)",
        "secondary-foreground": "oklch(0.21 0.006 285.885)",
        muted: "oklch(0.967 0.001 286.375)",
        "muted-foreground": "oklch(0.552 0.016 285.938)",
        accent: "oklch(0.967 0.001 286.375)",
        "accent-foreground": "oklch(0.21 0.006 285.885)",
        destructive: "oklch(0.577 0.245 27.325)",
        border: "oklch(0.92 0.004 286.32)",
        input: "oklch(0.92 0.004 286.32)",
        ring: "oklch(0.705 0.015 286.067)",
        "chart-1": "oklch(0.871 0.006 286.286)",
        "chart-2": "oklch(0.552 0.016 285.938)",
        "chart-3": "oklch(0.442 0.017 285.786)",
        "chart-4": "oklch(0.37 0.013 285.805)",
        "chart-5": "oklch(0.274 0.006 286.033)",
        radius: "0.625rem",
        sidebar: "oklch(0.985 0 0)",
        "sidebar-foreground": "oklch(0.141 0.005 285.823)",
        "sidebar-primary": "oklch(0.21 0.006 285.885)",
        "sidebar-primary-foreground": "oklch(0.985 0 0)",
        "sidebar-accent": "oklch(0.967 0.001 286.375)",
        "sidebar-accent-foreground": "oklch(0.21 0.006 285.885)",
        "sidebar-border": "oklch(0.92 0.004 286.32)",
        "sidebar-ring": "oklch(0.705 0.015 286.067)",
      },
      dark: {
        background: "oklch(0.141 0.005 285.823)",
        foreground: "oklch(0.985 0 0)",
        card: "oklch(0.21 0.006 285.885)",
        "card-foreground": "oklch(0.985 0 0)",
        popover: "oklch(0.21 0.006 285.885)",
        "popover-foreground": "oklch(0.985 0 0)",
        primary: "oklch(0.92 0.004 286.32)",
        "primary-foreground": "oklch(0.21 0.006 285.885)",
        secondary: "oklch(0.274 0.006 286.033)",
        "secondary-foreground": "oklch(0.985 0 0)",
        muted: "oklch(0.274 0.006 286.033)",
        "muted-foreground": "oklch(0.705 0.015 286.067)",
        accent: "oklch(0.274 0.006 286.033)",
        "accent-foreground": "oklch(0.985 0 0)",
        destructive: "oklch(0.704 0.191 22.216)",
        border: "oklch(1 0 0 / 10%)",
        input: "oklch(1 0 0 / 15%)",
        ring: "oklch(0.552 0.016 285.938)",
        "chart-1": "oklch(0.871 0.006 286.286)",
        "chart-2": "oklch(0.552 0.016 285.938)",
        "chart-3": "oklch(0.442 0.017 285.786)",
        "chart-4": "oklch(0.37 0.013 285.805)",
        "chart-5": "oklch(0.274 0.006 286.033)",
        sidebar: "oklch(0.21 0.006 285.885)",
        "sidebar-foreground": "oklch(0.985 0 0)",
        "sidebar-primary": "oklch(0.488 0.243 264.376)",
        "sidebar-primary-foreground": "oklch(0.985 0 0)",
        "sidebar-accent": "oklch(0.274 0.006 286.033)",
        "sidebar-accent-foreground": "oklch(0.985 0 0)",
        "sidebar-border": "oklch(1 0 0 / 10%)",
        "sidebar-ring": "oklch(0.552 0.016 285.938)",
      },
    },
  },
  {
    name: "mauve",
    title: "Mauve",
    type: "registry:theme",
    cssVars: {
      light: {
        background: "oklch(1 0 0)",
        foreground: "oklch(0.145 0.008 326)",
        card: "oklch(1 0 0)",
        "card-foreground": "oklch(0.145 0.008 326)",
        popover: "oklch(1 0 0)",
        "popover-foreground": "oklch(0.145 0.008 326)",
        primary: "oklch(0.212 0.019 322.12)",
        "primary-foreground": "oklch(0.985 0 0)",
        secondary: "oklch(0.96 0.003 325.6)",
        "secondary-foreground": "oklch(0.212 0.019 322.12)",
        muted: "oklch(0.96 0.003 325.6)",
        "muted-foreground": "oklch(0.542 0.034 322.5)",
        accent: "oklch(0.96 0.003 325.6)",
        "accent-foreground": "oklch(0.212 0.019 322.12)",
        destructive: "oklch(0.577 0.245 27.325)",
        border: "oklch(0.922 0.005 325.62)",
        input: "oklch(0.922 0.005 325.62)",
        ring: "oklch(0.711 0.019 323.02)",
        "chart-1": "oklch(0.865 0.012 325.68)",
        "chart-2": "oklch(0.542 0.034 322.5)",
        "chart-3": "oklch(0.435 0.029 321.78)",
        "chart-4": "oklch(0.364 0.029 323.89)",
        "chart-5": "oklch(0.263 0.024 320.12)",
        radius: "0.625rem",
        sidebar: "oklch(0.985 0 0)",
        "sidebar-foreground": "oklch(0.145 0.008 326)",
        "sidebar-primary": "oklch(0.212 0.019 322.12)",
        "sidebar-primary-foreground": "oklch(0.985 0 0)",
        "sidebar-accent": "oklch(0.96 0.003 325.6)",
        "sidebar-accent-foreground": "oklch(0.212 0.019 322.12)",
        "sidebar-border": "oklch(0.922 0.005 325.62)",
        "sidebar-ring": "oklch(0.711 0.019 323.02)",
      },
      dark: {
        background: "oklch(0.145 0.008 326)",
        foreground: "oklch(0.985 0 0)",
        card: "oklch(0.212 0.019 322.12)",
        "card-foreground": "oklch(0.985 0 0)",
        popover: "oklch(0.212 0.019 322.12)",
        "popover-foreground": "oklch(0.985 0 0)",
        primary: "oklch(0.922 0.005 325.62)",
        "primary-foreground": "oklch(0.212 0.019 322.12)",
        secondary: "oklch(0.263 0.024 320.12)",
        "secondary-foreground": "oklch(0.985 0 0)",
        muted: "oklch(0.263 0.024 320.12)",
        "muted-foreground": "oklch(0.711 0.019 323.02)",
        accent: "oklch(0.263 0.024 320.12)",
        "accent-foreground": "oklch(0.985 0 0)",
        destructive: "oklch(0.704 0.191 22.216)",
        border: "oklch(1 0 0 / 10%)",
        input: "oklch(1 0 0 / 15%)",
        ring: "oklch(0.542 0.034 322.5)",
        "chart-1": "oklch(0.865 0.012 325.68)",
        "chart-2": "oklch(0.542 0.034 322.5)",
        "chart-3": "oklch(0.435 0.029 321.78)",
        "chart-4": "oklch(0.364 0.029 323.89)",
        "chart-5": "oklch(0.263 0.024 320.12)",
        sidebar: "oklch(0.212 0.019 322.12)",
        "sidebar-foreground": "oklch(0.985 0 0)",
        "sidebar-primary": "oklch(0.488 0.243 264.376)",
        "sidebar-primary-foreground": "oklch(0.985 0 0)",
        "sidebar-accent": "oklch(0.263 0.024 320.12)",
        "sidebar-accent-foreground": "oklch(0.985 0 0)",
        "sidebar-border": "oklch(1 0 0 / 10%)",
        "sidebar-ring": "oklch(0.542 0.034 322.5)",
      },
    },
  },
  {
    name: "olive",
    title: "Olive",
    type: "registry:theme",
    cssVars: {
      light: {
        background: "oklch(1 0 0)",
        foreground: "oklch(0.153 0.006 107.1)",
        card: "oklch(1 0 0)",
        "card-foreground": "oklch(0.153 0.006 107.1)",
        popover: "oklch(1 0 0)",
        "popover-foreground": "oklch(0.153 0.006 107.1)",
        primary: "oklch(0.228 0.013 107.4)",
        "primary-foreground": "oklch(0.988 0.003 106.5)",
        secondary: "oklch(0.966 0.005 106.5)",
        "secondary-foreground": "oklch(0.228 0.013 107.4)",
        muted: "oklch(0.966 0.005 106.5)",
        "muted-foreground": "oklch(0.58 0.031 107.3)",
        accent: "oklch(0.966 0.005 106.5)",
        "accent-foreground": "oklch(0.228 0.013 107.4)",
        destructive: "oklch(0.577 0.245 27.325)",
        border: "oklch(0.93 0.007 106.5)",
        input: "oklch(0.93 0.007 106.5)",
        ring: "oklch(0.737 0.021 106.9)",
        "chart-1": "oklch(0.88 0.011 106.6)",
        "chart-2": "oklch(0.58 0.031 107.3)",
        "chart-3": "oklch(0.466 0.025 107.3)",
        "chart-4": "oklch(0.394 0.023 107.4)",
        "chart-5": "oklch(0.286 0.016 107.4)",
        radius: "0.625rem",
        sidebar: "oklch(0.988 0.003 106.5)",
        "sidebar-foreground": "oklch(0.153 0.006 107.1)",
        "sidebar-primary": "oklch(0.228 0.013 107.4)",
        "sidebar-primary-foreground": "oklch(0.988 0.003 106.5)",
        "sidebar-accent": "oklch(0.966 0.005 106.5)",
        "sidebar-accent-foreground": "oklch(0.228 0.013 107.4)",
        "sidebar-border": "oklch(0.93 0.007 106.5)",
        "sidebar-ring": "oklch(0.737 0.021 106.9)",
      },
      dark: {
        background: "oklch(0.153 0.006 107.1)",
        foreground: "oklch(0.988 0.003 106.5)",
        card: "oklch(0.228 0.013 107.4)",
        "card-foreground": "oklch(0.988 0.003 106.5)",
        popover: "oklch(0.228 0.013 107.4)",
        "popover-foreground": "oklch(0.988 0.003 106.5)",
        primary: "oklch(0.93 0.007 106.5)",
        "primary-foreground": "oklch(0.228 0.013 107.4)",
        secondary: "oklch(0.286 0.016 107.4)",
        "secondary-foreground": "oklch(0.988 0.003 106.5)",
        muted: "oklch(0.286 0.016 107.4)",
        "muted-foreground": "oklch(0.737 0.021 106.9)",
        accent: "oklch(0.286 0.016 107.4)",
        "accent-foreground": "oklch(0.988 0.003 106.5)",
        destructive: "oklch(0.704 0.191 22.216)",
        border: "oklch(1 0 0 / 10%)",
        input: "oklch(1 0 0 / 15%)",
        ring: "oklch(0.58 0.031 107.3)",
        "chart-1": "oklch(0.88 0.011 106.6)",
        "chart-2": "oklch(0.58 0.031 107.3)",
        "chart-3": "oklch(0.466 0.025 107.3)",
        "chart-4": "oklch(0.394 0.023 107.4)",
        "chart-5": "oklch(0.286 0.016 107.4)",
        sidebar: "oklch(0.228 0.013 107.4)",
        "sidebar-foreground": "oklch(0.988 0.003 106.5)",
        "sidebar-primary": "oklch(0.488 0.243 264.376)",
        "sidebar-primary-foreground": "oklch(0.988 0.003 106.5)",
        "sidebar-accent": "oklch(0.286 0.016 107.4)",
        "sidebar-accent-foreground": "oklch(0.988 0.003 106.5)",
        "sidebar-border": "oklch(1 0 0 / 10%)",
        "sidebar-ring": "oklch(0.58 0.031 107.3)",
      },
    },
  },
  {
    name: "mist",
    title: "Mist",
    type: "registry:theme",
    cssVars: {
      light: {
        background: "oklch(1 0 0)",
        foreground: "oklch(0.148 0.004 228.8)",
        card: "oklch(1 0 0)",
        "card-foreground": "oklch(0.148 0.004 228.8)",
        popover: "oklch(1 0 0)",
        "popover-foreground": "oklch(0.148 0.004 228.8)",
        primary: "oklch(0.218 0.008 223.9)",
        "primary-foreground": "oklch(0.987 0.002 197.1)",
        secondary: "oklch(0.963 0.002 197.1)",
        "secondary-foreground": "oklch(0.218 0.008 223.9)",
        muted: "oklch(0.963 0.002 197.1)",
        "muted-foreground": "oklch(0.56 0.021 213.5)",
        accent: "oklch(0.963 0.002 197.1)",
        "accent-foreground": "oklch(0.218 0.008 223.9)",
        destructive: "oklch(0.577 0.245 27.325)",
        border: "oklch(0.925 0.005 214.3)",
        input: "oklch(0.925 0.005 214.3)",
        ring: "oklch(0.723 0.014 214.4)",
        "chart-1": "oklch(0.872 0.007 219.6)",
        "chart-2": "oklch(0.56 0.021 213.5)",
        "chart-3": "oklch(0.45 0.017 213.2)",
        "chart-4": "oklch(0.378 0.015 216)",
        "chart-5": "oklch(0.275 0.011 216.9)",
        radius: "0.625rem",
        sidebar: "oklch(0.987 0.002 197.1)",
        "sidebar-foreground": "oklch(0.148 0.004 228.8)",
        "sidebar-primary": "oklch(0.218 0.008 223.9)",
        "sidebar-primary-foreground": "oklch(0.987 0.002 197.1)",
        "sidebar-accent": "oklch(0.963 0.002 197.1)",
        "sidebar-accent-foreground": "oklch(0.218 0.008 223.9)",
        "sidebar-border": "oklch(0.925 0.005 214.3)",
        "sidebar-ring": "oklch(0.723 0.014 214.4)",
      },
      dark: {
        background: "oklch(0.148 0.004 228.8)",
        foreground: "oklch(0.987 0.002 197.1)",
        card: "oklch(0.218 0.008 223.9)",
        "card-foreground": "oklch(0.987 0.002 197.1)",
        popover: "oklch(0.218 0.008 223.9)",
        "popover-foreground": "oklch(0.987 0.002 197.1)",
        primary: "oklch(0.925 0.005 214.3)",
        "primary-foreground": "oklch(0.218 0.008 223.9)",
        secondary: "oklch(0.275 0.011 216.9)",
        "secondary-foreground": "oklch(0.987 0.002 197.1)",
        muted: "oklch(0.275 0.011 216.9)",
        "muted-foreground": "oklch(0.723 0.014 214.4)",
        accent: "oklch(0.275 0.011 216.9)",
        "accent-foreground": "oklch(0.987 0.002 197.1)",
        destructive: "oklch(0.704 0.191 22.216)",
        border: "oklch(1 0 0 / 10%)",
        input: "oklch(1 0 0 / 15%)",
        ring: "oklch(0.56 0.021 213.5)",
        "chart-1": "oklch(0.872 0.007 219.6)",
        "chart-2": "oklch(0.56 0.021 213.5)",
        "chart-3": "oklch(0.45 0.017 213.2)",
        "chart-4": "oklch(0.378 0.015 216)",
        "chart-5": "oklch(0.275 0.011 216.9)",
        sidebar: "oklch(0.218 0.008 223.9)",
        "sidebar-foreground": "oklch(0.987 0.002 197.1)",
        "sidebar-primary": "oklch(0.488 0.243 264.376)",
        "sidebar-primary-foreground": "oklch(0.987 0.002 197.1)",
        "sidebar-accent": "oklch(0.275 0.011 216.9)",
        "sidebar-accent-foreground": "oklch(0.987 0.002 197.1)",
        "sidebar-border": "oklch(1 0 0 / 10%)",
        "sidebar-ring": "oklch(0.56 0.021 213.5)",
      },
    },
  },
  {
    name: "taupe",
    title: "Taupe",
    type: "registry:theme",
    cssVars: {
      light: {
        background: "oklch(1 0 0)",
        foreground: "oklch(0.147 0.004 49.3)",
        card: "oklch(1 0 0)",
        "card-foreground": "oklch(0.147 0.004 49.3)",
        popover: "oklch(1 0 0)",
        "popover-foreground": "oklch(0.147 0.004 49.3)",
        primary: "oklch(0.214 0.009 43.1)",
        "primary-foreground": "oklch(0.986 0.002 67.8)",
        secondary: "oklch(0.96 0.002 17.2)",
        "secondary-foreground": "oklch(0.214 0.009 43.1)",
        muted: "oklch(0.96 0.002 17.2)",
        "muted-foreground": "oklch(0.547 0.021 43.1)",
        accent: "oklch(0.96 0.002 17.2)",
        "accent-foreground": "oklch(0.214 0.009 43.1)",
        destructive: "oklch(0.577 0.245 27.325)",
        border: "oklch(0.922 0.005 34.3)",
        input: "oklch(0.922 0.005 34.3)",
        ring: "oklch(0.714 0.014 41.2)",
        "chart-1": "oklch(0.868 0.007 39.5)",
        "chart-2": "oklch(0.547 0.021 43.1)",
        "chart-3": "oklch(0.438 0.017 39.3)",
        "chart-4": "oklch(0.367 0.016 35.7)",
        "chart-5": "oklch(0.268 0.011 36.5)",
        radius: "0.625rem",
        sidebar: "oklch(0.986 0.002 67.8)",
        "sidebar-foreground": "oklch(0.147 0.004 49.3)",
        "sidebar-primary": "oklch(0.214 0.009 43.1)",
        "sidebar-primary-foreground": "oklch(0.986 0.002 67.8)",
        "sidebar-accent": "oklch(0.96 0.002 17.2)",
        "sidebar-accent-foreground": "oklch(0.214 0.009 43.1)",
        "sidebar-border": "oklch(0.922 0.005 34.3)",
        "sidebar-ring": "oklch(0.714 0.014 41.2)",
      },
      dark: {
        background: "oklch(0.147 0.004 49.3)",
        foreground: "oklch(0.986 0.002 67.8)",
        card: "oklch(0.214 0.009 43.1)",
        "card-foreground": "oklch(0.986 0.002 67.8)",
        popover: "oklch(0.214 0.009 43.1)",
        "popover-foreground": "oklch(0.986 0.002 67.8)",
        primary: "oklch(0.922 0.005 34.3)",
        "primary-foreground": "oklch(0.214 0.009 43.1)",
        secondary: "oklch(0.268 0.011 36.5)",
        "secondary-foreground": "oklch(0.986 0.002 67.8)",
        muted: "oklch(0.268 0.011 36.5)",
        "muted-foreground": "oklch(0.714 0.014 41.2)",
        accent: "oklch(0.268 0.011 36.5)",
        "accent-foreground": "oklch(0.986 0.002 67.8)",
        destructive: "oklch(0.704 0.191 22.216)",
        border: "oklch(1 0 0 / 10%)",
        input: "oklch(1 0 0 / 15%)",
        ring: "oklch(0.547 0.021 43.1)",
        "chart-1": "oklch(0.868 0.007 39.5)",
        "chart-2": "oklch(0.547 0.021 43.1)",
        "chart-3": "oklch(0.438 0.017 39.3)",
        "chart-4": "oklch(0.367 0.016 35.7)",
        "chart-5": "oklch(0.268 0.011 36.5)",
        sidebar: "oklch(0.214 0.009 43.1)",
        "sidebar-foreground": "oklch(0.986 0.002 67.8)",
        "sidebar-primary": "oklch(0.488 0.243 264.376)",
        "sidebar-primary-foreground": "oklch(0.986 0.002 67.8)",
        "sidebar-accent": "oklch(0.268 0.011 36.5)",
        "sidebar-accent-foreground": "oklch(0.986 0.002 67.8)",
        "sidebar-border": "oklch(1 0 0 / 10%)",
        "sidebar-ring": "oklch(0.547 0.021 43.1)",
      },
    },
  },
  {
    name: "amber",
    title: "Amber",
    type: "registry:theme",
    cssVars: {
      light: {
        primary: "oklch(0.555 0.163 48.998)",
        "primary-foreground": "oklch(0.987 0.022 95.277)",
        secondary: "oklch(0.967 0.001 286.375)",
        "secondary-foreground": "oklch(0.21 0.006 285.885)",
        "chart-1": "oklch(0.879 0.169 91.605)",
        "chart-2": "oklch(0.769 0.188 70.08)",
        "chart-3": "oklch(0.666 0.179 58.318)",
        "chart-4": "oklch(0.555 0.163 48.998)",
        "chart-5": "oklch(0.473 0.137 46.201)",
        "sidebar-primary": "oklch(0.666 0.179 58.318)",
        "sidebar-primary-foreground": "oklch(0.987 0.022 95.277)",
      },
      dark: {
        primary: "oklch(0.473 0.137 46.201)",
        "primary-foreground": "oklch(0.987 0.022 95.277)",
        secondary: "oklch(0.274 0.006 286.033)",
        "secondary-foreground": "oklch(0.985 0 0)",
        "chart-1": "oklch(0.879 0.169 91.605)",
        "chart-2": "oklch(0.769 0.188 70.08)",
        "chart-3": "oklch(0.666 0.179 58.318)",
        "chart-4": "oklch(0.555 0.163 48.998)",
        "chart-5": "oklch(0.473 0.137 46.201)",
        "sidebar-primary": "oklch(0.769 0.188 70.08)",
        "sidebar-primary-foreground": "oklch(0.279 0.077 45.635)",
      },
    },
  },
  {
    name: "blue",
    title: "Blue",
    type: "registry:theme",
    cssVars: {
      light: {
        primary: "oklch(0.488 0.243 264.376)",
        "primary-foreground": "oklch(0.97 0.014 254.604)",
        secondary: "oklch(0.967 0.001 286.375)",
        "secondary-foreground": "oklch(0.21 0.006 285.885)",
        "chart-1": "oklch(0.809 0.105 251.813)",
        "chart-2": "oklch(0.623 0.214 259.815)",
        "chart-3": "oklch(0.546 0.245 262.881)",
        "chart-4": "oklch(0.488 0.243 264.376)",
        "chart-5": "oklch(0.424 0.199 265.638)",
        "sidebar-primary": "oklch(0.546 0.245 262.881)",
        "sidebar-primary-foreground": "oklch(0.97 0.014 254.604)",
      },
      dark: {
        primary: "oklch(0.424 0.199 265.638)",
        "primary-foreground": "oklch(0.97 0.014 254.604)",
        secondary: "oklch(0.274 0.006 286.033)",
        "secondary-foreground": "oklch(0.985 0 0)",
        "chart-1": "oklch(0.809 0.105 251.813)",
        "chart-2": "oklch(0.623 0.214 259.815)",
        "chart-3": "oklch(0.546 0.245 262.881)",
        "chart-4": "oklch(0.488 0.243 264.376)",
        "chart-5": "oklch(0.424 0.199 265.638)",
        "sidebar-primary": "oklch(0.623 0.214 259.815)",
        "sidebar-primary-foreground": "oklch(0.97 0.014 254.604)",
      },
    },
  },
  {
    name: "cyan",
    title: "Cyan",
    type: "registry:theme",
    cssVars: {
      light: {
        primary: "oklch(0.52 0.105 223.128)",
        "primary-foreground": "oklch(0.984 0.019 200.873)",
        secondary: "oklch(0.967 0.001 286.375)",
        "secondary-foreground": "oklch(0.21 0.006 285.885)",
        "chart-1": "oklch(0.865 0.127 207.078)",
        "chart-2": "oklch(0.715 0.143 215.221)",
        "chart-3": "oklch(0.609 0.126 221.723)",
        "chart-4": "oklch(0.52 0.105 223.128)",
        "chart-5": "oklch(0.45 0.085 224.283)",
        "sidebar-primary": "oklch(0.609 0.126 221.723)",
        "sidebar-primary-foreground": "oklch(0.984 0.019 200.873)",
      },
      dark: {
        primary: "oklch(0.45 0.085 224.283)",
        "primary-foreground": "oklch(0.984 0.019 200.873)",
        secondary: "oklch(0.274 0.006 286.033)",
        "secondary-foreground": "oklch(0.985 0 0)",
        "chart-1": "oklch(0.865 0.127 207.078)",
        "chart-2": "oklch(0.715 0.143 215.221)",
        "chart-3": "oklch(0.609 0.126 221.723)",
        "chart-4": "oklch(0.52 0.105 223.128)",
        "chart-5": "oklch(0.45 0.085 224.283)",
        "sidebar-primary": "oklch(0.715 0.143 215.221)",
        "sidebar-primary-foreground": "oklch(0.302 0.056 229.695)",
      },
    },
  },
  {
    name: "emerald",
    title: "Emerald",
    type: "registry:theme",
    cssVars: {
      light: {
        primary: "oklch(0.508 0.118 165.612)",
        "primary-foreground": "oklch(0.979 0.021 166.113)",
        secondary: "oklch(0.967 0.001 286.375)",
        "secondary-foreground": "oklch(0.21 0.006 285.885)",
        "chart-1": "oklch(0.845 0.143 164.978)",
        "chart-2": "oklch(0.696 0.17 162.48)",
        "chart-3": "oklch(0.596 0.145 163.225)",
        "chart-4": "oklch(0.508 0.118 165.612)",
        "chart-5": "oklch(0.432 0.095 166.913)",
        "sidebar-primary": "oklch(0.596 0.145 163.225)",
        "sidebar-primary-foreground": "oklch(0.979 0.021 166.113)",
      },
      dark: {
        primary: "oklch(0.432 0.095 166.913)",
        "primary-foreground": "oklch(0.979 0.021 166.113)",
        secondary: "oklch(0.274 0.006 286.033)",
        "secondary-foreground": "oklch(0.985 0 0)",
        "chart-1": "oklch(0.845 0.143 164.978)",
        "chart-2": "oklch(0.696 0.17 162.48)",
        "chart-3": "oklch(0.596 0.145 163.225)",
        "chart-4": "oklch(0.508 0.118 165.612)",
        "chart-5": "oklch(0.432 0.095 166.913)",
        "sidebar-primary": "oklch(0.696 0.17 162.48)",
        "sidebar-primary-foreground": "oklch(0.262 0.051 172.552)",
      },
    },
  },
  {
    name: "fuchsia",
    title: "Fuchsia",
    type: "registry:theme",
    cssVars: {
      light: {
        primary: "oklch(0.518 0.253 323.949)",
        "primary-foreground": "oklch(0.977 0.017 320.058)",
        secondary: "oklch(0.967 0.001 286.375)",
        "secondary-foreground": "oklch(0.21 0.006 285.885)",
        "chart-1": "oklch(0.833 0.145 321.434)",
        "chart-2": "oklch(0.667 0.295 322.15)",
        "chart-3": "oklch(0.591 0.293 322.896)",
        "chart-4": "oklch(0.518 0.253 323.949)",
        "chart-5": "oklch(0.452 0.211 324.591)",
        "sidebar-primary": "oklch(0.591 0.293 322.896)",
        "sidebar-primary-foreground": "oklch(0.977 0.017 320.058)",
      },
      dark: {
        primary: "oklch(0.452 0.211 324.591)",
        "primary-foreground": "oklch(0.977 0.017 320.058)",
        secondary: "oklch(0.274 0.006 286.033)",
        "secondary-foreground": "oklch(0.985 0 0)",
        "chart-1": "oklch(0.833 0.145 321.434)",
        "chart-2": "oklch(0.667 0.295 322.15)",
        "chart-3": "oklch(0.591 0.293 322.896)",
        "chart-4": "oklch(0.518 0.253 323.949)",
        "chart-5": "oklch(0.452 0.211 324.591)",
        "sidebar-primary": "oklch(0.667 0.295 322.15)",
        "sidebar-primary-foreground": "oklch(0.977 0.017 320.058)",
      },
    },
  },
  {
    name: "green",
    title: "Green",
    type: "registry:theme",
    cssVars: {
      light: {
        primary: "oklch(0.527 0.154 150.069)",
        "primary-foreground": "oklch(0.982 0.018 155.826)",
        secondary: "oklch(0.967 0.001 286.375)",
        "secondary-foreground": "oklch(0.21 0.006 285.885)",
        "chart-1": "oklch(0.871 0.15 154.449)",
        "chart-2": "oklch(0.723 0.219 149.579)",
        "chart-3": "oklch(0.627 0.194 149.214)",
        "chart-4": "oklch(0.527 0.154 150.069)",
        "chart-5": "oklch(0.448 0.119 151.328)",
        "sidebar-primary": "oklch(0.627 0.194 149.214)",
        "sidebar-primary-foreground": "oklch(0.982 0.018 155.826)",
      },
      dark: {
        primary: "oklch(0.448 0.119 151.328)",
        "primary-foreground": "oklch(0.982 0.018 155.826)",
        secondary: "oklch(0.274 0.006 286.033)",
        "secondary-foreground": "oklch(0.985 0 0)",
        "chart-1": "oklch(0.871 0.15 154.449)",
        "chart-2": "oklch(0.723 0.219 149.579)",
        "chart-3": "oklch(0.627 0.194 149.214)",
        "chart-4": "oklch(0.527 0.154 150.069)",
        "chart-5": "oklch(0.448 0.119 151.328)",
        "sidebar-primary": "oklch(0.723 0.219 149.579)",
        "sidebar-primary-foreground": "oklch(0.982 0.018 155.826)",
      },
    },
  },
  {
    name: "indigo",
    title: "Indigo",
    type: "registry:theme",
    cssVars: {
      light: {
        primary: "oklch(0.457 0.24 277.023)",
        "primary-foreground": "oklch(0.962 0.018 272.314)",
        secondary: "oklch(0.967 0.001 286.375)",
        "secondary-foreground": "oklch(0.21 0.006 285.885)",
        "chart-1": "oklch(0.785 0.115 274.713)",
        "chart-2": "oklch(0.585 0.233 277.117)",
        "chart-3": "oklch(0.511 0.262 276.966)",
        "chart-4": "oklch(0.457 0.24 277.023)",
        "chart-5": "oklch(0.398 0.195 277.366)",
        "sidebar-primary": "oklch(0.511 0.262 276.966)",
        "sidebar-primary-foreground": "oklch(0.962 0.018 272.314)",
      },
      dark: {
        primary: "oklch(0.398 0.195 277.366)",
        "primary-foreground": "oklch(0.962 0.018 272.314)",
        secondary: "oklch(0.274 0.006 286.033)",
        "secondary-foreground": "oklch(0.985 0 0)",
        "chart-1": "oklch(0.785 0.115 274.713)",
        "chart-2": "oklch(0.585 0.233 277.117)",
        "chart-3": "oklch(0.511 0.262 276.966)",
        "chart-4": "oklch(0.457 0.24 277.023)",
        "chart-5": "oklch(0.398 0.195 277.366)",
        "sidebar-primary": "oklch(0.585 0.233 277.117)",
        "sidebar-primary-foreground": "oklch(0.962 0.018 272.314)",
      },
    },
  },
  {
    name: "lime",
    title: "Lime",
    type: "registry:theme",
    cssVars: {
      light: {
        primary: "oklch(0.841 0.238 128.85)",
        "primary-foreground": "oklch(0.405 0.101 131.063)",
        secondary: "oklch(0.967 0.001 286.375)",
        "secondary-foreground": "oklch(0.21 0.006 285.885)",
        "chart-1": "oklch(0.897 0.196 126.665)",
        "chart-2": "oklch(0.768 0.233 130.85)",
        "chart-3": "oklch(0.648 0.2 131.684)",
        "chart-4": "oklch(0.532 0.157 131.589)",
        "chart-5": "oklch(0.453 0.124 130.933)",
        "sidebar-primary": "oklch(0.648 0.2 131.684)",
        "sidebar-primary-foreground": "oklch(0.986 0.031 120.757)",
      },
      dark: {
        primary: "oklch(0.768 0.233 130.85)",
        "primary-foreground": "oklch(0.405 0.101 131.063)",
        secondary: "oklch(0.274 0.006 286.033)",
        "secondary-foreground": "oklch(0.985 0 0)",
        "chart-1": "oklch(0.897 0.196 126.665)",
        "chart-2": "oklch(0.768 0.233 130.85)",
        "chart-3": "oklch(0.648 0.2 131.684)",
        "chart-4": "oklch(0.532 0.157 131.589)",
        "chart-5": "oklch(0.453 0.124 130.933)",
        "sidebar-primary": "oklch(0.768 0.233 130.85)",
        "sidebar-primary-foreground": "oklch(0.274 0.072 132.109)",
      },
    },
  },
  {
    name: "orange",
    title: "Orange",
    type: "registry:theme",
    cssVars: {
      light: {
        primary: "oklch(0.553 0.195 38.402)",
        "primary-foreground": "oklch(0.98 0.016 73.684)",
        secondary: "oklch(0.967 0.001 286.375)",
        "secondary-foreground": "oklch(0.21 0.006 285.885)",
        "chart-1": "oklch(0.837 0.128 66.29)",
        "chart-2": "oklch(0.705 0.213 47.604)",
        "chart-3": "oklch(0.646 0.222 41.116)",
        "chart-4": "oklch(0.553 0.195 38.402)",
        "chart-5": "oklch(0.47 0.157 37.304)",
        "sidebar-primary": "oklch(0.646 0.222 41.116)",
        "sidebar-primary-foreground": "oklch(0.98 0.016 73.684)",
      },
      dark: {
        primary: "oklch(0.47 0.157 37.304)",
        "primary-foreground": "oklch(0.98 0.016 73.684)",
        secondary: "oklch(0.274 0.006 286.033)",
        "secondary-foreground": "oklch(0.985 0 0)",
        "chart-1": "oklch(0.837 0.128 66.29)",
        "chart-2": "oklch(0.705 0.213 47.604)",
        "chart-3": "oklch(0.646 0.222 41.116)",
        "chart-4": "oklch(0.553 0.195 38.402)",
        "chart-5": "oklch(0.47 0.157 37.304)",
        "sidebar-primary": "oklch(0.705 0.213 47.604)",
        "sidebar-primary-foreground": "oklch(0.98 0.016 73.684)",
      },
    },
  },
  {
    name: "pink",
    title: "Pink",
    type: "registry:theme",
    cssVars: {
      light: {
        primary: "oklch(0.525 0.223 3.958)",
        "primary-foreground": "oklch(0.971 0.014 343.198)",
        secondary: "oklch(0.967 0.001 286.375)",
        "secondary-foreground": "oklch(0.21 0.006 285.885)",
        "chart-1": "oklch(0.823 0.12 346.018)",
        "chart-2": "oklch(0.656 0.241 354.308)",
        "chart-3": "oklch(0.592 0.249 0.584)",
        "chart-4": "oklch(0.525 0.223 3.958)",
        "chart-5": "oklch(0.459 0.187 3.815)",
        "sidebar-primary": "oklch(0.592 0.249 0.584)",
        "sidebar-primary-foreground": "oklch(0.971 0.014 343.198)",
      },
      dark: {
        primary: "oklch(0.459 0.187 3.815)",
        "primary-foreground": "oklch(0.971 0.014 343.198)",
        secondary: "oklch(0.274 0.006 286.033)",
        "secondary-foreground": "oklch(0.985 0 0)",
        "chart-1": "oklch(0.823 0.12 346.018)",
        "chart-2": "oklch(0.656 0.241 354.308)",
        "chart-3": "oklch(0.592 0.249 0.584)",
        "chart-4": "oklch(0.525 0.223 3.958)",
        "chart-5": "oklch(0.459 0.187 3.815)",
        "sidebar-primary": "oklch(0.656 0.241 354.308)",
        "sidebar-primary-foreground": "oklch(0.971 0.014 343.198)",
      },
    },
  },
  {
    name: "purple",
    title: "Purple",
    type: "registry:theme",
    cssVars: {
      light: {
        primary: "oklch(0.496 0.265 301.924)",
        "primary-foreground": "oklch(0.977 0.014 308.299)",
        secondary: "oklch(0.967 0.001 286.375)",
        "secondary-foreground": "oklch(0.21 0.006 285.885)",
        "chart-1": "oklch(0.827 0.119 306.383)",
        "chart-2": "oklch(0.627 0.265 303.9)",
        "chart-3": "oklch(0.558 0.288 302.321)",
        "chart-4": "oklch(0.496 0.265 301.924)",
        "chart-5": "oklch(0.438 0.218 303.724)",
        "sidebar-primary": "oklch(0.558 0.288 302.321)",
        "sidebar-primary-foreground": "oklch(0.977 0.014 308.299)",
      },
      dark: {
        primary: "oklch(0.438 0.218 303.724)",
        "primary-foreground": "oklch(0.977 0.014 308.299)",
        secondary: "oklch(0.274 0.006 286.033)",
        "secondary-foreground": "oklch(0.985 0 0)",
        "chart-1": "oklch(0.827 0.119 306.383)",
        "chart-2": "oklch(0.627 0.265 303.9)",
        "chart-3": "oklch(0.558 0.288 302.321)",
        "chart-4": "oklch(0.496 0.265 301.924)",
        "chart-5": "oklch(0.438 0.218 303.724)",
        "sidebar-primary": "oklch(0.627 0.265 303.9)",
        "sidebar-primary-foreground": "oklch(0.977 0.014 308.299)",
      },
    },
  },
  {
    name: "red",
    title: "Red",
    type: "registry:theme",
    cssVars: {
      light: {
        primary: "oklch(0.505 0.213 27.518)",
        "primary-foreground": "oklch(0.971 0.013 17.38)",
        secondary: "oklch(0.967 0.001 286.375)",
        "secondary-foreground": "oklch(0.21 0.006 285.885)",
        "chart-1": "oklch(0.808 0.114 19.571)",
        "chart-2": "oklch(0.637 0.237 25.331)",
        "chart-3": "oklch(0.577 0.245 27.325)",
        "chart-4": "oklch(0.505 0.213 27.518)",
        "chart-5": "oklch(0.444 0.177 26.899)",
        "sidebar-primary": "oklch(0.577 0.245 27.325)",
        "sidebar-primary-foreground": "oklch(0.971 0.013 17.38)",
      },
      dark: {
        primary: "oklch(0.444 0.177 26.899)",
        "primary-foreground": "oklch(0.971 0.013 17.38)",
        secondary: "oklch(0.274 0.006 286.033)",
        "secondary-foreground": "oklch(0.985 0 0)",
        "chart-1": "oklch(0.808 0.114 19.571)",
        "chart-2": "oklch(0.637 0.237 25.331)",
        "chart-3": "oklch(0.577 0.245 27.325)",
        "chart-4": "oklch(0.505 0.213 27.518)",
        "chart-5": "oklch(0.444 0.177 26.899)",
        "sidebar-primary": "oklch(0.637 0.237 25.331)",
        "sidebar-primary-foreground": "oklch(0.971 0.013 17.38)",
      },
    },
  },
  {
    name: "rose",
    title: "Rose",
    type: "registry:theme",
    cssVars: {
      light: {
        primary: "oklch(0.514 0.222 16.935)",
        "primary-foreground": "oklch(0.969 0.015 12.422)",
        secondary: "oklch(0.967 0.001 286.375)",
        "secondary-foreground": "oklch(0.21 0.006 285.885)",
        "chart-1": "oklch(0.81 0.117 11.638)",
        "chart-2": "oklch(0.645 0.246 16.439)",
        "chart-3": "oklch(0.586 0.253 17.585)",
        "chart-4": "oklch(0.514 0.222 16.935)",
        "chart-5": "oklch(0.455 0.188 13.697)",
        "sidebar-primary": "oklch(0.586 0.253 17.585)",
        "sidebar-primary-foreground": "oklch(0.969 0.015 12.422)",
      },
      dark: {
        primary: "oklch(0.455 0.188 13.697)",
        "primary-foreground": "oklch(0.969 0.015 12.422)",
        secondary: "oklch(0.274 0.006 286.033)",
        "secondary-foreground": "oklch(0.985 0 0)",
        "chart-1": "oklch(0.81 0.117 11.638)",
        "chart-2": "oklch(0.645 0.246 16.439)",
        "chart-3": "oklch(0.586 0.253 17.585)",
        "chart-4": "oklch(0.514 0.222 16.935)",
        "chart-5": "oklch(0.455 0.188 13.697)",
        sidebar: "oklch(0.21 0.006 285.885)",
        "sidebar-primary": "oklch(0.645 0.246 16.439)",
        "sidebar-primary-foreground": "oklch(0.969 0.015 12.422)",
      },
    },
  },
  {
    name: "sky",
    title: "Sky",
    type: "registry:theme",
    cssVars: {
      light: {
        primary: "oklch(0.5 0.134 242.749)",
        "primary-foreground": "oklch(0.977 0.013 236.62)",
        secondary: "oklch(0.967 0.001 286.375)",
        "secondary-foreground": "oklch(0.21 0.006 285.885)",
        "chart-1": "oklch(0.828 0.111 230.318)",
        "chart-2": "oklch(0.685 0.169 237.323)",
        "chart-3": "oklch(0.588 0.158 241.966)",
        "chart-4": "oklch(0.5 0.134 242.749)",
        "chart-5": "oklch(0.443 0.11 240.79)",
        "sidebar-primary": "oklch(0.588 0.158 241.966)",
        "sidebar-primary-foreground": "oklch(0.977 0.013 236.62)",
      },
      dark: {
        primary: "oklch(0.443 0.11 240.79)",
        "primary-foreground": "oklch(0.977 0.013 236.62)",
        secondary: "oklch(0.274 0.006 286.033)",
        "secondary-foreground": "oklch(0.985 0 0)",
        "chart-1": "oklch(0.828 0.111 230.318)",
        "chart-2": "oklch(0.685 0.169 237.323)",
        "chart-3": "oklch(0.588 0.158 241.966)",
        "chart-4": "oklch(0.5 0.134 242.749)",
        "chart-5": "oklch(0.443 0.11 240.79)",
        "sidebar-primary": "oklch(0.685 0.169 237.323)",
        "sidebar-primary-foreground": "oklch(0.293 0.066 243.157)",
      },
    },
  },
  {
    name: "teal",
    title: "Teal",
    type: "registry:theme",
    cssVars: {
      light: {
        primary: "oklch(0.511 0.096 186.391)",
        "primary-foreground": "oklch(0.984 0.014 180.72)",
        secondary: "oklch(0.967 0.001 286.375)",
        "secondary-foreground": "oklch(0.21 0.006 285.885)",
        "chart-1": "oklch(0.855 0.138 181.071)",
        "chart-2": "oklch(0.704 0.14 182.503)",
        "chart-3": "oklch(0.6 0.118 184.704)",
        "chart-4": "oklch(0.511 0.096 186.391)",
        "chart-5": "oklch(0.437 0.078 188.216)",
        "sidebar-primary": "oklch(0.6 0.118 184.704)",
        "sidebar-primary-foreground": "oklch(0.984 0.014 180.72)",
      },
      dark: {
        primary: "oklch(0.437 0.078 188.216)",
        "primary-foreground": "oklch(0.984 0.014 180.72)",
        secondary: "oklch(0.274 0.006 286.033)",
        "secondary-foreground": "oklch(0.985 0 0)",
        "chart-1": "oklch(0.855 0.138 181.071)",
        "chart-2": "oklch(0.704 0.14 182.503)",
        "chart-3": "oklch(0.6 0.118 184.704)",
        "chart-4": "oklch(0.511 0.096 186.391)",
        "chart-5": "oklch(0.437 0.078 188.216)",
        "sidebar-primary": "oklch(0.704 0.14 182.503)",
        "sidebar-primary-foreground": "oklch(0.277 0.046 192.524)",
      },
    },
  },
  {
    name: "violet",
    title: "Violet",
    type: "registry:theme",
    cssVars: {
      light: {
        primary: "oklch(0.491 0.27 292.581)",
        "primary-foreground": "oklch(0.969 0.016 293.756)",
        secondary: "oklch(0.967 0.001 286.375)",
        "secondary-foreground": "oklch(0.21 0.006 285.885)",
        "chart-1": "oklch(0.811 0.111 293.571)",
        "chart-2": "oklch(0.606 0.25 292.717)",
        "chart-3": "oklch(0.541 0.281 293.009)",
        "chart-4": "oklch(0.491 0.27 292.581)",
        "chart-5": "oklch(0.432 0.232 292.759)",
        "sidebar-primary": "oklch(0.541 0.281 293.009)",
        "sidebar-primary-foreground": "oklch(0.969 0.016 293.756)",
      },
      dark: {
        primary: "oklch(0.432 0.232 292.759)",
        "primary-foreground": "oklch(0.969 0.016 293.756)",
        secondary: "oklch(0.274 0.006 286.033)",
        "secondary-foreground": "oklch(0.985 0 0)",
        "chart-1": "oklch(0.811 0.111 293.571)",
        "chart-2": "oklch(0.606 0.25 292.717)",
        "chart-3": "oklch(0.541 0.281 293.009)",
        "chart-4": "oklch(0.491 0.27 292.581)",
        "chart-5": "oklch(0.432 0.232 292.759)",
        "sidebar-primary": "oklch(0.606 0.25 292.717)",
        "sidebar-primary-foreground": "oklch(0.969 0.016 293.756)",
      },
    },
  },
  {
    name: "yellow",
    title: "Yellow",
    type: "registry:theme",
    cssVars: {
      light: {
        primary: "oklch(0.852 0.199 91.936)",
        "primary-foreground": "oklch(0.421 0.095 57.708)",
        secondary: "oklch(0.967 0.001 286.375)",
        "secondary-foreground": "oklch(0.21 0.006 285.885)",
        "chart-1": "oklch(0.905 0.182 98.111)",
        "chart-2": "oklch(0.795 0.184 86.047)",
        "chart-3": "oklch(0.681 0.162 75.834)",
        "chart-4": "oklch(0.554 0.135 66.442)",
        "chart-5": "oklch(0.476 0.114 61.907)",
        "sidebar-primary": "oklch(0.681 0.162 75.834)",
        "sidebar-primary-foreground": "oklch(0.987 0.026 102.212)",
      },
      dark: {
        primary: "oklch(0.795 0.184 86.047)",
        "primary-foreground": "oklch(0.421 0.095 57.708)",
        secondary: "oklch(0.274 0.006 286.033)",
        "secondary-foreground": "oklch(0.985 0 0)",
        "chart-1": "oklch(0.905 0.182 98.111)",
        "chart-2": "oklch(0.795 0.184 86.047)",
        "chart-3": "oklch(0.681 0.162 75.834)",
        "chart-4": "oklch(0.554 0.135 66.442)",
        "chart-5": "oklch(0.476 0.114 61.907)",
        "sidebar-primary": "oklch(0.795 0.184 86.047)",
        "sidebar-primary-foreground": "oklch(0.987 0.026 102.212)",
      },
    },
  },
] as const satisfies readonly RegistryItem[];

export type Theme = (typeof THEMES)[number];

// ---------------------------------------------------------------------------
// registry/base-colors.ts (verbatim: filter of THEMES)
// ---------------------------------------------------------------------------

export const BASE_COLORS = THEMES.filter((theme) =>
  ["neutral", "stone", "zinc", "mauve", "olive", "mist", "taupe"].includes(
    theme.name,
  ),
);

export type BaseColor = (typeof BASE_COLORS)[number];

// ---------------------------------------------------------------------------
// registry/bases.ts (verbatim)
// ---------------------------------------------------------------------------

export const BASES = [
  {
    name: "base",
    type: "registry:style",
    title: "Base UI",
    description:
      "Components for building accessible web apps and design systems.",
    dependencies: ["@base-ui/react"],
    meta: {
      logo: "<svg width='17' height='24' viewBox='0 0 17 24'><path fill='currentColor' d='M9.5001 7.01537C9.2245 6.99837 9 7.22385 9 7.49999V23C13.4183 23 17 19.4183 17 15C17 10.7497 13.6854 7.27351 9.5001 7.01537Z'></path><path fill='currentColor'   d='M8 9.8V12V23C3.58172 23 0 19.0601 0 14.2V12V1C4.41828 1 8 4.93989 8 9.8Z'></path></svg>",
    },
  },
  {
    name: "aria",
    type: "registry:style",
    title: "React Aria",
    description:
      "Components for building accessible web apps and design systems.",
    dependencies: ["react-aria-components"],
    meta: {
      logo: "<svg xmlns='http://www.w3.org/2000/svg' viewBox='200 206 800 790' fill='none'><path d='M720.67 205.995C867.583 205.995 986.679 325.091 986.68 472.003C986.68 590.753 908.865 691.325 801.446 725.521L979.312 948.055C994.438 966.98 980.963 995 956.736 995H795.612C778.743 995 762.715 987.629 751.734 974.823L697.365 911.421L493.126 653.39C457.134 607.918 489.518 540.979 547.511 540.977L720.67 540.971C758.758 540.971 789.635 510.091 789.635 472.003C789.634 433.915 758.758 403.038 720.67 403.038H429.939C404.955 403.038 388.623 391.886 373.994 373.623L277.349 252.966C262.194 234.045 275.664 205.996 299.905 205.995H720.67Z M396.605 720.706C407.798 705.406 430.443 704.843 442.381 719.568L503.816 797.018H502.786L535.569 838.934C548.074 854.358 549.943 877.191 538.047 893.09L476.638 972.545C465.692 986.707 448.803 995 430.903 995H242.276C218.18 995 204.665 967.248 219.523 948.278L337.992 797.018H337.923L396.605 720.706Z' fill='currentColor' /></svg>",
    },
  },
  {
    name: "radix",
    type: "registry:style",
    title: "Radix UI",
    description:
      "Optimized for fast development, easy maintenance, and accessibility.",
    dependencies: ["radix-ui"],
    meta: {
      logo: "<svg role='img' viewBox='0 0 24 24' xmlns='http://www.w3.org/2000/svg'><title>Radix UI</title><path fill='currentColor' d='M11.52 24a7.68 7.68 0 0 1-7.68-7.68 7.68 7.68 0 0 1 7.68-7.68V24Zm0-24v7.68H3.84V0h7.68Zm4.8 7.68a3.84 3.84 0 1 1 0-7.68 3.84 3.84 0 0 1 0 7.68Z'/></svg>",
    },
  },
] as const satisfies readonly RegistryItem[];

export type Base = (typeof BASES)[number];

// ---------------------------------------------------------------------------
// registry/styles.tsx ported to plain data: `icon` is the raw inline SVG
// markup (innerHTML of the original `<svg>` JSX element) instead of a JSX
// node, so this file has no React dependency. Render with e.g. a Marko
// `<svg><${'*'} innerHTML=icon /></svg>` wrapper, matching viewBox 0 0 24 24,
// width/height 128, fill none, stroke currentColor width 2.
// ---------------------------------------------------------------------------

export const STYLES = [
  {
    name: "vega",
    title: "Vega",
    description: "Clean, neutral, and familiar",
    icon: '<path d="M2.5 12C2.5 7.52166 2.5 5.28249 3.89124 3.89124C5.28249 2.5 7.52166 2.5 12 2.5C16.4783 2.5 18.7175 2.5 20.1088 3.89124C21.5 5.28249 21.5 7.52166 21.5 12C21.5 16.4783 21.5 18.7175 20.1088 20.1088C18.7175 21.5 16.4783 21.5 12 21.5C7.52166 21.5 5.28249 21.5 3.89124 20.1088C2.5 18.7175 2.5 16.4783 2.5 12Z" stroke="currentColor" stroke-width="2"></path>',
  },
  {
    name: "nova",
    title: "Nova",
    description: "Reduced padding and margins",
    icon: '<path d="M2 12C2 9.19974 2 7.79961 2.54497 6.73005C3.02433 5.78924 3.78924 5.02433 4.73005 4.54497C5.79961 4 7.19974 4 10 4H14C16.8003 4 18.2004 4 19.27 4.54497C20.2108 5.02433 20.9757 5.78924 21.455 6.73005C22 7.79961 22 9.19974 22 12C22 14.8003 22 16.2004 21.455 17.27C20.9757 18.2108 20.2108 18.9757 19.27 19.455C18.2004 20 16.8003 20 14 20H10C7.19974 20 5.79961 20 4.73005 19.455C3.78924 18.9757 3.02433 18.2108 2.54497 17.27C2 16.2004 2 14.8003 2 12Z" stroke="currentColor" stroke-width="2" stroke-linejoin="round"></path>',
  },
  {
    name: "maia",
    title: "Maia",
    description: "Rounded, with generous spacing.",
    icon: '<circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2" stroke-linejoin="round"></circle>',
  },
  {
    name: "lyra",
    title: "Lyra",
    description: "Boxy and sharp. For mono fonts.",
    icon: '<path d="M7.84308 3.80211C9.8718 2.6007 10.8862 2 12 2C13.1138 2 14.1282 2.6007 16.1569 3.80211L16.8431 4.20846C18.8718 5.40987 19.8862 6.01057 20.4431 7C21 7.98943 21 9.19084 21 11.5937V12.4063C21 14.8092 21 16.0106 20.4431 17C19.8862 17.9894 18.8718 18.5901 16.8431 19.7915L16.1569 20.1979C14.1282 21.3993 13.1138 22 12 22C10.8862 22 9.8718 21.3993 7.84308 20.1979L7.15692 19.7915C5.1282 18.5901 4.11384 17.9894 3.55692 17C3 16.0106 3 14.8092 3 12.4063V11.5937C3 9.19084 3 7.98943 3.55692 7C4.11384 6.01057 5.1282 5.40987 7.15692 4.20846L7.84308 3.80211Z" stroke="currentColor" stroke-width="2"></path>',
  },
  {
    name: "mira",
    title: "Mira",
    description: "Made for compact interfaces.",
    icon: '<path d="M5.92089 5.92089C8.15836 3.68342 9.2771 2.56468 10.5857 2.19562C11.5105 1.93479 12.4895 1.93479 13.4143 2.19562C14.7229 2.56468 15.8416 3.68342 18.0791 5.92089C20.3166 8.15836 21.4353 9.2771 21.8044 10.5857C22.0652 11.5105 22.0652 12.4895 21.8044 13.4143C21.4353 14.7229 20.3166 15.8416 18.0791 18.0791C15.8416 20.3166 14.7229 21.4353 13.4143 21.8044C12.4895 22.0652 11.5105 22.0652 10.5857 21.8044C9.2771 21.4353 8.15836 20.3166 5.92089 18.0791C3.68342 15.8416 2.56468 14.7229 2.19562 13.4143C1.93479 12.4895 1.93479 11.5105 2.19562 10.5857C2.56468 9.2771 3.68342 8.15836 5.92089 5.92089Z" stroke="currentColor" stroke-width="2" stroke-linejoin="round"></path>',
  },
  {
    name: "luma",
    title: "Luma",
    description: "Fluid, luminous, and soft.",
    icon: '<path d="M2 12C2 8.134 5.134 5 9 5H15C18.866 5 22 8.134 22 12C22 15.866 18.866 19 15 19H9C5.134 19 2 15.866 2 12Z" stroke="currentColor" stroke-width="2" stroke-linejoin="round"></path>',
  },
  {
    name: "sera",
    title: "Sera",
    description: "Editorial and typographic.",
    icon: '<rect x="3" y="3" width="18" height="18" stroke="currentColor" stroke-width="2"></rect>',
  },
  {
    name: "rhea",
    title: "Rhea",
    description: "Like Luma but compact.",
    icon: '<path d="M3 12C3 9.79086 4.79086 8 7 8H17C19.2091 8 21 9.79086 21 12C21 14.2091 19.2091 16 17 16H7C4.79086 16 3 14.2091 3 12Z" stroke="currentColor" stroke-width="2" stroke-linejoin="round"></path>',
  },
] as const;

export type Style = (typeof STYLES)[number];

// ---------------------------------------------------------------------------
// shadcn/icons libraries.ts (verbatim: name/title/packages/import/usage/
// export metadata only, no actual icon component sets)
// ---------------------------------------------------------------------------

export const iconLibraries = {
  lucide: {
    name: "lucide",
    title: "Lucide",
    packages: ["lucide-react"],
    import: "import { ICON } from 'lucide-react'",
    usage: "<ICON />",
    export: "lucide-react",
  },
  tabler: {
    name: "tabler",
    title: "Tabler Icons",
    packages: ["@tabler/icons-react"],
    import: "import { ICON } from '@tabler/icons-react'",
    usage: "<ICON />",
    export: "@tabler/icons-react",
  },
  hugeicons: {
    name: "hugeicons",
    title: "HugeIcons",
    packages: ["@hugeicons/react", "@hugeicons/core-free-icons"],
    import:
      "import { HugeiconsIcon } from '@hugeicons/react'\nimport { ICON } from '@hugeicons/core-free-icons';",
    usage: "<HugeiconsIcon icon={ICON} strokeWidth={2} />",
    export: "@hugeicons/core-free-icons",
  },
  phosphor: {
    name: "phosphor",
    title: "Phosphor Icons",
    packages: ["@phosphor-icons/react"],
    import: "import { ICON } from '@phosphor-icons/react'",
    usage: "<ICON strokeWidth={2} />",
    export: "@phosphor-icons/react",
  },
  remixicon: {
    name: "remixicon",
    title: "Remix Icon",
    packages: ["@remixicon/react"],
    import: "import { ICON } from '@remixicon/react'",
    usage: "<ICON />",
    export: "@remixicon/react",
  },
} as const;

export type IconLibraries = typeof iconLibraries;
export type IconLibrary = IconLibraries[keyof IconLibraries];
export type IconLibraryName = keyof IconLibraries;

// ---------------------------------------------------------------------------
// registry/config.ts (ported)
// ---------------------------------------------------------------------------

const SHADCN_VERSION = "latest";
const DEFAULT_RADIUS_VALUE = "0.625rem";

export type BaseName = Base["name"];
export type StyleName = Style["name"];
export type ThemeName = Theme["name"];
export type BaseColorName = BaseColor["name"];
export type ChartColorName = Theme["name"];

export const REGISTRY_BASE_PARTS = ["theme", "font"] as const;
export type RegistryBasePart = (typeof REGISTRY_BASE_PARTS)[number];

export const POINTER_CURSOR_SELECTOR =
  'button:not(:disabled), [role="button"]:not(:disabled)';

// Derive font values from registry fonts (e.g., "font-inter" -> "inter").
const fontValues = bodyFonts.map((f) =>
  (f.name as string).replace("font-", ""),
) as [string, ...string[]];
const fontHeadingValues = ["inherit", ...fontValues] as const;

export type FontValue = (typeof fontValues)[number];
export type FontHeadingValue = (typeof fontHeadingValues)[number];

export function getBodyFont(font: FontValue) {
  return bodyFonts.find((item) => item.name === `font-${font}`);
}

export function getHeadingFont(
  fontHeading: Exclude<FontHeadingValue, "inherit">,
) {
  return headingFonts.find(
    (item) => item.name === `font-heading-${fontHeading}`,
  );
}

export function getInheritedHeadingFontValue(font: FontValue) {
  return `var(${(getBodyFont(font)?.font as Record<string, unknown> | undefined)?.variable ?? "--font-sans"})`;
}

export const MENU_ACCENTS = [
  { value: "subtle", label: "Subtle" },
  { value: "bold", label: "Bold" },
] as const;

export type MenuAccent = (typeof MENU_ACCENTS)[number];
export type MenuAccentValue = MenuAccent["value"];

export const MENU_COLORS = [
  { value: "default", label: "Default" },
  { value: "inverted", label: "Inverted" },
  { value: "default-translucent", label: "Default Translucent" },
  { value: "inverted-translucent", label: "Inverted Translucent" },
] as const;

export type MenuColor = (typeof MENU_COLORS)[number];
export type MenuColorValue = MenuColor["value"];

export const RADII = [
  { name: "default", label: "Default", value: "" },
  { name: "none", label: "None", value: "0" },
  { name: "small", label: "Small", value: "0.45rem" },
  { name: "medium", label: "Medium", value: "0.625rem" },
  { name: "large", label: "Large", value: "0.875rem" },
] as const;

export type Radius = (typeof RADII)[number];
export type RadiusValue = Radius["name"];

export const TEMPLATE_VALUES = [
  "next",
  "next-monorepo",
  "start",
  "react-router",
  "vite",
  "vite-monorepo",
  "react-router-monorepo",
  "start-monorepo",
  "astro",
  "astro-monorepo",
  "laravel",
] as const;
export type TemplateValue = (typeof TEMPLATE_VALUES)[number];

/**
 * Plain-TS shape of the config the original validates/produces via zod.
 * Optional fields here correspond to fields the zod schema `.default()`s;
 * `validateDesignSystemConfig` (below) fills those in, matching
 * `designSystemConfigSchema`'s `.transform()` behavior.
 */
export interface DesignSystemConfig {
  base: BaseName;
  style: StyleName;
  iconLibrary: IconLibraryName;
  baseColor: BaseColorName;
  theme: ThemeName;
  chartColor?: ChartColorName;
  font: FontValue;
  fontHeading: FontHeadingValue;
  item?: string;
  rtl: boolean;
  pointer: boolean;
  menuAccent: MenuAccentValue;
  menuColor: MenuColorValue;
  radius: RadiusValue;
  template?: TemplateValue;
}

export interface DesignSystemConfigInput {
  base: BaseName;
  style: StyleName;
  iconLibrary: IconLibraryName;
  baseColor?: BaseColorName;
  theme: ThemeName;
  chartColor?: ChartColorName;
  font?: FontValue;
  fontHeading?: FontHeadingValue;
  item?: string;
  rtl?: boolean;
  pointer?: boolean;
  menuAccent?: MenuAccentValue;
  menuColor?: MenuColorValue;
  radius?: RadiusValue;
  template?: TemplateValue;
}

export class DesignSystemConfigValidationError extends Error {
  issues: { message: string; path: string[] }[];
  constructor(issues: { message: string; path: string[] }[]) {
    super(issues.map((i) => i.message).join("; "));
    this.name = "DesignSystemConfigValidationError";
    this.issues = issues;
  }
}

/**
 * Hand-written equivalent of shadcn/ui's zod `designSystemConfigSchema`:
 * validates enum membership, applies the same `.default(...)` values, and
 * runs the same two `.refine()` cross-field checks (theme / chartColor must
 * belong to `getThemesForBaseColor(baseColor)`).
 */
export function validateDesignSystemConfig(
  input: DesignSystemConfigInput,
): DesignSystemConfig {
  const issues: { message: string; path: string[] }[] = [];

  const baseNames = BASES.map((b) => b.name);
  const styleNames = STYLES.map((s) => s.name);
  const iconLibraryNames = Object.keys(iconLibraries) as IconLibraryName[];
  const baseColorNames = BASE_COLORS.map((c) => c.name);
  const themeNames = THEMES.map((t) => t.name);

  if (!baseNames.includes(input.base)) {
    issues.push({ message: `Invalid base "${input.base}"`, path: ["base"] });
  }
  if (!styleNames.includes(input.style)) {
    issues.push({
      message: `Invalid style "${input.style}"`,
      path: ["style"],
    });
  }
  if (!iconLibraryNames.includes(input.iconLibrary)) {
    issues.push({
      message: `Invalid icon library "${input.iconLibrary}"`,
      path: ["iconLibrary"],
    });
  }

  const baseColor = input.baseColor ?? ("neutral" as BaseColorName);
  if (!baseColorNames.includes(baseColor)) {
    issues.push({
      message: `Invalid base color "${baseColor}"`,
      path: ["baseColor"],
    });
  }
  if (!themeNames.includes(input.theme)) {
    issues.push({
      message: `Invalid theme "${input.theme}"`,
      path: ["theme"],
    });
  }

  const font = input.font ?? ("inter" as FontValue);
  if (!fontValues.includes(font)) {
    issues.push({ message: `Invalid font "${font}"`, path: ["font"] });
  }

  const fontHeading = input.fontHeading ?? "inherit";
  if (!(fontHeadingValues as readonly string[]).includes(fontHeading)) {
    issues.push({
      message: `Invalid font heading "${fontHeading}"`,
      path: ["fontHeading"],
    });
  }

  const rtl = input.rtl ?? false;
  const pointer = input.pointer ?? false;

  const menuAccent = input.menuAccent ?? "subtle";
  if (!MENU_ACCENTS.some((a) => a.value === menuAccent)) {
    issues.push({
      message: `Invalid menu accent "${menuAccent}"`,
      path: ["menuAccent"],
    });
  }

  const menuColor = input.menuColor ?? "default";
  if (!MENU_COLORS.some((m) => m.value === menuColor)) {
    issues.push({
      message: `Invalid menu color "${menuColor}"`,
      path: ["menuColor"],
    });
  }

  const radius = input.radius ?? "default";
  if (!RADII.some((r) => r.name === radius)) {
    issues.push({
      message: `Invalid radius "${radius}"`,
      path: ["radius"],
    });
  }

  const template = input.template ?? "next";
  if (
    input.template !== undefined &&
    !(TEMPLATE_VALUES as readonly string[]).includes(input.template)
  ) {
    issues.push({
      message: `Invalid template "${input.template}"`,
      path: ["template"],
    });
  }

  const chartColor = input.chartColor ?? input.theme;

  if (issues.length === 0) {
    const availableThemes = getThemesForBaseColor(baseColor);
    if (!availableThemes.some((t) => t.name === input.theme)) {
      issues.push({
        message: `Theme "${input.theme}" is not available for base color "${baseColor}"`,
        path: ["theme"],
      });
    }
    if (!availableThemes.some((t) => t.name === chartColor)) {
      issues.push({
        message: `Chart color "${chartColor}" is not available for base color "${baseColor}"`,
        path: ["chartColor"],
      });
    }
  }

  if (issues.length > 0) {
    throw new DesignSystemConfigValidationError(issues);
  }

  return {
    base: input.base,
    style: input.style,
    iconLibrary: input.iconLibrary,
    baseColor,
    theme: input.theme,
    chartColor,
    font,
    fontHeading,
    item: input.item,
    rtl,
    pointer,
    menuAccent,
    menuColor,
    radius,
    template,
  };
}

/**
 * zod-schema-shaped API-parity shim for `designSystemConfigSchema`. Not an
 * actual zod schema (no zod dependency here) — `.parse()` throws
 * `DesignSystemConfigValidationError` on invalid input (mirroring zod's
 * `ZodError`-throwing `.parse()`); `.safeParse()` returns a
 * `{ success, data }` / `{ success, error }` result the same shape zod
 * returns, with `error.issues` in the same `{ message, path }[]` form.
 */
export const designSystemConfigSchema = {
  parse(input: DesignSystemConfigInput): DesignSystemConfig {
    return validateDesignSystemConfig(input);
  },
  safeParse(
    input: DesignSystemConfigInput,
  ):
    | { success: true; data: DesignSystemConfig }
    | {
        success: false;
        error: { issues: { message: string; path: string[] }[] };
      } {
    try {
      return { success: true, data: validateDesignSystemConfig(input) };
    } catch (e) {
      if (e instanceof DesignSystemConfigValidationError) {
        return { success: false, error: { issues: e.issues } };
      }
      throw e;
    }
  },
};

export const DEFAULT_CONFIG: DesignSystemConfig = {
  base: "base",
  style: "nova",
  baseColor: "neutral",
  theme: "neutral",
  chartColor: "neutral",
  iconLibrary: "lucide",
  font: "inter",
  fontHeading: "inherit",
  item: "Item",
  rtl: false,
  pointer: false,
  menuAccent: "subtle",
  menuColor: "default",
  radius: "default",
  template: "next",
};

export type Preset = {
  name: string;
  title: string;
  description: string;
} & Omit<DesignSystemConfig, "pointer">;

export const PRESETS: Preset[] = [
  // Radix.
  {
    name: "radix-vega",
    title: "Vega (Radix)",
    description: "Vega / Lucide / Inter",
    base: "radix",
    style: "vega",
    baseColor: "neutral",
    theme: "neutral",
    chartColor: "neutral",
    iconLibrary: "lucide",
    font: "inter",
    fontHeading: "inherit",
    item: "Item",
    rtl: false,
    menuAccent: "subtle",
    menuColor: "default",
    radius: "default",
  },
  {
    name: "radix-nova",
    title: "Nova (Radix)",
    description: "Nova / Lucide / Geist",
    base: "radix",
    style: "nova",
    baseColor: "neutral",
    theme: "neutral",
    chartColor: "neutral",
    iconLibrary: "lucide",
    font: "geist",
    fontHeading: "inherit",
    item: "Item",
    rtl: false,
    menuAccent: "subtle",
    menuColor: "default",
    radius: "default",
  },
  {
    name: "radix-maia",
    title: "Maia (Radix)",
    description: "Maia / Hugeicons / Figtree",
    base: "radix",
    style: "maia",
    baseColor: "neutral",
    theme: "neutral",
    chartColor: "neutral",
    iconLibrary: "hugeicons",
    font: "figtree",
    fontHeading: "inherit",
    item: "Item",
    rtl: false,
    menuAccent: "subtle",
    menuColor: "default",
    radius: "default",
  },
  {
    name: "radix-lyra",
    title: "Lyra (Radix)",
    description: "Lyra / Tabler / JetBrains Mono",
    base: "radix",
    style: "lyra",
    baseColor: "neutral",
    theme: "neutral",
    chartColor: "neutral",
    iconLibrary: "phosphor",
    font: "jetbrains-mono",
    fontHeading: "inherit",
    item: "Item",
    rtl: false,
    menuAccent: "subtle",
    menuColor: "default",
    radius: "default",
  },
  {
    name: "radix-mira",
    title: "Mira (Radix)",
    description: "Mira / Hugeicons / Inter",
    base: "radix",
    style: "mira",
    baseColor: "neutral",
    theme: "neutral",
    chartColor: "neutral",
    iconLibrary: "hugeicons",
    font: "inter",
    fontHeading: "inherit",
    item: "Item",
    rtl: false,
    menuAccent: "subtle",
    menuColor: "default",
    radius: "default",
  },
  {
    name: "radix-luma",
    title: "Luma (Radix)",
    description: "Luma / Lucide / Inter",
    base: "radix",
    style: "luma",
    baseColor: "neutral",
    theme: "neutral",
    chartColor: "neutral",
    iconLibrary: "lucide",
    font: "inter",
    fontHeading: "inherit",
    item: "Item",
    rtl: false,
    menuAccent: "subtle",
    menuColor: "default",
    radius: "default",
  },
  // Aria.
  {
    name: "aria-vega",
    title: "Vega (Aria)",
    description: "Vega / Lucide / Inter",
    base: "aria",
    style: "vega",
    baseColor: "neutral",
    theme: "neutral",
    chartColor: "neutral",
    iconLibrary: "lucide",
    font: "inter",
    fontHeading: "inherit",
    item: "Item",
    rtl: false,
    menuAccent: "subtle",
    menuColor: "default",
    radius: "default",
  },
  {
    name: "base-nova",
    title: "Nova (Base)",
    description: "Nova / Lucide / Geist",
    base: "base",
    style: "nova",
    baseColor: "neutral",
    theme: "neutral",
    chartColor: "neutral",
    iconLibrary: "lucide",
    font: "geist",
    fontHeading: "inherit",
    item: "Item",
    rtl: false,
    menuAccent: "subtle",
    menuColor: "default",
    radius: "default",
  },
  {
    name: "base-maia",
    title: "Maia (Base)",
    description: "Maia / Hugeicons / Figtree",
    base: "base",
    style: "maia",
    baseColor: "neutral",
    theme: "neutral",
    chartColor: "neutral",
    iconLibrary: "hugeicons",
    font: "figtree",
    fontHeading: "inherit",
    item: "Item",
    rtl: false,
    menuAccent: "subtle",
    menuColor: "default",
    radius: "default",
  },
  {
    name: "base-lyra",
    title: "Lyra (Base)",
    description: "Lyra / Tabler / JetBrains Mono",
    base: "base",
    style: "lyra",
    baseColor: "neutral",
    theme: "neutral",
    chartColor: "neutral",
    iconLibrary: "phosphor",
    font: "jetbrains-mono",
    fontHeading: "inherit",
    item: "Item",
    rtl: false,
    menuAccent: "subtle",
    menuColor: "default",
    radius: "default",
  },
  {
    name: "base-mira",
    title: "Mira (Base)",
    description: "Mira / Hugeicons / Inter",
    base: "base",
    style: "mira",
    baseColor: "neutral",
    theme: "neutral",
    chartColor: "neutral",
    iconLibrary: "hugeicons",
    font: "inter",
    fontHeading: "inherit",
    item: "Item",
    rtl: false,
    menuAccent: "subtle",
    menuColor: "default",
    radius: "default",
  },
  {
    name: "base-luma",
    title: "Luma (Base)",
    description: "Luma / Lucide / Inter",
    base: "base",
    style: "luma",
    baseColor: "neutral",
    theme: "neutral",
    chartColor: "neutral",
    iconLibrary: "lucide",
    font: "inter",
    fontHeading: "inherit",
    item: "Item",
    rtl: false,
    menuAccent: "subtle",
    menuColor: "default",
    radius: "default",
  },
  // Base.
  {
    name: "base-vega",
    title: "Vega (Base)",
    description: "Vega / Lucide / Inter",
    base: "base",
    style: "vega",
    baseColor: "neutral",
    theme: "neutral",
    chartColor: "neutral",
    iconLibrary: "lucide",
    font: "inter",
    fontHeading: "inherit",
    item: "Item",
    rtl: false,
    menuAccent: "subtle",
    menuColor: "default",
    radius: "default",
  },
  {
    name: "aria-nova",
    title: "Nova (Aria)",
    description: "Nova / Lucide / Geist",
    base: "aria",
    style: "nova",
    baseColor: "neutral",
    theme: "neutral",
    chartColor: "neutral",
    iconLibrary: "lucide",
    font: "geist",
    fontHeading: "inherit",
    item: "Item",
    rtl: false,
    menuAccent: "subtle",
    menuColor: "default",
    radius: "default",
  },
  {
    name: "aria-maia",
    title: "Maia (Aria)",
    description: "Maia / Hugeicons / Figtree",
    base: "aria",
    style: "maia",
    baseColor: "neutral",
    theme: "neutral",
    chartColor: "neutral",
    iconLibrary: "hugeicons",
    font: "figtree",
    fontHeading: "inherit",
    item: "Item",
    rtl: false,
    menuAccent: "subtle",
    menuColor: "default",
    radius: "default",
  },
  {
    name: "aria-lyra",
    title: "Lyra (Aria)",
    description: "Lyra / Tabler / JetBrains Mono",
    base: "aria",
    style: "lyra",
    baseColor: "neutral",
    theme: "neutral",
    chartColor: "neutral",
    iconLibrary: "phosphor",
    font: "jetbrains-mono",
    fontHeading: "inherit",
    item: "Item",
    rtl: false,
    menuAccent: "subtle",
    menuColor: "default",
    radius: "default",
  },
  {
    name: "aria-mira",
    title: "Mira (Aria)",
    description: "Mira / Hugeicons / Inter",
    base: "aria",
    style: "mira",
    baseColor: "neutral",
    theme: "neutral",
    chartColor: "neutral",
    iconLibrary: "hugeicons",
    font: "inter",
    fontHeading: "inherit",
    item: "Item",
    rtl: false,
    menuAccent: "subtle",
    menuColor: "default",
    radius: "default",
  },
  {
    name: "aria-luma",
    title: "Luma (Aria)",
    description: "Luma / Lucide / Inter",
    base: "aria",
    style: "luma",
    baseColor: "neutral",
    theme: "neutral",
    chartColor: "neutral",
    iconLibrary: "lucide",
    font: "inter",
    fontHeading: "inherit",
    item: "Item",
    rtl: false,
    menuAccent: "subtle",
    menuColor: "default",
    radius: "default",
  },
  // Rhea.
  {
    name: "radix-rhea",
    title: "Rhea (Radix)",
    description: "Rhea / Lucide / Inter",
    base: "radix",
    style: "rhea",
    baseColor: "neutral",
    theme: "neutral",
    chartColor: "neutral",
    iconLibrary: "lucide",
    font: "inter",
    fontHeading: "inherit",
    item: "Item",
    rtl: false,
    menuAccent: "subtle",
    menuColor: "default",
    radius: "default",
  },
  {
    name: "base-rhea",
    title: "Rhea (Base)",
    description: "Rhea / Lucide / Inter",
    base: "base",
    style: "rhea",
    baseColor: "neutral",
    theme: "neutral",
    chartColor: "neutral",
    iconLibrary: "lucide",
    font: "inter",
    fontHeading: "inherit",
    item: "Item",
    rtl: false,
    menuAccent: "subtle",
    menuColor: "default",
    radius: "default",
  },
  {
    name: "aria-rhea",
    title: "Rhea (Aria)",
    description: "Rhea / Lucide / Inter",
    base: "aria",
    style: "rhea",
    baseColor: "neutral",
    theme: "neutral",
    chartColor: "neutral",
    iconLibrary: "lucide",
    font: "inter",
    fontHeading: "inherit",
    item: "Item",
    rtl: false,
    menuAccent: "subtle",
    menuColor: "default",
    radius: "default",
  },
  // Sera.
  {
    name: "radix-sera",
    title: "Sera (Radix)",
    description: "Sera / Lucide / Noto Sans + Playfair Display",
    base: "radix",
    style: "sera",
    baseColor: "taupe",
    theme: "taupe",
    chartColor: "taupe",
    iconLibrary: "lucide",
    font: "noto-sans",
    fontHeading: "playfair-display",
    item: "Item",
    rtl: false,
    menuAccent: "subtle",
    menuColor: "default",
    radius: "default",
  },
  {
    name: "base-sera",
    title: "Sera (Base)",
    description: "Sera / Lucide / Noto Sans + Playfair Display",
    base: "base",
    style: "sera",
    baseColor: "taupe",
    theme: "taupe",
    chartColor: "taupe",
    iconLibrary: "lucide",
    font: "noto-sans",
    fontHeading: "playfair-display",
    item: "Item",
    rtl: false,
    menuAccent: "subtle",
    menuColor: "default",
    radius: "default",
  },
  {
    name: "aria-sera",
    title: "Sera (Aria)",
    description: "Sera / Lucide / Noto Sans + Playfair Display",
    base: "aria",
    style: "sera",
    baseColor: "taupe",
    theme: "taupe",
    chartColor: "taupe",
    iconLibrary: "lucide",
    font: "noto-sans",
    fontHeading: "playfair-display",
    item: "Item",
    rtl: false,
    menuAccent: "subtle",
    menuColor: "default",
    radius: "default",
  },
];

export function getThemesForBaseColor(baseColorName: string) {
  const baseColorNames = BASE_COLORS.map((bc) => bc.name);

  return THEMES.filter((theme) => {
    if (theme.name === baseColorName) {
      return true;
    }
    return !baseColorNames.includes(theme.name as BaseColorName);
  });
}

export function getBase(name: BaseName) {
  return BASES.find((base) => base.name === name);
}

export function getStyle(name: StyleName) {
  return STYLES.find((style) => style.name === name);
}

export function getTheme(name: ThemeName) {
  return THEMES.find((theme) => theme.name === name);
}

export function getBaseColor(name: BaseColorName) {
  return BASE_COLORS.find((color) => color.name === name);
}

export function getIconLibrary(name: IconLibraryName) {
  return iconLibraries[name];
}

export function parseRegistryBaseParts(value: string | null) {
  if (value === null) {
    return { success: true as const, parts: undefined };
  }

  const aliases: Record<string, RegistryBasePart> = {
    theme: "theme",
    font: "font",
    fonts: "font",
  };
  const rawParts = value
    .split(",")
    .map((part) => part.trim().toLowerCase())
    .filter(Boolean);
  const invalid = rawParts.filter((part) => !aliases[part]);

  if (!rawParts.length || invalid.length) {
    return {
      success: false as const,
      error: `Invalid only value. Use one or more of: ${REGISTRY_BASE_PARTS.join(", ")}`,
    };
  }

  return {
    success: true as const,
    parts: Array.from(new Set(rawParts.map((part) => aliases[part]))),
  };
}

// Builds a registry:theme item from a design system config.
export function buildRegistryTheme(config: DesignSystemConfig) {
  const baseColor = getBaseColor(config.baseColor);
  const theme = getTheme(config.theme);

  if (!baseColor || !theme) {
    throw new Error(
      `Base color "${config.baseColor}" or theme "${config.theme}" not found`,
    );
  }

  // Merge base color and theme CSS vars.
  const lightVars: Record<string, string> = {
    ...(baseColor.cssVars?.light as Record<string, string>),
    ...(theme.cssVars?.light as Record<string, string>),
  };
  const darkVars: Record<string, string> = {
    ...(baseColor.cssVars?.dark as Record<string, string>),
    ...(theme.cssVars?.dark as Record<string, string>),
  };
  const themeVars: Record<string, string> = {};

  // Apply chart color override.
  const chartTheme = config.chartColor ? getTheme(config.chartColor) : undefined;
  if (chartTheme) {
    const chartLight = chartTheme.cssVars?.light as Record<string, string>;
    const chartDark = chartTheme.cssVars?.dark as Record<string, string>;
    for (let i = 1; i <= 5; i++) {
      const key = `chart-${i}`;
      if (chartLight?.[key]) lightVars[key] = chartLight[key];
      if (chartDark?.[key]) darkVars[key] = chartDark[key];
    }
  }

  // Apply menu accent transformation.
  if (config.menuAccent === "bold") {
    lightVars.accent = lightVars.primary!;
    lightVars["accent-foreground"] = lightVars["primary-foreground"]!;
    darkVars.accent = darkVars.primary!;
    darkVars["accent-foreground"] = darkVars["primary-foreground"]!;
    // lightVars["sidebar-accent"] = lightVars.primary
    // lightVars["sidebar-accent-foreground"] = lightVars["primary-foreground"]
    // darkVars["sidebar-accent"] = darkVars.primary
    // darkVars["sidebar-accent-foreground"] = darkVars["primary-foreground"]
  }

  // Apply radius transformation.
  if (config.radius && config.radius !== "default") {
    const radius = RADII.find((r) => r.name === config.radius);
    if (radius && radius.value) {
      lightVars.radius = radius.value;
    }
  }

  return {
    name: `${config.baseColor}-${config.theme}`,
    type: "registry:theme" as const,
    cssVars: {
      theme: Object.keys(themeVars).length > 0 ? themeVars : undefined,
      light: lightVars,
      dark: darkVars,
    },
  };
}

/**
 * Original calls `registryItemSchema.parse(...)` here (shadcn's zod
 * RegistryItem schema, used to validate/normalize the built object). We
 * don't have that package, so this is a plain identity pass-through — the
 * returned shape is unchanged; no runtime validation is performed.
 */
function parseRegistryItem(item: RegistryItem): RegistryItem {
  return item;
}

export function buildThemeForPreset(config: DesignSystemConfig) {
  const registryTheme = buildRegistryTheme(config);
  const radius = RADII.find((r) => r.name === config.radius);
  const radiusValue =
    config.radius === "default"
      ? (registryTheme.cssVars?.light?.radius ?? DEFAULT_RADIUS_VALUE)
      : (radius?.value ?? registryTheme.cssVars?.light?.radius);

  return parseRegistryItem({
    $schema: "https://ui.shadcn.com/schema/registry-item.json",
    name: registryTheme.name,
    type: "registry:theme",
    cssVars: {
      ...registryTheme.cssVars,
      light: {
        ...registryTheme.cssVars.light,
        ...(radiusValue && { radius: radiusValue }),
      },
    },
  });
}

// Builds a registry:base item from a design system config.
export function buildRegistryBase(config: DesignSystemConfig) {
  const baseItem = getBase(config.base);
  const iconLibraryItem = getIconLibrary(config.iconLibrary);
  const normalizedFontHeading =
    config.fontHeading === config.font ? "inherit" : config.fontHeading;

  if (!baseItem || !iconLibraryItem) {
    throw new Error(
      `Base "${config.base}" or icon library "${config.iconLibrary}" not found`,
    );
  }

  const registryTheme = buildRegistryTheme(config);

  // Build dependencies.
  const dependencies = [
    `shadcn@${SHADCN_VERSION}`,
    "class-variance-authority",
    "tw-animate-css",
    ...((baseItem as RegistryItem).dependencies ?? []),
    ...iconLibraryItem.packages,
  ];

  const registryDependencies = ["utils"];
  const themeVars = {
    ...(registryTheme.cssVars?.theme ?? {}),
    ...(normalizedFontHeading === "inherit"
      ? { "--font-heading": getInheritedHeadingFontValue(config.font) }
      : {}),
  };

  if (config.font) {
    registryDependencies.push(`font-${config.font}`);
  }

  if (normalizedFontHeading !== "inherit") {
    registryDependencies.push(`font-heading-${normalizedFontHeading}`);
  }

  return {
    name: `${config.base}-${config.style}`,
    extends: "none",
    type: "registry:base" as const,
    config: {
      style: `${config.base}-${config.style}`,
      iconLibrary: iconLibraryItem.name,
      rtl: config.rtl,
      menuColor: config.menuColor,
      menuAccent: config.menuAccent,
      tailwind: {
        baseColor: config.baseColor,
      },
    },
    dependencies,
    registryDependencies,
    cssVars: {
      ...registryTheme.cssVars,
      theme: Object.keys(themeVars).length > 0 ? themeVars : undefined,
    },
    css: {
      '@import "tw-animate-css"': {},
      '@import "shadcn/tailwind.css"': {},
      "@layer base": {
        "*": { "@apply border-border outline-ring/50": {} },
        body: { "@apply bg-background text-foreground": {} },
        ...(config.pointer && {
          [POINTER_CURSOR_SELECTOR]: {
            cursor: "pointer",
          },
        }),
      },
    },
    ...(config.rtl && {
      docs: `To learn how to set up the RTL provider and fonts for your app, see https://ui.shadcn.com/docs/rtl/${config.template === "next-monorepo" ? "next" : (config.template ?? "next")}`,
    }),
  };
}

export function buildPartialRegistryBase(
  config: DesignSystemConfig,
  parts: RegistryBasePart[],
) {
  const uniqueParts = Array.from(new Set(parts));
  const normalizedFontHeading =
    config.fontHeading === config.font ? "inherit" : config.fontHeading;
  const partialConfig: {
    menuColor?: DesignSystemConfig["menuColor"];
    menuAccent?: DesignSystemConfig["menuAccent"];
    tailwind?: {
      baseColor?: string;
    };
  } = {};
  const registryDependencies: string[] = [];
  const cssVars: NonNullable<RegistryItem["cssVars"]> = {};

  if (uniqueParts.includes("theme")) {
    const registryTheme = buildRegistryTheme(config);

    partialConfig.menuColor = config.menuColor;
    partialConfig.menuAccent = config.menuAccent;
    partialConfig.tailwind = {
      baseColor: config.baseColor,
    };

    if (registryTheme.cssVars.theme) {
      cssVars.theme = {
        ...(cssVars.theme ?? {}),
        ...registryTheme.cssVars.theme,
      };
    }
    cssVars.light = {
      ...(cssVars.light ?? {}),
      ...registryTheme.cssVars.light,
    };
    cssVars.dark = {
      ...(cssVars.dark ?? {}),
      ...registryTheme.cssVars.dark,
    };
  }

  if (uniqueParts.includes("font")) {
    registryDependencies.push(`font-${config.font}`);

    if (normalizedFontHeading !== "inherit") {
      registryDependencies.push(`font-heading-${normalizedFontHeading}`);
    } else {
      cssVars.theme = {
        ...(cssVars.theme ?? {}),
        "--font-heading": getInheritedHeadingFontValue(config.font),
      };
    }
  }

  return {
    name: `${config.base}-${config.style}-${uniqueParts.join("-")}`,
    extends: "none",
    type: "registry:base" as const,
    ...(Object.keys(partialConfig).length > 0 && { config: partialConfig }),
    ...(registryDependencies.length > 0 && { registryDependencies }),
    ...(Object.keys(cssVars).length > 0 && { cssVars }),
  } satisfies RegistryItem;
}
