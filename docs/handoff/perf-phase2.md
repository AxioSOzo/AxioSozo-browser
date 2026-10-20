Status: DONE

# perf-phase2 handoff (cloud session, 20 Oct 2026)

PR: https://github.com/AxioSOzo/AxioSozo-browser/pull/14 (draft, `cloud/perf-phase2` → `cloud/integration`).
Branch `cloud/perf-phase2`; mirror `claude/perf-phase2-l5jipx` (the session's designated branch, same commits).
Based on cloud/integration `d5cc1a8` (no later merge needed at the time of writing).

## Machine resources
- Cloud session: Ubuntu 24.04, 4 vCPU, no Zen app; Firefox 156 headers read from a sparse clone for API checks;
  evidence read from `ci-results` (`cloud_perf-phase2/`).
- GitHub runners: ubuntu-24.04 4 vCPU (AMD EPYC 7763 / 9V74), no GPU (software WebRender); WebKit + soak jobs in
  the pinned debian:13 image.

## What changed (all on Linux pipe mode; macOS surface path untouched)
1. **memfd fallback** (contracts engine-stream-v1 §6.3 "Fallback"): pre-hello `/proc/<pid>/fd` probe; an unreadable
   slot (one retry) → frame dropped, `frame_ack {frame_transport:"pipe"}`; both hosts switch to the pipe before the
   credit returns (CEF: pending frames whole + every view repainted; WebKit: targets re-sent whole); session latch.
   Tests: node, CEF native transport test, real-CEF `damage_test.py`, real-WPE `stream_test.py memfd_fallback`.
   CEF host: protocol failures now log `AXIO_CEF_PROTOCOL_FAILURE line=N` on stderr.
2. **memfd frames default ON** (`MEMFD_FRAMES_DEFAULT`) after the soak.
3. **Frame worker** (ChromeWorker `EngineFrameWorker.js` + `transferControlToOffscreen` + `IOUtils.openFileForSyncReading`),
   default ON with memfd when its probe passes; capture via placeholder `toDataURL`.
4. **Native Linux receiver** `apps/browser/native/engine-view/linux` (`nsIAxioFrameReceiverService`, GTK-only
   `DIRS` in engine-view/moz.build): ring mapped read-only (direct child, exact size, seals), background task queue,
   B8G8R8X8 `SharedRGBImage` on the canvas's async `ImageContainer` via the existing `SetAxioExternalImageContainer`
   patch. Default ON where the component exists (`NATIVE_RECEIVER_DEFAULT`); older apps fall back to the worker.
5. **BGRX VideoFrame upload** for the remaining main-thread path (probe-gated; whole damaged rows because Gecko 156
   ignores `VideoFrameBufferInit.layout`); `frame_upload=imagedata` keeps the JS swizzle.
6. **Bench/CI**: zen_bench XTest-paced wheel + `fps_input` (both scroll artefacts fixed: `xdotool click --repeat`
   pacing and `mousemove --sync` blocking ~15 s), parent CPU per window; `tools/pixel-path/soak.py` (+ container),
   generic A/B variants, `linux-perf.yml` driven by `tools/pixel-path/ci/plan.json` (incl. `zen_run_id`),
   `.github/workflows/linux-perf-build.yml`; one additive evidence line in `linux-zen-reusable.yml`
   (C/C++/IDL compile errors with context → `zen-setup.compile-errors.txt`).
7. Presenters: only `#draw`, capture and diagnostics touched (`frameUpload`, `memfdFallback`, `nativeReceiver`),
   plus a guarded teardown resize (placeholder canvases refuse width/height).

## Results (Actions, same-job A/B, prebuilt/branch app + TEST-ONLY chrome overlay; tables in docs/perf/pixel-path.md)
Defaults vs cloud/integration (run 39355570329, worker; and 39364874251, native, Zen parent CPU / p99 / key → frame):
- Chromium 2×: parent 126 → 82 % (worker) → 59–63 % (native); p99 33 → 24 ms; key → frame 21 → 12 ms; scroll 25 → 60 fps.
- WebKit 2×: parent 115 → 68 % → 52–54 %; p99 28–37 → 23–25 ms (native); key → frame 27–29 → 22–23 ms (native only;
  the worker alone was flat, WPE-bound); scroll 21–27 → 56 fps.
- 1×: parent −26…−29 % (Chromium, worker) / −38…−43 % (native); key → frame −30…−43 %; Chromium 1× rAF p99 is at
  the 60 fps floor (~20 ms) before and after (not improved, nothing to improve).
- Soaks PASS (39349238042 memfd/pipe, 39355570329 worker, 39366862243 native): 30 cycles / 10 min, WebKit + Chromium +
  Gecko tabs in one window, no fallback, host descriptors flat; these medians are the multi-tab numbers.

## Regressions
linux-cef-host 39351791880 / 39355570129 PASS (x86_64, arm64, macOS compile; `zen-gui-chromium` fails in its setup
step — known pre-existing probe.py check issue, same on cloud/integration); linux-webkit-host 39349713944 /
39351146838 PASS; linux-webkit-zen E2E PASS 39349714010 (VideoFrame), 39355570147 (worker), 39366816642 (native);
node suite 2908 pass / 5 fail (the same 5 pre-existing project-reader/arrival failures as cloud/integration).

## Verified vs NOT_VERIFIED
- PASS: everything above, all from cited runs.
- NOT_VERIFIED: GPU machines; macOS (untouched, never negotiates memfd/worker/native); the in-Zen pre-hello
  `/proc` fallback path (unit-tested only: Yama does not gate PTRACE_MODE_READ, so CI cannot make /proc unreadable);
  E1/E2 (never claimed); READY (never).

## Notes for other workstreams
- **Artifact**: linux-perf-build 39362552105 (`cloud/perf-phase2`) is the newest `axiosozo-zen-linux-x86_64`;
  jobs that pick "the newest" get the native receiver compiled in (it is used by default when their chrome JS is this
  branch's; with older chrome JS nothing calls it).
- Hosts and Zen must come from the same tree (`frame_ack.frame_transport` is new; older hosts reject it).
- cef-zen-feel / webkit-feel: presenter canvases may be bound natively (external ImageContainer) or transferred to a
  worker: never call `getContext`/resize on them outside `#draw`; captures go through `captureFixtureFrame()`.
- linux-platform: please keep the one-line `zen-setup.compile-errors.txt` capture in linux-zen-reusable.yml.
- Integration lead: when cloud/integration builds include engine-view/linux, run linux-perf with `zen_run_id` empty.

## Next steps
1. Merge PR #14; rebuild the integration app so every job gets the native receiver.
2. Native receiver: partial texture updates (copy only damage into recycled SharedRGBImages) to cut the 2× whole-frame
   copy; hidden-tab re-present on show.
3. WebKit 2× is now bound by WPE software rendering (~150–200 % CPU): GPU path on real hardware (webkit-feel/host).
4. Re-profile the parent with the engine-profile tooling on the new defaults (remaining: AXCF metadata/events via
   Subprocess, chrome work, software compositing).
