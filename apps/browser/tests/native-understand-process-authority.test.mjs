// In-memory Node process seam only. No child, filesystem fixture or profile IO.
import nativeTest from "node:test";
const test = (name, run) => nativeTest(name, { timeout: 2000 }, run);
import assert from "node:assert/strict";
import { EventEmitter } from "node:events";
import { PassThrough } from "node:stream";
import { processRuntime, fixtureProfileForRoot } from "./understand-process-runtime.mjs";
import { UNDERSTAND_METADATA_ID } from "../chrome/NativeUnderstandFixtureRuntime.sys.mjs";

const ROOT = "/Volumes/AxioSozoBuild/workstation/gui-fixtures/understand-0123456789abcdef0123456789abcdef";
const PROFILE = fixtureProfileForRoot(ROOT);
const refused = error => error?.code === "UNDERSTAND_FIXTURE_UNAVAILABLE"
  && error.message === "UNDERSTAND_FIXTURE_UNAVAILABLE";
const metadataOptions = () => ({ command: UNDERSTAND_METADATA_ID, arguments: ["-u"],
  environmentAppend: false, environment: { LANG: "C", LC_ALL: "C" }, workdir: "/", stderr: "pipe" });
function fakeChild(pid) {
  const child = new EventEmitter();
  Object.assign(child, { pid, exitCode: null, signalCode: null, stdin: new PassThrough(),
    stdout: new PassThrough(), stderr: new PassThrough(), writes: [], signals: [] });
  let closed = false;
  const finish = () => {
    if (closed) return;
    closed = true; child.exitCode = 0; child.stdout.end(); child.stderr.end();
    child.emit("exit", 0, null); child.emit("close", 0, null);
  };
  child.stdin.on("data", bytes => child.writes.push(bytes.toString("utf8")));
  child.stdin.on("finish", finish);
  child.kill = signal => { child.signals.push(signal); finish(); return true; };
  queueMicrotask(() => child.emit("spawn"));
  return child;
}
function harness() {
  const calls = [], profiles = [], children = [];
  const seam = processRuntime({ root: ROOT, profile: PROFILE, testOnly: {
    assertPrivateProfile(full) { profiles.push(full); assert.equal(full, PROFILE); return true; },
    spawn(command, args, options) {
      calls.push({ command, args, options });
      const child = fakeChild(50000 + children.length); children.push(child); return child;
    },
  } });
  return { seam, calls, profiles, children };
}
async function close(handle) {
  await handle.stdin.close(); await handle.wait();
  await handle.stdout.close(); await handle.stderr.close();
}
function hostOptions(seam) {
  const paths = seam.paths;
  return { command: paths.interpreter, arguments: ["-I", "-S", "-B", paths.helper, "host", ROOT, PROFILE],
    environmentAppend: false, environment: { LANG: "C", LC_ALL: "C", AXIOSOZO_SYNTHETIC_TEST: "1",
      AXIOSOZO_UNDERSTAND_GUI_FIXTURE: "1", AXIOSOZO_UNDERSTAND_GUI_FIXTURE_ROOT: ROOT },
    workdir: "/", stderr: "pipe" };
}

test("omitted private authority retains exact native option classification", async () => {
  const h = harness(), handle = await h.seam.runtime.spawn(metadataOptions());
  assert.deepEqual(h.profiles, [PROFILE]); assert.equal(h.calls.length, 1);
  assert.deepEqual(h.calls[0], { command: UNDERSTAND_METADATA_ID, args: ["-u"], options: {
    shell: false, cwd: "/", env: { LANG: "C", LC_ALL: "C" }, stdio: ["pipe", "pipe", "pipe"],
  } });
  assert.equal(h.seam.callLog[0].kind, "uid"); await close(handle);
  assert.equal(h.seam.receipt[0].reaped, true);
});

