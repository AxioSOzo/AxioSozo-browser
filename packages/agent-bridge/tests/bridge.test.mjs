// End-to-end tests: the real bridge binary over stdio against a fake browser.

import assert from 'node:assert/strict';
import { mkdir } from 'node:fs/promises';
import path from 'node:path';
import { after, before, describe, test } from 'node:test';
import { FakeBrowser, FIXTURE, NO_REPLY, PNG_1X1, channelError, defaultHandlers, makeTempDir } from './fake-browser.mjs';
import { McpTestClient, textOf } from './mcp-client.mjs';

const TOOL_NAMES = [
  'browser_list_tabs', 'browser_active_tab', 'browser_project_info', 'browser_console_errors',
  'browser_screenshot', 'browser_open_url', 'browser_navigate', 'browser_click', 'browser_type',
];

async function setup(options = {}, clientOptions = {}) {
  const tmp = await makeTempDir();
  const browser = await new FakeBrowser(tmp.socketPath, options).start();
  const client = new McpTestClient({ socketPath: tmp.socketPath, cwd: tmp.dir, ...clientOptions });
  await client.initialize();
  return {
    tmp, browser, client,
    async teardown() {
      await client.close();
      await browser.stop();
      await tmp.cleanup();
    },
  };
}

function assertStdoutIsMcpOnly(client) {
  for (const line of client.rawStdout.split('\n').filter(Boolean)) {
    const message = JSON.parse(line);
    assert.equal(message.jsonrpc, '2.0');
  }
}

describe('MCP lifecycle', () => {
  let tmp;
  let client;
  before(async () => {
    tmp = await makeTempDir();
    client = new McpTestClient({ socketPath: tmp.socketPath, cwd: tmp.dir });
  });
  after(async () => {
    await client.close();
    await tmp.cleanup();
  });

  test('requests before initialize are refused, ping is always answered', async () => {
    const early = await client.request('tools/list');
    assert.equal(early.error.code, -32600);
    const ping = await client.request('ping');
    assert.deepEqual(ping.result, {});
  });

  test('initialize negotiates 2025-06-18 and declares tools', async () => {
    const response = await client.initialize('2025-06-18');
    assert.equal(response.result.protocolVersion, '2025-06-18');
    assert.deepEqual(response.result.capabilities, { tools: { listChanged: false } });
    assert.equal(response.result.serverInfo.name, 'axiosozo-agent-bridge');
    assert.equal(typeof response.result.serverInfo.version, 'string');
    assert.match(response.result.instructions, /Allow for this session/);
  });

  test('an unsupported version is answered with 2025-06-18, a supported older one is echoed', async () => {
    const other = new McpTestClient({ socketPath: tmp.socketPath, cwd: tmp.dir });
    try {
      assert.equal((await other.initialize('1999-01-01')).result.protocolVersion, '2025-06-18');
      assert.equal((await other.initialize('2025-03-26')).result.protocolVersion, '2025-03-26');
    } finally {
      await other.close();
    }
  });

  test('JSON-RPC errors: parse error, batch, unknown method, invalid id, unknown tool', async () => {
    client.writeRaw('{not json\n');
    client.writeRaw('[{"jsonrpc":"2.0","id":99,"method":"ping"}]\n');
    client.writeRaw('{"jsonrpc":"2.0","id":{"x":1},"method":"ping"}\n');
    await new Promise((r) => setTimeout(r, 200));
    const nullIdErrors = client.messages.filter((m) => m.id === null).map((m) => m.error.code);
    assert.deepEqual(nullIdErrors, [-32700, -32600, -32600]);
    assert.equal((await client.request('resources/list')).error.code, -32601);
    const unknownTool = await client.request('tools/call', { name: 'browser_nope', arguments: {} });
    assert.equal(unknownTool.error.code, -32602);
    // Unknown notifications are ignored without a reply.
    client.notify('notifications/whatever');
    assert.deepEqual((await client.request('ping', undefined, 'string-id')).result, {});
  });

  test('tools/list lists the nine tools with strict schemas, without connecting', async () => {
    const { result } = await client.request('tools/list');
    assert.deepEqual(result.tools.map((t) => t.name), TOOL_NAMES);
    for (const tool of result.tools) {
      assert.equal(tool.inputSchema.type, 'object');
      assert.equal(tool.inputSchema.additionalProperties, false);
      assert.ok(tool.description.length > 20);
      assert.equal(typeof tool.annotations.readOnlyHint, 'boolean');
    }
    for (const name of ['browser_navigate', 'browser_click', 'browser_type']) {
      const tool = result.tools.find((t) => t.name === name);
      assert.match(tool.description, /user confirms this action in the AxioSozo browser/);
      assert.equal(tool.annotations.readOnlyHint, false);
    }
    const screenshot = result.tools.find((t) => t.name === 'browser_screenshot');
    assert.deepEqual(screenshot.inputSchema.required, ['tab_id']);
    assert.equal(screenshot.inputSchema.properties.max_width.maximum, 1920);
    assertStdoutIsMcpOnly(client);
  });

  test('a tool call without a running browser is an isError result', async () => {
    const result = await client.call('browser_list_tabs');
    assert.equal(result.isError, true);
    assert.match(textOf(result), /^UNAVAILABLE: AxioSozo is not running/);
  });
});

