/**
 * Shared Playwright plumbing for the registry test suites.
 *
 * vitest runs these files in the `node` environment (see vitest.config.ts), so
 * there is no browser provider in play — we drive Playwright directly. Playwright
 * is not a workspace dependency; it is resolved from the globally installed
 * module, hence the explicit `createRequire` lookup below.
 *
 * Every suite shares ONE chromium instance per worker process (launched lazily on
 * first use, closed by the process-exit hook). Launching a browser per test file
 * costs ~400ms each and buys nothing: pages are isolated by context, not process.
 */
import { createRequire } from "node:module";
import type { Browser, BrowserContext, Page } from "playwright";

const requireFromHere = createRequire(import.meta.url);

// Resolution order: explicit override (CI), the workspace's own node_modules
// (present transitively via @playwright/test), then the globally installed
// homebrew module as a last resort for local machines without a workspace copy.
const PLAYWRIGHT_CANDIDATES = [
  process.env.PLAYWRIGHT_MODULE_PATH,
  "playwright",
  "/opt/homebrew/lib/node_modules/playwright",
].filter((candidate): candidate is string => Boolean(candidate));

function loadPlaywright(): typeof import("playwright") {
  const failures: string[] = [];
  for (const candidate of PLAYWRIGHT_CANDIDATES) {
    try {
      return requireFromHere(candidate) as typeof import("playwright");
    } catch (error) {
      failures.push(`${candidate}: ${(error as Error).message}`);
    }
  }
  throw new Error(`Unable to resolve playwright. Tried:\n${failures.join("\n")}`);
}

const playwright = loadPlaywright();

/**
 * Base URL of the running docs app. The dev server is expected to be already
 * running — these are integration tests against the real SSR + hydration stack,
 * not a mocked renderer. Overridable so CI can point at a preview deployment.
 *
 * The dev server's actual port varies by worktree/session (multiple worktrees
 * can each run their own server on a random high port to avoid collisions).
 * When running locally, check the scratchpad's DEV_SERVER_PORT.txt convention
 * — or whatever the current session's coordinator has posted — for the live
 * port, and pass it via DOCS_BASE_URL rather than assuming the default below.
 */
export const DOCS_BASE_URL = process.env.DOCS_BASE_URL ?? "http://localhost:3000";

let sharedBrowser: Browser | undefined;
let sharedBrowserPromise: Promise<Browser> | undefined;

/** Lazily launch (and memoize) the per-process chromium instance. */
export async function getSharedBrowser(): Promise<Browser> {
  if (sharedBrowser) return sharedBrowser;
  if (!sharedBrowserPromise) {
    sharedBrowserPromise = playwright.chromium
      .launch({
        // Headless chromium windows report document.hasFocus() === true, which the
        // Zag machines rely on for focus-driven transitions (roving tabindex,
        // focus trap restore). Do not switch to a provider that breaks that.
        headless: true,
      })
      .then((browser) => {
        sharedBrowser = browser;
        return browser;
      });
  }
  return sharedBrowserPromise;
}

export async function closeSharedBrowser(): Promise<void> {
  const browser = sharedBrowser;
  sharedBrowser = undefined;
  sharedBrowserPromise = undefined;
  if (browser) await browser.close();
}

// vitest tears down worker processes without running afterAll of unfinished
// files; the exit hook guarantees no orphaned chromium processes survive a run.
process.once("exit", () => {
  void closeSharedBrowser();
});

export interface PageSessionOptions {
  /** Disable JavaScript entirely — used to capture untouched server markup. */
  javaScriptEnabled?: boolean;
}

/**
 * Run `body` against a fresh browser context + page, always disposing both.
 *
 * A fresh context per call keeps tests deterministic: no shared cookies,
 * localStorage (the docs app persists the theme there), or focus state leaks
 * between components.
 */
export async function withPage<T>(
  options: PageSessionOptions,
  body: (page: Page) => Promise<T>,
): Promise<T> {
  const browser = await getSharedBrowser();
  let context: BrowserContext | undefined;
  try {
    context = await browser.newContext({
      javaScriptEnabled: options.javaScriptEnabled ?? true,
      // Pin the color scheme: the docs app renders theme-dependent markup and a
      // drifting OS preference would make attribute diffs non-deterministic.
      colorScheme: "light",
      viewport: { width: 1280, height: 900 },
    });
    const page = await context.newPage();
    return await body(page);
  } finally {
    await context?.close();
  }
}

/** Absolute URL for a component demo route. */
export function componentRouteUrl(componentName: string): string {
  // The static /components/<name> routes were replaced by the data-driven
  // /docs/components/$name reference pages (which render every docs.ts
  // example) — tests assert against those pages now.
  return `${DOCS_BASE_URL}/docs/components/${componentName}`;
}

/**
 * Navigate to a component route and wait until Marko has resumed (hydrated).
 *
 * Marko 6 resumption is driven by inline `<script>` chunks appended after the
 * markup; there is no framework-level "hydrated" event to await. We wait for the
 * network to go idle (all resume chunks + module graph fetched) and then for the
 * Zag machines to have started, which is observable in the DOM: every server-
 * rendered part carries `data-ssr` until its machine starts and re-renders
 * without it.
 */
export async function gotoHydrated(page: Page, componentName: string): Promise<void> {
  await page.goto(componentRouteUrl(componentName), { waitUntil: "networkidle" });
  await waitForHydration(page);
}

/**
 * Block until hydration has settled.
 *
 * Two conditions must hold, in order:
 *  1. No element still carries Zag's `data-ssr` marker (machines have started).
 *  2. The `[data-scope]` attribute surface stops changing across two animation
 *     frames — this catches machines whose first post-start render schedules a
 *     follow-up (e.g. presence/animation state, positioner measurement).
 */
export async function waitForHydration(page: Page): Promise<void> {
  await page.waitForFunction(() => document.querySelector("[data-ssr]") === null, undefined, {
    timeout: 10_000,
  });

  await page.waitForFunction(
    () => {
      const snapshot = () =>
        Array.from(document.querySelectorAll("[data-scope]"))
          .map((element) =>
            Array.from(element.attributes)
              .map((attribute) => `${attribute.name}=${attribute.value}`)
              .sort()
              .join("|"),
          )
          .join("\n");

      // Stash the previous snapshot on window between polls; stable across two
      // consecutive checks means the DOM has quiesced.
      const windowWithCache = window as unknown as { __hydrationSnapshot?: string };
      const current = snapshot();
      const previous = windowWithCache.__hydrationSnapshot;
      windowWithCache.__hydrationSnapshot = current;
      return previous !== undefined && previous === current;
    },
    undefined,
    { timeout: 10_000, polling: 50 },
  );
}
