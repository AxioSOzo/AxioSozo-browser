# First-experience capability matrix

| Capability | Gecko | Chromium/CEF | WebKit (WPE, Linux) | Provider agent | Jev |
| --- | --- | --- | --- | --- | --- |
| Navigate ordinary web URL/search | Implemented; fixture UI tested | Blocked outside local GET fixture | Blocked: loopback GET fixture only (`/engine.html`, `?page=2`); every other URL is refused by Zen and by the host | No automatic route | Off |
| Open/search saved pages | Implemented; fixture UI tested | Browser chrome only; fixture target not persisted privately | Unsupported | No access | Off |
| Separate browser environments | Firefox container creation and current label tested in native GUI; cookie and same-URL GUI matrix pending | Distinct native profile only for fixture; cookie audit pending | Fresh private 0700 profile per host, removed on exit; nothing shared with Gecko or CEF | No access | Suggestion not wired |
| Read selection/page | Existing coordinator grant contract, adapter unsupported | Unsupported | Unsupported (Gecko action authority is revoked while a tab is in WebKit) | No exposed tool | Off |
| Mutating browser actions | Native user input only | Fixture native input only | Fixture native input only (pointer, wheel, keys with XKB codes, text commit) | No exposed tool | No authority |
| Contextual answer/stream | Not connected | Not connected | Not connected | Live auth/sandbox blocked | Off |
| TLS, extensions, accessibility, devtools | Native Zen/Firefox inherited; this slice did not run the full regression matrix | Full safety matrix blocked | TLS errors fail closed in the host (no bypass, no TLS UI); no extensions, accessibility or devtools | No override | No override |
| Dialogs, permissions, downloads, pop-ups, file pickers | Native Zen/Firefox | Delegated to Zen UI in web mode | Drawn by Zen (engine-stream-v1 §8.2 browser UI): alert/confirm/prompt and beforeunload in Zen's tab-modal dialogs, permission requests in Zen's doorhanger (fixture mode: nothing remembered, deny unless allowed), the file picker through Zen's nsIFilePicker; downloads and pop-ups refused with a Zen notice; see "WebKit native-feel gates" | No access | Off |
| IME | Native | Proxy editor (macOS surface mode; Linux pipe mode with host `ime`: proxy focus verified, composition BLOCKED_ENV under Xvfb) | Composition with preedit through Zen's proxy editor and WebKitInputMethodContext (§8.2); commit, cancel; caret via `text_input` | — | — |
| Inside Zen on Linux (GUI E2E) | Harness launch/chrome/fixture PASS | Host E0/stream/input PASS (cloud/linux-cef); inside Zen: three-engine row | PASS, EXPERIMENTAL (runs 39325934205, 39337226571): Gecko → WebKit → Gecko via Zen's tab menu with real typing, click, link, toolbar Back, wheel scroll; host SIGKILL keeps the Gecko tab | — | — |
| Three engines on one tab (Linux GUI E2E) | Hub; same content process across all switches | PASS, EXPERIMENTAL (run 39337226571): fixture page only, beside WebKit, via Zen's "Open in" submenu | PASS, EXPERIMENTAL (run 39337226571): fixture page only | — | — |

The `enabled` provider setting is an explicit local policy preference, not a
claim of authenticated or billed access. Disabled and unverified routes cannot
pass the admission check. No fallback retries a mutating action.

## WebKit native-feel gates (Linux, fixture page, real Zen app)

Label per gate: PASS (verified end to end in the real Linux Zen app under Xvfb, inspected
screenshots), EXPERIMENTAL, NOT_VERIFIED, BLOCKED_ENV. The host-level evidence is
`native/webkit-host/ui_test.py` on real WPE 2.48.3 (Actions run 39365113891, PASS). The Zen
E2E is `scripts/webkit_feel_e2e.py` (linux-webkit-zen `e2e` job, `FEEL=1`). Its evidence is in
`docs/evidence/linux/webkit-feel/` and `ci-results:cloud_webkit-feel/<run>-1-webkit-zen-e2e/feel/`.

FEEL_GATES_PLACEHOLDER

## WebKit gates (all must hold; otherwise the engine menu says why)

WebKit is the third engine of a Zen tab (EngineRegistry `webkit`, label "WebKit";
`apps/browser/chrome/WebKit*.sys.mjs`). It is EXPERIMENTAL and fixture-only.

