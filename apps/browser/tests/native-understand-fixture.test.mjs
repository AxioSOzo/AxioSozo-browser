// Ignored fake-process tests. No native executable, profile, Keychain or provider.
import test from "node:test";
import assert from "node:assert/strict";
import { createNativeUnderstandFixtureRuntime, understandFixturePaths,
  runUnderstandFixtureMetadata, parseUnderstandFixtureStat,
  UNDERSTAND_METADATA_ID, UNDERSTAND_METADATA_STAT, UNDERSTAND_METADATA_HASH, UNDERSTAND_METADATA_FORMAT,
  UNDERSTAND_FIXTURE_HASH_CODE } from "../chrome/NativeUnderstandFixtureRuntime.sys.mjs";
import { UNDERSTAND_FIXTURE_INPUTS, UNDERSTAND_FIXTURE_BINARIES,
  UNDERSTAND_FIXTURE_PYTHON } from "../chrome/UnderstandFixturePins.sys.mjs";
const root = "/Volumes/AxioSozoBuild/workstation/gui-fixtures/understand-0123456789abcdef0123456789abcdef";
const profile = "/Volumes/AxioSozoBuild/workstation/runtime/e626697ad91fe95c/plan4-understand-0123456789abcdef0123456789abcdef/gecko";
const unavailable = error => error?.code === "UNDERSTAND_FIXTURE_UNAVAILABLE";
const tick = async () => { for (let i = 0; i < 24; i++) await Promise.resolve(); };
function deferred() { let resolve, reject; const promise = new Promise((a, b) => { resolve = a; reject = b; }); return { promise, resolve, reject }; }
function manualTimers() {
  let clock = 10, serial = 0;
  const tasks = new Map();
  return { now: () => clock, tasks,
    setTimeout(fn, delay) { const id = ++serial; tasks.set(id, { fn, at: clock + delay }); return id; },
    clearTimeout(id) { tasks.delete(id); },
    async advance(ms) {
      clock += ms;
      for (let i = 0; i < 16; i++) {
        const due = [...tasks].filter(([, value]) => value.at <= clock).sort((a, b) => a[1].at - b[1].at);
        if (!due.length) break;
        for (const [id, value] of due) { if (tasks.delete(id)) value.fn(); }
        await tick();
      }
      await tick();
    } };
}
function fixtureRuntime() {
  const flags = { AXIOSOZO_UNDERSTAND_GUI_FIXTURE_ROOT: root,
    AXIOSOZO_SYNTHETIC_TEST: "1", AXIOSOZO_UNDERSTAND_GUI_FIXTURE: "1" };
  const calls = [], children = [], mutate = new Map();
  const timers = manualTimers();
  let currentProfile = profile, onSpawn = null;
  const paths = understandFixturePaths(root, profile);
  const inputPaths = new Map(UNDERSTAND_FIXTURE_INPUTS.map(x => [`${root}/${x.relative}`, x]));
  function info(path) {
    let value;
    if (inputPaths.has(path)) value = { uid: 501, links: 1, mode: "100400", size: 17, device: "42", inode: String(path.length) };
    else if ([UNDERSTAND_METADATA_ID, UNDERSTAND_METADATA_STAT, UNDERSTAND_METADATA_HASH].includes(path)
        || UNDERSTAND_FIXTURE_BINARIES.some(x => x.path === path)) value = { uid: 501, links: 1, mode: "100755", size: 17, device: "42", inode: String(path.length) };
    else {
      const owned = path === "/Volumes/AxioSozoBuild/workstation/gui-fixtures" || path === root || path.startsWith(`${root}/`)
        || path.startsWith("/Volumes/AxioSozoBuild/workstation/runtime/e626697ad91fe95c/plan4-understand-");
      value = { uid: owned ? 501 : 0, links: 2, mode: owned ? "40700" : "40755", size: 17, device: "42", inode: String(path.length) };
    }
    return { ...value, ...mutate.get(path) };
  }
  function child(text = "", overrides = {}) {
    const counters = { stdinClose: 0, stdoutClose: 0, stderrClose: 0, kill: 0, killGrace: [], wait: 0, writes: [] };
    const pipe = key => {
      const chunks = key === "stdout" ? [text, null] : [null];
      return { async read() { return new TextEncoder().encode(chunks.shift() ?? "").buffer; },
        async readString() { return chunks.shift() ?? null; }, async close() { counters[`${key}Close`]++; } };
    };
    const value = { pid: children.length + 1000, stdin: { async close() { counters.stdinClose++; }, async write(text) { counters.writes.push(text); } },
      stdout: pipe("stdout"), stderr: pipe("stderr"), async kill(grace) { counters.kill++; counters.killGrace.push(grace); }, async wait() { counters.wait++; return { exitCode: 0 }; }, ...overrides };
    children.push({ value, counters });
    return value;
  }
  const runtime = { env: name => flags[name], profilePath: () => currentProfile, timers,
    clock: timers.now, uuid: () => "synthetic-uuid", metadataCommandAvailable: () => true,
    async spawn(options) {
      calls.push(options);
      if (onSpawn) {
        const result = await onSpawn(options);
        if (result) return result;
      }
      if (options.command === UNDERSTAND_METADATA_ID) return child("501\n");
      if (options.command === UNDERSTAND_METADATA_STAT) return child(options.arguments.slice(2).map(path => {
        const x = info(path); return `${x.uid} ${x.links} ${x.mode} ${x.size} ${x.device} ${x.inode}\n`;
      }).join(""));
      if (options.command === UNDERSTAND_METADATA_HASH) return child(UNDERSTAND_FIXTURE_BINARIES.map(x => `${x.sha256} *${x.path}\n`).join(""));
      if (options.arguments[3] === "-c") return child([...UNDERSTAND_FIXTURE_BINARIES, ...UNDERSTAND_FIXTURE_INPUTS].map(x => x.sha256).join("\n") + "\n");
      return child();
    } };
  return { runtime, flags, calls, children, mutate, timers, paths, child,
    profile: value => { currentProfile = value; }, onSpawn: value => { onSpawn = value; } };
}
function transportOptions(paths) { return { command: paths.node, arguments: [paths.virtualHost, "serve"],
  environmentAppend: false, environment: { PATH: "/usr/bin:/bin", LANG: "C" }, stderr: "pipe" }; }
