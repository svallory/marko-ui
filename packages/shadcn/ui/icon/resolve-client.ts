// Client-side icon resolution, the browser counterpart of resolve.ts (which
// statically imports all 5 libraries' maps and so must stay server-only, see
// icon.marko's header). This module statically imports ONLY the default
// library's map (__lucide__.ts, the smallest of the 5), so it is cheap enough
// to ship in every route that renders an <icon>: a client-mounted icon in the
// default library resolves synchronously, with no flash, same as an SSR'd one.
//
// Any other library is loaded on demand: loadClientIconInner dynamically
// imports client-swap.ts (which itself dynamically imports one library map),
// so the other four maps stay in lazily fetched chunks.
//
// `marko-ui add` REPLACES this whole file with a single-library version (see
// packages/marko-ui/src/utils/icon-library.ts); keep the export signatures in
// sync with that generator.
import { lucideIcons } from "./__lucide__.ts";
import type { IconLibraryName } from "./icon-names.ts";
import { FALLBACK_INNER, ICON_WRAPPER_ATTRS, withSuffixFallback } from "./render.ts";

// Same contract as resolve.ts's resolveIconLibrary (which re-exports this).
export function resolveIconLibrary(requested?: string): IconLibraryName {
  return requested !== undefined && requested in ICON_WRAPPER_ATTRS
    ? (requested as IconLibraryName)
    : "lucide";
}

// Synchronous inner markup: real for the default library, the placeholder
// glyph for any other (loadClientIconInner supplies the real markup).
export function resolveClientIconInner(name: string, library: IconLibraryName): string {
  return library === "lucide" ? (withSuffixFallback(lucideIcons, name) ?? FALLBACK_INNER) : FALLBACK_INNER;
}

// Real inner markup for a library the synchronous pass could not resolve, or
// undefined when resolveClientIconInner already returned the real markup.
export function loadClientIconInner(name: string, library: IconLibraryName): Promise<string> | undefined {
  if (library === "lucide") return undefined;
  return import("./client-swap.ts").then((m) => m.resolveIconInnerAsync(name, library));
}
