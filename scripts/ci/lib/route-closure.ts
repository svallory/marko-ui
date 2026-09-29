/**
 * Static-import closure of a prerendered route, computed from the BUILT docs
 * output. Shared by the route-budget guard (scripts/ci/check-route-budgets.ts)
 * and the duplicate-module guard.
 *
 * A route's first-load cost is every JS chunk reachable from its `<script
 * src>` entries through STATIC imports (`import ... from "./x.js"`,
 * `import "./x.js"`, `export ... from "./x.js"`). Dynamic `import()` is
 * excluded: those chunks are fetched lazily, not on first load.
 */
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { gzipSync } from "node:zlib";

const SCRIPT_SRC = /<script\b[^>]*\bsrc="([^"]+\.js)"/g;
// `from"./x.js"` (import/export ... from) or bare side-effect `import"./x.js"`.
// A dynamic `import(` never matches: the string must follow `from` or a bare `import`.
const STATIC_IMPORT = /(?:\bfrom\s*|\bimport\s*)["']([^"']+\.js)["']/g;

export type ChunkSize = { file: string; raw: number; gzip: number };
export type Closure = { route: string; chunks: ChunkSize[]; raw: number; gzip: number };

/** `/assets/x.js` or `./x.js` (relative to importer) -> file name inside assetsDir. */
const baseName = (spec: string) => spec.slice(spec.lastIndexOf("/") + 1);

export function entryChunks(html: string): string[] {
  return [...html.matchAll(SCRIPT_SRC)].map((m) => baseName(m[1]!));
}

export function staticImports(source: string): string[] {
  return [...source.matchAll(STATIC_IMPORT)].map((m) => baseName(m[1]!));
}

/**
 * @param publicDir the built `dist/public` directory
 * @param route     route path, e.g. "/" or "/docs/components/button"
 */
export function routeHtmlPath(publicDir: string, route: string): string {
  if (route === "/") return join(publicDir, "index.html");
  const clean = route.replace(/\/$/, "");
  const flat = join(publicDir, `${clean}.html`);
  return existsSync(flat) ? flat : join(publicDir, clean, "index.html");
}

export function closureFor(publicDir: string, route: string): Closure {
  const htmlPath = routeHtmlPath(publicDir, route);
  if (!existsSync(htmlPath)) throw new Error(`no built HTML for route ${route} (${htmlPath})`);
  const assets = join(publicDir, "assets");
  const seen = new Map<string, ChunkSize>();
  const queue = entryChunks(readFileSync(htmlPath, "utf8"));
  if (queue.length === 0) throw new Error(`route ${route}: no <script src> entry in ${htmlPath}`);
  while (queue.length > 0) {
    const file = queue.pop()!;
    if (seen.has(file)) continue;
    const path = join(assets, file);
    if (!existsSync(path)) throw new Error(`route ${route}: chunk ${file} referenced but missing in ${assets}`);
    const buf = readFileSync(path);
    seen.set(file, { file, raw: buf.length, gzip: gzipSync(buf, { level: 9 }).length });
    queue.push(...staticImports(buf.toString("utf8")));
  }
  const chunks = [...seen.values()].sort((a, b) => b.raw - a.raw);
  return {
    route,
    chunks,
    raw: chunks.reduce((n, c) => n + c.raw, 0),
    gzip: chunks.reduce((n, c) => n + c.gzip, 0),
  };
}
