/**
 * Removes a component's own (non-native) props from the leftover object that
 * Zag's `splitProps`/`contextProps` returns, leaving only the native element
 * attributes to spread onto the rendered element.
 *
 * This is the step after `<zag>` in the component contract (`<zag>` ->
 * nativeAttrs). `splitProps(input)[1]` is
 * everything the machine did NOT claim, which still includes this component's
 * own additive props — `class` (applied separately through `cn()`, so leaving
 * it here would emit the class twice), the sugar callbacks that back Marko's
 * two-way `bind` shorthand, attr-tag bodies (`trigger`, `content`, `item`),
 * `items=` array sugar, and variant props (`size`, `variant`). None of those
 * are valid DOM attributes, so all of them must be removed before the rest is
 * spread onto an element.
 *
 * Everything NOT listed survives, which is the point: consumer-supplied `id`,
 * `data-*`, `aria-*`, `title`, `tabindex` and form attributes keep flowing
 * through to the DOM untouched.
 *
 * `keys` is constrained to `keyof Source`, so a misspelled or stale key is a
 * compile error rather than a prop that silently starts leaking into the DOM.
 * The return type is `Omit<Source, Keys[number]>`, so the surviving attribute
 * surface stays fully typed at the call site — spreading the result onto an
 * element is checked exactly as the hand-written destructure was.
 *
 * To strip a key that is deliberately absent from `Source` (a defensive strip
 * of a prop the machine never declares — see `ui/checkbox` and its
 * `indeterminate` note), widen the source at the call site with
 * `as typeof input`. That cast is intentionally required: loosening `keys` to
 * accept arbitrary strings would make every misspelling in every other
 * component compile silently.
 *
 * @example
 * <const/nativeAttrs=() =>
 *   stripOwnProps(sliderMachine.splitProps(input)[1], "class", "valueChange")
 * >
 */
export function stripOwnProps<Source extends object, Keys extends readonly (keyof Source)[]>(
  source: Source,
  ...keys: Keys
): Omit<Source, Keys[number]> {
  const native = { ...source } as Record<PropertyKey, unknown>;
  for (const key of keys) delete native[key as PropertyKey];
  return native as Omit<Source, Keys[number]>;
}
