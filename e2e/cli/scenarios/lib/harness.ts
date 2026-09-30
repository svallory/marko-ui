/**
 * Scenario harness: hand-built project fixtures + a runner for the BUILT local
 * CLI. Everything here is deliberately cheap — a fixture is a handful of
 * files, package-manager and package-runner binaries are replaced by logging
 * shims (see `withShims`), so a scenario costs tens of milliseconds and needs
 * no network except to the locally served registry.
 */
import { spawn } from "node:child_process"
import {
  chmodSync,
  existsSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  realpathSync,
  rmSync,
  symlinkSync,
  writeFileSync,
} from "node:fs"
import { tmpdir } from "node:os"
import { dirname, join, resolve } from "node:path"

export const REPO = resolve(import.meta.dirname, "../../../..")
export const CLI = join(REPO, "packages/marko-ui/dist/index.js")

export function registryUrl() {
  const url = process.env.REGISTRY_URL
  if (!url) {
    throw new Error(
      "REGISTRY_URL is not set — run through `bun run test:cli:scenarios` (it builds and serves the registry)."
    )
  }
  return url
}

const workspaces: string[] = []

/** A realpath'd temp dir (macOS /var → /private/var; see AGENTS.md "Acceptance suite"). */
export function makeWorkspace(label = "scenario") {
  const dir = realpathSync(mkdtempSync(join(tmpdir(), `marko-ui-${label}-`)))
  workspaces.push(dir)
  return dir
}

export function cleanupWorkspaces() {
  if (process.env.E2E_KEEP) {
    console.log(`E2E_KEEP set — keeping:\n${workspaces.join("\n")}`)
    return
  }
  for (const dir of workspaces.splice(0)) rmSync(dir, { recursive: true, force: true })
}

export type Tree = Record<string, string | object | null>

/** Writes `tree` under `root`. Objects are JSON-serialised; `null` makes an empty dir. */
export function writeTree(root: string, tree: Tree) {
  for (const [rel, value] of Object.entries(tree)) {
    const target = join(root, rel)
    if (value === null) {
      mkdirSync(target, { recursive: true })
      continue
    }
    mkdirSync(dirname(target), { recursive: true })
    writeFileSync(
      target,
      typeof value === "string" ? value : JSON.stringify(value, null, 2) + "\n"
    )
  }
  return root
}

export function read(root: string, rel: string) {
  return readFileSync(join(root, rel), "utf8")
}
export function exists(root: string, rel: string) {
  return existsSync(join(root, rel))
}
export function readJson(root: string, rel: string) {
  return JSON.parse(read(root, rel))
}

// ---------------------------------------------------------------- fixtures

export const LOCKFILES = {
  bun: "bun.lock",
  npm: "package-lock.json",
  pnpm: "pnpm-lock.yaml",
  yarn: "yarn.lock",
} as const
export type Lock = keyof typeof LOCKFILES | "none"

function lockTree(lock: Lock): Tree {
  if (lock === "none") return {}
  const file = LOCKFILES[lock]
  return { [file]: file === "package-lock.json" ? { lockfileVersion: 3 } : "" }
}

export interface AppOptions {
  /** Where the app lives, relative to the workspace root. Default: the root. */
  dir?: string
  lock?: Lock
  /** `plain` = create-marko's tsconfig (no `paths`); `paths` adds `@/*`. */
  tsconfig?: "plain" | "paths" | "none"
  jsconfig?: boolean
  /** package.json `imports` (`#components/*`). */
  imports?: boolean
  srcDir?: boolean
  framework?: "marko-run" | "marko-vite" | "none"
  /** A stylesheet + vite.config already wired for Tailwind v4. */
  tailwind?: boolean
  /** A hand-written vite.config.ts that does not load Tailwind. */
  viteConfig?: boolean
  extra?: Tree
}

const VITE_PLAIN = `import { defineConfig } from "vite"
import marko from "@marko/vite"

export default defineConfig({
  plugins: [marko()],
  server: { port: 5173 },
})
`
const VITE_TAILWIND = `import { defineConfig } from "vite"
import marko from "@marko/vite"
import tailwindcss from "@tailwindcss/vite"

export default defineConfig({
  plugins: [marko(), tailwindcss()],
})
`

