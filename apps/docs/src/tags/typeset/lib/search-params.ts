// Ported from shadcn/ui app/(app)/(typeset)/lib/search-params.ts.
//
// Verbatim data: TYPESET_PARAMS_MESSAGE, TYPESET_SIZES, TYPESET_LEADINGS,
// TYPESET_FLOWS, TYPESET_MEASURES, TYPESET_PARAM_VALUES (the one source of
// truth for what each param accepts), every default, TYPESET_PARAM_KEYS,
// coerceTypesetValue, parseTypesetSnapshot.
//
// Deviation — the nuqs runtime: upstream builds parsers with
// `parseAsStringLiteral(...).withDefault(...)` and reads/writes them through
// `useQueryStates`. There is no nuqs here, so the same contract is
// reimplemented on plain URLSearchParams + history.replaceState, exactly the
// way /create's port already does it (see ../../create/lib/
// design-system-state.ts, which documents the mapping in detail):
//   parseAsStringLiteral(...).withDefault(d)  → parseTypesetSearchParams()
//     (unknown/absent value falls back to the default)
//   createSerializer(...)                     → serializeTypesetSearchParams()
//   useTypesetSearchParams()                  → readTypesetParams() +
//     applyTypesetUrlUpdate(), owned by the typeset-app.marko container
//     (Marko has no context; one container owns the reactive `params`).
// nuqs v2's clearOnDefault behavior (a value equal to its default is dropped
// from the query string) is preserved in both the serializer and the writer,
// which is why typeset URLs stay short.
import { AVAILABLE_CONTENT_OPTIONS } from "./fixtures"
import { FONTS } from "./fonts"

export const TYPESET_PARAMS_MESSAGE = "typeset-params"

export const TYPESET_SIZES = [
  { value: "14", label: "14px" },
  { value: "15", label: "15px" },
  { value: "16", label: "16px" },
  { value: "18", label: "18px" },
] as const

export const TYPESET_LEADINGS = [
  { value: "1.6", label: "Tight (1.6)" },
  { value: "1.75", label: "Regular (1.75)" },
  { value: "1.9", label: "Loose (1.9)" },
] as const

export const TYPESET_FLOWS = [
  { value: "1em", label: "Compact (1em)" },
  { value: "1.25em", label: "Regular (1.25em)" },
  { value: "2em", label: "Airy (2em)" },
] as const

export const TYPESET_MEASURES = [
  { value: "60", label: "60ch", width: "28em" },
  { value: "70", label: "70ch", width: "33em" },
  { value: "80", label: "80ch", width: "37em" },
  { value: "90", label: "90ch", width: "42em" },
] as const

// The one source of truth for what each param accepts. The parsers, the
// history restorer, and the picker coercion all read from here.
const TYPESET_PARAM_VALUES = {
  body: FONTS.map((font) => font.id),
  heading: ["inherit", ...FONTS.map((font) => font.id)],
  mono: FONTS.map((font) => font.id),
  scale: TYPESET_SIZES.map((option) => option.value),
  measure: TYPESET_MEASURES.map((option) => option.value),
  flow: TYPESET_FLOWS.map((option) => option.value),
  leading: TYPESET_LEADINGS.map((option) => option.value),
  item: AVAILABLE_CONTENT_OPTIONS.map((option) => option.value),
} as Record<string, readonly string[]>

export type TypesetSearchParams = {
  body: string
  heading: string
  mono: string
  scale: string
  measure: string
  flow: string
  leading: string
  item: string
}

export const TYPESET_SEARCH_PARAM_DEFAULTS: TypesetSearchParams = {
  body: "geist",
  heading: "inherit",
  mono: "geist-mono",
  scale: "15",
  measure: "80",
  flow: "1.25em",
  leading: "1.75",
  item: "docs",
}

export const TYPESET_PARAM_KEYS = Object.keys(
  TYPESET_SEARCH_PARAM_DEFAULTS
) as (keyof TypesetSearchParams)[]

