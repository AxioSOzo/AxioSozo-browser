/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. https://mozilla.org/MPL/2.0/ */
import { ICON_EXTENSIONS, clip, isPlainObject, own } from './schema.mjs';

// Project setup facts for detection (workstation-v1 §1.5): how a developer
// starts the project and which image is its icon. Pure functions over texts,
// names and sizes the reader supplies; nothing here reads, lists or runs.

// ------------------------------------------------------------ commands ----

// Executable start scripts a project may keep in its folder (presence only).
export const ROOT_SCRIPTS = Object.freeze(['dev', 'bin/dev', 'script/dev', 'scripts/dev', 'script/server', 'dev.sh', 'start.sh', 'run.sh', 'scripts/dev.sh']);
// Lockfiles name the package manager (presence only).
export const LOCKFILES = Object.freeze([['pnpm-lock.yaml', 'pnpm'], ['yarn.lock', 'yarn'], ['bun.lockb', 'bun'], ['bun.lock', 'bun'], ['package-lock.json', 'npm']]);
export const PACKAGE_MANAGERS = Object.freeze(['npm', 'pnpm', 'yarn', 'bun']);

const SCRIPT_NAME = /^[A-Za-z0-9][A-Za-z0-9:_.-]{0,63}$/;
const TARGET = /^[A-Za-z0-9][A-Za-z0-9_.-]{0,63}$/;
const START_WORDS = new Set(['dev', 'develop', 'start', 'serve', 'server', 'run', 'up', 'watch']);
const MAX_COMMAND = 200;

/** The package manager of a JavaScript project: its lockfile, else the
 * package.json `packageManager` field, else npm. */
export function packageManager({ present, pkg } = {}) {
  const has = path => (present instanceof Map ? present.get(path) : own(present, path)) === 'file';
  for (const [file, pm] of LOCKFILES) if (has(file)) return pm;
  const declared = own(pkg, 'packageManager');
  const name = typeof declared === 'string' ? declared.split('@')[0] : '';
  return PACKAGE_MANAGERS.includes(name) ? name : 'npm';
}

/** The command that runs one package.json script, or null for a name that
 * would not survive being typed in a terminal. `args` follow the script. */
export function runScript(pm, script, args = '') {
  if (!SCRIPT_NAME.test(script)) return null;
  const tail = args ? ` ${args}` : '';
  if (pm === 'npm') return script === 'start' && !tail ? 'npm start' : `npm run ${script}${tail ? ` --${tail}` : ''}`;
  if (pm === 'bun') return `bun run ${script}${tail}`;
  return `${PACKAGE_MANAGERS.includes(pm) ? pm : 'npm'} ${script}${tail}`;
}

// Words that make a command a chore rather than a start (install, test, …).
const CHORES = /\b(install|i|ci|add|remove|setup|bootstrap|init|test|tests|build|lint|check|doctor|release|deploy|publish|clean|fmt|format|login|logout|migrate|seed|generate|codegen|typecheck|audit|upgrade|update|smoke|probe|bench|coverage|package|dist|export|prepare)\b/i;

/** A command a developer types to start the project, normalized to one line,
 * or null. Known runners only: package managers, make/just/task, Cargo, Go,
 * Docker Compose, Python and Ruby servers, and a start script in the folder. */
