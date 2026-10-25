#!/usr/bin/env bash
# Copies the social state the cron on the ThinkPad (192.168.100.4) keeps up
# to date, so agents read the same numbers and queue the owner sees:
# social/ukiyo-e/metrics/, posts/ and calendar.json, into
# ~/.paperclip-agents/pulled/ukiyo-e/ (mounted read-only in every sandbox).
#
#   scripts/pull-from-4.sh
#
# The key ~/.ssh/edomoon_pull_ed25519 can do nothing on the ThinkPad but this
# copy: its authorized_keys line forces a fixed tar command (no shell, no
# forwarding). The copy replaces the old one only when it is complete.
set -euo pipefail
HOST="${PULL_HOST:-petr@192.168.100.4}"
DEST="$HOME/.paperclip-agents/pulled/ukiyo-e"
TMP="$(mktemp -d "$HOME/.paperclip-agents/pulled/.incoming.XXXXXX")"
trap 'rm -rf "$TMP"' EXIT
ssh -o BatchMode=yes -o ConnectTimeout=10 -o IdentitiesOnly=yes -i "$HOME/.ssh/edomoon_pull_ed25519" "$HOST" | tar -xz -C "$TMP"
[ -f "$TMP/calendar.json" ] && [ -d "$TMP/posts" ] || { echo "pull: incomplete copy, kept the old one" >&2; exit 1; }
{
  echo "# Pulled from the ThinkPad"
  echo
  echo "- When: $(date -u +%Y-%m-%dT%H:%MZ)"
  echo "- From: $HOST, social/ukiyo-e/ of the edomoon repository there (its cron runs queue-day.sh daily at 10:00 and metrics.mjs every six hours)"
  echo "- Posts: $(ls "$TMP/posts" | wc -l); metrics files: $(ls "$TMP/metrics" 2>/dev/null | tr '\n' ' ')"
  echo "- A copy for reading. The source of truth is the ThinkPad; this laptop's own checkout of the bank may be older."
} > "$TMP/PULLED.md"
mkdir -p "$(dirname "$DEST")"
rm -rf "$DEST.old"; [ -d "$DEST" ] && mv "$DEST" "$DEST.old"
mv "$TMP" "$DEST"; rm -rf "$DEST.old"; trap - EXIT
tail -n +3 "$DEST/PULLED.md"
