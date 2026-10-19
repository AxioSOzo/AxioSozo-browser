#!/usr/bin/env node
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { readdirSync, mkdirSync, existsSync, readFileSync, writeFileSync } from 'node:fs';
import { createHash, randomUUID } from 'node:crypto';
import path from 'node:path';
import { discover, DRIVERS } from './src/discovery.mjs';
import { livePreflight } from './src/adapters.mjs';
import { DecisionProvider, DIAGNOSTIC_STATE } from './src/decision.mjs';
import { platformKeychain } from './src/keychain.mjs';
import { providerBuildRoot } from './src/storage.mjs';
import { SANDBOX_POLICY } from './src/sandbox.mjs';
import { createLiveAdapter, LIVE_POLICY } from './src/live.mjs';
import { checkClients, clearClientChecks, describeCheck } from './src/checks.mjs';
import { serveStdio } from './src/host.mjs';
import { UnderstandRunner } from './src/understand.mjs';

const root = path.dirname(fileURLToPath(import.meta.url));
const [command = 'discover', driver, ...flags] = process.argv.slice(2);
const print = data => process.stdout.write(`${JSON.stringify(data, null, 2)}\n`);
const storageScript = path.resolve(root, '../../scripts/storage.py');
const helperPath = () => path.join(providerBuildRoot(), 'keychain');
function run(executable, args) {
  const result = spawnSync(executable, args, { cwd: root, shell: false, stdio: 'inherit' });
  if (result.error) throw result.error;
  if (result.status !== 0) { process.exitCode = result.status ?? 1; return false; }
  return true;
}
function sourceFiles(directory) {
  return readdirSync(directory, { withFileTypes: true }).filter(item => !item.name.startsWith('._')).flatMap(item => item.isDirectory() ? sourceFiles(path.join(directory, item.name)) : /\.(mjs|ts)$/.test(item.name) ? [path.join(directory, item.name)] : []);
}
function nativeRun(args) { return run('/Users/wout/.local/bin/dev-external', ['python3', storageScript, 'exec', '/usr/bin/clang', ...args]); }
// Linux: no wrapper exists; storage.py exec routes temporary files into the build root.
function linuxRun(args) { return run('/usr/bin/python3', [storageScript, 'exec', '--', '/usr/bin/cc', ...args]); }
// libsecret compile/link flags; null when the development package is missing.
function libsecretFlags() {
  const result = spawnSync('pkg-config', ['--cflags', '--libs', 'libsecret-1'], { encoding: 'utf8' });
  return result.status === 0 ? result.stdout.trim().split(/\s+/u).filter(Boolean) : null;
}
const LINUX_POLICY = 'linux-secret-service-no-provider-sandbox-v1';
const linuxBlocked = message => { throw Object.assign(new Error(message), { code: 'BLOCKED_ENV' }); };
try {
  // Browser product AI calls are NOT_AUTHORIZED: the decision factory disables live
  // authorization before any Keychain read or fetch. OpenAI remains UNVERIFIED_SHAPE.
  // The understand runner likewise disables live CLIs (liveAuthorized: false).
  if (command === 'serve') await serveStdio({ createAdapter: createLiveAdapter,
    createDecisionProvider: () => new DecisionProvider({ liveAuthorized: false, keyStore: { read: async () => platformKeychain(helperPath()).read() },
      openaiKeyStore: { read: async () => platformKeychain(helperPath(), 'openai').read() } }),
    createKeyStore: provider => platformKeychain(helperPath(), provider),
    createUnderstandRunner: () => new UnderstandRunner({ liveAuthorized: false }) });
  else if (command === 'discover') print({ version: 1, discovery: 'metadata-only; no client execution', providers: discover() });
  else if (command === 'clients') {
    // Capability check of each installed client (checks.mjs): runs the client offline in the
    // browser sandbox against a loopback stand-in model. No model call, no credential read.
    const options = [driver, ...flags].filter(Boolean);
    if (options.some(flag => flag !== '--refresh')) throw Object.assign(new Error('Unknown clients option'), { code: 'INVALID_INPUT' });
    if (options.includes('--refresh')) clearClientChecks();
    const report = await checkClients({ officialHome: process.env.HOME });
    print({ ...report, providers: report.providers.map(entry => ({ ...entry, summary: describeCheck(entry) })) });
  }
  else if (command === 'check') {
    for (const source of sourceFiles(root)) if (!run(process.execPath, ['--check', source])) break;
    if (!process.exitCode && process.platform === 'darwin' && run('/Users/wout/.local/bin/mount-dev-storage', [])) {
      nativeRun(['-Wall', '-Wextra', '-Werror', '-fsyntax-only', '-fobjc-arc', path.join(root, 'native/keychain.m')]);
      if (!process.exitCode) nativeRun(['-Wall', '-Wextra', '-Werror', '-fsyntax-only', path.join(root, 'native/sandbox-launcher.c'), path.join(root, 'native/sandbox-probe.c')]);
    }
    if (!process.exitCode && process.platform === 'linux') {
      const flags = libsecretFlags();
      if (!flags) linuxBlocked('libsecret-1 development files are missing (apt install libsecret-1-dev)');
      for (const define of [[], ['-DAXIOSOZO_KEYCHAIN_NEGATIVE_TEST=1']]) {
        if (!process.exitCode) linuxRun(['-Wall', '-Wextra', '-Werror', '-fsyntax-only', ...define, path.join(root, 'native/secret-service.c'), ...flags.filter(flag => flag.startsWith('-I'))]);
      }
    }
    if (!process.exitCode) print({ status: 'PASS', check: process.platform === 'linux'
      ? 'Node syntax, TypeScript strip parsing, native Secret Service helper syntax (Linux has no provider sandbox broker: fail closed)'
      : 'Node syntax, TypeScript strip parsing, native Keychain and broker syntax' });
  } else if (command === 'test') {
    const tests = readdirSync(path.join(root, 'tests')).filter(file => !file.startsWith('._') && file.endsWith('.test.mjs')).map(file => path.join(root, 'tests', file));
    run(process.execPath, ['--test', ...tests]);
  } else if (command === 'sandbox-test') {
    // Linux has no provider sandbox broker yet: its test proves every launch path fails closed.
    run(process.execPath, ['--test', path.join(root, process.platform === 'linux' ? 'tests/sandbox-linux.os.mjs' : 'tests/sandbox.os.mjs')]);
  } else if (command === 'keychain-negative-test') {
    run(process.execPath, ['--test', path.join(root, process.platform === 'linux' ? 'tests/secret-service.os.mjs' : 'tests/keychain.os.mjs')]);
  } else if (command === 'keychain-positive-setup') {
    // Linux: the isolated positive fixture is part of tests/secret-service.os.mjs (private bus + keyring).
    if (process.platform === 'linux') linuxBlocked('Linux has no separate positive Keychain fixture build; keychain-negative-test covers a private Secret Service');
    if (process.platform !== 'darwin') throw Object.assign(new Error('Isolated Keychain fixture requires macOS'), { code: 'BLOCKED_ENV' });
    if (run('/Users/wout/.local/bin/mount-dev-storage', [])) {
      const source = path.join(root, 'native/keychain-positive.m'); const binary = path.join(providerBuildRoot(), 'keychain-positive');
      mkdirSync(path.dirname(binary), { recursive: true, mode: 0o700 });
      if (nativeRun(['-Wall', '-Wextra', '-Werror', '-fobjc-arc', '-O2', source, '-framework', 'Security', '-framework', 'CoreFoundation', '-framework', 'Foundation', '-framework', 'LocalAuthentication', '-o', binary])) {
        const hash = file => createHash('sha256').update(readFileSync(file)).digest('hex');
        writeFileSync(path.join(providerBuildRoot(), 'keychain-positive-build.json'), JSON.stringify({ version: 1, binary_sha256: hash(binary), source_sha256: hash(source), fixture_only: true }, null, 2) + '\n', { mode: 0o600 });
        print({ status: 'PASS', fixture: binary, credential_operations: 'not executed' });
      }
    }
  } else if (command === 'keychain-positive-test') {
    if (process.platform === 'linux') linuxBlocked('macOS Keychain positive fixture; on Linux see keychain-negative-test (private Secret Service round trip)');
    run(process.execPath, ['--test', path.join(root, 'tests/keychain-positive.os.mjs')]);
  } else if (command === 'setup' && process.platform === 'linux') {
    // Secret Service helper (and its fixture-only negative build). No sandbox broker
    // is built: Linux provider launches stay BLOCKED_ENV (sandbox.mjs, live.mjs, checks.mjs).
    const flags = libsecretFlags();
    if (!flags) linuxBlocked('libsecret-1 development files are missing (apt install libsecret-1-dev)');
    const helper = helperPath(); mkdirSync(path.dirname(helper), { recursive: true, mode: 0o700 });
    const source = path.join(root, 'native/secret-service.c');
    const hash = file => createHash('sha256').update(readFileSync(file)).digest('hex');
    const artifacts = {};
    if (linuxRun(['-Wall', '-Wextra', '-Werror', '-O2', source, ...flags, '-o', helper])) artifacts.keychain = { binary_sha256: hash(helper), source_sha256: hash(source) };
    const negative = path.join(providerBuildRoot(), 'keychain-negative');
    if (!process.exitCode && linuxRun(['-Wall', '-Wextra', '-Werror', '-O2', '-DAXIOSOZO_KEYCHAIN_NEGATIVE_TEST=1', source, ...flags, '-o', negative])) {
      artifacts['keychain-negative'] = { binary_sha256: hash(negative), source_sha256: hash(source), define: 'AXIOSOZO_KEYCHAIN_NEGATIVE_TEST=1' };
    }
    if (!process.exitCode) {
      writeFileSync(path.join(providerBuildRoot(), 'native-build.json'), JSON.stringify({ version: 1, policy: LINUX_POLICY, artifacts }, null, 2) + '\n', { mode: 0o600 });
      print({ status: 'PASS', helper, key_store: 'Linux Secret Service (libsecret)', sandbox_artifacts: [],
        provider_sandbox: 'UNSUPPORTED_ON_LINUX: provider clients are refused (fail closed)', keychain_credential_operations: 'not executed' });
    }
  } else if (command === 'setup') {
    if (process.platform !== 'darwin') throw Object.assign(new Error('Keychain helper requires macOS'), { code: 'BLOCKED_ENV' });
    if (!run('/Users/wout/.local/bin/mount-dev-storage', [])) process.exitCode = 78;
    else {
      const helper = helperPath(); mkdirSync(path.dirname(helper), { recursive: true, mode: 0o700 });
      nativeRun(['-Wall', '-Wextra', '-Werror', '-fobjc-arc', '-O2', path.join(root, 'native/keychain.m'), '-framework', 'Security', '-framework', 'CoreFoundation', '-framework', 'Foundation', '-framework', 'LocalAuthentication', '-o', helper]);
      const artifacts = {}; const hash = file => createHash('sha256').update(readFileSync(file)).digest('hex');
      if (!process.exitCode) {
        const source = path.join(root, 'native/keychain.m');
        artifacts.keychain = { binary_sha256: hash(helper), source_sha256: hash(source) };
        const negative = path.join(providerBuildRoot(), 'keychain-negative');
        if (nativeRun(['-Wall', '-Wextra', '-Werror', '-fobjc-arc', '-O2', '-DAXIOSOZO_KEYCHAIN_NEGATIVE_TEST=1', source, '-framework', 'Security', '-framework', 'CoreFoundation', '-framework', 'Foundation', '-framework', 'LocalAuthentication', '-o', negative])) {
          artifacts['keychain-negative'] = { binary_sha256: hash(negative), source_sha256: hash(source), define: 'AXIOSOZO_KEYCHAIN_NEGATIVE_TEST=1' };
        }
      }
      for (const name of ['sandbox-launcher', 'sandbox-probe']) {
        if (process.exitCode) break;
        const source = path.join(root, 'native', `${name}.c`); const binary = path.join(providerBuildRoot(), name);
        if (nativeRun(['-Wall', '-Wextra', '-Werror', '-O2', source, '-o', binary])) artifacts[name] = { binary_sha256: hash(binary), source_sha256: hash(source) };
      }
      if (!process.exitCode) {
        const source = path.join(root, 'native/sandbox-launcher.c'); const binary = path.join(providerBuildRoot(), 'live-launcher');
        if (nativeRun(['-Wall', '-Wextra', '-Werror', '-O2', '-DAXIOSOZO_MAX_LIFETIME_MS=900000', source, '-o', binary])) {
          artifacts['live-launcher'] = { binary_sha256: hash(binary), source_sha256: hash(source), policy: LIVE_POLICY };
        }
      }
      if (!process.exitCode) {
        writeFileSync(path.join(providerBuildRoot(), 'native-build.json'), JSON.stringify({ version: 1, policy: SANDBOX_POLICY, artifacts }, null, 2) + '\n', { mode: 0o600 });
        print({ status: 'PASS', helper, sandbox_artifacts: Object.keys(artifacts), keychain_credential_operations: 'not executed' });
      }
    }
  } else if (command === 'live') {
    if (!flags.includes('--authorized')) livePreflight(driver);
    const instanceFlag = flags.find(flag => flag.startsWith('--instance-id='));
    if (flags.some(flag => flag !== '--authorized' && flag !== instanceFlag)) throw Object.assign(new Error('Unknown live diagnostic option'), { code: 'INVALID_INPUT' });
    const binding = { instance_id: instanceFlag?.slice('--instance-id='.length) ?? '00000000-0000-4000-8000-000000000001',
      session_id: randomUUID(), account_identity: `official-client-${randomUUID()}` };
    let adapter, timer;
    try {
      adapter = await createLiveAdapter(driver, binding);
      let answer = '', terminal;
      const completed = new Promise((resolve, reject) => {
        timer = setTimeout(() => reject(Object.assign(new Error('Fixed diagnostic timed out'), { code: 'TIMEOUT' })), 120000);
        adapter.on('event', event => {
          if (event.type === 'text_delta') answer = (answer + event.text).slice(0, 256);
          if (event.type === 'turn_finished') { terminal = event; resolve(); }
        });
      });
      await adapter.start({ version: 1, ...binding, request_id: randomUUID(), turn_id: randomUUID(), text: 'Reply exactly AXIOSOZO_OK' });
      await completed;
      const passed = terminal.status === 'completed' && answer.trim() === 'AXIOSOZO_OK';
      print({ version: 1, driver, status: passed ? 'PASS' : 'FAIL', diagnostic: 'fixed AXIOSOZO_OK prompt',
        completed: terminal.status === 'completed', exact_reply: answer.trim() === 'AXIOSOZO_OK', live_verified: passed });
      if (!passed) process.exitCode = 1;
    } finally { clearTimeout(timer); if (adapter) await adapter.close(); }
  } else if (command === 'jev-test') {
    // Root command must carry explicit live authorization. Normal startup does
    // not even read Keychain, and no API-key environment fallback exists.
    if (![driver, ...flags].includes('--authorized')) throw Object.assign(new Error('Explicit Jev diagnostic authorization required; no Keychain/network access occurred'), { code: 'BLOCKED_AUTH' });
    const helper = helperPath();
    if (!existsSync(helper)) throw Object.assign(new Error('Run provider-host setup to build the Keychain helper'), { code: 'BLOCKED_ENV' });
    const result = await new DecisionProvider({ liveAuthorized: true, keyStore: platformKeychain(helper) }).decide({ version: 1, request_id: 'explicit-jev-diagnostic', context_version: 'synthetic-1', deadline_ms: Date.now() + 5000, state: DIAGNOSTIC_STATE });
    print(result); if (result.reason !== 'validated') process.exitCode = 78;
  } else {
    print({ status: 'UNSUPPORTED', command, usage: 'discover | clients [--refresh] | serve | check | test | setup | sandbox-test | keychain-negative-test | keychain-positive-setup | keychain-positive-test | live codex|claude-code|antigravity | jev-test --authorized', drivers: DRIVERS }); process.exitCode = 64;
  }
} catch (error) {
  const blocked = error.code?.startsWith('BLOCKED_') || ['CODEX_LOGIN_REQUIRED', 'ANTIGRAVITY_PROTOCOL_UNSUPPORTED', 'UNSUPPORTED', 'CLIENT_INCOMPATIBLE', 'CLIENT_CHECK_FAILED'].includes(error.code);
  print({ status: blocked ? error.code : 'FAIL', reason: error.code ?? 'COMMAND_ERROR', message: blocked ? error.message : 'Provider command failed; no credentials logged', diagnostic: error.diagnostic, version_status: error.version_status, client_version: error.client_version, fixture_version: error.fixture_version, protocol_status: error.protocol_status });
  process.exitCode = blocked ? 78 : 1;
}
