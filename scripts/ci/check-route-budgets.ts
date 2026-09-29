/**
 * Per-route first-load size guard (#87).
 *
 * A route's first-load cost is the gzip -9 size of every JS chunk statically
 * reachable from its `<script src>` entries (see lib/route-closure.ts). Budgets
 * live in scripts/ci/route-budgets.json as gzip bytes = the post-split
 * measurement + 5% headroom. A route over budget fails with a table; a route
 * with a budget that was not built, or a measured route with no budget, also
 * fails so the file cannot silently rot.
 *
 * Usage:
 *   bun scripts/ci/check-route-budgets.ts [publicDir] [budgetsFile]
 *   bun scripts/ci/check-route-budgets.ts --update   # rewrite budgets from the current build
 * (defaults: apps/docs/dist/public, scripts/ci/route-budgets.json — run after the docs build)
 *
 * Raising a budget is a deliberate act: re-run with --update in the PR that
 * grows the route, so the diff shows the new number.
 */
import { readFileSync, writeFileSync } from "node:fs";
import { closureFor } from "./lib/route-closure.ts";
import { evaluate, formatTable, withHeadroom, type Budgets } from "./lib/route-budgets.ts";

const args = process.argv.slice(2);
const update = args.includes("--update");
const [publicDir = "apps/docs/dist/public", budgetsFile = "scripts/ci/route-budgets.json"] = args.filter((a) => !a.startsWith("--"));

const budgets: Budgets = JSON.parse(readFileSync(budgetsFile, "utf8"));
const routes = Object.keys(budgets);

const actuals: Record<string, number> = {};
for (const route of routes) actuals[route] = closureFor(publicDir, route).gzip;

if (update) {
  const next: Budgets = {};
  for (const route of routes) next[route] = withHeadroom(actuals[route]!);
  writeFileSync(budgetsFile, `${JSON.stringify(next, null, 2)}\n`);
  console.log(`check-route-budgets: rewrote ${budgetsFile}`);
  console.log(formatTable(evaluate(actuals, next)));
  process.exit(0);
}

const rows = evaluate(actuals, budgets);
console.log(formatTable(rows));
if (rows.some((r) => !r.ok)) {
  console.error("\nA route's first-load JS exceeds its budget. If the growth is intended, run `bun scripts/ci/check-route-budgets.ts --update` and commit the new numbers.");
  process.exit(1);
}
