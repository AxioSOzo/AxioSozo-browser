# WebKit engine host (`native/webkit-host`)

Standalone out-of-process WebKit host for AxioSozo. Zen/Gecko stays the application:
this process owns no visible window and draws nothing itself. It speaks the AXCF pipe
protocol of `native/chromium-host` ([contracts/engine-stream-v1.md](../../contracts/engine-stream-v1.md),
WebKit fixture profile; deltas vs cef-v1 in §8.1) so the existing Zen adapter/presenter
can drive it with small, listed changes. Design: [ADR 004 WebKit engine](../../docs/adr/004-webkit-engine.md).

| Part | File | Status (2026-10-19) |
| --- | --- | --- |
| Engine-neutral core (hello, envelope, targets, generations, credit, heartbeat, damage) | `stream_core.hpp`, `json.hpp`, `transport.hpp` | PASS (unit + harness on Linux x86_64 and macOS arm64) |
| Linux WPE WebKit host | `host_wpe.cpp` | **PASS on Linux** (Debian 13 container, real WPE 2.48.3 frames, full `probe.py test`; Actions run 39297810722, [evidence](../../docs/evidence/linux/webkit/STATUS.json)). Component evidence only, never Zen E1/E2 |
| macOS WKWebView host | `mac/host_mac.mm` | SCAFFOLD, EXPERIMENTAL: real system WebKit, snapshot frames; passed stream + security suites on macOS 27 |
| TEST-ONLY scripted engine | `tests/fake_host.cc` | never a product binary; never WebKit evidence |

## Engine and pin (Linux)

WPE WebKit **2.48.3** (`wpe-webkit-2.0` API), libwpe **1.16.2**, WPEBackend-fdo **1.16.0**,
from **Debian 13 (trixie) main amd64** packages. Exact versions, `.deb` sha256 and the
signed index digest are in the `webkit` entry of [`upstreams.lock.json`](../../upstreams.lock.json),
together with the official wpewebkit.org source tarball sha256 (not downloaded or built).
Rendering: libwpe view backend from WPEBackend-fdo in SHM mode
(`wpe_fdo_initialize_shm`, `export_shm_buffer`): WebKit's web process renders with Mesa's
software rasterizer into `wl_shm` ARGB8888 buffers; the host copies each buffer into the
AXCF stream (BGRA8 in memory) and releases it immediately. No GPU, no display server, no
Xvfb and no Wayland compositor are needed.

Security note: trixie ships 2.48.3 without later wpewebkit security updates. That is
acceptable only for this loopback fixture profile; web browsing must first move to a
current upstream stable release built from a pinned tarball (see ADR).

## Linux setup (Debian 13 / `debian:13` container)

Packages (exact pins; `probe.py setup --apt` installs them, root or passwordless sudo):

```sh
apt-get install --no-install-recommends \
  libwpewebkit-2.0-1=2.48.3-1 libwpe-1.0-1=1.16.2-1 libwpebackend-fdo-1.0-1=1.16.0-1 \
  bubblewrap=0.12.0-1~deb13u1 xdg-dbus-proxy=0.1.6-1+deb13u3 libegl1=1.7.0-1+b2 \
  libegl-mesa0=25.0.7-2+deb13u1 libgl1-mesa-dri=25.0.7-2+deb13u1 \
  libwpewebkit-2.0-dev=2.48.3-1 libwpe-1.0-dev=1.16.2-1 libwpebackend-fdo-1.0-dev=1.16.0-1 \
  libwayland-dev=1.23.1-3 g++=4:14.2.0-1 pkg-config=1.8.1-4
```

No GUI packages are required (no Xvfb, no Weston). Ubuntu 24.04 does not package WPE
WebKit; use a `debian:13` container there. If a Debian point release supersedes a pin,
fetch the exact `.deb` from `https://snapshot.debian.org/` (sha256 in the lockfile).

