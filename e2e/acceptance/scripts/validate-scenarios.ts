#!/usr/bin/env bun
// Validates e2e/acceptance/scenarios.yaml against scenarios.schema.json, plus
// the cross-file rules a JSON Schema cannot express (unique ids, resolvable
// flow/fixture/bodies references, every flow reachable, known tag keys).
//
//   bun run check:acceptance
//
// Deliberately dependency-light: it must stay runnable before the vitest runner
// exists, and after any edit to the YAML that a reviewer can re-run in one
// command. The schema is the contract for the document's SHAPE; the checks
// below are the contract for its CROSS-REFERENCES.

import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import Ajv2020 from "ajv/dist/2020";

const HERE = dirname(import.meta.dir);
const YAML_PATH = join(HERE, "scenarios.yaml");
const SCHEMA_PATH = join(HERE, "scenarios.schema.json");

const TAG_KEYS = new Set(["os", "pm", "kind", "speed", "status", "needs"]);

/**
 * The closed set of `$VAR`s a scenario may interpolate. Kept in lockstep with
 * the `args` description in scenarios.schema.json; a scenario referencing
 * anything else is a bug the runner would otherwise turn into an empty string.
 */
const INTERPOLATED_VARS = new Set([
  "WORKSPACE",
  "APP",
  "PM",
  "REGISTRY_URL",
  "ACCEPTANCE_MIRROR_PORT",
]);
const SCENARIO_KINDS = new Set([
  "core",
  "project-kind",
  "existing-project",
  "config-shape",
  "package-manager",
  "monorepo",
  "post-setup",
  "skills",
  "environment",
  "registry",
]);

// ---------------------------------------------------------------------------
// The slice of the document this script reads. Deliberately loose — the JSON
// Schema owns the shape; these types only exist so the checks below compile.
// ---------------------------------------------------------------------------
interface PreStep {
  label?: string;
  body?: string;
  helper?: string;
  args?: string[];
  cwd?: string;
  write?: { path?: string; body?: string };
  run?: { body?: string };
}
interface Step {
  use?: string;
  command?: string;
  helper?: string;
  args?: string[];
  cwd?: string;
  snapshot?: string[];
  expect?: Record<string, unknown>;
  notes?: string;
}
/** A named program the runner executes; see the `helpers` section of the file. */
interface Helper {
  description: string;
  language: "node" | "posix-shell";
  source: string;
  cwd?: string;
}
interface Setup {
  fixture?: string;
  noScaffold?: boolean;
  scaffold?: { tool?: string; args?: string[]; dir?: string };
  pre?: PreStep[];
  post?: PreStep[];
}
interface Scenario {
  id: string;
  title: string;
  kind: string;
  tags: string[];
  status?: string;
  question?: string;
  speed?: string;
  setup: Setup;
  steps: Step[];
  covers?: string[];
  notes?: string;
}
interface ScenariosDoc {
  version: number;
  defaults: { cliTarget: string; registryUrl: string; timeoutSeconds: number };
  bodies?: Record<string, string>;
  helpers?: Record<string, Helper>;
  fixtures: Record<string, Setup>;
  flows: Record<string, Step[]>;
  scenarios: Scenario[];
}

function fail(message: string): never {
  console.error(`\n✗ ${message}`);
  process.exit(1);
}

/**
 * Duplicate mapping keys are a SILENT data-loss bug: Bun.YAML keeps the last
 * one and discards the rest, so an `expect:` block carrying two
 * `stdoutContains:` keys passes on half its assertions without anyone noticing.
 * Three such blocks existed in this file. Catch them from the source text
 * before parsing — merging two values must be a deliberate edit, never an
 * accident of parser ordering.
 *
 * The check is indentation-based, and a sequence item is its own mapping scope:
 * the `- ` counts as one column, so the keys under `- name: foo` sit one level
 * deeper than the dash and are siblings of `name`, not of the key that owns
 * the list. Without that, every item's keys collide with each other.
 */