const hostCalls = h => h.calls.filter(x => x.command === UNDERSTAND_FIXTURE_PYTHON && x.arguments[3] !== "-c");

test("absent fixture request returns null without process imports or metadata", async () => {
  for (const request of [undefined, null, ""]) {
    const native = { env: () => request };
    assert.equal(await createNativeUnderstandFixtureRuntime({ runtime: native }), null);
  }
  const previous = globalThis.Services;
  let imports = 0;
  globalThis.Services = { env: { get: () => "" } };
  globalThis.ChromeUtils = { importESModule: () => { imports++; throw Error("forbidden"); } };
  try { assert.equal(await createNativeUnderstandFixtureRuntime(), null); assert.equal(imports, 0); }
  finally { globalThis.Services = previous; delete globalThis.ChromeUtils; }
});
test("path policy binds exact root and matching owned profile", () => {
  assert.equal(understandFixturePaths(root, profile).projectRoots[0], `${root}/projects/harbor`);
  assert(Object.isFrozen(understandFixturePaths(root, profile).projectRoots));
  for (const bad of [root + "/nested", root.replace("workstation", "zen"), root.replace("0123", "ABCD"), root + "\n", root.replace("gui-fixtures", "gui-fixtures/../gui-fixtures")])
    assert.throws(() => understandFixturePaths(bad, profile), unavailable);
  for (const bad of [profile + "/nested", profile.replace("0123", "1234"), "/Users/synthetic/profile", profile.replace("gecko", "gecko/../gecko")])
    assert.throws(() => understandFixturePaths(root, bad), unavailable);
});
test("invalid flags and profile refuse before process", async () => {
  for (const name of ["AXIOSOZO_SYNTHETIC_TEST", "AXIOSOZO_UNDERSTAND_GUI_FIXTURE"]) {
    for (const value of [undefined, "0", "true", 1]) {
      const h = fixtureRuntime(); h.flags[name] = value;
      await assert.rejects(createNativeUnderstandFixtureRuntime({ runtime: h.runtime }), unavailable);
      assert.equal(h.calls.length, 0);
    }
  }
  const h = fixtureRuntime(); h.profile(profile + "/nested");
  await assert.rejects(createNativeUnderstandFixtureRuntime({ runtime: h.runtime }), unavailable); assert.equal(h.calls.length, 0);
});
test("native metadata stat parser is exact and bounded", () => {
  assert.deepEqual(parseUnderstandFixtureStat("501 1 100400 17 42 63\n", 1),
    [{ uid: 501, links: 1, mode: 0o100400, size: 17, device: "42", inode: "63" }]);
  for (const text of ["501 1 100400 17 42 63", "501 1 100400 17 42 63\nextra\n", "501 0 100400 17 42 63\n",
      "4294967296 1 100400 17 42 63\n", "501 1 200400 17 42 63\n", "501 1 100400 9007199254740992 42 63\n", " ".repeat(4097)])
    assert.throws(() => parseUnderstandFixtureStat(text, 1), unavailable);
});
test("metadata command allowlist rejects arbitrary commands and target files", async () => {
  const h = fixtureRuntime();
  for (const [command, args] of [["/usr/bin/security", ["find-generic-password"]],
    [UNDERSTAND_METADATA_STAT, ["-f", UNDERSTAND_METADATA_FORMAT, "/Users/synthetic/.ssh"]],
    [UNDERSTAND_FIXTURE_PYTHON, ["-c", "print('unsafe')"]]])
    await assert.rejects(runUnderstandFixtureMetadata(h.runtime, command, args), unavailable);
  assert.equal(h.calls.length, 0);
});
test("full fake metadata admission exposes only fixed privileged fixture endpoint", async () => {
  const h = fixtureRuntime(), adapted = await createNativeUnderstandFixtureRuntime({ runtime: h.runtime });
  assert(Object.isFrozen(adapted)); assert(Object.isFrozen(adapted.fixturePaths));
  assert.deepEqual(Object.keys(adapted).sort(), ["env", "spawn", "timers", "uuid"]);
  assert.equal(adapted.env("AXIOSOZO_PROVIDER_NODE"), h.paths.node);
  assert.equal(adapted.env("AXIOSOZO_PROVIDER_HOST"), h.paths.virtualHost);
  for (const name of ["AXIOSOZO_BUILD_ROOT", "PATH", "HOME", "OPENAI_API_KEY", "AXIOSOZO_SYNTHETIC_TEST"]) assert.equal(adapted.env(name), "");
  assert.equal(hostCalls(h).length, 0);
  await adapted.spawn(transportOptions(h.paths));
  assert.equal(hostCalls(h).length, 1);
  const options = hostCalls(h)[0];
  assert.deepEqual(options.arguments, ["-I", "-S", "-B", h.paths.helper, "host", root, profile]);
  assert.deepEqual(options.environment, { LANG: "C", LC_ALL: "C", AXIOSOZO_SYNTHETIC_TEST: "1",
    AXIOSOZO_UNDERSTAND_GUI_FIXTURE: "1", AXIOSOZO_UNDERSTAND_GUI_FIXTURE_ROOT: root });
  assert.equal(options.environmentAppend, false); assert.equal(options.workdir, "/");
  assert(h.calls.every(x => !Object.hasOwn(x.environment, "HOME") && !Object.hasOwn(x.environment, "AXIOSOZO_BUILD_ROOT")));
});
test("symlink types, nonprivate modes, foreign UIDs, hardlinks and byte bounds refuse", async () => {
  const input = `${root}/${UNDERSTAND_FIXTURE_INPUTS[0].relative}`;
  const bad = [[root, { mode: "40755" }], [profile, { uid: 777 }], [`${root}/home`, { mode: "40770" }],
    [root + "/projects", { mode: "120700" }], [input, { links: 2 }], [input, { mode: "100600" }],
    [input, { uid: 0 }], [input, { size: 0 }], [input, { size: UNDERSTAND_FIXTURE_INPUTS[0].maxBytes + 1 }],
    [hPath(), { mode: "100777" }], ["/Volumes/AxioSozoBuild/toolchains", { mode: "120755" }]];
  function hPath() { return UNDERSTAND_FIXTURE_PYTHON; }
  for (const [path, change] of bad) {
    const h = fixtureRuntime(); h.mutate.set(path, change);
    await assert.rejects(createNativeUnderstandFixtureRuntime({ runtime: h.runtime }), unavailable);
    assert.equal(hostCalls(h).length, 0);
  }
});
test("hash mismatch and metadata replacement during hash refuse", async () => {
  for (const mode of ["hash", "identity", "permissions"]) {
    const h = fixtureRuntime();
    h.onSpawn(options => {
      if (options.arguments[3] !== "-c") return null;
      if (mode === "hash") return h.child("0".repeat(64) + "\n");
      h.mutate.set(h.paths.helper, mode === "identity" ? { inode: "99999" } : { mode: "100600" });
      return null;
    });
    await assert.rejects(createNativeUnderstandFixtureRuntime({ runtime: h.runtime }), unavailable);
    assert.equal(hostCalls(h).length, 0);
  }
});
test("directory size changes do not pretend frozen input bytes changed", async () => {
  const h = fixtureRuntime(); h.onSpawn(options => {
    if (options.arguments[3] === "-c") h.mutate.set(profile, { size: 99, links: 3 });
    return null;
  });
  assert(await createNativeUnderstandFixtureRuntime({ runtime: h.runtime }));
});
test("repeated admission denies flags, profile and frozen-file revocation before host dispatch", async () => {
  for (const change of [h => { h.flags.AXIOSOZO_UNDERSTAND_GUI_FIXTURE = "0"; }, h => h.profile(profile + "/nested"),
    h => h.mutate.set(h.paths.helper, { mode: "100600" })]) {
    const h = fixtureRuntime(), adapted = await createNativeUnderstandFixtureRuntime({ runtime: h.runtime });
    change(h); await assert.rejects(adapted.spawn(transportOptions(h.paths)), unavailable);
    assert.equal(hostCalls(h).length, 0);
  }
});
test("wrong endpoint, mode, flags or environment cannot dispatch native child", async () => {
  const h = fixtureRuntime(), adapted = await createNativeUnderstandFixtureRuntime({ runtime: h.runtime });
  for (const mutate of [x => { x.command = "/usr/bin/node"; }, x => x.arguments.push("extra"),
    x => { x.arguments[1] = "diagnostic"; }, x => { x.environmentAppend = true; },
    x => { x.environment.HOME = "/Users/synthetic"; }, x => { x.environment.PATH = "/custom"; },
    x => { x.stderr = "inherit"; }, x => { x.workdir = root; }]) {
    const options = transportOptions(h.paths); mutate(options);
    await assert.rejects(adapted.spawn(options), unavailable);
  }
  assert.equal(hostCalls(h).length, 0);
});
test("abort before admission performs zero metadata work", async () => {
  const h = fixtureRuntime(), abort = new AbortController(); abort.abort();
  await assert.rejects(createNativeUnderstandFixtureRuntime({ runtime: h.runtime, signal: abort.signal }), unavailable);
  assert.equal(h.calls.length, 0);
});
test("revocation during metadata hash causes no later stat or host launch", async () => {
  const h = fixtureRuntime();
  h.onSpawn(options => { if (options.arguments[3] === "-c") h.flags.AXIOSOZO_SYNTHETIC_TEST = "0"; return null; });
  await assert.rejects(createNativeUnderstandFixtureRuntime({ runtime: h.runtime }), unavailable);
  assert.equal(h.calls.at(-1).arguments[3], "-c"); assert.equal(hostCalls(h).length, 0);
});
test("metadata output cap covers both discarded stderr and retained stdout", async () => {
  for (const pipe of ["stdout", "stderr"]) {
    const h = fixtureRuntime(); h.onSpawn(() => h.child("", { [pipe]: { read: async () => new TextEncoder().encode("ü".repeat(2049)).buffer, close: async () => {} } }));
    await assert.rejects(runUnderstandFixtureMetadata(h.runtime, UNDERSTAND_METADATA_ID, ["-u"]), unavailable);
    assert.equal(h.children[0].counters.kill, 1);
  }
});
test("metadata timeout owns and cleans a child returned after deadline", async () => {
  const h = fixtureRuntime(), start = deferred(); h.onSpawn(() => start.promise);
  const result = runUnderstandFixtureMetadata(h.runtime, UNDERSTAND_METADATA_ID, ["-u"]);
  const rejected = assert.rejects(result, unavailable); await tick(); await h.timers.advance(1000); await rejected;
  const child = h.child("501\n"); start.resolve(child); await tick();
  assert.equal(h.children[0].counters.kill, 1); assert.equal(h.children[0].counters.stdinClose, 1);
});
test("stuck metadata reads and wait are bounded through cleanup grace", async () => {
  const h = fixtureRuntime(); h.onSpawn(() => h.child("", { stdout: { read: () => new Promise(() => {}), close: async () => {} },
    wait: () => new Promise(() => {}) }));
  const result = runUnderstandFixtureMetadata(h.runtime, UNDERSTAND_METADATA_ID, ["-u"]), rejected = assert.rejects(result, unavailable);
  await tick(); await h.timers.advance(1000); await h.timers.advance(500); await rejected;
  assert.equal(h.children[0].counters.kill, 1); assert.equal(h.timers.tasks.size, 0);
});
test("metadata surface cancellation promptly cleans owned child", async () => {
  const h = fixtureRuntime(), abort = new AbortController();
  h.onSpawn(() => h.child("", { stdout: { read: () => new Promise(() => {}), close: async () => {} } }));
  const result = runUnderstandFixtureMetadata(h.runtime, UNDERSTAND_METADATA_ID, ["-u"], { signal: abort.signal });
  const rejected = assert.rejects(result, unavailable); await tick(); abort.abort(); await tick(); await rejected;
  assert.equal(h.children[0].counters.kill, 1); assert.equal(h.timers.tasks.size, 0);
});

