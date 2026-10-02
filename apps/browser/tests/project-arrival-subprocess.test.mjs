import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { createHash } from "node:crypto";
import { arrivalSubprocessOperation, arrivalSubprocessPaths, createNativeProjectArrivalSubprocess,
  ARRIVAL_LSOF_SHA256, ARRIVAL_LSOF_PYTHON } from "../chrome/ProjectArrivalSubprocess.sys.mjs";

const environment = () => ({ PATH: "/usr/bin:/bin:/usr/sbin", LANG: "C", LC_ALL: "C" });
const call = (command, args) => ({ command, arguments: args, environmentAppend: false, environment: environment(), stderr: "pipe" });
const listen = ["-nP", "-a", "-iTCP:44000", "-sTCP:LISTEN", "-F", "pun", "-u", "501"];
const cwd = ["-nP", "-a", "-p", "123", "-d", "cwd", "-F", "pn", "-u", "501"];
const refusal = error => error.code === "ARRIVAL_SUBPROCESS_UNAVAILABLE";
const runtimeFixture = ({ verify = () => true, digest = () => ARRIVAL_LSOF_SHA256, timers = globalThis } = {}) => {
  const verified = [], calls = [], child = Object.freeze({ synthetic: true });
  return { verified, calls, child, runtime: { env: name => name === "AXIOSOZO_STATIC_READER_ROOT" ? "/Volumes/AxioSozoBuild/workstation" : "",
    verifyFile: async (path, options) => { verified.push({ path, options }); return verify(path, options); },
    sha256: async path => digest(path), timers,
    Subprocess: { call: async options => { calls.push(options); return child; } },
  } };
};

test("hash pins the exact prepared helper", async () => {
  const source = await readFile(new URL("../../../tools/axiosozo-arrival/arrival_lsof.py", import.meta.url));
  assert.equal(createHash("sha256").update(source).digest("hex"), ARRIVAL_LSOF_SHA256);
});

test("trusted workstation root constructs a single fixed helper path", () => {
  assert.deepEqual(arrivalSubprocessPaths("/Volumes/AxioSozoBuild/workstation"), {
    interpreter: ARRIVAL_LSOF_PYTHON, helperPath: `/Volumes/AxioSozoBuild/workstation/contexts/arrival-lsof-${ARRIVAL_LSOF_SHA256}.py`,
  });
  for (const path of ["/tmp", "/Volumes/AxioSozoBuild/workstation/../zen", "/Volumes/AxioSozoBuild/zen",
    "/Volumes/AxioSozoBuild/runtime", "/Volumes/AxioSozoBuild/workstation/contexts", "", null]) assert.throws(() => arrivalSubprocessPaths(path), refusal);
});

test("only exact id, listen and cwd selectors are admitted", () => {
  assert.deepEqual(arrivalSubprocessOperation(call("/usr/bin/id", ["-u"])), { command: "id" });
  assert.deepEqual(arrivalSubprocessOperation(call("/usr/sbin/lsof", listen)), { command: "lsof", operation: "listen", number: "44000", uid: "501" });
  assert.deepEqual(arrivalSubprocessOperation(call("/usr/sbin/lsof", cwd)), { command: "lsof", operation: "cwd", number: "123", uid: "501" });
});

test("malformed selectors, UID and executable cannot reach native runtime", () => {
  const cases = [call("/bin/sh", ["-c", "id"]), call("/usr/bin/id", []), call("/usr/bin/id", ["-a"]),
    call("/usr/sbin/lsof", [...listen, "/invented-path"]), call("/usr/sbin/lsof", ["-nP", "-a", "-iTCP:0", ...listen.slice(3)]),
    call("/usr/sbin/lsof", ["-nP", "-a", "-iTCP:65536", ...listen.slice(3)]), call("/usr/sbin/lsof", [...listen.slice(0, 7), "0501"]),
    call("/usr/sbin/lsof", [...listen.slice(0, 7), "-1"]), call("/usr/sbin/lsof", [...listen.slice(0, 7), "4294967296"]),
    call("/usr/sbin/lsof", [...listen.slice(0, 7), "501;id"]), call("/usr/sbin/lsof", [...cwd.slice(0, 3), "2147483648", ...cwd.slice(4)]),
    call("/usr/sbin/lsof", [...cwd.slice(0, 3), "0", ...cwd.slice(4)]), call("/usr/sbin/lsof", [...cwd.slice(0, 5), "txt", ...cwd.slice(6)])];
  for (const options of cases) assert.throws(() => arrivalSubprocessOperation(options), refusal);
});

