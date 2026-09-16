#!/usr/bin/env bash
# marko-type-check on this project needs an 8GB heap and holds it for
# minutes; two of them running at once (e.g. from separate worktree agents
# sharing this machine) risks OOMing the box. The lock dir lives under the
# shared bare repo (`git rev-parse --git-common-dir`), so it is visible to
# every worktree, not just this one.
set -euo pipefail

cd "$(dirname "${BASH_SOURCE[0]}")/.."

lock_dir="$(git rev-parse --git-common-dir)/docs-mtc.lock"
pid_file="$lock_dir/pid"
owned=0
cleanup() {
  [ "$owned" -eq 1 ] && rm -rf "$lock_dir"
  return 0
}
trap cleanup EXIT

waited=0
while ! mkdir "$lock_dir" 2>/dev/null; do
  if [ "$waited" -eq 0 ]; then
    echo "docs mtc: waiting for lock held by another check run ($lock_dir)..." >&2
  fi
  # A holder that was SIGKILLed/OOM-killed leaves the lock dir behind
  # forever with nothing left alive to release it. Detect that instead of
  # just waiting out the full timeout with no diagnostic.
  if [ -f "$pid_file" ]; then
    holder_pid="$(cat "$pid_file" 2>/dev/null || true)"
    if [ -n "$holder_pid" ] && ! kill -0 "$holder_pid" 2>/dev/null; then
      echo "docs mtc: lock holder (pid $holder_pid) is dead, reclaiming ($lock_dir)" >&2
      rm -rf "$lock_dir"
      continue
    fi
  fi
  sleep 5
  waited=$((waited + 5))
  if [ "$waited" -ge 1800 ]; then
    echo "docs mtc: lock held for 30m+, giving up ($lock_dir). If the holder is gone, remove it manually: rm -rf '$lock_dir'" >&2
    exit 1
  fi
done
owned=1
echo $$ > "$pid_file"

bash scripts/ensure-routes-dts.sh
rm -f tsconfig.tsbuildinfo
set +e
raw="$(NODE_OPTIONS="--max-old-space-size=8192" marko-type-check -p ./tsconfig.json -d condensed)"
mtc_exit=$?
set -e
echo "$raw"

# marko-type-check exits 0 (no errors) or 1 (has errors) when it actually
# ran to completion — those are the only two exit codes it uses, and it
# prints no "Found N errors" summary line to key off instead. Any other
# code (137/139 killed, 124 timed out, etc.) means the process died before
# finishing, and its (likely empty or truncated) stdout must never be
# treated as "zero errors" or "baseline fully gone" — that would silently
# blow away every known-error entry in the next `mtc:baseline` regen.
if [ "$mtc_exit" -ne 0 ] && [ "$mtc_exit" -ne 1 ]; then
  echo "" >&2
  echo "docs mtc: marko-type-check did not complete (crash/OOM?) — no baseline comparison performed (exit $mtc_exit)." >&2
  exit 1
fi

# `$(...)` inside `read <<<` discards the command's exit status, and `read`
# at EOF returns 1 without tripping `set -e` — so a crashing normalize-mtc.ts
# (syntax error, missing bun, OOM) would leave both vars empty, `[ "" != "" ]`
# would be false, and the script would proceed as if 0 records existed. Every
# exit-status-bearing step below is therefore captured explicitly under
# `set +e`/`$?` rather than trusted to `set -e` to catch it, since none of
# these are simple commands `set -e` reliably covers (command substitution
# and `read` both swallow failure in different ways).
set +e
fingerprint="$(printf '%s' "$raw" | bun scripts/normalize-mtc.ts)"
fingerprint_exit=$?
set -e
if [ "$fingerprint_exit" -ne 0 ]; then
  echo "" >&2
  echo "docs mtc: normalize-mtc.ts failed (exit $fingerprint_exit) — normalizer broken, not a clean run. No baseline comparison performed." >&2
  exit 1
fi

# normalize-mtc.ts classifies every blank-line-delimited record it sees —
# as a fingerprinted error, or as a recognized-and-skipped non-error — and
# never silently drops one. --count reports "<rawRecords> <accountedRecords>";
# a mismatch means some future change to that file's classification logic
# introduced a silent drop (the exact class of bug this whole guard exists
# to catch — see normalize-mtc.ts's file header for the full history).
# Independent of baseline size: a baseline at 0 entries must not disarm this.
set +e
counts_out="$(printf '%s' "$raw" | bun scripts/normalize-mtc.ts --count)"
count_exit=$?
set -e
if [ "$count_exit" -ne 0 ]; then
  echo "" >&2
  echo "docs mtc: normalize-mtc.ts --count failed (exit $count_exit) — normalizer broken, not a clean run. No baseline comparison performed." >&2
  exit 1
fi
read -r raw_record_count accounted_record_count <<< "$counts_out"
if ! [ "$raw_record_count" -ge 0 ] 2>/dev/null || ! [ "$accounted_record_count" -ge 0 ] 2>/dev/null; then
  echo "" >&2
  echo "docs mtc: normalize-mtc.ts --count produced malformed output: '$counts_out'" >&2
  exit 1
fi
if [ "$raw_record_count" != "$accounted_record_count" ]; then
  echo "" >&2
  echo "docs mtc: normalize-mtc.ts saw $raw_record_count raw diagnostic record(s) but only accounted for $accounted_record_count — normalizer gap, not a clean run. No baseline comparison performed." >&2
  exit 1
fi

baseline="$(grep -v '^#' mtc-baseline.txt | sed '/^$/d')"

new_lines="$(comm -13 <(echo "$baseline" | sort) <(echo "$fingerprint" | sort))"
gone_lines="$(comm -23 <(echo "$baseline" | sort) <(echo "$fingerprint" | sort))"

status=0

if [ -n "$new_lines" ]; then
  echo "" >&2
  echo "docs mtc: NEW errors not in mtc-baseline.txt (this is the gate — fix them):" >&2
  echo "$new_lines" | sed 's/^/  + /' >&2
  status=1
fi

if [ -n "$gone_lines" ]; then
  echo "" >&2
  echo "docs mtc: baseline errors that no longer reproduce — regenerate the baseline so it doesn't rot:" >&2
  echo "$gone_lines" | sed 's/^/  - /' >&2
  echo "  Run: bun run mtc:baseline (from apps/docs)" >&2
  status=1
fi

if [ "$status" -eq 0 ]; then
  echo "" >&2
  echo "docs mtc: no new errors, baseline unchanged ($(echo "$fingerprint" | grep -c . || true) known entries)." >&2
fi

exit "$status"
