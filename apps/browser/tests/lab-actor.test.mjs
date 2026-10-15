/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. https://mozilla.org/MPL/2.0/ */

// The about:axiosozo actor's Lab methods (AboutAxioSozoParent listLab,
// setLabEnabled, getLabClients): parameter shapes, the normal-window gate, the
// fixed error codes and the reply sanitizers (labReply, labClientsReply).
// Synthetic: a fake Lab module, fake services and prefs, and a fake actor
// sender like about-axiosozo.test.mjs builds; the real Lab registry is used
// where noted. No Gecko actor, window, pref service or AI client is involved.
import "./support/chrome-modules.mjs";
import test from "node:test";
import assert from "node:assert/strict";
import { fakePrefs } from "./support/lab-harness.mjs";

const {
  AboutAxioSozoParent, dispatch, validateRequest, labReply, labClientsReply, setProvidersForTesting, OverviewError, MESSAGES, LAB_URL,
} = await import("../chrome/AboutAxioSozoParent.sys.mjs");
const Lab = await import("../chrome/lab/Lab.sys.mjs");
const M = await import("../chrome/overview/overview-model.mjs");

const WINDOW = Object.freeze({ name: "synthetic browser window" });

/** A Lab module that records what the actor asked. */
function fakeLab({ list = null, clients = [] } = {}) {
  const calls = [];
  const lab = {
    listForPage(options) { calls.push(["listForPage", options]); return list ?? { version: 1, groups: ["Your day"], experiments: [] }; },
    setEnabledFromPage(id, enabled, options) { calls.push(["setEnabledFromPage", id, enabled, options]); return list ?? { version: 1, groups: [], experiments: [] }; },
    async clientStatusForPage(options) { calls.push(["clientStatusForPage", options]); return clients; },
  };
  return { lab, calls };
}

/** The ctx the actor hands its methods, with literal facts. */
function labCtx({ lab = fakeLab().lab, prefs = fakePrefs(), isPrivate = false, current = true, window = WINDOW, normal = true,
  services = undefined } = {}) {
  return {
    services: services ?? { isNormalWindow: candidate => normal && candidate === WINDOW },
    pickedRoots: new Set(),
    window: () => window,
    isPrivate: () => isPrivate,
    current: () => current,
    prefs: () => prefs,
    lab: () => lab,
  };
}

const good = (overrides = {}) => ({ id: "page-tldr", title: "Page summary", pitch: "Sums up the page you are on.", howToTry: ["Turn it on."],
  group: "AI on the page", variantOf: null, family: "page-tldr", needs: ["claude-code"], graduated: false, live: true, enabled: false,
  problem: null, ...overrides });

// ---------------------------------------------------------------- params

test("listLab takes no parameters; setLabEnabled exactly { id, enabled }; getLabClients an optional boolean check", () => {
  for (const params of [undefined, null, {}]) assert.deepEqual(validateRequest({ name: "listLab", params }).params, {});
  assert.throws(() => validateRequest({ name: "listLab", params: { prefs: "axiosozo.lab.x.enabled" } }), { code: "INVALID_PARAMS" });
  assert.throws(() => validateRequest({ name: "listLab", params: [] }), { code: "INVALID_PARAMS" });

  assert.deepEqual(validateRequest({ name: "setLabEnabled", params: { id: "page-tldr", enabled: true } }).params, { id: "page-tldr", enabled: true });
  assert.deepEqual(validateRequest({ name: "setLabEnabled", params: { id: `a${"b".repeat(39)}`, enabled: false } }).params.enabled, false);
  for (const id of ["", "Page", "page_tldr", "page--tldr", "page-", "-page", "1page", "page tldr", "page/tldr", "../x", "page.tldr",
    `a${"b".repeat(40)}`, 5, null, true, ["page-tldr"], { id: "page-tldr" }, undefined]) {
    assert.throws(() => validateRequest({ name: "setLabEnabled", params: { id, enabled: true } }), { code: "INVALID_PARAMS" }, String(id));
  }
  for (const enabled of ["true", 1, 0, null, undefined, {}]) {
    assert.throws(() => validateRequest({ name: "setLabEnabled", params: { id: "page-tldr", enabled } }), { code: "INVALID_PARAMS" }, String(enabled));
  }
  for (const params of [{ id: "page-tldr" }, { enabled: true }, {}, undefined, { id: "page-tldr", enabled: true, pref: "axiosozo.x.enabled" },
    { id: "page-tldr", enabled: true, module: "x.sys.mjs" }, { id: "page-tldr", enabled: true, window: 1 }, "page-tldr", [["page-tldr", true]]]) {
    assert.throws(() => validateRequest({ name: "setLabEnabled", params }), { code: "INVALID_PARAMS" }, JSON.stringify(params));
  }

  for (const params of [undefined, {}, { check: true }, { check: false }]) validateRequest({ name: "getLabClients", params });
  for (const params of [{ check: "true" }, { check: 1 }, { check: null }, { check: true, force: true }, { client: "codex" }, []]) {
    assert.throws(() => validateRequest({ name: "getLabClients", params }), { code: "INVALID_PARAMS" }, JSON.stringify(params));
  }
});