test("caller env, cwd, stdin and append overrides are refused", () => {
  for (const change of [{ workdir: "/invented-path" }, { stdin: "pipe" }, { environmentAppend: true },
    { stderr: "stdout" }, { environment: { ...environment(), INVENTED_SECRET: "must-never-forward" } },
    { environment: { ...environment(), PATH: "/invented-executable-dir" } }]) {
    assert.throws(() => arrivalSubprocessOperation({ ...call("/usr/sbin/lsof", listen), ...change }), refusal);
  }
});

test("request getters and sparse argument arrays are not evaluated", () => {
  let evaluated = 0;
  const commandGetter = { ...call("/usr/sbin/lsof", listen), get command() { evaluated++; throw Error("getter"); } };
  assert.throws(() => arrivalSubprocessOperation(commandGetter), refusal);
  const args = [...listen];
  Object.defineProperty(args, "2", { get() { evaluated++; throw Error("getter"); } });
  assert.throws(() => arrivalSubprocessOperation(call("/usr/sbin/lsof", args)), refusal);
  const sparse = [...listen]; delete sparse[2];
  assert.throws(() => arrivalSubprocessOperation(call("/usr/sbin/lsof", sparse)), refusal);
  assert.equal(evaluated, 0);
});

test("verified runtime routes fixed lsof through Python and id directly", async () => {
  const fixture = runtimeFixture();
  const adapter = await createNativeProjectArrivalSubprocess({ runtime: fixture.runtime });
  assert.equal(await adapter.call(call("/usr/bin/id", ["-u"])), fixture.child);
  assert.equal(await adapter.call(call("/usr/sbin/lsof", listen)), fixture.child);
  assert.equal(await adapter.call(call("/usr/sbin/lsof", cwd)), fixture.child);
  const helper = arrivalSubprocessPaths("/Volumes/AxioSozoBuild/workstation").helperPath;
  assert.deepEqual(fixture.calls, [
    { command: "/usr/bin/id", arguments: ["-u"], environmentAppend: false, environment: environment(), stderr: "pipe", workdir: "/" },
    { command: ARRIVAL_LSOF_PYTHON, arguments: ["-I", "-S", "-B", helper, "listen", "44000", "501"], environmentAppend: false, environment: environment(), stderr: "pipe", workdir: "/" },
    { command: ARRIVAL_LSOF_PYTHON, arguments: ["-I", "-S", "-B", helper, "cwd", "123", "501"], environmentAppend: false, environment: environment(), stderr: "pipe", workdir: "/" },
  ]);
  assert.ok(fixture.verified.some(entry => entry.path === ARRIVAL_LSOF_PYTHON && entry.options.executable === true));
});

test("missing, untrusted and hash-mismatched files fail before native call", async () => {
  for (const settings of [{ verify: () => false }, { digest: () => "f".repeat(64) }]) {
    const fixture = runtimeFixture(settings);
    await assert.rejects(createNativeProjectArrivalSubprocess({ runtime: fixture.runtime }), refusal);
    assert.equal(fixture.calls.length, 0);
  }
});

test("changed helper after factory admission is refused before spawn", async () => {
  let hash = ARRIVAL_LSOF_SHA256;
  const fixture = runtimeFixture({ digest: () => hash });
  const adapter = await createNativeProjectArrivalSubprocess({ runtime: fixture.runtime });
  hash = "f".repeat(64);
  await assert.rejects(adapter.call(call("/usr/sbin/lsof", listen)), refusal);
  assert.equal(fixture.calls.length, 0);
});

test("per-call verification timeout cannot produce a late child", async () => {
  let digest = () => ARRIVAL_LSOF_SHA256;
  let lateResolve;
  const fastTimers = { setTimeout: callback => setTimeout(callback, 1), clearTimeout };
  const fixture = runtimeFixture({ digest: () => digest(), timers: fastTimers });
  const adapter = await createNativeProjectArrivalSubprocess({ runtime: fixture.runtime });
  digest = () => new Promise(resolve => { lateResolve = resolve; });
  await assert.rejects(adapter.call(call("/usr/sbin/lsof", listen)), refusal);
  lateResolve(ARRIVAL_LSOF_SHA256);
  await new Promise(resolve => setTimeout(resolve, 5));
  assert.equal(fixture.calls.length, 0);
});
