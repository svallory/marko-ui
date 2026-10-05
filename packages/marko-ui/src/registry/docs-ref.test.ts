import { mkdtempSync, mkdirSync, rmSync, writeFileSync } from "fs"
import { tmpdir } from "os"
import path from "path"
import { http, HttpResponse } from "msw"
import { setupServer } from "msw/node"
import { afterAll, afterEach, beforeAll, describe, expect, it } from "vitest"

import { getRegistryItemDocs } from "./api"
import {
  getRegistryHeadersFromContext,
  setRegistryHeaders,
  withRegistryContext,
} from "./context"
import {
  absolutizeDocsRef,
  fetchComponentDocs,
  RegistryDocsFileMissingError,
} from "./docs-ref"
import { RegistryErrorCode } from "./errors"
import { DOCS_FETCH_CONCURRENCY, resolveRegistryTree } from "./resolver"

/** A minimal docs model that satisfies componentDocsSchema. */
function model(name: string, marker = "docs") {
  return {
    name,
    title: name,
    description: `${marker}.`,
    installCommand: `bunx marko-ui add ${name} -y`,
    usageTags: `<${name}>`,
    importSnippet: "",
    usageSnippet: `<${name}/>`,
    parts: [],
    props: [],
    events: [],
    keyboard: [],
    accessibilityNotes: [],
    examples: [],
  }
}

function uiItem(name: string, extra: Record<string, unknown> = {}) {
  return {
    name,
    type: "registry:ui",
    files: [{ path: `ui/${name}.marko`, type: "registry:ui", content: "<div/>" }],
    ...extra,
  }
}

const HOST = "https://acme.test"
const hits: string[] = []
const seenHeaders: Record<string, string | null> = {}

const server = setupServer(
  http.get(`${HOST}/r/button.json`, () =>
    HttpResponse.json(uiItem("button", { componentDocsRef: `${HOST}/r/docs/button.json` }))
  ),
  http.get(`${HOST}/r/docs/button.json`, ({ request }) => {
    hits.push("docs/button")
    seenHeaders["docs/button"] = request.headers.get("x-token")
    return HttpResponse.json(model("button"))
  }),
  http.get(`${HOST}/r/dialog.json`, () =>
    HttpResponse.json(uiItem("dialog", { componentDocsRef: `${HOST}/r/docs/dialog.json` }))
  ),
  http.get(`${HOST}/r/docs/dialog.json`, () => {
    hits.push("docs/dialog")
    return new HttpResponse(null, { status: 500 })
  }),
  http.get(`${HOST}/r/switch.json`, () =>
    HttpResponse.json(uiItem("switch", { componentDocsRef: `${HOST}/r/docs/switch.json` }))
  ),
  http.get(`${HOST}/r/docs/switch.json`, () => {
    hits.push("docs/switch")
    return HttpResponse.json({ not: "a docs model" })
  }),
  http.get(`${HOST}/r/plain.json`, () => HttpResponse.json(uiItem("plain"))),
  http.get(`${HOST}/r/tabs.json`, () =>
    HttpResponse.json(uiItem("tabs", { componentDocsRef: "docs/tabs.json" }))
  ),
  http.get(`${HOST}/r/docs/tabs.json`, () => {
    hits.push("docs/tabs")
    return HttpResponse.json(model("tabs"))
  }),
  http.get(`${HOST}/r/theme-x.json`, () =>
    HttpResponse.json({
      name: "theme-x",
      type: "registry:theme",
      componentDocsRef: `${HOST}/r/docs/theme-x.json`,
    })
  )
)

beforeAll(() => server.listen({ onUnhandledRequest: "error" }))
afterEach(() => {
  server.resetHandlers()
  hits.length = 0
  for (const key of Object.keys(seenHeaders)) delete seenHeaders[key]
})
afterAll(() => server.close())

