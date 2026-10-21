# Cloud program summary (19–20 October 2026)

Parallel Claude Code cloud sessions worked on four goals for the AxioSozo browser (a Zen/Firefox
fork; Zen/Gecko stays the application and other engines are presented in its content area):

1. build, run and test the app on Linux;
2. add WebKit as a third engine (Gecko / Chromium / WebKit);
3. make every engine feel native inside Zen;
4. improve performance around the engines.

All Linux evidence comes from GitHub Actions (`ubuntu-24.04`, 4 vCPU, Xvfb, **software WebRender**:
no GPU anywhere) and macOS evidence from `macos-15` arm64 runners; results are on the `ci-results`
branch under `<branch>/<run>-<attempt>-<job>/`. Labels: PASS (verified in a cited run),
EXPERIMENTAL (works, fixture-only or behind a developer gate), BLOCKED_ENV (the environment lacks
something; never counted as a pass), NOT_VERIFIED (not run). **Nothing is READY.** Security review:
[SECURITY_REVIEW_CLOUD.md](SECURITY_REVIEW_CLOUD.md). Per-engine status: [CAPABILITY_MATRIX.md](CAPABILITY_MATRIX.md).

## Final matrix on one integration head

Head **ac9cefc** (cloud/final-review = cloud/integration 2065355 + the final-review changes), PR #21,
product defaults (no TEST-ONLY frame-path prefs). The Linux app is linux-perf-build **39430325744**,
built from this branch; the chrome-overlay step replaced 0 files, so every in-Zen run used the
app's own packaged chrome. Results: `ci-results:cloud_final-review/<run>-1-<job>/`.

| workflow | run | result |
| --- | --- | --- |
| Linux check and test | 39599306352 | PASS |
| linux-perf-build (app + Gecko GUI harness launch/chrome/about/fixture/input, pixel gate) | 39599306383 | PASS |
| linux-cef-host (x86_64 + arm64 host gates, macOS compile, zen-gui-chromium) | 39599306391 | PASS |
| linux-webkit-host (WPE 2.48.3, debian:13, sandbox probe) | 39599306522 | PASS |
| linux-webkit-zen (round trip, host kill, three engines, 23 feel scenarios, pixel gates) | 39599306504 | PASS |
| linux-cef-zen (frame paths default/worker/JS-memfd/pipe, fixture E1/E2, web 1× matrix, web 2×, AT-SPI) | 39599306421 | PASS (only `ime_dead_keys_compose` BLOCKED_ENV) |
| linux-perf (same-job A/B base = cloud/integration vs this tree, Chromium + WebKit, 1×/2×; soak 30 cycles / 10 min) | 39599306618 | PASS |
| linux-gecko-feel (7 before / 7 after cells) | 39599306558 | PASS |
| linux-engine-profile | 39599306580 | PASS |
| linux-engine-bench-gate | 39599306440 | PASS |
| macos-ci (compare with dev) | 39599306865 | PASS: 0 REGRESSION, 0 NEW_GATE_NOT_PASSING, 198 OK, 24 FIXED_OR_NEW_PASS, 10 PRE_EXISTING (fail on dev too) |
| macos-webkit-host | 39599306368 | PASS |
| Linux source probe, linux-webkit-feel-api | 39599306323, 39599306507 | PASS |
| linux-engine-bench | 39599306536 | all bench jobs PASS; the summary step crashed in `summarize.py` (a variable-shadowing bug that dates from perf-pixel-path; the standalone run used to be cancelled, so it never surfaced). Fixed after ac9cefc; re-run listed in the handoff |

## 1. Linux

- The Zen app builds from pinned Firefox 156 with clang 19 (cold 9146 s, run 39328797871; warm
  sccache ≈ 1150 s, runs 39337785340 / 39346931130) and packages as tar.xz + build info
  (`./dev package`). `./dev check` / `./dev test` pass on Linux with a short, documented list of
  BLOCKED_ENV-by-design gates (docs/LINUX.md; runs 39337785323, 39337919020).
- GUI harness (`./dev gui-test`, Marionette + Xvfb + xdotool + xwd): launch, chrome, about,
  fixture, input PASS (39337785340). The SWGL address-bar crash (Zen backdrop patch, `color_mask`
  panic) was fixed by linux-platform.
- CEF host on Linux (x86_64 + aarch64): E0, stream, security, input, web, damage PASS with the
  sandbox on (SUID helper on runners whose AppArmor blocks user namespaces; runs 39298920882 …
  39303367159).
- Gecko native feel on Linux (gecko-linux-feel, 39346931130): no Mac wording, CSD controls on
  GNOME/KDE, GTK dark theme, WM_CLASS, prefs equal to stock Firefox, smooth scroll 60 fps.
