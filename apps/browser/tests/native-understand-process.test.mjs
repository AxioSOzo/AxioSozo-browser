// OWNED OFFLINE FIXTURE TESTS. Source review must precede the first actual run.
// Install separately; this harness never creates, reads or removes profile data.
import test from "node:test";
import assert from "node:assert/strict";
import * as core from "../../../packages/contexts/src/index.mjs";
import { createNativeUnderstandFixtureRuntime, UNDERSTAND_FIXTURE_LIMITS }
  from "../chrome/NativeUnderstandFixtureRuntime.sys.mjs";
import { createUnderstandTransport } from "../chrome/ProviderUnderstand.sys.mjs";
import { createUnderstand, makeBriefRecord } from "../chrome/Understand.sys.mjs";
import { processRuntime, fixtureProfileForRoot } from "./understand-process-runtime.mjs";

const root = process.env.AXIOSOZO_UNDERSTAND_GUI_FIXTURE_ROOT;
const requested = root !== undefined && root !== "";
const profile = requested ? fixtureProfileForRoot(root) : undefined;
if (requested) {
  assert.equal(process.env.AXIOSOZO_SYNTHETIC_TEST, "1");
  assert.equal(process.env.AXIOSOZO_UNDERSTAND_GUI_FIXTURE, "1");
  if (process.env.AXIOSOZO_UNDERSTAND_GUI_FIXTURE_PROFILE !== undefined)
    assert.equal(process.env.AXIOSOZO_UNDERSTAND_GUI_FIXTURE_PROFILE, profile);
}
const actual = { skip: !requested, timeout: 10000, concurrency: false };
const hostCalls = seam => seam.callLog.filter(row => row.kind === "host");

async function session({ fake = true, project = "harbor", signal } = {}) {
  assert(requested, "An explicitly installed owned fixture root is required.");
  const seam = processRuntime({ root, profile });
  const offset = seam.readReceipts().length;
  const adapted = await createNativeUnderstandFixtureRuntime({ runtime: seam.runtime, signal });
  assert(Object.isFrozen(adapted)); assert.equal(adapted.fixturePaths.profile, profile);
  const transport = createUnderstandTransport({ runtime: adapted });
  const binding = Object.freeze({ id: `p_${project}`, revision: 1,
    canonicalRoot: `${root}/projects/${project}` });
  const states = [];
  const api = createUnderstand({ runtime: transport, lookupProject: id => id === binding.id ? binding : null,
    core, uuid: seam.runtime.uuid, timers: seam.runtime.timers, testOnlyAllowRun: fake,
    authorizeContext: () => true, onState: state => states.push(state) });
  return { seam, offset, adapted, transport, binding, states, api, async close() {
    await api.close(); await transport.close();
  }, async emergencyCleanup() {
    await api.close().catch(() => {}); await transport.close().catch(() => {});
    await seam.closeOwnedHosts();
  } };
}
const knownClosed = async s => {
  const proof = await s.seam.waitForFixtureReaped({ afterRecord: s.offset, timeoutMs: 4000 });
  assert.deepEqual(proof.alive, []);
  assert(s.seam.receipt.every(row => row.reaped === true));
  return proof;
};

// These tests do not spawn children, even when no external fixture is installed.
test("absent native fixture request performs zero child work", async () => {
  for (const request of [undefined, null, ""]) {
    const seam = processRuntime({ root: request });
    assert(Object.isFrozen(seam.runtime)); assert(Object.isFrozen(seam.environment));
    assert.equal(await createNativeUnderstandFixtureRuntime({ runtime: seam.runtime }), null);
    assert.deepEqual(seam.callLog, []); assert.deepEqual(seam.receipt, []);
  }
});
test("test seam rejects actor paths, mismatched profiles, flags and arbitrary process commands", async () => {
  const fixed = "/Volumes/AxioSozoBuild/workstation/gui-fixtures/understand-0123456789abcdef0123456789abcdef";
  assert.throws(() => fixtureProfileForRoot("/Users/synthetic/profile"));
  assert.throws(() => processRuntime({ root: fixed, profile: fixtureProfileForRoot(fixed) + "/nested" }));
  assert.throws(() => processRuntime({ syntheticFlag: "0" }));
  assert.throws(() => processRuntime({ fixtureFlag: "true" }));
  const seam = processRuntime();
  await assert.rejects(seam.runtime.spawn({ command: "/usr/bin/security", arguments: ["find-generic-password"],
    environmentAppend: false, environment: { LANG: "C", LC_ALL: "C" }, workdir: "/", stderr: "pipe" }));
  assert.deepEqual(seam.callLog, []);
});

