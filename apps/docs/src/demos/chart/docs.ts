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
  examples: [
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
  ],
};
