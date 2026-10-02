/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. https://mozilla.org/MPL/2.0/ */

// ProjectArrivalRuntime against a synthetic browser window: tabs, a tabs
// progress listener, notification boxes and a manual clock. Services are fakes
// that record what the runtime asks (offer, accept, discard); the privileged
// token rules themselves are covered in axiosozo-services.test.mjs. Not
// evidence of a running browser or of Zen's notification styling.
import test from "node:test";
import assert from "node:assert/strict";
import "./support/chrome-modules.mjs";

const { installProjectArrival, arrivalMessage, arrivalFailureMessage, arrivalCandidate, NOTIFICATION_VALUE,
  RESULT_NOTIFICATION_VALUE, ARRIVAL_SETTLE_MS } = await import("../chrome/ProjectArrivalRuntime.sys.mjs");
const { WPL } = await import("../chrome/DevLoop.sys.mjs");

const HOME = "11111111-1111-4111-8111-111111111111";
const ROOT = "/Volumes/T9/Code/harbor-suite";
const LOCAL = "http://localhost:5173/board?x=1#top";

function fakeWindow() {
  let now = 1_000_000;
  const queue = [];
  let nextTimer = 0;
  const timers = {
    setTimeout(fn, ms) { const id = ++nextTimer; queue.push({ id, at: now + ms, fn }); return id; },
    clearTimeout(id) { const index = queue.findIndex(item => item.id === id); if (index >= 0) queue.splice(index, 1); },
  };
  const tabListeners = new Map();
  const progress = new Set();
  const boxes = new Map();
  const tabs = [];
  // When `held.on` is set, appendNotification waits until the test releases
  // it, like Gecko's asynchronous custom-element creation.
  const held = { on: false, waiting: [] };
  const makeBox = () => {
    const shown = [];
    return { shown, all: [], PRIORITY_INFO_LOW: 1, PRIORITY_INFO_MEDIUM: 2,
      async appendNotification(value, options, buttons) {
        if (held.on) await new Promise(resolve => held.waiting.push(resolve));
        const notification = { value, label: options.label, priority: options.priority, eventCallback: options.eventCallback, buttons, persistence: 0, removed: false };
        shown.push(notification); this.all.push(notification);
        return notification;
      },
      removeNotification(notification) {
        if (!notification || notification.removed) return;
        notification.removed = true;
        shown.splice(shown.indexOf(notification), 1);
        notification.eventCallback?.("removed");
      } };
  };
  const gBrowser = {
    selectedTab: null, tabs,
    tabContainer: {
      addEventListener(type, fn) { if (!tabListeners.has(type)) tabListeners.set(type, new Set()); tabListeners.get(type).add(fn); },
      removeEventListener(type, fn) { tabListeners.get(type)?.delete(fn); },
    },
    addTabsProgressListener(listener) { progress.add(listener); },
    removeTabsProgressListener(listener) { progress.delete(listener); },
    getTabForBrowser: browser => tabs.find(tab => tab.linkedBrowser === browser) ?? null,
    getNotificationBox(browser) { if (!boxes.has(browser)) boxes.set(browser, makeBox()); return boxes.get(browser); },
  };
  const window = { gBrowser, AbortController, Services: { prefs: { getBoolPref: (_name, fallback) => fallback } } };
  const fire = (type, target) => { for (const fn of [...(tabListeners.get(type) ?? [])]) fn({ type, target }); };
  const api = {
    window, timers, progress, tabListeners, held,
    /** Every notification ever appended to the tab, removed ones included. */
    appended: (tab, value) => gBrowser.getNotificationBox(tab.linkedBrowser).all.filter(item => item.value === value),
    get now() { return now; },
    clock: () => now,
    async advance(ms) {
      const until = now + ms;
      for (;;) {
        queue.sort((a, b) => a.at - b.at);
        const due = queue[0];
        if (!due || due.at > until) break;
        queue.shift();
        now = due.at;
        await due.fn();
        await settle();
      }
      now = until;
      await settle();
    },
    addTab(url, { select = true } = {}) {
      const tab = { linkedBrowser: { browserId: tabs.length + 1, currentURI: { spec: url } } };
      tabs.push(tab);
      if (select) api.select(tab);
      return tab;
    },
    select(tab) { gBrowser.selectedTab = tab; fire("TabSelect", tab); },
    navigate(tab, url, flags = 0) {
      tab.linkedBrowser.currentURI.spec = url;
      for (const listener of [...progress]) listener.onLocationChange(tab.linkedBrowser, { isTopLevel: true }, null, null, flags);
    },
    close(tab) { fire("TabClose", tab); tabs.splice(tabs.indexOf(tab), 1); },
    box: tab => gBrowser.getNotificationBox(tab.linkedBrowser),
    shown: (tab, value = NOTIFICATION_VALUE) => gBrowser.getNotificationBox(tab.linkedBrowser).shown.filter(item => item.value === value),
  };
  return api;
}
const settle = async () => { for (let i = 0; i < 5; i++) await Promise.resolve(); await new Promise(resolve => setImmediate(resolve)); };

