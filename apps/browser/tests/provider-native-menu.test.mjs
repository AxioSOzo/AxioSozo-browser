/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. https://mozilla.org/MPL/2.0/ */
// TEST FIXTURES ONLY: a synthetic chrome DOM shaped like the pinned Firefox
// menubar (browser-menubar.inc.xhtml), fake windows and injected panels. No
// process, provider client, discovery, login or network. Not evidence of a
// running Zen or of macOS's native menu bar.
import test from "node:test";
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { Document, Element, Node, makeEvent } from "./support/mini-dom.mjs";

const { installProviderMenu, ASK_AI_ITEM_ID, STYLESHEET } = await import("../chrome/ProviderMenu.sys.mjs");

const XUL_NS = "http://www.mozilla.org/keymaster/gatekeeper/there.is.only.xul";
const HTML_NS = "http://www.w3.org/1999/xhtml";
const PBU = "resource://gre/modules/PrivateBrowsingUtils.sys.mjs";
const SHEET_DATA = `href="${STYLESHEET}" type="text/css"`;
const SETTINGS_URI = "chrome://browser/content/axiosozo/providers-settings.xhtml";
const STARTUP = readFileSync(new URL("../chrome/AxioSozoStartup.mjs", import.meta.url), "utf8");
const MENU_SOURCE = readFileSync(new URL("../chrome/ProviderMenu.sys.mjs", import.meta.url), "utf8");
const ticks = async (count = 10) => { for (let i = 0; i < count; i++) await new Promise(resolve => setImmediate(resolve)); };

// browser.xhtml's menubar as the pinned source declares it (macOS includes the
// same file through macWindow.inc.xhtml).
function browserDocument({ menubar = "menubar", namespace = XUL_NS, tools = true, separator = true, principal = true } = {}) {
  const doc = new Document();
  doc.nodePrincipal = { isSystemPrincipal: principal };
  doc.createXULElement = tag => new Element(doc, tag, XUL_NS);
  doc.createProcessingInstruction = (target, data) => Object.assign(new Node(doc), { nodeType: 7, target, data });
  const node = (tag, id, ...children) => { const el = new Element(doc, tag, namespace); el.id = id; el.append(...children); return el; };
  const popup = node("menupopup", "menu_ToolsPopup", node("menuitem", "menu_openDownloads"), node("menuitem", "menu_openAddons"),
    node("menuitem", "menu_openFirefoxView"), node("menuitem", "menu_editPDF"), ...(separator ? [node("menuseparator", "devToolsSeparator")] : []),
    node("menu", "browserToolsMenu", node("menupopup", "menuWebDeveloperPopup")), node("menuitem", "menu_pageInfo"));
  doc.documentElement.id = "main-window";
  doc.documentElement.append(node(menubar, "main-menubar", node("menu", "file-menu", node("menupopup", "menu_FilePopup")),
    ...(tools ? [node("menu", "tools-menu", popup)] : []), node("menu", "helpMenu", node("menupopup", "menu_HelpPopup"))));
  return doc;
}
function browserWindow(doc = browserDocument()) {
  const listeners = [];
  return { document: doc, listeners, gBrowser: { selectedBrowser: { focus() {} } },
    addEventListener: (...args) => listeners.push(["add", ...args]), removeEventListener: (...args) => listeners.push(["remove", ...args]) };
}
function fakePanel() {
  const calls = [];
  const installPanel = (win, options) => {
    calls.push(["install", win, options]);
    return { open: () => calls.push(["open"]), dispose: () => calls.push(["dispose"]), diagnostics: () => ({ open: true, busy: false, connected: false }) };
  };
  return { calls, installPanel };
}
const askItem = doc => doc.getElementById(ASK_AI_ITEM_ID);
const toolsIds = doc => doc.getElementById("menu_ToolsPopup").children.map(child => child.id);
const sheets = doc => doc.childNodes.filter(node => node.nodeType === 7);
const elementCount = doc => doc.querySelectorAll("*").length;
// The whole document: nodes, attributes, live listeners and processing instructions.
function snapshot(doc) {
  const live = map => [...(map ?? [])].filter(([, set]) => set.size).map(([type, set]) => [type, set.size]);
  const walk = node => ({ node: node.localName ?? `?${node.target} ${node.data}`, ns: node.namespaceURI ?? null,
    attributes: [...(node.attributes ?? [])], listeners: live(node.listeners), children: node.childNodes.map(walk) });
  return JSON.stringify({ children: doc.childNodes.map(walk), listeners: live(doc.listeners) });
}
function chromeUtils({ isPrivate = false, modules = {} } = {}) {
  const imports = [];
  return { imports, importESModule(url) {
    imports.push(url);
    if (url === PBU) return { PrivateBrowsingUtils: { isWindowPrivate: () => (typeof isPrivate === "function" ? isPrivate() : isPrivate) } };
    if (Object.hasOwn(modules, url)) return modules[url];
    throw new Error(`not available in this harness: ${url}`);
  } };
}
async function withGlobals(values, run) {
  const previous = Object.fromEntries(Object.keys(values).map(name => [name, Object.getOwnPropertyDescriptor(globalThis, name)]));
  Object.assign(globalThis, values);
  try { return await run(); } finally {
    for (const [name, descriptor] of Object.entries(previous)) {
      if (descriptor) Object.defineProperty(globalThis, name, descriptor); else delete globalThis[name];
    }
  }
}

