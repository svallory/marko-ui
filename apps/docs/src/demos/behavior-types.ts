// Shape of every `src/demos/<component>/behaviors.ts` module — the source
// of truth for behavior coverage (issue #72). Colocated with docs.ts because
// a behavior is a documented claim about the component, same audience as
// the docs examples it's usually derived from.
//
// A behavior list is NOT test cases. It states what the component does,
// independent of whether anything currently checks it — an unproven
// behavior stays in the list with no `it` written for it; deleting it to
// make coverage look better defeats the point of the badge (issue #72's
// whole premise is "which documented behaviors are proven", so a shrunk
// list just lies in a different direction).

/**
 * What kind of claim a behavior makes. Drives no logic today — it's for
 * humans scanning the list and for a future per-kind coverage breakdown.
 */
export type BehaviorKind =
  | "interaction" // pointer/click-driven state changes
  | "keyboard" // WAI-ARIA APG keyboard contract
  | "a11y" // roles, aria-*, accessible name/description
  | "ssr-hydration" // SSR-rendered attributes survive hydration unchanged
  | "visual" // rendering/layout guarded by a screenshot
  | "api"; // a documented prop's effect (e.g. `disabled` disables)

export interface ComponentBehavior {
  /**
   * Stable id, `<component>/<kind-folder>/<slug>`. The kind-folder segment
   * is one of BehaviorKind's string values (not necessarily equal to `kind`
   * below in edge cases, but keep them in sync — see notes/behavior-coverage.md).
   * Stability matters: the mapping file references this id verbatim, and
   * renaming a behavior without updating every reference is exactly the
   * silent-drift failure the mapping format is designed to reject.
   */
  id: string;
  kind: BehaviorKind;
  /** One sentence: what the component does, phrased as an observable fact. */
  description: string;
  /**
   * Where this behavior comes from — cite the zag machine prop/method, the
   * docs example name, or the WAI-ARIA APG pattern section. Free text, but
   * required: an undersourced behavior list is how this rots.
   */
  source: string;
}