function fakeServices(win, { offer, accept } = {}) {
  const calls = [];
  let serial = 0;
  const services = {
    calls,
    async offerArrival({ window, tab, signal }) {
      assert.equal(window, win.window);
      calls.push(["offer", tab, tab.linkedBrowser.currentURI.spec, signal]);
      if (offer) return offer({ tab, signal });
      return { kind: "new", token: `00000000-0000-4000-8000-${String(++serial).padStart(12, "0")}`, name: "harbor-suite",
        root: ROOT, displayRoot: ROOT, expiresAt: win.now + 120000 };
    },
    async acceptArrival({ window, tab, token }) {
      assert.equal(window, win.window);
      calls.push(["accept", tab, token]);
      if (accept) return accept({ tab, token });
      return { id: "p_harbor1", manifest: { name: "Harbor Suite" } };
    },
    discardArrival({ window, tab }) { assert.equal(window, win.window); calls.push(["discard", tab ?? null]); },
  };
  return services;
}
const adapter = (overrides = {}) => ({ isPrivateWindow: () => false, workspaceForTab: () => HOME, activeWorkspaceUuid: () => HOME, ...overrides });
function install(win, services, options = {}) {
  const opened = [];
  const runtime = installProjectArrival(win.window, { services, adapter: adapter(options.adapter), timers: win.timers, clock: win.clock,
    shared: options.shared ?? { dismissedRoots: new Set() }, openOverview: fragment => opened.push(fragment) });
  return { runtime, opened };
}
const kinds = services => services.calls.map(([kind]) => kind);

test("private and unknown-privacy windows install nothing", () => {
  for (const isPrivateWindow of [() => true, () => { throw new Error("unknown"); }, () => undefined]) {
    const win = fakeWindow();
    const services = fakeServices(win);
    const { runtime } = install(win, services, { adapter: { isPrivateWindow } });
    assert.deepEqual(runtime.diagnostics(), {});
    assert.equal(win.progress.size, 0);
    assert.equal(win.tabListeners.size, 0);
  }
});

test("the selected tab gets one native notification once its localhost URL settles; storms collapse to one question", async () => {
  const win = fakeWindow();
  const services = fakeServices(win);
  const { runtime } = install(win, services);
  const tab = win.addTab("http://localhost:5173/");
  win.navigate(tab, "http://localhost:5173/a");
  win.navigate(tab, "http://localhost:5173/b", WPL.LOCATION_CHANGE_SAME_DOCUMENT);
  win.navigate(tab, LOCAL, WPL.LOCATION_CHANGE_SAME_DOCUMENT);
  await win.advance(ARRIVAL_SETTLE_MS - 1);
  assert.deepEqual(kinds(services), [], "nothing before the URL settles");
  await win.advance(1);
  assert.deepEqual(services.calls.map(([kind, , url]) => [kind, url]), [["offer", LOCAL]]);
  const [notification] = win.shown(tab);
  assert.equal(notification.label, `This is ${ROOT} — keep as project?`);
  assert.equal(notification.priority, 2);
  assert.equal(notification.persistence, 1000);
  assert.deepEqual(notification.buttons.map(button => [button.label, button.accessKey, button.primary === true]),
    [["Keep as project", "K", true], ["Not now", "N", false]]);
  assert.equal(runtime.diagnostics().offers, 1);

  // Not candidates: other sites, error pages and background tabs.
  const other = win.addTab("https://news.example/");
  await win.advance(ARRIVAL_SETTLE_MS);
  win.navigate(other, "http://localhost:4000/", WPL.LOCATION_CHANGE_ERROR_PAGE);
  await win.advance(ARRIVAL_SETTLE_MS);
  const background = win.addTab("about:blank", { select: false });
  win.navigate(background, "http://localhost:4100/");
  await win.advance(ARRIVAL_SETTLE_MS);
  assert.equal(services.calls.filter(([kind]) => kind === "offer").length, 1);
  assert.deepEqual(runtime.diagnostics(), { discoveries: 1, offers: 1, known: 0, accepted: 0, dismissed: 0, failed: 0, invalidated: 0, pending: 0, offered: 1 });
});