// ---------------------------------------------------------------- the installer

// The generated, pinned Zen/Firefox source (scripts/zen.py: <build root>/zen/source), read only.
const MENUBAR_SOURCE = `${process.env.AXIOSOZO_BUILD_ROOT || "/Volumes/AxioSozoBuild"}/zen/source/engine/browser/base/content/browser-menubar.inc.xhtml`;
test("the native target is the pinned Firefox Tools menu: main-menubar > tools-menu > menu_ToolsPopup, before devToolsSeparator", {
  skip: existsSync(MENUBAR_SOURCE) ? false : `generated Zen source not present (${MENUBAR_SOURCE})`,
}, () => {
  const source = readFileSync(MENUBAR_SOURCE, "utf8");
  const at = text => { const index = source.indexOf(text); assert.ok(index >= 0, text); return index; };
  const menubar = at('<menubar id="main-menubar">'), tools = at('<menu id="tools-menu"'), popup = at('<menupopup id="menu_ToolsPopup">');
  const anchor = at('<menuseparator id="devToolsSeparator"/>'), end = at("</menubar>");
  assert.ok(menubar < tools && tools < popup && popup < anchor && anchor < end);
  assert.equal(source.indexOf('id="menu_ToolsPopup"', popup + '<menupopup id="menu_ToolsPopup">'.length), -1, "one Tools popup");
  assert.equal(source.slice(popup, anchor).match(/<menupopup\b/gu).length, 1, "no nested popup opens before the separator: it is menu_ToolsPopup's own child");
});

test("ordinary window: one Ask AI… item before the native devToolsSeparator; a trusted command opens the panel, built on first use", () => {
  const doc = browserDocument(); const win = browserWindow(doc); const panel = fakePanel();
  const engineProbe = Object.freeze({ fake: "engine probe" });
  const before = elementCount(doc);
  const menu = installProviderMenu(win, { engineProbe, isPrivate: () => false, installPanel: panel.installPanel });
  const item = askItem(doc);
  assert.deepEqual([item.localName, item.namespaceURI, item.getAttribute("label"), item.disabled], ["menuitem", XUL_NS, "Ask AI…", false]);
  assert.deepEqual(toolsIds(doc), ["menu_openDownloads", "menu_openAddons", "menu_openFirefoxView", "menu_editPDF", ASK_AI_ITEM_ID,
    "devToolsSeparator", "browserToolsMenu", "menu_pageInfo"]);
  assert.equal(elementCount(doc), before + 1, "one menu item and nothing else: no toolbar, sidebar or key element");
  for (const name of ["key", "accesskey", "acceltext", "command", "oncommand", "style", "class", "tooltiptext"]) assert.equal(item.getAttribute(name), null, name);
  assert.deepEqual(sheets(doc).map(node => [node.target, node.data]), [["xml-stylesheet", SHEET_DATA]]);
  assert.equal(doc.childNodes.indexOf(sheets(doc)[0]), doc.childNodes.indexOf(doc.documentElement) - 1);
  assert.deepEqual(panel.calls, [], "the panel is installed on first use only");
  assert.deepEqual([win.listeners, [...doc.listeners.keys()]], [[], []], "no window or document listener: Zen's shortcuts stay its own");
  assert.deepEqual([...item.listeners].filter(([, set]) => set.size).map(([type, set]) => [type, set.size]), [["command", 1]]);

  item.dispatchEvent(makeEvent("command"));
  assert.deepEqual(panel.calls, [["install", win, { engineProbe }], ["open"]]);
  item.dispatchEvent(makeEvent("command"));
  assert.deepEqual(panel.calls.map(([step]) => step), ["install", "open", "open"], "one panel per window; a second command reopens it");
  assert.deepEqual(menu.diagnostics(), { installed: true, private: false, panel: { open: true, busy: false, connected: false } });
  assert(Object.isFrozen(menu));
});

