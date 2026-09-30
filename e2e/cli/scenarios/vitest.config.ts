import { defineConfig } from "vitest/config"

// Own config (like e2e/acceptance/): these tests spawn the built CLI against
// throwaway fixtures, so they must not be picked up by the root docs suite or
// the CLI unit suite. Needs REGISTRY_URL — use `bun run test:cli:scenarios`.
export default defineConfig({
  test: {
    root: import.meta.dirname,
    include: ["*.test.ts"],
    testTimeout: 90_000,
    hookTimeout: 30_000,
    // Scenarios are independent (own temp dir each) and cheap; parallelism is
    // safe and keeps the suite CI-fast. Only the shared registry is read-only.
    reporters: process.env.CI ? ["default", "json"] : ["default"],
    outputFile: process.env.CI ? { json: "results.json" } : undefined,
  },
})
