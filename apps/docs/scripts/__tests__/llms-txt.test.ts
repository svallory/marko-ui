import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import type { Route } from "@marko/run/vite";

import { staticUrls } from "../../vite.config.ts";
import { DOCUMENTED_COMPONENTS, REGISTRY_BASE_URL } from "../../src/lib/component-page-data.ts";
import { DOCS_NAV_FLAT } from "../../src/tags/docs/docs-nav.ts";
import { SITE_URL } from "../../src/lib/site-meta.ts";
import { LLMS_DOC_PAGES, buildLlmsTxt, oneLine, renderLlmsTxt } from "../../src/lib/llms-txt.ts";

const DOCS_ROOT = path.resolve(import.meta.dirname, "../..");
const ROUTES_DIR = path.join(DOCS_ROOT, "src/routes");

/** Every parameterless page route, derived from the route directories exactly as @marko/run does. */
function pageRoutes(dir = ROUTES_DIR, prefix = ""): string[] {
  const found: string[] = [];
  if (existsSync(path.join(dir, "+page.marko"))) found.push(prefix || "/");
  for (const entry of readdirSync(dir)) {
    const full = path.join(dir, entry);
    if (!statSync(full).isDirectory() || entry.startsWith("$") || entry.startsWith("_")) continue;
    found.push(...pageRoutes(full, `${prefix}/${entry}`));
  }
  return found;
}

function route(routePath: string): Route {
  return {
    key: routePath,
    index: 0,
    path: { id: routePath, path: routePath, segments: routePath.split("/").filter(Boolean) },
    layouts: [],
    middleware: [],
  } as Route;
}

const TEXT = buildLlmsTxt();
const LINK = /\[([^\]]+)\]\(([^)\s]+)\)/g;
const links = [...TEXT.matchAll(LINK)].map((match) => ({ label: match[1]!, url: match[2]! }));

const registryFiles = new Set(
  (JSON.parse(readFileSync(path.join(DOCS_ROOT, "registry-manifest.json"), "utf8")) as {
    files: { path: string }[];
  }).files.map((file) => file.path),
);

describe("llms.txt shape", () => {
  it("is H1, a blockquote summary, then the working guidance before any link list", () => {
    const lines = TEXT.split("\n");
    expect(lines[0]).toBe("# marko-ui");
    expect(lines[1]).toBe("");
    expect(lines[2]).toMatch(/^> \S/);
    const headings = lines.filter((line) => line.startsWith("## "));
    expect(headings).toEqual([
      "## How to work with marko-ui",
      "## Docs",
      "## Components",
      "## Registry",
    ]);
  });

  it("stays under 18,000 characters (full one-line notes, not truncated ones)", () => {
    expect(TEXT.length).toBeLessThan(18_000);
  });

  it("survives a UTF-8 round trip (it carries non-ASCII punctuation and is served as UTF-8)", () => {
    const bytes = Buffer.from(TEXT, "utf8");
    expect(bytes.toString("utf8")).toBe(TEXT);
    expect(bytes.length).toBeGreaterThanOrEqual(TEXT.length);
  });

  it("never cuts a component note mid-sentence", () => {
    expect(TEXT).not.toContain("…");
  });

  it("points at docs --list for the CLI's copy of the index", () => {
    expect(TEXT).toContain("`marko-ui docs --list`");
  });

  it("is plain text a program can read: no HTML, ends with one newline", () => {
    expect(TEXT).not.toMatch(/<(?:a|div|p|span|h\d)[\s>]/);
    expect(TEXT.endsWith("\n")).toBe(true);
    expect(TEXT.endsWith("\n\n")).toBe(false);
  });

  it("lists every documented component once, from the site's own list", () => {
    const names = links
      .map((link) => link.url.match(/\/docs\/components\/([^/]+)\.md$/)?.[1])
      .filter((name): name is string => Boolean(name));
    expect(names).toEqual(DOCUMENTED_COMPONENTS);
    expect(new Set(names).size).toBe(names.length);
  });

  it("gives every link a one-line note", () => {
    for (const line of TEXT.split("\n").filter((l) => l.startsWith("- ["))) {
      expect(line, line).toMatch(/\): \S/);
      expect(line.includes("\n")).toBe(false);
    }
  });

  it("starts the components section with the how-to, not the other way round", () => {
    expect(TEXT.indexOf("## How to work with marko-ui")).toBeLessThan(TEXT.indexOf("## Components"));
  });
});

