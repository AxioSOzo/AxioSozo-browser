// TEST FIXTURE ONLY (Linux): run under `dbus-run-session` with a private HOME and
// XDG directories. Starts gnome-keyring's Secret Service on that private bus with
// a synthetic password, exercises the helper with a synthetic key, prints one JSON
// record and stops the daemon. The user's own bus and keyrings are never reached.
import { spawn, spawnSync } from 'node:child_process';
import { setTimeout as delay } from 'node:timers/promises';

const [helper, negative] = process.argv.slice(2);
const env = { PATH: '/usr/bin:/bin', LANG: 'C', HOME: process.env.HOME, XDG_RUNTIME_DIR: process.env.XDG_RUNTIME_DIR,
  XDG_DATA_HOME: process.env.XDG_DATA_HOME, XDG_CONFIG_HOME: process.env.XDG_CONFIG_HOME,
  DBUS_SESSION_BUS_ADDRESS: process.env.DBUS_SESSION_BUS_ADDRESS };
// Refuse to start unless every keyring location is the private fixture directory.
for (const name of ['HOME', 'XDG_RUNTIME_DIR', 'XDG_DATA_HOME', 'XDG_CONFIG_HOME']) {
  if (!env[name] || !env[name].includes('/axiosozo-secret-')) throw new Error(`${name} must be the private fixture directory`);
}
if (!env.DBUS_SESSION_BUS_ADDRESS) throw new Error('dbus-run-session must provide a private bus');
const daemon = spawn('gnome-keyring-daemon', ['--foreground', '--unlock', '--components=secrets'], { env, stdio: ['pipe', 'ignore', 'pipe'] });
let daemonError = '';
daemon.stderr.on('data', chunk => { daemonError = (daemonError + chunk).slice(-2000); });
daemon.stdin.end('synthetic-fixture-password');
const call = (binary, args, input = '') => {
  const result = spawnSync(binary, args, { input, env: { PATH: '/usr/bin:/bin', LANG: 'C', DBUS_SESSION_BUS_ADDRESS: env.DBUS_SESSION_BUS_ADDRESS },
    encoding: 'utf8', timeout: 10000 });
  return { status: result.status, stdout: result.stdout, stderr: result.stderr.trim().slice(0, 300) };
};
const record = { steps: {} };
try {
  // The service registers on the private bus shortly after start.
  for (let attempt = 0; attempt < 100; attempt++) {
    const probe = call(helper, ['exists']);
    if (probe.status !== 1) break;
    await delay(100);
  }
  const key = 'synthetic-fixture-key-jev-0001';
  record.steps.exists_before = call(helper, ['exists']).status;
  record.steps.read_before = call(helper, ['read']).status;
  record.steps.store = call(helper, ['store'], key).status;
  record.steps.exists_after = call(helper, ['exists']).status;
  const read = call(helper, ['read']);
  record.steps.read_after = read.status;
  record.read_matches = read.stdout === key;
  record.steps.openai_exists = call(helper, ['exists', 'openai']).status;
  record.steps.openai_store = call(helper, ['store', 'openai'], 'synthetic-fixture-key-openai').status;
  record.steps.openai_read_matches = call(helper, ['read', 'openai']).stdout === 'synthetic-fixture-key-openai';
  const fixture = call(negative, ['read']);
  record.steps.negative_read = fixture.status;
  record.negative_stderr = fixture.stderr;
  record.steps.remove = call(helper, ['remove']).status;
  record.steps.read_removed = call(helper, ['read']).status;
  record.steps.remove_again = call(helper, ['remove']).status;
  record.steps.openai_remove = call(helper, ['remove', 'openai']).status;
} finally {
  daemon.kill('SIGTERM');
  record.daemon_stderr = daemonError.trim().split('\n').slice(-3).join(' | ');
  process.stdout.write(JSON.stringify(record) + '\n');
}
