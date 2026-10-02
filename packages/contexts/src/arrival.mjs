/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. https://mozilla.org/MPL/2.0/ */
import { ContextsError } from './errors.mjs';
import { clip, own } from './schema.mjs';

// Arrival without a form (workstation-v1 §4). Opening a loopback URL lets
// chrome ask `lsof` (fixed argument arrays, no shell) which of the user's own
// processes listens on that port and where it runs; the pure helpers here
// build those arguments, parse the output and turn a working directory into a
// project offer. Nothing here runs a process or touches the file system.

const LOOPBACK = new Set(['localhost', '127.0.0.1', '[::1]']);
const MAX_PID = 2147483647;
const MAX_LSOF_TEXT = 1048576;
const MAX_PATH = 4096;

const parseUrl = url => {
  const s = typeof url === 'string' ? url : typeof url?.href === 'string' ? url.href : null;
  if (s === null || s.length > 65536) return null;
  try { return new URL(s); } catch { return null; }
};

// The port of an http(s) URL on localhost, 127.0.0.1 or [::1] (explicit or
// the scheme default); null for anything else, including 0.0.0.0.
export function loopbackPort(url) {
  const u = parseUrl(url);
  if (!u || (u.protocol !== 'http:' && u.protocol !== 'https:') || !LOOPBACK.has(u.hostname)) return null;
  return u.port ? Number(u.port) : u.protocol === 'https:' ? 443 : 80;
}

// lsof -F field output; -n/-P keep addresses and ports numeric, -a ANDs the selections.
export function LSOF_LISTEN_ARGS(port) {
  if (!Number.isSafeInteger(port) || port < 1 || port > 65535) throw new ContextsError('INVALID_INPUT', '$.port: expected an integer 1–65535', '$.port');
  return Object.freeze(['-nP', '-a', `-iTCP:${port}`, '-sTCP:LISTEN', '-F', 'pun']);
}
export function LSOF_CWD_ARGS(pid) {
  if (!Number.isSafeInteger(pid) || pid < 1 || pid > MAX_PID) throw new ContextsError('INVALID_INPUT', '$.pid: expected a positive integer', '$.pid');
  return Object.freeze(['-nP', '-a', '-p', String(pid), '-d', 'cwd', '-F', 'pn']);
}

const lines = text => (typeof text === 'string' ? text.slice(0, MAX_LSOF_TEXT).split(/\r?\n/) : []);
const pidOf = s => (/^[1-9][0-9]{0,9}$/.test(s) && Number(s) <= MAX_PID ? Number(s) : null);
const LOOPBACK_LISTEN = ['127.0.0.1:', '[::1]:', 'localhost:', '*:'];

// Processes of `uid` listening on a loopback (or any) address, from
// `lsof -F pun` output. At most 8 unique pids. Never throws on the text.
export function parseLsofListen(text, { uid } = {}) {
  if (!Number.isSafeInteger(uid) || uid < 0) throw new ContextsError('INVALID_INPUT', '$.uid: expected an integer ≥ 0', '$.uid');
  const out = [];
  let pid = null, owner = null;
  for (const line of lines(text)) {
    const tag = line[0], value = line.slice(1);
    if (tag === 'p') { pid = pidOf(value); owner = null; }
    else if (tag === 'u') owner = /^[0-9]{1,10}$/.test(value) ? Number(value) : null;
    else if (tag === 'n' && pid !== null && owner === uid && LOOPBACK_LISTEN.some(p => value.startsWith(p)) && !out.some(x => x.pid === pid)) {
      out.push(Object.freeze({ pid }));
      if (out.length >= 8) break;
    }
  }
  return Object.freeze(out);
}

// The `n` of the `fcwd` entry of `lsof -F pn -d cwd` output: an absolute path
// without NUL, at most 4096 characters; else null.
export function parseLsofCwd(text) {
  let inCwd = false;
  for (const line of lines(text)) {
    const tag = line[0], value = line.slice(1);
    if (tag === 'p') inCwd = false;
    else if (tag === 'f') inCwd = value === 'cwd';
    else if (tag === 'n' && inCwd) return value.startsWith('/') && !value.includes('\u0000') && value.length <= MAX_PATH ? value : null;
  }
  return null;
}

