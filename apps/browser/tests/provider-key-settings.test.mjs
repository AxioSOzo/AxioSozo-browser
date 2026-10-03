/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. https://mozilla.org/MPL/2.0/ */

// The native Settings dialog's decision-key forms (providers-settings.xhtml with
// ProviderSettings → ProviderStatus → ProviderKeys and the native fixture factory)
// in a small Node DOM with fake Gecko globals and an in-memory fake helper.
// FAKES ONLY: no process, Keychain, fixture, provider or network; keys are invented
// placeholders. Not evidence of Gecko rendering, focus rings, VoiceOver or colours.
import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { parseHtml, makeEvent } from "./support/mini-dom.mjs";
import { openProviderSettings } from "../chrome/ProviderSettings.sys.mjs";

const XHTML = readFileSync(new URL("../chrome/providers-settings.xhtml", import.meta.url), "utf8");
const SETTINGS_URI = "chrome://browser/content/axiosozo/providers-settings.xhtml";
const HELPER = "/Volumes/AxioSozoBuild/workstation/providers/keychain";
const JEV_KEY = "synthetic-jev-key-0000";
const OPENAI_KEY = "synthetic-openai-key-0000";
const flush = async (rounds = 12) => { for (let i = 0; i < rounds; i++) await new Promise(resolve => setTimeout(resolve, 0)); };

// The helper as ProviderKeys sees it through Subprocess: raw pipes, presence markers only.
function fakeHelper() {
  const items = new Set(); const argv = []; const stdin = []; let gate = null;
  return { items, argv, stdin,
    hold() { let release; gate = new Promise(resolve => { release = resolve; }); return () => { gate = null; release(); }; },
    async call(options) {
      argv.push([options.command, ...options.arguments]);
      if (gate) await gate;
      const [operation, provider = "jev"] = options.arguments;
      let closed, input = ""; const done = new Promise(resolve => { closed = resolve; });
      const raw = { read: async () => new ArrayBuffer(0), close: async () => {} };
      return { stdout: raw, stderr: raw, kill: async () => {},
        stdin: { write: async value => { input += value; stdin.push(value); }, close: async () => closed() },
        async wait() {
          await done;
          if (operation === "exists") return { exitCode: items.has(provider) ? 0 : 44 };
          if (operation === "remove") return { exitCode: items.delete(provider) ? 0 : 44 };
          if (!input) return { exitCode: 1 };
          items.add(provider); return { exitCode: 0 };
        } };
    } };
}

function installGlobals({ env, prefValues, helper }) {
  const previous = { ChromeUtils: globalThis.ChromeUtils, Services: globalThis.Services, Cc: globalThis.Cc, Ci: globalThis.Ci };
  const imports = [];
  globalThis.ChromeUtils = { importESModule(url) {
    imports.push(url);
    // A window's privacy as the test sets it: true, false (default) or "throw".
    if (url.endsWith("PrivateBrowsingUtils.sys.mjs")) return { PrivateBrowsingUtils: { isWindowPrivate(window) {
      if (window.privacy === "throw") throw new Error("privacy unavailable");
      return window.privacy === true;
    } } };
    if (url.endsWith("Subprocess.sys.mjs")) return { Subprocess: { call: options => helper.call(options) } };
    if (url.endsWith("Timer.sys.mjs")) return { setTimeout, clearTimeout };
    throw new Error(`unexpected import ${url}`);
  } };
  globalThis.Services = {
    env: { get: name => env[name] },
    prefs: { getBoolPref: (name, fallback) => (Object.hasOwn(prefValues, name) ? prefValues[name] : fallback),
      getStringPref: (_name, fallback) => fallback, setStringPref() {} },
    uuid: { generateUUID: () => "{00000000-0000-4000-8000-000000000001}" },
    prompt: { alert() {} },
  };
  globalThis.Ci = { nsIFile: "nsIFile" };
  globalThis.Cc = { "@mozilla.org/file/local;1": { createInstance: () => {
    let path = null;
    return { initWithPath(value) { path = value; }, exists: () => path === HELPER, isSymlink: () => false, normalize() {},
      get path() { return path; }, isFile: () => true };
  } } };
  return { imports, restore() {
    for (const [name, value] of Object.entries(previous)) { if (value === undefined) delete globalThis[name]; else globalThis[name] = value; }
  } };
}

