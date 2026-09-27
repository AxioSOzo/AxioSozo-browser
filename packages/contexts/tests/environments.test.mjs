/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. https://mozilla.org/MPL/2.0/ */
import test from 'node:test';
import assert from 'node:assert/strict';
import { ENV_ORDER, orderedEnvironments, matchEnvironment, switchEnvironment, isDeclaredLocalOrigin, validateManifest } from '../src/index.mjs';

const envs = validateManifest({ version: 1, name: 'x', kind: 'web', services: [], surfaces: [], environments: [
  { name: 'staging', base_url: 'https://staging.example.com' },
  { name: 'production', base_url: 'https://example.com' },
  { name: 'preview', base_url: 'https://preview.example.net/app' },
  { name: 'local', base_url: 'http://localhost:5173' },
] }).environments;

test('ordering: local, preview, production, then others in declared order', () => {
  assert.deepEqual(ENV_ORDER, ['local', 'preview', 'production']);
  const names = list => orderedEnvironments(list).map(e => e.name);
  assert.deepEqual(names(envs), ['local', 'preview', 'production', 'staging']);
  assert.deepEqual(names({ manifest: { environments: envs } }), ['local', 'preview', 'production', 'staging']);
  assert.deepEqual(names([{ name: 'qa', base_url: 'https://qa.x' }, { name: 'dev', base_url: 'https://dev.x' }]), ['qa', 'dev']);
  assert.deepEqual(names(null), []);
  assert.ok(Object.isFrozen(orderedEnvironments(envs)));
});

test('matchEnvironment: origin plus segment-boundary prefix, most specific wins', () => {
  const m = matchEnvironment(envs, 'https://preview.example.net/app/users/7?tab=a#top');
  assert.equal(m.environment.name, 'preview');
  assert.deepEqual(m.rest, { path: '/users/7', search: '?tab=a', hash: '#top' });
  assert.deepEqual(matchEnvironment(envs, 'https://preview.example.net/app').rest, { path: '', search: '', hash: '' });
  assert.equal(matchEnvironment(envs, 'https://preview.example.net/apple'), null);
  assert.equal(matchEnvironment(envs, 'https://preview.example.net/'), null);
  assert.equal(matchEnvironment(envs, 'http://example.com/'), null, 'scheme is part of the origin');
  assert.equal(matchEnvironment(envs, 'http://localhost:5174/'), null, 'port is part of the origin');
  assert.equal(matchEnvironment(envs, 'http://127.0.0.1:5173/'), null);
  assert.equal(matchEnvironment(envs, 'https://EXAMPLE.com:443/a').environment.name, 'production');
  const nested = [{ name: 'production', base_url: 'https://x.com/' }, { name: 'preview', base_url: 'https://x.com/beta' }];
  assert.equal(matchEnvironment(nested, 'https://x.com/beta/page').environment.name, 'preview');
  assert.equal(matchEnvironment(nested, 'https://x.com/betamax').environment.name, 'production');
  for (const bad of ['about:blank', 'javascript:alert(1)', 'not a url', '', null, 42]) assert.equal(matchEnvironment(envs, bad), null);
  assert.equal(matchEnvironment(envs, new URL('https://example.com/x')).environment.name, 'production');
  assert.equal(matchEnvironment(envs, { href: 'https://example.com/x' }).environment.name, 'production', 'cross-global URL-like objects');
});

test('switchEnvironment keeps path below the prefix, query and fragment', () => {
  assert.equal(switchEnvironment(envs, 'http://localhost:5173/users/7?tab=a#top', 'production'), 'https://example.com/users/7?tab=a#top');
  assert.equal(switchEnvironment(envs, 'http://localhost:5173/users/7?tab=a#top', 'preview'), 'https://preview.example.net/app/users/7?tab=a#top');
  assert.equal(switchEnvironment(envs, 'https://preview.example.net/app/users/7', 'local'), 'http://localhost:5173/users/7');
  assert.equal(switchEnvironment(envs, 'https://preview.example.net/app', 'production'), 'https://example.com/');
  assert.equal(switchEnvironment(envs, 'https://example.com/', 'preview'), 'https://preview.example.net/app/');
  assert.equal(switchEnvironment(envs, 'https://example.com/a', 'production'), 'https://example.com/a');
  assert.equal(switchEnvironment(envs, 'https://example.com/a', 'nope'), null);
  assert.equal(switchEnvironment(envs, 'https://unrelated.test/a', 'local'), null);
  assert.equal(switchEnvironment([{ name: 'local', base_url: 'javascript:alert(1)' }, ...envs], 'https://example.com/a', 'local'), null);
});

test('isDeclaredLocalOrigin: only declared loopback origins', () => {
  const local = [...envs, { name: 'api', base_url: 'http://127.0.0.1:8787' }, { name: 'v6', base_url: 'http://[::1]:3000' }];
  assert.equal(isDeclaredLocalOrigin(local, 'http://localhost:5173/any/path?q'), true);
  assert.equal(isDeclaredLocalOrigin(local, 'http://127.0.0.1:8787/'), true);
  assert.equal(isDeclaredLocalOrigin(local, 'http://[::1]:3000/x'), true);
  assert.equal(isDeclaredLocalOrigin(local, 'http://localhost:5174/'), false);
  assert.equal(isDeclaredLocalOrigin(local, 'http://127.0.0.1:5173/'), false, 'localhost and 127.0.0.1 are distinct origins');
  assert.equal(isDeclaredLocalOrigin(local, 'https://localhost:5173/'), false);
  assert.equal(isDeclaredLocalOrigin(local, 'https://example.com/'), false, 'declared but not loopback');
  assert.equal(isDeclaredLocalOrigin([{ name: 'x', base_url: 'http://localhost.evil.com:5173' }], 'http://localhost.evil.com:5173/'), false);
  assert.equal(isDeclaredLocalOrigin([{ name: 'x', base_url: 'http://0.0.0.0:5173' }], 'http://0.0.0.0:5173/'), false);
  assert.equal(isDeclaredLocalOrigin([], 'http://localhost:5173/'), false);
  assert.equal(isDeclaredLocalOrigin(local, 'garbage'), false);
});

test('URL matching stays linear on long slash runs', () => {
  const url = `https://example.com/${'/'.repeat(200000)}a`;
  const start = performance.now();
  assert.equal(matchEnvironment(envs, url).environment.name, 'production');
  assert.equal(isDeclaredLocalOrigin(envs, url), false);
  assert.ok(performance.now() - start < 1000);
});
