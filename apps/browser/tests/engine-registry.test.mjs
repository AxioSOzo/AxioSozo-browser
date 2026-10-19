/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. https://mozilla.org/MPL/2.0/ */
import test from "node:test";
import assert from "node:assert/strict";
import "./support/chrome-modules.mjs";

const registry = await import("../chrome/EngineRegistry.sys.mjs");
const { installEngineTabMenu } = await import("../chrome/EngineTabMenu.sys.mjs");
const { listEngines, engineIds, normalizeEngineId, engineFromPersisted, toContextEngine, fromContextEngine, isContextEngine,
  engineAvailability, availableEngines, menuEngines, engineLabel, nextEngine, tabMenuModel,
  registerEnginePresenter, enginePresenterFactory, SHOW_UNAVAILABLE_PREF } = registry;

const windowWith = ({ web = true, probe = false, prefs = {} } = {}) => ({ Services: {
  env: { get: key => ({ AXIOSOZO_ENGINE_SWITCHING: web ? "1" : "", AXIOSOZO_ENGINE_PROBE: probe ? "1" : "" })[key] ?? "" },
  prefs: { getBoolPref: (name, fallback) => prefs[name] ?? fallback } } });

test("the registry lists gecko, chromium and webkit with technical ids and separate labels", () => {
  assert.deepEqual(engineIds(), ["gecko", "chromium", "webkit"]);
  assert.deepEqual(listEngines().map(e => e.label), ["Firefox", "Chromium", "WebKit"]);
  assert.deepEqual(listEngines().map(e => e.devLabel), ["Firefox (Gecko)", "Chromium (Blink)", "WebKit (WPE)"]);
  for (const engine of listEngines()) {
    assert.match(engine.icon, /^chrome:\/\/browser\/content\/axiosozo\/icons\/engine-[a-z]+\.svg$/u);
    assert.equal(typeof engine.available, "function");
    assert.equal(typeof engine.experimental, "boolean");
  }
  assert.equal(engineLabel("gecko"), "Firefox");
  assert.equal(engineLabel("gecko", { dev: true }), "Firefox (Gecko)");
  assert.throws(() => { listEngines().push({}); }, TypeError, "the list is frozen");
});

test("gecko is always available; chromium follows the web-mode flag; webkit says why it is unavailable here", () => {
  assert.deepEqual(engineAvailability("gecko", {}), { available: true, reason: null });
  assert.equal(engineAvailability("chromium", windowWith()).available, true);
  assert.equal(engineAvailability("chromium", windowWith({ web: false })).available, false);
  assert.match(engineAvailability("chromium", windowWith({ web: false })).reason, /not enabled/u);
  assert.equal(engineAvailability("chromium", windowWith({ probe: true })).available, false, "the fixture probe is not web mode");
  const lineup = windowWith({ web: false, probe: true });
  lineup[registry.CHROMIUM_FIXTURE_LINEUP] = true;
  assert.deepEqual({ ...engineAvailability("chromium", lineup) }, { available: true, reason: null, fixtureOnly: true },
    "inside the three-engine lineup the fixture probe offers Chromium for the test page");
  const stale = windowWith({ web: false });
  stale[registry.CHROMIUM_FIXTURE_LINEUP] = true;
  assert.equal(engineAvailability("chromium", stale).available, false, "the lineup marker alone, without the fixture probe, is not enough");
  assert.equal(engineAvailability("chromium", {}).available, false, "no Services: unavailable, never a throw");
  assert.deepEqual(engineAvailability("webkit", windowWith()), { available: false, reason: "WebKit is not available on this platform yet" });
  assert.equal(engineAvailability("servo", windowWith()).available, false);
  assert.deepEqual(availableEngines(windowWith()).map(e => e.id), ["gecko", "chromium"]);
  assert.deepEqual(availableEngines(windowWith({ web: false })).map(e => e.id), ["gecko"]);
});

test("webkit is hidden from menus unless the developer pref is set, then shown disabled with its reason", () => {
  assert.deepEqual(menuEngines(windowWith()).map(e => e.engine.id), ["gecko", "chromium"]);
  const shown = menuEngines(windowWith({ prefs: { [SHOW_UNAVAILABLE_PREF]: true } }));
  assert.deepEqual(shown.map(e => [e.engine.id, e.disabled]), [["gecko", false], ["chromium", false], ["webkit", true]]);
  assert.equal(shown[2].reason, "WebKit is not available on this platform yet");
});

