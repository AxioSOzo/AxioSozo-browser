# AxioSozo browser foundation

This repository implements Wout's handoff 1. Zen/Gecko remains the application.
No Electron, external Chromium window, or iframe may count as dual-engine integration.
Never claim READY unless real macOS E1/E2 pass. Preserve TLS, sandboxing, permissions,
profiles, accessibility, extensions, and development tools. No live provider calls
without separate explicit authorization. Never read personal profile data or credentials.

Before builds run `/Users/wout/.local/bin/mount-dev-storage`; run build commands through
`/Users/wout/.local/bin/dev-external`. Bulky build output, caches and dependencies belong
on external storage in task-specific directories, never internal /tmp or home.
This project's active build volume is `/Volumes/AxioSozoBuild`, backed by
`/Volumes/T9/AxioSozoBuild.sparsebundle`; macOS requires its standard volume mountpoint.
Call the global dev-external helper followed by `scripts/storage.py exec -- ...`
so its TMPDIR/Cargo/cache defaults are overridden into this project's T9-backed volume.
Do not move active data, clean other projects, or detach DevStorage.

Workstreams are explicitly authorized: Zen, CEF, providers, and integration/security.
Each owns separate paths; integration lead alone owns root dev, shared contracts,
lockfile, and final status. Do not modify another workstream's paths without coordination.
All claimed evidence must come from actual commands, fixtures, and screenshots.
Never install provider clients, open login UI, start MCP, or execute upstream lifecycle
hooks merely for discovery. Review scripts before execution. No pushes/releases.
