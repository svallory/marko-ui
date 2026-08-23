# process-prompt.md — default `process` transform template

This is the default prompt template used by a `{ "action": "process",
"mode": "llm" }` entry in `section-map.json` when the entry omits
`prompt`. It is a **template only** — like `classify-prompt.md`, this
repo's tooling does NOT call any LLM provider; the harness/skill layer
that runs the future porter is responsible for filling placeholders and
making the call.

## When this applies

A map entry's action array may include a `process` action alongside a
placement action (`move`/`rename`/`keep`):

```json
"some-heading": [
  { "action": "move", "parent": ["guides"] },
  { "action": "process", "mode": "llm", "prompt": "Pay special attention to the RTL note in the third paragraph." }
]
```

The placement action says WHERE the section's content goes in our
hierarchy; `process` says HOW to transform its content on the way in —
upstream's React/Base-UI-flavored prose and code needs adapting to
marko-ui's Marko 6 + Zag.js conventions, not a verbatim copy.

## Composition rule: entry `prompt` APPENDS to this default

An entry's own `prompt` string is **section-specific guidance appended
to** this file's default prompt — it never replaces it. The porter step
concatenates: default prompt (this file, placeholders filled) + entry
`prompt` (verbatim, as an additional instruction). When an entry omits
`prompt` entirely, only the default applies. This composition rule is
also documented in `SCHEMA.md`.

## Placeholders

The adapter/porter fills these before sending:

- `{{UPSTREAM_LIBRARY}}` — e.g. "shadcn/ui (Base UI)"
- `{{COMPONENT}}` — e.g. "combobox"
- `{{SECTION_HEADING}}` — the original upstream heading text
- `{{SECTION_BODY}}` — the raw upstream MDX body for this section
- `{{TARGET_BUCKET}}` — the resolved canonical bucket path (e.g. "Styling / Recipes")

## The default prompt

```
You are porting one documentation section from {{UPSTREAM_LIBRARY}}'s
"{{COMPONENT}}" component docs into marko-ui, a Marko 6 + Zag.js port of
the shadcn component registry ("shadcn for Marko"). Adapt the section's
CONTENT to our port's conventions — do not just copy it verbatim.

## What must change

- **Framework**: source is React/JSX. Convert to Marko 6 syntax:
  `<Component prop={value}>` becomes `<component prop=value/>`;
  React hooks/state have no equivalent — describe the same behavior
  using Marko's plain reactive variables (`<let/x=...>`) or the
  three-tag Zag pattern below, never invent a React-shaped API.
- **The three-tag Zag pattern**: every interactive marko-ui component is
  SSR-safe via `<machine-props>` (typed input) + `<service>` (lifecycle)
  + `<connect>` (api snapshot) — a server-rendered never-started machine,
  a client-built service in `onMount`, and a `rev` counter that gates
  recomputing the `connect()` api snapshot. If the upstream section
  describes imperative refs, controlled state, or effects, translate them
  into this pattern's vocabulary (controlled props re-notify via
  `svc?.propsChanged()`), not React's.
- **mu-* / style-layer conventions**: upstream has no equivalent to our
  `mu-*` semantic hook classes or the copy/import distribution split.
  Where the section discusses styling/overriding, prefer describing it in
  terms of `mu-*` hooks (import-mode) or noting that classes are baked
  flat on the copy path — check `notes/css-architecture.md`'s summary if
  unsure which framing applies to {{TARGET_BUCKET}}.
- **Canonical hierarchy**: the ported content is landing under
  {{TARGET_BUCKET}} in our fixed page hierarchy (Header / Installation /
  Usage / Concepts / Anatomy / Examples / Styling / Guides /
  Accessibility / API Reference / Changelog). Write prose that reads
  naturally in that position — don't carry over upstream's own section
  framing/transitions if they assumed a different surrounding structure.
- **No React dependencies**: never suggest installing or importing a
  React package; marko-ui has zero React dependencies by hard constraint.

## What must NOT change

- The underlying behavior/feature being documented (props, states,
  accessibility guarantees) — only the framework-specific expression of
  it.
- Any code sample's actual logic — translate syntax, keep semantics.

## Section to adapt

Heading: {{SECTION_HEADING}}

Body:
{{SECTION_BODY}}

## Output

Return the adapted section as Marko-flavored Markdown/MDX-equivalent
prose + code, ready to place under {{TARGET_BUCKET}} in the component's
docs page. Do not add a top-level heading — the porter places the
content, headings are handled by the placement action's `title`.
```

## After the LLM responds

Same review discipline as `classify-prompt.md`'s proposals: a porter
step's output is a draft for a human (or a follow-up review pass) to
check before it lands in a real docs page — it never auto-applies.
