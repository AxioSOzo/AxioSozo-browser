Status: DONE

# Handoff: final-review (release-quality integration pass)

PR (draft, `cloud/final-review` → `cloud/integration`): https://github.com/AxioSOzo/AxioSozo-browser/pull/21
Branch `cloud/final-review` = origin/cloud/integration 2065355 (includes cloud/merge-webkit-macos 2065355; both
re-fetched and merged at the end, no newer commits) + this workstream. Mirror: `claude/final-review-we7lqq`
(session branch, no workflow triggers). Never READY.

## Machine resources
- Cloud session: Ubuntu 24.04, 4 vCPU, ~15 GiB; node / python unit suites only, no app, no Docker.
- Actions: ubuntu-24.04 (4 vCPU, Xvfb, software WebRender, no GPU), ubuntu-24.04-arm, debian:13 container for
  WPE, macos-15 arm64. Fresh Linux app: linux-perf-build 39430325744 (cold build of this branch).

## What changed
1. **Chromium black frames — root cause, fix, gates.**
   - No reproduction on current integration code with product defaults: linux-cef-zen 39426481907
     (app 39383407870) and 39427858985 (the old app 39362552105 that cef-feel-2 used). Every frame path shows
     pixels: native receiver, frame worker, main-thread JS memfd and pipe. The in-app JS frame-path self-test
     passes.
   - Root cause: cef-feel-2's tree predates perf-phase3 c22eb86. In web mode the shared CEF host's adapter is
     built in the system-global module instance and the presenter in the window's, so
     `pixels instanceof NativeFrame` was false. The NativeFrame object reached EngineFrameSurface as pixels:
     VideoFrame threw (→ "imagedata"), the JS swizzle of an empty array-like wrote alpha-0 pixels, and the view
     was 100 % black with `nativeReceiver: null`. c22eb86 replaced the test with a Symbol.for brand check.
   - Hardening: `EngineFrameSurface.accept` throws INVALID_FRAME_PIXELS unless the source is a whole BGRA
     ArrayBuffer, so such a bug now fails the tab visibly instead of drawing black.
   - Diagnostics: the CEF presenter reports `frameRing` (native / worker / JS), `nativeSinkKind`,
     `frameUploadError` and centre pixels of source and canvas (`pixelProbe`).
   - Pixel-content gate (`gui_test.view_pixels`: not black, light page, text strokes in ≥ 3 row bands):
     - GUI harness fixture shot (all engines);
     - linux-cef-zen E1 in web and fixture mode, plus the frame-path probe (step 0, now part of the verdict);
     - linux-webkit-zen round trip and three-engine shots;
     - linux-perf soak (cycle 1 and every 10th, every engine).
   - The TEST-ONLY `memfd_frames=false` workaround is gone: linux-cef-zen runs 2–5 always use product defaults.
2. **CI hygiene.**
   - Every workflow triggers on push to `cloud/integration` / `dev` and PRs into them, path filters kept; no
     dead session branches. All workflows kept, since each holds unique coverage.
   - `linux-webkit-upstream` (≈ 6 h, evidence only) runs on a PR only when its upstream inputs change.
   - `macos-webkit-host` publishes PR results under the head branch.
   - linux-cef-host `zen-gui-chromium` used an old app without the chrome overlay: now pinned app + overlay,
     PASS.
   - linux-engine-bench's standalone run was always cancelled (shared concurrency group with linux-perf's call):
     the group now includes the caller. That exposed a pre-existing `summarize.py` crash (`args` shadowed since
     perf-pixel-path): fixed.
