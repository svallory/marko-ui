import { describe, expect, it } from "vitest";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { VISUAL_STYLES } from "../../packages/marko-ui/src/registry/constants";
import { registryDocSources } from "./doc-sources";

/**
 * Every per-style registry item carries the SAME docs model as the base item.
 *
 * A copy project with a `visualStyle` (every project `init` writes) fetches
 * `r/styles/<style>/<name>.json`, never `r/<name>.json`, for `add` and for
 * `docs`. When `componentDocs` lived only on the base item, `docs` answered
 * "No documentation" in every initialized project and `add` had nothing to
 * cache, while every test that ran without a components.json passed. A
 * regression that drops the model from ONE style's emission would be just as
 * invisible to a scenario that only runs `init`'s default style, so this reads
 * every style's output.
 *
 * Reads the BUILT registry (apps/docs/public/r), so it needs
 * `bun run build:registry` first — as the other built-output tests here do.
 */
const R_DIR = fileURLToPath(new URL("../../apps/docs/public/r/", import.meta.url));

type Item = { componentDocs?: unknown };

function readItem(rel: string): Item | undefined {
  const file = join(R_DIR, rel);
  return existsSync(file) ? (JSON.parse(readFileSync(file, "utf8")) as Item) : undefined;
}

/**
 * The offenders for one component across the given styles: a missing
 * per-style item, one without `componentDocs`, or one whose model differs
 * from the base item's.
 */
export function perStyleDocsOffenders(
  name: string,
  styles: readonly string[],
  read: (rel: string) => Item | undefined = readItem,
): string[] {
  const base = read(`${name}.json`);
  if (!base?.componentDocs) return [];
  const offenders: string[] = [];
  for (const style of styles) {
    const item = read(`styles/${style}/${name}.json`);
    if (!item) offenders.push(`${style}/${name}: no per-style item`);
    else if (!item.componentDocs) offenders.push(`${style}/${name}: no componentDocs`);
    else if (JSON.stringify(item.componentDocs) !== JSON.stringify(base.componentDocs)) {
      offenders.push(`${style}/${name}: componentDocs differs from the base item's`);
    }
  }
  return offenders;
}

const STYLES = VISUAL_STYLES.map((style) => style.name);

describe("per-style registry items carry the base item's docs model", () => {
  it("for every component in every visual style", async () => {
    const names = (await registryDocSources()).map((source) => source.name);
    expect(STYLES.length).toBeGreaterThanOrEqual(8);
    expect(names.length).toBeGreaterThan(80);

    const documented = names.filter((name) => readItem(`${name}.json`)?.componentDocs);
    expect(documented.length, "no base item carries componentDocs — is the registry built?").toBeGreaterThan(80);

    const offenders = documented.flatMap((name) => perStyleDocsOffenders(name, STYLES));
    expect(offenders).toEqual([]);
  });

  it("fails when one style's item lacks the model, differs, or is missing", () => {
    const model = { name: "button", props: [] };
    const fixture: Record<string, Item> = {
      "button.json": { componentDocs: model },
      "styles/nova/button.json": { componentDocs: model },
      "styles/luma/button.json": {},
      "styles/rhea/button.json": { componentDocs: { ...model, props: [{ name: "x" }] } },
    };
    const read = (rel: string) => fixture[rel];
    expect(perStyleDocsOffenders("button", ["nova", "luma", "rhea", "sera"], read)).toEqual([
      "luma/button: no componentDocs",
      "rhea/button: componentDocs differs from the base item's",
      "sera/button: no per-style item",
    ]);
  });
});
