// End-to-end tests for tools/axiosozo-notify against the fake browser.

import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { existsSync, statSync } from 'node:fs';
import { mkdir } from 'node:fs/promises';
import net from 'node:net';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { after, before, describe, test } from 'node:test';
import { FakeBrowser, makeTempDir } from './fake-browser.mjs';

const NOTIFY = fileURLToPath(new URL('../../../tools/axiosozo-notify', import.meta.url));
// The shebang shell (bash in POSIX mode on macOS) plus dash, a strict POSIX shell.
const SHELLS = [null, ...(existsSync('/bin/dash') ? ['/bin/dash'] : [])];

/**
 * Run the script. `stdin`: string to write then close, or 'open' to leave the
 * pipe open (never closed until the process exits).
 */
function runNotify(args, { socketPath, stdin, cwd, env = {}, shell = null } = {}) {
  return new Promise((resolve) => {
    const started = Date.now();
    const fullEnv = { PATH: '/usr/bin:/bin:/usr/sbin:/sbin', HOME: process.env.HOME, ...env };
    if (socketPath !== undefined) fullEnv.AXIOSOZO_AGENT_SOCKET = socketPath;
    if (cwd) fullEnv.PWD = cwd;
    const child = shell
      ? spawn(shell, [NOTIFY, ...args], { cwd, env: fullEnv })
      : spawn(NOTIFY, args, { cwd, env: fullEnv });
    let output = '';
    child.stdout.on('data', (d) => { output += d; });
    child.stderr.on('data', (d) => { output += d; });
    child.stdin.on('error', () => {});
    if (stdin === 'open') { /* leave the pipe open */ } else if (typeof stdin === 'string') child.stdin.end(stdin);
    else child.stdin.end();
    child.on('close', (code, signal) => {
      if (stdin === 'open') child.stdin.destroy();
      resolve({ code, signal, output, ms: Date.now() - started });
    });
  });
}

function assertQuietSuccess(run, maxMs = 2000) {
  assert.equal(run.code, 0);
  assert.equal(run.signal, null);
  assert.equal(run.output, '');
  assert.ok(run.ms <= maxMs, `took ${run.ms} ms`);
}

// With a browser that answers, a report completes well under the watchdog.
const ANSWERED_MS = 700;