test("false, throwing, asynchronous and malformed authority perform zero spawn", async () => {
  for (const isActive of [() => false, () => { throw Error("private owner data"); }, async () => true,
    async () => { throw Error("private async owner data"); },
    () => Promise.resolve(true), () => ({ then() {} }), true, null, undefined]) {
    const h = harness();
    await assert.rejects(h.seam.runtime.spawn({ ...metadataOptions(), isActive }), refused);
    assert.equal(h.calls.length, 0); assert.equal(h.children.length, 0); assert.deepEqual(h.seam.callLog, []);
  }
  const h = harness(), options = metadataOptions(); let getterCalls = 0;
  Object.defineProperty(options, "isActive", { enumerable: true, get() { getterCalls++; return () => true; } });
  await assert.rejects(h.seam.runtime.spawn(options), refused);
  assert.equal(getterCalls, 0); assert.equal(h.calls.length, 0);
});

test("denied authority runs before endpoint or environment inspection", async () => {
  const h = harness(), options = metadataOptions(); let inspected = 0, checked = 0;
  Object.defineProperty(options.environment, "LANG", { enumerable: true, get() { inspected++; throw Error("must not inspect"); } });
  options.command = "/usr/bin/security";
  await assert.rejects(h.seam.runtime.spawn({ ...options, isActive() { checked++; return false; } }), refused);
  assert.equal(checked, 1); assert.equal(inspected, 0); assert.equal(h.calls.length, 0);
});

test("authority is rechecked immediately after native option construction before spawn", async () => {
  const h = harness(), options = metadataOptions(); let active = true, checks = 0;
  Object.defineProperty(options.environment, "LANG", { enumerable: true, get() { active = false; return "C"; } });
  await assert.rejects(h.seam.runtime.spawn({ ...options, isActive() { checks++; return active; } }), refused);
  assert.equal(checks, 2); assert.equal(h.calls.length, 0); assert.deepEqual(h.seam.callLog, []);
});

test("authority is stripped and never binds host handles or later owners", async () => {
  const h = harness(); let firstActive = true, firstChecks = 0;
  const first = await h.seam.runtime.spawn({ ...hostOptions(h.seam), isActive() { firstChecks++; return firstActive; } });
  assert.equal(firstChecks, 2); firstActive = false;
  await first.stdin.write('{"method":"understand/cancel"}\n');
  assert.deepEqual(h.children[0].writes, ['{"method":"understand/cancel"}\n']);
  let secondChecks = 0;
  const second = await h.seam.runtime.spawn({ ...hostOptions(h.seam), isActive() { secondChecks++; return true; } });
  assert.equal(firstChecks, 2); assert.equal(secondChecks, 2); assert.equal(h.calls.length, 2);
  for (const call of h.calls) {
    assert.deepEqual(Object.keys(call.options).sort(), ["cwd", "env", "shell", "stdio"]);
    assert.equal(Object.hasOwn(call.options, "isActive"), false);
    assert(Object.values(call.options.env).every(value => typeof value === "string"));
  }
  await close(first); await close(second);
});

test("private callback does not relax fixed native keys or endpoint allowlists", async () => {
  const h = harness();
  for (const patch of [{ extra: true }, { command: "/bin/sh" }, { environmentAppend: true },
    { environment: { LANG: "C", LC_ALL: "C", HOME: "/invented/profile" } }]) {
    await assert.rejects(h.seam.runtime.spawn({ ...metadataOptions(), ...patch, isActive: () => true }), refused);
  }
  assert.equal(h.calls.length, 0); assert.deepEqual(h.seam.callLog, []);
});

test("fake injection is closed and requires two function capabilities", () => {
  let profiles = 0, spawns = 0;
  const spawn = () => { spawns++; throw Error("must not spawn"); };
  const assertPrivateProfile = () => { profiles++; return true; };
  for (const testOnly of [{ spawn }, { assertPrivateProfile }, { spawn, assertPrivateProfile, extra: true },
    { spawn: true, assertPrivateProfile }, { spawn, assertPrivateProfile: true }, [], "fake"]) {
    assert.throws(() => processRuntime({ root: ROOT, profile: PROFILE, testOnly }), refused);
  }
  assert.equal(profiles, 0); assert.equal(spawns, 0);
  for (const value of [false, Promise.resolve(true)]) {
    assert.throws(() => processRuntime({ root: ROOT, profile: PROFILE, testOnly: { spawn,
      assertPrivateProfile: () => value } }), refused);
  }
  assert.equal(spawns, 0);
});
