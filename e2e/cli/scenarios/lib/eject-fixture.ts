/**
 * ONE fixture builder for the write-safety scenarios (eject + add).
 *
 * Every shape the safety scenarios need is `project + where @marko-ui/shadcn
 * lives + where the `ui` alias points`, so it is one function with options
 * rather than a builder per scenario.
 *
 * SAFETY (binding): everything lives in a temp dir OUTSIDE the repository, and
 * the package copy in a fixture is a `cp -R` of this worktree's
 * `packages/shadcn` — never a link into the repo. `assertOutsideRepo` is
 * called on every path this file is about to write or link, so a fixture bug
 * cannot aim the CLI at the repository (that is exactly how the incident
 * behind these scenarios deleted `packages/shadcn/ui/*`).
 */
import { execFileSync } from "node:child_process"
import { createHash } from "node:crypto"
import {
  lstatSync,
  mkdirSync,
  readFileSync,
  readdirSync,
  readlinkSync,
  realpathSync,
} from "node:fs"
import { join, relative, sep } from "node:path"
import {
  REPO,
  componentsJson,
  link,
  makeWorkspace,
  markoApp,
  writeTree,
  type Tree,
} from "./harness"

const SHADCN_SRC = join(REPO, "packages/shadcn")
/** What eject reads from the package (`ui/`), plus enough of the rest to be a real copy. */
const SHADCN_PARTS = ["ui", "lib", "styles", "package.json", "marko.json"]

export function assertOutsideRepo(path: string) {
  let real = path
  try {
    real = realpathSync(path)
  } catch {
    // Not created yet: the literal path is what matters.
  }
  const rel = relative(REPO, real)
  if (rel === "" || (!rel.startsWith("..") && !rel.startsWith(sep))) {
    throw new Error(`fixture path ${path} is inside the repository (${REPO}) — refusing`)
  }
}

/** A `cp -R` of this worktree's packages/shadcn into `dest` (a fresh temp dir). */
export function copyShadcnPackage(dest: string) {
  assertOutsideRepo(dest)
  mkdirSync(dest, { recursive: true })
  for (const part of SHADCN_PARTS) {
    execFileSync("cp", ["-R", join(SHADCN_SRC, part), join(dest, part)])
  }
  return dest
}

export type PackageShape =
  /** No package at all (the project is not an import-distribution one). */
  | "none"
  /** node_modules/@marko-ui/shadcn is a real directory (a plain install). */
  | "copy"
  /** node_modules/@marko-ui/shadcn is a symlink to a second temp dir. */
  | "symlink"

export interface EjectFixtureOptions {
  distribution?: "copy" | "import"
  pkg?: PackageShape
  /** The components.json `ui` alias. Default: the stock `@/components/ui`. */
  uiAlias?: string
  /** components.json `tailwind.css`. Default: `src/styles/globals.css`. */
  css?: string
  /** Extra tsconfig `paths` (e.g. `{ "@pkg/*": ["./node_modules/@marko-ui/shadcn/*"] }`) that back the alias. */
  tsPaths?: Record<string, string[]>
  /** Extra files, written last. */
  extra?: Tree
}

export interface EjectFixture {
  /** Workspace root (a realpath'd temp dir). */
  ws: string
  /** The project (where components.json lives). */
  app: string
  /** Where the @marko-ui/shadcn package REALLY lives, when there is one. */
  packageDir: string | null
  /** The second temp dir a `symlink` package points at (same as packageDir), else null. */
  externalDir: string | null
}

/**
 * Builds a Marko project whose components.json is `distribution` and whose
 * `node_modules/@marko-ui/shadcn` is `pkg`.
 */
export function ejectFixture(o: EjectFixtureOptions = {}): EjectFixture {
  const ws = makeWorkspace("eject")
  assertOutsideRepo(ws)
  markoApp(ws, {
    tsconfig: "paths",
    extra: {
      "components.json": componentsJson({
        distribution: o.distribution ?? "import",
        ...(o.css ? { css: o.css } : {}),
        aliases: { ui: o.uiAlias ?? "@/components/ui" },
      }),
      "src/styles/globals.css": '@import "tailwindcss";\n',
      ...o.extra,
    },
  })

  if (o.tsPaths) addTsPaths(ws, o.tsPaths)

  let packageDir: string | null = null
  let externalDir: string | null = null
  const shape = o.pkg ?? "copy"
  if (shape === "copy") {
    packageDir = copyShadcnPackage(join(ws, "node_modules/@marko-ui/shadcn"))
  } else if (shape === "symlink") {
    externalDir = copyShadcnPackage(makeWorkspace("external-shadcn"))
    packageDir = externalDir
    link(externalDir, join(ws, "node_modules/@marko-ui/shadcn"))
  }
  return { ws, app: ws, packageDir, externalDir }
}

