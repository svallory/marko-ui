# classify-prompt.md — unclassified section classification template

This is a ready prompt template for an LLM classification pass over
`parity-report/unclassified.json` (written by `coverage.ts` every run —
see `tooling/parity/SCHEMA.md`, "Unclassified pipeline"). It is a
**template only**: this repo's tooling does NOT call any LLM provider.
Bundling all unclassified sections into one/few calls and writing the
proposal file is the harness/skill layer's job (see
`notes/docs-canonical-structure.md`, "Section classification (checker
pipeline)" step 3 — "an LLM classifier step ... bundles ALL unclassified
sections ... across components into one/few calls").

## What "unclassified" means

`coverage.ts`'s classification pipeline puts an upstream section here
when:

- there is no `section-map.ts` entry for its heading, AND
- either it has no demo-marker match at all, OR it has a demo-marker
  match but the surrounding prose exceeds `PROSE_THRESHOLD_CHARS` (400
  chars of prose, excluding fenced code blocks and the demo-marker tag
  itself — see `coverage.ts`'s `proseLength`).

Unclassified sections are **never drift** — they don't fail the check,
with or without `--strict`. They're a queue of upstream sections nobody
has decided how to map yet.

## Input: `parity-report/unclassified.json`

```ts
interface UnclassifiedEntry {
  component: string        // e.g. "combobox"
  heading: string           // the raw upstream heading text, e.g. "Custom Items"
  bodyExcerpt: string       // body text, truncated to <=500 chars
}
```

## Output: `section-map.proposed.json`

Same logical shape as `section-map.ts`'s `SectionMap` (see SCHEMA.md),
but written as JSON and proposals ONLY — this file STAYS JSON (an LLM
target format, easy to diff/review) even though the canonical map is now
a typed TS module. A human reviews and promotes correct entries into the
real `section-map.ts` by hand. Proposals never auto-apply.

**JSON → TS promotion.** A proposal's `when`, if present, uses the
declarative object form `{ component?: string[]; hasDemoMarker?: boolean }`
— not a predicate function, since JSON can't carry code. When a human
promotes a reviewed proposal into `section-map.ts`, that declarative
object is converted into a `(ctx: SectionContext) => boolean` predicate:
each declarative key becomes one `&&`-ed condition. See SCHEMA.md's
"JSON proposals → TS promotion" for worked examples of this conversion.

```json
{
  "map": {
    "some-heading-slug": [{ "action": "move", "parent": ["styling"], "title": "Some Heading" }]
  }
}
```

## The prompt

Paste the full contents of `parity-report/unclassified.json` where
indicated, then send this prompt (bundled — one call for as many entries
as fit the model's context, not one call per section) to a cheap,
provider-agnostic model of your choice:

```
You are proposing entries for marko-ui's parity-checker section map. This
map tells the coverage checker where each unmapped upstream (shadcn.com)
docs section's content should live in OUR canonical component-page
hierarchy, so the checker can verify presence instead of flagging every
naming/location difference as drift.

## Canonical hierarchy (fixed order; only Concepts is optional)

1. Header  2. Installation  3. Usage  4. Concepts (optional, complex
components only)  5. Anatomy (upstream "Composition")  6. Examples (ALL
demos, as ### subsections)  7. Styling (subsections: Data Attributes, CSS
Variables, Recipes, Style Hooks — present only when non-empty)
8. Guides (conceptual/pattern sections with no demo preview)
9. Accessibility  10. API Reference  11. Changelog / Migration

## Action schema (MapAction — apply as an ARRAY per heading)

- { "action": "move", "parent": ["<bucket>", ...], "title"?: "<display title>" }
- { "action": "rename", "title": "<display title>" }   // stays at root, renamed
- { "action": "keep" }                                  // stays at root, own name
- { "action": "ignore", "reason": "<why>" }              // MUST be the sole action in the array
- { "action": "process", "mode": "llm", "prompt"?: "<porter instruction>" }
  // optional, in ADDITION to a placement action — tells a future porter
  // step how to transform the content when copying it in. Omit entirely
  // when the content can be used as-is.

Rules: "ignore" must be alone. At most one placement action (move/rename/
keep) per array. Never invent a new action name.

## Classification rules exposed by past mistakes

(a) **A heading that already IS a canonical bucket name → "keep". A
heading that BECOMES a subsection of a bucket → "move", with `parent` set
to the bucket it nests INSIDE — never the slug itself.** A heading is
never its own parent.
  - Right: `"installation": [{ "action": "keep" }]` — "Installation" IS
    the canonical bucket "installation"; there's nowhere for it to move
    to.
  - Right: `"css-variables": [{ "action": "move", "parent": ["styling"],
    "title": "CSS Variables" }]` — "CSS Variables" is content that lives
    INSIDE the "styling" bucket; `parent` names styling, not
    "css-variables".
  - Wrong: `"installation": [{ "action": "move", "parent":
    ["installation"] }]` — self-nesting a canonical name under itself is
    a no-op dressed up as a move; it's also exactly the classifier bug a
    past run produced and a human had to strip back out to "keep" during
    review. (This case is now caught automatically — see "Deterministic
    pre-pass" below — but the underlying rule still applies whenever you
    hand-propose an entry.)

(b) **Never attach "process" to a "keep" by default.** `process` is
OPT-IN, only when the content clearly needs adaptation on the way in
(rewritten framework-specific code, restructured prose, etc). Omitting
`process` means "ported as-is" — that is the common case, not an
exception, so most entries should have NO `process` action at all.
  - Right: `"anatomy": [{ "action": "move", "parent": ["anatomy"] }]` —
    no process action; the content is used as-is.
  - Wrong: `"anatomy": [{ "action": "move", "parent": ["anatomy"] },
    { "action": "process", "mode": "llm", "prompt": "Review: heading does
    not match common patterns; determine parent bucket based on
    content." }]` — a boilerplate "review this" prompt attached to every
    single proposal (including ones the classifier was fully confident
    about) is noise, not a real transform hint, and defeats the point of
    `process` as a targeted signal.

(c) **Sections from guide-type pages are OUT of scope for the global
map.** Some upstream "component" pages are actually build-a-feature
tutorials (e.g. `data-table.mdx`, `chart.mdx`) whose sections
("Prerequisites", "Set Up Table Features", "Add Pagination Controls", ...)
are tutorial steps, not reusable doc-section concepts shared across
components — they don't belong in `section-map.ts` at all, mapped or
not. If EVERY component that contributed instances of a given heading
slug is a guide-type page, list that slug under the OWNING component in a
separate `guide-page-sections.json`-shaped structure instead of proposing
a `section-map.ts` entry for it — this global map is reserved for
sections whose meaning is shared across ordinary component doc pages, and
guide-page sections await a future `type:guide` checker path.

## Deterministic pre-pass (no LLM call needed)

Before you even see a bundle, `coverage.ts` applies a pre-pass: any
heading slug that IS itself a canonical bucket name (`installation`,
`usage`, `api-reference`, `accessibility`, `changelog`, `anatomy`,
`examples`, `styling`, `guides`, `concepts`) is auto-classified `keep`
and never reaches `parity-report/unclassified.json` or an LLM batch —
see SCHEMA.md's classification pipeline, step 0. You will not see these
headings in the entries below; don't propose entries for them.

## Task

For each entry below (component, heading, body excerpt), propose ONE
MapAction array. Prefer "move" into the closest matching canonical
bucket. Use "ignore" only for genuinely inapplicable content (e.g.
framework-migration guides specific to a library we never used). Use
"keep" for content that is already correctly named and belongs at root
(rare — most things fit an existing bucket). If you are unsure, propose
your best guess and add a "process" action with a one-line "prompt"
explaining your uncertainty, so a human reviewer can spot it quickly.

Output ONLY a JSON object matching section-map.proposed.json's shape:
{ "map": { "<normalized-heading-slug>": [ <MapAction>, ... ], ... } }

Normalize each heading to a slug the same way the checker does: trim,
lowercase, collapse whitespace/underscores/hyphens to single hyphens,
strip anything else non [a-z0-9-].

## Unclassified entries

<PASTE parity-report/unclassified.json HERE>
```

## After the LLM responds

1. Save its JSON output to `tooling/parity/section-map.proposed.json`.
2. A human reviews each proposed entry against the actual upstream
   section and our current page, and either:
   - copies it (as-is or edited) into `tooling/parity/section-map.ts`,
     converting any declarative `when` into a predicate function per
     SCHEMA.md's "JSON proposals → TS promotion", or
   - rejects it and leaves the section unclassified for a future pass.
3. Delete or regenerate `section-map.proposed.json` once reviewed — it is
   a scratch file, not committed as a permanent artifact (same treatment
   as `parity-report/`).
