import { describe, expect, it } from "vitest"

import {
  rawConfigSchema,
  registryChunkSchema,
  registryConfigSchema,
  registrySchema,
} from "./schema"

const baseRawConfig = {
  style: "default",
  tailwind: {
    css: "src/styles/globals.css",
    baseColor: "neutral",
    cssVariables: true,
  },
  aliases: {
    components: "@/components",
    utils: "@/lib/utils",
  },
}

describe("rawConfigSchema distribution field", () => {
  it("is undefined when omitted (getConfig fills the copy default)", () => {
    const config = rawConfigSchema.parse(baseRawConfig)
    expect(config.distribution).toBeUndefined()
  })

  it("accepts import", () => {
    const config = rawConfigSchema.parse({
      ...baseRawConfig,
      distribution: "import",
    })
    expect(config.distribution).toBe("import")
  })

  it("rejects an invalid distribution value", () => {
    expect(() =>
      rawConfigSchema.parse({
        ...baseRawConfig,
        distribution: "vendor",
      })
    ).toThrow()
  })
})

describe("registryConfigSchema", () => {
  it("should accept valid registry names starting with @", () => {
    const validConfig = {
      "@v0": "https://v0.dev/{name}.json",
      "@acme": {
        url: "https://acme.com/{name}.json",
        headers: {
          Authorization: "Bearer token",
        },
      },
    }

    const result = registryConfigSchema.safeParse(validConfig)
    expect(result.success).toBe(true)
  })

  it("should reject registry names not starting with @", () => {
    const invalidConfig = {
      v0: "https://v0.dev/{name}.json",
      acme: "https://acme.com/{name}.json",
    }

    const result = registryConfigSchema.safeParse(invalidConfig)
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.errors[0].message).toContain(
        "Registry names must start with @"
      )
    }
  })

  it("should reject URLs without {name} placeholder", () => {
    const invalidConfig = {
      "@v0": "https://v0.dev/component.json",
    }

    const result = registryConfigSchema.safeParse(invalidConfig)
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.errors[0].message).toContain(
        "Registry URL must include {name} placeholder"
      )
    }
  })
})

describe("registrySchema", () => {
  it("should accept registry chunks with includes", () => {
    const result = registryChunkSchema.safeParse({
      include: ["./registry/ui/registry.json"],
    })

    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.items).toEqual([])
    }
  })

  it("should require name and homepage for root registries", () => {
    const result = registrySchema.safeParse({
      include: ["./registry/ui/registry.json"],
    })

    expect(result.success).toBe(false)
  })

  it("should reject registries without items or include", () => {
    const result = registryChunkSchema.safeParse({
      name: "example",
      homepage: "https://example.com",
    })

    expect(result.success).toBe(false)
  })

  it("should accept registries with pagination", () => {
    const result = registrySchema.safeParse({
      name: "example",
      homepage: "https://example.com",
      items: [{ name: "button", type: "registry:ui" }],
      pagination: {
        total: 100,
        offset: 0,
        limit: 1,
        hasMore: true,
      },
    })

    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.pagination).toEqual({
        total: 100,
        offset: 0,
        limit: 1,
        hasMore: true,
      })
    }
  })

  it("should accept registries without pagination", () => {
    const result = registrySchema.safeParse({
      name: "example",
      homepage: "https://example.com",
      items: [{ name: "button", type: "registry:ui" }],
    })

    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.pagination).toBeUndefined()
    }
  })

  it("should reject registries with invalid pagination", () => {
    const result = registrySchema.safeParse({
      name: "example",
      homepage: "https://example.com",
      items: [{ name: "button", type: "registry:ui" }],
      pagination: {
        total: "100",
      },
    })

    expect(result.success).toBe(false)
  })
})
