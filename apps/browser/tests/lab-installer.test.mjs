/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. https://mozilla.org/MPL/2.0/ */

// The AxioSozo Lab's per-window installer (installLab in chrome/lab/Lab.sys.mjs):
// switches that install and remove experiments live in every window, async
// installs, isolation of a failing experiment, private windows, dispose, the
// frozen ctx with its ai and agents views, and the one-time leftovers clean-up.
// Synthetic: a mini-dom window (support/lab-harness.mjs), in-memory prefs,
// "Hello Lab" (support/lab-hello.mjs) plus made-up experiment modules, a fake
// platform with a scripted agents service and AI backend, and a stand-in
// ChromeUtils.importESModule. No Gecko window, pref service, process or AI
// client is involved.
import "./support/chrome-modules.mjs";
import test from "node:test";
import assert from "node:assert/strict";
import { Node, makeEvent } from "./support/mini-dom.mjs";
import { fakeLabWindow, fakePrefs } from "./support/lab-harness.mjs";
import { HELLO_LAB, installHelloLab } from "./support/lab-hello.mjs";

const {
  installLab, buildRegistry, labPref, listForPage, clearProblemsForTesting, resetLeftoversForTesting, LabError, EXPERIMENTS, LAB_URL,
} = await import("../chrome/lab/Lab.sys.mjs");
const { LAB_STYLESHEET } = await import("../chrome/lab/kit.sys.mjs");

const SHEET = `href="${LAB_STYLESHEET}" type="text/css"`;
const INERT_DIAGNOSTICS = { installed: [], installs: 0, disposals: 0, failures: 0 };
const settle = () => new Promise(resolve => setImmediate(resolve));

// mini-dom has no processing instructions; Gecko's chrome documents do (kit.useStylesheet).
class ProcessingInstruction extends Node {
  constructor(document, target, data) { super(document); this.nodeType = 7; this.target = target; this.data = data; }
}
/** fakeLabWindow whose document can hold the Lab's stylesheet processing instruction. */
function labWindow(options) {
  const h = fakeLabWindow(options);
  h.document.createProcessingInstruction = (target, data) => new ProcessingInstruction(h.document, target, data);
  h.sheets = () => h.document.childNodes.filter(node => node instanceof ProcessingInstruction).map(node => `${node.target} ${node.data}`);
  return h;
}

/** A synthetic experiment descriptor (made-up id, module and installer). */
function experiment(id, overrides = {}) {
  const name = id.split("-").map(part => part[0].toUpperCase() + part.slice(1)).join("");
  return { id, title: `Synthetic ${id}`, pitch: "A synthetic experiment for the Lab tests.", howToTry: ["Turn it on."], group: "Your day",
    needs: ["none"], module: `${id}.sys.mjs`, installer: `install${name}`, ...overrides };
}
function registry(entries) {
  const built = buildRegistry(entries);
  assert.deepEqual([...built.problems], [], "the synthetic list is valid");
  return built.experiments;
}

/** The process platform: a scripted agents service and AI backend, and counted clean-ups. */
function fakePlatform() {
  const calls = { get: 0, cleanLeftovers: 0, statuses: [], startTask: [], subscribe: 0, unsubscribe: 0, watch: 0, unwatch: 0, runTurn: [] };
  const platform = {
    backend: { async runTurn(turn) { calls.runTurn.push(turn); return { text: "Hello from the synthetic backend." }; } },
    agents: {
      async startTask(request) { calls.startTask.push(request); return { id: "b_synthetic", state: "starting" }; },
      subscribe() { calls.subscribe++; return () => { calls.unsubscribe++; }; },
      watchExternal() { calls.watch++; return () => { calls.unwatch++; }; },
      list: () => [],
    },
    statuses: async options => { calls.statuses.push(options); return []; },
    cleanLeftovers: async () => { calls.cleanLeftovers++; },
  };
  return { platform, calls, get: () => { calls.get++; return platform; } };
}

/** A module whose installer logs its life and keeps its ctx. */
function probe(id, log, ctxs = []) {
  const name = experiment(id).installer;
  return { [name](window, ctx) {
    log.push(`install ${id}`);
    ctxs.push(ctx);
    ctx.signal.addEventListener("abort", () => log.push(`abort ${id}`));
    return { dispose() { log.push(`dispose ${id}`); } };
  } };
}

/**
 * One window with the Lab installed. `modules` maps an id to its module; an id
 * without one fails to load. Toasts are recorded.
 */
function setup({ entries = [HELLO_LAB], modules = {}, prefs = fakePrefs(), h = labWindow(), platform = fakePlatform(), ...options } = {}) {
  const experiments = registry(entries);
  const loads = [];
  const toasts = [];
  const all = { "hello-lab": { installHelloLab }, ...modules };
  const load = entry => {
    loads.push(entry.id);
    if (!Object.hasOwn(all, entry.id)) throw new LabError("LOAD_FAILED", `${entry.module} could not be loaded`);
    return all[entry.id];
  };
  const handle = installLab(h.window, { adapter: h.adapter, prefs, experiments, load, platform: platform.get,
    toast: (window, message) => { toasts.push([window, message]); return { close() {} }; }, ...options });
  return { handle, h, prefs, experiments, loads, toasts, platform };
}
const problemsOf = (prefs, experiments) => Object.fromEntries(listForPage({ prefs, experiments }).experiments.map(item => [item.id, item.problem]));

test.beforeEach(() => { clearProblemsForTesting(); resetLeftoversForTesting(); });

// ---------------------------------------------------------------- (a) off

