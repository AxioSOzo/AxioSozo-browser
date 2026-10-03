import assert from 'node:assert/strict';
import { createSafetyPreferences } from '../chrome/SafetyPreferences.sys.mjs';
const URI = 'network.trr.uri', MODE = 'network.trr.mode';
const FAMILY = 'https://family.cloudflare-dns.com/dns-query';
export function prefFixture() {
  const defaults = new Map([[URI, ''], [MODE, 0], ['network.trr.credentials', ''],
    ['network.trr.use_ohttp', false], ['network.trr.ohttp.uri', '']]);
  const users = new Map(), locks = new Set(), observers = new Set(), log = [], cache = [], reports = [];
  let writeCount = 0;
  const f = { defaults, users, locks, observers, log, cache, reports, beforeWrite: null, afterWrite: null,
    onCache: null, onRead: null, failDefault: false, onRecovery: null };
  function effective(n) { return locks.has(n) || !users.has(n) ? defaults.get(n) : users.get(n); }
  function typed(n, type, defaultOnly = false) {
    log.push({ method: `get${type}`, name: n, defaultOnly });
    if (n === 'network.trr.credentials' || n === 'network.trr.ohttp.uri') throw new Error('FORBIDDEN_SECRET_READ');
    f.onRead?.(n, defaultOnly);
    if (defaultOnly && f.failDefault) throw new Error('DEFAULT_READ_FAILED');
    const v = defaultOnly ? defaults.get(n) : effective(n);
    if (typeof v !== type) throw new Error('WRONG_TYPE');
    return v;
  }
  function prefType(n, defaultOnly = false) {
    const v = defaultOnly ? defaults.get(n) : effective(n);
    return typeof v === 'string' ? 32 : typeof v === 'number' && Number.isInteger(v) ? 64 : typeof v === 'boolean' ? 128 : 0;
  }
  function notify(n) { for (const o of [...observers]) o.observe(null, 'nsPref:changed', n); }
  function write(n, operation, value, external = false) {
    if (!external) { writeCount++; log.push({ method: 'write', name: n, operation, value }); f.beforeWrite?.({ name: n, operation, value, count: writeCount }); }
    const before = effective(n), had = users.has(n);
    // Model pinned Gecko's nonsticky user-slot normalization, including hidden locked writes.
    if (operation === 'clear' || value === defaults.get(n)) users.delete(n); else users.set(n, value);
    if (!locks.has(n) && (before !== effective(n) || had !== users.has(n))) notify(n);
    if (!external) f.afterWrite?.({ name: n, operation, value, count: writeCount });
  }
  const prefs = {
    getPrefType: n => prefType(n), getStringPref: n => typed(n, 'string'), getIntPref: n => typed(n, 'number'), getBoolPref: n => typed(n, 'boolean'),
    prefHasUserValue(n) { log.push({ method: 'hasUser', name: n }); return users.has(n); },
    prefIsLocked(n) { log.push({ method: 'locked', name: n }); return locks.has(n); },
    setStringPref: (n, v) => write(n, 'set', v), setIntPref: (n, v) => write(n, 'set', v), clearUserPref: n => write(n, 'clear'),
    getDefaultBranch(root) {
      assert.equal(root, '');
      return { getPrefType: n => prefType(n, true), getStringPref: n => typed(n, 'string', true), getIntPref: n => typed(n, 'number', true) };
    },
    addObserver(root, observer, weak) { assert.equal(root, 'network.trr.'); assert.equal(weak, false); observers.add(observer); },
    removeObserver(root, observer) { assert.equal(root, 'network.trr.'); observers.delete(observer); },
  };
  const dns = { clearCache(includeTrr) { assert.equal(includeTrr, true); cache.push(includeTrr); f.onCache?.(cache.length); } };
  f.prefs = prefs; f.adapter = createSafetyPreferences({ prefs, dns, onRecoveryRequired(report) {
    reports.push(report); return f.onRecovery ? f.onRecovery(report) : true;
  } });
  f.external = (n, v) => write(n, 'set', v, true);
  f.lock = n => { locks.add(n); notify(n); };
  f.writes = () => log.filter(v => v.method === 'write');
  f.batch = () => f.adapter.compareAndApply(f.adapter.snapshot(), [{ name: URI, operation: 'set', value: FAMILY }, { name: MODE, operation: 'set', value: 3 }]);
  return f;
}
