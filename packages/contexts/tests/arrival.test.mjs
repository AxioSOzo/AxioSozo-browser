/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. https://mozilla.org/MPL/2.0/ */
// Arrival without a form and surface matching (workstation-v1 §4, §4.1).
import test from 'node:test';
import assert from 'node:assert/strict';
import {
  ContextsError, LSOF_CWD_ARGS, LSOF_LISTEN_ARGS, arrivalOffer, chooseArrivalRoot, loopbackPort, matchSurfaceForUrl, parseLsofCwd, parseLsofListen, rootCandidates,
} from '../src/index.mjs';

const throwsCode = (fn, code, path) => assert.throws(fn, e => e instanceof ContextsError && e.code === code && (path === undefined || e.path === path), `${code} ${path ?? ''}`);

test('loopbackPort: localhost, 127.0.0.1 and [::1] only', () => {
  const cases = [
    ['http://localhost:5173/x', 5173], ['https://localhost/', 443], ['http://127.0.0.1/', 80], ['http://[::1]:1420', 1420], ['HTTP://LOCALHOST:3000', 3000],
    ['http://0.0.0.0:5173/', null], ['http://localhost.evil.io:5173/', null], ['http://127.0.0.2:5173/', null], ['http://192.168.1.2:5173/', null],
    ['ws://localhost:5173/', null], ['file:///tmp', null], ['about:blank', null], ['not a url', null], ['', null], [null, null], [42, null],
  ];
  for (const [url, port] of cases) assert.equal(loopbackPort(url), port, String(url));
  assert.equal(loopbackPort(new URL('http://localhost:8080')), 8080);
});

test('lsof argument arrays are fixed; port and pid validated', () => {
  assert.deepEqual(LSOF_LISTEN_ARGS(5173), ['-nP', '-a', '-iTCP:5173', '-sTCP:LISTEN', '-F', 'pun']);
  assert.deepEqual(LSOF_CWD_ARGS(4242), ['-nP', '-a', '-p', '4242', '-d', 'cwd', '-F', 'pn']);
  assert.ok(Object.isFrozen(LSOF_LISTEN_ARGS(1)));
  for (const bad of [0, 65536, 1.5, '5173', '5173 -c x', -1, null]) throwsCode(() => LSOF_LISTEN_ARGS(bad), 'INVALID_INPUT', '$.port');
  for (const bad of [0, -1, 1.5, '42', 2147483648, null]) throwsCode(() => LSOF_CWD_ARGS(bad), 'INVALID_INPUT', '$.pid');
});

test('parseLsofListen: own uid, loopback or any-address listeners, unique, at most 8', () => {
  const text = [
    'p4242', 'u501', 'f23', 'n127.0.0.1:5173', 'f24', 'n[::1]:5173',
    'p5000', 'u0', 'f3', 'n*:5173',
    'p6000', 'u501', 'f9', 'n192.168.1.5:5173',
    'p7000', 'u501', 'f9', 'n*:5173',
    'p8000', 'u501', 'f9', 'nlocalhost:5173',
    'pabc', 'u501', 'n*:5173', 'p0', 'u501', 'n*:5173',
    'p9000', 'u5010', 'n*:5173',
  ].join('\n');
  assert.deepEqual(parseLsofListen(text, { uid: 501 }), [{ pid: 4242 }, { pid: 7000 }, { pid: 8000 }]);
  assert.deepEqual(parseLsofListen(text, { uid: 0 }), [{ pid: 5000 }]);
  const many = Array.from({ length: 20 }, (_, i) => `p${100 + i}\nu501\nn*:3000`).join('\n');
  assert.equal(parseLsofListen(many, { uid: 501 }).length, 8);
  for (const hostile of [null, 7, '', '\u0000'.repeat(10), 'n*:1\nu501', 'p1\r\nu501\r\nn*:1\r\n', 'p'.repeat(2e6)]) assert.doesNotThrow(() => parseLsofListen(hostile, { uid: 501 }));
  assert.deepEqual(parseLsofListen('p1\r\nu501\r\nn*:1\r\n', { uid: 501 }), [{ pid: 1 }], 'CRLF tolerated');
  throwsCode(() => parseLsofListen('', {}), 'INVALID_INPUT', '$.uid');
});

