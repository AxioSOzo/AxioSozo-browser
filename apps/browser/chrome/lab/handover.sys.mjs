/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. https://mozilla.org/MPL/2.0/ */

import { words } from "../overview/platform-words.mjs";

// Handing work to the user's own tools, so the browser never becomes the
// agent's UI: one click and the session lives in their terminal or app.
//
//  - Continue in Terminal: a one-use `.command` script in a private folder
//    under the profile (0700), opened with `open -a Terminal` (no Automation
//    permission). It deletes itself first, then runs, in the project folder,
//    `claude --resume <id>`, `codex resume <id>` or `agy --conversation <id>`.
//  - Deep links that prefill and never send (the user presses Enter there):
//      claude-cli://open?q=&cwd=           Claude Code in the user's terminal
//      claude://code/new?folder=&q=        Claude Desktop's Code tab (it confirms the folder)
//      claude://resume?session=            Claude Desktop imports a CLI session
//      codex://threads/new?path=&prompt=   the Codex app
//    Only for project roots AxioSozo knows (Codex silently adds an unknown
//    folder as a project). An image cannot travel in a link: it goes to the
//    clipboard as PNG and the prompt says so.
// Pure builders here; agents.sys.mjs checks roots and sessions, and
// platform.sys.mjs gives the native openers (the external protocol service,
// the clipboard, Subprocess).

export const DEEP_LINK_TARGETS = Object.freeze(["claude-cli", "claude-desktop", "claude-resume", "codex-app"]);
export const TARGET_SCHEMES = Object.freeze({ "claude-cli": "claude-cli", "claude-desktop": "claude", "claude-resume": "claude", "codex-app": "codex" });
export const TARGET_LABELS = Object.freeze({
  terminal: "Continue in Terminal",
  "claude-cli": "Open in Claude Code",
  "claude-desktop": "Open in the Claude app",
  "claude-resume": "Open in the Claude app",
  "codex-app": "Open in Codex",
});
/** Which client's sessions or prompts each target takes. */
export const TARGET_CLIENTS = Object.freeze({ "claude-cli": "claude-code", "claude-desktop": "claude-code", "claude-resume": "claude-code", "codex-app": "codex" });
/** The longest prompt each link carries (Claude CLI: 5000; Desktop cuts at 14 336). */
export const PROMPT_LIMITS = Object.freeze({ "claude-cli": 5000, "claude-desktop": 14000, "codex-app": 8000 });
export const CLIPBOARD_NOTE = words("A screenshot of the area is on the clipboard: paste it with ⌘V.");

export class HandoverError extends Error {
  constructor(code, message = code) { super(message); this.name = "HandoverError"; this.code = code; }
}

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/u;
const clip = (text, max) => [...String(text ?? "")].slice(0, max).join("");

/**
 * The deep link of `target` for a known project `root`, a `prompt` and/or a
 * Claude `sessionId` (claude-resume). Throws HandoverError for anything else.
 */
export function deepLink(target, { root = null, prompt = "", sessionId = null } = {}) {
  const enc = encodeURIComponent;
  switch (target) {
    case "claude-cli":
      if (!root) throw new HandoverError("NO_PROJECT");
      return `claude-cli://open?q=${enc(clip(prompt, PROMPT_LIMITS["claude-cli"]))}&cwd=${enc(root)}`;
    case "claude-desktop":
      if (!root) throw new HandoverError("NO_PROJECT");
      return `claude://code/new?folder=${enc(root)}&q=${enc(clip(prompt, PROMPT_LIMITS["claude-desktop"]))}`;
    case "claude-resume":
      if (typeof sessionId !== "string" || !UUID.test(sessionId)) throw new HandoverError("NO_SESSION");
      return `claude://resume?session=${enc(sessionId)}`;
    case "codex-app":
      if (!root) throw new HandoverError("NO_PROJECT");
      return `codex://threads/new?path=${enc(root)}&prompt=${enc(clip(prompt, PROMPT_LIMITS["codex-app"]))}`;
    default: throw new HandoverError("UNKNOWN_TARGET");
  }
}

/** A POSIX shell single-quoted word. */
export function shellQuote(value) {
  const text = String(value);
  if (text.includes("\u0000")) throw new HandoverError("INVALID_ARGUMENT");
  return `'${text.replace(/'/gu, "'\\''")}'`;
}

/**
 * The one-use Terminal script: it removes itself, enters the project folder
 * and replaces itself with the client (argv quoted word by word).
 */
export function terminalScript({ root, argv, title = "" }) {
  if (typeof root !== "string" || !root.startsWith("/") || !Array.isArray(argv) || !argv.length) throw new HandoverError("INVALID_ARGUMENT");
  const label = clip(String(title).replace(/[\u0000-\u001f\u007f]+/gu, " ").trim(), 80);
  return [
    "#!/bin/sh",
    "# AxioSozo: continue this agent session here. This file removes itself.",
    "rm -f -- \"$0\"",
    label ? `printf '%s\\n' ${shellQuote(`AxioSozo: ${label}`)}` : null,
    `cd -- ${shellQuote(root)} || exit 1`,
    `exec ${argv.map(shellQuote).join(" ")}`,
    "",
  ].filter(line => line !== null).join("\n");
}

/** The prompt for a deep link: the task, plus where the image is when it went to the clipboard. */
export function linkPrompt(prompt, { imageCopied = false } = {}) {
  const text = String(prompt ?? "").trim();
  return imageCopied ? `${text}\n\n${CLIPBOARD_NOTE}`.trim() : text;
}
