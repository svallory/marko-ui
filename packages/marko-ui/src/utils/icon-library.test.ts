import { cpSync, mkdirSync, mkdtempSync, readdirSync, readFileSync, writeFileSync } from "fs"
import { tmpdir } from "os"
import path from "path"
import { describe, expect, it, vi } from "vitest"

import { logger } from "@/src/utils/logger"
import type { Config } from "@/src/utils/get-config"
import { processFiles, type DryRunResult } from "./dry-run"
import { updateFiles } from "./updaters/update-files"
import {
  applyIconLibrary,
  findStaleIconMaps,
  GENERATED_MAP_MARKER,
  mapFilePattern,
  unknownIconLibraryMessage,
  isIconResolverPath,
  ICON_LIBRARIES,
  isIconLibraryName,
  renderIconResolver,
  type IconLibraryName,
} from "./icon-library"

const LIBRARIES = Object.keys(ICON_LIBRARIES) as IconLibraryName[]
const REAL_ICON_DIR = path.resolve(__dirname, "../../../shadcn/ui/icon")

const GENERATED = `// ${GENERATED_MAP_MARKER}. Do not edit by hand.\nexport {};\n`

const iconFile = (name: string, content = `// ${name}`) => ({
  path: `ui/icon/${name}`,
  type: "registry:file" as const,
  target: `~/src/components/ui/icon/${name}`,
  content,
})

// The icon item's file list as build-registry.ts emits it.
const iconItemFiles = () => [
  ...LIBRARIES.map((lib) => iconFile(`__${lib}__.ts`, GENERATED)),
  iconFile("client-swap.ts"),
  iconFile("icon-mapping.json", "{}"),
  iconFile("icon-names.ts"),
  iconFile("icon.marko"),
  iconFile("render.ts"),
  iconFile("resolve.ts", "// registry resolver"),
]

const paths = (files: ReturnType<typeof iconItemFiles> | undefined) =>
  (files ?? []).map((f) => path.basename(f.path)).sort()

describe("isIconLibraryName", () => {
  it.each(LIBRARIES)("accepts %s", (lib) => {
    expect(isIconLibraryName(lib)).toBe(true)
  })
  it.each(["heroicons", "", "LUCIDE", "toString", "__proto__", undefined, 3, null])(
    "rejects %s",
    (value) => {
      expect(isIconLibraryName(value)).toBe(false)
    }
  )
})

describe("applyIconLibrary", () => {
  it.each(LIBRARIES)("keeps only the %s map and drops switcher/data files", (lib) => {
    const out = applyIconLibrary(iconItemFiles(), lib)
    expect(paths(out as never)).toEqual(
      ["icon-names.ts", "icon.marko", "render.ts", "resolve.ts", `__${lib}__.ts`].sort()
    )
  })

  it.each(LIBRARIES)("rewrites resolve.ts to import only %s", (lib) => {
    const out = applyIconLibrary(iconItemFiles(), lib)!
    const resolve = out.find((f) => f.path.endsWith("resolve.ts"))!
    expect(resolve.content).toBe(renderIconResolver(lib))
    expect(resolve.content).toContain(`from "./__${lib}__.ts"`)
    for (const other of LIBRARIES.filter((l) => l !== lib)) {
      expect(resolve.content).not.toContain(`__${other}__`)
      expect(resolve.content).not.toContain(ICON_LIBRARIES[other].ident)
    }
  })

  it("preserves file target/type and leaves untouched files byte-identical", () => {
    const input = iconItemFiles()
    const out = applyIconLibrary(input, "tabler")!
    for (const name of ["icon.marko", "render.ts", "icon-names.ts"]) {
      expect(out.find((f) => f.path.endsWith(name))).toEqual(
        input.find((f) => f.path.endsWith(name))
      )
    }
    const resolve = out.find((f) => f.path.endsWith("resolve.ts"))!
    expect(resolve.target).toBe("~/src/components/ui/icon/resolve.ts")
    expect(resolve.type).toBe("registry:file")
  })

  it("does not mutate its input", () => {
    const input = iconItemFiles()
    const snapshot = JSON.stringify(input)
    applyIconLibrary(input, "phosphor")
    expect(JSON.stringify(input)).toBe(snapshot)
  })

  it("leaves non-icon files alone, including lookalike paths", () => {
    const others = [
      { path: "ui/button/button.marko", type: "registry:ui" as const, content: "a" },
      { path: "ui/button/resolve.ts", type: "registry:file" as const, target: "~/x", content: "b" },
      { path: "ui/icons-extra/__lucide__.ts", type: "registry:file" as const, target: "~/x", content: "c" },
      { path: "lib/utils.ts", type: "registry:lib" as const, content: "d" },
    ]
    expect(applyIconLibrary(others, "tabler")).toEqual(others)
  })

  it("filters other libraries' maps out of a mixed file list", () => {
    const button = { path: "ui/button/button.marko", type: "registry:ui" as const, content: "x" }
    const out = applyIconLibrary([button, ...iconItemFiles()], "remixicon")!
    expect(out[0]).toEqual(button)
    expect(out.map((f) => f.path)).not.toContain("ui/icon/__lucide__.ts")
    expect(out.map((f) => f.path)).toContain("ui/icon/__remixicon__.ts")
  })

  it("also matches paths without a leading directory (nested registry roots)", () => {
    const out = applyIconLibrary(
      [
        { path: "registry/x/ui/icon/__lucide__.ts", type: "registry:file" as const, target: "~/x", content: "" },
        { path: "registry/x/ui/icon/__tabler__.ts", type: "registry:file" as const, target: "~/x", content: "" },
      ],
      "tabler"
    )!
    expect(out.map((f) => f.path)).toEqual(["registry/x/ui/icon/__tabler__.ts"])
  })

  it.each([undefined, "", "radix"])(
    "passes files through unchanged for unset/legacy iconLibrary %j",
    (lib) => {
      const input = iconItemFiles()
      expect(applyIconLibrary(input, lib)).toBe(input)
    }
  )

  it("handles empty and undefined file lists", () => {
    expect(applyIconLibrary(undefined, "lucide")).toBeUndefined()
    expect(applyIconLibrary([], "lucide")).toEqual([])
  })

  it("is idempotent", () => {
    const once = applyIconLibrary(iconItemFiles(), "hugeicons")
    expect(applyIconLibrary(once, "hugeicons")).toEqual(once)
  })
})

