// SSR-only icon resolution: statically imports all 5 generated per-library
// maps (~360KB of source across lucide/tabler/phosphor/remixicon/hugeicons
// combined) so a single synchronous render can pick whichever library the
// current request needs. This is fine for the Node/SSR bundle (never
// shipped to the browser) but MUST NOT be imported from client-side code —
// see client-swap.ts, which dynamically imports one map at a time instead,
// for the browser-side icon-library-switch path. icon.marko is the only
// consumer of this module.
import { lucideIcons } from "./__lucide__.ts";
import { tablerIcons } from "./__tabler__.ts";
import { phosphorIcons } from "./__phosphor__.ts";
import { remixiconIcons } from "./__remixicon__.ts";
import { hugeiconsIcons } from "./__hugeicons__.ts";
import type { IconLibraryName } from "./icon-names.ts";
import { FALLBACK_INNER, renderHugeiconsNodes, withSuffixFallback } from "./render.ts";

// The library an <Icon> actually renders from (defined in resolve-client.ts so
// the browser can reach it without this module's 5 maps): an explicit valid
// `library` wins and anything else falls back to lucide.
// `marko-ui add` REPLACES this whole file with a single-library version (see
// packages/marko-ui/src/utils/icon-library.ts) whose resolveIconLibrary always
// returns the components.json `iconLibrary`; keep both exports' signatures in
// sync with that generator.
export { resolveIconLibrary } from "./resolve-client.ts";

// Resolves the inner SVG markup string for (name, library) at SSR time.
export function resolveIconInner(name: string, library: IconLibraryName): string {
  switch (library) {
    case "tabler":
      return withSuffixFallback(tablerIcons, name) ?? FALLBACK_INNER;
    case "phosphor":
      return withSuffixFallback(phosphorIcons, name) ?? FALLBACK_INNER;
    case "remixicon":
      return withSuffixFallback(remixiconIcons, name) ?? FALLBACK_INNER;
    case "hugeicons": {
      const nodes = withSuffixFallback(hugeiconsIcons, name);
      return nodes ? renderHugeiconsNodes(nodes) : FALLBACK_INNER;
    }
    default:
      return withSuffixFallback(lucideIcons, name) ?? FALLBACK_INNER;
  }
}
