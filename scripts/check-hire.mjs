#!/usr/bin/env node
// Before approving a hire (or any time), checks an agent's live config
// against the sandbox rules and prints what the approval card does not show.
//
//   node scripts/check-hire.mjs <agent-id>       exit 0: sandbox holds; 1: problems listed
//   node scripts/check-hire.mjs --all            every agent in the company
import { readFileSync } from 'node:fs';
import { sandboxProblems } from './lib/sandbox.mjs';
import { api } from './lib/api.mjs';

const arg = process.argv[2];
if (!arg) { console.error('usage: check-hire.mjs <agent-id> | --all'); process.exit(2); }
let ids = [arg];
if (arg === '--all') {
  const company = readFileSync('/home/petr/.paperclip-agents/company-id', 'utf8').trim();
  const r = await api('GET', `/companies/${company}/agents`);
  ids = (r.json ?? []).map((a) => a.id);
}
let bad = 0;
for (const id of ids) {
  const a = await api('GET', `/agents/${id}`);
  if (a.status !== 200) { console.log(`${id}: HTTP ${a.status} ${a.text}`); bad++; continue; }
  const agent = a.json;
  const bundle = await api('GET', `/agents/${id}/instructions-bundle`);
  const files = (bundle.json?.files ?? []).map((f) => f.path).sort();
  if (agent.adapterType === 'process') {
    console.log(`${agent.name} (process, ${agent.status}): process agents are checked by their wrapper, not the sandbox; command ${JSON.stringify(agent.adapterConfig?.command)} ${JSON.stringify(agent.adapterConfig?.args ?? [])}`);
    continue;
  }
  // Before approval the instructions folder may not be mounted yet; apply-sandbox adds it.
  const approved = !['pending_approval'].includes(agent.status);
  const problems = sandboxProblems(agent, { instructionsRoot: approved ? bundle.json?.rootPath : null });
  console.log(`${agent.name} (${agent.role}, ${agent.adapterType}, ${agent.status})`);
  console.log(`  budget proposal: ${agent.budgetMonthlyCents} cents/month; reports to: ${agent.reportsTo ?? 'nobody'}; model: ${agent.adapterConfig?.model ?? 'Paperclip default'}`);
  console.log(`  capabilities: ${(agent.capabilities ?? '').replace(/\n/g, ' / ')}`);
  console.log(`  instruction files: ${files.join(', ') || 'none'}`);
  if (problems.length) { bad++; for (const p of problems) console.log(`  PROBLEM  ${p}`); }
  else console.log('  sandbox: holds');
}
process.exit(bad ? 1 : 0);