test('parseLsofCwd: the n of the fcwd entry', () => {
  assert.equal(parseLsofCwd('p4242\nfcwd\nn/Users/me/Code/app\n'), '/Users/me/Code/app');
  assert.equal(parseLsofCwd('p4242\nftxt\nn/usr/bin/node\nfcwd\nn/Users/me/Code/my app\n'), '/Users/me/Code/my app');
  assert.equal(parseLsofCwd('p1\nfcwd\nnrelative/path\n'), null);
  assert.equal(parseLsofCwd(`p1\nfcwd\nn/${'a'.repeat(4096)}\n`), null);
  assert.equal(parseLsofCwd('p1\nfcwd\nn/a\u0000b\n'), null);
  assert.equal(parseLsofCwd('p1\nftxt\nn/x\n'), null);
  for (const hostile of [null, 7, '', 'n/x', 'fcwd']) assert.equal(parseLsofCwd(hostile), null);
});

test('rootCandidates: cwd and ancestors inside home, deepest first, at most 6', () => {
  const home = '/Users/me';
  assert.deepEqual(rootCandidates('/Users/me/Code/app/packages/web', { home }), ['/Users/me/Code/app/packages/web', '/Users/me/Code/app/packages', '/Users/me/Code/app', '/Users/me/Code']);
  assert.deepEqual(rootCandidates('/Users/me/a/b/c/d/e/f/g/h', { home }).length, 6);
  assert.deepEqual(rootCandidates('/Users/me/Code/app/', { home: '/Users/me/' }), ['/Users/me/Code/app', '/Users/me/Code']);
  assert.deepEqual(rootCandidates('/Users/me', { home }), [], 'never home itself');
  assert.deepEqual(rootCandidates('/Users/meadow/x', { home }), [], 'a sibling with the same prefix is outside home');
  assert.deepEqual(rootCandidates('/Volumes/Work/Code/app', { home }), [], 'outside home');
  assert.deepEqual(rootCandidates('/', { home }), []);
  assert.deepEqual(rootCandidates('/Users/me/../other/x', { home }), [], '.. is refused');
  assert.deepEqual(rootCandidates('relative/x', { home }), []);
  assert.deepEqual(rootCandidates('/Users/me/x', { home: '/' }), [], 'home "/" is ignored');
  assert.deepEqual(rootCandidates('/Users/me/x', {}), []);
  // Optional extra roots (a projects volume) follow the same rules.
  assert.deepEqual(rootCandidates('/Volumes/Work/Code/app/src', { home, roots: ['/Volumes/Work/Code'] }), ['/Volumes/Work/Code/app/src', '/Volumes/Work/Code/app']);
  assert.deepEqual(rootCandidates('/Volumes/Work/Code', { home, roots: ['/Volumes/Work/Code'] }), []);
});

test('chooseArrivalRoot: nearest .git dir or file, else the deepest candidate', () => {
  const c = ['/Users/me/Code/app/packages/web', '/Users/me/Code/app/packages', '/Users/me/Code/app', '/Users/me/Code'];
  assert.equal(chooseArrivalRoot(c, { '/Users/me/Code/app/.git': 'dir' }), '/Users/me/Code/app');
  assert.equal(chooseArrivalRoot(c, { '/Users/me/Code/app/.git': 'dir', '/Users/me/Code/app/packages/web/.git': 'file' }), '/Users/me/Code/app/packages/web', 'worktree .git file');
  assert.equal(chooseArrivalRoot(c, { '/Users/me/Code/app/.git': 'other' }), c[0]);
  assert.equal(chooseArrivalRoot(c, null), c[0]);
  assert.equal(chooseArrivalRoot([], {}), null);
  assert.equal(chooseArrivalRoot(null, {}), null);
});

