Status: DONE

# Handoff: CEF/Chromium engine host on Linux (`cloud/linux-cef`)

PR (draft, into `cloud/integration`): https://github.com/AxioSOzo/AxioSozo-browser/pull/3

The acceptance for this workstream is met:
- `linux-cef-host` runs are green with E0, stream, security, input, web and damage
  all PASS on Linux x86_64 **and** aarch64, with the Chromium sandbox on.
- I read the frame PNGs myself.
- The macOS compile-check job is green.

Nothing is READY. **E1/E2 (Chromium inside Zen) on Linux are NOT_VERIFIED.** No
Linux Zen app artifact exists yet; see Blockers.

## Machine resources

- **This session:** Claude Code cloud container.
  - `Linux 6.18.44-fc-v139 x86_64`, 4 vCPU, 15 GiB RAM, about 29 GiB free disk.
  - Ubuntu 24.04, GCC 13.3, CMake 3.28, Node 22.22.
  - The network allowlist blocks cef-builds.spotifycdn.com, so every CEF build and
    run happened on GitHub Actions.
  - Locally I ran only the CEF-free native tests (transport, damage, a11y-core, core,
    and the exit watchdog against a stub header), `test_probe.py` and the node tests.
- **Actions:** GitHub-hosted runners.
  - `ubuntu-24.04`: x86_64, 4 vCPU, 15.6 GiB, kernel 6.17/7.0 azure.
  - `ubuntu-24.04-arm`: aarch64.
  - `macos-15`: macOS compile check only.
  - Each runner's resources are in `machine.txt` of its evidence.

## What changed

**Host: portable core and Linux layer (`native/chromium-host`)**
- **GCC 13 build fix.** `core/a11y_bridge.inc` included libstdc++ and CEF headers
  inside `namespace axio::host`. They now sit at the top of `host_core.cc`.
- **arm64 build.** CMake sets `PROJECT_ARCH=arm64`; CEF's cmake assumed
  `-m64 -march=x86-64`.
- **Process singleton.** When `$TMPDIR` (the profile) is too deep for Chromium's
  ProcessSingleton socket (108-byte `sun_path`, FATAL abort), the host uses its own
  0700 `/tmp/axio-cef-XXXXXX`. It removes it on exit.
- **Opaque white base background** for windowless browsers. CEF's default alpha 0
  made unstyled pages transparent, which would show black in Zen's opaque canvas.
- **Precise wheel.** `precise:true` wheel events carry
  `EVENTFLAG_PRECISION_SCROLLING_DELTA`, so they apply at once. Notches keep
  Chromium's smooth-scroll animation. Both are measured below.
- **Optional `frame_damage` on the AXCF pipe.** The semantics are those of
  engine-stream-v1 §6.1:
  - `transport.hpp` `frameWithDamage()` merges the damage of a replaced pending
    frame, and makes the frame after a dropped one whole. `frame()`, which macOS
    uses, is byte-identical.
  - The core takes the bounding box of CEF's dirty rects. Frames are whole after
    create, resize, navigation, show and popups.
- **E0 exercise** starts at the loaded page's first paint. Chromium holds input until
  a document's first frame. Fresh runners painted 4–11 s after load.
- **Shutdown.** After CEF shutdown the host ends its zygotes at once (they would
  live until the host exits) and gives other helpers 1 s (`reapHelpers`).
  Close-to-exit is 0.12 s.
- **Diagnostics:**
  - the first 24 undelivered paints with their reason (`AXIO_CEF_PAINT_DROPPED`);
  - wchan/syscall of the owned processes when E0 has no paint.

**probe.py and the tests**
- **probe.py:**
  - The Linux process type is read from the rewritten Chromium process title.
  - SUID-sandboxed (non-dumpable) renderers count as layer-1 `suid`.
  - `cef/linux` is an alias of `cef/<linux64|linuxarm64>`.
  - The default Linux build root is `<checkout>/.build`, the same as `./dev`.
  - `transport-damage-test` was added to `test-native`.
