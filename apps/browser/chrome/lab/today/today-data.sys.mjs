/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. https://mozilla.org/MPL/2.0/ */

// The process-wide part of the "Today" experiments (today-sheet and
// today-strip): what they remember between windows and restarts, and the one
// place that gathers the day's facts for both the sheet (about:axiosozo#today,
// through the actor) and the sidebar strip.
//
// Remembered in <profile>/axiosozo/lab/today.json, on this Mac only:
//   opened_day  the local day the daily sheet last opened by itself
//   seen_at     when you last looked (the sheet shown, the strip opened)
//   finished    agent sessions seen ending while a today experiment was on
//               (at most 40, three days): the agents service forgets a
//               browser run at quit and a session started elsewhere once it
//               leaves `claude agents`, but "what finished overnight" should
//               still be there in the morning. Only an observed ending is
//               noted (a run of this browser, a hook report, or a session seen
//               working before), never an idle session found already done.
// Turning both today switches off forgets all of it.

import { JsonStore, profileStorage } from "../../JsonStore.sys.mjs";
import { composeToday, lookSince, sheetDue } from "./today-model.sys.mjs";
import { errandStore, localDay, oneLine } from "../errands/errand-store.sys.mjs";

export const TODAY_FILE = "lab/today.json";
export const LEDGER_LIMIT = 40;
export const LEDGER_KEEP_MS = 3 * 24 * 60 * 60 * 1000;
export const TODAY_PREFS = Object.freeze({
  sheet: "axiosozo.lab.today-sheet.enabled",
  strip: "axiosozo.lab.today-strip.enabled",
  errands: "axiosozo.lab.errands.enabled",
  // Not declared (default 5): the hour the day starts, for trying the sheet at night (about:config, an integer 0-23).
  dayStartsAt: "axiosozo.lab.today-sheet.dayStartsAt",
});
const STATES = new Set(["done", "failed", "needs_you"]);
const RUNNING = new Set(["starting", "working"]);
const CLIENTS = new Set(["claude-code", "codex", "antigravity"]);
const PROJECT_ID = /^p_[a-z0-9]{4,32}$/u;
const isTime = value => Number.isSafeInteger(value) && value >= 0;
const DAY = /^\d{4}-\d{2}-\d{2}$/u;

export const EMPTY_TODAY = Object.freeze({ version: 1, opened_day: null, seen_at: null, finished: Object.freeze([]) });

/** One noted finish, rebuilt from its own fields; null when it is not one. */
function validEntry(value) {
  if (!value || typeof value !== "object" || typeof value.id !== "string" || value.id.length > 160 || !STATES.has(value.state) || !isTime(value.at)) return null;
  return {
    id: value.id, state: value.state, at: value.at,
    client: CLIENTS.has(value.client) ? value.client : null,
    client_label: oneLine(value.client_label ?? "", 40) || null,
    project_id: PROJECT_ID.test(value.project_id ?? "") ? value.project_id : null,
    project_name: oneLine(value.project_name ?? "", 80) || null,
    title: oneLine(value.title ?? "", 120) || null,
    text: oneLine(value.text ?? "", 160) || null,
  };
}

/** today.json: { version: 1, opened_day, seen_at, finished }. Another shape throws (never overwritten). */
export function validateTodayStore(doc) {
  if (!doc || typeof doc !== "object" || Array.isArray(doc) || doc.version !== 1 || !Array.isArray(doc.finished)) {
    throw Object.assign(new Error("today.json is not the today list"), { code: "INVALID_STORE" });
  }
  return {
    version: 1,
    opened_day: typeof doc.opened_day === "string" && DAY.test(doc.opened_day) ? doc.opened_day : null,
    seen_at: isTime(doc.seen_at) ? doc.seen_at : null,
    finished: doc.finished.map(validEntry).filter(Boolean).slice(-LEDGER_LIMIT),
  };
}

/**
 * The note for a session that just changed, or null. `previous` is the state
 * the today data last saw for it (undefined: never seen).
 */
export function ledgerEntry(session, previous, now) {
  if (!session || typeof session.id !== "string" || !STATES.has(session.state) || previous === session.state) return null;
  const observed = session.origin === "browser" || session.source === "hook" || RUNNING.has(previous);
  if (!observed) return null;
  return validEntry({
    id: session.id, state: session.state,
    at: isTime(session.endedAt) ? session.endedAt : isTime(session.updatedAt) ? session.updatedAt : now,
    client: session.client, client_label: session.clientLabel, project_id: session.projectId, project_name: session.projectName,
    title: session.title, text: session.state === "done" ? session.summary : session.reason,
  });
}

const prefOn = (prefs, name) => { try { return prefs?.getBoolPref?.(name, false) === true; } catch { return false; } };
const prefHour = prefs => { try { const value = prefs?.getIntPref?.(TODAY_PREFS.dayStartsAt, -1); return Number.isInteger(value) && value >= 0 && value <= 23 ? value : undefined; } catch { return undefined; } };

/**
 * createTodayData({ store, getAgents, services, getErrands, prefs, clock })
 *   store      JsonStore-like over today.json ({ load(), update(mutator) })
 *   getAgents  () → the Lab's agents service ({ list(), subscribe() }) or null
 *   services   AxioSozoServices (needsAttention, listProjects, listContexts)
 *   getErrands () → the errand store, read only while Errands is on
 *   prefs      for the switches (TODAY_PREFS)
 */
