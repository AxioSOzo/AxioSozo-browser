/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. https://mozilla.org/MPL/2.0/ */

// ChromeWorker of one engine target's frames (EngineFrameSurface.sys.mjs, "Frame worker"):
// the worker side lives in that module, loaded into this worker's own global.
"use strict";
const { runFrameWorker } = ChromeUtils.importESModule(
  "chrome://browser/content/axiosozo/EngineFrameSurface.sys.mjs", { global: "current" });
runFrameWorker(globalThis);
