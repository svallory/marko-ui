#!/usr/bin/env bash
#
# First-run e2e: scaffold a real Marko app and drive the CLI through it.
#
#   bun run test:cli:e2e
#
# WHY THIS EXISTS
# ---------------
# `test:cli` never runs `init`/`add` against a real project, so a whole class of
# first-run defect passes every in-repo gate: the CLI's own tests stay green
# while `bunx marko-ui init` hangs, crashes, or produces a project whose CSS
# never loads. Every defect this harness asserts was found that way.
#
# WHAT IT ASSERTS
# ---------------
# Behaviour, not flags. The decisive check is the BUILD OUTPUT: a theme token
# and a component utility must appear in the built CSS, and the built HTML must
# link that stylesheet. An earlier version of this harness asserted file paths
# and counts instead, and passed while the user got a 776-byte stylesheet with
# no theme and no component classes in it.
#
# SETUP (both steps are required)
# -------------------------------
#   1. The CLI must be built — this runs the LOCAL build, never npm's published
#      version:
#        bun run --filter marko-ui build
#
#   2. The registry must be built and SERVED locally. `tooling/build-registry.ts`
#      changes (dependencies, file targets) exist only in local output, and the
#      CLI otherwise fetches the live registry, which AGENTS.md documents as
#      stale relative to main:
#        REGISTRY_BASE_URL="http://localhost:$REGISTRY_PORT/r" bun tooling/build-registry.ts
#        SERVE_ROOT=apps/docs/public SERVE_PORT=$REGISTRY_PORT bun e2e/cli/serve.ts &
#
# `bun run test:cli:e2e` does both for you and stops the server afterwards.
#
# ENV
#   REGISTRY_PORT   port for the local registry (default 4455)
#   E2E_KEEP=1      keep the scaffolded temp dir for debugging
#
# NOTE: the default port is deliberately NOT 3000 (a stale listener there is a
# documented trap) and the harness refuses to reuse a port already in use, so a
# leftover server cannot silently serve a stale registry.
set -uo pipefail

REPO="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
CLI="$REPO/packages/marko-ui/dist/index.js"
REGISTRY_PORT="${REGISTRY_PORT:-4455}"
REGISTRY_URL="${REGISTRY_URL:-http://localhost:$REGISTRY_PORT/r}"
WORK="$(mktemp -d)"
APP="$WORK/app"

pass=0
fail=0
ok()  { echo "  PASS: $1"; pass=$((pass + 1)); }
bad() { echo "  FAIL: $1"; fail=$((fail + 1)); }

cleanup() {
  if [ -n "${E2E_KEEP:-}" ]; then
    echo "E2E_KEEP set — keeping $WORK"
  else
    rm -rf "$WORK"
  fi
}
trap cleanup EXIT

echo "workdir: $WORK"
echo "registry: $REGISTRY_URL"

if [ ! -f "$CLI" ]; then
  echo "missing CLI build at $CLI"
  echo "run: bun run --filter marko-ui build"
  exit 1
fi

if ! curl -fsS -o /dev/null "$REGISTRY_URL/style.json"; then
  echo "no registry at $REGISTRY_URL — see SETUP in this file's header"
  exit 1
fi

run_cli() {
  # stdin closed on purpose: that is what a CI/agent caller looks like, and it
  # is the configuration that surfaces a prompt nothing can answer. The timeout
  # turns such a hang into a failure instead of hanging the harness too.
  (cd "$APP" && REGISTRY_URL="$REGISTRY_URL" CLAUDECODE=1 \
    timeout 300 node "$CLI" "$@" </dev/null 2>&1)
}

echo
echo "== scaffold =="
(cd "$WORK" && bunx create-marko@latest --name app --template basic >/dev/null 2>&1)
if [ ! -d "$APP" ]; then
  echo "scaffold failed"
  exit 1
fi
ok "scaffolded a create-marko app"

echo
echo "== init: must not prompt when nothing can answer =="
init_out="$(run_cli init)"
init_rc=$?
if [ $init_rc -eq 124 ]; then
  bad "init hung instead of using defaults"
elif [ $init_rc -ne 0 ]; then
  bad "init exited $init_rc"
  echo "$init_out" | tail -15
else
  ok "init completed without prompting"
fi
grep -q "Non-interactive run" <<<"$init_out" \
  && ok "init reported the defaults it used" \
  || bad "init did not report its defaults"

echo
echo "== one stylesheet, no stray copy =="
css_files="$(cd "$APP" && find src -name '*.css' | sort)"
css_count="$(wc -l <<<"$css_files" | tr -d ' ')"
[ "$css_count" = "1" ] && ok "one stylesheet ($css_files)" \
  || bad "expected 1 stylesheet, found $css_count: $(tr '\n' ' ' <<<"$css_files")"

css_entry="$APP/$(cd "$APP" && find src -name '*.css' | head -1)"
dupes="$(grep -c '@import "tailwindcss"' "$css_entry" 2>/dev/null || echo 0)"
[ "$dupes" -le 1 ] && ok "no duplicate @import \"tailwindcss\"" \
  || bad "duplicate @import \"tailwindcss\" ($dupes)"