test("a bad request reaches no Lab module at all", async () => {
  let asked = 0;
  const ctx = { ...labCtx(), lab: () => { asked++; return fakeLab().lab; } };
  await assert.rejects(dispatch(ctx, { name: "setLabEnabled", params: { id: "Bad id", enabled: true } }), { code: "INVALID_PARAMS" });
  await assert.rejects(dispatch(ctx, { name: "getLabClients", params: { check: "yes" } }), { code: "INVALID_PARAMS" });
  await assert.rejects(dispatch(ctx, { name: "listLab", params: { all: true } }), { code: "INVALID_PARAMS" });
  assert.equal(asked, 0);
});

// ---------------------------------------------------------------- listLab

test("listLab reads the Lab with the browser's prefs only and answers through labReply", async () => {
  const prefs = fakePrefs();
  const raw = { version: 1, groups: ["Your day"], experiments: [good({ module: "page-tldr.sys.mjs", installer: "installPageTldr" })], extra: "x" };
  const { lab, calls } = fakeLab({ list: raw });
  const reply = await dispatch(labCtx({ lab, prefs }), { name: "listLab", params: {} });
  assert.deepEqual(calls, [["listForPage", { prefs }]]);
  assert.deepEqual(reply, { version: 1, groups: ["Your day"], experiments: [good()] });
  // Reading changes nothing, so any window may read it.
  const again = fakeLab({ list: raw });
  assert.deepEqual(await dispatch(labCtx({ lab: again.lab, isPrivate: true, current: false, window: null }), { name: "listLab" }), reply);
});

// ---------------------------------------------------------------- setLabEnabled

test("setLabEnabled turns a switch through the Lab with the browser's prefs and answers through labReply", async () => {
  const prefs = fakePrefs();
  const { lab, calls } = fakeLab({ list: { version: 1, groups: [], experiments: [good({ enabled: true, pref: "axiosozo.lab.page-tldr.enabled" })] } });
  const reply = await dispatch(labCtx({ lab, prefs }), { name: "setLabEnabled", params: { id: "page-tldr", enabled: true } });
  assert.deepEqual(calls, [["setEnabledFromPage", "page-tldr", true, { prefs }]]);
  assert.deepEqual(reply, { version: 1, groups: [], experiments: [good({ enabled: true })] });
});

test("setLabEnabled refuses a private, unknown or other window and a page that is gone, before the Lab is asked", async () => {
  const refusals = [
    ["private window", { isPrivate: true }, "PRIVATE_WINDOW"],
    ["privacy unknown", { isPrivate: null }, "PRIVATE_WINDOW"],
    ["privacy not a boolean", { isPrivate: "false" }, "PRIVATE_WINDOW"],
    ["page gone", { current: false }, "DOCUMENT_GONE"],
    ["no window", { window: null }, "NO_WINDOW"],
    ["not a normal window", { normal: false }, "PRIVATE_WINDOW"],
    ["services cannot tell", { services: {} }, "PRIVATE_WINDOW"],
  ];
  for (const [label, facts, code] of refusals) {
    let asked = 0;
    const prefs = fakePrefs();
    const ctx = { ...labCtx({ prefs, ...facts }), lab: () => { asked++; return fakeLab().lab; } };
    // The actor's own ctx says undefined when privacy is unknown.
    if (facts.isPrivate === null) ctx.isPrivate = () => undefined;
    await assert.rejects(dispatch(ctx, { name: "setLabEnabled", params: { id: "page-tldr", enabled: true } }), { code }, label);
    assert.equal(asked, 0, `${label}: the Lab was not asked`);
    assert.deepEqual(prefs.writes, [], `${label}: nothing written`);
  }
});

