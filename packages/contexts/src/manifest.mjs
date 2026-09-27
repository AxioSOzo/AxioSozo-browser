/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. https://mozilla.org/MPL/2.0/ */
import { ContextsError } from './errors.mjs';
import { isPlainObject, own, stripQueryAndFragment, utf8Length, validateDetectionDraft, validateManifest } from './schema.mjs';

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

const ordered = m => ({
  version: 1, name: m.name, kind: m.kind,
  environments: m.environments.map(e => ({ name: e.name, base_url: e.base_url })),
  services: m.services.map(s => ({ name: s.name, url: s.url, port: s.port })),
  surfaces: m.surfaces.map(s => ({ name: s.name, url: s.url, kind: s.kind })),
});

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
export function draftToManifest(draft, edits = {}) {
  const d = validateDetectionDraft(stripDraftUrls(draft));
  if (!isPlainObject(edits)) throw new ContextsError('INVALID_INPUT', '$.edits: expected an object', '$.edits');
  for (const k of Object.keys(edits)) if (!['name', 'kind', 'environments', 'services', 'surfaces'].includes(k)) throw new ContextsError('INVALID_INPUT', `$.edits.${k}: unknown key`, `$.edits.${k}`);
  const pick = (k, fallback) => own(edits, k) !== undefined ? own(edits, k) : fallback;
  const m = validateManifest(ordered({
    name: pick('name', d.name), kind: pick('kind', d.kind),
    environments: pick('environments', d.environments), services: pick('services', d.services), surfaces: pick('surfaces', d.surfaces),
  }));
  return assertNoSecrets(m);
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