describe("absolutizeDocsRef", () => {
  it("returns an item with no reference untouched", () => {
    const item: { name: string; componentDocsRef?: string } = { name: "x" }
    expect(absolutizeDocsRef(item, `${HOST}/r/x.json`)).toBe(item)
  })

  it("keeps an absolute URL reference as is, whatever the location", () => {
    const item = { componentDocsRef: "https://cdn.test/docs/x.json" }
    expect(absolutizeDocsRef(item, `${HOST}/r/x.json`)).toBe(item)
    expect(absolutizeDocsRef(item, undefined)).toBe(item)
    expect(absolutizeDocsRef(item, "./x.json")).toBe(item)
  })

  it("resolves a relative reference against the item's URL", () => {
    expect(
      absolutizeDocsRef({ componentDocsRef: "docs/x.json" }, `${HOST}/r/styles/nova/x.json`)
        .componentDocsRef
    ).toBe(`${HOST}/r/styles/nova/docs/x.json`)
    expect(
      absolutizeDocsRef({ componentDocsRef: "../../docs/x.json" }, `${HOST}/r/styles/nova/x.json`)
        .componentDocsRef
    ).toBe(`${HOST}/r/docs/x.json`)
    expect(
      absolutizeDocsRef({ componentDocsRef: "/docs/x.json" }, `${HOST}/r/x.json?v=2`)
        .componentDocsRef
    ).toBe(`${HOST}/docs/x.json`)
  })

  it("resolves a relative reference against a local item file's directory", () => {
    expect(
      absolutizeDocsRef({ componentDocsRef: "docs/x.json" }, "/work/reg/x.json").componentDocsRef
    ).toBe("/work/reg/docs/x.json")
    expect(
      absolutizeDocsRef({ componentDocsRef: "../docs/x.json" }, "/work/reg/ui/x.json")
        .componentDocsRef
    ).toBe("/work/reg/docs/x.json")
  })

  it("drops a relative reference when the item's location is unknown", () => {
    const result = absolutizeDocsRef({ name: "x", componentDocsRef: "docs/x.json" }, undefined)
    expect(result).toEqual({ name: "x" })
    expect(result).not.toHaveProperty("componentDocsRef")
  })

  it("does not mutate its input", () => {
    const item = { componentDocsRef: "docs/x.json" }
    absolutizeDocsRef(item, `${HOST}/r/x.json`)
    expect(item.componentDocsRef).toBe("docs/x.json")
  })

  it("carries registry auth headers to a docs file on the SAME origin only", () => {
    withRegistryContext(() => {
      setRegistryHeaders({ [`${HOST}/r/x.json`]: { "x-token": "secret" } })
      absolutizeDocsRef({ componentDocsRef: "docs/x.json" }, `${HOST}/r/x.json`)
      expect(getRegistryHeadersFromContext(`${HOST}/r/docs/x.json`)).toEqual({
        "x-token": "secret",
      })

      // An absolute reference to another host is never given the token.
      absolutizeDocsRef({ componentDocsRef: "https://cdn.test/x.json" }, `${HOST}/r/x.json`)
      expect(getRegistryHeadersFromContext("https://cdn.test/x.json")).toEqual({})
    })
  })
})

