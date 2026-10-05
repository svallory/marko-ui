// Builds the ComponentDocs model from raw inputs: the EVALUATED docs.ts
// entry, demo sources, the extracted API data and the component's own source.
// Pure — no I/O, no imports outside this package — so the registry build can
// call it for all 86 components without pulling the docs site into its module
// graph, and the docs site imports this same function.
//
// ONE builder. The registry build and the docs site both call it with the
// same three inputs (docs.ts export, demo sources, api-reference entry); the
// previous branch had two builders and they disagreed — the registry's parsed
// `docs.ts` as text and shipped unevaluated `${...}`, literal `\n` and
// truncated sentences to the CLI. `tooling/__tests__/docs-parity.test.ts`
// asserts the two answers are byte-identical.
import type {
  BodyDoc,
  ComponentDocs,
  PartDoc,
  PropDoc,
  SubcomponentDoc,
} from "./types";
import { stripMarkoComments } from "./strip-comments";

/** One property, as the API data carries it. */
export interface ApiProp {
  name: string;
  type: string;
  required: boolean;
  description?: string;
  default?: string;
  fixed?: string | true;
}

/** One part's properties, as the API data carries them. */
export interface ApiPartLike {
  name: string;
  file?: string;
  nativeAttributes?: string;
  properties: ApiProp[];
}

/** The hand-authored per-example entry (apps/docs/src/demos/docs-types.ts). */
export interface ExampleEntry {
  name: string;
  title: string;
  description?: string;
  essential?: boolean;
}

/** The hand-authored docs entry (apps/docs/src/demos/docs-types.ts). */
export interface DocsEntry {
  description?: string;
  usageTags?: string;
  importSnippet?: string;
  usageSnippet?: string;
  concepts?: string;
  composition?: string;
  requires?: string[];
  accessibilityKeyboard?: { keys: string; description: string }[];
  accessibilityNotes?: string[];
  examples: ExampleEntry[];
}

export interface ComponentDocsInput {
  /** Registry name, e.g. `alert-dialog`. */
  name: string;
  /** Display title; falls back to a title-cased name. */
  title?: string;
  /** Registry description, used when `docs.ts` has none. */
  registryDescription?: string;
  /** The hand-authored `docs.ts` entry, EVALUATED. */
  docs: DocsEntry;
  /** Demo sources by file name without extension, as written in `examples[].name`. */
  demos: Record<string, { source: string }>;
  /** Extracted API data. */
  parts: ApiPartLike[];
  /** The install line the reader should run. */
  installCommand: string;
  /** The install line an `import`-distribution project needs instead of `add`. */
  importInstallCommand?: string;
  /**
   * The component's own `.marko` sources, concatenated.
   *
   * Needed for facts no other input carries: whether an attr-tag is iterated
   * (`[...(input.item ?? [])]` / `<for|…| of=input.item>` makes a part
   * repeatable), what an `Marko.AttrTag<T>` type declares (the part's own
   * attributes), the shape of the item/entry interfaces an `items=` prop
   * takes, and which part files the component renders ITSELF (internal, not
   * composable by a caller).
   */
  componentSource?: string;
  /** Part file names, without extension (e.g. `["trigger", "submenu"]`). */
  partFiles?: string[];
}

/**
 * An object shape a caller has to BUILD to use a prop, e.g. `items=`.
 *
 * Without it, `items: DropdownMenuItem[]` documents nothing an agent can act
 * on: the fields that make a checkbox item a checkbox item (`type`,
 * `checked`, `radioGroup`) live in an interface, not on the prop line.
 */
export interface ItemTypeDoc {
  /** The prop that takes it, e.g. `items`. */
  prop: string;
  /** The interface name as declared, e.g. `DropdownMenuItem`. */
  typeName: string;
  /** Its fields, in declaration order. */
  fields: PropDoc[];
}

