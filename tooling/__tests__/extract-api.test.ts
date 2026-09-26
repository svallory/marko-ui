import { describe, expect, it } from "vitest";
import { execFileSync } from "node:child_process";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

// extract-api.ts reads the real packages/shadcn/ui tree and writes the real
// apps/docs/src/lib/api-reference.json — there is no virtual-fixture mode, so
// this test runs the REAL tool against the REAL registry (the same command
// `bun run extract:api` runs) and asserts on its output for the two
// components whose Input is a union discriminated by `href`: Button and
// Badge (see the module comment above `resolveInputType` for why a union
// Input needs special handling at all). This is a regression test of the
// actual merge logic, not a paraphrase of it.
const REPO_ROOT = path.dirname(path.dirname(path.dirname(fileURLToPath(import.meta.url))));
const API_REFERENCE = path.join(REPO_ROOT, "apps/docs/src/lib/api-reference.json");

interface PropertyEntry {
  name: string;
  type: string;
  required: boolean;
  kind: string;
  description?: string;
}
interface PartEntry {
  name: string;
  properties: PropertyEntry[];
}
interface ComponentEntry {
  name: string;
  parts: PartEntry[];
}

async function readApiReference(): Promise<ComponentEntry[]> {
  const { components } = JSON.parse(await readFile(API_REFERENCE, "utf8")) as {
    components: ComponentEntry[];
  };
  return components;
}

function findHref(components: ComponentEntry[], componentName: string): PropertyEntry {
  const component = components.find((c) => c.name === componentName);
  if (!component) throw new Error(`no ${componentName} in api-reference.json`);
  const part = component.parts.find((p) => p.name === componentName);
  if (!part) throw new Error(`no root part for ${componentName}`);
  const href = part.properties.find((p) => p.name === "href");
  if (!href) throw new Error(`no href property on ${componentName}`);
  return href;
}

describe("extract-api: union Input types", () => {
  it("merges href across Button's and Badge's href-discriminated union branches, and keeps natives summarized", { timeout: 60_000 }, async () => {
    const env = { ...process.env };
    delete env.AI_AGENT; // strip the proto agent-environment NDJSON banner (see CLAUDE.md)
    execFileSync("bun", ["tooling/extract-api.ts"], { cwd: REPO_ROOT, env });

    const components = await readApiReference();

    for (const name of ["button", "badge"]) {
      const component = components.find((c) => c.name === name)!;
      const part = component.parts.find((p) => p.name === name)!;

      // Present in only one branch of the union (`href: string` on the
      // anchor branch, `href?: never` on the other) — merged across
      // branches, `never` dropped, and optional because not every branch
      // declares it. Before the fix this read `{ type: "never", required:
      // false }`, which is what the checker's first-branch declaration says
      // in isolation, not what the union as a whole allows.
      const href = findHref(components, name);
      expect(href.type).toBe("string");
      expect(href.required).toBe(false);

      // Button's two branches accept two different tags' native attributes
      // (`Marko.Input<"button">` and `Marko.Input<"a">`) — neither set of
      // ~300 native attrs should appear as individual properties, matching
      // how a single-tag component already summarizes natives via
      // `nativeAttributes` instead of enumerating them.
      expect(part.properties.filter((p) => p.kind === "native")).toHaveLength(0);
    }
  });
});
