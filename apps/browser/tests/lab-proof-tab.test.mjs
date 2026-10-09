/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. https://mozilla.org/MPL/2.0/ */

// Lab "proof-tab": a finished run that changed a web project marks that
// project's page "To verify" (an open tab, never reloaded on its own, else a
// new background tab); selecting it shows the strip: what the agent said,
// the console since the page loaded, Looks right, Not right… (a follow-up
// task with a picture of the page). One window acts; off clears everything.
import test from "node:test";
import assert from "node:assert/strict";
import "./support/chrome-modules.mjs";
import { labContext } from "./support/lab-harness.mjs";
import { SPACE_A, HARBOR_ROOT, doneSession, fakeAdapter, fakeAgents, fakeServices, presenceWindow, project, session, settle }
  from "./support/lab-presence-fakes.mjs";

const { installProofTab, followUpTask, outgoingSentence, consoleLine, VERIFY_TEXT, PROOF_ATTRIBUTE, MAX_NOTE } = await import("../chrome/lab/proof-tab/proof-tab.sys.mjs");
const { createPresenceHub } = await import("../chrome/lab/presence/hub.sys.mjs");

const PNG = { type: "image/png", data: new Uint8Array([137, 80, 78, 71]) };
const CONSOLE = { count: 2, recent: [{ level: "warning", text: "Deprecated API" }, { level: "error", text: "Stripe: card_declined for invoice INV-2041" }] };
const strip = h => h.document.querySelector(".axiosozo-proof-strip");
const buttonsOf = node => node.querySelectorAll("button").filter(item => !item.className.includes("axiosozo-lab-card-close"));
const press = (node, label) => { const button = buttonsOf(node).find(item => item.textContent === label); assert.ok(button, `a "${label}" button`); button.click(); };

function setup({ sessions = [], openTab = true, consoleErrors = CONSOLE, hub = createPresenceHub(), h = presenceWindow(), agents = fakeAgents(sessions),
  services = fakeServices([project()], { consoleErrors }) } = {}) {
  const other = h.addTab({ url: "https://news.example/", label: "News" });
  const harbor = openTab ? h.addTab({ url: "http://localhost:5173/billing", label: "Harbor · Billing settings", select: false }) : null;
  const ctx = labContext(h.window, { id: "proof-tab", agents, services, adapter: fakeAdapter() });
  const captures = [];
  const handle = installProofTab(h.window, ctx, { hub, capture: async (_window, tab) => { captures.push(tab); return { image: PNG }; } });
  return { h, ctx, agents, services, hub, handle, other, harbor, captures };
}

test("a finished run that changed Harbor marks Harbor's open tab To verify, without reloading it", async () => {
  const t = setup();
  await settle();
  const run = t.agents.emit(session());
  await settle();
  assert.equal(t.harbor.hasAttribute(PROOF_ATTRIBUTE), false, "a run still working marks nothing");
  t.agents.emit(doneSession({ id: run.id }));
  await settle();
  assert.equal(t.harbor.getAttribute("zen-show-sublabel"), VERIFY_TEXT);
  assert.deepEqual(t.harbor.querySelector(".zen-tab-sublabel").l10nArgs, { tabSubtitle: "To verify" });
  assert.equal(t.harbor.getAttribute(PROOF_ATTRIBUTE), "verify");
  assert.equal(t.harbor.getAttribute("aria-description"), "To verify: Claude Code finished. Changed index.html.");
  assert.deepEqual(t.h.reloads, [], "never reloaded on its own");
  assert.equal(t.h.gBrowser.selectedTab, t.other, "and not brought to the front");
  assert.equal(strip(t.h), null, "the strip waits until the tab is selected");
  t.ctx.turnOff();
});

