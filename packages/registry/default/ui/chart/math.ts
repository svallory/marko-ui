// d3 wrappers + geometry for the chart components. Pure math — no DOM,
// no d3-selection; Marko templates emit all SVG. Everything type-heavy
// (generics, method chains) lives here because .marko files can't hold
// inline generics or indented method-chain continuations.

import { scaleBand, scaleLinear, type ScaleBand, type ScaleLinear } from "d3-scale";
import {
  arc,
  area,
  line,
  pie,
  stack,
  stackOffsetExpand,
  curveLinear,
  curveMonotoneX,
  curveNatural,
  curveStep,
  type PieArcDatum,
  type Series,
} from "d3-shape";
import { max, min } from "d3-array";

export type Row = Record<string, unknown>;

export interface Margin {
  top: number;
  right: number;
  bottom: number;
  left: number;
}

export interface PlotArea {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface CartesianCtx {
  /** viewBox size */
  width: number;
  height: number;
  margin: Margin;
  plot: PlotArea;
  xBand: ScaleBand<string>;
  y: ScaleLinear<number, number>;
  // Carried along so partials/chart tags don't need to re-thread them.
  data: Row[];
  xKey: string;
  seriesKeys: string[];
}

const ZERO_MARGIN: Margin = { top: 0, right: 0, bottom: 0, left: 0 };

function numberAt(row: Row, key: string): number {
  const value = row[key];
  return typeof value === "number" ? value : Number(value ?? 0);
}

export interface CartesianCtxOptions {
  data: Row[];
  xKey: string;
  seriesKeys: string[];
  width: number;
  height: number;
  margin?: Partial<Margin>;
  /** Vertical space reserved for the x axis (recharts default: 30). */
  xAxisHeight: number;
  stacked?: boolean;
  yDomain?: [number, number];
  /**
   * Band paddings. Defaults match recharts' bar defaults
   * (barCategoryGap "10%" of the band on each side): inner 0.2, outer 0.1.
   * Line/area charts pass 0/0 so points sit at band centers spanning the plot.
   */
  paddingInner?: number;
  paddingOuter?: number;
  /** "expand" ⇒ y domain is fixed to [0, 1] (100% stacked), like recharts' stackOffset="expand". */
  stackOffset?: "expand";
}

export function cartesianCtx(opts: CartesianCtxOptions): CartesianCtx {
  const margin: Margin = { ...ZERO_MARGIN, ...opts.margin };
  const plot: PlotArea = {
    x: margin.left,
    y: margin.top,
    width: opts.width - margin.left - margin.right,
    height: opts.height - margin.top - margin.bottom - opts.xAxisHeight,
  };

  const xBand = scaleBand<string>()
    .domain(opts.data.map((row) => String(row[opts.xKey])))
    .range([plot.x, plot.x + plot.width])
    .paddingInner(opts.paddingInner ?? 0.2)
    .paddingOuter(opts.paddingOuter ?? 0.1);

  let domain = opts.yDomain;
  if (!domain && opts.stackOffset === "expand") {
    domain = [0, 1];
  }
  if (!domain) {
    let dataMax: number;
    let dataMin: number;
    if (opts.stacked) {
      const sums = opts.data.map((row) =>
        opts.seriesKeys.reduce((total, key) => total + numberAt(row, key), 0),
      );
      dataMax = max(sums) ?? 0;
      dataMin = min(sums.map((sum) => Math.min(sum, 0))) ?? 0;
    } else {
      const values = opts.data.flatMap((row) =>
        opts.seriesKeys.map((key) => numberAt(row, key)),
      );
      dataMax = max(values) ?? 0;
      dataMin = min(values) ?? 0;
    }
    // recharts default: [min(0, dataMin), niceMax]
    domain = [Math.min(0, dataMin), dataMax];
  }

  const y = scaleLinear()
    .domain(domain)
    .range([plot.y + plot.height, plot.y])
    .nice();

  return {
    width: opts.width,
    height: opts.height,
    margin,
    plot,
    xBand,
    y,
    data: opts.data,
    xKey: opts.xKey,
    seriesKeys: opts.seriesKeys,
  };
}

export const CURVES = {
  natural: curveNatural,
  linear: curveLinear,
  monotone: curveMonotoneX,
  step: curveStep,
} as const;

export type CurveType = keyof typeof CURVES;

export function linePath(
  data: Row[],
  xAccessor: (row: Row, index: number) => number,
  yAccessor: (row: Row, index: number) => number,
  curve: CurveType = "natural",
): string {
  const generator = line<Row>()
    .x(xAccessor)
    .y(yAccessor)
    .curve(CURVES[curve]);
  return generator(data) ?? "";
}

export function areaPaths(
  data: Row[],
  xAccessor: (row: Row, index: number) => number,
  y0Accessor: (row: Row, index: number) => number,
  y1Accessor: (row: Row, index: number) => number,
  curve: CurveType = "natural",
): { area: string; line: string } {
  const areaGenerator = area<Row>()
    .x(xAccessor)
    .y0(y0Accessor)
    .y1(y1Accessor)
    .curve(CURVES[curve]);
  const lineGenerator = line<Row>()
    .x(xAccessor)
    .y(y1Accessor)
    .curve(CURVES[curve]);
  return { area: areaGenerator(data) ?? "", line: lineGenerator(data) ?? "" };
}

/**
 * d3 stack over `keys` — for stacked bars/areas. Output[s][i] = [y0, y1].
 * `offset: "expand"` normalizes each row's stack to [0, 1] (recharts'
 * `stackOffset="expand"`, used by chart-area-stacked-expand) — every layer's
 * [y0, y1] becomes a fraction of that row's total.
 */
export function stackSeries(
  data: Row[],
  keys: string[],
  options?: { offset?: "expand" },
): Series<Row, string>[] {
  const generator = stack<Row, string>()
    .keys(keys)
    .value((row, key) => numberAt(row, key));
  if (options?.offset === "expand") {
    generator.offset(stackOffsetExpand);
  }
  return generator(data);
}

export type CornerRadius = number | [number, number, number, number];

/**
 * Rounded-rect path with recharts Rectangle parity: a number radius rounds
 * all 4 corners; a [topLeft, topRight, bottomRight, bottomLeft] tuple rounds
 * individually (recharts accepts this for stacked bars). Radii are clamped
 * to half the width/height.
 */
export function roundedRectPath(
  x: number,
  y: number,
  width: number,
  height: number,
  radius: CornerRadius = 0,
): string {
  const limit = Math.min(Math.abs(width) / 2, Math.abs(height) / 2);
  const clamp = (value: number) => Math.max(0, Math.min(limit, value));
  const corners: [number, number, number, number] =
    typeof radius === "number" ? [radius, radius, radius, radius] : radius;
  const topLeft = clamp(corners[0]);
  const topRight = clamp(corners[1]);
  const bottomRight = clamp(corners[2]);
  const bottomLeft = clamp(corners[3]);

  return (
    `M ${x},${y + topLeft}` +
    (topLeft > 0 ? ` A ${topLeft},${topLeft},0,0,1,${x + topLeft},${y}` : "") +
    ` L ${x + width - topRight},${y}` +
    (topRight > 0
      ? ` A ${topRight},${topRight},0,0,1,${x + width},${y + topRight}`
      : "") +
    ` L ${x + width},${y + height - bottomRight}` +
    (bottomRight > 0
      ? ` A ${bottomRight},${bottomRight},0,0,1,${x + width - bottomRight},${y + height}`
      : "") +
    ` L ${x + bottomLeft},${y + height}` +
    (bottomLeft > 0
      ? ` A ${bottomLeft},${bottomLeft},0,0,1,${x},${y + height - bottomLeft}`
      : "") +
    " Z"
  );
}

export interface PieArc {
  /** The `d` attribute for the sector's <path>. */
  path: string;
  row: Row;
  index: number;
  value: number;
  startAngle: number;
  endAngle: number;
  /** [x, y] centroid relative to the pie center — for labels. */
  centroid: [number, number];
}

export interface PieArcsOptions {
  innerRadius: number;
  outerRadius: number;
  /** Degrees, like recharts' paddingAngle. */
  paddingAngle?: number;
}

/**
 * d3 pie() with sort(null) — keeps input order like recharts. d3's default
 * start angle (0 at 12 o'clock, clockwise) matches how the shadcn pie demos
 * render.
 */
export function pieArcs(
  data: Row[],
  valueKey: string,
  opts: PieArcsOptions,
): PieArc[] {
  const pieGenerator = pie<Row>()
    .sort(null)
    .value((row) => numberAt(row, valueKey))
    .padAngle(((opts.paddingAngle ?? 0) * Math.PI) / 180);
  const arcGenerator = arc<PieArcDatum<Row>>()
    .innerRadius(opts.innerRadius)
    .outerRadius(opts.outerRadius);

  return pieGenerator(data).map((datum) => ({
    path: arcGenerator(datum) ?? "",
    row: datum.data,
    index: datum.index,
    value: datum.value,
    startAngle: datum.startAngle,
    endAngle: datum.endAngle,
    centroid: arcGenerator.centroid(datum),
  }));
}

export interface XTick {
  value: string;
  x: number;
}

/**
 * Thins a list of x-position ticks so consecutive kept ticks are at least
 * `minGap` pixels apart — recharts' XAxis `minTickGap` (used by every
 * shadcn chart with a dense date-series x axis, e.g. chart-area-interactive's
 * 90 daily points). Always keeps the first tick; each subsequent tick is
 * kept only if it's `minGap` past the last KEPT tick's x position.
 */
export function thinTicksByGap<T extends { x: number }>(ticks: T[], minGap: number): T[] {
  if (minGap <= 0 || ticks.length === 0) return ticks;
  const kept: T[] = [ticks[0]];
  let lastX = ticks[0].x;
  for (let i = 1; i < ticks.length; i++) {
    const tick = ticks[i];
    if (tick.x - lastX >= minGap) {
      kept.push(tick);
      lastX = tick.x;
    }
  }
  return kept;
}

export interface YTick {
  value: number;
  y: number;
}

/** One tick per band, positioned at the band center. */
export function xTicks(ctx: CartesianCtx): XTick[] {
  const halfBand = ctx.xBand.bandwidth() / 2;
  return ctx.xBand.domain().map((value) => ({
    value,
    x: (ctx.xBand(value) ?? 0) + halfBand,
  }));
}

/** Nice y ticks (d3 `ticks`) with their pixel positions. */
export function yTicks(ctx: CartesianCtx, count = 5): YTick[] {
  return ctx.y.ticks(count).map((value) => ({ value, y: ctx.y(value) }));
}

/** Center x of a band by data index — line/area point positions. */
export function bandCenter(ctx: CartesianCtx, index: number): number {
  const value = ctx.xBand.domain()[index];
  if (value === undefined) return ctx.plot.x;
  return (ctx.xBand(value) ?? 0) + ctx.xBand.bandwidth() / 2;
}

/**
 * Pointer offsetX (CSS pixels) -> data index. Scales by viewBox/client width
 * (the SVG is scaled by CSS), then locates the band step under the pointer.
 * Clamped to [0, n-1]; returns -1 outside the plot area.
 */
export function bandIndexFromPointer(
  offsetX: number,
  clientWidth: number,
  ctx: CartesianCtx,
): number {
  const domain = ctx.xBand.domain();
  const firstValue = domain[0];
  if (firstValue === undefined || clientWidth <= 0) return -1;
  const scaledX = offsetX * (ctx.width / clientWidth);
  if (scaledX < ctx.plot.x || scaledX > ctx.plot.x + ctx.plot.width) return -1;
  const step = ctx.xBand.step();
  const first = ctx.xBand(firstValue) ?? 0;
  const start = first - ctx.xBand.paddingInner() * step * 0.5;
  const index = Math.floor((scaledX - start) / step);
  return Math.max(0, Math.min(domain.length - 1, index));
}

/**
 * The `d` for the tooltip cursor rect covering the whole band step at
 * `index`, spanning the plot height (recharts bar-chart cursor).
 */
export function bandCursorPath(ctx: CartesianCtx, index: number): string {
  const domain = ctx.xBand.domain();
  const value = domain[index];
  if (value === undefined) return "";
  const step = ctx.xBand.step();
  const x = (ctx.xBand(value) ?? 0) - ctx.xBand.paddingInner() * step * 0.5;
  return roundedRectPath(x, ctx.plot.y, step, ctx.plot.height, 0);
}

// ---------------------------------------------------------------------------
// Horizontal layout (recharts' <BarChart layout="vertical">, which despite
// the name draws horizontal bars: a category scale banded on the Y axis, a
// linear value scale on the X axis, bars extending rightward from x=0).
// A separate context type rather than an `orientation` flag on CartesianCtx:
// the two contexts have genuinely different roles for x/y (band-on-y vs
// band-on-x), so reusing one shape would need every consumer to branch on
// orientation. Keeping them distinct means bar.marko's vertical path is
// untouched and the horizontal path is additive.
export interface HorizontalCtx {
  width: number;
  height: number;
  margin: Margin;
  plot: PlotArea;
  /** Category scale, banded on the Y axis. */
  yBand: ScaleBand<string>;
  /** Value scale, linear on the X axis — bars run from x(0) to x(value). */
  x: ScaleLinear<number, number>;
  data: Row[];
  yKey: string;
  seriesKeys: string[];
}

export interface HorizontalCtxOptions {
  data: Row[];
  /** Category field, e.g. "browser" — becomes the Y-axis band. */
  yKey: string;
  seriesKeys: string[];
  width: number;
  height: number;
  margin?: Partial<Margin>;
  /** Horizontal space reserved for the (hidden or visible) Y axis labels. */
  yAxisWidth?: number;
  stacked?: boolean;
  xDomain?: [number, number];
  paddingInner?: number;
  paddingOuter?: number;
}

export function horizontalCtx(opts: HorizontalCtxOptions): HorizontalCtx {
  const margin: Margin = { ...ZERO_MARGIN, ...opts.margin };
  const yAxisWidth = opts.yAxisWidth ?? 0;
  const plot: PlotArea = {
    x: margin.left + yAxisWidth,
    y: margin.top,
    width: opts.width - margin.left - margin.right - yAxisWidth,
    height: opts.height - margin.top - margin.bottom,
  };

  const yBand = scaleBand<string>()
    .domain(opts.data.map((row) => String(row[opts.yKey])))
    .range([plot.y, plot.y + plot.height])
    .paddingInner(opts.paddingInner ?? 0.2)
    .paddingOuter(opts.paddingOuter ?? 0.1);

  let domain = opts.xDomain;
  if (!domain) {
    let dataMax: number;
    let dataMin: number;
    if (opts.stacked) {
      const sums = opts.data.map((row) =>
        opts.seriesKeys.reduce((total, key) => total + numberAt(row, key), 0),
      );
      dataMax = max(sums) ?? 0;
      dataMin = min(sums.map((sum) => Math.min(sum, 0))) ?? 0;
    } else {
      const values = opts.data.flatMap((row) =>
        opts.seriesKeys.map((key) => numberAt(row, key)),
      );
      dataMax = max(values) ?? 0;
      dataMin = min(values) ?? 0;
    }
    domain = [Math.min(0, dataMin), dataMax];
  }

  const x = scaleLinear()
    .domain(domain)
    .range([plot.x, plot.x + plot.width])
    .nice();

  return {
    width: opts.width,
    height: opts.height,
    margin,
    plot,
    yBand,
    x,
    data: opts.data,
    yKey: opts.yKey,
    seriesKeys: opts.seriesKeys,
  };
}

export interface HTick {
  value: string;
  y: number;
}

/** One tick per band, positioned at the band center — for the Y (category) axis. */
export function hBandTicks(ctx: HorizontalCtx): HTick[] {
  const halfBand = ctx.yBand.bandwidth() / 2;
  return ctx.yBand.domain().map((value) => ({
    value,
    y: (ctx.yBand(value) ?? 0) + halfBand,
  }));
}

/** Center y of a band by data index. */
export function hBandCenter(ctx: HorizontalCtx, index: number): number {
  const value = ctx.yBand.domain()[index];
  if (value === undefined) return ctx.plot.y;
  return (ctx.yBand(value) ?? 0) + ctx.yBand.bandwidth() / 2;
}

/**
 * Pointer offsetY (CSS pixels) -> data index, for horizontal-layout hover.
 * Mirrors bandIndexFromPointer but on the Y axis.
 */
export function hBandIndexFromPointer(
  offsetY: number,
  clientHeight: number,
  ctx: HorizontalCtx,
): number {
  const domain = ctx.yBand.domain();
  const firstValue = domain[0];
  if (firstValue === undefined || clientHeight <= 0) return -1;
  const scaledY = offsetY * (ctx.height / clientHeight);
  if (scaledY < ctx.plot.y || scaledY > ctx.plot.y + ctx.plot.height) return -1;
  const step = ctx.yBand.step();
  const first = ctx.yBand(firstValue) ?? 0;
  const start = first - ctx.yBand.paddingInner() * step * 0.5;
  const index = Math.floor((scaledY - start) / step);
  return Math.max(0, Math.min(domain.length - 1, index));
}

/** Tooltip cursor rect for the whole band at `index`, spanning the plot width. */
export function hBandCursorPath(ctx: HorizontalCtx, index: number): string {
  const domain = ctx.yBand.domain();
  const value = domain[index];
  if (value === undefined) return "";
  const step = ctx.yBand.step();
  const y = (ctx.yBand(value) ?? 0) - ctx.yBand.paddingInner() * step * 0.5;
  return roundedRectPath(ctx.plot.x, y, ctx.plot.width, step, 0);
}
