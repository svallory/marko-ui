import { mkdtempSync, readFileSync, writeFileSync } from "fs"
import { tmpdir } from "os"
import path from "path"
import { describe, expect, it } from "vitest"

import type { Config } from "@/src/utils/get-config"
import { scaffoldImportDistributionCss } from "./update-css-import-distribution"

function makeConfig(cssFilepath: string): Config {
  return {
    resolvedPaths: {
      cwd: path.dirname(cssFilepath),
      tailwindCss: cssFilepath,
    },
  } as Config
}

describe("scaffoldImportDistributionCss", () => {
  it("writes an import + layer(components) + custom-variant block to a new file", async () => {
    const dir = mkdtempSync(path.join(tmpdir(), "marko-ui-import-css-"))
    const cssFilepath = path.join(dir, "app.css")

    await scaffoldImportDistributionCss(makeConfig(cssFilepath), {
      baseColor: "neutral",
      visualStyle: "vega",
      silent: true,
    })

    const output = readFileSync(cssFilepath, "utf8")

    expect(output).toContain(
      '@import "@marko-ui/core/styles/globals.css";'
    )
    expect(output).toContain(
      '@import "@marko-ui/core/styles/style-vega.css" layer(components);'
    )
    expect(output).toContain(
      "@custom-variant style-vega (&:where(.style-vega *));"
    )
  })

  it("maps a non-neutral base color to its globals-<color>.css file", async () => {
    const dir = mkdtempSync(path.join(tmpdir(), "marko-ui-import-css-"))
    const cssFilepath = path.join(dir, "app.css")

    await scaffoldImportDistributionCss(makeConfig(cssFilepath), {
      baseColor: "zinc",
      visualStyle: "nova",
      silent: true,
    })

    const output = readFileSync(cssFilepath, "utf8")

    expect(output).toContain(
      '@import "@marko-ui/core/styles/globals-zinc.css";'
    )
    expect(output).toContain(
      '@import "@marko-ui/core/styles/style-nova.css" layer(components);'
    )
    expect(output).toContain(
      "@custom-variant style-nova (&:where(.style-nova *));"
    )
  })

  it("appends after existing content", async () => {
    const dir = mkdtempSync(path.join(tmpdir(), "marko-ui-import-css-"))
    const cssFilepath = path.join(dir, "app.css")
    writeFileSync(cssFilepath, "/* existing */\n.foo { color: red; }\n")

    await scaffoldImportDistributionCss(makeConfig(cssFilepath), {
      baseColor: "neutral",
      visualStyle: "vega",
      silent: true,
    })

    const output = readFileSync(cssFilepath, "utf8")
    expect(output).toContain(".foo { color: red; }")
    expect(output).toContain("marko-ui:import-distribution")
  })

  it("is idempotent — does not duplicate the block on a second run", async () => {
    const dir = mkdtempSync(path.join(tmpdir(), "marko-ui-import-css-"))
    const cssFilepath = path.join(dir, "app.css")

    await scaffoldImportDistributionCss(makeConfig(cssFilepath), {
      baseColor: "neutral",
      visualStyle: "vega",
      silent: true,
    })
    await scaffoldImportDistributionCss(makeConfig(cssFilepath), {
      baseColor: "neutral",
      visualStyle: "vega",
      silent: true,
    })

    const output = readFileSync(cssFilepath, "utf8")
    const occurrences = output.split("marko-ui:import-distribution").length - 1
    expect(occurrences).toBe(1)
  })
})
