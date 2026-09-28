/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. https://mozilla.org/MPL/2.0/ */
import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import "./support/chrome-modules.mjs";
import { createClock, flushMicrotasks } from "./dev-loop-harness.test.mjs";

const { installEngineTabs, PEEK_ATTRIBUTE, STATE_ATTRIBUTE, ROOT_ATTRIBUTE, PEEK_DELAY_MS } = await import("../chrome/EngineTabs.sys.mjs");

// Minimal tab-strip model: tabs with an icon stack child, events delegated to the container.
class Node {
  constructor(className, parent = null) {
    this.className = className; this.parent = parent; this.attrs = new Map(); this.children = [];
    parent?.children.push(this);
  }
  setAttribute(k, v) { this.attrs.set(k, String(v)); }
  getAttribute(k) { return this.attrs.get(k) ?? null; }
  hasAttribute(k) { return this.attrs.has(k); }
  removeAttribute(k) { this.attrs.delete(k); }
  closest(selector) {
    const name = selector.slice(1);
    for (let node = this; node; node = node.parent) if (node.className === name) return node;
    return null;
  }
  querySelector(selector) { return this.children.find(child => child.className === selector.slice(1)) ?? null; }
}

function setup({ engine = new Map(), fail = false, mode = "web" } = {}) {
  const listeners = new Map();
  const container = {
    addEventListener: (type, fn) => listeners.set(`${type}`, fn),
    removeEventListener: (type, fn) => { if (listeners.get(type) === fn) listeners.delete(type); },
  };
  const tabs = [];
  const addTab = ({ selected = false, essential = false } = {}) => {
    const tab = new Node("tabbrowser-tab");
    tab.selected = selected;
    if (essential) tab.setAttribute("zen-essential", "true");
    tab.stack = new Node("tab-icon-stack", tab);
    tab.label = new Node("tab-label", tab);
    tabs.push(tab);
    return tab;
  };
  const root = new Node("root");
  const calls = [];
  const engineProbe = {
    diagnostics: () => ({ browsingMode: mode }),
    engineOf: tab => engine.get(tab) ?? "gecko",
    async switchToChromium() { calls.push("chromium"); if (fail) throw new Error("CEF_UNAVAILABLE"); },
    async switchToGecko() { calls.push("gecko"); },
  };
  const window = { gBrowser: { tabContainer: container, tabs }, document: {
    documentElement: root, createProcessingInstruction: () => ({ remove() {} }), insertBefore() {} } };
  const clock = createClock();
  const installed = installEngineTabs(window, { engineProbe, timers: clock.timersApi });
  const fire = (type, target, init = {}) => {
    const event = { type, target, isTrusted: true, button: 0, stopped: false, prevented: false,
      stopPropagation() { this.stopped = true; }, preventDefault() { this.prevented = true; }, ...init };
    listeners.get(type)?.(event);
    return event;
  };
  return { installed, addTab, fire, clock, calls, root, listeners };
}

test("resting on a tab turns its favicon into the engine glyph, after a short delay", async () => {
  const t = setup();
  assert.equal(t.root.getAttribute(ROOT_ATTRIBUTE), "true");
  const tab = t.addTab();
  t.fire("mouseover", tab.label);
  assert.equal(tab.getAttribute(PEEK_ATTRIBUTE), null, "no flicker on a quick pass");
  await t.clock.advance(PEEK_DELAY_MS);
  assert.equal(tab.getAttribute(PEEK_ATTRIBUTE), "true");
  assert.equal(tab.stack.getAttribute("tooltiptext"), "Firefox engine");
  t.fire("mouseout", tab.label, { relatedTarget: null });
  assert.equal(tab.getAttribute(PEEK_ATTRIBUTE), null);
  t.installed.dispose();
});