- **Test scripts** (`stream_test`, `stream_security_test`, `input_test`,
  `web_stream_test`, `damage_test`):
  - Without a usable CEF build they print `{"status":"BLOCKED_ENV"}` and exit 2.
  - New `damage_test.py` rebuilds every frame from its damage rectangle and compares
    it with the full payload byte for byte.
  - `input_test` (Linux) adds cursor forwarding, AltGr text, XKB code/location/key
    mapping, and wheel-notch and precise-wheel measurements.
  - `web_stream_test`:
    - evidence frames are the first painted frame of a document;
    - the opaque white background is asserted;
    - the right-click repeats while Chromium holds the old paint, and the attempt
      count is recorded.

**Zen side (`apps/browser/chrome`)**
- `CEFEngineAdapter.sys.mjs`:
  - `expectedCEFPlatform(Services.appinfo.OS, XPCOMABI)`. macOS is always `macosarm64`.
  - `CEF_PLATFORMS`.
  - `CEFHostConnection({platform})`: `ready.platform` must match, and surface mode is
    macOS-only.
  - Linux build roots: absolute, normalized, never /proc, /sys or /dev.
  - `cefBinaryPaths()`, which includes the `cef/linux` alias.
  - `cefHostEnvironment()`: Linux adds `HOME=profile` and a well-formed
    `DISPLAY`/`XAUTHORITY`.
  - `frame_damage` is negotiated on Linux pipe hellos and validated in `readAXCF`.
  - A frame after a delivery gap is presented whole.
- `CEFPresenter.sys.mjs`:
  - `keyboardPlatform(win)`.
  - The `LINUX_KEYS` XKB table, plus a US-layout `linuxWindowsKeyCode` fallback for
    keyCode 0.
  - Linux routing:
    - Ctrl is the accelerator;
    - Ctrl+arrows, Ctrl+Backspace/Delete and Ctrl+Home/End stay with the page;
    - Alt+Left/Right/Home go to Zen;
    - Super chords go to Zen;
    - lone modifier presses go to the page.
  - Linux modifier flags: NumLock 256, keypad 512, left 1024, right 2048, AltGr 4096,
    repeat 8192.
  - The IME proxy editor in pipe mode on Linux (GTK IM, compose, dead keys).
  - Pointer buttons above 2 are not sent on Linux; X11 back/forward are Gecko app
    commands.
  - Precise = `deltaMode 0` on Linux.
  - Damage-only conversion and upload (`bgraRegionToRGBA`,
    `diagnostics().uploadedPixelShare`).
  - macOS paths are unchanged.
- Node tests: `apps/browser/tests/cef-adapter.test.mjs`, 39 → 49 tests. All suites
  that import CEF modules pass: 146 tests.

**GUI harness plug-in.** `scripts/gui_engines/chromium.py` replaces the stub
(marked "owned by cloud/linux-cef"), with unit tests in
`tests/test_gui_engine_chromium.py`.
- Fixture-mode engine probe env, then `probe.py check`.
- It switches the loaded fixture tab with `engineProbe.switchToChromium()`.
- It asserts rendering only from engine-reported state: presenter frames, the
  `native-osr-bgra` render path, the host title on the tab and the hidden Gecko
  browser.

**Contract and docs**
- `contracts/cef-v1.md`: a backward-compatible "Linux hosts" section.
- `native/chromium-host/README.md`: a "Linux" section.
- `docs/evidence/linux/cef/`: evidence from run 39303367159, both architectures.

**CI (`.github/workflows/linux-cef-host.yml`)**
- A matrix of `ubuntu-24.04` and `ubuntu-24.04-arm`.
- The CEF archive cache is saved even when a later step fails.
- The node tests are a gate.
- `verdict.json` fails the job unless every gate passed.
- A D-state kernel-stack sampler runs during E0.
- `publish-ci-results` uses job-level `contents: write`.
- New job `zen-gui-chromium`: the newest `linux-zen-build` app artifact plus this CEF
  host under `./dev gui-test --engine chromium`. It records BLOCKED_ENV while no
  artifact exists.

## Actions runs (all `linux-cef-host` unless named)

