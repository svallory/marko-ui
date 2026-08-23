import { defineConfig } from "vite";
import marko from "@marko/run/vite";
import tailwindcss from "@tailwindcss/vite";

// Minimal harness app — reuses the real docs app's demos (src/demos/**,
// imported by relative path, never copied) and CSS (app.css, imported
// below), but ships none of the docs site's chrome/routes/nav. See
// tooling/parity/PROTOCOL.md for what this app must expose.
export default defineConfig({
  plugins: [tailwindcss(), marko()],
  server: { port: 4175 },
  preview: { port: 4175 },
});
