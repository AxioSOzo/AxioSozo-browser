/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. https://mozilla.org/MPL/2.0/ */

// A deliberately small DOM for running the about:axiosozo page script under
// Node: elements, text, attributes, dataset, events, <dialog>, <details> and a
// selector subset (tag, #id, .class, [attr], [attr="v"], :not(simple),
// descendant combinator, comma lists). Built from the page's HTML by a tiny
// tag parser (the page has no inline script or style). Test-only; not
// evidence of how Gecko renders the page.

const VOID = new Set(["meta", "link", "img", "input", "br", "hr", "source"]);

export class Node {
  constructor(document) { this.ownerDocument = document; this.parentNode = null; this.childNodes = []; }
  get children() { return this.childNodes.filter(n => n instanceof Element); }
  get firstChild() { return this.childNodes[0] ?? null; }
  get textContent() { return this.childNodes.map(n => n.textContent).join(""); }
  set textContent(value) { for (const n of [...this.childNodes]) n.remove(); if (value !== "") this.append(String(value)); }
  #adopt(node) {
    // Like the DOM: anything that is not a Node becomes text ("null" included).
    if (!(node instanceof Node)) node = this.ownerDocument.createTextNode(String(node));
    node.remove();
    node.parentNode = this;
    return node;
  }
  append(...nodes) { for (const n of nodes) this.childNodes.push(this.#adopt(n)); }
  appendChild(node) { this.append(node); return node; }
  prepend(...nodes) { this.childNodes.unshift(...nodes.map(n => this.#adopt(n))); }
  replaceChildren(...nodes) { for (const n of [...this.childNodes]) n.remove(); this.append(...nodes); }
  remove() {
    if (!this.parentNode) return;
    const siblings = this.parentNode.childNodes;
    siblings.splice(siblings.indexOf(this), 1);
    this.parentNode = null;
  }
  contains(node) { for (let n = node; n; n = n.parentNode) if (n === this) return true; return false; }
  querySelectorAll(selector) {
    const out = [];
    const walk = node => { for (const c of node.children) { if (matches(c, selector)) out.push(c); walk(c); } };
    walk(this);
    return out;
  }
  querySelector(selector) { return this.querySelectorAll(selector)[0] ?? null; }
}

class Text extends Node {
  constructor(document, text) { super(document); this.data = text; }
  get textContent() { return this.data; }
  set textContent(value) { this.data = String(value); }
}

const BOOLEAN_PROPS = ["checked", "disabled", "hidden", "selected", "required", "readOnly", "open"];

export class Element extends Node {
  constructor(document, tag, ns = null) {
    super(document);
    this.localName = tag.toLowerCase(); this.namespaceURI = ns; this.attributes = new Map();
    this.listeners = new Map(); this.style = {}; this._value = ""; this._checked = false;
    this.dataset = new Proxy({}, {
      get: (_, key) => this.getAttribute(`data-${String(key).replace(/[A-Z]/g, c => `-${c.toLowerCase()}`)}`) ?? undefined,
      set: (_, key, value) => { this.setAttribute(`data-${String(key).replace(/[A-Z]/g, c => `-${c.toLowerCase()}`)}`, value); return true; },
    });
    this.classList = {
      contains: c => this.className.split(/\s+/).includes(c),
      add: c => { if (!this.classList.contains(c)) this.className = `${this.className} ${c}`.trim(); },
      remove: c => { this.className = this.className.split(/\s+/).filter(x => x && x !== c).join(" "); },
    };
  }
  get tagName() { return this.localName.toUpperCase(); }
  get id() { return this.getAttribute("id") ?? ""; }
  set id(value) { this.setAttribute("id", value); }
  get className() { return this.getAttribute("class") ?? ""; }
  set className(value) { this.setAttribute("class", value); }
  getAttribute(name) { return this.attributes.has(name) ? this.attributes.get(name) : null; }
  setAttribute(name, value) { this.attributes.set(name, String(value)); if (name === "value") this._value = String(value); }
  hasAttribute(name) { return this.attributes.has(name); }
  removeAttribute(name) { this.attributes.delete(name); }
  toggleAttribute(name, force) { const on = force ?? !this.attributes.has(name); if (on) this.attributes.set(name, ""); else this.attributes.delete(name); return on; }
  get value() {
    if (this.localName === "select") return this.selectedOptions[0]?.value ?? "";
    if (this.localName === "option") return this.getAttribute("value") ?? this.textContent;
    return this._value;
  }
  set value(v) {
    if (this.localName === "select") { for (const o of this.querySelectorAll("option")) o.selected = o.value === String(v); return; }
    if (this.localName === "option") { this.attributes.set("value", String(v)); return; }
    this._value = String(v);
  }
  get selectedOptions() {
    const options = this.querySelectorAll("option");
    const chosen = options.filter(o => o.selected);
    return chosen.length ? [chosen.at(-1)] : options.slice(0, 1);
  }
  get checked() { return this._checked; }
  set checked(v) { this._checked = !!v; }
  focus() { this.ownerDocument.activeElement = this; }
  blur() { if (this.ownerDocument.activeElement === this) this.ownerDocument.activeElement = null; }
  scrollIntoView() {}
  get offsetWidth() { return 0; }
  closest(selector) { for (let n = this; n instanceof Element; n = n.parentNode) if (matches(n, selector)) return n; return null; }
  matches(selector) { return matches(this, selector); }
  addEventListener(type, fn) { if (!this.listeners.has(type)) this.listeners.set(type, new Set()); this.listeners.get(type).add(fn); }
  removeEventListener(type, fn) { this.listeners.get(type)?.delete(fn); }
  dispatchEvent(event) {
    event.target ??= this;
    for (let n = this; n; n = n.parentNode) {
      event.currentTarget = n;
      for (const fn of [...(n.listeners?.get(event.type) ?? [])]) fn(event);
      if (event.cancelBubble) break;
    }
    return !event.defaultPrevented;
  }
  click() {
    if (this.disabled) return;
    if (this.localName === "input" && (this.type === "checkbox" || this.type === "radio")) {
      this.checked = this.type === "radio" ? true : !this.checked;
      this.dispatchEvent(makeEvent("change"));
    }
    this.dispatchEvent(makeEvent("click"));
    if (this.localName === "summary" && this.parentNode?.localName === "details") this.parentNode.open = !this.parentNode.open;
  }
  // <dialog>
  showModal() { this.open = true; }
  close() { this.open = false; }
  get type() { return this.getAttribute("type") ?? (this.localName === "button" ? "submit" : "text"); }
  set type(v) { this.setAttribute("type", v); }
}
for (const prop of BOOLEAN_PROPS) {
  if (prop === "checked") continue;
  Object.defineProperty(Element.prototype, prop, {
    get() { return this.hasAttribute(prop.toLowerCase()); },
    set(v) { this.toggleAttribute(prop.toLowerCase(), !!v); },
  });
}

export function makeEvent(type, init = {}) {
  return { type, bubbles: true, defaultPrevented: false, cancelBubble: false, isTrusted: true,
    preventDefault() { this.defaultPrevented = true; }, stopPropagation() { this.cancelBubble = true; }, ...init };
}

// ---- selectors ---------------------------------------------------------------------
function parseCompound(text) {
  const parts = { tag: null, ids: [], classes: [], attrs: [], nots: [], pseudo: [] };
  const re = /^([a-zA-Z][\w-]*|\*)|#([\w-]+)|\.([\w-]+)|\[([\w-]+)(?:([~^$*]?=)"?([^"\]]*)"?)?\]|:not\(([^)]*)\)|:([\w-]+)/g;
  let m; let consumed = 0;
  while ((m = re.exec(text))) {
    if (m.index !== consumed) break;
    consumed = re.lastIndex;
    if (m[1]) parts.tag = m[1] === "*" ? null : m[1].toLowerCase();
    else if (m[2]) parts.ids.push(m[2]);
    else if (m[3]) parts.classes.push(m[3]);
    else if (m[4]) parts.attrs.push({ name: m[4], op: m[5] ?? null, value: m[6] ?? null });
    else if (m[7] !== undefined) parts.nots.push(parseCompound(m[7].trim()));
    else if (m[8]) parts.pseudo.push(m[8]);
  }
  if (consumed !== text.length) throw new Error(`mini-dom: unsupported selector "${text}"`);
  return parts;
}
function matchCompound(el, parts) {
  if (!(el instanceof Element)) return false;
  if (parts.tag && el.localName !== parts.tag) return false;
  if (parts.ids.some(id => el.id !== id)) return false;
  if (parts.classes.some(c => !el.classList.contains(c))) return false;
  for (const { name, op, value } of parts.attrs) {
    const actual = name === "type" && el.localName === "input" ? el.type : el.getAttribute(name);
    if (actual === null) return false;
    if (op === "=" && actual !== value) return false;
  }
  if (parts.nots.some(p => matchCompound(el, p))) return false;
  for (const pseudo of parts.pseudo) {
    if (pseudo === "checked" && !el.checked) return false;
    if (pseudo === "last-of-type") {
      const same = el.parentNode?.children.filter(c => c.localName === el.localName) ?? [];
      if (same.at(-1) !== el) return false;
    }
  }
  return true;
}
function matches(el, selector) {
  return selector.split(",").some(one => {
    const chain = one.trim().split(/\s+/).map(parseCompound);
    if (!matchCompound(el, chain.at(-1))) return false;
    let node = el.parentNode;
    for (let i = chain.length - 2; i >= 0; i--) {
      // Like the DOM, ancestors outside the queried subtree count too.
      while (node && !matchCompound(node, chain[i])) node = node.parentNode;
      if (!node) return false;
      node = node.parentNode;
    }
    return true;
  });
}

// ---- document ------------------------------------------------------------------------
export class Document extends Node {
  constructor() {
    super(null);
    this.ownerDocument = this;
    this.activeElement = null;
    this.listeners = new Map();
    this.documentElement = new Element(this, "html");
    this.appendChild(this.documentElement);
  }
  get body() { return this.querySelector("body"); }
  createElement(tag) { return new Element(this, tag); }
  createElementNS(ns, tag) { return new Element(this, tag, ns); }
  createTextNode(text) { return new Text(this, String(text)); }
  getElementById(id) { return this.querySelector(`#${id}`); }
  addEventListener(type, fn) { if (!this.listeners.has(type)) this.listeners.set(type, new Set()); this.listeners.get(type).add(fn); }
  removeEventListener(type, fn) { this.listeners.get(type)?.delete(fn); }
}
// Events that bubble past <html> reach document listeners.
const baseDispatch = Element.prototype.dispatchEvent;
Element.prototype.dispatchEvent = function dispatchEvent(event) {
  const result = baseDispatch.call(this, event);
  if (!event.cancelBubble) for (const fn of [...(this.ownerDocument.listeners.get(event.type) ?? [])]) fn(event);
  return result;
};

/** Builds a Document from simple, well-formed HTML (no scripts or styles inside). */
export function parseHtml(html) {
  const document = new Document();
  const body = html.replace(/<!--[\s\S]*?-->/g, "").replace(/<!DOCTYPE[^>]*>/i, "");
  let current = document.documentElement;
  const tagRe = /<\/?([a-zA-Z][\w-]*)([^>]*)>|([^<]+)/g;
  let m;
  while ((m = tagRe.exec(body))) {
    if (m[3] !== undefined) {
      const text = m[3].replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">");
      if (text.trim()) current.append(text);
      continue;
    }
    const tag = m[1].toLowerCase();
    if (m[0].startsWith("</")) { if (tag !== "html") current = current.parentNode ?? current; continue; }
    if (tag === "html") continue;
    const el = document.createElement(tag);
    for (const a of m[2].matchAll(/([\w-:]+)(?:="([^"]*)")?/g)) el.setAttribute(a[1], (a[2] ?? "").replace(/&amp;/g, "&"));
    if (el.hasAttribute("selected")) el.selected = true;
    current.append(el);
    if (!VOID.has(tag) && !m[0].endsWith("/>")) current = el;
  }
  return document;
}
