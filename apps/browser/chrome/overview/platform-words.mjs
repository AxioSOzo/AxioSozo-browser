/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. https://mozilla.org/MPL/2.0/ */

// Platform wording for AxioSozo's own copy. The copy is authored for macOS
// ("this Mac", "the macOS Keychain", ⌘ shortcuts, Return) and stays exactly as
// written there. On Linux (and any other platform) the same sentences name
// what the user has: "this computer", the system keyring that the Secret
// Service helper uses (native/secret-service.c), Ctrl shortcuts and Enter.
//
// Only authored strings go through words(); names, titles and URLs that come
// from the user or from pages are never rewritten. DOM-free: the about:axiosozo
// page, its model and chrome modules all import this file, and outside Gecko
// (the node test suites) the platform is unknown and the authored text stays.

export const MAC = "mac";
export const LINUX = "linux";
export const OTHER = "other";

/** "mac" | "linux" | "other" from Services.appinfo.OS or navigator.oscpu/platform. Unknown → "mac". */
export function platformOf(hint) {
  const value = String(hint ?? "").trim().toLowerCase();
  if (!value || value.startsWith("darwin") || value.includes("mac")) return MAC;
  if (value.includes("linux") || value.includes("bsd") || value.startsWith("sunos")) return LINUX;
  return OTHER;
}

/** The platform this code runs on: chrome reads Services.appinfo.OS, a content
 * page navigator.oscpu (Gecko only). Node has neither, so tests keep macOS text. */
export function currentPlatform(scope = globalThis) {
  try {
    const os = scope.Services?.appinfo?.OS;
    if (os) return platformOf(os);
  } catch {}
  try {
    const oscpu = scope.navigator?.oscpu;
    if (oscpu) return platformOf(oscpu);
  } catch {}
  return MAC;
}

const KEY_NAMES = Object.freeze({ "↩": "Enter", "⏎": "Enter", "⌅": "Enter", Return: "Enter", Enter: "Enter",
  "⌫": "Backspace", "⌦": "Delete", "⎋": "Esc", "→": "Right", "←": "Left", "↑": "Up", "↓": "Down" });
const MODIFIERS = Object.freeze({ "⌃": "Ctrl+", "⌥": "Alt+", "⇧": "Shift+" });

/** "⌘⇧K" → "Ctrl+Shift+K" (the accelerator Gecko uses off macOS). */
export function shortcutLabel(keys, platform = currentPlatform()) {
  if (platform === MAC) return keys;
  return String(keys).replace(/⌘([⌃⌥⇧]*)(Return|Enter|.)/gu, (_, modifiers, key) =>
    "Ctrl+" + [...modifiers].map(mark => MODIFIERS[mark]).join("") + (KEY_NAMES[key] ?? key.toUpperCase()));
}

// Ordered: the specific Keychain phrases before the bare word.
const RULES = Object.freeze([
  [/\bthe macOS Keychain\b/gu, "the system keyring (Secret Service)"],
  [/\bThe macOS Keychain\b/gu, "The system keyring (Secret Service)"],
  [/\bmacOS Keychain\b/gu, "system keyring"],
  [/\bKeychain\b/gu, "keyring"],
  [/\bthis Mac\b/gu, "this computer"],
  [/\bThis Mac\b/gu, "This computer"],
  [/\bthe Mac\b/gu, "the computer"],
  [/\b(press|Press|then press) Return\b/gu, "$1 Enter"],
]);

/** The authored (macOS) sentence in this platform's words. */
export function words(text, platform = currentPlatform()) {
  if (platform === MAC || typeof text !== "string") return text;
  let out = shortcutLabel(text, platform);
  for (const [pattern, replacement] of RULES) out = out.replace(pattern, replacement);
  return out;
}

/** Applies words() to the authored static text of elements marked data-platform-words
 * (and their title/aria-label), e.g. the fixed sentences in about-axiosozo.html. */
export function localizeMarked(root, platform = currentPlatform()) {
  if (platform === MAC || typeof root?.querySelectorAll !== "function") return 0;
  let changed = 0;
  for (const element of root.querySelectorAll("[data-platform-words]")) {
    const before = element.textContent;
    const after = words(before, platform);
    if (after !== before && element.children?.length === 0) { element.textContent = after; changed++; }
    for (const name of ["title", "aria-label", "placeholder"]) {
      const value = element.getAttribute?.(name);
      if (value) element.setAttribute(name, words(value, platform));
    }
  }
  return changed;
}

/** True when `event` holds the platform's accelerator: ⌘ on macOS, Ctrl elsewhere. */
export function accelKey(event, platform = currentPlatform()) {
  return platform === MAC ? !!event.metaKey : !!event.ctrlKey && !event.metaKey;
}

/** The accelerator for aria-keyshortcuts ("Meta" on macOS, "Control" elsewhere). */
export function accelAria(platform = currentPlatform()) {
  return platform === MAC ? "Meta" : "Control";
}

/** True when `event` holds the platform's accelerator (⌘ on macOS, Ctrl elsewhere) and no other. */
export function accelOnly(event, platform = currentPlatform()) {
  return platform === MAC
    ? !!event.metaKey && !event.ctrlKey && !event.altKey
    : !!event.ctrlKey && !event.metaKey && !event.altKey;
}
