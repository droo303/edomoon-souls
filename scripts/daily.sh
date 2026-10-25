#!/usr/bin/env bash
# The agency's morning on the owner's laptop, after the ThinkPad's 10:00
# queue run: fresh data in, stuck reviews woken, then the CEO's daily
# check-in fired (Paperclip routine "CEO daily check-in", API trigger).
# Run by the systemd user timer edomoon-daily.timer; safe to run by hand.
set -uo pipefail
cd "$(dirname "$0")/.."
P="$HOME/.paperclip-agents/pulled"; DAY=$(date -u +%F); STAMP=$(date -u +%Y-%m-%dT%H%MZ)
echo "=== $(date -Is)"
if ! curl -sf -m5 http://127.0.0.1:3100/api/health >/dev/null; then
  echo "paperclip down: starting it"
  systemd-run --user --unit=paperclip --collect "$HOME/.local/bin/paperclip-edomoon" run >/dev/null 2>&1 || true
  for _ in $(seq 60); do curl -sf -m5 http://127.0.0.1:3100/api/health >/dev/null && break; sleep 5; done
fi
scripts/pull-from-4.sh 2>/dev/null | head -1 || { echo "pull failed: the CEO gets yesterday's copy"; }
out=$(ssh -o BatchMode=yes -o ConnectTimeout=15 -o IdentitiesOnly=yes -i "$HOME/.ssh/id_ed25519" petr@192.168.100.4 \
  'cd ~/Products/edomoon && bash scripts/stats.sh 7' 2>&1) && {
  if echo "$out" | grep -qE '81\.2\.244|root@'; then echo "stats: output names the server, not saved"; else
    { echo "# scripts/stats.sh 7, run $(date -u +%Y-%m-%dT%H:%MZ) on the ThinkPad by daily.sh (read-only)"; echo; echo "$out"; } > "$P/stats/stats-7d-$STAMP.txt"
    cp "$P/stats/stats-7d-$DAY.txt" "$P/stats/stats-7d-latest.txt"; echo "stats: saved stats-7d-$DAY.txt"; fi; } || echo "stats: not read (ThinkPad off or key refused)"
node scripts/wake-stuck-reviews.mjs
R=$(cat "$HOME/.paperclip-agents/routine-ceo-daily.json")
rid=$(echo "$R" | python3 -c 'import json,sys;print(json.load(sys.stdin)["routineId"])'); tid=$(echo "$R" | python3 -c 'import json,sys;print(json.load(sys.stdin)["triggerId"])')
curl -s -X POST "http://127.0.0.1:3100/api/routines/$rid/run" -H 'content-type: application/json' \
  -d "{\"source\":\"manual\",\"triggerId\":\"$tid\",\"idempotencyKey\":\"ceo-daily-$DAY\"}" | python3 -c 'import json,sys;d=json.load(sys.stdin);print("ceo check-in:",d.get("status") or d.get("run",{}).get("status") or d)'
