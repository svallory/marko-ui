import { z } from "zod"

// Note: if you edit the schema here, you must also edit the schema in the
// apps/v4/public/schema/registry-item.json file.

export const registryConfigItemSchema = z.union([
  // Simple string format: "https://example.com/{name}.json"
  z.string().refine((s) => s.includes("{name}"), {
    message: "Registry URL must include {name} placeholder",
  }),
  // Advanced object format with auth options
  z.object({
    url: z.string().refine((s) => s.includes("{name}"), {
      message: "Registry URL must include {name} placeholder",
    }),
    params: z.record(z.string(), z.string()).optional(),
    headers: z.record(z.string(), z.string()).optional(),
    // Per-namespace values for `{...}` URL placeholders (see
    // notes/plans/registry-url-vars.md). Must live INSIDE the registry entry,
    // never at the top level: the top-level config schema is `.strict()`
    // (see rawConfigSchema below), so a new top-level field would make
    // shadcn's own CLI hard-reject the whole components.json. This object
    // schema has no `.strict()`, so unknown keys (like `vars` when read by
    // shadcn's CLI) are silently stripped and the config stays valid there.
    // `name` is reserved for item identity; rejected at parse time.
    vars: z
      .record(z.string(), z.string())
      .refine((v) => !("name" in v), {
        message:
          '"vars" cannot define "name" — it is reserved for the item being installed.',
      })
      .optional(),
  }),
])

export const registryConfigSchema = z.record(
  z.string().refine((key) => key.startsWith("@"), {
    message: "Registry names must start with @ (e.g., @v0, @acme)",
  }),
  registryConfigItemSchema
)

export const rawConfigSchema = z
  .object({
    $schema: z.string().optional(),
    style: z.string(),
    // React Server Components flag. Meaningless for Marko, but shadcn's
    // published schema.json (which we declare as our $schema) lists it as
    // required, so it stays for wire compatibility. Always false.
    rsc: z.coerce.boolean().default(false),
    tsx: z.coerce.boolean().default(true),
    tailwind: z.object({
      config: z.string().optional(),
      css: z.string(),
      baseColor: z.string(),
      cssVariables: z.boolean().default(true),
      prefix: z.string().default("").optional(),
    }),
    iconLibrary: z.string().optional(),
    rtl: z.coerce.boolean().default(false).optional(),
    menuColor: z
      .enum([
        "default",
        "inverted",
        "default-translucent",
        "inverted-translucent",
      ])
      .default("default")
      .optional(),
    menuAccent: z.enum(["subtle", "bold"]).default("subtle").optional(),
    // Which distribution path this project uses (see
    // notes/plans/dual-distribution-plan.md): "copy" (default) writes flat
    // generated source per component via `add`; "import" depends on
    // `@marko-ui/shadcn` (mu-* hook-class components + precompiled style
    // layers) and scaffolds a CSS entry instead of copying files. Additive
    // field — absent/older configs are treated as "copy".
    distribution: z.enum(["copy", "import"]).optional(),
    // Which of the 8 shape/spacing/radius styles (VISUAL_STYLES in
    // registry/constants.ts) this project uses. For "copy" it selects which
    // per-style registry tree `add` fetches from
    // (`<REGISTRY_URL>/styles/<visualStyle>/<name>.json`, see build-registry.ts);
    // for "import" it's the `style-<visualStyle>` class applied to activate
    // @marko-ui/shadcn's precompiled layer. Additive field — absent/older
    // configs fall back to DEFAULT_VISUAL_STYLE.
    visualStyle: z.string().optional(),
    aliases: z.object({
      components: z.string(),
      utils: z.string(),
      ui: z.string().optional(),
      lib: z.string().optional(),
      hooks: z.string().optional(),
    }),
    registries: registryConfigSchema.optional(),
  })
  .strict()

export const configSchema = rawConfigSchema.extend({
  resolvedPaths: z.object({
    cwd: z.string(),
    tailwindConfig: z.string(),
    tailwindCss: z.string(),
    utils: z.string(),
    components: z.string(),
    lib: z.string(),
    hooks: z.string(),
    ui: z.string(),
  }),
})

