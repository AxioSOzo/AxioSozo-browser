/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. https://mozilla.org/MPL/2.0/ */

// P2 accounts per project (workstation-v1 §3): the DOM-free presentation and
// expectation logic shared by the service (identity name and colour) and the
// window runtime (environment pill indicator, project block, reopen offer).
// Nothing here reads cookies, account names or page content, creates an
// identity or opens a tab: the service's container controller is the only
// router, and an already loaded tab's container is never changed.

export const PROJECT_CONTAINER_ICON = "briefcase";
// Canonical colour names of the pinned ContextualIdentityService
// (CONTAINER_COLORS); Firefox's usercontext.css styles exactly these as
// .identity-color-<name>.
export const CONTAINER_COLOR_NAMES = Object.freeze(["gray", "yellow", "orange", "red", "pink", "purple", "violet", "blue", "cyan", "green"]);
// Gecko's CONTAINER_COLOR_ALIASES: the contexts core still names Firefox's old
// "turquoise", which pinned Gecko only accepts as cyan.
const LEGACY_COLORS = Object.freeze({ turquoise: "cyan", toolbar: "gray" });
const MAX_ID = 4294967294;

/** A canonical Gecko colour name, or null. */
export function canonicalContainerColor(color) {
  if (typeof color !== "string") return null;
  const name = Object.hasOwn(LEGACY_COLORS, color) ? LEGACY_COLORS[color] : color;
  return CONTAINER_COLOR_NAMES.includes(name) ? name : null;
}

/** Firefox's own container colour class, or null for an unknown colour. */
export function identityColorClass(color) {
  const name = canonicalContainerColor(color);
  return name ? `identity-color-${name}` : null;
}

/** Name, icon and colour of a project's container: the project's own name and
 * the core's deterministic colour, in pinned Gecko's canonical names. */
export function projectContainerPresentation(core, project) {
  const record = core.upgradeProject(project);
  const name = record.manifest.name.trim();
  const color = canonicalContainerColor(core.projectContainerStyle(record.id).color);
  if (!name || !color) throw Object.assign(new Error("INVALID_PROJECT"), { code: "INVALID_PROJECT" });
  return Object.freeze({ name, icon: PROJECT_CONTAINER_ICON, color });
}

const OFF = Object.freeze({ state: "off" });
const NONE = Object.freeze({ state: "none" });
const PENDING = Object.freeze({ state: "pending" });
const validId = (id, zero = false) => Number.isSafeInteger(id) && id >= (zero ? 0 : 1) && id <= MAX_ID;

/**
 * Where a URL opened for `project` belongs, from stored state only:
 * { state: "off" } containers are off or unknown; { state: "none" } not a web
 * URL; { state: "pending" } the project has no usable container yet (opening a
 * link through the service creates it); { state: "project", userContextId,
 * identity } its own container; { state: "shared_site", userContextId } a
 * confirmed shared site in the space's default container. A stored ID that is
 * not a live public identity, or that another project also names, is not
 * claimed. `identity(id)` → { userContextId, name, color } | null.
 */
export function expectedContainer({ core, project, projects = [], url, defaultUserContextId = 0, identity = () => null, enabled = false } = {}) {
  if (enabled !== true || !validId(defaultUserContextId, true)) return OFF;
  let record;
  try { record = core.upgradeProject(project); } catch { return NONE; }
  let parsed = null;
  try { parsed = new URL(url); } catch { parsed = null; }
  if (!parsed || !["http:", "https:"].includes(parsed.protocol)) return NONE;
  const id = record.container.user_context_id;
  const shared = Array.isArray(projects) && projects.some(other => other?.id !== record.id && other?.container?.user_context_id === id);
  let live = null;
  if (id !== null && !shared) {
    try { live = identity(id); } catch { live = null; }
    if (live?.userContextId !== id) live = null;
  }
  if (!live) {
    return core.isSharedSite(record, parsed.hostname)
      ? Object.freeze({ state: "shared_site", userContextId: defaultUserContextId }) : PENDING;
  }
  const route = core.routeForUrl({ project: record, url: parsed.href, defaultUserContextId });
  if (route.reason === "shared_site") return Object.freeze({ state: "shared_site", userContextId: route.userContextId });
  if (route.reason === "project") return Object.freeze({ state: "project", userContextId: id, identity: live });
  return PENDING;
}

/** Does an open tab in container `tabUserContextId` (null = unknown) already
 * show `expected`? Containers off: any tab does. Unknown or pending: none. */
export function tabFits(expected, tabUserContextId) {
  if (expected?.state === "off") return true;
  if (!validId(tabUserContextId, true)) return false;
  return (expected?.state === "project" || expected?.state === "shared_site") && expected.userContextId === tabUserContextId;
}

/**
 * The environment pill's container indicator for a tab. `tabIdentity` is the
 * tab's own container (null for the default container). Returns
 * { color, phrase, info, action }: color is the canonical colour of the tab's
 * actual container (null: no mark); phrase is appended to the pill's
 * accessible name; info is a menu line for a tab that is where it belongs;
 * action is { label, color } for the visible reopen offer, or null.
 */
export function containerIndicator({ projectName, expected, tabUserContextId, tabIdentity = null }) {
  const quiet = { color: null, phrase: "", info: null, action: null };
  if (!expected || expected.state === "off" || expected.state === "none" || !validId(tabUserContextId, true)) return quiet;
  const name = typeof projectName === "string" && projectName.trim() ? projectName.trim() : "this project";
  const color = tabUserContextId > 0 ? canonicalContainerColor(tabIdentity?.color) : null;
  const fits = tabFits(expected, tabUserContextId);
  if (expected.state === "pending") {
    return { color, phrase: `, not in ${name}'s own container yet`, info: null,
      action: { label: `Open in ${name}'s own container`, color: null } };
  }
  if (expected.state === "shared_site") {
    return fits ? { color, phrase: ", shared site with the space's sign-ins", info: "Shared site: the space's sign-ins", action: null }
      : { color, phrase: ", not with the space's sign-ins", info: null, action: { label: "Reopen with the space's sign-ins", color: null } };
  }
  const own = canonicalContainerColor(expected.identity?.color);
  const label = expected.identity?.name || name;
  return fits ? { color: own, phrase: `, in the ${label} container`, info: `In the ${label} container`, action: null }
    : { color, phrase: `, not in the ${label} container`, info: null, action: { label: `Reopen in the ${label} container`, color: own } };
}
