/**
 * Three runner bugs the post-setup/environment sweep found by running, and the
 * shape of each that must not come back.
 *
 * None of these is a CLI defect and none is a YAML defect: each is a place
 * where the runner did something narrower than the document says it does, and
 * in all three the symptom arrived wearing a costume that pointed somewhere
 * else — "bun is not installed", "Invalid URL", "No project found". The tests
 * below assert the documented behaviour directly, so removing a fix fails
 * here rather than three scenarios later.
 *
 *   1. a pre-step `run` ignored the pre-step's own `cwd`, and resolved
 *      `run.cwd` against the app dir rather than the workspace
 *      — env.symlinked-project
 *   2. a step `env` value was handed to the CLI verbatim, `$VAR` and all
 *      — env.custom-registry-url
 *   3. a pinned `cliVersion` was installed into a directory nobody created
 *      — post.upgrade-from-0-4-1
 *
 * Fast and hermetic on purpose: no scaffold, no install, no network. The
 * scenarios that found the bugs are the proof; this file is the guard.
 */
import { existsSync } from "node:fs"
import { mkdir, mkdtemp, readFile, realpath, writeFile } from "node:fs/promises"
import { tmpdir } from "node:os"
import { join } from "node:path"
import { describe, expect, it } from "vitest"
import {
  applyPreSteps,
  buildEnv,
  ensurePinnedCliDir,
} from "../lib/run-scenario.ts"
import { loadScenarioDoc } from "../lib/scenario-doc.ts"
import { selectScenarios } from "../lib/selection.ts"
import type { Scenario, ScenariosDoc, Step } from "../lib/scenario-doc.ts"
import type { TargetConfig } from "../lib/selection.ts"

const target: TargetConfig = {
  kind: "tarball",
  version: "0.0.0",
  registryUrl: "https://example.invalid/r",
  timeoutSeconds: 300,
  keepTemp: false,
}

const doc = { bodies: {} } as unknown as ScenariosDoc
const scenario = { id: "test.scenario" } as unknown as Scenario

const VARS = {
  WORKSPACE: "/w",
  APP: "/w/app",
  PM: "bun",
  REGISTRY_URL: "https://example.invalid/r",
  ACCEPTANCE_MIRROR_PORT: "4470",
}

async function scratch(): Promise<{ workspace: string; app: string }> {
  const workspace = await mkdtemp(join(tmpdir(), "marko-ui-acceptance-unit-"))
  const app = join(workspace, "app")
  await mkdir(app)
  return { workspace, app }
}

/** Where a `run` pre-step actually executed, by asking it. */
async function cwdOfRun(step: Step, workspace: string, app: string) {
  await applyPreSteps([step], { doc, cwd: app, label: "post", pm: "bun", workspace })
  // The command drops a marker beside itself and prints its own cwd, so the
  // assertion needs no path of ours to be right — it just has to find the
  // marker, which is in the workspace for `cwd: "."` and in the app otherwise.
  // macOS puts a temp dir behind /var → /private/var and `sh` prints the path
  // it was handed, so both sides go through realpath.
  const from = existsSync(join(workspace, "where.txt")) ? workspace : app
  const dir = await realpath((await readFile(join(from, "where.txt"), "utf8")).trim())
  expect((await readFile(join(dir, "where.txt"), "utf8")).trim()).toBe(dir)
  return dir
}

describe("acceptance · runner · a pre-step run honours its cwd", () => {
  it("runs at the workspace root when the pre-step says `cwd: \".\"`", async () => {
    const { workspace, app } = await scratch()
    // env.symlinked-project's exact shape: `ln -s app link-to-app` has to land
    // NEXT TO the app. Run at the app dir it creates app/link-to-app, a
    // self-referential link, and the scenario's first step then dies on
    // "No project found at link-to-app".
    const where = await cwdOfRun(
      { label: "record the cwd", cwd: ".", run: { cmd: "pwd > where.txt" } } as unknown as Step,
      workspace,
      app
    )
    expect(where).toBe(await realpath(workspace))
  })

  it("still defaults to the app dir when no cwd is given", async () => {
    const { workspace, app } = await scratch()
    const where = await cwdOfRun(
      { label: "record the cwd", run: { cmd: "pwd > where.txt" } } as unknown as Step,
      workspace,
      app
    )
    expect(where).toBe(await realpath(app))
  })
})

