import { describe, expect, it } from "vitest";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import path from "node:path";

const SCRIPT_PATH = path.join(
  path.dirname(fileURLToPath(import.meta.url)),
  "..",
  "normalize-mtc.ts",
);

function run(input: string, args: string[] = []) {
  const result = spawnSync("bun", [SCRIPT_PATH, ...args], {
    input,
    encoding: "utf8",
  });
  if (result.status !== 0) {
    throw new Error(
      `normalize-mtc.ts exited ${result.status}: ${result.stderr}`,
    );
  }
  return result.stdout;
}

describe("normalize-mtc.ts", () => {
  it("fingerprints a shape-1 error with line:col", () => {
    const out = run(
      "src/routes/foo.marko:12:3 - error TS2322\nType 'string' is not assignable to type 'number'.\n",
    );
    expect(out).toBe(
      "src/routes/foo.marko|TS2322|Type 'string' is not assignable to type 'number'.\n",
    );
  });

  it("fingerprints a whole-file diagnostic with no line:col", () => {
    const out = run(
      "src/routes/foo.marko - error TS6307\nFile is not listed within the file list of project.\n",
    );
    expect(out).toBe(
      "src/routes/foo.marko|TS6307|File is not listed within the file list of project.\n",
    );
  });

  it("handles a path containing ' - ' without breaking the header match", () => {
    const out = run(
      "src/routes/a - b/foo.marko:1:1 - error TS2322\nmessage here\n",
    );
    expect(out).toBe("src/routes/a - b/foo.marko|TS2322|message here\n");
  });

  it("fingerprints a file-less diagnostic as (no file)", () => {
    const out = run("Cannot read file 'tsconfig.json'.\n");
    expect(out).toBe(
      "(no file)|TS0000|Cannot read file 'tsconfig.json'.\n",
    );
  });

  it("fingerprints mixed shape-1 and file-less records in one run", () => {
    const out = run(
      [
        "src/routes/foo.marko:1:1 - error TS2322\nbad type",
        "File 'tsconfig.json' not found.",
      ].join("\n\n"),
    );
    expect(out).toBe(
      [
        "(no file)|TS0000|File 'tsconfig.json' not found.",
        "src/routes/foo.marko|TS2322|bad type",
      ].join("\n") + "\n",
    );
  });

  it("counts warning/message/suggestion headers as accounted but does not fingerprint them", () => {
    const out = run(
      "src/routes/foo.marko:1:1 - warning TS9999\nsome warning\n",
    );
    expect(out).toBe("");

    const counts = run(
      "src/routes/foo.marko:1:1 - warning TS9999\nsome warning\n",
      ["--count"],
    );
    expect(counts).toBe("1 1\n");
  });

  it("dedups identical fingerprints with a trailing xN", () => {
    const record = "src/routes/foo.marko:1:1 - error TS2322\nsame message";
    const out = run([record, record, record].join("\n\n"));
    expect(out).toBe(
      "src/routes/foo.marko|TS2322|same message x3\n",
    );
  });

  it("truncates the message to 80 characters", () => {
    const longMessage = "x".repeat(200);
    const out = run(
      `src/routes/foo.marko:1:1 - error TS2322\n${longMessage}\n`,
    );
    const [key] = out.trim().split("\n");
    const messagePart = key!.split("|")[2];
    expect(messagePart).toHaveLength(80);
    expect(messagePart).toBe("x".repeat(80));
  });

  it("returns empty output and 0 0 for empty input", () => {
    expect(run("")).toBe("");
    expect(run("", ["--count"])).toBe("0 0\n");
  });

  it("does not count a trailing blank line as an extra record", () => {
    const out = run(
      "src/routes/foo.marko:1:1 - error TS2322\nmessage\n\n",
      ["--count"],
    );
    expect(out).toBe("1 1\n");
  });

  it("does not treat 'error TS' text inside a multi-line message body as a new header", () => {
    const out = run(
      "src/routes/foo.marko:1:1 - error TS2322\nfirst line\nsome text mentioning error TS9999 inline\nlast line\n",
    );
    expect(out).toBe(
      "src/routes/foo.marko|TS2322|first line some text mentioning error TS9999 inline last line\n",
    );
  });

  it("--count reports raw and accounted record counts matching the fingerprint run", () => {
    const input = [
      "src/routes/foo.marko:1:1 - error TS2322\nbad type",
      "src/routes/bar.marko:2:2 - warning TS9999\nsome warning",
      "File 'tsconfig.json' not found.",
    ].join("\n\n");

    const counts = run(input, ["--count"]);
    expect(counts).toBe("3 3\n");

    const fingerprint = run(input);
    const fingerprintLineCount = fingerprint
      .split("\n")
      .filter((l) => l !== "").length;
    // 2 errors fingerprinted (the warning is accounted but not fingerprinted)
    expect(fingerprintLineCount).toBe(2);
  });

  // Bun injects NDJSON control lines into a piped child's stdout when it
  // detects an AI-agent environment. They are not diagnostics, but they are
  // not blank either, so they used to survive record splitting and get
  // fingerprinted by the file-less fallback as a phantom
  // `(no file)|TS0000|{"type":"message",...}` — failing the gate on a tree
  // with zero real type errors, for every agent running `bun run check`.
  describe("Bun AI-agent NDJSON control lines", () => {
    // The exact line observed in this repo's own tooling output.
    const BANNER =
      '{"type":"message","message":"Detected an AI agent environment, printing as NDJSON. Trace logs are written to stderr, while user-facing logs are written to stdout."}';

    it("produces no fingerprint for a banner-only run", () => {
      expect(run(`${BANNER}\n`)).toBe("");
    });

    it("counts a stripped banner as accounted, keeping --count balanced", () => {
      expect(run(`${BANNER}\n`, ["--count"])).toBe("1 1\n");
    });

    it("strips the banner without swallowing a real error on the next line", () => {
      const input = `${BANNER}\nsrc/routes/foo.marko:3:5 - error TS2322\nType 'string' is not assignable to type 'number'.\n`;
      expect(run(input)).toBe(
        "src/routes/foo.marko|TS2322|Type 'string' is not assignable to type 'number'.\n",
      );
      expect(run(input, ["--count"])).toBe("2 2\n");
    });

    it("leaves a file-less diagnostic that merely looks JSON-ish alone", () => {
      // Scoped narrowly on purpose: only a parseable object with
      // `type: "message"` is stripped, so real diagnostics never vanish.
      const notControl = `{"type":"error","message":"this is not Bun's banner"}`;
      const out = run(`${notControl}\n`);
      expect(out).toBe(`(no file)|TS0000|${notControl.slice(0, 80)}\n`);
      expect(run(`${notControl}\n`, ["--count"])).toBe("1 1\n");
    });

    it("does not strip a diagnostic message containing a brace", () => {
      const out = run(
        "src/routes/foo.marko:1:1 - error TS2353\nObject literal may only specify known properties, and '{ x }' is not expected.\n",
      );
      expect(out).toBe(
        "src/routes/foo.marko|TS2353|Object literal may only specify known properties, and '{ x }' is not expected.\n",
      );
    });
  });
});
