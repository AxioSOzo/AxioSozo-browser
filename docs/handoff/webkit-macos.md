Status: PARTIAL

PR: https://github.com/AxioSOzo/AxioSozo-browser/pull/12 (draft, into cloud/integration)
Branch: claude/webkit-macos-host-ud7z1k (the session's designated branch; `cloud/webkit-macos` was not used).

Interim handoff (work in progress). Verified so far:
- Capture bench, macos-15 run 39342162006: offscreen takeSnapshot chosen (see ADR 004 macOS).
- Host run 39342825769: engine-surface-v1 receiver suite 8/8 PASS (real WKWebView IOSurface frames);
  pipe stream scenario passed all steps but failed the profile-removal guard (fixed in fb821fa).
Next: re-run, inspect, ADR 004 macOS section with measurements, final handoff.
