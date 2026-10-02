import test from "node:test";
import assert from "node:assert/strict";
import { AgentChannelController, CHANNEL_LIMITS, projectForPath } from "../chrome/AgentChannelCore.sys.mjs";
import { parseHookEvent } from "../../../packages/contexts/src/agent-status.mjs";

const encode = value => new TextEncoder().encode(`${JSON.stringify(value)}\n`);
const flush = async () => { for (let i = 0; i < 12; i++) await Promise.resolve(); };
const deferred = () => { let resolve; const promise = new Promise(value => { resolve = value; }); return { promise, resolve }; };
class Clock {
  at = 1000000;
  next = 0;
  timers = new Map();
  now = () => this.at;
  setTimeout = (fn, wait) => { const id = ++this.next; this.timers.set(id, { at: this.at + wait, fn }); return id; };
  clearTimeout = id => this.timers.delete(id);
  async tick(ms) {
    const end = this.at + ms;
    for (;;) {
      const next = [...this.timers].filter(([, timer]) => timer.at <= end).sort((a, b) => a[1].at - b[1].at)[0];
      if (!next) break;
      this.at = next[1].at;
      this.timers.delete(next[0]);
      next[1].fn();
      await flush();
    }
    this.at = end;
    await flush();
  }
}
function fixture(overrides = {}) {
  const clock = new Clock(), statuses = [], approvals = [], actions = [], effects = [];
  const projects = [{ id: "p_harbor", root: "/synthetic/harbor", manifest: {
    name: "Harbor", environments: [{ name: "local", base_url: "http://localhost:4450/", app: "web" }],
  }, accounts: [{ key: "github.com", label: "NEVER_EXPORT" }], detected: { integrations: [{ id: "convex", name: "Convex", sources: ["SECRET"] }] } }];
  const tabs = [{ tab_id: "t_1", url: "http://localhost:4450/", title: "Fixture", active: true,
    project_id: "p_harbor", engine: "gecko", private: false, document_id: "doc1", account: "NEVER_EXPORT" }];
  let sequence = 0;
  const runtime = {
    now: clock.now, setTimeout: clock.setTimeout, clearTimeout: clock.clearTimeout,
    randomHex: () => (++sequence).toString(16).padStart(16, "0"), getProjects: () => projects, parseHookEvent,
    onStatus: (record, project) => statuses.push({ record, project }),
    requestApproval: (session, options) => { const pending = deferred(); approvals.push({ session, options, ...pending }); return pending.promise; },
    confirmAction: (action, options) => { const pending = deferred(); actions.push({ action, options, ...pending }); return pending.promise; },
    listTabs: () => tabs, getTab: id => tabs.find(tab => tab.tab_id === id),
    isSensitiveHost: host => host === "blocked.invalid",
    executeMethod: (method, params, session, options) => { effects.push({ method, params, session, options }); return { tab_id: "t_2" }; },
    ...overrides,
  };
  const controller = new AgentChannelController(runtime);
  const connections = [];
  const connect = (options = {}) => {
    const messages = [], closes = [];
    const endpoint = controller.accept({
      write(bytes) { if (options.brokenWrite) throw new Error(); messages.push(JSON.parse(new TextDecoder().decode(bytes))); },
      close(code) { closes.push(code); },
    });
    const connection = { ...endpoint, messages, closes };
    connections.push(connection);
    return connection;
  };
  return { controller, runtime, clock, projects, tabs, statuses, approvals, actions, effects, connect, connections };
}
const hello = (name = "agent-bridge", cwd = "/synthetic/harbor") => ({ v: 1, type: "hello",
  client: { name, agent: "claude-code", version: "1" }, cwd, pid: 123 });
const hook = (changes = {}) => ({ v: 1, type: "hook", source: "claude-code", event: "Stop", cwd: "/synthetic/harbor",
  payload: { cwd: "/synthetic/harbor", session_id: "opaque" }, ...changes });
const request = (connection, id, method = "tabs.list", params = {}) => connection.receive(encode({ v: 1, id, method, params }));
async function approved(f, cwd) {
  const c = f.connect(); c.receive(encode(hello("agent-bridge", cwd))); await flush();
  f.approvals.at(-1).resolve(true); await flush(); return c;
}

