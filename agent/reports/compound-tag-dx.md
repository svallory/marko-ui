# Compound-tag DX — research findings

**TODO item:** "Compound-tag DX" — array-driven APIs (`items=[...]`) deviate from shadcn/Radix/Ark
compound children; investigate a Marko-idiomatic compound pattern as a possible v2 API.

**Status:** investigated with three working spikes, all SSR- and browser-verified.
**Recommendation:** **adopt attr-tags (Variant A) for v2 as the primary API; keep `items=` as sugar.**
Do *not* pursue per-part sibling tag files (Radix-style) — see Variant B/C.

Spikes live in `apps/docs/src/tags/compound-spike/` + route
`apps/docs/src/routes/compound-spike/`. They are clearly marked EXPERIMENTAL and are not registry
code.

---

## 1. The constraint, restated precisely

From `apps/docs/src/routes/docs/creating-components/+page.marko` and `packages/marko-zag/src/machine.ts`:

Marko 6 resumes a page by **serializing reactive state**; it never re-runs the template in the
browser. Zag's `service` and the connected `api` object are full of functions from npm code, so
neither may become reactive state nor cross a tag boundary as a raw value. The escape hatch the
adapter is built on: **template-created closures ARE serializable**, so the api is passed around as
a *getter* (`<connect/api=...>` + `<return=api>`), and `<service>` keeps the live service in a
`<let>` that holds `null` on the server.

The premise in the task description — "Zag apis/services can't cross tag boundaries" — turns out to
be **too pessimistic**. The api *getter* crosses tag boundaries fine (Variant B proves it end to
end, including keyboard nav and controlled updates). The real blocker for Radix-style compound
components is different, and worse:

> **Marko 6 has no context/provide API at all.**

`node_modules/marko/cheatsheet.md` is explicit:

```
- Read request-scoped `$global` from any template, no threading … Otherwise prop-drill through
  `input`; there is no provider/consumer context API.

| `createContext`/provider to share data | `input` (prop drilling) or request-scoped `$global` |
```

I confirmed there is no `context.d.ts` / `provide` in `node_modules/marko/dist/translator/core/`
(the full core-tag list is `attrs, await, class, client, const, debug, define, effect, export, for,
html-comment, html-script, html-style, id, if, import, let, lifecycle, log, return, script, server,
show, static, style, textarea, try`).

So the premise of the TODO item — "per-part files sharing plain snapshots **via context**" — has no
mechanism to build on. The only two downward channels are `input` (explicit) and `$global`
(implicit, request-scoped). Both were spiked.

---

## 2. Variant A — attr-tags (`<@trigger>` / `<@panel>`) ✅ WORKS

`apps/docs/src/tags/compound-spike/cs-tabs-a.marko`. The parent owns the machine; the "parts" are
**attribute tags**, i.e. *data*, not tags. Nothing crosses a boundary, so the serialization question
never arises.

Call site:

```marko
<cs-tabs-a>
  <@trigger value="one">One</@trigger>
  <@trigger value="two">Two</@trigger>
  <@trigger value="three" disabled>Three (disabled)</@trigger>
  <@panel value="one"><p>Panel A-one content.</p></@panel>
  <@panel value="two"><p>Panel A-two content.</p></@panel>
</cs-tabs-a>
```

Implementation — note the `[...(input.trigger ?? [])]` spread, which the cheatsheet calls out as
mandatory (repeated attr tags are iterables, not arrays, so `.length`/`[i]` are `undefined`):

```marko
export interface TriggerAttrs { value: string; disabled?: boolean; content?: Marko.Body }
export type Input = MachineInput<"div", tabsMachine.Props> & {
  trigger?: Marko.AttrTag<TriggerAttrs>;
  panel?: Marko.AttrTag<PanelAttrs>;
  valueChange?: (value: string) => void;
};

<const/triggers=[...(input.trigger ?? [])]/>
<const/panels=[...(input.panel ?? [])]/>

<machine-props/machineProps from=input pick=tabsMachine.props
  defaultValue=input.defaultValue ?? triggers[0]?.value
  .../>
<service/service machine=() => tabsMachine.machine props=machineProps/>
<connect/api=(service, normalizeProps) => tabsMachine.connect(service, normalizeProps) service=service/>

<div ...api().getRootProps() ...>
  <div ...api().getListProps() ...>
    <for|trigger| of=triggers>
      <button ...api().getTriggerProps({ value: trigger.value, disabled: trigger.disabled })>
        <${trigger.content}/>
      </button>
    </for>
  </div>
  <for|panel| of=panels>
    <div ...api().getContentProps({ value: panel.value })><${panel.content}/></div>
  </for>
</div>
```

