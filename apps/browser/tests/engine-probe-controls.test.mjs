import test from "node:test";
import assert from "node:assert/strict";
import { installEngineProbeControls } from "../chrome/EngineProbeControls.sys.mjs";

// Explicitly synthetic browser-chrome model. These are gate/lifecycle tests,
// not evidence of a native engine, browser window or rendered frame.
function fixture({ flag = "1", origin = "http://127.0.0.1:8910", privateMode = false,
  url = "http://127.0.0.1:8910/engine.html", fail = false, delayed = false, renderReason = null, daily = "" } = {}) {
  const calls = [];
  const children = [];
  const listeners = new Map();
  let release;
  let notifyEngine;
  let notifyFailure;
  const button = { attributes: {}, setAttribute(key, value) { this.attributes[key] = value; },
    addEventListener: (type, fn) => listeners.set(type, fn), removeEventListener: type => listeners.delete(type),
    remove: () => children.splice(children.indexOf(button), 1) };
  const tab = { linkedBrowser: { currentURI: { spec: url } } };
  const win = { Services: { env: { get: key => ({ AXIOSOZO_ENGINE_PROBE: flag, AXIOSOZO_ENGINE_FIXTURE_ORIGIN: origin, AXIOSOZO_ENGINE_SWITCHING: daily })[key] ?? "" } },
    document: { getElementById: () => ({ appendChild: child => children.push(child) }), createXULElement: () => button },
    gBrowser: { selectedTab: tab } };
  const target = { tab_id: "fixture-gecko-tab", engine: "gecko", identity: origin, private_mode: privateMode };
  const gecko = { find: () => ({ tab }), target: () => target };
  class TestPresenter {
    constructor(_win, _gecko, callbacks) { calls.push("constructed"); this.callbacks = callbacks; this.engine = "gecko"; notifyEngine = callbacks.onEngineChange; notifyFailure = callbacks.onFailure; }
    async switchToChromium(selected) {
      calls.push("switch"); assert.equal(selected, tab);
      if (delayed) await new Promise(resolve => { release = resolve; });
      if (fail) throw new Error("CEF_COMPONENT_UNAVAILABLE");
      this.engine = "chromium";
      this.callbacks.onEngineChange({ engine: "chromium", version: "TEST_FIXTURE", experimental: true,
        fixtureOnly: true, reason: renderReason });
      this.callbacks.onTargetEvent({ event: "created" });
    }
    async switchToGecko() { calls.push("restore"); this.engine = "gecko"; this.callbacks.onEngineChange({ engine: "gecko" }); }
    diagnostics() { return { engine: this.engine, fixture: true, target: this.engine === "chromium" ? { ...target, engine: "chromium" } : null }; }
    currentPage() { return null; }
    async dispose() { calls.push("disposed"); }
  }
  const controls = installEngineProbeControls(win, gecko, { Presenter: TestPresenter });
  return { controls, calls, children, listeners, button, win, tab, target, release: () => release(),
    selectOtherGeckoTab: () => notifyEngine({ engine: "gecko" }),
    reportReason: reason => notifyEngine({ engine: "chromium", version: "TEST_FIXTURE", experimental: true,
      fixtureOnly: true, reason }), reportFailure: code => notifyFailure(new Error(code)) };
}

test("normal startup and invalid fixture origins expose no engine action or process", () => {
  for (const input of [{ flag: "" }, { flag: "true" }, { origin: "https://example.com" },
    { origin: "http://127.0.0.1:8910/path" }, { origin: "http://user@127.0.0.1:8910" }]) {
    const f = fixture(input);
    assert.equal(f.controls, null); assert.deepEqual(f.calls, []); assert.deepEqual(f.children, []);
  }
});

test("enabling the probe is inert until explicit trusted chrome action", async () => {
  const f = fixture();
  assert.deepEqual(f.calls, []);
  assert.equal(f.controls.diagnostics().activeEngine, "gecko");
  f.listeners.get("command")({ isTrusted: false });
  await Promise.resolve(); assert.deepEqual(f.calls, []);
  assert.match(f.button.attributes.label, /fixture only/u);
  assert.match(f.button.attributes.tooltiptext, /IME, clipboard, native accessibility/u);
  await f.controls.dispose(); assert.deepEqual(f.calls, []);
});

