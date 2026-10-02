/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. https://mozilla.org/MPL/2.0/ */

// Plan 4 step 1 at the about:axiosozo boundary: the parent actor admits
// detection only for natively picked folders and refresh only by project id;
// arrival tokens never cross to the page. The page (real script on the real
// HTML in support/mini-dom.mjs, fake window.AxioSozoOverview) shows what
// detection found as text and asks for a refresh with the project id only.
// Synthetic: not evidence of Gecko rendering, layout or VoiceOver.
import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { AboutAxioSozoParent, METHODS, MESSAGES, setProvidersForTesting } from "../chrome/AboutAxioSozoParent.sys.mjs";
import { Node, parseHtml } from "./support/mini-dom.mjs";

const UUID_A = "{11111111-2222-3333-4444-555555555555}";

// ---------------------------------------------------------------- actor

function goodSender() {
  return { remoteType: "privilegedabout", documentURI: "about:axiosozo", isCurrentGlobal: true, isTopLevel: true, hasEmbedder: true,
    usePrivateBrowsing: false, principal: { isSystemPrincipal: false, isContentPrincipal: true, originNoSuffix: "about:axiosozo", privateBrowsingId: 0 } };
}
function fakeActor(window = { name: "browser-window" }) {
  const sender = goodSender();
  const actor = new AboutAxioSozoParent();
  const context = { parent: null, embedderElement: {}, usePrivateBrowsing: false, topChromeWindow: window };
  context.top = context;
  actor.browsingContext = context;
  actor.manager = { remoteType: sender.remoteType, isCurrentGlobal: true, documentURI: { spec: sender.documentURI }, documentPrincipal: sender.principal };
  actor.sendAsyncMessage = () => {};
  return actor;
}
function fakeServices({ fail = {} } = {}) {
  const calls = [];
  const services = {
    pickFolder: async window => { calls.push(["pickFolder", window]); return "/Volumes/Synthetic/harbor-suite"; },
    detect: async root => { calls.push(["detect", root]); if (fail.detect) throw fail.detect; return { version: 2, name: "harbor" }; },
    confirmProject: async args => { calls.push(["confirmProject", args]); return { id: "p_harbor1" }; },
    refreshProjectDetection: async id => { calls.push(["refreshProjectDetection", id]); if (fail.refresh) throw fail.refresh; return { id }; },
    offerArrival: async () => { calls.push(["offerArrival"]); return null; },
    acceptArrival: async () => { calls.push(["acceptArrival"]); return null; },
    on: () => () => {},
  };
  return { services, calls };
}
const request = (actor, name, params) => actor.receiveMessage({ name: MESSAGES.REQUEST, data: { name, params } });
const codeError = code => Object.assign(new Error(code), { code });

test("refreshProjectDetection takes a project id only and reaches the service unchanged", async () => {
  const { services, calls } = fakeServices();
  const restore = setProvidersForTesting({ services: () => services });
  try {
    const actor = fakeActor();
    assert.deepEqual(await request(actor, "refreshProjectDetection", { id: "p_harbor1" }), { ok: true, value: { id: "p_harbor1" } });
    for (const params of [{ id: "p_harbor1", root: "/etc" }, { id: "../p_x" }, { id: "P_HARBOR1" }, { root: "/Volumes/Synthetic/harbor-suite" },
      { id: "p_harbor1", detected: { integrations: [] } }, {}]) {
      assert.equal((await request(actor, "refreshProjectDetection", params)).error.code, "INVALID_PARAMS", JSON.stringify(params));
    }
    assert.deepEqual(calls, [["refreshProjectDetection", "p_harbor1"]]);
  } finally { restore(); }
});

