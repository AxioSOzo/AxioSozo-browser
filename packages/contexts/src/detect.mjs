/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. https://mozilla.org/MPL/2.0/ */
import { ContextsError } from './errors.mjs';
import { ENV_ORDER } from './environments.mjs';
import { MANIFEST_PATH, parseManifest } from './manifest.mjs';
import {
  REFUSAL_REASONS, SURFACE_KINDS, clip, deepFreeze, environmentKey, isPlainObject, own, surfaceProminence, trimTrailing, utf8Length,
  validateBaseUrl, validateDetectionDraft, validateHostPattern, validateWebUrl, stripQueryAndFragment,
} from './schema.mjs';

// Static project detection (handoff 3 §6.1). Works only on file contents the
// caller supplies; never reads, lists or executes anything. Every parser here
// tolerates hostile input: failures become warnings, never exceptions.

export const MAX_FILE_BYTES = 262144;
export const DETECTION_FILES = Object.freeze([
  'package.json', '.vercel/project.json', 'vercel.json', 'netlify.toml', 'wrangler.toml', 'wrangler.json',
  'fly.toml', 'docker-compose.yml', 'docker-compose.yaml', 'compose.yml', 'compose.yaml',
  'src-tauri/tauri.conf.json', 'tauri.conf.json', 'electron-builder.json', 'electron-builder.yml',
  'Cargo.toml', 'pyproject.toml', 'go.mod', '.git/config', '.axiosozo/project.json',
  'pnpm-workspace.yaml', 'lerna.json', 'turbo.json', 'nx.json',
]);
const ALLOWED = new Set(DETECTION_FILES);
export const isAllowedPath = rel => typeof rel === 'string' && ALLOWED.has(rel);

// Reader policy shared with the chrome reader: given what lstat/realpath found
// for an allowlisted `path`, returns null (may read) or a refusal reason.
// `resolvedPath` is the real path relative to the real root, or null when it
// resolves outside the root. A symlink is followed only to another allowlisted
// path inside the root, so `package.json -> .env` is refused too.
export function detectionRefusal({ path, resolvedPath, isFile, size } = {}) {
  if (!isAllowedPath(path)) return 'not_allowlisted';
  if (resolvedPath === null || resolvedPath === undefined) return 'symlink_outside_root';
  if (!isAllowedPath(resolvedPath)) return 'not_allowlisted';
  if (isFile !== true) return 'not_regular_file';
  if (!Number.isSafeInteger(size) || size < 0 || size > MAX_FILE_BYTES) return 'too_large';
  return null;
}

const BAD_KEYS = new Set(['__proto__', 'constructor', 'prototype']);
const MAX_DEPTH = 32;
const MAX_WARNINGS = 50;

// ---------------------------------------------------------------- TOML ----

// Minimal TOML 1.0 reader: tables, arrays of tables, dotted and quoted keys,
// all string forms, numbers, booleans, dates (kept as strings), arrays and
// inline tables. A bad statement is reported and skipped.
export function parseToml(text) {
  const root = {}, errors = [], n = text.length;
  let i = 0, line = 1, table = root;
  const err = msg => { throw new SyntaxError(`line ${line}: ${msg}`); };
  const skipWs = () => { while (text[i] === ' ' || text[i] === '\t') i++; };
  const skipComment = () => { if (text[i] === '#') while (i < n && text[i] !== '\n') i++; };
  const skipWsNl = () => {
    for (;;) {
      skipWs(); skipComment();
      if (text[i] === '\n') { i++; line++; } else if (text[i] === '\r' && text[i + 1] === '\n') { i += 2; line++; } else return;
    }
  };
  const eol = () => { skipWs(); skipComment(); if (i < n && text[i] !== '\n' && text[i] !== '\r') err('expected end of line'); };
  const BARE = /[A-Za-z0-9_-]+/y, TOKEN = /[^\s,\]}#]+/y;
  const keyPart = () => {
    if (text[i] === '"') return basic();
    if (text[i] === "'") return literal();
    BARE.lastIndex = i; const m = BARE.exec(text); if (!m) err('invalid key');
    i += m[0].length; return m[0];
  };
  const dottedKey = () => {
    const parts = [];
    for (;;) { skipWs(); const k = keyPart(); if (BAD_KEYS.has(k)) err('forbidden key'); parts.push(k); skipWs(); if (text[i] !== '.') return parts; i++; }
  };
  const ESC = { b: '\b', t: '\t', n: '\n', f: '\f', r: '\r', e: '\u001b', '"': '"', '\\': '\\' };
  function basic() {
    const multi = text.startsWith('"""', i); let out = '';
    i += multi ? 3 : 1;
    if (multi && text[i] === '\n') { i++; line++; } else if (multi && text.startsWith('\r\n', i)) { i += 2; line++; }
    for (;;) {
      if (i >= n) err('unterminated string');
      const c = text[i];
      if (multi && text.startsWith('"""', i)) { i += 3; while (text[i] === '"' && out.length < n) { out += '"'; i++; } return out; }
      if (!multi && c === '"') { i++; return out; }
      if (!multi && c === '\n') err('newline in string');
      if (c === '\\') {
        const e = text[i + 1];
        if (multi && /[ \t\r\n]/.test(e)) { i++; while (/[ \t\r\n]/.test(text[i] ?? '')) { if (text[i] === '\n') line++; i++; } continue; }
        if (e in ESC) { out += ESC[e]; i += 2; continue; }
        const len = e === 'u' ? 4 : e === 'U' ? 8 : 0;
        const hex = len && text.slice(i + 2, i + 2 + len);
        if (!len || !/^[0-9A-Fa-f]+$/.test(hex) || hex.length !== len) err('invalid escape');
        const cp = parseInt(hex, 16); if (cp > 0x10ffff || (cp >= 0xd800 && cp <= 0xdfff)) err('invalid escape');
        out += String.fromCodePoint(cp); i += 2 + len; continue;
      }
      if (c === '\n') line++;
      out += c; i++;
    }
  }
  function literal() {
    const multi = text.startsWith("'''", i); i += multi ? 3 : 1;
    if (multi && text[i] === '\n') { i++; line++; } else if (multi && text.startsWith('\r\n', i)) { i += 2; line++; }
    const close = multi ? "'''" : "'", end = text.indexOf(close, i);
    if (end < 0) err('unterminated string');
    let out = text.slice(i, end);
    if (!multi && out.includes('\n')) err('newline in string');
    i = end + close.length;
    if (multi) while (text[i] === "'") { out += "'"; i++; }
    line += out.split('\n').length - 1;
    return out;
  }
  function scalar() {
    TOKEN.lastIndex = i; const m = TOKEN.exec(text); if (!m) err('expected a value');
    let tok = m[0]; i += tok.length;
    if (tok === 'true' || tok === 'false') return tok === 'true';
    if (/^[+-]?(0|[1-9](_?[0-9])*)$/.test(tok)) return Number(tok.replaceAll('_', ''));
    if (/^0x[0-9A-Fa-f](_?[0-9A-Fa-f])*$/.test(tok)) return parseInt(tok.slice(2).replaceAll('_', ''), 16);
    if (/^0o[0-7](_?[0-7])*$/.test(tok)) return parseInt(tok.slice(2).replaceAll('_', ''), 8);
    if (/^0b[01](_?[01])*$/.test(tok)) return parseInt(tok.slice(2).replaceAll('_', ''), 2);
    if (/^[+-]?(inf|nan)$/.test(tok)) return tok.endsWith('inf') ? (tok[0] === '-' ? -Infinity : Infinity) : NaN;
    if (/^[+-]?[0-9](_?[0-9])*(\.[0-9](_?[0-9])*)?([eE][+-]?[0-9](_?[0-9])*)?$/.test(tok)) return Number(tok.replaceAll('_', ''));
    if (/^[0-9]{4}-[0-9]{2}-[0-9]{2}$/.test(tok) && / [0-9]{2}:/.test(text.slice(i, i + 4))) { TOKEN.lastIndex = i + 1; tok += ` ${TOKEN.exec(text)[0]}`; i = TOKEN.lastIndex; }
    if (/^([0-9]{4}-[0-9]{2}-[0-9]{2}|[0-9]{2}:[0-9]{2})/.test(tok)) return tok;
    return err('invalid value');
  }
  function value(depth) {
    if (depth > MAX_DEPTH) err('nesting too deep');
    const c = text[i];
    if (c === '"') return basic();
    if (c === "'") return literal();
    if (c === '[') {
      i++; const out = [];
      for (;;) {
        skipWsNl(); if (text[i] === ']') { i++; return out; }
        out.push(value(depth + 1)); skipWsNl();
        if (text[i] === ',') { i++; continue; }
        if (text[i] === ']') { i++; return out; }
        err('expected , or ] in array');
      }
    }
    if (c === '{') {
      i++; const out = {}; skipWs();
      if (text[i] === '}') { i++; return out; }
      for (;;) {
        const parts = dottedKey(); skipWs(); if (text[i] !== '=') err("expected '='"); i++; skipWs();
        setPath(out, parts, value(depth + 1)); skipWs();
        if (text[i] === ',') { i++; skipWs(); continue; }
        if (text[i] === '}') { i++; return out; }
        err('expected , or } in inline table');
      }
    }
    return scalar();
  }
  function setPath(obj, parts, v) {
    let t = obj;
    for (const k of parts.slice(0, -1)) {
      if (!Object.prototype.hasOwnProperty.call(t, k)) t[k] = {};
      else if (!isPlainObject(t[k])) err(`key ${k} is not a table`);
      t = t[k];
    }
    const last = parts.at(-1);
    if (Object.prototype.hasOwnProperty.call(t, last)) err(`duplicate key ${last}`);
    t[last] = v;
  }
  function openTable(parts, arrayTable) {
    let t = root;
    for (const k of parts.slice(0, -1)) {
      if (!Object.prototype.hasOwnProperty.call(t, k)) t[k] = {};
      let next = t[k];
      if (Array.isArray(next)) next = next.at(-1);
      if (!isPlainObject(next)) err(`key ${k} is not a table`);
      t = next;
    }
    const last = parts.at(-1);
    if (arrayTable) {
      if (!Object.prototype.hasOwnProperty.call(t, last)) t[last] = [];
      if (!Array.isArray(t[last])) err(`key ${last} is not an array of tables`);
      const fresh = {}; t[last].push(fresh); return fresh;
    }
    if (!Object.prototype.hasOwnProperty.call(t, last)) t[last] = {};
    if (!isPlainObject(t[last])) err(`key ${last} is not a table`);
    return t[last];
  }
  while (i < n) {
    skipWsNl(); if (i >= n) break;
    try {
      if (text[i] === '[') {
        const arrayTable = text[i + 1] === '[';
        i += arrayTable ? 2 : 1;
        table = {};
        const parts = dottedKey(); skipWs();
        if (arrayTable ? text.startsWith(']]', i) : text[i] === ']') i += arrayTable ? 2 : 1; else err('unterminated table header');
        table = openTable(parts, arrayTable); eol();
      } else {
        const parts = dottedKey(); skipWs();
        if (text[i] !== '=') err("expected '='");
        i++; skipWs();
        setPath(table, parts, value(0)); eol();
      }
    } catch (e) {
      errors.push(e instanceof SyntaxError ? e.message : `line ${line}: unreadable`);
      if (errors.length >= 20) { errors.push('too many errors; stopped'); break; }
      while (i < n && text[i] !== '\n') i++;
    }
  }
  return { value: root, errors };
}

