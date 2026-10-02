// A fake AxioSozo agent channel endpoint (contracts/agent-channel-v1.md) for
// tests. It speaks the channel protocol over a Unix socket in a temp dir on
// the project's external build volume; it never touches a real browser.

import { mkdtemp, rm } from 'node:fs/promises';
import net from 'node:net';
import path from 'node:path';
import { LineSplitter } from '../src/jsonl.mjs';

export const TEST_TMP_ROOT = process.env.AXIOSOZO_TEST_TMP || '/Volumes/AxioSozoBuild/workstation/tmp';
const CLIENT_LINE_MAX = 262_144;

/** A fresh directory below the external build volume (never internal /tmp or home). */
export async function makeTempDir() {
  const dir = await mkdtemp(path.join(TEST_TMP_ROOT, 'ab-'));
  return {
    dir,
    socketPath: path.join(dir, 'b.sock'),
    cleanup: () => rm(dir, { recursive: true, force: true }),
  };
}

// 1x1 transparent PNG.
export const PNG_1X1 = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==';

export const FIXTURE = {
  tabs: [
    { tab_id: 't_1', url: 'http://localhost:3000/', title: 'Demo — local', active: true, project_id: 'p_demo', engine: 'gecko' },
    { tab_id: 't_2', url: 'https://example.net/docs', title: 'Docs "quoted"', active: false, project_id: null, engine: 'chromium' },
  ],
  project: {
    project_id: 'p_demo',
    name: 'Demo',
    root: '/Volumes/Work/demo',
    apps: [{ app: 'web', environments: [{ name: 'local', base_url: 'http://localhost:3000' }] }],
    integrations: [{ id: 'vercel', name: 'Vercel' }],
  },
  console: {
    count: 1,
    messages: [{ level: 'error', text: 'TypeError: x is undefined', source: 'http://localhost:3000/app.js', line: 12, at: 1759400000000 }],
  },
};

function err(code, message) {
  return Object.assign(new Error(message), { channelCode: code });
}

export function defaultHandlers() {
  const tab = (params) => {
    const found = FIXTURE.tabs.find((t) => t.tab_id === params.tab_id);
    if (!found) throw err('UNKNOWN_TAB', `no tab ${params.tab_id}`);
    return found;
  };
  return {
    'tabs.list': () => FIXTURE.tabs,
    'tabs.active': () => FIXTURE.tabs[0],
    'project.info': () => FIXTURE.project,
    'console.errors': (params) => {
      if (tab(params).engine === 'chromium') throw err('UNAVAILABLE', 'Chromium tabs are not available yet');
      return FIXTURE.console;
    },
    'tabs.screenshot': (params) => {
      tab(params);
      return { mime: 'image/png', width: 1, height: 1, data_base64: PNG_1X1 };
    },
    'tabs.open': () => ({ tab_id: 't_3' }),
    'tabs.navigate': (params) => { tab(params); return {}; },
    'page.click': (params) => { tab(params); return {}; },
    'page.type': (params) => { tab(params); return {}; },
  };
}

/**
 * approval: "grant" | "deny" | "never" | "not_required" | "manual"
 * ("manual": call grant()/deny() from the test).
 */
export class FakeBrowser {
  constructor(socketPath, { approval = 'grant', approvalDelayMs = 0, handlers = defaultHandlers() } = {}) {
    this.socketPath = socketPath;
    this.approval = approval;
    this.approvalDelayMs = approvalDelayMs;
    this.handlers = handlers;
    this.connections = new Set();
    this.lines = [];
    this.hellos = [];
    this.hooks = [];
    this.requests = [];
    this.events = [];
    this.waitingApproval = [];
  }

