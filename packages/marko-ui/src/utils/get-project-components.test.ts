import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "fs"
import { tmpdir } from "os"
import path from "path"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

const registryIndex = vi.hoisted(() => vi.fn())

vi.mock("@/src/registry/api", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@/src/registry/api")>()),
  getShadcnRegistryIndex: registryIndex,
}))

import { getProjectComponents } from "./get-project-info"

let root: string

beforeEach(() => {
  root = mkdtempSync(path.join(tmpdir(), "project-components-"))
  writeFileSync(
    path.join(root, "components.json"),
    JSON.stringify({
      style: "default",
      tailwind: { config: "", css: "src/styles/globals.css", baseColor: "neutral", cssVariables: true },
      aliases: { components: "@/components", utils: "@/lib/utils", ui: "@/components/ui" },
    })
  )
  writeFileSync(
    path.join(root, "tsconfig.json"),
    JSON.stringify({ compilerOptions: { baseUrl: ".", paths: { "@/*": ["./src/*"] } } })
  )
  for (const dir of ["button", "card", "my-own-folder"]) {
    mkdirSync(path.join(root, "src/components/ui", dir), { recursive: true })
  }
  writeFileSync(path.join(root, "src/components/ui/badge.marko"), "")
})

afterEach(() => {
  rmSync(root, { recursive: true, force: true })
  registryIndex.mockReset()
})

describe("getProjectComponents", () => {
  it("keeps only directory and file names the registry knows", async () => {
    registryIndex.mockResolvedValue([{ name: "button" }, { name: "card" }, { name: "badge" }])
    expect((await getProjectComponents(root)).sort()).toEqual(["badge", "button", "card"])
  })

  it("degrades to every on-disk name when the registry is unreachable", async () => {
    registryIndex.mockRejectedValue(new Error("fetch failed"))
    expect((await getProjectComponents(root)).sort()).toEqual([
      "badge",
      "button",
      "card",
      "my-own-folder",
    ])
  })

  it("returns [] without a components.json", async () => {
    rmSync(path.join(root, "components.json"))
    expect(await getProjectComponents(root)).toEqual([])
    expect(registryIndex).not.toHaveBeenCalled()
  })

  it("returns [] when the ui directory does not exist", async () => {
    rmSync(path.join(root, "src/components"), { recursive: true })
    expect(await getProjectComponents(root)).toEqual([])
  })
})