- Not done: .deb/.rpm/Flatpak packaging, Wayland, real GNOME/KDE sessions, GPU paths, provider
  sandbox on Linux (macOS-only helpers fail closed).

## 2. WebKit (third engine)

- Linux: WPE WebKit 2.48.3 from pinned Debian 13 packages in a digest-pinned debian:13 image,
  bubblewrap sandbox on, private 0700 profile per host. Host suites PASS (first 39297810722).
- In Zen on Linux (EXPERIMENTAL, fixture page only): Gecko → WebKit → Gecko with typing, click,
  link, toolbar Back, wheel scroll and host SIGKILL keeping the Gecko tab (39325934205); three
  engines on one tab Gecko → WebKit → Gecko → Chromium → Gecko (39337226571); feel matrix of 21
  scenarios PASS (39384321863: dialogs, permissions, file picker, IME preedit/commit, context menu,
  find, zoom, HiDPI, crash recovery …).
- macOS: a WKWebView host over engine-surface-v1 (IOSurface), host component suites PASS
  (39345979318, 39346585739, 39346635281; 42–59 fps at internal 60 Hz, input → frame p50
  12–20 ms). **In-Zen E2E on macOS is NOT_VERIFIED** (owner steps below).
- Gates: WebKit is off by default (`axiosozo.engines.webkit.enabled=false`), fixture-only, TLS
  errors fail closed; general web mode stays off until a security-supported WebKit and the full
  browser UI exist (2.48.3 has no later Debian security fixes; 2.54.1 builds, 39296934153).

## 3. Native feel

- Chromium in Zen on Linux (cef-zen-feel, cef-feel-2): E1/E2 in fixture and loopback web mode,
  1× and 2×; typing, IME proxy, selection, clipboard, wheel, cursors, select/colour popups, context
  menu, JS dialogs, beforeunload, zoom, history, middle click, Ctrl+L / Ctrl+T, fonts, overlay
  scrollbars, "Not secure" badge, datalist, find parity ("1 of 3"), downloads, permission (deny by
  default), file chooser, certificate error (fails closed), AT-SPI tree and press, host kill.
  Earlier these passed only with a TEST-ONLY `memfd_frames=false` pref; see "Chromium black
  frames" below — they now run on product defaults.
- WebKit feel: see §2. Gecko feel: see §1. Orchestrator screenshot findings:
  [handoff/feel-findings.md](handoff/feel-findings.md).
- BLOCKED_ENV: dead keys / Ctrl+Shift+U compose under Xvfb (Gecko fails them too there).

### Chromium black frames (fixed; final-review)

cef-feel-2 saw every Chromium frame 100 % black with product defaults on app 39362552105. Root
cause: in web mode the shared CEF host's adapter is built in the system-global module instance
while the presenter lives in the window's module graph; the presenter tested
`pixels instanceof NativeFrame` against its own class, so the native receiver's frame object fell
through to the JS upload path as if it were pixels (VideoFrame threw, the swizzle produced alpha-0
pixels). perf-phase3 c22eb86 replaced the test with a `Symbol.for` brand check; final-review
re-ran the current tree on that same old app and on the current app with every frame path
(native receiver, frame worker, main-thread JS memfd, pipe): all show pixels (runs 39426481907,
39427858985). Hardening: `EngineFrameSurface.accept` refuses anything but a whole BGRA buffer,
and pixel-content gates (not black, fixture text visible) now run in the GUI harness,
linux-cef-zen, linux-webkit-zen and every linux-perf soak cycle.

## 4. Performance

Software WebRender on 4 vCPU runners; same-job A/B where stated.

| step | result | run |
| --- | --- | --- |
| baseline (engine-bench) | Gecko 59 fps / key→paint 9 ms; Chromium tab 49 fps / 28.5 ms; WebKit tab 48 fps / 33 ms; Zen parent 117–151 % CPU in engine tabs | 39330954155 (components 39303324088) |
| pixel path (perf-pixel-path) | 2× Chromium 10.5 → 58 fps, 2× WebKit 6 → 49 fps; 2× key→frame Chromium 90.7 → 21.1 ms, WebKit 98.2 → 29.5 ms | 39342063334 |
| memfd frames (perf-phase2) | 2× Zen parent 122.6 → 89.5 % | 39349238042 |
| frame worker | 2× parent 109.4 → 64.1 % (Chromium), key→frame 19.3 → 11.0 ms | 39352857399 |
| native frame receiver | 2× parent Chromium 121.9 → 62.8 %, WebKit 115.1 → 53.6 %; main thread 3.6 → 0.02 ms/frame | 39364874251 |
| direct compositing + warm spare hosts (perf-phase3) | Zen parent (rAF) Chromium 1× 24.5 → 16.6 %, 2× 36.0 → 18.7 %; WebKit 1× 27.2 → 18.6 %, 2× 55.8 → 33.1 %; Gecko → engine switch Chromium 425 → 122 ms, WebKit 500 → 227 ms | 39396635363 (app 39383407870) |
| soak (30 cycles / 10 min, three engines) | PASS; RSS plateaus ≈ 3.55 GB after cycle 7, host descriptors flat | 39396878697, 39396635366 (attempt 2) |