test("arrival never crosses the page boundary: no method takes a token, a window or a root it did not pick", async () => {
  assert.ok(!Object.keys(METHODS).some(name => /arrival/iu.test(name)));
  assert.ok(Object.hasOwn(METHODS, "refreshProjectDetection"));
  const { services, calls } = fakeServices();
  const restore = setProvidersForTesting({ services: () => services });
  try {
    const actor = fakeActor();
    for (const name of ["offerArrival", "acceptArrival", "discardArrival"]) {
      assert.equal((await request(actor, name, { token: "0".repeat(36) })).error.code, "UNKNOWN_METHOD", name);
    }
    assert.equal((await request(actor, "confirmProject", { root: "/Volumes/Synthetic/harbor-suite",
      manifest: { version: 1, name: "H", kind: "web", environments: [], services: [], surfaces: [] }, token: "x" })).error.code, "INVALID_PARAMS");
    assert.deepEqual(calls, []);
  } finally { restore(); }
});

test("native picker provenance: detect and confirm only for the picked folder; detection errors keep their code", async () => {
  const unavailable = codeError("READ_CONTAINMENT_UNAVAILABLE");
  const { services, calls } = fakeServices({ fail: { detect: unavailable } });
  const restore = setProvidersForTesting({ services: () => services });
  try {
    const window = { name: "top-chrome-window" };
    const actor = fakeActor(window);
    assert.equal((await request(actor, "detect", { root: "/Volumes/Synthetic/harbor-suite" })).error.code, "ROOT_NOT_PICKED");
    assert.equal((await request(actor, "pickFolder")).value, "/Volumes/Synthetic/harbor-suite");
    assert.equal(calls[0][1], window, "the picker opens on the requesting tab's window");
    assert.equal((await request(actor, "detect", { root: "/Volumes/Synthetic/other" })).error.code, "ROOT_NOT_PICKED");
    const reply = await request(actor, "detect", { root: "/Volumes/Synthetic/harbor-suite" });
    assert.deepEqual([reply.ok, reply.error.code], [false, "READ_CONTAINMENT_UNAVAILABLE"]);
    const manifest = { version: 1, name: "Harbor", kind: "web", environments: [], services: [], surfaces: [] };
    assert.equal((await request(actor, "confirmProject", { root: "/Volumes/Synthetic/other", manifest })).error.code, "ROOT_NOT_PICKED");
    assert.equal((await request(actor, "confirmProject", { root: "/Volumes/Synthetic/harbor-suite", manifest, contextUuid: UUID_A })).ok, true);
    assert.deepEqual(calls.at(-1), ["confirmProject", { root: "/Volumes/Synthetic/harbor-suite", manifest, contextUuid: UUID_A }]);
    assert.equal((await request(actor, "confirmProject", { root: "/Volumes/Synthetic/harbor-suite", manifest })).error.code, "ROOT_NOT_PICKED",
      "the pick is used once");
    assert.ok(!calls.some(([name]) => /arrival/iu.test(name)));
  } finally { restore(); }
});

// ---------------------------------------------------------------- agents (P3)

function agentServices({ normal = true, hold = null } = {}) {
  const calls = [];
  const answer = async (name, value) => { calls.push(name); if (hold) await hold.promise; return value; };
  const services = {
    isNormalWindow: window => { calls.push(["isNormalWindow", window.name]); return normal; },
    getAgentEndpointState: () => answer("getAgentEndpointState", { enabled: false, state: "disabled", reason: null }),
    setAgentEndpointEnabled: args => answer("setAgentEndpointEnabled", { enabled: args.enabled, window: args.window.name }),
    getAgentHookConfig: args => answer("getAgentHookConfig", { agent: args.agent, text: "x" }),
    listAgentActivity: projectId => answer("listAgentActivity", [{ project_id: projectId }]),
    listAgentSessions: args => answer("listAgentSessions", [{ project: args.projectId }]),
    revokeAgentSession: args => answer("revokeAgentSession", { revoked: args.sessionId === "s_0123456789abcdef" }),
    on: () => () => {},
  };
  return { services, calls };
}
const serviceCalls = calls => calls.filter(call => typeof call === "string");

