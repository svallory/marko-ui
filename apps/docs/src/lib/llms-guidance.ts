/**
 * The "how to work with marko-ui" section of /llms.txt: the part an AI agent is
 * meant to act on.
 *
 * Pure text, no imports, on purpose: the CLI's own guard test
 * (packages/marko-ui/src/commands/agents.test.ts) reads this module and checks
 * every `marko-ui <command> [flags]` span in it against the live command
 * surface, exactly as it does for skills/marko-ui/SKILL.md and the generated
 * AGENTS.md section. A command named here that the CLI does not have fails
 * that test, so keep every command in a backtick span of its own.
 *
 * The three mistakes are SKILL.md's pitfalls 1-3 (and the `Input` rule), not
 * new advice: change them there first.
 */
export const LLMS_GUIDANCE = `## How to work with marko-ui

If you can run commands, use the CLI (\`bunx marko-ui\`, or the project's runner) instead of this site: it is smaller and never prompts without a TTY.

- Find a component: \`marko-ui search -q <words>\`; \`marko-ui docs --list\` prints every component with its description (the same index as below). Do not guess names.
- Learn its API: \`marko-ui docs <name>\`. Read it BEFORE writing that component's markup. Lean by default; \`--examples\` prints every example, \`--example <id>\` one.
- Install (copy distribution): \`marko-ui add <name> -y --json\`. In \`files[].status\`, \`created\` and \`updated\` mean this run wrote the file; \`unchanged\` and \`skipped\` mean it wrote nothing (\`skipped\`: the file differs and was left alone).
- Dependencies and files: \`marko-ui show <name> --deps\`, \`marko-ui show <name> --files\`.
- Project state: \`marko-ui status --json\`. After changes run \`marko-ui doctor --json\`: exit 3 means broken, and each failed check carries a \`fix\`.
- Exact flags: \`marko-ui manifest <command>\`.
- No shell: fetch \`/docs/components/<name>.md\` (every example), never the HTML page.

Pass \`--json\` and parse stdout: one minified document \`{ "$type", "version", "ok", "data" }\`. Branch on \`$type\`. A failure is \`{ "$type": "marko-ui/error", "ok": false, "error": { "code", "message", "suggestion", "details" } }\`: branch on \`error.code\`, never the message. stderr carries problems, never data.

Skills (\`marko-ui agents sync\` installs them): \`marko-ui\` (this workflow and its pitfalls), \`marko6\` (Marko 6 syntax: load before writing any .marko file), \`marko-run\` (routing).

Distribution: read \`distribution\` in components.json. \`copy\` (the default when absent): components are project files under the \`ui\` alias; edit them. \`import\`: components come from \`@marko-ui/shadcn\`; override \`mu-*\` classes in your own CSS. No components.json: run \`marko-ui init -y --json\` (non-interactive; defaults for every choice).

Mistakes agents make most:
1. Controlled props with no handler. \`open=\`, \`value=\` or \`checked=\` without \`openChange\`, \`valueChange\` or \`checkedChange\` (or the \`:=\` bind) freezes the component; use \`defaultOpen=\`, \`defaultValue=\`, \`defaultChecked=\` for an initial value.
2. Boolean \`aria-*\` and \`data-*\` attributes. Marko renders \`true\` as a bare attribute; wrap the value in \`String(...)\`.
3. Zag services or \`api\` objects in state or across a tag boundary. They cannot be serialized; pass plain data or a closure (\`parentApi=() => api()\`).
Also: never import a component as \`Input\` (it shadows Marko's props type); use \`TextInput\`.
`;
