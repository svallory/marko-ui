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

const TAG_KEYS = new Set(["os", "pm", "kind", "speed", "status"]);
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
  write?: { path?: string; body?: string };
  run?: { body?: string };
}
interface Step {
  use?: string;
  command?: string;
  expect?: Record<string, unknown>;
  notes?: string;
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
  fixtures: Record<string, Setup>;
  flows: Record<string, Step[]>;
  scenarios: Scenario[];
}

function fail(message: string): never {
  console.error(`\n✗ ${message}`);
  process.exit(1);
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
  for (const tag of scenario.tags ?? []) {
    const key = tag.split(":")[0] ?? "";
    if (!TAG_KEYS.has(key))
      problems.push(`${scenario.id}: unknown tag key in "${tag}"`);
  }
}

// Every `use:` resolves, every flow is used at least once, and every
// command step asserts something.
const usedFlows = new Set<string>();
function walkSteps(steps: Step[] | undefined, where: string): void {
  for (const [index, step] of (steps ?? []).entries()) {
    const at = `${where}[${index}]`;
    if (step.use) {
      if (!doc.flows[step.use]) {
        problems.push(`${at}: use: "${step.use}" is not a declared flow`);
      }
      usedFlows.add(step.use);
      if (step.command)
        problems.push(`${at}: a step is either use: or command:, not both`);
      continue;
    }
    if (!step.expect && !step.notes) {
      problems.push(
        `${at}: a command step with neither expect nor notes asserts nothing`,
      );
    }
  }
}

for (const [name, steps] of Object.entries(doc.flows))
  walkSteps(steps, `flows.${name}`);
for (const scenario of doc.scenarios) walkSteps(scenario.steps, scenario.id);

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

console.log("✓ scenarios.yaml validates against scenarios.schema.json");
console.log(
  `  ${doc.scenarios.length} scenarios · ` +
    `${doc.scenarios.reduce((sum, scenario) => sum + scenario.steps.length, 0)} steps · ` +
    `${Object.keys(doc.flows).length} flows · ${Object.keys(doc.fixtures).length} fixtures`,
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
