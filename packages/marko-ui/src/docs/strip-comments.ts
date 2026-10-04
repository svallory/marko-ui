// Removes line comments, block comments and Marko/HTML comments from demo
// source before it is emitted as markdown — and only there. The docs site
// shows the same file WITH its comments (a maintainer reading the code block
// wants them), and the demo files on disk are untouched; this runs on the copy
// that goes into the `.md` endpoint / `marko-ui docs <name>` output, whose
// reader is an AI agent that has no use for notes-to-ourselves about
// notes/docs-canonical-structure or why upstream's demo needed a live language
// switcher.
//
// WHY THIS IS A SCANNER WITH CONTEXT, NOT A REGEX
//
// Three separate things made a naive strip destroy real code:
//
// 1. `//` is far more common inside a demo than a comment is. Every
//    `xmlns="http://www.w3.org/2000/svg"` on an inline icon, every
//    `https://…` src, and — the one that actually shipped broken output —
//    `<InputGroupText>https://</InputGroupText>`, where the text content
//    between tags is literal text, not a comment. A pattern match ate the
//    rest of the line, closing tag included.
// 2. Strings. `//` inside `"…"`, `'…'` or a template literal is a string.
// 3. A `/*` in text content is not a block comment either; treating it as one
//    deletes everything to the end of the file.
//
// So a comment opener is only a comment in a position where a comment can
// actually occur: at the start of a line (only whitespace before it), inside a
// `{…}` expression (a Marko attribute expression or a text expression), or
// inside a `<script>` body. Anywhere else the characters are content and are
// copied through untouched. `<!-- -->` needs no such guard: in markup it IS a
// comment wherever it appears, which is also how the compiler reads it.

/**
 * Strips line, block and Marko/HTML comments from Marko demo source.
 *
 * Only comment LINES go: a line comment or a block comment that starts a line
 * (after indentation), or one that sits inside a `{…}` expression or a
 * `<script>` body. Text content, attribute values and string literals are
 * preserved byte for byte.
 *
 * Line structure around code is kept — a mid-line comment leaves the code on
 * its line, and the newline BETWEEN two lines of a block comment survives (the
 * comment's own line is emptied) — but the total line count is NOT preserved:
 * `tidy()` collapses the blank runs a stripped comment leaves behind and drops
 * leading/trailing blank lines.
 */
export function stripMarkoComments(source: string): string {
  const out: string[] = [];
  let index = 0;

  /** Nothing but whitespace seen since the last newline. */
  let atLineStart = true;
  /**
   * Inside a `{…}` expression — a Marko attribute expression, or a text
   * expression. Opened only where one can actually be: in a tag head
   * (attribute position), or in body text where the brace closes on the same
   * line. A bare `{` in body text that never closes is literal text, and
   * treating it as an expression would swallow the rest of the line as a
   * comment — `text { not expr // here</p>` would lose its closing tag.
   */
  let braceDepth = 0;
  /** Inside a `<…>` head, where `{` really does start an attribute value. */
  let inTag = false;
  /** Inside a `<script>` body, where a comment can follow code on a line. */
  let inScript = false;

  while (index < source.length) {
    const char = source[index] ?? "";

    if (char === "\n") {
      out.push(char);
      atLineStart = true;
      index += 1;
      continue;
    }

    // String openers, checked before anything else: inside a string literal
    // nothing is a comment, whatever the surrounding context.
    if (char === '"' || char === "'") {
      const end = consumeQuoted(source, index, char);
      out.push(source.slice(index, end));
      atLineStart = false;
      index = end;
      continue;
    }
    if (char === "`") {
      const end = consumeTemplate(source, index);
      out.push(source.slice(index, end));
      atLineStart = false;
      index = end;
      continue;
    }

    if (char === "<") {
      if (!inScript && source.startsWith("<script", index)) inScript = true;
      else if (inScript && source.startsWith("</script", index)) inScript = false;
      else if (!inScript && !inTag && !source.startsWith("<!--", index)) inTag = true;
    } else if (char === ">" && inTag && braceDepth === 0) {
      inTag = false;
    }

    const commentAllowed = atLineStart || braceDepth > 0 || inScript;

    if (commentAllowed && char === "/" && source[index + 1] === "/") {
      const end = source.indexOf("\n", index);
      index = end === -1 ? source.length : end;
      continue;
    }

    if (commentAllowed && char === "/" && source[index + 1] === "*") {
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

    // Marko/HTML comments need no context guard (see the module comment), but
    // only the real `-->` closes one: a bare `->` inside the body is prose.
    if (char === "<" && source.startsWith("<!--", index)) {
      const end = source.indexOf("-->", index + 4);
      const body = end === -1 ? source.slice(index + 4) : source.slice(index + 4, end);
      out.push("\n".repeat(Math.max(0, body.split("\n").length - 1)));
      index = end === -1 ? source.length : end + 3;
      continue;
    }

    if (char === "{" && (inTag || closesOnItsLine(source, index))) {
      braceDepth += 1;
    } else if (char === "}" && braceDepth > 0) {
      braceDepth -= 1;
    }

    out.push(char);
    if (char !== " " && char !== "\t" && char !== "\r") atLineStart = false;
    index += 1;
  }

  return tidy(out.join(""));
}

/**
 * True when the `{` at `start` has a matching `}` before the end of its line.
 *
 * A body-text expression is short — `{count}`, `{item.label}` — so requiring
 * the close on the same line is what separates one from a literal brace. It
 * cannot be perfect: a multi-line text expression is not recognized, and its
 * contents are then left alone rather than stripped, which is the safe
 * direction (a comment that survives is noise; code that is deleted is a
 * broken example).
 */
function closesOnItsLine(source: string, start: number): boolean {
  let depth = 0;
  let quote = "";
  for (let index = start; index < source.length; index += 1) {
    const char = source[index];
    if (char === "\n") return false;
    if (quote) {
      if (char === quote) quote = "";
      continue;
    }
    if (char === '"' || char === "'" || char === "`") {
      quote = char;
      continue;
    }
    if (char === "{") depth += 1;
    else if (char === "}") {
      depth -= 1;
      if (depth === 0) return true;
    }
  }
  return false;
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