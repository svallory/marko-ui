import { describe, expect, it } from "vitest";
import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { stripMarkoComments } from "../strip-marko-comments.ts";

// The markdown payload (`/docs/components/<name>.md`, i.e. what
// `marko-ui docs <name>` prints) must not carry maintainer comments, while the
// demo files themselves and the docs site's own code blocks keep them. These
// tests pin the dangerous half: a `//` that is NOT a comment is common in a
// demo — inline `xmlns="http://www.w3.org/2000/svg"`, `https://…` srcs,
// `//cdn.example.com` protocol-relative URLs — and a regex-based stripper eats
// them.
// The regression cases first: the build before Round 2 stripped `//` and
// block-comment openers anywhere outside a string, which ate real CONTENT.
// In `apps/docs/src/demos/input/input-input-group.marko:13`,
// `<InputGroupText>https://</InputGroupText>` came out as
// `<InputGroupText>https:` — the closing tag gone, so the example an agent
// copies did not compile.
describe("stripMarkoComments: text content is content", () => {
  it("keeps a URL written as text between tags (the input-input-group case)", () => {
    const source = "<InputGroupText>https://</InputGroupText>";

    expect(stripMarkoComments(source)).toBe(source);
  });

  it("keeps a `//` in a sentence of text content", () => {
    const source = "<p>Visit https://example.com</p>";

    expect(stripMarkoComments(source)).toBe(source);
  });

  it("keeps a `//` in text content on a line of its own", () => {
    // Only whitespace precedes it, which is exactly the shape of a comment
    // line — the price of the line-start rule. A demo whose text starts a
    // line with `//` would be stripped; none in the corpus does.
    const source = ["<p>", "  //example.com/docs", "</p>"].join("\n");

    expect(stripMarkoComments(source)).toBe("<p>\n\n</p>");
  });

  it("keeps a `/*` in text content without eating the rest of the file", () => {
    const source = ["<span>a/*b</span>", "<div>c</div>"].join("\n");

    expect(stripMarkoComments(source)).toBe(source);
  });

  it("keeps a literal `{` in text content, and the tag that follows it", () => {
    // The round-2 stripper treated any `{` as an expression, so the `//` in
    // the text swallowed the rest of the line — closing tag included. A body
    // expression is short and closes on its line; a brace that does not is
    // literal text.
    const source = ["<p>text { not expr // here</p>", "<b>keep</b>"].join("\n");

    expect(stripMarkoComments(source)).toBe(source);
  });

  it("still reads a same-line body expression as an expression", () => {
    const source = "<p>{count /* how many */} items</p>";

    expect(stripMarkoComments(source)).toBe("<p>{count } items</p>");
  });

  it("keeps an unclosed `{` at the end of a line in text content", () => {
    const source = ["<p>{ unclosed", "// a real comment line", "</p>"].join("\n");

    expect(stripMarkoComments(source)).toBe(["<p>{ unclosed", "", "</p>"].join("\n"));
  });

  it("keeps a regex literal", () => {
    const source = "const re = /\\/\\//g;";

    expect(stripMarkoComments(source)).toBe(source);
  });

  it("still strips a comment line that sits between two text nodes", () => {
    const source = ["<div>", "  // maintainer note", "  <span>text</span>", "</div>"].join("\n");

    expect(stripMarkoComments(source)).toBe("<div>\n\n  <span>text</span>\n</div>");
  });
});

