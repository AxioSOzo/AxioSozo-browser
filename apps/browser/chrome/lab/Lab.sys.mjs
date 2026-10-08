/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. https://mozilla.org/MPL/2.0/ */

// AxioSozo Lab: experimental components, each behind its own switch, to try,
// compare and delete one by one (docs/lab/README.md).
//
//  - The list is data (experiments.sys.mjs), checked here when this module
//    loads: an entry with a problem is left out and reported in
//    REGISTRY_PROBLEMS (and the Browser Console); it never breaks the others.
//  - Each experiment's switch is the pref axiosozo.lab.<id>.enabled (false in
//    defaults.yaml). A graduated feature keeps its own existing pref.
//  - installLab(window, ctx) runs once per normal browser window (the startup
//    installers): it installs every experiment that is on through its own
//    module's installer and watches the prefs, so turning one on or off
//    installs or removes it in every open window at once, without a restart.
//    One experiment that throws (on load, install or dispose) is logged and
//    skipped; the window and the other experiments carry on.
//  - Variants of one idea (variantOf) form a family; turning one on from the
//    Lab page turns its siblings off, so only one of a family runs at a time.
//  - listForPage / setEnabledFromPage serve the about:axiosozo Lab section
//    through its actor (AboutAxioSozoParent listLab, setLabEnabled): the page
//    names a known id and a boolean, never a pref, module or installer.
//
// Nothing here starts an AI client: experiments ask ctx.ai (ai.sys.mjs) for
// a one-shot answer and ctx.agents (agents.sys.mjs) for an agent task only
// when the user acts, and never in a private window (Lab installs only into
// normal windows). Both run on the process platform (platform.sys.mjs),
// created on first use; the first window also clears what a crashed session
// left in the profile's Lab folder.

import { EXPERIMENT_LIST, LAB_GROUPS } from "./experiments.sys.mjs";
import { createLabAi } from "./ai.sys.mjs";
import { createAgentsView } from "./agents.sys.mjs";
import { useStylesheet } from "./kit.sys.mjs";
import { labPlatform } from "./platform.sys.mjs";
import { isSensitiveHost } from "../contexts/index.mjs";

export { LAB_GROUPS };
export const LAB_URL = "chrome://browser/content/axiosozo/lab/";
export const LAB_PREF_PREFIX = "axiosozo.lab.";
export const LAB_NEEDS = Object.freeze(["claude-code", "codex", "antigravity", "none"]);
export const MAX_HOW_TO_TRY = 3;
const ID = /^[a-z][a-z0-9]*(?:-[a-z0-9]+)*$/u;
const MAX_ID = 40;
const MODULE = /^(?:[a-z0-9][a-z0-9-]*\/)?[A-Za-z0-9][A-Za-z0-9_-]*\.sys\.mjs$/u;
// The Lab's own modules: no experiment may claim one.
export const RESERVED_MODULES = Object.freeze(new Set(["Lab.sys.mjs", "kit.sys.mjs", "ai.sys.mjs", "experiments.sys.mjs", "agents.sys.mjs",
  "clients.sys.mjs", "handover.sys.mjs", "platform.sys.mjs", "process.sys.mjs", "streams.sys.mjs"]));
// macOS file systems ignore case: "KIT.sys.mjs" would be kit.sys.mjs.
const RESERVED_LOWER = new Set([...RESERVED_MODULES].map(name => name.toLowerCase()));
const INSTALLER = /^install[A-Z][A-Za-z0-9]*$/u;
const GRADUATED_PREF = /^axiosozo\.[A-Za-z0-9.]+$/u;
const ONE_LINE = /^[^\u0000-\u001f\u007f]+$/u;
const FIELDS = new Set(["id", "title", "pitch", "howToTry", "group", "variantOf", "needs", "module", "installer", "graduated"]);

export class LabError extends Error {
  constructor(code, message = code) { super(message); this.name = "LabError"; this.code = code; }
}

/** The switch of experiment `id`. */
export const labPref = id => `${LAB_PREF_PREFIX}${id}.enabled`;
/** The experiment id a changed pref name is the switch of, or null. */
export function labIdFromPref(name) {
  if (typeof name !== "string" || !name.startsWith(LAB_PREF_PREFIX) || !name.endsWith(".enabled")) return null;
  const id = name.slice(LAB_PREF_PREFIX.length, -".enabled".length);
  return ID.test(id) && id.length <= MAX_ID ? id : null;
}

