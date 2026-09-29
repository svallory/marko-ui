/**
 * Generates .marko-run/routes.d.ts WITHOUT starting a dev server.
 *
 * @marko/run's vite plugin writes routes.d.ts as a side effect of rendering
 * its virtual route files, which happens when Vite first loads
 * `@marko/run/router`. A Vite server in middlewareMode never binds a port,
 * and with dependency discovery off it never runs the optimizer scan (the
 * step that used to crash, see ensure-routes-dts.sh). So: create one, load
 * the router module once, close it.
 */
import { existsSync } from "node:fs";
import { join } from "node:path";
import { createServer } from "vite";

const root = join(import.meta.dirname, "..");
const out = join(root, ".marko-run", "routes.d.ts");

// Nothing here should take long; a hang (e.g. a future Vite/marko-run
// handle that keeps the loop alive) must fail the caller, not block it.
const watchdog = setTimeout(() => {
  console.error("gen-routes-dts: timed out after 120s");
  process.exit(1);
}, 120_000);
watchdog.unref();

const server = await createServer({
  root,
  configFile: join(root, "vite.config.ts"),
  logLevel: "error",
  appType: "custom",
  server: { middlewareMode: true, hmr: false, watch: null },
  optimizeDeps: { noDiscovery: true, include: [] },
});
try {
  const resolved = await server.pluginContainer.resolveId("@marko/run/router");
  if (!resolved) throw new Error("could not resolve @marko/run/router");
  await server.pluginContainer.load(resolved.id);
} finally {
  await server.close();
}

if (!existsSync(out)) {
  console.error(`gen-routes-dts: ${out} was not written`);
  process.exit(1);
}
// Exit explicitly: don't depend on the event loop draining after close().
process.exit(0);
