/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. https://mozilla.org/MPL/2.0/ */
// Test-only emulation of the chrome detection reader (contexts-api-v1 §2.1):
// reads exactly DETECTION_FILES, lstat + realpath first, applies the shared
// detectionRefusal policy (root containment, allowlisted symlink targets,
// regular files, 256 KiB cap), then decodes strict UTF-8.
import { cp, lstat, mkdir, readdir, readFile, realpath, rename, rm, stat, writeFile } from 'node:fs/promises';
import { dirname, join, relative, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  DETECTION_FILES, PACKAGE_DETECTION_FILES, detectionRefusal, expandWorkspaceGlobs, packageDetectionRefusal, workspaceCandidates,
} from '../src/detect.mjs';

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
