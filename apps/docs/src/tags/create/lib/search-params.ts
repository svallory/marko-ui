// Plain-TS port of shadcn/ui's create-page search-params.ts.
//
// The original uses nuqs (`useQueryStates`) plus Next.js `useSearchParams` to
// bind design-system state to the URL as a React hook. This is a Marko 6 /
// Vite app with no nuqs and no React, so the nuqs-specific plumbing
// (createLoader/createSerializer/parseAsX/useQueryStates/useDesignSystemSearchParams)
// is replaced with plain parse/serialize functions operating on
// URLSearchParams. All pure logic (resolvePresetParams, buildPresetUrlUpdate,
// normalizeDesignSystemParams, normalizePartialDesignSystemParams,
// isTranslucentMenuColor, DESIGN_SYSTEM_KEYS, NON_DESIGN_SYSTEM_KEYS) is
// ported with identical behavior so a Marko state container can reimplement
// the `useDesignSystemSearchParams` hook logic on top of these exports.
import { decodePreset, isPresetCode } from "./preset"
import {
  BASE_COLORS,
  BASES,
  DEFAULT_CONFIG,
  getThemesForBaseColor,
  iconLibraries,
  MENU_ACCENTS,
  MENU_COLORS,
  RADII,
  STYLES,
  THEMES,
  type BaseColorName,
  type BaseName,
  type ChartColorName,
  type FontHeadingValue,
  type FontValue,
  type IconLibraryName,
  type MenuAccentValue,
  type MenuColorValue,
  type RadiusValue,
  type StyleName,
  type ThemeName,
} from "./registry-config"
import { FONTS } from "./fonts"
import { getPresetCode } from "./preset-code"
import { resolvePresetOverrides } from "./preset-query"

export const TEMPLATE_VALUES = [
  "next",
  "next-monorepo",
  "start",
  "start-monorepo",
  "react-router",
  "react-router-monorepo",
  "vite",
  "vite-monorepo",
  "astro",
  "astro-monorepo",
  "laravel",
] as const

export type TemplateValue = (typeof TEMPLATE_VALUES)[number]

// Full shape of the design system search params, with defaults resolved.
export type DesignSystemSearchParams = {
  preset: string
  base: BaseName
  item: string
  iconLibrary: IconLibraryName
  style: StyleName
  theme: ThemeName
  chartColor: ChartColorName
  font: FontValue
  fontHeading: FontHeadingValue
  baseColor: BaseColorName
  menuAccent: MenuAccentValue
  menuColor: MenuColorValue
  radius: RadiusValue
  template: TemplateValue
  rtl: boolean
  pointer: boolean
  size: number
  custom: boolean
}

// Defaults mirror the nuqs `.withDefault(...)` values in the original.
export const DESIGN_SYSTEM_SEARCH_PARAM_DEFAULTS: DesignSystemSearchParams = {
  preset: "b0",
  base: DEFAULT_CONFIG.base,
  // Mirrors shadcn's parseAsString.withDefault("preview-02") — our
  // position-named equivalent page; the preview route renders the
  // preview-page-1/2/3 showcase pages.
  item: "preview-page-1",
  iconLibrary: DEFAULT_CONFIG.iconLibrary,
  style: DEFAULT_CONFIG.style,
  theme: DEFAULT_CONFIG.theme,
  chartColor: (DEFAULT_CONFIG.chartColor ?? "neutral") as ChartColorName,
  font: DEFAULT_CONFIG.font,
  fontHeading: DEFAULT_CONFIG.fontHeading,
  baseColor: DEFAULT_CONFIG.baseColor,
  menuAccent: DEFAULT_CONFIG.menuAccent,
  menuColor: DEFAULT_CONFIG.menuColor,
  radius: "default" as RadiusValue,
  template: "next",
  rtl: false,
  pointer: false,
  size: 100,
  custom: false,
}

// Design system param keys that get encoded into the preset code.
export const DESIGN_SYSTEM_KEYS = [
  "style",
  "baseColor",
  "theme",
  "chartColor",
  "iconLibrary",
  "font",
  "fontHeading",
  "radius",
  "menuAccent",
  "menuColor",
] as const

