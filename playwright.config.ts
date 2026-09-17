import { defineConfig, devices } from "@playwright/test";

// The docs dev server is expected to already be running (marko-run + vite,
// auto-recompiles) — no webServer block here starts one; point
// DOCS_BASE_URL elsewhere if needed.
export default defineConfig({
  testDir: "e2e",
  // e2e/acceptance/*.test.ts is a separate vitest suite (published-package
  // acceptance tests, see AGENTS.md "Acceptance suite") that happens to
  // live under the same testDir — exclude it so Playwright doesn't try to
  // collect it as a spec file.
  testIgnore: "acceptance/**",
  // DOM-structure text snapshots are platform-independent; the default
  // {platform} suffix would make snapshots recorded on macOS invisible to
  // the Linux CI runners.
  //
  // NOTE: the gallery visual guard deliberately overrides this to put
  // {platform} BACK (see the "visual" project below) — its snapshots are
  // PNGs, and macOS and Linux disagree on font rasterisation, so a
  // platform-agnostic path there would silently compare a darwin baseline
  // against a linux run.
  snapshotPathTemplate: "{testDir}/{testFileName}-snapshots/{arg}{ext}",
  fullyParallel: true,
  workers: process.env.CI ? 4 : 6,
  timeout: 60_000,
  reporter: [["list"], ["json", { outputFile: "e2e/results.json" }]],
  use: {
    baseURL: process.env.DOCS_BASE_URL ?? "http://localhost:3000",
    trace: "retain-on-failure",
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
      testIgnore: "gallery-visual.spec.ts",
    },
    {
      // The gallery visual-regression guard (e2e/gallery-visual.spec.ts).
      // Isolated in its own project so its pixel snapshots get a platform
      // suffix and a pinned viewport/scale factor, without changing how
      // every other spec's text snapshots resolve.
      name: "visual",
      testMatch: "gallery-visual.spec.ts",
      snapshotPathTemplate: "{testDir}/{testFileName}-snapshots/{platform}/{arg}{ext}",
      use: {
        ...devices["Desktop Chrome"],
        // Pinned explicitly rather than inherited: a different window size
        // or DPR reflows the whole page and invalidates every baseline.
        viewport: { width: 1280, height: 800 },
        deviceScaleFactor: 1,
        // Locale/timezone affect any date or number a demo renders.
        locale: "en-US",
        timezoneId: "UTC",
        // Honour the theme the test sets, not the runner's preference.
        colorScheme: "light",
        reducedMotion: "reduce",
      },
    },
  ],
});
