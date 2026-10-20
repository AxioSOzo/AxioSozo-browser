Status: PARTIAL

# Handoff: cef-feel-2 (Chromium tabs inside Zen on Linux, round 2)

PR (draft, into `cloud/integration`): https://github.com/AxioSOzo/AxioSozo-browser/pull/17
Branch: `claude/cef-feel-2-xrbczc` (this session's designated branch; the workflow also
triggers on `cloud/cef-feel-2`).

Work in progress. This file is updated as runs complete; see the final version below
once it says DONE/PARTIAL with run ids.

## What changed so far
- Host (Linux): default font families are fontconfig generics like Gecko's, plus overlay scrollbars.
- Findbar: the active ordinal ("1 of 3"), and Highlight All parity.
- Linux AT-SPI accessibility for Chromium tabs (LinuxAccessibilityMirror).
- `<datalist>` suggestions drawn by Zen (a new `datalist` event and `datalist_query` command).
- New gates: fonts, scrollbars, badge/chip geometry, find parity, downloads, permissions,
  file chooser, certificate error, devtools and AT-SPI.
- linux-cef-zen is pinned to the prebuilt app from run 39362552105.
