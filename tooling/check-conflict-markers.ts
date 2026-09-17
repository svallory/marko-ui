/**
 * check-conflict-markers.ts — fails if any tracked text file contains an
 * unresolved merge-conflict marker.
 *
 * Why this exists: a `|||||||` diff3 base marker shipped in AGENTS.md on the
 * gallery-visual-guard branch (2026-09-17) and survived every other gate.
 * Nothing catches this class of mistake otherwise — a stray marker in prose
 * is not a type error, not a lint error, and not a test failure, so it rides
 * along into review and then into main. It is also the *easy* half of a
 * conflict to miss: a resolver scanning for `<<<<<<<`/`=======`/`>>>>>>>`
 * (the three markers `merge.conflictStyle=merge` produces) will not think to
 * look for the fourth one that `diff3`/`zdiff3` adds.
 *
 * What counts as a marker: a line that is exactly seven `<`, `=`, `>` or `|`
 * characters, either alone on the line or followed by a space. That is the
 * shape git writes. The trailing-context requirement is what keeps this from
 * firing on legitimate content — a Markdown `=======` table rule or a
 * `<<<<<<<` in a code sample is almost always either a different length or
 * has no trailing space, and a seven-character run followed immediately by
 * other text (e.g. `=======Section`) is not a marker either.
 *
 * Scope: `git ls-files`, so only tracked files, and binary files are skipped
 * by content sniffing (a NUL byte in the first 8 KiB). Untracked scratch
 * files and build output are deliberately not checked — they never ship.
 *
 * Usage:
 *   bun tooling/check-conflict-markers.ts
 *   bun tooling/check-conflict-markers.ts --json
 *   bun tooling/check-conflict-markers.ts path/to/dir   # limit the scan
 */
import { execFileSync } from "node:child_process"
import { readFileSync } from "node:fs"
import path from "node:path"
import { REPO_ROOT, runCheck } from "./fs-utils"

/**
 * Seven marker characters, then end-of-line or a space. See the header for
 * why the trailing context matters.
 */
const MARKER = /^(<{7}|={7}|>{7}|\|{7})( |$)/

/** How much of a file to sniff for NUL before deciding it is binary. */
const SNIFF_BYTES = 8192

interface Finding {
  file: string
  line: number
  text: string
}

function trackedFiles(scope: string[]): string[] {
  const args = ["ls-files", "-z", "--", ...(scope.length ? scope : ["."])]
  const out = execFileSync("git", args, { cwd: REPO_ROOT, encoding: "utf8" })
  return out.split("\0").filter(Boolean)
}

function isBinary(buffer: Buffer): boolean {
  return buffer.subarray(0, SNIFF_BYTES).includes(0)
}

function main(): number {
  const argv = process.argv.slice(2)
  const json = argv.includes("--json")
  const scope = argv.filter((arg) => !arg.startsWith("--"))

  const findings: Finding[] = []
  let scanned = 0

  for (const file of trackedFiles(scope)) {
    let buffer: Buffer
    try {
      buffer = readFileSync(path.join(REPO_ROOT, file))
    } catch {
      // Tracked but not present (a broken symlink, or a sparse checkout).
      continue
    }
    if (isBinary(buffer)) continue
    scanned++

    const lines = buffer.toString("utf8").split("\n")
    for (const [index, text] of lines.entries()) {
      if (MARKER.test(text)) {
        findings.push({ file, line: index + 1, text: text.slice(0, 120) })
      }
    }
  }

  if (json) {
    console.log(JSON.stringify({ scanned, findings, ok: findings.length === 0 }, null, 2))
    return findings.length ? 1 : 0
  }

  for (const finding of findings) {
    console.log(`FAIL         ${finding.file}:${finding.line}  ${finding.text}`)
  }

  if (findings.length) {
    console.log(
      `\n${scanned} tracked text file(s) scanned; ` +
        `${findings.length} unresolved conflict marker(s) found. ` +
        `Resolve the conflict and delete the marker line(s) — note that ` +
        `diff3/zdiff3 conflicts carry a fourth marker ("|||||||") that a ` +
        `search for the usual three will miss.`,
    )
  } else {
    console.log(`${scanned} tracked text file(s) scanned; no conflict markers.`)
  }

  return findings.length ? 1 : 0
}

runCheck("check-conflict-markers", main)
