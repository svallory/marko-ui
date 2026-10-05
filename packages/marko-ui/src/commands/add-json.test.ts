import {
  existsSync,
  mkdirSync,
  mkdtempSync,
  readdirSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from "fs"
import { tmpdir } from "os"
import path from "path"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

/**
 * Command-level tests: each mutating command's JSON, run against a REAL
 * fixture project on disk.
 *
 * The round-1 suite only tested the helper functions, which is exactly why
 * five defects survived it — `unchanged` was never emitted, `items.resolved`
 * was a copy of `requested`, init under-reported its files, and the dry run
 * called every dependency `installed`. All four are statements about what a
 * command PRINTS after doing real work, so they can only be pinned by running
 * the command.
 *
 * The registry and the package manager are the only stubs. Everything else —
 * path resolution, file writing, content comparison, status assignment — is
 * the real code path, because that is where the bugs were.
 */

const { resolveRegistryTree, mockDeps, mockCss } = vi.hoisted(() => ({
  resolveRegistryTree: vi.fn(),
  mockDeps: vi.fn(),
  mockCss: vi.fn(),
}))

vi.mock("@/src/registry/resolver", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@/src/registry/resolver")>()),
  resolveRegistryTree: (...args: unknown[]) => resolveRegistryTree(...args),
}))

// The package manager must not actually run: no network, and the assertion is
// about what the result REPORTS, not about bun.
vi.mock("@/src/utils/updaters/update-dependencies", () => ({
  updateDependencies: (...args: unknown[]) => mockDeps(...args),
}))

vi.mock("@/src/utils/updaters/update-css", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@/src/utils/updaters/update-css")>()),
  updateCss: (...args: unknown[]) => mockCss(...args),
}))

import { add } from "./add"
import { diff } from "./diff"
import { resetJsonMode, setJsonMode } from "@/src/utils/output-mode"

const BUTTON_MARKO = `<button class="mu-button">\${content}</button>\n`
const VARIANTS = `export const variants = {}\n`
const UTILS = `export function cn(...x: unknown[]) { return x }\n`
const DIALOG_MARKO = `<dialog class="mu-dialog">\${content}</dialog>\n`

let dir: string

/** Files the FIXTURE creates, which no add run wrote. */
const FIXTURE_FILES = [
  "package.json",
  "components.json",
  "tsconfig.json",
  "src/app.css",
]

/** Every file under `root`, as cwd-relative POSIX-ish paths. */
function listFiles(root: string, base = root): string[] {
  const out: string[] = []
  for (const entry of readdirSync(root, { withFileTypes: true })) {
    const full = path.join(root, entry.name)
    if (entry.isDirectory()) {
      out.push(...listFiles(full, base))
    } else {
      out.push(path.relative(base, full))
    }
  }
  return out
}

function writeFile(rel: string, content: string) {
  const target = path.join(dir, rel)
  mkdirSync(path.dirname(target), { recursive: true })
  writeFileSync(target, content, "utf8")
}

function read(rel: string) {
  return readFileSync(path.join(dir, rel), "utf8")
}

/**
 * The reported file whose path ENDS with `suffix`.
 *
 * The resolver decides the on-disk layout from the item's `target` and the
 * project's aliases, and this fixture deliberately does not try to predict it:
 * asserting the document agrees with the filesystem is the point, and a
 * hardcoded layout that drifts from the resolver would fail for the wrong
 * reason.
 */
function fileNamed(
  files: { path: string; status?: string }[],
  suffix: string
) {
  return files.find((f) => f.path.endsWith(suffix))
}

/** A project shaped like `create-marko`, with no components.json yet. */
function fixtureProject() {
  writeFile(
    "package.json",
    JSON.stringify({
      name: "fixture",
      type: "module",
      dependencies: {
        marko: "^6.3.46",
        "@marko/run": "^0.7.0",
        // Declared on purpose: the dry-run test needs at least one package
        // that is ALREADY here, so `present` is a real assertion rather than a
        // branch that never runs.
        clsx: "^2.1.1",
      },
    })
  )
  writeFile(
    "tsconfig.json",
    JSON.stringify({
      compilerOptions: { noEmit: true, paths: { "@/*": ["./src/*"] } },
    })
  )
  writeFile("src/app.css", '@import "tailwindcss";\n')
}

