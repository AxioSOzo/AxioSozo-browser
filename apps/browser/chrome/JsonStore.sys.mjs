/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. https://mozilla.org/MPL/2.0/ */

// Profile-local JSON documents with the SavedPages pattern (contexts-api-v1 §3.2):
// one serialized writer per store, validation before every write, atomic
// replacement through a temporary file, and an invalid file is never overwritten.

// A profile store larger than this is treated as invalid: never parsed, never overwritten.
export const MAX_STORE_BYTES = 16 * 1024 * 1024;

export class JsonStoreError extends Error {
  constructor(code, message, options) {
    super(message ?? code, options);
    this.name = "JsonStoreError";
    this.code = code;
  }
}

export class JsonStore {
  #storage; #validate; #empty; #doc = null; #pending = Promise.resolve();

  /** storage: { read() → string|null, write(text) }; validate(doc) → normalized doc or throws. */
  constructor({ storage, validate, empty }) {
    if (!storage || typeof storage.read !== "function" || typeof storage.write !== "function")
      throw new TypeError("storage");
    if (typeof validate !== "function") throw new TypeError("validate");
    this.#storage = storage; this.#validate = validate; this.#empty = empty;
  }

  /** Validated document. A missing file yields the validated empty document
   * (not written). A corrupt or invalid file throws INVALID_STORE on every call
   * until the user resolves it; it is never replaced. */
  async load() {
    if (this.#doc) return this.#doc;
    let raw;
    try { raw = await this.#storage.read(); }
    catch (error) {
      if (error?.code === "STORE_TOO_LARGE" || error?.code === "INVALID_STORE")
        throw new JsonStoreError("INVALID_STORE", `INVALID_STORE: ${error.code}`, { cause: error });
      throw error;
    }
    let doc;
    if (raw === null || raw === undefined) {
      doc = this.#validate(structuredClone(this.#empty));
    } else {
      try {
        // UTF-16 length ≥ UTF-8 bytes / 3; storages without a byte cap are still bounded.
        if (typeof raw !== "string" || raw.length > MAX_STORE_BYTES) throw new JsonStoreError("STORE_TOO_LARGE");
        doc = this.#validate(JSON.parse(raw));
      } catch (error) {
        throw new JsonStoreError("INVALID_STORE", `INVALID_STORE: ${error?.code ?? error?.message ?? error}`, { cause: error });
      }
    }
    this.#doc ??= doc;
    return this.#doc;
  }

  /** Serialized read-modify-write. mutator(doc) → nextDoc (may be async). The
   * result is validated before anything is written; on any failure the file
   * and the in-memory document stay unchanged. */
  update(mutator) {
    const operation = this.#pending.then(async () => {
      const current = await this.load();
      const next = await mutator(current);
      if (next === current) return current;
      const validated = this.#validate(next);
      await this.#storage.write(JSON.stringify(validated, null, 2) + "\n");
      this.#doc = validated;
      return validated;
    });
    this.#pending = operation.catch(() => {});
    return operation;
  }

  /** Waits for queued writes; never rejects. */
  settled() {
    return this.#pending;
  }
}

const SEGMENT = /^[a-z0-9][a-z0-9._-]{0,63}$/u;

/** Atomic IOUtils storage for <profile>/axiosozo/<relativePath>. Reads at most
 * MAX_STORE_BYTES + 1 bytes; a larger file rejects with STORE_TOO_LARGE. */
export function profileStorage(relativePath, { profileDir, io } = {}) {
  const parts = String(relativePath).split("/");
  if (!parts.length || parts.some(part => !SEGMENT.test(part) || part.endsWith(".tmp")))
    throw new JsonStoreError("INVALID_STORE_PATH");
  const IO = io ?? globalThis.IOUtils;
  const Paths = globalThis.PathUtils;
  const base = profileDir ?? Paths.profileDir;
  const dir = Paths.join(base, "axiosozo", ...parts.slice(0, -1));
  const path = Paths.join(dir, parts.at(-1));
  return {
    path,
    async read() {
      let bytes;
      try { bytes = await IO.read(path, { maxBytes: MAX_STORE_BYTES + 1 }); }
      catch (error) { if (error?.name === "NotFoundError") return null; throw error; }
      if (bytes.length > MAX_STORE_BYTES) throw new JsonStoreError("STORE_TOO_LARGE");
      try { return new TextDecoder("utf-8", { fatal: true }).decode(bytes); }
      catch (error) { throw new JsonStoreError("INVALID_STORE", "INVALID_STORE: not UTF-8", { cause: error }); }
    },
    async write(text) {
      await IO.makeDirectory(dir, { ignoreExisting: true, createAncestors: true, permissions: 0o700 });
      await IO.writeUTF8(path, text, { tmpPath: `${path}.tmp` });
    },
  };
}
