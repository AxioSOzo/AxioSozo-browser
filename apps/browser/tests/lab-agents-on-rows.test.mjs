/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. https://mozilla.org/MPL/2.0/ */

// Lab "agents-on-rows": ProjectSidebar's decoration hook (decorateProjectRows)
// on the real sidebar (DevLoop's synthetic window), then the experiment on it:
// marks on the rows, the Needs you stack, the result card beside the row, the
// one toast, and nothing left when it is turned off.
import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import "./support/chrome-modules.mjs";
import { FakeNode, createClock, createFakeAdapter, createFakeServices, createFakeWindow, flushMicrotasks, project, WORKSPACE_A, WORKSPACE_B }
  from "./dev-loop-harness.test.mjs";
import { labContext } from "./support/lab-harness.mjs";
import { doneSession, fakeAgents, session } from "./support/lab-presence-fakes.mjs";

const core = await import("../../../packages/contexts/src/index.mjs");
const { installDevLoop } = await import("../chrome/DevLoop.sys.mjs");
const { decorateProjectRows, ROW_MARKS } = await import("../chrome/ProjectSidebar.sys.mjs");
const { installAgentsOnRows, rowMarkOf, ROWS_STYLESHEET, PRESENCE_STYLESHEET, STACK_LIMIT } = await import("../chrome/lab/agents-on-rows/agents-on-rows.sys.mjs");
const { createPresenceHub } = await import("../chrome/lab/presence/hub.sys.mjs");

// DevLoop's fake DOM lacks a few DOM methods the Lab kit uses.
Object.assign(FakeNode.prototype, {
  append(...nodes) { for (const node of nodes) this.appendChild(node); },
  replaceChildren(...nodes) { for (const child of [...this.children]) child.remove(); this.append(...nodes); },
  closest(selector) { for (let node = this; node instanceof FakeNode; node = node.parentNode) if (node.matches(selector)) return node; return null; },
  getBoundingClientRect() { return { x: 8, y: 120, left: 8, top: 120, width: 224, height: 36, right: 232, bottom: 156 }; },
});
if (!Object.getOwnPropertyDescriptor(FakeNode.prototype, "childNodes")) {
  Object.defineProperty(FakeNode.prototype, "childNodes", { get() { return this.children; } });
}

const section = h => h.document.getElementById("axiosozo-projects");
const rowFor = (h, id) => section(h)?.querySelectorAll(".axiosozo-project").find(li => li.getAttribute("data-project-id") === id) ?? null;
const rowButton = (h, id) => rowFor(h, id)?.querySelector(".axiosozo-project-row") ?? null;
const agentButton = (h, id) => rowFor(h, id)?.children.find(node => node.classList.contains("axiosozo-project-agent")) ?? null;
const markOn = (h, id) => rowButton(h, id)?.querySelector(".axiosozo-project-agent-mark") ?? null;
const stackOf = h => section(h)?.querySelector(".axiosozo-agents-stack") ?? null;
const sheets = h => h.document.prolog.map(node => /href="([^"]+)"/u.exec(node.data)?.[1]);

function sidebar({ projects = [project()] } = {}) {
  const h = createFakeWindow();
  const adapter = createFakeAdapter({ elements: uuid => h.document.getElementById(uuid) });
  adapter.onUpdate = callback => adapter.onChange(callback);
  adapter.listWorkspaces = () => [{ uuid: WORKSPACE_A }, { uuid: WORKSPACE_B }];
  const services = createFakeServices(core, { projects });
  const clock = createClock();
  const loop = installDevLoop(h.window, { services, adapter, core, timers: clock.timersApi, clock: clock.fn });
  return { h, adapter, services, clock, loop };
}

// ---------------------------------------------------------------- the hook

