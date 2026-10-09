/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. https://mozilla.org/MPL/2.0/ */

// Lab "Start the task" (chrome/lab/start-task/): both variants in a synthetic
// window with area capture (support/capture-harness.mjs) and a scripted
// ctx.agents that records what it was asked and drives one session. No agent,
// app or Terminal runs here; the platform's own tests cover those
// (lab-agents.test.mjs), and the live run is in docs/lab/experiments/start-task-here.md.
import test from "node:test";
import assert from "node:assert/strict";
import "./support/chrome-modules.mjs";
import { HARBOR, PNG, captureWindow, flush, scriptedAgents, scriptedAi, trusted } from "./support/capture-harness.mjs";
import { labContext } from "./support/lab-harness.mjs";

const S = await import("../chrome/lab/start-task/start-task.sys.mjs");
const C = await import("../chrome/lab/capture-ai/capture-ai.sys.mjs");
const { captureExtensionIds } = await import("../chrome/RegionCapture.sys.mjs");

async function setup({ variant = "here", project = HARBOR, agents = scriptedAgents(), withAi = false } = {}) {
  S.forgetForTesting();
  const h = await captureWindow({ project });
  const ctx = labContext(h.window, { id: `start-task-${variant}`, agents });
  const handle = (variant === "here" ? S.installStartTaskHere : S.installStartTaskInApp)(h.window, ctx);
  let ai = null;
  if (withAi) {
    ai = await scriptedAi({ reply: () => ({ text: "", json: { choices: [{ label: "Retry button does nothing", why: "Banner says so",
      task: "Fix the Retry payment button so it retries invoice INV-2041.", confidence: 0.9 }] } }) });
    C.installCaptureAiAuto(h.window, labContext(h.window, { id: "capture-ai-auto", ai: ai.ai }));
  }
  const section = () => h.bar()?.querySelector(`.axiosozo-region-section[data-extension="${S.EXTENSION_ID}"]`) ?? null;
  const card = () => h.stack.querySelector(".axiosozo-start-task-card");
  return { h, ctx, agents, handle, section, card, ai };
}

// ---- pure parts -------------------------------------------------------------------------------

test("appPrompt: the task, then the page without query or fragment; an empty note gets an opening", () => {
  assert.equal(S.appPrompt({ task: "  Fix the retry button. ", url: "http://localhost:5173/billing?s=1#x", title: "Harbor ·\nBilling" }),
    "Fix the retry button.\n\nPage: http://localhost:5173/billing (\"Harbor · Billing\")");
  assert.equal(S.appPrompt({ task: "", url: "about:blank" }), "Look at the area of this page that I marked.");
});

test("refusalText prefers the platform's reason; costLine is short", () => {
  assert.equal(S.refusalText({ code: "BUSY", reason: "Codex is already working in Harbor." }, "Claude Code"), "Codex is already working in Harbor.");
  assert.equal(S.refusalText({ code: "BUSY" }, "Claude Code"), "Claude Code is already working in this project.");
  assert.match(S.refusalText({ code: "WHATEVER" }, "Codex"), /Codex could not be started\. Nothing was sent\./);
  assert.equal(S.costLine({ durationMs: 3600, costUsd: 0.00104 }), "3.6 s · $0.0010");
  assert.equal(S.costLine({ durationMs: 95000, costUsd: 0.12 }), "2 min · $0.12");
  assert.equal(S.costLine({}), "");
});

// ---- start-task-here ---------------------------------------------------------------------------

test("here: on a project's page the bar offers Start in Claude Code, names the folder verbatim and takes Return", async () => {
  const { h, section } = await setup();
  await h.capture();
  await flush();
  const text = section().textContent;
  assert.match(text, /^Claude Code may edit files in \/synthetic\/repos\/harbor\. The image, the page address and your note go with the task\.$/);
  assert.equal(section().querySelector(".axiosozo-region-caption-path").textContent, HARBOR.root);
  const start = h.button("Start in Claude Code");
  assert.ok(start);
  assert.ok(start.classList.contains("axiosozo-region-primary"), "Start is the main action");
  assert.equal(h.button("Copy for agent").classList.contains("axiosozo-region-primary"), false, "Copy for agent stays, as a plain button");
  assert.equal(h.document.activeElement, h.note(), "focus is in the note: the task needs words");
  assert.deepEqual(h.bar().querySelectorAll(".axiosozo-region-actions button").map(node => node.textContent || node.getAttribute("aria-label")),
    ["Discard capture", "Copy image", "Copy for agent", "Start in Claude Code", "Choose the agent"]);
});

