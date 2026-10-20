// EngineHostSpare: warm spare engine hosts (docs/perf/pixel-path.md, "Warm spare hosts").
import test from "node:test";
import assert from "node:assert/strict";
import { SpareHost, prewarmWanted, PREWARM_PREF } from "../chrome/EngineHostSpare.sys.mjs";

function fakeHost(name) {
  let exit;
  const host = { name, ended: false, status: "connected", targetCount: 0, shutdowns: 0,
    exited: new Promise(resolve => { exit = resolve; }),
    shutdown() { this.shutdowns++; this.ended = true; exit(); return Promise.resolve(); } };
  host.exit = () => { host.ended = true; exit(); };
  return host;
}
const settle = () => new Promise(resolve => setTimeout(resolve, 0));

test("a spare is launched once, taken once (one use), and the next one only on request", async () => {
  const launched = [];
  const spare = new SpareHost(() => { const host = fakeHost(`h${launched.length + 1}`); launched.push(host); return host; }, { observers: null });
  assert.equal(await spare.take(() => true), null, "nothing to take yet");
  assert.equal(spare.prewarm(), true);
  assert.equal(spare.prewarm(), false, "one spare at a time");
  assert.equal(spare.state, "starting");
  await settle();
  assert.equal(spare.state, "ready");
  const host = await spare.take(candidate => candidate.status === "connected");
  assert.equal(host, launched[0]); assert.equal(host.shutdowns, 0);
  assert.equal(spare.state, "none");
  assert.equal(await spare.take(() => true), null, "never handed out twice");
  assert.deepEqual(spare.stats, { launched: 1, taken: 1, refused: 0, dropped: 0, failed: 0, state: "none" });
});

test("take waits for a spare that is still starting; refused, dead and failed spares are never used", async () => {
  let release;
  const slow = fakeHost("slow");
  const spare = new SpareHost(() => new Promise(resolve => { release = () => resolve(slow); }), { observers: null });
  spare.prewarm();
  const taking = spare.take(() => true);
  await settle(); release();
  assert.equal(await taking, slow, "the starting spare is awaited, not shut down");
  assert.equal(slow.shutdowns, 0);
  // Refused by the caller (e.g. another origin): shut down.
  const other = fakeHost("other");
  const spare2 = new SpareHost(() => other, { observers: null });
  spare2.prewarm(); await settle();
  assert.equal(await spare2.take(host => host.name === "wanted"), null);
  assert.equal(other.shutdowns, 1);
  // Exited while waiting: forgotten.
  const dead = fakeHost("dead");
  const spare3 = new SpareHost(() => dead, { observers: null });
  spare3.prewarm(); await settle();
  dead.exit(); await settle();
  assert.equal(spare3.state, "none"); assert.equal(await spare3.take(() => true), null);
  // A failed launch: nothing, counted.
  const spare4 = new SpareHost(() => { throw new Error("CEF_PROJECT_RUNTIME_UNAVAILABLE"); }, { observers: null });
  spare4.prewarm(); await settle();
  assert.equal(spare4.state, "none"); assert.equal(spare4.stats.failed, 1);
});

test("memory pressure drops the spare (also one still starting); quit disposes; schedule is idle-deferred, earliest wins", async () => {
  const observers = { added: [], removed: [], addObserver(o, t) { this.added.push(t); }, removeObserver(o, t) { this.removed.push(t); } };
  let release;
  const host = fakeHost("h");
  const spare = new SpareHost(() => new Promise(resolve => { release = () => resolve(host); }), { observers });
  assert.deepEqual(observers.added, ["memory-pressure", "quit-application-granted"]);
  spare.prewarm();
  spare.observe(null, "memory-pressure");
  await settle(); release(); await settle();
  assert.equal(host.shutdowns, 1, "a spare dropped while starting is shut down when it arrives");
  assert.equal(spare.state, "none");
  // schedule: a window timer, then requestIdleCallback; an earlier request replaces a later one.
  const timers = [];
  const win = { setTimeout: (fn, ms) => { timers.push({ fn, ms, cleared: false }); return timers.length; },
    clearTimeout: id => { timers[id - 1].cleared = true; }, requestIdleCallback: fn => fn() };
  let launches = 0;
  const spare2 = new SpareHost(() => { launches++; return fakeHost("x"); }, { observers });
  spare2.schedule(win, 60000);
  spare2.schedule(win, 90000);
  assert.equal(timers.length, 1, "a later request keeps the earlier timer");
  spare2.schedule(win, 1000);
  assert.equal(timers.length, 2); assert.equal(timers[0].cleared, true); assert.equal(timers[1].ms, 1000);
  timers[1].fn(); await settle();
  assert.equal(launches, 1);
  spare2.observe(null, "quit-application-granted");
  assert.equal(spare2.prewarm(), false, "disposed at quit");
  assert.ok(observers.removed.includes("quit-application-granted"));
});

test("the prewarm pref defaults on and can be turned off", () => {
  assert.equal(prewarmWanted(null), true);
  assert.equal(prewarmWanted({ getBoolPref: (name, value) => (name === PREWARM_PREF ? false : value) }), false);
  assert.equal(prewarmWanted({ getBoolPref: () => { throw new Error("no prefs"); } }), true);
});