test("private tabs and unexpected URLs are rejected before command hooks or native launch", async () => {
  for (const input of [{ privateMode: true }, { url: "http://127.0.0.1:9999/engine.html" },
    { url: "https://example.com/" }, { url: "http://127.0.0.1:8910/engine.html?extra=1" }]) {
    const f = fixture(input);
    await assert.rejects(f.controls.switchToChromium(), /CEF_LOCAL_FIXTURE_ONLY/u);
    assert.deepEqual(f.calls, []); assert.equal(f.win.gBrowser.selectedTab, f.tab);
  }
});

test("explicit switch exposes presenter identity and switching back preserves the Gecko tab", async () => {
  const f = fixture(); await f.controls.switchToChromium();
  assert.deepEqual(f.calls, ["constructed", "switch"]);
  assert.equal(f.controls.diagnostics().activeEngine, "chromium");
  assert.equal(f.controls.diagnostics().targetEvents, 1);
  assert.equal(f.controls.isGeckoTargetActive(f.target), false);
  assert.equal(f.controls.isGeckoTargetActive({ ...f.target, tab_id: "other-gecko-tab" }), true);
  assert.equal(f.controls.diagnostics().native.fixture, true);
  assert.equal(f.button.attributes.label, "Return to Gecko");
  f.selectOtherGeckoTab();
  assert.equal(f.controls.diagnostics().activeEngine, "gecko");
  assert.equal(f.controls.isGeckoTargetActive(f.target), false, "background CEF tab still owns the retained Gecko target");
  await f.controls.switchToGecko();
  assert.equal(f.controls.diagnostics().activeEngine, "gecko");
  assert.equal(f.controls.isGeckoTargetActive(f.target), true);
  assert.equal(f.win.gBrowser.selectedTab, f.tab);
  await f.controls.dispose();
  assert.deepEqual(f.calls, ["constructed", "switch", "restore", "disposed"]);
  assert.equal(f.children.length, 0); assert.equal(f.listeners.size, 0);
  await assert.rejects(f.controls.switchToChromium(), /ENGINE_PROBE_DISPOSED/u);
});

test("bounded fullscreen render cap appears with limitations without hiding failures or identity", async () => {
  const f = fixture({ renderReason: "CEF render scale capped at 1.5× for this window size" });
  await f.controls.switchToChromium();
  assert.equal(f.button.attributes.label, "Return to Gecko");
  assert.match(f.button.attributes.tooltiptext, /^CEF render scale capped at 1\.5× for this window size\. Local GET fixture only/u);
  assert.match(f.button.attributes.tooltiptext, /native accessibility, downloads and permissions/u);
  f.reportFailure("CEF_RESIZE_DIAGNOSTIC");
  assert.match(f.button.attributes.tooltiptext, /^CEF_RESIZE_DIAGNOSTIC\. CEF render scale capped/u);
  f.reportReason("untrusted title \n profile path");
  assert.doesNotMatch(f.button.attributes.tooltiptext, /untrusted title|profile path/u);
  assert.match(f.button.attributes.tooltiptext, /^CEF_RESIZE_DIAGNOSTIC\. Local GET fixture only/u);
  await f.controls.dispose();
});

test("missing native component never claims Chromium success or removes the original tab", async () => {
  const f = fixture({ fail: true });
  await assert.rejects(f.controls.switchToChromium(), /CEF_COMPONENT_UNAVAILABLE/u);
  assert.equal(f.controls.diagnostics().activeEngine, "gecko");
  assert.equal(f.controls.diagnostics().failure, "CEF_COMPONENT_UNAVAILABLE");
  assert.equal(f.controls.isGeckoTargetActive(f.target), true);
  assert.equal(f.win.gBrowser.selectedTab, f.tab); assert.equal(f.button.disabled, false);
  await f.controls.dispose();
});

test("a pending native switch cannot create duplicate engine owners", async () => {
  const f = fixture({ delayed: true });
  const first = f.controls.switchToChromium();
  assert.equal(f.button.disabled, true);
  assert.equal(f.controls.isGeckoTargetActive(f.target), false);
  await assert.rejects(f.controls.switchToChromium(), /ENGINE_SWITCH_IN_PROGRESS/u);
  assert.deepEqual(f.calls, ["constructed", "switch"]);
  f.release(); await first; await f.controls.dispose();
});