**Verification.** Route 200, no `Unable to serialize` anywhere. SSR attrs fully correct before any JS:

```
<div data-slot=tabs-list data-scope=tabs data-part=list id=tabs:sM_1:list role=tablist
     aria-orientation=horizontal data-orientation=horizontal>
<button data-part=trigger role=tab data-value=one aria-selected=true data-selected
        aria-controls=tabs:sM_1:content-one …>
<button data-part=trigger role=tab disabled data-disabled aria-disabled=true data-value=three …>
<div data-part=content id=tabs:sM_1:content-two role=tabpanel hidden>
```

`disabled` propagates from the attr tag into `getTriggerProps` correctly. Browser (Playwright,
`scratchpad/verify.mjs`): click "two" → `one:false, two:true`, panel `content-two` un-hidden,
others hidden. `ArrowRight` from the selected trigger moves selection (roving focus intact). No
console/page errors beyond Vite HMR websocket noise.

**Why it works:** attr tags are collected into `input` as plain data *by the parent's own render*.
The api getter is only ever read inside the parent template. Zero boundary crossings.

---

## 3. Variant B — per-part tag files, api getter threaded through `input` ✅ WORKS (but see cost)

`cs-tabs-b.marko` + `cs-tabs-b-list/trigger/panel.marko`. This is the closest possible analog of
Radix context. Since Marko has no context, the getter is handed to the body as a **tag parameter**
and re-passed explicitly to every part:

```marko
<cs-tabs-b|tabs| value=controlledB valueChange(v) { controlledB = v }>
  <cs-tabs-b-list api=tabs>
    <cs-tabs-b-trigger api=tabs value="one">One</cs-tabs-b-trigger>
    <cs-tabs-b-trigger api=tabs value="two">Two</cs-tabs-b-trigger>
  </cs-tabs-b-list>
  <cs-tabs-b-panel api=tabs value="one"><p>Panel B-one content.</p></cs-tabs-b-panel>
</cs-tabs-b>
```

Parent yields the getter to its body; the child calls it directly:

```marko
// cs-tabs-b.marko
<div ...api().getRootProps() ...><${input.content}(api)/></div>
<return=api>

// cs-tabs-b-trigger.marko
export interface Input { api: TabsApi; value: string; disabled?: boolean; content?: Marko.Body }
<button ...input.api().getTriggerProps({ value: input.value, disabled: input.disabled })>
  <${input.content}/>
</button>
```

**Verification.** Route 200, SSR attrs correct on list, all triggers, all panels; controlled
`value="two"` correctly renders `aria-selected=true` on "two" server-side. Browser: click "one" →
selection and panel visibility both flip; `ArrowRight` works; the external `#b-external-set` button
(parent state → `value=`) correctly drives selection to "three", so **the controlled path survives
the boundary crossing too**. No serialization errors.

So: **the api getter genuinely crosses tag boundaries, both directions, SSR and client.** That is the
key technical finding and it contradicts the assumption in the TODO item. Type safety is also good —
`TabsApi = () => tabsMachine.Api` is exported from the parent and imported by each part, so
`input.api().getTriggerProps(...)` is fully checked, and a missing `value` is a compile error.

### What broke, and why it matters

Every part must be handed `api=tabs` **manually**. I forgot it on exactly one tag
(`<cs-tabs-b-list>`) while writing the spike, and the failure was:

```
input.api is not a function      → HTTP 500, whole page dead
```

