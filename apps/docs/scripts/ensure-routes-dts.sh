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
set -euo pipefail

cd "$(dirname "${BASH_SOURCE[0]}")/.."

if [ -f .marko-run/routes.d.ts ]; then
  exit 0
fi

bunx marko-run dev > /dev/null 2>&1 &
dev_pid=$!
trap 'kill -9 "$dev_pid" 2>/dev/null; wait "$dev_pid" 2>/dev/null || true' EXIT

sleep 2
curl -s -m 25 -o /dev/null http://localhost:3000/ &
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
