import test from "node:test";
import assert from "node:assert/strict";
import { installContextTypeMenu } from "../chrome/ContextMenuContexts.sys.mjs";
import { ZenWorkspaceAdapter } from "../chrome/ZenWorkspaceAdapter.sys.mjs";
import { fakeZenWindow } from "./support/fake-zen.mjs";

// Minimal XUL-like DOM. Synthetic: not evidence of Zen's rendered menu.
class Element {
  constructor(tag) { this.tagName = tag; this.attributes = {}; this.children = []; this.parentNode = null; this.listeners = new Map(); }
  setAttribute(name, value) { this.attributes[name] = String(value); }
  getAttribute(name) { return this.attributes[name] ?? null; }
  removeAttribute(name) { delete this.attributes[name]; }
  get hidden() { return this.attributes.hidden === "true"; }
  appendChild(child) { child.remove(); child.parentNode = this; this.children.push(child); return child; }
  replaceChildren(...children) { for (const child of [...this.children]) child.remove(); children.forEach(child => this.appendChild(child)); }
  after(node) { node.remove(); const siblings = this.parentNode.children; siblings.splice(siblings.indexOf(this) + 1, 0, node); node.parentNode = this.parentNode; }
  remove() { if (!this.parentNode) return; const siblings = this.parentNode.children; siblings.splice(siblings.indexOf(this), 1); this.parentNode = null; }
  addEventListener(type, fn) { if (!this.listeners.has(type)) this.listeners.set(type, new Set()); this.listeners.get(type).add(fn); }
  removeEventListener(type, fn) { this.listeners.get(type)?.delete(fn); }
  closest() { return this.tagName === "toolbarbutton" ? this : null; }
  dispatch(type, init = {}) {
    const event = { type, target: this, isTrusted: true, ...init };
    const results = [];
    for (let node = this; node; node = node.parentNode) for (const fn of [...(node.listeners.get(type) ?? [])]) results.push(fn(event));
    return Promise.all(results);
  }
  find(predicate) { for (const child of this.children) { if (predicate(child)) return child; const inner = child.find(predicate); if (inner) return inner; } return null; }
  byLabel(label) { return this.find(child => child.getAttribute("label") === label); }
}

const HOME = "11111111-1111-4111-8111-111111111111";
const BV = "22222222-2222-4222-8222-222222222222";
const APP = "33333333-3333-4333-8333-333333333333";

function fixture({ isPrivate = false, contexts, failing = false } = {}) {
  const zen = fakeZenWindow({ isPrivate, active: HOME, spaces: [
    { uuid: HOME, name: "Home" }, { uuid: BV, name: "AxioSozo BV" }, { uuid: APP, name: "Shop app" }] });
  const document = { createXULElement: tag => new Element(tag), getElementById: id => zen.window.elements[id] ?? null };
  zen.window.document = document;
  const popup = new Element("menupopup");
  const edit = new Element("menuitem"); edit.setAttribute("id", "context_zenEditWorkspace");
  const anchor = new Element("menu"); anchor.setAttribute("id", "context_zenWorkspacesOpenInContainerTab");
  const separator = new Element("menuseparator");
  for (const child of [edit, anchor, separator]) popup.appendChild(child);
  zen.window.elements.zenWorkspaceMoreActions = popup;
  zen.window.elements.context_zenWorkspacesOpenInContainerTab = anchor;
  const calls = [];
  let state = contexts ?? [
    { uuid: HOME, name: "Home", type: "personal", organization_uuid: null, project_id: null },
    { uuid: BV, name: "AxioSozo BV", type: "organization", organization_uuid: null, project_id: null },
    { uuid: APP, name: "Shop app", type: "project", organization_uuid: BV, project_id: "p_shop1" }];
  const services = {
    listContexts: async () => { calls.push(["listContexts"]); if (failing) throw new Error("INVALID_STORE"); return state; },
    listProjects: async () => [{ id: "p_shop1", manifest: { name: "Shop" } }, { id: "p_docs1", manifest: { name: "Docs" } }],
    setContextType: async (...args) => { calls.push(["setContextType", ...args]); },
    linkOrganization: async (...args) => { calls.push(["linkOrganization", ...args]); },
    linkProject: async (...args) => { calls.push(["linkProject", ...args]); },
  };
  const adapter = new ZenWorkspaceAdapter(zen.window);
  const overview = [];
  const menu = installContextTypeMenu(zen.window, { services, adapter, openOverview: () => overview.push("open") });
  const icon = uuid => { const button = new Element("toolbarbutton"); button.setAttribute("zen-workspace-id", uuid); return button; };
  const show = uuid => popup.dispatch("popupshowing", { explicitOriginalTarget: uuid ? icon(uuid) : null });
  return { zen, popup, anchor, menu, calls, show, overview, setState: next => { state = next; } };
}

