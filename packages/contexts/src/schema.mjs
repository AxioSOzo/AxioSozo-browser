/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. https://mozilla.org/MPL/2.0/ */
import { ContextsError } from './errors.mjs';

// Hand-written validators for contracts/context-v1.schema.json and
// contracts/site-rule-v1.schema.json. Each returns a frozen, normalized copy
// and rejects unknown keys. Checks the schemas delegate to code (host label
// rules, 253-byte limit, userinfo via URL parsing, uniqueness) live here too.

export const EFFECTS = Object.freeze(['nudge', 'suggest_leave', 'pause_site']);
export const OUTCOMES = Object.freeze(['none', ...EFFECTS]);
export const REASON_CODES = Object.freeze(['daily_limit_reached', 'outside_allowed_hours', 'drift', 'on_task', 'off_context', 'unclear']);
export const JEV_REASON_CODES = Object.freeze(['drift', 'on_task', 'off_context', 'unclear']);
export const CONTEXT_TYPES = Object.freeze(['personal', 'organization', 'project']);
export const PROJECT_KINDS = Object.freeze(['web', 'desktop', 'library', 'cli', 'mobile']);
export const SURFACE_KINDS = Object.freeze(['repository', 'issues', 'ci', 'releases', 'hosting', 'analytics', 'payments', 'package', 'docs', 'dashboard', 'store', 'crash_reports', 'other']);
export const OBSERVATIONS = Object.freeze(['none', 'address', 'outline']);
export const OVERRIDES = Object.freeze(['none', 'confirm', 'delay_10s']);
export const AGENT_ACCESS = Object.freeze(['none', 'read', 'act_with_confirmation']);
export const REFUSAL_REASONS = Object.freeze(['not_allowlisted', 'too_large', 'symlink_outside_root', 'not_regular_file', 'unreadable', 'invalid_utf8']);
export const MANIFEST_STATES = Object.freeze(['none', 'written', 'external']);
export const SURFACE_PROMINENCE = Object.freeze(['primary', 'secondary']);
// Surface kinds shown next to the project by default; every other kind goes
// behind the "…" menu unless a surface says otherwise.
export const PRIMARY_SURFACE_KINDS = Object.freeze(['repository', 'package', 'store']);
export const MANIFEST_VERSIONS = Object.freeze([1, 2]);
export const CONTEXT_STORE_VERSION = 2;

