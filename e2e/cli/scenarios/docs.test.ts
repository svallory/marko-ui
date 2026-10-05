import { writeFileSync } from "node:fs"
import { join } from "node:path"
import { describe, expect } from "vitest"
import { cli, jsonData, makeWorkspace, markoApp, plain, read, tail, withShims } from "./lib/harness"
import { scenario } from "./lib/scenario"

/*
 * `docs` renders from the docs model the REGISTRY ITEM carries (the locally
 * served registry here), never from the docs site. The preload below wraps
 * `fetch` and appends every requested URL to a log, so "no request to the docs
 * site" is observed, not assumed.
 */
function fetchLogging(ws: string) {
  const log = join(ws, ".fetch.log")
  const preload = join(ws, ".fetch-log.mjs")
  writeFileSync(log, "")
  writeFileSync(
    preload,
    `import { appendFileSync } from "node:fs"
const real = globalThis.fetch
globalThis.fetch = (input, init) => {
  appendFileSync(${JSON.stringify(log)}, String(input?.url ?? input) + "\\n")
  return real(input, init)
}
`
  )
  return {
    env: { NODE_OPTIONS: `--import ${preload}` },
    urls: () => read(ws, ".fetch.log").split("\n").filter(Boolean),
  }
}

describe("docs — rendered locally from the registry item", () => {
  scenario("D01", "docs button prints the lean default from the local registry and never requests the docs site", async () => {
    const ws = makeWorkspace()
    markoApp(ws)
    const spy = fetchLogging(ws)

    const r = await cli(ws, ["docs", "button"], { shim: withShims(makeWorkspace("shim")), env: spy.env })
    expect(r.code, tail(r.out)).toBe(0)

    const out = plain(r.stdout)
    expect(out).toMatch(/^# Button/m)
    expect(out).toContain("## Usage")
    expect(out).toContain("## Props")
    // Lean default: the full set is behind --examples, and the output says how.
    expect(out).toContain("## More examples")
    expect(plain(r.stderr)).toBe("")

    const urls = spy.urls()
    expect(urls.length, "the fetch spy saw no request at all — the preload did not load").toBeGreaterThan(0)
    const hosts = new Set(urls.map((u) => new URL(u).host))
    expect([...hosts], `requests: ${urls.join(", ")}`).toEqual([new URL(process.env.REGISTRY_URL!).host])
    expect(urls.some((u) => u.includes("/docs/components/")), "docs site endpoint requested").toBe(false)
  })

  scenario("D02", "docs nope button: prints button on stdout, reports nope on stderr, exits 1", async () => {
    const ws = makeWorkspace()
    markoApp(ws)

    const r = await cli(ws, ["docs", "nope", "button"], { shim: withShims(makeWorkspace("shim")) })
    expect(r.code, tail(r.out)).toBe(1)

    expect(plain(r.stdout)).toMatch(/^# Button/m)
    expect(plain(r.stdout), "an error leaked onto stdout").not.toContain("nope")
    expect(plain(r.stderr)).toContain('No documentation for "nope"')
  })

  scenario("D03", "docs --json button: one envelope with data.components[{name, markdown, docs}]", async () => {
    const ws = makeWorkspace()
    markoApp(ws)

    const r = await cli(ws, ["docs", "button", "--json"], { shim: withShims(makeWorkspace("shim")) })
    expect(r.code, tail(r.out)).toBe(0)
    const data = jsonData<{ components: { name: string; markdown: string; docs: unknown }[] }>(r.stdout)
    expect(data.components.map((c) => c.name)).toEqual(["button"])
    expect(data.components[0]!.markdown).toMatch(/^# Button/m)
    expect(data.components[0]!.docs).toBeTruthy()
  })
})