test("web mode uses Zen's own tab controls and starts Chromium only on a user switch",async()=>{
  const f=fixture({flag:"",daily:"1",origin:"",url:"about:newtab"});
  // The presenter exists to restore tabs and install the tab menu; no engine runs yet.
  assert.deepEqual(f.calls,["constructed"]);assert.equal(f.controls.diagnostics().browsingMode,"web");
  assert.equal(f.controls.diagnostics().fixtureOrigin,null);
  assert.equal(f.children.length,0,"web mode adds no toolbar button");
  assert.equal(f.controls.currentPage().url,"about:newtab");
  await f.controls.switchToChromium();assert.deepEqual(f.calls,["constructed","switch"]);
  assert.equal(f.controls.diagnostics().activeEngine,"chromium");await f.controls.dispose();
  const privateTab=fixture({flag:"",daily:"1",privateMode:true});
  assert.equal(privateTab.controls.currentPage(),null);
  await assert.rejects(privateTab.controls.switchToChromium(),/CEF_PRIVATE_OR_UNKNOWN_TAB/u);
  assert.deepEqual(privateTab.calls,["constructed"]);await privateTab.controls.dispose();
});

// ---- F6 engine-preference hook (contexts-api-v1 §5) --------------------------
// Synthetic web-mode chrome model; gate/lifecycle tests only, no native engine.
function webFixture({ enabled = true, prefThrows = false, privateWindow = false, privateMode = false,
  url = "https://example.com/page", postData = null, fail = null, delayed = false, known = true } = {}) {
  const calls = [];
  const prefReads = [];
  let release;
  const tab = { linkedBrowser: { currentURI: { spec: url },
    browsingContext: { activeSessionHistoryEntry: { URI: { spec: url }, postData } } } };
  const win = {
    Services: { env: { get: key => ({ AXIOSOZO_ENGINE_SWITCHING: "1" })[key] ?? "" },
      prefs: { getBoolPref(name, fallback) { prefReads.push([name, fallback]); if (prefThrows) throw new Error("NS_ERROR");
        return enabled; } } },
    PrivateBrowsingUtils: { isWindowPrivate: () => privateWindow },
    document: { getElementById: () => null, createXULElement: () => { throw new Error("no toolbar in web mode"); } },
    gBrowser: { selectedTab: tab } };
  const target = { tab_id: "web-gecko-tab", engine: "gecko", identity: "https://axiosozo.invalid", private_mode: privateMode };
  const gecko = { find: browser => (known && browser === tab.linkedBrowser ? { tab } : null), target: () => target };
  let instance = null;
  class TestPresenter {
    constructor(_win, _gecko, callbacks) { calls.push("constructed"); instance = this; this.callbacks = callbacks;
      this.engines = new Map(); this.pending = null; }
    engineOf(t) { return this.engines.get(t) ?? "gecko"; }
    async setTabEngine(t, engine) {
      calls.push(`setTabEngine:${engine}`);
      if (engine === "chromium") {
        this.pending = { tab: t }; this.callbacks.onSwitchStart(target.tab_id);
        try {
          if (delayed) await new Promise(resolve => { release = resolve; });
          if (fail) throw new Error(fail);
          this.engines.set(t, "chromium");
        } finally { this.pending = null; }
      } else this.engines.delete(t);
    }
    diagnostics() { return { engine: "gecko", ownedTabIds: [...this.engines.keys()].map(() => target.tab_id) }; }
    currentPage() { return null; }
    async dispose() { calls.push("disposed"); }
  }
  const failures = [];
  const controls = installEngineProbeControls(win, gecko, { Presenter: TestPresenter, onFailure: error => failures.push(error.message) });
  return { controls, calls, prefReads, failures, tab, target, win, presenter: () => instance, release: () => release() };
}

test("F6 hook is gated by axiosozo.engine.preferences.enabled (default false) and never touches the engine when off", async () => {
  for (const input of [{ enabled: false }, { prefThrows: true }]) {
    const f = webFixture(input);
    assert.equal(typeof f.controls.applyEnginePreference, "function");
    assert.deepEqual(f.calls, ["constructed"], "installing the hook adds no switch and no native launch");
    for (const engine of ["chromium", "firefox"]) {
      assert.deepEqual(await f.controls.applyEnginePreference(f.tab, engine, { reason: "context" }),
        { applied: false, engine, error: "DISABLED" });
    }
    assert.deepEqual(f.calls, ["constructed"]);
    assert.deepEqual(f.prefReads[0], ["axiosozo.engine.preferences.enabled", false]);
    assert.equal(f.controls.diagnostics().enginePreferences.enabled, false);
    await f.controls.dispose();
  }
});

