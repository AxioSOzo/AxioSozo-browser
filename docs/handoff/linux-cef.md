# Handoff: CEF/Chromium engine host on Linux (`cloud/linux-cef`)

Status: **WIP, NOT_VERIFIED on Linux.** This session ran on the owner's macOS laptop
(remote isolation fell back to local), so no Linux build or CEF run happened locally.
GitHub Actions, on the hosted ubuntu-24.04 runner, did download and verify the pinned
linux64 archive. The first CMake configure failed (`project()` lacked C); the fix is
commit `fa9f968`. Its CI run (39291055281) was still in progress at handoff. Its result
is unknown here. Read it before you trust anything below. Nothing in this branch is
E0/E1/E2 evidence yet.

Machine used for this session: Darwin 27.0.0 arm64 (MacBook Pro, 10 cores, 16 GiB RAM,
127 GiB free on the data volume). That is not a Linux cloud machine. The next session
must record its own `uname -a; nproc; free -h; df -h`.

## What is done (committed)

- **Pins** (`upstreams.lock.json` → `cef.platforms`): the same CEF 154.0.23 /
  Chromium 154.0.8037.17 minimal distributions for `linux64` and `linuxarm64`, next to
  the unchanged macOS pin (which is also repeated in the table).
  - The sha1 values come from cef-builds.spotifycdn.com/index.json.
  - The sha256 values were computed while streaming each archive, and those archives' sha1 matched the index.
  - linux64: 326,915,001 bytes, sha256 `8beed341…1369d`.
  - linuxarm64: 424,499,168 bytes, sha256 `0d52ceed…e045f`.
  - The linux64 archive holds an unstripped `libcef.so` of about 1.45 GB.
