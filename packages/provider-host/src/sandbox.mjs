import { spawn } from 'node:child_process';
import { createHash } from 'node:crypto';
import { readFileSync, realpathSync, statSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { providerBuildRoot } from './storage.mjs';
import { ProviderError, requireValue } from './validation.mjs';

export const SANDBOX_POLICY = 'macos-seatbelt-offline-no-fork-v1';
const packageRoot = fileURLToPath(new URL('../', import.meta.url));
function hash(file) { return createHash('sha256').update(readFileSync(file)).digest('hex'); }
export function sandboxArtifacts() {
  const directory = providerBuildRoot(); let manifest;
  try { manifest = JSON.parse(readFileSync(path.join(directory, 'native-build.json'), 'utf8')); }
  catch { throw new ProviderError('BLOCKED_ENV', 'Build the native provider fixtures with provider-host setup'); }
  requireValue(manifest.version === 1 && manifest.policy === SANDBOX_POLICY, 'BLOCKED_ENV', 'Unsupported native sandbox artifact manifest');
  const paths = {};
  for (const name of ['sandbox-launcher', 'sandbox-probe']) {
    const binary = path.join(directory, name); const source = path.join(packageRoot, 'native', `${name}.c`);
    requireValue(realpathSync(binary) === binary && statSync(binary).isFile() && !statSync(binary).isSymbolicLink(), 'BLOCKED_ENV', 'Invalid native broker artifact');
    requireValue(manifest.artifacts?.[name]?.binary_sha256 === hash(binary) && manifest.artifacts[name].source_sha256 === hash(source), 'BLOCKED_ENV', 'Native broker artifact is stale or changed; rebuild before launch');
    paths[name] = binary;
  }
  return paths;
}
function quote(value) {
  requireValue(typeof value === 'string' && !/[\u0000-\u001f\u007f]/.test(value), 'INVALID_INPUT', 'Invalid sandbox path');
  return JSON.stringify(value);
}
export function offlineProfile(executable, workspace) {
  return `(version 1)
(deny default)
(deny process-fork)
(allow process-exec (literal ${quote(executable)}))
(allow file-read-metadata)
(allow file-read-data file-map-executable
  (literal "/") (literal ${quote(executable)})
  (subpath "/System/Library") (subpath "/usr/lib"))
(allow file-read-data file-write* (subpath ${quote(workspace)}))
(allow sysctl-read)
`;
}

// The only executable admitted by this broker release is the compiled native
// test fixture. This proves an OS boundary without claiming any unaudited CLI is
// compatible. No API accepts executable names, arbitrary environment or SBPL.
export function launchSandboxProbe({ runDirectory, mode = 'probe', deadlineMs = 3000, loopbackPort = 1 }) {
  requireValue(process.platform === 'darwin' && process.arch === 'arm64', 'BLOCKED_ENV', 'This broker proof targets macOS Apple Silicon');
  requireValue(['probe', 'hold'].includes(mode), 'INVALID_INPUT', 'Unsupported sandbox fixture mode');
  requireValue(Number.isInteger(deadlineMs) && deadlineMs >= 20 && deadlineMs <= 30000, 'INVALID_INPUT', 'Invalid sandbox deadline');
  requireValue(Number.isInteger(loopbackPort) && loopbackPort > 0 && loopbackPort <= 65535, 'INVALID_INPUT', 'Invalid fixture port');
  const base = path.join(providerBuildRoot(), 'sandbox-runs'); const directory = realpathSync(runDirectory);
  requireValue(directory.startsWith(`${base}/`) && statSync(directory).uid === process.getuid() && (statSync(directory).mode & 0o077) === 0, 'INVALID_INPUT', 'Sandbox run directory must be app-owned and private');
  const workspace = realpathSync(path.join(directory, 'workspace'));
  requireValue(workspace === path.join(directory, 'workspace'), 'INVALID_INPUT', 'Sandbox workspace cannot be a symlink');
  const artifacts = sandboxArtifacts(); const profile = offlineProfile(artifacts['sandbox-probe'], workspace);
  const args = mode === 'hold' ? ['hold'] : ['probe', workspace, path.join(directory, 'outside'), String(loopbackPort)];
  const child = spawn(artifacts['sandbox-launcher'], [String(deadlineMs), profile, artifacts['sandbox-probe'], ...args], {
    cwd: workspace, shell: false,
    env: { PATH: '/usr/bin:/bin', LANG: 'C', TMPDIR: `${workspace}/` },
    stdio: ['pipe', 'pipe', 'pipe', 'pipe'],
  });
  let stdout = '', stderr = '', settled = false, overflow = false;
  const exit = new Promise((resolve, reject) => {
    child.on('error', () => { settled = true; reject(new ProviderError('BLOCKED_ENV', 'Native sandbox broker could not start')); });
    child.on('close', (code, signal) => { settled = true; resolve({ code, signal, stdout, stderr, overflow, broker_pid: child.pid, policy: SANDBOX_POLICY }); });
  });
  for (const channel of ['stdout', 'stderr']) child[channel].on('data', chunk => {
    if (overflow) return;
    const remaining = 65536 - Buffer.byteLength(stdout) - Buffer.byteLength(stderr);
    const bounded = chunk.subarray(0, Math.max(0, remaining)).toString('utf8');
    if (channel === 'stdout') stdout += bounded; else stderr += bounded;
    if (chunk.byteLength > remaining) { overflow = true; child.stdio[3].destroy(); }
  });
  child.stdin.on('error', () => {}); child.stdio[3].on('error', () => {});
  return { child, exit, policy: SANDBOX_POLICY, close: async () => { if (!settled) child.stdio[3].end(); return exit; } };
}