// ---------------------------------------------------------------- getLabClients

test("getLabClients: finding the clients works from any page; checking them needs a normal window", async () => {
  const services = { isNormalWindow: candidate => candidate === WINDOW };
  const { lab, calls } = fakeLab({ clients: [{ id: "codex", state: "unchecked", available: false, executable: "/opt/homebrew/bin/codex" }] });
  const privateCtx = labCtx({ lab, isPrivate: true, services });
  const found = await dispatch(privateCtx, { name: "getLabClients", params: { check: false } });
  await dispatch(privateCtx, { name: "getLabClients", params: {} });
  assert.deepEqual(calls, [["clientStatusForPage", { check: false, services }], ["clientStatusForPage", { check: false, services }]]);
  assert.deepEqual(found.clients.map(client => [client.id, client.state]), [["claude-code", "broken"], ["codex", "unchecked"], ["antigravity", "broken"]]);
  assert.doesNotMatch(JSON.stringify(found), /homebrew/u);

  calls.length = 0;
  for (const [facts, code] of [[{ isPrivate: true }, "PRIVATE_WINDOW"], [{ current: false }, "DOCUMENT_GONE"], [{ window: null }, "NO_WINDOW"],
    [{ normal: false }, "PRIVATE_WINDOW"]]) {
    await assert.rejects(dispatch(labCtx({ lab, ...facts }), { name: "getLabClients", params: { check: true } }), { code });
  }
  assert.deepEqual(calls, [], "no check started from a refused page");
  const normal = labCtx({ lab, services });
  await dispatch(normal, { name: "getLabClients", params: { check: true } });
  assert.deepEqual(calls, [["clientStatusForPage", { check: true, services }]]);
});

test("getLabClients maps a missing or failing client check to LAB_UNAVAILABLE and passes the actor's own refusals", async () => {
  const cases = [
    ["no clientStatusForPage", { listForPage() {}, setEnabledFromPage() {} }, "LAB_UNAVAILABLE"],
    ["rejects", { listForPage() {}, setEnabledFromPage() {}, clientStatusForPage: async () => { throw new Error("/usr/local/bin/codex: boom"); } }, "LAB_UNAVAILABLE"],
    ["throws", { listForPage() {}, setEnabledFromPage() {}, clientStatusForPage() { throw Object.assign(new Error("x"), { code: "UNAVAILABLE" }); } }, "LAB_UNAVAILABLE"],
    ["refused", { listForPage() {}, setEnabledFromPage() {}, clientStatusForPage() { throw new OverviewError("NO_WINDOW", "gone"); } }, "NO_WINDOW"],
  ];
  for (const [label, lab, code] of cases) {
    await assert.rejects(dispatch(labCtx({ lab }), { name: "getLabClients", params: { check: false } }), error => {
      assert.equal(error.code, code, label);
      assert.doesNotMatch(error.message, /usr\/local|boom/u, `${label}: no raw output in the message`);
      return true;
    });
  }
  // A non-array answer is three unusable clients, never an error or raw data.
  const odd = { listForPage() {}, setEnabledFromPage() {}, clientStatusForPage: async () => ({ codex: { state: "ready" } }) };
  assert.deepEqual((await dispatch(labCtx({ lab: odd }), { name: "getLabClients" })).clients.map(client => client.state), ["broken", "broken", "broken"]);
});

// ---------------------------------------------------------------- error mapping

