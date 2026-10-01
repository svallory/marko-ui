import { tmpdir } from "os"
import path from "path"
import fs from "fs-extra"
import { describe, expect, it } from "vitest"

import { CommandError } from "@/src/utils/handle-error"

import {
  addRegistriesToConfig,
  assertHasRegistries,
  parseRegistryArg,
} from "./add"

const plain = (s: string) => s.replace(/\u001b\[[0-9;]*m/g, "")

function usageError(run: () => void) {
  try {
    run()
  } catch (error) {
    expect(error).toBeInstanceOf(CommandError)
    expect((error as CommandError).exitCode).toBe(2)
    return plain((error as Error).message)
  }
  throw new Error("expected a usage error")
}

describe("assertHasRegistries", () => {
  // A bare `registry add` opened the picker even with nothing to answer it,
  // then exited 0 having registered nothing — so a CI or agent step calling it
  // went green having done nothing at all.
  it("exits 2 with no arguments when nothing can answer", () => {
    const text = usageError(() => assertHasRegistries([], false))
    expect(text).toContain("marko-ui registry add @namespace=url")
    expect(text).toContain("{name}")
    expect(text).toContain("marko-ui registry list")
  })

  it("lets a terminal with no arguments reach the picker", () => {
    expect(() => assertHasRegistries([], true)).not.toThrow()
  })

  it("never complains when a registry is named", () => {
    expect(() => assertHasRegistries(["@acme"], false)).not.toThrow()
    expect(() =>
      assertHasRegistries(["@acme=https://example.com/r/{name}.json"], false)
    ).not.toThrow()
  })
})

describe("parseRegistryArg", () => {
  it("should parse namespace without URL", () => {
    expect(parseRegistryArg("@magicui")).toEqual({ namespace: "@magicui" })
    expect(parseRegistryArg("@aceternity")).toEqual({
      namespace: "@aceternity",
    })
  })

  it("should parse namespace with URL", () => {
    expect(
      parseRegistryArg("@mycompany=https://example.com/r/{name}.json")
    ).toEqual({
      namespace: "@mycompany",
      url: "https://example.com/r/{name}.json",
    })
  })

  it("should handle URL with query params containing =", () => {
    expect(
      parseRegistryArg("@foo=https://example.com/r/{name}.json?token=abc")
    ).toEqual({
      namespace: "@foo",
      url: "https://example.com/r/{name}.json?token=abc",
    })
  })

  it("should handle URL with multiple = in query params", () => {
    expect(
      parseRegistryArg(
        "@bar=https://example.com/r/{name}.json?token=abc&key=xyz"
      )
    ).toEqual({
      namespace: "@bar",
      url: "https://example.com/r/{name}.json?token=abc&key=xyz",
    })
  })

  it("should handle URL with port number", () => {
    expect(
      parseRegistryArg("@local=http://localhost:8080/r/{name}.json")
    ).toEqual({
      namespace: "@local",
      url: "http://localhost:8080/r/{name}.json",
    })
  })

  it("should throw for namespace without @", () => {
    expect(() => parseRegistryArg("foo")).toThrow("must start with @")
    expect(() => parseRegistryArg("magicui")).toThrow("must start with @")
    expect(() =>
      parseRegistryArg("mycompany=https://example.com/r/{name}.json")
    ).toThrow("must start with @")
  })
})

describe("addRegistriesToConfig", () => {
  it("should write registries to components.json when it exists", async () => {
    const tempDir = await fs.mkdtemp(path.join(tmpdir(), "marko-ui-test-"))
    const componentsJsonFile = path.join(tempDir, "components.json")

    await fs.writeJson(componentsJsonFile, { style: "new-york" })

    try {
      await addRegistriesToConfig(
        ["@acme=https://acme.com/r/{name}.json"],
        tempDir,
        { silent: true }
      )

      const config = await fs.readJson(componentsJsonFile)
      expect(config).toEqual({
        style: "new-york",
        registries: {
          "@acme": "https://acme.com/r/{name}.json",
        },
      })
    } finally {
      await fs.rm(tempDir, { recursive: true })
    }
  })

  it("should prefer components.json over package.json when both exist", async () => {
    const tempDir = await fs.mkdtemp(path.join(tmpdir(), "marko-ui-test-"))
    const componentsJsonFile = path.join(tempDir, "components.json")
    const packageJsonFile = path.join(tempDir, "package.json")

    await fs.writeJson(componentsJsonFile, { style: "new-york" })
    await fs.writeJson(packageJsonFile, { name: "test-package" })

    try {
      await addRegistriesToConfig(
        ["@acme=https://acme.com/r/{name}.json"],
        tempDir,
        { silent: true }
      )

      const componentsJson = await fs.readJson(componentsJsonFile)
      const packageJson = await fs.readJson(packageJsonFile)
      expect(componentsJson.registries).toEqual({
        "@acme": "https://acme.com/r/{name}.json",
      })
      expect(packageJson.registries).toBeUndefined()
    } finally {
      await fs.rm(tempDir, { recursive: true })
    }
  })

  it("should write registries to package.json when components.json does not exist", async () => {
    const tempDir = await fs.mkdtemp(path.join(tmpdir(), "marko-ui-test-"))
    const packageJsonFile = path.join(tempDir, "package.json")

    await fs.writeJson(packageJsonFile, {
      name: "test-package",
      version: "1.0.0",
    })

    try {
      await addRegistriesToConfig(
        ["@acme=https://acme.com/r/{name}.json"],
        tempDir,
        { silent: true }
      )

      const packageJson = await fs.readJson(packageJsonFile)
      expect(packageJson).toEqual({
        name: "test-package",
        version: "1.0.0",
        registries: {
          "@acme": "https://acme.com/r/{name}.json",
        },
      })
    } finally {
      await fs.rm(tempDir, { recursive: true })
    }
  })

  it("should preserve existing registries when adding to package.json", async () => {
    const tempDir = await fs.mkdtemp(path.join(tmpdir(), "marko-ui-test-"))
    const packageJsonFile = path.join(tempDir, "package.json")

    await fs.writeJson(packageJsonFile, {
      name: "test-package",
      registries: {
        "@existing": "https://existing.com/r/{name}.json",
      },
    })

    try {
      await addRegistriesToConfig(
        ["@acme=https://acme.com/r/{name}.json"],
        tempDir,
        { silent: true }
      )

      const packageJson = await fs.readJson(packageJsonFile)
      expect(packageJson.registries).toEqual({
        "@existing": "https://existing.com/r/{name}.json",
        "@acme": "https://acme.com/r/{name}.json",
      })
    } finally {
      await fs.rm(tempDir, { recursive: true })
    }
  })

  it("should skip registries already configured in package.json", async () => {
    const tempDir = await fs.mkdtemp(path.join(tmpdir(), "marko-ui-test-"))
    const packageJsonFile = path.join(tempDir, "package.json")

    await fs.writeJson(packageJsonFile, {
      name: "test-package",
      registries: {
        "@acme": "https://existing.com/r/{name}.json",
      },
    })

    try {
      await addRegistriesToConfig(
        ["@acme=https://new.com/r/{name}.json"],
        tempDir,
        { silent: true }
      )

      const packageJson = await fs.readJson(packageJsonFile)
      expect(packageJson.registries).toEqual({
        "@acme": "https://existing.com/r/{name}.json",
      })
    } finally {
      await fs.rm(tempDir, { recursive: true })
    }
  })

  it("should throw when neither components.json nor package.json exists", async () => {
    const tempDir = await fs.mkdtemp(path.join(tmpdir(), "marko-ui-test-"))

    try {
      await expect(
        addRegistriesToConfig(
          ["@acme=https://acme.com/r/{name}.json"],
          tempDir,
          { silent: true }
        )
      ).rejects.toThrow(/No .*components\.json.* or .*package\.json.* found/)
    } finally {
      await fs.rm(tempDir, { recursive: true })
    }
  })
})

describe("addRegistriesToConfig React guard", () => {
  it("refuses to write into a shadcn/ui-for-React components.json, leaving it byte-identical", async () => {
    const tempDir = await fs.mkdtemp(path.join(tmpdir(), "marko-ui-test-"))
    const componentsJsonFile = path.join(tempDir, "components.json")
    await fs.writeJson(componentsJsonFile, {
      style: "new-york",
      registries: { "@acme": "https://acme.com/r/{name}.json" },
    })
    await fs.writeJson(path.join(tempDir, "package.json"), {
      name: "react-app",
      dependencies: { react: "^19.0.0" },
    })
    const before = await fs.readFile(componentsJsonFile, "utf8")

    try {
      await expect(
        addRegistriesToConfig(["@new=https://new.com/r/{name}.json"], tempDir, {
          silent: true,
        })
      ).rejects.toThrow(/belongs to shadcn\/ui for React/)
      expect(await fs.readFile(componentsJsonFile, "utf8")).toBe(before)
    } finally {
      await fs.rm(tempDir, { recursive: true })
    }
  })

  it("still writes registries into a Marko project's components.json", async () => {
    const tempDir = await fs.mkdtemp(path.join(tmpdir(), "marko-ui-test-"))
    const componentsJsonFile = path.join(tempDir, "components.json")
    await fs.writeJson(componentsJsonFile, { style: "new-york" })
    await fs.writeJson(path.join(tempDir, "package.json"), {
      name: "marko-app",
      dependencies: { marko: "^6.0.0" },
    })

    try {
      await addRegistriesToConfig(
        ["@acme=https://acme.com/r/{name}.json"],
        tempDir,
        { silent: true }
      )
      const config = await fs.readJson(componentsJsonFile)
      expect(config.registries).toEqual({
        "@acme": "https://acme.com/r/{name}.json",
      })
    } finally {
      await fs.rm(tempDir, { recursive: true })
    }
  })
})
