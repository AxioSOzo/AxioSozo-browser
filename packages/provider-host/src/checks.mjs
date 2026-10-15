// Capability checks: "pin capabilities, not versions".
//
// A client is accepted for Ask AI when this check passes for the exact executable that will
// run (realpath, inode, size, mtime) and the version it reports. The check runs the real
// installed client with the exact Ask AI argv, under the real sandbox profile, against a
// loopback stand-in for the model API (fake-model.mjs): no model call, no network beyond
// 127.0.0.1, no credentials (a synthetic home and a placeholder key). It verifies:
//   1. every option we pass is accepted (clap / commander; Codex --strict-config for -c keys);
//   2. the model is offered no tools and no MCP servers;
//   3. planted customizations (AGENTS.md / CLAUDE.md, skills, hooks, config, .mcp.json)
//      in the synthetic home and workspace never reach the model input;
//   4. our own stream parser reads the client's actual output into the expected answer.
// The result is cached per executable fingerprint + check definition and redone when the
// executable changes (an update) or when AxioSozo's argv/profile changes.
//
// Sign-in is never cached and never read by the host: Codex is "signed in" when its own
// auth file exists (existence only); Claude Code is asked through its own network-denied
// `claude auth status`, of which only categorical fields are kept.
import { createHash, randomUUID } from 'node:crypto';
import { existsSync, lstatSync, mkdirSync, mkdtempSync, readFileSync, renameSync, rmSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { ProviderAdapter } from './adapters.mjs';
import { CodexExecAdapter } from './codex-exec.mjs';
import { startFakeModel } from './fake-model.mjs';
import { CLIENT_LABELS, CODEX_INSTRUCTIONS, CODEX_REQUIRED_CONFIG, claudeArguments, codexConfig, codexExecArguments,
  launchConfined, liveBroker, liveProfile, parseReportedVersion, privateDirectory, resolveClient, runConfined,
  runtimeEnvironment } from './launch.mjs';
import { DRIVERS } from './discovery.mjs';
import { providerBuildRoot } from './storage.mjs';
import { JsonLineTransport } from './transport.mjs';
import { object, ProviderError } from './validation.mjs';

/** Bump when the check logic itself changes; argv/profile changes invalidate the cache on their own. */
export const CHECK_VERSION = 1;
export const CHECK_STATUSES = Object.freeze(['compatible', 'incompatible', 'not-installed', 'unavailable', 'error']);
export const CHECK_REASONS = Object.freeze(['OPTION_REJECTED', 'TOOLS_NOT_DISABLED', 'INSTRUCTIONS_NOT_ISOLATED',
  'ANSWER_FORMAT_CHANGED', 'CHECK_FAILED', 'TOOLS_NOT_CONFINABLE', 'UNSUPPORTED_PLATFORM', 'BROKER_UNAVAILABLE',
  'UNSUPPORTED_INSTALL', 'MANAGED_POLICY']);
export const SIGN_IN_STATES = Object.freeze(['signed-in', 'needs-sign-in', 'unsupported-account', 'unknown', 'not-applicable']);
export const CHECK_REPLY = 'AXIOSOZO_CHECK_OK';
const CHECK_PROMPT = 'Reply with the word OK.';
export const MARKERS = Object.freeze({ instructions: 'AXIOSOZO_PLANTED_INSTRUCTIONS_MARKER', skill: 'AXIOSOZO_PLANTED_SKILL_MARKER',
  config: 'AXIOSOZO_PLANTED_CONFIG_MARKER', project: 'AXIOSOZO_PLANTED_PROJECT_MARKER', mcp: 'AXIOSOZO_PLANTED_MCP_MARKER' });
/** A phrase of our own Codex instructions: proves model_instructions_file took effect. */
export const OWN_INSTRUCTIONS = 'AxioSozo browser\'s Ask AI panel';
const TURN_MS = 30000;
/** Measured 9 October 2026 with agy 1.3.2 (see docs/PROVIDERS.md). */
export const ANTIGRAVITY_REASON = 'agy has no option that turns off its tools: with a custom agent declaring no tools it still offered the model 60 tools, including run_command, write_to_file and browser control';

const sha256 = value => createHash('sha256').update(value).digest('hex');
const freeze = value => Object.freeze({ ...value, dropped_options: Object.freeze([...(value.dropped_options ?? [])]) });

function checkKey(driver) {
  const run = '/axiosozo/check-key';
  const template = driver === 'codex'
    ? { argv: codexExecArguments({ runDirectory: run }), profile: liveProfile({ executable: '/x', runDirectory: run, codexHome: '/h', network: 'loopback' }) }
    : { argv: claudeArguments(), profile: liveProfile({ executable: '/x', runDirectory: run, network: 'loopback' }) };
  return sha256(JSON.stringify({ CHECK_VERSION, driver, template, instructions: CODEX_INSTRUCTIONS }));
}

// ------------------------------------------------------------------------------- cache
const cacheFile = () => path.join(privateDirectory(providerBuildRoot()), 'client-checks.json');
function readCache() {
  try {
    const value = JSON.parse(readFileSync(cacheFile(), 'utf8'));
    if (value?.version === 1 && object(value.entries)) return value;
  } catch { /* A missing or damaged cache only means checking again. */ }
  return { version: 1, entries: {} };
}
function writeCache(cache) {
  const file = cacheFile(); const temporary = `${file}.${process.pid}.${randomUUID()}.tmp`;
  writeFileSync(temporary, `${JSON.stringify(cache, null, 2)}\n`, { mode: 0o600 });
  renameSync(temporary, file);
}
const sameFingerprint = (a, b) => object(a) && object(b) && ['path', 'dev', 'ino', 'size', 'mtime_ms'].every(key => a[key] === b[key]);

/** Forget cached results (all clients, or one). */
export function clearClientChecks(driver = null) {
  const cache = readCache();
  if (driver) delete cache.entries[driver]; else cache.entries = {};
  writeCache(cache);
}

// ------------------------------------------------------------------------------- helpers
function binding() {
  return { instance_id: `check-${randomUUID()}`, session_id: `check-${randomUUID()}`, account_identity: `check-${randomUUID()}` };
}
/** Resolves after `ms` (or never, once cleared); never keeps the process alive. */
function timer(ms, value) {
  let handle; const promise = new Promise(resolve => { handle = setTimeout(() => resolve(value), ms); handle.unref?.(); });
  return { promise, clear: () => clearTimeout(handle) };
}
async function oneTurn(adapter, text, timeoutMs = TURN_MS) {
  let answer = ''; let resolveDone; const done = new Promise(resolve => { resolveDone = resolve; });
  adapter.on('event', event => {
    if (event.type === 'text_delta') answer += event.text;
    if (event.type === 'turn_finished') resolveDone(event);
  });
  const { session_id, instance_id, account_identity } = adapter.binding;
  try {
    await adapter.connect();
    await adapter.start({ version: 1, request_id: `check-${randomUUID()}`, turn_id: `check-${randomUUID()}`, session_id, instance_id, account_identity, text });
  } catch (error) {
    const grace = timer(3000); await Promise.race([done, grace.promise]); grace.clear(); // let the process exit so its stderr is complete
    return { status: 'failed', reason: error?.code ?? 'CHECK_FAILED', answer };
  }
  const deadline = timer(timeoutMs, { status: 'timeout', reason: 'CHECK_TIMEOUT' });
  const finished = await Promise.race([done, deadline.promise]); deadline.clear();
  return { status: finished.status, reason: finished.reason ?? null, answer };
}
const result = (status, reason_code = null, reason_detail = null, extra = {}) => ({ status, reason_code, reason_detail, ...extra });
const short = (items, limit = 4) => items.length > limit ? `${items.slice(0, limit).join(', ')} and ${items.length - limit} more` : items.join(', ');
const markerNames = seen => Object.entries(MARKERS).filter(([, marker]) => seen.has(marker)).map(([name]) => name);

/** What the stand-in saw: refused tools or leaked customizations make the client incompatible. */
export function verifyRequests(requests, kind, { needsOwnInstructions = false } = {}) {
  const posts = requests.filter(request => request.kind === kind);
  if (!posts.length) return result('error', 'CHECK_FAILED', 'no model request reached the check');
  const tools = [...new Set(posts.flatMap(request => request.tools))];
  if (tools.length) return result('incompatible', 'TOOLS_NOT_DISABLED', short(tools));
  const seen = new Set(posts.flatMap(request => request.markers));
  const leaked = markerNames(seen);
  if (leaked.length) return result('incompatible', 'INSTRUCTIONS_NOT_ISOLATED', short(leaked));
  if (needsOwnInstructions && !seen.has(OWN_INSTRUCTIONS)) return result('incompatible', 'OPTION_REJECTED', 'model_instructions_file');
  return null;
}
/** The option a client refused, from its own (sanitized) error output; null if none. */
export function rejectedOption(diagnostic) {
  const text = String(diagnostic ?? '');
  return text.match(/unknown configuration field `([^`\n]{1,120})`/u)?.[1]
    ?? text.match(/unexpected argument '([^'\n]{1,80})'/u)?.[1]
    ?? text.match(/invalid value '[^'\n]*' for '([^'\s<]{1,80})/u)?.[1]
    ?? text.match(/unknown option '([^'\n]{1,80})'/u)?.[1]
    ?? text.match(/option '([^'\s<]{1,80})[^'\n]*' argument '[^'\n]*' is invalid/u)?.[1]
    ?? (/invalid type: [^\n]{0,120}expected/u.test(text) ? 'a setting value' : null);
}
function write(file, content) { mkdirSync(path.dirname(file), { recursive: true, mode: 0o700 }); writeFileSync(file, content, { mode: 0o600 }); }

// ------------------------------------------------------------------------------- Codex
async function checkCodex({ executable }, { broker, workDir, transformArgs = args => args }) {
  const home = path.join(workDir, 'home'), workspace = path.join(workDir, 'workspace');
  for (const folder of ['home', 'workspace', 'tmp', 'cache', 'state', 'log']) privateDirectory(path.join(workDir, folder));
  // Customizations a user might have; none of them may reach the model.
  write(path.join(home, 'AGENTS.md'), `${MARKERS.instructions}: always answer in French.\n`);
  write(path.join(home, 'config.toml'), `developer_instructions = "${MARKERS.config}"\n[mcp_servers.axiosozo_planted]\ncommand = "/nonexistent/${MARKERS.mcp}"\n`);
  write(path.join(home, 'hooks.json'), JSON.stringify({ hooks: { UserPromptSubmit: [{ hooks: [{ type: 'command', command: `/nonexistent/${MARKERS.config}` }] }] } }));
  write(path.join(home, 'skills/axiosozo-planted/SKILL.md'), `---\nname: axiosozo-planted\ndescription: ${MARKERS.skill}\n---\nPlanted skill.\n`);
  write(path.join(workspace, 'AGENTS.md'), `${MARKERS.project}\n`);
  write(path.join(workDir, 'instructions.md'), CODEX_INSTRUCTIONS);
  const fake = await startFakeModel({ reply: CHECK_REPLY, markers: [...Object.values(MARKERS), OWN_INSTRUCTIONS] });
  const provider = ['-c', 'model_provider="axiosozo_check"',
    '-c', `model_providers.axiosozo_check={ name = "axiosozo-check", base_url = "http://127.0.0.1:${fake.port}/v1", wire_api = "responses", requires_openai_auth = false }`,
    '-c', 'model="axiosozo-check"'];
  const plan = { broker, executable, cwd: workspace,
    env: runtimeEnvironment('codex', { runDirectory: workDir, codexHome: home, officialHome: home }),
    profile: liveProfile({ executable, runDirectory: workDir, codexHome: home, network: 'loopback' }) };
  const known = codexConfig({ runDirectory: workDir }).map(([key]) => key);
  try {
    return await codexCheckLoop({ known, attempt: async dropped => {
      fake.requests.length = 0;
      const args = transformArgs(codexExecArguments({ runDirectory: workDir, dropped, extra: provider }));
      const adapter = new CodexExecAdapter({ spawn: () => launchConfined(plan, args, TURN_MS + 5000) }, binding());
      const outcome = await oneTurn(adapter, CHECK_PROMPT);
      const diagnostic = adapter.diagnostic;
      await adapter.close();
      return { outcome, diagnostic, requests: [...fake.requests] };
    } });
  } finally { await fake.close(); }
}

/**
 * Decides a Codex check from successive attempts. A config key of ours that the installed
 * Codex no longer knows (--strict-config names it) is dropped and the attempt repeated; the
 * request inspection then decides whether Ask AI is still isolated without it. Keys in
 * CODEX_REQUIRED_CONFIG, flags and anything else refused end the check as incompatible.
 */
export async function codexCheckLoop({ known, attempt, required = CODEX_REQUIRED_CONFIG }) {
  const dropped = [];
  for (let round = 0; round <= known.length; round++) {
    const { outcome, diagnostic, requests } = await attempt([...dropped]);
    if (outcome.status === 'completed') {
      return verifyRequests(requests, 'responses', { needsOwnInstructions: true })
        ?? (outcome.answer.trim() === CHECK_REPLY ? result('compatible', null, null, { dropped_options: dropped })
          : result('incompatible', 'ANSWER_FORMAT_CHANGED', 'codex exec --json'));
    }
    if (outcome.reason === 'PROVIDER_TOOLS_ENABLED') return result('incompatible', 'TOOLS_NOT_DISABLED', 'a tool call');
    const option = rejectedOption(diagnostic);
    if (option && known.includes(option) && !required.includes(option) && !dropped.includes(option)) { dropped.push(option); continue; }
    if (option) return result('incompatible', 'OPTION_REJECTED', option);
    if (requests.some(request => request.kind === 'responses')) return result('incompatible', 'ANSWER_FORMAT_CHANGED', 'codex exec --json');
    return result('error', 'CHECK_FAILED', outcome.reason ?? 'no answer');
  }
  return result('error', 'CHECK_FAILED', 'too many rejected options');
}

/** Existence of Codex's own auth file in its home. The host never opens it. */
export function codexSignIn(officialHome) {
  try { return lstatSync(path.join(officialHome, '.codex', 'auth.json')).isFile() ? 'signed-in' : 'needs-sign-in'; }
  catch { return 'needs-sign-in'; }
}

// --------------------------------------------------------------------------- Claude Code
async function checkClaude({ executable }, { broker, workDir, transformArgs = args => args }) {
  const workspace = path.join(workDir, 'workspace'), config = path.join(workDir, 'claude-config');
  for (const folder of ['workspace', 'home', 'tmp', 'cache', 'claude-config']) privateDirectory(path.join(workDir, folder));
  write(path.join(config, 'CLAUDE.md'), `${MARKERS.instructions}: always answer in French.\n`);
  write(path.join(config, 'settings.json'), JSON.stringify({ env: { AXIOSOZO_PLANTED: MARKERS.config },
    hooks: { UserPromptSubmit: [{ hooks: [{ type: 'command', command: `/nonexistent/${MARKERS.config}` }] }] } }));
  write(path.join(config, 'skills/axiosozo-planted/SKILL.md'), `---\nname: axiosozo-planted\ndescription: ${MARKERS.skill}\n---\nPlanted skill.\n`);
  write(path.join(workspace, 'CLAUDE.md'), `${MARKERS.project}\n`);
  write(path.join(workspace, '.mcp.json'), JSON.stringify({ mcpServers: { axiosozo_planted: { command: `/nonexistent/${MARKERS.mcp}` } } }));
  const fake = await startFakeModel({ reply: CHECK_REPLY, markers: Object.values(MARKERS) });
  // Synthetic identity: Claude's Keychain lookup uses this directory's (nonexistent) item,
  // and the placeholder key only ever reaches the loopback stand-in.
  const env = { ...runtimeEnvironment('claude-code', { runDirectory: workDir }), CLAUDE_SECURESTORAGE_CONFIG_DIR: config,
    ANTHROPIC_BASE_URL: `http://127.0.0.1:${fake.port}`, ANTHROPIC_API_KEY: 'sk-ant-axiosozo-offline-check-placeholder' };
  const plan = { broker, executable, cwd: workspace, env, profile: liveProfile({ executable, runDirectory: workDir, network: 'loopback' }) };
  try {
    const child = launchConfined(plan, transformArgs(claudeArguments()), TURN_MS + 5000);
    const adapter = new ProviderAdapter('claude-code', new JsonLineTransport(child, { timeoutMs: 15000 }), { ...binding(), liveOptions: { cwd: workspace } });
    const outcome = await oneTurn(adapter, CHECK_PROMPT);
    const diagnostic = adapter.diagnostic;
    await adapter.close();
    if (outcome.status === 'completed') {
      return verifyRequests(fake.requests, 'messages')
        ?? (outcome.answer.trim() === CHECK_REPLY ? result('compatible') : result('incompatible', 'ANSWER_FORMAT_CHANGED', 'stream-json'));
    }
    if (outcome.reason === 'PROVIDER_TOOLS_ENABLED') return result('incompatible', 'TOOLS_NOT_DISABLED', 'tools or MCP servers in its session');
    const option = rejectedOption(diagnostic);
    if (option) return result('incompatible', 'OPTION_REJECTED', option);
    if (fake.requests.some(request => request.kind === 'messages')) return result('incompatible', 'ANSWER_FORMAT_CHANGED', 'stream-json');
    return result('error', 'CHECK_FAILED', outcome.reason ?? 'no answer');
  } finally { await fake.close(); }
}