test("Lab errors map to fixed codes: UNKNOWN_EXPERIMENT, INVALID_PARAMS and UNAVAILABLE pass, anything else is LAB_UNAVAILABLE", async () => {
  const thrown = [
    [new Lab.LabError("UNKNOWN_EXPERIMENT", "setLabEnabled: no such experiment"), "UNKNOWN_EXPERIMENT"],
    [new Lab.LabError("INVALID_PARAMS"), "INVALID_PARAMS"],
    [new Lab.LabError("UNAVAILABLE"), "UNAVAILABLE"],
    [{ code: "UNKNOWN_EXPERIMENT" }, "UNKNOWN_EXPERIMENT"],
    [new Lab.LabError("LOAD_FAILED"), "LAB_UNAVAILABLE"],
    [new Lab.LabError("DISPOSE_FAILED"), "LAB_UNAVAILABLE"],
    [Object.assign(new Error("x"), { code: "PRIVATE_WINDOW" }), "LAB_UNAVAILABLE"],
    [Object.assign(new Error("x"), { code: "SENDER_REJECTED" }), "LAB_UNAVAILABLE"],
    [new TypeError("prefs.setBoolPref is not a function"), "LAB_UNAVAILABLE"],
    ["a string", "LAB_UNAVAILABLE"],
    [null, "LAB_UNAVAILABLE"],
    [new OverviewError("DOCUMENT_GONE", "gone"), "DOCUMENT_GONE"],
  ];
  for (const [error, code] of thrown) {
    for (const name of ["listLab", "setLabEnabled"]) {
      const lab = { listForPage() { throw error; }, setEnabledFromPage() { throw error; }, clientStatusForPage: async () => [] };
      const params = name === "setLabEnabled" ? { id: "page-tldr", enabled: false } : {};
      await assert.rejects(dispatch(labCtx({ lab }), { name, params }), caught => {
        assert.ok(caught instanceof OverviewError, `${name}/${code}`);
        assert.equal(caught.code, code, `${name}: ${String(error?.message ?? error)}`);
        if (!(error instanceof OverviewError)) assert.equal(caught.message, `${name} failed (${code})`, "a fixed message, never the original");
        return true;
      });
    }
  }
  // Prefs that cannot even be read count as an unavailable Lab.
  const ctx = { ...labCtx(), prefs: () => { throw new Error("no prefs"); } };
  await assert.rejects(dispatch(ctx, { name: "listLab" }), { code: "LAB_UNAVAILABLE" });
});

test("a Lab module that is missing, fails to load or lacks its functions is LAB_UNAVAILABLE for every method", async () => {
  const modules = {
    missing: () => null,
    "fails to load": () => { throw new Error("NS_ERROR_FILE_NOT_FOUND"); },
    empty: () => ({}),
    "no switch": () => ({ listForPage: () => ({}), clientStatusForPage: async () => [] }),
    "no list": () => ({ setEnabledFromPage: () => ({}), clientStatusForPage: async () => [] }),
    "not functions": () => ({ listForPage: {}, setEnabledFromPage: "x", clientStatusForPage: async () => [] }),
  };
  for (const [label, lab] of Object.entries(modules)) {
    for (const [name, params] of [["listLab", {}], ["setLabEnabled", { id: "page-tldr", enabled: true }], ["getLabClients", { check: false }],
      ["getLabClients", { check: true }]]) {
      const ctx = { ...labCtx(), lab };
      await assert.rejects(dispatch(ctx, { name, params }), { code: "LAB_UNAVAILABLE", message: `${name}: the Lab is not available` }, `${label}/${name}`);
    }
  }
});

// ---------------------------------------------------------------- labReply

test("labReply rebuilds the Lab state from closed primitives only", () => {
  assert.deepEqual(labReply(null), { version: 1, groups: [], experiments: [] });
  assert.deepEqual(labReply({ version: 9, groups: "x", experiments: {} }), { version: 1, groups: [], experiments: [] });
  const reply = labReply({
    version: 2, secret: "x",
    groups: ["AI on the page", "x".repeat(41), 5, null, "", "Your day"],
    experiments: [
      good({ module: "page-tldr.sys.mjs", installer: "installPageTldr", pref: "axiosozo.lab.page-tldr.enabled", path: "/Users/x", window: {} }),
      good({ id: "Bad Id" }),
      good({ id: "x".repeat(41) }),
      { title: "No id" },
      null,
      good({ id: "long-texts", title: "t".repeat(61), pitch: "p".repeat(201), group: "g".repeat(41),
        howToTry: ["One.", "s".repeat(141), 5, null, "", "Two.", "Three.", "Four."] }),
      good({ id: "odd-values", variantOf: "Not An Id", family: "../x", needs: ["codex", "gpt", "none", 5, "codex"], graduated: "yes",
        live: "no", enabled: "true", problem: "SOMETHING_ELSE" }),
      good({ id: "graduated", graduated: true, live: false, enabled: true, problem: "DISPOSE_FAILED", variantOf: "page-tldr", family: "page-tldr" }),
      good({ id: "not-lists", howToTry: "Turn it on.", needs: "codex", title: 5, pitch: null }),
    ],
  });
  assert.equal(reply.version, 1);
  assert.deepEqual(Object.keys(reply), ["version", "groups", "experiments"]);
  assert.deepEqual(reply.groups, ["AI on the page", "Your day"]);
  assert.deepEqual(reply.experiments.map(item => item.id), ["page-tldr", "long-texts", "odd-values", "graduated", "not-lists"]);
  for (const item of reply.experiments) {
    assert.deepEqual(Object.keys(item), ["id", "title", "pitch", "howToTry", "group", "variantOf", "family", "needs", "graduated", "live", "enabled", "problem"]);
  }
  assert.deepEqual(reply.experiments[0], good());
  const [, long, odd, graduated, notLists] = reply.experiments;
  assert.deepEqual([long.title, long.pitch, long.group, long.howToTry], ["", "", "", ["One.", "Two.", "Three."]]);
  assert.deepEqual([odd.variantOf, odd.family, odd.needs, odd.graduated, odd.live, odd.enabled, odd.problem],
    [null, "odd-values", ["codex", "none", "codex"], false, true, false, null]);
  assert.deepEqual([graduated.graduated, graduated.live, graduated.enabled, graduated.problem, graduated.variantOf, graduated.family],
    [true, false, true, "DISPOSE_FAILED", "page-tldr", "page-tldr"]);
  assert.deepEqual([notLists.howToTry, notLists.needs, notLists.title, notLists.pitch], [[], [], "", ""]);
  assert.doesNotMatch(JSON.stringify(reply), /sys\.mjs|installPageTldr|axiosozo\.lab|\/Users/u);
});