// Non-design-system keys that get passed through as-is.
// `base` is not encoded in preset codes — it's an architectural choice, not visual.
export const NON_DESIGN_SYSTEM_KEYS = [
  "base",
  "item",
  "preset",
  "template",
  "rtl",
  "pointer",
  "size",
  "custom",
] as const

function normalizeFontHeading(
  font: FontValue,
  fontHeading: FontHeadingValue
): FontHeadingValue {
  // Persist "same as body" as an explicit inherit sentinel so the body font
  // can change later without freezing headings to a concrete previous value.
  return fontHeading === font ? "inherit" : fontHeading
}

export function isTranslucentMenuColor(
  menuColor?: MenuColorValue | null
): menuColor is "default-translucent" | "inverted-translucent" {
  return (
    menuColor === "default-translucent" || menuColor === "inverted-translucent"
  )
}

export function normalizePartialDesignSystemParams(
  params: Partial<DesignSystemSearchParams>
): Partial<DesignSystemSearchParams> {
  if (
    params.menuAccent === "bold" &&
    isTranslucentMenuColor(params.menuColor ?? undefined)
  ) {
    return {
      ...params,
      menuAccent: "subtle",
    }
  }

  return params
}

export function normalizeDesignSystemParams(
  params: DesignSystemSearchParams
): DesignSystemSearchParams {
  let result = {
    ...params,
    fontHeading: normalizeFontHeading(params.font, params.fontHeading),
  }

  // Validate theme and chartColor against baseColor.
  if (result.baseColor) {
    const available = getThemesForBaseColor(result.baseColor)
    const themeValid = available.some((t) => t.name === result.theme)
    const chartColorValid = available.some((t) => t.name === result.chartColor)

    if (!themeValid || !chartColorValid) {
      const fallback = (available[0]?.name ?? result.baseColor) as ThemeName
      result = {
        ...result,
        ...(!themeValid && { theme: fallback }),
        ...(!chartColorValid && { chartColor: fallback as ChartColorName }),
      }
    }
  }

  if (
    result.menuAccent === "bold" &&
    isTranslucentMenuColor(result.menuColor)
  ) {
    return {
      ...result,
      menuAccent: "subtle",
    }
  }

  return result
}

// If preset param exists, decode it and overlay on raw params.
// V1 presets don't encode chartColor — fall back to the colored
// theme that base-color themes originally borrowed charts from.
type SearchParamsLike = Pick<URLSearchParams, "get" | "has">

export function resolvePresetParams(
  rawParams: DesignSystemSearchParams,
  searchParams: SearchParamsLike
) {
  if (rawParams.preset && isPresetCode(rawParams.preset)) {
    const decoded = decodePreset(rawParams.preset)
    if (decoded) {
      const presetOverrides = resolvePresetOverrides(searchParams, decoded)
      return normalizeDesignSystemParams({
        ...decoded,
        ...presetOverrides,
        base: rawParams.base,
        item: rawParams.item,
        preset: rawParams.preset,
        template: rawParams.template,
        rtl: rawParams.rtl,
        pointer: rawParams.pointer,
        size: rawParams.size,
        custom: rawParams.custom,
      } as DesignSystemSearchParams)
    }
  }
  return normalizeDesignSystemParams(rawParams)
}

export function buildPresetUrlUpdate(
  merged: DesignSystemSearchParams,
  resolvedUpdates: Partial<DesignSystemSearchParams> = {}
) {
  const code = getPresetCode(merged)
  const rawUpdate: Record<string, unknown> = { preset: code }

  for (const key of DESIGN_SYSTEM_KEYS) {
    rawUpdate[key] = null
  }

  for (const key of NON_DESIGN_SYSTEM_KEYS) {
    if (key === "preset") {
      continue
    }

    rawUpdate[key] =
      key in resolvedUpdates
        ? (resolvedUpdates as Record<string, unknown>)[key]
        : merged[key as keyof DesignSystemSearchParams]
  }

  return rawUpdate
}

// ---------------------------------------------------------------------------
// Plain parse/serialize replacement for nuqs's createLoader/createSerializer.
// ---------------------------------------------------------------------------

