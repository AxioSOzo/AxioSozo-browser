Status: PARTIAL

# Handoff: final-review (in progress)

PR (draft, into cloud/integration): https://github.com/AxioSOzo/AxioSozo-browser/pull/21
Branch: cloud/final-review (from origin/cloud/integration 2065355, which includes cloud/merge-webkit-macos).
Backup mirror: claude/final-review-we7lqq (session branch; no workflow triggers).

## Task 1 — Chromium black frames (root cause found, fixed, gated)
- Reproduction on current integration code with product defaults: none. linux-cef-zen 39426481907
  (app 39383407870) and 39427858985 (the old app 39362552105 that cef-feel-2 used): every frame path
  (native receiver, frame worker, main-thread JS memfd, pipe) PASS, black fraction 0.001, in-app JS
  frame-path self-test PASS.
- Root cause: cef-feel-2's tree predates perf-phase3 c22eb86. In web mode the shared CEF host's adapter
  is constructed in the system-global module instance and the presenter in the window's, so
  `pixels instanceof NativeFrame` was false; the NativeFrame object went into EngineFrameSurface as
  pixels, VideoFrame threw ("imagedata"), and the JS swizzle of an empty array-like wrote alpha-0
  pixels: 100 % black, `nativeReceiver: null` (never bound). c22eb86 uses a Symbol.for brand check.
- Hardening (b483ece): EngineFrameSurface.accept throws INVALID_FRAME_PIXELS for anything but a whole
  BGRA ArrayBuffer (test in engine-frame-surface.test.mjs).
- Pixel-content gates (gui_test.view_pixels: not black, light page, text strokes over >= 3 row bands):
  GUI harness fixture shot (all engines), linux-cef-zen E1 web + fixture, frame-path probe (step 0,
  now part of the verdict), linux-webkit-zen roundtrip + three-engine shots, linux-perf soak (every
  cycle, every engine). TEST-ONLY memfd-off pref removed from the Chromium E2E runs.

## Other work so far
- CI triggers consolidated (push to cloud/integration/dev, PRs into them, path filters kept).
- CI security fixes (env-only artifact JSON, trusted-only app pickers, SHA-pinned actions,
  default permissions); probe.py SUID install atomic; macos_ci.py base-shim CI-only; JS memfd ring check.
- linux-cef-host zen-gui-chromium: pinned app 39383407870 + chrome overlay (was an old app without overlay).
- docs/SECURITY_REVIEW_CLOUD.md written; README rewritten (WIP).

## Runs in flight (PR #21, head b483ece)
`gh api 'repos/AxioSOzo/AxioSozo-browser/actions/runs?branch=cloud/final-review'`; linux-perf-build
39426717780 (fresh app of 560d220; compiled code identical to b483ece).
