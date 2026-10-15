/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. https://mozilla.org/MPL/2.0/ */

// The agent's mark with its state, as a 16 px SVG data: URL: a tab's icon in
// the Agents folder, the Needs you stack and the result card. Our own simple
// glyphs (no vendor logo is shipped or fetched): a spark for Claude Code, a
// prompt for Codex, an arc for Antigravity. One small badge says the state,
// and colour only where it means something: amber needs you, red failed; a
// ring while working, a check when done, a square when stopped, in the
// glyph's own grey. The SVG follows the light or dark scheme itself
// (prefers-color-scheme inside the image), and nothing in it animates.

const GLYPHS = Object.freeze({
  "claude-code": '<g fill="none" class="g" stroke-width="1.7" stroke-linecap="round"><path d="M7.5 1.6v3.2M7.5 10.2v3.2M1.6 7.5h3.2M10.2 7.5h3.2M3.33 3.33l2.26 2.26M9.41 9.41l2.26 2.26M3.33 11.67l2.26-2.26M9.41 5.59l2.26-2.26"/></g>',
  codex: '<g fill="none" class="g" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"><rect x="1.7" y="2.2" width="11.6" height="10.6" rx="2.6"/><path d="m4.6 5.6 2.2 1.9-2.2 1.9M8.3 9.8h2.4"/></g>',
  antigravity: '<g fill="none" class="g" stroke-width="1.6" stroke-linecap="round"><path d="M2.4 13c.3-5.3 2.2-8 5.1-8s4.8 2.7 5.1 8"/><circle cx="7.5" cy="2.4" r="1.25" class="f" stroke="none"/></g>',
  other: '<g fill="none" class="g" stroke-width="1.5"><circle cx="7.5" cy="7.5" r="5.4"/></g>',
});

// The state badge sits in the bottom-right corner, ringed in the page colour so it reads over the glyph.
const BADGES = Object.freeze({
  working: '<circle cx="12.2" cy="12.2" r="3.1" class="ring"/><circle cx="12.2" cy="12.2" r="2.1" fill="none" class="g" stroke-width="1.3" stroke-dasharray="9.9 3.3"/>',
  needs_you: '<circle cx="12.2" cy="12.2" r="3.6" class="ring"/><circle cx="12.2" cy="12.2" r="2.7" class="amber"/>',
  done: '<circle cx="12.2" cy="12.2" r="3.6" class="ring"/><circle cx="12.2" cy="12.2" r="2.8" class="f"/><path d="m10.9 12.2.9.9 1.6-1.7" fill="none" class="tick" stroke-width="1.1" stroke-linecap="round" stroke-linejoin="round"/>',
  failed: '<circle cx="12.2" cy="12.2" r="3.6" class="ring"/><circle cx="12.2" cy="12.2" r="2.7" class="red"/>',
  stopped: '<circle cx="12.2" cy="12.2" r="3.6" class="ring"/><rect x="10.4" y="10.4" width="3.6" height="3.6" rx=".8" class="f"/>',
});

// Firefox's own warning and critical colours (light and dark), as --axiosozo-run-amber and -red use them.
const STYLE = ".g{stroke:#3c3c43}.f{fill:#3c3c43}.ring{fill:#fff}.tick{stroke:#fff}.amber{fill:#d68c00}.red{fill:#d70022}"
  + "@media (prefers-color-scheme:dark){.g{stroke:#e1e1e6}.f{fill:#e1e1e6}.ring{fill:#1c1c1e}.tick{stroke:#1c1c1e}.amber{fill:#ffbe46}.red{fill:#ff8480}}";

/** The SVG text of `client`'s mark in `state` (null: no badge). */
export function agentIconSvg(client, state = null) {
  const glyph = GLYPHS[client] ?? GLYPHS.other;
  const badge = state ? BADGES[state === "starting" ? "working" : state] ?? "" : "";
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" width="16" height="16"><style>${STYLE}</style>${glyph}${badge}</svg>`;
}

const cache = new Map();
/** A data: URL of the mark, cached per client and state. */
export function agentIcon(client, state = null) {
  const key = `${client}\u0000${state}`;
  if (!cache.has(key)) cache.set(key, `data:image/svg+xml,${encodeURIComponent(agentIconSvg(client, state))}`);
  return cache.get(key);
}
