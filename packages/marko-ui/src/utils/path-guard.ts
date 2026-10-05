import { existsSync, realpathSync } from "fs"
import path from "path"
import { RegistryError, RegistryErrorCode } from "@/src/registry/errors"
import { findWorkspaceRoot } from "@/src/utils/get-monorepo-info"

/**
 * The last line of defence before the CLI writes or deletes anything.
 *
 * Every file the CLI writes comes from a registry item or from
 * `components.json`, and both are resolved against the project's own aliases.
 * That is safe when the aliases point at the project — and it is exactly as
 * safe as the alias configuration, because nothing between "resolve the path"
 * and `fs.writeFile` checked where the result actually pointed.
 *
 * How this bites in practice: with `node_modules/@marko-ui/shadcn` a SYMLINK
 * to a real package (a workspace link, `bun link`, pnpm), an alias that
 * resolves through the link makes every write land in the linked package.
 *
 * ## What is allowed
 *
 * A target is allowed when its REAL path is inside **either**:
 *
 * 1. the project root — the directory holding `components.json`; or
 * 2. the workspace root that contains the project.
 *
 * (2) is not a concession, it is the standard layout: the shadcn monorepo
 * has `apps/web` whose `ui` alias points at a SIBLING `packages/ui`. Running
 * `add` from `apps/web` legitimately writes into `packages/ui`. A guard that
 * only allowed (1) refused that and broke a working project — the workspace
 * root is the same one the CLI already detects for lockfile and workspace
 * lookup ({@link findWorkspaceRoot}), not a second detector.
 *
 * In both cases the path must not be inside a `node_modules` directory BELOW
 * that root. Scoped to below the root on purpose: a project that itself lives
 * under a `node_modules` ancestor (a template unpacked there, some
 * `bunx`/`pnpm dlx` temp layouts) must still work; what must never happen is
 * the CLI reaching INTO a dependency.
 */

/** The stable code, so a caller can branch without parsing the message. */
export const UNSAFE_WRITE_TARGET = RegistryErrorCode.UNSAFE_WRITE_TARGET

export type WriteRoots = {
  /** The project root: the directory holding components.json. */
  projectRoot: string
  /**
   * The workspace root containing the project, when it is not the project
   * root. Null in a single-package project.
   */
  workspaceRoot?: string | null
}

/**
 * The roots allowed for `cwd`, computed ONCE per command and threaded down.
 *
 * Taking them as an argument (rather than detecting inside the guard) is what
 * keeps a per-file directory scan from deciding, thirty times in a loop,
 * something the command already knows.
 */
export function rootsFor(cwd: string): WriteRoots {
  const projectRoot = safeRealpath(cwd)
  const workspace = findWorkspaceRoot(cwd)
  return {
    projectRoot,
    workspaceRoot: workspace ? safeRealpath(workspace) : null,
  }
}

/** Every root, project first, deduplicated. */
export function allowedRoots(roots: WriteRoots): string[] {
  const all = [roots.projectRoot, roots.workspaceRoot ?? null]
    .filter((root): root is string => Boolean(root))
    .map(safeRealpath)
  return Array.from(new Set(all))
}

/**
 * Resolves the real path of `target`, which need not exist yet: the deepest
 * existing ancestor is resolved and the remaining segments appended, so a file
 * about to be created inside a symlinked directory is still caught.
 */
export function realpathOfTarget(target: string): string {
  let current = path.resolve(target)
  const trailing: string[] = []

  for (;;) {
    if (existsSync(current)) break
    const parent = path.dirname(current)
    if (parent === current) return path.resolve(target)
    trailing.unshift(path.basename(current))
    current = parent
  }

  return trailing.length ? path.join(safeRealpath(current), ...trailing) : safeRealpath(current)
}

function safeRealpath(target: string): string {
  try {
    return realpathSync(target)
  } catch {
    return path.resolve(target)
  }
}

/** True when `child` is `parent` or lives inside it. */
export function isInside(parent: string, child: string): boolean {
  const relative = path.relative(parent, child)
  return (
    relative === "" ||
    (!relative.startsWith("..") && !path.isAbsolute(relative))
  )
}

