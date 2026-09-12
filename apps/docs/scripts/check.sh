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

rm -f tsconfig.tsbuildinfo
raw="$(NODE_OPTIONS="--max-old-space-size=8192" marko-type-check -p ./tsconfig.json -d condensed || true)"
echo "$raw"

fingerprint="$(printf '%s' "$raw" | bun scripts/normalize-mtc.ts)"
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