const line = (value, max) => typeof value === "string" && value.trim() === value && value.length >= 1 && value.length <= max && ONE_LINE.test(value);

/** What is wrong with one descriptor's own fields (not its relations), as short texts. */
export function checkExperiment(entry, { groups = LAB_GROUPS } = {}) {
  const problems = [];
  if (!entry || typeof entry !== "object" || Array.isArray(entry)) return ["an entry is an object"];
  for (const key of Object.keys(entry)) if (!FIELDS.has(key)) problems.push(`unknown field "${key}"`);
  if (typeof entry.id !== "string" || !ID.test(entry.id) || entry.id.length > MAX_ID) problems.push("id is lowercase words with dashes, at most 40 characters");
  if (!line(entry.title, 60)) problems.push("title is one line, at most 60 characters");
  if (!line(entry.pitch, 200) || !/[.!?]$/u.test(entry.pitch ?? "")) problems.push("pitch is one sentence, at most 200 characters");
  if (!Array.isArray(entry.howToTry) || entry.howToTry.length < 1 || entry.howToTry.length > MAX_HOW_TO_TRY
    || !entry.howToTry.every(step => line(step, 140))) problems.push("howToTry is 1 to 3 short steps");
  if (!groups.includes(entry.group)) problems.push(`group is one of ${groups.join(", ")}`);
  if (entry.variantOf !== undefined && entry.variantOf !== null && (typeof entry.variantOf !== "string" || !ID.test(entry.variantOf))) {
    problems.push("variantOf is another experiment's id");
  }
  const needs = entry.needs;
  if (!Array.isArray(needs) || !needs.length || new Set(needs).size !== needs.length || !needs.every(need => LAB_NEEDS.includes(need))
    || (needs.includes("none") && needs.length > 1)) problems.push("needs lists claude-code, codex, antigravity, or only none");
  if (entry.graduated !== undefined) {
    const graduated = entry.graduated;
    if (!graduated || typeof graduated !== "object" || Object.keys(graduated).some(key => !["pref", "default", "live"].includes(key))
      || typeof graduated.pref !== "string" || !GRADUATED_PREF.test(graduated.pref) || graduated.pref.startsWith(LAB_PREF_PREFIX)
      || typeof graduated.default !== "boolean" || typeof graduated.live !== "boolean") {
      problems.push("graduated is { pref, default, live } with the feature's existing axiosozo.* pref");
    }
    if (entry.module !== undefined || entry.installer !== undefined) problems.push("a graduated feature has no Lab module or installer");
  } else {
    if (typeof entry.module !== "string" || !MODULE.test(entry.module) || RESERVED_LOWER.has(entry.module.toLowerCase())) {
      problems.push("module is a .sys.mjs file under chrome/lab/ (the Lab's own module names are taken)");
    }
    if (typeof entry.installer !== "string" || !INSTALLER.test(entry.installer)) problems.push("installer is the export name installSomething");
  }
  return problems;
}

/**
 * The checked registry: frozen descriptors of every valid entry, with
 * `variantOf` (null when absent) and `family` (the id of the idea its
 * variants compete over), and the problems found. A duplicate id, an unknown
 * variantOf or a variantOf cycle is a problem too; the entry is left out (a
 * duplicate) or kept on its own (a bad variantOf).
 */
export function buildRegistry(list, { groups = LAB_GROUPS } = {}) {
  const problems = [];
  const valid = [];
  const seen = new Set();
  for (const [index, entry] of (Array.isArray(list) ? list : []).entries()) {
    const name = typeof entry?.id === "string" ? entry.id : `entry ${index + 1}`;
    const own = checkExperiment(entry, { groups });
    if (!own.length && seen.has(entry.id)) own.push("the id is already used");
    if (own.length) { problems.push(...own.map(problem => `${name}: ${problem}`)); continue; }
    seen.add(entry.id);
    valid.push(entry);
  }
  const byId = new Map(valid.map(entry => [entry.id, entry]));
  const parentOf = new Map();
  for (const entry of valid) {
    if (entry.variantOf === undefined || entry.variantOf === null) continue;
    if (entry.variantOf === entry.id || !byId.has(entry.variantOf)) problems.push(`${entry.id}: variantOf names no other experiment`);
    else parentOf.set(entry.id, entry.variantOf);
  }
  const familyOf = id => {
    const path = new Set([id]);
    let current = id;
    while (parentOf.has(current)) {
      current = parentOf.get(current);
      if (path.has(current)) return null; // a cycle
      path.add(current);
    }
    return current;
  };
  const experiments = valid.map(entry => {
    let family = familyOf(entry.id);
    let variantOf = parentOf.get(entry.id) ?? null;
    if (family === null) { problems.push(`${entry.id}: variantOf goes round in a circle`); family = entry.id; variantOf = null; }
    const descriptor = {
      id: entry.id, title: entry.title, pitch: entry.pitch, howToTry: Object.freeze([...entry.howToTry]), group: entry.group,
      variantOf, family, needs: Object.freeze([...entry.needs]),
      module: entry.graduated ? null : entry.module, installer: entry.graduated ? null : entry.installer,
      graduated: entry.graduated ? Object.freeze({ ...entry.graduated }) : null,
    };
    return Object.freeze(descriptor);
  });
  return Object.freeze({ experiments: Object.freeze(experiments), problems: Object.freeze(problems) });
}

