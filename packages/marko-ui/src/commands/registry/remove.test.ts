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

describe("removeRegistriesFromConfig React guard", () => {
  it("refuses to delete from a shadcn/ui-for-React components.json, leaving it byte-identical", async () => {
    const dir = mkdtempSync(path.join(tmpdir(), "marko-ui-remove-"))
    const configFile = path.join(dir, "components.json")
    writeFileSync(
      configFile,
      JSON.stringify({
        style: "default",
        registries: { "@acme": "https://acme.com/r/{name}.json" },
      })
    )
    writeFileSync(
      path.join(dir, "package.json"),
      JSON.stringify({ name: "react-app", dependencies: { react: "^19.0.0" } })
    )
    const before = await fs.readFile(configFile, "utf8")

    await expect(
      removeRegistriesFromConfig(["@acme"], dir, { silent: true })
    ).rejects.toThrow(/belongs to shadcn\/ui for React/)
    expect(await fs.readFile(configFile, "utf8")).toBe(before)
  })
})
