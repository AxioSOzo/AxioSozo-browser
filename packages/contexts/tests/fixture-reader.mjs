/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. https://mozilla.org/MPL/2.0/ */
// Reference readers for the four detection phases (contexts-api-v1 §2.1–§2.2,
// workstation-v1 §1.2–§1.3); detectFixture runs them in order.
//
// Test-only emulation of the chrome detection reader (contexts-api-v1 §2.1):
// reads exactly DETECTION_FILES, lstat + realpath first, applies the shared
// detectionRefusal policy (root containment, allowlisted symlink targets,
// regular files, 256 KiB cap), then decodes strict UTF-8.
import { cp, lstat, mkdir, readdir, readFile, realpath, rename, rm, stat, writeFile } from 'node:fs/promises';
import { dirname, join, relative, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  DETECTION_FILES, PACKAGE_DETECTION_FILES, detectProject, detectionRefusal, documentFiles, documentRefusal, expandWorkspaceGlobs, iconCandidatesFor,
  inventoryPlan, inventoryRefusal, packageDetectionRefusal, workspaceCandidates,
} from '../src/detect.mjs';
import { iconListPlan, isIconDir, isIconFile } from '../src/setup.mjs';

export const TESTS_DIR = dirname(fileURLToPath(import.meta.url));
export const FIXTURES_DIR = join(TESTS_DIR, 'fixtures');
export const TMP_DIR = join(TESTS_DIR, '.tmp');

export async function readFixtureRepo(root) {
  const files = {}, refused = [], opened = [];
  const realRoot = await realpath(root);
  for (const rel of DETECTION_FILES) {
    const full = join(root, ...rel.split('/'));
    try { await lstat(full); } catch { continue; }
    let real, info;
    try { real = await realpath(full); info = await stat(real); } catch { refused.push({ path: rel, reason: 'unreadable' }); continue; }
    const inside = real.startsWith(realRoot + sep);
    const reason = detectionRefusal({ path: rel, resolvedPath: inside ? relative(realRoot, real).split(sep).join('/') : null, isFile: info.isFile(), size: info.size });
    if (reason) { refused.push({ path: rel, reason }); continue; }
    opened.push(relative(realRoot, real).split(sep).join('/'));
    const bytes = await readFile(real);
    try { files[rel] = new TextDecoder('utf-8', { fatal: true }).decode(bytes); } catch { refused.push({ path: rel, reason: 'invalid_utf8' }); }
  }
  return { files, refused, opened };
}

// Test-only emulation of the chrome workspace reader (contexts-api-v1 §2.2):
// phase 1 lists only the immediate child directory names of plan.list, phase
// 2 reads only PACKAGE_DETECTION_FILES in the expanded package dirs, applying
// packageDetectionRefusal. Packages with nothing readable are left out.
export async function readFixtureWorkspace(root, rootFiles) {
  const plan = workspaceCandidates(rootFiles);
  const realRoot = await realpath(root);
  const listing = {}, listed = [], opened = [];
  for (const parent of plan.list) {
    let entries;
    try { entries = await readdir(join(root, ...parent.split('/').filter(Boolean)), { withFileTypes: true }); } catch { continue; }
    listed.push(parent);
    listing[parent] = entries.filter(e => e.isDirectory() || e.isSymbolicLink()).map(e => e.name);
  }
  const dirs = expandWorkspaceGlobs(plan.patterns, listing);
  const packages = {};
  for (const dir of dirs) {
    const files = {}, refused = [];
    for (const rel of PACKAGE_DETECTION_FILES) {
      const full = join(root, ...dir.split('/'), ...rel.split('/'));
      try { await lstat(full); } catch { continue; }
      let real, info;
      try { real = await realpath(full); info = await stat(real); } catch { refused.push({ path: rel, reason: 'unreadable' }); continue; }
      const inside = real.startsWith(realRoot + sep);
      const reason = packageDetectionRefusal({ dir, path: rel, resolvedPath: inside ? relative(realRoot, real).split(sep).join('/') : null, isFile: info.isFile(), size: info.size });
      if (reason) { refused.push({ path: rel, reason }); continue; }
      opened.push(relative(realRoot, real).split(sep).join('/'));
      const bytes = await readFile(real);
      try { files[rel] = new TextDecoder('utf-8', { fatal: true }).decode(bytes); } catch { refused.push({ path: rel, reason: 'invalid_utf8' }); }
    }
    if (Object.keys(files).length || refused.length) packages[dir] = { files, refused };
  }
  return { plan, listing, listed, dirs, packages, opened };
}

// Test-only emulation of the chrome inventory reader (workstation-v1 §1.2):
// only the plan's paths are touched. For `list` paths it lists the names of the
// immediate child directories (and symlinks), for `check` paths it reports
// "file" or "dir" after lstat + realpath; nothing is opened or read. Paths
// refused by inventoryRefusal (outside the root, other kinds) count as absent.
// `touched` records every relative path handed to the file system.
export async function readFixtureInventory(root, packageDirs) {
  const plan = inventoryPlan({ packageDirs });
  const realRoot = await realpath(root);
  const listing = {}, present = {}, touched = [];
  const resolve = async rel => {
    touched.push(rel);
    const full = join(root, ...rel.split('/'));
    try { await lstat(full); } catch { return null; }
    let real, info;
    try { real = await realpath(full); info = await stat(real); } catch { return null; }
    const inside = real.startsWith(realRoot + sep);
    const kind = info.isFile() ? 'file' : info.isDirectory() ? 'dir' : 'other';
    const reason = inventoryRefusal({ path: rel, resolvedPath: inside ? relative(realRoot, real).split(sep).join('/') : null, kind, plan });
    return reason ? null : { real, kind };
  };
  for (const dir of plan.list) {
    const r = await resolve(dir);
    if (!r || r.kind !== 'dir') continue;
    const entries = await readdir(r.real, { withFileTypes: true });
    // exFAT volumes add AppleDouble `._*` entries; they are never project content.
    listing[dir] = entries.filter(e => (e.isDirectory() || e.isSymbolicLink()) && !e.name.startsWith('._')).map(e => e.name);
  }
  for (const path of plan.check) {
    const r = await resolve(path);
    if (r) present[path] = r.kind;
  }
  return { plan, inventory: { listing, present }, touched };
}

