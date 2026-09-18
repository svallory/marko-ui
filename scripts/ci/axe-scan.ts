/**
 * axe-core WCAG scan across every component's docs reference page
 * (/docs/components/<name>). The scan is scoped to the hero
 * `[data-slot="component-preview"]` demo stage, so the result measures the
 * component itself, not the docs-site chrome around it.
 *
 * Runs against an already-serving docs server (scripts/ci/serve-docs.sh);
 * override the target with DOCS_BASE_URL. Writes a JSON summary (fed to
 * scripts/ci/badge.ts) and exits non-zero when any violation is found, so CI
 * catches a11y regressions.
 *
 * Usage: bun scripts/ci/axe-scan.ts <out-file>
 */
import { readFileSync, writeFileSync } from "node:fs";
import { createRequire } from "node:module";
import type { Page } from "playwright";
import { DOCUMENTED_COMPONENTS } from "../../apps/docs/src/demos/demos-manifest.ts";

const require = createRequire(import.meta.url);
const playwright = require("playwright") as typeof import("playwright");
const axeSource = readFileSync(require.resolve("axe-core/axe.min.js"), "utf8");

const BASE_URL = process.env.DOCS_BASE_URL ?? "http://localhost:3000";
const outFile = process.argv[2];
if (!outFile) {
  console.error("usage: bun scripts/ci/axe-scan.ts <out-file>");
  process.exit(1);
}

const { OPEN_STATES, NO_OPEN_STATE } = await import("./axe-open-states.ts");

// The demo stage only: the outer `[data-slot="component-preview"]` wrapper
// also contains the docs code-peek (shiki <pre>), which is docs chrome, not
// component — the scan must not see it.
const STAGE_SELECTOR = '[data-slot="component-preview"] [data-slot="preview"]';

const components = [...DOCUMENTED_COMPONENTS].sort();

// Bookkeeping assertion
const missing = components.filter(c => !OPEN_STATES[c] && !NO_OPEN_STATE[c]);
if (missing.length > 0) {
  console.error("Missing components in axe-open-states.ts maps:", missing);
  process.exit(1);
}

const urls = components.map((name) => ({ name, path: `/docs/components/${name}` }));

interface Violation {
  id: string;
  impact: string | null;
  help: string;
  nodes: number;
  targets: { target: string; html: string }[];
}

/**
 * Page-structure rules that cannot be judged at component scope: the docs
 * component pages render inside the full docs layout, so landmarks/headings
 * belong to the page, not to the component under test. The scan itself is
 * scoped to the hero demo stage (see axe.run include below); these are
 * disabled as well because landmark rules still evaluate page-wide context.
 */
const PAGE_SCOPE_RULES = [
  "landmark-main-is-top-level",
  "landmark-no-duplicate-main",
  "landmark-unique",
];

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

for (const { name, path } of urls) {
  const page = await context.newPage();
  try {
    await page.goto(`${BASE_URL}${path}`, { waitUntil: "networkidle", timeout: 30_000 });
    await waitForHydration(page);
    await page.addScriptTag({ content: axeSource });
    
    // Closed state scan
    const results = (await page.evaluate(async (disabledRules: string[]) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const axe = (window as any).axe;
      // Scope to the demo stage only (excluding the code-peek which is inside the outer component-preview wrapper).
      return axe.run(
        { include: [[STAGE_SELECTOR]] },
        {
          resultTypes: ["violations"],
          rules: Object.fromEntries(disabledRules.map((rule) => [rule, { enabled: false }])),
        },
      );
    }, PAGE_SCOPE_RULES)) as {
      violations: {
        id: string;
        impact: string | null;
        help: string;
        nodes: { target: string[]; html: string }[];
      }[];
    };

    const violations: Violation[] = results.violations.map((violation) => ({
      id: violation.id,
      impact: violation.impact,
      help: violation.help,
      nodes: violation.nodes.length,
      targets: violation.nodes.map((node) => ({
        target: node.target.join(" "),
        html: node.html.slice(0, 300),
      })),
    }));

    // Open state scan
    const openState = OPEN_STATES[name];
    if (openState) {
      try {
        const trigger = page.locator(openState.trigger).first();
        if (openState.open === "right-click") {
          await trigger.click({ button: "right" });
        } else if (openState.open === "hover") {
          await trigger.hover();
        } else {
          await trigger.click();
        }

        const content = page.locator(openState.content).first();
        await content.waitFor({ state: "visible", timeout: 5000 });
        await page.waitForTimeout(300); // animation buffer

        // Scope: inline (non-portaled) content is a descendant of the hero
        // stage, so prefix the selector with the stage ancestor — the raw
        // content selector would match every demo instance on the page.
        // Portaled overlays render under <body>, outside the stage, so
        // those keep the global content selector: without it axe would
        // never see the portal at all (and hidden closed instances are
        // excluded from the accessibility tree anyway).
        const include = openState.portal === false
          ? [[`${STAGE_SELECTOR} ${openState.content}`]]
          : [[STAGE_SELECTOR], [openState.content]];

        const openResults = (await page.evaluate(async ({ disabledRules, include }) => {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const axe = (window as any).axe;
          return axe.run(
            { include },
            {
              resultTypes: ["violations"],
              rules: Object.fromEntries(disabledRules.map((rule) => [rule, { enabled: false }])),
            },
          );
        }, { disabledRules: PAGE_SCOPE_RULES, include })) as {
          violations: {
            id: string;
            impact: string | null;
            help: string;
            nodes: { target: string[]; html: string }[];
          }[];
        };

        openResults.violations.forEach((violation) => {
          violations.push({
            id: violation.id + " (open)",
            impact: violation.impact,
            help: violation.help,
            nodes: violation.nodes.length,
            targets: violation.nodes.map((node) => ({
              target: node.target.join(" "),
              html: node.html.slice(0, 300),
            })),
          });
        });
      } catch (err) {
        // A failed open must fail the run, not silently degrade to a
        // closed-only scan: a rotted OPEN_STATES entry would otherwise
        // stay green forever. Record a synthetic violation so the page
        // reports the failure and the exit code goes non-zero.
        console.error(`✗ ${path}: failed to open (${err})`);
        violations.push({
          id: "open-state-failed",
          impact: "critical",
          help: `Open-state interaction failed: ${String(err).slice(0, 200)}`,
          nodes: 1,
          targets: [{ target: openState.trigger, html: openState.content }],
        });
      }
    }

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
