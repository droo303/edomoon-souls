#!/usr/bin/env node
// Writes the sandbox into an agent's adapterConfig (keeping its other
// settings, such as model) and mounts its instructions folder read-only so
// it can read SOUL.md. Run after a hire is approved, and after any change to
// config/sandbox.json (then rerun sandbox-test/).
//
//   node scripts/apply-sandbox.mjs <agent-id> <workspace-name>
import { sandboxAdapterConfig, sandboxProblems } from './lib/sandbox.mjs';
import { api } from './lib/api.mjs';

const [id, name] = process.argv.slice(2);
if (!id || !name) { console.error('usage: apply-sandbox.mjs <agent-id> <workspace-name>'); process.exit(2); }
const a = await api('GET', `/agents/${id}`);
if (a.status !== 200) { console.error(`HTTP ${a.status} ${a.text}`); process.exit(1); }
if (a.json.adapterType !== 'claude_local') { console.error(`${a.json.name} is ${a.json.adapterType}; only claude_local agents get this sandbox`); process.exit(1); }
const root = (await api('GET', `/agents/${id}/instructions-bundle`)).json?.rootPath ?? null;
const adapterConfig = { ...a.json.adapterConfig, ...sandboxAdapterConfig({ name, instructionsRoot: root, model: a.json.adapterConfig?.model }) };
const r = await api('PATCH', `/agents/${id}`, { adapterConfig, replaceAdapterConfig: true });
if (r.status !== 200) { console.error(`PATCH: HTTP ${r.status} ${r.text}`); process.exit(1); }
const problems = sandboxProblems(r.json, { instructionsRoot: root });
console.log(problems.length ? problems.map((p) => `PROBLEM  ${p}`).join('\n') : `${r.json.name}: sandbox applied, instructions folder ${root ?? '(none)'} mounted read-only`);
process.exit(problems.length ? 1 : 0);
