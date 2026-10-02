/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. https://mozilla.org/MPL/2.0/ */
// Containers and routing (workstation-v1 §3).
import test from 'node:test';
import assert from 'node:assert/strict';
import {
  CONTAINER_COLORS, ContextsError, DEFAULT_SHARED_SITES, INTEGRATION_HOSTS, INTEGRATION_IDS, accountKeyForHost, isSharedSite, projectContainerStyle,
  routeForUrl, validateAccountLabel,
} from '../src/index.mjs';

const throwsCode = (fn, code, path) => assert.throws(fn, e => e instanceof ContextsError && e.code === code && (path === undefined || e.path === path), `${code} ${path ?? ''}`);
const project = (over = {}) => ({
  id: 'p_abcd', container: { user_context_id: 12 }, shared_sites: { hosts: [...DEFAULT_SHARED_SITES], confirmed: false },
  accounts: [{ key: 'vercel', label: 'Work Google' }, { key: '*.atlassian.net', label: 'Work Microsoft' }, { key: 'linear.app', label: 'Personal' }], ...over,
});

test('container colours and the per-project style', () => {
  assert.deepEqual(CONTAINER_COLORS, ['blue', 'turquoise', 'green', 'yellow', 'orange', 'red', 'pink', 'purple']);
  const a = projectContainerStyle('p_abcd');
  assert.deepEqual(a, projectContainerStyle('p_abcd'), 'deterministic');
  assert.equal(a.icon, 'briefcase');
  assert.ok(CONTAINER_COLORS.includes(a.color));
  assert.ok(Object.isFrozen(a));
  const used = new Set(Array.from({ length: 64 }, (_, i) => projectContainerStyle(`p_x${String(i).padStart(3, '0')}`).color));
  assert.ok(used.size >= 6, `colours spread across projects (${[...used]})`);
  for (const bad of ['', 'abcd', 'p_AB', 'p_ab', null, 7]) throwsCode(() => projectContainerStyle(bad), 'INVALID_INPUT', '$.projectId');
});

test('isSharedSite and routeForUrl', () => {
  const p = project();
  assert.equal(isSharedSite(p, 'github.com'), true);
  assert.equal(isSharedSite(p, 'GIST.GitHub.com'), true, '*.github.com, case-insensitive');
  assert.equal(isSharedSite(p, 'github.com.'), true);
  assert.equal(isSharedSite(p, 'evilgithub.com'), false);
  assert.equal(isSharedSite(p, 'github.com.evil.io'), false);
  assert.equal(isSharedSite(p, 'vercel.com'), false);
  assert.equal(isSharedSite({}, 'github.com'), false, 'no shared sites');
  assert.equal(isSharedSite(null, 'github.com'), false);
  const route = (url, proj = p) => { const r = routeForUrl({ project: proj, url, defaultUserContextId: 0 }); return [r.userContextId, r.reason]; };
  assert.deepEqual(route('https://vercel.com/acme/app'), [12, 'project']);
  assert.deepEqual(route('https://github.com/acme/app/pull/1'), [0, 'shared_site']);
  assert.deepEqual(route('http://localhost:5173/'), [12, 'project']);
  for (const url of ['about:blank', 'file:///etc/hosts', 'javascript:alert(1)', 'chrome://browser/content/browser.xhtml', 'not a url', '', null]) {
    assert.deepEqual(route(url), [0, 'not_web'], String(url));
  }
  assert.deepEqual(route('https://vercel.com/', project({ container: { user_context_id: null } })), [0, 'no_container']);
  assert.deepEqual(route('https://github.com/', project({ container: { user_context_id: null } })), [0, 'no_container']);
  assert.deepEqual(route('https://vercel.com/', null), [0, 'no_container']);
  assert.deepEqual(routeForUrl({ project: p, url: new URL('https://x.io/'), defaultUserContextId: 5 }), { userContextId: 12, reason: 'project' }, 'URL objects');
  for (const d of [-1, 1.5, '0', undefined]) throwsCode(() => routeForUrl({ project: p, url: 'https://x.io', defaultUserContextId: d }), 'INVALID_INPUT', '$.defaultUserContextId');
});

test('INTEGRATION_HOSTS and accountKeyForHost', () => {
  assert.deepEqual(Object.keys(INTEGRATION_HOSTS), INTEGRATION_IDS);
  assert.ok(Object.isFrozen(INTEGRATION_HOSTS.vercel));
  const p = project();
  const key = h => accountKeyForHost(p, h);
  assert.equal(key('vercel.com'), 'vercel');
  assert.equal(key('Vercel.com'), 'vercel');
  assert.equal(key('dashboard.convex.dev'), 'convex');
  assert.equal(key('docs.convex.dev'), null, 'only the dashboard host');
  assert.equal(key('dashboard.stripe.com'), 'stripe');
  assert.equal(key('acme.sentry.io'), 'sentry');
  assert.equal(key('console.firebase.google.com'), 'firebase');
  assert.equal(key('team.atlassian.net'), '*.atlassian.net', 'account host patterns');
  assert.equal(key('linear.app'), 'linear.app');
  assert.equal(key('github.com'), null);
  assert.equal(key(''), null);
  assert.equal(accountKeyForHost(null, 'fly.io'), 'fly', 'integration hosts need no project');
  assert.equal(accountKeyForHost({ accounts: 'x' }, 'linear.app'), null);
});

test('validateAccountLabel', () => {
  assert.equal(validateAccountLabel('  wout@company Google  '), 'wout@company Google');
  assert.equal(validateAccountLabel('x'.repeat(80)).length, 80);
  for (const bad of ['', '  ', 'x'.repeat(81), 'a\u0000b', 'a\nb', 'a\u009fb', null, 1]) throwsCode(() => validateAccountLabel(bad), 'INVALID_INPUT');
});
