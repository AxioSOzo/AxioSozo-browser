/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. https://mozilla.org/MPL/2.0/ */

// Warm spare engine hosts (docs/perf/pixel-path.md, "Warm spare hosts"; perf-phase3).
//
// Switching a tab from Gecko to Chromium or WebKit spent 450-550 ms in host start-up (CEF
// initialisation, WPE web process launch) against ~50 ms in the parent (linux-engine-profile
// run 39379600003). One host per engine is therefore started ahead of time, while the browser
// is idle, through the engine's own launcher: the same binary, sandbox, private per-host
// profile, fixture origin and hello as a host started at the switch. Rules:
//
// - Fixture mode only (the per-tab fixture hosts; never the shared web-mode Chromium host)
//   and never on macOS (surface endpoints are untouched there).
// - One use: a spare serves exactly one tab and is never returned; the next one is started
//   when that tab's host closes (a timed refill while the tab is open started a host inside
//   the new tab's busy first minute: linux-engine-profile run 39385314455).
// - A spare that died, failed or no longer matches the request is shut down, never used.
// - Dropped on memory pressure and at quit; pref `axiosozo.engines.prewarm` (default on).

export const PREWARM_PREF = "axiosozo.engines.prewarm";
export const PREWARM_DEFAULT = true;
// The first spare: after start-up work, at idle.
export const PREWARM_STARTUP_DELAY_MS = 3000;
// A tab's host closed: the next spare soon.
export const PREWARM_AFTER_CLOSE_MS = 1000;
const DROP_TOPICS = ["memory-pressure", "quit-application-granted"];

export function prewarmWanted(prefs = globalThis.Services?.prefs) {
  try { return prefs ? prefs.getBoolPref(PREWARM_PREF, PREWARM_DEFAULT) !== false : PREWARM_DEFAULT; } catch { return PREWARM_DEFAULT; }
}

export class SpareHost {
  #launch; #entry = null; #timer = null; #due = Infinity; #timerWindow = null; #disposed = false; #observers = null;
  #stats = { launched: 0, taken: 0, refused: 0, dropped: 0, failed: 0 };
  /** `launch()` resolves to a connected host (with `exited` and `shutdown()`), or rejects. */
  constructor(launch, { observers = globalThis.Services?.obs ?? null } = {}) {
    this.#launch = launch;
    this.#observers = observers;
    for (const topic of DROP_TOPICS) { try { observers?.addObserver(this, topic); } catch {} }
  }
  /** "none", "starting" or "ready" (diagnostics). */
  get state() { return !this.#entry ? "none" : this.#entry.host ? "ready" : "starting"; }
  get stats() { return { ...this.#stats, state: this.state }; }
  /** Starts a spare now unless one exists (or is starting). */
  prewarm() {
    if (this.#disposed || this.#entry) return false;
    const entry = { host: null, dropped: false, promise: null };
    this.#entry = entry;
    this.#stats.launched++;
    entry.promise = Promise.resolve().then(() => this.#launch()).then(host => {
      entry.host = host;
      if (entry.dropped) { this.#shutdown(host); return null; }
      // A spare that exits while waiting is forgotten (the next schedule starts another).
      Promise.resolve(host.exited).then(() => { if (this.#entry === entry) this.#entry = null; }, () => {});
      return host;
    }, () => {
      this.#stats.failed++;
      if (this.#entry === entry) this.#entry = null;
      return null;
    });
    return true;
  }
  /** Starts a spare after `delayMs`, at the window's next idle period. An earlier request wins. */
  schedule(win, delayMs = PREWARM_STARTUP_DELAY_MS) {
    if (this.#disposed || this.#entry) return;
    const now = Date.now(), due = now + Math.max(0, delayMs);
    if (this.#timer !== null) {
      if (due >= this.#due) return;
      try { this.#timerWindow?.clearTimeout(this.#timer); } catch {}
      this.#timer = null;
    }
    const setTimeout = win?.setTimeout?.bind(win);
    if (!setTimeout) { this.prewarm(); return; }
    this.#due = due; this.#timerWindow = win;
    this.#timer = setTimeout(() => {
      this.#timer = null; this.#due = Infinity; this.#timerWindow = null;
      if (typeof win.requestIdleCallback === "function") win.requestIdleCallback(() => this.prewarm(), { timeout: 10000 });
      else this.prewarm();
    }, Math.max(0, delayMs));
  }
  /**
   * The spare for one tab (waiting for it if it is still starting), or null: none, failed,
   * exited, or refused by `usable(host)` (then it is shut down). One use.
   */
  async take(usable) {
    const entry = this.#entry;
    if (!entry) return null;
    this.#entry = null;
    const host = await entry.promise;
    if (!host) return null;
    let ok = false;
    try { ok = !!usable(host); } catch {}
    if (!ok) { this.#stats.refused++; this.#shutdown(host); return null; }
    this.#stats.taken++;
    return host;
  }
  /** Drops the spare (memory pressure, quit, pref off). */
  drop() {
    const entry = this.#entry;
    this.#entry = null;
    if (this.#timer !== null) { try { this.#timerWindow?.clearTimeout(this.#timer); } catch {} this.#timer = null; this.#due = Infinity; }
    if (!entry) return;
    this.#stats.dropped++;
    entry.dropped = true;
    if (entry.host) this.#shutdown(entry.host);
  }
  observe(_subject, topic) {
    if (!DROP_TOPICS.includes(topic)) return;
    this.drop();
    if (topic === "quit-application-granted") this.dispose();
  }
  dispose() {
    this.drop();
    this.#disposed = true;
    for (const topic of DROP_TOPICS) { try { this.#observers?.removeObserver(this, topic); } catch {} }
  }
  #shutdown(host) { try { Promise.resolve(host.shutdown?.()).catch(() => {}); } catch {} }
}