test("OS binary hash bootstrap refuses forgery before Python execution", async () => {
  const h = fixtureRuntime(); h.onSpawn(options => options.command === UNDERSTAND_METADATA_HASH ? h.child("forged\n") : null);
  await assert.rejects(createNativeUnderstandFixtureRuntime({ runtime: h.runtime }), unavailable);
  assert.equal(h.calls.filter(x => x.command === UNDERSTAND_FIXTURE_PYTHON).length, 0);
});
test("raw metadata reads count split Unicode discarded stderr through the cap", async () => {
  const h = fixtureRuntime(), chunks = [Uint8Array.of(0xc3).buffer, new Uint8Array(4096).buffer, new ArrayBuffer(0)];
  h.onSpawn(() => h.child("501\n", { stderr: { read: async () => chunks.shift(), close: async () => {} } }));
  await assert.rejects(runUnderstandFixtureMetadata(h.runtime, UNDERSTAND_METADATA_ID, ["-u"]), unavailable);
  assert.equal(chunks.length, 1); assert.equal(h.children[0].counters.kill, 1);
});
test("raw split Unicode stdout decodes across chunks and flushes at actual EOF", async () => {
  const h = fixtureRuntime(), chunks = [Uint8Array.of(0xc3).buffer, Uint8Array.of(0xbc).buffer, new ArrayBuffer(0)];
  h.onSpawn(() => h.child("", { stdout: { read: async () => chunks.shift(), close: async () => {} } }));
  assert.equal(await runUnderstandFixtureMetadata(h.runtime, UNDERSTAND_METADATA_ID, ["-u"]), "ü");
});
test("host returned after runtime revocation is owned and cleaned", async () => {
  const h = fixtureRuntime(), adapted = await createNativeUnderstandFixtureRuntime({ runtime: h.runtime }), start = deferred();
  h.onSpawn(options => options.command === UNDERSTAND_FIXTURE_PYTHON && options.arguments[3] !== "-c" ? start.promise : null);
  const result = adapted.spawn(transportOptions(h.paths)), rejected = assert.rejects(result, unavailable);
  for (let i = 0; i < 20 && hostCalls(h).length === 0; i++) await tick();
  assert.equal(hostCalls(h).length, 1); h.flags.AXIOSOZO_UNDERSTAND_GUI_FIXTURE = "0";
  const child = h.child(); start.resolve(child); await rejected;
  assert.equal(h.children.at(-1).counters.kill, 1); assert.equal(h.children.at(-1).counters.stdinClose, 1);
});
test("host startup deadline cleans a child that resolves late", async () => {
  const h = fixtureRuntime(), adapted = await createNativeUnderstandFixtureRuntime({ runtime: h.runtime }), start = deferred();
  h.onSpawn(options => options.command === UNDERSTAND_FIXTURE_PYTHON && options.arguments[3] !== "-c" ? start.promise : null);
  const result = adapted.spawn(transportOptions(h.paths)), rejected = assert.rejects(result, unavailable);
  for (let i = 0; i < 20 && hostCalls(h).length === 0; i++) await tick();
  await h.timers.advance(1000); await rejected;
  start.resolve(h.child()); await tick();
  assert.equal(h.children.at(-1).counters.kill, 1); assert.throws(() => adapted.guard(), unavailable);
});
test("aborted host startup rejects and owns the eventual child", async () => {
  const h = fixtureRuntime(), abort = new AbortController();
  const adapted = await createNativeUnderstandFixtureRuntime({ runtime: h.runtime, signal: abort.signal }), start = deferred();
  h.onSpawn(options => options.command === UNDERSTAND_FIXTURE_PYTHON && options.arguments[3] !== "-c" ? start.promise : null);
  const result = adapted.spawn(transportOptions(h.paths)), rejected = assert.rejects(result, unavailable);
  for (let i = 0; i < 20 && hostCalls(h).length === 0; i++) await tick();
  abort.abort(); await rejected; start.resolve(h.child()); await tick();
  assert.equal(h.children.at(-1).counters.kill, 1);
});
test("an admitted host cannot write a request after flags are revoked", async () => {
  const h = fixtureRuntime(), adapted = await createNativeUnderstandFixtureRuntime({ runtime: h.runtime });
  const child = await adapted.spawn(transportOptions(h.paths));
  h.flags.AXIOSOZO_SYNTHETIC_TEST = "0";
  assert.throws(() => child.stdin.write("synthetic-envelope\n"), unavailable); await tick();
  assert.deepEqual(h.children.at(-1).counters.writes, []); assert.equal(h.children.at(-1).counters.kill, 1);
});

