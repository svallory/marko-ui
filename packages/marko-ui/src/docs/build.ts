// Builds the ComponentDocs model from raw inputs: the hand-authored docs
// entry, demo sources, and the extracted API data. Pure — no I/O, no imports
// outside this package — so the registry build can call it for all 86
// components without pulling the docs site (or its .marko files) into its own
// module graph. The docs site imports this same function through
// apps/docs/src/lib/component-markdown.ts.
import type { ComponentDocs, PartDoc, PropDoc, SubcomponentDoc } from "./types";
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
  /** The hand-authored `docs.ts` entry. */
  docs: DocsEntry;
  /** Demo sources by file name without extension, as written in `examples[].name`. */
  demos: Record<string, { source: string }>;
  /** Extracted API data. */
  parts: ApiPartLike[];
  /** The install line the reader should run. */
  installCommand: string;
}

/** `alert-dialog` → `Alert Dialog`. */
function titleize(name: string): string {
  return name
    .split("-")
    .map((segment) => segment.charAt(0).toUpperCase() + segment.slice(1))
    .join(" ");
}

/** `button-rtl` → `button-rtl`; stable ids are the `--example` selector. */
export function slugify(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

/** A prop typed as a `Marko.AttrTag<…>` or `Marko.Body<…>` is a part, not a prop. */
function isPartType(type: string): boolean {
  return type.includes("AttrTag") || /^Marko\.Body\b/.test(type);
}

/** The body parameter's type, when the part takes one. */
function partParam(type: string): string | undefined {
  // `Marko.AttrTag<{ content: Marko.Body<[Record<string, unknown>]>; }>` and
  // the bare `Marko.Body<[AccordionItem], void>` both name the tuple's only
  // entry; an empty tuple or a bare `Body` means no parameter.
  const tuple = /Marko\.Body<\s*\[([^\]]*)\]/.exec(type);
  const inner = tuple?.[1]?.trim();
  if (!inner) return undefined;
  const empty = /^void$|^$/.test(inner);
  return empty ? undefined : inner.replace(/;$/, "").trim();
}

/** A part whose type is an array can be written more than once. */
function isRepeatable(type: string): boolean {
  const trimmed = type.replace(/;\s*$/, "").trim();
  return /\[\]\s*$/.test(trimmed);
}

function isEventName(name: string): boolean {
  return /^on[A-Z]/.test(name) || /Change$/.test(name);
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

/** `((details: OpenChangeDetails) => void) | undefined` → `OpenChangeDetails`. */
function handlerArg(type: string): string | undefined {
  const cleaned = type.replace(/\s*\|\s*undefined\b/g, "").trim();
  // `(value: string[]) => void` — a component's own sugar prop — and
  // `((details: X) => void) | undefined` — a Zag machine prop — both occur.
  const match = /^\(+\s*\w+\s*:\s*([^)]*)\)\s*=>\s*void\)?$/.exec(cleaned);
  return match?.[1]?.trim() || undefined;
}

/**
 * Builds the model.
 *
 * Parts and events are lifted out of the props: an attr-tag printed as
 * `Marko.Body<[Foo]>` tells an agent nothing about the markup to write, and a
 * change handler buried in an alphabetical prop list is one an agent skims
 * past. Both stay in the API data — only the docs view changes.
 */
export function buildComponentDocs(input: ComponentDocsInput): ComponentDocs {
  const { name, docs, demos, parts } = input;
  const root = parts.find((part) => part.name === name) ?? parts[0];

  const partDocs: ComponentDocs["parts"] = [];
  const propDocs: PropDoc[] = [];
  const eventDocs: ComponentDocs["events"] = [];

  for (const property of root?.properties ?? []) {
    if (isPartType(property.type)) {
      const part: PartDoc = { name: property.name };
      const param = partParam(property.type);
      if (param) part.param = param;
      if (isRepeatable(property.type)) part.repeatable = true;
      if (property.description) part.description = property.description;
      partDocs.push(part);
      continue;
    }
    if (isEventName(property.name) && property.type.includes("=>")) {
      const event: ComponentDocs["events"][number] = { name: property.name };
      const arg = handlerArg(property.type);
      if (arg) event.arg = arg;
      if (property.description) event.description = property.description;
      eventDocs.push(event);
      continue;
    }
    propDocs.push(toPropDoc(property));
  }

  const subcomponents = parts
    .filter((part) => part.name !== root?.name)
    .map((part) => {
      const sub: SubcomponentDoc = {
        name: part.name,
        props: part.properties.map(toPropDoc),
      };
      if (part.nativeAttributes) sub.nativeAttributes = part.nativeAttributes;
      return sub;
    });

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
    description: docs.description ?? input.registryDescription ?? "",
    installCommand: input.installCommand,
    usageTags: docs.usageTags ?? "",
    importSnippet: docs.importSnippet ?? "",
    usageSnippet: docs.usageSnippet ?? "",
    parts: partDocs,
    props: propDocs,
    events: eventDocs,
    keyboard: docs.accessibilityKeyboard ?? [],
    accessibilityNotes: docs.accessibilityNotes ?? [],
    examples,
  };
  if (root?.nativeAttributes) model.nativeAttributes = root.nativeAttributes;
  if (subcomponents.length > 0) model.subcomponents = subcomponents;
  if (docs.concepts) model.concepts = docs.concepts;
  if (docs.composition) model.composition = docs.composition;
  return model;
}