test("here: a page that is not one of the user's projects keeps Copy for agent and says why there is no Start", async () => {
  const { h, section, agents } = await setup({ project: null });
  await h.capture();
  await flush();
  assert.equal(section().textContent, S.NOT_A_PROJECT.here);
  assert.equal(h.button("Start in Claude Code"), null);
  assert.ok(h.button("Copy for agent").classList.contains("axiosozo-region-primary"));
  h.key(h.note(), "Enter");
  assert.equal(h.clipboard.writes.length, 1, "Return still copies");
  assert.equal(agents.calls.startTask.length, 0);
});

test("here: Return with an empty note asks for words and starts nothing", async () => {
  const { h, section, agents } = await setup();
  await h.capture();
  await flush();
  h.key(h.note(), "Enter");
  await flush();
  assert.equal(agents.calls.startTask.length, 0);
  assert.match(section().querySelector('[role="alert"]').textContent, /Say what Claude Code should change, then press Return\./);
  assert.ok(h.overlay(), "the capture stays");
});

test("here: Start sends the task with the picture and the page, the bar becomes a live status, then the result", async () => {
  const { h, agents, card } = await setup();
  await h.capture();
  await flush();
  h.note().value = "The retry button does nothing. Make it retry the invoice.";
  h.key(h.note(), "Enter");
  await flush();
  assert.equal(agents.calls.startTask.length, 1);
  const [request] = agents.calls.startTask;
  assert.equal(request.trigger.isTrusted, true, "the user's own key press");
  assert.equal(request.client, "claude-code");
  assert.equal(request.projectRoot, HARBOR.root);
  assert.equal(request.task, "The retry button does nothing. Make it retry the invoice.");
  assert.deepEqual([...request.image.data], PNG);
  assert.equal(request.image.type, "image/png");
  assert.equal(request.pageUrl, "http://localhost:5173/billing?session=abc#top", "the platform strips query and fragment");
  assert.equal(request.title, "Harbor · Billing settings");
  assert.equal(request.mayEdit, true);
  // The capture ended; a small card took its place.
  assert.equal(h.overlay(), null);
  assert.equal(h.clipboard.writes.length, 0, "nothing was copied");
  assert.ok(card());
  assert.equal(card().querySelector(".axiosozo-lab-card-title").textContent, "Claude Code is working");
  assert.match(card().textContent, /Starting…/);
  assert.match(card().textContent, /“The retry button does nothing\. Make it retry the invoice\.”/);
  agents.emit({ state: "working", step: "Editing index.html" });
  assert.match(card().textContent, /Editing index\.html/);
  // Survives a dev-server reload and clicks elsewhere.
  for (const listener of h.window.gBrowser.progressListeners) listener.onLocationChange?.(h.browser, { isTopLevel: true });
  h.outside();
  assert.ok(card(), "still there");
  h.click(h.button("Stop"));
  assert.deepEqual(agents.calls.stop, ["lab-1"]);
  agents.finish({ state: "done", step: null, summary: "Fixed the retry button's id so its click handler is attached.", canStop: false,
    durationMs: 3600, costUsd: 0.00104,
    files: { changed: [{ path: "index.html", status: "M", byRun: true }], byRun: ["index.html"], already: 0, summary: "1 file changed, 1 insertion(+), 1 deletion(-)" } });
  await flush();
  assert.equal(card().querySelector(".axiosozo-lab-card-title").textContent, "Claude Code is done");
  assert.match(card().textContent, /Fixed the retry button's id so its click handler is attached\./);
  assert.deepEqual(card().querySelectorAll(".axiosozo-start-task-files li").map(node => node.textContent), ["index.html"]);
  assert.match(card().textContent, /1 file changed, 1 insertion\(\+\), 1 deletion\(-\)/);
  assert.match(card().textContent, /3\.6 s · \$0\.0010/);
  h.click(h.button("Continue in Terminal"));
  await flush();
  assert.equal(agents.calls.continueInTerminal[0].id, "lab-1");
  assert.equal(agents.calls.continueInTerminal[0].trigger.isTrusted, true);
});

test("here: Reload this tab is offered only when files changed, and reloads only on the click", async () => {
  const { h, agents, card } = await setup();
  await h.capture();
  await flush();
  h.note().value = "Fix it";
  h.click(h.button("Start in Claude Code"));
  await flush();
  agents.finish({ state: "done", summary: "Nothing needed.", files: { changed: [], byRun: [], already: 0, summary: "" } });
  await flush();
  assert.match(card().textContent, /No files changed\./);
  assert.equal(h.button("Reload this tab"), null);
  agents.emit({ summary: "Changed it.", files: { changed: [], byRun: ["index.html"], already: 2, summary: "1 file changed" } });
  assert.match(card().textContent, /2 other changed files were there before\./);
  assert.deepEqual(h.reloads, []);
  h.click(h.button("Reload this tab"));
  assert.deepEqual(h.reloads, ["tab"]);
  assert.equal(card(), null, "the card closes with the reload");
});

test("here: needs you, failed and stopped say so honestly", async () => {
  for (const [patch, title, text] of [
    [{ state: "needs_you", reason: "Antigravity wanted to go further (running a command). Continue in Terminal to decide." }, "Claude Code needs you", /Continue in Terminal to decide/],
    [{ state: "failed", reason: "Claude Code is out of its 5-hour limit until 23:30." }, "Claude Code could not finish", /5-hour limit/],
    [{ state: "stopped", reason: "Stopped. No changes.", canResume: false }, "Stopped", /Stopped\. No changes\./],
  ]) {
    const { h, agents, card } = await setup();
    await h.capture();
    await flush();
    h.note().value = "Fix it";
    h.click(h.button("Start in Claude Code"));
    await flush();
    agents.finish({ canStop: false, ...patch });
    await flush();
    assert.equal(card().querySelector(".axiosozo-lab-card-title").textContent, title);
    assert.match(card().textContent, text);
    assert.equal(!!h.button("Continue in Terminal"), patch.state !== "stopped");
  }
});

test("here: a refused start says why in the bar and keeps the capture", async () => {
  const agents = scriptedAgents({ refuse: Object.assign(new Error("BUSY"), { code: "BUSY", reason: "Codex is already working in Harbor." }) });
  const { h, section, card } = await setup({ agents });
  await h.capture();
  await flush();
  h.note().value = "Fix it";
  h.click(h.button("Start in Claude Code"));
  await flush();
  assert.match(section().querySelector('[role="alert"]').textContent, /Codex is already working in Harbor\./);
  assert.ok(h.overlay());
  assert.equal(card(), null);
  assert.equal(h.button("Start in Claude Code").disabled, false, "it can be tried again");
});

test("here: the ▾ menu lists the agents with their state; the pick is remembered and named everywhere", async () => {
  const agents = scriptedAgents({ statuses: [
    { id: "claude-code", available: true, capabilities: ["task", "image"] },
    { id: "codex", available: true, capabilities: ["task", "image"] },
    { id: "antigravity", available: false, capabilities: [], reason: "Not installed" },
  ] });
  const { h, section } = await setup({ agents });
  await h.capture();
  await flush();
  const toggle = h.bar().querySelector('[aria-haspopup="menu"]');
  h.click(toggle);
  assert.equal(toggle.getAttribute("aria-expanded"), "true");
  const items = h.bar().querySelectorAll('[role="menuitemradio"]');
  assert.deepEqual(items.map(item => [item.textContent, item.getAttribute("aria-checked"), item.disabled]),
    [["Claude Code", "true", false], ["Codex", "false", false], ["AntigravityNot installed", "false", true]]);
  assert.equal(h.document.activeElement, items[0], "focus goes to the checked agent");
  h.key(h.bar().querySelector('[role="menu"]'), "ArrowDown");
  assert.equal(h.document.activeElement, items[1]);
  // Escape closes the menu, not the capture.
  h.escape();
  assert.equal(toggle.getAttribute("aria-expanded"), "false");
  assert.ok(h.overlay());
  h.click(toggle);
  h.click(h.bar().querySelectorAll('[role="menuitemradio"]')[1]);
  assert.ok(h.button("Start in Codex"));
  assert.match(section().textContent, /^Codex may edit files in/);
  h.escape();
  // The next capture starts with Codex.
  await h.capture();
  await flush();
  assert.ok(h.button("Start in Codex"));
  h.note().value = "Fix it";
  h.key(h.note(), "Enter");
  await flush();
  assert.equal(agents.calls.startTask[0].client, "codex");
});

test("here: Antigravity's caution is shown when it is the agent", async () => {
  const { h, section } = await setup();
  await h.capture();
  await flush();
  h.click(h.bar().querySelector('[aria-haspopup="menu"]'));
  h.click(h.bar().querySelectorAll('[role="menuitemradio"]')[2]);
  assert.match(section().textContent, /Antigravity may edit files in .*Antigravity keeps all its tools, including terminal commands and its own browser/);
});

test("here: with no agent ready nothing can start, and the bar says Copy for agent still works", async () => {
  const agents = scriptedAgents({ statuses: [{ id: "claude-code", available: false, capabilities: [] }] });
  const { h, section } = await setup({ agents });
  await h.capture();
  await flush();
  assert.equal(h.button("Start in Claude Code").disabled, true);
  assert.match(section().textContent, /No coding agent is ready on this Mac/);
  assert.ok(h.button("Copy for agent").classList.contains("axiosozo-region-primary"), "Copy for agent is the main action again");
  h.key(h.note(), "Enter");
  assert.equal(h.clipboard.writes.length, 1, "Return copies");
});

test("here with What's wrong here?: a proposal fills the task, Return starts it", async () => {
  const { h, agents, card } = await setup({ withAi: true });
  await h.capture();
  await flush();
  const row = h.bar().querySelector(".axiosozo-region-choice");
  assert.equal(row.querySelector(".axiosozo-region-choice-verb").textContent, "Use");
  h.click(row);
  await flush();
  assert.equal(agents.calls.startTask.length, 0, "a proposal never starts the agent by itself");
  assert.equal(h.note().value, "Fix the Retry payment button so it retries invoice INV-2041.");
  h.key(h.note(), "Enter");
  await flush();
  assert.equal(agents.calls.startTask.length, 1);
  assert.equal(agents.calls.startTask[0].task, "Fix the Retry payment button so it retries invoice INV-2041.");
  assert.ok(card());
});

test("here: when agent presence is on, the finished run opens presence's result card in the status card's place", async () => {
  const { openResultCard } = await import("../chrome/lab/presence/result-card.sys.mjs");
  const { watchPresence } = await import("../chrome/lab/presence/source.sys.mjs");
  const { createPresenceHub } = await import("../chrome/lab/presence/hub.sys.mjs");
  const hub = createPresenceHub();
  const presenceWindow = hub.registerWindow({}); // a presence experiment is on somewhere
  S.setPresenceForTesting({ openResultCard, hub, watchPresence });
  try {
    const agents = scriptedAgents();
    agents.list = () => (agents.current ? [agents.current] : []);
    agents.dismiss = () => true;
    const { h, card } = await setup({ agents });
    await h.capture();
    await flush();
    h.note().value = "Fix it";
    h.key(h.note(), "Enter");
    await flush();
    assert.ok(card(), "while it works: the compact status");
    agents.emit({ state: "working", step: "Editing index.html" });
    assert.equal(h.stack.querySelector(".axiosozo-presence-card"), null);
    agents.finish({ state: "done", summary: "Fixed it.", canStop: false,
      files: { changed: [{ path: "index.html", status: "M", byRun: true }], byRun: ["index.html"], already: 0, summary: "1 file changed" } });
    await flush();
    assert.equal(card(), null, "the status card handed over");
    const presenceCard = h.stack.querySelector(".axiosozo-presence-card");
    assert.ok(presenceCard, "presence's card is over the page");
    assert.match(presenceCard.textContent, /Fixed it\./);
    // Presence off everywhere: the next run keeps its own card.
    presenceWindow();
    h.escape?.();
    await h.capture();
    await flush();
    h.note().value = "Again";
    h.key(h.note(), "Enter");
    await flush();
    agents.finish({ state: "done", summary: "Done again.", canStop: false, files: null });
    await flush();
    assert.match(card().textContent, /Done again\./);
  } finally {
    S.setPresenceForTesting(undefined);
  }
});

test("here: turning the switch off removes the bar section and the status card", async () => {
  const { h, ctx, agents, card } = await setup();
  await h.capture();
  await flush();
  h.note().value = "Fix it";
  h.key(h.note(), "Enter");
  await flush();
  assert.ok(card());
  assert.equal(agents.listeners.size, 1);
  ctx.turnOff();
  assert.equal(card(), null);
  assert.equal(agents.listeners.size, 0, "no subscription left");
  assert.deepEqual(captureExtensionIds(h.window), []);
  await h.capture();
  assert.equal(h.button("Start in Claude Code"), null);
});

// ---- start-task-in-app -------------------------------------------------------------------------

test("in-app: Open in Claude Code prefills the app through ctx.agents, puts the image on the clipboard and says so", async () => {
  const { h, ctx, agents, section } = await setup({ variant: "app" });
  await h.capture();
  await flush();
  assert.match(section().textContent, /^Opens Claude Code in \/synthetic\/repos\/harbor, with your note filled in\. Nothing is sent until you press Return there\./);
  assert.ok(h.button("Open in Claude Code").classList.contains("axiosozo-region-primary"));
  h.note().value = "The retry button does nothing.";
  h.click(h.button("Open in Claude Code"));
  await flush();
  const [call] = agents.calls.openIn;
  assert.equal(call.target, "claude-cli");
  assert.equal(call.trigger.isTrusted, true);
  assert.equal(call.projectRoot, HARBOR.root);
  assert.equal(call.prompt, "The retry button does nothing.\n\nPage: http://localhost:5173/billing (\"Harbor · Billing settings\")");
  assert.deepEqual([...call.image.data], PNG);
  assert.equal(h.overlay(), null);
  assert.deepEqual(ctx.toasts.at(-1), { title: "Opened in Claude Code",
    description: "Your note is filled in there. Paste the image with ⌘V, then press Return there to start." });
});

test("in-app: apps that are not installed are shown but cannot be picked; the pick is remembered", async () => {
  const { h, agents } = await setup({ variant: "app" });
  await h.capture();
  await flush();
  h.click(h.bar().querySelector('[aria-haspopup="menu"]'));
  const items = h.bar().querySelectorAll('[role="menuitemradio"]');
  assert.deepEqual(items.map(item => [item.textContent, item.disabled]),
    [["Claude Code in your terminal", false], ["Claude app", false], ["Codex appNot installed", true]]);
  h.click(items[1]);
  assert.ok(h.button("Open in the Claude app"));
  h.key(h.note(), "Enter");
  await flush();
  assert.equal(agents.calls.openIn[0].target, "claude-desktop");
  await h.capture();
  await flush();
  assert.ok(h.button("Open in the Claude app"));
});

test("in-app: other pages keep Copy for agent and say why; a refusal keeps the capture", async () => {
  const plain = await setup({ variant: "app", project: null });
  await plain.h.capture();
  await flush();
  assert.equal(plain.section().textContent, S.NOT_A_PROJECT.app);
  const refused = await setup({ variant: "app", agents: scriptedAgents({ refuse: Object.assign(new Error("x"), { code: "HANDOVER_FAILED",
    reason: "The app could not be opened." }) }) });
  await refused.h.capture();
  await flush();
  refused.h.click(refused.h.button("Open in Claude Code"));
  await flush();
  assert.match(refused.section().textContent, /The app could not be opened\./);
  assert.ok(refused.h.overlay());
  assert.ok(trusted());
});
