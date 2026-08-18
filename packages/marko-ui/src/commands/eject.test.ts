import { mkdirSync, mkdtempSync, readFileSync, writeFileSync } from "fs"
import { tmpdir } from "os"
import path from "path"
import { beforeEach, describe, expect, it, vi } from "vitest"

const { mockGetShadcnRegistryIndex } = vi.hoisted(() => ({
  mockGetShadcnRegistryIndex: vi.fn(),
}))

vi.mock("@/src/registry/api", () => ({
  getShadcnRegistryIndex: mockGetShadcnRegistryIndex,
}))

import { findImportedComponents, setDistribution } from "./eject"

function scaffoldCoreInstall(names: string[]) {
  const dir = mkdtempSync(path.join(tmpdir(), "marko-ui-eject-"))
  const uiDir = path.join(dir, "node_modules", "@marko-ui", "core", "ui")
  mkdirSync(uiDir, { recursive: true })
  for (const name of names) {
    mkdirSync(path.join(uiDir, name), { recursive: true })
  }
  return dir
}

describe("findImportedComponents", () => {
  beforeEach(() => {
    mockGetShadcnRegistryIndex.mockReset()
  })

  it("returns nothing when @marko-ui/core is not installed", async () => {
    const dir = mkdtempSync(path.join(tmpdir(), "marko-ui-eject-empty-"))
    mockGetShadcnRegistryIndex.mockResolvedValue([])

    const result = await findImportedComponents(dir)

    expect(result).toEqual([])
  })

  it("lists installed component directory names, filtered against the registry index", async () => {
    const dir = scaffoldCoreInstall(["button", "card", "not-a-real-component"])
    mockGetShadcnRegistryIndex.mockResolvedValue([
      { name: "button", type: "registry:ui" },
      { name: "card", type: "registry:ui" },
    ])

    const result = await findImportedComponents(dir)

    expect(result.sort()).toEqual(["button", "card"])
  })

  it("falls back to the raw directory listing when the registry is unreachable", async () => {
    const dir = scaffoldCoreInstall(["button", "card"])
    mockGetShadcnRegistryIndex.mockRejectedValue(new Error("network down"))

    const result = await findImportedComponents(dir)

    expect(result.sort()).toEqual(["button", "card"])
  })
})

describe("setDistribution", () => {
  it("rewrites components.json's distribution field", async () => {
    const dir = mkdtempSync(path.join(tmpdir(), "marko-ui-eject-config-"))
    const componentsJsonPath = path.join(dir, "components.json")
    writeFileSync(
      componentsJsonPath,
      JSON.stringify({ style: "default", distribution: "import" }, null, 2)
    )

    await setDistribution(dir, "copy")

    const written = JSON.parse(readFileSync(componentsJsonPath, "utf8"))
    expect(written.distribution).toBe("copy")
    expect(written.style).toBe("default")
  })

  it("no-ops when components.json does not exist", async () => {
    const dir = mkdtempSync(path.join(tmpdir(), "marko-ui-eject-noconfig-"))
    await expect(setDistribution(dir, "copy")).resolves.toBeUndefined()
  })
})
