/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. https://mozilla.org/MPL/2.0/ */

// P2 presentation and expectation helpers (ProjectAccountRuntime) over the
// real contexts core with synthetic project records. No identity is created,
// no tab is opened and nothing here reads cookies or account names.
import test from "node:test";
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import * as core from "../../../packages/contexts/src/index.mjs";
import { CONTAINER_COLOR_NAMES, PROJECT_CONTAINER_ICON, canonicalContainerColor, containerIndicator, expectedContainer,
  identityColorClass, projectContainerPresentation, tabFits } from "../chrome/ProjectAccountRuntime.sys.mjs";

const NOW = 1790935200000;
const record = (id = "p_alpha", over = {}) => core.validateProject({
  ...core.upgradeProject({ version: 1, id, root: `/synthetic/${id}`, manifest: { version: 1, name: "  Harbor Suite ", kind: "web",
    environments: [{ name: "local", base_url: "http://localhost:5101" }], services: [], surfaces: [] },
    manifest_state: "none", context_uuid: null, trusted: false, created_at: NOW, updated_at: NOW }),
  ...over,
});
const withContainer = (value, id) => core.validateProject({ ...value, container: { user_context_id: id } });
const identities = map => id => map[id] ?? null;
const live = (id, color = "cyan", name = "Harbor Suite") => ({ userContextId: id, name, color });

test("colours: Firefox's canonical names only; the core's legacy turquoise is cyan at this seam", () => {
  assert.equal(canonicalContainerColor("turquoise"), "cyan");
  assert.equal(canonicalContainerColor("toolbar"), "gray");
  for (const name of CONTAINER_COLOR_NAMES) assert.equal(canonicalContainerColor(name), name);
  for (const bad of ["Turquoise", "magenta", "", null, 3, "constructor", "__proto__", "toString"]) assert.equal(canonicalContainerColor(bad), null, String(bad));
  assert.equal(identityColorClass("turquoise"), "identity-color-cyan");
  assert.equal(identityColorClass("javascript:x"), null);
});

test("colours match the pinned ContextualIdentityService when its source is available", t => {
  const source = "/Volumes/AxioSozoBuild/workstation/zen/source/engine/toolkit/components/contextualidentity/ContextualIdentityService.sys.mjs";
  if (!existsSync(source)) { t.skip("pinned Gecko source is not mounted; canonical list not compared"); return; }
  const text = readFileSync(source, "utf8");
  const block = text.slice(text.indexOf("export const CONTAINER_COLORS"), text.indexOf("export const CONTAINER_COLOR_ALIASES"));
  assert.deepEqual([...block.matchAll(/name: "([a-z]+)"/gu)].map(match => match[1]), [...CONTAINER_COLOR_NAMES]);
  assert.match(text, /turquoise: "cyan"/u);
});

test("a project's container is named after the project, with the briefcase and a canonical colour", () => {
  const ids = Array.from({ length: 40 }, (_, i) => `p_synthetic${String(i).padStart(2, "0")}`);
  const legacy = ids.find(id => core.projectContainerStyle(id).color === "turquoise");
  assert.ok(legacy, "the fixture covers a project whose core colour is turquoise");
  for (const id of ids) {
    const spec = projectContainerPresentation(core, record(id));
    assert.deepEqual(Object.keys(spec), ["name", "icon", "color"]);
    assert.equal(spec.name, "Harbor Suite");
    assert.equal(spec.icon, PROJECT_CONTAINER_ICON);
    assert.ok(CONTAINER_COLOR_NAMES.includes(spec.color), spec.color);
    assert.notEqual(spec.color, "turquoise");
    assert.ok(Object.isFrozen(spec));
  }
  assert.equal(projectContainerPresentation(core, record(legacy)).color, "cyan");
  assert.throws(() => projectContainerPresentation(core, { id: "p_alpha" }));
});

test("expectation: off, not web, pending, own container; never a dead, foreign or duplicated ID", () => {
  const p = withContainer(record(), 40);
  const base = { core, project: p, projects: [p], url: "https://vercel.com/team/harbor", defaultUserContextId: 2, identity: identities({ 40: live(40) }), enabled: true };
  assert.deepEqual(expectedContainer({ ...base, enabled: false }), { state: "off" });
  assert.deepEqual(expectedContainer({ ...base, defaultUserContextId: 4294967295 }), { state: "off" });
  assert.deepEqual(expectedContainer({ ...base, url: "about:blank" }), { state: "none" });
  assert.deepEqual(expectedContainer(base), { state: "project", userContextId: 40, identity: live(40) });
  assert.deepEqual(expectedContainer({ ...base, project: record() }), { state: "pending" }, "no container yet");
  assert.deepEqual(expectedContainer({ ...base, identity: identities({}) }), { state: "pending" }, "deleted identity");
  assert.deepEqual(expectedContainer({ ...base, identity: () => live(41) }), { state: "pending" }, "a reply for another ID");
  assert.deepEqual(expectedContainer({ ...base, identity: () => { throw new Error("gone"); } }), { state: "pending" });
  const twin = withContainer(record("p_beta"), 40);
  assert.deepEqual(expectedContainer({ ...base, projects: [p, twin] }), { state: "pending" }, "two projects never share a jar");
  assert.deepEqual(expectedContainer({ ...base, project: { id: "p_alpha", container: { user_context_id: 40 } } }), { state: "none" }, "invalid records claim nothing");
});

