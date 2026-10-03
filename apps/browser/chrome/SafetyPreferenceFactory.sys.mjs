/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. https://mozilla.org/MPL/2.0/ */
// Shared injected lifetime/cleanup guard for immutable native adapter instances.
// Never discovers services or reads preferences at construction.
const METHODS = Object.freeze(['getPrefType', 'getStringPref', 'getIntPref', 'getBoolPref', 'prefHasUserValue', 'prefIsLocked',
  'setStringPref', 'setIntPref', 'clearUserPref', 'getDefaultBranch', 'addObserver', 'removeObserver']);
const fail = code => { const e = new Error(code); e.code = code; throw e; };
export function createSafetyPreferenceFactory({ nativeCreate, prefs, dns } = {}) {
  if (typeof nativeCreate !== 'function' || !METHODS.every(k => typeof prefs?.[k] === 'function') || typeof dns?.clearCache !== 'function') fail('INVALID_SAFETY_NATIVE_FACTORY');
  let handle = null, active = null, busy = false;
  const branch = Object.fromEntries(METHODS.map(k => [k, (...args) => prefs[k](...args)]));
  branch.addObserver = (root, observer, weak) => {
    if (root !== 'network.trr.' || weak !== false || handle !== null) fail('SAFETY_OBSERVER_BUSY');
    // Track before calling native: a throw may follow actual registration.
    handle = { root, observer }; return prefs.addObserver(root, observer, weak);
  };
  branch.removeObserver = (root, observer) => {
    if (!handle || root !== handle.root || observer !== handle.observer) fail('SAFETY_OBSERVER_MISMATCH');
    const result = prefs.removeObserver(root, observer); handle = null; return result;
  };
  function cleanup() {
    if (busy) return false;
    if (handle === null) return true;
    try { prefs.removeObserver(handle.root, handle.observer); handle = null; return true; } catch { return false; }
  }
  function create(options) {
    if (active !== null) fail('SAFETY_NATIVE_INSTANCE_BUSY');
    if (!cleanup()) fail('SAFETY_NATIVE_CLEANUP_REQUIRED');
    const native = nativeCreate({ ...options, prefs: branch, dns });
    const token = {}; active = token; let disposed = false;
    const check = () => { if (disposed || active !== token) fail('SAFETY_NATIVE_DISPOSED'); };
    return Object.freeze({ snapshot() { check(); return native.snapshot(); }, diagnostics() { check(); return native.diagnostics(); },
      compareAndApply(expected, mutations) { check(); if (busy) return false; busy = true; try { return native.compareAndApply(expected, mutations); } finally { busy = false; } },
      resolveRecovery(request) { check(); return native.resolveRecovery(request); },
      dispose() {
        if (busy) return false;
        if (!disposed) { try { native.dispose(); } finally { disposed = true; active = null; } }
        return cleanup();
      },
    });
  }
  return Object.freeze({ create, cleanup, diagnostics: () => Object.freeze({ active: active !== null, busy, cleanup_pending: handle !== null }) });
}
