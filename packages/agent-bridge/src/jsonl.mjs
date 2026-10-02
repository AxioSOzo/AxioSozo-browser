// JSON-lines framing with a hard per-line byte limit and strict UTF-8.

const decoder = new TextDecoder('utf-8', { fatal: true });

export class LineTooLongError extends Error {
  constructor(limit) {
    super(`line exceeds ${limit} bytes`);
    this.name = 'LineTooLongError';
    this.limit = limit;
  }
}

/**
 * Splits a byte stream into '\n'-terminated lines of at most `maxLineBytes`
 * bytes (excluding the newline). Each complete line is decoded as strict
 * UTF-8 and handed to `onLine(text)`; empty or whitespace-only lines are
 * skipped. A line over the limit calls `onOverflow(error)`; with
 * `resync: true` the rest of that line is discarded and splitting continues,
 * otherwise the splitter stops for good.
 */
export class LineSplitter {
  #parts = [];
  #size = 0;
  #discarding = false;
  #dead = false;

  constructor({ maxLineBytes, onLine, onOverflow, onInvalid, resync = false }) {
    this.maxLineBytes = maxLineBytes;
    this.onLine = onLine;
    this.onOverflow = onOverflow;
    this.onInvalid = onInvalid;
    this.resync = resync;
  }

  push(chunk) {
    let start = 0;
    while (!this.#dead) {
      const nl = chunk.indexOf(10, start);
      const end = nl === -1 ? chunk.length : nl;
      const piece = chunk.subarray(start, end);
      if (this.#discarding) {
        if (nl !== -1) this.#discarding = false;
      } else if (this.#size + piece.length > this.maxLineBytes) {
        this.#parts = [];
        this.#size = 0;
        if (this.resync) this.#discarding = nl === -1;
        else this.#dead = true;
        this.onOverflow(new LineTooLongError(this.maxLineBytes));
      } else if (nl === -1) {
        if (piece.length) {
          this.#parts.push(Buffer.from(piece));
          this.#size += piece.length;
        }
      } else {
        const line = this.#parts.length ? Buffer.concat([...this.#parts, piece]) : piece;
        this.#parts = [];
        this.#size = 0;
        this.#emit(line);
      }
      if (nl === -1) return;
      start = nl + 1;
    }
  }

  #emit(bytes) {
    let text;
    try {
      text = decoder.decode(bytes);
    } catch {
      if (!this.resync) this.#dead = true;
      this.onInvalid(new Error('line is not valid UTF-8'));
      return;
    }
    if (text.trim() === '') return;
    this.onLine(text);
  }
}

/** Serialize `value` as one JSON line; throws LineTooLongError over `limit` bytes. */
export function encodeLine(value, limit) {
  const text = JSON.stringify(value);
  if (Buffer.byteLength(text, 'utf8') > limit) throw new LineTooLongError(limit);
  return text + '\n';
}