  start() {
    this.server = net.createServer((socket) => this.#accept(socket));
    return new Promise((resolve, reject) => {
      this.server.once('error', reject);
      this.server.listen(this.socketPath, () => resolve(this));
    });
  }

  async stop() {
    for (const socket of this.connections) socket.destroy();
    await new Promise((resolve) => this.server.close(resolve));
  }

  closeAll() {
    for (const socket of this.connections) socket.destroy();
  }

  grant() { this.#answer(true); }
  deny() { this.#answer(false); }

  #answer(granted) {
    const waiting = this.waitingApproval.splice(0);
    for (const conn of waiting) this.#approve(conn, granted);
  }

  #send(socket, message) {
    if (!socket.destroyed) socket.write(JSON.stringify(message) + '\n');
  }

  #approve(conn, granted) {
    if (conn.socket.destroyed) return;
    conn.approved = granted;
    this.#send(conn.socket, { v: 1, type: 'approval', granted });
    if (!granted) conn.socket.end();
  }

  #accept(socket) {
    this.connections.add(socket);
    socket.on('close', () => this.connections.delete(socket));
    socket.on('error', () => {});
    const conn = { socket, hello: null, approved: false, acked: false };
    // A notify client must stay connected until the ack (macOS nc otherwise
    // closes as soon as its stdin ends).
    socket.on('end', () => {
      if (conn.hello?.client?.name === 'axiosozo-notify' && !conn.acked) this.events.push('notify-eof-before-ack');
    });
    const splitter = new LineSplitter({
      maxLineBytes: CLIENT_LINE_MAX,
      onOverflow: () => { this.events.push('oversized'); socket.destroy(); },
      onInvalid: () => { this.events.push('invalid-utf8'); socket.destroy(); },
      onLine: (text) => {
        this.lines.push(text);
        let message;
        try {
          message = JSON.parse(text);
        } catch {
          this.events.push('invalid-json');
          socket.destroy();
          return;
        }
        this.#handle(conn, message);
      },
    });
    socket.on('data', (chunk) => splitter.push(chunk));
  }

  #handle(conn, message) {
    const { socket } = conn;
    if (!conn.hello) {
      if (message.type !== 'hello' || message.v !== 1) {
        this.events.push('no-hello');
        socket.destroy();
        return;
      }
      conn.hello = message;
      this.hellos.push(message);
      const notify = message.client?.name === 'axiosozo-notify';
      const approval = notify || this.approval === 'not_required' ? 'not_required' : 'pending';
      conn.approved = approval === 'not_required';
      this.#send(socket, { v: 1, type: 'welcome', session: 's_0123456789abcdef', project_id: 'p_demo', approval });
      if (approval === 'pending') {
        if (this.approval === 'grant' || this.approval === 'deny') {
          setTimeout(() => this.#approve(conn, this.approval === 'grant'), this.approvalDelayMs);
        } else if (this.approval === 'manual') {
          this.waitingApproval.push(conn);
        }
      }
      return;
    }
    if (message.type === 'hook') {
      this.hooks.push(message);
      conn.acked = true;
      this.#send(socket, { v: 1, type: 'ack', matched: true });
      socket.end();
      return;
    }
    if (!Number.isInteger(message.id) || typeof message.method !== 'string') {
      this.events.push('bad-request');
      socket.destroy();
      return;
    }
    this.requests.push(message);
    const reply = (body) => this.#send(socket, { v: 1, id: message.id, ...body });
    if (!conn.approved) {
      reply({ error: { code: 'NOT_APPROVED', message: 'not approved' } });
      return;
    }
    const handler = this.handlers[message.method];
    if (!handler) {
      reply({ error: { code: 'UNKNOWN_METHOD', message: `unknown method ${message.method}` } });
      return;
    }
    Promise.resolve()
      .then(() => handler(message.params ?? {}, { socket, message }))
      .then(
        (result) => { if (result !== NO_REPLY) reply({ result }); },
        (error) => reply({ error: { code: error.channelCode || 'UNAVAILABLE', message: error.message } }),
      );
  }

  /** Resolve once `predicate()` is true (polling). */
  async until(predicate, timeoutMs = 3000) {
    const start = Date.now();
    while (!predicate()) {
      if (Date.now() - start > timeoutMs) throw new Error('timed out waiting for condition');
      await new Promise((r) => setTimeout(r, 10));
    }
  }
}

/** Return this from a handler to send no reply at all. */
export const NO_REPLY = Symbol('no-reply');
export { err as channelError };
