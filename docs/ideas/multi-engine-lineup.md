# Idea (later): multi-engine lineup and engine switch UI

Status: parked idea, not scheduled. Needs an ADR 002 update and integration-lead
sign-off before any work beyond dual-engine (Gecko + Chromium) starts.

## Engine tiers

Main engines (the only three complete, current web engines):

| Internal id | UI label | Dev label | Notes |
|---|---|---|---|
| `gecko` | Firefox | Firefox (Gecko) | Default. Zen/Gecko remains the application. |
| `chromium` | Chromium | Chromium (Blink) | Current dual-engine work via CEF. |
| `webkit` | Safari / WebKit | WebKit | Later. On macOS via system `WKWebView`. |

Niche / experimental engines (developer-only, opt-in):

| Engine | Status | Verdict |
|---|---|---|
| Servo (Rust, Linux Foundation) | Active, has an embedding API (`libservo`), incomplete site compatibility | Candidate "experimental engine" |
| Ladybird (LibWeb, BSD) | Pre-alpha/alpha, not embeddable yet | Watch; revisit later |

Not worth adding: Gecko forks (Goanna), Chromium derivatives (Edge, Brave, Arc —
all Blink), closed engines (Flow, Ultralight), minimal engines (NetSurf, Dillo),
text browsers (Lynx, w3m), dead engines (Trident, EdgeHTML, Presto).

## Naming principles

1. Internal contract/IPC ids are technical engine names (`gecko`, `chromium`,
   later `webkit`, `servo`). UI labels are separate and user-friendly.
2. Most users know "Firefox" and "Chrome", not "Gecko" or "Blink". Show "Firefox"
   descriptively ("Firefox engine"), and "Chromium" rather than the "Chrome" brand.
3. Open issue: `contracts/ipc-v1.schema.json` uses `gecko | chromium` while
   `contracts/context-v1.schema.json` uses `firefox | chromium`. Align on `gecko`
   (integration lead owns contracts).

## Switch UI (keep Zen calm)

- Invisible by default: Gecko tabs show no engine indicator.
- Small engine badge in the URL bar only when a tab runs a non-default engine;
  clicking it switches.
- Tab context menu: "Reopen in Chromium" (and later other engines).
- User-configured site rule: "Always open this domain in <engine>" via
  `site-rule-v1`. No hardcoded per-site behaviour.
- Design the engine field and UI as a list, not a boolean toggle, so adding
  engines later costs nothing.

## WebKit notes (macOS)

- WebKit is open source (LGPL/BSD). Two routes:
  - System `WKWebView`: easiest, Safari's actual engine, updated by the OS.
    Embedded as a native NSView in the Zen window, like CEF.
  - Building WebKit from source: heavy, and we own security updates. Only if a
    pinned version is required.
- Limitations of `WKWebView`: devtools only via Safari Web Inspector
  (`isInspectable`), no web extensions, less process/network control than CEF.
  Profiles possible via `WKWebsiteDataStore(forIdentifier:)` (macOS 14+).
- Same safety gates as Chromium apply (ADR 002): IME, clipboard, popups,
  downloads, permissions, certificate dialogs, context menus, fullscreen,
  accessibility, crash recovery, developer tools.
- This is an additional engine alongside Gecko, not the WebKit-shell pivot that
  `docs/IMPLEMENTATION_HANDOFF.md` forbids.

## Order

1. Finish Chromium until real macOS E1/E2 pass.
2. Make the engine field and switch UI list-based now.
3. Add WebKit (`WKWebView`), possibly developer-only first.
4. Optionally Servo as an experimental developer engine.
