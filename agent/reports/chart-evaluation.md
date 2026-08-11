# Chart component evaluation (TODO "chart")

shadcn's chart component wraps Recharts, which is React-only. This evaluates
replacements for a Marko 6 chart component and recommends one.

**Recommendation: build on d3 primitives (`d3-scale` + `d3-shape` + `d3-array`),
with Marko rendering the SVG declaratively.** Not ECharts. Rationale and
measurements below.

All numbers are measured, not quoted from bundlephobia. Method and reproduction
steps are at the end.

---

## Comparison table

| | ECharts | Observable Plot | Chart.js | uPlot | d3 composition | LayerChart |
|---|---|---|---|---|---|---|
| Latest / published | 6.1.0 (2026-05-19) | 0.6.17 (2025-02-14) | 4.5.1 (2025-10-13) | 1.6.32 (2025-03-14) | d3 7.9.0 (2024-03-12) | 2.1.1 (2026-08-11) |
| **gzip, line+bar+area+pie set** | **193.9 KB** | 131.4 KB | 65.6 KB | 22.8 KB | **10.8–17.0 KB** | n/a (Svelte) |
| Framework-agnostic imperative mount | Yes | Yes (returns DOM node) | Yes | Yes | N/A — no mount needed | **No** |
| Renders without a DOM | **Yes** (`ssr:true` → SVG string) | No (needs JSDOM) | No (canvas) | No (canvas) | **Yes** (pure math; Marko emits SVG) | No |
| Works with JS disabled | No | No | No | No | **Yes** | No |
| Output | Canvas or SVG | SVG | Canvas | Canvas | SVG | SVG |
| CSS-variable theming | Indirect (JS reads tokens, re-renders) | Indirect | Indirect | Indirect | **Direct — `fill="var(--chart-1)"`** | Direct |
| TypeScript | Bundled, good | Bundled, good | Bundled, excellent | Bundled, thin | Per-package `@types/*`, excellent | Bundled |
| Maintenance | Very active, Apache | Active, low cadence | Very active | Low cadence, stable | Stable/mature | Active |
| Runtime deps | tslib, zrender | d3, isoformat, interval-tree-1d | @kurkle/color | none | none (scoped pkgs) | 12+ incl. `@layerstack/svelte-*` |

**LayerChart is disqualified as a dependency**: v2.1.1 depends on
`@layerstack/svelte-actions` and `@layerstack/svelte-state`. It is a Svelte
component library, not a portable core. It remains valuable as a *design
reference* — it is the closest thing to "shadcn charts, not React" — but we
would be reimplementing its ideas, not importing it.

**uPlot** is the size winner (22.8 KB) but is explicitly a time-series/line
plotter. No pie, weak bar support, canvas-only, and a deliberately spartan
aesthetic. Wrong fit for a shadcn-style dashboard set.

**Chart.js** at 65.6 KB is the best of the "batteries-included canvas" options,
but canvas rules out CSS-variable theming, per-element styling, and accessible
SVG output. Everything must be recomputed and repainted in JS on theme change.

**Observable Plot** is elegant and its grammar-of-graphics API is the nicest of
the batch, but 131.4 KB gzip, it drags in all of `d3`, and it cannot render
without a DOM (confirmed: throws `document.documentElement` is undefined under
plain Node).

---

## Measured bundle sizes

Built with `bun build --minify --target=browser`, gzip -9. Each entry imports
only what a line/bar/area/pie dashboard needs.

| Entry | minified | gzip |
|---|---|---|
| ECharts, full `import * from "echarts"` | 1,178,781 B | **388.5 KB** |
| ECharts, tree-shaken (line/bar/pie + grid/tooltip/legend + canvas) | 598,243 B | **200.8 KB** |
| ECharts, same but SVG renderer | 605,972 B | 204.5 KB |
| Observable Plot | 397,874 B | **131.4 KB** |
| Chart.js, tree-shaken + registered controllers | 193,269 B | **65.6 KB** |
| uPlot | 53,177 B | **22.8 KB** |
| d3 composition set (scale/shape/array/selection/axis) | 49,830 B | **17.0 KB** |
| d3 set actually used by the spike (scale/shape/array) | 29,552 B | **10.8 KB** |

