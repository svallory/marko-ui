/**
 * Chunk naming for the zag stack in the CLIENT bundle (see vite.config.ts).
 *
 * `marko-zag` and the ~48 `@zag-js/*` packages used to be pinned into one
 * 815 KB `vendor-zag` chunk that every route downloaded, even a route that
 * renders a single machine (#87). Now each MACHINE package gets its own
 * `vendor-zag-<machine>` chunk, so a route only fetches the machines it
 * imports. Everything shared — marko-zag, and every `@zag-js/*` package that
 * is not a machine (core, dom-query, utils, types, popper, anatomy, ...) —
 * goes into one `vendor-zag-core` chunk. Putting shared bits in exactly one
 * chunk is what guarantees no module is emitted twice and no machine imports
 * another machine's chunk for a utility.
 *
 * The machine list is DERIVED from packages/shadcn/package.json (its
 * `@zag-js/*` dependencies minus `@zag-js/types`), so adding a component
 * whose machine is a new dependency gets its own chunk without touching this
 * file.
 */
import { readFileSync } from "node:fs";

const SHADCN_PKG = new URL("../../packages/shadcn/package.json", import.meta.url);

/** `@zag-js/<x>` packages in shadcn's dependencies that are machines. */
export function zagMachineNames(pkgJson: { dependencies?: Record<string, string> }): Set<string> {
  const names = new Set<string>();
  for (const dep of Object.keys(pkgJson.dependencies ?? {})) {
    const m = /^@zag-js\/(.+)$/.exec(dep);
    if (m && m[1] !== "types") names.add(m[1]!);
  }
  return names;
}

/**
 * Third-party packages the zag stack depends on. They must be named here: with
 * the group's `includeDependenciesRecursively: false`, a zag module's
 * dependency that no group claims lands in an APP chunk, and the machine chunk
 * importing it while that chunk imports the machine back is a chunk cycle
 * (seen with uqr / @internationalized/number; it overflows the stack in
 * @marko/run's post-build chunk walk). Single-consumer ones ride with their
 * machine; the rest go to core.
 */
const THIRD_PARTY_OWNER: ReadonlyArray<readonly [RegExp, string]> = [
  [/node_modules[\\/]uqr[\\/]/, "vendor-zag-qr-code"],
  [/node_modules[\\/]perfect-freehand[\\/]/, "vendor-zag-signature-pad"],
  [/node_modules[\\/]@internationalized[\\/]number[\\/]/, "vendor-zag-number-input"],
  [/node_modules[\\/](?:@floating-ui|@internationalized|proxy-memoize|proxy-compare)[\\/]/, "vendor-zag-core"],
];

export const ZAG_MODULE_TEST =
  /node_modules[\\/](?:marko-zag[\\/]|@zag-js[\\/][^\\/]+[\\/]|uqr[\\/]|perfect-freehand[\\/]|@floating-ui[\\/]|@internationalized[\\/]|proxy-memoize[\\/]|proxy-compare[\\/])/;

/**
 * Chunk name for a module id inside marko-zag or an `@zag-js/*` package.
 * Returns null for anything else.
 */
export function zagChunkName(id: string, machines: ReadonlySet<string>): string | null {
  // First `@zag-js/<pkg>/` segment is the node_modules one: bun's isolated
  // store dir spells the scope `@zag-js+<pkg>@<ver>`, with a `+`, not a slash.
  const pkg = /node_modules[\\/]@zag-js[\\/]([^\\/]+)[\\/]/.exec(id)?.[1];
  if (pkg && machines.has(pkg)) return `vendor-zag-${pkg}`;
  if (pkg || /node_modules[\\/]marko-zag[\\/]/.test(id)) return "vendor-zag-core";
  for (const [re, name] of THIRD_PARTY_OWNER) if (re.test(id)) return name;
  return null;
}

export function loadZagMachines(): Set<string> {
  return zagMachineNames(JSON.parse(readFileSync(SHADCN_PKG, "utf8")));
}
