/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. https://mozilla.org/MPL/2.0/ */
import test from "node:test";
import assert from "node:assert/strict";
import * as core from "../../../packages/contexts/src/index.mjs";
import { createProjectArrival, ARRIVAL_LIMITS } from "../chrome/ProjectArrival.sys.mjs";

const URL = "http://localhost:5173/app";
const HOME = "/Users/synthetic";
const BASE = "/Volumes/T9/Code";
const ROOT = `${BASE}/harbor-suite`;
const CWD = `${ROOT}/apps/web`;
const listener = (pid = 42, uid = 501) => `p${pid}\nu${uid}\nn127.0.0.1:5173\n`;
const cwdText = (cwd = CWD, pid = 42) => `p${pid}\nfcwd\nn${cwd}\n`;
const deferred = () => { let resolve; const promise = new Promise(done => { resolve = done; }); return { promise, resolve }; };

function runtimeFor(specs = []) {
  const calls = [], children = [];
  const runtime = { calls, children,
    async call(options) {
      calls.push(options);
      const spec = specs.shift();
      if (!spec) throw new Error("unexpected subprocess");
      if (spec.spawn) await spec.spawn.promise;
      if (spec.throw) throw new Error("unavailable");
      const exited = deferred();
      const child = { killed: 0, waited: 0, stdinClosed: 0, stdout: null, stderr: null };
      const pipe = chunks => {
        const values = [...(chunks ?? [""])];
        const pending = new Set();
        let closed = false;
        return { reads: 0, closes: [], eof: false,
          async read() {
            this.reads++;
            if (closed) { this.eof = true; return new ArrayBuffer(0); }
            const value = values.length ? values.shift() : "";
            if (value === "HOLD") { const item = deferred(); pending.add(item); await item.promise; pending.delete(item); this.eof = true; return new ArrayBuffer(0); }
            if (value === "READ_ERROR") throw new Error("pipe failed");
            if (spec.readHook) await spec.readHook(this, value);
            if (value === "") this.eof = true;
            return new TextEncoder().encode(value).buffer;
          },
          async close(force) { this.closes.push(force); if (spec.hangCleanup) await new Promise(() => {}); closed = true; for (const item of pending) item.resolve(); } };
      };
      child.stdout = pipe(spec.stdout ?? [spec.text ?? ""]);
      child.stderr = pipe(spec.stderr ?? [""]);
      child.stdin = { close: async () => { child.stdinClosed++; } };
      child.wait = () => { child.waited++; return exited.promise; };
      child.kill = async timeout => {
        assert.equal(timeout, 250);
        child.killed++;
        if (spec.hangCleanup) await new Promise(() => {});
        exited.resolve({ exitCode: -9 });
        return exited.promise;
      };
      children.push(child);
      if (!spec.hang) exited.resolve({ exitCode: spec.exitCode ?? 0 });
      spec.ready?.resolve(child);
      return child;
    } };
  return runtime;
}

function fsFor({ dirs = [HOME, BASE, CWD], git = { [ROOT]: "directory" }, aliases = {}, hook } = {}) {
  const types = new Map(), calls = [];
  const addDir = path => { for (let current = path; current && current !== "/"; current = current.slice(0, current.lastIndexOf("/"))) types.set(current, "directory"); };
  dirs.forEach(addDir);
  for (const [root, type] of Object.entries(git)) { addDir(root); types.set(`${root}/.git`, type); }
  const canonical = path => {
    const alias = Object.keys(aliases).sort((a, b) => b.length - a.length).find(base => path === base || path.startsWith(`${base}/`));
    return alias ? `${aliases[alias]}${path.slice(alias.length)}` : path;
  };
  const fs = { calls, types, aliases,
    async realpath(path) {
      calls.push(["realpath", path]);
      await hook?.("realpath", path, fs);
      const resolved = canonical(path);
      if (!types.has(resolved)) throw new Error("missing");
      return resolved;
    },
    async stat(path) { calls.push(["stat", path]); await hook?.("stat", path, fs); const type = types.get(canonical(path)); return type ? { type } : null; },
    async lstat(path) { calls.push(["lstat", path]); await hook?.("lstat", path, fs); const type = types.get(path); return type ? { type } : null; },
    async read() { throw new Error("arrival must never read file contents"); },
    async listDirectory() { throw new Error("arrival must never enumerate folders"); } };
  return fs;
}
const standard = (...extra) => [{ text: "501\n" }, { text: listener() }, { text: cwdText() }, { text: cwdText() }, ...extra];
const make = (options = {}) => {
  const runtime = options.runtime ?? runtimeFor(standard());
  const fs = options.fs ?? fsFor();
  const arrival = createProjectArrival({ runtime, fs, core, home: HOME, roots: [BASE], ...options });
  return { arrival, runtime, fs, discover: (settings = {}) => arrival.discover(URL, { isPrivate: false, ...settings }) };
};
const assertStopped = runtime => {
  for (const child of runtime.children) {
    assert.ok(child.waited >= 1, "child was reaped");
    assert.equal(child.killed, 1, "failed child was killed");
    assert.deepEqual(child.stdout.closes, [true]);
    assert.deepEqual(child.stderr.closes, [true]);
  }
};

