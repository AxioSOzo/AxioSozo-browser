// Client side of the local agent channel (contracts/agent-channel-v1.md).

import net from 'node:net';
import os from 'node:os';
import path from 'node:path';
import { LineSplitter, LineTooLongError, encodeLine } from './jsonl.mjs';

export const CLIENT_LINE_MAX = 262_144;
export const BROWSER_LINE_MAX = 4_194_304;
export const MAX_OUTSTANDING = 16;
export const SOCKET_PATH_MAX = 100;
export const AGENTS = Object.freeze(['claude-code', 'codex', 'other']);

export const ERROR_CODES = Object.freeze([
  'NOT_APPROVED', 'UNKNOWN_METHOD', 'INVALID_PARAMS', 'UNKNOWN_TAB', 'PRIVATE',
  'BLOCKED_CATEGORY', 'NOT_IN_PROJECT', 'NO_PROJECT', 'DENIED', 'UNAVAILABLE',
  'TOO_LARGE', 'TIMEOUT', 'BUSY',
]);

export class ChannelError extends Error {
  constructor(code, message) {
    super(message);
    this.name = 'ChannelError';
    this.code = code;
  }
}

/** `$AXIOSOZO_AGENT_SOCKET` when set, else `~/.axiosozo/run/agent.sock`. */
export function resolveSocketPath(env = process.env, home = os.homedir()) {
  const configured = env.AXIOSOZO_AGENT_SOCKET;
  return configured ? configured : path.join(home, '.axiosozo', 'run', 'agent.sock');
}

function checkSocketPath(socketPath) {
  if (typeof socketPath !== 'string' || !path.isAbsolute(socketPath)) {
    throw new ChannelError('UNAVAILABLE', `agent socket path must be absolute: ${JSON.stringify(socketPath)}`);
  }
  if (Buffer.byteLength(socketPath, 'utf8') > SOCKET_PATH_MAX) {
    throw new ChannelError('UNAVAILABLE', `agent socket path is longer than ${SOCKET_PATH_MAX} bytes`);
  }
}

function connectError(error, socketPath) {
  if (error && (error.code === 'ENOENT' || error.code === 'ECONNREFUSED')) {
    return new ChannelError('UNAVAILABLE',
      `AxioSozo is not running, or its agent endpoint is turned off (nothing listening at ${socketPath}).`);
  }
  if (error && error.code === 'EACCES') {
    return new ChannelError('UNAVAILABLE', `Permission denied opening the AxioSozo agent socket at ${socketPath}.`);
  }
  return new ChannelError('UNAVAILABLE', `Could not connect to AxioSozo: ${error && error.message ? error.message : error}`);
}

function deferred() {
  let resolve;
  let reject;
  const promise = new Promise((res, rej) => { resolve = res; reject = rej; });
  promise.catch(() => {});
  return { promise, resolve, reject };
}

/**
 * One lazily opened, user-approved connection to the browser. A new
 * connection (and a new approval prompt) is made on the next request after
 * the browser closed the previous one.
 */
export class ChannelClient {
  #session = null;
  #connecting = null;
  #deniedUntil = 0;

  constructor({
    socketPath = resolveSocketPath(),
    agent = 'other',
    cwd = process.cwd(),
    version = '0.1.0',
    pid = process.pid,
    approvalWaitMs = 55_000,
    welcomeTimeoutMs = 10_000,
    deniedCooldownMs = 30_000,
    log = () => {},
  } = {}) {
    this.socketPath = socketPath;
    this.agent = AGENTS.includes(agent) ? agent : 'other';
    this.cwd = cwd;
    this.version = String(version).slice(0, 32);
    this.pid = pid;
    this.approvalWaitMs = approvalWaitMs;
    this.welcomeTimeoutMs = welcomeTimeoutMs;
    this.deniedCooldownMs = deniedCooldownMs;
    this.log = log;
  }

  /** The current session's welcome (`session`, `project_id`), or null. */
  get welcome() {
    return this.#session ? this.#session.welcome : null;
  }

  /** Send one request and resolve with its `result`; rejects with ChannelError. */
  async request(method, params = {}, { timeoutMs = 30_000 } = {}) {
    const session = await this.#ready();
    if (session.closed) throw session.closeError;
    if (session.pending.size >= MAX_OUTSTANDING) {
      throw new ChannelError('BUSY', `More than ${MAX_OUTSTANDING} requests are outstanding; try again.`);
    }
    const id = session.nextId++;
    let line;
    try {
      line = encodeLine({ v: 1, id, method, params }, CLIENT_LINE_MAX);
    } catch (error) {
      if (error instanceof LineTooLongError) {
        throw new ChannelError('TOO_LARGE', `The request is larger than ${CLIENT_LINE_MAX} bytes.`);
      }
      throw error;
    }
    const reply = deferred();
    const timer = setTimeout(() => {
      session.pending.delete(id);
      reply.reject(new ChannelError('TIMEOUT', `AxioSozo did not answer ${method} within ${Math.round(timeoutMs / 1000)} s.`));
    }, timeoutMs);
    session.pending.set(id, reply);
    session.socket.write(line);
    try {
      return await reply.promise;
    } finally {
      clearTimeout(timer);
      session.pending.delete(id);
    }
  }

