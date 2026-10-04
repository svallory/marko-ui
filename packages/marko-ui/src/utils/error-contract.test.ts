import {
  buildErrorEnvelope,
  ERROR_ENVELOPE_TYPE,
  ERROR_ENVELOPE_VERSION,
  jsonSafe,
  redactUrl,
  scrubUrlsInText,
} from "@/src/utils/error-contract"
import { describe, expect, it } from "vitest"

describe("redactUrl", () => {
  it("drops userinfo and the query string", () => {
    expect(redactUrl("https://user:pass@host.example/r?token=sk-1")).toBe(
      "https://host.example/r"
    )
  })

  it("keeps the host and path, which identify which registry failed", () => {
    expect(redactUrl("https://registry.example/r/styles/nova/button.json")).toBe(
      "https://registry.example/r/styles/nova/button.json"
    )
  })

  it("falls back to a textual scrub for an unparseable URL", () => {
    expect(redactUrl("not a url?token=sk-1")).toBe("not a url")
    expect(redactUrl("//user:pass@host/x")).toBe("//host/x")
  })
})

describe("scrubUrlsInText", () => {
  const TOKEN = "sk-planted-zzz"

  it("redacts a URL embedded in a sentence", () => {
    const text = scrubUrlsInText(
      `Request cannot be constructed from a URL that includes credentials: https://user:pass@host.example/r?token=${TOKEN}`
    )
    expect(text).not.toContain(TOKEN)
    expect(text).not.toContain("pass@")
    // The surrounding prose survives.
    expect(text).toContain("Request cannot be constructed")
  })

  it("stops at sentence punctuation", () => {
    expect(
      scrubUrlsInText(`Could not reach https://u:p@host.example/r?token=${TOKEN} (retry).`)
    ).toBe("Could not reach https://host.example/r (retry).")
  })

  it("leaves text with no URL alone", () => {
    expect(scrubUrlsInText("nothing to redact here")).toBe(
      "nothing to redact here"
    )
  })

  it("scrubs several URLs in one string", () => {
    const out = scrubUrlsInText(`a https://u:p@h1/r?t=${TOKEN} b https://u:p@h2/r`)
    expect(out).not.toContain(TOKEN)
    expect(out).toContain("h1/r")
    expect(out).toContain("h2/r")
  })
})

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

  it("scrubs a credential out of the message itself", () => {
    // The message reaches both stderr and stdout, so it is cleaned at the
    // one choke point every error passes through.
    const envelope = buildErrorEnvelope({
      code: "NETWORK_ERROR",
      message: "Could not reach https://user:pass@host.example/r?token=sk-planted-zzz",
    })
    expect(envelope.error.message).not.toContain("sk-planted-zzz")
    expect(envelope.error.message).not.toContain("pass@")
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