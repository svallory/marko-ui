import { mkdirSync, mkdtempSync, readFileSync, writeFileSync } from "fs"
import { tmpdir } from "os"
import path from "path"
import { describe, expect, it } from "vitest"

import type { Config } from "@/src/utils/get-config"
import {
  collectProjectTags,
  pascalCase,
  TAGLIB_STAMP_FILE,
  writeProjectTaglib,
} from "./taglib"

function scaffold(components: Record<string, string[]>) {
  const cwd = mkdtempSync(path.join(tmpdir(), "marko-ui-taglib-"))
  const uiDir = path.join(cwd, "src/components/ui")
  for (const [component, files] of Object.entries(components)) {
    mkdirSync(path.join(uiDir, component), { recursive: true })
    for (const file of files) {
      writeFileSync(path.join(uiDir, component, file), "<div/>\n")
    }
  }
  const config = {
    resolvedPaths: { cwd, ui: uiDir },
  } as unknown as Config
  return { cwd, config }
}

describe("pascalCase", () => {
  it("converts dash-case component names", () => {
    expect(pascalCase("badge")).toBe("Badge")
    expect(pascalCase("alert-dialog")).toBe("AlertDialog")
    expect(pascalCase("card-header")).toBe("CardHeader")
  })
})

describe("collectProjectTags", () => {
  it("maps components and parts, skipping declaration files", () => {
    const { config } = scaffold({
      badge: ["badge.marko", "badge.d.marko", "variants.ts"],
      card: ["card.marko", "header.marko"],
    })

    const tags = collectProjectTags(config)
    return tags.then((result) => {
      const names = result.map((tag) => tag.pascal)
      expect(names).toEqual(["Badge", "Card", "CardHeader"])
      expect(result[2].template).toBe("./src/components/ui/card/header.marko")
    })
  })

  it("omits dash-case aliases that would shadow native HTML tags", async () => {
    const { config } = scaffold({
      dialog: ["dialog.marko"],
      badge: ["badge.marko"],
      select: ["select.marko"],
    })

    const tags = await collectProjectTags(config)
    const dialog = tags.find((tag) => tag.pascal === "Dialog")
    const select = tags.find((tag) => tag.pascal === "Select")
    const badge = tags.find((tag) => tag.pascal === "Badge")

    expect(dialog?.dash).toBeNull()
    expect(select?.dash).toBeNull()
    expect(badge?.dash).toBe("badge")
  })
})

describe("writeProjectTaglib", () => {
  it("writes marko.json, tags.d.ts and the ownership stamp", async () => {
    const { cwd, config } = scaffold({ badge: ["badge.marko"] })

    const result = await writeProjectTaglib(config)
    expect(result?.tags).toBe(1)

    const taglib = JSON.parse(
      readFileSync(path.join(cwd, "marko.json"), "utf8")
    )
    // Only valid taglib options may appear at the top level — Marko's
    // loader throws on unknown keys (e.g. a "//" comment marker).
    expect(Object.keys(taglib).sort()).toEqual([
      "<Badge>",
      "<badge>",
      "script-lang",
    ])
    expect(taglib["<Badge>"]).toEqual({
      template: "./src/components/ui/badge/badge.marko",
    })

    const globals = readFileSync(path.join(cwd, "tags.d.ts"), "utf8")
    expect(globals).toContain("const Badge: typeof import(")

    expect(
      JSON.parse(readFileSync(path.join(cwd, TAGLIB_STAMP_FILE), "utf8"))
        .generatedBy
    ).toBe("marko-ui")
  })

  it("never overwrites a marko.json it did not generate", async () => {
    const { cwd, config } = scaffold({ badge: ["badge.marko"] })
    const markoJson = path.join(cwd, "marko.json")
    writeFileSync(markoJson, JSON.stringify({ "tags-dir": "./mine" }))

    expect(await writeProjectTaglib(config)).toBeNull()
    expect(JSON.parse(readFileSync(markoJson, "utf8"))).toEqual({
      "tags-dir": "./mine",
    })
  })

  it("regenerates when the stamp is present", async () => {
    const { cwd, config } = scaffold({ badge: ["badge.marko"] })
    await writeProjectTaglib(config)

    mkdirSync(path.join(cwd, "src/components/ui/card"), { recursive: true })
    writeFileSync(path.join(cwd, "src/components/ui/card/card.marko"), "<div/>")

    const result = await writeProjectTaglib(config)
    expect(result?.tags).toBe(2)
    expect(
      Object.keys(JSON.parse(readFileSync(path.join(cwd, "marko.json"), "utf8")))
    ).toContain("<Card>")
  })
})
