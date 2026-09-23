# ADR 002: CEF component and experimental Zen embedding

Date: 2026-09-23. Status: **PARTIAL_ENGINE_BLOCKED**. Local-fixture E1 is
experimental and E2 passed manual inspection in the actual macOS app; full E1
and general-site Chromium acceptance remain blocked.

Zen/Gecko remains the primary application. CEF is the first Chromium candidate. No Helium source was imported: its complete-browser architecture is not an embedding API and its licensing would introduce unnecessary scope.

## Pins and inspected implementation

The official [CEF binary index](https://cef-builds.spotifycdn.com/index.html) returned CEF `154.0.23+g062ebe4+chromium-154.0.8037.17` for macOS arm64. The downloaded minimal distribution's README identifies CEF commit `062ebe433bf6575a71cac2dc71c405617202e3d7` and Chromium commit `62d2fcb41a84e4dcefd8c4da7dfa534e6c482854`. Its published SHA1 and independently calculated SHA256 are preserved in evidence/root lockfile. The archive's current source, headers, README and build definitions govern the implementation.

The general CEF documentation describes [macOS bundles and off-screen rendering](https://chromiumembedded.github.io/cef/general_usage). Current pinned headers require an `NSApplication<CefAppProtocol>` implementation for event dispatch. `libcef_dll/wrapper/cef_scoped_sandbox_context_mac.mm` loads `Libraries/libcef_sandbox.dylib` and initializes the child sandbox **before** the main framework loads. The pinned README additionally requires a versioned framework layout for Xcode 26. These details differ from older examples using a static sandbox archive.

## Implemented experiment and acceptance boundary

`native/chromium-host/host.mm` implements a small real CEF C API application with native off-screen rendering. `probe.py setup` compiles it with Apple clang, a separate helper and official sandbox wrapper. `probe.py run` serves a synthetic loopback fixture and records actual frame, title, URL and input/lifecycle callbacks. `docs/evidence/cef-probe-result.json`, when present, is the authoritative E0 result; source compilation alone never means E0 PASS.

Actual CEF frames and input now run in the content area of the **built Zen fork**.
The original shared APFS volume had insufficient capacity and stalled native
reads. The successful build uses a separate project APFS image physically on T9,
mounted at `/Volumes/AxioSozoBuild`; it does not move or detach the shared
volume. Root `./dev engine-probe` executes E0 and opens the integrated fixture.
Its exit20 is deliberately conservative because its GUI assertions are not
automated. [Manual macOS observation](../evidence/engine-gui-manual-20260923.json)
records the exact observed E1/E2 subset. There is no iframe, floating external
Chromium window, screenshot substitution or false engine label.

## Alternatives evaluated

1. **Native NSView, same process.** CEF's native window info can attach to an NSView. A pointer from a separate CEF process cannot be attached to Gecko's native view hierarchy. An in-process integration requires a compiled Gecko Cocoa module, coordinated `NSApplication` event dispatch, CEF framework/helper packaging and compatible lifetime on the macOS main thread. Actual feasibility/performance is untested here; no working native embed is claimed.
2. **Out-of-process native OSR.** Selected because it provides real Chromium frames and CEF input/lifecycle APIs without changing Gecko's event loop. `transport.hpp` and `stream.inc` implement the authenticated, process-owned AXCF binary pipe; the privileged chrome presenter now runs in Zen and paints real CEF BGRA frames in its content area. It does not turn Gecko webpage iframes into Chromium. Pixel payloads are binary BGRA, never JSON/base64.
3. **RemoteView/IOSurface acceleration.** Candidate after E1 works. The current pinned render handler's accelerated path and IOSurface ownership need measurements and valid synchronization before zero-copy claims are justified. Not implemented or tested.

The current E0 host and stream extension compile, sign and run on macOS arm64. Component evidence does not resolve complete Zen focus routing, IME composition, selection, clipboard, popup UI, download UI, permission/certificate dialogs, context menus, general-site fullscreen, accessibility, crash recovery or controlled development tools. These remain acceptance gates. No setting disables TLS, origin isolation or the CEF sandbox for this experiment.

The stream receives its 256-bit token only through inherited stdin. The native host duplicates its pipes with `CLOEXEC` and replaces standard stdin/stdout before launching helpers, so helpers cannot inherit the authenticated channel. It validates every control request against the complete browser-owned target and both generations. A dedicated writer uses one outstanding frame plus one replaceable pending frame; the CEF UI thread never waits on pipe output. A frame acknowledgement is deliberately validated against the exact outstanding frame's target even after navigation: this only releases transport credit and never authorizes native input. Unknown or duplicate acknowledgements close the channel. Browser input flow control bounds native in-flight requests at eight and unsent requests at 64, revalidates stale targets before send, and never retries uncertain outcomes. All native requests are deduplicated; no reconnect/replay exists.

The source includes `CEFEngineAdapter.sys.mjs` and `CEFPresenter.sys.mjs` for the real Firefox `Subprocess` pipe API and privileged browserStack presentation. Browser commands and URL-bar integration were audited against the pinned `BrowserCommands`, `UrlbarInputBase`, `Tabbrowser`, `browser.js` and command definitions (`cef-firefox-api-audit.json`). No website receives a custom script or privileged event listener. The presenter waits for verified runtime identity, native creation, successful fixture load and an actual frame before hiding the retained Gecko surface. Any candidate failure or changed Gecko document preserves the original tab. Controlled JavaScript protocol/lifecycle tests pass, including regressions for late stale-target keyup after history navigation and bounded input flow; these unit fixtures do not replace the actual GUI result.

This initial channel permits only the explicit loopback fixture origin and GET resources. It denies popups, downloads, permission prompts, external schemes and other origins; developer tools return `unsupported`. It is an experimental fixture engine, not general Chromium browsing. Close completion follows CEF's actual closed callback. `test_transport.cc` tests native framing, newest-frame replacement and stale acknowledgement semantics; `stream_test.py` exercises actual CEF frames/input/navigation if a signed build exists. Neither test's existence is a passing result.

## E2 and recovery requirement

A fixture-only development switch works in the actual Zen window for the strict
local GET fixture. The manual probe saw Gecko→Chromium→Gecko in a retained tab,
actual Chromium identity and page2/back. Its first failed candidate also left
the Gecko tab intact. The lead's shared contract returns `unsupported` for
unavailable operations. General-site switching still needs a complete cookie/
profile separation audit, crash/timeout recovery and safety UI. Never replay a
possibly mutating navigation or transfer cookies implicitly.

## Next implementation boundary

The next gate is the rest of the live E1 matrix and automated evidence. The
fixture switch is already enabled only for safe local GET. A production Chromium
mode needs safety-critical dialogs, accessibility, profile/cookie isolation and
crash recovery before expansion. Changing to Electron, Tauri or a separate Chrome
window is not an approved fallback.

## Safety and interaction acceptance matrix

`PASS` in a unit test never upgrades an unexecuted macOS engine test. The E1/E2
subset below comes from the actual Zen fork, separately from E0 and unit tests.

| Gate | Current status | Evidence / remaining boundary |
|---|---|---|
| Current CEF main/helper/stream build on macOS arm64 | PASS | `cef-build-bfcache-generations.log`; real compile, ad-hoc signing and strict signature verification on the explicitly approved T9-backed volume |
| Browser AXCF parser, target validation and failed-candidate preservation | PASS | Current controlled source/unit tests cover cross-realm buffers, late stale keyup and bounded input flow; see `cef-input-flow-tests-20260923.log` and `root-test-post-gui-20260923.log` |
| Native process SIGTERM and descendant cleanup | PASS | Six lifecycle/strict-fixture-boundary tests in `cef-lifecycle-tests-approved-volume.log`; real native clean shutdown also recorded |
| E0 native render, input, resize and navigation | PASS | `cef-e0-input-history.log`, `cef-e0.jsonl`, actual `cef-e0-*.png`: native exit0, inputCEF, 2× frames, scroll, page2 and back |
| Actual AXCF frames/input and BFCache generations | PASS | `cef-stream-test-bfcache-generations.log`: eight real frames, native input, exact generation increment and stale-target rejection |
| Actual private-pipe authentication and EOF lifecycle | PASS | `cef-stream-security-approved-volume.log`: wrong token and duplicate ACK exit64; clean EOF exits0; three distinct profiles |
| E1 live CEF surface inside Zen | EXPERIMENTAL | Real Chromium pixels/input in Zen content area, page2/back; latest [GUI observation](../evidence/engine-gui-flow-control-manual-20260923.json) also retained Chromium through fullscreen and further input. Full matrix and automated assertions open |
| E2 switch preserving the Gecko tab on failure | EXPERIMENTAL | Manual fixture Gecko→Chromium→Gecko PASS; first candidate failure retained Gecko; general URLs/cookie audit unverified |
| Native focus, text selection and standard shortcuts in Zen | EXPERIMENTAL | Text input, Tab/Return/super+Left and keyboard Page Down scrolling work; selection and complete shortcut ownership unverified. [Interaction probe](../evidence/engine-gui-interaction-manual-20260923.json) |
| IME composition and clipboard | BLOCKED_ENV | No composed-text bridge or clipboard UX tested |
| Physical Retina display and window resize in Zen | EXPERIMENTAL | Actual 5K macOS fullscreen transition rendered with a 1.5× capped CEF surface and accepted input; arbitrary resize and display changes remain unverified |
| Popups, downloads and context menus | BLOCKED_ENV | No general browsing UI supplied by the component |
| Permission and certificate warning dialogs | BLOCKED_ENV | No in-Zen user decision surface; certificate bypass is not enabled |
| Fullscreen local fixture | EXPERIMENTAL | Current local fixture survived fullscreen and accepted input with a bounded render-scale notice; general-site fullscreen is not certified. [Latest probe](../evidence/engine-gui-flow-control-manual-20260923.json) |
| Native CEF accessibility | BLOCKED_ENV | The CEF surface does not expose page semantics to macOS accessibility; no production accessibility claim |
| Engine crash recovery and controlled developer tools | BLOCKED_ENV | Native target/lifecycle channel runs in component tests; Zen crash recovery unverified and controlled developer tools explicitly unsupported |
| Sandbox and TLS runtime behavior | EXPERIMENTAL | Official CEF sandbox helper loads; Gecko showed untrusted-certificate warning. Chromium certificate/permission UI remains blocked |

## Fresh component execution and earlier blockers

The user approved the prepared `/Volumes/AxioSozoBuild` mountpoint, physically backed by `/Volumes/T9/AxioSozoBuild.sparsebundle`. A verified copy of the pinned archive was built and signed there. The old shared-volume signing stalls and initial approval rejection remain preserved as historical evidence; they no longer block this component.

The first actual runs created CEF targets and helpers but never loaded a page. Samples proved the helpers were executing Chromium, rather than stalling in dyld. Comparing the pinned upstream [`cefsimple_mac.mm`](https://github.com/chromiumembedded/cef/blob/062ebe433bf6575a71cac2dc71c405617202e3d7/tests/cefsimple/cefsimple_mac.mm) revealed that this separate native process can own the official `cef_run_message_loop`. Replacing the handwritten AppKit polling with that loop, plus a bounded UI-thread timer for private commands, produced real loads/paints and clean `cef_shutdown`. The current `cef_key_event_t.size` field was also required before native text input worked.

`cef-e0-input-history.log` records the first complete E0 PASS: 25 real frames, input `CEF`, navigation and close, native exit0 in24.424 wall seconds. Relative to its runtime version event, creation took0.164s, HTTP200 load8.608s and first actual frame8.732s. The input and resize PNGs were visually inspected. This is cold component timing, not a daily-browser performance claim. Subsequent runs archive every previous log/frame under `cef-run-*` rather than reusing screenshots.

The first live AXCF run (`cef-stream-ff0my9px`) delivered six actual frames with native input and 2× resize. Inspection then found that BFCache back restored a document without `OnBeforeBrowse`, leaving its target generations unchanged. That run is superseded for generation correctness. The fix invalidates both generations exactly once when accepting a browser-issued navigation, irrespective of whether `OnBeforeBrowse` occurs. The corrected actual run (`cef-stream-test-bfcache-generations.log`, `cef-stream-ybnvz_co/result.json`) passes with eight frames and native exit0; it asserts exact +1 on back and rejects the former target afterward. HTTP0 is accepted only for an explicit pending back/forward, an exact previously HTTP200-committed fixture URL, no intervening load error and an actual subsequent paint; generic HTTP0 remains failure. The load event always includes `restored_from_history:boolean` and the actual HTTP status.

Actual native negative tests are recorded separately in `cef-stream-security-approved-volume.log`: wrong token exits64 without a fixture request; duplicate frame acknowledgement exits64; clean pipe EOF exits0. Each starts with a fresh token, engine instance and distinct profile. Six deterministic lifecycle/fixture-server tests pass, including exact Host enforcement and rejection of HEAD, absolute proxy URLs and arbitrary paths. These tests do not establish sandbox escape resistance or complete web safety UI.

Final component checkpoint: `cef-verified-handoff.json` binds source hashes and the build stamp to the final E0/stream results. `cef-e0-finalized-native.log` records a second complete E0 PASS on the final binary: 26 actual frames, native exit0 in14.82s wall time. Every one of the eleven owned native process groups checked afterward was absent. The later Zen GUI observation is separately recorded in `engine-gui-manual-20260923.json`; it does not certify general Chromium browsing.
