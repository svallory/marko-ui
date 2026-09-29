import { existsSync, readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";

// Any relative chunk reference, static or dynamic: chunk attribution must follow both.
const ANY_CHUNK_REF = /["']((?:\.\/|\/assets\/)[^"']+\.js)["']/g;
const HTML_ENTRY = /(?:src|href)="\/assets\/([^"]+\.js)"/g;

export type BuildReport = {
  name: string;
  chunks: number;
  withoutMap: number;
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
    let withoutMap = 0;
    for (const chunk of chunks) {
      const mapPath = join(assets, `${chunk}.map`);
      if (!existsSync(mapPath)) {
        withoutMap++;
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
    return { name, chunks: chunks.size, withoutMap, duplicates };
  });
  return { builds };
}
