import test from 'node:test';
import assert from 'node:assert/strict';
import { DecisionProvider, DIAGNOSTIC_STATE, JEV_MODEL, JEV_ENDPOINT } from '../src/decision.mjs';
import { MacKeychain } from '../src/keychain.mjs';
const input = () => ({ version: 1, request_id: 'decision-1', context_version: 'synthetic-1', deadline_ms: Date.now() + 500, state: DIAGNOSTIC_STATE });
const body = () => ({ model: JEV_MODEL, answers: { diagnostic: { type: 'choice', choice: 'inspect_engine', confidence: 0.99, probabilities: { inspect_engine: 0.99, no_op: 0.01, unknown: 0 } } } });
const keyStore = { read: async () => 'synthetic-test-key' };
test('Jev off never calls network', async () => {
  let count = 0; const provider = new DecisionProvider({ keyStore: { read: async () => null }, fetchImpl: async () => { count++; } });
  assert.equal((await provider.decide(input())).outcome, 'no_op'); assert.equal(count, 0);
});
test('Jev validates pinned model/schema and never authorizes an action', async () => {
  const provider = new DecisionProvider({ keyStore, fetchImpl: async (url, options) => {
    assert.equal(url, JEV_ENDPOINT); assert.equal(options.redirect, 'error');
    assert.equal(JSON.parse(options.body).model, JEV_MODEL); assert.deepEqual(JSON.parse(options.body).state, DIAGNOSTIC_STATE);
    return Response.json(body());
  } });
  const result = await provider.decide(input()); assert.equal(result.outcome, 'inspect_engine'); assert.equal(result.action_authorized, false);
});
test('Jev malformed, unexpected model, invalid probability and low confidence fail closed', async () => {
  for (const invalid of [{}, { ...body(), model: 'jev-latest' }, { ...body(), answers: { diagnostic: { ...body().answers.diagnostic, choice: 'execute_shell' } } }, { ...body(), answers: { diagnostic: { ...body().answers.diagnostic, probabilities: {} } } }]) {
    const provider = new DecisionProvider({ keyStore, fetchImpl: async () => Response.json(invalid) });
    assert.equal((await provider.decide(input())).reason, 'malformed_output');
  }
  const low = body(); low.answers.diagnostic.confidence = 0.2;
  assert.equal((await new DecisionProvider({ keyStore, fetchImpl: async () => Response.json(low) }).decide(input())).outcome, 'unknown');
});
test('Jev deadline cancels the actual fetch, no retry', async () => {
  let count = 0; const provider = new DecisionProvider({ keyStore, fetchImpl: async (_url, { signal }) => new Promise((_resolve, reject) => {
    count++; signal.addEventListener('abort', () => reject(new Error('aborted')), { once: true });
  }) });
  assert.equal((await provider.decide({ ...input(), deadline_ms: Date.now() + 30 })).reason, 'timeout'); assert.equal(count, 1);
});
test('Jev caller cancellation, oversized response and Keychain failure', async () => {
  const controller = new AbortController(); controller.abort(); let count = 0;
  const provider = new DecisionProvider({ keyStore, fetchImpl: async () => { count++; return Response.json(body()); } });
  assert.equal((await provider.decide(input(), { signal: controller.signal })).reason, 'cancelled'); assert.equal(count, 0);
  assert.equal((await new DecisionProvider({ keyStore, fetchImpl: async () => new Response('x'.repeat(40000)) }).decide(input())).reason, 'malformed_output');
  assert.equal((await new DecisionProvider({ keyStore: { read: async () => { throw new Error('locked'); } } }).decide(input())).reason, 'KEYCHAIN_ERROR');
});
test('Jev refuses private/real context and stale schema', async () => {
  const provider = new DecisionProvider();
  await assert.rejects(provider.decide({ ...input(), state: { history: 'personal' } }), { code: 'INVALID_INPUT' });
  await assert.rejects(provider.decide({ ...input(), context_version: 'old' }), { code: 'INVALID_INPUT' });
  await assert.rejects(provider.decide({ ...input(), version: 2 }), { code: 'INVALID_INPUT' });
});
test('Keychain missing helper never falls back to plaintext storage', async () => {
  await assert.rejects(new MacKeychain('/nonexistent/axiosozo-keychain').read(), { code: process.platform === 'darwin' ? 'KEYCHAIN_ERROR' : 'BLOCKED_ENV' });
});
