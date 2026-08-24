# Parity harness protocol

This document specifies the contract between the parity **runner**
(`tooling/parity/runner/`) and a **harness** (`tooling/parity/harnesses/<name>/`).
It exists so an agent porting marko-ui's component set to a different
upstream library — or porting this whole parity pipeline to compare two
*other* libraries — can build a conformant harness from this document
alone, without reading the runner's implementation. If you are that agent:
read this file, then read `tooling/parity/runner/SCHEMA.md` for the
`report.json` shape the runner produces once your harness's facts feed it.

Two harnesses currently implement this protocol:

- `tooling/parity/harnesses/shadcn/` — the **upstream** side: resolves a
  shadcn/ui clone, extracts facts from its MDX docs source, and serves its
  React demo registry for screenshotting.
- `tooling/parity/harnesses/marko-ui/` — the **ours** side: extracts facts
  from this repo's own docs/demos data, and serves our Marko demos for
  screenshotting.

A harness is not "the upstream" or "the ours" side structurally — the
runner treats both symmetrically. Which harness plays which role is a
runner-level configuration decision (`tooling/parity/config/parity.config.ts`),
not something either harness needs to know about itself.

## What a harness must provide

Three things:

1. **`harness.json`** — static metadata the runner reads to know how to
   boot the harness's demo server and where its facts file lives.
2. **An HTTP demo server**, once started, exposing `GET /demos.json` and
   `GET /demo/<name>` — used by the **visual** detector to screenshot
   individual demos.
3. **An extract step** — a script (referenced from `harness.json` or run
   ahead of time by convention; see "The extraction step contract" below)
   that reads the library's own docs/demo source and writes a
   `parity-facts.json` file — consumed by the **coverage** detector. This
   step never touches a live server; it's static analysis over source
   files.

### `harness.json` shape

One JSON file at the harness's root, e.g.
`tooling/parity/harnesses/shadcn/harness.json`:

```ts
interface HarnessManifest {
  /** Human-readable harness name, e.g. "shadcn" or "marko-ui". Used in report/log output. */
  name: string
  /** Shell command that boots the harness's demo server. Run with cwd = the harness's own directory. Must not exit until killed — the runner spawns it as a long-running child process. */
  start: string
  /** Port the demo server listens on once started. The runner polls `http://localhost:<port>/demos.json` until it responds, then treats the server as ready. */
  port: number
  /** URL path prefix for the per-demo blank-page route, e.g. "/demo/". A demo named "drawer-demo" is fetched at `${demoPath}drawer-demo`, e.g. "/demo/drawer-demo". Must end with a trailing slash. */
  demoPath: string
}
```

Example (`harnesses/shadcn/harness.json`):

```json
{
  "name": "shadcn",
  "start": "bun run build && bun run preview",
  "port": 4174,
  "demoPath": "/demo/"
}
```

The runner does not hardcode ports, start commands, or route shapes
anywhere — every harness-specific detail needed to boot and drive a
harness lives in this file. Adding a third harness (a different port,
started with `npm run dev`, demos at `/preview/<name>` instead of
`/demo/<name>`) requires zero runner code changes, only a new
`harness.json` (plus the server and extract step it points at).

### `GET /demos.json`

Returns the flat list of demo names this harness's server can currently
render, as a JSON array of strings:

```json
["accordion-demo", "alert-demo", "alert-destructive", "drawer-demo", "..."]
```

Used by the runner to sanity-check that a demo name it wants to
screenshot (from `parity-facts.json`'s `demoRefs`, see below) is actually
servable before attempting navigation — a fast, cheap pre-check that turns
a slow Playwright-timeout failure into an immediate, clearly-attributed
skip.

### `GET /demo/<name>`

A **blank, chrome-free page** rendering exactly one demo, named by the URL
segment. Requirements, identical for every harness:

- No site chrome (header/nav/footer) — the page is meant to be
  screenshotted in isolation, not viewed as part of a normal site.
- Renders a wrapper element carrying `data-parity-demo="<name>"` — this is
  the element the visual detector screenshots. Present on both the
  success path (the demo rendered) and the not-found path (so a bad name
  fails fast and visibly rather than producing a blank screenshot with no
  attributable error).
- Forced **light theme** — both harnesses must render in the same color
  scheme regardless of system/site defaults, or every visual diff is
  dominated by theme mismatch noise, not real drift. marko-ui's harness
  additionally forces its `style-nova` design-system style (marko-ui ships
  8 interchangeable style layers; nova is the one shadcn's own
  `new-york-v4` style most closely maps to — this is a marko-ui-harness
  decision, not part of the protocol itself. A harness for a different
  library forces whatever single style/theme makes it comparable to its
  counterpart.)
- Unknown `<name>` renders a diagnostic page (still carrying
  `data-parity-demo="<name>"` on some element, per above) rather than a
  4xx with no body — the runner's screenshot step treats "no matching
  element within timeout" as the failure signal, uniformly across both
  outcomes.

### `parity-facts.json` — schema

The extraction step's output. One file per harness
(`tooling/parity/harnesses/<name>/parity-facts.json`, gitignored —
regenerated by the extract step, not committed), consumed identically by
the runner's coverage engine regardless of which harness produced it.

```ts
interface ParityFacts {
  /** ISO timestamp of when this file was generated. */
  generatedAt: string
  /** Which harness produced this file — must match harness.json's `name`. */
  harness: string
  /** One entry per component this harness knows about. */
  components: ComponentFacts[]
}

