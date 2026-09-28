// Unit tests for scripts/ci/behavior-coverage.ts against throwaway fixture
// behaviors.ts/mapping files, so real component behavior lists can grow
// freely without ever breaking this suite.
//
// checkExists/loadComponent are exercised through fixture files written to
// a temp dir under REPO_ROOT (dynamic import() needs a real path it can
// resolve; there's no virtual-fs mode for ESM import), and cleaned up
// after each test.
import { afterEach, describe, expect, it } from "vitest";
import { mkdtempSync, mkdirSync, writeFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { loadComponent } from "../behavior-coverage.ts";

const REPO_ROOT = dirname(dirname(dirname(dirname(fileURLToPath(import.meta.url)))));
const DEMOS_DIR = join(REPO_ROOT, "apps/docs/src/demos");
const MAPPING_DIR = join(REPO_ROOT, "packages/shadcn/tests/behavior-coverage");

const FIXTURE_NAME = "__behcov_fixture__";
const fixtureDemoDir = join(DEMOS_DIR, FIXTURE_NAME);
const fixtureMappingPath = join(MAPPING_DIR, `${FIXTURE_NAME}.ts`);

function writeBehaviors(source: string) {
  mkdirSync(fixtureDemoDir, { recursive: true });
  writeFileSync(join(fixtureDemoDir, "behaviors.ts"), source);
}

function writeMapping(source: string) {
  writeFileSync(fixtureMappingPath, source);
}

afterEach(() => {
  rmSync(fixtureDemoDir, { recursive: true, force: true });
  rmSync(fixtureMappingPath, { force: true });
});

const BEHAVIOR_TYPES_IMPORT = `import type { ComponentBehavior } from "../behavior-types.ts";`;
const MAPPING_TYPES_IMPORT = `import type { BehaviorCoverageEntry } from "./mapping-types.ts";`;

describe("behavior-coverage: covered behavior", () => {
  it("counts a behavior proven by an existing, real vitest test as covered", async () => {
    writeBehaviors(`${BEHAVIOR_TYPES_IMPORT}
export const behaviors: ComponentBehavior[] = [
  { id: "${FIXTURE_NAME}/keyboard/space-toggles", kind: "keyboard", description: "x", source: "x" },
];
`);
    writeMapping(`${MAPPING_TYPES_IMPORT}
export const coverage: BehaviorCoverageEntry[] = [
  {
    behaviorId: "${FIXTURE_NAME}/keyboard/space-toggles",
    provenBy: [{
      source: "vitest",
      file: "packages/shadcn/tests/behavior/toggle-controls.test.ts",
      title: ["switch keyboard contract (APG)", "toggles with Space and reflects aria-checked"],
    }],
  },
];
`);

    const report = await loadComponent(FIXTURE_NAME);
    expect(report.total).toBe(1);
    expect(report.covered).toBe(1);
    expect(report.uncovered).toEqual([]);
    expect(report.errors).toEqual([]);
  });
});

describe("behavior-coverage: uncovered behavior", () => {
  it("counts a behavior with no mapping entry as uncovered, no error", async () => {
    writeBehaviors(`${BEHAVIOR_TYPES_IMPORT}
export const behaviors: ComponentBehavior[] = [
  { id: "${FIXTURE_NAME}/interaction/click-toggles", kind: "interaction", description: "x", source: "x" },
];
`);
    writeMapping(`${MAPPING_TYPES_IMPORT}
export const coverage: BehaviorCoverageEntry[] = [];
`);

    const report = await loadComponent(FIXTURE_NAME);
    expect(report.total).toBe(1);
    expect(report.covered).toBe(0);
    expect(report.uncovered).toEqual([`${FIXTURE_NAME}/interaction/click-toggles`]);
    expect(report.errors).toEqual([]);
  });

  it("treats a missing mapping file as zero coverage, no error", async () => {
    writeBehaviors(`${BEHAVIOR_TYPES_IMPORT}
export const behaviors: ComponentBehavior[] = [
  { id: "${FIXTURE_NAME}/interaction/click-toggles", kind: "interaction", description: "x", source: "x" },
];
`);
    // No mapping file written at all.

    const report = await loadComponent(FIXTURE_NAME);
    expect(report.covered).toBe(0);
    expect(report.uncovered).toHaveLength(1);
    expect(report.errors).toEqual([]);
  });
});

describe("behavior-coverage: unknown behavior id", () => {
  it("errors when a mapping references a behavior id not declared in behaviors.ts", async () => {
    writeBehaviors(`${BEHAVIOR_TYPES_IMPORT}
export const behaviors: ComponentBehavior[] = [
  { id: "${FIXTURE_NAME}/interaction/real-one", kind: "interaction", description: "x", source: "x" },
];
`);
    writeMapping(`${MAPPING_TYPES_IMPORT}
export const coverage: BehaviorCoverageEntry[] = [
  {
    behaviorId: "${FIXTURE_NAME}/interaction/made-up",
    provenBy: [{
      source: "vitest",
      file: "packages/shadcn/tests/behavior/toggle-controls.test.ts",
      title: ["switch keyboard contract (APG)", "toggles with Space and reflects aria-checked"],
    }],
  },
];
`);

    const report = await loadComponent(FIXTURE_NAME);
    expect(report.errors.some((e) => e.includes("unknown behavior id"))).toBe(true);
    expect(report.errors.some((e) => e.includes(`${FIXTURE_NAME}/interaction/made-up`))).toBe(true);
  });

  it("errors when a vitest proving check's title no longer exists", async () => {
    writeBehaviors(`${BEHAVIOR_TYPES_IMPORT}
export const behaviors: ComponentBehavior[] = [
  { id: "${FIXTURE_NAME}/keyboard/renamed", kind: "keyboard", description: "x", source: "x" },
];
`);
    writeMapping(`${MAPPING_TYPES_IMPORT}
export const coverage: BehaviorCoverageEntry[] = [
  {
    behaviorId: "${FIXTURE_NAME}/keyboard/renamed",
    provenBy: [{
      source: "vitest",
      file: "packages/shadcn/tests/behavior/toggle-controls.test.ts",
      title: ["switch keyboard contract (APG)", "this test title does not exist"],
    }],
  },
];
`);

    const report = await loadComponent(FIXTURE_NAME);
    expect(report.covered).toBe(0);
    expect(report.uncovered).toEqual([`${FIXTURE_NAME}/keyboard/renamed`]);
    expect(report.errors.some((e) => e.includes("no test titled"))).toBe(true);
  });
});

describe("behavior-coverage: duplicate ids", () => {
  it("errors on a duplicate behavior id within one behaviors.ts", async () => {
    writeBehaviors(`${BEHAVIOR_TYPES_IMPORT}
export const behaviors: ComponentBehavior[] = [
  { id: "${FIXTURE_NAME}/interaction/dupe", kind: "interaction", description: "a", source: "x" },
  { id: "${FIXTURE_NAME}/interaction/dupe", kind: "interaction", description: "b", source: "x" },
];
`);
    writeMapping(`${MAPPING_TYPES_IMPORT}
export const coverage: BehaviorCoverageEntry[] = [];
`);

    const report = await loadComponent(FIXTURE_NAME);
    expect(report.errors.some((e) => e.includes("duplicate behavior id"))).toBe(true);
  });

  it("errors on a duplicate mapping entry for the same behavior id", async () => {
    writeBehaviors(`${BEHAVIOR_TYPES_IMPORT}
export const behaviors: ComponentBehavior[] = [
  { id: "${FIXTURE_NAME}/keyboard/space-toggles", kind: "keyboard", description: "x", source: "x" },
];
`);
    writeMapping(`${MAPPING_TYPES_IMPORT}
const CHECK = {
  source: "vitest" as const,
  file: "packages/shadcn/tests/behavior/toggle-controls.test.ts",
  title: ["switch keyboard contract (APG)", "toggles with Space and reflects aria-checked"],
};
export const coverage: BehaviorCoverageEntry[] = [
  { behaviorId: "${FIXTURE_NAME}/keyboard/space-toggles", provenBy: [CHECK] },
  { behaviorId: "${FIXTURE_NAME}/keyboard/space-toggles", provenBy: [CHECK] },
];
`);

    const report = await loadComponent(FIXTURE_NAME);
    expect(report.errors.some((e) => e.includes("duplicate mapping entry"))).toBe(true);
  });
});

describe("behavior-coverage: id prefix hygiene", () => {
  it("errors when a behavior id doesn't start with its own component name", async () => {
    writeBehaviors(`${BEHAVIOR_TYPES_IMPORT}
export const behaviors: ComponentBehavior[] = [
  { id: "wrong-component/interaction/x", kind: "interaction", description: "x", source: "x" },
];
`);
    writeMapping(`${MAPPING_TYPES_IMPORT}
export const coverage: BehaviorCoverageEntry[] = [];
`);

    const report = await loadComponent(FIXTURE_NAME);
    expect(report.errors.some((e) => e.includes("does not start with"))).toBe(true);
  });
});