There is no context to fall back on, so a single omitted prop is a hard crash rather than a
degraded part. Worse, when I temporarily guarded the call
(`typeof input.api === "function" ? … : {}`) the page returned **200 with a silently attribute-less
`<div data-slot=tabs-list>`** — no ARIA, no `role=tablist`, no error. That is the accessibility
failure mode you least want to be silent.

I initially misdiagnosed this as Marko hoisting or lazy input evaluation and burned several probes
on it (`cs-probe-parent`/`cs-probe-child` remain in the spike dir; they independently confirm that
tag-parameter closures *do* reach nested child tags in SSR: `data-api-type=function
data-value=from-parent`). The actual cause was my own missing attribute. Worth recording because
it's the exact mistake every *consumer* of this API will make.

---

## 4. Variant C — implicit "context" via `$global` ❌ SILENTLY DEAD

`cs-tabs-c.marko` + `cs-tabs-c-trigger.marko`. This is the only *implicit* channel Marko offers, so
it's the only candidate that could give real Radix ergonomics (no prop threading). The parent
stashes the getter; the child reads it with no prop:

```marko
// parent: the "provide" step
<const/provided=(($global as any).__tabsApi = api)/>

// child: the "consume" step
<const/api=($global as any).__tabsApi/>
<if=!api><button data-context-missing="true">CONTEXT MISSING</button></if>
<else><button ...api().getTriggerProps({ value: input.value })>…</button></else>
```

**SSR: works.** Attrs are fully correct server-side — `data-part=trigger role=tab data-value=one
aria-selected=true data-selected aria-controls=tabs:sM_3:content-one`, and zero
`data-context-missing` markers. Tempting.

**Client: completely inert.** Playwright: click trigger "two" → `[['one', true], ['two', false]]`.
No change. `changed: false`. And critically: **zero page errors, zero console errors, zero
`data-context-missing` markers.** The DOM keeps the server's stale snapshot forever and looks fine.

Why: `$global` is not serialized to the client by default, and the reads here are exactly the kind
the cheatsheet warns about — a `<const>` that must recompute from state in the browser. Even with
`serializedGlobals`, `$global` is **request-scoped, not tag-scoped**: two `<Tabs>` on one page
overwrite each other's `__tabsApi`, and nesting (menu-in-menu, tabs-in-tabs — real cases in this
registry) is unfixable without hand-rolling a stack discipline. It is a global variable wearing a
context costume.

**Verdict: disqualified.** Not "needs work" — architecturally wrong, and its failure mode is a
silently non-interactive, ARIA-correct-looking widget.

---

## 5. DX comparison vs the shipped array API

Baseline: `packages/registry/default/ui/tabs/tabs.marko`, 79 lines, one file.

| | current `items=` | A: attr-tags | B: per-part tags |
|---|---|---|---|
| Component LoC | 79 (1 file) | 64 (1 file) | 82 (4 files: 41+11+18+12) |
| Call-site LoC (3 tabs + panels) | ~8 | ~7 | ~9 |
| Files to author per component | 1 | 1 | 1 + one per part |
| Per-item markup / classes | ✗ label strings only | ✓ full body per part | ✓ |
| Per-item conditionals (`<if>`) | ✗ | ✓ | ✓ |
| Slot-level class override | ✗ | ✓ (add `class` to attrs) | ✓ |
| Type safety | ✓ `TabItem[]` | ✓ `Marko.AttrTag<TriggerAttrs>` | ✓ exported `TabsApi` |
| Missing-wiring failure mode | n/a | n/a — impossible | ✗ 500, or silent ARIA loss |
| Nesting / multiple instances | ✓ | ✓ | ✓ |
| shadcn/Radix familiarity | ✗ | partial (`<@trigger>` not `<TabsTrigger>`) | ✓ closest |
| Ark UI anatomy mapping | poor | 1:1 with part names | 1:1 |

Variant A is the only option that is **cheaper than the status quo** (64 < 79 lines) while *adding*
expressiveness. That's because the `<for>` over `items` and the `TabItem` interface are replaced by
attr-tag collection, and the per-item `label`/`disabled` plumbing disappears into the body.