test("labReply keeps at most 16 groups and looks at the first 64 experiments only", () => {
  const groups = Array.from({ length: 20 }, (_, index) => `Group ${index}`);
  const experiments = Array.from({ length: 70 }, (_, index) => good({ id: `e${index}` }));
  experiments.splice(1, 0, good({ id: "Bad" }));
  const reply = labReply({ groups, experiments });
  assert.deepEqual(reply.groups, groups.slice(0, 16));
  assert.equal(reply.experiments.length, 63, "the cap counts entries before invalid ids are dropped");
  assert.equal(reply.experiments.at(-1).id, "e62");
});

test("labReply carries every code the Lab can produce: needs, problems and the real list unchanged", () => {
  for (const need of Lab.LAB_NEEDS) assert.deepEqual(labReply({ experiments: [good({ needs: [need] })] }).experiments[0].needs, [need]);
  for (const code of ["LOAD_FAILED", "INSTALLER_MISSING", "INSTALL_FAILED", "DISPOSE_FAILED"]) {
    assert.equal(labReply({ experiments: [good({ problem: code })] }).experiments[0].problem, code);
    assert.equal(typeof M.labProblemText(code), "string", `the page has words for ${code}`);
  }
  // The real registry passes through the actor without losing anything.
  for (const prefs of [fakePrefs(), fakePrefs({ "axiosozo.regionCapture.enabled": false })]) {
    const list = Lab.listForPage({ prefs });
    assert.deepEqual(labReply(list), list);
  }
  assert.equal(LAB_URL, `${Lab.LAB_URL}Lab.sys.mjs`, "the actor loads the Lab from where its own modules live");
});

// ---------------------------------------------------------------- labClientsReply

const CLIENT_IDS = ["claude-code", "codex", "antigravity"];

test("labClientsReply always answers the three clients in order, unknown ones as broken", () => {
  for (const value of [null, undefined, {}, "x", [], [null, 5, "codex"], [{ id: "gpt", state: "ready" }]]) {
    assert.deepEqual(labClientsReply(value), { version: 1, clients: CLIENT_IDS.map(id => ({ id, state: "broken", available: false, version: null,
      reason: "", note: "", capabilities: [] })) }, JSON.stringify(value));
  }
  const reply = labClientsReply([
    { id: "antigravity", state: "missing", available: false, reason: "Not installed" },
    { id: "codex", state: "ready", available: true, version: "0.160.0", capabilities: ["answer", "task"] },
    { id: "codex", state: "broken", reason: "the second codex is ignored" },
  ]);
  assert.deepEqual(reply.clients.map(client => [client.id, client.state, client.available]),
    [["claude-code", "broken", false], ["codex", "ready", true], ["antigravity", "missing", false]]);
  assert.equal(reply.clients[2].reason, "Not installed");
});

