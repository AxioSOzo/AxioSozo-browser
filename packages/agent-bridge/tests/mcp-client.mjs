// Minimal MCP stdio client used by the tests to drive the real bridge binary.

import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';

export const BRIDGE_BIN = fileURLToPath(new URL('../bin/axiosozo-agent-bridge.mjs', import.meta.url));

export class McpTestClient {
  constructor({ socketPath, args = ['--agent', 'claude-code'], env = {}, cwd } = {}) {
    this.child = spawn(process.execPath, [BRIDGE_BIN, ...args], {
      cwd,
      env: { ...process.env, AXIOSOZO_AGENT_SOCKET: socketPath, ...env },
      stdio: ['pipe', 'pipe', 'pipe'],
    });
    this.nextId = 1;
    this.waiting = new Map();
    this.messages = [];
    this.rawStdout = '';
    this.stderr = '';
    let buffer = '';
    this.child.stdout.setEncoding('utf8');
    this.child.stdout.on('data', (chunk) => {
      this.rawStdout += chunk;
      buffer += chunk;
      let nl;
      while ((nl = buffer.indexOf('\n')) !== -1) {
        const line = buffer.slice(0, nl);
        buffer = buffer.slice(nl + 1);
        const message = JSON.parse(line);
        this.messages.push(message);
        const waiter = this.waiting.get(message.id);
        if (waiter) {
          this.waiting.delete(message.id);
          waiter(message);
        }
      }
    });
    this.child.stderr.setEncoding('utf8');
    this.child.stderr.on('data', (chunk) => { this.stderr += chunk; });
    this.exited = new Promise((resolve) => this.child.on('exit', (code) => resolve(code)));
  }

  writeRaw(text) {
    this.child.stdin.write(text);
  }

  notify(method, params) {
    this.writeRaw(JSON.stringify({ jsonrpc: '2.0', method, ...(params ? { params } : {}) }) + '\n');
  }

  /** Send a request; resolves with the whole response message. */
  request(method, params, id = this.nextId++) {
    const promise = this.waitFor(id);
    this.writeRaw(JSON.stringify({ jsonrpc: '2.0', id, method, ...(params ? { params } : {}) }) + '\n');
    return promise;
  }

  waitFor(id, timeoutMs = 10_000) {
    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => {
        this.waiting.delete(id);
        reject(new Error(`no response for id ${id}; stderr: ${this.stderr}`));
      }, timeoutMs);
      this.waiting.set(id, (message) => { clearTimeout(timer); resolve(message); });
    });
  }

  async initialize(protocolVersion = '2025-06-18') {
    const response = await this.request('initialize', {
      protocolVersion,
      capabilities: {},
      clientInfo: { name: 'axiosozo-test-client', version: '0.0.0' },
    });
    this.notify('notifications/initialized');
    return response;
  }

  async call(name, args = {}) {
    const response = await this.request('tools/call', { name, arguments: args });
    if (response.error) throw new Error(`protocol error ${JSON.stringify(response.error)}`);
    return response.result;
  }

  async close() {
    this.child.stdin.end();
    const timer = setTimeout(() => this.child.kill('SIGKILL'), 3000);
    const code = await this.exited;
    clearTimeout(timer);
    return code;
  }
}

/** Text of the first text content item of a tool result. */
export function textOf(result) {
  const item = result.content.find((c) => c.type === 'text');
  return item ? item.text : '';
}
