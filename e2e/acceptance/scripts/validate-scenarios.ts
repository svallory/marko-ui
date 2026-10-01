#!/usr/bin/env bun
// Validates e2e/acceptance/scenarios.yaml against scenarios.schema.json, plus
// the cross-file rules a JSON Schema cannot express (unique ids, resolvable
// flow/fixture/bodies references, every flow reachable, known tag keys).
//
//   bun run check:acceptance
//
// The checks themselves live in lib/scenario-doc.ts, because the vitest suite
// loads the document through exactly the same code: a scenario that validates
// here is the scenario the runner executes, and a broken document fails the
// suite at load time rather than halfway through a run. This file is the CLI
// wrapper — it prints the report and picks an exit code.
//
// Deliberately dependency-light: it must stay runnable before the vitest runner
// exists, and after any edit to the YAML that a reviewer can re-run in one
// command.

import {
  loadScenarioDoc,
  ScenarioDocError,
  type ScenariosDoc,
} from "../lib/scenario-doc"

function fail(message: string): never {
  console.error(`\n✗ ${message}`)
  process.exit(1)
}

let doc: ScenariosDoc
try {
  doc = loadScenarioDoc()
} catch (error) {
  if (error instanceof ScenarioDocError) fail(error.message)
  throw error
}

// ---------------------------------------------------------------------------
// Report
// ---------------------------------------------------------------------------
function tally(values: (string | undefined)[]): Map<string, number> {
  const counts = new Map<string, number>()
  for (const value of values) {
    if (value === undefined) continue
    counts.set(value, (counts.get(value) ?? 0) + 1)
  }
  return counts
}
const show = (counts: Map<string, number>): string =>
  [...counts].map(([key, value]) => `${key}=${value}`).join(" ")

const kinds = tally(doc.scenarios.map((scenario) => scenario.kind))
const speeds = tally(doc.scenarios.map((scenario) => scenario.speed))
const tags = doc.scenarios.flatMap((scenario) => scenario.tags)
const prefix = (key: string): string[] =>
  tags.filter((tag) => tag.startsWith(`${key}:`))
const unknown = doc.scenarios
  .filter((scenario) => scenario.status === "unknown-expectation")
  .map((scenario) => scenario.id)

console.log("✓ scenarios.yaml validates against scenarios.schema.json")
console.log(
  `  ${doc.scenarios.length} scenarios · ` +
    `${doc.scenarios.reduce((sum, scenario) => sum + scenario.steps.length, 0)} steps · ` +
    `${Object.keys(doc.flows).length} flows · ${Object.keys(doc.fixtures).length} fixtures`,
)
console.log(`  by kind: ${show(kinds)}`)
console.log(`  by os:   ${show(tally(prefix("os")))}`)
console.log(`  by pm:   ${show(tally(prefix("pm")))}`)
console.log(`  by speed: ${show(speeds)}`)
if (unknown.length) {
  console.log(
    `  status:unknown-expectation — ${unknown.length}: ${unknown.join(", ")}`,
  )
}