test("the decoration hook: a mark on the row's icon, a button beside it and a node above the list, drawn by the sidebar", async () => {
  const t = sidebar();
  await flushMicrotasks();
  assert.equal(rowButton(t.h, "p_webapp").getAttribute("aria-label"), "Webapp. Show project", "no decorator: the row as it was");
  let mark = { state: "needs_you", label: "Claude Code needs you", title: "Claude Code · needs you" };
  const activated = [];
  const top = t.h.document.createElementNS("http://www.w3.org/1999/xhtml", "div");
  top.className = "probe-top";
  const handle = decorateProjectRows(t.h.window, { top, mark: p => (p.id === "p_webapp" ? mark : null),
    activate: (p, button, event) => activated.push([p.id, button, event.isTrusted]) });
  await flushMicrotasks();
  const li = rowFor(t.h, "p_webapp");
  assert.equal(li.getAttribute("data-agent"), "needs_you");
  assert.equal(markOn(t.h, "p_webapp").getAttribute("data-agent"), "needs_you");
  assert.equal(markOn(t.h, "p_webapp").parentNode.classList.contains("axiosozo-project-icon"), true, "on the project's mark");
  assert.equal(rowButton(t.h, "p_webapp").getAttribute("aria-label"), "Webapp, Claude Code needs you. Show project");
  const button = agentButton(t.h, "p_webapp");
  assert.equal(button.localName, "button");
  assert.equal(button.getAttribute("aria-label"), "Webapp: Claude Code needs you. Show");
  assert.equal(button.getAttribute("title"), "Claude Code · needs you");
  assert.equal(button.getAttribute("aria-haspopup"), "dialog");
  button.click();
  assert.deepEqual(activated, [["p_webapp", button, true]]);
  const head = section(t.h).querySelector(".axiosozo-projects-head");
  assert.equal(top.previousElementSibling, head, "the node sits between the heading and the list");
  // A changed mark redraws on update(); a quiet one says so.
  mark = { state: "done", label: "Claude Code is done", quiet: true };
  handle.update();
  await flushMicrotasks();
  assert.equal(markOn(t.h, "p_webapp").getAttribute("data-agent"), "done");
  assert.equal(markOn(t.h, "p_webapp").hasAttribute("data-quiet"), true);
  assert.equal(agentButton(t.h, "p_webapp"), button, "the same button, kept");
  assert.equal(button.getAttribute("title"), "Claude Code is done", "the label is the tooltip without a title");
  // Marks the hook does not know, or a decorator that throws, draw nothing.
  mark = { state: "exploded", label: "x" };
  handle.update();
  await flushMicrotasks();
  assert.equal(rowFor(t.h, "p_webapp").hasAttribute("data-agent"), false);
  assert.equal(agentButton(t.h, "p_webapp"), null, "no mark, no button");
  assert.deepEqual([...ROW_MARKS], ["working", "needs_you", "done", "failed", "stopped"]);
  mark = { state: "working", label: "Codex is working" };
  handle.update();
  await flushMicrotasks();
  assert.equal(rowFor(t.h, "p_webapp").getAttribute("data-agent"), "working");
  // remove(): everything goes.
  handle.remove();
  await flushMicrotasks();
  assert.equal(rowFor(t.h, "p_webapp").hasAttribute("data-agent"), false);
  assert.equal(markOn(t.h, "p_webapp"), null);
  assert.equal(agentButton(t.h, "p_webapp"), null);
  assert.equal(top.parentNode, null);
  assert.equal(rowButton(t.h, "p_webapp").getAttribute("aria-label"), "Webapp. Show project");
  handle.update(); // a stale handle does nothing
  t.loop.dispose();
});

test("a decorator that throws or a second one: the sidebar keeps working, the newest one draws", async () => {
  const t = sidebar();
  await flushMicrotasks();
  const first = decorateProjectRows(t.h.window, { mark: () => { throw new Error("boom"); }, top: null });
  await flushMicrotasks();
  assert.equal(rowFor(t.h, "p_webapp").hasAttribute("data-agent"), false);
  const second = decorateProjectRows(t.h.window, { mark: () => ({ state: "failed", label: "Codex failed" }), top: null });
  await flushMicrotasks();
  assert.equal(rowFor(t.h, "p_webapp").getAttribute("data-agent"), "failed");
  first.remove(); // not the current one: no effect
  await flushMicrotasks();
  assert.equal(rowFor(t.h, "p_webapp").getAttribute("data-agent"), "failed");
  second.remove();
  t.loop.dispose();
  // After the sidebar is gone, decorating its window is harmless.
  decorateProjectRows(t.h.window, { mark: () => null }).remove();
});

// ---------------------------------------------------------------- the experiment

function experiment({ agents = fakeAgents(), projects = [project()], hub = createPresenceHub() } = {}) {
  const t = sidebar({ projects });
  const ctx = labContext(t.h.window, { id: "agents-on-rows", agents, services: t.services, adapter: t.adapter });
  const handle = installAgentsOnRows(t.h.window, ctx, { hub, clock: t.clock.fn, timers: t.clock.timersApi });
  return { ...t, ctx, agents, hub, handle };
}

