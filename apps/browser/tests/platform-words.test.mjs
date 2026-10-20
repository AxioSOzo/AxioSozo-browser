/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. https://mozilla.org/MPL/2.0/ */

// Platform wording (overview/platform-words.mjs): macOS text stays exactly as
// authored, Linux gets "this computer", the Secret Service keyring and Ctrl.
import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join, relative } from "node:path";
import { fileURLToPath } from "node:url";
import { LINUX, MAC, OTHER, accelAria, accelKey, accelOnly, currentPlatform, localizeMarked, platformOf, shortcutLabel, words }
  from "../chrome/overview/platform-words.mjs";

const CHROME = fileURLToPath(new URL("../chrome/", import.meta.url));

test("platformOf: appinfo.OS and navigator.oscpu values; unknown keeps macOS", () => {
  assert.equal(platformOf("Darwin"), MAC);
  assert.equal(platformOf("Intel Mac OS X 10.15"), MAC);
  assert.equal(platformOf("Linux"), LINUX);
  assert.equal(platformOf("Linux x86_64"), LINUX);
  assert.equal(platformOf("FreeBSD amd64"), LINUX);
  assert.equal(platformOf("WINNT"), OTHER);
  assert.equal(platformOf(""), MAC);
  assert.equal(platformOf(undefined), MAC);
  assert.equal(currentPlatform({}), MAC, "node (no Services, no oscpu) keeps the authored text");
  assert.equal(currentPlatform({ Services: { appinfo: { OS: "Linux" } } }), LINUX);
  assert.equal(currentPlatform({ navigator: { oscpu: "Linux x86_64" } }), LINUX);
  assert.equal(currentPlatform({ Services: { get appinfo() { throw new Error("no"); } }, navigator: { oscpu: "Linux i686" } }), LINUX);
});

const SAMPLES = [
  "Projects, site rules and assistants. Stored on this Mac only.",
  "The macOS Keychain refused the change. Unlock the Keychain and try again.",
  "The Keychain helper is not available in this build.",
  "A screenshot of the area is on the clipboard: paste it with ⌘V.",
  "Your note is filled in there. Paste the image with ⌘V, then press Return there to start.",
  "Send (⌘↩)",
  "Nothing is sent until you press Send. ⌘Enter to send.",
  "Data may have left this Mac.",
  "What may leave the Mac for \"Find the date\"",
  "Ask AI currently needs macOS on Apple silicon.",
];

test("words: macOS keeps every sentence byte for byte", () => {
  for (const text of SAMPLES) assert.equal(words(text, MAC), text);
  for (const text of SAMPLES) assert.equal(words(text), text, "node default is macOS");
});

test("words: Linux names the computer, the Secret Service keyring, Ctrl and Enter", () => {
  const linux = SAMPLES.map(text => words(text, LINUX));
  assert.deepEqual(linux, [
    "Projects, site rules and assistants. Stored on this computer only.",
    "The system keyring (Secret Service) refused the change. Unlock the keyring and try again.",
    "The keyring helper is not available in this build.",
    "A screenshot of the area is on the clipboard: paste it with Ctrl+V.",
    "Your note is filled in there. Paste the image with Ctrl+V, then press Enter there to start.",
    "Send (Ctrl+Enter)",
    "Nothing is sent until you press Send. Ctrl+Enter to send.",
    "Data may have left this computer.",
    "What may leave the computer for \"Find the date\"",
    "Ask AI currently needs macOS on Apple silicon.",
  ]);
  for (const text of linux) assert.doesNotMatch(text, /this Mac|Keychain|⌘|press Return/u);
  assert.equal(words("Kept in the macOS Keychain; this Mac.", LINUX), "Kept in the system keyring (Secret Service); this computer.");
  assert.equal(words("This Mac is yours", LINUX), "This computer is yours");
  assert.equal(words("Get the MacBook", LINUX), "Get the MacBook", "only whole words");
  assert.equal(words(null, LINUX), null);
});

test("shortcutLabel: ⌘ chords become Ctrl chords off macOS", () => {
  assert.equal(shortcutLabel("⌘K", MAC), "⌘K");
  assert.equal(shortcutLabel("⌘K", LINUX), "Ctrl+K");
  assert.equal(shortcutLabel("⌘,", LINUX), "Ctrl+,");
  assert.equal(shortcutLabel("⌘t", LINUX), "Ctrl+T");
  assert.equal(shortcutLabel("⌘⇧K", LINUX), "Ctrl+Shift+K");
  assert.equal(shortcutLabel("⌘⌥⇧I", LINUX), "Ctrl+Alt+Shift+I");
  assert.equal(shortcutLabel("⌘⌫", LINUX), "Ctrl+Backspace");
  assert.equal(shortcutLabel("Browser actions · ⌘K", OTHER), "Browser actions · Ctrl+K");
});

