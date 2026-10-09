/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. https://mozilla.org/MPL/2.0/ */
// The Understand setup check of a folder being added (understand-v1 §3.3,
// §5.1): closed in production before anything is looked at; offline, bound to
// a privileged preview binding, the client chosen automatically, the document
// validated and nothing persisted. Synthetic fakes only; no provider client runs.
import nativeTest from "node:test";
const test = (name, run) => nativeTest(name, { timeout: 2000 }, run);
import assert from "node:assert/strict";
import * as core from "../../../packages/contexts/src/index.mjs";
import "./support/chrome-modules.mjs";
const { createUnderstandService, createOfflineUnderstandService } = await import("../chrome/UnderstandService.sys.mjs");
const { pickSetupCli, SETUP_MODELS } = await import("../chrome/Understand.sys.mjs");

const BASE = "/Volumes/AxioSozoBuild/workstation/gui-fixtures/understand-0123456789abcdef0123456789abcdef/projects";
const ROOT = `${BASE}/harbor`;
const tick = async (count = 30) => { for (let i = 0; i < count; i++) await Promise.resolve(); };
const SETUP = () => ({ version: 1, name: "Harbor Suite", kind: "web", kind_reason: "A web storefront", icon: "apps/web/public/icon.png",
  services: [{ name: "web", kind: "web", command: "pnpm dev", cwd: "apps/web", url: "http://localhost:5173/" },
    { name: "worker", kind: "worker", command: "pnpm run worker", cwd: null, url: null }] });

function harness({ production = false, clis = [{ cli: "codex", path: "/fixed/private/node", version: "synthetic-1" }], reply } = {}) {
  let at = 1000, id = 0, sequence = 0;
  const tasks = new Map(), counts = { lookups: 0, admission: 0, opens: 0 }, calls = [];
  const timers = { setTimeout(fn, ms) { tasks.set(++id, { fn, due: at + ms }); return id; }, clearTimeout(key) { tasks.delete(key); } };
  const transport = {
    request(method, params) {
      if (method === "understand/available") return Promise.resolve({ clis });
      calls.push({ method, params });
      return Promise.resolve(reply ? reply(params) : { version: 1, request_id: params.request_id, kind: params.kind, cli: params.cli,
        status: "ok", reason: null, document: SETUP(), data_sent: true, duration_ms: 40 });
    },
    cancel() { return Promise.resolve({ cancelled: true }); }, close() { return Promise.resolve(); },
  };
  const deps = { core, lookupSnapshot: () => { counts.lookups++; return null; },
    rootAdmission: root => { counts.admission++; return root === ROOT; },
    commitProject() { throw new Error("a setup check never commits"); }, uuid: () => `setup_uuid_${String(++sequence).padStart(8, "0")}`,
    clock: () => at, timers };
  const api = production ? createUnderstandService(deps)
    : createOfflineUnderstandService(deps, { openRuntime: async () => { counts.opens++; return { transport, projectRoots: [ROOT] }; } });
  const owner = api.createOwner({ current: () => true });
  const binding = { id: "s_setup1", revision: 900, canonicalRoot: ROOT };
  return { api, owner, binding, counts, calls };
}

test("automatic client choice prefers Codex, then Claude Code; models are the cheapest suitable ones", () => {
  assert.equal(pickSetupCli(["claude-code", "codex"]), "codex");
  assert.equal(pickSetupCli(["claude-code"]), "claude-code");
  assert.equal(pickSetupCli([]), null);
  assert.equal(pickSetupCli("codex"), null);
  assert.deepEqual(SETUP_MODELS, { codex: "gpt-6-luna", "claude-code": "claude-sonnet-5-5" });
});

