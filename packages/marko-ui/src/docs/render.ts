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
import {
  DEFAULT_EXAMPLE_CHAR_BUDGET,
  DEFAULT_EXAMPLE_LIMIT,
  type ComponentDocs,
  type ExampleSelection,
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
   * `marko-ui docs <name> --examples`; the docs site passes its own phrasing
   * so a human reading the page is not sent to a CLI they may not have.
   */
  moreExamplesCommand?: string;
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

/** `boolean | undefined` → `boolean`; `((details: X) => void) | undefined` → `X`. */
function handlerArg(type: string): string | undefined {
  const cleaned = stripUndefined(type).trim();
  // `(value: string[]) => void` (a component's own sugar prop) and
  // `((details: X) => void) | undefined` (a Zag machine prop) both occur.
  const match = /^\(+\s*\w+\s*:\s*([^)]*)\)\s*=>\s*void\)?$/.exec(cleaned);
  return match?.[1]?.trim() || undefined;
}

/** The default/fixed suffix, or "" when neither is recorded. */
function valueSuffix(prop: { default?: string; fixed?: string | true }): string {
  if (prop.fixed !== undefined) {
    return prop.fixed === true ? " = fixed" : ` = fixed ${prop.fixed}`;
  }
  return prop.default ? ` = ${prop.default}` : "";
}

/** One prop line: `name: type = default — description`. */
function propLine(prop: ComponentDocs["props"][number]): string {
  const name = prop.required ? `${prop.name} (required)` : prop.name;
  const suffix = valueSuffix(prop);
  const description = prop.description ? ` — ${oneLine(prop.description)}` : "";
  return `${name}: ${stripUndefined(prop.type)}${suffix}${description}`;
}

function partLine(part: ComponentDocs["parts"][number]): string {
  const tag = part.param ? `<@${part.name}|${part.param}|>` : `<@${part.name}>`;
  const repeatable = part.repeatable ? " (repeatable)" : "";
  const description = part.description ? ` — ${oneLine(part.description)}` : "";
  return `${tag}${repeatable}${description}`;
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

/** How many entries the "More examples" list prints before counting the rest. */
const MORE_EXAMPLES_LIST_LIMIT = 10;

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
  const sections: string[] = [];

  sections.push(`# ${docs.title}`, "", docs.description, "");

  sections.push(
    "## Install",
    "",
    "```bash",
    docs.installCommand,
    "```",
    "",
    "## Usage",
    "",
    docs.usageTags,
    "",
    "```marko",
    docs.usageSnippet,
    "```",
    "",
    docs.importSnippet,
    "",
  );

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

  if (docs.parts.length > 0) {
    sections.push("## Parts", "");
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
    if (sub.props.length === 0) continue;
    sections.push(`#### \`${sub.name}\``, "");
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
      sections.push("```marko", example.source, "```", "");
    }
  }

  if (hidden.length > 0) {
    const command = options.moreExamplesCommand ?? `marko-ui docs ${docs.name}`;
    const all = command.includes("--example")
      ? command
      : `${command} ${hidden.length > 1 ? "--examples" : `--example ${hidden[0]?.id}`}`;
    // The list is capped: a 26-example component would otherwise spend a
    // kilobyte of a 12k budget restating titles the reader did not ask for.
    // `--examples` still prints all of them.
    const listed = hidden.slice(0, MORE_EXAMPLES_LIST_LIMIT);
    sections.push(
      "## More examples",
      "",
      ...listed.map((example) => `- \`${example.id}\` — ${example.title}`),
      ...(hidden.length > listed.length
        ? [`- …and ${hidden.length - listed.length} more.`]
        : []),
      "",
      `Print any of them: \`${all}\`.`,
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
  PartDoc,
  PropDoc,
} from "./types";