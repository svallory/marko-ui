import { describe, expect, it } from "vitest";
import MdProse from "./md-prose.marko";

// Renders the real template (the Marko vite plugin is on the root vitest
// config), so this proves the escaping and structure of the HTML the page
// ships, not just the parser's node tree.
const render = async (input: { text: string; inline?: boolean }) => (await MdProse.render(input)).toString();

describe("<md-prose>", () => {
  it("renders paragraphs, code, bold, links and a scrollable pre", async () => {
    const html = await render({
      text: "Our `<Combobox>` is **one** tag, see [Groups](#groups).\n\n```text\nA\n└── <b>\n```",
    });
    expect(html).toContain("<code");
    expect(html).toContain("&lt;Combobox>");
    expect(html).toContain("<strong");
    expect(html).toMatch(/href="?#groups"?[ >]/);
    expect(html).toMatch(/<pre[^>]*tabindex="?0"?[^>]*overflow-x-auto/);
    expect(html).toContain("└── &lt;b>");
    expect(html).not.toContain("```");
    expect(html).not.toContain("**");
    expect(html).not.toContain("<b>");
  });

  it("escapes HTML and refuses javascript: links", async () => {
    const html = await render({ text: "<script>x()</script> [a](javascript:alert(1)) [b](https://e.example/x)" });
    expect(html).not.toContain("<script>");
    expect(html).toContain("&lt;script>");
    expect(html).not.toMatch(/href="?javascript/);
    expect(html).toMatch(/href="?https:\/\/e\.example\/x"?[ >]/);
    expect(html).toMatch(/rel="?noreferrer"?/);
  });

  it("inline mode emits spans only, no block wrapper", async () => {
    const html = await render({ text: "Use `role=\"dialog\"` here", inline: true });
    expect(html).not.toContain("<p");
    expect(html).toContain("<code");
    expect(html).toContain("role=");
  });

  it("renders an unclosed fence as a pre", async () => {
    expect(await render({ text: "x\n\n```text\nA" })).toContain("<pre");
  });
});
