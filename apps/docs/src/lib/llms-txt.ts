/**
 * /llms.txt — the machine entry point for an AI agent that lands on this site
 * without the CLI (https://llmstxt.org shape: H1, blockquote summary, then
 * sections of links with a one-line note each).
 *
 * Built from the sources the site itself uses — the component list and
 * descriptions (SIDEBAR_COMPONENTS), the docs navigation (DOCS_NAV_FLAT),
 * SITE_URL and the registry base URL — never from a hand-kept list, so a new
 * component or page appears here by being added where the site already lists
 * it. The guidance section is the one hand-written part (llms-guidance.ts).
 * Size is not capped by truncation: every component keeps its full first
 * sentence (the test ceiling is 18,000 characters).
 *
 * `scripts/prerender-handlers.ts` writes the result to dist/public/llms.txt:
 * a route cannot serve it (@marko/run reads a period in a directory name as a
 * path separator, so there is no `llms.txt` route), and the file has an
 * extension, so no content-type rule is needed beyond the one in
 * public/_headers that pins charset and caching.
 */
import { DOCS_NAV_FLAT } from "../tags/docs/docs-nav.ts";
import { REGISTRY_BASE_URL, SIDEBAR_COMPONENTS } from "./component-page-data.ts";
import { LLMS_GUIDANCE } from "./llms-guidance.ts";
import { DEFAULT_DESCRIPTION, SITE_NAME, SITE_TAGLINE, SITE_URL } from "./site-meta.ts";

/**
 * Docs pages worth an agent's time, with the note that says why. Keyed by the
 * route the docs navigation already lists: the build throws when a key is not
 * in the nav, so a renamed or removed page cannot leave a dead link here.
 */
export const LLMS_DOC_PAGES: Record<string, string> = {
  "/docs/installation": "set a project up (init, Tailwind, the CSS entry)",
  "/docs/working-with-ai": "AGENTS.md, skills, the CLI contract for agents",
  "/docs/cli": "every command, flag, exit code and error code",
  "/docs/theming": "styles, base colors, tokens, the mu-* hook classes",
  "/docs/creating-components": "write a new component (attr-tags, Zag wiring)",
};

/**
 * A component's one-line note: its description's FIRST SENTENCE, whole. Never
 * cut mid-sentence — a truncated note ("Displays a button or a…") says less than
 * the component's name does, and the reader chooses a component from this line.
 */
export function oneLine(text: string): string {
  return text.replace(/\s+/g, " ").trim().split(/(?<=[.!?])\s/)[0]!.replace(/\.$/, "");
}

export interface LlmsInput {
  siteUrl: string;
  registryUrl: string;
  summary: string;
  docs: { href: string; label: string; note: string }[];
  components: { name: string; description: string }[];
}

export function renderLlmsTxt(input: LlmsInput): string {
  const lines: string[] = [`# ${SITE_NAME}`, "", `> ${input.summary}`, "", LLMS_GUIDANCE];

  lines.push("## Docs", "");
  for (const page of input.docs) {
    lines.push(`- [${page.label}](${input.siteUrl}${page.href}): ${page.note}`);
  }

  lines.push("", "## Components", "");
  for (const { name, description } of input.components) {
    lines.push(`- [${name}](${input.siteUrl}/docs/components/${name}.md): ${oneLine(description)}`);
  }

  lines.push(
    "",
    "## Registry",
    "",
    `- [index](${input.registryUrl}/index.json): every item with its description`,
    `- [button](${input.registryUrl}/button.json): one item's JSON, what \`marko-ui add\` fetches (same URL pattern for every component name)`,
    "",
  );
  return lines.join("\n");
}

/** The real /llms.txt, from the site's own data. */
export function buildLlmsTxt(): string {
  const navByHref = new Map(DOCS_NAV_FLAT.map((item) => [item.href, item.label]));
  const docs = Object.entries(LLMS_DOC_PAGES).map(([href, note]) => {
    const label = navByHref.get(href);
    if (!label) {
      throw new Error(`llms.txt lists ${href}, which is not in the docs navigation (docs-nav.ts).`);
    }
    return { href, label, note };
  });

  return renderLlmsTxt({
    siteUrl: SITE_URL,
    registryUrl: REGISTRY_BASE_URL,
    summary: `${SITE_TAGLINE}. ${DEFAULT_DESCRIPTION}`,
    docs,
    components: SIDEBAR_COMPONENTS.filter((component) => component.documented).map((component) => ({
      name: component.name,
      description: component.description ?? "",
    })),
  });
}