test("nothing is loaded or installed while every switch is off; the window only listens to the Lab's prefs", t => {
  t.mock.method(console, "error", () => {});
  const { handle, h, prefs, loads, toasts } = setup({ entries: [HELLO_LAB, experiment("probe")] });
  assert.deepEqual(loads, []);
  assert.deepEqual(handle.diagnostics(), INERT_DIAGNOSTICS);
  assert.equal(handle.isInstalled("hello-lab"), false);
  assert.deepEqual(h.sheets(), [], "no Lab stylesheet while nothing runs");
  assert.equal(h.listenerCount(), 0);
  assert.deepEqual(prefs.observers.map(item => item.domain), ["axiosozo.lab."]);
  h.openTab();
  assert.deepEqual(toasts, []);
  // Other prefs under the Lab's branch, unknown ids and other topics change nothing.
  prefs.setBoolPref("axiosozo.lab.hello-lab.other", true);
  prefs.setBoolPref("axiosozo.lab.unknown.enabled", true);
  prefs.store.set(labPref("hello-lab"), true);
  prefs.observers[0].observer.observe(null, "something-else", labPref("hello-lab"));
  assert.deepEqual(loads, []);
  handle.dispose();
});

test("a switch that is already on when the window opens is installed at once", () => {
  const prefs = fakePrefs({ [labPref("hello-lab")]: true });
  const { handle, h, loads, toasts } = setup({ prefs });
  assert.deepEqual(loads, ["hello-lab"]);
  assert.equal(handle.isInstalled("hello-lab"), true);
  h.openTab();
  assert.deepEqual(toasts.map(([window, message]) => [window === h.window, message]),
    [[true, { title: "Hello from the Lab", description: "Tab 1 opened while Hello Lab is on." }]]);
  handle.dispose();
});

// ---------------------------------------------------------------- (b) live switches

test("turning a switch on installs the experiment in every open window; off removes it, aborts its signal and leaves no listener", () => {
  const prefs = fakePrefs();
  const ctxs = [];
  const modules = { "hello-lab": { installHelloLab: (window, ctx) => { ctxs.push(ctx); return installHelloLab(window, ctx); } } };
  const one = setup({ prefs, modules });
  const two = setup({ prefs, modules });
  const baseline = [one.h.listenerCount(), two.h.listenerCount()];
  assert.deepEqual(baseline, [0, 0]);

  prefs.setBoolPref(labPref("hello-lab"), true);
  for (const { handle, h } of [one, two]) {
    assert.equal(handle.isInstalled("hello-lab"), true);
    assert.deepEqual(handle.diagnostics(), { installed: ["hello-lab"], installs: 1, disposals: 0, failures: 0 });
    assert.equal(h.listenerCount(), 1, "Hello Lab's TabOpen listener");
    assert.deepEqual(h.sheets(), [`xml-stylesheet ${SHEET}`], "lab.css is held while an experiment runs");
  }
  assert.equal(ctxs.length, 2);
  assert.notEqual(ctxs[0].signal, ctxs[1].signal, "one signal per window");
  assert.equal(ctxs[0].window, one.h.window);
  assert.equal(ctxs[1].window, two.h.window);
  one.h.openTab();
  two.h.openTab();
  two.h.openTab();
  assert.deepEqual(one.toasts.map(([window, message]) => [window, message.description]), [[one.h.window, "Tab 1 opened while Hello Lab is on."]]);
  assert.deepEqual(two.toasts.map(([window, message]) => [window, message.description]),
    [[two.h.window, "Tab 1 opened while Hello Lab is on."], [two.h.window, "Tab 2 opened while Hello Lab is on."]]);

  prefs.setBoolPref(labPref("hello-lab"), false);
  for (const { handle, h, toasts } of [one, two]) {
    assert.equal(handle.isInstalled("hello-lab"), false);
    assert.deepEqual(handle.diagnostics(), { installed: [], installs: 1, disposals: 1, failures: 0 });
    assert.equal(h.listenerCount(), 0, "the listener went with ctx.signal");
    assert.deepEqual(h.sheets(), [], "lab.css is released");
    const before = toasts.length;
    h.openTab();
    assert.equal(toasts.length, before, "no toast once it is off");
  }
  assert.deepEqual(ctxs.map(ctx => ctx.signal.aborted), [true, true]);

  // On again: a fresh install with a fresh signal; the count starts again.
  prefs.setBoolPref(labPref("hello-lab"), true);
  assert.equal(ctxs.length, 4);
  assert.equal(ctxs[2].signal.aborted, false);
  one.h.openTab();
  assert.equal(one.toasts.at(-1)[1].description, "Tab 1 opened while Hello Lab is on.");
  one.handle.dispose();
  two.handle.dispose();
  assert.deepEqual([one.h.listenerCount(), two.h.listenerCount()], [0, 0]);
});

test("the Lab stylesheet is held once while any experiment runs and released after the last", () => {
  const log = [];
  const { handle, h, prefs } = setup({ entries: [experiment("first"), experiment("second")],
    modules: { first: probe("first", log), second: probe("second", log) } });
  prefs.setBoolPref(labPref("first"), true);
  prefs.setBoolPref(labPref("second"), true);
  assert.deepEqual(h.sheets(), [`xml-stylesheet ${SHEET}`]);
  prefs.setBoolPref(labPref("first"), false);
  assert.deepEqual(h.sheets(), [`xml-stylesheet ${SHEET}`], "still held by the second");
  prefs.setBoolPref(labPref("second"), false);
  assert.deepEqual(h.sheets(), []);
  assert.deepEqual(log, ["install first", "install second", "dispose first", "abort first", "dispose second", "abort second"],
    "dispose runs before the signal aborts");
  handle.dispose();
});