export function createTodayData({ store, getAgents = () => null, services = null, getErrands = () => errandStore(), prefs = globalThis.Services?.prefs,
  clock = () => Date.now() }) {
  const states = new Map(); // session id → the last state seen
  const listeners = new Set();
  let holders = 0, off = null, claimed = null;

  const emit = () => {
    for (const listener of [...listeners]) {
      try { listener(); } catch (error) { console.error("AxioSozo Lab: a today listener failed", error); }
    }
  };

  function note(session) {
    const previous = states.get(session.id);
    states.set(session.id, session.state);
    const entry = ledgerEntry(session, previous, clock());
    if (!entry) return;
    store.update(doc => {
      const now = clock();
      const finished = doc.finished.filter(item => item.id !== entry.id && now - item.at < LEDGER_KEEP_MS);
      return { ...doc, finished: [...finished, entry].slice(-LEDGER_LIMIT) };
    }).then(emit, error => console.error("AxioSozo Lab: today could not note a finished agent", error));
  }

  function start() {
    let agents = null;
    try { agents = getAgents(); } catch (error) { console.error("AxioSozo Lab: agents are unavailable for today", error); }
    if (!agents) return;
    try { for (const session of agents.list() ?? []) states.set(session.id, session.state); } catch {}
    try {
      off = agents.subscribe(event => {
        if (event?.type === "changed" && event.session) note(event.session);
      });
    } catch (error) { console.error("AxioSozo Lab: today cannot follow agents", error); off = null; }
  }

  async function read(name, fallback, ...args) {
    try { const value = await services?.[name]?.(...args); return value ?? fallback; } catch { return fallback; }
  }

  return Object.freeze({
    load: () => store.load(),
    /** Called by the sheet on window focus: true once per local day, after 05:00 (the caller opens the sheet). */
    async claimDailyOpen() {
      const doc = await store.load();
      const now = clock();
      const day = localDay(now);
      // Checked and set without an await in between, so two windows never both open it.
      if (claimed === day || !sheetDue({ now, openedDay: doc.opened_day, startHour: prefHour(prefs) })) return false;
      claimed = day;
      await store.update(current => ({ ...current, opened_day: day }));
      return true;
    },
    /** The start of "since you last looked". */
    async since() { return lookSince((await store.load()).seen_at, clock()); },
    /** You looked now. */
    async markSeen() {
      const now = clock();
      await store.update(doc => ({ ...doc, seen_at: now }));
      emit();
    },
    /** The digest (today-model composeToday) since `since` (default: the last look). */
    async digest({ since = null } = {}) {
      const now = clock();
      const doc = await store.load();
      const from = isTime(since) ? lookSince(since, now) : lookSince(doc.seen_at, now);
      let sessions = [];
      try { sessions = getAgents()?.list() ?? []; } catch { sessions = []; }
      const [attention, projects, spaces] = await Promise.all([read("needsAttention", []), read("listProjects", []), read("listContexts", [])]);
      let errands = null;
      if (prefOn(prefs, TODAY_PREFS.errands)) {
        try { errands = await getErrands().list(); } catch { errands = []; }
      }
      return composeToday({ now, since: from, sessions, ledger: doc.finished, attention,
        projects: (Array.isArray(projects) ? projects : []).map(project => ({ id: project?.id, name: project?.manifest?.name ?? project?.name ?? "" })),
        spaces: (Array.isArray(spaces) ? spaces : []).map(space => ({ uuid: space?.uuid, name: space?.name ?? "" })), errands });
    },
    /** While held (a today experiment is on in some window), agent sessions that end are noted. Returns release(). */
    acquire() {
      holders++;
      if (holders === 1) start();
      let released = false;
      return () => {
        if (released) return;
        released = true;
        holders = Math.max(0, holders - 1);
        if (!holders) { try { off?.(); } catch {} off = null; states.clear(); }
      };
    },
    /** Called when a today experiment leaves a window: once neither switch is on, everything noted is forgotten. */
    forgetIfOff() {
      // A microtask later: a switch to the other variant writes both prefs in one go.
      return Promise.resolve().then(async () => {
        if (prefOn(prefs, TODAY_PREFS.sheet) || prefOn(prefs, TODAY_PREFS.strip)) return false;
        claimed = null;
        await store.update(() => ({ version: 1, opened_day: null, seen_at: null, finished: [] }));
        return true;
      }).catch(error => { console.error("AxioSozo Lab: today could not forget", error); return false; });
    },
    /** fn() after what today shows may have changed (a note, a look). Returns off(). */
    subscribe(listener) {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    /** For tests: counts only. */
    diagnostics: () => ({ holders, following: !!off, known: states.size }),
  });
}

let current = null;
/** The one today data of this browser process. */
export function todayData({ services = null } = {}) {
  if (current) return current;
  const getAgents = () => {
    const { labPlatform } = ChromeUtils.importESModule("chrome://browser/content/axiosozo/lab/platform.sys.mjs");
    return labPlatform({ services }).agents;
  };
  current = createTodayData({ store: new JsonStore({ storage: profileStorage(TODAY_FILE), validate: validateTodayStore, empty: EMPTY_TODAY }),
    getAgents, services });
  return current;
}
/** For tests: the today data todayData() returns (null: the real one on next use). */
export function setTodayDataForTesting(data) {
  const previous = current;
  current = data;
  return () => { current = previous; };
}