echo
echo "== the entry point is actually wired up =="
# The defect this harness missed the first time: the stylesheet existed but
# nothing imported it and Tailwind never ran, so the build output had neither
# theme tokens nor component utilities.
grep -rq '\.css"' "$APP/src/routes/+layout.marko" \
  && ok "layout imports the stylesheet" \
  || bad "nothing imports the stylesheet — it will never load"
[ -f "$APP/vite.config.ts" ] && grep -q '@tailwindcss/vite' "$APP/vite.config.ts" \
  && ok "vite.config.ts loads @tailwindcss/vite" \
  || bad "no Vite config loading @tailwindcss/vite — Tailwind will not run"

echo
echo "== init is idempotent =="
snapshot() {
  (cd "$APP" && find src vite.config.ts components.json tsconfig.json -type f \
    -exec shasum {} \; 2>/dev/null | sort)
}
before="$(snapshot)"
run_cli init >/dev/null 2>&1
after="$(snapshot)"
if [ "$before" = "$after" ]; then
  ok "second init changed nothing"
else
  bad "second init changed files:"
  diff <(echo "$before") <(echo "$after") | head -20
fi

echo
echo "== add names its dependencies =="
add_out="$(run_cli add button card)"
grep -qE "Installing dependencies: .+" <<<"$add_out" \
  && ok "dependency list printed" \
  || bad "dependency list not printed"
grep -E "Installing dependencies" <<<"$add_out" | sed 's/^/    /'

# marko-zag is a zag-machine COMPONENT dependency; neither button nor card is
# one, so it must not be installed. (tw-animate-css IS a real dependency of the
# theme's CSS — `@import "tw-animate-css"` — so it is expected here.)
grep -q '"marko-zag"' "$APP/package.json" \
  && bad "marko-zag installed though no added component needs it" \
  || ok "marko-zag not installed"

echo
echo "== tsconfig =="
grep -q 'allowImportingTsExtensions' "$APP/tsconfig.json" \
  && ok "allowImportingTsExtensions added" \
  || bad "allowImportingTsExtensions missing"

echo
echo "== build =="
build_out="$(cd "$APP" && timeout 600 bun run build 2>&1)"
if [ $? -eq 0 ]; then
  ok "bun run build succeeded"
else
  bad "bun run build failed"
  echo "$build_out" | tail -25
fi

echo
echo "== BUILD OUTPUT: the styles must actually be there =="
# This is the assertion that matters. Everything above can pass while the user
# gets an unstyled page.
built_css="$(find "$APP/dist" -name '*.css' 2>/dev/null)"
if [ -z "$built_css" ]; then
  bad "no CSS emitted in dist/"
else
  css_bytes="$(cat $built_css | wc -c | tr -d ' ')"
  echo "    built CSS: $css_bytes bytes"

  # A component utility: proves Tailwind scanned the .marko component sources.
  if grep -qE '(^|[^a-z-])inline-flex' $built_css; then
    ok "component utilities present (inline-flex)"
  else
    bad "no component utilities in the built CSS — Tailwind did not scan components"
  fi

  # A theme token: proves the theme stylesheet was processed, not just Tailwind.
  if grep -q -- '--color-background\|--background' $built_css; then
    ok "theme tokens present"
  else
    bad "no theme tokens in the built CSS — the theme never loaded"
  fi

  # The mu-* hook rule, which had no definition in either distribution.
  if grep -q 'mu-font-heading' $built_css; then
    ok "mu-font-heading rule present"
  else
    bad "mu-font-heading emitted by components but absent from the built CSS"
  fi
fi

echo
echo "== the built HTML links the stylesheet =="
css_asset="$(basename "$(find "$APP/dist" -name '*.css' | head -1)" 2>/dev/null)"
built_html="$(find "$APP/dist" -name '*.html' 2>/dev/null | head -5)"

if [ -n "$built_html" ]; then
  # Static adapter: real prerendered files.
  if grep -qE "<link[^>]+${css_asset}" $built_html; then
    ok "prerendered HTML links the built stylesheet"
  else
    bad "prerendered HTML does not link ${css_asset}"
  fi
elif [ -f "$APP/dist/index.mjs" ]; then
  # Node adapter (what create-marko scaffolds by default): HTML is rendered at
  # runtime, so the <link> lives in the server bundle. Assert the emitted CSS
  # asset is actually referenced there — otherwise the stylesheet is built but
  # never served, which looks identical to success in the asset check above.
  if grep -q "$css_asset" "$APP/dist/index.mjs"; then
    ok "server bundle references the built stylesheet ($css_asset)"
  else
    bad "server bundle never references $css_asset — the CSS is built but not served"
  fi
else
  bad "no prerendered HTML and no server bundle in dist/"
fi

echo
echo "================================"
echo "PASS=$pass FAIL=$fail"
[ "$fail" -eq 0 ]
