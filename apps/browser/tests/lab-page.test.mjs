/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. https://mozilla.org/MPL/2.0/ */

// The Lab section of about:axiosozo (#lab): the real page script
// (overview/about-axiosozo.mjs) on the real page HTML in a small Node DOM
// (support/mini-dom.mjs) with a fake window.AxioSozoOverview, plus the Lab's
// page model (overview-model.mjs). Synthetic: made-up experiments and
// assistant states; not evidence of Gecko rendering, layout, VoiceOver or
// light/dark appearance, and no AI client is asked anything.
import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { Node, parseHtml } from "./support/mini-dom.mjs";
import * as M from "../chrome/overview/overview-model.mjs";

const HTML = readFileSync(new URL("../chrome/overview/about-axiosozo.html", import.meta.url), "utf8");
const HOME = "{11111111-1111-4111-8111-111111111111}";
let serial = 0;

const flush = async (rounds = 6) => { for (let i = 0; i < rounds; i++) await new Promise(resolve => setTimeout(resolve, 0)); };
function deferred() {
  let resolve, reject;
  const promise = new Promise((yes, no) => { resolve = yes; reject = no; });
  return { promise, resolve, reject };
}

// ---------------------------------------------------------------- fixtures

const experiment = overrides => ({ title: "Synthetic", pitch: "A synthetic experiment.", howToTry: ["Turn it on."], group: "AI on the page",
  variantOf: null, needs: ["none"], graduated: false, live: true, enabled: false, problem: null, ...overrides,
  family: overrides.family ?? overrides.id });

const GRADUATED = experiment({ id: "region-capture", title: "Capture an area for an agent",
  pitch: "Drag over part of any page with the right mouse button to copy that area, with the page address, for your coding agent.",
  howToTry: ["Hold the right mouse button and drag over part of a page.", "Click Copy for agent, then paste into Claude Code or Codex."],
  graduated: true, live: false, enabled: true });
const LIST = Object.freeze({
  version: 1,
  groups: ["AI on the page", "Agents", "Your day", "Projects"],
  experiments: [
    GRADUATED,
    experiment({ id: "page-tldr", title: "Page summary", pitch: "Sums up the page you are on in three lines.",
      howToTry: ["Turn it on.", "Open a long article.", "Click Summarize."], needs: ["claude-code", "codex"] }),
    experiment({ id: "page-tldr-cards", title: "Summary cards", pitch: "Sums up the page as cards you can keep.", variantOf: "page-tldr",
      family: "page-tldr", needs: ["codex"], enabled: true }),
    experiment({ id: "day-plan", title: "Plan my day", group: "Your day", problem: "INSTALL_FAILED" }),
    experiment({ id: "agent-board", title: "Agent board", group: "Agents", needs: ["claude-code"], problem: "DISPOSE_FAILED" }),
  ],
});
const FOUND = Object.freeze({ version: 1, clients: [
  { id: "claude-code", state: "unchecked", available: false, version: null, reason: "Claude Code found · not checked yet", note: "", capabilities: [] },
  { id: "codex", state: "ready", available: true, version: "0.160.0", reason: "", note: "Image input works.", capabilities: ["answer", "image"] },
  { id: "antigravity", state: "missing", available: false, version: null, reason: "Not installed", note: "", capabilities: [] },
] });
const CHECKED = Object.freeze({ version: 1, clients: [
  { id: "claude-code", state: "ready", available: true, version: "2.1.3", reason: "", note: "", capabilities: ["answer", "task", "agents"] },
  { id: "codex", state: "partial", available: true, version: "0.160.0", reason: "Codex answers, but cannot read images.", note: "", capabilities: ["answer"] },
  { id: "antigravity", state: "missing", available: false, version: null, reason: "Not installed", note: "", capabilities: [] },
] });
/** The list after `id` was switched, with the family rule the Lab applies. */
function switched(list, id, enabled) {
  const target = list.experiments.find(item => item.id === id);
  return { ...list, experiments: list.experiments.map(item => {
    if (item.id === id) return { ...item, enabled, problem: enabled ? item.problem : null };
    if (enabled && !item.graduated && !target.graduated && item.family === target.family) return { ...item, enabled: false };
    return item;
  }) };
}

// ---------------------------------------------------------------- the page

