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
