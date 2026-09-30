#!/usr/bin/env bash
#
# `bun run test:cli:scenarios` entry point.
#
# Builds the CLI and the registry, serves the registry locally, runs the
# scenario suite (e2e/cli/scenarios/*.test.ts) against them, and always stops
# the server afterwards. Mirrors e2e/cli/run.sh; see that file for why the
# registry must be built with a REGISTRY_BASE_URL that points at the server.
#
# ENV
#   REGISTRY_PORT           local registry port (default 4470 — not 3000, and outside
#                           4447-4460, which packages/marko-ui's resolver.test.ts
#                           binds; `e2e/cli/run.sh` uses 4455)
#   SCENARIOS_SHOW_FAILURES=1  run known failures as plain tests, to see the
#                           real assertion output behind each `fails` mark
#   E2E_KEEP=1              keep the temp project dirs
#   any extra args          passed to vitest (e.g. a file name filter)
set -uo pipefail

REPO="$(cd "$(dirname "${BASH_SOURCE[0]}")/../../.." && pwd)"
cd "$REPO"

REGISTRY_PORT="${REGISTRY_PORT:-4470}"

server_pid=""
cleanup() {
  if [ -n "$server_pid" ]; then
    kill "$server_pid" 2>/dev/null
    wait "$server_pid" 2>/dev/null
  fi
}
trap cleanup EXIT

if lsof -ti:"$REGISTRY_PORT" >/dev/null 2>&1; then
  echo "port $REGISTRY_PORT is already in use — stop whatever holds it or set REGISTRY_PORT."
  exit 1
fi

echo "== building the CLI =="
bun run --filter marko-ui build || exit 1

echo
echo "== building the registry =="
REGISTRY_BASE_URL="http://localhost:$REGISTRY_PORT/r" bun tooling/build-registry.ts || exit 1

echo
echo "== serving the registry on :$REGISTRY_PORT =="
SERVE_ROOT="$REPO/apps/docs/public" SERVE_PORT="$REGISTRY_PORT" \
  bun "$REPO/e2e/cli/serve.ts" >/dev/null 2>&1 &
server_pid=$!

for _ in $(seq 1 30); do
  if curl -fsS -o /dev/null "http://localhost:$REGISTRY_PORT/r/style.json" 2>/dev/null; then
    break
  fi
  sleep 0.5
done
if ! curl -fsS -o /dev/null "http://localhost:$REGISTRY_PORT/r/style.json"; then
  echo "registry did not come up on :$REGISTRY_PORT"
  exit 1
fi

# Fetch the pinned `skills` package once, so scenarios that run the real relay
# in parallel do not race the first download. Output and failure are ignored:
# offline, the relay scenarios report the problem themselves.
echo
echo "== pre-warming the pinned skills package =="
SKILLS_SPEC="$(sed -n 's/^export const SKILLS_PACKAGE = "\(.*\)"$/\1/p' packages/marko-ui/src/agents/skills.ts)"
bunx "${SKILLS_SPEC:-skills@1.7.0}" --version >/dev/null 2>&1 || true

echo
REGISTRY_URL="http://localhost:$REGISTRY_PORT/r" \
  bunx vitest run --config e2e/cli/scenarios/vitest.config.ts "$@"