test("Keep as project accepts with the originating tab's token even after another tab is selected", async () => {
  const win = fakeWindow();
  const services = fakeServices(win);
  const { runtime, opened } = install(win, services);
  const tab = win.addTab(LOCAL);
  await win.advance(ARRIVAL_SETTLE_MS);
  const [notification] = win.shown(tab);
  win.addTab("about:blank");
  const keep = notification.buttons[0];
  assert.equal(keep.callback(), false, "the bar closes when pressed");
  // Gecko removes the bar after a callback returns false; "removed" must not discard the claimed token.
  win.box(tab).removeNotification(notification);
  await settle();
  const accept = services.calls.find(([kind]) => kind === "accept");
  assert.equal(accept[1], tab, "the originating tab, not the selected one");
  assert.match(accept[2], /^00000000-0000-4000-8000-0{11}1$/u);
  assert.ok(!services.calls.some(([kind, target]) => kind === "discard" && target === tab), "an accepted token is never discarded under the accept");
  const [result] = win.shown(tab, RESULT_NOTIFICATION_VALUE);
  assert.equal(result.label, "Harbor Suite is now a project in AxioSozo.");
  assert.deepEqual(result.buttons.map(button => button.label), ["Show project"]);
  result.buttons[0].callback();
  assert.deepEqual(opened, ["#project=p_harbor1"]);
  assert.equal(runtime.diagnostics().accepted, 1);
  assert.equal(win.shown(tab).length, 0);
  // The result line belongs to that page and leaves with the next navigation.
  win.navigate(tab, "http://localhost:5173/other");
  assert.equal(win.shown(tab, RESULT_NOTIFICATION_VALUE).length, 0);
});

test("navigation ends the offer: a route change re-asks for the new URL after settling; a reload keeps it", async () => {
  const win = fakeWindow();
  const services = fakeServices(win);
  const { runtime } = install(win, services);
  const tab = win.addTab(LOCAL);
  await win.advance(ARRIVAL_SETTLE_MS);
  const first = win.shown(tab)[0];
  win.navigate(tab, LOCAL); // reload: same exact URL
  await win.advance(ARRIVAL_SETTLE_MS);
  assert.deepEqual(win.shown(tab), [first], "a reload keeps the offer");
  assert.ok(!kinds(services).includes("discard"));

  win.navigate(tab, "http://localhost:5173/board?x=2#top", WPL.LOCATION_CHANGE_SAME_DOCUMENT);
  assert.equal(first.removed, true);
  assert.deepEqual(services.calls.at(-1).slice(0, 2), ["discard", tab], "the old token is invalidated at once");
  await win.advance(ARRIVAL_SETTLE_MS);
  const offers = services.calls.filter(([kind]) => kind === "offer");
  assert.equal(offers.length, 2);
  assert.equal(offers[1][2], "http://localhost:5173/board?x=2#top");
  assert.equal(win.shown(tab).length, 1, "one notification, for the new URL");

  win.navigate(tab, "https://news.example/");
  assert.equal(win.shown(tab).length, 0);
  assert.equal(services.calls.at(-1)[0], "discard");
  assert.equal(runtime.diagnostics().invalidated, 2);
});