test("selecting it shows the strip: the agent's words, its files, the console since the page loaded, Reload while it is stale", async () => {
  const t = setup();
  await settle();
  t.agents.emit(doneSession());
  await settle();
  t.h.select(t.harbor);
  await settle();
  const node = strip(t.h);
  assert.ok(node);
  assert.equal(node.parentNode, t.harbor.linkedBrowser.parentNode, "over the page, never inside it");
  assert.equal(node.querySelector(".axiosozo-lab-card-title").textContent, "To verify");
  assert.equal(node.querySelector(".axiosozo-presence-status").textContent, "Claude Code · Harbor · fix the retry button");
  assert.equal(node.querySelector(".axiosozo-presence-lead").textContent, "Fixed the retry handler.");
  assert.equal(node.querySelector(".axiosozo-presence-files").textContent, "Changed index.html");
  const notes = node.querySelectorAll(".axiosozo-presence-note").map(item => item.textContent);
  assert.deepEqual(notes, ["2 console messages on Harbor's pages since they loaded, the newest:", "This page was open before the change. Reload it to see it."]);
  assert.deepEqual(node.querySelectorAll(".axiosozo-proof-console").map(item => item.textContent), ["Stripe: card_declined for invoice INV-2041"], "errors, not warnings");
  assert.deepEqual(buttonsOf(node).map(item => item.textContent), ["Reload", "Not right…", "Looks right"]);
  assert.equal(t.services.homes.length, 1, "the console owner's count, through the project home");
  press(node, "Reload");
  assert.deepEqual(t.h.reloads, [t.harbor], "on the click only");
  // The page reloaded (or the dev server refreshed it): the strip comes back without the stale line.
  t.h.commit(t.harbor, "http://localhost:5173/billing");
  await new Promise(resolve => setTimeout(resolve, 450));
  await settle();
  const again = strip(t.h);
  assert.ok(again);
  assert.deepEqual(buttonsOf(again).map(item => item.textContent), ["Not right…", "Looks right"]);
  assert.equal(again.querySelectorAll(".axiosozo-presence-note").some(item => item.textContent.startsWith("This page was open")), false);
  t.ctx.turnOff();
});

test("Looks right clears the mark and the agent's result everywhere", async () => {
  const t = setup();
  await settle();
  const done = t.agents.emit(doneSession());
  await settle();
  t.h.select(t.harbor);
  await settle();
  press(strip(t.h), "Looks right");
  assert.equal(t.harbor.hasAttribute("zen-show-sublabel"), false);
  assert.equal(t.harbor.hasAttribute(PROOF_ATTRIBUTE), false);
  assert.equal(t.harbor.hasAttribute("aria-description"), false);
  assert.equal(strip(t.h), null);
  assert.equal(t.hub.isHidden(done), true, "the presence views drop it too");
  assert.deepEqual(t.agents.calls.dismiss, [done.id]);
  t.ctx.turnOff();
});

test("without an open tab of the project, its page opens in a new background tab in its space, marked", async () => {
  const t = setup({ openTab: false });
  await settle();
  t.agents.emit(doneSession());
  await settle();
  assert.equal(t.h.added.length, 1);
  const [{ url, options, tab }] = t.h.added;
  assert.equal(url, "http://localhost:5173/");
  assert.equal(options.inBackground, true);
  assert.equal(options.zenWorkspaceId, SPACE_A);
  assert.equal(options.skipRoute, true, "Zen's space routing does not move it");
  assert.equal(options.triggeringPrincipal.isSystemPrincipal, false, "a web page, opened as a web link would be");
  assert.equal(t.h.gBrowser.selectedTab, t.other, "it never takes the front");
  assert.equal(tab.getAttribute("zen-show-sublabel"), VERIFY_TEXT);
  t.h.select(tab);
  await settle();
  assert.deepEqual(buttonsOf(strip(t.h)).map(item => item.textContent), ["Not right…", "Looks right"], "a fresh page: nothing to reload");
  t.ctx.turnOff();
});

