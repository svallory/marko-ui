import { describe, expect, it } from "vitest";
import { renderComponentDocs } from "./render";
import type { ComponentDocs } from "./types";

// The renderer is the one thing both the CLI and the docs site run, so these
// cases pin its OUTPUT SHAPE rather than any component's content: the order a
// reader needs (what it is → how to use it → what it is made of → what it
// accepts → what it fires → how a keyboard drives it → examples), and the
// three example-selection modes.
//
// Fixtures are hand-written and deliberately small: button stands in for a
// plain component (no parts, no events, no examples), dialog for a machine
// component with parts and events, chart for the many-example case that makes
// the "More examples" list worth having, plus the awkward ones — a component
// with nothing in either section, and fixed props.
function model(overrides: Partial<ComponentDocs> = {}): ComponentDocs {
  return {
    name: "button",
    title: "Button",
    description: "Displays a button.",
    installCommand: "bunx marko-ui add button -y",
    usageTags: "<Button>",
    importSnippet: 'import Button from "@/components/ui/button/button.marko";',
    usageSnippet: "<Button>Click</Button>",
    parts: [],
    props: [],
    events: [],
    keyboard: [],
    accessibilityNotes: [],
    examples: [],
    ...overrides,
  };
}

describe("renderComponentDocs: section order", () => {
  it("puts what the reader needs first, in the order it is needed", () => {
    const md = renderComponentDocs(
      model({
        parts: [{ name: "trigger", param: "TriggerProps" }],
        props: [{ name: "open", type: "boolean | undefined", required: false }],
        events: [{ name: "openChange", arg: "boolean" }],
        keyboard: [{ keys: "Enter", description: "Opens." }],
        accessibilityNotes: ["Renders a native `<button>`."],
        examples: [{ id: "demo", title: "Demo", source: "<Button />" }],
      }),
    );

    const order = [
      md.indexOf("# Button"),
      md.indexOf("## Install"),
      md.indexOf("## Usage"),
      md.indexOf("## Parts"),
      md.indexOf("## Props"),
      md.indexOf("## Events"),
      md.indexOf("## Keyboard"),
      md.indexOf("## Accessibility"),
      md.indexOf("## Examples"),
    ];
    expect(order.every((index) => index > -1)).toBe(true);
    expect(order).toEqual([...order].sort((a, b) => a - b));
  });

  it("omits sections that have nothing in them", () => {
    const md = renderComponentDocs(model());

    expect(md).toContain("# Button");
    expect(md).not.toContain("## Parts");
    expect(md).not.toContain("## Props");
    expect(md).not.toContain("## Events");
    expect(md).not.toContain("## Keyboard");
    expect(md).not.toContain("## Accessibility");
    expect(md).not.toContain("## Examples");
  });

  it("renders a zero-example component without inventing an Examples heading", () => {
    const md = renderComponentDocs(model({ examples: [] }));

    expect(md).not.toContain("## Examples");
    expect(md).not.toContain("## More examples");
  });
});

describe("renderComponentDocs: props", () => {
  it("writes one compact line per prop with its default", () => {
    const md = renderComponentDocs(
      model({
        props: [
          { name: "variant", type: "'default' | 'link' | undefined", required: false, default: "default" },
          { name: "size", type: "'sm' | 'lg' | undefined", required: false, default: "default" },
        ],
      }),
    );

    expect(md).toContain("- variant: 'default' | 'link' = default");
    expect(md).toContain("- size: 'sm' | 'lg' = default");
  });

  it("drops the `| undefined` optional props all carry", () => {
    const md = renderComponentDocs(
      model({ props: [{ name: "value", type: "string | null | undefined", required: false }] }),
    );

    expect(md).toContain("- value: string | null");
    expect(md).not.toContain("undefined");
  });

  it("marks required props instead, since optional is the norm", () => {
    const md = renderComponentDocs(
      model({ props: [{ name: "items", type: "Item[]", required: true }] }),
    );

    expect(md).toContain("- items (required): Item[]");
  });

  it("shows a fixed prop as fixed, with its value", () => {
    const md = renderComponentDocs(
      model({
        props: [
          { name: "role", type: "'dialog' | 'alertdialog' | undefined", required: false, fixed: "alertdialog" },
          { name: "slideCount", type: "number | undefined", required: false, fixed: true },
        ],
      }),
    );

    expect(md).toContain("- role: 'dialog' | 'alertdialog' = fixed alertdialog");
    expect(md).toContain("- slideCount: number = fixed");
    // And one line saying what "fixed" means, since it is not a default.
    expect(md).toContain("`fixed` means the component sets that value itself");
  });

  it("leaves the legend out when nothing is fixed", () => {
    const md = renderComponentDocs(model({ props: [{ name: "value", type: "string", required: false }] }));

    expect(md).not.toContain("`fixed` means");
  });

  it("prints nothing after the type when there is no description", () => {
    const md = renderComponentDocs(model({ props: [{ name: "items", type: "Item[]", required: false }] }));

    expect(md).toContain("- items: Item[]\n");
    expect(md).not.toMatch(/- items: Item\[\] —/);
  });

  it("collapses a multi-line description onto the prop's line", () => {
    const md = renderComponentDocs(
      model({
        props: [
          {
            name: "value",
            type: "string",
            required: false,
            description: "First line.\n\n  Second paragraph.",
          },
        ],
      }),
    );

    expect(md).toContain("- value: string — First line. Second paragraph.");
  });
});

