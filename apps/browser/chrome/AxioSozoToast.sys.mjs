/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. https://mozilla.org/MPL/2.0/ */

// Short, calm confirmations for actions that otherwise happen silently
// ("Stopped 3 servers", "Removed Webapp from this space" with Undo). They are
// Zen's own toasts: Zen's gZenUIManager.showToast takes Fluent ids only and
// AxioSozo ships no Fluent file, so this draws the same markup into Zen's
// #zen-toast-container (ZenUIManager.mjs _createToastElement): an
// hbox.zen-toast holding a vbox of labels (the second one .description) and an
// optional button.footer-button.primary. Zen's stylesheet (zen-popup.css,
// "Toast notifications") paints it; axiosozo-runtime.css only lets the button
// show its text, since Zen's toast buttons are icon-only.
//
// It moves like Zen's (gZenUIManager.motion: a spring in, a quick fade and
// shrink out) and not at all under prefers-reduced-motion. Text is plain
// (textContent, never markup) and announced politely. Hover or keyboard focus
// keeps a toast up, as does ui.popup.disable_autohide. A missing container
// (another layout, a test window) shows nothing and never throws.

export const CONTAINER_ID = "zen-toast-container";
export const TOAST_CLASS = "zen-toast";
export const TOAST_ATTRIBUTE = "axiosozo-toast";
export const DEFAULT_TIMEOUT_MS = 2400;
export const MAX_TEXT = 160;
const REDUCED_MOTION = "(prefers-reduced-motion: reduce)";
// Zen's own timings (ZenUIManager.mjs showToast).
const SPRING_IN = Object.freeze({ type: "spring", bounce: 0.2, duration: 0.5 });
const BUMP = Object.freeze({ duration: 0.1, bounce: 0 });
const FADE_OUT = Object.freeze({ duration: 0.2, bounce: 0 });
// Without Zen's motion library: the same shapes through Web Animations.
const SPRING_EASING = "cubic-bezier(0.25, 1.3, 0.5, 1)";

const INERT = Object.freeze({ close() {} });
const shown = new WeakMap(); // document → Map(key → toast state)

const plain = (value) => {
  const text = String(value ?? "").replace(/\s+/gu, " ").trim();
  return text.length > MAX_TEXT ? `${text.slice(0, MAX_TEXT - 1)}…` : text;
};
const motionOf = (window) => { try { return window.gZenUIManager?.motion ?? null; } catch { return null; } };
const reducedMotion = (window) => { try { return window.matchMedia?.(REDUCED_MOTION)?.matches === true; } catch { return false; } };
const autohideOff = (window) => {
  try { return window.Services?.prefs?.getBoolPref?.("ui.popup.disable_autohide", false) === true; } catch { return false; }
};

function animateIn(window, node, reused) {
  if (reducedMotion(window)) return;
  const motion = motionOf(window);
  if (typeof motion?.animate === "function") {
    if (!node.style.transform) node.style.transform = "scale(0)";
    const bump = reused ? Promise.resolve(motion.animate(node, { scale: 0.2 }, BUMP)) : Promise.resolve();
    // A failed animation must never leave the toast at scale(0).
    bump.then(() => motion.animate(node, { scale: 1 }, SPRING_IN)).catch(() => { node.style.transform = ""; });
    return;
  }
  try { node.animate?.([{ transform: "scale(0)" }, { transform: "scale(1)" }], { duration: 400, easing: SPRING_EASING }); } catch {}
}

function animateOut(window, node) {
  if (reducedMotion(window)) return Promise.resolve();
  const motion = motionOf(window);
  try {
    if (typeof motion?.animate === "function") return Promise.resolve(motion.animate(node, { opacity: [1, 0], scale: [1, 0.5] }, FADE_OUT));
    const animation = node.animate?.([{ opacity: 1, transform: "scale(1)" }, { opacity: 0, transform: "scale(0.5)" }],
      { duration: 200, easing: "ease-out", fill: "forwards" });
    if (animation?.finished) return animation.finished;
  } catch {}
  return Promise.resolve();
}

/** One toast's node and lifetime: hover or focus pauses its timer, and it
 * closes once (animated), hiding Zen's container when it was the last. */