test("one native Context submenu sits after Zen's container menu and starts hidden", () => {
  const f = fixture();
  const index = f.popup.children.indexOf(f.anchor);
  assert.equal(f.popup.children[index + 1], f.menu.element);
  assert.equal(f.menu.element.getAttribute("label"), "Space type");
  assert.equal(f.menu.element.hidden, true);
  assert.deepEqual(f.menu.element.children[0].children.slice(0, 3).map(item => item.getAttribute("label")),
    ["Personal", "Organization", "Project"]);
});

test("shows the clicked workspace's type and sets a new type on a trusted command", async () => {
  const f = fixture();
  await f.show(BV);
  const menu = f.menu.element;
  assert.equal(menu.hidden, false);
  assert.equal(menu.byLabel("Organization").getAttribute("checked"), "true");
  assert.equal(menu.byLabel("Personal").getAttribute("checked"), null);
  assert.equal(menu.find(child => child.tagName === "menu" && child.getAttribute("label") === "Linked project").hidden, true, "links only for project contexts");
  await menu.byLabel("Project").dispatch("command", { isTrusted: false });
  assert.ok(!f.calls.some(call => call[0] === "setContextType"), "untrusted commands are ignored");
  await menu.byLabel("Project").dispatch("command");
  await Promise.resolve();
  assert.deepEqual(f.calls.filter(call => call[0] === "setContextType"), [["setContextType", BV, "project"]]);
});

test("project contexts link an organization and a project, or none", async () => {
  const f = fixture();
  await f.show(APP);
  const menu = f.menu.element;
  const orgMenu = menu.find(child => child.tagName === "menu" && child.getAttribute("label") === "Organization");
  assert.equal(orgMenu.hidden, false);
  const orgItems = orgMenu.children[0].children;
  assert.deepEqual(orgItems.map(item => [item.getAttribute("label"), item.getAttribute("checked")]),
    [["None", null], ["AxioSozo BV", "true"]]);
  const projectItems = menu.find(child => child.tagName === "menu" && child.getAttribute("label") === "Linked project").children[0].children;
  assert.deepEqual(projectItems.map(item => [item.getAttribute("label"), item.getAttribute("checked")]),
    [["None", null], ["Shop", "true"], ["Docs", null]]);
  await orgItems[0].dispatch("command");
  await projectItems[2].dispatch("command");
  await projectItems[0].dispatch("command");
  assert.deepEqual(f.calls.filter(call => call[0] !== "listContexts"),
    [["linkOrganization", APP, null], ["linkProject", APP, "p_docs1"], ["linkProject", APP, null]]);
});

test("falls back to the active workspace; submenu events are not mistaken for Zen's popup", async () => {
  const f = fixture();
  await f.show(null);
  assert.equal(f.menu.element.byLabel("Personal").getAttribute("checked"), "true");
  const before = f.calls.length;
  await f.menu.element.children[0].dispatch("popupshowing");
  assert.equal(f.calls.length, before);
  await f.menu.element.byLabel("Spaces in AxioSozo…").dispatch("command");
  assert.deepEqual(f.overview, ["open"]);
});

test("private windows and unreadable stores keep the menu hidden", async () => {
  const privateFixture = fixture({ isPrivate: true });
  await privateFixture.show(HOME);
  assert.equal(privateFixture.menu.element.hidden, true);
  assert.deepEqual(privateFixture.calls, []);
  const broken = fixture({ failing: true });
  const originalError = console.error; console.error = () => {};
  try { await broken.show(HOME); } finally { console.error = originalError; }
  assert.equal(broken.menu.element.hidden, true);
});

test("dispose removes the menu and its listeners", async () => {
  const f = fixture();
  f.menu.dispose();
  assert.equal(f.popup.children.includes(f.menu.element), false);
  await f.show(BV);
  assert.deepEqual(f.calls, []);
});
