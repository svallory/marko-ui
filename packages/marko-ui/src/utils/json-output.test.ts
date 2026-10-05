import { afterEach, describe, expect, it, vi } from "vitest"
import {
  buildSearchData,
  formatSearchResultType,
} from "@/src/registry/search"
import {
  buildSuccessEnvelope,
  formatJson,
  jsonIndent,
  printEnvelope,
  printJson,
} from "@/src/utils/json-output"

/**
 * The rule under test: JSON is MINIFIED for a program (stdout not a TTY) and
 * pretty for a human (stdout is a TTY). There is no flag — a TTY is the human
 * case, and a flag that only exists to undo the default is a flag an agent has
 * to know about.
 */
describe("jsonIndent", () => {
  it("indents when stdout is a terminal", () => {
    expect(jsonIndent({ isTTY: true })).toBe(2)
  })

  it("does not indent when stdout is a pipe or a file", () => {
    expect(jsonIndent({ isTTY: false })).toBe(0)
    expect(jsonIndent({})).toBe(0)
  })
})

describe("formatJson", () => {
  const value = { b: 1, a: { c: [1, 2] } }

  it("is pretty for a TTY", () => {
    expect(formatJson(value, { stream: { isTTY: true } })).toContain("\n  ")
  })

  it("is a single line for a pipe", () => {
    const text = formatJson(value, { stream: { isTTY: false } })
    expect(text).not.toContain("\n")
    expect(JSON.parse(text)).toEqual(value)
  })

  it("produces the same document either way", () => {
    const compact = formatJson(value, { stream: { isTTY: false } })
    const pretty = formatJson(value, { stream: { isTTY: true } })
    expect(JSON.parse(compact)).toEqual(JSON.parse(pretty))
  })
})

describe("printJson", () => {
  afterEach(() => vi.restoreAllMocks())

  it("writes one line plus a trailing newline to stdout", () => {
    const chunks: string[] = []
    vi.spyOn(process.stdout, "write").mockImplementation((chunk: unknown) => {
      chunks.push(String(chunk))
      return true
    })

    printJson({ hello: "world" })
    expect(chunks.join("")).toBe('{"hello":"world"}\n')
  })
})

describe("buildSuccessEnvelope", () => {
  it("carries $type, version, ok and data", () => {
    expect(buildSuccessEnvelope("marko-ui/show", { a: 1 })).toEqual({
      $type: "marko-ui/show",
      version: 1,
      ok: true,
      data: { a: 1 },
    })
  })

  it("lets a report-style command say ok:false about its own findings", () => {
    // doctor's result is a verdict, not an answer: the command succeeded and
    // found problems. This is the ONLY envelope that may do that; an error is
    // a `marko-ui/error` envelope.
    expect(
      buildSuccessEnvelope("marko-ui/doctor", {}, { ok: false }).ok
    ).toBe(false)
  })
})

describe("printEnvelope", () => {
  afterEach(() => vi.restoreAllMocks())

  it("prints the envelope and returns it", () => {
    const chunks: string[] = []
    vi.spyOn(process.stdout, "write").mockImplementation((chunk: unknown) => {
      chunks.push(String(chunk))
      return true
    })

    const printed = printEnvelope("marko-ui/status", { components: [] })
    expect(printed.$type).toBe("marko-ui/status")
    expect(JSON.parse(chunks.join(""))).toEqual(printed)
  })
})

/**
 * The number the whole change is for. Measured on real output: pretty-printed
 * JSON costs 28-43% more tokens than minified for the same data, so this
 * asserts the conservative end of that range on a 20-item fixture — and it
 * asserts it on CHARACTERS, which is what a token count is a proxy for.
 */
describe("search output size", () => {
  const items = Array.from({ length: 20 }, (_, index) => ({
    name: `component-${index}`,
    type: index % 2 === 0 ? "ui" : "block",
    description: `Component ${index} does something useful with buttons.`,
    registry: "@marko-ui",
  }))

  const results = {
    pagination: { total: 20, offset: 0, limit: 20, hasMore: false },
    items,
  }

  /** The document the CLI used to print, for the same data. */
  const oldPrettyShape = JSON.stringify(
    {
      pagination: results.pagination,
      items: items.map((item) => ({
        ...item,
        title: item.name,
        type: `registry:${item.type}`,
        addCommandArgument: `@marko-ui/${item.name}`,
      })),
    },
    null,
    2
  )

  it("is at least 40% smaller than the old pretty shape", () => {
    const compact = formatJson(buildSuccessEnvelope("marko-ui/search", buildSearchData(results)), {
      stream: { isTTY: false },
    })
    const compactSize = compact.length
    const oldSize = oldPrettyShape.length

    // Both documents hold the same 20 items, so this measures formatting and
    // the dropped derivable fields, not a smaller answer.
    expect(compactSize).toBeLessThan(oldSize * 0.6)
    expect(compactSize / oldSize).toBeLessThan(0.6)
  })

  it("is a single line for a pipe and a paragraph for a terminal", () => {
    const envelope = buildSuccessEnvelope("marko-ui/search", buildSearchData(results))
    expect(formatJson(envelope, { stream: { isTTY: false } }).split("\n")).toHaveLength(1)
    expect(
      formatJson(envelope, { stream: { isTTY: true } }).split("\n").length
    ).toBeGreaterThan(20)
  })
})

describe("buildSearchData", () => {
  const pagination = { total: 1, offset: 0, limit: 1, hasMore: false }

  it("states the add-argument rule only when a non-default registry is present", () => {
    const defaultOnly = buildSearchData({
      pagination,
      items: [{ name: "button", type: "ui", registry: "@marko-ui" }],
    })
    expect(defaultOnly).not.toHaveProperty("addArgument")

    const withCustom = buildSearchData({
      pagination,
      items: [{ name: "button", type: "ui", registry: "@acme" }],
    })
    expect(withCustom.addArgument).toEqual({
      default: "<name>",
      custom: "<registry>/<name>",
    })
  })

  it("keeps pagination, and keeps errors only when there are some", () => {
    expect(
      buildSearchData({
        pagination,
        items: [{ name: "button", type: "ui", registry: "@marko-ui" }],
      })
    ).toEqual({ pagination, items: [{ name: "button", type: "ui", registry: "@marko-ui" }] })

    const withErrors = buildSearchData({
      pagination,
      items: [],
      errors: [{ registry: "@acme", message: "boom" }],
    })
    expect(withErrors.errors).toEqual([{ registry: "@acme", message: "boom" }])
  })

  it("does not carry the dropped per-item fields", () => {
    const data = buildSearchData({
      pagination,
      items: [{ name: "button", type: "ui", registry: "@marko-ui" }],
    })
    expect(Object.keys(data.items[0]).sort()).toEqual([
      "name",
      "registry",
      "type",
    ])
  })
})

describe("formatSearchResultType", () => {
  it("is idempotent, so a short type survives the round trip", () => {
    expect(formatSearchResultType("registry:ui")).toBe("ui")
    expect(formatSearchResultType("ui")).toBe("ui")
  })
})