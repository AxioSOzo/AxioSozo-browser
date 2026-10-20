import test from 'node:test';
import assert from 'node:assert/strict';
import { ChromiumAccessibility, LinuxAccessibilityMirror } from '../chrome/ChromiumAccessibility.sys.mjs';

// The Linux mirror of a Chromium tab's accessibility tree, on a minimal fake DOM.
// Chrome-JS only: no Gecko, AT-SPI or Chromium runs here (the GUI gate is
// scripts/cef_zen_e2e.py --a11y on the real app).
class FakeElement {
  constructor(doc, name) {
    this.ownerDocument = doc; this.localName = name; this.attributes = new Map(); this.children = [];
    this.parentNode = null; this.dataset = {}; this.style = {}; this.listeners = []; this.ownText = '';
  }
  get id() { return this.attributes.get('id') ?? ''; }
  set id(value) { this.attributes.set('id', value); }
  setAttribute(name, value) { this.attributes.set(name, String(value)); }
  getAttribute(name) { return this.attributes.get(name) ?? null; }
  removeAttribute(name) { this.attributes.delete(name); }
  hasAttribute(name) { return this.attributes.has(name); }
  get textContent() { return this.ownText + this.children.map(child => child.textContent).join(''); }
  set textContent(value) { this.children.forEach(child => { child.parentNode = null; }); this.children = []; this.ownText = String(value); }
  #adopt(node) { node.parentNode?.children.splice(node.parentNode.children.indexOf(node), 1); node.parentNode = this; return node; }
  appendChild(node) { this.children.push(this.#adopt(node)); return node; }
  prepend(node) { this.children.unshift(this.#adopt(node)); }
  insertBefore(node, before) {
    this.#adopt(node);
    const index = before ? this.children.indexOf(before) : -1;
    if (index < 0) this.children.push(node); else this.children.splice(index, 0, node);
  }
  replaceChildren(...nodes) { this.children.forEach(child => { child.parentNode = null; }); this.children = []; nodes.forEach(node => this.appendChild(node)); }
  remove() { if (this.parentNode) { this.parentNode.children.splice(this.parentNode.children.indexOf(this), 1); this.parentNode = null; } }
  querySelector(selector) {
    assert.equal(selector, ':scope > [data-ax-text]');
    return this.children.find(child => 'axText' in child.dataset) ?? null;
  }
  closest(selector) {
    assert.equal(selector, '[data-ax-id]');
    for (let node = this; node; node = node.parentNode) if ('axId' in node.dataset) return node;
    return null;
  }
  addEventListener(type, listener, capture) { this.listeners.push([type, listener, capture]); }
  dispatch(type, target = this) {
    const event = { type, target, stopped: false, prevented: false, stopPropagation() { this.stopped = true; }, preventDefault() { this.prevented = true; } };
    for (const [kind, listener] of this.listeners) if (kind === type) listener(event);
    return event;
  }
  find(predicate) {
    if (predicate(this)) return this;
    for (const child of this.children) { const found = child.find(predicate); if (found) return found; }
    return null;
  }
}
function setup({ active = true } = {}) {
  const doc = { createElementNS: (_ns, name) => new FakeElement(doc, name) };
  const overlay = new FakeElement(doc, 'div');
  const canvas = overlay.appendChild(new FakeElement(doc, 'canvas'));
  const mirror = new LinuxAccessibilityMirror({ active: () => active });
  const calls = [];
  const adapter = {
    accessibility(enabled) { calls.push(['accessibility', enabled]); return Promise.resolve({ status: 'success' }); },
    axAction(id, action, value) { calls.push(['action', id, action, value]); return Promise.resolve({ status: 'success' }); },
    axAck(eventTarget, sequence) { calls.push(['ack', sequence]); return Promise.resolve(); },
  };
  const observers = [];
  const controller = new ChromiumAccessibility({ service: mirror, timers: { setTimeout: () => 1, clearTimeout() {} },
    observerService: { addObserver(o, topic) { observers.push([o, topic]); }, removeObserver() {} } });
  controller.attach({ targetId: 7, canvas, adapter, focusContent() { calls.push(['focus']); } });
  return { doc, overlay, canvas, mirror, controller, calls, observers };
}
const target = Object.freeze({ tab_id: 'tab-1', engine: 'chromium', engine_instance: 'cef-1', native_target_id: '7',
  identity: 'http://127.0.0.1:1', document_generation: 1, navigation_generation: 1, private_mode: false });
let seq = 0;
const update = (nodes, { reset = false, root = 1, focus = 0, batch = ++seq } = {}) => ({ version: 1, event: 'ax_tree_update', target,
  seq: ++seq, batch, reset, final: true, root, focus, px: 1, events: [], truncated: false, nodes });
const node = (id, role, extra = {}) => ({ id, role, b: [0, 0, 10, 10], oc: id === 1 ? 0 : 1, kids: [], ...extra });
const page = () => [
  node(1, 'rootWebArea', { name: 'AxioSozo feel', kids: [2, 3, 4, 5, 9] }),
  node(2, 'textField', { name: 'Type here', value: 'zen', states: ['editable', 'focusable'], kids: [8] }),
  node(8, 'genericContainer', { kids: [] }),
  node(3, 'button', { name: 'Increment', actions: ['doDefault'] }),
  node(4, 'genericContainer', { states: ['ignored'], kids: [6] }),
  node(6, 'link', { name: 'Page 2', states: ['focusable', 'linked'], kids: [7] }),
  node(7, 'staticText', { name: 'Page 2' }),
  node(5, 'textField', { name: 'Password', states: ['editable', 'protected'], input: 'password', redacted: true }),
  node(9, 'heading', { name: 'Title', level: 2 }),
];

test('Linux mirror: requested on attach while AT-SPI is active, a sibling owned by the canvas', () => {
  const idle = setup({ active: false });
  assert.ok(!idle.calls.some(call => call[0] === 'accessibility'), 'no assistive client, no tree');
  const h = setup();
  assert.deepEqual(h.calls.filter(call => call[0] === 'accessibility'), [['accessibility', true]]);
  const root = h.overlay.children[1];
  assert.equal(root.getAttribute('data-axiosozo-cef-a11y'), 'mirror');
  assert.equal(h.canvas.getAttribute('aria-owns'), root.id);
  assert.match(root.style.cssText, /opacity:0;pointer-events:none/u);
  assert.equal(h.canvas.getAttribute('role'), 'group');
});

test('Linux mirror: Chromium roles, names, values and focus become ARIA in chrome DOM', () => {
  const h = setup();
  h.controller.handleEvent(7, update(page(), { reset: true, focus: 2 }));
  const root = h.overlay.children[1];
  const doc = root.find(el => el.getAttribute('role') === 'document');
  assert.ok(doc, 'web area');
  const byRole = role => root.find(el => el.getAttribute('role') === role);
  assert.equal(byRole('button').getAttribute('aria-label'), 'Increment');
  assert.equal(byRole('link').getAttribute('aria-label'), 'Page 2');
  assert.equal(byRole('link').textContent, 'Page 2', 'static text child kept, ignored container flattened');
  assert.equal(byRole('heading').getAttribute('aria-level'), '2');
  const fields = [];
  root.find(el => { if (el.getAttribute('role') === 'textbox') fields.push(el); return false; });
  assert.equal(fields[0].textContent, 'zen');
  assert.equal(fields[0].children.length, 1, 'inner editor not mirrored');
  assert.equal(fields[1].textContent, '', 'password value never mirrored');
  assert.equal(fields[1].getAttribute('data-ax-protected'), 'true');
  assert.equal(h.canvas.getAttribute('aria-activedescendant'), fields[0].id);
  // Value and focus updates.
  h.controller.handleEvent(7, update([node(2, 'textField', { name: 'Type here', value: 'zen feel', states: ['editable', 'focusable'], kids: [8] })], { focus: 3 }));
  assert.equal(fields[0].textContent, 'zen feel');
  assert.equal(h.canvas.getAttribute('aria-activedescendant'), byRole('button').id);
  // Removal.
  h.controller.handleEvent(7, update([node(1, 'rootWebArea', { name: 'AxioSozo feel', kids: [2, 3, 5, 9] })]));
  assert.equal(byRole('link'), null);
});

test('Linux mirror: assistive clicks become press actions and never reach the page', () => {
  const h = setup();
  h.controller.handleEvent(7, update(page(), { reset: true }));
  const root = h.overlay.children[1];
  const button = root.find(el => el.getAttribute('role') === 'button');
  const click = root.dispatch('click', button);
  assert.ok(click.stopped && click.prevented);
  assert.ok(root.dispatch('mousedown', button).stopped);
  assert.deepEqual(h.calls.filter(call => call[0] === 'action'), [['action', 3, 'press', undefined]]);
  assert.ok(h.calls.some(call => call[0] === 'focus'), 'Zen focus on the canvas first');
});

test('Linux mirror: a hidden tab keeps its tree (Chromium does not resend it after off/on); detach removes it', () => {
  const h = setup();
  h.controller.handleEvent(7, update(page(), { reset: true }));
  const root = h.overlay.children[1];
  const before = h.calls.filter(call => call[0] === 'accessibility').length;
  h.controller.setVisible(7, false);
  assert.ok(root.find(el => el.getAttribute('role') === 'button'), 'the mirror stays while the tab is hidden');
  h.controller.setVisible(7, true);
  assert.equal(h.calls.filter(call => call[0] === 'accessibility').length, before, 'Chromium accessibility is never toggled');
  assert.ok(root.find(el => el.getAttribute('role') === 'button'));
  h.controller.detach(7);
  assert.equal(h.overlay.children.length, 1);
  assert.equal(h.canvas.getAttribute('aria-owns'), null);
});
