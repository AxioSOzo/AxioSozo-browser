# CEF component and boundary

This directory is an **E0 component probe**, not an alternative browser application and not proof of Zen embedding. The production shell stays Zen. `probe.py run` reports only what the real native CEF process observed, and always labels E1/E2 separately.

```sh
# Run mount-dev-storage first; prefix build/run commands with:
# /Users/wout/.local/bin/dev-external python3 scripts/storage.py exec --
python3 native/chromium-host/probe.py setup
python3 native/chromium-host/probe.py check
python3 native/chromium-host/probe.py run
python3 native/chromium-host/probe.py test-native
python3 native/chromium-host/stream_test.py
python3 native/chromium-host/stream_security_test.py
# General HTTP(S) capability, still an isolated native component test:
python3 native/chromium-host/web_stream_test.py
```

The root `./dev engine-probe` owns combined acceptance. Native compiler and signing commands have a ten-minute limit and report `BLOCKED_ENV` on timeout; they clean only their owned process groups. Every new run archives previous real logs and frames under `docs/evidence/cef-run-*`, and clears current images so a failed run cannot display stale evidence. The component's first setup downloads a pinned official macOS arm64 minimal archive, verifies its SHA256, and compiles our Objective-C++ C API host with Xcode. It uses the unchanged CEF scoped sandbox helper source from that archive. This avoids installing CMake or compiling the entire C++ wrapper. Build artifacts and profiles live in `$AXIOSOZO_BUILD_ROOT/cef`; the build root must be the mounted project APFS volume, default `/Volumes/AxioSozoBuild`. Compiler temporary files and module caches are overridden after `dev-external` to remain on that fresh volume. The verified legacy archive is copied and rechecked; older outputs stay in place. The host bundle ID is `dev.axiosozo.cef-probe`; it never sets the default browser or opens a personal profile.

The process uses real CEF off-screen BGRA frames at 2× device scale and native input calls. It renders `tests/fixtures/engine.html`, types synthetic text, resizes, scrolls, navigates to another local GET URL and goes back, then closes through CEF before shutdown. PNGs are encoded directly from CEF `on_paint` bytes; they are actual render output, not screenshots of another browser. The process has no visible product window. This rendering test does not prove native IME, selection, clipboard, accessibility or UI integration in Zen.

The helper initializes CEF's current scoped macOS sandbox before loading the main framework. The main host configures `no_sandbox=0`, no debugging port, and no arbitrary command-line switches. An exact fixture URL allowlist is applied at launch and for stream sessions that omit `browsing_mode`. There is no content-to-privileged bridge. General HTTP(S) mode is explicit and experimental, with the unsupported capabilities listed below.

`setup` reviews/uses no upstream lifecycle hooks, creates local ad hoc code signatures only, and preserves the required framework resources and license files. The diagnostic bundle includes English UI resources only, as permitted by the pinned distribution README; the full verified archive retains every upstream locale. ICU remains present for Unicode page content. Binary and source pins are in the root lockfile and `docs/evidence/cef-upstream-manifest.json`. A changed local host or toolchain invalidates the build fingerprint, requiring setup. No native hot reload is claimed.

A probe invocation owns its one child process group and unique profile. Timeout/interruption terminates only that group; no `pkill` or global client discovery is used. Successful native shutdown is recorded as `closed` before the result. Profile directories are retained externally for repeatable diagnostics and can be explicitly removed after their process has exited; they contain only synthetic fixture activity.

`AxioCEFProbe --stream PRIVATE_PROFILE EVIDENCE_DIR` implements the native side of `contracts/cef-v1.md`. Authentication arrives through the owned pipe before CEF initializes. `transport.hpp` carries binary BGRA frames on a dedicated bounded writer; `stream.inc` validates target-bound commands and uses the same live native browser for frames and input. Chromium helpers do not inherit these pipes. The stream extension is compiled and signed, and actual private-pipe frames, native text input and Retina resize have passed on the explicitly approved T9-backed project volume. `docs/adr/002-dual-engine.md` tracks component results and remaining acceptance gates. `test-native` tests only transport mechanics, and `stream_test.py` tests the real component; neither proves E1/E2 inside Zen.

