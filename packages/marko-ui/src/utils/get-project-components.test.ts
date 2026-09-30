import { chmodSync, mkdirSync, mkdtempSync, rmSync, symlinkSync, writeFileSync } from "fs"
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
  for (const dir of ["button", "card"]) {
    mkdirSync(path.join(root, "src/components/ui", dir), { recursive: true })
    writeFileSync(path.join(root, "src/components/ui", dir, `${dir}.marko`), "")
  }
  mkdirSync(path.join(root, "src/components/ui/my-own-folder"), { recursive: true })
  writeFileSync(path.join(root, "src/components/ui/my-own-folder/notes.txt"), "")
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

  it("offline: keeps only entries holding a .marko file, not unrelated folders", async () => {
    registryIndex.mockRejectedValue(new Error("fetch failed"))
    expect((await getProjectComponents(root)).sort()).toEqual(["badge", "button", "card"])
  })

  it("offline: a symlinked component folder counts, a broken symlink does not crash", async () => {
    registryIndex.mockRejectedValue(new Error("fetch failed"))
    const ui = path.join(root, "src/components/ui")
    const real = path.join(root, "shared/dialog")
    mkdirSync(real, { recursive: true })
    writeFileSync(path.join(real, "dialog.marko"), "")
    symlinkSync(real, path.join(ui, "dialog"))
    symlinkSync(path.join(root, "nowhere"), path.join(ui, "ghost"))
    expect((await getProjectComponents(root)).sort()).toEqual(["badge", "button", "card", "dialog"])
  })

  it("offline: an unreadable component folder is skipped, not fatal", async () => {
    registryIndex.mockRejectedValue(new Error("fetch failed"))
    const locked = path.join(root, "src/components/ui/locked")
    mkdirSync(locked)
    chmodSync(locked, 0o000)
    try {
      expect(await getProjectComponents(root)).not.toContain("locked")
    } finally {
      chmodSync(locked, 0o755)
    }
  })

  it("an index passed in is used without fetching", async () => {
    expect(await getProjectComponents(root, [{ name: "card" }])).toEqual(["card"])
    expect(registryIndex).not.toHaveBeenCalled()
  })

  it("an explicit null index means offline: no fetch, disk heuristic", async () => {
    expect((await getProjectComponents(root, null)).sort()).toEqual(["badge", "button", "card"])
    expect(registryIndex).not.toHaveBeenCalled()
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
