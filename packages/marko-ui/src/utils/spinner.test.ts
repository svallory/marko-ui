import { afterEach, beforeEach, describe, expect, test, vi } from "vitest"
import { resetJsonMode, setJsonMode } from "@/src/utils/output-mode"
import { canRenderSpinner, spinner } from "@/src/utils/spinner"

// ora exposes `isEnabled` at runtime but omits it from its typings.
const enabled = (text: string) =>
  (spinner(text) as unknown as { isEnabled?: boolean }).isEnabled === true

/** A non-TTY stream that records everything written to it. */
function recordingStream() {
  const chunks: string[] = []
  return {
    isTTY: false,
    columns: undefined,
    write: (chunk: string) => {
      chunks.push(chunk)
      return true
    },
    get text() {
      return chunks.join("")
    },
  }
}

// ora draws to stderr and redraws by counting wrapped lines from `columns`.
// With columns 0 (a 0x0 pty) that count never terminates, so the spinner must
// be off there.

describe("canRenderSpinner", () => {
  test("is true for a positive width", () => {
    expect(canRenderSpinner({ columns: 80 })).toBe(true)
  })

  test("is false for 0 columns", () => {
    expect(canRenderSpinner({ columns: 0 })).toBe(false)
  })

  test("is false when columns is undefined", () => {
    expect(canRenderSpinner({})).toBe(false)
  })
})

describe("spinner", () => {
  const original = {
    isTTY: process.stderr.isTTY,
    columns: process.stderr.columns,
    CI: process.env.CI,
    TERM: process.env.TERM,
  }

  beforeEach(() => {
    // Make ora's own TTY detection say yes, so only `columns` decides.
    process.stderr.isTTY = true
    delete process.env.CI
    process.env.TERM = "xterm"
  })

  afterEach(() => {
    process.stderr.isTTY = original.isTTY
    process.stderr.columns = original.columns
    if (original.CI === undefined) delete process.env.CI
    else process.env.CI = original.CI
    if (original.TERM === undefined) delete process.env.TERM
    else process.env.TERM = original.TERM
    resetJsonMode()
    vi.restoreAllMocks()
  })

  test("is enabled on a TTY with a width", () => {
    process.stderr.columns = 80
    expect(enabled("x")).toBe(true)
  })

  test("is not the animated spinner when columns is 0", () => {
    process.stderr.columns = 0
    expect(enabled("x")).toBe(false)
  })

  test("is not the animated spinner when columns is undefined", () => {
    process.stderr.columns = undefined as unknown as number
    expect(enabled("x")).toBe(false)
  })

  test("start/succeed on a disabled spinner return without looping", () => {
    process.stderr.columns = 0
    const s = spinner("x").start()
    expect(() => s.succeed()).not.toThrow()
  })
})

// The doubled output this replaced: ora with isEnabled:false still wrote the
// "- text" line at start() and the "✔ text" line at succeed(), so every step
// of `add` appeared twice in a log.
describe("spinner on a non-TTY stream", () => {
  afterEach(() => {
    resetJsonMode()
  })

  test("writes the step exactly once, at its final state", () => {
    const stream = recordingStream()
    spinner("Checking registry.", { stream }).start().succeed()

    expect(stream.text).toBe("✔ Checking registry.\n")
  })

  test("writes nothing at start, and nothing more after it is done", () => {
    const stream = recordingStream()
    const s = spinner("Updating files.", { stream })
    s.start()
    expect(stream.text).toBe("")

    s.succeed()
    s.stop()
    s.succeed("again")
    expect(stream.text).toBe("✔ Updating files.\n")
  })

  test("prints the final text given to succeed()", () => {
    const stream = recordingStream()
    spinner("Adding component.", { stream })
      .start()
      .succeed("Added button.")
    expect(stream.text).toBe("✔ Added button.\n")
  })

  test("a failure prints one line, with the failure glyph", () => {
    const stream = recordingStream()
    spinner("Installing.", { stream }).start().fail()
    expect(stream.text).toBe("✖ Installing.\n")
  })

  test("stop() prints one line, with the neutral glyph", () => {
    const stream = recordingStream()
    spinner("No files updated.", { stream }).start().stop()
    expect(stream.text).toBe("- No files updated.\n")
  })

  test("writes nothing at all in --json mode", () => {
    const stream = recordingStream()
    setJsonMode(true)
    const s = spinner("Adding component.", { stream }).start()
    s.succeed()
    expect(stream.text).toBe("")
  })

  test("writes nothing at all with silent: true", () => {
    const stream = recordingStream()
    const s = spinner("Adding component.", { stream, silent: true }).start()
    s.succeed()
    expect(stream.text).toBe("")
  })
})
