/**
 * Per-route page metadata: title, description, canonical, and Open Graph /
 * Twitter tags. `resolveMeta(pathname)` is the single entry point — the root
 * layout calls it with `$global.url.pathname` and renders the result into
 * `<head>`. There is no page-to-layout data channel in @marko/run for this
 * (layouts receive the request/URL, not arbitrary page-supplied slots), so
 * routes are looked up by path here rather than each page exporting its own
 * meta. Docs pages reuse `DOCS_NAV_FLAT` and component pages reuse
 * `COMPONENTS` as their sources of truth, so titles can't drift from the
 * sidebar/registry; everything else is hand-authored below, matching the
 * on-page copy at the time of writing.
 */
import { DOCS_NAV_FLAT } from "../tags/docs/docs-nav.ts";
import { COMPONENTS } from "./components-list.ts";
import { BLOCK_CATEGORIES, BLOCKS } from "./blocks-list.ts";

export const SITE_NAME = "marko-ui";
export const SITE_TAGLINE = "shadcn for Marko";
export const SITE_URL = "https://marko-ui.saulo.tech";
export const DEFAULT_DESCRIPTION =
  "Accessible, copy-paste components for Marko 6, styled with Tailwind v4 and driven by Zag.js state machines. Open Source. Open Code.";
export const DEFAULT_OG_IMAGE = `${SITE_URL}/og.png`;

export interface PageMeta {
  title: string;
  description: string;
  /** Absolute canonical URL for this route. */
  canonical: string;
  /** "website" for most pages, "article" for long-form docs content. */
  ogType: "website" | "article";
}

function titleCase(slug: string): string {
  return slug
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

// Hand-authored entries for routes that aren't derived from a shared data
// source. Keys are pathnames with no trailing slash (except "/").
const ROUTE_META: Record<string, { title: string; description: string }> = {
  "/": {
    title: SITE_NAME,
    description: DEFAULT_DESCRIPTION,
  },
  "/docs": {
    title: "Docs",
    description:
      "marko-ui is a set of accessible, copy-paste components for Marko 6, styled with Tailwind v4 and driven by Zag.js state machines. Open Source. Open Code.",
  },
  "/blocks": {
    title: "Blocks",
    description:
      "Ready-to-use page compositions built from marko-ui registry components — dashboards, sidebars, login and signup flows, calendars, and more.",
  },
  "/typeset": {
    title: "Typeset",
    description:
      "A drop-in .typeset class for prose you didn't author yourself — CMS fields, READMEs, streamed model output — styled with marko-ui's own semantic tokens.",
  },
  "/create": {
    title: "Create",
    description:
      "Design your own marko-ui theme: base color, accent, radius, font, and chart palette, with a live preview and exportable CSS.",
  },
  // Chrome-free iframe target for /create's preview pane — no ROUTE_META
  // entry existed for /blocks/view/* either (same chrome-free-iframe-target
  // shape); added here anyway since its <title> is visible in devtools/
  // the iframe's own tab if popped out.
  "/create/preview": {
    title: "Preview",
    description: "Live preview of the current theme.",
  },
  "/components": {
    title: "Components",
    description: `Browse all ${COMPONENTS.length} components in the marko-ui registry.`,
  },
};

// Docs sidebar entries, keyed by href, plus the zag-adapter deep-dive pages
// that aren't in the flat nav.
for (const item of DOCS_NAV_FLAT) {
  if (!(item.href in ROUTE_META)) {
    ROUTE_META[item.href] = { title: item.label, description: DEFAULT_DESCRIPTION };
  }
}

const ZAG_ADAPTER_SUBPAGES: Record<string, { title: string; description: string }> = {
  "/docs/zag-adapter/checklist": {
    title: "Checklist for a new adapter",
    description:
      "Everything a seventh framework adapter must implement, in build order, each item pointing at the reference implementation file most worth copying from.",
  },
  "/docs/zag-adapter/divergence": {
    title: "Divergence map",
    description:
      "Where the six implementations genuinely differ (contract-level decisions a new adapter must make) versus where they are line-for-line identical (framework idiom, safe to copy verbatim).",
  },
  "/docs/zag-adapter/responsibilities": {
    title: "The five responsibilities",
    description: "Every adapter implements the same five jobs. This page compares HOW each of the six frameworks does it, file by file.",
  },
  "/docs/zag-adapter/vanilla": {
    title: "The vanilla adapter deep-dive",
    description:
      "Vanilla has no reactive runtime, making it the closest analog to a resumability-constrained target (e.g. Marko). This page documents exactly how it schedules updates, subscribes consumers, and re-applies props to the DOM.",
  },
};
Object.assign(ROUTE_META, ZAG_ADAPTER_SUBPAGES);

// Override docs pages whose real copy is richer than their nav label.
ROUTE_META["/docs/creating-components"] = {
  title: "How to Create a Marko-Zag Component",
  description: "The complete recipe, using Switch — the reference implementation — as the worked example.",
};

ROUTE_META["/docs/icons"] = {
  title: "Icons",
  description:
    "A single Icon component that renders one of 191 abstract names against any of five icon libraries — real SVG in the initial HTML, zero client JS required to paint.",
};

for (const category of BLOCK_CATEGORIES) {
  if (category.slug) {
    ROUTE_META[`/blocks/${category.slug}`] = {
      title: `${category.name} Blocks`,
      description: `${category.name} page compositions built from marko-ui registry components.`,
    };
  }
}

// /blocks/view/<name> is the chrome-free full-page render each block's
// preview iframe points at (mirrors shadcn's /view/[style]/[name], whose
// generateMetadata titles the page with the block's own name/description —
// see data/shadcn-ui/apps/v4/app/(view)/view/[style]/[name]/page.tsx).
// Previously had no ROUTE_META entry at all, so every one of these pages
// showed "Page Not Found — marko-ui" in its <title>.
for (const block of BLOCKS) {
  ROUTE_META[`/blocks/view/${block.name}`] = {
    title: block.title,
    description: block.description,
  };
}

for (const name of COMPONENTS) {
  const entry = {
    title: titleCase(name),
    description: `${titleCase(name)} — a copy-paste marko-ui component built on Zag.js.`,
  };
  ROUTE_META[`/docs/components/${name}`] = entry;
}

function normalize(pathname: string): string {
  if (pathname.length > 1 && pathname.endsWith("/")) {
    return pathname.slice(0, -1);
  }
  return pathname;
}

/**
 * Resolve title/description/canonical/OG type for a request pathname.
 * Unknown paths (including the 404 route) fall back to site-wide defaults.
 */
export function resolveMeta(pathname: string): PageMeta {
  const path = normalize(pathname);
  const entry = ROUTE_META[path];
  const isArticle = path.startsWith("/docs/");

  if (!entry) {
    return {
      title: `Page Not Found — ${SITE_NAME}`,
      description: DEFAULT_DESCRIPTION,
      canonical: `${SITE_URL}${path}`,
      ogType: "website",
    };
  }

  return {
    title: path === "/" ? entry.title : `${entry.title} — ${SITE_NAME}`,
    description: entry.description,
    canonical: `${SITE_URL}${path}`,
    ogType: isArticle ? "article" : "website",
  };
}
