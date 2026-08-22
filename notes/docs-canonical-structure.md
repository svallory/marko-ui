# Canonical docs page structure + upstream section map

Decided 2026-08-21 (session: parity v2). Source analysis:
`notes/shadcn-docs-section-taxonomy.md` (10-page sample) + full 64-page
styling-content sweep. Motivation: upstream's hierarchy is inconsistent
(demos flat against concepts; Styling/Theming/CSS Variables naming chaos;
four API-reference shapes). We define ONE stable hierarchy; the parity
checker verifies information PRESENCE, never location or naming.

## Component page hierarchy (fixed order)

1. **Header** — title, description, hero demo (`<component>-demo`).
   Upstream pre-installation framing essays become short prose here.
2. **Installation** — CLI + Manual tabs. Required wiring (providers) is
   steps INSIDE Installation, never elsewhere.
3. **Usage** — import + one minimal composed example.
4. **Concepts** — OPTIONAL, complex components only ("read before using"
   mental model; upstream "Core Concepts"). Guides remains "read when
   needing" task patterns. Keep rare so the hierarchy stays predictable.
5. **Anatomy** — upstream "Composition": tag tree, slots/attr-tags;
   sub-recipes as `###` may link into Examples (one-directional).
6. **Examples** — ALL demos as `###` under one section: variants, sizes,
   states, RTL demo. One-line prose + demo each.
7. **Styling** — parent section, subsections present only when non-empty:
   - `Styling > Data Attributes` (from the Zag machine; largely generated)
   - `Styling > CSS Variables` (only where the component defines vars)
   - `Styling > Recipes > #### {title}` (free-form override/custom-color
     recipes)
   - `Styling > Style Hooks` (`mu-*` classes) — IMPORT MODE ONLY (see
     toggle below).
8. **Guides** — conceptual/code-pattern sections without demo previews
   (controlled usage, custom-items patterns, virtualization).
9. **Accessibility** — always present: keyboard table + aria notes.
10. **API Reference** — always inlined, GENERATED from machine-props types
   (`extract:api`); optional "built on @zag-js/x" link. Never a bare
   link-out.
11. **Changelog / Migration** — optional tail.

**Guide-page exception** (Data Table class): page declares `type: guide` →
Intro / Installation / Prerequisites / Steps / Reusable Components. The
checker verifies step TOPICS covered, not component buckets.

## Copy/Import site toggle

Site-level distribution-mode toggle (copy | import), localStorage-backed,
implemented with the same contract as the theme toggle: inline no-FOUC
script stamps a class/attr on `<html>`; mode-specific blocks are CSS-gated
(both rendered — no hydration mismatch under resumability). Default: copy.
- Import mode reveals: `Styling > Style Hooks` (mu-* public styling API),
  package-import variants in Installation/Usage.
- Copy mode leads with `marko-ui add` everywhere; mu-* content hidden
  (classes are baked flat on the copy path — consumers never see them).

## Section metadata: distribution

Sections declare visibility via `distribution: "copy" | "import"` metadata
(default: both) in the page authoring format; the site toggle stamps
`data-distribution` on `<html>` and CSS gates the blocks. The MAP never
carries mode — upstream has no copy/import concept, import-only content is
ours-only, and the checker verifies presence in source where both modes
always exist.

## Upstream section map (coverage checker v3 input)

Global map, upstream heading slug → ARRAY of actions. Values may also be
an array of VARIANTS for slugs whose meaning differs per page (first match
wins; a variant without `when` is the default):

```ts
type MapVariant = {
  when?: { component?: string[]; hasDemoMarker?: boolean };
  actions: MapAction[];
}
```

The `when` context is deliberately tiny (component slug + marker presence —
the only signals the checker has); it is a matcher, not a rules DSL.

Action array schema:

