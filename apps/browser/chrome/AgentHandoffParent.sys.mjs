/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. https://mozilla.org/MPL/2.0/ */

// Parent side of the AxioSozoHandoff JSWindowActor. Deliberately empty: the
// child never sends anything, and this side exposes no receiver for a
// handoff, a clipboard write, an authorization or any other request. Trusted
// chrome (AgentHandoffRuntime) takes this actor from a tab's captured current
// window global and uses only sendQuery for the two bounded read queries;
// every answer is validated and rebound there before use.

const Base = globalThis.JSWindowActorParent ?? class {};

export class AgentHandoffParent extends Base {
  receiveMessage() {
    // Nothing the content process says can start, authorize or copy anything.
    return undefined;
  }
}

// JSWindowActor looks up `${actorName}Parent` (ACTOR "AxioSozoHandoff").
export { AgentHandoffParent as AxioSozoHandoffParent };