/** `alert-dialog` → `Alert Dialog`. */
function titleize(name: string): string {
  return name
    .split("-")
    .map((segment) => segment.charAt(0).toUpperCase() + segment.slice(1))
    .join(" ");
}

/** `chart-bar` → `ChartBar`; the same rule `collectProjectTags` uses. */
export function pascalCase(name: string): string {
  return name
    .split(/[-_]/)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join("");
}

/** `button-rtl` → `button-rtl`; stable ids are the `--example` selector. */
export function slugify(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

// ---------------------------------------------------------------------------
// Type-shape predicates
// ---------------------------------------------------------------------------

/** `Marko.Body<…>` — the tag's own (default) body. */
function isBodyType(type: string): boolean {
  return /^Marko\.Body\b/.test(type.trim());
}

/** `Marko.AttrTag<…>` — a real attr-tag, e.g. `<@trigger>`. */
function isAttrTagType(type: string): boolean {
  return type.includes("AttrTag");
}

/** The body parameter's type, when the body takes one. */
function partParam(type: string): string | undefined {
  // `Marko.AttrTag<{ content: Marko.Body<[Record<string, unknown>]>; }>` and
  // the bare `Marko.Body<[AccordionItem], void>` both name the tuple's only
  // entry; an empty tuple or a bare `Body` means no parameter.
  const tuple = /Marko\.Body<\s*\[([^\]]*)\]/.exec(type);
  const inner = tuple?.[1]?.trim();
  if (!inner) return undefined;
  if (/^void$|^$/.test(inner)) return undefined;
  return inner.replace(/;$/, "").trim();
}

/** The inner type of `Marko.AttrTag<T>`: an interface name, or an inline object. */
function attrTagInnerType(type: string): string | undefined {
  const match = /AttrTag<\s*([\s\S]*?)\s*>\s*$/.exec(type.trim());
  const inner = match?.[1]?.trim();
  return inner && inner.length > 0 ? inner : undefined;
}

/** A callback prop's argument type, or undefined when it is not a callback. */
function handlerArg(type: string): string | undefined {
  const cleaned = type.replace(/\s*\|\s*undefined\b/g, "").replace(/\s*\|\s*null\b/g, "").trim();
  // `(value: string[]) => void` — a component's own sugar prop — and
  // `((details: X) => void) | undefined` — a Zag machine prop — both occur.
  const match = /^\(+\s*\w+\s*:\s*([^)]*)\)\s*=>\s*void\)?$/.exec(cleaned);
  return match?.[1]?.trim() || undefined;
}

/**
 * An event is a prop that IS a callback — nothing else.
 *
 * Naming is not enough: combobox's `openOnChange: boolean | ((details) =>
 * boolean) | undefined` ends in `Change` but is a boolean-or-predicate prop,
 * and printing it as an event sends an agent looking for a handler.
 */
function isHandlerType(type: string): boolean {
  const cleaned = type
    .replace(/\s*\|\s*undefined\b/g, "")
    .replace(/\s*\|\s*null\b/g, "")
    .trim();
  return (
    /^\(+\s*\w+\s*:\s*[^)]*\)\s*=>\s*void\)?$/.test(cleaned) ||
    /^\(\s*\)\s*=>\s*void$/.test(cleaned)
  );
}

function isEventName(name: string): boolean {
  return /^on[A-Z]/.test(name) || /Change$/.test(name);
}

// ---------------------------------------------------------------------------
// Reading the component's own source
// ---------------------------------------------------------------------------

/**
 * Fields of `interface T { … }` / `export interface T { … }` in the component
 * source, as `{ name, type, required }`.
 *
 * Deliberately a brace-matched block scan and not a TS parser: this resolves
 * one hand-written shape (one declaration per line, no nested objects) whose
 * only job is to name a part's attributes in the output. A field the scan
 * cannot read is simply absent, and the part prints without it.
 */