describe('read tools', () => {
  let env;
  before(async () => { env = await setup(); });
  after(async () => { await env.teardown(); });

  test('browser_list_tabs connects lazily with a correct hello', async () => {
    assert.equal(env.browser.hellos.length, 0);
    const result = await env.client.call('browser_list_tabs');
    assert.equal(result.isError, undefined);
    assert.deepEqual(JSON.parse(textOf(result)), FIXTURE.tabs);
    const [hello] = env.browser.hellos;
    assert.equal(hello.v, 1);
    assert.equal(hello.type, 'hello');
    assert.deepEqual(hello.client, { name: 'agent-bridge', agent: 'claude-code', version: '0.1.0' });
    assert.equal(hello.cwd, env.tmp.dir);
    assert.ok(Number.isInteger(hello.pid) && hello.pid > 0);
  });

  test('browser_active_tab, browser_project_info, browser_open_url', async () => {
    assert.deepEqual(JSON.parse(textOf(await env.client.call('browser_active_tab'))), FIXTURE.tabs[0]);
    assert.deepEqual(JSON.parse(textOf(await env.client.call('browser_project_info'))), FIXTURE.project);
    const opened = await env.client.call('browser_open_url', { url: 'https://example.net/a?b=c' });
    assert.deepEqual(JSON.parse(textOf(opened)), { tab_id: 't_3' });
    const last = env.browser.requests.at(-1);
    assert.equal(last.method, 'tabs.open');
    assert.deepEqual(last.params, { url: 'https://example.net/a?b=c' });
  });

  test('browser_console_errors for gecko and chromium tabs', async () => {
    const ok = await env.client.call('browser_console_errors', { tab_id: 't_1' });
    assert.deepEqual(JSON.parse(textOf(ok)), FIXTURE.console);
    const chromium = await env.client.call('browser_console_errors', { tab_id: 't_2' });
    assert.equal(chromium.isError, true);
    assert.match(textOf(chromium), /^UNAVAILABLE: Chromium tabs/);
  });

  test('browser_screenshot returns MCP image content', async () => {
    const result = await env.client.call('browser_screenshot', { tab_id: 't_1', max_width: 640 });
    assert.deepEqual(result.content[0], { type: 'image', data: PNG_1X1, mimeType: 'image/png' });
    assert.match(result.content[1].text, /t_1: 1x1 PNG/);
    assert.deepEqual(env.browser.requests.at(-1).params, { tab_id: 't_1', max_width: 640 });
  });

  test('all calls share one approved connection with increasing ids', async () => {
    assert.equal(env.browser.hellos.length, 1);
    const ids = env.browser.requests.map((r) => r.id);
    assert.deepEqual(ids, ids.map((_, i) => i + 1));
    assert.ok(env.browser.requests.every((r) => r.v === 1));
    assertStdoutIsMcpOnly(env.client);
  });
});