Final round (head ac9cefc, run 39599306618, same job, alternating rounds): this tree vs cloud/integration
is within noise — Chromium 1× rAF 60 fps, parent CPU 21–22 % both, key→frame 12.5–12.8 ms both;
WebKit 1× 58 fps, key→frame 16.5–17.2 ms both; flagged deltas flip sign between rounds. Soak:
30 cycles, RSS growth 44 MB, host descriptors flat, Chromium 59.9 fps / key→frame 12.9 ms, WebKit
57.3 fps / 18.8 ms, memfd frames + native receiver, on-screen pixel checks PASS.
Not measured: GPU compositors (the blend costs removed here are smaller there), macOS in-Zen.

## Evidence index

- Handoffs (one per workstream, first line = status): [docs/handoff/](handoff/).
- Linux build/GUI: [LINUX.md](LINUX.md), `ci-results:cloud_linux-platform/`.
- Chromium in Zen: `docs/evidence/linux/cef-zen/`, `ci-results:claude_cef-feel-2-xrbczc-rgjgez/`.
- WebKit in Zen: `docs/evidence/linux/webkit-zen/`, `docs/evidence/linux/webkit-feel/`.
- macOS WebKit host: [handoff/webkit-macos.md](handoff/webkit-macos.md), ADR 004.
- Performance: [PERFORMANCE.md](PERFORMANCE.md), [perf/pixel-path.md](perf/pixel-path.md).
- macOS regression lane: [MACOS_CI.md](MACOS_CI.md) (compare against `dev`; a REGRESSION row
  means macOS behaviour changed).
- Final review: [handoff/final-review.md](handoff/final-review.md), `ci-results:cloud_final-review/`.

## Known gaps / NOT_VERIFIED

- macOS: in-Zen E2E for WebKit (and the macOS Zen build in CI); WKWebView drags (`buttons`),
  passive wheel listeners, cursor, IME composition, accessibility; external BEGIN_FRAME pacing
  20–35 fps.
- GPU machines (every number above is software WebRender), Wayland, real desktop sessions.
- IME daemons (IBus/Fcitx) and dead keys / compose under Xvfb (BLOCKED_ENV).
- WPE 2.48: `<datalist>` (no hook), popup pixel content under SWGL, Ctrl+Z after cut; the 2.54.1
  runtime's `ui_test.py` fails at double-click selection (39370679848).
- Chromium: AT-SPI focus tracking, embedded DevTools (a notice instead), portal file chooser,
  visible doorhanger screenshots; web-mode Chromium with warm spare hosts (fixture-only).
- Zen split view / glance with an engine tab; non-default squircle corners.
- Packaging (.deb/.rpm/Flatpak); provider sandbox on Linux.

## Owner verification on the Mac

On the Apple-silicon owner machine (the usual T9 / AxioSozoBuild layout; nothing in this program
changed it — CI mode is refused there):

1. `./dev doctor` (read-only; exits nonzero because the browser is not READY).
2. `./dev setup` — rebuilds Zen (with the engine-view component), the coordinator and the CEF host.
3. `./dev check` and `./dev test`.
4. `./dev engine-probe` — fresh CEF E0, then an owned Zen fixture session. Right-click the fixture
   tab → **Open in → Chromium**: Chromium frames in the content area (IOSurface path), type in the
   field, page 2 / Back, then **Open in → Firefox**.
5. WebKit (EXPERIMENTAL, fixture page only):
   `/Users/wout/.local/bin/dev-external python3 scripts/storage.py exec -- native/webkit-host/mac/build.sh /Volumes/AxioSozoBuild/webkit`,
   then `export AXIOSOZO_WEBKIT_BINARY=/Volumes/AxioSozoBuild/webkit/AxioWebKitMacHost`,
   `./dev engine-probe`, set `axiosozo.engines.webkit.enabled=true` in about:config of that session,
   reopen the fixture tab and pick **Open in → WebKit**. Expect the indicator "WebKit … · test page
   only" and `renderPath: wkwebview-snapshot-iosurface` in `about:axiosozo` diagnostics; type,
   Back/Forward, resize, switch tabs, return to Firefox; capture with `screencapture`.
6. `./dev web-probe` — loopback web mode with per-tab Chromium switching.