Stream `hello` contains `version`, `method`, `token`, `engine_instance`, `fixture_origin`. Later commands contain `version`, `method`, `request_id`, `token`, `target` plus method-specific fields. `shutdown` omits `target`. `create` receives the pending target without `engine`/`native_target_id`; `created` returns those actual runtime fields. `frame_ack` releases the exact outstanding `{frame_id,target}` even if current navigation advanced, and emits no acknowledgement event. Keyboard fields are `type` (`down`, `up`, `char`), `native_key_code`, `windows_key_code`, `modifiers`, `text`. Mouse fields are `type` (`move`, `down`, `up`), `x`, `y`, `modifiers`, `button`, `click_count`, `mouse_leave`; wheel uses `x`, `y`, `modifiers`, `delta_x`, `delta_y`. Coordinates are logical points; resize includes explicit `device_scale`. Oversized physical surfaces return `unsupported` instead of silently reducing Retina scale.

The host owns CEF's official macOS message loop; a bounded timer dispatches private commands on the UI thread. `cef_key_event_t.size` is set according to the pinned API. Accepted navigation revokes old document/navigation generations even for BFCache restores that skip `OnBeforeBrowse`. The `load` event carries the actual `http_status` plus required `restored_from_history:boolean`; HTTP0 alone never authorizes a frame. Only explicit history restoration to a known successful fixture document can enable subsequent actual paints.

## Explicit web sessions

A trusted browser can add `browsing_mode:"web"` to `hello`. `fixture_origin` then
names the validated HTTP(S) session identity; it is stable for that owned process,
not a page-origin permission grant. Existing fixture sessions retain their exact
origin/path/GET restrictions. A web session permits credential-free HTTP(S), normal
web subresources and form submission, and the inert initial `about:blank` page.
External protocols, file navigation, popup windows, downloads, file dialogs, HTTP
authentication, client-certificate selection and permissions remain unavailable.
TLS errors are denied by CEF and reported without any certificate exception path.
JavaScript dialogs are suppressed; an unload confirmation retains the current page
unless the browser has explicitly closed the target. Native HTML select dropdowns
are separate from popup windows and their bounded OSR overlay is composited into
the same tab surface.

`ready.capabilities` reports these limits, including `ime:false`,
`accessibility:false`, `private_mode:false`, and `devtools:false`. Gecko remains the
fully featured engine for those workflows. `edit` dispatches an explicit trusted
`copy`, `cut`, `paste`, `select_all`, `undo` or `redo` to CEF's focused frame; it never
returns clipboard content across the pipe. `visibility` with a boolean `visible`
calls CEF `was_hidden` so hidden tabs stop OSR painting. No CEF process is needed
for tabs that stay in Gecko. Web request IDs are strictly increasing `cef-N` safe
integers, giving constant-memory replay rejection without the fixture session's
100,000-request lifetime limit.

HTTP200–599 documents can render in web mode, so a real HTTP404 page is visible.
HTTP0 requires known history restoration, exact `about:blank`, or the explicit
`same_document:true` marker for a retained same-origin document. SPA/fragment
navigation revokes target generations before its URL/frame is exposed. A renderer
crash revokes the target and requires explicit user recovery; unsafe form requests
are never automatically replayed.

Each target now uses an explicit non-global CEF request context with empty
`cache_path` and a unique owned `root_cache_path`: page cookies, cache and storage
are in memory and are not imported from Firefox or another Chromium profile.
**This does not avoid Chromium's process-global OSCrypt initialization.** On
2026-09-26 the newly signed host reached a real blank OSR frame, then stalled before
the first HTTP request waiting inside macOS `SecItemCopyMatching` for the default
Chromium Safe Storage item. The default and explicit in-memory contexts both hit
this boundary. See `docs/evidence/cef-web-stream-cwqgbeis/result.json` and the owned
process sample `docs/evidence/cef-owned-stall-sample.txt`. Those runs are failures,
not passing web or E1/E2 evidence. Do not approve a Keychain prompt automatically.

Official CEF master added per-app Keychain service/account names in
[commit fa874ac](https://github.com/chromiumembedded/cef/commit/fa874acb9dd4a0ebf607245543b2f20d27d04916),
behind `CEF_NEXT`. Neither the pinned154.0.23 nor official newest154.0.28 release
source exposes those fields. Production isolation needs a runtime exposing that
supported API and stable signing. No mock Keychain, basic password store, TLS
bypass, personal-profile access, or system-Keychain mutation is implemented here.
An explicitly authorized user may respond to macOS themselves during an isolated
fixture run. `web_stream_test.py --interaction-timeout 60` waits longer for that
response; the flag itself is **not** authorization to access Keychain.
