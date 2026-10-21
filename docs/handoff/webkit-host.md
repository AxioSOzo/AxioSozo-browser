Status: DONE

# Handoff: webkit-host (`cloud/webkit-host`)

PR: https://github.com/AxioSOzo/AxioSozo-browser/pull/2 (draft, into `cloud/integration`).

Everything here is component evidence for the WebKit host. None of it is Zen E1/E2, and nothing is READY.

## Machine resources
- **Cloud session:** Ubuntu 24.04, 4 vCPU, ~15 GiB RAM.
  - Ubuntu has no WPE packages: noble, plucky, questing and resolute were all checked against the archive Packages indexes.
  - deb.debian.org, snapshot.debian.org and wpewebkit.org are blocked from the session, so the WPE runtime is BLOCKED_ENV locally.
  - Locally I ran only the engine-free `probe.py test-native` (PASS; it also reproduced and verified the harness race fix with `taskset -c 0`).
- **Linux WPE runs:** GitHub Actions ubuntu-24.04 runners (4 vCPU, 16 GiB) in the pinned `debian:trixie-20261005@sha256:913f6706…` container (`upstreams.lock.json` `webkit.ci_image`).
  - Results are read from the `ci-results` branch.
  - The frame PNGs were inspected by me.

## What changed
- **`.github/workflows/linux-webkit-host.yml`** (push on `cloud/webkit-host`). Two jobs:
  - `sandbox-probe`: a bubblewrap matrix over container settings.
  - `wpe-debian13`, via `native/webkit-host/ci/container_test.sh`:
    1. Installs the pinned `.deb`s; `probe.py setup --apt` downloads them, checks each sha256 against the lockfile, then installs.
    2. Builds the host as root.
    3. Runs `probe.py check` and `probe.py test` as an unprivileged uid.
    4. Records a pin-drift report from apt's signed indexes.
    5. Publishes via publish-ci-results.
  - Runs queue rather than cancel, so every pushed head keeps its evidence.
- **`.github/workflows/linux-webkit-upstream.yml`.** Two parts:
  - `discover` reads only the official wpewebkit.org index and `.sums`.
  - `build` (`upstream/build.sh`) builds the pinned upstream tarball in the same image (clang, lld, ninja, ccache) and reruns the full suite against it (`AXIOSOZO_WEBKIT_UPSTREAM_PREFIX` / `_KEY`).
- **Host fixes found on real Linux (`host_wpe.cpp`):**
  - Device scale and size are re-dispatched after the WebView owns the libwpe backend. Before, 2× creates rendered at 1×.
  - Pointer and axis coordinates are converted to device pixels, and the wheel uses WebKit's sign. `delta_y -400` now gives DOM `deltaY 400` and scrolls 400 CSS px.
  - **Paint fence:**
    - Problem: WebKit re-renders the previous document's frozen layer tree after a commit. The first buffer after page 2 was byte-identical to page 1.
    - Fix: buffers are held until the committed document has rendered three animation frames. The host asks it via `webkit_web_view_call_async_javascript_function` in an isolated world the page can't see. There's a 2 s fallback.
    - A user-script/message-handler variant never delivered in 2.48.3 and was replaced.
  - Cache model `web-browser`: back is restored from WebKit's back/forward cache without a fetch. `document-viewer` had disabled that cache.
  - `AXIOSOZO_WEBKIT_TRACE=1` turns on diagnostics: buffer exports, load events and fence decisions.
- **Tests:**
  - Fixed a harness race. Events are written before frames, so a frame could precede its title event and the harness then waited forever; this showed up on fast runners and under one CPU.
  - New pixel-region assertions: typed text visible in the field; page 2 has no old-document pixels; back keeps page-1 state with no re-fetch; exact wheel delta.
  - Per-frame, command and host traces.
  - Every suite runs even after one fails.
  - The pixel checks are gated to `port == 'wpe'`, so the macOS scaffold path is unchanged.
