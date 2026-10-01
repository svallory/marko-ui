import { spawnSync } from "node:child_process"
import {
  existsSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from "node:fs"
import os from "node:os"
import { stripVTControlCharacters } from "node:util"
import path from "node:path"
import net from "node:net"
import { describe, expect, it } from "vitest"

import {
  MARKO_DEFAULT_CSS,
  init,
  mayPromptForInit,
  resolveTailwindCssPath,
} from "@/src/commands/init"
import { isInteractive } from "@/src/utils/interactive"

/**
 * Regression coverage for the components.json stylesheet path.
 *
 * `marko-ui init` used to crash on a plain `bun create marko` app following
 * the documented install commands:
 *
 *     - Updating app/globals.css
 *     ENOENT: no such file or directory, open '<cwd>/app/globals.css'
 *
 * `app/globals.css` is Next.js's convention, inherited from shadcn via
 * DEFAULT_TAILWIND_CSS. It was reached because `getTailwindCssFile` only
 * recognizes a stylesheet that already contains `@import "tailwindcss"`, and
 * a freshly scaffolded app has none — the very file init is about to create
 * is the one whose absence makes detection fail.
 */
describe("resolveTailwindCssPath", () => {
  it("prefers an explicitly configured path over everything else", () => {
    expect(
      resolveTailwindCssPath({
        configuredCss: "app/custom.css",
        detectedCss: "src/styles/globals.css",
        frameworkName: "marko-run",
        isSrcDir: true,
      })
    ).toBe("app/custom.css")
  })

  it("uses a detected stylesheet when there is no configured one", () => {
    expect(
      resolveTailwindCssPath({
        detectedCss: "src/assets/tw.css",
        frameworkName: "marko-run",
        isSrcDir: true,
      })
    ).toBe("src/assets/tw.css")
  })

  it.each(["marko-run", "marko-vite"])(
    "falls back to the Marko convention for %s when detection found nothing",
    (frameworkName) => {
      // Asserted against the exported constant, not a repeated literal: the
      // value is expected to change with the in-flight CLI DX work, and this
      // test is about WHICH default is chosen, not what it spells.
      expect(resolveTailwindCssPath({ frameworkName, isSrcDir: true })).toBe(
        `src/${MARKO_DEFAULT_CSS}`
      )
    }
  )

  it("omits the src/ prefix for a Marko project without a src directory", () => {
    expect(
      resolveTailwindCssPath({ frameworkName: "marko-run", isSrcDir: false })
    ).toBe(MARKO_DEFAULT_CSS)
  })

  // The Next.js literals below stay hardcoded deliberately: they are shadcn's
  // inherited default, owned elsewhere, and the point of these assertions is
  // that a Marko project never receives that specific path.
  it("never returns the Next.js default for a Marko project", () => {
    // The exact failure: a Marko app, nothing configured, nothing detected.
    for (const frameworkName of ["marko-run", "marko-vite"]) {
      for (const isSrcDir of [true, false]) {
        expect(
          resolveTailwindCssPath({ frameworkName, isSrcDir })
        ).not.toBe("app/globals.css")
      }
    }
  })

  it("keeps the shadcn default for a non-Marko project", () => {
    // Unchanged behavior for Next.js and unknown projects — this fix must not
    // change what shadcn-compatible consumers get.
    expect(resolveTailwindCssPath({ frameworkName: "next-app" })).toBe(
      "app/globals.css"
    )
    expect(resolveTailwindCssPath({})).toBe("app/globals.css")
  })
})

/**
 * `-y, --yes` used to default to `true`, so every run looked like an explicit
 * `--yes` and the documented three questions (base color, distribution,
 * visual style) were never asked in a real terminal; defaults were silently
 * applied. These pin the decision table.
 */
describe("mayPromptForInit", () => {
  const flags = { defaults: false, yes: false, silent: false }

  it("prompts in an interactive terminal with no flags", () => {
    expect(mayPromptForInit(flags, true)).toBe(true)
  })

  it("never prompts when nothing can answer (non-interactive)", () => {
    expect(mayPromptForInit(flags, false)).toBe(false)
  })

  it.each([
    ["--defaults", { defaults: true }],
    ["-y/--yes", { yes: true }],
    ["--silent", { silent: true }],
  ])("%s disables prompting even in a terminal", (_name, override) => {
    expect(mayPromptForInit({ ...flags, ...override }, true)).toBe(false)
  })

  it("derives interactivity from the environment when not injected", () => {
    // The default argument is `isInteractive()` over process.env/stdin.
    const saved = { ...process.env }
    try {
      process.env.AI_AGENT = "1"
      expect(mayPromptForInit(flags)).toBe(false)
      delete process.env.AI_AGENT
      expect(mayPromptForInit(flags)).toBe(isInteractive())
    } finally {
      process.env = saved
    }
  })
})

describe("init command flags", () => {
  const yes = init.options.find((o) => o.long === "--yes")!
  const defaults = init.options.find((o) => o.long === "--defaults")!

  it("does not default --yes (or --defaults) to true", () => {
    // Commander leaves the value undefined/false unless the caller passes it.
    expect(yes.defaultValue).toBeFalsy()
    expect(defaults.defaultValue).toBeFalsy()
  })

  it("describes what --yes and --defaults do", () => {
    expect(yes.description).toMatch(/do not prompt/i)
    expect(defaults.description).toMatch(/do not prompt/i)
  })
})

/**
 * pty-driven checks of the BUILT CLI. The unit tests above cannot see the
 * class of bug this file exists for: the decision was right on paper and the
 * wiring was not. `expect(1)` is the pty driver, so no native dependency is
 * added; the tests skip locally where it (or the built CLI) is absent, and fail under CI.
 *
 * Every case cancels (Ctrl-C) or stops at a prompt/first step, so none reaches
 * the network, the package manager, or the registry. The window size is set
 * explicitly: a pty with 0 columns (expect's default) makes `ora` erase lines
 * forever, which reads as a hang unrelated to prompting.
 */
const cli = path.resolve(__dirname, "../../dist/index.js")
const hasExpect = spawnSync("expect", ["-v"]).status === 0
const canPty = hasExpect && existsSync(cli)

// Skipping silently in CI would turn this suite into a green no-op: fail there
// and name what is missing.
if (process.env.CI && !canPty) {
  describe("init in a real pty", () => {
    it("has its prerequisites", () => {
      const missing = [
        !hasExpect && "`expect` (apt-get install expect)",
        !existsSync(cli) && `the built CLI at ${cli} (bun run --filter marko-ui build)`,
      ].filter(Boolean)
      throw new Error(`pty tests cannot run in CI; missing: ${missing.join(", ")}`)
    })
  })
}

// Drives `marko-ui init <args>` in a fixture project. `body` is Tcl run after
// the spawn; it must print markers on stdout. Returns stdout + whether
// components.json was written.
function runPty(
  body: string,
  args: string[],
  env: Record<string, string> = {},
  fixture: { pkg?: string; shimBun?: boolean } = {}
) {
  const dir = mkdtempSync(path.join(os.tmpdir(), "marko-ui-init-pty-"))
  writeFileSync(
    path.join(dir, "package.json"),
    fixture.pkg ?? '{"name":"fixture","dependencies":{"marko":"^6.0.0"}}'
  )
  // A logging `bun` first on PATH (plus a bun.lock so the CLI picks it): the
  // install the CLI runs is recorded, not performed, so no network.
  const installLog = path.join(dir, "install.log")
  if (fixture.shimBun) {
    const bin = path.join(dir, "shim-bin")
    mkdirSync(bin)
    writeFileSync(path.join(dir, "bun.lock"), "")
    writeFileSync(
      path.join(bin, "bun"),
      `#!/bin/sh\necho "bun $*" >> "${installLog}"\nexit 0\n`,
      { mode: 0o755 }
    )
    env = { ...env, PATH: `${bin}:${process.env.PATH}` }
  }
  const scriptPath = path.join(dir, "drive.exp")
  writeFileSync(
    scriptPath,
    String.raw`set stty_init "rows 40 columns 120"
set timeout 20
cd ${dir}
log_user 0
spawn env -u CLAUDECODE -u CI -u CURSOR_AGENT -u REPL_ID -u AI_AGENT {*}$argv
` + body
  )
  const envArgs = Object.entries(env).map(([k, v]) => `${k}=${v}`)
  const result = spawnSync(
    "expect",
    [scriptPath, "env", ...envArgs, "node", cli, "init", ...args],
    { encoding: "utf8", timeout: 40_000 }
  )
  const written = existsSync(path.join(dir, "components.json"))
  const installs = existsSync(installLog)
    ? readFileSync(installLog, "utf8").trim().split("\n")
    : []
  rmSync(dir, { recursive: true, force: true })
  // The CLI colors values (kleur) whenever it decides the terminal supports
  // it, and that decision differs between machines: GitHub's runners color
  // `neutral`/`copy`/`vega` in the defaults line, a local pty may not. The
  // assertions are about text, so compare without escape sequences.
  return { stdout: stripVTControlCharacters(result.stdout ?? ""), written, installs }
}

// Tcl snippets. `ask` answers a prompt with Enter (accept the highlighted
// option); `cancel` sends Ctrl-C and reports the exit status.
const ask = (pattern: string) => String.raw`
expect {
  -re {${pattern}} { puts "STEP"; sleep 0.3; send "\r"; expect -re {\u25c7[^\r\n]*} }
  timeout { puts "TIMEOUT"; exit 9 }
  eof { puts "EOF-BEFORE-STEP"; exit 8 }
}
`
const cancelAt = (pattern: string) => String.raw`
expect {
  -re {${pattern}} { puts "ASKED:$expect_out(0,string)"; sleep 0.3; send "\003" }
  timeout { puts "TIMEOUT"; exit 9 }
  eof { puts "EOF-BEFORE-PROMPT"; exit 8 }
}
expect eof
puts $expect_out(buffer)
lassign [wait] pid spawnid os rc
puts "EXIT=$rc"
`
// Expect either a question or the first post-prompt step; stop there.
const questionOrProceed = String.raw`
expect {
  -re {Which[^\r\n]*} { puts "ASKED:$expect_out(0,string)"; send "\003" }
  -re {Non-interactive run[^\r\n]*} { puts "LINE:$expect_out(0,string)"; send "\003" }
  -re {Writing components} { puts "PROCEEDED"; send "\003" }
  timeout { puts "TIMEOUT"; exit 9 }
}
expect eof
`

describe.skipIf(!canPty)("init in a real pty", () => {
  it("asks base color first; Ctrl-C there exits 1 and writes nothing", () => {
    const r = runPty(cancelAt(String.raw`Which[^\r\n]*base color`), [])
    expect(r.stdout).toMatch(/ASKED:.*base color/)
    expect(r.stdout).toContain("Cancelled.")
    expect(r.stdout).toContain("EXIT=1")
    expect(r.written).toBe(false)
  })

  it("asks all three in order: base color, distribution, visual style", () => {
    const r = runPty(
      ask(String.raw`Which[^\r\n]*base color`) +
        ask(String.raw`Which[^\r\n]*distribution`) +
        cancelAt(String.raw`Which[^\r\n]*visual style`),
      []
    )
    expect(r.stdout).toMatch(/ASKED:.*visual style/)
    expect(r.stdout).toContain("Cancelled.")
    expect(r.stdout).toContain("EXIT=1")
    expect(r.written).toBe(false)
  })

  it("Enter, Enter, Enter writes the same choices as --defaults: neutral, copy, vega", async () => {
    // A registry that accepts connections and never answers: init stops at its
    // first fetch, after components.json is written and before anything can
    // fail and roll it back. (The kernel completes the handshake without the
    // test process accepting, so blocking in spawnSync is fine.)
    const server = net.createServer(() => {})
    await new Promise<void>((resolve) => server.listen(0, "127.0.0.1", resolve))
    const { port } = server.address() as net.AddressInfo
    try {
      const r = runPty(
        ask(String.raw`Which[^\r\n]*base color`) +
          ask(String.raw`Which[^\r\n]*distribution`) +
          String.raw`
expect {
  -re {Which[^\r\n]*visual style} { sleep 0.3; send "\r" }
  timeout { puts "TIMEOUT"; exit 9 }
  eof { puts "EOF-BEFORE-STEP"; exit 8 }
}
expect {
  -re {\u2714[^\r\n]*Writing components} { puts "JSON:[exec cat components.json]:ENDJSON"; send "\003" }
  timeout { puts "TIMEOUT"; exit 9 }
  eof { puts "EOF-BEFORE-WRITE"; exit 8 }
}
expect eof
`,
        [],
        { REGISTRY_URL: `http://127.0.0.1:${port}/r` }
      )
      const json = r.stdout.match(/JSON:([\s\S]*?):ENDJSON/)
      expect(json, r.stdout).not.toBeNull()
      const config = JSON.parse(json![1])
      expect(config.tailwind.baseColor).toBe("neutral")
      expect(config.distribution).toBe("copy")
      expect(config.visualStyle).toBe("vega")
    } finally {
      server.close()
    }
  })

  it("does not ask base color when --base-color is given; distribution is first", () => {
    const r = runPty(questionOrProceed, ["--base-color", "zinc"])
    expect(r.stdout).toMatch(/ASKED:.*distribution/)
    expect(r.stdout).not.toMatch(/base color/)
  })

  it("does not ask distribution when --distribution is given", () => {
    const r = runPty(
      ask(String.raw`Which[^\r\n]*base color`) + questionOrProceed,
      ["--distribution", "copy"]
    )
    expect(r.stdout).toMatch(/ASKED:.*visual style/)
    expect(r.stdout).not.toMatch(/ASKED:[^\n]*distribution/)
  })

  it("does not ask visual style when --visual-style is given", () => {
    const r = runPty(
      ask(String.raw`Which[^\r\n]*base color`) +
        ask(String.raw`Which[^\r\n]*distribution`) +
        questionOrProceed,
      ["--visual-style", "nova"]
    )
    expect(r.stdout).not.toMatch(/ASKED:[^\n]*visual style/)
    expect(r.stdout).toContain("PROCEEDED")
  })

  it("with all three flags asks nothing", () => {
    const r = runPty(questionOrProceed, [
      "--base-color",
      "zinc",
      "--distribution",
      "import",
      "--visual-style",
      "nova",
    ])
    expect(r.stdout).not.toContain("ASKED")
    expect(r.stdout).toContain("PROCEEDED")
  })

  it.each([
    ["--defaults", ["--defaults"], {}],
    ["-y", ["-y"], {}],
    ["an agent env var, with a TTY", [], { AI_AGENT: "1" }],
    ["CI=1, with a TTY", [], { CI: "1" }],
  ] as [string, string[], Record<string, string>][])(
    "%s: no prompt, reports the defaults it applied",
    (_name, args, env) => {
      const r = runPty(questionOrProceed, args, env)
      expect(r.stdout).not.toContain("ASKED")
      expect(r.stdout).toContain(
        "LINE:Non-interactive run — using base color neutral, distribution copy, visual style vega."
      )
    }
  )

  describe("a project without Marko", () => {
    const noMarko = '{"name":"fixture","dependencies":{"react":"19"}}'
    const offer = String.raw`Install it\?`

    it("offers the install; the first option installs marko + @marko/run and init continues", () => {
      const r = runPty(
        ask(offer) + cancelAt(String.raw`Which[^\r\n]*base color`),
        [],
        {},
        { pkg: noMarko, shimBun: true }
      )
      expect(r.installs).toEqual(["bun add -- marko @marko/run"])
      expect(r.stdout).toMatch(/ASKED:.*base color/)
      expect(r.written).toBe(false)
    })

    it("No exits 1 with the refusal, installs nothing and writes nothing", () => {
      const r = runPty(
        String.raw`
expect {
  -re {Install it\?} { sleep 0.3; send "\033\[B"; sleep 0.2; send "\033\[B"; sleep 0.2; send "\r" }
  timeout { puts "TIMEOUT"; exit 9 }
  eof { puts "EOF-BEFORE-PROMPT"; exit 8 }
}
expect eof
puts $expect_out(buffer)
lassign [wait] pid spawnid os rc
puts "EXIT=$rc"
`,
        [],
        {},
        { pkg: noMarko, shimBun: true }
      )
      expect(r.stdout).toContain("does not look like a Marko project")
      expect(r.stdout).not.toContain("to be offered the Marko install")
      expect(r.stdout).toContain("EXIT=1")
      expect(r.installs).toEqual([])
      expect(r.written).toBe(false)
    })

    it("--defaults refuses without asking and says to drop the flag", () => {
      const r = runPty(
        String.raw`
expect eof
puts $expect_out(buffer)
lassign [wait] pid spawnid os rc
puts "EXIT=$rc"
`,
        ["--defaults"],
        {},
        { pkg: noMarko, shimBun: true }
      )
      expect(r.stdout).not.toContain("Install it?")
      expect(r.stdout).toContain("without -y/--defaults/--silent to be offered the Marko install")
      expect(r.stdout).toContain("EXIT=1")
      expect(r.installs).toEqual([])
    })
  })
})
