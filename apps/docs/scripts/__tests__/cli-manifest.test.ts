import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

import { buildManifest } from "../../../../packages/marko-ui/src/commands/manifest.ts";
import { buildProgram } from "../../../../packages/marko-ui/src/index.ts";
import { CLI_MANIFEST } from "../../src/lib/cli-manifest.ts";

describe("apps/docs/src/lib/cli-manifest.ts", () => {
  it("is exactly what the CLI source produces (the committed file is not stale)", () => {
    const { data } = buildManifest(buildProgram());
    // The generator copies these five fields; JSON round-trip drops `undefined`
    // the way the generated file's JSON.stringify did.
    const expected = JSON.parse(
      JSON.stringify({
        cliVersion: data.cliVersion,
        commands: data.commands,
        exitCodes: data.exitCodes,
        warningCodes: data.warningCodes,
        agentWorkflow: data.agentWorkflow,
      }),
    );
    expect(CLI_MANIFEST).toEqual(expected);
  });

  it("is generated from the CLI source, never from a built dist/", () => {
    const source = readFileSync(path.resolve(import.meta.dirname, "../build-cli-manifest.ts"), "utf8");
    // Code only: the header comment explains the old dist/ behavior by name.
    const code = source.replace(/\/\*[\s\S]*?\*\//g, "").replace(/^\s*\/\/.*$/gm, "");
    expect(code).toContain("buildManifest(buildProgram())");
    expect(code).not.toMatch(/dist|execFileSync|existsSync|spawn/);
  });

  it("is deterministic: two builds of the manifest are identical", () => {
    const first = JSON.stringify(buildManifest(buildProgram()));
    const second = JSON.stringify(buildManifest(buildProgram()));
    expect(second).toBe(first);
  });
});