// The corpus guard. Per-case tests only cover the shapes someone thought of,
// and the shape that actually broke in Round 2 — `//` in TEXT content — was
// only visible across the whole corpus. So: every demo on the site, stripped,
// must still contain every line of code it started with, byte for byte. Only
// comment lines may go missing, and only whitespace may be invented.
describe("stripMarkoComments: the whole demo corpus", () => {
  const DEMOS_DIR = fileURLToPath(new URL("../../demos", import.meta.url));

  function* demoFiles(dir: string): Generator<string> {
    for (const entry of readdirSync(dir, { withFileTypes: true })) {
      const path = join(dir, entry.name);
      if (entry.isDirectory()) yield* demoFiles(path);
      else if (entry.name.endsWith(".marko")) yield path;
    }
  }

  /** True for a line that is comment text, tracking block/HTML comment state. */
  function codeLines(source: string): string[] {
    const code: string[] = [];
    let inBlock = false;
    let inHtml = false;
    for (const line of source.split("\n")) {
      const trimmed = line.trim();
      const isComment = inBlock || inHtml || trimmed.startsWith("//") || trimmed.startsWith("/*") || trimmed.startsWith("<!--") || trimmed.startsWith("*");
      if (!inHtml && trimmed.startsWith("<!--")) inHtml = true;
      if (inHtml && trimmed.endsWith("-->")) inHtml = false;
      if (inBlock && trimmed.endsWith("*/")) inBlock = false;
      if (trimmed.startsWith("/*") && !trimmed.endsWith("*/")) inBlock = true;
      if (isComment) continue;
      if (trimmed === "") continue;
      code.push(line);
    }
    return code;
  }

  it("removes only comment lines: every line of code survives verbatim", () => {
    const files = [...demoFiles(DEMOS_DIR)];
    expect(files.length).toBeGreaterThan(600);

    const lostCode: string[] = [];
    const invented: string[] = [];
    let filesChanged = 0;
    let sourceLines = 0;
    let strippedLineCount = 0;

    for (const file of files) {
      const source = readFileSync(file, "utf8");
      const stripped = stripMarkoComments(source);
      const lines = stripped.split("\n");
      sourceLines += source.split("\n").length;
      strippedLineCount += lines.length;
      if (source !== stripped) filesChanged += 1;

      const strippedSet = new Set(lines.map((line) => line.replace(/[ \t]+$/, "")));
      const sourceSet = new Set(source.split("\n").map((line) => line.replace(/[ \t]+$/, "")));
      for (const line of codeLines(source)) {
        if (!strippedSet.has(line)) lostCode.push(`${file.slice(DEMOS_DIR.length + 1)}: ${line.trim()}`);
      }
      for (const line of lines) {
        if (line.trim() === "") continue;
        if (!sourceSet.has(line.replace(/[ \t]+$/, ""))) {
          invented.push(`${file.slice(DEMOS_DIR.length + 1)}: ${line.trim()}`);
        }
      }
    }

    // Reported so a future change that removes more has a number to compare.
    console.log(
      `corpus: ${files.length} demos, ${filesChanged} changed, ` +
        `${sourceLines - strippedLineCount} lines removed by stripping`,
    );
    expect(lostCode.slice(0, 20)).toEqual([]);
    expect(invented.slice(0, 20)).toEqual([]);
  });
});