describe("llms.txt links resolve to something the build emits", () => {
  const fsRoutes = pageRoutes();
  const emitted = new Set(staticUrls(fsRoutes.map(route)));

  it("has links to check", () => {
    expect(links.length).toBeGreaterThan(80);
  });

  it("uses only the site URL and the registry URL", () => {
    for (const { url } of links) {
      expect(url.startsWith(`${SITE_URL}/`) || url.startsWith(`${REGISTRY_BASE_URL}/`), url).toBe(true);
    }
  });

  it("links docs pages that have a page route and are in the docs navigation", () => {
    const pages = links.filter((link) => link.url.startsWith(`${SITE_URL}/docs/`) && !link.url.endsWith(".md"));
    expect(pages.map((p) => p.url.slice(SITE_URL.length))).toEqual(Object.keys(LLMS_DOC_PAGES));
    for (const { url } of pages) {
      const href = url.slice(SITE_URL.length);
      expect(fsRoutes, href).toContain(href);
      expect(DOCS_NAV_FLAT.map((item) => item.href), href).toContain(href);
    }
  });

  it("links component markdown that the crawl is told to visit", () => {
    const markdown = links.filter((link) => link.url.endsWith(".md"));
    expect(markdown.length).toBe(DOCUMENTED_COMPONENTS.length);
    for (const { url } of markdown) {
      expect(emitted.has(url.slice(SITE_URL.length)), url).toBe(true);
    }
  });

  it("links registry files the registry build emits", () => {
    const registry = links.filter((link) => link.url.startsWith(`${REGISTRY_BASE_URL}/`));
    expect(registry.length).toBeGreaterThan(0);
    for (const { url } of registry) {
      expect(registryFiles.has(url.slice(REGISTRY_BASE_URL.length + 1)), url).toBe(true);
    }
    // The item link is a real link to a real item, not a URL template.
    expect(registry.map((link) => link.url)).toContain(`${REGISTRY_BASE_URL}/button.json`);
    expect(TEXT).not.toContain("<name>.json");
  });
});

describe("oneLine", () => {
  it("keeps a short sentence whole, without its trailing period", () => {
    expect(oneLine("Displays a callout.")).toBe("Displays a callout");
  });

  it("keeps only the first sentence", () => {
    expect(oneLine("Short one. A second sentence that is ignored.")).toBe("Short one");
  });

  it("keeps a long first sentence whole instead of cutting it", () => {
    const sentence = "A vertically stacked set of interactive headings that each reveal a section of content";
    expect(oneLine(`${sentence}. Second.`)).toBe(sentence);
  });

  it("keeps an em-dash clause that is part of the first sentence", () => {
    expect(oneLine("Displays a menu — opened by a trigger. More.")).toBe("Displays a menu — opened by a trigger");
  });

  it("collapses whitespace and newlines", () => {
    expect(oneLine("  Two\n   lines  here. ")).toBe("Two lines here");
  });

  it("handles an empty description", () => {
    expect(oneLine("")).toBe("");
  });

  it("does not split on a dotted token that is not a sentence end", () => {
    expect(oneLine("Uses the v1.2 API")).toBe("Uses the v1.2 API");
  });
});

describe("renderLlmsTxt", () => {
  const input = {
    siteUrl: "https://example.test",
    registryUrl: "https://example.test/r",
    summary: "A summary.",
    docs: [{ href: "/docs/cli", label: "CLI", note: "all commands" }],
    components: [
      { name: "alpha", description: "First component. More." },
      { name: "beta", description: "" },
    ],
  };

  it("builds every URL from the injected site and registry URLs", () => {
    const text = renderLlmsTxt(input);
    expect(text).toContain("- [CLI](https://example.test/docs/cli): all commands");
    expect(text).toContain("- [alpha](https://example.test/docs/components/alpha.md): First component");
    expect(text).toContain("(https://example.test/r/index.json)");
    expect(text).toContain("(https://example.test/r/button.json)");
    expect(text).not.toContain("marko-ui.saulo.tech");
  });

  it("follows the component list it is given, in order", () => {
    const names = [...renderLlmsTxt(input).matchAll(/\[(alpha|beta)\]/g)].map((m) => m[1]);
    expect(names).toEqual(["alpha", "beta"]);
  });
});
