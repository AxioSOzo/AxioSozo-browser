/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. https://mozilla.org/MPL/2.0/ */

// Parent side of the AxioSozoAgentCapture JSWindowActor (Plan 4 step 8). The
// process capture runtime (AgentCaptureRuntime) obtains this actor from the
// exact current WindowGlobalParent of a registry-issued tab and sends it the
// three fixed lease queries itself. The child never starts anything: any
// message it sends unasked is ignored. Destruction is reported so the runtime
// retires leases bound to this exact instance.
import { getAgentCaptureRuntime } from "./AgentCaptureRuntime.sys.mjs";

const Base = globalThis.JSWindowActorParent ?? class {};

export class AgentCaptureParent extends Base {
  receiveMessage() {
    return undefined;
  }

  didDestroy() {
    try { getAgentCaptureRuntime()?.actorDestroyed(this); } catch {}
  }
}

export { AgentCaptureParent as AxioSozoAgentCaptureParent };