test("an installer may return a function or nothing as its handle", () => {
  const log = [];
  const { handle, prefs } = setup({ entries: [experiment("fn"), experiment("nothing"), experiment("odd")], modules: {
    fn: { installFn: () => () => log.push("fn cleaned up") },
    nothing: { installNothing: () => undefined },
    odd: { installOdd: () => ({ dispose: "not a function" }) },
  } });
  for (const id of ["fn", "nothing", "odd"]) prefs.setBoolPref(labPref(id), true);
  assert.deepEqual(handle.diagnostics().installed, ["fn", "nothing", "odd"]);
  for (const id of ["fn", "nothing", "odd"]) prefs.setBoolPref(labPref(id), false);
  assert.deepEqual(log, ["fn cleaned up"]);
  assert.deepEqual(handle.diagnostics(), { installed: [], installs: 3, disposals: 3, failures: 0 });
  assert.deepEqual(Object.values(problemsOf(prefs, registry([experiment("fn"), experiment("nothing"), experiment("odd")]))), [null, null, null]);
  handle.dispose();
});

// ---------------------------------------------------------------- (c) async installs

function deferred() {
  let resolve, reject;
  const promise = new Promise((yes, no) => { resolve = yes; reject = no; });
  return { promise, resolve, reject };
}

test("an async install counts once it resolves; one turned off before then is cleaned up when it arrives", async () => {
  const log = [];
  const installs = [];
  const ctxs = [];
  const { handle, h, prefs } = setup({ entries: [experiment("slow")], modules: { slow: { installSlow: (window, ctx) => {
    ctxs.push(ctx);
    const step = deferred();
    installs.push(step);
    return step.promise;
  } } } });
  prefs.setBoolPref(labPref("slow"), true);
  assert.equal(handle.isInstalled("slow"), false, "not installed until it resolves");
  assert.deepEqual(handle.diagnostics(), { installed: ["slow"], installs: 0, disposals: 0, failures: 0 });
  assert.deepEqual(h.sheets(), [`xml-stylesheet ${SHEET}`], "held while installing");

  prefs.setBoolPref(labPref("slow"), false);
  assert.equal(ctxs[0].signal.aborted, true);
  assert.deepEqual(h.sheets(), []);
  installs[0].resolve({ dispose: () => log.push("late handle disposed") });
  await settle();
  assert.deepEqual(log, ["late handle disposed"]);
  assert.equal(handle.isInstalled("slow"), false);
  assert.deepEqual(handle.diagnostics(), INERT_DIAGNOSTICS, "a late handle is neither an install nor a disposal");

  // On, off and on again while the first is still on its way: only the second stays.
  prefs.setBoolPref(labPref("slow"), true);
  prefs.setBoolPref(labPref("slow"), false);
  prefs.setBoolPref(labPref("slow"), true);
  assert.equal(installs.length, 3);
  installs[1].resolve(() => log.push("second late handle disposed"));
  installs[2].resolve({ dispose: () => log.push("third disposed") });
  await settle();
  assert.deepEqual(log.slice(1), ["second late handle disposed"]);
  assert.equal(handle.isInstalled("slow"), true);
  assert.deepEqual(handle.diagnostics(), { installed: ["slow"], installs: 1, disposals: 0, failures: 0 });
  prefs.setBoolPref(labPref("slow"), false);
  assert.deepEqual(log.slice(2), ["third disposed"]);
  handle.dispose();
});

test("a window that closes during an async install cleans the late handle up", async () => {
  const log = [];
  const step = deferred();
  const { handle, prefs } = setup({ prefs: fakePrefs({ [labPref("slow")]: true }), entries: [experiment("slow")],
    modules: { slow: { installSlow: () => step.promise } } });
  handle.dispose();
  step.resolve({ dispose: () => log.push("late handle disposed") });
  await settle();
  assert.deepEqual(log, ["late handle disposed"]);
  assert.equal(prefs.observers.length, 0);
});

test("an async install that fails while on is a problem; one that fails after it was turned off is not", async t => {
  t.mock.method(console, "error", () => {});
  const steps = [];
  const ctxs = [];
  const entries = [experiment("slow")];
  const { handle, h, prefs, experiments } = setup({ entries, modules: { slow: { installSlow: (window, ctx) => {
    ctxs.push(ctx);
    const step = deferred();
    steps.push(step);
    return step.promise;
  } } } });
  prefs.setBoolPref(labPref("slow"), true);
  steps[0].reject(new Error("synthetic async failure"));
  await settle();
  assert.equal(handle.isInstalled("slow"), false);
  assert.equal(ctxs[0].signal.aborted, true);
  assert.deepEqual(h.sheets(), []);
  assert.deepEqual(handle.diagnostics(), { installed: [], installs: 0, disposals: 0, failures: 1 });
  assert.equal(problemsOf(prefs, experiments).slow, "INSTALL_FAILED");

  clearProblemsForTesting();
  prefs.setBoolPref(labPref("slow"), false);
  prefs.setBoolPref(labPref("slow"), true);
  prefs.setBoolPref(labPref("slow"), false);
  steps[1].reject(new Error("synthetic failure nobody waits for"));
  await settle();
  assert.equal(problemsOf(prefs, experiments).slow, null);
  assert.equal(handle.diagnostics().failures, 1);
  handle.dispose();
});

