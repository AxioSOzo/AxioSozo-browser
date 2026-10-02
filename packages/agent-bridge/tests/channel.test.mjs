// Unit tests for the channel client and the line framing.

import assert from 'node:assert/strict';
import net from 'node:net';
import { describe, test } from 'node:test';
import { CLIENT_LINE_MAX, ChannelClient, ChannelError, MAX_OUTSTANDING, resolveSocketPath } from '../src/channel.mjs';
import { LineSplitter } from '../src/jsonl.mjs';
import { FakeBrowser, NO_REPLY, defaultHandlers, makeTempDir } from './fake-browser.mjs';

async function withBrowser(options, fn) {
  const tmp = await makeTempDir();
  const browser = await new FakeBrowser(tmp.socketPath, options).start();
  const client = new ChannelClient({ socketPath: tmp.socketPath, agent: 'codex', cwd: tmp.dir });
  try {
    await fn({ tmp, browser, client });
  } finally {
    client.close();
    await browser.stop();
    await tmp.cleanup();
  }
}

async function rejectsWith(promise, code) {
  await assert.rejects(promise, (error) => error instanceof ChannelError && error.code === code);
}

describe('socket path', () => {
  test('uses $AXIOSOZO_AGENT_SOCKET, else ~/.axiosozo/run/agent.sock', () => {
    assert.equal(resolveSocketPath({ AXIOSOZO_AGENT_SOCKET: '/x/y.sock' }, '/Users/u'), '/x/y.sock');
    assert.equal(resolveSocketPath({}, '/Users/u'), '/Users/u/.axiosozo/run/agent.sock');
  });

  test('relative or over-long paths are refused before connecting', async () => {
    await rejectsWith(new ChannelClient({ socketPath: 'rel.sock' }).request('tabs.list'), 'UNAVAILABLE');
    await rejectsWith(new ChannelClient({ socketPath: '/' + 'a'.repeat(100) }).request('tabs.list'), 'UNAVAILABLE');
  });
});

describe('requests', () => {
  test('a request without a reply times out with TIMEOUT', async () => {
    const handlers = { ...defaultHandlers(), 'tabs.list': () => NO_REPLY };
    await withBrowser({ handlers }, async ({ client }) => {
      await rejectsWith(client.request('tabs.list', {}, { timeoutMs: 150 }), 'TIMEOUT');
      // The connection stays usable.
      assert.equal((await client.request('tabs.active')).tab_id, 't_1');
    });
  });

  test(`more than ${MAX_OUTSTANDING} outstanding requests fail with BUSY`, async () => {
    const handlers = { ...defaultHandlers(), 'tabs.list': () => NO_REPLY };
    await withBrowser({ handlers }, async ({ client, browser }) => {
      await client.request('tabs.active');
      const hanging = Array.from({ length: MAX_OUTSTANDING }, () => client.request('tabs.list', {}, { timeoutMs: 500 }));
      await browser.until(() => browser.requests.length === MAX_OUTSTANDING + 1);
      await rejectsWith(client.request('tabs.list'), 'BUSY');
      await Promise.allSettled(hanging);
    });
  });

  test(`a request line over ${CLIENT_LINE_MAX} bytes is TOO_LARGE and never sent`, async () => {
    await withBrowser({}, async ({ client, browser }) => {
      await rejectsWith(client.request('page.type', { text: 'x'.repeat(CLIENT_LINE_MAX) }), 'TOO_LARGE');
      assert.equal(browser.requests.length, 0);
      assert.deepEqual(browser.events, []);
      assert.equal((await client.request('tabs.active')).tab_id, 't_1');
    });
  });

  test('unknown methods map to UNKNOWN_METHOD', async () => {
    await withBrowser({}, async ({ client }) => {
      await rejectsWith(client.request('tabs.nope'), 'UNKNOWN_METHOD');
    });
  });

  test('approval not_required is ready immediately', async () => {
    await withBrowser({ approval: 'not_required' }, async ({ client, browser }) => {
      assert.equal((await client.request('tabs.active')).tab_id, 't_1');
      assert.equal(client.welcome.approval, 'not_required');
      assert.equal(client.welcome.project_id, 'p_demo');
      assert.equal(browser.hellos[0].client.agent, 'codex');
    });
  });

  test('a peer that never sends welcome fails with TIMEOUT', async () => {
    const tmp = await makeTempDir();
    const server = net.createServer(() => {});
    await new Promise((r) => server.listen(tmp.socketPath, r));
    try {
      const client = new ChannelClient({ socketPath: tmp.socketPath, welcomeTimeoutMs: 150 });
      await rejectsWith(client.request('tabs.list'), 'TIMEOUT');
    } finally {
      server.close();
      await tmp.cleanup();
    }
  });

  test('invalid JSON from the browser closes the connection', async () => {
    const tmp = await makeTempDir();
    const server = net.createServer((socket) => {
      socket.on('error', () => {});
      socket.write('{"v":1,"type":"welcome","session":"s_1","project_id":null,"approval":"not_required"}\n');
      socket.on('data', () => socket.write('not json\n'));
    });
    await new Promise((r) => server.listen(tmp.socketPath, r));
    try {
      const client = new ChannelClient({ socketPath: tmp.socketPath });
      await rejectsWith(client.request('tabs.list'), 'UNAVAILABLE');
    } finally {
      server.close();
      await tmp.cleanup();
    }
  });
});

describe('LineSplitter', () => {
  test('splits across chunks, skips blank lines, enforces the limit', () => {
    const lines = [];
    const overflows = [];
    const splitter = new LineSplitter({
      maxLineBytes: 8, resync: true,
      onLine: (l) => lines.push(l), onOverflow: (e) => overflows.push(e.limit), onInvalid: () => lines.push('INVALID'),
    });
    splitter.push(Buffer.from('ab'));
    splitter.push(Buffer.from('c\n\n  \n123456789'));
    splitter.push(Buffer.from('0123\nok\n'));
    splitter.push(Buffer.from([0xff, 0x0a]));
    splitter.push(Buffer.from('é\n'));
    assert.deepEqual(lines, ['abc', 'ok', 'INVALID', 'é']);
    assert.deepEqual(overflows, [8]);
  });

  test('without resync the splitter stops after an overflow', () => {
    const lines = [];
    const splitter = new LineSplitter({ maxLineBytes: 4, onLine: (l) => lines.push(l), onOverflow: () => {}, onInvalid: () => {} });
    splitter.push(Buffer.from('123456\nok\n'));
    assert.deepEqual(lines, []);
  });
});
