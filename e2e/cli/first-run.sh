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
echo "== agent setup: AGENTS.md section + skills from a LOCAL source =="
# MARKO_UI_SKILLS_SOURCE points the skills install at this checkout, so the
# harness never touches GitHub. The scaffold is already initialized, which is
# the `init --agents on an initialized project` path.
run_agents() {
  (cd "$APP" && REGISTRY_URL="$REGISTRY_URL" CLAUDECODE=1 MARKO_UI_SKILLS_SOURCE="$REPO" \
    timeout 300 node "$CLI" "$@" </dev/null 2>&1)
}

agents_out="$(run_agents init --agents)"
agents_rc=$?
[ $agents_rc -eq 0 ] && ok "init --agents on an initialized project exited 0" \
  || { bad "init --agents exited $agents_rc"; echo "$agents_out" | tail -15; }
grep -q '<!-- marko-ui:start -->' "$APP/AGENTS.md" 2>/dev/null \
  && ok "AGENTS.md has the marko-ui section" || bad "AGENTS.md has no marko-ui section"
for comp in button card; do
  grep -E '^Installed: ' "$APP/AGENTS.md" 2>/dev/null | grep -q "\`$comp\`" \
    && ok "AGENTS.md lists $comp" || bad "AGENTS.md does not list $comp"
done
for skill in marko-ui marko6; do
  grep -q "\"$skill\"" "$APP/skills-lock.json" 2>/dev/null \
    && ok "skills-lock.json has $skill" || bad "skills-lock.json has no $skill"
done
[ -f "$APP/.agents/skills/marko-ui/SKILL.md" ] \
  && ok ".agents/skills/marko-ui/SKILL.md installed" || bad ".agents/skills/marko-ui/SKILL.md missing"

check_out="$(run_agents agents sync --check)"
[ $? -eq 0 ] && ok "agents sync --check exits 0 after setup" \
  || { bad "agents sync --check failed after setup"; echo "$check_out" | tail -5; }

again_out="$(run_agents init --agents)"
[ $? -eq 0 ] && ok "second init --agents exits 0" || bad "second init --agents failed"
grep -q 'already installed' <<<"$again_out" \
  && ok "second init --agents skips the installed skills" \
  || bad "second init --agents did not report the skills as already installed"

run_agents agents sync --no-skill >/dev/null
[ $? -eq 0 ] && ok "agents sync --no-skill exits 0" || bad "agents sync --no-skill failed"

echo
echo "== iconLibrary: add must ship ONLY the configured library (#80) =="
# components.json `iconLibrary` used to be validated and then ignored: every
# consumer got all five icon maps (~85 KB gzip of unused data per page). For
# each supported library: set it, add the Icon, build, and assert on the BUILD
# OUTPUT that this library's icon data is in the bundle and no other's is.
markers="$(cd "$REPO" && bun e2e/cli/icon-markers.ts)"
mkdir -p "$APP/src/routes/icons"
cat > "$APP/src/routes/icons/+page.marko" <<'MARKO'
import Icon from "../../components/ui/icon/icon.marko";

<h1>icons</h1>
<Icon name="Search"/>
MARKO

