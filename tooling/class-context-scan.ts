/**
 * class-context-scan.ts — DETECTOR for class-context string/template-chunk
 * spans in `.marko` source text.
 *
 * The class-as-data migration is complete (every component either has a
 * `classes.ts` or carries no class literals at all), so there is no
 * text-rewriting path for `.marko` sources any more — only this detector,
 * which `check-classes.ts` uses to prove a part file contains ZERO
 * class-context string literals. A missed span here is a missed violation,
 * never a corrupted file — this module never rewrites anything.
 *
 * Matches, in order of the alternation:
 *   1. a `class=` attribute name (start-of-file, whitespace, or `,` before it)
 *   2. a `class:` object-literal property whose value looks like an actual
 *      class-string expression (a quote, backtick, or `cn(` call) — excludes
 *      the very common `class: someIdentifier` destructuring-rename shape
 *      (`const { class: className, ...rest } = input`)
 *   3. a `<name>Class=` attribute name (e.g. `toastClass=`) — the convention
 *      this registry uses for a class string threaded to a nested
 *      component's root instead of the tag's own `class`
 *
 * For each match, `scanExpression` walks the value: a bracket/string/
 * comment-aware scan that finds every `"..."`/`'...'` literal and every
 * template-literal chunk (recursing into `${...}` interpolations) inside the
 * whole class-context expression — including nested `cn(...)` calls, at any
 * argument position, either side of a ternary or `+` concatenation, spanning
 * multiple lines, with comments correctly skipped.
 *
 * Known limits (fine for registry sources):
 * - Concise-mode `class=` and shorthand `.class-name` syntax are not handled;
 *   registry components use HTML-mode tags exclusively.
 * - A literal `class=` inside body text or a non-class string could trigger a
 *   scan; the scan only records string literals, so prose is unaffected in
 *   the sense that a violation there would be a real (if odd) hit, not noise
 *   that corrupts anything — this module never rewrites, only reports.
 */

/** A found class-context string/template-chunk span: `[start, end)` is the content between quotes (or a template chunk). */
export interface Span {
  start: number
  end: number
  kind: "string" | "template-chunk"
}

const CLASS_ATTR_REGEX =
  /(?:^|[\s,])class=|(?:^|[\s,])class:\s*(?=["'`]|cn\()|(?:^|[\s,])[A-Za-z][\w]*Class=/g

/**
 * Finds every class-context string/template-chunk span in `source`.
 * Exported so check-classes.ts can ask "does this file have any string
 * literal in a class position?" using one shared scanner rather than an
 * independent reimplementation that could silently drift from it.
 */
export function collectClassContextSpans(source: string): Span[] {
  const spans: Span[] = []
  CLASS_ATTR_REGEX.lastIndex = 0
  let match: RegExpExecArray | null
  while ((match = CLASS_ATTR_REGEX.exec(source)) !== null) {
    const valueStart = match.index + match[0].length
    const valueEnd = scanExpression(source, valueStart, spans)
    // Never rescan inside the value we just consumed.
    CLASS_ATTR_REGEX.lastIndex = valueEnd
  }
  return spans
}

/**
 * Scans a Marko attribute value expression starting at `start`, collecting
 * rewritable string spans into `spans`. Returns the index one past the end of
 * the expression.
 *
 * When `stopAtCloser` is true (scanning a `${...}` interpolation body), the
 * scan ends at the unbalanced `}` instead of at top-level whitespace.
 */
function scanExpression(
  src: string,
  start: number,
  spans: Span[],
  stopAtCloser = false
): number {
  const n = src.length
  let depth = 0
  let i = start

  while (i < n) {
    const ch = src[i]!

    if (ch === '"' || ch === "'") {
      i = scanQuoted(src, i, spans)
      continue
    }
    if (ch === "`") {
      i = scanTemplate(src, i, spans)
      continue
    }
    if (ch === "/") {
      const next = src[i + 1]
      if (next === "*") {
        const close = src.indexOf("*/", i + 2)
        i = close === -1 ? n : close + 2
        continue
      }
      if (next === "/" && (depth > 0 || stopAtCloser)) {
        const nl = src.indexOf("\n", i + 2)
        i = nl === -1 ? n : nl + 1
        continue
      }
      if (depth === 0 && !stopAtCloser && next === ">") {
        break // self-closing tag end
      }
      i++
      continue
    }
    if (ch === "(" || ch === "[" || ch === "{") {
      depth++
      i++
      continue
    }
    if (ch === ")" || ch === "]" || ch === "}") {
      if (depth === 0) {
        break // unbalanced closer ends the expression (or the `${...}` body)
      }
      depth--
      i++
      continue
    }
    if (
      depth === 0 &&
      !stopAtCloser &&
      (ch === "," || ch === ">" || /\s/.test(ch))
    ) {
      break
    }
    i++
  }

  if (stopAtCloser && i < n && src[i] === "}") {
    i++ // consume the interpolation's closing brace
  }
  return i
}

/** Scans a `"..."` / `'...'` literal from its opening quote; records the content span. */
function scanQuoted(src: string, openQuote: number, spans: Span[]): number {
  const quote = src[openQuote]!
  const n = src.length
  let i = openQuote + 1
  while (i < n) {
    const ch = src[i]!
    if (ch === "\\") {
      i += 2
      continue
    }
    if (ch === quote) {
      spans.push({ start: openQuote + 1, end: i, kind: "string" })
      return i + 1
    }
    i++
  }
  return n // unterminated — bail without recording
}

/**
 * Scans a template literal from its opening backtick; records each static
 * chunk and recurses into `${...}` interpolations (their string literals are
 * class-context strings too).
 */
function scanTemplate(src: string, openTick: number, spans: Span[]): number {
  const n = src.length
  let chunkStart = openTick + 1
  let i = chunkStart
  while (i < n) {
    const ch = src[i]!
    if (ch === "\\") {
      i += 2
      continue
    }
    if (ch === "`") {
      pushChunk(spans, chunkStart, i)
      return i + 1
    }
    if (ch === "$" && src[i + 1] === "{") {
      pushChunk(spans, chunkStart, i)
      i = scanExpression(src, i + 2, spans, true)
      chunkStart = i
      continue
    }
    i++
  }
  pushChunk(spans, chunkStart, n) // unterminated — record what we saw
  return n
}

function pushChunk(spans: Span[], start: number, end: number) {
  if (end > start) {
    spans.push({ start, end, kind: "template-chunk" })
  }
}
