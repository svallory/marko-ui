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
NODE_OPTIONS="--max-old-space-size=8192" marko-type-check -p ./tsconfig.json -d condensed
