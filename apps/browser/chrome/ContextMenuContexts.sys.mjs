/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. https://mozilla.org/MPL/2.0/ */

// F1: native entries in Zen's existing workspace context menu: a "Space type"
// submenu (personal/organization/project, and the organization of a project
// space), "Projects in this space" (any space type may hold several projects,
// store v2) and "Add project to this space…", which opens the add-project review
// in about:axiosozo with this space preselected. Stored by AxioSozoServices in
// contexts.json; Zen's workspace store is never written. Zen element ids come
// from the adapter.

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

  const menu = create("menu", { id: ID, label: "Space type" });
  const menuPopup = create("menupopup", { id: `${ID}-popup` });
  const typeItems = Object.entries(CONTEXT_TYPE_LABELS).map(([type, label]) =>
    create("menuitem", { type: "radio", name: `${ID}-type`, label, "data-axiosozo-action": "type", "data-axiosozo-value": type }));
  const linkSeparator = create("menuseparator");
  const orgMenu = create("menu", { label: "Organization" });
  const orgPopup = create("menupopup");
  orgMenu.appendChild(orgPopup);
  for (const item of typeItems) menuPopup.appendChild(item);
  menuPopup.appendChild(linkSeparator); menuPopup.appendChild(orgMenu);
  if (typeof openOverview === "function") {
    menuPopup.appendChild(create("menuseparator"));
    menuPopup.appendChild(create("menuitem", { label: "Spaces in AxioSozo…", "data-axiosozo-action": "overview" }));
  }
  menu.appendChild(menuPopup);
  // Projects are not tied to the type: every space lists and takes projects.
  const projectMenu = create("menu", { id: `${ID}-projects`, label: "Projects in this space" });
  const projectPopup = create("menupopup", { id: `${ID}-projects-popup` });
  projectMenu.appendChild(projectPopup);
  const addItem = typeof openOverview === "function"
    ? create("menuitem", { id: `${ID}-add-project`, label: "Add project to this space…", "data-axiosozo-action": "add-project" }) : null;
  const anchor = adapter.workspaceMenuAnchor();
  if (anchor?.parentNode === popup) anchor.after(menu); else popup.appendChild(menu);
  menu.after(projectMenu);
  if (addItem) projectMenu.after(addItem);
  const additions = [menu, projectMenu, addItem].filter(Boolean);

  let target = null; let state = null; let generation = 0;

  const radio = (label, action, value, checked) => {
    const item = create("menuitem", { type: "radio", name: `${ID}-${action}`, label,
      "data-axiosozo-action": action, "data-axiosozo-value": value });
    if (checked) item.setAttribute("checked", "true");
    return item;
  };

  const render = () => {
    const context = state?.contexts.find(item => item.uuid === target) ?? null;
    for (const element of additions) setHidden(element, !target || !context);
    if (!context) return;
    // Checked = the project lives in this space; choosing moves it here or out.
    setHidden(projectMenu, !state.projects.length);
    projectPopup.replaceChildren(...state.projects.map(project => {
      const item = create("menuitem", { type: "checkbox", label: project.manifest?.name ?? project.id,
        "data-axiosozo-action": "project", "data-axiosozo-value": project.id });
      if (project.context_uuid === target) item.setAttribute("checked", "true");
      return item;
    }));
    for (const item of typeItems) {
      if (item.getAttribute("data-axiosozo-value") === context.type) item.setAttribute("checked", "true");
      else item.removeAttribute("checked");
    }
    // Only project spaces belong to an organization (context-v1).
    const isProject = context.type === "project";
    for (const element of [linkSeparator, orgMenu]) setHidden(element, !isProject);
    if (!isProject) return;
    const organizations = state.contexts.filter(item => item.type === "organization" && item.uuid !== target);
    orgPopup.replaceChildren(radio("None", "organization", "", !context.organization_uuid),
      ...organizations.map(org => radio(org.name, "organization", org.uuid, org.uuid === context.organization_uuid)));
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
    for (const element of additions) setHidden(element, true);
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
    else if (action === "project") {
      const project = state?.projects.find(item => item.id === value);
      if (!project) return;
      operation = project.context_uuid === target
        ? services.updateProject(value, { context_uuid: null })
        : services.linkProject(target, value);
    } else if (action === "overview") operation = Promise.resolve(openOverview?.("#projects"));
    else if (action === "add-project") operation = Promise.resolve(openOverview?.(`#add-project=${target}`));
    else return;
    Promise.resolve(operation).catch(error => console.error("AxioSozo context change refused", error));
  };

  const commandTargets = [menuPopup, projectPopup, addItem].filter(Boolean);
  popup.addEventListener("popupshowing", onShowing);
  for (const element of commandTargets) element.addEventListener("command", onCommand);
  for (const element of additions) setHidden(element, true);
  return {
    element: menu,
    projectsElement: projectMenu,
    addProjectElement: addItem,
    dispose() {
      generation++;
      popup.removeEventListener("popupshowing", onShowing);
      for (const element of commandTargets) element.removeEventListener("command", onCommand);
      for (const element of additions) element.remove();
    },
  };
}