// Absolute path → normalized form without "." and empty segments; null for
// relative paths, NUL, ".." or overlong input.
function normalPath(p) {
  if (typeof p !== 'string' || !p.startsWith('/') || p.includes('\u0000') || p.length > MAX_PATH) return null;
  const segs = p.split('/').filter(s => s && s !== '.');
  if (segs.includes('..')) return null;
  return `/${segs.join('/')}`;
}
const within = (path, base) => path === base || path.startsWith(base === '/' ? '/' : `${base}/`);

// `cwd` and its ancestors, deepest first, at most 6: never "/", never `home`
// itself and never outside `home` (cwd outside home → []). `roots` optionally
// names further base folders the user keeps projects in (for example a
// projects volume); they follow the same rules as `home`.
export function rootCandidates(cwd, { home, roots = [] } = {}) {
  const c = normalPath(cwd);
  const bases = [home, ...(Array.isArray(roots) ? roots : [])].map(normalPath).filter(b => b && b !== '/');
  if (!c || !bases.length) return Object.freeze([]);
  const base = bases.filter(b => within(c, b) && c !== b).sort((a, b) => b.length - a.length)[0];
  if (!base) return Object.freeze([]);
  const out = [];
  for (let p = c; out.length < 6 && p !== base && p !== '/' && within(p, base); p = p.slice(0, p.lastIndexOf('/')) || '/') out.push(p);
  return Object.freeze(out);
}

// The nearest candidate holding `.git` (a dir, or a file for worktrees and
// submodules), else the deepest candidate.
export function chooseArrivalRoot(candidates, present) {
  const list = Array.isArray(candidates) ? candidates.filter(c => typeof c === 'string') : [];
  for (const c of list) {
    const kind = own(present, `${c}/.git`);
    if (kind === 'dir' || kind === 'file') return c;
  }
  return list[0] ?? null;
}

// What to offer for a loopback URL served from `root`: the known project whose
// root equals or contains it (the most specific one), or a new project named
// after the folder. null when the URL is not loopback or the root is invalid.
export function arrivalOffer({ url, root, projects } = {}) {
  if (loopbackPort(url) === null) return null;
  const r = normalPath(root);
  if (!r || r === '/') return null;
  let best = null;
  for (const p of Array.isArray(projects) ? projects : []) {
    const pr = normalPath(own(p, 'root'));
    if (!pr || typeof own(p, 'id') !== 'string' || !within(r, pr)) continue;
    if (!best || pr.length > best.root.length) best = { id: p.id, root: pr };
  }
  if (best) return Object.freeze({ kind: 'known', project_id: best.id });
  const name = clip(r.slice(r.lastIndexOf('/') + 1).replace(/[\u0000-\u001f\u007f]/g, ''), 80);
  return name ? Object.freeze({ kind: 'new', root: r, name }) : null;
}

// ------------------------------------------------- surface matching §4.1 ----

const FORGES = new Set(['github.com', 'gitlab.com', 'bitbucket.org']);
const segmentsOf = u => u.pathname.split('/').filter(Boolean).map(s => { try { return decodeURIComponent(s).toLowerCase(); } catch { return s.toLowerCase(); } });
const surfacesOf = p => {
  const list = own(own(p, 'manifest'), 'surfaces') ?? own(p, 'surfaces');
  return Array.isArray(list) ? list : [];
};

// Links a tab to an existing project: a forge URL whose owner/repo equals a
// project's repository surface, or a vercel.com URL below a project's Vercel
// /team/project hosting surface. First project in list order wins. Never
// discovers folders.
export function matchSurfaceForUrl(projects, url) {
  const u = parseUrl(url);
  if (!u || (u.protocol !== 'https:' && u.protocol !== 'http:')) return null;
  const host = u.hostname;
  const forge = FORGES.has(host), vercel = host === 'vercel.com';
  if (!forge && !vercel) return null;
  const segs = segmentsOf(u);
  if (segs.length < 2) return null;
  for (const p of Array.isArray(projects) ? projects : []) {
    if (typeof own(p, 'id') !== 'string') continue;
    for (const surface of surfacesOf(p)) {
      const s = parseUrl(own(surface, 'url'));
      if (!s || s.hostname !== host) continue;
      const ss = segmentsOf(s);
      const kind = own(surface, 'kind');
      const ok = forge
        ? kind === 'repository' && ss.length >= 2 && ss[0] === segs[0] && ss[1] === segs[1].replace(/\.git$/, '')
        : kind === 'hosting' && ss.length >= 2 && ss[0] === segs[0] && ss[1] === segs[1];
      if (ok) return Object.freeze({ project_id: p.id, surface });
    }
  }
  return null;
}
