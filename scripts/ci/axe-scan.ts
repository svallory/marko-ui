/**
 * axe-core WCAG scan across the docs home page and every component reference
 * page (/docs/components/<name>, one per packages/registry/default/ui dir).
 *
 * Runs against an already-serving docs server (scripts/ci/serve-docs.sh);
 * override the target with DOCS_BASE_URL. Writes a JSON summary (fed to
 * scripts/ci/badge.ts) and exits non-zero when any violation is found, so CI
 * catches a11y regressions.
 *
 * Usage: bun scripts/ci/axe-scan.ts <out-file>
 */
import { readdirSync, readFileSync, writeFileSync } from "node:fs";
import { createRequire } from "node:module";
import { join } from "node:path";
import type { Page } from "playwright";

const require = createRequire(import.meta.url);
const playwright = require("playwright") as typeof import("playwright");
const axeSource = readFileSync(require.resolve("axe-core/axe.min.js"), "utf8");

const BASE_URL = process.env.DOCS_BASE_URL ?? "http://localhost:3000";
const outFile = process.argv[2];
if (!outFile) {
  console.error("usage: bun scripts/ci/axe-scan.ts <out-file>");
  process.exit(1);
}

const components = readdirSync(join(process.cwd(), "packages/registry/default/ui"), {
  withFileTypes: true,
})
  .filter((entry) => entry.isDirectory())
  .map((entry) => entry.name)
  .sort();

const urls = ["/", ...components.map((name) => `/docs/components/${name}`)];

interface Violation {
  id: string;
  impact: string | null;
  help: string;
  nodes: number;
}

/** Wait for Marko resumption + Zag machine start (same signal the test helpers use). */
async function waitForHydration(page: Page): Promise<void> {
  await page
    .waitForFunction(() => document.querySelector("[data-ssr]") === null, undefined, {
      timeout: 15_000,
    })
    .catch(() => {
      // Static pages (no machines) never carry data-ssr; a timeout here on a
      // hydrated page would have failed the earlier networkidle wait instead.
    });
}

const browser = await playwright.chromium.launch({ headless: true });
const context = await browser.newContext({
  colorScheme: "light",
  viewport: { width: 1280, height: 900 },
});

const perPage: Record<string, Violation[]> = {};
let totalViolations = 0;

for (const path of urls) {
  const page = await context.newPage();
  try {
    await page.goto(`${BASE_URL}${path}`, { waitUntil: "networkidle", timeout: 30_000 });
    await waitForHydration(page);
    await page.addScriptTag({ content: axeSource });
    const results = (await page.evaluate(async () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const axe = (window as any).axe;
      return axe.run(document, { resultTypes: ["violations"] });
    })) as { violations: { id: string; impact: string | null; help: string; nodes: unknown[] }[] };

    const violations = results.violations.map((violation) => ({
      id: violation.id,
      impact: violation.impact,
      help: violation.help,
      nodes: violation.nodes.length,
    }));
    if (violations.length > 0) {
      perPage[path] = violations;
      totalViolations += violations.reduce((sum, v) => sum + v.nodes, 0);
      console.error(`✗ ${path}: ${violations.map((v) => `${v.id}×${v.nodes}`).join(", ")}`);
    } else {
      console.log(`✓ ${path}`);
    }
  } finally {
    await page.close();
  }
}

await context.close();
await browser.close();

writeFileSync(
  outFile,
  JSON.stringify(
    {
      components: components.length,
      pagesScanned: urls.length,
      violations: totalViolations,
      perPage,
    },
    null,
    2,
  ) + "\n",
);

console.log(
  `\naxe scan: ${urls.length} pages, ${components.length} components, ${totalViolations} violations`,
);
process.exit(totalViolations > 0 ? 1 : 0);
