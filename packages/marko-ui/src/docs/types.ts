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
 *
 * NOTE: the DEFAULT body (`content`) is deliberately NOT a part. `<@content>`
 * is not valid markup — the body is written between the component's own tags
 * (`<Dialog>…</Dialog>`). It is carried as `ComponentDocs.body` instead.
 */
export interface PartDoc {
  /** `trigger` for `<@trigger>`. */
  name: string;
  /** The parameter type when the body takes one, e.g. `Record<string, unknown>`. */
  param?: string;
  /** True when the component iterates it, so it can be written more than once. */
  repeatable?: boolean;
  /**
   * The part's own attributes, read out of the `Marko.AttrTag<T>` type T.
   * `<@trigger value>` is only writable because `value` is declared here; a
   * part printed as a bare `<@trigger>` tells an agent nothing about that.
   */
  attributes?: PropDoc[];
  description?: string;
}

/**
 * The component's default body — the `content` prop. Not a part: it is what
 * goes between the component's own tags.
 */
export interface BodyDoc {
  /** The parameter type when the body takes one, e.g. `string` for `<Dialog|description|>`. */
  param?: string;
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

/**
 * An object shape a caller has to BUILD to use a prop, e.g. `items=`.
 * `items: DropdownMenuItem[]` alone documents nothing an agent can act on.
 */
export interface ItemTypeDoc {
  prop: string;
  typeName: string;
  fields: PropDoc[];
}

/** A part with its own file and its own props. */
export interface SubcomponentDoc {
  /** File name without extension, e.g. `trigger`. */
  name: string;
  props: PropDoc[];
  /** Nested attr-tags (chart's `<@series>`, pie's `<@centerLabel>`). */
  parts?: PartDoc[];
  /** The sub-part's own default body, if it declares one. */
  body?: BodyDoc;
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
  /**
   * What an `import`-distribution project runs instead. `add` REFUSES to run
   * under that distribution (`assertAddableDistribution`), so telling such a
   * project to `add` is an instruction that fails.
   */
  importInstallCommand?: string;
  /** Tag names usable without an import once the taglib is registered. */
  usageTags: string;
  /** The explicit-import form. */
  importSnippet: string;
  /** A minimal usage snippet, WITHOUT any import line. */
  usageSnippet: string;
  /**
   * Other registry components the Usage snippet needs. Copy distribution only:
   * the renderer prints the `add` command, and never under `import` where the
   * dependency is the package rather than a per-component install.
   */
  requires?: string[];
  /** The tag's default body, when the component declares one. */
  body?: BodyDoc;
  parts: PartDoc[];
  props: PropDoc[];
  events: EventDoc[];
  /**
   * The taglib names this component registers in a COPY project, PascalCased
   * from `<dir>[-<file>]` exactly as `collectProjectTags` does. `chart`
   * registers `Chart`, `ChartBar`, `ChartArea`, … — NOT the import bindings
   * `Chart`, `BarChart`, `AreaChart` the demos happen to use.
   */
  tags?: string[];
  /** Object shapes a caller must build to use `items=`-style props. */
  itemTypes?: ItemTypeDoc[];
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

/**
 * Which import paths the rendered snippets assume.
 *
 * The model stores every source AS AUTHORED (examples import
 * `@marko-ui/shadcn/ui/...`; the usage import is the copy path's
 * `@/components/ui/...`). The renderer resolves both into one coherent story
 * per project, so the CLI and the docs site can never print a Usage block and
 * an example that disagree about where a component comes from.
 */
export type ImportStyle =
  | { kind: "copy"; uiAlias: string }
  | { kind: "import" };

/** The alias a project with no `aliases.ui` gets. */
export const DEFAULT_UI_ALIAS = "@/components/ui";

/** The import style used when nothing else is known: copy, default alias. */
export const DEFAULT_IMPORT_STYLE: ImportStyle = {
  kind: "copy",
  uiAlias: DEFAULT_UI_ALIAS,
};

/** The `@marko-ui/shadcn` package root the `import` distribution resolves. */
export const IMPORT_PACKAGE_UI = "@marko-ui/shadcn/ui";

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