test('arrivalOffer: known project (exact or containing root) or a new one named after the folder', () => {
  const projects = [{ id: 'p_mono', root: '/Users/me/Code/mono' }, { id: 'p_web1', root: '/Users/me/Code/mono/apps/web' }, { id: 'p_othr', root: '/Users/me/Code/other' }];
  const url = 'http://localhost:5173/';
  assert.deepEqual(arrivalOffer({ url, root: '/Users/me/Code/mono', projects }), { kind: 'known', project_id: 'p_mono' });
  assert.deepEqual(arrivalOffer({ url, root: '/Users/me/Code/mono/apps/web/src', projects }), { kind: 'known', project_id: 'p_web1' }, 'the most specific project');
  assert.deepEqual(arrivalOffer({ url, root: '/Users/me/Code/mono/packages/ui', projects }), { kind: 'known', project_id: 'p_mono' });
  assert.deepEqual(arrivalOffer({ url, root: '/Users/me/Code/monolith', projects }), { kind: 'new', root: '/Users/me/Code/monolith', name: 'monolith' });
  assert.deepEqual(arrivalOffer({ url, root: '/Users/me/Code/new app/', projects: null }), { kind: 'new', root: '/Users/me/Code/new app', name: 'new app' });
  assert.equal(arrivalOffer({ url: 'https://example.com/', root: '/Users/me/Code/mono', projects }), null, 'loopback URLs only');
  for (const root of ['/', 'relative', '', null, '/a/../b']) assert.equal(arrivalOffer({ url, root, projects }), null, String(root));
  assert.ok(Object.isFrozen(arrivalOffer({ url, root: '/Users/me/x', projects })));
});

test('matchSurfaceForUrl: forge owner/repo and Vercel team/project', () => {
  const surfaces = (...s) => ({ surfaces: s.map(([name, url, kind]) => ({ name, url, kind })) });
  const projects = [
    { id: 'p_one1', manifest: surfaces(['Repository', 'https://github.com/Acme/App', 'repository'], ['Vercel', 'https://vercel.com/acme-team/app-web', 'hosting']) },
    { id: 'p_two2', manifest: surfaces(['Repository', 'https://gitlab.com/group/sub/tool', 'repository'], ['Vercel', 'https://vercel.com/dashboard', 'hosting']) },
    { id: 'p_thr3', manifest: surfaces(['Repository', 'https://github.com/acme/app', 'repository']) },
    { id: 'p_fou4', manifest: surfaces(['Repository', 'https://bitbucket.org/team/repo', 'repository']) },
  ];
  const m = url => { const r = matchSurfaceForUrl(projects, url); return r && [r.project_id, r.surface.url]; };
  assert.deepEqual(m('https://github.com/acme/app/pull/12'), ['p_one1', 'https://github.com/Acme/App'], 'case-insensitive; ambiguity → first project');
  assert.deepEqual(m('https://github.com/acme/app.git'), ['p_one1', 'https://github.com/Acme/App']);
  assert.deepEqual(m('https://gitlab.com/group/sub/-/issues'), ['p_two2', 'https://gitlab.com/group/sub/tool'], 'first two segments only');
  assert.deepEqual(m('https://bitbucket.org/team/repo/pull-requests'), ['p_fou4', 'https://bitbucket.org/team/repo']);
  assert.deepEqual(m('https://vercel.com/acme-team/app-web/deployments'), ['p_one1', 'https://vercel.com/acme-team/app-web']);
  assert.deepEqual(m('https://vercel.com/acme-team/app-web'), ['p_one1', 'https://vercel.com/acme-team/app-web']);
  for (const miss of ['https://vercel.com/acme-team/app-webx', 'https://vercel.com/dashboard', 'https://vercel.com/acme-team', 'https://github.com/acme', 'https://github.com/acme/other',
    'https://gist.github.com/acme/app', 'https://www.github.com/acme/app', 'https://codeberg.org/acme/app', 'javascript:alert(1)', '', null]) {
    assert.equal(m(miss), null, String(miss));
  }
  assert.equal(matchSurfaceForUrl(null, 'https://github.com/acme/app'), null);
  assert.equal(matchSurfaceForUrl([{ id: 'p_bad1', manifest: { surfaces: [{ url: 'nope', kind: 'repository' }, null] } }], 'https://github.com/acme/app'), null);
  assert.deepEqual(matchSurfaceForUrl([{ id: 'p_raw1', surfaces: [{ name: 'R', url: 'https://github.com/a/b', kind: 'repository' }] }], 'https://github.com/a/b').project_id, 'p_raw1');
});
