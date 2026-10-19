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
| Dialogs, permissions, downloads, pop-ups, file pickers | Native Zen/Firefox | Delegated to Zen UI in web mode | Denied by the host with explicit codes; Zen shows a notice | No access | Off |
| IME | Native | Proxy editor (macOS surface mode) | Text commit only (`ime_commit_text`); no composition | — | — |
| Inside Zen on Linux (GUI E2E) | Harness launch/chrome/fixture PASS | Host E0/stream/input PASS (cloud/linux-cef); inside Zen: see three-engine row | PASS, EXPERIMENTAL (run 39325934205): Gecko → WebKit → Gecko via Zen's tab menu with real typing, click, link, toolbar Back, wheel scroll; host SIGKILL keeps the Gecko tab | — | — |
| Three engines on one tab | Hub | Fixture page only, beside WebKit (three-engine controls) | Fixture page only | — | — |

The `enabled` provider setting is an explicit local policy preference, not a
claim of authenticated or billed access. Disabled and unverified routes cannot
pass the admission check. No fallback retries a mutating action.

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

Linux evidence: `docs/evidence/linux/webkit-zen/STATUS.json` (Zen GUI E2E run 39325934205,
curated screenshots in `run-39325934205-e2e/`). In the three-engine window (WebKit controls over
the fixture-mode Chromium probe) Chromium is offered for the local test page only (EngineRegistry
`CHROMIUM_FIXTURE_LINEUP`); the Chromium fixture probe alone stays toolbar-only.
