/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. https://mozilla.org/MPL/2.0/ */

// Every contexts-core failure. `code` is an upper-snake string; `path` points at
// the offending value (`$.rules[0].id`) when there is one.
export class ContextsError extends Error {
  constructor(code, message, path = null) {
    super(message);
    this.name = 'ContextsError';
    this.code = code;
    this.path = path;
  }
}
