/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. https://mozilla.org/MPL/2.0/ */
import { ContextsError } from './errors.mjs';
import { ENV_ORDER } from './environments.mjs';
import { MANIFEST_PATH, parseManifest } from './manifest.mjs';
import {
  ROOT_SCRIPTS, appIconFiles, chooseIcon, iconCandidates, makeTargets, packageManager, procfileProcesses, readmeFacts, runScript, startCommand,
} from './setup.mjs';
import {
  AGENT_DIRS, AGENT_FILES, PLATFORM_KINDS, REFUSAL_REASONS, SURFACE_KINDS, clip, deepFreeze, environmentKey, isPlainObject, own,
  surfaceProminence, trimTrailing, utf8Length, validateBaseUrl, validateDetectionDraft, validateHostPattern, validateWebUrl, stripQueryAndFragment,
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
  // workstation-v1 §1.1: parsed only for its `functions` string.
  'convex.json',
  // workstation-v1 §1.5: how the project is started and what it is (start
  // commands and images in README.md, make/just targets, Procfile.dev
  // processes, the Nx project type). Never executed.
  'README.md', 'Makefile', 'justfile', 'Procfile.dev', 'project.json',
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

// ------------------------------------------- inventory and docs (v2) ----
//
// workstation-v1 §1.2–§1.3. Two more phases after the workspace phase, again
// with every decision in the core and a dumb reader:
//   3. inventoryPlan({ packageDirs }) → { list, check }: directories whose
//      immediate child *directory names* may be listed, and exact paths that may
//      be lstat'ed (presence and "file"/"dir" only; nothing is opened).
//   4. documentFiles(inventory) → the docs/**/domains.md files that may be read
//      with the usual checks (regular file, ≤ 256 KiB, inside the root, UTF-8).

export const MAX_INVENTORY_LIST = 64;
export const MAX_INVENTORY_CHECK = 192;
export const MAX_DOCUMENT_CHILDREN = 8;
const INV_LIST_FIXED = Object.freeze(['docs', '.agent-worktrees', 'ios', 'macos']);
const INV_LIST_SUFFIXES = Object.freeze(['', '/ios', '/macos']);
const INV_CHECK_FIXED = Object.freeze([
  'AGENTS.md', 'CLAUDE.md', '.claude', '.codex', '.agent-worktrees', 'convex', 'convex/schema.ts', 'convex/http.ts',
  'android', 'build.gradle', 'build.gradle.kts', 'android/build.gradle', 'android/build.gradle.kts',
  // workstation-v1 §1.5: start scripts and lockfiles (presence only), as in
  // setup.mjs ROOT_SCRIPTS and LOCKFILES, spelled out for the reader parity check.
  'dev', 'bin/dev', 'script/dev', 'scripts/dev', 'script/server', 'dev.sh', 'start.sh', 'run.sh', 'scripts/dev.sh',
  'pnpm-lock.yaml', 'yarn.lock', 'bun.lockb', 'bun.lock', 'package-lock.json',
]);
const INV_CHECK_SUFFIXES = Object.freeze(['/convex', '/build.gradle', '/build.gradle.kts', '/android/build.gradle', '/android/build.gradle.kts']);
const MAX_LISTING_NAMES = 512;

const planPath = (p, fixed, suffixes) => typeof p === 'string' && (fixed.includes(p) ||
  suffixes.some(s => p.length > s.length && p.endsWith(s) && isPackageDir(p.slice(0, p.length - s.length))));
// True when `p` may appear in some inventory plan's `list` / `check`.
export const isInventoryListPath = p => planPath(p, INV_LIST_FIXED, INV_LIST_SUFFIXES);
export const isInventoryCheckPath = p => planPath(p, INV_CHECK_FIXED, INV_CHECK_SUFFIXES);

export function inventoryPlan({ packageDirs } = {}) {
  if (packageDirs !== undefined && packageDirs !== null && !Array.isArray(packageDirs)) throw new ContextsError('INVALID_INPUT', '$.packageDirs: expected an array of package dirs', '$.packageDirs');
  const dirs = [];
  for (const d of packageDirs ?? []) if (isPackageDir(d) && !dirs.includes(d) && dirs.length < MAX_WORKSPACE_PACKAGES) dirs.push(d);
  const list = [...INV_LIST_FIXED], check = [...INV_CHECK_FIXED];
  const add = (target, p, max) => { if (target.length < max && !target.includes(p)) target.push(p); };
  for (const d of dirs) for (const s of INV_LIST_SUFFIXES) add(list, d + s, MAX_INVENTORY_LIST);
  for (const d of dirs) for (const s of INV_CHECK_SUFFIXES) add(check, d + s, MAX_INVENTORY_CHECK);
  return deepFreeze({ list, check });
}

const isInsideRel = p => typeof p === 'string' && p !== '' && !p.startsWith('/') && !p.includes('\\') && p.split('/').every(s => s && s !== '.' && s !== '..');

// Reader policy for one inventory path (listing or lstat). `resolvedPath` is
// the real path relative to the real root (null outside it); `kind` is what the
// resolved path is: "file", "dir" or "other". With `plan`, the path must be in
// that plan; without it, it must fit the plan shape. A refused path is treated
// as absent (a symlink out of the root is never followed).
export function inventoryRefusal({ path, resolvedPath, kind, plan } = {}) {
  const inPlan = plan !== undefined && plan !== null
    ? [own(plan, 'list'), own(plan, 'check')].some(l => Array.isArray(l) && l.includes(path))
    : isInventoryListPath(path) || isInventoryCheckPath(path);
  if (!inPlan) return 'not_allowlisted';
  if (resolvedPath === null || resolvedPath === undefined || !isInsideRel(resolvedPath)) return 'symlink_outside_root';
  if (kind !== 'file' && kind !== 'dir') return 'not_regular_file';
  return null;
}

const DOC_CHILD = /^docs\/([^/]+)\/domains\.md$/;
export const isDocumentPath = p => typeof p === 'string' && (p === 'docs/domains.md' || (DOC_CHILD.test(p) && okSegment(DOC_CHILD.exec(p)[1])));

// `docs/domains.md` and `docs/<child>/domains.md` for the first 8 child
// directories (sorted) of the `docs` listing. Nothing when docs was not listed.
export function documentFiles(inventory) {
  const kids = own(own(inventory, 'listing'), 'docs');
  if (!Array.isArray(kids)) return Object.freeze([]);
  const names = [...new Set(kids.slice(0, MAX_LISTING_NAMES).filter(n => typeof n === 'string' && okSegment(n)))].sort().slice(0, MAX_DOCUMENT_CHILDREN);
  return Object.freeze(['docs/domains.md', ...names.map(n => `docs/${n}/domains.md`)]);
}

// detectionRefusal for a documented-domains file; the resolved path must be one too.
export function documentRefusal({ path, resolvedPath, isFile, size } = {}) {
  if (!isDocumentPath(path)) return 'not_allowlisted';
  if (resolvedPath === null || resolvedPath === undefined) return 'symlink_outside_root';
  if (!isDocumentPath(resolvedPath)) return 'not_allowlisted';
  if (isFile !== true) return 'not_regular_file';
  if (!Number.isSafeInteger(size) || size < 0 || size > MAX_FILE_BYTES) return 'too_large';
  return null;
}

// Child names from a listing, re-validated: no "..", "/", control characters,
// and no hidden names unless the joined path is itself in the plan shape.
const okChildName = (n, dir) => typeof n === 'string' && n.length >= 1 && n.length <= 255 && n !== '.' && n !== '..' &&
  !/[/\\\u0000-\u001f\u007f]/.test(n) && (!n.startsWith('.') || isInventoryListPath(`${dir}/${n}`) || isInventoryCheckPath(`${dir}/${n}`));

function cleanInventory(inventory, warn) {
  const out = { listing: new Map(), present: new Map() };
  if (inventory === undefined || inventory === null) return out;
  if (!isPlainObject(inventory)) throw new ContextsError('INVALID_INPUT', '$.inventory: expected { listing, present }', '$.inventory');
  for (const k of Object.keys(inventory)) if (k !== 'listing' && k !== 'present') throw new ContextsError('INVALID_INPUT', `$.inventory.${clip(k, 40)}: unknown key`, `$.inventory.${clip(k, 40)}`);
  const listing = own(inventory, 'listing') ?? {}, present = own(inventory, 'present') ?? {};
  if (!isPlainObject(listing)) throw new ContextsError('INVALID_INPUT', '$.inventory.listing: expected an object of dir → child names', '$.inventory.listing');
  if (!isPlainObject(present)) throw new ContextsError('INVALID_INPUT', '$.inventory.present: expected an object of path → "file" | "dir"', '$.inventory.present');
  let ignored = 0;
  for (const dir of Object.keys(listing).slice(0, 1024).sort()) {
    const names = own(listing, dir);
    if (!isInventoryListPath(dir) || !Array.isArray(names) || out.listing.size >= MAX_INVENTORY_LIST) { ignored++; continue; }
    out.listing.set(dir, [...new Set(names.slice(0, MAX_LISTING_NAMES).filter(n => okChildName(n, dir)))].sort());
  }
  for (const p of Object.keys(present).slice(0, 1024).sort()) {
    const kind = own(present, p);
    if (!isInventoryCheckPath(p) || (kind !== 'file' && kind !== 'dir') || out.present.size >= MAX_INVENTORY_CHECK) { ignored++; continue; }
    out.present.set(p, kind);
  }
  if (ignored) warn(`inventory: ${ignored} ${ignored === 1 ? 'entry' : 'entries'} outside the plan ignored`);
  return out;
}

// ------------------------------------------------------- integrations ----

// Fixed, data-only table in display order. Evidence is dependency names
// (exact `packages` or a `scopes` prefix) and the presence of config files or
// directories; never keys, env names or values. Dashboard URLs are generic.
export const INTEGRATIONS = deepFreeze([
  { id: 'vercel', name: 'Vercel', dashboard_url: 'https://vercel.com/dashboard', packages: ['vercel'], scopes: ['@vercel/'] },
  { id: 'convex', name: 'Convex', dashboard_url: 'https://dashboard.convex.dev/', packages: ['convex'], scopes: ['@convex-dev/'] },
  { id: 'clerk', name: 'Clerk', dashboard_url: 'https://dashboard.clerk.com/', packages: [], scopes: ['@clerk/'] },
  { id: 'stripe', name: 'Stripe', dashboard_url: 'https://dashboard.stripe.com/', packages: ['stripe'], scopes: ['@stripe/'] },
  { id: 'supabase', name: 'Supabase', dashboard_url: 'https://supabase.com/dashboard', packages: ['supabase'], scopes: ['@supabase/'] },
  { id: 'firebase', name: 'Firebase', dashboard_url: 'https://console.firebase.google.com/', packages: ['firebase', 'firebase-admin', 'firebase-functions', 'firebase-tools'], scopes: ['@firebase/', '@react-native-firebase/'] },
  { id: 'cloudflare', name: 'Cloudflare', dashboard_url: 'https://dash.cloudflare.com/', packages: ['wrangler'], scopes: ['@cloudflare/'] },
  { id: 'netlify', name: 'Netlify', dashboard_url: 'https://app.netlify.com/', packages: ['netlify-cli'], scopes: ['@netlify/'] },
  { id: 'fly', name: 'Fly.io', dashboard_url: 'https://fly.io/dashboard', packages: [], scopes: [] },
  { id: 'sentry', name: 'Sentry', dashboard_url: 'https://sentry.io/', packages: [], scopes: ['@sentry/'] },
]);
const DEP_FIELDS = ['dependencies', 'devDependencies', 'peerDependencies', 'optionalDependencies'];
export const integrationForPackage = name => typeof name === 'string'
  ? INTEGRATIONS.find(i => i.packages.includes(name) || i.scopes.some(s => name.startsWith(s) && name.length > s.length))?.id ?? null : null;

// --------------------------------------------------------------- domains ----

// Never a product domain: IP literals, localhost, single labels, wildcards,
// reserved names and vendor hosts (a host equal to or below a listed suffix).
export const VENDOR_HOST_SUFFIXES = Object.freeze([
  'vercel.app', 'convex.cloud', 'convex.site', 'clerk.accounts.dev', 'netlify.app', 'fly.dev', 'workers.dev', 'pages.dev',
  'github.com', 'github.io', 'stripe.com', 'example.com', 'example.org', 'example.net', 'example', 'test', 'invalid', 'local', 'localhost',
  // The integrations' own dashboards and docs (workstation-v1 §3 INTEGRATION_HOSTS and their parents).
  'vercel.com', 'vercel.sh', 'convex.dev', 'clerk.com', 'clerk.dev', 'supabase.com', 'supabase.co', 'firebaseapp.com', 'web.app',
  'cloudflare.com', 'netlify.com', 'fly.io', 'sentry.io', 'githubusercontent.com',
]);
const TLD = /^(xn--[a-z0-9-]{1,59}|[a-z]{2,63})$/;
// Lower-cased plain host or null.
function normalHost(raw) {
  if (typeof raw !== 'string' || raw.length > 260) return null;
  let h = raw.trim().replace(/[A-Z]/g, c => c.toLowerCase());
  if (h.endsWith('.')) h = h.slice(0, -1);
  try { return validateHostPattern(h) === h ? h : null; } catch { return null; }
}
export function isProductHost(host) {
  const h = normalHost(host);
  if (!h || h.startsWith('*')) return false;
  const labels = h.split('.');
  if (labels.length < 2 || !TLD.test(labels.at(-1))) return false;
  return !VENDOR_HOST_SUFFIXES.some(s => h === s || h.endsWith(`.${s}`));
}
const urlHost = raw => {
  if (typeof raw !== 'string' || raw.length > 2048 || !/^https?:\/\//i.test(raw)) return null;
  try { return normalHost(new URL(raw).hostname); } catch { return null; }
};
// Backticked names that look like hosts but are file names.
const FILE_EXTENSIONS = new Set(['json', 'jsonc', 'md', 'mdx', 'ts', 'tsx', 'mts', 'cts', 'js', 'jsx', 'mjs', 'cjs', 'toml', 'yaml', 'yml', 'txt', 'lock',
  'sh', 'py', 'rs', 'go', 'swift', 'kt', 'kts', 'gradle', 'html', 'css', 'scss', 'env', 'xml', 'plist', 'png', 'svg', 'jpg', 'jpeg', 'gif', 'webp', 'ico',
  'conf', 'config', 'cfg', 'ini', 'log', 'sql', 'csv', 'pem', 'key', 'xcodeproj', 'xcworkspace', 'entitlements', 'pbxproj', 'storyboard', 'vue', 'svelte', 'astro']);
const MAX_DOC_HOSTS = 256;
// Hostnames written in backticks or as http(s) URLs in a Markdown text, in
// order of appearance, deduplicated, product hosts only.
export function documentedHosts(text) {
  const out = [];
  if (typeof text !== 'string') return Object.freeze(out);
  const RE = /`([^`\n]{1,300})`|\bhttps?:\/\/[^\s<>()`'"[\]{}|\\^]{1,2048}/gi;
  let seen = 0;
  for (const m of text.slice(0, MAX_FILE_BYTES).matchAll(RE)) {
    if (++seen > 4096 || out.length >= MAX_DOC_HOSTS) break;
    let host = null;
    if (m[1] !== undefined) {
      const inner = m[1].trim();
      if (/^https?:\/\//i.test(inner)) host = urlHost(inner.split(/\s/)[0]);
      else if (!/\s/.test(inner)) {
        const bare = inner.split('/')[0].replace(/:[0-9]{1,5}$/, '');
        if (!FILE_EXTENSIONS.has(bare.split('.').at(-1).toLowerCase())) host = normalHost(bare);
      }
    } else host = urlHost(trimTrailingPunctuation(m[0]));
    if (host && isProductHost(host) && !out.includes(host)) out.push(host);
  }
  return Object.freeze(out);
}
const trimTrailingPunctuation = s => { let end = s.length; while (end > 0 && '.,;:!?*'.includes(s[end - 1])) end--; return s.slice(0, end); };

// --------------------------------------------------------------- detect ----

const slug = s => {
  if (typeof s !== 'string') return '';
  const out = s.toLowerCase().replace(/^@[^/]*\//, '').replace(/[^a-z0-9._-]+/g, '-').replace(/^[^a-z0-9]+/, '');
  return clip(trimTrailing(out, '-'), 40);
};

export function detectProject({ rootName, files = {}, refused = [], packages, inventory, docs, icons } = {}) {
  if (!isPlainObject(files)) throw new ContextsError('INVALID_INPUT', '$.files: expected an object of relative path → text', '$.files');
  if (!Array.isArray(refused)) throw new ContextsError('INVALID_INPUT', '$.refused: expected an array', '$.refused');
  if (packages !== undefined && packages !== null && !isPlainObject(packages)) throw new ContextsError('INVALID_INPUT', '$.packages: expected an object of package dir → { files, refused }', '$.packages');
  if (docs !== undefined && docs !== null && !isPlainObject(docs)) throw new ContextsError('INVALID_INPUT', '$.docs: expected an object of docs path → text', '$.docs');
  if (icons !== undefined && icons !== null && !isPlainObject(icons)) throw new ContextsError('INVALID_INPUT', '$.icons: expected { listing, sizes }', '$.icons');
  const st = {
    warnings: [], refused: [], envs: [], services: [], surfaces: [], frameworks: [], kinds: [], names: [], registry: [],
  };
  const entries = []; // { command, source, guess } start commands not tied to a dev server
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

  // Phases 3 and 4 (workstation-v1 §1.2–§1.3): names/presence and documented domains.
  const inv = cleanInventory(inventory, warn);
  const docText = readUnit(docs ?? {}, isDocumentPath, '');
  const docPaths = Object.keys(docText).sort();
  if (docPaths.length > 1 + MAX_DOCUMENT_CHILDREN) {
    for (const p of docPaths.splice(1 + MAX_DOCUMENT_CHILDREN)) delete docText[p];
    warn(`docs: only ${1 + MAX_DOCUMENT_CHILDREN} domains.md files are read`);
  }
  files_read.push(...docPaths);
  const v2 = () => collectV2({ units, inv, docText, docPaths, rootName, warn });

  // `unit` and `role` are internal tags; they are replaced by `app` below.
  const addEnv = (name, url, source, guess, unit = '', role = 'remote') => {
    try { st.envs.push({ name, base_url: validateBaseUrl(url), source: clip(source, 256), guess, unit, role }); } catch { warn(`${source}: ignored an invalid URL`); }
  };
  // `url` may be null for a service that only has a start command (manifest v3).
  const addService = (name, url, port, source, guess, unit = '', role = 'other', { command = null, cwd = null } = {}) => {
    if (url === null && !command) return;
    try {
      st.services.push({ name: safeName(name) || 'service', url: url === null ? null : validateWebUrl(stripQueryAndFragment(url)), port: url === null ? null : port,
        source: clip(source, 256), guess, unit, role, command, cwd: command && cwd ? cwd : null });
    } catch { warn(`${source}: ignored an invalid service URL`); }
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
        version: 3, name: m.name, kind: m.kind, kind_source: { source: src, guess: false },
        icon: m.icon ? { path: m.icon, source: src, guess: false } : null,
        environments: m.environments.map(e => ({ ...e, source: src, guess: false })),
        services: m.services.map(s => ({ ...s, source: src, guess: false })),
        surfaces: m.surfaces.map(s => ({ ...s, prominence: surfaceProminence(s), source: src, guess: false })),
        frameworks: [], files_read, refused: st.refused, warnings: st.warnings, ...v2(),
      });
    } catch (e) { warn(`${MANIFEST_PATH}: ignored (${e instanceof ContextsError ? e.code : 'unreadable'})`); }
  }

  const rootPkgJson = json('package.json');
  const pm = packageManager({ present: inv.present, pkg: rootPkgJson });
  // The folder a unit's command runs in (null = the project folder).
  const cwdOf = u => (u.dir ? u.dir : null);
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
      u.scripts = scripts; u.found = found;
      const pj = at('package.json');
      const run = f => ({ command: runScript(pm, f.script), cwd: cwdOf(u) });
      const web = found.find(f => f.kind === 'web');
      if (web) {
        const source = web.explicit ? `${pj} scripts.${web.script} (${web.id} port ${web.port})` : `${web.label} default port (${pj} scripts.${web.script})`;
        addEnv('local', `http://localhost:${web.port}`, source, !web.explicit, u.dir, 'web');
        addService(`${web.label} dev server`, `http://localhost:${web.port}`, web.port, source, !web.explicit, u.dir, 'web', run(web));
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
        addService(f.label, `http://localhost:${f.port}`, f.port, `${pj} scripts.${f.script}`, !f.explicit, u.dir, 'other', run(f));
      }
      const desktop = found.find(f => f.kind === 'desktop');
      if (desktop) kind('desktop', `${pj} scripts.${desktop.script} (${desktop.id})`, false, 1);
      // Electron's own start command; Tauri's is added with its config below.
      if (desktop && desktop.id !== 'tauri') addService(`${desktop.label} app`, null, null, `${pj} scripts.${desktop.script}`, false, u.dir, 'desktop', run(desktop));
      else if (deps.has('electron')) { framework('electron'); kind('desktop', `${pj} dependency electron`, false, 1); }
      if (desktop?.port && !web) {
        const source = `${desktop.label} default port (${pj} scripts.${desktop.script})`;
        addEnv('local', `http://localhost:${desktop.port}`, source, true, u.dir, 'desktop');
      }
      const mobile = found.find(f => f.kind === 'mobile') ?? (deps.has('expo') || deps.has('react-native') ? { id: deps.has('expo') ? 'expo' : 'react-native', script: null } : null);
      if (mobile) { framework(mobile.id); kind('mobile', mobile.script ? `${pj} scripts.${mobile.script} (${mobile.id})` : `${pj} dependency ${mobile.id}`, false, 2); }
      if (mobile?.script) addService(`${mobile.label} app`, null, null, `${pj} scripts.${mobile.script}`, false, u.dir, 'other', run(mobile));
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
      // `tauri dev` through the package's own script, else the Cargo subcommand.
      const tauriScript = (u.found ?? []).find(f => f.id === 'tauri');
      const tauriRun = tauriScript ? { command: runScript(pm, tauriScript.script), cwd: cwdOf(u) }
        : isPlainObject(u.scripts) && Object.hasOwn(u.scripts, 'tauri') ? { command: runScript(pm, 'tauri', 'dev'), cwd: cwdOf(u) }
          : { command: 'cargo tauri dev', cwd: cwdOf(u) };
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
        if (port) addService('Tauri dev server', url, port, `${at(path)} ${field}`, false, u.dir, 'desktop', tauriRun);
      }
      if (!devEnv) addService('Desktop app (Tauri)', null, null, at(path), false, u.dir, 'desktop', tauriRun);
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
        const up = /^[A-Za-z0-9][A-Za-z0-9_.-]{0,62}$/.test(svc) ? { command: `docker compose up ${svc}` } : {};
        addService(list.length > 1 ? `${svc} (${r.port})` : svc, `http://localhost:${r.port}`, r.port, `${composePath} services.${clip(svc, 60)}.ports`, r.guess, '', 'other', up);
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
    // A workspace root only groups crates; the product is decided elsewhere
    // (an app bundle, a README start command). It stays the last fallback.
    else kind('library', p ? 'Cargo.toml [package]' : 'Cargo.toml [workspace]', true, p ? 8 : 9);
    if (Array.isArray(bins) && bins.length) entries.push({ command: 'cargo run', source: 'Cargo.toml [[bin]]', guess: true, late: true });
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
      kind('library', 'go.mod', true, 8);
      if (m[2].split('/')[0].includes('.')) addSurface('pkg.go.dev', `https://pkg.go.dev/${m[2]}`, 'docs', 'go.mod module', true);
    } else warn('go.mod: no valid module line');
  }

  // Nx project.json: an application is never a library, whatever else guessed.
  const nx = json('project.json');
  const nxType = str(own(nx, 'projectType'));
  if (nx) st.names.push([6, safeName(own(nx, 'name'))]);
  if (nxType === 'library') kind('library', 'project.json projectType', false, 5);
  if (nxType === 'application') st.kinds = st.kinds.filter(k => !(k.kind === 'library' && k.guess));

  // Start commands documented or kept in the folder (workstation-v1 §1.5),
  // in order of trust: README code blocks, start scripts, make/just targets.
  const readme = has('README.md') ? readmeFacts(root.text['README.md']) : { commands: [], images: [] };
  const addEntry = (command, source, guess) => {
    const c = startCommand(command);
    if (c && !entries.some(e => e.command === c) && entries.length < 16) entries.push({ command: c, source: clip(source, 256), guess });
  };
  for (const c of readme.commands) addEntry(c, 'README.md', false);
  for (const script of ROOT_SCRIPTS) if (inv.present.get(script) === 'file') addEntry(script.includes('/') ? script : `./${script}`, `${script} (start script in the folder)`, true);
  if (has('Makefile')) for (const t of makeTargets(root.text.Makefile)) addEntry(`make ${t}`, `Makefile target ${t}`, false);
  if (has('justfile')) for (const t of makeTargets(root.text.justfile, { just: true })) addEntry(`just ${t}`, `justfile recipe ${t}`, false);
  if (has('Procfile.dev') && procfileProcesses(root.text['Procfile.dev']).length) addEntry('foreman start -f Procfile.dev', 'Procfile.dev', true);

  // A macOS app icon in the folder means a desktop app unless a stronger
  // signal (a framework, a web dev server) said otherwise.
  const iconListing = isPlainObject(own(icons, 'listing')) ? icons.listing : {};
  const appIcons = appIconFiles(iconListing);
  if (appIcons.length) kind('desktop', `${appIcons[0]} (macOS app icon)`, true, 3.5);
  if (inv.present.get('android') === 'dir') kind('mobile', 'android/ folder', true, 7);

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

  // Kind, name, registry surfaces. Native app projects (Xcode, Gradle) count
  // after web dev servers, so a suite with a web app stays a web project.
  const extra = v2();
  for (const p of extra.platforms) {
    if (p.kind === 'macos') kind('desktop', p.source, false, 3.6);
    else if (p.kind === 'ios' || p.kind === 'android') kind('mobile', p.source, false, 3.6);
  }
  const chosenKind = st.kinds.sort((a, b) => a.rank - b.rank)[0] ?? { kind: 'web', source: 'default', guess: true };
  if (['library', 'cli'].includes(chosenKind.kind)) {
    const npmName = rootPkg && own(rootPkg, 'private') !== true && str(own(rootPkg, 'name'));
    if (npmName && /^(@[a-z0-9][a-z0-9._~-]*\/)?[a-z0-9][a-z0-9._~-]{0,213}$/.test(npmName)) addSurface('npm', `https://www.npmjs.com/package/${npmName}`, 'package', 'package.json name', true);
    for (const [label, url, k, source] of st.registry) addSurface(label, url, k, source, true);
  }
  const name = st.names.filter(([, n]) => n).sort((a, b) => a[0] - b[0])[0]?.[1] || safeName(rootName) || 'project';

  // Without any service command, the best documented start command starts
  // the project: it joins the one local dev server, or stands on its own.
  const startEntry = [...entries.filter(e => !e.late), ...entries.filter(e => e.late)][0];
  if (startEntry && !st.services.some(s => s.command)) {
    const local = st.services.filter(s => s.url !== null);
    if (local.length === 1) Object.assign(local[0], { command: startEntry.command, cwd: null });
    else {
      const label = { desktop: 'Desktop app', mobile: 'Mobile app', web: 'Dev server', cli: 'Command line', library: 'Dev command' }[chosenKind.kind];
      addService(label, null, null, startEntry.source, startEntry.guess, '', 'entry', { command: startEntry.command });
    }
  }

  // Icon: the manifest's, else the best readable image named by configuration,
  // the README or an icon-like file name in an icon folder.
  const icon = chooseIcon(iconCandidatesFor({ files: root.text, packages: units.slice(1), listing: iconListing, readme }), own(icons, 'sizes') ?? {});

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
    const app = (s.role !== 'other' && s.role !== 'entry' || s.unit !== '') ? appOf(s) : undefined;
    return { name: s.name, ...(app ? { app } : {}), ...(s.url !== null ? { url: s.url, port: s.port } : {}),
      ...(s.command ? { command: s.command } : {}), ...(s.command && s.cwd ? { cwd: s.cwd } : {}), source: s.source, guess: s.guess };
  });

  // Dedupe and cap. Explicit values beat guesses; first wins otherwise. A
  // service that loses keeps nothing, except that its start command moves to
  // the winner when the winner has none.
  const pick = (list, keyOf2) => {
    const out = new Map();
    for (const item of list) {
      const k = keyOf2(item), prev = out.get(k);
      if (!prev) out.set(k, item);
      else if (prev.guess && !item.guess) out.set(k, item.command || !prev.command ? item : { ...item, command: prev.command, ...(prev.cwd ? { cwd: prev.cwd } : {}) });
      else if (!prev.command && item.command) out.set(k, { ...prev, command: item.command, ...(item.cwd ? { cwd: item.cwd } : {}) });
    }
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
  let services = pick(serviceList.filter(s => !(s.guess && s.url && superseded.has(s.url))), s => s.port ?? `command:${s.command}`);
  let surfaces = pick(st.surfaces, s => s.url).map((s, i) => [s, i]).sort(([a, i], [b, j]) => SURFACE_KINDS.indexOf(a.kind) - SURFACE_KINDS.indexOf(b.kind) || i - j).map(([s]) => s);
  const cap = (list, max, label) => { if (list.length > max) warn(`${list.length - max} ${label} beyond the limit of ${max} were dropped`); return list.slice(0, max); };
  environments = cap(environments, 16, 'environments'); services = cap(services, 32, 'services'); surfaces = cap(surfaces, 64, 'surfaces');

  return validateDetectionDraft({
    version: 3, name, kind: chosenKind.kind, kind_source: { source: chosenKind.source, guess: chosenKind.guess }, icon,
    environments, services, surfaces, frameworks: st.frameworks.map(f => clip(f, 64)), files_read, refused: st.refused, warnings: st.warnings, ...extra,
  });
}

