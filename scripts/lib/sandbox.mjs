// The sandbox for claude_local agents, computed from config/sandbox.json, so
// every script (hire, apply, check, the probe harness) builds it the same way.
import { readFileSync, readdirSync, existsSync } from 'node:fs';
import path from 'node:path';

export const ROOT = path.join(import.meta.dirname, '..', '..');
export const CONFIG = JSON.parse(readFileSync(path.join(ROOT, 'config', 'sandbox.json'), 'utf8'));

const glob = (pattern) => new RegExp(`^${pattern.replace(/[.+^${}()|[\]\\]/g, '\\$&').replace(/\*/g, '.*')}$`);

/** The read-only paths: each root's entries, minus exclusions or limited to inclusions. */
export function readOnlyPaths(extra = []) {
  const paths = [];
  for (const rule of CONFIG.readOnly) {
    if (!existsSync(rule.root)) continue;
    const nested = CONFIG.readOnly.filter((r) => r !== rule && path.dirname(r.root) === rule.root).map((r) => path.basename(r.root));
    for (const name of readdirSync(rule.root).sort()) {
      if (rule.include && !rule.include.includes(name)) continue;
      if (rule.exclude?.some((p) => glob(p).test(name))) continue;
      if (nested.includes(name)) continue;
      paths.push(path.join(rule.root, name));
    }
  }
  const all = [...paths, ...extra];
  const bad = all.filter((p) => CONFIG.neverMount.some((n) => p === n || p.startsWith(`${n}/`) || n.startsWith(`${p}/`)));
  if (bad.length) throw new Error(`refusing to mount a neverMount path: ${bad.join(', ')}`);
  return all;
}

/** adapterConfig for one agent: its own workspace, the sandbox, and its instructions folder read-only. */
export function sandboxAdapterConfig({ name, instructionsRoot = null, model = undefined }) {
  if (!/^[a-z0-9-]+$/.test(name)) throw new Error(`agent workspace name must be kebab-case: ${name}`);
  return {
    ...CONFIG.adapter,
    cwd: path.join(CONFIG.workspacesRoot, name),
    filesystemExtraPaths: readOnlyPaths(instructionsRoot ? [instructionsRoot] : []),
    ...(model ? { model } : {}),
  };
}

/** Problems with an agent's live config against the sandbox; empty means it holds. */
export function sandboxProblems(agent, { instructionsRoot = null } = {}) {
  const c = agent.adapterConfig ?? {};
  const p = [];
  if (agent.adapterType !== 'claude_local') p.push(`adapterType is ${agent.adapterType}, not claude_local (paperclip_runner cannot be confined)`);
  for (const [k, v] of Object.entries(CONFIG.adapter)) {
    if (JSON.stringify(c[k]) !== JSON.stringify(v)) p.push(`${k} is ${JSON.stringify(c[k])}, expected ${JSON.stringify(v)}`);
  }
  if (typeof c.cwd !== 'string' || path.dirname(c.cwd) !== CONFIG.workspacesRoot) p.push(`cwd ${c.cwd} is not a folder directly in ${CONFIG.workspacesRoot}`);
  const allowed = new Set(readOnlyPaths(instructionsRoot ? [instructionsRoot] : []));
  for (const e of c.filesystemExtraPaths ?? []) {
    const ep = typeof e === 'string' ? e : e.path;
    if (typeof e === 'object' && e.access === 'rw') p.push(`writable extra path ${ep}`);
    if (!allowed.has(ep)) p.push(`extra path not in the sandbox rules: ${ep}`);
  }
  if (instructionsRoot && !(c.filesystemExtraPaths ?? []).some((e) => (typeof e === 'string' ? e : e.path) === instructionsRoot)) p.push(`instructions folder not mounted: ${instructionsRoot}`);
  const envKeys = Object.keys(c.env ?? {});
  if (envKeys.length) p.push(`adapter env sets ${envKeys.join(', ')}: review by hand`);
  if (agent.runtimeConfig?.heartbeat?.enabled) p.push('timer heartbeat is on');
  return p;
}
