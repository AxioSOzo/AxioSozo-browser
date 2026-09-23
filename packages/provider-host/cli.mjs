#!/usr/bin/env node
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { readdirSync, mkdirSync, existsSync, readFileSync, writeFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import path from 'node:path';
import { discover, DRIVERS } from './src/discovery.mjs';
import { livePreflight } from './src/adapters.mjs';
import { DecisionProvider, DIAGNOSTIC_STATE } from './src/decision.mjs';
import { MacKeychain } from './src/keychain.mjs';
import { providerBuildRoot } from './src/storage.mjs';
import { SANDBOX_POLICY } from './src/sandbox.mjs';

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
try {
  if (command === 'discover') print({ version: 1, discovery: 'metadata-only; no client execution', providers: discover() });
  else if (command === 'check') {
    for (const source of sourceFiles(root)) if (!run(process.execPath, ['--check', source])) break;
    if (!process.exitCode && process.platform === 'darwin' && run('/Users/wout/.local/bin/mount-dev-storage', [])) {
      nativeRun(['-Wall', '-Wextra', '-Werror', '-fsyntax-only', '-fobjc-arc', path.join(root, 'native/keychain.m')]);
      if (!process.exitCode) nativeRun(['-Wall', '-Wextra', '-Werror', '-fsyntax-only', path.join(root, 'native/sandbox-launcher.c'), path.join(root, 'native/sandbox-probe.c')]);
    }
    if (!process.exitCode) print({ status: 'PASS', check: 'Node syntax, TypeScript strip parsing, native Keychain and broker syntax' });
  } else if (command === 'test') {
    const tests = readdirSync(path.join(root, 'tests')).filter(file => !file.startsWith('._') && file.endsWith('.test.mjs')).map(file => path.join(root, 'tests', file));
    run(process.execPath, ['--test', ...tests]);
  } else if (command === 'sandbox-test') {
    run(process.execPath, ['--test', path.join(root, 'tests/sandbox.os.mjs')]);
  } else if (command === 'keychain-negative-test') {
    run(process.execPath, ['--test', path.join(root, 'tests/keychain.os.mjs')]);
  } else if (command === 'keychain-positive-setup') {
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
    run(process.execPath, ['--test', path.join(root, 'tests/keychain-positive.os.mjs')]);
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
        writeFileSync(path.join(providerBuildRoot(), 'native-build.json'), JSON.stringify({ version: 1, policy: SANDBOX_POLICY, artifacts }, null, 2) + '\n', { mode: 0o600 });
        print({ status: 'PASS', helper, sandbox_artifacts: Object.keys(artifacts), keychain_credential_operations: 'not executed' });
      }
    }
  } else if (command === 'live') {
    livePreflight(driver, { authorized: flags.includes('--authorized'), authenticated: false });
  } else if (command === 'jev-test') {
    // Root command must carry explicit live authorization. Normal startup does
    // not even read Keychain, and no API-key environment fallback exists.
    if (![driver, ...flags].includes('--authorized')) throw Object.assign(new Error('Explicit Jev diagnostic authorization required; no Keychain/network access occurred'), { code: 'BLOCKED_AUTH' });
    const helper = helperPath();
    if (!existsSync(helper)) throw Object.assign(new Error('Run provider-host setup to build the Keychain helper'), { code: 'BLOCKED_ENV' });
    const result = await new DecisionProvider({ keyStore: new MacKeychain(helper) }).decide({ version: 1, request_id: 'explicit-jev-diagnostic', context_version: 'synthetic-1', deadline_ms: Date.now() + 5000, state: DIAGNOSTIC_STATE });
    print(result); if (result.reason !== 'validated') process.exitCode = 78;
  } else {
    print({ status: 'UNSUPPORTED', command, usage: 'discover | check | test | setup | sandbox-test | keychain-negative-test | keychain-positive-setup | keychain-positive-test | live codex|claude-code|antigravity | jev-test --authorized', drivers: DRIVERS }); process.exitCode = 64;
  }
} catch (error) { print({ status: error.code?.startsWith('BLOCKED_') ? error.code : 'FAIL', reason: error.code ?? 'COMMAND_ERROR', message: error.code?.startsWith('BLOCKED_') ? error.message : 'Provider command failed; no credentials logged', version_status: error.version_status, client_version: error.client_version, fixture_version: error.fixture_version, protocol_status: error.protocol_status }); process.exitCode = error.code?.startsWith('BLOCKED_') ? 78 : 1; }