test("Not now and the close button dismiss: token discarded, that folder is not offered again this session", async () => {
  const win = fakeWindow();
  const services = fakeServices(win);
  const shared = { dismissedRoots: new Set() };
  const { runtime } = install(win, services, { shared });
  const tab = win.addTab(LOCAL);
  await win.advance(ARRIVAL_SETTLE_MS);
  const notification = win.shown(tab)[0];
  assert.equal(notification.buttons[1].callback(), false);
  assert.equal(notification.removed, true);
  assert.deepEqual(services.calls.at(-1), ["discard", tab]);
  assert.ok(shared.dismissedRoots.has(ROOT));
  win.navigate(tab, "http://localhost:5173/settings", WPL.LOCATION_CHANGE_SAME_DOCUMENT);
  await win.advance(ARRIVAL_SETTLE_MS);
  assert.equal(services.calls.filter(([kind]) => kind === "offer").length, 1, "the same tab and origin is not asked again soon");
  const second = win.addTab("http://127.0.0.1:5173/");
  await win.advance(ARRIVAL_SETTLE_MS);
  assert.equal(win.shown(second).length, 0, "another tab on the dismissed folder shows nothing");
  assert.deepEqual(services.calls.at(-1), ["discard", second]);

  const win2 = fakeWindow();
  const services2 = fakeServices(win2);
  install(win2, services2);
  const tab2 = win2.addTab(LOCAL);
  await win2.advance(ARRIVAL_SETTLE_MS);
  const bar = win2.shown(tab2)[0];
  bar.eventCallback("dismissed");
  win2.box(tab2).removeNotification(bar);
  assert.deepEqual(services2.calls.at(-1), ["discard", tab2]);
  assert.equal(runtime.diagnostics().dismissed, 1);
});

test("expiry, tab close and window disposal remove the offer and invalidate the token", async () => {
  const win = fakeWindow();
  const services = fakeServices(win);
  const { runtime } = install(win, services);
  const tab = win.addTab(LOCAL);
  await win.advance(ARRIVAL_SETTLE_MS);
  await win.advance(120000);
  assert.equal(win.shown(tab).length, 0, "two minutes at most");
  assert.deepEqual(services.calls.at(-1), ["discard", tab]);

  const other = win.addTab("http://localhost:3001/");
  await win.advance(ARRIVAL_SETTLE_MS);
  assert.equal(win.shown(other).length, 1);
  win.close(other);
  assert.equal(win.shown(other).length, 0);
  assert.deepEqual(services.calls.at(-1), ["discard", other]);

  const last = win.addTab("http://localhost:3002/");
  await win.advance(ARRIVAL_SETTLE_MS);
  assert.equal(win.shown(last).length, 1);
  runtime.dispose();
  assert.equal(win.shown(last).length, 0);
  assert.deepEqual(services.calls.at(-1), ["discard", null], "the whole window's offers");
  assert.equal(win.progress.size, 0);
  assert.equal([...win.tabListeners.values()].reduce((sum, set) => sum + set.size, 0), 0);
  win.navigate(last, "http://localhost:3003/");
  await win.advance(ARRIVAL_SETTLE_MS);
  assert.equal(services.calls.filter(([kind]) => kind === "offer").length, 3, "nothing after disposal");
});

test("an answer for a page the tab already left is dropped and its token discarded; switching tabs aborts discovery", async () => {
  const win = fakeWindow();
  let release;
  const services = fakeServices(win, { offer: () => new Promise(resolve => { release = resolve; }) });
  install(win, services);
  const tab = win.addTab(LOCAL);
  await win.advance(ARRIVAL_SETTLE_MS);
  const signal = services.calls[0][3];
  win.navigate(tab, "http://localhost:5173/next");
  assert.equal(signal.aborted, true);
  release({ kind: "new", token: "00000000-0000-4000-8000-000000000009", name: "x", root: ROOT, displayRoot: ROOT, expiresAt: win.now + 120000 });
  await settle();
  assert.equal(win.shown(tab).length, 0);
  assert.deepEqual(services.calls.at(-1), ["discard", tab]);

  await win.advance(ARRIVAL_SETTLE_MS);
  const second = services.calls.filter(([kind]) => kind === "offer")[1][3];
  win.addTab("about:blank");
  assert.equal(second.aborted, true, "a tab sent to the background stops asking");
});

test("a late answer never discards the token of a newer question or offer on the same tab", async () => {
  const win = fakeWindow();
  const pending = [];
  const services = fakeServices(win, { offer: () => new Promise(resolve => pending.push(resolve)) });
  install(win, services);
  const tab = win.addTab(LOCAL);
  await win.advance(ARRIVAL_SETTLE_MS);
  win.navigate(tab, "http://localhost:5173/next");
  await win.advance(ARRIVAL_SETTLE_MS);
  assert.equal(pending.length, 2, "the newer question is in flight");
  const answer = n => ({ kind: "new", token: `00000000-0000-4000-8000-00000000000${n}`, name: "x", root: ROOT, displayRoot: ROOT, expiresAt: win.now + 120000 });
  pending[0](answer(1));
  await settle();
  assert.ok(!kinds(services).includes("discard"), "the stale answer leaves the newer question's token alone");
  pending[1](answer(2));
  await settle();
  assert.equal(win.shown(tab).length, 1);
  assert.match(win.shown(tab)[0].label, /keep as project\?$/u);
});