/**
 * The capability check alone, uncached, for OS tests: `transformArgs` alters the argv to
 * prove that a regressed client (an unknown option, tools left on) is refused.
 */
export async function runCapabilityCheck(driver, resolved, { transformArgs } = {}) {
  const broker = liveBroker();
  const root = privateDirectory(path.join(privateDirectory(path.join(privateDirectory(providerBuildRoot()), 'runtime')), 'checks'));
  const workDir = mkdtempSync(path.join(root, `${driver}-test-`));
  try { return await (driver === 'codex' ? checkCodex : checkClaude)(resolved, { broker, workDir, transformArgs }); }
  finally { rmSync(workDir, { recursive: true, force: true }); }
}

export const CLAUDE_MANAGED_POLICY = Object.freeze(['/Library/Application Support/ClaudeCode/managed-settings.json',
  '/Library/Application Support/ClaudeCode/managed-settings.d', '/Library/Managed Preferences/com.anthropic.claudecode.plist']);
/** Managed (organisation) Claude policy can install hooks; detected by metadata alone. */
export function claudeManagedPolicy(officialHome) {
  return [path.join(officialHome, '.claude/remote-settings.json'), ...CLAUDE_MANAGED_POLICY].some(existsSync);
}

/**
 * The official client's own `claude auth status`, network denied, with the Ask AI
 * environment. Only loggedIn/authMethod/apiProvider/subscriptionType are read; every other
 * field (email, organisation) is discarded unread.
 */