test("F6 hook switches a web tab to Chromium through the per-tab switch and back to Firefox", async () => {
  const f = webFixture();
  const toChromium = await f.controls.applyEnginePreference(f.tab, "chromium", { reason: "site_rule" });
  assert.deepEqual(toChromium, { applied: true, engine: "chromium" });
  assert.ok(Object.isFrozen(toChromium));
  assert.equal(f.controls.engineOf(f.tab), "chromium");
  assert.deepEqual(f.controls.diagnostics().enginePreferences.last, { applied: true, engine: "chromium", reason: "site_rule" });
  // Already in the preferred engine: no second switch.
  assert.deepEqual(await f.controls.applyEnginePreference(f.tab, "chromium"), { applied: false, engine: "chromium" });
  assert.deepEqual(await f.controls.applyEnginePreference(f.tab, "firefox"), { applied: true, engine: "firefox" });
  assert.equal(f.controls.engineOf(f.tab), "gecko");
  assert.equal(f.controls.isGeckoTargetActive(f.target), true);
  // firefox is a no-op while the tab is already Gecko.
  assert.deepEqual(await f.controls.applyEnginePreference(f.tab, "firefox"), { applied: false, engine: "firefox" });
  assert.deepEqual(f.calls, ["constructed", "setTabEngine:chromium", "setTabEngine:gecko"]);
  await f.controls.dispose();
});

test("F6 hook refuses private windows, private tabs, unknown tabs and invalid engines before any switch", async () => {
  const cases = [[{ privateWindow: true }, "chromium", "PRIVATE"], [{ privateMode: true }, "chromium", "PRIVATE"],
    [{ privateWindow: true }, "firefox", "PRIVATE"], [{ known: false }, "chromium", "UNKNOWN_TAB"]];
  for (const [input, engine, error] of cases) {
    const f = webFixture(input);
    assert.deepEqual(await f.controls.applyEnginePreference(f.tab, engine), { applied: false, engine, error });
    assert.deepEqual(f.calls, ["constructed"]);
    await f.controls.dispose();
  }
  const f = webFixture();
  for (const engine of ["Chromium", "", null, "servo", { toString: () => "chromium" }]) {
    assert.deepEqual(await f.controls.applyEnginePreference(f.tab, engine), { applied: false, engine: null, error: "INVALID_ENGINE" });
  }
  // Registry ids are accepted next to the contract's `firefox`: `gecko` is a no-op on a Gecko tab; webkit is listed but unavailable.
  assert.deepEqual(await f.controls.applyEnginePreference(f.tab, "gecko"), { applied: false, engine: "gecko" });
  assert.deepEqual(await f.controls.applyEnginePreference(f.tab, "webkit"), { applied: false, engine: "webkit", error: "UNAVAILABLE" });
  assert.deepEqual(await f.controls.applyEnginePreference(null, "chromium"), { applied: false, engine: "chromium", error: "UNKNOWN_TAB" });
  assert.deepEqual(f.calls, ["constructed"]);
  await f.controls.dispose();
});

test("F6 hook keeps privileged, non-HTTP(S), credential and POST pages in Firefox", async () => {
  for (const input of [{ url: "about:preferences" }, { url: "about:blank" }, { url: "about:axiosozo" },
    { url: "chrome://browser/content/browser.xhtml" }, { url: "file:///etc/hosts" }, { url: "moz-extension://abc/page.html" },
    { url: "view-source:https://example.com/" }, { url: "https://user:pw@example.com/" },
    { url: "https://example.com/form", postData: { stream: true } }]) {
    const f = webFixture(input);
    assert.deepEqual(await f.controls.applyEnginePreference(f.tab, "chromium"), { applied: false, engine: "chromium", error: "UNSUPPORTED_URL" }, input.url);
    assert.deepEqual(f.calls, ["constructed"]); assert.equal(f.controls.engineOf(f.tab), "gecko");
    await f.controls.dispose();
  }
});

