Status: PARTIAL

# Handoff: webkit-zen (WebKit as the third engine inside Zen)

PR: https://github.com/AxioSOzo/AxioSozo-browser/pull/4 (draft, `cloud/webkit-zen` → `cloud/integration`).
Branches: `cloud/webkit-zen` (PR branch, runs CI) and its identical mirror `claude/webkit-zen-engine-b4zzio`
(the session's designated branch). Both were pushed with the same commits.

## Machine resources
- Cloud session: Ubuntu 24.04, 4 vCPU, ~15 GiB RAM; no WPE, no Zen build, no Docker. Local runs: node unit
  tests and `cargo test -p browser-core` only.
- Linux evidence: GitHub Actions ubuntu-24.04 (4 vCPU, 16 GiB); WebKit work inside the pinned
  `debian:trixie-20261005@sha256:913f6706…` image (lockfile `webkit.ci_image`).

## What changed
Zen side (apps/browser/chrome), all new unless noted; CEF files untouched:
- `EngineStreamClient.sys.mjs`: engine-neutral engine-stream-v1 client: AXCF reader with optional §6.1
  damage, exact target/generation adoption, one-credit frame acks (stale frames too), request ids
  `<prefix>-<n>` ≤ 100,000, bounded in-flight requests and input queue (backpressure ends the engine),
  heartbeat watchdog, fixed diagnostic codes, profile object for engine specifics. Written so CEF can later
  become a profile (the planned engine-neutral extraction); nothing in CEF depends on it yet.
- `WebKitEngineAdapter.sys.mjs`: WebKit fixture profile (§8.1): ready identity checked against the lockfile
  pins (test keeps them equal), every web capability must be false, `target.engine:"webkit"`, no key verdicts,
  `ime_commit_text` (≤1024), WebKit cursors default/pointer/text, history restore with HTTP 200 or 0, exit
  codes reported as `ENGINE_EXIT_70/76`. `webkitAvailability()` reasons; `launchWebKit()` spawns
  `$AXIOSOZO_BUILD_ROOT/webkit/AxioWebKitHost --stream <profile> <profile>` with exactly
  PATH/HOME/TMPDIR/LANG, a fresh 0700 profile under the session runtime, removed on exit.
- `WebKitPresenter.sys.mjs`: canvas overlay in the tab's own `browserStack` (Gecko browser kept loaded and
  hidden); damage-rect conversion/upload (only the changed rectangle reaches `putImageData`); pointer, wheel
  (rAF-coalesced, engine-stream sign), keys with XKB hardware codes (evdev+8 table by `KeyboardEvent.code`),
  Zen keeps Ctrl/Alt/Super/F-key shortcuts (no verdicts), Ctrl+C/X/V/A/Z/Y → `edit`, unknown printable keys →
  `ime_commit_text`; focus/visibility/resize; back/forward/reload/stop, `UpdateBackForwardCommands`,
  `openTrustedLinkIn` (fixture URLs load in WebKit, anything else returns the tab to Firefox first), tab
  label/title/URL bar. Failure, crash, protocol violation, failed fixture load or a Gecko navigation racing the
  switch → overlay removed, Gecko tab shown unchanged. Switching back loads WebKit's current fixture address in
  Gecko. Diagnostics: frames, damage frames, uploaded vs full pixels, draw time; `captureFixtureFrame()`.
- `WebKitEngineControls.sys.mjs`: three-engine facade with the full `engineProbe` surface (`switchTo`,
  `switchToWebKit/Chromium/Gecko`, `setTabEngine`, `applyEnginePreference`, `engineOf`, `isGeckoTargetActive`
  (revokes Gecko authority for WebKit-owned tabs), `currentPage`, `navigate`, `focus`, `diagnostics`,
  `captureWebKitFrame`, `dispose`). Chromium ↔ WebKit goes through Gecko. A toolbar indicator
  (`#axiosozo-webkit-indicator`) shows while a tab is in WebKit and returns it to Firefox. Returns null on
  macOS/other platforms or without `AXIOSOZO_WEBKIT_BINARY`, so nothing changes there.
- `AxioSozoStartup.mjs` (3-line hook): `engineProbe = installWebKitEngine(..., {chromium}) ?? chromiumProbe`.
- `EngineRegistry` webkit entry: label "WebKit" (was "Safari": WPE is not Safari), devLabel "WebKit (WPE)",
  availability from `webkitAvailabilityFor(window)`. `EngineTabMenu`: one menu per window with a delegate
  stack (the three-engine controls take over CEF's two-engine menu without editing CEFPresenter).
  `EngineTabs`: installs for the facade (`tabSwitch`) and cycles via `switchTo`. `icons/engine-webkit.svg`
  (own neutral glyph) + CSS rule. `BrowserCoordinator` target engine set gains `webkit`.
- Contracts/core: `contracts/ipc-v1.schema.json` engine enums + `crates/browser-core` `Engine::Webkit`
  (additive; test `webkit_engine_is_its_own_identity`).
Tooling: `scripts/gui_engines/webkit.py` (standard harness hooks + `roundtrip()`), `scripts/webkit_zen_e2e.py`,
`scripts/webkit_package.py` (`host`; `overlay-chrome` TEST-ONLY), `scripts/webkit_zen_container.sh`,
`apps/browser/tests/webkit-engine.test.mjs`, `apps/browser/tests/webkit-host-live.test.mjs`,
`.github/workflows/linux-webkit-zen.yml`, `docs/CAPABILITY_MATRIX.md` (WebKit column + gates),
`docs/evidence/linux/webkit-zen/`.

## Commands / runs and results
- Local: `node --test apps/browser/tests/*.test.mjs` → 2897 tests, 2872 pass, 5 fail; the same 5 fail on the
  unmodified tree (project-reader integration, native-understand process: macOS helpers). Engine suites 0 fail.
  `cargo test -p browser-core` 11/11. `cargo fmt --check` clean (after commit "rustfmt").
- Actions `linux-webkit-zen` run **39305854779**: unit PASS, adapter PASS, e2e NOT_VERIFIED (no artifact).
  Run 39303310867: unit PASS (182 node tests, 0 fail), adapter failed (Node permission, fixed).
  Runs 39303695535 (cancelled) / 39305258878: adapter timed out in the test's own stdin shim (fixed; not an
  adapter bug). Results: `ci-results:cloud_webkit-zen/<run>-1-webkit-zen-{unit,adapter,e2e}/`.