/**
 * True when the part of `real` BELOW `root` passes through a `node_modules`
 * directory.
 *
 * Scoped to below the root on purpose: a project living under some
 * `node_modules` ancestor is still a project, and refusing every one of its
 * writes because of where the checkout happens to sit would be a false
 * positive on a perfectly ordinary layout.
 */
export function isInsideNodeModules(real: string, root: string): boolean {
  const relative = path.relative(root, real)
  if (relative.startsWith("..") || path.isAbsolute(relative)) return false
  return relative
    .split(/[\\/]+/)
    .filter(Boolean)
    .some((segment) => segment === "node_modules")
}

/**
 * Throws unless `target` may be written by the CLI.
 *
 * `label` names the operation ("write" / "delete") so the error says what was
 * refused, not just where.
 */
export function assertWritable(
  target: string,
  roots: WriteRoots,
  label: "write" | "delete" = "write"
): void {
  const real = realpathOfTarget(target)
  const allowed = allowedRoots(roots)

  for (const root of allowed) {
    if (!isInside(root, real)) continue

    // Inside an allowed root, but reaching into a dependency from it is still
    // forbidden — that is the symlinked-package case.
    if (isInsideNodeModules(real, root)) {
      throw unsafeTarget(target, real, roots, label, "it resolves into node_modules")
    }
    return
  }

  throw unsafeTarget(
    target,
    real,
    roots,
    label,
    `it resolves outside the project and its workspace`
  )
}

function unsafeTarget(
  target: string,
  real: string,
  roots: WriteRoots,
  label: string,
  why: string
): RegistryError {
  const allowed = allowedRoots(roots)
  return new RegistryError(
    // ROOT-RELATIVE, and rooted at the project: the error envelope scrubs
    // absolute paths (that is deliberate — see error-contract), so naming the
    // absolute path here would leave the reader with a basename and nowhere
    // to start from.
    `Refusing to ${label} ${describeRelative(target, roots)}: ${why}. Allowed roots: ${allowed
      .map((root) => describeRelative(root, roots))
      .join(", ")}.`,
    {
      code: RegistryErrorCode.UNSAFE_WRITE_TARGET,
      context: {
        path: describeRelative(target, roots),
        reason: why,
        allowedRoots: allowed.map((root) => describeRelative(root, roots)),
      },
      suggestion:
        "Point the offending alias inside the project or its workspace. A dependency — including one this project symlinks as a workspace link — is never a write target.",
    }
  )
}

/**
 * A path as the user can act on it: relative to the project root when it is
 * inside it, otherwise relative to the workspace root, so the message names
 * something they can find rather than a bare basename.
 */
function describeRelative(target: string, roots: WriteRoots): string {
  const real = realpathOfTarget(target)
  for (const root of allowedRoots(roots).reverse()) {
    const relative = path.relative(root, real)
    if (!relative.startsWith("..") && !path.isAbsolute(relative)) {
      return relative || "."
    }
  }
  return real
}

/**
 * The single guarded write/delete, for every writer whose path comes from
 * `components.json` or from registry data.
 *
 * Route them through here rather than calling {@link assertWritable} at each
 * site: four call sites that each remembered to check is four chances to add a
 * fifth writer and forget. The guard runs BEFORE the first byte is written, so
 * a refused target leaves nothing half-done.
 */
export async function writeGuarded(
  target: string,
  contents: string,
  roots: WriteRoots,
  options: { label?: "write" | "delete" } = {}
): Promise<void> {
  assertWritable(target, roots, options.label ?? "write")
  const { promises: fs } = await import("fs")
  await fs.mkdir(path.dirname(target), { recursive: true })
  await fs.writeFile(target, contents, "utf8")
}

/** The guarded counterpart of `fs.rm`, for the stale-icon-map prune. */
export async function removeGuarded(
  target: string,
  roots: WriteRoots
): Promise<void> {
  assertWritable(target, roots, "delete")
  const { promises: fs } = await import("fs")
  await fs.rm(target)
}
