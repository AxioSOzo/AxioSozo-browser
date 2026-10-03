import test from "node:test";
import assert from "node:assert/strict";
import { AgentTabRegistry, createTabIdAllocator } from "../chrome/AgentTabRegistry.sys.mjs";
import { createConsoleErrorsService, ConsoleErrorsService, CONSOLE_CAPTURE_LEASE_MS,
  setConsoleErrorsService, getConsoleErrorsService } from "../chrome/ConsoleErrorsService.sys.mjs";
import { consolePrimitiveText } from "../chrome/ConsoleErrors.sys.mjs";

const noRead = () => { assert.fail("denied input must stay unread"); };
const errorCode = code => error => error?.code === code;
function fixture() {
  let now = 1000, revision = 1, authorityEpoch = 1, ready = true, lookups = 0, policies = 0,
    offerReads = 0, replyReads = 0, payloadReads = 0, sequence = 0, offers = 0;
  const windows = [{ private: false, registered: true, closed: false },
    { private: false, registered: true, closed: false }];
  const tabs = [], ids = new Map();
  const projects = new Map([["p_demo", { root: "/synthetic/demo" }], ["p_other", { root: "/synthetic/other" }]]);
  const registry = new AgentTabRegistry({
    isPrivateWindow: window => window.private,
    isWindowRegistered: window => window.registered,
    isWindowClosed: window => window.closed,
    isTabLive: tab => tab.live,
    getBrowser: tab => tab.browser,
    isPrivateBrowser: browser => browser.private,
    getBrowserIdentity: browser => ({ nativeBrowserId: browser.id, permanentKey: browser.key,
      browsingContext: browser.bc, frameLoader: browser.frameLoader, frameLoaderOwner: browser,
      frameLoaderContext: browser.bc }),
    getContextState: bc => ({ isContent: true, top: bc, isDiscarded: false, private: bc.browser.private,
      privateBrowsingId: bc.browser.private ? 1 : 0, userContextId: 0, embedder: bc.browser }),
    getCurrentDocument: bc => bc.global,
    getDocumentState: global => ({ browsingContext: global.bc, isCurrentGlobal: global.current,
      isClosed: false, failedChannel: global.failedChannel, document_id: String(global.id),
      principal: global.principal, isSystemPrincipal: false, isNullPrincipal: false,
      privateBrowsingId: 0, userContextId: 0 }),
    getDocumentURL: global => global.url,
    getTitle: () => "synthetic",
    getEngine: tab => tab.engine,
    isActiveTab: () => false,
    getRoute: tab => ({ contextUuid: null, revision: tab.route }),
    getProjectRevision: () => revision,
    matchProject: ({ url }) => ({ project_id: tabs.find(tab => tab.browser.bc.global.url === url)?.project ?? null,
      ambiguous: false, revision }),
    classifyHost: () => ({ sensitive: false }),
  }, { allocateId: createTabIdAllocator(), maxTabs: 4096 });
  const newActor = tab => (tab.actor = { tab, global: tab.browser.bc.global, registered: true });
  function add({ window = windows[0], project = "p_demo" } = {}) {
    const number = ++sequence, tab = { window, engine: "gecko", live: true, project, password: false,
      blocked: false, top: true, route: 1, navigation: "navigation-" + number };
    const browser = { id: number, private: false, key: {}, frameLoader: {} }, bc = { browser };
    const global = { id: number, bc, current: true, failedChannel: null, principal: {},
      url: "http://localhost:8080/" + number };
    browser.bc = bc; bc.global = global; tab.browser = browser;
    tabs.push(tab); tab.id = registry.register(tab, window); ids.set(tab.id, tab);
    newActor(tab); return tab;
  }
  const deps = {
    clock: () => now,
    isNormalWindow: window => window.registered === true && window.closed === false && window.private === false,
    readPolicy: owner => {
      policies++;
      const tab = owner.tab ?? ids.get(owner.tab_id);
      const cheap = { normal: !!tab && tab.window === owner.window && tab.live === true,
        private: tab?.browser.private, engine: tab?.engine, blocked_category: tab?.blocked, window: tab?.window };
      // This fake models the private-first adapter contract without native/DOM execution.
      if (!tab || cheap.normal !== true || cheap.private !== false || cheap.engine !== "gecko"
        || cheap.blocked_category !== false) return cheap;
      const global = tab.browser.bc.global;
      return { ...cheap, current: global.current, top_level: tab.top, tab_id: tab.id, tab,
        windowGlobal: global, document_id: String(global.id), navigation_id: tab.navigation,
        url: global.url, project_id: tab.project, project_revision: tab.policyRevision ?? revision,
        route_revision: tab.route, get password_risk() { noRead(); } };
    },
    readProjectAuthority: ({ project_id }) => {
      const project = projects.get(project_id), root = project?.root, capturedRevision = revision, capturedEpoch = authorityEpoch;
      return { id: project_id, root, revision: capturedRevision,
        check: () => ready && authorityEpoch === capturedEpoch && revision === capturedRevision && projects.get(project_id)?.root === root };
    },
    isActorCurrent: (actor, scope) => actor.registered === true && actor.tab === scope.tab
      && actor.global === scope.windowGlobal && scope.tab.actor === actor && scope.tab.window === scope.window,
    registry: {
      withTrusted: (...args) => { lookups++; return registry.withTrusted(...args); },
      withConsoleInventory: (...args) => registry.withConsoleInventory(...args),
    },
  };
  const { service, captures } = createConsoleErrorsService(deps);
  const reregister = tab => {
    const old = tab.id; ids.delete(old); tab.id = registry.register(tab, tab.window);
    ids.set(tab.id, tab); return old;
  };
  const owner = (tab, actor = tab.actor) => ({ window: tab.window, tab_id: tab.id, windowGlobal: actor.global });
  const approval = tab => service.authorize(owner(tab));
  const offer = (tab, overrides = {}) => ({ v: 1, offer_id: "o_" + (++offers),
    document_id: String(tab.browser.bc.global.id), observed_at: now, ...overrides });
  const begin = (tab, overrides = {}) => {
    const grant = approval(tab);
    if (!grant.enabled) return null;
    now = Math.max(now + 1, grant.not_before);
    const offered = offer(tab, overrides);
    const started = captures.begin(owner(tab), tab.actor, () => { offerReads++; return offered; });
    return started && { ...started, offer: offered, actor: tab.actor, tab };
  };
  const packet = (request, overrides = {}) => ({ v: 1, document_id: request.challenge.document_id,
    navigation_token: request.challenge.navigation_token, observed_at: request.offer.observed_at,
    level: "error", text: "synthetic failure", source: "http://localhost:8080/app.js", line: 7, ...overrides });
  const envelope = (request, data) => ({ v: 1, lease_id: request.challenge.lease_id,
    offer_id: request.challenge.offer_id, packet: data });
  // Wrapper fake only: production Claude actor must perform its actual native
  // checks and scalar copy synchronously. This helper is not native verification.
  const childReply = (request, readPayload) => {
    const { tab, actor } = request;
    if (tab.window.private !== false || tab.browser.private !== false || actor.registered !== true
      || actor.global !== tab.browser.bc.global || actor.global.current !== true || tab.top !== true
      || tab.engine !== "gecko" || tab.blocked !== false || tab.password !== false)
      return envelope(request, null);
    payloadReads++; return envelope(request, readPayload());
  };
  const complete = (request, overrides = {}, readPayload = () => packet(request, overrides)) =>
    captures.complete(request.lease, request.actor, () => { replyReads++; return childReply(request, readPayload); });
  const emit = (tab, overrides = {}) => {
    const request = begin(tab), permit = request && complete(request, overrides);
    return !!permit && service.acceptCapture(permit);
  };
  const handoff = tab => ({ window: tab.window, tab, windowGlobal: tab.browser.bc.global,
    url: tab.browser.bc.global.url, document_id: String(tab.browser.bc.global.id), navigation_id: tab.navigation,
    project_id: tab.project, project_root: projects.get(tab.project)?.root, project_revision: revision });
  return { service, captures, registry, deps, windows, tabs, projects, add, reregister, owner, approval, offer,
    begin, packet, envelope, childReply, complete, emit, handoff, newActor,
    clock: value => { now = value; }, now: () => now, advance: value => { now += value; },
    revision: value => { revision = value; }, authorityEpoch: value => { authorityEpoch = value; },
    ready: value => { ready = value; },
    reads: () => ({ lookups, policies, offerReads, replyReads, payloadReads }),
    resetReads: () => { lookups = 0; policies = 0; offerReads = 0; replyReads = 0; payloadReads = 0; } };
}

