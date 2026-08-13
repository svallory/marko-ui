// Shared, map-agnostic helpers for rendering an icon's inner SVG markup
// from its raw data — used by both the SSR path (resolve.ts, which
// statically imports all 5 generated maps since a single request only ever
// needs one library and Node bundle size isn't shipped to the browser) and
// the client-side lazy-swap path (client-swap.ts, which dynamically
// `import()`s one map at a time — see that file's header for why: shadcn's
// own create-icon-loader.tsx lazy-loads every non-default library the same
// way, and this file is what keeps the two paths' rendering logic
// (wrapper attrs, hugeicons node->HTML, name-suffix fallback) from
// drifting apart while their IMPORT strategy differs.
import type { IconNode } from "./__hugeicons__.ts";
import type { IconLibraryName } from "./icon-names.ts";

export const FALLBACK_INNER = '<rect width="18" height="18" x="3" y="3" rx="2"/>';

// Per-library <svg> wrapper attributes, verified against each installed
// package's real SVG output (see build-icons.ts's header comment).
export const ICON_WRAPPER_ATTRS: Record<IconLibraryName, Record<string, string>> = {
  lucide: {
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    "stroke-width": "2",
    "stroke-linecap": "round",
    "stroke-linejoin": "round",
  },
  tabler: {
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    "stroke-width": "2",
    "stroke-linecap": "round",
    "stroke-linejoin": "round",
  },
  phosphor: {
    viewBox: "0 0 256 256",
    fill: "currentColor",
  },
  remixicon: {
    viewBox: "0 0 24 24",
    fill: "currentColor",
  },
  hugeicons: {
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
  },
};

// camelCase React-DOM attrs (hugeicons' node data) -> kebab-case HTML attrs.
// Only the attrs actually present in @hugeicons/core-free-icons nodes need
// mapping (verified against the installed package); "key" is React-only
// and dropped.
function toHtmlAttrString(attrs: Record<string, string>): string {
  let out = "";
  for (const [rawKey, value] of Object.entries(attrs)) {
    if (rawKey === "key") continue;
    const key = rawKey.replace(/[A-Z]/g, (c) => `-${c.toLowerCase()}`);
    out += ` ${key}="${value}"`;
  }
  return out;
}

export function renderHugeiconsNodes(nodes: IconNode): string {
  return nodes.map(([tag, attrs]) => `<${tag}${toHtmlAttrString(attrs)}/>`).join("");
}

// The generated maps are keyed by shadcn's abstract names exactly as
// vendored from their index.json (a mix of "Icon"-suffixed and bare names —
// shadcn only aliases both forms for names their own source literally uses
// both ways). Consumers here sometimes pass either form (e.g. "SearchIcon"
// where the map key is bare "Search"), so try the exact key first, then the
// suffix-toggled form, before falling back to the placeholder glyph.
export function withSuffixFallback<T>(map: Record<string, T>, name: string): T | undefined {
  if (name in map) return map[name];
  const toggled = name.endsWith("Icon") ? name.slice(0, -"Icon".length) : `${name}Icon`;
  return map[toggled];
}
