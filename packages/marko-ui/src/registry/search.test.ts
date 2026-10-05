import { describe, expect, it, vi } from "vitest"

import { getRegistry } from "./api"
import {
  allowedSearchEdits,
  buildRegistryItemNameFromRegistry,
  findUnknownSearchTypes,
  formatSearchResultDescription,
  formatSearchResultType,
  printSearchResults,
  resolveSearchRegistries,
  searchItems,
  SEARCH_CONCURRENCY,
  SEARCH_RESULT_DESCRIPTION_MAX_LENGTH,
  SEARCH_STOPWORDS,
  SEARCHABLE_TYPES,
  searchRegistries,
  tokenizeSearchText,
} from "./search"

// Mocked once at module scope so every `vi.mocked(getRegistry).mockImplementation`
// below configures the same spy. Calling `vi.mock` inside a test body is not
// supported by Vitest and warns on every run.
vi.mock("./api", () => ({
  getRegistry: vi.fn(),
}))

describe("searchRegistries", () => {
  it("should fetch and return registries in flat format", async () => {
    const mockGetRegistry = vi.mocked(getRegistry)

    mockGetRegistry.mockImplementation(async (name: string) => {
      if (name === "@marko-ui" || name === "@marko-ui/shadcn") {
        return {
          name: "shadcn/ui",
          homepage: "https://ui.shadcn.com",
          items: [
            {
              name: "button",
              title: "Button",
              type: "registry:ui",
              description: "A button component",
            },
            {
              name: "card",
              type: "registry:ui",
              description: "A card component",
            },
          ],
        }
      }
      if (name === "@custom" || name === "@custom/registry") {
        return {
          name: "custom/components",
          homepage: "https://custom.com",
          items: [
            {
              name: "header",
              type: "registry:component",
              description: "A header component",
            },
          ],
        }
      }
      throw new Error(`Unknown registry: ${name}`)
    })

    const results = await searchRegistries(["@marko-ui", "@custom"])

    expect(results).toEqual({
      items: [
        {
          name: "button",
          type: "ui",
          description: "A button component",
          registry: "@marko-ui",
        },
        {
          name: "card",
          type: "ui",
          description: "A card component",
          registry: "@marko-ui",
        },
        {
          name: "header",
          type: "component",
          description: "A header component",
          registry: "@custom",
        },
      ],
      pagination: {
        total: 3,
        offset: 0,
        limit: 3,
        hasMore: false,
      },
    })

    mockGetRegistry.mockRestore()
  })

  // The `title` is the ONLY thing that makes this item match "settings" (its
  // name is "account-menu"), and it is not in the result: ranking sees the
  // title, the output does not carry it.
  it("searches titles but does not return them", async () => {
    const mockGetRegistry = vi.mocked(getRegistry)

    mockGetRegistry.mockResolvedValue({
      name: "test/registry",
      homepage: "https://test.com",
      items: [
        {
          name: "account-menu",
          title: "User Settings",
          type: "registry:ui",
          description: "An account menu",
        },
        {
          name: "button",
          type: "registry:ui",
          description: "A button component",
        },
      ],
    })

    const results = await searchRegistries(["@test"], { query: "settings" })

    expect(results.items).toEqual([
      {
        name: "account-menu",
        type: "ui",
        description: "An account menu",
        registry: "@test",
      },
    ])

    mockGetRegistry.mockRestore()
  })

  it("should apply search filter when query is provided", async () => {
    const mockGetRegistry = vi.mocked(getRegistry)

    mockGetRegistry.mockImplementation(async (name: string) => {
      if (name === "@marko-ui" || name === "@marko-ui/shadcn") {
        return {
          name: "shadcn/ui",
          homepage: "https://ui.shadcn.com",
          items: [
            {
              name: "button",
              type: "registry:ui",
              description: "A button component",
            },
            {
              name: "card",
              type: "registry:ui",
              description: "A card component",
            },
            {
              name: "dialog",
              type: "registry:ui",
              description: "A dialog component",
            },
          ],
        }
      }
      throw new Error(`Unknown registry: ${name}`)
    })

    const results = await searchRegistries(["@marko-ui"], { query: "button" })

    expect(results.items).toHaveLength(1)
    expect(results.items[0].name).toBe("button")
    expect(results.items[0].registry).toBe("@marko-ui")
    expect(results.items[0]).not.toHaveProperty("addCommandArgument")
    expect(results.items[0]).not.toHaveProperty("title")
    expect(results.pagination).toEqual({
      total: 1,
      offset: 0,
      limit: 1,
      hasMore: false,
    })

    mockGetRegistry.mockRestore()
  })

  it("should fail fast on registry error", async () => {
    const mockGetRegistry = vi.mocked(getRegistry)

    mockGetRegistry.mockImplementation(async (name: string) => {
      throw new Error(`Registry not found: ${name}`)
    })

    await expect(searchRegistries(["@unknown"])).rejects.toThrow(
      "Registry not found"
    )

    mockGetRegistry.mockRestore()
  })

  it("collects errors and continues when continueOnError is set", async () => {
    const mockGetRegistry = vi.mocked(getRegistry)

    mockGetRegistry.mockImplementation(async (name: string) => {
      if (name === "@ok") {
        return {
          name: "ok/registry",
          homepage: "https://ok.com",
          items: [
            { name: "button", type: "registry:ui", description: "A button" },
          ],
        }
      }
      throw new Error(`Registry not found: ${name}`)
    })

    const results = await searchRegistries(["@ok", "@broken"], {
      continueOnError: true,
    })

    // Items from the working registry are still returned.
    expect(results.items).toHaveLength(1)
    expect(results.items[0].name).toBe("button")

    // The failing registry is recorded in errors instead of throwing.
    expect(results.errors).toEqual([
      {
        registry: "@broken",
        message: "Registry not found: @broken",
      },
    ])

    mockGetRegistry.mockRestore()
  })

  it("preserves argument order even when responses resolve out of order", async () => {
    const mockGetRegistry = vi.mocked(getRegistry)

    // @slow resolves after @fast, but its items must still come first because
    // it is listed first. Guards the parallel fetch / ordered processing.
    mockGetRegistry.mockImplementation(async (name: string) => {
      if (name === "@slow") {
        await new Promise((resolve) => setTimeout(resolve, 20))
        return {
          name: "slow",
          homepage: "https://slow.com",
          items: [{ name: "slow-item", type: "registry:ui", description: "" }],
        }
      }
      if (name === "@fast") {
        return {
          name: "fast",
          homepage: "https://fast.com",
          items: [{ name: "fast-item", type: "registry:ui", description: "" }],
        }
      }
      throw new Error(`Unknown registry: ${name}`)
    })

    const results = await searchRegistries(["@slow", "@fast"])

    expect(results.items.map((item) => item.name)).toEqual([
      "slow-item",
      "fast-item",
    ])

    mockGetRegistry.mockRestore()
  })

  it("caps how many registries are fetched concurrently", async () => {
    const mockGetRegistry = vi.mocked(getRegistry)

    let active = 0
    let maxActive = 0
    mockGetRegistry.mockImplementation(async (name: string) => {
      active++
      maxActive = Math.max(maxActive, active)
      await new Promise((resolve) => setTimeout(resolve, 10))
      active--
      return {
        name,
        homepage: "https://test.com",
        items: [{ name: `${name}-item`, type: "registry:ui", description: "" }],
      }
    })

    const registries = Array.from({ length: 20 }, (_, i) => `@r${i}`)
    const results = await searchRegistries(registries)

    // All registries are still fetched...
    expect(results.items).toHaveLength(20)
    // ...but never more than the concurrency cap at once.
    expect(maxActive).toBeLessThanOrEqual(SEARCH_CONCURRENCY)

    mockGetRegistry.mockRestore()
  })

  it("filters by type (shorthand and full namespace, multiple)", async () => {
    const mockGetRegistry = vi.mocked(getRegistry)

    mockGetRegistry.mockImplementation(async () => ({
      name: "test/registry",
      homepage: "https://test.com",
      items: [
        { name: "button", type: "registry:ui", description: "" },
        { name: "dashboard", type: "registry:block", description: "" },
        { name: "use-foo", type: "registry:hook", description: "" },
      ],
    }))

    // Shorthand, multiple types.
    const multiple = await searchRegistries(["@test"], {
      types: ["ui", "hook"],
    })
    expect(multiple.items.map((item) => item.name)).toEqual([
      "button",
      "use-foo",
    ])

    // Full namespaced form is accepted too.
    const full = await searchRegistries(["@test"], {
      types: ["registry:block"],
    })
    expect(full.items.map((item) => item.name)).toEqual(["dashboard"])

    mockGetRegistry.mockRestore()
  })

  it("combines a type filter with a query", async () => {
    const mockGetRegistry = vi.mocked(getRegistry)

    mockGetRegistry.mockImplementation(async () => ({
      name: "test/registry",
      homepage: "https://test.com",
      items: [
        { name: "button", type: "registry:ui", description: "A button" },
        { name: "button-group", type: "registry:block", description: "" },
      ],
    }))

    const results = await searchRegistries(["@test"], {
      query: "button",
      types: ["ui"],
    })

    // Both match the query, but only the ui item survives the type filter.
    expect(results.items.map((item) => item.name)).toEqual(["button"])

    mockGetRegistry.mockRestore()
  })

  it("should return empty items when search has no matches", async () => {
    const mockGetRegistry = vi.mocked(getRegistry)

    mockGetRegistry.mockImplementation(async () => ({
      name: "test/registry",
      homepage: "https://test.com",
      items: [{ name: "button", type: "registry:ui", description: "A button" }],
    }))

    const results = await searchRegistries(["@test"], { query: "nonexistent" })

    expect(results.items).toHaveLength(0)
    expect(results.pagination).toEqual({
      total: 0,
      offset: 0,
      limit: 0,
      hasMore: false,
    })

    mockGetRegistry.mockRestore()
  })

  it("should handle fuzzy search", async () => {
    const mockGetRegistry = vi.mocked(getRegistry)

    mockGetRegistry.mockImplementation(async () => ({
      name: "test/registry",
      homepage: "https://test.com",
      items: [
        {
          name: "button",
          type: "registry:ui",
          description: "A button component",
        },
        {
          name: "dialog",
          type: "registry:ui",
          description: "A dialog overlay",
        },
      ],
    }))

    const results = await searchRegistries(["@test"], { query: "butto" })

    expect(results.items).toHaveLength(1)
    expect(results.items[0].name).toBe("button")
    expect(results.pagination).toEqual({
      total: 1,
      offset: 0,
      limit: 1,
      hasMore: false,
    })

    mockGetRegistry.mockRestore()
  })

  it("should search in descriptions", async () => {
    const mockGetRegistry = vi.mocked(getRegistry)

    mockGetRegistry.mockImplementation(async () => ({
      name: "test/registry",
      homepage: "https://test.com",
      items: [
        {
          name: "button",
          type: "registry:ui",
          description: "A clickable element",
        },
        { name: "dialog", type: "registry:ui", description: "A modal overlay" },
      ],
    }))

    const results = await searchRegistries(["@test"], { query: "modal" })

    expect(results.items).toHaveLength(1)
    expect(results.items[0].name).toBe("dialog")
    expect(results.pagination).toEqual({
      total: 1,
      offset: 0,
      limit: 1,
      hasMore: false,
    })

    mockGetRegistry.mockRestore()
  })

  it("should respect limit option", async () => {
    const mockGetRegistry = vi.mocked(getRegistry)

    mockGetRegistry.mockImplementation(async () => ({
      name: "test/registry",
      homepage: "https://test.com",
      items: [
        { name: "alert", type: "registry:ui", description: "Alert component" },
        {
          name: "avatar",
          type: "registry:ui",
          description: "Avatar component",
        },
        {
          name: "accordion",
          type: "registry:ui",
          description: "Accordion component",
        },
        {
          name: "aspect-ratio",
          type: "registry:ui",
          description: "Aspect ratio component",
        },
      ],
    }))

    const results = await searchRegistries(["@test"], { query: "a", limit: 2 })

    expect(results.items.length).toBeLessThanOrEqual(2)
    expect(results.pagination.limit).toBe(2)
    expect(results.pagination.offset).toBe(0)

    mockGetRegistry.mockRestore()
  })

  it("should handle offset and limit for pagination", async () => {
    const mockGetRegistry = vi.mocked(getRegistry)

    mockGetRegistry.mockImplementation(async () => ({
      name: "test/registry",
      homepage: "https://test.com",
      items: [
        { name: "item1", type: "registry:ui", description: "Item 1" },
        { name: "item2", type: "registry:ui", description: "Item 2" },
        { name: "item3", type: "registry:ui", description: "Item 3" },
        { name: "item4", type: "registry:ui", description: "Item 4" },
        { name: "item5", type: "registry:ui", description: "Item 5" },
      ],
    }))

    const results = await searchRegistries(["@test"], { offset: 2, limit: 2 })

    expect(results.items).toHaveLength(2)
    expect(results.items[0].name).toBe("item3")
    expect(results.items[1].name).toBe("item4")
    expect(results.pagination).toEqual({
      total: 5,
      offset: 2,
      limit: 2,
      hasMore: true,
    })

    mockGetRegistry.mockRestore()
  })

  it("should set hasMore to false when no more items", async () => {
    const mockGetRegistry = vi.mocked(getRegistry)

    mockGetRegistry.mockImplementation(async () => ({
      name: "test/registry",
      homepage: "https://test.com",
      items: [
        { name: "item1", type: "registry:ui", description: "Item 1" },
        { name: "item2", type: "registry:ui", description: "Item 2" },
        { name: "item3", type: "registry:ui", description: "Item 3" },
      ],
    }))

    const results = await searchRegistries(["@test"], { offset: 2, limit: 2 })

    expect(results.items).toHaveLength(1)
    expect(results.items[0].name).toBe("item3")
    expect(results.pagination.hasMore).toBe(false)

    mockGetRegistry.mockRestore()
  })

  it("should handle pagination across multiple registries", async () => {
    const mockGetRegistry = vi.mocked(getRegistry)

    mockGetRegistry.mockImplementation(async (name: string) => {
      if (name === "@one") {
        return {
          name: "one",
          homepage: "https://one.com",
          items: [
            { name: "item1", type: "registry:ui", description: "Item 1" },
            { name: "item2", type: "registry:ui", description: "Item 2" },
            { name: "item3", type: "registry:ui", description: "Item 3" },
          ],
        }
      }
      if (name === "@two") {
        return {
          name: "two",
          homepage: "https://two.com",
          items: [
            { name: "item4", type: "registry:ui", description: "Item 4" },
            { name: "item5", type: "registry:ui", description: "Item 5" },
          ],
        }
      }
      throw new Error("Unknown registry")
    })

    const results = await searchRegistries(["@one", "@two"], {
      offset: 1,
      limit: 3,
    })

    expect(results.items).toHaveLength(3)
    expect(results.items[0].name).toBe("item2")
    expect(results.items[0].registry).toBe("@one")
    expect(results.items[1].name).toBe("item3")
    expect(results.items[1].registry).toBe("@one")
    expect(results.items[2].name).toBe("item4")
    expect(results.items[2].registry).toBe("@two")
    expect(results.pagination).toEqual({
      total: 5,
      offset: 1,
      limit: 3,
      hasMore: true,
    })

    mockGetRegistry.mockRestore()
  })

  // Tests for URL support
  it("should search registries from direct URLs", async () => {
    const registryUrl1 = "https://example.com/registry1.json"
    const registryUrl2 = "https://example.com/registry2.json"

    // Mock getRegistry to handle URLs
    const mockGetRegistry = vi.mocked(getRegistry)

    mockGetRegistry.mockImplementation(async (nameOrUrl: string) => {
      if (nameOrUrl === registryUrl1) {
        return {
          name: "registry1",
          homepage: "https://example.com/registry1",
          items: [
            {
              name: "component1",
              type: "registry:ui",
              description: "First component",
            },
            {
              name: "component2",
              type: "registry:ui",
              description: "Second component",
            },
          ],
        }
      }
      if (nameOrUrl === registryUrl2) {
        return {
          name: "registry2",
          homepage: "https://example.com/registry2",
          items: [
            {
              name: "component3",
              type: "registry:ui",
              description: "Third component",
            },
          ],
        }
      }
      throw new Error(`Unknown URL: ${nameOrUrl}`)
    })

    const results = await searchRegistries([registryUrl1, registryUrl2])

    expect(results.items).toHaveLength(3)
    expect(results.items[0]).toMatchObject({
      name: "component1",
      registry: registryUrl1,
    })
    expect(results.items[1]).toMatchObject({
      name: "component2",
      registry: registryUrl1,
    })
    expect(results.items[2]).toMatchObject({
      name: "component3",
      registry: registryUrl2,
    })

    mockGetRegistry.mockRestore()
  })

  it("should handle mixed registry names and URLs", async () => {
    const registryName = "@marko-ui"
    const registryUrl = "https://custom.com/registry.json"

    const mockGetRegistry = vi.mocked(getRegistry)

    mockGetRegistry.mockImplementation(async (nameOrUrl: string) => {
      if (nameOrUrl === "@marko-ui" || nameOrUrl === "@marko-ui/shadcn") {
        return {
          name: "shadcn/ui",
          homepage: "https://ui.shadcn.com",
          items: [
            {
              name: "button",
              type: "registry:ui",
              description: "A button component",
            },
          ],
        }
      }
      if (nameOrUrl === registryUrl) {
        return {
          name: "custom",
          homepage: "https://custom.com",
          items: [
            {
              name: "custom-component",
              type: "registry:ui",
              description: "A custom component",
            },
          ],
        }
      }
      throw new Error(`Unknown registry: ${nameOrUrl}`)
    })

    const results = await searchRegistries([registryName, registryUrl], {
      query: "button",
    })

    // Should find the button from @marko-ui
    expect(results.items).toHaveLength(1)
    expect(results.items[0]).toMatchObject({
      name: "button",
      registry: registryName,
    })

    mockGetRegistry.mockRestore()
  })

  it("should handle URL fetch errors gracefully", async () => {
    const badUrl = "https://nonexistent.com/registry.json"

    const mockGetRegistry = vi.mocked(getRegistry)

    mockGetRegistry.mockImplementation(async (nameOrUrl: string) => {
      if (nameOrUrl === badUrl) {
        throw new Error("Failed to fetch registry")
      }
      throw new Error(`Unknown registry: ${nameOrUrl}`)
    })

    await expect(searchRegistries([badUrl])).rejects.toThrow(
      "Failed to fetch registry"
    )

    mockGetRegistry.mockRestore()
  })
})

