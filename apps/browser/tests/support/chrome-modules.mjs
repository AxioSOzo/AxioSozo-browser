/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. https://mozilla.org/MPL/2.0/ */

// Node-only resolver that mirrors the chrome JAR layout produced by scripts/zen.py:
//   chrome://browser/content/axiosozo/contexts/X → packages/contexts/src/X
//   chrome://browser/content/axiosozo/X          → apps/browser/chrome/X
//   apps/browser/chrome/contexts/X (a relative "./contexts/…" import) → packages/contexts/src/X
// Import this module first, then load chrome modules with a dynamic import():
//   import "./support/chrome-modules.mjs";
//   const { X } = await import("../chrome/X.sys.mjs");
import { registerHooks } from "node:module";
import { existsSync } from "node:fs";
import { fileURLToPath } from "node:url";

const CHROME_URL = "chrome://browser/content/axiosozo/";
const CHROME_DIR = new URL("../../chrome/", import.meta.url);
const CONTEXTS_DIR = new URL("../../../../packages/contexts/src/", import.meta.url);
const MIRRORED_CONTEXTS = new URL("contexts/", CHROME_DIR).href;

export const contextsCoreAvailable = existsSync(fileURLToPath(new URL("index.mjs", CONTEXTS_DIR)));

let registered = false;
if (!registered) {
  registered = true;
  registerHooks({
    resolve(specifier, context, nextResolve) {
      if (specifier.startsWith(CHROME_URL)) {
        const relative = specifier.slice(CHROME_URL.length);
        const url = relative.startsWith("contexts/")
          ? new URL(relative.slice("contexts/".length), CONTEXTS_DIR)
          : new URL(relative, CHROME_DIR);
        return { url: url.href, shortCircuit: true, format: "module" };
      }
      if (context.parentURL && (specifier.startsWith("./") || specifier.startsWith("../"))) {
        const target = new URL(specifier, context.parentURL).href;
        if (target.startsWith(MIRRORED_CONTEXTS))
          return { url: new URL(target.slice(MIRRORED_CONTEXTS.length), CONTEXTS_DIR).href, shortCircuit: true, format: "module" };
      }
      return nextResolve(specifier, context);
    },
  });
}
