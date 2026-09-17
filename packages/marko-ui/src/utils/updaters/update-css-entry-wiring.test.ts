import { promises as fs } from "fs"
import { mkdtemp, rm } from "fs/promises"
import { tmpdir } from "os"
import path from "path"
import { afterEach, beforeEach, describe, expect, test } from "vitest"
import {
  addCssImport,
  ensureVitePlugin,
  hasCssImport,
  hasTailwindPlugin,
  wireCssImport,
} from "@/src/utils/updaters/update-css-entry-wiring"
import type { Config } from "@/src/utils/get-config"

/**
 * Writing the stylesheet is not enough — it has to load. A `create-marko`
 * scaffold imports no CSS anywhere and ships no Vite config, so before this
 * updater existed `init` produced a project whose built CSS was 776 bytes with
 * no theme and no component utilities, and nothing reported a problem.
 *
 * Every "already wired, skipping" branch below is therefore a potential silent
 * failure: a false positive means `init` skips work the project needs and the
 * user gets an unstyled page with no error.
 */

const SCAFFOLD_LAYOUT = `<!doctype html>
<html lang="en">
  <head>
    <title>App</title>
  </head>
  <body>
    <\${input.content}/>
  </body>
</html>

<style>
  body { margin: 0; }
</style>
`

describe("hasCssImport", () => {
  test("finds the import as written", () => {
    const source = `import "../styles/globals.css";\n${SCAFFOLD_LAYOUT}`
    expect(hasCssImport(source, "../styles/globals.css")).toBe(true)
  })

  test("accepts the same specifier written without a leading ./", () => {
    expect(hasCssImport(`import "styles/globals.css";`, "./styles/globals.css")).toBe(
      true
    )
    expect(hasCssImport(`import "./styles/globals.css";`, "styles/globals.css")).toBe(
      true
    )
  })

  test("single quotes count", () => {
    expect(hasCssImport(`import '../styles/globals.css';`, "../styles/globals.css")).toBe(
      true
    )
  })

  test("a DIFFERENT stylesheet with the same basename does NOT count", () => {
    // The bug this replaced: matching on basename alone meant an unrelated
    // vendor import made `init` skip wiring the entry point, and the theme
    // silently never loaded.
    const source = `import "../vendor/globals.css";\n${SCAFFOLD_LAYOUT}`
    expect(hasCssImport(source, "../styles/globals.css")).toBe(false)
  })

  test("a commented-out import does NOT count", () => {
    expect(
      hasCssImport(`// import "../styles/globals.css";`, "../styles/globals.css")
    ).toBe(false)
    expect(
      hasCssImport(`/* import "../styles/globals.css"; */`, "../styles/globals.css")
    ).toBe(false)
  })

  test("a scaffold layout with no imports at all is not wired", () => {
    expect(hasCssImport(SCAFFOLD_LAYOUT, "../styles/globals.css")).toBe(false)
  })
})

describe("addCssImport", () => {
  test("puts the import on line 1, ahead of the doctype", () => {
    const out = addCssImport(SCAFFOLD_LAYOUT, "../styles/globals.css")
    expect(out.split("\n")[0]).toBe(`import "../styles/globals.css";`)
    expect(out).toContain("<!doctype html>")
  })

  test("the result satisfies hasCssImport — add then detect round-trips", () => {
    const out = addCssImport(SCAFFOLD_LAYOUT, "../styles/globals.css")
    expect(hasCssImport(out, "../styles/globals.css")).toBe(true)
  })
})

describe("hasTailwindPlugin", () => {
  test("detects the plugin under any local binding name", () => {
    expect(
      hasTailwindPlugin(`import tw from "@tailwindcss/vite";`)
    ).toBe(true)
    expect(
      hasTailwindPlugin(`import whatever from '@tailwindcss/vite';`)
    ).toBe(true)
  })

  test("a commented-out import does NOT count", () => {
    // Otherwise `init` reports the config as already wired and Tailwind never
    // runs — the same silent skip as the basename bug above.
    expect(
      hasTailwindPlugin(`// import tw from "@tailwindcss/vite";`)
    ).toBe(false)
    expect(
      hasTailwindPlugin(`/* import tw from "@tailwindcss/vite"; */`)
    ).toBe(false)
  })

  test("a config without the plugin is not wired", () => {
    expect(
      hasTailwindPlugin(`import marko from "@marko/run/vite";`)
    ).toBe(false)
  })
})

