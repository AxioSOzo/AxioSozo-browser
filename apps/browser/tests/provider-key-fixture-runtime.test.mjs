// No subprocess, Keychain, provider execution, network or browser. Fake native admission.
import test from "node:test";
import assert from "node:assert/strict";
import { createDecisionKeyFixtureRuntime, decisionKeyFixturePaths, KEY_FIXTURE_SHA256,
  KEY_FIXTURE_PYTHON } from "../chrome/DecisionKeyFixtureRuntime.sys.mjs";
import { storeDecisionKey, removeDecisionKey, decisionKeyPresence, decisionKeyStatus }
  from "../chrome/ProviderKeys.sys.mjs";

const id = "d".repeat(32);
const root = `/Volumes/AxioSozoBuild/workstation/gui-fixtures/keys-${id}`;
const profile = `/Volumes/AxioSozoBuild/workstation/runtime/e626697ad91fe95c/plan4-keys-${id}/gecko`;
const paths = decisionKeyFixturePaths(root, profile);
const unavailable = error => error.code === "KEYCHAIN_HELPER_UNAVAILABLE"
  && error.message === "KEYCHAIN_HELPER_UNAVAILABLE";
const prefs = { getBoolPref: () => true };
function fixture() {
  const calls = [], verified = [], hashes = [], present = new Set(), written = [];
  const environment = { AXIOSOZO_SYNTHETIC_TEST: "1", AXIOSOZO_KEY_GUI_FIXTURE_ROOT: root };
  let currentProfile = profile;
  const native = {
    timers: { setTimeout, clearTimeout },
    env: name => environment[name],
    profilePath: () => currentProfile,
    verifyFile: async (path, options) => { verified.push({ path, options }); return true; },
    sha256: async path => { hashes.push(path); return KEY_FIXTURE_SHA256; },
    async spawn(options) {
      calls.push(options);
      const operation = options.arguments.at(-2) === "store" || options.arguments.at(-2) === "exists"
        || options.arguments.at(-2) === "remove" ? options.arguments.at(-2) : options.arguments.at(-1);
      const provider = options.arguments.at(-1) === "openai" ? "openai" : "jev";
      let input = "", completed = false, exitCode, resolveExit;
      const exit = new Promise(resolve => { resolveExit = resolve; });
      const finish = () => {
        if (completed) return; completed = true;
        if (operation === "store") {
          written.push(input === `synthetic-gui-key-${provider}-plan4`);
          exitCode = written.at(-1) ? 0 : 2;
          if (exitCode === 0) present.add(provider);
        } else if (operation === "exists") exitCode = present.has(provider) ? 0 : 44;
        else { exitCode = present.delete(provider) ? 0 : 44; }
        input = ""; resolveExit({ exitCode });
      };
      const quiet = { readString: async () => null, close: async () => {} };
      return { stdout: quiet, stderr: quiet,
        stdin: { write: async value => { input = value; }, close: async () => { finish(); } },
        wait: () => exit, kill: async () => {},
      };
    },
  };
  return { native, calls, verified, hashes, present, written, environment,
    changeProfile: value => { currentProfile = value; } };
}

const rawOptions = args => ({ command: paths.virtualCommand, arguments: args,
  environmentAppend: false, environment: { PATH: "/usr/bin:/bin", LANG: "C" }, stderr: "pipe" });

test("no synthetic request returns null without verification or spawn", async () => {
  for (const flag of [undefined, "1", "0"]) for (const absentRoot of [undefined, "", null]) {
    const f = fixture(); f.environment.AXIOSOZO_SYNTHETIC_TEST = flag;
    f.environment.AXIOSOZO_KEY_GUI_FIXTURE_ROOT = absentRoot;
    assert.equal(await createDecisionKeyFixtureRuntime(f.native), null);
    assert.equal(f.verified.length + f.calls.length, 0);
  }
});

test("partial flags, missing exact owned profile, and unsafe roots fail closed", async () => {
  for (const [flag, location, prof] of [["", root, profile], ["1", root, "/Users/synthetic/Library/profile"],
    ["1", root + "/nested", profile], ["1", root + "/../other", profile], ["1", root + "/", profile],
    ["1", root.replace("workstation/", "zen/"), profile], ["1", root.replace(id, "D".repeat(32)), profile],
    ["1", root, profile.replace(id, "e".repeat(32))]]) {
    const f = fixture(); f.environment.AXIOSOZO_SYNTHETIC_TEST = flag;
    f.environment.AXIOSOZO_KEY_GUI_FIXTURE_ROOT = location; f.changeProfile(prof);
    await assert.rejects(createDecisionKeyFixtureRuntime(f.native), unavailable);
    assert.equal(f.calls.length, 0);
  }
});

