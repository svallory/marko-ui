/**
 * The pty driver for interactive steps.
 *
 * `expect` (Tcl) is the pty, not node-pty: it is what
 * `packages/marko-ui/src/commands/init.test.ts` already drives the built CLI
 * with, so there is no native dependency to install, and the answer scripting
 * is the same shape the CLI's own tests proved. A step's `pty:` list is an
 * answer script: each entry waits for its `expect` string to appear in the
 * merged output and then types `send`.
 *
 * Two details that are not cosmetic:
 *
 * - The window size is set explicitly (`set stty_init "rows 40 columns 120"`).
 *   A pty with 0 columns — expect's default — makes `ora` erase lines forever,
 *   which reads as a hang that has nothing to do with prompting.
 * - The CLI decides whether it may prompt from its environment
 *   (`NON_INTERACTIVE_ENV_VARS` in packages/marko-ui/src/utils/interactive.ts),
 *   and the repo's `bun` is a proto shim that exports several of those names
 *   into every process it launches. They are unset for the child, exactly as
 *   init.test.ts does, or a "real terminal" run is a non-interactive one.
 *
 * Output is matched with ANSI escapes stripped by the caller, never asserted
 * with colour present: the proto shim also injects NO_COLOR, so a local run and
 * a CI run differ and the assertions must not.
 */
import { spawnSync } from "node:child_process"
import { mkdtempSync, realpathSync, writeFileSync } from "node:fs"
import { tmpdir } from "node:os"
import { join } from "node:path"
import { hasTool } from "./selection.ts"
import type { PtyAnswer } from "./scenario-doc.ts"

// The CLI's own NON_INTERACTIVE_ENV_VARS (CI, CLAUDECODE, AI_AGENT,
// CURSOR_AGENT, REPL_ID) plus the other proto-shim triggers documented in the
// root AGENTS.md (CLAUDE_CODE, CURSOR_TRACE_ID, CODEX_SANDBOX). Unsetting the
// union is what makes this a real terminal rather than a pty in name only.
const UNSET_FOR_PTY = [
  "CI",
  "CLAUDECODE",
  "AI_AGENT",
  "CURSOR_AGENT",
  "REPL_ID",
  "CLAUDE_CODE",
  "CURSOR_TRACE_ID",
  "CODEX_SANDBOX",
]

/** Per-answer cap from the scenarios contract: a prompt that never appears fails the step. */
const ANSWER_TIMEOUT_SECONDS = 30

const ANSI = "(?:\\x1b\\[[0-9;?]*[a-zA-Z]|\\x1b\\][^\\x07\\x1b]*(?:\\x07|\\x1b\\\\))?"

function escapeRegexChar(char: string): string {
  return /[\\^$.|?*+()[\]{}]/.test(char) ? `\\${char}` : char
}

/**
 * The `expect` string is a substring, but it is matched against a raw pty
 * stream, where a colourised word arrives as `ESC[1mneutral ESC[0m`. Allowing
 * an escape sequence between any two characters is what makes a plain
 * substring survive a coloured CLI without asking scenarios to spell ANSI.
 */
function expectPattern(literal: string): string {
  return literal
    .split("")
    .map(escapeRegexChar)
    .join(`${ANSI}*`)
}

/** A Tcl double-quoted string: escape the substitution metacharacters and controls. */
function tclQuote(value: string): string {
  let out = '"'
  for (const char of value) {
    const code = char.codePointAt(0) ?? 0
    if (char === "\\") out += "\\\\"
    else if (char === '"') out += '\\"'
    else if (char === "$") out += "\\$"
    else if (char === "[") out += "\\["
    else if (char === "]") out += "\\]"
    else if (char === "\r") out += "\\r"
    else if (char === "\n") out += "\\n"
    else if (code < 0x20 || code === 0x7f) {
      out += `\\x${code.toString(16).padStart(2, "0")}`
    } else out += char
  }
  return `${out}"`
}

export interface PtyResult {
  stdout: string
  stderr: string
  exitCode: number
  /** Set when the answer script gave up rather than the CLI failing. */
  driverError?: string
}

export function ptyAvailable(): boolean {
  return hasTool("expect")
}

/**
 * Drives `command` in a pty inside `cwd`, answering `answers` in order.
 * `timeoutMs` bounds the whole step; each answer additionally has its own
 * 30 s cap so a prompt that never appears fails fast with a name, instead of
 * sitting at the step timeout with no explanation.
 */
export function runPty(options: {
  cwd: string
  command: string
  args: string[]
  answers: PtyAnswer[]
  env?: Record<string, string | null>
  timeoutMs: number
}): PtyResult {
  const dir = realpathSync(mkdtempSync(join(tmpdir(), "marko-ui-pty-")))
  const scriptPath = join(dir, "drive.exp")

  const unsetArgs = UNSET_FOR_PTY.flatMap((name) => ["-u", name])
  const envAssignments = Object.entries(options.env ?? {}).filter(
    (entry): entry is [string, string] => typeof entry[1] === "string",
  )

  const answerBlocks = options.answers
    .map(
      (answer, index) => `
# answer ${index + 1}/${options.answers.length}${
        answer.note ? ` — ${answer.note.replace(/[\r\n]+/g, " ")}` : ""
      }
expect {
  -re ${tclQuote(expectPattern(answer.expect))} { sleep 0.3; send -- ${tclQuote(answer.send)} }
  timeout { puts stderr "MARKER:timeout waiting for ${answer.expect.replace(/[\r\n]+/g, " ")}"; exit 9 }
  eof    { puts stderr "MARKER:eof before ${answer.expect.replace(/[\r\n]+/g, " ")}"; exit 8 }
}`
    )
    .join("\n")

  const script = `set stty_init "rows 40 columns 120"
set timeout ${ANSWER_TIMEOUT_SECONDS}
cd ${tclQuote(options.cwd)}
log_user 1
spawn env ${unsetArgs.map((name) => tclQuote(name)).join(" ")} ${envAssignments
    .map(([key, value]) => `${key}=${value}`)
    .join(" ")} {*}$argv
${answerBlocks}
expect eof
lassign [wait] pid spawnid os rc
puts stderr "MARKER:exit $rc"
`

  writeFileSync(scriptPath, script)

  const result = spawnSync("expect", [scriptPath, "env", ...envAssignments.flatMap(([key, value]) => [key, value]), options.command, ...options.args], {
    encoding: "utf8",
    timeout: options.timeoutMs,
    maxBuffer: 64 * 1024 * 1024,
    cwd: options.cwd,
  })

  const stderr = result.stderr ?? ""
  const driverError = /MARKER:(timeout|eof) /.exec(stderr)?.[0]
  const exitMarker = /MARKER:exit (-?\d+)/.exec(stderr)
  const exitCode =
    exitMarker !== null
      ? Number.parseInt(exitMarker[1] ?? "-1", 10)
      : (result.status ?? -1)

  return {
    stdout: result.stdout ?? "",
    stderr,
    exitCode: result.error ? -1 : exitCode,
    driverError: result.error
      ? `expect could not run: ${result.error.message}`
      : driverError
        ? stderr.slice(stderr.indexOf("MARKER:"))
        : undefined,
  }
}