- PR `Linux check and test` run 39303745122 failed on `cargo fmt` (my test; fixed) and the coordinator
  lifecycle test gate, which fails the same way on `cloud/linux-cef` (39304094231): not this branch's.

## Verified vs NOT_VERIFIED
- PASS (unit, scripted host): profile/ready validation, damage handling, generations, stale input, restore rules,
  cursor set, exits 70/76, presenter (content-area overlay, damage-only upload, input routing, address bar, back,
  return to Gecko, crash/failed-candidate/raced-navigation keep Gecko), facade (null on macOS, authority
  revocation, preference refusal), registry/menu/glyph three-engine behaviour.
- PASS (component, real WPE 2.48.3 host, run 39305854779; frames inspected): see
  `docs/evidence/linux/webkit-zen/STATUS.json` (typed "wk" visible in the field, scroll, page 2, back restore 200,
  resize, clean exit).
- NOT_VERIFIED: Zen GUI E2E (WebKit pixels inside the Zen window, input through Zen, clean return) — waits on
  the first Linux Zen build artifact (`linux-zen-build.yml` run 39293018395 on `cloud/linux-platform` was in its
  mach build step at 19:05Z; run 39297942600 queued behind it). Chromium leg on Linux (needs cloud/linux-cef in
  a Linux build). Per-context WebKit preference storage (context-v1 cannot carry `webkit`).

## Blockers
- No Linux Zen build artifact yet (owned by cloud/linux-platform).

## Interface / contract notes for other workstreams
- Integration lead: AxioSozoStartup hook (3 lines); `BrowserCoordinator` accepts `webkit` targets;
  ipc-v1/browser-core enum change is additive.
- cloud/linux-cef: no CEF file was edited. `EngineStreamClient` duplicates the protocol core on purpose; the
  later extraction can make CEF a profile (needs surface mode, web mode, UI delegation and a11y hooks).
  `EngineTabMenu` now keeps one menu per window; a later installer takes over until it disposes.
- cloud/linux-platform: `scripts/webkit_package.py overlay-chrome` is the TEST-ONLY way to run this commit's
  chrome JS on a prebuilt artifact; `gui_test.py` is used unchanged (the WebKit plug-in appends its test pref
  to the throwaway profile's user.js in `browser_environment`). Note `native/webkit-host/probe.py` defaults its
  build root to `<checkout>/.local/build`, `storage.py` to `<checkout>/.build`: set `AXIOSOZO_BUILD_ROOT`.
- cloud/webkit-host: no host change needed so far. Wished: a hello/ready field for the host's own build
  fingerprint so Zen can bind to the exact binary; `frame_rate` hello from Gecko's vsync.
- contexts: storing `engine_preference:"webkit"` needs a context contract version (readers reject it today).

## Next steps
1. When an `axiosozo-zen-linux-x86_64` artifact exists (`gh api 'repos/AxioSOzo/AxioSozo-browser/actions/artifacts?name=axiosozo-zen-linux-x86_64'`),
   push any change under the workflow paths to `cloud/webkit-zen` (or re-run the latest linux-webkit-zen run):
   the e2e job runs `gui_test.py --engine webkit` and `webkit_zen_e2e.py`; read
   `ci-results:cloud_webkit-zen/<run>-1-webkit-zen-e2e/{steps.log,harness/,roundtrip/}` and inspect the PNGs
   (`roundtrip/02-webkit.png`, `03-typed.png`, `05-scrolled.png`, `06-page2.png`, `07-back.png`, `08-gecko-again.png`).
2. Likely first fixes there: Zen runtime libraries on Debian 13 (`scripts/linux_packages.py gui` names),
   omni.ja layout for the overlay, tab-menu geometry in Zen's sidebar, Alt+Left in Xvfb.
3. Pin the Debian GUI package versions recorded in `dpkg-installed.tsv`/`deb-sha256.txt` of the first e2e run
   into `upstreams.lock.json` (today only the WPE packages are pinned with sha256; GUI deps come from the signed
   trixie index and are recorded per run).
4. Then: Chromium leg once CEF runs in a Linux Zen build; context-v2 `webkit` preference; WebKit web mode only
   after dialogs/permissions/downloads/TLS UI and a security-supported WebKit pin.
