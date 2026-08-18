/**
 * Applies a StyleMap (see `./style-map.ts`) to a `.marko` template source.
 *
 * Only strings in **class contexts** are rewritten — the value expression of a
 * `class=` attribute:
 *
 *   - `class="mu-x flex"` / `class='mu-x flex'` — plain quoted literals
 *   - `class=cn("mu-x flex", input.class)` — every string literal inside the
 *     call is rewritten; identifier/member/call arguments are untouched
 *   - `class=cn(\n  "mu-x",\n  // comment\n  cond ? "a" : "b",\n)` —
 *     multi-line expressions with comments are handled
 *   - template literals — only the static chunks between `${...}`
 *     interpolations are rewritten (string literals nested inside an
 *     interpolation are rewritten too; they are still class-context strings)
 *
 * Everything else passes through byte-identical: import/export specifiers,
 * non-class attributes (`data-slot="..."`, aria strings), tag body text,
 * comments, and `.ts` logic (variants.ts is `./transform-variants.ts`'s job).
 *
 * Implementation is tokenizer-level (no Marko compiler AST): a `class=`
 * attribute occurrence (attr name exactly `class`, preceded by whitespace or
 * `,`) starts a small expression scanner that tracks bracket depth, string /
 * template-literal state, and JS comments, terminating at top-level
 * whitespace, `,`, `>`, `/>`, or an unbalanced closer. String spans collected
 * during the scan are rewritten via the shared `createStyleApplier` from
 * `./apply-style-map.ts` — byte-identical semantics to the variants.ts
 * transform (merge order, unmapped-token stripping, allowlist, per-file
 * dedup, whitespace collapse). NOTE: an EMPTY StyleMap is therefore NOT the
 * identity transform — non-allowlisted anchor tokens are still stripped; the
 * phase-3 identity check compares modulo stripped anchors.
 *
 * ALSO matches a `class:` object-literal property (e.g. the prop bag built
 * for a dynamic-tag render-prop call: `${trigger}({ ..., class: "mu-x" })`)
 * — but ONLY when the value immediately starts with `"`, `'`, a backtick, or
 * a `cn(` call, i.e. it looks like an actual class-string expression. This
 * deliberately does NOT match `class: className` — the extremely common
 * destructuring-rename shape (`const { class: className, ...rest } = input`)
 * used throughout this registry to strip `class` off `input` before
 * forwarding `...rest`. A bare identifier after `class:` is a binding
 * target, never a class value, so it is intentionally excluded rather than
 * scanned-and-found-harmless — this keeps the regex's intent legible and
 * does not depend on "no string literals happen to appear after it" holding
 * by coincidence.
 *
 * ALSO matches any `<name>Class=` attribute (e.g. `toastClass="mu-toast"`)
 * — a convention this registry uses for a class string threaded to a NESTED
 * component's root instead of the tag's own `class` (Zag toast's per-toast
 * root class, forwarded through `<Toaster toastClass=...>` down to
 * `<toast-item>`, which is the only such case today). The receiving side
 * merges it via `class=cn(input.toastClass, ...)`, a normal class context —
 * only the DEFINING literal (in `sonner.marko`) needs the widened match,
 * since the pass-through sites only ever hold an identifier, never a
 * literal. `class=` itself is excluded from this generic suffix match (it
 * is handled by the first alternative) to avoid a redundant double-match.
 *
 * Known limits (fine for registry sources):
 * - Concise-mode `class=` and shorthand `.class-name` syntax are not handled;
 *   registry components use HTML-mode tags exclusively.
 * - A literal `class=` inside body text or a non-class string could trigger a
 *   scan; the scan only rewrites string literals containing anchor tokens, so
 *   prose is unaffected in practice.
 * - String literals containing backslash escapes are left untouched
 *   (defensive; class strings never need escapes).
 */
import {
  createStyleApplier,
  DEFAULT_ALLOWLIST,
  type ApplyStyleMapOptions,
} from "./apply-style-map"
import { type StyleMap } from "./style-map"

export { DEFAULT_ALLOWLIST }

export interface TransformMarkoOptions extends ApplyStyleMapOptions {}

/** A rewritable string span: `[start, end)` is the content between quotes (or a template chunk). */
interface Span {
  start: number
  end: number
  kind: "string" | "template-chunk"
}

/**
 * Matches, in order of the alternation:
 *   1. a `class=` attribute name (start-of-file, whitespace, or `,` before it)
 *   2. a `class:` object-literal property whose value looks like an actual
 *      class-string expression (a quote, backtick, or `cn(` call) — see the
 *      file header for why the value lookahead is required (excludes the
 *      `class: someIdentifier` destructuring-rename shape)
 *   3. a `<name>Class=` attribute name (e.g. `toastClass=`) — see the file
 *      header for the nested-component-root convention this covers
 */
const CLASS_ATTR_REGEX =
  /(?:^|[\s,])class=|(?:^|[\s,])class:\s*(?=["'`]|cn\()|(?:^|[\s,])[A-Za-z][\w]*Class=/g

export function transformMarkoSource(
  source: string,
  styleMap: StyleMap,
  opts: TransformMarkoOptions = {}
): string {
  const applier = createStyleApplier(styleMap, opts)
  const spans: Span[] = []

  CLASS_ATTR_REGEX.lastIndex = 0
  let match: RegExpExecArray | null
  while ((match = CLASS_ATTR_REGEX.exec(source)) !== null) {
    const valueStart = match.index + match[0].length
    const valueEnd = scanExpression(source, valueStart, spans)
    // Never rescan inside the value we just consumed.
    CLASS_ATTR_REGEX.lastIndex = valueEnd
  }

  if (spans.length === 0) {
    return source
  }

  let out = ""
  let last = 0
  for (const span of spans) {
    const raw = source.slice(span.start, span.end)
    const replaced = rewriteSpan(raw, span.kind, applier)
    if (replaced === raw) {
      continue
    }
    out += source.slice(last, span.start) + replaced
    last = span.end
  }
  out += source.slice(last)
  return out
}

function rewriteSpan(
  raw: string,
  kind: Span["kind"],
  applier: ReturnType<typeof createStyleApplier>
): string {
  // Defensive: escaped content is never a plain class string — leave it be.
  if (raw.includes("\\")) {
    return raw
  }

  if (kind === "string") {
    return applier.apply(raw)
  }

  // Template chunk: the applier trims, but chunk-edge whitespace separates
  // classes from adjacent `${...}` interpolations — preserve one space.
  const applied = applier.apply(raw)
  if (applied === raw) {
    return raw
  }
  const lead = /^\s/.test(raw) ? " " : ""
  const trail = /\s$/.test(raw) ? " " : ""
  if (applied === "") {
    return lead || trail
  }
  return lead + applied + trail
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
