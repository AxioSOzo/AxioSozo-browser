/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. https://mozilla.org/MPL/2.0/ */
import test from "node:test";
import assert from "node:assert/strict";
import * as core from "../../../packages/contexts/src/index.mjs";
import { createProjectArrival, ARRIVAL_LIMITS } from "../chrome/ProjectArrival.sys.mjs";

const URL = "http://127.0.0.1:5173/health";
const BASE = "/Volumes/T9/Code";
const ROOT = `${BASE}/synthetic-é-猫-🔥`;
const CWD = `${ROOT}/apps/web`;
const WAIT = Symbol("blocked raw read");
const bytes = value => new TextEncoder().encode(value);
const buffer = value => Uint8Array.from(value).buffer;
const deferred = () => { let resolve; const promise = new Promise(done => { resolve = done; }); return { promise, resolve }; };
const listen = "p42\nu501\nn127.0.0.1:5173\n";
const cwd = `p42\nfcwd\nn${CWD}\n`;
const basic = () => [{ stdout: [bytes("501\n")] }, { stdout: [bytes(listen)] }, { stdout: [bytes(cwd)] }, { stdout: [bytes(cwd)] }];

function runtimeFor(specs) {
  const calls = [], children = [];
  return { calls, children, async call(options) {
    calls.push(options);
    const spec = specs.shift();
    assert.ok(spec, "fixed synthetic subprocess response exists");
    if (spec.spawn) await spec.spawn.promise;
    const exited = deferred();
    const child = { killed: 0, waited: 0, closedStdin: 0 };
    const pipe = values => {
      const input = [...values];
      const pending = new Set();
      let closed = false;
      return { reads: 0, closes: [], stringReads: 0,
        async read() {
          this.reads++;
          const value = closed || !input.length ? new Uint8Array(0) : input.shift();
          if (value === WAIT) {
            const done = deferred(); pending.add(done);
            spec.blocked?.resolve(child);
            await done.promise; pending.delete(done);
            return new ArrayBuffer(0);
          }
          if (value instanceof Error) throw value;
          spec.onRead?.(value, child);
          return buffer(value);
        },
        async readString() { this.stringReads++; throw new Error("native readString must never be used"); },
        async close(force) { this.closes.push(force); closed = true; for (const item of pending) item.resolve(); },
      };
    };
    child.stdout = pipe(spec.stdout ?? []);
    child.stderr = pipe(spec.stderr ?? []);
    child.stdin = { async close() { child.closedStdin++; } };
    child.wait = async () => { child.waited++; return exited.promise; };
    child.kill = async timeout => { assert.equal(timeout, 250); child.killed++; exited.resolve({ exitCode: -9 }); return exited.promise; };
    if (!spec.hang) exited.resolve({ exitCode: spec.exitCode ?? 0 });
    children.push(child); spec.ready?.resolve(child);
    return child;
  } };
}
function fsFor() {
  const directories = new Set([BASE, ROOT, `${ROOT}/apps`, CWD]);
  const calls = [];
  const type = path => directories.has(path) || path === `${ROOT}/.git` ? { type: "directory" } : null;
  return { calls, async realpath(path) { calls.push(["realpath", path]); if (!type(path)) throw new Error("synthetic missing"); return path; },
    async stat(path) { calls.push(["stat", path]); return type(path); },
    async lstat(path) { calls.push(["lstat", path]); return type(path); },
  };
}
function make(specs = basic(), options = {}) {
  const runtime = runtimeFor(specs), fs = fsFor();
  const arrival = createProjectArrival({ runtime, fs, core, home: null, roots: [BASE], ...options });
  return { runtime, fs, arrival, discover: settings => arrival.discover(URL, { isPrivate: false, ...settings }) };
}
function assertRetired(child) {
  assert.ok(child.waited >= 1, "owner waits for child");
  assert.equal(child.killed, 1, "failed child is killed exactly once");
  assert.deepEqual(child.stdout.closes, [true]);
  assert.deepEqual(child.stderr.closes, [true]);
}
function splitScalarText(text) {
  return [...bytes(text)].map(byte => Uint8Array.of(byte));
}