test('the script is an executable POSIX sh script without eval or bash-isms', async () => {
  const { readFile } = await import('node:fs/promises');
  // The checkout lives on exFAT (no POSIX modes, core.fileMode=false), so only
  // the owner execute bit is observable here; git records the file as 100755.
  assert.ok(statSync(NOTIFY).mode & 0o100, 'owner execute bit');
  const source = await readFile(NOTIFY, 'utf8');
  assert.match(source, /^#!\/bin\/sh\n/);
  const code = source.split('\n').filter((l) => !/^\s*#/.test(l)).join('\n');
  assert.doesNotMatch(code, /\beval\b|\[\[ |\bfunction\b|\blocal\b|\bpython|\bnode\b|\s\$'|<<<|\bsource\b /);
});

for (const shell of SHELLS) {
  describe(`axiosozo-notify (${shell ?? 'shebang /bin/sh'})`, () => {
    let tmp;
    let browser;
    let weirdDir;
    before(async () => {
      tmp = await makeTempDir();
      browser = await new FakeBrowser(tmp.socketPath).start();
      weirdDir = path.join(tmp.dir, 'pro"ject \\ ünï ✓\n\tdir');
      await mkdir(weirdDir);
    });
    after(async () => {
      await browser.stop();
      await tmp.cleanup();
    });

    test('claude-code: stdin JSON with quotes, newlines and unicode; cwd escaped', async () => {
      const payload = {
        session_id: 'abc-123',
        hook_event_name: 'Notification',
        cwd: weirdDir,
        message: 'Claude needs "permission" — ünïcode ✓\nsecond line\\ end',
        nested: { list: [1, 2.5, true, null], empty: {} },
      };
      const run = await runNotify(['claude-code', 'Notification'], {
        socketPath: tmp.socketPath, cwd: weirdDir, shell, stdin: JSON.stringify(payload, null, 2) + '\n',
      });
      assertQuietSuccess(run, ANSWERED_MS);
      const hook = browser.hooks.at(-1);
      assert.deepEqual(hook, { v: 1, type: 'hook', source: 'claude-code', event: 'Notification', cwd: weirdDir, payload });
      const hello = browser.hellos.at(-1);
      assert.deepEqual(hello.client, { name: 'axiosozo-notify', agent: 'claude-code', version: '1' });
      assert.equal(hello.cwd, weirdDir);
      assert.ok(Number.isInteger(hello.pid) && hello.pid > 0);
      assert.deepEqual(browser.events, []);
    });

    test('codex: notify JSON as the last argument', async () => {
      const payload = {
        type: 'agent-turn-complete',
        'thread-id': 't-1',
        'turn-id': '1',
        cwd: '/Volumes/Work/demo',
        'input-messages': ['fix the "bug"'],
        'last-assistant-message': 'Done.\nAll tests pass ✓',
      };
      const run = await runNotify(['codex', JSON.stringify(payload)], { socketPath: tmp.socketPath, cwd: tmp.dir, shell });
      assertQuietSuccess(run, ANSWERED_MS);
      assert.deepEqual(browser.hooks.at(-1), { v: 1, type: 'hook', source: 'codex', event: 'notify', cwd: tmp.dir, payload });
      assert.equal(browser.hellos.at(-1).client.agent, 'codex');
    });

    test('manual: status <state> [title], agent from $AXIOSOZO_AGENT', async () => {
      const title = 'Build "green" ✓\tdone\\ok';
      let run = await runNotify(['status', 'needs_input', title], { socketPath: tmp.socketPath, cwd: weirdDir, shell });
      assertQuietSuccess(run, ANSWERED_MS);
      assert.deepEqual(browser.hooks.at(-1),
        { v: 1, type: 'hook', source: 'manual', event: 'needs_input', cwd: weirdDir, payload: { title } });
      assert.equal(browser.hellos.at(-1).client.agent, 'other');
      run = await runNotify(['status', 'done'], { socketPath: tmp.socketPath, cwd: tmp.dir, shell, env: { AXIOSOZO_AGENT: 'codex' } });
      assertQuietSuccess(run);
      assert.deepEqual(browser.hooks.at(-1).payload, {});
      assert.equal(browser.hooks.at(-1).event, 'done');
      assert.equal(browser.hellos.at(-1).client.agent, 'codex');
    });

    test('invalid usage exits 0 without connecting', async () => {
      const count = browser.hellos.length;
      for (const args of [[], ['status', 'exploded'], ['claude-code'], ['claude-code', 'Stop;rm'], ['codex'], ['nope']]) {
        assertQuietSuccess(await runNotify(args, { socketPath: tmp.socketPath, cwd: tmp.dir, shell }));
      }
      assert.equal(browser.hellos.length, count);
    });

    test('payload over 64 KiB, or not a JSON object, is sent as {}', async () => {
      const huge = JSON.stringify({ message: 'x'.repeat(70 * 1024) });
      let run = await runNotify(['claude-code', 'Stop'], { socketPath: tmp.socketPath, cwd: tmp.dir, shell, stdin: huge });
      assertQuietSuccess(run);
      assert.deepEqual(browser.hooks.at(-1).payload, {});
      run = await runNotify(['codex', huge], { socketPath: tmp.socketPath, cwd: tmp.dir, shell });
      assertQuietSuccess(run);
      assert.deepEqual(browser.hooks.at(-1).payload, {});
      run = await runNotify(['claude-code', 'Stop'], { socketPath: tmp.socketPath, cwd: tmp.dir, shell, stdin: 'garbage' });
      assertQuietSuccess(run);
      assert.deepEqual(browser.hooks.at(-1).payload, {});
      run = await runNotify(['claude-code', 'Stop'], { socketPath: tmp.socketPath, cwd: tmp.dir, shell, stdin: '' });
      assertQuietSuccess(run);
      assert.deepEqual(browser.hooks.at(-1).payload, {});
      // Exactly 64 KiB is still sent.
      const edge = JSON.stringify({ m: 'y'.repeat(65536 - 8) });
      assert.equal(Buffer.byteLength(edge), 65536);
      run = await runNotify(['claude-code', 'Stop'], { socketPath: tmp.socketPath, cwd: tmp.dir, shell, stdin: edge });
      assertQuietSuccess(run);
      assert.deepEqual(browser.hooks.at(-1).payload, JSON.parse(edge));
    });

    test('every notify connection stayed open until the ack', () => {
      assert.ok(browser.hooks.length >= 8);
      assert.deepEqual(browser.events, []);
    });

    test('missing socket: exit 0 fast and silently', async () => {
      const missing = path.join(tmp.dir, 'none.sock');
      const run = await runNotify(['claude-code', 'Stop'], { socketPath: missing, cwd: tmp.dir, shell, stdin: '{}' });
      assertQuietSuccess(run, 300);
      const relative = await runNotify(['status', 'done'], { socketPath: 'relative.sock', cwd: tmp.dir, shell });
      assertQuietSuccess(relative, 300);
      const noHome = await runNotify(['status', 'done'], { cwd: tmp.dir, shell, env: { HOME: tmp.dir } });
      assertQuietSuccess(noHome, 300);
    });

    test('a browser that never answers, or stdin never closed: exit 0 within 2 s', async () => {
      const silentPath = path.join(tmp.dir, 's.sock');
      const received = [];
      const silent = net.createServer((socket) => {
        socket.on('error', () => {});
        socket.on('data', (d) => received.push(String(d)));
      });
      await new Promise((r) => silent.listen(silentPath, r));
      try {
        const run = await runNotify(['status', 'started', 'x'], { socketPath: silentPath, cwd: tmp.dir, shell });
        assertQuietSuccess(run, 2000);
        // The script stayed connected waiting for the ack until the watchdog.
        assert.ok(run.ms >= 900, `gave up after only ${run.ms} ms`);
        assert.match(received.join(''), /"type":"hook"/);
        const open = await runNotify(['claude-code', 'Stop'], { socketPath: tmp.socketPath, cwd: tmp.dir, shell, stdin: 'open' });
        assertQuietSuccess(open, 2000);
        assert.ok(open.ms >= 1000, `stdin read ended after ${open.ms} ms`);
      } finally {
        silent.close();
      }
    });
  });
}