describe("renderIconResolver", () => {
  it("uses the node renderer only for hugeicons", () => {
    expect(renderIconResolver("hugeicons")).toContain("renderHugeiconsNodes(nodes)")
    for (const lib of LIBRARIES.filter((l) => l !== "hugeicons")) {
      expect(renderIconResolver(lib)).not.toContain("renderHugeiconsNodes")
    }
  })

  it("exports the same API as the registry resolve.ts", () => {
    const real = readFileSync(path.join(REAL_ICON_DIR, "resolve.ts"), "utf8")
    for (const lib of LIBRARIES) {
      for (const name of ["resolveIconLibrary", "resolveIconInner"]) {
        expect(real).toContain(`export function ${name}(`)
        expect(renderIconResolver(lib)).toContain(`export function ${name}(`)
      }
    }
  })
})

// Runs the generated resolver against the REAL generated maps from the
// registry source, so a drifted export name / render path fails here.
describe("generated resolver against the real icon maps", () => {
  it.each(LIBRARIES)("%s resolves a real icon and ignores the library prop", async (lib) => {
    const dir = mkdtempSync(path.join(tmpdir(), "marko-ui-icon-"))
    for (const f of readdirSync(REAL_ICON_DIR)) {
      if (f.endsWith(".ts") && f !== "resolve.ts" && f !== "client-swap.ts") {
        if (/^__/.test(f) && f !== `__${lib}__.ts`) continue
        cpSync(path.join(REAL_ICON_DIR, f), path.join(dir, f))
      }
    }
    writeFileSync(path.join(dir, "resolve.ts"), renderIconResolver(lib))

    const mod = await import(/* @vite-ignore */ path.join(dir, "resolve.ts"))
    expect(mod.resolveIconLibrary("tabler")).toBe(lib)
    expect(mod.resolveIconLibrary(undefined)).toBe(lib)

    const inner = mod.resolveIconInner("SearchIcon", "lucide")
    expect(typeof inner).toBe("string")
    expect(inner.length).toBeGreaterThan(0)
    // Not the fallback square, i.e. the icon really came from this map.
    expect(inner).not.toBe('<rect width="18" height="18" x="3" y="3" rx="2"/>')
    // Unknown names still fall back instead of throwing.
    expect(mod.resolveIconInner("NoSuchIconAnywhere")).toContain("<rect")
  })
})

describe("MAP_FILE tracks ICON_LIBRARIES", () => {
  it("the registry ships exactly one map per library the CLI knows", () => {
    const shipped = readdirSync(REAL_ICON_DIR)
      .map((f) => /^__([a-z]+)__\.ts$/.exec(f)?.[1])
      .filter(Boolean)
      .sort()
    expect(shipped).toEqual([...LIBRARIES].sort())
  })

  it("recognises every known library's map as a map (never passes it through)", () => {
    for (const lib of LIBRARIES) {
      const other = LIBRARIES.find((l) => l !== lib)!
      const out = applyIconLibrary([iconFile(`__${other}__.ts`)], lib)
      expect(out).toEqual([])
    }
  })
})

