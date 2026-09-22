#!/usr/bin/env bash
# Publish shields endpoint JSON files to an orphan badge branch.
#
# Usage: scripts/ci/publish-badges.sh <dir-with-json-files> [branch]
#
# <branch> defaults to `badges` (the release-pinned branch the site home
# reads, written by release.yml from the release tag). ci.yml and
# lighthouse.yml pass `badges-main` for main-branch numbers (the README).
#
# Only the files present in <dir> are updated — other badge files on the
# branch survive, so the ci, lighthouse, and release workflows can publish
# independently. Push retries with a rebase to tolerate two workflows
# racing each other on the SAME branch: every run starts from that branch's
# remote state (fetch → reset) and adds only its own files, so concurrent
# publishers merge instead of clobbering. Publishers to DIFFERENT branches
# never touch each other's files by construction.
set -euo pipefail

SOURCE_DIR="$1"
BRANCH="${2:-badges}"
REPO_URL="https://x-access-token:${GITHUB_TOKEN}@github.com/${GITHUB_REPOSITORY}.git"
WORK_DIR="$(mktemp -d)"

git -C "$WORK_DIR" init -q -b "$BRANCH"
git -C "$WORK_DIR" config user.name "github-actions[bot]"
git -C "$WORK_DIR" config user.email "41898282+github-actions[bot]@users.noreply.github.com"
git -C "$WORK_DIR" remote add origin "$REPO_URL"
if git -C "$WORK_DIR" fetch -q origin "$BRANCH" 2>/dev/null; then
  git -C "$WORK_DIR" reset -q --hard "origin/$BRANCH"
fi

cp "$SOURCE_DIR"/*.json "$WORK_DIR"/
git -C "$WORK_DIR" add -A
if git -C "$WORK_DIR" diff --cached --quiet; then
  echo "$BRANCH unchanged, nothing to publish"
  exit 0
fi
git -C "$WORK_DIR" commit -q -m "chore(badges): update $(basename -a "$SOURCE_DIR"/*.json | tr '\n' ' ')"

for attempt in 1 2 3; do
  if git -C "$WORK_DIR" push origin "$BRANCH"; then
    echo "$BRANCH published"
    exit 0
  fi
  echo "push rejected (attempt $attempt), rebasing on remote $BRANCH"
  git -C "$WORK_DIR" fetch -q origin "$BRANCH"
  git -C "$WORK_DIR" rebase -q "origin/$BRANCH"
done

echo "failed to push $BRANCH after 3 attempts" >&2
exit 1
