# Edo Moon souls

The personas ("souls") of the AI agents that market Edo Moon
(https://edomoon.com), run in Paperclip on the owner's computer
(http://127.0.0.1:3100, company "Edo Moon"). The plan this repository serves
is `~/Products/project_nemesis/docs/plans/exec_plan_paperclip.md`.

    shared/brand-rules.md   the eleven hard rules; written inline into every agent's AGENTS.md
    shared/voice.md         the voice in brief, pointing to project_nemesis/social/persona/edo-moon.md, and the checks
    souls/<role>/           SOUL.md (the persona, versioned), AGENTS.md (short template), CHANGELOG.md
    skills/                 company skills, imported into Paperclip's library
    evals/                  fixed test tasks per role
    config/sandbox.json     the sandbox every claude_local agent carries
    scripts/                sync-soul, hire, check-hire, apply-sandbox, the process-agent wrapper
    sandbox-test/           proves the sandbox with Paperclip's own code, no agent needed

## Versions

A soul's version is the `version:` line in its SOUL.md frontmatter (v1, v2,
...). Change it with every edit to SOUL.md or AGENTS.md, and add a CHANGELOG.md
entry saying what changed and why. Commit before syncing: an agent only ever
runs a committed soul, and its AGENTS.md names the version and the souls
commit, which it quotes in every task comment.

## Syncing a soul into an agent

    git -c user.name="Petr Kožušník" -c user.email=38697731+droo303@users.noreply.github.com commit -am "souls(ceo): v2, ..."
    node scripts/sync-soul.mjs souls/ceo <agent-id>            # writes AGENTS.md, SOUL.md, BRAND_RULES.md, VOICE.md
    node scripts/sync-soul.mjs souls/ceo <agent-id> --check    # drift between the agent and the commit; writes nothing

sync-soul refuses uncommitted changes in the soul or in `shared/`, reads
each file's `contentHash` and writes it back with `baseHash`, retrying on a
409. A change to `shared/` reaches an agent only when its soul is synced
again, so sync every agent after one.

## Hiring

The CEO builds a hire with `scripts/hire.mjs` (it is mounted read-only in its
sandbox) and submits it as a proposal; the owner approves or refuses it in
Paperclip's Approvals inbox. Before approving, run:

    node scripts/check-hire.mjs <agent-id>       # the sandbox holds, and what the card does not show

After approving: commit the new soul here (the CEO delivers it in the task),
then

    node scripts/apply-sandbox.mjs <agent-id> <workspace-name>   # also mounts its instructions folder so it can read SOUL.md
    node scripts/sync-soul.mjs souls/<role> <agent-id>

## Approvals

Brand rule 7 (owner, 2026-10-25): bank copy (a patch to
`social/ukiyo-e/copy/` only) is approved by the CEO after the Reviewer
passes it; everything else public is approved by the owner. Tasks carry
`config/execution-policy-bank-copy.json` or `config/execution-policy-public.json`
(`scripts/check-policies.mjs` lists those that carry neither).

    node scripts/approved.mjs [days]                                    # what was approved, by whom
    scripts/apply-bank-patch.sh <copy.patch> EDO-<n> "<summary>"        # apply an approved patch on the ThinkPad

## The sandbox

`config/sandbox.json` holds rules, not a frozen list: which folders agents
may read (project_nemesis without `.env*`, `scripts/`, `social/publer/` and
the other four decks; parts of this repository), which hosts they may reach,
and the Bubblewrap wrapper that works around Paperclip's merged-/usr bug
(`scripts/bwrap-merged-usr`, installed at
`~/.paperclip-agents/bin/bwrap-merged-usr`). After any change to it, a
Paperclip update, or a new top-level entry in project_nemesis:

    ~/.local/opt/node-v24.22.1-linux-x64/bin/node sandbox-test/sandbox-probe.mjs --fake-publer

Every line must say PASS. Then rerun `apply-sandbox.mjs` for each agent.

## Secrets

None here. The Paperclip API address and key, if one is ever needed, go in
`.env` at the root (gitignored, never mounted for agents).
`.githooks/pre-commit` (from project_nemesis, plus Paperclip's `pcp_` and
`pcfc_` keys) refuses env files and anything that looks like a key.