test("ids normalize: contract `firefox` reads as gecko, legacy values still restore, unknown ids are rejected", () => {
  assert.equal(normalizeEngineId("firefox"), "gecko");
  assert.equal(normalizeEngineId("gecko"), "gecko");
  assert.equal(normalizeEngineId("chromium"), "chromium", "existing persisted attribute/session values");
  assert.equal(normalizeEngineId("Chromium"), null);
  assert.equal(normalizeEngineId("servo"), null);
  assert.equal(normalizeEngineId(null), null);
  assert.equal(normalizeEngineId({ toString: () => "chromium" }), null);
  assert.equal(engineFromPersisted("chromium"), "chromium");
  assert.equal(engineFromPersisted(""), "gecko");
  assert.equal(engineFromPersisted("garbage"), "gecko");
  assert.equal(engineFromPersisted(null), "gecko");
});

test("context-v1 mapping: gecko is the contract spelling, firefox a deprecated read alias, webkit cannot be stored yet", () => {
  assert.equal(toContextEngine("gecko"), "gecko");
  assert.equal(toContextEngine("firefox"), "gecko", "deprecated alias normalizes");
  assert.equal(toContextEngine("chromium"), "chromium");
  assert.equal(toContextEngine("webkit"), null);
  assert.equal(fromContextEngine("firefox"), "gecko");
  assert.equal(isContextEngine("firefox"), true);
  assert.equal(isContextEngine("chromium"), true);
  assert.equal(isContextEngine("gecko"), true);
  assert.equal(isContextEngine("Gecko"), false);
  assert.equal(isContextEngine("webkit"), false);
});

test("presenter factories are registered by the owning workstream, never built by the registry", () => {
  assert.equal(enginePresenterFactory("chromium"), null);
  const factory = () => ({});
  const unregister = registerEnginePresenter("chromium", factory);
  assert.equal(enginePresenterFactory("chromium"), factory);
  unregister();
  assert.equal(enginePresenterFactory("chromium"), null);
  assert.throws(() => registerEnginePresenter("servo", factory), /UNKNOWN_ENGINE/u);
  assert.throws(() => registerEnginePresenter("chromium", null), /INVALID_PRESENTER_FACTORY/u);
});

test("with two available engines the tab menu is the single toggle item, as today", () => {
  const w = windowWith();
  assert.deepEqual(tabMenuModel("gecko", w), { mode: "toggle", label: "Open in Chromium",
    items: [{ id: "chromium", label: "Chromium", checked: false, disabled: false, reason: null }] });
  assert.equal(tabMenuModel("chromium", w).label, "Open in Firefox");
  assert.equal(tabMenuModel("firefox", w).label, "Open in Chromium", "legacy spelling");
  assert.equal(nextEngine("gecko", w), "chromium");
  assert.equal(nextEngine("chromium", w), "gecko");
  const single = windowWith({ web: false });
  assert.equal(tabMenuModel("gecko", single).mode, "hidden");
  assert.equal(nextEngine("gecko", single), null);
});

const third = { id: "servo", label: "Servo", devLabel: "Servo", icon: "", experimental: true, contractValue: null, available: () => ({ available: true, reason: null }) };
const twoAndThird = [...listEngines().slice(0, 2), third];

test("with more than two available engines the menu becomes an Open in submenu with the current engine checked", () => {
  const w = windowWith();
  const model = tabMenuModel("chromium", w, twoAndThird);
  assert.equal(model.mode, "submenu");
  assert.equal(model.label, "Open in");
  assert.deepEqual(model.items.map(i => [i.id, i.checked, i.disabled]), [["gecko", false, false], ["chromium", true, true], ["servo", false, false]]);
});

test("the developer pref lists webkit disabled in a submenu; it is never a selectable target", () => {
  const model = tabMenuModel("gecko", windowWith({ prefs: { [SHOW_UNAVAILABLE_PREF]: true } }));
  assert.equal(model.mode, "submenu");
  const webkit = model.items.find(i => i.id === "webkit");
  assert.equal(webkit.disabled, true);
  assert.equal(webkit.reason, "WebKit is not available on this platform yet");
});

// A minimal XUL-like tree for the menu installer.
class El {
  constructor(tag) { this.tag = tag; this.attrs = new Map(); this.children = []; this.parentNode = null; this.hidden = false; this.listeners = new Map(); }
  setAttribute(k, v) { this.attrs.set(k, String(v)); }
  getAttribute(k) { return this.attrs.get(k) ?? null; }
  addEventListener(t, f) { this.listeners.set(t, f); }
  removeEventListener(t, f) { if (this.listeners.get(t) === f) this.listeners.delete(t); }
  appendChild(child) { child.remove(); child.parentNode = this; this.children.push(child); return child; }
  replaceChildren(...items) { for (const c of [...this.children]) c.remove(); for (const c of items) this.appendChild(c); }
  remove() { if (this.parentNode) { this.parentNode.children.splice(this.parentNode.children.indexOf(this), 1); this.parentNode = null; } }
  after(node) { const p = this.parentNode; node.remove(); node.parentNode = p; p.children.splice(p.children.indexOf(this) + 1, 0, node); }
  fire(type, event = {}) { this.listeners.get(type)?.({ target: this, ...event }); }
}

