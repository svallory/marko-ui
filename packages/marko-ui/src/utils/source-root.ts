import { existsSync } from "fs"
import path from "path"

/**
 * The project's source root: `<cwd>/src` when the project has a `src/`
 * directory, else `cwd` itself. `init` uses this decision for the stylesheet
 * (`isSrcDir`) and it is also where an alias that no tsconfig `paths`, package
 * `imports` or workspace export backs is taken to point, so the stylesheet and
 * the installed components can never land on different roots.
 */
export function hasSrcDir(cwd: string) {
  return existsSync(path.resolve(cwd, "src"))
}

export function getSourceRoot(cwd: string) {
  return hasSrcDir(cwd) ? path.resolve(cwd, "src") : path.resolve(cwd)
}

/** Aliases with a conventional meaning even when nothing declares them. */
const CONVENTIONAL_ALIAS = /^(?:@|~)\/(.+)$/

/**
 * Maps `@/components/ui` or `~/lib` onto the source root, or returns null when
 * the alias is not one of the two conventional root aliases.
 */
export function resolveConventionalAlias(alias: string, cwd: string) {
  const match = alias.match(CONVENTIONAL_ALIAS)
  if (!match) {
    return null
  }
  return path.join(getSourceRoot(cwd), match[1])
}
