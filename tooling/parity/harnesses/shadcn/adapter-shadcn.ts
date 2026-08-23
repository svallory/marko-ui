/**
 * adapter-shadcn.ts — upstream-library-specific config for the coverage
 * checker's classification pipeline (coverage.ts). Everything that is
 * specific to *how shadcn's docs source marks up a demo* lives here, not
 * in coverage.ts, so porting the checker to a different upstream library
 * is "write a new adapter", not "edit the classifier".
 *
 * See notes/docs-canonical-structure.md, "Section classification (checker
 * pipeline)", step 2: a demo marker is a regex whose match implies "this
 * section's body embeds a live demo reference", and whose captured group
 * names the demo (compared, by name, against our demos manifest — the
 * heading text itself is never interpreted).
 */

export interface DemoMarker {
  /** Regex source (no flags — the checker always applies it with "g"). Must contain a capturing group. */
  pattern: string;
  /** Which capturing group (1-based) holds the demo name. */
  nameGroup: number;
}

export interface AdapterConfig {
  /** Human-readable name, used in error/report messages. */
  name: string;
  /** Patterns whose match against a section body means "this section embeds a demo". */
  demoMarkers: DemoMarker[];
}

/**
 * shadcn (base-ui flavor) adapter: demos are embedded via
 * `<ComponentPreview ... name="<demo-name>" .../>` (attribute order varies —
 * `name` is not always first, see bubble.mdx's multi-line usage), so the
 * pattern only anchors on the opening tag and searches its attributes for
 * `name="..."` rather than assuming immediate adjacency.
 */
export const shadcnAdapter: AdapterConfig = {
  name: "shadcn",
  demoMarkers: [{ pattern: '<ComponentPreview\\b[^>]*?\\bname="([^"]+)"', nameGroup: 1 }],
};

/** Compiles a DemoMarker into a RegExp with the "g" flag (dotAll off — attrs are single-line-ish but tags can wrap; "s" flag included so multi-line attribute lists still match). */
export function compileDemoMarker(marker: DemoMarker): RegExp {
  return new RegExp(marker.pattern, "gs");
}

/** True if `body` contains a match for ANY of the adapter's demo markers. */
export function bodyMatchesDemoMarker(adapter: AdapterConfig, body: string): boolean {
  return adapter.demoMarkers.some((marker) => compileDemoMarker(marker).test(body));
}

/** All demo names referenced by `body` across all of the adapter's demo markers, in match order. */
export function extractDemoNamesFromBody(adapter: AdapterConfig, body: string): string[] {
  const names: string[] = [];
  for (const marker of adapter.demoMarkers) {
    const regex = compileDemoMarker(marker);
    let match: RegExpExecArray | null;
    while ((match = regex.exec(body))) {
      const name = match[marker.nameGroup];
      if (name) names.push(name);
    }
  }
  return names;
}
