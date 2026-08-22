// Hand-authored prose + example ordering for /docs/components/chart.
// The route pairs each `examples[].name` with the .marko file of the same
// name in this directory; the generated demos-manifest.ts is what actually
// resolves the component and its source text.
import type { ComponentDocs } from "../docs-types.ts";

export const docs: ComponentDocs = {
  description:
    "Beautiful charts. Built with d3 and Marko — server-rendered, themeable with CSS variables. A shadcn theme's `--chart-1..5` variables restyle every chart with zero changes. Text scales with container width (the SVG uses a fixed viewBox — the price of zero-JS SSR); only the tooltip hydrates.",
  // Tags are registered by the taglib (package install or `marko-ui
  // init`), so no import is required. The explicit-import form is
  // documented as the override/escape hatch.
  usageTags: `<Chart>, <BarChart>`,
  importSnippet: `import Chart from "@/components/ui/chart/chart.marko";
import BarChart from "@/components/ui/chart/bar.marko";`,
  usageSnippet: `<Chart config=chartConfig>
  <BarChart data=chartData config=chartConfig xKey="month">
    <@series dataKey="desktop" radius=4/>
  </BarChart>
</Chart>`,
  // BLOCKED (parity — missingMappedTargets: "Theming", "CSS Variables"):
  // upstream's "Theming" + "CSS Variables" sections (base/chart.mdx) are
  // their own top-level headings. `ComponentDocs` (docs-types.ts) has no
  // `styling`/`theming` field, and +page.marko has no Styling/Theming
  // section renderer (only Installation/Usage/Concepts/Composition/
  // Examples/Accessibility/API Reference) — a real template gap, not
  // something closeable from this demo directory. `tooling/parity/
  // coverage.ts`'s `ourSectionsFor` never emits a heading titled "Theming"
  // or "CSS Variables", so `isTargetPresent` can't find a match no matter
  // what prose lives in this file. The content itself IS fully ported below
  // into `concepts` (the only hand-authored slot available for a compound
  // component, since `isCompound` is true here — chart has 10 parts under
  // packages/shadcn/ui/chart/ — so the page renders the auto-generated
  // composition tree instead of a hand-authored Composition section, and
  // `concepts` is the only remaining "read before using" slot). Nothing is
  // missing from the reader's perspective; only the checker's per-heading
  // presence check can't see it.
  concepts:
    "Every chart takes the same `config` object twice: once on `<Chart>` (which emits a scoped `<style>` resolving `--color-<key>` per theme) and again on the chart tag itself (Marko has no context/provider primitive, so the config can't be read implicitly by descendants). Each config entry's `color` can be a literal (`\"#2563eb\"`), an `hsl()`/`oklch()` string, or a `var(--chart-1)` reference into the 5 `--chart-1`..`--chart-5` custom properties a shadcn theme defines for light and dark — swap the theme and every chart restyles with zero code changes. Reference a resolved color from series data or Tailwind with `var(--color-<key>)`, e.g. `fill=\"var(--color-desktop)\"` or a `fill-(--color-desktop)` utility class.",
  examples: [
    {
      name: "chart-demo",
      title: "Bar Chart - Interactive",
      description:
        "The hero interactive demo: a series-toggle header swaps which `@series` the chart renders, backed by plain demo-file `<let>` state — no primitive changes needed.",
    },
    {
      name: "chart-example",
      title: "Your First Chart",
      description:
        "The minimal composition: `<Chart>` wrapping a `<BarChart>` with two `@series`, grid and tooltip both off.",
    },
    {
      name: "chart-example-grid",
      title: "Add a Grid",
      description:
        "The same chart with `grid` turned on — horizontal `CartesianGrid` lines behind the bars.",
    },
    {
      name: "chart-example-axis",
      title: "Add an Axis",
      description:
        "Grid plus an `xTickFormatter` that slices each month name down to 3 letters, with `tickMargin=10`.",
    },
    {
      name: "chart-example-tooltip",
      title: "Add Tooltip",
      description:
        "Grid, axis, and the default hover tooltip (`tooltip` defaults to `true` — shown here explicitly to match the step-by-step build-up).",
    },
    {
      name: "chart-example-legend",
      title: "Add Legend",
      description:
        "The full build: grid, axis, tooltip, and `legend=\"bottom\"` rendering a `<ChartLegendContent>`-equivalent swatch row.",
    },
    {
      name: "chart-bar-default",
      title: "Bar Chart",
      description:
        "A single-series bar chart. Colors flow from `chartConfig` through `--color-<key>` variables — never resolved in JS.",
    },
    {
      name: "chart-bar-multiple",
      title: "Bar Chart - Multiple",
      description:
        "Multiple `@series` split each band. Pass `indicator=\"dashed\"` to change the tooltip indicator.",
    },
    {
      name: "chart-line-default",
      title: "Line Chart",
      description:
        "A single-series line chart with a natural curve. Pass `dot` on a series to render point markers.",
    },
    {
      name: "chart-line-multiple",
      title: "Line Chart - Multiple",
      description:
        "Multiple lines share the same y scale. `type` picks the curve: `natural`, `linear`, `monotone`, or `step`.",
    },
    {
      name: "chart-area-default",
      title: "Area Chart",
      description:
        "A single-series area chart. The fill uses the series color at `fillOpacity` 0.4, like the shadcn demos.",
    },
    {
      name: "chart-area-gradient",
      title: "Area Chart - Gradient",
      description:
        "Stacked areas with `gradient` fills — per-series `<linearGradient>` defs fading the series color from 0.8 to 0.1 opacity.",
    },
    {
      name: "chart-pie-simple",
      title: "Pie Chart",
      description:
        "Slice colors come from each row's `fill` (e.g. `var(--color-chrome)`), resolved by the chart's scoped style — exactly like shadcn's pie demos.",
    },
    {
      name: "chart-pie-donut",
      title: "Pie Chart - Donut with Text",
      description:
        "Pass `innerRadius` for a donut and `centerLabel` to render content in the middle.",
    },
    {
      name: "chart-tooltip",
      title: "Tooltip Anatomy",
      description:
        "The four tooltip pieces — label, name, value, and indicator — shown at their default sizes with the `indicator` variants (`dot`, `line`, `dashed`).",
    },
    {
      name: "chart-rtl",
      title: "RTL",
      description:
        "Static Arabic labels under a `dir=\"rtl\"` wrapper. **Deviation from upstream:** shadcn's RTL demo also mirrors the plot itself (grid orientation, axis direction); our `BarChart` has no `orientation`/`reversed` props yet, so only the labels/legend/tooltip flip — the plot geometry stays left-to-right. See the in-file comment in `chart-rtl.marko`.",
    },
  ],
  accessibilityNotes: [
    "Charts are pure SSR SVG plus one small client hydration for hover tooltips — there is no keyboard navigation or `accessibilityLayer`-equivalent focus ring today (upstream's Recharts `accessibilityLayer` prop, which adds keyboard access and screen-reader summaries, has no port here — a component-source gap, not a docs gap).",
    "Chart color is never the only signal in a well-built chart: pair every series color with a label in the legend or tooltip (`ChartConfig.label`) rather than color alone.",
    "The tooltip's indicator + label + value are read together in DOM order, so screen readers announce a coherent row per series when the tooltip is inspected.",
  ],
};
