import { accessSync, closeSync, constants, fstatSync, openSync, readSync, realpathSync, statSync } from 'node:fs';
import path from 'node:path';
import { parseGenericCliVersion } from '../vendor/t3/version.ts';

export const DRIVERS = Object.freeze(['codex', 'claude-code', 'antigravity']);
const commands = { codex: 'codex', 'claude-code': 'claude', antigravity: 'agy' };
export const routes = Object.freeze({
  codex: Object.freeze({ protocol: 'codex-app-server-stdio', pinned_version: '0.155.1', docs: 'https://developers.openai.com/codex/app-server' }),
  'claude-code': Object.freeze({ protocol: 'official-claude-code-stream-json', pinned_version: '2.1.278', docs: 'https://code.claude.com/docs/en/headless' }),
  antigravity: Object.freeze({ protocol: 'official-agy-stream-json', pinned_version: null, docs: 'https://antigravity.google/docs/cli/headless/' }),
});

function metadataVersion(value) {
  // Generic upstream parsing is useful for display, but it drops prerelease/build
  // suffixes. Preserve exact metadata for the gate so 1.2.3-beta != 1.2.3.
  return typeof value === 'string' && value.length <= 64
    && /^\d+\.\d+\.\d+(?:-[0-9A-Za-z.-]+)?(?:\+[0-9A-Za-z.-]+)?$/.test(value)
    && parseGenericCliVersion(value) ? value : null;
}

function readPackageMetadata(filename) {
  // PATH can point at a local executable that we do not own. Never follow a
  // package.json symlink or read an unbounded/non-regular metadata source.
  const fd = openSync(filename, constants.O_RDONLY | constants.O_NONBLOCK | constants.O_NOFOLLOW);
  try {
    const maxBytes = 64 * 1024;
    const file = fstatSync(fd);
    if (!file.isFile() || file.size === 0 || file.size > maxBytes) return null;
    const bytes = Buffer.alloc(maxBytes + 1);
    let length = 0;
    while (length < bytes.length) {
      const count = readSync(fd, bytes, length, bytes.length - length, null);
      if (count === 0) break;
      length += count;
    }
    return length > maxBytes ? null : JSON.parse(bytes.subarray(0, length).toString('utf8'));
  } finally { closeSync(fd); }
}

export function versionStatus(driver, clientVersion) {
  if (!DRIVERS.includes(driver)) throw new RangeError('Unknown provider driver');
  const pinned = routes[driver].pinned_version;
  if (!pinned || !metadataVersion(clientVersion)) return 'UNTESTED';
  return clientVersion === pinned ? 'PINNED_METADATA_MATCH' : 'VERSION_MISMATCH';
}

// Never executes a PATH entry, a shell, --version, an auth command, or a
// package manager. Version information is explicitly installation metadata.
export function discover({ searchPath = process.env.PATH ?? '' } = {}) {
  return DRIVERS.map(driver => {
    let executable = null, resolved = null, version = null, version_source = null;
    for (const directory of searchPath.split(path.delimiter).filter(path.isAbsolute)) {
      const candidate = path.join(directory, commands[driver]);
      try {
        accessSync(candidate, constants.X_OK);
        if (!statSync(candidate).isFile()) continue;
        resolved = realpathSync(candidate); executable = candidate; break;
      } catch { /* An absent or inaccessible executable is not an auth failure. */ }
    }
    if (resolved) {
      try {
        if (driver === 'codex' && path.basename(resolved) === 'codex.js') {
          const pkg = readPackageMetadata(path.join(path.dirname(resolved), '..', 'package.json'));
          if (pkg?.name === '@openai/codex') {
            version = metadataVersion(pkg.version);
            if (version) version_source = 'npm-package-metadata';
          }
        } else if (driver === 'claude-code' && path.basename(path.dirname(resolved)) === 'versions') {
          version = metadataVersion(path.basename(resolved));
          if (version) version_source = 'native-installation-path';
        }
      } catch { /* Unverified metadata is unavailable, never invented. */ }
    }
    const version_status = versionStatus(driver, version);
    const versionBlockers = version_status === 'PINNED_METADATA_MATCH' ? [] : [version_status === 'UNTESTED' ? 'VERSION_UNTESTED' : 'VERSION_MISMATCH'];
    return { version: 1, driver, executable, client_version: version, version_source, version_status, protocol_status: 'UNTESTED',
      installed: !!executable, auth_status: 'unknown', status: executable ? 'BLOCKED_AUTH' : 'BLOCKED_ENV',
      route: routes[driver], capabilities: { discovery: true, fixture_protocol: true, live_verified: false,
        automatic_browser_control: false, shell: false, filesystem: false, account_migration: false },
      blockers: [...(executable ? [] : ['CLIENT_NOT_INSTALLED']), ...versionBlockers, 'LIVE_AUTH_NOT_AUTHORIZED', 'PROCESS_SANDBOX_NOT_PROVEN'] };
  });
}
