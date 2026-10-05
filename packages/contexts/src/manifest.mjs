/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. https://mozilla.org/MPL/2.0/ */
import { ContextsError } from './errors.mjs';
import {
  PRIMARY_SURFACE_KINDS, environmentKey, isPlainObject, needsManifestV2, needsManifestV3, own, stripQueryAndFragment, utf8Length, validateBaseUrl,
  validateDetectionDraft, validateManifest,
} from './schema.mjs';

// The repository manifest `.axiosozo/project.json`: names, URLs, ports and
// surfaces a team can commit. It never holds secrets, credentials or local paths.

export const MANIFEST_PATH = '.axiosozo/project.json';
const MAX_MANIFEST_BYTES = 262144;

// Query parameter names and value shapes that indicate a credential. Data only.
const SECRET_PARAMS = /^(access[_-]?token|api[_-]?key|apikey|auth|authorization|client[_-]?secret|code|id[_-]?token|key|pass|passwd|password|private[_-]?token|pwd|refresh[_-]?token|secret|session|sig|signature|token|x-amz-signature|x-amz-credential)$/i;
const SECRET_VALUES = [
  /-----BEGIN [A-Z ]*PRIVATE KEY-----/,
  /\bgh[pousr]_[A-Za-z0-9]{20,}/, /\bgithub_pat_[A-Za-z0-9_]{20,}/, /\bglpat-[A-Za-z0-9_-]{16,}/,
  /\bsk-[A-Za-z0-9_-]{16,}/, /\bxox[abprs]-[A-Za-z0-9-]{10,}/, /\bAKIA[0-9A-Z]{16}\b/,
  /\beyJ[A-Za-z0-9_-]{8,}\.eyJ[A-Za-z0-9_-]{8,}\./, /\b(sk|rk)_(live|test)_[A-Za-z0-9]{10,}/, /\bnpm_[A-Za-z0-9]{30,}/,
];
const LOCAL_PATH = /^(\/(Users|home|root|private|var|tmp|Volumes)\/|~[/\\]|[A-Za-z]:[\\/]|file:)/;

// Throws MANIFEST_SECRET if any string looks like a credential, a URL carries a
// credential-like query parameter, or a value is an absolute local path.
export function assertNoSecrets(manifest) {
  const visit = (v, path) => {
    if (typeof v === 'string') {
      if (SECRET_VALUES.some(re => re.test(v))) throw new ContextsError('MANIFEST_SECRET', `${path}: looks like a credential`, path);
      if (LOCAL_PATH.test(v)) throw new ContextsError('MANIFEST_SECRET', `${path}: absolute local paths are not allowed`, path);
      if (/^https?:\/\//i.test(v)) {
        let u; try { u = new URL(v); } catch { return; }
        if (u.username || u.password) throw new ContextsError('MANIFEST_SECRET', `${path}: URL userinfo is not allowed`, path);
        for (const key of u.searchParams.keys()) if (SECRET_PARAMS.test(key)) throw new ContextsError('MANIFEST_SECRET', `${path}: credential-like query parameter`, path);
      }
    } else if (Array.isArray(v)) v.forEach((x, i) => visit(x, `${path}[${i}]`));
    else if (v && typeof v === 'object') for (const k of Object.keys(v)) visit(v[k], `${path}.${k}`);
  };
  visit(manifest, '$');
  return manifest;
}

// Stable key order. Optional v2/v3 fields are emitted only when present; the
// version is raised exactly as far as the fields need (never lowered).
const opt = (key, v) => (v === undefined ? {} : { [key]: v });
const ordered = m => {
  const out = {
    name: m.name, kind: m.kind, ...opt('icon', own(m, 'icon')),
    environments: m.environments.map(e => ({ name: e.name, ...opt('app', own(e, 'app')), base_url: e.base_url })),
    services: m.services.map(s => ({ name: s.name, ...opt('app', own(s, 'app')), ...opt('url', own(s, 'url')), ...opt('port', own(s, 'port')),
      ...opt('command', own(s, 'command')), ...opt('cwd', own(s, 'cwd')) })),
    surfaces: m.surfaces.map(s => ({ name: s.name, url: s.url, kind: s.kind, ...opt('prominence', own(s, 'prominence')) })),
  };
  const needed = needsManifestV3(out) ? 3 : needsManifestV2(out) ? 2 : 1;
  return { version: Math.max(needed, [1, 2, 3].includes(m.version) ? m.version : 1), ...out };
};
// Drafts carry an explicit prominence on every surface; a manifest keeps it
// only where it differs from the default for the kind.
const defaultProminence = kind => (PRIMARY_SURFACE_KINDS.includes(kind) ? 'primary' : 'secondary');
const draftSurface = ({ name, url, kind, prominence }) => ({ name, url, kind, ...(prominence && prominence !== defaultProminence(kind) ? { prominence } : {}) });
const plain = ({ source: _s, guess: _g, ...rest }) => rest;
const mapList = (v, fn) => (Array.isArray(v) ? v.map(fn) : v);

