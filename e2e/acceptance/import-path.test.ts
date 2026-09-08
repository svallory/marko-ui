import { mkdir, readFile, writeFile } from "node:fs/promises"
import { join } from "node:path"
import { afterAll, beforeAll, describe, expect, it } from "vitest"
import { SHADCN_SPEC } from "./lib/env"
import { run } from "./lib/proc"
import { renderBuiltRoute } from "./lib/render"
import { scaffoldMarkoApp } from "./lib/scaffold"
import { cleanupTempWorkspace, makeTempWorkspace } from "./lib/workspace"

// Journey: `bun add @marko-ui/shadcn marko-zag`, import a plain component
// (button) and a zag-machine component (switch) directly from
// node_modules, wire the styles per the package README, build succeeds.
describe("import path: @marko-ui/shadcn as a direct dependency", () => {
  let workspace: string
  let appDir: string

  beforeAll(async () => {
    workspace = await makeTempWorkspace("import-path")
    appDir = await scaffoldMarkoApp(workspace)

    const install = await run(
      "bun",
      ["add", SHADCN_SPEC, "marko-zag", "marko@6.3.46"],
      { cwd: appDir, timeoutMs: 120_000 }
    )
    if (install.exitCode !== 0) {
      throw new Error(
        `bun add ${SHADCN_SPEC} failed:\n${install.stdout}\n${install.stderr}`
      )
    }
  }, 5 * 60_000)

  afterAll(async () => {
    if (workspace) await cleanupTempWorkspace(workspace)
  })

  it("ships current <zag> component source, not the retired three-tag wiring", async () => {
    const switchSource = await readFile(
      join(appDir, "node_modules/@marko-ui/shadcn/ui/switch/switch.marko"),
      "utf8"
    )
    expect(switchSource).toContain("<zag/api=")
  })

  it("wires the CSS entry per the shadcn README and builds", async () => {
    await mkdir(join(appDir, "src/tags"), { recursive: true })

    // packages/shadcn/README.md "Usage" — @source + globals.css + one style
    // layer in layer(components), plus the @custom-variant the docs
    // installation page calls out as required (silently dead without it).
    await writeFile(
      join(appDir, "src/styles/globals.css"),
      `@import "tailwindcss";
@source "../../node_modules/@marko-ui/shadcn";

@import "@marko-ui/shadcn/styles/globals.css";
@import "@marko-ui/shadcn/styles/style-vega.css" layer(components);

@custom-variant style-vega (&:where(.style-vega *));
`
    )

    const pagePath = join(appDir, "src/routes/+page.marko")
    const page = await readFile(pagePath, "utf8")
    const wired =
      `import Button from "@marko-ui/shadcn/ui/button/button.marko";\n` +
      `import Switch from "@marko-ui/shadcn/ui/switch/switch.marko";\n\n` +
      page.replace(
        "<mouse-mask/>",
        '<div class="style-vega">\n  <Button variant="outline">Import Path Button</Button>\n  <Switch aria-label="acceptance switch"/>\n</div>\n<mouse-mask/>'
      )
    await writeFile(pagePath, wired)

    const build = await run("bun", ["run", "build"], {
      cwd: appDir,
      timeoutMs: 3 * 60_000,
    })
    expect(
      build.exitCode,
      `bun run build failed:\n${build.stdout}\n${build.stderr}`
    ).toBe(0)

    const html = await renderBuiltRoute(appDir, "/")
    expect(html).toMatch(/Import Path Button/)
    // mu-* hook classes are the import path's public styling API (AGENTS.md
    // "Dual distribution") — their presence is what distinguishes this
    // journey's rendered output from the copy path's flat utility classes.
    expect(html).toMatch(/mu-button/)
  })
})