function buttonTree() {
  return {
    dependencies: ["clsx", "tailwind-merge"],
    devDependencies: [],
    files: [
      {
        path: "button.marko",
        type: "registry:ui",
        target: "ui/button/button.marko",
        content: BUTTON_MARKO,
      },
      {
        path: "variants.ts",
        type: "registry:ui",
        target: "ui/button/variants.ts",
        content: VARIANTS,
      },
      {
        path: "utils.ts",
        type: "registry:lib",
        target: "lib/utils.ts",
        content: UTILS,
      },
    ],
    css: undefined,
    cssVars: {},
    tailwind: undefined,
    // `button` pulls `icon` in: the resolver attached these names so `add`
    // can report what it ACTUALLY installed rather than what it was asked
    // for.
    items: ["button", "icon"],
    dependencyItems: ["icon"],
  }
}

/** A config object shaped like the real resolved one. */
function config(overrides: Record<string, unknown> = {}) {
  return {
    $schema: "",
    style: "default",
    rsc: false,
    tsx: true,
    distribution: "copy",
    visualStyle: "vega",
    iconLibrary: "lucide",
    tailwind: { config: "", css: "src/app.css", baseColor: "neutral", cssVariables: true, prefix: "" },
    aliases: {
      components: "@/components",
      utils: "@/lib/utils",
      ui: "@/components/ui",
      lib: "@/lib",
      hooks: "@/hooks",
    },
    registries: {},
    resolvedPaths: {
      cwd: dir,
      tailwindConfig: "",
      tailwindCss: path.join(dir, "src/app.css"),
      utils: path.join(dir, "src/lib"),
      components: path.join(dir, "src/components"),
      lib: path.join(dir, "src/lib"),
      hooks: path.join(dir, "src/hooks"),
      ui: path.join(dir, "src/components/ui"),
    },
    ...overrides,
  }
}

/** The installed dependencies updateDependencies would report. */
function depsReport() {
  return [
    { name: "clsx", status: "installed" as const },
    { name: "tailwind-merge", status: "installed" as const },
  ]
}

/**
 * Runs a command and returns what a caller would see: the bytes on stdout,
 * the bytes on stderr, and the parsed JSON if stdout held a document.
 */
async function run(command: any, argv: string[]) {
  const out: string[] = []
  const err: string[] = []
  // BOTH writers, because the CLI has both: the JSON envelope goes through
  // `process.stdout.write` (printJson) and the human lists/spinners go through
  // `console.log` (logger). Spying on only one of them silently captures half
  // the output — which is how this file's first draft saw empty stdout.
  const stdout = vi.spyOn(process.stdout, "write").mockImplementation((chunk: unknown) => {
    out.push(String(chunk))
    return true
  })
  const logSpy = vi.spyOn(console, "log").mockImplementation((...args) => {
    out.push(`${args.join(" ")}\n`)
  })
  const errorSpy = vi.spyOn(console, "error").mockImplementation((...args) => {
    err.push(`${args.join(" ")}\n`)
  })

  const exit = vi.spyOn(process, "exit").mockImplementation((code) => {
    throw new Error(`exit:${code}`)
  })

  let exitCode: number | undefined
  try {
    await command.parseAsync(argv, { from: "user" })
  } catch (error) {
    const match = /^exit:(\d+)$/.exec((error as Error).message)
    if (match) exitCode = Number(match[1])
    else throw error
  }

  stdout.mockRestore()
  logSpy.mockRestore()
  errorSpy.mockRestore()
  exit.mockRestore()

  const text = out.join("")
  return {
    exitCode,
    stdout: text,
    stderr: err.join(""),
    json: <T>() => JSON.parse(text) as T,
    statuses: () =>
      (JSON.parse(text).data?.files ?? []).map(
        (f: { status: string }) => f.status
      ),
  }
}

beforeEach(() => {
  dir = mkdtempSync(path.join(tmpdir(), "marko-ui-add-json-"))
  fixtureProject()
  // The RAW config: `resolvedPaths` is computed by the loader, and writing it
  // into the file is exactly the INVALID_CONFIG the fixture hit first.
  const { resolvedPaths: _resolved, ...rawConfig } = config()
  writeFile("components.json", JSON.stringify(rawConfig, null, 2))
  resolveRegistryTree.mockReset().mockResolvedValue(buttonTree())
  mockDeps.mockReset().mockImplementation(async () => depsReport())
  mockCss.mockReset().mockImplementation(async () => path.join(dir, "src/app.css"))
  resetJsonMode()
  setJsonMode(false)
})

