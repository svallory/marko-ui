import { getShadcnRegistryIndex } from "@/src/registry/api"
import { RegistryErrorCode } from "@/src/registry/errors"
import { resetJsonMode } from "@/src/utils/output-mode"
import { stripVTControlCharacters } from "node:util"
import { afterAll, afterEach, beforeEach, describe, expect, it, vi } from "vitest"

import { docs } from "./docs"

vi.mock("@/src/registry/api", () => ({
  getShadcnRegistryIndex: vi.fn(),
}))

const INDEX = [
  { name: "button", type: "registry:ui", description: "A button." },
  { name: "button-group", type: "registry:ui", description: "A group." },
  { name: "dialog", type: "registry:ui", description: "A dialog." },
  { name: "theme-vega", type: "registry:theme", description: "A theme." },
]

/**
 * handleError is deliberately NOT mocked. The real one is what writes the
 * human block or the JSON envelope, and it ends in process.exit — which the
 * spy below turns into a thrown "process.exit:N". A failing command
 * therefore rejects with that marker, and the captured streams hold exactly
 * what a real invocation prints. Replacing handleError would test nothing
 * about the contract these cases exist to pin.
 */
const exitSpy = vi.spyOn(process, "exit").mockImplementation((code) => {
  throw new Error(`process.exit:${code}`)
})

/** Stub the docs site: `status` per URL, `body` for the ones that resolve. */
function stubDocs(
  responses: Record<string, { status: number; body?: string }>
) {
  vi.stubGlobal(
    "fetch",
    vi.fn(async (url: string) => {
      const response = responses[url]
      if (!response || response.status >= 400) {
        return { ok: false, status: response?.status ?? 404 }
      }
      return {
        ok: true,
        status: response.status,
        text: async () => response.body ?? "# docs",
      }
    })
  )
}

/** Capture what the command wrote, ANSI-stripped (see handle-error.test.ts). */
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

/** Invoke the command and require it to fail, capturing its output. */
async function runFailing(args: string[]) {
  const streams = capture()
  let rejected: unknown
  try {
    await docs.parseAsync(args, { from: "user" })
  } catch (error) {
    rejected = error
  }
  const result = {
    stdout: streams.stdout,
    stderr: streams.stderr,
    exitCode:
      rejected instanceof Error
        ? Number(/^process\.exit:(\d+)$/.exec(rejected.message)?.[1])
        : undefined,
  }
  streams.restore()
  return result
}

