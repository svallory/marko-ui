import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { execFileSync, spawnSync } from "node:child_process";
import { cpSync, mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

// check-conflict-markers.ts scans `git ls-files`, so it can only be
// exercised inside a real repository. Each case therefore builds a throwaway
// git repo with the REAL script (plus the fs-utils it imports) copied in
// unmodified — copying the real file is what makes this a regression test of
// that file rather than of a paraphrase of it.
const TOOLING_DIR = path.dirname(path.dirname(fileURLToPath(import.meta.url)));

let sandbox: string;

function setupSandbox() {
  sandbox = mkdtempSync(path.join(tmpdir(), "conflict-markers-"));
  execFileSync("git", ["init", "-q"], { cwd: sandbox });
  // `git ls-files` lists staged paths, so committing is unnecessary — but a
  // user identity is still needed if anything ever does commit here.
  execFileSync("git", ["config", "user.email", "test@example.com"], { cwd: sandbox });
  execFileSync("git", ["config", "user.name", "test"], { cwd: sandbox });

  mkdirSync(path.join(sandbox, "tooling"), { recursive: true });
  for (const file of ["check-conflict-markers.ts", "fs-utils.ts"]) {
    cpSync(path.join(TOOLING_DIR, file), path.join(sandbox, "tooling", file));
  }
}

/** Write a file and stage it, so `git ls-files` sees it. */
function track(relPath: string, content: string | Buffer) {
  const target = path.join(sandbox, relPath);
  mkdirSync(path.dirname(target), { recursive: true });
  writeFileSync(target, content);
  execFileSync("git", ["add", "--", relPath], { cwd: sandbox });
}

function run(args: string[] = []) {
  const result = spawnSync("bun", ["tooling/check-conflict-markers.ts", ...args], {
    cwd: sandbox,
    encoding: "utf8",
  });
  return { status: result.status, stdout: result.stdout ?? "", stderr: result.stderr ?? "" };
}

beforeEach(setupSandbox);
afterEach(() => rmSync(sandbox, { recursive: true, force: true }));

describe("check-conflict-markers", () => {
  it("passes on a clean tree", () => {
    track("docs.md", "# Title\n\nordinary prose\n");
    const { status, stdout } = run();
    expect(status).toBe(0);
    expect(stdout).toContain("no conflict markers");
  });

  // The four markers git can emit. `|||||||` is the one that shipped in
  // AGENTS.md and motivated this check: it only appears under
  // diff3/zdiff3, so a resolver looking for the usual three misses it.
  it.each([
    ["<<<<<<< HEAD", "ours"],
    ["======="],
    [">>>>>>> branch", "theirs"],
    ["||||||| parent of abc1234 (some commit)", "diff3 base"],
  ] as [string, string?][])("fails on %s", (marker) => {
    track("docs.md", `before\n${marker}\nafter\n`);
    const { status, stdout } = run();
    expect(status).toBe(1);
    expect(stdout).toContain("docs.md:2");
    expect(stdout).toContain("1 unresolved conflict marker");
  });

  it("reports every marker with its file and line", () => {
    track("a.md", "x\n<<<<<<< HEAD\ny\n");
    track("nested/b.md", "p\nq\n>>>>>>> other\n");
    const { status, stdout } = run();
    expect(status).toBe(1);
    expect(stdout).toContain("a.md:2");
    expect(stdout).toContain("nested/b.md:3");
    expect(stdout).toContain("2 unresolved conflict marker");
  });

  // The trailing-context rule: seven marker characters must be alone on the
  // line or followed by a space. Without it this check would fire on
  // ordinary Markdown and code.
  it.each([
    ["a Markdown setext rule", "Heading\n=======\ntext\n", 1],
    ["a longer rule", "Heading\n==========\ntext\n", 0],
    ["a shorter run", "Heading\n======\ntext\n", 0],
    ["seven chars followed by text", "=======Section\n", 0],
    ["an indented marker", "  <<<<<<< HEAD\n", 0],
  ])("%s -> %i finding(s)", (_label, content, expected) => {
    track("docs.md", content);
    const { status } = run();
    expect(status).toBe(expected === 0 ? 0 : 1);
  });

  it("ignores untracked files", () => {
    track("tracked.md", "clean\n");
    writeFileSync(path.join(sandbox, "scratch.md"), "<<<<<<< HEAD\n");
    expect(run().status).toBe(0);
  });

  it("skips binary files", () => {
    // A NUL byte in the sniff window marks it binary; the marker text after
    // it must not be read as a line.
    track("blob.bin", Buffer.concat([Buffer.from([0x00, 0x01]), Buffer.from("<<<<<<< HEAD\n")]));
    expect(run().status).toBe(0);
  });

  it("can be scoped to a subdirectory", () => {
    track("outside.md", "<<<<<<< HEAD\n");
    track("inside/ok.md", "clean\n");
    expect(run(["inside"]).status).toBe(0);
    expect(run().status).toBe(1);
  });

  it("emits machine-readable findings with --json", () => {
    track("docs.md", "x\n||||||| parent of abc1234 (msg)\n");
    const { status, stdout } = run(["--json"]);
    expect(status).toBe(1);
    const report = JSON.parse(stdout);
    expect(report.ok).toBe(false);
    expect(report.findings).toHaveLength(1);
    expect(report.findings[0]).toMatchObject({ file: "docs.md", line: 2 });
  });
});
