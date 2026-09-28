import { defineConfig } from "vitest/config";
import { fileURLToPath } from "node:url";
import marko from "@marko/vite";

export default defineConfig({
  plugins: [marko({ linked: false })],
  resolve: {
    // Lets root-run tests import CLI sources (packages/marko-ui) that use its
    // "@/src/*" alias, e.g. the icon add-time transform.
    alias: { "@/src": fileURLToPath(new URL("./packages/marko-ui/src", import.meta.url)) },
  },
  test: {
    environment: "node",
    include: [
      "packages/**/*.test.ts",
      "apps/docs/scripts/**/*.test.ts",
      "tooling/**/*.test.ts",
      "scripts/**/*.test.ts",
    ],
    // packages/marko-ui runs its own vitest (its @/src path alias and msw setup
    // live in packages/marko-ui/vitest.config.ts): `bun run --filter marko-ui test`
    exclude: ["**/node_modules/**", "packages/marko-ui/**"],
  },
});
