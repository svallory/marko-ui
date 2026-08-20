import * as fs from "fs/promises"
import { tmpdir } from "os"
import * as path from "path"
import { logger } from "@/src/utils/logger"
import { beforeEach, describe, expect, it, vi } from "vitest"

import { build } from "./build"

vi.mock("@/src/utils/handle-error", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@/src/utils/handle-error")>()),
  handleError: vi.fn((error) => {
    throw error
  }),
}))

vi.mock("@/src/utils/highlighter", () => ({
  highlighter: {
    error: (value: string) => value,
    info: (value: string) => value,
    success: (value: string) => value,
  },
}))

vi.mock("@/src/utils/logger", () => ({
  logger: {
    break: vi.fn(),
    error: vi.fn(),
    log: vi.fn(),
  },
}))

vi.mock("@/src/utils/spinner", () => ({
  spinner: vi.fn(() => ({
    fail: vi.fn(),
    start: vi.fn().mockReturnThis(),
    succeed: vi.fn(),
  })),
}))

const COMPONENTS_JSON = JSON.stringify({
  style: "default",
  tailwind: {
    config: "",
    css: "src/app.css",
    baseColor: "neutral",
    cssVariables: true,
  },
  rsc: false,
  aliases: {
    utils: "~/lib/utils",
    components: "~/components",
    lib: "~/lib",
    hooks: "~/lib/hooks",
    ui: "~/ui",
  },
})

const TSCONFIG_JSON = JSON.stringify({
  compilerOptions: {
    baseUrl: ".",
    paths: { "~/*": ["./src/*"] },
  },
})

const PACKAGE_JSON = JSON.stringify({ name: "registry-fixture" })

const BUTTON_MARKO = `import { cn } from "~/lib/format.ts";
import * as zagSwitch from "@zag-js/switch";

<button class=cn("mu-button", input.class)>hello</button>
`

const FORMAT_TS = `export function cn(...classes: string[]) {
  return classes.filter(Boolean).join(" ")
}
`

describe("registry build", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    process.exitCode = undefined
  })

  it("inlines file contents and resolves imports into files + dependencies", async () => {
    const cwd = await createFixture({
      "components.json": COMPONENTS_JSON,
      "tsconfig.json": TSCONFIG_JSON,
      "package.json": PACKAGE_JSON,
      "registry.json": JSON.stringify({
        name: "acme",
        homepage: "https://acme.dev",
        items: [
          {
            name: "button",
            type: "registry:ui",
            title: "Button",
            files: [
              { path: "src/ui/button/button.marko", type: "registry:ui" },
            ],
          },
        ],
      }),
      "src/ui/button/button.marko": BUTTON_MARKO,
      "src/lib/format.ts": FORMAT_TS,
    })

    await build.parseAsync(["registry.json", "--cwd", cwd], { from: "user" })

    expect(process.exitCode).toBeUndefined()

    const itemJson = JSON.parse(
      await fs.readFile(path.join(cwd, "public/r/button.json"), "utf-8")
    )
    expect(itemJson.name).toBe("button")
    expect(itemJson.$schema).toBe(
      "https://ui.shadcn.com/schema/registry-item.json"
    )

    const filePaths = itemJson.files.map((file: { path: string }) => file.path)
    expect(filePaths).toContain("src/ui/button/button.marko")
    expect(filePaths).toContain("src/lib/format.ts")

    const buttonFile = itemJson.files.find(
      (file: { path: string }) => file.path === "src/ui/button/button.marko"
    )
    expect(buttonFile.content).toBe(BUTTON_MARKO)

    expect(itemJson.dependencies).toContain("@zag-js/switch")

    const registryCopy = JSON.parse(
      await fs.readFile(path.join(cwd, "public/r/registry.json"), "utf-8")
    )
    expect(registryCopy.name).toBe("acme")
  })

  it("honors a custom output directory", async () => {
    const cwd = await createFixture({
      "components.json": COMPONENTS_JSON,
      "tsconfig.json": TSCONFIG_JSON,
      "package.json": PACKAGE_JSON,
      "registry.json": JSON.stringify({
        name: "acme",
        homepage: "https://acme.dev",
        items: [
          {
            name: "util",
            type: "registry:lib",
            files: [{ path: "src/lib/format.ts", type: "registry:lib" }],
          },
        ],
      }),
      "src/lib/format.ts": FORMAT_TS,
    })

    await build.parseAsync(
      ["registry.json", "--cwd", cwd, "--output", "./dist/r"],
      { from: "user" }
    )

    expect(process.exitCode).toBeUndefined()
    const itemJson = JSON.parse(
      await fs.readFile(path.join(cwd, "dist/r/util.json"), "utf-8")
    )
    expect(itemJson.files[0].content).toBe(FORMAT_TS)
  })

  it("fails without components.json", async () => {
    const cwd = await createFixture({
      "registry.json": JSON.stringify({
        name: "acme",
        homepage: "https://acme.dev",
        items: [],
      }),
    })

    await build.parseAsync(["registry.json", "--cwd", cwd], { from: "user" })

    expect(process.exitCode).toBe(1)
    expect(logger.error).toHaveBeenCalled()
  })

  it("fails when the registry file is missing", async () => {
    const cwd = await createFixture({
      "components.json": COMPONENTS_JSON,
      "tsconfig.json": TSCONFIG_JSON,
      "package.json": PACKAGE_JSON,
    })

    await build.parseAsync(["registry.json", "--cwd", cwd], { from: "user" })

    expect(process.exitCode).toBe(1)
    expect(logger.error).toHaveBeenCalled()
  })

  it("fails on an invalid registry file", async () => {
    const cwd = await createFixture({
      "components.json": COMPONENTS_JSON,
      "tsconfig.json": TSCONFIG_JSON,
      "package.json": PACKAGE_JSON,
      // Missing required `homepage` + `name`.
      "registry.json": JSON.stringify({ items: [] }),
    })

    await build.parseAsync(["registry.json", "--cwd", cwd], { from: "user" })

    expect(process.exitCode).toBe(1)
    expect(logger.error).toHaveBeenCalledWith(
      expect.stringContaining("Invalid registry file")
    )
  })
})

async function createFixture(files: Record<string, string>) {
  const cwd = await fs.mkdtemp(path.join(tmpdir(), "marko-ui-registry-build-"))

  await Promise.all(
    Object.entries(files).map(async ([filePath, content]) => {
      const targetPath = path.join(cwd, filePath)
      await fs.mkdir(path.dirname(targetPath), { recursive: true })
      await fs.writeFile(targetPath, content)
    })
  )

  return cwd
}