test("rows say what their agents do; the strongest wins; done gets quieter once its result was seen", async () => {
  const e = experiment();
  await flushMicrotasks();
  assert.equal(rowFor(e.h, "p_webapp").hasAttribute("data-agent"), false, "no session, no mark");
  const run = e.agents.emit(session({ projectId: "p_webapp", projectName: "Webapp", projectRoot: "/synthetic/p_webapp" }));
  await flushMicrotasks();
  assert.equal(rowFor(e.h, "p_webapp").getAttribute("data-agent"), "working");
  assert.equal(agentButton(e.h, "p_webapp").getAttribute("title"), "Claude Code · working: editing index.html");
  assert.equal(rowButton(e.h, "p_webapp").getAttribute("aria-label"), "Webapp, Claude Code is working. Show project");
  const other = e.agents.emit(session({ projectId: "p_webapp", projectName: "Webapp", state: "failed", reason: "Codex needs you to sign in. Open Codex and sign in there.",
    client: "codex", clientLabel: "Codex" }));
  await flushMicrotasks();
  assert.equal(rowFor(e.h, "p_webapp").getAttribute("data-agent"), "failed", "a failure outranks a run");
  e.agents.remove(other.id);
  e.agents.emit(doneSession({ id: run.id, projectId: "p_webapp", projectName: "Webapp" }));
  await flushMicrotasks();
  assert.equal(rowFor(e.h, "p_webapp").getAttribute("data-agent"), "done");
  assert.equal(markOn(e.h, "p_webapp").hasAttribute("data-quiet"), false);
  assert.equal(e.ctx.toasts.length, 0, "done never interrupts");
  agentButton(e.h, "p_webapp").click();
  await flushMicrotasks();
  const card = e.h.document.documentElement.children.find(node => node.classList.contains("axiosozo-presence-card"));
  assert.ok(card, "the result card opens");
  assert.equal(card.getAttribute("data-fixed"), "true", "beside the sidebar, over the window");
  assert.equal(card.querySelector(".axiosozo-presence-lead").textContent, "Fixed the retry handler.");
  await flushMicrotasks();
  assert.equal(markOn(e.h, "p_webapp").hasAttribute("data-quiet"), true, "seen");
  assert.equal(agentButton(e.h, "p_webapp").hasAttribute("data-quiet"), true);
  e.ctx.turnOff();
  assert.equal(card.parentNode, null, "the card goes with the experiment");
  e.loop.dispose();
});

test("the Needs you stack lists what waits in this space, opens its card, and one toast says it once", async () => {
  const projects = [project(), project({ id: "p_other", name: "Other", space: WORKSPACE_B })];
  const e = experiment({ projects });
  await flushMicrotasks();
  assert.equal(stackOf(e.h).hidden, true, "nothing waits: no stack");
  const waiting = e.agents.emit(session({ projectId: "p_webapp", projectName: "Webapp", projectRoot: "/synthetic/p_webapp", state: "needs_you",
    reason: "Claude Code wanted to go further (writing outside.txt). Continue in Terminal to decide." }));
  e.agents.emit(session({ projectId: "p_other", projectName: "Other", state: "needs_you", reason: "Waiting for you: permission prompt.", origin: "external" }));
  await flushMicrotasks();
  const stack = stackOf(e.h);
  assert.equal(stack.hidden, false);
  assert.equal(stack.getAttribute("role"), "group");
  assert.equal(stack.querySelector(".axiosozo-agents-stack-head").textContent, "Needs you");
  const items = stack.querySelectorAll(".axiosozo-agents-stack-item");
  assert.equal(items.length, 1, "only this space's");
  assert.equal(items[0].querySelector(".axiosozo-agents-stack-title").textContent, "Webapp · fix the retry button");
  assert.equal(items[0].querySelector(".axiosozo-agents-stack-sub").textContent, "Claude Code wanted to go further (writing outside.txt). Continue in Terminal to decide.");
  assert.match(items[0].getAttribute("aria-label"), /^Claude Code needs you in Webapp: fix the retry button\. Claude Code wanted to go further/u);
  assert.equal(rowFor(e.h, "p_webapp").getAttribute("data-agent"), "needs_you");
  // The attention rule: one toast per wait (two waits, two toasts), named and with one button.
  assert.deepEqual(e.ctx.toasts.map(toast => [toast.title, toast.button.label]),
    [["Claude Code needs you in Webapp", "Continue in Terminal"], ["Claude Code needs you in Other", "Show"]]);
  items[0].click();
  await flushMicrotasks();
  const card = e.h.document.documentElement.children.find(node => node.classList.contains("axiosozo-presence-card"));
  assert.equal(card.querySelector(".axiosozo-presence-status").textContent, "Claude Code · needs you");
  const primary = card.querySelectorAll("button").find(node => node.className.includes("primary"));
  assert.equal(primary.textContent, "Continue in Terminal");
  // Another space: its own waits.
  e.adapter.active = WORKSPACE_B;
  e.adapter.emit({ kind: "switched", uuid: WORKSPACE_B });
  await flushMicrotasks();
  assert.equal(stackOf(e.h).querySelectorAll(".axiosozo-agents-stack-title").map(node => node.textContent).join(), "Other · fix the retry button");
  // Answered (in the terminal): the stack empties and the row calms down.
  e.adapter.active = WORKSPACE_A;
  e.adapter.emit({ kind: "switched", uuid: WORKSPACE_A });
  e.agents.emit(session({ ...waiting, state: "working" }));
  await flushMicrotasks();
  assert.equal(stackOf(e.h).hidden, true);
  assert.equal(rowFor(e.h, "p_webapp").getAttribute("data-agent"), "working");
  e.ctx.turnOff();
  e.loop.dispose();
});