test("expectation: suggested shared sites stay in the project; confirmed ones use the space default", () => {
  const p = withContainer(record(), 40);
  const opts = { core, projects: [p], defaultUserContextId: 2, identity: identities({ 40: live(40) }), enabled: true };
  assert.equal(p.shared_sites.confirmed, false);
  assert.equal(expectedContainer({ ...opts, project: p, url: "https://github.com/acme/app" }).state, "project");
  const confirmed = core.validateProject({ ...p, shared_sites: { hosts: ["github.com", "*.github.com"], confirmed: true } });
  assert.deepEqual(expectedContainer({ ...opts, project: confirmed, url: "https://gist.github.com/x" }), { state: "shared_site", userContextId: 2 });
  assert.equal(expectedContainer({ ...opts, project: confirmed, url: "https://evilgithub.com/x" }).state, "project");
  const fresh = core.validateProject({ ...record(), shared_sites: { hosts: ["github.com"], confirmed: true } });
  assert.deepEqual(expectedContainer({ ...opts, project: fresh, url: "https://github.com/x" }), { state: "shared_site", userContextId: 2 });
  assert.deepEqual(expectedContainer({ ...opts, project: fresh, url: "https://vercel.com/" }), { state: "pending" });
});

test("a tab fits only the container it was loaded in; unknown or pending never fit", () => {
  assert.equal(tabFits({ state: "off" }, null), true, "containers off: any tab, like before");
  assert.equal(tabFits({ state: "project", userContextId: 40 }, 40), true);
  assert.equal(tabFits({ state: "project", userContextId: 40 }, 0), false);
  assert.equal(tabFits({ state: "project", userContextId: 40 }, null), false);
  assert.equal(tabFits({ state: "shared_site", userContextId: 2 }, 2), true);
  assert.equal(tabFits({ state: "shared_site", userContextId: 0 }, 40), false);
  assert.equal(tabFits({ state: "pending" }, 0), false);
  assert.equal(tabFits({ state: "none" }, 0), false);
  assert.equal(tabFits({ state: "project", userContextId: 40 }, 4294967295), false);
});

test("pill indicator: quiet without containers; in, elsewhere and pending in plain words with Firefox's colour", () => {
  const expected = { state: "project", userContextId: 40, identity: live(40, "cyan", "Harbor Suite") };
  const quiet = { color: null, phrase: "", info: null, action: null };
  assert.deepEqual(containerIndicator({ projectName: "Harbor Suite", expected: { state: "off" }, tabUserContextId: 0 }), quiet);
  assert.deepEqual(containerIndicator({ projectName: "Harbor Suite", expected, tabUserContextId: null }), quiet, "unknown tab: no claim");
  assert.deepEqual(containerIndicator({ projectName: "Harbor Suite", expected, tabUserContextId: 40, tabIdentity: live(40) }),
    { color: "cyan", phrase: ", in the Harbor Suite container", info: "In the Harbor Suite container", action: null });
  assert.deepEqual(containerIndicator({ projectName: "Harbor Suite", expected, tabUserContextId: 0 }),
    { color: null, phrase: ", not in the Harbor Suite container", info: null, action: { label: "Reopen in the Harbor Suite container", color: "cyan" } });
  assert.deepEqual(containerIndicator({ projectName: "Harbor Suite", expected, tabUserContextId: 7, tabIdentity: live(7, "orange", "Other") }).color, "orange",
    "the mark shows the container the tab is really in");
  assert.deepEqual(containerIndicator({ projectName: "Harbor Suite", expected: { state: "pending" }, tabUserContextId: 0 }),
    { color: null, phrase: ", not in Harbor Suite's own container yet", info: null, action: { label: "Open in Harbor Suite's own container", color: null } });
  assert.equal(containerIndicator({ projectName: "Harbor Suite", expected: { state: "shared_site", userContextId: 2 }, tabUserContextId: 2, tabIdentity: live(2, "blue", "Work") }).info,
    "Shared site: the space's sign-ins");
  assert.equal(containerIndicator({ projectName: "Harbor Suite", expected: { state: "shared_site", userContextId: 2 }, tabUserContextId: 40 }).action.label,
    "Reopen with the space's sign-ins");
});
