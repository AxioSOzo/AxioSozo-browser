/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. https://mozilla.org/MPL/2.0/ */
import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import "./support/chrome-modules.mjs";
import { fakeZenWindow } from "./support/fake-zen.mjs";
import { createClock, flushMicrotasks } from "./dev-loop-harness.test.mjs";

const {
  installSpaceSwitcher, dotWindow, dotSize, PREF, LIBRARY_STATE_PREF, ROOT_ATTRIBUTE, SWITCHER_ID,
  STYLESHEET, WHEEL_THRESHOLD, WHEEL_IDLE_MS, MAX_DOTS,
} = await import("../chrome/SpaceSwitcher.sys.mjs");
const { ZEN_SIDEBAR } = await import("../chrome/ZenWorkspaceAdapter.sys.mjs");

// Synthetic chrome DOM and Zen window (support/fake-zen.mjs). These tests cover
// the switcher's model and wiring only; they are not evidence of a running Zen.
const uuid = n => `${String(n).padStart(8, "0")}-0000-4000-8000-000000000000`;
const spacesOf = (count, extra = {}) => Array.from({ length: count }, (_, i) =>
  ({ uuid: uuid(i + 1), name: `Space ${i + 1}`, icon: "", ...(extra[i] ?? {}) }));

class FakeNode {
  constructor(doc, localName) {
    this.ownerDocument = doc; this.localName = localName; this.attrs = new Map();
    this.children = []; this.parentNode = null; this.listeners = new Map(); this._text = "";
  }
  get id() { return this.attrs.get("id") ?? ""; }
  set id(value) { this.attrs.set("id", value); }
  get className() { return this.attrs.get("class") ?? ""; }
  set className(value) { this.attrs.set("class", value); }
  get firstChild() { return this.children[0] ?? null; }
  get textContent() { return this._text + this.children.map(child => child.textContent).join(""); }
  set textContent(value) { for (const child of [...this.children]) child.remove(); this._text = String(value); }
  setAttribute(name, value) { this.attrs.set(name, String(value)); }
  getAttribute(name) { return this.attrs.has(name) ? this.attrs.get(name) : null; }
  hasAttribute(name) { return this.attrs.has(name); }
  removeAttribute(name) { this.attrs.delete(name); }
  #detach() { if (this.parentNode) this.parentNode.children.splice(this.parentNode.children.indexOf(this), 1); this.parentNode = null; }
  insertBefore(node, ref) {
    node.#detach();
    const index = ref ? this.children.indexOf(ref) : -1;
    if (index < 0) this.children.push(node); else this.children.splice(index, 0, node);
    node.parentNode = this; return node;
  }
  appendChild(node) { return this.insertBefore(node, null); }
  append(...nodes) { for (const node of nodes) this.appendChild(node); }
  after(node) { const parent = this.parentNode; parent.insertBefore(node, parent.children[parent.children.indexOf(this) + 1] ?? null); }
  remove() { this.#detach(); }
  contains(node) { for (let n = node; n; n = n.parentNode) if (n === this) return true; return false; }
  matches(selector) {
    if (selector.startsWith(".")) return this.className.split(/\s+/u).includes(selector.slice(1));
    if (selector.startsWith("#")) return this.id === selector.slice(1);
    return false;
  }
  closest(selector) { for (let n = this; n; n = n.parentNode) if (n.matches?.(selector)) return n; return null; }
  *walk() { yield this; for (const child of this.children) yield* child.walk(); }
  addEventListener(type, fn) { if (!this.listeners.has(type)) this.listeners.set(type, new Set()); this.listeners.get(type).add(fn); }
  removeEventListener(type, fn) { this.listeners.get(type)?.delete(fn); }
  focus() { this.ownerDocument.activeElement = this; }
  get listenerCount() { return [...this.listeners.values()].reduce((sum, set) => sum + set.size, 0); }
}

function fakeDocument() {
  const doc = { activeElement: null, sheets: [] };
  doc.documentElement = new FakeNode(doc, "html");
  doc.createXULElement = tag => new FakeNode(doc, tag);
  doc.createElementNS = (_ns, tag) => new FakeNode(doc, tag);
  doc.createProcessingInstruction = (target, data) => {
    const pi = { target, data, remove() { doc.sheets.splice(doc.sheets.indexOf(pi), 1); } };
    return pi;
  };
  doc.insertBefore = node => { doc.sheets.push(node); };
  doc.getElementById = id => {
    for (const node of doc.documentElement.walk()) if (node.id === id) return node;
    return doc.extra?.[id] ?? null;
  };
  return doc;
}

function fakePrefs(initial = {}) {
  const values = new Map(Object.entries(initial));
  const observers = new Map();
  return {
    values, observers,
    getBoolPref: (name, fallback) => (values.has(name) ? values.get(name) : fallback),
    getIntPref: (name, fallback) => (values.has(name) ? values.get(name) : fallback),
    setIntPref(name, value) { values.set(name, value); },
    setBoolPref(name, value) { values.set(name, value); for (const o of observers.get(name) ?? []) o.observe(null, "nsPref:changed", name); },
    addObserver(name, observer) { if (!observers.has(name)) observers.set(name, new Set()); observers.get(name).add(observer); },
    removeObserver(name, observer) { observers.get(name)?.delete(observer); },
  };
}

function fakeCustomizableUI(placements) {
  const areas = new Map(Object.entries(placements).map(([area, ids]) => [area, [...ids]]));
  const find = id => { for (const [area, ids] of areas) { const position = ids.indexOf(id); if (position >= 0) return { area, position }; } return null; };
  return {
    areas,
    getPlacementOfWidget: find,
    addWidgetToArea(id, area, position) { this.removeWidgetFromArea(id); const ids = areas.get(area) ?? []; ids.splice(position ?? ids.length, 0, id); areas.set(area, ids); },
    removeWidgetFromArea(id) { const p = find(id); if (p) areas.get(p.area).splice(p.position, 1); },
  };
}

const FOOT_DEFAULT = { [ZEN_SIDEBAR.footToolbar]: [ZEN_SIDEBAR.libraryWidget, ZEN_SIDEBAR.spaceIcons, ZEN_SIDEBAR.createNewButton] };

async function setup({ count = 3, active = 0, prefs = {}, cui = FOOT_DEFAULT, isPrivate = false, disabled = false, spaces = null, zenPrefs = {} } = {}) {
  const list = spaces ?? spacesOf(count);
  const f = fakeZenWindow({ spaces: list, active: list[active]?.uuid, isPrivate, disabled });
  Object.assign(f.zen, zenPrefs);
  const doc = fakeDocument();
  const foot = new FakeNode(doc, "toolbar"); foot.id = ZEN_SIDEBAR.footToolbar;
  const strip = new FakeNode(doc, "zen-workspace-icons"); strip.id = ZEN_SIDEBAR.spaceIcons;
  const plus = new FakeNode(doc, "toolbarbutton"); plus.id = ZEN_SIDEBAR.createNewButton;
  doc.documentElement.appendChild(foot); foot.append(strip, plus);
  const opened = [];
  doc.extra = { zenWorkspaceMoreActions: { id: "zenWorkspaceMoreActions", openPopup: (...args) => opened.push(args) } };
  f.window.document = doc;
  f.window.Services = { ...f.window.Services, prefs: fakePrefs(prefs) };
  f.window.CustomizableUI = fakeCustomizableUI(cui);
  const clock = createClock();
  const installed = installSpaceSwitcher(f.window, { timers: clock.timersApi });
  await installed.ready;
  const container = () => doc.getElementById(SWITCHER_ID);
  const dots = () => container()?.children[1].children ?? [];
  const fire = (type, target, init = {}) => {
    const event = { type, target, isTrusted: true, defaultPrevented: false, propagationStopped: false,
      preventDefault() { this.defaultPrevented = true; }, stopPropagation() { this.propagationStopped = true; }, ...init };
    for (let node = target; node; node = node.parentNode) for (const fn of [...(node.listeners.get(type) ?? [])]) fn(event);
    return event;
  };
  return { f, doc, foot, strip, plus, installed, container, dots, fire, clock, opened, list,
    prefs: f.window.Services.prefs, cui: f.window.CustomizableUI };
}

test("dot window keeps the active space visible and compresses past the maximum", () => {
  assert.equal(MAX_DOTS, 7);
  assert.deepEqual(dotWindow(3, 1), { start: 0, end: 3 });
  assert.deepEqual(dotWindow(10, 0), { start: 0, end: 7 });
  assert.deepEqual(dotWindow(10, 5), { start: 2, end: 9 });
  assert.deepEqual(dotWindow(10, 9), { start: 3, end: 10 });
  const sizes = Array.from({ length: 10 }, (_, i) => dotSize(i, 10, 5));
  assert.deepEqual(sizes, ["hidden", "hidden", "small", "normal", "normal", "normal", "normal", "normal", "small", "hidden"]);
  assert.deepEqual(Array.from({ length: 3 }, (_, i) => dotSize(i, 3, 0)), ["normal", "normal", "normal"]);
  assert.equal(dotSize(0, 10, 0), "normal", "the active dot is never shrunk");
});

test("renders the current space name, icon and one tab per space after Zen's strip", async () => {
  const t = await setup({ spaces: spacesOf(3, { 1: { icon: "🚀", name: "Rocket" } }), active: 1 });
  const container = t.container();
  assert.ok(container, "switcher inserted");
  assert.equal(container.parentNode, t.foot);
  assert.equal(t.foot.children.indexOf(container), t.foot.children.indexOf(t.strip) + 1);
  assert.equal(container.getAttribute("skipintoolbarset"), "true");
  assert.equal(t.doc.documentElement.getAttribute(ROOT_ATTRIBUTE), "true");
  assert.equal(t.doc.sheets.length, 1);
  assert.match(t.doc.sheets[0].data, new RegExp(STYLESHEET.replace(/[.]/gu, "\\.")));
  const [name, tablist] = container.children;
  assert.equal(name.localName, "toolbarbutton", "Zen's menu targets the closest toolbarbutton");
  assert.equal(name.textContent, "🚀Rocket");
  assert.equal(name.getAttribute("aria-label"), "Space: Rocket");
  assert.equal(name.getAttribute("zen-workspace-id"), t.list[1].uuid);
  assert.equal(name.getAttribute("context"), "zenWorkspaceMoreActions");
  assert.equal(tablist.getAttribute("role"), "tablist");
  assert.equal(tablist.getAttribute("aria-label"), "Spaces");
  const dots = t.dots();
  assert.equal(dots.length, 3);
  assert.deepEqual(dots.map(d => [d.getAttribute("role"), d.getAttribute("aria-selected"), d.getAttribute("tabindex")]),
    [["tab", "false", "-1"], ["tab", "true", "0"], ["tab", "false", "-1"]]);
  assert.deepEqual(dots.map(d => d.getAttribute("tooltiptext")), ["Space 1", "Rocket", "Space 3"]);
  assert.deepEqual(dots.map(d => d.getAttribute("aria-label")), ["Space 1", "Rocket", "Space 3"]);
  assert.deepEqual(dots.map(d => d.getAttribute("aria-posinset")), ["1", "2", "3"]);
  assert.ok(dots.every(d => d.getAttribute("aria-setsize") === "3" && d.getAttribute("context") === "zenWorkspaceMoreActions"));
  assert.deepEqual(dots.map(d => d.getAttribute("zen-workspace-id")), t.list.map(s => s.uuid));
  t.installed.dispose();
});

test("one space shows only its name; many spaces compress to seven dots", async () => {
  const one = await setup({ count: 1 });
  assert.equal(one.container().getAttribute("single"), "true");
  assert.equal(one.container().children[1].getAttribute("hidden"), "true");
  assert.equal(one.container().children[0].textContent, "Space 1");
  one.installed.dispose();

  const many = await setup({ count: 10, active: 5 });
  const dots = many.dots();
  assert.equal(dots.length, 10, "every space stays in the tablist (posinset/setsize)");
  assert.equal(dots.filter(d => d.getAttribute("hidden") === "true").length, 3);
  assert.deepEqual(dots.map(d => d.getAttribute("data-size")),
    ["hidden", "hidden", "small", "normal", "normal", "normal", "normal", "normal", "small", "hidden"]);
  many.installed.dispose();
});

test("clicking a dot switches through Zen; clicking the name opens Zen's space menu", async () => {
  const t = await setup({ count: 3 });
  const dots = t.dots();
  t.fire("command", dots[2].firstChild);
  await flushMicrotasks();
  assert.equal(t.f.zen.activeWorkspace, t.list[2].uuid);
  assert.equal(t.dots()[2].getAttribute("aria-selected"), "true");
  assert.equal(t.dots()[2].getAttribute("tabindex"), "0");
  assert.equal(t.dots()[0].getAttribute("tabindex"), "-1");
  assert.equal(t.container().children[0].textContent, "Space 3");
  const name = t.container().children[0];
  t.fire("command", name);
  assert.equal(t.opened.length, 1);
  assert.equal(t.opened[0][0], name, "anchored to the name");
  assert.equal(t.opened[0][1], "before_start");
  assert.equal(t.installed.diagnostics().switches, 1);
  t.installed.dispose();
});

test("arrow keys, Home and End cycle spaces with Zen's wrap-around and keep focus on the active tab", async () => {
  const t = await setup({ count: 3 });
  const key = async k => { const e = t.fire("keydown", t.doc.activeElement ?? t.dots()[0], { key: k }); await flushMicrotasks(); return e; };
  t.dots()[0].focus();
  const e = await key("ArrowRight");
  assert.equal(e.defaultPrevented, true);
  assert.equal(t.f.zen.activeWorkspace, t.list[1].uuid);
  assert.equal(t.doc.activeElement, t.dots()[1]);
  await key("End");
  assert.equal(t.f.zen.activeWorkspace, t.list[2].uuid);
  await key("ArrowRight");
  assert.equal(t.f.zen.activeWorkspace, t.list[0].uuid, "wraps by default like Zen");
  await key("ArrowLeft");
  assert.equal(t.f.zen.activeWorkspace, t.list[2].uuid);
  await key("Home");
  assert.equal(t.f.zen.activeWorkspace, t.list[0].uuid);
  assert.equal(t.doc.activeElement, t.dots()[0]);
  const other = await key("a");
  assert.equal(other.defaultPrevented, false, "other keys pass through");
  t.installed.dispose();

  const clamp = await setup({ count: 2, zenPrefs: { shouldWrapAroundNavigation: false } });
  clamp.dots()[0].focus();
  clamp.fire("keydown", clamp.dots()[0], { key: "ArrowLeft" });
  await flushMicrotasks();
  assert.equal(clamp.f.zen.activeWorkspace, clamp.list[0].uuid, "no wrap when Zen's pref is off");
  clamp.installed.dispose();
});

test("horizontal scroll steps one space per gesture; vertical scroll is ignored", async () => {
  const t = await setup({ count: 3 });
  const wheel = init => t.fire("wheel", t.container().children[0], { deltaMode: 0, deltaY: 0, ...init });
  assert.equal(wheel({ deltaY: 40, deltaX: 5 }).defaultPrevented, false);
  wheel({ deltaX: WHEEL_THRESHOLD / 2 });
  await flushMicrotasks();
  assert.equal(t.f.zen.activeWorkspace, t.list[0].uuid, "below threshold");
  wheel({ deltaX: WHEEL_THRESHOLD / 2 });
  await flushMicrotasks();
  assert.equal(t.f.zen.activeWorkspace, t.list[1].uuid);
  for (let i = 0; i < 10; i++) wheel({ deltaX: 50 }); // inertia of the same gesture
  await flushMicrotasks();
  assert.equal(t.f.zen.activeWorkspace, t.list[1].uuid);
  await t.clock.advance(WHEEL_IDLE_MS);
  wheel({ deltaX: -1, deltaMode: 1 }); // one line = 16px
  wheel({ deltaX: -1, deltaMode: 1 });
  await flushMicrotasks();
  assert.equal(t.f.zen.activeWorkspace, t.list[0].uuid);
  t.installed.dispose();

  const natural = await setup({ count: 3, zenPrefs: { naturalScroll: true } });
  natural.fire("wheel", natural.container(), { deltaX: 40, deltaY: 0, deltaMode: 0 });
  await flushMicrotasks();
  assert.equal(natural.f.zen.activeWorkspace, natural.list[2].uuid, "Zen's natural-scroll pref inverts the direction");
  natural.installed.dispose();
});

test("dragging a tab over a dot switches to that space, like Zen's icons", async () => {
  const t = await setup({ count: 3 });
  t.fire("dragover", t.dots()[1], { dataTransfer: { types: ["text/plain"] } });
  await flushMicrotasks();
  assert.equal(t.f.zen.activeWorkspace, t.list[0].uuid, "only tab drags");
  t.fire("dragover", t.dots()[1], { dataTransfer: { types: ["application/x-moz-tabbrowser-tab"] } });
  await flushMicrotasks();
  assert.equal(t.f.zen.activeWorkspace, t.list[1].uuid);
  t.installed.dispose();
});

test("renames, icons, new, deleted and reordered spaces re-render in place", async () => {
  const t = await setup({ count: 2 });
  const name = t.container().children[0];
  const firstDot = t.dots()[0];
  t.f.mutate(t.list[0].uuid, { name: "Work", icon: "chrome://browser/skin/zen-icons/selectable/star.svg" });
  t.f.window.dispatch("ZenWorkspaceDataChanged");
  assert.equal(t.container().children[0], name, "same element: an open icon picker keeps its anchor");
  assert.equal(name.firstChild.firstChild.localName, "img");
  assert.equal(name.firstChild.firstChild.getAttribute("src"), "chrome://browser/skin/zen-icons/selectable/star.svg");
  assert.equal(t.dots()[0], firstDot);
  assert.equal(firstDot.getAttribute("tooltiptext"), "Work");
  t.f.mutate(t.list[0].uuid, { icon: "https://evil.test/x.svg" });
  t.f.window.dispatch("ZenWorkspaceDataChanged");
  assert.equal(name.firstChild.getAttribute("hidden"), "true", "remote SVG icons are not loaded");
  // Zen's emoji picker clears its anchor's text; the next render restores it.
  name.textContent = "";
  t.f.mutate(t.list[0].uuid, { icon: "🌿" });
  t.f.window.dispatch("ZenWorkspaceDataChanged");
  assert.equal(name.textContent, "🌿Work");
  const third = { uuid: uuid(3), name: "Third", icon: "" };
  t.f.setSpaces([third, ...t.list.map(s => ({ ...s, name: s.uuid === t.list[0].uuid ? "Work" : s.name }))]);
  t.f.window.dispatch("ZenWorkspacesUIUpdate");
  assert.deepEqual(t.dots().map(d => d.getAttribute("tooltiptext")), ["Third", "Work", "Space 2"]);
  assert.equal(t.dots()[1], firstDot, "existing dots are reused");
  t.f.setSpaces([third]);
  t.f.window.dispatch("ZenWorkspacesUIUpdate");
  assert.equal(t.dots().length, 1);
  t.installed.dispose();
});

test("Library is swapped for Downloads once; a later user customization wins; off restores it", async () => {
  const t = await setup();
  const foot = t.cui.areas.get(ZEN_SIDEBAR.footToolbar);
  assert.deepEqual(foot, [ZEN_SIDEBAR.downloadsWidget, ZEN_SIDEBAR.spaceIcons, ZEN_SIDEBAR.createNewButton]);
  assert.equal(t.prefs.values.get(LIBRARY_STATE_PREF), 1);
  // The user puts Library back; a second window must not remove it again.
  t.cui.addWidgetToArea(ZEN_SIDEBAR.libraryWidget, ZEN_SIDEBAR.footToolbar, 0);
  const second = installSpaceSwitcher(t.f.window, { timers: t.clock.timersApi });
  await second.ready;
  assert.ok(t.cui.getPlacementOfWidget(ZEN_SIDEBAR.libraryWidget));
  second.dispose();
  t.cui.removeWidgetFromArea(ZEN_SIDEBAR.libraryWidget);

  // Turning the pref off is live: stock strip, header and "+" come back and Library is restored.
  t.prefs.setBoolPref(PREF, false);
  assert.equal(t.container(), null);
  assert.equal(t.doc.documentElement.getAttribute(ROOT_ATTRIBUTE), null);
  assert.equal(t.doc.sheets.length, 0);
  assert.deepEqual(t.cui.areas.get(ZEN_SIDEBAR.footToolbar), [ZEN_SIDEBAR.libraryWidget, ZEN_SIDEBAR.spaceIcons, ZEN_SIDEBAR.createNewButton]);
  assert.equal(t.prefs.values.get(LIBRARY_STATE_PREF), 0);
  t.prefs.setBoolPref(PREF, true);
  assert.ok(t.container());
  assert.equal(t.cui.areas.get(ZEN_SIDEBAR.footToolbar)[0], ZEN_SIDEBAR.downloadsWidget);
  t.installed.dispose();

  const noLibrary = await setup({ cui: { [ZEN_SIDEBAR.footToolbar]: [ZEN_SIDEBAR.downloadsWidget, ZEN_SIDEBAR.spaceIcons] } });
  assert.equal(noLibrary.prefs.values.get(LIBRARY_STATE_PREF), 2, "nothing to replace, and never again");
  noLibrary.cui.addWidgetToArea(ZEN_SIDEBAR.libraryWidget, ZEN_SIDEBAR.footToolbar, 0);
  noLibrary.prefs.setBoolPref(PREF, false);
  noLibrary.prefs.setBoolPref(PREF, true);
  assert.ok(noLibrary.cui.getPlacementOfWidget(ZEN_SIDEBAR.libraryWidget), "user-added Library stays");
  noLibrary.installed.dispose();
});

test("disabled pref, private and workspace-less windows keep stock Zen", async () => {
  for (const options of [{ prefs: { [PREF]: false } }, { isPrivate: true }, { disabled: true }]) {
    const t = await setup(options);
    assert.equal(t.container(), null, JSON.stringify(options));
    assert.equal(t.doc.documentElement.getAttribute(ROOT_ATTRIBUTE), null);
    assert.ok(t.cui.getPlacementOfWidget(ZEN_SIDEBAR.libraryWidget), "Library untouched");
    assert.equal(t.doc.sheets.length, 0);
    t.installed.dispose();
  }
});

test("dispose removes the switcher, attribute, stylesheet, listeners and pref observer", async () => {
  const t = await setup();
  const tablist = t.container().children[1];
  t.installed.dispose();
  t.installed.dispose();
  assert.equal(t.container(), null);
  assert.equal(t.doc.documentElement.getAttribute(ROOT_ATTRIBUTE), null);
  assert.equal(t.doc.sheets.length, 0);
  assert.equal(tablist.listenerCount, 0);
  assert.equal(t.prefs.observers.get(PREF).size, 0);
  assert.equal(t.f.changeListeners.length, 0, "own adapter disposed");
  t.f.window.dispatch("ZenWorkspacesUIUpdate"); // no render after dispose
  assert.equal(t.container(), null);
});

test("stylesheet only hides Zen UI while the switcher is active, and respects reduced motion", () => {
  const css = readFileSync(new URL("../chrome/space-switcher.css", import.meta.url), "utf8");
  for (const id of [ZEN_SIDEBAR.createNewButton, ZEN_SIDEBAR.spaceIcons]) assert.match(css, new RegExp(`#${id}\\b`));
  assert.match(css, new RegExp(ZEN_SIDEBAR.spaceHeader.replace(".", "\\.")));
  const hidingBlocks = css.split("}").filter(block => /display:\s*none\s*!important/u.test(block));
  assert.ok(hidingBlocks.length >= 3);
  // Every !important hide sits under the switcher's root attribute.
  const hideSelectors = [...css.matchAll(/^:root\[axiosozo-space-switcher\][^{]*\{/gmu)];
  assert.equal(hideSelectors.length, 2);
  assert.doesNotMatch(css, /library-button/u, "Library is removed through CustomizableUI, not CSS");
  assert.match(css, /prefers-reduced-motion: reduce/u);
  assert.match(css, /:has\(\.tab-label-container-editing, \[zen-emoji-open="true"\]\)/u, "header returns while renaming or picking an icon");
  assert.match(css, /:not\(\[collapsedpinnedtabs\]\)/u, "header stays when pinned tabs are collapsed");
  assert.match(css, /:root:not\(\[zen-sidebar-expanded="true"\]\) &/u, "collapsed sidebar keeps Zen's strip");
});

test("the switcher names no Zen API; startup installs it behind its pref", () => {
  const source = readFileSync(new URL("../chrome/SpaceSwitcher.sys.mjs", import.meta.url), "utf8");
  assert.doesNotMatch(source, /gZen|zenWorkspaceMoreActions|zen-workspace-id|ZenWorkspace(DataChanged|sUIUpdate)|CustomizableUI\./u);
  const startup = readFileSync(new URL("../chrome/AxioSozoStartup.mjs", import.meta.url), "utf8");
  assert.match(startup, /installSpaceSwitcher\(window\)/u);
  assert.match(startup, /spaceSwitcher\?\.dispose\(\)/u);
  const defaults = readFileSync(new URL("../chrome/defaults.yaml", import.meta.url), "utf8");
  assert.match(defaults, /- name: axiosozo\.ui\.spaceSwitcher\.enabled\n {2}value: true/u);
});