describe('act tools and error mapping', () => {
  let env;
  const handlers = {
    ...defaultHandlers(),
    'page.click': (params) => {
      if (params.selector === '#deny') throw channelError('DENIED', 'The user denied the click');
      if (params.selector === '#other') throw channelError('NOT_IN_PROJECT', 'tab is not in this project');
      if (params.selector === '#revoked') throw channelError('NOT_APPROVED', 'access was revoked');
      if (params.selector === '#weird') throw channelError('BLOCKED_CATEGORY', 'bad\nmessage\u0000here');
      return defaultHandlers()['page.click'](params);
    },
  };
  before(async () => { env = await setup({ handlers }); });
  after(async () => { await env.teardown(); });

  test('act tools forward their params', async () => {
    const nav = await env.client.call('browser_navigate', { tab_id: 't_1', url: 'http://localhost:3000/x' });
    assert.equal(textOf(nav), 'Navigated t_1 to http://localhost:3000/x.');
    const typed = await env.client.call('browser_type', { tab_id: 't_1', selector: 'input[name="q"]', text: 'héllo "x"' });
    assert.match(textOf(typed), /Typed 9 characters/);
    assert.deepEqual(env.browser.requests.at(-1),
      { v: 1, id: env.browser.requests.at(-1).id, method: 'page.type', params: { tab_id: 't_1', selector: 'input[name="q"]', text: 'héllo "x"' } });
    const click = await env.client.call('browser_click', { tab_id: 't_1', selector: '#ok' });
    assert.equal(click.isError, undefined);
  });

  test('channel error codes become isError results with the code first', async () => {
    const cases = [
      ['#deny', /^DENIED: The user denied the click\. The user declined/],
      ['#other', /^NOT_IN_PROJECT: /],
      ['#revoked', /^NOT_APPROVED: access was revoked$/],
      ['#weird', /^BLOCKED_CATEGORY: bad message here\. /],
    ];
    for (const [selector, pattern] of cases) {
      const result = await env.client.call('browser_click', { tab_id: 't_1', selector });
      assert.equal(result.isError, true, selector);
      assert.match(textOf(result), pattern);
    }
    const unknown = await env.client.call('browser_click', { tab_id: 't_99', selector: 'a' });
    assert.match(textOf(unknown), /^UNKNOWN_TAB: no tab t_99\. Call browser_list_tabs/);
  });

  test('invalid arguments are rejected locally as INVALID_PARAMS', async () => {
    const before = env.browser.requests.length;
    const bad = [
      ['browser_console_errors', { tab_id: 'x' }],
      ['browser_console_errors', {}],
      ['browser_list_tabs', { extra: 1 }],
      ['browser_open_url', { url: 'javascript:alert(1)' }],
      ['browser_open_url', { url: 'file:///etc/passwd' }],
      ['browser_screenshot', { tab_id: 't_1', max_width: 5000 }],
      ['browser_click', { tab_id: 't_1', selector: 'a'.repeat(513) }],
      ['browser_type', { tab_id: 't_1', selector: 'input', text: 'x'.repeat(4097) }],
    ];
    for (const [name, args] of bad) {
      const result = await env.client.call(name, args);
      assert.equal(result.isError, true, name);
      assert.match(textOf(result), /^INVALID_PARAMS: /, name);
    }
    assert.equal(env.browser.requests.length, before);
  });

  test('concurrent calls are multiplexed and matched by id', async () => {
    env.browser.handlers['tabs.list'] = () => new Promise((r) => setTimeout(() => r(FIXTURE.tabs), 300));
    const slow = env.client.call('browser_list_tabs');
    const fast = env.client.call('browser_project_info');
    const fastResult = await fast;
    assert.deepEqual(JSON.parse(textOf(fastResult)), FIXTURE.project);
    assert.deepEqual(JSON.parse(textOf(await slow)), FIXTURE.tabs);
  });

  test('a cancelled call gets no response', async () => {
    env.browser.handlers['tabs.active'] = () => new Promise((r) => setTimeout(() => r(null), 200));
    const id = 'cancel-me';
    const pending = env.client.waitFor(id, 600).then(() => 'answered', () => 'silent');
    env.client.writeRaw(JSON.stringify({ jsonrpc: '2.0', id, method: 'tools/call', params: { name: 'browser_active_tab', arguments: {} } }) + '\n');
    env.client.notify('notifications/cancelled', { requestId: id, reason: 'test' });
    assert.equal(await pending, 'silent');
  });
});

