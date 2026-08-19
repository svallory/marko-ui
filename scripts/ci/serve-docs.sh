#!/usr/bin/env bash
# Build the registry JSON + docs production bundle and serve it on $PORT
# (default 3000). Mirrors the Dockerfile stages — the CI suites (vitest
# behavior/hydration, Playwright style-matrix, axe, Lighthouse) all run
# against this real production server, not the dev server.
set -euo pipefail

PORT="${PORT:-3000}"
BASE_URL="http://localhost:${PORT}"
LOG_FILE="${RUNNER_TEMP:-/tmp}/docs-server.log"

REGISTRY_BASE_URL="${BASE_URL}/r" bun tooling/build-registry.ts
bun run --cwd apps/docs build

(cd apps/docs && PORT="$PORT" NODE_ENV=production nohup bun dist/index.mjs > "$LOG_FILE" 2>&1 &)

for _ in $(seq 1 60); do
  if curl -fsS "$BASE_URL/" > /dev/null 2>&1; then
    echo "docs server ready at $BASE_URL"
    exit 0
  fi
  sleep 1
done

echo "docs server failed to start; log:" >&2
cat "$LOG_FILE" >&2
exit 1