describe("wireCssImport / ensureVitePlugin against a real directory", () => {
  let dir: string

  const configFor = (cssRelative: string): Config =>
    ({
      resolvedPaths: {
        cwd: dir,
        tailwindCss: path.join(dir, cssRelative),
      },
    }) as unknown as Config

  beforeEach(async () => {
    dir = await mkdtemp(path.join(tmpdir(), "marko-ui-wiring-"))
  })

  afterEach(async () => {
    await rm(dir, { recursive: true, force: true })
  })

  async function writeLayout(contents: string) {
    await fs.mkdir(path.join(dir, "src/routes"), { recursive: true })
    await fs.writeFile(path.join(dir, "src/routes/+layout.marko"), contents, "utf8")
  }

  test("virgin scaffold: adds the import", async () => {
    await writeLayout(SCAFFOLD_LAYOUT)

    const result = await wireCssImport(configFor("src/styles/globals.css"), {
      silent: true,
    })

    expect(result).toBe("added")
    const layout = await fs.readFile(
      path.join(dir, "src/routes/+layout.marko"),
      "utf8"
    )
    expect(layout.split("\n")[0]).toBe(`import "../styles/globals.css";`)
  })

  test("already present: leaves the layout byte-identical", async () => {
    const wired = `import "../styles/globals.css";\n${SCAFFOLD_LAYOUT}`
    await writeLayout(wired)

    const result = await wireCssImport(configFor("src/styles/globals.css"), {
      silent: true,
    })

    expect(result).toBe("already-present")
    const layout = await fs.readFile(
      path.join(dir, "src/routes/+layout.marko"),
      "utf8"
    )
    expect(layout).toBe(wired)
  })

  test("running twice is idempotent — no stacked imports", async () => {
    await writeLayout(SCAFFOLD_LAYOUT)
    const config = configFor("src/styles/globals.css")

    await wireCssImport(config, { silent: true })
    const afterFirst = await fs.readFile(
      path.join(dir, "src/routes/+layout.marko"),
      "utf8"
    )
    const second = await wireCssImport(config, { silent: true })
    const afterSecond = await fs.readFile(
      path.join(dir, "src/routes/+layout.marko"),
      "utf8"
    )

    expect(second).toBe("already-present")
    expect(afterSecond).toBe(afterFirst)
    expect(afterSecond.match(/import "\.\.\/styles\/globals\.css";/g)).toHaveLength(1)
  })

  test("an unrelated same-basename import still gets wired", async () => {
    // The regression guard for the basename bug, end to end.
    await writeLayout(`import "../vendor/globals.css";\n${SCAFFOLD_LAYOUT}`)

    const result = await wireCssImport(configFor("src/styles/globals.css"), {
      silent: true,
    })

    expect(result).toBe("added")
    const layout = await fs.readFile(
      path.join(dir, "src/routes/+layout.marko"),
      "utf8"
    )
    expect(layout).toContain(`import "../styles/globals.css";`)
    expect(layout).toContain(`import "../vendor/globals.css";`)
  })

  test("no layout: reports it instead of failing silently", async () => {
    const result = await wireCssImport(configFor("src/styles/globals.css"), {
      silent: true,
    })
    expect(result).toBe("no-layout")
  })

  test("virgin scaffold: creates vite.config.ts with the plugin", async () => {
    const result = await ensureVitePlugin(configFor("src/styles/globals.css"), {
      silent: true,
    })

    expect(result).toBe("created")
    const config = await fs.readFile(path.join(dir, "vite.config.ts"), "utf8")
    expect(hasTailwindPlugin(config)).toBe(true)
    expect(config).toContain("@marko/run/vite")
  })

  test("existing config with the plugin: left alone", async () => {
    const existing = `import marko from "@marko/run/vite";
import tw from "@tailwindcss/vite";
export default { plugins: [tw(), marko()] };
`
    await fs.writeFile(path.join(dir, "vite.config.ts"), existing, "utf8")

    const result = await ensureVitePlugin(configFor("src/styles/globals.css"), {
      silent: true,
    })

    expect(result).toBe("already-present")
    expect(await fs.readFile(path.join(dir, "vite.config.ts"), "utf8")).toBe(existing)
  })

  test("existing config WITHOUT the plugin: reported as manual, never rewritten", async () => {
    // Editing arbitrary config code is unreliable, so the user is told rather
    // than having their file rewritten under them.
    const existing = `import marko from "@marko/run/vite";
export default { plugins: [marko()] };
`
    await fs.writeFile(path.join(dir, "vite.config.ts"), existing, "utf8")

    const result = await ensureVitePlugin(configFor("src/styles/globals.css"), {
      silent: true,
    })

    expect(result).toBe("manual")
    expect(await fs.readFile(path.join(dir, "vite.config.ts"), "utf8")).toBe(existing)
  })

  test("a config whose only plugin import is commented out is reported as manual", async () => {
    const existing = `import marko from "@marko/run/vite";
// import tw from "@tailwindcss/vite";
export default { plugins: [marko()] };
`
    await fs.writeFile(path.join(dir, "vite.config.ts"), existing, "utf8")

    const result = await ensureVitePlugin(configFor("src/styles/globals.css"), {
      silent: true,
    })

    expect(result).toBe("manual")
  })

  test("a .js config counts — not just vite.config.ts", async () => {
    await fs.writeFile(
      path.join(dir, "vite.config.js"),
      `import tw from "@tailwindcss/vite";\n`,
      "utf8"
    )

    const result = await ensureVitePlugin(configFor("src/styles/globals.css"), {
      silent: true,
    })

    expect(result).toBe("already-present")
    // It must not also create a .ts config beside the .js one.
    await expect(
      fs.access(path.join(dir, "vite.config.ts"))
    ).rejects.toThrow()
  })
})