test("a long Needs you stack folds into N more", async () => {
  const e = experiment();
  await flushMicrotasks();
  for (let i = 0; i < STACK_LIMIT + 2; i++) e.agents.emit(session({ projectId: "p_webapp", projectName: "Webapp", state: "needs_you", title: `task ${i}` }));
  await flushMicrotasks();
  assert.equal(stackOf(e.h).querySelectorAll(".axiosozo-agents-stack-item").length, STACK_LIMIT);
  const more = stackOf(e.h).querySelector(".axiosozo-agents-stack-more");
  assert.equal(more.textContent, "2 more");
  more.click();
  assert.equal(stackOf(e.h).querySelectorAll(".axiosozo-agents-stack-item").length, STACK_LIMIT + 2);
  assert.equal(stackOf(e.h).querySelector(".axiosozo-agents-stack-more").textContent, "Show fewer");
  e.ctx.turnOff();
  e.loop.dispose();
});

test("off means gone: marks, stack, card, stylesheets, the agents subscription and external watching", async () => {
  const agents = fakeAgents();
  const e = experiment({ agents });
  await flushMicrotasks();
  agents.emit(session({ projectId: "p_webapp", projectName: "Webapp", state: "needs_you" }));
  await flushMicrotasks();
  assert.ok(sheets(e.h).includes(ROWS_STYLESHEET));
  assert.ok(sheets(e.h).includes(PRESENCE_STYLESHEET));
  assert.equal(agents.calls.watch, 1, "sessions started elsewhere are watched while it is on");
  agentButton(e.h, "p_webapp").click();
  e.handle.dispose();
  e.ctx.turnOff();
  await flushMicrotasks();
  assert.equal(rowFor(e.h, "p_webapp").hasAttribute("data-agent"), false);
  assert.equal(markOn(e.h, "p_webapp"), null);
  assert.equal(agentButton(e.h, "p_webapp"), null);
  assert.equal(stackOf(e.h), null);
  assert.deepEqual(sheets(e.h).filter(href => href?.includes("/lab/")), []);
  assert.equal(e.h.document.documentElement.children.some(node => node.classList.contains("axiosozo-lab-card")), false);
  assert.equal(agents.listenerCount(), 0);
  assert.equal(agents.calls.released, 1);
  assert.equal(e.hub.windowCount(), 0);
  assert.equal(rowButton(e.h, "p_webapp").getAttribute("aria-label"), "Webapp. Show project");
  e.loop.dispose();
});

test("rowMarkOf: the item's state and words; quiet only for a seen result", () => {
  assert.equal(rowMarkOf(null), null);
  const item = { state: "done", label: "Claude Code is done", subtitle: "Claude Code · done: Fixed it" };
  assert.deepEqual(rowMarkOf(item), { state: "done", label: "Claude Code is done", title: "Claude Code · done: Fixed it", quiet: false });
  assert.equal(rowMarkOf(item, { seen: true }).quiet, true);
  assert.equal(rowMarkOf({ ...item, state: "needs_you" }, { seen: true }).quiet, false, "a wait is never quiet");
});

test("the rows' stylesheet: glyphs by state, the badge only in the collapsed sidebar, still under reduced motion, visible in forced colours", () => {
  const css = readFileSync(new URL("../chrome/lab/agents-on-rows/agents-on-rows.css", import.meta.url), "utf8");
  for (const state of ROW_MARKS) assert.match(css, new RegExp(`\\[data-agent="${state}"\\]::before`, "u"), state);
  assert.match(css, /:root\[zen-sidebar-expanded="true"\] \.axiosozo-project-agent-mark,\s*:root:not\(\[zen-sidebar-expanded="true"\]\) \.axiosozo-project-agent \{\s*display: none !important;/u);
  assert.match(css, /@media \(prefers-reduced-motion: reduce\) \{[^@]*\[data-agent="working"\]::before \{\s*animation: none;/u);
  assert.match(css, /@media \(forced-colors: active\)/u);
  assert.match(css, /corner-shape: round/u, "round dots, not Zen's squircles");
  assert.doesNotMatch(css, /#[0-9a-f]{3,8}\b/iu, "no hard-coded hex colours");
});