interface ComponentFacts {
  /** Component slug, e.g. "drawer". Cross-harness pairing is by exact string match on this field — both harnesses must use the same slug for "the same" component (shadcn's MDX basename and marko-ui's `packages/shadcn/ui/` directory name already agree by construction in this repo; a harness pair for a different library must establish its own shared slug vocabulary). */
  component: string
  /** This component's demo names, as they'll be looked up at `GET /demo/<name>` on this harness's server. */
  demoNames: string[]
  /** Structural sections this component's docs are organized into. */
  sections: ComponentSection[]
  /** Flattened API prop names across all of this component's parts/subcomponents, if extractable. Empty array + apiTractable:false means "this harness can't extract API props for this component" (e.g. upstream docs that only link out to a shared base-library reference instead of embedding a table) — never conflated with "this component genuinely has zero props." */
  apiProps: string[]
  apiTractable: boolean
  /** True if this component's docs page is a "guide" page (task-pattern walkthrough, e.g. a Data Table cookbook) rather than a standard component reference page — see runner SCHEMA.md's guide-page handling. Sections on a guide page are checked for step-topic coverage, not canonical-bucket presence. */
  guidePage: boolean
}

interface ComponentSection {
  /** Raw heading text as it appears in the source, e.g. "Custom Items". */
  heading: string
  /** Section slug — kebab-case, lowercased, punctuation-stripped. The runner does its own normalization on top of this (case/kebab/punctuation-insensitive compare), so a harness's slugging algorithm doesn't need to exactly match the runner's; supply your best-effort slug here for readability in reports. */
  slug: string
  /** The section's body text (heading to next same-or-higher-level heading), for prose-length/demo-marker classification. May be truncated by the harness for size — the runner only inspects the first ~2000 chars of any one body. */
  body: string
  /** Demo names this section's body references (e.g. via an embedded `<ComponentPreview name="...">`-style marker). Empty if the section has no demo embed. */
  demoRefs: string[]
}
```

A minimal example (`harnesses/shadcn/parity-facts.json`, one component):

```json
{
  "generatedAt": "2026-08-23T12:00:00.000Z",
  "harness": "shadcn",
  "components": [
    {
      "component": "drawer",
      "demoNames": ["drawer-demo", "drawer-no-footer", "drawer-sides", "drawer-snap-points"],
      "apiProps": [],
      "apiTractable": false,
      "guidePage": false,
      "sections": [
        {
          "heading": "Installation",
          "slug": "installation",
          "body": "...",
          "demoRefs": []
        },
        {
          "heading": "Examples",
          "slug": "examples",
          "body": "...<ComponentPreview name=\"drawer-demo\" />...",
          "demoRefs": ["drawer-demo"]
        }
      ]
    }
  ]
}
```

## Style pairing

A visual diff between two harnesses is only meaningful if both sides
render the **same declared style**. `harness.json` therefore carries an
optional `style` field:

```ts
interface HarnessManifest {
  // ...fields above...
  /** Free-text description of the single style/theme this harness's
   * demo server renders, e.g. "new-york-v4 (base, no style layer)" or
   * "style-nova". Comparisons between two harnesses are valid ONLY when
   * their declared `style` values describe the same rendered look —
   * see below for how that was verified for shadcn <-> marko-ui. */
  style?: string
}
```

This isn't machine-checked (style descriptions aren't a controlled
vocabulary across arbitrary library pairs) — it's a documentation
requirement so a human auditing a visual residual can immediately see
whether "both sides claim to render the same style" before spending time
diagnosing the residual as a real component bug.

### How shadcn <-> marko-ui's pairing was determined (2026-08-24)

Investigated empirically, by reading both harnesses' CSS/build wiring and
the upstream clone's component source (not by guessing):

- `harnesses/shadcn/harness-react/src/main.css` imports the vendored,
  byte-identical `shadcn-tailwind.css` (verified via `diff -q` against
  `<clone>/packages/shadcn/dist/tailwind.css` — see that file's header
  comment) plus a generated `@source` directive pointing Tailwind's JIT
  scanner at the resolved clone's
  `apps/v4/registry/new-york-v4/{examples,ui}/**/*.tsx`. There is **no
  style-layer import of any kind** — no `style-nova.css`, no equivalent.
  Upstream shadcn/ui has no "8 interchangeable style layers" concept at
  all; that's a marko-ui-specific abstraction with no upstream
  counterpart.
- The overlay color difference that motivated this investigation
  (`bg-black/50` in upstream captures vs `bg-black/10` in ours) traces to
  a **hardcoded Tailwind utility class literal in the upstream component
  source itself** — `apps/v4/registry/new-york-v4/ui/sheet.tsx` line 39
  and `ui/drawer.tsx` line 40 both read
  `"fixed inset-0 z-50 bg-black/50 data-[state=closed]:animate-out ..."`
  directly on the `<SheetOverlay>`/`<DrawerOverlay>` className. It is not
  a CSS custom property, not a themeable token, not something any
  style-layer file could override upstream — the harness renders it
  because it renders the clone's `.tsx` source completely unmodified (by
  design, see `vite.config.ts`'s alias comments).
- Checked whether any of marko-ui's 8 style layers (`packages/shadcn/styles/style-*.css`)
  produces the same `bg-black/50` value for `.mu-sheet-overlay` /
  `.mu-drawer-overlay`: none do (`luma`/`rhea` use `/30`, `sera` uses
  `/20`, `lyra`/`nova`/`vega` use `/10`, `maia`/`mira` use `/80`). Nova is
  our documented default (matches `apps/docs/src/routes/+layout.marko`'s
  `<body class="style-nova ...">`) and was already byte-verified identical
  to a `style-nova.css` this repo ships — but that comparison was against
  our *own* file, not anything upstream serves; upstream never had a
  `style-nova.css` to begin with, so "load upstream's style-nova.css" is
  not an available fix.
- Also checked whether "no style layer" is a viable choice for our side,
  to structurally match upstream's "no style layer" rendering: it is not.
  `.mu-sheet-overlay`/`.mu-drawer-overlay` (and every other `mu-*` class)
  have **zero base definition** outside `styles/style-*.css` — an
  unstyled marko-ui component renders with no overlay treatment at all,
  which would not be closer to upstream, just differently wrong.

**Conclusion**: this pair's styles were already correctly matched at the
only level that's actually comparable — both harnesses render their
respective library's documented default look (upstream: raw new-york-v4
component source, no style layer, because none exists; ours: style-nova,
our shipped default). The overlay-opacity residual on sheet/drawer is a
**genuine, intentional design difference** between marko-ui's default
style and shadcn's hardcoded default, not a harness measurement defect.
`harness.json`'s `style` field now makes this pairing explicit and
auditable for future residual triage, and the previous
`parity-ignore.json` `visualDemos` entries (which described this same
finding as a per-demo exception rather than a structural harness fact)
are removed in favor of it — see the ratios captured below.

## The extraction step contract

Each harness owns a script that produces its `parity-facts.json` by
reading **static source**, never a running server:

- shadcn's extract step (`harnesses/shadcn/extract/`) parses the resolved
  upstream clone's MDX docs source (`apps/v4/content/docs/components/base/*.mdx`)
  — heading/body sectioning, demo-marker regex matching
  (`<ComponentPreview name="...">`), and API-reference table scraping. This
  is the MDX-parsing logic that used to live inline in the old
  `coverage.ts`; it moved here because it is upstream-shadcn-specific, not
  generic to the runner.
- marko-ui's extract step (`harnesses/marko-ui/extract/`) reads this
  repo's own `demos-manifest.ts` and `api-reference.json` and derives each
  component's section list the same way the old `ourSectionsFor` did
  (fixed skeleton: Installation/Usage/[Composition]/[Concepts]/one section
  per example/[Accessibility]/[API Reference]) — this logic moved out of
  the runner's coverage engine into this harness's extract step, since
  it's specific to how *our* docs pages are currently structured, not a
  property of the runner itself.

Contract, identical for any harness's extract step:

- **Input**: static source files only (docs source, manifests,
  API-extraction output) — no network calls, no running dev server
  required.
- **Output**: writes `parity-facts.json` at the harness's own root,
  conforming to the schema above.
- **Idempotent and side-effect-free** otherwise: running it twice with the
  same source produces byte-for-byte-equivalent facts (mod `generatedAt`).
- **Invoked independently of the demo server** — a harness's `harness.json`
  `start` command boots only the demo server; the runner (or a developer,
  or CI) runs the extract step as a separate command before invoking the
  coverage detector. This repo wires both as adjacent `bun run` scripts
  per harness; a harness for another library can wire this however suits
  its own build tooling, as long as `parity-facts.json` exists by the time
  the runner's coverage step reads it.

## Runner responsibilities (for contrast — not part of what a harness must implement)

The runner (`tooling/parity/runner/`) is harness-agnostic and does not
change when a new harness is added:

- **Coverage engine** (formerly `coverage.ts`, presence-only semantics —
  see `runner/SCHEMA.md`) reads both harnesses' `parity-facts.json` files
  and cross-references demo names / mapped section targets / API props,
  using `config/section-map.ts` to decide where an upstream section's
  content should be presence-checked on the other harness's side.
- **Visual runner** boots both harnesses' servers per their `harness.json`,
  navigates each to `GET <demoPath><name>`, screenshots the
  `[data-parity-demo]` element, and diffs the pair.
- **Report/gallery** renders `parity-report/index.html` and
  `parity-report/report.json` from both detectors' output.
- **Classifier bundling + prompt templates** turn coverage's
  "unclassified section" queue into LLM classification requests
  (`classify-prompt.md`) and, separately, into content-porting requests
  (`process-prompt.md`) — both harness-agnostic, since they operate on
  the harness-agnostic `ComponentSection` shape above.

None of this is a harness's concern. A harness's whole job is: produce
`parity-facts.json` in the shape above, and serve `/demos.json` +
`/demo/<name>` per the rules above. Everything downstream is the runner's.
