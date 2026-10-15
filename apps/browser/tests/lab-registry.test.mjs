/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. https://mozilla.org/MPL/2.0/ */

// The AxioSozo Lab registry (chrome/lab/Lab.sys.mjs): the field rules of one
// experiment, the checked registry (duplicates, variants, families), the real
// list against defaults.yaml and chrome/lab/, the switch prefs and the Lab
// page's list and switch. Everything here is synthetic: made-up experiments,
// in-memory prefs (support/lab-harness.mjs) and a fake platform. No window,
// Gecko pref service or AI client is involved.
import "./support/chrome-modules.mjs";
import test from "node:test";
import assert from "node:assert/strict";
import { existsSync, readFileSync, readdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { fakeLabWindow, fakePrefs } from "./support/lab-harness.mjs";

const Lab = await import("../chrome/lab/Lab.sys.mjs");
const { EXPERIMENT_LIST, LAB_GROUPS } = await import("../chrome/lab/experiments.sys.mjs");
const {
  checkExperiment, buildRegistry, EXPERIMENTS, REGISTRY_PROBLEMS, RESERVED_MODULES, labPref, labIdFromPref, switchOf, isEnabled,
  listForPage, setEnabledFromPage, clearProblemsForTesting, resetLeftoversForTesting, installLab, clientStatusForPage, LabError,
  LAB_NEEDS, LAB_PREF_PREFIX, MAX_HOW_TO_TRY,
} = Lab;

const LAB_DIR = fileURLToPath(new URL("../chrome/lab/", import.meta.url));
const DEFAULTS = readFileSync(new URL("../chrome/defaults.yaml", import.meta.url), "utf8");

// The problem texts checkExperiment reports, one per rule.
const P = {
  object: "an entry is an object",
  id: "id is lowercase words with dashes, at most 40 characters",
  title: "title is one line, at most 60 characters",
  pitch: "pitch is one sentence, at most 200 characters",
  howToTry: "howToTry is 1 to 3 short steps",
  group: `group is one of ${LAB_GROUPS.join(", ")}`,
  variantOf: "variantOf is another experiment's id",
  needs: "needs lists claude-code, codex, antigravity, or only none",
  graduated: "graduated is { pref, default, live } with the feature's existing axiosozo.* pref",
  graduatedModule: "a graduated feature has no Lab module or installer",
  module: "module is a .sys.mjs file under chrome/lab/ (the Lab's own module names are taken)",
  installer: "installer is the export name installSomething",
};

/** A valid experiment, with `overrides` (undefined removes a field). */
function entry(overrides = {}) {
  const value = {
    id: "page-tldr", title: "Page summary", pitch: "Sums up the page you are on in three lines.",
    howToTry: ["Turn it on.", "Open a long article."], group: "AI on the page", needs: ["claude-code"],
    module: "page-tldr.sys.mjs", installer: "installPageTldr", ...overrides,
  };
  for (const [key, item] of Object.entries(overrides)) if (item === undefined) delete value[key];
  return value;
}
/** A valid graduated feature. */
function graduatedEntry(overrides = {}) {
  return entry({ id: "old-feature", module: undefined, installer: undefined,
    graduated: { pref: "axiosozo.oldFeature.enabled", default: true, live: false }, needs: ["none"], ...overrides });
}
const has = (problems, text) => problems.includes(text);

/** Prefs declared in defaults.yaml: name → value (booleans parsed). */
function declaredPrefs(text) {
  const prefs = new Map();
  const lines = text.split("\n");
  for (let at = 0; at < lines.length; at++) {
    const name = /^- name: (\S+)\s*$/u.exec(lines[at]);
    if (!name) continue;
    const value = /^ {2}value: (.+?)\s*$/u.exec(lines[at + 1] ?? "");
    prefs.set(name[1], value ? (value[1] === "true" ? true : value[1] === "false" ? false : value[1]) : undefined);
  }
  return prefs;
}

function fakePlatform() {
  const calls = { cleanLeftovers: 0, statuses: [] };
  const platform = {
    backend: { runTurn: async () => ({ text: "" }) },
    agents: {},
    statuses: async options => { calls.statuses.push(options); return [{ id: "codex", state: "ready" }]; },
    cleanLeftovers: async () => { calls.cleanLeftovers++; },
  };
  return { platform, calls, get: () => platform };
}

test.beforeEach(() => { clearProblemsForTesting(); resetLeftoversForTesting(); });

// ---------------------------------------------------------------- checkExperiment

test("a well-formed experiment and a well-formed graduated feature have no problems", () => {
  assert.deepEqual(checkExperiment(entry()), []);
  assert.deepEqual(checkExperiment(graduatedEntry()), []);
  assert.equal(MAX_HOW_TO_TRY, 3);
  assert.deepEqual([...LAB_NEEDS], ["claude-code", "codex", "antigravity", "none"]);
});

test("an entry that is not a plain object is one problem only", () => {
  for (const value of [null, undefined, [], [entry()], "page-tldr", 5, true]) {
    assert.deepEqual(checkExperiment(value), [P.object], String(value));
  }
});

test("id: lowercase words with single dashes, starting with a letter, at most 40 characters", () => {
  for (const id of ["a", "page-tldr", "a1-b2-c3", "tldr2", `a${"b".repeat(39)}`]) assert.deepEqual(checkExperiment(entry({ id })), [], id);
  for (const id of ["", "Page", "page-Tldr", "1page", "page--tldr", "page-", "-page", "page_tldr", "page.tldr", "page tldr", " page",
    "page/tldr", "../page", `a${"b".repeat(40)}`, "päge", 5, null, ["page"], undefined]) {
    assert.ok(has(checkExperiment(entry({ id })), P.id), String(id));
  }
});

test("title: one trimmed line of 1 to 60 characters", () => {
  for (const title of ["A", "x".repeat(60), "Ask Claude Code about this page"]) assert.deepEqual(checkExperiment(entry({ title })), [], title);
  for (const title of ["", " Leading", "Trailing ", "x".repeat(61), "Two\nlines", "Tab\there", "Bell\u0007", "Del\u007f", 5, null, undefined]) {
    assert.ok(has(checkExperiment(entry({ title })), P.title), JSON.stringify(title));
  }
});

test("pitch: one trimmed line of at most 200 characters ending in . ! or ?", () => {
  for (const pitch of ["Short.", "Really!", "Why not?", `${"x".repeat(199)}.`]) assert.deepEqual(checkExperiment(entry({ pitch })), [], pitch);
  for (const pitch of ["No full stop", "", " Leading space.", "Trailing space. ", `${"x".repeat(200)}.`, "Two\nlines.", "Ends in a colon:",
    5, null, undefined]) {
    assert.ok(has(checkExperiment(entry({ pitch })), P.pitch), JSON.stringify(pitch));
  }
});

test("howToTry: 1 to 3 steps, each one trimmed line of at most 140 characters", () => {
  for (const howToTry of [["One."], ["One.", "Two."], ["One.", "Two.", "Three."], ["x".repeat(140)]]) {
    assert.deepEqual(checkExperiment(entry({ howToTry })), [], JSON.stringify(howToTry));
  }
  for (const howToTry of [[], ["1.", "2.", "3.", "4."], "Turn it on.", ["x".repeat(141)], [""], ["Two\nlines."], [" Lead."], [5], [null],
    null, undefined, { 0: "One.", length: 1 }]) {
    assert.ok(has(checkExperiment(entry({ howToTry })), P.howToTry), JSON.stringify(howToTry));
  }
});

test("group: one of the Lab's groups (or the groups passed in)", () => {
  for (const group of LAB_GROUPS) assert.deepEqual(checkExperiment(entry({ group })), [], group);
  for (const group of ["Elsewhere", "agents", "", null, undefined, LAB_GROUPS]) {
    assert.ok(has(checkExperiment(entry({ group })), P.group), String(group));
  }
  assert.deepEqual(checkExperiment(entry({ group: "Mine" }), { groups: ["Mine"] }), []);
  assert.deepEqual(checkExperiment(entry({ group: "Agents" }), { groups: ["Mine"] }), ["group is one of Mine"]);
});

test("variantOf: absent, null or the shape of an experiment id", () => {
  for (const variantOf of [undefined, null, "other-idea", "a"]) assert.deepEqual(checkExperiment(entry({ variantOf })), [], String(variantOf));
  for (const variantOf of ["Other", "", "a--b", "a b", 5, true, ["other-idea"], {}]) {
    assert.ok(has(checkExperiment(entry({ variantOf })), P.variantOf), JSON.stringify(variantOf));
  }
});

test("needs: some of claude-code, codex, antigravity without repeats, or none alone", () => {
  for (const needs of [["claude-code"], ["codex"], ["antigravity"], ["claude-code", "codex"], ["codex", "claude-code"],
    ["claude-code", "codex", "antigravity"], ["none"]]) {
    assert.deepEqual(checkExperiment(entry({ needs })), [], JSON.stringify(needs));
  }
  for (const needs of [[], ["none", "codex"], ["codex", "none"], ["none", "none"], ["codex", "codex"], ["gpt"], ["Claude-Code"], [null],
    "codex", "none", null, undefined, { 0: "codex" }]) {
    assert.ok(has(checkExperiment(entry({ needs })), P.needs), JSON.stringify(needs));
  }
});

test("module: a .sys.mjs file directly in chrome/lab/ or in one lowercase folder there", () => {
  for (const module of ["page-tldr.sys.mjs", "PageTldr.sys.mjs", "page_tldr.sys.mjs", "page-tldr/page-tldr.sys.mjs", "v2/Card.sys.mjs",
    "2up.sys.mjs"]) {
    assert.deepEqual(checkExperiment(entry({ module })), [], module);
  }
  for (const module of ["page-tldr.mjs", "page-tldr.sys.js", "page-tldr.js", ".sys.mjs", "../page-tldr.sys.mjs", "./page-tldr.sys.mjs",
    "/abs/page-tldr.sys.mjs", "a/b/c.sys.mjs", "Sub/page.sys.mjs", "-page.sys.mjs", "_page.sys.mjs", "page tldr.sys.mjs",
    "chrome://browser/content/axiosozo/lab/page.sys.mjs", "resource://gre/modules/Subprocess.sys.mjs", "page.sys.mjs?v=1",
    "page.sys.mjs#x", "page.sys.mjs\n", "sub//page.sys.mjs", "sub\\page.sys.mjs", "", 5, null, undefined]) {
    assert.ok(has(checkExperiment(entry({ module })), P.module), JSON.stringify(module));
  }
});

test("module: every one of the Lab's own module names is refused", () => {
  assert.ok(RESERVED_MODULES.size >= 10);
  assert.ok(Object.isFrozen(RESERVED_MODULES));
  for (const module of RESERVED_MODULES) {
    assert.deepEqual(checkExperiment(entry({ module })), [P.module], module);
  }
  // The same name inside an experiment's own folder is a different file.
  assert.deepEqual(checkExperiment(entry({ module: "page-tldr/kit.sys.mjs" })), []);
});

test("RESERVED_MODULES names every .sys.mjs file of the Lab itself in chrome/lab/", () => {
  const own = new Set(EXPERIMENTS.filter(item => item.module && !item.module.includes("/")).map(item => item.module));
  const files = readdirSync(LAB_DIR).filter(name => name.endsWith(".sys.mjs") && !own.has(name)).sort();
  assert.deepEqual(files, [...RESERVED_MODULES].sort(), "a new Lab module must be added to RESERVED_MODULES");
  for (const name of RESERVED_MODULES) assert.ok(existsSync(`${LAB_DIR}${name}`), `${name} exists`);
});

test("installer: the export name install<Something>", () => {
  for (const installer of ["installPageTldr", "installX", "installA1", "installPageTLDR2"]) {
    assert.deepEqual(checkExperiment(entry({ installer })), [], installer);
  }
  for (const installer of ["install", "installpage", "install_Page", "install-page", "InstallPage", "setupPage", "default", "installPage()",
    " installPage", "installPage.x", "", 5, null, undefined]) {
    assert.ok(has(checkExperiment(entry({ installer })), P.installer), JSON.stringify(installer));
  }
});

test("graduated: exactly { pref, default, live } with an existing axiosozo.* pref outside the Lab's own", () => {
  for (const graduated of [
    { pref: "axiosozo.x.enabled", default: true, live: true },
    { pref: "axiosozo.regionCapture.enabled", default: false, live: false },
    { pref: "axiosozo.a1.b2", default: true, live: false },
  ]) {
    assert.deepEqual(checkExperiment(graduatedEntry({ graduated })), [], JSON.stringify(graduated));
  }
  const good = { pref: "axiosozo.oldFeature.enabled", default: true, live: false };
  for (const graduated of [
    null, true, "axiosozo.oldFeature.enabled", [], {},
    { default: true, live: false },
    { ...good, pref: "browser.oldFeature.enabled" },
    { ...good, pref: "axiosozo." },
    { ...good, pref: "axiosozo.lab.old-feature.enabled" },
    { ...good, pref: "axiosozo.old feature" },
    { ...good, pref: "axiosozo.old-feature.enabled" },
    { ...good, pref: 5 },
    { ...good, default: "true" },
    { ...good, default: undefined },
    { ...good, live: 1 },
    { ...good, live: undefined },
    { ...good, module: "x.sys.mjs" },
    { ...good, extra: true },
  ]) {
    assert.ok(has(checkExperiment(graduatedEntry({ graduated })), P.graduated), JSON.stringify(graduated));
  }
});

test("a graduated feature has no Lab module or installer, and needs neither", () => {
  assert.deepEqual(checkExperiment(graduatedEntry({ module: "old-feature.sys.mjs" })), [P.graduatedModule]);
  assert.deepEqual(checkExperiment(graduatedEntry({ installer: "installOldFeature" })), [P.graduatedModule]);
  assert.deepEqual(checkExperiment(graduatedEntry({ module: "old-feature.sys.mjs", installer: "installOldFeature" })), [P.graduatedModule]);
  // A broken graduated shape is still never asked for a module.
  const problems = checkExperiment(graduatedEntry({ graduated: null }));
  assert.deepEqual(problems, [P.graduated]);
  // Without graduated, module and installer are required.
  assert.deepEqual(checkExperiment(entry({ module: undefined, installer: undefined })), [P.module, P.installer]);
});

test("unknown fields are each reported, alongside the other problems", () => {
  assert.deepEqual(checkExperiment(entry({ enabled: true })), ['unknown field "enabled"']);
  const problems = checkExperiment(entry({ pref: "axiosozo.lab.x.enabled", path: "/tmp/x", title: "" }));
  assert.ok(has(problems, 'unknown field "pref"'));
  assert.ok(has(problems, 'unknown field "path"'));
  assert.ok(has(problems, P.title));
  assert.equal(problems.length, 3);
  // Every problem of a thoroughly broken entry is listed, not just the first.
  assert.deepEqual(checkExperiment({ id: "X", needs: [] }),
    [P.id, P.title, P.pitch, P.howToTry, P.group, P.needs, P.module, P.installer]);
});

// ---------------------------------------------------------------- buildRegistry

test("buildRegistry freezes plain descriptors with variantOf, family and copies of the lists", () => {
  const source = [entry(), graduatedEntry()];
  const registry = buildRegistry(source);
  assert.deepEqual(registry.problems, []);
  assert.ok(Object.isFrozen(registry) && Object.isFrozen(registry.experiments) && Object.isFrozen(registry.problems));
  const [experiment, graduated] = registry.experiments;
  assert.deepEqual({ ...experiment, howToTry: [...experiment.howToTry], needs: [...experiment.needs] }, {
    id: "page-tldr", title: "Page summary", pitch: "Sums up the page you are on in three lines.", howToTry: ["Turn it on.", "Open a long article."],
    group: "AI on the page", variantOf: null, family: "page-tldr", needs: ["claude-code"], module: "page-tldr.sys.mjs",
    installer: "installPageTldr", graduated: null,
  });
  assert.ok(Object.isFrozen(experiment) && Object.isFrozen(experiment.howToTry) && Object.isFrozen(experiment.needs));
  assert.equal(graduated.module, null);
  assert.equal(graduated.installer, null);
  assert.deepEqual({ ...graduated.graduated }, { pref: "axiosozo.oldFeature.enabled", default: true, live: false });
  assert.ok(Object.isFrozen(graduated.graduated));
  // Changing the source list afterwards changes nothing.
  source[0].howToTry.push("Three.");
  source[0].needs.push("codex");
  source[1].graduated.default = false;
  assert.equal(experiment.howToTry.length, 2);
  assert.deepEqual([...experiment.needs], ["claude-code"]);
  assert.equal(graduated.graduated.default, true);
});

test("buildRegistry leaves out a broken entry and a duplicate id, naming each, and keeps the rest", () => {
  const registry = buildRegistry([
    entry({ id: "first" }),
    entry({ id: "first", title: "Second with the same id" }),
    entry({ id: "bad", pitch: "no full stop" }),
    { title: "No id at all" },
    null,
    entry({ id: "last" }),
  ]);
  assert.deepEqual(registry.experiments.map(item => [item.id, item.title]), [["first", "Page summary"], ["last", "Page summary"]]);
  assert.ok(registry.problems.includes("first: the id is already used"));
  assert.ok(registry.problems.includes(`bad: ${P.pitch}`));
  assert.ok(registry.problems.some(problem => problem.startsWith("entry 4: ")), "an entry without an id is named by its place");
  assert.ok(registry.problems.includes(`entry 5: ${P.object}`));
  // A duplicate of an entry that was itself left out is not a duplicate.
  const again = buildRegistry([entry({ id: "x", title: "" }), entry({ id: "x" })]);
  assert.deepEqual(again.experiments.map(item => item.id), ["x"]);
  assert.deepEqual(again.problems, [`x: ${P.title}`]);
});

test("buildRegistry: a list that is not an array is an empty registry", () => {
  for (const list of [undefined, null, {}, "x", 5]) {
    const registry = buildRegistry(list);
    assert.deepEqual([[...registry.experiments], [...registry.problems]], [[], []], String(list));
  }
});

test("buildRegistry keeps an experiment with an unknown or own variantOf on its own, with a problem", () => {
  const registry = buildRegistry([
    entry({ id: "orphan", variantOf: "missing-idea" }),
    entry({ id: "self", variantOf: "self" }),
    entry({ id: "dropped", title: "" }),
    entry({ id: "of-dropped", variantOf: "dropped" }),
  ]);
  const byId = Object.fromEntries(registry.experiments.map(item => [item.id, item]));
  for (const id of ["orphan", "self", "of-dropped"]) {
    assert.equal(byId[id].variantOf, null, id);
    assert.equal(byId[id].family, id, id);
    assert.ok(registry.problems.includes(`${id}: variantOf names no other experiment`), id);
  }
  assert.equal(byId.dropped, undefined);
});

test("buildRegistry finds a variantOf cycle and keeps those experiments on their own", () => {
  const two = buildRegistry([entry({ id: "a", variantOf: "b" }), entry({ id: "b", variantOf: "a" })]);
  assert.deepEqual(two.experiments.map(item => [item.id, item.variantOf, item.family]), [["a", null, "a"], ["b", null, "b"]]);
  assert.deepEqual([...two.problems], ["a: variantOf goes round in a circle", "b: variantOf goes round in a circle"]);
  const three = buildRegistry([entry({ id: "a", variantOf: "c" }), entry({ id: "b", variantOf: "a" }), entry({ id: "c", variantOf: "b" }),
    entry({ id: "d", variantOf: "a" })]);
  assert.deepEqual(three.experiments.map(item => [item.id, item.variantOf, item.family]),
    [["a", null, "a"], ["b", null, "b"], ["c", null, "c"], ["d", null, "d"]]);
  for (const id of ["a", "b", "c", "d"]) assert.ok(three.problems.includes(`${id}: variantOf goes round in a circle`), id);
});

test("buildRegistry computes the family through a chain of variants, in any list order", () => {
  const registry = buildRegistry([
    entry({ id: "c", variantOf: "b" }),
    entry({ id: "b", variantOf: "a" }),
    entry({ id: "a" }),
    entry({ id: "z" }),
    entry({ id: "y", variantOf: "z" }),
  ]);
  assert.deepEqual(registry.problems, []);
  assert.deepEqual(registry.experiments.map(item => [item.id, item.variantOf, item.family]),
    [["c", "b", "a"], ["b", "a", "a"], ["a", null, "a"], ["z", null, "z"], ["y", "z", "z"]]);
});

// ---------------------------------------------------------------- the real list

test("the real experiment list has no problems and nothing is left out", () => {
  assert.deepEqual([...REGISTRY_PROBLEMS], []);
  assert.equal(EXPERIMENTS.length, EXPERIMENT_LIST.length);
  assert.deepEqual(EXPERIMENTS.map(item => item.id), EXPERIMENT_LIST.map(item => item.id));
  assert.ok(Object.isFrozen(EXPERIMENT_LIST));
  // Groups are short enough for the actor's reply (labReply keeps up to 40 characters).
  for (const group of LAB_GROUPS) assert.ok(typeof group === "string" && group.length >= 1 && group.length <= 40, group);
  assert.equal(new Set(LAB_GROUPS).size, LAB_GROUPS.length);
});

test("every real experiment's switch is declared off in defaults.yaml and its module is in chrome/lab/", () => {
  const declared = declaredPrefs(DEFAULTS);
  for (const experiment of EXPERIMENTS.filter(item => !item.graduated)) {
    assert.equal(declared.get(labPref(experiment.id)), false, `${labPref(experiment.id)} is declared value: false`);
    assert.ok(existsSync(`${LAB_DIR}${experiment.module}`), `chrome/lab/${experiment.module} exists`);
  }
  // A graduated feature keeps its own pref, declared with the default the Lab lists.
  for (const experiment of EXPERIMENTS.filter(item => item.graduated)) {
    assert.equal(declared.get(experiment.graduated.pref), experiment.graduated.default, experiment.graduated.pref);
  }
  // No Lab switch is declared without its experiment, and none is on by default.
  const ids = new Set(EXPERIMENTS.filter(item => !item.graduated).map(item => item.id));
  for (const [name, value] of declared) {
    if (!name.startsWith(LAB_PREF_PREFIX)) continue;
    assert.equal(value, false, `${name} is off by default`);
    assert.ok(ids.has(labIdFromPref(name)), `${name} belongs to a listed experiment`);
  }
});

// ---------------------------------------------------------------- switches

test("labPref and labIdFromPref round-trip, and foreign pref names are no experiment", () => {
  for (const id of ["a", "page-tldr", `a${"b".repeat(39)}`]) {
    assert.equal(labPref(id), `axiosozo.lab.${id}.enabled`);
    assert.equal(labIdFromPref(labPref(id)), id);
  }
  for (const name of ["axiosozo.regionCapture.enabled", "axiosozo.lab.enabled", "axiosozo.lab..enabled", "axiosozo.lab.Page.enabled",
    "axiosozo.lab.page-tldr.enabledx", "axiosozo.lab.page-tldr.enabled.x", "axiosozo.lab.page-tldr", "axiosozo.lab.a.b.enabled",
    "axiosozo.lab.page_tldr.enabled", `axiosozo.lab.a${"b".repeat(40)}.enabled`, "xaxiosozo.lab.page-tldr.enabled",
    "browser.lab.page-tldr.enabled", "", null, undefined, 5, {}]) {
    assert.equal(labIdFromPref(name), null, String(name));
  }
});

test("switchOf and isEnabled: a Lab switch is off when unset; a graduated one uses its own pref and default", () => {
  const [experiment, graduated] = buildRegistry([entry(), graduatedEntry()]).experiments;
  assert.deepEqual(switchOf(experiment), { pref: "axiosozo.lab.page-tldr.enabled", fallback: false });
  assert.deepEqual(switchOf(graduated), { pref: "axiosozo.oldFeature.enabled", fallback: true });
  const prefs = fakePrefs();
  assert.equal(isEnabled(experiment, prefs), false);
  assert.equal(isEnabled(graduated, prefs), true);
  prefs.store.set("axiosozo.lab.page-tldr.enabled", true);
  prefs.store.set("axiosozo.oldFeature.enabled", false);
  assert.equal(isEnabled(experiment, prefs), true);
  assert.equal(isEnabled(graduated, prefs), false);
  // An unreadable pref is its default.
  prefs.store.set("axiosozo.lab.page-tldr.enabled", "yes");
  assert.equal(isEnabled(experiment, prefs), false);
  const throwing = { getBoolPref() { throw new Error("NS_ERROR_UNEXPECTED"); } };
  assert.equal(isEnabled(experiment, throwing), false);
  assert.equal(isEnabled(graduated, throwing), true);
  assert.equal(isEnabled(graduated, { getBoolPref: () => 1 }), true);
  assert.equal(isEnabled(experiment, null), false);
  assert.equal(isEnabled(graduated, undefined), true);
});

// ---------------------------------------------------------------- the Lab page's list

const SAMPLE = buildRegistry([
  entry({ id: "page-tldr" }),
  entry({ id: "page-tldr-cards", title: "Summary cards", variantOf: "page-tldr", needs: ["codex"], module: "page-tldr-cards.sys.mjs",
    installer: "installPageTldrCards" }),
  entry({ id: "day-plan", title: "Plan my day", group: "Your day", needs: ["none"], module: "day-plan.sys.mjs", installer: "installDayPlan" }),
  graduatedEntry({ id: "old-feature", group: "Projects" }),
]).experiments;

test("listForPage lists every experiment with its switch from the prefs, graduated ones with their own", () => {
  const prefs = fakePrefs({ "axiosozo.lab.page-tldr-cards.enabled": true, "axiosozo.oldFeature.enabled": false });
  const list = listForPage({ prefs, experiments: SAMPLE });
  assert.equal(list.version, 1);
  assert.deepEqual(list.groups, [...LAB_GROUPS]);
  assert.notEqual(list.groups, LAB_GROUPS, "a copy");
  assert.deepEqual(list.experiments.map(item => Object.keys(item)),
    SAMPLE.map(() => ["id", "title", "pitch", "howToTry", "group", "variantOf", "family", "needs", "graduated", "live", "enabled", "problem"]));
  assert.deepEqual(list.experiments.map(item => [item.id, item.variantOf, item.family, item.graduated, item.live, item.enabled, item.problem]), [
    ["page-tldr", null, "page-tldr", false, true, false, null],
    ["page-tldr-cards", "page-tldr", "page-tldr", false, true, true, null],
    ["day-plan", null, "day-plan", false, true, false, null],
    ["old-feature", null, "old-feature", true, false, false, null],
  ]);
  assert.deepEqual(list.experiments[1].needs, ["codex"]);
  // Nothing about where an experiment lives reaches the page.
  assert.doesNotMatch(JSON.stringify(list), /sys\.mjs|install[A-Z]|axiosozo\./u);
  // A graduated feature is on by its default while its pref is unset.
  assert.equal(listForPage({ prefs: fakePrefs(), experiments: SAMPLE }).experiments[3].enabled, true);
  // The answer is a copy: changing it changes no descriptor.
  list.experiments[0].howToTry.push("Extra.");
  list.experiments[0].needs.push("codex");
  assert.equal(SAMPLE[0].howToTry.length, 2);
  assert.deepEqual(listForPage({ prefs, experiments: SAMPLE, groups: ["Only"] }).groups, ["Only"]);
});

test("listForPage defaults to the real registry", () => {
  const list = listForPage({ prefs: fakePrefs() });
  assert.deepEqual(list.experiments.map(item => item.id), EXPERIMENTS.map(item => item.id));
  assert.deepEqual(list.groups, [...LAB_GROUPS]);
});

test("listForPage shows the code of a failure seen in a window, never for a graduated feature", async t => {
  t.mock.method(console, "error", () => {});
  const failing = buildRegistry([
    entry({ id: "page-tldr" }),
    entry({ id: "day-plan", module: "day-plan.sys.mjs", installer: "installDayPlan", group: "Your day" }),
    graduatedEntry(),
  ]).experiments;
  const prefs = fakePrefs({ "axiosozo.lab.page-tldr.enabled": true, "axiosozo.lab.day-plan.enabled": true });
  const h = fakeLabWindow();
  const handle = installLab(h.window, { adapter: h.adapter, prefs, experiments: failing, platform: fakePlatform().get,
    load: item => (item.id === "page-tldr" ? { installPageTldr() { throw new Error("synthetic"); } } : {}) });
  const problems = listForPage({ prefs, experiments: failing }).experiments.map(item => [item.id, item.problem]);
  assert.deepEqual(problems, [["page-tldr", "INSTALL_FAILED"], ["day-plan", "INSTALLER_MISSING"], ["old-feature", null]]);
  // A closed window's failures go with it.
  handle.dispose();
  assert.deepEqual(listForPage({ prefs, experiments: failing }).experiments.map(item => item.problem), [null, null, null]);
});

// ---------------------------------------------------------------- the Lab page's switch

test("setEnabledFromPage writes only the experiment's own switch and answers with the new list", () => {
  const prefs = fakePrefs();
  const list = setEnabledFromPage("day-plan", true, { prefs, experiments: SAMPLE });
  assert.deepEqual(prefs.writes, [["axiosozo.lab.day-plan.enabled", true]]);
  assert.deepEqual(list, listForPage({ prefs, experiments: SAMPLE }));
  assert.equal(list.experiments.find(item => item.id === "day-plan").enabled, true);
  setEnabledFromPage("day-plan", false, { prefs, experiments: SAMPLE });
  assert.deepEqual(prefs.writes.at(-1), ["axiosozo.lab.day-plan.enabled", false]);
  // A graduated feature flips its own existing pref.
  setEnabledFromPage("old-feature", false, { prefs, experiments: SAMPLE });
  assert.deepEqual(prefs.writes.at(-1), ["axiosozo.oldFeature.enabled", false]);
  assert.equal(listForPage({ prefs, experiments: SAMPLE }).experiments[3].enabled, false);
});

test("setEnabledFromPage: turning one variant on turns the rest of its family off first, and nothing else", () => {
  const family = buildRegistry([
    entry({ id: "a" }),
    entry({ id: "b", variantOf: "a" }),
    entry({ id: "c", variantOf: "b" }),
    entry({ id: "other" }),
    graduatedEntry({ id: "grad", variantOf: "a" }),
  ]).experiments;
  assert.deepEqual(family.map(item => item.family), ["a", "a", "a", "other", "a"]);
  const prefs = fakePrefs({ "axiosozo.lab.b.enabled": true, "axiosozo.lab.other.enabled": true });
  const list = setEnabledFromPage("c", true, { prefs, experiments: family });
  assert.deepEqual(prefs.writes, [["axiosozo.lab.b.enabled", false], ["axiosozo.lab.c.enabled", true]], "the sibling goes off before");
  assert.deepEqual(list.experiments.map(item => [item.id, item.enabled]), [["a", false], ["b", false], ["c", true], ["other", true], ["grad", true]]);
  prefs.writes.length = 0;
  setEnabledFromPage("a", true, { prefs, experiments: family });
  assert.deepEqual(prefs.writes, [["axiosozo.lab.c.enabled", false], ["axiosozo.lab.a.enabled", true]]);
  // Turning one off touches its siblings not at all; neither does a graduated feature.
  prefs.writes.length = 0;
  setEnabledFromPage("a", false, { prefs, experiments: family });
  setEnabledFromPage("grad", true, { prefs, experiments: family });
  assert.deepEqual(prefs.writes, [["axiosozo.lab.a.enabled", false], ["axiosozo.oldFeature.enabled", true]]);
});

test("setEnabledFromPage refuses an unknown id, a non-boolean and missing prefs with fixed codes, writing nothing", () => {
  const prefs = fakePrefs();
  for (const id of ["missing", "PAGE-TLDR", "", null, undefined, 5, { id: "page-tldr" }, ["page-tldr"]]) {
    assert.throws(() => setEnabledFromPage(id, true, { prefs, experiments: SAMPLE }),
      error => error instanceof LabError && error.code === "UNKNOWN_EXPERIMENT", String(id));
  }
  // The id is checked before the value.
  assert.throws(() => setEnabledFromPage("missing", "yes", { prefs, experiments: SAMPLE }), { code: "UNKNOWN_EXPERIMENT" });
  for (const enabled of ["true", 1, 0, null, undefined, {}]) {
    assert.throws(() => setEnabledFromPage("page-tldr", enabled, { prefs, experiments: SAMPLE }),
      error => error instanceof LabError && error.code === "INVALID_PARAMS", String(enabled));
  }
  for (const without of [null, undefined, {}, { getBoolPref: () => false }, { setBoolPref: "no" }]) {
    assert.throws(() => setEnabledFromPage("page-tldr", true, { prefs: without, experiments: SAMPLE }),
      error => error instanceof LabError && error.code === "UNAVAILABLE");
  }
  assert.deepEqual(prefs.writes, []);
  // The real registry knows no made-up experiment.
  assert.throws(() => setEnabledFromPage("page-tldr", true, { prefs }), { code: "UNKNOWN_EXPERIMENT" });
  const error = new LabError("UNAVAILABLE", "why");
  assert.deepEqual([error.name, error.code, error.message], ["LabError", "UNAVAILABLE", "why"]);
  assert.equal(new LabError("X").message, "X");
});

test("setEnabledFromPage starts afresh: either toggle clears a stale problem, and what the windows report meanwhile is in its answer", t => {
  t.mock.method(console, "error", () => {});
  let mode = "throw-install";
  const module = { installPageTldr() {
    if (mode === "throw-install") throw new Error("synthetic install failure");
    return { dispose() { if (mode === "throw-dispose") throw new Error("synthetic clean-up failure"); } };
  } };
  const prefs = fakePrefs({ "axiosozo.lab.page-tldr.enabled": true });
  const h = fakeLabWindow();
  const handle = installLab(h.window, { adapter: h.adapter, prefs, experiments: SAMPLE, platform: fakePlatform().get, load: () => module });
  const problemOf = list => list.experiments.find(item => item.id === "page-tldr").problem;
  const switchTo = enabled => problemOf(setEnabledFromPage("page-tldr", enabled, { prefs, experiments: SAMPLE }));
  try {
    assert.equal(problemOf(listForPage({ prefs, experiments: SAMPLE })), "INSTALL_FAILED", "the window could not start it");
    // Off: the stale failure goes (nothing ran, so nothing failed now).
    assert.equal(switchTo(false), null);
    // A stale failure left while it is off (turned on and off outside the Lab page) goes when it is turned on again and starts.
    prefs.setBoolPref("axiosozo.lab.page-tldr.enabled", true);
    prefs.setBoolPref("axiosozo.lab.page-tldr.enabled", false);
    assert.equal(problemOf(listForPage({ prefs, experiments: SAMPLE })), "INSTALL_FAILED");
    mode = "ok";
    assert.equal(switchTo(true), null);
    assert.equal(handle.isInstalled("page-tldr"), true);
    // Failures during the toggle itself are in the answer: a clean-up that throws on off ...
    mode = "throw-dispose";
    assert.equal(switchTo(false), "DISPOSE_FAILED");
    assert.equal(handle.isInstalled("page-tldr"), false);
    // ... (gone again with the next fresh start) and an install that throws on on.
    mode = "throw-install";
    assert.equal(switchTo(true), "INSTALL_FAILED");
  } finally { handle.dispose(); }
});

test("setEnabledFromPage: a clean-up that fails while the Lab page turns the experiment off stays visible on the page", t => {
  t.mock.method(console, "error", () => {});
  const prefs = fakePrefs({ "axiosozo.lab.page-tldr.enabled": true });
  const h = fakeLabWindow();
  const handle = installLab(h.window, { adapter: h.adapter, prefs, experiments: SAMPLE, platform: fakePlatform().get,
    load: () => ({ installPageTldr: () => ({ dispose() { throw new Error("synthetic clean-up failure"); } }) }) });
  try {
    assert.equal(handle.isInstalled("page-tldr"), true);
    const list = setEnabledFromPage("page-tldr", false, { prefs, experiments: SAMPLE });
    assert.equal(handle.isInstalled("page-tldr"), false);
    assert.equal(list.experiments.find(item => item.id === "page-tldr").problem, "DISPOSE_FAILED");
    assert.equal(listForPage({ prefs, experiments: SAMPLE }).experiments.find(item => item.id === "page-tldr").problem, "DISPOSE_FAILED",
      "and on the next read");
  } finally { handle.dispose(); }
});

test("setEnabledFromPage clears the experiment's problems in every window, and only that experiment's", t => {
  t.mock.method(console, "error", () => {});
  const prefs = fakePrefs({ "axiosozo.lab.page-tldr.enabled": true, "axiosozo.lab.day-plan.enabled": true });
  const throwing = { installPageTldr() { throw new Error("synthetic"); }, installDayPlan() { throw new Error("synthetic"); } };
  const handles = [fakeLabWindow(), fakeLabWindow()].map(h => installLab(h.window, { adapter: h.adapter, prefs, experiments: SAMPLE,
    platform: fakePlatform().get, load: () => throwing }));
  try {
    const problems = list => Object.fromEntries(list.experiments.map(item => [item.id, item.problem]));
    assert.deepEqual(problems(listForPage({ prefs, experiments: SAMPLE })),
      { "page-tldr": "INSTALL_FAILED", "page-tldr-cards": null, "day-plan": "INSTALL_FAILED", "old-feature": null });
    assert.deepEqual(problems(setEnabledFromPage("page-tldr", false, { prefs, experiments: SAMPLE })),
      { "page-tldr": null, "page-tldr-cards": null, "day-plan": "INSTALL_FAILED", "old-feature": null });
  } finally { for (const handle of handles) handle.dispose(); }
});

// ---------------------------------------------------------------- assistants

test("clientStatusForPage asks the platform, checking only for check: true", async () => {
  const fake = fakePlatform();
  assert.deepEqual(await clientStatusForPage({ platform: fake.platform }), [{ id: "codex", state: "ready" }]);
  await clientStatusForPage({ check: true, platform: fake.platform });
  await clientStatusForPage({ check: "yes", platform: fake.platform });
  await clientStatusForPage({ check: 1, platform: fake.platform });
  assert.deepEqual(fake.calls.statuses, [{ check: false }, { check: true }, { check: false }, { check: false }]);
  assert.equal(fake.calls.cleanLeftovers, 0, "a status read clears nothing");
});