  close() {
    if (this.#session) this.#session.socket.destroy();
    this.#session = null;
  }

  async #ready() {
    if (Date.now() < this.#deniedUntil) {
      throw new ChannelError('NOT_APPROVED',
        'The user denied this agent access in AxioSozo. Ask the user before trying again.');
    }
    let session = this.#session;
    if (!session || session.closed) {
      if (!this.#connecting) {
        this.#connecting = this.#open().finally(() => { this.#connecting = null; });
      }
      session = await this.#connecting;
    }
    if (session.state === 'approved') return session;
    let timer;
    const waited = new Promise((resolve) => { timer = setTimeout(() => resolve('timeout'), this.approvalWaitMs); });
    try {
      const outcome = await Promise.race([session.approval.promise, waited]);
      if (outcome === 'timeout') {
        throw new ChannelError('NOT_APPROVED',
          'Waiting for approval in AxioSozo: the user has not yet clicked "Allow for this session" in the browser. ' +
          'Ask the user to allow it, then call the tool again.');
      }
      if (outcome !== true) {
        throw new ChannelError('NOT_APPROVED',
          'The user denied this agent access in AxioSozo. Ask the user before trying again.');
      }
      return session;
    } finally {
      clearTimeout(timer);
    }
  }

  #open() {
    checkSocketPath(this.socketPath);
    return new Promise((resolve, reject) => {
      const socket = net.createConnection({ path: this.socketPath });
      const session = {
        socket,
        state: 'connecting',
        closed: false,
        closeError: null,
        welcome: null,
        nextId: 1,
        pending: new Map(),
        approval: deferred(),
      };
      let settled = false;
      const welcomeTimer = setTimeout(() => {
        fail(new ChannelError('TIMEOUT', 'AxioSozo did not answer the hello within ' +
          `${Math.round(this.welcomeTimeoutMs / 1000)} s.`));
      }, this.welcomeTimeoutMs);
      const fail = (error) => {
        if (!settled) {
          settled = true;
          clearTimeout(welcomeTimer);
          reject(error);
        }
        shutdown(error);
      };
      const shutdown = (error) => {
        if (session.closed) return;
        session.closed = true;
        session.closeError = error;
        session.state = 'closed';
        socket.destroy();
        if (this.#session === session) this.#session = null;
        session.approval.reject(error);
        for (const reply of session.pending.values()) reply.reject(error);
        session.pending.clear();
      };
      const splitter = new LineSplitter({
        maxLineBytes: BROWSER_LINE_MAX,
        onOverflow: () => fail(new ChannelError('TOO_LARGE',
          `AxioSozo sent a line over ${BROWSER_LINE_MAX} bytes; the connection was closed.`)),
        onInvalid: () => fail(new ChannelError('UNAVAILABLE', 'AxioSozo sent invalid UTF-8; the connection was closed.')),
        onLine: (text) => {
          let message;
          try {
            message = JSON.parse(text);
          } catch {
            fail(new ChannelError('UNAVAILABLE', 'AxioSozo sent invalid JSON; the connection was closed.'));
            return;
          }
          handle(message);
        },
      });
      const handle = (message) => {
        if (!message || typeof message !== 'object' || Array.isArray(message)) return;
        if (message.type === 'welcome' && session.state === 'connecting') {
          session.welcome = Object.freeze({
            session: typeof message.session === 'string' ? message.session : null,
            project_id: message.project_id ?? null,
            approval: message.approval,
          });
          session.state = message.approval === 'not_required' ? 'approved' : 'pending';
          if (session.state === 'approved') session.approval.resolve(true);
          settled = true;
          clearTimeout(welcomeTimer);
          this.#session = session;
          this.log(`connected to AxioSozo (approval ${message.approval})`);
          resolve(session);
          return;
        }
        if (message.type === 'approval') {
          if (message.granted === true) {
            session.state = 'approved';
            session.approval.resolve(true);
            this.log('access granted in AxioSozo');
          } else {
            session.state = 'denied';
            this.#deniedUntil = Date.now() + this.deniedCooldownMs;
            session.approval.resolve(false);
            this.log('access denied in AxioSozo');
          }
          return;
        }
        if (Number.isInteger(message.id)) {
          const reply = session.pending.get(message.id);
          if (!reply) return;
          session.pending.delete(message.id);
          if (message.error && typeof message.error === 'object') {
            const code = typeof message.error.code === 'string' ? message.error.code : 'UNAVAILABLE';
            const text = typeof message.error.message === 'string' ? message.error.message : '';
            reply.reject(new ChannelError(code, text));
          } else {
            reply.resolve(message.result === undefined ? null : message.result);
          }
        }
      };
      socket.on('connect', () => {
        socket.write(encodeLine({
          v: 1,
          type: 'hello',
          client: { name: 'agent-bridge', agent: this.agent, version: this.version },
          cwd: this.cwd,
          pid: this.pid,
        }, CLIENT_LINE_MAX));
      });
      socket.on('data', (chunk) => splitter.push(chunk));
      socket.on('error', (error) => {
        fail(settled ? new ChannelError('UNAVAILABLE', `Connection to AxioSozo failed: ${error.message}`)
          : connectError(error, this.socketPath));
      });
      socket.on('close', () => {
        fail(new ChannelError('UNAVAILABLE',
          session.state === 'denied'
            ? 'The user denied this agent access in AxioSozo.'
            : 'AxioSozo closed the connection (access revoked, idle timeout or browser quit). ' +
              'Call the tool again to reconnect.'));
      });
    });
  }
}