test("labClientsReply drops paths, raw output, unknown capabilities, odd versions and long or control-character text", () => {
  const reply = labClientsReply([{
    id: "claude-code", label: "Claude Code", state: "partial", available: "yes", version: "2.1.3-beta.1",
    executable: "/Users/someone/.local/bin/claude", stdout: "raw output", stderr: "raw error", command: ["claude", "--version"], checkedAt: 5,
    reason: "Claude Code works in part.", note: "Image input is off.", capabilities: ["answer", "image", "schema", "task", "resume", "agents", "mcp", 5, "shell"],
  }, {
    id: "codex", state: "glorious", available: true, version: "v0.160.0", reason: "r".repeat(161), note: "n".repeat(201), capabilities: "answer",
  }, {
    id: "antigravity", state: "changed", available: false, version: "1.2", reason: "Line one\nline two", note: "Tab\there", capabilities: null,
  }]);
  assert.deepEqual(reply.clients, [
    { id: "claude-code", state: "partial", available: false, version: "2.1.3-beta.1", reason: "Claude Code works in part.", note: "Image input is off.",
      capabilities: ["answer", "image", "schema", "task", "resume", "agents"] },
    { id: "codex", state: "broken", available: true, version: null, reason: "", note: "", capabilities: [] },
    { id: "antigravity", state: "changed", available: false, version: null, reason: "", note: "", capabilities: [] },
  ]);
  assert.deepEqual(Object.keys(reply), ["version", "clients"]);
  assert.doesNotMatch(JSON.stringify(reply), /Users|raw|--version|label|checkedAt/u);
  for (const version of ["1.2.3", "10.20.30", "1.2.3-rc.1", "123456.1.1"]) assert.equal(labClientsReply([{ id: "codex", version }]).clients[1].version, version);
  for (const version of ["1.2", "1.2.3.4", "v1.2.3", "1.2.3 (Codex)", "1.2.3-", `1.2.3-${"x".repeat(31)}`, "1234567.1.1", "/usr/bin/codex", 123]) {
    assert.equal(labClientsReply([{ id: "codex", version }]).clients[1].version, null, String(version));
  }
  // The longest texts that fit are kept as they are.
  const fits = labClientsReply([{ id: "codex", reason: "r".repeat(160), note: "n".repeat(200) }]).clients[1];
  assert.deepEqual([fits.reason.length, fits.note.length], [160, 200]);
});

// ---------------------------------------------------------------- the real actor

function goodSender(overrides = {}) {
  return { remoteType: "privilegedabout", documentURI: "about:axiosozo#lab", isCurrentGlobal: true, isTopLevel: true, hasEmbedder: true,
    usePrivateBrowsing: false,
    principal: { isSystemPrincipal: false, isContentPrincipal: true, originNoSuffix: "about:axiosozo", privateBrowsingId: 0 }, ...overrides };
}
function fakeActor({ sender = goodSender(), window = WINDOW } = {}) {
  const actor = new AboutAxioSozoParent();
  const context = { parent: null, embedderElement: {}, usePrivateBrowsing: sender.usePrivateBrowsing, topChromeWindow: window };
  context.top = context;
  actor.browsingContext = context;
  actor.manager = { remoteType: sender.remoteType, isCurrentGlobal: sender.isCurrentGlobal, documentURI: { spec: sender.documentURI },
    documentPrincipal: sender.principal };
  return actor;
}
const request = (actor, name, params) => actor.receiveMessage({ name: MESSAGES.REQUEST, data: { name, params } });

test("through the actor: the real Lab registry, the browser's prefs and the window's privacy decide", async () => {
  const prefs = fakePrefs();
  const services = { isNormalWindow: candidate => candidate === WINDOW, on: () => () => {} };
  const restore = setProvidersForTesting({ services: () => services, prefs: () => prefs, lab: () => Lab });
  try {
    const actor = fakeActor();
    const listed = await request(actor, "listLab", {});
    assert.equal(listed.ok, true);
    assert.deepEqual(listed.value, labReply(Lab.listForPage({ prefs })));
    const graduated = Lab.EXPERIMENTS.find(item => item.graduated);
    const turned = await request(actor, "setLabEnabled", { id: graduated.id, enabled: false });
    assert.equal(turned.ok, true);
    assert.deepEqual(prefs.writes, [[graduated.graduated.pref, false]]);
    assert.equal(turned.value.experiments.find(item => item.id === graduated.id).enabled, false);
    const unknown = await request(actor, "setLabEnabled", { id: "not-in-the-lab", enabled: true });
    assert.deepEqual(unknown, { ok: false, error: { code: "UNKNOWN_EXPERIMENT", message: "setLabEnabled failed (UNKNOWN_EXPERIMENT)" } });

    // A private window's page (its principal matches, so it is admitted) may read but not switch or check.
    const privateActor = fakeActor({ sender: goodSender({ usePrivateBrowsing: true,
      principal: { ...goodSender().principal, privateBrowsingId: 1 } }) });
    assert.equal((await request(privateActor, "listLab", {})).ok, true);
    assert.equal((await request(privateActor, "setLabEnabled", { id: graduated.id, enabled: true })).error.code, "PRIVATE_WINDOW");
    assert.equal((await request(privateActor, "getLabClients", { check: true })).error.code, "PRIVATE_WINDOW");
    assert.equal(prefs.writes.length, 1, "nothing more was written");
  } finally { restore(); }
});

