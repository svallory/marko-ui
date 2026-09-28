/**
 * Regression guard for the icon-chunks fix (TODO.md "Icon bundle
 * code-splitting doesn't land as separate network chunks"), rounds 1 and 2.
 *
 * Round 1: icon.marko's import of resolve.ts (which statically imports all 5
 * per-library icon maps, ~360KB combined) must stay a `server import` so it
 * never reaches a client bundle for ANY route that renders <icon> — not just
 * `/create/preview`. A plain `import` here silently re-opens the leak
 * (verified: reverting to plain `import` and rebuilding apps/docs put all 5
 * libraries back in every route's client chunk that renders an icon, e.g.
 * docs/components/button.html went from 21KB to 106KB gzip).
 *
 * Round 2: round 1's `server import` broke every client-mounted <icon> (see
 * icon-client-mount.test.ts). The fix adds a `client import` of
 * resolve-client.ts, which statically imports ONLY the default library's map
 * (__lucide__.ts) — so the non-default libraries (tabler/phosphor/remixicon/
 * hugeicons) must stay out of icon.marko's own static import graph
 * entirely, reached only through client-swap.ts's existing dynamic
 * `import()`s (proven in round 1's measurement to land in a real separate
 * network chunk). This suite asserts that non-default-library graph
 * property directly — walking icon.marko's and resolve-client.ts's actual
 * static `import`/`server import`/`client import` specifiers — rather than
 * re-asserting the round-1-specific claim that resolve.ts is server-only
 * (resolve.ts is still server-only, but that alone no longer proves the
 * non-default libraries can't leak: a round-2 regression could reintroduce
 * them through a *different* statically-imported module).
 */
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { describe, expect, test } from "vitest";
import Icon from "../ui/icon/icon.marko";

const ICON_DIR = fileURLToPath(new URL("../ui/icon/", import.meta.url));
const ICON_MARKO_PATH = `${ICON_DIR}icon.marko`;
const RESOLVE_CLIENT_PATH = `${ICON_DIR}resolve-client.ts`;

const NON_DEFAULT_LIBRARY_MODULES = ["__tabler__.ts", "__phosphor__.ts", "__remixicon__.ts", "__hugeicons__.ts"];

/**
 * Every module specifier icon.marko's module-scope statements reference,
 * annotated with which environment(s) actually load it. `import`/`static
 * import` load in both; `server import` server-only; `client import`
 * client-only. This is a plain source-text walk (module-statement lines are
 * always literal string specifiers here — no dynamic construction), not a
 * bundler run, matching this repo's "no server of any kind" test
 * constraint documented in TODO.md's icon-chunks entry.
 */
function staticImportSpecifiers(source: string, environment: "server" | "client" | "both"): string[] {
  const pattern =
    environment === "server"
      ? /^server import\s*(?:type\s*)?\{[^}]*\}\s*from\s*"([^"]+)";?$/gm
      : environment === "client"
        ? /^client import\s*(?:type\s*)?\{[^}]*\}\s*from\s*"([^"]+)";?$/gm
        : /^import\s*(?:type\s*)?\{[^}]*\}\s*from\s*"([^"]+)";?$/gm;
  return [...source.matchAll(pattern)].map((match) => match[1]!);
}

describe("icon.marko keeps non-default icon libraries out of the client's static graph", () => {
  test("resolve.ts (all 5 libraries) is imported ONLY with `server import`", () => {
    const source = readFileSync(ICON_MARKO_PATH, "utf-8");
    expect(staticImportSpecifiers(source, "server")).toContain("./resolve.ts");
    expect(staticImportSpecifiers(source, "both")).not.toContain("./resolve.ts");
    expect(staticImportSpecifiers(source, "client")).not.toContain("./resolve.ts");
  });

  test("no universal (`import`) or `client import` in icon.marko statically reaches any non-default library module", () => {
    const source = readFileSync(ICON_MARKO_PATH, "utf-8");
    const clientReachable = [...staticImportSpecifiers(source, "both"), ...staticImportSpecifiers(source, "client")];
    for (const spec of clientReachable) {
      for (const libModule of NON_DEFAULT_LIBRARY_MODULES) {
        expect(spec).not.toContain(libModule);
      }
    }
  });

  test("resolve-client.ts (icon.marko's `client import`) statically imports ONLY the default library's map", () => {
    const source = readFileSync(RESOLVE_CLIENT_PATH, "utf-8");
    const specifiers = staticImportSpecifiers(source, "both");
    expect(specifiers).toContain("./__lucide__.ts");
    for (const libModule of NON_DEFAULT_LIBRARY_MODULES) {
      expect(specifiers.some((spec) => spec.includes(libModule))).toBe(false);
    }
  });

  test("a non-default library reaches the client ONLY through client-swap.ts's dynamic import()s", () => {
    // client-swap.ts is the one module allowed to name all 5 libraries,
    // because its per-library loads are dynamic `import()`s (proven in
    // round 1's measurement to land in a real separate network chunk), not
    // static imports that bundle unconditionally into every consumer route.
    const source = readFileSync(`${ICON_DIR}client-swap.ts`, "utf-8");
    for (const libModule of NON_DEFAULT_LIBRARY_MODULES) {
      expect(source).toMatch(new RegExp(`import\\("\\./${libModule}"\\)`));
    }
    expect(staticImportSpecifiers(source, "both").filter((spec) => spec.startsWith("./__"))).toEqual([]);
  });

  test("resolve-client.ts reaches client-swap.ts only dynamically (never a static import)", () => {
    const source = readFileSync(RESOLVE_CLIENT_PATH, "utf-8");
    expect(source).toMatch(/import\("\.\/client-swap\.ts"\)/);
    expect(staticImportSpecifiers(source, "both")).not.toContain("./client-swap.ts");
  });

  test("icon.marko never imports client-swap.ts itself (`marko-ui add` drops that file)", () => {
    const source = readFileSync(ICON_MARKO_PATH, "utf-8");
    for (const env of ["both", "server", "client"] as const) {
      expect(staticImportSpecifiers(source, env)).not.toContain("./client-swap.ts");
    }
  });

  test("still renders SSR markup for every library correctly", async () => {
    for (const library of ["lucide", "tabler", "phosphor", "remixicon", "hugeicons"] as const) {
      const out = await Icon.render({ name: "SearchIcon", library }).toString();
      expect(out).toContain(`data-icon-library=${library}`);
      expect(out).toContain(`data-icon-name=SearchIcon`);
      expect(out).toContain("<svg");
      expect(out).toContain("</svg>");
    }
  });
});
