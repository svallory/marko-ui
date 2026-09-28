// Prints `<library> <marker>` lines: a distinctive path-data fragment of each
// icon library's "SearchIcon", read from the registry's generated maps. A
// consumer build that contains library X's marker bundles X's data; one that
// contains a marker of a library it did not choose ships unused icon data.
//
//   bun e2e/cli/icon-markers.ts
import { lucideIcons } from "../../packages/shadcn/ui/icon/__lucide__.ts";
import { tablerIcons } from "../../packages/shadcn/ui/icon/__tabler__.ts";
import { phosphorIcons } from "../../packages/shadcn/ui/icon/__phosphor__.ts";
import { remixiconIcons } from "../../packages/shadcn/ui/icon/__remixicon__.ts";
import { hugeiconsIcons } from "../../packages/shadcn/ui/icon/__hugeicons__.ts";

const NAME = "Search";
const ICON_DIR = new URL("../../packages/shadcn/ui/icon/", import.meta.url);
// Longest path-data value: the most distinctive fragment of the icon.
const fragment = (raw: string) => {
  const all = [...raw.matchAll(/\bd(?:=\\?"|":")([^"\\]{12,})/g)].map((m) => m[1]);
  if (!all.length) throw new Error(`no path data in ${raw.slice(0, 80)}`);
  return all.reduce((a, b) => (b.length > a.length ? b : a)).slice(0, 40);
};

const maps: Record<string, unknown> = {
  lucide: (lucideIcons as Record<string, unknown>)[NAME],
  tabler: (tablerIcons as Record<string, unknown>)[NAME],
  phosphor: (phosphorIcons as Record<string, unknown>)[NAME],
  remixicon: (remixiconIcons as Record<string, unknown>)[NAME],
  hugeicons: (hugeiconsIcons as Record<string, unknown>)[NAME],
};
const sources: Record<string, string> = {};
for (const lib of Object.keys(maps)) {
  sources[lib] = await Bun.file(new URL(`__${lib}__.ts`, ICON_DIR)).text();
}
for (const [lib, value] of Object.entries(maps)) {
  if (!value) throw new Error(`${lib} has no ${NAME}`);
  const marker = fragment(typeof value === "string" ? value : JSON.stringify(value));
  // A marker only proves "library X is bundled" if no other library's map contains it.
  for (const [other, text] of Object.entries(sources)) {
    if (other !== lib && text.includes(marker)) {
      throw new Error(`marker for ${lib} ("${marker}") also appears in ${other}'s map`);
    }
  }
  console.log(`${lib} ${marker}`);
}