test("service-only consumers have no capture factory, parent observer, native or automatic send effect", () => {
  const f = fixture();
  assert.deepEqual(f.reads(), { lookups: 0, policies: 0, offerReads: 0, replyReads: 0, payloadReads: 0 });
  for (const name of ["captures", "begin", "complete", "observe", "observeScriptError", "start", "send",
    "executeMethod", "registerActor"]) assert.equal(f.service[name], undefined);
  assert.throws(() => new ConsoleErrorsService({}), errorCode("INVALID_DEPENDENCIES"));
  assert.throws(() => setConsoleErrorsService({}), errorCode("INVALID_RUNTIME"));
  setConsoleErrorsService(f.service); assert.equal(getConsoleErrorsService(), f.service);
  f.service.dispose(); assert.equal(getConsoleErrorsService(), null);
  assert.equal(f.service.refresh(), false);
});

test("ordinary normal page succeeds without any synchronous parent password fact", () => {
  const f = fixture(), tab = f.add(), request = f.begin(tab);
  assert.ok(request);
  assert.deepEqual(Object.keys(request.lease), []);
  assert.equal(Object.getPrototypeOf(request.lease), null);
  assert.equal(Object.isFrozen(request.lease), true);
  assert.equal(Object.isFrozen(request.challenge), true);
  const permit = f.complete(request);
  assert.ok(permit); assert.deepEqual(Object.keys(permit), []);
  assert.equal(Object.getPrototypeOf(permit), null); assert.equal(Object.isFrozen(permit), true);
  assert.equal(f.service.acceptCapture(permit), true);
  assert.equal(f.service.readTab(f.owner(tab)).count, 1);
});

