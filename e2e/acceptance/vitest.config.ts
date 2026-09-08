import { defineConfig } from "vitest/config"

// Separate config from the root/CLI vitest configs (see AGENTS.md): these
// tests shell out to real `bun`/`node` processes against the live registry
// and npm, each journey scaffolding + installing in its own temp dir, so
// they're slow and network-dependent — never bundled into `bun run test`.
export default defineConfig({
  test: {
    root: import.meta.dirname,
    include: ["*.test.ts"],
    testTimeout: 5 * 60_000,
    hookTimeout: 5 * 60_000,
    // Journeys each spawn several bun installs; run them one at a time so
    // they don't stampede the same global bun install cache/lockfile work.
    fileParallelism: false,
    reporters: process.env.CI ? ["default", "json"] : ["default"],
    outputFile: process.env.CI ? { json: "results.json" } : undefined,
  },
})