| run | result |
| --- | --- |
| 39292919752 | first GCC build OK. Every CEF run aborted: ProcessSingleton `sun_path` too long. |
| 39293410864 | security, input and web PASS. E0 and stream FAIL: the sandbox-observation parser. |
| 39294505247 | stream and input PASS. E0 typed before the first paint. Web FAIL: my `painted()` check against a flat-colour page. |
| 39295110390 | precise and notch wheel measured. E0 had no paint (cold runner). Cursor check flaky. |
| 39295957092 | E0, stream, input and damage PASS. Web: right-click before paint. |
| 39296540039 | arm64 build failed (`-m64`). x64 E0 had no paint again. |
| 39297085450 | arm64 builds and passes stream, security, input, web and damage. D-state stacks point to first-run file I/O. |
| 39297617871 | E0 PASS on both. Web FAIL on both: no paint after the dialog cancel, diagnosed in later runs. |
| 39298358067 | **x64: all 10 gates PASS.** arm64 web: right-click held. |
| 39298920882 | **x64 and arm64: all gates PASS.** |
| 39299854787 | **x64 and arm64: all gates PASS.** `Linux check and test` 39299863741 success. |
| 39301113687 | **x64 and arm64: all gates PASS.** zen-gui-chromium BLOCKED_ENV. `Linux check and test` 39301123611 success. |
| 39302145874 | x64 E0 FAIL: a helper outlived the host. arm64 PASS. Led to `reapHelpers`. |
| 39302726441 | **all PASS**, but close-to-exit was 3.13 s. Led to ending the zygotes at once. |
| 39303367159 | **all PASS, x64 and arm64, current host code.** Close-to-exit 0.118 / 0.121 s. macos-compile success. zen-gui-chromium BLOCKED_ENV (no app). |

