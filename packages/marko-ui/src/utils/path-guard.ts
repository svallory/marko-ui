import { existsSync, realpathSync } from "fs"
import path from "path"
import { RegistryError, RegistryErrorCode } from "@/src/registry/errors"

/**
 * The last line of defence before the CLI writes or deletes anything.
 *
 * Every file the CLI writes comes from a registry item, and a registry item's
 * `target` is resolved against the project's own aliases. That is safe when
 * the aliases point at the project — and it is exactly as safe as the alias
 * configuration, because nothing between "resolve the path" and
 * `fs.writeFile` checks where the result actually points.
 *
 * How this bites in practice: with `node_modules/@marko-ui/shadcn` a SYMLINK
 * to a real package (a workspace link, `bun link`, pnpm), an alias that
 * resolves through the link makes every write land in the linked package. The
 * symptom is not "a file went missing" but "the CLI edited its own
 * dependency": files overwritten, other libraries' icon maps DELETED by
 * `findStaleIconMaps`, and whole directories created inside the package.
 *
 * Two rules, both checked against the REAL path (symlinks resolved, so a link
 * pointing outside is caught even when the literal path looks fine):
 *
 * 1. The resolved path must be inside one of the project's own roots — the
 *    directory holding `components.json`, plus any configured workspace
 *    package root (a monorepo legitimately writes into `packages/ui`).
 * 2. It must not be inside ANY `node_modules` directory, whatever its
 *    resolved location. A dependency is not a project; nothing in a project
 *    should be written by installing into that project.
 *
 * Raised BEFORE any write, so a rejected target leaves nothing half-done.
 */

/** The stable code, so a caller can branch without parsing the message. */
export const UNSAFE_WRITE_TARGET = RegistryErrorCode.UNSAFE_WRITE_TARGET

export type WriteRoots = {
  /** The project root: the directory holding components.json. */
  projectRoot: string
  /**
   * Extra roots a write may legitimately land in — a monorepo's other
   * packages. Compared by realpath like the project root, so a symlinked
   * workspace is allowed while a symlinked DEPENDENCY is not (rule 2 catches
   * that one regardless).
   */
  extraRoots?: string[]
}

/**
 * Resolves the real path of `target`, which need not exist yet: the deepest
 * existing ancestor is resolved and the remaining segments appended, so a file
 * about to be created inside a symlinked directory is still caught.
 */
export function realpathOfTarget(target: string): string {
  let current = path.resolve(target)
  const trailing: string[] = []

  // Walk up until something exists, then rebuild downward.
  for (;;) {
    if (existsSync(current)) {
      break
    }
    const parent = path.dirname(current)
    // Reached the filesystem root without finding anything that exists.
    if (parent === current) {
      return path.resolve(target)
    }
    trailing.unshift(path.basename(current))
    current = parent
  }

  let resolved: string
  try {
    resolved = realpathSync(current)
  } catch {
    resolved = current
  }
  return trailing.length ? path.join(resolved, ...trailing) : resolved
}

/** True when `child` is `parent` or lives inside it. */
export function isInside(parent: string, child: string): boolean {
  const relative = path.relative(parent, child)
  return (
    relative === "" ||
    (!relative.startsWith("..") && !path.isAbsolute(relative))
  )
}

/** True when any segment of the (real) path is `node_modules`. */
export function isInsideNodeModules(real: string): boolean {
  return real
    .split(/[\\/]+/)
    .filter(Boolean)
    .some((segment: string) => segment === "node_modules")
}

/**
 * Throws unless `target` may be written by the CLI.
 *
 * `label` names the operation in the message ("write", "delete") so the error
 * says what was refused, not just where.
 */
export function assertWritable(
  target: string,
  roots: WriteRoots,
  label: "write" | "delete" = "write"
): void {
  const real = realpathOfTarget(target)

  if (isInsideNodeModules(real)) {
    throw unsafeTarget(target, real, label, "it resolves inside node_modules")
  }

  const allowed = [roots.projectRoot, ...(roots.extraRoots ?? [])]
    .filter(Boolean)
    .map((root) => realpathOfTarget(root))

  if (!allowed.some((root) => isInside(root, real))) {
    throw unsafeTarget(
      target,
      real,
      label,
      `it resolves outside the project (allowed: ${allowed.join(", ")})`
    )
  }
}

/** Convenience wrapper returning the resolved roots for a config. */
export function rootsFor(
  projectRoot: string,
  extraRoots: (string | undefined | null)[] = []
): WriteRoots {
  return {
    projectRoot,
    extraRoots: extraRoots.filter((root): root is string => Boolean(root)),
  }
}

function unsafeTarget(
  target: string,
  real: string,
  label: string,
  why: string
): RegistryError {
  return new RegistryError(
    `Refusing to ${label} ${target}: ${why}.`,
    {
      code: RegistryErrorCode.UNSAFE_WRITE_TARGET,
      context: { path: target, realpath: real, reason: why },
      suggestion: `Point the offending alias inside the project instead. If ${target} is meant to be a dependency, the CLI must not modify it — a symlinked or hoisted package cannot be a write target.`,
    }
  )
}

/** The stable code, re-exported for `manifest`'s errorCodes. */
export const UNSAFE_TARGET_CODE = UNSAFE_WRITE_TARGET