describe("buildRegistryItemNameFromRegistry", () => {
  const testCases = [
    // Namespace registries
    {
      name: "namespace registry",
      itemName: "button",
      registry: "@marko-ui",
      expected: "@marko-ui/button",
    },
    {
      name: "namespace registry with org",
      itemName: "card",
      registry: "@myorg",
      expected: "@myorg/card",
    },

    // URL with registry in path
    {
      name: "URL with registry.json",
      itemName: "button",
      registry: "http://example.com/r/registry.json",
      expected: "http://example.com/r/button.json",
    },
    {
      name: "URL with multiple registry in path - replaces last",
      itemName: "button",
      registry: "http://example.com/registry/foo/registry",
      expected: "http://example.com/registry/foo/button",
    },
    {
      name: "URL with registry in nested path",
      itemName: "dialog",
      registry: "http://example.com/components/registry/index.json",
      expected: "http://example.com/components/dialog/index.json",
    },

    // URL with registry in query params
    {
      name: "URL with registry in query param",
      itemName: "modal",
      registry: "http://registry.foo.com?item=registry",
      expected: "http://registry.foo.com?item=modal",
    },
    {
      name: "URL with registry in query param (multiple params)",
      itemName: "tabs",
      registry: "http://api.example.com/fetch?name=registry&type=component",
      expected: "http://api.example.com/fetch?name=tabs&type=component",
    },
    {
      name: "URL with registry in both path and query",
      itemName: "button",
      registry: "http://example.com/registry?name=registry",
      expected: "http://example.com/button?name=button",
    },

    // Edge cases - should NOT replace in domain/subdomain
    {
      name: "URL with registry in subdomain - should NOT replace",
      itemName: "button",
      registry: "http://registry.example.com/api",
      expected: "http://registry.example.com/api",
    },
    {
      name: "URL with registry in domain - should NOT replace",
      itemName: "button",
      registry: "http://myregistry.com/api",
      expected: "http://myregistry.com/api",
    },

    // URLs without registry
    {
      name: "URL without registry word",
      itemName: "button",
      registry: "http://example.com/components/all",
      expected: "http://example.com/components/all",
    },
    {
      name: "URL with only query params, no registry",
      itemName: "button",
      registry: "http://example.com?type=ui",
      expected: "http://example.com?type=ui",
    },

    // HTTPS and ports
    {
      name: "HTTPS URL with registry",
      itemName: "sidebar",
      registry: "https://secure.example.com/components/registry",
      expected: "https://secure.example.com/components/sidebar",
    },
    {
      name: "URL with port and registry",
      itemName: "header",
      registry: "http://localhost:3000/api/registry",
      expected: "http://localhost:3000/api/header",
    },

    // Complex cases
    {
      name: "URL with hash and registry",
      itemName: "footer",
      registry: "http://example.com/registry#latest",
      expected: "http://example.com/footer#latest",
    },
    {
      name: "URL with encoded characters",
      itemName: "button",
      registry: "http://example.com/registry%20component",
      expected: "http://example.com/button%20component",
    },
  ]

  it.each(testCases)("$name", ({ itemName, registry, expected }) => {
    const result = buildRegistryItemNameFromRegistry(itemName, registry)
    expect(result).toBe(expected)
  })
})

