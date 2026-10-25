#!/usr/bin/env node
// Submits a hire payload built by hire.mjs, as the board. Paperclip refuses
// an agent's hire that carries host-executed adapter settings (the sandbox),
// so the CEO prepares the payload and the owner submits it here. Refuses a
// payload whose sandbox, permissions or heartbeat do not hold.
//
//   node scripts/submit-hire.mjs <hire-payload.json>
import { readFileSync } from 'node:fs';
import { sandboxProblems } from './lib/sandbox.mjs';
import { api } from './lib/api.mjs';

const file = process.argv[2];
if (!file) { console.error('usage: submit-hire.mjs <hire-payload.json>'); process.exit(2); }
const body = JSON.parse(readFileSync(file, 'utf8'));
const problems = sandboxProblems(body);
if (body.runner !== 'legacy') problems.push(`runner is ${body.runner}, expected legacy`);
if (!body.instructionsBundle?.files?.['AGENTS.md']?.includes('Entertainment and reflection only')) problems.push('AGENTS.md does not carry the brand rules');
if (problems.length) { for (const p of problems) console.log(`PROBLEM  ${p}`); console.log('not submitted'); process.exit(1); }
const company = readFileSync('/home/petr/.paperclip-agents/company-id', 'utf8').trim();
console.log(`${body.name} (${body.role}): sandbox holds; budget ${body.budgetMonthlyCents} cents; skills ${JSON.stringify(body.desiredSkills)}`);
console.log(`capabilities: ${body.capabilities.replace(/\n/g, ' / ')}`);
const r = await api('POST', `/companies/${company}/agent-hires`, body);
if (r.status >= 300) { console.error(`HTTP ${r.status} ${r.text}`); process.exit(1); }
console.log(`agent ${r.json.agent.id} ${r.json.agent.status}; approval ${r.json.approval?.id ?? 'none'} ${r.json.approval?.status ?? ''}`);