test("agent methods: the page names closed arguments only; the actor supplies its own normal window", async () => {
  const { services, calls } = agentServices();
  const restore = setProvidersForTesting({ services: () => services });
  try {
    const actor = fakeActor({ name: "normal-window" });
    assert.deepEqual(await request(actor, "setAgentEndpointEnabled", { enabled: true }), { ok: true, value: { enabled: true, window: "normal-window" } });
    assert.deepEqual((await request(actor, "listAgentActivity", { projectId: "p_harbor1" })).value, [{ project_id: "p_harbor1" }]);
    assert.deepEqual((await request(actor, "getAgentHookConfig", { agent: "codex" })).value, { agent: "codex", text: "x" });
    assert.deepEqual((await request(actor, "revokeAgentSession", { projectId: "p_harbor1", sessionId: "s_0123456789abcdef" })).value, { revoked: true });
    for (const [name, params] of [["setAgentEndpointEnabled", { enabled: "true" }], ["setAgentEndpointEnabled", { enabled: true, socketPath: "/tmp/s" }],
      ["setAgentEndpointEnabled", { enabled: true, window: "x" }], ["getAgentHookConfig", { agent: "bash" }],
      ["getAgentHookConfig", { agent: "codex", notifyPath: "/bin/sh" }], ["listAgentActivity", { projectId: "../p_x" }],
      ["revokeAgentSession", { projectId: "p_harbor1", sessionId: "s_1" }], ["getAgentEndpointState", { presenter: {} }]]) {
      assert.equal((await request(actor, name, params)).error.code, "INVALID_PARAMS", `${name} ${JSON.stringify(params)}`);
    }
    assert.deepEqual(serviceCalls(calls), ["setAgentEndpointEnabled", "listAgentActivity", "getAgentHookConfig", "revokeAgentSession"]);
    for (const name of ["handoff", "copyToClipboard", "registerAgentPresenter", "getAgentDiagnostics", "captureHandoffAuthority", "rememberAgentReturnTarget"]) {
      assert.equal((await request(actor, name, {})).error.code, "UNKNOWN_METHOD", name);
    }
  } finally { restore(); }
});

test("agent methods refuse private, unknown and unregistered windows before asking the service anything", async () => {
  for (const [setup, code] of [[actor => { actor.browsingContext.usePrivateBrowsing = true; actor.manager.documentPrincipal = { ...actor.manager.documentPrincipal, privateBrowsingId: 1 }; }, "PRIVATE_WINDOW"],
    [actor => { actor.browsingContext.topChromeWindow = null; }, "NO_WINDOW"]]) {
    const { services, calls } = agentServices();
    const restore = setProvidersForTesting({ services: () => services });
    try {
      const actor = fakeActor();
      setup(actor);
      for (const [name, params] of [["getAgentEndpointState", {}], ["setAgentEndpointEnabled", { enabled: true }], ["listAgentActivity", { projectId: "p_harbor1" }]]) {
        assert.equal((await request(actor, name, params)).error.code, code, name);
      }
      assert.deepEqual(serviceCalls(calls), []);
    } finally { restore(); }
  }
  const { services, calls } = agentServices({ normal: false });
  const restore = setProvidersForTesting({ services: () => services });
  try {
    assert.equal((await request(fakeActor(), "setAgentEndpointEnabled", { enabled: true })).error.code, "PRIVATE_WINDOW");
    assert.deepEqual(serviceCalls(calls), [], "a window the services do not know as normal never reaches the switch");
  } finally { restore(); }
});

