# Linux CEF host evidence (cloud/linux-cef)

This is a subset of the Actions run **39299854787** (`linux-cef-host`, commit
`6a6ff57`). The full set is on the `ci-results` branch under
`cloud_linux-cef/39299854787-1-linux-ubuntu-24.04{,-arm}/`.

| arch | runner | gates |
| --- | --- | --- |
| `x86_64/` (linux64) | GitHub-hosted ubuntu-24.04, 4 vCPU | PASS |
| `aarch64/` (linuxarm64) | GitHub-hosted ubuntu-24.04-arm | PASS |

The gates are check, test-native, test_probe, E0, stream, security, input, web,
damage and node-tests. Each is listed in `verdict.json`.

**Labels.** Every result here is a native-component result (E0 and cef-v1 stream
tests). **E1/E2 (inside Zen) are NOT_TESTED.** Nothing here is READY.

**Setup.**
- Chromium runs with its sandbox on. The runner's AppArmor blocks unprivileged
  user namespaces, so the pinned `chrome-sandbox` is installed root:root 4755
  (`install-sandbox.log`).
- `cef-probe-result.json` and `cef-stream/result.json` record that renderers were
  observed with seccomp-bpf in their own PID namespace.
- The display is Xvfb, with the X11 ozone backend.

**Frames.** The PNGs are encoded directly from CEF `OnPaint` BGRA bytes.
- `cef-e0-*.png`: E0, typed input, 1× scale and a navigated page.
- `cef-stream/scale-1x.png`: the cef-v1 stream at 1×.
- `cef-input/pinched.png`: a pinch-zoomed visual viewport.
- `cef-web-stream/*.png`: web mode, POST result (opaque white background) and a
  second tab.
- `cef-damage/damage-last.png`: the frame-damage fixture.
