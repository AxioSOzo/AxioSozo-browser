/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. https://mozilla.org/MPL/2.0/ */

// Agent presence, the shared parts (chrome/lab/presence/): the words a session
// shows, the order and the day limit, dismissals by phase, the hub that hands
// one interrupt to one window, the live view of ctx.agents, the attention
// rule (only needs you raises a toast) and the result card.
import test from "node:test";
import assert from "node:assert/strict";
import "./support/chrome-modules.mjs";
import { labContext } from "./support/lab-harness.mjs";
import { SPACE_A, SPACE_B, doneSession, fakeAdapter, fakeAgents, fakeServices, presenceWindow, project, session, settle } from "./support/lab-presence-fakes.mjs";

const model = await import("../chrome/lab/presence/model.sys.mjs");
const { agentIcon, agentIconSvg } = await import("../chrome/lab/presence/icons.sys.mjs");
const { createPresenceHub } = await import("../chrome/lab/presence/hub.sys.mjs");
const { watchPresence } = await import("../chrome/lab/presence/source.sys.mjs");
const { installAttention, needsYouToast, NEEDS_YOU_TOAST_MS } = await import("../chrome/lab/presence/attention.sys.mjs");
const { besideSidebar, cardActions, elsewhereNote, openResultCard, openCardOf } = await import("../chrome/lab/presence/result-card.sys.mjs");
const tabs = await import("../chrome/lab/presence/tabs.sys.mjs");

const H = 60 * 60 * 1000;
const buttons = card => card.node.querySelectorAll("button").filter(node => !node.className.includes("axiosozo-lab-card-close"));
const labels = card => buttons(card).map(node => node.textContent);
const press = (card, label) => { const node = buttons(card).find(item => item.textContent === label); assert.ok(node, `a "${label}" button`); node.click(); };

function context(h, { agents = fakeAgents(), services = fakeServices(), adapter = fakeAdapter() } = {}) {
  return labContext(h.window, { id: "agents-on-rows", agents, services, adapter });
}

// ---------------------------------------------------------------- words

test("a session reads as its project and task, then its agent and state in plain words", () => {
  assert.equal(model.titleOf(session()), "Harbor · fix the retry button");
  assert.equal(model.titleOf(session({ title: "AxioSozo: Harbor — Billing", projectName: null })), "A project · Harbor — Billing");
  assert.equal(model.titleOf(session({ title: null, client: "codex", clientLabel: "Codex" })), "Harbor · Codex session");
  const lines = [
    [session(), "Claude Code · working: editing index.html"],
    [session({ state: "starting", step: null }), "Claude Code · starting"],
    [session({ step: "Working" }), "Claude Code · working"],
    [session({ step: "Running npm test" }), "Claude Code · working: running npm test"],
    [session({ step: "README.md looked at" }), "Claude Code · working: README.md looked at"],
    [session({ state: "needs_you", reason: "Claude Code wanted to go further (writing a file). Continue in Terminal to decide." }), "Claude Code · needs you"],
    [doneSession(), "Claude Code · done: Fixed the retry handler"],
    [doneSession({ summary: "Claude Code finished." }), "Claude Code · done"],
    [doneSession({ origin: "external", summary: "Waiting for your reply." }), "Claude Code · waiting for your reply"],
    [session({ state: "failed", reason: "Claude Code is out of its 5-hour limit until 23:30." }), "Claude Code · failed: Claude Code is out of its 5-hour limit until 23:30"],
    [session({ state: "stopped", reason: "Stopped after changing 1 file." }), "Claude Code · stopped"],
    [session({ client: "antigravity", clientLabel: null }), "Antigravity · working: editing index.html"],
  ];
  for (const [item, expected] of lines) assert.equal(model.subtitleOf(item), expected, expected);
  assert.equal(model.markLabel(session({ state: "needs_you" })), "Claude Code needs you");
  assert.equal(model.markLabel(doneSession()), "Claude Code is done");
  assert.equal(model.markLabel(session({ client: "codex", clientLabel: "Codex" })), "Codex is working");
  assert.equal(model.leadText(doneSession()), "Fixed the retry handler.");
  assert.equal(model.leadText(session()), "Editing index.html…");
  assert.equal(model.leadText(session({ state: "needs_you", reason: null })), "Claude Code is waiting for your answer.");
  assert.equal(model.stateWord(session({ state: "needs_you" })), "needs you");
  // Long agent text stays one line.
  assert.ok(model.subtitleOf(doneSession({ summary: "x".repeat(400) })).length <= 110);
  assert.ok(!/[\n\r]/u.test(model.subtitleOf(doneSession({ summary: "one\ntwo" }))));
});

