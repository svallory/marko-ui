import { createServer, type Server } from "node:http"
import { type AddressInfo } from "node:net"
import { afterAll, beforeAll, describe, expect } from "vitest"
import {
  cli,
  componentsJson,
  jsonOut,
  makeWorkspace,
  markoApp,
  tail,
  withShims,
  writeTree,
} from "./lib/harness"
import { scenario } from "./lib/scenario"

/*
 * The exit-code contract, observed on the built CLI:
 *
 *   4  the registry could not be reached or is failing; the same command may
 *      succeed later (connection failure, any 5xx, 429)
 *   1  every other HTTP status, each with its own code (401, 403, 404, 410) or
 *      REQUEST_REJECTED for an unexpected 4xx (400, 418, ...)
 *   2  USAGE_ERROR, and nothing else
 *
 * A registry that answers every request with one status stands in for each row.
 */
let server: Server
let status = 200
let base = ""

beforeAll(async () => {
  server = createServer((_req, res) => {
    res.statusCode = status
    res.setHeader("content-type", "application/json")
    res.end(JSON.stringify({ error: `status ${status}` }))
  })
  await new Promise<void>((resolve) => server.listen(0, "127.0.0.1", resolve))
  base = `http://127.0.0.1:${(server.address() as AddressInfo).port}/r`
})
afterAll(() => new Promise<void>((resolve) => server.close(() => resolve())))

/** A port nothing listens on. */
async function refusedBase() {
  const probe = createServer()
  await new Promise<void>((resolve) => probe.listen(0, "127.0.0.1", resolve))
  const port = (probe.address() as AddressInfo).port
  await new Promise<void>((resolve) => probe.close(() => resolve()))
  return `http://127.0.0.1:${port}/r`
}

function project() {
  const ws = makeWorkspace()
  markoApp(ws, { tsconfig: "paths" })
  writeTree(ws, { "components.json": componentsJson() })
  return ws
}

const COMMANDS: [string, string[]][] = [
  ["show", ["show", "button"]],
  ["add", ["add", "button", "-y", "--json"]],
  ["search", ["search", "@marko-ui", "-q", "x", "--json"]],
  ["docs", ["docs", "button", "--json"]],
]

const TABLE: [string, number | "refused", string, number][] = [
  ["400", 400, "REQUEST_REJECTED", 1],
  ["401", 401, "UNAUTHORIZED", 1],
  ["403", 403, "FORBIDDEN", 1],
  ["404", 404, "NOT_FOUND", 1],
  ["410", 410, "GONE", 1],
  ["429", 429, "FETCH_ERROR", 4],
  ["500", 500, "FETCH_ERROR", 4],
  ["502", 502, "FETCH_ERROR", 4],
  ["503", 503, "FETCH_ERROR", 4],
  ["refused port", "refused", "NETWORK_ERROR", 4],
]

describe("exit codes — registry failures", () => {
  for (const [label, kind, code, exit] of TABLE) {
    for (const [name, args] of COMMANDS) {
      scenario(
        `X-${label}-${name}`,
        `${name} against a registry answering ${label}: ${code}, exit ${exit}`,
        async () => {
          const ws = project()
          let registry: string
          if (kind === "refused") registry = await refusedBase()
          else {
            status = kind
            registry = base
          }
          const r = await cli(ws, args, {
            shim: withShims(makeWorkspace("shim")),
            env: { REGISTRY_URL: registry },
          })
          expect(r.code, tail(r.out)).toBe(exit)
          const error = (jsonOut(r.stdout) as { error: { code: string } }).error
          expect(error.code).toBe(code)
        }
      )
    }
  }
})

describe("exit codes — USAGE_ERROR is exit 2, and only that", () => {
  const CASES: [string, string[], string, number][] = [
    ["search with no registry", ["search", "--json"], "USAGE_ERROR", 2],
    ["search --type nope", ["search", "@marko-ui", "--type", "nope", "--json"], "USAGE_ERROR", 2],
    ["add with no names", ["add", "-y", "--json"], "USAGE_ERROR", 2],
    ["init --base-color nope", ["init", "-y", "--base-color", "nope", "--json"], "USAGE_ERROR", 2],
    ["diff --cwd /nonexistent", ["diff", "--cwd", "/nonexistent-marko-ui-dir", "--json"], "PROJECT_NOT_FOUND", 1],
    ["init --cwd /nonexistent", ["init", "-y", "--cwd", "/nonexistent-marko-ui-dir", "--json"], "PROJECT_NOT_FOUND", 1],
    ["eject on a copy project", ["eject", "-y", "--json"], "WRONG_DISTRIBUTION", 1],
    ["agents sync with no components.json", ["agents", "sync", "--json"], "NOT_CONFIGURED", 1],
  ]
  for (const [label, args, code, exit] of CASES) {
    scenario(`U-${label}`, `${label}: ${code}, exit ${exit}`, async () => {
      const ws = makeWorkspace()
      markoApp(ws, { tsconfig: "paths" })
      if (!label.startsWith("agents") && !label.startsWith("init") && label !== "search with no registry") {
        writeTree(ws, { "components.json": componentsJson() })
      }
      const r = await cli(ws, args, { shim: withShims(makeWorkspace("shim")) })
      expect(r.code, tail(r.out)).toBe(exit)
      const error = (jsonOut(r.stdout) as { error: { code: string } }).error
      expect(error.code).toBe(code)
      expect(error.code === "USAGE_ERROR").toBe(r.code === 2)
    })
  }
})
