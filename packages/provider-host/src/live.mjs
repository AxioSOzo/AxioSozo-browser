// Live Ask AI sessions over the user's own official clients.
//
// Admission is a capability check of the exact installed executable (checks.mjs), not a
// version pin: any Codex / Claude Code version is used when it accepts the exact argv,
// offers the model no tools, keeps the user's customizations out and answers in a format
// our parser reads. Sign-in is the client's own: Codex uses the user's normal CODEX_HOME
// sign-in (with --ignore-user-config, so none of their config.toml, MCP servers or hooks),
// Claude Code its normal Keychain sign-in (with --safe-mode/--restricted).
import { existsSync, lstatSync, mkdtempSync, realpathSync, rmSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { ProviderAdapter } from './adapters.mjs';
import { claudeManagedPolicy, claudeSignIn, requireCompatibleClient, ANTIGRAVITY_REASON } from './checks.mjs';
import { CodexExecAdapter } from './codex-exec.mjs';
import { discover } from './discovery.mjs';
import { CODEX_INSTRUCTIONS, claudeArguments, codexExecArguments, launchConfined, liveBroker, liveProfile, privateDirectory,
  runtimeEnvironment } from './launch.mjs';
import { providerBuildRoot } from './storage.mjs';
import { JsonLineTransport } from './transport.mjs';
import { id, ProviderError, requireValue } from './validation.mjs';

export { LIVE_POLICY, LIVE_ROUTES, CODEX_HOME_DENIED, CODEX_DISABLED_FEATURES, liveBroker, liveProfile, claudeArguments,
  codexArguments, codexExecArguments, runtimeEnvironment, resolveClient, resolveNativeClient } from './launch.mjs';

/** Per-turn ceiling of one confined `codex exec` process (the host's own turn deadline is 120 s). */
const CODEX_TURN_PROCESS_MS = 150000;

/** Installation metadata for a live route (no version gate: see checks.mjs). */
export function liveMetadata(driver, { searchPath = process.env.PATH ?? '' } = {}) {
  requireValue(driver !== 'antigravity', 'ANTIGRAVITY_PROTOCOL_UNSUPPORTED', `Antigravity cannot be used for Ask AI: ${ANTIGRAVITY_REASON}`);
  const metadata = discover({ searchPath }).find(item => item.driver === driver);
  requireValue(metadata?.installed, 'BLOCKED_ENV', 'Install the official provider CLI before connecting');
  return metadata;
}

export async function claudeAuthentication(plan) {
  // The official client alone reads/authenticates its own store. The host keeps only
  // categorical facts and never returns identifying fields.
  const runDirectory = mkdtempSync(path.join(plan.runDirectory, 'auth-'));
  for (const folder of ['workspace', 'tmp', 'cache', 'claude-config']) privateDirectory(path.join(runDirectory, folder));
  try {
    const { sign_in, facts } = await claudeSignIn({ broker: plan.broker, executable: plan.executable, officialHome: plan.officialHome, runDirectory });
    requireValue(facts.parsed, 'BLOCKED_ENV', `Official Claude could not complete its confined authentication check (exit ${facts.exit ?? 'signal'})`);
    if (sign_in === 'needs-sign-in') {
      const error = new ProviderError('BLOCKED_AUTH', 'Claude Code is not signed in. Run `claude` in Terminal and sign in, then send again. AxioSozo never opens the sign-in page or reads your credentials.');
      error.diagnostic = { process_exit: facts.exit, sandbox_denial_reported: facts.sandbox_denial_reported, official_status_parsed: true, logged_in: false };
      throw error;
    }
    requireValue(sign_in === 'signed-in', 'UNSUPPORTED', 'This chat route currently supports personal Claude Pro/Max sign-in; managed and API authentication require a separate reviewed policy');
  } finally { rmSync(runDirectory, { recursive: true, force: true }); }
}

export async function createLaunchPlan(driver, binding, { searchPath, officialHome = process.env.HOME } = {}) {
  requireValue(process.platform === 'darwin' && process.arch === 'arm64', 'BLOCKED_ENV', 'Provider chat currently requires macOS Apple Silicon');
  id(binding.instance_id, 'instance_id');
  requireValue(driver !== 'antigravity', 'ANTIGRAVITY_PROTOCOL_UNSUPPORTED', `Antigravity cannot be used for Ask AI: ${ANTIGRAVITY_REASON}`);
  requireValue(typeof officialHome === 'string' && path.isAbsolute(officialHome) && existsSync(officialHome) && realpathSync(officialHome) === officialHome,
    'BLOCKED_ENV', 'Pass the official user HOME for the client\'s own sign-in');
  let codexHome;
  if (driver === 'codex') {
    // The user's own Codex home, for its sign-in only: config.toml is ignored
    // (--ignore-user-config) and customization files are denied by the sandbox profile.
    requireValue(existsSync(path.join(officialHome, '.codex', 'auth.json')), 'CODEX_LOGIN_REQUIRED',
      'Codex is not signed in. Run `codex login` in Terminal, then send again. AxioSozo never opens the sign-in page or reads your Codex credentials.');
    codexHome = realpathSync(path.join(officialHome, '.codex'));
    const stat = lstatSync(codexHome);
    requireValue(stat.isDirectory() && stat.uid === process.getuid(), 'BLOCKED_ENV', 'The Codex home must be your own directory');
  } else {
    requireValue(!claudeManagedPolicy(officialHome), 'UNSUPPORTED', 'Managed Claude policy needs a separate reviewed browser integration');
  }
  const check = await requireCompatibleClient(driver, { searchPath, officialHome });
  const executable = check.executable, broker = liveBroker();
  const runtime = privateDirectory(path.join(providerBuildRoot(), 'runtime'));
  const instance = privateDirectory(path.join(privateDirectory(path.join(runtime, driver)), binding.instance_id));
  const runDirectory = mkdtempSync(path.join(instance, 'session-'));
  for (const folder of ['workspace', 'home', 'tmp', 'cache', 'claude-config', 'state', 'log']) privateDirectory(path.join(runDirectory, folder));
  if (driver === 'codex') writeFileSync(path.join(runDirectory, 'instructions.md'), CODEX_INSTRUCTIONS, { mode: 0o600 });
  const context = { executable, runDirectory, codexHome, officialHome: driver === 'claude-code' ? officialHome : undefined };
  return { ...context, broker, check, cwd: path.join(runDirectory, 'workspace'),
    profile: liveProfile({ ...context, network: 'all' }),
    env: runtimeEnvironment(driver, { runDirectory, codexHome, officialHome }),
    args: driver === 'codex' ? codexExecArguments({ runDirectory, dropped: check.dropped_options }) : claudeArguments() };
}

export async function createLiveAdapter(driver, binding, options) {
  const plan = await createLaunchPlan(driver, binding, options);
  let adapter;
  try {
    if (driver === 'codex') {
      adapter = new CodexExecAdapter({ spawn: () => launchConfined(plan, plan.args, CODEX_TURN_PROCESS_MS) }, binding);
    } else {
      await claudeAuthentication(plan);
      const child = launchConfined(plan, plan.args);
      adapter = new ProviderAdapter(driver, new JsonLineTransport(child, { timeoutMs: 15000 }), { ...binding, liveOptions: { cwd: plan.cwd } });
    }
    const close = adapter.close.bind(adapter); let closing;
    adapter.close = () => closing ??= (async () => { await close(); rmSync(plan.runDirectory, { recursive: true, force: true }); })();
    await adapter.connect(); return adapter;
  } catch (error) {
    if (adapter) await adapter.close(); else rmSync(plan.runDirectory, { recursive: true, force: true });
    if (error instanceof ProviderError) throw error;
    throw new ProviderError('BLOCKED_ENV', 'Official provider could not start in the browser sandbox');
  }
}
