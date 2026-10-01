/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/**
 * Accessibility for Chromium tabs (docs/design/engine-accessibility.md).
 *
 * The native host streams Chromium's accessibility tree as `ax_tree_update` /
 * `ax_location` events (flat wire ids, passwords already redacted, chunked under
 * the 8 KiB event bound). This module
 *
 *   - validates those events strictly (they come from a process that renders
 *     untrusted pages),
 *   - keeps the per-tab tree model: staged batches, continuation records,
 *     reachability collection, ignored-node flattening, password redaction again,
 *     size caps,
 *   - turns each committed batch into a native patch for the engine-view a11y
 *     component (apps/browser/native/engine-view/a11y), which exposes it to
 *     VoiceOver as NSAccessibility elements under the tab's canvas, and
 *   - enables a tab's tree only while a macOS assistive client is active and has
 *     actually asked for that canvas, and relays assistive actions back.
 *
 * Nothing here reads page pixels, page text outside the accessibility tree, or
 * any profile data. Password values never reach this module.
 */

export const AX_SERVICE_CONTRACT = "@axiosozo.nl/engine-accessibility;1";

export const AX_LIMITS = Object.freeze({
  maxNodes: 25000, maxRecordsPerEvent: 4096, maxKids: 20000, maxEvents: 32,
  name: 16384, value: 8192, piece: 4096, desc: 1024, placeholder: 512, url: 2048, short: 256, token: 32,
  maxId: 0xffffffff, maxCoordinate: 1e7, setValue: 4096,
});

export const AX_ACTIONS = Object.freeze(["press", "focus", "scroll_to", "set_value", "show_menu", "increment", "decrement"]);

const STATES = new Set(["autofillAvailable", "collapsed", "default", "editable", "expanded", "focusable", "horizontal",
  "hovered", "ignored", "invisible", "linked", "multiline", "multiselectable", "protected", "required", "richlyEditable",
  "vertical", "visited"]);
const NATIVE_ACTIONS = new Set(["doDefault", "focus", "blur", "increment", "decrement", "scrollToMakeVisible", "setValue",
  "showContextMenu", "expand", "collapse"]);
const EVENT_TYPES = new Set(["focus", "blur", "alert", "liveRegionChanged", "loadComplete", "valueChanged",
  "textSelectionChanged", "documentSelectionChanged", "menuStart", "menuEnd", "menuPopupStart", "menuPopupEnd",
  "expandedChanged", "checkedStateChanged", "selectedChildrenChanged", "scrolledToAnchor", "activeDescendantChanged"]);
const TOKEN = /^[A-Za-z0-9_ -]{1,32}$/u;
const ROLE = /^[A-Za-z]{1,40}$/u;

const TEXT_FIELDS = { name: "piece", value: "piece", desc: "desc", placeholder: "placeholder", url: "url",
  roledesc: "short", shortcuts: "short" };
const TOKEN_FIELDS = ["lang", "checked", "invalid", "restriction", "live", "relevant", "current", "input", "action", "tag"];
const INT_FIELDS = ["level", "popup", "setsize", "posinset"];
const BOOL_FIELDS = ["atomic", "busy", "selected", "modal", "redacted"];
const REF_FIELDS = ["activedesc", "linktarget"];
const RECORD_KEYS = new Set(["id", "role", "states", "actions", "b", "oc", "scroll", "tf", "kids", "sel", "range", "table",
  ...Object.keys(TEXT_FIELDS), ...TOKEN_FIELDS, ...INT_FIELDS, ...BOOL_FIELDS, ...REF_FIELDS]);
const TREE_KEYS = ["version", "event", "target", "seq", "batch", "reset", "final", "root", "focus", "px", "events", "truncated", "nodes"];
const LOCATION_KEYS = ["version", "event", "target", "seq", "nodes"];

const fail = () => { throw new Error("INVALID_CEF_ACCESSIBILITY"); };
const isObject = value => value !== null && typeof value === "object" && !Array.isArray(value);
const exactKeys = (value, keys) => isObject(value) && Object.keys(value).length === keys.length && keys.every(key => Object.hasOwn(value, key));
const wireId = value => Number.isInteger(value) && value > 0 && value <= AX_LIMITS.maxId;
const optionalId = value => Number.isInteger(value) && value >= 0 && value <= AX_LIMITS.maxId;
const uint = value => Number.isSafeInteger(value) && value >= 0;
const finite = value => typeof value === "number" && Number.isFinite(value) && Math.abs(value) <= AX_LIMITS.maxCoordinate;
const numbers = (value, length) => Array.isArray(value) && value.length === length && value.every(finite);
const ids = (value, maximum) => Array.isArray(value) && value.length <= maximum && value.every(wireId);
const text = (value, limit) => typeof value === "string" && value.length <= AX_LIMITS[limit];

function validateGeometry(record) {
  if (!numbers(record.b, 4) || record.b[2] < 0 || record.b[3] < 0) fail();
  if (!optionalId(record.oc)) fail();
  if (record.tf !== undefined && !numbers(record.tf, 6)) fail();
}