describe("unknown iconLibrary", () => {
  it("does not throw: warns once and leaves every file untouched", () => {
    const warn = vi.spyOn(logger, "warn").mockImplementation(() => {})
    const input = iconItemFiles()
    expect(applyIconLibrary(input, "heroicons")).toBe(input)
    expect(applyIconLibrary(input, "heroicons")).toBe(input)
    expect(warn).toHaveBeenCalledTimes(1)
    const msg = warn.mock.calls[0][0] as string
    expect(msg).toContain('"heroicons"')
    for (const lib of LIBRARIES) expect(msg).toContain(lib)
    expect(msg).toBe(unknownIconLibraryMessage("heroicons"))
    warn.mockRestore()
  })

  it("stays quiet when warn is disabled or no icon files are involved", () => {
    const warn = vi.spyOn(logger, "warn").mockImplementation(() => {})
    applyIconLibrary(iconItemFiles(), "feather", { warn: false })
    const button = [{ path: "ui/button/button.marko", type: "registry:ui" as const, content: "x" }]
    expect(applyIconLibrary(button, "feather")).toBe(button)
    expect(warn).not.toHaveBeenCalled()
    warn.mockRestore()
  })

  it("passes legacy radix and unset/empty values through silently, like upstream", () => {
    const warn = vi.spyOn(logger, "warn").mockImplementation(() => {})
    for (const lib of ["radix", "", undefined]) {
      const input = iconItemFiles()
      expect(applyIconLibrary(input, lib)).toBe(input)
    }
    expect(warn).not.toHaveBeenCalled()
    warn.mockRestore()
  })
})

describe("mapFilePattern", () => {
  it("escapes regex metacharacters in library keys", () => {
    const re = mapFilePattern(["a.b", "c+d", "(e)"])
    expect(re.test("ui/icon/__a.b__.ts")).toBe(true)
    expect(re.test("ui/icon/__aXb__.ts")).toBe(false)
    expect(re.test("ui/icon/__c+d__.ts")).toBe(true)
    expect(re.test("ui/icon/__ccd__.ts")).toBe(false)
    expect(re.test("ui/icon/__(e)__.ts")).toBe(true)
  })
})

describe("findStaleIconMaps", () => {
  it("splits other libraries' maps into generated (deletable) and hand-written (skipped)", () => {
    const dir = mkdtempSync(path.join(tmpdir(), "marko-ui-stale-"))
    writeFileSync(path.join(dir, "__lucide__.ts"), GENERATED)
    writeFileSync(path.join(dir, "__tabler__.ts"), "export const mine = 1\n")
    writeFileSync(path.join(dir, "__custom__.ts"), GENERATED)
    writeFileSync(path.join(dir, "notes.ts"), "")
    const names = (r: string[]) => r.map((f) => path.basename(f))

    const forHuge = findStaleIconMaps(dir, "hugeicons")
    expect(names(forHuge.deletable)).toEqual(["__lucide__.ts"])
    expect(names(forHuge.skipped)).toEqual(["__tabler__.ts"])

    const forTabler = findStaleIconMaps(dir, "tabler")
    expect(names(forTabler.deletable)).toEqual(["__lucide__.ts"])
    expect(forTabler.skipped).toEqual([])
  })

  it("isIconResolverPath matches only the icon resolver", () => {
    expect(isIconResolverPath("ui/icon/resolve.ts")).toBe(true)
    expect(isIconResolverPath("ui/button/resolve.ts")).toBe(false)
  })
})