describe("stripMarkoComments", () => {
  it("removes a leading comment block above the markup", () => {
    const source = [
      "// Upstream's button-rtl demo drives a live language switcher.",
      "// Button has no machine logic under `dir`.",
      '<div dir="rtl"><Button type="button">زر</Button></div>',
    ].join("\n");

    expect(stripMarkoComments(source)).toBe('<div dir="rtl"><Button type="button">زر</Button></div>');
  });

  it("keeps a `//` inside a double-quoted attribute value (a URL)", () => {
    const source = [
      '<img src="https://avatar.vercel.sh/shadcn1" alt="shadcn"/>',
      '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"/>',
    ].join("\n");

    expect(stripMarkoComments(source)).toBe(source);
  });

  it("keeps a `//` inside a single-quoted string expression", () => {
    const source = 'const href = \'https://example.com/docs\';';

    expect(stripMarkoComments(source)).toBe(source);
  });

  it("keeps a protocol-relative URL in an attribute", () => {
    const source = '<img src="//cdn.example.com/logo.png"/>';

    expect(stripMarkoComments(source)).toBe(source);
  });

  it("keeps a `//` inside a template literal, interpolations included", () => {
    const source = "const url = `https://example.com/${size}//${tab}`;";

    expect(stripMarkoComments(source)).toBe(source);
  });

  it("keeps a trailing `//` after markup, which cannot be told from text", () => {
    // Only comment LINES go. A `//` sharing a line with markup or text could
    // be part of the content (`<a href="https://…">` followed by prose), and
    // the previous build ate it — losing real content to gain nothing.
    const source = '<Button type="button">Send</Button> // the submit action';

    expect(stripMarkoComments(source)).toBe(source);
  });

  it("keeps a mid-line block comment outside a JS context", () => {
    expect(stripMarkoComments("const a = 1; /* note */ const b = 2;")).toBe(
      "const a = 1; /* note */ const b = 2;",
    );
  });

  it("strips a mid-line comment inside a `{…}` expression", () => {
    const source = '<div class={cn("a", /* base */ value)}/>';

    expect(stripMarkoComments(source)).toBe('<div class={cn("a",  value)}/>');
  });

  it("strips a mid-line comment inside a <script> body", () => {
    const source = ["<script>", "  const a = 1; // note", "  a;", "</script>"].join("\n");

    expect(stripMarkoComments(source)).toBe(["<script>", "  const a = 1;", "  a;", "</script>"].join("\n"));
  });

  it("turns a block comment's spanned lines into blank ones, keeping the code's own lines", () => {
    // The comment's lines become blank ones, and the leading blank run is
    // trimmed — so what a reader sees is the code, where it was.
    const source = ["/* note", "still the note */", "const a = 1;", "const b = 2;"].join("\n");

    expect(stripMarkoComments(source)).toBe("const a = 1;\nconst b = 2;");
  });

  it("collapses a standalone multi-line block comment's leftover blank lines away", () => {
    const source = [
      "/*",
      " * Deviation from source: Marko has no slot-merge primitive,",
      " * so asChild is a no-op.",
      " */",
      "<Marker asChild>text</Marker>",
    ].join("\n");

    expect(stripMarkoComments(source)).toBe("<Marker asChild>text</Marker>");
  });

  it("strips a single-line block comment", () => {
    expect(stripMarkoComments('/* note */<div/>')).toBe("<div/>");
  });

  it("strips a single-line Marko/HTML comment", () => {
    expect(stripMarkoComments('<!-- numbered steps --><ol/>')).toBe("<ol/>");
  });

  it("strips a multi-line Marko/HTML comment but not at a bare `->`", () => {
    // Marko 6.3.46 terminates an HTML comment at the first bare `->`, not at
    // the real `-->` (see CLAUDE.md). Stripping at the real terminator is the
    // only behavior that keeps the markup after the comment intact.
    const source = [
      "<!--",
      "  the page went h1 -> h3",
      "-->",
      "<h3>Heading</h3>",
    ].join("\n");

    expect(stripMarkoComments(source)).toBe("<h3>Heading</h3>");
  });

  it("strips a comment-only first line without eating the import block", () => {
    const source = [
      "// Hand port of upstream's demo.",
      'import Button from "@marko-ui/shadcn/ui/button/button.marko";',
      "",
      "<Button>Go</Button>",
    ].join("\n");

    expect(stripMarkoComments(source)).toBe(
      ['import Button from "@marko-ui/shadcn/ui/button/button.marko";', "", "<Button>Go</Button>"].join(
        "\n",
      ),
    );
  });

  it("collapses the blank runs a stripped comment leaves behind", () => {
    const source = ["// one", "// two", "// three", "", "<div/>"].join("\n");

    expect(stripMarkoComments(source)).toBe("<div/>");
  });

  it("does not treat a `//` after an escaped quote as a comment", () => {
    const source = 'const re = "a\\"//b";';

    expect(stripMarkoComments(source)).toBe(source);
  });

  it("is a no-op on source with no comments at all", () => {
    const source = ['import Card from "@marko-ui/shadcn/ui/card/card.marko";', "<Card/>"].join("\n");

    expect(stripMarkoComments(source)).toBe(source);
  });

  it("handles an empty string", () => {
    expect(stripMarkoComments("")).toBe("");
  });
});