/**
 * A `create-marko`-shaped app. Defaults reproduce the stock basic template:
 * tsconfig without `paths`, `src/routes`, no Tailwind, no vite.config.
 */
export function markoApp(workspace: string, o: AppOptions = {}) {
  const dir = o.dir ? join(workspace, o.dir) : workspace
  const src = o.srcDir === false ? "" : "src/"
  const framework = o.framework ?? "marko-run"
  const deps: Record<string, string> = { marko: "^6.0.0" }
  if (framework === "marko-run") deps["@marko/run"] = "^0.9.0"
  const devDeps: Record<string, string> = { vite: "^7.0.0" }
  if (framework === "marko-vite") devDeps["@marko/vite"] = "^5.0.0"

  const pkg: Record<string, unknown> = {
    name: "app",
    type: "module",
    scripts: { dev: "marko-run", build: "marko-run build" },
    dependencies: deps,
    devDependencies: devDeps,
  }
  if (o.imports) {
    pkg.imports = { "#components/*": `./${src}components/*` }
  }

  const tree: Tree = {
    "package.json": pkg,
    [`${src}routes/+layout.marko`]: "<main><${input.content}/></main>\n",
    [`${src}routes/+page.marko`]: "<h1>hello</h1>\n",
    ...lockTree(o.lock ?? "bun"),
  }
  const tsconfig = o.tsconfig ?? (o.jsconfig ? "none" : "plain")
  if (tsconfig !== "none") {
    tree["tsconfig.json"] = {
      compilerOptions: {
        target: "esnext",
        module: "esnext",
        moduleResolution: "bundler",
        strict: true,
        noEmit: true,
        ...(tsconfig === "paths"
          ? { baseUrl: ".", paths: { "@/*": [`./${src}*`] } }
          : {}),
      },
      include: [`${src || "."}**/*`],
    }
  }
  if (o.jsconfig) {
    tree["jsconfig.json"] = { compilerOptions: { module: "esnext" } }
  }
  if (o.tailwind) {
    tree[`${src}styles/app.css`] = '@import "tailwindcss";\n'
    tree["vite.config.ts"] = VITE_TAILWIND
    tree[`${src}routes/+layout.marko`] =
      'import "../styles/app.css"\n<main><${input.content}/></main>\n'
    pkg.devDependencies = { ...devDeps, tailwindcss: "^4.0.0", "@tailwindcss/vite": "^4.0.0" }
  } else if (o.viteConfig) {
    tree["vite.config.ts"] = VITE_PLAIN
  }
  Object.assign(tree, o.extra)
  writeTree(dir, tree)
  return dir
}

/** A components.json as `init` would write it, for scenarios that start post-init. */
export function componentsJson(o: {
  distribution?: "copy" | "import"
  css?: string
  aliases?: Record<string, string>
} = {}) {
  return {
    $schema: "https://ui.shadcn.com/schema.json",
    style: "default",
    tailwind: {
      config: "",
      css: o.css ?? "src/styles/globals.css",
      baseColor: "neutral",
      cssVariables: true,
    },
    aliases: {
      components: "@/components",
      utils: "@/lib/utils",
      ui: "@/components/ui",
      lib: "@/lib",
      hooks: "@/hooks",
      ...o.aliases,
    },
    distribution: o.distribution ?? "copy",
    visualStyle: "vega",
  }
}

/** Places a directory symlink `link` → `target`. */
export function link(target: string, linkPath: string) {
  mkdirSync(dirname(linkPath), { recursive: true })
  symlinkSync(target, linkPath, "dir")
  return linkPath
}

// ------------------------------------------------------------------ shims

/**
 * Logging stand-ins for package managers and runners. `run()` prepends the
 * shim dir to PATH so the CLI's `execa("bun", ["add", …])` and
 * `execa("npx", ["-y","skills", …])` hit these: no install, no network, and
 * the argv is recorded so a scenario can assert WHICH tool the CLI chose.
 * `bun`/`bunx` stay real unless listed.
 */