test("an answer for a document that went away or changed window while the service worked is refused, not shown", async () => {
  let release;
  const hold = { promise: new Promise(resolve => { release = resolve; }) };
  const { services } = agentServices({ hold });
  const restore = setProvidersForTesting({ services: () => services });
  try {
    const actor = fakeActor({ name: "first" });
    const pending = request(actor, "getAgentEndpointState", {});
    await flush();
    actor.manager.isCurrentGlobal = false;
    release();
    assert.equal((await pending).error.code, "DOCUMENT_GONE");
    const moved = fakeActor({ name: "first" });
    let releaseMoved;
    const second = agentServices({ hold: { promise: new Promise(resolve => { releaseMoved = resolve; }) } });
    setProvidersForTesting({ services: () => second.services });
    const answer = request(moved, "listAgentActivity", { projectId: "p_harbor1" });
    await flush();
    moved.browsingContext.topChromeWindow = { name: "another-window" };
    releaseMoved();
    assert.equal((await answer).error.code, "NO_WINDOW");
    // Every method, not only the agent ones: a destroyed actor hands nothing over.
    const gone = fakeActor();
    let releaseGone;
    const held = new Promise(resolve => { releaseGone = resolve; });
    setProvidersForTesting({ services: () => ({ on: () => () => {}, listProjects: async () => { await held; return [{ id: "p_harbor1" }]; } }) });
    const late = request(gone, "listProjects", {});
    await flush();
    gone.didDestroy();
    releaseGone();
    assert.equal((await late).error.code, "DOCUMENT_GONE");
  } finally { restore(); }
});

// ---------------------------------------------------------------- page

const HTML = readFileSync(new URL("../chrome/overview/about-axiosozo.html", import.meta.url), "utf8");
const HARBOR = JSON.parse(readFileSync(new URL("../../../packages/contexts/tests/expected/harbor-suite.json", import.meta.url), "utf8"));
const INKLINE = JSON.parse(readFileSync(new URL("../../../packages/contexts/tests/expected/inkline.json", import.meta.url), "utf8"));
const HOME = "{11111111-1111-4111-8111-111111111111}";
let serial = 0;
const flush = async (rounds = 6) => { for (let i = 0; i < rounds; i++) await new Promise(resolve => setTimeout(resolve, 0)); };