- **Portable C++ core** (`native/chromium-host/core/`). It is a line-by-line port of
  `host.mm` + `stream.inc` + `input.inc` + `a11y.inc` to C++20, with no exceptions and no RTTI:
  - `json.hpp` is a strict RFC 8259 parser (it rejects duplicate keys, invalid UTF-8 and lone surrogates). Its canonical writer sorts keys.
  - `url.hpp` is a strict splitter. A `@` or `\` in the authority counts as user info, so it is rejected.
  - `cef_util.hpp` holds the `p_cef_*` function table, `Ref<T>`, `AXIO_HOLD` and UI-thread tasks (`postUI`, built on `cef_post_task`).
  - `platform.hpp` is the platform hook interface.
  - `png.hpp` is a zlib PNG encoder for the E0 frames.
  - `host_core.cc` with `delegation.inc`, `input.inc`, `a11y_bridge.inc` and `handlers.inc`: the whole cef-v1 protocol. That covers hello/token, exact-key commands, target and generation binding, AXCF frames with credit flow, input (key verdicts, IME, wheel, pinch, frame rate), browser-UI prompts, downloads, favicons, the accessibility mirror (`a11y_core.hpp` unchanged), heartbeat and bounded close. It also runs the E0 exercise, now with a 1× device-scale stage, and `scale1FrameObserved`/`scale2FrameObserved` are part of the E0 result.
  - Checked so far: it compiles warning-free with clang against the pinned **macOS** headers, locally and in the CI `macos-compile` job, which passed. `tests/core_test.cc` passes.
- **Linux platform layer** (`native/chromium-host/linux/`):
  - `main_linux.cc` is the browser process. Its order: authenticated handshake first, then the API-hash check, then `browser_subprocess_path` set to `AxioCEFProbeHelper`. A parent-death watch polls `getppid` (not `PR_SET_PDEATHSIG`). It appends one fixed switch, `ozone-platform=x11` when `DISPLAY` is set, otherwise `headless`. `no_sandbox` stays 0 and `--no-sandbox` is never passed.
  - `helper_linux.cc` runs the subprocesses: `cef_execute_process` with the renderer text-input reporter.
  - `platform_linux.cc` supplies:
    - the `linux64`/`linuxarm64` label;
    - X11 arrow keycodes;
    - the Linux key-verdict probe (next section);
    - `sameKeydown`;
    - `armExitWatchdog`, which SIGKILLs every descendant found through `/proc` and then `_exit`s.
- **CMake** (`native/chromium-host/CMakeLists.txt`) uses the distribution's FindCEF flags, which include `-Werror`. It removes CEF's `-Wl,-rpath,.` and uses `$ORIGIN` instead. It links `libcef.so` directly; `libcef_dll_wrapper` is not needed because the host uses the C API, like macOS.
- **probe.py** (macOS functions unchanged, and `setup()`'s source is unchanged, so the macOS build fingerprint does not move). Linux branches:
  - The build root defaults to `<repo>/.local/build` (gitignored), or `$AXIOSOZO_BUILD_ROOT`.
  - Runtime directory: `$BUILD/cef/<linux64|linuxarm64>/`. `libcef.so` and the resources are hard-linked; `chrome-sandbox` is copied.
  - `setup` = download, verify sha256, extract, `cmake` + build.
  - `check` = build fingerprint plus sandbox status. It returns BLOCKED_ENV when no layer-1 sandbox is usable.
  - `install-sandbox` = `sudo chown root:root` + `chmod 4755` on the copied `chrome-sandbox`.
  - `test-native` = the transport, a11y-core and core tests, plus `tests/exit_watchdog_test.cc`.
  - `run` = E0. On Linux it also requires that no process outlived the host (`linux_orphans`) and that a renderer was observed with `Seccomp: 2` and its own PID namespace (`linux_process_snapshot`).
  - `host_environment(profile)`: macOS gets exactly the old PATH/TMPDIR. Linux adds `HOME=profile` (so Chromium never touches `~/.pki/nssdb`) plus `DISPLAY`/`XAUTHORITY` when set.
- **Tests ported**:
  - `stream_test.py` now has a 1× resize step, a Linux Tab keycode, timings and the Linux sandbox/orphan asserts.
  - `input_test.py` has Linux keycode pairs and uses the Ctrl+L shortcut on Linux.
  - `surface_test.py` prints an explicit SKIPPED on Linux.
  - `test_probe.py` skips the macOS fingerprint tests elsewhere and adds the Linux pin/env/snapshot tests. It passes on macOS: 18 tests, 1 skipped.
  - `stream_security_test.py` and `web_stream_test.py` needed no change beyond the shared Session env.
- **CI** (`.github/workflows/linux-cef-host.yml`; actions pinned by SHA): on push to `cloud/linux-cef`, the `linux` job records machine resources, installs the apt list, runs setup → install-sandbox → check → test-native → Xvfb → E0 / stream / security / input / web / surface-skip, and uploads `.local/ci-evidence` as an artifact. A second job, `macos-compile`, syntax-checks `host.mm` (browser and helper), `surface_transport.mm` and the core against the pinned macOS headers.

## What is NOT done or untested

1. No Linux binary has been built yet. GCC 13 with `-Werror` may report warnings that clang did not. Fix them in the core and do not relax `-Werror`.
2. No Linux run of E0, stream, security, input or web. These Linux-specific assumptions are unverified:
   - the key probe (Alt+Ctrl U+E000+seq);
   - `sameKeydown` (X11 keycode round trip);
   - ozone x11 under Xvfb;
   - `HOME`=profile;
   - the SUID sandbox detection in `linux_process_snapshot`, which treats a `chrome-sandbox` process, or the same user namespace with a new PID namespace, as `suid`.
3. Zen-side portability is **not started**, all in `apps/browser/chrome`:
   - `CEFEngineAdapter.sys.mjs` `#acceptReady` accepts only `platform === "macosarm64"`. Planned: a constructor option `platform` (default `macosarm64` so the node tests stay green), with `launchHost` passing `expectedCEFPlatform(Services.appinfo.OS, Services.sysinfo.getProperty("arch"))` (`Linux`+`x86-64` → `linux64`, `aarch64` → `linuxarm64`).
   - `launchHost` requires `/Volumes/...` roots and the `.app` binary. Planned: on Linux, accept absolute roots without `.`/`..` segments and the binary `${cefRoot}/cef/<platform>/AxioCEFProbe`. The Subprocess environment should add `HOME: profile` and `DISPLAY`/`XAUTHORITY` from `Services.env`.
   - `CEFPresenter.sys.mjs` `cefKey`/`keyboardRoute`/`cefModifiers` are macOS-only (`MAC_KEYS`, ⌘ shortcuts). Planned, with an optional `platform` argument that defaults to macOS when `Services` is absent:
     - a `LINUX_KEYS` table (event.code → XKB keycode = evdev+8, e.g. KeyA 38, Enter 36, Tab 23, Escape 9, ArrowLeft 113, ArrowUp 111, ArrowDown 116, F1 67, F11 95, MetaLeft 133);
     - Ctrl as the accelerator, with PAGE_CHORDS (word navigation) kept on the page;
     - Alt+Left/Right/Home routed to the browser chrome;
     - modifiers: AltGr = 4096 from `getModifierState("AltGraph")`, NumLock 256, keypad 512 (`location 3`), left 1024 / right 2048.
   - Add node tests to `apps/browser/tests/cef-adapter.test.mjs`. The baseline is 39/39 passing.
