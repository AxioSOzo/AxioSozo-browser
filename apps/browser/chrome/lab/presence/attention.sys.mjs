/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. https://mozilla.org/MPL/2.0/ */

// The one attention rule of agent presence (STUDY.md §2, research-landscape
// §0.5 and direction 2): only an agent that waits on you interrupts. When a
// session enters needs_you, ONE window (the one used last) raises one calm Zen
// toast that names the agent, the project and what it waits for, with one
// button back:
//   - a run this browser started (its process ended at the question):
//     "Continue in Terminal" resumes it there, where the question is answered;
//   - a session still open elsewhere (a terminal, an app): "Show" opens the
//     result card, which says where to answer it.
// Done, failed and stopped never interrupt: they wait in the sidebar. When the
// wait ends (answered in the terminal), a toast still up closes.
import { clientLabel, line, projectName } from "./model.sys.mjs";

export const NEEDS_YOU_TOAST_MS = 12000;

/** The toast for a session that waits on you: { title, description, button, key }. */
export function needsYouToast(session) {
  const resumable = session?.origin === "browser" && session?.canResume === true;
  return {
    title: `${clientLabel(session)} needs you in ${projectName(session)}`,
    // One short line: what it wanted; the button says how to answer.
    description: line(String(session?.reason ?? "").replace(/\s*Continue in Terminal to decide\.?$/u, ""), 80) || "It is waiting for your answer.",
    action: resumable ? "continue" : "show",
    label: resumable ? "Continue in Terminal" : "Show",
    key: `axiosozo-lab-needs-you:${session?.id ?? ""}`,
  };
}

/**
 * Wires the rule into one window: reports every session change the view
 * sees to the hub, and shows the toast when the hub picks this window.
 * `showCard(session, event)` opens the result card (over the current page).
 * Returns { dispose() }.
 */
export function installAttention(window, ctx, { source, hub, showCard, clock = () => Date.now() }) {
  const document = window.document;
  let usedAt = clock();
  const toasts = new Map(); // session id → toast handle
  const used = () => { usedAt = clock(); };
  window.addEventListener("activate", used, { signal: ctx.signal });
  window.addEventListener("focus", used, { signal: ctx.signal });
  const hasFocus = () => { try { return document.hasFocus?.() === true; } catch { return false; } };

  function show(session) {
    const toast = needsYouToast(session);
    const handle = ctx.toast({ title: toast.title, description: toast.description, key: toast.key, timeoutMs: NEEDS_YOU_TOAST_MS,
      button: { label: toast.label, onCommand: event => {
        if (toast.action === "continue") {
          ctx.agents.continueInTerminal(session.id, { trigger: event }).catch(error => {
            // Say why where it can be read: the card, with the reason.
            showCard(ctx.agents.get?.(session.id) ?? session, null, error?.reason ?? "Terminal could not be opened.");
          });
        } else showCard(ctx.agents.get?.(session.id) ?? session, event, null);
      } } });
    toasts.set(session.id, handle);
  }

  const unregister = hub.registerWindow({
    // A focused window wins; otherwise the one used last.
    usedAt: () => (hasFocus() ? Number.MAX_SAFE_INTEGER : usedAt),
    handlers: {
      "needs-you": session => show(session),
      "needs-you-ended": session => { toasts.get(session.id)?.close?.(); toasts.delete(session.id); },
    },
  });
  const off = source.subscribe(({ sessions }) => { for (const session of sessions) hub.observe(session); });

  let disposed = false;
  function dispose() {
    if (disposed) return;
    disposed = true;
    off();
    unregister();
    for (const handle of toasts.values()) { try { handle?.close?.(); } catch {} }
    toasts.clear();
  }
  ctx.signal?.addEventListener?.("abort", dispose, { once: true });
  return Object.freeze({ dispose });
}
