#!/usr/bin/env node
// Lists open issues that lack the public-facing execution policy
// (config/execution-policy-public.json): a review stage by the Reviewer and
// an approval stage by the owner. Paperclip has no default policy, so this
// is how a missing one is caught. An issue that is not public-facing (a
// plan, a hire, a process-agent run) can be listed; judge it by its title.
//
//   node scripts/check-policies.mjs
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { ROOT } from './lib/sandbox.mjs';
import { api } from './lib/api.mjs';

const want = JSON.parse(readFileSync(path.join(ROOT, 'config', 'execution-policy-public.json'), 'utf8')).executionPolicy;
const reviewer = want.stages.find((s) => s.type === 'review').participants[0].agentId;
const ceo = JSON.parse(readFileSync(path.join(ROOT, 'config', 'execution-policy-bank-copy.json'), 'utf8')).executionPolicy.stages.find((s) => s.type === 'approval').participants[0].agentId;
const company = readFileSync('/home/petr/.paperclip-agents/company-id', 'utf8').trim();
const r = await api('GET', `/companies/${company}/issues?limit=200`);
const issues = Array.isArray(r.json) ? r.json : r.json?.items ?? r.json?.issues ?? [];
let missing = 0;
for (const i of issues) {
  if (['done', 'cancelled'].includes(i.status)) continue;
  // The list carries a trimmed policy; read each issue in full.
  const full = (await api('GET', `/issues/${i.id}`)).json ?? i;
  const stages = full.executionPolicy?.stages ?? [];
  const hasReview = stages.some((s) => s.type === 'review' && s.participants?.some((p) => p.agentId === reviewer));
  // The owner approves public work; the CEO approves bank copy (brand rule 7).
  const hasApproval = stages.some((s) => s.type === 'approval' && s.participants?.some((p) => p.userId === 'local-board' || p.agentId === ceo));
  if (hasReview && hasApproval) continue;
  missing++;
  console.log(`${i.identifier}  ${i.status.padEnd(12)} review:${hasReview ? 'yes' : 'NO '} approval:${hasApproval ? 'yes' : 'NO '}  ${i.title}`);
}
console.log(missing ? `${missing} open issue(s) without the public-facing policy` : 'every open issue carries the public-facing policy');