ICON_LIBS="lucide tabler phosphor remixicon hugeicons"
prev_lib=""
for lib in $ICON_LIBS; do
  echo "-- $lib"
  icon_dir="$APP/src/components/ui/icon"
  # NOT removing $icon_dir: each iteration SWITCHES library on top of the last
  # one's output, so the "other maps absent" assertions below prove that `add`
  # deletes the previous library's stale map instead of leaving it behind.
  rm -rf "$APP/dist"
  (cd "$APP" && node -e '
    const fs = require("fs");
    const c = JSON.parse(fs.readFileSync("components.json", "utf8"));
    c.iconLibrary = process.argv[1];
    fs.writeFileSync("components.json", JSON.stringify(c, null, 2));
  ' "$lib")

  icon_out="$(run_cli add icon --overwrite)"
  [ $? -eq 0 ] && ok "$lib: add icon succeeded" || { bad "$lib: add icon failed"; echo "$icon_out" | tail -10; }

  if [ -n "$prev_lib" ]; then
    grep -q "Removed 1 stale icon map" <<<"$icon_out" && grep -q "__${prev_lib}__.ts" <<<"$icon_out" \
      && ok "$lib: add logged the removal of the stale $prev_lib map" \
      || bad "$lib: add did not log removing the stale $prev_lib map"
  fi
  prev_lib="$lib"

  # Files: exactly this library's map, none of the others, no runtime switcher.
  [ -f "$icon_dir/__${lib}__.ts" ] && ok "$lib: __${lib}__.ts copied" || bad "$lib: __${lib}__.ts missing"
  for other in $ICON_LIBS; do
    [ "$other" = "$lib" ] && continue
    [ ! -e "$icon_dir/__${other}__.ts" ] && ok "$lib: __${other}__.ts not copied" \
      || bad "$lib: __${other}__.ts copied though iconLibrary is $lib"
  done
  [ ! -e "$icon_dir/client-swap.ts" ] && ok "$lib: client-swap.ts not copied" || bad "$lib: client-swap.ts copied"

  # Source: the copied resolver imports this library's map and no other.
  resolver="$icon_dir/resolve.ts"
  grep -q "__${lib}__.ts" "$resolver" && ok "$lib: resolve.ts imports the $lib map" || bad "$lib: resolve.ts does not import __${lib}__"
  grep -q "__${lib}__.ts" "$icon_dir/resolve-client.ts" && ok "$lib: resolve-client.ts imports the $lib map" || bad "$lib: resolve-client.ts does not import __${lib}__"
  stray=""
  for other in $ICON_LIBS; do
    [ "$other" = "$lib" ] && continue
    stray="$stray$(grep -rl "__${other}__" "$icon_dir" 2>/dev/null)"
  done
  [ -z "$stray" ] && ok "$lib: no file references another library's map" || bad "$lib: stray library references in: $stray"

  build_out="$(cd "$APP" && timeout 600 bun run build 2>&1)"
  if [ $? -ne 0 ]; then
    bad "$lib: bun run build failed"
    echo "$build_out" | tail -20
    continue
  fi
  ok "$lib: build succeeded"

  built_js="$(find "$APP/dist" -name '*.js' -o -name '*.mjs' 2>/dev/null)"
  while read -r mlib marker; do
    hits="$(grep -lF -- "$marker" $built_js 2>/dev/null | wc -l | tr -d ' ')"
    if [ "$mlib" = "$lib" ]; then
      [ "$hits" -gt 0 ] && ok "$lib: built output contains $lib icon data" \
        || bad "$lib: built output has NO $lib icon data — icons would not render"
    else
      [ "$hits" = "0" ] && ok "$lib: built output has no $mlib icon data" \
        || bad "$lib: built output ships $mlib icon data ($hits files) though iconLibrary is $lib"
    fi
  done <<<"$markers"
done

echo "-- unknown iconLibrary"
(cd "$APP" && node -e '
  const fs = require("fs");
  const c = JSON.parse(fs.readFileSync("components.json", "utf8"));
  c.iconLibrary = "heroicons";
  fs.writeFileSync("components.json", JSON.stringify(c, null, 2));
')
bad_out="$(run_cli add icon --overwrite)"
bad_rc=$?
# Upstream ignores unknown values silently; we match it (no failure, no
# transform) but warn, since the project then ships every library.
[ $bad_rc -eq 0 ] && ok "unknown iconLibrary does not fail add (exit 0)" \
  || { bad "unknown iconLibrary failed add (rc=$bad_rc)"; echo "$bad_out" | tail -5; }
grep -q 'Invalid icon library "heroicons"' <<<"$bad_out" \
  && ok "unknown iconLibrary prints a warning naming the value" \
  || bad "no warning for unknown iconLibrary"
grep -q 'lucide, tabler, phosphor, remixicon, hugeicons' <<<"$bad_out" \
  && ok "warning lists the valid options" || bad "warning does not list valid options"
missing=""
for l in $ICON_LIBS; do [ -f "$APP/src/components/ui/icon/__${l}__.ts" ] || missing="$missing $l"; done
[ -z "$missing" ] && ok "unknown iconLibrary: icon files shipped untransformed (all maps)" \
  || bad "unknown iconLibrary: maps missing:$missing"

echo
echo "================================"
echo "PASS=$pass FAIL=$fail"
[ "$fail" -eq 0 ]
