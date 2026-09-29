import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";

// Any relative chunk reference, static or dynamic: chunk attribution must follow both.
const ANY_CHUNK_REF = /["']((?:\.\/|\/assets\/)[^"']+\.js)["']/g;
const HTML_ENTRY = /(?:src|href)="\/assets\/([^"]+\.js)"/g;

/**
 * Chunks with no `.map` are invisible to the check, so the guard fails closed:
 * if sourcemaps disappear it must not pass vacuously. Baseline (2026-09-28,
 * #92): 4 tiny unmapped chunks in the main build (23 B - 1.3 KB), 0 in bare.
 * Per-build ceiling on the count, and on any single unmapped chunk's size.
 * Raise deliberately, with a reason, if the build legitimately grows more.
 */
export const MAX_UNMAPPED_CHUNKS = 4;
export const MAX_UNMAPPED_BYTES = 4 * 1024;

export type BuildReport = {
  name: string;
  chunks: number;
  withoutMap: number;
  unmapped: { chunk: string; bytes: number }[];
  duplicates: { source: string; chunks: string[] }[];
};

function htmlFiles(dir: string, out: string[] = []): string[] {
  for (const e of readdirSync(dir, { withFileTypes: true })) {
    const p = join(dir, e.name);
    if (e.isDirectory()) {
      if (e.name !== "assets") htmlFiles(p, out);
    } else if (e.name.endsWith(".html")) out.push(p);
  }
  return out;
}

function reach(assets: string, entries: string[]): Set<string> {
  const seen = new Set<string>();
  const queue = [...entries];
  while (queue.length > 0) {
    const file = queue.pop()!;
    if (seen.has(file)) continue;
    const path = join(assets, file);
    if (!existsSync(path)) continue;
    seen.add(file);
    for (const m of readFileSync(path, "utf8").matchAll(ANY_CHUNK_REF)) queue.push(m[1]!.slice(m[1]!.lastIndexOf("/") + 1));
  }
  return seen;
}

/** Source paths as sourcemaps spell them, minus leading `../`. */
const normalize = (s: string) => s.replace(/^(\.\.\/)+/, "");

export function findDuplicates(publicDir: string): { builds: BuildReport[] } {
  const assets = join(publicDir, "assets");
  const pages = htmlFiles(publicDir);
  const isBare = (p: string) => p.slice(publicDir.length).replace(/\\/g, "/").startsWith("/bare/");
  const groups: [string, string[]][] = [
    ["main", pages.filter((p) => !isBare(p))],
    ["bare", pages.filter(isBare)],
  ];
  const builds = groups.map(([name, files]): BuildReport => {
    const entries = files.flatMap((f) => [...readFileSync(f, "utf8").matchAll(HTML_ENTRY)].map((m) => m[1]!));
    const chunks = reach(assets, entries);
    const owners = new Map<string, string[]>();
    const unmapped: { chunk: string; bytes: number }[] = [];
    for (const chunk of chunks) {
      const mapPath = join(assets, `${chunk}.map`);
      if (!existsSync(mapPath)) {
        unmapped.push({ chunk, bytes: statSync(join(assets, chunk)).size });
        continue;
      }
      const { sources } = JSON.parse(readFileSync(mapPath, "utf8")) as { sources: string[] };
      for (const s of new Set(sources.map(normalize))) {
        const list = owners.get(s) ?? [];
        list.push(chunk);
        owners.set(s, list);
      }
    }
    const duplicates = [...owners].filter(([, c]) => c.length > 1).map(([source, c]) => ({ source, chunks: c }));
    return { name, chunks: chunks.size, withoutMap: unmapped.length, unmapped, duplicates };
  });
  return { builds };
}

/** Reasons a build's sourcemap coverage is too thin for the duplicate check to mean anything. */
export function coverageProblems(b: BuildReport): string[] {
  const out: string[] = [];
  if (b.unmapped.length > MAX_UNMAPPED_CHUNKS)
    out.push(`build ${b.name}: ${b.unmapped.length} chunks without a sourcemap (ceiling ${MAX_UNMAPPED_CHUNKS})`);
  for (const u of b.unmapped)
    if (u.bytes > MAX_UNMAPPED_BYTES) out.push(`build ${b.name}: unmapped chunk ${u.chunk} is ${u.bytes} B (ceiling ${MAX_UNMAPPED_BYTES} B)`);
  return out;
}