test("actual native admission and available report only the two fixed offline CLI fixtures", actual, async () => {
  const s = await session();
  try {
    assert.equal(hostCalls(s.seam).length, 0);
    const beforeDenied = s.seam.callLog.length;
    await assert.rejects(s.seam.runtime.spawn({ command: "/usr/bin/security", arguments: ["find-generic-password"],
      environmentAppend: false, environment: { LANG: "C", LC_ALL: "C" }, workdir: "/", stderr: "pipe" }));
    await assert.rejects(s.seam.runtime.spawn({ command: "/usr/bin/stat", arguments: ["-f", "%u %l %Op %z %d %i", "/outside-fixture"],
      environmentAppend: false, environment: { LANG: "C", LC_ALL: "C" }, workdir: "/", stderr: "pipe" }));
    assert.equal(s.seam.callLog.length, beforeDenied);
    const available = await s.api.available();
    assert.deepEqual(available, { clis: ["claude-code", "codex"].map(cli => ({ cli,
      path: s.adapted.fixturePaths.node, version: "synthetic-1" })) });
    assert.equal(hostCalls(s.seam).length, 1);
    assert(s.seam.callLog.every(row => row.shell === false && row.workdir === "/"));
    assert(s.seam.callLog.every(row => !row.environment_keys.includes("HOME")
      && !row.environment_keys.includes("AXIOSOZO_BUILD_ROOT")
      && !row.environment_keys.includes("OPENAI_API_KEY")));
    assert.equal(s.seam.readReceipts().slice(s.offset).filter(row => row.mode === "cli").length, 0);
    await s.close(); await knownClosed(s);
  } finally { await s.emergencyCleanup(); }
});

test("actual admitted dependency leaves the product controller NOT_AUTHORIZED with zero run children", actual, async () => {
  const s = await session({ fake: false });
  try {
    const metadataCalls = s.seam.callLog.length, before = s.seam.readReceipts().length;
    const done = await s.api.run({ projectId: s.binding.id, cli: "codex", timeoutMs: 10000 });
    assert.equal(done.result.status, "unavailable"); assert.equal(done.result.reason, "NOT_AUTHORIZED");
    assert.equal(done.result.data_sent, false); assert.equal(done.result.document, null);
    assert.equal(s.seam.callLog.length, metadataCalls); assert.equal(hostCalls(s.seam).length, 0);
    assert.equal(s.seam.readReceipts().length, before);
    await s.close(); await knownClosed(s);
  } finally { await s.emergencyCleanup(); }
});

for (const [cli, project] of [["claude-code", "harbor"], ["codex", "inkline"]]) {
  test(`actual fixed ${cli} fake brief crosses native admission, raw transport and browser validation`, actual, async () => {
    const s = await session({ project });
    try {
      const done = await s.api.run({ projectId: s.binding.id, cli, timeoutMs: 10000 });
      assert.equal(done.result.status, "ok"); assert.equal(done.result.reason, null);
      assert.equal(done.result.data_sent, true); assert.deepEqual(done.binding, s.binding);
      assert.equal(done.result.document.product, "Synthetic shop for testing.");
      assert.equal(done.result.document.domains[0].host, "shop.example.test");
      const record = makeBriefRecord(done, s.binding, { core, now: 1234 });
      assert.equal(record.generated_at, 1234); assert.equal(record.accepted, false); assert.equal(record.cli, cli);
      const rows = s.seam.readReceipts().slice(s.offset);
      assert.equal(rows.filter(row => row.mode === "host").length, 1);
      assert.equal(rows.filter(row => row.mode === "cli").length, 1);
      assert(s.states.some(state => state.state === "running"));
      await s.close(); await knownClosed(s);
    } finally { await s.emergencyCleanup(); }
  });
}

test("actual fixed fake error explanation satisfies the strict browser explanation contract", actual, async () => {
  const s = await session();
  try {
    const done = await s.api.run({ projectId: s.binding.id, cli: "codex", kind: "explain_errors", timeoutMs: 10000,
      input: { url: "http://localhost:4173/", errors: [{ level: "error", text: "TypeError: x is undefined",
        source: "src/config.ts?synthetic=1#fixture", line: 12 }] } });
    assert.equal(done.result.status, "ok"); assert.equal(done.result.data_sent, true);
    assert.equal(done.result.kind, "explain_errors");
    assert.deepEqual(done.result.document, { version: 1, summary: "The API base URL is missing.",
      items: [{ error: "TypeError: x is undefined", likely_cause: "config not loaded", where: "src/config.ts" }] });
    await s.close(); await knownClosed(s);
  } finally { await s.emergencyCleanup(); }
});

test("actual queued cancellation never launches a second CLI and reports zero data sent", actual, async () => {
  const s = await session();
  try {
    const first = s.api.run({ projectId: s.binding.id, cli: "claude-code", timeoutMs: 10000 });
    const abort = new AbortController();
    const second = s.api.run({ projectId: s.binding.id, cli: "codex", timeoutMs: 10000 }, { signal: abort.signal });
    assert.equal(s.api.diagnostics().queued, 1); abort.abort();
    const queued = await second;
    assert.equal(queued.result.status, "cancelled"); assert.equal(queued.result.reason, "CANCELLED");
    assert.equal(queued.result.data_sent, false); assert.equal(queued.result.document, null);
    assert.equal((await first).result.status, "ok");
    assert.equal(s.seam.readReceipts().slice(s.offset).filter(row => row.mode === "cli").length, 1);
    await s.close(); await knownClosed(s);
  } finally { await s.emergencyCleanup(); }
});

