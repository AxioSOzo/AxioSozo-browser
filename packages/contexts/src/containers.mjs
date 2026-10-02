/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. https://mozilla.org/MPL/2.0/ */
import { ContextsError } from './errors.mjs';
import { hostMatches } from './rules.mjs';
import { INTEGRATION_IDS, deepFreeze, isPlainObject, isProjectId, own, validateAccountLabel } from './schema.mjs';

// Containers and routing (workstation-v1 §3). Each project gets its own Gecko
// contextual identity; shared sites keep the space's default container. The
// account label is free text the user typed; nothing here reads cookies,
// tokens or page content.

export { validateAccountLabel };

// Firefox's contextual identity colours, in its own order.
export const CONTAINER_COLORS = Object.freeze(['blue', 'turquoise', 'green', 'yellow', 'orange', 'red', 'pink', 'purple']);
export const CONTAINER_ICON = 'briefcase';

// Deterministic: FNV-1a (32-bit) over the id's UTF-16 code units.
export function projectContainerStyle(projectId) {
  if (!isProjectId(projectId)) throw new ContextsError('INVALID_INPUT', '$.projectId: expected a project id (p_…)', '$.projectId');
  let h = 0x811c9dc5;
  for (let i = 0; i < projectId.length; i++) { h ^= projectId.charCodeAt(i); h = Math.imul(h, 0x01000193) >>> 0; }
  return Object.freeze({ color: CONTAINER_COLORS[h % CONTAINER_COLORS.length], icon: CONTAINER_ICON });
}

const normHost = h => (typeof h === 'string' ? h.trim().replace(/[A-Z]/g, c => c.toLowerCase()).replace(/\.$/, '') : '');
const hostsOf = project => {
  const hosts = own(own(project, 'shared_sites'), 'hosts');
  return Array.isArray(hosts) ? hosts.filter(h => typeof h === 'string') : [];
};

// True when `host` matches one of the project's shared-site patterns
// ("github.com" exactly, "*.github.com" for subdomains).
export function isSharedSite(project, host) {
  const h = normHost(host);
  return !!h && hostsOf(project).some(p => hostMatches(p, h));
}

const webUrl = url => {
  const s = typeof url === 'string' ? url : typeof url?.href === 'string' ? url.href : null;
  if (s === null || s.length > 65536) return null;
  try { const u = new URL(s); return u.protocol === 'http:' || u.protocol === 'https:' ? u : null; } catch { return null; }
};
const containerOf = project => {
  const id = own(own(project, 'container'), 'user_context_id');
  return Number.isSafeInteger(id) && id >= 1 ? id : null;
};

// Which container a URL opened for `project` belongs in. Non-web URLs and
// projects without a container yet keep the default; shared sites use it too.
export function routeForUrl({ project, url, defaultUserContextId } = {}) {
  if (!Number.isSafeInteger(defaultUserContextId) || defaultUserContextId < 0) {
    throw new ContextsError('INVALID_INPUT', '$.defaultUserContextId: expected an integer ≥ 0', '$.defaultUserContextId');
  }
  const out = (userContextId, reason) => Object.freeze({ userContextId, reason });
  const u = webUrl(url);
  if (!u) return out(defaultUserContextId, 'not_web');
  const id = containerOf(project);
  if (id === null) return out(defaultUserContextId, 'no_container');
  if (isSharedSite(project, u.hostname)) return out(defaultUserContextId, 'shared_site');
  return out(id, 'project');
}

// Sign-in hosts of each integration's dashboard. "*." entries cover subdomains.
export const INTEGRATION_HOSTS = deepFreeze({
  vercel: ['vercel.com', '*.vercel.com'],
  convex: ['dashboard.convex.dev'],
  clerk: ['dashboard.clerk.com'],
  stripe: ['dashboard.stripe.com'],
  supabase: ['supabase.com'],
  firebase: ['console.firebase.google.com'],
  cloudflare: ['dash.cloudflare.com'],
  netlify: ['app.netlify.com'],
  fly: ['fly.io'],
  sentry: ['sentry.io', '*.sentry.io'],
});

// The account key a host is labelled under: the integration whose dashboard
// host matches, else the first `accounts[].key` host pattern that matches.
export function accountKeyForHost(project, host) {
  const h = normHost(host);
  if (!h) return null;
  for (const id of INTEGRATION_IDS) if (INTEGRATION_HOSTS[id].some(p => hostMatches(p, h))) return id;
  const accounts = own(project, 'accounts');
  for (const a of Array.isArray(accounts) ? accounts : []) {
    const key = isPlainObject(a) ? a.key : undefined;
    if (typeof key === 'string' && !INTEGRATION_IDS.includes(key) && hostMatches(key, h)) return key;
  }
  return null;
}