describe("updateFiles: switching iconLibrary", () => {
  const setup = (lib: string) => {
    const cwd = mkdtempSync(path.join(tmpdir(), "marko-ui-switch-"))
    writeFileSync(path.join(cwd, "package.json"), "{}")
    const ui = path.join(cwd, "src/components/ui")
    const config = {
      iconLibrary: lib,
      resolvedPaths: { cwd, ui, components: path.join(cwd, "src/components"), lib: "", hooks: "" },
    } as unknown as Config
    return { cwd, config, iconDir: path.join(ui, "icon") }
  }
  const run = (config: Config) =>
    updateFiles(iconItemFiles(), config, { overwrite: true, silent: true, interactive: false })
  const maps = (dir: string) => readdirSync(dir).filter((f) => /^__.*__\.ts$/.test(f))

  it("removes the old library's map and keeps only the new one", async () => {
    const { config, iconDir } = setup("lucide")
    await run(config)
    expect(maps(iconDir)).toEqual(["__lucide__.ts"])

    config.iconLibrary = "tabler"
    const result = await run(config)
    expect(maps(iconDir)).toEqual(["__tabler__.ts"])
    expect(result.filesRemoved.map((f) => path.basename(f))).toEqual(["__lucide__.ts"])
    expect(readFileSync(path.join(iconDir, "resolve.ts"), "utf8")).toContain("__tabler__.ts")
  })

  it("leaves unrelated files and a custom __x__.ts alone", async () => {
    const { config, iconDir } = setup("lucide")
    await run(config)
    writeFileSync(path.join(iconDir, "__custom__.ts"), "")
    writeFileSync(path.join(iconDir, "keep.ts"), "")
    config.iconLibrary = "phosphor"
    await run(config)
    expect(readdirSync(iconDir)).toEqual(expect.arrayContaining(["__custom__.ts", "keep.ts"]))
    expect(maps(iconDir).sort()).toEqual(["__custom__.ts", "__phosphor__.ts"])
  })

  it("keeps a hand-written __<lib>__.ts and warns instead of deleting it", async () => {
    const warn = vi.spyOn(logger, "warn").mockImplementation(() => {})
    const { config, iconDir } = setup("lucide")
    await run(config)
    writeFileSync(path.join(iconDir, "__lucide__.ts"), "export const mine = 1\n")
    config.iconLibrary = "tabler"
    const result = await updateFiles(iconItemFiles(), config, {
      overwrite: true,
      silent: false,
      interactive: false,
    })
    expect(result.filesRemoved).toEqual([])
    expect(readFileSync(path.join(iconDir, "__lucide__.ts"), "utf8")).toBe("export const mine = 1\n")
    expect(warn.mock.calls.some((c) => String(c[0]).includes("not a generated icon map"))).toBe(true)
    warn.mockRestore()
  })

  it("removes nothing outside the configured icon dir", async () => {
    const { cwd, config } = setup("lucide")
    const elsewhere = path.join(cwd, "src/other")
    mkdirSync(elsewhere, { recursive: true })
    writeFileSync(path.join(elsewhere, "__lucide__.ts"), "")
    await run(config)
    config.iconLibrary = "tabler"
    await run(config)
    expect(readdirSync(elsewhere)).toEqual(["__lucide__.ts"])
  })

  it("re-adding the same library removes nothing", async () => {
    const { config } = setup("remixicon")
    await run(config)
    expect((await run(config)).filesRemoved).toEqual([])
  })

  it("keeps the old map when the user declines the resolver overwrite", async () => {
    const { config, iconDir } = setup("lucide")
    await run(config)
    config.iconLibrary = "tabler"
    // non-interactive without overwrite: existing resolve.ts is skipped
    await updateFiles(iconItemFiles(), config, { overwrite: false, silent: true, interactive: false })
    expect(maps(iconDir)).toContain("__lucide__.ts")
  })

  it("an unknown iconLibrary warns and ships the files as-is (no throw, nothing deleted)", async () => {
    const warn = vi.spyOn(logger, "warn").mockImplementation(() => {})
    const { config, iconDir } = setup("lucide")
    await run(config)
    config.iconLibrary = "zzz-unknown"
    const result = await updateFiles(iconItemFiles(), config, {
      overwrite: true,
      silent: false,
      interactive: false,
    })
    expect(result.filesRemoved).toEqual([])
    expect(maps(iconDir).sort()).toEqual(LIBRARIES.map((l) => `__${l}__.ts`).sort())
    expect(warn.mock.calls.some((c) => String(c[0]).includes('"zzz-unknown"'))).toBe(true)
    warn.mockRestore()
  })
})

describe("dry-run lists stale icon maps without deleting them", () => {
  it("reports removals and leaves the file", async () => {
    const cwd = mkdtempSync(path.join(tmpdir(), "marko-ui-dry-"))
    writeFileSync(path.join(cwd, "package.json"), "{}")
    const ui = path.join(cwd, "src/components/ui")
    const config = {
      iconLibrary: "lucide",
      resolvedPaths: { cwd, ui, components: path.join(cwd, "src/components"), lib: "", hooks: "" },
    } as unknown as Config
    await updateFiles(iconItemFiles(), config, { overwrite: true, silent: true, interactive: false })
    config.iconLibrary = "tabler"

    const result: DryRunResult = { files: [], dependencies: [], devDependencies: [], css: null, envVars: null, fonts: [], docs: null }
    await processFiles({ files: iconItemFiles() } as never, config, result, {})
    expect(result.removals?.map((f) => f.replace(/\\/g, "/"))).toEqual([
      "src/components/ui/icon/__lucide__.ts",
    ])
    expect(readdirSync(path.join(ui, "icon"))).toContain("__lucide__.ts")
  })
})