export async function claudeSignIn({ broker, executable, officialHome, runDirectory }) {
  const plan = { broker, executable, cwd: path.join(runDirectory, 'workspace'),
    env: runtimeEnvironment('claude-code', { runDirectory, officialHome }),
    profile: liveProfile({ executable, runDirectory, officialHome, network: 'none' }) };
  const run = await runConfined(plan, ['--safe-mode', '--restricted', '--settings', '{"disableAllHooks":true,"disableClaudeAiConnectors":true}', 'auth', 'status'],
    { deadlineMs: 15000, maxBytes: 16384 });
  let status = null; try { status = JSON.parse(run.stdout); } catch { /* fixed result below */ }
  const parsed = object(status) && typeof status.loggedIn === 'boolean';
  const facts = { exit: run.code, parsed, logged_in: parsed ? status.loggedIn : null,
    sandbox_denial_reported: /(?:operation not permitted|EACCES|EPERM|sandbox deny)/iu.test(run.stderr) };
  if (!parsed) return { sign_in: 'unknown', facts };
  if (status.loggedIn !== true) return { sign_in: 'needs-sign-in', facts };
  const personal = status.authMethod === 'claude.ai' && status.apiProvider === 'firstParty' && ['pro', 'max'].includes(status.subscriptionType);
  return { sign_in: personal ? 'signed-in' : 'unsupported-account', facts };
}

