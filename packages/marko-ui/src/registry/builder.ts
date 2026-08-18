import { isGitHubItemAddress } from "@/src/registry/address"
import { BUILTIN_REGISTRIES, REGISTRY_URL } from "@/src/registry/constants"
import { expandEnvVars } from "@/src/registry/env"
import {
  RegistryError,
  RegistryErrorCode,
  RegistryNotConfiguredError,
} from "@/src/registry/errors"
import { parseRegistryAndItemFromString } from "@/src/registry/parser"
import { isLocalFile, isUrl } from "@/src/registry/utils"
import { validateRegistryConfig } from "@/src/registry/validator"
import { registryConfigItemSchema } from "@/src/schema"
import { Config } from "@/src/utils/get-config"
import { z } from "zod"

const NAME_PLACEHOLDER = "{name}"
const STYLE_PLACEHOLDER = "{style}"
const ENV_VAR_PATTERN = /\${(\w+)}/g
const LEFTOVER_PLACEHOLDER_PATTERN = /\{([a-z]\w*)\}/i
const QUERY_PARAM_SEPARATOR = "?"
const QUERY_PARAM_DELIMITER = "&"

function isLocalPath(path: string) {
  return path.startsWith("./") || path.startsWith("/")
}

export function buildUrlAndHeadersForRegistryItem(
  name: string,
  config?: Config
) {
  let { registry, item } = parseRegistryAndItemFromString(name)

  // If no registry prefix, check if it's a URL or local path.
  // These should be handled directly, not through a registry.
  if (!registry) {
    if (
      isUrl(name) ||
      isLocalFile(name) ||
      isLocalPath(name) ||
      isGitHubItemAddress(name)
    ) {
      return null
    }
    registry = "@marko-ui"
  }

  const registries = { ...BUILTIN_REGISTRIES, ...config?.registries }
  const registryConfig = registries[registry]
  if (!registryConfig) {
    throw new RegistryNotConfiguredError(registry)
  }

  // TODO: I don't like this here.
  // But this will do for now.
  validateRegistryConfig(registry, registryConfig)

  return {
    url: buildUrlFromRegistryConfig(item, registryConfig, config, registry),
    headers: buildHeadersFromRegistryConfig(registryConfig),
  }
}

export function buildUrlFromRegistryConfig(
  item: string,
  registryConfig: z.infer<typeof registryConfigItemSchema>,
  config?: Config,
  registryName?: string
) {
  if (typeof registryConfig === "string") {
    let url = registryConfig.replaceAll(NAME_PLACEHOLDER, item)
    if (config?.style && url.includes(STYLE_PLACEHOLDER)) {
      url = url.replaceAll(STYLE_PLACEHOLDER, config.style)
    }
    url = expandEnvVars(url)
    assertNoLeftoverPlaceholders(url, registryName)
    return url
  }

  let baseUrl = registryConfig.url.replaceAll(NAME_PLACEHOLDER, item)

  // Per-namespace `vars` take precedence over the global `config.style`
  // fallback (see notes/plans/registry-url-vars.md). `style` is special: it
  // is the only placeholder with a global fallback, and `vars.style` beats
  // it. Every other placeholder has no global fallback at all.
  if (registryConfig.vars) {
    for (const [key, rawValue] of Object.entries(registryConfig.vars)) {
      const placeholder = `{${key}}`
      if (baseUrl.includes(placeholder)) {
        baseUrl = baseUrl.replaceAll(placeholder, expandEnvVars(rawValue))
      }
    }
  }

  if (config?.style && baseUrl.includes(STYLE_PLACEHOLDER)) {
    baseUrl = baseUrl.replaceAll(STYLE_PLACEHOLDER, config.style)
  }

  baseUrl = expandEnvVars(baseUrl)
  assertNoLeftoverPlaceholders(baseUrl, registryName)

  if (!registryConfig.params) {
    return baseUrl
  }

  return appendQueryParams(baseUrl, registryConfig.params)
}

function assertNoLeftoverPlaceholders(url: string, registryName?: string) {
  const match = url.match(LEFTOVER_PLACEHOLDER_PATTERN)
  if (!match) {
    return
  }

  const placeholder = match[0]
  const varName = match[1]
  const registryLabel = registryName ? `registry "${registryName}"` : "registry"

  throw new RegistryError(
    `${registryLabel}: no value for ${placeholder} — set it in the namespace's "vars" or in the top-level "style" field.`,
    {
      code: RegistryErrorCode.INVALID_CONFIG,
      context: { url, placeholder, varName, registryName },
      suggestion:
        varName === "style"
          ? 'Set the top-level "style" field, or add a "vars" entry for this namespace in your components.json.'
          : 'Add a "vars" entry for this placeholder in the namespace\'s registry configuration in your components.json.',
    }
  )
}

export function buildHeadersFromRegistryConfig(
  config: z.infer<typeof registryConfigItemSchema>
) {
  if (typeof config === "string" || !config.headers) {
    return {}
  }

  const headers: Record<string, string> = {}

  for (const [key, value] of Object.entries(config.headers)) {
    const expandedValue = expandEnvVars(value)

    if (shouldIncludeHeader(value, expandedValue)) {
      headers[key] = expandedValue
    }
  }

  return headers
}

function appendQueryParams(baseUrl: string, params: Record<string, string>) {
  const urlParams = new URLSearchParams()

  for (const [key, value] of Object.entries(params)) {
    const expandedValue = expandEnvVars(value)
    if (expandedValue) {
      urlParams.append(key, expandedValue)
    }
  }

  const queryString = urlParams.toString()
  if (!queryString) {
    return baseUrl
  }

  const separator = baseUrl.includes(QUERY_PARAM_SEPARATOR)
    ? QUERY_PARAM_DELIMITER
    : QUERY_PARAM_SEPARATOR

  return `${baseUrl}${separator}${queryString}`
}

function shouldIncludeHeader(originalValue: string, expandedValue: string) {
  const trimmedExpanded = expandedValue.trim()

  if (!trimmedExpanded) {
    return false
  }

  // If the original value contains valid env vars, only include if expansion changed the value.
  if (originalValue.includes("${")) {
    // Check if there are actual env vars in the string
    const envVars = originalValue.match(ENV_VAR_PATTERN)
    if (envVars) {
      const templateWithoutVars = originalValue
        .replace(ENV_VAR_PATTERN, "")
        .trim()
      return trimmedExpanded !== templateWithoutVars
    }
  }

  return true
}

/**
 * Resolves a registry URL from a path or URL string.
 * Handles special cases like v0 registry URLs that need /json suffix.
 *
 * @param pathOrUrl - Either a relative path or a full URL
 * @returns The resolved registry URL
 */
export function resolveRegistryUrl(pathOrUrl: string) {
  if (isUrl(pathOrUrl)) {
    return new URL(pathOrUrl).toString()
  }

  return `${REGISTRY_URL}/${pathOrUrl}`
}