function createToast(window, document, container, registry, id) {
  const state = { id, node: document.createXULElement("hbox"), labels: document.createXULElement("vbox"),
    title: document.createXULElement("label"), description: null, button: null, delay: DEFAULT_TIMEOUT_MS, timer: null,
    hovered: false, focused: false, closing: false };
  const clearTimer = () => { if (state.timer !== null) { window.clearTimeout?.(state.timer); state.timer = null; } };
  state.arm = () => {
    clearTimer();
    if (state.closing || state.hovered || state.focused || autohideOff(window) || typeof window.setTimeout !== "function") return;
    state.timer = window.setTimeout(() => { state.timer = null; state.close(); }, state.delay);
  };
  state.close = () => {
    if (state.closing) return;
    state.closing = true;
    clearTimer();
    if (registry.get(id) === state) registry.delete(id);
    const finish = () => {
      state.node.remove();
      if (!container.children?.length) container.setAttribute("hidden", "true");
    };
    animateOut(window, state.node).then(finish, finish);
  };
  const { node, labels, title } = state;
  labels.appendChild(title);
  node.appendChild(labels);
  node.classList.add(TOAST_CLASS);
  node.setAttribute(TOAST_ATTRIBUTE, "true");
  node.setAttribute("role", "status");
  node.setAttribute("aria-live", "polite");
  node.setAttribute("aria-atomic", "true");
  node.addEventListener("mouseenter", () => { state.hovered = true; clearTimer(); });
  node.addEventListener("mouseleave", () => { state.hovered = false; state.arm(); });
  node.addEventListener("focusin", () => { state.focused = true; clearTimer(); });
  node.addEventListener("focusout", () => { state.focused = false; state.arm(); });
  registry.set(id, state);
  return state;
}

/**
 * Shows a toast in Zen's toast container. `title`: one short sentence;
 * `description`: an optional second, quieter line; `button`: `{ label,
 * onCommand }` (for example Undo; pressing it runs onCommand and closes the
 * toast); `timeoutMs`: how long it stays once nothing hovers or focuses it;
 * `key`: a toast with the same key that is still up is updated in place, as
 * Zen reuses a toast with the same message (default: the title).
 * Returns `{ close() }`.
 */
export function showAxioSozoToast(window, { title, description = null, button = null, timeoutMs = DEFAULT_TIMEOUT_MS, key = null } = {}) {
  try {
    const document = window?.document;
    const container = document?.getElementById?.(CONTAINER_ID);
    const text = plain(title);
    if (!container || !text || typeof document.createXULElement !== "function") return INERT;
    const detail = description === null || description === undefined ? "" : plain(description);
    const action = button && typeof button.onCommand === "function" && plain(button.label) ? button : null;
    const delay = Number.isFinite(timeoutMs) && timeoutMs > 0 ? timeoutMs : DEFAULT_TIMEOUT_MS;
    const id = plain(key ?? text);
    if (!shown.has(document)) shown.set(document, new Map());
    const registry = shown.get(document);

    let state = registry.get(id);
    const reused = !!state && !state.closing && state.node.parentNode === container;
    if (!reused) state = createToast(window, document, container, registry, id);
    state.delay = delay;

    // The visible text. A new toast is first added empty and filled a frame
    // later, so screen readers hear it as a change inside a live region.
    const fill = () => {
      if (state.closing) return;
      state.title.textContent = text;
      if (detail) {
        if (!state.description) {
          state.description = document.createXULElement("label");
          state.description.classList.add("description");
          state.labels.appendChild(state.description);
        }
        state.description.textContent = detail;
      } else if (state.description) { state.description.remove(); state.description = null; }
    };

    state.button?.remove();
    state.button = null;
    state.node.removeAttribute("button");
    if (action) {
      const node = document.createXULElement("button");
      node.classList.add("footer-button");
      node.classList.add("primary");
      node.setAttribute("label", plain(action.label));
      node.addEventListener("command", event => {
        if (state.closing) return;
        try { action.onCommand(event); } catch (error) { console.error("AxioSozo: toast action failed", error); }
        state.close();
      });
      state.node.appendChild(node);
      state.node.setAttribute("button", "true");
      state.button = node;
    }

    container.removeAttribute("hidden");
    if (!reused) {
      container.appendChild(state.node);
      if (typeof window.requestAnimationFrame === "function") window.requestAnimationFrame(fill); else fill();
    } else fill();
    animateIn(window, state.node, reused);
    state.arm();
    return Object.freeze({ close: () => state.close() });
  } catch (error) {
    console.error("AxioSozo: toast not shown", error);
    return INERT;
  }
}
