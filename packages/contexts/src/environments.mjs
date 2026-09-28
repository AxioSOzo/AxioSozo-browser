/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. https://mozilla.org/MPL/2.0/ */

// Environment URL mapping for the F4 switch. An environment is { name, base_url }
// where base_url is an http(s) origin plus an optional path prefix, plus an
// optional `app` in multi-app projects ("web · local", "desktop · local").

import { trimTrailing } from './schema.mjs';

export const ENV_ORDER = Object.freeze(['local', 'preview', 'production']);
const LOOPBACK = new Set(['localhost', '127.0.0.1', '[::1]']);

// Accepts a string or any URL-like object (URL objects from another global
// fail instanceof checks in chrome, so only `href` is used).
const parse = v => {
  const s = typeof v === 'string' ? v : typeof v?.href === 'string' ? v.href : null;
  if (s === null) return null;
  try { const u = new URL(s); return ['http:', 'https:'].includes(u.protocol) ? u : null; } catch { return null; }
};
const prefixOf = u => trimTrailing(u.pathname, '/');
const envList = v => Array.isArray(v) ? v : Array.isArray(v?.environments) ? v.environments : Array.isArray(v?.manifest?.environments) ? v.manifest.environments : [];

// local, preview, production first, then any other names in declared order.
export function orderedEnvironments(project) {
  const rank = e => { const i = ENV_ORDER.indexOf(e.name); return i < 0 ? ENV_ORDER.length : i; };
  return Object.freeze(envList(project).map((e, i) => [e, i]).sort(([a, i], [b, j]) => rank(a) - rank(b) || i - j).map(([e]) => e));
}

// The most specific environment whose origin matches and whose path prefix
// contains the URL's path on a segment boundary.
export function matchEnvironment(environments, url) {
  const u = parse(url);
  if (!u) return null;
  let best = null, bestLen = -1;
  for (const environment of envList(environments)) {
    const base = parse(environment?.base_url);
    if (!base || base.origin !== u.origin) continue;
    const prefix = prefixOf(base);
    if (prefix && u.pathname !== prefix && !u.pathname.startsWith(`${prefix}/`)) continue;
    if (prefix.length > bestLen) { best = { environment, prefix }; bestLen = prefix.length; }
  }
  if (!best) return null;
  return Object.freeze({ environment: best.environment, rest: Object.freeze({ path: u.pathname.slice(best.prefix.length), search: u.search, hash: u.hash }) });
}

const appOf = e => (typeof e?.app === 'string' ? e.app : null);

// Same path below the base prefix, same query and fragment, target environment.
// The target is looked up in the app of the current environment first, then
// among project-wide (app-less) environments; `options.app` picks another app
// explicitly. Never jumps to a different app implicitly.
export function switchEnvironment(environments, url, targetName, options = {}) {
  const match = matchEnvironment(environments, url);
  if (!match) return null;
  const list = envList(environments).filter(e => e?.name === targetName);
  const explicit = Object.prototype.hasOwnProperty.call(options ?? {}, 'app');
  const wanted = explicit ? (options.app ?? null) : appOf(match.environment);
  const target = list.find(e => appOf(e) === wanted) ?? (explicit ? undefined : list.find(e => appOf(e) === null));
  const base = parse(target?.base_url);
  if (!base) return null;
  const path = prefixOf(base) + match.rest.path;
  try { return new URL(`${base.origin}${path || '/'}${match.rest.search}${match.rest.hash}`).href; } catch { return null; }
}

// True only for a declared environment on a loopback host with the same origin.
export function isDeclaredLocalOrigin(environments, url) {
  const u = parse(url);
  if (!u || !LOOPBACK.has(u.hostname)) return false;
  return envList(environments).some(e => { const base = parse(e?.base_url); return !!base && LOOPBACK.has(base.hostname) && base.origin === u.origin; });
}

// Tab ↔ project linking. Finds the project environment a URL belongs to, by
// origin (scheme, host, port) and path prefix on a segment boundary. Loopback
// hosts localhost, 127.0.0.1 and [::1] count as the same host (0.0.0.0 does
// not). `projects` are project records ({ id, manifest }), manifests or
// { id, environments }. Preference: a project in `contextUuid`, then an exact
// host over a loopback alias, then the longest path prefix, then list order.
// Returns { project_id, environment, app, ambiguous } or null.
export function matchProjectForUrl(projects, url, { contextUuid } = {}) {
  const u = parse(url);
  if (!u || !Array.isArray(projects)) return null;
  const portOf = x => x.port || (x.protocol === 'https:' ? '443' : '80');
  const loop = LOOPBACK.has(u.hostname);
  const found = [];
  projects.forEach((project, order) => {
    const inContext = contextUuid !== undefined && contextUuid !== null && project?.context_uuid === contextUuid;
    for (const environment of envList(project)) {
      const base = parse(environment?.base_url);
      if (!base || base.protocol !== u.protocol) continue;
      const exact = base.origin === u.origin;
      if (!exact && !(loop && LOOPBACK.has(base.hostname) && portOf(base) === portOf(u))) continue;
      const prefix = prefixOf(base);
      if (prefix && u.pathname !== prefix && !u.pathname.startsWith(`${prefix}/`)) continue;
      found.push({ project, environment, order, rank: [inContext ? 1 : 0, exact ? 1 : 0, prefix.length] });
    }
  });
  if (!found.length) return null;
  const cmp = (a, b) => { for (let i = 0; i < 3; i++) if (a.rank[i] !== b.rank[i]) return b.rank[i] - a.rank[i]; return a.order - b.order; };
  found.sort(cmp);
  const [best] = found;
  const ambiguous = found.some(f => f.project !== best.project && f.rank.every((r, i) => r === best.rank[i]));
  return Object.freeze({ project_id: typeof best.project?.id === 'string' ? best.project.id : null, environment: best.environment, app: appOf(best.environment), ambiguous });
}
