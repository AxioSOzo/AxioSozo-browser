import test from 'node:test';
import assert from 'node:assert/strict';
import { ChromiumAXTree, ChromiumAccessibility, validateAXTreeUpdate, validateAXLocation, validateAXCommand,
  toCanvasRect, macRole, nativeRecord, AX_LIMITS } from '../chrome/ChromiumAccessibility.sys.mjs';

// Chrome-JS fixtures only: hand-written host events in the proposed cef-v1
// `ax_tree_update` / `ax_location` shape (docs/design/engine-accessibility.md §6).
// No Chromium, VoiceOver or native component runs here; this is not E1/E2 evidence.
const target = Object.freeze({ tab_id: 'tab-1', engine: 'chromium', engine_instance: 'cef-1', native_target_id: '7',
  identity: 'https://example.test', document_generation: 3, navigation_generation: 3, private_mode: false });
let seq = 0;
function update(nodes, { batch = 1, reset = false, final = true, root = 1, focus = 0, px = 1, events = [], truncated = false } = {}) {
  return { version: 1, event: 'ax_tree_update', target, seq: ++seq, batch, reset, final,
    root: final ? root : 0, focus: final ? focus : 0, px: final ? px : 1, events: final ? events : [], truncated: final ? truncated : false, nodes };
}
const node = (id, role, extra = {}) => ({ id, role, b: [0, 0, 10, 10], oc: id === 1 ? 0 : 1, kids: [], ...extra });
const page = () => [
  node(1, 'rootWebArea', { name: 'Fixture', b: [0, 0, 800, 600], kids: [2, 3, 4, 5], scroll: [0, 0] }),
  node(2, 'heading', { name: 'Welcome', level: 1, kids: [6] }),
  node(6, 'staticText', { name: 'Welcome' }),
  node(3, 'textField', { name: 'Email', value: 'me@example.test', states: ['editable', 'focusable'], sel: [2, 2], b: [10, 50, 300, 24] }),
  node(4, 'genericContainer', { states: ['ignored'], kids: [7, 8] }),
  node(7, 'link', { name: 'Docs', url: 'https://example.test/docs', states: ['focusable', 'linked'] }),
  node(8, 'button', { name: 'Go', actions: ['doDefault', 'focus'] }),
  node(5, 'textField', { name: 'Password', states: ['editable', 'focusable', 'protected'], input: 'password', redacted: true }),
];
const byId = (patch, id) => patch.nodes.find(record => record.id === id);

test('strict event schema: accepts host output, rejects anything else', () => {
  assert.doesNotThrow(() => validateAXTreeUpdate(update(page(), { reset: true })));
  const bad = [
    { ...update(page()), extra: 1 },
    update([{ ...node(1, 'rootWebArea'), onclick: 'x' }]),
    update([node(1, 'root WebArea')]),
    update([node(1, 'rootWebArea', { url: 'javascript:alert(1)' })]),
    update([node(1, 'rootWebArea', { states: ['pwned'] })]),
    update([node(1, 'rootWebArea', { b: [0, 0, -1, 4] })]),
    update([node(1, 'rootWebArea', { kids: [0] })]),
    update([node(1, 'rootWebArea', { name: 'x'.repeat(AX_LIMITS.piece + 1) })]),
    update([node(1, 'rootWebArea', { checked: '<b>' })]),
    update([node(1, 'rootWebArea')], { px: 0 }),
    update([node(1, 'rootWebArea')], { events: [{ type: 'click', id: 1 }] }),
    update([{ id: 1, append: 'title', text: 'x' }]),
  ];
  for (const event of bad) assert.throws(() => validateAXTreeUpdate(event), /INVALID_CEF_ACCESSIBILITY/u);
  assert.doesNotThrow(() => validateAXLocation({ version: 1, event: 'ax_location', target, seq: 9, nodes: [{ id: 3, b: [1, 2, 3, 4], oc: 1 }] }));
  assert.throws(() => validateAXLocation({ version: 1, event: 'ax_location', target, seq: 9, nodes: [{ id: 3, b: [1, 2, 3, 4], oc: 1, name: 'x' }] }));
});