// No UI is modeled here: every offer is plain core metadata.
test("external configured root, deepest git metadata and exact own-UID selectors", async () => {
  const { discover, runtime, fs } = make();
  assert.deepEqual(await discover(), { kind: "new", root: ROOT, name: "harbor-suite" });
  assert.deepEqual(runtime.calls.map(({ command, arguments: args }) => [command, args]), [
    ["/usr/bin/id", ["-u"]],
    ["/usr/sbin/lsof", [...core.LSOF_LISTEN_ARGS(5173), "-u", "501"]],
    ["/usr/sbin/lsof", [...core.LSOF_CWD_ARGS(42), "-u", "501"]],
    ["/usr/sbin/lsof", [...core.LSOF_CWD_ARGS(42), "-u", "501"]],
  ]);
  for (const call of runtime.calls) assert.deepEqual(call, { command: call.command, arguments: call.arguments,
    environmentAppend: false, environment: { PATH: "/usr/bin:/bin:/usr/sbin", LANG: "C", LC_ALL: "C" }, stderr: "pipe" });
  for (const child of runtime.children) { assert.equal(child.killed, 0); assert.equal(child.waited, 1); assert.equal(child.stdinClosed, 1); assert.ok(child.stdout.eof && child.stderr.eof); }
  assert.ok(fs.calls.filter(([method]) => method === "lstat").every(([, path]) => path.endsWith("/.git")));
});

test("successful numeric UID is cached and serialized requests do not spawn duplicate id", async () => {
  const runtime = runtimeFor(standard({ text: listener() }, { text: cwdText() }, { text: cwdText() }));
  const { discover } = make({ runtime });
  const results = await Promise.all([discover(), discover()]);
  assert.ok(results.every(offer => offer?.root === ROOT));
  assert.equal(runtime.calls.filter(call => call.command === "/usr/bin/id").length, 1);
});

test("private, unknown privacy, canceled and credential URLs produce no process or filesystem work", async () => {
  const { arrival, runtime, fs } = make();
  const canceled = new AbortController(); canceled.abort();
  for (const options of [{}, { isPrivate: true }, { isPrivate: null }, { isPrivate: false, signal: canceled.signal }]) assert.equal(await arrival.discover(URL, options), null);
  for (const url of ["http://person:secret@localhost:5173", "https://person@github.com/acme/repo", "file:///a", "about:blank", "https://remote.invalid:5173", "http://0.0.0.0:5173", "not a url"]) assert.equal(await arrival.discover(url, { isPrivate: false }), null);
  assert.equal(runtime.calls.length, 0); assert.equal(fs.calls.length, 0);
});

test("known repository URL needs no subprocess or filesystem", async () => {
  const project = { id: "p_known", manifest: { surfaces: [{ kind: "repository", url: "https://github.com/acme/tool" }] } };
  const { arrival, runtime, fs } = make({ projects: [project] });
  assert.deepEqual(await arrival.discover("https://github.com/acme/tool/pull/7", { isPrivate: false }), { kind: "known", project_id: "p_known" });
  assert.equal(runtime.calls.length, 0); assert.equal(fs.calls.length, 0);
});

