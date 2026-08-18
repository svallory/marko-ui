// Browser-only icon-library swap, ported from shadcn's
// registry/icons/create-icon-loader.tsx: each library's map is dynamically
// `import()`ed on first use and cached, mirroring shadcn's per-library
// `React.lazy(() => import("./__" + libraryName + "__"))` — this keeps
// resolve.ts (SSR's static-import-all-5 module, see that file's header)
// out of the client's STATIC reachability graph, so a request for one
// icon's library doesn't have to load unrelated map code just to render.
//
// Measured caveat (2026-08-13, this app's Vite/Rolldown build): dynamic
// `import()` calls made from a route's own client `<script>` do not
// currently land in a separate physical chunk here the way shadcn's
// Next.js/webpack build does — Rolldown emits them as
// `Promise.resolve().then(() => module)`, i.e. bundled into the SAME
// per-route chunk as the importer (verified: no chunking config in this
// repo's vite.config.ts or @marko/run's plugin forces this; it's this
// bundler's default behavior for a route-scoped single-consumer dynamic
// import). Net effect: the /create/preview route's client bundle still
// ships all 5 libraries' ~360KB combined (~101KB gzipped) in one chunk,
// same as if this file didn't lazy-import at all. The `import()` calls are
// kept anyway because (a) they correctly keep resolve.ts's SSR-only static
// imports out of the client graph, which DOES matter, (b) the async
// resolveIconInnerAsync/loadLibraryMap API still only loads-and-caches the
// map actually asked for at the JS-execution level even though the bytes
// arrived together, and (c) if this bundler's chunking behavior changes
// upstream, this code starts benefiting from real network-level splitting
// with no changes needed here. See TODO.md for the open follow-up to
// investigate forcing a real split (e.g. explicit manualChunks/
// advancedChunks in vite.config.ts, or an adapter-level fix).
//
// This is what apps/docs/src/routes/create/preview/+page.marko's
// `applyIconLibrary` calls when the /create icon-library picker changes —
// the ONLY place an already-rendered page needs a library other than the
// one it was SSR'd with (see that route's header comment on why a manual
// DOM patch, not a React-style re-render, is used at all).
import type { IconLibraryName } from "./icon-names.ts";
import { FALLBACK_INNER, renderHugeiconsNodes, withSuffixFallback } from "./render.ts";

type StringMap = Record<string, string>;

const mapCache = new Map<IconLibraryName, Promise<StringMap | Record<string, unknown>>>();

function loadLibraryMap(library: IconLibraryName) {
  let promise = mapCache.get(library);
  if (promise) return promise;

  promise = (async () => {
    switch (library) {
      case "tabler":
        return (await import("./__tabler__.ts")).tablerIcons;
      case "phosphor":
        return (await import("./__phosphor__.ts")).phosphorIcons;
      case "remixicon":
        return (await import("./__remixicon__.ts")).remixiconIcons;
      case "hugeicons":
        return (await import("./__hugeicons__.ts")).hugeiconsIcons;
      default:
        return (await import("./__lucide__.ts")).lucideIcons;
    }
  })();
  mapCache.set(library, promise);
  return promise;
}

// Warms every library's module cache in the background so a later switch
// resolves instantly — mirrors create-icon-loader's preload comment
// ("These warm the browser module cache; React.lazy resolves immediately
// for modules that are already loaded"). Call once, e.g. on the preview
// route's first mount.
export function preloadAllIconLibraries() {
  const libraries: IconLibraryName[] = ["lucide", "tabler", "phosphor", "remixicon", "hugeicons"];
  for (const library of libraries) {
    void loadLibraryMap(library);
  }
}

// Resolves the inner SVG markup for (name, library), lazily loading that
// library's map on first use.
export async function resolveIconInnerAsync(name: string, library: IconLibraryName): Promise<string> {
  const map = await loadLibraryMap(library);
  if (library === "hugeicons") {
    const nodes = withSuffixFallback(map as Record<string, Parameters<typeof renderHugeiconsNodes>[0]>, name);
    return nodes ? renderHugeiconsNodes(nodes) : FALLBACK_INNER;
  }
  return withSuffixFallback(map as StringMap, name) ?? FALLBACK_INNER;
}