// ------------------------------------------------------- icon search ----

// Images named by project configuration: Tauri bundle.icon (relative to the
// config), electron-builder and package.json build icons, README images
// (strongest when called a logo or icon). Paths only; the reader checks them.
function iconHints({ files = {}, packages = [], readme = null } = {}) {
  const hints = [];
  const add = (path, source, weight) => { if (typeof path === 'string' && hints.length < 32) hints.push({ path, source, weight }); };
  const parse = text => { try { const v = JSON.parse(text); return isPlainObject(v) ? v : undefined; } catch { return undefined; } };
  const units = [{ dir: '', text: isPlainObject(files) ? files : {} },
    ...(Array.isArray(packages) ? packages : []).filter(u => isPlainObject(u?.text) && typeof u.dir === 'string')];
  for (const u of units) {
    const prefix = u.dir ? `${u.dir}/` : '';
    for (const path of ['src-tauri/tauri.conf.json', 'tauri.conf.json']) {
      const conf = typeof u.text[path] === 'string' ? parse(u.text[path]) : undefined;
      const list = own(own(conf, 'bundle'), 'icon') ?? own(own(own(conf, 'tauri'), 'bundle'), 'icon');
      const base = resolveRel(u.dir, path.includes('/') ? 'src-tauri' : '');
      for (const icon of Array.isArray(list) ? list.slice(0, 8) : []) {
        const rel = typeof icon === 'string' && base !== null ? resolveRel(base, icon) : null;
        if (rel) add(rel, `${prefix}${path} bundle.icon`, 45);
      }
    }
    const pkg = typeof u.text['package.json'] === 'string' ? parse(u.text['package.json']) : undefined;
    for (const [value, source] of [[own(own(pkg, 'build'), 'icon'), 'package.json build.icon'], [own(own(own(pkg, 'build'), 'mac'), 'icon'), 'package.json build.mac.icon']]) {
      const rel = typeof value === 'string' ? resolveRel(u.dir, value) : null;
      if (rel) add(rel, `${prefix}${source}`, 45);
    }
  }
  const eb = typeof files['electron-builder.json'] === 'string' ? parse(files['electron-builder.json']) : undefined;
  for (const value of [own(eb, 'icon'), own(own(eb, 'mac'), 'icon')]) { const rel = typeof value === 'string' ? resolveRel('', value) : null; if (rel) add(rel, 'electron-builder.json icon', 45); }
  const facts = readme ?? (typeof files['README.md'] === 'string' ? readmeFacts(files['README.md']) : null);
  for (const image of facts?.images ?? []) add(image.path, 'README.md image', /logo|icon|brand/i.test(`${image.alt} ${image.path}`) ? 40 : 10);
  return hints;
}

