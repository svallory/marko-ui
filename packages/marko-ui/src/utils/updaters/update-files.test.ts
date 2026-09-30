import { mkdirSync, mkdtempSync, readFileSync, writeFileSync } from "fs"
import { tmpdir } from "os"
import path from "path"
import { beforeEach, describe, expect, it, vi } from "vitest"

const { mockConfirm, mockIsInteractive } = vi.hoisted(() => ({
  mockConfirm: vi.fn(),
  mockIsInteractive: vi.fn(),
}))

vi.mock("@/src/utils/clack", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@/src/utils/clack")>()),
  confirm: mockConfirm,
}))
vi.mock("@/src/utils/interactive", () => ({ isInteractive: mockIsInteractive }))

import type { Config } from "@/src/utils/get-config"
import { updateFiles } from "./update-files"

// An existing, different file used to raise "already exists, overwrite?"
// whatever the environment, because `interactive` defaulted to true and no
// caller passed it. With no TTY that prompt can never be answered.

const setup = () => {
  const cwd = mkdtempSync(path.join(tmpdir(), "marko-ui-update-files-"))
  writeFileSync(path.join(cwd, "package.json"), "{}")
  const ui = path.join(cwd, "src/components/ui")
  mkdirSync(path.join(ui, "thing"), { recursive: true })
  const target = path.join(ui, "thing/thing.ts")
  writeFileSync(target, "// mine\n")
  const config = {
    resolvedPaths: { cwd, ui, components: path.join(cwd, "src/components"), lib: "", hooks: "" },
  } as unknown as Config
  const files = [
    { path: "ui/thing/thing.ts", type: "registry:ui", content: "// registry\n", target: "" },
  ] as never
  return { config, files, target, cwd }
}

describe("updateFiles: overwrite prompt", () => {
  beforeEach(() => {
    mockConfirm.mockReset()
    mockIsInteractive.mockReset()
  })

  it("does not prompt without a TTY, keeps the file and reports it skipped", async () => {
    mockIsInteractive.mockReturnValue(false)
    const { config, files, target } = setup()
    const result = await updateFiles(files, config, { silent: true })
    expect(mockConfirm).not.toHaveBeenCalled()
    expect(readFileSync(target, "utf8")).toBe("// mine\n")
    expect(result.filesSkipped).toEqual([path.join("src/components/ui/thing/thing.ts")])
    expect(result.filesUpdated).toEqual([])
  })

  it("prompts in an interactive terminal and overwrites on yes", async () => {
    mockIsInteractive.mockReturnValue(true)
    mockConfirm.mockResolvedValue(true)
    const { config, files, target } = setup()
    const result = await updateFiles(files, config, { silent: true })
    expect(mockConfirm).toHaveBeenCalledTimes(1)
    expect(readFileSync(target, "utf8")).toBe("// registry\n")
    expect(result.filesUpdated).toHaveLength(1)
  })

  it("prompts in an interactive terminal and keeps the file on no", async () => {
    mockIsInteractive.mockReturnValue(true)
    mockConfirm.mockResolvedValue(false)
    const { config, files, target } = setup()
    const result = await updateFiles(files, config, { silent: true })
    expect(mockConfirm).toHaveBeenCalledTimes(1)
    expect(readFileSync(target, "utf8")).toBe("// mine\n")
    expect(result.filesSkipped).toHaveLength(1)
  })

  it("an explicit interactive: false wins over an interactive terminal", async () => {
    mockIsInteractive.mockReturnValue(true)
    const { config, files, target } = setup()
    await updateFiles(files, config, { silent: true, interactive: false })
    expect(mockConfirm).not.toHaveBeenCalled()
    expect(readFileSync(target, "utf8")).toBe("// mine\n")
  })

  it("overwrite: true never prompts", async () => {
    mockIsInteractive.mockReturnValue(true)
    const { config, files, target } = setup()
    await updateFiles(files, config, { silent: true, overwrite: true })
    expect(mockConfirm).not.toHaveBeenCalled()
    expect(readFileSync(target, "utf8")).toBe("// registry\n")
  })
})
