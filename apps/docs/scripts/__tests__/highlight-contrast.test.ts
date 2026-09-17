/**
 * WCAG contrast guard for SSR syntax highlighting.
 *
 * The docs' Lighthouse accessibility score sat at 96/97 (never 100) because
 * `color-contrast` failed on every audited component page. Every flagged node
 * was a shiki token span whose `--shiki-light` color fell below the WCAG 2.2
 * AA threshold (4.5:1) against the `#fbfbfb` code background:
 *
 *   #22863a 4.47:1, #d73a49 4.42:1, #e36209 3.37:1
 *
 * src/lib/highlight-code.ts remaps those three to GitHub's own newer
 * `github-light-default` values. This suite locks that in: it highlights real
 * snippets through the actual `highlightCode()` entry point and asserts that
 * NO emitted token color falls below 4.5:1 — so a future theme bump, a new
 * language, or a dropped remap fails here rather than silently costing
 * accessibility points in a Lighthouse run nobody reads.
 *
 * Dark mode is covered too, and is NOT redundant: Lighthouse audits the
 * default (light) theme only, so nothing else in CI would ever catch a dark
 * regression. Measuring it found a real one the first version of this file
 * had assumed away — comment gray #6a737d at 3.76:1 on the dark code
 * background, now remapped to #7d8590 (4.85:1).
 */
import { describe, expect, it } from "vitest";
import { highlightCode } from "../../src/lib/highlight-code.ts";

/** The docs code-block background, as reported by the Lighthouse audit. */
const LIGHT_CODE_BG = "#fbfbfb";
/**
 * The dark code-block background: `--code: var(--surface)` =
 * `oklch(0.2 0 0)` in apps/docs/src/app.css, converted to sRGB.
 */
const DARK_CODE_BG = "#161616";
/** WCAG 2.2 AA minimum for normal-size text. */
const AA_NORMAL_TEXT = 4.5;

function relativeLuminance(hex: string): number {
  const channels = [0, 2, 4].map((offset) => {
    const value = Number.parseInt(hex.replace("#", "").slice(offset, offset + 2), 16) / 255;
    return value <= 0.03928 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4;
  }) as [number, number, number];
  return 0.2126 * channels[0] + 0.7152 * channels[1] + 0.0722 * channels[2];
}

function contrastRatio(foreground: string, background: string): number {
  const [lighter, darker] = [relativeLuminance(foreground), relativeLuminance(background)].sort(
    (a, b) => b - a,
  ) as [number, number];
  return (lighter + 0.05) / (darker + 0.05);
}

/**
 * Snippets chosen to exercise the token roles that carry the previously
 * failing colors (strings, keywords, constants/params) in each language the
 * docs actually highlight.
 */
const SNIPPETS: readonly { lang: string; code: string }[] = [
  {
    lang: "marko",
    code: [
      'import Button from "@marko-ui/shadcn/ui/button/button.marko";',
      "",
      'static const items = [{ id: 1, label: "One" }];',
      "",
      '<Button variant="outline" onClick=() => console.log("hi")>Click me</Button>',
    ].join("\n"),
  },
  {
    lang: "ts",
    code: [
      'export const VISUAL_STYLES = [{ name: "rhea", label: "Rhea" }] as const;',
      "// a comment",
      "function format(count: number): string { return `x${count}`; }",
    ].join("\n"),
  },
  {
    lang: "bash",
    code: ["bunx marko-ui init --distribution copy --visual-style vega", "# a comment"].join("\n"),
  },
  {
    lang: "css",
    code: [":root { --foo: #fff; }", "/* a comment */", ".mu-button { color: var(--foo); }"].join("\n"),
  },
  { lang: "json", code: '{ "name": "marko-ui", "version": "0.3.1" }' },
  { lang: "html", code: '<div class="x"><!-- c --><span>hi</span></div>' },
];

/** Every distinct `--shiki-<theme>` color in a highlighted snippet. */
function tokenColors(html: string, theme: "light" | "dark"): string[] {
  const pattern = new RegExp(`--shiki-${theme}:(#[0-9a-fA-F]{6})`, "g");
  return [...html.matchAll(pattern)].map((match) => match[1]!.toLowerCase());
}

const lightTokenColors = (html: string) => tokenColors(html, "light");

const THEME_CASES = [
  { theme: "light" as const, background: LIGHT_CODE_BG },
  { theme: "dark" as const, background: DARK_CODE_BG },
];

describe("highlightCode token contrast", () => {
  it.each(
    THEME_CASES.flatMap(({ theme, background }) =>
      SNIPPETS.map(
        (snippet) => [theme, background, snippet.lang, snippet.code] as const,
      ),
    ),
  )("emits no sub-4.5:1 %s token color for %s", async (theme, background, lang, code) => {
    const html = await highlightCode(code, lang);
    const colors = [...new Set(tokenColors(html, theme))];
    // A snippet that produced no themed token at all would make the
    // assertion below vacuously true, so require real output first.
    expect(colors.length).toBeGreaterThan(0);

    const failing = colors
      .map((color) => ({ color, ratio: contrastRatio(color, background) }))
      .filter((entry) => entry.ratio < AA_NORMAL_TEXT);

    expect(
      failing,
      `sub-threshold ${theme} token colors on ${background}: ` +
        failing.map((entry) => `${entry.color} ${entry.ratio.toFixed(2)}:1`).join(", "),
    ).toEqual([]);
  });

  it("remaps every color measured below the threshold, per theme", async () => {
    // The three that actually failed in the production Lighthouse run...
    const flaggedLight = ["#22863a", "#d73a49", "#e36209"];
    // ...and the one dark-mode failure, which Lighthouse never audits.
    const flaggedDark = ["#6a737d"];

    // Comments only appear in a snippet that has one, so use the TS sample
    // rather than the marko one for the dark assertion to be meaningful.
    const html = await highlightCode(SNIPPETS[1]!.code, "ts");

    for (const color of flaggedLight) {
      expect(
        tokenColors(html, "light"),
        `${color} should have been remapped out of light mode`,
      ).not.toContain(color);
    }
    for (const color of flaggedDark) {
      expect(
        tokenColors(html, "dark"),
        `${color} should have been remapped out of dark mode`,
      ).not.toContain(color);
    }

    // Both custom properties must survive: the remap rewrites values in
    // place, it does not drop either theme's channel.
    expect(html).toContain("--shiki-light:");
    expect(html).toContain("--shiki-dark:");
  });

  it("remaps each theme independently, never across them", async () => {
    // #6a737d is a dark-theme comment color. It must be remapped in the dark
    // channel and left alone in the light channel, where github-light uses a
    // different comment gray that already passes. A naive global
    // search-and-replace on the whole HTML would break this.
    const html = await highlightCode(SNIPPETS[1]!.code, "ts");
    expect(tokenColors(html, "dark")).toContain("#7d8590");
    expect(tokenColors(html, "light")).not.toContain("#7d8590");
  });
});