describe("fetchComponentDocs", () => {
  const dirs: string[] = []
  afterAll(() => dirs.forEach((dir) => rmSync(dir, { recursive: true, force: true })))

  function tmp() {
    const dir = mkdtempSync(path.join(tmpdir(), "marko-ui-docs-ref-"))
    dirs.push(dir)
    return dir
  }

  it("fetches and validates a model from a URL", async () => {
    const result = await fetchComponentDocs(`${HOST}/r/docs/button.json`)
    expect(result.name).toBe("button")
    expect(hits).toEqual(["docs/button"])
  })

  it("does not memoize: a second call fetches again", async () => {
    await fetchComponentDocs(`${HOST}/r/docs/button.json`)
    await fetchComponentDocs(`${HOST}/r/docs/button.json`)
    expect(hits).toEqual(["docs/button", "docs/button"])
  })

  it("reads a model from a local file", async () => {
    const dir = tmp()
    mkdirSync(path.join(dir, "docs"))
    writeFileSync(path.join(dir, "docs", "x.json"), JSON.stringify(model("x")))
    expect((await fetchComponentDocs(path.join(dir, "docs", "x.json"))).name).toBe("x")
  })

  it("reports a missing local file as a local-file error naming the path", async () => {
    await expect(fetchComponentDocs("/nonexistent-dir/docs/x.json")).rejects.toMatchObject({
      code: RegistryErrorCode.LOCAL_FILE_ERROR,
    })
  })

  it("reports a local file that is not JSON the same way", async () => {
    const dir = tmp()
    writeFileSync(path.join(dir, "bad.json"), "{ nope")
    await expect(fetchComponentDocs(path.join(dir, "bad.json"))).rejects.toMatchObject({
      code: RegistryErrorCode.LOCAL_FILE_ERROR,
    })
  })

  it("rejects a body that is not a docs model as a parse error naming the reference", async () => {
    const ref = `${HOST}/r/docs/switch.json`
    const error = await fetchComponentDocs(ref).catch((e) => e)
    expect(error.code).toBe(RegistryErrorCode.PARSE_ERROR)
    expect(error.message).toContain(ref)
  })

  it("propagates an HTTP failure as the FETCH_ERROR it is", async () => {
    await expect(fetchComponentDocs(`${HOST}/r/docs/dialog.json`)).rejects.toMatchObject({
      code: RegistryErrorCode.FETCH_ERROR,
    })
  })

  it("propagates a missing docs file as NOT_FOUND", async () => {
    server.use(http.get(`${HOST}/r/docs/gone.json`, () => new HttpResponse(null, { status: 404 })))
    await expect(fetchComponentDocs(`${HOST}/r/docs/gone.json`)).rejects.toMatchObject({
      code: RegistryErrorCode.NOT_FOUND,
    })
  })

  it("names the item and the URL (query scrubbed) when the docs file of a found item is missing", async () => {
    server.use(http.get(`${HOST}/r/docs/gone.json`, () => new HttpResponse(null, { status: 404 })))
    const error = await fetchComponentDocs(`${HOST}/r/docs/gone.json?token=secret`, "gone").catch((e) => e)
    expect(error).toBeInstanceOf(RegistryDocsFileMissingError)
    expect(error.code).toBe(RegistryErrorCode.NOT_FOUND)
    expect(error.message).toContain('"gone"')
    expect(error.message).toContain(`${HOST}/r/docs/gone.json`)
    expect(error.message).not.toContain("secret")
    expect(JSON.stringify(error.context)).not.toContain("secret")
    // Not the "no such item" wording an unknown name gets.
    expect(error.message).not.toContain("may not exist at the registry")
  })

  it("propagates an unreachable host as NETWORK_ERROR", async () => {
    server.use(http.get(`${HOST}/r/docs/down.json`, () => HttpResponse.error()))
    await expect(fetchComponentDocs(`${HOST}/r/docs/down.json`)).rejects.toMatchObject({
      code: RegistryErrorCode.NETWORK_ERROR,
    })
  })
})

