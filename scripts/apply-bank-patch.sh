#!/usr/bin/env bash
# Applies an approved bank-copy patch on the ThinkPad (the machine whose cron
# builds and queues the posts), the way EDO-5 was applied on 2026-10-25:
# refuses while a social job runs or the copy bank has changes, refuses a
# patch that touches anything outside social/<theme>/copy/, applies it, runs
# check-copy and the social tests (tests/social.test.ts holds the voice rules
# for every built bank), rebuilds the posts, and commits the copy only (never
# pushes): the post records stay uncommitted next to the queue run's own
# changes, as the ThinkPad keeps them. queue-day.sh renders each day's posts
# before packing them, so nothing else is needed.
#
#   scripts/apply-bank-patch.sh <copy.patch> EDO-<n> "<one-line summary>"
#
# Run by the owner or by Claude Code for the owner, only after the task's
# approval stage is complete (the owner, or the CEO for bank copy).
set -euo pipefail
PATCH="${1:?patch file}"; ISSUE="${2:?issue identifier, e.g. EDO-5}"; SUMMARY="${3:?one-line summary}"
HOST="${BANK_HOST:-petr@192.168.100.4}"; REPO='~/Products/edomoon'
ssh_() { ssh -o BatchMode=yes -o ConnectTimeout=10 -o IdentitiesOnly=yes -i "$HOME/.ssh/id_ed25519" "$HOST" "$@"; }

# Only the copy bank: every file the patch names must be in social/<theme>/copy/.
bad=$(grep -E '^(\+\+\+|---) ' "$PATCH" | awk '{print $2}' | grep -v '/dev/null' | grep -v -E '/social/[a-z-]+/copy/' || true)
[ -z "$bad" ] || { echo "refused: the patch touches files outside the copy bank:"; echo "$bad"; exit 1; }
FILES=$(grep -E '^\+\+\+ ' "$PATCH" | awk '{print $2}' | sed -E 's#.*/(social/[a-z-]+/copy/.*)#\1#' | sort -u)
THEME=$(echo "$FILES" | head -1 | cut -d/ -f2)

ssh_ "pgrep -f '[q]ueue-day|[r]ender[.]mjs|[b]uild-posts|[p]lan[.]mjs|[m]etrics[.]mjs' >/dev/null && { echo 'refused: a social job is running'; exit 1; }; cd $REPO && [ -z \"\$(git status --porcelain -- social/*/copy)\" ] || { echo 'refused: the copy bank has uncommitted changes'; git status --short -- social/*/copy; exit 1; }"
# Rewrite the patch's paths to repo-relative ones, then apply with -p0 in the repo.
sed -E 's#^(\+\+\+|---) [^ ]*/(social/[a-z-]+/copy/[^	 ]*).*#\1 \2#' "$PATCH" | ssh_ "cd $REPO && patch -p0 -s --forward --no-backup-if-mismatch -r -"
ssh_ "cd $REPO && node social/check-copy.mjs --theme $THEME >/dev/null && echo 'check-copy: ok' && node social/build-posts.mjs --theme $THEME | tail -1 && timeout 300 npx vitest run tests/social.test.ts 2>&1 | grep -E 'Tests|failed' && git add social/$THEME/copy && git -c 'user.name=Petr Kožušník' -c user.email=38697731+droo303@users.noreply.github.com commit -q -m \"feat(social): $SUMMARY ($ISSUE)\" -m \"Approved in Paperclip $ISSUE; applied with edomoon-souls/scripts/apply-bank-patch.sh.\" && git log --oneline -1"