// Test-only emulation of the chrome docs reader (workstation-v1 §1.3): reads
// exactly documentFiles(inventory) with documentRefusal and strict UTF-8.
export async function readFixtureDocs(root, inventory) {
  const paths = documentFiles(inventory);
  const realRoot = await realpath(root);
  const docs = {}, refused = [], opened = [], touched = [];
  for (const rel of paths) {
    touched.push(rel);
    const full = join(root, ...rel.split('/'));
    try { await lstat(full); } catch { continue; }
    let real, info;
    try { real = await realpath(full); info = await stat(real); } catch { refused.push({ path: rel, reason: 'unreadable' }); continue; }
    const inside = real.startsWith(realRoot + sep);
    const reason = documentRefusal({ path: rel, resolvedPath: inside ? relative(realRoot, real).split(sep).join('/') : null, isFile: info.isFile(), size: info.size });
    if (reason) { refused.push({ path: rel, reason }); continue; }
    opened.push(relative(realRoot, real).split(sep).join('/'));
    const bytes = await readFile(real);
    try { docs[rel] = new TextDecoder('utf-8', { fatal: true }).decode(bytes); } catch { refused.push({ path: rel, reason: 'invalid_utf8' }); }
  }
  return { paths, docs, refused, opened, touched };
}

// Test-only emulation of the chrome icon reader (workstation-v1 §1.5): lists
// the file and folder names of iconListPlan folders, round by round, then
// takes lstat/realpath/size metadata of exactly iconCandidatesFor's paths.
// Nothing is opened. `touched` records every relative path handed to fs.
export async function readFixtureIcons(root, { units, files, packages }) {
  const realRoot = await realpath(root);
  const listing = {}, sizes = {}, touched = [];
  const resolve = async rel => {
    touched.push(rel);
    const full = rel ? join(root, ...rel.split('/')) : root;
    try { await lstat(full); } catch { return null; }
    let real, info;
    try { real = await realpath(full); info = await stat(real); } catch { return null; }
    const resolved = relative(realRoot, real).split(sep).join('/');
    if (real !== realRoot && !real.startsWith(realRoot + sep)) return null;
    return { real, info, resolved };
  };
  for (let round = 0; round < 8; round++) {
    const next = iconListPlan({ units, listing });
    if (!next.length) break;
    for (const dir of next) {
      const r = await resolve(dir);
      if (!r || !r.info.isDirectory() || (r.resolved && !isIconDir(r.resolved) && !units.includes(r.resolved))) { listing[dir] = { dirs: [], files: [] }; continue; }
      const entries = (await readdir(r.real, { withFileTypes: true })).filter(e => !e.name.startsWith('._'));
      listing[dir] = { dirs: entries.filter(e => e.isDirectory()).map(e => e.name), files: entries.filter(e => e.isFile()).map(e => e.name) };
    }
  }
  for (const c of iconCandidatesFor({ files, packages, listing })) {
    const r = await resolve(c.path);
    if (r && isIconFile(r.resolved, { readable: true })) sizes[c.path] = { kind: r.info.isFile() ? 'file' : 'other', size: r.info.size };
  }
  return { icons: { listing, sizes }, touched };
}

// All five phases, as chrome runs them, then detectProject.
export async function detectFixture(root, rootName) {
  const repo = await readFixtureRepo(root);
  const ws = await readFixtureWorkspace(root, repo.files);
  const inv = await readFixtureInventory(root, ws.dirs);
  const doc = await readFixtureDocs(root, inv.inventory);
  const ico = await readFixtureIcons(root, { units: ['', ...ws.dirs], files: repo.files, packages: ws.packages });
  const draft = detectProject({ rootName, files: repo.files, refused: [...repo.refused, ...doc.refused], packages: ws.packages, inventory: inv.inventory, docs: doc.docs, icons: ico.icons });
  return { draft, repo, ws, inv, doc, ico, opened: [...repo.opened, ...ws.opened, ...doc.opened] };
}

// Copies a committed fixture into tests/.tmp/<unique>/<name>, restoring the
// `.git` directory (git cannot track `.git/config`) and planting `.env*` and
// key-file traps that detection must never open.
let counter = 0;
export async function materializeFixture(name, { traps = true } = {}) {
  const base = join(TMP_DIR, `${process.pid}-${Date.now()}-${counter++}`);
  const root = join(base, name);
  await mkdir(base, { recursive: true });
  await cp(join(FIXTURES_DIR, name), root, { recursive: true, filter: src => !src.split(sep).at(-1).startsWith('._') });
  try { await rename(join(root, '_git'), join(root, '.git')); } catch { /* fixture without git */ }
  if (traps) {
    await writeFile(join(root, '.env'), 'TRAP_ENV_SECRET=never-read-dot-env\n');
    await writeFile(join(root, '.env.local'), 'TRAP_ENV_SECRET=never-read-dot-env-local\n');
    await writeFile(join(root, 'id_ed25519'), 'TRAP_PRIVATE_KEY never-read\n');
  }
  return { root, base, cleanup: () => rm(base, { recursive: true, force: true }) };
}
