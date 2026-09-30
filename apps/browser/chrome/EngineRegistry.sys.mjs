/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. https://mozilla.org/MPL/2.0/ */

// The single list of engines a tab can run in (docs/ideas/multi-engine-lineup.md).
// Internal ids are technical engine names (`gecko`, `chromium`, later `webkit`);
// UI labels are separate and friendly ("Firefox", "Chromium", "Safari"). Menus,
// tab markers and preference validation read this list instead of comparing
// against "chromium", so adding an engine is one entry plus its presenter.
//
// This module only describes engines. It renders nothing and never starts an
// engine: rendering, input and process code stay in the presenters.

/** Pref that lists engines that are not available yet (disabled, with a reason) in menus. Developer use. */
export const SHOW_UNAVAILABLE_PREF = "axiosozo.engines.showUnavailable";
export const DEFAULT_ENGINE = "gecko";
export const ICON_BASE = "chrome://browser/content/axiosozo/icons/";

const yes = Object.freeze({ available: true, reason: null });
const no = reason => Object.freeze({ available: false, reason });

function envValue(window, name) {
  try { return window?.Services?.env?.get?.(name) ?? ""; } catch { return ""; }
}

/**
 * Chromium web mode: the existing flag EngineProbeControls gates on
 * (AXIOSOZO_ENGINE_SWITCHING=1, with the fixture probe excluded).
 */
export function chromiumWebModeEnabled(window) {
  return envValue(window, "AXIOSOZO_ENGINE_PROBE") !== "1" && envValue(window, "AXIOSOZO_ENGINE_SWITCHING") === "1";
}

const ENGINES = Object.freeze([
  Object.freeze({
    id: "gecko", label: "Firefox", devLabel: "Firefox (Gecko)", icon: `${ICON_BASE}engine-gecko.svg`,
    experimental: false,
    // context-v1 `engine_preference` value. `firefox` is its deprecated read alias.
    contractValue: "gecko",
    available: () => yes,
  }),
  Object.freeze({
    id: "chromium", label: "Chromium", devLabel: "Chromium (Blink)", icon: `${ICON_BASE}engine-chromium.svg`,
    experimental: true, contractValue: "chromium",
    available: window => (chromiumWebModeEnabled(window) ? yes : no("Chromium is not enabled in this browser")),
  }),
  Object.freeze({
    id: "webkit", label: "Safari", devLabel: "WebKit", icon: `${ICON_BASE}engine-webkit.svg`,
    experimental: true, contractValue: null, // not in context-v1 yet
    available: () => no("not yet available"),
  }),
]);

// Presenter factories are supplied by the workstream that owns the engine
// (CEF registers `chromium`). The registry never constructs one by itself.
const presenterFactories = new Map();

export function registerEnginePresenter(id, factory) {
  if (!engineById(id)) throw new Error("UNKNOWN_ENGINE");
  if (typeof factory !== "function") throw new Error("INVALID_PRESENTER_FACTORY");
  presenterFactories.set(id, factory);
  return () => { if (presenterFactories.get(id) === factory) presenterFactories.delete(id); };
}

export function enginePresenterFactory(id) {
  return presenterFactories.get(id) ?? null;
}

function engineById(id) {
  return ENGINES.find(engine => engine.id === id) ?? null;
}

/** All registered engines, available or not. */
export function listEngines() {
  return ENGINES;
}

export function getEngine(id) {
  return engineById(id);
}

export function engineIds() {
  return ENGINES.map(engine => engine.id);
}

/**
 * Accepts a registry id and the deprecated context-v1 spelling `firefox`
 * (still read for one version, stored data and older callers), returns the
 * registry id, or null when unknown. Session values and tab attributes written
 * by earlier builds ("chromium") normalize to themselves.
 */
export function normalizeEngineId(value) {
  if (value === "firefox") return "gecko";
  return typeof value === "string" && engineById(value) ? value : null;
}