test("known loopback offer uses the most specific registered project", async () => {
  const { discover } = make({ projects: [{ id: "p_outer", root: BASE }, { id: "p_inner", root: ROOT }] });
  assert.deepEqual(await discover(), { kind: "known", project_id: "p_inner" });
});

test("UID zero is numeric and foreign-owner listeners never authorize filesystem probing", async () => {
  const runtime = runtimeFor([{ text: "0\n" }, { text: listener(42, 501) }]);
  const { discover, fs } = make({ runtime });
  assert.equal(await discover(), null);
  assert.deepEqual(runtime.calls[1].arguments.slice(-2), ["-u", "0"]);
  assert.equal(fs.calls.length, 0);
});

test("malformed UID and failing subprocess do not create an offer", async () => {
  for (const text of ["wout\n", "501x\n", "-1\n", "501\n502\n", "501 \n"]) {
    const runtime = runtimeFor([{ text }]);
    const { discover, fs } = make({ runtime });
    assert.equal(await discover(), null, text);
    assert.equal(runtime.calls.length, 1); assert.equal(fs.calls.length, 0);
  }
  for (const failed of [{ text: "501\n", exitCode: 1 }, { throw: true }]) assert.equal(await make({ runtime: runtimeFor([failed]) }).discover(), null);
});

test("native lsof sentinel failure refuses arrival before any filesystem inspection", async () => {
  const runtime = runtimeFor([{ text: "501\n" }, { text: "", exitCode: -9 }]);
  const { discover, fs } = make({ runtime });
  assert.equal(await discover(), null);
  assert.equal(runtime.calls.length, 2);
  assert.deepEqual(runtime.calls[1].arguments, [...core.LSOF_LISTEN_ARGS(5173), "-u", "501"]);
  assert.equal(fs.calls.length, 0);
  assert.equal(runtime.children[1].waited, 1);
  assertStopped({ children: runtime.children.slice(1) });
});

test("PID reuse across users remains ANDed with UID on CWD query and fails closed", async () => {
  const runtime = runtimeFor([{ text: "501\n" }, { text: listener() }, { text: "", exitCode: 1 }]);
  const { discover, fs } = make({ runtime });
  assert.equal(await discover(), null);
  assert.deepEqual(runtime.calls[2].arguments, [...core.LSOF_CWD_ARGS(42), "-u", "501"]);
  assert.equal(fs.calls.length, 0);
  assert.equal(runtime.children[2].killed, 1);
});

test("unexpected PID output and escaped lsof names cannot be interpreted as folders", async () => {
  for (const text of [cwdText(CWD, 43), cwdText(`${ROOT}/literal\\nname`), cwdText(`${ROOT}/literal^Mname`)]) {
    const { discover, fs } = make({ runtime: runtimeFor([{ text: "501\n" }, { text: listener() }, { text }]) });
    assert.equal(await discover(), null); assert.equal(fs.calls.length, 0);
  }
});

test("stdout cap counts UTF-8 bytes cumulatively and failure closes pipes and reaps child", async () => {
  const runtime = runtimeFor([{ text: "501\n" }, { stdout: ["é".repeat(20), "HOLD"], stderr: ["HOLD"], hang: true }]);
  const { discover, fs } = make({ runtime, maxStdoutBytes: 32 });
  assert.equal(await discover(), null); assert.equal(fs.calls.length, 0);
  assertStopped({ children: runtime.children.slice(1) });
});

test("stderr is drained concurrently, bounded, never included in an offer", async () => {
  const runtime = runtimeFor([{ text: "501\n" }, { stdout: ["HOLD"], stderr: ["error".repeat(20), "HOLD"], hang: true }]);
  const { discover, fs } = make({ runtime, maxStderrBytes: 24 });
  assert.equal(await discover(), null); assert.equal(fs.calls.length, 0);
  assertStopped({ children: runtime.children.slice(1) });
});

test("deadline closes blocked streams, kills and reaps without waiting for EOF", async () => {
  const runtime = runtimeFor([{ stdout: ["HOLD"], stderr: ["HOLD"], hang: true }]);
  const { discover, fs } = make({ runtime, timeoutMs: 15 });
  assert.equal(await discover(), null); assert.equal(fs.calls.length, 0); assertStopped(runtime);
});