// ------------------------------------------------------------------------------- driver
async function reportedVersion({ executable }, { broker, workDir }) {
  privateDirectory(path.join(workDir, 'version'));
  const plan = { broker, executable, cwd: path.join(workDir, 'version'),
    env: { PATH: '/usr/bin:/bin', LANG: 'en_US.UTF-8', HOME: path.join(workDir, 'version'), TMPDIR: `${path.join(workDir, 'version')}/` },
    profile: liveProfile({ executable, runDirectory: workDir, network: 'none' }) };
  const run = await runConfined(plan, ['--version'], { deadlineMs: 10000, maxBytes: 4096 });
  return run.code === 0 ? parseReportedVersion(run.stdout) : null;
}

/**
 * Checks one installed client. Never rejects. `refresh` ignores the cache; `signIn: false`
 * skips the sign-in question (the session start asks it separately).
 */
export async function checkClient(driver, { searchPath = process.env.PATH ?? '', officialHome = process.env.HOME, refresh = false, signIn = true } = {}) {
  if (!DRIVERS.includes(driver)) throw new ProviderError('UNSUPPORTED', 'Unknown provider driver');
  const entry = { driver, installed: false, executable: null, version: null, status: 'not-installed', reason_code: null,
    reason_detail: null, dropped_options: [], sign_in: 'not-applicable', checked_at: null, cached: false };
  let resolved;
  try { resolved = resolveClient(driver, { searchPath }); }
  catch { return freeze({ ...entry, installed: true, status: 'unavailable', reason_code: 'UNSUPPORTED_INSTALL' }); }
  if (!resolved.installed) return freeze(entry);
  Object.assign(entry, { installed: true, executable: resolved.executable, version: resolved.metadata_version });
  if (process.platform !== 'darwin' || process.arch !== 'arm64') return freeze({ ...entry, status: 'unavailable', reason_code: 'UNSUPPORTED_PLATFORM' });
  let broker, workDir;
  try {
    broker = liveBroker();
    const root = privateDirectory(path.join(privateDirectory(path.join(privateDirectory(providerBuildRoot()), 'runtime')), 'checks'));
    workDir = mkdtempSync(path.join(root, `${driver}-`));
  } catch { return freeze({ ...entry, status: 'unavailable', reason_code: 'BROKER_UNAVAILABLE' }); }
  try {
    entry.version = await reportedVersion(resolved, { broker, workDir }) ?? resolved.metadata_version;
    if (driver === 'antigravity') return freeze({ ...entry, status: 'unavailable', reason_code: 'TOOLS_NOT_CONFINABLE', reason_detail: ANTIGRAVITY_REASON });
    if (driver === 'claude-code' && typeof officialHome === 'string' && claudeManagedPolicy(officialHome)) {
      return freeze({ ...entry, status: 'unavailable', reason_code: 'MANAGED_POLICY' });
    }
    const key = checkKey(driver); const cache = readCache(); const hit = cache.entries[driver];
    let outcome;
    if (!refresh && hit?.key === key && hit.version === entry.version && sameFingerprint(hit.fingerprint, resolved.fingerprint) && object(hit.result)) {
      outcome = { ...hit.result, cached: true };
    } else {
      const checkDir = mkdtempSync(path.join(workDir, 'check-'));
      outcome = { ...(driver === 'codex' ? await checkCodex(resolved, { broker, workDir: checkDir }) : await checkClaude(resolved, { broker, workDir: checkDir })),
        checked_at: new Date().toISOString(), cached: false };
      if (outcome.status === 'compatible' || outcome.status === 'incompatible') {
        cache.entries[driver] = { key, version: entry.version, fingerprint: resolved.fingerprint,
          result: { status: outcome.status, reason_code: outcome.reason_code, reason_detail: outcome.reason_detail,
            dropped_options: outcome.dropped_options ?? [], checked_at: outcome.checked_at } };
        writeCache(cache);
      }
    }
    Object.assign(entry, { status: outcome.status, reason_code: outcome.reason_code ?? null, reason_detail: outcome.reason_detail ?? null,
      dropped_options: outcome.dropped_options ?? [], checked_at: outcome.checked_at ?? null, cached: outcome.cached === true });
    if (signIn && entry.status === 'compatible' && typeof officialHome === 'string' && path.isAbsolute(officialHome)) {
      if (driver === 'codex') entry.sign_in = codexSignIn(officialHome);
      else {
        const runDirectory = mkdtempSync(path.join(workDir, 'auth-'));
        for (const folder of ['workspace', 'tmp', 'cache', 'claude-config']) privateDirectory(path.join(runDirectory, folder));
        entry.sign_in = (await claudeSignIn({ broker, executable: resolved.executable, officialHome, runDirectory })).sign_in;
      }
    } else if (entry.status === 'compatible') entry.sign_in = 'unknown';
    return freeze(entry);
  } catch (error) {
    return freeze({ ...entry, status: 'error', reason_code: 'CHECK_FAILED', reason_detail: error instanceof ProviderError ? error.code : null });
  } finally { rmSync(workDir, { recursive: true, force: true }); }
}