test("immutable sanitized tab/home/handoff copies use the shared registry ID and name-only events", () => {
  const f = fixture(), tab = f.add(), events = [];
  f.service.onChange(event => events.push(event));
  assert.equal(f.emit(tab, { text: "safe\u0000\u202e", source: "https://user:secret@example.invalid/app.js?token=secret#secret",
    line: 0xffffffff }), true);
  const result = f.service.readTab(f.owner(tab));
  assert.equal(result.count, 1); assert.equal(result.messages[0].text, "safe  ");
  assert.equal(result.messages[0].source, "https://example.invalid/app.js");
  assert.equal(result.messages[0].at, 1001);
  assert.throws(() => result.messages.push({}), TypeError);
  assert.throws(() => { result.messages[0].text = "changed"; }, TypeError);
  assert.deepEqual(f.service.readProject({ window: tab.window, project_id: tab.project }),
    { count: 1, recent: [{ level: "error", text: "safe  " }] });
  const handoff = f.service.readHandoff(f.handoff(tab));
  assert.equal(handoff.tab_id, tab.id); assert.equal(handoff.console_errors[0].line, null);
  assert.deepEqual(events, [{ name: "console" }]); assert.equal(Object.isFrozen(events[0]), true);
});


test("retention permit keeps validated scalar copies when the original query object changes later", () => {
  const f = fixture(), tab = f.add(), request = f.begin(tab), raw = f.packet(request);
  const result = f.envelope(request, raw);
  const permit = f.captures.complete(request.lease, request.actor, () => result); assert.ok(permit);
  raw.text = "late modification"; raw.source = "file:///later"; raw.line = 99;
  result.packet = null;
  assert.equal(f.service.acceptCapture(permit), true);
  const retained = f.service.readTab(f.owner(tab));
  assert.equal(retained.messages[0].text, "synthetic failure");
  assert.equal(retained.messages[0].source, "http://localhost:8080/app.js");
  assert.equal(retained.messages[0].line, 7);
});

test("lease and retention authority cannot be reconstructed from copied objects or page JSON claims", () => {
  const f = fixture(), tab = f.add(), request = f.begin(tab);
  for (const forged of [null, {}, { ...request.lease }, structuredClone(request.lease), request.challenge,
    { ...request.challenge, private: false, password_risk: false, normal: true }])
    assert.equal(f.captures.complete(forged, request.actor, noRead), null);
  const permit = f.complete(request);
  for (const forged of [null, {}, { ...permit }, structuredClone(permit), request.lease,
    { ...request.challenge, packet: f.packet(request), password_risk: false }])
    assert.equal(f.service.acceptCapture(forged), false);
  assert.equal(f.service.acceptCapture(permit), true);
  assert.equal(f.service.acceptCapture(permit), false);
  assert.equal(f.service.readTab(f.owner(tab)).count, 1);
  assert.equal(f.captures.complete(request.lease, request.actor, noRead), null);
});

test("exact actor object is required; another actor consumes lease without inspecting its reply", () => {
  const f = fixture(), tab = f.add(), request = f.begin(tab);
  assert.equal(f.captures.complete(request.lease, { ...request.actor }, noRead), null);
  assert.equal(f.captures.complete(request.lease, request.actor, noRead), null);
  assert.equal(f.service.readTab(f.owner(tab)).count, 0);
  f.resetReads();
  assert.equal(f.captures.begin(f.owner(tab), { ...tab.actor }, noRead), null);
  tab.actor.registered = false;
  assert.equal(f.captures.begin(f.owner(tab), tab.actor, noRead), null);
  assert.equal(f.reads().offerReads, 0);
});

test("lease cancellation is object-identity bound and one-use, permitting a fresh offer", () => {
  const f = fixture(), tab = f.add(), request = f.begin(tab);
  assert.equal(f.captures.cancel({}), false);
  assert.equal(f.captures.cancel(request.lease), true);
  assert.equal(f.captures.cancel(request.lease), false);
  assert.equal(f.captures.complete(request.lease, request.actor, noRead), null);
  assert.equal(f.emit(tab), true);
});