async function loadPage({ projects = [], handlers = {}, hash = "" } = {}) {
  const document = parseHtml(HTML);
  const calls = [];
  const defaults = {
    getOverviewFlags: () => ({ contexts: true, enginePreferences: false, jevKeyEntry: true }),
    activeContext: () => ({ uuid: HOME }),
    listContexts: () => [{ uuid: HOME, name: "Home", icon: "", type: "personal", organization_uuid: null, project_id: null, container: 0 }],
    listProjects: () => projects,
    getProjectHome: ({ id }) => {
      const stored = projects.find(project => project.id === id);
      if (!stored) throw { code: "UNKNOWN_PROJECT", message: "UNKNOWN_PROJECT" };
      const { container: _mapping, ...project } = structuredClone(stored);
      return { version: 1, project, space: { uuid: HOME, name: "Home" }, container: { state: "pending" }, agent_activity: null, console_errors: null };
    },
    listRules: () => [], getJevSettings: () => ({ consent: false, interval_minutes: 5, hourly_budget: 30 }),
    usageSummary: () => [], listOrphans: () => [], needsAttention: () => [], serviceStatus: () => [],
    getJevKeyStatus: () => ({ id: "jev", label: "Jev", state: "needs-key", state_label: "No key stored", detail: "No Jev key is stored.", key: "missing", key_entry_enabled: true }),
    pickFolder: () => "/Volumes/Synthetic/harbor-suite",
    detect: () => HARBOR,
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
  const location = { hash };
  const listeners = new Map();
  Object.assign(globalThis, { document, Node, location,
    window: { AxioSozoOverview: api, addEventListener: (type, fn) => listeners.set(type, fn) },
    history: { replaceState: (_state, _title, url) => { location.hash = url; } },
    CSS: { escape: value => String(value).replace(/["\\]/g, "\\$&") } });
  await import(`../chrome/overview/about-axiosozo.mjs?actor-page=${++serial}`);
  await flush();
  const navigate = async next => { location.hash = next; listeners.get("hashchange")?.(); await flush(); };
  return { document, calls, navigate };
}
const factsOf = root => Object.fromEntries(root.querySelectorAll("dl dt").map(dt => {
  const dd = dt.parentNode.children[dt.parentNode.children.indexOf(dt) + 1];
  return [dt.textContent, dd];
}));

test("add-project preview shows services, apps, domains, docs domains as unconfirmed and agent presence, as text", async () => {
  const page = await loadPage();
  page.document.getElementById("add-project").click();
  await flush();
  const sheet = page.document.getElementById("sheet-body");
  const findings = sheet.querySelector("fieldset.findings");
  assert.ok(findings, "the preview has an Also found section");
  assert.equal(findings.querySelector("legend").textContent, "Also found in the folder");
  assert.match(findings.textContent, /never written to the folder/u);
  assert.match(findings.textContent, /noted by name only; they are not opened/u);
  const facts = factsOf(findings);
  assert.deepEqual(Object.keys(facts), ["Services", "Apps", "Domains", "Agents"]);
  assert.match(facts.Services.textContent, /^VercelConvexClerk/u);
  assert.equal(facts.Services.querySelectorAll("button").length, 0, "no links before the project exists");
  assert.equal(facts.Apps.textContent, "Desktop (Tauri) · Harbor SuitemacOS · HarborMaciOS · HarborMobileAndroid · mobile-app");
  assert.equal(facts.Agents.textContent, "AGENTS.mdCLAUDE.md.claude2 agent worktrees");
  assert.doesNotMatch(sheet.textContent, /\bnull\b|\bundefined\b|\[object /u);

  const docs = await loadPage({ handlers: { detect: () => INKLINE } });
  docs.document.getElementById("add-project").click();
  await flush();
  const docsFacts = factsOf(docs.document.getElementById("sheet-body").querySelector("fieldset.findings"));
  const documented = docsFacts["From docs"];
  assert.ok(documented, "documented domains have their own row");
  assert.ok(documented.querySelectorAll(".tag").every(tag => tag.classList.contains("unconfirmed")));
  assert.match(documented.textContent, /unconfirmed$/u);
  assert.ok(documented.querySelectorAll(".tag").every(tag => /Found in docs, unconfirmed/u.test(tag.getAttribute("title"))));
  assert.ok(docsFacts.Domains.querySelectorAll(".tag").every(tag => !tag.classList.contains("unconfirmed")));
});

test("detected strings are inserted as text, never as markup", async () => {
  const hostile = { ...HARBOR, integrations: [{ id: "sentry", name: "<img src=x onerror=alert(1)>", dashboard_url: "https://sentry.io/", sources: ["<b>x</b>"] }],
    agents: { files: ["AGENTS.md"], dirs: [], worktrees: 0 } };
  const page = await loadPage({ handlers: { detect: () => hostile } });
  page.document.getElementById("add-project").click();
  await flush();
  const findings = page.document.getElementById("sheet-body").querySelector("fieldset.findings");
  assert.equal(findings.querySelectorAll("img").length, 0);
  assert.match(findings.textContent, /<img src=x onerror=alert\(1\)>/u);
});

test("project cards and homes show the detected snapshot; services open their dashboards; Read folder again sends the id only", async () => {
  const detected = { at: 5, integrations: HARBOR.integrations, platforms: HARBOR.platforms,
    domains: [...HARBOR.domains.slice(0, 1), { host: "status.harborsuite.app", origin: "docs", source: "docs/ops/domains.md", confirmed: false }],
    agents: HARBOR.agents };
  const project = { version: 2, id: "p_harbor1", root: "/Volumes/Synthetic/harbor-suite", manifest_state: "none", context_uuid: HOME, trusted: false,
    created_at: 1, updated_at: 1, detected, container: { user_context_id: null }, shared_sites: { hosts: [], confirmed: false }, accounts: [], brief: null,
    manifest: { version: 1, name: "Harbor Suite", kind: "web", environments: [], services: [], surfaces: [] } };
  const legacy = { ...project, id: "p_legacy1", root: "/Volumes/Synthetic/legacy", detected: null,
    manifest: { ...project.manifest, name: "Legacy" } };
  let refreshed = null;
  const page = await loadPage({ projects: [project, legacy], handlers: {
    refreshProjectDetection: params => { refreshed = params; return project; },
    openProjectUrl: () => ({ opened: true, container: "project", selected: true }) } });
  const card = page.document.getElementById("project-p_harbor1");
  // The card: labelled phrases, not chips; its title is the link to the home.
  assert.deepEqual(card.querySelectorAll(".project-facts .fact").map(fact => fact.textContent), [
    "Apps: Desktop (Tauri), macOS, iOS and 1 more",
    `Services: ${HARBOR.integrations.slice(0, 3).map(item => item.name).join(", ")} and ${HARBOR.integrations.length - 3} more`]);
  assert.equal(card.querySelector("a.project-link").getAttribute("href"), "#project=p_harbor1");
  assert.equal(card.querySelectorAll("button.chip").length, 0);
  const legacyCard = page.document.getElementById("project-p_legacy1");
  assert.equal(legacyCard.querySelector(".project-facts"), null, "no snapshot, no detection facts");
  assert.ok(legacyCard.querySelectorAll(".menu-items button").some(button => button.textContent === "Read folder"));

  await page.navigate("#project=p_harbor1");
  const home = page.document.getElementById("project-home");
  const about = factsOf(home.querySelector('[data-section="about"]'));
  assert.deepEqual(Object.keys(about), ["Folder", "Project file", "Apps found", "Domains", "From docs", "Last read"]);
  assert.equal(about.Folder.textContent, "/Volumes/Synthetic/harbor-suite");
  assert.equal(about["Project file"].textContent, "Kept in this browser only");
  assert.match(about.Domains.textContent, new RegExp(`^${HARBOR.domains[0].host.replaceAll(".", "\\.")} · from the project's config files$`, "u"));
  assert.equal(about["From docs"].textContent, "status.harborsuite.appunconfirmed", "documented domains stay unconfirmed and are not links");
  assert.equal(about["From docs"].querySelectorAll("button, a").length, 0);
  const activity = home.querySelector('[data-section="activity"]');
  assert.match(activity.textContent, /In the folder: AGENTS\.md, CLAUDE\.md, \.claude, 2 agent worktrees\. These show the folder is set up for agents, not that one is running\./u);
  const convex = home.querySelectorAll("button").find(button => button.getAttribute("aria-label") === "Open the Convex dashboard");
  convex.click();
  await flush();
  // A project's dashboard link goes through the container router, never a plain openUrl.
  assert.deepEqual(page.calls.filter(([name]) => name === "openProjectUrl" || name === "openUrl"),
    [["openProjectUrl", { projectId: "p_harbor1", url: "https://dashboard.convex.dev/" }]]);
  await page.navigate("#projects");

  const menu = card.querySelectorAll(".menu-items button").find(button => button.textContent === "Read folder again");
  assert.equal(menu.getAttribute("role"), "menuitem");
  menu.click();
  await flush();
  assert.deepEqual(refreshed, { id: "p_harbor1" });
  assert.deepEqual(page.calls.find(([name]) => name === "refreshProjectDetection"), ["refreshProjectDetection", { id: "p_harbor1" }]);
  assert.match(page.document.getElementById("status").textContent, /Read the folder of Harbor Suite again\./u);
});

test("detection and refresh failures show fixed sentences, not raw codes", async () => {
  const page = await loadPage({ handlers: { detect: () => { throw { code: "READ_CONTAINMENT_UNAVAILABLE", message: "READ_CONTAINMENT_UNAVAILABLE" }; } } });
  page.document.getElementById("add-project").click();
  await flush();
  assert.equal(page.document.getElementById("sheet").open ?? false, false, "no review without a detection");
  assert.equal(page.document.getElementById("status").textContent, "This build cannot read project folders safely, so nothing was read.");
  const denied = await loadPage({ handlers: { detect: () => { throw { code: "ROOT_DENIED", message: "ROOT_DENIED" }; } } });
  denied.document.getElementById("add-project").click();
  await flush();
  assert.match(denied.document.getElementById("status").textContent, /does not read this folder/u);
});