async function loadPage({ hash = "#lab", handlers = {} } = {}) {
  const document = parseHtml(HTML);
  const calls = [];
  const lab = { list: structuredClone(LIST) };
  const defaults = {
    getOverviewFlags: () => ({ contexts: true, enginePreferences: false, jevKeyEntry: true }),
    activeContext: () => ({ uuid: HOME }),
    listContexts: () => [{ uuid: HOME, name: "Home", icon: "", type: "personal", organization_uuid: null, project_id: null, container: 0 }],
    listProjects: () => [],
    listRules: () => [], getJevSettings: () => ({ consent: false, interval_minutes: 5, hourly_budget: 30 }),
    usageSummary: () => [], listOrphans: () => [], needsAttention: () => [], serviceStatus: () => [],
    listLab: () => structuredClone(lab.list),
    getLabClients: () => structuredClone(FOUND),
    setLabEnabled: ({ id, enabled }) => { lab.list = switched(lab.list, id, enabled); return structuredClone(lab.list); },
  };
  const api = {
    async request(name, params) {
      calls.push([name, JSON.parse(JSON.stringify(params ?? {}))]);
      const handler = handlers[name] ?? defaults[name];
      if (!handler) throw { code: "UNKNOWN_METHOD", message: name };
      return handler(params ?? {});
    },
    subscribe() { return () => {}; },
  };
  const windowListeners = new Map();
  const location = { hash };
  Object.assign(globalThis, {
    document, Node, location,
    window: { AxioSozoOverview: api, addEventListener: (type, fn) => windowListeners.set(type, fn) },
    history: { replaceState: (_state, _title, url) => { location.hash = url; } },
    CSS: { escape: value => String(value).replace(/["\\]/g, "\\$&") },
  });
  await import(`../chrome/overview/about-axiosozo.mjs?lab-page=${++serial}`);
  await flush();
  const navigate = async next => { location.hash = next; windowListeners.get("hashchange")?.(); await flush(); };
  const visible = async () => {
    document.visibilityState = "visible";
    for (const fn of document.listeners.get("visibilitychange") ?? []) fn({ type: "visibilitychange" });
    await flush();
  };
  const body = () => document.getElementById("lab-body");
  const card = id => document.querySelector(`article.lab-card[data-experiment="${id}"]`);
  const toggle = id => card(id).querySelector("input.switch");
  const status = () => document.getElementById("status").textContent;
  const named = name => calls.filter(([call]) => call === name);
  return { document, calls, lab, navigate, visible, body, card, toggle, status, named };
}

const visibleView = document => document.querySelectorAll("section.view").filter(section => !section.hidden).map(section => section.dataset.view);
const groupSections = page => page.body().querySelectorAll("section.lab-group:not(.lab-clients)");
const texts = nodes => nodes.map(node => node.textContent);

test("#lab shows the Lab view from its nav link and reads the list, then finds the assistants without checking them", async () => {
  const page = await loadPage();
  const { document } = page;
  const link = document.querySelectorAll(".views a").find(a => a.getAttribute("href") === "#lab");
  assert.equal(link.textContent, "Lab");
  assert.equal(link.getAttribute("aria-current"), "page");
  assert.deepEqual(visibleView(document), ["lab"]);
  assert.equal(document.getElementById("lab-heading").textContent, "Lab");
  assert.equal(page.body().hasAttribute("aria-busy"), false);
  assert.deepEqual(page.named("listLab"), [["listLab", {}]]);
  assert.deepEqual(page.named("getLabClients"), [["getLabClients", { check: false }]]);
  assert.ok(page.calls.findIndex(([name]) => name === "listLab") < page.calls.findIndex(([name]) => name === "getLabClients"));
  assert.deepEqual(page.named("setLabEnabled"), []);
  assert.doesNotMatch(page.body().textContent, /\bnull\b|\bundefined\b|\[object /u);
});

test("the Lab is read when it is opened, again on every visit, and again when its tab is shown", async () => {
  const page = await loadPage({ hash: "#projects" });
  assert.deepEqual(page.named("listLab"), [], "nothing is read before the Lab is opened");
  assert.deepEqual(page.named("getLabClients"), []);
  await page.navigate("#lab");
  assert.deepEqual(visibleView(page.document), ["lab"]);
  assert.equal(page.named("listLab").length, 1);
  assert.deepEqual(page.named("getLabClients"), [["getLabClients", { check: false }]]);
  await page.navigate("#rules");
  await page.navigate("#lab");
  assert.equal(page.named("listLab").length, 2);
  await page.visible();
  assert.equal(page.named("listLab").length, 3, "another tab may have flipped a switch");
  await page.navigate("#rules");
  await page.visible();
  assert.equal(page.named("listLab").length, 3, "not while another section shows");
  assert.equal(page.named("getLabClients").every(([, params]) => params.check === false), true, "opening never checks");
});

test("Your assistants lists Claude Code, Codex and Antigravity with the state the Lab's own check found", async () => {
  const page = await loadPage();
  const block = page.body().querySelector("section.lab-clients");
  assert.ok(block, "the assistants block comes first");
  assert.equal(page.body().children[0], block);
  assert.equal(block.querySelector("h3").textContent, M.LAB_CLIENTS_TITLE);
  assert.equal(block.querySelector(".block-help").textContent, M.LAB_CLIENTS_HELP);
  const rows = block.querySelectorAll("li.lab-client");
  assert.deepEqual(rows.map(row => [row.dataset.client, row.dataset.state, row.querySelector(".lab-client-name").textContent,
    row.querySelector(".lab-client-text").textContent, row.querySelector(".lab-client-note")?.textContent ?? null]), [
    ["claude-code", "unchecked", "Claude Code", "Claude Code found · not checked yet", null],
    ["codex", "ready", "Codex", "Codex · checked", "Image input works."],
    ["antigravity", "missing", "Antigravity", "Not installed", null],
  ]);
  assert.deepEqual(rows.map(row => row.querySelector(".dot").dataset.status), M.labClientRows(FOUND).map(row => row.dot));
  const button = block.querySelector(".lab-client-actions button");
  assert.equal(button.textContent, "Check again");
  assert.equal(button.disabled, false);
});

test("before the assistants are found every row says so, and a failed find leaves them unread", async () => {
  const pending = deferred();
  const page = await loadPage({ handlers: { getLabClients: () => pending.promise } });
  const rows = () => page.body().querySelectorAll("li.lab-client");
  assert.deepEqual(texts(rows().map(row => row.querySelector(".lab-client-text"))), ["Not read yet.", "Not read yet.", "Not read yet."]);
  pending.reject({ code: "LAB_UNAVAILABLE", message: "getLabClients failed (LAB_UNAVAILABLE)" });
  await flush();
  assert.deepEqual(rows().map(row => row.dataset.state), ["unknown", "unknown", "unknown"]);
  assert.equal(page.status(), "", "finding them quietly failed: no error toast");
  assert.ok(page.card("page-tldr"), "the experiments still show");
});

test("Check again asks getLabClients with check: true, shows Checking… while it runs, then the checked states", async () => {
  const check = deferred();
  const page = await loadPage({ handlers: { getLabClients: ({ check: wanted }) => (wanted ? check.promise : structuredClone(FOUND)) } });
  const block = () => page.body().querySelector("section.lab-clients");
  const button = () => block().querySelector(".lab-client-actions button");
  button().click();
  await flush();
  assert.deepEqual(page.named("getLabClients"), [["getLabClients", { check: false }], ["getLabClients", { check: true }]]);
  assert.equal(button().textContent, "Checking…");
  assert.equal(button().disabled, true, "one check at a time");
  assert.equal(block().getAttribute("aria-busy"), "true");
  assert.equal(block().querySelector('li.lab-client[data-client="claude-code"] .lab-client-text').textContent, "Checking Claude Code…",
    "an unchecked assistant shows that it is being checked");
  assert.equal(page.card("page-tldr").querySelector('.lab-clients li[data-state="checking"]').textContent, "Checking Claude Code…");
  button().click();
  await flush();
  assert.equal(page.named("getLabClients").length, 2, "a click while checking starts nothing");

  check.resolve(structuredClone(CHECKED));
  await flush();
  assert.equal(button().textContent, "Check again");
  assert.equal(button().disabled, false);
  assert.equal(block().hasAttribute("aria-busy"), false);
  assert.equal(page.status(), "Assistants checked.");
  assert.deepEqual(block().querySelectorAll("li.lab-client").map(row => [row.dataset.state, row.querySelector(".lab-client-text").textContent]),
    [["ready", "Claude Code · checked"], ["partial", "Codex answers, but cannot read images."], ["missing", "Not installed"]]);
  assert.deepEqual(texts(page.card("page-tldr").querySelectorAll(".lab-clients li.tag")), ["Claude Code 2.1.3", "Codex 0.160.0"]);
});

test("a check refused by the browser says why and gives the button back", async () => {
  const page = await loadPage({ handlers: { getLabClients: ({ check }) => {
    if (check) throw { code: "PRIVATE_WINDOW", message: "getLabClients: assistants are managed from a normal window" };
    return structuredClone(FOUND);
  } } });
  page.body().querySelector(".lab-client-actions button").click();
  await flush();
  assert.equal(page.document.getElementById("status").dataset.kind, "error");
  assert.equal(page.status(), "Assistants are checked from a normal window.", "about assistants, not experiments");
  assert.equal(page.body().querySelector(".lab-client-actions button").textContent, "Check again");
  assert.equal(page.body().querySelector('li.lab-client[data-client="codex"]').dataset.state, "ready", "the found states stay");
});

test("experiments are grouped in the Lab's order, families side by side, graduated features last", async () => {
  const page = await loadPage();
  const sections = groupSections(page);
  assert.deepEqual(sections.map(section => section.querySelector("h3").textContent), ["AI on the page", "Agents", "Your day", "Graduated"],
    "empty groups are left out");
  assert.deepEqual(sections.map(section => section.hasAttribute("data-graduated")), [false, false, false, true]);
  const graduated = sections.at(-1);
  assert.equal(graduated.querySelector(".block-help").textContent, M.LAB_GRADUATED_HELP);
  assert.deepEqual(graduated.querySelectorAll("article.lab-card").map(node => node.dataset.experiment), ["region-capture"]);
  assert.equal(page.body().querySelector("p.lab-empty"), null);

  // The idea and its variant, side by side under one label, the idea first.
  const family = sections[0].querySelector("li.lab-family");
  const group = family.querySelector('[role="group"]');
  const head = family.querySelector(".lab-family-head");
  assert.equal(head.textContent, "Two takes on one idea. One can be on at a time.");
  assert.equal(group.getAttribute("aria-labelledby"), head.id);
  assert.deepEqual(family.querySelectorAll(".lab-variants article.lab-card").map(node => node.dataset.experiment), ["page-tldr", "page-tldr-cards"]);
  assert.equal(sections[0].querySelectorAll("article.lab-card").length, 2);
});

test("a card says what it is, how to try it, what it uses and has a labelled switch", async () => {
  const page = await loadPage();
  const card = page.card("page-tldr");
  const title = card.querySelector("h4.card-title");
  const pitch = card.querySelector(".lab-pitch");
  assert.equal(title.textContent, "Page summary");
  assert.equal(pitch.textContent, "Sums up the page you are on in three lines.");
  assert.deepEqual(texts(card.querySelectorAll(".lab-steps li")), ["Turn it on.", "Open a long article.", "Click Summarize."]);
  assert.equal(card.querySelector(".lab-needs").textContent, M.labNeedsText(LIST.experiments[1]));
  assert.equal(card.querySelector(".lab-needs").textContent, "Experimental. Uses Claude Code or Codex on this Mac when you click.");
  assert.deepEqual(card.querySelectorAll(".lab-clients li.tag").map(tag => [tag.dataset.state, tag.textContent]),
    [["unchecked", "Claude Code found"], ["ready", "Codex 0.160.0"]]);
  const toggle = page.toggle("page-tldr");
  assert.equal(toggle.getAttribute("type"), "checkbox");
  assert.equal(toggle.getAttribute("role"), "switch");
  assert.equal(toggle.checked, false);
  assert.equal(toggle.getAttribute("title"), "Off");
  assert.equal(toggle.getAttribute("aria-labelledby"), title.id);
  assert.equal(toggle.getAttribute("aria-describedby"), pitch.id);
  assert.equal(card.querySelector(".lab-problem"), null);
  assert.equal(page.toggle("page-tldr-cards").checked, true);
  assert.equal(page.card("page-tldr-cards").hasAttribute("data-on"), true);

  // No AI used: no assistant tags. Graduated: "On by default" and the new-windows note.
  const region = page.card("region-capture");
  assert.equal(region.querySelector(".lab-needs").textContent, "Uses no AI.");
  assert.equal(region.querySelector(".lab-clients"), null);
  assert.equal(region.querySelector("h4 .tag").textContent, "On by default");
  assert.equal(region.querySelector(".lab-note").textContent, "Part of AxioSozo. Turning it off applies to new windows.");
  assert.equal(page.card("day-plan").querySelector(".lab-needs").textContent, "Experimental. Uses no AI.");
  assert.equal(page.card("day-plan").querySelector(".lab-note"), null);
});

test("a problem a window reported shows its sentence on the card", async () => {
  const page = await loadPage();
  assert.equal(page.card("day-plan").querySelector(".lab-problem").textContent, "It could not start in a window. The Browser Console has the details.");
  assert.equal(page.card("agent-board").querySelector(".lab-problem").textContent,
    "It did not clean up fully when it was turned off. Restart AxioSozo to be sure it is gone.");
});

test("a switch asks setLabEnabled with exactly { id, enabled }, re-renders from the answer and says what changed", async () => {
  const pending = deferred();
  let answer = null;
  const page = await loadPage({ handlers: { setLabEnabled: params => { answer = params; return pending.promise; } } });
  const before = structuredClone(page.lab.list);
  page.toggle("page-tldr").click();
  await flush();
  assert.deepEqual(page.named("setLabEnabled"), [["setLabEnabled", { id: "page-tldr", enabled: true }]]);
  assert.deepEqual(Object.keys(answer), ["id", "enabled"]);
  assert.equal(page.toggle("page-tldr").disabled, true, "busy while the browser answers");
  assert.equal(page.toggle("page-tldr").getAttribute("aria-busy"), "true");
  assert.equal(page.toggle("page-tldr-cards").disabled, false, "the other switches stay usable");
  page.toggle("page-tldr").click();
  await flush();
  assert.equal(page.named("setLabEnabled").length, 1, "a busy switch sends nothing");

  const after = switched(before, "page-tldr", true);
  pending.resolve(structuredClone(after));
  await flush();
  assert.equal(page.toggle("page-tldr").checked, true);
  assert.equal(page.toggle("page-tldr").disabled, false);
  assert.equal(page.toggle("page-tldr-cards").checked, false, "its variant went off");
  const experiment = before.experiments.find(item => item.id === "page-tldr");
  assert.equal(page.status(), M.labToggleText(experiment, true, { before, after }));
  assert.equal(page.status(), "Page summary is on. Summary cards is off now: one take at a time.");
  assert.equal(page.named("listLab").length, 1, "the answer is the new list; nothing is read again");
});

test("turning a switch off says it is gone from your windows; a graduated feature says new windows", async () => {
  const page = await loadPage();
  page.toggle("page-tldr-cards").click();
  await flush();
  assert.deepEqual(page.named("setLabEnabled").at(-1), ["setLabEnabled", { id: "page-tldr-cards", enabled: false }]);
  assert.equal(page.status(), "Summary cards is off and gone from your windows.");
  assert.equal(page.toggle("page-tldr-cards").checked, false);
  page.toggle("region-capture").click();
  await flush();
  assert.deepEqual(page.named("setLabEnabled").at(-1), ["setLabEnabled", { id: "region-capture", enabled: false }]);
  assert.equal(page.status(), "Capture an area for an agent is off in new windows.");
  page.toggle("day-plan").click();
  await flush();
  assert.equal(page.status(), "Plan my day is on in your windows.");
  assert.equal(page.card("day-plan").querySelector(".lab-problem").textContent, "It could not start in a window. The Browser Console has the details.",
    "the problem stays until the browser says otherwise");
});

test("a refused switch says why and shows the browser's state; an unknown experiment reads the list again", async () => {
  let refusal = { code: "PRIVATE_WINDOW", message: "setLabEnabled: experiments are managed from a normal window" };
  const page = await loadPage({ handlers: { setLabEnabled: () => { throw refusal; } } });
  page.toggle("day-plan").click();
  await flush();
  assert.equal(page.status(), "Experiments are turned on and off from a normal window.");
  assert.equal(page.document.getElementById("status").dataset.kind, "error");
  assert.equal(page.toggle("day-plan").checked, false, "back to what the browser says");
  assert.equal(page.toggle("day-plan").disabled, false);
  assert.equal(page.named("listLab").length, 1);

  refusal = { code: "UNKNOWN_EXPERIMENT", message: "setLabEnabled failed (UNKNOWN_EXPERIMENT)" };
  page.lab.list = { ...page.lab.list, experiments: page.lab.list.experiments.filter(item => item.id !== "day-plan") };
  page.toggle("day-plan").click();
  await flush();
  assert.equal(page.status(), "That experiment is no longer in the Lab. The list was read again.");
  assert.equal(page.named("listLab").length, 2);
  assert.equal(page.card("day-plan"), null, "gone after the list was read again");

  refusal = { code: "LAB_UNAVAILABLE", message: "setLabEnabled failed (LAB_UNAVAILABLE)" };
  page.toggle("agent-board").click();
  await flush();
  assert.equal(page.status(), "The Lab is not available right now.");
});

test("a listLab failure shows a calm sentence instead of the experiments", async () => {
  const page = await loadPage({ handlers: { listLab: () => { throw { code: "LAB_UNAVAILABLE", message: "listLab failed (LAB_UNAVAILABLE)" }; } } });
  assert.equal(page.body().hasAttribute("aria-busy"), false);
  assert.deepEqual(texts(page.body().querySelectorAll("p.empty")), ["Could not open the Lab. The Lab is not available right now."]);
  assert.equal(page.body().querySelectorAll("article.lab-card").length, 0);
  assert.equal(page.body().querySelector("section.lab-clients"), null);
  // Any other failure uses the page's common words.
  const other = await loadPage({ handlers: { listLab: () => { throw { code: "SOMETHING_NEW", message: "Something specific." }; } } });
  assert.equal(other.body().querySelector("p.empty").textContent, "Could not open the Lab. Something specific.");
});

test("with only graduated features the Lab says it has no experiments yet, and still lists them", async () => {
  const page = await loadPage({ handlers: { listLab: () => ({ version: 1, groups: [...LIST.groups], experiments: [structuredClone(GRADUATED)] }) } });
  assert.equal(page.body().querySelector("p.lab-empty").textContent, M.LAB_EMPTY);
  assert.deepEqual(groupSections(page).map(section => section.querySelector("h3").textContent), ["Graduated"]);
  assert.ok(page.card("region-capture"));
  const none = await loadPage({ handlers: { listLab: () => ({ version: 1, groups: [...LIST.groups], experiments: [] }) } });
  assert.equal(none.body().querySelector("p.lab-empty").textContent, M.LAB_EMPTY);
  assert.deepEqual(groupSections(none), []);
  assert.ok(none.body().querySelector("section.lab-clients"), "the assistants block still shows");
});

// ---------------------------------------------------------------- the model

test("labSections: the actor's group order, unknown groups after it, families with the idea first, graduated last", () => {
  const list = {
    groups: ["AI on the page", "Agents", "Your day", "Projects", 5, null],
    experiments: [
      experiment({ id: "b2", variantOf: "b", family: "b", group: "Projects" }),
      experiment({ id: "elsewhere", group: "Elsewhere" }),
      experiment({ id: "b", group: "Agents" }),
      experiment({ id: "b3", variantOf: "b2", family: "b", group: "Agents" }),
      experiment({ id: "grad", graduated: true, group: "Agents" }),
      experiment({ id: "grad-variant", graduated: true, variantOf: "b", family: "b" }),
      experiment({ id: "orphan", variantOf: "gone", family: "gone", group: "Your day" }),
      experiment({ id: "under-grad", variantOf: "grad", family: "grad", group: "Your day" }),
      { title: "no id" },
      null,
    ],
  };
  const sections = M.labSections(list);
  assert.deepEqual(sections.map(section => [section.title, section.graduated, section.help]),
    [["Agents", false, null], ["Your day", false, null], ["Elsewhere", false, null], ["Graduated", true, M.LAB_GRADUATED_HELP]]);
  const [agents, day, elsewhere, graduated] = sections;
  assert.deepEqual(agents.items.map(item => [item.kind, item.id]), [["family", "b"]], "the family sits in its idea's group");
  assert.deepEqual(agents.items[0].members.map(member => member.id), ["b", "b2", "b3"]);
  assert.equal(agents.items[0].label, "Three takes on one idea. One can be on at a time.");
  assert.deepEqual(day.items.map(item => [item.kind, item.id]), [["single", "orphan"], ["single", "under-grad"]],
    "a variant of an idea that is missing or graduated stands alone");
  assert.deepEqual(elsewhere.items.map(item => item.id), ["elsewhere"]);
  assert.deepEqual(graduated.items.map(item => [item.kind, item.id]), [["single", "grad"], ["single", "grad-variant"]]);
  assert.deepEqual(M.labSections(null), []);
  assert.deepEqual(M.labSections({ groups: ["A"], experiments: "x" }), []);
  const six = { groups: ["G"], experiments: ["a", "b", "c", "d", "e", "f"].map((id, index) => experiment({ id, group: "G",
    variantOf: index ? "a" : null, family: "a" })) };
  assert.equal(M.labSections(six)[0].items[0].label, "6 takes on one idea. One can be on at a time.");
});

test("labHasExperiments and labNeedsClients look at the list's experiments only", () => {
  assert.equal(M.labHasExperiments(LIST), true);
  assert.equal(M.labHasExperiments({ experiments: [GRADUATED] }), false);
  assert.equal(M.labHasExperiments(null), false);
  assert.equal(M.labNeedsClients(LIST), true);
  assert.equal(M.labNeedsClients({ experiments: [GRADUATED, experiment({ id: "x" })] }), false);
  assert.equal(M.labNeedsClients({ experiments: [experiment({ id: "x", needs: ["antigravity"] })] }), true);
});

test("labNeedsText says which assistants an experiment uses, and when", () => {
  const cases = [
    [{ needs: ["none"] }, "Experimental. Uses no AI."],
    [{ needs: ["codex"] }, "Experimental. Uses Codex on this Mac when you click."],
    [{ needs: ["claude-code", "codex"] }, "Experimental. Uses Claude Code or Codex on this Mac when you click."],
    [{ needs: ["claude-code", "codex", "antigravity"] }, "Experimental. Uses Claude Code, Codex or Antigravity on this Mac when you click."],
    [{ needs: ["antigravity"], graduated: true }, "Uses Antigravity on this Mac when you click."],
    [{ needs: ["none"], graduated: true }, "Uses no AI."],
    [{ needs: ["gpt", null] }, "Experimental. Uses no AI."],
    [{ needs: "codex" }, "Experimental. Uses no AI."],
    [null, "Experimental. Uses no AI."],
  ];
  for (const [value, text] of cases) assert.equal(M.labNeedsText(value), text, JSON.stringify(value));
});

test("labClientRows: always the three assistants, each state in plain words", () => {
  assert.deepEqual(M.labClientRows(null).map(row => [row.id, row.label, row.state, row.dot, row.text, row.note]), [
    ["claude-code", "Claude Code", "unknown", "unknown", "Not read yet.", null],
    ["codex", "Codex", "unknown", "unknown", "Not read yet.", null],
    ["antigravity", "Antigravity", "unknown", "unknown", "Not read yet.", null],
  ]);
  assert.deepEqual(M.labClientRows(null, { checking: true }).map(row => [row.state, row.text]),
    [["checking", "Checking Claude Code…"], ["checking", "Checking Codex…"], ["checking", "Checking Antigravity…"]]);
  const row = (status, options) => M.labClientRows({ clients: [{ id: "codex", ...status }] }, options)[1];
  const view = item => [item.state, item.dot, item.tag, item.text, item.note];
  assert.deepEqual(view(row({ state: "ready", version: "0.160.0" })), ["ready", "up", "Codex 0.160.0", "Codex · checked", null]);
  assert.deepEqual(view(row({ state: "ready" })), ["ready", "up", "Codex ready", "Codex · checked", null]);
  assert.deepEqual(view(row({ state: "ready", reason: "Codex answers.", note: "Images too." })), ["ready", "up", "Codex ready", "Codex answers.", "Images too."]);
  assert.deepEqual(view(row({ state: "partial", version: "0.160.0" })), ["partial", "warn", "Codex 0.160.0", "Codex works in part.", null]);
  assert.deepEqual(view(row({ state: "partial" })), ["partial", "warn", "Codex", "Codex works in part.", null]);
  assert.deepEqual(view(row({ state: "unchecked" })), ["unchecked", "unknown", "Codex found", "Codex found · not checked yet", null]);
  assert.deepEqual(view(row({ state: "unchecked" }, { checking: true })), ["checking", "unknown", "Checking Codex…", "Checking Codex…", null]);
  assert.deepEqual(view(row({ state: "ready", version: "1.0.0" }, { checking: true })), ["ready", "up", "Codex 1.0.0", "Codex · checked", null],
    "a checked assistant keeps its state while it is checked again");
  assert.deepEqual(view(row({ state: "missing", reason: "ignored", note: "ignored" })), ["missing", "off", "Codex not installed", "Not installed", null]);
  assert.deepEqual(view(row({ state: "changed" })), ["changed", "warn", "Codex changed", "Codex changed an option the Lab uses.", null]);
  assert.deepEqual(view(row({ state: "broken" })), ["broken", "warn", "Codex not usable", "Codex could not be checked.", null]);
  assert.deepEqual(view(row({ state: "something-new", reason: "Odd." })), ["broken", "warn", "Codex not usable", "Odd.", null]);
  assert.deepEqual(view(row({ state: "ready", reason: "", note: "" })), ["ready", "up", "Codex ready", "Codex · checked", null]);
});

test("labClientStates: per assistant an experiment uses, in its order, as short tags", () => {
  assert.deepEqual(M.labClientStates(["none"], FOUND), []);
  assert.deepEqual(M.labClientStates(["gpt"], FOUND), []);
  assert.deepEqual(M.labClientStates(["codex", "claude-code"], FOUND), [
    { id: "codex", label: "Codex", state: "ready", dot: "up", text: "Codex 0.160.0" },
    { id: "claude-code", label: "Claude Code", state: "unchecked", dot: "unknown", text: "Claude Code found" },
  ]);
  assert.deepEqual(M.labClientStates(["antigravity"], null).map(item => [item.state, item.text]), [["unknown", "Antigravity status unknown"]]);
  assert.deepEqual(M.labClientStates(["claude-code"], FOUND, { checking: true }).map(item => item.text), ["Checking Claude Code…"]);
});

test("labToggleText says what is on now, what went off with it, and where it applies", () => {
  const before = LIST;
  const tldr = LIST.experiments[1];
  assert.equal(M.labToggleText(tldr, true, { before, after: switched(before, "page-tldr", true) }),
    "Page summary is on. Summary cards is off now: one take at a time.");
  const three = { experiments: [{ id: "a", title: "A", enabled: false }, { id: "b", title: "B", enabled: true }, { id: "c", title: "C", enabled: true }] };
  const afterThree = { experiments: [{ id: "a", title: "A", enabled: true }, { id: "b", title: "B", enabled: false }, { id: "c", title: "C", enabled: false }] };
  assert.equal(M.labToggleText({ id: "a", title: "A" }, true, { before: three, after: afterThree }), "A is on. B or C is off now: one take at a time.");
  assert.equal(M.labToggleText(tldr, true), "Page summary is on in your windows.");
  assert.equal(M.labToggleText(tldr, false, { before, after: before }), "Page summary is off and gone from your windows.");
  assert.equal(M.labToggleText(GRADUATED, true), "Capture an area for an agent is on in new windows.");
  assert.equal(M.labToggleText(GRADUATED, false), "Capture an area for an agent is off in new windows.");
  assert.equal(M.labToggleText({ ...GRADUATED, live: true }, false), "Capture an area for an agent is off and gone from your windows.");
  assert.equal(M.labToggleText(null, true), "The experiment is on in your windows.");
});

test("labProblemText and labErrorText have words for the Lab's own codes only", () => {
  for (const code of ["LOAD_FAILED", "INSTALLER_MISSING", "INSTALL_FAILED"]) {
    assert.equal(M.labProblemText(code), "It could not start in a window. The Browser Console has the details.");
  }
  assert.equal(M.labProblemText("DISPOSE_FAILED"), "It did not clean up fully when it was turned off. Restart AxioSozo to be sure it is gone.");
  for (const code of [null, undefined, "", "OTHER"]) assert.equal(M.labProblemText(code), null);
  assert.equal(M.labErrorText("LAB_UNAVAILABLE"), "The Lab is not available right now.");
  assert.equal(M.labErrorText("UNKNOWN_EXPERIMENT"), "That experiment is no longer in the Lab. The list was read again.");
  assert.equal(M.labErrorText("PRIVATE_WINDOW"), "Experiments are turned on and off from a normal window.");
  for (const code of [null, "DOCUMENT_GONE", "INVALID_PARAMS"]) assert.equal(M.labErrorText(code), null);
  assert.deepEqual(Object.keys(M.LAB_CLIENT_LABELS), ["claude-code", "codex", "antigravity"]);
});

test("variants of a graduated idea stay together as one family, apart from the graduated feature", () => {
  const sections = M.labSections({ version: 1, groups: ["AI on the page"], experiments: [
    { id: "region-capture", title: "Capture", group: "AI on the page", family: "region-capture", variantOf: null, graduated: true, needs: ["none"] },
    { id: "capture-a", title: "A", group: "AI on the page", family: "region-capture", variantOf: "region-capture", graduated: false, needs: ["none"] },
    { id: "capture-b", title: "B", group: "AI on the page", family: "region-capture", variantOf: "region-capture", graduated: false, needs: ["none"] },
  ] });
  assert.deepEqual(sections.map(section => [section.title, section.items.map(item => [item.kind, item.id, (item.members ?? [item.experiment]).map(member => member.id)])]), [
    ["AI on the page", [["family", "region-capture", ["capture-a", "capture-b"]]]],
    ["Graduated", [["single", "region-capture", ["region-capture"]]]],
  ]);
});
