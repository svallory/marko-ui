/**
 * transformComponent() — applies a style's StyleMap to one authored component
 * directory in memory. Extracted from build-registry.ts into its own module
 * (no dependency on the marko-ui package's registry/schema types) so it can
 * be imported directly by tests under packages/shadcn/tsconfig.json without
 * pulling that whole transitive type graph into the shadcn typecheck project.
 *
 * Every component is now either:
 *   - HAS classes.ts (the class-as-data contract, e.g. button/accordion/
 *     sidebar): data-swap + merge. The whole classes.ts module is loaded and
 *     resolved against the style ONCE per component per style; each
 *     .marko/variants.ts part that imports it gets its single import line
 *     replaced with the resolved literal via mergeClasses(). classes.ts
 *     itself is NEVER emitted into the per-style file map (contract point 6).
 *     Everything else in the dir is copied verbatim.
 *   - NO classes.ts, literal-free (e.g. direction, collapsible): every file
 *     is copied verbatim — there is nothing for a style to inline. The
 *     `mu-` survival guard in merge-classes.ts's caller-adjacent checks
 *     (check-classes.ts) still enforces that no such component ever grows a
 *     class-context literal or a bare `mu-` token outside classes.ts.
 * There is no text-rewriting dispatch any more — the temporary transform
 * fallback this module used to have is retired now that every component is
 * on the class-as-data contract. Recurses into a lib/ subdir (keys become
 * "lib/<file>") in both paths.
 */
import { existsSync, readFileSync, readdirSync } from "node:fs";
import { basename, join } from "node:path";

import type { StyleMap } from "./style-map";
import { loadClassesModule, resolveClassesModule, printClassModule } from "./resolve-classes";
import { mergeClasses, extractLiteralForExport } from "./merge-classes";

export async function transformComponent(dir: string, styleMap: StyleMap): Promise<Map<string, string>> {
  const out = new Map<string, string>();
  const classesPath = join(dir, "classes.ts");
  const hasClasses = existsSync(classesPath);

  let printedModule: string | undefined;
  if (hasClasses) {
    const mod = await loadClassesModule(classesPath);
    const resolved = resolveClassesModule(mod, styleMap);
    printedModule = printClassModule(resolved);
  }

  const add = (rel: string, abs: string) => {
    const b = basename(rel);
    if (hasClasses && b === "classes.ts") return; // contract point 6: never emitted per-style
    const src = readFileSync(abs, "utf8");

    if (hasClasses && (b.endsWith(".marko") || b === "variants.ts") && src.includes("./classes.ts")) {
      const kind = b.endsWith(".marko") ? "marko" : "variants";
      const importedNameMatch = /^import \{ (\w+)(?: as \w+)? \} from "\.\/classes\.ts";$/m.exec(src);
      if (!importedNameMatch) {
        throw new Error(
          `${abs}: references "./classes.ts" but no line matches the exact expected import shape.`,
        );
      }
      const literal = extractLiteralForExport(printedModule!, importedNameMatch[1]!);
      out.set(rel, mergeClasses(src, kind, literal).content);
      return;
    }

    out.set(rel, src);
  };
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    if (entry.isFile()) add(entry.name, join(dir, entry.name));
    else if (entry.isDirectory() && entry.name === "lib") {
      for (const libEntry of readdirSync(join(dir, "lib"), { withFileTypes: true })) {
        if (libEntry.isFile()) add(`lib/${libEntry.name}`, join(dir, "lib", libEntry.name));
      }
    } else if (entry.isDirectory()) {
      throw new Error(`registry item dirs must be flat (only lib/ allowed); found ${dir}/${entry.name}`);
    }
  }
  return out;
}
