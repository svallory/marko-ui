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
  type EventDoc,
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
  /**
   * The component is installed in the project the output is for (copy: its
   * files are on disk; import: the package that carries it is installed), so
   * the Install section is omitted. A component that is NOT installed keeps
   * the exact install command.
   */
  installed?: boolean;
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

/** `openChange(OpenChangeDetails) — description`. */
function eventLine(event: EventDoc): string {
  const arg = event.arg ? `(${event.arg})` : "()";
  const description = event.description ? ` — ${oneLine(event.description)}` : "";
  return `${event.name}${arg}${description}`;
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
 * whether it may be written more than once. A part whose type is a union
 * (`<@entry>`: a link OR a menu) lists each member's attributes on its own
 * nested line, so it is clear which fields go together.
 */
function partLine(part: PartDoc): string {
  const tag = part.param ? `<@${part.name}|${part.param}|>` : `<@${part.name}>`;
  const details = [part.description && oneLine(part.description), attributeList(part)];
  if (part.repeatable) details.push("repeatable");
  if (part.variants?.length) details.push("one of");
  const rendered = details.filter(Boolean).join("; ");
  const line = rendered ? `${tag} — ${rendered}` : tag;
  const variants = (part.variants ?? []).map(
    (variant) =>
      `\n  - \`${variant.typeName}\` — ${attributeList({ name: part.name, attributes: variant.attributes })}`,
  );
  return `${line}${variants.join("")}`;
}

/** `alert-dialog` → `AlertDialog`: the root tag `collectProjectTags` registers. */
function rootTagName(name: string): string {
  return name
    .split(/[-_]/)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join("");
}

/**
 * `<ContextMenu|string|>` — the tag's default body, which is NOT an attr-tag.
 * The TAG name, never the title: `<Context Menu>` is not markup.
 */
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

/** `import X from "…"` lines: the binding and the path. */
function defaultImports(block: string): { binding: string; path: string }[] {
  return [...block.matchAll(/^import\s+([A-Za-z_$][\w$]*)\s+from\s+["']([^"']+)["']/gm)].map(
    (match) => ({ binding: match[1] as string, path: match[2] as string }),
  );
}

/**
 * The name `collectProjectTags` registers for the template at
 * `…/<dir>/<file>.marko`: `<dir>` when the file is named after its directory,
 * otherwise `<dir>-<file>` — PascalCased.
 */
function registeredNameFor(path: string): string | undefined {
  const match = /\/([a-z0-9-]+)\/([a-z0-9-]+)\.marko$/.exec(path);
  if (!match) return undefined;
  const [, dir, file] = match as unknown as [string, string, string];
  return rootTagName(dir === file ? dir : `${dir}-${file}`);
}

/** True when the markup uses `<Tag` (opening or self-closing). */
function usesTag(markup: string, tag: string): boolean {
  return new RegExp(`(?<![\\w.])<${tag}\\b`).test(markup);
}

/**
 * The Usage block for one import style, and what is TRUE about its imports.
 *
 * A component named in `requires` is imported here too when the snippet uses
 * its root tag: under `import` nothing is registered, so a `<Button>` without
 * an import line is an unknown tag; under `copy` the line is the explicit form
 * of what `add button` registers.
 */
export function resolveUsage(
  docs: ComponentDocs,
  style: ImportStyle,
): { block: string; importsOptional: boolean; unregistered: string[] } {
  const snippet = docs.usageSnippet.trim();
  const authored = docs.importSnippet.trim();
  const bound = new Set(defaultImports(authored).map((entry) => entry.binding));
  const extra = (docs.requires ?? [])
    .map((name) => ({ name, binding: rootTagName(name) }))
    .filter(({ binding }) => !bound.has(binding) && usesTag(snippet, binding))
    .map(({ name, binding }) => `import ${binding} from "@/components/ui/${name}/${name}.marko";`);
  const imports = [authored, ...extra].filter((value) => value.length > 0).join("\n");
  const block = [imports, snippet]
    .filter((value) => value.length > 0)
    .map((value) => applyImportStyle(value, style))
    .join("\n\n");
  const unregistered = defaultImports(imports)
    .filter((entry) => entry.path.endsWith(".marko"))
    .filter((entry) => registeredNameFor(entry.path) !== entry.binding)
    .map((entry) => entry.binding);
  return { block, importsOptional: unregistered.length === 0, unregistered };
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
  // "essential": ESSENTIALS ARE MANDATORY. The previous branch walked the
  // examples in order, took the hero first, and `break`-ed on the character
  // budget — so a hero larger than the budget (message-scroller's is 7,516
  // against 7,000) pushed BOTH essentials out and the `break` also discarded
  // any later, smaller one. The hero is now the one that yields.
  // ESSENTIALS FIRST, and they are what the budget is spent on. The hero used
  // to be taken unconditionally with the essentials appended under it, so a
  // hero that consumed the whole budget (message-scroller's 170-line demo)
  // pushed BOTH of its essentials out — the default answer had none of the
  // examples worth reading. The hero still prints whenever an essential leaves
  // room for it, which is the normal case.
  const hero = docs.examples[0];
  const shown: ComponentDocs["examples"] = [];
  let chars = 0;
  // The budget does NOT apply to an essential. An essential is a demo someone
  // decided an agent cannot do without; a budget that can drop one makes the
  // flag a lie. The budget governs the HERO and nothing else.
  for (const example of docs.examples) {
    if (!example.essential || shown.length >= limit) continue;
    shown.push(example);
    chars += example.source.length;
  }
  if (hero && !shown.includes(hero) && shown.length < limit) {
    if (chars + hero.source.length <= charBudget) {
      shown.push(hero);
      chars += hero.source.length;
    }
  }
  // Back into page order so the reader meets the component's own entry point
  // first, which is also what a page's hero does.
  const chosen = docs.examples.filter((example) => shown.includes(example));
  const shownIds = new Set(chosen.map((example) => example.id));
  return { shown: chosen, hidden: docs.examples.filter((example) => !shownIds.has(example.id)) };
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

  const isCopy = style.kind === "copy";
  const usage = resolveUsage(docs, style);
  // The install line has to match the project: `marko-ui add` REFUSES to run
  // under the `import` distribution (assertAddableDistribution), so telling
  // such a project to `add` is an instruction that fails.
  const installCommand = isCopy
    ? docs.installCommand
    : (docs.importInstallCommand ?? `bun add @marko-ui/shadcn`);

  // An INSTALLED component needs no install line: telling an agent to add
  // what is already on disk is noise at best and an `--overwrite` at worst.
  // Under `import` the Usage block's import lines are the whole story.
  if (!options.installed) {
    sections.push(
      "## Install",
      "",
      "```bash",
      installCommand,
      "```",
      "",
    );
  }

  // A snippet that uses ANOTHER component says so, with the exact command.
  // `add item` does not bring `button` with it, and a snippet that silently
  // depends on something the reader has not installed is the fastest way to
  // an unresolved tag. Copy only: under `import` the dependency is the
  // package, already installed by the line above.
  if (isCopy && docs.requires?.length) {
    sections.push(
      `The Usage snippet also needs ${docs.requires.map((name) => `\`${name}\``).join(", ")}, which \`add ${docs.name}\` does not install:`,
      "",
      "```bash",
      `bunx marko-ui add ${docs.requires.join(" ")} -y`,
      "```",
      "",
    );
  }

  sections.push(
    "## Usage",
    "",
    // The sentence is the whole difference between the two styles, and it has
    // to be TRUE in each:
    // - copy: `add`/`init` writes a `marko.json` registering each template
    //   under a name derived from its path, so an import is optional ONLY
    //   when it binds that same name. `field-label.marko` registers as
    //   `FieldFieldLabel` and `input.marko` as `Input`, so a snippet written
    //   with `<FieldLabel>`/`<TextInput>` needs its imports.
    // - import: NOTHING is registered (`packages/shadcn/marko.json` declares
    //   no tags and `add` does not run), so every tag is imported and the
    //   import is required.
    isCopy
      ? usage.importsOptional
        ? "This project registers the tags below automatically — the import lines are the optional explicit form."
        : `Keep the import lines: ${usage.unregistered.map((tag) => `\`<${tag}>\``).join(", ")} ${usage.unregistered.length === 1 ? "is an import binding" : "are import bindings"}, not ${usage.unregistered.length === 1 ? "a registered tag name" : "registered tag names"}.`
      : "Nothing is auto-registered in an `import` project: import every tag you use.",
    "",
    "```marko",
    // One well-formed fenced block: every import first, then a blank line,
    // then the snippet.
    usage.block,
    "```",
    "",
  );

  // Copy only: an `import` project registers nothing, so a "registered tags"
  // line there would contradict the sentence above it.
  // `?.` because a registry item built before this field existed has none;
  // the CLI must still render it rather than throw.
  if (isCopy && docs.tags?.length) {
    sections.push(
      `Registered tags: ${docs.tags.map((tag) => `<${tag}>`).join(", ")}`,
      "",
    );
  }

  if (docs.concepts) sections.push("## Concepts", "", docs.concepts, "");

  if (docs.composition) sections.push("## Composition", "", docs.composition, "");

  if (docs.body || docs.parts.length > 0) {
    sections.push("## Parts", "");
    if (docs.body) sections.push(`- ${bodyLine(rootTagName(docs.name), docs.body)}`);
    for (const part of docs.parts) sections.push(`- ${partLine(part)}`);
    sections.push("");
  }

  const subcomponents = (docs.subcomponents ?? []).filter(
    (sub) => sub.props.length > 0 || (sub.parts?.length ?? 0) > 0 || (sub.events?.length ?? 0) > 0,
  );
  const itemTypes = docs.itemTypes ?? [];
  if (docs.props.length > 0 || subcomponents.length > 0 || itemTypes.length > 0) {
    sections.push("## Props", "");
    const fixed = [...docs.props, ...subcomponents.flatMap((sub) => sub.props)].some(
      (prop) => prop.fixed !== undefined,
    );
    if (fixed) {
      sections.push(
        "`fixed` means the component sets that value itself — a value you pass is ignored.",
        "",
      );
    }
    for (const prop of docs.props) sections.push(`- ${propLine(prop)}`);
    if (docs.nativeAttributes && docs.props.length > 0) {
      sections.push("", `Also accepts every \`<${docs.nativeAttributes}>\` attribute.`);
    }
    sections.push("");
  }

  // A compound component's sub-parts keep their own prop lists, under the
  // root's, so nothing is lost to the compaction. `####`, not `###`: they are
  // nested under Props, and at the same level they read as examples.
  for (const sub of subcomponents) {
    sections.push(`#### \`${sub.name}\``, "");
    for (const part of sub.parts ?? []) sections.push(`- ${partLine(part)}`);
    for (const prop of sub.props) sections.push(`- ${propLine(prop)}`);
    for (const event of sub.events ?? []) sections.push(`- ${eventLine(event)}`);
    if (sub.nativeAttributes) {
      sections.push("", `Also accepts every \`<${sub.nativeAttributes}>\` attribute.`);
    }
    sections.push("");
  }

  // `items=`-style props take an object the caller has to BUILD; the prop line
  // names the type but not its fields, which is the difference between a type
  // an agent can read and one it cannot. After the sub-parts, because a
  // sub-part's prop (menubar's `<MenubarMenu items=>`) may be what takes it.
  for (const item of itemTypes) {
    // `items=` for a prop; `NavigationMenuMenuItem.links` for a field of
    // another shape; and, for one member of a union, which union it is.
    const where = item.prop.includes(".") ? `\`${item.prop}\`` : `\`${item.prop}=\``;
    const union = item.unionOf ? `, one kind of \`${item.unionOf}\`` : "";
    sections.push(`### \`${item.typeName}\` (${where}${union})`, "");
    for (const field of item.fields) sections.push(`- ${propLine(field)}`);
    sections.push("");
  }

  if (docs.events.length > 0) {
    sections.push("## Events", "");
    for (const event of docs.events) sections.push(`- ${eventLine(event)}`);
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