#!/usr/bin/env bash
# Ensures .marko-run/routes.d.ts exists before a marko-type-check run.
#
# @marko/run's vite plugin generates .marko-run/ (gitignored) as a side
# effect of booting through Vite — marko-type-check reads it to type
# `$global`/route Input augmentation on every +page.marko/+layout.marko.
# A checkout that never ran `dev`/`build` has no .marko-run/ at all, and
# every route/layout file's `$global.params.*` / `<${input.content}/>`
# read falls back to `{}`/`Input` with no route augmentation — 7 spurious
# TS2339 fingerprints that are not real bugs, just a missing generated
# file. A full `marko-run build` also regenerates it but is slow and (as
# of 2026-09-15) crashes on an unrelated compound-spike compiler bug
# during Vite's dependency scan. That scan — and routes.d.ts generation —
# only starts on the FIRST REQUEST to the dev server, not at boot; the
# server prints "listening" well before either happens. So this script
# starts `marko-run dev`, fires one request to kick off the scan (its
# response, or lack of one, is irrelevant — the crash happens after
# routes.d.ts is already written), waits for the file, then kills the
# server.
# Port is pinned explicitly, never 3000: vite.config.ts sets no
# server.port/strictPort, so Vite auto-increments when 3000 is busy, and
# on at least one maintainer machine port 3000 is permanently held by an
# unrelated app that answers 200 on every path -- a hardcoded
# localhost:3000 curl would silently hit that app instead of this server.
set -euo pipefail

cd "$(dirname "${BASH_SOURCE[0]}")/.."

if [ -f .marko-run/routes.d.ts ] && grep -q "src/routes/" .marko-run/routes.d.ts; then
  exit 0
fi

# A present-but-stale routes.d.ts is worse than a missing one: the bare
# build (vite.bare.config.ts, second stage of `bun run build`) writes the
# BARE app's route table to the same .marko-run/routes.d.ts, so after any
# full build mtc reads bare-route augmentation and every main-app route
# param (`$name`, handler ctx) mis-types as NEW baseline errors. The grep
# above anchors on the main app's routes dir (src/routes/ — which the bare
# table's src/bare-routes/ entries never contain); anything else is
# discarded and regenerated below.
rm -f .marko-run/routes.d.ts

port=4417
# `bunx marko-run dev &` backgrounds only the bunx wrapper process; the real
# `node .../marko-run dev` it execs is a CHILD, not a replacement (bunx does
# not exec(3) into it). Killing just $! (the wrapper's pid) leaves that node
# child running, reparented to pid 1 — an orphaned dev server surviving every
# exit path, found live 24 minutes after a run that had already exited.
#
# `setsid` puts the whole tree in its own process group so `kill -TERM
# -"$pgid"` (the negative pid form) reaches the wrapper AND every process it
# spawned in one shot. It ships with util-linux (every Linux distro, and CI)
# but NOT with macOS by default, and this repo is also developed on macOS —
# without a fallback, `setsid ... &` would background a command that exits
# 127 immediately, no server would ever start, and the script would fail 27s
# later with the misleading ".marko-run/routes.d.ts did not appear" timeout
# instead of a clear "setsid missing" error.
#
# Fallback (no setsid, ENSURE_ROUTES_DTS_NO_SETSID set to force it for
# testing, or setsid's pgid didn't verify below): walk the dev server's
# whole descendant set with `pgrep -P` and signal it all at once, since
# without a shared process group there is no single signal that reaches the
# tree in one shot. `pgrep` needs procps — if that's ALSO missing there is
# no portable way to reach the child process, so fail loudly rather than
# silently leaking it.
# `set +m` (job control off) before backgrounding: with job control ON, bash
# puts each background job in its OWN process group regardless of what the
# job itself does, which would make `pgid="$dev_pid"` wrong the moment
# `setsid` forks internally or errors in a way this script doesn't detect —
# the trap would then signal a process group that isn't the dev server's.
# Verified below by reading back the real pgid with `ps`, not by assuming
# `set +m` alone guarantees it.
set +m

