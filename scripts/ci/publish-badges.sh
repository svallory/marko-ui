#!/usr/bin/env bash
# Publish shields endpoint JSON files to the orphan `badges` branch.
#
# Usage: scripts/ci/publish-badges.sh <dir-with-json-files>
#
# Only the files present in <dir> are updated — other badge files on the
# branch survive, so the ci and lighthouse workflows can publish
# independently. Push retries with a rebase to tolerate the two workflows
# racing each other.
set -euo pipefail

SOURCE_DIR="$1"
REPO_URL="https://x-access-token:${GITHUB_TOKEN}@github.com/${GITHUB_REPOSITORY}.git"
WORK_DIR="$(mktemp -d)"

git -C "$WORK_DIR" init -q -b badges
git -C "$WORK_DIR" config user.name "github-actions[bot]"
git -C "$WORK_DIR" config user.email "41898282+github-actions[bot]@users.noreply.github.com"
git -C "$WORK_DIR" remote add origin "$REPO_URL"
if git -C "$WORK_DIR" fetch -q origin badges 2>/dev/null; then
  git -C "$WORK_DIR" reset -q --hard origin/badges
fi

cp "$SOURCE_DIR"/*.json "$WORK_DIR"/
git -C "$WORK_DIR" add -A
if git -C "$WORK_DIR" diff --cached --quiet; then
  echo "badges unchanged, nothing to publish"
  exit 0
fi
git -C "$WORK_DIR" commit -q -m "chore(badges): update $(basename -a "$SOURCE_DIR"/*.json | tr '\n' ' ')"

for attempt in 1 2 3; do
  if git -C "$WORK_DIR" push origin badges; then
    echo "badges published"
    exit 0
  fi
  echo "push rejected (attempt $attempt), rebasing on remote badges"
  git -C "$WORK_DIR" fetch -q origin badges
  git -C "$WORK_DIR" rebase -q origin/badges
done

echo "failed to push badges after 3 attempts" >&2
exit 1