test("lease/permit expiry and backward clocks refuse before reply or retention", () => {
  for (const phase of ["lease", "permit", "backward"]) {
    const f = fixture(), tab = f.add(), request = f.begin(tab);
    const permit = phase === "permit" ? f.complete(request) : null;
    if (phase === "backward") f.clock(f.now() - 1);
    else f.advance(CONSOLE_CAPTURE_LEASE_MS + 1);
    if (permit) assert.equal(f.service.acceptCapture(permit), false);
    else assert.equal(f.captures.complete(request.lease, request.actor, noRead), null);
    assert.equal(f.service.readTab(f.owner(tab)).count, 0);
  }
});

test("deadline is checked after native callbacks as well as before them", () => {
  const f = fixture(), tab = f.add(), request = f.begin(tab);
  const actorCurrent = f.deps.isActorCurrent;
  f.deps.isActorCurrent = (...args) => { f.advance(CONSOLE_CAPTURE_LEASE_MS + 1); return actorCurrent(...args); };
  assert.equal(f.captures.complete(request.lease, request.actor, noRead), null);
  f.deps.isActorCurrent = actorCurrent;
  assert.equal(f.service.readTab(f.owner(tab)).count, 0);
});

test("one tab has only one pending lease or unconsumed retention permit", () => {
  const f = fixture(), tab = f.add(), request = f.begin(tab);
  assert.equal(f.captures.begin(f.owner(tab), tab.actor, noRead), null);
  const permit = f.complete(request);
  assert.equal(f.captures.begin(f.owner(tab), tab.actor, noRead), null);
  assert.equal(f.service.acceptCapture(permit), true);
  assert.equal(f.emit(tab), true);
});

test("reentrant admission and completion cannot open a second slot", () => {
  for (const phase of ["policy", "offer", "reply"]) {
    const f = fixture(), tab = f.add(); f.approval(tab); f.advance(1);
    let nested, started;
    if (phase === "policy") {
      const policy = f.deps.readPolicy;
      f.deps.readPolicy = owner => {
        const value = policy(owner);
        if (nested === undefined) nested = f.captures.begin(f.owner(tab), tab.actor, noRead);
        return value;
      };
      started = f.captures.begin(f.owner(tab), tab.actor, () => f.offer(tab));
      f.deps.readPolicy = policy;
    } else if (phase === "offer") {
      started = f.captures.begin(f.owner(tab), tab.actor, () => {
        nested = f.captures.begin(f.owner(tab), tab.actor, noRead); return f.offer(tab);
      });
    } else {
      const request = f.begin(tab);
      const permit = f.captures.complete(request.lease, request.actor, () => {
        nested = f.captures.begin(f.owner(tab), tab.actor, noRead);
        assert.equal(f.captures.complete(request.lease, request.actor, noRead), null);
        return f.childReply(request, () => f.packet(request));
      });
      assert.ok(permit); assert.equal(f.service.acceptCapture(permit), true);
    }
    assert.equal(nested, null);
    if (started) assert.equal(f.captures.cancel(started.lease), true);
  }
});

test("expired slots can be replaced while their late response or permit remains inert", () => {
  for (const phase of ["lease", "permit"]) {
    const f = fixture(), tab = f.add(), old = f.begin(tab), permit = phase === "permit" ? f.complete(old) : null;
    f.advance(CONSOLE_CAPTURE_LEASE_MS + 1);
    const current = f.begin(tab); assert.ok(current);
    assert.equal(f.captures.complete(old.lease, old.actor, noRead), null);
    if (permit) assert.equal(f.service.acceptCapture(permit), false);
    assert.equal(f.service.acceptCapture(f.complete(current)), true);
  }
});

test("no private window policy, registry, offer or response reads, including earlier retained records", () => {
  const f = fixture(), tab = f.add(); f.emit(tab);
  const request = f.begin(tab); f.resetReads(); tab.window.private = true;
  assert.equal(f.captures.complete(request.lease, request.actor, noRead), null);
  assert.equal(f.captures.begin(f.owner(tab), tab.actor, noRead), null);
  assert.deepEqual(f.approval(tab), { enabled: false });
  assert.throws(() => f.service.readTab(f.owner(tab)), errorCode("PRIVATE"));
  assert.equal(f.service.readProject({ window: tab.window, project_id: tab.project }), null);
  assert.equal(f.service.readCounts({ window: tab.window }), null);
  assert.throws(() => f.service.readHandoff(f.handoff(tab)), errorCode("PRIVATE"));
  assert.deepEqual(f.reads(), { lookups: 0, policies: 0, offerReads: 0, replyReads: 0, payloadReads: 0 });
  tab.window.private = false;
  assert.equal(f.service.readTab(f.owner(tab)).count, 0);
});