4. Not yet written:
   - `native/chromium-host/README.md` "Linux" section: the apt list from the workflow, commands, sandbox notes, and the D-Bus/password-store and clipboard notes below.
   - `contracts/cef-v1.md`: add the platform labels `linux64`/`linuxarm64` to `ready.platform`. Also state that a Linux `hello` must not carry `surface_*` keys; the Linux host rejects them as unknown keys (exit 64).
5. Damage rects are not implemented. The proposal (backward compatible): a hello opt-in `damage_rects:true` adds `dirty:[x,y,w,h]` (physical px, bounding box) to frame metadata. The box must be unioned when a pending frame is replaced in `transport.hpp`, and must be full-frame after a resize or navigation. The adapter currently rejects unknown frame keys, so this must stay opt-in.
6. Accessibility: the host-side mirror is ported and `stream_test.check_accessibility` should exercise it on Linux. The Zen-side Linux (AT-SPI) exposure does not exist: **NOT_VERIFIED**.
7. The `linuxarm64` pin is recorded but has never been built; you could add `ubuntu-24.04-arm` to the workflow matrix.
8. `docs/evidence/linux/` has not been created. After green CI, download the artifact and commit small JSON/logs plus one or two small PNGs (`stream_test` `scale-1x.png` is 900×650). `docs/evidence/*` is gitignored, so use `git add -f`.

## Exact next steps (on a Linux cloud machine)

```sh
git fetch origin cloud/linux-cef && git checkout cloud/linux-cef
uname -a; nproc; free -h; df -h .
sudo apt-get install -y --no-install-recommends xvfb xauth cmake ninja-build g++ zlib1g-dev bzip2 curl openssl \
  util-linux libnss3 libnspr4 libatk1.0-0t64 libatk-bridge2.0-0t64 libatspi2.0-0t64 libcups2t64 libdrm2 libgbm1 \
  libxkbcommon0 libxcomposite1 libxdamage1 libxfixes3 libxrandr2 libxext6 libx11-6 libx11-xcb1 libxcb1 \
  libxshmfence1 libpango-1.0-0 libcairo2 libasound2t64 libglib2.0-0t64 libdbus-1-3 libexpat1 fonts-dejavu-core fonts-liberation
python3 native/chromium-host/probe.py setup            # download+verify+build into .local/build/cef
python3 native/chromium-host/probe.py install-sandbox  # only if user namespaces are blocked (Ubuntu 24.04 AppArmor)
python3 native/chromium-host/probe.py check
python3 native/chromium-host/probe.py test-native
python3 native/chromium-host/test_probe.py
Xvfb :99 -screen 0 1920x1080x24 -nolisten tcp & export DISPLAY=:99
python3 native/chromium-host/probe.py run              # E0 -> docs/evidence/cef-probe-result.json
python3 native/chromium-host/stream_test.py
python3 native/chromium-host/stream_security_test.py
python3 native/chromium-host/input_test.py
python3 native/chromium-host/web_stream_test.py
python3 native/chromium-host/surface_test.py           # prints SKIPPED on Linux
node --test apps/browser/tests/cef-adapter.test.mjs
```

