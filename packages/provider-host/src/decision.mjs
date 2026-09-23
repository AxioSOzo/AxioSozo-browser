import { ProviderError, requireValue, exactKeys, id, object } from './validation.mjs';
export const JEV_MODEL = 'jev-1.13.0';
export const JEV_ENDPOINT = 'https://api.typesafe.ai/v1/systemone';
export const DIAGNOSTIC_STATE = Object.freeze({ source: 'TEST_FIXTURE', context_version: 'synthetic-1', services: { gecko: 'available', chromium: 'not_verified' } });
const choices = Object.freeze({ no_op: 'No follow-up is needed', inspect_engine: 'Engine integration requires a diagnostic inspection', unknown: 'The state does not justify a decision' });

export class DecisionProvider {
  constructor({ keyStore, fetchImpl = fetch, now = Date.now } = {}) { this.keyStore = keyStore; this.fetchImpl = fetchImpl; this.now = now; }
  async decide(input, { signal } = {}) {
    exactKeys(input, ['version', 'request_id', 'context_version', 'deadline_ms', 'state']);
    requireValue(input.version === 1, 'INVALID_INPUT', 'Unsupported decision schema version');
    id(input.request_id, 'request_id'); id(input.context_version, 'context_version');
    requireValue(JSON.stringify(input.state) === JSON.stringify(DIAGNOSTIC_STATE) && input.context_version === DIAGNOSTIC_STATE.context_version, 'INVALID_INPUT', 'Only the fixed synthetic diagnostic is enabled');
    requireValue(Number.isSafeInteger(input.deadline_ms) && input.deadline_ms > this.now() && input.deadline_ms - this.now() <= 30000, 'INVALID_INPUT', 'Decision deadline must be within 30 seconds');
    const result = (outcome, reason) => ({ version: 1, request_id: input.request_id, context_version: input.context_version,
      outcome, reason, authority: 'diagnostic_only', action_authorized: false });
    if (signal?.aborted) return result('unknown', 'cancelled');
    let key;
    try { key = this.keyStore ? await this.keyStore.read() : null; }
    catch { return result('unknown', 'KEYCHAIN_ERROR'); }
    if (!key) return result('no_op', 'disabled'); // No key means zero fetch calls.
    if (signal?.aborted) return result('unknown', 'cancelled');
    if (this.now() >= input.deadline_ms) return result('unknown', 'timeout');
    const controller = new AbortController();
    const cancel = () => controller.abort(); signal?.addEventListener('abort', cancel, { once: true });
    let timedOut = false;
    const timer = setTimeout(() => { timedOut = true; controller.abort(); }, input.deadline_ms - this.now());
    try {
      const response = await this.fetchImpl(JEV_ENDPOINT, { method: 'POST', redirect: 'error', signal: controller.signal,
        headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ model: JEV_MODEL, state: input.state, questions: { diagnostic: { type: 'choice', instructions: 'Choose a diagnostic suggestion from the explicit synthetic service state. Never authorize an action.', criteria: choices } } }),
      });
      key = undefined;
      if (response.status === 401) return result('unknown', 'BLOCKED_AUTH');
      if (!response.ok) return result('unknown', 'HTTP_ERROR');
      requireValue(response.body, 'INVALID_OUTPUT', 'Missing response');
      const reader = response.body.getReader(); let body = ''; let bytes = 0; const decoder = new TextDecoder();
      for (;;) {
        const { done, value } = await reader.read(); if (done) break;
        bytes += value.byteLength; if (bytes > 32768) { await reader.cancel(); throw new ProviderError('INVALID_OUTPUT', 'Decision too large'); }
        body += decoder.decode(value, { stream: true });
      }
      body += decoder.decode(); const decoded = JSON.parse(body); const answer = decoded?.answers?.diagnostic;
      requireValue(decoded.model === JEV_MODEL && object(answer) && answer.type === 'choice' && Object.hasOwn(choices, answer.choice), 'INVALID_OUTPUT', 'Decision schema or model mismatch');
      requireValue(typeof answer.confidence === 'number' && answer.confidence >= 0 && answer.confidence <= 1, 'INVALID_OUTPUT', 'Invalid confidence');
      requireValue(object(answer.probabilities) && Object.keys(answer.probabilities).length === 3 && Object.keys(choices).every(k => typeof answer.probabilities[k] === 'number' && answer.probabilities[k] >= 0 && answer.probabilities[k] <= 1), 'INVALID_OUTPUT', 'Invalid probabilities');
      requireValue(Math.abs(Object.values(answer.probabilities).reduce((a, b) => a + b, 0) - 1) < 0.00001, 'INVALID_OUTPUT', 'Probabilities do not sum to one');
      if (signal?.aborted || this.now() >= input.deadline_ms) return result('unknown', signal?.aborted ? 'cancelled' : 'timeout');
      return { ...result(answer.confidence >= 0.8 ? answer.choice : 'unknown', 'validated'), model: decoded.model };
    } catch (error) { return result('unknown', signal?.aborted ? 'cancelled' : timedOut ? 'timeout' : error.code === 'INVALID_OUTPUT' || error instanceof SyntaxError ? 'malformed_output' : 'NETWORK_ERROR'); }
    finally { key = undefined; clearTimeout(timer); signal?.removeEventListener('abort', cancel); }
  }
}