test("overall admission deadline stops individually timely metadata calls", async () => {
  const h = fixtureRuntime(); h.onSpawn(() => new Promise(resolve => h.timers.setTimeout(() => resolve(null), 700)));
  const result = createNativeUnderstandFixtureRuntime({ runtime: h.runtime }), rejected = assert.rejects(result, unavailable);
  await tick();
  for (let i = 0; i < 4; i++) await h.timers.advance(700);
  const callsAtDeadline = h.calls.length;
  await h.timers.advance(200); await rejected; await h.timers.advance(1000);
  assert.equal(h.calls.length, callsAtDeadline); assert.equal(hostCalls(h).length, 0);
});
test("lifetime cancellation closes an admitted active host and bounds stuck wait", async () => {
  const h = fixtureRuntime(), abort = new AbortController();
  const adapted = await createNativeUnderstandFixtureRuntime({ runtime: h.runtime, signal: abort.signal });
  h.onSpawn(options => options.command === UNDERSTAND_FIXTURE_PYTHON && options.arguments[3] !== "-c"
    ? h.child("", { wait: () => new Promise(() => {}) }) : null);
  await adapted.spawn(transportOptions(h.paths));
  abort.abort(); await tick(); await h.timers.advance(1000);
  assert.equal(h.children.at(-1).counters.kill, 1); assert.equal(h.children.at(-1).counters.stdinClose, 1);
  assert.throws(() => adapted.guard(), unavailable);
});
test("malformed admitted child is rejected with usable cleanup attempted", async () => {
  const h = fixtureRuntime(), adapted = await createNativeUnderstandFixtureRuntime({ runtime: h.runtime });
  h.onSpawn(options => options.command === UNDERSTAND_FIXTURE_PYTHON && options.arguments[3] !== "-c"
    ? h.child("", { stderr: undefined }) : null);
  await assert.rejects(adapted.spawn(transportOptions(h.paths)), unavailable);
  assert.equal(h.children.at(-1).counters.kill, 1); assert.equal(h.children.at(-1).counters.stdinClose, 1);
});