describe("acceptance · runner · step env values are interpolated", () => {
  it("substitutes $ACCEPTANCE_MIRROR_PORT, the only way a scenario can reach the mirror", () => {
    const step = {
      command: "init",
      env: { REGISTRY_URL: "http://127.0.0.1:$ACCEPTANCE_MIRROR_PORT/r" },
    } as unknown as Step
    const env = buildEnv(scenario, step, target, VARS)
    // A literal `$NAME` reaching the CLI is not a URL: `new URL()` throws
    // "Invalid URL" and init rolls back with no components.json.
    expect(env.REGISTRY_URL).toBe("http://127.0.0.1:4470/r")
    expect(env.REGISTRY_URL).not.toContain("$")
  })

  it("keeps `$$` as an escaped literal $, and a null value still deletes a variable", () => {
    const step = {
      command: "init",
      env: { A: "cost is $$5", B: null },
    } as unknown as Step
    const env = buildEnv(scenario, step, target, VARS)
    expect(env.A).toBe("cost is $5")
    expect(env.B).toBeUndefined()
  })
})

describe("acceptance · runner · a pinned cliVersion gets a directory to install into", () => {
  it("creates the directory instead of letting spawnSync report it as a missing bun", async () => {
    const workspace = await mkdtemp(join(tmpdir(), "marko-ui-acceptance-pinned-"))
    const pinned = ensurePinnedCliDir(workspace, "0.4.1")
    expect(existsSync(pinned)).toBe(true)
    // The exact path resolveInvocation installs into, so a divergence between
    // the helper and its caller fails here rather than in a scenario.
    expect(pinned).toBe(join(workspace, ".acceptance-cli", "0.4.1"))
  })

  it("makes it a package root, or the install hoists into the scenario workspace", async () => {
    // The scenario workspace has a package.json of its own — the CLI under test
    // is installed there — and `bun add` inside an empty subdirectory of a
    // package root installs into THAT root. Without a manifest here the install
    // exits 0, hoists, and the invocation fails with "Cannot find module
    // …/.acceptance-cli/0.4.1/node_modules/marko-ui/dist/index.js".
    const workspace = await mkdtemp(join(tmpdir(), "marko-ui-acceptance-pinned-"))
    await writeFile(
      join(workspace, "package.json"),
      JSON.stringify({ name: "workspace", private: true })
    )
    const pinned = ensurePinnedCliDir(workspace, "0.4.1")
    const manifest = JSON.parse(await readFile(join(pinned, "package.json"), "utf8"))
    expect(manifest.private).toBe(true)
    expect(manifest.name).toBe("marko-ui-acceptance-cli-0.4.1")
  })

  it("leaves an existing manifest alone", async () => {
    const workspace = await mkdtemp(join(tmpdir(), "marko-ui-acceptance-pinned-"))
    const pinned = ensurePinnedCliDir(workspace, "0.4.1")
    await writeFile(join(pinned, "package.json"), JSON.stringify({ name: "mine" }))
    ensurePinnedCliDir(workspace, "0.4.1")
    expect(JSON.parse(await readFile(join(pinned, "package.json"), "utf8")).name).toBe("mine")
  })

  it("is safe to call twice and does not empty a directory that is already installed", async () => {
    const workspace = await mkdtemp(join(tmpdir(), "marko-ui-acceptance-pinned-"))
    ensurePinnedCliDir(workspace, "0.4.1")
    await writeFile(join(workspace, ".acceptance-cli", "0.4.1", "marker"), "x")
    ensurePinnedCliDir(workspace, "0.4.1")
    expect(existsSync(join(workspace, ".acceptance-cli", "0.4.1", "marker"))).toBe(true)
  })

  it("makes it a package root, or the install hoists into the scenario workspace", async () => {
    // The scenario workspace has a package.json of its own — the CLI under test
    // is installed there — and `bun add` inside an empty subdirectory of a
    // package root installs into THAT root. Without a manifest here the install
    // exits 0, hoists, and the invocation fails with "Cannot find module
    // …/.acceptance-cli/0.4.1/node_modules/marko-ui/dist/index.js".
    const workspace = await mkdtemp(join(tmpdir(), "marko-ui-acceptance-pinned-"))
    await writeFile(
      join(workspace, "package.json"),
      JSON.stringify({ name: "workspace", private: true })
    )
    const pinned = ensurePinnedCliDir(workspace, "0.4.1")
    const manifest = JSON.parse(
      await readFile(join(pinned, "package.json"), "utf8")
    )
    expect(manifest.private).toBe(true)
    expect(manifest.name).toBe("marko-ui-acceptance-cli-0.4.1")
  })

  it("leaves an existing manifest alone", async () => {
    const workspace = await mkdtemp(join(tmpdir(), "marko-ui-acceptance-pinned-"))
    const pinned = ensurePinnedCliDir(workspace, "0.4.1")
    await writeFile(
      join(pinned, "package.json"),
      JSON.stringify({ name: "mine" })
    )
    ensurePinnedCliDir(workspace, "0.4.1")
    expect(
      JSON.parse(await readFile(join(pinned, "package.json"), "utf8")).name
    ).toBe("mine")
  })
})

