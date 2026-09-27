/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. https://mozilla.org/MPL/2.0/ */

// F1: one native "Context" submenu in Zen's existing workspace context menu.
// Sets the context type (personal/organization/project) and, for projects, the
// organization and project links. Stored by AxioSozoServices in contexts.json;
// Zen's workspace store is never written. Zen element ids come from the adapter.

export const CONTEXT_TYPE_LABELS = Object.freeze({
  personal: "Personal", organization: "Organization", project: "Project",
});
const ID = "axiosozo-context-menu";

export function installContextTypeMenu(window, { services, adapter, openOverview = null }) {
  const popup = adapter.workspaceMenu();
  if (!popup || !services) return null;
  const document = window.document;
  const create = (tag, attributes = {}) => {
    const element = document.createXULElement(tag);
    for (const [name, value] of Object.entries(attributes)) element.setAttribute(name, value);
    return element;
  };
  const setHidden = (element, hidden) => (hidden ? element.setAttribute("hidden", "true") : element.removeAttribute("hidden"));

  const menu = create("menu", { id: ID, label: "Context" });
  const menuPopup = create("menupopup", { id: `${ID}-popup` });
  const typeItems = Object.entries(CONTEXT_TYPE_LABELS).map(([type, label]) =>
    create("menuitem", { type: "radio", name: `${ID}-type`, label, "data-axiosozo-action": "type", "data-axiosozo-value": type }));
  const linkSeparator = create("menuseparator");
  const orgMenu = create("menu", { label: "Organization" });
  const orgPopup = create("menupopup");
  const projectMenu = create("menu", { label: "Project folder" });
  const projectPopup = create("menupopup");
  orgMenu.appendChild(orgPopup); projectMenu.appendChild(projectPopup);
  for (const item of typeItems) menuPopup.appendChild(item);
  menuPopup.appendChild(linkSeparator); menuPopup.appendChild(orgMenu); menuPopup.appendChild(projectMenu);
  let overviewItem = null;
  if (typeof openOverview === "function") {
    menuPopup.appendChild(create("menuseparator"));
    overviewItem = create("menuitem", { label: "Manage contexts…", "data-axiosozo-action": "overview" });
    menuPopup.appendChild(overviewItem);
  }
  menu.appendChild(menuPopup);
  const anchor = adapter.workspaceMenuAnchor();
  if (anchor?.parentNode === popup) anchor.after(menu); else popup.appendChild(menu);

  let target = null; let state = null; let generation = 0;

  const radio = (label, action, value, checked) => {
    const item = create("menuitem", { type: "radio", name: `${ID}-${action}`, label,
      "data-axiosozo-action": action, "data-axiosozo-value": value });
    if (checked) item.setAttribute("checked", "true");
    return item;
  };

  const render = () => {
    const context = state?.contexts.find(item => item.uuid === target) ?? null;
    setHidden(menu, !target || !context);
    if (!context) return;
    for (const item of typeItems) {
      if (item.getAttribute("data-axiosozo-value") === context.type) item.setAttribute("checked", "true");
      else item.removeAttribute("checked");
    }
    const isProject = context.type === "project";
    for (const element of [linkSeparator, orgMenu, projectMenu]) setHidden(element, !isProject);
    if (!isProject) return;
    const organizations = state.contexts.filter(item => item.type === "organization" && item.uuid !== target);
    orgPopup.replaceChildren(radio("None", "organization", "", !context.organization_uuid),
      ...organizations.map(org => radio(org.name, "organization", org.uuid, org.uuid === context.organization_uuid)));
    projectPopup.replaceChildren(radio("None", "project", "", !context.project_id),
      ...state.projects.map(project => radio(project.manifest.name, "project", project.id, project.id === context.project_id)));
  };

  const refresh = async () => {
    const mine = ++generation;
    try {
      const [contexts, projects] = await Promise.all([services.listContexts(), services.listProjects()]);
      if (mine !== generation) return;
      state = { contexts, projects };
    } catch (error) {
      if (mine !== generation) return;
      state = null; // e.g. an invalid contexts.json: hide rather than guess
      console.error("AxioSozo context menu unavailable", error);
    }
    render();
  };

  const onShowing = event => {
    if (event.target !== popup) return;
    target = adapter.isPrivateWindow() || adapter.isAuthoritative?.() === false ? null : adapter.workspaceForMenuEvent(event);
    setHidden(menu, true);
    if (target) return refresh();
    return undefined;
  };

  const onCommand = event => {
    if (!event.isTrusted || !target) return;
    const item = event.target;
    const action = item?.getAttribute?.("data-axiosozo-action");
    if (!action) return;
    const value = item.getAttribute("data-axiosozo-value") || null;
    let operation;
    if (action === "type") operation = services.setContextType(target, value);
    else if (action === "organization") operation = services.linkOrganization(target, value);
    else if (action === "project") operation = services.linkProject(target, value);
    else if (action === "overview") operation = Promise.resolve(openOverview?.());
    else return;
    Promise.resolve(operation).catch(error => console.error("AxioSozo context change refused", error));
  };

  popup.addEventListener("popupshowing", onShowing);
  menuPopup.addEventListener("command", onCommand);
  setHidden(menu, true);
  return {
    element: menu,
    dispose() {
      generation++;
      popup.removeEventListener("popupshowing", onShowing);
      menuPopup.removeEventListener("command", onCommand);
      menu.remove();
    },
  };
}