test('batches are staged until final, then committed; reset replaces the model', () => {
  const tree = new ChromiumAXTree();
  const nodes = page();
  assert.equal(tree.applyTreeUpdate(update(nodes.slice(0, 4), { batch: 1, reset: true, final: false })), null);
  assert.equal(tree.size, 0);
  const patch = tree.applyTreeUpdate(update(nodes.slice(4), { batch: 1, reset: true, focus: 3 }));
  assert.equal(patch.reset, true);
  assert.equal(tree.size, 8);
  assert.equal(patch.root, 1);
  assert.deepEqual(patch.notifications, [{ type: 'focus', id: 3 }]);
  // Another reset batch replaces everything.
  const next = tree.applyTreeUpdate(update([node(1, 'rootWebArea', { name: 'Next' })], { batch: 2, reset: true }));
  assert.equal(tree.size, 1);
  assert.equal(next.nodes.length, 1);
  // An abandoned (never finished) batch is discarded when a new batch starts.
  tree.applyTreeUpdate(update([node(9, 'button', { name: 'Lost' })], { batch: 3, final: false }));
  tree.applyTreeUpdate(update([node(1, 'rootWebArea', { name: 'Next', kids: [9] })], { batch: 4 }));
  assert.equal(tree.node(9), null);
});

test('deletions and reparenting follow reachability from the root', () => {
  const tree = new ChromiumAXTree();
  tree.applyTreeUpdate(update(page(), { reset: true }));
  // Drop the heading (and its text) and move the link under a new group.
  const patch = tree.applyTreeUpdate(update([
    node(1, 'rootWebArea', { name: 'Fixture', b: [0, 0, 800, 600], kids: [9, 3, 4, 5] }),
    node(9, 'group', { name: 'Box', kids: [7] }),
    node(4, 'genericContainer', { states: ['ignored'], kids: [8] }),
  ], { batch: 2 }));
  assert.deepEqual(patch.removed.sort(), [2, 6]);
  assert.equal(tree.node(2), null);
  assert.equal(tree.parent(7), 9);
  assert.deepEqual(byId(patch, 9).kids, [7]);
  // The root's flattened children changed (the ignored container lost the link).
  assert.deepEqual(byId(patch, 1).kids, [9, 3, 8, 5]);
  assert.ok(patch.notifications.some(item => item.type === 'layout'));
});

test('ignored nodes are flattened into their exposed ancestor', () => {
  const tree = new ChromiumAXTree();
  const patch = tree.applyTreeUpdate(update(page(), { reset: true }));
  assert.deepEqual(tree.exposedChildren(1), [2, 3, 7, 8, 5]);
  assert.equal(byId(patch, 4).x, false);      // geometry-only record for the ignored container
  assert.equal(byId(patch, 4).role, undefined);
  assert.equal(byId(patch, 7).role, 'AXLink');
  assert.equal(byId(patch, 7).url, 'https://example.test/docs');
  assert.deepEqual(byId(patch, 8).actions.slice(0, 1), ['AXPress']);
  assert.equal(byId(patch, 2).role, 'AXHeading');
  assert.equal(byId(patch, 2).value, 1);
  assert.equal(byId(patch, 6).value, 'Welcome');  // static text reads as its value
});

test('bounds resolve like AXTree::RelativeToTreeBounds and map to canvas pixels at device scale', () => {
  const tree = new ChromiumAXTree();
  // Physical pixels (px = 2): list scrolled by 100 inside a root scrolled by 50.
  tree.applyTreeUpdate(update([
    node(1, 'rootWebArea', { b: [0, 0, 1600, 1200], kids: [2], scroll: [0, 50] }),
    node(2, 'list', { b: [100, 400, 600, 300], kids: [3], scroll: [0, 100] }),
    node(3, 'listItem', { b: [20, 120, 200, 40], oc: 2, name: 'Item' }),
  ], { reset: true, px: 2 }));
  assert.deepEqual(tree.resolveBounds(3), { x: 60, y: 185, w: 100, h: 20 });
  // A transform on the root (e.g. 1/dsf) applies after offsetting into it.
  const scaled = new ChromiumAXTree();
  scaled.applyTreeUpdate(update([
    node(1, 'rootWebArea', { b: [0, 0, 1600, 1200], kids: [2], tf: [0.5, 0, 0, 0.5, 0, 0] }),
    node(2, 'button', { b: [200, 100, 100, 40], name: 'Go' }),
  ], { reset: true, px: 1 }));
  assert.deepEqual(scaled.resolveBounds(2), { x: 100, y: 50, w: 50, h: 20 });
  // Device-pixel snapping at scale 2; the canvas CSS box size does not scale content.
  assert.deepEqual(toCanvasRect({ x: 10.3, y: 20.2, w: 33.3, h: 10 }, { logicalWidth: 800, logicalHeight: 600, scale: 2 }),
    { x: 10.5, y: 20, w: 33, h: 10, visible: true });
  assert.deepEqual(toCanvasRect(tree.resolveBounds(3), { logicalWidth: 800, logicalHeight: 600, scale: 2 }),
    { x: 60, y: 185, w: 100, h: 20, visible: true });
  assert.equal(toCanvasRect({ x: 10, y: 700, w: 5, h: 5 }, { logicalWidth: 800, logicalHeight: 600, scale: 2 }).visible, false);
  assert.equal(toCanvasRect(null, { logicalWidth: 800, logicalHeight: 600 }), null);
  // Location updates move one node without resending its record.
  const moved = tree.applyLocation({ version: 1, event: 'ax_location', target, seq: ++seq, nodes: [{ id: 3, b: [20, 220, 200, 40], oc: 2 }] });
  assert.equal(moved.nodes.length, 1);
  assert.equal(tree.resolveBounds(3).y, 235);
});

