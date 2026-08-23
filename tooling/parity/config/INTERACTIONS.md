# interactions.json — authoring guide

`tooling/parity/config/interactions.json` tells `visual.ts` what to do to a demo
*before* screenshotting it, on both the upstream harness and ours. The
runner applies each demo's steps identically on both sides using
Playwright's role+name locators, so the two screenshots capture the same
semantic state (e.g. "the drawer is open") rather than two different
resting states.

This file exists because a resting-state-only screenshot is blind to a
whole class of divergence: shadcn's `drawer-snap-points` demo, for
example, renders identically to ours when *closed* (both sides just show a
trigger button) but can diverge sharply once *open* — snap-point behavior,
content overflow, animation end-state. Reasoning about "what does this
demo need clicked, and what's the button called" happens once, here, by a
human or an agent reading the demo source. Execution is then fully
deterministic and mechanical for every future run — that's the whole
point of separating this file from the runner.

## Format

Top-level object keyed by **demo name** — the same name used as a key in
`apps/docs/src/demos/demos-manifest.ts`'s per-component `demos: {}` object,
and as the upstream basename under
`<shadcn-clone>/apps/v4/registry/new-york-v4/examples/<name>.tsx`. These
names are required to match exactly for a demo to be "paired" at all (see
`coverage.ts`), so if you can already run the coverage detector for your
demo, you already have the right key.

```json
{
  "<demo-name>": {
    "steps": [
      { "action": "click", "role": "button", "name": "Open Drawer" }
    ],
    "settleMs": 600
  }
}
```

- `steps` — an ordered array of interaction steps, applied in order, on
  both sides, before the screenshot is taken.
- `settleMs` — optional, default 300. A plain `await page.waitForTimeout()`
  after the last step, before the screenshot. Interactive components
  animate open/closed (vaul's drawer transform, Radix's dialog fade); the
  screenshot must wait for the animation to finish or you'll diff
  in-flight animation frames, which look like real drift but aren't. Set
  this to comfortably exceed the component's longest transition duration
  — check the component's CSS (`duration-*` classes / `transition`
  properties) if unsure. 300–600ms covers everything currently in this
  repo; raise it per-demo if a future component uses a longer animation.

### Step shape

```jsonc
{
  "action": "click",       // currently the only supported action
  "role": "button",        // ARIA role, passed to page.getByRole()
  "name": "Open Drawer",   // accessible name, passed to page.getByRole()
  "css": ".fallback-selector" // optional, see below
}
```

- `role` + `name` map directly to Playwright's
  `page.getByRole(role, { name })` locator — **exact string match** on the
  accessible name (usually the visible text content of the clicked
  element, e.g. a `<button>`'s text). This is deliberately the same
  locator strategy already verified to work against the upstream
  harness-react side this session (Playwright MCP click on "Open Drawer"
  in `drawer-demo`). It works unmodified against the Marko side too: our
  registry components render real `<button>` elements with real text
  content, no special-casing needed.
- `css` (optional) — a plain CSS selector fallback, used only if the
  role+name locator resolves to zero elements. Prefer role+name always;
  only add a `css` fallback when a demo's trigger genuinely has no
  meaningful accessible name (rare — none of the seeded entries in this
  repo need it).

### How to find the right `role`/`name` for a new demo

1. Open the demo's source (upstream `.tsx` in
   `<clone>/apps/v4/registry/new-york-v4/examples/<name>.tsx`, or ours in
   `apps/docs/src/demos/<component>/<name>.marko`) and find the element
   that opens/changes the thing you want to capture non-resting.
2. Read its visible text content — that's the `name`. Read its tag/role —
   `<button>` is `role: "button"`, a link is `role: "link"`, etc. Since
   both harnesses render the *same* semantic component (Marko's Drawer /
   React's Drawer), the two sides' trigger markup should already carry the
   same accessible name if the port is faithful — if they don't match,
   that's real drift worth its own investigation, not something to paper
   over with two different interaction entries.
3. Add one entry to `interactions.json`, run
   `bun tooling/check-parity.ts --component <name>` (or the runner
   directly) once, and eyeball the two screenshots this session's
   `parity-report/images/` produces before trusting the mismatch %.

## Porting this pattern to a different upstream library

The design intent of this file is that the *reasoning* — "what does demo X
need clicked to reach the state worth comparing" — is a one-time, durable
decision, independent of whatever renders the two sides. If you're
building a similar dual-harness visual-parity pipeline against a different
component library:

1. Keep the JSON shape (demo name → `{ steps, settleMs }`) — it's already
   framework-agnostic.
2. Keep role+name as the primary locator strategy. It survives DOM
   structure differences between two independently-implemented renders of
   "the same" component far better than CSS selectors or XPath would —
   that's the entire reason two ports of the same design system can be
   compared at all.
3. Only add new `action` kinds (`"type"`, `"hover"`, `"press"`, ...) to the
   runner when a real demo needs one — don't speculatively build a bigger
   action vocabulary than the current demo set requires.
4. Seed entries for anything that changes visible DOM state on
   interaction: overlays (drawer/dialog/sheet/popover/dropdown/tooltip),
   anything with open/closed or expanded/collapsed state, anything with a
   multi-step flow. A demo that's visually identical whether interacted
   with or not doesn't need an entry — `visual.ts` treats "no entry" as
   "screenshot resting state," which is already a legitimate, comparable
   snapshot for a non-interactive demo.

## Currently seeded

| Demo | Trigger | Why |
|---|---|---|
| `drawer-demo` | click "Open Drawer" | acceptance case — resting state is just a button on both sides; the real divergence (recharts + snap-point rendering) only shows up open |
| `drawer-no-footer` | click "View notifications" | same family, no footer variant |
| `drawer-sides` | click "Open from the right" | side-drawer transform direction |
| `drawer-snap-points` | click "Open with snap points" | snap-point content sizing — explicitly the divergence this whole v2 rebuild was scoped to expose |
| `dialog-demo` | click "Edit Profile" | trivial open-state check, Radix Dialog vs marko-zag dialog |
| `alert-dialog-demo` | click "Show Dialog" | trivial open-state check |
| `sheet-demo` | click "Open" | trivial open-state check |