describe("renderComponentDocs: parts", () => {
  it("writes the attr-tag form, with the parameter type when there is one", () => {
    const md = renderComponentDocs(
      model({
        parts: [
          { name: "trigger", param: "Record<string, unknown>" },
          { name: "title" },
          { name: "item", repeatable: true },
        ],
      }),
    );

    expect(md).toContain("- <@trigger|Record<string, unknown>|>");
    expect(md).toContain("- <@title>");
    expect(md).toContain("repeatable");
    expect(md).toContain("- <@item> — repeatable");
  });

  it("names the part's own attributes, with the required ones marked", () => {
    const md = renderComponentDocs(
      model({
        parts: [
          {
            name: "trigger",
            attributes: [
              { name: "value", type: "string", required: true },
              { name: "disabled", type: "boolean | undefined", required: false },
            ],
            repeatable: true,
          },
        ],
      }),
    );

    expect(md).toContain("attributes: `value` (required): string, `disabled`: boolean");
    expect(md).toContain("repeatable");
  });

  it("documents the default body as the tag's body, never as an attr-tag", () => {
    const md = renderComponentDocs(
      model({ title: "Dialog", body: { param: "string" } }),
    );

    expect(md).toContain("The tag's body: `<Dialog|string|>…</Dialog>`");
    // `<@content>` is not valid markup: the body goes between the tags.
    expect(md).not.toContain("<@content");
  });

  it("omits the body line for a component with no body", () => {
    expect(renderComponentDocs(model())).not.toContain("The tag's body");
  });
});

describe("renderComponentDocs: import style", () => {
  const withImports = (importSnippet: string, source: string) =>
    model({ importSnippet, examples: [{ id: "demo", title: "Demo", source }] });

  it("rewrites the authored package path onto a copy project's ui alias", () => {
    const md = renderComponentDocs(
      withImports(
        'import Button from "@/components/ui/button/button.marko";',
        'import Button from "@marko-ui/shadcn/ui/button/button.marko";\n<Button />',
      ),
      "essential",
      { importStyle: { kind: "copy", uiAlias: "#src/components/ui" } },
    );

    expect(md).toContain('import Button from "#src/components/ui/button/button.marko";');
    expect(md).not.toContain("@marko-ui/shadcn/ui");
    expect(md).not.toContain("@/components/ui");
  });

  it("moves the usage import onto the package for an import-project", () => {
    const md = renderComponentDocs(
      withImports(
        'import Button from "@/components/ui/button/button.marko";',
        'import Button from "@marko-ui/shadcn/ui/button/button.marko";\n<Button />',
      ),
      "essential",
      { importStyle: { kind: "import" } },
    );

    expect(md).toContain('import Button from "@marko-ui/shadcn/ui/button/button.marko";');
    expect(md).not.toContain("@/components/ui");
  });

  it("defaults to the copy path with the default alias", () => {
    const md = renderComponentDocs(
      withImports('import Button from "@/components/ui/button/button.marko";', "<Button />"),
    );

    expect(md).toContain('import Button from "@/components/ui/button/button.marko";');
  });

  it("puts every import inside one fenced block, before the snippet", () => {
    const md = renderComponentDocs(model());

    const usage = md.slice(md.indexOf("## Usage"));
    const fence = usage.indexOf("```marko");
    const importAt = usage.indexOf("import Button");
    const snippetAt = usage.indexOf("<Button>Click</Button>");
    expect(fence).toBeGreaterThan(-1);
    expect(importAt).toBeGreaterThan(fence);
    expect(snippetAt).toBeGreaterThan(importAt);
    // Nothing between the closing fence and the section end may carry code.
    const after = usage.slice(usage.indexOf("```", fence + 3));
    expect(after.split("\n").slice(0, 2).join("\n")).not.toContain("import Button");
  });
});