test("only the selected tab's glyph switches; other favicons keep selecting their tab", async () => {
  const t = setup();
  const background = t.addTab();
  t.fire("mouseover", background.stack);
  await t.clock.advance(PEEK_DELAY_MS);
  const passThrough = t.fire("click", background.stack);
  assert.equal(passThrough.stopped, false);
  assert.deepEqual(t.calls, []);

  const selected = t.addTab({ selected: true });
  t.fire("mouseover", selected.stack);
  await t.clock.advance(PEEK_DELAY_MS);
  assert.match(selected.stack.getAttribute("tooltiptext"), /Click to open this tab in Chromium/u);
  const label = t.fire("click", selected.label);
  assert.equal(label.stopped, false, "a click on the title is still a tab click");
  const modified = t.fire("click", selected.stack, { metaKey: true });
  assert.equal(modified.stopped, false, "modifier clicks stay with Zen (multiselect)");
  const click = t.fire("click", selected.stack);
  assert.equal(click.stopped, true);
  assert.equal(click.prevented, true);
  assert.equal(selected.getAttribute(STATE_ATTRIBUTE), "switching");
  await flushMicrotasks();
  assert.deepEqual(t.calls, ["chromium"]);
  assert.equal(selected.getAttribute(STATE_ATTRIBUTE), null);
  t.installed.dispose();
});

test("a Chromium tab switches back to Firefox; a failed switch keeps Firefox and says so briefly", async () => {
  const engine = new Map();
  const t = setup({ engine });
  const tab = t.addTab({ selected: true });
  engine.set(tab, "chromium");
  t.fire("mouseover", tab.stack);
  await t.clock.advance(PEEK_DELAY_MS);
  t.fire("click", tab.stack);
  await flushMicrotasks();
  assert.deepEqual(t.calls, ["gecko"]);
  t.installed.dispose();

  const failing = setup({ fail: true });
  const other = failing.addTab({ selected: true });
  failing.fire("mouseover", other.stack);
  await failing.clock.advance(PEEK_DELAY_MS);
  failing.fire("click", other.stack);
  await flushMicrotasks();
  assert.equal(other.getAttribute(STATE_ATTRIBUTE), "failed");
  assert.match(other.stack.getAttribute("tooltiptext"), /stays in Firefox/u);
  await failing.clock.advance(3000);
  assert.equal(other.getAttribute(STATE_ATTRIBUTE), null);
  assert.equal(failing.installed.diagnostics().failures, 1);
  failing.installed.dispose();
});

test("essentials never peek; without the web switch nothing is installed; dispose cleans up", async () => {
  const t = setup();
  const essential = t.addTab({ selected: true, essential: true });
  t.fire("mouseover", essential.stack);
  await t.clock.advance(PEEK_DELAY_MS);
  assert.equal(essential.getAttribute(PEEK_ATTRIBUTE), null);
  t.installed.dispose();
  assert.equal(t.root.getAttribute(ROOT_ATTRIBUTE), null);
  assert.equal(t.listeners.size, 0);

  const fixture = setup({ mode: "fixture" });
  assert.equal(fixture.installed.diagnostics().enabled, false);
  assert.equal(fixture.root.getAttribute(ROOT_ATTRIBUTE), null);
});

test("the glyph never covers Zen's own icon states", () => {
  const css = readFileSync(new URL("../chrome/axiosozo-runtime.css", import.meta.url), "utf8");
  assert.match(css, /#tabbrowser-tabs \.tabbrowser-tab\[axiosozo-engine-peek\]:not\(\[zen-essential\], \[busy\], \[pending\], \[soundplaying\], \[muted\], \[activemedia-blocked\], \[zen-pinned-changed="true"\]\) \.tab-icon-image/u);
  for (const glyph of ["engine-gecko.svg", "engine-chromium.svg"]) {
    const svg = readFileSync(new URL(`../chrome/icons/${glyph}`, import.meta.url), "utf8");
    assert.match(svg, /context-fill/u, `${glyph} follows the theme colour`);
  }
});