Alternatively, push to `cloud/linux-cef` and read the `linux-cef-host` workflow artifact
(`gh run list --branch cloud/linux-cef`, then `gh run download <id>`).

## probe.py interface for `./dev` (stable entry points)

| command | Linux behaviour | exit |
| --- | --- | --- |
| `probe.py setup` | download + sha256 + extract + CMake build; prints a JSON status line | 0 / 2 |
| `probe.py check` | built and current, plus a usable sandbox; JSON includes `sandbox` | 0 / 2 (BLOCKED_ENV) |
| `probe.py install-sandbox` | sudo chown/chmod of the copied `chrome-sandbox` (Linux only) | 0 / 1 / 2 |
| `probe.py test-native` | native unit tests (no CEF run) | 0 / 2 |
| `probe.py run` | E0 fixture run; writes `docs/evidence/cef-probe-result.json` | 0 = PASS |
| `stream_test.py`, `stream_security_test.py`, `input_test.py`, `web_stream_test.py` | print one JSON result; evidence in `docs/evidence/cef-*-XXXX/` | 0 = PASS |

Environment for Zen (`./dev`, owned by `cloud/linux-platform`):

- `AXIOSOZO_BUILD_ROOT` is the build root.
- `AXIOSOZO_CEF_ROOT` is the same root, or its parent.
- `AXIOSOZO_CEF_BINARY=$AXIOSOZO_CEF_ROOT/cef/linux64/AxioCEFProbe` (or `linuxarm64`).
- The adapter accepts these only after step 3 above.

## Design decisions

- **Core/platform split.** All protocol logic lives in the portable core. A platform supplies only `core/platform.hpp`, `main()` and the CEF function binding.
  - The **macOS host still builds from `host.mm` + `.inc` and was not touched**, because it cannot be run here and its behaviour had to stay identical.
  - Moving macOS onto the core later means porting the IOSurface surface path into the core, adding a macOS platform layer (AppKit app, crash_guard, dlsym binding), and then re-running macOS E0/E1.
  - Until then, any protocol fix must be made in both places.
- **C API, not libcef_dll_wrapper**: this keeps one style shared with macOS. FindCEF still supplies the flags.
- **Sandbox**: never `--no-sandbox`.
  - Chromium picks the user-namespace sandbox, or else the SUID `chrome-sandbox` (root:root 4755 next to the executable).
  - Ubuntu 24.04 blocks unprivileged user namespaces through AppArmor, so CI uses the SUID helper.
  - `check` reports BLOCKED_ENV when neither is available. E0 also requires that renderers were observed sandboxed.
- **Ozone**: x11 when `DISPLAY` is set, so the page clipboard is shared with the desktop, including through XWayland. Otherwise headless (process-local clipboard). A Wayland-only session therefore falls back to headless.
- **Environment**: Linux hosts get `HOME=profile`. They get no `DBUS_SESSION_BUS_ADDRESS`, so Chromium's OSCrypt uses its "basic" password store. That is acceptable for in-memory fixture profiles. It is an **open decision** for the persistent web profile, where passing D-Bus would use libsecret or KWallet instead.
- **Protocol**: no wire change. Linux announces `platform: linux64|linuxarm64`, `render_path: native-osr-bgra` and `surface:false`, and rejects `surface_*` hello keys. Copy image from the context menu is a no-op on Linux because there is no clipboard path.

## Open questions

1. Persistent web profile on Linux: pass D-Bus for libsecret, or accept the basic store?
2. Should the macOS host migrate onto the core, and when? That needs a real macOS run.
3. Who owns the Zen-side Linux AT-SPI exposure of the mirrored tree?
4. Should damage rects be negotiated now, or left to the performance workstream?
5. Local `.local/` on the owner's laptop holds small reference material only: CEF/Chromium source files, the CEF include trees, and helper scripts. No CEF binaries. It is gitignored and can be deleted.