// ---------------------------------------------------------------- YAML ----

// Block-style YAML subset for compose and electron-builder files: mappings,
// sequences, "- key: value" items, quoted/plain scalars, simple flow
// collections and block scalars. Anchors are dropped, aliases become null.
function stripYamlComment(line) {
  let quote = null;
  for (let i = 0; i < line.length; i++) {
    const c = line[i];
    if (quote) { if (c === '\\' && quote === '"') i++; else if (c === quote) quote = null; }
    else if (c === '"' || c === "'") { if (i === 0 || /[\s:\-[{,]/.test(line[i - 1])) quote = c; }
    else if (c === '#' && (i === 0 || /\s/.test(line[i - 1]))) return line.slice(0, i);
  }
  return line;
}
// Splits `key: value` with linear scans only (untrusted input, no backtracking).
function yamlKey(text) {
  let end;
  if (text[0] === '"' || text[0] === "'") {
    const q = text[0];
    let i = 1;
    for (; i < text.length; i++) {
      if (q === '"' && text[i] === '\\') { i++; continue; }
      if (text[i] === q) { if (q === "'" && text[i + 1] === "'") { i++; continue; } break; }
    }
    if (i >= text.length) return null;
    end = i + 1;
    let j = end;
    while (text[j] === ' ') j++;
    if (text[j] !== ':' || (j + 1 < text.length && !/\s/.test(text[j + 1]))) return null;
    return [text.slice(0, end), text.slice(j + 1).trim()];
  }
  if (/^[\s[{]/.test(text) || (text[0] === '-' && /^-(\s|:|$)/.test(text))) return null;
  for (let i = 0; i < text.length; i++) {
    if (text[i] === ':' && (i + 1 === text.length || /\s/.test(text[i + 1]))) {
      const key = text.slice(0, i).trimEnd();
      return key ? [key, text.slice(i + 1).trim()] : null;
    }
  }
  return null;
}
export function parseYaml(text) {
  const errors = [], lines = [];
  for (const [idx, raw] of text.split(/\r?\n/).entries()) {
    if (/^(---|\.\.\.)(\s|$)/.test(raw)) { if (lines.length) break; continue; }
    const content = stripYamlComment(raw).trimEnd();
    if (!content.trim()) continue;
    if (/^ *\t/.test(content)) { errors.push(`line ${idx + 1}: tab indentation`); continue; }
    lines.push({ indent: content.length - content.trimStart().length, text: content.trim(), no: idx + 1 });
  }
  let pos = 0;
  const isSeq = t => t === '-' || t.startsWith('- ');
  const unquote = s => s.startsWith('"') ? s.slice(1, -1).replace(/\\(["\\/nt])/g, (_, c) => ({ n: '\n', t: '\t' })[c] ?? c) : s.slice(1, -1).replaceAll("''", "'");
  function scalar(raw) {
    let s = raw.replace(/^(&\S+|!\S*)\s*/, '').replace(/^(&\S+|!\S*)\s*/, '');
    if (s.startsWith('*')) { errors.push('alias ignored'); return null; }
    if (/^"(?:[^"\\]|\\.)*"$/.test(s) || /^'(?:[^']|'')*'$/.test(s)) return unquote(s);
    if (s.startsWith('[') && s.endsWith(']')) return s.slice(1, -1).split(',').map(x => x.trim()).filter(Boolean).map(scalar);
    if (s.startsWith('{') && s.endsWith('}')) {
      const out = {};
      for (const part of s.slice(1, -1).split(',')) {
        const colon = part.indexOf(':'), key = colon > 0 ? part.slice(0, colon).trim() : '';
        if (key && !BAD_KEYS.has(key)) out[key] = scalar(part.slice(colon + 1).trim());
      }
      return out;
    }
    if (s === '' || s === '~' || s === 'null') return null;
    if (s === 'true' || s === 'false') return s === 'true';
    if (/^-?[0-9]+$/.test(s)) return Number(s);
    return s;
  }
  function node(depth) {
    if (depth > MAX_DEPTH) throw new SyntaxError('nesting too deep');
    return isSeq(lines[pos].text) ? seq(lines[pos].indent, depth) : map(lines[pos].indent, depth);
  }
  function seq(indent, depth) {
    const out = [];
    while (pos < lines.length && lines[pos].indent === indent && isSeq(lines[pos].text)) {
      const l = lines[pos], rest = l.text.slice(1).trimStart();
      if (!rest) { pos++; out.push(pos < lines.length && lines[pos].indent > indent ? node(depth + 1) : null); continue; }
      if (isSeq(rest) || yamlKey(rest)) {
        lines[pos] = { indent: indent + (l.text.length - rest.length), text: rest, no: l.no };
        out.push(node(depth + 1)); continue;
      }
      pos++; out.push(scalar(rest));
    }
    return out;
  }
  function map(indent, depth) {
    const out = {};
    while (pos < lines.length && lines[pos].indent >= indent) {
      const l = lines[pos];
      if (l.indent > indent || isSeq(l.text)) { if (l.indent === indent) break; errors.push(`line ${l.no}: unexpected indentation`); pos++; continue; }
      const m = yamlKey(l.text); pos++;
      if (!m) { errors.push(`line ${l.no}: expected "key: value"`); continue; }
      const key = /^["']/.test(m[0]) ? unquote(m[0]) : m[0], raw = m[1];
      let v = null;
      if (/^[|>][-+0-9]*$/.test(raw)) {
        const body = []; while (pos < lines.length && lines[pos].indent > indent) body.push(lines[pos++].text);
        v = body.join('\n');
      } else if (raw === '' || /^(&\S+|!\S*)$/.test(raw)) {
        const next = lines[pos];
        if (next && (next.indent > indent || (next.indent === indent && isSeq(next.text)))) v = node(depth + 1);
      } else v = scalar(raw);
      if (BAD_KEYS.has(key)) errors.push(`line ${l.no}: forbidden key`);
      else if (key !== '<<') out[key] = v;
    }
    return out;
  }
  let value = null;
  try {
    if (lines.length) {
      value = node(0);
      if (pos < lines.length) errors.push(`line ${lines[pos].no}: unexpected content`);
    }
  } catch (e) { errors.push(e instanceof SyntaxError ? e.message : 'unreadable'); value = null; }
  return { value, errors };
}

// ---------------------------------------------------------- git config ----

function gitValue(raw) {
  let out = '', quoted = false;
  for (let i = 0; i < raw.length; i++) {
    const c = raw[i];
    if (c === '\\' && i + 1 < raw.length) { out += raw[++i]; continue; }
    if (c === '"') { quoted = !quoted; continue; }
    if (!quoted && (c === '#' || c === ';')) break;
    out += c;
  }
  return out.trim();
}
// Only `[remote "name"] url = …` values are extracted; nothing else is kept.
export function gitRemoteUrls(text) {
  const remotes = [];
  let current = null;
  for (const raw of text.split(/\r?\n/)) {
    const line = raw.trim();
    if (!line || line[0] === '#' || line[0] === ';') continue;
    const sec = /^\[\s*([A-Za-z0-9.-]+)(?:\s+"((?:[^"\\]|\\.)*)")?\s*\]/.exec(line);
    if (sec) {
      const section = sec[1].toLowerCase();
      const name = sec[2] ?? (section.startsWith('remote.') ? sec[1].slice(7) : undefined);
      current = (section === 'remote' || section.startsWith('remote.')) && name ? { name, urls: [] } : null;
      if (current) remotes.push(current);
      continue;
    }
    const kv = current && /^([A-Za-z][A-Za-z0-9-]*)\s*=\s*(.*)$/.exec(line);
    if (kv && kv[1].toLowerCase() === 'url') current.urls.push(gitValue(kv[2]));
  }
  return remotes.filter(r => r.urls.length);
}

const SEGMENT = /^[A-Za-z0-9_.~-]{1,100}$/;
const plainHost = h => { try { return !h.startsWith('*') && validateHostPattern(h) === h; } catch { return false; } };

// Converts a clone URL to a web location. Userinfo is dropped here and never
// returned; `credentials` only says whether some was present.
export function remoteToWeb(raw) {
  if (typeof raw !== 'string' || raw.length > 2048 || /\s/.test(raw.trim())) return null;
  const s = raw.trim();
  let host, port = '', path, credentials = false;
  const scp = !/^[A-Za-z][A-Za-z0-9+.-]*:\/\//.test(s) && /^(?:([^@/:]+)@)?([A-Za-z0-9.-]+):(?!\/\/)([^\\]+)$/.exec(s);
  if (scp) { host = scp[2].toLowerCase(); path = scp[3]; }
  else {
    let u; try { u = new URL(s.replace(/^git\+/, '')); } catch { return null; }
    if (!['https:', 'http:', 'ssh:', 'git:', 'git+ssh:', 'ssh+git:'].includes(u.protocol)) return null;
    credentials = !!u.password || (!!u.username && ['https:', 'http:'].includes(u.protocol));
    host = u.hostname.toLowerCase();
    if (['https:', 'http:'].includes(u.protocol) && u.port) port = u.port;
    path = u.pathname;
  }
  if (!plainHost(host) || host.split('.').length < 2) return null;
  const segments = trimTrailing(path.replace(/^\/+/, ''), '/').replace(/\.git$/, '').split('/');
  if (!segments.length || segments.some(x => !SEGMENT.test(x) || x === '.' || x === '..')) return null;
  return { host, port, segments, credentials };
}

function forgeSurfaces({ host, port, segments }) {
  const base = `https://${host}${port ? `:${port}` : ''}/${segments.join('/')}`;
  const two = segments.length === 2;
  if ((host === 'github.com' || host.startsWith('github.')) && two) {
    return [['Repository', base, 'repository'], ['Issues', `${base}/issues`, 'issues'], ['CI', `${base}/actions`, 'ci'], ['Releases', `${base}/releases`, 'releases']].map(s => [...s, false]);
  }
  if ((host === 'gitlab.com' || host.startsWith('gitlab.')) && segments.length >= 2) {
    return [['Repository', base, 'repository'], ['Issues', `${base}/-/issues`, 'issues'], ['CI', `${base}/-/pipelines`, 'ci'], ['Releases', `${base}/-/releases`, 'releases']].map(s => [...s, false]);
  }
  if ((host === 'codeberg.org' || /^(gitea|forgejo)\./.test(host)) && two) {
    return [['Repository', base, 'repository'], ['Issues', `${base}/issues`, 'issues'], ['CI', `${base}/actions`, 'ci'], ['Releases', `${base}/releases`, 'releases']].map(s => [...s, false]);
  }
  if (host === 'bitbucket.org' && two) return [['Repository', base, 'repository', false], ['CI', `${base}/pipelines`, 'ci', true]];
  return [['Repository', base, 'repository', true]];
}

// ------------------------------------------------------ package scripts ----

const TOOLS = {
  vite: { id: 'vite', label: 'Vite', kind: 'web', port: 5173, dev: s => !s || s === 'dev' || s === 'serve' || s.startsWith('-') },
  next: { id: 'next', label: 'Next.js', kind: 'web', port: 3000, dev: s => s === 'dev' },
  astro: { id: 'astro', label: 'Astro', kind: 'web', port: 4321, dev: s => s === 'dev' },
  nuxt: { id: 'nuxt', label: 'Nuxt', kind: 'web', port: 3000, dev: s => s === 'dev' },
  nuxi: { id: 'nuxt', label: 'Nuxt', kind: 'web', port: 3000, dev: s => s === 'dev' },
  remix: { id: 'remix', label: 'Remix', kind: 'web', port: 3000, dev: s => s === 'dev' || s === 'vite:dev', portFor: s => s === 'vite:dev' ? 5173 : 3000 },
  'react-router': { id: 'react-router', label: 'React Router', kind: 'web', port: 5173, dev: s => s === 'dev' },
  'react-scripts': { id: 'react-scripts', label: 'Create React App', kind: 'web', port: 3000, dev: s => s === 'start' },
  webpack: { id: 'webpack-dev-server', label: 'webpack-dev-server', kind: 'web', port: 8080, dev: s => s === 'serve' },
  'webpack-dev-server': { id: 'webpack-dev-server', label: 'webpack-dev-server', kind: 'web', port: 8080, dev: () => true },
  parcel: { id: 'parcel', label: 'Parcel', kind: 'web', port: 1234, dev: s => !s || !['build', 'watch'].includes(s) },
  ng: { id: 'angular', label: 'Angular', kind: 'web', port: 4200, dev: s => s === 'serve' || s === 's' },
  'vue-cli-service': { id: 'vue-cli', label: 'Vue CLI', kind: 'web', port: 8080, dev: s => s === 'serve' },
  gatsby: { id: 'gatsby', label: 'Gatsby', kind: 'web', port: 8000, dev: s => s === 'develop' },
  'svelte-kit': { id: 'sveltekit', label: 'SvelteKit', kind: 'web', port: 5173, dev: s => s === 'dev' },
  docusaurus: { id: 'docusaurus', label: 'Docusaurus', kind: 'web', port: 3000, dev: s => s === 'start' },
  ember: { id: 'ember', label: 'Ember', kind: 'web', port: 4200, dev: s => s === 'serve' || s === 's' },
  hugo: { id: 'hugo', label: 'Hugo', kind: 'web', port: 1313, dev: s => s === 'server' || s === 'serve' },
  eleventy: { id: 'eleventy', label: 'Eleventy', kind: 'web', port: 8080, dev: (_s, rest) => rest.includes('--serve') },
  wrangler: { id: 'wrangler', label: 'Wrangler', kind: 'web', port: 8787, dev: s => s === 'dev' },
  netlify: { id: 'netlify-dev', label: 'Netlify Dev', kind: 'web', port: 8888, dev: s => s === 'dev' },
  vercel: { id: 'vercel-dev', label: 'Vercel Dev', kind: 'web', port: 3000, dev: s => s === 'dev' },
  storybook: { id: 'storybook', label: 'Storybook', kind: 'service', port: 6006, dev: s => s === 'dev' },
  'start-storybook': { id: 'storybook', label: 'Storybook', kind: 'service', port: 6006, dev: () => true },
  tauri: { id: 'tauri', label: 'Tauri', kind: 'desktop', port: null, dev: s => s === 'dev' },
  electron: { id: 'electron', label: 'Electron', kind: 'desktop', port: null, dev: () => true },
  'electron-forge': { id: 'electron', label: 'Electron Forge', kind: 'desktop', port: null, dev: s => s === 'start' },
  'electron-vite': { id: 'electron-vite', label: 'electron-vite', kind: 'desktop', port: 5173, dev: s => !s || s === 'dev' },
  expo: { id: 'expo', label: 'Expo', kind: 'mobile', port: 8081, dev: s => s === 'start' },
  'react-native': { id: 'react-native', label: 'React Native', kind: 'mobile', port: 8081, dev: s => s === 'start' },
};
const DEP_TOOLS = [
  ['next', 'next'], ['nuxt', 'nuxt'], ['astro', 'astro'], ['@sveltejs/kit', 'svelte-kit'], ['react-scripts', 'react-scripts'],
  ['gatsby', 'gatsby'], ['@angular/core', 'ng'], ['parcel', 'parcel'], ['vite', 'vite'],
];
const VITE_FLAVOURS = [['@sveltejs/kit', 'sveltekit', 'SvelteKit'], ['@remix-run/dev', 'remix', 'Remix'], ['@react-router/dev', 'react-router', 'React Router']];
const SCRIPT_ORDER = ['dev', 'develop', 'start', 'serve'];
const validPort = p => /^[0-9]{1,5}$/.test(p) && Number(p) >= 1 && Number(p) <= 65535 ? Number(p) : null;

function scriptReference(tokens) {
  const [a, b, c] = tokens;
  if (a === 'npm' && (b === 'run' || b === 'run-script')) return c;
  if (a === 'npm' && ['start', 'test'].includes(b)) return b;
  if ((a === 'pnpm' || a === 'yarn' || a === 'bun') && b === 'run') return c;
  if ((a === 'pnpm' || a === 'yarn') && b && !b.startsWith('-') && !['exec', 'dlx', 'install', 'add'].includes(b)) return b;
  return undefined;
}
function analyzeScript(scripts, name, deps, budget, seen = new Set(), depth = 0) {
  const script = own(scripts, name);
  if (typeof script !== 'string' || seen.has(name) || depth > 4 || budget.calls++ > 1000) return [];
  seen.add(name);
  const found = [];
  for (const segment of script.slice(0, 4096).split(/&&|\|\||[;|&"']/)) {
    const tokens = segment.trim().split(/\s+/).filter(Boolean);
    const ref = scriptReference(tokens);
    if (ref !== undefined) { found.push(...analyzeScript(scripts, ref, deps, budget, seen, depth + 1)); continue; }
    let envPort = null;
    for (let t = 0; t < tokens.length; t++) {
      const env = /^PORT=([0-9]+)$/.exec(tokens[t]);
      if (env) { envPort = validPort(env[1]); continue; }
      const base = tokens[t].split('/').at(-1);
      const tool = Object.prototype.hasOwnProperty.call(TOOLS, base) ? TOOLS[base] : base === 'eleventy' || tokens[t] === '@11ty/eleventy' ? TOOLS.eleventy : null;
      if (!tool) continue;
      const sub = tokens[t + 1], rest = tokens.slice(t + 1);
      if (!tool.dev(sub, rest)) continue;
      let port = null;
      for (let r = 0; r < rest.length; r++) {
        const m = /^(?:--port|-p)(?:=([0-9]+))?$/.exec(rest[r]);
        if (m) { port = validPort(m[1] ?? rest[r + 1] ?? ''); if (port) break; }
      }
      port ??= envPort;
      let { id, label } = tool;
      if (tool === TOOLS.vite) for (const [dep, fid, flabel] of VITE_FLAVOURS) if (deps.has(dep)) { id = fid; label = flabel; break; }
      found.push({ id, label, kind: tool.kind, port: port ?? (tool.portFor ? tool.portFor(sub) : tool.port), explicit: port !== null, script: name });
      break;
    }
  }
  return found;
}

// --------------------------------------------------------------- detect ----

const safeName = s => typeof s === 'string' ? clip(s.replace(/[\u0000-\u001f\u007f]/g, '').trim(), 80) : '';
const LOCAL_HOSTS = new Set(['localhost', '127.0.0.1', '[::1]', '0.0.0.0']);

// ------------------------------------------------------------ workspaces ----
//
// Monorepos are detected in two phases so the chrome reader stays a dumb,
// allowlisted file reader (contexts-api-v1 §2.2):
//   1. workspaceCandidates(rootFiles) → { patterns, list }: `list` names the
//      directories whose immediate child *directory names* the reader may list.
//   2. expandWorkspaceGlobs(patterns, listing) → package directories; for each
//      the reader reads only PACKAGE_DETECTION_FILES, then calls
//      detectProject({ rootName, files, refused, packages }).
// Globs are single-level (`apps/*`, `packages/app-*`); `**`, `..`, absolute
// paths, hidden directories, node_modules and build output are refused.

export const MAX_WORKSPACE_PACKAGES = 24;
export const PACKAGE_DETECTION_FILES = Object.freeze([
  'package.json', '.vercel/project.json', 'vercel.json', 'netlify.toml', 'wrangler.toml', 'wrangler.json',
  'src-tauri/tauri.conf.json', 'tauri.conf.json',
]);
export const CONVENTIONAL_WORKSPACES = Object.freeze([
  'apps/*', 'packages/*', 'web', 'frontend', 'client', 'site', 'app', 'ui', 'desktop', 'www', 'dashboard', 'admin', 'docs', 'server', 'api', 'backend',
]);
const PACKAGE_ALLOWED = new Set(PACKAGE_DETECTION_FILES);
const DIR_SEGMENT = /^[A-Za-z0-9_@+][A-Za-z0-9._@+-]{0,99}$/;
const SKIP_DIRS = new Set(['node_modules', 'dist', 'build', 'out', 'target', 'coverage']);
const MAX_LIST_PARENTS = 16;
const MAX_PATTERNS = 64;

const okSegment = s => DIR_SEGMENT.test(s) && !SKIP_DIRS.has(s.toLowerCase()) && !BAD_KEYS.has(s);
// A package directory relative to the root: 1–4 plain segments, no hidden,
// `..`, node_modules or build-output segments.
export function isPackageDir(dir) {
  if (typeof dir !== 'string' || !dir || dir.length > 200) return false;
  const segs = dir.split('/');
  return segs.length <= 4 && segs.every(okSegment);
}
export const isAllowedPackagePath = (dir, rel) => isPackageDir(dir) && typeof rel === 'string' && PACKAGE_ALLOWED.has(rel);
const isAllowedResolved = p => isAllowedPath(p) ||
  (typeof p === 'string' && PACKAGE_DETECTION_FILES.some(f => p.endsWith(`/${f}`) && isPackageDir(p.slice(0, -f.length - 1))));

// detectionRefusal for a file inside a workspace package. `resolvedPath` is the
// real path relative to the real root (null when outside it); it must itself be
// an allowlisted root or package path.
export function packageDetectionRefusal({ dir, path, resolvedPath, isFile, size } = {}) {
  if (!isAllowedPackagePath(dir, path)) return 'not_allowlisted';
  if (resolvedPath === null || resolvedPath === undefined) return 'symlink_outside_root';
  if (!isAllowedResolved(resolvedPath)) return 'not_allowlisted';
  if (isFile !== true) return 'not_regular_file';
  if (!Number.isSafeInteger(size) || size < 0 || size > MAX_FILE_BYTES) return 'too_large';
  return null;
}

// Normalizes one workspace pattern: { pattern } (possibly "!"-negated) or
// { reason } when refused.
export function normalizeWorkspacePattern(raw) {
  if (typeof raw !== 'string') return { reason: 'invalid' };
  let s = raw.trim(), neg = false;
  if (s.startsWith('!')) { neg = true; s = s.slice(1).trim(); }
  if (!s || s.length > 200) return { reason: 'invalid' };
  if (s.startsWith('/') || s.startsWith('~') || /^[A-Za-z]:/.test(s) || s.includes('\\')) return { reason: 'absolute' };
  while (s.startsWith('./')) s = s.slice(2);
  s = trimTrailing(s, '/');
  if (s.endsWith('/package.json')) s = s.slice(0, -'/package.json'.length);
  const segs = s.split('/');
  if (segs.includes('..')) return { reason: 'parent_traversal' };
  if (s.includes('**')) return { reason: 'recursive_glob' };
  if (/[?[\]{}!,]/.test(s)) return { reason: 'unsupported_glob' };
  if (!s || segs.length > 4 || segs.some(x => !x || x === '.')) return { reason: 'invalid' };
  if (segs.slice(0, -1).some(x => x.includes('*'))) return { reason: 'nested_glob' };
  if (segs.some(x => x.startsWith('.'))) return { reason: 'hidden' };
  if (segs.some(x => x.toLowerCase() === 'node_modules')) return { reason: 'node_modules' };
  if ((segs.at(-1).match(/\*/g) ?? []).length > 1) return { reason: 'unsupported_glob' };
  if (segs.some(x => SKIP_DIRS.has(x.toLowerCase()))) return { reason: 'build_output' };
  if (!segs.every(x => okSegment(x.replace('*', 'x')))) return { reason: 'invalid' };
  return { pattern: `${neg ? '!' : ''}${segs.join('/')}` };
}

const segMatch = (glob, name) => {
  const star = glob.indexOf('*');
  if (star < 0) return glob === name;
  const pre = glob.slice(0, star), post = glob.slice(star + 1);
  return name.length >= pre.length + post.length && name.startsWith(pre) && name.endsWith(post);
};
const dirMatch = (pattern, dir) => {
  const a = pattern.split('/'), b = dir.split('/');
  return a.length === b.length && a.every((g, i) => segMatch(g, b[i]));
};
const parentOf = p => p.split('/').slice(0, -1).join('/');
const stripBom = t => (t.charCodeAt(0) === 0xfeff ? t.slice(1) : t);

// Repo-relative join; null when it leaves the root.
function resolveRel(baseDir, rel) {
  if (typeof rel !== 'string' || rel.length > 512 || /^[A-Za-z][A-Za-z0-9+.-]*:/.test(rel) || rel.startsWith('/') || rel.includes('\\')) return null;
  const out = baseDir ? baseDir.split('/') : [];
  for (const seg of rel.split('/')) {
    if (!seg || seg === '.') continue;
    if (seg === '..') { if (!out.length) return null; out.pop(); } else out.push(seg);
  }
  return out.join('/');
}

// Where a Tauri config says its frontend lives: build.frontendDist/distDir
// (output dir, so a trailing dist/build/out/public is dropped) and the dir of
// build.beforeDevCommand (`cd x`, `--prefix x`, `--cwd x`, `-C x`, `--dir x`,
// or { cwd }). `filters` are pnpm/yarn `--filter`/`workspace` package names.
function tauriHints(conf, confDir) {
  const build = own(conf, 'build');
  const dirs = [], filters = [];
  const add = d => { if (typeof d === 'string' && d && isPackageDir(d) && !dirs.includes(d)) dirs.push(d); };
  for (const key of ['frontendDist', 'distDir']) {
    const v = own(build, key);
    if (typeof v !== 'string') continue;
    const r = resolveRel(confDir, v);
    if (r === null) continue;
    const segs = r ? r.split('/') : [];
    if (segs.length && ['dist', 'build', 'out', 'public'].includes(segs.at(-1).toLowerCase())) segs.pop();
    add(segs.join('/'));
  }
  // beforeDevCommand runs from the Tauri project dir (the parent of src-tauri).
  const base = confDir === 'src-tauri' ? '' : confDir.endsWith('/src-tauri') ? confDir.slice(0, -'/src-tauri'.length) : confDir;
  const cmd = own(build, 'beforeDevCommand');
  const script = typeof cmd === 'string' ? cmd : typeof own(cmd, 'script') === 'string' ? own(cmd, 'script') : '';
  if (typeof own(cmd, 'cwd') === 'string') { const r = resolveRel(base, own(cmd, 'cwd')); if (r) add(r); }
  const unquote = v => v.replace(/^["']|["']$/g, '');
  const tokens = script.slice(0, 1024).split(/\s+|&&|;/).filter(Boolean);
  for (let i = 0; i < tokens.length; i++) {
    const eq = /^--(prefix|cwd|dir|filter)=(.+)$/.exec(tokens[i]);
    const flag = eq ? `--${eq[1]}` : tokens[i];
    const val = eq ? eq[2] : tokens[i + 1];
    if (typeof val !== 'string') continue;
    if (['cd', '--prefix', '--cwd', '--dir', '-C'].includes(flag)) { const r = resolveRel(base, unquote(val)); if (r) add(r); }
    else if ((flag === '--filter' || flag === '-F' || (flag === 'workspace' && tokens[i - 1] === 'yarn')) && filters.length < 4) filters.push(unquote(val));
  }
  return { dirs, filters };
}

// Phase 1. Reads only root files already supplied (package.json workspaces,
// pnpm-workspace.yaml, lerna.json, turbo.json/nx.json presence, Tauri hints)
// and returns the patterns to expand, the parent directories the caller may
// list (always including "" = the root), and refused patterns with a reason.
export function workspaceCandidates(files = {}) {
  const text = path => {
    if (!isPlainObject(files) || !isAllowedPath(path)) return undefined;
    const t = own(files, path);
    return typeof t === 'string' && utf8Length(t) <= MAX_FILE_BYTES ? stripBom(t) : undefined;
  };
  const jsonOf = path => { const t = text(path); if (t === undefined) return undefined; try { const v = JSON.parse(t); return isPlainObject(v) ? v : undefined; } catch { return undefined; } };
  const raw = [];
  const listOf = v => (Array.isArray(v) ? v : Array.isArray(own(v, 'packages')) ? own(v, 'packages') : []);
  raw.push(...listOf(own(jsonOf('package.json'), 'workspaces')).slice(0, MAX_PATTERNS));
  const pnpm = text('pnpm-workspace.yaml');
  if (pnpm !== undefined) raw.push(...listOf(parseYaml(pnpm).value).slice(0, MAX_PATTERNS));
  const lerna = jsonOf('lerna.json');
  if (lerna) raw.push(...(Array.isArray(own(lerna, 'packages')) ? own(lerna, 'packages').slice(0, MAX_PATTERNS) : ['packages/*']));
  for (const path of ['src-tauri/tauri.conf.json', 'tauri.conf.json']) {
    const conf = jsonOf(path);
    if (conf) { raw.push(...tauriHints(conf, path.includes('/') ? 'src-tauri' : '').dirs); break; }
  }
  raw.push(...CONVENTIONAL_WORKSPACES);
  const patterns = [], refused = [];
  for (const r of raw) {
    const n = normalizeWorkspacePattern(r);
    if (n.pattern) { if (!patterns.includes(n.pattern) && patterns.length < MAX_PATTERNS) patterns.push(n.pattern); }
    else if (!(typeof r === 'string' && r.trim().startsWith('!')) && refused.length < 32) refused.push({ pattern: typeof r === 'string' ? clip(r, 200) : String(typeof r), reason: n.reason });
  }
  const list = [''];
  for (const p of patterns) {
    if (p.startsWith('!')) continue;
    const parent = parentOf(p);
    if (!list.includes(parent) && list.length < MAX_LIST_PARENTS) list.push(parent);
  }
  return deepFreeze({ patterns, list, refused });
}

// Phase 1b. `listing` maps a parent dir from `list` ("" = root) to the names of
// its immediate child directories, as the caller found them. A literal pattern
// is kept when its parent was not listed or lists it; a glob needs a listing.
// Negated patterns remove matches. Result: at most MAX_WORKSPACE_PACKAGES dirs.
export function expandWorkspaceGlobs(patterns, listing = {}) {
  if (!Array.isArray(patterns)) return Object.freeze([]);
  const childrenOf = parent => {
    const v = isPlainObject(listing) ? own(listing, parent) : undefined;
    return Array.isArray(v) ? v.slice(0, 512).filter(n => typeof n === 'string' && okSegment(n)).sort() : null;
  };
  const include = [], exclude = [];
  for (const raw of patterns.slice(0, 128)) {
    const n = normalizeWorkspacePattern(raw);
    if (!n.pattern) continue;
    if (n.pattern.startsWith('!')) exclude.push(n.pattern.slice(1)); else include.push(n.pattern);
  }
  const out = [];
  const add = dir => { if (out.length < MAX_WORKSPACE_PACKAGES && !out.includes(dir) && isPackageDir(dir) && !exclude.some(e => dirMatch(e, dir))) out.push(dir); };
  for (const p of include) {
    const parent = parentOf(p), last = p.split('/').at(-1), kids = childrenOf(parent);
    if (last.includes('*')) { for (const k of kids ?? []) if (segMatch(last, k)) add(parent ? `${parent}/${k}` : k); }
    else if (!kids || kids.includes(last)) add(p);
  }
  return Object.freeze(out);
}

// --------------------------------------------------------------- detect ----

const slug = s => {
  if (typeof s !== 'string') return '';
  const out = s.toLowerCase().replace(/^@[^/]*\//, '').replace(/[^a-z0-9._-]+/g, '-').replace(/^[^a-z0-9]+/, '');
  return clip(trimTrailing(out, '-'), 40);
};

export function detectProject({ rootName, files = {}, refused = [], packages } = {}) {
  if (!isPlainObject(files)) throw new ContextsError('INVALID_INPUT', '$.files: expected an object of relative path → text', '$.files');
  if (!Array.isArray(refused)) throw new ContextsError('INVALID_INPUT', '$.refused: expected an array', '$.refused');
  if (packages !== undefined && packages !== null && !isPlainObject(packages)) throw new ContextsError('INVALID_INPUT', '$.packages: expected an object of package dir → { files, refused }', '$.packages');
  const st = {
    warnings: [], refused: [], envs: [], services: [], surfaces: [], frameworks: [], kinds: [], names: [], registry: [],
  };
  const warn = msg => { if (st.warnings.length < MAX_WARNINGS) st.warnings.push(clip(msg, 256)); };
  const takeRefused = (list, prefix, at) => list.forEach((r, i) => {
    if (!isPlainObject(r) || typeof r.path !== 'string' || !REFUSAL_REASONS.includes(r.reason)) throw new ContextsError('INVALID_INPUT', `${at}[${i}]: expected { path, reason }`, `${at}[${i}]`);
    st.refused.push({ path: prefix + r.path, reason: r.reason });
  });
  takeRefused(refused, '', '$.refused');
  const readUnit = (map, allowed, prefix) => {
    const text = {};
    for (const path of Object.keys(map)) {
      if (!allowed(path)) { st.refused.push({ path: prefix + path, reason: 'not_allowlisted' }); continue; }
      const content = map[path];
      if (typeof content !== 'string') { st.refused.push({ path: prefix + path, reason: 'unreadable' }); continue; }
      if (utf8Length(content) > MAX_FILE_BYTES) { st.refused.push({ path: prefix + path, reason: 'too_large' }); continue; }
      text[path] = stripBom(content);
    }
    return text;
  };
  const root = { dir: '', prefix: '', isRoot: true, text: readUnit(files, isAllowedPath, '') };
  const hasIn = (u, p) => Object.prototype.hasOwnProperty.call(u.text, p);
  const has = p => hasIn(root, p);
  const files_read = DETECTION_FILES.filter(has);

  const units = [root];
  if (packages) {
    let skipped = 0;
    for (const dir of Object.keys(packages)) {
      if (!isPackageDir(dir)) { st.refused.push({ path: clip(dir, 200), reason: 'not_allowlisted' }); continue; }
      if (units.length > MAX_WORKSPACE_PACKAGES) { skipped++; continue; }
      const entry = own(packages, dir), at = `$.packages["${clip(dir, 200)}"]`;
      if (!isPlainObject(entry) || !isPlainObject(own(entry, 'files'))) throw new ContextsError('INVALID_INPUT', `${at}: expected { files, refused }`, at);
      const pref = own(entry, 'refused') ?? [];
      if (!Array.isArray(pref)) throw new ContextsError('INVALID_INPUT', `${at}.refused: expected an array`, `${at}.refused`);
      takeRefused(pref, `${dir}/`, `${at}.refused`);
      const u = { dir, prefix: `${dir}/`, isRoot: false, text: readUnit(entry.files, p => PACKAGE_ALLOWED.has(p), `${dir}/`) };
      units.push(u);
      for (const f of PACKAGE_DETECTION_FILES) if (hasIn(u, f)) files_read.push(`${dir}/${f}`);
    }
    if (skipped) warn(`${skipped} workspace package(s) beyond the limit of ${MAX_WORKSPACE_PACKAGES} were ignored`);
  }

  // `unit` and `role` are internal tags; they are replaced by `app` below.
  const addEnv = (name, url, source, guess, unit = '', role = 'remote') => {
    try { st.envs.push({ name, base_url: validateBaseUrl(url), source: clip(source, 256), guess, unit, role }); } catch { warn(`${source}: ignored an invalid URL`); }
  };
  const addService = (name, url, port, source, guess, unit = '', role = 'other') => {
    try { st.services.push({ name: safeName(name) || 'service', url: validateWebUrl(stripQueryAndFragment(url)), port, source: clip(source, 256), guess, unit, role }); } catch { warn(`${source}: ignored an invalid service URL`); }
  };
  const addSurface = (name, url, kind, source, guess, prominence) => {
    try {
      const s = { name: safeName(name) || 'Surface', url: validateWebUrl(stripQueryAndFragment(url)), kind, source: clip(source, 256), guess };
      st.surfaces.push({ ...s, prominence: prominence ?? surfaceProminence(s) });
    } catch { warn(`${source}: ignored an invalid URL`); }
  };
  const kind = (k, source, guess, rank) => st.kinds.push({ kind: k, source: clip(source, 256), guess, rank });
  const framework = id => { if (!st.frameworks.includes(id)) st.frameworks.push(id); };
  const reader = u => ({
    json: path => {
      if (!hasIn(u, path)) return undefined;
      try { const v = JSON.parse(u.text[path]); if (isPlainObject(v)) return v; warn(`${u.prefix}${path}: expected a JSON object`); } catch { warn(`${u.prefix}${path}: invalid JSON, ignored`); }
      return undefined;
    },
    toml: path => {
      if (!hasIn(u, path)) return undefined;
      const { value, errors } = parseToml(u.text[path]);
      if (errors.length) warn(`${u.prefix}${path}: ${errors.length} unparsable statement(s) ignored (${errors[0]})`);
      return value;
    },
  });
  const { json, toml } = reader(root);
  const yaml = path => {
    if (!has(path)) return undefined;
    const { value, errors } = parseYaml(root.text[path]);
    if (errors.length) warn(`${path}: ${errors.length} unparsable line(s) ignored (${errors[0]})`);
    return isPlainObject(value) ? value : undefined;
  };
  const str = v => typeof v === 'string' ? v : undefined;

  // Existing manifest wins outright.
  if (has(MANIFEST_PATH)) {
    try {
      const m = parseManifest(root.text[MANIFEST_PATH]);
      const src = MANIFEST_PATH;
      return validateDetectionDraft({
        version: 1, name: m.name, kind: m.kind, kind_source: { source: src, guess: false },
        environments: m.environments.map(e => ({ ...e, source: src, guess: false })),
        services: m.services.map(s => ({ ...s, source: src, guess: false })),
        surfaces: m.surfaces.map(s => ({ ...s, prominence: surfaceProminence(s), source: src, guess: false })),
        frameworks: [], files_read, refused: st.refused, warnings: st.warnings,
      });
    } catch (e) { warn(`${MANIFEST_PATH}: ignored (${e instanceof ContextsError ? e.code : 'unreadable'})`); }
  }

  const rootPkgJson = json('package.json');
  const workspaceRoot = own(rootPkgJson, 'workspaces') !== undefined || ['pnpm-workspace.yaml', 'lerna.json', 'turbo.json', 'nx.json'].some(has);
  let remoteFromPackage = null, rootPkg = null;

  function electronPublish(publish, source) {
    for (const p of Array.isArray(publish) ? publish : [publish]) {
      if (own(p, 'provider') !== 'github') continue;
      const owner = str(own(p, 'owner')), repo = str(own(p, 'repo'));
      if (owner && repo && SEGMENT.test(owner) && SEGMENT.test(repo) && ![owner, repo].some(x => x === '.' || x === '..')) {
        addSurface('Releases', `https://github.com/${owner}/${repo}/releases`, 'releases', source, false);
      }
    }
  }

  // Dev servers, desktop shells and hosting configs: at the root and in every
  // workspace package. Root-only facts (name, library/cli kind, repository
  // links) are taken from the root package.json only.
  const tauriUnits = [];
  function scanUnit(u) {
    const { json: j, toml: t } = reader(u);
    const at = p => `${u.prefix}${p}`;
    const pkg = u.isRoot ? rootPkgJson : j('package.json');
    const deps = new Set();
    u.pkgName = str(own(pkg, 'name'));
    if (pkg) {
      for (const k of ['dependencies', 'devDependencies', 'peerDependencies', 'optionalDependencies']) {
        const d = own(pkg, k); if (isPlainObject(d)) for (const name of Object.keys(d)) deps.add(name);
      }
      const scripts = isPlainObject(own(pkg, 'scripts')) ? own(pkg, 'scripts') : {};
      const order = [...SCRIPT_ORDER.filter(s => Object.prototype.hasOwnProperty.call(scripts, s)), ...Object.keys(scripts).filter(s => !SCRIPT_ORDER.includes(s))];
      const found = [], budget = { calls: 0 };
      for (const name of order.slice(0, 200)) for (const f of analyzeScript(scripts, name, deps, budget)) found.push(f);
      for (const f of found) framework(f.id);
      const pj = at('package.json');
      const web = found.find(f => f.kind === 'web');
      if (web) {
        const source = web.explicit ? `${pj} scripts.${web.script} (${web.id} port ${web.port})` : `${web.label} default port (${pj} scripts.${web.script})`;
        addEnv('local', `http://localhost:${web.port}`, source, !web.explicit, u.dir, 'web');
        addService(`${web.label} dev server`, `http://localhost:${web.port}`, web.port, source, !web.explicit, u.dir, 'web');
        kind('web', `${pj} scripts.${web.script} (${web.id})`, false, 3);
      } else if (u.isRoot && !workspaceRoot) {
        // Dependency-only guesses are for single-app roots; in a workspace root
        // or package a build-time dependency is too weak a signal.
        const dep = DEP_TOOLS.find(([d]) => deps.has(d));
        if (dep) {
          const tool = TOOLS[dep[1]];
          framework(tool.id);
          const source = `${tool.label} default port (package.json dependency ${dep[0]})`;
          addEnv('local', `http://localhost:${tool.port}`, source, true, u.dir, 'web');
          addService(`${tool.label} dev server`, `http://localhost:${tool.port}`, tool.port, source, true, u.dir, 'web');
          kind('web', `package.json dependency ${dep[0]}`, true, 3);
        }
      }
      for (const f of found.filter(f => f.kind === 'service')) {
        addService(f.label, `http://localhost:${f.port}`, f.port, `${pj} scripts.${f.script}`, !f.explicit, u.dir);
      }
      const desktop = found.find(f => f.kind === 'desktop');
      if (desktop) kind('desktop', `${pj} scripts.${desktop.script} (${desktop.id})`, false, 1);
      else if (deps.has('electron')) { framework('electron'); kind('desktop', `${pj} dependency electron`, false, 1); }
      if (desktop?.port && !web) {
        const source = `${desktop.label} default port (${pj} scripts.${desktop.script})`;
        addEnv('local', `http://localhost:${desktop.port}`, source, true, u.dir, 'desktop');
      }
      const mobile = found.find(f => f.kind === 'mobile') ?? (deps.has('expo') || deps.has('react-native') ? { id: deps.has('expo') ? 'expo' : 'react-native', script: null } : null);
      if (mobile) { framework(mobile.id); kind('mobile', mobile.script ? `${pj} scripts.${mobile.script} (${mobile.id})` : `${pj} dependency ${mobile.id}`, false, 2); }
      if (u.isRoot) {
        rootPkg = pkg;
        st.names.push([2, safeName(own(pkg, 'name'))]);
        if (own(pkg, 'bin') !== undefined) kind('cli', 'package.json bin', false, 4);
        else if (['main', 'exports', 'module', 'types'].some(k => own(pkg, k) !== undefined)) kind('library', 'package.json main/exports', false, 5);
        if (isPlainObject(own(pkg, 'build')) && (own(pkg.build, 'appId') !== undefined || own(pkg.build, 'productName') !== undefined)) {
          kind('desktop', 'package.json build (electron-builder)', false, 1);
          st.names.push([1, safeName(own(pkg.build, 'productName'))]);
          electronPublish(own(pkg.build, 'publish'), 'package.json build.publish');
        }
        const repo = own(pkg, 'repository');
        remoteFromPackage = str(repo) ?? str(own(repo, 'url'));
        const bugs = str(own(pkg, 'bugs')) ?? str(own(own(pkg, 'bugs'), 'url'));
        if (bugs) addSurface('Issues', bugs, 'issues', 'package.json bugs', false);
        const homepage = str(own(pkg, 'homepage'));
        if (homepage) addSurface('Homepage', homepage, 'other', 'package.json homepage', false);
      }
    }

    // Tauri (v2 build.devUrl, v1 build.devPath). The dev URL is the desktop
    // app's local environment, never the generic web dev server.
    for (const path of ['src-tauri/tauri.conf.json', 'tauri.conf.json']) {
      const conf = j(path);
      if (!conf) continue;
      framework('tauri');
      kind('desktop', at(path), false, 1);
      const build = own(conf, 'build');
      const dev = str(own(build, 'devUrl')) ?? str(own(build, 'devPath'));
      let devEnv = false;
      if (dev && /^https?:\/\//i.test(dev)) {
        const field = own(build, 'devUrl') !== undefined ? 'build.devUrl' : 'build.devPath';
        let port = null;
        try { const x = new URL(dev); port = Number(x.port) || (x.protocol === 'https:' ? 443 : 80); if (!LOCAL_HOSTS.has(x.hostname)) warn(`${at(path)}: ${field} is not a loopback URL`); } catch { /* reported by addEnv */ }
        const url = dev.replace(/^(https?:\/\/)0\.0\.0\.0/i, '$1localhost');
        const before = st.envs.length;
        addEnv('local', url, `${at(path)} ${field}`, false, u.dir, 'desktop');
        devEnv = st.envs.length > before;
        if (port) addService('Tauri dev server', url, port, `${at(path)} ${field}`, false, u.dir, 'desktop');
      }
      if (u.isRoot) st.names.push([0, safeName(str(own(conf, 'productName')) ?? str(own(own(conf, 'package'), 'productName')))]);
      const updater = own(own(conf, 'plugins'), 'updater') ?? own(own(conf, 'tauri'), 'updater');
      const endpoints = own(updater, 'endpoints');
      if (Array.isArray(endpoints)) for (const e of endpoints.slice(0, 4)) if (typeof e === 'string' && !e.includes('{')) addSurface('Update feed', e, 'other', `${at(path)} updater.endpoints`, false);
      const confDir = resolveRel(u.dir, path.includes('/') ? 'src-tauri' : '') ?? u.dir;
      tauriUnits.push({ unit: u.dir, devEnv, hints: tauriHints(conf, confDir) });
      break;
    }

    // Vercel: project identity → dashboard, never a production URL. The
    // dashboard link is secondary; the production URL is asked for in review.
    const vproj = j('.vercel/project.json');
    const vjson = j('vercel.json');
    if (vproj || vjson) {
      const pname = safeName(own(vproj, 'projectName')) || safeName(own(vjson, 'name'));
      addSurface(pname ? `Vercel (${clip(pname, 60)})` : 'Vercel', 'https://vercel.com/dashboard', 'hosting', vproj ? at('.vercel/project.json') : at('vercel.json'), false, 'secondary');
      kind('web', vproj ? at('.vercel/project.json') : at('vercel.json'), false, 3);
    }

    // Netlify
    const netlify = t('netlify.toml');
    if (netlify) {
      addSurface('Netlify', 'https://app.netlify.com/', 'hosting', at('netlify.toml'), false);
      kind('web', at('netlify.toml'), false, 3);
      const port = own(own(netlify, 'dev'), 'port');
      if (Number.isSafeInteger(port) && port >= 1 && port <= 65535) addService('Netlify Dev', `http://localhost:${port}`, port, `${at('netlify.toml')} [dev] port`, false, u.dir);
    }

    // Cloudflare Wrangler: declared routes / custom domains.
    const wrangler = t('wrangler.toml') ?? j('wrangler.json');
    if (wrangler) {
      const src = hasIn(u, 'wrangler.toml') ? at('wrangler.toml') : at('wrangler.json');
      const wname = str(own(wrangler, 'name'));
      addSurface(wname ? `Cloudflare (${clip(safeName(wname), 60)})` : 'Cloudflare', 'https://dash.cloudflare.com/', 'hosting', src, false);
      kind('web', src, false, 3);
      const routeUrl = r => {
        const pattern = str(r) ?? str(own(r, 'pattern'));
        if (!pattern) return null;
        const m = /^(?:https?:\/\/)?([a-z0-9.-]+)(\/[^*]*)?\*?$/i.exec(pattern);
        return m && plainHost(m[1].toLowerCase()) && m[1].includes('.') ? `https://${m[1].toLowerCase()}${trimTrailing(m[2] ?? '/', '/') || '/'}` : null;
      };
      const firstRoute = cfg => [own(cfg, 'route'), ...(Array.isArray(own(cfg, 'routes')) ? own(cfg, 'routes') : [])].map(routeUrl).find(Boolean);
      const envs = isPlainObject(own(wrangler, 'env')) ? own(wrangler, 'env') : {};
      const top = firstRoute(wrangler);
      if (top && !Object.prototype.hasOwnProperty.call(envs, 'production')) addEnv('production', top, `${src} routes`, false, u.dir);
      for (const [envName, cfg] of Object.entries(envs).slice(0, 8)) {
        const url = firstRoute(cfg);
        const nm = envName === 'prod' ? 'production' : envName.toLowerCase();
        if (url && /^[a-z][a-z0-9-]{0,31}$/.test(nm)) addEnv(nm, url, `${src} env.${envName} routes`, false, u.dir);
      }
      if (!top && own(wrangler, 'pages_build_output_dir') !== undefined && wname && /^[a-z0-9][a-z0-9-]{0,57}$/.test(wname)) {
        addEnv('production', `https://${wname}.pages.dev`, `${src} name (Cloudflare Pages default domain)`, true, u.dir);
      }
      const port = own(own(wrangler, 'dev'), 'port');
      if (Number.isSafeInteger(port) && port >= 1 && port <= 65535) addService('Wrangler dev', `http://localhost:${port}`, port, `${src} [dev] port`, false, u.dir);
    }
  }
  for (const u of units) scanUnit(u);

  // electron-builder
  const eb = json('electron-builder.json') ?? yaml('electron-builder.yml');
  if (eb) {
    const src = has('electron-builder.json') ? 'electron-builder.json' : 'electron-builder.yml';
    framework('electron');
    kind('desktop', src, false, 1);
    st.names.push([1, safeName(own(eb, 'productName'))]);
    electronPublish(own(eb, 'publish'), `${src} publish`);
  }

  // Fly.io
  const fly = toml('fly.toml');
  if (fly) {
    const app = str(own(fly, 'app'));
    kind('web', 'fly.toml', false, 3);
    if (app && /^[a-z0-9][a-z0-9-]{0,62}$/.test(app) && !app.endsWith('-')) {
      addSurface(`Fly.io (${app})`, `https://fly.io/apps/${app}`, 'hosting', 'fly.toml app', false);
      addEnv('production', `https://${app}.fly.dev`, 'fly.toml app (fly.dev default domain)', true);
    } else if (app !== undefined) warn('fly.toml: app name is not a valid host label, ignored');
  }

  // docker compose: published ports only.
  const composePath = ['docker-compose.yml', 'docker-compose.yaml', 'compose.yml', 'compose.yaml'].find(has);
  if (composePath) {
    const doc = yaml(composePath);
    const servicesNode = isPlainObject(own(doc, 'services')) ? own(doc, 'services') : doc && Object.values(doc).some(v => own(v, 'image') !== undefined || own(v, 'build') !== undefined) ? doc : null;
    let published = 0;
    for (const [svc, def] of Object.entries(servicesNode ?? {}).slice(0, 64)) {
      const ports = own(def, 'ports');
      if (!Array.isArray(ports)) continue;
      const list = [];
      for (const p of ports.slice(0, 32)) {
        const r = composePort(p);
        if (r.skip) { if (r.skip !== 'container-only') warn(`${composePath}: services.${clip(svc, 40)} port ${r.skip}, ignored`); continue; }
        list.push(r);
      }
      for (const r of list) {
        addService(list.length > 1 ? `${svc} (${r.port})` : svc, `http://localhost:${r.port}`, r.port, `${composePath} services.${clip(svc, 60)}.ports`, r.guess);
        published++;
      }
    }
    if (published) kind('web', `${composePath} published ports`, true, 6);
  }

  // Rust / Python / Go
  const cargo = toml('Cargo.toml');
  if (cargo) {
    const p = own(cargo, 'package');
    const cname = str(own(p, 'name'));
    st.names.push([3, safeName(cname)]);
    const bins = own(cargo, 'bin');
    if (Array.isArray(bins) && bins.length) kind('cli', 'Cargo.toml [[bin]]', false, 4);
    else if (isPlainObject(own(cargo, 'lib'))) kind('library', 'Cargo.toml [lib]', false, 5);
    else kind('library', p ? 'Cargo.toml [package]' : 'Cargo.toml [workspace]', true, 5);
    for (const [field, label, k] of [['repository', 'Repository', 'repository'], ['documentation', 'Documentation', 'docs'], ['homepage', 'Homepage', 'other']]) {
      const v = str(own(p, field)); if (v) addSurface(label, v, k, `Cargo.toml package.${field}`, false);
    }
    if (cname && /^[A-Za-z0-9_-]{1,64}$/.test(cname) && own(p, 'publish') !== false) {
      st.registry.push(['crates.io', `https://crates.io/crates/${cname}`, 'package', 'Cargo.toml package.name'], ['docs.rs', `https://docs.rs/${cname}`, 'docs', 'Cargo.toml package.name']);
    }
  }
  const py = toml('pyproject.toml');
  if (py) {
    const project = own(py, 'project'), poetry = own(own(py, 'tool'), 'poetry');
    const pname = str(own(project, 'name')) ?? str(own(poetry, 'name'));
    st.names.push([4, safeName(pname)]);
    const scripts = own(project, 'scripts') ?? own(poetry, 'scripts');
    if (isPlainObject(scripts) && Object.keys(scripts).length) kind('cli', 'pyproject.toml scripts', false, 4);
    else kind('library', 'pyproject.toml', false, 5);
    const urls = own(project, 'urls') ?? own(poetry, 'urls');
    if (isPlainObject(urls)) {
      for (const [label, url] of Object.entries(urls).slice(0, 16)) {
        const l = label.toLowerCase().replace(/[^a-z]/g, '');
        const k = /^(documentation|docs)$/.test(l) ? 'docs' : /^(repository|source|sourcecode|code|github)$/.test(l) ? 'repository' : /^(issues|bugtracker|tracker|bugs)$/.test(l) ? 'issues' : /^(changelog|releases|releasenotes)$/.test(l) ? 'releases' : 'other';
        if (typeof url === 'string') addSurface(safeName(label) || 'Link', url, k, `pyproject.toml urls.${clip(label, 40)}`, false);
      }
    }
    if (pname && /^[A-Za-z0-9]([A-Za-z0-9._-]{0,62}[A-Za-z0-9])?$/.test(pname)) {
      st.registry.push(['PyPI', `https://pypi.org/project/${pname}/`, 'package', 'pyproject.toml name']);
    }
  }
  if (has('go.mod')) {
    const line = root.text['go.mod'].split('\n').map(l => l.trim()).find(l => l.startsWith('module ') || l.startsWith('module\t'));
    const mod = line?.slice(6).trim().replace(/^"(.*)"$/, '$1');
    const m = mod && !/\s/.test(mod) ? [line, '', mod] : null;
    if (m && /^[A-Za-z0-9.\-_~/]{1,200}$/.test(m[2]) && !m[2].split('/').some(s => s === '..' || s === '.' || s === '')) {
      st.names.push([5, safeName(m[2].split('/').at(-1))]);
      kind('library', 'go.mod', true, 5);
      if (m[2].split('/')[0].includes('.')) addSurface('pkg.go.dev', `https://pkg.go.dev/${m[2]}`, 'docs', 'go.mod module', true);
    } else warn('go.mod: no valid module line');
  }

  // git remote → repository / issues / CI / releases
  let remote = null;
  if (has('.git/config')) {
    const remotes = gitRemoteUrls(root.text['.git/config']);
    const chosen = remotes.find(r => r.name === 'origin') ?? remotes[0];
    // Remote names end up in source strings: keep only a conservative charset.
    const label = chosen && /^[A-Za-z0-9._-]{1,40}$/.test(chosen.name) ? chosen.name : 'remote';
    if (chosen) {
      remote = remoteToWeb(chosen.urls[0]);
      if (remote?.credentials) warn(`.git/config: removed credentials from remote "${label}"`);
      if (remote) for (const [name, url, k, guess] of forgeSurfaces(remote)) addSurface(name, url, k, `.git/config remote ${label}`, guess);
      else warn(`.git/config: remote "${label}" is not a web-hosted repository`);
    }
  }
  if (!remote && remoteFromPackage) {
    const short = /^(github|gitlab|bitbucket):([^/\s]+\/[^/\s]+)$/.exec(remoteFromPackage) ?? (/^[A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+$/.test(remoteFromPackage) ? [null, 'github', remoteFromPackage] : null);
    const r = short ? remoteToWeb(`https://${short[1]}.${short[1] === 'bitbucket' ? 'org' : 'com'}/${short[2]}`) : remoteToWeb(remoteFromPackage);
    if (r) { for (const [label, url, k, guess] of forgeSurfaces(r)) addSurface(label, url, k, 'package.json repository', guess); if (r.credentials) warn('package.json: removed credentials from repository URL'); }
  }

  // Kind, name, registry surfaces.
  const chosenKind = st.kinds.sort((a, b) => a.rank - b.rank)[0] ?? { kind: 'web', source: 'default', guess: true };
  if (['library', 'cli'].includes(chosenKind.kind)) {
    const npmName = rootPkg && own(rootPkg, 'private') !== true && str(own(rootPkg, 'name'));
    if (npmName && /^(@[a-z0-9][a-z0-9._~-]*\/)?[a-z0-9][a-z0-9._~-]{0,213}$/.test(npmName)) addSurface('npm', `https://www.npmjs.com/package/${npmName}`, 'package', 'package.json name', true);
    for (const [label, url, k, source] of st.registry) addSurface(label, url, k, source, true);
  }
  const name = st.names.filter(([, n]) => n).sort((a, b) => a[0] - b[0])[0]?.[1] || safeName(rootName) || 'project';



  // Apps. Each package (and the root) with a local dev server is an app; a
  // Tauri config makes a desktop app whose dev URL replaces the guessed dev
  // server of the frontend it loads (the Tauri unit itself, or the package its
  // frontendDist / beforeDevCommand / --filter points at, or the package whose
  // dev server uses the same port). An explicit, different port stays its own app.
  const portOf = url => { try { const x = new URL(url); return Number(x.port) || (x.protocol === 'https:' ? 443 : 80); } catch { return null; } };
  const unitByDir = new Map(units.map(u => [u.dir, u]));
  const appKey = new Map(); // unit dir → app key for its web/remote values
  const dropped = new Set();
  for (const t of tauriUnits) {
    const key = `desktop:${t.unit}`;
    const devEnv = st.envs.find(e => e.unit === t.unit && e.role === 'desktop' && e.name === 'local');
    const devPort = devEnv ? portOf(devEnv.base_url) : null;
    const localWeb = dir => st.envs.filter(e => e.unit === dir && e.role === 'web' && e.name === 'local');
    let front = t.hints.dirs.find(d => d !== t.unit && unitByDir.has(d));
    if (front === undefined && t.hints.filters.length) front = units.find(u => u.dir !== t.unit && u.pkgName && t.hints.filters.includes(u.pkgName))?.dir;
    if (front === undefined && devPort) front = units.find(u => u.dir !== t.unit && localWeb(u.dir).some(e => portOf(e.base_url) === devPort))?.dir;
    for (const dir of front === undefined ? [t.unit] : [t.unit, front]) {
      if (appKey.has(dir)) continue;
      const web = localWeb(dir);
      if (devEnv && !web.every(e => e.guess || portOf(e.base_url) === devPort)) continue;
      if (devEnv) for (const e of web) {
        dropped.add(e);
        const p = portOf(e.base_url);
        st.services = st.services.filter(s => !(s.unit === dir && s.role === 'web' && s.port === p));
      }
      appKey.set(dir, key);
    }
  }
  st.envs = st.envs.filter(e => !dropped.has(e));
  const keyOf = x => (x.role === 'desktop' && tauriUnits.some(t => t.unit === x.unit) ? `desktop:${x.unit}` : appKey.get(x.unit) ?? `unit:${x.unit}`);
  const localKeys = [...new Set(st.envs.filter(e => e.name === 'local').map(keyOf))];
  const labels = new Map();
  if (localKeys.length > 1) {
    const used = new Set();
    const isDesktop = k => k.startsWith('desktop:') || st.envs.filter(e => keyOf(e) === k && e.name === 'local').every(e => e.role === 'desktop');
    const label = k => {
      const dir = k.slice(k.indexOf(':') + 1);
      let base = isDesktop(k) ? 'desktop' : dir === '' ? 'web' : slug(dir.split('/').at(-1)) || slug(unitByDir.get(dir)?.pkgName) || 'app';
      let out = base;
      for (let n = 2; used.has(out); n++) out = `${clip(base, 36)}-${n}`;
      used.add(out); labels.set(k, out);
    };
    // Packages first, so apps/web keeps "web" and the root takes the next name.
    for (const k of localKeys) if (!k.endsWith(':')) label(k);
    for (const k of localKeys) if (k.endsWith(':')) label(k);
  }
  const appOf = x => labels.get(keyOf(x));
  const envList = st.envs.map(e => { const app = appOf(e); return { name: e.name, ...(app ? { app } : {}), base_url: e.base_url, source: e.source, guess: e.guess }; });
  const serviceList = st.services.map(s => {
    const app = (s.role !== 'other' || s.unit !== '') ? appOf(s) : undefined;
    return { name: s.name, ...(app ? { app } : {}), url: s.url, port: s.port, source: s.source, guess: s.guess };
  });

  // Dedupe and cap. Explicit values beat guesses; first wins otherwise.
  const pick = (list, keyOf2) => {
    const out = new Map();
    for (const item of list) { const k = keyOf2(item), prev = out.get(k); if (!prev || (prev.guess && !item.guess)) out.set(k, item); }
    return [...out.values()];
  };
  const rank = e => { const i = ENV_ORDER.indexOf(e.name); return i < 0 ? ENV_ORDER.length : i; };
  let environments = pick(envList, environmentKey).map((e, i) => [e, i]).sort(([a, i], [b, j]) => rank(a) - rank(b) || i - j).map(([e]) => e);
  // A guessed framework default superseded by an explicit local URL of the
  // same app must not linger as a guessed dev-server service.
  const kept = new Set(environments);
  const superseded = new Set(envList.filter(e => !kept.has(e) && e.guess && !environments.some(x => x.base_url === e.base_url)).map(e => e.base_url));
  const locals = environments.filter(e => e.name === 'local');
  if (new Set(locals.map(e => e.base_url)).size < locals.length) warn('two apps use the same local URL; check the ports in review');
  let services = pick(serviceList.filter(s => !(s.guess && superseded.has(s.url))), s => s.port);
  let surfaces = pick(st.surfaces, s => s.url).map((s, i) => [s, i]).sort(([a, i], [b, j]) => SURFACE_KINDS.indexOf(a.kind) - SURFACE_KINDS.indexOf(b.kind) || i - j).map(([s]) => s);
  const cap = (list, max, label) => { if (list.length > max) warn(`${list.length - max} ${label} beyond the limit of ${max} were dropped`); return list.slice(0, max); };
  environments = cap(environments, 16, 'environments'); services = cap(services, 32, 'services'); surfaces = cap(surfaces, 64, 'surfaces');

  return validateDetectionDraft({
    version: 1, name, kind: chosenKind.kind, kind_source: { source: chosenKind.source, guess: chosenKind.guess },
    environments, services, surfaces, frameworks: st.frameworks.map(f => clip(f, 64)), files_read, refused: st.refused, warnings: st.warnings,
  });
}

function composePort(p) {
  if (typeof p === 'number') return { skip: 'container-only' };
  if (isPlainObject(p)) {
    const published = own(p, 'published'), protocol = own(p, 'protocol'), hostIp = own(p, 'host_ip');
    if (protocol === 'udp') return { skip: 'udp' };
    if (hostIp !== undefined && !['127.0.0.1', '0.0.0.0', '::1', '::', ''].includes(String(hostIp))) return { skip: 'bound to a non-loopback address' };
    if (published === undefined || published === null) return { skip: 'container-only' };
    const port = validPort(String(published));
    return port ? { port, guess: false } : { skip: 'unsupported published value' };
  }
  if (typeof p !== 'string') return { skip: 'unsupported entry' };
  let s = p.trim();
  if (/\/udp$/i.test(s)) return { skip: 'udp' };
  s = s.replace(/\/tcp$/i, '');
  let guess = false;
  if (s.includes('${')) {
    const replaced = s.replace(/\$\{[A-Za-z_][A-Za-z0-9_]*:?-([0-9]+)\}/g, '$1');
    if (replaced.includes('$')) return { skip: 'uses an interpolated variable' };
    s = replaced; guess = true;
  }
  let host = '';
  const v6 = /^\[([0-9a-fA-F:]+)\]:(.*)$/.exec(s);
  if (v6) { host = v6[1]; s = v6[2]; }
  const parts = s.split(':');
  if (parts.length === 1) return { skip: 'container-only' };
  if (parts.length === 3) { host = parts.shift(); }
  if (parts.length !== 2) return { skip: 'unsupported entry' };
  if (host && !['127.0.0.1', '0.0.0.0', '::1', '::', 'localhost'].includes(host)) return { skip: 'bound to a non-loopback address' };
  if (parts[0].includes('-')) return { skip: 'range' };
  const port = validPort(parts[0]);
  return port ? { port, guess } : { skip: 'unsupported entry' };
}