afterEach(() => {
  resetJsonMode()
  vi.restoreAllMocks()
})

describe("add --json, end to end on a fixture project", () => {
  it("a fresh install reports every file as created", async () => {
    const result = await run(add, ["button", "-y", "--json", "--cwd", dir])

    const data = result.json<{ data: { files: { path: string; status: string }[] } }>()
      .data
    expect(data.files.length).toBeGreaterThan(0)
    expect(data.files.filter((f) => !f.path.endsWith("app.css")).every((f) => f.status === "created")).toBe(true)

    // And it is true ON DISK, not just in the document: every path the
    // document reports exists, with the content it claims to have written.
    for (const file of data.files) {
      expect(read(file.path), file.path).toBeTruthy()
    }
    const button = fileNamed(data.files, "button/button.marko")
    expect(read(button!.path)).toBe(BUTTON_MARKO)
    expect(read(fileNamed(data.files, "variants.ts")!.path)).toBe(VARIANTS)
  })

  // F1: a re-run of identical files must say `unchanged`. `skipped` means
  // "exists and DIFFERS, left alone" — conflating the two is what round 1
  // shipped, and it made a no-op look like a refusal.
  it("a re-run of identical files reports unchanged, not skipped", async () => {
    await run(add, ["button", "-y", "--json", "--cwd", dir])
    const again = await run(add, ["button", "-y", "--json", "--cwd", dir])

    const files = again.json<{
      data: { files: { path: string; status: string }[] }
    }>().data.files
    // Every COMPONENT file is unchanged. The stylesheet is excluded on
    // purpose: `updateCss` is stubbed here and reports a write every call, so
    // asserting anything about it would be asserting the stub.
    const componentFiles = files.filter((f) => !f.path.endsWith("app.css"))
    expect(componentFiles.length).toBeGreaterThan(0)
    expect(componentFiles.every((f) => f.status === "unchanged")).toBe(true)
    expect(componentFiles.some((f) => f.status === "skipped")).toBe(false)
    expect(componentFiles.some((f) => f.status === "created")).toBe(false)
  })

  it("--overwrite on an EDITED file reports updated", async () => {
    const first = await run(add, ["button", "-y", "--json", "--cwd", dir])
    const path0 = fileNamed(
      first.json<{ data: { files: { path: string }[] } }>().data.files,
      "button/button.marko"
    )!.path
    writeFile(path0, "// edited\n")

    const result = await run(add, [
      "button",
      "-y",
      "--overwrite",
      "--json",
      "--cwd",
      dir,
    ])
    const files = result.json<{ data: { files: { path: string; status: string }[] } }>()
      .data.files
    expect(fileNamed(files, "button/button.marko")?.status).toBe("updated")
    // True on disk: the edit was replaced.
    expect(read(path0)).toBe(BUTTON_MARKO)
  })

  it("a differing file with --overwrite OFF is skipped, not unchanged", async () => {
    const first = await run(add, ["button", "-y", "--json", "--cwd", dir])
    const path0 = fileNamed(
      first.json<{ data: { files: { path: string }[] } }>().data.files,
      "button/button.marko"
    )!.path
    writeFile(path0, "// edited\n")

    const result = await run(add, ["button", "-y", "--json", "--cwd", dir])
    const files = result.json<{ data: { files: { path: string; status: string }[] } }>()
      .data.files
    expect(fileNamed(files, "button/button.marko")?.status).toBe("skipped")
    // Not overwritten: the user's edit survives.
    expect(read(path0)).toBe("// edited\n")
  })

  // F2: `resolved` was a copy of `requested`, so `add button` claimed to
  // install one component while writing files for two.
  it("reports the items it RESOLVED, including pulled-in registry dependencies", async () => {
    const result = await run(add, ["button", "-y", "--json", "--cwd", dir])
    const data = result.json<{
      data: {
        items: { requested: string[]; resolved: string[] }
        registryDependencies: string[]
      }
    }>().data

    expect(data.items.requested).toEqual(["button"])
    expect(data.items.resolved).toContain("button")
    expect(data.items.resolved).toContain("icon")
    expect(data.registryDependencies).toEqual(["icon"])
  })

  // F7: a dry run reported `installed` for everything, including packages
  // the project's package.json already declared.
  it("a dry run reports present vs would-install from package.json, and installs nothing", async () => {
    const before = read("package.json")
    const result = await run(add, [
      "button",
      "--dry-run",
      "--json",
      "--cwd",
      dir,
    ])

    const data = result.json<{
      data: {
        dryRun: boolean
        dependencies: { name: string; status: string }[]
        files: { status: string }[]
      }
    }>().data

    expect(data.dryRun).toBe(true)
    // Declared in the fixture -> present, NOT "installed".
    expect(
      data.dependencies.find((d) => d.name === "clsx")?.status
    ).toBe("present")
    // Never "installed" from a dry run: nothing ran.
    expect(data.dependencies.some((d) => d.status === "installed")).toBe(false)
    // Planned statuses, and nothing written.
    expect(data.files.every((f) => f.status === "created")).toBe(true)
    expect(read("package.json")).toBe(before)
  })

  // B1: a dry run that reports fewer items than the real add, while listing
  // that item's dependencies' FILES, understates its own plan. Same request,
  // same resolution, on both paths.
  it("reports the same resolved set as the real add for the same request", async () => {
    const preview = await run(add, [
      "button",
      "--dry-run",
      "--json",
      "--cwd",
      dir,
    ])
    const real = await run(add, ["button", "-y", "--json", "--cwd", dir])

    const previewData = preview.json<{
      data: { items: { resolved: string[] }; registryDependencies: string[] }
    }>().data
    const realData = real.json<{
      data: { items: { resolved: string[] }; registryDependencies: string[] }
    }>().data

    expect(previewData.items.resolved).toEqual(realData.items.resolved)
    expect(previewData.registryDependencies).toEqual(
      realData.registryDependencies
    )
    // And it is not just the requested name echoed back.
    expect(previewData.items.resolved.length).toBeGreaterThan(1)
    expect(previewData.registryDependencies.length).toBeGreaterThan(0)
  })

  it("emits exactly one JSON document on stdout and nothing else", async () => {
    const result = await run(add, ["button", "-y", "--json", "--cwd", dir])
    expect(result.stdout.trimEnd().split("\n")).toHaveLength(1)
    expect(() => JSON.parse(result.stdout)).not.toThrow()
  })

  it("has no ANSI escapes in piped output", async () => {
    const result = await run(add, ["button", "-y", "--json", "--cwd", dir])
    // eslint-disable-next-line no-control-regex
    expect(result.stdout).not.toMatch(/\[/)
  })
})

describe("add failing INSIDE the write loop (B2)", () => {
  // The reviewer's exact repro: a REGULAR FILE where a component directory
  // should be. The write for dialog fails with ENOTDIR — but button, icon and
  // the shared lib files are already on disk, and the earlier round reported
  // nothing, because the returned arrays only exist on success.
  it("reports the files actually on disk, with a real code and a fix", async () => {
    // The tree has to contain a DIALOG file, or nothing collides with the
    // regular file planted above and the add simply succeeds.
    resolveRegistryTree.mockResolvedValue({
      ...buttonTree(),
      files: [
        ...buttonTree().files,
        {
          path: "dialog.marko",
          type: "registry:ui",
          target: "ui/dialog/dialog.marko",
          content: DIALOG_MARKO,
        },
      ],
      items: ["button", "dialog", "utils"],
      dependencyItems: ["utils"],
    })

    // Learn where the resolver ACTUALLY puts component files, instead of
    // guessing: run `button` once, read the path it reported, then derive
    // `dialog`'s directory from it. The resolver maps `target` through the
    // project's aliases, and hardcoding the layout here made this test pass
    // without ever colliding with anything.
    const probe = await run(add, ["button", "-y", "--json", "--cwd", dir])
    const buttonPath = fileNamed(
      probe.json<{ data: { files: { path: string }[] } }>().data.files,
      "button/button.marko"
    )!.path
    const dialogDir = path.dirname(buttonPath).replace(/button$/, "dialog")

    // Back to a clean slate so this run genuinely writes the button files.
    rmSync(path.join(dir, path.dirname(buttonPath)), {
      recursive: true,
      force: true,
    })
    // The blocker: a REGULAR FILE where the dialog directory must go. The
    // writer pre-creates directories for planned paths, so the probe run's
    // leftover is removed first — otherwise there is nothing to collide with.
    rmSync(path.join(dir, dialogDir), { recursive: true, force: true })
    writeFile(dialogDir, "not a directory\n")

    // Snapshot BEFORE the failing run: "what did THIS run put on disk" is the
    // difference, not everything present (the probe run above left files).
    const before = new Set(listFiles(dir))
    const result = await run(add, [
      "button",
      "dialog",
      "-y",
      "--json",
      "--cwd",
      dir,
    ])

    const envelope = result.json<{
      ok: boolean
      error: {
        code: string
        suggestion?: string
        details?: { written: { path: string; status: string }[] }
      }
    }>()
    expect(envelope.ok).toBe(false)
    // A bare errno with UNKNOWN_ERROR told the caller nothing they could act
    // on, and carried no advice at all.
    expect(envelope.error.code).toBe("LOCAL_FILE_ERROR")
    expect(envelope.error.suggestion).toBeTruthy()

    const written = envelope.error.details?.written ?? []
    expect(written.length).toBeGreaterThan(0)

    // THE assertion that matters: every reported path exists, and every file
    // this run put on disk is reported. No more, no less.
    const reported = new Set(written.map((f) => f.path))
    for (const file of written) {
      expect(existsSync(path.join(dir, file.path)), file.path).toBe(true)
    }
    const thisRun = listFiles(dir).filter((rel) => !before.has(rel))
    expect(thisRun.length).toBeGreaterThan(0)
    for (const rel of thisRun) {
      expect(reported.has(rel), `not reported: ${rel}`).toBe(true)
    }
  })
})

describe("add human output, stdout alone", () => {
  // Criterion 6: a fresh install and a re-run that changed nothing must be
  // distinguishable from stdout, without reading stderr.
  it("carries the status on every line, and a re-run is distinguishable", async () => {
    const first = await run(add, ["button", "-y", "--cwd", dir])
    expect(first.stdout).toMatch(/created \S*button\/button\.marko/)

    const second = await run(add, ["button", "-y", "--cwd", dir])
    expect(second.stdout).toMatch(/unchanged \S*button\/button\.marko/)
    expect(second.stdout).not.toMatch(/created /)
    expect(second.stdout).not.toMatch(/skipped /)
  })

  it("has no ANSI escapes when piped", async () => {
    const result = await run(add, ["button", "-y", "--cwd", dir])
    // eslint-disable-next-line no-control-regex
    expect(result.stdout).not.toMatch(/\[/)
  })
})

describe("add failing mid-way", () => {
  // F4: "say what was already written". The component files land BEFORE the
  // stylesheet is patched, so a CSS failure leaves the project half-changed
  // and the caller has to be told.
  it("reports the files already written in the error envelope", async () => {
    mockCss.mockRejectedValue(new Error("disk full"))

    const result = await run(add, ["button", "-y", "--json", "--cwd", dir])

    expect(result.json<{ $type: string; ok: boolean }>().$type).toBe(
      "marko-ui/error"
    )
    const error = result.json<{
      error: { details: { written: { path: string; status: string }[] } }
    }>().error
    expect(error.details.written.length).toBeGreaterThan(0)
    const written = fileNamed(error.details.written, "button/button.marko")
    expect(written).toBeTruthy()
    // And it is true on disk, so the report is not a promise.
    expect(read(written!.path)).toBe(BUTTON_MARKO)
  })
})

describe("diff --json", () => {
  beforeEach(() => {
    // diff compares against a dry run, which reports actions rather than
    // writing; the fixture stands in for the resolved tree.
    mockCss.mockResolvedValue(undefined)
  })

  it("reports a missing file as missing, never added", async () => {
    // The registry tree carries files the project does not have yet.
    const result = await run(diff, ["--json", "--cwd", dir])
    const files = result.json<{ data: { files: { status: string }[] } }>().data
      .files
    expect(files.every((f) => f.status !== "created")).toBe(true)
  })
})