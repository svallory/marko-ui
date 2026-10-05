// Tiny markdown subset for the prose fields authored in `demos/<name>/docs.ts`
// (and the JSDoc descriptions in api-reference.json). Those strings are
// markdown — the same data feeds `/docs/components/<name>.md` and the CLI,
// where markdown is the right output — so the HTML page has to turn them into
// markup instead of printing the punctuation.
//
// Output is a plain node tree, never an HTML string: the `<md-prose>` tag
// renders it through Marko's own escaping, so nothing authored in docs.ts can
// inject markup. Supported: paragraphs, `- ` bullet lists, fenced code blocks,
// and inline `code`, **bold** and [links](url). Anything else (an unclosed
// marker, an unsafe URL) degrades to literal text, never to an error.

export type Leaf = { type: "text"; value: string } | { type: "code"; value: string };

export type Inline =
  | Leaf
  | { type: "strong"; children: Leaf[] }
  | { type: "link"; href: string; children: Leaf[] };

export type Block =
  | { type: "paragraph"; children: Inline[] }
  | { type: "list"; items: Inline[][] }
  | { type: "pre"; value: string };

/**
 * In-page anchors, root-relative paths (one slash, then a character that is
 * neither `/` nor `\` — browsers read `/\host` as `//host`) and http(s) only:
 * never `javascript:`.
 */
export function isSafeHref(href: string): boolean {
  return /^(#[\w-]+|\/[^\s/\\][^\s\\]*|https?:\/\/[^\s\\]+)$/.test(href);
}

function parseLeaves(src: string): Leaf[] {
  const out: Leaf[] = [];
  let text = "";
  const flush = () => {
    if (text) out.push({ type: "text", value: text });
    text = "";
  };
  for (let i = 0; i < src.length; i++) {
    if (src[i] === "`") {
      const end = src.indexOf("`", i + 1);
      // `` is not an (empty) code span; an unclosed backtick stays literal.
      if (end > i + 1) {
        flush();
        out.push({ type: "code", value: src.slice(i + 1, end) });
        i = end;
        continue;
      }
    }
    text += src[i];
  }
  flush();
  return out;
}

/** Inline syntax of one run of text. */
export function parseInline(src: string): Inline[] {
  const out: Inline[] = [];
  let plain = "";
  const flush = () => {
    if (plain) out.push(...parseLeaves(plain));
    plain = "";
  };
  for (let i = 0; i < src.length; i++) {
    const ch = src[i];
    if (ch === "`") {
      // Copy a whole code span verbatim so `**` or `[x](y)` inside it is inert.
      const end = src.indexOf("`", i + 1);
      if (end > i + 1) {
        plain += src.slice(i, end + 1);
        i = end;
        continue;
      }
    } else if (ch === "*" && src[i + 1] === "*") {
      const end = findBoldEnd(src, i + 2);
      if (end > i + 2) {
        flush();
        out.push({ type: "strong", children: parseLeaves(src.slice(i + 2, end)) });
        i = end + 1;
        continue;
      }
    } else if (ch === "[") {
      const close = findLabelEnd(src, i);
      if (close !== -1 && src[close + 1] === "(") {
        const paren = src.indexOf(")", close + 2);
        if (paren !== -1) {
          const label = src.slice(i + 1, close);
          const href = src.slice(close + 2, paren).trim();
          if (label && isSafeHref(href)) {
            flush();
            out.push({ type: "link", href, children: parseLeaves(label) });
            i = paren;
            continue;
          }
        }
      }
    }
    plain += ch;
  }
  flush();
  return out;
}

/** Index of the `**` closing a bold run that starts at `from`, skipping code spans. */
function findBoldEnd(src: string, from: number): number {
  for (let i = from; i < src.length; i++) {
    if (src[i] === "`") {
      const end = src.indexOf("`", i + 1);
      if (end > i + 1) i = end;
    } else if (src[i] === "*" && src[i + 1] === "*") return i;
  }
  return -1;
}

/** Index of the `]` closing the label that opens at `open`, skipping code spans. */
function findLabelEnd(src: string, open: number): number {
  for (let i = open + 1; i < src.length; i++) {
    if (src[i] === "`") {
      const end = src.indexOf("`", i + 1);
      if (end > i + 1) i = end;
    } else if (src[i] === "]") return i;
    else if (src[i] === "[") return -1;
  }
  return -1;
}

const FENCE = /^\s*```/;
const BULLET = /^\s*[-*] +(.*)$/;

/** Block structure of a docs.ts prose field. */
export function parseBlocks(src: string): Block[] {
  const lines = src.replace(/\r\n?/g, "\n").split("\n");
  const blocks: Block[] = [];
  let para: string[] = [];
  let list: string[] | null = null;
  const flushPara = () => {
    if (para.length) blocks.push({ type: "paragraph", children: parseInline(para.join(" ")) });
    para = [];
  };
  const flushList = () => {
    if (list) blocks.push({ type: "list", items: list.map((item) => parseInline(item)) });
    list = null;
  };

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i] as string;
    if (FENCE.test(line)) {
      flushPara();
      flushList();
      const body: string[] = [];
      // An unclosed fence runs to the end of the string rather than swallowing
      // nothing or throwing: the author clearly meant a code block.
      for (i++; i < lines.length && !FENCE.test(lines[i] as string); i++) body.push(lines[i] as string);
      blocks.push({ type: "pre", value: body.join("\n") });
      continue;
    }
    if (line.trim() === "") {
      flushPara();
      flushList();
      continue;
    }
    const bullet = BULLET.exec(line);
    if (bullet) {
      flushPara();
      (list ??= []).push(bullet[1] as string);
      continue;
    }
    // A wrapped continuation line of a bullet belongs to that bullet.
    if (list && /^\s+\S/.test(line)) {
      list[list.length - 1] += ` ${line.trim()}`;
      continue;
    }
    flushList();
    para.push(line.trim());
  }
  flushPara();
  flushList();
  return blocks;
}

/** The text a node tree reads as, with no markup — for meta tags and tests. */
export function plainText(src: string): string {
  const inline = (nodes: Inline[]): string =>
    nodes
      .map((n) => (n.type === "text" || n.type === "code" ? n.value : n.children.map((c) => c.value).join("")))
      .join("");
  return parseBlocks(src)
    .map((b) => (b.type === "paragraph" ? inline(b.children) : b.type === "list" ? b.items.map(inline).join(" ") : b.value))
    .join("\n\n");
}