test("a later successful install clears the problem an earlier one left", async t => {
  t.mock.method(console, "error", () => {});
  let fail = true;
  const { handle, prefs, experiments } = setup({ entries: [experiment("flaky")], modules: { flaky: { installFlaky: () => {
    if (fail) throw new Error("synthetic");
    return Promise.resolve({ dispose() {} });
  } } } });
  prefs.setBoolPref(labPref("flaky"), true);
  assert.equal(problemsOf(prefs, experiments).flaky, "INSTALL_FAILED");
  fail = false;
  prefs.setBoolPref(labPref("flaky"), false);
  prefs.setBoolPref(labPref("flaky"), true);
  await settle();
  assert.equal(handle.isInstalled("flaky"), true);
  assert.equal(problemsOf(prefs, experiments).flaky, null);
  handle.dispose();
});

// ---------------------------------------------------------------- (d) isolation

test("one failing experiment is isolated with its own problem code; the others in the window keep working", async t => {
  const errors = t.mock.method(console, "error", () => {});
  const log = [];
  const entries = [experiment("load-fails"), experiment("no-export"), experiment("throws"), experiment("rejects"), HELLO_LAB,
    experiment("bad-dispose"), experiment("good")];
  const prefs = fakePrefs(Object.fromEntries(entries.map(item => [labPref(item.id), true])));
  const { handle, h, toasts, experiments } = setup({ entries, prefs, modules: {
    "no-export": { installSomethingElse() { log.push("never called"); } },
    throws: { installThrows(window, ctx) {
      window.addEventListener("keydown", () => log.push("leaked keydown"), { signal: ctx.signal });
      throw new Error("synthetic install failure");
    } },
    rejects: { installRejects: () => Promise.reject(new Error("synthetic async failure")) },
    "bad-dispose": { installBadDispose: () => ({ dispose() { throw new Error("synthetic clean-up failure"); } }) },
    good: probe("good", log),
  } });
  await settle();
  {
    assert.deepEqual(problemsOf(prefs, experiments), {
      "load-fails": "LOAD_FAILED", "no-export": "INSTALLER_MISSING", throws: "INSTALL_FAILED", rejects: "INSTALL_FAILED",
      "hello-lab": null, "bad-dispose": null, good: null,
    });
    assert.deepEqual(handle.diagnostics(), { installed: ["hello-lab", "bad-dispose", "good"], installs: 3, disposals: 0, failures: 4 });
    assert.ok(errors.mock.callCount() >= 4, "every failure is logged");
    // The failed installer's own listener went with its signal.
    h.dispatch("keydown");
    assert.deepEqual(log, ["install good"]);
    h.openTab();
    assert.equal(toasts.length, 1, "Hello Lab still says hello");

    prefs.setBoolPref(labPref("bad-dispose"), false);
    assert.equal(problemsOf(prefs, experiments)["bad-dispose"], "DISPOSE_FAILED", "a failed clean-up is visible");
    assert.equal(handle.isInstalled("bad-dispose"), false, "and it is gone from the window anyway");
    h.openTab();
    assert.equal(toasts.length, 2, "Hello Lab still works after a neighbour failed to clean up");
    assert.equal(handle.isInstalled("good"), true);
    handle.dispose();
    assert.deepEqual(log, ["install good", "dispose good", "abort good"]);
  }
});

test("the real loader imports chrome/lab/<module>; a module that cannot load is LOAD_FAILED", t => {
  t.mock.method(console, "error", () => {});
  const urls = [];
  const previous = globalThis.ChromeUtils;
  globalThis.ChromeUtils = { importESModule(url) {
    urls.push(url);
    if (url.endsWith("/hello-lab.sys.mjs")) return { installHelloLab };
    throw new Error("NS_ERROR_FILE_NOT_FOUND");
  } };
  try {
    const entries = [HELLO_LAB, experiment("missing-file", { module: "missing-file/missing-file.sys.mjs" })];
    const experiments = registry(entries);
    const prefs = fakePrefs({ [labPref("hello-lab")]: true, [labPref("missing-file")]: true });
    const h = labWindow();
    const handle = installLab(h.window, { adapter: h.adapter, prefs, experiments, platform: fakePlatform().get });
    assert.deepEqual(urls, [`${LAB_URL}hello-lab.sys.mjs`, `${LAB_URL}missing-file/missing-file.sys.mjs`]);
    assert.equal(LAB_URL, "chrome://browser/content/axiosozo/lab/");
    assert.equal(handle.isInstalled("hello-lab"), true);
    assert.deepEqual(problemsOf(prefs, experiments), { "hello-lab": null, "missing-file": "LOAD_FAILED" });
    handle.dispose();
  } finally {
    if (previous === undefined) delete globalThis.ChromeUtils;
    else globalThis.ChromeUtils = previous;
  }
});

test("anything a load() option throws is LOAD_FAILED; a LabError keeps its own problem code; no module is INSTALLER_MISSING", t => {
  t.mock.method(console, "error", () => {});
  const ids = ["plain", "type-error", "string", "nothing", "missing-export"];
  const experiments = registry(ids.map(id => experiment(id)));
  const prefs = fakePrefs(Object.fromEntries(ids.map(id => [labPref(id), true])));
  const h = labWindow();
  const load = entry => {
    switch (entry.id) {
      case "plain": throw new Error("synthetic import failure");
      case "type-error": throw new TypeError("synthetic: not a module");
      case "string": throw "synthetic thrown string";
      case "nothing": return null;
      default: throw new LabError("INSTALLER_MISSING", "synthetic");
    }
  };
  const handle = installLab(h.window, { adapter: h.adapter, prefs, experiments, platform: fakePlatform().get, load });
  try {
    assert.deepEqual(problemsOf(prefs, experiments), { plain: "LOAD_FAILED", "type-error": "LOAD_FAILED", string: "LOAD_FAILED",
      nothing: "INSTALLER_MISSING", "missing-export": "INSTALLER_MISSING" });
    assert.deepEqual(handle.diagnostics(), { installed: [], installs: 0, disposals: 0, failures: 5 });
    assert.deepEqual(h.sheets(), []);
  } finally { handle.dispose(); }
});