describe("formatSearchResultType", () => {
  it("strips the registry prefix", () => {
    expect(formatSearchResultType("registry:ui")).toBe("ui")
    expect(formatSearchResultType("registry:block")).toBe("block")
  })

  it("returns other types unchanged", () => {
    expect(formatSearchResultType("custom:type")).toBe("custom:type")
    expect(formatSearchResultType(undefined)).toBe("")
  })
})

describe("formatSearchResultDescription", () => {
  it("returns short descriptions unchanged", () => {
    expect(formatSearchResultDescription("A simple login form.")).toBe(
      "A simple login form."
    )
  })

  it("truncates long descriptions with an ellipsis", () => {
    const description =
      "A dashboard with sidebar, charts, data table, filters, and many other widgets for managing your application."

    const formatted = formatSearchResultDescription(description)

    expect(formatted.length).toBeLessThanOrEqual(
      SEARCH_RESULT_DESCRIPTION_MAX_LENGTH
    )
    expect(formatted.endsWith("...")).toBe(true)
    expect(formatted).not.toBe(description)
  })
})

describe("printSearchResults", () => {
  it("prints type and description inline", async () => {
    const log = vi.spyOn(console, "log").mockImplementation(() => {})

    printSearchResults(
      {
        pagination: {
          total: 2,
          offset: 0,
          limit: 100,
          hasMore: false,
        },
        items: [
          {
            name: "button",
            type: "registry:ui",
            description: "A button component",
            registry: "@marko-ui",
          },
          {
            name: "card",
            type: "registry:ui",
            registry: "@marko-ui",
          },
        ],
      },
      {
        query: "button",
        registries: ["@marko-ui"],
      }
    )

    expect(log).toHaveBeenCalledWith(
      expect.stringContaining('Found 2 items matching "button" in @marko-ui')
    )
    expect(log).toHaveBeenCalledWith(
      expect.stringContaining("Showing 1-2 of 2")
    )
    expect(log).toHaveBeenCalledWith(
      expect.stringMatching(
        /- @marko-ui\/button \(ui\) — A button component\n- @marko-ui\/card \(ui\)$/
      )
    )

    log.mockRestore()
  })

  it("includes the type filter in the header (normalized for display)", async () => {
    const log = vi.spyOn(console, "log").mockImplementation(() => {})

    printSearchResults(
      {
        pagination: { total: 1, offset: 0, limit: 100, hasMore: false },
        items: [
          {
            name: "button",
            type: "registry:ui",
            registry: "@marko-ui",
          },
        ],
      },
      {
        // Full namespaced form on input is shown as the shorthand.
        types: ["registry:ui"],
        registries: ["@marko-ui"],
      }
    )

    expect(log).toHaveBeenCalledWith(
      expect.stringContaining("Found 1 item of type ui in @marko-ui")
    )

    log.mockRestore()
  })

  it("prints registry when searching multiple registries", async () => {
    const log = vi.spyOn(console, "log").mockImplementation(() => {})

    printSearchResults(
      {
        pagination: {
          total: 1,
          offset: 0,
          limit: 100,
          hasMore: false,
        },
        items: [
          {
            name: "header",
            type: "registry:component",
            description: "A header component",
            registry: "@custom",
          },
        ],
      },
      {
        registries: ["@marko-ui", "@custom"],
      }
    )

    expect(log).toHaveBeenCalledWith(
      expect.stringMatching(
        /- @custom\/header \(component\) · @custom — A header component/
      )
    )

    log.mockRestore()
  })

  it("prints a warning for each skipped registry", async () => {
    // Warnings are diagnostics, not results: they go to stderr so a caller
    // reading stdout gets the result and nothing else.
    const warn = vi.spyOn(console, "error").mockImplementation(() => {})

    printSearchResults(
      {
        pagination: {
          total: 1,
          offset: 0,
          limit: 100,
          hasMore: false,
        },
        items: [
          {
            name: "button",
            type: "registry:ui",
            registry: "@ok",
          },
        ],
        errors: [{ registry: "@broken", message: "Not found" }],
      },
      {
        registries: ["@ok", "@broken"],
      }
    )

    expect(warn).toHaveBeenCalledWith(
      expect.stringContaining("Skipped @broken: Not found")
    )

    warn.mockRestore()
  })

  it("prints a warning when no items are found", async () => {
    const warn = vi.spyOn(console, "error").mockImplementation(() => {})

    printSearchResults(
      {
        pagination: {
          total: 0,
          offset: 0,
          limit: 100,
          hasMore: false,
        },
        items: [],
      },
      {
        query: "missing",
        registries: ["@marko-ui"],
      }
    )

    expect(warn).toHaveBeenCalledWith(
      expect.stringContaining('No items found matching "missing" in @marko-ui')
    )

    warn.mockRestore()
  })
})