- **Pins (`upstreams.lock.json` `webkit`):**
  - `ci_image` added.
  - `debian.snapshot` added (fallback).
  - **xdg-dbus-proxy bumped to 0.1.6-1+deb13u3** (trixie-security; sha256 from apt's signed index, run 39319667574). deb13u2 was behind a security update.
  - `upstream` added: 2.54.1, sha256 `0de8bdfb…3fe9`. `upstream.previous_stable`: 2.52.6. Both come from the official `.sums` (run 39295390702).
  - Status is now `PINNED_PASS_LINUX_FIXTURE`.
- **Docs:**
  - ADR renumbered 003→004 (`docs/adr/004-webkit-engine.md`). It now records the Linux findings, the measured upstream builds and the recommendation.
  - `contracts/engine-stream-v1.md` §8.1 has new rows 20–23 and updated rows 6/13.
  - README updated.
  - `docs/evidence/linux/webkit/STATUS.json` plus curated evidence: `run-39297810722/` (8 PNGs), `upstream-2.54.1-run-39389167585/` (3 PNGs) and the sandbox matrix.

## Commands / Actions runs and results
| Run | What | Result |
| --- | --- | --- |
| 39293842171 | first Linux run; sandbox matrix | pins install, host links (7 s). Harness race found. bwrap needs runner `kernel.apparmor_restrict_unprivileged_userns=0` + container `seccomp/apparmor/systempaths=unconfined`; each alone fails with a distinct error |
| 39294885122 | — | security suite PASS on real WPE; 2× creates got no frames (scale bug) |
| 39295390650 / 39295936869 / 39296320523 | — | stream PASS, but the PNGs showed a stale page-1 frame under page-2's generation. Fixed coordinates; traced the stale frame |
| 39296479530 | — | input suite fully PASS |
| 39296774826 | — | full PASS with the fence (fence still opening by timeout) |
| **39297810722** (attempts 1+2), 39298405704, 39298571156, 39319667574, **39319916093**, 39389167659 | `probe.py test` on Debian 2.48.3 | **all green**. 39319916093 includes the bumped xdg-dbus-proxy pin |
| 39295390702 | upstream discover | official index/sums; 2.54.1 latest stable |
| 39296934153, 39319667952 | upstream builds | 2.54.1 built in 79 / 123 min, 2.52.6 in 264 / 128 min (cold). The host loaded both (`ready` 2.54.1/2.52.6). Suites failed on a missing helper RPATH (fixed) and a per-key version check (fixed) |
| **39389167585** | upstream 2.54.1 build + suite | **PASS**: built in 139 min cold, full suite green against 2.54.1, web process sandboxed |
| 39599218903 | upstream rebuild with the fixed (absolute) ccache path | queued at handoff time; its job is to save a warm cache |

Local commands run in the session: `python3 native/webkit-host/probe.py test-native` (PASS), and `tests/core_test.py` under `taskset -c 0` (race reproduced 5/5, fixed 3/3).

## Verified vs NOT_VERIFIED
**PASS on Linux (Debian 2.48.3 pin, and upstream 2.54.1):**
- Real WPE frames at 1800×1300 2×, 2000×1400 2× and 800×600 1×.
- Typed text through WebKit's input-method commit path; down/char/up inserts once; `ime_commit_text`.
- Resize and scale; GET page 2, back (bfcache), forward with exact +1 generations.
- Stale-target rejection after navigation and back; history boundary.
- Exact computed damage.
- Input: buttons, click focus, drag, XKB keycodes, wheel pixel delta, cursor text/pointer, dpr 2/1, no frames while hidden.
- 13 negative cases with exact exit codes (wrong token, dup/unknown ACK, replay, unknown key, malformed, overlong, denied URL, web/surface hello, EOF, shutdown).
- `WPEWebProcess` under bubblewrap; no orphan processes; private profiles removed.
- Heartbeat cadence; frozen-host silence.

**NOT_VERIFIED:**
- Warm (ccache) upstream build time. The `../ccache` path restored an empty cache; it's fixed but not yet measured.
- Zen E1/E2 with WebKit.
- IME composition (`ime:false`).
- `frame_damage` from native WPEPlatform damage (damage is computed).
- macOS scaffold compile after this change. Only Python test gating and a doc comment changed for it; no Mac was available.

## Blockers
None for this workstream. The cloud session can't run WPE locally (allowlist; no Ubuntu packages), so all Linux WPE work runs in Actions.

## Interface / contract notes for other workstreams
- **Zen adapter:**
  - Follow engine-stream-v1 §8.1.
  - Pointer and wheel stay CSS px on the wire; the host scales.
  - The paint fence means a new document's first frame arrives only once it has rendered (navigate→frame ~0.2 s on CI). Zen never receives old-document pixels under a new generation.
  - Back restores from bfcache with `http_status` 200 and `restored_from_history:true`. WebKit clears `autocomplete=off` fields on restore.
- **`cloud/linux-platform`** (`scripts/gui_engines/webkit.py`):
  - Call `python3 native/webkit-host/probe.py setup --apt|check|test`. Each prints one JSON status line and exits 0 only on PASS.
  - Run it as an unprivileged user on Debian 13 or the pinned container.
  - In containers, bubblewrap needs the three settings above. Never set `WEBKIT_DISABLE_SANDBOX_THIS_IS_DANGEROUS`; the host exits 70 if it is set.
- **Performance workstream:**
  - Linux copies pixels SHM → host → pipe.
  - 2.54 installs `wpe-platform-2.0` (headless/DRM), the route to native damage and DMA-BUF.
  - Identical consecutive frames are still sent without `frame_damage`. Skipping them is an easy win.

## Precise next steps
1. Wait for upstream run 39599218903 to finish (cold, saves the cache at `/home/runner/wpe-ccache`). Then re-run it (`gh api -X POST repos/AxioSOzo/AxioSozo-browser/actions/runs/39599218903/rerun`) and read `ci-results:cloud_webkit-host/39599218903-2-build-upstream/{ccache-before.txt,build-time.json}` for the warm build time. Record it in ADR 004.
2. Product pin decision (ADR 004 recommendation):
   - Keep Debian 2.48.3 for the loopback fixture only.
   - Before any web mode, switch the product pin to upstream 2.54.1 (or newer) built from the pinned tarball. Ship that build as a cached CI artifact keyed by the lock entry, and track WebKit security advisories.
3. Zen-side `WebKitEngineAdapter` (separate workstream). Wire `scripts/gui_engines/webkit.py` to `probe.py` (`cloud/linux-platform`).
4. Next input-fidelity steps:
   - IME preedit via `WebKitInputMethodContext` `get_preedit`.
   - Cursor beyond link/text/default (WPEPlatform cursor API on 2.54).
   - Native damage via WPEPlatform.
