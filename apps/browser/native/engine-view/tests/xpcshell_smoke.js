/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

// Registration smoke for the engine-view XPCOM component, run by
// run_smoke.py in the built app's parent process (xpcshell mode, no profile,
// synthetic HOME). Prints one line: "AXIO_ENGINE_VIEW_SMOKE <json>".
// No network, no personal data, no GUI. Only /bin/sleep is spawned, to prove
// expectHostPid accepts a real direct child.

/* global Cc, Ci, ChromeUtils, Services */
"use strict";

const CONTRACT = "@axiosozo.nl/engine-surface-service;1";
const checks = [];
function check(name, fn) {
  try {
    const detail = fn();
    checks.push({ name, ok: true, detail: detail === undefined ? null : detail });
  } catch (error) {
    checks.push({ name, ok: false, detail: String(error && error.message || error) });
  }
}
function expectThrow(fn) {
  try {
    fn();
  } catch (error) {
    return String(error && error.name || error);
  }
  throw new Error("did not throw");
}
function spinUntil(predicate, timeoutMs) {
  const tm = Services.tm;
  const deadline = Date.now() + timeoutMs;
  tm.spinEventLoopUntil("axio-smoke", () => predicate() || Date.now() > deadline);
  return predicate();
}

let svc = null;
let ep = null;
check("contract registered", () => {
  if (!(CONTRACT in Cc)) {
    throw new Error("contract id missing from Cc");
  }
  return CONTRACT;
});
check("service instantiates", () => {
  svc = Cc[CONTRACT].getService(Ci.nsIAxioEngineSurfaceService);
  return String(svc);
});
check("service is a singleton", () => {
  const again = Cc[CONTRACT].getService(Ci.nsIAxioEngineSurfaceService);
  if (again !== svc) {
    throw new Error("second getService returned another object");
  }
});
check("createEndpoint(false)", () => {
  ep = svc.createEndpoint(false);
  return { state: ep.state, externalBeginFrames: ep.externalBeginFrames };
});
check("serviceName format", () => {
  const name = ep.serviceName;
  if (!/^dev\.axiosozo\.surface\.[0-9a-f]{32}$/.test(name)) {
    throw new Error("unexpected service name " + name);
  }
  return name;
});
check("takeToken once, 64 hex", () => {
  const token = ep.takeToken();
  if (!/^[0-9a-f]{64}$/.test(token)) {
    throw new Error("unexpected token shape, length " + token.length);
  }
  return "64 hex chars (value not printed)";
});
check("takeToken second call throws", () => expectThrow(() => ep.takeToken()));
check("state is LISTENING", () => {
  if (ep.state !== Ci.nsIAxioEngineEndpoint.STATE_LISTENING) {
    throw new Error("state " + ep.state);
  }
});
check("expectHostPid(1) rejected (not our child)", () => expectThrow(() => ep.expectHostPid(1)));
check("expectHostPid(own pid) rejected", () =>
  expectThrow(() => ep.expectHostPid(Services.appinfo.processID)));

// A real direct child spawned the way CEFPresenter spawns the host.
check("expectHostPid(direct child) accepted", () => {
  const { Subprocess } = ChromeUtils.importESModule(
    "resource://gre/modules/Subprocess.sys.mjs");
  let proc = null;
  let error = null;
  Subprocess.call({ command: "/bin/sleep", arguments: ["5"] })
    .then(p => { proc = p; }, e => { error = e; });
  spinUntil(() => proc || error, 10000);
  if (!proc) {
    throw new Error("spawn failed: " + error);
  }
  try {
    ep.expectHostPid(proc.pid);
    const second = expectThrow(() => ep.expectHostPid(proc.pid));
    return { childPid: proc.pid, secondCall: second };
  } finally {
    proc.kill();
    let done = false;
    proc.wait().then(() => { done = true; }, () => { done = true; });
    spinUntil(() => done, 5000);
  }
});
check("getTargetStats(unknown) is null", () => {
  const stats = ep.getTargetStats(42);
  if (stats !== null) {
    throw new Error("expected null, got " + JSON.stringify(stats));
  }
});
// bindElement with a plain JS Number target id (as CEFEngineAdapter passes
// it) on a context-less canvas in a system-principal document. This runs the
// patched HTMLCanvasElement::SetAxioExternalImageContainer path.
check("bindElement/getTargetStats/unbindTarget with Number id", () => {
  const browser = Services.appShell.createWindowlessBrowser(true);
  try {
    const doc = browser.document;
    const canvas = doc.createElementNS("http://www.w3.org/1999/xhtml", "canvas");
    (doc.body || doc.documentElement).appendChild(canvas);
    const id = 7;
    ep.bindElement(canvas, id, 1, 1);
    const stats = ep.getTargetStats(id);
    if (!stats || stats.presented !== 0 || stats.received !== 0) {
      throw new Error("unexpected stats " + JSON.stringify(stats));
    }
    const duplicate = expectThrow(() => ep.bindElement(canvas, id, 1, 1));
    ep.setTargetGenerations(id, 2, 2);
    ep.setTargetVisible(id, true);
    ep.unbindTarget(id);
    // The queue drops an unbound target with no frames at its next poll.
    return { principalIsSystem: doc.nodePrincipal.isSystemPrincipal,
             statsKeys: Object.keys(stats).length, duplicateBind: duplicate };
  } finally {
    browser.close();
  }
});
check("createEndpoint(true) (vsync forwarder)", () => {
  const ep2 = svc.createEndpoint(true);
  const result = { externalBeginFrames: ep2.externalBeginFrames,
                   distinctName: ep2.serviceName !== ep.serviceName };
  ep2.close();
  return result;
});
check("displayRefreshRate", () => {
  const rate = svc.displayRefreshRate;
  if (!(rate > 0)) {
    throw new Error("rate " + rate);
  }
  return rate;
});
check("close() reaches CLOSED and notifies listener", () => {
  let reason = null;
  ep.listener = {
    QueryInterface: ChromeUtils.generateQI(["nsIAxioEngineEndpointListener"]),
    onConnected() {},
    onTargetGeometry() {},
    onClosed(aReason) { reason = aReason; },
  };
  ep.close();
  spinUntil(() => reason !== null, 5000);
  if (ep.state !== Ci.nsIAxioEngineEndpoint.STATE_CLOSED || reason !== "closed") {
    throw new Error("state " + ep.state + " reason " + reason);
  }
  return reason;
});
check("takeToken after close throws", () => expectThrow(() => ep.takeToken()));

const ok = checks.every(c => c.ok);
dump("AXIO_ENGINE_VIEW_SMOKE " + JSON.stringify({ status: ok ? "PASS" : "FAIL",
  pid: Services.appinfo.processID,
  processType: Services.appinfo.processType,
  checks }) + "\n");
