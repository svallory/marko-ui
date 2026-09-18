#!/usr/bin/env bash
# Local proof for the bare-page Lighthouse gate: audits the 12 representative
# bare pages with the SAME configs CI uses (.github/lighthouse/lighthouserc-bare-*.json)
# against a locally served build, asserts 100 on all four categories, then
# prints a per-page score table.
# Usage:  PORT=4412 bash scripts/run-bare-lighthouse.sh
# Expects the docs build output already built and served on $PORT (see
# scripts/ci/serve-docs.sh — wrangler dev --local, not a plain file server).
set -uo pipefail

PORT="${PORT:-4412}"
BASE="http://localhost:${PORT}"
PAGES="accordion button carousel color-picker combobox data-table date-picker dialog select slider tabs tooltip"

cd "$(dirname "${BASH_SOURCE[0]}")/.."

urls=()
for p in $PAGES; do
  urls+=(--collect.url="$BASE/bare/$p")
done

for preset in desktop mobile; do
  echo "== $preset =="
  rm -rf .lighthouseci ".lighthouseci-$preset"
  if ! flock /tmp/marko-ui-heavy.lock bunx @lhci/cli collect "${urls[@]}" \
      --config "../../.github/lighthouse/lighthouserc-bare-$preset.json"; then
    echo "collect failed for $preset"
    continue
  fi
  mv .lighthouseci ".lighthouseci-$preset"
  flock /tmp/marko-ui-heavy.lock bunx @lhci/cli assert \
    --config "../../.github/lighthouse/lighthouserc-bare-$preset.json" \
    && echo "ASSERT: all 4 categories = 100 on all 12 pages ($preset)" \
    || echo "ASSERT: FAILURES on $preset (table below)"
done

# Score table from the collected Lighthouse results.
bun -e '
import * as fs from "node:fs";
for (const preset of ["desktop", "mobile"]) {
  const dir = `.lighthouseci-${preset}`;
  if (!fs.existsSync(dir)) continue;
  const rows = [];
  for (const f of fs.readdirSync(dir).filter((f) => /^lhr-\d+\.json$/.test(f))) {
    const lhr = JSON.parse(fs.readFileSync(`${dir}/${f}`, "utf8"));
    const page = new URL(lhr.finalUrl).pathname.replace("/bare/", "");
    const c = lhr.categories;
    rows.push([page, c.performance.score, c.accessibility.score, c["best-practices"].score, c.seo.score]);
  }
  // lhci stores one lhr per collected run (3 per URL by default); keep the median row per page
  const byPage = new Map();
  for (const r of rows) {
    byPage.set(r[0], [...(byPage.get(r[0]) ?? []), r]);
  }
  const med = [...byPage.entries()].sort((a, b) => a[0].localeCompare(b[0])).map(([p, rs]) => {
    const cols = [1, 2, 3, 4].map((i) => rs.map((r) => r[i]).sort((a, b) => a - b)[Math.floor(rs.length / 2)]);
    return [p, ...cols];
  });
  console.log(`\n${preset}: page | perf | a11y | best-practices | seo`);
  for (const [p, ...s] of med) console.log(`${p} | ${s.map((x) => Math.round(x * 100)).join(" | ")}`);
}
'
