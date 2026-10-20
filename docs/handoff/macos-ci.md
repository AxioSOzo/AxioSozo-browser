Status: DONE

# macos-ci handoff

PR: https://github.com/AxioSOzo/AxioSozo-browser/pull/16 (draft, `cloud/macos-ci` → `cloud/integration`).
The same commits are on the session branch `claude/macos-ci-regression-lane-8xric1`.

## Machine resources
- Cloud session: Ubuntu 24.04 x86_64. It was used for editing, the Linux unit tests, and reading `ci-results` and Actions job logs (GitHub MCP).
- macOS lane: GitHub-hosted `macos-15` arm64. Measured specs: macOS 15.7.9, 3 CPU, 7 GiB RAM, Xcode 16.4, `/usr/bin/python3` 3.9.6.
- Lane timing: base about 13–17 min. Head about 80 min, mostly the pre-existing `./dev check/test` hangs, which are capped at 1500 s and 2400 s.

## What changed
- `.github/workflows/macos-ci.yml` (new). Triggers: push to `cloud/macos-ci` and PRs into `cloud/integration`.
  - Matrix: lane `head` (the branch) and lane `base` (an `origin/dev` worktree).
  - An ubuntu `compare` job publishes `ci-results:cloud_macos-ci/<run>-<attempt>-macos/{head,base,compare.md,compare.json}`, including per-gate logs.
  - The workflow fails only on REGRESSION (passes on dev, fails on head) or on a removed gate.
- `scripts/macos_ci.py` (new) does the gate running, the baseline shim, the comparison and the pinned Node download. See docs/MACOS_CI.md for the gate list.
- macOS CI build root: `AXIOSOZO_MACOS_CI=1` plus an explicit `AXIOSOZO_BUILD_ROOT` gives a plain build directory, with no `dev-external` and no `mount-dev-storage`.
  - Files that honour it: `scripts/storage.py`, `scripts/dev.py`, `native/chromium-host/probe.py`, `packages/provider-host/cli.mjs`, `packages/provider-host/src/storage.mjs`.
  - It is refused unless `GITHUB_ACTIONS=true`, and refused whenever `/Volumes/T9` or `~/.local/bin/{mount-dev-storage,dev-external}` exists. So the owner's Mac takes the unchanged code path.
  - Tests: `tests/test_storage.py` `MacosCiBuildRoot`.
- Fixes the lane found. Both only matter under the CI mode; the owner's Mac is unchanged.
  - `packages/provider-host/tests/sandbox.os.mjs`: the parent-exit fixture child now receives the CI-mode variables.
  - `native/chromium-host/test_probe.py`: HostCheckTests pins `MACOS_CI=False`, because it tests the owner volume policy.
- `upstreams.lock.json` `ci_node.darwin-arm64`: Node 24.14.0, sha256 `448f01d4…541d` from nodejs.org SHASUMS256.
- `.gitignore` now admits `docs/evidence/macos/ci/` only.
- New docs: `docs/MACOS_CI.md`, `docs/evidence/macos/ci/STATUS.md`, plus the compare/summary files.

## Runs and results
- **39361685065**: green, cloud/integration 5f8b1d0 + this lane.
  - Head `a5ddaf8` vs dev `a3ab14e` with the baseline shim: **0 REGRESSION**, 198 OK, 15 FIXED_OR_NEW_PASS, 10 PRE_EXISTING.
- 39354001970: 0 regressions (this run had no baseline shim); WebKit `mac-input` failed.
- 39342043337 and 39342105193: first attempts, used to diagnose the lane itself.
- **39368990603**: verification on the head that merges cloud/integration 436ab0f. Result: see the final note below.
- PR Linux CI 39361865284: success (`./dev check/test` on Linux with these script changes).
- Local checks in this session: `tests/test_storage.py` OK (27 tests), `native/chromium-host/test_probe.py` OK. The full `tests/` run has only the 6 `test_zen_profile` errors that are pre-existing in this root container.

## Verified vs NOT_VERIFIED
- PASS on macOS arm64 runners. This is component evidence only:
  - `./dev doctor` exits 2 (NOT-READY) with no traceback.
  - Rust fmt/clippy/test/build.
  - Every Python script compiles under 3.9.
  - All other unit suites pass.
  - Provider Keychain negative tests and the Seatbelt broker test pass.
  - CEF mac host build and ad hoc signing, plus test-native, stream_test (real OSR) and surface_test (IOSurface engine-surface-v1).
  - WebKit WKWebView scaffold (EXPERIMENTAL).
- NOT_VERIFIED:
  - A macOS Zen build.
  - engine-view XPCOM smoke.
  - `./dev engine-probe` and E1/E2.
  - The owner-only fixtures: T9 keychain, external workstation TMPDIR, release staging.
- Not READY.

## Pre-existing failures on dev (listed, not fixed)
Full table with causes: docs/evidence/macos/ci/STATUS.md.
- Python tests that need the owner's volume:
  - `test_release_preview`
  - `test_understand_fixture_install`
  - project_reader, arrival_lsof and manifest_accept tool tests
- Node tests:
  - `project-reader.integration` and `understand-host-fixture` need an external TMPDIR.
  - `project-runner` hangs because a process-group member survives the stop.
- `./dev check` and `./dev test` therefore time out.

## Blockers
- None for this lane.
- Full macOS Zen build: not attempted.
  - zen.py runs every step through `dev-external` and needs DevStorage.
  - sccache is wired for Linux only.
  - A cold build on 3 CPU / 7 GiB with no cache is unlikely to fit in 6 h.
  - The local steps are in docs/MACOS_CI.md.

## Notes for other workstreams
- webkit-host: the WKWebView scaffold `input` suite is flaky on macOS 15.
  - Run 39354001970 failed with `ValueError: invalid AXCF header`; run 39361685065 passed.
  - Probably a frame or header desync; see `ci-results:cloud_macos-ci/39354001970-1-macos/head/logs/webkit_mac-input.log`.
- chromium-host: `probe.cleanup_group.exists()` can get `PermissionError` from `os.killpg(pid, 0)` on macOS (EPERM for a zombie group). This is a pre-existing race; handling EPERM as "gone" would fix the flaky `test_sigterm_routes_through_owned_cleanup`.
- Every workstream: push to a branch with a PR into `cloud/integration` and macos-ci runs automatically. Read `compare.md` on `ci-results`. A REGRESSION row means macOS behaviour changed.
- `.github/actions/publish-ci-results` uses GNU `cp --parents`, so it fails on macOS runners. Publish from a Linux job, as macos-ci does.

## Next steps
1. Owner, on the Mac: the local verification in docs/MACOS_CI.md ("Full Zen build: not in this lane"): `./dev setup`, `./dev check`, `./dev test`, `./dev engine-probe`, surface_test and the engine-view smoke.
2. Integration lead: merge PR #16 so that every PR into cloud/integration gets the lane.
3. Optional: fix the two pre-existing flakes above in their owning workstreams. Optional: port zen.py's macOS path to the CI build root if a CI Zen build on macOS is wanted (larger runner + sccache).