test("F6 hook refuses while a switch is pending and cannot create duplicate engine owners", async () => {
  const f = webFixture({ delayed: true });
  const first = f.controls.applyEnginePreference(f.tab, "chromium");
  await Promise.resolve();
  assert.equal(f.controls.isGeckoTargetActive(f.target), false, "Gecko action authority ends before async work");
  assert.deepEqual(await f.controls.applyEnginePreference(f.tab, "chromium"), { applied: false, engine: "chromium", error: "PENDING" });
  assert.deepEqual(await f.controls.applyEnginePreference(f.tab, "firefox"), { applied: false, engine: "firefox", error: "PENDING" });
  await assert.rejects(f.controls.switchToChromium(), /ENGINE_SWITCH_IN_PROGRESS/u);
  f.release();
  assert.deepEqual(await first, { applied: true, engine: "chromium" });
  assert.deepEqual(f.calls, ["constructed", "setTabEngine:chromium"]);
  // A presenter-level pending switch (for example a restored tab starting) also blocks.
  const g = webFixture();
  g.presenter().pending = { tab: {} };
  assert.deepEqual(await g.controls.applyEnginePreference(g.tab, "chromium"), { applied: false, engine: "chromium", error: "PENDING" });
  await f.controls.dispose(); await g.controls.dispose();
});

test("F6 hook failure keeps the Firefox tab, records the native code and never rejects", async () => {
  const f = webFixture({ fail: "CEF_COMPONENT_UNAVAILABLE" });
  assert.deepEqual(await f.controls.applyEnginePreference(f.tab, "chromium"), { applied: false, engine: "chromium", error: "SWITCH_FAILED" });
  assert.equal(f.controls.engineOf(f.tab), "gecko");
  assert.equal(f.controls.isGeckoTargetActive(f.target), true);
  assert.equal(f.controls.diagnostics().failure, "CEF_COMPONENT_UNAVAILABLE");
  assert.deepEqual(f.failures, ["CEF_COMPONENT_UNAVAILABLE"]);
  await f.controls.dispose();
  const cancelled = webFixture({ fail: "ENGINE_SWITCH_CANCELLED" });
  assert.deepEqual(await cancelled.controls.applyEnginePreference(cancelled.tab, "chromium"),
    { applied: false, engine: "chromium", error: "CANCELLED" });
  await cancelled.controls.dispose();
  // Unexpected exceptions anywhere resolve to UNAVAILABLE instead of throwing.
  const broken = webFixture();
  broken.presenter().engineOf = () => { throw new Error("boom"); };
  assert.deepEqual(await broken.controls.applyEnginePreference(broken.tab, "chromium"), { applied: false, engine: "chromium", error: "UNAVAILABLE" });
  const hostile = { get reason() { throw new Error("boom"); } };
  broken.presenter().engineOf = () => "gecko";
  broken.presenter().setTabEngine = () => { throw new Error("SYNC_THROW"); };
  assert.deepEqual(await broken.controls.applyEnginePreference(broken.tab, "chromium", hostile), { applied: false, engine: "chromium", error: "SWITCH_FAILED" });
  assert.equal(broken.controls.diagnostics().enginePreferences.last.reason, null);
  await broken.controls.dispose();
  // A switch that resolves without the tab actually changing engine is not applied.
  const silent = webFixture();
  silent.presenter().setTabEngine = async () => {};
  assert.deepEqual(await silent.controls.applyEnginePreference(silent.tab, "chromium"), { applied: false, engine: "chromium", error: "SWITCH_FAILED" });
  await silent.controls.dispose();
});

test("F6 hook is unavailable in the fixture probe and after dispose, without constructing a presenter", async () => {
  const f = fixture();
  f.win.Services.prefs = { getBoolPref: () => true };
  assert.deepEqual(await f.controls.applyEnginePreference(f.tab, "chromium"), { applied: false, engine: "chromium", error: "UNAVAILABLE" });
  assert.deepEqual(f.calls, [], "the fixture probe starts no presenter or native process for a preference");
  await f.controls.dispose();
  const w = webFixture();
  await w.controls.dispose();
  assert.deepEqual(await w.controls.applyEnginePreference(w.tab, "chromium"), { applied: false, engine: "chromium", error: "UNAVAILABLE" });
  assert.deepEqual(w.calls, ["constructed", "disposed"]);
});