const REGISTRY = buildRegistry(EXPERIMENT_LIST);
/** Every valid experiment, in list order. */
export const EXPERIMENTS = REGISTRY.experiments;
/** What is wrong with the list (empty when it is all right; a test keeps it so). */
export const REGISTRY_PROBLEMS = REGISTRY.problems;
if (REGISTRY_PROBLEMS.length) console.error(`AxioSozo Lab: experiments left out:\n${REGISTRY_PROBLEMS.join("\n")}`);

export const experimentById = (id, experiments = EXPERIMENTS) => experiments.find(entry => entry.id === id) ?? null;

/** The pref that switches `entry`, and its value when unset. */
export function switchOf(entry) {
  return entry.graduated ? { pref: entry.graduated.pref, fallback: entry.graduated.default } : { pref: labPref(entry.id), fallback: false };
}

/** Whether `entry` is on. An unreadable pref is its default. */
export function isEnabled(entry, prefs) {
  const { pref, fallback } = switchOf(entry);
  try { const value = prefs?.getBoolPref?.(pref, fallback); return typeof value === "boolean" ? value : fallback; } catch { return fallback; }
}

// ---- problems seen in windows (process-wide; for the Lab page) -------------------------

// Per experiment, per window: the last failure there. One window's success
// never hides another window's failure; a closed window's failures go with it.
const PROBLEM_CODES = new Set(["LOAD_FAILED", "INSTALLER_MISSING", "INSTALL_FAILED", "DISPOSE_FAILED"]);
const problems = new Map(); // id → Map(window token → { code, at })
let problemSerial = 0;
function noteProblem(id, code, token) {
  if (!problems.has(id)) problems.set(id, new Map());
  problems.get(id).set(token, { code: PROBLEM_CODES.has(code) ? code : "INSTALL_FAILED", at: ++problemSerial });
}
/** Forgets `id`'s failure in one window, or in every window (token omitted). */
function clearProblem(id, token) {
  if (token === undefined) { problems.delete(id); return; }
  problems.get(id)?.delete(token);
  if (problems.get(id)?.size === 0) problems.delete(id);
}
/** The most recent failure of `id` in any open window, or null. */
function problemOf(id) {
  let latest = null;
  for (const item of problems.get(id)?.values() ?? []) if (!latest || item.at > latest.at) latest = item;
  return latest?.code ?? null;
}
/** For tests. */
export const clearProblemsForTesting = () => problems.clear();

// ---- the about:axiosozo Lab section --------------------------------------------------

/** The Lab section's whole state: every experiment with its switch, built from the registry only. */
export function listForPage({ prefs, experiments = EXPERIMENTS, groups = LAB_GROUPS } = {}) {
  return {
    version: 1,
    groups: [...groups],
    experiments: experiments.map(entry => ({
      id: entry.id, title: entry.title, pitch: entry.pitch, howToTry: [...entry.howToTry], group: entry.group,
      variantOf: entry.variantOf, family: entry.family, needs: [...entry.needs],
      graduated: !!entry.graduated, live: entry.graduated ? entry.graduated.live : true,
      enabled: isEnabled(entry, prefs),
      problem: entry.graduated ? null : problemOf(entry.id),
    })),
  };
}

/**
 * The Lab page's switch: `id` must be a listed experiment and `enabled` a
 * boolean. Turning one on turns the rest of its family off first. Writes only
 * the registry's own pref names; open windows follow through their observers.
 * Returns the new listForPage state.
 */
