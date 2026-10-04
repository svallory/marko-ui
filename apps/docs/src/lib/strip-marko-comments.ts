// Removes `//`, `/* */` and `<!-- -->` comments from demo source before it is
// emitted as markdown — and only there. The docs site shows the same file WITH
// its comments (a maintainer reading the code block wants them), and the demo
// files on disk are untouched; this runs on the copy that goes into the
// `.md` endpoint / `marko-ui docs <name>` output, whose reader is an AI agent
// that has no use for notes-to-ourselves about notes/docs-canonical-structure
// or why upstream's demo needed a live language switcher.
//
// A scanner rather than a regex, because `//` is far more common inside a
// demo than a comment is: every `xmlns="http://www.w3.org/2000/svg"` on an
// inline icon and every `https://…` src would be eaten by a pattern match.
// Strings (single, double, template — including `${…}` interpolation) are
// tracked so a comment marker inside one is never mistaken for a comment.

/**
 * Strips line, block and Marko/HTML comments from Marko demo source.
 *
 * Newlines BETWEEN two lines of a comment survive (a comment's own line is
 * emptied), so the returned source keeps the original line count and a reader
 * comparing it against the demo file is not thrown off. Runs of blank lines
 * left behind by a stripped comment are collapsed to one, and trailing
 * whitespace is dropped per line.
 */
export function stripMarkoComments(source: string): string {
  const out: string[] = [];
  let index = 0;

  while (index < source.length) {
    const char = source[index] ?? "";

    if (char === "/" && source[index + 1] === "/") {
      const end = source.indexOf("\n", index);
      index = end === -1 ? source.length : end;
      continue;
    }

    if (char === "/" && source[index + 1] === "*") {
      const end = source.indexOf("*/", index + 2);
      const body = end === -1 ? source.slice(index + 2) : source.slice(index + 2, end);
      // The newline BETWEEN two lines of the comment survives (it is a real
      // line break in the file); the comment's own line is emptied. So a
      // standalone comment leaves a blank line behind and a comment sitting
      // mid-line leaves the code on its line.
      out.push("\n".repeat(Math.max(0, body.split("\n").length - 1)));
      index = end === -1 ? source.length : end + 2;
      continue;
    }

    // Marko/HTML comments are the same defect: a note to the next maintainer
    // that Marko compiles away but a reader of the source copy sees. Only the
    // real `-->` closes one — a bare `->` inside the body is prose, not the
    // end (Marko 6.3.46's own comment terminator aside, treating it as one
    // here would truncate differently from the compiler).
    if (char === "<" && source.startsWith("<!--", index)) {
      const end = source.indexOf("-->", index + 4);
      const body = end === -1 ? source.slice(index + 4) : source.slice(index + 4, end);
      out.push("\n".repeat(Math.max(0, body.split("\n").length - 1)));
      index = end === -1 ? source.length : end + 3;
      continue;
    }

    if (char === '"' || char === "'") {
      const end = consumeQuoted(source, index, char);
      out.push(source.slice(index, end));
      index = end;
      continue;
    }

    if (char === "`") {
      const end = consumeTemplate(source, index);
      out.push(source.slice(index, end));
      index = end;
      continue;
    }

    out.push(char);
    index += 1;
  }

  return tidy(out.join(""));
}

/** Index just past the closing `quote` of the string starting at `start`. */
function consumeQuoted(source: string, start: number, quote: string): number {
  let index = start + 1;
  while (index < source.length) {
    const char = source[index];
    if (char === "\\") {
      index += 2;
      continue;
    }
    if (char === quote) return index + 1;
    // Unterminated string: stop at the line end rather than eating the file.
    if (char === "\n") return index;
    index += 1;
  }
  return source.length;
}

/**
 * Index just past the closing backtick of the template literal starting at
 * `start`. `${…}` interpolations are copied verbatim, braces included, so
 * their contents are never rescanned as string text — a `//` inside one is
 * real code and must survive.
 */
function consumeTemplate(source: string, start: number): number {
  let index = start + 1;
  while (index < source.length) {
    const char = source[index];
    if (char === "\\") {
      index += 2;
      continue;
    }
    if (char === "`") return index + 1;
    if (char === "$" && source[index + 1] === "{") {
      let depth = 1;
      index += 2;
      while (index < source.length && depth > 0) {
        if (source[index] === "{") depth += 1;
        else if (source[index] === "}") depth -= 1;
        index += 1;
      }
      continue;
    }
    index += 1;
  }
  return source.length;
}

/** Trailing-whitespace trim, blank-run collapse, leading/trailing blank trim. */
function tidy(source: string): string {
  const trimmedLines = source
    .split("\n")
    .map((line) => line.replace(/[ \t]+$/, ""))
    .join("\n")
    .replace(/\n{3,}/g, "\n\n")
    .replace(/^\n+/, "");
  return trimmedLines.replace(/\n+$/, "");
}