test("native 2/3/4-byte scalars split byte by byte preserve the entire CWD", async () => {
  const specs = basic(); specs[2].stdout = splitScalarText(cwd); specs[3].stdout = splitScalarText(cwd);
  const { discover, runtime } = make(specs);
  assert.deepEqual(await discover(), { kind: "new", root: ROOT, name: "synthetic-é-猫-🔥" });
  for (const child of runtime.children) {
    assert.equal(child.stdout.stringReads, 0); assert.equal(child.stderr.stringReads, 0);
    assert.equal(child.killed, 0); assert.equal(child.waited, 1);
  }
});

test("a decoded-empty UTF-8 lead is not raw EOF and cannot authorize early metadata", async () => {
  const specs = basic();
  const encoded = bytes(cwd), at = encoded.indexOf(0xc3);
  specs[2].stdout = [encoded.slice(0, at), encoded.slice(at, at + 1), encoded.slice(at + 1)];
  let sawLead = false;
  const h = make(specs);
  specs[2].onRead = value => {
    if (value.length === 1 && value[0] === 0xc3) { sawLead = true; assert.equal(h.fs.calls.length, 0); }
  };
  assert.equal((await h.discover()).root, ROOT);
  assert.equal(sawLead, true);
});

test("legacy decoded-only pipes fail closed and are retired", async () => {
  const h = make(basic());
  const original = h.runtime.call;
  h.runtime.call = async options => { const child = await original(options); delete child.stdout.read; return child; };
  assert.equal(await h.discover(), null);
  assert.equal(h.fs.calls.length, 0); assertRetired(h.runtime.children[0]);
});

test("malformed UTF-8 CWD cannot be converted to another folder", async () => {
  for (const malformed of [[0x80], [0xc0, 0xaf], [0xed, 0xa0, 0x80], [0xf4, 0x90, 0x80, 0x80]]) {
    const specs = basic(); specs[2].stdout = [bytes(`p42\nfcwd\nn${BASE}/synthetic-`), Uint8Array.from(malformed), bytes("\n")];
    const h = make(specs);
    assert.equal(await h.discover(), null); assert.equal(h.fs.calls.length, 0); assertRetired(h.runtime.children[2]);
  }
});

test("truncated stdout scalar at raw EOF rejects before any metadata", async () => {
  const specs = basic(); specs[2].stdout = [bytes(`p42\nfcwd\nn${BASE}/synthetic-`), Uint8Array.of(0xf0, 0x9f)];
  const h = make(specs);
  assert.equal(await h.discover(), null); assert.equal(h.fs.calls.length, 0); assertRetired(h.runtime.children[2]);
});

test("truncated stderr scalar rejects even with complete successful stdout", async () => {
  const specs = basic(); specs[1].stderr = [Uint8Array.of(0xe2, 0x82)];
  const h = make(specs);
  assert.equal(await h.discover(), null); assert.equal(h.fs.calls.length, 0); assertRetired(h.runtime.children[1]);
});

test("valid split Unicode stderr drains without leaking into an offer", async () => {
  const specs = basic(); specs[1].stderr = splitScalarText("synthetic diagnostic é猫🔥");
  const h = make(specs);
  assert.deepEqual(await h.discover(), { kind: "new", root: ROOT, name: "synthetic-é-猫-🔥" });
});

test("1MiB stdout cap includes raw bytes cumulatively across all four commands", async () => {
  const total = basic().reduce((sum, spec) => sum + spec.stdout[0].byteLength, 0);
  for (const excess of [0, 1]) {
    const specs = basic();
    specs[1].stdout.unshift(bytes(`z${"x".repeat(ARRIVAL_LIMITS.stdoutBytes - total - 2 + excess)}\n`));
    const h = make(specs);
    const offer = await h.discover();
    if (!excess) assert.equal(offer.root, ROOT);
    else { assert.equal(offer, null); assertRetired(h.runtime.children.at(-1)); }
  }
});

