# Edo Moon agency: working here

This repository runs the AI agency that markets Edo Moon (Paperclip, on this
laptop at http://127.0.0.1:3100). Start agency sessions here; product work
starts in `~/Products/project_nemesis`. Read first:

- `~/Products/project_nemesis/CLAUDE.md`: the product's rules (git identity,
  no secrets, sessions push to main once tests pass and agents never push,
  Codex as a second view, crypto, care). They apply here.
- `~/Products/project_nemesis/docs/plans/exec_plan_paperclip.md`: the living
  plan of this setup, with every decision and Paperclip defect met so far.
  Update it as you go.
- `README.md` here: souls, versions, sync, hiring, approvals, the sandbox.

## Machines

- This laptop runs Paperclip (`~/.local/bin/paperclip-edomoon`, a transient
  systemd user unit `paperclip`; data in `~/.paperclip/`, agents' files in
  `~/.paperclip-agents/`).
- The ThinkPad (petr@192.168.100.4, repo `~/Products/edomoon`) holds the
  Publer window and runs the cron that posts: `queue-day.sh` at 10:00,
  `metrics.mjs` every six hours. It always carries the queue run's
  uncommitted changes (calendar, post marks); never commit or discard them.
  Commit only your own files there (better: commit on the laptop and push;
  autodeploy fetches it), never push from there, and check no social job is
  running first.
- `edomoon-daily.timer` (10:30 Europe/Prague) runs `scripts/daily.sh`: pulls
  the ThinkPad's state, runs `stats.sh` there, wakes stuck reviews, fires
  the CEO's daily check-in.

## Rules for work here

- Commit with `git -c user.name="Petr Kožušník" -c user.email=38697731+droo303@users.noreply.github.com commit`.
- Push to `main` as you go (owner, 2026-10-28: edomoon-souls is pushed
  normally too). Never force-push. Agents never push.
- Before any agent hire is approved: `node scripts/check-hire.mjs <id>`.
  Hires are submitted by the board (`scripts/submit-hire.mjs`).
- After any change to `config/sandbox.json` or a Paperclip update, rerun
  `sandbox-test/sandbox-probe.mjs --fake-publer`; every line must say PASS.
- Paperclip is pinned to 2026.1023.0; an update is a deliberate step.
- Agents get no SSH, no Publer, no deploy. Applying approved bank copy on the
  ThinkPad is `scripts/apply-bank-patch.sh`, run for the owner.
