# Chromium (CEF) inside the Linux Zen app — evidence

Produced by `.github/workflows/linux-cef-zen.yml` (job `e2e`) on a GitHub-hosted
`ubuntu-24.04` runner: the prebuilt Linux Zen artifact (`axiosozo-zen-linux-x86_64`
of Actions run 39346931130, `cloud/gecko-linux-feel` 6ea1bde; the job takes the newest unexpired one) with this branch's
AxioSozo chrome JS overlaid (TEST-ONLY `chrome-overlay`, see `chrome-overlay.json`;
compiled Gecko code is the artifact's), and the CEF host built in the same job from the
pinned CEF 154.0.23 distribution, Chromium sandbox on (SUID `chrome-sandbox`; AppArmor
blocks unprivileged user namespaces on the runner). Xvfb 1280×800 (2560×1600 for 2×),
no window manager, WebRender software. Full results, logs and every screenshot:
`ci-results:claude_cef-zen-feel-dx16ke/<run>-1-cef-zen-e2e/`.

`39359724324/` — the first green run (all screenshots inspected):

| Folder | Command | Result |
| --- | --- | --- |
| `harness/` | `./dev gui-test --engine chromium --scenario launch,chrome,fixture` | PASS |
| `fixture/` | `scripts/cef_zen_e2e.py --mode fixture` | PASS (E1 via the probe button; E2 host SIGKILL → preserved Gecko document) |
| `web/` | `scripts/cef_zen_e2e.py --mode web` | PASS except BLOCKED: dead keys (Gecko baseline does not compose under Xvfb either) and the address-bar scenarios (known parent crash, cloud/linux-platform) |
| `web-2x/` | `scripts/cef_zen_e2e.py --mode web --scale 2` | PASS |

Per-gate statuses and details: `*/result.json` (`matrix`), summarized in
`docs/CAPABILITY_MATRIX.md` ("Chromium (CEF) inside Zen on Linux").

Notes for reading the PNGs: xwd root captures show context-menu popups black under
this Xvfb/software-WebRender setup for Firefox's own menu too
(`web/10-gecko-context-menu.png`); X11 screenshots never include the mouse pointer
(cursor shapes are asserted on the engine view). `failure-*.png` belong to the
BLOCKED address-bar scenarios.
