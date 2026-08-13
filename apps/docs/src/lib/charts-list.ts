/**
 * The chart type catalog surfaced by /charts and /charts/$type.
 *
 * Mirrors shadcn's ChartsNav links (data/shadcn-ui/apps/v4/components/
 * charts-nav.tsx) restricted to the 4 types we have primitives for — area,
 * bar, line, pie. Radar/Radial/Tooltips are intentionally omitted (see
 * TODO.md's "/charts — skipped" section): we have no radar/radial-bar chart
 * primitive, and the tooltip gallery is out of scope for this task.
 */
export interface ChartTypeEntry {
  slug: "area" | "bar" | "line" | "pie";
  /** ChartsNav label, e.g. "Area Charts". */
  label: string;
}

export const CHART_TYPES: ChartTypeEntry[] = [
  { slug: "area", label: "Area Charts" },
  { slug: "bar", label: "Bar Charts" },
  { slug: "line", label: "Line Charts" },
  { slug: "pie", label: "Pie Charts" },
];

export function isChartType(value: string): value is ChartTypeEntry["slug"] {
  return CHART_TYPES.some((entry) => entry.slug === value);
}
