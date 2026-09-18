import { defineConfig } from "vite";
import marko from "@marko/run/vite";
import staticAdapter from "@marko/run-adapter-static";
import tailwindcss from "@tailwindcss/vite";

// Second-stage build: emits the chrome-free `/bare/<component>` Lighthouse
// fixtures into dist/public alongside the main docs build (the adapter writes
// prerendered HTML next to the main build's public/ dir; emptyOutDir:false so
// it never wipes the main build's output). Routes are generated per component
// by scripts/build-bare-routes.ts (run first in the build chain); they are all
// parameterless, so the adapter seeds them without an explicit url list.
export default defineConfig({
  build: {
    emptyOutDir: false,
  },
  plugins: [
    tailwindcss(),
    marko({
      routesDir: "src/bare-routes",
      adapter: staticAdapter(),
    }),
  ],
});