test("untrusted, retargeted and native sibling command events are ignored", () => {
  const doc = browserDocument(); const panel = fakePanel();
  installProviderMenu(browserWindow(doc), { isPrivate: () => false, installPanel: panel.installPanel });
  const item = askItem(doc);
  item.dispatchEvent(makeEvent("command", { isTrusted: false }));
  item.dispatchEvent(makeEvent("command", { target: doc.getElementById("menu_pageInfo") }));
  doc.getElementById("menu_openDownloads").dispatchEvent(makeEvent("command"));
  doc.getElementById("menu_ToolsPopup").dispatchEvent(makeEvent("command"));
  assert.deepEqual(panel.calls, []);
});

test("private or unknown-privacy windows: Ask AI is shown disabled, with no listener, sheet or panel", async () => {
  const cases = [["private", () => true], ["privacy check throws", () => { throw new Error("NS_ERROR_FAILURE"); }],
    ["privacy unknown", () => undefined], ["privacy not a boolean", () => "false"]];
  for (const [label, isPrivate] of cases) {
    const doc = browserDocument(); const win = browserWindow(doc); const panel = fakePanel();
    const menu = installProviderMenu(win, { isPrivate, installPanel: panel.installPanel });
    const item = askItem(doc);
    assert.deepEqual([item.getAttribute("label"), item.getAttribute("disabled")], ["Ask AI…", "true"], label);
    assert.deepEqual([...item.listeners.values()].reduce((sum, set) => sum + set.size, 0), 0, label);
    assert.deepEqual(sheets(doc), [], label);
    item.dispatchEvent(makeEvent("command"));
    assert.deepEqual(panel.calls, [], label);
    assert.equal(menu.diagnostics().private, true, label);
  }
  // The default check is Gecko's own PrivateBrowsingUtils for exactly this window.
  for (const isPrivate of [true, false]) {
    const utils = chromeUtils({ isPrivate });
    await withGlobals({ ChromeUtils: utils }, () => {
      const doc = browserDocument();
      installProviderMenu(browserWindow(doc), { installPanel: fakePanel().installPanel });
      assert.equal(askItem(doc).disabled, isPrivate);
      assert.deepEqual(utils.imports, [PBU]);
    });
  }
});

test("a missing or different native menu, an untrusted document or an existing entry or panel: null and nothing changes", () => {
  const cases = [
    ["no Tools menu", () => browserDocument({ tools: false })],
    ["no devToolsSeparator", () => browserDocument({ separator: false })],
    ["not a menubar", () => browserDocument({ menubar: "toolbar" })],
    ["not XUL", () => browserDocument({ namespace: HTML_NS })],
    ["not the system principal", () => browserDocument({ principal: false })],
    ["Tools popup moved to another menu", () => { const doc = browserDocument(); doc.getElementById("file-menu").append(doc.getElementById("menu_ToolsPopup")); return doc; }],
    ["separator in another popup", () => { const doc = browserDocument(); doc.getElementById("menu_HelpPopup").append(doc.getElementById("devToolsSeparator")); return doc; }],
    ["Tools menu outside the menubar", () => { const doc = browserDocument(); doc.documentElement.append(doc.getElementById("tools-menu")); return doc; }],
    ["an Ask AI entry already exists", () => { const doc = browserDocument(); const other = doc.createXULElement("menuitem"); other.id = ASK_AI_ITEM_ID; doc.getElementById("menu_HelpPopup").append(other); return doc; }],
    ["a provider panel already exists", () => { const doc = browserDocument(); const other = doc.createElementNS(HTML_NS, "section"); other.id = "axiosozo-provider-panel"; doc.documentElement.append(other); return doc; }],
  ];
  for (const [label, build] of cases) {
    const doc = build(); const win = browserWindow(doc); const panel = fakePanel();
    const before = snapshot(doc);
    assert.equal(installProviderMenu(win, { isPrivate: () => false, installPanel: panel.installPanel }), null, label);
    assert.equal(snapshot(doc), before, label);
    assert.deepEqual([panel.calls, win.listeners], [[], []], label);
  }
  for (const win of [null, undefined, {}, { document: null }]) assert.equal(installProviderMenu(win, { isPrivate: () => false }), null);
});

