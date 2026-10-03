// Synthetic Node subprocess fixtures only. No real provider/CLI is executed.
import test from "node:test";
import assert from "node:assert/strict";
import { existsSync, mkdtempSync, readFileSync, realpathSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import * as core from "../../../packages/contexts/src/index.mjs";
import { UnderstandRunner } from "../../../packages/provider-host/src/understand.mjs";
import { createUnderstand, makeBriefRecord } from "../chrome/Understand.sys.mjs";

const fixture = name => fileURLToPath(new URL(`../../../packages/provider-host/fixtures/understand/${name}.mjs`, import.meta.url));
function setup(name, fake) {
  const base = realpathSync(tmpdir());
  assert(base.startsWith("/Volumes/AxioSozoBuild/workstation/"), `Fixture temp must stay external: ${base}`);
  const root = mkdtempSync(path.join(base, "plan4-understand-browser-"));
  const runner = new UnderstandRunner({ testOnlyLaunch: { "claude-code": { command: process.execPath, prefix: [fixture(name)] } } });
  let calls = 0;
  const runtime = { request(method, params) { calls++; assert.equal(method, "understand/run"); return runner.run(params); },
    cancel: params => runner.cancel(params), close: () => runner.close() };
  const current = { id: "p_harbor", revision: 2, canonicalRoot: realpathSync(root) };
  const api = createUnderstand({ runtime, lookupProject: () => current, core, uuid: () => "fixture", testOnlyAllowRun: fake, authorizeContext: () => true });
  return { root, api, current, calls: () => calls, async cleanup() { await api.close(); rmSync(root, { recursive: true, force: true }); } };
}

test("Real fake Node child passes read-only host contract and browser persistence", async () => {
  const s = setup("claude-ok", true);
  try {
    const done = await s.api.run({ projectId: "p_harbor", cli: "claude-code", timeoutMs: 10000 });
    assert.equal(done.result.status, "ok"); assert.equal(done.result.data_sent, true); assert.equal(s.calls(), 1);
    assert.equal(done.result.document.product, "Synthetic shop for testing.");
    const record = JSON.parse(readFileSync(path.join(s.root, "fixture-record.json"), "utf8"));
    assert.equal(record.cwd, s.current.canonicalRoot); assert.match(record.prompt, /Read-only/);
    assert(record.argv.includes("--safe-mode")); assert(record.argv.includes("--permission-mode"));
    assert.deepEqual(Object.keys(record.env).filter(key => key !== "__CF_USER_TEXT_ENCODING").sort(), ["HOME", "LANG", "PATH", "TERM"]);
    const brief = makeBriefRecord(done, s.current, { core, now: 1234 });
    assert.equal(brief.generated_at, 1234); assert.equal(brief.accepted, false);
  } finally { await s.cleanup(); }
});

test("Product browser default never invokes even the supplied fake runtime", async () => {
  const s = setup("claude-ok", false);
  try {
    const done = await s.api.run({ projectId: "p_harbor", cli: "claude-code" });
    assert.equal(done.result.reason, "NOT_AUTHORIZED"); assert.equal(done.result.data_sent, false);
    assert.equal(s.calls(), 0); assert.equal(existsSync(path.join(s.root, "fixture-record.json")), false);
  } finally { await s.cleanup(); }
});

test("Fake flooding child is killed by host and browser retains no document", async () => {
  const s = setup("flood", true);
  try {
    const done = await s.api.run({ projectId: "p_harbor", cli: "claude-code", timeoutMs: 10000 });
    assert.equal(done.result.status, "invalid_output"); assert.equal(done.result.reason, "OUTPUT_LIMIT");
    assert.equal(done.result.document, null); assert.equal(done.result.data_sent, true);
  } finally { await s.cleanup(); }
});
