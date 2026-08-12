// Single source of truth for everything a component doc page shows. The
// .marko page and the .md endpoint both build from this, so the markdown an
// AI assistant is handed can never drift from the page a human reads.
import apiReference from "./api-reference.json" with { type: "json" };
import { COMPONENTS } from "./components-list.ts";
import { DEMOS } from "../demos/demos-manifest.ts";
import type { ComponentDocs } from "../demos/docs-types.ts";
import type { DemoEntry, RegistrySnapshot } from "../demos/demos-manifest.ts";
import type { ApiPart } from "../tags/docs/api-table.marko";

// Where the shadcn CLI is pointed. A literal, matching every other install
// command on the site (docs/installation, blocks/block-preview, home/card-
// install). NOT read from process.env: this module is imported by the page,
// so it is bundled for the browser too, and touching `process` there throws
// "process is not defined" and takes down hydration for the whole page.
const REGISTRY_BASE_URL = "https://marko-ui.saulo.tech/r";

interface ApiComponent {
  name: string;
  parts: ApiPart[];
}

const API_COMPONENTS = (apiReference as { components: ApiComponent[] }).components;

/** Title-cased display name: `alert-dialog` → `Alert Dialog`. */
export function titleize(componentName: string): string {
  return componentName
    .split("-")
    .map((segment) => segment.charAt(0).toUpperCase() + segment.slice(1))
    .join(" ");
}

export interface ComponentPageExample extends DemoEntry {
  name: string;
  title: string;
  description?: string;
  /** Slug for the section heading and its TOC entry. */
  id: string;
}

export interface ComponentNeighbour {
  name: string;
  title: string;
}

export interface ComponentPageData {
  name: string;
  title: string;
  description: string;
  href: string;
  registryUrl: string;
  installCommand: string;
  docs: ComponentDocs;
  registry: RegistrySnapshot;
  parts: ApiPart[];
  /** True when the component ships more than one part worth composing. */
  isCompound: boolean;
  examples: ComponentPageExample[];
  previous: ComponentNeighbour | null;
  next: ComponentNeighbour | null;
}

/**
 * Components with a demos directory, in the order the sidebar lists them
 * (COMPONENTS order — alphabetical — so prev/next matches what a reader sees).
 */
export const DOCUMENTED_COMPONENTS: string[] = COMPONENTS.filter(
  (componentName) => componentName in DEMOS,
);

/** Every component in the registry, flagged with whether its page exists yet. */
export interface SidebarComponent {
  name: string;
  title: string;
  documented: boolean;
}

export const SIDEBAR_COMPONENTS: SidebarComponent[] = COMPONENTS.map((componentName) => ({
  name: componentName,
  title: titleize(componentName),
  documented: componentName in DEMOS,
}));

/** `switch-controlled` → `switch-controlled`, kept stable for anchors. */
function slugify(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

/**
 * Assembles the page model, or `null` when the component has no demos
 * directory — the route turns that into a 404 rather than half a page.
 */
export function getComponentPageData(componentName: string): ComponentPageData | null {
  const entry = DEMOS[componentName];
  if (!entry) return null;

  const apiComponent = API_COMPONENTS.find((candidate) => candidate.name === componentName);
  const parts = apiComponent?.parts ?? [];

  const examples: ComponentPageExample[] = [];
  for (const example of entry.docs.examples) {
    const demo = entry.demos[example.name];
    // A docs.ts naming a demo file that does not exist would silently drop a
    // documented example; skipping is the safe half of that, but the manifest
    // generator is what should have caught it.
    if (!demo) continue;
    examples.push({
      ...demo,
      name: example.name,
      title: example.title,
      description: example.description,
      id: slugify(example.title),
    });
  }

  const orderIndex = DOCUMENTED_COMPONENTS.indexOf(componentName);
  const neighbourAt = (index: number): ComponentNeighbour | null => {
    const neighbourName = DOCUMENTED_COMPONENTS[index];
    return neighbourName ? { name: neighbourName, title: titleize(neighbourName) } : null;
  };

  const registryUrl = `${REGISTRY_BASE_URL}/${componentName}.json`;

  return {
    name: componentName,
    title: entry.registry.title || titleize(componentName),
    description: entry.docs.description || entry.registry.description,
    href: `/docs/components/${componentName}`,
    registryUrl,
    installCommand: `bunx --bun shadcn@latest add ${registryUrl}`,
    docs: entry.docs,
    registry: entry.registry,
    parts,
    // A single part named after the component has nothing to compose.
    isCompound: parts.length > 1,
    examples,
    previous: orderIndex === -1 ? null : neighbourAt(orderIndex - 1),
    next: orderIndex === -1 ? null : neighbourAt(orderIndex + 1),
  };
}
