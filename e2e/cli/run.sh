#!/usr/bin/env bash
#
# `bun run test:cli:e2e` entry point.
#
# Builds the CLI and the registry, serves the registry on a free port, runs
# e2e/cli/first-run.sh against them, and always stops the server afterwards.
#
# The registry MUST be built with REGISTRY_BASE_URL pointing at the local
# server: registry items embed absolute URLs, and `tooling/build-registry.ts`
# changes only exist in local output — the CLI otherwise fetches the live
# registry, which AGENTS.md documents as stale relative to main.
set -uo pipefail

REPO="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
cd "$REPO"

# Not 3000 (documented stale-listener trap). Overridable so a CI job or a
# developer with something already bound can move it.
REGISTRY_PORT="${REGISTRY_PORT:-4455}"

server_pid=""
cleanup() {
  if [ -n "$server_pid" ]; then
    kill "$server_pid" 2>/dev/null
    wait "$server_pid" 2>/dev/null
  fi
}
trap cleanup EXIT

if lsof -ti:"$REGISTRY_PORT" >/dev/null 2>&1; then
  echo "port $REGISTRY_PORT is already in use."
  echo "Stop whatever holds it (a stale registry server would serve stale items"
  echo "and the CLI test suite also binds this port), or set REGISTRY_PORT."
  exit 1
fi

echo "== building the CLI =="
bun run --filter marko-ui build || exit 1

echo
echo "== building the registry =="
REGISTRY_BASE_URL="http://localhost:$REGISTRY_PORT/r" bun tooling/build-registry.ts || exit 1

echo
echo "== serving the registry on :$REGISTRY_PORT =="
# Served with bun rather than `python3 -m http.server`: bun is already a hard
# requirement of this repo, python3 is not, so this runs the same way locally
# and on a CI runner without adding a setup step.
SERVE_ROOT="$REPO/apps/docs/public" SERVE_PORT="$REGISTRY_PORT" \
  bun "$REPO/e2e/cli/serve.ts" >/dev/null 2>&1 &
server_pid=$!

for _ in $(seq 1 30); do
  # stderr suppressed: the first attempts legitimately fail while the server
  # is still binding, and a connection-refused line there reads like a failure.
  if curl -fsS -o /dev/null "http://localhost:$REGISTRY_PORT/r/style.json" 2>/dev/null; then
    break
  fi
  sleep 0.5
done

if ! curl -fsS -o /dev/null "http://localhost:$REGISTRY_PORT/r/style.json"; then
  echo "registry did not come up on :$REGISTRY_PORT"
  exit 1
fi

echo
REGISTRY_PORT="$REGISTRY_PORT" bash "$REPO/e2e/cli/first-run.sh"
