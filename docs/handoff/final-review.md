Status: PARTIAL

# Handoff: final-review (in progress)

PR (draft, into cloud/integration): https://github.com/AxioSOzo/AxioSozo-browser/pull/21
Branch: cloud/final-review (from origin/cloud/integration 2065355, which includes cloud/merge-webkit-macos).

## State
- Task 1 (Chromium memfd black frames): diagnosing. Diagnostic push run linux-cef-zen 39426481907
  (app 39383407870, frame-path probe adds a `js-memfd` variant and an in-app JS frame-path self-test).
- Task 3 (CI triggers): done in 3d… (see git log): every workflow triggers on push to
  cloud/integration/dev and PRs into them, path filters kept.
- Baseline matrix on PR #21 (first head): runs 394267177xx (see `gh run list -b cloud/final-review`).
- Security review: in progress. Docs: not started.
