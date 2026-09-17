/**
 * check-html-comments.ts — scripted check #6.
 *
 * Marko 6.3.46 terminates an HTML comment (`<!-- ... -->`) at the first `->`
 * it finds, not at the first `-->`. A comment body containing a bare `->`
 * anywhere before its intended closing `-->` — e.g. an ASCII arrow in prose
 * ("so the page read h1 -> h3") — gets truncated early, and everything after
 * that `->` up to the next `-->` (or end of file) is emitted as literal page
 * text instead of staying inside the comment. This shipped once
 * (routes/docs/components/$name/+page.marko), leaking ~730 characters of
 * internal commentary onto every component docs page in production. See
 * AGENTS.md's Marko gotchas list for the verified mechanism.
 *
 * This check parses every `.marko` file the same way a human reads real
 * HTML-comment syntax (`<!--` ... first `-->`), then rejects any comment
 * whose body contains a `->` — since that `->`, not the real `-->`, is what
 * Marko will actually treat as the terminator.
 *
 * Usage:
 *   bun tooling/check-html-comments.ts
 * Exit 1 if any `.marko` file has an HTML comment containing a bare `->`
 * before its closing `-->`, else 0.
 */
import { readFileSync } from "node:fs"
import path from "node:path"

import { REPO_ROOT, runCheck, walkAbsolute } from "./fs-utils"

const COMMENT_RE = /<!--([\s\S]*?)-->/g

interface Violation {
  file: string
  line: number
  excerpt: string
}

/** Directories under REPO_ROOT to scan; mirrors the brief's own sweep scope. */
const SCAN_ROOTS = ["apps", "packages"]

function scanFile(absPath: string): Violation[] {
  const content = readFileSync(absPath, "utf8")
  const relPath = path.relative(REPO_ROOT, absPath)
  const violations: Violation[] = []

  for (const match of content.matchAll(COMMENT_RE)) {
    const body = match[1] ?? ""
    const arrowIndex = body.indexOf("->")
    if (arrowIndex === -1) continue

    const commentStart = match.index ?? 0
    const line = content.slice(0, commentStart + 4 + arrowIndex).split("\n").length
    const excerpt = body
      .slice(Math.max(0, arrowIndex - 40), arrowIndex + 40)
      .replace(/\s+/g, " ")
      .trim()

    violations.push({ file: relPath, line, excerpt })
  }

  return violations
}

function main(): number {
  const violations: Violation[] = []
  let checked = 0

  for (const root of SCAN_ROOTS) {
    for (const absPath of walkAbsolute(path.join(REPO_ROOT, root), [".marko"])) {
      checked++
      violations.push(...scanFile(absPath))
    }
  }

  for (const violation of violations) {
    console.log(
      `FAIL         ${violation.file}:${violation.line} — HTML comment contains "->" before ` +
        `its "-->" ("...${violation.excerpt}..."); Marko will close the comment at that "->" ` +
        `and leak everything after it onto the rendered page. Replace the arrow (e.g. "to", ` +
        `"→", or "&gt;") so no "-->" -like sequence with an unescaped hyphen precedes the real ` +
        `terminator.`,
    )
  }

  console.log(
    `\n${checked} .marko file(s) checked (HTML comment terminator); ` +
      `${violations.length} violation(s).`,
  )
  return violations.length ? 1 : 0
}

runCheck("check-html-comments", main)