describe("resolveRegistryTree: fetchDocs", () => {
  const config = { resolvedPaths: { cwd: "/p" } } as never

  it("does not touch the docs files unless asked (diff, show, dry-run stay cheap)", async () => {
    const tree = await resolveRegistryTree([`${HOST}/r/button.json`], config, { useCache: false })
    expect(tree?.itemDocs).toBeUndefined()
    expect(hits).toEqual([])
  })

  it("fetches each referenced file once and returns the models by item name", async () => {
    const tree = await resolveRegistryTree(
      [`${HOST}/r/button.json`, `${HOST}/r/plain.json`],
      config,
      { useCache: false, fetchDocs: true }
    )
    expect(hits).toEqual(["docs/button"])
    expect(tree?.itemDocs?.map((entry) => entry.name)).toEqual(["button"])
    expect(tree?.itemDocs?.[0]?.componentDocs.name).toBe("button")
    expect(tree?.docsFailures).toEqual([])
  })

  it("an item with no reference is simply not in itemDocs and is not a failure", async () => {
    const tree = await resolveRegistryTree([`${HOST}/r/plain.json`], config, {
      useCache: false,
      fetchDocs: true,
    })
    expect(tree?.itemDocs).toEqual([])
    expect(tree?.docsFailures).toEqual([])
  })

  it("a failing docs file is reported and never fails the resolve; the others still arrive", async () => {
    const tree = await resolveRegistryTree(
      [`${HOST}/r/button.json`, `${HOST}/r/dialog.json`, `${HOST}/r/switch.json`],
      config,
      { useCache: false, fetchDocs: true }
    )
    expect(tree?.itemDocs?.map((entry) => entry.name)).toEqual(["button"])
    expect(tree?.docsFailures?.map((failure) => failure.name).sort()).toEqual(["dialog", "switch"])
    expect(tree?.docsFailures?.[0]?.ref).toMatch(/\/r\/docs\//)
    // One line each, no stack, no multi-line zod dump.
    for (const failure of tree?.docsFailures ?? []) expect(failure.message).not.toContain("\n")
    // Their install files are intact.
    expect(tree?.files?.length).toBe(3)
  })

  it("fetches the docs files in parallel, not one after another", async () => {
    let inFlight = 0
    let peak = 0
    server.use(
      http.get(`${HOST}/r/docs/button.json`, async () => {
        inFlight++
        peak = Math.max(peak, inFlight)
        await new Promise((resolve) => setTimeout(resolve, 40))
        inFlight--
        return HttpResponse.json(model("button"))
      }),
      http.get(`${HOST}/r/docs/tabs.json`, async () => {
        inFlight++
        peak = Math.max(peak, inFlight)
        await new Promise((resolve) => setTimeout(resolve, 40))
        inFlight--
        return HttpResponse.json(model("tabs"))
      })
    )
    await resolveRegistryTree([`${HOST}/r/button.json`, `${HOST}/r/tabs.json`], config, {
      useCache: false,
      fetchDocs: true,
    })
    expect(peak).toBe(2)
  })

  it("resolves a relative reference against the item URL, so the same item works under any registry", async () => {
    const tree = await resolveRegistryTree([`${HOST}/r/tabs.json`], config, {
      useCache: false,
      fetchDocs: true,
    })
    expect(hits).toEqual(["docs/tabs"])
    expect(tree?.itemDocs?.[0]?.componentDocs.name).toBe("tabs")
  })

  it("only ui items are documented: a theme that carries a reference is ignored", async () => {
    const tree = await resolveRegistryTree([`${HOST}/r/theme-x.json`], config, {
      useCache: false,
      fetchDocs: true,
    })
    expect(tree?.itemDocs).toEqual([])
  })

  it("hashes the item (reference included), so a changed reference changes the hash", async () => {
    const a = await resolveRegistryTree([`${HOST}/r/button.json`], config, {
      useCache: false,
      fetchDocs: true,
    })
    server.use(
      http.get(`${HOST}/r/button.json`, () =>
        HttpResponse.json(uiItem("button", { componentDocsRef: `${HOST}/r/docs/v2/button.json` }))
      ),
      http.get(`${HOST}/r/docs/v2/button.json`, () => HttpResponse.json(model("button")))
    )
    const b = await resolveRegistryTree([`${HOST}/r/button.json`], config, {
      useCache: false,
      fetchDocs: true,
    })
    expect(a?.itemDocs?.[0]?.contentHash).not.toBe(b?.itemDocs?.[0]?.contentHash)
  })
})

describe("getRegistryItemDocs", () => {
  const config = { resolvedPaths: { cwd: "/p" } } as never

  it("follows the reference: the item, then one extra fetch for the model", async () => {
    const found = await getRegistryItemDocs(`${HOST}/r/button.json`, { config })
    expect(found.item?.name).toBe("button")
    expect(found.model?.name).toBe("button")
    expect(hits).toEqual(["docs/button"])
  })

  it("answers an item without a reference with the item and NO model, and fetches nothing else", async () => {
    const found = await getRegistryItemDocs(`${HOST}/r/plain.json`, { config })
    expect(found.item?.name).toBe("plain")
    expect(found.model).toBeUndefined()
    expect(hits).toEqual([])
  })

  it("throws the registry's own error when the docs file is unreachable for a reachable item", async () => {
    await expect(getRegistryItemDocs(`${HOST}/r/dialog.json`, { config })).rejects.toMatchObject({
      code: RegistryErrorCode.FETCH_ERROR,
    })
  })

  it("sends the item's registry headers to the docs file next to it", async () => {
    server.use(
      http.get(`${HOST}/r/private.json`, () =>
        HttpResponse.json(uiItem("private", { componentDocsRef: "docs/private.json" }))
      ),
      http.get(`${HOST}/r/docs/private.json`, ({ request }) => {
        seenHeaders["docs/private"] = request.headers.get("x-token")
        return HttpResponse.json(model("private"))
      })
    )
    const registries = { "@acme": { url: `${HOST}/r/{name}.json`, headers: { "x-token": "secret" } } }
    const found = await getRegistryItemDocs("@acme/private", {
      config: { resolvedPaths: { cwd: "/p" }, registries } as never,
    })
    expect(found.model?.name).toBe("private")
    expect(seenHeaders["docs/private"]).toBe("secret")
  })
})

describe("docs files: concurrency and legacy embedded models", () => {
  const config = { resolvedPaths: { cwd: "/p" } } as never

  it("never has more than DOCS_FETCH_CONCURRENCY docs files in flight", async () => {
    const count = DOCS_FETCH_CONCURRENCY * 3
    let inFlight = 0
    let peak = 0
    const names = Array.from({ length: count }, (_, i) => `many-${i}`)
    server.use(
      ...names.flatMap((name) => [
        http.get(`${HOST}/r/${name}.json`, () =>
          HttpResponse.json(uiItem(name, { componentDocsRef: `${HOST}/r/docs/${name}.json` }))
        ),
        http.get(`${HOST}/r/docs/${name}.json`, async () => {
          inFlight++
          peak = Math.max(peak, inFlight)
          await new Promise((resolve) => setTimeout(resolve, 15))
          inFlight--
          return HttpResponse.json(model(name))
        }),
      ])
    )
    const tree = await resolveRegistryTree(
      names.map((name) => `${HOST}/r/${name}.json`),
      config,
      { useCache: false, fetchDocs: true }
    )
    expect(tree?.itemDocs).toHaveLength(count)
    expect(peak).toBeGreaterThan(1)
    expect(peak).toBeLessThanOrEqual(DOCS_FETCH_CONCURRENCY)
  })

  it("a missing docs file is a non-fatal warning entry naming the item, not a failed resolve", async () => {
    server.use(
      http.get(`${HOST}/r/half.json`, () =>
        HttpResponse.json(uiItem("half", { componentDocsRef: `${HOST}/r/docs/half.json?t=secret` }))
      ),
      http.get(`${HOST}/r/docs/half.json`, () => new HttpResponse(null, { status: 404 }))
    )
    const tree = await resolveRegistryTree([`${HOST}/r/half.json`], config, {
      useCache: false,
      fetchDocs: true,
    })
    expect(tree?.itemDocs).toEqual([])
    expect(tree?.docsFailures).toHaveLength(1)
    expect(tree?.docsFailures?.[0]?.name).toBe("half")
    expect(tree?.docsFailures?.[0]?.message).toContain("missing from the registry")
    expect(JSON.stringify(tree?.docsFailures)).not.toContain("secret")
  })

  describe("an item that still embeds componentDocs (a registry built before the sidecar)", () => {
    const embedded = model("legacy", "embedded")
    const referenced = model("legacy", "referenced")
    const legacyItem = (extra: Record<string, unknown> = {}) =>
      uiItem("legacy", { componentDocs: embedded, ...extra })

    it("getRegistryItemDocs reads the embedded model when there is no reference", async () => {
      server.use(http.get(`${HOST}/r/legacy.json`, () => HttpResponse.json(legacyItem())))
      const found = await getRegistryItemDocs(`${HOST}/r/legacy.json`, { config })
      expect(found.model?.description).toBe("embedded.")
      expect(hits).toEqual([])
    })

    it("getRegistryItemDocs: the reference wins when both exist", async () => {
      server.use(
        http.get(`${HOST}/r/legacy.json`, () =>
          HttpResponse.json(legacyItem({ componentDocsRef: `${HOST}/r/docs/legacy.json` }))
        ),
        http.get(`${HOST}/r/docs/legacy.json`, () => HttpResponse.json(referenced))
      )
      const found = await getRegistryItemDocs(`${HOST}/r/legacy.json`, { config })
      expect(found.model?.description).toBe("referenced.")
    })

    it("add's docs resolution uses the embedded model with no reference, and the reference when both exist", async () => {
      server.use(http.get(`${HOST}/r/legacy.json`, () => HttpResponse.json(legacyItem())))
      const only = await resolveRegistryTree([`${HOST}/r/legacy.json`], config, {
        useCache: false,
        fetchDocs: true,
      })
      expect(only?.itemDocs?.[0]?.componentDocs.description).toBe("embedded.")
      expect(only?.docsFailures).toEqual([])

      server.use(
        http.get(`${HOST}/r/legacy.json`, () =>
          HttpResponse.json(legacyItem({ componentDocsRef: `${HOST}/r/docs/legacy.json` }))
        ),
        http.get(`${HOST}/r/docs/legacy.json`, () => HttpResponse.json(referenced))
      )
      const both = await resolveRegistryTree([`${HOST}/r/legacy.json`], config, {
        useCache: false,
        fetchDocs: true,
      })
      expect(both?.itemDocs?.[0]?.componentDocs.description).toBe("referenced.")
    })

    it("a malformed embedded model is ignored, not a parse failure of the item", async () => {
      server.use(
        http.get(`${HOST}/r/legacy.json`, () =>
          HttpResponse.json(uiItem("legacy", { componentDocs: { nope: true } }))
        )
      )
      const found = await getRegistryItemDocs(`${HOST}/r/legacy.json`, { config })
      expect(found.item?.name).toBe("legacy")
      expect(found.model).toBeUndefined()
    })
  })
})
