import { promises as fs } from "fs"
import { homedir } from "os"
import path from "path"
import {
  getRegistryHeadersFromContext,
  setRegistryHeaders,
} from "@/src/registry/context"
import {
  RegistryLocalFileError,
  RegistryParseError,
} from "@/src/registry/errors"
import { fetchRegistry } from "@/src/registry/fetcher"
import { componentDocsSchema } from "@/src/registry/schema"
import { isUrl } from "@/src/registry/utils"
import type { z } from "zod"

/**
 * An item's docs model is not embedded in the item: the item carries a
 * `componentDocsRef`, and the model is its own file. These helpers turn that
 * reference into an address that can be fetched, and fetch it.
 *
 * A reference is one of:
 * - an absolute URL (what the official registry emits — an item URL is a
 *   template for third-party registries, so nothing can be derived from it);
 * - a path relative to the item's own location, for a registry served from
 *   local files (resolved against the item's file path, or its URL).
 *
 * It is made absolute once, where the item is fetched and its location is
 * known, so every later reader sees one shape.
 */

export type ComponentDocsModel = z.infer<typeof componentDocsSchema>

function expandHome(filePath: string): string {
  return filePath.startsWith("~/") ? path.join(homedir(), filePath.slice(2)) : filePath
}

/**
 * The item's `componentDocsRef`, made absolute against `location` (the URL or
 * local file path the item was read from). A reference that cannot be made
 * absolute — relative, with no known location (a GitHub-hosted item) — is
 * dropped: an unresolvable address would only fail later and more obscurely.
 */
export function absolutizeDocsRef<T extends { componentDocsRef?: string }>(
  item: T,
  location: string | undefined
): T {
  const ref = item.componentDocsRef
  if (!ref) return item
  if (isUrl(ref)) return item

  const { componentDocsRef: _relative, ...rest } = item
  if (!location) return rest as T

  if (isUrl(location)) {
    try {
      const absolute = new URL(ref, location).toString()
      carryHeaders(location, absolute)
      return { ...rest, componentDocsRef: absolute } as T
    } catch {
      return rest as T
    }
  }

  const absolute = path.resolve(path.dirname(path.resolve(expandHome(location))), ref)
  return { ...rest, componentDocsRef: absolute } as T
}

/**
 * Auth headers are registered per URL, so a docs file next to a private item
 * would be requested without them. Carry them across, but only within one
 * origin: a reference pointing at a different host must never receive
 * credentials meant for the registry.
 */
function carryHeaders(itemUrl: string, docsUrl: string): void {
  const itemHeaders = getRegistryHeadersFromContext(itemUrl)
  if (!Object.keys(itemHeaders).length) return
  if (new URL(itemUrl).origin !== new URL(docsUrl).origin) return
  setRegistryHeaders({ [docsUrl]: itemHeaders })
}

/**
 * Fetches and validates the docs model a reference points at. Network and HTTP
 * failures propagate as the registry errors they already are (so they classify
 * as NETWORK_ERROR / FETCH_ERROR like any other registry read); a body that is
 * not a docs model is a parse error naming the reference.
 */
export async function fetchComponentDocs(ref: string): Promise<ComponentDocsModel> {
  let raw: unknown
  if (isUrl(ref)) {
    ;[raw] = await fetchRegistry([ref], { useCache: false })
  } else {
    try {
      raw = JSON.parse(await fs.readFile(path.resolve(expandHome(ref)), "utf8"))
    } catch (error) {
      throw new RegistryLocalFileError(ref, error)
    }
  }
  const parsed = componentDocsSchema.safeParse(raw)
  if (!parsed.success) {
    throw new RegistryParseError(ref, parsed.error, {
      subject: "component docs",
      suggestion:
        "The docs file may be from a different version of the registry. Run \"marko-ui docs <name> --remote\" again later, or update marko-ui.",
    })
  }
  return parsed.data
}