test("known folders and repository pages show nothing; a failed Keep shows a fixed sentence with the folder-picker fallback", async () => {
  const win = fakeWindow();
  const services = fakeServices(win, { offer: () => ({ kind: "known", project_id: "p_harbor1" }) });
  const { runtime } = install(win, services);
  const tab = win.addTab("https://github.com/harbor-labs/harbor-suite/pull/4");
  await win.advance(ARRIVAL_SETTLE_MS);
  assert.equal(services.calls.length, 1);
  assert.equal(win.shown(tab).length, 0);
  assert.equal(runtime.diagnostics().known, 1);

  const failing = fakeWindow();
  const stale = Object.assign(new Error("STALE_ARRIVAL: /private/detail"), { code: "STALE_ARRIVAL" });
  const failingServices = fakeServices(failing, { accept: () => { throw stale; } });
  const { opened } = install(failing, failingServices);
  const local = failing.addTab(LOCAL);
  await failing.advance(ARRIVAL_SETTLE_MS);
  failing.shown(local)[0].buttons[0].callback();
  await settle();
  const [result] = failing.shown(local, RESULT_NOTIFICATION_VALUE);
  assert.equal(result.label, arrivalFailureMessage("STALE_ARRIVAL"));
  assert.doesNotMatch(result.label, /private|STALE/u);
  result.buttons[0].callback();
  assert.deepEqual(opened, [`#add-project=${HOME}`]);
});

test("one notification per folder: a second tab on the same folder is not offered while the first shows it", async () => {
  const win = fakeWindow();
  const services = fakeServices(win);
  install(win, services);
  const first = win.addTab(LOCAL);
  await win.advance(ARRIVAL_SETTLE_MS);
  const second = win.addTab("http://127.0.0.1:5173/");
  await win.advance(ARRIVAL_SETTLE_MS);
  assert.equal(win.shown(first).length, 1);
  assert.equal(win.shown(second).length, 0);
  assert.deepEqual(services.calls.at(-1), ["discard", second]);
});

// The user pressed Keep; the service has not answered yet. Any change of the
// page or window revokes the acceptance, and whatever the answer is, nothing
// about it is shown afterwards.
for (const change of ["navigation", "route change", "reload", "tab close", "disposal", "private window"]) {
  for (const outcome of ["added", "failed"]) {
    test(`a Keep under way is revoked by ${change}; a late ${outcome} answer shows nothing`, async () => {
      const win = fakeWindow();
      const privacy = { private: false };
      let answer;
      const services = fakeServices(win, { accept: () => new Promise((resolve, reject) => { answer = { resolve, reject }; }) });
      const { runtime } = install(win, services, { adapter: { isPrivateWindow: () => privacy.private } });
      const tab = win.addTab(LOCAL);
      await win.advance(ARRIVAL_SETTLE_MS);
      const bar = win.shown(tab)[0];
      bar.buttons[0].callback();
      win.box(tab).removeNotification(bar); // Gecko closes the bar after the callback
      await settle();
      assert.ok(answer, "the acceptance is under way");
      const before = services.calls.length;
      if (change === "navigation") win.navigate(tab, "http://localhost:5173/other");
      if (change === "route change") win.navigate(tab, "http://localhost:5173/board?x=2#top", WPL.LOCATION_CHANGE_SAME_DOCUMENT);
      if (change === "reload") win.navigate(tab, LOCAL);
      if (change === "tab close") win.close(tab);
      if (change === "disposal") runtime.dispose();
      if (change === "private window") privacy.private = true;
      if (change !== "private window") {
        assert.deepEqual(services.calls.slice(before).filter(([kind]) => kind === "discard").map(([, target]) => target),
          change === "disposal" ? [tab, null] : [tab], "the acceptance is revoked at once, while the service is still working");
      }
      if (outcome === "added") answer.resolve({ id: "p_harbor1", manifest: { name: "Harbor Suite" } });
      else answer.reject(Object.assign(new Error("STALE_ARRIVAL"), { code: "STALE_ARRIVAL" }));
      await settle();
      assert.deepEqual(win.appended(tab, RESULT_NOTIFICATION_VALUE), [], "no success or failure line on another document");
      assert.equal(win.shown(tab).length, 0);
      if (change === "private window") assert.equal(services.calls.at(-1)[0], "discard", "a window that is no longer normal drops it too");
      if (change !== "disposal") assert.deepEqual([runtime.diagnostics().accepted, runtime.diagnostics().failed], [0, 0]);
    });
  }
}