describe('approval', () => {
  test('pending approval that is granted lets the first call through', async () => {
    const env = await setup({ approval: 'grant', approvalDelayMs: 300 });
    try {
      const result = await env.client.call('browser_list_tabs');
      assert.equal(result.isError, undefined);
      assert.equal(env.browser.hellos.length, 1);
    } finally {
      await env.teardown();
    }
  });

  test('approval still pending reports "waiting for approval", a later grant works on the same connection', async () => {
    const env = await setup({ approval: 'manual' }, { env: { AXIOSOZO_BRIDGE_APPROVAL_WAIT_MS: '300' } });
    try {
      const waiting = await env.client.call('browser_list_tabs');
      assert.equal(waiting.isError, true);
      assert.match(textOf(waiting), /^NOT_APPROVED: Waiting for approval in AxioSozo/);
      assert.equal(env.browser.requests.length, 0);
      env.browser.grant();
      const result = await env.client.call('browser_list_tabs');
      assert.equal(result.isError, undefined);
      assert.equal(env.browser.hellos.length, 1);
    } finally {
      await env.teardown();
    }
  });

  test('denied approval is NOT_APPROVED, with a cooldown before asking again', async () => {
    const env = await setup({ approval: 'deny' }, { env: { AXIOSOZO_BRIDGE_DENIED_COOLDOWN_MS: '400' } });
    try {
      const denied = await env.client.call('browser_active_tab');
      assert.equal(denied.isError, true);
      assert.match(textOf(denied), /^NOT_APPROVED: The user denied this agent access in AxioSozo/);
      const again = await env.client.call('browser_active_tab');
      assert.match(textOf(again), /^NOT_APPROVED: The user denied/);
      assert.equal(env.browser.hellos.length, 1);
      await new Promise((r) => setTimeout(r, 450));
      env.browser.approval = 'grant';
      const later = await env.client.call('browser_active_tab');
      assert.equal(later.isError, undefined);
      assert.equal(env.browser.hellos.length, 2);
      assert.equal(env.browser.requests.length, 1);
    } finally {
      await env.teardown();
    }
  });

  test('agent comes from --agent, else $AXIOSOZO_AGENT, else other', async () => {
    const tmp = await makeTempDir();
    const browser = await new FakeBrowser(tmp.socketPath).start();
    const clients = [
      new McpTestClient({ socketPath: tmp.socketPath, cwd: tmp.dir, args: ['--agent', 'codex'] }),
      new McpTestClient({ socketPath: tmp.socketPath, cwd: tmp.dir, args: [], env: { AXIOSOZO_AGENT: 'claude-code' } }),
      new McpTestClient({ socketPath: tmp.socketPath, cwd: tmp.dir, args: ['--agent=evil'] }),
    ];
    try {
      for (const client of clients) {
        await client.initialize();
        await client.call('browser_list_tabs');
      }
      assert.deepEqual(browser.hellos.map((h) => h.client.agent), ['codex', 'claude-code', 'other']);
    } finally {
      for (const client of clients) await client.close();
      await browser.stop();
      await tmp.cleanup();
    }
  });
});

describe('connection handling', () => {
  test('reconnects with a new hello after the browser closed the connection', async () => {
    const env = await setup();
    try {
      await env.client.call('browser_list_tabs');
      env.browser.closeAll();
      await new Promise((r) => setTimeout(r, 100));
      const result = await env.client.call('browser_list_tabs');
      assert.equal(result.isError, undefined);
      assert.equal(env.browser.hellos.length, 2);
    } finally {
      await env.teardown();
    }
  });

  test('a connection closed mid-request fails that call with UNAVAILABLE, the next call reconnects', async () => {
    const handlers = { ...defaultHandlers(), 'tabs.list': (_params, { socket }) => { socket.destroy(); return NO_REPLY; } };
    const env = await setup({ handlers });
    try {
      const result = await env.client.call('browser_list_tabs');
      assert.equal(result.isError, true);
      assert.match(textOf(result), /^UNAVAILABLE: AxioSozo closed the connection/);
      env.browser.handlers['tabs.list'] = () => FIXTURE.tabs;
      assert.equal((await env.client.call('browser_list_tabs')).isError, undefined);
      assert.equal(env.browser.hellos.length, 2);
    } finally {
      await env.teardown();
    }
  });

  test('a browser line over 4 MiB closes the connection with TOO_LARGE', async () => {
    const handlers = {
      ...defaultHandlers(),
      'tabs.screenshot': () => ({ mime: 'image/png', width: 1, height: 1, data_base64: 'A'.repeat(4_194_304) }),
    };
    const env = await setup({ handlers });
    try {
      const result = await env.client.call('browser_screenshot', { tab_id: 't_1' });
      assert.equal(result.isError, true);
      assert.match(textOf(result), /^TOO_LARGE: /);
      assert.equal((await env.client.call('browser_list_tabs')).isError, undefined);
      assert.equal(env.browser.hellos.length, 2);
    } finally {
      await env.teardown();
    }
  });

  test('a malformed screenshot result is an isError result', async () => {
    const handlers = { ...defaultHandlers(), 'tabs.screenshot': () => ({ mime: 'text/html', data_base64: '<b>' }) };
    const env = await setup({ handlers });
    try {
      const result = await env.client.call('browser_screenshot', { tab_id: 't_1' });
      assert.equal(result.isError, true);
      assert.match(textOf(result), /^UNAVAILABLE: AxioSozo returned a malformed screenshot/);
    } finally {
      await env.teardown();
    }
  });

  test('the cwd sent in hello is the process cwd, even with unusual characters', async () => {
    const tmp = await makeTempDir();
    const weird = path.join(tmp.dir, 'we"ird \\ dïr ✓');
    await mkdir(weird);
    const browser = await new FakeBrowser(tmp.socketPath).start();
    const client = new McpTestClient({ socketPath: tmp.socketPath, cwd: weird });
    try {
      await client.initialize();
      await client.call('browser_list_tabs');
      assert.equal(browser.hellos[0].cwd, weird);
    } finally {
      await client.close();
      await browser.stop();
      await tmp.cleanup();
    }
  });
});