test("trusted factory uses pinned Python and helper hash with private native checks", async () => {
  const f = fixture(); const runtime = await createDecisionKeyFixtureRuntime(f.native);
  assert.equal(runtime.env("AXIOSOZO_BUILD_ROOT"), "/Volumes/AxioSozoBuild/workstation");
  assert.equal(runtime.env("HOME"), "");
  assert.equal(f.native.env("AXIOSOZO_BUILD_ROOT"), undefined);
  assert.equal(f.verified.filter(item => item.options.directory).length, 3);
  assert(f.verified.some(item => item.path === KEY_FIXTURE_PYTHON && item.options.executable));
  assert.equal(f.hashes[0], paths.helper);
  assert.equal(await runtime.verifyHelper("/tmp/keychain"), false);
  assert.equal(f.calls.length, 0);
});

test("helper digest and canonical file metadata must be literal valid values", async () => {
  for (const kind of ["digest", "missing", "truthy"]) {
    const f = fixture();
    if (kind === "digest") f.native.sha256 = async () => "a".repeat(64);
    else f.native.verifyFile = async () => kind === "missing" ? false : "true";
    await assert.rejects(createDecisionKeyFixtureRuntime(f.native), unavailable);
    assert.equal(f.calls.length, 0);
  }
});

test("both ProviderKeys flows share existing stdin-only API and stay isolated", async () => {
  const f = fixture(); const runtime = await createDecisionKeyFixtureRuntime(f.native);
  assert.equal(await decisionKeyPresence("jev", { runtime }), "missing");
  assert.equal(await decisionKeyPresence("openai", { runtime }), "missing");
  for (const provider of ["jev", "openai"]) {
    await storeDecisionKey(provider, `synthetic-gui-key-${provider}-plan4`, { runtime, prefs });
    assert.equal(await decisionKeyPresence(provider, { runtime }), "stored");
  }
  await removeDecisionKey("jev", { runtime });
  assert.equal(await decisionKeyPresence("jev", { runtime }), "missing");
  assert.equal(await decisionKeyPresence("openai", { runtime }), "stored");
  await removeDecisionKey("openai", { runtime });
  assert.equal(await decisionKeyPresence("openai", { runtime }), "missing");
  assert.deepEqual(f.written, [true, true]);
  for (const call of f.calls) {
    assert.equal(call.command, KEY_FIXTURE_PYTHON);
    assert.deepEqual(call.arguments.slice(0, 4), ["-I", "-S", "-B", paths.helper]);
    assert.deepEqual(call.environment, { LANG: "C" });
    assert.equal(call.environmentAppend, false);
    assert(!JSON.stringify(call).includes("synthetic-gui-key"));
    assert(!call.arguments.includes("read"));
  }
});

test("removal still works with disabled prefs while storing cannot spawn", async () => {
  const f = fixture(); const runtime = await createDecisionKeyFixtureRuntime(f.native);
  const disabled = { getBoolPref: () => false };
  await assert.rejects(storeDecisionKey("openai", "synthetic-gui-key-openai-plan4", { runtime, prefs: disabled }),
    error => error.code === "KEY_ENTRY_DISABLED");
  assert.equal(f.calls.length, 0);
  await removeDecisionKey("openai", { runtime, prefs: disabled });
  assert.equal(f.calls.length, 1);
});

test("requested fixture cannot fall back to real helper after admission changes", async () => {
  for (const changed of ["profile", "root", "flag", "hash", "file"]) {
    const f = fixture(); const runtime = await createDecisionKeyFixtureRuntime(f.native);
    if (changed === "profile") f.changeProfile("/Users/synthetic/foreign-profile");
    if (changed === "root") f.environment.AXIOSOZO_KEY_GUI_FIXTURE_ROOT = root + "/foreign";
    if (changed === "flag") f.environment.AXIOSOZO_SYNTHETIC_TEST = "0";
    if (changed === "hash") f.native.sha256 = async () => "bad";
    if (changed === "file") f.native.verifyFile = async () => false;
    const status = await decisionKeyStatus("jev", { runtime, prefs });
    assert.equal(status.error, "KEYCHAIN_HELPER_UNAVAILABLE");
    assert.equal(status.key, "unknown");
    assert.equal(f.calls.length, 0);
  }
});