test("abort during stream drain closes streams and kills/reaps child", async () => {
  const ready = deferred(), controller = new AbortController();
  const runtime = runtimeFor([{ stdout: ["HOLD"], stderr: ["HOLD"], hang: true, ready }]);
  const { discover } = make({ runtime });
  const offer = discover({ signal: controller.signal });
  await ready.promise; controller.abort();
  assert.equal(await offer, null); assertStopped(runtime);
});

test("child created after abort is still killed/reaped and no lsof is launched", async () => {
  const spawn = deferred(), ready = deferred(), controller = new AbortController();
  const runtime = runtimeFor([{ spawn, ready, stdout: ["HOLD"], stderr: ["HOLD"], hang: true }]);
  const { discover } = make({ runtime });
  const result = discover({ signal: controller.signal });
  while (!runtime.calls.length) await Promise.resolve();
  controller.abort(); assert.equal(await result, null);
  spawn.resolve(); await ready.promise;
  await new Promise(resolve => setImmediate(resolve));
  assert.equal(runtime.calls.length, 1); assertStopped(runtime);
});

test("normal process exit still drains buffered stdout and stderr before completion", async () => {
  const runtime = runtimeFor([{ stdout: ["5", "01", "\n", ""], stderr: ["bounded", "diagnostic", ""] }, { text: listener() }, { text: cwdText() }, { text: cwdText() }]);
  assert.equal((await make({ runtime }).discover()).root, ROOT);
  assert.equal(runtime.children[0].stdout.reads, 4); assert.equal(runtime.children[0].stderr.reads, 3);
});

test("outside base and same-prefix sibling roots cannot be selected", async () => {
  for (const cwd of ["/Volumes/T9/Codec/harbor-suite", "/opt/app"]) {
    const fs = fsFor({ dirs: [HOME, BASE, cwd], git: { [cwd]: "directory" } });
    const runtime = runtimeFor([{ text: "501\n" }, { text: listener() }, { text: cwdText(cwd) }]);
    assert.equal(await make({ fs, runtime }).discover(), null);
    assert.equal(fs.calls.filter(([method]) => method === "lstat").length, 0);
    assert.ok(!fs.calls.some(([method, path]) => method === "stat" && path === cwd));
  }
});

test("denied browser/system paths are rejected before filesystem probing", async () => {
  for (const cwd of [`${HOME}/Library/Application Support/Firefox/Profiles/synthetic`, "/System/synthetic", `${ROOT}/denied`, ...[".ssh", ".aws", ".gnupg", ".azure", ".kube", ".codex", ".claude"].map(name => `${HOME}/${name}/synthetic`)]) {
    const runtime = runtimeFor([{ text: "501\n" }, { text: listener() }, { text: cwdText(cwd) }]);
    const { discover, fs } = make({ runtime, deniedRoots: [`${ROOT}/denied`] });
    assert.equal(await discover(), null); assert.equal(fs.calls.length, 0);
  }
});

test("symlink cwd cannot escape allowed bases or canonical denied roots", async () => {
  for (const target of ["/opt/outside", `${HOME}/Library/Browser/private`]) {
    const fs = fsFor({ dirs: [HOME, BASE, target], git: {}, aliases: { [CWD]: target } });
    const runtime = runtimeFor([{ text: "501\n" }, { text: listener() }, { text: cwdText() }]);
    assert.equal(await make({ fs, runtime }).discover(), null);
    assert.equal(fs.calls.filter(([method]) => method === "lstat").length, 0);
  }
});

test("canonical configured bases support aliases and custom denied-root aliases", async () => {
  const alias = "/Volumes/ProjectAlias";
  const runtime = runtimeFor([{ text: "501\n" }, { text: listener() }, { text: cwdText(`${alias}/harbor-suite/apps/web`) }, { text: cwdText(`${alias}/harbor-suite/apps/web`) }]);
  const fs = fsFor({ aliases: { [alias]: BASE } });
  assert.equal((await make({ runtime, fs, roots: [alias] }).discover()).root, ROOT);
  const deniedAlias = "/Volumes/DeniedAlias";
  const blockedRuntime = runtimeFor([{ text: "501\n" }, { text: listener() }, { text: cwdText() }]);
  const blockedFs = fsFor({ aliases: { [deniedAlias]: ROOT } });
  assert.equal(await make({ runtime: blockedRuntime, fs: blockedFs, deniedRoots: [deniedAlias] }).discover(), null);
  assert.equal(blockedFs.calls.filter(([method]) => method === "lstat").length, 0);
});

