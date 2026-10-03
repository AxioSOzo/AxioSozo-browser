/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. https://mozilla.org/MPL/2.0/ */

// DOM-free, profile-free console state. Runtime callers supply current tab
// metadata; raw console objects and browser windows never enter this store.
export const MAX_CONSOLE_MESSAGES = 50;
export const MAX_CONSOLE_TEXT = 1000;
export const MAX_CONSOLE_SOURCE = 2048;
export const MAX_CONSOLE_TABS = 2048;
const PROJECT_ID = /^p_[a-z0-9][a-z0-9_-]{0,79}$/u;
const TAB_ID = /^[A-Za-z0-9_-]{1,128}$/u;
const CONTROLS = /[\u0000-\u001f\u007f-\u009f\u202a-\u202e\u2066-\u2069]/gu;

export class ConsoleErrorsError extends Error {
  constructor(code) { super(code); this.name = 'ConsoleErrorsError'; this.code = code; }
}
export function consoleDocumentId(value) {
  if (typeof value === 'string' && /^[1-9][0-9]{0,15}$/u.test(value)) {
    const n = Number(value);
    return Number.isSafeInteger(n) ? String(n) : null;
  }
  return Number.isSafeInteger(value) && value > 0 ? String(value) : null;
}
export function consoleNavigationToken(value) {
  return typeof value === 'string' && /^n_[1-9][0-9]{0,15}$/u.test(value) ? value : null;
}
export function consoleWebURL(value) {
  if (typeof value !== 'string' || value.length > 16384 || CONTROLS.test(value)) {
    CONTROLS.lastIndex = 0;
    return null;
  }
  CONTROLS.lastIndex = 0;
  try {
    const url = new URL(value);
    return ['http:', 'https:'].includes(url.protocol) ? url : null;
  } catch { return null; }
}
export function sanitizeConsoleSource(value) {
  if (value === '') return '';
  const url = consoleWebURL(value);
  if (!url) return null;
  // Gecko hides passwords but may keep usernames. Also remove query/fragment,
  // which frequently carry tokens. No local, extension or privileged source.
  url.username = ''; url.password = ''; url.search = ''; url.hash = '';
  return url.href.slice(0, MAX_CONSOLE_SOURCE);
}
export function sanitizeConsoleText(value) {
  if (typeof value !== 'string') return null;
  return value.slice(0, MAX_CONSOLE_TEXT * 4).replace(CONTROLS, ' ').slice(0, MAX_CONSOLE_TEXT);
}
export function consolePrimitiveText(values) {
  if (!Array.isArray(values)) return null;
  const parts = [];
  // Only own data properties: neither object serialization nor user getters.
  for (let i = 0; i < Math.min(values.length, 20); i++) {
    const descriptor = Object.getOwnPropertyDescriptor(values, String(i));
    if (!descriptor || !Object.hasOwn(descriptor, 'value')) continue;
    const value = descriptor.value;
    if (typeof value === 'string') parts.push(value.slice(0, MAX_CONSOLE_TEXT));
    else if (typeof value === 'boolean' || (typeof value === 'number' && Number.isFinite(value))) parts.push(String(value));
    if (parts.join(' ').length >= MAX_CONSOLE_TEXT) break;
  }
  return parts.length ? sanitizeConsoleText(parts.join(' ')) : null;
}

export function validateConsolePacket(value) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return null;
  const prototype = Object.getPrototypeOf(value);
  // Structured-cloned actor packets may have another global's Object.prototype.
  // Allow that shape (or null prototype), but no built-in/custom prototype chain.
  if (prototype !== null && Object.getPrototypeOf(prototype) !== null) return null;
  const descriptors = Object.getOwnPropertyDescriptors(value);
  const keys = Object.keys(descriptors);
  const expected = ['v', 'document_id', 'navigation_token', 'observed_at', 'level', 'text', 'source', 'line'];
  if (keys.length !== expected.length || expected.some(key => !Object.hasOwn(descriptors, key)
    || !Object.hasOwn(descriptors[key], 'value'))) return null;
  const packet = Object.fromEntries(expected.map(key => [key, descriptors[key].value]));
  if (packet.v !== 1 || !consoleDocumentId(packet.document_id)
    || !consoleNavigationToken(packet.navigation_token)
    || !Number.isFinite(packet.observed_at) || packet.observed_at < 0 || packet.observed_at > Number.MAX_SAFE_INTEGER
    || !['error', 'warning'].includes(packet.level)
    || typeof packet.text !== 'string' || packet.text.length > MAX_CONSOLE_TEXT
    || typeof packet.source !== 'string' || packet.source.length > MAX_CONSOLE_SOURCE
    || !Number.isInteger(packet.line) || packet.line < 0 || packet.line > 0xffffffff) return null;
  const source = sanitizeConsoleSource(packet.source);
  const text = sanitizeConsoleText(packet.text);
  if (source === null || !text?.trim()) return null;
  return { ...packet, document_id: consoleDocumentId(packet.document_id), text, source };
}

