/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. https://mozilla.org/MPL/2.0/ */
import test from "node:test";
import assert from "node:assert/strict";
import "./support/chrome-modules.mjs";
import { createFakeWindow, createFakeAdapter, createFakeServices, flushMicrotasks, context,
  WORKSPACE_A, WORKSPACE_B, NS_ERROR_CONNECTION_REFUSED } from "./dev-loop-harness.test.mjs";

const core = await import("../../../packages/contexts/src/index.mjs");
const { installEnginePreference, ENGINE_PREFERENCE_PREF, PREFERENCE_REASON } = await import("../chrome/EnginePreference.sys.mjs");

function setup({ enabled = null, privateWindow = false, preference = "chromium", apply = null, probe = undefined } = {}) {
  const prefs = enabled === null ? {} : { [ENGINE_PREFERENCE_PREF]: enabled };
  const h = createFakeWindow({ privateWindow, prefs });
  const adapter = createFakeAdapter({ privateWindow });
  const services = createFakeServices(core, { contexts: [
    context(WORKSPACE_A, "project", { engine_preference: preference }), context(WORKSPACE_B, "personal")] });
  const calls = [];
  const engineProbe = probe !== undefined ? probe : {
    applyEnginePreference: async (tab, engine, options) => {
      calls.push({ tab, engine, options });
      return apply ? apply(tab, engine) : { applied: true, engine };
    },
  };
  const installed = installEnginePreference(h.window, { services, adapter, engineProbe });
  return { h, adapter, services, installed, calls, prefs };
}

test("disabled by default: no engine switch is ever requested", async () => {
  const t = setup();
  const tab = t.h.addTab({ url: "about:blank" });
  t.h.commit(tab, "https://dashboard.example/");
  await flushMicrotasks();
  assert.deepEqual(t.calls, []);
  assert.equal(t.installed.diagnostics().enabled, false);
  t.installed.dispose();
});

test("when enabled, a context's chromium preference is applied once to a newly loaded http(s) tab", async () => {
  const t = setup({ enabled: true });
  const tab = t.h.addTab({ url: "about:blank" });
  t.h.commit(tab, "about:newtab");
  await flushMicrotasks();
  assert.deepEqual(t.calls, [], "privileged and blank pages are never switched");
  t.h.commit(tab, "https://dashboard.example/");
  await flushMicrotasks();
  assert.equal(t.calls.length, 1);
  assert.equal(t.calls[0].tab, tab);
  assert.equal(t.calls[0].engine, "chromium");
  assert.deepEqual(t.calls[0].options, { reason: PREFERENCE_REASON });
  t.h.commit(tab, "https://dashboard.example/next");
  await flushMicrotasks();
  assert.equal(t.calls.length, 1, "one automatic attempt per tab: a manual switch back is respected");
  // A background tab is handed to the hook too; the hook marks it and switches when shown.
  const background = t.h.addTab({ url: "about:blank", select: false });
  t.h.commit(background, "https://status.example/");
  await flushMicrotasks();
  assert.equal(t.calls.length, 2);
  assert.deepEqual(t.installed.diagnostics().attempts, [
    { applied: true, engine: "chromium", error: null }, { applied: true, engine: "chromium", error: null }]);
  t.installed.dispose();
});

test("only committed, successful loads count; failed loads and same-document changes do not", async () => {
  const t = setup({ enabled: true });
  const tab = t.h.addTab({ url: "about:blank" });
  t.h.fail(tab, "https://down.example/", NS_ERROR_CONNECTION_REFUSED);
  t.h.sameDocument(tab, "https://down.example/#x");
  t.h.commit(tab, "https://dashboard.example/", { stop: false });
  await flushMicrotasks();
  assert.deepEqual(t.calls, []);
  t.installed.dispose();
});

test("firefox or no preference, and tabs outside a context, never request a switch", async () => {
  for (const preference of ["firefox", null]) {
    const t = setup({ enabled: true, preference });
    const tab = t.h.addTab({ url: "about:blank" });
    t.h.commit(tab, "https://dashboard.example/");
    await flushMicrotasks();
    assert.deepEqual(t.calls, [], String(preference));
    t.installed.dispose();
  }
  const t = setup({ enabled: true });
  const personal = t.h.addTab({ url: "about:blank", workspace: WORKSPACE_B });
  const loose = t.h.addTab({ url: "about:blank", workspace: null });
  t.h.commit(personal, "https://dashboard.example/");
  t.h.commit(loose, "https://dashboard.example/");
  await flushMicrotasks();
  assert.deepEqual(t.calls, []);
  t.installed.dispose();
});

test("failure keeps the Firefox tab and never throws", async () => {
  let t = setup({ enabled: true, apply: async () => ({ applied: false, engine: "chromium", error: "SWITCH_FAILED" }) });
  let tab = t.h.addTab({ url: "about:blank" });
  t.h.commit(tab, "https://dashboard.example/");
  await flushMicrotasks();
  assert.deepEqual(t.installed.diagnostics().attempts, [{ applied: false, engine: "chromium", error: "SWITCH_FAILED" }]);
  assert.equal(t.h.gBrowser.tabs.includes(tab), true);
  assert.equal(tab.linkedBrowser.currentURI.spec, "https://dashboard.example/", "the Firefox page is untouched");
  t.installed.dispose();

  t = setup({ enabled: true, apply: async () => { throw new Error("native crash"); } });
  tab = t.h.addTab({ url: "about:blank" });
  t.h.commit(tab, "https://dashboard.example/");
  await flushMicrotasks();
  assert.deepEqual(t.installed.diagnostics().attempts, [{ applied: false, engine: "chromium", error: "UNAVAILABLE" }]);
  assert.equal(tab.linkedBrowser.currentURI.spec, "https://dashboard.example/");
  t.installed.dispose();
});

test("private windows and an unavailable switch (null engineProbe) install nothing", async () => {
  for (const input of [{ privateWindow: true }, { probe: null }, { probe: {} }]) {
    const t = setup({ enabled: true, ...input });
    assert.equal(t.h.progressListeners.size, 0, JSON.stringify(input));
    const tab = t.h.addTab({ url: "about:blank" });
    t.h.commit(tab, "https://dashboard.example/");
    await flushMicrotasks();
    assert.deepEqual(t.calls, []);
    t.installed.dispose();
  }
});

test("the pref is read live and dispose removes the listeners", async () => {
  const t = setup({ enabled: false });
  const tab = t.h.addTab({ url: "about:blank" });
  t.h.commit(tab, "https://dashboard.example/");
  await flushMicrotasks();
  assert.deepEqual(t.calls, []);
  t.prefs[ENGINE_PREFERENCE_PREF] = true;
  t.h.commit(tab, "https://dashboard.example/again");
  await flushMicrotasks();
  assert.equal(t.calls.length, 1);
  t.installed.dispose();
  assert.equal(t.h.progressListeners.size, 0);
  assert.equal(t.services.listenerCount(), 0);
  const later = t.h.addTab({ url: "about:blank" });
  t.h.commit(later, "https://dashboard.example/");
  await flushMicrotasks();
  assert.equal(t.calls.length, 1);
});