// TODO: type the key.
// Okay for now since I don't want a breaking change.
export const workspaceConfigSchema = z.record(configSchema)

export const registryItemTypeSchema = z.enum([
  "registry:lib",
  "registry:block",
  "registry:component",
  "registry:ui",
  "registry:hook",
  "registry:page",
  "registry:file",
  "registry:theme",
  "registry:style",
  "registry:item",
  "registry:base",
  "registry:font",

  // Internal use only.
  "registry:example",
  "registry:internal",
])

export const registryItemFileSchema = z.discriminatedUnion("type", [
  // Target is required for registry:file and registry:page
  z.object({
    path: z.string(),
    content: z.string().optional(),
    type: z.enum(["registry:file", "registry:page"]),
    target: z.string(),
  }),
  z.object({
    path: z.string(),
    content: z.string().optional(),
    type: registryItemTypeSchema.exclude(["registry:file", "registry:page"]),
    target: z.string().optional(),
  }),
])

export const registryItemTailwindSchema = z.object({
  config: z
    .object({
      content: z.array(z.string()).optional(),
      theme: z.record(z.string(), z.any()).optional(),
      plugins: z.array(z.string()).optional(),
    })
    .optional(),
})

export const registryItemCssVarsSchema = z.object({
  theme: z.record(z.string(), z.string()).optional(),
  light: z.record(z.string(), z.string()).optional(),
  dark: z.record(z.string(), z.string()).optional(),
})

// Recursive type for CSS properties that supports empty objects at any level.
const cssValueSchema: z.ZodType<any> = z.lazy(() =>
  z.union([
    z.string(),
    z.array(z.union([z.string(), z.record(z.string(), z.string())])),
    z.record(z.string(), cssValueSchema),
  ])
)

export const registryItemCssSchema = z.record(z.string(), cssValueSchema)

export const registryItemEnvVarsSchema = z.record(z.string(), z.string())

// Font metadata schema for registry:font items.
export const registryItemFontSchema = z.object({
  family: z.string(),
  provider: z.literal("google"),
  import: z.string(),
  variable: z.string(),
  weight: z.array(z.string()).optional(),
  subsets: z.array(z.string()).optional(),
  selector: z.string().optional(),
  dependency: z.string().optional(),
})

// The structured component docs a `registry:ui` item can carry. Its own key,
// NOT shadcn's `docs` string above: that one is prose meant for a human
// reading a registry browser, and overwriting it would break every consumer
// that reads it. The model is rendered by the CLI's own renderer (the same one
// the docs site uses), which is why it ships as data rather than as markdown.
const componentDocsPropSchema = z.object({
  name: z.string(),
  type: z.string(),
  required: z.boolean(),
  default: z.string().optional(),
  fixed: z.union([z.string(), z.literal(true)]).optional(),
  description: z.string().optional(),
})

const componentDocsPartSchema = z.object({
  name: z.string(),
  param: z.string().optional(),
  repeatable: z.boolean().optional(),
  attributes: z.array(componentDocsPropSchema).optional(),
  description: z.string().optional(),
})

const componentDocsBodySchema = z.object({
  param: z.string().optional(),
  description: z.string().optional(),
})

const componentDocsEventSchema = z.object({
  name: z.string(),
  arg: z.string().optional(),
  description: z.string().optional(),
})