test("a failure in one window stays visible when the same experiment installs fine in another, in either order", t => {
  t.mock.method(console, "error", () => {});
  const experiments = registry([experiment("picky")]);
  const picky = { installPicky: window => { if (window.picky) throw new Error("synthetic: fails in this window only"); return { dispose() {} }; } };
  for (const order of [["fails", "works"], ["works", "fails"]]) {
    clearProblemsForTesting();
    const prefs = fakePrefs();
    const windows = order.map(kind => { const h = labWindow(); h.window.picky = kind === "fails"; return h; });
    const handles = windows.map(h => installLab(h.window, { adapter: h.adapter, prefs, experiments, load: () => picky, platform: fakePlatform().get }));
    try {
      prefs.setBoolPref(labPref("picky"), true);
      assert.deepEqual(handles.map(handle => handle.isInstalled("picky")), order.map(kind => kind === "works"), order.join(" then "));
      assert.equal(problemsOf(prefs, experiments).picky, "INSTALL_FAILED", order.join(" then "));
      // The window where it worked closing changes nothing; the one where it failed takes its failure along.
      handles[order.indexOf("works")].dispose();
      assert.equal(problemsOf(prefs, experiments).picky, "INSTALL_FAILED", order.join(" then "));
      handles[order.indexOf("fails")].dispose();
      assert.equal(problemsOf(prefs, experiments).picky, null, order.join(" then "));
    } finally { for (const handle of handles) handle.dispose(); }
  }
});

test("the page shows the most recent failure across the open windows", t => {
  t.mock.method(console, "error", () => {});
  const experiments = registry([experiment("picky")]);
  const prefs = fakePrefs();
  const picky = { installPicky: window => {
    if (window.failInstall) throw new Error("synthetic install failure");
    return { dispose() { if (window.failDispose) throw new Error("synthetic clean-up failure"); } };
  } };
  const a = labWindow();
  a.window.failInstall = true;
  const b = labWindow();
  b.window.failDispose = true;
  const [first, second] = [a, b].map(h => installLab(h.window, { adapter: h.adapter, prefs, experiments, load: () => picky,
    platform: fakePlatform().get }));
  try {
    prefs.setBoolPref(labPref("picky"), true);
    assert.equal(problemsOf(prefs, experiments).picky, "INSTALL_FAILED", "window a could not start it");
    // Turned off outside the Lab page: window b's clean-up throws, later than a's failure.
    prefs.setBoolPref(labPref("picky"), false);
    assert.equal(problemsOf(prefs, experiments).picky, "DISPOSE_FAILED");
    second.dispose();
    assert.equal(problemsOf(prefs, experiments).picky, "INSTALL_FAILED", "window a's failure is still there");
    first.dispose();
    assert.equal(problemsOf(prefs, experiments).picky, null);
  } finally { first.dispose(); second.dispose(); }
});

test("a window that closes takes its own failures along, also a clean-up that throws as it closes", t => {
  t.mock.method(console, "error", () => {});
  const experiments = registry([experiment("messy")]);
  const prefs = fakePrefs({ [labPref("messy")]: true });
  const h = labWindow();
  const handle = installLab(h.window, { adapter: h.adapter, prefs, experiments, platform: fakePlatform().get,
    load: () => ({ installMessy: () => ({ dispose() { throw new Error("synthetic clean-up failure"); } }) }) });
  assert.equal(handle.isInstalled("messy"), true);
  handle.dispose();
  assert.equal(problemsOf(prefs, experiments).messy, null);
  assert.deepEqual(handle.diagnostics(), { installed: [], installs: 1, disposals: 1, failures: 0 });
});

// ---------------------------------------------------------------- (e) private and unknown windows

test("a private window, an unknown one, or one without prefs gets an inert Lab: nothing loads, nothing listens", t => {
  t.mock.method(console, "error", () => {});
  const fake = fakePlatform();
  const prefs = fakePrefs({ [labPref("hello-lab")]: true });
  const experiments = registry([HELLO_LAB]);
  const loads = [];
  const load = () => { loads.push("loaded"); return { installHelloLab }; };
  const h = labWindow();
  const cases = {
    "private window": { window: labWindow({ privateWindow: true }).window, adapter: { isPrivateWindow: () => true } },
    "privacy unknown": { window: h.window, adapter: { isPrivateWindow: () => undefined } },
    "privacy throws": { window: h.window, adapter: { isPrivateWindow() { throw new Error("gone"); } } },
    "no adapter": { window: h.window, adapter: null },
    "adapter without the check": { window: h.window, adapter: {} },
    "no document": { window: {}, adapter: h.adapter },
    "no window": { window: null, adapter: h.adapter },
    "no prefs": { window: h.window, adapter: h.adapter, prefs: null },
    "prefs that cannot be read": { window: h.window, adapter: h.adapter, prefs: { setBoolPref() {} } },
  };
  for (const [label, { window, adapter, prefs: own = prefs }] of Object.entries(cases)) {
    const handle = installLab(window, { adapter, prefs: own, experiments, load, platform: fake.get });
    assert.ok(Object.isFrozen(handle), label);
    assert.deepEqual(handle.diagnostics(), INERT_DIAGNOSTICS, label);
    assert.equal(handle.isInstalled("hello-lab"), false, label);
    handle.dispose();
    handle.dispose();
  }
  // Without options there are no prefs under Node (no Services): inert too.
  assert.deepEqual(installLab(h.window).diagnostics(), INERT_DIAGNOSTICS);
  assert.deepEqual(loads, []);
  assert.equal(prefs.observers.length, 0, "no switch is watched");
  assert.equal(fake.calls.get, 0, "the platform is not even asked for");
  assert.equal(h.listenerCount(), 0);
  prefs.setBoolPref(labPref("hello-lab"), false);
  prefs.setBoolPref(labPref("hello-lab"), true);
  assert.deepEqual(loads, []);
});

