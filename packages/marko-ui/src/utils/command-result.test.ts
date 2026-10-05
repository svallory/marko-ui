import { afterEach, describe, expect, it, vi } from "vitest"
import {
  commandWarningSchema,
  fileChangeSchema,
  FILE_CHANGE_STATUSES,
  nextSteps,
  plannedToFileChanges,
  toFileChanges,
  WarningCode,
} from "@/src/utils/command-result"
import { unifiedDiffText } from "@/src/commands/diff"
import { logger } from "@/src/utils/logger"
import { resetJsonMode, setJsonMode } from "@/src/utils/output-mode"

describe("toFileChanges", () => {
  it("maps each grouped array to its status, sorted by path", () => {
    expect(
      toFileChanges({
        filesCreated: ["src/b.marko"],
        filesUpdated: ["src/a.marko"],
        filesSkipped: ["src/c.marko"],
        filesRemoved: ["src/old.ts"],
      })
    ).toEqual([
      { path: "src/a.marko", status: "updated" },
      { path: "src/b.marko", status: "created" },
      { path: "src/c.marko", status: "skipped" },
      { path: "src/old.ts", status: "removed" },
    ])
  })

  it("tolerates missing groups — an add that wrote nothing is still an AddResult", () => {
    expect(toFileChanges({})).toEqual([])
  })

  // The distinction the whole task turns on: a fresh install and a re-run
  // that skipped everything must NOT produce the same list.
  it("distinguishes a fresh install from a re-run that skipped everything", () => {
    const fresh = toFileChanges({ filesCreated: ["a.ts", "b.ts"] })
    const rerun = toFileChanges({ filesSkipped: ["a.ts", "b.ts"] })

    expect(fresh.map((f) => f.status)).toEqual(["created", "created"])
    expect(rerun.map((f) => f.status)).toEqual(["skipped", "skipped"])
    expect(fresh).not.toEqual(rerun)
  })
})

describe("plannedToFileChanges", () => {
  it("maps a dry run's actions onto the same vocabulary", () => {
    expect(
      plannedToFileChanges([
        { path: "b.ts", action: "create" },
        { path: "a.ts", action: "overwrite" },
        { path: "c.ts", action: "skip" },
      ])
    ).toEqual([
      { path: "a.ts", status: "updated" },
      { path: "b.ts", status: "created" },
      { path: "c.ts", status: "unchanged" },
    ])
  })
})

describe("nextSteps", () => {
  it("dedupes and drops empties", () => {
    expect(nextSteps(["a", "", "a", "b"])).toEqual(["a", "b"])
  })
})

describe("the schemas", () => {
  it("accepts every declared file status and rejects an unknown one", () => {
    for (const status of FILE_CHANGE_STATUSES) {
      expect(fileChangeSchema.parse({ path: "a.ts", status }).status).toBe(
        status
      )
    }
    expect(() =>
      fileChangeSchema.parse({ path: "a.ts", status: "maybe" })
    ).toThrow()
  })

  it("accepts every declared warning code and rejects an unknown one", () => {
    for (const code of Object.values(WarningCode)) {
      expect(
        commandWarningSchema.parse({ code, message: "m" }).code
      ).toBe(code)
    }
    expect(() =>
      commandWarningSchema.parse({ code: "NOPE", message: "m" })
    ).toThrow()
  })

  // A warning's fix is optional: some are informational. But every one of
  // these codes exists because something needs a concrete action, so the
  // shape must carry it when there is one.
  it("keeps fix optional but carries it when present", () => {
    expect(
      commandWarningSchema.parse({
        code: WarningCode.CSS_NOT_IMPORTED,
        message: "m",
        fix: "bun x",
      })
    ).toMatchObject({ fix: "bun x" })
    expect(
      commandWarningSchema.parse({
        code: WarningCode.CSS_NOT_IMPORTED,
        message: "m",
      })
    ).not.toHaveProperty("fix")
  })
})

describe("unifiedDiffText", () => {
  // A program reads and logs this. An ANSI escape in a JSON string is noise
  // at best, and the human path keeps its colors because a terminal renders
  // them — but this one must never carry them.
  it("contains no ANSI escapes", () => {
    const text = unifiedDiffText("a\nb\nc\n", "a\nB\nc\n")
    // eslint-disable-next-line no-control-regex
    expect(text).not.toMatch(/\[/)
  })

  it("reads an incoming change as a removal from the local file", () => {
    const text = unifiedDiffText("line\nold\n", "line\nnew\n")
    expect(text).toContain("-old")
    expect(text).toContain("+new")
  })

  it("names the two sides, so a reader knows which is which", () => {
    const text = unifiedDiffText("a\n", "b\n")
    expect(text).toContain("--- local")
    expect(text).toContain("+++ registry")
  })

  it("is empty-ish for identical content", () => {
    expect(unifiedDiffText("same\n", "same\n")).not.toContain("@@")
  })
})

describe("logger under --json", () => {
  afterEach(() => {
    resetJsonMode()
    vi.restoreAllMocks()
  })

  function capture() {
    const out: string[] = []
    const err: string[] = []
    // console.log/error, NOT process.stdout.write: Node's console holds its
    // own reference to the stream, so spying on the write method does not
    // intercept it.
    vi.spyOn(console, "log").mockImplementation((...args) => {
      out.push(args.join(" "))
    })
    vi.spyOn(console, "error").mockImplementation((...args) => {
      err.push(args.join(" "))
    })
    return {
      get out() {
        return out.join("\n")
      },
      get err() {
        return err.join("\n")
      },
    }
  }

  // stdout must carry EXACTLY one document. A command that narrates progress
  // through logger.info before reaching its envelope would otherwise prepend
  // prose to the JSON and break every parser, so the suppression lives in the
  // logger itself rather than in a check per call site.
  it("silences the stdout writers but keeps the stderr writers", () => {
    const streams = capture()
    setJsonMode(true)

    logger.info("progress")
    logger.log("a result line")
    logger.success("done")
    logger.break()
    logger.warn("a real warning")

    expect(streams.out).toBe("")
    // A real warning still belongs on stderr in --json mode, where nothing
    // else will show it.
    expect(streams.err).toContain("a real warning")
  })

  it("keeps the stdout writers in human mode", () => {
    const streams = capture()
    // Explicit false, not resetJsonMode(): reset clears the recorded value,
    // and an unset value falls back to scanning argv, which the test runner
    // may legitimately have populated.
    setJsonMode(false)

    logger.log("a result line")
    expect(streams.out).toContain("a result line")
  })
})