export const componentDocsSchema = z.object({
  name: z.string(),
  title: z.string(),
  description: z.string(),
  installCommand: z.string(),
  usageTags: z.string(),
  importSnippet: z.string(),
  usageSnippet: z.string(),
  parts: z.array(componentDocsPartSchema),
  props: z.array(componentDocsPropSchema),
  events: z.array(componentDocsEventSchema),
  body: componentDocsBodySchema.optional(),
  nativeAttributes: z.string().optional(),
  subcomponents: z
    .array(
      z.object({
        name: z.string(),
        props: z.array(componentDocsPropSchema),
        parts: z.array(componentDocsPartSchema).optional(),
        body: componentDocsBodySchema.optional(),
        nativeAttributes: z.string().optional(),
      }),
    )
    .optional(),
  keyboard: z.array(z.object({ keys: z.string(), description: z.string() })),
  accessibilityNotes: z.array(z.string()),
  concepts: z.string().optional(),
  composition: z.string().optional(),
  examples: z.array(
    z.object({
      id: z.string(),
      title: z.string(),
      description: z.string().optional(),
      source: z.string(),
      essential: z.boolean().optional(),
    }),
  ),
})

// Common fields shared by all registry items.
export const registryItemCommonSchema = z.object({
  $schema: z.string().optional(),
  extends: z.string().optional(),
  name: z.string(),
  title: z.string().optional(),
  author: z.string().min(2).optional(),
  description: z.string().optional(),
  dependencies: z.array(z.string()).optional(),
  devDependencies: z.array(z.string()).optional(),
  registryDependencies: z.array(z.string()).optional(),
  files: z.array(registryItemFileSchema).optional(),
  tailwind: registryItemTailwindSchema.optional(),
  cssVars: registryItemCssVarsSchema.optional(),
  css: registryItemCssSchema.optional(),
  envVars: registryItemEnvVarsSchema.optional(),
  meta: z.record(z.string(), z.any()).optional(),
  docs: z.string().optional(),
  /** The structured, machine-readable docs model (see componentDocsSchema). */
  // `.catch(undefined)`: docs are an ADDITIVE convenience. A registry item
  // whose `componentDocs` is malformed (hand-edited registry, a half-deployed
  // registry, a newer model than this CLI knows) must still install and still
  // `show` — the failure has to be limited to `marko-ui docs`, not turn into a
  // parse error on the whole item.
  componentDocs: componentDocsSchema.optional().catch(undefined),
  categories: z.array(z.string()).optional(),
})

// registry:base has a config field, registry:font has a font field.
export const registryItemSchema = z.discriminatedUnion("type", [
  registryItemCommonSchema.extend({
    type: z.literal("registry:base"),
    config: rawConfigSchema.deepPartial().optional(),
  }),
  registryItemCommonSchema.extend({
    type: z.literal("registry:font"),
    font: registryItemFontSchema,
  }),
  registryItemCommonSchema.extend({
    type: registryItemTypeSchema.exclude(["registry:base", "registry:font"]),
  }),
])

export type RegistryItem = z.infer<typeof registryItemSchema>

// Helper type for registry:base items specifically.
export type RegistryBaseItem = Extract<RegistryItem, { type: "registry:base" }>

// Helper type for registry:font items specifically.
export type RegistryFontItem = Extract<RegistryItem, { type: "registry:font" }>

// Pagination metadata returned by registries that implement dynamic search.
// Its presence on a catalog response signals that the items are already
// filtered and paginated server-side.
export const registryPaginationSchema = z.object({
  total: z.number(),
  offset: z.number(),
  limit: z.number(),
  hasMore: z.boolean(),
})

const registryBaseSchema = z
  .object({
    $schema: z.string().optional(),
    name: z.string().optional(),
    homepage: z.string().optional(),
    include: z.array(z.string()).optional(),
    items: z.array(registryItemSchema).optional(),
    pagination: registryPaginationSchema.optional(),
  })
  .refine(
    (registry) =>
      registry.items !== undefined || registry.include !== undefined,
    {
      message: "Registry must define at least one of `items` or `include`.",
      path: ["items"],
    }
  )

export const registryChunkSchema = registryBaseSchema.transform((registry) => ({
  ...registry,
  items: registry.items ?? [],
}))

export const registrySchema = registryChunkSchema.pipe(
  z.object({
    $schema: z.string().optional(),
    name: z.string(),
    homepage: z.string(),
    include: z.array(z.string()).optional(),
    items: z.array(registryItemSchema),
    pagination: registryPaginationSchema.optional(),
  })
)