export function setEnabledFromPage(id, enabled, { prefs, experiments = EXPERIMENTS, groups = LAB_GROUPS } = {}) {
  const entry = typeof id === "string" ? experimentById(id, experiments) : null;
  if (!entry) throw new LabError("UNKNOWN_EXPERIMENT", "setLabEnabled: no such experiment");
  if (typeof enabled !== "boolean") throw new LabError("INVALID_PARAMS", "setLabEnabled: enabled is true or false");
  if (typeof prefs?.setBoolPref !== "function") throw new LabError("UNAVAILABLE", "setLabEnabled: preferences are unavailable");
  // A fresh start: what the windows report while following this switch (a
  // failed install, a dispose that threw) is what the page shows next.
  clearProblem(entry.id);
  if (enabled && !entry.graduated) {
    for (const sibling of experiments) {
      if (sibling.id !== entry.id && sibling.family === entry.family && !sibling.graduated && isEnabled(sibling, prefs)) {
        prefs.setBoolPref(labPref(sibling.id), false);
      }
    }
  }
  prefs.setBoolPref(switchOf(entry).pref, enabled);
  return listForPage({ prefs, experiments, groups });
}

// ---- the AI clients, for the Lab page -----------------------------------------------------

/**
 * Every client's status for the Lab page (clients.sys.mjs). check false only
 * finds the files (nothing starts); check true reads versions and checks the
 * options the Lab uses, without a model call.
 */
export function clientStatusForPage({ check = false, services = null, platform = null } = {}) {
  return (platform ?? labPlatform({ services })).statuses({ check: check === true });
}

// ---- per window ------------------------------------------------------------------------

const INERT = Object.freeze({ dispose() {}, diagnostics: () => ({ installed: [], installs: 0, disposals: 0, failures: 0 }), isInstalled: () => false });
const INERT_TOAST = Object.freeze({ close() {} });
const codeOf = error => (typeof error?.code === "string" && PROBLEM_CODES.has(error.code) ? error.code : "INSTALL_FAILED");

function loadModule(entry) {
  try { return ChromeUtils.importESModule(LAB_URL + entry.module); }
  catch (error) { throw Object.assign(new LabError("LOAD_FAILED", `${entry.module} could not be loaded`), { cause: error }); }
}

/**
 * Installs the Lab into one normal browser window (AxioSozoStartup's
 * installers). Options are what every installer gets: `services`
 * (AxioSozoServices), `adapter` (ZenWorkspaceAdapter; required, a private or
 * unknown window gets nothing), `engineOf(tab)`, `toast(window, message)` and
 * `openOverview(fragment)`. Tests also pass `prefs`, `experiments`, `load(entry)`
 * (returns the module), `ai`, `platform` (a getter of the process platform)
 * and `sensitiveHost(host)`.
 *
 * Each experiment's installer is called as installer(window, ctx) with the
 * frozen ctx: { id, window, document, services, adapter, engineOf, openOverview,
 * toast(message), ai, agents, signal }. It returns { dispose() }, a function,
 * or nothing; it may be async. `signal` aborts when the experiment is turned
 * off or the window closes, so listeners added with { signal }, cards opened
 * with { signal } and ctx.agents subscriptions go away by themselves.
 *
 * Returns { dispose(), diagnostics(), isInstalled(id) }.
 */
let leftoversCleared = false;
/** For tests: the next window clears leftovers again. */
export const resetLeftoversForTesting = () => { leftoversCleared = false; };