test("idempotent per window; dispose removes exactly its own item, listener, sheet and panel; a later install starts fresh", () => {
  const doc = browserDocument(); const win = browserWindow(doc); const panel = fakePanel();
  // Foreign neighbours: the AxioSozo home entry and another owner's sheet.
  const home = doc.createXULElement("menuitem"); home.id = "axiosozo-tools-home";
  const separator = doc.createXULElement("menuseparator");
  doc.getElementById("menu_ToolsPopup").prepend(home, separator);
  const foreignSheet = doc.createProcessingInstruction("xml-stylesheet", 'href="chrome://browser/content/axiosozo/space-switcher.css" type="text/css"');
  doc.insertBefore(foreignSheet, doc.documentElement);
  const pristine = snapshot(doc);

  const menu = installProviderMenu(win, { isPrivate: () => false, installPanel: panel.installPanel });
  const installed = snapshot(doc);
  assert.equal(installProviderMenu(win, { isPrivate: () => false, installPanel: panel.installPanel }), null, "a second install changes nothing");
  assert.equal(snapshot(doc), installed);
  assert.equal(doc.querySelectorAll(`#${ASK_AI_ITEM_ID}`).length, 1);
  assert.equal(sheets(doc).filter(node => node.data === SHEET_DATA).length, 1);

  const item = askItem(doc);
  item.dispatchEvent(makeEvent("command"));
  menu.dispose();
  assert.equal(snapshot(doc), pristine, "only its own nodes and listener were removed");
  assert.ok(home.parentNode && separator.parentNode && foreignSheet.parentNode === doc, "foreign nodes are untouched");
  assert.deepEqual(panel.calls.map(([step]) => step), ["install", "open", "dispose"]);
  menu.dispose();
  item.dispatchEvent(makeEvent("command"));
  assert.deepEqual(panel.calls.map(([step]) => step), ["install", "open", "dispose"], "a second dispose and a late command do nothing");
  assert.equal(menu.diagnostics().installed, false);

  const again = installProviderMenu(win, { isPrivate: () => false, installPanel: panel.installPanel });
  assert.ok(again && askItem(doc) && askItem(doc) !== item);
  again.dispose();
  assert.equal(snapshot(doc), pristine);
});

test("a sheet the document already loads (the fixture probe's) is reused, never duplicated and never removed", () => {
  const doc = browserDocument();
  const probeSheet = doc.createProcessingInstruction("xml-stylesheet", SHEET_DATA);
  doc.insertBefore(probeSheet, doc.documentElement);
  const menu = installProviderMenu(browserWindow(doc), { isPrivate: () => false, installPanel: fakePanel().installPanel });
  assert.deepEqual(sheets(doc), [probeSheet]);
  menu.dispose();
  assert.deepEqual(sheets(doc), [probeSheet]);
});

test("a failed installation leaves the document unchanged", () => {
  const doc = browserDocument(); const before = snapshot(doc);
  doc.getElementById("menu_ToolsPopup").insertBefore = () => { throw new Error("menu refused"); };
  assert.throws(() => installProviderMenu(browserWindow(doc), { isPrivate: () => false, installPanel: fakePanel().installPanel }), /menu refused/u);
  assert.equal(snapshot(doc), before, "no item and no sheet left behind");
});

test("installing, opening a failing panel and disposing a failing panel never throw into the window", () => {
  const doc = browserDocument(); const errors = [];
  const quiet = { error: (...args) => errors.push(args[0]) };
  const previous = globalThis.console;
  globalThis.console = { ...previous, ...quiet };
  try {
    const refused = installProviderMenu(browserWindow(doc), { isPrivate: () => false, installPanel: () => { throw new Error("panel unavailable"); } });
    askItem(doc).dispatchEvent(makeEvent("command"));
    refused.dispose();
    const breaking = installProviderMenu(browserWindow(doc), { isPrivate: () => false,
      installPanel: () => ({ open() {}, dispose() { throw new Error("dispose failed"); } }) });
    askItem(doc).dispatchEvent(makeEvent("command"));
    breaking.dispose();
    assert.equal(askItem(doc), null);
    assert.deepEqual(sheets(doc), []);
  } finally { globalThis.console = previous; }
  assert.deepEqual(errors, ["AxioSozo: Ask AI unavailable", "AxioSozo: Ask AI dispose failed"]);
});