1. Platform: Linux x86_64 (`ready.platform` `linux-x86_64`, Debian 13 WPE 2.48.3 pins).
   macOS: "WebKit is not available on macOS yet" (ADR 004 macOS plan, not built);
   other platforms: "WebKit is not available on this platform yet".
2. Pref `axiosozo.engines.webkit.enabled` (default false): "WebKit is not enabled in this browser".
3. Host installed: `AXIOSOZO_WEBKIT_BINARY` must equal `$AXIOSOZO_BUILD_ROOT/webkit/AxioWebKitHost`
   (`native/webkit-host/probe.py setup`): "The WebKit engine is not installed".
4. Fixture origin: `AXIOSOZO_ENGINE_FIXTURE_ORIGIN` = `http://127.0.0.1:<port>` and the tab shows
   that origin's `/engine.html`: "WebKit runs only the local test page for now".
5. Ready identity: the host must report exactly the lockfile's WebKit/libwpe/WPEBackend-fdo
   versions, `sandbox:"bubblewrap"`, `fixture_only:true` and every web capability false.
6. General web mode: reserved pref `axiosozo.engines.webkit.web.enabled` enables nothing. It stays
   off until dialogs, permissions, downloads, TLS/certificate UI and a current (security-supported)
   WebKit release exist; the 2.48.3 Debian pin has no later security fixes.
7. Context engine preference: never moves a tab into WebKit (`UNAVAILABLE`); context-v1 cannot
   store `webkit` (needs a contract version owned by the contexts workstream).

Failure handling: a failed start, a crash or exit (codes 70, 76), a protocol violation, a fixture
load failure or a Gecko navigation that raced the switch shows the tab's Gecko document again,
unchanged.

Linux evidence: `docs/evidence/linux/webkit-zen/STATUS.json` (Zen GUI E2E runs 39325934205 and
39337226571, curated screenshots in `run-39325934205-e2e/` and `run-39337226571-e2e/`). In the three-engine window (WebKit controls over
the fixture-mode Chromium probe) Chromium is offered for the local test page only (EngineRegistry
`CHROMIUM_FIXTURE_LINEUP`); the Chromium fixture probe alone stays toolbar-only.

## Chromium (CEF) inside Zen on Linux: E1/E2 and native-feel gates

Chromium tabs on Linux run in the sandboxed CEF host (SUID `chrome-sandbox` on the
runners) and are drawn by `CEFPresenter` inside Zen's own content area (AXCF BGRA pipe,
`native-osr-bgra`). Web mode stays behind the existing developer gate
(`AXIOSOZO_ENGINE_SWITCHING=1`); nothing here widens it. Evidence: workflow
`linux-cef-zen` (`scripts/cef_zen_e2e.py`, page `tests/fixtures/cef-zen-feel.html`),
Ubuntu 24.04 runner, Xvfb 1280×800 (2560×1600 for 2×), WebRender software, prebuilt
Linux Zen artifact + this branch's chrome JS (TEST-ONLY `chrome-overlay`). Results:
`ci-results:claude_cef-zen-feel-dx16ke/<run>-1-cef-zen-e2e/`; the copies under
`docs/evidence/linux/cef-zen/` were inspected. "Gecko baseline" = the same page and
input in a Gecko tab of the same session.