function menuFixture({ engine = "gecko", win = windowWith(), extraEngines = null } = {}) {
  const menu = new El("menupopup");
  const reload = menu.appendChild(new El("menuitem"));
  const ids = new Map([["tabContextMenu", menu], ["context_reloadTab", reload]]);
  const tab = { id: "tab" };
  const calls = [];
  const window = { ...win, TabContextMenu: { contextTab: tab },
    document: { getElementById: id => ids.get(id) ?? null, createXULElement: tag => new El(tag) } };
  const state = { engine };
  const installed = installEngineTabMenu(window, { engineOf: () => state.engine,
    setTabEngine: async (t, id) => { calls.push(id); if (extraEngines === "fail") throw new Error("boom"); }, onFailure: error => calls.push(`failure:${error.message}`) });
  return { menu, installed, calls, state, window, reload, tab };
}

test("the tab menu installs one toggle item next to Reload and switches through setTabEngine", async () => {
  const f = menuFixture();
  const [, toggle, submenu] = f.menu.children;
  assert.equal(f.menu.children.length, 3);
  f.menu.fire("popupshowing");
  assert.equal(f.menu.children[1], toggle, "placed after Reload");
  assert.equal(toggle.hidden, false); assert.equal(submenu.hidden, true);
  assert.equal(toggle.getAttribute("label"), "Open in Chromium");
  toggle.fire("command");
  await Promise.resolve();
  assert.deepEqual(f.calls, ["chromium"]);
  f.state.engine = "chromium";
  f.menu.fire("popupshowing");
  assert.equal(toggle.getAttribute("label"), "Open in Firefox");
  toggle.fire("command");
  assert.deepEqual(f.calls, ["chromium", "gecko"]);
  f.menu.fire("popuphidden");
  assert.equal(f.menu.children.at(-1), submenu, "trailing again while closed");
  f.installed.dispose();
  assert.equal(f.menu.children.length, 1);
});

test("the tab menu hides without a second engine and in private windows", () => {
  const off = menuFixture({ win: windowWith({ web: false }) });
  off.menu.fire("popupshowing");
  assert.deepEqual(off.menu.children.slice(1).map(c => c.hidden), [true, true]);
  off.installed.dispose();
  const priv = menuFixture();
  priv.window.PrivateBrowsingUtils = { isWindowPrivate: () => true };
  priv.menu.fire("popupshowing");
  assert.deepEqual(priv.menu.children.slice(1).map(c => c.hidden), [true, true]);
  priv.installed.dispose();
});

test("with the developer pref the tab menu is an Open in submenu; the disabled engine and the current one do nothing", () => {
  const f = menuFixture({ win: windowWith({ prefs: { [SHOW_UNAVAILABLE_PREF]: true } }) });
  const [, toggle, submenu] = f.menu.children;
  f.menu.fire("popupshowing");
  assert.equal(toggle.hidden, true); assert.equal(submenu.hidden, false);
  assert.equal(submenu.getAttribute("label"), "Open in");
  const popup = submenu.children[0];
  assert.deepEqual(popup.children.map(c => [c.getAttribute("label"), c.getAttribute("checked"), c.getAttribute("disabled")]),
    [["Firefox", "true", "true"], ["Chromium", null, null], ["WebKit", null, "true"]]);
  popup.fire("command", { target: popup.children[0] });
  popup.fire("command", { target: popup.children[1] });
  assert.deepEqual(f.calls, ["chromium"], "the checked engine is not re-selected");
  f.installed.dispose();
});

test("a failed switch from the menu is reported, not thrown", async () => {
  const f = menuFixture({ extraEngines: "fail" });
  f.menu.fire("popupshowing");
  f.menu.children[1].fire("command");
  await new Promise(resolve => setTimeout(resolve, 0));
  assert.deepEqual(f.calls, ["chromium", "failure:boom"]);
  f.installed.dispose();
});

test("no tab menu, no installer", () => {
  assert.equal(installEngineTabMenu({ document: { getElementById: () => null } }, { engineOf: () => "gecko", setTabEngine() {} }), null);
});

