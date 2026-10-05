/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. https://mozilla.org/MPL/2.0/ */
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { ContextsError, MANIFEST_PATH, draftToManifest, parseManifest, serializeManifest, assertNoSecrets, draftManifestState } from '../src/index.mjs';
import { manifest } from './samples.mjs';

const expected = async name => JSON.parse(await readFile(new URL(`./expected/${name}.json`, import.meta.url), 'utf8'));
const throwsCode = (fn, code) => assert.throws(fn, e => e instanceof ContextsError && e.code === code, code);
// Built at runtime so no token-shaped literal is committed.
const fakeToken = (prefix, n) => prefix + 'Z9'.repeat(n);

test('draftToManifest strips provenance and applies edits', async () => {
  const draft = await expected('vite-app');
  const m = draftToManifest(draft);
  assert.deepEqual(m, {
    version: 3, name: 'vite-app', kind: 'web', environments: [{ name: 'local', base_url: 'http://localhost:5173/' }],
    services: [{ name: 'Vite dev server', url: 'http://localhost:5173/', port: 5173, command: 'npm run dev' }],
    surfaces: draft.surfaces.map(({ name, url, kind }) => ({ name, url, kind })),
  });
  assert.ok(Object.isFrozen(m));
  assert.equal(draftManifestState(draft), 'none');
  const edited = draftToManifest(draft, { name: 'Renamed', environments: [...m.environments, { name: 'production', base_url: 'https://app.example.com/' }], surfaces: [] });
  assert.deepEqual([edited.name, edited.environments.length, edited.surfaces.length], ['Renamed', 2, 0]);
  throwsCode(() => draftToManifest(draft, { commands: ['npm run dev'] }), 'INVALID_INPUT');
  throwsCode(() => draftToManifest(draft, { kind: 'game' }), 'INVALID_MANIFEST');
  throwsCode(() => draftToManifest({ ...draft, extra: 1 }), 'INVALID_DRAFT');
  // Edited service and surface URLs with a query or fragment are rejected, never silently changed.
  throwsCode(() => draftToManifest(draft, { surfaces: [{ name: 'Stripe', url: 'https://dashboard.example.com/?api_key=abc', kind: 'payments' }] }), 'INVALID_MANIFEST');
  throwsCode(() => draftToManifest(draft, { services: [{ name: 'Api', url: 'http://localhost:8787/?debug=1', port: 8787 }] }), 'INVALID_MANIFEST');
  throwsCode(() => draftToManifest(draft, { surfaces: [{ name: 'Stripe', url: `https://dashboard.example.com/${fakeToken('sk-', 10)}`, kind: 'payments' }] }), 'MANIFEST_SECRET');
});