/** markoApp's stock tsconfig only maps `@/*`; this adds the entries that back an alias. */
function addTsPaths(dir: string, paths: Record<string, string[]>) {
  const tsconfig = JSON.parse(readFileSync(join(dir, "tsconfig.json"), "utf8"))
  Object.assign(tsconfig.compilerOptions.paths, paths)
  writeTree(dir, { "tsconfig.json": tsconfig })
}

/**
 * A monorepo: root `workspaces`, `apps/web` (the project, with components.json)
 * and `packages/ui` (a sibling package). `uiAliasPath` is where `@ui/*` points,
 * relative to apps/web — the sibling by default.
 */
export function monorepoFixture(
  o: {
    uiAliasPath?: string
    /**
     * The app's `components` alias. The standard shadcn layout keeps it LOCAL
     * (`@/components`) and points only ui/utils/lib/hooks at the sibling;
     * the default aims all five at the sibling.
     */
    componentsAlias?: string
    /** components.json `tailwind.css`, relative to apps/web. */
    css?: string
    extra?: Tree
    rootExtra?: Tree
    /** The root package.json `workspaces` globs. Default `["apps/*", "packages/*"]`. */
    workspaces?: string[]
    /**
     * The project's directory under the root. Default `apps/web`, a member of
     * the default globs; a directory the globs do not cover makes the project
     * a NON-member of a root that still declares workspaces.
     */
    appDir?: string
  } = {}
) {
  const ws = makeWorkspace("mono")
  assertOutsideRepo(ws)
  writeTree(ws, {
    "package.json": { name: "mono", private: true, workspaces: o.workspaces ?? ["apps/*", "packages/*"] },
    "bun.lock": "",
    "packages/ui/package.json": { name: "@mono/ui", version: "0.0.0" },
    "packages/ui/src/components/ui": null,
    // The shadcn monorepo layout: the sibling package carries its OWN
    // components.json (and a tsconfig backing its aliases), which `add` loads
    // as the "workspace config" for the package the app's `ui` alias points at.
    "packages/ui/components.json": componentsJson({
      distribution: "copy",
      css: "src/styles/globals.css",
    }),
    "packages/ui/tsconfig.json": {
      compilerOptions: {
        target: "esnext",
        module: "esnext",
        moduleResolution: "bundler",
        strict: true,
        noEmit: true,
        baseUrl: ".",
        paths: { "@/*": ["./src/*"] },
      },
      include: ["src/**/*"],
    },
    "packages/ui/src/styles/globals.css": '@import "tailwindcss";\n',
    ...o.rootExtra,
  })
  const app = join(ws, o.appDir ?? "apps/web")
  markoApp(app, {
    lock: "none",
    tsconfig: "paths",
    extra: {
      "components.json": componentsJson({
        distribution: "copy",
        ...(o.css ? { css: o.css } : {}),
        aliases: {
          components: o.componentsAlias ?? "@ui/components",
          ui: "@ui/components/ui",
          utils: "@ui/lib/utils",
          lib: "@ui/lib",
          hooks: "@ui/hooks",
        },
      }),
      "src/styles/globals.css": '@import "tailwindcss";\n',
      ...o.extra,
    },
  })
  addTsPaths(app, { "@ui/*": [`${o.uiAliasPath ?? defaultUiAliasPath(o.appDir ?? "apps/web")}/*`] })
  return { ws, app, ui: join(ws, "packages/ui") }
}

/** `packages/ui/src` relative to the project, however deep the project sits. */
function defaultUiAliasPath(appDir: string) {
  const up = appDir.split("/").map(() => "..").join("/")
  return `${up}/packages/ui/src`
}

/** path → sha256 (or `-> target` for a symlink) for every entry under `dir`, sorted. */
export function snapshotTree(dir: string): Record<string, string> {
  const out: Record<string, string> = {}
  const walk = (current: string) => {
    for (const name of readdirSync(current).sort()) {
      const full = join(current, name)
      const rel = relative(dir, full)
      const stat = lstatSync(full)
      if (stat.isSymbolicLink()) out[rel] = `-> ${readlinkSync(full)}`
      else if (stat.isDirectory()) {
        out[rel] = "dir"
        walk(full)
      } else out[rel] = createHash("sha256").update(readFileSync(full)).digest("hex")
    }
  }
  walk(dir)
  return out
}
