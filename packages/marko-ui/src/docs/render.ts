// The ONE markdown renderer for a ComponentDocs model. Both consumers use it:
// `marko-ui docs <name>` (model from the registry item, rendered locally) and
// the docs site's `/docs/components/<name>.md` (same model, all examples).
//
// The order is the point. The reader is an agent about to write markup, so it
// gets, in the order it needs them: what the thing is, how to use it, the
// parts it is made of, what it accepts, what it fires, how it behaves for a
// keyboard, and then the few examples that show API prose cannot, with a list
// and an exact command for the rest. Sections an agent does not need are not
// printed at all rather than printed empty.
//
// The model stores every snippet AS AUTHORED (examples import
// `@marko-ui/shadcn/ui/…`, the usage import is the copy path's
// `@/components/ui/…`). `importStyle` resolves both into ONE coherent story,
// so the Usage block and the examples can never disagree about where a
// component comes from — the defect the previous branch shipped.
import {
  DEFAULT_EXAMPLE_CHAR_BUDGET,
  DEFAULT_EXAMPLE_LIMIT,
  DEFAULT_IMPORT_STYLE,
  IMPORT_PACKAGE_UI,
  type ComponentDocs,
  type ExampleSelection,
  type ImportStyle,
  type PartDoc,
  type PropDoc,
} from "./types";

/** Options beyond the model itself. */
export interface RenderOptions {
  /**
   * How many examples the default output prints before it falls back to the
   * "More examples" list. Overridable so a fixture can assert the list logic
   * without a 26-example component.
   */
  exampleLimit?: number;
  /**
   * How much example source the default output prints. Overridable for the
   * same reason as the count — see DEFAULT_EXAMPLE_CHAR_BUDGET.
   */
  exampleCharBudget?: number;
  /**
   * The command the "More examples" line tells the reader to run. Defaults to
   * `marko-ui docs <name>`; the docs site passes its own phrasing so a human
   * reading the page is not sent to a CLI they may not have.
   */
  moreExamplesCommand?: string;
  /**
   * Which import paths the snippets assume. The CLI passes the project's own
   * (components.json `distribution` + `aliases.ui`); the site passes the
   * copy path with the default alias. Defaults to copy + `@/components/ui`.
   */
  importStyle?: ImportStyle;
}

/** Collapse to one line. Pipes are left alone: nothing here is a table cell. */
function oneLine(value: string): string {
  return value.replace(/\s+/g, " ").trim();
}

/** Drops the `| undefined` every optional prop's type carries. */
function stripUndefined(type: string): string {
  return oneLine(type)
    .replace(/\s*\|\s*undefined\b/g, "")
    .replace(/\s*\|\s*null\s*\|\s*undefined\b/g, "")
    .trim();
}

/** The default/fixed suffix, or "" when neither is recorded. */
function valueSuffix(prop: { default?: string; fixed?: string | true }): string {
  if (prop.fixed !== undefined) {
    return prop.fixed === true ? " = fixed" : ` = fixed ${prop.fixed}`;
  }
  return prop.default ? ` = ${prop.default}` : "";
}

/** One prop line: `name: type = default — description`. */
function propLine(prop: PropDoc): string {
  const name = prop.required ? `${prop.name} (required)` : prop.name;
  const suffix = valueSuffix(prop);
  const description = prop.description ? ` — ${oneLine(prop.description)}` : "";
  return `${name}: ${stripUndefined(prop.type)}${suffix}${description}`;
}

/** `value` (required) — how a part's own attributes are listed. */
function attributeList(part: PartDoc): string {
  const attributes = part.attributes ?? [];
  if (attributes.length === 0) return "";
  const rendered = attributes
    .map((attribute) => {
      const required = attribute.required ? " (required)" : "";
      return `\`${attribute.name}\`${required}: ${stripUndefined(attribute.type)}`;
    })
    .join(", ");
  return `attributes: ${rendered}`;
}

/**
 * `<@trigger|Record<string, unknown>|>`, plus the part's own attributes and
 * whether it may be written more than once.
 */
function partLine(part: PartDoc): string {
  const tag = part.param ? `<@${part.name}|${part.param}|>` : `<@${part.name}>`;
  const details = [part.description && oneLine(part.description), attributeList(part)];
  if (part.repeatable) details.push("repeatable");
  const rendered = details.filter(Boolean).join("; ");
  return rendered ? `${tag} — ${rendered}` : tag;
}

