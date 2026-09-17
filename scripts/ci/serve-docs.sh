#!/usr/bin/env bash
# Build the registry JSON + the docs static bundle and serve it on $PORT
# (default 3000) exactly as Cloudflare will.
#
# The CI suites (vitest behavior/hydration, Playwright visual, axe,
# Lighthouse) all run against THIS server, and it is deliberately
# `wrangler dev` rather than a plain static file server: the shipped artifact
# is static assets PLUS a Worker, and the pieces only the Worker provides are
# exactly the pieces those suites exercise —
#   - the /no-js-form POST round-trip (packages/shadcn/tests/behavior/
#     no-js-form.test.ts), and
#   - the /create/preview?item= rewrite the gallery visual guard depends on
#     (e2e/gallery-visual.spec.ts).
# A static-only server would serve preview-page-1 for all three items and
# 404 the POST, so the suites would be testing something we do not ship.
#
# `--local` runs the whole thing in workerd on this machine: no account, no
# credentials, no network deploy.
set -euo pipefail

PORT="${PORT:-3000}"
BASE_URL="http://localhost:${PORT}"
LOG_FILE="${RUNNER_TEMP:-/tmp}/docs-server.log"

REGISTRY_BASE_URL="${BASE_URL}/r" bun tooling/build-registry.ts
bun run --cwd apps/docs build

(cd apps/docs && nohup bunx wrangler dev --port "$PORT" --local > "$LOG_FILE" 2>&1 &)

for _ in $(seq 1 90); do
  if curl -fsS "$BASE_URL/" > /dev/null 2>&1; then
    echo "docs server ready at $BASE_URL (wrangler dev, static assets + Worker)"
    exit 0
  fi
  sleep 1
done

echo "docs server failed to start; log:" >&2
cat "$LOG_FILE" >&2
exit 1
