// Assembles the structured ComponentDocs model for one component and renders it.
//
// This is the ONLY markdown assembler for component docs. It builds the model
// (from `docs.ts`, the demo sources, api-reference.json and the component's
// own source) and hands it to the renderer in packages/marko-ui/src/docs — the
// same renderer `marko-ui docs` runs on the model it reads from the registry
// item, so the two cannot drift.
//
// The inputs are passed in rather than imported: the registry build assembles
// the same model from files on disk, while the docs site passes the ones
// already inlined in the demos manifest. That keeps the demos manifest out of
// the registry build's dependency graph (it is generated FROM the registry).
import {
  renderComponentDocs,
  type ComponentDocs as ComponentDocsModel,
  type ExampleSelection,
  type ImportStyle,
} from "../../../../packages/marko-ui/src/docs/index.ts";
import {
  buildComponentDocs,
  type ComponentDocsInput,
} from "../../../../packages/marko-ui/src/docs/build.ts";
import type { ComponentPageData } from "./component-page-data.ts";
import { stripMarkoComments } from "../../../../packages/marko-ui/src/docs/strip-comments.ts";

export { defaultCell } from "./default-cell.ts";
export { stripMarkoComments } from "../../../../packages/marko-ui/src/docs/strip-comments.ts";
export type { ComponentDocsInput } from "../../../../packages/marko-ui/src/docs/build.ts";

/**
 * Builds the model from the docs site's inputs.
 *
 * A straight re-export of the pure builder, NOT a wrapper: the registry build
 * calls that same function, and a wrapper here is how the two answers drifted
 * apart in the first place.
 */
export { buildComponentDocs };

/**
 * The builder's input, from the page model the docs site already assembles.
 * Its `examples` carry the resolved demo sources, so no second lookup — and no
 * dependency on the demos manifest, which is generated from the registry.
 *
 * `componentSource` is the component's authored `.marko` source, read back out
 * of the registry snapshot inlined here — byte-for-byte what the registry
 * build read off disk. The builder needs it for two facts nothing else
 * carries: whether an attr-tag is iterated (repeatable) and what an
 * `Marko.AttrTag<T>` type declares (the part's own attributes).
 */
export function componentDocsInputFromPage(page: ComponentPageData): ComponentDocsInput {
  const demos: ComponentDocsInput["demos"] = {};
  for (const example of page.examples) demos[example.name] = { source: example.source };
  return {
    name: page.name,
    title: page.title,
    registryDescription: page.registry.description,
    docs: page.docs,
    demos,
    parts: page.parts,
    installCommand: page.installCommand,
    componentSource: page.registry.files
      .filter((file) => file.path.endsWith(".marko"))
      .map((file) => file.content)
      .join("\n"),
    // Same list the registry build reads off disk: the file names under
    // `ui/<name>/`, which is what the taglib names are derived from.
    // `path` is the file's name in the CONSUMER's project
    // (`src/components/ui/badge/badge.marko`), and part files are flat under
    // the component directory, so the basename IS the part name.
    partFiles: page.registry.files
      .map((file) => file.path.split("/").pop() ?? "")
      .filter((file) => file.endsWith(".marko") && !file.endsWith(".d.marko"))
      .map((file) => file.slice(0, -".marko".length))
      .sort(),
    importInstallCommand: "bun add @marko-ui/shadcn marko-zag",
  };
}

/** Builds and renders in one step. */
export function renderComponentDocsFrom(
  input: ComponentDocsInput,
  selection: ExampleSelection = "essential",
  importStyle?: ImportStyle,
): string {
  return renderComponentDocs(buildComponentDocs(input), selection, { importStyle });
}

/**
 * What the docs site's `/docs/components/<name>.md` serves: the same renderer
 * the CLI runs, with EVERY example (a human reading the page can see them all;
 * the CLI's default is the lean slice).
 *
 * The snippets assume the COPY path with the default `@/components/ui` alias —
 * the same assumption the pages' code panels make — so the `.md` a reader
 * copies out of the page is the code that lands in their project.
 */
export function renderComponentMarkdown(
  page: ComponentPageData,
  selection: ExampleSelection = "all",
): string {
  return renderComponentDocsFrom(componentDocsInputFromPage(page), selection);
}