test('password fields never expose a value, selection or descendants, even if a host sent them', () => {
  const tree = new ChromiumAXTree();
  const patch = tree.applyTreeUpdate(update([
    node(1, 'rootWebArea', { kids: [5] }),
    // A misbehaving host: protected state but a value, selection and a text child.
    node(5, 'textField', { name: 'Password', value: 'hunter2', sel: [7, 7], states: ['editable', 'protected'], kids: [6] }),
    node(6, 'staticText', { name: 'hunter2' }),
  ], { reset: true }));
  const field = byId(patch, 5);
  assert.deepEqual([field.role, field.subrole], ['AXTextField', 'AXSecureTextField']);
  assert.equal(field.value, '');
  assert.equal(field.sel, null);
  assert.deepEqual(field.kids, []);
  assert.equal(tree.node(6), null);  // unreachable once the field's children are dropped
  assert.ok(!JSON.stringify(patch).includes('hunter2'));
  assert.deepEqual(macRole({ role: 'textField', input: 'password' }), ['AXTextField', 'AXSecureTextField']);
});

test('size caps: node count, children, continuation lengths', () => {
  const tree = new ChromiumAXTree({ maxNodes: 5 });
  const kids = [2, 3, 4, 5, 6, 7];
  const patch = tree.applyTreeUpdate(update([node(1, 'rootWebArea', { kids }), ...kids.map(id => node(id, 'button', { name: `b${id}` }))], { reset: true }));
  assert.equal(tree.size, 5);
  assert.equal(tree.truncated, true);
  assert.equal(byId(patch, 1).kids.length, 4);
  assert.throws(() => validateAXTreeUpdate(update([node(1, 'rootWebArea', { kids: Array.from({ length: AX_LIMITS.maxKids + 1 }, (_, i) => i + 2) })])));
  const big = new ChromiumAXTree();
  assert.throws(() => big.applyTreeUpdate(update([
    node(1, 'rootWebArea', { name: 'x'.repeat(4000) }),
    ...Array.from({ length: 4 }, () => ({ id: 1, append: 'name', text: 'y'.repeat(4000) })),
  ], { reset: true })), /INVALID_CEF_ACCESSIBILITY/u);
  assert.throws(() => big.applyTreeUpdate(update([{ id: 1, append: 'kids', kids: [2] }], { batch: 9 })));
});

test('continuation records join name text and children across chunks', () => {
  const tree = new ChromiumAXTree();
  tree.applyTreeUpdate(update([
    node(1, 'rootWebArea', { kids: [2] }),
    node(2, 'staticText', { name: 'Hello ' }),
  ], { batch: 1, reset: true, final: false }));
  tree.applyTreeUpdate(update([
    { id: 2, append: 'name', text: 'world' },
    { id: 1, append: 'kids', kids: [3] },
    node(3, 'button', { name: 'Third' }),
  ], { batch: 1, reset: true }));
  assert.equal(tree.node(2).name, 'Hello world');
  assert.deepEqual(tree.exposedChildren(1), [2, 3]);
});