async function openDialog({ env = { AXIOSOZO_BUILD_ROOT: "/Volumes/AxioSozoBuild/workstation" },
  prefValues = { "axiosozo.jev.keyEntry.enabled": true, "axiosozo.openai.keyEntry.enabled": true }, stored = [] } = {}) {
  const helper = fakeHelper();
  for (const provider of stored) helper.items.add(provider);
  const globals = installGlobals({ env, prefValues, helper });
  const document = parseHtml(XHTML);
  Object.assign(document, { readyState: "complete", documentURI: SETTINGS_URI, nodePrincipal: { isSystemPrincipal: true } });
  const listeners = new Map(), parentListeners = new Map();
  const browserWindow = { document: { nodePrincipal: { isSystemPrincipal: true } }, closed: false, privacy: false,
    addEventListener: (type, fn) => parentListeners.set(type, fn), removeEventListener() {}, openTrustedLinkIn() {}, openDialog: () => win };
  const win = { document, closed: false, AbortController, opener: browserWindow, focus() {},
    addEventListener: (type, fn) => listeners.set(type, fn), removeEventListener() {},
    close() { if (win.closed) return; win.closed = true; listeners.get("unload")?.(); } };
  assert.equal(openProviderSettings(browserWindow), win);
  await flush();
  const $ = id => document.getElementById(id);
  const submit = async provider => { $(`${provider}-form`).dispatchEvent(makeEvent("submit")); };
  return { document, helper, globals, win, browserWindow, $, submit, close: () => win.close(),
    closeParent: () => { browserWindow.closed = true; parentListeners.get("unload")?.(); } };
}

const keyOps = helper => helper.argv.filter(([command]) => command === HELPER).map(([, ...args]) => args);
const everyAttribute = document => JSON.stringify(document.querySelectorAll("*").map(node => [...node.attributes.values(), node.value ?? ""]));

