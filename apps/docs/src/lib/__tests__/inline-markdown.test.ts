import { describe, expect, it } from "vitest";
import { readdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import apiReference from "../api-reference.json";
import { slugify } from "../component-page-data.ts";
import {
  isSafeHref,
  parseBlocks,
  parseInline,
  plainText,
  type Block,
  type Inline,
} from "../inline-markdown.ts";
import type { ComponentDocs } from "../../demos/docs-types.ts";

const para = (src: string) => {
  const [block, ...rest] = parseBlocks(src);
  expect(rest).toEqual([]);
  expect(block?.type).toBe("paragraph");
  return (block as Extract<Block, { type: "paragraph" }>).children;
};

describe("parseInline", () => {
  it("returns plain text untouched", () => {
    expect(parseInline("just words")).toEqual([{ type: "text", value: "just words" }]);
  });

  it("splits inline code, keeping angle brackets as data", () => {
    expect(parseInline("Our `<Combobox>` is a tag")).toEqual([
      { type: "text", value: "Our " },
      { type: "code", value: "<Combobox>" },
      { type: "text", value: " is a tag" },
    ]);
  });

  it("parses bold", () => {
    expect(parseInline("**Simple** (see x)")).toEqual([
      { type: "strong", children: [{ type: "text", value: "Simple" }] },
      { type: "text", value: " (see x)" },
    ]);
  });

  it("parses links, with code inside the label", () => {
    expect(parseInline("see [`Message`](/docs/components/message) now")).toEqual([
      { type: "text", value: "see " },
      {
        type: "link",
        href: "/docs/components/message",
        children: [{ type: "code", value: "Message" }],
      },
      { type: "text", value: " now" },
    ]);
  });

  it("leaves markers inside a code span inert", () => {
    expect(parseInline("`**x**` and `[a](#b)`")).toEqual([
      { type: "code", value: "**x**" },
      { type: "text", value: " and " },
      { type: "code", value: "[a](#b)" },
    ]);
  });

  it("does not let a ** inside a code span close or open bold", () => {
    expect(parseInline("**a `x**` b**")).toEqual([
      {
        type: "strong",
        children: [
          { type: "text", value: "a " },
          { type: "code", value: "x**" },
          { type: "text", value: " b" },
        ],
      },
    ]);
    expect(parseInline("**open `x**` never closed")).toEqual([
      { type: "text", value: "**open " },
      { type: "code", value: "x**" },
      { type: "text", value: " never closed" },
    ]);
  });

  it("degrades unclosed markers to literal text", () => {
    expect(parseInline("a `b and **c and [d](#e")).toEqual([
      { type: "text", value: "a `b and **c and [d](#e" },
    ]);
  });

  it("treats an empty `` pair as text, not an empty code span", () => {
    expect(parseInline("a `` b")).toEqual([{ type: "text", value: "a `` b" }]);
  });

  it("refuses unsafe link targets and keeps the label as text", () => {
    for (const href of ["javascript:alert(1)", "//evil.example", "data:text/html,x", "mailto:a@b.c"]) {
      expect(parseInline(`[x](${href})`)).toEqual([{ type: "text", value: `[x](${href})` }]);
    }
    for (const href of ["/\\evil.com", "/\\\\evil.com", "/", "/a\\b", "https://a.example\\@b.example", "\\evil.com", "#a b"]) {
      expect(isSafeHref(href), href).toBe(false);
    }
    expect(isSafeHref("#groups")).toBe(true);
    expect(isSafeHref("/docs/components/message")).toBe(true);
    expect(isSafeHref("https://www.w3.org/WAI/ARIA/")).toBe(true);
  });

  it("never produces markup from HTML-looking text", () => {
    const nodes = parseInline('<script>alert(1)</script> and <img src=x onerror=y>');
    expect(nodes).toEqual([
      { type: "text", value: '<script>alert(1)</script> and <img src=x onerror=y>' },
    ]);
  });

  it("keeps a lone asterisk or bracket literal", () => {
    expect(parseInline("5 * 3 [ok]")).toEqual([{ type: "text", value: "5 * 3 [ok]" }]);
  });
});

describe("parseBlocks", () => {
  it("joins hard-wrapped lines into one paragraph and splits on a blank line", () => {
    const blocks = parseBlocks("first line\nsecond line\n\nnext para");
    expect(blocks).toHaveLength(2);
    expect(plainText("first line\nsecond line")).toBe("first line second line");
  });

  it("parses a fenced block verbatim, with its language tag dropped", () => {
    const blocks = parseBlocks("intro\n\n```text\nA\n├── b  (x=\"y\")\n    └── c\n```\n\nafter");
    expect(blocks.map((b) => b.type)).toEqual(["paragraph", "pre", "paragraph"]);
    expect(blocks[1]).toEqual({ type: "pre", value: 'A\n├── b  (x="y")\n    └── c' });
  });

  it("runs an unclosed fence to the end instead of dropping it", () => {
    const blocks = parseBlocks("before\n\n```text\nA\n└── b");
    expect(blocks.map((b) => b.type)).toEqual(["paragraph", "pre"]);
    expect(blocks[1]).toEqual({ type: "pre", value: "A\n└── b" });
  });

  it("handles an empty fence and a fence at the very start", () => {
    expect(parseBlocks("```\n```")).toEqual([{ type: "pre", value: "" }]);
    expect(parseBlocks("```ts\nx\n```")).toEqual([{ type: "pre", value: "x" }]);
  });

  it("ends a paragraph at a fence without a blank line", () => {
    expect(parseBlocks("text\n```\ncode\n```").map((b) => b.type)).toEqual(["paragraph", "pre"]);
  });

  it("parses bullet lists, including wrapped continuation lines", () => {
    const blocks = parseBlocks("Intro:\n\n- one `a`\n  continued\n- two");
    expect(blocks.map((b) => b.type)).toEqual(["paragraph", "list"]);
    const list = blocks[1] as Extract<Block, { type: "list" }>;
    expect(list.items).toHaveLength(2);
    expect(plainText("- one `a`\n  continued\n- two")).toBe("one a continued two");
  });

  it("copes with CRLF input, blank input and surrounding whitespace", () => {
    expect(parseBlocks("a\r\n\r\nb")).toHaveLength(2);
    expect(parseBlocks("")).toEqual([]);
    expect(parseBlocks("  \n\n  ")).toEqual([]);
    expect(para("  padded  ")).toEqual([{ type: "text", value: "padded" }]);
  });

  it("renders the combobox composition shape: bold lead-ins, anchors, three trees", () => {
    const src = [
      "Our `<Combobox>` is one tag.",
      "",
      "**Simple** (see [Default](#default)): pass `items`.",
      "",
      "```text",
      "Combobox (items=)",
      "└── input",
      "```",
    ].join("\n");
    const blocks = parseBlocks(src);
    expect(blocks.map((b) => b.type)).toEqual(["paragraph", "paragraph", "pre"]);
    const second = (blocks[1] as Extract<Block, { type: "paragraph" }>).children;
    expect(second.map((n) => n.type)).toEqual(["strong", "text", "link", "text", "code", "text"]);
  });
});

// ---- every docs.ts ---------------------------------------------------------

const DEMOS = fileURLToPath(new URL("../../demos/", import.meta.url));
const SECTION_IDS = new Set([
  "installation",
  "usage",
  "concepts",
  "composition",
  "examples",
  "accessibility",
  "api-reference",
]);

interface Field {
  component: string;
  field: string;
  text: string;
}

const docsByComponent = new Map<string, ComponentDocs>();
for (const name of readdirSync(DEMOS)) {
  try {
    const mod = (await import(`${DEMOS}${name}/docs.ts`)) as { docs?: ComponentDocs };
    if (mod.docs) docsByComponent.set(name, mod.docs);
  } catch {
    // a demo directory with no docs.ts is not documented
  }
}

const fields: Field[] = [];
for (const [component, docs] of docsByComponent) {
  const add = (field: string, text: string | undefined) => {
    if (text) fields.push({ component, field, text });
  };
  add("description", docs.description);
  add("concepts", docs.concepts);
  add("composition", docs.composition);
  for (const e of docs.examples) add(`example ${e.name}`, e.description);
  for (const n of docs.accessibilityNotes ?? []) add("accessibilityNotes", n);
  for (const k of docs.accessibilityKeyboard ?? []) add("accessibilityKeyboard", k.description);
}
for (const c of (apiReference as { components: { name: string; parts: { properties: { name: string; description?: string }[] }[] }[] }).components) {
  for (const p of c.parts) for (const prop of p.properties) {
    if (prop.description) fields.push({ component: c.name, field: `api ${prop.name}`, text: prop.description });
  }
}

const textNodes = (nodes: Inline[]) =>
  nodes.flatMap((n) => (n.type === "text" ? [n.value] : n.type === "code" ? [] : n.children.filter((c) => c.type === "text").map((c) => c.value)));

const renderedText = (text: string): string[] =>
  parseBlocks(text).flatMap((b) =>
    b.type === "paragraph" ? textNodes(b.children) : b.type === "list" ? b.items.flatMap(textNodes) : [],
  );

describe("every docs.ts prose field", () => {
  it("covers a real population", () => {
    expect(docsByComponent.size).toBeGreaterThan(80);
    expect(fields.length).toBeGreaterThan(500);
  });

  it("leaves no literal triple backtick, ** or stray backtick in rendered prose", () => {
    const bad = fields.flatMap((f) =>
      renderedText(f.text)
        .filter((t) => t.includes("```") || t.includes("**") || t.includes("`"))
        .map((t) => `${f.component} ${f.field}: ${t.slice(0, 80)}`),
    );
    expect(bad).toEqual([]);
  });

  it("never emits an empty or unterminated pre block", () => {
    const bad = fields
      .filter((f) => f.field === "composition" || f.field === "concepts")
      .flatMap((f) => parseBlocks(f.text).filter((b) => b.type === "pre" && b.value.trim() === "").map(() => `${f.component} ${f.field}`));
    expect(bad).toEqual([]);
  });

  it("resolves every in-page #anchor to an example heading id or a section id", () => {
    const unresolved: string[] = [];
    for (const f of fields) {
      const docs = docsByComponent.get(f.component);
      const ids = new Set([...SECTION_IDS, ...(docs?.examples ?? []).map((e) => slugify(e.title))]);
      for (const block of parseBlocks(f.text)) {
        const inlines = block.type === "paragraph" ? block.children : block.type === "list" ? block.items.flat() : [];
        for (const n of inlines) {
          if (n.type === "link" && n.href.startsWith("#") && !ids.has(n.href.slice(1))) {
            unresolved.push(`${f.component} ${f.field}: ${n.href}`);
          }
        }
      }
    }
    expect(unresolved).toEqual([]);
  });

  it("points every internal /docs/components/<name> link at a documented component", () => {
    const missing: string[] = [];
    for (const f of fields) {
      for (const m of f.text.matchAll(/\]\(\/docs\/components\/([a-z0-9-]+)\)/g)) {
        if (!docsByComponent.has(m[1] as string)) missing.push(`${f.component} ${f.field}: ${m[1]}`);
      }
    }
    expect(missing).toEqual([]);
  });
});