test('notifications: focus, value, title, selection, live regions, load', () => {
  const tree = new ChromiumAXTree();
  tree.applyTreeUpdate(update([
    ...page(),
  ].map(record => record.id === 1 ? { ...record, kids: [2, 3, 4, 5, 10] } : record).concat([
    node(10, 'status', { live: 'polite', kids: [11] }), node(11, 'staticText', { name: 'Idle' }),
  ]), { reset: true, focus: 3 }));
  const patch = tree.applyTreeUpdate(update([
    node(3, 'textField', { name: 'E-mail', value: 'me@example.org', states: ['editable', 'focusable'], sel: [5, 5], b: [10, 50, 300, 24] }),
    node(11, 'staticText', { name: 'Saved' }),
  ], { batch: 2, focus: 8, events: [{ type: 'loadComplete', id: 1 }] }));
  const types = patch.notifications.map(item => item.type);
  for (const type of ['focus', 'value', 'title', 'announce', 'load']) assert.ok(types.includes(type), type);
  assert.equal(patch.notifications.find(item => item.type === 'focus').id, 8);
  assert.equal(patch.notifications.find(item => item.type === 'announce').text, 'Saved');
  // Selection changes are reported for the focused node only.
  const again = tree.applyTreeUpdate(update([node(8, 'button', { name: 'Go', actions: ['doDefault'], sel: [1, 1] })], { batch: 3, focus: 8 }));
  assert.ok(again.notifications.some(item => item.type === 'selectedText'));
});

test('native records map roles, values and settable attributes', () => {
  const field = nativeRecord({ id: 3, role: 'textField', b: [0, 0, 1, 1], oc: 1, kids: [], name: 'Email', value: 'a',
    states: ['editable', 'focusable', 'required'] }, [], true);
  assert.deepEqual([field.role, field.label, field.value, field.required], ['AXTextField', 'Email', 'a', true]);
  assert.deepEqual(field.settable, { focused: true, value: true });
  const slider = nativeRecord({ id: 4, role: 'slider', b: [0, 0, 1, 1], oc: 1, kids: [], range: [0, 10, 3, 1] }, [], true);
  assert.equal(slider.value, 3);
  assert.ok(slider.actions.includes('AXIncrement'));
  const box = nativeRecord({ id: 5, role: 'checkBox', b: [0, 0, 1, 1], oc: 1, kids: [], checked: 'mixed', name: 'All' }, [], true);
  assert.deepEqual([box.role, box.value, box.title], ['AXCheckBox', 2, 'All']);
  assert.deepEqual(macRole({ role: 'navigation' }), ['AXGroup', 'AXLandmarkNavigation']);
  assert.deepEqual(macRole({ role: 'textField', states: ['multiline'] }), ['AXTextArea', null]);
  assert.deepEqual(macRole({ role: 'somethingNew' }), ['AXGroup', null]);
});

test('accessibility commands are exact', () => {
  assert.doesNotThrow(() => validateAXCommand('accessibility', { enabled: true }));
  assert.doesNotThrow(() => validateAXCommand('ax_action', { node_id: 3, action: 'press' }));
  assert.doesNotThrow(() => validateAXCommand('ax_action', { node_id: 3, action: 'set_value', value: 'x' }));
  assert.doesNotThrow(() => validateAXCommand('ax_ack', { seq: 4 }));
  for (const [method, fields] of [['ax_action', { node_id: 3, action: 'press', value: 'x' }], ['ax_action', { node_id: 3, action: 'set_value' }],
      ['ax_action', { node_id: 0, action: 'press' }], ['ax_action', { node_id: 3, action: 'click' }], ['ax_ack', { seq: 0 }],
      ['accessibility', { enabled: 1 }], ['ax_action', { node_id: 3, action: 'set_value', value: 'x'.repeat(4097) }], ['devtools', {}]]) {
    assert.throws(() => validateAXCommand(method, fields), /INVALID_CEF_ACCESSIBILITY/u, `${method} ${JSON.stringify(fields)}`);
  }
});