export function readInterfaceFields(
  source: string,
  interfaceName: string,
  seen: Set<string> = new Set(),
): { name: string; type: string; required: boolean }[] {
  if (seen.has(interfaceName)) return [];
  seen.add(interfaceName);
  const declaration = new RegExp(
    `(?:^|\\n)\\s*(?:export\\s+)?interface\\s+${interfaceName}\\s*(?:extends\\s+([^{]+?))?\\s*\\{`,
  ).exec(source);
  if (!declaration) return [];
  // `extends` comes FIRST in TypeScript, so a derived interface's own fields
  // do not exist without them: `DropdownMenuItemAttrs extends DropdownMenuItem`
  // is where `<@item>`'s `type`/`checked`/`radioGroup` actually live, and
  // reading only the derived body printed an attribute-less part.
  const inherited = (declaration[1] ?? "")
    .split(",")
    .map((name) => name.trim())
    .filter((name) => /^[A-Za-z_$][\w$]*$/.test(name))
    .flatMap((name) => readInterfaceFields(source, name, seen));
  const start = declaration.index + declaration[0].length;
  let depth = 1;
  let end = start;
  while (end < source.length && depth > 0) {
    const char = source[end];
    if (char === "{") depth += 1;
    else if (char === "}") depth -= 1;
    end += 1;
  }
  const body = source.slice(start, end - 1);

  const fields: { name: string; type: string; required: boolean }[] = [];
  for (const rawLine of body.split("\n")) {
    const line = rawLine.replace(/\/\/.*$/, "").trim();
    if (!line || line.startsWith("*") || line.startsWith("/*")) continue;
    const field = /^([A-Za-z_$][\w$]*|\[[^\]]+\])\s*(\?)?\s*:\s*(.+)$/.exec(line);
    if (!field) continue;
    fields.push({
      name: field[1] as string,
      type: (field[3] as string).replace(/;\s*$/, "").trim(),
      required: !field[2],
    });
  }
  const own = new Set(fields.map((field) => field.name));
  return [...inherited.filter((field) => !own.has(field.name)), ...fields];
}

/**
 * True when the ROOT component renders this part file itself.
 *
 * `dropdown-menu.marko` renders `<${submenu} parent=… parentApi=…/>` for a
 * `type: "sub"` entry. Those props are machine plumbing a caller cannot
 * supply, so documenting `submenu.marko` as a usable part teaches markup that
 * does not compile: an internal part is not part of the public API.
 */
function rendersPartItself(source: string, partFileName: string): boolean {
  // BOTH halves are required. The import tells us the component depends on the
  // part file and under which binding; the render tells us it uses that binding
  // itself. Matching on the tag name alone is not enough — `chart`'s sources
  // contain inline-SVG `<line>` elements, which would hide `chart/line.marko`
  // (`<ChartLine>`) if the file name alone were matched.
  const imported = new RegExp(
    `import\\s+([A-Z][\\w$]*)\\s+from\\s+["'][^"']*/${partFileName}\\.marko["']`,
  ).exec(source);
  if (!imported) return false;
  return new RegExp(`<${imported[1]}[\\s/>]`).test(source);
}

/**
 * True when the component ITERATES an attr-tag, which is what makes a part
 * repeatable: `[...(input.item ?? [])]` (tabs, accordion, select,
 * dropdown-menu) or `<for|…| of=input.item>`.
 *
 * Decided from the component's source, not from the API type: every
 * `Marko.AttrTag<T>` is iterable by construction in Marko, so the type says
 * nothing. What distinguishes `<@item>` (written once per row) from `<@title>`
 * (invoked once) is whether the component loops over it. A part neither
 * spreads nor loops is printed without `(repeatable)` — the honest answer for
 * a single-invocation tag.
 */
function iteratesAttrTag(source: string, attrTagName: string): boolean {
  const escaped = attrTagName.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return new RegExp(
    `(?:\\.\\.\\.\\(\\s*input\\.${escaped}\\b)|(?:of=\\s*input\\.${escaped}\\b)`,
  ).test(source);
}