test("both providers: store, presence and removal are independent; replacing one keeps the other; nothing is ready", async () => {
  const d = await openDialog();
  try {
    assert.deepEqual(["jev", "openai"].map(p => d.$(`${p}-state`).textContent), ["No key stored", "No key stored"]);
    assert.deepEqual(keyOps(d.helper), [["exists"], ["exists", "openai"]], "one presence check per provider, nothing read");
    assert.equal(d.$("jev-label").textContent, "Jev API key");
    assert.deepEqual(["jev-store", "openai-store"].map(id => d.$(id).getAttribute("aria-label")), ["Store key for Jev", "Store key for OpenAI"]);
    assert.equal(d.$("openai-remove").disabled, true, "nothing to remove yet");

    d.$("jev-key").value = JEV_KEY;
    await d.submit("jev");
    assert.equal(d.$("jev-key").value, "", "cleared before the helper answers");
    await flush();
    assert.equal(d.$("jev-state").textContent, "Key stored");
    assert.equal(d.$("openai-state").textContent, "No key stored");
    assert.match(d.$("settings-status").textContent, /^Jev key stored in the macOS Keychain\. It will not be shown again\. Nothing was sent and consent did not change\.$/u);
    assert.match(d.$("jev-detail").textContent, /has not been used or checked: decision calls are not available in this build/u);
    assert.deepEqual([d.$("jev-store").textContent, d.$("jev-label").textContent, d.$("jev-remove").disabled], ["Replace key", "Replace the Jev key", false]);

    d.$("openai-key").value = OPENAI_KEY;
    await d.submit("openai");
    await flush();
    d.$("jev-key").value = "synthetic-jev-replacement";
    await d.submit("jev");
    await flush();
    assert.deepEqual([...d.helper.items].sort(), ["jev", "openai"], "replacing Jev kept OpenAI");
    assert.match(d.$("openai-detail").textContent, /OpenAI's decision format is not verified/u);

    d.$("jev-remove").focus();
    d.$("jev-remove").click();
    await flush();
    assert.deepEqual([...d.helper.items], ["openai"], "removing Jev kept OpenAI");
    assert.deepEqual([d.$("jev-state").textContent, d.$("openai-state").textContent], ["No key stored", "Key stored"]);
    assert.equal(d.document.activeElement, d.$("jev-key"), "focus moves into the form when Remove becomes unavailable");
    assert.equal(d.$("settings-status").textContent, "Jev key removed from the macOS Keychain.");

    assert.deepEqual(d.helper.stdin, [JEV_KEY, OPENAI_KEY, "synthetic-jev-replacement"], "each key only once, only on stdin");
    assert(!JSON.stringify(d.helper.argv).includes("synthetic-"), "never in argv");
    assert(!d.document.body.textContent.includes("synthetic-") && !everyAttribute(d.document).includes("synthetic-"),
      "never in the dialog's text, attributes or fields");
    assert.doesNotMatch(d.document.body.textContent, /\bReady\b/u);
  } finally { d.close(); d.globals.restore(); }
});

test("key entry off or its pref absent: storing is refused before any helper work; invalid keys never leave", async () => {
  for (const prefValues of [{ "axiosozo.jev.keyEntry.enabled": true, "axiosozo.openai.keyEntry.enabled": false },
    { "axiosozo.jev.keyEntry.enabled": true }]) {
    const d = await openDialog({ prefValues });
    try {
      assert.equal(d.$("openai-state").textContent, "Turned off");
      assert.match(d.$("openai-detail").textContent, /adding one is turned off in this build \(axiosozo\.openai\.keyEntry\.enabled\)/u);
      assert.deepEqual([d.$("openai-key").disabled, d.$("openai-store").disabled], [true, true]);
      await d.submit("openai");
      await flush();
      assert.equal(keyOps(d.helper).some(args => args[0] === "store"), false, "a disabled form stores nothing");
      for (const invalid of ["short", "line\nbreak-key", "é".repeat(2049)]) {
        d.$("jev-key").value = invalid;
        await d.submit("jev");
        assert.equal(d.$("jev-key").value, "", "cleared even when refused");
      }
      await flush();
      assert.equal(d.$("jev-error").textContent, "Key not stored. Paste the whole key on one line: 8 to 4096 bytes.");
      assert.equal(keyOps(d.helper).some(args => args[0] === "store"), false, "an invalid key never reaches the helper");
      assert.equal(d.$("jev-state").textContent, "No key stored", "Jev is unaffected by OpenAI's pref");
    } finally { d.close(); d.globals.restore(); }
  }
});

test("entry off with a stored key: Remove is enabled and works; Store stays off", async () => {
  // The helper must already hold the key when the dialog first checks presence.
  const helper = fakeHelper(); helper.items.add("openai");
  const globals = installGlobals({ env: { AXIOSOZO_BUILD_ROOT: "/Volumes/AxioSozoBuild/workstation" },
    prefValues: { "axiosozo.jev.keyEntry.enabled": true, "axiosozo.openai.keyEntry.enabled": false }, helper });
  const document = parseHtml(XHTML);
  Object.assign(document, { readyState: "complete", documentURI: SETTINGS_URI, nodePrincipal: { isSystemPrincipal: true } });
  const listeners = new Map();
  const browserWindow = { document: { nodePrincipal: { isSystemPrincipal: true } }, closed: false, privacy: false,
    addEventListener() {}, removeEventListener() {}, openDialog: () => win };
  const win = { document, closed: false, AbortController, opener: browserWindow, focus() {}, removeEventListener() {},
    addEventListener: (type, fn) => listeners.set(type, fn), close() { win.closed = true; listeners.get("unload")?.(); } };
  try {
    openProviderSettings(browserWindow);
    await flush();
    const $ = id => document.getElementById(id);
    assert.equal($("openai-state").textContent, "Key stored");
    assert.match($("openai-detail").textContent, /Adding or replacing a key is turned off \(axiosozo\.openai\.keyEntry\.enabled\); you can still remove it\./u);
    assert.deepEqual([$("openai-key").disabled, $("openai-store").disabled, $("openai-remove").disabled], [true, true, false]);
    $("openai-remove").click();
    await flush();
    assert.equal(helper.items.has("openai"), false);
    assert.equal($("openai-state").textContent, "Turned off");
    assert.deepEqual(helper.argv.map(([, ...args]) => args).filter(args => args[1] === "openai"), [["exists", "openai"], ["remove", "openai"], ["exists", "openai"]]);
  } finally { win.close(); globals.restore(); }
});

test("synthetic run without an admitted fixture: unavailable, and the production helper is never selected", async () => {
  for (const env of [{ AXIOSOZO_SYNTHETIC_TEST: "1", AXIOSOZO_BUILD_ROOT: "/Volumes/AxioSozoBuild/workstation" },
    { AXIOSOZO_SYNTHETIC_TEST: "1", AXIOSOZO_KEY_GUI_FIXTURE_ROOT: "/tmp/keys-0123" },
    { AXIOSOZO_SYNTHETIC_TEST: "1", AXIOSOZO_KEY_GUI_FIXTURE_ROOT: "/Volumes/AxioSozoBuild/workstation/gui-fixtures/keys-../../x" }]) {
    const d = await openDialog({ env });
    try {
      assert.deepEqual(["jev", "openai"].map(p => d.$(`${p}-state`).textContent), ["Unavailable in this build", "Unavailable in this build"], JSON.stringify(env));
      assert.match(d.$("jev-detail").textContent, /Keychain helper is not available in this build/u);
      assert.deepEqual([d.$("jev-key").disabled, d.$("jev-store").disabled, d.$("jev-remove").disabled], [true, true, true]);
      assert.deepEqual(d.helper.argv, [], "no helper, fixture or metadata process was started");
    } finally { d.close(); d.globals.restore(); }
  }
});

test("a second Store while one runs is ignored; closing the dialog cancels before the key is written and clears fields", async () => {
  const d = await openDialog();
  try {
    const release = d.helper.hold();
    d.$("jev-key").value = JEV_KEY;
    d.$("jev-store").focus();
    await d.submit("jev");
    await flush();
    assert.equal(d.$("jev-state").textContent, "Storing…");
    assert.equal(d.$("jev-store").getAttribute("aria-disabled"), "true");
    assert.equal(d.$("jev-store").disabled, false, "stays focusable while busy");
    assert.equal(d.document.activeElement, d.$("jev-store"));
    d.$("jev-key").value = "synthetic-second-key-1";
    await d.submit("jev");
    assert.equal(d.$("jev-key").value, "synthetic-second-key-1", "an ignored press does not read the field");
    d.$("openai-key").value = OPENAI_KEY;
    d.close();
    assert.deepEqual([d.$("jev-key").value, d.$("openai-key").value], ["", ""], "closing clears typed keys");
    release();
    await flush();
    assert.deepEqual(d.helper.stdin, [], "cancelled before stdin: nothing was written");
    assert.deepEqual(keyOps(d.helper).filter(args => args[0] === "store").length, 1, "the second press started nothing");
    assert.equal(d.helper.items.size, 0);
  } finally { d.globals.restore(); }
});

// Ways this dialog loses the authority to change a key, while it may still be shown.
const REVOCATIONS = {
  "opener closed": d => { d.browserWindow.closed = true; },
  "opener became private": d => { d.browserWindow.privacy = true; },
  "opener privacy unknown": d => { d.browserWindow.privacy = "throw"; },
  "dialog document replaced": d => { d.win.document = parseHtml(XHTML); },
  "dialog no longer open": d => { d.win.closed = true; },
  "parent window unloaded": d => d.closeParent(),
};

test("store: the key reaches the helper only while this dialog and its live normal opener still own the operation", async () => {
  for (const [label, revoke] of Object.entries(REVOCATIONS)) {
    for (const when of ["before admission completes", "while the helper starts"]) {
      const d = await openDialog();
      try {
        const release = when === "while the helper starts" ? d.helper.hold() : null;
        d.$("jev-key").value = JEV_KEY;
        await d.submit("jev");
        if (release) await flush();
        revoke(d);
        release?.();
        await flush();
        assert.deepEqual(d.helper.stdin, [], `${label} ${when}: no key was written`);
        assert.equal(d.helper.items.size, 0);
        assert.equal(keyOps(d.helper).filter(args => args[0] === "store").length, release ? 1 : 0,
          `${label} ${when}: ${release ? "the started child got nothing" : "no helper was started"}`);
        if (!d.win.closed) {
          assert.equal(d.$("jev-error").textContent, "Cancelled before it finished, so the change could not be confirmed.", label);
          // Pressing again on a dialog without authority does nothing and keeps nothing.
          d.$("jev-key").value = JEV_KEY;
          await d.submit("jev");
          await flush();
          assert.equal(d.$("jev-key").value, "");
          assert.deepEqual(d.helper.stdin, []);
        }
      } finally { d.close(); d.globals.restore(); }
    }
  }
});

test("remove: a dialog that lost its authority before the helper starts removes nothing; the other provider is unchanged", async () => {
  for (const [label, revoke] of Object.entries(REVOCATIONS)) {
    const d = await openDialog({ stored: ["jev", "openai"] });
    try {
      assert.equal(d.$("jev-remove").disabled, false, "presence was read with the key stored");
      d.$("jev-remove").click();
      revoke(d); // the factory admission is still on its way
      await flush();
      assert.equal(keyOps(d.helper).some(args => args[0] === "remove"), false, `${label}: no remove was started`);
      assert.deepEqual([...d.helper.items].sort(), ["jev", "openai"], label);
    } finally { d.close(); d.globals.restore(); }
  }
  // Control: with its authority intact the same click removes Jev only.
  const d = await openDialog({ stored: ["jev", "openai"] });
  try {
    d.$("jev-remove").click();
    await flush();
    assert.deepEqual([...d.helper.items], ["openai"]);
  } finally { d.close(); d.globals.restore(); }
});