// WebKit (Linux, fixture profile): availability is platform, pref, host, fixture page — in that order.
const ROOT = "/home/runner/axiosozo-build";
const linuxWindow = ({ os = "Linux", abi = "x86_64-gcc3", enabled = true, binary = `${ROOT}/webkit/AxioWebKitHost`,
  origin = "http://127.0.0.1:41231", web = false } = {}) => ({ Services: {
  appinfo: { OS: os, XPCOMABI: abi },
  env: { get: key => ({ AXIOSOZO_ENGINE_SWITCHING: web ? "1" : "", AXIOSOZO_BUILD_ROOT: ROOT, AXIOSOZO_WEBKIT_BINARY: binary,
    AXIOSOZO_ENGINE_FIXTURE_ORIGIN: origin })[key] ?? "" },
  prefs: { getBoolPref: (name, fallback) => ({ "axiosozo.engines.webkit.enabled": enabled })[name] ?? fallback } } });

test("webkit availability names the reason: macOS, other platforms, pref, host, fixture page", () => {
  assert.deepEqual(engineAvailability("webkit", linuxWindow({ os: "Darwin", abi: "aarch64-gcc3" })),
    { available: false, reason: "WebKit is not available on macOS yet" });
  assert.equal(engineAvailability("webkit", linuxWindow({ abi: "aarch64-gcc3" })).reason, "WebKit is not available on this platform yet");
  assert.equal(engineAvailability("webkit", linuxWindow({ os: "WINNT" })).reason, "WebKit is not available on this platform yet");
  assert.equal(engineAvailability("webkit", linuxWindow({ enabled: false })).reason, "WebKit is not enabled in this browser");
  assert.equal(engineAvailability("webkit", linuxWindow({ binary: "/usr/bin/AxioWebKitHost" })).reason, "The WebKit engine is not installed");
  assert.equal(engineAvailability("webkit", linuxWindow({ binary: "" })).reason, "The WebKit engine is not installed");
  assert.equal(engineAvailability("webkit", linuxWindow({ origin: "http://example.com:80" })).reason, "WebKit runs only the local test page for now");
  assert.deepEqual(engineAvailability("webkit", linuxWindow()), { available: true, reason: null, fixtureOnly: true });
});

test("three available engines: the tab menu is an Open in submenu and the glyph cycles gecko → chromium → webkit → gecko", () => {
  const w = linuxWindow({ web: true });
  assert.deepEqual(availableEngines(w).map(e => e.id), ["gecko", "chromium", "webkit"]);
  const model = tabMenuModel("webkit", w);
  assert.equal(model.mode, "submenu");
  assert.deepEqual(model.items.map(i => [i.label, i.checked, i.disabled]),
    [["Firefox", false, false], ["Chromium", false, false], ["WebKit", true, true]]);
  assert.equal(nextEngine("gecko", w), "chromium");
  assert.equal(nextEngine("chromium", w), "webkit");
  assert.equal(nextEngine("webkit", w), "gecko");
  // Gecko + WebKit only (the Linux fixture setup): a single toggle.
  const pair = linuxWindow();
  assert.deepEqual(tabMenuModel("gecko", pair).items.map(i => i.id), ["webkit"]);
  assert.equal(tabMenuModel("gecko", pair).label, "Open in WebKit");
  assert.equal(tabMenuModel("webkit", pair).label, "Open in Firefox");
  assert.equal(toContextEngine("webkit"), null, "context-v1 still cannot store webkit");
});

test("a later tab-menu installer takes the menu over until it disposes; the earlier one is then in charge again", async () => {
  const f = menuFixture();
  const calls = [];
  const later = installEngineTabMenu(f.window, { engineOf: () => "webkit", setTabEngine: async (tab, id) => calls.push(id) });
  assert.equal(f.menu.children.length, 3, "one set of items per window");
  f.menu.fire("popupshowing");
  assert.equal(f.menu.children[1].getAttribute("label"), "Open in Firefox", "the later installer's engine state");
  f.menu.children[1].fire("command");
  await Promise.resolve();
  assert.deepEqual(calls, ["gecko"]); assert.deepEqual(f.calls, []);
  later.dispose();
  f.menu.fire("popupshowing");
  assert.equal(f.menu.children[1].getAttribute("label"), "Open in Chromium");
  f.installed.dispose();
  assert.equal(f.menu.children.length, 1);
  const again = installEngineTabMenu(f.window, { engineOf: () => "gecko", setTabEngine() {} });
  assert.equal(f.menu.children.length, 3, "a fresh installer after full disposal builds the items again");
  again.dispose();
});