test("observed revocation permanently retires the admitted runtime", async () => {
  const h = fixtureRuntime(), adapted = await createNativeUnderstandFixtureRuntime({ runtime: h.runtime });
  h.flags.AXIOSOZO_UNDERSTAND_GUI_FIXTURE = "0";
  await assert.rejects(adapted.spawn(transportOptions(h.paths)), unavailable);
  h.flags.AXIOSOZO_UNDERSTAND_GUI_FIXTURE = "1";
  assert.throws(() => adapted.guard(), unavailable);
  await assert.rejects(adapted.spawn(transportOptions(h.paths)), unavailable);
  assert.equal(hostCalls(h).length, 0);
});

test("transport hard-kill requests preserve supervisor group cleanup grace", async () => {
  const h = fixtureRuntime(), adapted = await createNativeUnderstandFixtureRuntime({ runtime: h.runtime });
  const child = await adapted.spawn(transportOptions(h.paths));
  for (const grace of [0, 250, 5000]) await child.kill(grace);
  assert.deepEqual(h.children.at(-1).counters.killGrace, [750, 750, 750]);
});

test("detected interpreter replacement after OS hash is rejected before Python execution", async () => {
  const h = fixtureRuntime();
  h.onSpawn(options => { if (options.command === UNDERSTAND_METADATA_HASH) h.mutate.set(h.paths.interpreter, { inode: "9999" }); return null; });
  await assert.rejects(createNativeUnderstandFixtureRuntime({ runtime: h.runtime }), unavailable);
  assert.equal(h.calls.filter(x => x.command === UNDERSTAND_FIXTURE_PYTHON).length, 0);
});

