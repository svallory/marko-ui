/**
 * Which Zag-backed components the hydration-invariant suite covers.
 *
 * Plain data, deliberately NOT inside hydration-invariant.test.ts: the CI
 * badge script imports these, and importing a `.test.ts` executes vitest's
 * `describe()` at module load, which throws outside a vitest runner
 * (`TypeError: undefined is not an object (evaluating 'runner.config')`).
 *
 * hydration-invariant.test.ts re-exports these and guards them with a
 * bookkeeping test that fails if the two lists stop accounting for every
 * Zag-backed component.
 */

/**
 * Every Zag-backed component in packages/shadcn/ui/, covered or not.
 *
 * Derived, not guessed — the count of component DIRECTORIES whose source
 * uses `<zag>` or `<zag-machine>`:
 *
 *   grep -rlE '<zag[ /]|<zag-machine' packages/shadcn/ui/../*.marko \
 *     | xargs -n1 dirname | sort -u | wc -l   # -> 54
 *
 * An older comment in the suite said "58 Zag-backed component files", a
 * different (also correct) number counting FILES: the toast pair and the
 * menu/submenu pairs of dropdown-menu, context-menu and menubar are two
 * files each. Components is the right unit here, since coverage is per
 * component route. Those two figures coexisting unexplained is what made the
 * public "33 of 54" claim look like an arithmetic error.
 */
export const ZAG_BACKED_COMPONENT_COUNT = 54;

/**
 * The Zag-backed components NOT yet covered by the suite.
 *
 * A real coverage gap in constraint C-4, not a deliberate exclusion. Several
 * are measurement-heavy (color-picker, image-cropper, signature-pad,
 * floating-panel) and will likely need ALLOWED_DIFFERENCES entries the way
 * carousel does.
 *
 * Kept as data rather than prose so the CI badge can report real coverage
 * instead of a self-fulfilling "N/N": the badge's denominator used to be the
 * number of tests that ran, which can only ever equal the number that
 * passed, so it published "33/33 identical" and read as full coverage.
 */
export const UNCOVERED_ZAG_COMPONENTS = [
  "angle-slider",
  "cascade-select",
  "color-picker",
  "date-input",
  "editable",
  "floating-panel",
  "image-cropper",
  "listbox",
  "marquee",
  "navigation-menu",
  "number-input",
  "password-input",
  "qr-code",
  "rating-group",
  "scroll-area",
  "signature-pad",
  "steps",
  "tags-input",
  "timer",
  "toc",
  "tour",
] as const;

/**
 * The Zag-machine-backed components currently covered by the suite.
 *
 * Add a component here once its route is verified, and remove it from
 * UNCOVERED_ZAG_COMPONENTS — the bookkeeping test fails otherwise.
 */
export const INTERACTIVE_COMPONENTS = [
  "accordion",
  "alert-dialog",
  "avatar",
  "calendar",
  "carousel",
  "checkbox",
  "clipboard",
  "collapsible",
  "combobox",
  "command",
  "context-menu",
  "date-picker",
  "dialog",
  "drawer",
  "dropdown-menu",
  "file-upload",
  "hover-card",
  "input-otp",
  "menubar",
  "pagination",
  "popover",
  "progress",
  "radio-group",
  "resizable",
  "select",
  "sheet",
  "slider",
  "switch",
  "tabs",
  "toggle-group",
  "tooltip",
  "tree-view",
  "toast",
] as const;
