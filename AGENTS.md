# AxioSozo browser foundation

This repository implements Wout's handoff 1. Zen/Gecko remains the application.
No Electron, external Chromium window, or iframe may count as dual-engine integration.
Never claim READY unless real macOS E1/E2 pass. Preserve TLS, sandboxing, permissions,
profiles, accessibility, extensions, and development tools. No live provider calls
without separate explicit authorization. Never read personal profile data or credentials.

Build with `/Users/wout/.local/bin/dev-external python3 scripts/storage.py exec -- ...`; it uses the
`/Volumes/AxioSozoBuild` volume (`python3 scripts/storage.py setup` mounts it if missing).
Never create a separate build image or detach Dev.sparsebundle.

Workstreams are explicitly authorized: Zen, CEF, providers, and integration/security.
Each owns separate paths; integration lead alone owns root dev, shared contracts,
lockfile, and final status. Do not modify another workstream's paths without coordination.
All claimed evidence must come from actual commands, fixtures, and screenshots.
Never install provider clients, open login UI, start MCP, or execute upstream lifecycle
hooks merely for discovery. Review scripts before execution. No pushes/releases.
