import { EventEmitter } from 'node:events';
import { StringDecoder } from 'node:string_decoder';
import { ProviderError, object, requireValue } from './validation.mjs';
import { appendAcpStderrTail, sanitizeAcpStderrExcerpt } from '../vendor/t3/AcpStderr.ts';

export class JsonLineTransport extends EventEmitter {
  #pending = new Map(); #next = 1; #buffer = ''; #decoder = new StringDecoder('utf8');
  #ended = false; #stderr = ''; #closePromise;
  constructor(child, { maxBytes = 1048576, timeoutMs = 3000 } = {}) {
    super(); this.child = child; this.maxBytes = maxBytes; this.timeoutMs = timeoutMs;
    this.#closePromise = new Promise(resolve => child.once('close', (code, signal) => {
      this.#fail(new ProviderError('PROCESS_EXIT', `Owned process exited (${code ?? signal})`));
      resolve({ code, signal });
    }));
    child.on('error', () => this.#fail(new ProviderError('PROCESS_ERROR', 'Owned process failed')));
    child.stdin.on('error', () => this.#fail(new ProviderError('PIPE_CLOSED', 'Provider stdin closed')));
    child.stderr.on('data', chunk => { this.#stderr = appendAcpStderrTail(this.#stderr, chunk.toString('utf8')); });
    child.stdout.on('data', chunk => this.#read(chunk));
  }
  get closed() { return this.#ended; }
  get pendingCount() { return this.#pending.size; }
  get diagnostic() { return sanitizeAcpStderrExcerpt(this.#stderr); }
  #read(chunk) {
    if (this.#ended) return;
    this.#buffer += this.#decoder.write(chunk);
    for (;;) {
      const split = this.#buffer.indexOf('\n');
      if (split < 0) break;
      const line = this.#buffer.slice(0, split); this.#buffer = this.#buffer.slice(split + 1);
      if (Buffer.byteLength(line) > this.maxBytes) { this.#fail(new ProviderError('MESSAGE_TOO_LARGE', 'Provider line exceeds limit')); return; }
      if (!line.trim()) continue;
      let message;
      try { message = JSON.parse(line); if (!object(message)) throw new Error(); }
      catch { this.#fail(new ProviderError('MALFORMED_MESSAGE', 'Provider returned invalid JSON')); return; }
      if ('id' in message && !('method' in message) && ('result' in message || 'error' in message)) {
        // Preserve numeric/string identity; 1 and "1" are different request IDs.
        const pending = this.#pending.get(message.id);
        if (!pending) continue; // A duplicate response cannot complete a second request.
        this.#pending.delete(message.id); clearTimeout(pending.timer);
        if ('error' in message) pending.reject(new ProviderError('PROVIDER_ERROR', 'Provider rejected request'));
        else pending.resolve(message.result);
      } else this.emit('message', message);
      if (this.#ended) return;
    }
    if (Buffer.byteLength(this.#buffer) > this.maxBytes) this.#fail(new ProviderError('MESSAGE_TOO_LARGE', 'Unterminated provider line exceeds limit'));
  }
  #fail(error) {
    if (this.#ended) return;
    this.#ended = true;
    for (const pending of this.#pending.values()) {
      clearTimeout(pending.timer);
      pending.reject(new ProviderError(pending.mutating ? 'UNCERTAIN' : error.code, pending.mutating ? 'Request may have executed; no automatic replay' : error.message));
    }
    this.#pending.clear(); this.#buffer = '';
    this.emit('terminated', error);
    if (this.child.exitCode === null && this.child.signalCode === null) this.child.kill('SIGTERM');
  }
  send(message) {
    requireValue(!this.#ended, 'PIPE_CLOSED', 'Provider transport is closed');
    const encoded = `${JSON.stringify(message)}\n`;
    requireValue(Buffer.byteLength(encoded) <= this.maxBytes, 'MESSAGE_TOO_LARGE', 'Outgoing provider line exceeds limit');
    requireValue(this.child.stdin.writableLength < this.maxBytes * 2, 'BACKPRESSURE', 'Provider input queue is full');
    this.child.stdin.write(encoded);
  }
  request(method, params, { mutating = false, timeoutMs = this.timeoutMs } = {}) {
    requireValue(this.#pending.size < 32, 'BACKPRESSURE', 'Too many provider requests');
    requireValue(Number.isInteger(timeoutMs) && timeoutMs > 0 && timeoutMs <= 30000, 'INVALID_INPUT', 'Invalid provider deadline');
    const requestId = this.#next++;
    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => {
        this.#pending.delete(requestId);
        reject(new ProviderError(mutating ? 'UNCERTAIN' : 'TIMEOUT', mutating ? 'Request may have executed; no automatic replay' : 'Provider request timed out'));
      }, timeoutMs);
      this.#pending.set(requestId, { resolve, reject, timer, mutating });
      try { this.send({ id: requestId, method, params }); }
      catch (error) { clearTimeout(timer); this.#pending.delete(requestId); reject(error); }
    });
  }
  async close() {
    if (!this.#ended) this.child.stdin.end();
    const escalation = setTimeout(() => {
      if (this.child.exitCode === null && this.child.signalCode === null) this.child.kill('SIGTERM');
    }, 250);
    const force = setTimeout(() => {
      if (this.child.exitCode === null && this.child.signalCode === null) this.child.kill('SIGKILL');
    }, 1000);
    const result = await this.#closePromise;
    clearTimeout(escalation); clearTimeout(force); return result;
  }
}