test("coalesced and split UTF-8 hello+hook complete at EOF without losing accepted status", async () => {
  const f = fixture(), c = f.connect();
  const bytes = encode(hello("axiosozo-notify"));
  c.receive(bytes.subarray(0, 23));
  c.receive(bytes.subarray(23));
  const report = encode(hook({ event: "Notification", payload: { cwd: "/synthetic/harbor/app", message: "Ready 🐙" } }));
  const multibyte = report.indexOf(240);
  c.receive(report.subarray(0, multibyte + 2)); c.receive(report.subarray(multibyte + 2));
  await c.end(); await flush();
  assert.equal(f.statuses.length, 1); assert.equal(f.statuses[0].record.title, "Ready 🐙");
  assert.equal(f.statuses[0].project, "p_harbor");
  assert.deepEqual(c.messages.map(message => message.type), ["welcome", "ack"]);
  assert.equal(c.messages[1].matched, true); assert.equal(f.controller.sessions.length, 0);
});
test("nc can close its read side early and fail welcome writes without dropping its buffered report", async () => {
  const f = fixture(), c = f.connect({ brokenWrite: true });
  const bytes = new Uint8Array([...encode(hello("axiosozo-notify")), ...encode(hook())]);
  c.receive(bytes); await c.end();
  assert.equal(f.statuses.length, 1); assert.equal(f.controller.sessions.length, 0);
});
test("payload cwd is parsed by the existing core and matched to its own known project", async () => {
  const f = fixture(); f.projects.push({ id: "p_nested", root: "/synthetic/harbor/nested", manifest: { name: "Nested", environments: [] } });
  const c = f.connect(); c.receive(encode(hello("axiosozo-notify")));
  c.receive(encode(hook({ payload: { cwd: "/synthetic/harbor/nested" } }))); await c.end();
  assert.equal(f.statuses[0].project, "p_nested");
  const outside = f.connect(); outside.receive(encode(hello("axiosozo-notify")));
  outside.receive(encode(hook({ payload: { cwd: "/synthetic/elsewhere" } }))); await outside.end();
  assert.equal(f.statuses.length, 1); assert.equal(outside.messages.at(-1).matched, false);
});
test("malformed/oversized hooks are acknowledged but never accepted or parsed as transcripts", async () => {
  const f = fixture();
  for (const report of [hook({ payload: { message: "x".repeat(65537) } }), hook({ source: "unknown" }), hook({ event: "SubagentStop" })]) {
    const c = f.connect(); c.receive(encode(hello("axiosozo-notify"))); c.receive(encode(report)); await c.end();
    assert.equal(c.messages.at(-1).matched, false);
  }
  assert.equal(f.statuses.length, 0);
});
test("global status report budget reserves synchronously across connections and expires", async () => {
  const f = fixture();
  for (let i = 0; i < 31; i++) {
    const c = f.connect(); c.receive(encode(hello("axiosozo-notify"))); c.receive(encode(hook())); await c.end();
    assert.equal(c.messages.at(-1).matched, i < 30);
  }
  assert.equal(f.statuses.length, 30); await f.clock.tick(60000);
  const c = f.connect(); c.receive(encode(hello("axiosozo-notify"))); c.receive(encode(hook())); await c.end();
  assert.equal(c.messages.at(-1).matched, true);
});
test("invalid JSON, UTF-8, object framing, missing newline and line overflow close", async () => {
  for (const bytes of [new Uint8Array([0xc0, 0xaf, 10]), new TextEncoder().encode("{oops}\n"), encode([]), encode(null),
    new Uint8Array(CHANNEL_LIMITS.clientLineBytes + 1).fill(65)]) {
    const f = fixture(), c = f.connect(); c.receive(bytes); await flush(); assert.equal(c.closes.length, 1);
  }
  const f = fixture(), c = f.connect(); c.receive(new TextEncoder().encode(JSON.stringify(hello()))); await c.end();
  assert.equal(c.closes.length, 1); assert.equal(c.messages.length, 0);
});
test("path matching requires absolute segment boundaries and rejects traversal", () => {
  const projects = [{ id: "a", root: "/synthetic/harbor" }, { id: "b", root: "/synthetic/harbor/deep" }];
  assert.equal(projectForPath(projects, "/synthetic/harbor/deep/app").id, "b");
  for (const path of ["/synthetic/harbor-other", "/synthetic/harbor/../else", "relative", "/"]) assert.equal(projectForPath(projects, path), null);
});
test("only eight connections are accepted and idle connections close after ten minutes", async () => {
  const f = fixture(); for (let i = 0; i < 9; i++) f.connect();
  assert.equal(f.controller.sessions.length, 8); assert.deepEqual(f.connections[8].closes, ["BUSY"]);
  await f.clock.tick(600000); assert.equal(f.controller.sessions.length, 0);
});
test("approval is per session, requests before grant fail, and late answers after timeout are ignored", async () => {
  const f = fixture(), c = f.connect(); c.receive(encode(hello())); request(c, 1); await flush();
  assert.equal(c.messages.at(-1).error.code, "NOT_APPROVED"); assert.equal(f.effects.length, 0);
  await f.clock.tick(54999); assert.equal(c.messages.at(-1).error.code, "NOT_APPROVED");
  await f.clock.tick(1); assert.deepEqual(c.messages.at(-1), { v: 1, type: "approval", granted: false });
  assert.equal(f.approvals[0].options.signal.aborted, true);
  f.approvals[0].resolve(true); await flush(); request(c, 2); await flush();
  assert.equal(c.messages.at(-1).error.code, "NOT_APPROVED");
  const c2 = await approved(f); request(c2, 3); await flush(); assert.ok(Array.isArray(c2.messages.at(-1).result));
  assert.equal(f.controller.revoke(c2.session), true); assert.equal(f.approvals[1].options.signal.aborted, true);
  assert.equal(f.controller.revoke(c2.session), false); f.controller.stop();
});
test("sixteen outstanding effect requests are bounded and timeouts abort/release slots", async () => {
  const f = fixture({ executeMethod: (_method, _params, _session, options) => { f.effects.push(options); return new Promise(() => {}); } });
  const c = await approved(f);
  for (let i = 1; i <= 17; i++) request(c, i, "console.errors", { tab_id: "t_1" });
  await flush(); assert.equal(c.messages.find(message => message.id === 17).error.code, "BUSY");
  assert.equal(f.effects.length, 16); await f.clock.tick(30000);
  assert.equal(f.effects.every(options => options.signal.aborted), true);
  assert.equal(c.messages.filter(message => message.error?.code === "TIMEOUT").length, 16);
  request(c, 18, "console.errors", { tab_id: "t_1" }); await flush(); assert.equal(f.effects.length, 17); f.controller.stop();
});
test("duplicate in-flight request ids close instead of confusing one confirmation with another", async () => {
  const f = fixture(), c = await approved(f); request(c, 1, "page.click", { tab_id: "t_1", selector: "button" });
  request(c, 1, "tabs.list"); await flush(); assert.equal(c.closes.length, 1);
  assert.equal(f.actions.length, 0); // The scheduled confirmation observes cancellation first.
});
test("list/active omit private and blocked tabs and strip account/internal metadata", async () => {
  const f = fixture(); f.tabs.push(
    { ...f.tabs[0], tab_id: "t_2", private: true }, { ...f.tabs[0], tab_id: "t_3", url: "https://blocked.invalid/" },
    { ...f.tabs[0], tab_id: "t_4", url: "about:preferences" }, { ...f.tabs[0], tab_id: "t_5", engine: "chromium", active: false },
  );
  const c = await approved(f); request(c, 1); request(c, 2, "project.info"); await flush();
  assert.deepEqual(c.messages.find(message => message.id === 1).result.map(tab => tab.tab_id), ["t_1", "t_5"]);
  assert.equal(JSON.stringify(c.messages).includes("NEVER_EXPORT"), false);
  assert.deepEqual(c.messages.find(message => message.id === 2).result.apps, [{ app: "web", environments: [{ name: "local", base_url: "http://localhost:4450/" }] }]);
  f.controller.stop();
});
test("tab effects enforce private, privileged, blocked, Chromium, project and safety-metadata gates", async () => {
  for (const [mutation, code] of [
    [{ private: true }, "PRIVATE"], [{ private: undefined }, "UNAVAILABLE"],
    [{ url: "about:preferences" }, "BLOCKED_CATEGORY"], [{ url: "https://blocked.invalid/" }, "BLOCKED_CATEGORY"],
    [{ engine: "chromium" }, "UNAVAILABLE"], [{ project_id: "other" }, "NOT_IN_PROJECT"],
  ]) {
    const f = fixture(); Object.assign(f.tabs[0], mutation); const c = await approved(f);
    request(c, 1, "page.click", { tab_id: "t_1", selector: "button" }); await flush();
    assert.equal(c.messages.at(-1).error.code, code); assert.equal(f.actions.length, 0); assert.equal(f.effects.length, 0); f.controller.stop();
  }
  const f = fixture(), c = await approved(f, "/synthetic/elsewhere");
  request(c, 1, "page.click", { tab_id: "t_1", selector: "button" }); await flush();
  assert.equal(c.messages.at(-1).error.code, "NO_PROJECT"); f.controller.stop();
});
test("act tools need Allow once; deny/timeouts and document changes cancel effects", async () => {
  for (const mode of ["deny", "timeout", "navigation", "document", "revoke", "allow"]) {
    const f = fixture(), c = await approved(f);
    request(c, 1, "page.click", { tab_id: "t_1", selector: "button" }); await flush();
    assert.equal(f.actions.length, 1); assert.equal(f.effects.length, 0);
    if (mode === "timeout") await f.clock.tick(60000);
    else if (mode === "revoke") f.controller.revoke(c.session);
    else {
      if (mode === "navigation") f.tabs[0].url += "other";
      if (mode === "document") f.tabs[0].document_id = "doc2";
      f.actions[0].resolve(mode !== "deny"); await flush();
    }
    assert.equal(f.effects.length, mode === "allow" ? 1 : 0);
    if (mode !== "allow" && mode !== "revoke") assert.equal(c.messages.at(-1).error.code, "DENIED");
    f.controller.stop();
  }
});
test("read EOF suppresses a pending act confirmation even if its user answer arrives later", async () => {
  const f = fixture(), c = await approved(f); request(c, 1, "page.type", { tab_id: "t_1", selector: "textarea", text: "fixture" });
  await flush(); const ended = c.end(); f.actions[0].resolve(true); await ended;
  assert.equal(f.effects.length, 0); assert.equal(c.messages.at(-1).error.code, "DENIED");
});
test("method and parameter contracts reject malformed or privileged inputs before effects", async () => {
  const f = fixture(), c = await approved(f);
  for (const [method, params, expected] of [["unknown", {}, "UNKNOWN_METHOD"], ["tabs.open", { url: "file:///private" }, "INVALID_PARAMS"],
    ["tabs.open", { url: "https://u:p@localhost/" }, "INVALID_PARAMS"], ["tabs.list", { extra: true }, "INVALID_PARAMS"],
    ["tabs.screenshot", { tab_id: "t_1", max_width: 1921 }, "INVALID_PARAMS"], ["page.click", { tab_id: "t_1", selector: "x".repeat(513) }, "INVALID_PARAMS"],
    ["tabs.navigate", { tab_id: "t_1", url: "https://blocked.invalid/" }, "BLOCKED_CATEGORY"]]) {
    const id = c.messages.length + 10; request(c, id, method, params); await flush(); assert.equal(c.messages.at(-1).error.code, expected);
  }
  assert.equal(f.effects.length, 0); f.controller.stop();
});
test("known unavailable runtime methods fail before a needless action confirmation", async () => {
  const f = fixture({ isMethodAvailable: method => method !== "page.click" }), c = await approved(f);
  request(c, 1, "page.click", { tab_id: "t_1", selector: "button" }); await flush();
  assert.equal(c.messages.at(-1).error.code, "UNAVAILABLE"); assert.equal(f.actions.length, 0);
  request(c, 2, "tabs.list"); await flush(); assert.ok(Array.isArray(c.messages.at(-1).result)); f.controller.stop();
});
test("screenshots enforce PNG/decoded byte caps and console output is bounded", async () => {
  const f = fixture({ executeMethod: (method) => method === "tabs.screenshot"
    ? { mime: "image/png", width: 100, height: 100, data_base64: "iVBORw0KGgo=" }
    : { count: 100, messages: Array.from({ length: 80 }, (_, i) => ({ level: "error", text: "x".repeat(1500), source: "fixture", line: i, at: i })) } });
  const c = await approved(f); request(c, 1, "tabs.screenshot", { tab_id: "t_1" }); request(c, 2, "console.errors", { tab_id: "t_1" }); await flush();
  assert.equal(c.messages.find(message => message.id === 1).result.mime, "image/png");
  const errors = c.messages.find(message => message.id === 2).result; assert.equal(errors.count, 100);
  assert.equal(errors.messages.length, 50); assert.equal(errors.messages[0].text.length, 1000);
  f.runtime.executeMethod = () => ({ mime: "image/png", width: 100, height: 100, data_base64: "iVBORw0KGgo" + "A".repeat(2796205) });
  request(c, 3, "tabs.screenshot", { tab_id: "t_1" }); await flush(); assert.equal(c.messages.at(-1).error.code, "TOO_LARGE");
  f.controller.stop();
});
test("revoke aborts an active effect and suppresses its late result", async () => {
  const waiting = deferred(), f = fixture({ executeMethod: (_m, _p, _s, options) => { f.effects.push(options); return waiting.promise; } });
  const c = await approved(f); request(c, 1, "console.errors", { tab_id: "t_1" }); await flush();
  f.controller.revoke(c.session); assert.equal(f.effects[0].signal.aborted, true);
  waiting.resolve({ count: 0, messages: [] }); await flush(); assert.equal(c.messages.some(message => message.id === 1), false);
});
