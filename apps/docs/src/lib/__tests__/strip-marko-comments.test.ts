import { describe, expect, it } from "vitest";
import { stripMarkoComments } from "../strip-marko-comments.ts";

// The markdown payload (`/docs/components/<name>.md`, i.e. what
// `marko-ui docs <name>` prints) must not carry maintainer comments, while the
// demo files themselves and the docs site's own code blocks keep them. These
// tests pin the dangerous half: a `//` that is NOT a comment is common in a
// demo — inline `xmlns="http://www.w3.org/2000/svg"`, `https://…` srcs,
// `//cdn.example.com` protocol-relative URLs — and a regex-based stripper eats
// them.
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

  it("strips a comment that follows code on the same line", () => {
    const source = '<Button type="button">Send</Button> // the submit action';

    expect(stripMarkoComments(source)).toBe('<Button type="button">Send</Button>');
  });

  it("strips a mid-line block comment without moving the code around it", () => {
    const source = "const a = 1; /* note */ const b = 2;";

    const stripped = stripMarkoComments(source);

    expect(stripped).toBe("const a = 1;  const b = 2;");
    expect(stripped.split("\n")).toHaveLength(source.split("\n").length);
  });

  it("turns a block comment's spanned lines into blank ones, keeping line count", () => {
    // A two-line block comment becomes two blank lines, so a reader comparing
    // the markdown against the demo file still finds the code on its own line.
    const source = ['const a = 1; /* note', "still the note */ const b = 2;"].join("\n");

    expect(stripMarkoComments(source)).toBe("const a = 1;\n const b = 2;");
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