function findDuplicateKeys(path: string): string[] {
  const found: string[] = [];
  // Stack of open scopes, innermost last: { indent, keys }.
  const stack: { indent: number; keys: Map<string, number> }[] = [];
  const KEY = /^(\s*)([A-Za-z_][A-Za-z0-9_-]*):(\s|$)/;
  const ITEM = /^(\s*)-\s/;
  const popTo = (indent: number): void => {
    while (stack.length) {
      const top = stack[stack.length - 1];
      if (top === undefined || top.indent < indent) break;
      stack.pop();
    }
  };
  for (const [index, raw] of readFileSync(path, "utf8").split("\n").entries()) {
    const line = raw.replace(/\s+$/, "");
    if (line.trim() === "" || line.trimStart().startsWith("#")) continue;
    const item = ITEM.exec(line);
    if (item) {
      const dash = item[1]?.length ?? 0;
      popTo(dash);
      // The dash occupies one column, so the item's own keys are at dash + 1.
      stack.push({ indent: dash + 1, keys: new Map() });
      continue;
    }
    const match = KEY.exec(line);
    const [, indentText, key] = match ?? [];
    if (indentText === undefined || key === undefined) continue;
    const indent = indentText.length;
    // A sibling key starts a new entry in the level strictly above it.
    popTo(indent + 1);
    const parent = stack[stack.length - 1];
    if (parent) {
      const first = parent.keys.get(key);
      if (first !== undefined) {
        found.push(
          `line ${index + 1}: duplicate key "${key}" (first on line ${first}) — the earlier value is silently dropped; merge them into one sequence`,
        );
      } else {
        parent.keys.set(key, index + 1);
      }
    }
    stack.push({ indent, keys: new Map([[key, index + 1]]) });
  }
  return found;
}

const duplicateKeys = findDuplicateKeys(YAML_PATH);
if (duplicateKeys.length) {
  fail(
    `scenarios.yaml has duplicate mapping keys (the earlier value is silently dropped):\n  ${duplicateKeys.join("\n  ")}`,
  );
}

function parseYaml(path: string): ScenariosDoc {
  try {
    // Bun's own YAML parser: no dependency, and it is what the runner will use.
    return Bun.YAML.parse(readFileSync(path, "utf8")) as ScenariosDoc;
  } catch (error) {
    return fail(
      `${path} is not parseable YAML:\n  ${(error as Error).message}`,
    );
  }
}

function parseJson(path: string): Record<string, unknown> {
  try {
    return JSON.parse(readFileSync(path, "utf8")) as Record<string, unknown>;
  } catch (error) {
    return fail(
      `${path} is not parseable JSON:\n  ${(error as Error).message}`,
    );
  }
}

// ---------------------------------------------------------------------------
// Shape
// ---------------------------------------------------------------------------
const doc = parseYaml(YAML_PATH);

// ajv-formats / ajv-errors are deliberately not dependencies: a schema keyword
// ajv does not know (`format: uri`, `format: regex`) is then ignored rather
// than enforced, and a failing `oneOf` still names the offending leaf property,
// which is the case that actually matters when someone typos a field name.
const ajv = new Ajv2020({
  allErrors: true,
  strict: false,
  allowUnionTypes: true,
});
const validate = ajv.compile(parseJson(SCHEMA_PATH));

if (!validate(doc)) {
  const all = validate.errors ?? [];
  const shown = all.slice(0, 60);
  const lines = shown.map((error) => {
    const where = error.instancePath === "" ? "(root)" : error.instancePath;
    const extra =
      error.keyword === "additionalProperties"
        ? ` (${String((error.params as Record<string, unknown>).additionalProperty)})`
        : "";
    return `  ${where}${extra}: ${error.message ?? ""}`;
  });
  fail(
    `scenarios.yaml does not satisfy scenarios.schema.json (${all.length} error(s)):\n${lines.join("\n")}`,
  );
}

// ---------------------------------------------------------------------------
// Cross-references
// ---------------------------------------------------------------------------
const problems: string[] = [];

