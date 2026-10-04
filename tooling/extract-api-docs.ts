// Reads the hand-authored `apps/docs/src/demos/<component>/docs.ts` files.
//
// A PARSER, not an import. The registry build needs the docs fields of all 86
// components, and importing 86 modules for six string fields and a list of
// example names is the wrong cost — worse, it puts the demos tree into the
// tooling's module graph for no gain. So the files are read and their literals
// parsed.
//
// What this is NOT: a second source of truth. `docs.ts` stays the only place
// these strings are written; this only reads them. Anything the parser cannot
// find is simply absent from the model, and the renderer omits an empty section
// rather than printing a placeholder. The docs site does not use this file —
// it imports the real modules (see apps/docs/src/lib/component-markdown.ts) —
// so a parser gap shows up as a thinner registry model, never as two
// different answers on one page.
import { readFile, readdir } from "node:fs/promises";
import { existsSync } from "node:fs";
import { join } from "node:path";

const REPO = new URL("../", import.meta.url).pathname;
const DEMOS_DIR = join(REPO, "apps/docs/src/demos");

export interface ParsedExample {
  /** The demo file's base name, which is also its `--example` id. */
  name: string;
  title: string;
  description?: string;
  essential?: boolean;
}

export interface ParsedDocs {
  description?: string;
  usageTags?: string;
  importSnippet?: string;
  usageSnippet?: string;
  concepts?: string;
  composition?: string;
  accessibilityKeyboard?: { keys: string; description: string }[];
  accessibilityNotes?: string[];
  examples: ParsedExample[];
}

/**
 * The value of `key: "…"` or `key: \`…\`` — the two shapes docs.ts uses.
 *
 * Scans forward from the opening delimiter rather than matching a pattern to
 * the next delimiter: a template literal holding an escaped backtick (`\``
 * inside a fenced code block) would otherwise be cut in half, and a
 * multi-line composition section would silently arrive truncated.
 */
export function readStringField(source: string, key: string): string | undefined {
  const opener = new RegExp(`\\b${key}:\\s*(["'\`])`).exec(source);
  if (!opener) return undefined;
  const quote = opener[1] as string;
  const start = opener.index + opener[0].length;

  if (quote === "'") {
    const end = source.indexOf("'", start);
    return end === -1 ? undefined : source.slice(start, end);
  }

  let end = start;
  while (end < source.length) {
    const char = source[end];
    if (char === "\\") {
      end += 2;
      continue;
    }
    if (char === quote) break;
    end += 1;
  }
  const raw = source.slice(start, end);
  // Unescape only what the literal had to escape: a double-quoted string
  // cannot contain a raw newline, and a template literal can.
  return quote === '"' ? raw.replace(/\n\s*/g, " ") : raw;
}

/**
 * The `examples: [...]` array, one entry per object.
 *
 * The array is scanned to its matching bracket first (so an object inside an
 * entry cannot end it early), then each entry's fields are read from its own
 * text.
 */
function readExamples(source: string): ParsedExample[] {
  const array = /examples:\s*\[/.exec(source);
  if (!array) return [];
  let depth = 0;
  let end = array.index;
  for (; end < source.length; end += 1) {
    const char = source[end];
    if (char === "[" || char === "{") depth += 1;
    else if (char === "]" || char === "}") {
      depth -= 1;
      if (depth === 0) break;
    }
  }
  const body = source.slice(array.index + 1, end);

  const entries: ParsedExample[] = [];
  const entry = /\{\s*name:\s*"([^"]+)"([\s\S]*?)\n\s*\},/g;
  let match: RegExpExecArray | null;
  while ((match = entry.exec(body)) !== null) {
    const [, name, rest] = match;
    const example: ParsedExample = {
      name: name as string,
      title: readStringField(rest as string, "title") ?? (name as string),
    };
    const description = readStringField(rest as string, "description");
    if (description) example.description = description;
    if (/essential:\s*true/.test(rest as string)) example.essential = true;
    entries.push(example);
  }
  return entries;
}

/** `[{ keys: "Enter", description: "…" }, …]` — the keyboard table's rows. */
function readKeyboard(source: string): { keys: string; description: string }[] {
  const array = /accessibilityKeyboard:\s*\[/.exec(source);
  if (!array) return [];
  const rows: { keys: string; description: string }[] = [];
  const row = /\{\s*keys:\s*"([^"]*)",\s*description:\s*"([^"]*)"/g;
  let match: RegExpExecArray | null;
  while ((match = row.exec(source.slice(array.index))) !== null) {
    rows.push({ keys: match[1] as string, description: match[2] as string });
  }
  return rows;
}

/**
 * The `- "…"` entries of `accessibilityNotes`.
 *
 * A note built by concatenating strings across lines (`"a " + "b"`) yields
 * only its first fragment. That is a deliberate truncation rather than a
 * mis-parse: a short note beats a mangled one, and the docs site — which
 * imports the real module — prints the whole thing.
 */
function readNotes(source: string): string[] {
  const array = /accessibilityNotes:\s*\[/.exec(source);
  if (!array) return [];
  const notes: string[] = [];
  const note = /^\s*-\s*("(?:[^"\\]|\\.)*")/gm;
  let match: RegExpExecArray | null;
  while ((match = note.exec(source.slice(array.index))) !== null) {
    notes.push((match[1] as string).slice(1, -1).replace(/\\"/g, '"'));
  }
  return notes;
}

/** One component's `docs.ts`, or `undefined` when it has none yet. */
export async function parseDocsFile(componentName: string): Promise<ParsedDocs | undefined> {
  const file = join(DEMOS_DIR, componentName, "docs.ts");
  if (!existsSync(file)) return undefined;
  const source = await readFile(file, "utf8");
  const docs: ParsedDocs = {
    examples: readExamples(source),
    accessibilityKeyboard: readKeyboard(source),
    accessibilityNotes: readNotes(source),
  };
  for (const key of [
    "description",
    "usageTags",
    "importSnippet",
    "usageSnippet",
    "concepts",
    "composition",
  ] as const) {
    const value = readStringField(source, key);
    if (value !== undefined) docs[key] = value;
  }
  return docs;
}

/** Every component's `docs.ts`, keyed by component name. */
export async function parseDocsFiles(): Promise<Map<string, ParsedDocs>> {
  const parsed = new Map<string, ParsedDocs>();
  const entries = await readdir(DEMOS_DIR, { withFileTypes: true });
  for (const entry of entries) {
    if (!entry.isDirectory()) continue;
    const docs = await parseDocsFile(entry.name);
    if (docs) parsed.set(entry.name, docs);
  }
  return parsed;
}