const VALID_BASES = BASES.map((b) => b.name)
const VALID_ICON_LIBRARIES = Object.values(iconLibraries).map((i) => i.name)
const VALID_STYLES = STYLES.map((s) => s.name)
const VALID_THEMES = THEMES.map((t) => t.name)
const VALID_FONTS = FONTS.map((f) => f.value)
const VALID_FONT_HEADINGS = ["inherit", ...VALID_FONTS]
const VALID_BASE_COLORS = BASE_COLORS.map((b) => b.name)
const VALID_MENU_ACCENTS = MENU_ACCENTS.map((a) => a.value)
const VALID_MENU_COLORS = MENU_COLORS.map((m) => m.value)
const VALID_RADII = RADII.map((r) => r.name)

function parseStringLiteral<T extends string>(
  raw: string | null,
  valid: readonly string[],
  fallback: T
): T {
  if (raw !== null && (valid as readonly string[]).includes(raw)) {
    return raw as T
  }
  return fallback
}

function parseBoolean(raw: string | null, fallback: boolean): boolean {
  if (raw === null) return fallback
  return raw === "true"
}

function parseIntegerParam(raw: string | null, fallback: number): number {
  if (raw === null) return fallback
  const n = Number.parseInt(raw, 10)
  return Number.isFinite(n) ? n : fallback
}

// Parses raw search params into a fully-defaulted DesignSystemSearchParams.
// Equivalent to nuqs's `loadDesignSystemSearchParams` (createLoader), minus
// preset decoding — call resolvePresetParams afterward to apply preset
// overlay + normalization, matching the original hook's two-step flow.
export function parseDesignSystemSearchParams(
  searchParams: URLSearchParams
): DesignSystemSearchParams {
  const d = DESIGN_SYSTEM_SEARCH_PARAM_DEFAULTS

  return {
    preset: searchParams.get("preset") ?? d.preset,
    base: parseStringLiteral(searchParams.get("base"), VALID_BASES, d.base),
    item: searchParams.get("item") ?? d.item,
    iconLibrary: parseStringLiteral(
      searchParams.get("iconLibrary"),
      VALID_ICON_LIBRARIES,
      d.iconLibrary
    ),
    style: parseStringLiteral(searchParams.get("style"), VALID_STYLES, d.style),
    theme: parseStringLiteral(searchParams.get("theme"), VALID_THEMES, d.theme),
    chartColor: parseStringLiteral(
      searchParams.get("chartColor"),
      VALID_THEMES,
      d.chartColor
    ),
    font: parseStringLiteral(searchParams.get("font"), VALID_FONTS, d.font),
    fontHeading: parseStringLiteral(
      searchParams.get("fontHeading"),
      VALID_FONT_HEADINGS,
      d.fontHeading
    ),
    baseColor: parseStringLiteral(
      searchParams.get("baseColor"),
      VALID_BASE_COLORS,
      d.baseColor
    ),
    menuAccent: parseStringLiteral(
      searchParams.get("menuAccent"),
      VALID_MENU_ACCENTS,
      d.menuAccent
    ),
    menuColor: parseStringLiteral(
      searchParams.get("menuColor"),
      VALID_MENU_COLORS,
      d.menuColor
    ),
    radius: parseStringLiteral(searchParams.get("radius"), VALID_RADII, d.radius),
    template: parseStringLiteral(
      searchParams.get("template"),
      TEMPLATE_VALUES,
      d.template
    ),
    rtl: parseBoolean(searchParams.get("rtl"), d.rtl),
    pointer: parseBoolean(searchParams.get("pointer"), d.pointer),
    size: parseIntegerParam(searchParams.get("size"), d.size),
    custom: parseBoolean(searchParams.get("custom"), d.custom),
  }
}

// Serializes a (partial) DesignSystemSearchParams into a query string.
// Equivalent to nuqs's `serializeDesignSystemSearchParams` (createSerializer).
// - `null` values are omitted (matches nuqs's "null clears the key" behavior,
//   used by buildPresetUrlUpdate to strip individual design-system keys).
// - `undefined` values are omitted.
// - Values equal to the default are still written, matching createSerializer's
//   behavior of always emitting explicitly-passed keys.
export function serializeDesignSystemSearchParams(
  params: Partial<DesignSystemSearchParams> | Record<string, unknown>
): string {
  const usp = new URLSearchParams()

  for (const [key, value] of Object.entries(params)) {
    if (value === null || value === undefined) {
      continue
    }
    usp.set(key, String(value))
  }

  const qs = usp.toString()
  return qs ? `?${qs}` : ""
}