test("accelerators: ⌘ on macOS, Ctrl elsewhere", () => {
  assert.equal(accelKey({ metaKey: true }, MAC), true);
  assert.equal(accelKey({ ctrlKey: true }, MAC), false);
  assert.equal(accelKey({ ctrlKey: true }, LINUX), true);
  assert.equal(accelKey({ metaKey: true }, LINUX), false, "Super is the desktop's, not the browser's");
  assert.equal(accelKey({ ctrlKey: true, metaKey: true }, LINUX), false);
  assert.equal(accelOnly({ metaKey: true }, MAC), true);
  assert.equal(accelOnly({ metaKey: true, ctrlKey: true }, MAC), false);
  assert.equal(accelOnly({ ctrlKey: true }, LINUX), true);
  assert.equal(accelOnly({ ctrlKey: true, altKey: true }, LINUX), false);
  assert.equal(accelAria(MAC), "Meta");
  assert.equal(accelAria(LINUX), "Control");
});

function fakeRoot(elements) {
  return { querySelectorAll: selector => (selector === "[data-platform-words]" ? elements : []) };
}
function fakeElement(text, attributes = {}, children = 0) {
  return { textContent: text, children: { length: children }, attributes: { ...attributes },
    getAttribute(name) { return this.attributes[name] ?? null; }, setAttribute(name, value) { this.attributes[name] = value; } };
}

test("localizeMarked: only marked, leaf elements; macOS untouched", () => {
  const leaf = fakeElement("Stored on this Mac only.", { title: "Kept on this Mac" });
  const parent = fakeElement("A project is a folder on this Mac.", {}, 1);
  assert.equal(localizeMarked(fakeRoot([leaf, parent]), MAC), 0);
  assert.equal(leaf.textContent, "Stored on this Mac only.");
  assert.equal(localizeMarked(fakeRoot([leaf, parent]), LINUX), 1);
  assert.equal(leaf.textContent, "Stored on this computer only.");
  assert.equal(leaf.attributes.title, "Kept on this computer");
  assert.equal(parent.textContent, "A project is a folder on this Mac.", "an element with children is never flattened");
  assert.equal(localizeMarked(null, LINUX), 0);
});

test("overview model: on Linux no exported sentence says this Mac, Keychain or ⌘", async () => {
  const previous = globalThis.Services;
  globalThis.Services = { appinfo: { OS: "Linux" } };
  try {
    const model = await import("../chrome/overview/overview-model.mjs?platform=linux");
    const strings = Object.entries(model).filter(([, value]) => typeof value === "string");
    assert.ok(strings.length > 10);
    for (const [name, value] of strings) assert.doesNotMatch(value, /this Mac|Keychain|⌘/u, name);
    assert.match(model.DECISIONS_UNAVAILABLE, /this computer/u);
    assert.match(model.RULE_DATA_TEXT, /system keyring \(Secret Service\)/u);
  } finally {
    if (previous === undefined) delete globalThis.Services; else globalThis.Services = previous;
  }
  const mac = await import("../chrome/overview/overview-model.mjs");
  assert.match(mac.DECISIONS_UNAVAILABLE, /this Mac/u, "macOS (and node) keep the authored text");
});

// Authored copy that says "this Mac", the Keychain, ⌘ or Return must go
// through words() (or shortcutLabel/data-platform-words), so Linux never
// shows it. Comments are skipped; the list below is the reviewed remainder.
const MAC_WORDS = /this Mac|This Mac|the Mac\b|Keychain|⌘|press Return/u;
const ALLOWED = new Set([
  "overview/platform-words.mjs",            // the rules themselves
  "lab/experiments.sys.mjs",                // data only; about-axiosozo.mjs renders it through words()
]);
function* sources(dir) {
  for (const name of readdirSync(dir)) {
    const path = join(dir, name);
    if (statSync(path).isDirectory()) yield* sources(path);
    else if (/\.(?:mjs|js|html|xhtml)$/u.test(name)) yield path;
  }
}

test("every authored Mac-ism in chrome is platform-aware", () => {
  const unwrapped = [];
  for (const path of sources(CHROME)) {
    const name = relative(CHROME, path).split("\\").join("/");
    if (ALLOWED.has(name)) continue;
    readFileSync(path, "utf8").split("\n").forEach((line, index) => {
      const code = line.trim();
      if (!MAC_WORDS.test(code) || /^(?:\/\/|\*|\/\*|<!--)/u.test(code)) return;
      if (/\bwords\(|shortcutLabel\(|data-platform-words|=== MAC \?/u.test(code)) return;
      // Identifiers and error codes (KEYCHAIN_REFUSED, macKeychain) are not copy.
      const prose = code.replace(/\/\/.*$/u, "");
      if (!MAC_WORDS.test(prose)) return;
      unwrapped.push(`${name}:${index + 1}: ${code.slice(0, 120)}`);
    });
  }
  assert.deepEqual(unwrapped, []);
});
