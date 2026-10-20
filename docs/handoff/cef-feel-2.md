Status: PARTIAL

# Handoff: cef-feel-2 (Chromium tabs inside Zen on Linux, round 2)

PR (draft, into `cloud/integration`): https://github.com/AxioSOzo/AxioSozo-browser/pull/18
(supersedes #17, whose branch `claude/cef-feel-2-xrbczc` was the first session's).
Branch: `claude/cef-feel-2-xrbczc-rgjgez` (session 2's designated branch; linux-cef-zen
triggers on it, on `claude/cef-feel-2-xrbczc` and on `cloud/cef-feel-2`).

Work in progress. This file is updated after each run; the final version lists every run id.

## Established so far (linux-cef-zen run 39371098391, prebuilt app 39362552105 + chrome overlay)
- Ctrl+L over a Chromium page and over the Gecko baseline: PASS (`ctrl_l_escape`, `ctrl_l_gecko_baseline`).
- Ctrl+T over Chromium and Gecko: PASS (`ctrl_t`). The SWGL crash fix holds.
- Fonts: PASS, identical CSS widths to Gecko for the default (unknown) family, serif,
  sans-serif, monospace, system-ui and ui-monospace.
  - fontconfig: serif→DejaVu Serif, sans→DejaVu Sans, monospace→DejaVu Sans Mono.
  - The host now sets Chromium's default families to the fontconfig generics, as Gecko does.
- Overlay scrollbars: PASS, layout width 0 in both engines (Chromium `OverlayScrollbar,FluentOverlayScrollbar`).
- "Not secure" badge: PASS. It is shown for a plain-HTTP page on the runner's LAN address and
  is inside Zen's address bar, never over the page.
- The fixture probe chip "Return to Gecko" overflowed Zen's 181 px nav bar onto the page by
  119 px. FAIL, fixed by CSS wrap; to be re-verified.
- AT-SPI: Chromium's tree is exposed under the tab (push button "Increment", link "Page 2",
  entry "Type here", as in the Gecko tab).
  - The AT-SPI press raced the mirror rebuild; the harness now retries.
- Find: the first match reads "1 of 3" like Firefox. Find-next stayed at "1 of 3" where
  Firefox shows "2 of 3": FAIL, fix pushed.

## Run 39372285095 (commit 90a79973, before the 3437ae48 fixes)
- Certificate error: Chromium FAILS CLOSED with Zen's panel ("Be careful. Something doesn't
  look right.", NET::ERR_CERT_AUTHORITY_INVALID, Go back / Open in Firefox), screenshot
  37-cert-error-chromium.png inspected. The gate failed only because the harness then waited
  for a feel page on that tab (fixed in session 2), which also cascaded into devtools/to_gecko.
- Popups: `<select>` PASS; the datalist probe threw on PopupAutoComplete.view (fixed).
- Permission: no Zen prompt within 15 s; the view was black (native receiver) so no visual
  clue; diagnostics added.

## Session 2 (claude/cef-feel-2-xrbczc-rgjgez), in progress
- Run 39374652910 (commit 3437ae48): every cef_zen_e2e step captured the Chromium view
  100% black from the first screenshot, also with `native_receiver=false`. Its diagnostics
  show `nativeReceiver: null`, `frameWorker: null`, `frameTransport: memfd`,
  `frameUpload: imagedata`: the native receiver was never active, so the earlier attribution
  to it was wrong. gui_test step 1 (fixture) still shows pixels (`harness/fixture-chromium.png`;
  the probe chip now wraps under the address bar).
- linux-cef-zen step 0 now probes frame-path variants (product default, then TEST-ONLY
  `frame_worker=false`, `memfd_frames=false`, both off) and runs 2-5 use the first variant
  with pixels (`framepath.json`, `verdict.frame_path_probe`).
- Fixes pushed, awaiting a run (commit 781893fb):
  - Permission: the Linux host rejected CEF's requesting origin `http://h:p/` (trailing
    slash), so Chromium denied every request before Zen could ask. Fixed in `core/handlers.inc`.
  - Certificate-error flow in the harness; datalist probe; AT-SPI press retry on a fresh root;
    find-next polls until the ordinal settles.
  - The chip-wrap CSS moved to CEFPresenter's style (browser-experience.css scoping test).
  - Linux prompts say "your computer" (macOS keeps "your Mac").

## Found: Chromium pixels capture black on the native Linux frame receiver (frame path, not this workstream)
- With the product-default native receiver (engine-view/linux, app 39362552105), every
  Chromium screenshot after the first frames is black.
  - This happens in fixture and web mode and at 1× and 2×; input, title and page state keep working.
- The gui_test fixture screenshot taken right after the first frame shows pixels, and so do
  WebKit tabs on the same app.
- Owner: cloud/perf-phase2 (frame path).
- From run 3437ae48 on, the matrix runs use the TEST-ONLY pref
  `axiosozo.engines.linux.native_receiver=false`. A separate informational step 6 measures the
  default path: the black fraction of the view, plus frame-path diagnostics.
