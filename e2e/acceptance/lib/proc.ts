import { spawnSync } from "node:child_process"
import { closeSync, openSync } from "node:fs"
import { devNull as DEV_NULL } from "node:os"

export interface RunResult {
  stdout: string
  stderr: string
  exitCode: number
}

export interface RunOptions {
  cwd: string
  env?: NodeJS.ProcessEnv
  timeoutMs?: number
}

/**
 * Runs a command to completion and captures BOTH streams.
 *
 * IMPORTANT: `options.cwd` and any script path in `args` MUST already be
 * realpath'd (see lib/workspace.ts's makeTempWorkspace) AND free of `..`
 * segments. The published CLI's entrypoint guard (packages/marko-ui/src/index.ts)
 * compares `import.meta.url` — which Node resolves through symlinks and
 * `..` — against `pathToFileURL(process.argv[1])`, which resolves neither. Give
 * it a path that does not match and `main()` is never called: the process exits
 * 0 having printed nothing at all. On macOS, os.tmpdir() returns a
 * /var/folders/... path and /var is itself a symlink to /private/var, so this is
 * not a theoretical path. See report-acceptance.md.
 *
 * `spawnSync`, not `execFileSync`: execFileSync returns stdout only, and its
 * stderr is reachable only through the error object it throws on a NON-ZERO
 * exit. A command that succeeds while reporting on stderr — which the CLI does
 * routinely, because its logger and spinner write there — would come back with
 * `stderr: ""`, and every `stderrContains` assertion on a passing step would be
 * vacuous (able to fail, never able to pass). Found while proving
 * pm.yarn-classic, where `agents sync` reports the whole skills relay on stderr
 * and exits 0.
 *
 * stdin must also be a real, openable fd — not "pipe" left unwritten/unclosed —
 * or the CLI's clack-based prompt/spinner layer silently exits 0 and writes
 * nothing at all, even with every flag here making the run fully
 * non-interactive.
 */
export function run(
  cmd: string,
  args: string[],
  options: RunOptions
): RunResult {
  // os.devNull, not "/dev/null": Windows has no such path (it is `\\.\nul`), and
  // the literal resolved to D:\dev\null there and failed every spawn.
  const devNull = openSync(DEV_NULL, "r")
  try {
    const result = spawnSync(cmd, args, {
      cwd: options.cwd,
      env: options.env ?? process.env,
      stdio: [devNull, "pipe", "pipe"],
      timeout: options.timeoutMs,
      encoding: "utf8",
      maxBuffer: 64 * 1024 * 1024,
    })

    const stdout = result.stdout ?? ""
    const stderr = result.stderr ?? ""

    if (result.error) {
      const code = (result.error as NodeJS.ErrnoException).code
      if (code === "ETIMEDOUT" || result.signal === "SIGTERM") {
        throw new Error(
          `Command timed out after ${options.timeoutMs}ms: ${cmd} ${args.join(" ")}\n--- stdout ---\n${stdout}\n--- stderr ---\n${stderr}`
        )
      }
      // ENOENT and friends: the command could not be started at all. That is
      // the runner's problem (a missing binary, a bad path), so it is loud.
      throw new Error(
        `Command could not run: ${cmd} ${args.join(" ")}\n${result.error.message}\ncwd: ${options.cwd}`,
      )
    }

    return {
      stdout,
      stderr,
      // A signalled process has no status; -1 says "died without one" rather
      // than pretending it exited 0.
      exitCode: result.status ?? -1,
    }
  } finally {
    closeSync(devNull)
  }
}

/** Retries a network-dependent async op once before letting the error bubble, per brief §3. */
export async function retryOnce<T>(fn: () => Promise<T>): Promise<T> {
  try {
    return await fn()
  } catch (firstError) {
    try {
      return await fn()
    } catch (secondError) {
      throw new Error(
        `Failed after retry. First: ${(firstError as Error).message}\nSecond: ${(secondError as Error).message}`
      )
    }
  }
}
