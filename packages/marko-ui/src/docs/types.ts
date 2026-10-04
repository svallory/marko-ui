// The structured component docs model — ONE shape, assembled by whoever has
// the data (today: apps/docs, which owns `docs.ts`, the demo sources and
// api-reference.json) and rendered by the renderer next door.
//
// It lives in the CLI package because that is the package that has to render
// it without a network: `marko-ui docs <name>` reads the model out of the
// registry item and renders it locally, while the docs site imports the very
// same module to serve `/docs/components/<name>.md`. Two renderers for one
// model is how those two start disagreeing.
//
// Nothing here may import anything: the model and the renderer are pulled into
// the docs site's browser bundle by the `.md` handlers.

/** A prop of the component, in the form an agent reads it. */
export interface PropDoc {
  name: string;
  /** Type as authored, minus the `| undefined` every optional prop carries. */
  type: string;
  required: boolean;
  /** Statically knowable default; absent means "not recorded". */
  default?: string;
  /** The component sets this itself and a caller value is ignored. */
  fixed?: string | true;
  description?: string;
}

/**
 * An attribute tag — `<@trigger>` in Marko. Parts are props today (typed
 * `Marko.AttrTag<…>` or `Marko.Body<…>` in the API data), so the API table
 * showed them as `Marko.Body<[Foo]>`, which tells an agent nothing about what
 * to write. They get their own section instead.
 */
export interface PartDoc {
  /** `trigger` for `<@trigger>`. */
  name: string;
  /** The parameter type when the body takes one, e.g. `Record<string, unknown>`. */
  param?: string;
  /** True when the API data types it as an array, i.e. it can appear twice. */
  repeatable?: boolean;
  description?: string;
}

/** A change handler, split out of the props so the props stay scannable. */
export interface EventDoc {
  /** `openChange` or `onOpenChange` — whatever the prop is named. */
  name: string;
  /** The handler's argument type, e.g. `OpenChangeDetails`. */
  arg?: string;
  description?: string;
}

/** A part with its own file and its own props. */
export interface SubcomponentDoc {
  /** File name without extension, e.g. `trigger`. */
  name: string;
  props: PropDoc[];
  nativeAttributes?: string;
}

export interface ExampleDoc {
  /** Stable id, kebab-cased; the `--example <id>` selector. */
  id: string;
  title: string;
  description?: string;
  /** Demo source, already comment-stripped by the assembler. */
  source: string;
  /**
   * Shown in the default output. True only for an example that demonstrates
   * something an agent cannot infer from the props list: controlled state,
   * attr-tag composition, form/validation use, async data. Never for a
   * visual variant, a size, an RTL flip or icon placement.
   */
  essential?: boolean;
}

export interface ComponentDocs {
  name: string;
  title: string;
  description: string;
  /** `bunx marko-ui add <name> -y`. */
  installCommand: string;
  /** Tag names usable without an import once the taglib is registered. */
  usageTags: string;
  /** The explicit-import form. */
  importSnippet: string;
  /** A minimal usage snippet. */
  usageSnippet: string;
  parts: PartDoc[];
  props: PropDoc[];
  events: EventDoc[];
  /** Tag whose native attributes the root also accepts, e.g. `div`. */
  nativeAttributes?: string;
  /**
   * Parts that are their own file (`dialog/trigger.marko`), each with its own
   * props. A compound component's surface is the root plus these; printing
   * only the root would hide `DialogTitle`'s props entirely.
   */
  subcomponents?: SubcomponentDoc[];
  keyboard: { keys: string; description: string }[];
  accessibilityNotes: string[];
  concepts?: string;
  composition?: string;
  examples: ExampleDoc[];
}

/**
 * Which examples to print.
 *
 * - `essential` (the default): the hero example plus the essential ones, at
 *   most three in total.
 * - `all`: every example.
 * - an array of ids: exactly those examples, in the order given.
 */
export type ExampleSelection = "essential" | "all" | string[];

/** How many examples the default output prints, hero included. */
export const DEFAULT_EXAMPLE_LIMIT = 3;

/**
 * How much example SOURCE the default output will print, in characters.
 *
 * The example count alone does not bound the output: `chart`'s single example
 * is already ~13k characters of markup. This is a second, independent stop so
 * a component with two huge essential examples prints the strongest one and
 * lists the rest, instead of producing a default answer no agent reads to the
 * end. Anything it drops is still in the "More examples" list, so nothing
 * becomes unreachable.
 */
export const DEFAULT_EXAMPLE_CHAR_BUDGET = 7_000;