// ---------------------------------------------------------------- (f) dispose and diagnostics

test("dispose() stops watching the switches and removes every experiment in reverse order", () => {
  const log = [];
  const ctxs = [];
  const entries = ["a", "b", "c"].map(id => experiment(id));
  const prefs = fakePrefs();
  const { handle, h, loads } = setup({ entries, prefs, modules: { a: probe("a", log, ctxs), b: probe("b", log, ctxs), c: probe("c", log, ctxs) } });
  prefs.setBoolPref(labPref("b"), true);
  prefs.setBoolPref(labPref("a"), true);
  prefs.setBoolPref(labPref("c"), true);
  assert.deepEqual(handle.diagnostics(), { installed: ["b", "a", "c"], installs: 3, disposals: 0, failures: 0 });
  assert.deepEqual(Object.keys(handle.diagnostics()), ["installed", "installs", "disposals", "failures"], "counts only");
  log.length = 0;
  handle.dispose();
  assert.deepEqual(log, ["dispose c", "abort c", "dispose a", "abort a", "dispose b", "abort b"], "the last installed goes first");
  assert.deepEqual(ctxs.map(ctx => ctx.signal.aborted), [true, true, true]);
  assert.equal(prefs.observers.length, 0);
  assert.deepEqual(h.sheets(), []);
  assert.deepEqual(handle.diagnostics(), { installed: [], installs: 3, disposals: 3, failures: 0 });
  for (const id of ["a", "b", "c"]) assert.equal(handle.isInstalled(id), false);
  // A switch flipped after the window closed reaches nothing; a second dispose is a no-op.
  prefs.setBoolPref(labPref("a"), false);
  prefs.setBoolPref(labPref("a"), true);
  handle.dispose();
  assert.equal(loads.length, 3);
  assert.equal(log.length, 6);
});

test("diagnostics() counts installs, disposals and failures of this window only", t => {
  t.mock.method(console, "error", () => {});
  const log = [];
  const entries = [experiment("ok"), experiment("broken")];
  const prefs = fakePrefs();
  const one = setup({ entries, prefs, modules: { ok: probe("ok", log), broken: { installBroken() { throw new Error("synthetic"); } } } });
  prefs.setBoolPref(labPref("ok"), true);
  prefs.setBoolPref(labPref("broken"), true);
  const two = setup({ entries, prefs, modules: { ok: probe("ok", log), broken: { installBroken() { throw new Error("synthetic"); } } } });
  prefs.setBoolPref(labPref("ok"), false);
  assert.deepEqual(one.handle.diagnostics(), { installed: [], installs: 1, disposals: 1, failures: 1 });
  assert.deepEqual(two.handle.diagnostics(), { installed: [], installs: 1, disposals: 1, failures: 1 });
  one.handle.dispose();
  two.handle.dispose();
});

// ---------------------------------------------------------------- (g) graduated

test("a graduated feature is listed but never loaded or installed, whatever its prefs say", () => {
  const graduated = EXPERIMENTS.find(item => item.graduated);
  assert.ok(graduated, "the real list has a graduated feature");
  const prefs = fakePrefs({ [graduated.graduated.pref]: true, [labPref(graduated.id)]: true });
  const { handle, loads, experiments } = setup({ entries: [sourceOf(graduated), HELLO_LAB], prefs });
  prefs.setBoolPref(graduated.graduated.pref, false);
  prefs.setBoolPref(graduated.graduated.pref, true);
  prefs.setBoolPref(labPref(graduated.id), false);
  prefs.setBoolPref(labPref(graduated.id), true);
  assert.deepEqual(loads, []);
  assert.deepEqual(handle.diagnostics(), INERT_DIAGNOSTICS);
  assert.equal(handle.isInstalled(graduated.id), false);
  assert.equal(listForPage({ prefs, experiments }).experiments[0].enabled, true, "still listed with its switch");
  prefs.setBoolPref(labPref("hello-lab"), true);
  assert.deepEqual(loads, ["hello-lab"]);
  handle.dispose();
});

/** A registry descriptor back as a list entry (null fields left out). */
function sourceOf(descriptor) {
  const { variantOf, family: _family, module, installer, graduated, ...rest } = descriptor;
  return { ...rest, howToTry: [...rest.howToTry], needs: [...rest.needs], ...(variantOf ? { variantOf } : {}),
    ...(graduated ? { graduated: { ...graduated } } : { module, installer }) };
}

// ---------------------------------------------------------------- (h) the ctx