test("files, cost and time are said briefly, from the browser's own git reading", () => {
  const files = byRun => ({ byRun, changed: [], already: 0, summary: null });
  assert.equal(model.filesText(null), null);
  assert.equal(model.filesText(files([])), null);
  assert.equal(model.filesText(files(["index.html"])), "Changed index.html");
  assert.equal(model.filesText(files(["a.css", "b.js"])), "Changed a.css and b.js");
  assert.equal(model.filesText(files(["a", "b", "c"])), "Changed a, b and c");
  assert.equal(model.filesText(files(["a", "b", "c", "d"])), "Changed 4 files: a, b and 2 more");
  assert.equal(model.costTimeText(doneSession()), "$0.0010 · 3.6 s");
  assert.equal(model.costTimeText(doneSession({ costUsd: 0.42, durationMs: 75000 })), "$0.42 · 1 min 15 s");
  assert.equal(model.costTimeText(session({ costUsd: null, durationMs: null })), null);
  assert.equal(model.costTimeText(session({ costUsd: 0, durationMs: 441 })), "0.4 s", "nothing spent: no $0.0000");
});

test("items: most urgent first, a day for what finished, dismissed ones left out, each in its project's space", () => {
  const now = 10 * 24 * H;
  const working = session({ updatedAt: now - 5 });
  const needs = session({ state: "needs_you", updatedAt: now - 50, endedAt: now - 50 });
  const failed = session({ state: "failed", reason: "x", updatedAt: now - 10, endedAt: now - 10 });
  const done = doneSession({ updatedAt: now - 1, endedAt: now - 1 });
  const old = doneSession({ updatedAt: now - 25 * H, endedAt: now - 25 * H });
  const oldWorking = session({ updatedAt: now - 30 * H });
  const noProject = session({ projectId: null });
  const items = model.presenceItems([done, working, old, failed, needs, oldWorking, noProject], { now, spaceOf: id => (id === "p_harbor" ? SPACE_A : null) });
  assert.deepEqual(items.map(item => item.id), [needs.id, failed.id, working.id, oldWorking.id, done.id]);
  assert.equal(items[0].spaceUuid, SPACE_A);
  assert.equal(items[0].phase, "wait");
  const hidden = model.presenceItems([done, working], { now, hidden: item => item.id === done.id });
  assert.deepEqual(hidden.map(item => item.id), [working.id]);
  assert.equal(model.strongestFor(items, "p_harbor").id, needs.id);
  assert.equal(model.strongestFor(items, "p_other"), null);
});

test("a dismissal hides a session until a later phase, or until it waits on you again", () => {
  const atRun = { phase: "run", at: 100 };
  assert.equal(model.dismissalHides(atRun, "working"), true);
  assert.equal(model.dismissalHides(atRun, "needs_you"), false, "a hidden run that now needs you comes back");
  assert.equal(model.dismissalHides(atRun, "done"), false, "and its result comes back");
  const atEnd = { phase: "end", at: 100 };
  for (const state of ["working", "needs_you", "done", "failed", "stopped"]) assert.equal(model.dismissalHides(atEnd, state, { waitingSince: 50 }), true, state);
  const atWait = { phase: "wait", at: 100 };
  assert.equal(model.dismissalHides(atWait, "needs_you", { waitingSince: 90 }), true);
  assert.equal(model.dismissalHides(atWait, "needs_you", { waitingSince: 150 }), false, "a new wait after the dismissal shows again");
  assert.equal(model.dismissalHides(atWait, "done"), false);
  assert.equal(model.dismissalHides(null, "working"), false);
});

// ---------------------------------------------------------------- icons

