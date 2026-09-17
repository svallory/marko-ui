// Second build: the Cloudflare Worker that serves the /no-js-form POST.
//
// The primary build (vite.config.ts) is the STATIC one — it prerenders every
// page and deletes its own server entry. This config builds the small piece of
// server code that remains, importing the real +layout.marko/+page.marko so
// the POST response is rendered by the same templates the static build used.
//
// Deliberately NOT a @marko/run build: `marko-run build` wires in the route
// table (and an adapter that wants to spawn a server afterwards). Plain Vite
// with the marko compiler plugin gives just the two templates this needs.
import { defineConfig } from "vite";
import marko from "@marko/vite";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  build: {
    outDir: "dist/worker",
    emptyOutDir: true,
    ssr: true,
    target: "esnext",
    minify: true,
    rollupOptions: {
      input: "worker/index.ts",
      output: { entryFileNames: "index.js", format: "esm" },
    },
  },
  ssr: {
    target: "webworker",
    noExternal: true,
  },
  plugins: [tailwindcss(), marko({ linked: false })],
});
