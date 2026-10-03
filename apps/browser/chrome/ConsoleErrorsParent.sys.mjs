/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. https://mozilla.org/MPL/2.0/ */

// Parent side of the ConsoleErrors JSWindowActor (Plan 4 step 7). It only
// hands this actual actor instance to the process owner
// (ConsoleErrorsNativeRuntime): the owner derives the tab, window and project
// from this actor's own native manager, never from message data, and runs the
// one-use capture query on this same actor. A child's readiness request gets
// metadata only; an offer is read lazily, after the owner's native gates. No
// other message (an unsolicited capture "reply" included) does anything.
import { CONSOLE_MESSAGES } from "./ConsoleErrorsChild.sys.mjs";
import { getConsoleErrorsNativeRuntime } from "./ConsoleErrorsNativeRuntime.sys.mjs";

const Base = globalThis.JSWindowActorParent ?? class {};
const DISABLED = Object.freeze({ enabled: false });

export class ConsoleErrorsParent extends Base {
  receiveMessage(message) {
    const owner = getConsoleErrorsNativeRuntime();
    switch (message?.name) {
      case CONSOLE_MESSAGES.AUTHORIZE:
        try { return owner ? owner.authorizeActor(this) : DISABLED; } catch { return DISABLED; }
      case CONSOLE_MESSAGES.OFFER:
        try { owner?.handleOffer(this, () => message.data); } catch {}
        return undefined;
      default:
        return undefined;
    }
  }

  didDestroy() {
    try { getConsoleErrorsNativeRuntime()?.actorDestroyed(this); } catch {}
  }
}
