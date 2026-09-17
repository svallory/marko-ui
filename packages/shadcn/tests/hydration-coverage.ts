/**
 * Which Zag-backed components the hydration-invariant suite covers.
 *
 * Plain data, deliberately NOT inside hydration-invariant.test.ts: the CI
 * badge script imports these, and importing a `.test.ts` executes vitest's
 * `describe()` at module load, which throws outside a vitest runner
 * (`TypeError: undefined is not an object (evaluating 'runner.config')`).
 *
 * hydration-invariant.test.ts re-exports these and guards them with
 * bookkeeping tests that compare them against the filesystem.
 */
import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

/**
 * How many Zag-backed components exist in packages/shadcn/ui/, covered or not.
 *
 * This literal is the CI badge's denominator. It is NOT the source of truth:
 * `findZagBackedComponents()` below reads the filesystem, and
 * hydration-invariant.test.ts asserts this number and both lists agree with
 * what is actually on disk. A 55th Zag-backed component therefore fails the
 * suite instead of silently keeping a stale denominator green.
 *
 * It stays a literal only because scripts/ci/badge.ts is a plain script that
 * runs from a vitest JSON report, with no repo checkout guarantees around it.
 *
 * Counted in COMPONENTS (directories), not files. An older comment said "58
 * Zag-backed component files", a different and also correct number: the toast
 * pair and the menu/submenu pairs of dropdown-menu, context-menu and menubar
 * are two files each. Components is the right unit here, since coverage is
 * per component route. Those two figures coexisting unexplained is what made
 * the public "33 of 54" claim look like an arithmetic error.
 */
export const ZAG_BACKED_COMPONENT_COUNT = 54;

/**
 * The Zag-backed components actually present on disk, read fresh.
 *
 * A component is Zag-backed when any `.marko` file directly inside its
 * directory uses the `<zag>` or `<zag-machine>` tag — the same signal the
 * suite's own documentation uses to define the population.
 *
 * Exists so the bookkeeping tests can compare the hand-maintained lists
 * against reality rather than against each other. The earlier version of
 * those tests only checked `covered.length + uncovered.length === 54`, an
 * arithmetic identity among three hand-edited values: a newly added
 * Zag-backed component that appeared in neither list kept every test green,
 * which is exactly the drift the guard was supposed to catch.
 */
export function findZagBackedComponents(uiDir: string): string[] {
  const zagTag = /<zag[\s/>]|<zag-machine[\s/>]/;
  const names = new Set<string>();

  for (const entry of readdirSync(uiDir, { withFileTypes: true })) {
    if (!entry.isDirectory()) continue;
    const componentDir = join(uiDir, entry.name);
    const usesZag = readdirSync(componentDir).some(
      (file) =>
        file.endsWith(".marko") &&
        zagTag.test(readFileSync(join(componentDir, file), "utf8")),
    );
    if (usesZag) names.add(entry.name);
  }

  return [...names].sort();
}

/** packages/shadcn/ui/, resolved from this file rather than the cwd. */
export const UI_DIR = fileURLToPath(new URL("../ui", import.meta.url));

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