test("through the actor: a Lab module that cannot load is LAB_UNAVAILABLE, and the actor keeps answering", async () => {
  const restore = setProvidersForTesting({ services: () => ({ isNormalWindow: () => true, on: () => () => {} }), prefs: () => fakePrefs(),
    lab: () => { throw new Error("NS_ERROR_FILE_NOT_FOUND: chrome://browser/content/axiosozo/lab/Lab.sys.mjs"); } });
  try {
    const actor = fakeActor();
    for (const [name, params] of [["listLab", {}], ["setLabEnabled", { id: "page-tldr", enabled: true }], ["getLabClients", {}]]) {
      const reply = await request(actor, name, params);
      assert.deepEqual(reply, { ok: false, error: { code: "LAB_UNAVAILABLE", message: `${name}: the Lab is not available` } }, name);
    }
    assert.equal((await request(actor, "getOverviewFlags", {})).ok, true, "the rest of the actor still answers");
  } finally { restore(); }
});

test("getProviderStatus: refresh is an optional boolean, passed through; a refresh (it runs the offline check) needs a normal window", async () => {
  const asked = [];
  const providers = { getProviderStatus: async options => { asked.push(options); return { version: 1, providers: [] }; } };
  const ctx = overrides => ({ ...labCtx(overrides), providers: () => providers });
  assert.deepEqual(await dispatch(ctx(), { name: "getProviderStatus", params: {} }), { version: 1, providers: [] });
  await dispatch(ctx(), { name: "getProviderStatus", params: { refresh: true } });
  await dispatch(ctx({ isPrivate: true }), { name: "getProviderStatus", params: {} });
  assert.deepEqual(asked, [{ refresh: false }, { refresh: true }, { refresh: false }], "reading stays allowed anywhere");
  await assert.rejects(dispatch(ctx({ isPrivate: true }), { name: "getProviderStatus", params: { refresh: true } }), error => error.code === "PRIVATE_WINDOW");
  await assert.rejects(dispatch(ctx({ normal: false }), { name: "getProviderStatus", params: { refresh: true } }), error => error.code === "PRIVATE_WINDOW");
  for (const params of [{ refresh: "yes" }, { refresh: 1 }, { refresh: true, x: 1 }]) {
    assert.throws(() => validateRequest({ name: "getProviderStatus", params }), error => error.code === "INVALID_PARAMS", JSON.stringify(params));
  }
  assert.equal(asked.length, 3, "no refusal reached the provider host");
});

test("AI & keys: the capability-check states have tones and the summary says how the cards were read", () => {
  const card = state => M.providerCards({ providers: [{ id: "codex", label: "Codex", state, state_label: "x", detail: "d" }] })[0].tone;
  assert.deepEqual(["checked", "needs-sign-in", "incompatible", "unavailable", "not-installed", "something-new"].map(card),
    ["ok", "warn", "warn", "warn", "off", "unknown"]);
  assert.equal(M.providerSummary({ discovery: "ok", checks: "ok" }),
    "Checked on this Mac without sending anything: each assistant ran offline in the browser sandbox. Answers through this browser have not been verified yet.");
  assert.equal(M.providerSummary({ discovery: "ok", checks: "unavailable" }),
    "Could not check the assistants; showing installation details only. Nothing was sent. Answers through this browser have not been verified yet.");
  assert.match(M.providerSummary({ discovery: "ok", checks: "not-run" }), /^Read from installation metadata only/u);
  assert.match(M.providerSummary({ discovery: "unavailable", checks: "unavailable" }), /^Could not read which assistants are installed/u);
  assert.equal(M.providerSummary(null), "Checking which assistants are installed…");
});