describe("resolveSearchRegistries", () => {
  it("returns explicitly provided registries unchanged", () => {
    expect(
      resolveSearchRegistries(["@one", "@two"], {
        registries: { "@marko-ui": "x/{name}.json", "@one": "y/{name}.json" },
      })
    ).toEqual(["@one", "@two"])
  })

  it("returns builtin plus configured registries when none given", () => {
    expect(
      resolveSearchRegistries([], {
        registries: {
          "@marko-ui": "x/{name}.json",
          "@one": "y/{name}.json",
          "@two": "z/{name}.json",
        },
      })
    ).toEqual(["@marko-ui", "@one", "@two"])
  })

  it("returns the builtin registry when nothing is configured", () => {
    expect(resolveSearchRegistries([], { registries: {} })).toEqual([
      "@marko-ui",
    ])
    expect(resolveSearchRegistries([], undefined)).toEqual(["@marko-ui"])
  })
})

describe("findUnknownSearchTypes", () => {
  it("accepts known types in shorthand and full form", () => {
    expect(findUnknownSearchTypes(["ui", "registry:block", "HOOK"])).toEqual([])
  })

  it("returns the unknown types", () => {
    expect(findUnknownSearchTypes(["ui", "bogus", "blok"])).toEqual([
      "bogus",
      "blok",
    ])
  })

  it("does not offer internal-only types", () => {
    expect(SEARCHABLE_TYPES).not.toContain("example")
    expect(SEARCHABLE_TYPES).not.toContain("internal")
    expect(findUnknownSearchTypes(["internal"])).toEqual(["internal"])
  })
})