test("the agent's mark: our own glyph per agent, one badge per state, amber and red only for needs you and failed", () => {
  for (const client of ["claude-code", "codex", "antigravity", "unknown"]) {
    for (const state of [null, "starting", "working", "needs_you", "done", "failed", "stopped"]) {
      const svg = agentIconSvg(client, state);
      assert.match(svg, /^<svg xmlns="http:\/\/www\.w3\.org\/2000\/svg" viewBox="0 0 16 16"/u);
      assert.match(svg, /prefers-color-scheme:dark/u, "it follows the dark scheme by itself");
      assert.doesNotMatch(svg, /<script|href=|url\(|animate/iu, "nothing loads or moves");
      assert.equal((svg.match(/class="amber"/gu) ?? []).length, state === "needs_you" ? 1 : 0);
      assert.equal((svg.match(/class="red"/gu) ?? []).length, state === "failed" ? 1 : 0);
    }
  }
  assert.notEqual(agentIconSvg("claude-code", "done"), agentIconSvg("codex", "done"));
  assert.match(agentIcon("codex", "needs_you"), /^data:image\/svg\+xml,%3Csvg/u);
  assert.equal(agentIcon("codex", "needs_you"), agentIcon("codex", "needs_you"), "cached");
});

// ---------------------------------------------------------------- hub

test("the hub hands a new wait to one window, the focused or last used one, once; the end of the wait to all", () => {
  let now = 1000;
  const hub = createPresenceHub({ clock: () => now });
  const seen = { a: [], b: [], endA: [], endB: [] };
  let usedA = 10, usedB = 20;
  const offA = hub.registerWindow({ usedAt: () => usedA, handlers: { "needs-you": s => seen.a.push(s.id), "needs-you-ended": s => seen.endA.push(s.id) } });
  const offB = hub.registerWindow({ usedAt: () => usedB, handlers: { "needs-you": s => seen.b.push(s.id), "needs-you-ended": s => seen.endB.push(s.id) } });
  const run = session();
  assert.equal(hub.observe(run), null, "working is no interrupt");
  assert.equal(hub.observe(session({ ...run, state: "needs_you" })), "entered");
  assert.equal(hub.observe(session({ ...run, state: "needs_you" })), null, "the same wait, heard from another window, again: nothing");
  assert.deepEqual([seen.a, seen.b], [[], [run.id]], "one toast, in the window used last");
  usedA = 30;
  const second = session();
  hub.observe(session({ ...second, state: "needs_you" }));
  assert.deepEqual(seen.a, [second.id]);
  hub.observe(session({ ...run, state: "working" }));
  assert.deepEqual([seen.endA, seen.endB], [[run.id], [run.id]], "every window can take its toast away");
  // Done never interrupts.
  hub.observe(doneSession({ id: run.id }));
  assert.equal(seen.a.length + seen.b.length, 2);
  // Sessions there before a view started: no burst of old waits.
  const old = session({ state: "needs_you" });
  hub.baseline([old]);
  assert.equal(hub.observe(old), null);
  // A result dismissed for good never interrupts, even if it says it waits again.
  const ended = doneSession();
  hub.observe(ended);
  hub.dismiss(ended);
  now = 2000;
  offA(); offB();
  assert.equal(hub.windowCount(), 0);
  assert.equal(hub.isHidden(ended), false, "everything resets when the last window leaves");
});

test("the hub's dismissals and seen marks are shared, and handOnce/claim let exactly one window act", () => {
  const hub = createPresenceHub({ clock: () => 500 });
  let changes = 0;
  hub.onChange(() => changes++);
  const handed = [];
  hub.registerWindow({ usedAt: () => 1, handlers: { proof: s => handed.push(["one", s.id]) } });
  hub.registerWindow({ usedAt: () => 2, handlers: { proof: s => handed.push(["two", s.id]) } });
  assert.equal(hub.windowCount(), 0, "no window shows agent presence: proof marks alone do not count");
  hub.registerWindow({ usedAt: () => 99, handlers: {} });
  assert.equal(hub.windowCount(), 1);
  assert.equal(hub.registrations(), 3);
  const done = doneSession();
  hub.dismiss(done);
  assert.equal(hub.isHidden(done), true);
  assert.equal(hub.isHidden(session({ id: done.id })), true, "a later run state of a dismissed result stays hidden (it cannot go back)");
  hub.markSeen(done);
  assert.equal(hub.isSeen(done), true);
  assert.equal(hub.isSeen(session({ id: done.id })), false, "seen is per state");
  assert.equal(changes, 2);
  assert.equal(hub.handOnce("proof", done.id, done), true);
  assert.equal(hub.handOnce("proof", done.id, done), false);
  assert.deepEqual(handed, [["two", done.id]], "the window used last among those that handle it");
  assert.equal(hub.claim("proof", "x"), true);
  assert.equal(hub.claim("proof", "x"), false);
  assert.equal(hub.handOnce("proof", "x", done), false);
  assert.equal(hub.handOnce("nobody", "y", done), false, "nobody handles it: not taken");
});

// ---------------------------------------------------------------- the live view

test("the view follows ctx.agents, watches sessions started elsewhere while it lives, and ends with the experiment", async () => {
  const h = presenceWindow();
  const run = session();
  const agents = fakeAgents([run]);
  const services = fakeServices([project(), project({ id: "p_atlas", name: "Atlas", root: "/synthetic/atlas", space: SPACE_B })]);
  const ctx = context(h, { agents, services });
  const hub = createPresenceHub();
  const source = watchPresence(h.window, ctx, { hub });
  const heard = [];
  source.subscribe(change => heard.push(change));
  assert.equal(agents.calls.watch, 1);
  assert.deepEqual(source.items().map(item => item.id), [run.id]);
  assert.equal(source.projectsLoaded(), false);
  await settle();
  assert.equal(source.projectsLoaded(), true);
  assert.equal(source.items()[0].spaceUuid, SPACE_A, "its space, once projects are read");
  const atlas = agents.emit(session({ projectId: "p_atlas", projectName: "Atlas", state: "needs_you" }));
  agents.emit(session({ ...run, step: "Reading styles.css" }));
  await settle();
  const last = heard.at(-1);
  assert.deepEqual(last.sessions.map(item => item.id), [atlas.id, run.id], "every changed snapshot, in one batch");
  assert.deepEqual(source.itemsOfSpace(SPACE_B).map(item => item.id), [atlas.id]);
  assert.equal(source.strongestFor("p_harbor").subtitle, "Claude Code · working: reading styles.css");
  hub.dismiss(source.session(atlas.id));
  await settle();
  assert.deepEqual(source.items().map(item => item.id), [run.id], "a dismissal anywhere hides it here");
  agents.remove(run.id);
  await settle();
  assert.deepEqual(source.items(), []);
  ctx.turnOff();
  assert.equal(agents.calls.released, 1, "external watching ends with the experiment");
  assert.equal(agents.listenerCount(), 0);
  assert.equal(services.listenerCount(), 0);
});

// ---------------------------------------------------------------- attention

test("needs you raises one calm toast naming agent, project and question, with one way back; done never does", async () => {
  const h = presenceWindow();
  const agents = fakeAgents();
  const ctx = context(h, { agents });
  const hub = createPresenceHub();
  const source = watchPresence(h.window, ctx, { hub });
  const cards = [];
  installAttention(h.window, ctx, { source, hub, showCard: (s, event, error) => cards.push([s.id, error]) });
  const run = agents.emit(session());
  await settle();
  agents.emit(doneSession({ id: run.id }));
  await settle();
  assert.equal(ctx.toasts.length, 0, "working and done stay quiet");
  const waiting = agents.emit(session({ state: "needs_you", reason: "Claude Code wanted to go further (writing outside.txt). Continue in Terminal to decide." }));
  await settle();
  assert.equal(ctx.toasts.length, 1);
  const toast = ctx.toasts[0];
  assert.equal(toast.title, "Claude Code needs you in Harbor");
  assert.equal(toast.description, "Claude Code wanted to go further (writing outside.txt).", "one short line; the button says how to answer");
  assert.equal(toast.button.label, "Continue in Terminal", "a run started here continues in Terminal");
  assert.equal(toast.timeoutMs, NEEDS_YOU_TOAST_MS);
  toast.button.onCommand({ isTrusted: true });
  await settle();
  assert.deepEqual(agents.calls.continue, [{ id: waiting.id, trusted: true }]);
  // Elsewhere: Show, which opens the card.
  const elsewhere = agents.emit(session({ origin: "external", source: "poll", state: "needs_you", reason: "Waiting for you: permission prompt." }));
  await settle();
  assert.equal(ctx.toasts[1].button.label, "Show");
  ctx.toasts[1].button.onCommand({ isTrusted: true });
  assert.deepEqual(cards, [[elsewhere.id, null]]);
  // A hand-over that fails says why, in the card.
  agents.failContinue = "Terminal could not be opened.";
  agents.emit(session({ ...waiting, state: "working" }));
  await settle();
  agents.emit(session({ ...waiting, state: "needs_you" }));
  await settle();
  ctx.toasts.at(-1).button.onCommand({ isTrusted: true });
  await settle();
  assert.deepEqual(cards.at(-1), [waiting.id, "Terminal could not be opened."]);
  assert.deepEqual(needsYouToast(session({ projectName: null, reason: null, origin: "external" })).title, "Claude Code needs you in A project");
  ctx.turnOff();
});

test("with two windows, only the one used last shows the toast", async () => {
  const hub = createPresenceHub();
  const agents = fakeAgents();
  const one = presenceWindow({ hasFocus: false }), two = presenceWindow({ hasFocus: false });
  const ctxOne = context(one, { agents }), ctxTwo = context(two, { agents });
  let now = 0;
  for (const [h, ctx] of [[one, ctxOne], [two, ctxTwo]]) {
    const source = watchPresence(h.window, ctx, { hub });
    installAttention(h.window, ctx, { source, hub, showCard: () => {}, clock: () => ++now });
  }
  one.fireWindow("activate");
  agents.emit(session({ state: "needs_you" }));
  await settle();
  assert.deepEqual([ctxOne.toasts.length, ctxTwo.toasts.length], [1, 0]);
  two.setFocus(true);
  agents.emit(session({ state: "needs_you" }));
  await settle();
  assert.deepEqual([ctxOne.toasts.length, ctxTwo.toasts.length], [1, 1], "a focused window wins");
  ctxOne.turnOff(); ctxTwo.turnOff();
  assert.equal(hub.windowCount(), 0);
});

// ---------------------------------------------------------------- the result card

test("card actions: Reload only for changed files and the project's own tab, Continue in Terminal first when it needs you", () => {
  const tab = { linkedBrowser: { currentURI: { spec: "http://localhost:5173/billing" } } };
  const ids = list => list.map(action => `${action.id}${action.primary ? "*" : ""}`);
  assert.deepEqual(ids(cardActions(doneSession(), { reloadTab: tab })), ["dismiss", "terminal", "reload*"]);
  assert.equal(cardActions(doneSession(), { reloadTab: tab }).at(-1).label, "Reload Harbor");
  assert.equal(cardActions(doneSession(), { reloadTab: tab }).at(-1).title, "Reload localhost:5173");
  assert.equal(cardActions(doneSession(), { reloadTab: tab, overTab: tab }).at(-1).label, "Reload page");
  assert.deepEqual(ids(cardActions(doneSession({ files: { byRun: [] } }), { reloadTab: tab })), ["dismiss", "terminal"], "nothing changed: no reload");
  assert.deepEqual(ids(cardActions(doneSession(), {})), ["dismiss", "terminal"], "no tab of the project: no reload");
  assert.deepEqual(ids(cardActions(session({ state: "needs_you" }), { reloadTab: tab })), ["dismiss", "terminal*"]);
  assert.deepEqual(ids(cardActions(session(), {})), ["dismiss", "stop", "terminal"]);
  assert.deepEqual(ids(cardActions(session({ stopping: true }), {})), ["dismiss", "stop", "terminal"]);
  assert.equal(cardActions(session({ stopping: true }), {})[1].disabled, true);
  // Open where it was started: no second terminal, it says where to answer.
  const external = session({ origin: "external", state: "needs_you", canStop: false });
  assert.deepEqual(ids(cardActions(external, {})), ["dismiss"]);
  assert.equal(elsewhereNote(external), "It is open where it was started. Answer it in Claude Code there.");
  assert.deepEqual(ids(cardActions(doneSession({ origin: "external" }), {})), ["dismiss", "terminal"]);
  assert.deepEqual(ids(cardActions(doneSession({ canResume: false }), {})), ["dismiss"]);
  assert.deepEqual(ids(cardActions(doneSession(), { claudeApp: true })), ["dismiss", "claude-app", "terminal"]);
  assert.deepEqual(ids(cardActions(doneSession(), { claudeApp: true, reloadTab: tab })), ["dismiss", "terminal", "reload*"], "three buttons at most");
  assert.deepEqual(ids(cardActions(session({ state: "needs_you" }), { claudeApp: true })), ["dismiss", "claude-app", "terminal*"]);
  assert.deepEqual(ids(cardActions(doneSession({ client: "codex" }), { claudeApp: true })), ["dismiss", "terminal"]);
});

test("the card shows the agent's sentence, its files and cost, follows the run live, and its actions go through ctx.agents", async () => {
  const h = presenceWindow();
  const page = h.addTab({ url: "http://localhost:5173/billing", label: "Harbor · Billing settings" });
  const run = session();
  const agents = fakeAgents([run]);
  agents.claudeApp = true;
  const ctx = context(h, { agents });
  const hub = createPresenceHub();
  const source = watchPresence(h.window, ctx, { hub });
  await settle();
  const card = openResultCard(h.window, ctx, { source, hub, sessionId: run.id, place: { browser: page.linkedBrowser }, overTab: page });
  assert.ok(card);
  assert.equal(openCardOf(h.window), card);
  assert.equal(card.node.querySelector(".axiosozo-lab-card-title").textContent, "Harbor · fix the retry button");
  assert.equal(card.node.querySelector(".axiosozo-presence-status").textContent, "Claude Code · working");
  assert.equal(card.node.querySelector(".axiosozo-presence-lead").textContent, "Editing index.html…");
  assert.deepEqual(labels(card), ["Dismiss", "Stop", "Continue in Terminal"]);
  press(card, "Stop");
  await settle();
  assert.deepEqual(agents.calls.stop, [run.id]);
  agents.emit(doneSession({ id: run.id }));
  await settle();
  assert.equal(card.node.querySelector(".axiosozo-presence-status").textContent, "Claude Code · done");
  assert.equal(card.node.querySelector(".axiosozo-presence-lead").textContent, "Fixed the retry handler.");
  assert.equal(card.node.querySelector(".axiosozo-presence-files").textContent, "Changed index.html · 1 file changed, 1 insertion(+), 1 deletion(-)");
  assert.equal(card.node.querySelector(".axiosozo-presence-meta").textContent, "$0.0010 · 3.6 s");
  assert.deepEqual(labels(card), ["Dismiss", "Continue in Terminal", "Reload page"], "with a Reload to offer, the Claude app waits");
  assert.equal(hub.isSeen(source.session(run.id)), true, "a result whose card was open is seen");
  press(card, "Reload page");
  assert.deepEqual(h.reloads, [page], "reloads that tab, on the click only");
  assert.equal(card.isOpen, true);
  press(card, "Continue in Terminal");
  await settle();
  assert.deepEqual(agents.calls.continue, [{ id: run.id, trusted: true }]);
  assert.equal(card.isOpen, false, "handed over: the card goes");
  // A failing hand-over says why in the card; Dismiss hides it everywhere and clears a finished run.
  const again = openResultCard(h.window, ctx, { source, hub, sessionId: run.id, place: { browser: page.linkedBrowser }, overTab: page });
  agents.failContinue = "This session cannot be continued yet.";
  press(again, "Continue in Terminal");
  await settle();
  assert.equal(again.node.querySelector(".axiosozo-presence-error").textContent, "This session cannot be continued yet.");
  assert.equal(again.node.querySelector(".axiosozo-presence-error").getAttribute("role"), "alert");
  press(again, "Dismiss");
  assert.equal(hub.isHidden(source.session(run.id)), true);
  assert.deepEqual(agents.calls.dismiss, [run.id]);
  assert.equal(again.isOpen, false);
  ctx.turnOff();
});

test("one card per window; it closes with the experiment; beside the sidebar it sits right of it, or left for a right-hand sidebar", async () => {
  const h = presenceWindow();
  h.addTab({ url: "https://example.com/" });
  const a = session(), b = session();
  const agents = fakeAgents([a, b]);
  const ctx = context(h, { agents });
  const hub = createPresenceHub();
  const source = watchPresence(h.window, ctx, { hub });
  const row = h.document.createElement("li");
  row._rect = { x: 10, y: 200, left: 10, top: 200, width: 220, height: 36, right: 230, bottom: 236 };
  const place = besideSidebar(h.window, row);
  assert.deepEqual(place, { anchor: { x: 248, y: 192, width: 0, height: 0 }, align: "start" }, "right of the sidebar, level with the row");
  const first = openResultCard(h.window, ctx, { source, hub, sessionId: a.id, place });
  assert.equal(first.node.getAttribute("data-fixed"), "true");
  const second = openResultCard(h.window, ctx, { source, hub, sessionId: b.id, place });
  assert.equal(first.isOpen, false);
  assert.equal(second.isOpen, true);
  assert.equal(openResultCard(h.window, ctx, { source, hub, sessionId: "lab-unknown", place }), null);
  const right = presenceWindow({ prefs: { "zen.tabs.vertical.right-side": true } });
  right.toolbox._rect = { x: 960, y: 0, left: 960, top: 0, width: 240, height: 800, right: 1200, bottom: 800 };
  row._rect = { x: 970, y: 100, left: 970, top: 100, width: 220, height: 36, right: 1190, bottom: 136 };
  assert.deepEqual(besideSidebar(right.window, row), { anchor: { x: 952, y: 92, width: 0, height: 0 }, align: "end" });
  ctx.turnOff();
  assert.equal(second.isOpen, false);
});

// ---------------------------------------------------------------- tabs

test("a project's local page and its open tabs; Zen's tab sublabel set and put back as it was", () => {
  const h = presenceWindow();
  h.addTab({ url: "https://news.example/" });
  const harbor = project();
  assert.equal(tabs.localUrlOf(harbor), "http://localhost:5173/");
  assert.equal(tabs.localUrlOf(project({ local: null })), null);
  assert.equal(tabs.localUrlOf({ manifest: { environments: [], services: [{ name: "web", url: "http://127.0.0.1:3000/app" }] } }), "http://127.0.0.1:3000/app");
  assert.equal(tabs.projectHomeUrl(harbor), "about:axiosozo#project=p_harbor");
  const old = h.addTab({ url: "http://localhost:5173/", select: false });
  old.lastAccessed = 5;
  const other = h.addTab({ url: "https://harbor.example/", select: false });
  const recent = h.addTab({ url: "http://localhost:5173/billing", select: false });
  recent.lastAccessed = 9;
  const item = h.addTab({ url: "http://localhost:5173/", select: false });
  item.setAttribute(tabs.LIVE_ITEM_ATTRIBUTE, "f:lab-1");
  assert.deepEqual(tabs.projectTabs(h.window, "p_harbor", [harbor]), [recent, old], "local pages only, never a Lab item, most recent first");
  h.select(old);
  assert.deepEqual(tabs.projectTabs(h.window, "p_harbor", [harbor]), [old, recent], "the selected one first");
  assert.equal(tabs.projectIdOfTab(other, [harbor]), null, "production is not the local page");
  const serverOnly = { id: "p_atlas", context_uuid: SPACE_A, manifest: { environments: [], services: [{ name: "web", url: "http://localhost:3000/" }] } };
  const atlasTab = h.addTab({ url: "http://127.0.0.1:3000/dashboard", select: false });
  assert.equal(tabs.projectIdOfTab(atlasTab, [harbor, serverOnly]), "p_atlas", "a project with only a local server declared: by its port");
  assert.equal(tabs.projectIdOfTab(h.addTab({ url: "http://localhost:3001/", select: false }), [harbor, serverOnly]), null);
  assert.equal(tabs.hostOfTab(recent), "localhost:5173");
  // The sublabel: Zen's attribute and its label's l10n arguments, restored afterwards.
  tabs.setTabSubtitle(h.window, old, "To verify");
  assert.equal(old.getAttribute(tabs.SUBLABEL_ATTRIBUTE), "To verify");
  assert.deepEqual(old.querySelector(".zen-tab-sublabel").l10nArgs, { tabSubtitle: "To verify" });
  tabs.clearTabSubtitle(h.window, old);
  assert.equal(old.hasAttribute(tabs.SUBLABEL_ATTRIBUTE), false);
  assert.deepEqual(old.querySelector(".zen-tab-sublabel").l10nArgs, { tabSubtitle: "zen-default-pinned" });
  recent.setAttribute(tabs.SUBLABEL_ATTRIBUTE, "Shared with you");
  tabs.setTabSubtitle(h.window, recent, "To verify");
  tabs.clearTabSubtitle(h.window, recent);
  assert.equal(recent.getAttribute(tabs.SUBLABEL_ATTRIBUTE), "Shared with you", "someone else's line comes back");
  assert.equal(tabs.tabIsLoaded(old), true);
  assert.equal(tabs.tabIsLoaded(h.makeTab({ lazy: true })), false);
});