for (const [name, mutate] of [
  ["private browser", tab => { tab.browser.private = true; }],
  ["Chromium", tab => { tab.engine = "chromium"; }],
  ["blocked category", tab => { tab.blocked = true; }],
  ["stale current document", tab => { tab.browser.bc.global.current = false; }],
  ["nested frame", tab => { tab.top = false; }],
  ["unknown project", tab => { tab.project = null; }],
  ["stale project revision", tab => { tab.policyRevision = 0; }],
]) test(name + " refuses before registry and application input", () => {
  const f = fixture(), tab = f.add(); f.emit(tab); mutate(tab); f.resetReads();
  assert.equal(f.captures.begin(f.owner(tab), tab.actor, noRead), null);
  assert.deepEqual(f.approval(tab), { enabled: false });
  assert.equal(f.reads().lookups, 0);
  assert.equal(f.reads().offerReads, 0); assert.equal(f.reads().replyReads, 0);
});


for (const [name, mutate] of [
  ["private window", tab => { tab.window.private = true; }],
  ["private browser", tab => { tab.browser.private = true; }],
  ["Chromium", tab => { tab.engine = "chromium"; }],
  ["blocked category", tab => { tab.blocked = true; }],
  ["stale current document", tab => { tab.browser.bc.global.current = false; }],
  ["nested frame", tab => { tab.top = false; }],
  ["unknown project", tab => { tab.project = null; }],
]) test(name + " arising across query or before retention refuses before registry or response input", () => {
  for (const phase of ["query", "retention"]) {
    const f = fixture(), tab = f.add(); f.emit(tab);
    const request = f.begin(tab), permit = phase === "retention" ? f.complete(request) : null;
    mutate(tab); f.resetReads();
    if (permit) assert.equal(f.service.acceptCapture(permit), false);
    else assert.equal(f.captures.complete(request.lease, request.actor, noRead), null);
    assert.equal(f.reads().lookups, 0); assert.equal(f.reads().replyReads, 0);
    assert.equal(f.reads().payloadReads, 0);
    if (name === "private window") assert.equal(f.reads().policies, 0);
  }
});

test("private browser refusal does not read its current-document getter", () => {
  const f = fixture(), tab = f.add(), request = f.begin(tab);
  tab.browser.private = true;
  Object.defineProperty(tab.browser.bc, "global", { get: noRead });
  assert.equal(f.captures.complete(request.lease, request.actor, noRead), null);
  assert.equal(f.captures.begin({ window: tab.window, tab_id: tab.id, windowGlobal: request.actor.global },
    request.actor, noRead), null);
});

test("unknown opaque ID and nonquiescent project refuse before registry and offer reads", () => {
  const f = fixture(), tab = f.add();
  assert.equal(f.captures.begin({ window: tab.window, tab_id: "t_999" }, tab.actor, noRead), null);
  assert.equal(f.reads().lookups, 0);
  f.ready(false); f.resetReads();
  assert.equal(f.captures.begin(f.owner(tab), tab.actor, noRead), null);
  assert.equal(f.reads().lookups, 0);
});

test("trusted wrapper refuses true or unknown child password risk before reading scalar input", () => {
  for (const password of [true, null, undefined]) {
    const f = fixture(), tab = f.add(), request = f.begin(tab);
    tab.password = password;
    assert.equal(f.complete(request, {}, noRead), null);
    assert.equal(f.reads().payloadReads, 0);
    assert.equal(f.service.readTab(f.owner(tab)).count, 0);
  }
});

test("immutable past capture survives later password risk while future child captures refuse", () => {
  const f = fixture(), tab = f.add(), request = f.begin(tab), permit = f.complete(request);
  tab.password = true;
  assert.equal(f.service.acceptCapture(permit), true);
  assert.equal(f.service.readProject({ window: tab.window, project_id: tab.project }).count, 1);
  const next = f.begin(tab); assert.ok(next);
  const readBefore = f.reads().payloadReads;
  assert.equal(f.complete(next, {}, noRead), null);
  assert.equal(f.reads().payloadReads, readBefore);
  assert.equal(f.service.readTab(f.owner(tab)).count, 1);
});

