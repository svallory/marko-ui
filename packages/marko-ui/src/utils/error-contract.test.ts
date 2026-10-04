import {
  buildErrorEnvelope,
  ERROR_ENVELOPE_TYPE,
  ERROR_ENVELOPE_VERSION,
  jsonSafe,
} from "@/src/utils/error-contract"
import { describe, expect, it } from "vitest"

describe("buildErrorEnvelope", () => {
  it("stamps the type, version and ok flag", () => {
    expect(buildErrorEnvelope({ code: "X", message: "m" })).toEqual({
      $type: ERROR_ENVELOPE_TYPE,
      version: ERROR_ENVELOPE_VERSION,
      ok: false,
      error: { code: "X", message: "m" },
    })
  })

  it("omits an absent suggestion rather than emitting null", () => {
    const envelope = buildErrorEnvelope({ code: "X", message: "m" })
    expect("suggestion" in envelope.error).toBe(false)
  })

  it("omits empty details but keeps non-empty ones", () => {
    expect(
      "details" in buildErrorEnvelope({ code: "X", message: "m", details: {} })
        .error
    ).toBe(false)
    expect(
      buildErrorEnvelope({ code: "X", message: "m", details: { a: 1 } }).error
        .details
    ).toEqual({ a: 1 })
  })
})

describe("jsonSafe", () => {
  it("passes primitives through", () => {
    expect(jsonSafe("s")).toBe("s")
    expect(jsonSafe(1)).toBe(1)
    expect(jsonSafe(true)).toBe(true)
    expect(jsonSafe(null)).toBe(null)
  })

  it("drops values JSON cannot represent", () => {
    expect(jsonSafe(undefined)).toBeUndefined()
    expect(jsonSafe(() => {})).toBeUndefined()
    expect(jsonSafe(Symbol("s"))).toBeUndefined()
    expect(jsonSafe({ keep: 1, drop: () => {} })).toEqual({ keep: 1 })
  })

  it("serializes a bigint as a string rather than throwing", () => {
    expect(jsonSafe(10n)).toBe("10")
  })

  it("serializes a Date as ISO", () => {
    expect(jsonSafe(new Date("2026-01-02T03:04:05.000Z"))).toBe(
      "2026-01-02T03:04:05.000Z"
    )
  })

  it("reduces an Error to name and message", () => {
    expect(jsonSafe(new TypeError("nope"))).toEqual({
      name: "TypeError",
      message: "nope",
    })
  })

  it("replaces a cycle instead of overflowing the stack", () => {
    const cyclic: Record<string, unknown> = { name: "a" }
    cyclic.self = cyclic

    expect(jsonSafe(cyclic)).toEqual({ name: "a", self: "[circular]" })
  })

  it("keeps arrays as arrays, using null for dropped entries", () => {
    expect(jsonSafe([1, undefined, "two"])).toEqual([1, null, "two"])
  })

  it("is deeply json-safe", () => {
    const value = jsonSafe({
      fn: () => {},
      nested: { when: new Date(0), list: [{ x: undefined, y: 1 }] },
    })
    expect(() => JSON.stringify(value)).not.toThrow()
  })
})