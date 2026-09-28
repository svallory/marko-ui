// Shape of every `packages/shadcn/tests/behavior-coverage/<component>.ts`
// mapping module — how a behavior id (declared in
// apps/docs/src/demos/<component>/behaviors.ts) gets proven by an existing
// suite. See notes/behavior-coverage.md for why this mechanism (a separate
// mapping file, not a `covers: [...]` tag on the test itself) was chosen.
//
// A ProvingCheck locates a real vitest/Playwright assertion WITHOUT running
// the suite: `scripts/ci/behavior-coverage.ts` reads the mapping statically
// and cross-references it against `bunx vitest list --json` (test titles
// and file paths only, no execution) to confirm the check still exists. A
// mapping entry that points at a renamed or deleted test is a build error,
// not a silently-stale coverage number — see that script's "unknown
// reference" check.
export type ProvingCheckSource =
  | "vitest" // packages/shadcn/tests/behavior/*.test.ts, or any other vitest file
  | "hydration-invariant" // the C-4 per-component assertion in hydration-invariant.test.ts
  | "axe-scan" // scripts/ci/axe-scan.ts, scoped by component name + open/closed state
  | "visual-guard"; // e2e/gallery-visual.spec.ts or e2e/chrome-visual.spec.ts

export interface ProvingCheck {
  source: ProvingCheckSource;
  /**
   * vitest/hydration-invariant: the test file, relative to repo root.
   * axe-scan/visual-guard: the spec/script file that produces the check.
   */
  file: string;
  /**
   * vitest/hydration-invariant: the `describe` ancestor chain + `it` title,
   * outermost first, exactly as vitest's `ancestorTitles` + test name would
   * report it (matches scripts/ci/badge.ts's own matching approach).
   * axe-scan: the component name as it appears in DOCUMENTED_COMPONENTS.
   * visual-guard: the test title in the spec file.
   */
  title: string[];
}

export interface BehaviorCoverageEntry {
  /** Must match a `ComponentBehavior.id` declared in that component's behaviors.ts. */
  behaviorId: string;
  /** One or more checks that together prove this behavior. >=1 required for "covered". */
  provenBy: ProvingCheck[];
}
