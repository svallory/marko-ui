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
  default?: string;
  options?: string[];
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

function allProperties(components: ComponentEntry[]): PropertyEntry[] {
  return components.flatMap((component) =>
    component.parts.flatMap((part) => part.properties),
  );
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

// The API tables render a `default` column, and before defaults were
// extracted it was an em dash on every single row: the docs told a reader
// "this prop has no default" for all 1491 props, which is a different claim
// from "we don't know". Two statically knowable sources exist — a cva
// `defaultVariants` entry and a Zag machine prop's own `@default` JSDoc tag —
// and both are asserted here against the real registry.
//
// The `variant` case is the regression: every component keeps its variant MAP
// in classes.ts (`variants: { variant: button.variant }`), so the extractor
// used to skip the whole cva config and record nothing for ANY component.
describe("extract-api: default values", () => {
  it(
    "records cva defaultVariants and Zag @default tags, and nothing malformed",
    { timeout: 60_000 },
    async () => {
      const env = { ...process.env };
      delete env.AI_AGENT;
      execFileSync("bun", ["tooling/extract-api.ts"], { cwd: REPO_ROOT, env });

      const components = await readApiReference();
      const properties = allProperties(components);

      // cva `defaultVariants`. The variant map lives in classes.ts in every
      // one of these, so this only passes if defaultVariants is read
      // independently of the `variants` block.
      const variantDefault = (componentName: string, prop: string): string | undefined => {
        const component = components.find((c) => c.name === componentName);
        if (!component) throw new Error(`no ${componentName} in api-reference.json`);
        return component.parts
          .flatMap((part) => part.properties)
          .find((p) => p.name === prop && p.kind === "variant")?.default;
      };
      expect(
        components
          .find((c) => c.name === "button")!
          .parts.find((p) => p.name === "button")!
          .properties.filter((p) => p.kind === "variant")
          .map((p) => [p.name, p.default]),
      ).toEqual([
        ["size", "default"],
        ["variant", "default"],
      ]);
      expect(variantDefault("field", "orientation")).toBe("vertical");
      expect(variantDefault("badge", "variant")).toBe("default");

      // Zag `@default` JSDoc on machine props (accordion.types.d.ts documents
      // `multiple` as `@default false`).
      const accordion = components.find((c) => c.name === "accordion")!;
      const accordionRoot = accordion.parts.find((p) => p.name === "accordion")!;
      const multiple = accordionRoot.properties.find((p) => p.name === "multiple");
      expect(multiple?.kind).toBe("machine");
      expect(multiple?.default).toBe("false");

      // Normalized for a table cell: no expression text, no leftover quotes.
      const withDefault = properties.filter((p) => p.default !== undefined);
      expect(withDefault.length).toBeGreaterThan(100);
      for (const property of withDefault) {
        expect(property.default, `${property.name} default`).not.toMatch(/\s/);
        expect(property.default, `${property.name} default`).not.toContain('"');
        expect(property.default, `${property.name} default`).not.toContain("`");
      }

      // Sanity: the props whose default ISN'T statically knowable are still
      // recorded as unknown (the field absent), not as a fabricated value.
      const direction = components
        .find((c) => c.name === "button")!
        .parts.find((p) => p.name === "button")!
        .properties.find((p) => p.name === "class");
      expect(direction?.default).toBeUndefined();
    },
  );
});

// A Zag `@default` is the machine's default, not this component's: a
// component that passes its own value on `<zag>` has a different one. Reading
// Zag's tag regardless made `alert-dialog` document `closeOnEscape` as `true`
// while the component hard-codes `false` — contradicting the page's own prose,
// on the page whose job is to be right about defaults.
describe("extract-api: a component's own <zag> props win over Zag's @default", () => {
  it(
    "records what the component fixes, and nothing when it passes an expression",
    { timeout: 60_000 },
    async () => {
      const env = { ...process.env };
      delete env.AI_AGENT;
      execFileSync("bun", ["tooling/extract-api.ts"], { cwd: REPO_ROOT, env });

      const components = await readApiReference();
      const propOf = (componentName: string, prop: string): PropertyEntry | undefined => {
        const component = components.find((c) => c.name === componentName);
        if (!component) throw new Error(`no ${componentName} in api-reference.json`);
        return component.parts
          .flatMap((part) => part.properties)
          .find((p) => p.name === prop);
      };

      // alert-dialog.marko:41-44 passes all three, overriding the dialog
      // machine's `dialog` / `true` / `true`.
      expect(propOf("alert-dialog", "role")?.default).toBe("alertdialog");
      expect(propOf("alert-dialog", "closeOnEscape")?.default).toBe("false");
      expect(propOf("alert-dialog", "closeOnInteractOutside")?.default).toBe("false");

      // command.marko:91-93 does the same over the command machine.
      expect(propOf("command", "open")?.default).toBe("true");
      expect(propOf("command", "inputBehavior")?.default).toBe("autohighlight");
      expect(propOf("command", "selectionBehavior")?.default).toBe("clear");

      // dialog/sheet fix `role="dialog"` — the same value Zag documents, so
      // the default survives rather than being suppressed.
      expect(propOf("dialog", "role")?.default).toBe("dialog");
      expect(propOf("dialog", "closeOnEscape")?.default).toBe("true");

      // Nothing anywhere claims a machine default for a prop the component
      // passes as an expression: resizable passes
      // `orientation=input.orientation ?? "horizontal"`, which is not a value
      // a table cell can state.
      expect(propOf("resizable", "orientation")?.default).toBeUndefined();
      expect(propOf("input-otp", "count")?.default).toBeUndefined();
      expect(propOf("tabs", "defaultValue")?.default).toBeUndefined();
    },
  );
});
