// Normalizes marko-type-check's condensed output into a stable fingerprint:
// one line per error, `path|TScode|first 80 chars of message`, deduped with
// a trailing `xN` count. Line numbers are dropped deliberately — a demo
// edit that shifts existing errors up/down must not look like new+removed
// errors to the baseline diff in check.sh. Sorted for a stable diff.
//
// @marko/type-check's `main()` prints ONE `console.log(report.out.join(...))`
// with `report.out` entries joined by a BLANK LINE — so the raw condensed
// output is a sequence of blank-line-delimited records, each produced by
// `reportDiagnostic` in exactly one of 2 shapes (verified against
// @marko/type-check's cli.js source, not guessed):
//   1. `diag.file` set: `path[:line:col] - <category> TSnnnn` header, then
//      the message on the following line(s) (`:line:col` only when
//      `diag.start` is defined — a whole-file diagnostic, e.g. some Marko
//      parse failures, omits it, giving `path - <category> TSnnnn`).
//   2. `diag.file` undefined: `report.out.push(diagMessage)` — the record
//      IS the message, verbatim, no path/`-`/category/code line at all
//      (real examples: `Cannot read file '...'.` TS5083, `File '...' not
//      found.` TS6053, `No inputs were found in config file ...` TS18003).
// An earlier version of this file called shape 2 "bare `error TSnnnn`,
// no file" and matched a `(no file)` case in the header regex — that was
// WRONG (there is no `error TSnnnn` text in a file-less record at all,
// so it could never match) and the `(no file)` branch was dead code.
// Corrected 2026-09-16 per PR #36 review.
//
// `<category>` is one of `error`/`warning`/`message`/`suggestion` per
// `coloredDiagnosticCategory`; only `error` is fingerprinted (`hasErrors`
// is likewise only set for the Error category), a non-error header is a
// recognized-and-counted-but-ignored record.
//
// Because a file-less record has no distinguishing marker to filter on,
// this normalizer cannot reliably tell a file-less ERROR from a file-less
// WARNING/MESSAGE — it fingerprints every unmatched (non-header-shaped)
// record as an error, `(no file)|TS0000|<first 80 chars>`. That is
// deliberately over-inclusive (a stray non-error file-less record would
// falsely fingerprint) rather than under-inclusive (silently dropping a
// real file-less ERROR, which is the failure mode this whole fix exists
// to close) — check.sh's record-count guard (below) is what actually
// catches a real gap; this fallback is a second line of defense.
//
// check.sh/generate-mtc-baseline.sh independently guard against this
// normalizer ever silently dropping a record: they count blank-line
// delimited records in the raw mtc output (via `--count`) and compare
// against this script's own emitted record count (also via `--count`);
// a mismatch fails loud rather than trusting the fingerprint blindly.
//
// Usage:
//   bun scripts/normalize-mtc.ts < raw-condensed-output > fingerprint.txt
//   bun scripts/normalize-mtc.ts --count < raw-condensed-output
//     prints two numbers to stdout, "<rawRecords> <accountedRecords>".
//     rawRecords is every blank-line-delimited record in the input, any
//     category. accountedRecords is every record this script explicitly
//     classified: an error's dedup weight in `counts`, plus every
//     recognized-and-skipped non-error record. The two numbers matching
//     is not a claim every record was an error worth keeping — only that
//     none vanished unclassified. check.sh compares these two numbers,
//     not the errors themselves, so a future change to this file's
//     classification logic that drops a record silently (rather than
//     recognizing-and-skipping it) fails the gate instead of coasting.

const HEADER_RE = /^(\S.*?)(?::(\d+):(\d+))? - (error|warning|message|suggestion) (TS\d+)$/;

const countMode = process.argv.includes("--count");

const input = await Bun.stdin.text();
// Records are separated by exactly one blank line (the double newline
// `report.out.join` uses); a trailing blank line from the final message's
// own newline must not be counted as an extra empty record.
const records = input.split("\n\n").filter((r) => r !== "");

// Non-error categories are recognized and intentionally excluded from
// `counts` — they must still be tallied here so a record that is
// correctly classified as "not an error" is never mistaken by the
// count guard below for a record that silently vanished unclassified.
let recognizedNonErrorCount = 0;
const counts = new Map<string, number>();

for (const record of records) {
  const recordLines = record.split("\n");
  const header = recordLines[0] ?? "";
  const match = header.match(HEADER_RE);

  if (match) {
    const [, path, , , category, code] = match;
    if (category !== "error") {
      recognizedNonErrorCount++;
      continue;
    }
    const message = recordLines
      .slice(1)
      .join(" ")
      .replace(/\s+/g, " ")
      .trim();
    const messageHead = message.slice(0, 80);
    const key = `${path}|${code}|${messageHead}`;
    counts.set(key, (counts.get(key) ?? 0) + 1);
    continue;
  }

  // No header line matched at all: a file-less diagnostic (shape 2 above)
  // IS just the message, with no header to parse — over-inclusive by
  // design, see the file-header comment.
  const message = record.replace(/\s+/g, " ").trim();
  const messageHead = message.slice(0, 80);
  const key = `(no file)|TS0000|${messageHead}`;
  counts.set(key, (counts.get(key) ?? 0) + 1);
}

if (countMode) {
  // rawRecords: total blank-line-delimited records in the input.
  // accountedRecords: sum of every fingerprinted error's dedup weight,
  // plus the non-error records recognized-and-skipped above. The two
  // must be equal — the only way they can differ is a future change to
  // this file's classification logic introducing a silent `continue`
  // (or similar) that drops a record without tallying it anywhere,
  // which is exactly the bug this whole fix exists to make impossible
  // to reintroduce unnoticed.
  const fingerprintedWeight = [...counts.values()].reduce(
    (sum, n) => sum + n,
    0,
  );
  const accountedRecords = fingerprintedWeight + recognizedNonErrorCount;
  process.stdout.write(`${records.length} ${accountedRecords}\n`);
} else {
  const fingerprint = [...counts.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([key, count]) => (count > 1 ? `${key} x${count}` : key))
    .join("\n");

  process.stdout.write(fingerprint ? fingerprint + "\n" : "");
}
