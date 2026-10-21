import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { existsSync, lstatSync, realpathSync, statSync } from 'node:fs';
import { requireValue } from './validation.mjs';

// The checkout root (packages/provider-host/src -> repository).
const checkout = fileURLToPath(new URL('../../../', import.meta.url)).replace(/\/$/u, '');

/**
 * Linux: the same build root as scripts/storage.py, i.e. AXIOSOZO_BUILD_ROOT
 * (absolute, normalized, an existing user-owned real directory) or the
 * gitignored `<checkout>/.build`. No macOS volume is involved.
 */
function linuxBuildRoot() {
  const configured = process.env.AXIOSOZO_BUILD_ROOT || path.join(checkout, '.build');
  requireValue(path.isAbsolute(configured) && path.normalize(configured) === configured.replace(/\/$/u, '') && configured !== '/',
    'BLOCKED_ENV', 'AXIOSOZO_BUILD_ROOT must be an absolute normalized path');
  requireValue(!['/proc', '/sys', '/dev'].some(prefix => configured === prefix || configured.startsWith(`${prefix}/`)),
    'BLOCKED_ENV', 'AXIOSOZO_BUILD_ROOT must not be a virtual filesystem');
  requireValue(existsSync(configured), 'BLOCKED_ENV', 'Linux build root does not exist; run ./dev setup');
  const info = lstatSync(configured);
  requireValue(info.isDirectory() && !info.isSymbolicLink() && info.uid === process.getuid() && realpathSync(configured) === configured,
    'BLOCKED_ENV', 'Linux build root must be a real directory owned by this user');
  return path.join(configured, 'providers');
}

/**
 * macOS CI: scripts/storage.py's macOS CI build root (docs/MACOS_CI.md). Only with
 * AXIOSOZO_MACOS_CI=1 on a GitHub Actions runner without the owner's layout (T9,
 * dev-external, mount-dev-storage); refused wherever that layout exists, so the
 * T9-backed volume stays required on the owner's Mac. Null when not requested.
 */
export function macosCiBuildRoot() {
  if (process.platform !== 'darwin' || process.env.AXIOSOZO_MACOS_CI !== '1') return null;
  requireValue(process.env.GITHUB_ACTIONS === 'true', 'BLOCKED_ENV', 'AXIOSOZO_MACOS_CI=1 is only for GitHub Actions macOS runners');
  requireValue(!['/Volumes/T9', '/Users/wout/.local/bin/dev-external', '/Users/wout/.local/bin/mount-dev-storage'].some(existsSync),
    'BLOCKED_ENV', 'AXIOSOZO_MACOS_CI=1 refused: the owner macOS layout exists');
  requireValue(Boolean(process.env.AXIOSOZO_BUILD_ROOT), 'BLOCKED_ENV', 'AXIOSOZO_MACOS_CI=1 requires an explicit AXIOSOZO_BUILD_ROOT');
  return process.env.AXIOSOZO_BUILD_ROOT;
}

export function providerBuildRoot() {
  if (process.platform === 'linux' || macosCiBuildRoot() !== null) return linuxBuildRoot();
  const configured = process.env.AXIOSOZO_BUILD_ROOT ?? '/Volumes/AxioSozoBuild';
  requireValue(path.isAbsolute(configured), 'BLOCKED_ENV', 'AXIOSOZO_BUILD_ROOT must be absolute');
  const resolved = path.resolve(configured);
  const mount = ['/Volumes/AxioSozoBuild', '/Volumes/DevStorage'].find(candidate => resolved === candidate || resolved.startsWith(`${candidate}/`));
  requireValue(mount && existsSync(mount) && realpathSync(mount) === mount && statSync(mount).dev !== statSync(path.dirname(mount)).dev, 'BLOCKED_ENV', 'Provider builds require the mounted T9-backed project storage');
  let existing = resolved;
  while (!existsSync(existing)) existing = path.dirname(existing);
  requireValue(realpathSync(existing) === mount || realpathSync(existing).startsWith(`${mount}/`), 'BLOCKED_ENV', 'Provider build path resolves outside external storage');
  return path.join(resolved, 'providers');
}
