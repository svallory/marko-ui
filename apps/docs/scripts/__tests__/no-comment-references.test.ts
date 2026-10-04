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
 * A docs.ts file with its own TS comments removed — only the strings a reader
 * ever sees are searched, so a maintainer may still write `// see the
 * in-file comment` for their own notes without tripping the guard.
 */
function readerVisibleText(source: string): string {
  return source
    .split("\n")
    .filter((line) => !line.trim().startsWith("//"))
    .join("\n")
    .replace(/\/\*[\s\S]*?\*\//g, "");
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
      const text = readerVisibleText(readFileSync(file, "utf8"));
      for (const pattern of COMMENT_REFERENCES) {
        // matchAll needs the global flag; the source patterns are shared.
        for (const match of text.matchAll(new RegExp(pattern.source, "gi"))) {
          const line = text.slice(0, match.index).split("\n").length;
          offenders.push(`${file.slice(DEMOS_DIR.length + 1)}:${line}: ${match[0]}`);
        }
      }
    }

    expect(offenders).toEqual([]);
  });
});