// Narrows a raw string to the param's literal union, or null if invalid.
export function coerceTypesetValue<K extends keyof TypesetSearchParams>(
  key: K,
  value: string
) {
  return TYPESET_PARAM_VALUES[key].includes(value)
    ? (value as TypesetSearchParams[K])
    : null
}

// nuqs parseAsStringLiteral(...).withDefault(...): unknown or absent values
// resolve to the default.
export function parseTypesetSearchParams(
  searchParams: URLSearchParams
): TypesetSearchParams {
  const parsed = {} as Record<string, string>
  for (const key of TYPESET_PARAM_KEYS) {
    const raw = searchParams.get(key)
    parsed[key] =
      (raw !== null ? coerceTypesetValue(key, raw) : null) ??
      TYPESET_SEARCH_PARAM_DEFAULTS[key]
  }
  return parsed as TypesetSearchParams
}

// nuqs createSerializer: builds `${base}?${query}`, dropping any value equal
// to its default (clearOnDefault).
export function serializeTypesetSearchParams(
  base: string,
  values: Partial<TypesetSearchParams>
) {
  const searchParams = new URLSearchParams()
  for (const key of TYPESET_PARAM_KEYS) {
    const value = values[key]
    if (value === undefined || value === null) {
      continue
    }
    if (value === TYPESET_SEARCH_PARAM_DEFAULTS[key]) {
      continue
    }
    searchParams.set(key, value)
  }
  const query = searchParams.toString()
  return query ? `${base}?${query}` : base
}

// History snapshots restore through here: values are validated against the
// param model, unknown keys are dropped, and absent keys become null so
// defaults clear.
export function parseTypesetSnapshot(raw: string) {
  let parsed: Record<string, unknown> = {}
  try {
    const json: unknown = JSON.parse(raw)
    if (json && typeof json === "object" && !Array.isArray(json)) {
      parsed = json as Record<string, unknown>
    }
  } catch {
    // Malformed entries restore as all-null, clearing back to defaults.
  }
  const snapshot: Record<string, string | null> = {}
  for (const key of TYPESET_PARAM_KEYS) {
    const value = parsed[key]
    snapshot[key] =
      typeof value === "string" ? coerceTypesetValue(key, value) : null
  }
  return snapshot as {
    [K in keyof TypesetSearchParams]: TypesetSearchParams[K] | null
  }
}

export function getTypesetUrlSearchParams(): URLSearchParams {
  return new URLSearchParams(window.location.search)
}

export function readTypesetParams(): TypesetSearchParams {
  return parseTypesetSearchParams(getTypesetUrlSearchParams())
}

// nuqs's URL writer, with the hook's `history: "replace"` default (see the
// upstream useTypesetSearchParams options). null clears a key; a value equal
// to the param default is cleared too (clearOnDefault).
export function applyTypesetUrlUpdate(
  update: Partial<Record<keyof TypesetSearchParams, string | null>>
): void {
  const searchParams = getTypesetUrlSearchParams()

  for (const [key, value] of Object.entries(update)) {
    if (value === null || value === undefined) {
      searchParams.delete(key)
      continue
    }
    if (value === TYPESET_SEARCH_PARAM_DEFAULTS[key as keyof TypesetSearchParams]) {
      searchParams.delete(key)
      continue
    }
    searchParams.set(key, value)
  }

  const query = searchParams.toString()
  const url = query
    ? `${window.location.pathname}?${query}`
    : window.location.pathname
  window.history.replaceState(window.history.state, "", url)
}

// setParams(null) upstream clears every managed key back to its default.
export function clearTypesetUrlParams(): void {
  const update: Record<string, null> = {}
  for (const key of TYPESET_PARAM_KEYS) {
    update[key] = null
  }
  applyTypesetUrlUpdate(update)
}

// Shared editable-target guard, repeated verbatim in every upstream
// keyboard-shortcut hook (use-history / use-theme-toggle / main-menu).
export function isEditableTarget(target: EventTarget | null): boolean {
  return (
    (target instanceof HTMLElement && target.isContentEditable) ||
    target instanceof HTMLInputElement ||
    target instanceof HTMLTextAreaElement ||
    target instanceof HTMLSelectElement
  )
}
