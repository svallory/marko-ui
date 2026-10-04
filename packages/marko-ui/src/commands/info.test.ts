import { RegistryErrorCode } from "@/src/registry/errors"
import {
  getMonorepoTargets,
  isMonorepoRoot,
} from "@/src/utils/get-monorepo-info"
import { stripVTControlCharacters } from "node:util"
import { afterAll, afterEach, beforeEach, describe, expect, it, vi } from "vitest"

import { info } from "./info"

vi.mock("fs", async (importOriginal) => {
  const actual = await importOriginal<typeof import("fs")>()
  return {
    ...actual,
    // No components.json at the cwd: this is the monorepo-root branch.
    existsSync: vi.fn(() => false),
  }
})

vi.mock("@/src/utils/get-monorepo-info", async (importOriginal) => {
  const actual =
    await importOriginal<typeof import("@/src/utils/get-monorepo-info")>()
  return {
    ...actual,
    // Only the two filesystem probes are faked; formatMonorepoMessage stays
    // real so the human path below is asserted end to end.
    isMonorepoRoot: vi.fn(() => true),
    getMonorepoTargets: vi.fn(async () => [
      { name: "apps/web", hasConfig: false },
      { name: "apps/docs", hasConfig: true },
    ]),
  }
})

const exitSpy = vi.spyOn(process, "exit").mockImplementation((code) => {
  throw new Error(`process.exit:${code}`)
})

function capture() {
  let stdout = ""
  let stderr = ""
  const out = vi
    .spyOn(process.stdout, "write")
    .mockImplementation((chunk: unknown) => {
      stdout += String(chunk)
      return true
    })
  const log = vi.spyOn(console, "log").mockImplementation((...args) => {
    stdout += `${args.join(" ")}\n`
  })
  const err = vi.spyOn(console, "error").mockImplementation((...args) => {
    stderr += `${args.join(" ")}\n`
  })
  return {
    get stdout() {
      return stripVTControlCharacters(stdout)
    },
    get stderr() {
      return stripVTControlCharacters(stderr)
    },
    restore() {
      out.mockRestore()
      log.mockRestore()
      err.mockRestore()
    },
  }
}

async function runStatus(args: string[]) {
  const streams = capture()
  let exitCode: number | undefined
  try {
    await info.parseAsync(args, { from: "user" })
  } catch (error) {
    if (error instanceof Error) {
      exitCode = Number(/^process\.exit:(\d+)$/.exec(error.message)?.[1])
    }
  }
  const result = { stdout: streams.stdout, stderr: streams.stderr, exitCode }
  streams.restore()
  return result
}

describe("status --json at a monorepo root", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  afterAll(() => {
    exitSpy.mockRestore()
  })

  it("replaces the ad-hoc object with the standard error envelope", async () => {
    const { stdout, exitCode } = await runStatus([
      "--cwd",
      "/repo",
      "--json",
    ])

    expect(exitCode).toBe(1)
    const parsed = JSON.parse(stdout)
    expect(parsed.$type).toBe("marko-ui/error")
    expect(parsed.version).toBe(1)
    expect(parsed.ok).toBe(false)
    expect(parsed.error.code).toBe(RegistryErrorCode.MONOREPO_ROOT)
    expect(parsed.error.message).toContain("monorepo root")
    expect(typeof parsed.error.suggestion).toBe("string")
  })

  it("puts the workspace targets in details, not beside the envelope", async () => {
    const { stdout } = await runStatus(["--cwd", "/repo", "--json"])
    const parsed = JSON.parse(stdout)

    expect(parsed.error.details.targets).toEqual(["apps/web", "apps/docs"])
    expect(parsed.error.details.cwd).toBe("/repo")
    // The old shape put these at the top level.
    expect(parsed.targets).toBeUndefined()
    expect(parsed.message).toBeUndefined()
  })

  it("emits nothing on stderr in --json mode", async () => {
    const { stderr } = await runStatus(["--cwd", "/repo", "--json"])
    expect(stderr).toBe("")
  })

  it("keeps the human path on stderr and leaves stdout empty", async () => {
    const { stdout, stderr, exitCode } = await runStatus(["--cwd", "/repo"])

    expect(exitCode).toBe(1)
    expect(stdout).toBe("")
    expect(stderr).toContain("monorepo root")
    // The formatter's per-workspace guidance, including the -c example.
    expect(stderr).toContain("apps/web")
    expect(stderr).toContain("marko-ui status -c apps/web")
  })

  it("never names another CLI in the monorepo guidance", async () => {
    const { stdout, stderr } = await runStatus(["--cwd", "/repo"])
    expect(`${stdout}${stderr}`).not.toContain("shadcn")
  })

  it("checks both monorepo signals before reporting", async () => {
    await runStatus(["--cwd", "/repo", "--json"])
    expect(isMonorepoRoot).toHaveBeenCalledWith("/repo")
    expect(getMonorepoTargets).toHaveBeenCalledWith("/repo")
  })
})