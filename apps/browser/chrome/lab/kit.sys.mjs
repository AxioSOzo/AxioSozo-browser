/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. https://mozilla.org/MPL/2.0/ */

// Small building blocks for Lab experiments, in Zen's own material (lab.css):
//
//   floatingCard(window, { anchor, title, body, actions, signal, … }) → card
//       A calm card anchored to a chrome element, a rect in the window, or an
//       area of a page ({ browser, rect }), like the area-capture bar. Never
//       modal; Escape, the close button or a click elsewhere closes it.
//       card.setThinking("Asking Claude Code…"), card.setBody(text or nodes),
//       card.setActions([...]), card.close(), await card.closed.
//   thinking(document, text)          a quiet "Thinking…" status line
//   button(document, { label, primary, quiet, onClick })
//   chip(document, { label, pressed, onClick }), chipRow(document, chips, label)
//   el(document, tag, props, ...children)   an XHTML element (text only, never markup)
//   useStylesheet(document, href?)    a chrome stylesheet held while in use → release()
//   copyText(text)                    plain text to the user's clipboard, on their click
//   placeCard(anchor, host, card)     where a card goes (pure; below, above or inside)
//
// Everything here is chrome DOM, drawn over the window or the tab's browser
// stack: never inside a web page, never read by it. Text is always set with
// textContent. Motion follows prefers-reduced-motion (lab.css).

export const XHTML = "http://www.w3.org/1999/xhtml";
export const LAB_STYLESHEET = "chrome://browser/content/axiosozo/lab/lab.css";
const INERT_CARD = null;

// ---- stylesheets ----------------------------------------------------------------------

const sheets = new WeakMap(); // document → Map(href → { node, count })
/** Holds a chrome stylesheet in `document` while anything uses it. Returns release(). */
export function useStylesheet(document, href = LAB_STYLESHEET) {
  if (!document) return () => {};
  if (!sheets.has(document)) sheets.set(document, new Map());
  const held = sheets.get(document);
  let entry = held.get(href);
  if (!entry) {
    const node = document.createProcessingInstruction?.("xml-stylesheet", `href="${href}" type="text/css"`) ?? null;
    if (node) document.insertBefore(node, document.documentElement);
    entry = { node, count: 0 };
    held.set(href, entry);
  }
  entry.count++;
  let released = false;
  return () => {
    if (released) return;
    released = true;
    if (--entry.count === 0) { entry.node?.remove(); held.delete(href); }
  };
}

// ---- elements ---------------------------------------------------------------------------

/**
 * An XHTML element. props: class, text, attrs (object), on<Event> handlers
 * (onClick → "click"), hidden, disabled, title, id, role and aria-* / data-*
 * as attributes. Children: nodes or strings (as text); null/false skipped.
 */
export function el(document, tag, props = {}, ...children) {
  const node = document.createElementNS(XHTML, tag);
  for (const [key, value] of Object.entries(props ?? {})) {
    if (value === undefined || value === null || value === false) continue;
    if (key === "class") node.className = value;
    else if (key === "text") node.textContent = String(value);
    else if (key === "attrs") for (const [name, attr] of Object.entries(value)) node.setAttribute(name, String(attr));
    else if (/^on[A-Z]/u.test(key) && typeof value === "function") node.addEventListener(key.slice(2).toLowerCase(), value);
    else if (key === "hidden" || key === "disabled") node[key] = true;
    else node.setAttribute(key, value === true ? "" : String(value));
  }
  for (const child of children.flat(Infinity)) {
    if (child === null || child === undefined || child === false) continue;
    node.append(typeof child === "object" ? child : document.createTextNode(String(child)));
  }
  return node;
}

/** A button in Zen's style. `primary`: the one main action; `quiet`: no fill. */
export function button(document, { label, primary = false, quiet = false, title = null, disabled = false, onClick = null } = {}) {
  const classes = ["axiosozo-lab-button", primary ? "primary" : null, quiet ? "quiet" : null].filter(Boolean).join(" ");
  const node = el(document, "button", { type: "button", class: classes, title, disabled, text: label });
  if (typeof onClick === "function") node.addEventListener("click", event => { if (!node.disabled) onClick(event); });
  return node;
}

/** A small pill choice. `pressed` (true/false) makes it a toggle (aria-pressed). */
export function chip(document, { label, pressed = null, title = null, disabled = false, onClick = null } = {}) {
  const node = el(document, "button", { type: "button", class: "axiosozo-lab-chip", title, disabled, text: label });
  if (typeof pressed === "boolean") node.setAttribute("aria-pressed", String(pressed));
  if (typeof onClick === "function") node.addEventListener("click", event => { if (!node.disabled) onClick(event); });
  return node;
}

/** A row of chips, read as one group named `label`. */
export function chipRow(document, chips, label = null) {
  return el(document, "div", { class: "axiosozo-lab-chips", role: "group", "aria-label": label }, chips);
}