export function installLab(window, { services = null, adapter = null, engineOf = () => "gecko", toast = null, openOverview = null,
  prefs = globalThis.Services?.prefs, experiments = EXPERIMENTS, load = loadModule, ai = null, platform = null,
  sensitiveHost = host => isSensitiveHost(host).sensitive } = {}) {
  const document = window?.document;
  if (!document || typeof prefs?.getBoolPref !== "function") return INERT;
  try { if (adapter?.isPrivateWindow?.() !== false) return INERT; } catch { return INERT; }
  const getPlatform = typeof platform === "function" ? platform : () => labPlatform({ services });
  const isPrivate = () => adapter.isPrivateWindow();
  const getStatus = options => getPlatform().statuses(options);
  const facade = ai ?? createLabAi({ window, isPrivate, getBackend: () => getPlatform().backend, getStatus });
  const token = Symbol("window"); // this window's problems
  if (!leftoversCleared) {
    // A run's image or schema file, or a hand-over script, that a crash left behind.
    leftoversCleared = true;
    try { Promise.resolve(getPlatform().cleanLeftovers()).catch(error => console.error("AxioSozo Lab: leftovers not cleared", error)); }
    catch (error) { console.error("AxioSozo Lab: leftovers not cleared", error); }
  }
  const Controller = window.AbortController ?? globalThis.AbortController;
  const running = new Map(); // id → { controller, handle, ready }
  const stats = { installs: 0, disposals: 0, failures: 0 };
  let disposed = false;
  let sheet = null;
  const toastFor = message => {
    try { return toast?.(window, message) ?? INERT_TOAST; } catch (error) { console.error("AxioSozo Lab: toast failed", error); return INERT_TOAST; }
  };

  function cleanUp(entry, handle) {
    try {
      if (typeof handle === "function") handle();
      else if (typeof handle?.dispose === "function") handle.dispose();
    } catch (error) {
      console.error(`AxioSozo Lab: ${entry.id} did not clean up`, error);
      noteProblem(entry.id, "DISPOSE_FAILED", token);
    }
  }

  function stop(entry) {
    const record = running.get(entry.id);
    if (!record) return;
    running.delete(entry.id);
    if (record.ready) { cleanUp(entry, record.handle); stats.disposals++; }
    try { record.controller.abort(); } catch {}
    if (!running.size && sheet) { sheet(); sheet = null; }
  }

  function fail(entry, record, error) {
    stats.failures++;
    console.error(`AxioSozo Lab: ${entry.id} could not start`, error);
    noteProblem(entry.id, codeOf(error), token);
    if (running.get(entry.id) === record) stop(entry);
  }

  function start(entry) {
    const controller = new Controller();
    const record = { controller, handle: null, ready: false };
    running.set(entry.id, record);
    sheet ??= useStylesheet(document);
    const agents = createAgentsView({ getService: () => getPlatform().agents, isPrivate, signal: controller.signal, isSensitiveHost: sensitiveHost,
      getStatus });
    const ctx = Object.freeze({ id: entry.id, window, document, services, adapter, engineOf, openOverview,
      toast: toastFor, ai: facade, agents, signal: controller.signal });
    let result;
    try {
      let module;
      try { module = load(entry); }
      catch (error) {
        throw error instanceof LabError && PROBLEM_CODES.has(error.code) ? error
          : Object.assign(new LabError("LOAD_FAILED", `${entry.module} could not be loaded`), { cause: error });
      }
      const install = module?.[entry.installer];
      if (typeof install !== "function") throw new LabError("INSTALLER_MISSING", `${entry.module} exports no ${entry.installer}`);
      result = install(window, ctx);
    } catch (error) { fail(entry, record, error); return; }
    const settle = handle => {
      // Turned off (or the window closed) while it was still installing.
      if (running.get(entry.id) !== record) { cleanUp(entry, handle); return; }
      record.handle = handle;
      record.ready = true;
      stats.installs++;
      clearProblem(entry.id, token);
    };
    if (typeof result?.then === "function") result.then(settle, error => { if (running.get(entry.id) === record) fail(entry, record, error); });
    else settle(result);
  }

  function sync(entry) {
    if (disposed || entry.graduated) return;
    try {
      const on = isEnabled(entry, prefs);
      if (on && !running.has(entry.id)) start(entry);
      else if (!on && running.has(entry.id)) stop(entry);
    } catch (error) { console.error(`AxioSozo Lab: ${entry.id} switch failed`, error); }
  }

  const observer = {
    observe(_subject, topic, name) {
      if (disposed || topic !== "nsPref:changed") return;
      const entry = experimentById(labIdFromPref(name), experiments);
      if (entry) sync(entry);
    },
  };
  try { prefs.addObserver?.(LAB_PREF_PREFIX, observer); } catch (error) { console.error("AxioSozo Lab: switches are not live", error); }
  for (const entry of experiments) sync(entry);

  return Object.freeze({
    /** Counts and the ids running in this window; nothing an experiment saw. */
    diagnostics: () => ({ installed: [...running.keys()], ...stats }),
    isInstalled: id => running.get(id)?.ready === true,
    dispose() {
      if (disposed) return;
      disposed = true;
      try { prefs.removeObserver?.(LAB_PREF_PREFIX, observer); } catch {}
      for (const id of [...running.keys()].reverse()) stop(experimentById(id, experiments));
      if (sheet) { sheet(); sheet = null; }
      // This window is gone, and so is what went wrong in it.
      for (const id of [...problems.keys()]) clearProblem(id, token);
    },
  });
}
