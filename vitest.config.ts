import { defineConfig } from "vitest/config";
import marko from "@marko/vite";

export default defineConfig({
  plugins: [marko({ linked: false })],
  test: {
    environment: "node",
    include: ["packages/**/*.test.ts"],
    // packages/marko-ui runs its own vitest (its @/src path alias and msw setup
    // live in packages/marko-ui/vitest.config.ts): `bun run --filter marko-ui test`
    exclude: ["**/node_modules/**", "packages/marko-ui/**"],
  },
});