/** "Thinking…": a status line that screen readers hear once; still under reduced motion. */
export function thinking(document, text = "Thinking…") {
  return el(document, "div", { class: "axiosozo-lab-thinking", role: "status", "aria-live": "polite" },
    el(document, "span", { class: "axiosozo-lab-thinking-dots", "aria-hidden": "true" },
      el(document, "span"), el(document, "span"), el(document, "span")),
    el(document, "span", { class: "axiosozo-lab-thinking-text", text }));
}

/** Plain text to the clipboard. Call it from the user's own click only. */
export function copyText(text, { helper = null } = {}) {
  const clipboard = helper ?? globalThis.Cc["@mozilla.org/widget/clipboardhelper;1"].getService(globalThis.Ci.nsIClipboardHelper);
  clipboard.copyString(String(text ?? ""));
}

// ---- placement --------------------------------------------------------------------------

/**
 * Where a card of `card` size goes next to `anchor` (x, y, width, height),
 * all in `host` coordinates: below when it fits, else above, else inside the
 * host's bottom edge; horizontally aligned to the anchor's start, end or
 * center and always `margin` inside the host.
 */
export function placeCard(anchor, host, card, { gap = 8, margin = 8, prefer = "below", align = "start" } = {}) {
  const below = anchor.y + anchor.height + gap;
  const above = anchor.y - gap - card.height;
  const fitsBelow = below + card.height <= host.height - margin;
  const fitsAbove = above >= margin;
  const placement = prefer === "above" ? (fitsAbove ? "above" : fitsBelow ? "below" : "inside")
    : (fitsBelow ? "below" : fitsAbove ? "above" : "inside");
  const top = placement === "below" ? below : placement === "above" ? above
    : Math.max(margin, Math.min(anchor.y + anchor.height - card.height - gap, host.height - card.height - margin));
  const wanted = align === "end" ? anchor.x + anchor.width - card.width
    : align === "center" ? anchor.x + (anchor.width - card.width) / 2 : anchor.x;
  const left = Math.min(Math.max(wanted, margin), Math.max(margin, host.width - card.width - margin));
  return { left: Math.round(left), top: Math.round(top), placement };
}

const numberRect = value => ["x", "y", "width", "height"].every(key => Number.isFinite(value?.[key]));
const rectOf = node => {
  try { const rect = node?.getBoundingClientRect?.(); return numberRect(rect) ? rect : null; } catch { return null; }
};

/** The card's host and its anchor rect in host coordinates, or null. */
function resolveAnchor(window, anchor) {
  const document = window.document;
  const root = document.documentElement;
  const viewport = () => ({ x: 0, y: 0, width: window.innerWidth || 1200, height: window.innerHeight || 800 });
  if (anchor?.browser) {
    const browser = anchor.browser;
    const stack = browser.parentNode;
    if (!stack?.classList?.contains("browserStack")) return null;
    const size = () => rectOf(stack) ?? rectOf(browser) ?? { x: 0, y: 0, width: 1200, height: 800 };
    const rect = () => {
      if (numberRect(anchor.rect)) return anchor.rect;
      const { width } = size();
      return { x: width / 2, y: 0, width: 0, height: 0 };
    };
    return { host: stack, fixed: false, browser, size, rect, align: numberRect(anchor.rect) ? null : "center" };
  }
  if (anchor && typeof anchor === "object" && anchor.ownerDocument === document && typeof anchor.getBoundingClientRect === "function") {
    return { host: root, fixed: true, browser: null, size: viewport, rect: () => rectOf(anchor) ?? { x: 0, y: 0, width: 0, height: 0 }, align: null };
  }
  if (numberRect(anchor)) return { host: root, fixed: true, browser: null, size: viewport, rect: () => anchor, align: null };
  return null;
}

// ---- floating card --------------------------------------------------------------------

let serial = 0;

/**
 * A floating card in Zen's material.
 *  anchor: a chrome element; a { x, y, width, height } rect in the window; or
 *    { browser, rect? } for an area of a page (rect relative to the browser's
 *    top-left in CSS px, as area capture measures it; no rect: top center).
 *  title: one short line; label: the accessible name when there is no title.
 *  body: text (shown as plain text) or nodes; actions: [{ label, primary,
 *    quiet, title, disabled, onClick(event, card), closes }].
 *  width (px, default 360), prefer ("below" | "above"), align ("start" |
 *  "end" | "center"), focus (move keyboard focus in; default true),
 *  closeOnOutside (default true), signal (an AbortSignal that closes it;
 *  pass ctx.signal), onClose(reason).
 * Returns the card, or null when the anchor cannot host one (for example a
 * browser that is not in a tab's browser stack).
 */
