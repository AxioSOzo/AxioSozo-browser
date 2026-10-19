Status: PARTIAL

# Handoff: webkit-host (cloud/webkit-host)

PR: https://github.com/AxioSOzo/AxioSozo-browser/pull/2 (draft, into cloud/integration)

Provisional handoff written while the upstream WPE builds (Actions run 39296934153) were still running; see "Next steps".

## Machine resources
- Cloud session: Ubuntu 24.04, 4 vCPU, ~15 GiB RAM. No WPE packages: Ubuntu does not package WPE in noble, plucky, questing or resolute (checked against the archive Packages indexes). Debian and wpewebkit.org are blocked from the session. Local WPE runtime: BLOCKED_ENV. Only the engine-free `probe.py test-native` ran locally (PASS).
- Linux WPE runs: GitHub Actions ubuntu-24.04 (4 vCPU, 16 GiB), pinned `debian:trixie-20261005@sha256:913f6706…` container.

## Verified (Actions run 39297810722, attempts 1 and 2 green)
`probe.py test` PASS on real WPE 2.48.3. Details: docs/evidence/linux/webkit/STATUS.json.

## Next steps
Collect the upstream build results from run 39296934153 (`ci-results:cloud_webkit-host/39296934153-1-build-upstream*`) and record them in ADR 004.
