/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. https://mozilla.org/MPL/2.0/ */

// What agent presence shares between windows (one per browser process):
//
//  - dismissals: closing an item, Dismiss on a card or Looks right on a proof
//    tab hides that session everywhere until it reaches a later phase
//    (model.sys.mjs dismissalHides), or until it waits on you again;
//  - "seen": a result whose card was opened, so a row can show it quieter;
//  - one interrupt per wait: each window reports what its ctx.agents
//    subscription saw; the hub notices a session entering needs_you once and
//    hands it to ONE window, the one used last (the focused one), never to
//    every open window;
//  - handOnce(channel, key, payload): the same "one window acts" for other
//    events (the proof tab: a finished run marks one tab, not one per window).
//
// Nothing here touches a window: windows register a handler and a "last
// used" clock. State resets when the last window unregisters (the experiment
// went off everywhere), so turning it on again starts fresh.
import { dismissalHides, phaseOf, presenceState } from "./model.sys.mjs";

export function createPresenceHub({ clock = () => Date.now() } = {}) {
  const dismissed = new Map(); // session id → { phase, at }
  const seen = new Map(); // session id → state
  const lastState = new Map(); // session id → state the hub last heard
  const waitingSince = new Map(); // session id → when it entered needs_you
  const handled = new Set(); // `${channel}\u0000${key}` delivered once
  const windows = new Map(); // token → { usedAt(), handlers: Map(channel → fn) }
  const listeners = new Set(); // hub changes (a dismissal), for every window's view

  const emit = () => { for (const listener of [...listeners]) { try { listener(); } catch (error) { console.error("AxioSozo Lab: presence listener failed", error); } } };

  /** The window that acts: the one used last among those that handle `channel`. */
  function preferred(channel) {
    let best = null, bestAt = -Infinity;
    for (const [token, entry] of windows) {
      if (!entry.handlers.has(channel)) continue;
      let at = -Infinity;
      try { at = Number(entry.usedAt()) || 0; } catch { at = 0; }
      if (at > bestAt) { best = token; bestAt = at; }
    }
    return best;
  }

  function deliver(channel, payload) {
    const token = preferred(channel);
    if (!token) return false;
    try { windows.get(token).handlers.get(channel)(payload); } catch (error) { console.error(`AxioSozo Lab: ${channel} failed`, error); }
    return true;
  }

  return Object.freeze({
    /**
     * A window joins: `usedAt()` says when it was last used (focused);
     * `handlers` maps channels ("needs-you", "needs-you-ended", "proof") to
     * functions. Returns unregister().
     */
    registerWindow({ usedAt = () => 0, handlers = {} } = {}) {
      const token = Symbol("presence window");
      windows.set(token, { usedAt, handlers: new Map(Object.entries(handlers).filter(([, fn]) => typeof fn === "function")) });
      return () => {
        if (!windows.delete(token)) return;
        if (!windows.size) { dismissed.clear(); seen.clear(); lastState.clear(); waitingSince.clear(); handled.clear(); }
      };
    },
    /** Windows that show agent presence (agents-on-rows, agents-folder; start-task asks this): every registration but proof-tab's. */
    windowCount: () => [...windows.values()].filter(entry => !(entry.handlers.size === 1 && entry.handlers.has("proof"))).length,
    /** Every registration, of any experiment. */
    registrations: () => windows.size,

    /** Sessions already there when a view starts: remembered without interrupting. */
    baseline(sessions) {
      for (const session of sessions ?? []) {
        if (typeof session?.id !== "string" || lastState.has(session.id)) continue;
        const state = presenceState(session);
        lastState.set(session.id, state);
        if (state === "needs_you") waitingSince.set(session.id, session.updatedAt ?? clock());
      }
    },

    /**
     * A window saw a session change. Entering needs_you is handed to one
     * window ("needs-you"); leaving it, to every window ("needs-you-ended",
     * so a toast still up can go). Returns "entered" | "left" | null.
     */
    observe(session) {
      if (typeof session?.id !== "string") return null;
      const state = presenceState(session);
      const before = lastState.get(session.id);
      if (before === state) return null;
      lastState.set(session.id, state);
      if (state === "needs_you") {
        waitingSince.set(session.id, clock());
        // A new wait shows a dismissed run again (dismissalHides); a dismissed result never interrupts.
        if (!dismissalHides(dismissed.get(session.id) ?? null, state, { waitingSince: waitingSince.get(session.id) })) deliver("needs-you", session);
        return "entered";
      }
      if (before === "needs_you") {
        for (const entry of windows.values()) {
          const handler = entry.handlers.get("needs-you-ended");
          if (handler) { try { handler(session); } catch (error) { console.error("AxioSozo Lab: needs-you-ended failed", error); } }
        }
        return "left";
      }
      return null;
    },
    /** A session is gone from ctx.agents. */
    forget(id) { lastState.delete(id); waitingSince.delete(id); seen.delete(id); },

    /** Hides `session` until a later phase (or a new wait). */
    dismiss(session) {
      if (typeof session?.id !== "string") return;
      dismissed.set(session.id, { phase: phaseOf(presenceState(session)), at: clock() });
      emit();
    },
    isHidden(session) {
      if (typeof session?.id !== "string") return false;
      return dismissalHides(dismissed.get(session.id) ?? null, presenceState(session), { waitingSince: waitingSince.get(session.id) ?? null });
    },
    markSeen(session) {
      if (typeof session?.id !== "string") return;
      const state = presenceState(session);
      if (seen.get(session.id) === state) return;
      seen.set(session.id, state);
      emit();
    },
    isSeen: session => typeof session?.id === "string" && seen.get(session.id) === presenceState(session),

    /** Hands `payload` to one window's `channel` handler once per key. Returns whether it was handed now. */
    handOnce(channel, key, payload) {
      const id = `${channel}\u0000${key}`;
      if (handled.has(id)) return false;
      if (!deliver(channel, payload)) return false;
      handled.add(id);
      return true;
    },

    /** Takes `key` of `channel` for the caller (it acts itself); false when it was handed or taken already. */
    claim(channel, key) {
      const id = `${channel}\u0000${key}`;
      if (handled.has(id)) return false;
      handled.add(id);
      return true;
    },

    /** Called after a dismissal or "seen" changed what views show. Returns off(). */
    onChange(listener) { listeners.add(listener); return () => listeners.delete(listener); },
  });
}

/** The process's hub, shared by every window and every presence experiment. */
export const presenceHub = createPresenceHub();