export function floatingCard(window, { anchor, title = "", label = null, body = null, actions = [], width = 360, prefer = "below",
  align = "start", focus = true, closeOnOutside = true, signal = null, onClose = null } = {}) {
  const document = window?.document;
  const target = document ? resolveAnchor(window, anchor) : null;
  if (!target || signal?.aborted) return INERT_CARD;
  const release = useStylesheet(document);
  const previous = document.activeElement ?? null;
  const id = `axiosozo-lab-card-${++serial}`;
  const titleNode = el(document, "div", { class: "axiosozo-lab-card-title", id: `${id}-title` });
  const closeButton = el(document, "button", { type: "button", class: "axiosozo-lab-card-close", "aria-label": "Close", title: "Close (Esc)" });
  const head = el(document, "div", { class: "axiosozo-lab-card-head" }, titleNode, closeButton);
  const bodyNode = el(document, "div", { class: "axiosozo-lab-card-body" });
  const footer = el(document, "div", { class: "axiosozo-lab-card-actions" });
  const node = el(document, "div", { class: "axiosozo-lab-card", id, role: "dialog", tabindex: "-1" }, head, bodyNode, footer);
  if (target.fixed) node.setAttribute("data-fixed", "true");
  node.style.width = `min(${Math.max(200, Math.round(width))}px, calc(100% - 16px))`;

  let open = true;
  let resolveClosed;
  const closed = new Promise(resolve => { resolveClosed = resolve; });
  const cleanups = [];

  const card = {
    node, body: bodyNode, closed,
    get isOpen() { return open; },
    setTitle(text) {
      titleNode.textContent = String(text ?? "");
      titleNode.hidden = !titleNode.textContent;
      if (titleNode.textContent) { node.setAttribute("aria-labelledby", titleNode.id); node.removeAttribute("aria-label"); }
      else { node.removeAttribute("aria-labelledby"); node.setAttribute("aria-label", String(label ?? "Lab")); }
    },
    /** Text (plain, wrapped) or nodes; ends the thinking state. */
    setBody(content) {
      node.removeAttribute("aria-busy");
      const items = content === null || content === undefined ? [] : Array.isArray(content) ? content : [content];
      bodyNode.replaceChildren(...items.filter(item => item !== null && item !== undefined && item !== false)
        .map(item => (typeof item === "object" ? item : el(document, "p", { class: "axiosozo-lab-card-text", text: item }))));
      card.reposition();
    },
    /** The thinking state; false ends it without new content. */
    setThinking(text = "Thinking…") {
      if (text === false) { node.removeAttribute("aria-busy"); bodyNode.querySelector?.(".axiosozo-lab-thinking")?.remove(); return; }
      node.setAttribute("aria-busy", "true");
      bodyNode.replaceChildren(thinking(document, text));
      card.reposition();
    },
    setActions(list = []) {
      footer.replaceChildren(...list.filter(Boolean).map(action => button(document, { ...action, onClick: event => {
        try { action.onClick?.(event, card); } catch (error) { console.error("AxioSozo Lab: card action failed", error); }
        if (action.closes) card.close("action");
      } })));
      footer.hidden = !footer.childNodes.length;
      card.reposition();
    },
    reposition() {
      if (!open) return;
      const host = target.size();
      const box = rectOf(node);
      const size = { width: box?.width || Math.min(width, host.width - 16), height: box?.height || 140 };
      const place = placeCard(target.rect(), host, size, { prefer, align: target.align ?? align });
      node.style.left = `${place.left}px`;
      node.style.top = `${place.top}px`;
      node.setAttribute("data-placement", place.placement);
    },
    close(reason = "closed") {
      if (!open) return;
      open = false;
      for (const cleanup of cleanups.splice(0).reverse()) { try { cleanup(); } catch {} }
      const hadFocus = node.contains?.(document.activeElement);
      node.remove();
      release();
      if (hadFocus) {
        try {
          if (previous?.isConnected && previous !== document.body) previous.focus();
          else target.browser?.focus();
        } catch {}
      }
      try { onClose?.(reason); } catch (error) { console.error("AxioSozo Lab: card onClose failed", error); }
      resolveClosed(reason);
    },
  };

  closeButton.addEventListener("click", () => card.close("dismissed"));
  node.addEventListener("keydown", event => {
    if (event.key !== "Escape" || event.defaultPrevented) return;
    event.preventDefault();
    event.stopPropagation();
    card.close("escape");
  });
  if (closeOnOutside) {
    const outside = event => { if (!node.contains(event.target) && !node.contains(event.originalTarget)) card.close("outside"); };
    window.addEventListener("mousedown", outside, true);
    cleanups.push(() => window.removeEventListener("mousedown", outside, true));
  }
  const onResize = () => card.reposition();
  window.addEventListener("resize", onResize);
  cleanups.push(() => window.removeEventListener("resize", onResize));
  if (signal) {
    const onAbort = () => card.close("aborted");
    signal.addEventListener("abort", onAbort, { once: true });
    cleanups.push(() => signal.removeEventListener("abort", onAbort));
  }
  // A card over a page ends when that page navigates away.
  if (target.browser && typeof window.gBrowser?.addTabsProgressListener === "function") {
    const listener = { onLocationChange(browser, webProgress) {
      if (browser === target.browser && webProgress?.isTopLevel !== false) card.close("navigated");
    } };
    window.gBrowser.addTabsProgressListener(listener);
    cleanups.push(() => window.gBrowser.removeTabsProgressListener(listener));
  }

  target.host.append(node);
  card.setTitle(title);
  if (body !== null && body !== undefined) card.setBody(body);
  card.setActions(actions);
  card.reposition();
  if (focus) {
    try { (footer.querySelector?.("button.primary") ?? closeButton).focus(); } catch {}
  }
  return card;
}