test("runtime refuses arbitrary command, extra argv, read and leaking environment", async () => {
  const f = fixture(); const runtime = await createDecisionKeyFixtureRuntime(f.native);
  for (const bad of [{ ...rawOptions(["exists"]), command: "/usr/bin/security" },
    rawOptions(["read"]), rawOptions(["store", "openai", "extra"]), rawOptions(["exists", "other"]),
    { ...rawOptions(["exists"]), environmentAppend: true },
    { ...rawOptions(["exists"]), environment: { LANG: "C", PATH: "/usr/bin:/bin", SECRET: "invented" } },
    { ...rawOptions(["exists"]), environment: { LANG: "C", PATH: "/some/project/bin" } }]) {
    await assert.rejects(runtime.spawn(bad), unavailable);
  }
  assert.equal(f.calls.length, 0);
});

test("every actual spawn rechecks admission after verifyHelper", async () => {
  const f = fixture(); const runtime = await createDecisionKeyFixtureRuntime(f.native);
  assert.equal(await runtime.verifyHelper(paths.virtualCommand), true);
  f.native.sha256 = async () => "different";
  await assert.rejects(runtime.spawn(rawOptions(["exists"])), unavailable);
  assert.equal(f.calls.length, 0);
});

test("factory admission has a deadline and late verification cannot create a runtime", async () => {
  const f = fixture(); let callback, released;
  f.native.timers = { setTimeout: fn => { callback = fn; return 1; }, clearTimeout: () => {} };
  f.native.verifyFile = () => new Promise(resolve => { released = resolve; });
  const pending = createDecisionKeyFixtureRuntime(f.native);
  await Promise.resolve(); callback();
  await assert.rejects(pending, unavailable); released(true);
  await new Promise(resolve => setImmediate(resolve));
  assert.equal(f.calls.length, 0);
});

function clocked(f) {
  const timers = new Map(); let serial = 0, time = 0;
  f.native.clock = () => time;
  f.native.timers = { setTimeout: (fn, ms) => { const id = ++serial; timers.set(id, { fn, ms }); return id; },
    clearTimeout: id => { timers.delete(id); } };
  return { timers, advance: ms => { time += ms; } };
}
const tick = async () => { for (let n = 0; n < 3; n++) await new Promise(resolve => setImmediate(resolve)); };

test("verifyHelper deadline prevents a late verifier from admitting a child", async () => {
  const f = fixture(); const c = clocked(f); const runtime = await createDecisionKeyFixtureRuntime(f.native);
  let release; f.native.verifyFile = () => new Promise(resolve => { release = resolve; });
  const pending = runtime.verifyHelper(paths.virtualCommand); await tick();
  c.advance(3000); [...c.timers.values()].find(timer => timer.ms === 3000).fn();
  await assert.rejects(pending, unavailable); release(true); await tick();
  await assert.rejects(runtime.spawn(rawOptions(["exists"])), unavailable);
  assert.equal(f.calls.length, 0); assert.equal(c.timers.size, 0);
});

test("verify and spawn share a four-second budget rather than restarting it", async () => {
  const f = fixture(); const c = clocked(f); const runtime = await createDecisionKeyFixtureRuntime(f.native);
  const original = f.native.verifyFile; let release;
  f.native.verifyFile = () => new Promise(resolve => { release = resolve; });
  const checked = runtime.verifyHelper(paths.virtualCommand); await tick(); c.advance(2500);
  f.native.verifyFile = original; release(true); assert.equal(await checked, true);
  f.native.verifyFile = () => new Promise(resolve => { release = resolve; });
  const pending = runtime.spawn(rawOptions(["exists"])); await tick();
  const remaining = [...c.timers.values()].find(timer => timer.ms === 1500);
  assert(remaining); c.advance(1500); remaining.fn();
  await assert.rejects(pending, unavailable); release(true); await tick();
  assert.equal(f.calls.length, 0); assert.equal(c.timers.size, 0);
});

