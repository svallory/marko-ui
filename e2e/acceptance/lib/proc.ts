import { execFileSync } from "node:child_process"
import { openSync } from "node:fs"

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
 * Runs a command to completion and captures output (synchronous —
 * `execFileSync` — since every journey already runs sequentially,
 * vitest.config.ts fileParallelism: false).
 *
 * IMPORTANT: `options.cwd` and any script path in `args` MUST already be
 * realpath'd (see lib/workspace.ts's makeTempWorkspace). The published CLI's
 * entrypoint guard (packages/marko-ui/src/index.ts) does
 * `import.meta.url === pathToFileURL(process.argv[1]).href` — Node resolves
 * import.meta.url through filesystem symlinks but does NOT resolve argv[1]
 * the same way. On macOS, os.tmpdir() returns a /var/folders/... path and
 * /var is itself a symlink to /private/var, so invoking the CLI with an
 * unresolved path makes that comparison silently fail: `main()` is never
 * called, the process exits 0, and nothing is printed or written — no
 * error, no exception, just total silent no-op. See report-acceptance.md.
 */
export function run(
  cmd: string,
  args: string[],
  options: RunOptions
): RunResult {
  // stdin must be a real, openable fd — not "pipe" left unwritten/unclosed —
  // or the CLI's clack-based prompt/spinner layer silently exits 0 and
  // writes nothing at all, even with every flag here making the run fully
  // non-interactive.
  const devNull = openSync("/dev/null", "r")
  try {
    const stdout = execFileSync(cmd, args, {
      cwd: options.cwd,
      env: options.env ?? process.env,
      stdio: [devNull, "pipe", "pipe"],
      timeout: options.timeoutMs,
      encoding: "utf8",
      maxBuffer: 64 * 1024 * 1024,
    })
    return { stdout, stderr: "", exitCode: 0 }
  } catch (error) {
    const e = error as NodeJS.ErrnoException & {
      stdout?: string
      stderr?: string
      status?: number | null
      signal?: string | null
    }
    if (e.signal === "SIGTERM" || e.code === "ETIMEDOUT") {
      throw new Error(
        `Command timed out after ${options.timeoutMs}ms: ${cmd} ${args.join(" ")}\n--- stdout ---\n${e.stdout ?? ""}\n--- stderr ---\n${e.stderr ?? ""}`
      )
    }
    return {
      stdout: e.stdout ?? "",
      stderr: e.stderr ?? "",
      exitCode: e.status ?? -1,
    }
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