const snapshotOf = value => {
  if (!value || value.private !== false || value.engine !== 'gecko') return null;
  const document_id = consoleDocumentId(value?.document_id);
  const url = consoleWebURL(value?.url);
  if (!TAB_ID.test(value?.tab_id ?? '') || !document_id || !url) return null;
  return { tab_id: value.tab_id, document_id, url: url.href,
    project_id: PROJECT_ID.test(value.project_id ?? '') ? value.project_id : null };
};
const resultOf = entry => Object.freeze({ count: entry?.messages.length ?? 0,
  messages: Object.freeze((entry?.messages ?? []).map(message => Object.freeze({ ...message }))) });

export class ConsoleErrorsStore {
  #clock; #entries = new Map(); #listeners = new Set();
  constructor({ clock } = {}) {
    if (typeof clock !== 'function') throw new ConsoleErrorsError('INVALID_CLOCK');
    this.#clock = clock;
  }
  onChange(callback) {
    if (typeof callback !== 'function') throw new ConsoleErrorsError('INVALID_CALLBACK');
    this.#listeners.add(callback);
    return () => this.#listeners.delete(callback);
  }
  #emit(kind, entry) {
    const event = Object.freeze({ kind, tab_id: entry.tab_id, project_id: entry.project_id,
      count: entry.messages?.length ?? 0 });
    for (const callback of [...this.#listeners]) { try { callback(event); } catch {} }
  }
  forgetTab(tab_id) {
    const entry = this.#entries.get(tab_id);
    if (!entry) return false;
    this.#entries.delete(tab_id);
    this.#emit('cleared', { ...entry, messages: [] });
    return true;
  }
  prune(liveTabIds) {
    const live = new Set(liveTabIds);
    for (const tab_id of this.#entries.keys()) if (!live.has(tab_id)) this.forgetTab(tab_id);
  }
  #syncTab(value) {
    const snapshot = snapshotOf(value);
    if (!snapshot) { this.forgetTab(value?.tab_id); return null; }
    let entry = this.#entries.get(snapshot.tab_id);
    if (entry && (entry.document_id !== snapshot.document_id || entry.url !== snapshot.url)) {
      this.forgetTab(snapshot.tab_id); entry = null;
    }
    if (!entry) {
      if (this.#entries.size >= MAX_CONSOLE_TABS) return null;
      entry = { ...snapshot, messages: [] }; this.#entries.set(snapshot.tab_id, entry);
    } else if (entry.project_id !== snapshot.project_id) {
      const previous = { ...entry, messages: [] };
      entry.project_id = snapshot.project_id;
      this.#emit('cleared', previous);
      this.#emit('relinked', entry);
    }
    return entry;
  }
  updateTab(value) { return !!this.#syncTab(value); }
  record(snapshot, value = {}) {
    const entry = this.#syncTab(snapshot);
    if (!entry) return false;
    const { level, text: rawText, source: rawSource = '', line = 0 } = value;
    if (!['error', 'warning'].includes(level)) return false;
    const text = sanitizeConsoleText(rawText), source = sanitizeConsoleSource(rawSource);
    if (!text?.trim() || source === null) return false;
    const at = this.#clock();
    if (!Number.isSafeInteger(at) || at < 0) return false;
    entry.messages.push(Object.freeze({ level, text, source,
      line: Number.isInteger(line) && line >= 0 && line <= 0xffffffff ? line : 0, at }));
    if (entry.messages.length > MAX_CONSOLE_MESSAGES) entry.messages.shift();
    this.#emit('recorded', entry);
    return true;
  }
  getTabErrors(snapshot) {
    if (snapshot?.private !== false) { this.forgetTab(snapshot?.tab_id); throw new ConsoleErrorsError('PRIVATE'); }
    if (snapshot?.engine === 'chromium') { this.forgetTab(snapshot.tab_id); throw new ConsoleErrorsError('UNAVAILABLE'); }
    const entry = this.#syncTab(snapshot);
    if (!entry) throw new ConsoleErrorsError('UNAVAILABLE');
    return resultOf(entry);
  }
  getProjectCounts() {
    const counts = new Map();
    for (const entry of this.#entries.values()) {
      if (!entry.project_id || !entry.messages.length) continue;
      const count = counts.get(entry.project_id) ?? { project_id: entry.project_id, count: 0, errors: 0, warnings: 0, tabs: 0 };
      count.tabs++; count.count += entry.messages.length;
      for (const message of entry.messages) count[message.level === 'error' ? 'errors' : 'warnings']++;
      counts.set(entry.project_id, count);
    }
    return Object.freeze([...counts.values()].map(count => Object.freeze(count)));
  }
  dispose() { this.prune([]); this.#listeners.clear(); }
}