test("independent operation timer blocks dispatch even if the test clock moves backwards", async () => {
  const f = fixture(); const c = clocked(f); const runtime = await createDecisionKeyFixtureRuntime(f.native);
  assert.equal(await runtime.verifyHelper(paths.virtualCommand), true);
  let release; f.native.verifyFile = () => new Promise(resolve => { release = resolve; });
  const pending = runtime.spawn(rawOptions(["exists"])); await tick();
  c.advance(-1); [...c.timers.values()].find(timer => timer.ms === 4000).fn();
  await assert.rejects(pending, unavailable); release(true); await tick();
  assert.equal(f.calls.length, 0); assert.equal(c.timers.size, 0);
});

test("surface cancellation during admission blocks late fixture dispatch", async () => {
  const f = fixture(); const c = clocked(f); const controller = new AbortController();
  const runtime = await createDecisionKeyFixtureRuntime(f.native, { signal: controller.signal });
  assert.equal(await runtime.verifyHelper(paths.virtualCommand), true);
  let release; f.native.verifyFile = () => new Promise(resolve => { release = resolve; });
  const pending = runtime.spawn(rawOptions(["store", "openai"])); await tick(); controller.abort();
  await assert.rejects(pending, unavailable); release(true); await tick();
  assert.equal(f.calls.length, 0); assert.equal(c.timers.size, 0);
});

test("flag and profile changes during outstanding native verification prevent dispatch", async () => {
  for (const changed of ["profile", "root", "flag"]) {
    const f = fixture(); const c = clocked(f); const runtime = await createDecisionKeyFixtureRuntime(f.native);
    assert.equal(await runtime.verifyHelper(paths.virtualCommand), true);
    let release; f.native.verifyFile = () => new Promise(resolve => { release = resolve; });
    const pending = runtime.spawn(rawOptions(["exists"])); await tick();
    if (changed === "profile") f.changeProfile("/Users/synthetic/foreign-profile");
    if (changed === "root") f.environment.AXIOSOZO_KEY_GUI_FIXTURE_ROOT = root + "/foreign";
    if (changed === "flag") f.environment.AXIOSOZO_SYNTHETIC_TEST = "0";
    release(true); await assert.rejects(pending, unavailable);
    assert.equal(f.calls.length, 0); assert.equal(c.timers.size, 0);
  }
});

test("surface already cancelled performs no file checks or child work", async () => {
  const f = fixture(); const controller = new AbortController(); controller.abort();
  await assert.rejects(createDecisionKeyFixtureRuntime(f.native, { signal: controller.signal }), unavailable);
  assert.equal(f.verified.length + f.calls.length, 0);
});

test("one runtime never shares unfinished admission across concurrent operations", async () => {
  const f = fixture(); const c = clocked(f); const runtime = await createDecisionKeyFixtureRuntime(f.native);
  assert.equal(await runtime.verifyHelper(paths.virtualCommand), true);
  await assert.rejects(runtime.verifyHelper(paths.virtualCommand), unavailable);
  const child = await runtime.spawn(rawOptions(["exists"])); await child.stdin.close(); await child.wait();
  assert.equal(f.calls.length, 1); assert.equal(c.timers.size, 0);
});

test('fixture authority rejects malformed or revoked surfaces before environment access', async () => {
  for (const isActive of [null, () => false, () => 'true', async () => true, () => { throw new Error('invented-error'); }]) {
    const f = fixture(); f.native.env = () => assert.fail('revoked surface reads no environment');
    await assert.rejects(createDecisionKeyFixtureRuntime(f.native, { isActive }), unavailable);
    assert.equal(f.calls.length + f.verified.length, 0);
  }
});

test('removal cannot dispatch after surface loss within its internal asynchronous admission', async () => {
  const f = fixture(); let active = true, armed = false; const sha256 = f.native.sha256;
  f.native.sha256 = async path => { const digest = await sha256(path); if (armed) active = false; return digest; };
  const runtime = await createDecisionKeyFixtureRuntime(f.native, { isActive: () => active });
  assert.equal(await runtime.verifyHelper(paths.virtualCommand), true);
  f.present.add('openai'); armed = true;
  await assert.rejects(runtime.spawn(rawOptions(['remove', 'openai'])), unavailable);
  assert.equal(f.calls.length, 0); assert.equal(f.present.has('openai'), true);
});
