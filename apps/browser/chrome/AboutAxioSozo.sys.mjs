/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. https://mozilla.org/MPL/2.0/ */

// Runtime registration of about:axiosozo (contexts-api-v1 §3.4) and of its
// single JSWindowActor. No C++ change and no Zen file change.
//
// Security notes, checked against Firefox 156 sources:
// * Flags omit URI_SAFE_FOR_UNTRUSTED_CONTENT and MAKE_LINKABLE, so the
//   about: protocol reports URI_DANGEROUS_TO_LOAD and no content principal
//   (web pages, and also other unlinkable about: pages such as reader view)
//   can link, frame or navigate to it (nsScriptSecurityManager
//   CheckLoadURIWithPrincipal / CheckLoadURIFlags).
// * Without URI_SAFE_FOR_UNTRUSTED_CONTENT Gecko does not null the channel
//   owner, and the chrome: protocol hands /content/ files the system
//   principal. newChannel() therefore clears the owner itself, so the page
//   always runs with the about:axiosozo *content* principal in the
//   privilegedabout process, never with chrome privileges.
// * The module is registered only in the parent and privilegedabout
//   processes. Web content processes do not know it, which also resolves to
//   URI_DANGEROUS_TO_LOAD.

export const ABOUT_HOST = "axiosozo";
export const ABOUT_URL = "about:axiosozo";
export const PAGE_URL = "chrome://browser/content/axiosozo/overview/about-axiosozo.html";
export const PROCESS_SCRIPT_URL = "chrome://browser/content/axiosozo/overview/about-axiosozo-process.js";
export const CONTRACT_ID = "@mozilla.org/network/protocol/about;1?what=" + ABOUT_HOST;
export const UNREGISTER_MESSAGE = "AxioSozo:AboutAxioSozo:Unregister";
export const ACTOR_NAME = "AxioSozoOverview";
export const ACTOR_OPTIONS = Object.freeze({
  parent: { esModuleURI: "chrome://browser/content/axiosozo/AboutAxioSozoParent.sys.mjs" },
  child: {
    esModuleURI: "chrome://browser/content/axiosozo/AboutAxioSozoChild.sys.mjs",
    // Created as soon as the document element exists, so the page API is
    // present before the page's module script runs.
    events: { DOMDocElementInserted: {} },
  },
  matches: ["about:axiosozo*"],
  remoteTypes: ["privilegedabout"],
});

const gecko = () => ({
  Ci: globalThis.Ci, Services: globalThis.Services, ChromeUtils: globalThis.ChromeUtils,
  Components: globalThis.Components,
});

// Exactly the §3.4 flag set.
export function aboutFlags(Ci) {
  const m = Ci.nsIAboutModule;
  // ALLOW_SCRIPT keeps the page working when javascript.enabled is false.
  return m.IS_SECURE_CHROME_UI | m.ALLOW_SCRIPT | m.URI_MUST_LOAD_IN_CHILD |
    m.URI_CAN_LOAD_IN_PRIVILEGEDABOUT_PROCESS | m.HIDE_FROM_ABOUTABOUT;
}

export function shouldRegisterInProcess({ processType, remoteType, parentProcessType }) {
  return processType === parentProcessType || remoteType === "privilegedabout";
}

export class AboutAxioSozoModule {
  constructor(deps = gecko()) {
    this.deps = deps;
    this.QueryInterface = deps.ChromeUtils.generateQI(["nsIAboutModule"]);
  }

  getURIFlags() {
    return aboutFlags(this.deps.Ci);
  }

  getChromeURI() {
    return this.deps.Services.io.newURI(PAGE_URL);
  }

  newChannel(uri, loadInfo) {
    const { Services } = this.deps;
    const channel = Services.io.newChannelFromURIWithLoadInfo(Services.io.newURI(PAGE_URL), loadInfo);
    channel.originalURI = uri;
    // Never inherit the chrome: system principal; see the header comment.
    channel.owner = null;
    return channel;
  }
}

// Per-process registration state. The ES module is a per-process singleton,
// so this makes registration idempotent inside each process.
let local = null;

export function registerAboutModuleInProcess(deps = gecko()) {
  if (local) return false;
  const { Ci, Services, ChromeUtils, Components } = deps;
  const module = new AboutAxioSozoModule(deps);
  const factory = {
    createInstance: iid => module.QueryInterface(iid),
    QueryInterface: ChromeUtils.generateQI(["nsIFactory"]),
  };
  const registrar = Components.manager.QueryInterface(Ci.nsIComponentRegistrar);
  const classID = Components.ID(Services.uuid.generateUUID().toString());
  registrar.registerFactory(classID, "AxioSozo about:axiosozo", CONTRACT_ID, factory);
  local = { registrar, classID, factory };
  return true;
}

export function unregisterAboutModuleInProcess() {
  if (!local) return false;
  const { registrar, classID, factory } = local;
  local = null;
  try { registrar.unregisterFactory(classID, factory); } catch (error) { console.error(error); }
  return true;
}

// Entry point for the process script, which runs in every process.
export function registerForCurrentProcess(deps = gecko()) {
  const { Services, Ci } = deps;
  const eligible = shouldRegisterInProcess({
    processType: Services.appinfo.processType,
    remoteType: Services.appinfo.remoteType,
    parentProcessType: Ci.nsIXULRuntime.PROCESS_TYPE_DEFAULT,
  });
  return eligible ? registerAboutModuleInProcess(deps) : false;
}

let parentRegistration = null;

// Parent process: registers here and in every current and future
// privilegedabout process. Idempotent; returns the same unregister function.
export function registerAboutAxioSozo(deps = gecko()) {
  if (parentRegistration) return parentRegistration;
  const { Services } = deps;
  registerAboutModuleInProcess(deps);
  Services.ppmm.loadProcessScript(PROCESS_SCRIPT_URL, true);
  const unregister = () => {
    if (parentRegistration !== unregister) return;
    parentRegistration = null;
    try { Services.ppmm.removeDelayedProcessScript(PROCESS_SCRIPT_URL); } catch (error) { console.error(error); }
    try { Services.ppmm.broadcastAsyncMessage(UNREGISTER_MESSAGE, null); } catch (error) { console.error(error); }
    unregisterAboutModuleInProcess();
  };
  parentRegistration = unregister;
  return unregister;
}

let actorRegistration = null;

// Parent process: registers the window actor once per process (Gecko
// propagates actor registrations to content processes).
export function registerOverviewActor(deps = gecko()) {
  if (actorRegistration) return actorRegistration;
  const { ChromeUtils } = deps;
  ChromeUtils.registerWindowActor(ACTOR_NAME, ACTOR_OPTIONS);
  const unregister = () => {
    if (actorRegistration !== unregister) return;
    actorRegistration = null;
    try { ChromeUtils.unregisterWindowActor(ACTOR_NAME); } catch (error) { console.error(error); }
  };
  actorRegistration = unregister;
  return unregister;
}