test("initial fixture admission rejects revoked owner before any metadata spawn", async () => {
  for (const isActive of [() => false, () => { throw Error("revoked"); }]) {
    const h = fixtureRuntime();
    await assert.rejects(createNativeUnderstandFixtureRuntime({ runtime: h.runtime, isActive }), unavailable);
    assert.equal(h.calls.length, 0);
  }
});
test("metadata admission checks owner after each delayed boundary and a different owner can start", async () => {
  for (const boundary of ["uid", "stat", "binary-hash", "python-hash", "restat"]) {
    const h = fixtureRuntime(), adapted = await createNativeUnderstandFixtureRuntime({ runtime: h.runtime });
    let active = true, hashed = false;
    h.onSpawn(options => {
      const phase = options.command === UNDERSTAND_METADATA_ID ? "uid"
        : options.command === UNDERSTAND_METADATA_STAT ? (hashed ? "restat" : "stat")
        : options.command === UNDERSTAND_METADATA_HASH ? "binary-hash"
        : options.arguments[3] === "-c" ? "python-hash" : "host";
      if (phase === "python-hash") hashed = true;
      if (phase === boundary) active = false;
      return null;
    });
    await assert.rejects(adapted.spawn({ ...transportOptions(h.paths), isActive: () => active }), unavailable);
    assert.equal(hostCalls(h).length, 0, boundary); assert.doesNotThrow(() => adapted.guard());
    h.onSpawn(null);
    await adapted.spawn({ ...transportOptions(h.paths), isActive: () => true });
    assert.equal(hostCalls(h).length, 1, boundary);
  }
});
test("native metadata failure concurrent with owner revocation still permanently retires fixture", async () => {
  const h = fixtureRuntime(), adapted = await createNativeUnderstandFixtureRuntime({ runtime: h.runtime }); let active = true;
  h.onSpawn(options => {
    if (options.command !== UNDERSTAND_METADATA_ID) return null;
    return h.child("501\n", { wait: async () => { active = false; return { exitCode: 1 }; } });
  });
  await assert.rejects(adapted.spawn({ ...transportOptions(h.paths), isActive: () => active }), unavailable);
  h.onSpawn(null); active = true;
  assert.throws(() => adapted.guard(), unavailable);
  await assert.rejects(adapted.spawn({ ...transportOptions(h.paths), isActive: () => true }), unavailable);
  assert.equal(hostCalls(h).length, 0);
});
test("fixture creator and host startup authority never become the admitted host's lifetime guard", async () => {
  const h = fixtureRuntime(); let creatorActive = true, startupActive = true;
  const adapted = await createNativeUnderstandFixtureRuntime({ runtime: h.runtime, isActive: () => creatorActive });
  creatorActive = false;
  const child = await adapted.spawn({ ...transportOptions(h.paths), isActive: () => startupActive });
  startupActive = false;
  await child.stdin.write("owned-cleanup-envelope\n");
  assert.deepEqual(h.children.at(-1).counters.writes, ["owned-cleanup-envelope\n"]);
  assert.doesNotThrow(() => adapted.guard());
});
test("native spawn has initiating authority and a late revoked child is cleaned without a write", async () => {
  const h = fixtureRuntime(), adapted = await createNativeUnderstandFixtureRuntime({ runtime: h.runtime }), start = deferred(); let active = true;
  h.onSpawn(options => options.command === UNDERSTAND_FIXTURE_PYTHON && options.arguments[3] !== "-c" ? start.promise : null);
  const pending = adapted.spawn({ ...transportOptions(h.paths), isActive: () => active }); const rejected = assert.rejects(pending, unavailable);
  for (let i = 0; i < 20 && hostCalls(h).length === 0; i++) await tick();
  assert.equal(hostCalls(h).length, 1); assert.equal(hostCalls(h)[0].isActive(), true);
  active = false; assert.equal(hostCalls(h)[0].isActive(), false); start.resolve(h.child()); await rejected;
  assert.deepEqual(h.children.at(-1).counters.writes, []); assert.equal(h.children.at(-1).counters.kill, 1);
  assert.doesNotThrow(() => adapted.guard());
});

