import { spawn } from 'node:child_process';
import { createHash } from 'node:crypto';
import { createRequire } from 'node:module';
import { userInfo } from 'node:os';
import { accessSync, constants, existsSync, lstatSync, mkdirSync, mkdtempSync, readFileSync,
  realpathSync, rmSync, statSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { ProviderAdapter } from './adapters.mjs';
import { discover } from './discovery.mjs';
import { providerBuildRoot } from './storage.mjs';
import { JsonLineTransport } from './transport.mjs';
import { id, ProviderError, requireValue } from './validation.mjs';

export const LIVE_VERSIONS = Object.freeze({ codex: '0.157.1', 'claude-code': '2.1.283' });
export const LIVE_POLICY = 'macos-provider-chat-scoped-exec-v1';
const packageRoot = fileURLToPath(new URL('../', import.meta.url));
const hash = file => createHash('sha256').update(readFileSync(file)).digest('hex');

function privateDirectory(directory) {
  mkdirSync(directory, { recursive: true, mode: 0o700 });
  const stat = lstatSync(directory);
  requireValue(stat.isDirectory() && !stat.isSymbolicLink() && realpathSync(directory) === directory
    && stat.uid === process.getuid() && (stat.mode & 0o077) === 0,
  'BLOCKED_ENV', 'Provider runtime requires an app-owned private directory on external storage');
  return directory;
}

export function liveMetadata(driver, { searchPath = process.env.PATH ?? '' } = {}) {
  requireValue(Object.hasOwn(LIVE_VERSIONS, driver), 'ANTIGRAVITY_PROTOCOL_UNSUPPORTED', 'Antigravity has no audited safe live launcher yet');
  const metadata = discover({ searchPath }).find(item => item.driver === driver);
  requireValue(metadata?.installed, 'BLOCKED_ENV', 'Install the official provider CLI before connecting');
  requireValue(metadata.client_version === LIVE_VERSIONS[driver], 'BLOCKED_ENV',
    `This provider route requires the audited official ${driver} ${LIVE_VERSIONS[driver]} installation`);
  return metadata;
}

export function resolveNativeClient(driver, metadata) {
  let executable = realpathSync(metadata.executable);
  if (driver === 'codex') {
    // Follow the official npm entrypoint's public package layout. Never execute
    // the wrapper (which forks) or resolve provider-controlled CLI arguments.
    requireValue(path.basename(executable) === 'codex.js', 'BLOCKED_ENV', 'Unsupported Codex installation layout');
    const require = createRequire(executable);
    const packageName = `@openai/codex-darwin-${process.arch}`;
    const packageFile = require.resolve(`${packageName}/package.json`);
    const pkg = JSON.parse(readFileSync(packageFile, 'utf8'));
    requireValue(pkg.name === '@openai/codex' && pkg.version === `${LIVE_VERSIONS.codex}-darwin-${process.arch}`,
      'BLOCKED_ENV', 'Native Codex package version does not match the audited client');
    const triple = process.arch === 'arm64' ? 'aarch64-apple-darwin' : 'x86_64-apple-darwin';
    executable = realpathSync(path.join(path.dirname(packageFile), 'vendor', triple, 'bin', 'codex'));
  }
  accessSync(executable, constants.X_OK);
  const stat = statSync(executable);
  requireValue(stat.isFile() && stat.uid === process.getuid() && !(stat.mode & 0o022), 'BLOCKED_ENV', 'Provider executable must be user-owned and not writable by other users');
  return executable;
}

export function liveBroker() {
  const directory = providerBuildRoot(); let manifest;
  try { manifest = JSON.parse(readFileSync(path.join(directory, 'native-build.json'), 'utf8')); }
  catch { throw new ProviderError('BLOCKED_ENV', 'Build the provider broker with provider-host setup'); }
  const binary = path.join(directory, 'live-launcher'); const source = path.join(packageRoot, 'native/sandbox-launcher.c');
  requireValue(existsSync(binary) && realpathSync(binary) === binary && statSync(binary).isFile()
    && manifest.artifacts?.['live-launcher']?.binary_sha256 === hash(binary)
    && manifest.artifacts['live-launcher'].source_sha256 === hash(source)
    && manifest.artifacts['live-launcher'].policy === LIVE_POLICY,
  'BLOCKED_ENV', 'Provider broker is missing or stale; run provider-host setup');
  return binary;
}

const quote = value => {
  requireValue(typeof value === 'string' && path.isAbsolute(value) && !/[\u0000-\u001f\u007f]/.test(value), 'INVALID_INPUT', 'Invalid provider path');
  return JSON.stringify(value);
};
export function liveProfile({ executable, runDirectory, codexHome, officialHome, network = true }) {
  const scoped = [runDirectory, ...(codexHome ? [codexHome] : [])];
  return `(version 1)
(deny default)
${officialHome ? '(allow process-fork)' : '(deny process-fork)'}
(allow process-exec (literal ${quote(executable)})${officialHome ? ' (literal "/usr/bin/security")' : ''})
(allow file-read-metadata)
(allow file-read-data file-map-executable
  (literal "/") (literal ${quote(executable)})${officialHome ? ' (literal "/usr/bin/security")' : ''}
  (subpath "/System/Library") (subpath "/usr/lib")
  (subpath "/private/etc/ssl") (literal "/private/etc/resolv.conf")
  (literal "/private/etc/hosts") (literal "/dev/urandom") (literal "/dev/random"))
(allow file-read-data file-write* (literal "/dev/null") ${scoped.map(p => `(subpath ${quote(p)})`).join(' ')})
${officialHome ? `(allow file-read-data (literal ${quote(path.join(officialHome, '.claude.json'))}) (literal ${quote(path.join(officialHome, '.claude/.credentials.json'))}))` : ''}
(allow sysctl-read)
${network ? '(allow network-outbound)' : ''}
(allow mach-lookup
  (global-name "com.apple.securityd") (global-name "com.apple.trustd")
  ${officialHome ? '(global-name "com.apple.SecurityServer") (global-name "com.apple.securityd.xpc")' : ''}
  (global-name "com.apple.trustd.agent") (global-name "com.apple.system.opendirectoryd")
  (global-name "com.apple.SystemConfiguration.configd"))
`;
}

export function codexArguments() {
  // CODEX_HOME is app-owned; this is the complete configuration, not a merge
  // with a personal profile. Empty environments is also enforced per thread.
  return ['app-server', '--listen', 'stdio://', '-c', 'approval_policy="never"', '-c', 'sandbox_mode="read-only"',
    '-c', 'web_search="disabled"', '-c', 'project_doc_max_bytes=0', '-c', 'notify=[]',
    '-c', 'agents.enabled=false', '-c', 'tools.update_plan.enabled=false',
    '-c', 'tools.experimental_request_user_input.enabled=false',
    ...['shell_tool', 'shell_snapshot', 'view_image', 'hooks', 'plugins', 'apps', 'code_mode', 'code_mode_host',
      'memories', 'multi_agent_v2', 'image_generation', 'skill_search', 'skill_mcp_dependency_install'].flatMap(name => ['-c', `features.${name}=false`]),
    '-c', 'features.skip_host_skill_discovery=true'];
}

export function claudeArguments() {
  return ['--safe-mode', '--restricted', '--print', '--input-format', 'stream-json', '--output-format', 'stream-json',
    '--include-partial-messages', '--verbose', '--tools', '', '--disallowedTools', '*',
    '--strict-mcp-config', '--mcp-config', '{"mcpServers":{}}',
    '--settings', '{"disableAllHooks":true,"disableClaudeAiConnectors":true}', '--disable-slash-commands', '--no-chrome',
    '--permission-prompts', 'none', '--no-session-persistence', '--max-turns', '1'];
}

export function runtimeEnvironment(driver, { runDirectory, codexHome, officialHome }) {
  const env = { PATH: '/usr/bin:/bin', LANG: 'en_US.UTF-8', TMPDIR: `${runDirectory}/tmp/`,
    HOME: officialHome ?? path.join(runDirectory, 'home'), XDG_CACHE_HOME: path.join(runDirectory, 'cache'),
    USER: userInfo().username, LOGNAME: userInfo().username };
  if (driver === 'codex') Object.assign(env, { CODEX_HOME: codexHome });
  if (driver === 'claude-code') Object.assign(env, {
    // Audited in the exact pinned native client: isolate customization/output
    // while the official client still owns its default Keychain auth identity.
    CLAUDE_CONFIG_DIR: path.join(runDirectory, 'claude-config'), CLAUDE_SECURESTORAGE_CONFIG_DIR: '',
    CLAUDE_CODE_TMPDIR: path.join(runDirectory, 'tmp'), CLAUDE_CODE_DEBUG_LOGS_DIR: path.join(runDirectory, 'diagnostics.log'),
    CLAUDE_CODE_DISABLE_NONESSENTIAL_TRAFFIC: '1', CLAUDE_CODE_DISABLE_OFFICIAL_MARKETPLACE_AUTOINSTALL: '1', ENABLE_CLAUDEAI_MCP_SERVERS: 'false',
  });
  return env;
}

function launch(plan, args, deadlineMs = 900000) {
  return spawn(plan.broker, [String(deadlineMs), plan.profile, plan.executable, ...args], {
    cwd: plan.cwd, shell: false, env: plan.env, stdio: ['pipe', 'pipe', 'pipe', 'pipe'],
  });
}

async function claudeAuthentication(plan) {
  // Official client alone reads/authenticates its own store. Never read tokens,
  // profile files, or returned identifying fields in the browser host.
  const authPlan = { ...plan, profile: liveProfile({ ...plan, network: false }) };
  const child = launch(authPlan, ['--safe-mode', '--restricted', '--settings', '{"disableAllHooks":true,"disableClaudeAiConnectors":true}', 'auth', 'status'], 15000);
  let data = '', diagnostic = '', overflow = false;
  child.stdout.on('data', bytes => { if (data.length + bytes.length > 16384) { overflow = true; child.stdio[3].end(); } else data += bytes.toString('utf8'); });
  child.stderr.on('data', bytes => { diagnostic = (diagnostic + bytes.toString('utf8')).slice(-16384); });
  child.stdin.end(); child.stdio[3].on('error', () => {});
  const result = await new Promise((resolve, reject) => {
    child.once('error', () => reject(new ProviderError('BLOCKED_ENV', 'Official Claude authentication check could not start')));
    child.once('close', code => resolve(code));
  });
  let status; try { status = JSON.parse(data); } catch { /* Fixed errors below; never return raw auth output. */ }
  requireValue(!overflow && typeof status?.loggedIn === 'boolean', 'BLOCKED_ENV',
    `Official Claude could not complete its confined authentication check (exit ${result ?? 'signal'})`);
  if (result !== 0 || status.loggedIn !== true) {
    const error = new ProviderError('BLOCKED_AUTH', 'Official Claude authentication is unavailable under browser confinement; this does not establish that the normal CLI is signed out');
    error.diagnostic = { process_exit: result, native_pid: Number(diagnostic.match(/AXIOSOZO_BROKER child_pid=(\d+)/)?.[1]) || null,
      sandbox_denial_reported: /(?:operation not permitted|EACCES|EPERM|sandbox deny)/i.test(diagnostic),
      official_status_parsed: true, logged_in: status.loggedIn === true };
    throw error;
  }
  requireValue(status.authMethod === 'claude.ai' && status.apiProvider === 'firstParty' && ['pro', 'max'].includes(status.subscriptionType), 'UNSUPPORTED', 'This chat route currently supports personal Claude Pro/Max sign-in; managed and API authentication require a separate reviewed policy');
}

export function createLaunchPlan(driver, binding, { searchPath, officialHome = process.env.HOME } = {}) {
  requireValue(process.platform === 'darwin' && process.arch === 'arm64', 'BLOCKED_ENV', 'Provider chat currently requires macOS Apple Silicon');
  id(binding.instance_id, 'instance_id');
  const metadata = liveMetadata(driver, { searchPath });
  const executable = resolveNativeClient(driver, metadata), broker = liveBroker();
  const runtime = privateDirectory(path.join(providerBuildRoot(), 'runtime'));
  const instance = privateDirectory(path.join(privateDirectory(path.join(runtime, driver)), binding.instance_id));
  let codexHome;
  if (driver === 'codex') {
    codexHome = privateDirectory(path.join(instance, 'codex-home'));
    // App-owned config only; credentials remain in the official client's file.
    const config = path.join(codexHome, 'config.toml');
    if (existsSync(config)) {
      const stat = lstatSync(config);
      requireValue(stat.isFile() && !stat.isSymbolicLink() && stat.nlink === 1 && stat.uid === process.getuid(), 'BLOCKED_ENV', 'Provider configuration must be an app-owned regular file');
    }
    writeFileSync(config, 'cli_auth_credentials_store = "file"\n[mcp_servers]\n', { mode: 0o600, flag: constants.O_WRONLY | constants.O_CREAT | constants.O_TRUNC | constants.O_NOFOLLOW });
    const quotedHome = `'${codexHome.replaceAll("'", "'\\''")}'`;
    requireValue(existsSync(path.join(codexHome, 'auth.json')), 'CODEX_LOGIN_REQUIRED',
      `Official sign-in is required for this exact provider instance: CODEX_HOME=${quotedHome} codex login`);
    officialHome = undefined;
  } else {
    requireValue(typeof officialHome === 'string' && path.isAbsolute(officialHome) && realpathSync(officialHome) === officialHome,
      'BLOCKED_ENV', 'Pass the official user HOME for Claude authentication');
    // Reject existing managed policy by metadata alone. New remote managed
    // policy is excluded by the personal-subscription auth-status gate below.
    const managed = [path.join(officialHome, '.claude/remote-settings.json'), '/Library/Application Support/ClaudeCode/managed-settings.json',
      '/Library/Application Support/ClaudeCode/managed-settings.d', '/Library/Managed Preferences/com.anthropic.claudecode.plist'];
    requireValue(!managed.some(existsSync), 'UNSUPPORTED', 'Managed Claude policy needs a separate reviewed browser integration');
  }
  const runDirectory = mkdtempSync(path.join(instance, 'session-'));
  for (const folder of ['workspace', 'home', 'tmp', 'cache', 'claude-config']) privateDirectory(path.join(runDirectory, folder));
  const context = { executable, runDirectory, codexHome, officialHome };
  return { ...context, broker, cwd: path.join(runDirectory, 'workspace'),
    profile: liveProfile(context), env: runtimeEnvironment(driver, context), args: driver === 'codex' ? codexArguments() : claudeArguments() };
}

export async function createLiveAdapter(driver, binding, options) {
  const plan = createLaunchPlan(driver, binding, options);
  let adapter;
  try {
    if (driver === 'claude-code') await claudeAuthentication(plan);
    const child = launch(plan, plan.args); child.stdio[3].on('error', () => {});
    const transport = new JsonLineTransport(child, { timeoutMs: 15000 });
    adapter = new ProviderAdapter(driver, transport, { ...binding, liveOptions: { cwd: plan.cwd } });
    const close = adapter.close.bind(adapter); let closing;
    adapter.close = () => closing ??= (async () => { await close(); rmSync(plan.runDirectory, { recursive: true, force: true }); })();
    await adapter.connect(); return adapter;
  } catch (error) {
    if (adapter) await adapter.close(); else rmSync(plan.runDirectory, { recursive: true, force: true });
    if (error instanceof ProviderError) throw error;
    throw new ProviderError('BLOCKED_ENV', 'Official provider could not start in the browser sandbox');
  }
}