| Gate (Chromium Linux column) | Status | Evidence (run 39359724324 unless noted; paths under `docs/evidence/linux/cef-zen/39359724324/`) |
| --- | --- | --- |
| E1: Chromium pixels inside Zen's content area (web switch via Zen's tab menu) | PASS | `web/02-chromium.png`; `native-osr-bgra`, Gecko browser hidden |
| E1: fixture probe (toolbar button), typing, click, page 2, toolbar Back | PASS | `fixture/f02-chromium.png`, `f03-typed.png`, `f04-page2.png` |
| E1 at 2× (devPixelsPerPx 2, surface `device_scale` 2) | PASS | `web-2x/03-typed.png` |
| E2: host SIGKILL, fixture tab → its preserved Gecko document (same URL, same content pid) | PASS | `fixture/f05-gecko-after-kill.png` |
| E2: host SIGKILL, web tab → "Chromium stopped" panel; other Gecko tabs untouched; "Open in Firefox" reopens the address | PASS | `web/19-after-kill.png`, `19-gecko-tab-after-kill.png`, `19-gecko-after-kill.png` |
| Return to Gecko with the tab intact (tab menu "Open in Firefox", address carried) | PASS | `web/18-gecko-again.png` |
| Window title shows the page title (X11) | PASS (fixed: `isContentTitle`) | `matrix.window_title` |
| Typing, Backspace, Ctrl+Backspace word delete | PASS | `web/03-typed.png` |
| Clicks, Tab/Shift+Tab focus, focus ring and caret | PASS | `web/05-focus-ring.png`, `05-caret.png` |
| Selection by drag, double-click word, triple-click line | PASS | `web/06-drag-selection.png`, `06-double-click.png` |
| Ctrl+C/X/V/Z via Zen's clipboard: Chromium→Gecko tab, Gecko→Chromium, Zen chrome→Chromium | PASS | `web/07-clipboard.png` |
| Wheel: notch animates, precise pixel delta applies at once; same as Gecko | PASS | notch 12 positions/~184 ms vs Gecko 12/~179 ms; precise 1/1 |
| Cursor shapes (pointer, text, move, wait, crosshair, not-allowed, grab, col-resize→ew-resize, default) | PASS | engine view CSS cursor (xwd has no pointer) |
| `<select>` popup | PASS (Chromium-drawn, composited in frame) | `web/09-select-open.png` |
| `<input type=color>` chooser | PASS (Chromium-drawn, composited) | `web/09-color.png`, `09-color-picked.png` |
| `<datalist>` suggestions | EXPERIMENTAL | typing works; windowless CEF shows no suggestion list (`web/09-datalist.png`) |
| Context menu drawn by Zen with engine items (Copy, Select All, Search, Open Page in Firefox, Inspect disabled) | PASS | items/placement asserted; xwd captures menupopups black for Firefox's own menu too (`10-gecko-context-menu.png`) |
| JS alert/confirm/prompt in Zen's dialog, answered by keyboard | PASS | `web/11-alert.png`, `11-confirm.png`, `11-prompt.png` |
| beforeunload in Zen's "Are you sure?" dialog (Escape stays, Return leaves) | PASS | `web/17-beforeunload-1.png` |
| Find in page via Zen's findbar | PASS | `web/12-find.png`: 3 matches found and highlighted by Chromium; the count reads "0 of 3" where Firefox says "1 of 3", and Chromium highlights all matches without "Highlight All" (follow-up) |
| Page zoom Ctrl+= / Ctrl+- / Ctrl+0 and the URL-bar indicator | PASS (fixed: zoom commands follow the Chromium zoom) | `web/13-zoomed-chromium.png` |
| Reload F5 / Ctrl+R / reload button | PASS (fixed: reload commands re-enabled for Chromium tabs) | `matrix.reload_keys`: Chromium and Gecko baseline both reload on F5 and Ctrl+R |
| Shortcut ownership: Ctrl+W (closes the Chromium tab), Ctrl+Tab/Ctrl+Shift+Tab, Alt+Left, F-keys never reach the page | PASS | `matrix.shortcut_ownership` |
| Ctrl+L over a Chromium page (focus, Escape, click back types into the page; same as Gecko) | PASS (run 39345299134) / BLOCKED in 39359724324 | the Linux parent crashes intermittently around address-bar focus, also on the Gecko baseline tab (run 39354267095); owned by cloud/linux-platform |
| Ctrl+T over a Chromium page | EXPERIMENTAL | opens Zen's new-tab address bar (run 39351480361, `20-ctrl-t.png` in ci-results); dismissing it crashed the parent (same known bug) |
| Middle-click paste (PRIMARY) both ways; autoscroll | PASS (fixed: host `text_selection` → Zen PRIMARY) | Chromium selection → PRIMARY "alpha"; Gecko PRIMARY pasted in Chromium; no autoscroll in either (Linux default) |
| Dead keys / Ctrl+Shift+U compose via the proxy editor | BLOCKED_ENV | under Xvfb + xdotool the Gecko baseline does not compose either; proxy editor focus asserted (`proxy-textarea`) |
| Accessibility (AT-SPI), devtools, downloads, permissions, certificate UI on Linux | NOT_VERIFIED | not exercised by this workflow |

Green runs: `linux-cef-zen` 39359724324 (fixture-probe harness PASS, fixture E1/E2 PASS, web matrix PASS with the BLOCKED gates above, 2× subset PASS). Earlier runs and what each fixed are listed in `docs/handoff/cef-zen-feel.md`.