test("the installer source takes no shortcut, intercepts no command and authors no style", () => {
  const code = MENU_SOURCE.replace(/\/\*[\s\S]*?\*\//gu, "").replace(/^\s*\/\/.*$/gmu, "");
  assert.doesNotMatch(code, /keydown|keypress|keyset|createXULElement\("key"\)|setAttribute\("(key|accesskey|acceltext|command|oncommand|style)"/u);
  assert.doesNotMatch(code, /win\.addEventListener|doc\.addEventListener|stopImmediatePropagation|preventDefault|\.style\b|<style|insertRule/u);
  assert.doesNotMatch(code, /BrowserExperience|Subprocess|discover|ProviderConversation|openProviderSettings|login/u);
  assert.deepEqual(code.match(/^import .*$/gmu), ['import { installProviderPanel } from "./ProviderPanel.sys.mjs";']);
  assert.equal(code.match(/createProcessingInstruction\(/gu).length, 1);
});

test("every selector of the loaded sheet is scoped to an AxioSozo id; Zen tokens are only read", () => {
  const css = readFileSync(new URL("../chrome/browser-experience.css", import.meta.url), "utf8").replace(/\/\*[\s\S]*?\*\//gu, "");
  const topLevel = text => { const parts = []; let depth = 0, start = 0;
    for (let i = 0; i < text.length; i++) {
      if (text[i] === "(") depth++; else if (text[i] === ")") depth--;
      else if (text[i] === "," && depth === 0) { parts.push(text.slice(start, i)); start = i + 1; }
    }
    return [...parts, text.slice(start)].map(part => part.trim()); };
  let checked = 0;
  for (const [, prelude] of css.matchAll(/([^{}]+)\{/gu)) {
    const selector = prelude.split(";").at(-1).trim();
    // At-rules, keyframe steps and rules nested inside a scoped rule.
    if (/^[@&>+~]/u.test(selector) || /^(from|to)$/u.test(selector)) continue;
    for (const part of topLevel(selector)) { assert.match(part, /^(:is\()?#axiosozo-/u, part); checked++; }
  }
  assert.ok(checked > 20);
  assert.doesNotMatch(css, /(^|[;{\s])--zen-[\w-]+\s*:/u, "no Zen custom property is assigned");
});

// ---------------------------------------------------------------- with the real provider panel

test("with the real provider panel: Ask AI opens a focused dialog and Settings opens its window; nothing is spawned, discovered or stored", async () => {
  const utils = chromeUtils();
  const written = []; const alerts = []; const focused = [];
  const Services = { prefs: { getStringPref: (_name, fallback) => fallback, setStringPref: (...args) => written.push(args) },
    uuid: { generateUUID: () => { throw new Error("opening creates no configuration"); } }, prompt: { alert: (...args) => alerts.push(args) } };
  await withGlobals({ ChromeUtils: utils, Services }, () => {
    const doc = browserDocument(); const win = browserWindow(doc);
    win.gBrowser = { selectedBrowser: { focus: () => focused.push("browser") } };
    const dialogs = [];
    win.openDialog = (...args) => {
      const dialog = { closed: false, document: { readyState: "loading", documentURI: "about:blank" }, waits: [],
        addEventListener(type) { this.waits.push(type); }, focus() {}, close() { this.closed = true; } };
      dialogs.push({ args, dialog }); return dialog;
    };
    const menu = installProviderMenu(win);
    assert.equal(doc.getElementById("axiosozo-provider-panel"), null, "built on first open only");
    askItem(doc).dispatchEvent(makeEvent("command"));
    const panel = doc.getElementById("axiosozo-provider-panel");
    assert.ok(panel && !panel.hidden);
    assert.deepEqual(["role", "aria-modal", "aria-labelledby"].map(name => panel.getAttribute(name)), ["dialog", "true", "axiosozo-provider-title"]);
    assert.equal(doc.activeElement, doc.getElementById("axiosozo-provider-question"), "focus moves into the question field");
    assert.equal(panel.querySelector('[role="status"]').textContent, "Nothing is sent until you press Send. ⌘Enter to send.");
    assert.deepEqual([...doc.getElementById("axiosozo-provider-choice").querySelectorAll("option")].map(option => option.value), ["codex", "claude-code", "antigravity"]);
    askItem(doc).dispatchEvent(makeEvent("command"));
    assert.equal(doc.querySelectorAll("#axiosozo-provider-panel").length, 1);

    // Settings opens the provider configurations window; its metadata is read only on an explicit Refresh there.
    panel.querySelectorAll("button").find(button => button.textContent === "Settings").click();
    assert.equal(dialogs.length, 1);
    assert.deepEqual(dialogs[0].args.slice(0, 2), [SETTINGS_URI, "axiosozo-provider-settings"]);
    assert.deepEqual(dialogs[0].dialog.waits, ["unload", "DOMContentLoaded"]);

    assert.deepEqual(new Set(utils.imports), new Set([PBU]), "no Subprocess or any other module was loaded");
    assert.deepEqual([written, alerts], [[], []], "no provider configuration was created and nothing was refused");
    menu.dispose();
    assert.deepEqual([doc.getElementById("axiosozo-provider-panel"), askItem(doc), sheets(doc).length], [null, null, 0]);
    assert.deepEqual(focused, ["browser"], "closing returns focus to the page");
  });
});

// ---------------------------------------------------------------- the actual startup wiring

/** optionalModule(), guarded() and initialize() of AxioSozoStartup.mjs, evaluated with injected globals. */
function startupInitialize(globals) {
  const pick = head => {
    const start = STARTUP.indexOf(`\n${head}`);
    const end = STARTUP.indexOf("\n}\n", start);
    assert.ok(start >= 0 && end > start, head);
    return STARTUP.slice(start, end + 2);
  };
  const constant = STARTUP.match(/^const AXIOSOZO = .*;$/mu)[0];
  // eslint-disable-next-line no-new-func -- test-only evaluation of the window startup
  return new Function(...Object.keys(globals),
    `${constant}\n${pick("function optionalModule(")}${pick("function guarded(")}${pick("async function initialize(")}\nreturn initialize;`)(...Object.values(globals));
}
function startupHarness({ isPrivate = false, fixture = false } = {}) {
  const doc = browserDocument(); const listeners = new Map();
  let ready;
  const window = { document: doc, gBrowser: { selectedBrowser: { focus() {} } },
    gZenStartup: { promiseInitialized: new Promise(resolve => { ready = resolve; }) },
    addEventListener(type, fn) { if (!listeners.has(type)) listeners.set(type, []); listeners.get(type).push(fn); },
    removeEventListener(type, fn) { listeners.set(type, (listeners.get(type) ?? []).filter(other => other !== fn)); },
    // Every listener startup adds is { once: true }.
    fire(type) { const list = listeners.get(type) ?? []; listeners.delete(type); for (const fn of list) fn({ type }); },
    listenerTypes: () => [...listeners].filter(([, list]) => list.length).map(([type, list]) => [type, list.length]) };
  const menuCalls = []; const contextsCalls = []; const errors = [];
  const utils = chromeUtils({ isPrivate, modules: { "chrome://browser/content/axiosozo/ProviderMenu.sys.mjs": {
    installProviderMenu: (win, options) => { menuCalls.push(options); return installProviderMenu(win, { ...options, installPanel: fakePanel().installPanel }); } } } });
  const engineProbe = fixture ? { diagnostics: () => ({ browsingMode: "fixture" }), dispose: async () => {} } : null;
  const initialize = startupInitialize({ window, document: doc, Services: { prefs: { getBoolPref: (_name, fallback) => fallback } },
    ChromeUtils: utils, console: { error: (...args) => errors.push(String(args[0])), info() {} },
    GeckoEngineAdapter: class { dispose() {} }, attachCoordinator: () => { throw new Error("no coordinator in this harness"); }, CEFPresenter: class {},
    installEngineProbeControls: () => engineProbe, registerOverview: () => false,
    installContexts: async options => { contextsCalls.push(options); return { disposers: [], services: null, zen: null, runtime: {}, startPage: null }; } });
  const requested = () => utils.imports.filter(url => url !== PBU);
  return { doc, window, utils, requested, menuCalls, contextsCalls, errors, engineProbe, ready: () => ready(), initialize };
}

test("startup source: Ask AI is installed once, right after Zen's startup, and disposed at unload; BrowserExperience is never loaded", () => {
  assert.doesNotMatch(STARTUP, /BrowserExperience|installBrowserExperience|installProviderPanel|ProviderPanel\.sys\.mjs/u);
  assert.equal(STARTUP.match(/installProviderMenu\(/gu).length, 1);
  assert.equal(STARTUP.match(/providerMenu\?\.dispose\(\)/gu).length, 1);
  const init = STARTUP.slice(STARTUP.indexOf("async function initialize()"));
  const readyLine = "await window.gZenStartup.promiseInitialized;\n  if (disposed) return;";
  const ready = init.indexOf(readyLine);
  const install = init.indexOf('const providerMenu = guarded("provider menu", () => optionalModule("ProviderMenu.sys.mjs")?.installProviderMenu(window, { engineProbe }));');
  const unload = init.indexOf('window.addEventListener("unload", () => {\n    disposed = true; providerMenu?.dispose(); probeSheet?.remove();');
  assert.ok(ready > 0 && install > ready && unload > install);
  assert.doesNotMatch(init.slice(ready + readyLine.length, unload), /\bawait\b/u, "installed and given its disposer in one synchronous turn");
  assert.ok(init.indexOf("if (probeSheet) document.insertBefore(") < install, "after the fixture probe's sheet, so that sheet is reused");
});

test("startup: Ask AI appears only after Zen's startup, enabled in a normal window and disabled in a private one; unload removes exactly it", async () => {
  for (const isPrivate of [false, true]) {
    const h = startupHarness({ isPrivate });
    const pristine = snapshot(h.doc);
    await withGlobals({ ChromeUtils: h.utils }, async () => {
      const running = h.initialize();
      await ticks();
      assert.equal(askItem(h.doc), null, "nothing before Zen's startup has finished");
      assert.deepEqual(h.requested(), []);
      h.ready(); await running;
      const item = askItem(h.doc);
      assert.equal(toolsIds(h.doc).indexOf(ASK_AI_ITEM_ID) + 1, toolsIds(h.doc).indexOf("devToolsSeparator"));
      assert.equal(item.disabled, isPrivate);
      assert.deepEqual(h.menuCalls, [{ engineProbe: null }]);
      assert.equal(sheets(h.doc).length, isPrivate ? 0 : 1);
      assert.ok(h.window.AxioSozo && h.contextsCalls.length === 1, "the rest of startup continues as before");
      assert.ok(!h.errors.some(message => /provider menu|ProviderMenu/u.test(message)), h.errors.join("\n"));
      assert.deepEqual(h.window.listenerTypes(), [["unload", 2]], "only startup's own lifetime listeners");
      h.window.fire("unload");
      assert.equal(snapshot(h.doc), pristine, "unload removed the entry and its sheet, nothing else");
    });
  }
});

test("startup: a window closed during Zen's startup installs and publishes nothing", async () => {
  const h = startupHarness();
  const pristine = snapshot(h.doc);
  await withGlobals({ ChromeUtils: h.utils }, async () => {
    const running = h.initialize();
    await ticks();
    h.window.fire("unload");
    h.ready(); await running;
    assert.equal(snapshot(h.doc), pristine);
    assert.deepEqual([h.window.AxioSozo, h.menuCalls, h.contextsCalls, h.requested()], [undefined, [], [], []]);
  });
});

test("startup in the fixture probe: its browser-experience sheet is reused; one sheet, removed once at unload", async () => {
  const h = startupHarness({ fixture: true });
  const pristine = snapshot(h.doc);
  await withGlobals({ ChromeUtils: h.utils }, async () => {
    const running = h.initialize();
    h.ready(); await running;
    assert.deepEqual(sheets(h.doc).map(node => node.data), [SHEET_DATA]);
    assert.equal(h.menuCalls.length, 1);
    assert.equal(h.menuCalls[0].engineProbe, h.engineProbe, "the panel gets this window's engine probe");
    assert.equal(askItem(h.doc).disabled, false);
    h.window.fire("unload");
    assert.equal(snapshot(h.doc), pristine);
  });
});