Head-to-head on the **exact feature set the spike registers** (line + bar +
grid + tooltip + legend):

```
ECharts : 198,592 B gzip = 193.9 KB
d3      :  11,021 B gzip =  10.8 KB
ratio   : 18.0x
```

ECharts' tree-shaking is far weaker than its docs imply. Registering just two
chart types and three components still pulls in ~194 KB gzip, because `zrender`
(its rendering engine) is effectively monolithic. For a component library where
consumers copy in one component, shipping 194 KB for a bar chart is not
defensible.

---

## Spike findings

Two working implementations were built and verified with Playwright: an ECharts
tag and a d3-composition tag, both rendering line + bar, themed from
`--chart-1..5`, in a page with a live light/dark toggle.

### Both approaches work and both re-theme live

| Check | ECharts | d3 composition |
|---|---|---|
| Renders line + bar | Yes | Yes |
| First paint | **31 ms** | 0 ms (already in SSR HTML) |
| Recolors on `.dark` flip | Yes, via `MutationObserver` + `setOption` | Yes, **zero JS** |
| Console errors from chart code | none | none |
| Hydration errors | none | none |

Colors sampled from the live page, before and after clicking the toggle:

```
LIGHT  --chart-1 = oklch(0.646 0.222 41.116)
       d3 bar fill        = oklch(0.646 0.222 41.116)   <- exact token match
       echarts canvas top = 245,74,0 | 0,150,137

DARK   --chart-1 = oklch(0.488 0.243 264.376)
       d3 bar fill        = oklch(0.488 0.243 264.376)  <- exact token match
       echarts canvas top = 20,71,230 | 0,188,125
```

### The decisive difference: SSR

Server-rendered HTML, before any hydration:

```
svgCount            : 2      <- both d3 charts, fully formed
chartVarRefs        : 16     <- var(--chart-N) literally in the HTML
canvasCount         : 0      <- ECharts contributes nothing
```

With **JavaScript fully disabled** against the production build:

```
d3Bars          : 12         <- renders
d3LinePaths     : 4          <- renders
echartsCanvases : 0          <- empty box
firstBarFill    : lab(57.1026 64.2584 89.8886)   <- token resolved by CSS alone
```

The ECharts panels are blank rectangles; the d3 charts are complete and
correctly themed. This is visible in the captured screenshots
(`chart-light.png`, `chart-dark.png`, `chart-nojs.png` in the session
scratchpad).

This matters beyond progressive enhancement. Because the d3 output is real SVG
carrying `var(--chart-1)`, theme switching is handled entirely by the CSS
cascade — no observer, no re-render, no flash, and it works for *any* mechanism
that changes tokens (`.dark`, a base-color variant, a scoped `[data-theme]`
subtree). The ECharts version needs a `MutationObserver` on `<html>` and a full
`setOption` per flip, and it only reacts to changes it is explicitly watching.

### shadcn look parity

The d3 approach reaches parity, because we control every element:

- Horizontal-only grid lines at `var(--border)` — matches shadcn. Achieved.
- Rounded bar tops — `rx="4"` on `<rect>`. Achieved (ECharts needs
  `itemStyle.borderRadius`, also fine).
- Muted tick labels at `var(--muted-foreground)`, 12px, no axis lines. Achieved.
- Tooltip styled as a shadcn popover — **not built in the spike.** With d3 this
  is a plain Marko-rendered absolutely-positioned div reusing existing popover
  classes, which is *more* faithful than ECharts' tooltip (a JS-styled DOM node
  we must feed hex colors, and which cannot inherit our popover component).

One flaw in the spike worth noting: my stacked area fills use flat
`fill-opacity="0.15"`, so where two areas overlap the colors muddy to grey (see
`chart-light.png`, third panel). shadcn uses a vertical gradient fade per
series. Straightforward to fix with an SVG `<linearGradient>`; it is a defect in
my spike, not in the approach.

ECharts, conversely, always looks slightly "ECharts-y". Matching shadcn means
overriding a large option object, and some details (tooltip DOM, legend markers)
resist it.

---

## Recommendation

**Build a small chart layer on d3 primitives, with Marko emitting the SVG.**

