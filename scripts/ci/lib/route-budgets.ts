/**
 * Pure logic for the per-route first-load budget guard
 * (scripts/ci/check-route-budgets.ts). Kept free of I/O so it can be
 * unit-tested with plain objects.
 */
export type Budgets = Record<string, number>;
export type Actuals = Record<string, number>;
export type Row = { route: string; actual: number | null; budget: number | null; ok: boolean; note: string };

/** Headroom applied on top of measured gzip bytes when (re)generating budgets. */
export const HEADROOM = 1.05;

export function evaluate(actuals: Actuals, budgets: Budgets): Row[] {
  const routes = [...new Set([...Object.keys(budgets), ...Object.keys(actuals)])].sort();
  return routes.map((route) => {
    const actual = actuals[route] ?? null;
    const budget = budgets[route] ?? null;
    if (budget === null) return { route, actual, budget, ok: false, note: "no budget for measured route" };
    if (actual === null) return { route, actual, budget, ok: false, note: "budgeted route was not measured" };
    return actual <= budget
      ? { route, actual, budget, ok: true, note: "" }
      : { route, actual, budget, ok: false, note: `over by ${actual - budget} B` };
  });
}

export function formatTable(rows: Row[]): string {
  const kb = (n: number | null) => (n === null ? "-" : `${(n / 1024).toFixed(1)} KB`);
  const w = Math.max(5, ...rows.map((r) => r.route.length));
  const head = `${"route".padEnd(w)}  ${"actual".padStart(10)}  ${"budget".padStart(10)}  status`;
  const lines = rows.map(
    (r) => `${r.route.padEnd(w)}  ${kb(r.actual).padStart(10)}  ${kb(r.budget).padStart(10)}  ${r.ok ? "ok" : `FAIL ${r.note}`}`,
  );
  return [head, ...lines].join("\n");
}

/** Round up to a whole byte after applying headroom. */
export const withHeadroom = (gzipBytes: number): number => Math.ceil(gzipBytes * HEADROOM);