describe("renderComponentDocs: events", () => {
  it("prints the handler's argument type in place of the whole signature", () => {
    const md = renderComponentDocs(
      model({
        events: [
          { name: "openChange", arg: "OpenChangeDetails", description: "Fires when open state changes." },
          { name: "onEscapeKeyDown", arg: "KeyboardEvent" },
        ],
      }),
    );

    expect(md).toContain("- openChange(OpenChangeDetails) — Fires when open state changes.");
    expect(md).toContain("- onEscapeKeyDown(KeyboardEvent)");
  });

  it("prints empty parens for a handler with no named argument", () => {
    const md = renderComponentDocs(model({ events: [{ name: "valueChange" }] }));

    expect(md).toContain("- valueChange()");
  });
});

describe("renderComponentDocs: examples", () => {
  const many = (count: number, essential: string[] = []): ComponentDocs =>
    model({
      name: "chart",
      title: "Chart",
      examples: Array.from({ length: count }, (_, index) => {
        const id = `chart-${index}`;
        return { id, title: `Chart ${index}`, source: `<Chart />`, ...(essential.includes(id) ? { essential: true } : {}) };
      }),
    });

  it("prints the hero plus the essential ones, up to the limit", () => {
    const md = renderComponentDocs(
      many(10, ["chart-1", "chart-4", "chart-7"]),
    );

    expect(md).toContain("### Chart 0");
    expect(md).toContain("### Chart 1");
    expect(md).toContain("### Chart 4");
    // The limit is 3 in total: hero + 2 essentials.
    expect(md).not.toContain("### Chart 7");
  });

  it("keeps the hero first even when it is not marked essential", () => {
    const md = renderComponentDocs(many(6, ["chart-1"]));

    expect(md.indexOf("### Chart 0")).toBeLessThan(md.indexOf("### Chart 1"));
  });

  it("prints the hero alone when nothing is essential", () => {
    const md = renderComponentDocs(many(5));

    expect(md).toContain("### Chart 0");
    expect(md).not.toContain("### Chart 1");
  });

  it("honours a custom limit", () => {
    const md = renderComponentDocs(many(6, ["chart-1", "chart-2"]), "essential", {
      exampleLimit: 5,
    });

    expect(md).toContain("### Chart 2");
  });

  it('lists what it did not print as "id — title", with the command', () => {
    const md = renderComponentDocs(many(6));

    expect(md).toContain("## More examples");
    expect(md).toContain("- `chart-3` — Chart 3");
    expect(md).toContain("`marko-ui docs chart --examples`");
  });

  it('names the single hidden example in the command when only one is left', () => {
    const md = renderComponentDocs(many(2));

    expect(md).toContain("`marko-ui docs chart --example chart-1`");
  });

  it('takes a caller-supplied command (the site is not a CLI user)', () => {
    const md = renderComponentDocs(many(6), "essential", {
      moreExamplesCommand: "see the Examples section",
    });

    expect(md).toContain("see the Examples section");
    expect(md).not.toContain("marko-ui docs chart");
  });

  it("prints all of them for --examples, with no leftovers", () => {
    const md = renderComponentDocs(many(6, ["chart-1"]), "all");

    expect(md).toContain("### Chart 5");
    expect(md).not.toContain("## More examples");
  });

  it("prints exactly the requested ids, in the model's order", () => {
    const md = renderComponentDocs(many(6), ["chart-4", "chart-2"]);

    expect(md).toContain("### Chart 2");
    expect(md).toContain("### Chart 4");
    expect(md).not.toContain("### Chart 0");
    expect(md).not.toContain("### Chart 1");
  });
});