/** A part's own attributes, or `undefined` when its type declares none. */
function partAttributes(
  innerType: string | undefined,
  source: string,
): PropDoc[] | undefined {
  if (!innerType) return undefined;
  // `Marko.AttrTag<{ content: Marko.Body<…> }>` — the single-invocation form,
  // which declares no attributes of its own.
  if (!/^[A-Za-z_$][\w$]*$/.test(innerType)) return undefined;
  const fields = readInterfaceFields(source, innerType).filter(
    // `content` on an AttrTag IS the part's body, already covered by `param`.
    (field) => !isBodyType(field.type),
  );
  if (fields.length === 0) return undefined;
  return fields.map((field) => ({
    name: field.name,
    type: field.type,
    required: field.required,
  }));
}

function toPropDoc(property: ApiProp): PropDoc {
  const prop: PropDoc = {
    name: property.name,
    type: property.type,
    required: property.required,
  };
  if (property.default !== undefined) prop.default = property.default;
  if (property.fixed !== undefined) prop.fixed = property.fixed;
  if (property.description) prop.description = property.description;
  return prop;
}

/** Everything one property list contributes to the model. */
interface Partitioned {
  body?: BodyDoc;
  parts: PartDoc[];
  props: PropDoc[];
  events: ComponentDocs["events"];
}

function partition(properties: ApiProp[], source: string): Partitioned {
  const result: Partitioned = { parts: [], props: [], events: [] };
  for (const property of properties) {
    const type = property.type ?? "";
    if (isBodyType(type)) {
      // The tag's default body, NOT a part: `<@content>` is not markup.
      const body: BodyDoc = {};
      const param = partParam(type);
      if (param) body.param = param;
      if (property.description) body.description = property.description;
      result.body = body;
      continue;
    }
    if (isAttrTagType(type)) {
      const part: PartDoc = { name: property.name };
      const param = partParam(type);
      if (param) part.param = param;
      const attributes = partAttributes(attrTagInnerType(type), source);
      if (attributes) part.attributes = attributes;
      if (iteratesAttrTag(source, property.name)) part.repeatable = true;
      if (property.description) part.description = property.description;
      result.parts.push(part);
      continue;
    }
    if (isEventName(property.name) && isHandlerType(type)) {
      const event: ComponentDocs["events"][number] = { name: property.name };
      const arg = handlerArg(type);
      if (arg) event.arg = arg;
      if (property.description) event.description = property.description;
      result.events.push(event);
      continue;
    }
    result.props.push(toPropDoc(property));
  }
  return result;
}

/**
 * Builds the model.
 *
 * Parts, the body and events are lifted out of the props: an attr-tag printed
 * as `Marko.Body<[Foo]>` tells an agent nothing about the markup to write, the
 * body printed as `<@content>` is markup that does not compile, and a change
 * handler buried in an alphabetical prop list is one an agent skims past.
 * They all stay in the API data — only the docs view changes.
 */
