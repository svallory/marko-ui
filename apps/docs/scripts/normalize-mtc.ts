// Normalizes marko-type-check's condensed output into a stable fingerprint:
// one line per error, `path|TScode|first 80 chars of message`, deduped with
// a trailing `xN` count. Line numbers are dropped deliberately — a demo
// edit that shifts existing errors up/down must not look like new+removed
// errors to the baseline diff in check.sh. Sorted for a stable diff.
//
// Usage: bun scripts/normalize-mtc.ts < raw-condensed-output > fingerprint.txt

const input = await Bun.stdin.text();
const lines = input.split("\n");

const counts = new Map<string, number>();

let i = 0;
while (i < lines.length) {
  const header = lines[i];
  const match = header?.match(/^(\S.*):(\d+):(\d+) - error (TS\d+)$/);
  if (!match) {
    i++;
    continue;
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
  const key = `${path}|${code}|${messageHead}`;
  counts.set(key, (counts.get(key) ?? 0) + 1);
}

const fingerprint = [...counts.entries()]
  .sort(([a], [b]) => a.localeCompare(b))
  .map(([key, count]) => (count > 1 ? `${key} x${count}` : key))
  .join("\n");

process.stdout.write(fingerprint ? fingerprint + "\n" : "");