/**
 * The `kind:` filter trap, pinned.
 *
 * `skills.user-edited-agents-md` and `skills.claude-md-only` have
 * `kind: skills` but the sub-theme tag `kind:agents-md`, and NO scenario in the
 * suite is tagged `kind:skills` — so `ACCEPTANCE_TAGS=kind:skills`, the filter a
 * reader reaches for, used to select nothing at all and the two scenarios
 * vanished from every kind-filtered run.
 *
 * The suite uses `kind:` tags as a SUB-THEME axis (`kind:theming`, `kind:alias`,
 * `kind:registry`) on scenarios of many different kinds, so the fix cannot be
 * "the tag must equal the kind field" — that would rewrite sixty-odd scenarios
 * and delete the sub-theme axis the CI sharding is built on. The fix is that a
 * `kind:<x>` selector matches the scenario's `kind` FIELD as well as its tags,
 * which makes a group always selectable whatever anybody tagged. These tests
 * fail if that ever stops being true, which is a stronger guard than a YAML
 * lint: the bug was in the runner, not in the document.
 */
describe("kind filters", () => {
  const realDoc = loadScenarioDoc()

  it("selects EVERY scenario of a kind by ACCEPTANCE_TAGS=kind:<group>", () => {
    // Containment, not equality: a sub-theme tag legitimately crosses groups
    // (env.custom-registry-url is an `environment` scenario tagged
    // `kind:registry`), so `kind:registry` may select more than the three
    // registry scenarios. What must never happen is the other direction — a
    // group filter dropping one of its own scenarios, which is the bug.
    for (const kind of ["core", "skills", "monorepo", "environment", "registry"]) {
      const selected = new Set(
        selectScenarios(realDoc, {
          scenarios: [],
          tags: [`kind:${kind}`],
          excludeTags: [],
        }).map((candidate) => candidate.id)
      )
      const inKind = realDoc.scenarios
        .filter((candidate) => candidate.kind === kind)
        .map((candidate) => candidate.id)
      expect(inKind.length).toBeGreaterThan(0)
      for (const id of inKind) expect(selected.has(id)).toBe(true)
    }
  })

  it("keeps the two skills scenarios that the trap used to drop", () => {
    const selected = selectScenarios(realDoc, {
      scenarios: [],
      tags: ["kind:skills"],
      excludeTags: [],
    })
    const ids = selected.map((candidate) => candidate.id)
    expect(ids).toContain("skills.user-edited-agents-md")
    expect(ids).toContain("skills.claude-md-only")
  })

  it("still selects a sub-theme on its own, and does not widen to the group", () => {
    const selected = selectScenarios(realDoc, {
      scenarios: [],
      tags: ["kind:theming"],
      excludeTags: [],
    })
    expect(selected.length).toBeGreaterThan(0)
    for (const candidate of selected) {
      expect(candidate.tags).toContain("kind:theming")
    }
  })

  it("ANDs a group filter with an os filter, as every other tag does", () => {
    const linux = selectScenarios(realDoc, {
      scenarios: [],
      tags: ["kind:skills", "os:linux"],
      excludeTags: [],
    })
    expect(linux.length).toBeGreaterThan(0)
    for (const candidate of linux) expect(candidate.tags).toContain("os:linux")
  })
})
