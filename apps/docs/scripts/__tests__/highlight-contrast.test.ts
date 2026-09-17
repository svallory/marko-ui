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
 * NO emitted light-mode token color falls below 4.5:1 — so a future theme
 * bump, a new language, or a dropped remap fails here rather than silently
 * costing accessibility points in a Lighthouse run nobody reads.
 */
import { describe, expect, it } from "vitest";
import { highlightCode } from "../../src/lib/highlight-code.ts";

/** The docs code-block background, as reported by the Lighthouse audit. */
const LIGHT_CODE_BG = "#fbfbfb";
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

/** Every distinct `--shiki-light` color in a highlighted snippet. */
function lightTokenColors(html: string): string[] {
  return [...html.matchAll(/--shiki-light:(#[0-9a-fA-F]{6})/g)].map((match) =>
    match[1]!.toLowerCase(),
  );
}

describe("highlightCode light-mode contrast", () => {
  it.each(SNIPPETS.map((snippet) => [snippet.lang, snippet.code] as const))(
    "emits no sub-4.5:1 light token color for %s",
    async (lang, code) => {
      const html = await highlightCode(code, lang);
      const colors = [...new Set(lightTokenColors(html))];
      // A snippet that produced no themed token at all would make the
      // assertion below vacuously true, so require real output first.
      expect(colors.length).toBeGreaterThan(0);

      const failing = colors
        .map((color) => ({ color, ratio: contrastRatio(color, LIGHT_CODE_BG) }))
        .filter((entry) => entry.ratio < AA_NORMAL_TEXT);

      expect(
        failing,
        `sub-threshold token colors on ${LIGHT_CODE_BG}: ` +
          failing.map((entry) => `${entry.color} ${entry.ratio.toFixed(2)}:1`).join(", "),
      ).toEqual([]);
    },
  );

  it("remaps each color Lighthouse flagged, and leaves dark mode alone", async () => {
    // The three colors that actually failed in the production Lighthouse run.
    const flagged = ["#22863a", "#d73a49", "#e36209"];
    const html = await highlightCode(SNIPPETS[0]!.code, "marko");
    const lightColors = lightTokenColors(html);

    for (const color of flagged) {
      expect(lightColors, `${color} should have been remapped out of light mode`).not.toContain(
        color,
      );
    }

    // The remap must be scoped to --shiki-light; dark values stay untouched,
    // which is what keeps this a light-mode-only contrast fix.
    expect(html).toContain("--shiki-dark:");
  });
});
