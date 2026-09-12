export const chart = {
  root: "mu-chart flex aspect-video justify-center text-xs [&_.recharts-cartesian-axis-tick_text]:fill-muted-foreground [&_.recharts-cartesian-grid_line[stroke='#ccc']]:stroke-border/50 [&_.recharts-curve.recharts-tooltip-cursor]:stroke-border [&_.recharts-dot[stroke='#fff']]:stroke-transparent [&_.recharts-layer]:outline-hidden [&_.recharts-polar-grid_[stroke='#ccc']]:stroke-border [&_.recharts-radial-bar-background-sector]:fill-muted [&_.recharts-rectangle.recharts-tooltip-cursor]:fill-muted [&_.recharts-reference-line_[stroke='#ccc']]:stroke-border [&_.recharts-sector]:outline-hidden [&_.recharts-sector[stroke='#fff']]:stroke-transparent [&_.recharts-surface]:outline-hidden",
  responsiveContainer: "recharts-responsive-container",
} as const;

export const grid = {
  root: "recharts-cartesian-grid",
  horizontal: "recharts-cartesian-grid-horizontal",
  vertical: "recharts-cartesian-grid-vertical",
} as const;

export const xAxis = {
  root: "recharts-cartesian-axis recharts-xAxis xAxis",
  ticks: "recharts-cartesian-axis-ticks",
  tick: "recharts-layer recharts-cartesian-axis-tick",
  tickText: "recharts-text recharts-cartesian-axis-tick-value",
} as const;

export const yAxis = {
  root: "recharts-cartesian-axis recharts-yAxis yAxis",
  ticks: "recharts-cartesian-axis-ticks",
  tick: "recharts-layer recharts-cartesian-axis-tick",
  tickText: "recharts-text recharts-cartesian-axis-tick-value",
} as const;

export const legend = {
  root: "flex items-center justify-center gap-4",
  paddingTop: "pb-3",
  paddingBottom: "pt-3",
  item: "flex items-center gap-1.5 [&>svg]:h-3 [&>svg]:w-3 [&>svg]:text-muted-foreground",
  swatch: "h-2 w-2 shrink-0 rounded-[2px]",
} as const;

export const tooltip = {
  root: "mu-chart-tooltip grid min-w-32 items-start",
  label: "font-medium",
  rows: "grid gap-1.5",
  row: "flex w-full flex-wrap items-stretch gap-2 [&>svg]:h-2.5 [&>svg]:w-2.5 [&>svg]:text-muted-foreground",
  rowItemsCenter: "items-center",
  indicator: "shrink-0 rounded-[2px] border-(--color-border) bg-(--color-bg)",
  indicatorDot: "h-2.5 w-2.5",
  indicatorLine: "w-1",
  indicatorDashed: "w-0 border-[1.5px] border-dashed bg-transparent",
  indicatorDashedNested: "my-0.5",
  rowContent: "flex flex-1 justify-between leading-none",
  rowContentNested: "items-end",
  rowContentDefault: "items-center",
  rowContentLabels: "grid gap-1.5",
  rowLabel: "text-muted-foreground",
  rowValue: "font-mono font-medium text-foreground tabular-nums",
} as const;

export const area = {
  wrapper: "recharts-wrapper",
  surface: "recharts-surface",
  cursorLayer: "recharts-layer",
  cursorPath: "recharts-curve recharts-tooltip-cursor",
  layer: "recharts-layer recharts-area",
  areaPath: "recharts-curve recharts-area-area",
  linePath: "recharts-curve recharts-area-curve",
} as const;

export const bar = {
  wrapper: "recharts-wrapper",
  surface: "recharts-surface",
  cursorLayer: "recharts-layer",
  cursorPath: "recharts-rectangle recharts-tooltip-cursor",
  yAxisRoot: "recharts-cartesian-axis recharts-yAxis yAxis",
  yAxisTicks: "recharts-cartesian-axis-ticks",
  yAxisTick: "recharts-layer recharts-cartesian-axis-tick",
  yAxisTickText: "recharts-text recharts-cartesian-axis-tick-value",
  layer: "recharts-layer recharts-bar",
  rectangles: "recharts-layer recharts-bar-rectangles",
  rectangleLayer: "recharts-layer recharts-bar-rectangle",
  rectangle: "recharts-rectangle",
  labelListLayer: "recharts-layer recharts-label-list",
  labelText: "recharts-text",
} as const;

export const line = {
  wrapper: "recharts-wrapper",
  surface: "recharts-surface",
  cursorLayer: "recharts-layer",
  cursorPath: "recharts-curve recharts-tooltip-cursor",
  layer: "recharts-layer recharts-line",
  linePath: "recharts-curve recharts-line-curve",
  dotsLayer: "recharts-layer recharts-line-dots",
  dot: "recharts-dot recharts-line-dot",
  labelListLayer: "recharts-layer recharts-label-list",
  labelText: "recharts-text",
} as const;

export const pie = {
  wrapper: "recharts-wrapper flex h-full w-full flex-col",
  surface: "recharts-surface",
  pieLayer: "recharts-layer recharts-pie",
  sectorLayer: "recharts-layer recharts-pie-sector",
  sector: "recharts-sector",
  labelLineLayer: "recharts-layer",
  labelLine: "recharts-curve recharts-pie-label-line",
  labelText: "recharts-text recharts-pie-label-text",
  sliceLabelLayer: "recharts-layer recharts-label-list",
} as const;
