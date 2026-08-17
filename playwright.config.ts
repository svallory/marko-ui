import { defineConfig, devices } from "@playwright/test";

// Style-matrix verification suite against the generated /verify/<style>/<component>
// routes (see apps/docs/scripts/build-verify-matrix.ts). The docs dev server is
// expected to already be running (marko-run + vite, auto-recompiles) — no
// webServer block here starts one; point DOCS_BASE_URL elsewhere if needed.
export default defineConfig({
  testDir: "e2e",
  // DOM-structure text snapshots are platform-independent; the default
  // {platform} suffix would make snapshots recorded on macOS invisible to
  // the Linux CI runners.
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
    },
  ],
});
