# ADR 001 — Native Zen foundation with separate engine and provider boundaries

Date: 2026-09-23. Decision: accepted boundaries; experimental Zen/CEF fixture integration.

Zen/Gecko is the application. The pinned source uses its own Surfer/Firefox build
pipeline. AxioSozo contributes a small checksum-guarded source overlay and trusted
chrome modules. The existing browser controls remain responsible for navigation,
certificate warnings, permissions, downloads, developer tools, accessibility,
extensions and session restore. Compact mode uses preferences. No page-wide injected
UI, dashboard, editor, Electron shell, or provider sidebar is introduced.

The root Python entrypoint is build/session orchestration only. The actual coordinator
is a small Rust executable with typed validation, target registry and one-use grants.
Python avoids another build bootstrap dependency on this Mac; it is not a browser
shell or resident service. The provider host preserves a small MIT TypeScript subset
from T3, run with the developer Node runtime. A redistributable embedded runtime has
not been packaged; no global Node daemon is installed.

The implemented coordinator accepts only inherited stdio and a secret delivered on
an additional inherited anonymous pipe. There is no local web control server.
Providers do not get its token. Trusted chrome-to-coordinator attachment is now
implemented and four actual-process pipe tests pass on the project build volume;
ordinary GUI task use remains unverified. No automatic browser control
capability is exposed. A future restricted provider endpoint must allow only
consuming browser-issued grants and must never expose create/grant authority.

Jev is an optional DecisionProvider operating on explicitly supplied synthetic state.
The key belongs in macOS Keychain; a Keychain failure fails closed. Normal discovery
and browser operation do not call Jev. A valid model answer cannot create a browser
target, widen a grant, change identity, or bypass a document-generation check.

CEF is the Chromium candidate. E0 passes as a real component render/input/lifecycle
probe. The actual Zen app now presents real CEF frames/input in its trusted chrome
surface for a strict local fixture, and a manual E2 switch returns to the retained
Gecko tab. E1 remains experimental pending safety/accessibility checks; general
Chromium mode is disabled. See ADR 002 for the tested route and concrete blockers.
No Helium code is imported.

Build output, dependencies and isolated profiles go to the project-only APFS image
mounted at `/Volumes/AxioSozoBuild`, physically backed by T9. The shared DevStorage
image remains mounted and untouched. The source project itself is on exFAT, which
creates AppleDouble files and is unsuitable for some source/build symlinks. Ignore
only `._*` metadata; never clean another checkout or move active data. Only one full
browser build may run at a time, at two jobs on this 16 GiB machine. The project
image has capacity and the pinned Zen build completed successfully.

The custom development bundle id is `nl.axiosozo.browser.dev`. Upstream automatic
updates cannot own this locally patched bundle; the build disables its stock updater.
That is a development safety mechanism with explicit manual security-update ownership
in UPSTREAMS.md, not a production security-maintenance policy. No signed, notarized,
or publicly distributed build is produced by this handoff.

Rejected shortcuts: Chromium source grafted into Gecko, iframe/user-agent spoofing,
external Chrome windows, disabled sandboxes/TLS, full T3 hidden behind a second UI,
Gemini CLI substituted for Antigravity, or claiming provider subscription auth works
merely because an SDK accepts a token. Fixture protocol tests remain labelled fixtures.