The real DX win of compound children isn't line count, it's that `items=[{label: "One"}]` cannot
express *arbitrary markup per part* — an icon, a badge, a conditional, a nested component. Today
`tabs.marko` works around this with `content?: Marko.Body<[string]>` plus a `value` switch at the
call site, which is strictly worse than `<@panel value="one">`. Same story for the 16 components
that carry an `items:` array:

```
accordion, carousel, cascade-select, combobox, command, context-menu, dropdown-menu, listbox,
marquee, menubar/menu, navigation-menu, radio-group, select, tabs, toggle-group, tree-view
```

## 6. Migration cost

- **16 components** have an `items:`-style array API. The other ~45 registry components are already
  single-part (button, badge, input…) or already multi-file with plain data flow (sidebar,
  menubar) and are unaffected.
- Variant A is **mechanical and additive**: keep `items?:` handling, add `trigger?: Marko.AttrTag<…>`,
  and pick whichever the caller supplied (`const triggers = [...(input.trigger ?? [])]` falling back
  to `items.map(...)`). Both APIs coexist in one file with no branching in the render path. That
  makes it a non-breaking v2 rollout, component by component, and lets the array form stay as
  genuinely-better sugar for data-driven cases (a select bound to fetched options should *not* be
  compound).
- Two components need care: `combobox`/`command` filter their items reactively, and `tree-view`
  takes a recursive tree. Arrays are the right shape there — offer attr-tags only for the static
  cases and keep `items=` primary.
- Variant B would mean authoring 3–6 new tag files per component (≈60–90 new files) plus documenting
  the `api=` threading rule for every consumer. Not worth it.

## 7. Recommendation

**Adopt Variant A (attr-tags) for v2 as the primary compound API; retain `items=` as sugar. Reject
Variant B and C.**

Reasoning:

1. **It fits Marko's grain rather than fighting it.** Attr tags are Marko's *native* answer to named
   and repeated slots; the cheatsheet presents them as the idiom. Variant A needs no new adapter
   primitive, no context shim, and — because the api getter never crosses a boundary — it cannot hit
   the serialization wall at all. It is also the only variant that got *shorter* than the code it
   replaces.
2. **Radix-style sibling tags are a trap here, and the trap is silence.** Variant B *technically*
   works (that's the genuinely surprising result — the api getter is serializable and survives both
   directions), but without a context API the correctness of every widget rests on the consumer
   remembering `api=tabs` on every part. Get it wrong and you get a 500; guard against the 500 and
   you get an ARIA-less widget with no error. Shipping an accessibility library whose failure mode
   is "looks right, silently unusable by screen readers" is not acceptable.
3. **Honest caveat on DX parity:** `<@trigger value="one">` is *not* `<TabsTrigger value="one">`.
   Attr tags are lexically scoped to the parent tag, so you cannot extract a group of parts into a
   separate template and compose it — a real limitation Radix users will notice, and the reason
   Variant A is "partial" on familiarity above. Compound DX genuinely *does* fight Marko's grain in
   this one respect, and no amount of spiking fixes it while Marko lacks context. Variant A is the
   best available point on that curve, not a full Radix clone.
4. If Marko ever ships a context/provide primitive, revisit Variant B — it is already proven to work
   mechanically, and context would remove its single fatal flaw.

## 8. Verification notes / reproduction

- Spikes: `apps/docs/src/tags/compound-spike/cs-*.marko`, route `/compound-spike` (+ `/compound-spike/probe`).
- Playwright script: `scratchpad/verify.mjs` (Playwright at `/opt/homebrew/lib/node_modules/playwright`).
- **The shared dev server on :3000 could not be used**: `apps/docs/src/routes/chart-spike/+page.marko:23`
  references `<echarts-chart>`, which has no entry point, and marko-run compiles the whole route
  manifest — so *every* route returned 500 regardless of port. Another agent's in-flight work;
  flagged to `main`. I verified against an isolated copy of the docs app
  (`scratchpad/docsapp`, node_modules symlinked, `chart-spike` removed) on **:3312**.
- All three variants render 200 with zero `Unable to serialize` occurrences. A and B pass click +
  ArrowRight + controlled-update; C passes SSR and fails all interaction silently.