test("each installer gets a frozen ctx with the window's services, ai and agents, and its own signal", () => {
  const ctxs = [];
  const services = { name: "synthetic services" };
  const openOverview = () => {};
  const engineOf = () => "chromium";
  const ai = { runTurn: async () => ({ text: "" }) };
  const prefs = fakePrefs({ [labPref("first")]: true, [labPref("second")]: true });
  const { handle, h } = setup({ entries: [experiment("first"), experiment("second")], prefs, services, openOverview, engineOf, ai,
    modules: { first: probe("first", [], ctxs), second: probe("second", [], ctxs) } });
  const [first, second] = ctxs;
  assert.ok(Object.isFrozen(first));
  assert.deepEqual(Object.keys(first), ["id", "window", "document", "services", "adapter", "engineOf", "openOverview", "toast", "ai", "agents", "signal"]);
  assert.throws(() => { first.id = "other"; }, TypeError);
  assert.throws(() => { first.extra = true; }, TypeError);
  assert.deepEqual([first.id, second.id], ["first", "second"]);
  assert.equal(first.window, h.window);
  assert.equal(first.document, h.document);
  assert.equal(first.services, services);
  assert.equal(first.adapter, h.adapter);
  assert.equal(first.engineOf, engineOf);
  assert.equal(first.openOverview, openOverview);
  assert.equal(first.ai, ai, "the ai passed in");
  assert.equal(second.ai, ai);
  assert.equal(typeof first.agents, "object");
  assert.ok(Object.isFrozen(first.agents));
  assert.notEqual(first.agents, second.agents, "agents are tied to each experiment's own signal");
  assert.notEqual(first.signal, second.signal);
  assert.ok(first.signal instanceof AbortSignal);
  handle.dispose();
});

test("ctx.toast shows through the window's toast and never throws", t => {
  const errors = t.mock.method(console, "error", () => {});
  const ctxs = [];
  const prefs = fakePrefs({ [labPref("a")]: true });
  const shown = [];
  const close = () => {};
  const one = setup({ entries: [experiment("a")], prefs, modules: { a: probe("a", [], ctxs) },
    toast: (window, message) => { shown.push([window, message]); return { close }; } });
  assert.equal(ctxs[0].toast({ title: "Hi" }).close, close);
  assert.deepEqual(shown, [[one.h.window, { title: "Hi" }]]);
  const two = setup({ entries: [experiment("a")], prefs, modules: { a: probe("a", [], ctxs) }, toast: null });
  assert.equal(typeof ctxs[1].toast({ title: "Hi" }).close, "function", "an inert toast without a toast service");
  const three = setup({ entries: [experiment("a")], prefs, modules: { a: probe("a", [], ctxs) }, toast: () => { throw new Error("synthetic"); } });
  assert.equal(typeof ctxs[2].toast({ title: "Hi" }).close, "function");
  assert.equal(errors.mock.callCount(), 1);
  for (const item of [one, two, three]) item.handle.dispose();
});

test("ctx.engineOf defaults to gecko", () => {
  const ctxs = [];
  const { handle } = setup({ entries: [experiment("a")], prefs: fakePrefs({ [labPref("a")]: true }), modules: { a: probe("a", [], ctxs) },
    engineOf: undefined });
  assert.equal(ctxs[0].engineOf({}), "gecko");
  handle.dispose();
});

test("ctx.ai defaults to the Lab's facade over the platform's backend, shared by the window and refused once it is private", async () => {
  const ctxs = [];
  const fake = fakePlatform();
  const adapter = { private: false, isPrivateWindow() { return this.private; } };
  const prefs = fakePrefs({ [labPref("a")]: true, [labPref("b")]: true });
  const { handle } = setup({ entries: [experiment("a"), experiment("b")], prefs, platform: fake, adapter,
    modules: { a: probe("a", [], ctxs), b: probe("b", [], ctxs) } });
  assert.equal(ctxs[0].ai, ctxs[1].ai, "one facade per window");
  assert.equal(typeof ctxs[0].ai.runTurn, "function");
  const answer = await ctxs[0].ai.runTurn({ prompt: "Say hello." });
  assert.equal(answer.text, "Hello from the synthetic backend.");
  assert.equal(fake.calls.runTurn.length, 1);
  assert.equal(fake.calls.runTurn[0].prompt, "Say hello.");
  adapter.private = true;
  await assert.rejects(ctxs[0].ai.runTurn({ prompt: "Say hello." }), { code: "PRIVATE_WINDOW" });
  assert.equal(fake.calls.runTurn.length, 1, "the backend was not asked");
  handle.dispose();
});

const TASK = Object.freeze({ client: "claude-code", projectRoot: "/synthetic/project", task: "Make the button blue." });