test("Not right… sends one line to the same agent in the same project, with a picture of the page, after saying what goes", async () => {
  const t = setup();
  await settle();
  const done = t.agents.emit(doneSession());
  await settle();
  t.h.select(t.harbor);
  await settle();
  press(strip(t.h), "Not right…");
  const node = strip(t.h);
  const input = node.querySelector(".axiosozo-proof-input");
  assert.ok(input);
  assert.equal(input.getAttribute("maxlength"), String(MAX_NOTE));
  assert.equal(node.querySelector(".axiosozo-proof-label").textContent, "What is not right?");
  assert.equal(node.querySelector(".axiosozo-presence-note").textContent,
    "Your note, a picture of the visible page, its address and 1 console error go to Claude Code.");
  // Nothing typed: nothing sent.
  press(node, "Send to Claude Code");
  await settle();
  assert.deepEqual(t.agents.calls.start, []);
  const followUp = session({ state: "starting", step: null });
  t.agents.willStart(followUp);
  input.value = "The button still does nothing when I click it";
  press(node, "Send to Claude Code");
  await settle();
  assert.equal(t.agents.calls.start.length, 1);
  const [request] = t.agents.calls.start;
  assert.equal(request.trusted, true, "from the user's own click");
  assert.equal(request.client, "claude-code");
  assert.equal(request.projectRoot, HARBOR_ROOT);
  assert.equal(request.image, PNG);
  assert.equal(request.pageUrl, "http://localhost:5173/billing");
  assert.equal(request.title, "Harbor · Billing settings");
  assert.deepEqual(request.consoleErrors, ["Stripe: card_declined for invoice INV-2041"]);
  assert.match(request.task, /^The button still does nothing when I click it\n\nThis follows an earlier task in this project: "fix the retry button"\./u);
  assert.match(request.task, /Afterwards the agent said: "Fixed the retry handler\."/u);
  assert.deepEqual(t.captures, [t.harbor]);
  assert.equal(strip(t.h), null);
  assert.equal(t.harbor.getAttribute("zen-show-sublabel"), "Claude Code is working");
  assert.equal(t.harbor.getAttribute(PROOF_ATTRIBUTE), "working");
  assert.equal(t.hub.isHidden(done), true, "the old result is superseded");
  // The follow-up lands: done first, its files a moment later (as the service reads them); then To verify again, with its words.
  t.agents.emit(doneSession({ id: followUp.id, summary: "Bound the handler to #retry.", files: null }));
  await settle();
  assert.equal(t.harbor.getAttribute("zen-show-sublabel"), "Claude Code is working", "still waiting for its files");
  t.agents.emit(doneSession({ id: followUp.id, summary: "Bound the handler to #retry." }));
  await settle();
  assert.equal(t.harbor.getAttribute("zen-show-sublabel"), VERIFY_TEXT);
  assert.equal(strip(t.h).querySelector(".axiosozo-presence-lead").textContent, "Bound the handler to #retry.");
  t.ctx.turnOff();
});

test("a follow-up that cannot start says why; one that ends without changes takes its line away", async () => {
  const t = setup();
  await settle();
  t.agents.emit(doneSession());
  await settle();
  t.h.select(t.harbor);
  await settle();
  press(strip(t.h), "Not right…");
  t.agents.failStart = "Claude Code is already working in Harbor.";
  strip(t.h).querySelector(".axiosozo-proof-input").value = "Still broken";
  press(strip(t.h), "Send to Claude Code");
  await settle();
  assert.equal(strip(t.h).querySelector(".axiosozo-presence-error").textContent, "Claude Code is already working in Harbor.");
  assert.equal(t.harbor.getAttribute(PROOF_ATTRIBUTE), "verify", "still to verify");
  t.agents.failStart = null;
  const followUp = session({ state: "starting" });
  t.agents.willStart(followUp);
  strip(t.h).querySelector(".axiosozo-proof-input").value = "Still broken";
  press(strip(t.h), "Send to Claude Code");
  await settle();
  t.agents.emit(session({ id: followUp.id, state: "failed", reason: "Claude Code is out of its 5-hour limit until 23:30." }));
  await settle();
  assert.equal(t.harbor.hasAttribute("zen-show-sublabel"), false);
  assert.equal(t.harbor.hasAttribute(PROOF_ATTRIBUTE), false);
  t.ctx.turnOff();
});