/** Like normalizeEngineId, but unknown or empty persisted values mean the default engine. */
export function engineFromPersisted(value) {
  return normalizeEngineId(value) ?? DEFAULT_ENGINE;
}

/** Registry id (or the deprecated `firefox`) → context-v1 spelling; null when the contract cannot carry it yet. */
export function toContextEngine(id) {
  return engineById(normalizeEngineId(id))?.contractValue ?? null;
}

/** context-v1 spelling (or a registry id) → registry id. */
export function fromContextEngine(value) {
  return normalizeEngineId(value);
}

/** True when `value` may be stored as a context-v1 `engine_preference` (`firefox` is read, then stored as `gecko`). */
export function isContextEngine(value) {
  return typeof value === "string" && (value === "firefox" || ENGINES.some(engine => engine.contractValue === value));
}

/** {available, reason} for an engine in this window. Unknown ids are unavailable. */
export function engineAvailability(id, window) {
  const engine = engineById(normalizeEngineId(id));
  if (!engine) return no("unknown engine");
  try { return engine.available(window) ?? no("unavailable"); } catch { return no("unavailable"); }
}

export function isEngineAvailable(id, window) {
  return engineAvailability(id, window).available === true;
}

export function availableEngines(window) {
  return ENGINES.filter(engine => isEngineAvailable(engine.id, window));
}

export function showUnavailableEngines(window) {
  try { return window?.Services?.prefs?.getBoolPref?.(SHOW_UNAVAILABLE_PREF, false) === true; } catch { return false; }
}

/**
 * Engines a menu lists: the available ones, plus the unavailable ones (marked
 * `disabled` with a reason) only while the developer pref is on.
 */
export function menuEngines(window, engines = ENGINES) {
  const showAll = showUnavailableEngines(window);
  const entries = [];
  for (const engine of engines) {
    let state;
    try { state = engine.available(window) ?? no("unavailable"); } catch { state = no("unavailable"); }
    if (state.available || showAll) entries.push({ engine, disabled: !state.available, reason: state.reason });
  }
  return entries;
}

export function engineLabel(id, { dev = false } = {}) {
  const engine = engineById(normalizeEngineId(id));
  return engine ? (dev ? engine.devLabel : engine.label) : String(id ?? "");
}

/** The engine a one-click switch moves a tab to: the next available engine after `current`, wrapping. */
export function nextEngine(current, window) {
  const ids = availableEngines(window).map(engine => engine.id);
  const from = normalizeEngineId(current) ?? DEFAULT_ENGINE;
  if (ids.length < 2 || !ids.includes(from)) return ids.find(id => id !== from) ?? null;
  return ids[(ids.indexOf(from) + 1) % ids.length];
}

/**
 * Model of the tab context menu for a tab currently in `current`.
 *  - `toggle`: at most two engines are available; one item "Open in <other>".
 *  - `submenu`: more than two; "Open in" with one entry per engine, the current one checked.
 *  - `hidden`: nothing to switch to.
 * Unavailable engines (developer pref) appear disabled in a submenu only.
 */
export function tabMenuModel(current, window, engines = ENGINES) {
  const from = normalizeEngineId(current) ?? DEFAULT_ENGINE;
  const entries = menuEngines(window, engines);
  const available = entries.filter(entry => !entry.disabled);
  if (available.length > 2 || (available.length > 1 && entries.length > available.length)) {
    return { mode: "submenu", label: "Open in", items: entries.map(({ engine, disabled, reason }) => ({
      id: engine.id, label: engine.label, checked: engine.id === from, disabled: disabled || engine.id === from, reason })) };
  }
  const other = available.find(entry => entry.engine.id !== from);
  if (!other) return { mode: "hidden", label: "", items: [] };
  return { mode: "toggle", label: `Open in ${other.engine.label}`,
    items: [{ id: other.engine.id, label: other.engine.label, checked: false, disabled: false, reason: null }] };
}
