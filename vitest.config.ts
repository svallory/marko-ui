import { defineConfig } from "vitest/config";
import marko from "@marko/vite";

export default defineConfig({
  plugins: [marko({ linked: false })],
  test: {
    environment: "node",
    include: ["packages/**/*.test.ts"],
  },
});
