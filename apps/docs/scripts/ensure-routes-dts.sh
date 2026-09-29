#!/usr/bin/env bash
# Ensures .marko-run/routes.d.ts exists before a marko-type-check run.
#
# @marko/run's vite plugin generates .marko-run/ (gitignored) as a side
# effect of rendering its virtual route files. marko-type-check reads it to
# type `$global`/route Input augmentation on every +page.marko/+layout.marko;
# without it, 7 spurious TS2339 fingerprints appear that are not real bugs.
#
# Generation goes through scripts/gen-routes-dts.ts: a Vite server in
# middlewareMode (never binds a port, no dependency scan) that loads
# `@marko/run/router` once and closes. This replaced booting `marko-run dev`
# and waiting for the file, which flaked under load (a request fired before
# the server listened never triggered generation) and could leak orphaned dev
# servers when the cleanup trap missed a child.
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

exec bun scripts/gen-routes-dts.ts
