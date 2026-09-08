import { join } from "node:path"
import { CLI_SPEC, cliEnv } from "./env"
import { run, type RunResult } from "./proc"

/** Installs the published CLI as a devDependency of `appDir` and returns a runner bound to it. */
export function installCli(appDir: string) {
  const install = run("bun", ["add", "-d", CLI_SPEC], {
    cwd: appDir,
    timeoutMs: 120_000,
  })
  if (install.exitCode !== 0) {
    throw new Error(
      `bun add ${CLI_SPEC} failed (exit ${install.exitCode})\n${install.stderr}`
    )
  }

  const binPath = join(appDir, "node_modules/marko-ui/dist/index.js")

  return {
    binPath,
    run: (args: string[], timeoutMs = 60_000): RunResult =>
      run("node", [binPath, ...args], { cwd: appDir, env: cliEnv, timeoutMs }),
  }
}
