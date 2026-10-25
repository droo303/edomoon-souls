#!/usr/bin/env node
// Pushes a committed soul into a Paperclip agent's instruction files.
//
//   node scripts/sync-soul.mjs souls/ceo <agent-id>           write AGENTS.md, SOUL.md, COMPANY.md, BRAND_RULES.md, VOICE.md
//   node scripts/sync-soul.mjs souls/ceo <agent-id> --check   report drift between the agent and the commit, write nothing
//
// It refuses to sync a soul or shared/ file with uncommitted changes, writes
// the version and souls commit into AGENTS.md, and writes each file with the
// hash it read (PUT with baseHash); on a 409 it reads again and retries.
// The API address and optional key come from scripts/lib/api.mjs (the
// environment or the gitignored .env); the key is never printed.
import { execFileSync } from 'node:child_process';
import { readFileSync, existsSync } from 'node:fs';
import path from 'node:path';
import { api } from './lib/api.mjs';

const ROOT = path.join(import.meta.dirname, '..');
const args = process.argv.slice(2);
const check = args.includes('--check');
const [soulArg, agentId] = args.filter((a) => !a.startsWith('--'));
if (!soulArg || !agentId) {
  console.error('usage: sync-soul.mjs <souls/name> <agent-id> [--check]');
  process.exit(2);
}

const git = (...a) => execFileSync('git', ['-C', ROOT, ...a], { encoding: 'utf8' }).trim();

// 1. The soul and shared files must be committed.
const soulDir = path.resolve(ROOT, soulArg);
const rel = path.relative(ROOT, soulDir);
if (rel.startsWith('..') || !existsSync(path.join(soulDir, 'SOUL.md')) || !existsSync(path.join(soulDir, 'AGENTS.md'))) {
  console.error(`${soulArg}: not a soul folder in this repository (needs SOUL.md and AGENTS.md)`);
  process.exit(2);
}
const dirty = git('status', '--porcelain', '--', rel, 'shared');
if (dirty) {
  console.error(`refusing to sync: uncommitted changes\n${dirty}`);
  process.exit(1);
}
const commit = git('rev-parse', '--short', 'HEAD');

// 2. Render the files.
const read = (p) => readFileSync(path.join(ROOT, p), 'utf8');
const soul = readFileSync(path.join(soulDir, 'SOUL.md'), 'utf8');
const version = soul.match(/^version:\s*(\S+)\s*$/m)?.[1];
if (!version) {
  console.error(`${rel}/SOUL.md has no "version:" in its frontmatter`);
  process.exit(1);
}
const rules = read('shared/brand-rules.md').replace(/^# .*\n+/, '').trim();
const agents = readFileSync(path.join(soulDir, 'AGENTS.md'), 'utf8')
  .replaceAll('{{VERSION}}', version)
  .replaceAll('{{SOULS_COMMIT}}', commit)
  .replaceAll('{{BRAND_RULES}}', rules);
if (/\{\{[A-Z_]+\}\}/.test(agents)) {
  console.error(`${rel}/AGENTS.md has a placeholder sync-soul does not know: ${agents.match(/\{\{[A-Z_]+\}\}/)[0]}`);
  process.exit(1);
}
const files = { 'AGENTS.md': agents, 'SOUL.md': soul, 'BRAND_RULES.md': read('shared/brand-rules.md'), 'VOICE.md': read('shared/voice.md'), 'COMPANY.md': read('shared/company.md') };

// 3. Read, compare, write.
async function readFile(p) {
  const r = await api('GET', `/agents/${agentId}/instructions-bundle/file?path=${encodeURIComponent(p)}`);
  if (r.status === 404) return { exists: false, hash: null, content: null };
  if (r.status !== 200) throw new Error(`GET ${p}: HTTP ${r.status} ${r.text}`);
  return { exists: true, hash: r.json.contentHash ?? null, content: r.json.content ?? null };
}

const agent = await api('GET', `/agents/${agentId}`);
if (agent.status !== 200) {
  console.error(`agent ${agentId}: HTTP ${agent.status} ${agent.text}`);
  process.exit(1);
}
console.log(`${agent.json.name} (${agent.json.adapterType}, ${agent.json.status}) <- ${rel} ${version}, souls ${commit}`);

let drift = 0;
for (const [p, content] of Object.entries(files)) {
  let cur = await readFile(p);
  if (cur.content === content) { console.log(`  same     ${p}`); continue; }
  drift++;
  if (check) { console.log(`  DIFFERS  ${p}${cur.exists ? '' : ' (missing)'}`); continue; }
  for (let attempt = 1; ; attempt++) {
    const r = await api('PUT', `/agents/${agentId}/instructions-bundle/file`, { path: p, content, baseHash: cur.hash });
    if (r.status === 200) { console.log(`  wrote    ${p}`); break; }
    if (r.status === 409 && attempt < 3) { cur = await readFile(p); continue; }
    console.error(`  FAILED   ${p}: HTTP ${r.status} ${r.text}`);
    process.exit(1);
  }
}

// 4. SOUL.md and its siblings are read from the instructions folder, which the
//    sandbox shows only if it is mounted; say so when it is not.
const bundle = await api('GET', `/agents/${agentId}/instructions-bundle`);
const rootPath = bundle.json?.rootPath;
const mounts = (agent.json.adapterConfig?.filesystemExtraPaths ?? []).map((e) => (typeof e === 'string' ? e : e.path));
if (agent.json.adapterConfig?.filesystemScope && rootPath && !mounts.includes(rootPath)) {
  console.log(`  WARNING  the sandbox does not mount ${rootPath}; the agent sees AGENTS.md but not SOUL.md. Run scripts/apply-sandbox.mjs ${agentId}`);
}
if (check) {
  console.log(drift ? `${drift} file(s) differ from souls ${commit}` : `in step with souls ${commit}`);
  process.exit(drift ? 1 : 0);
}