function harness({ active = true } = {}) {
  const calls = [];
  const service = {
    platformClientActive: active, listener: null,
    attach(canvas, id) { calls.push(['attach', id]); }, detach(id) { calls.push(['detach', id]); },
    clear(id) { calls.push(['clear', id]); }, applyPatch(id, json) { calls.push(['patch', id, JSON.parse(json)]); },
  };
  const adapter = {
    accessibility(enabled) { calls.push(['accessibility', enabled]); return Promise.resolve({ status: 'success' }); },
    axAction(id, action, value) { calls.push(['action', id, action, value]); return Promise.resolve({ status: 'success' }); },
    axAck(eventTarget, sequence) { calls.push(['ack', sequence]); return Promise.resolve(); },
  };
  const attributes = new Map();
  const canvas = { setAttribute(name, value) { attributes.set(name, value); } };
  const observers = [];
  const observerService = { addObserver(o, topic) { observers.push([o, topic]); }, removeObserver() {} };
  const timers = { setTimeout: () => 1, clearTimeout() {} };
  const controller = new ChromiumAccessibility({ service, observerService, timers });
  let focused = 0;
  controller.attach({ targetId: 7, canvas, adapter, focusContent: () => { focused++; } });
  return { controller, service, adapter, calls, attributes, observers, focused: () => focused };
}

test('controller: enabled only for an active assistive client that asked for the canvas', () => {
  const idle = harness({ active: false });
  idle.service.listener.onAccessibilityRequested(7);
  assert.ok(!idle.calls.some(call => call[0] === 'accessibility'));
  const h = harness();
  assert.equal(h.attributes.get('role'), 'group');
  h.service.listener.onAccessibilityRequested(7);
  h.service.listener.onAccessibilityRequested(7);  // once
  assert.deepEqual(h.calls.filter(call => call[0] === 'accessibility'), [['accessibility', true]]);
  assert.equal(h.controller.handleEvent(7, update(page(), { reset: true, focus: 3 })), true);
  const patch = h.calls.find(call => call[0] === 'patch')[2];
  assert.equal(patch.reset, true);
  assert.ok(patch.nodes.length >= 7);
  assert.ok(h.calls.some(call => call[0] === 'ack' && call[1] === seq));
  assert.equal(h.controller.handleEvent(7, { event: 'title' }), false);
  // Hidden tab: tree dropped natively and in the host.
  h.controller.setVisible(7, false);
  assert.ok(h.calls.some(call => call[0] === 'clear' && call[1] === 7));
  assert.deepEqual(h.calls.filter(call => call[0] === 'accessibility').at(-1), ['accessibility', false]);
  // Late chunks are still acknowledged so host credit never leaks.
  h.controller.handleEvent(7, update(page(), { batch: 5 }));
  assert.equal(h.calls.filter(call => call[0] === 'ack').length, 2);
  // a11y service shutdown disables everything.
  h.controller.setVisible(7, true);
  h.service.listener.onAccessibilityRequested(7);
  h.observers[0][0].observe(null, 'a11y-init-or-shutdown', '0');
  assert.deepEqual(h.calls.filter(call => call[0] === 'accessibility').at(-1), ['accessibility', false]);
});

test('controller: assistive actions are validated and focus the canvas first', () => {
  const h = harness();
  h.service.listener.onAccessibilityRequested(7);
  h.service.listener.onAction(7, 3, 'set_value', 'hello');
  h.service.listener.onAction(7, 8, 'press', '');
  h.service.listener.onAction(7, 8, 'scroll_to', '');
  h.service.listener.onAction(7, 8, 'launch_missiles', '');
  h.service.listener.onAction(7, 0, 'press', '');
  h.service.listener.onAction(8, 3, 'press', '');
  assert.deepEqual(h.calls.filter(call => call[0] === 'action'), [
    ['action', 3, 'set_value', 'hello'], ['action', 8, 'press', undefined], ['action', 8, 'scroll_to', undefined]]);
  assert.equal(h.focused(), 2);
  h.controller.dispose();
  assert.equal(h.service.listener, null);
});

test('shared controller without the native component stays inert', async () => {
  const { sharedChromiumAccessibility } = await import('../chrome/ChromiumAccessibility.sys.mjs');
  const controller = sharedChromiumAccessibility();
  assert.equal(controller.available, false);
  assert.equal(controller.platformActive, false);
  assert.equal(controller.attach({ targetId: 1, canvas: { setAttribute() { throw new Error('touched'); } }, adapter: {} }), false);
  assert.equal(controller.handleEvent(1, { event: 'ax_location', target, seq: 1, nodes: [] }), true);
});