describe("searchRegistries with dynamic registries", () => {
  it("forwards search params to the registry", async () => {
    const mockGetRegistry = vi.mocked(getRegistry)

    mockGetRegistry.mockResolvedValue({
      name: "acme",
      homepage: "https://acme.com",
      items: [],
    })

    await searchRegistries(["@acme"], {
      query: "button",
      types: ["ui", "registry:block"],
      limit: 20,
      offset: 40,
    })

    expect(mockGetRegistry).toHaveBeenCalledWith(
      "@acme",
      expect.objectContaining({
        searchParams: {
          query: "button",
          types: ["registry:ui", "registry:block"],
          limit: 20,
          offset: 40,
        },
      })
    )

    mockGetRegistry.mockRestore()
  })

  it("pushes down filters but not offset when searching multiple registries", async () => {
    const mockGetRegistry = vi.mocked(getRegistry)

    mockGetRegistry.mockResolvedValue({
      name: "acme",
      homepage: "https://acme.com",
      items: [],
    })

    await searchRegistries(["@one", "@two"], {
      query: "button",
      limit: 10,
      offset: 20,
    })

    // Each registry is over-fetched (offset + limit) so the requested page
    // can be filled after the merge.
    for (const registry of ["@one", "@two"]) {
      expect(mockGetRegistry).toHaveBeenCalledWith(
        registry,
        expect.objectContaining({
          searchParams: {
            query: "button",
            types: undefined,
            limit: 30,
            offset: undefined,
          },
        })
      )
    }

    mockGetRegistry.mockRestore()
  })

  it("trusts server results when a single dynamic registry is searched", async () => {
    const mockGetRegistry = vi.mocked(getRegistry)

    // The server returns items that would not match a local fuzzy search to
    // prove no local filtering is applied on top.
    mockGetRegistry.mockResolvedValue({
      name: "acme",
      homepage: "https://acme.com",
      items: [
        {
          name: "unrelated-item",
          type: "registry:ui",
          description: "Does not mention the query.",
        },
      ],
      pagination: {
        total: 500,
        offset: 10,
        limit: 1,
        hasMore: true,
      },
    })

    const results = await searchRegistries(["@acme"], {
      query: "button",
      limit: 1,
      offset: 10,
    })

    expect(results).toEqual({
      items: [
        {
          name: "unrelated-item",
          type: "ui",
          description: "Does not mention the query.",
          registry: "@acme",
        },
      ],
      pagination: {
        total: 500,
        offset: 10,
        limit: 1,
        hasMore: true,
      },
    })

    mockGetRegistry.mockRestore()
  })

  it("merges dynamic and static registries", async () => {
    const mockGetRegistry = vi.mocked(getRegistry)

    mockGetRegistry.mockImplementation(async (name: string) => {
      if (name === "@dynamic") {
        return {
          name: "dynamic",
          homepage: "https://dynamic.com",
          items: [
            {
              name: "button",
              type: "registry:ui",
              description: "A server-filtered button.",
            },
          ],
          pagination: {
            total: 42,
            offset: 0,
            limit: 1,
            hasMore: true,
          },
        }
      }
      if (name === "@static") {
        return {
          name: "static",
          homepage: "https://static.com",
          items: [
            {
              name: "button-group",
              type: "registry:ui",
              description: "A button group.",
            },
            {
              name: "card",
              type: "registry:ui",
              description: "A card component.",
            },
          ],
        }
      }
      throw new Error(`Unknown registry: ${name}`)
    })

    const results = await searchRegistries(["@dynamic", "@static"], {
      query: "button",
    })

    // Server-filtered items are kept as-is. Static items still go through
    // the local fuzzy filter, which drops "card".
    expect(results.items).toEqual([
      {
        name: "button",
        type: "ui",
        description: "A server-filtered button.",
        registry: "@dynamic",
      },
      {
        name: "button-group",
        type: "ui",
        description: "A button group.",
        registry: "@static",
      },
    ])

    // The dynamic registry's total includes matches beyond the returned
    // items. No limit was requested, so the identical request would be sent
    // again for a deeper page — the tail is unreachable and hasMore is false.
    expect(results.pagination.total).toBe(43)
    expect(results.pagination.hasMore).toBe(false)

    mockGetRegistry.mockRestore()
  })

  it("reports more pages when a dynamic registry fills the requested limit", async () => {
    const mockGetRegistry = vi.mocked(getRegistry)

    mockGetRegistry.mockImplementation(async (name: string) => {
      if (name === "@dynamic") {
        return {
          name: "dynamic",
          homepage: "https://dynamic.com",
          items: [
            { name: "button", type: "registry:ui" },
            { name: "button-group", type: "registry:ui" },
          ],
          pagination: {
            total: 42,
            offset: 0,
            limit: 2,
            hasMore: true,
          },
        }
      }
      return {
        name: "static",
        homepage: "https://static.com",
        items: [],
      }
    })

    const results = await searchRegistries(["@dynamic", "@static"], {
      query: "button",
      limit: 2,
    })

    // The registry filled the requested limit, so deeper pages re-request it
    // with a larger limit and can surface the remaining matches.
    expect(results.items).toHaveLength(2)
    expect(results.pagination.total).toBe(42)
    expect(results.pagination.hasMore).toBe(true)

    mockGetRegistry.mockRestore()
  })

  it("does not report more pages when a dynamic registry caps its response", async () => {
    const mockGetRegistry = vi.mocked(getRegistry)

    // The registry claims 500 matches but caps every response at one item,
    // regardless of the requested limit.
    mockGetRegistry.mockResolvedValue({
      name: "capped",
      homepage: "https://capped.com",
      items: [{ name: "item-0", type: "registry:ui" }],
      pagination: {
        total: 500,
        offset: 0,
        limit: 1,
        hasMore: true,
      },
    })

    const results = await searchRegistries(["@capped", "@static"], {
      limit: 5,
      offset: 10,
    })

    // The page beyond the cap is empty. hasMore must be false so paging
    // stops instead of looping through empty pages toward total.
    expect(results.items).toEqual([])
    expect(results.pagination.hasMore).toBe(false)

    mockGetRegistry.mockRestore()
  })

  it("keeps local pagination when no registry returns pagination", async () => {
    const mockGetRegistry = vi.mocked(getRegistry)

    mockGetRegistry.mockResolvedValue({
      name: "static",
      homepage: "https://static.com",
      items: [
        { name: "button", type: "registry:ui" },
        { name: "card", type: "registry:ui" },
        { name: "input", type: "registry:ui" },
      ],
    })

    const results = await searchRegistries(["@static"], {
      limit: 2,
      offset: 1,
    })

    expect(results.items.map((item) => item.name)).toEqual(["card", "input"])
    expect(results.pagination).toEqual({
      total: 3,
      offset: 1,
      limit: 2,
      hasMore: false,
    })

    mockGetRegistry.mockRestore()
  })
})