3. **Security review** (`docs/SECURITY_REVIEW_CLOUD.md`). Sandboxes, TLS and origin isolation are unchanged and
   fail closed, gates are unchanged or stricter, and no secrets or binaries are committed. Fixed:
   - branch-name script injection in three workflows;
   - "newest artifact" pickers trusting any branch;
   - tag-pinned actions;
   - default permissions;
   - the SUID helper install race (`probe.py install-sandbox`, now one privileged step on one open file);
   - `macos_ci.py base-shim` now refuses outside Actions or on the owner's Mac;
   - the JS memfd reader now requires the ring to be a regular file of the announced size.
   Documented, not changed: the loopback "Not secure" badge parity (also on macOS); `validLinuxRoot` dev roots;
   the worker ring check; global IOSurfaces (same as dev's CEF).
4. **macOS lane fixes.**
   - `probe.py cleanup_group`: Darwin's EPERM for a zombie-only process group ends the wait instead of crashing
     (the intermittent `cef:test_probe.py` REGRESSION row).
   - The `webkit:core_test` / `mac-stream` NEW_GATE_NOT_PASSING rows came from trees that still sent a memfd
     hello on macOS. Integration's 0e228516 asserts the refusal; the final round shows none.
5. **Docs.**
   - `README.md` rewritten: three engines, Linux and macOS quick starts, how to switch a tab's engine.
   - `docs/CAPABILITY_MATRIX.md`: consolidated engine × platform table with run ids; the WebKit platform gate
     now includes Apple silicon.
   - `docs/SETUP_STATUS.md`: banner for the cloud program.
   - New `docs/CLOUD_PROGRAM_SUMMARY.md`: per goal, headline numbers with run ids, final matrix, evidence index,
     gaps, owner Mac steps.

## Final matrix (head ac9cefc, product defaults, app 39430325744, chrome overlay replaced 0 files)
| workflow | run | result |
| --- | --- | --- |
| Linux check and test | 39599306352 | PASS |
| linux-perf-build (+ Gecko GUI harness, pixel gate) | 39599306383 | PASS |
| linux-cef-host (incl. zen-gui-chromium) | 39599306391 | PASS |
| linux-webkit-host | 39599306522 | PASS |
| linux-webkit-zen (three engines, 23 feel scenarios) | 39599306504 | PASS |
| linux-cef-zen (4 frame paths, fixture, web 1×/2×, a11y) | 39599306421 | PASS (`ime_dead_keys_compose` BLOCKED_ENV) |
| linux-perf (A/B vs cloud/integration + soak 30 cycles) | 39599306618 | PASS, A/B within noise |
| linux-gecko-feel | 39599306558 | PASS |
| linux-engine-profile / linux-engine-bench-gate | 39599306580 / 39599306440 | PASS |
| macos-ci | 39599306865 | PASS: 0 REGRESSION, 0 NEW_GATE_NOT_PASSING, 10 PRE_EXISTING (fail on dev too) |
| macos-webkit-host | 39599306368 | PASS |
| source probe, webkit-feel-api | 39599306323, 39599306507 | PASS |
| linux-engine-bench | 39599306536 | bench jobs PASS; summary step crashed (summarize.py bug, fixed after ac9cefc; re-run below) |

Earlier rounds: 28fe484 (39430325xxx, all green except the frame_selftest stat seam, fixed); diagnostic runs
39426481907, 39427858985 (session branch).

Commit after ac9cefc: `summarize.py` fix + docs (this file, summary, matrix, security review). PR re-run of
that head: see `gh api 'repos/AxioSOzo/AxioSozo-browser/actions/runs?branch=cloud/final-review'`. Only
linux-engine-bench needed it; any other run of that head duplicates ac9cefc and may be cancelled.

Screenshots inspected (ci-results `cloud_final-review/`):
- Chromium web 1× / 2× (`39430325702-1-cef-zen-e2e/web*/02-chromium.png`): full page, fonts, controls.
- WebKit with its address-bar indicator (`39430325620-1-webkit-zen-e2e/roundtrip/02-webkit.png`).
- Three-engine Chromium with the "Return to Gecko" chip (`23-three-chromium.png`).
- Gecko (`01-gecko.png`).
- No black or empty views.

## Verified vs NOT_VERIFIED
- PASS: everything in the table (Linux, software WebRender; macOS: regression lane + WebKit host component).
- BLOCKED_ENV: dead keys / compose under Xvfb.
- NOT_VERIFIED:
  - macOS in-Zen E2E (WebKit and Chromium) and the macOS Zen build in CI;
  - GPU machines; Wayland; IME daemons;
  - `<datalist>` in WPE 2.48; WebKit general web mode;
  - Chromium AT-SPI focus, embedded DevTools, portal file chooser;
  - packaging;
  - interactive `./dev engine-probe` / `web-probe` on Linux.
  Full list: docs/CLOUD_PROGRAM_SUMMARY.md "Known gaps".

## Blockers
None for this workstream.

## Interface / contract notes
- `EngineFrameSurface.accept(metadata, pixels)` requires an ArrayBuffer of exactly width×height×4 bytes;
  anything else throws `INVALID_FRAME_PIXELS`. Always test native frames with `isNativeFrame()`.
- `memfdSlotReader(pid, capability, read, stat)`: optional `stat` (defaults to IOUtils.stat); the ring must be
  a regular file of slots×slot_bytes.
- CEF presenter diagnostics add `frameRing`, `nativeSinkKind`, `frameUploadError`, `framePixels`; the CEF
  adapter adds `frameRingKind`.
- Harness: `gui_test.view_pixels(png, box)` / `Harness.assert_view_content(shot, gate, engine)`; result JSON
  `pixel_checks`.
- Workflows: pinned app = `ZEN_RUN` (linux-cef-zen, linux-webkit-zen, linux-cef-host), `plan.json zen_run_id`,
  linux-engine-profile default, `.github/gecko-feel.json after_run_id`: all 39430325744. Bump them together
  after the next compiled change. Unpinned fallbacks only accept builds of cloud/integration or dev.

## Next steps
1. Owner: review PR #21 → merge into cloud/integration, then the integration PR into `dev`.
2. Owner on the Mac: docs/CLOUD_PROGRAM_SUMMARY.md "Owner verification on the Mac" (setup, test,
   engine-probe, Open in Chromium / WebKit).
3. After merge to cloud/integration: the push triggers the full matrix there. A linux-zen-build of
   cloud/integration then becomes the unpinned fallback app.
4. Follow-ups: WebKit general web mode needs a security-supported WebKit; Chromium AT-SPI focus; macOS in-Zen
   WebKit E2E; GPU-runner measurements.