const UUID = /^\{?[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}\}?$/;
const PROJECT_ID = /^p_[a-z0-9]{4,32}$/;
const RULE_ID = /^r_[a-z0-9]{4,32}$/;
const NAME = /^[^\u0000-\u001f\u007f]+$/u;
const ENV_NAME = /^[a-z][a-z0-9-]{0,31}$/;
const APP_LABEL = /^[a-z0-9][a-z0-9._-]{0,39}$/;
const TIME = /^([01][0-9]|2[0-3]):[0-5][0-9]$/;
const DAY = /^[0-9]{4}-[0-9]{2}-[0-9]{2}$/;
const LEDGER_HOST = /^[a-z0-9.-]+$/;
const HOST_PATTERN = /^(\*\.[a-z0-9-]{1,63}(\.[a-z0-9-]{1,63})+|[a-z0-9-]{1,63}(\.[a-z0-9-]{1,63})*)$/;
const WEB_URL = /^https?:\/\/[^/@\s?#]+(\/[^\s?#]*)?$/;
const BASE_URL = /^https?:\/\/[^/@\s?#]+(\/[^\s?#]*)?$/;

// ---- shared helpers (also used by the other modules) ----

export const isPlainObject = v => v !== null && typeof v === 'object' && !Array.isArray(v) &&
  [Object.prototype, null].includes(Object.getPrototypeOf(v));
export const own = (obj, key) => isPlainObject(obj) && Object.prototype.hasOwnProperty.call(obj, key) ? obj[key] : undefined;
export const codePoints = s => { let n = 0; for (const _ of s) n++; return n; };
export const clip = (s, max) => { if (codePoints(s) <= max) return s; let out = '', n = 0; for (const ch of s) { if (n++ >= max) break; out += ch; } return out; };
// Linear replacement for /c+$/ (which backtracks quadratically on long runs).
export const trimTrailing = (s, ch) => { let end = s.length; while (end > 0 && s[end - 1] === ch) end--; return s.slice(0, end); };
export function utf8Length(s) {
  let n = 0;
  for (let i = 0; i < s.length; i++) {
    const c = s.charCodeAt(i);
    if (c < 0x80) n += 1;
    else if (c < 0x800) n += 2;
    else if (c >= 0xd800 && c <= 0xdbff && i + 1 < s.length && (s.charCodeAt(i + 1) & 0xfc00) === 0xdc00) { n += 4; i++; }
    else n += 3;
  }
  return n;
}
export function deepFreeze(v) {
  if (v && typeof v === 'object' && !Object.isFrozen(v)) { Object.freeze(v); for (const k of Object.keys(v)) deepFreeze(v[k]); }
  return v;
}
const fail = (code, path, message) => { throw new ContextsError(code, `${path}: ${message}`, path); };

function keys(v, code, path, required, optional = []) {
  if (!isPlainObject(v)) fail(code, path, 'expected an object');
  for (const k of Object.keys(v)) if (!required.includes(k) && !optional.includes(k)) fail(code, `${path}.${k}`, 'unknown key');
  for (const k of required) if (!Object.prototype.hasOwnProperty.call(v, k)) fail(code, `${path}.${k}`, 'missing required key');
}
function str(v, code, path, { min = 0, max = Infinity, pattern } = {}) {
  if (typeof v !== 'string') fail(code, path, 'expected a string');
  const n = codePoints(v);
  if (n < min || n > max) fail(code, path, `length must be ${min}–${max}`);
  if (pattern && !pattern.test(v)) fail(code, path, 'does not match the required pattern');
  return v;
}
function int(v, code, path, min, max) {
  if (!Number.isSafeInteger(v) || v < min || v > max) fail(code, path, `expected an integer ${min}–${max}`);
  return v;
}
function bool(v, code, path) { if (typeof v !== 'boolean') fail(code, path, 'expected a boolean'); return v; }
function oneOf(v, values, code, path) { if (!values.includes(v)) fail(code, path, `expected one of ${values.join(', ')}`); return v; }
function arr(v, code, path, { min = 0, max = Infinity } = {}) {
  if (!Array.isArray(v)) fail(code, path, 'expected an array');
  if (v.length < min || v.length > max) fail(code, path, `expected ${min}–${max} items`);
  return v;
}
function unique(items, keyOf, code, path) {
  const seen = new Set();
  items.forEach((item, i) => { const k = keyOf(item); if (seen.has(k)) fail(code, `${path}[${i}]`, 'duplicate item'); seen.add(k); });
  return items;
}
const nullable = (v, fn) => v === null ? null : fn(v);
const timestamp = (v, code, path) => int(v, code, path, 0, Number.MAX_SAFE_INTEGER);
function workspaceUuid(v, code, path) {
  str(v, code, path, { pattern: UUID });
  if (v.startsWith('{') !== v.endsWith('}')) fail(code, path, 'unbalanced braces');
  return v;
}
const name = (v, code, path) => str(v, code, path, { min: 1, max: 80, pattern: NAME });

// ---- hosts ----

const asciiLower = s => s.replace(/[A-Z]/g, c => c.toLowerCase());
const isIPv4 = labels => labels.length === 4 && labels.every(l => /^(0|[1-9][0-9]{0,2})$/.test(l) && Number(l) <= 255);

function hostPattern(v, code, path) {
  if (typeof v !== 'string') fail(code, path, 'expected a host pattern string');
  const s = asciiLower(v);
  if (s.length > 253) fail(code, path, 'host exceeds 253 bytes');
  if (!HOST_PATTERN.test(s)) fail(code, path, 'invalid host pattern (lower-case ASCII host or "*." plus a suffix of at least two labels)');
  const wildcard = s.startsWith('*.');
  const labels = (wildcard ? s.slice(2) : s).split('.');
  if (labels.some(l => l.startsWith('-') || l.endsWith('-'))) fail(code, path, 'labels must not start or end with "-"');
  if (/^[0-9]+$/.test(labels.at(-1))) {
    if (wildcard) fail(code, path, 'IP wildcards are not allowed');
    if (!isIPv4(labels)) fail(code, path, 'numeric top-level label is only valid in an IPv4 address');
  }
  return s;
}
export const validateHostPattern = s => hostPattern(s, 'INVALID_HOST_PATTERN', '$');

// ---- URLs ----

function parseHttp(v, code, path, { query }) {
  if (typeof v !== 'string') fail(code, path, 'expected a URL string');
  if (v.length > 2048) fail(code, path, 'URL longer than 2048 characters');
  if (/\s/.test(v) || v.includes('#') || (!query && v.includes('?')) || v.includes('\\')) fail(code, path, 'URL contains whitespace, a fragment, a backslash or a disallowed query');
  const m = /^(https?):\/\/([^/?#]*)/i.exec(v);
  if (!m) fail(code, path, 'expected an absolute http(s) URL');
  if (m[2].includes('@')) fail(code, path, 'URL must not contain userinfo');
  let u;
  try { u = new URL(v); } catch { fail(code, path, 'unparsable URL'); }
  if (!['http:', 'https:'].includes(u.protocol) || !u.hostname) fail(code, path, 'expected an http(s) URL with a host');
  if (u.username || u.password) fail(code, path, 'URL must not contain userinfo');
  return u;
}
function baseUrl(v, code, path) {
  const u = parseHttp(v, code, path, { query: false });
  const pathname = trimTrailing(u.pathname, '/') || '/';
  const out = u.origin + pathname;
  if (out.length > 2048 || !BASE_URL.test(out)) fail(code, path, 'invalid base URL');
  return out;
}
// Manifest service and surface URLs: like base URLs, never a query or a
// fragment, so a committed manifest cannot carry tokens or tracking state.
function webUrl(v, code, path) {
  const u = parseHttp(v, code, path, { query: false });
  const out = u.href;
  if (out.length > 2048 || !WEB_URL.test(out)) fail(code, path, 'invalid URL');
  return out;
}
export const validateBaseUrl = s => baseUrl(s, 'INVALID_URL', '$');
export const validateWebUrl = s => webUrl(s, 'INVALID_URL', '$');

// Detection and draft confirmation: drop a query and fragment from an http(s)
// URL instead of refusing it. Anything that is not an absolute http(s) URL is
// returned unchanged so the validator reports it.
export function stripQueryAndFragment(v) {
  if (typeof v !== 'string' || !/^https?:\/\//i.test(v)) return v;
  const cut = v.search(/[?#]/);
  return cut < 0 ? v : v.slice(0, cut);
}

// ---- context-v1 ----

// `app` (manifest v2 and drafts) names the app inside a multi-app project, for
// example "web" or "desktop"; single-app projects leave it absent. It is kept
// only when present so v1 records round-trip byte for byte.
const withApp = (out, v, code, path, allow) => {
  if (!Object.prototype.hasOwnProperty.call(v, 'app')) return out;
  if (!allow) fail(code, `${path}.app`, 'unknown key (app requires manifest version 2)');
  return { ...out, app: str(v.app, code, `${path}.app`, { pattern: APP_LABEL }) };
};
function environment(v, code, path, allowApp = false) {
  keys(v, code, path, ['name', 'base_url'], ['app']);
  return withApp({ name: str(v.name, code, `${path}.name`, { pattern: ENV_NAME }), base_url: baseUrl(v.base_url, code, `${path}.base_url`) }, v, code, path, allowApp);
}
function service(v, code, path, extra = false, allowNew = extra) {
  keys(v, code, path, ['name', 'url', 'port', ...(extra ? ['source', 'guess'] : [])], ['app']);
  const out = withApp({ name: name(v.name, code, `${path}.name`), url: webUrl(v.url, code, `${path}.url`), port: int(v.port, code, `${path}.port`, 1, 65535) }, v, code, path, allowNew);
  return extra ? { ...out, ...provenance(v, code, path) } : out;
}
function surface(v, code, path, extra = false, allowNew = extra) {
  keys(v, code, path, ['name', 'url', 'kind', ...(extra ? ['source', 'guess'] : [])], ['prominence']);
  const out = { name: name(v.name, code, `${path}.name`), url: webUrl(v.url, code, `${path}.url`), kind: oneOf(v.kind, SURFACE_KINDS, code, `${path}.kind`) };
  if (Object.prototype.hasOwnProperty.call(v, 'prominence')) {
    if (!allowNew) fail(code, `${path}.prominence`, 'unknown key (prominence requires manifest version 2)');
    out.prominence = oneOf(v.prominence, SURFACE_PROMINENCE, code, `${path}.prominence`);
  }
  return extra ? { ...out, ...provenance(v, code, path) } : out;
}
function provenance(v, code, path) {
  return { source: str(v.source, code, `${path}.source`, { max: 256 }), guess: bool(v.guess, code, `${path}.guess`) };
}
// Environment names are unique per app: "web · local" and "desktop · local" coexist.
export const environmentKey = e => `${e?.app ?? ''}\u0000${e?.name}`;
function uniqueEnvNames(list, code, path) { return unique(list, environmentKey, code, path); }

// The prominence a surface is shown with: its own value, else by kind.
export function surfaceProminence(surface) {
  const p = own(surface, 'prominence');
  if (SURFACE_PROMINENCE.includes(p)) return p;
  return PRIMARY_SURFACE_KINDS.includes(own(surface, 'kind')) ? 'primary' : 'secondary';
}

// Manifest version 1 is the original shape; version 2 additionally allows
// `app` on environments/services and `prominence` on surfaces. Writers emit
// version 1 whenever no v2 field is used, so older builds keep reading them.
function manifest(v, code, path) {
  keys(v, code, path, ['version', 'name', 'kind', 'environments', 'services', 'surfaces']);
  if (!MANIFEST_VERSIONS.includes(v.version)) fail(code, `${path}.version`, 'expected 1 or 2');
  const v2 = v.version === 2;
  return {
    version: v.version,
    name: name(v.name, code, `${path}.name`),
    kind: oneOf(v.kind, PROJECT_KINDS, code, `${path}.kind`),
    environments: uniqueEnvNames(arr(v.environments, code, `${path}.environments`, { max: 16 }).map((e, i) => environment(e, code, `${path}.environments[${i}]`, v2)), code, `${path}.environments`),
    services: arr(v.services, code, `${path}.services`, { max: 32 }).map((s, i) => service(s, code, `${path}.services[${i}]`, false, v2)),
    surfaces: arr(v.surfaces, code, `${path}.surfaces`, { max: 64 }).map((s, i) => surface(s, code, `${path}.surfaces[${i}]`, false, v2)),
  };
}
// True when a manifest-shaped value uses a field that needs version 2.
export const needsManifestV2 = m => [...(m?.environments ?? []), ...(m?.services ?? [])].some(x => own(x, 'app') !== undefined) ||
  (m?.surfaces ?? []).some(s => own(s, 'prominence') !== undefined);
function contextMetadata(v, code, path) {
  keys(v, code, path, ['version', 'workspace_uuid', 'type', 'organization_uuid', 'project_id', 'engine_preference', 'updated_at']);
  if (v.version !== 1) fail(code, `${path}.version`, 'expected 1');
  const out = {
    version: 1,
    workspace_uuid: workspaceUuid(v.workspace_uuid, code, `${path}.workspace_uuid`),
    type: oneOf(v.type, CONTEXT_TYPES, code, `${path}.type`),
    organization_uuid: nullable(v.organization_uuid, x => workspaceUuid(x, code, `${path}.organization_uuid`)),
    project_id: nullable(v.project_id, x => str(x, code, `${path}.project_id`, { pattern: PROJECT_ID })),
    engine_preference: nullable(v.engine_preference, x => oneOf(x, ['firefox', 'chromium'], code, `${path}.engine_preference`)),
    updated_at: timestamp(v.updated_at, code, `${path}.updated_at`),
  };
  // Projects may live in any space (store v2: projects[].context_uuid). The
  // per-context project_id is a deprecated mirror and no longer tied to a type.
  if (out.type !== 'project' && out.organization_uuid !== null) fail(code, path, 'organization_uuid is only allowed for type project');
  if (out.organization_uuid !== null && out.organization_uuid === out.workspace_uuid) fail(code, `${path}.organization_uuid`, 'a context cannot belong to itself');
  return out;
}
function project(v, code, path) {
  keys(v, code, path, ['version', 'id', 'root', 'manifest', 'manifest_state', 'context_uuid', 'trusted', 'created_at', 'updated_at']);
  if (v.version !== 1) fail(code, `${path}.version`, 'expected 1');
  const root = str(v.root, code, `${path}.root`, { min: 2, max: 4096, pattern: /^\// });
  if (root.includes('\u0000')) fail(code, `${path}.root`, 'NUL in path');
  if (v.trusted !== false) fail(code, `${path}.trusted`, 'must be false in M1');
  return {
    version: 1,
    id: str(v.id, code, `${path}.id`, { pattern: PROJECT_ID }),
    root,
    manifest: manifest(v.manifest, code, `${path}.manifest`),
    manifest_state: oneOf(v.manifest_state, MANIFEST_STATES, code, `${path}.manifest_state`),
    context_uuid: nullable(v.context_uuid, x => workspaceUuid(x, code, `${path}.context_uuid`)),
    trusted: false,
    created_at: timestamp(v.created_at, code, `${path}.created_at`),
    updated_at: timestamp(v.updated_at, code, `${path}.updated_at`),
  };
}
// Store version 1: a context links at most one project via contexts[].project_id.
// Store version 2: projects[].context_uuid is authoritative and a space may hold
// several projects; contexts[].project_id is a deprecated mirror that must be
// null or point at a project whose context_uuid is that same space.
function contextStore(v, code, path) {
  keys(v, code, path, ['version', 'contexts', 'projects']);
  if (v.version !== 1 && v.version !== 2) fail(code, `${path}.version`, 'expected 1 or 2');
  const contexts = arr(v.contexts, code, `${path}.contexts`, { max: 512 }).map((c, i) => contextMetadata(c, code, `${path}.contexts[${i}]`));
  const projects = arr(v.projects, code, `${path}.projects`, { max: 512 }).map((p, i) => project(p, code, `${path}.projects[${i}]`));
  unique(contexts, c => c.workspace_uuid, code, `${path}.contexts`);
  unique(projects, p => p.id, code, `${path}.projects`);
  if (v.version === 2) {
    contexts.forEach((c, i) => {
      if (c.project_id === null) return;
      const p = projects.find(x => x.id === c.project_id);
      if (!p || p.context_uuid !== c.workspace_uuid) fail(code, `${path}.contexts[${i}].project_id`, 'must be null or mirror a project whose context_uuid is this space');
    });
  }
  return { version: v.version, contexts, projects };
}
function detectionDraft(v, code, path) {
  keys(v, code, path, ['version', 'name', 'kind', 'kind_source', 'environments', 'services', 'surfaces', 'frameworks', 'files_read', 'refused', 'warnings']);
  if (v.version !== 1) fail(code, `${path}.version`, 'expected 1');
  keys(v.kind_source, code, `${path}.kind_source`, ['source', 'guess']);
  return {
    version: 1,
    name: name(v.name, code, `${path}.name`),
    kind: oneOf(v.kind, PROJECT_KINDS, code, `${path}.kind`),
    kind_source: provenance(v.kind_source, code, `${path}.kind_source`),
    environments: uniqueEnvNames(arr(v.environments, code, `${path}.environments`, { max: 16 }).map((e, i) => {
      const p = `${path}.environments[${i}]`; keys(e, code, p, ['name', 'base_url', 'source', 'guess'], ['app']);
      const { source: _s, guess: _g, ...plain } = e;
      return { ...environment(plain, code, p, true), ...provenance(e, code, p) };
    }), code, `${path}.environments`),
    services: arr(v.services, code, `${path}.services`, { max: 32 }).map((s, i) => service(s, code, `${path}.services[${i}]`, true)),
    surfaces: arr(v.surfaces, code, `${path}.surfaces`, { max: 64 }).map((s, i) => surface(s, code, `${path}.surfaces[${i}]`, true)),
    frameworks: arr(v.frameworks, code, `${path}.frameworks`).map((f, i) => str(f, code, `${path}.frameworks[${i}]`, { max: 64 })),
    files_read: arr(v.files_read, code, `${path}.files_read`).map((f, i) => str(f, code, `${path}.files_read[${i}]`)),
    refused: arr(v.refused, code, `${path}.refused`).map((r, i) => {
      const p = `${path}.refused[${i}]`; keys(r, code, p, ['path', 'reason']);
      return { path: str(r.path, code, `${p}.path`), reason: oneOf(r.reason, REFUSAL_REASONS, code, `${p}.reason`) };
    }),
    warnings: arr(v.warnings, code, `${path}.warnings`).map((w, i) => str(w, code, `${path}.warnings[${i}]`, { max: 256 })),
  };
}

export const validateContextMetadata = v => deepFreeze(contextMetadata(v, 'INVALID_CONTEXT', '$'));
export const validateProject = v => deepFreeze(project(v, 'INVALID_PROJECT', '$'));
export const validateManifest = v => deepFreeze(manifest(v, 'INVALID_MANIFEST', '$'));
export const validateContextStore = v => deepFreeze(contextStore(v, 'INVALID_CONTEXT_STORE', '$'));
export const validateDetectionDraft = v => deepFreeze(detectionDraft(v, 'INVALID_DRAFT', '$'));
export const DEFAULT_CONTEXT_STORE = deepFreeze({ version: CONTEXT_STORE_VERSION, contexts: [], projects: [] });

// Pure, idempotent migration of a stored contexts.json value to version 2.
// A v1 link contexts[].project_id moves to projects[].context_uuid when the
// project has no space yet; a project that already names a space keeps it
// (projects[].context_uuid was always written together with the link). Links
// to unknown projects are dropped. Every contexts[].project_id becomes null.
// No record is otherwise changed (updated_at stays as it was).
export function migrateContextStore(store) {
  const s = validateContextStore(store);
  if (s.version === 2) return s;
  const target = new Map();
  for (const c of s.contexts) if (c.project_id !== null && !target.has(c.project_id)) target.set(c.project_id, c.workspace_uuid);
  return validateContextStore({
    version: 2,
    contexts: s.contexts.map(c => (c.project_id === null ? c : { ...c, project_id: null })),
    projects: s.projects.map(p => (p.context_uuid === null && target.has(p.id) ? { ...p, context_uuid: target.get(p.id) } : p)),
  });
}

// Projects that live in a space, in stored order (v1 or v2 store).
export function projectsInContext(store, contextUuid) {
  const projects = Array.isArray(store?.projects) ? store.projects : [];
  const mirrored = new Set((Array.isArray(store?.contexts) ? store.contexts : [])
    .filter(c => c?.workspace_uuid === contextUuid && c.project_id).map(c => c.project_id));
  return Object.freeze(projects.filter(p => p && (p.context_uuid === contextUuid || (p.context_uuid === null && mirrored.has(p.id)))));
}

// ---- site-rule-v1 ----

function allowedWindow(v, code, path) {
  keys(v, code, path, ['start', 'end'], ['days']);
  const out = { start: str(v.start, code, `${path}.start`, { pattern: TIME }), end: str(v.end, code, `${path}.end`, { pattern: TIME }) };
  if (Object.prototype.hasOwnProperty.call(v, 'days')) {
    out.days = unique(arr(v.days, code, `${path}.days`, { min: 1, max: 7 }).map((d, i) => int(d, code, `${path}.days[${i}]`, 0, 6)), d => d, code, `${path}.days`);
  }
  return out;
}
function ruleContexts(v, code, path) {
  if (v === 'all') return 'all';
  if (!isPlainObject(v) || Object.keys(v).length < 1) fail(code, path, 'expected "all" or a non-empty selector');
  keys(v, code, path, [], ['types', 'workspaces']);
  const out = {};
  if ('types' in v) out.types = unique(arr(v.types, code, `${path}.types`, { min: 1 }).map((t, i) => oneOf(t, CONTEXT_TYPES, code, `${path}.types[${i}]`)), t => t, code, `${path}.types`);
  if ('workspaces' in v) out.workspaces = unique(arr(v.workspaces, code, `${path}.workspaces`, { min: 1, max: 64 }).map((w, i) => workspaceUuid(w, code, `${path}.workspaces[${i}]`)), w => w, code, `${path}.workspaces`);
  return out;
}
function siteRule(v, code, path) {
  keys(v, code, path, ['version', 'id', 'enabled', 'match', 'contexts', 'instruction', 'limits', 'observation', 'observation_raised_hosts', 'effects', 'override', 'agents', 'created_at', 'updated_at']);
  if (v.version !== 1) fail(code, `${path}.version`, 'expected 1');
  keys(v.match, code, `${path}.match`, ['hosts']);
  const hosts = unique(arr(v.match.hosts, code, `${path}.match.hosts`, { min: 1, max: 32 }).map((h, i) => hostPattern(h, code, `${path}.match.hosts[${i}]`)), h => h, code, `${path}.match.hosts`);
  keys(v.limits, code, `${path}.limits`, ['daily_minutes', 'allowed_hours']);
  const raised = unique(arr(v.observation_raised_hosts, code, `${path}.observation_raised_hosts`, { max: 32 }).map((h, i) => hostPattern(h, code, `${path}.observation_raised_hosts[${i}]`)), h => h, code, `${path}.observation_raised_hosts`);
  raised.forEach((h, i) => { if (!hosts.includes(h)) fail(code, `${path}.observation_raised_hosts[${i}]`, 'must also appear in match.hosts'); });
  keys(v.agents, code, `${path}.agents`, ['access', 'instruction']);
  return {
    version: 1,
    id: str(v.id, code, `${path}.id`, { pattern: RULE_ID }),
    enabled: bool(v.enabled, code, `${path}.enabled`),
    match: { hosts },
    contexts: ruleContexts(v.contexts, code, `${path}.contexts`),
    instruction: str(v.instruction, code, `${path}.instruction`, { max: 2000 }),
    limits: {
      daily_minutes: nullable(v.limits.daily_minutes, x => int(x, code, `${path}.limits.daily_minutes`, 1, 1440)),
      allowed_hours: nullable(v.limits.allowed_hours, x => arr(x, code, `${path}.limits.allowed_hours`, { min: 1, max: 8 }).map((w, i) => allowedWindow(w, code, `${path}.limits.allowed_hours[${i}]`))),
    },
    observation: oneOf(v.observation, OBSERVATIONS, code, `${path}.observation`),
    observation_raised_hosts: raised,
    effects: unique(arr(v.effects, code, `${path}.effects`, { max: 3 }).map((e, i) => oneOf(e, EFFECTS, code, `${path}.effects[${i}]`)), e => e, code, `${path}.effects`),
    override: oneOf(v.override, OVERRIDES, code, `${path}.override`),
    agents: { access: oneOf(v.agents.access, AGENT_ACCESS, code, `${path}.agents.access`), instruction: str(v.agents.instruction, code, `${path}.agents.instruction`, { max: 2000 }) },
    created_at: timestamp(v.created_at, code, `${path}.created_at`),
    updated_at: timestamp(v.updated_at, code, `${path}.updated_at`),
  };
}
function ruleStore(v, code, path) {
  keys(v, code, path, ['version', 'rules', 'jev']);
  if (v.version !== 1) fail(code, `${path}.version`, 'expected 1');
  const rules = unique(arr(v.rules, code, `${path}.rules`, { max: 256 }).map((r, i) => siteRule(r, code, `${path}.rules[${i}]`)), r => r.id, code, `${path}.rules`);
  keys(v.jev, code, `${path}.jev`, ['consent', 'interval_minutes', 'hourly_budget']);
  return { version: 1, rules, jev: {
    consent: bool(v.jev.consent, code, `${path}.jev.consent`),
    interval_minutes: int(v.jev.interval_minutes, code, `${path}.jev.interval_minutes`, 1, 30),
    hourly_budget: int(v.jev.hourly_budget, code, `${path}.jev.hourly_budget`, 0, 30),
  } };
}
export function isCalendarDay(s) {
  if (typeof s !== 'string' || !DAY.test(s)) return false;
  const [y, m, d] = s.split('-').map(Number);
  return m >= 1 && m <= 12 && d >= 1 && d <= daysInMonth(y, m);
}
export const daysInMonth = (y, m) => [31, (y % 4 === 0 && y % 100 !== 0) || y % 400 === 0 ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31][m - 1];
function ledgerRecord(v, code, path) {
  keys(v, code, path, ['day', 'host', 'context_uuid', 'foreground_ms']);
  if (!isCalendarDay(v.day)) fail(code, `${path}.day`, 'expected a calendar day YYYY-MM-DD');
  return {
    day: v.day,
    host: str(v.host, code, `${path}.host`, { max: 253, pattern: LEDGER_HOST }),
    context_uuid: nullable(v.context_uuid, x => workspaceUuid(x, code, `${path}.context_uuid`)),
    foreground_ms: int(v.foreground_ms, code, `${path}.foreground_ms`, 0, 86400000),
  };
}
export const ledgerKey = r => `${r.day}\u0000${r.host}\u0000${r.context_uuid ?? ''}`;
function ledger(v, code, path) {
  keys(v, code, path, ['version', 'retention_days', 'records']);
  if (v.version !== 1) fail(code, `${path}.version`, 'expected 1');
  const records = arr(v.records, code, `${path}.records`, { max: 200000 }).map((r, i) => Object.isFrozen(r) ? ledgerRecord(r, code, `${path}.records[${i}]`) && r : ledgerRecord(r, code, `${path}.records[${i}]`));
  unique(records, ledgerKey, code, `${path}.records`);
  return { version: 1, retention_days: int(v.retention_days, code, `${path}.retention_days`, 1, 365), records };
}
function evaluation(v, code, path) {
  keys(v, code, path, ['rule_id', 'effect', 'source', 'reason_code']);
  const out = {
    rule_id: str(v.rule_id, code, `${path}.rule_id`, { pattern: RULE_ID }),
    effect: oneOf(v.effect, OUTCOMES, code, `${path}.effect`),
    source: oneOf(v.source, ['deterministic', 'jev'], code, `${path}.source`),
    reason_code: nullable(v.reason_code, x => oneOf(x, REASON_CODES, code, `${path}.reason_code`)),
  };
  if (out.effect === 'none' && out.reason_code !== null) fail(code, `${path}.reason_code`, 'effect none has reason_code null');
  return out;
}
function suppression(v, code, path) {
  keys(v, code, path, ['rule_id', 'context_uuid', 'effect', 'until']);
  return {
    rule_id: str(v.rule_id, code, `${path}.rule_id`, { pattern: RULE_ID }),
    context_uuid: nullable(v.context_uuid, x => workspaceUuid(x, code, `${path}.context_uuid`)),
    effect: oneOf(v.effect, EFFECTS, code, `${path}.effect`),
    until: timestamp(v.until, code, `${path}.until`),
  };
}

export const validateSiteRule = v => deepFreeze(siteRule(v, 'INVALID_RULE', '$'));
export const validateRuleStore = v => deepFreeze(ruleStore(v, 'INVALID_RULE_STORE', '$'));
export const validateLedgerRecord = v => deepFreeze(ledgerRecord(v, 'INVALID_LEDGER', '$'));
export const validateLedger = v => deepFreeze(ledger(v, 'INVALID_LEDGER', '$'));
export const validateEvaluation = v => deepFreeze(evaluation(v, 'INVALID_EVALUATION', '$'));
export const validateSuppression = v => deepFreeze(suppression(v, 'INVALID_SUPPRESSION', '$'));
export const isWorkspaceUuid = v => typeof v === 'string' && UUID.test(v) && v.startsWith('{') === v.endsWith('}');
export const isRuleId = v => typeof v === 'string' && RULE_ID.test(v);

export const DEFAULT_RULE_STORE = deepFreeze({ version: 1, rules: [], jev: { consent: false, interval_minutes: 5, hourly_budget: 30 } });
export const DEFAULT_LEDGER = deepFreeze({ version: 1, retention_days: 90, records: [] });

// A new rule with the contract defaults. `hosts` is optional so the editor can
// start from a template: with no hosts the result is a frozen draft that does
// not yet pass validateSiteRule (match.hosts needs at least one entry).
export function newRule({ now, id, hosts = [] } = {}) {
  timestamp(now, 'INVALID_INPUT', '$.now');
  str(id, 'INVALID_INPUT', '$.id', { pattern: RULE_ID });
  const rule = {
    version: 1, id, enabled: true, match: { hosts: [...arr(hosts, 'INVALID_INPUT', '$.hosts')] }, contexts: 'all', instruction: '',
    limits: { daily_minutes: null, allowed_hours: null }, observation: 'none', observation_raised_hosts: [],
    effects: ['nudge'], override: 'confirm', agents: { access: 'none', instruction: '' }, created_at: now, updated_at: now,
  };
  return rule.match.hosts.length ? validateSiteRule(rule) : deepFreeze(rule);
}