export function startCommand(raw) {
  if (typeof raw !== 'string') return null;
  let cmd = raw.replace(/\s+#.*$/, '').trim().replace(/^[$%>]\s+/, '').replace(/\s+/g, ' ');
  if (!cmd || cmd.length > MAX_COMMAND || /[\u0000-\u001f\u007f`|;<>]|&&|\$\(/.test(cmd)) return null;
  const t = cmd.split(' ');
  const [a, b, c] = t;
  const script = /^(?:\.\/)?((?:bin|script|scripts)\/)?(dev|start|run|serve|server|up)(\.sh)?$/.exec(a);
  // A start script runs as is, with flags, or with a start word (./dev serve);
  // any other subcommand (./dev image-fetch …) is a tool, not a start.
  const positional = t.slice(1).filter(x => !x.startsWith('-'));
  if (script && (a.startsWith('./') || script[1]) && (t.length === 1 || START_WORDS.has(t[1]) || (t[1].startsWith('-') && positional.length <= 1))
      && !t.slice(1).some(x => CHORES.test(x))) return cmd;
  if (['npm', 'pnpm', 'yarn', 'bun'].includes(a)) {
    const name = b === 'run' || b === 'run-script' ? c : b;
    if (typeof name !== 'string' || CHORES.test(name)) return null;
    const head = name.split(':')[0];
    if (START_WORDS.has(head) || (name === 'tauri' && t.includes('dev'))) return cmd;
    return null;
  }
  if (a === 'npx' && b === 'tauri' && c === 'dev') return cmd;
  if ((a === 'make' || a === 'just' || a === 'task') && b && START_WORDS.has(b.split(':')[0])) return cmd;
  if (a === 'cargo' && (b === 'run' || (b === 'tauri' && c === 'dev') || (b === 'watch' && t.includes('run')))) return cmd;
  if (a === 'go' && b === 'run') return cmd;
  if ((a === 'docker' && b === 'compose' && c === 'up') || (a === 'docker-compose' && b === 'up')) return cmd;
  if (a === 'deno' && b === 'task' && c && START_WORDS.has(c)) return cmd;
  if ((a === 'python' || a === 'python3') && b === 'manage.py' && c === 'runserver') return cmd;
  if ((a === 'flask' && b === 'run') || a === 'uvicorn' || (a === 'rails' && (b === 'server' || b === 's'))) return cmd;
  if ((a === 'bin/rails' || a === './bin/rails') && (b === 'server' || b === 's')) return cmd;
  if (a === 'foreman' && b === 'start') return cmd;
  if (a === 'hugo' && (b === 'server' || b === 'serve')) return cmd;
  if (a === 'mix' && b === 'phx.server') return cmd;
  return null;
}

const FENCE = /^(`{3,}|~{3,})[ \t]*([A-Za-z0-9_-]*)[^\n]*\n([\s\S]*?)^\1[ \t]*$/gm;
const SHELL_LANGS = new Set(['', 'sh', 'bash', 'shell', 'console', 'zsh', 'fish', 'terminal', 'shell-session', 'shellsession']);
const MD_IMAGE = /!\[([^\]\n]{0,200})\]\(\s*<?([^)\s>]{1,400})>?(?:\s+"[^"\n]*")?\s*\)/g;
const HTML_IMAGE = /<img\b[^>]{0,800}>/gi;
const ATTR = name => new RegExp(`\\b${name}\\s*=\\s*(?:"([^"]*)"|'([^']*)')`, 'i');

/** From a README: the start commands in its shell code blocks (in order) and
 * the relative images it shows (with their alt text). */
export function readmeFacts(text) {
  const commands = [], images = [];
  if (typeof text !== 'string') return { commands, images };
  const body = text.slice(0, 262144);
  let blocks = 0;
  for (const m of body.matchAll(FENCE)) {
    if (++blocks > 200 || commands.length >= 16) break;
    if (!SHELL_LANGS.has(m[2].toLowerCase())) continue;
    for (const line of m[3].split('\n').slice(0, 100)) {
      const cmd = startCommand(line);
      if (cmd && !commands.includes(cmd)) commands.push(cmd);
    }
  }
  const addImage = (src, alt) => {
    const path = relativeImage(src);
    if (path && images.length < 16 && !images.some(x => x.path === path)) images.push({ path, alt: clip(alt ?? '', 200) });
  };
  for (const m of body.matchAll(MD_IMAGE)) addImage(m[2], m[1]);
  for (const m of body.matchAll(HTML_IMAGE)) {
    const src = ATTR('src').exec(m[0]), alt = ATTR('alt').exec(m[0]);
    if (src) addImage(src[1] ?? src[2], alt ? alt[1] ?? alt[2] : '');
  }
  return { commands, images };
}

const relativeImage = src => {
  if (typeof src !== 'string' || /^[a-z][a-z0-9+.-]*:|^\/|^~|\\/i.test(src)) return null;
  const path = src.split(/[?#]/)[0].replace(/^(\.\/)+/, '');
  return isIconFile(path) ? path : null;
};

/** `make` targets and `just` recipes that start something (dev, start, …). */
export function makeTargets(text, { just = false } = {}) {
  const out = [];
  if (typeof text !== 'string') return out;
  const re = just ? /^@?([A-Za-z0-9][A-Za-z0-9_-]{0,63})(?:\s+[^:\n]*)?:(?!=)/gm : /^([A-Za-z0-9][A-Za-z0-9_.-]{0,63})\s*:(?!=)/gm;
  for (const m of text.slice(0, 262144).matchAll(re)) {
    const name = m[1];
    if (TARGET.test(name) && START_WORDS.has(name) && !out.includes(name)) out.push(name);
    if (out.length >= 8) break;
  }
  return out;
}

/** Procfile.dev process names (web, js, css, …). */
export function procfileProcesses(text) {
  const out = [];
  if (typeof text !== 'string') return out;
  for (const line of text.slice(0, 65536).split('\n')) {
    const m = /^([A-Za-z0-9_-]{1,40}):\s*\S/.exec(line);
    if (m && !out.includes(m[1])) out.push(m[1]);
    if (out.length >= 16) break;
  }
  return out;
}

// --------------------------------------------------------------- icons ----

export const MAX_ICON_BYTES = 262144;
export const MAX_ICON_LISTINGS = 48;
export const MAX_ICON_CANDIDATES = 12;
// Folders whose file names may be listed while looking for an icon: these
// names directly under the project or a workspace package (and two levels of
// them, such as assets/brand or src/app), plus versioned logo folders inside
// a brand folder (assets/brand/logo-v2).
export const ICON_DIR_NAMES = Object.freeze(['public', 'static', 'assets', 'branding', 'brand', 'icons', 'images', 'img', 'logo', 'logos',
  'resources', 'media', 'app', 'src', 'src-tauri']);
export const BRAND_DIR_NAMES = Object.freeze(['brand', 'branding', 'logo', 'logos', 'icons']);
const SEGMENT = /^[A-Za-z0-9_@+][A-Za-z0-9._@+-]{0,99}$/;
const SKIP = new Set(['node_modules', 'dist', 'build', 'out', 'target', 'coverage', '__proto__', 'constructor', 'prototype']);
const BRAND_CHILD = /logo|icon|brand|mark|symbol/i;
const MAX_ICON_DEPTH = 8;

const segmentsOf = p => (typeof p === 'string' && p.length > 0 && p.length <= 400 ? p.split('/') : null);
const plainSegments = (segs, { skip = true } = {}) => segs.length <= MAX_ICON_DEPTH && segs.every(s => SEGMENT.test(s) && !(skip && SKIP.has(s.toLowerCase())));
const extOf = name => /\.([A-Za-z0-9]{1,8})$/.exec(name)?.[1].toLowerCase() ?? '';

/** A folder the icon search may list: "" or a plain path whose last segment
 * is an icon folder name, or a logo folder inside a brand folder. */
export function isIconDir(p) {
  if (p === '') return true;
  const segs = segmentsOf(p);
  if (!segs || !plainSegments(segs)) return false;
  const last = segs.at(-1).toLowerCase();
  if (ICON_DIR_NAMES.includes(last)) return true;
  return segs.length >= 2 && BRAND_DIR_NAMES.includes(segs.at(-2).toLowerCase()) && BRAND_CHILD.test(last);
}

/** An image file path inside the project (`icns` too unless `readable`). */
export function isIconFile(p, { readable = false } = {}) {
  const segs = segmentsOf(p);
  if (!segs || !plainSegments(segs, { skip: false }) || segs.some(s => s.toLowerCase() === 'node_modules')) return false;
  const ext = extOf(segs.at(-1));
  return ICON_EXTENSIONS.includes(ext) || (!readable && ext === 'icns');
}

/** Reader policy for reading an icon's bytes (after lstat/realpath). */
export function iconRefusal({ path, resolvedPath, isFile, size } = {}) {
  if (!isIconFile(path, { readable: true })) return 'not_allowlisted';
  if (resolvedPath === null || resolvedPath === undefined) return 'symlink_outside_root';
  if (!isIconFile(resolvedPath, { readable: true })) return 'not_allowlisted';
  if (isFile !== true) return 'not_regular_file';
  if (!Number.isSafeInteger(size) || size <= 0 || size > MAX_ICON_BYTES) return 'too_large';
  return null;
}

const listed = (listing, dir) => {
  const v = isPlainObject(listing) ? own(listing, dir) : undefined;
  return isPlainObject(v) ? { dirs: Array.isArray(v.dirs) ? v.dirs : [], files: Array.isArray(v.files) ? v.files : [] } : null;
};
const join = (dir, name) => (dir ? `${dir}/${name}` : name);

/** The next folders to list. `units` are "" and the package dirs (listed
 * first, whatever their name); `listing`
 * maps each folder already listed to its { dirs, files } names. Call again
 * with the grown listing until nothing is left (at most MAX_ICON_LISTINGS). */
export function iconListPlan({ units = [''], listing = {} } = {}) {
  const out = [];
  const known = isPlainObject(listing) ? Object.keys(listing) : [];
  const budget = MAX_ICON_LISTINGS - known.length;
  if (budget <= 0) return Object.freeze(out);
  const room = () => out.length < Math.min(budget, 24);
  const add = p => { if (room() && isIconDir(p) && !known.includes(p) && !out.includes(p)) out.push(p); };
  // The project folder and each workspace package are listed first.
  for (const unit of units) {
    const segs = segmentsOf(unit);
    if (room() && (unit === '' || (segs && plainSegments(segs) && segs.length <= 4)) && !known.includes(unit) && !out.includes(unit)) out.push(unit);
  }
  for (const dir of known.sort()) {
    const here = listed(listing, dir);
    if (!here) continue;
    const segs = dir ? dir.split('/') : [];
    const unitHere = units.includes(dir);
    const parentName = segs.at(-1)?.toLowerCase() ?? '';
    for (const child of here.dirs.slice(0, 512)) {
      if (typeof child !== 'string' || !SEGMENT.test(child)) continue;
      const name = child.toLowerCase();
      // Icon folders directly under a unit, or one level below an icon folder
      // (assets/brand, public/icons, src/app); logo folders inside a brand folder.
      if ((unitHere || ICON_DIR_NAMES.includes(parentName)) && ICON_DIR_NAMES.includes(name) && segs.length < 6) add(join(dir, child));
      else if (BRAND_DIR_NAMES.includes(parentName) && BRAND_CHILD.test(name)) add(join(dir, child));
    }
  }
  return Object.freeze(out);
}

const NAME_SCORES = [
  [/apple-touch-icon/i, 15], [/(^|[-_.])(app[-_]?)?icon/i, 25], [/logo/i, 20], [/^default\d+\./i, 15], [/favicon/i, 4], [/mark|symbol/i, 8],
];
const NEGATIVE = /preview|sketch|draft|old|source|front|screenshot|banner|og[-_.]|social|cover|background|^bg|splash|wordmark|watermark|placeholder|example|test|demo/i;
const DIR_SCORES = [[/(^|\/)src-tauri\/icons$/, 25], [/(^|\/)(brand|branding|logo|logos|icons)(\/[^/]+)?$/i, 30], [/(^|\/)(public|static|app)$/i, 15],
  [/(^|\/)(assets|images|img|media|resources)$/i, 10]];
const EXT_SCORES = { svg: 6, png: 5, webp: 2, ico: -2, jpg: -6, jpeg: -6 };

function scoreIcon(path) {
  const segs = path.split('/');
  const name = segs.at(-1), dir = segs.slice(0, -1).join('/');
  let score = 0;
  for (const [re, n] of NAME_SCORES) if (re.test(name)) { score += n; break; }
  if (score === 0) return null; // only files that are named like an icon
  if (NEGATIVE.test(name)) score -= 25;
  const dirScore = DIR_SCORES.find(([re]) => re.test(dir));
  score += dir === '' ? 12 : dirScore ? dirScore[1] : 0;
  const size = /(?:^|[^0-9])(16|22|24|32|48|64|96|128|180|192|256|384|512|1024)(?:[^0-9]|$)/.exec(name);
  if (size) score += Number(size[1]) >= 128 ? 10 : Number(size[1]) >= 64 ? 4 : -10;
  const version = /(?:^|[-_.])v([0-9]{1,2})(?:[-_.]|$)/i.exec(path);
  if (version) score += Math.min(Number(version[1]), 9);
  return score + (EXT_SCORES[extOf(name)] ?? 0);
}

/** Icon candidates, best first: images named by project configuration
 * (Tauri bundle.icon, electron-builder icon, README), then listed files named
 * like an icon or logo. `hints` is [{ path, source, weight }]; a weight of 40
 * or more means the configuration names it as the icon. Each candidate is
 * { path, source, score, named }. */
export function iconCandidates({ listing = {}, hints = [] } = {}) {
  const found = new Map();
  const add = (path, source, score, named = false) => {
    if (!isIconFile(path, { readable: true }) || score === null) return;
    const prev = found.get(path);
    if (!prev || prev.score < score) found.set(path, { path, source: clip(source, 256), score, named: named || prev?.named === true });
  };
  for (const h of Array.isArray(hints) ? hints.slice(0, 32) : []) {
    const weight = Number.isSafeInteger(h?.weight) ? h.weight : 40;
    if (isPlainObject(h) && typeof h.path === 'string') add(h.path, h.source, (scoreIcon(h.path) ?? 0) + weight, weight >= 40);
  }
  for (const dir of isPlainObject(listing) ? Object.keys(listing).sort() : []) {
    const here = listed(listing, dir);
    for (const file of here?.files.slice(0, 512) ?? []) {
      if (typeof file !== 'string' || !SEGMENT.test(file)) continue;
      const path = join(dir, file);
      add(path, `${path} (named like an icon)`, scoreIcon(path));
    }
  }
  return Object.freeze([...found.values()].sort((a, b) => b.score - a.score || a.path.localeCompare(b.path)).slice(0, MAX_ICON_CANDIDATES));
}

/** The best candidate that is a regular file the browser may show (at most
 * MAX_ICON_BYTES). `sizes` maps a path to its { kind, size } metadata. */
export function chooseIcon(candidates, sizes = {}) {
  for (const c of Array.isArray(candidates) ? candidates : []) {
    const meta = isPlainObject(sizes) ? own(sizes, c.path) : undefined;
    if (own(meta, 'kind') === 'file' && Number.isSafeInteger(meta.size) && meta.size > 0 && meta.size <= MAX_ICON_BYTES) {
      return { path: c.path, source: c.source, guess: c.named !== true };
    }
  }
  return null;
}

/** macOS app icons (.icns) among the listed files: a desktop app signal. */
export function appIconFiles(listing = {}) {
  const out = [];
  for (const dir of isPlainObject(listing) ? Object.keys(listing).sort() : []) {
    for (const file of listed(listing, dir)?.files.slice(0, 512) ?? []) {
      if (typeof file === 'string' && SEGMENT.test(file) && extOf(file) === 'icns' && out.length < 8) out.push(join(dir, file));
    }
  }
  return out;
}