test("actual active cancellation sends wire cancel and reaps the owned fixed CLI group", actual, async () => {
  const s = await session();
  try {
    const abort = new AbortController();
    const pending = s.api.run({ projectId: s.binding.id, cli: "codex", timeoutMs: 10000 }, { signal: abort.signal });
    await s.seam.waitForReceipt(row => row.mode === "cli", { afterRecord: s.offset, timeoutMs: 4000 });
    abort.abort();
    const done = await pending;
    assert.equal(done.result.status, "cancelled"); assert.equal(done.result.reason, "CANCELLED");
    assert.equal(done.result.data_sent, true); assert.equal(done.result.document, null);
    assert.equal(s.seam.readReceipts().slice(s.offset).filter(row => row.mode === "cli").length, 1);
    const available = await s.api.available();
    assert.deepEqual(available.clis.map(row => row.cli), ["claude-code", "codex"]);
    assert.equal(hostCalls(s.seam).length, 1); // Cancellation retained the same live host.
    await s.close(); await knownClosed(s);
  } finally { await s.emergencyCleanup(); }
});

test("raw EOF after closing owned host input reaps its active fixed CLI topology", actual, async () => {
  const s = await session();
  try {
    const terminal = s.transport.request("understand/run", { request_id: s.seam.runtime.uuid(), kind: "brief", cli: "codex",
      project_root: s.binding.canonicalRoot, timeout_ms: 10000 }, { timeoutMs: 10000 })
      .then(value => ({ value }), error => ({ error }));
    await s.seam.waitForReceipt(row => row.mode === "cli", { afterRecord: s.offset, timeoutMs: 4000 });
    await s.seam.closeOwnedHostInput();
    const done = await terminal;
    assert.equal(done.value, undefined); assert.equal(done.error.name, "UnderstandTransportError");
    assert.equal(done.error.code, "HOST_UNAVAILABLE"); assert.equal(done.error.data_sent, true);
    await s.close();
    const proof = await knownClosed(s);
    assert.equal(proof.records.filter(row => row.mode === "host").length, 1);
    assert.equal(proof.records.filter(row => row.mode === "cli").length, 1);
  } finally { await s.emergencyCleanup(); }
});

test("fixed owned Python supervisor SIGUSR1 crashes its Node host and reaps fixture descendants", actual, async () => {
  const s = await session();
  try {
    const pending = s.api.run({ projectId: s.binding.id, cli: "claude-code", timeoutMs: 10000 });
    const cli = await s.seam.waitForReceipt(row => row.mode === "cli", { afterRecord: s.offset, timeoutMs: 4000 });
    const host = await s.seam.crashOwnedNodeHost();
    assert.equal(host.mode, "host"); assert.equal(host.launcher_pid, hostCalls(s.seam)[0].pid);
    assert.notEqual(cli.launcher_pid, host.child_pid); assert.notEqual(cli.child_pid, host.child_pid);
    const done = await pending;
    assert.equal(done.result.status, "failed"); assert.equal(done.result.document, null);
    assert.equal(done.result.data_sent, true); assert.equal(done.result.reason, "HOST_UNAVAILABLE");
    await s.close();
    const proof = await knownClosed(s);
    assert.equal(proof.records.filter(row => row.mode === "host").length, 1);
    assert.equal(proof.records.filter(row => row.mode === "cli").length, 1);
  } finally { await s.emergencyCleanup(); }
});

test("native kill(0) preserves the owned helper's fixed 750 ms cleanup grace", actual, async () => {
  const s = await session();
  let child;
  try {
    const paths = s.adapted.fixturePaths;
    child = await s.adapted.spawn({ command: paths.node, arguments: [paths.virtualHost, "serve"],
      environmentAppend: false, environment: { PATH: "/usr/bin:/bin", LANG: "C" }, stderr: "pipe" });
    const host = await s.seam.waitForReceipt(row => row.mode === "host", { afterRecord: s.offset, timeoutMs: 4000 });
    assert.equal(host.launcher_pid, child.pid);
    await child.kill(0); await child.wait();
    assert.deepEqual(hostCalls(s.seam)[0].kill_graces, [UNDERSTAND_FIXTURE_LIMITS.hostKillGraceMs]);
    assert.equal(UNDERSTAND_FIXTURE_LIMITS.hostKillGraceMs, 750);
    await knownClosed(s);
  } finally {
    if (child) { await child.stdin.close(true).catch(() => {});
      await child.stdout.close(true).catch(() => {}); await child.stderr.close(true).catch(() => {}); }
    await s.emergencyCleanup();
  }
});