test("production answers NOT_AUTHORIZED before any binding, admission, lookup or runtime", async () => {
  const s = harness({ production: true });
  const value = await s.api.setup(s.owner, {});
  assert.deepEqual([value.kind, value.status, value.reason, value.cli, value.model, value.document, value.data_sent], ["setup", "unavailable", "NOT_AUTHORIZED", null, null, null, false]);
  const withBinding = await s.api.setup(s.owner, { binding: s.binding, current: () => true });
  assert.equal(withBinding.reason, "NOT_AUTHORIZED");
  assert.deepEqual(s.counts, { lookups: 0, admission: 0, opens: 0 });
  await assert.rejects(s.api.setup({}, {}), { code: "OWNER_REVOKED" });
});

test("offline: a previewed fixture folder is checked with Codex; the document is validated and nothing is saved", async () => {
  const s = harness();
  const value = await s.api.setup(s.owner, { binding: s.binding, current: () => true });
  assert.deepEqual([value.status, value.reason, value.kind, value.cli, value.model, value.data_sent], ["ok", null, "setup", "codex", "gpt-6-luna", true]);
  assert.deepEqual(value.document, core.validateSetupDocument(SETUP()));
  assert.equal(value.document.services[0].url, "http://localhost:5173");
  assert.equal(s.calls.length, 1);
  assert.deepEqual(Object.keys(s.calls[0].params).sort(), ["cli", "kind", "project_root", "request_id", "timeout_ms"]);
  assert.deepEqual([s.calls[0].params.kind, s.calls[0].params.cli, s.calls[0].params.project_root], ["setup", "codex", ROOT]);
  assert.equal(s.counts.lookups, 0, "a preview is never a project lookup");
  assert.equal(JSON.stringify(value).includes(ROOT), false, "the answer names no path");
  await s.api.close();
});

test("offline: no installed client, a stale preview, an invalid answer and bad bindings", async () => {
  const none = harness({ clis: [] });
  assert.equal((await none.api.setup(none.owner, { binding: none.binding, current: () => true })).reason, "CLI_NOT_INSTALLED");
  assert.equal(none.calls.length, 0);
  const claude = harness({ clis: [{ cli: "claude-code", path: "/fixed/private/claude", version: "1" }] });
  const viaClaude = await claude.api.setup(claude.owner, { binding: claude.binding, current: () => true });
  assert.deepEqual([viaClaude.cli, viaClaude.model], ["claude-code", "claude-sonnet-5-5"]);
  let current = true;
  const stale = harness({ reply: params => { current = false; return { version: 1, request_id: params.request_id, kind: "setup", cli: params.cli,
    status: "ok", reason: null, document: SETUP(), data_sent: true, duration_ms: 1 }; } });
  const answer = await stale.api.setup(stale.owner, { binding: stale.binding, current: () => current });
  assert.deepEqual([answer.status, answer.reason, answer.document], ["cancelled", "STALE_PROJECT", null], "a preview replaced meanwhile yields nothing");
  const invalid = harness({ reply: params => ({ version: 1, request_id: params.request_id, kind: "setup", cli: params.cli, status: "ok", reason: null,
    document: { ...SETUP(), icon: "../outside.png" }, data_sent: true, duration_ms: 1 }) });
  const refused = await invalid.api.setup(invalid.owner, { binding: invalid.binding, current: () => true });
  assert.deepEqual([refused.status, refused.reason, refused.document], ["invalid_output", "SCHEMA_MISMATCH", null]);
  const s = harness();
  for (const params of [{ binding: { ...s.binding, id: "p_harbor" }, current: () => true }, { binding: s.binding }, { binding: s.binding, current: () => true, root: ROOT },
    { binding: { ...s.binding, canonicalRoot: "/Users/someone/project" }, current: () => true }]) {
    await assert.rejects(s.api.setup(s.owner, params), error => ["INVALID_PARAMS", "INVALID_PROJECT"].includes(error.code), JSON.stringify(Object.keys(params)));
  }
  await tick();
  for (const item of [none, claude, stale, invalid, s]) await item.api.close();
});
