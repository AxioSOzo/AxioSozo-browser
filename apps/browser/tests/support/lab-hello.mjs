/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. https://mozilla.org/MPL/2.0/ */

// "Hello Lab": the smallest possible Lab experiment, used by the Lab tests and
// shown in docs/lab/README.md. It is not in the real experiment list and does
// not ship (it lives under tests/). A real one lives in chrome/lab/ and is
// listed in chrome/lab/experiments.sys.mjs.

export const HELLO_LAB = Object.freeze({
  id: "hello-lab",
  title: "Hello Lab",
  pitch: "Says hello each time you open a tab, to show the Lab works.",
  howToTry: ["Turn it on.", "Open a new tab."],
  group: "Your day",
  needs: ["none"],
  module: "hello-lab.sys.mjs",
  installer: "installHelloLab",
});

/** One toast per new tab; the listener goes away with ctx.signal. */
export function installHelloLab(window, ctx) {
  let count = 0;
  window.gBrowser.tabContainer.addEventListener("TabOpen", () => {
    count++;
    ctx.toast({ title: "Hello from the Lab", description: `Tab ${count} opened while Hello Lab is on.` });
  }, { signal: ctx.signal });
  return { dispose() { count = 0; } };
}