describe("docs command: unknown component", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    resetJsonMode()
    vi.mocked(getShadcnRegistryIndex).mockResolvedValue(INDEX as never)
    // Both candidate URLs 404.
    stubDocs({})
  })

  afterEach(() => {
    vi.unstubAllGlobals()
    resetJsonMode()
  })

  afterAll(() => {
    exitSpy.mockRestore()
  })

  it("exits 1 and prints nothing on stdout in human mode", async () => {
    const { stdout, stderr, exitCode } = await runFailing(["buton"])

    expect(exitCode).toBe(1)
    expect(stdout).toBe("")
    expect(stderr).toContain(`Error [${RegistryErrorCode.NOT_FOUND}]`)
    expect(stderr).toContain("buton")
    expect(stderr).not.toContain("Something went wrong")
  })

  it("names the closest documented components", async () => {
    const { stderr } = await runFailing(["buton"])

    expect(stderr).toContain("Similar registry items")
    expect(stderr).toContain("button")
    expect(stderr).toContain(`marko-ui docs button`)
  })

  it("emits one marko-ui/error envelope on stdout with --json", async () => {
    const { stdout, stderr, exitCode } = await runFailing(["buton", "--json"])

    expect(exitCode).toBe(1)
    expect(stderr).toBe("")
    const parsed = JSON.parse(stdout)
    expect(parsed.$type).toBe("marko-ui/error")
    expect(parsed.version).toBe(1)
    expect(parsed.ok).toBe(false)
    expect(parsed.error.code).toBe(RegistryErrorCode.NOT_FOUND)
    expect(parsed.error.message).toContain("buton")
    expect(parsed.error.details.status).toBe(404)
    expect(parsed.error.details.missing).toEqual(["buton"])
    expect(parsed.error.details.suggestions).toContain("button")
  })

  it("falls back to the second URL shape before failing", async () => {
    vi.mocked(fetch).mockClear()
    stubDocs({
      "https://marko-ui.saulo.tech/docs/components/dialog/md": {
        status: 200,
        body: "# Dialog",
      },
    })

    const streams = capture()
    await docs.parseAsync(["dialog"], { from: "user" })
    const { stdout } = streams
    streams.restore()

    expect(stdout).toContain("# Dialog")
    expect(vi.mocked(fetch).mock.calls.length).toBe(2)
  })

  it("reports a non-404 status as a fetch error and still exits 1", async () => {
    // An HTTP error status from a REACHABLE server keeps the exit code docs
    // had before the error contract (1); only a connection failure is 4.
    stubDocs({
      "https://marko-ui.saulo.tech/docs/components/dialog.md": { status: 503 },
      "https://marko-ui.saulo.tech/docs/components/dialog/md": {
        status: 503,
      },
    })

    const { stdout, exitCode } = await runFailing(["dialog", "--json"])
    const parsed = JSON.parse(stdout)

    expect(exitCode).toBe(1)
    expect(parsed.error.code).toBe(RegistryErrorCode.FETCH_ERROR)
    expect(parsed.error.details.status).toBe(503)
  })

  it("maps a thrown fetch to NETWORK_ERROR with exit 4", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => {
        throw new TypeError("fetch failed")
      })
    )

    const { stdout, exitCode } = await runFailing(["dialog", "--json"])
    const parsed = JSON.parse(stdout)

    expect(exitCode).toBe(4)
    expect(parsed.error.code).toBe(RegistryErrorCode.NETWORK_ERROR)
    expect(parsed.error.message).toContain("Could not reach")
  })

  it("still prints the pages that resolved when another name misses", async () => {
    // A partial failure must not suppress the results that succeeded.
    stubDocs({
      "https://marko-ui.saulo.tech/docs/components/button.md": {
        status: 200,
        body: "# Button",
      },
    })

    const streams = capture()
    let rejected: Error | undefined
    try {
      await docs.parseAsync(["nope", "button", "--json"], { from: "user" })
    } catch (error) {
      rejected = error as Error
    }
    const { stdout } = streams
    streams.restore()

    expect(rejected?.message).toBe("process.exit:1")
    // button's markdown was served: it is on stdout before the envelope.
    expect(stdout).toContain("# Button")
    const parsed = JSON.parse(stdout.slice(stdout.indexOf("{")))
    expect(parsed.error.details.missing).toEqual(["nope"])
  })

  it("does not turn a suggestion lookup failure into a different error", async () => {
    // The index is unreachable, so there are no candidates to suggest — the
    // failure must still be the 404 it actually is, not a network error.
    vi.mocked(getShadcnRegistryIndex).mockRejectedValue(new Error("no index"))

    const { stdout } = await runFailing(["buton", "--json"])
    const parsed = JSON.parse(stdout)

    expect(parsed.error.code).toBe(RegistryErrorCode.NOT_FOUND)
    expect(parsed.error.details.suggestions).toBeUndefined()
    expect(typeof parsed.error.suggestion).toBe("string")
  })
})

describe("docs command: success output is unchanged", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    resetJsonMode()
  })

  afterEach(() => {
    vi.unstubAllGlobals()
    resetJsonMode()
  })

  it("emits the docs list envelope on stdout and does not exit", async () => {
    vi.mocked(getShadcnRegistryIndex).mockResolvedValue(INDEX as never)

    const streams = capture()
    await docs.parseAsync(["--list", "--json"], { from: "user" })
    const { stdout } = streams
    streams.restore()

    const parsed = JSON.parse(stdout)
    expect(parsed.$type).toBe("marko-ui/docs.list")
    expect(parsed.ok).toBe(true)
    // Non-ui items stay out of the documented list.
    expect(parsed.data.components.map((c: { name: string }) => c.name)).toEqual([
      "button",
      "button-group",
      "dialog",
    ])
  })
})