import { readFile, readdir } from "node:fs/promises";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import type { RegistryDocSource } from "../build-api-doc-model";
import { titleize } from "../build-api-doc-model";

const REPO_ROOT = fileURLToPath(new URL("../..", import.meta.url));
const UI_DIR = join(REPO_ROOT, "packages/shadcn/ui");

/**
 * The same `{ name, title, description }` the registry build derives from
 * `registry.meta.json`. Reproduced here (rather than imported from
 * build-registry) so this stays a test of the OUTPUT: build-registry's own
 * reader is one of the two sides `docs-parity.test.ts` compares, and importing
 * it into the suite would make the comparison circular.
 */
export async function registryDocSources(): Promise<RegistryDocSource[]> {
  const names = (await readdir(UI_DIR, { withFileTypes: true }))
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name)
    .sort();
  const sources: RegistryDocSource[] = [];
  for (const name of names) {
    const meta = JSON.parse(
      await readFile(join(UI_DIR, name, "registry.meta.json"), "utf8"),
    ) as { title?: string; description?: string };
    sources.push({
      name,
      title: meta.title || titleize(name),
      description: meta.description ?? "",
    });
  }
  return sources;
}

/** Every built registry item's path, for the tests that read the output. */
export function registryItemPath(name: string): string {
  return join(REPO_ROOT, "apps/docs/public/r", `${name}.json`);
}

export { REPO_ROOT };