test("ctx.agents.startTask needs the user's own trusted action and refuses private windows and sensitive pages before the service", async () => {
  const ctxs = [];
  const fake = fakePlatform();
  const adapter = { private: false, isPrivateWindow() { return this.private; } };
  const sensitive = [];
  const sensitiveHost = host => { sensitive.push(host); if (host === "broken.example") throw new Error("synthetic"); return host === "bank.example"; };
  const { handle, prefs } = setup({ entries: [experiment("agent")], prefs: fakePrefs({ [labPref("agent")]: true }), platform: fake, adapter,
    sensitiveHost, modules: { agent: probe("agent", [], ctxs) } });
  const { agents } = ctxs[0];
  const click = makeEvent("click");
  await assert.rejects(agents.startTask({ ...TASK }), { code: "NOT_USER_ACTION" });
  await assert.rejects(agents.startTask({ ...TASK, trigger: { isTrusted: false } }), { code: "NOT_USER_ACTION" });
  await assert.rejects(agents.startTask({ ...TASK, trigger: { ...click, isTrusted: "true" } }), { code: "NOT_USER_ACTION" });
  await assert.rejects(agents.startTask({ ...TASK, trigger: click, pageUrl: "https://bank.example/login?next=1" }), { code: "SENSITIVE_PAGE" });
  await assert.rejects(agents.startTask({ ...TASK, trigger: click, pageUrl: "https://broken.example/" }), { code: "SENSITIVE_PAGE" },
    "a sensitivity check that fails counts as sensitive");
  await assert.rejects(agents.continueInTerminal("b_1"), { code: "NOT_USER_ACTION" });
  await assert.rejects(agents.openIn("vscode", {}), { code: "NOT_USER_ACTION" });
  assert.deepEqual(sensitive, ["bank.example", "broken.example"]);
  assert.deepEqual(fake.calls.startTask, [], "the agents service was never asked");

  // The user's own click on an ordinary page: the service gets the request without the event.
  const session = await agents.startTask({ ...TASK, trigger: click, pageUrl: "https://example.com/app" });
  assert.deepEqual(session, { id: "b_synthetic", state: "starting" });
  assert.deepEqual(fake.calls.startTask, [{ ...TASK, pageUrl: "https://example.com/app", signal: null }]);

  adapter.private = true;
  await assert.rejects(agents.startTask({ ...TASK, trigger: click }), { code: "PRIVATE_WINDOW" });
  assert.throws(() => agents.subscribe(() => {}), { code: "PRIVATE_WINDOW" });
  adapter.private = false;

  prefs.setBoolPref(labPref("agent"), false);
  await assert.rejects(agents.startTask({ ...TASK, trigger: click }), { code: "CLOSED" }, "nothing starts once the experiment is off");
  assert.equal(fake.calls.startTask.length, 1);
  handle.dispose();
});

test("ctx.agents subscriptions and external watches end when the experiment is turned off or the window closes", () => {
  const ctxs = [];
  const fake = fakePlatform();
  const { handle, prefs } = setup({ entries: [experiment("watcher")], prefs: fakePrefs({ [labPref("watcher")]: true }), platform: fake,
    modules: { watcher: probe("watcher", [], ctxs) } });
  ctxs[0].agents.subscribe(() => {});
  ctxs[0].agents.watchExternal();
  assert.deepEqual([fake.calls.subscribe, fake.calls.unsubscribe, fake.calls.watch, fake.calls.unwatch], [1, 0, 1, 0]);
  prefs.setBoolPref(labPref("watcher"), false);
  assert.deepEqual([fake.calls.unsubscribe, fake.calls.unwatch], [1, 1]);
  assert.throws(() => ctxs[0].agents.subscribe(() => {}), { code: "CLOSED" });

  prefs.setBoolPref(labPref("watcher"), true);
  ctxs[1].agents.subscribe(() => {});
  handle.dispose();
  assert.deepEqual([fake.calls.subscribe, fake.calls.unsubscribe], [2, 2]);
});

test("ctx.agents.clientStatus reads the platform's client status", async () => {
  const ctxs = [];
  const fake = fakePlatform();
  const { handle } = setup({ entries: [experiment("a")], prefs: fakePrefs({ [labPref("a")]: true }), platform: fake,
    modules: { a: probe("a", [], ctxs) } });
  assert.deepEqual(await ctxs[0].agents.clientStatus({ check: false }), []);
  assert.deepEqual(fake.calls.statuses, [{ check: false }]);
  handle.dispose();
});

// ---------------------------------------------------------------- (i) leftovers

test("the first Lab window of the process clears leftovers once; private windows do not count", async t => {
  const errors = t.mock.method(console, "error", () => {});
  const fake = fakePlatform();
  const make = (options = {}) => setup({ platform: fake, ...options });
  const inert = installLab(labWindow({ privateWindow: true }).window, { adapter: { isPrivateWindow: () => true }, prefs: fakePrefs(),
    platform: fake.get });
  assert.equal(fake.calls.cleanLeftovers, 0);
  const windows = [make(), make(), make()];
  assert.equal(fake.calls.cleanLeftovers, 1);
  resetLeftoversForTesting();
  windows.push(make());
  assert.equal(fake.calls.cleanLeftovers, 2);
  for (const item of windows) item.handle.dispose();
  inert.dispose();

  // A clean-up that fails (async or at once) is logged, and the window still gets its Lab.
  resetLeftoversForTesting();
  const rejecting = fakePlatform();
  rejecting.platform.cleanLeftovers = () => Promise.reject(new Error("synthetic"));
  const one = make({ platform: rejecting, prefs: fakePrefs({ [labPref("hello-lab")]: true }) });
  resetLeftoversForTesting();
  const throwing = fakePlatform();
  throwing.platform.cleanLeftovers = () => { throw new Error("synthetic"); };
  const two = make({ platform: throwing, prefs: fakePrefs({ [labPref("hello-lab")]: true }) });
  resetLeftoversForTesting();
  const three = make({ platform: { get() { throw new Error("synthetic: no platform"); } }, prefs: fakePrefs({ [labPref("hello-lab")]: true }) });
  await settle();
  for (const item of [one, two, three]) {
    assert.equal(item.handle.isInstalled("hello-lab"), true);
    item.handle.dispose();
  }
  assert.equal(errors.mock.callCount(), 3);
  assert.ok(errors.mock.calls.every(call => call.arguments[0] === "AxioSozo Lab: leftovers not cleared"));
});