The WebKit sandbox (bubblewrap + xdg-dbus-proxy) is always on: the 2.x API has no switch,
and the host exits 70 if `WEBKIT_DISABLE_SANDBOX_THIS_IS_DANGEROUS` is set. bubblewrap
needs unprivileged user namespaces; `probe.py check` probes this and reports
`BLOCKED_ENV` (never a workaround) where a container forbids them, e.g. Docker's default
seccomp profile or `kernel.apparmor_restrict_unprivileged_userns=1` on Ubuntu hosts.

## CI (`.github/workflows/linux-webkit-host.yml`)

Every push to `cloud/webkit-host` touching this directory runs `ci/container_test.sh` in the
pinned `debian:13` image (digest in `upstreams.lock.json` `webkit.ci_image`): pinned,
sha256-checked packages, host build, then `probe.py test` as an unprivileged user, and
publishes logs, result JSON and frame PNGs to the `ci-results` branch. bubblewrap needs
three CI-environment settings (runner `kernel.apparmor_restrict_unprivileged_userns=0`;
container `seccomp`, `apparmor` and `systempaths` unconfined); the `sandbox-probe` job
shows that each one alone is insufficient. They are runner/container settings, never a
product change; WebKit's sandbox stays on.

`.github/workflows/linux-webkit-upstream.yml` evaluates current upstream WPE releases
(`webkit.upstream` pins, from the official `.sums`): `upstream/build.sh` builds the pinned
tarball with a cached ccache and reruns the suites against it with
`AXIOSOZO_WEBKIT_UPSTREAM_PREFIX=/usr/local/wpe-upstream` (evaluation mode of `probe.py`).

Frame transport (engine-stream-v1 §6.2/§6.3): Linux hellos negotiate `frame_damage` and
`damage_payload`; with `frame_transport:"memfd"` the pixels sit in a sealed memfd ring that Zen
reads through `/proc/<pid>/fd`. A `frame_ack` with `frame_transport:"pipe"` (Zen could not read a
slot) moves every later frame into the pipe and re-sends each target whole. `stream_test.py`
covers all three (`damage_payload`, `memfd`, `memfd_fallback` in the result).

Diagnostics: `AXIOSOZO_WEBKIT_TRACE=1` makes the host log buffer exports, load events and
paint-fence decisions to stderr (the tests set it; the log is evidence, not protocol).

## Commands for `./dev`

Build output, profiles and run evidence default to `<repo>/.local/build/webkit` and
`<repo>/docs/evidence/<os>/webkit/runs` (both gitignored); override the build root with
`AXIOSOZO_BUILD_ROOT`.

```sh
python3 native/webkit-host/probe.py setup [--apt]   # verify/install pins, build AxioWebKitHost (g++ -O2, hardened)
python3 native/webkit-host/probe.py check           # pins, build fingerprint, bubblewrap user namespaces
python3 native/webkit-host/probe.py run             # one real stream session with frames/PNGs
python3 native/webkit-host/probe.py test            # test-native + stream_test + input_test + stream_security_test
python3 native/webkit-host/probe.py test-native     # engine-free: strict JSON, AXCF transport, core harness (any POSIX)
python3 native/webkit-host/probe.py syntax-check --sysroot <dir>   # header-only cross check (see below)
```

Each step prints one JSON line `{"component":"webkit-host","status":...}` and exits 0 only
on PASS (2 on BLOCKED_ENV/FAIL). Test scripts write `result.json`, `events.json`,
`stderr.log`, fixture request logs and lossless PNGs of actual engine frames.

