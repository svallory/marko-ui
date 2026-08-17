import { defineConfig } from "vitest/config";
import marko from "@marko/vite";

export default defineConfig({
  plugins: [marko({ linked: false })],
  test: {
    environment: "node",
    include: ["packages/**/*.test.ts"],
    // packages/cli runs its own vitest (its @/src path alias and msw setup
    // live in packages/cli/vitest.config.ts): `bun run --filter @marko-ui/cli test`
    exclude: ["**/node_modules/**", "packages/cli/**"],
  },
});