// Drafts made before service/surface URLs lost their query and fragment are
// normalized the same way detection does now; only http(s) strings change.
const stripDraftUrls = draft => {
  if (!isPlainObject(draft)) return draft;
  const strip = list => Array.isArray(list)
    ? list.map(item => (isPlainObject(item) && typeof item.url === 'string' ? { ...item, url: stripQueryAndFragment(item.url) } : item)) : list;
  return { ...draft, services: strip(draft.services), surfaces: strip(draft.surfaces) };
};

// Confirm a detection draft into a manifest. `edits` may replace name, kind,
// environments, services or surfaces (manifest shapes, no source/guess). Draft
// URLs lose any query or fragment; edited URLs with one are rejected.
//
// `edits.icon` replaces the detected icon path (null for none).
//
// `edits.production_url` is the optional "Production URL" field of the review
// UI: a string (for the project's main web app), `{ [app]: url }` for
// multi-app projects, or null/"" for none. It is applied after the other edits
// and replaces a detected production environment of the same app.
export function draftToManifest(draft, edits = {}) {
  const d = validateDetectionDraft(stripDraftUrls(draft));
  if (!isPlainObject(edits)) throw new ContextsError('INVALID_INPUT', '$.edits: expected an object', '$.edits');
  for (const k of Object.keys(edits)) if (!['name', 'kind', 'icon', 'environments', 'services', 'surfaces', 'production_url'].includes(k)) throw new ContextsError('INVALID_INPUT', `$.edits.${k}: unknown key`, `$.edits.${k}`);
  const pick = (k, fallback) => own(edits, k) !== undefined ? own(edits, k) : fallback;
  const icon = own(edits, 'icon') !== undefined ? own(edits, 'icon') : own(d, 'icon')?.path ?? null;
  let m = validateManifest(ordered({
    name: pick('name', d.name), kind: pick('kind', d.kind), ...(icon === null ? {} : { icon }),
    environments: pick('environments', d.environments.map(plain)), services: pick('services', d.services.map(plain)),
    surfaces: mapList(pick('surfaces', d.surfaces), s => (isPlainObject(s) ? draftSurface(s) : s)),
  }));
  const prod = own(edits, 'production_url');
  if (typeof prod === 'string' && prod.trim()) m = withProductionUrl(m, prod.trim(), { app: mainWebApp(m) });
  else if (isPlainObject(prod)) for (const [app, url] of Object.entries(prod)) { if (typeof url === 'string' && url.trim()) m = withProductionUrl(m, url.trim(), { app }); }
  else if (prod !== undefined && prod !== null && prod !== '') throw new ContextsError('INVALID_INPUT', '$.edits.production_url: expected a URL, { app: URL } or null', '$.edits.production_url');
  return assertNoSecrets(m);
}

// The app a single "Production URL" belongs to: the first app with a local
// environment that is not a desktop shell, else none (project-wide).
export function mainWebApp(manifest) {
  const envs = Array.isArray(manifest?.environments) ? manifest.environments : [];
  if (!envs.some(e => own(e, 'app') !== undefined)) return undefined;
  const local = envs.filter(e => e.name === 'local' && own(e, 'app') !== undefined);
  return (local.find(e => e.app !== 'desktop') ?? local[0])?.app;
}

// Adds or replaces the production environment of `app` (absent = project-wide).
// The URL must be a valid base URL (http(s), no userinfo, query or fragment).
export function withProductionUrl(manifest, url, { app } = {}) {
  const m = validateManifest(manifest);
  let base;
  try { base = validateBaseUrl(url); } catch (e) { throw new ContextsError('INVALID_INPUT', `$.production_url: ${e.message.replace(/^\$: /, '')}`, '$.production_url'); }
  const env = { name: 'production', ...(app === undefined || app === null ? {} : { app }), base_url: base };
  const key = environmentKey(env);
  const environments = m.environments.some(e => environmentKey(e) === key)
    ? m.environments.map(e => (environmentKey(e) === key ? env : e)) : [...m.environments, env];
  return assertNoSecrets(validateManifest(ordered({ ...m, environments })));
}

export function parseManifest(text) {
  if (typeof text !== 'string') throw new ContextsError('INVALID_MANIFEST', '$: expected text', '$');
  if (utf8Length(text) > MAX_MANIFEST_BYTES) throw new ContextsError('INVALID_MANIFEST', '$: manifest larger than 256 KiB', '$');
  let value;
  try { value = JSON.parse(text); } catch { throw new ContextsError('INVALID_MANIFEST', '$: not valid JSON', '$'); }
  return assertNoSecrets(validateManifest(value));
}

export function serializeManifest(manifest) {
  return `${JSON.stringify(ordered(assertNoSecrets(validateManifest(manifest))), null, 2)}\n`;
}

// How a confirmed project should record its manifest: a draft built from an
// existing `.axiosozo/project.json` is "external", anything else "none".
export function draftManifestState(draft) {
  return validateDetectionDraft(draft).kind_source.source === MANIFEST_PATH ? 'external' : 'none';
}