// A realistic slice of the @marko-ui registry, with the names, titles and
// descriptions the registry actually ships (packages/shadcn/ui/*/registry.meta.json).
// The relevance tests below run against this rather than toy one-word items:
// the bugs they guard (a subsequence match spread across unrelated words, a
// description-only match outranking a name match) are invisible on fixtures
// like { name: "a" }.
const REGISTRY_FIXTURE = [
  {
    name: "button",
    title: "Button",
    type: "registry:ui",
    description: "Displays a button or a component that looks like a button.",
  },
  {
    name: "button-group",
    title: "Button Group",
    type: "registry:ui",
    description:
      "A container that groups related buttons together, merging their borders and corners.",
  },
  {
    name: "calendar",
    title: "Calendar",
    type: "registry:ui",
    description:
      "An inline, always-open date field component that allows users to select a date.",
  },
  {
    name: "date-input",
    title: "Date Input",
    type: "registry:ui",
    description:
      "A segmented date input with keyboard editing and locale-aware formatting.",
  },
  {
    name: "date-picker",
    title: "Date Picker",
    type: "registry:ui",
    description:
      "A popover-style date field that combines a text input and a calendar for selecting a date.",
  },
  {
    name: "data-table",
    title: "Data Table",
    type: "registry:ui",
    description: "Powerful table and datagrids built using TanStack Table.",
  },
  {
    name: "select",
    title: "Select",
    type: "registry:ui",
    description:
      "Displays a list of options for the user to pick from, triggered by a button.",
  },
  {
    name: "aspect-ratio",
    title: "Aspect Ratio",
    type: "registry:ui",
    description: "Displays content within a desired ratio.",
  },
  {
    name: "textarea",
    title: "Textarea",
    type: "registry:ui",
    description:
      "Displays a form textarea or a component that looks like a textarea.",
  },
  {
    name: "kbd",
    title: "Kbd",
    type: "registry:ui",
    description: "Used to display textual user input from keyboard.",
  },
  {
    name: "spinner",
    title: "Spinner",
    type: "registry:ui",
    description: "An indicator that can be used to show a loading state.",
  },
  {
    name: "tooltip",
    title: "Tooltip",
    type: "registry:ui",
    description:
      "A popup that displays information related to an element when it receives keyboard focus or the mouse hovers over it.",
  },
  {
    name: "color-picker",
    title: "Color Picker",
    type: "registry:ui",
    description:
      "A color picker with a saturation area, channel sliders, channel inputs, an eyedropper and preset swatches.",
  },
  {
    name: "file-upload",
    title: "File Upload",
    type: "registry:block",
    description:
      "A dropzone and file picker for uploading files, with drag-and-drop and a list of accepted files.",
  },
  {
    name: "dropdown-menu",
    title: "Dropdown Menu",
    type: "registry:ui",
    description:
      "Displays a menu to the user — such as a set of actions or functions — triggered by a button.",
  },
  {
    name: "use-mobile",
    title: "use mobile",
    type: "registry:hook",
    description: "A hook that tracks whether the viewport is a mobile device.",
  },
]