test("a notification bar that arrives after navigation or disposal is removed at once; a reload keeps the question", async () => {
  // Offer bar, navigation while it is being created.
  let win = fakeWindow();
  let services = fakeServices(win);
  install(win, services);
  let tab = win.addTab(LOCAL);
  win.held.on = true;
  await win.advance(ARRIVAL_SETTLE_MS);
  assert.equal(win.held.waiting.length, 1, "the bar is being created");
  win.navigate(tab, "https://news.example/");
  assert.deepEqual(services.calls.at(-1), ["discard", tab]);
  win.held.on = false;
  win.held.waiting.splice(0).forEach(resolve => resolve());
  await settle();
  assert.equal(win.appended(tab, NOTIFICATION_VALUE)[0].removed, true);
  assert.equal(win.shown(tab).length, 0);

  // Offer bar, window disposed while it is being created.
  win = fakeWindow();
  services = fakeServices(win);
  let { runtime } = install(win, services);
  tab = win.addTab(LOCAL);
  win.held.on = true;
  await win.advance(ARRIVAL_SETTLE_MS);
  runtime.dispose();
  win.held.on = false;
  win.held.waiting.splice(0).forEach(resolve => resolve());
  await settle();
  assert.equal(win.shown(tab).length, 0);
  assert.deepEqual(services.calls.at(-1), ["discard", null]);

  // Offer bar, same URL reloaded while it is being created: still the same question.
  win = fakeWindow();
  services = fakeServices(win);
  install(win, services);
  tab = win.addTab(LOCAL);
  win.held.on = true;
  await win.advance(ARRIVAL_SETTLE_MS);
  win.navigate(tab, LOCAL);
  win.held.on = false;
  win.held.waiting.splice(0).forEach(resolve => resolve());
  await settle();
  assert.equal(win.shown(tab).length, 1);
  assert.ok(!kinds(services).includes("discard"));

  // Result line, navigation or disposal while it is being created.
  for (const change of ["navigation", "disposal"]) {
    win = fakeWindow();
    services = fakeServices(win);
    ({ runtime } = install(win, services));
    tab = win.addTab(LOCAL);
    await win.advance(ARRIVAL_SETTLE_MS);
    const bar = win.shown(tab)[0];
    win.held.on = true;
    bar.buttons[0].callback();
    win.box(tab).removeNotification(bar);
    await settle();
    assert.ok(kinds(services).includes("accept"));
    assert.equal(win.held.waiting.length, 1, "the result line is being created");
    if (change === "navigation") win.navigate(tab, "http://localhost:5173/other");
    else runtime.dispose();
    win.held.on = false;
    win.held.waiting.splice(0).forEach(resolve => resolve());
    await settle();
    assert.equal(win.appended(tab, RESULT_NOTIFICATION_VALUE)[0].removed, true, change);
    assert.equal(win.shown(tab, RESULT_NOTIFICATION_VALUE).length, 0, change);
  }
});

test("message helpers: fixed texts and loopback or known-surface candidates only", () => {
  assert.equal(arrivalMessage("~/Code/foo"), "This is ~/Code/foo — keep as project?");
  for (const code of ["PROJECT_EXISTS", "UNKNOWN_ARRIVAL", "ROOT_CHANGED", "READ_CONTAINMENT_UNAVAILABLE", "ANYTHING", undefined]) {
    assert.match(arrivalFailureMessage(code), /^[A-Z].+\.$/u);
  }
  assert.deepEqual(arrivalCandidate(LOCAL), { url: LOCAL, origin: "http://localhost:5173", loopback: true });
  assert.equal(arrivalCandidate("http://[::1]:8080/").loopback, true);
  assert.equal(arrivalCandidate("https://vercel.com/acme/app").loopback, false);
  for (const spec of ["http://0.0.0.0:5173/", "http://user:pw@localhost:5173/", "https://example.org/", "about:blank", "file:///tmp/x", null]) {
    assert.equal(arrivalCandidate(spec), null, String(spec));
  }
});