test("default native fixture adapter strips authority from every Gecko process option", async () => {
  const h = fixtureRuntime(), globals = ["ChromeUtils", "Services", "Cc", "Ci"], before = new Map(globals.map(key => [key, globalThis[key]]));
  globalThis.ChromeUtils = { importESModule(path) { return path.includes("Subprocess")
    ? { Subprocess: { call(options) { assert.equal(Object.hasOwn(options, "isActive"), false); return h.runtime.spawn(options); } } }
    : h.timers; } };
  globalThis.Services = { env: { get: h.runtime.env }, dirsvc: { get: () => ({ path: profile }) }, uuid: { generateUUID: () => "native_fake" } };
  globalThis.Ci = { nsIFile: {} };
  globalThis.Cc = { "@mozilla.org/file/local;1": { createInstance: () => ({
    permissions: 0o755, initWithPath(path) { this.path = path; }, exists: () => true,
    isSymlink: () => false, normalize() {}, isFile: () => true, isExecutable: () => true, isDirectory: () => true,
  }) } };
  try {
    const adapted = await createNativeUnderstandFixtureRuntime({ isActive: () => true });
    await adapted.spawn({ ...transportOptions(h.paths), isActive: () => true });
    assert.equal(hostCalls(h).length, 1); assert(h.calls.length > 5);
    assert(h.calls.every(options => !Object.hasOwn(options, "isActive")));
  } finally { for (const key of globals) { if (before.get(key) === undefined) delete globalThis[key]; else globalThis[key] = before.get(key); } }
});