test('draftToManifest strips a query or fragment from draft service and surface URLs (L5)', async () => {
  const draft = await expected('vite-app');
  const old = { ...draft,
    services: [{ ...draft.services[0], url: 'http://localhost:5173/?token=abc#x' }],
    surfaces: [{ name: 'CI', url: 'https://ci.example/run?id=1#log', kind: 'ci', source: 'package.json', guess: true }] };
  const m = draftToManifest(old);
  assert.equal(m.services[0].url, 'http://localhost:5173/');
  assert.equal(m.surfaces[0].url, 'https://ci.example/run');
  assert.doesNotMatch(serializeManifest(m), /[?#]/);
});

test('serialize is stable, 2-space, newline-terminated and round-trips', () => {
  const shuffled = { surfaces: [{ kind: 'repository', url: 'https://github.com/acme/app', name: 'Repository' }], services: [{ port: 5173, url: 'http://localhost:5173/', name: 'Vite' }],
    environments: [{ base_url: 'http://localhost:5173', name: 'local' }], kind: 'web', name: 'Fixture', version: 1 };
  const text = serializeManifest(shuffled);
  assert.equal(text, serializeManifest(manifest({ environments: [{ name: 'local', base_url: 'http://localhost:5173' }] })));
  assert.ok(text.endsWith('}\n') && !text.endsWith('\n\n'));
  assert.deepEqual(Object.keys(JSON.parse(text)), ['version', 'name', 'kind', 'environments', 'services', 'surfaces']);
  assert.match(text, /^\{\n {2}"version": 1,\n {2}"name": "Fixture",/);
  assert.deepEqual(Object.keys(JSON.parse(text).environments[0]), ['name', 'base_url']);
  assert.equal(serializeManifest(parseManifest(text)), text);
});

test('parseManifest rejects invalid, oversized and secret-bearing input', () => {
  assert.equal(parseManifest(JSON.stringify(manifest())).name, 'Fixture');
  throwsCode(() => parseManifest('{'), 'INVALID_MANIFEST');
  throwsCode(() => parseManifest(null), 'INVALID_MANIFEST');
  throwsCode(() => parseManifest(`${JSON.stringify(manifest())}${' '.repeat(262144)}`), 'INVALID_MANIFEST');
  throwsCode(() => parseManifest(JSON.stringify({ ...manifest(), commands: { dev: 'npm run dev' } })), 'INVALID_MANIFEST');
  throwsCode(() => parseManifest(JSON.stringify(manifest({ surfaces: [{ name: 'x', url: 'https://u:p@x.com/', kind: 'other' }] }))), 'INVALID_MANIFEST');
  for (const bad of [
    manifest({ surfaces: [{ name: 'x', url: 'https://x.com/hook?token=abc', kind: 'other' }] }),
    manifest({ surfaces: [{ name: 'x', url: 'https://x.com/?X-Amz-Signature=abc', kind: 'other' }] }),
  ]) {
    // Any query (credential-like or not) is invalid in a manifest.
    throwsCode(() => parseManifest(JSON.stringify(bad)), 'INVALID_MANIFEST');
    throwsCode(() => serializeManifest(bad), 'INVALID_MANIFEST');
  }
  for (const url of ['https://x.com/docs?page=2', 'https://x.com/docs#intro', 'http://localhost:3000/?']) {
    throwsCode(() => parseManifest(JSON.stringify(manifest({ surfaces: [{ name: 'x', url, kind: 'other' }] }))), 'INVALID_MANIFEST');
    throwsCode(() => parseManifest(JSON.stringify(manifest({ services: [{ name: 'x', url, port: 3000 }] }))), 'INVALID_MANIFEST');
  }
  for (const bad of [
    manifest({ name: fakeToken('ghp_', 12) }),
    manifest({ name: fakeToken('github_pat_', 12) }),
    manifest({ name: fakeToken('sk-', 10) }),
    manifest({ name: fakeToken('AKIA', 8) }),
    manifest({ name: '/Users/wout/secret-project' }),
    manifest({ name: '~/code/app' }),
    manifest({ surfaces: [{ name: 'x', url: `https://x.com/${fakeToken('glpat-', 10)}`, kind: 'other' }] }),
  ]) {
    throwsCode(() => parseManifest(JSON.stringify(bad)), 'MANIFEST_SECRET');
    throwsCode(() => serializeManifest(bad), 'MANIFEST_SECRET');
  }
  throwsCode(() => assertNoSecrets({ nested: ['-----BEGIN OPENSSH PRIVATE KEY-----'] }), 'MANIFEST_SECRET');
  assert.equal(assertNoSecrets(manifest({ name: 'Keyboard shortcuts / tokens UI' })).name, 'Keyboard shortcuts / tokens UI');
});

test('manifest from a detected external manifest', async () => {
  const draft = await expected('with-manifest');
  assert.equal(draft.kind_source.source, MANIFEST_PATH);
  assert.equal(draftManifestState(draft), 'external');
  assert.equal(serializeManifest(draftToManifest(draft)), serializeManifest(parseManifest(await readFile(new URL('./fixtures/with-manifest/.axiosozo/project.json', import.meta.url), 'utf8'))));
});
