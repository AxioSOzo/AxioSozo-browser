Status: PARTIAL

# macos-ci handoff (in progress)

Branch: `cloud/macos-ci` (same commits on `claude/macos-ci-regression-lane-8xric1`). PR: not yet opened.

## So far
- `.github/workflows/macos-ci.yml`: macos-15 lane on head and on `origin/dev`, compare job on ubuntu publishes
  `ci-results:cloud_macos-ci/<run>-<attempt>-macos/{head,base,compare.md}`.
- `scripts/macos_ci.py`: gate list + compare.
- macOS CI build root: `AXIOSOZO_MACOS_CI=1` + `AXIOSOZO_BUILD_ROOT` (GitHub Actions only, refused when the owner's
  layout exists) in `scripts/storage.py`, `scripts/dev.py`, `native/chromium-host/probe.py`, provider host.
- Runs: 39342043337 / 39342105193 (first attempts; base lane finished in 17 min, results lost to an upload-path bug,
  head lane ran >2 h — timeouts tightened). Current run: see `gh run list -b cloud/macos-ci`.

## Next
Read the compare.md of the newest run, fix regressions, write docs/MACOS_CI.md.