The `Linux check and test` workflow (linux-platform's, run on this PR):
- 39298926885 failed: my `stream_test.py` raised a BLOCKED_ENV traceback.
- That is fixed. 39299863741 and 39301123611 succeeded, with `TEST: 16 PASS, 0 FAIL,
  2 BLOCKED_ENV`.
- On this branch, `probe.py test-native` and `test_probe.py` now PASS on Linux.

Read the results with:
- `git fetch origin ci-results`;
- `git ls-tree -r --name-only origin/ci-results -- cloud_linux-cef/39303367159-1-linux-ubuntu-24.04/`
  (and `…-arm/`, `…-zen-gui-chromium/`).

## Verified (from the runs above)

- **PASS on x86_64 and aarch64:**
  - build: GCC 13, `-Werror`, the distribution's flags;
  - `probe.py check`;
  - test-native: transport, damage, a11y-core, core, exit watchdog and reapHelpers;
  - `test_probe.py`;
  - E0, stream, security, input, web, damage;
  - node tests.
- **Sandbox:** renderers run with `Seccomp: 2` in their own PID namespace under the
  SUID `chrome-sandbox` (layer1 `suid`); AppArmor blocks unprivileged user namespaces
  on the runners. No orphans after exit.
- **Frames I inspected:** E0 loaded and typed "CEF", stream at 1×, a pinch zoom,
  the web page, the POST result (white background), a second tab and the damage
  fixture. These are real Chromium paints.
- **Linux input at the host level:**
  - XKB codes give DOM code/location/key: Numpad1:3:1, ShiftRight:2:Shift,
    ControlLeft:1:Control, KeyQ+keyCode 65 → KeyQ:0:a, Backquote:0:`.
  - AltGr text "€" is inserted.
  - The cursor follows the page: pointer/text/default.
  - A wheel notch animates (6–9 positions over 110–160 ms); a precise delta applies
    at once (1 position).
- **Frame damage:** 38 of 40 frames partial, 0 reconstruction mismatches, largest
  damage 0.27 % of the view, a resize gives a whole frame.
- **macOS:** host.mm and surface_transport.mm (browser and helper), and the portable
  core, compile against the pinned macOS headers.

## NOT_VERIFIED

- **Inside Zen on Linux:**
  - Chromium tab rendering (E1/E2);
  - the presenter's Linux keyboard routing, the IME proxy, dead keys and compose;
  - back/forward buttons;
  - damage uploads in the canvas;
  - the `chromium.py` GUI plug-in.

  All of these have node or unit tests only. There is no Linux Zen app yet.
- **macOS runtime.** No macOS run happened. The macOS host sources were not
  modified apart from `transport.hpp`, whose `frame()` path is unchanged.
- **Accessibility:** AT-SPI exposure of the mirrored tree. Wayland-native
  clipboard (Wayland-only sessions fall back to headless ozone).
- **D-Bus/libsecret** for the persistent web profile: still an open decision. The
  host passes no D-Bus address, so Chromium uses its basic store.

## Blockers and known limits

- **No `linux-zen-build` run has produced the `axiosozo-zen-linux-x86_64` artifact
  yet.** 39293018395 finished with **failure** at 18:58 UTC and uploaded no app artifact. 39297942600 started at about 19:00 UTC; it is linux-platform's build. When
  one succeeds, push any change under the workflow's paths, or re-run job
  `zen-gui-chromium` of the newest `linux-cef-host` run, to get Chromium-in-Zen
  evidence on Linux.
- **Cold first paint.** On a fresh runner the first paint arrives 4–11 s after load:
  the browser and GPU processes wait on first-run file reads outside the CEF runtime
  (kernel stacks in run 39297085450). That is worth a look by the performance
  workstream: fontconfig cache, a warm-up at Zen start.
- **CEF C API key limit.** keydown/keypress `key` comes from `windows_key_code`, so
  AltGr characters report the base letter, and IntlBackslash reports "»". Inserted
  text is correct.
- **Paint holding.** Chromium drops input to a new same-origin document while it
  still holds the old paint. A very fast first click after navigation can be lost,
  as in Chrome.
- **macOS presenter.** Pointer buttons above 2 (back/forward) are sent to CEF as a
  left click. I left this unchanged on macOS to keep its behaviour identical; it
  should be fixed with a macOS run.

## Interface notes for other workstreams

- **linux-platform (`./dev`, harness):**
  - `AXIOSOZO_CEF_BINARY=<build root>/cef/linux/AxioCEFProbe` (the alias) and
    `cef/linux64/…` are both accepted.
  - `AXIOSOZO_CEF_ROOT` is the build root or its parent.
  - The default build root is now the same as `./dev`'s.
  - The CEF test scripts exit 2 with a BLOCKED_ENV JSON line when unbuilt.
  - The harness `input` scenario still locates targets through Gecko's content DOM;
    a Chromium tab needs an engine hook for screen points, which is a proposal.
- **Zen fixture mode** needs `AXIOSOZO_ENGINE_PROBE=1`, the exact
  `AXIOSOZO_ENGINE_FIXTURE_ORIGIN`, and `AXIOSOZO_SESSION_RUNTIME=<root>/runtime/<16
  hex>/<name>` whose `gecko/` is the profile. Web mode needs
  `AXIOSOZO_ENGINE_SWITCHING=1`.
- **webkit-host and performance:**
  - CEF `frame_damage` uses the same `[[x,y,w,h]]` semantics as engine-stream-v1 §6.1.
  - The presenter's damage path (`bgraRegionToRGBA`, `canvasCurrent`) is
    engine-neutral.
  - Next perf step: a damage-only *payload*. The transport already keeps full
    pixels and could crop at write time. Zen would then need a "repaint" command
    after a gap.
- **Integration lead:**
  - `upstreams.lock.json` CEF Linux pins are unchanged from the previous session.
  - I edited `tests/` (one new file) and `scripts/gui_engines/chromium.py` (the
    stub said it was owned here).

## Next steps

1. When a Linux Zen app artifact exists, run `zen-gui-chromium` (see Blockers), read
   `cloud_linux-cef/<run>-1-zen-gui-chromium/`, and fix what it shows. That is the
   first E1 on Linux.
2. Add an engine hook to the GUI harness for screen points. Then run
   `scenario_input` against Chromium: xdotool typing, IME and dead keys through the
   proxy editor, Ctrl/Alt routing, back/forward buttons.
3. Decide D-Bus/libsecret for the persistent web profile, and AT-SPI ownership.
4. Fix the macOS presenter's button >2 mapping, with a macOS run.
5. Investigate cold-start first paint, and consider damage-only payloads.