What the tests prove (real host, all PASS on Linux in run 39297810722): AXCF framing; `ready` identity equals the lockfile pin;
first frame 1800×1300 at 2×; typed text via the text-commit path in title and in the field's pixels;
down/char/up inserts once; `ime_commit_text`; resize at 2× and 1×; GET navigation, back
and forward each advance both generations by exactly one; the page-2 frame never shows
the previous document (paint fence); back restores from the back/forward cache without a fetch; stale targets rejected after
navigation and back; `restored_from_history` on back; history boundary; heartbeat cadence
and silence while SIGSTOPped; computed damage rectangles exact (no changed pixel outside
the rectangle); mouse buttons, click-to-focus, drag, wheel pixel deltas and direction,
non-text keys, cursor, page `devicePixelRatio` 1/2, no frames while hidden; negative
cases (wrong token, duplicate/unknown ACK, duplicate target, replayed request id,
unknown key, malformed JSON, overlong line, denied URL, web-mode and surface hellos,
EOF, shutdown) with exact exit codes; WebKit helpers observed under bubblewrap; no
helper process survives (the host and the test runner are Linux child subreapers); each
session's private profile is removed.

## Process model and cleanup

The host is a child subreaper (`PR_SET_CHILD_SUBREAPER`) with `PR_SET_PDEATHSIG`. WebKit
runs its own UI/web/network processes (sandboxed by bubblewrap). On EOF, `shutdown`,
protocol error or SIGTERM it closes every view, releases WebKit, waits up to 5 s for its
helpers, then SIGTERM/SIGKILLs any remaining child and exits 76 if one survived. A 15 s
watchdog bounds every exit.

## Deltas from `native/chromium-host` (copied/adapted, not edited there)

- `transport.hpp`, `test_transport.cc`: copied from chromium-host at a3ab14e; only
  addition `pendingFrame()` (for damage) plus its test lines.
- Command validation, targets, generations, history-restore rule, request-id dedupe,
  heartbeat: ported from `stream.inc` fixture mode into `stream_core.hpp` (C++, no ObjC).
- `stream_test.py`, `stream_security_test.py`: adapted from chromium-host's tests; the
  shared scenario is engine-parameterized and stricter (exact generation steps, forward,
  history boundary, 13 negative cases, orphan and sandbox checks).
- Not ported: web mode, browser-UI delegation, accessibility, key verdicts, IME
  composition, pinch, favicon, Mach surface mode, Keychain notes (all CEF-specific).

## Cross header check (no Linux needed)

`syntax-check` compiles `host_wpe.cpp` with clang `--target=x86_64-linux-gnu -fsyntax-only
-Wall -Wextra` against a sysroot extracted from the pinned Debian `-dev` packages
(libwpewebkit-2.0-dev, libwpe-1.0-dev, libwpebackend-fdo-1.0-dev, libgio-2.0-dev,
libsoup-3.0-dev, libwayland-dev, libxkbcommon-dev, libc6-dev, linux-libc-dev,
libstdc++-14-dev, libsysprof-capture-4-dev; `ar x` + `tar -x` of `data.tar.*`, sha256
checked against the signed index). It proves API use against the exact pinned headers,
not linking or behaviour.

## macOS host (WKWebView, engine-surface-v1)

```sh
native/webkit-host/mac/build.sh [out-dir]          # default $AXIOSOZO_BUILD_ROOT/webkit/AxioWebKitMacHost
python3 native/webkit-host/mac/mac_test.py <host> [stream|input|security]   # pipe mode, real WKWebView
python3 native/webkit-host/mac/surface_test.py <host> <evidence-dir>        # Mach/IOSurface, standalone receiver
```

System WebKit (no download) in an offscreen, never-shown helper window; frames are
`takeSnapshotWithConfiguration` snapshots on a frame-rate clock, delivered over
engine-surface-v1 (global IOSurface ring, `surface_host.mm`) or, without `surface_service`,
as AXCF BGRA pipe frames. Private SPI (both reported in `ready.private_spi`):
`_setWindowOcclusionDetectionEnabled:` (else WebKit throttles the offscreen page to 0 Hz rAF)
and `_setOverrideDeviceScaleFactor:` (page DPR = requested scale). Decision, candidates and
measurements: [ADR 004 "macOS"](../../docs/adr/004-webkit-engine.md). CI:
`.github/workflows/macos-webkit-host.yml` (capture bench, host tests, WPE regression).
`mac/tests/capture_bench.mm` is the measurement tool behind the decision.
