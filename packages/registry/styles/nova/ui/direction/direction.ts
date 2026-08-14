// Port of Base UI's `useDirection()` hook (re-exported by shadcn's
// direction.tsx). Marko has no React-context equivalent, so `<DirectionProvider>`
// (direction-provider.marko) sets a real `dir` attribute on a wrapper element
// instead of stashing the value in context. `getDirection()` below recovers
// the "effective" direction for any descendant node the same way
// `useDirection()` would resolve it — by walking up the DOM to the nearest
// ancestor carrying `dir="ltr"` / `dir="rtl"` — falling back to `"ltr"` when
// no such ancestor exists (Base UI's own default).
//
// This is intentionally NOT a Marko hook/tag: reading "the current text
// direction" is a DOM query keyed off a node, not reactive component state,
// so a plain function mirrors the one real capability the source exposes
// without inventing machinery Marko has no primitive for.
export type Direction = "ltr" | "rtl";

/**
 * Resolves the effective text direction for `element` by walking up to the
 * nearest ancestor (inclusive) with an explicit `dir="ltr"|"rtl"` attribute,
 * mirroring Base UI's `useDirection()` context lookup. Returns `"ltr"` when
 * no such ancestor exists, matching Base UI's default.
 */
export function getDirection(element: Element | null | undefined): Direction {
  const match = element?.closest<HTMLElement>("[dir]");
  return match?.getAttribute("dir") === "rtl" ? "rtl" : "ltr";
}