```ts
// map: heading → MapAction[]
type MapAction =
  | { action: "move";    parent: string[]; title?: string }  // {title} template
  | { action: "rename";  title: string }
  | { action: "keep" }                                       // presence at root, own name
  | { action: "ignore";  reason: string }                    // must be the sole action
  | { action: "process"; mode: "llm"; prompt?: string }  // absent = ported as-is
  // process.mode "function" (registered transforms) is RESERVED, unimplemented.
```

- The map is the shared contract between the CHECKER (presence assertions)
  and the future PORTER (how content transforms — `process`).
- Validation: `ignore` alone; at most one placement action
  (`move`/`rename`/`keep`) per array.
- `move` with `parent: []` and omitted/identity title = noop at root;
  `keep` is the documented spelling for that.
- Per-page pathologies stay in `parity-ignore.json`, not this map.
- `process` without `prompt` uses the DEFAULT PROMPT (adapter-level
  template, `tooling/parity/process-prompt.md`): guides the LLM to adapt
  the section content to marko-ui and this port's specifics (React→Marko
  idioms, three-tag Zag pattern, mu-*/styles conventions, our canonical
  hierarchy), with the adapter injecting upstream/library context. An
  entry-level `prompt` is appended to (not replacing) the default, for
  section-specific guidance.

Seed entries:

```json
{
  "composition":   [{ "action": "move", "parent": ["anatomy"] }],
  "theming":       [{ "action": "move", "parent": ["styling"] }],
  "css-variables": [{ "action": "move", "parent": ["styling"], "title": "CSS Variables" }],
  "custom-colors": [{ "action": "move", "parent": ["styling", "recipes"] }],
  "rtl":           [{ "action": "move", "parent": ["examples"], "title": "RTL" }],
  "core-concepts": [{ "action": "keep" }],
  "migrating-from-vaul": [{ "action": "ignore", "reason": "React/Vaul-specific migration guide" }]
}
```

## Section classification (checker pipeline)

1. Explicit map entry wins.
2. No entry + body matches an adapter `demoMarker` → demo section: the
   referenced demo name joins the upstream demo set (checked by name in
   Examples); the heading itself is never interpreted. Demo markers are
   ADAPTER CONFIG, not code — shadcn adapter:
   `demoMarkers: [{ pattern: "<ComponentPreview name=\"(.+?)\"", nameGroup: 1 }]`.
   Porting a new library = writing new marker pattern(s).
2b. BUNDLER PRE-PASS (deterministic, before any LLM call): unclassified
   slugs equal to canonical bucket names are auto-proposed as `keep` in
   section-map.proposed.json and never reach the LLM batch.
3. Preview + substantial prose, or no preview and no entry → UNCLASSIFIED.
   Never guessed. An LLM classifier step (configurable cheap model;
   provider-agnostic) bundles ALL unclassified sections (heading + body
   excerpt) across components into one/few calls and writes
   `section-map.proposed.json` (proposed action arrays). A human promotes
   correct proposals into the canonical map and fixes the rest — proposals
   NEVER auto-apply. Skill guidance: assumes the harness supports
   subagents; classification requests must be bundled, not per-section.
   Classifier prompt rules (defects observed 2026-08-21): a heading that
   IS a bucket → keep, never move-into-itself; process is opt-in, never
   attached to keep by default; guide-page (type: guide) sections are out
   of the global map's scope.

## Checker v3 semantics (presence-only)

Flags ONLY:
1. An upstream demo name absent from our demos manifest.
2. An upstream section with content whose mapped target
   (bucket path / named subsection) is absent from our page.
Never flags: location, ordering, naming differences covered by the map,
ours-only additions (Accessibility, generated API, Style Hooks).

## Sequencing

1. Checker v3 (map + presence semantics) — unblocks honest parity runs.
2. Docs-page migration of 86 components to this hierarchy (bulk, agent).
3. Copy/Import toggle implementation (docs app feature).
4. Full parity rerun AFTER migration (running before = flags hundreds of
   intentional moves).