export function buildComponentDocs(input: ComponentDocsInput): ComponentDocs {
  const { name, docs, demos, parts } = input;
  const root = parts.find((part) => part.name === name) ?? parts[0];
  const source = input.componentSource ?? "";

  const split = partition(root?.properties ?? [], source);

  const subcomponents: SubcomponentDoc[] = parts
    .filter((part) => part.name !== root?.name)
    .filter((part) => part.name !== name && !rendersPartItself(source, part.name))
    .map((part) => {
      const nested = partition(part.properties, source);
      const sub: SubcomponentDoc = { name: part.name, props: nested.props };
      if (nested.parts.length > 0) sub.parts = nested.parts;
      if (nested.body) sub.body = nested.body;
      if (part.nativeAttributes) sub.nativeAttributes = part.nativeAttributes;
      return sub;
    });

  // `items: DropdownMenuItem[]` documents nothing an agent can build. Every
  // prop whose type is an array of a locally-declared interface gets that
  // interface's fields, so `items=` shows the entry shape.
  const itemTypes: ItemTypeDoc[] = [];
  for (const group of [split.props, ...subcomponents.map((sub) => sub.props)]) {
    for (const prop of group) {
      const match = /^([A-Z][\w$]*(?:Item|Entry|Group|Data|Option|Data)?)\[\]$/.exec(
        (prop.type ?? "").replace(/\s*\|\s*undefined\b/g, "").trim(),
      );
      const typeName = match?.[1];
      if (!typeName) continue;
      if (itemTypes.some((item) => item.prop === prop.name)) continue;
      const fields = readInterfaceFields(source, typeName).filter(
        (field) => !isBodyType(field.type),
      );
      if (fields.length === 0) continue;
      itemTypes.push({
        prop: prop.name,
        typeName,
        fields: fields.map((field) => ({
          name: field.name,
          type: field.type,
          required: field.required,
        })),
      });
    }
  }

  const examples = docs.examples
    .map((example) => {
      const demo = demos[example.name];
      // A docs.ts naming a demo file that does not exist would silently drop a
      // documented example; the manifest generator is what should catch it.
      if (!demo) return undefined;
      const entry: ComponentDocs["examples"][number] = {
        id: slugify(example.name),
        title: example.title,
        // Comments are for the next maintainer of the demo file, not for the
        // reader of this output — and the reader of this output is an agent.
        source: stripMarkoComments(demo.source),
      };
      if (example.description) entry.description = example.description;
      if (example.essential) entry.essential = true;
      return entry;
    })
    .filter((example): example is ComponentDocs["examples"][number] => example !== undefined);

  const model: ComponentDocs = {
    name,
    title: input.title || titleize(name),
    // `||`, not `??`: the docs site falls back to the registry description for
    // an EMPTY docs.description too, and the two answers must match.
    description: docs.description || input.registryDescription || "",
    installCommand: input.installCommand,
    usageTags: docs.usageTags ?? "",
    importSnippet: docs.importSnippet ?? "",
    usageSnippet: docs.usageSnippet ?? "",
    // Filled below from the component's part files; declared here so the
    // literal satisfies the model even for a component with no parts.
    tags: [],
    parts: split.parts,
    props: split.props,
    events: split.events,
    keyboard: docs.accessibilityKeyboard ?? [],
    accessibilityNotes: docs.accessibilityNotes ?? [],
    examples,
  };
  if (input.importInstallCommand) model.importInstallCommand = input.importInstallCommand;
  if (docs.requires?.length) model.requires = [...docs.requires];
  if (split.body) model.body = split.body;
  if (root?.nativeAttributes) model.nativeAttributes = root.nativeAttributes;
  if (subcomponents.length > 0) model.subcomponents = subcomponents;
  if (itemTypes.length > 0) model.itemTypes = itemTypes;
  // The taglib names `add` registers for this component: the root plus every
  // PUBLIC part file, PascalCased from `<dir>[-<file>]` exactly as
  // `collectProjectTags` does (`chart/bar.marko` → `ChartBar`, NOT the
  // import binding `BarChart`).
  const partFiles = input.partFiles ?? parts.map((part) => part.name);
  const tagFiles = partFiles.filter(
    // The ROOT file is never "internal" — and it must be excluded from the
    // check, because `select`'s own source contains `<select>` elements and
    // would otherwise be mistaken for a self-rendered part.
    (file) => file === name || !rendersPartItself(source, file),
  );
  // The SAME rule `collectProjectTags` applies: a file named after its own
  // directory IS the root tag (`dropdown-menu/dropdown-menu.marko` →
  // `DropdownMenu`), not `<dir>-<file>`. Root first, then parts in name order.
  model.tags = [
    ...(tagFiles.includes(name) ? [pascalCase(name)] : []),
    ...tagFiles
      .filter((file) => file !== name)
      .sort()
      .map((file) => pascalCase(`${name}-${file}`)),
  ];
  if (docs.concepts) model.concepts = docs.concepts;
  if (docs.composition) model.composition = docs.composition;
  return model;
}