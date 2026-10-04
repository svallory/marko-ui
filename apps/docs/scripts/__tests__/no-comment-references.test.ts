import { describe, expect, it } from "vitest";
import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

// The markdown payload strips `//` and `/* */` comments from demo source (see
// strip-marko-comments), so a docs.ts description that points the reader at
// "the in-file comment in X.marko" is a dangling reference — the exact defect
// class criterion 3 of the original task was about, reintroduced by the
// stripping itself. Twelve such descriptions existed before this guard; it is
// cheaper to make the regression impossible than to re-audit 86 files.
// Lives in scripts/__tests__ rather than src/demos/__tests__ on purpose:
// the demos-manifest generator treats every directory under src/demos as a
// component in progress and warns about the ones with no docs.ts.
const DEMOS_DIR = fileURLToPath(new URL("../../src/demos", import.meta.url));

/** Prose that points at a comment rather than at the docs themselves. */
const COMMENT_REFERENCES = [
  /in-file comment/i,
  /in-file note/i,
  /comment in `[^`]+`/i,
  /note in `[^`]+`/i,
  /see the comment/i,
  /see the note/i,
  /in the demo source/i,
];

/**
 * The reader-visible lines of a docs.ts file, each with the line number it
 * has in the FILE.
 *
 * `//` lines and anything inside a `/* … *\/` block are dropped, so a maintainer
 * can still write those words in a note for their own use. Keeping the
 * original line number matters because a report that names the wrong line is
 * worse than one that names none — the count shifts as soon as a single `//`
 * line above the offender is filtered out.
 */
function readerVisibleLines(source: string): { line: number; text: string }[] {
  const visible: { line: number; text: string }[] = [];
  let inBlock = false;
  for (const [index, raw] of source.split("\n").entries()) {
    const trimmed = raw.trim();
    if (inBlock) {
      if (trimmed.endsWith("*/")) inBlock = false;
      continue;
    }
    if (trimmed.startsWith("/*")) {
      if (!trimmed.endsWith("*/")) inBlock = true;
      continue;
    }
    if (trimmed.startsWith("//")) continue;
    // A trailing block comment on a line of prose: keep the prose.
    const withoutBlock = raw.replace(/\/\*[\s\S]*?\*\//g, "").replace(/\s+$/, "");
    if (withoutBlock !== "") visible.push({ line: index + 1, text: withoutBlock });
  }
  return visible;
}

function* docsFiles(dir: string): Generator<string> {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) yield* docsFiles(path);
    else if (entry.name === "docs.ts") yield path;
  }
}

describe("docs.ts descriptions", () => {
  const files = [...docsFiles(DEMOS_DIR)];

  it("finds the docs files at all", () => {
    expect(files.length).toBeGreaterThan(80);
  });

  it("never sends the reader to a comment the markdown strips", () => {
    const offenders: string[] = [];
    for (const file of files) {
      const lines = readerVisibleLines(readFileSync(file, "utf8"));
      const text = lines.map((line) => line.text).join("\n");
      for (const pattern of COMMENT_REFERENCES) {
        // matchAll needs the global flag; the source patterns are shared.
        for (const match of text.matchAll(new RegExp(pattern.source, "gi"))) {
          // Map the match's offset back to a FILE line via the visible-line
          // index, not a count over the stripped text.
          const lineIndex = text.slice(0, match.index).split("\n").length - 1;
          const line = lines[lineIndex]?.line ?? lineIndex + 1;
          offenders.push(`${file.slice(DEMOS_DIR.length + 1)}:${line}: ${match[0]}`);
        }
      }
    }

    expect(offenders).toEqual([]);
  });

  it("names the line the text is really on, in the file", () => {
    // The planted reference sits on line 8; the four `//` lines above it must
    // not shift the report.
    const planted = [
      "// 1",
      "// 2",
      "// 3",
      "// 4",
      "export const docs = {",
      "  description:",
      '    examples: [{ description: "See the in-file comment for details." }],',
      "};",
    ].join("\n");
    const lines = readerVisibleLines(planted);
    const text = lines.map((line) => line.text).join("\n");
    const match = /in-file comment/i.exec(text)!;
    const lineIndex = text.slice(0, match.index).split("\n").length - 1;

    expect(lines[lineIndex]?.line).toBe(7);
  });
});