const rebound = [
  ["global object with the same document ID", f => { const tab = f.tabs[0]; tab.browser.bc.global = { ...tab.browser.bc.global }; }],
  ["document ID", f => { f.tabs[0].browser.bc.global.id = 99; }],
  ["principal", f => { f.tabs[0].browser.bc.global.principal = {}; }],
  ["native browser ID", f => { f.tabs[0].browser.id++; }],
  ["browser permanent key", f => { f.tabs[0].browser.key = {}; }],
  ["frame loader", f => { f.tabs[0].browser.frameLoader = {}; }],
  ["navigation identity", f => { f.tabs[0].navigation += "-new"; }],
  ["document URL", f => { f.tabs[0].browser.bc.global.url += "/new"; }],
  ["project root", f => { f.projects.get("p_demo").root = "/synthetic/replaced"; }],
  ["project revision", f => { f.revision(2); }],
  ["route revision", f => { f.tabs[0].route++; }],
  ["actor instance", f => { f.newActor(f.tabs[0]); }],
];
for (const [name, mutate] of rebound) test(name + " across query or before retention invalidates exact capture scope", () => {
  for (const phase of ["query", "retention"]) {
    const f = fixture(), tab = f.add(); f.emit(tab);
    const request = f.begin(tab), permit = phase === "retention" ? f.complete(request) : null;
    mutate(f);
    if (permit) assert.equal(f.service.acceptCapture(permit), false);
    else assert.equal(f.captures.complete(request.lease, request.actor, noRead), null);
    f.newActor(tab);
    if (name === "native browser ID" || name === "browser permanent key") {
      // Existing registry ownership remains refused until trusted re-registration.
      assert.throws(() => f.service.readTab(f.owner(tab)), errorCode("STALE_TAB"));
      const oldId = f.reregister(tab); assert.notEqual(tab.id, oldId);
      assert.equal(f.service.refresh(), true);
    }
    assert.equal(f.service.readTab(f.owner(tab)).count, 0);
  }
});


test("the originally captured project check binds cache generation even when root/revision look unchanged", () => {
  for (const phase of ["query", "retention"]) {
    const f = fixture(), tab = f.add(); f.emit(tab);
    const request = f.begin(tab), permit = phase === "retention" ? f.complete(request) : null;
    f.authorityEpoch(2);
    if (permit) assert.equal(f.service.acceptCapture(permit), false);
    else assert.equal(f.captures.complete(request.lease, request.actor, noRead), null);
    assert.equal(f.service.readTab(f.owner(tab)).count, 0);
  }
});

test("same-document navigation and routing invalidation revoke before clear callbacks and queued replies", () => {
  for (const phase of ["query", "retention"]) {
    for (const mode of ["navigation", "routing"]) {
      const f = fixture(), tab = f.add(); f.emit(tab);
      const request = f.begin(tab), permit = phase === "retention" ? f.complete(request) : null;
      let duringClear;
      f.service.onChange(() => {
        if (duringClear === undefined) duringClear = permit
          ? f.service.acceptCapture(permit) : f.captures.complete(request.lease, request.actor, noRead);
      });
      if (mode === "navigation") assert.equal(f.service.onNavigation(f.owner(tab)), true);
      else f.service.invalidateProjects();
      assert.equal(duringClear, permit ? false : null);
      assert.notEqual(f.approval(tab).navigation_token, request.challenge.navigation_token);
      assert.equal(f.service.readTab(f.owner(tab)).count, 0);
    }
  }
});

test("reentrant reply mutation and last native callback revocation cannot mint a permit", () => {
  for (const mode of ["reader", "nativeCallback"]) {
    const f = fixture(), tab = f.add(), request = f.begin(tab);
    let permit;
    if (mode === "reader") {
      permit = f.captures.complete(request.lease, request.actor, () => {
        const data = f.envelope(request, f.packet(request));
        f.service.onNavigation(f.owner(tab)); return data;
      });
    } else {
      const isCurrent = f.deps.isActorCurrent;
      f.deps.isActorCurrent = (...args) => {
        f.service.onNavigation(f.owner(tab)); return isCurrent(...args);
      };
      permit = f.captures.complete(request.lease, request.actor, noRead);
      f.deps.isActorCurrent = isCurrent;
    }
    assert.equal(permit, null);
    assert.equal(f.service.readTab(f.owner(tab)).count, 0);
  }
});

test("record-listener revocation clears RAM and causes retention failure without sending", () => {
  const f = fixture(), tab = f.add(); let revoked = false;
  f.service.onChange(event => {
    assert.deepEqual(event, { name: "console" });
    if (!revoked) { revoked = true; f.service.onNavigation(f.owner(tab)); }
  });
  assert.equal(f.emit(tab), false);
  assert.equal(f.service.readTab(f.owner(tab)).count, 0);
});

test("malformed/extra/getter metadata and replies are rejected without accessor reads", () => {
  const f = fixture(), tab = f.add(); f.approval(tab); f.advance(1);
  const badOffer = f.offer(tab); Object.defineProperty(badOffer, "offer_id", { get: noRead, enumerable: true });
  assert.equal(f.captures.begin(f.owner(tab), tab.actor, () => badOffer), null);
  assert.equal(f.captures.begin(f.owner(tab), tab.actor, () => f.offer(tab, { password_risk: false })), null);
  for (const kind of ["getter", "extra", "wrongLease", "wrongOffer"]) {
    const request = f.begin(tab);
    const reply = f.envelope(request, f.packet(request));
    if (kind === "getter") Object.defineProperty(reply, "packet", { get: noRead, enumerable: true });
    if (kind === "extra") reply.password_risk = false;
    if (kind === "wrongLease") reply.lease_id += "-forged";
    if (kind === "wrongOffer") reply.offer_id += "-forged";
    assert.equal(f.captures.complete(request.lease, request.actor, () => reply), null);
    assert.equal(f.captures.complete(request.lease, request.actor, noRead), null);
  }
  assert.equal(f.service.readTab(f.owner(tab)).count, 0);
});