d3 is used only as a **pure math library** — scales and path generators. No
`d3-selection`, no `d3-axis`, no imperative DOM. This is the "LayerChart-style
composition" option, and it is the only candidate that satisfies every hard
criterion:

- 10.8 KB gzip, 18x smaller than ECharts, and it shrinks further per-chart since
  a line chart never imports the bar code.
- True SSR. Charts are in the HTML, correct with JS off.
- Theming is native: `var(--chart-1)` in the markup, zero JS on theme change.
- No `<lifecycle onMount>` and no client-only escape hatch for static charts —
  which sidesteps the adapter-serialization constraints entirely.
- Excellent types via `@types/d3-scale` etc.
- Matches the registry's copy-in model: the component is readable Marko markup a
  user can edit, not an opaque config object.

The tradeoff is honest: **we implement chart internals ourselves.** Axis ticks,
legends, tooltip positioning, and stacking are our code. Roughly 400–600 lines
across the initial set. ECharts would give us zoom, brush, polar coordinates,
and dozens of exotic chart types for free. But shadcn's chart component covers
area/bar/line/pie plus tooltip and legend — a scope d3 primitives handle
comfortably — and every one of those extras costs us the SSR and theming
properties that make the component feel native to this library.

If the project later needs genuinely heavy interactive analytics (zoom/brush
over 100k points, geo, treemaps), ECharts is the right escape hatch and can ship
as a *separate opt-in* component. It should not be the default.

### Integration architecture

Prefer **per-chart tags over a single polymorphic `<Chart type=...>`.** A `type`
prop forces every consumer to bundle every chart type, discarding the main size
advantage, and makes the props union dishonest (`innerRadius` is meaningless for
a bar chart). Per-chart tags keep imports honest and types precise.

```marko
<!-- Primitives shared by all charts -->
<chart-container config=chartConfig class="h-[250px] w-full">
  <chart-grid horizontal/>
  <chart-x-axis dataKey="month" tickLine=false axisLine=false/>
  <chart-y-axis/>
  <chart-bar dataKey="desktop" radius=4/>
  <chart-bar dataKey="mobile" radius=4/>
  <chart-tooltip/>
  <chart-legend/>
</chart-container>
```

`chart-container` owns the shared work — measuring the plot area, building
scales from the data and the declared series, and providing them to children.
Children are pure renderers.

`config` mirrors shadcn's `ChartConfig`, mapping series keys to a label and a
token:

```ts
export interface ChartConfig {
  [key: string]: {
    label: string;
    /** A CSS color. Use a token: "var(--chart-1)". */
    color?: string;
    icon?: Marko.Renderable;
  };
}

const chartConfig = {
  desktop: { label: "Desktop", color: "var(--chart-1)" },
  mobile: { label: "Mobile", color: "var(--chart-2)" },
} satisfies ChartConfig;
```

Because `color` stays a CSS string all the way into the `fill` attribute, the
token is never resolved in JS and theming stays free.

Two implementation notes from the spike, both Marko-6 parser constraints that
will bite whoever writes this:

- Inline generics break the parser — `scaleBand<string>()` in an attribute is
  read as a tag. Use the 2-arg form `scaleBand(domain, range)` or annotate the
  parameters instead.
- Method chains must not be indented at line start, and `<let/x: A | B/>` fails
  because `|` delimits tag parameters (use `<let/x?: A/>`).

Interactive charts (tooltips) still need a client island, but only the tooltip
does — the chart body remains server-rendered. Static charts ship zero JS.

---

## Reproduction

Bundle measurements:

```bash
mkdir bundletest && cd bundletest && bun init -y
bun add echarts @observablehq/plot chart.js uplot d3
# write one entry per library importing only the dashboard feature set
bun build entry.js --minify --target=browser --outfile=out.js
gzip -9 -c out.js | wc -c
```

The spike (two Marko tags, a token reader, and a comparison page) was built and
verified in an isolated copy of `apps/docs` on its own port, then removed from
the repo — it is **not** committed, and `apps/docs` is unchanged. Spike sources
and screenshots remain in the session scratchpad under `chart-spike/`,
`chart-light.png`, `chart-dark.png`, `chart-nojs.png`.

Verified with Playwright: chart rendering, live theme switching in both
directions, no console errors from chart code, no hydration errors, and a
JS-disabled pass against the production build.