const ids = new Set<string>();
for (const scenario of doc.scenarios) {
  if (ids.has(scenario.id))
    problems.push(`duplicate scenario id: ${scenario.id}`);
  ids.add(scenario.id);

  if (!SCENARIO_KINDS.has(scenario.kind)) {
    problems.push(`${scenario.id}: unknown kind "${scenario.kind}"`);
  }
  if (scenario.status === "unknown-expectation" && !scenario.question) {
    problems.push(
      `${scenario.id}: status unknown-expectation without a question`,
    );
  }
  // A gated scenario the runner cannot gate is worse than an ungated one: it
  // either fails for an unlanded guard or, if the tag is missing, silently
  // becomes a hard expectation for behaviour that does not exist yet.
  if (
    scenario.status === "needs-cli-guards" &&
    !scenario.tags.some((tag) => tag.startsWith("needs:"))
  ) {
    problems.push(
      `${scenario.id}: status needs-cli-guards without a needs:<gate> tag, so the runner has nothing to skip it for`,
    );
  }
  for (const tag of scenario.tags ?? []) {
    const key = tag.split(":")[0] ?? "";
    if (!TAG_KEYS.has(key))
      problems.push(`${scenario.id}: unknown tag key in "${tag}"`);
  }
}

// Every `use:` resolves, every flow is used at least once, every helper is
// used at least once, every `$VAR` is one the runner actually defines, and
// every command step asserts something.
const usedFlows = new Set<string>();
const usedHelpers = new Set<string>();
const snapshotOrder: { key: string; where: string; line: number }[] = [];
const snapshotRefs: { key: string; where: string; line: number }[] = [];
function walkSteps(steps: Step[] | undefined, where: string): void {
  for (const [index, step] of (steps ?? []).entries()) {
    const at = `${where}[${index}]`;
    if (step.use) {
      if (!doc.flows[step.use]) {
        problems.push(`${at}: use: "${step.use}" is not a declared flow`);
      }
      usedFlows.add(step.use);
      if (step.command) {
        problems.push(`${at}: a step is either use: or command:, not both`);
      }
      continue;
    }
    // The schema already requires `expect` on every command step. Repeating it
    // here buys a located, named error — "this step asserts nothing" is the
    // thing a scenario author needs to hear, not "required property expect".
    if (!step.expect) {
      problems.push(`${at}: a command step with no expect asserts nothing`);
    }
    if (step.command === "@helper" && !step.helper) {
      problems.push(`${at}: command @helper without a helper name`);
    }
    if (step.helper) {
      if (!doc.helpers?.[step.helper]) {
        problems.push(`${at}: unknown helper "${step.helper}"`);
      } else {
        usedHelpers.add(step.helper);
      }
    }
    // `snapshot:` records a path a LATER expect.unchanged/changed refers to.
    // Recording the ORDER here is what lets the pairing check below insist the
    // snapshot came first.
    for (const path of step.snapshot ?? []) {
      snapshotOrder.push({ key: `${where}:${path}`, where: at, line: index });
    }
    const expect = step.expect as
      { unchanged?: string[]; changed?: string[] } | undefined;
    for (const path of expect?.unchanged ?? []) {
      snapshotRefs.push({ key: `${where}:${path}`, where: at, line: index });
    }
    for (const path of expect?.changed ?? []) {
      snapshotRefs.push({ key: `${where}:${path}`, where: at, line: index });
    }
    for (const arg of step.args ?? []) {
      // `$$` is an escaped literal `$`; every other `$NAME` must be in the
      // closed set, so the runner never has to decide what an undefined one is.
      const vars = arg.matchAll(/(?<!\$)\$(?!\$)([A-Za-z_][A-Za-z0-9_]*)/g);
      for (const match of vars) {
        const name = match[1];
        if (name && !INTERPOLATED_VARS.has(name)) {
          problems.push(
            `${at}: args interpolate "$${name}", which is not in the closed set (${[...INTERPOLATED_VARS].join(", ")})`,
          );
        }
      }
    }
  }
}

for (const [name, steps] of Object.entries(doc.flows))
  walkSteps(steps, `flows.${name}`);
for (const scenario of doc.scenarios) walkSteps(scenario.steps, scenario.id);