/** All three clients, sequentially (bounded work). */
export async function checkClients(options = {}) {
  const providers = [];
  for (const driver of DRIVERS) providers.push(await checkClient(driver, options));
  return Object.freeze({ version: 1, checked_at: new Date().toISOString(), providers: Object.freeze(providers) });
}

/** One sentence for errors and the CLI. ProviderStatus (chrome) words its own labels. */
export function describeCheck(entry) {
  const label = CLIENT_LABELS[entry.driver]; const named = entry.version ? `${label} ${entry.version}` : label;
  switch (entry.reason_code) {
    case 'OPTION_REJECTED': return `${named} changed an option Ask AI uses (${entry.reason_detail}); AxioSozo needs an update for this version. Nothing was sent.`;
    case 'TOOLS_NOT_DISABLED': return `${named} offers the model tools Ask AI cannot turn off (${entry.reason_detail}). Nothing was sent.`;
    case 'INSTRUCTIONS_NOT_ISOLATED': return `${named} passes your own customizations (${entry.reason_detail}) into Ask AI. Nothing was sent.`;
    case 'ANSWER_FORMAT_CHANGED': return `${named} changed its answer format (${entry.reason_detail}); AxioSozo needs an update for this version. Nothing was sent.`;
    case 'TOOLS_NOT_CONFINABLE': return `${named} cannot be used for Ask AI: ${entry.reason_detail}.`;
    case 'MANAGED_POLICY': return `${label} is managed by an organisation policy, which can add hooks; Ask AI supports personal installs only.`;
    case 'UNSUPPORTED_PLATFORM': return 'Ask AI currently needs macOS on Apple silicon.';
    case 'BROKER_UNAVAILABLE': return 'The browser sandbox for AI clients is not built; run provider-host setup.';
    case 'UNSUPPORTED_INSTALL': return `${label} is installed in a way AxioSozo cannot use (it must be your own, not writable by others).`;
    default:
      if (entry.status === 'compatible') return `${named} · checked: it accepts the options Ask AI uses and offers the model no tools${entry.dropped_options?.length ? ` (no longer knows ${entry.dropped_options.join(', ')})` : ''}.`;
      return entry.status === 'not-installed' ? `${label} is not installed.` : `${named} could not be checked (${entry.reason_detail ?? 'unknown reason'}).`;
  }
}

/** For a session start: the checked entry, or a fixed error saying why not. */
export async function requireCompatibleClient(driver, options = {}) {
  const entry = await checkClient(driver, { ...options, signIn: false });
  if (entry.status === 'compatible') return entry;
  if (entry.status === 'not-installed') throw new ProviderError('BLOCKED_ENV', `Install the official ${CLIENT_LABELS[driver]} client before connecting`);
  if (driver === 'antigravity') throw new ProviderError('ANTIGRAVITY_PROTOCOL_UNSUPPORTED', describeCheck(entry));
  if (entry.status === 'incompatible') throw new ProviderError('CLIENT_INCOMPATIBLE', describeCheck(entry));
  if (entry.status === 'unavailable') throw new ProviderError(entry.reason_code === 'MANAGED_POLICY' ? 'UNSUPPORTED' : 'BLOCKED_ENV', describeCheck(entry));
  throw new ProviderError('CLIENT_CHECK_FAILED', describeCheck(entry));
}