# Collecting the descendant set (used by the pgrep-based fallback AND as the
# pgid-mismatch fallback) walks `pgrep -P` breadth-first WITHOUT killing
# anything mid-walk. Killing level-by-level (an earlier version of this
# function did) is wrong: if an intermediate process (bunx) exits before its
# child (node) is reached, the child reparents to pid 1 and the walk misses
# it entirely — it's found via a DIFFERENT parent pid than the one being
# killed. Collecting the whole set first, then signaling it all at once,
# has no such race.
collect_descendants() {
  local root="$1" queue="$1" frontier pid found=""
  while [ -n "$queue" ]; do
    frontier=""
    for pid in $queue; do
      frontier="$frontier $(pgrep -P "$pid" 2>/dev/null || true)"
    done
    frontier="$(echo "$frontier" | tr -s ' ' '\n' | grep -v '^$' || true)"
    [ -z "$frontier" ] && break
    found="$found $frontier"
    queue="$frontier"
  done
  echo "$found" | tr -s ' ' '\n' | grep -v '^$' || true
}

if [ -z "${ENSURE_ROUTES_DTS_NO_SETSID:-}" ] && command -v setsid > /dev/null 2>&1; then
  setsid bunx marko-run dev --port "$port" > /dev/null 2>&1 &
  dev_pid=$!
  # `pgid="$dev_pid"` only holds if setsid actually put $dev_pid at the head
  # of its own process group — true in the common case, but not guaranteed
  # (setsid forks internally in some circumstances, or the assumption could
  # simply be wrong on a platform this wasn't tested on). Verify with `ps`
  # rather than trust it; fall back to the portable pgrep-based tree kill
  # when it doesn't hold, same as the no-setsid branch.
  if [ "$(ps -o pgid= -p "$dev_pid" 2>/dev/null | tr -d ' ')" = "$dev_pid" ]; then
    use_setsid=1
    pgid="$dev_pid"
  else
    use_setsid=0
  fi
else
  use_setsid=0
  if ! command -v pgrep > /dev/null 2>&1; then
    echo "ensure-routes-dts: neither setsid nor pgrep is available — cannot reliably clean up the dev server's process tree" >&2
    exit 1
  fi
  bunx marko-run dev --port "$port" > /dev/null 2>&1 &
  dev_pid=$!
fi

kill_tree() {
  # Capture the exit code we're meant to preserve as the FIRST statement,
  # before this function runs any command of its own that could change $?.
  local exit_code="${__ensure_routes_exit_code:-$?}"
  # This function runs under `set -e` (inherited from the script), as an
  # EXIT trap. ANY command here that returns nonzero — including a `kill` on
  # a process that already died, which is the common case, since cleanup
  # often runs because the process just exited or was already signaled —
  # aborts the trap immediately under `-e` and hands the shell that command's
  # own exit status, silently truncating the rest of cleanup AND clobbering
  # the exit code this trap exists to preserve (verified in isolation: a
  # bare `kill -KILL <gone-pid>` with no `|| true` inside this trap turned an
  # intended `exit 143` into `exit 1`, no error printed). Every command that
  # can plausibly fail must therefore end in `|| true`.
  if [ "$use_setsid" = 1 ]; then
    kill -TERM -"$pgid" 2>/dev/null || true
    sleep 0.2
    kill -KILL -"$pgid" 2>/dev/null || true
  else
    local descendants
    descendants="$(collect_descendants "$dev_pid")"
    if [ -n "${ENSURE_ROUTES_DTS_DEBUG:-}" ]; then
      echo "ensure-routes-dts: about to kill dev_pid=$dev_pid descendants=[$descendants]" >&2
      # shellcheck disable=SC2086
      ps -o pid,ppid,pgid,args -p "$dev_pid" $descendants >&2 2>/dev/null || true
    fi
    # shellcheck disable=SC2086
    kill -TERM "$dev_pid" $descendants 2>/dev/null || true
    sleep 0.2
    # shellcheck disable=SC2086
    kill -KILL "$dev_pid" $descendants 2>/dev/null || true
  fi
  wait "$dev_pid" 2>/dev/null || true
  exit "$exit_code"
}
trap kill_tree EXIT
trap '__ensure_routes_exit_code=130; exit 130' INT
trap '__ensure_routes_exit_code=143; exit 143' TERM

sleep 2
curl -s -m 25 -o /dev/null "http://localhost:$port/" &
curl_pid=$!

for _ in $(seq 1 25); do
  if [ -f .marko-run/routes.d.ts ]; then
    kill "$curl_pid" 2>/dev/null || true
    exit 0
  fi
  sleep 1
done

kill "$curl_pid" 2>/dev/null || true
echo "ensure-routes-dts: .marko-run/routes.d.ts did not appear within 27s" >&2
exit 1