test("nothing to verify: runs already done when it was turned on, runs elsewhere, look-only runs, runs without changes, non-web projects", async () => {
  const before = doneSession();
  const t = setup({ sessions: [before], openTab: true });
  t.services.projects.push(project({ id: "p_cli", name: "Cli", root: "/synthetic/cli", local: null }));
  await settle();
  t.agents.emit(doneSession({ id: before.id, summary: "Again." }));
  t.agents.emit(doneSession({ origin: "external", source: "poll" }));
  t.agents.emit(doneSession({ mayEdit: false }));
  t.agents.emit(doneSession({ files: { byRun: [], changed: [], already: 2, summary: null } }));
  t.agents.emit(doneSession({ projectId: "p_cli", projectName: "Cli" }));
  t.agents.emit(session({ state: "needs_you" }));
  await settle();
  assert.equal(t.harbor.hasAttribute(PROOF_ATTRIBUTE), false);
  assert.deepEqual(t.h.added, []);
  assert.equal(t.agents.calls.watch, 0, "sessions started elsewhere are not watched: their files are unknown");
  t.ctx.turnOff();
});

test("with two windows, one marks a run: the one used last", async () => {
  const hub = createPresenceHub();
  const agents = fakeAgents();
  const services = fakeServices([project()], { consoleErrors: null });
  const one = setup({ hub, agents, services, h: presenceWindow({ hasFocus: false }) });
  const two = setup({ hub, agents, services, h: presenceWindow({ hasFocus: true }) });
  await settle();
  agents.emit(doneSession());
  await settle();
  assert.equal(one.harbor.hasAttribute(PROOF_ATTRIBUTE), false);
  assert.equal(two.harbor.getAttribute(PROOF_ATTRIBUTE), "verify");
  two.h.select(two.harbor);
  await settle();
  assert.equal(strip(two.h).querySelectorAll(".axiosozo-presence-note").some(item => /console/u.test(item.textContent)), false,
    "the console owner cannot tell: nothing is said about the console");
  one.ctx.turnOff(); two.ctx.turnOff();
  assert.equal(hub.registrations(), 0);
});

test("off means gone: marks, the strip, listeners; tabs it opened stay as ordinary tabs", async () => {
  const t = setup({ openTab: false });
  await settle();
  t.agents.emit(doneSession());
  await settle();
  const [{ tab }] = t.h.added;
  t.h.select(tab);
  await settle();
  assert.ok(strip(t.h));
  const before = t.h.tabListenerCount();
  t.ctx.turnOff();
  assert.equal(strip(t.h), null);
  assert.equal(tab.hasAttribute("zen-show-sublabel"), false);
  assert.equal(tab.hasAttribute(PROOF_ATTRIBUTE), false);
  assert.ok(t.h.gBrowser.tabs.includes(tab));
  assert.equal(t.h.progress.size, 0);
  assert.ok(t.h.tabListenerCount() < before);
  assert.equal(t.agents.listenerCount(), 0);
});

test("the follow-up text, the outgoing sentence and the console line", () => {
  const task = followUpTask("  The total is wrong\n", doneSession({ title: "AxioSozo: fix totals" }));
  assert.equal(task, "The total is wrong\n\nThis follows an earlier task in this project: \"fix totals\".\nAfterwards the agent said: \"Fixed the retry handler.\"\n"
    + "Changed index.html.\nThe user looked at the page in the browser and says the result is not right.");
  assert.equal(outgoingSentence("codex", { image: false, consoleErrors: 0 }), "Your note and its address go to Codex.");
  assert.equal(outgoingSentence("claude-code", { image: true, consoleErrors: 3 }), "Your note, a picture of the visible page, its address and 3 console errors go to Claude Code.");
  assert.equal(consoleLine(null, project()), null);
  assert.deepEqual(consoleLine({ count: 0, recent: [] }, project()), { text: "No console messages on Harbor's pages since they loaded.", recent: [] });
  assert.deepEqual(consoleLine({ count: 1, recent: [{ level: "warning", text: "w" }] }, project()), { text: "1 console message on Harbor's pages since they loaded.", recent: [] });
});
