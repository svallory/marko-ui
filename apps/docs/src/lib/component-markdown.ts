// Assembles the structured ComponentDocs model for one component and renders it.
//
// This is the ONLY markdown assembler for component docs. It builds the model
// (from `docs.ts`, the demo sources and api-reference.json) and hands it to the
// renderer in packages/marko-ui/src/docs — the same renderer `marko-ui docs`
// runs on the model it reads from the registry item, so the two cannot drift.
//
// The inputs are passed in rather than imported: the registry build calls this
// with demo sources read from disk, while the docs site passes the ones already
// inlined in the demos manifest. That keeps the demos manifest out of the
// registry build's dependency graph (it is generated FROM the registry).
import {
  renderComponentDocs,
  type ComponentDocs as ComponentDocsModel,
  type ExampleSelection,
  type PropDoc,
} from "../../../../packages/marko-ui/src/docs/index.ts";
import {
  buildComponentDocs,
  type ComponentDocsInput,
} from "../../../../packages/marko-ui/src/docs/build";
import type { ComponentPageData } from "./component-page-data.ts";
import type { ApiPart } from "../tags/docs/api-table.marko";
import { stripMarkoComments } from "../../../../packages/marko-ui/src/docs/strip-comments";

export { defaultCell } from "./default-cell.ts";

/** What the builder needs about one component, from wherever it is assembled. */
/** The pure builder lives in the CLI package; the docs site only adds the
 * comment stripping, which is a property of the demo sources, not of the
 * model. */
export { stripMarkoComments } from "../../../../packages/marko-ui/src/docs/strip-comments";
export type { ComponentDocsInput } from "../../../../packages/marko-ui/src/docs/build";

/** Builds the model from the docs site's inputs, with comments stripped. */
export function buildComponentDocs(input: ComponentDocsInput): ComponentDocsModel {
  return buildModel(input);
}

/**
 * The builder's input, from the page model the docs site already assembles.
 * Its `examples` carry the resolved demo sources, so no second lookup — and no
 * dependency on the demos manifest, which is generated from the registry.
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
  };
}

/** Builds and renders in one step. */
export function renderComponentDocsFrom(
  input: ComponentDocsInput,
  selection: ExampleSelection = "essential",
): string {
  return renderComponentDocs(buildComponentDocs(input), selection);
}

/**
 * What the docs site's `/docs/components/<name>.md` serves: the same renderer
 * the CLI runs, with EVERY example (a human reading the page can see them all;
 * the CLI's default is the lean slice).
 */
export function renderComponentMarkdown(
  page: ComponentPageData,
  selection: ExampleSelection = "all",
): string {
  return renderComponentDocsFrom(componentDocsInputFromPage(page), selection);
}