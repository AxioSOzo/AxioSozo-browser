# macOS CI lane status

Runner: GitHub-hosted `macos-15` arm64 (macOS 15.7.9, 3 CPU, 7 GiB, Xcode 16.4,
`/usr/bin/python3` 3.9.6, Node 24.14.0, Rust 1.94.0). Workflow `.github/workflows/macos-ci.yml`,
lane `scripts/macos_ci.py`, method in [docs/MACOS_CI.md](../../../MACOS_CI.md).
Full per-gate logs: `git show origin/ci-results:cloud_macos-ci/<run>-1-macos/{head,base}/logs/<gate>.log`.

## Reference run: 39361685065 — green

Head `a5ddaf8` (cloud/macos-ci = cloud/integration 5f8b1d0 + this lane) vs base `origin/dev` `a3ab14e`
(with the baseline shim): **0 REGRESSION**, 198 OK, 15 FIXED_OR_NEW_PASS, 10 PRE_EXISTING.
Files: [compare-39361685065.md](compare-39361685065.md), [head](head-39361685065.txt), [base](base-39361685065.txt).
Earlier run 39354001970 (no baseline shim): 0 regressions as well ([compare](compare-39354001970.md)).

PASS on head (selection): `./dev doctor` (exit 2 NOT-READY, no traceback), cargo fmt/clippy/test/build,
every `tests/test_*.py` except the pre-existing ones below, 160+ Node test files, provider host
check/setup/keychain-negative/sandbox (Seatbelt broker), CEF 154 macosarm64 setup (compile + ad hoc
sign, 21 s), check, test-native, test_probe, **stream_test** (real Chromium OSR frames, input, a11y,
heartbeat on the runner) and **surface_test** (engine-surface-v1 Mach/IOSurface: internal/external
begin-frame at 60/120 Hz, zero-copy in-use slot skipping, negative cases), transport_damage/core
units, WebKit core + WKWebView scaffold build, stream, input, security (EXPERIMENTAL scaffold).

Labels: component evidence only. E1/E2 NOT_VERIFIED (no Zen build on runners). Not READY.

## Pre-existing failures (fail identically on dev; not fixed here)

| Gate | Cause (from the logs) |
| --- | --- |
| `python:test_release_preview.py` | stage root must be on external storage under `/Volumes` (owner layout) |
| `python:test_understand_fixture_install.py` | workstation fixture volume/paths (`/Volumes/T9/...`) |
| `python:tools/axiosozo-project-reader/project_reader_test.py` | "tests require the external workstation TMPDIR" |
| `python:tools/axiosozo-arrival/arrival_lsof_test.py` | same external-workstation TMPDIR fixture |
| `python:tools/axiosozo-manifest/manifest_accept_test.py` | `EXTERNAL_WORKSTATION_FIXTURE_VOLUME_REQUIRED` |
| `node:apps/browser/tests/project-reader.integration.test.mjs` | "use external workstation wrapper TMPDIR" |
| `node:apps/browser/tests/understand-host-fixture.test.mjs` | "Fixture temp must stay external" (`/private/var/folders` on runners) |
| `node:apps/browser/tests/project-runner.test.mjs` | "real supervisor … stop ends the whole process group": a group member survives the stop on the runner, then the file never exits (lane timeout 300 s) |
| `dev-check`, `dev-test` | run the suites above, so they hang on project-runner and time out (1500 s / 2400 s); also the owner-only Keychain positive fixture (`scoped to one new private T9 keychain`) |

On dev additionally (fixed by the cloud branches): `lab-today-page.test.mjs`, `provider-host keys.test.mjs`;
`./dev setup --only` does not exist on dev.

## Flaky / to watch

- `webkit:mac-input` (WKWebView scaffold, new in the cloud program): FAIL `ValueError: invalid AXCF header`
  in run 39354001970, PASS in 39361685065. Owner: webkit-host workstream (scaffold is EXPERIMENTAL).
- `cef:test_probe.py test_sigterm_routes_through_owned_cleanup`: `os.killpg(pid, 0)` raised `PermissionError`
  (macOS EPERM for a process group of zombies) on head in runs 39342043337 and 39354001970; passed in
  39361685065 on both sides. `cleanup_group()` is byte-identical on dev, so this is a pre-existing race,
  not a cloud regression; `exists()` only handles `ProcessLookupError`. Not fixed here (unrelated code).
