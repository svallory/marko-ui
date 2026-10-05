import { describe, expect, it } from "vitest";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { VISUAL_STYLES } from "../../packages/marko-ui/src/registry/constants";
import { registryDocSources } from "./doc-sources";

/**
 * Every per-style registry item references the SAME docs file as the base item,
 * and that file exists.
 *
 * A copy project with a `visualStyle` (every project `init` writes) fetches
 * `r/styles/<style>/<name>.json`, never `r/<name>.json`, for `add` and for
 * `docs`. When the docs lived only on the base item, `docs` answered "No
 * documentation" in every initialized project and `add` had nothing to cache,
 * while every test that ran without a components.json passed. A regression that
 * drops the reference from ONE style's emission would be just as invisible to a
 * scenario that only runs `init`'s default style, so this reads every style's
 * output. No item embeds the model itself any more (`componentDocs` is gone):
 * the model is one file per component, which the items point at.
 *
 * Reads the BUILT registry (apps/docs/public/r), so it needs
 * `bun run build:registry` first — as the other built-output tests here do.
 */
const R_DIR = fileURLToPath(new URL("../../apps/docs/public/r/", import.meta.url));

type Item = { componentDocsRef?: string; componentDocs?: unknown };

function readItem(rel: string): Item | undefined {
  const file = join(R_DIR, rel);
  return existsSync(file) ? (JSON.parse(readFileSync(file, "utf8")) as Item) : undefined;
}

/**
 * The offenders for one component across the given styles: a missing per-style
 * item, one that still embeds `componentDocs`, one without the reference, or one
 * whose reference differs from the base item's. A reference whose file is not
 * there is reported once, for the base.
 */
export function perStyleDocsOffenders(
  name: string,
  styles: readonly string[],
  read: (rel: string) => Item | undefined = readItem,
  exists: (rel: string) => boolean = (rel) => existsSync(join(R_DIR, rel)),
): string[] {
  const base = read(`${name}.json`);
  if (!base?.componentDocsRef) return [];
  const offenders: string[] = [];
  if (base.componentDocs) offenders.push(`${name}: base item embeds componentDocs`);
  const file = base.componentDocsRef.split("/r/").pop() ?? "";
  if (!exists(file)) offenders.push(`${name}: referenced docs file ${file} does not exist`);
  for (const style of styles) {
    const item = read(`styles/${style}/${name}.json`);
    if (!item) offenders.push(`${style}/${name}: no per-style item`);
    else if (item.componentDocs) offenders.push(`${style}/${name}: embeds componentDocs`);
    else if (!item.componentDocsRef) offenders.push(`${style}/${name}: no componentDocsRef`);
    else if (item.componentDocsRef !== base.componentDocsRef) {
      offenders.push(`${style}/${name}: componentDocsRef differs from the base item's`);
    }
  }
  return offenders;
}

const STYLES = VISUAL_STYLES.map((style) => style.name);

describe("per-style registry items reference the base item's docs file", () => {
  it("for every component in every visual style", async () => {
    const names = (await registryDocSources()).map((source) => source.name);
    expect(STYLES.length).toBeGreaterThanOrEqual(8);
    expect(names.length).toBeGreaterThan(80);

    const documented = names.filter((name) => readItem(`${name}.json`)?.componentDocsRef);
    expect(documented.length, "no base item carries componentDocsRef — is the registry built?").toBeGreaterThan(80);

    const offenders = documented.flatMap((name) => perStyleDocsOffenders(name, STYLES));
    expect(offenders).toEqual([]);
  });

  it("fails when a style's item lacks the reference, differs, embeds the model, or is missing", () => {
    const ref = "https://x.test/r/docs/button.json";
    const fixture: Record<string, Item> = {
      "button.json": { componentDocsRef: ref },
      "styles/nova/button.json": { componentDocsRef: ref },
      "styles/luma/button.json": {},
      "styles/rhea/button.json": { componentDocsRef: "https://x.test/r/docs/other.json" },
      "styles/mira/button.json": { componentDocsRef: ref, componentDocs: { name: "button" } },
    };
    const read = (rel: string) => fixture[rel];
    expect(
      perStyleDocsOffenders("button", ["nova", "luma", "rhea", "mira", "sera"], read, () => true),
    ).toEqual([
      "luma/button: no componentDocsRef",
      "rhea/button: componentDocsRef differs from the base item's",
      "mira/button: embeds componentDocs",
      "sera/button: no per-style item",
    ]);
  });

  it("reports a reference to a file that is not there, and an embedded base model", () => {
    const read = () => ({ componentDocsRef: "https://x.test/r/docs/button.json", componentDocs: {} });
    expect(perStyleDocsOffenders("button", [], read, () => false)).toEqual([
      "button: base item embeds componentDocs",
      "button: referenced docs file docs/button.json does not exist",
    ]);
  });
});
