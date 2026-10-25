#!/usr/bin/env node
// Wakes the reviewer or approver agent of any issue that waits on it while
// the agent sits idle: Paperclip can skip that wake when work is handed over
// (paperclipai/paperclip#17078). Run by scripts/daily.sh; safe to rerun.
import { readFileSync } from 'node:fs';
import { api } from './lib/api.mjs';

const company = readFileSync('/home/petr/.paperclip-agents/company-id', 'utf8').trim();
const r = await api('GET', `/companies/${company}/issues?limit=200`);
const issues = (Array.isArray(r.json) ? r.json : r.json?.items ?? []).filter((i) => i.status === 'in_review');
let woken = 0;
for (const i of issues) {
  const full = (await api('GET', `/issues/${i.id}`)).json;
  const p = full?.executionState?.currentParticipant;
  if (full?.executionState?.status !== 'pending' || p?.type !== 'agent' || !p.agentId) continue;
  const agent = (await api('GET', `/agents/${p.agentId}`)).json;
  if (agent?.status !== 'idle') continue;
  const w = await api('POST', `/agents/${p.agentId}/wakeup`, { source: 'assignment', triggerDetail: 'system',
    reason: `${full.identifier} waits on this agent (${full.executionState.currentStageType}); wake was skipped (paperclipai/paperclip#17078)`,
    payload: { issueId: i.id, taskId: i.id } });
  console.log(`${full.identifier}: woke ${agent.name} (${w.status})`);
  woken++;
}
console.log(woken ? `${woken} stuck review(s) woken` : 'no stuck reviews');