test("git symlinks are ignored without following or reading them; regular worktree metadata wins", async () => {
  const fs = fsFor({ git: { [CWD]: "symlink", [ROOT]: "regular" } });
  const { discover } = make({ fs });
  assert.equal((await discover()).root, ROOT);
  assert.ok(!fs.calls.some(([method, path]) => method === "realpath" && path === `${CWD}/.git`));
});

test("multiple distinct roots fail closed while identical roots for several PIDs are one offer", async () => {
  const second = `${BASE}/inkline/apps/site`;
  const fs = fsFor({ dirs: [HOME, BASE, CWD, second], git: { [ROOT]: "directory", [`${BASE}/inkline`]: "directory" } });
  const runtime = runtimeFor([{ text: "501\n" }, { text: listener(42) + listener(43) }, { text: cwdText() }, { text: cwdText(second, 43) }]);
  assert.equal(await make({ fs, runtime }).discover(), null);
  const same = runtimeFor([{ text: "501\n" }, { text: listener(42) + listener(43) }, { text: cwdText() }, { text: cwdText(CWD, 43) }, { text: cwdText() }, { text: cwdText(CWD, 43) }]);
  assert.equal((await make({ runtime: same }).discover()).root, ROOT);
});

test("saturated PID results cannot hide an uninspected root; candidate probes remain capped", async () => {
  const runtime = runtimeFor([{ text: "501\n" }, { text: Array.from({ length: 9 }, (_, i) => listener(40 + i)).join("") }]);
  const { discover, fs } = make({ runtime });
  assert.equal(await discover(), null); assert.equal(runtime.calls.length, 2); assert.equal(fs.calls.length, 0);
  const deep = `${ROOT}/a/b/c/d/e/f/g/h`;
  const cappedFs = fsFor({ dirs: [HOME, BASE, deep], git: {} });
  const cappedRuntime = runtimeFor([{ text: "501\n" }, { text: listener() }, { text: cwdText(deep) }, { text: cwdText(deep) }]);
  assert.equal((await make({ fs: cappedFs, runtime: cappedRuntime }).discover()).root, deep);
  assert.equal(cappedFs.calls.filter(([method]) => method === "lstat").length, ARRIVAL_LIMITS.candidates);
});

test("process chdir or canonical cwd/base swap during checks invalidates the offer", async () => {
  const changed = runtimeFor([{ text: "501\n" }, { text: listener() }, { text: cwdText() }, { text: cwdText(`${ROOT}/other`) }]);
  assert.equal(await make({ runtime: changed }).discover(), null);
  let count = 0;
  const fs = fsFor({ dirs: [HOME, BASE, CWD, "/opt/swapped"], hook(method, path, state) {
    if (method === "lstat" && ++count === 2) state.aliases[CWD] = "/opt/swapped";
  } });
  assert.equal(await make({ fs }).discover(), null);
});

test("unavailable dependencies and metadata errors yield null", async () => {
  for (const options of [{ runtime: null }, { fs: null }, { core: null }, { home: "/", roots: [] }]) assert.equal(await make(options).discover(), null);
  const fs = fsFor({ hook(method) { if (method === "lstat") throw new Error("unreadable"); } });
  assert.equal(await make({ fs }).discover(), null);
});


test("unresponsive close, kill, wait and drains cannot make discovery cleanup hang", async () => {
  const runtime = runtimeFor([{ stdout: ["HOLD"], stderr: ["HOLD"], hang: true, hangCleanup: true }]);
  const { discover } = make({ runtime, timeoutMs: 15, cleanupMs: 10 });
  const result = await Promise.race([discover(), new Promise((_resolve, reject) => {
    const timer = setTimeout(() => reject(new Error("cleanup exceeded bound")), 500);
    timer.unref();
  })]);
  assert.equal(result, null);
  assertStopped(runtime);
});
