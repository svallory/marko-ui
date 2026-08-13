// URL-backed state core for the /create design-system container.
//
// The shadcn source keeps design-system state IN the URL via nuqs
// (`useQueryStates`) — components never own config state; they read the
// resolved params and write updates that re-encode into a `?preset=` code.
// This module reimplements that read/write contract on plain
// URLSearchParams + history.pushState/replaceState so the Marko container
// (design-system.marko) can own a single reactive `params` value derived
// from the URL:
//
// - `readDesignSystemParams()` = nuqs parse + resolvePresetParams (decode
//   `?preset=`, overlay explicit fontHeading/chartColor overrides,
//   normalize).
// - `computeRawUpdate()` = the exact branch logic of the source's
//   `setParams` (search-params.ts `useDesignSystemSearchParams`): partial
//   updates are normalized; if any design-system key is touched the merged
//   config is re-encoded via buildPresetUrlUpdate (preset code written,
//   individual design-system keys cleared); otherwise the update passes
//   through untouched (this is how `{ preset: code }` / `{ preset: null }`
//   writes from history-undo and open-preset work).
// - `applyRawUrlUpdate()` = nuqs's URL writer: null clears a key, values
//   equal to the param's default are cleared too (nuqs v2 `clearOnDefault`
//   default — this is why shadcn's /create URLs are a clean `?preset=x`),
//   and `history: "push" | "replace"` picks pushState vs replaceState.
//   Pickers commit with "push" (the source hook's default), undo/redo and
//   the one-time preset sync use "replace", both verbatim from source.
import {
  buildPresetUrlUpdate,
  DESIGN_SYSTEM_KEYS,
  DESIGN_SYSTEM_SEARCH_PARAM_DEFAULTS,
  normalizeDesignSystemParams,
  normalizePartialDesignSystemParams,
  parseDesignSystemSearchParams,
  resolvePresetParams,
  type DesignSystemSearchParams,
} from "./search-params"

export type UrlHistoryMode = "push" | "replace"

// Matches the source's LockableParam union (hooks/use-locks.tsx) exactly.
export type LockableParam =
  | "style"
  | "baseColor"
  | "theme"
  | "chartColor"
  | "iconLibrary"
  | "font"
  | "fontHeading"
  | "menuAccent"
  | "menuColor"
  | "radius"

export function getUrlSearchParams(): URLSearchParams {
  return new URLSearchParams(window.location.search)
}

// nuqs parse (raw params with defaults) + preset overlay + normalization.
export function readDesignSystemParams(): DesignSystemSearchParams {
  const searchParams = getUrlSearchParams()
  return resolvePresetParams(
    parseDesignSystemSearchParams(searchParams),
    searchParams
  )
}

// The settled preset code currently in the URL ("" when absent) — this is
// what the source's HistoryProvider records as a history entry.
export function getUrlPresetEntry(): string {
  return getUrlSearchParams().get("preset") ?? ""
}

// Port of the setParams branch logic from the source hook.
export function computeRawUpdate(
  current: DesignSystemSearchParams,
  updates: Partial<DesignSystemSearchParams> | Record<string, unknown>
): Record<string, unknown> {
  const resolvedUpdates = normalizePartialDesignSystemParams(
    updates as Partial<DesignSystemSearchParams>
  )

  const hasDesignSystemUpdate = DESIGN_SYSTEM_KEYS.some(
    (key) => key in resolvedUpdates
  )

  if (!hasDesignSystemUpdate) {
    // No design system change, pass through directly.
    return resolvedUpdates as Record<string, unknown>
  }

  // Merge current decoded values with updates, re-encode as a preset code.
  const merged = normalizeDesignSystemParams({
    ...current,
    ...resolvedUpdates,
  })
  return buildPresetUrlUpdate(merged, resolvedUpdates)
}

// nuqs URL writer: apply a raw update onto the current query string.
// null/undefined clears a key; values equal to the param default are
// cleared as well (nuqs v2 clearOnDefault).
export function applyRawUrlUpdate(
  update: Record<string, unknown>,
  historyMode: UrlHistoryMode
): void {
  const usp = getUrlSearchParams()
  const defaults = DESIGN_SYSTEM_SEARCH_PARAM_DEFAULTS as Record<
    string,
    unknown
  >

  for (const [key, value] of Object.entries(update)) {
    if (value === null || value === undefined) {
      usp.delete(key)
      continue
    }

    const str = String(value)
    const def = defaults[key]
    if (def !== undefined && String(def) === str) {
      usp.delete(key)
      continue
    }

    usp.set(key, str)
  }

  const qs = usp.toString()
  const url = qs
    ? `${window.location.pathname}?${qs}`
    : window.location.pathname

  if (historyMode === "replace") {
    window.history.replaceState(window.history.state, "", url)
  } else {
    window.history.pushState(window.history.state, "", url)
  }
}

// Shared editable-target guard used by every keyboard shortcut in the
// source hooks (use-history/use-random/use-reset/use-theme-toggle/
// use-open-preset all repeat this check verbatim).
export function isEditableTarget(target: EventTarget | null): boolean {
  return (
    (target instanceof HTMLElement && target.isContentEditable) ||
    target instanceof HTMLInputElement ||
    target instanceof HTMLTextAreaElement ||
    target instanceof HTMLSelectElement
  )
}
