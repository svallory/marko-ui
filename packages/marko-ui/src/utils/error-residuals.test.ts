import fs from "fs-extra"
import os from "node:os"
import path from "node:path"
import { RegistryErrorCode } from "@/src/registry/errors"
import {
  asComponentsJsonError,
  asTlsError,
  looksLikeTlsFailure,
  scrubPathsInText,
} from "@/src/utils/error-contract"
import { normalizeError } from "@/src/utils/handle-error"
import { getConfig } from "@/src/utils/get-config"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import { z } from "zod"

/**
 * Findings from the round-3 review of the error contract, closed here.
 *
 * The common shape of all of them: a condition the CLI could classify said
 * something the user can neither trust nor act on — a "please open an issue on
 * GitHub" for their own typo, an absolute path naming their home directory,
 * or "retry" for a misconfiguration retrying cannot fix.
 */

let dir: string

beforeEach(() => {
  dir = fs.mkdtempSync(path.join(os.tmpdir(), "marko-ui-config-"))
})

afterEach(() => {
  fs.removeSync(dir)
  vi.restoreAllMocks()
})

describe("a malformed components.json", () => {
  it("is INVALID_CONFIG, not an unexpected CLI bug", async () => {
    fs.writeFileSync(path.join(dir, "components.json"), "{ not json")

    const error = await getConfig(dir).catch((thrown: unknown) => thrown)
    const normalized = normalizeError(error)

    expect(normalized.envelope.error.code).toBe(RegistryErrorCode.INVALID_CONFIG)
    // The boilerplate is printed only for `unexpected`, and it is what told
    // users to file bugs about their own hand-edited JSON.
    expect(normalized.unexpected).toBe(false)
  })

  it("exits 1, which is what a config failure is documented to be", async () => {
    fs.writeFileSync(path.join(dir, "components.json"), "{ not json")
    await expect(getConfig(dir)).rejects.toThrow()
    expect(normalizeError(await getConfig(dir).catch((e) => e)).exitCode).toBe(
      1
    )
  })

  it("names the file relatively, so no absolute path reaches either stream", async () => {
    fs.writeFileSync(path.join(dir, "components.json"), "{ not json")
    const error = await getConfig(dir).catch((e: unknown) => e)
    const { envelope, unexpected } = normalizeError(error)

    expect(unexpected).toBe(false)
    expect(envelope.error.message).toContain("components.json")
    expect(envelope.error.message).not.toContain(dir)
    expect(envelope.error.suggestion).toContain("components.json")
    // `details` too: it is what gets piped into a log.
    expect(JSON.stringify(envelope.error.details ?? {})).not.toContain(dir)
  })

  it("keeps what is actually wrong, so the fix is possible", async () => {
    fs.writeFileSync(path.join(dir, "components.json"), "{ not json")
    const error = await getConfig(dir).catch((e: unknown) => e)
    // The parser's own reason survives: the file name alone is not enough to
    // fix a JSON syntax error.
    expect(normalizeError(error).envelope.error.message.length).toBeGreaterThan(
      "components.json is not valid:".length + 5
    )
  })

  it("is INVALID_CONFIG when the JSON parses but the shape is wrong", async () => {
    fs.writeFileSync(
      path.join(dir, "components.json"),
      JSON.stringify({ aliases: "not-an-object" })
    )
    const error = await getConfig(dir).catch((e: unknown) => e)
    expect(normalizeError(error).envelope.error.code).toBe(
      RegistryErrorCode.INVALID_CONFIG
    )
    expect(normalizeError(error).unexpected).toBe(false)
  })
})

describe("scrubPathsInText", () => {
  const cwd = "/Users/someone/project"

  it("rewrites an absolute path inside a sentence", () => {
    expect(
      scrubPathsInText(
        `Invalid configuration found in ${cwd}/components.json.`,
        cwd
      )
    ).toBe("Invalid configuration found in components.json.")
  })

  it("keeps a path that is already relative", () => {
    expect(scrubPathsInText("see components.json", cwd)).toBe(
      "see components.json"
    )
  })

  it("does not mangle prose that merely contains a slash", () => {
    expect(scrubPathsInText("use bun and/or pnpm", cwd)).toBe(
      "use bun and/or pnpm"
    )
  })

  it("reduces a path outside the cwd to its last segment", () => {
    expect(scrubPathsInText("/elsewhere/thing.json broke", cwd)).toBe(
      "thing.json broke"
    )
  })
})

describe("asComponentsJsonError", () => {
  it("names the file and suggests rewriting it", () => {
    const error = asComponentsJsonError(new Error("boom"))
    expect(error.code).toBe(RegistryErrorCode.INVALID_CONFIG)
    expect(error.message).toBe("components.json is not valid: boom")
    expect(error.suggestion).toContain("marko-ui init")
    expect(error.context).toEqual({ file: "components.json" })
  })

  it("flattens a zod failure into one line of field errors", () => {
    const schema = z.object({ aliases: z.object({ components: z.string() }) })
    const parsed = schema.safeParse({ aliases: {} })
    const error = asComponentsJsonError(parsed.error)
    expect(error.message).toContain("aliases.components")
  })
})

describe("a TLS certificate failure", () => {
  // Exit 4 is documented as "retry it". An expired, self-signed or
  // hostname-mismatched certificate is never fixed by retrying, so this gets
  // its OWN code and exit 1 rather than joining the retry class.
  const cases: [string, unknown][] = [
    [
      "expired",
      Object.assign(new Error("unable to verify the first certificate"), {
        code: "CERT_HAS_EXPIRED",
      }),
    ],
    ["self-signed", new Error("self-signed certificate in certificate chain")],
    [
      "hostname mismatch",
      Object.assign(new Error("altname invalid"), {
        code: "ERR_TLS_CERT_ALTNAME_INVALID",
      }),
    ],
  ]

  it.each(cases)("is detected for an %s certificate", (_label, error) => {
    expect(looksLikeTlsFailure(error)).toBe(true)
  })

  it("is NOT the retry code", () => {
    const error = asTlsError(new Error("self-signed certificate"))
    expect(error.code).toBe(RegistryErrorCode.TLS_ERROR)
    expect(error.code).not.toBe(RegistryErrorCode.NETWORK_ERROR)
  })

  it("exits 1 with a suggestion that names the real causes", () => {
    const normalized = normalizeError(
      new Error("unable to verify the first certificate")
    )
    expect(normalized.exitCode).toBe(1)
    expect(normalized.unexpected).toBe(false)
    expect(normalized.envelope.error.suggestion).toContain("NODE_EXTRA_CA_CERTS")
  })

  it("is still a network-shaped failure as far as the classifier is concerned", () => {
    // Guard against over-broadening: a refused connection must NOT become a
    // TLS error, or "fix your certificate" would be advice for a dead host.
    const refused = Object.assign(new TypeError("fetch failed"), {
      cause: Object.assign(new Error("connect ECONNREFUSED"), {
        code: "ECONNREFUSED",
      }),
    })
    expect(looksLikeTlsFailure(refused)).toBe(false)
    expect(normalizeError(refused).exitCode).toBe(4)
  })
})