/** `<Dialog|string|>` — the tag's default body, which is NOT an attr-tag. */
function bodyLine(tagName: string, body: ComponentDocs["body"]): string {
  const tag = body?.param ? `<${tagName}|${body.param}|>` : `<${tagName}>`;
  const description = body?.description ? ` — ${oneLine(body.description)}` : "";
  return `The tag's body: \`${tag}…</${tagName}>\`${description}`;
}

/**
 * Rewrites every import in a snippet to the paths `style` assumes.
 *
 * Authors write examples against `@marko-ui/shadcn/ui/…` (the in-repo alias,
 * so the demo compiles in this workspace) and the usage import against the
 * copy path's `@/components/ui/…`. Both are normalized here so one project
 * never sees a mixture.
 */
export function applyImportStyle(source: string, style: ImportStyle): string {
  if (style.kind === "import") {
    // Leave `@marko-ui/shadcn/ui/…` alone; only the copy-path usage import
    // has to move onto the package.
    return source.replace(
      /(["'])@\/components\/ui\//g,
      `$1${IMPORT_PACKAGE_UI}/`,
    );
  }
  // Copy: BOTH authored spellings move onto the project's alias, so the
  // snippet's imports and the usage import agree — with each other and with
  // what `marko-ui add` actually writes.
  const alias = style.uiAlias.replace(/\/$/, "");
  return source
    .replace(/(["'])@marko-ui\/shadcn\/ui\//g, `$1${alias}/`)
    .replace(/(["'])@\/components\/ui\//g, `$1${alias}/`);
}

/** The examples the default output prints: hero first, then essentials. */
function selectExamples(
  docs: ComponentDocs,
  selection: ExampleSelection,
  limit: number,
  charBudget: number,
): { shown: ComponentDocs["examples"]; hidden: ComponentDocs["examples"] } {
  if (Array.isArray(selection)) {
    const wanted = new Set(selection);
    const chosen = docs.examples.filter((example) => wanted.has(example.id));
    const rest = docs.examples.filter((example) => !wanted.has(example.id));
    return { shown: chosen, hidden: rest };
  }
  if (selection === "all") return { shown: docs.examples, hidden: [] };
  // "essential": the first example is the page's hero and is always shown,
  // then essentials until the limit OR the character budget runs out.
  const hero = docs.examples[0];
  const shown = hero ? [hero] : [];
  let chars = hero ? hero.source.length : 0;
  for (const example of docs.examples.slice(1)) {
    if (shown.length >= limit) break;
    if (!example.essential) continue;
    if (chars + example.source.length > charBudget) break;
    shown.push(example);
    chars += example.source.length;
  }
  const shownIds = new Set(shown.map((example) => example.id));
  return { shown, hidden: docs.examples.filter((example) => !shownIds.has(example.id)) };
}

/**
 * Renders a ComponentDocs model as markdown.
 *
 * `selection` picks which examples appear; everything else about the output is
 * derived. Sections with nothing to say are omitted entirely — an empty
 * "Events" heading is noise an agent has to read past.
 */
export function renderComponentDocs(
  docs: ComponentDocs,
  selection: ExampleSelection = "essential",
  options: RenderOptions = {},
): string {
  const limit = options.exampleLimit ?? DEFAULT_EXAMPLE_LIMIT;
  const style = options.importStyle ?? DEFAULT_IMPORT_STYLE;
  const sections: string[] = [];

  sections.push(`# ${docs.title}`, "", docs.description, "");

  const usageBlock = [docs.importSnippet, docs.usageSnippet]
    .filter((value) => value.trim().length > 0)
    .map((value) => applyImportStyle(value.trim(), style))
    .join("\n\n");

  sections.push(
    "## Install",
    "",
    "```bash",
    docs.installCommand,
    "```",
    "",
    "## Usage",
    "",
    "Tags are auto-registered; these imports are the optional explicit form.",
    "",
    "```marko",
    // One well-formed fenced block: every import first, then a blank line,
    // then the snippet. The previous branch printed a bare `<Button>` line
    // OUTSIDE any fence (which markdown swallows as HTML) and put the import
    // after the block.
    ...[usageBlock],
    "```",
    "",
  );

  if (docs.usageTags) {
    sections.push(`Available tags: ${docs.usageTags}`, "");
  }

  if (docs.concepts) sections.push("## Concepts", "", docs.concepts, "");

  if (docs.composition) sections.push("## Composition", "", docs.composition, "");

  if (docs.subcomponents?.length) {
    sections.push(
      "## Part files",
      "",
      "Each of these is its own file, with its own props:",
      "",
      ...docs.subcomponents.map((sub) => `\`${sub.name}.marko\``),
      "",
    );
  }

  if (docs.body || docs.parts.length > 0) {
    sections.push("## Parts", "");
    if (docs.body) sections.push(`- ${bodyLine(docs.title, docs.body)}`);
    for (const part of docs.parts) sections.push(`- ${partLine(part)}`);
    sections.push("");
  }

  if (docs.props.length > 0) {
    sections.push("## Props", "");
    if (docs.props.some((prop) => prop.fixed !== undefined)) {
      sections.push(
        "`fixed` means the component sets that value itself — a value you pass is ignored.",
        "",
      );
    }
    for (const prop of docs.props) sections.push(`- ${propLine(prop)}`);
    if (docs.nativeAttributes) {
      sections.push("", `Also accepts every \`<${docs.nativeAttributes}>\` attribute.`);
    }
    sections.push("");
  }

  // A compound component's sub-parts keep their own prop lists, under the
  // root's, so nothing is lost to the compaction. `####`, not `###`: they are
  // nested under Props, and at the same level they read as examples.
  for (const sub of docs.subcomponents ?? []) {
    if (sub.props.length === 0 && (sub.parts?.length ?? 0) === 0) continue;
    sections.push(`#### \`${sub.name}\``, "");
    for (const part of sub.parts ?? []) sections.push(`- ${partLine(part)}`);
    for (const prop of sub.props) sections.push(`- ${propLine(prop)}`);
    if (sub.nativeAttributes) {
      sections.push("", `Also accepts every \`<${sub.nativeAttributes}>\` attribute.`);
    }
    sections.push("");
  }

  if (docs.events.length > 0) {
    sections.push("## Events", "");
    for (const event of docs.events) {
      const arg = event.arg ? `(${event.arg})` : "()";
      const description = event.description ? ` — ${oneLine(event.description)}` : "";
      sections.push(`- ${event.name}${arg}${description}`);
    }
    sections.push("");
  }

  if (docs.keyboard.length > 0) {
    sections.push("## Keyboard", "");
    for (const entry of docs.keyboard) {
      sections.push(`- \`${entry.keys}\` — ${oneLine(entry.description)}`);
    }
    sections.push("");
  }

  if (docs.accessibilityNotes.length > 0) {
    sections.push("## Accessibility", "");
    for (const note of docs.accessibilityNotes) sections.push(`- ${oneLine(note)}`);
    sections.push("");
  }

  const { shown, hidden } = selectExamples(
    docs,
    selection,
    limit,
    options.exampleCharBudget ?? DEFAULT_EXAMPLE_CHAR_BUDGET,
  );

  if (shown.length > 0) {
    sections.push("## Examples", "");
    for (const example of shown) {
      sections.push(`### ${example.title}`, "");
      if (example.description) sections.push(example.description, "");
      sections.push("```marko", applyImportStyle(example.source, style), "```", "");
    }
  }

  if (hidden.length > 0) {
    const custom = options.moreExamplesCommand;
    const command = custom ?? `marko-ui docs ${docs.name}`;
    const all = command.includes("--example")
      ? command
      : `${command} ${hidden.length > 1 ? "--examples" : `--example ${hidden[0]?.id}`}`;
    sections.push(
      "## More examples",
      "",
      // EVERY id, not a truncated list: an agent that wants one specific
      // example needs its id, and ids are short. The previous branch capped
      // the list at ten and then printed "…and 6 more", which is unusable
      // with `--example <id>`.
      ...hidden.map((example) => `- \`${example.id}\` — ${example.title}`),
      "",
      // The single-example command is CLI-specific, so it is only offered when
      // the command IS the CLI: the docs site passes its own phrasing and a
      // human reading the page must not be sent to a command they cannot run.
      custom
        ? `Print them all: \`${all}\`.`
        : `Print them all: \`${all}\`. Print one: \`marko-ui docs ${docs.name} --example <id>\`.`,
      "",
    );
  }

  // Collapse the runs of blank lines the section joins leave behind.
  return `${sections.join("\n").replace(/\n{3,}/g, "\n\n").trimEnd()}\n`;
}

export { DEFAULT_EXAMPLE_CHAR_BUDGET, DEFAULT_EXAMPLE_LIMIT } from "./types";
export type {
  ComponentDocs,
  EventDoc,
  ExampleDoc,
  ExampleSelection,
  ImportStyle,
  PartDoc,
  PropDoc,
} from "./types";