test("16KiB stderr cap includes raw bytes cumulatively across commands", async () => {
  for (const excess of [0, 1]) {
    const specs = basic(); specs[0].stderr = [bytes("x".repeat(8000))];
    specs[1].stderr = [bytes("x".repeat(ARRIVAL_LIMITS.stderrBytes - 8000 + excess))];
    const h = make(specs);
    if (!excess) assert.equal((await h.discover()).root, ROOT);
    else { assert.equal(await h.discover(), null); assert.equal(h.fs.calls.length, 0); assertRetired(h.runtime.children[1]); }
  }
});

test("BOM bytes count against the raw stderr budget", async () => {
  const specs = basic(); specs[0].stderr = [Uint8Array.of(0xef, 0xbb, 0xbf), bytes("x")];
  const h = make(specs, { maxStderrBytes: 3 });
  assert.equal(await h.discover(), null); assert.equal(h.fs.calls.length, 0); assertRetired(h.runtime.children[0]);
});

test("abort after a UTF-8 lead closes pending raw pipes, kills and waits", async () => {
  const blocked = deferred(), specs = [{ stdout: [Uint8Array.of(0xc3), WAIT], stderr: [WAIT], hang: true, blocked }];
  const h = make(specs), abort = new AbortController();
  const result = h.discover({ signal: abort.signal });
  await blocked.promise; abort.abort();
  assert.equal(await result, null); assert.equal(h.fs.calls.length, 0); assertRetired(h.runtime.children[0]);
});

test("deadline after decoded-empty lead does not wait for raw EOF", async () => {
  const h = make([{ stdout: [Uint8Array.of(0xf0), WAIT], stderr: [WAIT], hang: true }], { timeoutMs: 10 });
  assert.equal(await h.discover(), null); assert.equal(h.fs.calls.length, 0); assertRetired(h.runtime.children[0]);
});

test("normal exit still drains all buffered raw Unicode before completion", async () => {
  const specs = basic(); specs[2].stdout = splitScalarText(cwd); specs[3].stdout = splitScalarText(cwd);
  const h = make(specs);
  assert.equal((await h.discover()).root, ROOT);
  assert.equal(h.runtime.children[2].stdout.reads, bytes(cwd).length + 1);
});

test("raw pipe read failure is retired without any metadata", async () => {
  const h = make([{ stdout: [new Error("invented raw pipe failure")], stderr: [WAIT], hang: true }]);
  assert.equal(await h.discover(), null); assert.equal(h.fs.calls.length, 0); assertRetired(h.runtime.children[0]);
});

test("late native child after abort is still adopted, closed, killed and waited", async () => {
  const spawn = deferred(), ready = deferred();
  const h = make([{ spawn, ready, stdout: [WAIT], stderr: [WAIT], hang: true }]);
  const abort = new AbortController(), result = h.discover({ signal: abort.signal });
  while (!h.runtime.calls.length) await Promise.resolve();
  abort.abort(); assert.equal(await result, null);
  spawn.resolve(); await ready.promise;
  await new Promise(resolve => setImmediate(resolve));
  assert.equal(h.fs.calls.length, 0); assertRetired(h.runtime.children[0]);
});


test("64-byte UID-local raw cap retires an overlong stream before blocked stderr", async () => {
  const h = make([{ stdout: [bytes("5".repeat(64)), bytes("5"), WAIT], stderr: [WAIT], hang: true }]);
  assert.equal(await h.discover(), null); assert.equal(h.fs.calls.length, 0); assertRetired(h.runtime.children[0]);
  assert.equal(h.runtime.children[0].stdout.reads, 2, "raw cap fires before reading the blocked tail");
});