export const ALL_SHIMS = ["bun", "bunx", "npm", "npx", "pnpm", "yarn"] as const
export type Shim = (typeof ALL_SHIMS)[number]

export function withShims(
  workspace: string,
  names: readonly Shim[] = ALL_SHIMS,
  opts: { failing?: boolean } = {}
) {
  const bin = join(workspace, ".shim-bin")
  const log = join(workspace, ".shim.log")
  mkdirSync(bin, { recursive: true })
  writeFileSync(log, "")
  for (const name of names) {
    const file = join(bin, name)
    writeFileSync(
      file,
      `#!/bin/sh\necho "${name} $*" >> "${log}"\n${opts.failing ? 'echo "shim: simulated failure" >&2; exit 1' : "exit 0"}\n`
    )
    chmodSync(file, 0o755)
  }
  return {
    bin,
    log,
    calls: () => readFileSync(log, "utf8").split("\n").filter(Boolean),
  }
}

// ----------------------------------------------------------------- runner

export interface RunOptions {
  /** Env overrides; `undefined` unsets. */
  env?: Record<string, string | undefined>
  shim?: ReturnType<typeof withShims>
  /** Leave stdin as an open, never-written pipe (a caller that hangs up never). */
  openStdin?: boolean
  timeoutMs?: number
}
export interface RunResult {
  code: number | null
  timedOut: boolean
  out: string
}

/** Env vars that would leak the host's context into a scenario. */
const SCRUB = [
  "CI",
  "CLAUDECODE",
  "NODE_EXTRA_CA_CERTS",
  "npm_config_user_agent",
  "MARKO_UI_SKILLS_SOURCE",
  "REGISTRY_URL",
  "INIT_CWD",
]

/**
 * Runs the built CLI. stdin is closed by default (what CI/agent callers look
 * like — and the configuration that surfaces a prompt nothing can answer),
 * every call has a timeout, and the default caller is an agent harness.
 */
export function cli(cwd: string, args: string[], o: RunOptions = {}): Promise<RunResult> {
  const env: Record<string, string | undefined> = { ...process.env }
  for (const key of SCRUB) delete env[key]
  Object.assign(env, { REGISTRY_URL: registryUrl(), CLAUDECODE: "1" }, o.env)
  if (o.shim) env.PATH = `${o.shim.bin}:${env.PATH}`
  for (const [k, v] of Object.entries(env)) if (v === undefined) delete env[k]

  return new Promise((resolvePromise) => {
    const child = spawn("node", [CLI, ...args], {
      cwd,
      env: env as NodeJS.ProcessEnv,
      stdio: [o.openStdin ? "pipe" : "ignore", "pipe", "pipe"],
    })
    let out = ""
    let timedOut = false
    child.stdout!.on("data", (d) => (out += d))
    child.stderr!.on("data", (d) => (out += d))
    const timer = setTimeout(() => {
      timedOut = true
      child.kill("SIGKILL")
    }, o.timeoutMs ?? 60_000)
    child.on("close", (code) => {
      clearTimeout(timer)
      resolvePromise({ code, timedOut, out })
    })
  })
}

/** Strips ANSI so substring assertions match what a user reads. */
export function plain(text: string) {
  return text.replace(/\u001b\[[0-9;]*m/g, "")
}

export function tail(text: string, lines = 8) {
  return plain(text).trim().split("\n").slice(-lines).join("\n")
}

/** Parses the JSON object a `--json` command printed (skips any leading noise). */
export function jsonOut(out: string) {
  const text = plain(out)
  return JSON.parse(text.slice(text.indexOf("{"), text.lastIndexOf("}") + 1))
}

/** Init + add button through shims: the common "installed one component" starting state. */
export async function bootstrap(ws: string, shim = withShims(makeWorkspace("shim")), args: string[] = []) {
  const init = await cli(ws, ["init", ...args], { shim })
  const add = await cli(ws, ["add", "button"], { shim })
  return { init, add, shim }
}

export const SKILLS_SRC = REPO