const names = (items: { name: string }[]) => items.map((item) => item.name)

const searchFixture = (query: string, limit?: number) =>
  searchItems(REGISTRY_FIXTURE, {
    query,
    limit: limit ?? REGISTRY_FIXTURE.length,
  })

describe("tokenizeSearchText", () => {
  it("splits on separators, case insensitively", () => {
    expect(tokenizeSearchText("Date Picker")).toEqual(["date", "picker"])
    expect(tokenizeSearchText("date-picker")).toEqual(["date", "picker"])
    expect(tokenizeSearchText("use_mobile")).toEqual(["use", "mobile"])
  })

  it("keeps a camelCase query as one word", () => {
    // A query is prose someone typed, so mixed case is not a word boundary:
    // splitting it would match it against unrelated items.
    expect(tokenizeSearchText("CaLeNdAr")).toEqual(["calendar"])
    expect(tokenizeSearchText("datePicker")).toEqual(["datepicker"])
  })

  it("drops empty tokens and normalizes punctuation", () => {
    expect(tokenizeSearchText("  a — b  ")).toEqual(["a", "b"])
    expect(tokenizeSearchText("")).toEqual([])
    expect(tokenizeSearchText("   ")).toEqual([])
  })
})

describe("allowedSearchEdits", () => {
  it("allows no edits for words too short to be told apart by one", () => {
    expect(allowedSearchEdits(1)).toBe(0)
    expect(allowedSearchEdits(4)).toBe(0)
  })

  it("allows one edit for a medium word and two for a long one", () => {
    expect(allowedSearchEdits(5)).toBe(1)
    expect(allowedSearchEdits(6)).toBe(1)
    expect(allowedSearchEdits(7)).toBe(2)
    expect(allowedSearchEdits(12)).toBe(2)
  })
})

describe("search relevance", () => {
  it("returns only items that actually match the query", () => {
    expect(names(searchFixture("date"))).toEqual([
      "date-input",
      "date-picker",
      "calendar",
    ])
  })

  it("does not return items that merely contain the query as a subsequence", () => {
    const results = names(searchFixture("date"))

    // Every one of these used to come back: "date" is a subsequence spread
    // across their name or description.
    expect(results).not.toContain("textarea")
    expect(results).not.toContain("kbd")
    expect(results).not.toContain("spinner")
    expect(results).not.toContain("aspect-ratio")
    expect(results).not.toContain("tooltip")
  })

  it("does not treat a different word within typo distance as a match", () => {
    // "data" is one transposition away from "date", but it is a different
    // word: the query is too short for that to be a plausible typo.
    expect(names(searchFixture("date"))).not.toContain("data-table")
  })

  it("ranks name and title matches above description-only matches", () => {
    const results = names(searchFixture("date"))

    // calendar matches only through its description.
    expect(results.indexOf("calendar")).toBeGreaterThan(
      results.indexOf("date-picker")
    )
  })

  it("matches a word anywhere in the name, not only at the start", () => {
    // "picker" is the second word of "color-picker".
    expect(names(searchFixture("picker"))).toContain("color-picker")
  })

  it("still tolerates a truncated word in a name", () => {
    const results = names(searchFixture("butto"))

    expect(results).toEqual(["button", "button-group"])
  })

  it("does not prefix-match inside a description", () => {
    // "button" opens the description of dropdown-menu, select and others.
    // Those are whole-word matches, not prefix matches, so `butto` — a
    // prefix of "button" — must not reach them.
    const results = names(searchFixture("butto"))

    expect(results).not.toContain("dropdown-menu")
    expect(results).not.toContain("select")

    // The whole word still matches them.
    expect(names(searchFixture("button"))).toContain("dropdown-menu")
  })

  it("matches nothing for a one-character query", () => {
    // "a" opens nearly every description and prefixes half the names.
    expect(searchFixture("a")).toEqual([])
    expect(searchFixture("x")).toEqual([])
  })

  it("only lets a one-character query match a name that IS that character", () => {
    const items = [
      { name: "a", title: "A", description: "Nothing to see." },
      { name: "ab", title: "AB", description: "Nothing to see." },
      { name: "ba", title: "BA", description: "Nothing to see." },
    ]

    expect(names(searchItems(items, { query: "a" }))).toEqual(["a"])
  })

  it("drops stopwords instead of matching them", () => {
    // Every one of these appears in descriptions across the fixture; as a
    // query word they must not pull those items in or count as a match.
    for (const word of SEARCH_STOPWORDS) {
      expect(searchFixture(word)).toEqual([])
    }
  })

  it("ignores stopwords inside a longer query", () => {
    // Same ranking as the query without them, and neither adds noise.
    expect(names(searchFixture("date a picker"))).toEqual(
      names(searchFixture("date picker"))
    )
    expect(names(searchFixture("picker with a date"))).toEqual(
      names(searchFixture("picker date"))
    )
    expect(names(searchFixture("date of the picker"))).toEqual(
      names(searchFixture("date picker"))
    )
  })

  it("still matches a stopword-shaped word that is part of a real name", () => {
    // "use-mobile" is a real item: `use` is not a stopword, and searching it
    // must still find the hook.
    expect(names(searchFixture("use"))).toContain("use-mobile")
  })

  it("matches a camelCase query as the single word it is", () => {
    expect(names(searchFixture("CaLeNdAr"))).toEqual([
      "calendar",
      "date-picker",
    ])
  })

  it("tolerates a typo in a name", () => {
    expect(names(searchFixture("buton"))[0]).toBe("button")
    expect(names(searchFixture("calender"))).toEqual(["calendar"])
    expect(names(searchFixture("selct"))).toEqual(["select"])
  })

  it("does not apply typo tolerance inside a description", () => {
    // "keybord" is a typo of "keyboard", which only appears in a description.
    expect(names(searchFixture("keybord"))).toEqual([])
  })

  it("is case insensitive", () => {
    // calendar matches on its own name; date-picker only mentions a calendar
    // in its description, so it ranks below.
    expect(names(searchFixture("CALENDAR"))).toEqual([
      "calendar",
      "date-picker",
    ])
    expect(names(searchFixture("DATE PICKER"))[0]).toBe("date-picker")
  })

  it("ranks the item matching every word of a multi-word query first", () => {
    const results = names(searchFixture("date picker"))

    expect(results[0]).toBe("date-picker")
    // Items matching one of the two words are kept, ranked below.
    expect(results).toContain("date-input")
    expect(results).toContain("color-picker")
  })

  it("never returns an item matching none of the query's words", () => {
    const results = names(searchFixture("date picker"))

    expect(results).not.toContain("tooltip")
    expect(results).not.toContain("button")
    expect(results).not.toContain("spinner")
    for (const item of searchFixture("date picker")) {
      const haystack = `${item.name} ${item.title ?? ""} ${
        item.description ?? ""
      }`.toLowerCase()
      expect(haystack).toMatch(/date|picker/)
    }
  })

  it("returns nothing when no item matches", () => {
    expect(searchFixture("cryptocurrency")).toEqual([])
  })

  it("returns every item for an empty or whitespace-only query", () => {
    expect(names(searchFixture(""))).toEqual(names(REGISTRY_FIXTURE))
    expect(names(searchFixture("   "))).toEqual(names(REGISTRY_FIXTURE))
  })

  it("applies the limit after ranking", () => {
    expect(names(searchFixture("date", 2))).toEqual([
      "date-input",
      "date-picker",
    ])
  })

  it("keeps registry order for equally scored items", () => {
    const items = [
      { name: "card", title: "Card" },
      { name: "cart", title: "Cart" },
    ]

    expect(names(searchItems(items, { query: "car" }))).toEqual([
      "card",
      "cart",
    ])
  })

  it("handles items with no title and no description", () => {
    const items = [{ name: "button" }, { name: "card" }]

    expect(names(searchItems(items, { query: "card" }))).toEqual(["card"])
  })
})

