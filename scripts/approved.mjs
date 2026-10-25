#!/usr/bin/env node
// What was approved, and by whom, in the last days (default 1): the owner's
// short list of decisions the CEO (or anyone) took on Edo Moon tasks.
//
//   node scripts/approved.mjs [days]
import { readFileSync } from 'node:fs';
import { api } from './lib/api.mjs';

const days = Number(process.argv[2] ?? 1);
const since = Date.now() - days * 86400_000;
const company = readFileSync('/home/petr/.paperclip-agents/company-id', 'utf8').trim();
const agents = Object.fromEntries(((await api('GET', `/companies/${company}/agents`)).json ?? []).map((a) => [a.id, a.name]));
const r = await api('GET', `/companies/${company}/issues?limit=200`);
const issues = Array.isArray(r.json) ? r.json : r.json?.items ?? [];
let n = 0;
for (const i of issues) {
  if (i.status !== 'done' || Date.parse(i.updatedAt) < since) continue;
  const full = (await api('GET', `/issues/${i.id}`)).json ?? i;
  const p = full.executionState?.currentParticipant ?? full.executionState?.lastDecision ?? null;
  const comments = (await api('GET', `/issues/${i.id}/comments`)).json ?? [];
  const last = (Array.isArray(comments) ? comments : comments.comments ?? []).sort((a, b) => a.createdAt.localeCompare(b.createdAt)).at(-1);
  const who = last?.authorAgentId ? agents[last.authorAgentId] ?? last.authorAgentId : 'owner';
  n++;
  console.log(`${i.identifier}  ${i.updatedAt.slice(0, 16)}  approved by ${who}: ${i.title}`);
  if (last?.body) console.log(`    ${last.body.split('\n').filter(Boolean).slice(0, 3).join(' / ').slice(0, 200)}`);
}
console.log(n ? `${n} approved in the last ${days} day(s)` : `nothing approved in the last ${days} day(s)`);