function validateRecord(record) {
  if (!isObject(record) || !wireId(record.id)) fail();
  if (Object.hasOwn(record, "append")) {
    // Continuation of the record just sent in this batch: more name/value text or kids.
    if (record.append === "kids") { if (!exactKeys(record, ["id", "append", "kids"]) || !ids(record.kids, AX_LIMITS.maxKids)) fail(); }
    else if (["name", "value"].includes(record.append)) { if (!exactKeys(record, ["id", "append", "text"]) || !text(record.text, "piece")) fail(); }
    else fail();
    return;
  }
  for (const key of Object.keys(record)) if (!RECORD_KEYS.has(key)) fail();
  if (typeof record.role !== "string" || !ROLE.test(record.role)) fail();
  validateGeometry(record);
  if (!ids(record.kids, AX_LIMITS.maxKids)) fail();
  if (record.states !== undefined && (!Array.isArray(record.states) || record.states.length > STATES.size
      || !record.states.every(state => STATES.has(state)))) fail();
  if (record.actions !== undefined && (!Array.isArray(record.actions) || record.actions.length > 16
      || !record.actions.every(action => NATIVE_ACTIONS.has(action)))) fail();
  if (record.scroll !== undefined && !numbers(record.scroll, 2)) fail();
  for (const [key, limit] of Object.entries(TEXT_FIELDS)) if (record[key] !== undefined && !text(record[key], limit)) fail();
  if (record.url !== undefined && !/^https?:\/\//u.test(record.url)) fail();
  for (const key of TOKEN_FIELDS) if (record[key] !== undefined && (typeof record[key] !== "string" || !TOKEN.test(record[key]))) fail();
  for (const key of INT_FIELDS) if (record[key] !== undefined && !(Number.isInteger(record[key]) && record[key] >= 0 && record[key] <= 1e9)) fail();
  for (const key of BOOL_FIELDS) if (record[key] !== undefined && typeof record[key] !== "boolean") fail();
  for (const key of REF_FIELDS) if (record[key] !== undefined && !wireId(record[key])) fail();
  if (record.sel !== undefined && !(Array.isArray(record.sel) && record.sel.length === 2 && record.sel.every(n => Number.isInteger(n) && n >= 0 && n <= 1e9))) fail();
  if (record.range !== undefined && !(Array.isArray(record.range) && record.range.length === 4 && record.range.every(n => n === null || finite(n)))) fail();
  if (record.table !== undefined && !(Array.isArray(record.table) && record.table.length === 6 && record.table.every(n => Number.isInteger(n) && n >= -1 && n <= 1e6))) fail();
  if (record.redacted !== undefined && record.redacted !== true) fail();
}

/** Strict schema of a host `ax_tree_update` event (proposed cef-v1 §Accessibility). */
export function validateAXTreeUpdate(value) {
  if (!exactKeys(value, TREE_KEYS) || value.version !== 1 || value.event !== "ax_tree_update" || !isObject(value.target)) fail();
  if (!uint(value.seq) || value.seq === 0 || !uint(value.batch) || typeof value.reset !== "boolean" || typeof value.final !== "boolean"
      || !optionalId(value.root) || !optionalId(value.focus) || typeof value.truncated !== "boolean"
      || !finite(value.px) || value.px < 1 || value.px > 4) fail();
  if (!Array.isArray(value.events) || value.events.length > AX_LIMITS.maxEvents
      || !value.events.every(item => exactKeys(item, ["type", "id"]) && EVENT_TYPES.has(item.type) && wireId(item.id))) fail();
  if (!Array.isArray(value.nodes) || value.nodes.length > AX_LIMITS.maxRecordsPerEvent) fail();
  value.nodes.forEach(validateRecord);
  return value;
}

/** Strict schema of a host `ax_location` event. */
export function validateAXLocation(value) {
  if (!exactKeys(value, LOCATION_KEYS) || value.version !== 1 || value.event !== "ax_location" || !isObject(value.target)) fail();
  if (!uint(value.seq) || value.seq === 0 || !Array.isArray(value.nodes) || value.nodes.length > AX_LIMITS.maxRecordsPerEvent) fail();
  for (const record of value.nodes) {
    if (!isObject(record) || !wireId(record.id) || Object.keys(record).some(key => !["id", "b", "oc", "tf"].includes(key))) fail();
    validateGeometry(record);
  }
  return value;
}

/** Fields of the accessibility commands; throws on anything the host would reject. */
export function validateAXCommand(method, fields) {
  if (method === "accessibility") {
    if (!exactKeys(fields, ["enabled"]) || typeof fields.enabled !== "boolean") fail();
  } else if (method === "ax_action") {
    const keys = fields?.value === undefined ? ["node_id", "action"] : ["node_id", "action", "value"];
    if (!exactKeys(fields, keys) || !wireId(fields.node_id) || !AX_ACTIONS.includes(fields.action)) fail();
    if ((fields.action === "set_value") !== (fields.value !== undefined)) fail();
    if (fields.value !== undefined && (typeof fields.value !== "string" || fields.value.length > AX_LIMITS.setValue)) fail();
  } else if (method === "ax_ack") {
    if (!exactKeys(fields, ["seq"]) || !uint(fields.seq) || fields.seq === 0) fail();
  } else fail();
  return fields;
}

// ---- macOS role mapping -----------------------------------------------------------------
// Chromium ax::mojom::Role names (ui::ToString) -> [AXRole, AXSubrole]. Follows
// Chromium's own BrowserAccessibilityCocoa and WebKit conventions where VoiceOver
// depends on them (AXWebArea, AXHeading, AXLink, landmark subroles).
const ROLE_MAP = {
  rootWebArea: ["AXWebArea"], webArea: ["AXWebArea"], staticText: ["AXStaticText"], link: ["AXLink"],
  button: ["AXButton"], toggleButton: ["AXCheckBox", "AXToggle"], popUpButton: ["AXPopUpButton"], comboBoxSelect: ["AXPopUpButton"],
  checkBox: ["AXCheckBox"], switch: ["AXCheckBox", "AXSwitch"], radioButton: ["AXRadioButton"], radioGroup: ["AXRadioGroup"],
  textField: ["AXTextField"], searchBox: ["AXTextField", "AXSearchField"], textFieldWithComboBox: ["AXComboBox"],
  comboBoxGrouping: ["AXComboBox"], comboBoxMenuButton: ["AXComboBox"],
  heading: ["AXHeading"], image: ["AXImage"], canvas: ["AXImage"], graphicsSymbol: ["AXImage"], imageMap: ["AXGroup"],
  list: ["AXList", "AXContentList"], descriptionList: ["AXList", "AXDescriptionList"], listItem: ["AXGroup"],
  listBox: ["AXList"], listBoxOption: ["AXStaticText"], menuListPopup: ["AXMenu"], menuListOption: ["AXMenuItem"],
  table: ["AXTable"], grid: ["AXTable"], treeGrid: ["AXTable"], row: ["AXRow"], cell: ["AXCell"], gridCell: ["AXCell"],
  columnHeader: ["AXCell"], rowHeader: ["AXCell"], column: ["AXColumn"],
  main: ["AXGroup", "AXLandmarkMain"], navigation: ["AXGroup", "AXLandmarkNavigation"], banner: ["AXGroup", "AXLandmarkBanner"],
  contentInfo: ["AXGroup", "AXLandmarkContentInfo"], complementary: ["AXGroup", "AXLandmarkComplementary"],
  search: ["AXGroup", "AXLandmarkSearch"], region: ["AXGroup", "AXLandmarkRegion"], form: ["AXGroup", "AXLandmarkForm"],
  article: ["AXGroup", "AXDocumentArticle"], document: ["AXGroup", "AXDocument"], note: ["AXGroup", "AXDocumentNote"],
  dialog: ["AXGroup", "AXApplicationDialog"], alertDialog: ["AXGroup", "AXApplicationAlertDialog"],
  alert: ["AXGroup", "AXApplicationAlert"], status: ["AXGroup", "AXApplicationStatus"], log: ["AXGroup", "AXApplicationLog"],
  timer: ["AXGroup", "AXApplicationTimer"], marquee: ["AXGroup", "AXApplicationMarquee"],
  application: ["AXGroup", "AXLandmarkApplication"], tabPanel: ["AXGroup", "AXTabPanel"], definition: ["AXGroup", "AXDefinition"],
  term: ["AXGroup", "AXTerm"], math: ["AXGroup", "AXDocumentMath"], mathMLMath: ["AXGroup", "AXDocumentMath"],
  tab: ["AXRadioButton", "AXTabButton"], tabList: ["AXTabGroup"], menu: ["AXMenu"], menuBar: ["AXMenuBar"],
  menuItem: ["AXMenuItem"], menuItemCheckBox: ["AXMenuItem"], menuItemRadio: ["AXMenuItem"],
  slider: ["AXSlider"], spinButton: ["AXIncrementor"], progressIndicator: ["AXProgressIndicator"], meter: ["AXLevelIndicator"],
  tree: ["AXOutline"], treeItem: ["AXRow", "AXOutlineRow"], toolbar: ["AXToolbar"], splitter: ["AXSplitter"],
  disclosureTriangle: ["AXDisclosureTriangle"], colorWell: ["AXColorWell"], busyIndicator: ["AXBusyIndicator"],
  scrollBar: ["AXScrollBar"],
};
const IGNORED_ROLES = new Set(["none", "ignored", "presentational", "inlineTextBox"]);
const PRESS_ROLES = new Set(["link", "button", "toggleButton", "popUpButton", "comboBoxSelect", "checkBox", "switch", "radioButton",
  "tab", "menuItem", "menuItemCheckBox", "menuItemRadio", "menuListOption", "listBoxOption", "treeItem", "disclosureTriangle",
  "comboBoxMenuButton", "colorWell"]);
const TITLE_ROLES = new Set(["link", "button", "toggleButton", "popUpButton", "comboBoxSelect", "checkBox", "switch", "radioButton",
  "tab", "menuItem", "menuItemCheckBox", "menuItemRadio", "menuListOption", "heading", "treeItem", "disclosureTriangle", "rootWebArea", "webArea"]);
const CHECKABLE = new Set(["checkBox", "switch", "toggleButton", "menuItemCheckBox", "menuItemRadio", "radioButton"]);
const RANGES = new Set(["slider", "spinButton", "progressIndicator", "meter", "scrollBar"]);

/** [AXRole, AXSubrole|null] for one host record. */
export function macRole(record) {
  const protectedField = isProtected(record);
  if (["textField", "searchBox"].includes(record.role)) {
    if (protectedField) return ["AXTextField", "AXSecureTextField"];
    if (record.states?.includes("multiline")) return ["AXTextArea", null];
  }
  const [role, subrole = null] = ROLE_MAP[record.role] ?? ["AXGroup"];
  return [role, subrole];
}
const isProtected = record => record.redacted === true || record.states?.includes("protected") || record.input === "password";
const isIgnored = record => IGNORED_ROLES.has(record.role) || !!record.states?.some(state => state === "ignored" || state === "invisible");

/** The native element record for one host record (exposed or geometry-only). */
export function nativeRecord(record, exposedKids, exposed) {
  const out = { id: record.id, x: exposed, b: record.b, oc: record.oc, scroll: record.scroll ?? null, tf: record.tf ?? null };
  if (!exposed) return out;
  const [role, subrole] = macRole(record);
  const states = new Set(record.states ?? []);
  const secret = isProtected(record);
  const name = record.name ?? "";
  Object.assign(out, { role, subrole, roledesc: record.roledesc ?? null, kids: exposedKids,
    title: "", label: "", value: null, help: record.desc ?? "", placeholder: record.placeholder ?? "",
    url: record.role === "link" || record.role === "image" ? record.url ?? null : null,
    enabled: record.restriction !== "disabled", focusable: states.has("focusable"), editable: states.has("editable"),
    required: states.has("required"), invalid: record.invalid && record.invalid !== "false" ? record.invalid : null,
    expanded: states.has("expanded") ? true : states.has("collapsed") ? false : null, selected: record.selected ?? null,
    visited: states.has("visited"), multiline: states.has("multiline"), protected: secret, busy: record.busy ?? false,
    modal: record.modal ?? false, level: record.level ?? null, setsize: record.setsize ?? null, posinset: record.posinset ?? null,
    range: null, sel: secret ? null : record.sel ?? null, live: record.live ?? null, linktarget: record.linktarget ?? null,
    actions: [], settable: { focused: false, value: false } });
  if (record.role === "staticText" || record.role === "listBoxOption") out.value = name;
  else if (TITLE_ROLES.has(record.role)) out.title = name;
  else out.label = name;
  if (record.role === "heading") out.value = record.level ?? null;
  else if (CHECKABLE.has(record.role)) out.value = record.checked === "true" ? 1 : record.checked === "mixed" ? 2 : 0;
  else if (record.role === "tab") out.value = record.selected ? 1 : 0;
  else if (RANGES.has(record.role) && record.range) { out.range = record.range; out.value = record.range[2]; }
  else if (role === "AXTextField" || role === "AXTextArea" || role === "AXComboBox" || role === "AXPopUpButton") {
    out.value = secret ? "" : record.value ?? "";
  }
  const native = new Set(record.actions ?? []);
  if (PRESS_ROLES.has(record.role) || native.has("doDefault")) out.actions.push("AXPress");
  if (RANGES.has(record.role) && record.role !== "progressIndicator" && record.role !== "meter") out.actions.push("AXIncrement", "AXDecrement");
  out.actions.push("AXShowMenu", "AXScrollToVisible");
  out.settable = { focused: states.has("editable"), value: states.has("editable") && record.restriction !== "readOnly" };
  return out;
}

// ---- Tree model ---------------------------------------------------------------------------
/**
 * One Chromium tab's tree. Batches are staged until their `final` chunk, then
 * committed atomically; the return value is the native patch for that commit.
 */
export class ChromiumAXTree {
  #nodes = new Map(); #parents = new Map(); #sent = new Map(); #sentKids = new Map();
  #staged = null; #maxNodes;
  root = 0; focus = 0; px = 1; truncated = false;

  constructor({ maxNodes = AX_LIMITS.maxNodes } = {}) { this.#maxNodes = maxNodes; }
  get size() { return this.#nodes.size; }
  node(id) { return this.#nodes.get(id) ?? null; }
  parent(id) { return this.#parents.get(id) ?? 0; }
  reset() {
    this.#nodes.clear(); this.#parents.clear(); this.#sent.clear(); this.#sentKids.clear();
    this.#staged = null; this.root = 0; this.focus = 0; this.px = 1; this.truncated = false;
  }

  /** Applies a validated `ax_tree_update`; returns a native patch on `final`, else null. */
  applyTreeUpdate(event) {
    validateAXTreeUpdate(event);
    if (this.#staged?.batch !== event.batch) this.#staged = { batch: event.batch, reset: false, records: new Map(), order: [] };
    const staged = this.#staged;
    staged.reset ||= event.reset;
    for (const record of event.nodes) {
      if (record.append) {
        const base = staged.records.get(record.id);
        // A continuation always follows its record within the batch.
        if (!base) fail();
        if (record.append === "kids") {
          if (base.kids.length + record.kids.length > AX_LIMITS.maxKids) fail();
          base.kids = base.kids.concat(record.kids);
        } else {
          const joined = (base[record.append] ?? "") + record.text;
          if (joined.length > AX_LIMITS[record.append]) fail();
          base[record.append] = joined;
        }
        continue;
      }
      if (!staged.records.has(record.id)) staged.order.push(record.id);
      staged.records.set(record.id, { ...record, kids: [...record.kids] });
    }
    if (!event.final) return null;
    this.#staged = null;
    return this.#commit(staged, event);
  }

  /** Applies a validated `ax_location` to committed (and staged) nodes. */
  applyLocation(event) {
    validateAXLocation(event);
    const nodes = [];
    for (const record of event.nodes) {
      const staged = this.#staged?.records.get(record.id);
      if (staged) Object.assign(staged, { b: record.b, oc: record.oc, tf: record.tf });
      const node = this.#nodes.get(record.id);
      if (!node) continue;
      node.b = record.b; node.oc = record.oc;
      if (record.tf === undefined) delete node.tf; else node.tf = record.tf;
      const native = this.#native(record.id);
      this.#sent.set(record.id, JSON.stringify(native));
      nodes.push(native);
    }
    return { reset: false, root: this.root, focus: this.focus, px: this.px, nodes, removed: [], notifications: [] };
  }

  #commit(staged, event) {
    const before = staged.reset ? new Map() : new Map([...this.#nodes].map(([id, node]) => [id, node]));
    const oldParents = staged.reset ? new Map() : new Map(this.#parents);
    const oldFocus = this.focus;
    if (staged.reset) { this.#nodes.clear(); this.#sent.clear(); this.#sentKids.clear(); }
    for (const id of staged.order) {
      const record = staged.records.get(id);
      if (!this.#nodes.has(id) && this.#nodes.size >= this.#maxNodes) { this.truncated = true; continue; }
      if (isProtected(record)) { record.kids = []; delete record.value; delete record.sel; }  // defence in depth
      this.#nodes.set(id, record);
    }
    this.root = this.#nodes.has(event.root) ? event.root : (staged.reset ? 0 : this.root);
    this.px = event.px;
    this.truncated ||= event.truncated;
    // Reachability from the root defines the tree (deletions and reparenting).
    this.#parents.clear();
    const reachable = new Set();
    if (this.root) {
      const stack = [this.root];
      reachable.add(this.root);
      while (stack.length) {
        const id = stack.pop();
        for (const kid of this.#nodes.get(id).kids) {
          if (reachable.has(kid) || !this.#nodes.has(kid)) continue;
          reachable.add(kid); this.#parents.set(kid, id); stack.push(kid);
        }
      }
    }
    const removed = [];
    for (const id of [...this.#nodes.keys()]) if (!reachable.has(id)) { this.#nodes.delete(id); removed.push(id); }
    for (const id of removed) { this.#sent.delete(id); this.#sentKids.delete(id); }
    this.focus = this.#nodes.has(event.focus) ? event.focus : 0;

    // Native records: every changed node plus the nearest exposed ancestor of
    // every structural change (its flattened children may differ).
    const touched = new Set(staged.reset ? this.#nodes.keys() : []);
    const touchAncestor = (id, parents) => {
      for (let current = id, depth = 0; current && depth < 4096; current = parents.get(current) ?? 0, depth++) {
        const node = this.#nodes.get(current);
        if (node && !isIgnored(node)) { touched.add(current); return; }
      }
    };
    for (const id of staged.order) {
      if (!this.#nodes.has(id)) continue;
      touched.add(id);
      touchAncestor(this.#parents.get(id), this.#parents);
      touchAncestor(oldParents.get(id), oldParents);
    }
    for (const id of removed) touchAncestor(oldParents.get(id), oldParents);
    const nodes = [];
    let structural = removed.length > 0;
    for (const id of touched) {
      if (!this.#nodes.has(id)) continue;
      const record = this.#native(id);
      const encoded = JSON.stringify(record), kids = JSON.stringify(record.kids ?? null);
      if (this.#sentKids.has(id) && this.#sentKids.get(id) !== kids) structural = true;
      this.#sentKids.set(id, kids);
      if (this.#sent.get(id) === encoded) continue;
      this.#sent.set(id, encoded);
      nodes.push(record);
    }
    const notifications = staged.reset ? [] : this.#notifications(before, staged, oldFocus, event);
    if (staged.reset && this.focus) notifications.push({ type: "focus", id: this.focus });
    if (event.events.some(item => item.type === "loadComplete") && this.root) notifications.push({ type: "load", id: this.root });
    if (!staged.reset && structural && this.root) notifications.push({ type: "layout", id: this.root });
    return { reset: staged.reset, root: this.root, focus: this.focus, px: this.px, nodes, removed: staged.reset ? [] : removed, notifications };
  }

  #native(id) {
    const node = this.#nodes.get(id);
    const exposed = !isIgnored(node) || id === this.root;
    return nativeRecord(node, exposed ? this.exposedChildren(id) : [], exposed);
  }

  /** Children as VoiceOver sees them: ignored nodes are replaced by their exposed descendants. */
  exposedChildren(id) {
    const out = [];
    const node = this.#nodes.get(id);
    if (!node || isProtected(node)) return out;
    const visit = (parentId, kids, depth) => {
      for (const kid of kids) {
        const child = this.#nodes.get(kid);
        // Dangling ids (not delivered yet) and ids claimed by another parent are skipped.
        if (!child || this.#parents.get(kid) !== parentId) continue;
        if (!isIgnored(child)) out.push(kid);
        else if (depth < 256 && !isProtected(child)) visit(kid, child.kids, depth + 1);
      }
    };
    visit(id, node.kids, 0);
    return out;
  }

  #notifications(before, staged, oldFocus, event) {
    const out = [];
    if (this.focus !== oldFocus && this.focus) out.push({ type: "focus", id: this.focus });
    const announce = { text: [], priority: "medium" };
    for (const id of staged.order) {
      const node = this.#nodes.get(id), old = before.get(id);
      if (!node || isIgnored(node)) continue;
      if (old) {
        if ((node.value ?? "") !== (old.value ?? "") || node.checked !== old.checked
            || JSON.stringify(node.range ?? null) !== JSON.stringify(old.range ?? null)) out.push({ type: "value", id });
        if ((node.name ?? "") !== (old.name ?? "")) out.push({ type: "title", id });
        if (id === this.focus && JSON.stringify(node.sel ?? null) !== JSON.stringify(old.sel ?? null)) out.push({ type: "selectedText", id });
        const expanded = node.states?.includes("expanded"), wasExpanded = old.states?.includes("expanded");
        if (expanded !== wasExpanded) out.push({ type: "expanded", id });
      }
      // Live regions: new or changed text inside a polite/assertive region.
      const live = this.#liveStatus(id);
      if (live && node.role === "staticText" && node.name && node.name !== old?.name) {
        announce.text.push(node.name);
        if (live === "assertive") announce.priority = "high";
      }
      if (node.role === "alert" && !old) {
        const words = this.textContent(id);
        if (words) { announce.text.push(words); announce.priority = "high"; }
      }
    }
    if (announce.text.length) {
      let joined = announce.text.join(" ").replace(/\s+/gu, " ").trim();
      if (joined.length > 500) joined = `${joined.slice(0, 499)}…`;
      out.push({ type: "announce", id: this.root, text: joined, priority: announce.priority });
    }
    return out;
  }

  #liveStatus(id) {
    for (let current = id, depth = 0; current && depth < 4096; current = this.#parents.get(current) ?? 0, depth++) {
      const live = this.#nodes.get(current)?.live;
      if (live === "off") return null;
      if (live === "polite" || live === "assertive") return live;
    }
    return null;
  }

  /** Concatenated static text below `id` (bounded), for alert announcements. */
  textContent(id, limit = 500) {
    const parts = [];
    let length = 0;
    const visit = (nodeId, depth) => {
      const node = this.#nodes.get(nodeId);
      if (!node || depth > 64 || length > limit || isProtected(node)) return;
      if (node.role === "staticText" && node.name) { parts.push(node.name); length += node.name.length; }
      for (const kid of node.kids) if (this.#parents.get(kid) === nodeId) visit(kid, depth + 1);
    };
    visit(id, 0);
    return parts.join(" ").slice(0, limit);
  }

  /**
   * Absolute bounds in view points, as Chromium's AXTree::RelativeToTreeBounds
   * resolves them: node transform, plus container offset, minus container
   * scroll, repeated; divided by `px` (device pixels per point when the host's
   * tree reports physical pixels).
   */
  resolveBounds(id) {
    let node = this.#nodes.get(id);
    if (!node) return null;
    let [x, y, w, h] = node.b;
    const seen = new Set();
    while (node && !seen.has(node.id) && seen.size < 4096) {
      seen.add(node.id);
      if (node.tf) ({ x, y, w, h } = mapRect(node.tf, { x, y, w, h }));
      const container = node.oc ? this.#nodes.get(node.oc) : null;
      if (!container || container === node) break;
      x += container.b[0]; y += container.b[1];
      if (container.scroll) { x -= container.scroll[0]; y -= container.scroll[1]; }
      node = container;
    }
    return { x: x / this.px, y: y / this.px, w: w / this.px, h: h / this.px };
  }
}

function mapRect([a, b, c, d, e, f], { x, y, w, h }) {
  const xs = [x, x + w, x, x + w], ys = [y, y, y + h, y + h];
  const px = xs.map((value, i) => a * value + c * ys[i] + e), py = xs.map((value, i) => b * value + d * ys[i] + f);
  const left = Math.min(...px), top = Math.min(...py);
  return { x: left, y: top, w: Math.max(...px) - left, h: Math.max(...py) - top };
}

/**
 * View points -> canvas CSS pixels, snapped to device pixels. CEFPresenter sets
 * the canvas' intrinsic size to the logical view size and presents the surface
 * with `object-fit: none; object-position: 0 0`, so one view point is one CSS
 * pixel from the canvas' top-left corner whatever its CSS box (a resize in
 * flight) or the surface's render scale. `visible` says whether any part lies
 * inside the logical view.
 */
export function toCanvasRect(rect, { logicalWidth, logicalHeight, scale = 1 }) {
  if (!rect || !(scale > 0) || ![rect.x, rect.y, rect.w, rect.h].every(Number.isFinite)) return null;
  const snap = value => Math.round(value * scale) / scale;
  const x = snap(rect.x), y = snap(rect.y), w = snap(rect.x + rect.w) - x, h = snap(rect.y + rect.h) - y;
  const visible = w > 0 && h > 0 && x < logicalWidth && y < logicalHeight && x + w > 0 && y + h > 0;
  return { x, y, w, h, visible };
}

// ---- Controller -----------------------------------------------------------------------------
/** nsIAxioEngineAccessibility, or null in tests/builds without the component. */
export function engineAccessibilityService() {
  try {
    const factory = globalThis.Cc?.[AX_SERVICE_CONTRACT];
    const iface = globalThis.Ci?.nsIAxioEngineAccessibility;
    return factory && iface ? factory.getService(iface) : null;
  } catch { return null; }
}

/**
 * Per-process controller. A view is one Chromium tab: `{ targetId, canvas, adapter,
 * focusContent() }` where `adapter` provides accessibility(enabled), axAction(id,
 * action, value) and axAck(target, seq) (hooks in CEFEngineAdapter, design doc §8).
 */
export class ChromiumAccessibility {
  #service; #observers; #timers; #pollMs; #views = new Map(); #poll = null; #disposed = false;
  #observer = { observe: (_subject, topic, data) => { if (topic === "a11y-init-or-shutdown" && data === "0") this.disableAll(); } };

  constructor({ service = engineAccessibilityService(), observerService = globalThis.Services?.obs ?? null,
    timers = defaultTimers(), pollMs = 15000 } = {}) {
    this.#service = service; this.#observers = observerService; this.#timers = timers; this.#pollMs = pollMs;
    if (!service) return;
    service.listener = {
      onAccessibilityRequested: targetId => this.#requested(Number(targetId)),
      onAction: (targetId, nodeId, action, value) => this.#action(Number(targetId), nodeId, action, value),
    };
    this.#observers?.addObserver(this.#observer, "a11y-init-or-shutdown");
  }

  get available() { return !!this.#service && !this.#disposed; }
  /** A platform assistive client (VoiceOver, Voice Control, Switch Control...) asked Gecko for a11y. */
  get platformActive() {
    try { return !!this.#service?.platformClientActive; } catch { return false; }
  }
  view(targetId) { return this.#views.get(targetId) ?? null; }

  attach(view) {
    if (!this.available || !view?.canvas || !Number.isSafeInteger(view.targetId)) return false;
    this.detach(view.targetId);
    const record = { ...view, tree: null, enabled: false, visible: true };
    this.#views.set(view.targetId, record);
    this.#service.attach(view.canvas, view.targetId);
    // Until the tree attaches the canvas stays one labelled group (design doc §4).
    view.canvas.setAttribute("role", "group");
    view.canvas.setAttribute("aria-label", "Chromium page");
    return true;
  }

  detach(targetId) {
    const view = this.#views.get(targetId);
    if (!view) return;
    this.#views.delete(targetId);
    try { this.#service.detach(targetId); } catch {}
    if (view.enabled) view.adapter?.accessibility(false).catch(() => {});
    this.#schedulePoll();
  }

  /** Page title for the canvas group; the web area's own title comes from the tree. */
  setTitle(targetId, title) {
    const view = this.#views.get(targetId);
    if (view && typeof title === "string") view.canvas.setAttribute("aria-label", title ? `${title.slice(0, 200)} (Chromium)` : "Chromium page");
  }

  /** Hidden tabs drop their tree; VoiceOver asking again re-enables it. */
  setVisible(targetId, visible) {
    const view = this.#views.get(targetId);
    if (!view) return;
    view.visible = visible;
    if (!visible) this.#disable(view);
  }

  /**
   * Host events for a tab. Returns true when the event was an accessibility event.
   * Every chunk is acknowledged after it is applied, also when the tree is off,
   * so the host's credit never leaks.
   */
  handleEvent(targetId, event) {
    if (event?.event !== "ax_tree_update" && event?.event !== "ax_location") return false;
    const view = this.#views.get(targetId);
    try {
      if (view?.enabled && view.tree) {
        const patch = event.event === "ax_tree_update" ? view.tree.applyTreeUpdate(event) : view.tree.applyLocation(event);
        if (patch && (patch.nodes.length || patch.removed.length || patch.notifications.length || patch.reset)) {
          patch.viewport = view.viewport ?? null;
          this.#service.applyPatch(targetId, JSON.stringify(patch));
        }
      }
    } catch {
      // A batch that cannot be applied (the adapter already validated the schema):
      // drop this tab's tree; VoiceOver asking again rebuilds it from a reset.
      if (view) this.#disable(view);
    } finally {
      view?.adapter?.axAck(event.target, event.seq)?.catch?.(() => {});
    }
    return true;
  }

  /** Logical view size (points) and canvas CSS size, for native coordinate mapping. */
  setViewport(targetId, { logicalWidth, logicalHeight, cssWidth = logicalWidth, cssHeight = logicalHeight }) {
    const view = this.#views.get(targetId);
    if (view) view.viewport = { logicalWidth, logicalHeight, cssWidth, cssHeight };
  }

  disableAll() { for (const view of this.#views.values()) this.#disable(view); }

  dispose() {
    if (this.#disposed) return;
    this.disableAll();
    for (const id of [...this.#views.keys()]) this.detach(id);
    this.#disposed = true;
    if (this.#poll) this.#timers.clearTimeout(this.#poll);
    try { this.#observers?.removeObserver(this.#observer, "a11y-init-or-shutdown"); } catch {}
    if (this.#service) this.#service.listener = null;
  }

  #requested(targetId) {
    const view = this.#views.get(targetId);
    if (!view || view.enabled) return;
    if (!view.visible || !this.platformActive) {
      // Not now: re-arm the native one-shot request so the next assistive query asks again.
      try { this.#service.clear(targetId); } catch {}
      return;
    }
    view.enabled = true;
    view.tree = new ChromiumAXTree();
    view.adapter.accessibility(true).catch(() => this.#disable(view));
    this.#schedulePoll();
  }

  #disable(view) {
    if (!view.enabled) return;
    view.enabled = false; view.tree = null;
    try { this.#service.clear(view.targetId); } catch {}
    view.adapter?.accessibility(false).catch(() => {});
  }

  // While any tree is on, check that an assistive client is still active.
  #schedulePoll() {
    const any = [...this.#views.values()].some(view => view.enabled);
    if (!any || this.#poll || this.#disposed) return;
    this.#poll = this.#timers.setTimeout(() => {
      this.#poll = null;
      if (!this.platformActive) this.disableAll();
      this.#schedulePoll();
    }, this.#pollMs);
  }

  #action(targetId, nodeId, action, value) {
    const view = this.#views.get(targetId);
    if (!view?.enabled || !AX_ACTIONS.includes(action) || !wireId(nodeId)) return;
    const fields = action === "set_value" ? { node_id: nodeId, action, value: String(value ?? "").slice(0, AX_LIMITS.setValue) }
      : { node_id: nodeId, action };
    try { validateAXCommand("ax_action", fields); } catch { return; }
    // Actions that move focus or type need Zen's keyboard focus on the canvas first,
    // so the key routing and Chromium's focused widget agree (CEFPresenter).
    if (action !== "scroll_to") view.focusContent?.();
    view.adapter.axAction(fields.node_id, fields.action, fields.value).catch(() => {});
  }
}

let sharedController = null;
/**
 * The process-wide controller. nsIAxioEngineAccessibility has one listener, and
 * one host serves every window, so every window's CEFPresenter shares this.
 */
export function sharedChromiumAccessibility() {
  // Zen preloads AxioSozo chrome modules per window (ZenPreloadedScripts), so this
  // module has one instance per window. The native listener is one per process:
  // every window delegates to the instance in the shared system global.
  const shared = sharedModule();
  if (shared && shared.sharedChromiumAccessibility !== sharedChromiumAccessibility) return shared.sharedChromiumAccessibility();
  if (!sharedController || !sharedController.available) sharedController = new ChromiumAccessibility();
  return sharedController;
}
function sharedModule() {
  try { return globalThis.ChromeUtils?.importESModule?.(import.meta.url, { global: "shared" }) ?? null; } catch { return null; }
}
function defaultTimers() {
  if (typeof globalThis.setTimeout === "function") return globalThis;
  try { return globalThis.ChromeUtils.importESModule("resource://gre/modules/Timer.sys.mjs"); } catch { return globalThis; }
}
