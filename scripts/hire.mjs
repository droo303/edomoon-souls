#!/usr/bin/env node
// Builds the body of a hire request (POST /api/companies/{id}/agent-hires)
// from a soul folder, with the sandbox every claude_local agent must carry.
// It only writes JSON; submitting is a separate curl, so the same command
// works inside an agent's sandbox (where Node's fetch ignores the proxy).
//
//   node /home/petr/Products/edomoon-souls/scripts/hire.mjs \
//     --soul ./souls/analyst --name analyst --role researcher --title "Analyst" \
//     --capabilities ./souls/analyst/CAPABILITIES.txt --reports-to <ceo-id> \
//     --source-issue <issue-id> --budget 2000 --skills five-hat-review \
//     --out ./hire-analyst.json
//
// The soul folder needs SOUL.md (with "version:" in its frontmatter) and
// AGENTS.md (with {{VERSION}}, {{SOULS_COMMIT}} and {{BRAND_RULES}}). A soul
// not yet committed to the souls repository is marked "draft" until the
// owner commits it and syncs it with sync-soul.
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import path from 'node:path';
import { sandboxAdapterConfig, ROOT } from './lib/sandbox.mjs';

const argv = process.argv.slice(2);
const opt = (k, d) => { const i = argv.indexOf(`--${k}`); return i === -1 ? d : argv[i + 1]; };
const need = (k) => { const v = opt(k); if (!v) { console.error(`missing --${k}`); process.exit(2); } return v; };

const soulDir = path.resolve(need('soul'));
const name = need('name');
const soul = readFileSync(path.join(soulDir, 'SOUL.md'), 'utf8');
const version = soul.match(/^version:\s*(\S+)\s*$/m)?.[1];
if (!version) { console.error('SOUL.md has no "version:" in its frontmatter'); process.exit(1); }

// A soul inside the souls repository, committed, gets its commit; anything else is a draft.
let commit = 'draft';
if (!path.relative(ROOT, soulDir).startsWith('..')) {
  try {
    const dirty = execFileSync('git', ['-C', ROOT, 'status', '--porcelain', '--', soulDir], { encoding: 'utf8' }).trim();
    if (!dirty) commit = execFileSync('git', ['-C', ROOT, 'rev-parse', '--short', 'HEAD'], { encoding: 'utf8' }).trim();
  } catch { /* read-only checkout without git: stays draft */ }
}
const rulesFile = readFileSync(path.join(ROOT, 'shared', 'brand-rules.md'), 'utf8');
const agents = readFileSync(path.join(soulDir, 'AGENTS.md'), 'utf8')
  .replaceAll('{{VERSION}}', version).replaceAll('{{SOULS_COMMIT}}', commit)
  .replaceAll('{{BRAND_RULES}}', rulesFile.replace(/^# .*\n+/, '').trim());
if (/\{\{[A-Z_]+\}\}/.test(agents)) { console.error('AGENTS.md has an unknown placeholder'); process.exit(1); }
if (!agents.includes('Entertainment and reflection only')) { console.error('AGENTS.md must include {{BRAND_RULES}}'); process.exit(1); }

const capsFile = need('capabilities');
const capabilities = (existsSync(capsFile) ? readFileSync(capsFile, 'utf8') : capsFile).trim();
if (capabilities.split('\n').length > 3) { console.error('capabilities: keep to 2-3 lines; it is what the owner sees on the approval card'); process.exit(1); }

const budget = Number(opt('budget', '2000'));
const body = {
  name,
  role: opt('role', 'general'),
  title: opt('title', null),
  icon: opt('icon', undefined),
  reportsTo: opt('reports-to', null),
  capabilities,
  desiredSkills: (opt('skills', '') || '').split(',').map((s) => s.trim()).filter(Boolean),
  adapterType: 'claude_local',
  runner: 'legacy',
  adapterConfig: sandboxAdapterConfig({ name, model: opt('model') }),
  runtimeConfig: { heartbeat: { enabled: false, wakeOnDemand: true } },
  instructionsBundle: {
    entryFile: 'AGENTS.md',
    files: {
      'AGENTS.md': agents,
      'SOUL.md': soul,
      'BRAND_RULES.md': rulesFile,
      'VOICE.md': readFileSync(path.join(ROOT, 'shared', 'voice.md'), 'utf8'),
    },
  },
  budgetMonthlyCents: budget,
  sourceIssueId: opt('source-issue', null),
};
for (const k of Object.keys(body)) if (body[k] === undefined || body[k] === null) delete body[k];
const out = need('out');
writeFileSync(out, JSON.stringify(body, null, 2) + '\n');
console.log(`wrote ${out}: ${name} ${version} (souls ${commit}), budget proposal ${budget} cents, ${body.desiredSkills.length} skill(s)`);
console.log(`submit with: curl -sS -X POST "$PAPERCLIP_API_URL/api/companies/$PAPERCLIP_COMPANY_ID/agent-hires" -H "Authorization: Bearer $PAPERCLIP_API_KEY" -H "Content-Type: application/json" --data @${out}`);
