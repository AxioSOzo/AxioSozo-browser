/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. https://mozilla.org/MPL/2.0/ */

// Parent side of the AxioSozoAgentAction JSWindowActor (Plan 4 step 8). The
// process action runtime (AgentActionRuntime) sends the three fixed gate
// queries to the exact actor of an issued tab's current window global. The
// child starts nothing; anything it sends unasked is ignored. Destruction is
// reported so gates bound to this exact instance count as retired.
import { getAgentActionRuntime } from "./AgentActionRuntime.sys.mjs";

const Base = globalThis.JSWindowActorParent ?? class {};

export class AgentActionParent extends Base {
  receiveMessage() {
    return undefined;
  }

  didDestroy() {
    try { getAgentActionRuntime()?.actorDestroyed(this); } catch {}
  }
}

export { AgentActionParent as AxioSozoAgentActionParent };