test("event timestamp, navigation token and document identity bind the exact offered packet", () => {
  for (const overrides of [{ document_id: "99" }, { navigation_token: "n_99999" }, { observed_at: 0 },
    { observed_at: Number.MAX_SAFE_INTEGER }, { level: "log" }]) {
    const f = fixture(), tab = f.add(), request = f.begin(tab);
    assert.equal(f.complete(request, overrides), null);
  }
  const f = fixture(), tab = f.add(); f.approval(tab); f.advance(1);
  assert.equal(f.captures.begin(f.owner(tab), tab.actor, () => f.offer(tab, { observed_at: 0 })), null);
  assert.equal(f.captures.begin(f.owner(tab), tab.actor, () => f.offer(tab, { observed_at: f.now() + 1001 })), null);
});

test("source, text, frame/error-page, getter and primitive boundaries fail closed", () => {
  const f = fixture(), tab = f.add();
  for (const source of ["chrome://browser/app.js", "about:blank", "file:///private.js", "data:text/plain,x",
    "blob:http://localhost/x", "moz-extension://fake/app.js", "http://localhost/" + "x".repeat(2048)])
    assert.equal(f.emit(tab, { source }), false);
  assert.equal(f.emit(tab, { text: "x".repeat(1001) }), false);
  assert.equal(f.emit(tab, { text: "x".repeat(1000) }), true);
  const request = f.begin(tab), data = f.packet(request);
  Object.defineProperty(data, "text", { get: noRead, enumerable: true });
  assert.equal(f.complete(request, {}, () => data), null);
  tab.browser.bc.global.failedChannel = {};
  assert.equal(f.captures.begin(f.owner(tab), tab.actor, noRead), null);
  assert.equal(consolePrimitiveText([null, {}, undefined, Symbol(), 1n]), null);
  assert.equal(consolePrimitiveText(["x", true, 4]), "x true 4");
});

test("untrusted scalar object or argument getter is never coerced or serialized", () => {
  const value = { get toJSON() { noRead(); }, toString: noRead, valueOf: noRead };
  const args = ["safe", value];
  Object.defineProperty(args, "2", { get: noRead }); args.length = 3;
  assert.equal(consolePrimitiveText(args), "safe");
});

test("metadata failures and cancelled requests consume 30/sec budget before input; tabs are independent", () => {
  const f = fixture(), tab = f.add(), other = f.add(); f.approval(tab); f.advance(1);
  for (let i = 0; i < 15; i++)
    assert.equal(f.captures.begin(f.owner(tab), tab.actor, () => f.offer(tab, { v: 2 })), null);
  for (let i = 0; i < 15; i++) {
    const request = f.captures.begin(f.owner(tab), tab.actor, () => f.offer(tab)); assert.ok(request);
    assert.equal(f.captures.cancel(request.lease), true);
  }
  assert.equal(f.captures.begin(f.owner(tab), tab.actor, noRead), null);
  assert.equal(f.emit(other), true);
  f.advance(1001); assert.equal(f.emit(tab), true);
});

test("1000/document budget survives same-document navigation, unlink/relink and unknown inventory", () => {
  const f = fixture(), tab = f.add();
  for (let i = 0; i < 1000; i++) {
    f.advance(1001); const request = f.begin(tab); assert.ok(request);
    assert.equal(f.captures.cancel(request.lease), true);
  }
  f.service.onNavigation(f.owner(tab)); f.advance(1001); f.approval(tab);
  assert.equal(f.captures.begin(f.owner(tab), tab.actor, noRead), null);
  tab.project = null; assert.equal(f.service.refresh(), true);
  const inventory = f.deps.registry.withConsoleInventory;
  f.deps.registry.withConsoleInventory = () => null;
  assert.equal(f.service.refresh(), false);
  f.deps.registry.withConsoleInventory = inventory;
  tab.project = "p_demo"; f.advance(1001); f.approval(tab);
  assert.equal(f.captures.begin(f.owner(tab), tab.actor, noRead), null);
  tab.browser.bc.global = { ...tab.browser.bc.global, id: 999, principal: {} }; f.newActor(tab);
  assert.equal(f.emit(tab), true);
});