/** Icon candidates for a folder, best first (workstation-v1 §1.5): the reader
 * asks for the metadata of exactly these paths, then detectProject chooses
 * the same way. `packages` are { dir, text } units or the reader's
 * `{ [dir]: { files } }` object. */
export function iconCandidatesFor({ files = {}, packages = [], listing = {}, readme = null } = {}) {
  const units = Array.isArray(packages) ? packages
    : isPlainObject(packages) ? Object.keys(packages).filter(isPackageDir).map(dir => ({ dir, text: own(own(packages, dir), 'files') ?? {} })) : [];
  return iconCandidates({ listing, hints: iconHints({ files, packages: units, readme }) });
}

// ------------------------------------------------- detection v2 fields ----

const lastSegment = p => (p ? p.split('/').at(-1) : '');
const jsonObject = t => { if (typeof t !== 'string') return undefined; try { const v = JSON.parse(t); return isPlainObject(v) ? v : undefined; } catch { return undefined; } };
const listOf = v => (Array.isArray(v) ? v : []);
const XCODE = /\.(xcodeproj|xcworkspace)$/i;
const MOBILE_NAME = /ios|mobile|phone/i;
const ELECTRON_IDS = ['electron', 'electron-vite'];

// Integrations, platforms, domains and agent presence (workstation-v1 §1.4)
// from the supplied texts, the cleaned inventory and the docs. Never throws on
// hostile content; parse problems were already reported by the main scan.
function collectV2({ units, inv, docText, docPaths, rootName, warn }) {
  const hasIn = (u, p) => Object.prototype.hasOwnProperty.call(u.text, p);

  // Integrations.
  const evidence = new Map();
  const addEvidence = (id, source) => {
    const list = evidence.get(id) ?? [];
    const s = clip(source, 256);
    if (!list.includes(s) && list.length < 8) list.push(s);
    evidence.set(id, list);
  };
  for (const u of units) {
    const pkg = jsonObject(u.text['package.json']);
    for (const field of DEP_FIELDS) {
      const deps = own(pkg, field);
      if (!isPlainObject(deps)) continue;
      for (const name of Object.keys(deps).slice(0, 4096)) { const id = integrationForPackage(name); if (id) addEvidence(id, `${u.prefix}package.json#${field}`); }
    }
    for (const [file, id] of [['vercel.json', 'vercel'], ['.vercel/project.json', 'vercel'], ['wrangler.toml', 'cloudflare'], ['wrangler.json', 'cloudflare'], ['netlify.toml', 'netlify']]) {
      if (hasIn(u, file)) addEvidence(id, `${u.prefix}${file}`);
    }
    if (u.isRoot && hasIn(u, 'fly.toml')) addEvidence('fly', 'fly.toml');
    if (u.isRoot && hasIn(u, 'convex.json')) {
      // Parsed only for its `functions` string (the Convex functions directory).
      const fn = own(jsonObject(u.text['convex.json']), 'functions');
      addEvidence('convex', typeof fn === 'string' && resolveRel('', fn) ? 'convex.json#functions' : 'convex.json');
    }
  }
  for (const [p, kind] of inv.present) if (kind === 'dir' && (p === 'convex' || p.endsWith('/convex'))) addEvidence('convex', `${p}/`);
  const integrations = INTEGRATIONS.filter(i => evidence.has(i.id))
    .map(i => ({ id: i.id, name: i.name, dashboard_url: i.dashboard_url, sources: evidence.get(i.id) }));

  // Platforms.
  const platforms = [];
  const addPlatform = (kind, name, path, source) => {
    const n = clip(safeName(name), 64);
    if (!n || platforms.some(x => x.kind === kind && x.path === path && x.name === n)) return;
    platforms.push({ kind, name: n, path, source: clip(source, 256) });
  };
  for (const u of units) {
    for (const path of ['src-tauri/tauri.conf.json', 'tauri.conf.json']) {
      const conf = jsonObject(u.text[path]);
      if (!conf) continue;
      const product = safeName(own(conf, 'productName')) || safeName(own(own(conf, 'package'), 'productName'));
      const dir = path.includes('/') ? (u.dir ? `${u.dir}/src-tauri` : 'src-tauri') : u.dir;
      addPlatform('tauri', product || lastSegment(u.dir) || 'Desktop', dir, `${u.prefix}${path}`);
      break;
    }
    // Electron, as the main scan finds it: a dev script, an electron
    // dependency, package.json build (root) or electron-builder.* (root).
    const pkg = jsonObject(u.text['package.json']);
    const deps = new Set();
    for (const field of DEP_FIELDS) { const d = own(pkg, field); if (isPlainObject(d)) for (const n of Object.keys(d).slice(0, 4096)) deps.add(n); }
    const scripts = isPlainObject(own(pkg, 'scripts')) ? own(pkg, 'scripts') : {};
    const budget = { calls: 0 };
    const viaScript = Object.keys(scripts).slice(0, 200).some(n => analyzeScript(scripts, n, deps, budget).some(f => ELECTRON_IDS.includes(f.id)));
    const builder = u.isRoot ? ['electron-builder.json', 'electron-builder.yml'].find(f => hasIn(u, f)) : undefined;
    const build = u.isRoot && isPlainObject(own(pkg, 'build')) && (own(pkg.build, 'appId') !== undefined || own(pkg.build, 'productName') !== undefined) ? pkg.build : undefined;
    if (viaScript || deps.has('electron') || builder || build) {
      let product = safeName(own(build, 'productName'));
      if (builder === 'electron-builder.json') product ||= safeName(own(jsonObject(u.text[builder]), 'productName'));
      if (builder === 'electron-builder.yml') { const y = parseYaml(u.text[builder]).value; product ||= safeName(own(y, 'productName')); }
      addPlatform('electron', product || lastSegment(u.dir) || 'Desktop', u.dir, builder ?? `${u.prefix}package.json`);
    }
  }
  for (const [dir, names] of inv.listing) {
    if (dir === 'docs' || dir === '.agent-worktrees') continue;
    const seg = lastSegment(dir);
    for (const child of names) {
      const ext = XCODE.exec(child);
      if (!ext) continue;
      const base = child.slice(0, -ext[0].length);
      const ios = seg.toLowerCase().endsWith('ios') || MOBILE_NAME.test(seg) || MOBILE_NAME.test(base);
      addPlatform(ios ? 'ios' : 'macos', base, dir, `${dir}/${child}`);
    }
  }
  // Android: a build.gradle(.kts) in android/, in a package dir whose name
  // contains "android", or in <package dir>/android/. A listed dir is a package
  // dir (the plan lists every package dir), which settles apps/android/build.gradle.
  for (const [p, kind] of inv.present) {
    if (kind !== 'file' || !/(^|\/)build\.gradle(\.kts)?$/.test(p)) continue;
    const dir = p.includes('/') ? p.slice(0, p.lastIndexOf('/')) : '';
    const parent = dir.includes('/') ? dir.slice(0, dir.lastIndexOf('/')) : '';
    let name = null;
    if (dir === '') name = typeof rootName === 'string' && /android/i.test(rootName) ? rootName : null;
    else if (dir === 'android') name = 'android';
    else if (!inv.listing.has(dir) && lastSegment(dir) === 'android' && isPackageDir(parent)) name = lastSegment(parent);
    else if (/android/i.test(lastSegment(dir))) name = lastSegment(dir);
    if (name) addPlatform('android', name, dir, p);
  }
  const kindRank = k => PLATFORM_KINDS.indexOf(k);
  const orderedPlatforms = platforms.map((p, i) => [p, i]).sort(([a, i], [b, j]) => kindRank(a.kind) - kindRank(b.kind) || i - j).map(([p]) => p);

  // Domains: explicit configuration first, then documented (unconfirmed).
  const domains = [];
  let dropped = 0;
  const addDomain = (host, origin, source) => {
    const h = normalHost(host);
    if (!h || !isProductHost(h) || domains.some(d => d.host === h)) return;
    if (domains.length >= 32) { dropped++; return; }
    domains.push({ host: h, origin, source: clip(source, 256), confirmed: false });
  };
  for (const u of units) {
    const vj = jsonObject(u.text['vercel.json']);
    if (!vj) continue;
    for (const r of listOf(own(vj, 'redirects')).slice(0, 512)) {
      for (const h of listOf(own(r, 'has')).slice(0, 16)) if (own(h, 'type') === 'host' && typeof own(h, 'value') === 'string') addDomain(h.value, 'vercel_json', `${u.prefix}vercel.json redirects[].has`);
      const d = urlHost(own(r, 'destination'));
      if (d) addDomain(d, 'vercel_json', `${u.prefix}vercel.json redirects[].destination`);
    }
    for (const r of listOf(own(vj, 'rewrites')).slice(0, 512)) {
      const d = urlHost(own(r, 'destination'));
      if (d) addDomain(d, 'vercel_json', `${u.prefix}vercel.json rewrites[].destination`);
    }
  }
  const routeHost = r => {
    const pattern = typeof r === 'string' ? r : typeof own(r, 'pattern') === 'string' ? own(r, 'pattern') : typeof own(r, 'custom_domain') === 'string' ? own(r, 'custom_domain') : null;
    if (!pattern || pattern.length > 512) return null;
    return pattern.replace(/^https?:\/\//i, '').split('/')[0];
  };
  for (const u of units) {
    const src = hasIn(u, 'wrangler.toml') ? 'wrangler.toml' : hasIn(u, 'wrangler.json') ? 'wrangler.json' : null;
    if (!src) continue;
    const cfg = src === 'wrangler.toml' ? parseToml(u.text[src]).value : jsonObject(u.text[src]);
    const envs = isPlainObject(own(cfg, 'env')) ? Object.values(own(cfg, 'env')).slice(0, 8) : [];
    for (const c of [cfg, ...envs]) {
      for (const r of [own(c, 'route'), ...listOf(own(c, 'routes')).slice(0, 64)]) { const h = routeHost(r); if (h) addDomain(h, 'wrangler', `${u.prefix}${src} routes`); }
    }
  }
  for (const u of units) {
    if (!hasIn(u, 'netlify.toml')) continue;
    for (const r of listOf(own(parseToml(u.text['netlify.toml']).value, 'redirects')).slice(0, 512)) {
      const h = urlHost(own(r, 'from'));
      if (h) addDomain(h, 'netlify', `${u.prefix}netlify.toml redirects[].from`);
    }
  }
  for (const path of docPaths) for (const h of documentedHosts(docText[path])) addDomain(h, 'docs', path);
  if (dropped) warn(`${dropped} domain(s) beyond the limit of 32 were dropped`);

  // Agents: fixed names only; worktree names are counted, never stored.
  const agents = {
    files: AGENT_FILES.filter(f => inv.present.get(f) === 'file'),
    dirs: AGENT_DIRS.filter(d => inv.present.get(d) === 'dir'),
    worktrees: 0,
  };
  if (agents.dirs.includes('.agent-worktrees')) agents.worktrees = Math.min((inv.listing.get('.agent-worktrees') ?? []).length, 512);

  if (orderedPlatforms.length > 16) warn(`${orderedPlatforms.length - 16} platform(s) beyond the limit of 16 were dropped`);
  return { integrations, platforms: orderedPlatforms.slice(0, 16), domains, agents };
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
