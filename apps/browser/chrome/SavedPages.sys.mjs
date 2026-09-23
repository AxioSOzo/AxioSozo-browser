/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. https://mozilla.org/MPL/2.0/ */

const MAX_ITEMS = 1000;
const MAX_TEXT = 4096;
const WEB_URL = /^https?:\/\//iu;

function validText(value, limit = MAX_TEXT) {
  return typeof value === "string" && value.length <= limit && !/[\u0000-\u001f\u007f]/u.test(value);
}

export function validateSavedPage(item) {
  if (!item || typeof item !== "object" || !/^[0-9a-f-]{36}$/iu.test(item.id)
      || !validText(item.url) || !WEB_URL.test(item.url)
      || !validText(item.title, 512) || !validText(item.note, 1000)
      || !validText(item.fragment, 1000) || !Number.isSafeInteger(item.savedAt)
      || item.savedAt <= 0 || !Number.isSafeInteger(item.userContextId)
      || item.userContextId < 0) throw new Error("INVALID_SAVED_PAGE");
  return Object.freeze({ id: item.id, url: item.url, title: item.title,
    note: item.note, fragment: item.fragment, savedAt: item.savedAt,
    userContextId: item.userContextId });
}

export function searchSavedPages(items, query, userContextId) {
  const terms = String(query).normalize("NFKC").toLocaleLowerCase().trim().split(/\s+/u).filter(Boolean);
  if (!terms.length) return [];
  return items.filter(item => item.userContextId === userContextId &&
    terms.every(term => `${item.title} ${item.url} ${item.note} ${item.fragment}`
      .normalize("NFKC").toLocaleLowerCase().includes(term)))
    .sort((a, b) => b.savedAt - a.savedAt).slice(0, 12);
}

/** Atomic, serialized profile writes; injected storage keeps ordinary tests offline. */
export class SavedPages {
  constructor(storage, uuid, clock = Date.now) {
    this.storage = storage; this.uuid = uuid; this.clock = clock;
    this.items = null; this.pending = Promise.resolve();
  }
  async load() {
    if (this.items) return this.items;
    const raw = await this.storage.read();
    if (raw === null) return (this.items = []);
    const doc = JSON.parse(raw);
    if (doc?.version !== 1 || !Array.isArray(doc.items) || doc.items.length > MAX_ITEMS)
      throw new Error("INVALID_SAVED_STORE");
    const items = doc.items.map(validateSavedPage);
    if (new Set(items.map(item => item.id)).size !== items.length)
      throw new Error("INVALID_SAVED_STORE");
    return (this.items = items);
  }
  #commit(update) {
    const operation = this.pending.then(async () => {
      const current = await this.load();
      const next = update(current);
      await this.storage.write(JSON.stringify({ version: 1, items: next }));
      this.items = next;
      return next;
    });
    this.pending = operation.catch(() => {});
    return operation;
  }
  async add({ url, title, note = "", fragment = "", userContextId = 0 }) {
    const item = validateSavedPage({ id: this.uuid(), url, title, note, fragment,
      savedAt: this.clock(), userContextId });
    await this.#commit(items => {
      if (items.length >= MAX_ITEMS) throw new Error("SAVED_PAGE_LIMIT");
      if (items.some(existing => existing.id === item.id)) throw new Error("DUPLICATE_SAVED_ID");
      return [...items, item];
    });
    return item;
  }
  async remove(id) {
    await this.#commit(items => items.filter(item => item.id !== id));
  }
  async search(query, userContextId) {
    return searchSavedPages(await this.load(), query, userContextId);
  }
}

export function profileSavedPageStorage() {
  const path = PathUtils.join(PathUtils.profileDir, "axiosozo-saved-v1.json");
  return {
    async read() {
      try { return await IOUtils.readUTF8(path); }
      catch (error) { if (error?.name === "NotFoundError") return null; throw error; }
    },
    write(data) { return IOUtils.writeUTF8(path, data, { tmpPath: `${path}.tmp` }); },
  };
}

// Browser windows share one write queue for this profile file. Separate window
// instances would otherwise overwrite one another's successful saves.
let profileStore;
export function getProfileSavedPages() {
  profileStore ??= new SavedPages(profileSavedPageStorage(),
    () => Services.uuid.generateUUID().toString().replace(/[{}]/gu, ""));
  return profileStore;
}
