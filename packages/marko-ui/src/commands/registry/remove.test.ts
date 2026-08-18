import { mkdtempSync, writeFileSync } from "fs"
import { tmpdir } from "os"
import path from "path"
import fs from "fs-extra"
import { describe, expect, it } from "vitest"

import { removeRegistriesFromConfig } from "./remove"

function scaffold(registries?: Record<string, string>) {
  const dir = mkdtempSync(path.join(tmpdir(), "marko-ui-remove-"))
  writeFileSync(
    path.join(dir, "components.json"),
    JSON.stringify(
      {
        style: "default",
        tailwind: {
          config: "",
          css: "src/styles/globals.css",
          baseColor: "neutral",
          cssVariables: true,
        },
        aliases: { components: "@/components", utils: "@/lib/utils" },
        ...(registries ? { registries } : {}),
      },
      null,
      2
    )
  )
  return dir
}

describe("removeRegistriesFromConfig", () => {
  it("removes a configured registry", async () => {
    const dir = scaffold({
      "@acme": "https://acme.com/r/{name}.json",
      "@other": "https://other.com/r/{name}.json",
    })

    const result = await removeRegistriesFromConfig(["@acme"], dir, {
      silent: true,
    })

    expect(result.removed).toEqual(["@acme"])
    const config = await fs.readJson(path.join(dir, "components.json"))
    expect(config.registries).toEqual({
      "@other": "https://other.com/r/{name}.json",
    })
  })

  it("drops the registries key when the last registry is removed", async () => {
    const dir = scaffold({ "@acme": "https://acme.com/r/{name}.json" })

    await removeRegistriesFromConfig(["@acme"], dir, { silent: true })

    const config = await fs.readJson(path.join(dir, "components.json"))
    expect("registries" in config).toBe(false)
  })

  it("reports namespaces that were not configured", async () => {
    const dir = scaffold()

    const result = await removeRegistriesFromConfig(["@missing"], dir, {
      silent: true,
    })

    expect(result.removed).toEqual([])
    expect(result.missing).toEqual(["@missing"])
  })

  it("refuses to remove the built-in registry", async () => {
    const dir = scaffold({ "@acme": "https://acme.com/r/{name}.json" })

    const result = await removeRegistriesFromConfig(
      ["@marko-ui", "@acme"],
      dir,
      { silent: true }
    )

    expect(result.removed).toEqual(["@acme"])
    const config = await fs.readJson(path.join(dir, "components.json"))
    expect(config.registries).toBeUndefined()
  })

  it("throws when no components.json exists", async () => {
    const dir = mkdtempSync(path.join(tmpdir(), "marko-ui-remove-empty-"))
    await expect(
      removeRegistriesFromConfig(["@acme"], dir, { silent: true })
    ).rejects.toThrow(/components.json/)
  })
})
