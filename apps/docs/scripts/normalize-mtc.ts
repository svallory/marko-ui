// Normalizes marko-type-check's condensed output into a stable fingerprint:
// one line per error, `path|TScode|first 80 chars of message`, deduped with
// a trailing `xN` count. Line numbers are dropped deliberately — a demo
// edit that shifts existing errors up/down must not look like new+removed
// errors to the baseline diff in check.sh. Sorted for a stable diff.
//
// @marko/type-check's reportDiagnostic emits 3 header shapes:
//   1. `path:line:col - error TSnnnn` (diag.start defined)
//   2. `path - error TSnnnn` (whole-file diagnostic, e.g. a Marko parse failure)
//   3. bare `error TSnnnn` message, no file at all
// All 3 must fingerprint — silently skipping 2/3 let a genuine parse error
// (TS1005 etc.) through the gate with exit 0 and "no new errors" (found
// 2026-09-15). A line containing ` - error TS` that matches none of the
// 3 shapes is a normalizer bug, not a diagnostic to ignore: exit nonzero.
//
// Usage: bun scripts/normalize-mtc.ts < raw-condensed-output > fingerprint.txt

const HEADER_RE = /^(?:(\S.*?)(?::(\d+):(\d+))? - )?error (TS\d+)$/;

const input = await Bun.stdin.text();
const lines = input.split("\n");

const counts = new Map<string, number>();

let i = 0;
while (i < lines.length) {
  const header = lines[i];
  if (!header || header === "") {
    i++;
    continue;
  }
  if (!header.includes(" error TS") && !header.startsWith("error TS")) {
    i++;
    continue;
  }
  const match = header.match(HEADER_RE);
  if (!match) {
    console.error(
      `normalize-mtc: unrecognized diagnostic header shape, refusing to silently drop it:\n  ${header}`,
    );
    process.exit(1);
  }
  const [, path, , , code] = match;
  i++;
  const messageParts: string[] = [];
  while (i < lines.length && lines[i] !== "") {
    messageParts.push(lines[i]!);
    i++;
  }
  const message = messageParts.join(" ").replace(/\s+/g, " ").trim();
  const messageHead = message.slice(0, 80);
  const key = `${path ?? "(no file)"}|${code}|${messageHead}`;
  counts.set(key, (counts.get(key) ?? 0) + 1);
}

const fingerprint = [...counts.entries()]
  .sort(([a], [b]) => a.localeCompare(b))
  .map(([key, count]) => (count > 1 ? `${key} x${count}` : key))
  .join("\n");

process.stdout.write(fingerprint ? fingerprint + "\n" : "");