// Every expect.unchanged/changed must name a path an EARLIER step snapshotted.
for (const ref of snapshotRefs) {
  const snap = snapshotOrder.find((entry) => entry.key === ref.key);
  if (!snap) {
    problems.push(
      `${ref.where}: expect.unchanged/changed names a path nothing snapshotted — add a snapshot: to the step that establishes it`,
    );
  } else if (snap.line > ref.line) {
    problems.push(
      `${ref.where}: expect.unchanged/changed refers to a path snapshotted LATER (${snap.where}) — the snapshot has to establish the state first`,
    );
  }
}

for (const name of Object.keys(doc.flows)) {
  if (!usedFlows.has(name))
    problems.push(`flows.${name} is declared but never used`);
}

for (const [name, setup] of Object.entries(doc.fixtures)) {
  if (setup.fixture && !doc.fixtures[setup.fixture]) {
    problems.push(
      `fixtures.${name}: references unknown fixture "${setup.fixture}"`,
    );
  }
}

function walkPre(steps: PreStep[] | undefined, where: string): void {
  for (const [index, step] of (steps ?? []).entries()) {
    const body = step.write?.body ?? step.run?.body;
    if (body && !doc.bodies?.[body]) {
      problems.push(`${where}[${index}]: unknown body "${body}"`);
    }
  }
}
for (const [name, setup] of Object.entries(doc.fixtures)) {
  walkPre(setup.pre, `fixtures.${name}.pre`);
  walkPre(setup.post, `fixtures.${name}.post`);
}
for (const scenario of doc.scenarios) {
  walkPre(scenario.setup?.pre, `${scenario.id}.setup.pre`);
  walkPre(scenario.setup?.post, `${scenario.id}.setup.post`);
}

if (problems.length) {
  fail(
    `scenarios.yaml is schema-valid but internally inconsistent:\n  ${problems.join("\n  ")}`,
  );
}

// ---------------------------------------------------------------------------
// Report
// ---------------------------------------------------------------------------
function tally(values: (string | undefined)[]): Map<string, number> {
  const counts = new Map<string, number>();
  for (const value of values) {
    if (value === undefined) continue;
    counts.set(value, (counts.get(value) ?? 0) + 1);
  }
  return counts;
}
const show = (counts: Map<string, number>): string =>
  [...counts].map(([key, value]) => `${key}=${value}`).join(" ");

const kinds = tally(doc.scenarios.map((scenario) => scenario.kind));
const speeds = tally(doc.scenarios.map((scenario) => scenario.speed));
const tags = doc.scenarios.flatMap((scenario) => scenario.tags);
const prefix = (key: string): string[] =>
  tags.filter((tag) => tag.startsWith(`${key}:`));
const unknown = doc.scenarios
  .filter((scenario) => scenario.status === "unknown-expectation")
  .map((scenario) => scenario.id);
const gated = doc.scenarios
  .filter((scenario) => scenario.status === "needs-cli-guards")
  .map(
    (scenario) =>
      `${scenario.id} (needs:${scenario.tags.find((t) => t.startsWith("needs:"))?.split(":")[1] ?? "?"})`,
  );

console.log("✓ scenarios.yaml validates against scenarios.schema.json");
console.log(
  `  ${doc.scenarios.length} scenarios · ` +
    `${doc.scenarios.reduce((sum, scenario) => sum + scenario.steps.length, 0)} steps · ` +
    `${Object.keys(doc.flows).length} flows · ${Object.keys(doc.fixtures).length} fixtures · ` +
    `${Object.keys(doc.helpers ?? {}).length} helpers`,
);
console.log(`  by kind: ${show(kinds)}`);
console.log(`  by os:   ${show(tally(prefix("os")))}`);
console.log(`  by pm:   ${show(tally(prefix("pm")))}`);
console.log(`  by speed: ${show(speeds)}`);
if (unknown.length) {
  console.log(
    `  status:unknown-expectation — ${unknown.length}: ${unknown.join(", ")}`,
  );
}
if (gated.length) {
  console.log(
    `  status:needs-cli-guards — ${gated.length} (reported and SKIPPED, not failed, until the gate lands):\n    ${gated.join("\n    ")}`,
  );
}
