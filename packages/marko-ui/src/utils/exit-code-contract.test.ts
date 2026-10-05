import { describe, expect, it } from "vitest"

import {
  ConfigMissingError,
  RegistryError,
  RegistryErrorCode,
  RegistryFetchError,
  RegistryForbiddenError,
  RegistryGoneError,
  RegistryItemNotFoundError,
  RegistryLocalFileError,
  RegistryNotConfiguredError,
  RegistryNotFoundError,
  RegistryParseError,
  RegistryUnauthorizedError,
} from "@/src/registry/errors"
import { exitCodeForCode } from "@/src/utils/error-contract"
import { z } from "zod"
import { CommandError, normalizeError, parseOptions } from "@/src/utils/handle-error"

/**
 * The exit-code contract, as one invariant: the code USAGE_ERROR and exit 2
 * mean the same thing, always. A CommandError used to default to code
 * USAGE_ERROR with exit 1, so `search` with no registry advertised "usage
 * error" and exited like an ordinary failure while the manifest promised 2.
 */

const ALL_CODES = Object.values(RegistryErrorCode)

/** Every kind of error the suite can construct, normalized the way handleError does. */
function constructibleErrors(): [string, unknown][] {
  const url = "http://x/r/a.json"
  return [
    ...ALL_CODES.map((code): [string, unknown] => [`CommandError ${code}`, new CommandError("m", { code })]),
    ...[400, 401, 403, 404, 410, 418, 429, 500, 502, 503, undefined].map(
      (status): [string, unknown] => [`RegistryFetchError ${status}`, new RegistryFetchError(url, status)]
    ),
    ["RegistryNotFoundError", new RegistryNotFoundError(url)],
    ["RegistryItemNotFoundError", new RegistryItemNotFoundError("x", { suggestions: ["y"] })],
    ["RegistryUnauthorizedError", new RegistryUnauthorizedError(url)],
    ["RegistryForbiddenError", new RegistryForbiddenError(url)],
    ["RegistryGoneError", new RegistryGoneError(url)],
    ["RegistryNotConfiguredError", new RegistryNotConfiguredError("@x")],
    ["RegistryLocalFileError", new RegistryLocalFileError("/x.json", new Error("e"))],
    ["RegistryParseError", new RegistryParseError("x", new Error("e"))],
    ["ConfigMissingError", new ConfigMissingError("/x")],
    ["RegistryError (no code)", new RegistryError("plain")],
    ...ALL_CODES.map((code): [string, unknown] => [`RegistryError ${code}`, new RegistryError("m", { code })]),
    ["TypeError fetch failed", Object.assign(new TypeError("fetch failed"), { cause: { code: "ECONNREFUSED" } })],
    ["plain Error", new Error("bug")],
    ["string", "boom"],
  ]
}

describe("USAGE_ERROR if and only if exit 2", () => {
  it.each(constructibleErrors())("%s", (_name, error) => {
    const { envelope, exitCode } = normalizeError(error)
    expect(envelope.error.code === RegistryErrorCode.USAGE_ERROR).toBe(exitCode === 2)
  })

  it("maps every code to exactly the exit the manifest documents", () => {
    for (const code of ALL_CODES) {
      const expected =
        code === "USAGE_ERROR" ? 2
        : code === "CHECK_FAILED" ? 3
        : code === "NETWORK_ERROR" || code === "FETCH_ERROR" ? 4
        : 1
      expect(exitCodeForCode(code), code).toBe(expected)
    }
  })
})

describe("HTTP status -> code and exit", () => {
  // 4 = the registry could not be reached or is failing; the same command may
  // succeed later. Every other status exits 1 with its own code.
  const table: [number, string, number][] = [
    [400, "REQUEST_REJECTED", 1],
    [401, "UNAUTHORIZED", 1],
    [403, "FORBIDDEN", 1],
    [404, "NOT_FOUND", 1],
    [410, "GONE", 1],
    [418, "REQUEST_REJECTED", 1],
    [429, "FETCH_ERROR", 4],
    [500, "FETCH_ERROR", 4],
    [502, "FETCH_ERROR", 4],
    [503, "FETCH_ERROR", 4],
  ]
  const fromStatus = (status: number) => {
    const url = "http://x/r/a.json"
    if (status === 401) return new RegistryUnauthorizedError(url)
    if (status === 403) return new RegistryForbiddenError(url)
    if (status === 404) return new RegistryNotFoundError(url)
    if (status === 410) return new RegistryGoneError(url)
    return new RegistryFetchError(url, status)
  }

  it.each(table)("%i -> %s, exit %i", (status, code, exit) => {
    const { envelope, exitCode } = normalizeError(fromStatus(status))
    expect(envelope.error.code).toBe(code)
    expect(exitCode).toBe(exit)
  })

  it("a fetch failure with no status at all is retryable", () => {
    const { envelope, exitCode } = normalizeError(new RegistryFetchError("http://x/r/a.json"))
    expect([envelope.error.code, exitCode]).toEqual(["FETCH_ERROR", 4])
  })

  it("a refused connection is NETWORK_ERROR, exit 4", () => {
    const refused = Object.assign(new TypeError("fetch failed"), { cause: { code: "ECONNREFUSED" } })
    const { envelope, exitCode } = normalizeError(refused)
    expect([envelope.error.code, exitCode]).toEqual(["NETWORK_ERROR", 4])
  })
})

describe("option parsing", () => {
  const schema = z.object({ distribution: z.enum(["copy", "import"]).optional(), limit: z.number() })

  it("returns parsed options", () => {
    expect(parseOptions(schema, { distribution: "copy", limit: 3 })).toEqual({ distribution: "copy", limit: 3 })
  })

  it("an invalid flag value is USAGE_ERROR, exit 2, with the offending field named", () => {
    let thrown: unknown
    try {
      parseOptions(schema, { distribution: "bogus", limit: 3 })
    } catch (error) {
      thrown = error
    }
    expect(thrown).toBeInstanceOf(CommandError)
    const { envelope, exitCode } = normalizeError(thrown)
    expect([envelope.error.code, exitCode]).toEqual(["USAGE_ERROR", 2])
    expect(JSON.stringify(envelope.error.details)).toContain("distribution")
  })
})