describe("searchRegistries filtering, ordering and pagination", () => {
  const mockFixtureRegistry = async () => {
    const mockGetRegistry = vi.mocked(getRegistry)

    mockGetRegistry.mockResolvedValue({
      name: "@marko-ui",
      homepage: "https://marko-ui.saulo.tech",
      items: REGISTRY_FIXTURE as never,
    })

    return mockGetRegistry
  }

  it("paginates the filtered results, not the registry", async () => {
    const mockGetRegistry = await mockFixtureRegistry()

    const results = await searchRegistries(["@marko-ui"], {
      query: "date",
      limit: 2,
    })

    expect(names(results.items)).toEqual(["date-input", "date-picker"])
    expect(results.pagination).toEqual({
      total: 3,
      offset: 0,
      limit: 2,
      hasMore: true,
    })

    const nextPage = await searchRegistries(["@marko-ui"], {
      query: "date",
      limit: 2,
      offset: 2,
    })

    expect(names(nextPage.items)).toEqual(["calendar"])

    mockGetRegistry.mockRestore()
  })

  it("applies the type filter before the query", async () => {
    const mockGetRegistry = await mockFixtureRegistry()

    const results = await searchRegistries(["@marko-ui"], {
      query: "picker",
      types: ["block"],
    })

    // color-picker is a ui item; file-upload is the only block whose
    // description mentions a picker.
    expect(names(results.items)).toEqual(["file-upload"])

    mockGetRegistry.mockRestore()
  })

  it("returns an empty result set when nothing matches", async () => {
    const mockGetRegistry = await mockFixtureRegistry()

    const results = await searchRegistries(["@marko-ui"], {
      query: "cryptocurrency",
      limit: 100,
    })

    expect(results.items).toEqual([])
    expect(results.pagination).toEqual({
      total: 0,
      offset: 0,
      limit: 100,
      hasMore: false,
    })

    mockGetRegistry.mockRestore()
  })

  it("returns every item when no query is given", async () => {
    const mockGetRegistry = await mockFixtureRegistry()

    const results = await searchRegistries(["@marko-ui"], { limit: 100 })

    expect(results.items).toHaveLength(REGISTRY_FIXTURE.length)

    mockGetRegistry.mockRestore()
  })
})

describe("printSearchResults description length", () => {
  const LONG_DESCRIPTION =
    "A dashboard with sidebar, charts, data table, filters, and many other widgets for managing your application."

  const resultsWithOneItem = {
    pagination: { total: 1, offset: 0, limit: 100, hasMore: false },
    items: [
      {
        name: "dashboard",
        type: "registry:block",
        description: LONG_DESCRIPTION,
        registry: "@marko-ui",
      },
    ],
  }

  const printedOutput = (log: { mock: { calls: unknown[][] } }) =>
    log.mock.calls.map((call) => stripAnsi(String(call[0]))).join("\n")

  const withStdoutTTY = (isTTY: boolean, run: () => void) => {
    const original = process.stdout.isTTY
    process.stdout.isTTY = isTTY
    try {
      run()
    } finally {
      process.stdout.isTTY = original
    }
  }

  it("truncates long descriptions on a terminal", () => {
    const log = vi.spyOn(console, "log").mockImplementation(() => {})
    log.mockClear()

    withStdoutTTY(true, () =>
      printSearchResults(resultsWithOneItem, { registries: ["@marko-ui"] })
    )

    const output = printedOutput(log)
    expect(output).toContain("...")
    expect(output).not.toContain(LONG_DESCRIPTION)
    // The item line itself is capped, not the whole block of output.
    const itemLine = output
      .split("\n")
      .find((line) => line.includes("@marko-ui/dashboard"))
    expect(itemLine?.length).toBeLessThan(LONG_DESCRIPTION.length)

    log.mockRestore()
  })

  it("prints the whole description when stdout is not a terminal", () => {
    const log = vi.spyOn(console, "log").mockImplementation(() => {})
    log.mockClear()

    withStdoutTTY(false, () =>
      printSearchResults(resultsWithOneItem, { registries: ["@marko-ui"] })
    )

    const output = printedOutput(log)
    expect(output).toContain(LONG_DESCRIPTION)
    expect(output).not.toContain("...")

    log.mockRestore()
  })

  it("normalizes whitespace in a description either way", () => {
    const log = vi.spyOn(console, "log").mockImplementation(() => {})
    log.mockClear()

    withStdoutTTY(false, () =>
      printSearchResults(
        {
          pagination: { total: 1, offset: 0, limit: 100, hasMore: false },
          items: [
            {
              name: "dashboard",
              type: "registry:block",
              description: "A   dashboard\nwith charts.",
              registry: "@marko-ui",
            },
          ],
        },
        { registries: ["@marko-ui"] }
      )
    )

    expect(printedOutput(log)).toContain("A dashboard with charts.")

    log.mockRestore()
  })
})

function stripAnsi(value: string) {
  return value.replace(/\[[0-9;]*m/g, "")
}