export type Registry = z.infer<typeof registrySchema>

export const registryIndexSchema = z.array(registryItemSchema)

export const stylesSchema = z.array(
  z.object({
    name: z.string(),
    label: z.string(),
  })
)

export const iconsSchema = z.record(
  z.string(),
  z.record(z.string(), z.string())
)

export const registryBaseColorSchema = z.object({
  inlineColors: z.object({
    light: z.record(z.string(), z.string()),
    dark: z.record(z.string(), z.string()),
  }),
  cssVars: registryItemCssVarsSchema,
  cssVarsV4: registryItemCssVarsSchema.optional(),
  inlineColorsTemplate: z.string(),
  cssVarsTemplate: z.string(),
})

export const registryResolvedItemsTreeSchema = registryItemCommonSchema
  .pick({
    dependencies: true,
    devDependencies: true,
    files: true,
    tailwind: true,
    cssVars: true,
    css: true,
    envVars: true,
    docs: true,
  })
  .extend({
    fonts: z
      .array(
        registryItemCommonSchema.extend({
          type: z.literal("registry:font"),
          font: registryItemFontSchema,
        })
      )
      .optional(),
  })

export const searchResultItemSchema = z.object({
  name: z.string(),
  // Short form ("ui", "block"), not the wire form ("registry:ui"). The
  // prefix is an implementation detail of the registry protocol; a reader of
  // `search --json` types items by what they are, and the CLI already accepts
  // both spellings on `--type`.
  type: z.string().optional(),
  description: z.string().optional(),
  registry: z.string(),
})

/**
 * The item as it flows through search's LOCAL pipeline, before the final
 * `searchResultsSchema.parse` strips it back to the public shape.
 *
 * `title` is kept here because ranking weighs a title match almost as heavily
 * as a name match; it is not kept in the OUTPUT because it is derivable from
 * `name` and every item carried it. zod's object parse drops unknown keys, so
 * the one `searchResultsSchema.parse` at the end is what actually removes it —
 * there is no second, hand-written projection to keep in sync.
 */
export const searchableResultItemSchema = searchResultItemSchema.extend({
  title: z.string().optional(),
})

export const searchResultErrorSchema = z.object({
  registry: z.string(),
  message: z.string(),
})

export const searchResultsSchema = z.object({
  pagination: registryPaginationSchema,
  items: z.array(searchResultItemSchema),
  // Registries that failed to load during the search. Only present when a
  // search tolerates per-registry failures (see searchRegistries'
  // continueOnError) and at least one registry was skipped.
  errors: z.array(searchResultErrorSchema).optional(),
})

// Legacy schema for getRegistriesIndex() backward compatibility.
export const registriesIndexSchema = z.record(
  z.string().regex(/^@[a-zA-Z0-9][a-zA-Z0-9-_]*$/),
  z.string()
)

// New schema for getRegistries().
export const registriesSchema = z.array(
  z.object({
    name: z.string(),
    homepage: z.string().optional(),
    url: z.string(),
    description: z.string().optional(),
    // marko-ui compatibility contract: registries in OUR index declare the
    // framework their items ship source for. Optional so plain shadcn
    // indexes still parse; `registry add` refuses entries without
    // target "marko" unless the user passes an explicit URL.
    target: z.string().optional(),
  })
)

export const presetSchema = z.object({
  name: z.string(),
  title: z.string(),
  description: z.string(),
  base: z.string(),
  style: z.string(),
  baseColor: z.string(),
  theme: z.string(),
  iconLibrary: z.string(),
  font: z.string(),
  rtl: z.coerce.boolean().default(false),
  menuAccent: z.enum(["subtle", "bold"]),
  menuColor: z.enum([
    "default",
    "inverted",
    "default-translucent",
    "inverted-translucent",
  ]),
  radius: z.string(),
})

export type Preset = z.infer<typeof presetSchema>

export const configJsonSchema = z.object({
  presets: z.array(presetSchema),
})

export type ConfigJson = z.infer<typeof configJsonSchema>
