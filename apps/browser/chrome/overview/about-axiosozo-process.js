/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. https://mozilla.org/MPL/2.0/ */

// Process script loaded by registerAboutAxioSozo() through Services.ppmm.
// It registers about:axiosozo only in the parent and privilegedabout
// processes; web content processes never learn the module.
"use strict";

{
  const about = ChromeUtils.importESModule("chrome://browser/content/axiosozo/AboutAxioSozo.sys.mjs");
  if (about.registerForCurrentProcess()) {
    addMessageListener(about.UNREGISTER_MESSAGE, () => about.unregisterAboutModuleInProcess());
  }
}
