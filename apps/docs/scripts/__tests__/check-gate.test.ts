import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { spawnSync } from "node:child_process";
import { mkdtempSync, mkdirSync, writeFileSync, chmodSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

const SCRIPTS_DIR = path.dirname(fileURLToPath(import.meta.url));
const REAL_SCRIPTS_DIR = path.join(SCRIPTS_DIR, "..");

// check.sh and generate-mtc-baseline.sh are exercised against a throwaway
// sandbox: a temp "apps/docs" directory with the real check.sh/
// generate-mtc-baseline.sh/normalize-mtc.ts copied in (unmodified — this is
// what actually guards against a regression in those files), a stub
// ensure-routes-dts.sh (the real one boots a dev server, which is slow and
// irrelevant to gate logic), and a stub `marko-type-check` placed first on
// PATH so no real, heap-heavy mtc run ever happens in a test.
let sandbox: string;

function writeScript(relPath: string, content: string, mode = 0o755) {
  const target = path.join(sandbox, relPath);
  mkdirSync(path.dirname(target), { recursive: true });
  writeFileSync(target, content);
  chmodSync(target, mode);
}

function copyRealScript(name: string) {
  const src = path.join(REAL_SCRIPTS_DIR, name);
  const content = require("node:fs").readFileSync(src, "utf8");
  writeScript(`scripts/${name}`, content);
}

function setupSandbox() {
  sandbox = mkdtempSync(path.join(tmpdir(), "mtc-gate-test-"));
  mkdirSync(path.join(sandbox, "scripts"), { recursive: true });
  copyRealScript("check.sh");
  copyRealScript("generate-mtc-baseline.sh");
  copyRealScript("normalize-mtc.ts");

  // no-op stand-in for the real dev-server-booting script
  writeScript("scripts/ensure-routes-dts.sh", "#!/usr/bin/env bash\nexit 0\n");

  // fake git repo so `git rev-parse --git-common-dir` (used for the cross-
  // worktree lock dir) resolves inside the sandbox, not the real repo.
  spawnSync("git", ["init", "-q"], { cwd: sandbox });
}

function writeMtcStub(stdout: string, exitCode: number) {
  const binDir = path.join(sandbox, "bin");
  mkdirSync(binDir, { recursive: true });
  const escaped = stdout.replace(/'/g, "'\\''");
  writeScript(
    "bin/marko-type-check",
    `#!/usr/bin/env bash\nprintf '%s' '${escaped}'\nexit ${exitCode}\n`,
  );
  return binDir;
}

function writeBaseline(content: string) {
  writeFileSync(path.join(sandbox, "mtc-baseline.txt"), content);
}

function runCheck(opts: { binDir: string; env?: Record<string, string> }) {
  return spawnSync("bash", ["scripts/check.sh"], {
    cwd: sandbox,
    encoding: "utf8",
    env: {
      ...process.env,
      PATH: `${opts.binDir}:${process.env.PATH}`,
      ...opts.env,
    },
  });
}

function runBaseline(opts: {
  binDir: string;
  args?: string[];
  env?: Record<string, string>;
}) {
  return spawnSync("bash", ["scripts/generate-mtc-baseline.sh", ...(opts.args ?? [])], {
    cwd: sandbox,
    encoding: "utf8",
    env: {
      ...process.env,
      PATH: `${opts.binDir}:${process.env.PATH}`,
      ...opts.env,
    },
  });
}

const ERROR_RECORD =
  "src/routes/foo.marko:1:1 - error TS2322\nsome bad type\n";
const ERROR_FINGERPRINT =
  "src/routes/foo.marko|TS2322|some bad type";

// What generate-mtc-baseline.sh actually writes for a 0-entry baseline:
// a comment header followed by trailing blank lines (see its HEADER heredoc
// + the final `echo`/`printf '%s\n' "$fingerprint"`), never a file with no
// trailing newline at all.
const REAL_SHAPE_EMPTY_BASELINE =
  "# apps/docs marko-type-check baseline.\n#\n# Regenerated: 2026-09-16T00:00:00Z\n\n\n";

beforeEach(() => {
  setupSandbox();
});

afterEach(() => {
  rmSync(sandbox, { recursive: true, force: true });
});

describe("check.sh", () => {
  it("is green when mtc exits 0 clean", () => {
    const binDir = writeMtcStub("", 0);
    writeBaseline("");
    const result = runCheck({ binDir });
    expect(result.status).toBe(0);
    expect(result.stderr).toContain("no new errors, baseline unchanged");
  });

  it("fails with a + line when a new error is not in the baseline", () => {
    const binDir = writeMtcStub(ERROR_RECORD, 1);
    writeBaseline("");
    const result = runCheck({ binDir });
    expect(result.status).toBe(1);
    expect(result.stderr).toContain("NEW errors not in mtc-baseline.txt");
    expect(result.stderr).toContain(`+ ${ERROR_FINGERPRINT}`);
  });

  it("is green when the only error is already a known baseline entry", () => {
    const binDir = writeMtcStub(ERROR_RECORD, 1);
    writeBaseline(ERROR_FINGERPRINT + "\n");
    const result = runCheck({ binDir });
    expect(result.status).toBe(0);
  });

  it("fails and reports a gone baseline entry that no longer reproduces", () => {
    const binDir = writeMtcStub("", 0);
    writeBaseline(ERROR_FINGERPRINT + "\n");
    const result = runCheck({ binDir });
    expect(result.status).toBe(1);
    expect(result.stderr).toContain("baseline errors that no longer reproduce");
    expect(result.stderr).toContain(`- ${ERROR_FINGERPRINT}`);
    expect(result.stderr).toContain("bun run mtc:baseline");
  });

  it("fails loud when mtc exits nonzero/non-1 (crash/OOM) with empty output", () => {
    const binDir = writeMtcStub("", 137);
    writeBaseline("");
    const result = runCheck({ binDir });
    expect(result.status).toBe(1);
    expect(result.stderr).toContain("did not complete (crash/OOM?)");
    expect(result.stderr).not.toContain("NEW errors");
  });

  it("fails loud when the normalizer crashes, without doing a baseline comparison", () => {
    const binDir = writeMtcStub(ERROR_RECORD, 1);
    writeBaseline("");
    writeScript(
      "bin/broken-normalizer",
      "#!/usr/bin/env bash\necho garbage >&2\nexit 3\n",
    );
    const result = runCheck({
      binDir,
      env: { NORMALIZE_MTC_CMD: path.join(sandbox, "bin/broken-normalizer") },
    });
    expect(result.status).toBe(1);
    expect(result.stderr).toContain("normalizer broken, not a clean run");
    expect(result.stderr).not.toContain("NEW errors");
  });

  it("fails loud when --count mismatches the raw record count", () => {
    const binDir = writeMtcStub(ERROR_RECORD, 1);
    writeBaseline("");
    // A normalizer whose plain run is correct but whose --count output is
    // wrong reproduces the exact class of bug this guard exists to catch.
    writeScript(
      "bin/mismatched-normalizer",
      `#!/usr/bin/env bash
if [[ " $* " == *" --count "* ]]; then
  echo "5 3"
else
  printf '%s\\n' '${ERROR_FINGERPRINT}'
fi
`,
    );
    const result = runCheck({
      binDir,
      env: {
        NORMALIZE_MTC_CMD: path.join(sandbox, "bin/mismatched-normalizer"),
      },
    });
    expect(result.status).toBe(1);
    expect(result.stderr).toContain("normalizer gap, not a clean run");
  });

  it("fails loud when --count output is malformed", () => {
    const binDir = writeMtcStub(ERROR_RECORD, 1);
    writeBaseline("");
    writeScript(
      "bin/garbage-count-normalizer",
      `#!/usr/bin/env bash
if [[ " $* " == *" --count "* ]]; then
  echo "garbage"
else
  printf '%s\\n' '${ERROR_FINGERPRINT}'
fi
`,
    );
    const result = runCheck({
      binDir,
      env: {
        NORMALIZE_MTC_CMD: path.join(sandbox, "bin/garbage-count-normalizer"),
      },
    });
    expect(result.status).toBe(1);
    expect(result.stderr).toContain("produced malformed output");
  });

  it("is green against a real-generator-shaped empty baseline (comments + trailing blank lines)", () => {
    const binDir = writeMtcStub("", 0);
    writeBaseline(REAL_SHAPE_EMPTY_BASELINE);
    const result = runCheck({ binDir });
    expect(result.status).toBe(0);
    expect(result.stderr).toContain("no new errors, baseline unchanged");
  });
});

describe("generate-mtc-baseline.sh", () => {
  it("writes a fresh baseline from mtc output", () => {
    const binDir = writeMtcStub(ERROR_RECORD, 1);
    writeBaseline("");
    const result = runBaseline({ binDir });
    expect(result.status).toBe(0);
    const written = require("node:fs").readFileSync(
      path.join(sandbox, "mtc-baseline.txt"),
      "utf8",
    );
    expect(written).toContain(ERROR_FINGERPRINT);
  });

  it("refuses to overwrite a non-empty baseline with empty output unless --force", () => {
    const binDir = writeMtcStub("", 0);
    writeBaseline(ERROR_FINGERPRINT + "\n");
    const result = runBaseline({ binDir });
    expect(result.status).toBe(1);
    expect(result.stderr).toContain("Refusing to overwrite mtc-baseline.txt");

    const forced = runBaseline({ binDir, args: ["--force"] });
    expect(forced.status).toBe(0);
    const written = require("node:fs").readFileSync(
      path.join(sandbox, "mtc-baseline.txt"),
      "utf8",
    );
    expect(written).not.toContain(ERROR_FINGERPRINT);
  });

  it("refuses to write a baseline when mtc crashes", () => {
    const binDir = writeMtcStub("", 137);
    writeBaseline("");
    const result = runBaseline({ binDir });
    expect(result.status).toBe(1);
    expect(result.stderr).toContain("did not complete (crash/OOM?)");
  });

  it("refuses to write a baseline when the normalizer crashes", () => {
    const binDir = writeMtcStub(ERROR_RECORD, 1);
    writeBaseline("");
    writeScript(
      "bin/broken-normalizer",
      "#!/usr/bin/env bash\necho garbage >&2\nexit 3\n",
    );
    const result = runBaseline({
      binDir,
      env: { NORMALIZE_MTC_CMD: path.join(sandbox, "bin/broken-normalizer") },
    });
    expect(result.status).toBe(1);
    expect(result.stderr).toContain("normalizer broken, not a clean run");
  });

  it("refuses to write a baseline when --count mismatches the raw record count", () => {
    const binDir = writeMtcStub(ERROR_RECORD, 1);
    writeBaseline("");
    writeScript(
      "bin/mismatched-normalizer",
      `#!/usr/bin/env bash
if [[ " $* " == *" --count "* ]]; then
  echo "5 3"
else
  printf '%s\\n' '${ERROR_FINGERPRINT}'
fi
`,
    );
    const result = runBaseline({
      binDir,
      env: {
        NORMALIZE_MTC_CMD: path.join(sandbox, "bin/mismatched-normalizer"),
      },
    });
    expect(result.status).toBe(1);
    expect(result.stderr).toContain("normalizer gap, not a clean run");
  });
});
