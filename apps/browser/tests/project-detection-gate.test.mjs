import test from 'node:test';
import assert from 'node:assert/strict';
import { createProjectDetection } from '../chrome/ProjectDetection.sys.mjs';
const core = await import(new URL('../../../packages/contexts/src/index.mjs', import.meta.url));

// Entirely invented in-memory paths. No real files, profile or processes.
function fixture({ canonical = '/invented/projects/shop', allowCanonicalRoot } = {}) {
  const root = '/invented/chosen/shop';
  const calls = { stat: 0, rootMetadata: 0, fileMetadata: 0, presence: 0, list: 0, read: 0 };
  const identity = { device: '1', inode: '17' };
  const fs = {
    join: (base, relative) => `${base}/${relative}`,
    basename: path => path.split('/').at(-1),
    async lstat(path) { return path === root ? { type: 'symlink', size: 0 } : null; },
    async realpath(path) { if (path === root) return canonical; if (path === canonical) return canonical; throw new Error('ENOENT'); },
    async stat(path) { calls.stat++; assert.equal(path, canonical); return { type: 'directory', size: 0 }; },
    async read() { throw new Error('PLAIN_READ_MUST_NOT_BE_USED'); },
    async listDirectory() { throw new Error('PLAIN_LIST_MUST_NOT_BE_USED'); },
  };
  const reader = {
    async rootMetadata(path) { calls.rootMetadata++; assert.equal(path, canonical); return { type: 'directory', size: 0, identity }; },
    async fileMetadata() { calls.fileMetadata++; throw new Error('NO_SYNTHETIC_FILE'); },
    async presenceMetadata() { calls.presence++; return null; },
    async listContained() { calls.list++; throw new Error('NO_SYNTHETIC_DIRECTORY'); },
    async readContained() { calls.read++; throw new Error('NO_SYNTHETIC_CONTENT'); },
  };
  const options = { fs, reader, core, clock: () => 17 };
  if (allowCanonicalRoot !== undefined) options.allowCanonicalRoot = allowCanonicalRoot;
  return { root, canonical, calls, detector: createProjectDetection(options) };
}

const noReaderOperations = calls => assert.deepEqual(calls,
  { stat: 0, rootMetadata: 0, fileMetadata: 0, presence: 0, list: 0, read: 0 });

test('a newly resolved denied target is rejected before stat, metadata, listing or content', async () => {
  const seen = [];
  const f = fixture({ canonical: '/invented/settings/private', allowCanonicalRoot: path => {
    seen.push(path); return !path.startsWith('/invented/settings/');
  } });
  await assert.rejects(f.detector.detect(f.root), error => error.code === 'ROOT_DENIED');
  assert.deepEqual(seen, ['/invented/settings/private']);
  noReaderOperations(f.calls);
});

test('a changed arrival canonical target preserves the privileged ROOT_CHANGED refusal before opening', async () => {
  const f = fixture({ canonical: '/invented/projects/other', allowCanonicalRoot: path => {
    if (path !== '/invented/projects/shop') throw Object.assign(new Error('ROOT_CHANGED'), { code: 'ROOT_CHANGED' });
    return true;
  } });
  await assert.rejects(f.detector.detect(f.root), error => error.code === 'ROOT_CHANGED');
  noReaderOperations(f.calls);
});

test('only literal true grants canonical admission; resolved promises and truthy values fail closed', async () => {
  for (const decision of [false, null, undefined, 1, 'true', {}, Promise.resolve(true)]) {
    const f = fixture({ allowCanonicalRoot: () => decision });
    await assert.rejects(f.detector.detect(f.root), error => error.code === 'ROOT_DENIED');
    noReaderOperations(f.calls);
  }
});

test('an admitted canonical root is checked before metadata and again before the final result', async () => {
  const seen = [];
  const f = fixture({ allowCanonicalRoot: path => { seen.push({ path, metadataBefore: f.calls.rootMetadata }); return true; } });
  const result = await f.detector.detect(f.root);
  assert.equal(result.canonicalRoot, f.canonical);
  assert.equal(result.draft.version, 3);
  assert.equal(seen.length, 2);
  assert.deepEqual(seen.map(check => check.path), [f.canonical, f.canonical]);
  assert.equal(seen[0].metadataBefore, 0);
  assert.ok(seen[1].metadataBefore > 0);
  assert.equal(f.calls.rootMetadata, seen[1].metadataBefore + 1, "only the final identity check follows final admission");
  assert.equal(f.calls.read, 0);
});

test('revoked final admission refuses the result before final metadata', async () => {
  let checks = 0, metadataAtRefusal = null;
  const f = fixture({ allowCanonicalRoot: () => {
    if (++checks === 1) return true;
    metadataAtRefusal = f.calls.rootMetadata;
    return false;
  } });
  await assert.rejects(f.detector.detect(f.root), error => error.code === 'ROOT_DENIED');
  assert.equal(checks, 2);
  assert.ok(metadataAtRefusal > 0);
  assert.equal(f.calls.rootMetadata, metadataAtRefusal, "refused final admission performs no further root metadata operation");
  assert.equal(f.calls.read, 0);
});

test('omitting admission preserves the generic detector API', async () => {
  const f = fixture();
  const result = await f.detector.detect(f.root);
  assert.equal(result.canonicalRoot, f.canonical);
  assert.equal(result.draft.version, 3);
});

test('a non-function admission dependency is rejected at construction', () => {
  assert.throws(() => fixture({ allowCanonicalRoot: true }), error => error instanceof TypeError && error.message === 'allowCanonicalRoot');
});
