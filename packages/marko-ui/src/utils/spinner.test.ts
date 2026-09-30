import { afterEach, beforeEach, describe, expect, test, vi } from "vitest"
import { canRenderSpinner, spinner } from "@/src/utils/spinner"

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
    vi.restoreAllMocks()
  })

  test("is enabled on a TTY with a width", () => {
    process.stderr.columns = 80
    expect(spinner("x").isEnabled).toBe(true)
  })

  test("is disabled when columns is 0", () => {
    process.stderr.columns = 0
    expect(spinner("x").isEnabled).toBe(false)
  })

  test("is disabled when columns is undefined", () => {
    process.stderr.columns = undefined as unknown as number
    expect(spinner("x").isEnabled).toBe(false)
  })

  test("start/succeed on a disabled spinner return without looping", () => {
    process.stderr.columns = 0
    const s = spinner("x").start()
    expect(() => s.succeed()).not.toThrow()
  })
})