test("RAM retention is 50; newest-five project preview and counts are window/project scoped", () => {
  const f = fixture(), tab = f.add(), other = f.add({ project: "p_other" }),
    elsewhere = f.add({ window: f.windows[1] });
  for (let i = 0; i < 60; i++) {
    f.advance(1001);
    assert.equal(f.emit(tab, { level: i % 2 ? "warning" : "error", text: String(i) }), true);
  }
  f.emit(other, { text: "other project" }); f.emit(elsewhere, { text: "other window" });
  const retained = f.service.readTab(f.owner(tab)), home = f.service.readProject({ window: tab.window, project_id: tab.project });
  assert.equal(retained.count, 50); assert.equal(retained.messages[0].text, "10");
  assert.equal(home.count, 50); assert.deepEqual(home.recent.map(item => item.text), ["59", "58", "57", "56", "55"]);
  assert.deepEqual(f.service.readCounts({ window: tab.window }),
    [{ project_id: "p_demo", count: 50, errors: 25, warnings: 25, tabs: 1 },
      { project_id: "p_other", count: 1, errors: 1, warnings: 0, tabs: 1 }]);
  assert.equal(f.service.readProject({ window: tab.window, project_id: "p_missing" }), null);
});

test("confirmed ownership retirement releases leases/permits and frees bounded tombstone slots", () => {
  const f = fixture();
  for (let i = 0; i < 2048; i++) assert.equal(f.approval(f.add()).enabled, true);
  const extra = f.add(); assert.deepEqual(f.approval(extra), { enabled: false });
  assert.equal(f.captures.begin(f.owner(extra), extra.actor, noRead), null);
  const old = f.begin(f.tabs[0]); assert.ok(old);
  f.registry.forget(f.tabs[0].id); assert.equal(f.service.refresh(), true);
  assert.equal(f.captures.complete(old.lease, old.actor, noRead), null);
  assert.equal(f.approval(extra).enabled, true);
});

test("handoff compares native ownership and capture facts and ignores caller-invented temporary ID", () => {
  const f = fixture(), tab = f.add(); f.emit(tab);
  for (const [field, value, code] of [
    ["url", "http://localhost:8080/wrong", "STALE_TAB"], ["document_id", "999", "STALE_TAB"],
    ["navigation_id", "old", "STALE_TAB"], ["project_id", "p_other", "PROJECT_CHANGED"],
    ["project_root", "/synthetic/other", "PROJECT_CHANGED"], ["project_revision", 0, "PROJECT_CHANGED"],
  ]) assert.throws(() => f.service.readHandoff({ ...f.handoff(tab), [field]: value }), errorCode(code));
  assert.equal(f.service.readHandoff({ ...f.handoff(tab), tab_id: "t_999" }).tab_id, tab.id);
});

test("collected-empty is immutable and distinct from unavailable and invalid project", () => {
  const f = fixture(), tab = f.add();
  assert.deepEqual(f.service.readProject({ window: tab.window, project_id: tab.project }), { count: 0, recent: [] });
  f.resetReads();
  for (const params of [{ window: tab.window }, { window: tab.window, project_id: null },
    { window: tab.window, project_id: "bad" }]) assert.equal(f.service.readProject(params), null);
  assert.equal(f.reads().lookups, 0);
  f.ready(false); assert.equal(f.service.readProject({ window: tab.window, project_id: tab.project }), null);
});

test("privacy-safe inventory reads only ID/window and disposal makes every retained capability inert", () => {
  for (const phase of ["lease", "permit"]) {
    const f = fixture(), tab = f.add(), request = f.begin(tab);
    const permit = phase === "permit" ? f.complete(request) : null;
    tab.window.private = true;
    f.deps.registry.withConsoleInventory = callback => callback([
      { tab_id: tab.id, window: tab.window, get tab() { noRead(); }, get browser() { noRead(); } },
    ]);
    assert.equal(f.service.refresh(), true); f.service.dispose();
    assert.equal(f.captures.complete(request.lease, request.actor, noRead), null);
    assert.equal(f.captures.cancel(request.lease), false);
    assert.equal(f.service.acceptCapture(permit), false);
    assert.equal(f.captures.begin(f.owner(tab), tab.actor, noRead), null);
  }
});

test("last native projection callback cannot return a snapshot revoked internally", () => {
  for (const mode of ["tab", "handoff", "home", "counts"]) {
    const f = fixture(), tab = f.add(); f.emit(tab);
    const policy = f.deps.readPolicy; let calls = 0;
    f.deps.readPolicy = owner => {
      const result = policy(owner);
      if (++calls === 4) f.service.onNavigation(f.owner(tab));
      return result;
    };
    if (mode === "tab" || mode === "handoff")
      assert.throws(() => mode === "tab" ? f.service.readTab(f.owner(tab)) : f.service.readHandoff(f.handoff(tab)),
        errorCode("STALE_TAB"));
    else assert.equal(mode === "home" ? f.service.readProject({ window: tab.window, project_id: tab.project })
      : f.service.readCounts({ window: tab.window }), null);
    f.deps.readPolicy = policy; assert.equal(f.service.readTab(f.owner(tab)).count, 0);
  }
});
